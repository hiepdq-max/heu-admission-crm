# HEU Data 025 Task Center Adapter Dry-Run Static Negative-Access Packet

Task ID: HEU-DATA-025-TASK-CENTER-ADAPTER-DRY-RUN-STATIC-NEGATIVE-ACCESS-PACKET
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-adapter-dry-run-static-negative-access-packet
Base branch: codex/heu/task-center-adapter-dry-run-readiness-review
Status: PASS_LOCAL_PACKET_ONLY
Production status: NO-GO
Runtime status: NEGATIVE_ACCESS_PACKET_READY: PASS_LOCAL_PACKET_ONLY
Database status: TASK_CENTER_DATABASE_READY: NO_GO_STATIC_NEGATIVE_ACCESS_PACKET_ONLY

## 1. Purpose

This slice creates a static negative-access packet for the future Task Center
adapter dry-run. It records which denial cases must have evidence before any
future PR may consider a runtime dry-run adapter.

This slice does not approve owner gates, create a database client, read database
rows, mutate task rows, store audit events, enable env flags, upload files, call
AI, run automation, run SQL, deploy or mark production ready.

Required boundary:

```text
TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_ONLY
TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_READONLY
TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_DRAFT_ONLY
TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_APPROVAL
TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_DATABASE_READ
TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_DATABASE_CLIENT
TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_ENV_ENABLEMENT
TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_TASK_MUTATION
TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_REAL_DATA
TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_NO_AI_OR_AUTOMATION
NEGATIVE_ACCESS_PACKET_READY: PASS_LOCAL_PACKET_ONLY
TASK_CENTER_DATABASE_READY: NO_GO_STATIC_NEGATIVE_ACCESS_PACKET_ONLY
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_ENV_ENABLEMENT
NO_TASK_MUTATION_ROUTE_CREATED
NO_REAL_USER_DATA
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Packet Rows

The negative-access packet is displayed from:

```text
lib/task-center-gate-evidence-panel-source.ts
components/data-confirmation/department-task-inbox.tsx
```

It lists:

- `NEG_ACCESS_NO_WORKSPACE_SCOPE`.
- `NEG_ACCESS_WRONG_DEPARTMENT`.
- `NEG_ACCESS_NO_READ_PERMISSION`.
- `NEG_ACCESS_RESTRICTED_DATA_ALLOWLIST`.
- `NEG_ACCESS_GLOBAL_CONFIRM_BYPASS`.

This is a static packet only. It is not a live negative-access test, not a dry-run
adapter implementation, not feature flag enablement and not a production gate.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_024_TASK_CENTER_ADAPTER_DRY_RUN_READINESS_REVIEW_20260710.md
docs/HEU_CONTROL/HEU_DATA_025_TASK_CENTER_ADAPTER_DRY_RUN_STATIC_NEGATIVE_ACCESS_PACKET_20260710.md
lib/task-center-gate-evidence-panel-source.ts
package.json
scripts/check-heu-task-center-adapter-dry-run-readiness-review.mjs
scripts/check-heu-task-center-adapter-dry-run-static-negative-access-packet.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Negative-Access Packet Matrix

| Code | Reviewer | Negative scenario | Required evidence | Expected result | Stop rule |
|---|---|---|---|---|---|
| `NEG_ACCESS_NO_WORKSPACE_SCOPE` | `IT_DATA` | User has no matching workspace or business-scope lane for the task. | `IT_DATA_WORKSPACE_SCOPE_DENIAL_PROOF` | `BLOCKED_NO_VISIBLE_ROWS` | `NO_DATABASE_READ_EXECUTED` |
| `NEG_ACCESS_WRONG_DEPARTMENT` | `DEPARTMENT_OWNER` | User belongs to a different department than the task department code. | `DEPARTMENT_OWNER_WRONG_DEPARTMENT_DENIAL_PROOF` | `BLOCKED_DEPARTMENT_SCOPE_MISMATCH` | `NO_TASK_MUTATION_ROUTE_CREATED` |
| `NEG_ACCESS_NO_READ_PERMISSION` | `IT_DATA` | User lacks `data_confirmation.read` before any queue or timeline lane. | `IT_DATA_PERMISSION_DENIAL_PROOF` | `BLOCKED_DATA_CONFIRMATION_READ_REQUIRED` | `NO_DATABASE_READ_EXECUTED` |
| `NEG_ACCESS_RESTRICTED_DATA_ALLOWLIST` | `PHAP_CHE` | Restricted raw PII, payment or bank fields are requested by mistake. | `PHAP_CHE_RESTRICTED_DATA_ALLOWLIST_PROOF` | `BLOCKED_NO_RAW_PII_NO_PAYMENT_DATA` | `NO_RAW_PII_NO_PAYMENT_DATA` |
| `NEG_ACCESS_GLOBAL_CONFIRM_BYPASS` | `AUDIT` | Global route/manage permission is incorrectly treated as task confirmation authority. | `AUDIT_GLOBAL_BYPASS_DENIAL_PROOF` | `BLOCKED_NO_GLOBAL_CONFIRM_PERMISSION_BYPASS` | `NO_BROAD_ACCESS_PROOF_MISSING` |

## 5. No-Go Conditions

NEGATIVE_ACCESS_PACKET_READY: PASS_LOCAL_PACKET_ONLY
TASK_CENTER_DATABASE_READY: NO_GO_STATIC_NEGATIVE_ACCESS_PACKET_ONLY

This slice is still NO-GO for:

- owner approval,
- env/feature flag enablement,
- real `.env` assignment,
- Supabase client creation,
- database read,
- database write,
- live negative-access execution,
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

- verify that static negative-access rows are visible,
- check that every row has expected result and stop rule,
- detect accidental DB/env/AI/automation enablement,
- draft review comments.

AI/Codex must not:

- approve any negative-access row,
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
node --check scripts/check-heu-task-center-adapter-dry-run-static-negative-access-packet.mjs
node --check scripts/check-heu-task-center-adapter-dry-run-readiness-review.mjs
npm.cmd run check:heu-task-center-adapter-dry-run-static-negative-access-packet
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

Before any future live negative-access dry-run:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | workspace/scope denial and missing-permission denial cases are enough |
| AUDIT | global bypass and broad-access denial cases are enough |
| PHAP_CHE | restricted-data allowlist denial case is enough |
| DEPARTMENT_OWNER | wrong-department denial case is enough |
| BGH | production NO-GO acknowledgement remains visible |

## 9. Rollback

Rollback by reverting the PR that adds this static negative-access packet.

No database rollback is required because this slice does not create schema, task
rows, Auth changes, scope grants, env enablement, uploads, storage writes, AI
calls, paid automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-025` adds a static negative-access packet for the Task Center
  adapter dry-run.
- Scope is UI packet + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-adapter-dry-run-static-negative-access-packet`.

SOP-PROFESSIONAL:
- IT_DATA owns workspace/scope and permission-denial scenarios.
- Audit owns broad/global bypass denial scenarios.
- Department owners own wrong-department denial scenario.

SOP-LEGAL:
- PHAP_CHE owns restricted-data allowlist denial scenario.
- No legal approval is inferred from this local packet.

SOP-LOGIC:
- The packet stays static until owner evidence exists.
- No runtime DB path is added.

SOP-VERIFY:
- Local checker must confirm doc/source/component/package/manifest tokens.

SOP-RESULT:
- `PASS_LOCAL_PACKET_ONLY`.
- `NEGATIVE_ACCESS_PACKET_READY: PASS_LOCAL_PACKET_ONLY`.
- `TASK_CENTER_DATABASE_READY: NO_GO_STATIC_NEGATIVE_ACCESS_PACKET_ONLY`.

SOP-NEXT:
- `HEU-DATA-026-TASK-CENTER-ADAPTER-DRY-RUN-READONLY-TEST-HARNESS-DESIGN`.
- Required next local command:
  `npm.cmd run check:heu-task-center-adapter-dry-run-readonly-test-harness-design`.
- Expected next runtime status:
  `READONLY_TEST_HARNESS_READY: PASS_LOCAL_DESIGN_ONLY`.
- Still docs/checker/read-only first. Do not implement DB adapter until owner
  evidence exists.

## 11. Final Boundary

Stage D - internal controlled test only.

Production remains NO-GO.

This static packet does not approve production, migration, finance action,
evidence acceptance, UAT acceptance, owner GO/NO-GO, AI write access or a real
Task Center database adapter.
