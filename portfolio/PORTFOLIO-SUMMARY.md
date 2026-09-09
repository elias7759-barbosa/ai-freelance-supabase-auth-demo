# Next.js + Supabase Authentication Troubleshooting

## Problem

Initial login worked, but renewed session cookies were not persisted in the browser. The server could still render the protected dashboard, so successful page access alone did not establish correct session persistence.

## Diagnosis

A deterministic test triggered real renewal and compared the browser session before and after it. The same unchanged test passed on the baseline, failed on the controlled regression and passed after the correction.

## Root Cause

The Proxy created a new response after the SSR client had written refreshed cookies to the previous response. The updated request reached the server, but the replacement response did not carry the Set-Cookie headers needed by the browser.

## Fix

Removing one response-recreation line restored correct request/response cookie propagation. Authentication rules, cookie flags and Supabase permissions remained unchanged.

## Validation

- 6/6 unit tests.
- 6/6 E2E cases, including desktop and mobile.
- Typecheck, lint and production build.
- Protected route access and unauthenticated denial.
- Session renewal and browser cookie persistence.
- Logout and session-cookie removal.

## Stack

- Next.js
- React
- TypeScript
- Supabase
- Playwright

## Project Type

**Demonstration Project / Sample Troubleshooting Project.** Not client work. Verified with a local production build and real hosted Supabase Auth; no public deployment is claimed.
