# TTGDTX Operating Control Matrix 2026-06-25

## 1. Expert Position

HEU should operate TTGDTX as one controlled dossier per center, cohort and
term. The system should not depend on staff remembering P2 codes or manually
checking scattered folders.

The optimized control model is:

```text
Business name first
-> evidence classified
-> owner assigned
-> blocking gate checked
-> audit written
-> next action shown
```

Production remains NO-GO until every P0 gate has evidence and human approval.

## 2. Operating Dossier

One TTGDTX operating dossier must answer:

| Question | Required answer |
|---|---|
| We are working with which center? | Center, province, owner and linked contract |
| Which period? | Cohort, class, school year, term, month range |
| Are legal terms valid? | HDLK, appendix, effective dates, payment profile |
| Who collects tuition? | HEU, TTGDTX, split collection or other approved model |
| What must be collected? | Student receivable and policy basis |
| What has been collected? | Receipt/voucher, bank evidence, collector and date |
| Is invoice/chung-tu required? | Required/not required/pending/waived with owner |
| Is it reconciled? | Locked reconciliation period and approved amount |
| Is acceptance complete? | BBNT, finalized list, accepted count and signed evidence |
| Can HEU pay the partner? | Partner invoice, approved request and payout guard |
| Is account control needed? | Freeze/release state, bank confirmation, communication evidence |
| Is collateral giai chap involved? | Separate restricted legal-finance path |

## 3. Control Matrix

| User-facing step | Internal code | Owner | Must have before moving on | Blocks |
|---|---|---|---|---|
| Ho so lien ket TTGDTX | P2-01 | Phap Che + BGH | Active HDLK, scope, effective date, payment condition | Tuition policy, receivable, payment request |
| Chinh sach hoc phi | P2-02 | KHTC | Fee policy by center/cohort/class/term, collection model | Receivable creation |
| Cong no hoc sinh | P2-03 | KHTC | Student-period receivable, amount, due date, audit | Collection and reconciliation |
| Gate dieu kien | P2-05 | KHTC + Tuyển sinh | Eligible student/class/contract scope | Receivable creation |
| Import du lieu | P2-06 | IT_DATA + KHTC | File registered, section detected, PII masked | Real-data posting |
| Thu hoc phi | P2-10 | KHTC | Amount, date, voucher no, evidence link, no duplicate, no over-collection | Reconciliation |
| Hoa don/chung tu thu hoc phi | P2-10 extension | KHTC + Phap Che | invoice_required, issuer, status, number/date/evidence or waiver | Collection completion and UAT approval |
| Kiem soat nguon | P2-11/P2-19 | IT_DATA + Owners | Evidence type, PII level, extraction status, source link, review status | Real-data import, production migration |
| Doi soat | P2-13 | KHTC | Eligible collection lines, period, totals, no duplicate use | Payment request |
| Duyet/khoa ky doi soat | P2-14 | KHTC + BGH | Checker/approver decision, locked period | Payment request |
| BBNT nghiem thu | P2-15 prerequisite | KHTC + Phap Che + Center owner | Signed/sealed BBNT, accepted count/list summary, period match | Payment request and payout |
| Hoa don doi tac | P2-15 prerequisite | KHTC + Phap Che | Partner invoice evidence or approved waiver | Payment request and payout |
| De nghi thanh toan | P2-15 | KHTC | Locked reconciliation, BBNT, partner invoice, formula amount | Approval and payout |
| Duyet thanh toan | P2-16 | KHTC + BGH | Checked/approved amount, note, audit | Payout |
| Chi tien | P2-17 | KHTC | Approved request, voucher guard, one-time payout path | Dashboard final facts |
| Dashboard ke toan | P2-18 | BGH + KHTC | Read-only totals from locked/approved source facts | Go-live sign-off |
| Phong toa/giai toa tai khoan | P2-19/account-control | KHTC + CTHSSV | Communication, bank confirmation, affected scope, release gate | Account operation and audit |
| Giai chap tai san dam bao | P2-19/restricted | Phap Che + KHTC + BGH | Obligation clearance, bank confirmation, legal release, handover evidence | Legal-finance release |

## 4. Blocking Rules

The app should enforce these rules:

1. Do not create receivable without active contract and ready tuition policy.
2. Do not post real import rows directly to finance ledgers.
3. Do not mark collection complete until receipt/voucher and invoice/chung-tu
   status are resolved.
4. Do not reconcile the same collection evidence into multiple periods.
5. Do not create payment request without locked reconciliation, BBNT and partner
   invoice evidence where required.
6. Do not pay without approved request and duplicate payout guard.
7. Do not release tuition account control without reconciliation complete,
   finance approval, bank confirmation and communication evidence.
8. Do not mix collateral giai chap with tuition-account release.
9. Do not expose student/bank/collateral sensitive details outside approved
   scoped roles.
10. Do not let AI approve, pay, freeze/release, giai chap or mark go-live.

## 5. UI Optimization Requirements

For every TTGDTX screen:

- Show business name first, internal code second.
- Show "where am I in the chain" at top of the page.
- Show missing evidence as a blocking checklist.
- Show owner and next action.
- Show source links without copying raw sensitive data.
- Mask student/bank fields by default.
- Use Vietnamese business terms in navigation and search.

Example:

```text
Thu hoc phi (P2-10)
Step: after Cong no, before Doi soat
Missing: invoice/chung-tu status
Owner: KHTC + Phap Che
Next action: classify invoice_required and attach evidence/waiver
```

## 6. Implementation Plan

### Slice 1 - Make It Findable

- Finish business-name-first labels across TTGDTX screens.
- Add process-code map to support/search.
- Add short helper text on finance pages: previous step, current step, next
  step.

### Slice 2 - Make Evidence Visible

- Extend source-control UI to show Step110 metadata.
- Show evidence type, PII level, extraction status and owner.
- Highlight HIGH sensitivity sources.

### Slice 3 - Make Gates Enforceable

- Keep collection invoice/chung-tu status and the P2-10 invoice policy matrix
  visible on Thu hoc phi. Status: PASS_LOCAL; signed KHTC/Phap Che UAT still
  required.
- Add BBNT and partner invoice gate before payment request. Status:
  P2-15 blocker added through Step105 and P2-19 source-control checks; P2-17
  blocker added through Step107 and P2-19 source-control checks; UAT proof
  still pending.
- Add account-control state model before real freeze/release operations.

### Slice 4 - Prove With UAT

- Use anonymized Phu Xuyen-like and Lai Chau-like cases.
- Test role scope and out-of-scope denial.
- Test duplicate collection, duplicate reconciliation and duplicate payout.
- Attach UAT evidence before production review.

## 7. Decision

Recommended path: continue building the TTGDTX linked operating spine only.
Pause broad module expansion until Slice 1 to Slice 4 are complete or formally
waived.
