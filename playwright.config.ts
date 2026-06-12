import { defineConfig, devices } from "@playwright/test";

/**
 * playwright.config.ts — Configuración E2E con Playwright.
 *
 * Flujo cubierto (requerimiento obligatorio):
 *  Landing → Validación de formularios con errores → Register →
 *  Login exitoso → Manipulación de datos en Dashboard → Logout
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Arranca Vite antes de los tests (si no hay uno corriendo ya) y lo apaga al terminar.
  // VITE_API_URL apunta a un host inalcanzable para forzar el modo offline
  // y no depender de la disponibilidad del backend en Render.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      VITE_API_URL: "http://127.0.0.1:9/api",
    },
  },
});
