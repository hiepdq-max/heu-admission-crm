# Step90-Step110 Migration Order Sign-Off Guard

Date: 2026-06-27
Scope: `database/step90` through `database/step110`
Mode: local control guard only. No production migration was run.

## 1. Purpose

This guard prevents the Step90-Step110 TTGDTX accounting chain from being
treated as an approved production migration bundle before backup, rollback,
owner review, waiver review and signed approval evidence exist.

PASS_LOCAL means the repo contains the required guardrails and audit checks.
PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,
production migration is approved, or production GO is approved.

Production remains NO-GO.

## 2. Hard Boundaries

- Do not run production migration from Codex/chat.
- Do not run Step90-Step110 on production until backup and restore evidence is
  attached outside Git when sensitive.
- Do not run Step90-Step110 on production until IT_DATA, KHTC and PHAP_CHE sign
  the migration order, waiver decisions and rollback plan.
- Do not paste secrets, passwords, OTPs, service-role keys, bank credentials,
  raw student PII, raw CCCD, raw phone numbers or raw payment data into this
  repo, Codex, chat or audit documents.
- Do not use hard-delete, table drop or truncate as rollback proof for finance,
  evidence, approval, payment or audit data.

## 3. Required Evidence Before Any Production Run

| Evidence | Owner | Minimum proof |
|---|---|---|
| Supabase backup | IT_DATA | Backup ID, timestamp, environment, checksum or dashboard evidence |
| Restore dry-run | IT_DATA | Restored target, verification query result, rollback decision note |
| Migration order sign-off | IT_DATA + KHTC + PHAP_CHE | Signed order matching `docs/MIGRATION_ORDER_AUDIT.md` |
| Step97 decision | IT_DATA + KHTC | Apply only if P0-19 status mismatch exists; otherwise skip |
| Step100 decision | BGH + KHTC + PHAP_CHE + IT_DATA | Apply only with formal pilot waiver; otherwise exclude |
| Step109 access UAT | IT_DATA + ADMIN | ADMIN not locked out; active/revoked permission behavior verified |
| Step110 privacy fit | IT_DATA + Audit | Metadata-only, anonymized UAT, no raw PII/bank data import |
| Payment/reconciliation UAT | KHTC + Audit + BGH | P2-13 through P2-18 evidence and duplicate-payout checks signed |

## 4. Backup/Restore Evidence Acceptance Lock

The migration order cannot move to owner signature until this evidence lock is
accepted. Decision: MIGRATION_EVIDENCE_ACCEPTED / NO_GO / BLOCKED.

| Case | Acceptance gate | Minimum proof before signature | Stop condition |
|---|---|---|---|
| MIG-LOCK-01 | P0-03 target identity lock accepted | P0-03-TARGET-01 through P0-03-TARGET-06 show production source-only status, isolated restore target, app banner, SQL editor/CLI profile and controlled evidence folder | Any target, tab, app banner, SQL editor or CLI profile could point to production |
| MIG-LOCK-02 | Backup and restore proof accepted | Backup/snapshot ID, restore target, restore completion, operator/checker and controlled evidence reference | Backup ID, restore target or checker acceptance is missing |
| MIG-LOCK-03 | Preflight and postflight checks accepted | Required audit commands, lint and build are recorded before and after the restore dry-run | Any check failed, was skipped without written waiver or was run against the wrong target |
| MIG-LOCK-04 | Restore smoke-check accepted | P0-03 smoke-check matrix proves finance guards, role scope, audit trace, dashboard source reconciliation and P0-19/P3 gate preservation | Smoke-check result is missing or unresolved |
| MIG-LOCK-05 | Rollback point and exception decision accepted | Rollback point, exception log and HIGH/BLOCKER fix or owner waiver are attached outside Git/Codex/chat | Rollback point is unclear or exception decision is oral, broad or ownerless |
| MIG-LOCK-06 | Required owners accept evidence before signing | IT_DATA, Audit, KHTC and PHAP_CHE record ACCEPT / NO_GO / BLOCKED before the migration order signature | Any required owner has not accepted the evidence lock |

PASS_LOCAL proves only that this acceptance-lock structure exists. It does not
execute backup, restore, production migration, rollback, UAT acceptance,
evidence acceptance or production GO.

## 5. Step-Specific Guard Rules

- Step90-Step96 are the base receivable, import, workload and collection chain.
- Step97 is a conditional P0-19 finance gate fix, not a default production step.
- Step98-Step99 are source-control and dropdown foundations.
- Step100 is a temporary pilot waiver only when formally approved as pilot
  waiver; it must not become a permanent production rule by accident.
- Step101-Step108 are high-risk reconciliation, approval, payment request,
  payout and dashboard controls. They require idempotency, evidence links and
  audit-log UAT.
- Step109 changes permission semantics and requires role/access UAT before run.
- Step110 is evidence metadata only and must not import raw sensitive data.

## 6. Step Decision Manifest

Each decision must be recorded outside Git/Codex/chat with controlled evidence
references only. Do not treat a green local audit as permission to run SQL in
production.

| Decision ID | Step(s) | Allowed decision | Required evidence before owner review |
|---|---|---|---|
| MIG-DEC-01 | Step90-Step96 | APPLY / BLOCKED | P0-03 target identity lock, backup/restore evidence acceptance lock, release-gate preflight, idempotency review |
| MIG-DEC-02 | Step97 | APPLY / SKIP / BLOCKED | P0-19 mismatch check, KHTC owner decision, rollback note |
| MIG-DEC-03 | Step100 | APPLY / SKIP / WAIVE / BLOCKED | Formal pilot waiver, BGH/KHTC/PHAP_CHE/IT_DATA approval, expiry/review note |
| MIG-DEC-04 | Step101-Step108 | APPLY / BLOCKED | P2-13 through P2-18 finance UAT, duplicate-payout guard and audit-log traceability |
| MIG-DEC-05 | Step109 | APPLY / BLOCKED | ADMIN access test, revoked/inactive permission behavior and role/workspace UAT |
| MIG-DEC-06 | Step110 | APPLY / SKIP / BLOCKED | Privacy fit, anonymized UAT, metadata-only proof and no raw PII/bank import |

Final migration-order decision: MIGRATION_ORDER_READY / NO_GO / BLOCKED.

Any missing decision ID, unsigned waiver, missing rollback note, raw sensitive
evidence or unclear production target keeps the migration order NO-GO.

## 7. Local Guard Command

Run this before any handoff that discusses Step90-Step110 readiness:

```powershell
npm.cmd run audit:ttgdtx-migration-order-guard
```

The guard checks that:

- the migration order audit keeps Step90-Step110 in a controlled order;
- the production checklist keeps migration order IN_PROGRESS until signed;
- the backup/restore evidence pack remains explicit about local-only status;
- Step97 and Step100 remain conditional or waiver-only;
- AGENTS.md and release-gate audit include this guard.

## 8. Current Decision

The Step90-Step110 order is locally reviewed, but production execution is still
blocked. The next valid movement is signed owner review and backup/restore
evidence accepted through the migration evidence lock, not a production SQL run.
