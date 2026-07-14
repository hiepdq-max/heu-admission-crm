# HEU DATA 001 - Metadata Foundation Import Dry Run

Task ID: HEU-DATA-001-METADATA-FOUNDATION-IMPORT-DRY-RUN
Date: 2026-07-14
Status: DRAFT_CONTROL_METADATA_ONLY
Production status: NO-GO

## Purpose and boundary

This pack defines how cleaned metadata will be staged before any real import.
It does not read Drive, upload a workbook, run SQL, run migration, create
tasks in the database, activate users or lock production data.

## Allowed metadata fields

Only normalized identifiers and control metadata may enter the dry-run:

- `source_label`
- `source_route`
- `data_domain`
- `record_label`
- `department_code`
- `owner_role`
- `confirmation_role`
- `dq_check_ref`
- `controlled_evidence_ref`
- `due_date_or_batch`
- `status`

Raw names, email, phone, CCCD, address, student details, bank details,
passwords, tokens and payment payloads are excluded.

## Confirmation queue

| Task label | Department | Confirmation role | Initial status |
|---|---|---|---|
| DCTC-KHTC-001 | KHTC | FINANCE_READONLY | CHO_XAC_NHAN |
| DCTC-TCHC-001 | TCHC | HR_READONLY | CHO_XAC_NHAN |
| DCTC-TS-001 | TUYEN_SINH | ADMISSION_OPERATOR | CHO_XAC_NHAN |
| DCTC-CTHSSV-001 | CTHSSV | CTHSSV_OPERATOR | CHO_XAC_NHAN |
| DCTC-DT-001 | DAO_TAO | TRAINING_READONLY | CHO_XAC_NHAN |
| DCTC-BGH-001 | BGH | EXECUTIVE_READONLY | CHO_XAC_NHAN |
| DCTC-ITDATA-001 | IT_DATA | IT_DATA_AUDIT | CHO_XAC_NHAN |

Each queue item requires owner/assignee department match, source provenance,
scope gate reference and controlled evidence before `CHO_XAC_NHAN` can become
`DUNG`. A department confirms only its own scoped metadata.

## Dry-run sequence

1. Register source metadata without copying raw payload.
2. Run duplicate, required-field and department-code checks.
3. Create a redacted confirmation manifest outside production.
4. Route one confirmation task to each department.
5. Record PASS/FAIL/NO_GO and evidence ID without PII.
6. Lock only after owner and Audit review; otherwise keep `CHO_XAC_NHAN`.

## Rollback and gates

Dry-run rollback is discard of the staging manifest, never deletion of source
data. Any schema mismatch, PII detection, scope mismatch or missing owner keeps
the import `NO_GO`. Real import requires a separate backup, migration order,
rollback and owner decision.

Next task: `HEU-DATA-002-METADATA-FOUNDATION-DRY-RUN-CHECKER`.
