# HEU Data Dictionary Minimum 2026-06-27 V01 Draft

Status: DRAFT_CONTROL
Owner: IT_DATA
Production status: NO-GO

## 1. Purpose

Define the minimum dictionary required for HEU P0 registers, finance gates,
dashboards and AI scope checks. This extends the existing data dictionary with
ERP/AI OS control fields.

## 2. Required Field Families

| Field family | Required fields | Rule |
|---|---|---|
| Identity | `id`, `business_code`, `display_name`, `record_status` | Business code must be stable and human-readable |
| Ownership | `owner_department`, `owner_role`, `workspace_scope_id` | Every controlled object needs an accountable owner |
| Source | `source_document_id`, `source_reference`, `evidence_url` | Metadata/reference only; raw evidence stays outside Git/Codex/chat |
| Version | `version_no`, `effective_from`, `effective_to`, `superseded_by` | Policy/contract/SOP changes require version trail |
| Approval | `submitted_by`, `checked_by`, `approved_by`, `approved_at` | Human approval only; AI is never approver |
| Audit | `created_by`, `created_at`, `updated_by`, `updated_at`, `audit_event_id` | Every high-risk workflow must be traceable |
| Soft delete | `is_active`, `deactivated_by`, `deactivated_at`, `delete_reason` | No hard delete unless explicitly approved/waived |
| Finance | `amount_vnd`, `receipt_status`, `reconciliation_status`, `payment_status` | Money is recognized only after HEU receives and reconciles it |
| Report | `report_view_id`, `kpi_code`, `data_quality_status`, `signoff_status` | Dashboards read approved report views only |
| AI | `ai_scope_level`, `ai_read_allowed`, `ai_write_allowed`, `ai_output_audit_required` | AI must remain read-only/advisory until signed UAT |

## 3. Status Vocabulary

| Vocabulary | Allowed values |
|---|---|
| Record status | `ACTIVE`, `INACTIVE`, `ARCHIVED` |
| Control status | `DRAFT`, `PASS_LOCAL`, `PENDING_UAT`, `SIGNED_OFF`, `BLOCKED`, `WAIVED_BY_AUTHORITY` |
| Gate result | `DAT`, `CAN_SUA`, `CHUA_DU_DIEU_KIEN`, `CAM_CODE` |
| Reconciliation status | `NOT_RECONCILED`, `IN_REVIEW`, `RECONCILED`, `LOCKED`, `REVERSED` |
| AI level | `LEVEL_0_READ_REFERENCE`, `LEVEL_1_ADVISORY`, `LEVEL_2_HUMAN_DRAFT`, `FORBIDDEN_PRODUCTION_ACTION` |

## 4. Sensitive Data Rule

Do not commit or paste raw CCCD, date of birth, phone, address, bank account,
bank statement, voucher, password, OTP, API key, service-role key or raw student
PII into Git, Codex, chat or uncontrolled documents.

## 5. Boundary

This minimum dictionary is a naming/control artifact. It does not approve real
data import, production dashboard use, AI production use or finance posting.

