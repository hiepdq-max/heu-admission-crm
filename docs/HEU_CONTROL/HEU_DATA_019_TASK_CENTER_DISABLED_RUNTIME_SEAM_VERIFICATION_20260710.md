# HEU Data 019 Task Center Disabled Runtime Seam Verification

Task ID: HEU-DATA-019-TASK-CENTER-DISABLED-RUNTIME-SEAM-VERIFICATION
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-disabled-runtime-seam-verification
Base branch: codex/heu/task-center-adapter-test-fixture-contract
Status: PASS_LOCAL_DISABLED_RUNTIME_SEAM_VERIFICATION
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice verifies that the Task Center runtime seam remains disabled before a
future DB-read adapter is implemented.

It does not create a database client, read database rows, mutate task rows,
store audit events, enable env flags, upload files, call AI, run automation,
run SQL, or deploy.

Required boundary:

```text
TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_ONLY
TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_READONLY
TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_DRAFT_ONLY
TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_READ
TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_DATABASE_CLIENT
TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_TASK_MUTATION
TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_REAL_DATA
TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_ENV_ENABLEMENT
TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_NO_AI_OR_AUTOMATION
TASK_CENTER_READONLY_ADAPTER_DISABLED_BY_DEFAULT
TASK_CENTER_MOCK_READONLY_FALLBACK_ACTIVE
TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_REAL_USER_DATA
NO_ENV_ENABLEMENT
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Seams Verified

This slice verifies these files:

```text
lib/task-center-readonly-adapter-skeleton.ts
lib/task-center-ui-fallback-source.ts
lib/task-center-gate-evidence-panel-source.ts
components/data-confirmation/department-task-inbox.tsx
```

Expected invariants:

- `createTaskCenterReadonlyAdapterSkeleton` returns `DISABLED_BY_DEFAULT`.
- `createTaskCenterUiFallbackSource` returns `MOCK_READONLY_FALLBACK_ACTIVE`.
- `adapterRows` remains `readonly []`.
- No env or feature flag enables adapter in this slice.
- Production remains NO-GO.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_018_TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_20260710.md
docs/HEU_CONTROL/HEU_DATA_019_TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_20260710.md
lib/task-center-gate-evidence-panel-source.ts
lib/task-center-readonly-adapter-skeleton.ts
lib/task-center-ui-fallback-source.ts
package.json
scripts/check-heu-task-center-adapter-test-fixture-contract-readiness.mjs
scripts/check-heu-task-center-disabled-runtime-seam-verification-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Verification Rules

| Code | Seam state | Verified runtime seam | Required before enablement | Forbidden in this slice |
|---|---|---|---|---|
| `RUNTIME_SEAM_ADAPTER_DISABLED_DEFAULT` | `DISABLED_RUNTIME_SEAM` | `createTaskCenterReadonlyAdapterSkeleton` returns `DISABLED_BY_DEFAULT`. | `FEATURE_FLAG_REQUIRED_AND_OWNER_GATES` | `NO_DATABASE_CLIENT_CREATED` |
| `RUNTIME_SEAM_FALLBACK_SOURCE_ACTIVE` | `DISABLED_RUNTIME_SEAM` | `createTaskCenterUiFallbackSource` returns `MOCK_READONLY_FALLBACK_ACTIVE`. | `MOCK_FALLBACK_CONFIRMED` | `NO_DATABASE_READ_EXECUTED` |
| `RUNTIME_SEAM_EMPTY_ADAPTER_ROWS` | `DISABLED_RUNTIME_SEAM` | `adapterRows` remains readonly empty array until DB read approval. | `AUDIT_NEGATIVE_ACCESS_EVIDENCE` | `NO_REAL_USER_DATA` |
| `RUNTIME_SEAM_NO_ENV_ENABLEMENT` | `DISABLED_RUNTIME_SEAM` | No env or feature flag enables adapter in this slice. | `IT_DATA_RUNTIME_FLAG_SIGNOFF` | `NO_ENV_ENABLEMENT` |
| `RUNTIME_SEAM_PRODUCTION_NO_GO` | `DISABLED_RUNTIME_SEAM` | Production remains NO-GO while seam verification is local only. | `BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT` | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. No-Go Conditions

TASK_CENTER_DATABASE_READY: NO_GO

This slice is still NO-GO for:

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

- verify that the runtime seam remains disabled,
- check that fallback remains active,
- detect accidental DB/AI/automation enablement,
- draft review comments.

AI/Codex must not:

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
node --check scripts/check-heu-task-center-disabled-runtime-seam-verification-readiness.mjs
node --check scripts/check-heu-task-center-adapter-test-fixture-contract-readiness.mjs
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

Before any future adapter implementation PR:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | runtime flag/enablement path is still blocked |
| AUDIT | disabled seam and empty rows are acceptable evidence |
| PHAP_CHE | no real data or restricted data is used |
| DEPARTMENT_OWNER | fallback copy remains understandable |
| BGH | production remains NO-GO |

## 9. Rollback

Rollback by reverting the PR that adds this disabled runtime seam verification.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, uploads, storage writes, AI calls, paid
automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-019` verifies that the Task Center adapter runtime seam remains
  disabled.
- Scope is UI verification + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-disabled-runtime-seam-verification-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns runtime enablement path and feature-flag boundary.
- Audit owns disabled seam and empty-row evidence.
- Department owners own fallback language.

SOP-LEGAL:
- PHAP_CHE owns no-real-data and restricted-data boundary.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Disabled runtime seam verification can be `PASS_LOCAL` while database and
  production remain `NO_GO`.
- The UI records seam invariants; it does not create a database client, read,
  upload, approve, store, enable env flags or deploy.

SOP-VERIFY:
- Checker must verify runtime seam tokens, adapter skeleton tokens, fallback
  source tokens, component data attributes, `DISABLED_RUNTIME_SEAM` state,
  forbidden tokens, package alias, no Supabase runtime, no database read,
  no fetch, no mutation APIs, no SQL migration, no AI call, no real data,
  no env enablement and no secret assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center disabled runtime seam verification.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this disabled
  runtime seam verification.
- If accepted, next safe slice is Task Center read-only adapter owner gate evidence matrix, still no DB read and no migration.
