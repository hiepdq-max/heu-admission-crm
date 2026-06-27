# Migration Order Audit

## 1. Scope

Date: 2026-06-22  
Scope: database/step90 through database/step110
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
| 109 | step109_role_permission_soft_revoke_p0_11.sql | P0-11 role permission soft revoke | Migration | HIGH |
| 110 | step110_ttgdtx_real_data_evidence_metadata_p2_19.sql | P2-19 real-data evidence metadata, privacy fit, BBNT/account-control/giai-chap controls | Migration Candidate | HIGH |

## 3. step90-step110 Review

Step90 to Step108 form the TTGDTX 9+ accounting pilot chain. Step109 is a P0-11 permission hardening migration required by the no-hard-delete control. Step110 is a real-data evidence/privacy metadata extension required before Phu Xuyen-like source packs, BBNT evidence, account-freeze/release notices or collateral giai-chap evidence can be imported or used in UAT. They should not be treated as a single undifferentiated SQL bundle. Some files are foundation migrations, some are workflow additions, some are pilot fixes/temporary unlocks, step109 changes role permission semantics, and step110 expands evidence metadata. Production migration requires backup, transaction strategy, idempotency review and rollback plan.

## 4. DROP/DELETE/TRUNCATE Risk

| File | Pattern detected | Risk |
|---|---|---|
| step101_ttgdtx_reconciliation_p2_13.sql | RESOLVED 2026-06-25: explicit rollback `delete from` removed; exception rolls back the draft batch in the same transaction | RESOLVED |
| step103_fix_p2_13_reconciliation_line_columns.sql | RESOLVED 2026-06-25: explicit rollback `delete from` removed; exception rolls back the draft batch in the same transaction | RESOLVED |
| step105_ttgdtx_partner_payment_request_p2_15.sql | RESOLVED 2026-06-25: explicit rollback `delete from` removed; exception rolls back the draft request in the same transaction | RESOLVED |
| step90-step110 scan | No SQL `delete from` detected after 2026-06-25 cleanup | LOW |
| step90-step110 scan | No SQL `truncate` detected in current pattern scan | LOW |
| step90-step110 scan | No `drop table` detected in current pattern scan | LOW |
| step90-step110 scan | No `on delete cascade` after 2026-06-25 TTGDTX cascade cleanup; `npm.cmd run audit:ttgdtx-cascade` must pass | LOW |
| step90-step110 scan | TTGDTX tables require `write_audit_log()` triggers where new TTGDTX tables are created; `npm.cmd run audit:ttgdtx-audit-log` must pass | LOW |

## 5. Re-run Risk

| File | Rerun risk | Required check |
|---|---|---|
| step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql | May reopen pilot gates unintentionally | Confirm it is a temporary pilot waiver |
| step101_ttgdtx_reconciliation_p2_13.sql | May affect reconciliation logic and batch creation | Confirm idempotency and duplicate prevention |
| step103_fix_p2_13_reconciliation_line_columns.sql | Patch may duplicate or alter columns/functions | Confirm schema state before run |
| step105_ttgdtx_partner_payment_request_p2_15.sql | Payment request creation must not duplicate requests and must not bypass BBNT/partner-invoice evidence controls | Confirm unique constraints, required evidence link and P2-19 BBNT/partner-invoice blocker behavior |
| step107_ttgdtx_payment_execution_p2_17.sql | Payout must not execute twice or bypass BBNT/partner-invoice/evidence controls | Confirm RPC-only write path, normalized voucher guard, row lock, required evidence link, P2-19 blockers and UAT runbook |
| step108_ttgdtx_accounting_dashboard_p2_18.sql | Dashboard may rely on previous views/functions | Confirm dependencies, runtime and `ttgdtx_accounting_dashboard_control_board` |
| step109_role_permission_soft_revoke_p0_11.sql | Permission semantics change from physical replacement to soft revoke | Confirm `npm.cmd run audit:permission-soft-revoke`, `has_permission()` and settings UI read only ACTIVE permissions |
| step110_ttgdtx_real_data_evidence_metadata_p2_19.sql | Adds metadata/checks for high-sensitivity evidence, BBNT, account-control notices and collateral giai-chap rules | Confirm no raw PII/bank data is inserted, hard-delete/cascade audits pass, and anonymized UAT pack exists |

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
- Step110, only as a metadata extension after Step92 and Step98 exist; account-freeze/release and collateral-release items remain metadata-only until separate workflow migrations are approved

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
20. step109_role_permission_soft_revoke_p0_11.sql only after role-permission UAT confirms ADMIN is not locked out.
21. step110_ttgdtx_real_data_evidence_metadata_p2_19.sql only after real-data fit review confirms no raw PII/bank data is committed or imported without anonymized UAT approval, and BBNT/account-control/giai-chap evidence is registered as metadata only.

## 8. Files Not Approved for Production

The following files need explicit review or waiver before production use:

- step97_ttgdtx_p0_19_finance_gate_fix.sql
- step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql
- step102_fix_p2_13_partner_status.sql
- step103_fix_p2_13_reconciliation_line_columns.sql
- step109_role_permission_soft_revoke_p0_11.sql
- step110_ttgdtx_real_data_evidence_metadata_p2_19.sql
- Any payment, payout, reconciliation, cascade or rollback-sensitive step until backup, idempotency and rollback evidence are attached.

## 9. Rollback Gap

Rollback is not yet proven in this audit. A draft runbook now exists at `docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md`, but production migration remains blocked until backup evidence, restore procedure and dry-run rollback evidence are attached.

## 10. Current Conclusion

Do not run Step90-Step110 on production until:

- Backup is complete.
- Each step has owner, checker and approver.
- Patch-only files are separated from base migrations.
- Idempotency is verified.
- No SQL `delete from` remains in step90-step110.
- Step90-Step110 has no `on delete cascade`; non-TTGDTX/base schema cascade and rollback behavior are reviewed or waived.
- `npm.cmd run audit:ttgdtx-audit-log` passes and Audit signs off tested create/update/approve/pay evidence.
- `npm.cmd run audit:ttgdtx-release-gates` passes and the backup/rollback dry-run evidence is attached.
- P2-17 duplicate payout prevention is tested with `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md`.
- P2-18 dashboard is verified after deploy with `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md`.
- Step109 role permission UAT proves active permissions, revoked permissions and ADMIN access behave correctly, with `npm.cmd run audit:permission-soft-revoke` passing before migration.
- Step110 real-data metadata is tested only with anonymized Phu Xuyen-like UAT cases from `docs/TTGDTX_PHU_XUYEN_REAL_DATA_FIT_NOTE_20260625.md` and account-control/BBNT/giai-chap controls from `docs/TTGDTX_ACCOUNT_FREEZE_RELEASE_ACCEPTANCE_NOTE_20260625.md`.
