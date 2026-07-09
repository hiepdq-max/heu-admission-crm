# HEU User Pilot 008 Live Check Result Ledger

Task ID: HEU-USER-PILOT-008-LIVE-CHECK-RESULT-LEDGER
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/user-live-check-result-ledger
Status: PASS_LOCAL_LEDGER
Production status: NO-GO

## 1. Purpose

Record status-only live-check results for the live user-create and permission/scope checks
without exposing `.env.local`, Supabase keys, user names, emails, raw IDs,
passwords, invite links or evidence contents.

This ledger exists because HEU-USER-PILOT-007 confirmed the safe env handoff is
needed before live checks can run.

## 2. Current Safe Preflight Snapshot

Latest safe preflight, run without reading secret values:

```text
env_local_exists=False
```

Current live-check blocker:

```text
USER-CREATE-ENV=NO_GO
PERMISSION-SCOPE-ENV=NO_GO
LIVE_USER_ENV_READY=NO_GO_UNTIL_IT_DATA_LOCAL_CONFIRM
```

This means real user activation remains blocked.

## 3. Required Live Check Commands

Run these only after IT_DATA confirms `.env.local` exists locally, remains
ignored, and values were not pasted into Git/Codex/chat:

```powershell
npm.cmd run check:heu-user-create-readiness
npm.cmd run check:heu-permission-scope-readiness
```

Do not run migration, deploy, `npm install`, `npm ci`, Supabase push or paid
automation as part of this ledger.

## 4. Result Ledger

Record statuses only. Do not copy raw output if it contains any secret or raw
profile detail.

| Check | Last local result | Allowed values | Meaning |
|---|---|---|---|
| `check:heu-user-create-readiness` | `NO_GO_ENV_NOT_READY` | `PASS_LOCAL`, `CAN_SUA`, `NO_GO`, `BLOCKED` | Auth/user-create readiness status only |
| `check:heu-permission-scope-readiness` | `NO_GO_ENV_NOT_READY` | `PASS_LOCAL`, `CAN_SUA`, `NO_GO`, `BLOCKED` | Permission/scope readiness status only |
| `.env.local` local presence | `NO_GO_ENV_NOT_READY` | `PASS_LOCAL`, `NO_GO`, `BLOCKED` | File exists locally and is ignored, without printing values |
| Secret exposure review | `PASS_LOCAL_NO_SECRET_VALUE_RECORDED` | `PASS_LOCAL`, `NO_GO`, `BLOCKED` | No key/value, JWT-like token, password, invite/reset link or raw ID is in this ledger |
| User activation readiness | `NO_GO_ENV_NOT_READY` | `PASS_LOCAL`, `CAN_SUA`, `NO_GO`, `BLOCKED` | Activation remains blocked until env, owner and negative-access gates are green |

## 5. Evidence Rules

Allowed evidence in this ledger:

- Command name.
- Status only: `PASS_LOCAL`, `CAN_SUA`, `NO_GO`, `BLOCKED`.
- Safe blocker code, for example `USER-CREATE-ENV` or
  `PERMISSION-SCOPE-ENV`.
- Controlled evidence ID after Audit approves the redacted reference.

Forbidden evidence in this ledger:

- Env value or `KEY=value` assignment.
- Supabase URL value, publishable key value or service-role key value.
- Real name, email, phone, CCCD, raw profile ID or Auth user ID.
- Password, temporary password, OTP, password reset link or account
  activation/invite link.
- Screenshot or terminal output containing secret values.

## 6. Gate Before Any Real User Activation

| Gate | Required state before activation | Current state |
|---|---|---|
| `LIVE-CHECK-01` | `.env.local` exists locally and is ignored | `NO_GO_ENV_NOT_READY` |
| `LIVE-CHECK-02` | `check:heu-user-create-readiness` is not `NO_GO` because of env | `NO_GO_ENV_NOT_READY` |
| `LIVE-CHECK-03` | `check:heu-permission-scope-readiness` is not `NO_GO` because of env | `NO_GO_ENV_NOT_READY` |
| `LIVE-CHECK-04` | IT_DATA + Audit confirm no secret exposure | `PASS_LOCAL_RULE` |
| `LIVE-CHECK-05` | Owner lanes accept worksheet/cutover status | `NO_GO_OWNER_REVIEW_PENDING` |

## 7. Link To User Pilot Stack

This ledger follows:

- `HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS`
- `HEU-USER-PILOT-007-SECURE-ENV-HANDOFF`

It supports:

- `check:heu-user-create-readiness`
- `check:heu-permission-scope-readiness`
- `check:heu-user-activation-worksheet-readiness`
- `check:heu-user-operation-cutover-readiness`

## 8. AI Boundary

AI/Codex may:

- Verify this ledger has status-only results.
- Summarize `PASS_LOCAL`, `CAN_SUA`, `NO_GO` or `BLOCKED`.
- Suggest the next safe local check.

AI/Codex must not:

- Ask for or display secret values.
- Read, print, summarize or store `.env.local`.
- Create/invite users.
- Grant role, department, workspace or business scope.
- Accept evidence, approve UAT, approve owner GO/NO-GO or mark production GO.

## 9. Rollback

Rollback by reverting the PR that adds this ledger/checker.

No database rollback is required because this slice does not change Auth,
database rows, role/scope assignments, evidence storage, finance state,
automation config or production config.

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-USER-PILOT-008` wires a live-check result ledger.
- Scope is docs/control + read-only checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-user-pilot-live-check-result-ledger-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns env/local live-check execution.
- Audit owns no-secret evidence review.
- Department owners own real activation decisions.

SOP-LEGAL:
- No legal/UAT/evidence/owner approval is inferred.
- No restricted data is copied into Git/Codex/chat.

SOP-LOGIC:
- Ledger can be `PASS_LOCAL` while live user activation remains `NO_GO`.
- A green checker does not create users or grant access.

SOP-VERIFY:
- Checker must verify package alias, result statuses, no secret material and no
  mutation APIs.

SOP-RESULT:
- `PASS_LOCAL` for live-check result ledger wiring.
- `NO_GO` for real user activation until IT_DATA local env and owner review pass.
- `CAN_SUA` for IT_DATA + Audit review.

SOP-NEXT:
- IT_DATA prepares `.env.local` through approved local secure channel.
- IT_DATA reruns the two live checks and updates this ledger with status only.
