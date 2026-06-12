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

import { test, expect } from "@playwright/test";

// Generamos un email único por ejecución para evitar colisiones
const uniqueEmail = `testuser_${Date.now()}@taskflow.test`;
const password = "Test1234";
const name = "Usuario E2E";
const workspaceName = "Workspace E2E Test";

test.describe("Flujo completo: Landing → Auth → Dashboard → Logout", () => {
  // ── 1. Landing carga correctamente ────────────────────────────────────────
  test("Landing page se carga y muestra el CTA principal", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/taskflow/i);
    // Verificar que existe algún botón de acción principal
    const ctaButton = page.getByRole("button", { name: /comenzar|registr|demo/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  // ── 2. Navegación Landing → Register ────────────────────────────────────
  test("Desde Landing se puede navegar a Register", async ({ page }) => {
    await page.goto("/");
    // Buscar enlace/botón que lleve a register
    const registerLink = page
      .getByRole("link", { name: /registr/i })
      .or(page.getByRole("button", { name: /comenzar|registr/i }))
      .first();
    await registerLink.click();
    await expect(page).toHaveURL(/register/);
  });

  // ── 3. Validación de formulario de Login con errores ──────────────────────
  test("Login muestra errores al enviar formulario vacío", async ({ page }) => {
    await page.goto("/login");
    // Intentar submit sin completar nada
    const submitBtn = page.getByRole("button", { name: /iniciar sesión/i });
    await submitBtn.click();
    // Debe aparecer al menos un mensaje de error
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

  // ── 4. Register exitoso ──────────────────────────────────────────────────
  test("Register crea cuenta y redirige al Dashboard", async ({ page }) => {
    await page.goto("/register");

    // Completar formulario de registro
    // Nombre
    const nameInput = page.getByLabel(/nombre/i).or(page.getByPlaceholder(/nombre/i)).first();
    await nameInput.fill(name);

    // Email
    const emailInput = page.getByLabel(/email|correo/i).or(page.getByPlaceholder(/email|correo/i)).first();
    await emailInput.fill(uniqueEmail);

    // Contraseña
    const passwordInputs = page.getByLabel(/contraseña/i).or(page.getByPlaceholder(/••••|contraseña/i));
    await passwordInputs.first().fill(password);

    // Confirmar contraseña (si existe el campo)
    if (await passwordInputs.count() > 1) {
      await passwordInputs.nth(1).fill(password);
    }

    // Workspace
    const workspaceNameInput = page
      .getByLabel(/nombre del workspace|workspace/i)
      .or(page.getByPlaceholder(/workspace|nombre del espacio/i))
      .first();
    if (await workspaceNameInput.isVisible()) {
      await workspaceNameInput.fill(workspaceName);
    }

    // Submit
    await page.getByRole("button", { name: /crear|registrar|continuar/i }).first().click();

    // Esperar redirección al dashboard
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  // ── 5. Login exitoso ─────────────────────────────────────────────────────
  test("Login exitoso con credenciales válidas redirige al Dashboard", async ({ page }) => {
    // Primero registrar el usuario
    await page.goto("/register");
    const regEmail = `login_test_${Date.now()}@taskflow.test`;

    const nameInput = page.getByLabel(/nombre/i).or(page.getByPlaceholder(/nombre/i)).first();
    await nameInput.fill("Login Test User");
    const emailInput = page.getByLabel(/email|correo/i).or(page.getByPlaceholder(/email|correo/i)).first();
    await emailInput.fill(regEmail);
    const passwordInputs = page.getByLabel(/contraseña/i).or(page.getByPlaceholder(/••••|contraseña/i));
    await passwordInputs.first().fill(password);
    if (await passwordInputs.count() > 1) {
      await passwordInputs.nth(1).fill(password);
    }
    const wsInput = page.getByLabel(/nombre del workspace|workspace/i).or(page.getByPlaceholder(/workspace/i)).first();
    if (await wsInput.isVisible()) await wsInput.fill("WS Login Test");
    await page.getByRole("button", { name: /crear|registrar|continuar/i }).first().click();
    await page.waitForURL(/dashboard/, { timeout: 15_000 });

    // Hacer logout
    const logoutBtn = page
      .getByRole("button", { name: /cerrar sesión|logout|salir/i })
      .or(page.getByTitle(/logout|cerrar/i))
      .first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      await page.goto("/");
    }

    // Ahora hacer login
    await page.goto("/login");
    await page.getByPlaceholder(/tu@empresa|email/i).fill(regEmail);
    await page.getByPlaceholder(/••••|contraseña/i).fill(password);
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  // ── 6. Manipulación de datos en Dashboard ─────────────────────────────────
  test("Dashboard permite crear una nueva tarea", async ({ page }) => {
    // Registrar y acceder al dashboard
    await page.goto("/register");
    const dashEmail = `dash_test_${Date.now()}@taskflow.test`;

    const nameInput = page.getByLabel(/nombre/i).or(page.getByPlaceholder(/nombre/i)).first();
    await nameInput.fill("Dash Tester");
    const emailInput = page.getByLabel(/email|correo/i).or(page.getByPlaceholder(/email|correo/i)).first();
    await emailInput.fill(dashEmail);
    const passwordInputs = page.getByLabel(/contraseña/i).or(page.getByPlaceholder(/••••|contraseña/i));
    await passwordInputs.first().fill(password);
    if (await passwordInputs.count() > 1) {
      await passwordInputs.nth(1).fill(password);
    }
    const wsInput = page.getByLabel(/nombre del workspace|workspace/i).or(page.getByPlaceholder(/workspace/i)).first();
    if (await wsInput.isVisible()) await wsInput.fill("WS Dashboard Test");
    await page.getByRole("button", { name: /crear|registrar|continuar/i }).first().click();
    await page.waitForURL(/dashboard/, { timeout: 15_000 });

    // Crear nueva tarea
    const newTaskBtn = page.getByRole("button", { name: /nueva tarea|new task|agregar/i }).first();
    await expect(newTaskBtn).toBeVisible();
    await newTaskBtn.click();

    // Completar modal de nueva tarea
    const titleInput = page.getByLabel(/título|title/i).or(page.getByPlaceholder(/título|nombre de la tarea/i)).first();
    if (await titleInput.isVisible()) {
      await titleInput.fill("Tarea E2E creada por Playwright");
    }

    // Guardar
    const saveBtn = page.getByRole("button", { name: /guardar|crear|aceptar|ok/i }).first();
    await saveBtn.click();

    // Verificar que la tarea aparece en la lista
    await expect(page.getByText(/Tarea E2E creada por Playwright/i)).toBeVisible({ timeout: 5_000 });
  });

  // ── 7. Logout ────────────────────────────────────────────────────────────
  test("Logout redirige fuera del Dashboard", async ({ page }) => {
    // Registrar y acceder
    await page.goto("/register");
    const logoutEmail = `logout_test_${Date.now()}@taskflow.test`;

    const nameInput = page.getByLabel(/nombre/i).or(page.getByPlaceholder(/nombre/i)).first();
    await nameInput.fill("Logout Tester");
    const emailInput = page.getByLabel(/email|correo/i).or(page.getByPlaceholder(/email|correo/i)).first();
    await emailInput.fill(logoutEmail);
    const passwordInputs = page.getByLabel(/contraseña/i).or(page.getByPlaceholder(/••••|contraseña/i));
    await passwordInputs.first().fill(password);
    if (await passwordInputs.count() > 1) {
      await passwordInputs.nth(1).fill(password);
    }
    const wsInput = page.getByLabel(/nombre del workspace|workspace/i).or(page.getByPlaceholder(/workspace/i)).first();
    if (await wsInput.isVisible()) await wsInput.fill("WS Logout Test");
    await page.getByRole("button", { name: /crear|registrar|continuar/i }).first().click();
    await page.waitForURL(/dashboard/, { timeout: 15_000 });

    // Buscar y hacer clic en logout
    const logoutBtn = page
      .getByRole("button", { name: /cerrar sesión|logout|salir/i })
      .first();

    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      // Intentar abrir menú de usuario primero
      const userMenu = page.getByRole("button", { name: /perfil|usuario|account/i }).first();
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.getByRole("menuitem", { name: /cerrar sesión|logout/i }).click();
      }
    }

    // Verificar que ya no estamos en el dashboard
    await page.waitForURL(/\/(login|register|$)/, { timeout: 10_000 });
    await expect(page).not.toHaveURL(/dashboard/);
  });
});
