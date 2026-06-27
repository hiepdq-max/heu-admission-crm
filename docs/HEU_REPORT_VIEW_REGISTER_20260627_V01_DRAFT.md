# HEU Report View Register 2026-06-27 V01 Draft

Status: DRAFT_CONTROL
Owner: BGH + IT_DATA + KHTC + Audit
Production status: NO-GO

## 1. Purpose

Define which report views dashboards may read. HEU dashboards must not read raw
files, quick-calculation files, unrestricted tables or unapproved sensitive
data.

## 2. Report View Rule

Dashboard -> Report View -> Data Quality Check -> Source Map -> Owner Signoff.

Dashboard use is CHUA_DU_DIEU_KIEN when any of these are missing.

## 3. Minimum Report View Register

| Report view | Module | Owner | Allowed dashboard | Required checks | Current status |
|---|---|---|---|---|---|
| RV_TTGDTX_FINANCE_SUMMARY | TTGDTX/Finance | KHTC | Finance Desk, BGH | Receivable/payment/reconciliation source map | DRAFT |
| RV_TTGDTX_CONG_NO_THUC_THU | TTGDTX/Finance | KHTC | Finance Desk | HEU actual receipt and reconciliation status | DRAFT |
| RV_TTGDTX_COM_CHI_TRA | TTGDTX/Finance | KHTC + PHAP_CHE | Finance Desk | Contract, BBNT, request approval, no duplicate payout | DRAFT |
| RV_TTGDTX_UAT_READINESS | TTGDTX/9+ | IT_DATA + Audit | Master Control | UAT/signoff/blocker status | DRAFT |
| RV_HOU_LEDGER_SUMMARY | HOU | HOU owner + KHTC | HOU dashboard | HOU handover/tuition/commission separation | DRAFT |
| RV_SHORT_COURSE_ATTENDANCE_PAYMENT | Short Course | DAO_TAO + KHTC | Short Course dashboard | Class/student/attendance/payment linkage | DRAFT |
| RV_AUDIT_RISK_CONTROL | Audit | Audit | Audit dashboard | Risk owner, event log, signoff state | DRAFT |
| RV_AI_ALLOWED_CONTEXT | AI | IT_DATA + Audit | AI assistant | Scope level, no restricted raw data, read-only | DRAFT |

## 4. KPI Dictionary Requirement

Every KPI must define:

- `kpi_code`
- `business_definition`
- `source_report_view`
- `owner_department`
- `refresh_rule`
- `data_quality_rule`
- `signoff_required`
- `forbidden_interpretation`

## 5. Boundary

This register is a source-control artifact only. It does not approve production
dashboard use or replace signed dashboard UAT.

