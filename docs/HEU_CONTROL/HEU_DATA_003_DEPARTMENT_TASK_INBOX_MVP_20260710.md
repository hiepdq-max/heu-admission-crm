# HEU Data 003 Department Task Inbox MVP

Task ID: HEU-DATA-003-DEPARTMENT-TASK-INBOX-MVP
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/department-task-inbox-mvp
Base branch: codex/heu/user-pilot-review-packet
Status: PASS_LOCAL_TASK_INBOX_MVP
Production status: NO-GO

## 1. Purpose

This slice makes the HEU `Viec cua toi / Data Confirmation` route more useful
for real users without connecting live task data yet.

The route now shows a department task inbox MVP based on:

- role code,
- workspace scope decision,
- visible segment count,
- action gates from `HEUWorkspaceContext`.

This is still ref-only and read-only. It does not create a real Task Center
table, does not query business rows, does not write data and does not call AI.

## 2. User Value

| User lane | What the user sees first | Boundary |
|---|---|---|
| Tuyen sinh | Lead/follow-up/ho so confirmation lane | Draft or read-only by scope |
| CTHSSV | Student handover/status confirmation lane | No raw PII copied into task |
| Dao tao/Khoa | Class/program/teacher ref review lane | No schedule mutation |
| Ke toan | Receivable/recon/evidence ref lane | No finance mutation |
| HOU | HOU separated ref lane | No COM conclusion |
| IT_DATA/Audit | User/scope/audit review lane | No owner approval inferred |

## 3. Scope

Files in scope:

```text
app/data-confirmation/page.tsx
components/data-confirmation/department-task-inbox.tsx
docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md
docs/HEU_CONTROL/HEU_DATA_003_DEPARTMENT_TASK_INBOX_MVP_20260710.md
package.json
scripts/check-heu-data-confirmation-task-center.mjs
scripts/check-heu-department-task-inbox-mvp-readiness.mjs
```

Files not in scope:

```text
database/
supabase/
.env*
next.config.*
middleware.*
```

## 4. Required Tokens

Runtime component must include:

```text
HEU_DEPARTMENT_TASK_INBOX_MVP
ROLE_WORKSPACE_SCOPE_FILTERED
REF_ONLY_NO_RAW_PII_NO_MUTATION
NO_AI_CALL_NO_AUTOMATION_STEP
NO_GO_SCOPE
DRAFT_READY
READ_ONLY
```

## 5. No-Go Conditions

This slice must remain NO-GO for real production use if any item below is true:

- real Task Center table is not approved,
- data dictionary is missing,
- audit log contract is missing,
- owner approval flow is missing,
- rollback rule is missing,
- row-level permission evidence is missing,
- finance/HOU data has not passed owner/legal/audit review.

## 6. Cost Guard

This inbox must not introduce:

- AI call,
- Make/Zapier step,
- paid automation,
- background worker,
- extra database table,
- scheduled job.

It is a low-cost local UI/control slice only.

## 7. Required Local Commands

```powershell
npm.cmd run check:heu-department-task-inbox-mvp-readiness
npm.cmd run check:heu-data-confirmation-task-center
npm.cmd run check:heu-app-shell-draft-pr-readiness
npm.cmd run lint
```

Do not run `npm install`, `npm ci`, migration, Supabase push or production
deploy as part of this slice.

## 8. Rollback

Rollback by reverting the PR that adds this slice.

No database rollback is required because this slice does not create tables,
change rows, change auth, grant scope, write finance data, accept evidence,
call AI or deploy production.

## 9. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-003` adds a department task inbox MVP to the Data Confirmation
  route.
- Scope is UI/control + read-only checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-department-task-inbox-mvp-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns role/workspace/scope mapping.
- Audit owns no-secret/no-raw-PII and traceability review.
- Department owners own real task acceptance later.

SOP-LEGAL:
- No legal, UAT, evidence, finance, owner or production approval is inferred.
- HOU remains separated from internal HEU students.

SOP-LOGIC:
- The inbox can be `PASS_LOCAL` while real Task Center remains `NO_GO`.
- Role/workspace/scope gates must resolve before any business row is fetched.

SOP-VERIFY:
- Checker must verify component tokens, route wiring, no mutation APIs, no
  database path, package alias and no secret assignments.

SOP-RESULT:
- `PASS_LOCAL` for department task inbox MVP.
- `CAN_SUA_IT_DATA_AUDIT` for review.
- `NO_GO` for production Task Center until database contract, audit log,
  owner approval and rollback are approved.

SOP-NEXT:
- IT_DATA + Audit review the inbox lane map.
- Then design the real Task Center data contract before any task mutation.
