# HEU Data 004 Task Center Data Contract

Task ID: HEU-DATA-004-TASK-CENTER-DATA-CONTRACT
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/task-center-data-contract
Base branch: codex/heu/department-task-inbox-mvp
Status: PASS_LOCAL_DATA_CONTRACT
Production status: NO-GO

## 1. Purpose

This document defines the draft data contract for a real HEU Task Center before
any table, migration, RPC, trigger, RLS policy or production data action exists.

The target outcome is simple:

```text
Each department user sees only assigned/scoped tasks.
Each task stores refs and metadata, not raw sensitive data.
Every status change creates an audit event.
AI may draft/check/suggest only and must not approve or mutate real data.
```

This slice is contract-only:

```text
NO_EXECUTABLE_MIGRATION_CREATED
NO_TASK_TABLE_CREATED
NO_TASK_MUTATION_ROUTE_CREATED
NO_AI_CALL_NO_AUTOMATION_STEP
```

## 2. Draft Tables

These names are a draft contract only. Do not create them until IT_DATA + Audit
approve backup, rollback, RLS and UAT evidence.

| Draft table | Purpose | Production state |
|---|---|---|
| `TASK_CENTER` | Current task header, owner, scope, source refs and status | `NO_GO_NOT_CREATED` |
| `TASK_CENTER_EVENT_LOG` | Append-only status/action log for each task | `NO_GO_NOT_CREATED` |
| `TASK_CENTER_ASSIGNMENT` | Optional many-to-many assignee/reviewer list if one owner is not enough | `NO_GO_NOT_CREATED` |

## 3. TASK_CENTER Draft Columns

| Column | Type draft | Required | Rule |
|---|---|---|---|
| `task_id` | uuid | yes | Primary key |
| `workspace_id` | uuid/null | no | Future organization/workspace scope; nullable until workspace master is final |
| `admission_segment_id` | uuid/null | no | Scope-first filter; no broad fallback |
| `department_code` | text | yes | `ADMISSION`, `CTHSSV`, `TRAINING`, `KHOA`, `FINANCE`, `HOU`, `IT_DATA`, `AUDIT`, `BGH` |
| `owner_role_code` | text | yes | Role lane responsible for action |
| `owner_user_id` | uuid/null | no | Optional assigned owner |
| `source_module` | text | yes | Module source such as `admission`, `cthssv`, `training`, `finance`, `hou`, `system` |
| `source_ref_type` | text | yes | Ref class such as `lead_id`, `student_ref`, `class_ref`, `receivable_ref`, `hou_student_ref` |
| `source_ref_id` | text | yes | Ref identifier only; no raw PII or evidence content |
| `controlled_evidence_id` | text/null | no | Redacted evidence registry ID only |
| `title` | text | yes | Short non-sensitive task label |
| `status` | text | yes | Must use status lifecycle in section 5 |
| `priority` | text | yes | `LOW`, `NORMAL`, `HIGH`, `URGENT` |
| `due_at` | timestamptz/null | no | Optional SLA date |
| `created_by_user_id` | uuid | yes | Auth user ID |
| `reviewed_by_user_id` | uuid/null | no | User who reviewed/closed task |
| `metadata_ref` | jsonb | no | Ref-only JSON; no raw PII, phone, CCCD, bank, password, token or full evidence |
| `created_at` | timestamptz | yes | Server time |
| `updated_at` | timestamptz | yes | Server time |
| `closed_at` | timestamptz/null | no | Set only for closed states |
| `archived_at` | timestamptz/null | no | Soft archive; no hard delete |

## 4. TASK_CENTER_EVENT_LOG Draft Columns

| Column | Type draft | Required | Rule |
|---|---|---|---|
| `event_id` | uuid | yes | Primary key |
| `task_id` | uuid | yes | Foreign key to `TASK_CENTER.task_id` |
| `actor_user_id` | uuid | yes | Auth user ID |
| `actor_role_code` | text | yes | Role at action time |
| `event_type` | text | yes | `CREATE`, `ASSIGN`, `STATUS_CHANGE`, `COMMENT`, `RETURN_SCOPE`, `CLOSE`, `ARCHIVE` |
| `from_status` | text/null | no | Previous status |
| `to_status` | text/null | no | New status |
| `reason_code` | text/null | no | Required for `CAN_SUA`, `KHONG_THUOC_TOI`, `DA_HUY` |
| `controlled_evidence_id` | text/null | no | Redacted evidence ref only |
| `event_note` | text/null | no | Short non-sensitive note |
| `created_at` | timestamptz | yes | Server time |

## 5. Status Lifecycle

Allowed task statuses:

```text
DRAFT
CHO_XAC_NHAN
DUNG
CAN_SUA
KHONG_THUOC_TOI
DA_KHOA
DA_HUY
```

Allowed transitions:

| From | To | Owner |
|---|---|---|
| `DRAFT` | `CHO_XAC_NHAN` | IT_DATA or source module owner |
| `CHO_XAC_NHAN` | `DUNG` | Department owner |
| `CHO_XAC_NHAN` | `CAN_SUA` | Department owner |
| `CHO_XAC_NHAN` | `KHONG_THUOC_TOI` | Department owner |
| `DUNG` | `DA_KHOA` | Audit or owner reviewer |
| `CAN_SUA` | `CHO_XAC_NHAN` | IT_DATA after correction |
| `KHONG_THUOC_TOI` | `CHO_XAC_NHAN` | IT_DATA after reroute |
| any open state | `DA_HUY` | IT_DATA + Audit with reason |

Hard delete is not allowed. Use `archived_at` plus event log.

## 6. Role And Scope Rules

Minimum role/scope contract:

| Lane | Read | Create draft | Change status | Close/lock |
|---|---|---|---|---|
| Tuyen sinh | scoped own/team/ref | own/team draft | assigned scoped tasks | no |
| CTHSSV | scoped handover/student refs | no by default | assigned CTHSSV tasks | no |
| Dao tao/Khoa | scoped class/program refs | no by default | assigned training tasks | no |
| Finance | scoped finance refs read-only | no | return/check only | no payment/COM conclusion |
| HOU | HOU refs only | no | status only after owner route | no COM conclusion |
| IT_DATA | all task refs for routing | yes | reroute/correct metadata refs | no production approval |
| Audit | all task refs for audit | no | lock after evidence review | audit lock only |
| BGH | read dashboard summaries | no | no | no daily task mutation |

RLS/RPC must be scope-first:

```text
HEUWorkspaceContext resolves role/workspace/scope first.
Query filters use admission_segment_id/department_code/owner_user_id before data fetch.
No broad fallback when scope is missing.
Finance and HOU mutation requires separate module gate.
```

## 7. Source Ref Allowlist

Task Center may store only refs/metadata from this allowlist:

| Module | Allowed refs |
|---|---|
| admission | `lead_id`, `followup_ref`, `ho_so_ref`, `handover_ref` |
| cthssv | `student_ref`, `handover_ref`, `status_ref` |
| training | `class_ref`, `program_ref`, `teacher_ref`, `schedule_ref` |
| finance | `receivable_ref`, `recon_ref`, `payment_ref`, `evidence_ref` |
| hou | `hou_student_ref`, `hou_contract_ref`, `hou_recon_ref`, `hou_com_ref` |
| system | `user_ref`, `role_ref`, `workspace_ref`, `audit_ref` |

Forbidden in task rows:

- CCCD, phone, address, raw email list or parent info.
- Bank account, bank statement, voucher image or payment raw data.
- Password, OTP, invite link, reset link, token, API key, secret.
- Full contract/evidence content.
- AI-generated conclusion as official decision.

## 8. AI Boundary

AI/Codex may:

- Draft a task title from safe metadata.
- Check missing fields.
- Suggest owner lane.
- Summarize status counts.

AI/Codex must not:

- Create or update production tasks directly.
- Approve `DUNG`, `DA_KHOA`, finance, HOU, COM, payment, UAT or owner GO.
- Read raw restricted data.
- Call paid automation by default.
- Store prompt/response content as official evidence.

## 9. Cost Guard

Default implementation must be low-cost:

- One app route.
- One database table pair only after approval.
- No microservice.
- No paid automation.
- No AI call on every task view.
- Optional AI only as manual draft/check action behind a feature flag.
- Status counts use read model or indexed query, not repeated broad scans.

## 10. Index And Read Model Draft

Draft indexes, not executable SQL:

```text
TASK_CENTER(department_code, status, admission_segment_id)
TASK_CENTER(owner_user_id, status, due_at)
TASK_CENTER(source_module, source_ref_type, source_ref_id)
TASK_CENTER_EVENT_LOG(task_id, created_at)
```

Dashboard/read model rule:

```text
Read summaries only after owner/audit approves source and scope.
Do not compute finance/HOU official totals from Task Center alone.
```

## 11. Migration Gate Before Implementation

Before any SQL is created, HEU needs:

| Gate | Required evidence |
|---|---|
| `TC-DB-01` | IT_DATA approves data dictionary |
| `TC-DB-02` | Audit approves event log contract |
| `TC-DB-03` | PHAP_CHE confirms no restricted data is stored |
| `TC-DB-04` | Owner lanes approve department workflow |
| `TC-DB-05` | Backup ID and restore dry-run evidence |
| `TC-DB-06` | RLS negative-access test plan |
| `TC-DB-07` | Rollback plan and feature flag |

Until all gates pass:

```text
TASK_CENTER_DATABASE_READY: NO_GO
TASK_CENTER_PRODUCTION_READY: NO_GO
```

## 12. Rollback

Current slice rollback:

```text
Revert this docs/checker PR.
No database rollback required.
```

Future database rollback must include:

- disable feature flag,
- block task mutation routes,
- export metadata-only task rows,
- revert migration if safe,
- preserve event logs unless legal/owner rollback requires archive,
- record rollback event in audit ledger.

## 13. Required Local Commands

```powershell
npm.cmd run check:heu-task-center-data-contract-readiness
npm.cmd run check:heu-department-task-inbox-mvp-readiness
npm.cmd run check:heu-data-confirmation-task-center
npm.cmd run check:heu-app-shell-draft-pr-readiness
```

Do not run `npm install`, `npm ci`, migration, Supabase push or production
deploy as part of this slice.

## 14. SOP Slice Result Record

SOP-SCOPE:
- `HEU-DATA-004` defines Task Center data contract before implementation.
- Scope is docs/control + read-only checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-task-center-data-contract-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns data dictionary and RLS implementation plan.
- Audit owns event log and negative-access proof.
- Department owners own workflow/status acceptance.

SOP-LEGAL:
- PHAP_CHE must confirm restricted data is not stored in task rows.
- HOU remains separated from internal HEU students and COM decisions.

SOP-LOGIC:
- Contract can be `PASS_LOCAL` while database implementation remains `NO_GO`.
- No task mutation should be implemented before gates `TC-DB-01` through
  `TC-DB-07`.

SOP-VERIFY:
- Checker must verify required tables, columns, statuses, RLS/scope rules,
  AI boundary, cost guard, migration gate and no executable SQL path.

SOP-RESULT:
- `PASS_LOCAL` for Task Center data contract.
- `CAN_SUA_IT_DATA_AUDIT_PHAP_CHE_OWNER` for formal review.
- `NO_GO` for Task Center database, mutation routes and production.

SOP-NEXT:
- IT_DATA + Audit + PHAP_CHE review this contract.
- If accepted, next slice is a commented SQL draft or TypeScript read model
  interface, still no migration.
