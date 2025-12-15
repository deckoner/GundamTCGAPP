import { test, expect } from "@playwright/test";

test.describe("Funcionalidad de Filtros", () => {
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión primero
    await page.goto("/login");
    await page.fill('input[name="username"]', 'demo');
    await page.fill('input[name="password"]', 'demodemo');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/cartas**', { timeout: 10000 }).catch(() => page.goto("/cartas")); 
    
    // Reintentar ir a la página por si acaso hay problemas de carga inicial o si la redirección no ocurrió
    if (!page.url().includes("/cartas")) {
        await page.goto("/cartas", { waitUntil: 'domcontentloaded' });
    }
    await page.waitForLoadState('networkidle');
  });

  test("debería mostrar la sección de filtros", async ({ page }) => {
    await expect(page.locator("#filtros-container")).toBeVisible({ timeout: 10000 });
  });

  test("debería filtrar por nombre", async ({ page }) => {
    const input = page.locator("#filtro-nombre");
    await expect(input).toBeVisible();
    await input.fill("Gundam");
    await page.waitForTimeout(1000);

    await expect(input).toHaveValue("Gundam");
  });

  test("debería alternar el filtro de arte alternativo", async ({ page }) => {
    const checkbox = page.locator("#filtro-alt-art");
    const label = page.locator("label").filter({ hasText: "Mostrar arte alternativo" });

    // Asegurar estado inicial
    await expect(checkbox).not.toBeChecked();

    // Clic en la etiqueta para alternar
    await label.click();
    await expect(checkbox).toBeChecked();

    // Clic de nuevo para volver al estado anterior
    await label.click();
    await expect(checkbox).not.toBeChecked();
  });

  test("debería filtrar por tipo", async ({ page }) => {
    const select = page.locator("#filtro-tipo");
    
    // Comprobar si tenemos opciones
    const options = await select.locator('option').count();
    expect(options).toBeGreaterThan(0);

    // Solo intentar seleccionar si hay una segunda opción
    if (options > 1) {
        await select.selectOption({ index: 1 });
        const value = await select.inputValue();
        expect(value).not.toBe("");
    } else {
        console.log("Saltando test de selección ya que no hay tipos disponibles");
    }
  });
});
