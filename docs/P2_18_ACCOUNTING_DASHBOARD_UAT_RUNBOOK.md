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
- The same checklist exposes
  `data-ttgdtx-dashboard-acceptance-matrix="P2-18"` with
  P2-18-ACCEPT-01 through P2-18-ACCEPT-06 and decision value
  `P2_18_ACCEPT / FAIL / BLOCKED`.
- `components/ttgdtx/ttgdtx-dashboard-source-reconciliation-checklist.tsx`
  shows the source reconciliation checklist for P2-03, P2-10,
  P2-13/P2-14, P2-15/P2-16, P2-17 and P2-19 evidence metadata.
- The same source reconciliation checklist exposes
  `data-ttgdtx-dashboard-immediate-stop="P2-18"` with P2-18-STOP-01 through
  P2-18-STOP-05 and decision value `P2_18_STOP_CHECK / GO_NEXT / BLOCKED`.
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

## 7. Dashboard Acceptance Matrix

Use the P2-18 dashboard acceptance matrix after the test matrix and evidence
queries. The matrix is local-only until signed browser UAT and owner sign-off
exist.

| Case | Requirement | Minimum evidence | Stop condition |
|---|---|---|---|
| P2-18-ACCEPT-01 | Read-only route and authorized load | Authorized BGH/KHTC opens the dashboard after `canOpen`; no form or button can create, update, approve or pay | Dashboard exposes any write action or queries run before permission and TTGDTX scope gate |
| P2-18-ACCEPT-02 | Source-total reconciliation | Summary, control and partner totals reconcile to P2-03, P2-10, P2-13/P2-14, P2-15/P2-16, P2-17 and P2-19 evidence metadata | Any accepted KPI lacks source query evidence or cannot be tied back to an approved source workflow |
| P2-18-ACCEPT-03 | Role and contract-only denial | Out-of-scope and contract-only users are blocked or scoped; `ttgdtx.contract.read` alone does not expose finance totals | Contract-only permission or out-of-scope access exposes unrestricted dashboard data |
| P2-18-ACCEPT-04 | Exception and movement traceability | Each exception row links to the correct source workflow and recent movement rows match source records | An exception or movement row cannot be traced to the source step and owner |
| P2-18-ACCEPT-05 | Evidence redaction and owner sign-off | Screenshots or exports use redacted, non-secret references; KHTC, BGH, IT_DATA and Audit sign outside Codex/chat | Raw PII, CCCD, bank accounts, vouchers, passwords, OTPs or service-role keys are exposed |
| P2-18-ACCEPT-06 | Production boundary | P2-18 stays an advisory read-only cockpit until backup/restore evidence, UAT evidence and owner GO/NO-GO are signed | PASS_LOCAL is treated as dashboard UAT pass, finance approval, dashboard reliance or production GO |

Decision value: `P2_18_ACCEPT / FAIL / BLOCKED`.

## 8. Dashboard Reliance Decision Manifest

Immediate stop guard: do not proceed to source sign-off or owner reliance when
dashboard totals are used for finance approval, statutory accounting, revenue
recognition, payment approval, bank transfer instruction or production GO; when
signed browser UAT, source reconciliation, reliance decision, backup/restore
proof or owner sign-off is missing; when contract-only/out-of-scope access sees
finance totals; when source variance, `CRITICAL`, ownerless `REVIEW` or wrong
exception routing remains open; or when raw PII, CCCD, bank accounts, vouchers,
bank statements, passwords, OTPs or service keys appear in evidence.

Before BGH/KHTC rely on any P2-18 dashboard number for internal review,
complete the reliance decision manifest exposed on the dashboard through
`data-ttgdtx-dashboard-reliance-decision-manifest="P2-18"`. This manifest is
local-only until signed browser UAT and owner sign-off exist. It does not
approve finance action, statutory accounting, UAT acceptance, dashboard
production reliance or production GO.

| Case | Reliance gate | Required decision | Stop condition |
|---|---|---|---|
| P2-18-REL-01 | Authorized read-only access | BGH/KHTC can open the dashboard only after permission and TTGDTX scope checks pass; the page exposes no write action | A query runs before `canOpen`, a write button exists, or contract-only/out-of-scope access exposes finance totals |
| P2-18-REL-02 | Source-total reconciliation | Dashboard totals reconcile to P2-03, P2-10, P2-13/P2-14, P2-15/P2-16, P2-17 and P2-19 controlled references | Any accepted KPI cannot be traced to the approved source workflow, query or evidence reference |
| P2-18-REL-03 | Control-board status | All intentional completed flows are `PASS`; `REVIEW` items have owner notes; `CRITICAL` rows are explained or block reliance | A `CRITICAL` row is unexplained, a `REVIEW` row has no owner, or an exception route points to the wrong workflow |
| P2-18-REL-04 | Evidence redaction and storage | Screenshots, exports and source comparisons use controlled redacted evidence IDs outside Git/Codex/chat | Raw PII, CCCD, bank accounts, vouchers, bank statements, passwords, OTPs or service keys appear |
| P2-18-REL-05 | Dashboard reliance boundary | Owners record whether the dashboard can support internal review only, with no finance action or statutory-accounting reliance | Dashboard `PASS_LOCAL` is treated as finance approval, statutory accounting, UAT acceptance or production GO |
| P2-18-REL-06 | Human reliance decision | Operator, checker, owner signers, timestamp, evidence IDs and final decision are recorded as `P2_18_RELIANCE_READY`, `NO_GO` or `BLOCKED` | Signed browser UAT, owner sign-off, backup/restore proof or final GO/NO-GO evidence is missing |

Final reliance decision: `P2_18_RELIANCE_READY / NO_GO / BLOCKED`.

Missing reliance decision ID, unresolved variance, unsigned owner decision,
uncontrolled evidence or raw sensitive dashboard data keeps P2-18 NO-GO.

## 9. Sign-Off Rule

Mark P2-18 as `DONE` only when:

1. Dashboard loads in browser for authorized users.
2. Unauthorized or out-of-scope users cannot see unrestricted finance data.
3. Users with only `ttgdtx.contract.read` cannot open finance dashboard data.
4. Control board has no unexplained `CRITICAL` row.
5. At least one complete flow and one exception flow are verified.
6. KHTC confirms financial totals; Audit confirms traceability.
7. P2-18-ACCEPT-01 through P2-18-ACCEPT-06 all pass with redacted evidence.
