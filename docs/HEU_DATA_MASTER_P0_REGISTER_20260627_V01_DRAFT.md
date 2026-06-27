# HEU Data Master P0 Register 2026-06-27 V01 Draft

Status: DRAFT_CONTROL
Owner: IT_DATA + Process owners
Production status: NO-GO

## 1. Purpose

Define the minimum P0 master-data layer required before workflow, dashboard,
automation or AI can be trusted. This register is a control artifact only and
does not approve schema changes or production migration.

## 2. Build Rule

Data Master comes before workflow, dashboard, automation and AI. Any dashboard
or agent that reads raw files, quick-calculation files or unapproved restricted
data is CHUA_DU_DIEU_KIEN.

## 3. P0 Master Groups

| Group | Required master | Current treatment | Gate |
|---|---|---|---|
| System | ORG_MASTER | Needed as cross-module master | Owner and status required |
| System | POSITION_MASTER | Needed as cross-module master | Role/scope mapping required |
| System | USER_MASTER | Exists through app auth/profile concepts | Role/scope UAT required |
| System | ROLE_PERMISSION_MATRIX | Exists as doc/control | Signed access UAT required |
| Legal/SOP | LEGAL_ARTICLE_MASTER | Gap | Legal owner and source reference required |
| Legal/SOP | REGULATION_MASTER | Gap | Internal rule/version owner required |
| Legal/SOP | SOP_MASTER | Partial through docs/workflow | SOP owner and status required |
| Legal/SOP | SOP_TO_DATA_MAPPING | New P0 register | Mapping must exist before automation |
| Admission | LEAD_MASTER_CONTROLLED | Partial | Lifecycle/handover and finance gate required |
| Admission | SOURCE_MASTER | Partial | Source evidence and owner required |
| Admission | CTV_MASTER | Needed where CTV exists | Contract/policy gate required |
| Student | STUDENT_MASTER / HOC_SINH_MASTER | Gap as single cross-module master | Compatibility view/table required |
| Student | STUDENT_STATUS_HISTORY | Gap | Status owner and audit required |
| Student | HO_SO_METADATA | Partial | Raw evidence must stay outside Git/chat |
| Training | PROGRAM_MASTER | Partial | Program owner and active version required |
| Training | CURRICULUM_MASTER | Gap | Curriculum version and signoff required |
| Training | CLASS_MASTER | Partial | Class code and owner required |
| Training | ENROLLMENT | Partial | Student/class/program linkage required |
| Training | ATTENDANCE | Exists in short-course area | Attendance is source data for related payments |
| TTGDTX/9+ | TTGDTX_MASTER | Partial | Center and contract linkage required |
| TTGDTX/9+ | LOP_TAI_TTGDTX_MASTER | Gap as consolidated master | Class-center compatibility required |
| TTGDTX/9+ | TTGDTX_CONTRACT_MASTER | Partial | Legal/finance UAT required |
| ND238 | ND238_HO_SO_MASTER | Gap | Policy/legal gate required |
| ND238 | ND238_GIAI_NGAN_MASTER | Gap | Disbursement evidence/signoff required |
| Finance | CONG_NO_MASTER | Partial through TTGDTX receivables | Real HEU receipt and reconciliation gate |
| Finance | PAYMENT_MASTER | Partial | Payment source/evidence required |
| Finance | RECEIPT_MASTER | Needed | Bank/receipt reconciliation required |
| Finance | COM_POLICY_MASTER | Gap/candidate | Contract/policy version required |
| Finance | COM_TRANSACTION | Gap/candidate | Only after real receipt and reconciliation |
| Finance | DOI_SOAT_MASTER | Partial | Period lock and audit required |
| HOU | HOU_STUDENT_MASTER | Partial/foundation | Must stay separate from TTGDTX |
| HOU | HOU_HANDOVER_LOG | Needed | Handover evidence required |
| HOU | HOU_TUITION_LEDGER | Needed | HOU ledger separate from HEU middle-school flow |
| HOU | HOU_COMMISSION_LEDGER | Needed | Commission only after reconciliation |
| Short Course | SHORT_COURSE_PROGRAM_MASTER | Partial | Program version required |
| Short Course | SHORT_COURSE_CLASS_MASTER | Partial | Class_id required |
| Short Course | SHORT_COURSE_STUDENT_MASTER | Partial | Student_id required |
| Short Course | MEAL_EXPENSE | Needed | Attendance/source evidence required |
| Short Course | HR_PAYMENT | Needed | Attendance and approval required |
| Report | REPORT_VIEW_REGISTER | New P0 register | Dashboards read approved views only |
| Report | DATA_QUALITY_CHECK_LOG | Needed | Required before trusted reporting |
| Audit | RISK_CONTROL | Partial | Risk owner and signoff required |
| Audit | AUDIT_LOG | Exists/partial | Signed audit-log UAT required |
| Audit | SIGNOFF_REGISTER | New P0 register | Human approvals only |

## 4. Classification

- DAT: enough for controlled internal read/use.
- CAN_SUA: foundation exists but must be hardened before real workflow.
- CHUA_DU_DIEU_KIEN: do not code deep workflow/dashboard/AI yet.
- CAM_CODE: not allowed until human signoff, UAT and evidence exist.

## 5. Boundary

This register does not rename, drop, alter or create production schema. It is a
planning and control source for future migration candidates.

