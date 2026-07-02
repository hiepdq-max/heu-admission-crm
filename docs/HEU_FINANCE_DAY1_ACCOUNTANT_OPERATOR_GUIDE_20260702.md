# HEU Finance Day-1 Accountant Operator Guide 2026-07-02

Status: PASS_LOCAL_OPERATOR_GUIDE
Scope: First KHTC accountant read-only pilot for P5-03 Finance Desk and P2-18 accounting dashboard
Production status: NO-GO
Decision value: `FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED`

This guide is the practical Day-1 checklist for the first KHTC accountant who
reviews TTGDTX finance data in HEU. It is a read-only operating guide. It does
not create accounts, send invites, store passwords, grant access, execute UAT,
accept evidence, approve finance reliance, approve access closure, post
vouchers, move money, issue bank instructions or mark production GO.

## 1. Start Conditions

Do not start the accountant pilot unless all conditions below are ready in the
controlled evidence location outside Git/Codex/chat.

| Check ID | Required proof | Owner | Stop if missing |
|---|---|---|---|
| `FIN-ACCT-GUIDE-01` | P0-03 backup/restore proof and operator run sheet are accepted | IT_DATA + Audit | Backup/restore proof is unsigned, stale, untested or only described in chat |
| `FIN-ACCT-GUIDE-02` | P6-04 role/workspace scope and pre-login matrix are ready for the assigned accountant label | IT_DATA + KHTC | Role, department, segment or TTGDTX scope is broad or unsigned |
| `FIN-ACCT-GUIDE-03` | Finance Day-1 activation and start gate are ready | IT_DATA + KHTC + Audit | `FIN_ACTIVATION_READY`, `P6_04_PRELOGIN_READY` or `FIN_START_READY` is missing |
| `FIN-ACCT-GUIDE-04` | P2-18 dashboard and P5-03 Finance Desk are both read-only | KHTC + IT_DATA | Any create, update, approve, pay, import-write, source-edit, voucher-posting or bank-instruction control is visible |
| `FIN-ACCT-GUIDE-05` | Negative account proof is ready | IT_DATA + Audit | Out-of-scope account is not `BLOCKED` or `EMPTY_SCOPED_STATE` |

## 2. What The Accountant Can Do

The assigned KHTC accountant may:

1. Open `/finance-desk` inside the approved TTGDTX scope.
2. Review receivable, collected, remaining-to-pay, issue and source status KPIs.
3. Open `/ttgdtx/accounting-dashboard` for comparison only.
4. Review `/ttgdtx/import` readiness and `/ttgdtx/source-control` status.
5. Record redacted result IDs in
   `docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md`.
6. Escalate mismatch, route, scope, source or access issues to the right owner.

The accountant must not edit HEU data from Finance Desk. Corrections must return
to the source P2 workflow with audit trail and owner note.

## 3. Daily Operator Flow

| Step | Operator action | Expected result | Stop condition |
|---|---|---|---|
| `FIN-ACCT-STEP-01` | Confirm the login account is the assigned redacted KHTC label | Account matches approved role, department, TTGDTX segment and workspace | Actual identity, password, invite link or OTP is pasted into Git/Codex/chat |
| `FIN-ACCT-STEP-02` | Open `/finance-desk` | Page opens with read-only gate, official-operation gate and accountant handoff visible | Page opens for an out-of-scope user or hides the read-only boundary |
| `FIN-ACCT-STEP-03` | Compare Finance Desk KPIs to `/ttgdtx/accounting-dashboard` | Totals match controlled P2-18 source or have an owner variance note | Material mismatch has no KHTC owner note or source correction path |
| `FIN-ACCT-STEP-04` | Compare import and source-control status | Import readiness, issue count and source-control status match source pages | Manual adjustment is made directly in Finance Desk |
| `FIN-ACCT-STEP-05` | Record result in the Day-1 result ledger | Ledger row has redacted evidence ID and access closure decision | Result ledger, P0-17 closure or owner decision is missing |

## 4. Escalation Rules

| Issue | Escalate to | Required operator note |
|---|---|---|
| Data variance | KHTC owner | Redacted evidence ID, source route and expected owner correction path |
| Route or workspace scope issue | IT_DATA | Account label, route, expected scope and observed leak or denial |
| Legal/source exception | PHAP_CHE | Redacted source reference and legal/source question |
| Access leak or hidden unrestricted data | Audit + IT_DATA | Stop immediately; record `BLOCKED` and request revoke/reduce decision |
| Missing signed owner/UAT evidence | BGH + KHTC + Audit | Mark `NO_GO` and do not expand beyond Day-1 |

## 5. Forbidden Content

Never paste or store these in HEU docs, Git, Codex or chat:

- Passwords, temporary passwords, OTPs, password reset links or invite links.
- Service-role keys, API keys, session tokens or browser cookies.
- Raw PII, CCCD, bank data, vouchers or screenshots with secrets.
- Unredacted student, partner, payment or source evidence bodies.

Only redacted evidence IDs and owner decision IDs are allowed in this guide,
the UAT runbook and implementation log.

## 6. Close The Day-1 Pilot

Close Day-1 as `FIN_ACCOUNTANT_GUIDE_READY` only when:

1. `/finance-desk` and `/ttgdtx/accounting-dashboard` stayed read-only.
2. Source comparison is reconciled or has KHTC owner variance notes.
3. Negative account proof is `BLOCKED` or `EMPTY_SCOPED_STATE`.
4. The Day-1 result ledger is filled with redacted evidence IDs.
5. P0-17 access closure is signed as
   `ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED`.

If any item is missing, mark `NO_GO` or `BLOCKED`. Do not expand to a second
accountant, do not rely on dashboard totals for production finance, and do not mark owner GO.
