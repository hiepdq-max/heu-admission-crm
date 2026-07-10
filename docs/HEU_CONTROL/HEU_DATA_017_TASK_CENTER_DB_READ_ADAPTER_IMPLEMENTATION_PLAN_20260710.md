# HEU Data 017 Task Center DB-Read Adapter Implementation Plan

Task ID: HEU-DATA-017-TASK-CENTER-DB-READ-ADAPTER-IMPLEMENTATION-PLAN
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-db-read-adapter-implementation-plan
Base branch: codex/heu/task-center-readonly-adapter-decision-ledger
Status: PASS_LOCAL_DB_READ_ADAPTER_IMPLEMENTATION_PLAN
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice adds a read-only implementation plan for a future Task Center DB-read
adapter.

The plan defines the steps that must exist before a later PR can implement a
real read-only database adapter. It does not create a database client, read
database rows, mutate task rows, approve owner lanes, run AI, or trigger
automation.

Required boundary:

```text
TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_ONLY
TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_READONLY
TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_DRAFT_ONLY
TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_READ
TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_DATABASE_CLIENT
TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_TASK_MUTATION
TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_NO_AI_OR_AUTOMATION
TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

The implementation plan source is:

```text
lib/task-center-gate-evidence-panel-source.ts
```

The user-facing UI is:

```text
components/data-confirmation/department-task-inbox.tsx
```

It displays plan rows:

- `DB_READ_PLAN_SCOPE_FILTER_CONTRACT`.
- `DB_READ_PLAN_NEGATIVE_ACCESS_TEST`.
- `DB_READ_PLAN_RESTRICTED_FIELD_ALLOWLIST`.
- `DB_READ_PLAN_DEPARTMENT_LABEL_MAP`.
- `DB_READ_PLAN_PRODUCTION_BOUNDARY`.

Every row stays `PLAN_ONLY`. This is a future implementation plan only, not a
runtime adapter.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_016_TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_20260710.md
docs/HEU_CONTROL/HEU_DATA_017_TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_20260710.md
lib/task-center-gate-evidence-panel-source.ts
package.json
scripts/check-heu-task-center-readonly-adapter-decision-ledger-readiness.mjs
scripts/check-heu-task-center-db-read-adapter-implementation-plan-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Implementation Plan Rules

| Code | Phase | Required gate | Forbidden in this slice |
|---|---|---|---|
| `DB_READ_PLAN_SCOPE_FILTER_CONTRACT` | `PLAN_ONLY` | `IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF` | `NO_DATABASE_CLIENT_CREATED` |
| `DB_READ_PLAN_NEGATIVE_ACCESS_TEST` | `PLAN_ONLY` | `AUDIT_NEGATIVE_ACCESS_EVIDENCE` | `NO_DATABASE_READ_EXECUTED` |
| `DB_READ_PLAN_RESTRICTED_FIELD_ALLOWLIST` | `PLAN_ONLY` | `PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF` | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `DB_READ_PLAN_DEPARTMENT_LABEL_MAP` | `PLAN_ONLY` | `DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE` | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `DB_READ_PLAN_PRODUCTION_BOUNDARY` | `PLAN_ONLY` | `BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT` | `NO_PRODUCTION_GO_NO_DEPLOY` |

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

- review whether the future adapter plan is clear,
- check that every plan row remains `PLAN_ONLY`,
- detect accidental DB/AI/automation enablement,
- draft review comments.

AI/Codex must not:

- implement the adapter in this slice,
- create a Supabase client,
- enable database reads,
- read real task/student/payment data,
- run SQL,
- trigger paid automation,
- decide production readiness.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-db-read-adapter-implementation-plan-readiness.mjs
node --check scripts/check-heu-task-center-readonly-adapter-decision-ledger-readiness.mjs
npm.cmd run check:heu-task-center-db-read-adapter-implementation-plan-readiness
npm.cmd run check:heu-task-center-readonly-adapter-decision-ledger-readiness
npm.cmd run check:heu-task-center-owner-signoff-routing-map-readiness
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

Before any future adapter implementation PR:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | workspace/role/lane filter contract is acceptable |
| AUDIT | negative-access test cases are acceptable |
| PHAP_CHE | metadata-only field allowlist excludes restricted data |
| DEPARTMENT_OWNER | department label map is understandable |
| BGH | production remains NO-GO |

## 9. Rollback

Rollback by reverting the PR that adds this DB-read adapter implementation plan.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, uploads, storage writes, AI calls, paid
automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-017` adds a read-only DB-read adapter implementation plan to the
  Task Center panel.
- Scope is UI plan + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-db-read-adapter-implementation-plan-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns future adapter scope filter contract.
- Audit owns negative-access test plan.
- Department owners own label mapping usability.

SOP-LEGAL:
- PHAP_CHE owns restricted-field allowlist boundary.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- DB-read adapter implementation plan can be `PASS_LOCAL` while database and
  production remain `NO_GO`.
- The UI records a future plan; it does not create a database client, read,
  upload, approve or store.

SOP-VERIFY:
- Checker must verify plan tokens, component data attributes, `PLAN_ONLY`
  phase, forbidden tokens, package alias, no Supabase runtime, no database read,
  no fetch, no mutation APIs, no SQL migration, no AI call and no secret
  assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center DB-read adapter implementation plan.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this implementation
  plan.
- If accepted, next safe slice is Task Center adapter test fixture contract, still no DB read and no migration.
