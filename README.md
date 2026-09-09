# AI Freelance Supabase Auth Demo

## Purpose

**Demonstration Project / Sample Troubleshooting Project.** Portfolio sample, not client work. Establish a verified working baseline before introducing any controlled bug.

## Stack

| Technology | Validated version |
| --- | --- |
| Node.js / npm | 24.14.1 / 11.11.0 |
| Next.js (App Router) | 16.3.4 |
| React / React DOM | 19.2.8 |
| TypeScript | 5.9.3 |
| Supabase JS / SSR | 2.116.0 / 0.12.7 |
| ESLint | 9.39.5 |
| Playwright | 1.63.0 |

Dependencies are locked. ESLint 9 matches the official scaffold. ESLint 10 failed in the bundled React plugin (context.getFilename); no rules were disabled. ESLint 9 emits an upstream deprecation notice, so reassess compatibility when upgrading.

## Architecture

- Routes: /, /signup, /login, /dashboard.
- Server Actions perform signup, confirmation, password login and logout.
- Request-scoped Supabase SSR client; Actions explicitly enable cookie writes.
- Proxy calls getClaims() and forwards renewed cookies to BOTH the current request and the response.
- Dashboard independently calls getUser() server-side and redirects unauthenticated visitors to /login.
- Redirects remain outside try/catch because Next.js uses thrown control-flow exceptions.
- Cookies: HttpOnly, SameSite=Lax, Secure in production. No browser Supabase client is needed because Auth mutations use Server Actions.
- No service-role key in the app. No financial, church or client data.

### Private test mailbox

This sandbox accepts only fictional demo-…@example.test addresses. A supported PostgreSQL Send Email hook delivers confirmation codes to a private auth_test schema. Confirmation is still mandatory. RLS and grants deny access to anon/authenticated/service_role and the public Data API. Only Auth and an authorized management test runner use the mailbox.

Delivery is capped at 20/hour; other rate limits remain active. Old messages are pruned on delivery; tests remove their own messages and users. No real email is sent. This is test infrastructure, not a production mail provider: a visitor cannot retrieve confirmation codes from the public app.

## Setup

Use Node.js 24 LTS; selected Supabase packages require Node 22+.

```sh
npm ci
cp .env.example .env.local
npm run dev -- --port 3007
```

Populate .env.local from a dedicated test Supabase project. Never reuse a financial/church/production backend. Current demo: vlvsqnnyrqdmdupjkoeo, eu-west-1, Free.

For a new isolated sandbox, apply the SQL migration in supabase/migrations through an authenticated migration workflow or SQL editor, then configure the non-secret settings in supabase/auth-settings.json. Keep email confirmation enabled.

Open http://localhost:3007. The E2E runner completes signup and confirmation without external mail.

## Environment Variables

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

.env.local is Git-ignored; .env.example contains names only.

Optional test-runner-only names: SUPABASE_ACCESS_TOKEN, E2E_BASE_URL, E2E_PRODUCTION. These are NOT app runtime credentials. Local E2E uses the existing Supabase CLI credential from macOS Keychain in memory. Elsewhere supply SUPABASE_ACCESS_TOKEN securely to the test process. The test helper is restricted to the dedicated demo ref; review its guard before using a different sandbox.

## Working Baseline

Validated 2026-09-09 using the actual hosted Supabase Auth service and a locally served production build:

Visitor → signup → required code confirmation → password login → session → dashboard → page refresh → real token renewal → logout → dashboard blocked.

Six unit tests and six Playwright cases passed. Desktop: 1280×900; mobile: 390×844. No bug introduced. See docs/BASELINE.md.

## Testing

```sh
npm run verify
npx playwright install chromium
E2E_PRODUCTION=1 npm run test:e2e
```

verify runs npm test, lint, typecheck and build. Default test:e2e starts a development server; E2E_PRODUCTION uses the existing production build. Build and E2E run sequentially.

Coverage: validation, invalid credentials, unconfirmed-user denial, signup/OTP confirmation, valid login, cookies, ordinary refresh, real refresh-token rotation, homepage state, logout and route blocking, private mailbox isolation.

The renewal test changes the fictional browser session's expiry metadata, not the signed JWT. The real Auth server must renew it and Proxy must persist the new cookies. This is test stimulus, not an introduced application bug.

Passwords are generated at runtime. Traces are off. Screenshots show only homepage, dashboard and empty logged-out form. No shared hardcoded demo password; tests remove their own accounts.

## Vercel

Vercel-ready standard Next.js app. Preview pending an isolated hosting scope: the only accessible team is Aviva Church on Pro. No church project reused and no protection disabled. This does not block the local production-build baseline.

## Known limitations

- Private mailbox; external email delivery is not tested. A future real-user app needs an SMTP provider and review of the sandbox-only email rule.
- Supabase Free excludes leaked-password checking. Advisor reported that one plan-related warning. Minimum password length is 12; confirmation and rate limits remain enabled.
- ESLint compatibility caveat above.
- Local Git repository; no GitHub remote created.

## Troubleshooting Exercise

> A controlled troubleshooting scenario will be introduced only after the working baseline has been fully validated.

Exactly three proposals are in docs/BUG-CANDIDATES.md. None is implemented. The local baseline-working tag must never be moved or overwritten.

## References

- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Auth hooks and permissions](https://supabase.com/docs/guides/auth/auth-hooks)
- [Password security](https://supabase.com/docs/guides/auth/password-security)
- Version-matched Next documentation in node_modules/next/dist/docs.
