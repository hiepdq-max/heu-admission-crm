# HEU REAL-OPS-01 Backup/Restore Proof Intake 2026-07-02

Status: PASS_LOCAL_PROOF_INTAKE
Decision value: REAL_OPS_01_PROOF_READY / NO_GO / BLOCKED
Scope: P0-03 backup/restore evidence intake before real HEU operation.

This intake exists so IT_DATA, Audit, KHTC, PHAP_CHE and BGH know what proof is
needed before backup/restore can be treated as ready for real operation. It does
not execute backup, execute restore, accept evidence, approve migration,
approve UAT, approve finance reliance, approve legal position or mark
production GO.

## Intake Rules

- Record controlled evidence IDs, owner labels, decision values and redacted
  references only.
- Keep backup dumps, restore exports, connection strings, database URLs,
  service-role keys, credentials, passwords, temporary passwords, OTPs,
  password reset links, account activation/invite links, raw PII, CCCD, bank
  data, bank statements, vouchers and raw payment evidence outside
  Git/Codex/chat.
- Stop if source project, restore target, SQL editor, CLI profile or app banner
  identity is unclear.
- Stop if any owner asks for more proof, or any HIGH/BLOCKER exception remains
  unresolved.

## Required Intake Lanes

| Lane | Owner | Required reference | Stop condition |
|---|---|---|---|
| `REAL-OPS-01-IN-01` Controlled evidence ID recorded | IT_DATA + Audit | Controlled evidence ID, storage class, redaction reviewer and owner label | Backup dump, screenshot with secrets, connection string, bank data, voucher or raw PII is pasted into Git/Codex/chat |
| `REAL-OPS-01-IN-02` Backup reference accepted | IT_DATA + Audit | Backup/snapshot ID, timestamp range, operator and checker in the controlled evidence store | Backup ID is missing, stale, unsigned or cannot be tied to the source environment |
| `REAL-OPS-01-IN-03` Restore target proof accepted | IT_DATA + Audit | Isolated restore target project/ref, app banner and SQL/CLI target proof with checker confirmation | Restore target can be confused with production or target identity proof is incomplete |
| `REAL-OPS-01-IN-04` Smoke-check result accepted | KHTC + PHAP_CHE + Audit + IT_DATA | Restore smoke-check result for P0-19, P3 gate preservation, P2-18/P5-03 source reconciliation, P6-04 scope and P0-17 access closure state | Any smoke-check route is skipped, unresolved, unowned or run against the wrong target |
| `REAL-OPS-01-IN-05` Closure owner decision prepared | BGH + IT_DATA + KHTC + PHAP_CHE + Audit | GO, NO_GO or BLOCKED decision references for P0-03 closure before migration-order review | PASS_LOCAL is treated as backup executed, restore executed, evidence accepted, migration approved or production GO |

## Linked Surfaces

- `components/settings/supabase-backup-restore-guard.tsx`
- `data-p003-real-ops-01-proof-intake="REAL-OPS-01_P0-03"`
- `docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md`
- `docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md`
- `docs/HEU_REAL_OPERATION_CLOSURE_PLAN_20260702.md`

## PASS_LOCAL Checks

- `npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack`
- `npm.cmd run audit:heu-implementation-log`
- `npm.cmd run audit:ttgdtx-release-gates`
- `npm.cmd run lint`
- `npm.cmd run build`

Passing local checks means only the proof-intake structure exists and is
audited. It does not mean the actual backup/restore evidence has been accepted.
