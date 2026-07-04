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

## Soft Connector Routing Addendum - 2026-07-04

Decision value: AI_BUILD_SOFT_CONNECTOR_READY / HIGH_OVERLAP / BLOCKED.

This addendum turns the collision triage into a working "soft connector" for
multiple AI builders. It is a routing guard, not a module approval.

Latest local routing snapshot for this slice:

- `npm.cmd run check:heu-ai-build-collision-triage` reported
  `AI_BUILD_OVERLAP_RISK: HIGH`, `changed=201`, `staged=0`,
  `untracked=59`, `scopes=10` and `stage_state=CLEAN_INDEX`.
- `npm.cmd run check:heu-fast-local-loop -- --snapshot-only` reported
  `MIXED_AREA_DIRTY`, `scripts=77` as the top dirty area, and no PASS_LOCAL
  claim because snapshot mode only reads state.
- The fast-loop operator route said `run_registered_dynamic_guards` first and
  selected `candidate_manual=npm.cmd run check:heu-executive-report-dashboard-scope-contract-readiness`
  from the largest live candidate group.
- The Short Course path must not be packaged as a standalone closeout if the
  guard chain expands into Dao Tao plus Khoa/Giang vien. In that case relabel
  the slice as a `DAO_TAO_M07_M08_DEPENDENCY_CHAIN` before staging.

Every active AI builder must declare this lane card before edits:

| Field | Required value |
|---|---|
| `lane_id` | One focused lane, for example `AI_ROUTING`, `EXECUTIVE_CHECKERS`, `SHORT_COURSE_TRN`, `DAO_TAO_M07_M08`, `ACCOUNTING_ACCT`, `ADMISSIONS_CRM`, `P0_17_USER_SCOPE`, `FINANCE_DAY1` or `DATABASE_SQL` |
| `files_touched` | Exact files expected for the lane before edit and before staging |
| `shared_control_files` | Any shared docs/scripts/package files, with `HUNK_STAGE_REQUIRED` |
| `dependency_guards` | Focused npm guard list for this lane |
| `stop_rule` | The first failed guard, mixed staged scope, secret/evidence exposure, or any production/UAT/finance/owner approval language |
| `handoff_status` | `PASS_LOCAL`, `NO_GO` or `BLOCKED`, never production GO |

Soft connector staging rules:

1. Start each lane with `git diff --cached --name-status`; it must be empty
   unless the current lane intentionally staged exactly its own files.
2. Run `npm.cmd run check:heu-ai-build-collision-triage` and
   `npm.cmd run check:heu-fast-local-loop -- --snapshot-only` before choosing
   a package lane.
3. Run registered dynamic guards before packaging when fast-loop prints
   `run_registered_dynamic_guards`.
4. Use hunk-level staging for shared control files:
   `docs/HEU_IMPLEMENTATION_LOG.md`, `package.json`,
   `docs/HEU_CURRENT_STATE_INVENTORY.md`,
   `docs/HEU_SYSTEM_BUILD_BACKLOG.md`,
   `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`,
   `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`, `AGENTS.md` and shared
   audit/check scripts.
5. Do not package a checker if it passes only because untracked dependency docs
   or scripts exist locally; package that dependency chain first.
6. Do not use broad `git add .`, broad `git add docs`, broad `git add scripts`
   or any staged set that mixes unrelated lanes.
7. If a lane expands into another module, stop, relabel the lane, update the
   lane card, and rerun the focused guards before staging.

Current soft connector route for the next AI:

| Step | Route | Guard |
|---|---|---|
| 1 | Run registered dynamic guards from fast-loop, because the live dirty state is script-heavy | `npm.cmd run check:heu-fast-local-loop -- --snapshot-only` then the printed dynamic guards |
| 2 | Package Executive checker cluster only if all focused Executive guards pass and shared hunks are isolated | `npm.cmd run check:heu-executive-report-dashboard-scope-contract-readiness` plus related Executive checks |
| 3 | Package Short Course only as a Dao Tao dependency chain when Khoa/Giang vien dependencies are included | `npm.cmd run check:heu-dao-tao-local-readiness` |
| 4 | Package Accounting ACCT only after user-scope baseline and negative-control blockers are reported, not hidden | `npm.cmd run check:heu-accounting-local-readiness` |
| 5 | Package P0-17/User scope only with security guards and no real accounts/passwords/secrets | `npm.cmd run audit:heu-user-account-security`; `npm.cmd run audit:heu-role-scope-uat-pack` |

Soft connector PASS_LOCAL means the route is clear enough for the next small
slice. It does not create or operate an autonomous AI worker, send email, create
tasks, create accounts, handle passwords, accept evidence, execute UAT, approve
finance reliance, approve owner GO/NO-GO, run migrations or mark production GO.

## PASS_LOCAL Boundary

This triage only classifies live dirty scope and recommends a safe packaging
order. It does not modify business data, create accounts, send email, create
tasks, run migrations, execute UAT, accept evidence, approve finance reliance,
approve owner GO/NO-GO or mark production GO.
