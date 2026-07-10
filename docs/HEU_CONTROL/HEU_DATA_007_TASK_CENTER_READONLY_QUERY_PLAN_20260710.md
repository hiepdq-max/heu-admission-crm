# HEU Data 007 Task Center Readonly Query Plan

Task ID: HEU-DATA-007-TASK-CENTER-READONLY-QUERY-PLAN
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-readonly-query-plan
Base branch: codex/heu/task-center-mock-readonly-list
Status: PASS_LOCAL_READONLY_QUERY_PLAN
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER

## 1. Purpose

This slice prepares the Task Center read-only database path without connecting
to the database.

It adds a TypeScript query contract for future read-only Task Center access so
HEU can move from mock list to real scoped task reads later while preserving:

```text
TASK_CENTER_READONLY_QUERY_PLAN_ONLY
SCOPE_FIRST_QUERY_REQUIRED
TASK_CENTER_DATABASE_READY_NO_GO_QUERY_PLAN_ONLY
NO_BROAD_FALLBACK
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Why This Matters

The HEU target is one modular monolith app with one shared database. That only
works if every read path is scope-first.

Before any real Task Center table exists, IT_DATA and Audit need agreement on:

- which columns can be selected,
- which scope filters are mandatory,
- which departments/lane codes are allowed,
- how large each page can be,
- which statuses are visible,
- what remains forbidden until UAT and owner approval.

## 3. Query Contract

The contract file is:

```text
lib/task-center-readonly-query-contract.ts
```

Required scope filters:

```text
workspace_id
admission_segment_id
department_code
owner_role_code
```

Required result cap:

```text
TASK_CENTER_READONLY_PAGE_SIZE_LIMIT = 50
```

Allowed selected columns are metadata/ref-only columns such as:

```text
task_id
workspace_id
admission_segment_id
department_code
owner_role_code
owner_user_id
source_module
source_ref_type
source_ref_id
controlled_evidence_id
title
status
priority
due_at
created_at
updated_at
closed_at
```

## 4. No Broad Fallback Rule

NO_BROAD_FALLBACK

If a user has no matching workspace, admission segment, department, role or
read gate, the future DB query must return no task rows. It must not fallback
to all workspaces, all departments, all roles or all tasks.

## 5. No-Go Conditions

TASK_CENTER_DATABASE_READY: NO_GO

This slice is still NO-GO for:

- creating `TASK_CENTER`,
- creating `TASK_CENTER_EVENT_LOG`,
- running SQL migration,
- adding Supabase query runtime,
- adding server action,
- changing task status,
- writing audit events,
- approving workflow,
- executing finance/HOU actions,
- calling AI,
- triggering Make/Zapier or another paid automation,
- deploying production.

## 6. AI And Cost Boundary

AI/Codex may:

- review the query contract,
- suggest missing filters,
- detect broad fallback risk,
- draft comments for IT_DATA/Audit/PHAP_CHE.

AI/Codex must not:

- read real task/student/payment data,
- create or update real tasks,
- run SQL,
- approve the read path,
- call paid automation,
- decide production readiness.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-readonly-query-plan-readiness.mjs
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

Before the next real read-only DB implementation slice:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | workspace/role/scope filters and no broad fallback |
| Audit | negative-access evidence and event-log dependency |
| PHAP_CHE | no restricted raw data in selected columns |
| Department owner | lane visibility and task labels |
| BGH | production remains NO-GO until UAT/evidence/rollback |

## 9. Rollback

Rollback by reverting the PR that adds this query plan.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, AI calls, paid automation or production
config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-007` adds a Task Center read-only query contract.
- Scope is TypeScript contract + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-readonly-query-plan-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns scope-first query design.
- Audit owns no-broad-fallback and negative-access proof.
- Department owners own final lane usability review.

SOP-LEGAL:
- PHAP_CHE must approve restricted-data boundary before any real DB read.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Query plan can be `PASS_LOCAL` while database and production remain `NO_GO`.
- Contract defines selected columns and filters only; it does not query
  Supabase or mutate rows.

SOP-VERIFY:
- Checker must verify query-plan tokens, select-column allowlist, required
  scope filters, page-size cap, package alias, no Supabase runtime, no fetch,
  no mutation APIs, no SQL migration, no AI call and no secret assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center read-only query plan.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit review this plan.
- If accepted, next safe slice is a feature-flagged read-only adapter skeleton,
  still disabled by default and still no migration until gates close.
