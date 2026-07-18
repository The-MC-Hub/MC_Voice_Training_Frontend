import { test as setup, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const API_URL = process.env.E2E_API_URL || 'http://localhost:5000/api/v1';
const MONGO_TEST_URI = process.env.MONGODB_TEST_URI;
const STORAGE_PATH = 'e2e/.auth/user.json';

const TEST_EMAIL = `qa.e2e.${Date.now()}@mchubtest.local`;
const TEST_PASSWORD = 'Playwright123!';
const TEST_NAME = 'QA Playwright';

setup('register + verify + login test user', async ({ page, request }) => {
  const registerRes = await request.post(`${API_URL}/auth/register`, {
    data: { name: TEST_NAME, email: TEST_EMAIL, password: TEST_PASSWORD, role: 'CLIENT' },
  });
  expect(registerRes.ok()).toBeTruthy();

  if (!MONGO_TEST_URI) {
    throw new Error('MONGODB_TEST_URI env var required to flip isVerified on the freshly-registered test user.');
  }

  // Flip isVerified directly in mchub_test (isolated QA DB) — bypasses real OTP email
  // delivery for E2E setup only, same pattern used by the manual QA pass in testing/.
  const scriptPath = join(tmpdir(), `e2e-verify-${Date.now()}.js`);
  writeFileSync(scriptPath, `db.users.updateOne({email:${JSON.stringify(TEST_EMAIL)}},{$set:{isVerified:true}})`);
  try {
    execSync(`mongosh "${MONGO_TEST_URI}" --quiet --file "${scriptPath}"`, { stdio: 'pipe' });
  } finally {
    unlinkSync(scriptPath);
  }

  const loginRes = await request.post(`${API_URL}/auth/login`, {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  expect(loginRes.ok()).toBeTruthy();
  const loginBody = await loginRes.json();
  const { token, user } = loginBody.data;

  await page.goto('/');
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token, user });

  await page.context().storageState({ path: STORAGE_PATH });
});
