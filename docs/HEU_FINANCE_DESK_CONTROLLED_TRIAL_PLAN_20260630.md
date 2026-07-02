# HEU Finance Desk Controlled Trial Plan 2026-06-30

Status: PASS_LOCAL_PLAN
Scope: P5-03 Finance Desk controlled trial for TTGDTX real-accounting user labels
Production status: NO-GO until signed UAT, evidence acceptance, access closure and final owner GO exist

## 1. Purpose

This plan prepares one controlled Finance Desk trial for TTGDTX accounting
users. It identifies which real-accounting user labels may log in, what each
label may view, what each label must not modify, and what evidence the UAT
operator must capture outside Git/Codex/chat.

Decision value: `P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED`.

This plan does not create accounts, send invites, store passwords, import real
data in bulk, auto gach no, run COM production calculation, execute payment,
accept UAT, approve finance reliance or mark production GO.

## 2. Required Preconditions

Complete these preconditions before opening `/finance-desk` with a
real-accounting user label:

- Use `docs/HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md` to record
  `FIN_START_READY / NO_GO / BLOCKED` with `FIN-START-EVID-001` through
  `FIN-START-EVID-005` before any controlled Finance Desk trial.
- Use `docs/HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md` to record
  secure account activation outside Git/Codex/chat.
- Use `docs/HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md` to record the
  P6-04 pre-login route and scope result.
- Cite the P6-04 real accounting user queue and result template with controlled
  evidence IDs only.
- Keep actual email addresses, passwords, temporary passwords, OTPs, invite
  links, reset links, raw identity screenshots, raw student PII, bank data,
  vouchers and payment evidence outside Git/Codex/chat.
- No bulk real-data import is allowed for this trial. Use the existing
  controlled route data and approved synthetic/redacted evidence references.
- Stop if any required precondition is missing, ownerless, unsigned, raw,
  `NO_GO` or `BLOCKED`.

## 2.1 Finance Safe Pilot Order

Decision value: `FIN_PILOT_READY / NO_GO / BLOCKED`.

Run the pilot in this exact order. Do not open the next step until the previous
step is recorded with controlled evidence outside Git/Codex/chat.

| Step | Required action | STOP condition |
|---|---|---|
| `FIN-PILOT-01` | Account owner creates or invites the real accounting account only through the approved secure channel outside Codex/chat | Any password, OTP, reset link, activation link, service-role key, raw PII, bank data or voucher appears in Codex/chat |
| `FIN-PILOT-02` | IT links the auth user to the HEU profile and grants only the approved role, workspace and TTGDTX partner scope | Role is broad, workspace scope is unclear, partner scope is missing or the negative account is not prepared |
| `FIN-PILOT-03` | Run the P6-04 route matrix before Finance Desk use, including `BLOCKED` or `EMPTY_SCOPED_STATE` proof for out-of-scope users | Any route leaks data, shows raw evidence, or lacks redacted controlled evidence and owner sign-off |
| `FIN-PILOT-04` | Open P2-18 accounting dashboard and P5-03 Finance Desk as read-only rehearsal surfaces only | The pilot can edit, approve, pay, post vouchers, issue bank instructions or treat dashboard totals as production reliance |
| `FIN-PILOT-05` | Record controlled evidence IDs, owner decision and `ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED` before adding any more users | Day-1 result ledger, P0-17 access closure, backup/restore proof or owner GO/NO-GO is missing |

This safe pilot order does not create accounts, send invites, store passwords,
grant access, execute UAT, accept evidence, approve finance reliance, approve
access closure, move money, issue bank instructions or mark production GO.

## 2.2 Finance Day-1 Accountant Handoff

Decision value: `FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED`.

The `/finance-desk` page exposes
`data-finance-day-one-accountant-handoff="P5-03_FIN_DAY1_OPERATOR"` for the
first KHTC accountant pilot. The handoff must be read before the operator uses
the cockpit.

The practical operator guide is
`docs/HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md` with decision
value `FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED`. It defines the first KHTC accountant start conditions, read-only steps, escalation rules, forbidden content and Day-1 closure before any expansion.
It covers `FIN-ACCT-GUIDE-01` through `FIN-ACCT-GUIDE-05` for the first KHTC
accountant start conditions.

| Handoff ID | Operator rule | STOP condition |
|---|---|---|
| `FIN-ACCT-HANDOFF-01` | KHTC accountant may view `/finance-desk`, `/ttgdtx/accounting-dashboard`, import readiness and source-control status inside assigned TTGDTX scope only | Any unrestricted total, out-of-scope partner, raw evidence body or hidden route appears |
| `FIN-ACCT-HANDOFF-02` | Finance actions stay blocked: no create, update, approve, pay, import-write, source-edit, voucher posting, period lock, bank instruction or production reliance | Any write control, approval control, payout control, bank-instruction path or voucher-posting path is visible |
| `FIN-ACCT-HANDOFF-03` | Data variance goes to KHTC owner, route/scope issue goes to IT_DATA, legal/source exception goes to PHAP_CHE, and access leak goes to Audit | The operator edits Finance Desk output directly, uses chat as evidence storage or resolves an exception without owner route |
| `FIN-ACCT-HANDOFF-04` | Controlled evidence IDs, result ledger and `ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED` must close before expanding to another user | Day-1 result ledger, P0-17 access closure, negative-account proof or owner decision is missing |

This accountant handoff does not create accounts, send invites, store passwords,
grant access, execute UAT, accept evidence, approve finance reliance, approve
access closure, post vouchers, move money, issue bank instructions or mark
production GO.

## 3. Real User Labels

Actual account identity must be recorded only in the external controlled
evidence location. Git/Codex/chat may store only the redacted labels below.

| Account label | Owner | Trial role | Required pre-login state | Trial decision |
|---|---|---|---|---|
| `REAL_KHTC_TTGDTX_OPERATOR_01` | KHTC + IT_DATA | TTGDTX accounting operator | `FIN_START_READY`, `FIN_ACTIVATION_READY` and `P6_04_PRELOGIN_READY` inside assigned TTGDTX finance scope only | `P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED` |
| `REAL_BGH_READONLY_01` | BGH + IT_DATA | Read-only management reviewer | `FIN_START_READY`, `FIN_ACTIVATION_READY` and `P6_04_PRELOGIN_READY`; no write or GO controls | `P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED` |
| `REAL_AUDIT_READONLY_01` | Audit + IT_DATA | Read-only trace/evidence reviewer | `FIN_START_READY`, `FIN_ACTIVATION_READY` and `P6_04_PRELOGIN_READY`; redacted evidence only | `P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED` |
| `REAL_PHAP_CHE_REVIEW_01` | PHAP_CHE + IT_DATA + KHTC | Legal/source reviewer | `FIN_START_READY`, `FIN_ACTIVATION_READY` and `P6_04_PRELOGIN_READY`; legal/source review scope only | `P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED` |
| `REAL_OUT_OF_SCOPE_NEGATIVE_01` | IT_DATA + Audit | Negative-control user | Login may occur only to prove `BLOCKED` or `EMPTY_SCOPED_STATE` | `P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED` |

## 4. Route Visibility And Read-Only Matrix

| Account label | Route family to test | May view | Must not modify |
|---|---|---|---|
| `REAL_KHTC_TTGDTX_OPERATOR_01` | `/finance-desk`, `/ttgdtx/accounting-dashboard`, import readiness, source-control summary and approved P2 source routes | Scoped receivable, collection, remaining-to-pay, issue counts, import status, source status and P2-17 rehearsal blockers inside assigned TTGDTX scope | Create/update finance facts, approve, pay, import-write, source-edit, unlock period, send bank instruction, auto gach no, run COM production calculation or mark GO |
| `REAL_BGH_READONLY_01` | `/finance-desk`, `/ttgdtx/accounting-dashboard` and Master Control read-only review | Read-only indicators, reliance blockers and owner-review status | Daily entry, payment execution, source edit, evidence edit, role grant, access closure approval or production GO |
| `REAL_AUDIT_READONLY_01` | `/finance-desk`, audit/evidence review and dashboard traceability checks | Read-only trace references, redacted evidence IDs and variance notes | Mutate finance facts, bypass redaction, grant roles, move money or view raw secrets outside approved evidence class |
| `REAL_PHAP_CHE_REVIEW_01` | Legal/source review routes plus scoped Finance Desk context where approved | Legal/source context and approved contract/source references | Unrestricted finance totals, private contract bodies outside approval, payout action, dashboard reliance or payment execution |
| `REAL_OUT_OF_SCOPE_NEGATIVE_01` | `/finance-desk` and protected TTGDTX route checks | `BLOCKED` or `EMPTY_SCOPED_STATE` only | Any TTGDTX finance, lead, source, dashboard, audit, settings, evidence, payout or owner-GO data |

## 5. UAT Read-Only Checklist

| Check ID | Required check | PASS condition | STOP condition |
|---|---|---|---|
| P5-03-TRIAL-01 | Confirm redacted account label and owner | Account label, owner, role, manager and TTGDTX scope are recorded outside Git/Codex/chat | Real email screenshot, password, OTP, invite/reset link or uncontrolled identity evidence is used |
| P5-03-TRIAL-02 | Confirm Day-1 start gate and P6-04 pre-login result | `FIN_START_READY`, `FIN_ACTIVATION_READY` and `P6_04_PRELOGIN_READY` exist for the account label and negative-control row | Missing start-gate checklist, route/scope proof, broad scope or unsigned owner decision |
| P5-03-TRIAL-03 | Open `/finance-desk` with KHTC scoped user | Scoped KPIs load and action links route back to source P2 screens | User sees unrestricted totals or Finance Desk can mutate facts |
| P5-03-TRIAL-04 | Verify read-only behavior | No create, update, approve, pay, import-write, source-edit, unlock or bank-instruction control appears | Any write, pay, approve, import or source edit control is available |
| P5-03-TRIAL-05 | Compare controlled sources | Finance Desk totals reconcile to P2-18 dashboard, import readiness and source-control summary with owner variance notes | Material mismatch lacks source P2 correction route or owner note |
| P5-03-TRIAL-06 | Run negative-control denial | `REAL_OUT_OF_SCOPE_NEGATIVE_01` is blocked or sees empty scoped state | Negative-control user sees protected TTGDTX finance, lead, source, dashboard, audit, settings, evidence or payout data |
| P5-03-TRIAL-07 | Check finance-action locks | Trial does not auto gach no, run COM production calculation, execute payment, issue bank instruction or import real data in bulk | Any money movement, COM finalization, auto debt clearing or bulk real import is attempted |
| P5-03-TRIAL-08 | Record evidence and result ledger | Evidence IDs, route results, variance notes, owner decision and access closure are recorded outside Git/Codex/chat | Raw PII, bank data, voucher body, payment evidence, password material or ownerless result enters the record |

## 6. Evidence To Capture

Use controlled evidence IDs only. Store filled evidence and screenshots outside
Git/Codex/chat.

| Evidence ID | Capture | Required content | Forbidden content |
|---|---|---|---|
| `P5-03-TRIAL-EVID-001` | Account label and scope proof | Redacted account label, role, department, TTGDTX scope and P6-04 pre-login decision | Passwords, OTPs, invite links, reset links, real email screenshots or service-role keys |
| `P5-03-TRIAL-EVID-002` | `/finance-desk` scoped load | Route, role label, scoped KPIs and no-write result | Raw student PII, bank accounts, vouchers, payment data or unrestricted totals leak |
| `P5-03-TRIAL-EVID-003` | Source reconciliation | P2-18, import readiness and source-control comparison result with variance owner note | Manual adjustment to Finance Desk output |
| `P5-03-TRIAL-EVID-004` | Negative-control denial | `BLOCKED` or `EMPTY_SCOPED_STATE` result for protected routes | Any visible protected TTGDTX route, row, total, evidence link or audit row |
| `P5-03-TRIAL-EVID-005` | Result and access closure | `P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED` plus `ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED` | Access approval, UAT acceptance, finance reliance or production GO without owner signatures |

## 7. Stop Conditions

Stop the trial and record `NO_GO` or `BLOCKED` when any of these occurs:

- The actual user identity is not approved by KHTC/IT_DATA or is recorded in
  Git/Codex/chat instead of controlled evidence.
- `docs/HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md` is missing,
  ownerless, unsigned, raw, `NO_GO` or `BLOCKED`.
- P6-04 pre-login proof is missing, broad, unsigned, raw, `NO_GO` or `BLOCKED`.
- A contract-only or out-of-scope user sees Finance Desk totals.
- Finance Desk exposes create, update, approve, pay, import-write, source-edit,
  unlock, bank-instruction or production GO controls.
- Any operator tries to bulk import real data, auto gach no, run COM production
  calculation, execute payment or mark paid.
- No auto gach no, no COM production calculation and no payment execution are
  allowed in this controlled trial.
- Evidence contains raw PII, CCCD, phone, bank data, voucher body, payment
  evidence, passwords, temporary passwords, OTPs, invite/reset links or keys.

## 8. Local Audit Commands

Run and record these local commands before reporting PASS_LOCAL:

```powershell
npm.cmd run audit:heu-finance-desk
npm.cmd run audit:heu-user-account-security
npm.cmd run audit:heu-role-scope-uat-pack
npm.cmd run audit:ttgdtx-accounting-dashboard-uat-plan
npm.cmd run audit:ttgdtx-dashboard-readonly-guard
npm.cmd run audit:ttgdtx-dashboard-source-reconciliation
npm.cmd run audit:ttgdtx-payout-duplicate-guard
npm.cmd run audit:ttgdtx-payout-execution-readiness
npm.cmd run audit:ttgdtx-production-readiness-guard
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run lint
npm.cmd run build
```

Passing these commands proves only local packaging quality. It does not approve
the trial result, UAT acceptance, finance action, evidence acceptance or
production GO.

## 9. Final Rule

Do not expand beyond the controlled Finance Desk trial until every required
account label has a controlled evidence row, the negative-control account is
blocked or empty-scoped, every stop condition is closed or marked
`NO_GO/BLOCKED`, and P0-17 access closure is recorded outside Git/Codex/chat.

Production remains NO-GO until signed owner evidence and final owner GO exist.
