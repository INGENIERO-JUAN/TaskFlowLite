/**
 * useAuth.ts — Re-exporta el store de autenticación de Zustand.
 *
 * Punto de acceso unificado para toda la app.
 * Reemplaza el Context API anterior.
 *
 * Uso: import { useAuth } from "@/hooks/useAuth";
 */
export { useAuthStore as useAuth } from "../stores/useAuthStore";
export type { AuthUser } from "../stores/useAuthStore";
