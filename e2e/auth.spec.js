import { test, expect } from '@playwright/test';

test.describe('Login form validation', () => {
  test('shows error on wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('nonexistent.qa@mchubtest.local');
    await page.locator('input[type="password"]').fill('WrongPass123!');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=/không đúng|khong dung|invalid|incorrect|login failed/i')).toBeVisible({ timeout: 10_000 });
  });

  test('rejects weak password on register', async ({ page }) => {
    await page.goto('/register');
    await page.locator('input[name="name"]').fill('QA Weak Pass');
    await page.locator('input[name="email"]').fill(`qa.weak.${Date.now()}@mchubtest.local`);
    await page.locator('input[name="password"]').fill('123');
    await page.locator('input[name="confirmPassword"]').fill('123');
    // Terms toggle is a plain button (not a real checkbox), sharing a parent div with the
    // "Terms of Service" link — click that button to check it.
    await page.locator('div:has(a[href="/terms"]) > button[type="button"]').click();
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=/8 ký tự|8 characters/i')).toBeVisible({ timeout: 10_000 });
  });
});
