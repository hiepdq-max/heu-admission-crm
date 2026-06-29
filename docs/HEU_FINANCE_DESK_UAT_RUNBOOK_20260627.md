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

Use synthetic or redacted UAT accounts only. Do not paste passwords, temporary
passwords, OTPs, password reset links, account activation/invite links,
service-role keys, API keys, bank credentials, raw CCCD, raw phone numbers, raw
student PII, raw bank account numbers, bank statements, vouchers or raw payment
evidence into Git, Codex/chat or this runbook.

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

The `/finance-desk` page mounts
`components/finance/finance-desk-uat-evidence-checklist.tsx` with
`data-finance-desk-uat-evidence-checklist="P5-03"`, P5-03-UAT-01 through
P5-03-UAT-09, `data-finance-desk-acceptance-matrix="P5-03"` and
P5-03-ACCEPT-01 through P5-03-ACCEPT-06 so the browser UAT evidence pack is
visible inside the cockpit before any owner reliance decision.

The same checklist also exposes
`data-finance-desk-immediate-stop="P5-03"` with P5-03-STOP-01 through
P5-03-STOP-05 and decision value `P5_03_STOP_CHECK / GO_NEXT / BLOCKED`.
Use this guard before recording any reliance decision.

The same checklist exposes
`data-finance-desk-real-user-evidence-bridge="P5-03-P6-04"` with
P5-03-REAL-01 through P5-03-REAL-05 and decision value
`P5_03_REAL_USER_READY / NO_GO / BLOCKED`. It requires the P6-04 real
accounting user queue and result template before Finance Desk reliance.

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

## 7. Real Accounting User Evidence Bridge

Before KHTC/BGH rely on Finance Desk, the UAT pack must cite:

- `data-heu-real-accounting-user-uat-queue="P6-04-P2-18-P5-03"`
- `data-heu-real-accounting-user-result-template="P6-04-P2-18-P5-03"`

| Case | Required proof | Stop condition |
|---|---|---|
| P5-03-REAL-01 | REAL-ACC-01 through REAL-ACC-06 are recorded with controlled evidence IDs | P6-04 queue/result template is missing, unsigned or stored in Git/Codex/chat |
| P5-03-REAL-02 | KHTC opens Finance Desk only inside assigned TTGDTX scope and compares dashboard/import/source-control totals | KHTC sees unrestricted totals, source evidence outside assigned scope, payment execution or edit actions |
| P5-03-REAL-03 | BGH reviews Finance Desk indicators and reliance blockers without write, approval, pay or production GO controls | BGH can mutate finance facts, approve payment, see hidden raw evidence or trigger production GO |
| P5-03-REAL-04 | Audit and Phap Che review trace/legal context without raw secrets or unrestricted finance totals | Audit/legal review exposes raw secrets, private contracts beyond scope, unrestricted totals or money movement |
| P5-03-REAL-05 | Out-of-scope account returns `BLOCKED` or `EMPTY_SCOPED_STATE` for Finance Desk totals and action links | Any unrestricted TTGDTX finance, lead, source, dashboard, audit or settings data is visible |

Do not paste real passwords, temporary passwords, OTPs, password reset links,
account activation/invite links, service-role keys, raw PII, CCCD, bank data,
vouchers or screenshots with secrets into Finance Desk evidence.

## 8. Acceptance Matrix

| Acceptance ID | Requirement | PASS condition | STOP condition |
|---|---|---|---|
| P5-03-ACCEPT-01 | Access control | Authorized scoped roles can open, contract-only/out-of-scope users cannot see totals | Any out-of-scope user sees finance totals |
| P5-03-ACCEPT-02 | Read-only behavior | No direct create/update/approve/pay/import-write form exists inside `/finance-desk` | Route can approve, pay, unlock, import-write or edit source data |
| P5-03-ACCEPT-03 | Source consistency | KPIs reconcile to P2-18, import and source-control views | Any material mismatch lacks an owner note |
| P5-03-ACCEPT-04 | Money format | VND values use the shared `lib/vnd-money.ts` display | Money appears as raw number, wrong separator or ASCII `d` suffix |
| P5-03-ACCEPT-05 | Evidence hygiene | Evidence is masked, controlled and references approved storage only | Raw PII, bank, password, temporary password, account activation/invite link, voucher or payment evidence is pasted into Git/Codex/chat |
| P5-03-ACCEPT-06 | Production boundary | Owners record signed PASS/FAIL/BLOCKED outside Codex/chat | Anyone treats PASS_LOCAL as production approval |

## 9. Finance Desk Reliance Decision Manifest

Immediate stop guard: do not proceed to owner reliance when Finance Desk totals
are used for statutory accounting, voucher posting, finance approval or bank
transfer instruction; when signed browser UAT, source reconciliation,
workspace-scope denial or owner reliance decision is missing; when
contract-only/out-of-scope users can see totals; when dashboard/import/source
totals differ without owner notes; or when raw PII, CCCD, bank data, vouchers,
payment evidence, passwords, temporary passwords, OTPs, password reset links,
account activation/invite links or service-role keys appear in evidence.

Decision value: `P5_03_RELIANCE_READY / NO_GO / BLOCKED`

Run this decision manifest only after the browser matrix and acceptance matrix
have controlled evidence. It prepares a human reliance decision only and does
not approve finance action, statutory accounting, voucher posting, bank
transfer, UAT acceptance, dashboard production reliance, owner waiver or
production GO.

| Reliance ID | Required decision evidence | STOP condition |
|---|---|---|
| P5-03-REL-01 | Authorized scoped access accepted: KHTC/BGH/AUDIT/Admin can open only within TTGDTX scope; contract-only and out-of-scope users are denied | Any out-of-scope or contract-only user sees finance totals |
| P5-03-REL-02 | Read-only surface accepted: no create, change, approve, pay, import-write or source-edit action exists inside `/finance-desk` | Finance Desk can approve, pay, unlock, import-write, mutate source data or issue a bank instruction |
| P5-03-REL-03 | Source reconciliation accepted: KPIs reconcile to P2-18 dashboard, import readiness, source-control summary and VND formatting | Any material mismatch lacks owner note or cannot be traced to source P2 workflow |
| P5-03-REL-04 | Evidence hygiene accepted: evidence uses masked screenshots and controlled references only | Raw PII, bank data, voucher, payment evidence, passwords, temporary passwords, account activation/invite links or keys appear in Git/Codex/chat |
| P5-03-REL-05 | Finance reliance boundary accepted: owners record that Finance Desk is advisory/read-only and corrections must happen in source P2 workflows | PASS_LOCAL is treated as statutory accounting, finance posting, voucher approval, bank transfer instruction or dashboard production reliance |
| P5-03-REL-06 | Human reliance decision recorded: KHTC, BGH, IT_DATA and AUDIT record RELIANCE_READY/NO_GO/BLOCKED with signer, date and controlled evidence refs | Missing decision ID, unsigned owner, unresolved source mismatch, uncontrolled evidence or open UAT stop condition remains |

## 10. Evidence Log Template

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

## 11. Owner Sign-Off

| Owner | Decision | Evidence reference | Date |
|---|---|---|---|
| KHTC | GO / NO-GO / BLOCKED |  |  |
| BGH | GO / NO-GO / BLOCKED |  |  |
| IT_DATA | GO / NO-GO / BLOCKED |  |  |
| AUDIT | GO / NO-GO / BLOCKED |  |  |

Final result remains NO-GO until all required owners sign, all stop conditions
from P5-03-ACCEPT-01 through P5-03-ACCEPT-06 and P5-03-REL-01 through
P5-03-REL-06 are closed and final owner Go/No-Go is recorded outside
Codex/chat.
