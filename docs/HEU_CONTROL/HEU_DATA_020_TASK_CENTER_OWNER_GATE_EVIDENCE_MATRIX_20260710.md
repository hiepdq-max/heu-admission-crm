# HEU Data 020 Task Center Owner Gate Evidence Matrix

Task ID: HEU-DATA-020-TASK-CENTER-OWNER-GATE-EVIDENCE-MATRIX
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-owner-gate-evidence-matrix
Base branch: codex/heu/task-center-disabled-runtime-seam-verification
Status: PASS_LOCAL_OWNER_GATE_EVIDENCE_MATRIX
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice defines the owner gate evidence matrix required before any future
Task Center DB-read adapter can move beyond the disabled seam.

It does not approve owner gates, create a database client, read database rows,
mutate task rows, store audit events, enable env flags, upload files, call AI,
run automation, run SQL, or deploy.

Required boundary:

```text
TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_ONLY
TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_READONLY
TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_DRAFT_ONLY
TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_APPROVAL
TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_READ
TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_DATABASE_CLIENT
TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_TASK_MUTATION
TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_REAL_DATA
TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_NO_AI_OR_AUTOMATION
OWNER_EVIDENCE_REQUIRED
TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_REAL_USER_DATA
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Matrix Rows

The owner gate evidence matrix is displayed from:

```text
lib/task-center-gate-evidence-panel-source.ts
components/data-confirmation/department-task-inbox.tsx
```

It lists:

- `OWNER_GATE_EVIDENCE_IT_DATA_SCOPE`.
- `OWNER_GATE_EVIDENCE_AUDIT_NEGATIVE_ACCESS`.
- `OWNER_GATE_EVIDENCE_PHAP_CHE_RESTRICTED_DATA`.
- `OWNER_GATE_EVIDENCE_DEPARTMENT_LABEL_ACCEPTANCE`.
- `OWNER_GATE_EVIDENCE_BGH_NO_GO_ACK`.

Every row stays `OWNER_EVIDENCE_REQUIRED`. This is not an approval screen and
not a production gate.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_019_TASK_CENTER_DISABLED_RUNTIME_SEAM_VERIFICATION_20260710.md
docs/HEU_CONTROL/HEU_DATA_020_TASK_CENTER_OWNER_GATE_EVIDENCE_MATRIX_20260710.md
lib/task-center-gate-evidence-panel-source.ts
lib/task-center-readonly-adapter-enablement-gate.ts
package.json
scripts/check-heu-task-center-disabled-runtime-seam-verification-readiness.mjs
scripts/check-heu-task-center-owner-gate-evidence-matrix-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Evidence Rules

| Code | Owner lane | Evidence state | Required evidence | Blocks DB read until | Forbidden in this slice |
|---|---|---|---|---|---|
| `OWNER_GATE_EVIDENCE_IT_DATA_SCOPE` | `IT_DATA` | `OWNER_EVIDENCE_REQUIRED` | `IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF` | `DB_READ_BLOCKED_UNTIL_IT_DATA_SCOPE_EVIDENCE` | `NO_DATABASE_CLIENT_CREATED` |
| `OWNER_GATE_EVIDENCE_AUDIT_NEGATIVE_ACCESS` | `AUDIT` | `OWNER_EVIDENCE_REQUIRED` | `AUDIT_NEGATIVE_ACCESS_EVIDENCE` | `DB_READ_BLOCKED_UNTIL_AUDIT_NEGATIVE_ACCESS_EVIDENCE` | `NO_DATABASE_READ_EXECUTED` |
| `OWNER_GATE_EVIDENCE_PHAP_CHE_RESTRICTED_DATA` | `PHAP_CHE` | `OWNER_EVIDENCE_REQUIRED` | `PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF` | `DB_READ_BLOCKED_UNTIL_PHAP_CHE_EVIDENCE` | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `OWNER_GATE_EVIDENCE_DEPARTMENT_LABEL_ACCEPTANCE` | `DEPARTMENT_OWNER` | `OWNER_EVIDENCE_REQUIRED` | `DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE` | `DB_READ_BLOCKED_UNTIL_DEPARTMENT_OWNER_EVIDENCE` | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `OWNER_GATE_EVIDENCE_BGH_NO_GO_ACK` | `BGH` | `OWNER_EVIDENCE_REQUIRED` | `BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT` | `DB_READ_BLOCKED_UNTIL_BGH_NO_GO_EVIDENCE` | `NO_PRODUCTION_GO_NO_DEPLOY` |

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

- verify that owner evidence requirements are visible,
- check that every row remains `OWNER_EVIDENCE_REQUIRED`,
- detect accidental DB/AI/automation enablement,
- draft review comments.

AI/Codex must not:

- approve any owner gate,
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
node --check scripts/check-heu-task-center-owner-gate-evidence-matrix-readiness.mjs
node --check scripts/check-heu-task-center-disabled-runtime-seam-verification-readiness.mjs
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

Before any future adapter implementation PR:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | scope-first evidence is sufficient |
| AUDIT | negative-access evidence is sufficient |
| PHAP_CHE | restricted-data boundary evidence is sufficient |
| DEPARTMENT_OWNER | task label acceptance evidence is sufficient |
| BGH | production NO-GO acknowledgement is sufficient |

## 9. Rollback

Rollback by reverting the PR that adds this owner gate evidence matrix.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, uploads, storage writes, AI calls, paid
automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-020` adds a read-only owner gate evidence matrix for the Task Center
  adapter.
- Scope is UI matrix + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-owner-gate-evidence-matrix-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns scope-first evidence.
- Audit owns negative-access evidence.
- Department owners own task label acceptance evidence.

SOP-LEGAL:
- PHAP_CHE owns restricted-data boundary evidence.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Owner gate evidence matrix can be `PASS_LOCAL` while database and production
  remain `NO_GO`.
- The UI records evidence requirements; it does not approve, create a database
  client, read, upload, store, enable env flags or deploy.

SOP-VERIFY:
- Checker must verify owner evidence matrix tokens, enablement-gate proof
  tokens, component data attributes, `OWNER_EVIDENCE_REQUIRED` state, forbidden
  tokens, package alias, no Supabase runtime, no database read, no fetch,
  no mutation APIs, no SQL migration, no AI call, no real data and no secret
  assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center owner gate evidence matrix.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this owner gate
  evidence matrix.
- If accepted, next safe slice is `HEU-DATA-021-TASK-CENTER-ADAPTER-PREFLIGHT-CHECKLIST`,
  a Task Center adapter preflight checklist, still no DB read and no migration.
- Required next checker:
  `check:heu-task-center-adapter-preflight-checklist-readiness`.
