import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { Register } from "../app/pages/Register";

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

describe("Register page", () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockClear();
  });

  it("renderiza el formulario de registro", () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: /crear cuenta gratis/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/juan pérez/i)).toBeInTheDocument();
  });

  it("muestra errores de validación con formulario vacío", async () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    await userEvent.click(screen.getByRole("button", { name: /crear cuenta gratis/i }));
    await waitFor(() => {
      expect(screen.getByText(/mínimo 2 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/debes aceptar los términos/i)).toBeInTheDocument();
    });
  });

  it("muestra error si las contraseñas no coinciden", async () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    await userEvent.type(screen.getByPlaceholderText(/juan pérez/i), "Test User");
    await userEvent.type(screen.getByPlaceholderText(/tu@email.com/i), "test@test.com");
    const pwdInputs = screen.getAllByPlaceholderText("••••••••");
    await userEvent.type(pwdInputs[0], "password123");
    await userEvent.type(pwdInputs[1], "different123");
    await userEvent.click(screen.getByRole("checkbox", { name: /acepto los/i }));
    await userEvent.click(screen.getByRole("button", { name: /crear cuenta gratis/i }));
    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    });
  });

  it("muestra indicador de fuerza de contraseña al escribir", async () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    const pwdInputs = screen.getAllByPlaceholderText("••••••••");
    await userEvent.type(pwdInputs[0], "Abc12345!");
    await waitFor(() => {
      expect(screen.getByText(/excelente|buena|regular|débil/i)).toBeInTheDocument();
    });
  });

  it("permite alternar entre crear workspace y unirse a uno", async () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/agencia creativa/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /unirme a uno/i }));
    expect(screen.getByPlaceholderText(/ej: abc123/i)).toBeInTheDocument();
  });

  it("registro exitoso (offline) redirige al dashboard", async () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    await userEvent.type(screen.getByPlaceholderText(/juan pérez/i), "Nuevo Usuario");
    await userEvent.type(screen.getByPlaceholderText(/tu@email.com/i), "nuevo@test.com");
    const pwdInputs = screen.getAllByPlaceholderText("••••••••");
    await userEvent.type(pwdInputs[0], "password123");
    await userEvent.type(pwdInputs[1], "password123");
    await userEvent.type(screen.getByPlaceholderText(/agencia creativa/i), "Mi Workspace");
    await userEvent.click(screen.getByRole("checkbox", { name: /acepto los/i }));
    await userEvent.click(screen.getByRole("button", { name: /crear cuenta gratis/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/dashboard");
    }, { timeout: 5000 });
  });

  it("tiene un link para ir a login", () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    const link = screen.getByRole("link", { name: /iniciar sesión/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});
