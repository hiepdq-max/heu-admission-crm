# HEU Data 012 Task Center Real User UAT Copy

Task ID: HEU-DATA-012-TASK-CENTER-REAL-USER-UAT-COPY
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-real-user-uat-copy
Base branch: codex/heu/task-center-gate-evidence-panel
Status: PASS_LOCAL_REAL_USER_UAT_COPY
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice adds real-user UAT copy to the Task Center gate evidence panel.

The copy tells a pilot user what they may check, what they must not do, and
who to report problems to while the system still uses mock/fallback Task Center
data.

Required boundary:

```text
TASK_CENTER_REAL_USER_UAT_COPY_ONLY
TASK_CENTER_REAL_USER_UAT_COPY_READONLY
TASK_CENTER_REAL_USER_UAT_COPY_NO_APPROVAL
TASK_CENTER_REAL_USER_UAT_COPY_NO_DATA_ENTRY
TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

The UAT copy source is:

```text
lib/task-center-gate-evidence-panel-source.ts
```

The user-facing UI is:

```text
components/data-confirmation/department-task-inbox.tsx
```

It displays three groups:

- `UAT_CAN_VIEW_SCOPE`, `UAT_CAN_CHECK_LABEL`, `UAT_CAN_REPORT_GAP`.
- `UAT_BLOCK_APPROVAL`, `UAT_BLOCK_REAL_DATA_ENTRY`,
  `UAT_BLOCK_DB_ENABLEMENT`.
- `UAT_REPORT_IT_DATA`, `UAT_REPORT_AUDIT`, `UAT_REPORT_OWNER`.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_011_TASK_CENTER_GATE_EVIDENCE_PANEL_20260710.md
docs/HEU_CONTROL/HEU_DATA_012_TASK_CENTER_REAL_USER_UAT_COPY_20260710.md
lib/task-center-gate-evidence-panel-source.ts
package.json
scripts/check-heu-task-center-gate-evidence-panel-readiness.mjs
scripts/check-heu-task-center-real-user-uat-copy-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. User UAT Copy Rules

Allowed checks:

| Code | Meaning |
|---|---|
| `UAT_CAN_VIEW_SCOPE` | User checks whether their visible lane/scope looks correct |
| `UAT_CAN_CHECK_LABEL` | User checks task labels, owner lane and proof wording |
| `UAT_CAN_REPORT_GAP` | User reports gaps without editing real data |

Blocked actions:

| Code | Meaning |
|---|---|
| `UAT_BLOCK_APPROVAL` | User must not approve from this panel |
| `UAT_BLOCK_REAL_DATA_ENTRY` | User must not enter real CCCD, phone, payment, debt or COM data |
| `UAT_BLOCK_DB_ENABLEMENT` | User must not request DB enablement from this panel |

Report lanes:

| Code | Meaning |
|---|---|
| `UAT_REPORT_IT_DATA` | Scope/role/workspace display issue |
| `UAT_REPORT_AUDIT` | Gate/proof/risk issue |
| `UAT_REPORT_OWNER` | Department language or usability issue |

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

- review whether UAT copy is clear,
- check that the copy does not imply approval,
- detect accidental DB/AI/automation enablement,
- draft review comments.

AI/Codex must not:

- mark any owner lane approved,
- enable database reads,
- read real task/student/payment data,
- run SQL,
- trigger paid automation,
- decide production readiness.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-real-user-uat-copy-readiness.mjs
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

Before using this with real users, review the wording:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | scope/report wording is technically correct |
| AUDIT | no approval, no data mutation and no production implication |
| PHAP_CHE | no restricted-data instruction |
| DEPARTMENT_OWNER | department wording is understandable |
| BGH | production remains NO-GO |

## 9. Rollback

Rollback by reverting the PR that adds this UAT copy.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, AI calls, paid automation or production
config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-012` adds real-user UAT copy to the Task Center gate evidence
  panel.
- Scope is UI copy + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-real-user-uat-copy-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns scope/report wording.
- Audit owns no-approval and no-mutation wording.
- Department owners own final usability language.

SOP-LEGAL:
- PHAP_CHE must confirm the copy does not ask for restricted raw data.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Real-user UAT copy can be `PASS_LOCAL` while database and production remain
  `NO_GO`.
- The UI guides users; it does not collect approvals or real data.

SOP-VERIFY:
- Checker must verify UAT copy tokens, component data attributes, blocked
  actions, report lanes, package alias, no Supabase runtime, no database read,
  no fetch, no mutation APIs, no SQL migration, no AI call and no secret
  assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center real-user UAT copy.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this UAT copy.
- If accepted, next safe slice is real-user UAT checklist evidence capture,
  still no DB read and no migration.
