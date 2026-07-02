# HEU Real Data Logic, Professional And Legal Confirmation Register 2026-07-02

Status: PASS_LOCAL_CONFIRMATION_REGISTER
Owner: BGH + IT_DATA + KHTC + PHAP_CHE + Audit + process owners
Production status: NO-GO
Decision value: `REAL_DATA_CONFIRM_READY / NO_GO / BLOCKED`

This register separates what the current HEU build already controls locally from
what real staff must confirm before any real-data reliance, signed UAT, finance
action, migration or owner GO. It is a confirmation register only. It does not
accept evidence, approve UAT, approve finance reliance, approve legal position,
grant access, run migration, move money, issue invoices or mark production GO.

## 1. Source Baseline Read

The register is based on the current local control state in:

- `docs/HEU_CURRENT_STATE_INVENTORY.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`

Current baseline: Stage D internal controlled test only. Production remains
`NO-GO`.

## 2. Confirmation Roles

| Role | Must confirm | Must not delegate to Codex |
|---|---|---|
| BGH / owner | Final GO/NO-GO, dashboard reliance, risk acceptance | Owner approval, waiver, production GO |
| IT_DATA | Backup/restore, migration order, role/workspace scope, RLS, audit triggers, deployment readiness | Production migration, account creation, secret handling |
| KHTC | Receivable, collection, reconciliation, invoice/chung-tu, payment request, payout, Finance Desk reliance | Finance approval, voucher posting, bank instruction |
| PHAP_CHE | Contract basis, legal/SOP fit, invoice/legal basis, data sharing, evidence class | Legal approval, contract interpretation as final advice |
| Audit | Controlled evidence, redaction, audit-log proof, hard-delete/cascade closure | Evidence acceptance, deletion waiver |
| DAO_TAO / CTHSSV | Lead-to-student handover, class/program readiness, attendance or student-state transitions | Handover acceptance without signed UAT |
| HOU / Short Course owners | HOU ledger/handover and short-course attendance/payment rules if in scope | COM/payment/attendance finalization |

## 3. Logic Review List

| ID | Logic area | Current controlled logic | Missing or required confirmation | Owner |
|---|---|---|---|---|
| `LOGIC-01` | Production gate | Production blockers and Stage D/NO-GO are visible | Confirm exact owner route for turning NO-GO into GO after all evidence exists | BGH + IT_DATA + Audit |
| `LOGIC-02` | Backup before migration | Backup/restore run sheet and evidence pack exist | Real backup ID, restore target, smoke-check result and owner acceptance are missing | IT_DATA + Audit |
| `LOGIC-03` | Migration order | Step90-Step110 migration guard exists | Signed migration order by required owners is missing | IT_DATA + KHTC + PHAP_CHE + BGH |
| `LOGIC-04` | Role/workspace access | P6-04 role/scope packs and negative-account checks exist | Real scoped user results, out-of-scope denial and access closure decision are missing | IT_DATA + process owners |
| `LOGIC-05` | TTGDTX finance flow | P2-03 through P2-18 are locally guarded | Signed finance UAT across collection, reconciliation, payout and dashboard is missing | KHTC + Audit + BGH |
| `LOGIC-06` | Finance Desk | P5-03 is read-only and UAT-gated | Signed P5-03 browser UAT, source reconciliation and reliance decision are missing | KHTC + BGH + Audit |
| `LOGIC-07` | Dashboard reliance | P2-18 and report-view reliance locks exist | Report-view owner signoff and controlled evidence references are missing | BGH + KHTC + Audit |
| `LOGIC-08` | Audit trail | Audit-log and audit-trail guards exist | Signed P6-03 audit-log UAT and sampled trace evidence are missing | Audit + IT_DATA |
| `LOGIC-09` | Hard-delete/cascade | Cascade findings are registered | Conversion or written waiver is still required | IT_DATA + Audit + owners |
| `LOGIC-10` | Evidence handling | Controlled evidence/redaction pack exists | Actual controlled Drive evidence locations and redaction reviewers must be confirmed | Audit + IT_DATA |

## 4. Professional Review List

| ID | Professional area | Must be confirmed with real owner | Minimum confirmation output |
|---|---|---|---|
| `PRO-01` | Tuition collection | When money is received, whether invoice/chung-tu is issued, what document type applies, and who signs | KHTC + PHAP_CHE decision note per collection case |
| `PRO-02` | Receivable status | Meaning of unpaid, partial paid, paid, overpaid, refund, adjustment and period lock | KHTC status dictionary and examples |
| `PRO-03` | Reconciliation | How bank receipt, import staging, student receivable and invoice/chung-tu are matched | KHTC reconciliation rule and exception owner |
| `PRO-04` | Payment request | Required BBNT, invoice, contract, payout dossier and approval threshold | KHTC + PHAP_CHE payment dossier checklist |
| `PRO-05` | Maker/checker/approver | Who creates, checks, approves and pays; what exception is allowed | KHTC + Audit segregation-of-duties signoff |
| `PRO-06` | Finance Desk use | Which KHTC/BGH users may rely on read-only output and when they must stop | P5-03 reliance decision and stop-condition signoff |
| `PRO-07` | HOU | Whether HOU ledger/handover/COM is in current phase or later | HOU owner + KHTC phase decision |
| `PRO-08` | Short Course | Whether attendance, BHXH, meal/allowance and payment are in current phase or later | DAO_TAO + CTHSSV + KHTC phase decision |
| `PRO-09` | Bank/collateral | Whether phong toa/giai chap is metadata-only or operational in HEU v1 | KHTC + PHAP_CHE + BGH scope decision |
| `PRO-10` | Master data | Which student/class/program/partner fields are authoritative | IT_DATA + process-owner Data Master signoff |

## 5. Legal And Compliance Review List

| ID | Legal/compliance area | Missing or uncertain point | Required owner response |
|---|---|---|---|
| `LEGAL-01` | Contract basis | Which contract version controls TTGDTX/HOU/Short Course cases | PHAP_CHE controlled contract reference |
| `LEGAL-02` | SOP authority | Which SOP/regulation gives authority for each finance and handover step | PHAP_CHE + process-owner SOP reference |
| `LEGAL-03` | Invoice/tax document | Whether collection must issue tax invoice, internal receipt, both or neither by case | PHAP_CHE + KHTC written decision |
| `LEGAL-04` | BBNT/payment evidence | Which acceptance evidence is mandatory before payment request or payout | PHAP_CHE + KHTC + Audit checklist |
| `LEGAL-05` | Data privacy | Which fields are PII, bank data, voucher data or restricted legal evidence | PHAP_CHE + Audit data-classification table |
| `LEGAL-06` | Evidence retention | Retention period, storage location, redaction owner and retrieval rules | Audit + PHAP_CHE evidence-retention note |
| `LEGAL-07` | Role-based visibility | Who may see finance totals, source status, legal source and payment evidence | PHAP_CHE + IT_DATA access matrix |
| `LEGAL-08` | Waiver/exception | Who can sign unresolved legal/finance exceptions | BGH + PHAP_CHE waiver authority list |
| `LEGAL-09` | Bank/collateral | Legal boundary for phong toa, giai chap and bank instructions | PHAP_CHE + KHTC written scope boundary |
| `LEGAL-10` | AI/Codex boundary | What source data may be shared with AI/Codex | PHAP_CHE + Audit AI data-sharing rule |

## 6. Real Data Required List

Real data must stay in controlled storage outside Git/Codex/chat. Only redacted
labels, evidence IDs and owner decision IDs may be referenced here.

| ID | Real-data evidence required | Example redacted label | Owner | Stop if |
|---|---|---|---|---|
| `DATA-01` | Backup ID and restore smoke-check evidence | `BACKUP-EVID-001` | IT_DATA + Audit | Backup cannot be restored or target identity is unclear |
| `DATA-02` | Signed migration order | `MIG-ORDER-001` | IT_DATA + BGH + KHTC + PHAP_CHE | Any signer is missing |
| `DATA-03` | Role/scope UAT result for authorized and blocked users | `P6-04-UAT-001` | IT_DATA + owners | Out-of-scope user sees data |
| `DATA-04` | P2-10 collection invoice/chung-tu cases | `COLLECT-EVID-001` | KHTC + PHAP_CHE | Invoice/receipt rule is unclear |
| `DATA-05` | P2-13/P2-14 reconciliation exception examples | `RECON-EVID-001` | KHTC + Audit | Exception owner or correction path is missing |
| `DATA-06` | P2-15/P2-17 payment dossier and payout duplicate proof | `PAYOUT-EVID-001` | KHTC + Audit + BGH | Payment can proceed without complete dossier |
| `DATA-07` | P2-18 accounting dashboard source reconciliation | `DASH-EVID-001` | KHTC + BGH + Audit | Dashboard total differs without owner note |
| `DATA-08` | P5-03 Finance Desk browser UAT and reliance decision | `FD-UAT-EVID-001` | KHTC + BGH + Audit | Finance Desk is treated as production accounting |
| `DATA-09` | P6-03 audit-log trace samples | `AUDIT-EVID-001` | Audit + IT_DATA | User/action/source cannot be traced |
| `DATA-10` | Hard-delete/cascade conversion or written waiver | `CASCADE-EVID-001` | IT_DATA + Audit + owners | Finding remains open without owner waiver |

## 7. Missing List For Staff To Provide

| ID | Missing item | Owner to provide | Expected format |
|---|---|---|---|
| `MISS-01` | Real backup ID, restore target and smoke-check result | IT_DATA + Audit | Controlled evidence ID and signed result |
| `MISS-02` | Signed Step90-Step110 migration order | IT_DATA + KHTC + PHAP_CHE + BGH | Signed migration order reference |
| `MISS-03` | P0-19 legal/finance UAT result | PHAP_CHE + KHTC | Signed GO/NO-GO/BLOCKED row |
| `MISS-04` | P6-04 role/workspace UAT result with negative account | IT_DATA + process owners | Signed route matrix and result row |
| `MISS-05` | P2-18 accounting dashboard signed UAT | KHTC + BGH + Audit | Signed browser UAT and source reconciliation |
| `MISS-06` | P5-03 Finance Desk signed UAT and reliance decision | KHTC + BGH + Audit | Signed UAT, reliance decision and access closure |
| `MISS-07` | P2-17 payout duplicate and execution UAT | KHTC + BGH + Audit | Signed payout UAT and duplicate proof |
| `MISS-08` | P6-03 audit-log signed UAT | Audit + IT_DATA | Signed audit-log trace sample |
| `MISS-09` | P6-06 cascade conversion or waiver | IT_DATA + Audit + owners | Conversion evidence or written waiver |
| `MISS-10` | Final owner GO/NO-GO | BGH + accountable owners | Owner decision manifest outside Codex/chat |

## 8. Uncertain List For Staff To Confirm Or Correct

| ID | Uncertain point | Current safe assumption | Who must confirm |
|---|---|---|---|
| `UNCERTAIN-01` | Is TTGDTX Phu Xuyen only an example or the first official pilot? | Treat as example/template until owner names official pilot scope | BGH + KHTC + IT_DATA |
| `UNCERTAIN-02` | Which collection cases require tax invoice, internal receipt or both? | Do not auto-issue invoice or mark collection final | KHTC + PHAP_CHE |
| `UNCERTAIN-03` | Are phong toa/giai chap bank/collateral operations in HEU v1? | Treat as metadata-only and blocked from bank instruction | KHTC + PHAP_CHE + BGH |
| `UNCERTAIN-04` | Is HOU ledger/handover in phase 1? | Treat as gap pack/read-only until HOU owner signs scope | HOU owner + KHTC + BGH |
| `UNCERTAIN-05` | Is Short Course attendance/payment in phase 1? | Treat as gap pack/read-only until process owners sign scope | DAO_TAO + CTHSSV + KHTC |
| `UNCERTAIN-06` | Which BGH/KHTC dashboards are relied on for decisions? | Dashboard stays advisory/read-only | BGH + KHTC |
| `UNCERTAIN-07` | Which fields are authoritative student/class/program master data? | Do not merge or rename production data | IT_DATA + process owners |
| `UNCERTAIN-08` | Which roles may see source/legal/payment evidence? | Restrict to minimum role/workspace scope | PHAP_CHE + IT_DATA + Audit |
| `UNCERTAIN-09` | Who signs unresolved exception waivers? | Keep exception as BLOCKED until authority is confirmed | BGH + PHAP_CHE + Audit |
| `UNCERTAIN-10` | Can AI/Codex read any real workbook, bank statement, voucher or PII? | No; only redacted labels and summaries are allowed | PHAP_CHE + Audit + IT_DATA |

## 9. Staff Confirmation Template

Copy one row per decision into the controlled evidence system, not Git/Codex/chat.

| Confirmation ID | Related ID | Owner | Decision `READY / NO_GO / BLOCKED` | Evidence ID | Correction or missing data | Signer/date |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## 10. Stop Conditions

Mark the register `NO_GO` or `BLOCKED` when any of these happen:

- Real backup/restore evidence is missing or untested.
- Any UAT result is unsigned.
- Any finance, legal, evidence, access or owner decision is only described in
  chat.
- Any raw PII, CCCD, bank data, voucher, password, temporary password, OTP,
  reset link, invite link, service-role key or screenshot with secrets appears
  in Git/Codex/chat.
- Any user can see data outside role/workspace scope.
- Any dashboard or Finance Desk output is treated as statutory accounting,
  voucher posting, bank instruction, payment approval or production reliance.

## 11. Current Conclusion

Current conclusion: `NO_GO` for production. The build may continue only as
PASS_LOCAL control work, UAT support, read-only reporting, confirmation
registers and audit guards until real owners provide the missing confirmations
above.
