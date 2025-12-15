import { test, expect } from '@playwright/test';

test.describe('Navegación', () => {
  test('debería navegar a la página de inicio', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/GundamTCG/);
  });

  test('debería navegar a la página de cartas', async ({ page }) => {
    // Inicio de sesión requerido
    await page.goto("/login");
    await page.fill('input[name="username"]', 'demo');
    await page.fill('input[name="password"]', 'demodemo');
    await page.click('button[type="submit"]');
    
    await page.goto('/cartas');
    await expect(page.locator('#filtros-container')).toBeVisible({timeout: 10000});
  });

  test('debería navegar a la página de decks', async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="username"]', 'demo');
    await page.fill('input[name="password"]', 'demodemo');
    await page.click('button[type="submit"]');

    await page.goto('/decks');
    await expect(page.getByRole('heading', { name: "Mis Decks" })).toBeVisible();
  });

  test('debería navegar a la página de login', async ({ page }) => {
     await page.goto('/login');
     await expect(page.locator('form')).toBeVisible(); 
  });
});
