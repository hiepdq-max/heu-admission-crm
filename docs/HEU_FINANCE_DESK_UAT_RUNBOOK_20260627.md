# HEU Finance Desk UAT Runbook 2026-06-27

Status: PASS_LOCAL_TEMPLATE
Scope: P5-03 HEU Finance Desk read-only cockpit
Route: `/finance-desk`
Production status: NO-GO until signed UAT, backup/restore evidence, migration
approval and owner Go/No-Go exist outside Codex/chat.

## 1. Purpose

This runbook verifies that HEU Finance Desk is only a scoped, read-only KHTC/BGH
cockpit over TTGDTX finance facts. It does not approve payment, create
accounting vouchers, replace statutory accounting software, initiate bank
transfers, accept UAT or mark production GO.

## 2. No-Secret Boundary

Use synthetic or redacted UAT accounts only. Do not paste passwords, OTPs,
reset links, service-role keys, API keys, bank credentials, raw CCCD, raw phone
numbers, raw student PII, raw bank account numbers, bank statements, vouchers
or raw payment evidence into Git, Codex/chat or this runbook.

Evidence should contain only controlled references, masked screenshots, role
labels, route names, result status and owner notes.

## 3. Required Preflight

Run these local checks before browser UAT:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run audit:heu-finance-desk
npm.cmd run audit:ttgdtx-dashboard-source-reconciliation
npm.cmd run audit:ttgdtx-data-fetch-gate
npm.cmd run audit:heu-role-scope-uat-pack
npm.cmd run audit:ttgdtx-release-gates
```

Do not run `database/step111_heu_finance_desk.sql` on production from
Codex/chat. Step111 is a migration candidate only.

## 4. UAT Accounts

| Role label | Required setup | Expected result |
|---|---|---|
| `UAT_ADMIN` | Admin role | Can open `/finance-desk`; no direct write form appears |
| `UAT_BGH` | BGH role | Can open read-only cockpit |
| `UAT_KHTC_TTGDTX_OPERATOR` | Finance permission and TTGDTX segment scope | Can open and compare finance indicators |
| `UAT_AUDIT` | Audit/report permission and TTGDTX segment scope | Can inspect read-only indicators |
| `UAT_CONTRACT_ONLY` | Contract read only, no finance/report/import/source permission | Must be blocked from Finance Desk totals |
| `UAT_OUT_OF_SCOPE_STAFF` | Finance-like role without TTGDTX segment scope | Must be blocked or shown the no-access state |

Never record real account passwords or reset links.

## 5. Browser Test Matrix

| Case | User | Steps | Expected evidence |
|---|---|---|---|
| P5-03-UAT-01 | `UAT_KHTC_TTGDTX_OPERATOR` | Open `/finance-desk`; confirm KPIs load | Route opens with receivable, collection, remaining-to-pay and issue KPIs |
| P5-03-UAT-02 | `UAT_BGH` | Open `/finance-desk`; inspect controls | Cockpit is read-only; no approve, pay, import-write or source-edit form appears inside the route |
| P5-03-UAT-03 | `UAT_CONTRACT_ONLY` | Open `/finance-desk` | User is blocked from finance totals; contract read alone is insufficient |
| P5-03-UAT-04 | `UAT_OUT_OF_SCOPE_STAFF` | Open `/finance-desk` | User is blocked or sees no-access state because TTGDTX scope is missing |
| P5-03-UAT-05 | `UAT_KHTC_TTGDTX_OPERATOR` | Compare summary with `/ttgdtx/accounting-dashboard` | VND totals match controlled P2-18 source within documented rounding rules |
| P5-03-UAT-06 | `UAT_KHTC_TTGDTX_OPERATOR` | Compare import section with `/ttgdtx/import` | Batch status, issue counts and source file names match the import readiness view |
| P5-03-UAT-07 | `UAT_AUDIT` | Compare source section with `/ttgdtx/source-control` | Source count, checked count and warning/fail counts match controlled source evidence |
| P5-03-UAT-08 | `UAT_KHTC_TTGDTX_OPERATOR` | Review money display | VND values render through the shared formatter, for example `1.000.000 đ` |
| P5-03-UAT-09 | `UAT_ADMIN` | Inspect action links | Links route back to source P2 screens; Finance Desk itself does not mutate finance facts |

## 6. Source Reconciliation Notes

Finance Desk must be reconciled to these controlled sources:

- `ttgdtx_accounting_dashboard_summary`
- `ttgdtx_accounting_dashboard_control_board`
- `ttgdtx_tuition_import_batch_readiness`
- `ttgdtx_p2_11_summary`

If any total differs, mark the case `FAIL` or `BLOCKED`; do not manually adjust
Finance Desk output. Correction must happen in the source P2 workflow with audit
trail.

## 7. Acceptance Matrix

| Acceptance ID | Requirement | PASS condition | STOP condition |
|---|---|---|---|
| P5-03-ACCEPT-01 | Access control | Authorized scoped roles can open, contract-only/out-of-scope users cannot see totals | Any out-of-scope user sees finance totals |
| P5-03-ACCEPT-02 | Read-only behavior | No direct create/update/approve/pay/import-write form exists inside `/finance-desk` | Route can approve, pay, unlock, import-write or edit source data |
| P5-03-ACCEPT-03 | Source consistency | KPIs reconcile to P2-18, import and source-control views | Any material mismatch lacks an owner note |
| P5-03-ACCEPT-04 | Money format | VND values use the shared `lib/vnd-money.ts` display | Money appears as raw number, wrong separator or ASCII `d` suffix |
| P5-03-ACCEPT-05 | Evidence hygiene | Evidence is masked, controlled and references approved storage only | Raw PII, bank, password, voucher or payment evidence is pasted into Git/Codex/chat |
| P5-03-ACCEPT-06 | Production boundary | Owners record signed PASS/FAIL/BLOCKED outside Codex/chat | Anyone treats PASS_LOCAL as production approval |

## 8. Evidence Log Template

| Case | Tester role | Result | Controlled evidence reference | Owner note |
|---|---|---|---|---|
| P5-03-UAT-01 |  | PENDING |  |  |
| P5-03-UAT-02 |  | PENDING |  |  |
| P5-03-UAT-03 |  | PENDING |  |  |
| P5-03-UAT-04 |  | PENDING |  |  |
| P5-03-UAT-05 |  | PENDING |  |  |
| P5-03-UAT-06 |  | PENDING |  |  |
| P5-03-UAT-07 |  | PENDING |  |  |
| P5-03-UAT-08 |  | PENDING |  |  |
| P5-03-UAT-09 |  | PENDING |  |  |

## 9. Owner Sign-Off

| Owner | Decision | Evidence reference | Date |
|---|---|---|---|
| KHTC | GO / NO-GO / BLOCKED |  |  |
| BGH | GO / NO-GO / BLOCKED |  |  |
| IT_DATA | GO / NO-GO / BLOCKED |  |  |
| AUDIT | GO / NO-GO / BLOCKED |  |  |

Final result remains NO-GO until all required owners sign, all stop conditions
are closed and final owner Go/No-Go is recorded outside Codex/chat.
