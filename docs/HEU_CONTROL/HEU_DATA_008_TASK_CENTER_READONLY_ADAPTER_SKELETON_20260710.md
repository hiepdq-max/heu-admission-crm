# HEU Data 008 Task Center Readonly Adapter Skeleton

Task ID: HEU-DATA-008-TASK-CENTER-READONLY-ADAPTER-SKELETON
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-readonly-adapter-skeleton
Base branch: codex/heu/task-center-readonly-query-plan
Status: PASS_LOCAL_READONLY_ADAPTER_SKELETON
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER

## 1. Purpose

This slice adds a disabled-by-default adapter skeleton for future Task Center
read-only database access.

It is not a database adapter yet. It is only the safe seam where a future
read-only implementation can be attached after owner review.

Required boundary:

```text
TASK_CENTER_READONLY_ADAPTER_SKELETON_ONLY
DISABLED_BY_DEFAULT
FEATURE_FLAG_REQUIRED
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

The skeleton produces:

- the approved `TaskCenterReadonlyQueryPlan`,
- a disabled adapter status,
- empty `rows`,
- explicit boundaries proving no DB client/read/write exists.

This helps HEU move toward a shared database without creating a broad fallback
or accidental live read path.

## 3. Scope

Files in scope:

```text
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_007_TASK_CENTER_READONLY_QUERY_PLAN_20260710.md
docs/HEU_CONTROL/HEU_DATA_008_TASK_CENTER_READONLY_ADAPTER_SKELETON_20260710.md
lib/task-center-readonly-adapter-skeleton.ts
package.json
scripts/check-heu-task-center-readonly-adapter-skeleton-readiness.mjs
scripts/check-heu-task-center-readonly-query-plan-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Adapter Rules

The adapter skeleton must:

- stay `DISABLED_BY_DEFAULT`,
- require `FEATURE_FLAG_REQUIRED`,
- return empty `rows`,
- use `createTaskCenterReadonlyQueryPlan`,
- keep `SCOPE_FIRST_QUERY_REQUIRED`,
- keep `NO_BROAD_FALLBACK`,
- keep `TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY`,
- avoid creating a database client,
- avoid reading task rows,
- avoid writing task rows or audit events.

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

- review the adapter skeleton,
- suggest missing gates,
- detect broad fallback risk,
- draft review comments.

AI/Codex must not:

- enable the adapter,
- read real task/student/payment data,
- create or update real tasks,
- run SQL,
- trigger paid automation,
- decide production readiness.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-readonly-adapter-skeleton-readiness.mjs
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

Before any future read-only adapter implementation:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | feature flag name, default-off behavior and scope-first filters |
| Audit | negative-access evidence and no broad fallback |
| PHAP_CHE | no restricted raw data exposed |
| Department owner | visible task labels and lane usefulness |
| BGH | production remains NO-GO until UAT/evidence/rollback |

## 9. Rollback

Rollback by reverting the PR that adds this skeleton.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, AI calls, paid automation or production
config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-008` adds a disabled Task Center read-only adapter skeleton.
- Scope is TypeScript skeleton + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-readonly-adapter-skeleton-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns adapter activation gate.
- Audit owns no-broad-fallback and negative-access proof.
- Department owners own final usability review.

SOP-LEGAL:
- PHAP_CHE must approve restricted-data boundary before any DB read.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Adapter skeleton can be `PASS_LOCAL` while database and production remain
  `NO_GO`.
- Skeleton returns empty rows and exposes boundaries only; it does not query
  Supabase or mutate rows.

SOP-VERIFY:
- Checker must verify adapter tokens, disabled-by-default state, feature flag
  requirement, empty rows, package alias, no Supabase runtime, no database
  read, no fetch, no mutation APIs, no SQL migration, no AI call and no secret
  assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center read-only adapter skeleton.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE review this skeleton.
- If accepted, next safe slice is UI fallback wiring that can choose mock data
  or disabled adapter output without enabling DB reads.
