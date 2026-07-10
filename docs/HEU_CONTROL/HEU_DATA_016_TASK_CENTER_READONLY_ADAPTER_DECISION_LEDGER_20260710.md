# HEU Data 016 Task Center Readonly Adapter Decision Ledger

Task ID: HEU-DATA-016-TASK-CENTER-READONLY-ADAPTER-DECISION-LEDGER
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-readonly-adapter-decision-ledger
Base branch: codex/heu/task-center-owner-signoff-routing-map
Status: PASS_LOCAL_READONLY_ADAPTER_DECISION_LEDGER
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice adds a read-only adapter decision ledger to the Task Center gate
evidence panel.

The ledger records why the future Task Center DB adapter must remain in
`HOLD_NO_GO` until owner evidence is available. It does not approve, upload,
write storage, read database rows, mutate task rows, run AI, or trigger
automation.

Required boundary:

```text
TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_ONLY
TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_READONLY
TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_DRAFT_ONLY
TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_APPROVAL
TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_DATABASE_READ
TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_TASK_MUTATION
TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_NO_AI_OR_AUTOMATION
TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

The decision ledger source is:

```text
lib/task-center-gate-evidence-panel-source.ts
```

The user-facing UI is:

```text
components/data-confirmation/department-task-inbox.tsx
```

It displays decision rows:

- `ADAPTER_LEDGER_SCOPE_FILTER_HOLD`.
- `ADAPTER_LEDGER_NEGATIVE_ACCESS_HOLD`.
- `ADAPTER_LEDGER_RESTRICTED_DATA_HOLD`.
- `ADAPTER_LEDGER_DEPARTMENT_LABEL_HOLD`.
- `ADAPTER_LEDGER_BGH_PRODUCTION_HOLD`.

Every row stays `HOLD_NO_GO` until the required owner evidence exists. This is
a decision ledger only, not an approval ledger.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_015_TASK_CENTER_OWNER_SIGNOFF_ROUTING_MAP_20260710.md
docs/HEU_CONTROL/HEU_DATA_016_TASK_CENTER_READONLY_ADAPTER_DECISION_LEDGER_20260710.md
lib/task-center-gate-evidence-panel-source.ts
package.json
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

## 4. Decision Ledger Rules

| Code | Owner lane | Decision | Required before DB read |
|---|---|---|---|
| `ADAPTER_LEDGER_SCOPE_FILTER_HOLD` | IT_DATA | `HOLD_NO_GO` | `IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF` |
| `ADAPTER_LEDGER_NEGATIVE_ACCESS_HOLD` | AUDIT | `HOLD_NO_GO` | `AUDIT_NEGATIVE_ACCESS_EVIDENCE` |
| `ADAPTER_LEDGER_RESTRICTED_DATA_HOLD` | PHAP_CHE | `HOLD_NO_GO` | `PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF` |
| `ADAPTER_LEDGER_DEPARTMENT_LABEL_HOLD` | DEPARTMENT_OWNER | `HOLD_NO_GO` | `DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE` |
| `ADAPTER_LEDGER_BGH_PRODUCTION_HOLD` | BGH | `HOLD_NO_GO` | `BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT` |

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

- review whether decision wording is clear,
- check that every decision remains `HOLD_NO_GO`,
- detect accidental DB/AI/automation enablement,
- draft review comments.

AI/Codex must not:

- mark any decision approved,
- enable database reads,
- read real task/student/payment data,
- run SQL,
- trigger paid automation,
- decide production readiness.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-readonly-adapter-decision-ledger-readiness.mjs
node --check scripts/check-heu-task-center-owner-signoff-routing-map-readiness.mjs
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

Before any future DB adapter change:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | `HOLD_NO_GO` can change only after scope-first filter signoff |
| AUDIT | `HOLD_NO_GO` can change only after negative-access evidence review |
| PHAP_CHE | `HOLD_NO_GO` can change only after restricted-data boundary review |
| DEPARTMENT_OWNER | `HOLD_NO_GO` can change only after department labels are accepted |
| BGH | production remains NO-GO |

## 9. Rollback

Rollback by reverting the PR that adds this readonly adapter decision ledger.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, uploads, storage writes, AI calls, paid
automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-016` adds a read-only adapter decision ledger to the Task Center
  panel.
- Scope is UI ledger + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-readonly-adapter-decision-ledger-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns scope-first hold decision.
- Audit owns negative-access hold decision.
- Department owners own label-acceptance hold decision.

SOP-LEGAL:
- PHAP_CHE owns restricted-data hold decision.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Read-only adapter decision ledger can be `PASS_LOCAL` while database and
  production remain `NO_GO`.
- The UI records hold decisions; it does not collect, upload, approve or store.

SOP-VERIFY:
- Checker must verify ledger tokens, component data attributes, owner lanes,
  `HOLD_NO_GO` decisions, package alias, no Supabase runtime, no database read,
  no fetch, no mutation APIs, no SQL migration, no AI call and no secret
  assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center readonly adapter decision ledger.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this decision
  ledger.
- If accepted, next safe slice is Task Center DB-read adapter implementation plan, still no DB read and no migration.
