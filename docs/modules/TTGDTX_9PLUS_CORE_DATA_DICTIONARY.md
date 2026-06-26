# TTGDTX 9+ Core Data Dictionary

Status: draft. Generic module dictionary; no center-specific hard-coding.

## 1. Entities

| Entity | Purpose | Notes |
|---|---|---|
| `ttgdtx_center` | Linked TTGDTX/training center | Use generic `center_code`; Phu Xuyen is one possible value |
| `ttgdtx_partner` | Operating/legal partner | May be same as center or separate legal entity |
| `ttgdtx_contract` | Contract/legal basis | Includes appendices by version/effective date |
| `ttgdtx_class` | Class/cohort/program grouping | Links center, program and cohort |
| `ttgdtx_student` | Student in TTGDTX context | Avoid raw PII in repo/chat |
| `ttgdtx_tuition_policy` | Fee policy version | Versioned and approved |
| `ttgdtx_receivable` | Amount expected from student/class/period | Must prevent duplicates |
| `ttgdtx_collection` | Money collected | Must resolve invoice/receipt decision |
| `ttgdtx_reconciliation_batch` | Batch comparing expected and collected | Locked after approval |
| `ttgdtx_acceptance_minutes` | BBNT/accepted evidence metadata | Separate from contract/legal docs |
| `ttgdtx_partner_payment_request` | Request to pay partner | Requires evidence gates |
| `ttgdtx_partner_payment_disbursement` | Partner payout execution record | Controlled path only |
| `ttgdtx_source_document` | Source/evidence metadata | No raw sensitive payload in repo/chat |
| `ttgdtx_source_control_check` | Control status for evidence/readiness | Used to block unsafe workflows |

## 2. Common Fields

| Field | Type idea | Meaning |
|---|---|---|
| `id` | uuid | Technical primary key |
| `*_code` | text | Business code |
| `status` | text | Workflow state |
| `record_status` | text | `ACTIVE`/`INACTIVE`/`ARCHIVED` |
| `created_at` | timestamptz | Created time |
| `created_by` | uuid/text | Human/system actor |
| `updated_at` | timestamptz | Updated time |
| `updated_by` | uuid/text | Human/system actor |
| `approved_at` | timestamptz | Human approval time |
| `approved_by` | uuid/text | Human approver |
| `source_document_id` | uuid | Metadata evidence link |
| `evidence_url` | text | Non-secret evidence reference |
| `version` | integer/text | Policy/evidence version |
| `note` | text | Non-sensitive note |

## 3. Status Values

| Area | Status values |
|---|---|
| Center/partner | `DRAFT`, `ACTIVE`, `INACTIVE`, `ARCHIVED` |
| Source import | `STAGED`, `VALIDATING`, `HAS_ISSUE`, `READY_FOR_REVIEW`, `APPROVED`, `REJECTED` |
| Receivable | `DRAFT`, `READY`, `PARTIAL`, `PAID`, `ON_HOLD`, `CANCELLED_BY_APPROVAL` |
| Collection | `DRAFT`, `NEEDS_INVOICE_DECISION`, `READY_FOR_RECONCILIATION`, `RECONCILED`, `REVERSED_BY_APPROVAL` |
| Reconciliation | `DRAFT`, `SUBMITTED`, `APPROVED_LOCKED`, `REJECTED`, `REOPEN_REQUESTED` |
| Payment request | `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`, `PAID`, `CANCELLED_BY_APPROVAL` |
| Control check | `NOT_CHECKED`, `FAIL`, `CAN_SUA`, `PASS`, `WAIVED_WITH_APPROVAL` |

## 4. Evidence Separation

| Evidence type | Must be separated from |
|---|---|
| Contract/HDLK | BBNT and payment proof |
| BBNT/acceptance minutes | Contract archive and bank data |
| Collection invoice/receipt | Partner invoice before payout |
| Account freeze/release | Collateral release/giai chap |
| Collateral/giai chap | Student receivable and tuition collection |

