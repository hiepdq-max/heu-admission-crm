# HEU Data 014 Task Center Pilot Review Packet

Task ID: HEU-DATA-014-TASK-CENTER-PILOT-REVIEW-PACKET
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-pilot-review-packet
Base branch: codex/heu/task-center-uat-evidence-checklist
Status: PASS_LOCAL_PILOT_REVIEW_PACKET
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice adds a read-only pilot review packet to the Task Center gate
evidence panel.

The packet tells IT_DATA, Audit, PHAP_CHE, Department owners and BGH what must
be checked before any future DB read is considered. It does not upload files,
write storage, read database rows, approve owner lanes, or collect restricted
raw data.

Required boundary:

```text
TASK_CENTER_PILOT_REVIEW_PACKET_ONLY
TASK_CENTER_PILOT_REVIEW_PACKET_READONLY
TASK_CENTER_PILOT_REVIEW_PACKET_DRAFT_ONLY
TASK_CENTER_PILOT_REVIEW_PACKET_NO_APPROVAL
TASK_CENTER_PILOT_REVIEW_PACKET_NO_UPLOAD
TASK_CENTER_PILOT_REVIEW_PACKET_NO_STORAGE_WRITE
TASK_CENTER_PILOT_REVIEW_PACKET_NO_RAW_PII
TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

The packet source is:

```text
lib/task-center-gate-evidence-panel-source.ts
```

The user-facing UI is:

```text
components/data-confirmation/department-task-inbox.tsx
```

It displays pilot review items:

- `PILOT_REVIEW_SCOPE_MATCH`.
- `PILOT_REVIEW_GATE_NO_GO`.
- `PILOT_REVIEW_RESTRICTED_DATA`.
- `PILOT_REVIEW_OWNER_LANGUAGE`.
- `PILOT_REVIEW_PRODUCTION_BOUNDARY`.

The review packet is a checklist only. Real evidence stays outside
Git/Codex/chat and must be redacted before being shared with reviewers.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_013_TASK_CENTER_UAT_EVIDENCE_CHECKLIST_20260710.md
docs/HEU_CONTROL/HEU_DATA_014_TASK_CENTER_PILOT_REVIEW_PACKET_20260710.md
lib/task-center-gate-evidence-panel-source.ts
package.json
scripts/check-heu-task-center-uat-evidence-checklist-readiness.mjs
scripts/check-heu-task-center-pilot-review-packet-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Pilot Review Rules

| Code | Required reviewer | Pass condition |
|---|---|---|
| `PILOT_REVIEW_SCOPE_MATCH` | IT_DATA | Evidence shows role, scope, lane and timestamp without raw PII |
| `PILOT_REVIEW_GATE_NO_GO` | AUDIT | Evidence shows database NO-GO and no approval action |
| `PILOT_REVIEW_RESTRICTED_DATA` | PHAP_CHE | Evidence is redacted and has no CCCD, phone, payment or raw student data |
| `PILOT_REVIEW_OWNER_LANGUAGE` | DEPARTMENT_OWNER | User can explain allowed, blocked and report-to copy |
| `PILOT_REVIEW_PRODUCTION_BOUNDARY` | BGH | Review packet states production remains NO-GO |

## 5. No-Go Conditions

TASK_CENTER_DATABASE_READY: NO_GO

This slice is still NO-GO for:

- Supabase client creation,
- database read,
- database write,
- file upload,
- storage write,
- SQL migration,
- task status mutation,
- audit event write,
- production workflow approval,
- finance/HOU action,
- AI call,
- paid automation,
- deployment.

## 6. AI And Cost Boundary

AI/Codex may:

- review whether pilot review wording is clear,
- check that the packet does not imply upload, approval or production GO,
- detect accidental DB/AI/automation enablement,
- draft review comments.

AI/Codex must not:

- capture real evidence,
- store screenshots,
- mark any owner lane approved,
- enable database reads,
- read real task/student/payment data,
- run SQL,
- trigger paid automation,
- decide production readiness.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-pilot-review-packet-readiness.mjs
node --check scripts/check-heu-task-center-uat-evidence-checklist-readiness.mjs
npm.cmd run check:heu-task-center-pilot-review-packet-readiness
npm.cmd run check:heu-task-center-uat-evidence-checklist-readiness
npm.cmd run check:heu-task-center-real-user-uat-copy-readiness
npm.cmd run check:heu-task-center-gate-evidence-panel-readiness
npm.cmd run check:heu-task-center-adapter-enablement-gate-readiness
npm.cmd run check:heu-task-center-ui-fallback-wiring-readiness
npm.cmd run check:heu-task-center-readonly-adapter-skeleton-readiness
npm.cmd run check:heu-task-center-readonly-query-plan-readiness
npm.cmd run check:heu-task-center-mock-readonly-list-readiness
npm.cmd run check:heu-task-center-read-model-interface-readiness
npm.cmd run check:heu-task-center-data-contract-readiness
npm.cmd run check:heu-data-confirmation-task-center
npm.cmd run check:heu-app-shell-draft-pr-readiness
npm.cmd run lint
npm.cmd run build -- --webpack
```

The build command may use dummy public Supabase env values only. Do not use
real secrets in Git/Codex/chat.

## 8. Owner Review Required

Before using this with real users:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | pilot packet proves scope/lane without raw data |
| AUDIT | packet supports PASS/NO-GO review and keeps gate NO-GO |
| PHAP_CHE | evidence is redacted and no restricted raw data is requested |
| DEPARTMENT_OWNER | wording is usable by each department |
| BGH | production remains NO-GO |

## 9. Rollback

Rollback by reverting the PR that adds this pilot review packet.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, uploads, storage writes, AI calls, paid
automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-014` adds read-only pilot review packet copy to the Task Center
  panel.
- Scope is UI packet + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-pilot-review-packet-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns scope/lane evidence wording.
- Audit owns PASS/NO-GO packet sufficiency.
- Department owners own final usability language.

SOP-LEGAL:
- PHAP_CHE must confirm no restricted raw data is requested.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Pilot review packet can be `PASS_LOCAL` while database and production remain
  `NO_GO`.
- The UI guides review; it does not collect, upload, approve or store.

SOP-VERIFY:
- Checker must verify packet tokens, component data attributes, reviewer lanes,
  no-upload/no-storage/no-raw-PII boundaries, package alias, no Supabase runtime,
  no database read, no fetch, no mutation APIs, no SQL migration, no AI call and
  no secret assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center pilot review packet.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this pilot packet.
- If accepted, next safe slice is Task Center owner signoff routing map, still no DB read and no migration.
