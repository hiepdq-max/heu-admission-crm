# TTGDTX Contract And Tuition Master Guard 2026-06-27

Status: DRAFT_CONTROL  
Scope: P2-01 contract/partner master and P2-02 tuition policy master for the
TTGDTX 9+ pilot  
Production status: NO-GO until signed legal, tuition, finance and owner UAT

## 1. Purpose

P2-01 and P2-02 are prerequisites for finance workflows. They define the legal
contract basis and the tuition/receivable policy basis. They do not create
receivables, collect tuition, issue invoice/receipt, reconcile money, approve
partner payment, execute payout, mark revenue or approve production.

## 2. P2-01 Contract Master Rule

P2-01 contract must be ACTIVE before downstream finance can trust it. Minimum
local controls:

1. TTGDTX partner is active and belongs to the `TC9_TTGDTX_LINKED` segment.
2. Contract has number, signed date, effective period and non-overlap rule.
3. Scope note and legal basis or controlled contract evidence link exist.
4. Tuition collection model, settlement cycle, payment condition and duplicate
   payment guard are defined.
5. Readiness view `ttgdtx_partner_contract_readiness` exposes blockers.
6. Role/scope permissions include `ttgdtx.contract.read`, manage and approve
   boundaries.

## 3. P2-02 Tuition Policy Rule

P2-02 tuition policy must be READY before P2-03 can create receivables. Minimum
local controls:

1. Policy is tied to the same active P2-01 contract, partner and segment.
2. Program/major/offering match the TTGDTX linked scope.
3. ACTIVE policy has tuition amount greater than zero.
4. Due rule, settlement basis and evidence requirement are present.
5. Readiness view `ttgdtx_tuition_policy_readiness` exposes blockers.
6. Role/scope permissions include `ttgdtx.tuition.read`, manage and approve
   boundaries.

## 4. Finance Gate Boundary

P2-03 creates receivable only after:

1. P2-01 contract is ACTIVE.
2. P2-02 tuition policy is READY.
3. P0-19 legal/tuition finance gate allows finance.
4. P2-05 receivable gate passes.

P2-01/P2-02 PASS_LOCAL does not approve legal contract, tuition policy, finance
action, production migration, UAT acceptance, owner waiver or production GO.

## 5. Sensitive Data Boundary

Do not paste private contract bodies, raw student PII, CCCD, bank data,
passwords, temporary passwords, OTPs, password reset links, account
activation/invite links, service-role keys, production credentials, bank statements,
vouchers or payment evidence into Git, Codex/chat, screenshots or UAT notes.
Use controlled evidence links or redacted references.

## 6. UAT Cases

| Case | Expected result |
|---|---|
| P2-01-01 Active contract with full basis | Readiness is READY and downstream screens may continue to P2-02/P2-05 checks |
| P2-01-02 Missing legal basis | Contract readiness shows blocker; no finance workflow treats it as ready |
| P2-01-03 Overlapping contract period | Server/database rejects the overlap |
| P2-02-01 Ready tuition policy | Policy readiness is READY only when contract, amount, due rule, settlement and evidence exist |
| P2-02-02 Missing tuition amount | Policy readiness blocks P2-03 |
| P2-02-03 Contract-only role opens finance page | User cannot treat contract permission as tuition/finance permission |
| P2-02-04 Signed owner review | PHAP_CHE, KHTC, BGH and Audit sign evidence outside Codex/chat |

## 7. Current Evidence

Current local evidence:

- `database/step88_ttgdtx_partner_contract_master.sql`
- `database/step89_ttgdtx_tuition_policy.sql`
- `database/step97_ttgdtx_p0_19_finance_gate_fix.sql`
- `components/ttgdtx/ttgdtx-contract-tuition-master-guard.tsx`
- `app/ttgdtx/page.tsx`
- `app/ttgdtx/tuition/page.tsx`
- `npm.cmd run audit:ttgdtx-contract-tuition-master-guard`
- `npm.cmd run audit:ttgdtx-release-gates`

## 8. Current Result

P2-01 and P2-02 are PASS_LOCAL as master-data/readiness controls. This is not a
production approval. Signed legal/tuition/finance UAT and owner Go/No-Go remain
required before any production receivable, collection, invoice, reconciliation
or payout reliance.
