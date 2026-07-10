# HEU Data 024 Task Center Adapter Dry-Run Readiness Review

Task ID: HEU-DATA-024-TASK-CENTER-ADAPTER-DRY-RUN-READINESS-REVIEW
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-adapter-dry-run-readiness-review
Base branch: codex/heu/task-center-dry-run-env-gate-ledger
Status: PASS_LOCAL_REVIEW_PACKET
Production status: NO-GO
Runtime status: DRY_RUN_ADAPTER_READY: NO_GO_REVIEW_ONLY
Database status: TASK_CENTER_DATABASE_READY: NO_GO_DRY_RUN_READINESS_REVIEW_ONLY

## 1. Purpose

This slice creates a read-only readiness review for the future Task Center
adapter dry-run. It tells IT_DATA, Audit, PHAP_CHE, department owners and BGH
which evidence must exist before a later PR may even consider enabling a dry-run
adapter path.

This slice does not approve owner gates, create a database client, read database
rows, mutate task rows, store audit events, enable env flags, upload files, call
AI, run automation, run SQL, deploy or mark production ready.

Required boundary:

```text
TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_ONLY
TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_READONLY
TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_DRAFT_ONLY
TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_APPROVAL
TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_DATABASE_READ
TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_DATABASE_CLIENT
TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_ENV_ENABLEMENT
TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_TASK_MUTATION
TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_REAL_DATA
TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_NO_AI_OR_AUTOMATION
DRY_RUN_ADAPTER_READY: NO_GO_REVIEW_ONLY
TASK_CENTER_DATABASE_READY: NO_GO_DRY_RUN_READINESS_REVIEW_ONLY
TASK_CENTER_DRY_RUN_ENV_GATE_DISABLED_BY_DEFAULT
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_ENV_ENABLEMENT
NO_TASK_MUTATION_ROUTE_CREATED
NO_REAL_USER_DATA
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Review Rows

The readiness review is displayed from:

```text
lib/task-center-gate-evidence-panel-source.ts
components/data-confirmation/department-task-inbox.tsx
```

It lists:

- `DRY_RUN_READINESS_SCOPE_FIRST_FILTER`.
- `DRY_RUN_READINESS_NEGATIVE_ACCESS`.
- `DRY_RUN_READINESS_RESTRICTED_DATA_BOUNDARY`.
- `DRY_RUN_READINESS_DEPARTMENT_LABEL_ACCEPTANCE`.
- `DRY_RUN_READINESS_PRODUCTION_NO_GO`.

Every row stays `BLOCKED_REQUIRES_OWNER_SIGNOFF`. This is not a dry-run adapter
implementation, not feature flag enablement and not a production gate.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_023_TASK_CENTER_DRY_RUN_ENV_GATE_LEDGER_20260710.md
docs/HEU_CONTROL/HEU_DATA_024_TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_20260710.md
lib/task-center-gate-evidence-panel-source.ts
package.json
scripts/check-heu-task-center-dry-run-env-gate-ledger-readiness.mjs
scripts/check-heu-task-center-adapter-dry-run-readiness-review.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Readiness Review Matrix

| Code | Reviewer | Readiness state | Required evidence | Stop rule |
|---|---|---|---|---|
| `DRY_RUN_READINESS_SCOPE_FIRST_FILTER` | `IT_DATA` | `BLOCKED_REQUIRES_OWNER_SIGNOFF` | `IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF` | `NO_DATABASE_READ_EXECUTED` |
| `DRY_RUN_READINESS_NEGATIVE_ACCESS` | `AUDIT` | `BLOCKED_REQUIRES_OWNER_SIGNOFF` | `AUDIT_NEGATIVE_ACCESS_EVIDENCE` | `NO_BROAD_ACCESS_PROOF_MISSING` |
| `DRY_RUN_READINESS_RESTRICTED_DATA_BOUNDARY` | `PHAP_CHE` | `BLOCKED_REQUIRES_OWNER_SIGNOFF` | `PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF` | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `DRY_RUN_READINESS_DEPARTMENT_LABEL_ACCEPTANCE` | `DEPARTMENT_OWNER` | `BLOCKED_REQUIRES_OWNER_SIGNOFF` | `DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE` | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `DRY_RUN_READINESS_PRODUCTION_NO_GO` | `BGH` | `BLOCKED_REQUIRES_OWNER_SIGNOFF` | `BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT` | `NO_PRODUCTION_GO_NO_DEPLOY` |

## 5. No-Go Conditions

DRY_RUN_ADAPTER_READY: NO_GO_REVIEW_ONLY
TASK_CENTER_DATABASE_READY: NO_GO_DRY_RUN_READINESS_REVIEW_ONLY

This slice is still NO-GO for:

- owner approval,
- env/feature flag enablement,
- real `.env` assignment,
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

- verify that readiness-review rows are visible,
- check that every row remains `BLOCKED_REQUIRES_OWNER_SIGNOFF`,
- detect accidental DB/env/AI/automation enablement,
- draft review comments.

AI/Codex must not:

- approve any readiness row,
- create or change `.env` values,
- implement or enable the dry-run adapter in this slice,
- create a Supabase client,
- enable database reads,
- read real task/student/payment data,
- run SQL,
- trigger paid automation,
- decide production readiness.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-adapter-dry-run-readiness-review.mjs
node --check scripts/check-heu-task-center-dry-run-env-gate-ledger-readiness.mjs
npm.cmd run check:heu-task-center-adapter-dry-run-readiness-review
npm.cmd run check:heu-task-center-dry-run-env-gate-ledger-readiness
npm.cmd run check:heu-task-center-readonly-adapter-dry-run-switch-contract-readiness
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

The build command may use dummy public Supabase env values only. Do not use real
secrets in Git/Codex/chat.

## 8. Owner Review Required

Before any future dry-run adapter implementation PR:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | scope-first filter and workspace/role/scope proof are sufficient |
| AUDIT | negative-access proof is sufficient before DB read |
| PHAP_CHE | restricted-data allowlist is sufficient |
| DEPARTMENT_OWNER | readonly task labels and behavior are accepted |
| BGH | production NO-GO acknowledgement is sufficient |

## 9. Rollback

Rollback by reverting the PR that adds this readiness review.

No database rollback is required because this slice does not create schema, task
rows, Auth changes, scope grants, env enablement, uploads, storage writes, AI
calls, paid automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-024` adds a read-only readiness review for the Task Center adapter
  dry-run.
- Scope is UI review matrix + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-adapter-dry-run-readiness-review`.

SOP-PROFESSIONAL:
- IT_DATA owns scope-first filter evidence.
- Audit owns negative-access evidence.
- Department owners own readonly task label acceptance.

SOP-LEGAL:
- PHAP_CHE owns restricted-data boundary review.
- No legal approval is inferred from this local review packet.

SOP-LOGIC:
- The readiness review stays blocked until owner evidence exists.
- No runtime DB path is added.

SOP-VERIFY:
- Local checker must confirm doc/source/component/package/manifest tokens.

SOP-RESULT:
- `PASS_LOCAL_REVIEW_PACKET`.
- `DRY_RUN_ADAPTER_READY: NO_GO_REVIEW_ONLY`.
- `TASK_CENTER_DATABASE_READY: NO_GO_DRY_RUN_READINESS_REVIEW_ONLY`.

SOP-NEXT:
- `HEU-DATA-025-TASK-CENTER-ADAPTER-DRY-RUN-STATIC-NEGATIVE-ACCESS-PACKET`.
- Still docs/checker/read-only first. Do not implement DB adapter until owner
  evidence exists.

## 11. Final Boundary

Stage D - internal controlled test only.

Production remains NO-GO.

This review packet does not approve production, migration, finance action,
evidence acceptance, UAT acceptance, owner GO/NO-GO, AI write access or a real
Task Center database adapter.
