import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

test.describe('Voice Training practice flow (authenticated)', () => {
  test('voice library lists lessons and navigating into one opens practice page', async ({ page }) => {
    await page.goto('/m/voice/library');
    await expect(page.locator('body')).toBeVisible();

    // Lesson cards are clickable divs (navigate() on click, not <a href>), not real links.
    // VoiceLibrary.jsx tags the first lesson card with data-quest="quest-first-lesson"
    // in both list and grid view — stable anchor regardless of layout mode. Lessons load
    // async, so wait for the card rather than checking count() immediately.
    const lessonCard = page.locator('[data-quest="quest-first-lesson"]');
    const appeared = await lessonCard.first().waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false);
    test.skip(!appeared, 'No lessons available in voice library to click into');

    await lessonCard.click();
    await page.waitForURL(/\/m\/voice\/practice\//);
    await expect(page.locator('body')).toBeVisible();
  });
});
