# HEU Finance Day-1 P6-04 Pre-Login Matrix 2026-06-30

Status: PASS_LOCAL_TEMPLATE
Scope: P6-04 route/scope proof before any real-accounting Day-1 account opens P2-18, P5-03 or P2-17
Production status: NO-GO until signed UAT, evidence acceptance, access closure and final owner GO exist

## 1. Purpose

Use this matrix outside Git/Codex/chat after the Day-1 account activation
handoff and before any real-accounting user opens finance routes. It converts
P6-04 role/workspace proof into one controlled row per account label.

Run one pre-login row at a time from `FIN-USER-01` through `FIN-USER-05`.
Do not open the next lane until the prior lane has `P6_04_PRELOGIN_READY`,
controlled result evidence and P0-17 access closure where required.

This matrix does not create accounts, send invites, store passwords, grant
access, execute browser UAT, accept route evidence, approve finance reliance,
move money, approve access closure or mark production GO.

## 2. Secret Boundary

Never paste or attach passwords, temporary passwords, OTPs, reset links,
account invite/activation links, service-role keys, database URLs, browser
session tokens, raw identity screenshots, CCCD, bank accounts, vouchers, bank
statements, raw payment evidence or private contract bodies.

Record only redacted account labels, route-family names, controlled evidence
IDs, reviewer names and owner decision states.

## 3. Required Matrix Rows

Decision value: `P6_04_PRELOGIN_READY / NO_GO / BLOCKED`.

| Evidence ID | Rollout order | Account label | Owner | Entry gate | Advance gate | Allowed before finance login | Must be blocked before finance login | Required result | Decision | Stop note |
|---|---|---|---|---|---|---|---|---|---|---|
| `P6-04-PRELOGIN-EVID-001` | `FIN-USER-01` | `REAL_KHTC_TTGDTX_OPERATOR_01` | KHTC + IT_DATA + Audit | Start after `FIN_ACTIVATION_READY` for `FIN-USER-01` | Do not open `FIN-USER-02` until pre-login result, result evidence and P0-17 closure exist | P6-04 scope proof, P2-10, P2-13, P2-17, P2-18 and P5-03 inside assigned TTGDTX finance scope only | Unassigned partner/workspace, unrestricted dashboard totals, hidden raw evidence, admin settings and out-of-scope lead data | `ALLOWED` inside assigned TTGDTX scope only | `P6_04_PRELOGIN_READY / NO_GO / BLOCKED` | Stop if route opens before P6-04 proof, scope is broad, payout action is available outside approval or evidence is raw/unsigned |
| `P6-04-PRELOGIN-EVID-002` | `FIN-USER-02` | `REAL_BGH_READONLY_01` | BGH + IT_DATA + Audit | Open after `FIN-USER-01` is closed | Do not open `FIN-USER-03` until pre-login result, result evidence and P0-17 closure exist | P6-04 scope proof plus read-only P2-18, P5-03 and Master Control review routes | Daily entry, payment execution, source evidence edit, role grant, owner GO action and raw sensitive evidence | `READ_ONLY` or `BLOCKED` where write/action is attempted | `P6_04_PRELOGIN_READY / NO_GO / BLOCKED` | Stop if BGH can create, approve, pay, edit evidence, grant scope or mark production GO |
| `P6-04-PRELOGIN-EVID-003` | `FIN-USER-03` | `REAL_AUDIT_READONLY_01` | Audit + IT_DATA | Open after `FIN-USER-02` is closed | Do not open `FIN-USER-04` until pre-login result, result evidence and P0-17 closure exist | P6-04 scope proof plus read-only audit, redacted evidence review, P2-18 and P5-03 traceability checks | Money movement, role grant, source fact mutation, redaction bypass and raw secret/PII evidence | `READ_ONLY` with redacted evidence references only | `P6_04_PRELOGIN_READY / NO_GO / BLOCKED` | Stop if Audit can mutate finance facts, bypass redaction, grant access, move money or see secrets outside approved evidence class |
| `P6-04-PRELOGIN-EVID-004` | `FIN-USER-04` | `REAL_PHAP_CHE_REVIEW_01` | PHAP_CHE + IT_DATA + KHTC | Open after `FIN-USER-03` is closed | Do not open `FIN-USER-05` until pre-login result, result evidence and P0-17 closure exist | P6-04 scope proof plus P0-19 legal/source/contract review inside approved legal scope | Unrestricted finance totals, payout action, dashboard reliance, private contract bodies and non-approved source evidence | `LEGAL_REVIEW_ONLY` or `BLOCKED` outside approved legal scope | `P6_04_PRELOGIN_READY / NO_GO / BLOCKED` | Stop if legal review exposes unrestricted finance totals, private contract bodies or payment execution without written owner approval |
| `P6-04-PRELOGIN-EVID-005` | `FIN-USER-05` | `REAL_OUT_OF_SCOPE_NEGATIVE_01` | IT_DATA + Audit | Run before any department expansion | Do not expand beyond Finance Day-1 until blocked/empty result and P0-17 closure exist | Login and blocked or empty scoped state only, with P6-04 negative-control result recorded | Any TTGDTX finance, lead, source, dashboard, audit, settings, evidence or payout data | `BLOCKED` or `EMPTY_SCOPED_STATE` | `P6_04_PRELOGIN_READY / NO_GO / BLOCKED` | Stop if the negative-control account sees any protected route, row, total, evidence link, audit row or settings data |

## 4. Required Fields

| Field | Required value | Forbidden content |
|---|---|---|
| Evidence ID | Stable controlled evidence ID such as `P6-04-PRELOGIN-EVID-001` | Raw screenshot, password, OTP, invite/reset link or service-role key |
| Rollout order | `FIN-USER-01` through `FIN-USER-05`, matching the approved Day-1 account lane | Skipped lane, parallel lane opening or department expansion before closure |
| Entry gate | Gate condition that allowed the lane to open, including prior-lane closure where required | Ownerless entry, missing activation row or unrecorded prior result |
| Advance gate | Condition that must be met before opening the next `FIN-USER` lane or expanding beyond Finance Day-1 | Next-lane access, broad pilot scope or department expansion before result and closure |
| Account label | Redacted label from the Day-1 approved list | Real email screenshot, private identity file or unrestricted account profile |
| Profile and scope | Role, department, manager, segment and TTGDTX partner/workspace scope | Broad admin scope, hidden workspace scope or private connection string |
| Route family | P6-04, P2-10, P2-13, P2-17, P2-18, P5-03, P0-19, audit or settings check | Unapproved route, bank instruction, migration route or hidden admin action |
| Expected result | `ALLOWED`, `READ_ONLY`, `LEGAL_REVIEW_ONLY`, `BLOCKED` or `EMPTY_SCOPED_STATE` | Ownerless pass, implied production GO or unsigned finance reliance |
| Actual result | Redacted route result with variance note if any | Raw PII, CCCD, bank data, voucher body, private contract body or unrestricted totals leak |
| Owner decision | `P6_04_PRELOGIN_READY`, `NO_GO` or `BLOCKED` | Access approval, UAT acceptance, finance approval or production GO without signed owner evidence |
| Sign-off | Operator, checker, process owner and redaction reviewer outside Git/Codex/chat | Secret material, raw identity evidence or uncontrolled screenshots |

## 5. Final Rule

Do not open P2-18, P5-03 or P2-17 with a real-accounting account until its
activation row is `FIN_ACTIVATION_READY`, its P6-04 pre-login row is
`P6_04_PRELOGIN_READY`, and the out-of-scope negative account is `BLOCKED` or
`EMPTY_SCOPED_STATE`.
Do not open the next `FIN-USER` lane until the prior lane has controlled result
evidence and P0-17 access closure.

Passing this template locally is not production approval. Production remains
NO-GO until signed owner evidence, P0-17 access closure, required UAT evidence
and final owner GO exist.
