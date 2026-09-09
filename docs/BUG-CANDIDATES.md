# Three controlled bug candidates — not implemented

Use a later branch from baseline-working, only after selection. No Supabase settings need to change.

## A — Successful Auth login without a browser session

**Symptom:** Correct credentials are accepted, but the dashboard immediately sends the user back to login.

**Cause to introduce:** A refactor calls the default read-only createClient() from logIn instead of createClient(true), so the session is not written to the response cookies.

**Files:** src/app/actions.ts; src/lib/supabase/server.ts.

**Scores (1–5):** difficulty 2; realism 5; reproduction 5; post-fix validation 5.

**Portfolio value:** Distinguishes successful authentication at the provider from successful session delivery; traces a redirect loop to missing Set-Cookie.

**Risks:** Temporary login failure only in the exercise branch. Use fictional accounts and inspect cookie names/flags, not secret values.

## B — Renewed session reaches the server but not the browser

**Symptom:** Login and ordinary reload work. When renewal is needed, requests repeatedly refresh or eventually lose authentication.

**Cause to introduce:** A Proxy refactor returns a new NextResponse.next() instead of the response carrying refreshed cookies. Request cookies are updated, but response cookies are lost.

**Files:** src/proxy.ts; regression test in tests/e2e/auth.spec.ts.

**Scores (1–5):** difficulty 3; realism 5; reproduction 4; post-fix validation 5.

**Portfolio value:** Demonstrates both cookie paths, SSR and a time-dependent failure. The existing expiry test makes renewal deterministic without waiting an hour or altering signed claims.

**Risks:** Refresh-token reuse grace can delay visible logout. Validate the missing persisted cookie immediately and then later navigation. Never change global token security settings.

## C — Successful login reported as an error

**Symptom:** A valid login leaves an error on the form, but manually opening the dashboard shows an authenticated session.

**Cause to introduce:** Moving redirect('/dashboard') into logIn's try/catch catches Next.js's redirect control-flow exception as if it were an Auth failure.

**Files:** src/app/actions.ts; regression test in tests/e2e/auth.spec.ts.

**Scores (1–5):** difficulty 2; realism 5; reproduction 5; post-fix validation 5.

**Portfolio value:** Separates framework control flow from provider errors and demonstrates a localized correction with browser-level regression coverage.

**Risks:** Misleading UI state in the exercise branch. Do not clear a valid session merely to hide the symptom.

## Recommendation

**B** offers the strongest technical portfolio case: real SSR cookie propagation and token renewal, a small reversible change, and an existing objective renewal test.

No bug was selected for implementation. Stop for review.
