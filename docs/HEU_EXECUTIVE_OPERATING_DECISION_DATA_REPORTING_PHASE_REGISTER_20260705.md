# HEU Executive Operating Decision Data Reporting Phase Register

Status: PASS_LOCAL_DECISION_REGISTER
Decision values: EXECUTIVE_DATA_REPORTING_PHASE_READY / NO_GO / BLOCKED
Stage: Stage D - internal controlled test only
Production status: NO-GO
Scope: docs/audit control only

## 1. Operating Decision

HEU must not be built as one large uncontrolled block. The operating system is
split into four controlled phases so the shared source data and shared reports
stay consistent across departments.

Primary objective:

- one shared Data Master and Report View control chain;
- one owner-confirmed data status per source;
- one shared report number for every department-facing dashboard;
- no department may treat a private spreadsheet, local note or unconfirmed
  report row as the official number.

## 2. Four Phase Register

Vietnamese operating labels:

- Phase 01: Khoa loi chung.
- Phase 02: Cho tung phong dung thu co kiem soat.
- Phase 03: Giao viec xac nhan du lieu that.
- Phase 04: UAT / Evidence / Production Gate.

| Phase | Scope | Required output | PASS_LOCAL stop condition |
| --- | --- | --- | --- |
| PHASE-01 Core Lock | User, permission, source data, task confirmation, audit log and report-view controls | `CORE_LOCK_READY / NO_GO / BLOCKED`; Data Master and Report View chain declared before workflow reliance | Missing role/scope boundary, missing audit-log route, missing report-view source map or unconfirmed master data |
| PHASE-02 Controlled Department Trial | KHTC/Accounting, Admissions, CTHSSV, Dao Tao, Khoa/Giang vien and Short Course use controlled local surfaces | `DEPARTMENT_TRIAL_READY / NO_GO / BLOCKED`; each department can review only its controlled scope and blockers | Any department treats local PASS_LOCAL as UAT pass, evidence acceptance, finance reliance, report-view reliance, dashboard reliance or owner GO |
| PHASE-03 Real Data Confirmation Tasks | Real data moves to waiting-for-confirmation status by owner lane | `REAL_DATA_CONFIRMATION_READY / NO_GO / BLOCKED`; each confirmation task has owner lane, source ref, DQ check, evidence ref and blocker state | Raw data, PII, bank data, voucher files, service-role keys or auth users are placed in Git/Codex/chat, or owner confirmation is missing |
| PHASE-04 UAT / Evidence / Production Gate | Signed UAT, controlled evidence, backup/restore, migration order and final owner GO/NO-GO | `PRODUCTION_GATE_READY / NO_GO / BLOCKED`; production can be considered only after all external evidence and signatures exist | Missing signature, missing backup/restore proof, missing owner GO/NO-GO, unresolved hard-delete/cascade risk or failed local guard |

## 2B. Whole-System Master Control Status Table

Control token: `WHOLE_SYSTEM_MASTER_CONTROL_STATUS_TABLE`.
Decision values: `MASTER_CONTROL_SYSTEM_STATUS_READY / NO_GO / BLOCKED`.

This table is the current whole-system operating picture. It separates local
packaging from real operation so a department can see which lane is PASS_LOCAL,
which lane is NO-GO, and which blocker must close before reliance.

| Priority | Master Control lane | Current local state | Real-operation state | Smallest next blocker |
| --- | --- | --- | --- | --- |
| 1 | HEU Master Control overview | `MASTER_CONTROL_SYSTEM_STATUS_READY / NO_GO / BLOCKED`; PASS_LOCAL status table recorded in this register | NO-GO for broad use | Keep current-state, backlog, gap matrix and implementation-log checks green before moving to the next slice |
| 2 | User/permission operation | `HEU_ROLE_POSITION_OPERATION_TEST_MATRIX_20260704.md` records role, department, position, route and blocked-action checks under `ROLE_POSITION_OPERATION_TEST_MATRIX_READY / NO_GO / BLOCKED`; `check:heu-role-position-operation-test-matrix` is PASS_LOCAL with role-aware baseline `missing_visibility=0`, `missing_business_scope=0`, `department_lane_mismatch=0`, while `Guide writing decision: NO_GO`, `required_positions=15`, `unassigned_required_positions=11`, `ttgdtx_negative_candidates=0`, `pending_external_evidence_lanes=4` and `REAL_OUT_OF_SCOPE_NEGATIVE_01` blockers remain visible | NO-GO for broad access expansion, guide finalization or real-user widening | Required position assignment, negative-control proof, signed role-scope/UAT evidence and owner scope/cutover decision are still required |
| 3 | Data Master / Report View | `SINGLE_SOURCE_DATA_REPORT_CHAIN`, `NO_DEPARTMENT_PRIVATE_NUMBER` and report-view source map are PASS_LOCAL controls | NO-GO for dashboard reliance | Owner-confirmed source refs, DQ result and report-view owner signoff remain external |
| 4 | Data Confirmation Task Center | Metadata-only queue starts at `CHO_XAC_NHAN` for KHTC, Admissions, CTHSSV, Dao Tao, Khoa/Giang vien and Short Course; real-data reliance waits for approved user/position/scope closure, negative-control proof and external evidence gates | NO-GO for data reliance | Owner marks `DUNG`, `CAN_SUA`, `KHONG_THUOC_TOI` or `DA_KHOA` outside Git/Codex/chat with controlled evidence after required position assignment, negative-control proof and external UAT/evidence blockers close |
| 5 | Accounting / Finance Desk / TTGDTX 9+ | Read-only controlled trial surfaces are PASS_LOCAL only | NO-GO for accounting, payment, payout or finance approval | Signed finance UAT, access closure, evidence acceptance and owner GO/NO-GO are still required |
| 6 | Admissions / Tuyen sinh | Local document/source/owner-closure controls are PASS_LOCAL packaged | NO-GO for enrollment, handover acceptance or dashboard reliance | Signed owner UAT, document evidence, source proof and report-view signoff remain external |
| 7 | CTHSSV | Local handover/readiness/evidence-reference controls are PASS_LOCAL packaged | NO-GO for real handover or enrollment reliance | Signed owner UAT, controlled evidence refs and external execution proof remain external |
| 8 | Dao Tao / Khoa / Short Course | Local class, teacher, attendance/payment and final-review controls are PASS_LOCAL packaged | NO-GO for class operation, teaching reliance, attendance/payment or payroll | Signed owner UAT, privacy approval, source reconciliation, payment/payroll boundary proof and final owner quorum remain external |
| 9 | Legal SOP Governance | Authority, signer, approver and valid-evidence lanes are DRAFT_CONTROL/PASS_LOCAL controls | NO-GO for legal conclusion, waiver or approval | Signed PHAP_CHE/SOP authority proof and owner decision are still required |
| 10 | UAT / Evidence / Production Gate | Gate checklist is explicit but not closed | NO-GO until signed UAT, controlled evidence, backup/restore and owner GO/NO-GO | Backup/restore proof, migration order, signed UAT, evidence acceptance and final owner quorum remain external |
| 11 | HEU AI Agent | `PASS_LOCAL_AI_AGENT_BOUNDARY`; AI may assist reporting, reminders and error/risk detection only | NO-GO for autonomous approval, real data write or real email | Approved AI configuration, role-scoped source context and human owner decision remain required |
| 12 | Guidance docs for departments/users | Guidance docs are NOT_READY for full handoff | NO-GO for broad user training reliance | Read source Word/department guidance and produce phase/user-specific web-app instructions |

## 2A. Legal SOP Governance Authority Binding

This operating decision is controlled by the Legal/SOP/Governance authority
chain before any department trial result can be treated as reliable.

| Question | Required owner lane | Valid proof | Stop rule |
| --- | --- | --- | --- |
| Ai duoc ky? | BGH + accountable owner + Audit, with PHAP_CHE/KHTC/IT_DATA when the gate touches legal, finance or system access | External signed result with signer lane, signed date and controlled evidence ref | No inferred signature from PASS_LOCAL, dashboard state or AI output |
| Ai duoc duyet? | Maker/checker/approver lane named in SOP and role-scope matrix | Approval route, threshold, checker evidence and audit-log ref | No approval action, waiver, finance action or owner GO inside Codex/chat |
| Bang chung nao hop le? | Audit + IT_DATA + process owner + redaction reviewer | Controlled external evidence ref, storage class, redaction reviewer and linked DQ/UAT case | No raw PII, bank data, voucher, password, reset link or source file in Git/Codex/chat |
| Khi nao duoc dung rong? | Final owner quorum only after PHASE-04 | Backup/restore proof, migration order, signed UAT, controlled evidence, report-view signoff, dashboard reliance decision and final owner GO/NO-GO | Production remains NO-GO while any proof or signature is missing |

Control token: `EXECUTIVE_FOUR_PHASE_LEGAL_SOP_GOVERNANCE_GATE`.

## 3. Shared Data And Report Chain

Authoritative path for shared numbers:

`Data Master -> Data Quality Check -> Report View Source Map -> Owner Signoff -> UAT Evidence -> Dashboard Reliance`

Control tokens:

- `SINGLE_SOURCE_DATA_REPORT_CHAIN`
- `NO_DEPARTMENT_PRIVATE_NUMBER`
- `NO_UNCONFIRMED_REPORT_RELIANCE`
- `NO_DASHBOARD_RELIANCE_BEFORE_SIGNOFF`
- `NO_PRODUCTION_GO_FROM_PASS_LOCAL`

If two departments show different numbers for the same metric, record
`NO_GO_SOURCE_CONFLICT` and stop at Data Quality Check. Do not pick the more
convenient number and do not hide the conflict in a dashboard.

## 4. Department Trial Lanes

| Lane | Controlled trial boundary | Shared report dependency |
| --- | --- | --- |
| KHTC / Accounting | Review receivable, collection, reconciliation, request, approval and payout controls only | Finance Desk and TTGDTX finance report views remain UAT/evidence gated |
| Admissions / Tuyen sinh | Review lead, document, source, pipeline and handover controls only | Admissions report rows must link to Data Master and owner-confirmed document/source status |
| CTHSSV | Review student handover/readiness controls only | `RV_CTHSSV_HANDOVER_STATUS` remains no-reliance until signed owner/UAT evidence |
| Dao Tao | Review class/cohort/program readiness controls only | Class and cohort master must be confirmed before dashboard reliance |
| Khoa / Giang vien | Review teaching delivery/source/evidence status only | `RV_KHOA_GIANG_VIEN_DELIVERY` remains no-reliance until report-view owner signoff |
| Short Course | Review attendance/payment/source reconciliation controls only | `RV_SHORT_COURSE_ATTENDANCE_PAYMENT` remains no-reliance until signed attendance/payment UAT |

Each lane may use controlled PASS_LOCAL review surfaces. No lane may execute
real UAT, accept evidence, approve finance action, approve dashboard reliance,
approve owner GO/NO-GO or mark production GO from this register.

## 5. Real Data Confirmation Task Model

Every real-data confirmation task must stay metadata-only in Git/Codex/chat.

Required fields:

| Field | Meaning |
| --- | --- |
| `confirmation_task_id` | Stable local task ID |
| `owner_lane` | Department/person lane responsible for confirmation |
| `source_ref` | External controlled source reference, not raw data |
| `data_object` | Master/report object being confirmed |
| `dq_check_id` | Data Quality Check row |
| `current_state` | `WAITING_OWNER_CONFIRMATION / NO_GO / BLOCKED` |
| `task_center_status` | Data Confirmation Task Center status |
| `controlled_evidence_ref` | External evidence reference, not file contents |
| `signed_result` | External signature result, not inferred from PASS_LOCAL |
| `blocker_state` | Missing evidence, mismatch, RLS/empty ambiguity or owner decision required |

Allowed local status values:

- `WAITING_OWNER_CONFIRMATION`
- `CONFIRMED_EXTERNAL_REF_ONLY`
- `NO_GO_SOURCE_CONFLICT`
- `BLOCKED_MISSING_EVIDENCE`
- `BLOCKED_OWNER_DECISION`

## 6. Data Confirmation Task Center Status Taxonomy

The Data Confirmation Task Center turns real-data review into owner-lane work
items. The center is metadata-only until an external owner confirms the source,
evidence and signature path outside Git/Codex/chat.

Task Center status values:

| Code | Vietnamese label | Meaning | Local stop rule |
| --- | --- | --- | --- |
| `CHO_XAC_NHAN` | Chờ xác nhận | Owner lane has a pending confirmation task with source ref and DQ check recorded | Do not rely on the data; owner confirmation is missing |
| `DUNG` | Đúng | Owner marked the metadata and external source ref as correct | Still not UAT pass, evidence acceptance, dashboard reliance or production GO |
| `CAN_SUA` | Cần sửa | Owner found mismatch, missing source, DQ failure or correction needed | Route a correction request; do not overwrite source data from Codex |
| `KHONG_THUOC_TOI` | Không thuộc tôi | Current owner rejects responsibility or says another lane owns the source | Re-route to the correct owner lane before any reliance |
| `DA_KHOA` | Đã khóa | Item is frozen after external signed result and gate evidence are recorded | Do not unlock or change from PASS_LOCAL; reopening requires owner decision |

Minimum Data Confirmation Task Center queue:

| `confirmation_task_id` | `owner_lane` | `data_object` | `task_center_status` | Required external proof |
| --- | --- | --- | --- | --- |
| `DCTC-KHTC-001` | KHTC / Accounting | Finance receivable and collection source | `CHO_XAC_NHAN` | Finance owner source ref, DQ check and controlled evidence ref |
| `DCTC-TUYEN-SINH-001` | Admissions / Tuyen sinh | Lead/document source status | `CHO_XAC_NHAN` | Admissions owner source ref, document DQ result and blocker state |
| `DCTC-CTHSSV-001` | CTHSSV | Student handover/readiness metadata | `CHO_XAC_NHAN` | CTHSSV owner evidence ref and handover reliance decision |
| `DCTC-DAO-TAO-001` | Dao Tao | Class/cohort/program master | `CHO_XAC_NHAN` | Dao Tao owner source reconciliation and signed confirmation |
| `DCTC-KHOA-001` | Khoa / Giang vien | Teaching delivery/source evidence | `CHO_XAC_NHAN` | Faculty owner source reconciliation and report-view signoff |
| `DCTC-SHORT-COURSE-001` | Short Course | Attendance/payment/source reconciliation | `CHO_XAC_NHAN` | Short Course owner attendance/payment UAT evidence ref |

Canonical task-id rule:

- The six department task IDs in this executive register must match the core
  department register, `/reports` task map and `/data-confirmation` route:
  `DCTC-KHTC-001`, `DCTC-TUYEN-SINH-001`, `DCTC-CTHSSV-001`,
  `DCTC-DAO-TAO-001`, `DCTC-KHOA-001` and `DCTC-SHORT-COURSE-001`.
- Legacy shorthand IDs are not canonical for the Data Confirmation Task Center
  executive surface.

Transition rules:

- A new item starts as `CHO_XAC_NHAN`.
- Only the responsible external owner may mark `DUNG`, `CAN_SUA` or
  `KHONG_THUOC_TOI`.
- `DA_KHOA` is allowed only after signed result, controlled evidence ref,
  report-view owner signoff and the relevant UAT/evidence gate are externally
  recorded.
- PASS_LOCAL checks may verify tokens and routing only. They must not create
  real email, task/ticket, user account, Supabase auth user, Drive file,
  database mutation, evidence acceptance, UAT acceptance, owner GO/NO-GO or
  production GO.

## 7. HEU AI Agent Operating Boundary

HEU AI Agent is allowed as an advisory control layer for reporting support,
task reminders and error/risk detection only.

Allowed local support:

- draft report summaries from approved, role-scoped report-view context;
- remind owner lanes about pending confirmation tasks, DQ checks and blockers;
- detect missing fields, source conflicts, evidence gaps, role/scope mismatch,
  duplicate risk and no-overflow/work-scope overflow risk;
- suggest the next human-owned action and the local check command to rerun.

Required AI control tokens:

- `HEU_AI_AGENT_REPORT_REMINDER_ERROR_ASSIST`
- `NO_AI_AUTO_APPROVAL`
- `NO_AI_REAL_DATA_WRITE`
- `NO_AI_REAL_EMAIL_BEFORE_APPROVED_CONFIG`
- `HUMAN_OWNER_DECISION_REQUIRED`

HEU AI Agent must not approve UAT, accept evidence, approve finance action,
approve owner GO/NO-GO, change source data, write real workflow state, create
real tasks/tickets, create real user accounts, send real email before approved
mail configuration exists, call production workflows, or mark production GO.

P7-07 is PASS_LOCAL_AI_AGENT_BOUNDARY only. It does not add an AI service call,
prompt storage, runtime AI worker, email sender, database mutation, Supabase
access change, finance workflow or production action.

## 8. UAT Evidence Production Gate

Production remains NO-GO until all of these are externally complete:

- backup/restore proof accepted;
- signed migration order accepted;
- signed UAT evidence for the relevant module accepted;
- controlled evidence references verified outside Git/Codex/chat;
- report-view owner signoff complete;
- dashboard reliance decision signed;
- hard-delete/cascade conversion or written waiver complete;
- final owner GO/NO-GO signed outside Git/Codex/chat.

PASS_LOCAL in this register is not UAT pass, evidence acceptance, finance
approval, owner approval or production readiness.

## 9. Slice Result

Current result: `EXECUTIVE_DATA_REPORTING_PHASE_READY` is a
PASS_LOCAL_DECISION_REGISTER state only.

This register does not change app runtime, database schema, Supabase access,
finance workflow, role permission, evidence storage, UAT status, dashboard
reliance, owner GO/NO-GO or production status. Production remains NO-GO.
