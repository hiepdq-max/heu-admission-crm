# HEU Finance Advance Payment Data Dictionary 2026-07-01 V01 Draft

Status: DRAFT_CONTROL
Production status: NO-GO
Source mapping: `docs/HEU_SOP_TAM_UNG_THANH_TOAN_SOFTWARE_MAPPING_20260701_V01_DRAFT.md`
Owner: KHTC + PHAP_CHE + AUDIT + IT_DATA

## 1. Purpose

This dictionary defines the first controlled data shape for HEU advance,
advance settlement, payment request and payment execution metadata.

It is a PASS_LOCAL design artifact only. It does not create production schema,
import real data, execute bank transfer, approve finance action, accept
evidence, accept UAT, approve owner signoff or mark production GO.

## 2. Canonical Objects

| Object | Role | Current status |
|---|---|---|
| ADVANCE_MASTER | Main advance request and lifecycle record | DRAFT_CONTROL |
| ADVANCE_RECON_LOG | Advance settlement and closure log | DRAFT_CONTROL |
| PAYMENT_REQUEST | Request for non-advance payment or supplement payment | DRAFT_CONTROL |
| PAYMENT_MASTER | Payment execution metadata after approval | DRAFT_CONTROL |
| FINANCE_APPROVAL_LOG | Human check/approval decision trace | DRAFT_CONTROL |
| FINANCE_STATUS_HISTORY | Status transition history for every finance entity | DRAFT_CONTROL |
| FINANCE_RISK_HOLD | Audit/legal/finance blocker register | DRAFT_CONTROL |
| EVIDENCE_REFERENCE | Git-safe reference to controlled evidence location | DRAFT_CONTROL |

## 3. Field Dictionary

### 3.1 ADVANCE_MASTER

| Field | Type | Required | Sensitive | Rule |
|---|---|---|---|---|
| advance_id | text | yes | no | Format `TU-YYYYMM-0001` |
| requester_id | uuid/text | yes | internal | Links to approved staff/user profile |
| department_id | uuid/text | yes | no | Requester's department or unit |
| purpose | text | yes | no | Must match approved task/event/project |
| budget_code | text | yes | no | Required unless outside-budget approval exists |
| project_code | text | no | no | Required for event/project advance |
| requested_amount_vnd | numeric | yes | restricted | Must be positive |
| approved_amount_vnd | numeric | no | restricted | Cannot exceed approved threshold without BGH/HĐQT decision |
| paid_at | timestamptz | no | restricted | Set only after approval and payment metadata |
| settlement_due_date | date | yes | no | Based on SOP deadline table |
| status | enum | yes | no | Uses Advance Status Model |
| approver_id | uuid/text | no | internal | Required before `APPROVED` |
| evidence_ref | text | no | restricted | Git-safe evidence reference only |

### 3.2 ADVANCE_RECON_LOG

| Field | Type | Required | Sensitive | Rule |
|---|---|---|---|---|
| recon_id | text | yes | no | Format `RECON-YYYYMM-0001` |
| advance_id | text | yes | no | Must exist in ADVANCE_MASTER |
| submitted_at | timestamptz | yes | no | Time settlement submitted |
| valid_amount_vnd | numeric | yes | restricted | Sum of accepted evidence |
| invalid_amount_vnd | numeric | no | restricted | Amount rejected by KHTC/Audit |
| excess_return_amount_vnd | numeric | no | restricted | Required when valid amount is lower than advance |
| supplement_request_amount_vnd | numeric | no | restricted | Requires PAYMENT_REQUEST if positive |
| reviewer_id | uuid/text | yes | internal | KHTC or Audit reviewer |
| decision_value | enum | yes | no | `ADVANCE_RECON_READY / NO_GO / BLOCKED` |
| evidence_ref | text | yes | restricted | No raw voucher or bank data |

### 3.3 PAYMENT_REQUEST

| Field | Type | Required | Sensitive | Rule |
|---|---|---|---|---|
| payment_request_id | text | yes | no | Format `DNTT-YYYYMM-0001` |
| requester_id | uuid/text | yes | internal | Request owner |
| department_id | uuid/text | yes | no | Requesting department |
| payment_group | enum | yes | no | Supplier, teacher, CTV, TTGDTX, partner, admin, other |
| amount_vnd | numeric | yes | restricted | Must be positive and budget-checked |
| budget_code | text | yes | no | Required unless approved outside-budget |
| project_code | text | no | no | Required for project/event payment |
| payee_ref | text | yes | restricted | Reference only; avoid raw bank account in Git/Codex/chat |
| due_date | date | no | no | Contract/SOP due date |
| evidence_ref | text | yes | restricted | Controlled evidence reference |
| status | enum | yes | no | Uses Payment Request Status Model |

### 3.4 PAYMENT_MASTER

| Field | Type | Required | Sensitive | Rule |
|---|---|---|---|---|
| payment_id | text | yes | no | Format `PAY-YYYYMM-0001` |
| payment_request_id | text | yes | no | Must be approved before payment metadata |
| paid_at | timestamptz | yes | restricted | Metadata only; app must not initiate bank transfer |
| paid_amount_vnd | numeric | yes | restricted | Cannot exceed approved amount |
| payment_method | enum | yes | restricted | Bank transfer, cash, other |
| payee_ref | text | yes | restricted | Controlled reference only |
| voucher_ref | text | yes | restricted | No raw voucher in Git/Codex/chat |
| executor_id | uuid/text | yes | internal | KHTC executor |
| payment_status | enum | yes | no | `PAYMENT_RECORDED / REVERSED / BLOCKED` |
| evidence_ref | text | yes | restricted | Controlled evidence reference |

## 4. Status And Gate Values

| Gate | Decision values | Stop condition |
|---|---|---|
| ADVANCE_GATE | ADVANCE_READY / NO_GO / BLOCKED | Missing task, budget, owner approval or overdue prior advance |
| ADVANCE_RECON_GATE | ADVANCE_RECON_READY / NO_GO / BLOCKED | Missing evidence, invalid purpose, unresolved excess/supplement |
| PAYMENT_REQUEST_GATE | PAYMENT_REQUEST_READY / NO_GO / BLOCKED | Missing completion proof, evidence, budget, payee or approval route |
| PAYMENT_GATE | PAYMENT_READY / NO_GO / BLOCKED | Duplicate risk, missing approval, missing voucher ref or active hold |
| EVIDENCE_GATE | P0_10_ACCEPT / NO_GO / BLOCKED | Raw voucher, bank, payroll, PII or secret enters Git/Codex/chat |

## 5. Report Views To Design

| Report view | Reads | Must not |
|---|---|---|
| RV_ADVANCE_AGING | ADVANCE_MASTER + ADVANCE_RECON_LOG | Expose raw personal payment evidence |
| RV_PAYMENT_REQUEST_PIPELINE | PAYMENT_REQUEST + FINANCE_APPROVAL_LOG | Replace approval workflow |
| RV_PAYMENT_EXECUTION_SUMMARY | PAYMENT_MASTER + EVIDENCE_REFERENCE | Initiate bank transfer or statutory accounting |
| RV_FINANCE_RISK_HOLD | FINANCE_RISK_HOLD + AUDIT_LOG | Hide unresolved legal/audit blockers |

## 6. Security And Evidence Boundary

- Store only Git-safe evidence references in tracked docs and UI mock data.
- Raw vouchers, bank statements, payroll files, payee bank accounts, student
  PII, teacher personal data, CCCD, passwords, OTPs, reset links and invite
  links stay outside Git/Codex/chat.
- AI may summarize missing fields and warn about blockers only. AI must not
  approve, pay, close a request, waive evidence or mark GO.

## 7. Next Build Slice

After this dictionary is reviewed, the next safe slice is a read-only
Advance/Payment workflow shell with mock rows, gate cards and status timeline.
The shell must keep all create, approve, pay, reverse, import and production GO
actions disabled until signed SOP, UAT and owner signoff exist.
