/**
 * Re-exporta el hook useAuth desde AuthContext para mantener
 * la separación de responsabilidades por carpetas.
 *
 * Uso: import { useAuth } from "@/hooks/useAuth";
 */
export { useAuth } from "../context/AuthContext";
export type { AuthUser } from "../context/AuthContext";
