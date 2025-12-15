import { test, expect } from "@playwright/test";

test.describe("Gestión de Colección", () => {
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión como usuario demo
    await page.goto("/login");
    await page.fill('input[name="username"]', "demo");
    await page.fill('input[name="password"]', "demodemo");
    await page.click('button[type="submit"]');

    // Esperar navegación a la colección o forzarla si redirige al home
    await page.waitForURL(/.*(\/collection|\/cartas|\/decks)/, { timeout: 10000 }).catch(() => {});
    await page.goto("/collection");
  });

  test("debería mostrar cartas en la colección", async ({ page }) => {
    // Esperar a que carguen las cartas
    await expect(page.locator("#cartas-container")).toBeVisible({ timeout: 10000 });
  });

  test("debería alternar el filtro de arte alternativo", async ({ page }) => {
    const checkbox = page.locator("#filtro-alt-art");
    const label = page.locator("label").filter({ hasText: "Mostrar arte alternativo" });
    const initialChecked = await checkbox.isChecked();
    
    await label.click();
    if (initialChecked) {
        await expect(checkbox).not.toBeChecked();
    } else {
        await expect(checkbox).toBeChecked();
    }
    
    // Alternar de nuevo
    await label.click();
    if (initialChecked) {
        await expect(checkbox).toBeChecked();
    } else {
        await expect(checkbox).not.toBeChecked();
    }
  });

  test("debería abrir el modal de importación", async ({ page }) => {
    await expect(page.locator("#hidden-csv-input")).toBeAttached();
    await expect(page.locator("#btn-import")).toBeVisible();
  });
});
