/**
 * useAuthActions — Lógica de autenticación con soporte de Workspaces.
 *
 * Workspaces:
 * - Al registrarse el usuario elige: crear workspace nuevo o unirse a uno existente.
 * - Cada workspace tiene un código único de 6 caracteres (ej: "ABC123").
 * - Las tareas viven en tasks_workspace_CODIGO — compartidas entre miembros.
 * - El usuario lleva su workspaceCode en la sesión activa.
 *
 * Storage:
 *   taskflow_users   → todos los usuarios registrados
 *   taskflow_user    → sesión activa (incluye workspaceCode)
 *   workspaces       → { CODIGO: { name, ownerEmail, members: [email] } }
 */

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  name: string;
  email: string;
  workspaceCode: string;
  workspaceName: string;
  isWorkspaceOwner: boolean;
}

interface StoredUser {
  name: string;
  email: string;
  password: string;
  workspaceCode: string;
}

export interface Workspace {
  code: string;
  name: string;
  ownerEmail: string;
  members: string[]; // emails
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  workspaceAction: "create" | "join";
  workspaceName?: string;   // si crea workspace
  workspaceCode?: string;   // si se une a workspace
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const SESSION_KEY    = "taskflow_user";
const USERS_KEY      = "taskflow_users";
const WORKSPACES_KEY = "taskflow_workspaces";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function loadWorkspaces(): Record<string, Workspace> {
  try {
    const raw = localStorage.getItem(WORKSPACES_KEY);
    return raw ? JSON.parse(raw) as Record<string, Workspace> : {};
  } catch {
    return {};
  }
}

function saveWorkspaces(ws: Record<string, Workspace>): void {
  localStorage.setItem(WORKSPACES_KEY, JSON.stringify(ws));
}

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) as StoredUser[] : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function persistSession(user: AuthUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as AuthUser : null;
  } catch {
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseAuthActionsReturn {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export function useAuthActions(): UseAuthActionsReturn {
  const [user, setUser] = useState<AuthUser | null>(loadSession);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise<void>(r => setTimeout(r, 900));

    const users = loadUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found)                      throw new Error("Usuario no registrado.");
    if (found.password !== password) throw new Error("Contraseña incorrecta.");

    const workspaces = loadWorkspaces();
    const ws = workspaces[found.workspaceCode];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!ws) throw new Error("El workspace de este usuario ya no existe.");

    const sessionUser: AuthUser = {
      name: found.name,
      email: found.email,
      workspaceCode: found.workspaceCode,
      workspaceName: ws.name,
      isWorkspaceOwner: ws.ownerEmail === found.email,
    };

    persistSession(sessionUser);
    setUser(sessionUser);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await new Promise<void>(r => setTimeout(r, 1100));

    const users = loadUsers();
    const exists = users.some(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) throw new Error("Este email ya está registrado. ¿Quieres iniciar sesión?");

    const workspaces = loadWorkspaces();
    let workspaceCode: string;
    let workspaceName: string;

    if (data.workspaceAction === "create") {
      if (!data.workspaceName?.trim()) throw new Error("El nombre del workspace es obligatorio.");
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!workspaces[code]) throw new Error(`No existe ningún workspace con el código "${code}".`);
      workspaceCode = code;
      workspaceName = workspaces[code].name;
      workspaces[code].members.push(data.email);
    }

    saveWorkspaces(workspaces);

    const newUser: StoredUser = {
      name: data.name,
      email: data.email,
      password: data.password,
      workspaceCode,
    };
    saveUsers([...users, newUser]);

    const sessionUser: AuthUser = {
      name: data.name,
      email: data.email,
      workspaceCode,
      workspaceName,
      isWorkspaceOwner: data.workspaceAction === "create",
    };

    persistSession(sessionUser);
    setUser(sessionUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return { user, login, register, logout };
}
