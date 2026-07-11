# HEU Data 010 Task Center Adapter Enablement Gate

Task ID: HEU-DATA-010-TASK-CENTER-ADAPTER-ENABLEMENT-GATE
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-adapter-enablement-gate
Base branch: codex/heu/task-center-ui-fallback-wiring
Status: PASS_LOCAL_ADAPTER_ENABLEMENT_GATE
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice adds an owner-review enablement gate for any future real Task Center
read-only database adapter.

It does not enable the adapter. It only defines the approvals and evidence
required before a later PR may introduce a DB read path.

Required boundary:

```text
TASK_CENTER_READONLY_ADAPTER_ENABLEMENT_GATE_ONLY
OWNER_REVIEW_REQUIRED_BEFORE_DB_READ
ADAPTER_ENABLEMENT_DEFAULT_NO_GO
DATABASE_READ_BLOCKED
DISABLED_BY_DEFAULT
FEATURE_FLAG_REQUIRED
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

The gate contract is:

```text
lib/task-center-readonly-adapter-enablement-gate.ts
```

It produces a fail-closed typed object with:

```text
decision: NO_GO
canEnableDatabaseRead: false
databaseReadState: DATABASE_READ_BLOCKED
```

Every owner lane also starts as `NO_GO`:

```text
IT_DATA
AUDIT
PHAP_CHE
DEPARTMENT_OWNER
BGH
```

This prevents accidental adapter activation without documented signoff. A
future implementation must introduce a separate reviewed decision contract;
this slice cannot be mutated into a database-read approval.

## 3. Scope

Files in scope:

```text
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_009_TASK_CENTER_UI_FALLBACK_WIRING_20260710.md
docs/HEU_CONTROL/HEU_DATA_010_TASK_CENTER_ADAPTER_ENABLEMENT_GATE_20260710.md
lib/task-center-readonly-adapter-enablement-gate.ts
package.json
scripts/check-heu-task-center-adapter-enablement-gate-readiness.mjs
scripts/check-heu-task-center-ui-fallback-wiring-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Required Proof Before Any Real DB Read

| Proof code | Owner | Meaning |
|---|---|---|
| `IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF` | IT_DATA | Scope filters and feature flag reviewed |
| `AUDIT_NEGATIVE_ACCESS_EVIDENCE` | Audit | Negative-access proof exists |
| `PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF` | PHAP_CHE | No restricted raw data exposed |
| `DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE` | Department owner | Task labels and lanes accepted |
| `BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT` | BGH | BGH acknowledges production remains NO-GO |
| `BACKUP_ROLLBACK_UAT_EVIDENCE_BEFORE_DB_READ` | IT_DATA + Audit | UAT, backup and rollback evidence exist |

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

- review the gate contract,
- find missing evidence codes,
- draft review comments,
- check PR scope.

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
node --check scripts/check-heu-task-center-adapter-enablement-gate-readiness.mjs
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

Before any real Task Center DB read:

| Owner lane | Current gate |
|---|---|
| IT_DATA | `NO_GO` |
| AUDIT | `NO_GO` |
| PHAP_CHE | `NO_GO` |
| DEPARTMENT_OWNER | `NO_GO` |
| BGH | `NO_GO` |

These values are intentionally not approved in this PR.

## 9. Rollback

Rollback by reverting the PR that adds this enablement gate.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, AI calls, paid automation or production
config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-010` adds an owner-review enablement gate for future adapter work.
- Scope is TypeScript gate + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-adapter-enablement-gate-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns adapter activation and scope-first filter signoff.
- Audit owns no-broad-fallback and negative-access proof.
- Department owners own final usability review.

SOP-LEGAL:
- PHAP_CHE must approve restricted-data boundary before any DB read.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Enablement gate can be `PASS_LOCAL` while database and production remain
  `NO_GO`.
- Every owner lane defaults to `NO_GO`.

SOP-VERIFY:
- Checker must verify gate tokens, owner lane defaults, required proof codes,
  package alias, no Supabase runtime, no database read, no fetch, no mutation
  APIs, no SQL migration, no AI call and no secret assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center adapter enablement gate.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this gate.
- If accepted, next safe slice is a user-facing read-only evidence panel that
  displays gate status, still no DB read and no migration.
