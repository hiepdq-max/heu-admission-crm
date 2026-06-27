# P2-18 Accounting Dashboard UAT Runbook

## 1. Purpose

This runbook verifies that the TTGDTX P2-18 accounting dashboard loads, stays
read-only, and matches source records from P2-03, P2-10, P2-13/P2-14, P2-15,
P2-16 and P2-17.

Production remains NO-GO until this runbook is executed with UAT data and
signed off by IT Data, KHTC and Audit.

## 2. Scope

- Route: `/ttgdtx/accounting-dashboard`.
- SQL: `database/step108_ttgdtx_accounting_dashboard_p2_18.sql`.
- Core views:
  - `ttgdtx_accounting_dashboard_summary`
  - `ttgdtx_accounting_dashboard_partner_board`
  - `ttgdtx_accounting_dashboard_control_board`
  - `ttgdtx_accounting_dashboard_exception_board`
  - `ttgdtx_accounting_dashboard_recent_movements`
- Evidence class: accounting dashboard screenshots, UAT export and audit
  evidence only. Do not mix these with legal contract files or registry indexes.

## 3. Preconditions

1. Use a non-production database or controlled UAT dataset.
2. Run Step90 through Step108 in the approved migration order after backup.
3. Run Step109 only if the UAT scope includes role permission soft revoke.
4. Log in as at least three users:
   - ADMIN or BGH viewer.
   - KHTC operator.
   - User outside the TTGDTX finance scope.
5. Prepare at least one complete TTGDTX partner flow with P2-03, P2-10,
   P2-13/P2-14, P2-15, P2-16 and P2-17 records.
6. Prepare one exception flow, such as collected tuition not yet reconciled or
   approved payout not yet disbursed.

## 4. Test Matrix

| Case | Action | Expected result |
|---|---|---|
| P2-18-01 | Open `/ttgdtx/accounting-dashboard` as authorized BGH/KHTC | Page loads without runtime error |
| P2-18-02 | Compare summary KPI with source P2-03/P2-10/P2-13/P2-17 records | Totals match approved source records |
| P2-18-03 | Review `Kiem soat khop so` section | PASS rows show zero variance; REVIEW/CRITICAL rows point to the correct source step |
| P2-18-04 | Open as user outside finance/report scope | Dashboard is blocked or scoped according to role/workspace rules |
| P2-18-05 | Open as legal/contract-only user without finance/report permission | Dashboard remains blocked; contract read permission alone does not expose finance totals |
| P2-18-06 | Click action from an exception row | User lands on the correct source workflow, not an edit-in-dashboard screen |
| P2-18-07 | Review recent movements | Movement labels and evidence links reflect P2-10, P2-13, P2-15 and P2-17 |
| P2-18-08 | Confirm dashboard has no write form for money movement | No create/update/pay approval is possible from P2-18 |

## 5. Local Read-Only Guard Evidence

Before signed browser UAT, the repo must keep local guard evidence green:

- `components/ttgdtx/ttgdtx-dashboard-readonly-guard.tsx` shows the P2-18
  read-only, source-comparison and role-scope guard on the dashboard.
- `components/ttgdtx/ttgdtx-dashboard-uat-evidence-checklist.tsx` shows the
  required redacted evidence set for P2-18-01 through P2-18-08 and references
  `docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md`.
- `components/ttgdtx/ttgdtx-dashboard-source-reconciliation-checklist.tsx`
  shows the source reconciliation checklist for P2-03, P2-10,
  P2-13/P2-14, P2-15/P2-16, P2-17 and P2-19 evidence metadata.
- `app/ttgdtx/accounting-dashboard/page.tsx` mounts the guard and only queries
  dashboard views after `canOpen` is true.
- `scripts/audit-ttgdtx-dashboard-access.mjs` confirms contract-only permission
  is not used as finance-dashboard access.
- `npm.cmd run audit:ttgdtx-dashboard-readonly-guard` must pass.
- `npm.cmd run audit:ttgdtx-dashboard-source-reconciliation` must pass.

This local evidence does not replace signed browser UAT. It only proves the
dashboard guard is packaged before the UAT team executes the matrix above.

## 6. Evidence Queries

Use these only against UAT/test data.

```sql
select *
from public.ttgdtx_accounting_dashboard_control_board
order by sort_order;
```

Expected: all intentional completed flows are `PASS`; open workflow items are
`REVIEW`; any `CRITICAL` row must be investigated before production.

```sql
select
  sum(receivable_paid_vnd) as p2_03_paid,
  sum(collected_total_vnd) as p2_10_collected,
  sum(locked_reconciled_total_vnd) as p2_13_locked,
  sum(approved_total_vnd) as p2_16_approved,
  sum(request_paid_total_vnd) as p2_15_paid_marker,
  sum(disbursed_total_vnd) as p2_17_disbursed
from public.ttgdtx_accounting_dashboard_partner_board;
```

Expected: values reconcile with the control board and source workflow records.

```sql
select *
from public.ttgdtx_accounting_dashboard_exception_board
order by exception_count desc, remaining_to_pay_vnd desc, partner_name
limit 30;
```

Expected: each exception points to the correct next workflow step.

## 7. Sign-Off Rule

Mark P2-18 as `DONE` only when:

1. Dashboard loads in browser for authorized users.
2. Unauthorized or out-of-scope users cannot see unrestricted finance data.
3. Users with only `ttgdtx.contract.read` cannot open finance dashboard data.
4. Control board has no unexplained `CRITICAL` row.
5. At least one complete flow and one exception flow are verified.
6. KHTC confirms financial totals; Audit confirms traceability.
