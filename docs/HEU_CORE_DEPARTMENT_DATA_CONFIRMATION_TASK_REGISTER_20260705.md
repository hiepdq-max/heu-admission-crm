# HEU Core Department Data Confirmation Task Register - 2026-07-05

Status: PASS_LOCAL_TASK_REGISTER
Decision values: CORE_DEPARTMENT_DATA_CONFIRMATION_READY / NO_GO / BLOCKED
Operating result: REAL_DATA_CONFIRMATION_READY: NO_GO
Production status: NO-GO
Scope: metadata-only task routing for real-data confirmation by department

## 1. Purpose

This register locks the common task model for the operating decision:
real data must enter a waiting-for-confirmation state, then the responsible
department user confirms, rejects, returns or blocks it through an owner lane.

This is not a task automation, database mutation or UAT result. It is the
control record that every module must reference before writing final room,
person or department operating guides.

Core objective tokens:
- PHASE-01 Core Lock
- PHASE-02 Controlled Department Trial
- PHASE-03 Real Data Confirmation Tasks
- PHASE-04 UAT / Evidence / Production Gate
- user_department_permission_scope_task_confirmation

## 2. Required Confirmation States

Every real-data task must use one of these states:

| State | Meaning | Stop rule |
| --- | --- | --- |
| `PENDING_DEPARTMENT_CONFIRMATION` | Data row/report/source is waiting for the responsible department lane. | Do not rely on the data. |
| `CONFIRMED_BY_DEPARTMENT` | Department owner confirms the metadata and external source reference. | Still not UAT pass, evidence acceptance or production GO. |
| `RETURNED_FOR_REPAIR` | Department owner found a mismatch or missing source. | Route repair; do not overwrite source data from Codex. |
| `BLOCKED_BY_SCOPE` | The assigned user cannot see the row, sees too much, or scope is unclear. | Repair scope baseline first. |
| `SIGNED_UAT_READY_EXTERNAL` | External signed UAT/evidence reference is recorded outside Git/Codex/chat. | Only Phase 04 owner gate may use it. |

DCTC status bridge:

`DCTC_STATUS_BRIDGE_READY`

| `task_center_status` | Department confirmation state | SQL blocker state / handoff result | Stop rule |
| --- | --- | --- | --- |
| `CHO_XAC_NHAN` | `PENDING_DEPARTMENT_CONFIRMATION` | `WAITING_OWNER_CONFIRMATION` | Owner/user confirmation is still missing. |
| `DUNG` | `CONFIRMED_BY_DEPARTMENT` | `CONFIRMED_BY_DEPARTMENT` | Still not report reliance, UAT pass, evidence acceptance or production GO. |
| `CAN_SUA` | `RETURNED_FOR_REPAIR` | `RETURNED_FOR_REPAIR` | Requires confirmation note and repair route; do not overwrite source data from Codex. |
| `KHONG_THUOC_TOI` | `BLOCKED_BY_SCOPE` | `OUT_OF_SCOPE` | Re-route to the correct owner lane or scope-repair lane before reliance. |
| `DA_KHOA` | `SIGNED_UAT_READY_EXTERNAL` | `LOCKED` | Lock only after external signed-result/evidence ref is recorded; `NO_SIGNED_UAT_ACCEPTANCE_FROM_DA_KHOA`. |

Required task record:

`DCTC_SOURCE_PROVENANCE_LOCK_READY`

`required_task_record=source_record_label,source_route,data_domain,dq_check_ref,department_owner_lane,assigned_user_label,required_route,scope_gate,confirmation_status,controlled_evidence_id,audit_log_ref,audit_trace_ref,due_date_or_batch,owner_decision_ref`

`SOURCE_METADATA_REQUIRED_BEFORE_CHO_XAC_NHAN`

The task center may route a row to `CHO_XAC_NHAN` only when the source label,
source route, data domain, DQ check ref, controlled evidence ref, due/batch and
owner decision ref are present. It records source provenance only; it must not
copy raw source payloads into Git/Codex/chat.

Owner/assignee pair lock:

`DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY`

`OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN`

`DCTC_OWNER_ASSIGNEE_DEPARTMENT_MATCH_READY`

`OWNER_ASSIGNEE_MUST_MATCH_TASK_DEPARTMENT`

Before DCTC routes approved source metadata into `CHO_XAC_NHAN`, the route must
name both `department_owner_lane` / `owner_user_id` and
`assigned_user_label` / `assigned_user_id`. This keeps every waiting task tied
to a department owner lane and a responsible user. The SQL route also rejects
owner/assigned users that are not active users in the task `department_code`,
so a KHTC task cannot be assigned into Admissions, CTHSSV, Dao Tao, Khoa or
Short Course by mistake. This does not assign real users outside owner-approved scope, grant access, seed real tasks, accept evidence, accept UAT, approve owner GO/NO-GO or mark production GO.

Scope gate route lock:

`DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN`

`SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN`

Before DCTC routes approved source metadata into `CHO_XAC_NHAN`, the task must
carry `scope_gate_ref` / `scope_gate` that points to the approved
permission/scope gate or pending scope-repair gate. This is a reference-only
control; it does not grant access, change scope, assign users, seed real tasks,
accept evidence, accept UAT, approve owner GO/NO-GO or mark production GO.

Scope-bound confirmer lock:

`DCTC_SCOPE_BOUND_CONFIRMER_LOCK_READY`

`NO_GLOBAL_CONFIRM_PERMISSION_BYPASS`

`CONFIRM_SUBMITTER_SCOPE_LOCK`

When an existing DCTC task is still in `CHO_XAC_NHAN`, the submitter must be
the task `assigned_user_id`, the task `owner_user_id`, or a same-department /
same-workspace lane with `data_confirmation.confirm`. Route/manage permission
or a global confirm permission is not a bypass for final department/user
confirmation. This lock does not grant access, change scope, assign users, seed
real tasks, accept evidence, accept UAT, approve owner GO/NO-GO or mark
production GO.

## 2.1 Report View Source Conflict Route Lock

`DCTC_REPORT_SOURCE_CONFLICT_ROUTE_READY`

When `docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md` marks a row as
`NO_GO_SOURCE_CONFLICT`, DCTC must keep a matching owner-confirmation route
before the shared report can be treated as resolved. This is the reciprocal
lock for `REPORT_VIEW_SOURCE_CONFLICT_DCTC_ROUTE_READY`: Report View points to
DCTC, and DCTC records the department lane, status and external proof ref.

| Report source conflict | Required DCTC task route | Required DCTC status until owner action |
| --- | --- | --- |
| Finance/TTGDTX totals conflict | `DCTC-KHTC-001` | `CHO_XAC_NHAN` / `PENDING_DEPARTMENT_CONFIRMATION` |
| Admissions/handover conflict | `DCTC-TUYEN-SINH-001` and/or `DCTC-CTHSSV-001` | `CHO_XAC_NHAN` / `PENDING_DEPARTMENT_CONFIRMATION` |
| Class delivery conflict | `DCTC-DAO-TAO-001` and `DCTC-KHOA-001` | `CHO_XAC_NHAN` / `PENDING_DEPARTMENT_CONFIRMATION` |
| Short Course attendance/payment conflict | `DCTC-DAO-TAO-001` and `DCTC-SHORT-COURSE-001` | `CHO_XAC_NHAN` / `PENDING_DEPARTMENT_CONFIRMATION` |

Allowed DCTC conflict outcomes:

- `DUNG` / `CONFIRMED_BY_DEPARTMENT` means the department confirms the source
  metadata, but report-view reliance still waits for signed owner signoff,
  controlled evidence refs and UAT/evidence gates outside Git/Codex/chat.
- `CAN_SUA` / `RETURNED_FOR_REPAIR` means the source conflict remains open and
  must go through repair; Codex must not overwrite source data.
- `KHONG_THUOC_TOI` / `BLOCKED_BY_SCOPE` means the route is in the wrong
  department lane or scope is unclear.
- `DA_KHOA` / `SIGNED_UAT_READY_EXTERNAL` means only that an external signed
  route/ref has been recorded; `NO_DA_KHOA_AS_SIGNED_UAT_ACCEPTANCE` remains
  mandatory.

Required conflict route fields:

- `source_record_label`
- `source_route`
- `data_domain`
- `dq_check_ref`
- `controlled_evidence_ref`
- `owner_decision_ref`
- `audit_trace_ref`
- `report_view_ref`

Stop rules:

- `NO_DASHBOARD_ONLY_CONFLICT_CLOSURE`
- `NO_PRIVATE_DEPARTMENT_NUMBER`
- `NO_REPORT_VIEW_RELIANCE_BEFORE_DCTC_OWNER_CONFIRMATION`
- `NO_DA_KHOA_AS_SIGNED_UAT_ACCEPTANCE`
- `NO_PRODUCTION_GO_FROM_PASS_LOCAL`

Boundary: docs/audit control only. This lock does not create real tasks, seed
tasks, mutate DCTC rows, query live data, import raw source files, copy raw
source payloads, accept controlled evidence, execute or accept UAT, approve
finance action, approve report-view reliance, approve dashboard reliance,
approve owner GO/NO-GO or mark production GO.

## 3. Department Confirmation Queue

| Task ID | Department lane | Assigned user label | Source object | Confirmation state | Scope gate | Required external proof |
| --- | --- | --- | --- | --- | --- | --- |
| `DCTC-KHTC-001` | KHTC / Accounting | KHTC_ACCOUNTING_OPERATOR_LABEL | Receivable, collection, payment and reconciliation report-view rows | `PENDING_DEPARTMENT_CONFIRMATION` | Finance Desk and accounting scope baseline | Accounting owner source ref, DQ check, controlled evidence ID |
| `DCTC-TUYEN-SINH-001` | TUYEN_SINH | TUYEN_SINH_OPERATOR_LABEL | Lead, document, source and handover rows | `PENDING_DEPARTMENT_CONFIRMATION` | Admissions lead visibility and document-review route | Admissions owner source ref, document DQ result, blocker state |
| `DCTC-CTHSSV-001` | CTHSSV | CTHSSV_HANDOVER_OPERATOR_LABEL | Student handover/readiness metadata | `PENDING_DEPARTMENT_CONFIRMATION` | CTHSSV handover scope and privacy guard | CTHSSV evidence ref and handover reliance decision |
| `DCTC-DAO-TAO-001` | DAO_TAO | DAO_TAO_REVIEWER_LABEL | Class, cohort, program and timetable master | `PENDING_DEPARTMENT_CONFIRMATION` | Training scope baseline | Dao Tao source reconciliation and signed confirmation |
| `DCTC-KHOA-001` | KHOA | KHOA_GIANG_VIEN_REVIEWER_LABEL | Teaching delivery, teacher assignment and evidence status | `PENDING_DEPARTMENT_CONFIRMATION` | Faculty scope and teacher-profile privacy guard | Khoa source reconciliation and report-view signoff |
| `DCTC-SHORT-COURSE-001` | SHORT_COURSE | SHORT_COURSE_OPERATOR_LABEL | Attendance, payment, allowance and source reconciliation rows | `PENDING_DEPARTMENT_CONFIRMATION` | Short Course attendance/payment scope | Short Course signed attendance/payment UAT evidence ref |
| `DCTC-IT-DATA-001` | IT_DATA | IT_DATA_BUILD_OPERATOR_LABEL | Data dictionary, report view, audit log and system control rows | `PENDING_DEPARTMENT_CONFIRMATION` | IT/Data read-only control lane | IT/Data controlled evidence ID and rerun record |
| `DCTC-AUDIT-001` | AUDIT | AUDIT_READONLY_REVIEWER_LABEL | Audit-log, evidence and redaction review rows | `PENDING_DEPARTMENT_CONFIRMATION` | Audit read-only evidence route | Audit review signoff and redaction class |
| `DCTC-BGH-001` | BGH | BGH_READONLY_REVIEWER_LABEL | Executive report summary and owner GO/NO-GO blocker row | `PENDING_DEPARTMENT_CONFIRMATION` | BGH read-only dashboard/report scope | Final owner decision reference after Phase 04 |

## 4. Module Queue References

The task register is a routing layer above the existing module queues. It does
not replace those queues.

| Lane | Current control queue |
| --- | --- |
| KHTC / Accounting | `docs/HEU_ACCOUNTING_OPEN_BLOCKER_ACTION_QUEUE_20260703.md`; `docs/HEU_ACCOUNTING_NEGATIVE_CONTROL_OWNER_ACTION_QUEUE_20260703.md`; `docs/HEU_ACCOUNTING_UAT_OWNER_CLOSURE_LEDGER_20260703.md` |
| TUYEN_SINH | `docs/HEU_ADMISSIONS_DOCUMENT_REVIEW_REPORTING_QUEUE_20260704.md`; `docs/HEU_ADMISSIONS_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md`; `docs/HEU_ADMISSIONS_OWNER_CLOSURE_LEDGER_20260704.md` |
| CTHSSV | `docs/HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md`; `docs/HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703.md`; `docs/HEU_CTHSSV_OWNER_CLOSURE_LEDGER_20260704.md` |
| DAO_TAO | `docs/HEU_DAO_TAO_LOCAL_READINESS_AGGREGATOR_20260704.md`; `docs/HEU_DAO_TAO_FINAL_LOCAL_REVIEW_DOSSIER_20260705.md`; `docs/HEU_TRAINING_MODULE_COMPLETION_BREAKDOWN_20260703.md` |
| KHOA | `docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md`; `docs/HEU_KHOA_GIANG_VIEN_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md`; `docs/HEU_KHOA_GIANG_VIEN_OWNER_CLOSURE_LEDGER_20260704.md` |
| SHORT_COURSE | `docs/HEU_SHORT_COURSE_SIGNED_UAT_EVIDENCE_INTAKE_20260704.md`; `docs/HEU_SHORT_COURSE_OWNER_CLOSURE_LEDGER_20260704.md`; `docs/HEU_SHORT_COURSE_LOCAL_COMPLETION_GATE_20260704.md` |
| IT_DATA / AUDIT / BGH | `docs/HEU_EXECUTIVE_OPERATING_DECISION_DATA_REPORTING_PHASE_REGISTER_20260705.md`; `docs/HEU_DEPARTMENT_TASK_HANDOFF_REGISTER_20260702.md`; `docs/HEU_ROOT_DRIVE_DEPARTMENT_CONFIRMATION_INTAKE_20260703.md` |

## 5. Current Live Blockers

The current real-data confirmation task register is locally ready, and the
role-aware user/scope baseline is clean. Real operation remains NO-GO because
the cutover gates still report:

- `missing_visibility=0`
- `missing_business_scope=0`
- `department_lane_mismatch=0`
- `required_positions=15`
- `unassigned_required_positions=11`
- `ttgdtx_negative_candidates=0`
- `pending_external_evidence_lanes=4`

These blockers mean department confirmation can be drafted and routed, but it
cannot be treated as final UAT, owner acceptance, report reliance or production
readiness.

## 6. Audit And Evidence Boundary

Each confirmation task must have:

- `audit_log_ref`
- `audit_trace_ref`
- `controlled_evidence_id`
- `owner_decision_ref`
- `scope_gate`
- `confirmation_status`

Forbidden in Git/Codex/chat:

- raw student PII, CCCD, bank data, voucher bodies or payroll bodies;
- passwords, temporary passwords, OTPs, reset links or invite links;
- service-role keys, API keys, SMTP passwords or private keys;
- raw signed UAT evidence, raw Drive links or downloadable attachment URLs.

Audit trace boundary:

- `audit_trace_ref` is a read-only lookup token from the DCTC task/status-history
  views, not raw audit payload.
- `DCTC_AUDIT_TRACE_READY` means the task and timeline views expose safe trace
  refs after RLS filtering as `DCTC_TASK` and `DCTC_HISTORY` references.
- `NO_AUDIT_LOG_MUTATION` remains mandatory: PASS_LOCAL may verify trace tokens
  only; it must not mutate `audit_logs`, accept evidence, accept UAT, approve
  owner GO/NO-GO or mark production GO.

## 7. PASS_LOCAL Boundary

This slice only creates the core department confirmation task register and a
read-only checker.

It does not create accounts, link Auth, assign real users, assign positions,
change lead visibility, add segment/partner scope, mutate database rows, send
email, create tickets, move Drive files, accept evidence, approve UAT, approve
finance reliance, approve owner GO/NO-GO, write final user guides or mark
production GO.

Boundary exact tokens: does not create accounts; link Auth; assign real users;
assign positions; change lead visibility; add segment/partner scope; mutate
database rows; send email; create tickets; accept evidence; approve UAT;
approve finance reliance; approve owner GO/NO-GO; write final user guides;
mark production GO.

## 8. Current Result

`CORE_DEPARTMENT_DATA_CONFIRMATION_READY` is PASS_LOCAL_TASK_REGISTER only.

`REAL_DATA_CONFIRMATION_READY: NO_GO` remains true until owner-approved users,
owner-approved scope-baseline closure, required position assignments,
negative-control proof, controlled evidence references, signed UAT and final
owner GO/NO-GO are closed outside Git/Codex/chat.
