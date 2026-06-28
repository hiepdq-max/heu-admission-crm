# HEU HOU Ledger Handover Gap Pack 2026-06-28 V01 Draft

Status: DRAFT_CONTROL
Production status: NO-GO
Owner: HOU owner + KHTC + CTHSSV + Dao Tao + Phap Che + IT_DATA + Audit

## 1. Purpose

This pack turns the current HOU module into a controlled review surface before
any deeper workflow or production migration. It uses real operating logic, but
only as a design and UAT-control package. It does not approve production HOU
handover, tuition ledger posting, invoice issuance, COM payout, finance action,
evidence acceptance, UAT acceptance, owner GO or production GO.

HOU must stay separate from TTGDTX and Short Course. TTGDTX Phu Xuyen examples
can inform realistic controls, but they must not hard-code HOU behavior or mix
HOU ledger facts into the TTGDTX 9+ pilot.

## 2. Controlled HOU Object Chain

| Layer | Required object | Current source clue | Stop condition |
|---|---|---|---|
| Lead identity | HOU lead, student code, program, major, location, stage | `leads`, HOU program/major/location/stage fields | Missing identity keeps HOU handover NO_GO |
| Handover packet | HOU handover log and receiver decision | Lead evidence and P3 handover controls | No signed receiver decision |
| Tuition ledger | Term, credit count, unit price, collection owner, source evidence | HOU tuition rate and financial-policy primitives | No ledger posting without owner signoff |
| Invoice/chung-tu | Issuer, payer type, invoice_required, voucher evidence or waiver | P2-10 invoice/chung-tu pattern | No collection reliance without legal/KHTC decision |
| COM policy | Payee, policy version, tax, debt offset, breakeven check | HOU claim and claim-line primitives | No payable finalization without signed policy |
| Payment batch | Batch approval, duplicate guard, voucher evidence | HOU payment batch UI | No payout until UAT and owner release proof |
| Report view | `RV_HOU_LEDGER_SUMMARY` | Report View Source Map and Data Master bridge | No dashboard reliance without source reconciliation |
| Audit/signoff | Audit row, owner, evidence reference, decision status | P0 register and evidence binder | No PASS_LOCAL can replace human approval |

## 3. HOU Ledger/Handover Control Gates

| Code | Gate | Required proof | Owner |
|---|---|---|---|
| HOU-LH-01 | Identity and route | Student identity, HOU program, major, location, intake route and stage are complete | Tuyen Sinh + HOU owner |
| HOU-LH-02 | Handover packet | CTHSSV/Dao Tao/HOU receiver accepts or rejects the packet with scoped evidence reference | CTHSSV + Dao Tao + HOU owner |
| HOU-LH-03 | Tuition ledger basis | Term, credit count, tuition unit price, collection owner and source evidence are captured | KHTC + HOU owner |
| HOU-LH-04 | Invoice/chung-tu decision | Issuer, payer type, invoice_required, voucher status or authorized waiver is recorded | KHTC + Phap Che |
| HOU-LH-05 | COM policy version | Commission version, tax withholding, debt offset, breakeven check and signer are present | HOU owner + KHTC |
| HOU-LH-06 | Payment batch release | Batch approval, voucher evidence, duplicate guard and no-overpayment proof are present | KHTC + BGH |
| HOU-LH-07 | Report view signoff | `RV_HOU_LEDGER_SUMMARY` has source reconciliation, owner signoff and UAT evidence | BGH + Audit |
| HOU-LH-08 | Production stop rule | HOU write, payout and dashboard reliance remain blocked until signed UAT and owner GO | IT_DATA + Audit |

Decision values: `HOU_LEDGER_READY / NO_GO / BLOCKED`.

## 4. Current Gap Matrix

| Area | Current evidence | Gap | Safe next work |
|---|---|---|---|
| Handover | HOU lead/evidence primitives and P3 handover guard exist | No HOU-specific receiver decision manifest yet | Add HOU handover UAT cases and evidence slots |
| Tuition ledger | HOU tuition rate and revenue-share primitives exist | No signed ledger source and invoice/chung-tu basis | Draft HOU tuition ledger UAT runbook |
| COM policy | Claim, claim-line, breakeven and payment-batch UI exist | Policy version, tax, offset, breakeven and payout UAT are not signed | Keep COM as preview/readiness until owner signoff |
| Report view | `RV_HOU_LEDGER_SUMMARY` is in report governance | Source reconciliation and owner signoff are pending | Tie HOU report view to DQ and signoff capture |
| Role scope | Sensitive finance policy rows have restricted intent | HOU role/workspace UAT is not signed | Add HOU roles to P6-04 UAT route matrix |
| Audit | General audit discipline exists | HOU-specific decision trace is not proven | Require signed HOU audit-log sample in UAT |

## 5. First UAT Cases To Execute Outside Codex

| UAT ID | Role | Route | Expected result | Stop condition |
|---|---|---|---|---|
| HOU-UAT-01 | HOU operator | `/hou` | Sees gap pack, lead quality and COM readiness without production approval | Screen implies COM payout or production ready |
| HOU-UAT-02 | CTHSSV/Dao Tao receiver | Lead detail or handover route | Can accept/reject only scoped HOU packet | Receiver can create ledger or approve COM |
| HOU-UAT-03 | KHTC | `/hou` | Can review tuition ledger basis, invoice/chung-tu gap and COM blockers | Can post ledger or pay without signed proof |
| HOU-UAT-04 | BGH/Audit | `/reports` and `/hou` | Sees `RV_HOU_LEDGER_SUMMARY` signoff blocker | Dashboard can be relied on without signoff |
| HOU-UAT-05 | Out-of-scope staff | `/hou` | Sensitive finance/COM detail is hidden or blocked | User sees restricted rate, COM policy or payout data |
| HOU-UAT-06 | IT_DATA/Audit | Audit sample | Decision, actor, owner and evidence reference are traceable | PASS_LOCAL or AI output is treated as owner approval |

## 6. Forbidden Actions

Codex, AI or a local PASS_LOCAL guard must not:

- Approve HOU handover or enrollment reliance.
- Post tuition ledger facts or mark tuition collected.
- Decide whether an invoice or receipt has been legally issued.
- Finalize COM payable, approve COM payout or mark a payment batch paid.
- Import raw HOU evidence, bank data, CCCD, phone numbers, vouchers or secrets
  into Git, Codex or chat.
- Treat `RV_HOU_LEDGER_SUMMARY` as a production dashboard source.
- Mark UAT, owner signoff or production GO as complete.

## 7. Local Evidence

- `components/hou/hou-ledger-handover-gap-pack.tsx`
- `/hou`
- `docs/HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT.md`
- `npm.cmd run audit:heu-hou-ledger-handover-gap-pack`

Passing this audit means only that the HOU gap-pack structure exists locally and
the production boundary is visible. HOU remains `CAN_SUA` until handover UAT,
tuition ledger proof, COM policy/signoff, source reconciliation and owner
decision evidence are completed outside Codex/chat.
