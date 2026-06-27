# P2-17 Duplicate Payout UAT Runbook

## 1. Purpose

This runbook verifies that TTGDTX P2-17 can record approved partner payout
evidence without duplicate payout, overpayment, or direct table writes outside
the approved RPC path. It also verifies that payout cannot proceed without the
P2-19 BBNT/partner-invoice controls and a payout evidence link.

Production remains NO-GO until this runbook is executed with test data, signed
off by KHTC/Audit, and linked in the production checklist.

## 2. Scope

- Module: TTGDTX 9+ finance/accounting pilot.
- Screen: `/ttgdtx/payment-requests/pay`.
- SQL: `database/step107_ttgdtx_payment_execution_p2_17.sql`.
- Function: `record_ttgdtx_partner_payment_disbursement`.
- Evidence class: accounting payment record and audit log only. Do not mix with
  legal contract folders or registry/index files.

## 3. Preconditions

1. Use a non-production database or controlled UAT dataset.
2. Run migrations through Step107 in order after backup in the test database.
3. Log in with a user that has `ttgdtx.payment_request.pay` or equivalent.
4. Prepare one P2-15 request already approved in P2-16 with:
   - `request_status = 'APPROVED'`
   - `approved_amount_vnd > 0`
   - `paid_amount_vnd = 0`
5. Prepare P2-19 source-control check states for both block and pass cases:
   - `P2_19_ACCEPTANCE_BEFORE_PAYOUT`
   - `P2_19_PARTNER_INVOICE_BEFORE_PAYOUT`
6. Do not paste passwords, banking login credentials, or real card/account
   secrets into Codex, tickets, screenshots, or notes.

## 4. Test Matrix

| Case | Action | Expected result |
|---|---|---|
| P2-17-01 | Record full payout once with a unique voucher number | One disbursement is created, request becomes `PAID`, audit log records the action |
| P2-17-02 | Click the submit button twice while the first submit is pending | The button disables during submit; at most one disbursement is created |
| P2-17-03 | Reuse the same voucher number with different spacing/casing | Database rejects the second record as duplicate voucher |
| P2-17-04 | Submit amount greater than remaining approved amount | Database rejects with overpayment error; no new disbursement |
| P2-17-05 | Record a partial payout, then a second payout within remaining amount | Both records are allowed only if each voucher is unique and total paid does not exceed approved amount |
| P2-17-06 | Try direct insert/update into `ttgdtx_partner_payment_disbursements` as authenticated user | Database rejects direct write; only RPC path can write payout records |
| P2-17-07 | Try to pay a request already `PAID` | Database rejects as already paid |
| P2-17-08 | Submit payout without evidence URL | Server/RPC rejects; no new disbursement |
| P2-17-09 | Keep `P2_19_ACCEPTANCE_BEFORE_PAYOUT` as `FAIL` or `NOT_CHECKED`, then try payout | Board blocks and RPC rejects because BBNT/accepted-period evidence is incomplete |
| P2-17-10 | Keep `P2_19_PARTNER_INVOICE_BEFORE_PAYOUT` as `FAIL` or `NOT_CHECKED`, then try payout | Board blocks and RPC rejects because partner invoice evidence is incomplete |
| P2-17-11 | Mark both P2-19 checks as passed in UAT, then retry payout with evidence URL | Payout can proceed if all other amount/status/voucher controls pass |

## 5. Local Guard Evidence

Before signed UAT, the repo must keep local guard evidence green:

- `components/ttgdtx/ttgdtx-payout-duplicate-guard.tsx` shows the P2-17 guard
  chain on the payout screen.
- `components/ttgdtx/ttgdtx-payout-execution-readiness-checklist.tsx` shows
  the operator pre-pay checklist for P2-17-EXEC-01 through P2-17-EXEC-08:
  approved request identity, remaining amount, voucher uniqueness, evidence
  URL, P2-19 dossier blockers, RPC-only write path, double-submit behavior and
  audit trace. P2-17 records money already paid; it does not initiate a bank
  transfer.
- `components/ttgdtx/ttgdtx-payout-uat-evidence-checklist.tsx` shows the
  required redacted evidence set for P2-17-01 through P2-17-11 and keeps raw
  bank statements, vouchers, payment data, student PII and credentials out of
  Git/Codex/chat.
- The same checklist exposes `data-ttgdtx-payout-acceptance-matrix="P2-17"`
  with P2-17-ACCEPT-01 through P2-17-ACCEPT-06 and decision value
  `P2_17_ACCEPT / FAIL / BLOCKED`.
- `PaymentSubmitButton` disables while pending for the double-submit case.
- `recordTtgdtxPartnerPaymentDisbursementAction` requires voucher number and
  payout evidence before calling the RPC.
- `database/step107_ttgdtx_payment_execution_p2_17.sql` keeps row lock,
  normalized voucher uniqueness, overpayment guard, direct-write revoke and
  P2-19 blockers.
- `npm.cmd run audit:ttgdtx-payout-duplicate-guard` must pass.
- `npm.cmd run audit:ttgdtx-payout-execution-readiness` must pass.

This local evidence does not replace signed UAT. It only proves the guard is
packaged and visible before the UAT team executes the matrix above.

## 6. Evidence Queries

Use these only against UAT/test data.

```sql
select
  request_id,
  count(*) as disbursement_count,
  sum(amount_vnd) as paid_total
from public.ttgdtx_partner_payment_disbursements
where record_status = 'ACTIVE'
group by request_id
having sum(amount_vnd) > (
  select approved_amount_vnd
  from public.ttgdtx_partner_payment_requests r
  where r.id = request_id
);
```

Expected: zero rows.

```sql
select
  lower(btrim(voucher_no)) as normalized_voucher_no,
  count(*) as voucher_count
from public.ttgdtx_partner_payment_disbursements
where record_status = 'ACTIVE'
  and payment_status <> 'CANCELLED'
group by lower(btrim(voucher_no))
having count(*) > 1;
```

Expected: zero rows.

```sql
select
  request_id,
  approved_amount_vnd,
  paid_amount_vnd,
  request_status
from public.ttgdtx_partner_payment_requests
where record_status = 'ACTIVE'
  and paid_amount_vnd > approved_amount_vnd;
```

Expected: zero rows.

## 7. Payout Acceptance Matrix

Use the P2-17 payout acceptance matrix after the test matrix and evidence
queries. The matrix is local-only until signed payout UAT and owner sign-off
exist.

| Case | Requirement | Minimum evidence | Stop condition |
|---|---|---|---|
| P2-17-ACCEPT-01 | Approved request identity and remaining amount | Payout record ties to one P2-15 request approved in P2-16; amount is within remaining approved balance and request is not already `PAID` | Request identity is unclear, approved amount cannot be proven, or overpayment remains possible |
| P2-17-ACCEPT-02 | Single write path and double-submit control | `PaymentSubmitButton` disables while pending and the server action reaches payout write only through the approved RPC | Direct table writes, duplicate clicks or any non-RPC path can create payout records |
| P2-17-ACCEPT-03 | Voucher and evidence uniqueness | Normalized voucher uniqueness and payout evidence URL requirement are proven with redacted, non-secret references | Voucher reuse is accepted, evidence URL is optional, or raw bank/payment evidence enters Git/Codex/chat |
| P2-17-ACCEPT-04 | P2-19 dossier blockers | BBNT and partner-invoice checks are `PASS` before payout; `FAIL` or `NOT_CHECKED` blocks the board and RPC | `P2_19_ACCEPTANCE_BEFORE_PAYOUT` or `P2_19_PARTNER_INVOICE_BEFORE_PAYOUT` can be bypassed |
| P2-17-ACCEPT-05 | Partial and final payout lifecycle | Partial payout stays within remaining balance, final payout updates paid status, and audit trace records actor/time/voucher | Paid amount, request status or audit trace drifts from actual payout records |
| P2-17-ACCEPT-06 | Owner sign-off and production boundary | KHTC, PHAP_CHE, BGH and Audit sign redacted evidence outside Codex/chat before P2-17 can support production review | PASS_LOCAL is treated as payout UAT pass, bank transfer approval, finance approval, money movement or production GO |

Decision value: `P2_17_ACCEPT / FAIL / BLOCKED`.

## 8. Sign-Off Rule

Mark P2-17 as `DONE` only when:

1. All cases in the test matrix pass on UAT data.
2. Screenshot or exported evidence is stored in the correct accounting evidence
   location.
3. Audit log proves who recorded the payout, when, and with which voucher.
4. KHTC/Audit confirms that partial payout behavior is intended.
5. KHTC/Phap Che confirms that BBNT and partner-invoice block/pass cases match
   the accepted payment dossier rule.
6. P2-17-ACCEPT-01 through P2-17-ACCEPT-06 all pass with redacted evidence.
