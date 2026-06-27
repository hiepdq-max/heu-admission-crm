# Step90-Step110 Backup, Rollback And Dry-Run Runbook

Status: DRAFT_CONTROL
Date: 2026-06-25
Scope: TTGDTX 9+ pilot database steps 90 through 110
Mode: UAT/staging procedure. This document does not approve production migration.

## 1. Purpose

This runbook defines the minimum safe path before Step90-Step110 can be
considered for production. It exists to prevent finance, payment, approval,
evidence and audit data from being damaged by an untested migration.

Production remains NO-GO until backup evidence, restore evidence, UAT evidence
and human sign-off are attached to the production checklist.

## 2. Hard Boundaries

- Do not run production migration from Codex/chat.
- Do not use real student, CCCD, bank, phone or payment data in dry-run tests
  unless the dataset is formally approved and sanitized.
- Do not rollback finance/evidence/audit data by hard-deleting rows.
- Do not drop tables, truncate tables, or delete audit/payment/evidence rows as
  a rollback strategy.
- Do not mark go-live ready until BGH, KHTC, Phap Che, Audit and IT_DATA approve
  the checklist.

## 3. Owner Matrix

| Area | Owner | Required action |
|---|---|---|
| Backup and restore target | IT_DATA | Create backup, prove restore, attach evidence |
| Migration order | IT_DATA + KHTC + Phap Che | Confirm step order and pilot waivers |
| Finance UAT | KHTC | Validate receivable, collection, reconciliation and payout |
| Legal/control UAT | Phap Che + Audit | Validate gate, evidence, approval and audit trail |
| Go/No-Go | BGH | Approve or block production after evidence review |

## 4. Backup Evidence Template

Use `docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md`
as the controlled evidence pack when the dry-run is executed. The table below
is the minimum summary; the evidence pack carries the detailed backup, restore,
preflight, postflight, UAT, exception and sign-off records.

Before execution, fill
`docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md` so the
operator/checker pair, execution window, production project/ref, restore target
project/ref, evidence folder and immediate STOP/BLOCKED conditions are explicit.

Record this before any production migration is considered:

| Field | Value |
|---|---|
| Environment | |
| Supabase project ref | |
| Backup type | |
| Backup ID / snapshot ID | |
| Backup started at | |
| Backup completed at | |
| Operator | |
| Checker | |
| Restore target project/ref | |
| Restore started at | |
| Restore completed at | |
| Evidence link | |
| Notes / exceptions | |

Minimum evidence:

- Screenshot or export showing the backup/snapshot exists.
- Restore target name/project ref.
- Timestamped restore completion evidence.
- Schema/data smoke-check result after restore.
- Approval note from IT_DATA checker.

## 5. Static Preflight

Run these locally on the hardening branch before any UAT migration dry-run:

```powershell
npm.cmd run audit:hard-delete
npm.cmd run audit:permission-soft-revoke
npm.cmd run audit:ttgdtx-audit-log
npm.cmd run audit:ttgdtx-cascade
npm.cmd run audit:ttgdtx-dashboard-access
npm.cmd run audit:ttgdtx-data-fetch-gate
npm.cmd run audit:ttgdtx-role-scope-access
npm.cmd run audit:ttgdtx-step110-safety
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run lint
npm.cmd run build
```

All commands must pass. A failure means STOP and fix before continuing.

## 6. Migration Order For Dry-Run

Run only on an isolated UAT/restore target, not production:

1. `database/step90_ttgdtx_student_receivables.sql`
2. `database/step91_ttgdtx_receivable_gate_p2_05.sql`
3. `database/step92_ttgdtx_tuition_import_control_p2_06.sql`
4. `database/step93_ttgdtx_import_issue_routing_p2_07.sql`
5. `database/step94_ttgdtx_import_issue_resolution_p2_08.sql`
6. `database/step95_ttgdtx_department_workload_p2_09.sql`
7. `database/step96_ttgdtx_tuition_collection_p2_10.sql`
8. `database/step98_ttgdtx_source_control_p2_11.sql`
9. `database/step99_ttgdtx_master_dropdown_p2_12.sql`
10. `database/step97_ttgdtx_p0_19_finance_gate_fix.sql` only if the target
    schema/data has the P0-19 mismatch this patch is meant to fix.
11. `database/step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql` only if it is
    formally approved as a pilot waiver. It must not become silent production
    policy.
12. `database/step101_ttgdtx_reconciliation_p2_13.sql`
13. `database/step102_fix_p2_13_partner_status.sql` only if the current target
    needs the partner-status patch.
14. `database/step103_fix_p2_13_reconciliation_line_columns.sql` only if the
    current target needs the line-column patch.
15. `database/step104_ttgdtx_reconciliation_approval_p2_14.sql`
16. `database/step105_ttgdtx_partner_payment_request_p2_15.sql`
17. `database/step106_ttgdtx_payment_request_approval_p2_16.sql`
18. `database/step107_ttgdtx_payment_execution_p2_17.sql`
19. `database/step108_ttgdtx_accounting_dashboard_p2_18.sql`
20. `database/step109_role_permission_soft_revoke_p0_11.sql` only after
    role-permission UAT proves ADMIN will not be locked out.
21. `database/step110_ttgdtx_real_data_evidence_metadata_p2_19.sql` only after
    `docs/TTGDTX_PHU_XUYEN_REAL_DATA_FIT_NOTE_20260625.md` is reviewed and the
    UAT source pack is anonymized or formally approved for controlled UAT.

## 7. Restore Dry-Run Flow

1. Create a backup/snapshot from the source environment.
2. Complete the operator run sheet through P0-03-RUN-03 before restore starts.
3. Restore it into an isolated UAT/restore target.
4. Confirm the app points to the restore target, not production.
5. Run the static preflight commands.
6. Apply Step90-Step110 in the approved order on the restore target only.
7. Run the static preflight commands again.
8. Execute these UAT runbooks:
   - `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md`
   - `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md`
   - `docs/STEP109_ROLE_PERMISSION_UAT_RUNBOOK.md`
   - `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md`
   - `docs/TTGDTX_PHU_XUYEN_REAL_DATA_FIT_NOTE_20260625.md`
9. Record pass/fail evidence in the production checklist.
10. If any critical issue appears, STOP and use backup restore as the rollback
   proof. Do not fix by deleting finance/evidence/audit rows.

## 8. Rollback Principle

The primary rollback for a failed production migration is whole-environment
restore from the verified backup/snapshot.

Allowed recovery paths:

- Restore the whole database backup to the pre-migration state.
- Forward-fix with an approved migration only when rollback risk is higher than
  forward-fix risk and the owner group signs off.
- Keep failed migration evidence and audit notes for later review.

Forbidden recovery paths:

- Hard-delete receivables, collections, reconciliation batches, payment
  requests, payouts, approvals, evidence or audit rows.
- Drop financial tables or audit tables to "clean up" a failed run.
- Manually edit production rows without owner approval and audit evidence.

## 9. Go/No-Go Checklist

| Item | Required status |
|---|---|
| Backup evidence attached | DONE |
| Restore dry-run evidence attached | DONE |
| Step90-Step110 migration order approved | DONE |
| Step100 pilot waiver approved or excluded | DONE |
| Step109 ADMIN access UAT passed | DONE |
| P2-17 no-double-pay UAT passed | DONE |
| P2-18 dashboard UAT passed | DONE |
| TTGDTX audit-log UAT passed | DONE |
| Static audits, lint and build pass | DONE |
| Production checklist has no P0 blocker | DONE |

If any item is not DONE, production remains NO-GO.

## 10. Sign-Off

| Role | Name | Decision | Date | Note |
|---|---|---|---|---|
| IT_DATA | | GO / NO-GO | | |
| KHTC | | GO / NO-GO | | |
| Phap Che | | GO / NO-GO | | |
| Audit | | GO / NO-GO | | |
| BGH | | GO / NO-GO | | |
