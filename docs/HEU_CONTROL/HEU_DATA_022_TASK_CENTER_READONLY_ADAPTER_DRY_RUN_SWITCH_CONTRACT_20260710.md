# HEU Data 022 Task Center Readonly Adapter Dry-Run Switch Contract

Task ID: HEU-DATA-022-TASK-CENTER-READONLY-ADAPTER-DRY-RUN-SWITCH-CONTRACT
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-readonly-adapter-dry-run-switch-contract
Base branch: codex/heu/task-center-adapter-preflight-checklist
Status: PASS_LOCAL_DRY_RUN_SWITCH_CONTRACT
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice defines the read-only adapter dry-run switch contract that must stay
default OFF until owner evidence, negative-access proof, restricted-field
allowlist, department label acceptance and production NO-GO acknowledgement are
reviewed.

It does not approve owner gates, create a database client, read database rows,
mutate task rows, store audit events, enable env flags, upload files, call AI,
run automation, run SQL, or deploy.

Required boundary:

```text
TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_ONLY
TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_READONLY
TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_DRAFT_ONLY
TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_APPROVAL
TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_READ
TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_DATABASE_CLIENT
TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_TASK_MUTATION
TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_REAL_DATA
TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_ENV_ENABLEMENT
TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_NO_AI_OR_AUTOMATION
DRY_RUN_SWITCH_CONTRACT
DRY_RUN_SWITCH_DEFAULT_OFF
TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_REAL_USER_DATA
NO_ENV_ENABLEMENT
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Contract Rows

The dry-run switch contract is displayed from:

```text
lib/task-center-gate-evidence-panel-source.ts
components/data-confirmation/department-task-inbox.tsx
```

It lists:

- `DRY_RUN_SWITCH_SCOPE_FILTER_ONLY`.
- `DRY_RUN_SWITCH_NEGATIVE_ACCESS_GUARD`.
- `DRY_RUN_SWITCH_FIELD_ALLOWLIST_GUARD`.
- `DRY_RUN_SWITCH_READONLY_STATUS`.
- `DRY_RUN_SWITCH_PRODUCTION_NO_GO`.

Every row stays `DRY_RUN_SWITCH_CONTRACT`. This is not a switch
implementation, not feature flag enablement and not a production gate.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_021_TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_20260710.md
docs/HEU_CONTROL/HEU_DATA_022_TASK_CENTER_READONLY_ADAPTER_DRY_RUN_SWITCH_CONTRACT_20260710.md
lib/task-center-gate-evidence-panel-source.ts
package.json
scripts/check-heu-task-center-adapter-preflight-checklist-readiness.mjs
scripts/check-heu-task-center-readonly-adapter-dry-run-switch-contract-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Dry-Run Switch Contract Rules

| Code | Contract owner | Switch state | Required before switch | Dry-run behavior | Forbidden in this slice |
|---|---|---|---|---|---|
| `DRY_RUN_SWITCH_SCOPE_FILTER_ONLY` | `IT_DATA` | `DRY_RUN_SWITCH_CONTRACT` | `IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF` | Switch contract may point only to scope-first adapter path and must default OFF. | `NO_ENV_ENABLEMENT` |
| `DRY_RUN_SWITCH_NEGATIVE_ACCESS_GUARD` | `AUDIT` | `DRY_RUN_SWITCH_CONTRACT` | `AUDIT_NEGATIVE_ACCESS_EVIDENCE` | Dry-run switch must require negative-access fixture evidence before any DB read. | `NO_DATABASE_READ_EXECUTED` |
| `DRY_RUN_SWITCH_FIELD_ALLOWLIST_GUARD` | `PHAP_CHE` | `DRY_RUN_SWITCH_CONTRACT` | `PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF` | Dry-run switch must expose metadata allowlist only; raw PII/payment fields stay blocked. | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `DRY_RUN_SWITCH_READONLY_STATUS` | `DEPARTMENT_OWNER` | `DRY_RUN_SWITCH_CONTRACT` | `DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE` | Dry-run switch cannot create, update, approve or change task status. | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `DRY_RUN_SWITCH_PRODUCTION_NO_GO` | `BGH` | `DRY_RUN_SWITCH_CONTRACT` | `BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT` | Dry-run switch remains local/UAT-only and cannot imply production readiness. | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. No-Go Conditions

TASK_CENTER_DATABASE_READY: NO_GO

This slice is still NO-GO for:

- owner approval,
- env/feature flag enablement,
- Supabase client creation,
- database read,
- database write,
- real user data fixture,
- raw PII or payment data,
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

- verify that dry-run switch contract requirements are visible,
- check that every row remains `DRY_RUN_SWITCH_CONTRACT`,
- detect accidental DB/env/AI/automation enablement,
- draft review comments.

AI/Codex must not:

- approve any dry-run switch row,
- implement or enable the switch in this slice,
- set env or feature flag values,
- create a Supabase client,
- enable database reads,
- read real task/student/payment data,
- run SQL,
- trigger paid automation,
- decide production readiness.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-readonly-adapter-dry-run-switch-contract-readiness.mjs
node --check scripts/check-heu-task-center-adapter-preflight-checklist-readiness.mjs
npm.cmd run check:heu-task-center-readonly-adapter-dry-run-switch-contract-readiness
npm.cmd run check:heu-task-center-adapter-preflight-checklist-readiness
npm.cmd run check:heu-task-center-owner-gate-evidence-matrix-readiness
npm.cmd run check:heu-task-center-disabled-runtime-seam-verification-readiness
npm.cmd run check:heu-task-center-adapter-test-fixture-contract-readiness
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

Before any future dry-run switch implementation PR:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | switch remains default OFF and scope-first only |
| AUDIT | negative-access proof is sufficient before DB read |
| PHAP_CHE | restricted-data allowlist is sufficient |
| DEPARTMENT_OWNER | readonly task labels and behavior are accepted |
| BGH | production NO-GO acknowledgement is sufficient |

## 9. Rollback

Rollback by reverting the PR that adds this dry-run switch contract.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, env enablement, uploads, storage writes,
AI calls, paid automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-022` adds a read-only dry-run switch contract for the Task Center
  adapter.
- Scope is UI contract + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-readonly-adapter-dry-run-switch-contract-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns switch default-OFF and scope-first filter condition.
- Audit owns negative-access guard condition.
- Department owners own readonly task label acceptance.

SOP-LEGAL:
- PHAP_CHE owns restricted-field allowlist and no-real-data boundary.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Dry-run switch contract can be `PASS_LOCAL` while database and production
  remain `NO_GO`.
- The UI records switch requirements; it does not approve, create a database
  client, read, upload, store, enable env flags or deploy.

SOP-VERIFY:
- Checker must verify dry-run switch tokens, preflight checklist tokens,
  enablement-gate proof tokens, component data attributes,
  `DRY_RUN_SWITCH_CONTRACT` state, forbidden tokens, package alias, no
  Supabase runtime, no database read, no fetch, no mutation APIs, no SQL
  migration, no AI call, no real data, no env enablement and no secret
  assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center read-only adapter dry-run switch contract.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this dry-run
  switch contract.
- If accepted, next safe slice is `HEU-DATA-023-TASK-CENTER-DRY-RUN-ENV-GATE-LEDGER`,
  still no DB read and no migration.
- Required next checker:
  `check:heu-task-center-dry-run-env-gate-ledger-readiness`.
