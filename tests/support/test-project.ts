// Test infrastructure only. Validate the destination before requesting credentials.
export function testProjectRef(env: Record<string, string | undefined>): string {
  const expected = env.E2E_SUPABASE_PROJECT_REF?.trim();
  if (!expected || !/^[a-z0-9-]+$/.test(expected)) {
    throw new Error('Set E2E_SUPABASE_PROJECT_REF to the explicitly authorized demo project reference.');
  }
  let url: URL;
  try {
    url = new URL(env.NEXT_PUBLIC_SUPABASE_URL ?? '');
  } catch {
    throw new Error('Set NEXT_PUBLIC_SUPABASE_URL to the authorized demo project URL.');
  }
  if (url.protocol !== 'https:' || url.hostname !== `${expected}.supabase.co`
    || url.username || url.password || url.port || url.pathname !== '/'
    || url.search || url.hash) {
    throw new Error('The Supabase URL must match E2E_SUPABASE_PROJECT_REF using its standard hosted HTTPS URL.');
  }
  return expected;
}
