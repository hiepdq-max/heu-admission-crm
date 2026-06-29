# Step90-Step110 Backup/Restore Operator Run Sheet 2026-06-27

Status: PASS_LOCAL_TEMPLATE
Scope: P0-03 human-operated backup/restore dry-run before Step90-Step110 review.

This run sheet does not execute backup, restore, migration, rollback, UAT
acceptance, owner waiver or production GO. It is a controlled checklist for the
human IT_DATA operator and Audit checker to fill outside Codex/chat.

## 1. Non-Negotiable Boundaries

- Do not run production migration from Codex/chat.
- Do not paste secrets, passwords, temporary passwords, OTPs, password reset
  links, account activation/invite links, service-role keys, bank credentials,
  raw student PII, raw CCCD, raw phone numbers, raw bank account numbers,
  vouchers, exports or raw payment data into Git/Codex/chat.
- Do not continue if the current browser tab, SQL editor, CLI profile or
  connection string could point to production unexpectedly.
- Do not use hard-delete, truncate, drop table or cascade execution as rollback
  proof.
- Keep production NO-GO until the evidence pack, smoke-check matrix, UAT
  results, migration order and final owner GO/NO-GO are signed.

## 2. Operator Header

| Field | Value |
|---|---|
| Run sheet ID | |
| Execution window | |
| Operator | |
| Checker | |
| Source environment | |
| Production project/ref | |
| Restore target project/ref | |
| Evidence pack link | |
| Controlled evidence folder | |
| Initial decision | BACKUP_RESTORE_RUN_READY / STOP / BLOCKED |

## 3. Target Identity Lock

The target identity lock must be complete before any backup/restore dry-run
starts. Decision: TARGET_LOCK_READY / STOP / BLOCKED.

| Case | Required action | Evidence to attach outside Git | Stop condition |
|---|---|---|---|
| P0-03-TARGET-01 | Record execution authority | Approved execution window, operator, checker and owner approval reference | Missing execution window, operator/checker pair or approval reference |
| P0-03-TARGET-02 | Mark production as source-only | Production project/ref recorded with no write, delete, restore or migration command against it | Any command could write to production |
| P0-03-TARGET-03 | Prove restore target isolation | Restore target project/ref, URL and label separate from production | Source and restore target cannot be distinguished |
| P0-03-TARGET-04 | Prove app banner points to restore target | App environment banner or redacted connection proof | App could still be connected to production |
| P0-03-TARGET-05 | Lock SQL editor and CLI profile | SQL editor, Supabase project selector and CLI profile proof | Browser tab, SQL editor tab or CLI profile could point to production |
| P0-03-TARGET-06 | Confirm controlled evidence folder | Controlled folder, redaction owner and evidence naming pattern | Raw exports, credentials, bank data, vouchers or personal data could enter Git/Codex/chat |

## 4. Step Checklist

| Case | Required action | Evidence to attach outside Git | Decision |
|---|---|---|---|
| P0-03-RUN-01 | Confirm approved execution window and operator/checker pair | Execution window, operator, checker, source environment and approval reference | READY / STOP / BLOCKED |
| P0-03-RUN-02 | Prove production versus restore target identity | Production project/ref and restore target project/ref side by side | READY / STOP / BLOCKED |
| P0-03-RUN-03 | Capture backup evidence before restore | Backup/snapshot ID, timestamp, operator, checker and controlled evidence location | READY / STOP / BLOCKED |
| P0-03-RUN-04 | Restore and verify isolated target before migration dry-run | Restore completion, target isolation proof, app/Supabase connection proof and preflight results | READY / STOP / BLOCKED |
| P0-03-RUN-05 | Apply Step90-Step110 only on restore target | APPLY/SKIP/WAIVE decision, operator, result and evidence note for each step | READY / STOP / BLOCKED |
| P0-03-RUN-06 | Close with postflight, smoke-check and owner review | Postflight checks, smoke-check matrix, exception log and owner GO/NO-GO note | READY / STOP / BLOCKED |

## 5. Immediate Stop Conditions

Keep the run STOP/BLOCKED if any condition is true:

1. The target identity is ambiguous.
2. Backup ID or controlled evidence location is missing.
3. The app or SQL client has not been proven to point to the restore target.
4. Step97, Step100, Step109 or Step110 lacks its required owner decision.
5. Any HIGH/BLOCKER issue remains unresolved.
6. Any raw sensitive evidence is exposed in Git/Codex/chat.
7. Any required owner asks for more evidence.

## 6. Required Cross-References

| Artifact | Use |
|---|---|
| `docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md` | Detailed evidence record |
| `docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md` | Procedure and rollback principle |
| `docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md` | Migration-order boundary |
| `docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md` | Final owner GO/NO-GO |

## 7. Local Preflight

Run before owner review:

```powershell
npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack
npm.cmd run audit:ttgdtx-migration-order-guard
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run lint
npm.cmd run build
```

Passing local commands proves only that the run sheet, evidence pack and local
guards are aligned. It does not prove an actual backup, restore, migration
dry-run, rollback proof, UAT pass, owner sign-off or production GO.
