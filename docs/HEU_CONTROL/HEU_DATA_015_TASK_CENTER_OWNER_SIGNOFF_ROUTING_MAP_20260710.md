# HEU Data 015 Task Center Owner Signoff Routing Map

Task ID: HEU-DATA-015-TASK-CENTER-OWNER-SIGNOFF-ROUTING-MAP
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-owner-signoff-routing-map
Base branch: codex/heu/task-center-pilot-review-packet
Status: PASS_LOCAL_OWNER_SIGNOFF_ROUTING_MAP
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice adds a read-only owner signoff routing map to the Task Center gate
evidence panel.

The map tells the team which owner lane must review each blocker before any
future DB read is considered. It does not approve, upload, write storage, read
database rows, mutate task rows, run AI, or trigger automation.

Required boundary:

```text
TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_ONLY
TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_READONLY
TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_DRAFT_ONLY
TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_APPROVAL
TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_DATABASE_READ
TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_TASK_MUTATION
TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_NO_AI_OR_AUTOMATION
TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

The routing map source is:

```text
lib/task-center-gate-evidence-panel-source.ts
```

The user-facing UI is:

```text
components/data-confirmation/department-task-inbox.tsx
```

It displays owner signoff routes:

- `OWNER_SIGNOFF_IT_DATA_SCOPE`.
- `OWNER_SIGNOFF_AUDIT_NEGATIVE_ACCESS`.
- `OWNER_SIGNOFF_PHAP_CHE_REDACTION`.
- `OWNER_SIGNOFF_DEPARTMENT_LABELS`.
- `OWNER_SIGNOFF_BGH_NO_GO_ACK`.

This is a routing map only. Real evidence and signoff decisions stay outside
Git/Codex/chat and must be redacted before being shared.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_014_TASK_CENTER_PILOT_REVIEW_PACKET_20260710.md
docs/HEU_CONTROL/HEU_DATA_015_TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_20260710.md
docs/HEU_CONTROL/HEU_DATA_016_TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_20260710.md
lib/task-center-gate-evidence-panel-source.ts
package.json
scripts/check-heu-task-center-pilot-review-packet-readiness.mjs
scripts/check-heu-task-center-owner-signoff-routing-map-readiness.mjs
scripts/check-heu-task-center-readonly-adapter-decision-ledger-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Owner Routing Rules

| Code | Owner lane | Required evidence | DB-read blocker |
|---|---|---|---|
| `OWNER_SIGNOFF_IT_DATA_SCOPE` | IT_DATA | `IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF` | `DB_READ_BLOCKED_UNTIL_IT_DATA_SIGNOFF` |
| `OWNER_SIGNOFF_AUDIT_NEGATIVE_ACCESS` | AUDIT | `AUDIT_NEGATIVE_ACCESS_EVIDENCE` | `DB_READ_BLOCKED_UNTIL_AUDIT_SIGNOFF` |
| `OWNER_SIGNOFF_PHAP_CHE_REDACTION` | PHAP_CHE | `PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF` | `DB_READ_BLOCKED_UNTIL_PHAP_CHE_SIGNOFF` |
| `OWNER_SIGNOFF_DEPARTMENT_LABELS` | DEPARTMENT_OWNER | `DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE` | `DB_READ_BLOCKED_UNTIL_DEPARTMENT_OWNER_SIGNOFF` |
| `OWNER_SIGNOFF_BGH_NO_GO_ACK` | BGH | `BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT` | `DB_READ_BLOCKED_UNTIL_BGH_ACKNOWLEDGEMENT` |

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

- review whether owner routing wording is clear,
- check that every owner lane has a DB-read blocker,
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
node --check scripts/check-heu-task-center-owner-signoff-routing-map-readiness.mjs
node --check scripts/check-heu-task-center-pilot-review-packet-readiness.mjs
node --check scripts/check-heu-task-center-readonly-adapter-decision-ledger-readiness.mjs
npm.cmd run check:heu-task-center-owner-signoff-routing-map-readiness
npm.cmd run check:heu-task-center-pilot-review-packet-readiness
npm.cmd run check:heu-task-center-readonly-adapter-decision-ledger-readiness
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
| IT_DATA | DB-read stays blocked until scope-first filter signoff |
| AUDIT | DB-read stays blocked until negative-access evidence is reviewed |
| PHAP_CHE | DB-read stays blocked until restricted-data boundary is reviewed |
| DEPARTMENT_OWNER | DB-read stays blocked until department labels are accepted |
| BGH | production remains NO-GO |

## 9. Rollback

Rollback by reverting the PR that adds this owner signoff routing map.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, uploads, storage writes, AI calls, paid
automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-015` adds read-only owner signoff routing map copy to the Task
  Center panel.
- Scope is UI map + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-owner-signoff-routing-map-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns scope-first routing.
- Audit owns negative-access routing.
- Department owners own final usability language.

SOP-LEGAL:
- PHAP_CHE owns restricted-data boundary routing.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Owner routing map can be `PASS_LOCAL` while database and production remain
  `NO_GO`.
- The UI routes review responsibility; it does not collect, upload, approve or
  store.

SOP-VERIFY:
- Checker must verify owner routing tokens, component data attributes, owner
  lanes, DB-read blocker tokens, package alias, no Supabase runtime, no
  database read, no fetch, no mutation APIs, no SQL migration, no AI call and
  no secret assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center owner signoff routing map.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this owner routing
  map.
- If accepted, next safe slice is `HEU-DATA-016-TASK-CENTER-READONLY-ADAPTER-DECISION-LEDGER`,
  a Task Center read-only adapter decision ledger, still no DB read and no migration.
- Required next checker:
  `check:heu-task-center-readonly-adapter-decision-ledger-readiness`.
