# HEU SOP Tam Ung Thanh Toan Software Mapping 2026-07-01 V01 Draft

Status: DRAFT_CONTROL
Production status: NO-GO
Source SOP: HEU_SOP_TAM_UNG_THANH_TOAN_20260701_V01_DRAFT
Owner: KHTC + TCHC + PHAP_CHE + AUDIT + IT_DATA
Software scope: Finance Desk / Advance Management / Payment Request Control

## 1. Purpose

This mapping converts the draft SOP for advance request, advance settlement,
payment request and payment execution into software requirements for HEU.

It is a product-design and control document only. It does not issue the SOP,
approve finance action, accept evidence, execute payment, approve UAT, approve
owner signoff or mark production GO.

## 2. Target Modules

| Module | Purpose | Production boundary |
|---|---|---|
| ADVANCE_MANAGEMENT | Request, approve, pay and settle advances | No real advance payment until signed SOP, UAT, role-scope and evidence controls exist |
| ADVANCE_RECONCILIATION | Settle advance, return excess, request supplement payment | No closure without valid evidence and KHTC/Audit review |
| PAYMENT_REQUEST_CONTROL | Create, check and approve payment requests | No approval if evidence, budget, owner or legal gate is missing |
| PAYMENT_EXECUTION_LOG | Record payment execution metadata | Does not initiate bank transfer or replace accounting software |
| FINANCE_EVIDENCE_CONTROL | Store safe evidence references and reviewer status | Raw vouchers, bank data and payment files stay outside Git/Codex/chat |
| FINANCE_REPORT_VIEW | Read-only reporting for BGH/KHTC/Audit | Dashboard must read approved report views only |

## 3. SOP Article To Software Map

| SOP area | Software object | Workflow | Required gate |
|---|---|---|---|
| Muc tieu va nguyen tac | FINANCE_POLICY_CONTROL | Policy acknowledgement | SOP_SIGNOFF_REQUIRED |
| Dieu 6-10 Tam ung | ADVANCE_REQUEST, ADVANCE_MASTER | Draft -> submitted -> checked -> approved -> paid advance | ADVANCE_GATE |
| Dieu 11-14 Hoan ung | ADVANCE_RECON_LOG | Submitted -> checked -> accepted -> closed / supplement / return cash | ADVANCE_RECON_GATE |
| Dieu 15-21 De nghi thanh toan | PAYMENT_REQUEST, FINANCE_APPROVAL_LOG | Draft -> department confirmed -> finance checked -> legal/audit checked -> approved | PAYMENT_REQUEST_GATE |
| Dieu 20 Payment Gate | PAYMENT_MASTER | Approved request -> payment metadata recorded -> paid / blocked / reversed | PAYMENT_GATE |
| Dieu 22-25 Trang thai ho so | FINANCE_STATUS_HISTORY | Status transition history | STATUS_TRANSITION_GATE |
| Dieu 26-29 Du lieu va luu tru | EVIDENCE_REFERENCE, AUDIT_LOG | Evidence intake -> classify -> review -> reference | P0_10_EVIDENCE_GATE |
| Phu luc bieu mau | FORM_REGISTRY, FILE_REGISTRY | Form issue -> version -> use -> archive | FILE_REGISTRY_SIGNOFF_GATE |

## 4. Minimum Data Objects

| Object | Minimum fields | Notes |
|---|---|---|
| ADVANCE_MASTER | advance_id, requester_id, department_id, purpose, budget_code, project_code, requested_amount, approved_amount, paid_at, settlement_due_date, status, approver_id, evidence_ref | Main advance record |
| ADVANCE_RECON_LOG | recon_id, advance_id, submitted_at, valid_amount, invalid_amount, excess_return_amount, supplement_request_amount, reviewer_id, decision_value, evidence_ref | Settlement and closure log |
| PAYMENT_REQUEST | payment_request_id, requester_id, department_id, payment_group, amount, budget_code, project_code, payee_ref, due_date, evidence_ref, status | Request before approval |
| PAYMENT_MASTER | payment_id, payment_request_id, paid_at, paid_amount, payment_method, payee_ref, voucher_ref, executor_id, payment_status, evidence_ref | Payment execution metadata only |
| FINANCE_APPROVAL_LOG | approval_id, entity_type, entity_id, checker_id, approver_id, decision, decision_note, decided_at, evidence_ref | Human decision trace |
| FINANCE_STATUS_HISTORY | status_id, entity_type, entity_id, old_status, new_status, actor_id, changed_at, reason | Full status trace |
| FINANCE_RISK_HOLD | hold_id, entity_type, entity_id, hold_reason, owner, opened_at, closed_at, decision_value | Audit/legal/finance blocker |
| EVIDENCE_REFERENCE | evidence_ref, evidence_class, controlled_location_ref, redaction_status, reviewer, review_date, owner_signature_state | Git-safe reference only |
| AUDIT_LOG | audit_id, actor_id, action, entity_type, entity_id, before_state, after_state, evidence_ref, created_at | Required for all changes |

## 5. Status Model

### 5.1 Advance Status

`DRAFT -> SUBMITTED -> DEPT_CONFIRMED -> FIN_CHECKED -> LEGAL_CHECKED -> APPROVED -> PAID_ADVANCE -> RECON_SUBMITTED -> RECON_CHECKED -> CLOSED`

Allowed exception states:

- `NEEDS_FIX`
- `OVERDUE`
- `BLOCKED_BY_AUDIT`
- `BLOCKED_BY_LEGAL`
- `REJECTED`
- `CANCELLED`

### 5.2 Payment Request Status

`DRAFT -> SUBMITTED -> DEPT_CONFIRMED -> FIN_CHECKED -> LEGAL_CHECKED -> AUDIT_CHECKED -> APPROVED -> PAYMENT_RECORDED -> CLOSED`

Allowed exception states:

- `NEEDS_EVIDENCE`
- `NEEDS_BUDGET_APPROVAL`
- `DUPLICATE_RISK`
- `BLOCKED_BY_AUDIT`
- `BLOCKED_BY_LEGAL`
- `REJECTED`
- `REVERSED`

## 6. Required Software Gates

| Gate | Blocks when | Required result |
|---|---|---|
| ADVANCE_GATE | No task, no budget, overdue advance, unclear purpose, legal/audit warning | ADVANCE_READY / NO_GO / BLOCKED |
| ADVANCE_RECON_GATE | Missing voucher, wrong purpose, overdue without explanation, invalid evidence | ADVANCE_RECON_READY / NO_GO / BLOCKED |
| PAYMENT_REQUEST_GATE | No completion proof, no acceptance, no budget, no payee, no approval route | PAYMENT_REQUEST_READY / NO_GO / BLOCKED |
| PAYMENT_GATE | Duplicate payment risk, missing approval, missing voucher ref, audit/legal hold | PAYMENT_READY / NO_GO / BLOCKED |
| TTGDTX_COM_GATE | No actual HEU receipt, no reconciliation, invalid contract/appendix | TTGDTX_PAYMENT_READY / NO_GO / BLOCKED |
| EVIDENCE_GATE | Raw voucher, bank data, payroll or PII enters Git/Codex/chat | P0_10_ACCEPT / NO_GO / BLOCKED |
| REPORT_VIEW_GATE | Dashboard reads raw file or unsigned view | REPORT_VIEW_READY / NO_GO / BLOCKED |

## 7. Role And Permission Map

| Role | Allowed | Not allowed |
|---|---|---|
| REQUESTER | Create own advance/payment request, upload controlled evidence reference, respond to fix request | Approve, pay, close own request |
| DEPARTMENT_HEAD | Confirm task/business completion and department budget need | Execute payment or override finance hold |
| KHTC | Check budget/evidence, record payment metadata, request fix, open finance hold | Self-approve outside authority, bypass legal/audit hold |
| PHAP_CHE | Check contract, appendix, legal basis and high-risk payment | Execute payment |
| AUDIT | Check risk, duplicate, evidence class and log completeness | Execute payment or approve business need |
| BGH_HĐQT | Approve by threshold and decide exception | Bypass missing evidence without written waiver |
| IT_DATA | Configure form, workflow, roles, report view and audit log | Approve finance action or edit raw evidence |
| AI_AGENT | Draft checklist, summarize missing data, warn about blockers | Approve, pay, post accounting, alter source data, close request |

## 8. UI Screens To Build

| Route candidate | Main use | Write scope |
|---|---|---|
| `/finance/advances` | Advance list, filters, overdue queue | Requester creates; KHTC checks |
| `/finance/advances/[id]` | Advance detail and settlement timeline | Scoped edits by status |
| `/finance/advance-reconciliation` | Settlement queue and overdue blockers | KHTC/Audit review |
| `/finance/payment-requests` | Payment request list and gate status | Requester creates; department/KHTC checks |
| `/finance/payment-requests/[id]` | Payment detail, evidence ref, approval route | Controlled by role and status |
| `/finance/payment-execution` | Record payment metadata after approval | KHTC only; no bank transfer execution |
| `/finance/evidence-intake` | Evidence reference registry | Metadata only |
| `/finance/reports` | Read-only advance/payment report view | No raw files, no mutation |

## 9. Report Views

| Report view | Source objects | Consumer | Stop condition |
|---|---|---|---|
| RV_ADVANCE_AGING | ADVANCE_MASTER, ADVANCE_RECON_LOG | KHTC, BGH, Audit | Missing overdue status or owner |
| RV_PAYMENT_REQUEST_PIPELINE | PAYMENT_REQUEST, FINANCE_APPROVAL_LOG | KHTC, BGH | Reads unapproved raw request data |
| RV_PAYMENT_EXECUTION_SUMMARY | PAYMENT_MASTER, EVIDENCE_REFERENCE | KHTC, Audit | Missing voucher/evidence reference |
| RV_FINANCE_RISK_HOLD | FINANCE_RISK_HOLD, AUDIT_LOG | Audit, BGH | Hold can be closed without decision |
| RV_TTGDTX_COM_PAYMENT_READY | TTGDTX payment/reconciliation objects | KHTC, BGH | No actual receipt or reconciliation proof |

## 10. Implementation Sequence

1. Register SOP and form metadata as DRAFT_CONTROL.
2. Build Data Dictionary for ADVANCE and PAYMENT objects.
3. Build role/permission matrix and negative access cases.
4. Build read-only prototype screens with synthetic/sample data.
5. Add gate checks and audit-log requirements.
6. Run KHTC/PHAP_CHE/AUDIT review of SOP wording and thresholds.
7. Execute signed UAT outside Codex/chat.
8. Only after owner signoff, plan non-destructive SQL migration and real-data import.

## 11. Forbidden Production Actions

Codex, AI, local audits or this mapping must not:

- Create real advance/payment records in production.
- Execute bank transfer or payment.
- Mark COM, TTGDTX or partner payment as payable without actual HEU receipt and reconciliation.
- Import raw vouchers, bank statements, payroll files, CCCD, phone, bank account or raw payment data into Git/Codex/chat.
- Treat a report view or Finance Desk number as statutory accounting.
- Approve SOP issuance, UAT acceptance, evidence acceptance, owner waiver or production GO.

## 12. Next Build Slice

Recommended next PASS_LOCAL slice:

`Finance Advance/Payment Data Dictionary + UI Mock Workflow`

Scope:

- Create controlled dictionary for ADVANCE_MASTER, ADVANCE_RECON_LOG,
  PAYMENT_REQUEST and PAYMENT_MASTER.
- Add mock/read-only workflow shell if needed.
- Keep payment execution disabled.
- Keep Production NO-GO until signed SOP, UAT and owner signoff exist.
