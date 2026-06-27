# TTGDTX Period Lock And Adjustment Policy 2026-06-27

Status: DRAFT_CONTROL
Scope: P2-13 reconciliation, P2-14 review/approval/lock, P2-15 payment request
Production status: NO-GO until signed UAT and human approval

## 1. Purpose

Define the minimum rule for locked TTGDTX reconciliation periods. Once a period
is approved and locked, HEU must preserve the historical basis for payment,
dashboard reporting and audit.

## 2. Lock Rule

A reconciliation period can be locked only when:

1. P2-10 collection receipt/voucher evidence is present.
2. Invoice/chung-tu status is resolved or explicitly waived by authority.
3. P2-13 reconciliation lines are complete and reviewed.
4. P2-14 checker/approver are human authorized users.
5. Required BBNT or partner-invoice prerequisites are not bypassed.

After lock:

- Do not edit locked lines directly.
- Do not hard-delete locked batches, lines, payment requests or evidence.
- Do not let AI unlock, approve, pay, mark revenue or mark go-live.
- Do not create P2-15 payment request from an unlocked or reopened period.

## 3. Adjustment Rule

If a locked period needs correction, use an adjustment workflow:

| Step | Requirement |
|---|---|
| Request | Human creates adjustment request with reason, affected period and evidence |
| Check | KHTC/Audit checks amount, receipt, invoice/chung-tu and BBNT impact |
| Approve | Authorized approver approves or rejects the adjustment |
| Apply | System records additive adjustment lines or a controlled reversal, not silent overwrite |
| Audit | Original locked values, new values, actor, time and evidence link remain traceable |

Allowed adjustment types:

- `RECEIPT_CORRECTION`
- `INVOICE_STATUS_CORRECTION`
- `STUDENT_STATUS_CORRECTION`
- `BBNT_AMOUNT_CORRECTION`
- `PARTNER_PAYMENT_HOLD`
- `PARTNER_PAYMENT_RELEASE`

## 4. Reopen Rule

Reopening a locked period is exceptional. It requires:

1. Written reason.
2. Evidence link.
3. KHTC approval.
4. Audit or BGH approval for high-risk amount/payment impact.
5. A new lock event after correction.

Reopen must not be used to erase an earlier approval. It only creates an
auditable correction path.

## 5. Stop Conditions

Stop implementation/UAT and fix before continuing if:

1. Locked reconciliation rows can be edited directly.
2. A payment request can be created from an unlocked or reopened period.
3. A locked batch or line can be hard-deleted.
4. AI can approve, reopen, adjust, pay or mark revenue.
5. Adjustment evidence is optional for finance-impacting changes.

## 6. Current Evidence

Current local evidence:

- `docs/P2_13_RECONCILIATION_REPAIR_SAFETY_UAT_RUNBOOK.md`
- `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md`
- `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md`
- `npm.cmd run audit:ttgdtx-reconciliation-repair-safety`
- `npm.cmd run audit:ttgdtx-audit-log`
- `npm.cmd run audit:hard-delete`

## 7. Current Result

P4-05 is PASS_LOCAL as a policy/control guard. It does not approve production
migration or production finance operation. Signed UAT must still prove locked
period behavior, adjustment evidence and role/scope controls.
