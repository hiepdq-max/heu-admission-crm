# HEU AI Dirty Scope Packaging Ledger - 2026-07-03

Status: PASS_LOCAL_CONTROL
Production status: NO-GO
Decision values: DIRTY_SCOPE_PACKAGING_LEDGER_READY / MIXED_DIRTY / BLOCKED

## Purpose

This ledger turns the current mixed dirty worktree into clear packaging lanes
for AI builders. It is a local coordination artifact only.

It does not approve production, UAT, finance reliance, evidence acceptance,
owner GO/NO-GO, real email sending, real task creation, real account creation,
cloud infrastructure, migration or deployment.

## Live Dirty Snapshot

Direct terminal evidence from `git status --short --branch`,
`git diff --name-status` and a lane grouping pass on 2026-07-03:

| Lane | Dirty entries | Current packaging state | First action |
|---|---:|---|---|
| ACCOUNTING_ACCT | 25 | MIXED_DIRTY | Package only after its checker/docs/sql chain is separated from shared-control hunks. |
| ADMISSIONS_CRM | 24 | MIXED_DIRTY | Package after Admissions runtime, data-foundation and report/dashboard guard hunks are isolated. |
| P0_17_USER_SCOPE | 16 | MIXED_DIRTY | Package only with user/security audits and no real account/password data. |
| SHORT_COURSE_TRN | 14 | FOCUSED_GUARDS_GREEN_BUT_SHARED_HUNKS_MIXED | Build a hunk-only package; do not full-stage shared docs or package scripts. |
| SHARED_CONTROL | 12 | HUNK_STAGE_REQUIRED | Never full-stage shared control files while more than one lane is dirty. |
| UNKNOWN_OR_MANUAL | 10 | NEEDS_OWNER_ROUTING | Classify before editing or staging. |
| AUDIT_PRODUCTION_READINESS | 9 | MIXED_DIRTY | Separate audit/runtime/production-readiness guard changes. |
| BGH_EXECUTIVE | 6 | MIXED_DIRTY | Separate executive/dashboard shell from Admissions and Report View. |
| REPORT_VIEW_DATA_MASTER | 5 | MIXED_DIRTY | Keep report/data-master source map separate from Admissions runtime changes. |
| FINANCE_DAY1 | 2 | SMALL_CANDIDATE | Can package only if Finance/P6-04 audits stay green and no shared-control hunk is mixed. |
| DATABASE_SQL | 1 | NEEDS_SQL_AUDIT | Run SQL/object-map and migration-order checks before any package. |

Current index rule: staged entries must remain `0` until a single lane is
selected and hunk-level staging is complete.

## Error Findings From Current AI Build Surface

| Code | Finding | Effect | Required fix |
|---|---|---|---|
| ERR-PKG-01 | Shared docs carry multiple unrelated lane updates | A green guard can be committed with unrelated Accounting, User, Admissions, Short Course or governance changes | Stage shared files with index blobs or hunk-level staging only |
| ERR-PKG-02 | `package.json` contains multiple uncommitted checker scripts | Full-stage would package unrelated local checkers at once | Stage exactly one npm script per lane unless the lane explicitly owns the full script batch |
| ERR-PKG-03 | Focused Short Course guards are green but dependencies are spread across shared docs | It is tempting to commit the whole doc/audit surface | Package Short Course with an explicit manifest and staged shared hunks only |
| ERR-PKG-04 | Accounting has the largest dirty count and multiple owner blockers | Starting Accounting before shared-control separation may swallow User/P0-17 and payout-risk changes | Run Accounting child checks, then package one ACCT slice at a time |
| ERR-PKG-05 | Runtime lanes and governance lanes are interleaved | Lint/build can pass while commit scope is still wrong | Treat lint/build as necessary but not sufficient; scope audit comes first |

## Packaging Order

Use this order until the dirty worktree is split:

1. `AI_DIRTY_SCOPE_PACKAGING_LEDGER` - this ledger and checker.
2. `SHORT_COURSE_TRN_SHARED_HUNK_PACKAGE` - package Short Course TRN docs,
   checker scripts, visible panel and required shared hunks only.
3. `ACCOUNTING_ACCT_CHILD_CHECKERS` - package ACCT module/open-blocker/no-
   duplicate/risk/owner closure in child slices, not as one broad commit.
4. `ADMISSIONS_CRM_LOCAL_COMPLETION` - package import, pipeline, follow-up,
   reports-dashboard and data-foundation guards after Accounting is separated.
5. `P0_17_USER_SCOPE_SECURITY` - package user/scope/negative-control/security
   only with role-scope and user-account audits.
6. `BGH_EXECUTIVE_DASHBOARD_SHELL` - package executive/dashboard shell after
   Admissions and Report View collisions are cleared.
7. `FINANCE_DAY1_SMALL_CANDIDATE` - package finance payment scope only after
   Finance/P6-04 audits are green.

## Required Guard Set By Lane

| Lane | Minimum focused guards before package |
|---|---|
| SHORT_COURSE_TRN | `npm.cmd run check:heu-training-module-completion-breakdown`; `npm.cmd run check:heu-short-course-external-owner-action-queue`; `npm.cmd run check:heu-short-course-role-negative-access`; `npm.cmd run audit:heu-short-course-attendance-payment-gap-pack` |
| ACCOUNTING_ACCT | `npm.cmd run check:heu-accounting-module-breakdown`; `npm.cmd run check:heu-accounting-open-blocker-action-queue`; `npm.cmd run check:heu-accounting-no-duplicate-control-ledger`; `npm.cmd run check:heu-accounting-local-readiness` |
| ADMISSIONS_CRM | `npm.cmd run check:heu-admissions-local-completion`; `npm.cmd run audit:heu-data-foundation`; `npm.cmd run audit:heu-lead-lifecycle-standard`; `npm.cmd run audit:heu-lead-lifecycle-handover-uat-pack` |
| P0_17_USER_SCOPE | `npm.cmd run audit:heu-user-account-security`; `npm.cmd run audit:heu-role-scope-uat-pack`; `npm.cmd run audit:ttgdtx-role-scope-access` |
| FINANCE_DAY1 | `npm.cmd run audit:heu-finance-desk`; `npm.cmd run audit:heu-user-account-security`; `npm.cmd run audit:ttgdtx-production-readiness-guard` |
| DATABASE_SQL | `npm.cmd run audit:heu-sql-object-master-map`; `npm.cmd run audit:ttgdtx-migration-order-guard`; `npm.cmd run audit:ttgdtx-release-gates` |

All lanes still require:

```powershell
npm.cmd run audit:heu-current-state-inventory
npm.cmd run audit:heu-implementation-log
npm.cmd run audit:ttgdtx-release-gates
npm.cmd run audit:heu-vietnamese-text-encoding
npm.cmd run lint
npm.cmd run build
git diff --check
git diff --cached --check
```

## Staging Rules

Shared-control files require hunk-level or index-blob staging:

- `AGENTS.md`
- `package.json`
- `docs/HEU_IMPLEMENTATION_LOG.md`
- `docs/HEU_CURRENT_STATE_INVENTORY.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`
- `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`
- shared audit scripts such as `scripts/audit-heu-implementation-log.mjs`,
  `scripts/audit-heu-current-state-inventory.mjs` and
  `scripts/audit-ttgdtx-release-gates.mjs`

Do not use broad `git add .`, folder-wide `git add docs`, folder-wide
`git add scripts` or full-file staging of shared controls while the worktree is
mixed.

## PASS_LOCAL Boundary

This ledger only classifies dirty scope and routes packaging. It does not
modify business data, create accounts, handle passwords, send email, create
tasks, run migrations, execute UAT, accept evidence, approve finance reliance,
approve owner GO/NO-GO or mark production GO.
