# HEU Data 018 Task Center Adapter Test Fixture Contract

Task ID: HEU-DATA-018-TASK-CENTER-ADAPTER-TEST-FIXTURE-CONTRACT
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-adapter-test-fixture-contract
Base branch: codex/heu/task-center-db-read-adapter-implementation-plan
Status: PASS_LOCAL_ADAPTER_TEST_FIXTURE_CONTRACT
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice defines the synthetic fixture contract required before a future
Task Center DB-read adapter can be implemented.

It does not create a database client, read database rows, mutate task rows,
store audit events, upload files, call AI, run automation, run SQL, or deploy.

Required boundary:

```text
TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_ONLY
TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_READONLY
TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_DRAFT_ONLY
TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_READ
TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_DATABASE_CLIENT
TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_TASK_MUTATION
TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_REAL_DATA
TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_NO_AI_OR_AUTOMATION
TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_REAL_USER_DATA
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

The fixture contract source is:

```text
lib/task-center-gate-evidence-panel-source.ts
```

The user-facing UI is:

```text
components/data-confirmation/department-task-inbox.tsx
```

It displays synthetic fixture rows:

- `FIXTURE_CONTRACT_SCOPE_INCLUDED`.
- `FIXTURE_CONTRACT_SCOPE_EXCLUDED`.
- `FIXTURE_CONTRACT_RESTRICTED_FIELD_MASK`.
- `FIXTURE_CONTRACT_STATUS_READONLY`.
- `FIXTURE_CONTRACT_OWNER_GATE_NO_GO`.

Every row stays `SYNTHETIC_CONTRACT`. This is a fixture contract only, not a
runtime adapter and not a test execution step.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_017_TASK_CENTER_DB_READ_ADAPTER_IMPLEMENTATION_PLAN_20260710.md
docs/HEU_CONTROL/HEU_DATA_018_TASK_CENTER_ADAPTER_TEST_FIXTURE_CONTRACT_20260710.md
lib/task-center-gate-evidence-panel-source.ts
package.json
scripts/check-heu-task-center-db-read-adapter-implementation-plan-readiness.mjs
scripts/check-heu-task-center-adapter-test-fixture-contract-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Fixture Contract Rules

| Code | Fixture mode | Synthetic lane | Expected result | Required before DB read | Forbidden in this slice |
|---|---|---|---|---|---|
| `FIXTURE_CONTRACT_SCOPE_INCLUDED` | `SYNTHETIC_CONTRACT` | `ADMISSION_SYNTHETIC_LANE` | Only matching department task metadata is visible. | `IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF` | `NO_REAL_USER_DATA` |
| `FIXTURE_CONTRACT_SCOPE_EXCLUDED` | `SYNTHETIC_CONTRACT` | `CTHSSV_NEGATIVE_ACCESS_LANE` | Non-matching lane returns no task metadata. | `AUDIT_NEGATIVE_ACCESS_EVIDENCE` | `NO_DATABASE_READ_EXECUTED` |
| `FIXTURE_CONTRACT_RESTRICTED_FIELD_MASK` | `SYNTHETIC_CONTRACT` | `PHAP_CHE_METADATA_ONLY_LANE` | Fixture excludes CCCD, phone, payment and raw PII fields. | `PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF` | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `FIXTURE_CONTRACT_STATUS_READONLY` | `SYNTHETIC_CONTRACT` | `READONLY_TASK_STATUS_LANE` | Reading fixture cannot change task status or audit rows. | `DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE` | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `FIXTURE_CONTRACT_OWNER_GATE_NO_GO` | `SYNTHETIC_CONTRACT` | `BGH_PRODUCTION_NO_GO_LANE` | Fixture keeps production gate NO-GO until formal approval. | `BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT` | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. No-Go Conditions

TASK_CENTER_DATABASE_READY: NO_GO

This slice is still NO-GO for:

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

- review whether the synthetic fixture contract covers scope and negative access,
- check that every fixture row remains `SYNTHETIC_CONTRACT`,
- detect accidental DB/AI/automation enablement,
- draft review comments.

AI/Codex must not:

- implement the adapter in this slice,
- create a Supabase client,
- enable database reads,
- read real task/student/payment data,
- generate fixtures from raw user data,
- run SQL,
- trigger paid automation,
- decide production readiness.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-adapter-test-fixture-contract-readiness.mjs
node --check scripts/check-heu-task-center-db-read-adapter-implementation-plan-readiness.mjs
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
| IT_DATA | included-scope fixture matches workspace/role/lane filter contract |
| AUDIT | excluded-scope fixture covers negative access |
| PHAP_CHE | restricted-field mask excludes raw PII and payment fields |
| DEPARTMENT_OWNER | readonly status language is understandable |
| BGH | production remains NO-GO |

## 9. Rollback

Rollback by reverting the PR that adds this adapter test fixture contract.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, uploads, storage writes, AI calls, paid
automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-018` adds a synthetic Task Center adapter test fixture contract.
- Scope is UI contract + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-adapter-test-fixture-contract-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns included-scope fixture contract.
- Audit owns excluded-scope negative-access fixture.
- Department owners own readonly task status language.

SOP-LEGAL:
- PHAP_CHE owns restricted-field mask boundary.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Adapter test fixture contract can be `PASS_LOCAL` while database and
  production remain `NO_GO`.
- The UI records synthetic fixture expectations; it does not create a database
  client, read, upload, approve or store.

SOP-VERIFY:
- Checker must verify fixture contract tokens, component data attributes,
  `SYNTHETIC_CONTRACT` mode, forbidden tokens, package alias, no Supabase
  runtime, no database read, no fetch, no mutation APIs, no SQL migration,
  no AI call, no real data and no secret assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center adapter test fixture contract.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this fixture
  contract.
- If accepted, next safe slice is Task Center adapter disabled runtime seam verification, still no DB read and no migration.
