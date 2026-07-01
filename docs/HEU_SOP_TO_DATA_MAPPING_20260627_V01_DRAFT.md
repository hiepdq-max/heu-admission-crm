# HEU SOP To Data Mapping 2026-06-27 V01 Draft

Status: DRAFT_CONTROL
Owner: PHAP_CHE + Process owners + IT_DATA
Production status: NO-GO

## 1. Purpose

Map the required chain from legal basis to regulation, SOP, data, workflow,
dashboard, automation and AI. No automation or dashboard should be trusted when
its SOP-to-data path is missing.

## 2. Required Operating Chain

Event -> Legal Check -> Regulation -> SOP -> Department -> Task -> Data ->
Finance Impact -> Risk -> Control -> Log -> Report View -> Dashboard -> Audit
-> Automation -> AI Agent -> BGH Decision.

## 3. Minimum Mapping Register

| SOP area | Legal/regulation source | Data source required | Workflow required | Dashboard allowed | AI allowed |
|---|---|---|---|---|---|
| TTGDTX contract/tuition setup | Contract, tuition policy, internal rule | CONTRACT_MASTER, TUITION_POLICY_MASTER, TTGDTX_MASTER | Legal/finance gate | Only approved report view | Advisory missing-basis check |
| Lead-to-student handover | Admission and internal handover rule | LEAD_MASTER_CONTROLLED, STUDENT_MASTER, HO_SO_METADATA | Handover checklist | Read-only conversion/handover view | Checklist draft only |
| Receivable creation | Contract/tuition policy, P0-19 gate | RECEIVABLE_MASTER, STUDENT_MASTER, CLASS_MASTER | Receivable gate | Finance report view only | Risk warning only |
| Collection and receipt | Receipt/invoice policy, bank evidence rule | PAYMENT_MASTER, RECEIPT_MASTER, BANK_RECON_LOG | Collection and evidence capture | Reconciled collection view | Missing evidence warning |
| Reconciliation lock | Finance period policy | DOI_SOAT_MASTER, FINANCE_RECON_LOG | Review/approve/lock | Locked-period view | Exception summary only |
| Partner payment request | Contract, BBNT, invoice dossier | TTGDTX_PAYMENT_REQUEST, COM_TRANSACTION | Check/approve request | Payment request view | Duplicate/missing dossier warning |
| HOU handover | HOU cooperation rule | HOU_HANDOVER_LOG, HOU_STUDENT_MASTER | HOU handover workflow | HOU report view | Follow-up reminder only |
| Short-course attendance/payment | Class/attendance/payment rule | ATTENDANCE, MEAL_EXPENSE, HR_PAYMENT | Attendance confirmation | Short-course report view | Missing attendance warning |
| BGH dashboard | Reporting/signoff rule | REPORT_VIEW_REGISTER, KPI_DICTIONARY | Data quality check | Approved dashboard source only | Draft report only |

## 4. Gate Rule

If a SOP area has no legal/regulation source, no owner, no data source, no audit
log or no signoff path, it must be classified as CHUA_DU_DIEU_KIEN for deep
workflow, dashboard and AI automation.

## 5. Boundary

This mapping does not approve any SOP as officially issued. Official SOPs still
require owner review, version control, audit log and signoff outside Codex/AI.

## 6. Related Control Matrix

`docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md` extends
this mapping with Legal Article Master, SOP Register, evidence-class,
workflow-gate, report-view, finance-reliance, AI-scope and owner-decision
boundaries. It is DRAFT_CONTROL only and cannot be used as official legal
approval, official SOP issuance, evidence acceptance, UAT acceptance, finance
approval, owner waiver or production GO.

## 7. Specialized SOP Mapping Drafts

| Specialized SOP | Mapping file | Scope | Boundary |
|---|---|---|---|
| Tam ung, hoan ung, de nghi thanh toan va thanh toan HEU | `docs/HEU_SOP_TAM_UNG_THANH_TOAN_SOFTWARE_MAPPING_20260701_V01_DRAFT.md` | ADVANCE_MASTER, ADVANCE_RECON_LOG, PAYMENT_REQUEST, PAYMENT_MASTER, FINANCE_APPROVAL_LOG, AUDIT_LOG, report views and finance gates | DRAFT_CONTROL only; does not issue SOP, approve finance action, execute payment, accept UAT/evidence or mark production GO |
