/**
 * axios.ts — Instancia base de Axios para TaskFlowLite.
 *
 * Configuración:
 *  - baseURL: apunta al backend (configurable via env variable)
 *  - withCredentials: envía cookies de sesión automáticamente
 *  - Interceptor de request: adjunta el token Bearer desde localStorage si existe
 *  - Interceptor de response: normaliza errores y los relanza como Error estándar
 */

import axios from "axios";

// URL base del backend. En producción se sobreescribe con VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? "https://taskflow-api-demo.onrender.com/api";

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
  (config) => {
    try {
      const raw = localStorage.getItem("taskflow_user");
      if (raw) {
        const user = JSON.parse(raw) as { token?: string };
        if (user.token) {
          config.headers["Authorization"] = `Bearer ${user.token}`;
        }
      }
    } catch {
      // Si falla el parse, continuar sin token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor de RESPONSE ───────────────────────────────────────────────────
// Extrae el mensaje de error del backend y lo relanza como Error estándar.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const serverMessage =
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.message;
      return Promise.reject(new Error(serverMessage));
    }
    return Promise.reject(error);
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
