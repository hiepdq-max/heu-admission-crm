# HEU REAL-OPS-06 Hard-Delete Cascade Closure Intake 2026-07-02

Status: PASS_LOCAL_CASCADE_CLOSURE_INTAKE
Decision value: REAL_OPS_06_CASCADE_CLOSURE_READY / NO_GO / BLOCKED
Scope: hard-delete/cascade conversion-or-written-waiver closure intake before
owner GO/NO-GO or any production migration.

This intake exists so IT_DATA, Audit, BGH and affected business owners can see
which controlled references are still required before P6-06 can be considered
for human closure review. It does not approve production deletion, cascade
execution, waiver, conversion migration, data cleanup, rollback success,
evidence acceptance, owner GO/NO-GO or production GO.

## Intake Rules

- Record only finding IDs, owner lanes, disposition path, controlled evidence
  IDs, redaction reviewer, rollback approach and waiver expiry/review date.
- Keep database exports, SQL dumps, raw PII, CCCD, phone numbers, bank data,
  payment data, vouchers, credentials, passwords, temporary passwords, OTPs,
  password reset links, account activation/invite links, service-role keys and
  production connection strings outside Git/Codex/chat.
- Stop if any P6-06-FIND-001 through P6-06-FIND-044 row is missing a conversion
  route, written waiver route or explicit BLOCKED/NO_GO decision.
- Stop if Codex/AI is asked to approve a waiver, run conversion SQL, clean data,
  execute cascade deletion, accept rollback proof or mark production ready.

## Required Intake Lanes

| Lane | Owner | Required reference | Stop condition |
|---|---|---|---|
| `REAL-OPS-06-HDQ-01` Current register locked | IT_DATA + Audit | `HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md`, current scan count 44, P6-06-FIND-001 through P6-06-FIND-044 and `P6_06_TRIAGE_READY / NO_GO / BLOCKED` | Scan count changed, register is stale, owner lane is missing or a protected table is unmapped |
| `REAL-OPS-06-HDQ-02` Protected-record conversion route prepared | IT_DATA + affected owner + Audit | Restrict/archive/status-transition plan, rollback note, redacted evidence ID and `P6_06_ACCEPT / FAIL / BLOCKED` | Finance, evidence, approval, legal, audit, lead or operating-history row can still disappear through parent delete |
| `REAL-OPS-06-HDQ-03` Derived-helper waiver route controlled | Business owner + Audit | Narrow written waiver with affected table, reason, derived-only proof, rollback approach, expiry/review date and no protected-record impact | Waiver is broad, oral, ownerless, hidden, expired or covers protected records |
| `REAL-OPS-06-HDQ-04` Rollback and redaction route ready | IT_DATA + Audit | Backup/restore or reversible-state proof path, controlled evidence location and redaction reviewer | Truncate, drop table, hard-delete or cascade execution is presented as rollback proof |
| `REAL-OPS-06-HDQ-05` Batch closure compiled | IT_DATA + Audit + affected owners | P6_06_BATCH1_READY through P6_06_BATCH5_READY, owner signatures, controlled evidence location and redaction reviewer | Any batch remains PENDING, BLOCKED, ownerless or contains raw sensitive data |
| `REAL-OPS-06-HDQ-06` Authority decision path prepared | BGH + IT_DATA + Audit + affected owners | `REAL_OPS_06_CASCADE_CLOSURE_READY / NO_GO / BLOCKED` and `P6_06_CLOSURE_READY / NO_GO / BLOCKED` with signer labels | PASS_LOCAL is treated as waiver approval, conversion migration approval, cleanup approval, rollback success or production GO |

## Linked Surfaces

- `components/audit/hard-delete-boundary-guard.tsx`
- `components/audit/hard-delete-conversion-decision-queue.tsx`
- `components/audit/hard-delete-waiver-evidence-checklist.tsx`
- `components/master-control/production-readiness-blocker-summary.tsx`
- `data-heu-real-ops-06-cascade-closure-intake="REAL-OPS-06_CASCADE"`
- `docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md`
- `docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md`
- `docs/HEU_REAL_OPERATION_CLOSURE_PLAN_20260702.md`

## PASS_LOCAL Checks

- `npm.cmd run audit:heu-non-ttgdtx-cascade-review`
- `npm.cmd run audit:hard-delete`
- `npm.cmd run audit:ttgdtx-cascade`
- `npm.cmd run audit:hard-delete-boundary-guard`
- `npm.cmd run audit:hard-delete-conversion-decision-queue`
- `npm.cmd run audit:heu-bgh-dashboard-spec`
- `npm.cmd run audit:heu-implementation-log`
- `npm.cmd run audit:ttgdtx-release-gates`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`

Passing local checks means only the P6-06 hard-delete/cascade closure intake
structure exists and is audited. It does not mean conversion, waiver, evidence,
rollback, cleanup, owner GO/NO-GO or production operation is approved.
