/**
 * useAuthStore.test.ts — Suite de pruebas para el store de autenticación.
 *
 * Cubre:
 *  - Estado inicial (hidratación desde localStorage)
 *  - login offline (sin backend)
 *  - register offline (sin backend)
 *  - logout (limpieza de sesión)
 *  - Manejo de errores (usuario no encontrado, contraseña incorrecta)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { act } from "@testing-library/react";
import { apiPost } from "../app/lib/axios";

// Mockear apiPost para forzar modo offline en todos los tests
vi.mock("../app/lib/axios", () => ({
  apiPost: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiGet: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiPut: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiDelete: vi.fn().mockRejectedValue(new Error("Network Error")),
}));

describe("useAuthStore — modo offline", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.resetModules();
  });

  it("inicia sin usuario autenticado cuando localStorage está vacío", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("hidrata la sesión desde localStorage si existe", async () => {
    const mockUser = {
      name: "Ana", email: "ana@test.com",
      workspaceCode: "ABC123", workspaceName: "Mi Workspace",
      isWorkspaceOwner: true,
    };
    localStorage.setItem("taskflow_user", JSON.stringify(mockUser));
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    const state = useAuthStore.getState();
    expect(state.user?.email).toBe("ana@test.com");
    expect(state.isAuthenticated).toBe(true);
  });

  it("register crea usuario y workspace correctamente (offline)", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    await act(async () => {
      await useAuthStore.getState().register({
        name: "Carlos",
        email: "carlos@test.com",
        password: "secret123",
        workspaceAction: "create",
        workspaceName: "Equipo Alpha",
      });
    });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe("Carlos");
    expect(state.user?.email).toBe("carlos@test.com");
    expect(state.user?.isWorkspaceOwner).toBe(true);
    expect(localStorage.getItem("taskflow_user")).not.toBeNull();
  });

  it("login exitoso con credenciales correctas (offline)", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    // Primero registrar
    await act(async () => {
      await useAuthStore.getState().register({
        name: "Laura",
        email: "laura@test.com",
        password: "pass456",
        workspaceAction: "create",
        workspaceName: "Workspace Laura",
      });
    });
    // Logout para limpiar estado en memoria
    act(() => { useAuthStore.getState().logout(); });
    // Luego login
    await act(async () => {
      await useAuthStore.getState().login("laura@test.com", "pass456");
    });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe("laura@test.com");
  });

  it("login falla con email no registrado", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    await expect(
      act(async () => {
        await useAuthStore.getState().login("noexiste@test.com", "1234");
      })
    ).rejects.toThrow();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("login falla con contraseña incorrecta", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    await act(async () => {
      await useAuthStore.getState().register({
        name: "Pedro",
        email: "pedro@test.com",
        password: "correcta",
        workspaceAction: "create",
        workspaceName: "WS Pedro",
      });
    });
    act(() => { useAuthStore.getState().logout(); });
    await expect(
      act(async () => {
        await useAuthStore.getState().login("pedro@test.com", "incorrecta");
      })
    ).rejects.toThrow();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("register falla si el email ya está registrado", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    await act(async () => {
      await useAuthStore.getState().register({
        name: "Maria",
        email: "maria@test.com",
        password: "1234",
        workspaceAction: "create",
        workspaceName: "WS Maria",
      });
    });
    // Call register directly (not via act) so rejection propagates to .rejects.toThrow()
    await expect(
      useAuthStore.getState().register({
        name: "Maria Duplicada",
        email: "maria@test.com",
        password: "5678",
        workspaceAction: "create",
        workspaceName: "WS Duplicado",
      })
    ).rejects.toThrow();
  });

  it("logout limpia el estado y localStorage", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    await act(async () => {
      await useAuthStore.getState().register({
        name: "Juan",
        email: "juan@test.com",
        password: "abc",
        workspaceAction: "create",
        workspaceName: "WS Juan",
      });
    });
    act(() => { useAuthStore.getState().logout(); });
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem("taskflow_user")).toBeNull();
  });

  it("login exitoso (online)", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    const mockResponse = {
      user: {
        name: "Ana García",
        email: "ana@test.com",
        workspaceCode: "ABC123",
        workspaceName: "Workspace Ana",
        isWorkspaceOwner: true,
      },
      token: "mock-jwt-token",
    };
    vi.mocked(apiPost).mockResolvedValueOnce(mockResponse);

    await act(async () => {
      await useAuthStore.getState().login("ana@test.com", "password123");
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe("Ana García");
    expect(state.user?.token).toBe("mock-jwt-token");
  });

  it("login falla con error del servidor (online)", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    vi.mocked(apiPost).mockRejectedValueOnce(new Error("Credenciales inválidas"));

    await expect(
      useAuthStore.getState().login("error@test.com", "wrong")
    ).rejects.toThrow("Credenciales inválidas");
  });

  it("register exitoso (online)", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    const mockResponse = {
      user: {
        name: "Pedro Pérez",
        email: "pedro@test.com",
        workspaceCode: "XYZ890",
        workspaceName: "Workspace Pedro",
        isWorkspaceOwner: true,
      },
      token: "mock-jwt-token-register",
    };
    vi.mocked(apiPost).mockResolvedValueOnce(mockResponse);

    await act(async () => {
      await useAuthStore.getState().register({
        name: "Pedro Pérez",
        email: "pedro@test.com",
        password: "password123",
        workspaceAction: "create",
        workspaceName: "Workspace Pedro",
      });
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe("Pedro Pérez");
  });

  it("register falla con error del servidor (online)", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    vi.mocked(apiPost).mockRejectedValueOnce(new Error("Email ya en uso"));

    await expect(
      useAuthStore.getState().register({
        name: "Pedro Pérez",
        email: "pedro@test.com",
        password: "password123",
        workspaceAction: "create",
        workspaceName: "Workspace Pedro",
      })
    ).rejects.toThrow("Email ya en uso");
  });

  it("register se une a un workspace existente (online)", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    const mockResponse = {
      user: {
        name: "Carlos Joiner",
        email: "carlos@test.com",
        workspaceCode: "JOIN123",
        workspaceName: "Workspace Existente",
        isWorkspaceOwner: false,
      },
      token: "mock-jwt-token-join",
    };
    vi.mocked(apiPost).mockResolvedValueOnce(mockResponse);

    await act(async () => {
      await useAuthStore.getState().register({
        name: "Carlos Joiner",
        email: "carlos@test.com",
        password: "password123",
        workspaceAction: "join",
        workspaceCode: "JOIN123",
      });
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.workspaceCode).toBe("JOIN123");
    expect(state.user?.isWorkspaceOwner).toBe(false);
  });

  it("register offline lanza error si falta nombre del workspace en create", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    await expect(
      useAuthStore.getState().register({
        name: "Test",
        email: "test@test.com",
        password: "123",
        workspaceAction: "create",
        workspaceName: "",
      })
    ).rejects.toThrow("El nombre del workspace es obligatorio.");
  });

  it("register offline lanza error si falta código del workspace en join", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    await expect(
      useAuthStore.getState().register({
        name: "Test",
        email: "test@test.com",
        password: "123",
        workspaceAction: "join",
        workspaceCode: "",
      })
    ).rejects.toThrow("Debes ingresar el código del workspace.");
  });

  it("register offline lanza error si el código del workspace no existe en join", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    await expect(
      useAuthStore.getState().register({
        name: "Test",
        email: "test@test.com",
        password: "123",
        workspaceAction: "join",
        workspaceCode: "NONEXISTENT",
      })
    ).rejects.toThrow(/No existe ningún workspace con el código/);
  });

  it("register offline se une a un workspace existente", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    await act(async () => {
      await useAuthStore.getState().register({
        name: "Owner",
        email: "owner@test.com",
        password: "123",
        workspaceAction: "create",
        workspaceName: "Workspace Compartido",
      });
    });
    const state1 = useAuthStore.getState();
    const code = state1.user?.workspaceCode ?? "";
    act(() => { useAuthStore.getState().logout(); });

    await act(async () => {
      await useAuthStore.getState().register({
        name: "Member",
        email: "member@test.com",
        password: "456",
        workspaceAction: "join",
        workspaceCode: code,
      });
    });

    const state2 = useAuthStore.getState();
    expect(state2.isAuthenticated).toBe(true);
    expect(state2.user?.workspaceCode).toBe(code);
    expect(state2.user?.isWorkspaceOwner).toBe(false);
  });

  it("useAuthStore helper catch blocks manejan localStorage bloqueado", async () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Blocked");
    });
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    
    await expect(
      useAuthStore.getState().register({
        name: "Test",
        email: "test@test.com",
        password: "123",
        workspaceAction: "create",
        workspaceName: "Test WS",
      })
    ).rejects.toThrow();

    spy.mockRestore();
  });
});
