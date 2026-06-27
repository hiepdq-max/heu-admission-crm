# TTGDTX Linked Operating Review 2026-06-25

## 1. Executive Conclusion

TTGDTX is the operating backbone for the current HEU build. The target is not a
set of isolated finance screens. The target is a controlled linked-training
operating chain:

```text
HDLK
-> center / cohort / class / term
-> student receivable
-> tuition account control
-> collection evidence
-> collection invoice / receipt decision
-> reconciliation
-> BBNT
-> partner invoice
-> payment request
-> approval
-> payout
-> accounting dashboard
-> audit
```

Current conclusion: the repo has a strong internal-test foundation for the
finance chain, but the linked TTGDTX spine is not production-ready. Production
remains NO-GO until backup, rollback, UAT, role-scope tests, BBNT gate,
account-control workflow and final human approval are complete.

## 2. Objective

Build HEU as a controlled operating system for linked TTGDTX work:

- One center/cohort/term dossier shows contract, tuition policy, receivables,
  collection, collection invoice/receipt status, reconciliation, BBNT, partner
  invoice, payment request, payout and audit.
- Users do not need to remember the process; the app shows the next required
  step and blocks unsafe actions.
- Legal contract evidence, BBNT/payment evidence, bank evidence, account-control
  evidence and collateral/giai-chap evidence remain separate evidence streams.
- Real student and bank data stay masked by default and are never copied into
  repo files, logs or broad UI surfaces.
- AI can review, warn and draft. AI must not approve, pay, freeze/release
  accounts, perform giai chap or approve production.
- User-facing navigation should use business names first and internal P2 codes
  second. See `docs/TTGDTX_PROCESS_CODE_MAP_20260625.md`.
- Operating gates and owners are controlled by
  `docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md`.

## 3. Current Implementation Map

| Operating link | Current implementation | Status | Required next action |
|---|---|---|---|
| TTGDTX entry and contract readiness | `/ttgdtx`, Step98/Step99 source/master controls | Internal-test foundation exists | Keep as spine entry, surface linked dossier status |
| Evidence registry | `/ttgdtx/source-control`, Step98, Step110 metadata | UI foundation added | Complete signed UAT and keep raw PII/bank data out of repo/chat/logs |
| Tuition policy and gate | `/ttgdtx/tuition`, `/ttgdtx/gate`, Step91/Step92 | Internal-test foundation exists | Finish RLS/role tests before any migration |
| Receivables | `/ttgdtx/receivables`, Step90/Step91 | Internal-test foundation exists | Add duplicate/no-posting UAT cases |
| Import and issue routing | `/ttgdtx/import`, `/ttgdtx/import/issues`, Step92-Step95 | Partial | Add multi-section workbook review before real import |
| Collection evidence | `/ttgdtx/payments`, Step96 | Internal-test foundation exists | Add bank-batch duplicate fingerprint UAT |
| Collection invoice/receipt | Step96 evidence fields, invoice controls pending | Partial | Decide invoice/chung-tu requirement by collection model, payer type and legal/tax policy |
| Reconciliation | `/ttgdtx/reconciliation`, `/ttgdtx/reconciliation/review`, Step101-Step104 | Internal-test foundation exists | Keep locked-period rule before payment request |
| BBNT gate | Step110 metadata, source-control checks, Step105 P2-15 blocker and Step107 P2-17 blocker | P2-15/P2-17 gate added, UAT pending | Prove BBNT block/pass cases with signed UAT evidence |
| Payment request and approval | `/ttgdtx/payment-requests`, `/review`, Step105-Step106 | Internal-test foundation with P2-19 blockers | Require accepted-period evidence, partner invoice and formula basis in signed UAT |
| Payout | `/ttgdtx/payment-requests/pay`, Step107 | Hardened with P2-19 blockers, UAT pending | Execute duplicate payout, missing-evidence and P2-19 block/pass UAT while keeping RPC-only path |
| Accounting dashboard | `/ttgdtx/accounting-dashboard`, Step108 | Internal-test foundation exists | Finish signed role-based dashboard UAT |
| Account freeze/release | Step110 metadata and account-control note | Not built as workflow | Build account-control module after design approval |
| Collateral giai chap | Step110 metadata and collateral-control note | Not built as workflow | Keep as restricted legal-finance register, separate from tuition-account release |

## 4. Corrected Plan

### Phase A - Freeze And Align

Goal: stop broad expansion and align all work to the linked TTGDTX spine.

Do now:

- Treat TTGDTX linked training as the core operating dossier.
- Keep production NO-GO.
- Keep real data in read-only design review.
- Keep account-control, BBNT and collateral/giai-chap evidence as metadata only
  until UAT and owner approval exist.
- Clean and group the dirty Git worktree before any commit.

### Phase B - Evidence And Controls

Goal: make evidence visible, classified and safe.

Build next:

1. Extend source-control UI to show Step110 metadata:
   evidence type, PII level, extraction status, Drive file ID, source folder ID
   and manual review status. Status: foundation added.
2. Add linked dossier view per center/cohort/term.
3. Add invoice-control matrix for collection invoice/receipt and partner invoice.
4. Add BBNT evidence checklist as a blocking requirement before payment request.
   Status: P2-15 technical gate added through P2-19 source-control checks.
5. Add account-control design screen for freeze/release readiness.

### Phase C - Workflow Enforcement

Goal: block unsafe finance actions in the app.

Build after Phase B:

1. Collection cannot be treated complete until receipt/voucher and
   invoice-required status are resolved.
2. Payment request cannot be created without locked reconciliation, BBNT
   evidence and required partner invoice status.
3. Payout cannot execute without approved request, partner invoice evidence and
   duplicate payout guard. Status: Step107 technical blocker added; UAT still
   required.
4. Tuition account release cannot happen without reconciliation complete,
   finance approval, bank confirmation and communication evidence.
5. Collateral giai chap stays outside normal TTGDTX payment flow and requires a
   restricted legal-finance path.

### Phase D - UAT And Go/No-Go

Goal: prove the spine works with safe test data.

Required UAT:

- Admin, BGH, KHTC, Phap Che, TTGDTX owner and out-of-scope user.
- Anonymized Phu Xuyen-like contract, tuition workbook, BBNT and bank evidence.
- Collection invoice/receipt cases: required, not required and pending.
- Partner invoice before payment request/payout.
- One account-freeze notice and one account-release request.
- Duplicate receipt and duplicate payout attempts.
- Dashboard totals after locked reconciliation and payout.
- Audit log readback for create, update, check, approve, pay and block events.

Production can be considered only after backup/rollback dry-run, migration
order approval, role-scope UAT and final human Go/No-Go approval.

## 5. Immediate Implementation Priorities

Priority 1: source-control/evidence UI for Step110 metadata. Status:
foundation added, UAT pending.

Priority 2: operating-control matrix reflected in UI helper text and gates.

Priority 3: user-friendly labels and search names for the TTGDTX process map.

Priority 4: BBNT gate in payment request candidates and payout. Status:
P2-15/P2-17 blockers added, UAT proof still pending.

Priority 5: invoice-control matrix for collection and partner payment.

Priority 6: account-control module for freeze/release state tracking.

Priority 7: anonymized UAT pack and role-based test execution.

Priority 8: clean commit grouping, keeping TTGDTX core separate from unrelated
lead/settings changes.

## 6. Scope Guard

Do not start broad banking, HR, training or dashboard expansion until the
linked TTGDTX spine is stable. Other modules should only be touched when they
support this chain directly: legal source control, role/scope security, audit,
finance approval or evidence management.
