import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

test.describe('Onboarding page (authenticated CLIENT)', () => {
  test('loads without crashing', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Success page (authenticated)', () => {
  test('loads with no query params', async ({ page }) => {
    await page.goto('/m/success');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Payment result pages (authenticated)', () => {
  test('success result page loads', async ({ page }) => {
    await page.goto('/payment/success?plan=DAILY&amount=10000&orderId=123');
    await expect(page.locator('body')).toBeVisible();
  });

  test('cancel result page loads', async ({ page }) => {
    await page.goto('/payment/cancel?plan=DAILY');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Wallet page (role-gated: MC/ADMIN only)', () => {
  test('CLIENT user is redirected away from wallet', async ({ page }) => {
    await page.goto('/m/wallet');
    await page.waitForURL(/\/m\/dashboard/, { timeout: 10_000 });
  });
});

test.describe('Admin dashboard (role-gated: ADMIN only)', () => {
  test('CLIENT user is redirected away from admin dashboard', async ({ page }) => {
    await page.goto('/m/admin');
    await page.waitForURL(/\/m\/dashboard/, { timeout: 10_000 });
  });
});

test.describe('Coming-soon placeholder routes', () => {
  test('legacy /courses (coming soon) loads', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Learning roadmap (authenticated, real page — not ComingSoon)', () => {
  test('loads the roadmap page with a heading, not the ComingSoon placeholder', async ({ page }) => {
    await page.goto('/m/learning');
    await expect(page.locator('body')).toBeVisible();
    // ComingSoon renders a generic "coming soon"/"đang được xây dựng" message — assert it's gone.
    await expect(page.getByText(/đang được (xây dựng|phát triển)/i)).toHaveCount(0);
  });
});

test.describe('Peer review page (role-gated: MC only)', () => {
  test('CLIENT user is redirected away from peer-review', async ({ page }) => {
    await page.goto('/m/peer-review');
    await page.waitForURL(/\/m\/dashboard/, { timeout: 10_000 });
  });
});
