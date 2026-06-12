/**
 * axios.ts — Instancia base de Axios para TaskFlowLite.
 *
 * Configuración:
 *  - baseURL: apunta al backend (configurable via VITE_API_URL)
 *  - withCredentials: envía cookies de sesión automáticamente
 *  - Interceptor de request: adjunta el token Bearer desde localStorage
 *  - Interceptor de response (401): triple purga síncrona + redirect a /login
 */

import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

// URL base del backend. En producción se sobreescribe con VITE_API_URL.
const BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "https://taskflow-api-demo.onrender.com/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Interceptor de REQUEST ────────────────────────────────────────────────────
// Adjunta el token de autenticación si está disponible en localStorage.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const raw = localStorage.getItem("taskflow_user");
      if (raw) {
        const user = JSON.parse(raw) as { token?: string };
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch {
      // Si falla el parse, continuar sin token
    }
    return config;
  },
  (error: unknown) => Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

// ── Interceptor de RESPONSE — manejo de 401 Unauthorized ─────────────────────
// Cuando el servidor devuelve 401 (sesión expirada o inválida):
//  1. Notifica silenciosamente al backend para destruir la cookie de sesión
//  2. Limpia TODO el almacenamiento persistente del cliente
//  3. Fuerza redirección a /login reiniciando el estado de la app en RAM
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Paso 1 — Destruir cookie de sesión en el backend (fire-and-forget)
      try {
        await axios.post(
          `${BASE_URL}/auth/logout`,
          {},
          { withCredentials: true }
        );
      } catch {
        // Ignorar errores del logout — la sesión ya está inválida
      }

      // Paso 2 — Purga completa del almacenamiento del cliente
      localStorage.clear();
      sessionStorage.clear();

      // Paso 3 — Redirección forzada que vacía el estado en RAM (React + Zustand)
      // Usar window.location.href en lugar de navigate() para forzar recarga completa
      // y garantizar que el Store de Zustand se reinicie a cero
      window.location.href = "/login";

      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }

    // Para otros errores: extraer mensaje del backend y relanzar
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as Record<string, unknown> | undefined;
      const serverMessage =
        (data?.message as string | undefined) ??
        (data?.error as string | undefined) ??
        error.message;
      return Promise.reject(new Error(serverMessage));
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

// ── Helpers tipados ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** GET tipado */
export async function apiGet<T>(url: string): Promise<T> {
  const res = await apiClient.get<T>(url);
  return res.data;
}

/** POST tipado */
export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.post<T>(url, body);
  return res.data;
}

/** PUT tipado */
export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.put<T>(url, body);
  return res.data;
}

/** DELETE tipado */
export async function apiDelete<T>(url: string): Promise<T> {
  const res = await apiClient.delete<T>(url);
  return res.data;
}
