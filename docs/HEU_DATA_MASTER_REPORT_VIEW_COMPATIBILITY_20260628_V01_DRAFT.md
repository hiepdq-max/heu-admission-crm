# HEU Data Master / Report View Compatibility 2026-06-28 V01 Draft

Status: DRAFT_CONTROL
Owner: BGH + IT_DATA + KHTC + Dao Tao + HOU owner + Audit
Production status: NO-GO

## 1. Purpose

Define the non-destructive bridge between the P0 Data Master register and the
Report View register. This compatibility plan explains how future
`STUDENT_MASTER`, `CLASS_MASTER` and `COHORT_MASTER` views may support
dashboard/report use without renaming, dropping, merging or importing production
source data.

This is a planning/control artifact only. It does not approve production SQL,
schema migration, UAT acceptance, dashboard reliance, evidence acceptance,
finance action or owner Go/No-Go.

## 2. Compatibility Rule

Current module tables remain the source of record. A compatibility view can be
designed only when these are documented:

- canonical master name;
- current physical sources;
- module boundary and owner;
- stable key or matching rule;
- allowed report views;
- data-quality check;
- forbidden interpretation;
- required owner signoff and UAT evidence.

If any item is missing, the report view stays `CHUA_DU_DIEU_KIEN` for production
reliance.

## 3. Minimum Compatibility Objects

| Compatibility object | Target master | Current sources | Report consumers | Quality check | Status |
|---|---|---|---|---|---|
| CV_STUDENT_MASTER_UNIFIED | STUDENT_MASTER / HOC_SINH_MASTER | `leads` and handover state; TTGDTX student-receivable references; HOU workspace; `short_student_master` | RV_TTGDTX_CONG_NO_THUC_THU; RV_HOU_LEDGER_SUMMARY; RV_SHORT_COURSE_ATTENDANCE_PAYMENT | DQ-DM-01 stable identity and lifecycle-state reconciliation | DESIGN_ONLY |
| CV_CLASS_MASTER_UNIFIED | CLASS_MASTER | TTGDTX center/class metadata; `short_class_master`; HOU program/location/class-like intake fields | RV_TTGDTX_FINANCE_SUMMARY; RV_HOU_LEDGER_SUMMARY; RV_SHORT_COURSE_ATTENDANCE_PAYMENT | DQ-DM-02 class key, owner and module-separation proof | DESIGN_ONLY |
| CV_COHORT_MASTER_UNIFIED | COHORT_MASTER | Admission segment, school year, intake, TTGDTX period and short-course session references | RV_TTGDTX_UAT_READINESS; RV_TTGDTX_FINANCE_SUMMARY; RV_AUDIT_RISK_CONTROL | DQ-DM-03 reporting period and intake boundary check | DESIGN_ONLY |
| CV_PROGRAM_MASTER_COMPAT | PROGRAM_MASTER | Program/major master, HOU programs/majors and short-course offerings | RV_HOU_LEDGER_SUMMARY; RV_SHORT_COURSE_ATTENDANCE_PAYMENT; admissions reports | DQ-DM-04 active version, owner and business meaning check | DESIGN_ONLY |
| REPORT_VIEW_MASTER_CONTRACT | REPORT_VIEW_REGISTER + DATA_QUALITY_CHECK_LOG | Report-view register, source map, DQ checks, owner signoff capture and UAT evidence references | `/reports`; `/finance-desk`; `/ttgdtx/accounting-dashboard`; BGH | DQ-DM-05 dashboards read approved report views only | DRAFT_CONTROL |

## 4. Report View Master Requirements

| Report view | Required masters | Use contract | Blocker |
|---|---|---|---|
| RV_TTGDTX_FINANCE_SUMMARY | TTGDTX_MASTER, STUDENT_MASTER, CLASS_MASTER, RECEIPT/PAYMENT masters | Read only from approved TTGDTX dashboard and Finance Desk report views | Signed P2-18 and P5-03 UAT plus owner signoff are missing |
| RV_TTGDTX_CONG_NO_THUC_THU | STUDENT_MASTER, CONTRACT/TUITION master, RECEIPT_MASTER, DOI_SOAT_MASTER | Show receivable/actual-collection signals only when receipt and reconciliation references exist | Cannot claim real HEU receipt without external reconciliation evidence |
| RV_HOU_LEDGER_SUMMARY | HOU_STUDENT_MASTER, PROGRAM_MASTER, LOCATION master, HOU_COMMISSION_LEDGER | Keep HOU ledger and COM review separate from TTGDTX and Short Course flows | HOU handover, ledger and commission owner signoff are missing |
| RV_SHORT_COURSE_ATTENDANCE_PAYMENT | SHORT_COURSE_STUDENT_MASTER, CLASS_MASTER, ATTENDANCE, payment readiness objects | Use attendance/class/payment compatibility only for UAT preparation and read-only review | Attendance/payment UAT and report-view signoff are missing |
| RV_AI_ALLOWED_CONTEXT | REPORT_VIEW_REGISTER, DATA_DICTIONARY, AI_AGENT_SCOPE_REGISTER, RISK_CONTROL | AI may read approved context only; no raw restricted data and no workflow writes | AI scope registry approval and prompt/output audit design are missing |

## 5. Data Quality Checkpoints

| Check ID | Checkpoint | Owner action | Evidence state | Stop condition |
|---|---|---|---|---|
| DQ-DM-01 | Student identity compatibility | IT/Data maps stable student identifiers without importing raw PII or merging module tables | Design-only mapping; no production view created | A report mixes lead, student, parent or CCCD data without owner-approved scope |
| DQ-DM-02 | Class and cohort boundary | Dao Tao, TTGDTX and Short Course owners confirm class/cohort meaning per module | Owner signoff pending | A class or cohort key is reused across modules with different meaning |
| DQ-DM-03 | Report-view contract | BGH, KHTC, IT/Data and Audit confirm dashboard reads approved report views only | Report-view source map is DRAFT_CONTROL | Dashboard reads raw workbook, raw bank file, voucher or unrestricted table |
| DQ-DM-04 | Sensitive data and AI boundary | Audit verifies restricted data is not exposed to AI or broad dashboards | AI production action remains blocked | AI reads raw restricted data, writes workflow state or implies approval |
| DQ-DM-05 | Dashboard reliance lock | BGH + KHTC confirm each dashboard/Finance Desk reliance path has an approved report-view contract, owner signoff and controlled evidence reference | Reliance signoff pending; dashboard remains read-only/UAT-only | `/reports`, `/finance-desk` or `/ttgdtx/accounting-dashboard` is used for management, finance or statutory reliance before owner signoff |

## 6. Allowed Next Build

| Build item | Allowed scope | Not allowed |
|---|---|---|
| `/reports` Data Master / Report View bridge | Show compatibility objects, required masters, report-view contracts, DQ checkpoints and stop conditions | Create SQL views, merge source data, edit evidence or approve signoff |
| Data dictionary hardening | Add field meaning, owner, sensitivity and AI-allowed notes | Import raw PII, bank data, vouchers or unrestricted source files |
| Compatibility SQL draft | Draft reviewed non-production SQL after owner meaning is confirmed | Run production migration or destructive rename/drop/merge |

## 7. Boundary

This compatibility plan is `DESIGN_ONLY` and `DRAFT_CONTROL`. Production remains
NO-GO until backup/restore proof, signed migration order, signed UAT,
hard-delete/cascade closure, report-view owner signoff and final owner Go/No-Go
exist outside Git/Codex/chat.
