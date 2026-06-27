# TTGDTX Receivable And Payment Status Lifecycle Policy 2026-06-27

Status: DRAFT_CONTROL
Scope: P4-01 receivable/payment status lifecycle for the TTGDTX 9+ pilot chain
Production status: NO-GO until signed finance UAT and human owner approval

## 1. Purpose

Define the minimum lifecycle rule for TTGDTX receivables, collections,
reconciliation batches, partner payment requests and payout records. The goal
is to stop finance records from jumping across workflow stages without source
evidence, role/scope control, audit trail and human approval.

This policy is a control artifact. It does not approve production migration,
real-data import, production finance operation, revenue recognition or payout
execution.

## 2. Lifecycle Chain

| Stage | Source object | Status field | Controlled statuses |
|---|---|---|---|
| P2-03 Receivable | `ttgdtx_student_receivables` | `receivable_status` | `DRAFT`, `PENDING_COLLECTION`, `PARTIAL`, `PAID`, `OVERDUE`, `WAIVED`, `CANCELLED` |
| P2-03 Collection rollup | `ttgdtx_student_receivables` | `collection_status` | `NOT_COLLECTED`, `PARTIAL`, `COLLECTED`, `WAIVED`, `CANCELLED` |
| P2-10 Collection payment | `ttgdtx_tuition_payments` | `payment_status` | `DRAFT`, `POSTED`, `REVERSED`, `CANCELLED` |
| P2-10 Invoice/chung-tu | `ttgdtx_tuition_payments` | `invoice_required`, `invoice_status` | `REQUIRED`, `NOT_REQUIRED`, `PENDING_POLICY`, `WAIVED_BY_AUTHORITY`; `NOT_STARTED`, `PENDING`, `ISSUED`, `CANCELLED`, `REPLACED`, `WAIVED`, `NOT_REQUIRED` |
| P2-13/P2-14 Reconciliation | `ttgdtx_tuition_reconciliation_batches` | `reconciliation_status` | `DRAFT`, `READY_FOR_REVIEW`, `REVIEWED`, `APPROVED`, `LOCKED`, `CANCELLED` |
| P2-13 Reconciliation line | `ttgdtx_tuition_reconciliation_lines` | `line_status` | `READY`, `BLOCKED`, `IN_BATCH`, `REVIEWED`, `EXCLUDED`, `CANCELLED` |
| P2-15/P2-16 Payment request | `ttgdtx_partner_payment_requests` | `request_status` | `SUBMITTED`, `CHECKED`, `APPROVED`, `REJECTED`, `CANCELLED`, `PAID` |
| P2-17 Payout record | `ttgdtx_partner_payment_disbursements` | `payment_status` | `POSTED`, `CANCELLED` |

## 3. Transition Rules

| Transition | Required control |
|---|---|
| Lead/gate to receivable | P0-19, P2-01, P2-02 and P2-05 must pass before P2-03 creates a receivable |
| Receivable to posted collection | P2-10 payment must reference active receivable, amount must not exceed payable balance and invoice/chung-tu decision must be captured |
| Posted collection to reconciliation | Only `POSTED` P2-10 payments can enter P2-13; unresolved invoice/chung-tu decisions block reconciliation |
| Reconciliation to locked period | P2-14 must move `READY_FOR_REVIEW -> REVIEWED -> APPROVED -> LOCKED` through the review function, not direct edits |
| Locked period to partner payment request | P2-15 can create request only from a locked reconciliation period and complete BBNT/partner-invoice dossier gates |
| Payment request to approved | P2-16 must move `SUBMITTED -> CHECKED -> APPROVED`; reject/cancel must be explicit and audited |
| Approved request to payout | P2-17 can record payout only from `APPROVED`, with required evidence, non-empty voucher and no duplicate voucher |
| Partial payout | P2-17 may keep request `APPROVED` while remaining amount exists; full payout moves request to `PAID` |

## 4. Stop Conditions

Stop implementation/UAT and fix before continuing if:

1. Receivable `paid_amount_vnd` can exceed payable amount.
2. A `CANCELLED` or `WAIVED` receivable can receive a new posted payment.
3. P2-10 can post collection without an invoice/chung-tu decision path.
4. A payment with `payment_status <> POSTED` can enter reconciliation.
5. A reconciliation batch can be locked with unresolved invoice/chung-tu rows.
6. P2-15 can create payment request from an unlocked reconciliation period.
7. P2-16 can approve without a prior CHECK step.
8. P2-17 can pay a non-`APPROVED` request, overpay, reuse voucher number or pay without evidence.
9. Finance rows can be hard-deleted instead of reversed, cancelled, waived or adjusted with audit.
10. AI can approve, pay, mark revenue, reverse, cancel, lock or mark production GO.

## 5. Evidence And Audit Requirements

Every finance-impacting transition must retain:

- Actor and department.
- Timestamp.
- Previous status and next status.
- Source document or evidence link.
- Reason for reject, cancel, reverse, waive or adjustment.
- Role/scope context.
- Audit log or business activity trail.

Locked-period corrections must follow
`docs/TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627.md` and use additive
adjustment or controlled reversal, not silent overwrite.

## 6. Current Evidence

Current local evidence:

- `database/step90_ttgdtx_student_receivables.sql`
- `database/step96_ttgdtx_tuition_collection_p2_10.sql`
- `database/step101_ttgdtx_reconciliation_p2_13.sql`
- `database/step104_ttgdtx_reconciliation_approval_p2_14.sql`
- `database/step105_ttgdtx_partner_payment_request_p2_15.sql`
- `database/step106_ttgdtx_payment_request_approval_p2_16.sql`
- `database/step107_ttgdtx_payment_execution_p2_17.sql`
- `docs/TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627.md`
- `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md`
- `npm.cmd run audit:ttgdtx-receivable-payment-lifecycle`
- `npm.cmd run audit:ttgdtx-period-lock-policy`
- `npm.cmd run audit:hard-delete`

## 7. Current Result

P4-01 is PASS_LOCAL as a lifecycle/control artifact. It does not approve
production migration, production finance operation, real-data import, revenue
recognition or payout execution. Signed finance UAT must still prove each
transition, negative case, evidence rule and role/scope boundary.
