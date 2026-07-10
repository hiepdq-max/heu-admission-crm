# HEU Data 009 Task Center UI Fallback Wiring

Task ID: HEU-DATA-009-TASK-CENTER-UI-FALLBACK-WIRING
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-ui-fallback-wiring
Base branch: codex/heu/task-center-readonly-adapter-skeleton
Status: PASS_LOCAL_UI_FALLBACK_WIRING
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER

## 1. Purpose

This slice wires the Data Confirmation UI through a Task Center fallback source.

The UI can now choose the safe display source without enabling a database read:

```text
TASK_CENTER_UI_FALLBACK_WIRING_ONLY
MOCK_READONLY_FALLBACK_ACTIVE
DISABLED_ADAPTER_OUTPUT_ONLY
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

Before this slice, `/data-confirmation` rendered mock tasks directly.

After this slice, `/data-confirmation` uses:

```text
createTaskCenterUiFallbackSource
```

The fallback source:

- creates the disabled adapter skeleton,
- confirms the adapter status is `DISABLED_BY_DEFAULT`,
- exposes empty adapter rows,
- selects mock readonly tasks for display,
- keeps all DB/AI/automation boundaries visible in UI data attributes.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_008_TASK_CENTER_READONLY_ADAPTER_SKELETON_20260710.md
docs/HEU_CONTROL/HEU_DATA_009_TASK_CENTER_UI_FALLBACK_WIRING_20260710.md
lib/task-center-ui-fallback-source.ts
package.json
scripts/check-heu-task-center-readonly-adapter-skeleton-readiness.mjs
scripts/check-heu-task-center-ui-fallback-wiring-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. UI Rules

The UI fallback wiring must:

- use `createTaskCenterUiFallbackSource`,
- show `MOCK_READONLY_FALLBACK_ACTIVE`,
- keep adapter output `DISABLED_ADAPTER_OUTPUT_ONLY`,
- keep adapter rows empty,
- keep no DB client/read,
- keep no mutation route,
- keep no AI call,
- keep no automation step,
- keep no approval/payment/COM/production action.

## 5. No-Go Conditions

TASK_CENTER_DATABASE_READY: NO_GO

This slice is still NO-GO for:

- Supabase client creation,
- database read,
- database write,
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

- review fallback wiring,
- suggest safer labels,
- detect accidental DB/AI/automation enablement,
- draft review comments.

AI/Codex must not:

- enable database reads,
- read real task/student/payment data,
- create or update real tasks,
- run SQL,
- trigger paid automation,
- decide production readiness.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-ui-fallback-wiring-readiness.mjs
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

Before any real Task Center DB read:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | UI fallback source and future feature flag strategy |
| Audit | no broad fallback and no live DB read |
| PHAP_CHE | no restricted raw data exposed in mock/fallback UI |
| Department owner | task display is understandable |
| BGH | production remains NO-GO until UAT/evidence/rollback |

## 9. Rollback

Rollback by reverting the PR that adds this UI fallback wiring.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, AI calls, paid automation or production
config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-009` wires Data Confirmation UI through a fallback source.
- Scope is UI fallback source + component wiring + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-ui-fallback-wiring-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns future adapter activation gate.
- Audit owns no-broad-fallback and negative-access proof.
- Department owners own final usability review.

SOP-LEGAL:
- PHAP_CHE must approve restricted-data boundary before any DB read.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- UI fallback wiring can be `PASS_LOCAL` while database and production remain
  `NO_GO`.
- UI selects mock data because adapter output is disabled and empty.

SOP-VERIFY:
- Checker must verify fallback source tokens, component data attributes,
  disabled adapter output, package alias, no Supabase runtime, no database
  read, no fetch, no mutation APIs, no SQL migration, no AI call and no secret
  assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center UI fallback wiring.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE review this UI fallback wiring.
- If accepted, next safe slice is owner-review checklist for enabling a real
  read-only adapter, still no migration and no DB read until gates close.
