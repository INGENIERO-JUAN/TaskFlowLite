/**
 * auth.spec.ts — Tests E2E del flujo completo de autenticación.
 *
 * Flujo cubierto (requerimiento obligatorio):
 *  1. Navegación Landing → Login / Register
 *  2. Validación de formularios con errores (campos vacíos, email inválido)
 *  3. Registro exitoso con workspace nuevo
 *  4. Login exitoso tras registro
 *  5. Manipulación de datos en Dashboard (crear tarea)
 *  6. Logout y redirección a /
 */

import { test, expect, type Page } from "@playwright/test";

const password = "Test1234";

/** Completa el formulario de registro incluyendo términos y workspace. */
async function fillRegisterForm(
  page: Page,
  opts: { name: string; email: string; workspaceName: string },
) {
  await page.getByPlaceholder(/juan pérez/i).fill(opts.name);
  await page.getByPlaceholder(/tu@email/i).fill(opts.email);

  const pwdInputs = page.getByPlaceholder("••••••••");
  await pwdInputs.first().fill(password);
  await pwdInputs.nth(1).fill(password);

  await page.getByPlaceholder(/agencia creativa/i).fill(opts.workspaceName);
  await page.getByRole("checkbox", { name: /acepto los/i }).check();
}

async function submitRegister(page: Page) {
  await page.getByRole("button", { name: /crear cuenta gratis/i }).click();
}

/** En desktop el logout está dentro del menú de usuario. */
async function doLogout(page: Page) {
  await page.locator('button[aria-haspopup="true"]').click();
  await page.getByRole("button", { name: /cerrar sesión/i }).click();
}

test.describe("Flujo completo: Landing → Auth → Dashboard → Logout", () => {
  test("Landing page se carga y muestra el CTA principal", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/taskflow/i);
    const ctaButton = page.getByRole("button", { name: /comenzar|registr|demo/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test("Desde Landing se puede navegar a Register", async ({ page }) => {
    await page.goto("/");
    const registerLink = page
      .getByRole("link", { name: /registr/i })
      .or(page.getByRole("button", { name: /comenzar|registr/i }))
      .first();
    await registerLink.click();
    await expect(page).toHaveURL(/register/);
  });

  test("Login muestra errores al enviar formulario vacío", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    const errorMsg = page.getByText(/obligatorio|requerido|email|contraseña/i).first();
    await expect(errorMsg).toBeVisible();
  });

  test("Login muestra error con email inválido", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/tu@empresa|email/i).fill("no-es-un-email");
    await page.getByPlaceholder(/••••|contraseña|password/i).fill("abc");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    const errorMsg = page.getByText(/email válido|correo/i).first();
    await expect(errorMsg).toBeVisible();
  });

  test("Register crea cuenta y redirige al Dashboard", async ({ page }) => {
    const uniqueEmail = `testuser_${Date.now()}@taskflow.test`;

    await page.goto("/register");
    await fillRegisterForm(page, {
      name: "Usuario E2E",
      email: uniqueEmail,
      workspaceName: "Workspace E2E Test",
    });
    await submitRegister(page);

    await page.waitForURL(/dashboard/, { timeout: 20_000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test("Login exitoso con credenciales válidas redirige al Dashboard", async ({ page }) => {
    const regEmail = `login_test_${Date.now()}@taskflow.test`;

    await page.goto("/register");
    await fillRegisterForm(page, {
      name: "Login Test User",
      email: regEmail,
      workspaceName: "WS Login Test",
    });
    await submitRegister(page);
    await page.waitForURL(/dashboard/, { timeout: 20_000 });

    await doLogout(page);
    await page.waitForURL(/login/, { timeout: 10_000 });

    await page.goto("/login");
    await page.getByPlaceholder(/tu@empresa|email/i).fill(regEmail);
    await page.getByPlaceholder(/••••|contraseña/i).fill(password);
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 20_000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test("Dashboard permite crear una nueva tarea", async ({ page }) => {
    const dashEmail = `dash_test_${Date.now()}@taskflow.test`;

    await page.goto("/register");
    await fillRegisterForm(page, {
      name: "Dash Tester",
      email: dashEmail,
      workspaceName: "WS Dashboard Test",
    });
    await submitRegister(page);
    await page.waitForURL(/dashboard/, { timeout: 20_000 });

    const newTaskBtn = page.getByRole("button", { name: /nueva tarea/i });
    await expect(newTaskBtn).toBeVisible();
    await newTaskBtn.click();

    await page.getByPlaceholder(/revisar diseño del dashboard/i).fill("Tarea E2E creada por Playwright");
    await page.getByRole("button", { name: /crear tarea/i }).click();

    await expect(page.getByText(/Tarea E2E creada por Playwright/i)).toBeVisible({ timeout: 5_000 });
  });

  test("Logout redirige fuera del Dashboard", async ({ page }) => {
    const logoutEmail = `logout_test_${Date.now()}@taskflow.test`;

    await page.goto("/register");
    await fillRegisterForm(page, {
      name: "Logout Tester",
      email: logoutEmail,
      workspaceName: "WS Logout Test",
    });
    await submitRegister(page);
    await page.waitForURL(/dashboard/, { timeout: 20_000 });

    await doLogout(page);
    await page.waitForURL(/login/, { timeout: 10_000 });
    await expect(page).not.toHaveURL(/dashboard/);
  });
});
