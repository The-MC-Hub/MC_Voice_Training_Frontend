import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

test.describe('Dashboard (authenticated)', () => {
  test('loads dashboard for logged-in user', async ({ page }) => {
    await page.goto('/m/dashboard');
    await expect(page).toHaveURL(/\/m\/dashboard/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/m/settings');
    await expect(page).toHaveURL(/\/m\/settings/);
  });

  test('voice library page loads', async ({ page }) => {
    await page.goto('/m/voice/library');
    await expect(page.locator('body')).toBeVisible();
  });

  test('community page loads', async ({ page }) => {
    await page.goto('/m/community');
    await expect(page.locator('body')).toBeVisible();
  });

  test('leaderboard page loads', async ({ page }) => {
    await page.goto('/m/leaderboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('courses list page loads', async ({ page }) => {
    await page.goto('/m/courses');
    await expect(page.locator('body')).toBeVisible();
  });
});
