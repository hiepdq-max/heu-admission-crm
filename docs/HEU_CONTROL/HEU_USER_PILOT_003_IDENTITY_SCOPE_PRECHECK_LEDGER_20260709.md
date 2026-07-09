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
| `npm.cmd run check:heu-user-scope-baseline-repair-queue -- --static-only` | PASS_LOCAL | Queue package exists and HEU-USER-PILOT-004 closes the app guard static tokens |
| `npm.cmd run check:heu-user-operation-cutover-readiness` | PASS_LOCAL_CHECKER_WIRED | HEU-USER-PILOT-005 wires the cutover checker; cutover decision remains NO_GO because external owner blockers remain |
| `npm.cmd run check:heu-user-activation-worksheet-readiness` | PASS_LOCAL_WORKSHEET | HEU-USER-PILOT-006 wires the safe activation worksheet; real activation remains NO_GO because owner/env blockers remain |
| `npm.cmd run check:heu-user-pilot-secure-env-handoff-readiness` | PASS_LOCAL_HANDOFF | HEU-USER-PILOT-007 wires the secure env handoff; live env remains NO_GO until IT_DATA confirms local `.env.local` |
| `npm.cmd run check:heu-user-pilot-live-check-result-ledger-readiness` | PASS_LOCAL_LEDGER | HEU-USER-PILOT-008 wires the status-only live-check result ledger; live checks remain NO_GO until env is ready |

## 4. Exact Blocking Findings

| Finding | Blocker | Required next action |
|---|---|---|
| USER-CREATE-ENV | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` unavailable in this worktree | IT_DATA must provide env only through approved local secure channel; do not paste secrets into Git/Codex/chat |
| PERMISSION-SCOPE-ENV | Same env blocker prevents live permission/scope read | Same as above |
| USER-SCOPE-REPAIR-APP-GUARD | Static checker now reports READY after HEU-USER-PILOT-004 | IT_DATA + Audit must review the owner-approval and controlled-evidence guard before pilot cutover |
| USER-OPERATION-CUTOVER | `check:heu-user-operation-cutover-readiness` is wired by HEU-USER-PILOT-005 | IT_DATA + Audit must review the cutover checker; owner seats, live env checks, negative proof and owner signoff remain external blockers |
| USER-ACTIVATION-WORKSHEET | `check:heu-user-activation-worksheet-readiness` is wired by HEU-USER-PILOT-006 | IT_DATA + Audit must review the activation worksheet before any real user is activated |
| USER-SECURE-ENV-HANDOFF | `check:heu-user-pilot-secure-env-handoff-readiness` is wired by HEU-USER-PILOT-007 | IT_DATA must prepare `.env.local` locally without exposing secret values in Git/Codex/chat |
| USER-LIVE-CHECK-LEDGER | `check:heu-user-pilot-live-check-result-ledger-readiness` is wired by HEU-USER-PILOT-008 | IT_DATA records only status results after live checks; no secret values or raw profile data |

## 5. Static Guard Tokens Closed Locally

HEU-USER-PILOT-004 closes these static guard groups in local review:

| Missing guard | Expected surface |
|---|---|
| `ui-owner-approval-ack-ok` | `components/settings/user-business-scope-settings.tsx` requires owner approval acknowledgement |
| `ui-controlled-evidence-id-ok` | `components/settings/user-business-scope-settings.tsx` requires controlled evidence ID |
| `server-owner-approval-guard-ok` | `app/settings/actions.ts` rejects scope updates without owner approval acknowledgement |
| `server-controlled-evidence-id-guard-ok` | `app/settings/actions.ts` normalizes/requires controlled evidence ID before scope save |

These are local runtime/scope guard closures only. Do not mark Day-1 pilot ready
until IT_DATA + Audit review them and live env checks pass.

## 6. Current Day-1 Verdict

| Gate | Verdict |
|---|---|
| Docs/control runbook | PASS_LOCAL |
| AppShell staged scope | PASS_LOCAL |
| Password/onboarding audit | PASS |
| Role-scope UAT package | PASS_LOCAL packaging only |
| Live Auth/account readiness | NO_GO |
| Live permission/scope readiness | NO_GO |
| Scope baseline static app guard | PASS_LOCAL |
| Day-1 real-user pilot | NO_GO |

Day-1 pilot is not ready for real users yet because live env checks still remain
NO_GO and owner/Audit review is still required.

## 7. Completed Local Fix Slices

Completed local fix slice:

```text
HEU-USER-PILOT-004-SCOPE-SAVE-GUARD-MINIMAL-FIX
```

Completed checker wiring slice:

```text
HEU-USER-PILOT-005-OPERATION-CUTOVER-READINESS-CHECKER
```

Completed activation worksheet slice:

```text
HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS
```

Completed secure env handoff slice:

```text
HEU-USER-PILOT-007-SECURE-ENV-HANDOFF
```

Completed live-check result ledger slice:

```text
HEU-USER-PILOT-008-LIVE-CHECK-RESULT-LEDGER
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
- IT_DATA + Audit must review the HEU-USER-PILOT-004 guard before any real user
  pilot cutover.
- IT_DATA + Audit must review the HEU-USER-PILOT-005 cutover checker before any
  real user pilot cutover.
- Owner seats, TTGDTX negative proof, signed P6-04 UAT, access closure and final
  owner cutover decision remain outside Git/Codex/chat.
- User activation worksheet is local-control ready only; actual activation still
  needs secure env, owner approval and controlled evidence outside Git/Codex/chat.
- Secure env handoff is local-control ready only; actual env values remain under
  IT_DATA control and must never be pasted into Git/Codex/chat.
- Live-check result ledger is status-only; actual env values and raw user details
  remain outside Git/Codex/chat.

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
- Day-1 remains blocked until live env checks pass and IT_DATA + Audit accept
  the static scope-save guard.

SOP-VERIFY:
- Required local check:
  `npm.cmd run check:heu-user-pilot-identity-scope-precheck-ledger-readiness`.

SOP-RESULT:
- `NO_GO` for real Day-1 pilot.
- `CAN_SUA` for IT_DATA + Audit review of the minimal scope-save guard fix.
- `CAN_SUA` for IT_DATA + Audit review of the operation cutover checker.
- `CAN_SUA` for IT_DATA + Audit review of the activation worksheet.
- `CAN_SUA` for IT_DATA + Audit review of the secure env handoff.
- `CAN_SUA` for IT_DATA + Audit review of the live-check result ledger.

SOP-NEXT:
- Review `HEU-USER-PILOT-004-SCOPE-SAVE-GUARD-MINIMAL-FIX` with IT_DATA + Audit
  before any real scope save or pilot cutover.
- Review `HEU-USER-PILOT-005-OPERATION-CUTOVER-READINESS-CHECKER` with IT_DATA +
  Audit before treating user operation cutover as ready.
- Review `HEU-USER-PILOT-006-USER-ACTIVATION-WORKSHEET-READINESS` with IT_DATA +
  Audit before creating, inviting or activating any pilot user.
- Review `HEU-USER-PILOT-007-SECURE-ENV-HANDOFF` with IT_DATA + Audit before
  running live user-create or permission/scope checks.
- Review `HEU-USER-PILOT-008-LIVE-CHECK-RESULT-LEDGER` with IT_DATA + Audit
  before recording any live check result.
