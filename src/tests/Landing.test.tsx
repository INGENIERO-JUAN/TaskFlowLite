import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { Landing } from "../app/pages/Landing";

vi.mock("../app/lib/axios", () => ({
  apiPost: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiGet: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiPut: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiDelete: vi.fn().mockRejectedValue(new Error("Network Error")),
}));

// Mock Navbar para aislar la página
vi.mock("../app/components/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

// Mock ImageWithFallback para evitar fetch de imágenes en jsdom
vi.mock("../app/components/figma/ImageWithFallback", () => ({
  ImageWithFallback: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const navigateMock = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return { ...actual, useNavigate: () => navigateMock };
});

describe("Landing page", () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockClear();
  });

  it("renderiza el hero, features y footer", () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    expect(screen.getByText(/claridad total/i)).toBeInTheDocument();
    expect(screen.getByText(/Todo lo que necesita tu equipo/i)).toBeInTheDocument();
    expect(screen.getByText(/TaskFlow Lite\. Todos los derechos reservados/i)).toBeInTheDocument();
  });

  it("el botón 'Comenzar gratis' (hero) navega a /register", async () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    const btn = screen.getAllByRole("button", { name: /comenzar gratis/i })[0];
    await userEvent.click(btn);
    expect(navigateMock).toHaveBeenCalledWith("/register");
  });

  it("el botón 'Ver demo' navega a /login", async () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    const btn = screen.getByRole("button", { name: /ver demo/i });
    await userEvent.click(btn);
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("muestra los testimonios", () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    expect(screen.getByText(/Ana García/i)).toBeInTheDocument();
    expect(screen.getByText(/Carlos Mendez/i)).toBeInTheDocument();
  });

  it("el botón 'Crear cuenta gratuita' (how-it-works) navega a /register", async () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    const btn = screen.getByRole("button", { name: /crear cuenta gratuita/i });
    await userEvent.click(btn);
    expect(navigateMock).toHaveBeenCalledWith("/register");
  });

  it("el botón 'Comenzar 14 días gratis' (CTA) navega a /register", async () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    const btn = screen.getByRole("button", { name: /comenzar 14 días gratis/i });
    await userEvent.click(btn);
    expect(navigateMock).toHaveBeenCalledWith("/register");
  });

  it("el botón 'Ya tengo cuenta' (CTA) navega a /login", async () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    const btn = screen.getByRole("button", { name: /ya tengo cuenta/i });
    await userEvent.click(btn);
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("muestra la sección de steps (cómo funciona)", () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    expect(screen.getByText(/Crea tu espacio de trabajo/i)).toBeInTheDocument();
    expect(screen.getByText(/Agrega tu equipo/i)).toBeInTheDocument();
    expect(screen.getByText(/Empieza a producir/i)).toBeInTheDocument();
  });

  it("muestra las estadísticas del banner azul", () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    expect(screen.getByText(/Uptime Garantizado/i)).toBeInTheDocument();
  });
});
