# HEU AI Build Collision Triage - 2026-07-03

Status: PASS_LOCAL_CONTROL
Production status: NO-GO
Decision values: AI_BUILD_COLLISION_TRIAGE_READY / MIXED_DIRTY / BLOCKED

## Purpose

This control pack helps multiple AI builders work faster without overwriting or
mixing each other's scopes. It is a local coordination artifact only.

It does not approve production, UAT, finance reliance, evidence acceptance,
owner GO/NO-GO, real email sending, real task creation, real account creation,
cloud infrastructure, migration or deployment.

## Live Coordination Finding

The current worktree is a mixed dirty build surface. The main risk is not one
isolated code error; it is collision risk:

- Multiple scopes are dirty at the same time.
- Shared control files are dirty, including `docs/HEU_IMPLEMENTATION_LOG.md`,
  `package.json`, current-state/backlog/matrix docs and audit scripts.
- Some focused checks are already green, but their checker contracts depend on
  untracked or shared files that must be packaged before the next AI widens the
  scope.
- Broad staging of shared files would merge unrelated Short Course,
  Accounting, Admissions, P0-17/User, Finance and production-readiness work.
- If the local runner blocks Node from spawning Git, the guard must print
  `AI_BUILD_GIT_STATUS: unavailable` and route the operator back to direct
  `git status --short --branch` before packaging.

## Error Classes

| Code | Error | Why it slows AI build | Required control |
|---|---|---|---|
| ERR-AI-01 | Shared control-file collision | Several AI slices write the same log, package script list, backlog or inventory | Hunk-level staging only; never stage the whole shared file unless it belongs to the current slice |
| ERR-AI-02 | Green checker with untracked dependency | A check may pass because untracked docs/scripts exist locally, but the dependency is not packaged yet | Package the dependency chain before relying on the checker in another slice |
| ERR-AI-03 | Mixed module dirty scope | Runtime, docs, scripts and database changes are dirty across unrelated modules | Choose one focused guard and one commit scope at a time |
| ERR-AI-04 | GO-language drift | Local PASS may be misread as production/UAT/finance/owner approval | Keep `PASS_LOCAL`, `NO-GO` and blocker language explicit |
| ERR-AI-05 | Secret/evidence drift | Real account, password, OTP, invite/reset link, raw evidence or bank/voucher data could be pasted into Git/chat | Keep all sensitive material outside Git/Codex/chat and use controlled evidence refs only |

## Non-Overlap Rules For AI Builders

1. One AI lane owns one slice until PASS_LOCAL.
2. A slice must name its file list before edits and before staging.
3. `docs/HEU_IMPLEMENTATION_LOG.md`, `package.json`,
   `docs/HEU_CURRENT_STATE_INVENTORY.md`, `docs/HEU_SYSTEM_BUILD_BACKLOG.md`,
   `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`,
   `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`, `AGENTS.md` and shared
   audit scripts require hunk-level staging.
4. If a checker depends on untracked docs/scripts, package the dependency
   chain first.
5. If a slice touches runtime UI/server actions, run the focused checker plus
   lint/build before commit.
6. If a slice touches Finance/P6-04/User scope, run the Finance/P6-04 security
   checks before commit.
7. If a slice touches Short Course, run the Short Course focused checks before
   commit.
8. No AI may approve production, UAT, finance, owner GO/NO-GO or evidence.
9. If `AI_BUILD_GIT_STATUS` is unavailable, do not package the next module
   slice until direct Git status has been read in the terminal.

## Recommended Cleanup Order

| Order | Lane | Reason | Minimum guard |
|---|---|---|---|
| 1 | AI build collision triage | Gives every AI the same routing map before more edits | `npm.cmd run check:heu-ai-build-collision-triage` |
| 2 | Short Course TRN dependency chain | Current TRN checkers depend on multiple Short Course docs, component and shared audit/log propagation | `npm.cmd run check:heu-training-module-completion-breakdown`; `npm.cmd run check:heu-short-course-role-negative-access`; `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack` |
| 3 | Accounting ACCT chain | ACCT-00, ACCT-11, ACCT-12 and no-duplicate controls share docs/scripts and owner blockers | `npm.cmd run check:heu-accounting-module-breakdown`; `npm.cmd run check:heu-accounting-open-blocker-action-queue`; `npm.cmd run check:heu-accounting-no-duplicate-control-ledger` |
| 4 | Admissions/CRM local completion | Lead import, pipeline/follow-up and reports-dashboard scope are runtime-heavy and should not mix with accounting | `npm.cmd run check:heu-admissions-local-completion` |
| 5 | P0-17/User operation | User activation, scope baseline, negative account and system-wide permission edits are security-sensitive | `npm.cmd run audit:heu-user-account-security`; `npm.cmd run audit:heu-role-scope-uat-pack` |
| 6 | Finance payment scope | Finance Day-1 and payment scope must remain read-only until signed evidence and owner decisions | `npm.cmd run audit:heu-finance-desk`; `npm.cmd run check:heu-finance-payment-scope-readiness` |

## PASS_LOCAL Boundary

This triage only classifies live dirty scope and recommends a safe packaging
order. It does not modify business data, create accounts, send email, create
tasks, run migrations, execute UAT, accept evidence, approve finance reliance,
approve owner GO/NO-GO or mark production GO.
