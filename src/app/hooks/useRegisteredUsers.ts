/**
 * useRegisteredUsers — Lee los miembros del workspace activo del usuario.
 * Solo devuelve usuarios que pertenecen al mismo workspace,
 * no todos los usuarios del sistema.
 */
import { loadSession } from "./useAuthActions";

export interface RegisteredUser {
  name: string;
  email: string;
}

export function useRegisteredUsers(): RegisteredUser[] {
  try {
    const session = loadSession();
    if (!session?.workspaceCode) return [];

    // Leer workspaces
    const wsRaw = localStorage.getItem("taskflow_workspaces");
    if (!wsRaw) return [];
    const workspaces = JSON.parse(wsRaw);
    const ws = workspaces[session.workspaceCode];
    if (!ws) return [];

    // Leer usuarios y filtrar solo los del workspace
    const usersRaw = localStorage.getItem("taskflow_users");
    if (!usersRaw) return [];
    const users: any[] = JSON.parse(usersRaw);

    return users
      .filter(u => ws.members.includes(u.email))
      .map(u => ({ name: u.name, email: u.email }));
  } catch {
    return [];
  }
}
