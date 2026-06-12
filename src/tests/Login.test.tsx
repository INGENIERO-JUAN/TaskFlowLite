import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { Login } from "../app/pages/Login";

vi.mock("../app/lib/axios", () => ({
  apiPost: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiGet: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiPut: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiDelete: vi.fn().mockRejectedValue(new Error("Network Error")),
}));

const navigateMock = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("Login page", () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockClear();
  });

  it("renderiza el formulario de login", () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tu@empresa/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
  });

  it("muestra errores de validación con formulario vacío", async () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const submit = screen.getByRole("button", { name: /iniciar sesión/i });
    await userEvent.click(submit);
    await waitFor(() => {
      expect(screen.getByText(/el email es obligatorio/i)).toBeInTheDocument();
    });
  });

  it("muestra error con email inválido", async () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    await userEvent.type(screen.getByPlaceholderText(/tu@empresa/i), "no-es-email");
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), "123456");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText(/introduce un email válido/i)).toBeInTheDocument();
    });
  });

  it("login exitoso (offline) redirige al dashboard", async () => {
    const { useAuthStore } = await import("../app/stores/useAuthStore");
    await useAuthStore.getState().register({
      name: "Login User",
      email: "loginuser@test.com",
      password: "secret123",
      workspaceAction: "create",
      workspaceName: "WS Login",
    });
    useAuthStore.getState().logout();

    render(<MemoryRouter><Login /></MemoryRouter>);
    await userEvent.type(screen.getByPlaceholderText(/tu@empresa/i), "loginuser@test.com");
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/dashboard");
    }, { timeout: 5000 });
  });

  it("toggle de mostrar/ocultar contraseña cambia el type del input", async () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const passwordInput = screen.getByPlaceholderText(/••••••••/);
    expect((passwordInput as HTMLInputElement).type).toBe("password");
    const toggleBtn = screen.getByLabelText(/mostrar contraseña/i);
    await userEvent.click(toggleBtn);
    expect((passwordInput as HTMLInputElement).type).toBe("text");
    // Volver a ocultar
    await userEvent.click(screen.getByLabelText(/ocultar contraseña/i));
    expect((passwordInput as HTMLInputElement).type).toBe("password");
  });

  it("tiene un link para ir a registro", () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const link = screen.getByRole("link", { name: /crear cuenta gratis/i });
    expect(link).toHaveAttribute("href", "/register");
  });

  // ── Branch faltante: error de root cuando credenciales son incorrectas ──────

  it("muestra banner de error cuando las credenciales son incorrectas", async () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    // Email no registrado → error de autenticación
    await userEvent.type(screen.getByPlaceholderText(/tu@empresa/i), "noexiste@test.com");
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), "wrongpass123");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    await waitFor(() => {
      // El banner rojo de error de root debe aparecer
      expect(screen.getByText(/no registrado|credenciales|incorrecto/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("muestra error de contraseña mínimo 6 caracteres", async () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    await userEvent.type(screen.getByPlaceholderText(/tu@empresa/i), "test@test.com");
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), "abc");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText(/mínimo 6 caracteres/i)).toBeInTheDocument();
    });
  });
});
