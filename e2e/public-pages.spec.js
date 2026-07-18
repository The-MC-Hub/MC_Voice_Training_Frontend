import { test, expect } from '@playwright/test';

test.describe('Public pages (no auth)', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page renders form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('register page renders form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('protected route redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/m/dashboard');
    await page.waitForURL(/\/login/);
  });

  test('about, terms, privacy, help, contact pages load without error', async ({ page }) => {
    for (const path of ['/about', '/terms', '/privacy', '/help', '/contact']) {
      await page.goto(path);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
