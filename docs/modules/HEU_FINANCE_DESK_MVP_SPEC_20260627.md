# HEU Finance Desk MVP Spec 2026-06-27

Status: DRAFT_CONTROL
Module: `M08_FINANCE_ACCOUNTING`
Route: `/finance-desk`
Production status: NO-GO until backup, restore dry-run, signed UAT, migration
approval and owner Go/No-Go exist outside Codex/chat.

## 1. Purpose

HEU Finance Desk is the compact internal workbench for KHTC to operate tuition
debt, tuition collection, source-document links, reconciliation and center
payment tracking for the TTGDTX 9+ pilot.

It is not statutory accounting software and does not replace MISA, bank
transfer approval, tax invoicing, accounting vouchers or human payment
approval.

## 2. Source Inputs

Initial source workbooks:

- `BANG CHI TIET THANH TOAN CAC TRUNG TAM.xlsx`
- `BANG THEO DOI CONG NO THU HOC PHI.xlsx`
- `BANG THEO DOI KINH PHI TRUNG TAM PHAN NGOAI.xlsx`
- `heu_accounting_link_inventory.xlsx` as the controlled link inventory output

Raw evidence links and personal data must stay outside Git/Codex/chat. Import
only metadata, summary totals, access status and controlled references.

## 3. Operating Flow

1. Register source file or Google Sheet in File Registry / Source Control.
2. Import source workbook into staging only.
3. Validate totals, formulas, duplicate rows, missing class/center/student
   identifiers, missing evidence links and negative balances.
4. Fix source issues before locking any batch.
5. Create or reconcile receivable/payment facts through the existing P2 source
   steps only.
6. Lock reconciliation before payment request.
7. Create, check, approve and record payment through P2-15/P2-16/P2-17.
8. Use Finance Desk and P2-18 dashboard for read-only operating review.

## 4. Code Policy

Finance Desk uses `step111_heu_finance_desk.sql` to register these code kinds:

| Kind | Prefix | Pattern | Use |
|---|---|---|---|
| `IMPORT_BATCH` | `HFD-BATCH` | `HFD-BATCH-[YYYYMMDD]-[NNN]` | Import batch from Excel/Sheet |
| `DOCUMENT_LINK` | `HFD-LINK` | `HFD-LINK-[YYYYMMDD]-[NNN]` | Link row for contract/evidence |
| `SOURCE_CHECK` | `HFD-CHK` | `HFD-CHK-[YYYYMMDD]-[NNN]` | Source/evidence checklist |
| `REPORT_EXPORT` | `HFD-RPT` | `HFD-RPT-[YYYYMMDD]-[NNN]` | Exported report |
| `PERIOD_LOCK` | `HFD-LOCK` | `HFD-LOCK-[YYYYMMDD]-[NNN]` | Period lock record |
| `PAYMENT_REVIEW` | `HFD-PAYREV` | `HFD-PAYREV-[YYYYMMDD]-[NNN]` | Payment review session |

Database helper:

```sql
select public.build_heu_finance_desk_code('IMPORT_BATCH', '2026-06-27', 1);
-- HFD-BATCH-20260627-001
```

File names should follow the HEU rule:

`HEU_[NHOM_NGHIEP_VU]_[TEN_FILE_NGAN]_[YYYYMMDD]_V[SO_PHIEN_BAN]_[TRANG_THAI]`

Finance Desk examples:

- `HEU_KT_FINANCE_DESK_IMPORT_BATCH_20260627_V01_DANG_LAM`
- `HEU_KT_FINANCE_DESK_LINK_INVENTORY_20260627_V01_DANG_LAM`
- `HEU_KT_FINANCE_DESK_REPORT_20260627_V01_DANG_LAM`

## 5. Data Objects

New Step111 objects:

| Object | Purpose |
|---|---|
| `heu_finance_desk_code_policy` | Code kind, prefix and file naming rule |
| `build_heu_finance_desk_code(...)` | Controlled code generator |
| `heu_finance_desk_document_links` | Metadata registry for links extracted from workbooks |
| `heu_finance_desk_document_link_status` | Link readiness and issue flags |
| `heu_finance_desk_summary` | Read-only rollup for Finance Desk |
| `heu_finance_desk_code_policy_status` | Read-only code-policy view |

Existing TTGDTX source objects reused by the route:

- `ttgdtx_tuition_import_batch_readiness`
- `ttgdtx_p2_11_summary`
- `ttgdtx_accounting_dashboard_summary`
- `ttgdtx_accounting_dashboard_control_board`

## 6. Permissions

Step111 introduces:

- `finance_desk.read`
- `finance_desk.manage`
- `finance_desk.export`

Default role posture:

- `ADMIN`, `IT_DATA`, `ACCOUNTING_LEAD`, `KHTC`: read/manage/export.
- `BGH`, `AUDIT`: read/export.
- `ACCOUNTING`, `LEGAL`, `CTHSSV_LEAD`, `ADMISSION_HEAD`: read.

RLS requires role permission plus business scope, except ADMIN/BGH guard cases
already used in the TTGDTX pilot.

## 7. MVP Acceptance

MVP is acceptable for internal controlled test when:

- `/finance-desk` loads for authorized users and blocks unauthorized users.
- The sidebar shows Finance Desk only when the user has the right permission or
  admin role.
- Import batch, source-document and dashboard totals are visible without
  creating or approving money movement.
- Link registry stores metadata and access/OCR status without putting raw
  evidence in Git.
- All finance mutations still happen in the source P2 screens.
- Lint and build pass locally.

## 8. Boundaries

- Finance Desk does not approve production.
- Finance Desk does not approve payment.
- Finance Desk does not initiate bank transfers.
- Finance Desk does not replace accounting vouchers, invoices or tax records.
- AI may summarize, validate and warn only.
