# TTGDTX Role And Workspace Scope UAT Runbook

Status: DRAFT_CONTROL
Date: 2026-06-25
Scope: TTGDTX 9+ pilot app routes and Step109 role-permission behavior
Mode: UAT/staging only. This document does not approve production access.

## 1. Purpose

This runbook verifies that TTGDTX pages require both:

1. A valid business permission for the page.
2. A valid TTGDTX workspace scope, unless the user is ADMIN or BGH.

It prevents a user from seeing finance, import, reconciliation, payment or
dashboard data only because they have a broad workspace assignment.

## 2. Hard Rules

- Do not test with real passwords, OTPs, service keys or bank credentials.
- Do not use real student, parent, CCCD or bank data in screenshots.
- Do not grant broad permissions only to make a test pass.
- Do not mark production GO from this runbook. Update the production checklist
  only after human owners review evidence.

## 3. Static Preflight

Run these before browser UAT:

```powershell
npm.cmd run audit:permission-soft-revoke
npm.cmd run audit:ttgdtx-role-scope-access
npm.cmd run audit:ttgdtx-dashboard-access
npm.cmd run audit:ttgdtx-data-fetch-gate
npm.cmd run audit:ttgdtx-uat-readiness
```

All five commands must pass before signed UAT.

## 4. Test Accounts

Create or select synthetic UAT accounts only:

Use `docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md` before browser testing. Do not
send real passwords into Codex/chat.
Use `docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md` as the route/account execution
matrix.

| Account | Role/permission | Workspace scope | Expected result |
|---|---|---|---|
| UAT_ADMIN | ADMIN | Any | Can open all TTGDTX pages |
| UAT_BGH | BGH/report viewer | Any | Can open dashboards/read views, not daily entry unless explicitly allowed |
| UAT_KHTC | Finance permissions | TTGDTX segment | Can open finance pages in TTGDTX scope |
| UAT_TUYEN_SINH | Admission permissions only | TTGDTX segment | Cannot open finance/payment pages |
| UAT_PHAP_CHE | Contract/legal permissions only | TTGDTX segment | Can open contract/source pages only; cannot open finance dashboard totals |
| UAT_OUT_OF_SCOPE | Finance permission | No TTGDTX segment scope | Cannot open scoped TTGDTX data |

## 5. Route Matrix

| Route | Required non-admin permission | Scope required | Must block |
|---|---|---|---|
| `/ttgdtx` | `ttgdtx.contract.read` | YES | Users without contract/legal permission |
| `/ttgdtx/tuition` | `ttgdtx.tuition.read` | YES | Contract-only users without tuition permission |
| `/ttgdtx/gate` | `ttgdtx.receivable.read` | YES | Admission-only users without receivable permission |
| `/ttgdtx/receivables` | `ttgdtx.receivable.read` | YES | Admission-only users |
| `/ttgdtx/payments` | `ttgdtx.collection.read` or `ttgdtx.receivable.read` | YES | Contract-only users |
| `/ttgdtx/reconciliation` | `ttgdtx.reconciliation.read` or `ttgdtx.collection.read` | YES | Receivable-only users if not allowed |
| `/ttgdtx/reconciliation/review` | `ttgdtx.reconciliation.read` or `ttgdtx.collection.read` | YES | Collection users without review policy if business disallows |
| `/ttgdtx/payment-requests` | `ttgdtx.payment_request.read` or `ttgdtx.reconciliation.read` | YES | Collection-only users |
| `/ttgdtx/payment-requests/review` | `ttgdtx.payment_request.manage`, `ttgdtx.payment_request.approve` or `payments.approve` | YES | Payment-read-only users |
| `/ttgdtx/payment-requests/pay` | `ttgdtx.payment_request.manage`, `ttgdtx.payment_request.pay` or `payments.pay` | YES | Approver without pay permission |
| `/ttgdtx/accounting-dashboard` | `ttgdtx.report.read`, `reports.read`, `reports.read_scope`, `audit.read` or payment manage | YES | Contract-only users |
| `/ttgdtx/import` | `ttgdtx.import.read` | YES | Finance users without import permission |
| `/ttgdtx/import/issues` | `ttgdtx.import.issue.read` | YES | Import users without issue permission |
| `/ttgdtx/import/workload` | `ttgdtx.department.task.read` or `ttgdtx.import.issue.read` | YES | Users without task/issue permission |
| `/ttgdtx/master` | `ttgdtx.master.read` | YES or partner scope | Users without master permission |
| `/ttgdtx/source-control` | `ttgdtx.source.read` | YES | Users without source permission |
| `/ttgdtx/simulation` | Contract, tuition or receivable read permission | YES | Users without any TTGDTX business read permission |

## 6. Evidence To Capture

For each account:

1. User email or synthetic ID.
2. Role code.
3. Active permissions.
4. Active TTGDTX segment scope.
5. Route opened.
6. Result: ALLOWED or BLOCKED.
7. Screenshot with sensitive data redacted.
8. Notes for any unexpected result.

## 7. Sign-Off Rule

Mark role/workspace permission control DONE only when:

1. Static preflight passes.
2. ADMIN and BGH expected access is confirmed.
3. KHTC can do finance work only inside allowed scope.
4. Admission-only, contract-only and out-of-scope users are blocked from
   finance/payment/dashboard data.
5. Step109 soft-revoke UAT is complete.
6. IT_DATA and the responsible owner sign the production checklist.
