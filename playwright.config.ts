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

  // En CI: arranca Vite antes de los tests y lo apaga al terminar
  webServer: process.env.CI
    ? {
        command: "npm run dev",
        url: "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      }
    : undefined,
});
