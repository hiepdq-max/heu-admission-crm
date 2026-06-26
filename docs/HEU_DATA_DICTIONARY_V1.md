# HEU Data Dictionary V1

Purpose: create shared naming so HEU modules do not drift.

## 1. Naming Standard

| Concept | Preferred name | Notes |
|---|---|---|
| Business code | `business_code` | Human-readable stable code |
| Record status | `record_status` | `ACTIVE`, `INACTIVE`, `ARCHIVED` |
| Process status | `status` | Workflow state |
| Source document | `source_document_id` | Metadata pointer only |
| Evidence URL | `evidence_url` | Non-secret link/reference |
| Approval user | `approved_by` | Human approver only |
| Approval time | `approved_at` | Human approval timestamp |
| Created user | `created_by` | User/profile id |
| Updated user | `updated_by` | User/profile id |
| Soft delete reason | `delete_reason` | Required when deactivating/deleting logically |

## 2. Master Names

| Master | Definition | Examples of fields |
|---|---|---|
| `CENTER_TTGDTX_MASTER` | Linked TTGDTX/training center | `center_code`, `center_name`, `province`, `status` |
| `PARTNER_MASTER` | Legal/operating partner | `partner_code`, `partner_name`, `tax_code_masked`, `status` |
| `CONTRACT_MASTER` | Contract and effective legal basis | `contract_code`, `partner_id`, `effective_from`, `effective_to`, `status` |
| `CLASS_MASTER` | Class under center/program/cohort | `class_code`, `center_id`, `program_id`, `cohort_id`, `status` |
| `STUDENT_MASTER` | Controlled learner identity | `student_code`, `full_name_masked`, `class_id`, `status` |
| `TUITION_POLICY_MASTER` | Fee policy version | `policy_code`, `program_id`, `cohort_id`, `version`, `status` |
| `RECEIVABLE_MASTER` | Amount expected to collect | `receivable_code`, `student_id`, `fee_item_id`, `amount`, `status` |
| `PAYMENT_MASTER` | Collection/payment event | `payment_code`, `amount`, `payment_date`, `source_document_id`, `status` |

## 3. Sensitive Data Rule

Do not commit or print:

- raw CCCD/passport/date of birth
- bank account number or raw bank statement
- student phone/address where not masked
- contract confidential terms not needed for design
- API keys, service-role keys, passwords, OTPs

Use masked/sample/anonymized values for UAT.

