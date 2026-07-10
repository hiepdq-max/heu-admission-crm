# HEU Data 013 Task Center UAT Evidence Checklist

Task ID: HEU-DATA-013-TASK-CENTER-UAT-EVIDENCE-CHECKLIST
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-uat-evidence-checklist
Base branch: codex/heu/task-center-real-user-uat-copy
Status: PASS_LOCAL_UAT_EVIDENCE_CHECKLIST
Production status: NO-GO
Review state: CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH

## 1. Purpose

This slice adds a read-only UAT evidence checklist to the Task Center gate
evidence panel.

The checklist tells real users and reviewers what evidence to capture outside
the system during controlled UAT. It does not upload files, write storage,
read database rows, or ask for restricted raw data.

Required boundary:

```text
TASK_CENTER_UAT_EVIDENCE_CHECKLIST_ONLY
TASK_CENTER_UAT_EVIDENCE_CHECKLIST_READONLY
TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_UPLOAD
TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_STORAGE_WRITE
TASK_CENTER_UAT_EVIDENCE_CHECKLIST_NO_RAW_PII
TASK_CENTER_GATE_EVIDENCE_PANEL_DATABASE_NO_GO
NO_DATABASE_CLIENT_CREATED
NO_DATABASE_READ_EXECUTED
NO_SQL_MIGRATION_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Runtime Value

The checklist source is:

```text
lib/task-center-gate-evidence-panel-source.ts
```

The user-facing UI is:

```text
components/data-confirmation/department-task-inbox.tsx
```

It displays evidence items:

- `UAT_EVIDENCE_SCOPE_VISIBLE`.
- `UAT_EVIDENCE_GATE_NO_GO_VISIBLE`.
- `UAT_EVIDENCE_ALLOWED_BLOCKED_COPY`.
- `UAT_EVIDENCE_RESTRICTED_DATA_BOUNDARY`.
- `UAT_EVIDENCE_PRODUCTION_NO_GO`.

The evidence is captured outside Git/Codex/chat and must be redacted before any
review packet is shared.

## 3. Scope

Files in scope:

```text
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_012_TASK_CENTER_REAL_USER_UAT_COPY_20260710.md
docs/HEU_CONTROL/HEU_DATA_013_TASK_CENTER_UAT_EVIDENCE_CHECKLIST_20260710.md
lib/task-center-gate-evidence-panel-source.ts
package.json
scripts/check-heu-task-center-real-user-uat-copy-readiness.mjs
scripts/check-heu-task-center-uat-evidence-checklist-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Checklist Rules

| Code | Reviewer | Evidence expected |
|---|---|---|
| `UAT_EVIDENCE_SCOPE_VISIBLE` | IT_DATA | Screenshot with role, scope, lane and timestamp |
| `UAT_EVIDENCE_GATE_NO_GO_VISIBLE` | AUDIT | Screenshot showing database NO-GO and owner lanes NO-GO |
| `UAT_EVIDENCE_ALLOWED_BLOCKED_COPY` | DEPARTMENT_OWNER | Note that user understands allowed/blocked actions |
| `UAT_EVIDENCE_RESTRICTED_DATA_BOUNDARY` | PHAP_CHE | Note that no raw PII or payment data is requested |
| `UAT_EVIDENCE_PRODUCTION_NO_GO` | BGH | Note that production remains NO-GO |

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

- review whether checklist wording is clear,
- check that the checklist does not imply upload or approval,
- detect accidental DB/AI/automation enablement,
- draft review comments.

AI/Codex must not:

- capture real evidence,
- store screenshots,
- mark any owner lane approved,
- enable database reads,
- read real task/student/payment data,
- run SQL,
- trigger paid automation,
- decide production readiness.

This slice introduces no AI call and no automation step by default.

## 7. Required Local Commands

```powershell
node --check scripts/check-heu-task-center-uat-evidence-checklist-readiness.mjs
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

Before using this with real users:

| Owner lane | Must confirm |
|---|---|
| IT_DATA | checklist evidence can prove scope visibility without raw data |
| AUDIT | evidence wording supports PASS/NO-GO review |
| PHAP_CHE | screenshots/notes must be redacted before sharing |
| DEPARTMENT_OWNER | checklist wording is usable by each department |
| BGH | production remains NO-GO |

## 9. Rollback

Rollback by reverting the PR that adds this checklist.

No database rollback is required because this slice does not create schema,
task rows, Auth changes, scope grants, uploads, storage writes, AI calls, paid
automation or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-013` adds read-only UAT evidence checklist copy to the Task Center
  panel.
- Scope is UI checklist + TypeScript source + docs + checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-uat-evidence-checklist-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns scope evidence wording.
- Audit owns PASS/NO-GO evidence sufficiency.
- Department owners own final usability language.

SOP-LEGAL:
- PHAP_CHE must confirm no restricted raw data is requested.
- HOU remains separated and no COM conclusion is produced.

SOP-LOGIC:
- UAT evidence checklist can be `PASS_LOCAL` while database and production
  remain `NO_GO`.
- The UI guides evidence capture; it does not collect, upload or approve.

SOP-VERIFY:
- Checker must verify checklist tokens, component data attributes, reviewer
  lanes, no-upload/no-storage/no-raw-PII boundaries, package alias, no Supabase
  runtime, no database read, no fetch, no mutation APIs, no SQL migration, no
  AI call and no secret assignment.

SOP-RESULT:
- `PASS_LOCAL` for Task Center UAT evidence checklist.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER_BGH` for formal review.
- `NO_GO` for Task Center database, mutation routes, AI automation and
  production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE + Department owner + BGH review this checklist.
- If accepted, next safe slice is real-user pilot review packet, still no DB
  read and no migration.
