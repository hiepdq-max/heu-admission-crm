# HEU User Pilot 007 Secure Env Handoff

Task ID: HEU-USER-PILOT-007-SECURE-ENV-HANDOFF
Date: 2026-07-09
Repository: heu-admission-crm
Branch: codex/heu/user-secure-env-handoff
Status: PASS_LOCAL_HANDOFF
Production status: NO-GO

## 1. Purpose

Prepare the safe local handoff needed before live user-create and
permission/scope checks can run.

Current local blockers:

- `check:heu-user-create-readiness` returns `NO_GO USER-CREATE-ENV`.
- `check:heu-permission-scope-readiness` returns `NO_GO PERMISSION-SCOPE-ENV`.

This handoff does not provide or store secrets. It tells IT_DATA how to prepare
the local environment without pasting secrets into Git, Codex, chat, screenshots
or PR descriptions.

## 2. Required Local Env Names

The live checks require these env names to exist in the approved local runtime:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Do not write the values in this document.

## 3. Allowed Handling

IT_DATA may:

- Create or update `.env.local` only on the local machine.
- Keep `.env.local` untracked and outside commits.
- Run the live checks only after confirming the current branch and worktree.
- Rotate any key if it was pasted into Git, Codex, chat, screenshot or email.

IT_DATA must not:

- Paste env values into Codex, Git, PR body, issue comment or chat.
- Commit `.env`, `.env.local`, screenshots with keys or copied terminal output
  that includes secret values.
- Send `SUPABASE_SERVICE_ROLE_KEY` through uncontrolled email, messenger or
  shared docs.
- Use production keys for unrelated broad checks.

## 4. Safe Operator Commands

These commands are safe because they print only booleans, file state or checker
status. They must not print secret values.

```powershell
Set-Location -LiteralPath "D:\Web app HEU\heu-admission-crm"
git status --short --branch
Test-Path .\.env.local
git check-ignore .env.local
npm.cmd run check:heu-user-pilot-secure-env-handoff-readiness
```

After IT_DATA confirms `.env.local` exists locally and remains ignored, run live
checks from the app root:

```powershell
npm.cmd run check:heu-user-create-readiness
npm.cmd run check:heu-permission-scope-readiness
```

Expected outcome before real pilot users:

- If env is missing: checks remain `NO_GO` and no user action is allowed.
- If env exists but owner data is incomplete: checks may still return `NO_GO`.
- A green local env check does not approve user activation, UAT, finance action
  or production.

## 5. Required Review Before Live Use

| Gate | Reviewer | Required evidence | Current state |
|---|---|---|---|
| `ENV-HANDOFF-01` | IT_DATA | `.env.local` exists locally and is ignored | `NO_GO_UNTIL_LOCAL_CONFIRM` |
| `ENV-HANDOFF-02` | IT_DATA | Required env names are present without printing values | `NO_GO_UNTIL_LOCAL_CONFIRM` |
| `ENV-HANDOFF-03` | Audit | No secret value appears in Git/Codex/chat/PR | `PASS_LOCAL_RULE` |
| `ENV-HANDOFF-04` | IT_DATA + Audit | Live checks are rerun and results recorded by status only | `NO_GO_UNTIL_RERUN` |
| `ENV-HANDOFF-05` | Owner lane | Result does not imply activation approval | `PASS_LOCAL_RULE` |

## 6. Link To User Pilot Stack

This handoff supports these earlier slices:

- `HEU-USER-PILOT-002-IDENTITY-SCOPE-DAY1-RUNBOOK`
- `HEU-USER-PILOT-003-IDENTITY-SCOPE-PRECHECK-LEDGER`
- `HEU-USER-PILOT-004-SCOPE-SAVE-GUARD-MINIMAL-FIX`
- `HEU-USER-PILOT-005-OPERATION-CUTOVER-READINESS-CHECKER`
- `HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS`

## 7. AI Boundary

AI/Codex may:

- Verify this handoff exists and does not contain secret values.
- Summarize live check status as `PASS_LOCAL`, `CAN_SUA`, `NO_GO` or `BLOCKED`.
- Suggest the next safe local check.

AI/Codex must not:

- Ask the user to paste secrets.
- Read, print, summarize or store secret values.
- Create/invite users.
- Grant role, department, workspace or business scope.
- Accept evidence, approve UAT, approve owner GO/NO-GO or mark production GO.

## 8. Rollback

Rollback by reverting the PR that adds this handoff/checker.

No database rollback is required because this slice does not change Auth,
database rows, role/scope assignments, evidence storage, finance state,
automation config or production config.

## 9. SOP Slice Result Record

SOP-SCOPE:
- `HEU-USER-PILOT-007` wires a secure env handoff for live user checks.
- Scope is docs/control + read-only checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-user-pilot-secure-env-handoff-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns local `.env.local` handling.
- Audit owns secret-exposure review.
- Department owners own activation decisions after live checks.

SOP-LEGAL:
- No legal/UAT/evidence/owner approval is inferred.
- No restricted data is copied into Git/Codex/chat.

SOP-LOGIC:
- Env handoff can be `PASS_LOCAL` while live checks remain `NO_GO`.
- Live checks cannot proceed safely if env values are missing or exposed.

SOP-VERIFY:
- Checker must verify package alias, handoff tokens and no mutation APIs.

SOP-RESULT:
- `PASS_LOCAL` for secure env handoff wiring.
- `NO_GO` for live user activation until IT_DATA runs local env checks and owner
  review remains complete.
- `CAN_SUA` for IT_DATA + Audit review.

SOP-NEXT:
- IT_DATA reviews this handoff.
- Then IT_DATA runs `check:heu-user-create-readiness` and
  `check:heu-permission-scope-readiness` from approved local secure env.
