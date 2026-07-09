# HEU Data 006 Task Center Mock Readonly List

Task ID: HEU-DATA-006-TASK-CENTER-MOCK-READONLY-LIST
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-mock-readonly-list
Base branch: codex/heu/task-center-read-model-interface
Status: PASS_LOCAL_MOCK_READONLY_LIST
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_OWNER

## 1. Purpose

This slice adds a mock read-only Task Center list to the Data Confirmation
inbox so real HEU users can see how department tasks will look before any real
Task Center database table exists.

It helps the HEU modular monolith goal:

```text
One main HEU app.
One shared database later.
Department users see only scoped work.
AI remains draft/check/suggest only.
Cost stays low by avoiding AI calls and paid automation steps.
```

Required boundary:

```text
TASK_CENTER_MOCK_READONLY_LIST
MOCK_DATA_ONLY_NO_DATABASE_READ
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

The `/data-confirmation` UI can now show synthetic task examples for the same
visible lanes produced by `HEUWorkspaceContext` and the Task Center read-model
contract.

This lets IT_DATA, Audit and department owners review:

- whether each role sees the right lane,
- whether a task card/table is understandable,
- whether source refs are enough for workflow review,
- whether no raw sensitive data is needed in the inbox,
- whether no button accidentally approves, pays, mutates or triggers AI.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_005_TASK_CENTER_READ_MODEL_INTERFACE_20260710.md
docs/HEU_CONTROL/HEU_DATA_006_TASK_CENTER_MOCK_READONLY_LIST_20260710.md
lib/task-center-mock-read-model.ts
package.json
scripts/check-heu-task-center-mock-readonly-list-readiness.mjs
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

## 4. Mock Data Rules

Allowed mock data:

| Field | Rule |
|---|---|
| `taskId` | Synthetic ID such as `MOCK-ADMISSION-001` |
| `sourceRefType` | Must use `TASK_CENTER_SOURCE_REF_ALLOWLIST` |
| `sourceRefId` | Synthetic ref only, such as `lead_demo_ref_001` |
| `controlledEvidenceId` | Synthetic evidence ref only |
| `safeSummary` | Short non-sensitive summary |
| `status` | Must use `TASK_CENTER_STATUSES` |

Forbidden mock data:

- phone number,
- CCCD,
- bank account,
- email address,
- raw lead form,
- raw payment file,
- production evidence content,
- API key, password, token or secret.

## 5. No-Go Conditions

TASK_CENTER_DATABASE_READY: NO_GO

This slice is still NO-GO for:

- real Task Center database table,
- SQL migration,
- Supabase read/write,
- status mutation route,
- workflow approval,
- finance action,
- HOU COM calculation,
- paid automation,
- AI call,
- production deployment.

## 6. AI And Cost Boundary

AI/Codex may:

- inspect the mock list,
- suggest safer labels,
- check for missing control tokens,
- draft review notes for IT_DATA/Audit/Owner.

AI/Codex must not:

- create or update real tasks,
- approve a task,
- read raw restricted data,
- trigger Make/Zapier or another paid automation step,
- run migration or deploy.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-mock-readonly-list-readiness.mjs
npm.cmd run check:heu-task-center-mock-readonly-list-readiness
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
task rows, Auth changes, scope grants, AI calls, paid automation or production
config.

## 9. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-006` adds a mock read-only Task Center list for Data Confirmation.
- Scope is UI/mock-data/docs/checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-mock-readonly-list-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns workspace/role/scope mapping.
- Audit owns negative-access and event-log review.
- Department owners own final usability review.

SOP-LEGAL:
- PHAP_CHE must review restricted-data boundary before real database work.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Mock list can be `PASS_LOCAL` while database and production remain `NO_GO`.
- UI consumes synthetic refs only; it does not fetch, mutate or approve task
  rows.

SOP-VERIFY:
- Checker must verify mock file tokens, UI data attributes, doc tokens,
  package alias, no mutation APIs, no SQL path, no AI call, no automation step
  and no secret assignment.

SOP-RESULT:
- `PASS_LOCAL` for mock read-only Task Center list.
- `CAN_SUA_IT_DATA_AUDIT_OWNER` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- Review mock list with IT_DATA + Audit + 1 department owner.
- If accepted, next safe slice is read-only DB query design or route-level
  feature flag plan, still no mutation and no migration until gates close.
