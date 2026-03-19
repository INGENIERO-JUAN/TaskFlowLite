/**
 * useAuthActions — Lógica de login, register y logout extraída del AuthContext.
 *
 * Responsabilidades:
 * - Encapsula la lógica de autenticación (login, register, logout)
 * - Gestiona el estado del usuario y su persistencia en localStorage
 * - Expone funciones listas para ser consumidas por AuthProvider
 *
 * Uso interno: consumido por AuthProvider en AuthContext.tsx
 * Uso externo: los componentes siguen usando useAuth() como siempre
 */

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  name: string;
  email: string;
  company?: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  company?: string;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const SESSION_KEY = "taskflow_user";  // usuario logueado activo (sin password)
const USERS_KEY   = "taskflow_users"; // "base de datos" local (con password)

// ─── Storage helpers (privados a este módulo) ─────────────────────────────────

function persistSession(user: AuthUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
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

  /**
   * login — Valida credenciales contra localStorage.
   * Lanza un Error con mensaje legible si el email no existe
   * o la contraseña no coincide.
   */
  const login = useCallback(async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const users = loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!found) {
      throw new Error("Usuario no registrado.");
    }
    if (found.password !== password) {
      throw new Error("Contraseña incorrecta.");
    }

    const sessionUser: AuthUser = {
      name: found.name,
      email: found.email,
      company: found.company,
    };

    persistSession(sessionUser);
    setUser(sessionUser);
  }, []);

  /**
   * register — Crea un usuario nuevo.
   * Impide emails duplicados e inicia sesión automáticamente.
   */
  const register = useCallback(async (data: RegisterData) => {
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const users = loadUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (exists) {
      throw new Error(
        "Este email ya está registrado. ¿Quieres iniciar sesión?"
      );
    }

    const newUser: StoredUser = { ...data };
    saveUsers([...users, newUser]);

    const sessionUser: AuthUser = {
      name: newUser.name,
      email: newUser.email,
      company: newUser.company,
    };

    persistSession(sessionUser);
    setUser(sessionUser);
  }, []);

  /**
   * logout — Limpia la sesión de localStorage y resetea el estado local.
   */
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return { user, login, register, logout };
}
