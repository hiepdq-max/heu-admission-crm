# HEU Data Model V1

Purpose: define a generic operating data model for HEU. This document is a design control artifact, not a production migration.

## 1. System Principles

- Legal basis before transaction posting.
- Master data before workflow and automation.
- Workflow before dashboard.
- Audit log before conclusion.
- Soft delete only for business data.
- Real source evidence is referenced by metadata; raw sensitive data is not stored in repo/chat.
- AI may draft and check, but cannot approve.

## 2. Core Master Domains

| Domain | Canonical master | Purpose |
|---|---|---|
| Student | `STUDENT_MASTER` | One controlled student/person learning identity |
| Class | `CLASS_MASTER` | Class/cohort/center/program grouping |
| Program/Major | `PROGRAM_MAJOR_MASTER` | Academic offering and major catalog |
| Cohort | `COHORT_MASTER` | Intake year/batch/term grouping |
| Center | `CENTER_TTGDTX_MASTER` | Linked TTGDTX or training center |
| Partner | `PARTNER_MASTER` | Partner, vendor, collaborator, linked unit |
| Contract | `CONTRACT_MASTER` | Legal contract, appendix and effective terms |
| Tuition policy | `TUITION_POLICY_MASTER` | Fee policy by program/cohort/class/center |
| Fee item | `FEE_ITEM_MASTER` | Standard fee/charge/discount item |
| Receivable | `RECEIVABLE_MASTER` | Amount expected from student/class/term |
| Payment | `PAYMENT_MASTER` | Amount collected/paid with source evidence |
| Staff/User | `STAFF_USER_MASTER` | Staff, department, account linkage |
| Permission | `ROLE_PERMISSION_MASTER` | Role, permission and business scope |
| Audit | `AUDIT_LOG` | Business and technical event trail |

## 3. TTGDTX/9+ Generic Model

Phu Xuyen is a reference evidence case. The product model must use generic keys:

- `center_id`
- `partner_id`
- `contract_id`
- `contract_appendix_id`
- `program_id`
- `cohort_id`
- `class_id`
- `student_id`
- `tuition_policy_id`
- `receivable_id`
- `collection_id`
- `reconciliation_batch_id`
- `acceptance_minutes_id`
- `partner_payment_request_id`
- `partner_payment_disbursement_id`
- `source_document_id`
- `control_check_id`

## 4. Required Lifecycle Fields

Every operational table should define:

- `id`
- `business_code`
- `status`
- `created_at`
- `created_by`
- `updated_at`
- `updated_by`
- `approved_at`
- `approved_by`
- `source_file_id` or `source_document_id`
- `version`
- `note`
- `is_active`
- `record_status`

## 5. Status Families

| Family | Suggested statuses |
|---|---|
| Master data | `DRAFT`, `ACTIVE`, `INACTIVE`, `ARCHIVED` |
| Import | `STAGED`, `VALIDATING`, `HAS_ISSUE`, `READY_FOR_REVIEW`, `APPROVED`, `REJECTED` |
| Receivable | `DRAFT`, `READY`, `PARTIAL`, `PAID`, `ON_HOLD`, `CANCELLED_BY_APPROVAL` |
| Collection | `DRAFT`, `NEEDS_INVOICE_DECISION`, `READY_FOR_RECONCILIATION`, `RECONCILED`, `REVERSED_BY_APPROVAL` |
| Reconciliation | `DRAFT`, `SUBMITTED`, `APPROVED_LOCKED`, `REJECTED`, `REOPEN_REQUESTED` |
| Payment request | `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`, `PAID`, `CANCELLED_BY_APPROVAL` |
| Evidence/control | `NOT_CHECKED`, `FAIL`, `CAN_SUA`, `PASS`, `WAIVED_WITH_APPROVAL` |

## 6. Production Migration Rule

This model must be implemented through reviewed migration files only. No production migration is allowed until backup, restore dry-run, UAT and human approval are recorded.

