# HEU Accounting No-Duplicate Control Ledger - 2026-07-03

Status: PASS_LOCAL_NO_DUPLICATE_LEDGER
Decision lane: ACCT_NO_DUPLICATE_READY / NO_GO / BLOCKED
Production/UAT status: NO-GO until signed finance/browser UAT, controlled
external evidence and owner decisions are completed outside Git/Codex/chat.

## Purpose

This ledger maps the TTGDTX 9+ accounting money chain from receivable to payout
and keeps the no-duplicate controls visible in one PASS_LOCAL place.

It is local packaging only. It does not create receivables, record tuition
payments, reconcile, create payment requests, record payout, execute UAT, accept
evidence, approve finance reliance, approve owner GO/NO-GO or mark production
GO.

Secret boundary: do not paste passwords, temporary passwords, OTPs, reset
links, invite links, service-role keys, raw student PII, CCCD, phone numbers,
bank accounts, bank statements, voucher bodies, raw payment evidence or raw
database exports into this file, Git, Codex/chat, email notes or screenshots.
Use controlled evidence IDs only.

## Control Ledger

| Control | Accounting step | Local no-duplicate proof | Required UAT evidence | Owner decision |
|---|---|---|---|---|
| ACCT-NODUP-01 | P2-03 receivable creation | `uq_ttgdtx_receivable_lead_policy_term_active` blocks more than one active receivable for the same lead, tuition policy and term; candidate view returns `RECEIVABLE_ALREADY_EXISTS` before creation | Synthetic duplicate receivable attempt with redacted lead/policy/term evidence | PENDING_OWNER |
| ACCT-NODUP-02 | P2-10 tuition collection | `uq_ttgdtx_payment_voucher_active` blocks active duplicate vouchers; collection trigger blocks over-collection beyond payable amount | Duplicate voucher and over-collection cases with controlled evidence IDs | PENDING_OWNER |
| ACCT-NODUP-03 | P2-13 reconciliation | `uq_ttgdtx_reconciliation_payment_once` blocks one posted payment from being used in more than one active reconciliation line | Duplicate reconciliation-line attempt plus invoice-control stop proof | PENDING_OWNER |
| ACCT-NODUP-04 | P2-15 payment request | `uq_ttgdtx_payment_request_batch_once`, `uq_ttgdtx_payment_request_line_once` and the request RPC block a second active request for the same locked reconciliation batch | Duplicate request attempt for one locked batch | PENDING_OWNER |
| ACCT-NODUP-05 | P2-17 payout record | `uq_ttgdtx_partner_payment_disbursement_voucher`, row lock, remaining-amount check and `REQUEST_ALREADY_PAID` stop duplicate payout or overpayment | P2-17-02 through P2-17-07 from the duplicate payout UAT runbook | PENDING_OWNER |
| ACCT-NODUP-06 | Cross-step audit/readiness | `check:heu-accounting-no-duplicate-control-ledger`, lifecycle audit, payment dossier audit and payout duplicate audit stay in the accounting local readiness gate | ACCT_NO_DUPLICATE_READY / NO_GO / BLOCKED with linked redacted evidence | PENDING_OWNER |

## Required Local Commands

```powershell
npm.cmd run check:heu-accounting-no-duplicate-control-ledger
npm.cmd run audit:ttgdtx-receivable-payment-lifecycle
npm.cmd run audit:ttgdtx-payment-dossier-checklist
npm.cmd run audit:ttgdtx-payout-duplicate-guard
npm.cmd run check:heu-accounting-local-readiness
```

Expected local result before signed accounting browser UAT can proceed:

- P2-03 active duplicate receivable is blocked.
- P2-10 active duplicate voucher and over-collection are blocked.
- P2-13 duplicate reconciliation use of the same posted payment is blocked.
- P2-15 duplicate active request for the same reconciliation batch is blocked.
- P2-17 duplicate voucher, duplicate payout, overpayment and already-paid
  payout attempts are blocked.
- The local readiness gate includes this ledger and keeps owner/external
  evidence blockers separate from local packaging.

## Stop Rules

Keep ACCT no-duplicate closure at NO-GO if any of these is true:

- A duplicate path can create another active receivable, collection voucher,
  reconciliation line, payment request or payout row.
- A direct table write bypasses the approved function/RPC path.
- A duplicate/overpayment case has no controlled evidence ID.
- A duplicate case is marked PASS in Git/Codex/chat without signed finance UAT.
- Raw voucher, bank, student, payment or identity evidence is copied into
  Git/Codex/chat.
- An owner treats PASS_LOCAL as finance reliance, voucher posting, bank
  transfer approval, UAT acceptance, owner GO/NO-GO or production GO.

This ledger is intentionally narrower than full accounting readiness. It proves
that the local no-duplicate control package is present; signed UAT and owner
closure remain external decisions.
