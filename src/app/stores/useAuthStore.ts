/**
 * useAuthStore.ts — Store de autenticación con Zustand.
 *
 * Reemplaza completamente a AuthContext + useAuthActions.
 * Persiste la sesión en localStorage para sobrevivir F5 (flicker-free).
 *
 * Flujo real con API:
 *  - login()    → POST /auth/login    → guarda token + user
 *  - register() → POST /auth/register → guarda token + user
 *  - logout()   → POST /auth/logout   → limpia sesión
 *
 * Fallback offline (demo):
 *  Si el backend no está disponible, cae a la lógica localStorage original
 *  para que el proyecto funcione en presentación sin backend real.
 */

import { create } from "zustand";
import { apiPost } from "../lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  name: string;
  email: string;
  workspaceCode: string;
  workspaceName: string;
  isWorkspaceOwner: boolean;
  token?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  workspaceAction: "create" | "join";
  workspaceName?: string;
  workspaceCode?: string;
}

interface StoredUser {
  name: string;
  email: string;
  password: string;
  workspaceCode: string;
}

interface Workspace {
  code: string;
  name: string;
  ownerEmail: string;
  members: string[];
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const SESSION_KEY    = "taskflow_user";
const USERS_KEY      = "taskflow_users";
const WORKSPACES_KEY = "taskflow_workspaces";

// ─── Helpers offline ──────────────────────────────────────────────────────────

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function loadWorkspaces(): Record<string, Workspace | undefined> {
  try {
    return JSON.parse(localStorage.getItem(WORKSPACES_KEY) ?? "{}") as Record<string, Workspace | undefined>;
  } catch {
    return {};
  }
}
function saveWorkspaces(ws: Record<string, Workspace | undefined>): void {
  localStorage.setItem(WORKSPACES_KEY, JSON.stringify(ws));
}
function loadUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}
function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Carga sincrónica para hidratación sin parpadeo (flicker-free)
function loadSessionSync(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as AuthUser : null;
  } catch {
    return null;
  }
}

function persistSession(user: AuthUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ─── Offline login/register (fallback si el backend no responde) ──────────────

async function offlineLogin(email: string, password: string): Promise<AuthUser> {
  await new Promise<void>(r => setTimeout(r, 800));
  const users = loadUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!found)                      throw new Error("Usuario no registrado.");
  if (found.password !== password) throw new Error("Contraseña incorrecta.");
  const workspaces = loadWorkspaces();
  const ws = workspaces[found.workspaceCode];
  if (!ws) throw new Error("El workspace de este usuario ya no existe.");
  return {
    name: found.name,
    email: found.email,
    workspaceCode: found.workspaceCode,
    workspaceName: ws.name,
    isWorkspaceOwner: ws.ownerEmail === found.email,
  };
}

async function offlineRegister(data: RegisterData): Promise<AuthUser> {
  await new Promise<void>(r => setTimeout(r, 1000));
  const users = loadUsers();
  if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("Este email ya está registrado. ¿Quieres iniciar sesión?");
  }
  const workspaces = loadWorkspaces();
  let workspaceCode: string;
  let workspaceName: string;

  if (data.workspaceAction === "create") {
    if (!data.workspaceName?.trim()) throw new Error("El nombre del workspace es obligatorio.");
    do { workspaceCode = generateCode(); } while (workspaces[workspaceCode]);
    workspaceName = data.workspaceName.trim();
    workspaces[workspaceCode] = {
      code: workspaceCode,
      name: workspaceName,
      ownerEmail: data.email,
      members: [data.email],
    };
  } else {
    const code = data.workspaceCode?.trim().toUpperCase() ?? "";
    if (!code) throw new Error("Debes ingresar el código del workspace.");
    if (!workspaces[code]) throw new Error(`No existe ningún workspace con el código "${code}".`);
    workspaceCode = code;
    workspaceName = workspaces[code].name;
    workspaces[code].members.push(data.email);
  }

  saveWorkspaces(workspaces);
  saveUsers([...users, {
    name: data.name,
    email: data.email,
    password: data.password,
    workspaceCode,
  }]);
  return {
    name: data.name,
    email: data.email,
    workspaceCode,
    workspaceName,
    isWorkspaceOwner: data.workspaceAction === "create",
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface AuthApiResponse {
  user: AuthUser;
  token: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  /** Intenta login real con API; si falla por red usa modo offline */
  login: (email: string, password: string) => Promise<void>;

  /** Intenta registro real con API; si falla por red usa modo offline */
  register: (data: RegisterData) => Promise<void>;

  logout: () => void;
}

function isNetworkError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : "";
  return (
    msg.includes("Network Error") ||
    msg.includes("timeout") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ERR_")
  );
}

export const useAuthStore = create<AuthState>()((set) => ({
  // ── Hydration sin parpadeo: carga sincrónica desde localStorage ─────────────
  user: loadSessionSync(),
  isAuthenticated: !!loadSessionSync(),
  isLoading: false,

  // ── login ──────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      let sessionUser: AuthUser;
      try {
        const res = await apiPost<AuthApiResponse>("/auth/login", { email, password });
        sessionUser = { ...res.user, token: res.token };
      } catch (apiErr) {
        if (isNetworkError(apiErr)) {
          sessionUser = await offlineLogin(email, password);
        } else {
          throw apiErr;
        }
      }
      persistSession(sessionUser);
      set({ user: sessionUser, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  // ── register ───────────────────────────────────────────────────────────────
  register: async (data) => {
    set({ isLoading: true });
    try {
      let sessionUser: AuthUser;
      try {
        const res = await apiPost<AuthApiResponse>("/auth/register", {
          name:            data.name,
          email:           data.email,
          password:        data.password,
          workspaceAction: data.workspaceAction,
          workspaceName:   data.workspaceName,
          workspaceCode:   data.workspaceCode,
        });
        sessionUser = { ...res.user, token: res.token };
      } catch (apiErr) {
        if (isNetworkError(apiErr)) {
          sessionUser = await offlineRegister(data);
        } else {
          throw apiErr;
        }
      }
      persistSession(sessionUser);
      set({ user: sessionUser, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  // ── logout ─────────────────────────────────────────────────────────────────
  logout: () => {
    clearSession();
    // Fire-and-forget al backend (no bloqueamos UI)
    void apiPost("/auth/logout").catch(() => {
      /* ignore logout API error */
    });
    set({ user: null, isAuthenticated: false });
  },
}));
