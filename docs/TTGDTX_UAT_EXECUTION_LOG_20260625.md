# TTGDTX UAT Execution Log 2026-06-25

Status: DRAFT_CONTROL
Mode: Local hardening branch, localhost smoke test, no production approval.

## 1. Scope Executed

This log records the first controlled UAT pass for the TTGDTX 9+ pilot web app.
It covers:

1. Static preflight gates.
2. Build/lint readiness.
3. Browser smoke test for unauthenticated access.
4. Remaining multi-account role/workspace UAT that still needs synthetic users.

No real passwords, OTPs, service keys, bank credentials, student PII or production
data were used.

## 2. Preflight Result

Executed on 2026-06-25 from `D:\Web app HEU\heu-admission-crm`.

| Check | Result | Evidence |
|---|---|---|
| `npm.cmd run audit:permission-soft-revoke` | PASS | Permission soft-revoke audit passed |
| `npm.cmd run audit:ttgdtx-role-scope-access` | PASS | Checked 17 TTGDTX pages |
| `npm.cmd run audit:ttgdtx-data-fetch-gate` | PASS | Checked 17 TTGDTX pages |
| `npm.cmd run audit:ttgdtx-dashboard-access` | PASS | Dashboard-access audit passed |
| `npm.cmd run audit:ttgdtx-uat-readiness` | PASS AFTER SETUP | Added to guard this UAT evidence pack |
| `npm.cmd run audit:ttgdtx-step110-safety` | PASS | Step110 metadata-only, view-order and debug guards passed |
| `npm.cmd run audit:ttgdtx-release-gates` | PASS | Checked 12 files and 11 npm scripts |
| `npm.cmd run lint` | PASS | ESLint completed without error |
| `npm.cmd run build` | PASS | Next.js build completed; 47/47 pages generated |

## 3. Browser Smoke: Unauthenticated Access

Browser target: `http://localhost:3000`.

Expected result: every TTGDTX route redirects to `/login` when there is no
authenticated user session.

| Route | Result |
|---|---|
| `/ttgdtx` | PASS - redirected to `/login` |
| `/ttgdtx/tuition` | PASS - redirected to `/login` |
| `/ttgdtx/gate` | PASS - redirected to `/login` |
| `/ttgdtx/receivables` | PASS - redirected to `/login` |
| `/ttgdtx/payments` | PASS - redirected to `/login` |
| `/ttgdtx/reconciliation` | PASS - redirected to `/login` |
| `/ttgdtx/reconciliation/review` | PASS - redirected to `/login` |
| `/ttgdtx/payment-requests` | PASS - redirected to `/login` |
| `/ttgdtx/payment-requests/review` | PASS - redirected to `/login` |
| `/ttgdtx/payment-requests/pay` | PASS - redirected to `/login` |
| `/ttgdtx/accounting-dashboard` | PASS - redirected to `/login` |
| `/ttgdtx/import` | PASS - redirected to `/login` |
| `/ttgdtx/import/issues` | PASS - redirected to `/login` |
| `/ttgdtx/import/workload` | PASS - redirected to `/login` |
| `/ttgdtx/master` | PASS - redirected to `/login` |
| `/ttgdtx/source-control` | PASS - redirected to `/login` |
| `/ttgdtx/simulation` | PASS - redirected to `/login` |

Login page smoke:

| Signal | Result |
|---|---|
| Page title | `HEU Admission CRM` |
| Login form | Present |
| Email input | Present, `autocomplete=email` |
| Password input | Present, `autocomplete=current-password` |
| Submit button | Present |
| Browser console errors | None observed |

## 4. Not Yet Executed

The following are not executed yet because this local checkout only exposes
Supabase URL and publishable key, not a safe automation credential for creating
synthetic Auth users:

| UAT account | Status |
|---|---|
| `UAT_ADMIN` | PENDING |
| `UAT_BGH` | PENDING |
| `UAT_KHTC` | PENDING |
| `UAT_TUYEN_SINH` | PENDING |
| `UAT_PHAP_CHE` | PENDING |
| `UAT_OUT_OF_SCOPE` | PENDING |

Use synthetic accounts only. Do not send real passwords into Codex/chat. The
human operator should create or reset these accounts in Supabase Auth, then log
in in the browser and run `docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md`.
Use `docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md` as the account setup guide.
Use `docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md` as the route/account execution
matrix.

## 5. Current Decision

Result: PARTIAL PASS.

Static controls, build, lint and unauthenticated route protection pass. Signed
multi-account UAT is still required before marking permission/workspace control
DONE or moving production recommendation away from NO-GO.
