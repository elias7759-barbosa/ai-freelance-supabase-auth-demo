# Working baseline evidence

Date: 2026-09-09. Dedicated hosted Supabase: vlvsqnnyrqdmdupjkoeo, Free, eu-west-1. Frontend: local production build, localhost:3007.

| Check | Result |
| --- | --- |
| Valid signup and invalid password confirmation | PASS |
| Required email confirmation; unconfirmed login rejected | PASS |
| Valid and invalid password login | PASS |
| HttpOnly / SameSite=Lax session cookies | PASS |
| Server-protected dashboard | PASS |
| Page refresh persistence | PASS |
| Actual refresh-token renewal and persisted response cookies | PASS |
| Authenticated homepage indicator | PASS |
| Logout removes session cookies | PASS |
| Dashboard blocked after logout | PASS |
| Private mailbox blocked by public Data API | PASS (406) |
| Unit tests | PASS (6/6) |
| Production-build E2E | PASS (6/6) |
| Typecheck / lint / build | PASS |
| npm audit | 0 vulnerabilities reported |
| Vercel preview | PENDING isolated hosting scope |

Local evidence files in evidence/: desktop-home.png, mobile-home.png, desktop-dashboard.png, mobile-dashboard.png, desktop-logged-out.png, mobile-logged-out.png. These are ignored by Git and copied to the operation outputs. Desktop home and mobile dashboard were visually inspected; dashboard overflow was also checked automatically.

Get the immutable baseline commit using git rev-parse baseline-working. No intentionally broken version exists.
