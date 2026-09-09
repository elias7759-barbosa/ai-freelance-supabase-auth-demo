# Supabase Session Renewal Troubleshooting

## Context

This is a **Demonstration Project / Sample Troubleshooting Project**, not a real client engagement. It demonstrates observation, deterministic reproduction, isolation and verification of a realistic SSR session defect.

## Working Baseline

Signup, required confirmation, password login, protected dashboard access, ordinary reload, session renewal and logout worked. The browser persisted renewed cookies and unauthenticated dashboard requests were redirected to login.

Reference: `baseline-working` (`0572d07`).

## Regression

Initial login continued to work. Real token renewal occurred in Supabase, but **renewed session cookies were not persisted in the browser**.

The dashboard remained accessible during the observed requests. This evidence does not establish inevitable logout or a fixed delay until logout. Token validity and refresh-token reuse behavior can mask a persistence defect.

Reference: `bug-b-broken` (`7270865`).

## Reproduction

1. Run a selected historical version as a local production build against the dedicated test sandbox.
2. Run the existing desktop E2E scenario: signup, confirmation, password login, dashboard and normal reload.
3. The test updates only the fictional browser session metadata `expires_at` to the past. It does not change the signed JWT, refresh token or global Auth settings.
4. Reload the dashboard. The installed SDK detects expired metadata and performs real renewal.
5. Assert that the browser stores a future expiry and a different refresh token.

```sh
npm run build
E2E_PRODUCTION=1 npm run test:e2e -- --grep 'desktop:'
```

Use a separate clean checkout for each historical reference and stop any previous server on the configured port. This stimulus triggers genuine renewal without waiting for natural JWT expiry; it does not cover every long-running session scenario. No token values are logged.

## Root Cause

The SSR client's `setAll` callback updates request cookies for downstream Server Components and prepares response cookies for the browser.

The regression created a new `NextResponse` after `getClaims()` had triggered renewal and the previous response had received the refreshed cookies. The new response forwarded the updated request but did not retain the outgoing `Set-Cookie` headers.

The current dashboard request could therefore succeed while the browser retained the previous session. Initial password login used a Server Action with its own cookie writes and remained functional.

## Evidence

| State | Original regression test | Auth rotation | Browser persistence |
| --- | --- | --- | --- |
| Baseline | PASS | PASS | PASS |
| Broken | FAIL | PASS | FAIL |
| Fixed | PASS | PASS | PASS |

The broken test failed on the assertion that the browser's renewed expiry must be in the future. Separate observations confirmed server-side rotation without an updated browser token. The fixed version passed the same assertions and restored the baseline's exact Git tree before later runtime/documentation commits.

An additional fixed-version check supplied the session as two cookie fragments. Renewal emitted the replacement cookie and removed both obsolete fragments. The browser stored the new expiry/token, the second reload succeeded, and logout removed the session.

## Fix

One line was removed from `src/proxy.ts`:

```diff
   await supabase.auth.getClaims();
-  response = NextResponse.next({ request });
   response.headers.set("Cache-Control", "private, no-store");
   return response;
```

The response that received renewed cookies is returned again. No architecture or dependency change was required.

Reference: `bug-b-fixed` (`899ced7`).

## Regression Protection

The same `tests/e2e/auth.spec.ts` exists byte-for-byte in the baseline, broken and fixed references. Its SHA-256 in all three is:

```text
5b1785794c221863003d98717977e55514e41c9fe24aab3c2b2fc2bb07c41405
```

The test failed again immediately before the fix and passed afterward. Assertions were not weakened to obtain a passing result.

## Validation

- 6/6 unit tests.
- 6/6 E2E cases, including desktop and mobile.
- Typecheck, lint and production build.
- Required confirmation and denial of unconfirmed login.
- HttpOnly, SameSite=Lax, Secure in production and path `/` after renewal.
- Cookie fragment cleanup, browser persistence and second reload.
- `Cache-Control: private, no-store` during renewal.
- Authenticated dashboard access, unauthenticated denial and logout cleanup.

The main branch standardizes Node 24.x. Validation uses a local production build and real hosted Auth. Observing the Secure flag locally does not validate public TLS infrastructure; no public deployment is claimed.

## Security

The correction did not disable authentication, relax protection, remove refresh behavior, change cookie flags or modify Supabase permissions. No Auth configuration or real business data was changed. Test accounts are fictional and removed by the runner.

Do not print or commit session cookies, OTPs, passwords or management tokens. Boolean token-comparison assertions prevent credential disclosure in failure output.

## References

- `baseline-working`: functional starting point.
- `bug-b-broken`: deliberate regression.
- `bug-b-fixed`: verified minimal correction.
- [Supabase SSR client configuration](https://supabase.com/docs/guides/auth/server-side/creating-a-client).
- Version-matched Proxy documentation included in the installed Next.js package.
