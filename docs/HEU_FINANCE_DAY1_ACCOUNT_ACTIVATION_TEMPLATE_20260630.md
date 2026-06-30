# HEU Finance Day-1 Account Activation Handoff Template 2026-06-30

Status: PASS_LOCAL_TEMPLATE
Scope: Controlled handoff for activating real-accounting Day-1 account labels
Production status: NO-GO until signed UAT, evidence acceptance and final owner GO exist

## 1. Purpose

Use this template outside Git/Codex/chat before any real-accounting user opens
P2-18, P5-03 or P2-17. It gives IT_DATA, ADMIN and the process owner one place
to record whether each approved account label has been invited, linked to a HEU
profile, scoped narrowly and checked through P6-04.

Run one activation row at a time from `FIN-USER-01` through `FIN-USER-05`.
Do not activate or open the next lane until the prior lane has controlled
result evidence and P0-17 access closure where required.

This template does not create accounts, send invites, store passwords, reset
credentials, approve access, accept UAT, approve finance reliance, initiate bank
instructions, accept evidence or mark production GO.

## 2. Secret Boundary

Never paste or attach the following in Git, Codex/chat, screenshots or
uncontrolled notes:

- Passwords, temporary passwords, OTPs, reset links or account invite/activation
  links.
- Service-role keys, database URLs, backup dumps, private connection strings or
  browser session tokens.
- Raw identity screenshots, CCCD, phone numbers, raw email inbox screenshots,
  bank accounts, vouchers, bank statements or private contract bodies.

Record only redacted account labels and controlled evidence IDs.

## 3. Start Gates Before Any Invite/Create

No invite, create or activation row may start until the start-gate decision is
`FIN_START_READY / NO_GO / BLOCKED`. If any gate is missing, keep the first
real-accounting account closed and record `NO_GO/BLOCKED`.

| Gate | Owner | Required proof | Stop condition |
|---|---|---|---|
| FIN-START-01 P0-03 backup/restore evidence accepted | IT_DATA + Audit | Backup ID, restore target, operator run sheet, preflight/postflight and restore smoke-check evidence controlled outside Git/Codex/chat | Any real-accounting invite/create starts before P0-03 evidence is accepted |
| FIN-START-02 Signed finance UAT route package ready | KHTC + BGH + IT_DATA + Audit | P6-04, P2-18, P5-03, P6-03 and P2-17 route evidence plan signed or explicitly `NO_GO/BLOCKED` | Finance Day-1 starts while signed UAT route evidence is missing, ownerless or stored only in Git/Codex/chat |
| FIN-START-03 P0-10 controlled evidence location ready | IT_DATA + Audit | Controlled evidence location, redaction reviewer and forbidden-content checklist | Raw PII, CCCD, bank data, vouchers, passwords, OTPs, reset links or invite links enter Git/Codex/chat |
| FIN-START-04 P0-14/P0-17 result and access-closure path ready | IT_DATA + Audit + KHTC | P0-14 intake ledger, Finance Day-1 result ledger and per-lane P0-17 access closure lanes | Activation starts without a result-ledger row path or per-lane access closure decision path |
| FIN-START-05 Human owner boundary acknowledged | BGH + KHTC + PHAP_CHE + Audit + IT_DATA | Owners acknowledge PASS_LOCAL does not approve access, UAT, finance reliance, migration, owner GO or production GO | Any operator treats this template as approval to create accounts, grant access, accept UAT, move money or mark production GO |

Decision value: `FIN_START_READY / NO_GO / BLOCKED`.

## 4. Activation Handoff Rows

| Evidence ID | Rollout order | Account label | Owner | Entry gate | Advance gate | Auth state | Profile link state | Scope state | P6-04 pre-login result | Decision | Stop note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `FIN-ACT-EVID-001` | `FIN-USER-01` | `REAL_KHTC_TTGDTX_OPERATOR_01` | KHTC + IT_DATA | Start first after `FIN_START_READY`, owner approval and before any other real-accounting lane opens | Do not open `FIN-USER-02` until result evidence and P0-17 closure exist | `INVITED / ACTIVE / BLOCKED` | `PROFILE_LINKED / BLOCKED` | Assigned TTGDTX finance scope only | `ALLOWED / NO_GO / BLOCKED` | `FIN_ACTIVATION_READY / NO_GO / BLOCKED` | No unrestricted totals, payout action or source evidence outside scope |
| `FIN-ACT-EVID-002` | `FIN-USER-02` | `REAL_BGH_READONLY_01` | BGH + IT_DATA | Open after `FIN-USER-01` is closed | Do not open `FIN-USER-03` until result evidence and P0-17 closure exist | `INVITED / ACTIVE / BLOCKED` | `PROFILE_LINKED / BLOCKED` | Read-only BGH scope only | `READ_ONLY / NO_GO / BLOCKED` | `FIN_ACTIVATION_READY / NO_GO / BLOCKED` | No entry, approve, pay, edit, grant access or GO action |
| `FIN-ACT-EVID-003` | `FIN-USER-03` | `REAL_AUDIT_READONLY_01` | Audit + IT_DATA | Open after `FIN-USER-02` is closed | Do not open `FIN-USER-04` until result evidence and P0-17 closure exist | `INVITED / ACTIVE / BLOCKED` | `PROFILE_LINKED / BLOCKED` | Read-only audit/evidence scope only | `READ_ONLY / NO_GO / BLOCKED` | `FIN_ACTIVATION_READY / NO_GO / BLOCKED` | No money movement, role grant, fact mutation or redaction bypass |
| `FIN-ACT-EVID-004` | `FIN-USER-04` | `REAL_PHAP_CHE_REVIEW_01` | PHAP_CHE + IT_DATA | Open after `FIN-USER-03` is closed | Do not open `FIN-USER-05` until result evidence and P0-17 closure exist | `INVITED / ACTIVE / BLOCKED` | `PROFILE_LINKED / BLOCKED` | Legal/source review scope only | `LEGAL_REVIEW_ONLY / NO_GO / BLOCKED` | `FIN_ACTIVATION_READY / NO_GO / BLOCKED` | No unrestricted finance totals or private contract bodies outside approval |
| `FIN-ACT-EVID-005` | `FIN-USER-05` | `REAL_OUT_OF_SCOPE_NEGATIVE_01` | IT_DATA + Audit | Run before any department expansion | Do not expand beyond Finance Day-1 until blocked/empty result and P0-17 closure exist | `INVITED / ACTIVE / BLOCKED` | `PROFILE_LINKED / BLOCKED` | Negative-control scope only | `BLOCKED / EMPTY_SCOPED_STATE / NO_GO` | `FIN_ACTIVATION_READY / NO_GO / BLOCKED` | Stop if any TTGDTX finance, lead, source, dashboard, audit or settings data is visible |

## 5. Activation Checks

| Check | Required proof | Stop condition |
|---|---|---|
| FIN-ACT-01 Account label and owner are approved | Redacted account label, owner, department, role and TTGDTX partner/workspace scope | Account label missing, owner unclear, broad scope or not tied to Day-1 lane |
| FIN-ACT-02 Supabase Auth invite stays outside Codex | Controlled evidence ID for invite/create status and secure-channel confirmation | Password, temporary password, OTP, reset link, invite/activation link or service-role key enters Git/Codex/chat |
| FIN-ACT-03 HEU profile link is completed | Redacted users_profile link proof with display name, department, manager, role and active/inactive state | Profile missing, raw identity screenshot pasted or role mismatches approved lane |
| FIN-ACT-04 Business scope is assigned before login | Narrow segment, TTGDTX partner/workspace and lead visibility scope | Broad workspace, unrestricted finance visibility, payout action, source evidence or audit/settings access without owner approval |
| FIN-ACT-05 P6-04 pre-login route check is recorded | P6-04 route result and negative-control result with controlled evidence IDs | Route result missing, out-of-scope access visible, raw evidence or missing owner/redaction reviewer sign-off |

## 6. P6-04 Pre-Login Matrix Handoff

After the activation row is filled, use
`docs/HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md` to record the
allowed route family, blocked route family, expected result, actual result,
negative-control account denial and owner decision for each real-accounting
Day-1 label.

Decision value: `P6_04_PRELOGIN_READY / NO_GO / BLOCKED`.

Do not open P2-18, P5-03 or P2-17 if any P6-04 pre-login row is missing,
ownerless, raw, unsigned, `NO_GO/BLOCKED`, or if
`REAL_OUT_OF_SCOPE_NEGATIVE_01` can see protected finance, lead, source,
dashboard, audit, settings or evidence data.

## 7. Final Rule

Do not open P2-18, P5-03 or P2-17 with a real-accounting account until its
start gates are `FIN_START_READY`, its activation row is
`FIN_ACTIVATION_READY`, the P6-04 pre-login result is recorded and all stop
conditions are closed or marked `NO_GO/BLOCKED`.
Do not open the next `FIN-USER` lane until the prior lane has controlled result
evidence and P0-17 access closure.

Passing this template locally is not production approval. Production remains
NO-GO until signed owner evidence and final owner GO exist.
