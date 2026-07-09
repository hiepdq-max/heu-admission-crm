# HEU User Pilot 003 Identity Scope Precheck Ledger 2026-07-09

Task ID: HEU-USER-PILOT-003-IDENTITY-SCOPE-PRECHECK-LEDGER
Repository: heu-admission-crm
Branch: codex/heu/user-pilot-identity-scope-day1
Status: DRAFT_CONTROL
Production status: NO-GO
Scope: docs/control precheck ledger and read-only checker only

## 1. Purpose

This ledger records the focused identity/scope precheck after PR #14 created
the Day-1 runbook.

Goal:

```text
Know whether HEU can safely start the 8-12 user Day-1 pilot.
Separate local PASS_LOCAL control checks from live Supabase/account blockers.
Name the smallest next blocker before creating real users or granting real scope.
```

This ledger does not create accounts, grant scope, handle passwords, run
migration, deploy, call paid automation, approve finance action, accept UAT,
accept evidence, approve owner GO/NO-GO or mark production GO.

## 2. Precheck Environment

| Item | Result |
|---|---|
| Worktree | `D:\Web app HEU\_codex_worktrees\heu-user-pilot-identity-scope-day1` |
| Branch | `codex/heu/user-pilot-identity-scope-day1` |
| Dependency handling | Local ignored `node_modules` junction only |
| Install command | Not run |
| Migration/deploy | Not run |
| Production data action | Not run |
| Secret handling | No secret printed; `.env.local` not copied into Git/Codex/chat |

## 3. Command Results

| Command | Result | Meaning |
|---|---|---|
| `npm.cmd run check:heu-user-pilot-identity-scope-day1-readiness` | PASS_LOCAL | Runbook and checker tokens are present |
| `npm.cmd run check:heu-app-shell-draft-pr-readiness` | PASS_LOCAL | AppShell staged scope remains valid for stacked PR |
| `npm.cmd run audit:heu-user-account-security` | PASS | Password and real-user onboarding controls are guarded |
| `npm.cmd run audit:heu-role-scope-uat-pack` | PASS | P6-04 package exists but still needs signed UAT |
| `npm.cmd run audit:ttgdtx-role-scope-access` | PASS | TTGDTX role-scope access audit passed for checked pages |
| `npm.cmd run check:heu-user-create-readiness` | NO_GO | `.env.local` / Supabase Auth Admin keys missing, live account check skipped |
| `npm.cmd run check:heu-permission-scope-readiness` | NO_GO | `.env.local` / service role keys missing, live permission/scope check skipped |
| `npm.cmd run check:heu-user-scope-baseline-repair-queue -- --static-only` | NO_GO_WITH_READY_STATIC_ONLY | Queue package exists, but app guard static tokens are incomplete |
| `check:heu-user-operation-cutover-readiness` | BLOCKED_NOT_WIRED | Package alias is not present in this stacked branch |

## 4. Exact Blocking Findings

| Finding | Blocker | Required next action |
|---|---|---|
| USER-CREATE-ENV | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` unavailable in this worktree | IT_DATA must provide env only through approved local secure channel; do not paste secrets into Git/Codex/chat |
| PERMISSION-SCOPE-ENV | Same env blocker prevents live permission/scope read | Same as above |
| USER-SCOPE-REPAIR-APP-GUARD | Static checker reports `Scope baseline repair queue static guards missing: 4` | Add/review the missing owner-approval and controlled-evidence guards before pilot cutover |
| USER-OPERATION-CUTOVER | `check:heu-user-operation-cutover-readiness` alias missing in stacked branch | Decide whether to port/register the cutover checker in a separate small PR |

## 5. Missing Static Guard Tokens

The static scope baseline checker identified these missing guard groups:

| Missing guard | Expected surface |
|---|---|
| `ui-owner-approval-ack-ok` | `components/settings/user-business-scope-settings.tsx` must require owner approval acknowledgement |
| `ui-controlled-evidence-id-ok` | `components/settings/user-business-scope-settings.tsx` must require controlled evidence ID |
| `server-owner-approval-guard-ok` | `app/settings/actions.ts` must reject scope updates without owner approval acknowledgement |
| `server-controlled-evidence-id-guard-ok` | `app/settings/actions.ts` must normalize/require controlled evidence ID before scope save |

These are runtime/scope guard blockers. Do not mark Day-1 pilot ready until they
are present and the static checker reports READY.

## 6. Current Day-1 Verdict

| Gate | Verdict |
|---|---|
| Docs/control runbook | PASS_LOCAL |
| AppShell staged scope | PASS_LOCAL |
| Password/onboarding audit | PASS |
| Role-scope UAT package | PASS_LOCAL packaging only |
| Live Auth/account readiness | NO_GO |
| Live permission/scope readiness | NO_GO |
| Scope baseline static app guard | NO_GO |
| Day-1 real-user pilot | NO_GO |

Day-1 pilot is not ready for real users yet.

## 7. Safe Next Slice

Recommended next slice:

```text
HEU-USER-PILOT-004-SCOPE-SAVE-GUARD-MINIMAL-FIX
```

Scope:

- `components/settings/user-business-scope-settings.tsx`
- `app/settings/actions.ts`
- focused checker rerun only

Required behavior:

- UI requires owner approval acknowledgement before scope save.
- UI requires controlled evidence ID before scope save.
- Server action rejects missing owner approval acknowledgement.
- Server action rejects missing/invalid controlled evidence ID.
- No account creation.
- No Supabase Auth Admin call.
- No migration.
- No production scope grant.

External blocker that cannot be solved in Git:

- IT_DATA must supply `.env.local` through secure local channel before live
  Auth/permission checks can run.

## 8. Rollback

Rollback this ledger by reverting the PR commit that adds it.

No database rollback is required because this ledger does not run SQL, create
users, grant scope, modify auth, deploy, call AI or perform finance action.

## 9. SOP Slice Result Record

SOP-SCOPE:
- `HEU-USER-PILOT-003` records identity/scope precheck evidence after the
  Day-1 runbook.
- Scope is docs/control + read-only checker only.

SOP-CHECK:
- Commands are listed in Section 3.
- `node_modules` was a local ignored junction only; no install command was run.

SOP-PROFESSIONAL:
- IT_DATA owns env/Auth readiness.
- Audit owns negative-access and traceability review.
- Department owners own pilot seat approval.

SOP-LEGAL:
- No legal/SOP/evidence/UAT approval is inferred.
- No restricted data is copied into Git/Codex/chat.

SOP-LOGIC:
- Day-1 remains blocked until live env checks and static scope-save guards pass.

SOP-VERIFY:
- Required local check:
  `npm.cmd run check:heu-user-pilot-identity-scope-precheck-ledger-readiness`.

SOP-RESULT:
- `NO_GO` for real Day-1 pilot.
- `CAN_SUA` for the next minimal scope-save guard fix.

SOP-NEXT:
- Implement or review `HEU-USER-PILOT-004-SCOPE-SAVE-GUARD-MINIMAL-FIX` only
  after IT_DATA + Audit accept this precheck ledger.
