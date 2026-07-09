# HEU Data 005 Task Center Read Model Interface

Task ID: HEU-DATA-005-TASK-CENTER-READ-MODEL-INTERFACE
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-read-model-interface
Base branch: codex/heu/task-center-data-contract
Status: PASS_LOCAL_READ_MODEL_INTERFACE
Production status: NO-GO

## 1. Purpose

This slice turns the HEU Task Center data contract into a TypeScript read-model
interface used by the Data Confirmation inbox.

It does not create database tables, SQL, RPC, triggers, RLS policies, task
mutation routes, AI calls, paid automation or production deployment.

Required boundary:

```text
TASK_CENTER_READ_MODEL_INTERFACE_CONTRACT_ONLY
NO_TASK_TABLE_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

The application now has one shared source for:

- task statuses,
- department codes,
- source ref allowlist,
- required task columns,
- role groups,
- department lanes,
- lane visibility by role/scope,
- read-only lane status.

This reduces drift between docs and UI before real Task Center tables exist.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_004_TASK_CENTER_DATA_CONTRACT_20260710.md
docs/HEU_CONTROL/HEU_DATA_005_TASK_CENTER_READ_MODEL_INTERFACE_20260710.md
lib/task-center-contract.ts
package.json
scripts/check-heu-task-center-data-contract-readiness.mjs
scripts/check-heu-task-center-read-model-interface-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Contract Tokens

`lib/task-center-contract.ts` must include:

```text
TASK_CENTER_STATUSES
TASK_CENTER_STATUS_TRANSITIONS
TASK_CENTER_DEPARTMENT_CODES
TASK_CENTER_SOURCE_REF_ALLOWLIST
TASK_CENTER_REQUIRED_COLUMNS
TASK_CENTER_ROLE_GROUPS
TASK_CENTER_DEPARTMENT_LANES
getVisibleTaskCenterLanes
resolveTaskCenterLaneStatus
TASK_CENTER_READ_MODEL_INTERFACE_CONTRACT_ONLY
NO_TASK_TABLE_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 5. No-Go Conditions

The read-model interface remains NO-GO for real database usage until:

- IT_DATA approves data dictionary,
- Audit approves event log contract,
- PHAP_CHE confirms restricted data is not stored,
- department owners approve status workflow,
- backup/restore evidence exists,
- RLS negative-access plan exists,
- rollback and feature flag are approved.

## 6. AI And Cost Boundary

AI/Codex may check the TypeScript contract and suggest draft task metadata.

AI/Codex must not:

- create/update production tasks,
- approve statuses,
- read raw restricted data,
- trigger paid automation,
- run migration or deploy.

No default AI call is introduced by this slice.

## 7. Required Local Commands

```powershell
npm.cmd run check:heu-task-center-read-model-interface-readiness
npm.cmd run check:heu-task-center-data-contract-readiness
npm.cmd run check:heu-department-task-inbox-mvp-readiness
npm.cmd run check:heu-data-confirmation-task-center
npm.cmd run check:heu-app-shell-draft-pr-readiness
npm.cmd run lint
npm.cmd run build -- --webpack
```

The build command may use dummy public Supabase env values only. Do not use
real secrets in Git/Codex/chat.

## 8. Rollback

Rollback by reverting the PR that adds this slice.

No database rollback is required because this slice does not create schema,
Auth changes, scope grants, task rows, AI calls, paid automation or production
config.

## 9. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-005` adds a TypeScript read-model interface for Task Center.
- Scope is UI/control/types + read-only checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-read-model-interface-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns role/scope mapping and future RLS.
- Audit owns event log and negative-access proof.
- Department owners own final workflow acceptance.

SOP-LEGAL:
- PHAP_CHE must review restricted-data boundary before database work.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Interface can be `PASS_LOCAL` while database and production remain `NO_GO`.
- UI reads contract constants only; it does not fetch or mutate task rows.

SOP-VERIFY:
- Checker must verify contract tokens, component import, no mutation APIs,
  no SQL path, package alias and no secret assignments.

SOP-RESULT:
- `PASS_LOCAL` for Task Center read-model interface.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- Review this read-model interface with IT_DATA + Audit.
- Next safe slice is either a commented SQL draft or a mock read-only task list,
  still no migration and no production mutation.
