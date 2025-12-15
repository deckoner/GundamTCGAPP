import { test, expect } from "@playwright/test";

test.describe("Autenticación", () => {
  test("debería redirigir al login al acceder a una página protegida", async ({
    page,
  }) => {
    await page.goto("/collection");
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("debería permitir el login con credenciales válidas", async ({ page }) => {
    await page.goto("/login");

    // Llenar formulario de login
    await page.fill('input[name="username"]', "demo");
    await page.fill('input[name="password"]', "demodemo");

    // Click en login
    await page.click('button[type="submit"]');

    // Verificar redirección a home
    await expect(page).not.toHaveURL(/.*\/login/);

    // Verificamos si estamso en home si hay un h1
    await expect(page.locator('h1')).toBeVisible();
  });
});
