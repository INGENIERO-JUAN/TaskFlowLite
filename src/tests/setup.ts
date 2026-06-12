/**
 * setup.ts — Configuración global para Vitest + Testing Library.
 *
 * - Extiende los matchers de Jest/Vitest con @testing-library/jest-dom
 * - Limpia el DOM y mocks después de cada test
 * - Mockea window.matchMedia (no disponible en jsdom)
 * - Mockea localStorage y sessionStorage
 */

import "@testing-library/jest-dom";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// ── Cleanup automático después de cada test ───────────────────────────────────
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// ── Mock de window.matchMedia (jsdom no lo implementa) ────────────────────────
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── Mock de window.location (para el interceptor 401) ────────────────────────
Object.defineProperty(window, "location", {
  writable: true,
  value: { href: "" },
});

// ── Silenciar errores de consola esperados en tests ───────────────────────────
beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, "error").mockImplementation(() => {});
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
