# Migration Order Audit

## 1. Scope

Date: 2026-06-22  
Scope: database/step90 through database/step108  
Mode: documentation-only audit. No migration was run.

## 2. Migration Inventory

| Step | File | Purpose | Group | Risk |
|---|---|---|---|---|
| 90 | step90_ttgdtx_student_receivables.sql | Student receivable foundation | Migration | HIGH |
| 91 | step91_ttgdtx_receivable_gate_p2_05.sql | P2-05 receivable gate | Migration | HIGH |
| 92 | step92_ttgdtx_tuition_import_control_p2_06.sql | P2-06 tuition import control | Migration | HIGH |
| 93 | step93_ttgdtx_import_issue_routing_p2_07.sql | P2-07 issue routing | Migration | MEDIUM |
| 94 | step94_ttgdtx_import_issue_resolution_p2_08.sql | P2-08 issue resolution | Migration | MEDIUM |
| 95 | step95_ttgdtx_department_workload_p2_09.sql | P2-09 workload/reporting | Migration | MEDIUM |
| 96 | step96_ttgdtx_tuition_collection_p2_10.sql | P2-10 tuition collection | Migration | CRITICAL |
| 97 | step97_ttgdtx_p0_19_finance_gate_fix.sql | P0-19 finance gate fix | Cleanup/Patch | HIGH |
| 98 | step98_ttgdtx_source_control_p2_11.sql | P2-11 source control | Migration | MEDIUM |
| 99 | step99_ttgdtx_master_dropdown_p2_12.sql | P2-12 master dropdown | Migration | MEDIUM |
| 100 | step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql | Pilot unlock for P2-01/P2-02/P0-19 | Pilot Patch | HIGH |
| 101 | step101_ttgdtx_reconciliation_p2_13.sql | P2-13 reconciliation | Migration | CRITICAL |
| 102 | step102_fix_p2_13_partner_status.sql | P2-13 partner status fix | Cleanup/Patch | MEDIUM |
| 103 | step103_fix_p2_13_reconciliation_line_columns.sql | P2-13 line column fix | Cleanup/Patch | HIGH |
| 104 | step104_ttgdtx_reconciliation_approval_p2_14.sql | P2-14 approval/lock | Migration | CRITICAL |
| 105 | step105_ttgdtx_partner_payment_request_p2_15.sql | P2-15 payment request | Migration | CRITICAL |
| 106 | step106_ttgdtx_payment_request_approval_p2_16.sql | P2-16 payment approval | Migration | CRITICAL |
| 107 | step107_ttgdtx_payment_execution_p2_17.sql | P2-17 payment execution | Migration | CRITICAL |
| 108 | step108_ttgdtx_accounting_dashboard_p2_18.sql | P2-18 accounting dashboard | Migration | HIGH |

## 3. step90-step108 Review

Step90 to Step108 form the TTGDTX 9+ accounting pilot chain. They should not be treated as a single undifferentiated SQL bundle. Some files are foundation migrations, some are workflow additions, and some are pilot fixes/temporary unlocks. Production migration requires backup, transaction strategy, idempotency review and rollback plan.

## 4. DROP/DELETE/TRUNCATE Risk

| File | Pattern detected | Risk |
|---|---|---|
| step101_ttgdtx_reconciliation_p2_13.sql | `delete from public.ttgdtx_tuition_reconciliation_batches` | CRITICAL |
| step103_fix_p2_13_reconciliation_line_columns.sql | `delete from public.ttgdtx_tuition_reconciliation_batches` | CRITICAL |
| step105_ttgdtx_partner_payment_request_p2_15.sql | `delete from public.ttgdtx_partner_payment_requests` | CRITICAL |
| step90-step108 scan | No SQL `truncate` detected in current pattern scan | LOW |
| step90-step108 scan | No `drop table` detected in current pattern scan | LOW |

## 5. Re-run Risk

| File | Rerun risk | Required check |
|---|---|---|
| step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql | May reopen pilot gates unintentionally | Confirm it is a temporary pilot waiver |
| step101_ttgdtx_reconciliation_p2_13.sql | May affect reconciliation logic and batch creation | Confirm idempotency and duplicate prevention |
| step103_fix_p2_13_reconciliation_line_columns.sql | Patch may duplicate or alter columns/functions | Confirm schema state before run |
| step105_ttgdtx_partner_payment_request_p2_15.sql | Payment request creation must not duplicate requests | Confirm unique constraints |
| step107_ttgdtx_payment_execution_p2_17.sql | Payout must not execute twice | Confirm idempotency and lock |
| step108_ttgdtx_accounting_dashboard_p2_18.sql | Dashboard may rely on previous views/functions | Confirm dependencies and runtime |

## 6. Dependency Notes

### Foundation

- Step90
- Step91
- Step92
- Step93
- Step94
- Step95
- Step96
- Step98
- Step99

### Pilot Patch / Temporary Unlock

- Step97
- Step100
- Step102
- Step103

These must be reviewed before production. If they are only pilot waivers, they should not become permanent production rules without BGH/KHTC/Pháp chế approval.

### Reconciliation And Payment Chain

- Step101
- Step104
- Step105
- Step106
- Step107
- Step108

This chain is high risk because it controls money, reconciliation, approval and payout.

## 7. Recommended Migration Order

Preconditions:

- Supabase backup exists.
- Current schema snapshot is saved.
- P0 workspace/scope tables exist.
- P2-01 TTGDTX contract foundation exists.
- P2-02 tuition policy foundation exists.
- P0-19 legal/finance gate foundation exists.

Recommended order:

1. step90_ttgdtx_student_receivables.sql
2. step91_ttgdtx_receivable_gate_p2_05.sql
3. step92_ttgdtx_tuition_import_control_p2_06.sql
4. step93_ttgdtx_import_issue_routing_p2_07.sql
5. step94_ttgdtx_import_issue_resolution_p2_08.sql
6. step95_ttgdtx_department_workload_p2_09.sql
7. step96_ttgdtx_tuition_collection_p2_10.sql
8. step98_ttgdtx_source_control_p2_11.sql
9. step99_ttgdtx_master_dropdown_p2_12.sql
10. step97_ttgdtx_p0_19_finance_gate_fix.sql only if P0-19 status mismatch exists.
11. step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql only if formally approved as pilot waiver.
12. step101_ttgdtx_reconciliation_p2_13.sql
13. step102_fix_p2_13_partner_status.sql only if current schema/data needs it.
14. step103_fix_p2_13_reconciliation_line_columns.sql only if current schema needs it.
15. step104_ttgdtx_reconciliation_approval_p2_14.sql
16. step105_ttgdtx_partner_payment_request_p2_15.sql
17. step106_ttgdtx_payment_request_approval_p2_16.sql
18. step107_ttgdtx_payment_execution_p2_17.sql
19. step108_ttgdtx_accounting_dashboard_p2_18.sql

## 8. Files Not Approved for Production

The following files need explicit review or waiver before production use:

- step97_ttgdtx_p0_19_finance_gate_fix.sql
- step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql
- step102_fix_p2_13_partner_status.sql
- step103_fix_p2_13_reconciliation_line_columns.sql
- Any step with CRITICAL delete, payment, payout or reconciliation risk until backup, idempotency and rollback evidence are attached.

## 9. Rollback Gap

Rollback is not yet proven in this audit. Production migration remains blocked until backup evidence, restore procedure and dry-run rollback evidence are available.

## 10. Current Conclusion

Do not run Step90-Step108 on production until:

- Backup is complete.
- Each step has owner, checker and approver.
- Patch-only files are separated from base migrations.
- Idempotency is verified.
- CRITICAL delete patterns are reviewed.
- P2-17 duplicate payout prevention is tested.
- P2-18 dashboard is verified after deploy.
