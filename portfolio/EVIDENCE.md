# Portfolio Evidence

All application images are real Playwright browser captures from the final application using a local production build and real hosted Auth. Test accounts use fictional example.test addresses and are removed by the test runner.

## Application captures

- `01-login.png`: empty login page after successful logout; no credentials filled.
- `02-protected-dashboard.png`: authenticated dashboard with a fictional account.
- `05-final-app.png`: application home in a visitor session.

These were captured by the unchanged E2E suite: **6 passed (12.9 s)** on Node **24.14.1**. No UI state or application logic was modified for the images.

## Execution summaries

`03-regression-evidence.png` and `04-validation.png` are screenshots of a visual execution record, **not screenshots of a terminal**. They summarize these observed results without disclosing credentials or personal paths:

| Reference | Existing desktop regression test |
| --- | --- |
| baseline-working / 0572d07 | PASS; 1 passed (7.4 s) |
| bug-b-broken / 7270865 | FAIL; case duration 6.3 s |
| bug-b-fixed / 899ced7 | PASS; 1 passed (5.5 s) |

Broken assertion: `tests/e2e/auth.spec.ts:90`, `expect(renewedSession.expires_at > Math.floor(Date.now() / 1000)).toBeTruthy()`. Actual result: `false`. These are selected results from the recorded historical executions, not a newly rerun three-version benchmark.

Test SHA-256 is identical across these references:

```text
5b1785794c221863003d98717977e55514e41c9fe24aab3c2b2fc2bb07c41405
```

Final portfolio-stage verification: **6/6 unit tests, 6/6 E2E, lint PASS, typecheck PASS, production build PASS**. The functional source and original tests did not change during portfolio preparation.

The proven regression was missing browser persistence of renewed session cookies, not inevitable immediate logout. Cookie flags, fragment cleanup and cache behavior were verified separately during fix validation; these summaries do not claim a public HTTPS deployment.
