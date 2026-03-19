/**
 * AuthContext — Proveedor global de autenticación para TaskFlow Lite.
 *
 * Este contexto ahora es solo responsable de:
 * - Crear y exponer el contexto de autenticación
 * - Delegar toda la lógica de login/register/logout a useAuthActions
 *
 * La lógica de negocio (validaciones, localStorage, estado) vive en:
 * → src/app/hooks/useAuthActions.ts
 */

import React, { createContext, useContext, ReactNode } from "react";
import { useAuthActions } from "../hooks/useAuthActions";
import type { AuthUser, RegisterData } from "../hooks/useAuthActions";

// ─── Re-exportamos AuthUser para que los consumidores no cambien sus imports ──

export type { AuthUser };

// ─── Context type ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, login, register, logout } = useAuthActions();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
