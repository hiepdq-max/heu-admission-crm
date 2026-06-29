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
- Do not paste secrets, passwords, temporary passwords, OTPs, password reset
  links, account activation/invite links, service-role keys, bank credentials,
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
| `docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md` | One-page operator/checker run sheet before execution |
| `docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md` | Procedure owner and execution order |
| `docs/MIGRATION_ORDER_AUDIT.md` | Migration ordering and waiver review |
| `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md` | Final Go/No-Go control |
| `docs/HARD_DELETE_AUDIT.md` | Rollback/hard-delete boundary |
| `docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md` | Legal/finance gate and pilot-open UAT |
| `docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md` | Lead lifecycle and handover UAT |
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
| P0-19 legal/finance gate blocks unresolved basis before receivable creation | PASS | | |
| P3 handover cannot bypass P0-19/P2-05/P2-03 finance gates | PASS | | |
| Partner payment request requires BBNT/partner invoice dossier | PASS | | |
| Payout cannot exceed approved amount or reuse voucher fingerprint | PASS | | |
| Dashboard views are read-only and role-scoped | PASS | | |
| Audit logs exist for create/update/check/approve/pay actions | PASS | | |
| Restricted source/evidence links are not exposed to out-of-scope roles | PASS | | |

## 9. UAT Evidence Index

| UAT pack | Required result | Evidence link / note |
|---|---|---|
| P0-19 legal/finance gate UAT | PASS | |
| P3-01/P3-02 lead lifecycle and handover UAT | PASS | |
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

## 13. P0-03 External Evidence Manifest

Every artifact below must be recorded as a controlled external reference. Do not
paste raw dumps, credentials, connection strings, bank data, vouchers, raw PII or
raw payment data into Git/Codex/chat.

| Case | Required reference | Owner/checker | Minimum fields |
|---|---|---|---|
| P0-03-EVID-01 | Backup reference | IT_DATA + Audit | Controlled reference ID, backup/snapshot ID, timestamp range, operator and checker |
| P0-03-EVID-02 | Restore target reference | IT_DATA + Audit | Restore project/ref, isolated target proof, connection banner and checker confirmation |
| P0-03-EVID-03 | Preflight/postflight command reference | IT_DATA + Audit | Command list, preflight result, postflight result and controlled evidence note |
| P0-03-EVID-04 | Migration dry-run step reference | IT_DATA + KHTC + PHAP_CHE | Step90-Step110 APPLY/SKIP/WAIVE result, exception ID and owner decision when required |
| P0-03-EVID-05 | Smoke-check and UAT reference | KHTC + TRUONG_PHONG + Audit | Restore smoke-check matrix, UAT evidence index and unresolved exception status |
| P0-03-EVID-06 | Final sign-off reference | BGH + IT_DATA + KHTC + PHAP_CHE + Audit | Signed GO/NO-GO note with redacted evidence IDs and no raw dump, secret or PII |

Final manifest decision: EVIDENCE_INDEX_READY / NO_GO / BLOCKED.

Missing evidence ID, uncontrolled storage, raw sensitive attachment or unsigned
owner decision keeps production NO-GO.

## 14. P0-03 UI Execution Checklist

The Supabase check page exposes a backup/restore execution evidence checklist in
`components/settings/supabase-backup-restore-guard.tsx`. The checklist is
PASS_LOCAL only and covers P0-03-01 through P0-03-06: backup evidence, isolated
restore target, app connection to restore target, preflight/postflight command
results, smoke-check/UAT index and final human GO/NO-GO sign-off.

The same page also exposes
`data-p003-backup-restore-operator-run-sheet="P0-03"` and references
`docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md`. The run
sheet uses P0-03-RUN-01 through P0-03-RUN-06 and the decision value
BACKUP_RESTORE_RUN_READY / STOP / BLOCKED so the operator/checker must confirm
execution window, target identity, backup evidence, isolated restore, migration
step decisions and postflight owner review before any production discussion.

Do not attach secrets, passwords, temporary passwords, OTPs, password reset
links, account activation/invite links, service-role keys, bank credentials,
raw student PII, raw CCCD, raw phone numbers or raw payment data in
Git/Codex/chat. Actual backup, restore dry-run, signed UAT and owner GO/NO-GO
evidence remain required before production migration can be considered.

The same page exposes
`data-p003-backup-restore-evidence-manifest="P0-03"` and the decision value
EVIDENCE_INDEX_READY / NO_GO / BLOCKED so the operator/checker can confirm
P0-03-EVID-01 through P0-03-EVID-06 before owner review.

## 15. P0-03 Target Identity Lock

The Supabase check page also exposes
`data-p003-backup-restore-target-identity-lock="P0-03"`. Complete this lock
before any human backup/restore dry-run. Any ambiguous browser tab, SQL editor,
CLI profile, connection string, app banner or evidence folder keeps production
NO-GO.

| Case | Requirement | Minimum evidence | Stop condition |
|---|---|---|---|
| P0-03-TARGET-01 | Execution authority recorded | Approved execution window, operator, checker and owner approval reference | Missing execution window, operator/checker pair or approval reference |
| P0-03-TARGET-02 | Production source is source-only | Production project/ref recorded as source-only with no migration, write, delete or restore command planned against it | Any command could write to production or production project/ref is ambiguous |
| P0-03-TARGET-03 | Restore target is isolated | Restore target project/ref, URL and label prove separation from production | Source and restore target cannot be distinguished in screenshots or notes |
| P0-03-TARGET-04 | App banner points to restore target | App environment banner or redacted connection proof | App could still be connected to production |
| P0-03-TARGET-05 | SQL editor and CLI profile locked | SQL editor, Supabase project selector and CLI profile proof show commands run only against the restore target | Browser tab, SQL editor tab or CLI profile could point to production |
| P0-03-TARGET-06 | Controlled evidence folder confirmed | Controlled folder, redaction owner and evidence naming pattern | Raw exports, credentials, bank data, vouchers or personal data could enter Git/Codex/chat |

Target-lock decision: TARGET_LOCK_READY / STOP / BLOCKED.

PASS_LOCAL proves only that the target-lock checklist exists. It does not
execute backup, restore, migration, rollback, UAT acceptance or production GO.

## 16. Restore Smoke-Check Acceptance Matrix

The Supabase check page also exposes
`data-p003-restore-smoke-check-acceptance-matrix="P0-03"`. A restore dry-run is
not acceptable until these checks are proven on the isolated restore target.
Each stop condition keeps production NO-GO.

| Case | Requirement | Minimum evidence | Stop condition |
|---|---|---|---|
| P0-03-SMOKE-01 | Restore target identity | Project/ref, URL and connection banner prove the app and SQL checks point to the isolated restore target | Any screenshot or query could be production |
| P0-03-SMOKE-02 | Core master records readable | Contract, tuition policy, source-control and TTGDTX master/dropdown records are readable after restore | Legal or tuition master evidence is missing after restore |
| P0-03-SMOKE-03 | Finance guard behavior preserved | Duplicate receivable, over-collection, unresolved reconciliation line and duplicate payout voucher guards still block | Restored database allows a duplicate or overpayment case |
| P0-03-SMOKE-04 | Role and workspace scope preserved | Authorized, out-of-scope and inactive/revoked test users return the expected read/write boundaries | Out-of-scope user can see restricted TTGDTX finance or evidence data |
| P0-03-SMOKE-05 | Audit trace preserved | `audit_logs` show create, update, check, approve, pay and source-control traceability after restore checks | Key restored actions cannot be traced to actor, time, entity and action |
| P0-03-SMOKE-06 | Dashboard source reconciliation preserved | P2-18 dashboard totals match restored source tables and remain read-only for tested roles | Dashboard values drift from restored source records |
| P0-03-SMOKE-07 | Lead handover finance gate preserved | P3 handover evidence proves lead-to-student handover cannot create finance facts or bypass P0-19/P2-05/P2-03 after restore | Lead handover creates receivable/payment facts or bypasses finance gates |

Final smoke-check decision: RESTORE_SMOKE_CHECK_PASS / FAIL / BLOCKED.

PASS_LOCAL does not prove an actual restore, smoke-check, UAT pass, rollback
proof, migration approval or production GO. Attach only redacted evidence
references; keep raw exports, credentials, bank data, vouchers and personal data
outside Git/Codex/chat.

## 17. P0-03 Backup/Restore Closure Decision Manifest

The Supabase check page also exposes
`data-p003-backup-restore-closure-decision-manifest="P0-03"`. Use this
manifest after the operator run sheet, external evidence manifest and restore
smoke-check matrix are complete. It prepares a human closure decision; it does
not execute backup, restore, migration, rollback, UAT acceptance or production
GO.

| Case | Decision gate | Required proof | Stop condition |
|---|---|---|---|
| P0-03-CLOSE-01 | Execution authority and target isolation confirmed | Approved execution window, operator/checker names, production project/ref and isolated restore target project/ref are recorded | Any command, screenshot or browser tab could point to production |
| P0-03-CLOSE-02 | Backup and restore proof accepted | Backup/snapshot ID, restore completion, controlled evidence reference and checker confirmation exist outside Git/Codex/chat | Backup ID, restore evidence, controlled storage or checker confirmation is missing |
| P0-03-CLOSE-03 | Preflight and postflight checks pass | Required audit scripts, lint and build pass before and after the dry-run on the isolated restore target | Any required check fails, is skipped without written waiver or was run against the wrong target |
| P0-03-CLOSE-04 | Smoke-check and UAT index accepted | Restore smoke-check matrix, P0-19 gate UAT, P3-01/P3-02 lifecycle and handover UAT, role/workspace UAT, payout UAT, dashboard UAT and audit-log UAT references are complete | Smoke-check, P0-19/P3 gate evidence, UAT evidence or source reconciliation is missing or unresolved |
| P0-03-CLOSE-05 | Exceptions and waivers controlled | Every HIGH/BLOCKER exception is fixed or has a written owner waiver with impact, rollback and expiry | Exception handling is oral, broad, ownerless or hides finance/legal/audit risk |
| P0-03-CLOSE-06 | Human closure decision recorded | IT_DATA, Audit, KHTC, PHAP_CHE and BGH record GO, NO_GO or BLOCKED before migration order review | PASS_LOCAL is treated as backup executed, restore executed, UAT accepted, migration approved, rollback proven or production GO |

Closure decision: P0_03_CLOSURE_READY / NO_GO / BLOCKED.

PASS_LOCAL keeps P0-03 at evidence-structure readiness only. Missing target
proof, backup/restore evidence, postflight result, smoke-check/UAT index,
exception decision or human sign-off keeps production NO-GO.
