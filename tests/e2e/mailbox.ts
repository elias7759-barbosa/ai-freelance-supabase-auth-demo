// Test runner only. Never imported by the app or shipped to the browser.
import { execFileSync } from 'node:child_process';
import { loadEnvFile } from 'node:process';

loadEnvFile('.env.local');
const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0];
if (ref !== 'vlvsqnnyrqdmdupjkoeo') throw new Error('Test runner is restricted to the dedicated demo project.');

function credential() {
  return process.env.SUPABASE_ACCESS_TOKEN || execFileSync('security', ['find-generic-password', '-s', 'Supabase CLI', '-w'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

async function query(sql: string, email: string, readOnly: boolean): Promise<Record<string, unknown>[]> {
  if (!/^demo-[a-z0-9-]+@example\.test$/.test(email)) throw new Error('Non-fictional test address rejected.');
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${credential()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql, parameters: [email], read_only: readOnly }),
  });
  if (!response.ok) throw new Error(`Test mailbox access failed (${response.status}); no response data logged.`);
  return response.json();
}

export async function readConfirmationCode(email: string): Promise<string> {
  const rows = await query("select otp from auth_test.mailbox where email=$1 and action='signup' and created_at>now()-interval '10 minutes' order by created_at desc limit 1", email, true);
  const code = rows[0]?.otp;
  if (typeof code !== 'string') throw new Error('No confirmation message captured for this test account.');
  return code;
}

export async function clearMailbox(email: string) {
  await query('delete from auth_test.mailbox where email=$1', email, false);
}

export async function removeTestUser(email: string) {
  // Only the current test's fictional user; no broad cleanup or financial refs.
  await query('delete from auth.sessions where user_id in (select id from auth.users where email=$1)', email, false);
  await query('delete from auth.users where email=$1', email, false);
  await clearMailbox(email);
}
