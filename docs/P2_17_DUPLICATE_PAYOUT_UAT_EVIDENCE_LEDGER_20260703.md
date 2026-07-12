# P2-17 Duplicate Payout UAT Evidence Ledger - 2026-07-03

Status: PASS_LOCAL_LEDGER_TEMPLATE
Decision lane: P2_17_ACCEPT / FAIL / BLOCKED
Production/UAT status: NO-GO until KHTC, PHAP_CHE, BGH and Audit sign the
controlled UAT evidence outside Git/Codex/chat.

## Purpose

This ledger turns `docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md` into a
case-by-case evidence queue for ACCT-09. It does not execute payout UAT, accept
evidence, approve finance action, issue bank instructions, move money, post
vouchers, waive controls or mark production GO.

Secret boundary: do not paste passwords, temporary passwords, OTPs, password
reset links, account activation/invite links, service-role keys, API keys, raw
student PII, CCCD, phone numbers, bank accounts, bank statements, voucher
bodies, raw payment evidence or raw database exports into this file, Git,
Codex/chat, email notes or screenshots. Use controlled evidence IDs only.

## Required Case Ledger

| Case | Test focus | Required result | Controlled evidence ID | Owner decision |
|---|---|---|---|---|
| P2-17-01 | Full payout once with unique voucher | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| P2-17-02 | Double-submit while pending | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| P2-17-03 | Duplicate voucher with spacing/casing changes | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| P2-17-04 | Overpayment attempt | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| P2-17-05 | Partial payout then remaining payout | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| P2-17-06 | Direct table insert/update/delete attempt | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| P2-17-07 | Payout after request already PAID | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| P2-17-08 | Missing payout evidence URL | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| P2-17-09 | BBNT/accepted-period check FAIL or NOT_CHECKED | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| P2-17-10 | Partner-invoice check FAIL or NOT_CHECKED | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |
| P2-17-11 | Both P2-19 checks PASS, payout retried | PASS / FAIL / BLOCKED | PENDING_EXTERNAL_EVIDENCE | PENDING_OWNER |

## Acceptance Ledger

| Acceptance item | Requirement | Required evidence | Owner decision |
|---|---|---|---|
| P2-17-ACCEPT-01 | Approved request identity and remaining amount | One approved P2-15/P2-16 request, amount within remaining balance, not already PAID | PENDING_OWNER |
| P2-17-ACCEPT-02 | Single write path and double-submit control | `PaymentSubmitButton` pending-disable plus RPC-only write path proof | PENDING_OWNER |
| P2-17-ACCEPT-03 | Voucher and evidence uniqueness | Normalized voucher uniqueness plus required evidence URL proof | PENDING_OWNER |
| P2-17-ACCEPT-04 | P2-19 dossier blockers | BBNT and partner-invoice FAIL/NOT_CHECKED block, PASS allows only if other controls pass | PENDING_OWNER |
| P2-17-ACCEPT-05 | Partial and final payout lifecycle | Partial/final payout status and audit trace match the disbursement rows | PENDING_OWNER |
| P2-17-ACCEPT-06 | Owner sign-off and production boundary | KHTC, PHAP_CHE, BGH and Audit decision with controlled evidence references | PENDING_OWNER |

## Release Decision

Final decision: P2_17_RELEASE_READY / NO_GO / BLOCKED

Required before `P2_17_RELEASE_READY`:

- Every P2-17-01 through P2-17-11 case has PASS or an owner-signed BLOCKED
  decision with controlled evidence ID.
- Every P2-17-ACCEPT-01 through P2-17-ACCEPT-06 item has an owner decision.
- Audit trace identifies actor, timestamp, request, voucher and amount without
  exposing raw sensitive evidence in Git/Codex/chat.
- KHTC confirms amount handling and partial payout behavior.
- PHAP_CHE confirms the BBNT and partner-invoice evidence basis.
- BGH confirms the human release boundary.
- Audit confirms no direct write, duplicate payout or uncontrolled evidence
  path remains.

Stop condition:

- Any missing controlled evidence ID.
- Any `FAIL` without correction or owner waiver.
- Any raw sensitive payout evidence copied into Git/Codex/chat.
- Any owner treats PASS_LOCAL as bank transfer approval, finance approval,
  payout acceptance, money movement, voucher posting or production GO.

## Local Guard Commands

```powershell
npm.cmd run audit:ttgdtx-payout-duplicate-guard
npm.cmd run audit:ttgdtx-payout-execution-readiness
npm.cmd run check:heu-accounting-module-breakdown
```

These commands only verify packaging. They do not sign UAT or approve payout.
