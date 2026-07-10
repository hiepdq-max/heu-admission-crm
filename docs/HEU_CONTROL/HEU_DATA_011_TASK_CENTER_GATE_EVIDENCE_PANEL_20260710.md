# HEU Data 011 Task Center Gate Evidence Panel

Task ID: HEU-DATA-011-TASK-CENTER-GATE-EVIDENCE-PANEL
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-gate-evidence-panel
Base branch: codex/heu/task-center-adapter-enablement-gate
Status: PASS_LOCAL_GATE_EVIDENCE_PANEL
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice adds a user-facing read-only evidence panel inside the Data
Confirmation Task Center area.

The panel shows the adapter enablement gate status before any real Task Center
DB read is allowed.

Required boundary:

```text
TASK_CENTER_GATE_EVIDENCE_PANEL_ONLY
TASK_CENTER_GATE_EVIDENCE_PANEL_READONLY
TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO
TASK_CENTER_READONLY_ADAPTER_ENABLEMENT_GATE_ONLY
OWNER_REVIEW_REQUIRED_BEFORE_DB_READ
ADAPTER_ENABLEMENT_DEFAULT_NO_GO
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

The panel source is:

```text
lib/task-center-gate-evidence-panel-source.ts
```

The user-facing UI is:

```text
components/data-confirmation/department-task-inbox.tsx
```

It displays:

- database status: `TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO`,
- gate mode: `TASK_CENTER_READONLY_ADAPTER_ENABLEMENT_GATE_ONLY`,
- owner lanes and current decisions,
- required proof before a future PR may introduce a real DB read.

Every owner lane remains `NO_GO` in this PR:

```text
IT_DATA
AUDIT
PHAP_CHE
DEPARTMENT_OWNER
BGH
```

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_010_TASK_CENTER_ADAPTER_ENABLEMENT_GATE_20260710.md
docs/HEU_CONTROL/HEU_DATA_011_TASK_CENTER_GATE_EVIDENCE_PANEL_20260710.md
docs/HEU_CONTROL/HEU_DATA_012_TASK_CENTER_REAL_USER_UAT_COPY_20260710.md
lib/task-center-gate-evidence-panel-source.ts
package.json
scripts/check-heu-task-center-adapter-enablement-gate-readiness.mjs
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

## 4. Required Proof Before Any Real DB Read

| Proof code | Owner | Current state |
|---|---|---|
| `IT_DATA_SCOPE_FIRST_FILTER_SIGNOFF` | IT_DATA | `NO_GO` |
| `AUDIT_NEGATIVE_ACCESS_EVIDENCE` | Audit | `NO_GO` |
| `PHAP_CHE_RESTRICTED_DATA_BOUNDARY_SIGNOFF` | PHAP_CHE | `NO_GO` |
| `DEPARTMENT_OWNER_TASK_LABEL_ACCEPTANCE` | Department owner | `NO_GO` |
| `BGH_PRODUCTION_NO_GO_ACKNOWLEDGEMENT` | BGH | `NO_GO` |
| `BACKUP_ROLLBACK_UAT_EVIDENCE_BEFORE_DB_READ` | IT_DATA + Audit | `NO_GO` |

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

- review whether the panel truthfully displays gate status,
- check that every owner lane stays `NO_GO`,
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
node --check scripts/check-heu-task-center-gate-evidence-panel-readiness.mjs
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

Rollback by reverting the PR that adds this evidence panel.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, AI calls, paid automation or production
config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-011` adds a read-only UI evidence panel for Task Center gate status.
- Scope is UI panel + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-gate-evidence-panel-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns adapter activation and scope-first filter signoff.
- Audit owns no-broad-fallback and negative-access proof.
- Department owners own final usability review.

SOP-LEGAL:
- PHAP_CHE must approve restricted-data boundary before any DB read.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- Evidence panel can be `PASS_LOCAL` while database and production remain
  `NO_GO`.
- The UI displays gate status; it does not collect approvals.

SOP-VERIFY:
- Checker must verify panel source tokens, component data attributes, owner
  lane defaults, required proof codes, package alias, no Supabase runtime, no
  database read, no fetch, no mutation APIs, no SQL migration, no AI call and
  no secret assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center gate evidence panel.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this visible gate.
- If accepted, next safe slice is HEU-DATA-012-TASK-CENTER-REAL-USER-UAT-COPY: real-user UAT copy for the Task Center panel, still using mock/fallback data and no DB read.
- Required next checker alias:
  `check:heu-task-center-real-user-uat-copy-readiness`.
