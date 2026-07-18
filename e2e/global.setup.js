import { test as setup, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const API_URL = process.env.E2E_API_URL || 'http://localhost:5000/api/v1';
const MONGO_TEST_URI = process.env.MONGODB_TEST_URI;

const PASSWORD = 'Playwright123!';

function runMongoScript(script) {
  if (!MONGO_TEST_URI) {
    throw new Error('MONGODB_TEST_URI env var required for mongosh-based E2E setup steps.');
  }
  const scriptPath = join(tmpdir(), `e2e-mongo-${Date.now()}-${Math.random().toString(36).slice(2)}.js`);
  writeFileSync(scriptPath, script);
  try {
    return execSync(`mongosh "${MONGO_TEST_URI}" --quiet --file "${scriptPath}"`, { encoding: 'utf-8' });
  } finally {
    unlinkSync(scriptPath);
  }
}

function runMongoUpdate(email, setFields) {
  runMongoScript(`db.users.updateOne({email:${JSON.stringify(email)}},{$set:${JSON.stringify(setFields)}})`);
}

function readAdminLoginOtp(email) {
  const out = runMongoScript(
    `printjson(db.otp_verifications.find({email:${JSON.stringify('admin_login:' + email)}}).sort({createdAt:-1}).limit(1).toArray())`
  );
  const match = out.match(/code:\s*'([^']+)'/);
  if (!match) throw new Error(`Could not read admin_login OTP for ${email} from mchub_test. Raw mongosh output: ${out}`);
  return match[1];
}

async function registerVerifyLogin({ page, request }, { email, name, role, storagePath, extraMongoFields = {} }) {
  const registerRes = await request.post(`${API_URL}/auth/register`, {
    data: { name, email, password: PASSWORD, role },
  });
  expect(registerRes.ok()).toBeTruthy();

  // Flip isVerified (+ role for admin) directly in mchub_test (isolated QA DB) — bypasses
  // real OTP email delivery and the register endpoint's CLIENT/MC-only role restriction,
  // same pattern used by the manual QA pass in testing/.
  runMongoUpdate(email, { isVerified: true, ...extraMongoFields });

  const loginRes = await request.post(`${API_URL}/auth/login`, {
    data: { email, password: PASSWORD },
  });
  expect(loginRes.ok()).toBeTruthy();
  const loginBody = await loginRes.json();

  let token, user;
  if (loginBody.data?.requiresAdminOtp) {
    // ADMIN accounts require a 2FA OTP step (POST /auth/verify-admin-login-otp) before a
    // real JWT is issued — login itself only returns HTTP 202 + requiresAdminOtp. Read the
    // code straight out of mchub_test's otp_verifications collection instead of email.
    const code = readAdminLoginOtp(email);
    const otpRes = await request.post(`${API_URL}/auth/verify-admin-login-otp`, {
      data: { email, code },
    });
    expect(otpRes.ok()).toBeTruthy();
    ({ token, user } = (await otpRes.json()).data);
  } else {
    ({ token, user } = loginBody.data);
  }

  await page.goto('/');
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token, user });

  await page.context().storageState({ path: storagePath });
}

const FREE_COURSE_ID = process.env.E2E_FREE_COURSE_ID || '6a5b2487d7d4274d3c351a57'; // "Free Course Verify DEFECT-006", 0đ

setup('register + verify + login CLIENT test user', async ({ page, request }) => {
  await registerVerifyLogin({ page, request }, {
    email: `qa.e2e.${Date.now()}@mchubtest.local`,
    name: 'QA Playwright',
    role: 'CLIENT',
    storagePath: 'e2e/.auth/user.json',
  });

  // Purchase the known 0đ course through the real purchase endpoint (not a DB hack) so
  // ReadingView / course-detail "already purchased" states are reachable in tests.
  const token = (await page.evaluate(() => localStorage.getItem('token')));
  const purchaseRes = await request.post(`${API_URL}/payment/course-order?courseId=${FREE_COURSE_ID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!purchaseRes.ok()) {
    console.warn(`[setup] Could not auto-purchase free course ${FREE_COURSE_ID}: ${purchaseRes.status()} ${await purchaseRes.text()}`);
  }
});

setup('register + verify + login ADMIN test user', async ({ page, request }) => {
  await registerVerifyLogin({ page, request }, {
    email: `qa.e2e.admin.${Date.now()}@mchubtest.local`,
    name: 'QA Playwright Admin',
    role: 'CLIENT',
    storagePath: 'e2e/.auth/admin.json',
    extraMongoFields: { role: 'ADMIN' },
  });
});
