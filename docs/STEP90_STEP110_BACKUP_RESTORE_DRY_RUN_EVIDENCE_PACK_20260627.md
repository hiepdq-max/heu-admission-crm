# Step90-Step110 Backup/Restore Dry-Run Evidence Pack

Status: DRAFT_CONTROL
Date: 2026-06-27
Scope: TTGDTX 9+ pilot database steps 90 through 110
Mode: evidence template for UAT/staging only. This document does not approve
production migration.

## 1. Purpose

This pack records the evidence required before any Step90-Step110 production
migration review. It is meant to be filled after a real backup/restore dry-run
on an isolated UAT or restore target.

Production remains NO-GO until this pack is completed with backup evidence,
restore evidence, preflight/postflight results, UAT results, exception review
and human sign-off.

## 2. Hard Boundaries

- Do not run production migration from Codex/chat.
- Do not paste secrets, passwords, OTPs, service-role keys, bank credentials,
  raw student PII, raw CCCD, raw phone numbers or raw payment data into this
  pack.
- Do not treat screenshots with visible credentials, raw bank data or raw PII
  as acceptable evidence.
- Do not mark production GO from this pack. It only supports a later human
  Go/No-Go review.
- Do not use hard-delete, table drop or truncate as rollback proof.

## 3. Required Source Documents

| Document | Required use |
|---|---|
| `docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md` | Procedure owner and execution order |
| `docs/MIGRATION_ORDER_AUDIT.md` | Migration ordering and waiver review |
| `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md` | Final Go/No-Go control |
| `docs/HARD_DELETE_AUDIT.md` | Rollback/hard-delete boundary |
| `docs/STEP109_ROLE_PERMISSION_UAT_RUNBOOK.md` | ADMIN and role access UAT |
| `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md` | Duplicate payout UAT |
| `docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md` | Dashboard UAT |
| `docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md` | Audit-log UAT |

## 4. Backup Evidence Record

| Field | Value |
|---|---|
| Evidence pack ID | |
| Source environment | |
| Supabase project ref | |
| Backup type | |
| Backup ID / snapshot ID | |
| Backup started at | |
| Backup completed at | |
| Backup operator | |
| Backup checker | |
| Backup evidence link | |
| Backup result | PASS / FAIL / BLOCKED |
| Backup notes / exceptions | |

Minimum acceptable backup evidence:

- Backup or snapshot ID.
- Timestamped backup start and completion record.
- Operator and checker.
- Evidence link stored in a controlled location outside Git when it contains
  screenshots, exports or environment identifiers.

## 5. Restore Evidence Record

| Field | Value |
|---|---|
| Restore target environment | |
| Restore target project/ref | |
| Restore started at | |
| Restore completed at | |
| Restore operator | |
| Restore checker | |
| Restore evidence link | |
| App connection checked against restore target | YES / NO |
| Restore result | PASS / FAIL / BLOCKED |
| Restore notes / exceptions | |

Minimum acceptable restore evidence:

- Restore target is isolated from production.
- App or SQL client connection is proven to point to the restore target.
- Restore completion is timestamped.
- A checker independently confirms the target is not production.

## 6. Static Preflight And Postflight Evidence

Run the same command set before and after applying the approved UAT migration
sequence on the restore target.

| Command | Preflight result | Postflight result | Evidence link / note |
|---|---|---|---|
| `npm.cmd run audit:hard-delete` | | | |
| `npm.cmd run audit:permission-soft-revoke` | | | |
| `npm.cmd run audit:ttgdtx-audit-log` | | | |
| `npm.cmd run audit:ttgdtx-cascade` | | | |
| `npm.cmd run audit:ttgdtx-dashboard-access` | | | |
| `npm.cmd run audit:ttgdtx-data-fetch-gate` | | | |
| `npm.cmd run audit:ttgdtx-role-scope-access` | | | |
| `npm.cmd run audit:ttgdtx-step110-safety` | | | |
| `npm.cmd run audit:ttgdtx-release-gates` | | | |
| `npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack` | | | |
| `npm.cmd run lint` | | | |
| `npm.cmd run build` | | | |

Any FAIL or BLOCKED result keeps production NO-GO.

## 7. Migration Execution Record

Use only on an isolated UAT/restore target. Do not run these against production
from Codex/chat.

| Step | File | Decision | Applied at | Operator | Result | Evidence / note |
|---|---|---|---|---|---|---|
| Step90 | `database/step90_ttgdtx_student_receivables.sql` | APPLY / SKIP | | | | |
| Step91 | `database/step91_ttgdtx_receivable_gate_p2_05.sql` | APPLY / SKIP | | | | |
| Step92 | `database/step92_ttgdtx_tuition_import_control_p2_06.sql` | APPLY / SKIP | | | | |
| Step93 | `database/step93_ttgdtx_import_issue_routing_p2_07.sql` | APPLY / SKIP | | | | |
| Step94 | `database/step94_ttgdtx_import_issue_resolution_p2_08.sql` | APPLY / SKIP | | | | |
| Step95 | `database/step95_ttgdtx_department_workload_p2_09.sql` | APPLY / SKIP | | | | |
| Step96 | `database/step96_ttgdtx_tuition_collection_p2_10.sql` | APPLY / SKIP | | | | |
| Step98 | `database/step98_ttgdtx_source_control_p2_11.sql` | APPLY / SKIP | | | | |
| Step99 | `database/step99_ttgdtx_master_dropdown_p2_12.sql` | APPLY / SKIP | | | | |
| Step97 | `database/step97_ttgdtx_p0_19_finance_gate_fix.sql` | APPLY / SKIP / WAIVE | | | | |
| Step100 | `database/step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19.sql` | APPLY / SKIP / WAIVE | | | | |
| Step101 | `database/step101_ttgdtx_reconciliation_p2_13.sql` | APPLY / SKIP | | | | |
| Step102 | `database/step102_fix_p2_13_partner_status.sql` | APPLY / SKIP / RETIRED | | | | |
| Step103 | `database/step103_fix_p2_13_reconciliation_line_columns.sql` | APPLY / SKIP / RETIRED | | | | |
| Step104 | `database/step104_ttgdtx_reconciliation_approval_p2_14.sql` | APPLY / SKIP | | | | |
| Step105 | `database/step105_ttgdtx_partner_payment_request_p2_15.sql` | APPLY / SKIP | | | | |
| Step106 | `database/step106_ttgdtx_payment_request_approval_p2_16.sql` | APPLY / SKIP | | | | |
| Step107 | `database/step107_ttgdtx_payment_execution_p2_17.sql` | APPLY / SKIP | | | | |
| Step108 | `database/step108_ttgdtx_accounting_dashboard_p2_18.sql` | APPLY / SKIP | | | | |
| Step109 | `database/step109_role_permission_soft_revoke_p0_11.sql` | APPLY / SKIP | | | | |
| Step110 | `database/step110_ttgdtx_real_data_evidence_metadata_p2_19.sql` | APPLY / SKIP | | | | |

## 8. Data Smoke-Check Evidence

| Check | Expected result | Actual result | Evidence / note |
|---|---|---|---|
| App is connected to restore target, not production | PASS | | |
| Contract and tuition policy seed records still readable | PASS | | |
| Receivable duplicate guard still blocks duplicates | PASS | | |
| Tuition collection cannot exceed eligible balance without approved exception | PASS | | |
| Reconciliation cannot lock unresolved invoice/receipt lines | PASS | | |
| Partner payment request requires BBNT/partner invoice dossier | PASS | | |
| Payout cannot exceed approved amount or reuse voucher fingerprint | PASS | | |
| Dashboard views are read-only and role-scoped | PASS | | |
| Audit logs exist for create/update/check/approve/pay actions | PASS | | |
| Restricted source/evidence links are not exposed to out-of-scope roles | PASS | | |

## 9. UAT Evidence Index

| UAT pack | Required result | Evidence link / note |
|---|---|---|
| P2-17 duplicate payout UAT | PASS | |
| P2-18 accounting dashboard UAT | PASS | |
| Step109 role permission UAT | PASS | |
| TTGDTX audit-log UAT | PASS | |
| Synthetic real-like UAT pack | PASS | |
| Role/workspace scope UAT | PASS | |

## 10. Exception Log

| ID | Area | Severity | Issue | Owner | Decision | Evidence / note |
|---|---|---|---|---|---|---|
| EX-001 | | LOW / MEDIUM / HIGH / BLOCKER | | | FIX / WAIVE / BLOCK | |

Every HIGH or BLOCKER exception keeps production NO-GO unless a written waiver
is approved by the responsible owner group and BGH.

## 11. Human Sign-Off

| Role | Name | Decision | Date | Evidence / note |
|---|---|---|---|---|
| IT_DATA | | GO / NO-GO | | |
| KHTC | | GO / NO-GO | | |
| Phap Che | | GO / NO-GO | | |
| Audit | | GO / NO-GO | | |
| BGH | | GO / NO-GO | | |

## 12. Local Control Decision

This evidence pack is a PASS_LOCAL template when the file exists, the required
sections are present, and `npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack`
passes.

PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,
production migration is approved, or production GO is approved. Actual
production readiness still requires completed evidence, owner review and signed
human Go/No-Go.
