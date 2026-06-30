# HEU Finance Day-1 Account Activation Handoff Template 2026-06-30

Status: PASS_LOCAL_TEMPLATE
Scope: Controlled handoff for activating real-accounting Day-1 account labels
Production status: NO-GO until signed UAT, evidence acceptance and final owner GO exist

## 1. Purpose

Use this template outside Git/Codex/chat before any real-accounting user opens
P2-18, P5-03 or P2-17. It gives IT_DATA, ADMIN and the process owner one place
to record whether each approved account label has been invited, linked to a HEU
profile, scoped narrowly and checked through P6-04.

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

## 3. Activation Handoff Rows

| Evidence ID | Account label | Owner | Auth state | Profile link state | Scope state | P6-04 pre-login result | Decision | Stop note |
|---|---|---|---|---|---|---|---|---|
| `FIN-ACT-EVID-001` | `REAL_KHTC_TTGDTX_OPERATOR_01` | KHTC + IT_DATA | `INVITED / ACTIVE / BLOCKED` | `PROFILE_LINKED / BLOCKED` | Assigned TTGDTX finance scope only | `ALLOWED / NO_GO / BLOCKED` | `FIN_ACTIVATION_READY / NO_GO / BLOCKED` | No unrestricted totals, payout action or source evidence outside scope |
| `FIN-ACT-EVID-002` | `REAL_BGH_READONLY_01` | BGH + IT_DATA | `INVITED / ACTIVE / BLOCKED` | `PROFILE_LINKED / BLOCKED` | Read-only BGH scope only | `READ_ONLY / NO_GO / BLOCKED` | `FIN_ACTIVATION_READY / NO_GO / BLOCKED` | No entry, approve, pay, edit, grant access or GO action |
| `FIN-ACT-EVID-003` | `REAL_AUDIT_READONLY_01` | Audit + IT_DATA | `INVITED / ACTIVE / BLOCKED` | `PROFILE_LINKED / BLOCKED` | Read-only audit/evidence scope only | `READ_ONLY / NO_GO / BLOCKED` | `FIN_ACTIVATION_READY / NO_GO / BLOCKED` | No money movement, role grant, fact mutation or redaction bypass |
| `FIN-ACT-EVID-004` | `REAL_PHAP_CHE_REVIEW_01` | PHAP_CHE + IT_DATA | `INVITED / ACTIVE / BLOCKED` | `PROFILE_LINKED / BLOCKED` | Legal/source review scope only | `LEGAL_REVIEW_ONLY / NO_GO / BLOCKED` | `FIN_ACTIVATION_READY / NO_GO / BLOCKED` | No unrestricted finance totals or private contract bodies outside approval |
| `FIN-ACT-EVID-005` | `REAL_OUT_OF_SCOPE_NEGATIVE_01` | IT_DATA + Audit | `INVITED / ACTIVE / BLOCKED` | `PROFILE_LINKED / BLOCKED` | Negative-control scope only | `BLOCKED / EMPTY_SCOPED_STATE / NO_GO` | `FIN_ACTIVATION_READY / NO_GO / BLOCKED` | Stop if any TTGDTX finance, lead, source, dashboard, audit or settings data is visible |

## 4. Activation Checks

| Check | Required proof | Stop condition |
|---|---|---|
| FIN-ACT-01 Account label and owner are approved | Redacted account label, owner, department, role and TTGDTX partner/workspace scope | Account label missing, owner unclear, broad scope or not tied to Day-1 lane |
| FIN-ACT-02 Supabase Auth invite stays outside Codex | Controlled evidence ID for invite/create status and secure-channel confirmation | Password, temporary password, OTP, reset link, invite/activation link or service-role key enters Git/Codex/chat |
| FIN-ACT-03 HEU profile link is completed | Redacted users_profile link proof with display name, department, manager, role and active/inactive state | Profile missing, raw identity screenshot pasted or role mismatches approved lane |
| FIN-ACT-04 Business scope is assigned before login | Narrow segment, TTGDTX partner/workspace and lead visibility scope | Broad workspace, unrestricted finance visibility, payout action, source evidence or audit/settings access without owner approval |
| FIN-ACT-05 P6-04 pre-login route check is recorded | P6-04 route result and negative-control result with controlled evidence IDs | Route result missing, out-of-scope access visible, raw evidence or missing owner/redaction reviewer sign-off |

## 5. P6-04 Pre-Login Matrix Handoff

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

## 6. Final Rule

Do not open P2-18, P5-03 or P2-17 with a real-accounting account until its
activation row is `FIN_ACTIVATION_READY`, the P6-04 pre-login result is recorded
and all stop conditions are closed or marked `NO_GO/BLOCKED`.

Passing this template locally is not production approval. Production remains
NO-GO until signed owner evidence and final owner GO exist.
