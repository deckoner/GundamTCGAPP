import { test, expect } from "@playwright/test";

test.describe("Constructor de Mazos", () => {
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión con usuario demo
    await page.goto("/login");
    await page.fill('input[name="username"]', "demo");
    await page.fill('input[name="password"]', "demodemo");
    await page.click('button[type="submit"]');

    // Esperar navegación y redirigir a decks
    await page.waitForURL(/.*(\/collection|\/cartas|\/decks)/, { timeout: 10000 }).catch(() => {});
    await page.goto("/decks");
  });

  test("debería permitir crear un nuevo mazo", async ({ page }) => {
    await page.click("#btn-create-deck");
    await expect(page.locator("#create-deck-modal")).toBeVisible();

    await page.fill("#deck-name", "Test Deck E2E");

    await page.click("#btn-cancel-create");
    await expect(page.locator("#create-deck-modal")).not.toBeVisible();
  });
});
