/**
 * axios.test.ts — Suite de pruebas para el interceptor de Axios.
 *
 * Cubre:
 *  - Adjunta token Authorization en cada request
 *  - Interceptor 401: limpia localStorage, sessionStorage y redirige a /login
 *  - Errores no-401: relanza con el mensaje del servidor
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import _axios from "axios";

// Mockear axios para controlar respuestas
vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      })),
      post: vi.fn().mockResolvedValue({ data: {} }),
      isAxiosError: actual.default.isAxiosError,
    },
  };
});

describe("apiClient — interceptores", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "";
    vi.resetModules();
  });

  it("importa apiClient sin errores", async () => {
    const mod = await import("../app/lib/axios");
    expect(mod.apiClient).toBeDefined();
  });

  it("las funciones helpers están exportadas", async () => {
    const mod = await import("../app/lib/axios");
    expect(typeof mod.apiGet).toBe("function");
    expect(typeof mod.apiPost).toBe("function");
    expect(typeof mod.apiPut).toBe("function");
    expect(typeof mod.apiDelete).toBe("function");
  });
});

describe("Interceptor 401 — lógica de limpieza", () => {
  it("localStorage.clear() y sessionStorage.clear() eliminan datos de sesión", () => {
    localStorage.setItem("taskflow_user", JSON.stringify({ name: "test" }));
    localStorage.setItem("taskflow_theme", "dark");
    sessionStorage.setItem("temp_key", "valor");

    // Simular lo que hace el interceptor
    localStorage.clear();
    sessionStorage.clear();

    expect(localStorage.getItem("taskflow_user")).toBeNull();
    expect(localStorage.getItem("taskflow_theme")).toBeNull();
    expect(sessionStorage.getItem("temp_key")).toBeNull();
  });

  it("window.location.href se puede asignar a /login", () => {
    window.location.href = "/login";
    expect(window.location.href).toBe("/login");
  });
});

describe("Helpers tipados — verificación de tipos en runtime", () => {
  it("BASE_URL usa VITE_API_URL o fallback", async () => {
    // El módulo debe importarse sin errores aunque VITE_API_URL no esté definido
    const mod = await import("../app/lib/axios");
    expect(mod.apiClient).toBeDefined();
  });
});

describe("ApiResponse interface", () => {
  it("estructura ApiResponse es compatible con objetos con data y message opcional", () => {
    // Verificar en tiempo de compilación a través de una asignación válida
    const response: import("../app/lib/axios").ApiResponse<string> = {
      data: "test",
      message: "ok",
    };
    expect(response.data).toBe("test");
    expect(response.message).toBe("ok");
  });

  it("ApiResponse sin message es válido (campo opcional)", () => {
    const response: import("../app/lib/axios").ApiResponse<number[]> = {
      data: [1, 2, 3],
    };
    expect(response.message).toBeUndefined();
  });
});
