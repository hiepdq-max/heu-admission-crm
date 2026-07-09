# HEU User Pilot 009 Stacked PR Review Packet

Task ID: HEU-USER-PILOT-009-STACKED-PR-REVIEW-PACKET
Date: 2026-07-10
Repository: heu-admission-crm
Branch: codex/heu/user-pilot-review-packet
Base branch: codex/heu/user-live-check-result-ledger
Status: PASS_LOCAL_REVIEW_PACKET
Production status: NO-GO

## 1. Purpose

This packet gives IT_DATA and Audit a single review order for the user pilot
stack before any live account, scope, invite, password, permission or
department rollout action.

It exists because PR #15 through PR #19 are intentionally stacked and local
only. A green local checker does not mean HEU can create real users.

## 2. Review Order

Review in this order only:

| Order | PR | Branch | Purpose | Draft state | Required reviewers |
|---|---|---|---|---|---|
| 1 | PR #15 | `codex/heu/user-pilot-scope-save-guard` | Require owner approval acknowledgement and controlled evidence ID before scope save | Draft | IT_DATA + Audit |
| 2 | PR #16 | `codex/heu/user-pilot-cutover-readiness` | Add cutover readiness checker and keep external owner blockers explicit | Draft | IT_DATA + Audit |
| 3 | PR #17 | `codex/heu/user-activation-worksheet-readiness` | Add worksheet for safe activation review before any real user activation | Draft | IT_DATA + Audit |
| 4 | PR #18 | `codex/heu/user-secure-env-handoff` | Define secure local env handoff without printing or storing secret values | Draft | IT_DATA + Audit |
| 5 | PR #19 | `codex/heu/user-live-check-result-ledger` | Record status-only live-check results after env is locally ready | Draft | IT_DATA + Audit |

Reference URLs:

- https://github.com/hiepdq-max/heu-admission-crm/pull/15
- https://github.com/hiepdq-max/heu-admission-crm/pull/16
- https://github.com/hiepdq-max/heu-admission-crm/pull/17
- https://github.com/hiepdq-max/heu-admission-crm/pull/18
- https://github.com/hiepdq-max/heu-admission-crm/pull/19

## 3. Move Out Of Draft Conditions

A PR may move out of Draft only when all conditions below are true:

| Condition | Required state |
|---|---|
| Scope | PR diff contains only the intended docs/checker/runtime files for that slice |
| Base alignment | Earlier stacked PRs are reviewed or the base branch is explicitly accepted by IT_DATA + Audit |
| Local checks | Focused check for that PR is PASS_LOCAL |
| Secret safety | No secret value, password, invite/reset link, raw user profile or raw evidence content is present |
| Owner boundary | No owner, UAT, production, finance, legal or evidence approval is inferred |
| Rollback | Revert PR is enough for docs/checker slices; runtime guard PR must name exact files |

Do not merge out of order unless IT_DATA + Audit explicitly accept the stacked
base strategy.

## 4. No-Go Conditions

Do not create, invite, activate or grant real scope to any user while any item
below is true:

- PR #15 through PR #19 are still unreviewed by IT_DATA + Audit.
- `.env.local` is missing locally, not ignored or not controlled by IT_DATA.
- `check:heu-user-create-readiness` is blocked by env.
- `check:heu-permission-scope-readiness` is blocked by env.
- Negative access evidence is missing.
- Owner lanes have not approved pilot seats.
- The live-check result ledger has not been updated with status-only outcomes.

Production remains NO-GO.

## 5. Required Local Commands

Run these in the stacked review packet worktree:

```powershell
npm.cmd run check:heu-user-pilot-stacked-pr-review-packet-readiness
npm.cmd run check:heu-user-pilot-live-check-result-ledger-readiness
npm.cmd run check:heu-user-pilot-secure-env-handoff-readiness
npm.cmd run check:heu-user-activation-worksheet-readiness
npm.cmd run check:heu-user-operation-cutover-readiness
npm.cmd run check:heu-user-pilot-identity-scope-precheck-ledger-readiness
npm.cmd run check:heu-app-shell-draft-pr-readiness
```

Do not run:

- `npm install`
- `npm ci`
- Supabase migration or `supabase db push`
- Production deploy
- Paid automation
- Live user-create or permission/scope checks until IT_DATA confirms secure
  local env readiness

## 6. AI Boundary

AI/Codex may:

- Read PR metadata and local git status.
- Check whether docs and checker tokens are present.
- Summarize PASS_LOCAL, CAN_SUA, NO_GO or BLOCKED status.
- Draft review notes for IT_DATA and Audit.

AI/Codex must not:

- Read, print, store or summarize `.env.local`.
- Ask for passwords, OTP, invite links, reset links, service-role keys or
  publishable keys.
- Create, invite, activate, disable or delete users.
- Grant role, department, workspace or business scope.
- Approve UAT, owner GO/NO-GO, legal signoff, evidence acceptance, finance
  action, migration, deploy or production.

## 7. Reviewer Checklist

| Reviewer lane | Must confirm | Current state |
|---|---|---|
| IT_DATA | PR order, local env handoff, ignored secret files, live check commands | `CAN_SUA_IT_DATA_AUDIT` |
| Audit | No secret exposure, no raw PII, negative access evidence plan, status-only ledger | `CAN_SUA_IT_DATA_AUDIT` |
| Department owners | Pilot seats, role/workspace need, final access acceptance | `NO_GO_OWNER_REVIEW_PENDING` |
| BGH/Owner authority | Any official pilot or production decision | `NO_GO_PRODUCTION` |

## 8. Rollback

Rollback this packet by reverting the PR that adds it.

No database rollback is required because this packet does not change Auth,
database rows, role/scope assignments, evidence storage, finance state,
automation config or production config.

## 9. SOP Slice Result Record

SOP-SCOPE:
- `HEU-USER-PILOT-009` adds a stacked PR review packet for PR #15 through PR
  #19.
- Scope is docs/control + read-only checker only.

SOP-CHECK:
- Required local command:
  `npm.cmd run check:heu-user-pilot-stacked-pr-review-packet-readiness`.

SOP-PROFESSIONAL:
- IT_DATA owns env and Auth readiness.
- Audit owns traceability, no-secret and negative-access review.
- Department owners own real pilot seat approval.

SOP-LEGAL:
- No legal, UAT, evidence, finance, owner or production approval is inferred.
- No restricted data is copied into Git/Codex/chat.

SOP-LOGIC:
- This packet can be PASS_LOCAL while live user activation remains NO_GO.
- This packet only orders review; it does not move any PR out of Draft.

SOP-VERIFY:
- Checker must verify PR numbers, branches, review order, no-go gates, package
  alias, no secret assignments and no mutation APIs.

SOP-RESULT:
- `PASS_LOCAL` for stacked PR review packet wiring.
- `CAN_SUA_IT_DATA_AUDIT` for formal review of PR #15 through PR #19.
- `NO_GO` for real user activation until env, owner, Audit and negative-access
  gates pass.

SOP-NEXT:
- IT_DATA + Audit review PR #15 first.
- Keep PR #16 through PR #19 Draft until earlier stacked bases are accepted.
- Do not run live account or permission/scope checks until PR #18 is reviewed
  and local env readiness is confirmed without exposing secret values.
