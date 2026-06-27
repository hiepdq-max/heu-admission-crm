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

## 4. Step-Specific Guard Rules

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

## 5. Step Decision Manifest

Each decision must be recorded outside Git/Codex/chat with controlled evidence
references only. Do not treat a green local audit as permission to run SQL in
production.

| Decision ID | Step(s) | Allowed decision | Required evidence before owner review |
|---|---|---|---|
| MIG-DEC-01 | Step90-Step96 | APPLY / BLOCKED | P0-03 backup/restore evidence, release-gate preflight, idempotency review |
| MIG-DEC-02 | Step97 | APPLY / SKIP / BLOCKED | P0-19 mismatch check, KHTC owner decision, rollback note |
| MIG-DEC-03 | Step100 | APPLY / SKIP / WAIVE / BLOCKED | Formal pilot waiver, BGH/KHTC/PHAP_CHE/IT_DATA approval, expiry/review note |
| MIG-DEC-04 | Step101-Step108 | APPLY / BLOCKED | P2-13 through P2-18 finance UAT, duplicate-payout guard and audit-log traceability |
| MIG-DEC-05 | Step109 | APPLY / BLOCKED | ADMIN access test, revoked/inactive permission behavior and role/workspace UAT |
| MIG-DEC-06 | Step110 | APPLY / SKIP / BLOCKED | Privacy fit, anonymized UAT, metadata-only proof and no raw PII/bank import |

Final migration-order decision: MIGRATION_ORDER_READY / NO_GO / BLOCKED.

Any missing decision ID, unsigned waiver, missing rollback note, raw sensitive
evidence or unclear production target keeps the migration order NO-GO.

## 6. Local Guard Command

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

## 7. Current Decision

The Step90-Step110 order is locally reviewed, but production execution is still
blocked. The next valid movement is signed owner review and backup/restore
evidence, not a production SQL run.
