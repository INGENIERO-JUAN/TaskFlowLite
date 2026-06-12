/**
 * useThemeStore.test.ts — Suite de pruebas para el store de tema.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { useThemeStore } from "../app/stores/useThemeStore";

describe("useThemeStore", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    // Resetear a estado light antes de cada test
    act(() => { useThemeStore.getState().setTheme("light"); });
  });

  it("inicia con algún tema válido (light o dark)", () => {
    const state = useThemeStore.getState();
    expect(["light", "dark"]).toContain(state.theme);
    expect(typeof state.isDark).toBe("boolean");
  });

  it("toggleTheme cambia de light a dark", () => {
    act(() => { useThemeStore.getState().setTheme("light"); });
    act(() => { useThemeStore.getState().toggleTheme(); });
    const state = useThemeStore.getState();
    expect(state.theme).toBe("dark");
    expect(state.isDark).toBe(true);
  });

  it("toggleTheme cambia de dark a light", () => {
    act(() => { useThemeStore.getState().setTheme("dark"); });
    act(() => { useThemeStore.getState().toggleTheme(); });
    const state = useThemeStore.getState();
    expect(state.theme).toBe("light");
    expect(state.isDark).toBe(false);
  });

  it("setTheme('dark') persiste en localStorage", () => {
    act(() => { useThemeStore.getState().setTheme("dark"); });
    expect(localStorage.getItem("taskflow_theme")).toBe("dark");
  });

  it("setTheme('light') persiste en localStorage", () => {
    act(() => { useThemeStore.getState().setTheme("light"); });
    expect(localStorage.getItem("taskflow_theme")).toBe("light");
  });

  it("setTheme('dark') agrega la clase dark en <html>", () => {
    act(() => { useThemeStore.getState().setTheme("dark"); });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("setTheme('light') elimina la clase dark de <html>", () => {
    document.documentElement.classList.add("dark");
    act(() => { useThemeStore.getState().setTheme("light"); });
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("isDark es true cuando theme es 'dark'", () => {
    act(() => { useThemeStore.getState().setTheme("dark"); });
    expect(useThemeStore.getState().isDark).toBe(true);
  });

  it("isDark es false cuando theme es 'light'", () => {
    act(() => { useThemeStore.getState().setTheme("light"); });
    expect(useThemeStore.getState().isDark).toBe(false);
  });
});
