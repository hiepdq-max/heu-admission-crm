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
| `npm.cmd run audit:ttgdtx-release-gates` | PASS | Checked 16 files and 11 npm scripts |
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
Use `docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md` and
`docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md` to record the signed UAT route
results below.

## 5. Internal UAT Run Closure Tracker

Result: BLOCKED_PENDING_MULTI_ACCOUNT_UAT.

Completion rule: the UAT result can move to `UAT_PASS` only when every row below
has `PASS`, a redacted evidence reference, reviewer name and owner sign-off.
Any missing account, route result, negative-test result, redaction proof or
owner signature keeps production NO-GO.

| Closure item | Required result | Current status | Evidence/reference | Owner |
|---|---|---|---|---|
| UAT-CLOSE-01 Synthetic accounts prepared | PASS/BLOCKED | PENDING | `docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md` plus Supabase Auth screenshot/reference, redacted | IT_DATA |
| UAT-CLOSE-02 Route matrix executed | PASS/BLOCKED | PENDING | `docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md` route/account results, redacted | IT_DATA + process owners |
| UAT-CLOSE-03 Finance and dashboard negative tests pass | PASS/BLOCKED | PENDING | Out-of-scope and non-finance denial screenshots/references, redacted | KHTC + BGH + IT_DATA |
| UAT-CLOSE-04 Execution log completed | PASS/BLOCKED | PENDING | This log records account, route, result, evidence reference and reviewer | IT_DATA + Audit |
| UAT-CLOSE-05 Sensitive evidence controlled | PASS/BLOCKED | PENDING | No passwords, OTPs, service-role keys, raw PII, bank accounts or raw payment evidence in Git/Codex/chat | IT_DATA + Audit |
| UAT-CLOSE-06 Owners sign UAT result | PASS/BLOCKED | PENDING | BGH, KHTC, PHAP_CHE and IT_DATA sign PASS, FAIL or BLOCKED outside Codex/chat | Required owners |

## 5.1 Governance UAT Execution Readiness

Result: BLOCKED_PENDING_SIGNED_GOVERNANCE_UAT.

Run P6-04 before P6-03 so role/workspace access is proven before audit-log
traceability evidence is sampled. Both runs must use synthetic accounts,
controlled evidence references, redaction checks and owner signatures outside
Git/Codex/chat.

| Governance UAT | Current status | Route | Runbook | Guard | Minimum proof | Owner | Stop condition |
|---|---|---|---|---|---|---|---|
| P6-04 role/workspace UAT | PENDING | `/settings/scopes` | `docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md` | `npm.cmd run audit:heu-role-scope-uat-pack` | Synthetic-account route matrix, blocked out-of-scope cases, controlled evidence reference, reviewer and owner signature | IT_DATA + TRUONG_PHONG + Audit | Role leak, unsigned evidence, missing redaction proof, server-side bypass or broad access keeps production NO-GO |
| P6-03 audit-log traceability UAT | PENDING | `/audit` | `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md` | `npm.cmd run audit:ttgdtx-audit-trail-guard` | Trace rows for create, update, check, approve, pay and source-control events tied to actor, entity, time and controlled evidence reference | Audit + IT_DATA + KHTC | Missing trace row, generic payload, broken workflow chain, unsigned evidence or raw audit export keeps production NO-GO |

PASS_LOCAL does not execute these UAT runs, accept evidence, grant access,
approve finance action, waive audit traceability or mark production GO.

## 5.2 Signed UAT Route Result Tracker

Result: BLOCKED_PENDING_SIGNED_UAT_ROUTE_EVIDENCE.

Decision lane: `SIGNED_UAT_READY / NO_GO / BLOCKED`.

Each row below must have a controlled evidence reference, redaction reviewer,
route result, reviewer name and required owner signature outside Git/Codex/chat
before it can move to `SIGNED_UAT_READY`. Missing proof, raw evidence, unsigned
owner result or a failed stop condition keeps the route `NO_GO` or `BLOCKED`.

| Route | Current status | Decision lane | Route/source | Minimum proof to record | Owner | Evidence/reference |
|---|---|---|---|---|---|---|
| UAT-ROUTE-01 P0-10 controlled evidence redaction intake | PENDING | SIGNED_UAT_READY / NO_GO / BLOCKED | `docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md` | Controlled storage location, redaction class, reviewer and evidence ID | IT_DATA + Audit | PENDING |
| UAT-ROUTE-02 P0-03 backup/restore dry-run proof | PENDING | SIGNED_UAT_READY / NO_GO / BLOCKED | `docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md` | Backup ID, restore target, preflight/postflight output and restore smoke-check evidence | IT_DATA + Audit | PENDING |
| UAT-ROUTE-03 Step90-Step110 signed production migration order | PENDING | SIGNED_UAT_READY / NO_GO / BLOCKED | `docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md` | Signed migration order after accepted backup/restore evidence and rollback point | IT_DATA + KHTC + PHAP_CHE | PENDING |
| UAT-ROUTE-04 P6-04 role/workspace scope UAT | PENDING | SIGNED_UAT_READY / NO_GO / BLOCKED | `docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md` | Synthetic account route matrix, allowed cases and blocked negative cases | IT_DATA + TRUONG_PHONG + Audit | PENDING |
| UAT-ROUTE-05 P0-19 legal and finance gate UAT | PENDING | SIGNED_UAT_READY / NO_GO / BLOCKED | `docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md` | Legal basis, tuition policy, waiver/exception decision and ALLOW_FINANCE gate proof | PHAP_CHE + KHTC + BGH | PENDING |
| UAT-ROUTE-06 P3-01/P3-02 lead lifecycle and handover UAT | PENDING | SIGNED_UAT_READY / NO_GO / BLOCKED | `docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md` | Handover cannot create finance facts or bypass P0-19/P2-05/P2-03 finance gates | TUYEN_SINH + CTHSSV + DAO_TAO + KHTC | PENDING |
| UAT-ROUTE-07 P2-17 payout duplicate and dossier UAT | PENDING | SIGNED_UAT_READY / NO_GO / BLOCKED | `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md` | Duplicate-click, overpay, voucher normalization, RPC-only and BBNT/partner-invoice dossier evidence | KHTC + BGH + Audit | PENDING |
| UAT-ROUTE-08 P2-18/P5-03 dashboard and Finance Desk browser UAT | PENDING | SIGNED_UAT_READY / NO_GO / BLOCKED | `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md`; `docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md` | Dashboard read-only behavior, source reconciliation, role denial, Finance Desk scope proof and reliance decision | KHTC + BGH + IT_DATA | PENDING |
| UAT-ROUTE-09 P6-03 audit-log traceability UAT | PENDING | SIGNED_UAT_READY / NO_GO / BLOCKED | `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md` | Trace rows with actor, entity, timestamp and controlled evidence reference | Audit + IT_DATA + KHTC | PENDING |
| UAT-ROUTE-10 P6-06 hard-delete/cascade closure proof | PENDING | SIGNED_UAT_READY / NO_GO / BLOCKED | `docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md` | Conversion proof or written waiver for unresolved protected paths | IT_DATA + Audit + business owners | PENDING |
| UAT-ROUTE-11 P0-09 final owner GO/NO-GO decision | PENDING | SIGNED_UAT_READY / NO_GO / BLOCKED | `docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md` | Final owner decision manifest with signed UAT, evidence binder, migration, backup, role, audit and risk-closure references | BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT + TRUONG_PHONG | PENDING |

PASS_LOCAL does not mean any UAT route was executed, accepted, signed,
evidence-approved, finance-approved, migration-approved or production-approved.
This tracker only gives the operator a controlled place to record signed UAT
route outcomes after human testing.

## 6. Current Decision

Result: PARTIAL PASS.

Static controls, build, lint and unauthenticated route protection pass. Signed
multi-account UAT is still required before marking permission/workspace control
DONE or moving production recommendation away from NO-GO.
