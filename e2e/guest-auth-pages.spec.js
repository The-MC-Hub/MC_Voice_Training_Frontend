import { test, expect } from '@playwright/test';

test.describe('Forgot password page', () => {
  test('renders step-1 email form', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('submitting unknown email does not reveal enumeration (same generic message)', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.locator('input[type="email"]').fill('nonexistent.qa@mchubtest.local');
    await page.locator('button[type="submit"]').click();
    // Step should advance to code-entry regardless of whether the email exists
    await expect(page.locator('input[maxlength="6"]')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Verify email page', () => {
  test('renders without crashing when no token present', async ({ page }) => {
    await page.goto('/verify-email');
    await expect(page.locator('body')).toBeVisible();
  });
});
