# TTGDTX Phu Xuyen Real Data Fit Note 2026-06-25

## 1. Purpose

This note turns the Phu Xuyen source folder into product and control
requirements for the TTGDTX 9+ pilot. It is a design-control artifact only.
It does not approve production import, production migration, payment, payout or
go-live.

Source folder:
https://drive.google.com/drive/folders/1FY4Bd0psV-t6Ab_mks7qxztz6xGk_FLU

Related control note:
docs/TTGDTX_ACCOUNT_FREEZE_RELEASE_ACCEPTANCE_NOTE_20260625.md

Data boundary:

- Real student names, dates of birth, bank account numbers, CIF/account data and
  transaction account numbers must not be copied into repo files or chat.
- Source files may be used for read-only design analysis.
- Any UAT import must use anonymized or synthetic data unless an authorized data
  owner approves a controlled UAT dataset.
- Google Drive remains the evidence store. The web app should store evidence
  metadata and links, not duplicate uncontrolled document copies.

## 2. Source Inventory Observed

| Source type | Observed shape | Product implication |
|---|---|---|
| Partner folders | Separate K23 and K24 contract folders for Phu Xuyen | Partner, cohort and contract-year must be first-class keys |
| Full contract doc | K24 linked-training contract, effective period, scope, expected students, partner responsibilities, finance clause | Contract master needs structured legal/finance terms, not just a file link |
| Appendix doc | K23 appendix amending partner information including payment/bank details | Contract master must support appendices and field versioning |
| Scanned/poor-text PDFs | Contract PDFs may return no usable text through normal extraction | Evidence registry must allow file-only evidence plus OCR/manual verification status |
| Tuition workbook | One workbook mixes tuition policy, student collections, class totals and collection-request data | Import must stage sections separately and require human mapping |
| Bank receipt PDFs | One PDF can contain many bank credit-advice records | Payment import must parse batches and deduplicate by transaction identity |
| Collection invoice/receipt | Thu tien can a policy decision on invoice/chung-tu issuance by collection model and payer type | Collection is not complete until invoice_required and invoice_status are resolved |
| BBNT sample | Phu Xuyen K24 HK1 acceptance evidence includes contract reference, center, term, class counts, formula amount and invoice condition | Payment request and payout must be gated by accepted-period evidence |
| Account-control emails | Tuition account freeze notices and communication content exist outside the original source pack | Account freeze/release must be a controlled workflow, not an untracked note |
| Bank collateral contracts | Credit/collateral attachments define giai chap release conditions and contain high-sensitivity data | Collateral release must be a separate restricted legal-finance workflow |

## 3. Business Facts Converted To Design Rules

1. Tuition policy is not a single flat table. The workbook contains policy rows
   by class/cohort, major, school year, term, monthly fee, months and charging
   form. The app must version policy by partner, cohort, class, major, school
   year and term.
2. Student collection data contains operational exceptions. Rows include class
   codes, term/year amount columns, zero amounts, total rows, notes/status and
   cases that look like dropout or decision-based handling. Import must classify
   row type before posting ledger entries.
3. Collection-request data includes sensitive payer and bank information. The
   app must mask bank/account fields by default and restrict full visibility to
   explicitly authorized finance roles.
4. Bank evidence is transaction-batch evidence. Bank PDFs show repeated
   transaction records with transaction number, date, amount, payer/beneficiary,
   channel and remarks. The app must store one import batch, many transaction
   lines and a unique transaction fingerprint.
5. Thu tien needs an invoice/receipt decision. The app must record whether the
   collection requires invoice/chung-tu evidence, who issues it, issue date,
   invoice/reference number, evidence link, and authorized waiver if not
   required.
6. Remarks contain accounting meaning. Payment remarks can include semester and
   school-year text. The parser should extract candidate period/term from
   remarks but keep it as "suggested" until reconciliation is approved.
7. Legal amendments affect finance controls. A contract appendix can change
   partner address or bank/payment information. Payout must use the payment
   profile version effective on the payout date and must show if a later
   appendix changes the payment destination.
8. Partner support fee is formula-driven. The K24 contract evidence indicates a
   per-student, per-month partner support fee and semester payment cycle.
   Payment request amount should derive from accepted eligible/collected student
   count, months, rate and approved period, not from manual free text.
9. Payment request requires an evidence chain. Contract language points to
   payment request, acceptance/minutes with signed finalized student list and
   partner invoice. The app must block payout if acceptance evidence, partner
   invoice or approval evidence is missing.
10. Tuition-account freeze is a finance-control event. Notices identify bank,
   class/cohort/term scope, timing and communication duties. The app must track
   freeze and release states with bank confirmation and communication evidence.
11. Collateral giai chap is not the same workflow as tuition-account release.
    It needs obligation-clearance, bank confirmation, legal release and document
    handover evidence under stricter access control.

## 4. Required Web App Capabilities

### 4.1 Evidence Registry

The app needs a source/evidence registry for each uploaded or linked file:

| Field | Requirement |
|---|---|
| evidence_id | Internal immutable ID |
| drive_file_id | Google Drive file ID or source URL |
| source_folder_id | Parent folder/source pack |
| evidence_type | CONTRACT, APPENDIX, TUITION_WORKBOOK, BANK_RECEIPT_PDF, RECEIPT_VOUCHER, COLLECTION_INVOICE, ACCEPTANCE_MINUTES, ACCEPTANCE_FOLDER, ACCOUNT_FREEZE_NOTICE, ACCOUNT_RELEASE_NOTICE, CREDIT_CONTRACT, COLLATERAL_CONTRACT, PARTNER_INVOICE, OTHER |
| partner_id | Example: Phu Xuyen center |
| cohort | K23, K24, etc. |
| effective_from / effective_to | Required for contract terms and appendices |
| pii_level | NONE, PERSONAL, BANK, HIGH |
| extraction_status | FILE_ONLY, EXTRACTED, OCR_REQUIRED, MANUAL_REVIEWED |
| evidence_hash | Optional file hash when downloaded/imported |
| created_by / reviewed_by | Audit ownership |

### 4.2 Contract Master

Contract master must model:

- Parent contract and appendices.
- Partner legal identity and operational site.
- Cohort, class group and expected student count.
- Contract start/end, training duration and payment cycle.
- Support-fee formula: rate, unit, months, eligible basis and exceptions.
- Payment profile version: bank/payment destination, effective date and approval.
- Legal consistency flags, for example mismatched place/date/party text or
  appendix that changes payment information.

### 4.3 Tuition Policy And Student Ledger

The tuition module must support:

- Policy version by cohort, class, major, school year and term.
- Multi-year tuition rates.
- "Theo ky hoc" charge form and term-based receivable generation.
- Student enrollment status and class movement.
- Dropout/decision/exception notes without deleting historical ledger rows.
- Zero amount rows as valid import observations, not automatic deletion.
- Total rows separated from student rows.

### 4.4 Import Staging

Excel import should never post directly to finance ledgers. It needs a staging
step with:

1. File registration.
2. Section detection: policy table, student collection table, collection-request
   table and total rows.
3. Header normalization for merged or multi-row headers.
4. Sensitive-field masking.
5. Validation issues routed to owner: KHTC, Phap Che, IT_DATA or partner owner.
6. Preview with row counts, total amount checks and duplicate warnings.
7. Human approval before posting to receivable/payment/reconciliation tables.

### 4.5 Bank Receipt Import

Bank PDF import needs:

- One import batch per PDF.
- Many transaction lines per PDF.
- Transaction fingerprint based on bank transaction number, date, amount and
  beneficiary context.
- Duplicate detection before receipt creation.
- Suggested term/cohort extracted from remarks.
- Manual matching screen to student/class/period when remarks are ambiguous.
- Evidence link retained for each transaction line.

### 4.6 Collection Invoice And Receipt Control

Thu tien needs a configurable invoice/chung-tu rule, not a hard-coded yes/no.

Required fields:

| Field | Requirement |
|---|---|
| collection_model | HEU_COLLECTS, TTGDTX_COLLECTS, SPLIT_COLLECTION or other controlled value |
| payer_type | Student, parent, center, sponsor or other |
| invoice_required | REQUIRED, NOT_REQUIRED, PENDING_POLICY, WAIVED_BY_AUTHORITY |
| invoice_issuer | HEU, center/partner or other approved issuer |
| invoice_status | NOT_STARTED, ISSUED, CANCELLED, REPLACED, WAIVED |
| invoice_no / issue_date | Required when invoice_status is ISSUED |
| evidence_url | Invoice/chung-tu evidence link |
| waiver_by / waiver_reason | Required when invoice_required is waived |

### 4.7 Reconciliation, Acceptance And Payout

The payout chain must enforce this order:

```text
Contract active
-> tuition policy ready
-> student receivable created
-> bank/payment receipt imported
-> collection invoice/receipt status resolved
-> receipt reconciled into approved period
-> acceptance/minutes and finalized student list attached
-> partner invoice attached when required
-> payment request generated from formula
-> checker/approver approval
-> payout executed once
-> dashboard reflects locked facts
```

No payout should be executable from a manually typed amount alone.

## 5. Security And Access Rules

| Data area | Default access |
|---|---|
| Contract file metadata | Phap Che, KHTC, BGH, IT_DATA |
| Contract payment profile | Phap Che + authorized KHTC; masked for others |
| Student identity | Role/workspace scoped; no broad export |
| Student bank/account fields | Hidden by default; authorized finance only |
| Bank transaction evidence | KHTC, Audit, BGH read; full account details masked |
| Dashboard totals | BGH/KHTC by workspace; no row-level PII unless drilled with permission |
| Import staging errors | Owner-specific issue routing |

Security defaults:

- Mask account numbers and personal identifiers in UI lists.
- Do not store full real-data extracts in docs, logs or client-side state.
- Do not allow out-of-scope users to fetch hidden data through server queries.
- Keep all post/approve/pay actions in audited server-side paths.
- Keep AI advisory only; AI may flag mismatch, not approve or pay.

## 6. Gaps Found Against Current Pilot

| Gap | Risk | Required action |
|---|---|---|
| Real workbook has multiple table sections | Wrong rows posted as finance facts | Build import staging section classifier before real import |
| Bank PDFs contain many transaction records | Duplicate or missing receipt | Add batch transaction parser and unique fingerprint audit |
| Thu tien invoice/chung-tu status not tracked | Revenue/tax/accounting evidence gap | Add collection invoice/receipt policy matrix and status gate |
| Contract appendix changes payment profile | Payout to stale destination | Add payment-profile versioning and appendix effective-date check |
| Acceptance/minutes and partner invoice required before payout | Payment without legal/accounting basis | Gate P2-15/P2-17 by accepted period and partner invoice evidence |
| Tuition-account freeze/release handled outside app | Uncontrolled bank action, weak audit trail | Add account-control workflow with communication and bank-confirmation evidence |
| Collateral giai chap mixed with tuition-account release | Legal/privacy breach and wrong approval path | Keep collateral release in a separate restricted legal-finance register |
| Scanned PDFs may not extract text | Missing contract evidence checks | Add OCR_REQUIRED/MANUAL_REVIEWED evidence status |
| Sensitive data appears in source workbook | Privacy and account leakage | Add redaction/masking requirement before UAT import |

## 7. Immediate Build Direction

Priority order for the next implementation slice:

1. Add evidence registry/type/status model to TTGDTX source control.
2. Add contract appendix/payment-profile version fields or migration plan.
3. Extend tuition import staging to support multi-section Excel review.
4. Add bank receipt batch parser design and duplicate fingerprint control.
5. Add collection invoice/receipt policy and status controls.
6. Add acceptance/minutes and partner invoice evidence gate before payment
   request and payout.
7. Add account freeze/release and collateral release controls as metadata-only
   P2-19 checks before real operation.
8. Extend UAT matrix with anonymized Phu Xuyen-like cases:
   - K23 contract appendix.
   - K24 contract with support-fee formula.
   - Multi-section tuition workbook.
   - One PDF with many bank receipt lines.
   - One collection with invoice required, one not required and one pending.
   - One account freeze notice and one release request.
   - One BBNT and partner invoice gate before payment request.
   - Student dropout/zero-amount/total-row cases.

Synthetic pack now exists for this requirement:
`fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json`.
Run `npm.cmd run audit:ttgdtx-synthetic-uat-pack` before using or editing it.

## 8. Definition Of Done For Real-Data Readiness

Real-data readiness is DONE only when:

1. No raw PII or bank account numbers are committed, printed in logs or exposed
   to unauthorized users.
2. Import staging can show section-level totals before posting.
3. Duplicate receipt/payout controls are tested with batch-like evidence.
4. Payment request amount is formula-derived and traceable to accepted
   student-period evidence.
5. Contract appendix/payment profile effective dates are enforced.
6. Browser UAT passes for ADMIN, BGH, KHTC, PHAP_CHE, TUYEN_SINH and
   out-of-scope user.
7. Backup/rollback dry-run and final human Go/No-Go approval are complete.

Current conclusion: use the Phu Xuyen folder as a reality-fit source pack, but
keep production status NO-GO until the controls above are implemented and UAT is
signed.
