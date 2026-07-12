# HEU Scripts 003 Review Audit Check Scripts 2026-07-07

Task ID: HEU-SCRIPTS-003-REVIEW-AUDIT-CHECK-SCRIPTS
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
HEAD at start: 246c206
Last refreshed: 2026-07-09
Source workspace HEAD before refresh commit: df1c03c
Status: DRAFT_CONTROL
Production status: NO-GO

## 1. Purpose

This register classifies the current dirty `scripts` scope before anyone trusts
new PASS/NO_GO output, starts a runtime code slice, runs broad checks, or stages
script changes.

The reason for this slice is direct: audit/check scripts decide whether a HEU
module is `PASS_LOCAL`, `NO_GO`, `BLOCKED`, `CAN_SUA` or `DAT_TAM_THOI`.
Therefore, dirty scripts must be reviewed before script output can be treated
as reliable evidence.

This is a review-routing document only. It does not approve script correctness,
UAT, evidence acceptance, finance reliance, migration, owner GO/NO-GO or
production GO.

## 2. Live Script Scope Snapshot

Current live read refreshed on 2026-07-09:

| Status | Count |
|---|---:|
| Modified | 56 |
| Added | 8 |
| Untracked | 37 |
| Total script entries | 101 |

Tracked script diff size:

| Metric | Value |
|---|---:|
| Tracked script files in diff stat | 64 |
| Insertions | 29337 |
| Deletions | 9473 |

Commands used for classification:

```powershell
git status --short -- scripts
git diff --name-status -- scripts
git ls-files -o --exclude-standard -- scripts
git diff --stat -- scripts
```

No `npm.cmd` audit/check/build command was run in this slice.

Refresh boundary:

- The status and diff-stat counts above reflect the current `scripts` dirty
  scope at refresh time.
- The script group table, high-risk finding list, and review order below remain
  the 2026-07-07 baseline routing map.
- Treat this document as a review-routing artifact, not proof that any changed
  audit/check script is correct.
- Production remains NO-GO regardless of local audit output until authorized
  owners approve UAT, evidence, backup, rollback and production gate outside
  Git/Codex/chat.

## 3. Script Groups By Risk - 2026-07-07 Baseline

| Group | Count | Modified | Added | Untracked | Risk | Review owner lane |
|---|---:|---:|---:|---:|---|---|
| audit | 16 | 16 | 0 | 0 | Very high | IT_DATA + Audit + PHAP_CHE where legal/SOP/evidence gates are checked |
| executive_dashboard | 23 | 18 | 0 | 5 | High | BGH + IT_DATA + Audit + module owners |
| training_khoa_short_course | 14 | 1 | 6 | 7 | Medium-high | DAO_TAO + Khoa/Giang vien + Short Course owner + IT_DATA + Audit |
| identity_permission_scope | 10 | 6 | 1 | 3 | Very high | IT_DATA + ADMIN + PHAP_CHE + Audit |
| accounting_finance | 6 | 6 | 0 | 0 | Very high | KHTC + IT_DATA + Audit + PHAP_CHE |
| reports_documents_pipeline | 6 | 3 | 0 | 3 | High | TUYEN_SINH + CTHSSV + IT_DATA + Audit |
| admissions | 5 | 0 | 1 | 4 | High | TUYEN_SINH + CTHSSV + IT_DATA + Audit |
| finance | 2 | 1 | 0 | 1 | Very high | KHTC + IT_DATA + Audit + PHAP_CHE |
| system_fast_loop | 2 | 2 | 0 | 0 | Very high | IT_DATA + Audit + Codex operator |
| cthssv | 1 | 1 | 0 | 0 | Medium-high | CTHSSV + TUYEN_SINH + IT_DATA + Audit |
| other | 2 | 1 | 0 | 1 | High | IT_DATA + relevant module owner |

## 4. High-Risk Findings

| Finding | Why it matters | Stop rule |
|---|---|---|
| `audit-heu-implementation-log.mjs` has very large tracked diff | It can change whether implementation-log evidence is accepted | Do not trust implementation-log PASS until reviewed with paired docs |
| `audit-heu-user-account-security.mjs` has large tracked diff | It gates account/security/scope readiness | Do not widen user access or run account cutover based on it alone |
| `check-heu-fast-local-loop.mjs` is modified | It routes next guards and worktree status | Do not use broad fast-loop output as final evidence until reviewed |
| `audit-ttgdtx-release-gates.mjs` is modified | It affects TTGDTX release gate claims | Production remains NO-GO regardless of local output |
| Several new check scripts are untracked | They may be referenced by `package.json` but not committed/reviewed | Treat any PASS depending on untracked scripts as incomplete |
| `package.json` is dirty outside this slice | Script aliases may have changed | Review package script mapping before running or relying on new aliases |

## 5. Review Order - 2026-07-07 Baseline

Review in this order. Do not start with runtime code.

| Priority | Scope | Why first | Suggested action |
|---:|---|---|---|
| 1 | `system_fast_loop` | Routes worktree and next guard decisions | Read diff and run `node --check` only after scope is isolated |
| 2 | core `audit` scripts | Determine PASS/NO_GO wording and evidence acceptance | Pair each audit script with its docs and exact tokens |
| 3 | `identity_permission_scope` | Controls user, role, scope and account readiness | Review before any `HEUWorkspaceContext` code slice |
| 4 | `accounting_finance` and `finance` | Finance scripts can affect reliance/payment conclusions | Review with KHTC + Audit + PHAP_CHE; no finance action approved |
| 5 | `executive_dashboard` | BGH/executive scripts shape read-only and authority dashboards | Keep read-only/no-approval boundaries explicit |
| 6 | `reports_documents_pipeline` and `admissions` | Affects lead, documents, pipeline and handover readiness | Pair with docs review register before trusting PASS |
| 7 | `cthssv` and `training_khoa_short_course` | Module completion scripts can overstate readiness | Keep external evidence and owner signoff blockers explicit |
| 8 | untracked scripts | Need package alias and ownership confirmation | Add only after exact scope, owner and rollback are clear |

## 6. Per-Script Review Checklist

Every changed script needs this checklist before it can be trusted:

```text
Script:
Status: M / A / untracked
Package alias:
Paired docs:
Paired UI/code route:
Owner lane:
Decision tokens checked:
Reads only metadata/safe docs?
Touches secrets/raw PII/raw evidence?
Runs DB mutation or production call?
Can it overstate PASS_LOCAL as UAT/owner/production?
node --check result:
Focused npm.cmd command result:
Rollback:
Conclusion: CHUA_KIEM / DANG_KIEM / CAN_SUA / DAT_TAM_THOI
```

## 7. Allowed Commands For Later Review

Use `npm.cmd`, not bare `npm`.

Safe later sequence for one isolated script group:

```powershell
node --check scripts/<script-name>.mjs
git diff --check -- scripts/<script-name>.mjs
npm.cmd run <focused-alias>
```

Do not run broad script packs while the script scope is still mixed. Do not run
database migrations, deploys, installs, `npm ci`, `npm install`, production
SQL, or Supabase push from this task.

## 8. Relation To HEU-PERF-001

`HEU-PERF-001` should not proceed to a runtime `HEUWorkspaceContext` code slice
until the relevant scope and permission scripts are reviewed:

| Dependency | Why |
|---|---|
| `check-heu-permission-scope-readiness.mjs` | Proves role/workspace/scope baseline |
| `check-heu-user-scope-baseline-repair-queue.mjs` | Tracks remaining scope repair and owner actions |
| `check-heu-fast-local-loop.mjs` | Routes next guard and mixed worktree state |
| `audit-heu-user-account-security.mjs` | Guards user/account/security tokens |
| `audit-heu-implementation-log.mjs` | Validates evidence/log coverage |

Until those are reviewed, the safest HEU-PERF code state remains `CAN_SUA`,
not `DAT_TAM_THOI`.

## 9. Decision

| Item | Result |
|---|---|
| Scripts classification | DAT_TAM_THOI for routing only |
| Script correctness | CHUA_KIEM / DANG_KIEM by group |
| Script output reliability | CAN_SUA until each group is reviewed and focused checks pass |
| Runtime code slice | Defer `HEUWorkspaceContext` implementation until scope scripts are reviewed |
| Migration/deploy/install | Not allowed from this task |
| Production | NO-GO |

## 10. SOP Slice Result Record

SOP-SCOPE:
- `HEU-SCRIPTS-003` classifies dirty `scripts` changes and creates a review
  order.
- It does not modify script behavior, app runtime, database, config, package
  dependencies, user access or production state.

SOP-CHECK:
- Current script status count refreshed to 101 entries.
- The 2026-07-07 baseline group classification remains below for routing.
- Live Git status, HEAD, script status, script name-status, untracked scripts
  and script diff stat were checked.
- Package script aliases were read only to understand dependency risk.

SOP-PROFESSIONAL:
- Owner lanes: IT_DATA, Audit, PHAP_CHE, KHTC, BGH, TUYEN_SINH, CTHSSV,
  DAO_TAO, Khoa/Giang vien, Short Course owner as applicable.
- Result: DRAFT_CONTROL until each group owner reviews the matching scripts and
  docs.

SOP-LEGAL:
- This register is not legal/SOP issuance and does not approve UAT, evidence,
  finance reliance, owner GO/NO-GO or production.

SOP-LOGIC:
- Scripts are high risk because they decide local evidence and PASS/NO_GO
  states.
- Untracked scripts and dirty `package.json` mapping are explicit blockers for
  trusting new aliases without review.

SOP-VERIFY:
- Docs-only verification expected: file existence, section/token search,
  trailing-whitespace check and `git diff --check -- docs/HEU_CONTROL`.
- No `npm.cmd` command is required for this classification slice.

SOP-RESULT:
- `DAT_TAM_THOI` for scripts review routing only.
- Actual script correctness remains `CHUA_KIEM` or `DANG_KIEM` by group.
- Production remains `NO-GO`.

SOP-NEXT:
- Review `system_fast_loop` and core `audit` scripts first.
- Then review `identity_permission_scope` before implementing
  `HEUWorkspaceContext` runtime code.
