import test from 'node:test';
import assert from 'node:assert/strict';
import { testProjectRef } from './support/test-project.ts';

const ref = 'abcdefghijklmnopqrst';
const config = { E2E_SUPABASE_PROJECT_REF: ref, NEXT_PUBLIC_SUPABASE_URL: `https://${ref}.supabase.co` };

test('test runner requires explicit project authorization', () => {
  for (const value of [undefined, '', ' ', 'bad/ref']) {
    assert.throws(() => testProjectRef({ ...config, E2E_SUPABASE_PROJECT_REF: value }));
  }
});

test('test runner rejects mismatched or missing project URLs', () => {
  for (const value of [undefined, '', 'not-a-url', 'https://other-demo.supabase.co']) {
    assert.throws(() => testProjectRef({ ...config, NEXT_PUBLIC_SUPABASE_URL: value }));
  }
});

test('test runner rejects noncanonical destinations before any network access', () => {
  for (const value of [`http://${ref}.supabase.co`, `https://${ref}.supabase.co.example.test`,
    `https://user@${ref}.supabase.co`, `https://${ref}.supabase.co:8443`,
    `https://${ref}.supabase.co/path`, `https://${ref}.supabase.co?test=1`,
    `https://${ref}.supabase.co#fragment`]) {
    assert.throws(() => testProjectRef({ ...config, NEXT_PUBLIC_SUPABASE_URL: value }));
  }
});

test('test runner accepts distinct explicitly matched demo projects without source edits', () => {
  for (const value of [ref, 'zyxwvutsrqponmlkjihgf']) {
    assert.equal(testProjectRef({ E2E_SUPABASE_PROJECT_REF: value,
      NEXT_PUBLIC_SUPABASE_URL: `https://${value}.supabase.co/` }), value);
  }
});
