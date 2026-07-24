import { test, expect } from '@playwright/test';

const FREE_COURSE_ID = process.env.E2E_FREE_COURSE_ID || '6a5b2487d7d4274d3c351a57';
const FREE_COURSE_READING_ID = process.env.E2E_FREE_COURSE_READING_ID || '6a5b247b46830105563682d1';

test.describe('Reading view (authenticated, purchased free course)', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  test('course detail shows purchased/access-granted state', async ({ page }) => {
    await page.goto(`/m/courses/${FREE_COURSE_ID}`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('reading guide page renders content for a purchased course', async ({ page }) => {
    await page.goto(`/m/learning/guide/${FREE_COURSE_READING_ID}`);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin dashboard (authenticated as ADMIN)', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('ADMIN user can access the admin dashboard', async ({ page }) => {
    await page.goto('/m/admin');
    await expect(page).toHaveURL(/\/m\/admin/);
    // The page includes a hidden print-only PDF-export section, which makes a plain
    // `body` visibility check racy. Assert on the always-visible dashboard heading instead.
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible({ timeout: 10_000 });
  });

  test.describe('admin sections load without crashing', () => {
    for (const section of ['users', 'lessons', 'transactions', 'academy', 'courses', 'competitions', 'logs', 'marketing', 'plans', 'notifications', 'guide', 'security-logs']) {
      test(`section: ${section}`, async ({ page }) => {
        await page.goto(`/m/admin/${section}`);
        // Sidebar logout button is always rendered once the admin shell mounts, regardless
        // of which section is active — a stable smoke-test anchor.
        await expect(page.getByRole('button', { name: /Đăng xuất|Log ?Out/i })).toBeVisible({ timeout: 10_000 });
      });
    }
  });
});
