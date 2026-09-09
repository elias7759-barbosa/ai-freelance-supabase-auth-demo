import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { readConfirmationCode, clearMailbox, removeTestUser } from './mailbox';

test('visitor cannot open dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('invalid credentials show an error without opening dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill('demo-unknown@example.test');
  await page.getByLabel('Password', { exact: true }).fill(randomBytes(18).toString('hex'));
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toHaveText('Invalid email or password.');
  await expect(page).toHaveURL(/\/login$/);
});

test('signup rejects mismatched passwords', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Email', { exact: true }).fill('demo-validation@example.test');
  await page.getByLabel('Password', { exact: true }).fill('Sample-Password-123');
  await page.getByLabel('Confirm password', { exact: true }).fill('Different-Password-456');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toHaveText('Passwords do not match.');
});

for (const size of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`${size.name}: signup, confirmation, login, session refresh, logout`, async ({ page, context }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    const email = `demo-${randomBytes(8).toString('hex')}@example.test`;
    const password = randomBytes(24).toString('base64url');
    try {
      await page.goto('/');
      await expect(page.getByText('Visitor session', { exact: true })).toBeVisible();
      await mkdir('evidence', { recursive: true });
      await page.screenshot({ path: `evidence/${size.name}-home.png`, fullPage: true });
      await page.getByRole('link', { name: 'Sign up', exact: true }).click();
      await page.getByLabel('Email', { exact: true }).fill(email);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByLabel('Confirm password', { exact: true }).fill(password);
      await page.getByRole('button', { name: 'Create account' }).click();
      await expect(page.getByLabel('Confirmation code')).toBeVisible({ timeout: 15_000 });
      const code = await readConfirmationCode(email);
      // A separate visitor cannot use the unconfirmed account.
      const other = await context.newPage();
      await other.goto('/login');
      await other.getByLabel('Email', { exact: true }).fill(email);
      await other.getByLabel('Password', { exact: true }).fill(password);
      await other.getByRole('button', { name: 'Log in', exact: true }).click();
      await expect(other.getByRole('main').getByRole('alert')).toHaveText('Confirm your email before logging in.');
      await other.close();
      await page.getByLabel('Confirmation code').fill(code);
      await page.getByRole('button', { name: 'Confirm account' }).click();
      await expect(page).toHaveURL(/\/login\?confirmed=1$/);
      await clearMailbox(email);
      await page.getByLabel('Email', { exact: true }).fill(email);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByRole('button', { name: 'Log in', exact: true }).click();
      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByText(email, { exact: true })).toBeVisible();
      await expect(page.getByText('Authenticated session', { exact: true })).toBeVisible();
      const before = (await context.cookies()).filter(c => c.name.startsWith('sb-') && c.name.includes('auth-token'));
      expect(before.length).toBeGreaterThan(0);
      expect(before.every(c => c.httpOnly && c.sameSite === 'Lax')).toBeTruthy();
      await page.reload();
      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByText(email, { exact: true })).toBeVisible();
      // Simulate an elapsed timer, without changing signed JWT claims.
      // The real Auth server must renew it and Proxy must persist the cookies.
      const chunks = (await context.cookies()).filter(c => c.name.startsWith('sb-') && c.name.includes('auth-token'))
        .sort((a, b) => a.name.localeCompare(b.name));
      const encoded = chunks.map(c => c.value).join('');
      expect(encoded.startsWith('base64-')).toBeTruthy();
      const session = JSON.parse(Buffer.from(encoded.slice(7), 'base64url').toString());
      session.expires_at = Math.floor(Date.now() / 1000) - 60;
      const expired = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url');
      const cookieName = chunks[0].name.replace(/\.\d+$/, '');
      await context.clearCookies({ name: /sb-.*auth-token/ });
      await context.addCookies([{ ...chunks[0], name: cookieName, value: expired }]);
      await page.reload();
      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByText(email, { exact: true })).toBeVisible();
      const renewed = (await context.cookies()).filter(c => c.name.startsWith('sb-') && c.name.includes('auth-token'))
        .sort((a, b) => a.name.localeCompare(b.name)).map(c => c.value).join('');
      const renewedSession = JSON.parse(Buffer.from(renewed.slice(7), 'base64url').toString());
      // Boolean assertions prevent failures from printing credentials.
      expect(renewedSession.expires_at > Math.floor(Date.now() / 1000)).toBeTruthy();
      expect(renewedSession.refresh_token !== session.refresh_token).toBeTruthy();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
      await page.screenshot({ path: `evidence/${size.name}-dashboard.png`, fullPage: true });
      await page.goto('/');
      await expect(page.getByText('Signed in', { exact: true })).toBeVisible();
      await page.getByRole('link', { name: 'Open dashboard' }).click();
      await page.getByRole('button', { name: 'Log out', exact: true }).click();
      await expect(page).toHaveURL(/\/login$/);
      const after = (await context.cookies()).filter(c => c.name.startsWith('sb-') && c.name.includes('auth-token'));
      expect(after.length).toBe(0);
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login$/);
      await page.screenshot({ path: `evidence/${size.name}-logged-out.png`, fullPage: true });
    } finally {
      await removeTestUser(email);
    }
  });
}

test('private test mailbox is inaccessible through the public API', async ({ request }) => {
  const response = await request.get(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/mailbox`, {
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, 'Accept-Profile': 'auth_test' },
  });
  expect(response.status()).toBe(406);
});
