# HEU REAL-OPS-02 Signed Migration Order Intake 2026-07-02

Status: PASS_LOCAL_SIGNOFF_INTAKE
Decision value: REAL_OPS_02_MIGRATION_ORDER_READY / NO_GO / BLOCKED
Scope: P0-03 signed Step90-Step110 migration-order intake after
backup/restore proof is ready for owner review.

This intake exists so IT_DATA, KHTC, PHAP_CHE, BGH and Audit know what must be
checked before a signed migration order can be treated as ready for production
review. It does not sign the migration order, approve production migration,
execute SQL, accept evidence, accept UAT, approve finance reliance, approve
legal position, approve owner GO/NO-GO or mark production GO.

## Intake Rules

- Record controlled evidence IDs, signer owner labels, decision values and
  redacted references only.
- Keep signed orders, waiver packets, rollback proof, database exports,
  connection strings, database URLs, service-role keys, credentials, passwords,
  temporary passwords, OTPs, password reset links, account activation/invite
  links, raw PII, CCCD, bank data, bank statements, vouchers and raw payment
  evidence outside Git/Codex/chat.
- Stop if REAL-OPS-01 backup/restore proof, MIGRATION_EVIDENCE_ACCEPTED,
  signer authority, Step90-Step110 decision IDs or rollback point is missing.
- Stop if any owner asks for more proof, or any HIGH/BLOCKER exception remains
  unresolved.

## Required Intake Lanes

| Lane | Owner | Required reference | Stop condition |
|---|---|---|---|
| `REAL-OPS-02-IN-01` Backup/restore prerequisite verified | IT_DATA + Audit | REAL-OPS-01 proof decision, MIGRATION_EVIDENCE_ACCEPTED state and controlled evidence ID | Backup/restore proof is missing, unsigned, chat-only or not tied to the isolated restore target |
| `REAL-OPS-02-IN-02` Signer authority confirmed | IT_DATA + KHTC + PHAP_CHE + BGH | Signer owner labels, delegation basis, signature date and controlled location for the migration-order packet | Any signer is missing, authority is unclear or approval is oral, broad or delegated without written basis |
| `REAL-OPS-02-IN-03` Step90-Step110 scope locked | IT_DATA + KHTC + PHAP_CHE | APPLY, SKIP, WAIVE or BLOCKED for MIG-DEC-01 through MIG-DEC-06, including Step97 and Step100 conditions | Any Step90-Step110 decision ID is missing, Step100 lacks waiver basis or Step110 could import raw sensitive data |
| `REAL-OPS-02-IN-04` Exception and rollback decision recorded | IT_DATA + Audit + BGH | HIGH/BLOCKER exception state, rollback point, rollback owner and waiver or fix reference before migration-order decision | Rollback proof is unclear, an exception is ownerless or a waiver hides finance, legal or audit risk |
| `REAL-OPS-02-IN-05` Migration-order decision prepared | BGH + IT_DATA + KHTC + PHAP_CHE + Audit | REAL_OPS_02_MIGRATION_ORDER_READY, NO_GO or BLOCKED with controlled evidence references only | PASS_LOCAL is treated as signed migration order, production migration approval, SQL execution, UAT acceptance or production GO |

## Linked Surfaces

- `components/settings/supabase-backup-restore-guard.tsx`
- `data-p003-real-ops-02-migration-order-intake="REAL-OPS-02_P0-03"`
- `docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md`
- `docs/MIGRATION_ORDER_AUDIT.md`
- `docs/HEU_REAL_OPERATION_CLOSURE_PLAN_20260702.md`

## PASS_LOCAL Checks

- `npm.cmd run audit:ttgdtx-migration-order-guard`
- `npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack`
- `npm.cmd run audit:ttgdtx-production-readiness-guard`
- `npm.cmd run audit:heu-implementation-log`
- `npm.cmd run audit:ttgdtx-release-gates`
- `npm.cmd run lint`
- `npm.cmd run build`

Passing local checks means only the migration-order intake structure exists and
is audited. It does not mean the actual signed order exists, migration is
approved, production SQL can run, UAT passed or production GO is approved.
