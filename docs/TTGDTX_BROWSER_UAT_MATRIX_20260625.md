# TTGDTX Browser UAT Matrix 2026-06-25

Status: DRAFT_CONTROL
Mode: UAT/staging only. This matrix does not approve production access.

## 1. Purpose

Use this matrix after completing
`docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md`. Log in with one synthetic account
at a time, open every route, and record the observed result in
`docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md` or the signed UAT evidence pack.

Do not send real passwords into Codex/chat. Do not use real student, bank or
staff private data in screenshots.

## 2. Result Codes

| Code | Meaning |
|---|---|
| `MANAGE` | Route opens and expected workflow buttons are available only when business state allows them |
| `READ_ONLY` | Route opens but create/approve/pay controls must be hidden or disabled |
| `LIMITED_READ` | Route opens but only the data categories allowed by that role should be populated |
| `BLOCK` | Route must show a permission/scope block or redirect to `/login` |

## 3. Account Matrix

| Route | UAT_ADMIN | UAT_BGH | UAT_KHTC | UAT_TUYEN_SINH | UAT_PHAP_CHE | UAT_OUT_OF_SCOPE |
|---|---|---|---|---|---|---|
| `/ttgdtx` | MANAGE | READ_ONLY | LIMITED_READ | LIMITED_READ | LIMITED_READ | BLOCK |
| `/ttgdtx/tuition` | MANAGE | READ_ONLY | MANAGE | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/gate` | MANAGE | READ_ONLY | MANAGE | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/receivables` | MANAGE | READ_ONLY | MANAGE | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/payments` | MANAGE | READ_ONLY | MANAGE | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/reconciliation` | MANAGE | MANAGE | MANAGE | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/reconciliation/review` | MANAGE | MANAGE | MANAGE | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/payment-requests` | MANAGE | MANAGE | MANAGE | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/payment-requests/review` | MANAGE | MANAGE | MANAGE | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/payment-requests/pay` | MANAGE | MANAGE | MANAGE | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/accounting-dashboard` | READ_ONLY | READ_ONLY | READ_ONLY | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/import` | MANAGE | READ_ONLY | MANAGE | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/import/issues` | MANAGE | READ_ONLY | MANAGE | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/import/workload` | MANAGE | READ_ONLY | MANAGE | BLOCK | BLOCK | BLOCK |
| `/ttgdtx/master` | MANAGE | READ_ONLY | LIMITED_READ | LIMITED_READ | LIMITED_READ | BLOCK |
| `/ttgdtx/source-control` | MANAGE | READ_ONLY | LIMITED_READ | LIMITED_READ | LIMITED_READ | BLOCK |
| `/ttgdtx/simulation` | LIMITED_READ | LIMITED_READ | LIMITED_READ | LIMITED_READ | LIMITED_READ | BLOCK |

## 4. Simulation-Specific Checks

`/ttgdtx/simulation` must not become a shortcut around business permissions.

| Permission available | Contract panel | Tuition policy panel | Receivable/candidate panel |
|---|---|---|---|
| `ttgdtx.contract.read` only | Visible/populated | Empty or blocked | Empty or blocked |
| `ttgdtx.tuition.read` only | Empty or blocked | Visible/populated | Empty or blocked |
| `ttgdtx.receivable.read` only | Empty or blocked | Empty or blocked | Visible/populated |
| ADMIN or BGH | Visible/populated | Visible/populated | Visible/populated |

## 5. Evidence Columns

For each route/account pair, capture:

1. Synthetic account ID.
2. Route.
3. Expected code from the matrix.
4. Actual result.
5. Screenshot or browser note.
6. Any unexpected visible finance/student/private data.
7. Tester initials and date.

## 6. Stop Conditions

Stop UAT and fix before continuing if any of these occur:

1. `UAT_OUT_OF_SCOPE` can see scoped TTGDTX data.
2. `UAT_TUYEN_SINH` can see finance/payment/dashboard data.
3. `UAT_PHAP_CHE` can see finance/payment/dashboard data without an explicit
   finance permission.
4. `/ttgdtx/simulation` shows tuition or receivable data to a contract-only
   account.
5. A button allows create, approve, pay or cancel outside the expected role.
