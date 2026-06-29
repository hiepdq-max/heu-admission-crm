# TTGDTX Accounting Dashboard Role UAT Plan 2026-06-27

Status: DRAFT_CONTROL
Scope: P5-01 TTGDTX accounting dashboard UAT for `/ttgdtx/accounting-dashboard`
Production status: NO-GO until signed browser UAT evidence exists

## 1. Purpose

Package the role and workspace tests required before the TTGDTX accounting
dashboard can be treated as production-ready. This plan extends
`docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md`; it does not replace the
source-data reconciliation checks in that runbook.

P5-01 is about who can see the dashboard and whether the dashboard stays
read-only. P2-18 remains IN_PROGRESS until signed UAT proves that authorized
users see correct totals and unauthorized or out-of-scope users are blocked.

## 2. Safety Boundary

Use only synthetic, redacted or approved UAT data.

Do not put real student, parent, CCCD, phone, bank account, voucher, password,
temporary password, OTP, password reset link, account activation/invite link,
credential, service key or production screenshot data into Git, Codex/chat or
public issue trackers. Tester names may be role labels such as
`UAT_KHTC_OPERATOR`, not real credentials.

The dashboard must not:

- Create receivables.
- Collect tuition.
- Issue invoice or receipt.
- Reconcile money.
- Approve payment request.
- Execute payout.
- Edit evidence.
- Mark production GO.

## 3. UAT Account Matrix

| Account label | Expected scope | Expected dashboard result |
|---|---|---|
| `UAT_ADMIN_OR_BGH_TTGDTX` | Has dashboard/report permission and TTGDTX segment scope | Can open dashboard; read-only totals are visible |
| `UAT_KHTC_TTGDTX_OPERATOR` | Has finance dashboard permission and TTGDTX segment scope | Can open dashboard; no money movement action is available |
| `UAT_TUYEN_SINH_TTGDTX` | Has lead scope but no finance dashboard permission | Blocked from unrestricted finance dashboard data |
| `UAT_PHAP_CHE_CONTRACT_ONLY` | Has contract/legal read permission but no finance dashboard permission | Blocked; contract read permission alone does not expose finance totals |
| `UAT_OUT_OF_SCOPE_STAFF` | Has no TTGDTX segment/partner finance scope | Blocked or sees empty scoped state |
| `UAT_PARTNER_VIEWER` | External/partner-like scope if enabled in UAT | Must not see HEU-wide finance totals |

Never paste account passwords, temporary passwords, OTPs, password reset links
or account activation/invite links into the evidence log.

## 4. Execution Steps

1. Confirm local build and static guards pass:
   - `npm.cmd run audit:ttgdtx-dashboard-access`
   - `npm.cmd run audit:ttgdtx-data-fetch-gate`
   - `npm.cmd run audit:ttgdtx-role-scope-access`
   - `npm.cmd run audit:ttgdtx-accounting-dashboard-uat-plan`
2. Prepare one complete synthetic TTGDTX flow with P2-03, P2-10, P2-13/P2-14,
   P2-15, P2-16 and P2-17 records.
3. Prepare one exception flow such as collected-not-reconciled,
   invoice-status-pending, approved-not-paid or over/under variance.
4. Run the account matrix above in browser.
5. For each account label, record route, expected result, actual result,
   pass/fail, sanitized screenshot/evidence path and tester role.
6. Compare dashboard totals with P2-18 source queries from
   `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md`.
7. KHTC confirms totals. Audit or IT/Data confirms read-only, role scope and
   evidence redaction.

## 5. Evidence Template

| Field | Required value |
|---|---|
| Evidence id | Stable id such as `P5-01-ROLE-001` |
| Date | UAT date |
| Tester role | Role label, not password or private account detail |
| Account label | One label from the account matrix |
| Route | `/ttgdtx/accounting-dashboard` |
| Expected result | Can open, blocked or empty scoped state |
| Actual result | What happened in browser |
| Source comparison | Summary/control-board source check result |
| Screenshot/evidence | Sanitized local or Drive evidence link |
| Verdict | PASS, FAIL or BLOCKED |
| Owner decision | KHTC/Audit/IT-Data human note |

## 6. Stop Conditions

Stop UAT and fix before continuing if:

1. A contract-only or out-of-scope user can see unrestricted finance totals.
2. Dashboard data is queried before the role/scope gate.
3. The dashboard exposes create, update, approve, pay or delete controls.
4. Real passwords, temporary passwords, OTPs, password reset links,
   account activation/invite links, CCCD, bank data or student private data appears in
   screenshots, Git, Codex/chat or evidence notes.
5. A completed flow total differs from P2-03/P2-10/P2-13/P2-17 source data
   without a documented exception.
6. Any `CRITICAL` dashboard control row is unexplained.

## 7. Current Result

P5-01 is PASS_LOCAL as a UAT plan and static guard package only. The dashboard
is not production-approved. Signed UAT evidence is still required before P2-18
or P5-01 can support a production Go decision.
