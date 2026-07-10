# HEU Data 021 Task Center Adapter Preflight Checklist

Task ID: HEU-DATA-021-TASK-CENTER-ADAPTER-PREFLIGHT-CHECKLIST
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-adapter-preflight-checklist
Base branch: codex/heu/task-center-owner-gate-evidence-matrix
Status: PASS_LOCAL_ADAPTER_PREFLIGHT_CHECKLIST
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice defines the preflight checklist required before any future Task
Center DB-read adapter dry-run can be enabled.

It does not approve owner gates, create a database client, read database rows,
mutate task rows, store audit events, enable env flags, upload files, call AI,
run automation, run SQL, or deploy.

Required boundary:

```text
TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_ONLY
TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_READONLY
TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_DRAFT_ONLY
TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_APPROVAL
TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_READ
TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_DATABASE_CLIENT
TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_TASK_MUTATION
TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_REAL_DATA
TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_ENV_ENABLEMENT
TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_NO_AI_OR_AUTOMATION
PREFLIGHT_REQUIRED
TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_REAL_USER_DATA
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Checklist Rows

The adapter preflight checklist is displayed from:

```text
lib/task-center-gate-evidence-panel-source.ts
components/data-confirmation/department-task-inbox.tsx
```

It lists:

- `PREFLIGHT_SCOPE_FILTER_SIGNOFF`.
- `PREFLIGHT_NEGATIVE_ACCESS_EVIDENCE`.
- `PREFLIGHT_RESTRICTED_FIELD_ALLOWLIST`.
- `PREFLIGHT_OWNER_LABEL_ACCEPTANCE`.
- `PREFLIGHT_BGH_NO_GO_ACK`.

Every row stays `PREFLIGHT_REQUIRED`. This is not an approval screen and not a
production gate.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_020_TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_20260710.md
docs/HEU_CONTROL/HEU_DATA_021_TASK_CENTER_ADAPTER_PREFLIGHT_CHECKLIST_20260710.md
lib/task-center-gate-evidence-panel-source.ts
package.json
scripts/check-heu-task-center-owner-gate-evidence-matrix-readiness.mjs
scripts/check-heu-task-center-adapter-preflight-checklist-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Preflight Rules

| Code | Checklist owner | Preflight state | Required before adapter read | Pass condition | Forbidden in this slice |
|---|---|---|---|---|---|
| `PREFLIGHT_SCOPE_FILTER_SIGNOFF` | `IT_DATA` | `PREFLIGHT_REQUIRED` | `IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF` | Scope-first filter contract is signed off and mapped to workspace/role/lane. | `NO_DATABASE_CLIENT_CREATED` |
| `PREFLIGHT_NEGATIVE_ACCESS_EVIDENCE` | `AUDIT` | `PREFLIGHT_REQUIRED` | `AUDIT_NEGATIVE_ACCESS_EVIDENCE` | Negative-access evidence covers excluded lanes and no broad fallback. | `NO_DATABASE_READ_EXECUTED` |
| `PREFLIGHT_RESTRICTED_FIELD_ALLOWLIST` | `PHAP_CHE` | `PREFLIGHT_REQUIRED` | `PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF` | Metadata allowlist excludes CCCD, phone, payment and raw PII. | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `PREFLIGHT_OWNER_LABEL_ACCEPTANCE` | `DEPARTMENT_OWNER` | `PREFLIGHT_REQUIRED` | `DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE` | Department owner accepts task labels and readonly copy. | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `PREFLIGHT_BGH_NO_GO_ACK` | `BGH` | `PREFLIGHT_REQUIRED` | `BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT` | BGH acknowledges adapter remains pre-production and NO-GO. | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. No-Go Conditions

TASK_CENTER_DATABASE_READY: NO_GO

This slice is still NO-GO for:

- owner approval,
- Supabase client creation,
- database read,
- database write,
- env/feature flag enablement,
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

- verify that preflight requirements are visible,
- check that every row remains `PREFLIGHT_REQUIRED`,
- detect accidental DB/AI/automation enablement,
- draft review comments.

AI/Codex must not:

- approve any preflight row,
- implement the adapter in this slice,
- enable feature flags or env values,
- create a Supabase client,
- enable database reads,
- read real task/student/payment data,
- run SQL,
- trigger paid automation,
- decide production readiness.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-adapter-preflight-checklist-readiness.mjs
node --check scripts/check-heu-task-center-owner-gate-evidence-matrix-readiness.mjs
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

Before any future adapter dry-run switch PR:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | scope-first filter contract is sufficient |
| AUDIT | negative-access evidence is sufficient |
| PHAP_CHE | restricted-data allowlist is sufficient |
| DEPARTMENT_OWNER | task labels and readonly copy are accepted |
| BGH | production NO-GO acknowledgement is sufficient |

## 9. Rollback

Rollback by reverting the PR that adds this adapter preflight checklist.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, uploads, storage writes, AI calls, paid
automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-021` adds a read-only adapter preflight checklist for the Task
  Center adapter.
- Scope is UI checklist + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-adapter-preflight-checklist-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns scope-first filter signoff.
- Audit owns negative-access evidence.
- Department owners own task label acceptance.

SOP-LEGAL:
- PHAP_CHE owns restricted-field allowlist and no-real-data boundary.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Adapter preflight checklist can be `PASS_LOCAL` while database and
  production remain `NO_GO`.
- The UI records preflight requirements; it does not approve, create a database
  client, read, upload, store, enable env flags or deploy.

SOP-VERIFY:
- Checker must verify preflight checklist tokens, owner gate evidence tokens,
  enablement-gate proof tokens, component data attributes,
  `PREFLIGHT_REQUIRED` state, forbidden tokens, package alias, no Supabase
  runtime, no database read, no fetch, no mutation APIs, no SQL migration,
  no AI call, no real data, no env enablement and no secret assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center adapter preflight checklist.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this adapter
  preflight checklist.
- If accepted, next safe slice is `HEU-DATA-022-TASK-CENTER-READONLY-ADAPTER-DRY-RUN-SWITCH-CONTRACT`,
  still no DB read and no migration.
- Required next checker:
  `check:heu-task-center-readonly-adapter-dry-run-switch-contract-readiness`.
