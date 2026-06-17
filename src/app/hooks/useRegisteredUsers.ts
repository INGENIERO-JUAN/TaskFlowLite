/**
 * useRegisteredUsers — Obtiene los miembros del workspace activo.
 *
 * Estrategia:
 *  1. Intenta obtenerlos desde el backend (GET /workspace/members?code=XXXX)
 *  2. Si falla por red (modo offline), cae al fallback de localStorage
 *     para mantener compatibilidad con el modo demo.
 */
import { useState, useEffect } from "react";
import { apiGet } from "../lib/axios";
import { useAuth } from "./useAuth";

export interface RegisteredUser {
  name: string;
  email: string;
}

// ─── Fallback offline ─────────────────────────────────────────────────────────

interface StoredUser {
  name: string;
  email: string;
  workspaceCode: string;
  password: string;
}

interface WorkspaceRecord {
  code: string;
  name: string;
  ownerEmail: string;
  members: string[];
}

function loadMembersOffline(workspaceCode: string): RegisteredUser[] {
  try {
    const wsRaw = localStorage.getItem("taskflow_workspaces");
    if (!wsRaw) return [];
    const workspaces = JSON.parse(wsRaw) as Record<string, WorkspaceRecord>;
    const ws = workspaces[workspaceCode];
    if (ws === undefined) return [];

    const usersRaw = localStorage.getItem("taskflow_users");
    if (!usersRaw) return [];
    const users = JSON.parse(usersRaw) as StoredUser[];

    return users
      .filter(u => ws.members.includes(u.email))
      .map(u => ({ name: u.name, email: u.email }));
  } catch {
    return [];
  }
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useRegisteredUsers(): RegisteredUser[] {
  const { user } = useAuth();
  const [members, setMembers] = useState<RegisteredUser[]>([]);

  useEffect(() => {
    const code = user?.workspaceCode;
    if (!code) return;

    let cancelled = false;

    async function fetchMembers() {
      try {
        const data = await apiGet<RegisteredUser[]>(
          `/workspace/members?code=${String(code)}`
        );
        if (!cancelled) setMembers(data);
      } catch {
        // Falló la API (red o backend caído) → usar localStorage
        if (!cancelled) setMembers(loadMembersOffline(String(code)));
      }
    }

    void fetchMembers();
    return () => { cancelled = true; };
  }, [user?.workspaceCode]);

  return members;
}
