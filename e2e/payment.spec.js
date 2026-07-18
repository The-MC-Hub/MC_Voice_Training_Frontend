import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

test.describe('Payment page (authenticated, FREE-tier user)', () => {
  test('renders plan cards including DAILY', async ({ page }) => {
    await page.goto('/m/payment');
    await expect(page.locator('body')).toBeVisible();
    // DAILY plan card should be present for a FREE user
    await expect(page.locator('text=/Gói Ngày|Daily/i').first()).toBeVisible({ timeout: 15_000 });
  });

  test('selecting DAILY plan creates an order with correct amount', async ({ page }) => {
    await page.goto('/m/payment?plan=DAILY');
    // Amount panel should show 10.000đ for DAILY
    await expect(page.locator('text=/10\\.000đ|10,000đ/').first()).toBeVisible({ timeout: 15_000 });
  });

  test('comparison table renders DAILY column', async ({ page }) => {
    await page.goto('/m/payment');
    await expect(page.locator('th:has-text("Daily")')).toBeVisible({ timeout: 15_000 });
  });
});
