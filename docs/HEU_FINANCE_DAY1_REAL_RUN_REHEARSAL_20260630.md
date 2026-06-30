# HEU Finance Day-1 Real-Run Rehearsal 2026-06-30

Status: PASS_LOCAL_RUNBOOK
Scope: Finance Day-1 rehearsal for real-accounting user labels after signed UAT readiness
Production status: NO-GO until backup/restore proof, signed UAT, migration approval, risk closure and final owner GO exist

## 1. Purpose

This runbook turns the Finance Day-1 checklist into an operator sequence for
the first controlled accounting rehearsal. It is used after the first signed
finance UAT package is ready, not before.

The rehearsal covers:

1. P0-17 secure account activation outside Codex/chat.
2. P6-04 role and workspace scope proof before first finance login.
3. P2-18 and P5-03 read-only dashboard confidence check.
4. P2-17 payout rehearsal with no bank action.
5. P0-17 access closure before expanding to another department.

This document is a local control artifact only. It does not create accounts,
send passwords, grant production access, execute UAT, initiate bank
instructions, accept evidence, approve dashboard reliance, approve finance
action, approve access closure, expand users, accept owner review or mark
production GO.

## 2. Safety Boundary

Do not paste or store any of the following in Git, Codex/chat, issue trackers,
screenshots or uncontrolled notes:

- Passwords, temporary passwords, OTPs, reset links or account invite links.
- Service-role keys, database URLs, backup dumps or private connection strings.
- Raw student identity data, CCCD, phone numbers, bank accounts, bank statements
  or raw vouchers.
- Unredacted screenshots of production users, payment data or private contract
  bodies.

Use redacted account labels such as `REAL_KHTC_TTGDTX_OPERATOR_01` and
controlled evidence IDs such as `FIN-DAY1-EVID-001`.

Use `docs/HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md` before
the first real-accounting login to record the secure invite/create state, HEU
profile link, narrow business scope and P6-04 pre-login result. Keep the filled
activation handoff outside Git/Codex/chat and reference only controlled evidence
IDs.

Use `docs/HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md` immediately
after activation and before opening P2-18, P5-03 or P2-17. The matrix records
the allowed route family, blocked route family, required result,
negative-control result and owner decision for each real-accounting Day-1 label.

## 3. Static Preflight

Run and record local pass/fail before the rehearsal:

```powershell
npm.cmd run audit:heu-user-account-security
npm.cmd run audit:heu-role-scope-uat-pack
npm.cmd run audit:ttgdtx-accounting-dashboard-uat-plan
npm.cmd run audit:ttgdtx-dashboard-source-reconciliation
npm.cmd run audit:heu-finance-desk
npm.cmd run audit:ttgdtx-payout-execution-readiness
npm.cmd run audit:ttgdtx-production-readiness-guard
npm.cmd run audit:ttgdtx-release-gates
```

If any command fails, stop and keep the Day-1 decision at `NO_GO` or `BLOCKED`.

## 4. Required Day-1 Accounts

| Account label | Owner | Expected route result | Stop condition |
|---|---|---|---|
| `REAL_KHTC_TTGDTX_OPERATOR_01` | KHTC + IT_DATA | Allowed only inside assigned TTGDTX finance scope | Sees unrestricted finance totals, payout action or source evidence outside approved scope |
| `REAL_BGH_READONLY_01` | BGH + IT_DATA | Read-only P2-18, P5-03 and Master Control | Can enter daily finance data, approve/pay, edit evidence or mark GO |
| `REAL_AUDIT_READONLY_01` | Audit + IT_DATA | Read-only audit, evidence and finance reliance review | Can move money, grant roles, mutate facts or bypass redaction |
| `REAL_PHAP_CHE_REVIEW_01` | PHAP_CHE + IT_DATA | Legal/source review only within approved scope | Sees unrestricted finance totals or private contract bodies outside approval |
| `REAL_OUT_OF_SCOPE_NEGATIVE_01` | IT_DATA + Audit | `BLOCKED` or `EMPTY_SCOPED_STATE` | Sees TTGDTX finance, lead, source, dashboard, audit or settings data |

## 5. P6-04 Pre-Login Route Matrix

Decision value: `P6_04_PRELOGIN_READY / NO_GO / BLOCKED`.

Use the matrix at
`docs/HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md` to record one row per
account label before any real-accounting user opens P2-18, P5-03 or P2-17.

| Account label | Allowed before finance login | Must be blocked before finance login | Required result |
|---|---|---|---|
| `REAL_KHTC_TTGDTX_OPERATOR_01` | P6-04 scope proof; P2-10, P2-13, P2-17, P2-18 and P5-03 inside assigned TTGDTX finance scope only | Unassigned partner/workspace, unrestricted dashboard totals, hidden raw evidence, admin settings and out-of-scope lead data | `ALLOWED` inside assigned TTGDTX scope only |
| `REAL_BGH_READONLY_01` | P6-04 scope proof plus read-only P2-18, P5-03 and Master Control review routes | Daily entry, payment execution, source evidence edit, role grant, owner GO action and raw sensitive evidence | `READ_ONLY` or `BLOCKED` where write/action is attempted |
| `REAL_AUDIT_READONLY_01` | P6-04 scope proof plus read-only audit, redacted evidence review, P2-18 and P5-03 traceability checks | Money movement, role grant, source fact mutation, redaction bypass and raw secret/PII evidence | `READ_ONLY` with redacted evidence references only |
| `REAL_PHAP_CHE_REVIEW_01` | P6-04 scope proof plus P0-19 legal/source/contract review inside approved legal scope | Unrestricted finance totals, payout action, dashboard reliance, private contract bodies and non-approved source evidence | `LEGAL_REVIEW_ONLY` or `BLOCKED` outside approved legal scope |
| `REAL_OUT_OF_SCOPE_NEGATIVE_01` | Login and blocked or empty scoped state only | Any TTGDTX finance, lead, source, dashboard, audit, settings, evidence or payout data | `BLOCKED` or `EMPTY_SCOPED_STATE` |

If any row is `NO_GO/BLOCKED`, or the negative-control account sees protected
data, do not open P2-18, P5-03 or P2-17 with real-accounting accounts.

## 6. Day-1 Execution Steps

| Step | Required action | Required proof | Decision |
|---|---|---|---|
| FIN-DAY1-01 | Activate or invite real-accounting users outside Codex/chat through the approved secure channel | Controlled evidence ID, redacted account label, HEU profile link and owner | `FIN_DAY1_READY / NO_GO / BLOCKED` |
| FIN-DAY1-02 | Run P6-04 route and scope checks before any finance total review | REAL-ACC route result with `ALLOWED`, `BLOCKED` or `EMPTY_SCOPED_STATE` | `FIN_DAY1_READY / NO_GO / BLOCKED` |
| FIN-DAY1-03 | Open P2-18 and P5-03 with approved users and compare totals to source workflows | Redacted screenshot ID, source reconciliation ID, read-only behavior result and reliance decision draft | `FIN_DAY1_READY / NO_GO / BLOCKED` |
| FIN-DAY1-04 | Rehearse P2-17 duplicate, overpay, voucher normalization, dossier and RPC-only controls without bank action | P2-17 release decision draft, duplicate/overpay result, dossier evidence ID and no-bank-instruction note | `FIN_DAY1_READY / NO_GO / BLOCKED` |
| FIN-DAY1-05 | Record P0-17 `ACCESS_RETAIN`, `REVOKE_OR_REDUCE` or `BLOCKED` before adding the next department | Access closure decision ID, owner sign-off state, reduced-scope note and soft-revoke/INACTIVE proof where needed | `FIN_DAY1_READY / NO_GO / BLOCKED` |

## 7. Day-1 Result Ledger

Create one result row per account label and route before expanding beyond the
first finance rehearsal. The ledger is a controlled-evidence index only; it
does not approve access, accept UAT, approve finance reliance, move money or
mark production GO.

Use the operator template at
`docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md` for the external
controlled ledger. Keep the filled version outside Git/Codex/chat and reference
only redacted evidence IDs here.

| Account label | Owner | Allowed route scope | Required result |
|---|---|---|---|
| `REAL_KHTC_TTGDTX_OPERATOR_01` | KHTC + IT_DATA | P2-10, P2-13, P2-17, P2-18 and P5-03 inside assigned TTGDTX scope only | `ALLOWED` only for approved finance work inside the assigned TTGDTX partner/workspace |
| `REAL_BGH_READONLY_01` | BGH + IT_DATA | Read-only P2-18, P5-03 and Master Control | `READ_ONLY`; no daily entry, payment execution, evidence edit or production GO action |
| `REAL_AUDIT_READONLY_01` | Audit + IT_DATA | Read-only audit, evidence and finance reliance review | `READ_ONLY`; audit/evidence visibility limited to approved redacted references |
| `REAL_PHAP_CHE_REVIEW_01` | PHAP_CHE + IT_DATA | Legal/source review only within approved scope | `LEGAL_REVIEW_ONLY`; finance totals and private contract bodies hidden unless approved |
| `REAL_OUT_OF_SCOPE_NEGATIVE_01` | IT_DATA + Audit | Login only; expected blocked or empty scoped state | `BLOCKED` or `EMPTY_SCOPED_STATE` |

| Ledger field | Required value | Forbidden content |
|---|---|---|
| Evidence ID | Stable controlled evidence ID such as `FIN-DAY1-EVID-001` | Raw screenshots, passwords, temporary passwords, OTPs, reset links or invite links |
| Account label | Redacted account label from the approved Day-1 lane list | Password, invite link, reset link, OTP, real email screenshot or unrestricted identity data |
| Profile/scope | Role, department, segment and TTGDTX partner/workspace scope | Broad admin scope, service-role key, database URL or private connection string |
| Route | P6-04, P2-18, P5-03, P2-17 or P0-17 closure route | Unapproved production migration, bank action, source mutation or hidden admin route |
| Expected result | `ALLOWED`, `READ_ONLY`, `LEGAL_REVIEW_ONLY`, `BLOCKED`, `EMPTY_SCOPED_STATE`, `NO_GO` or `BLOCKED_PENDING_OWNER_SIGNOFF` | Ownerless pass, implied production GO or unsigned finance reliance |
| Actual result | Browser/operator result with redacted evidence reference and variance note if any | Raw PII, CCCD, bank data, voucher body, private contract body or unrestricted totals leak |
| Owner decision | `FIN_DAY1_RESULT_READY`, `NO_GO` or `BLOCKED` | UAT acceptance, dashboard reliance, finance approval, access approval or production GO without signed owner evidence |
| Access closure | `ACCESS_RETAIN`, `REVOKE_OR_REDUCE` or `BLOCKED` for each Day-1 account | Broad temporary pilot access after `NO_GO/BLOCKED` or unsigned owner decision |
| Sign-off | Operator, checker, process owner and redaction reviewer outside Git/Codex/chat | Password, OTP, invite/reset link, service-role key, raw identity file or bank credential |

## 8. Result Template

| Field | Required value |
|---|---|
| Evidence ID | Stable controlled evidence ID, for example `FIN-DAY1-EVID-001` |
| Rehearsal date | Local date and operator name outside Codex/chat |
| Account label | Redacted label only; no real email screenshot, password or invite link |
| Scope | Role code, department, segment and TTGDTX partner/workspace label |
| Route | P6-04, P2-18, P5-03, P2-17 or P0-17 closure route |
| Expected result | `ALLOWED`, `BLOCKED`, `EMPTY_SCOPED_STATE`, `NO_GO` or `BLOCKED_PENDING_OWNER_SIGNOFF` |
| Actual result | Browser/operator result with redacted evidence reference |
| Owner decision | `FIN_DAY1_READY`, `NO_GO` or `BLOCKED` |
| Access closure | `ACCESS_RETAIN`, `REVOKE_OR_REDUCE` or `BLOCKED` |
| Sign-off | Operator, checker, process owner and redaction reviewer outside Codex/chat |

## 9. Final Rule

Do not expand from finance to the next department until FIN-DAY1-01 through
FIN-DAY1-05 are recorded, all stop conditions are closed or explicitly marked
`NO_GO/BLOCKED`, and the P0-17 access closure decision exists for every Day-1
account label.

Passing this runbook locally is not production approval. Production remains
NO-GO until the required external evidence and owner signatures exist.
