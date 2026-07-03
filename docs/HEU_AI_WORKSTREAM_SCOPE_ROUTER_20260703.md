# HEU AI Workstream Scope Router 2026-07-03

Status: PASS_LOCAL_CONTROL
Decision lane: AI_WORKSTREAM_ROUTER_READY / NO_GO / BLOCKED
Production status: NO-GO
Scope: read-only dirty-scope routing for multiple AI/IT lanes

## 1. Purpose

This router gives Master Control a small read-only way to see whether many
AI/IT lanes are touching the same worktree at the same time. It helps choose
the next smallest packaging slice without overwriting another lane.

The router is coordination control only. It does not create users, send email,
create tasks, call Supabase, run migrations, execute UAT, accept evidence,
approve finance reliance, approve owner GO/NO-GO or mark production GO.

## 2. Input Commands

The checker reads only local Git state:

- `git status --short --branch`
- `git diff --name-status`
- `git ls-files -o --exclude-standard`

It prints grouped lanes, shared-file risks and the smallest next lane
recommendation. When multiple business lanes are dirty, the current route
decision must remain `NO_GO` until one lane is packaged or explicitly blocked.

## 3. Routing Lanes

| Lane | Typical files | Safe handling |
| --- | --- | --- |
| `P0_17_USER_ROLE_SCOPE_TCHC` | settings, Step114-Step117, TCHC, user activation, permission scope | Package separately with P0-17/P6-04 checks. |
| `FINANCE_ACCOUNTING_TTGDTX` | TTGDTX payment requests, accounting ledgers, Finance evidence intake | Package separately with finance, role-scope and production-readiness guards. |
| `CTHSSV` | `/cthssv`, CTHSSV module docs and readiness audit | Package as one M06 slice only. |
| `KHOA_GIANG_VIEN` | `/khoa`, Khoa/Giang vien docs and checks | Package as one M08/P10 slice only. |
| `SHORT_COURSE_TRAINING` | short-course workflow, training docs and checks | Package as one M07/P9 slice only. |
| `CRM_NAV_REPORT_SHARED` | lead, follow-up, pipeline, report, dashboard and layout surfaces | Package after module lanes or split by exact UI surface. |
| `AI_WORKSTREAM_ROUTER` | this router doc and checker script | Package as a docs/checker control slice only. |
| `AUDIT_RELEASE_SCRIPTS` | shared audit scripts and release gates | Package only with matching docs, using hunk-level staging when needed. |
| `GOVERNANCE_SHARED_DOCS` | inventory, backlog, gap matrix, implementation log, package and AGENTS | Package with hunk-level staging; do not mix unrelated module sections. |
| `UNKNOWN_OTHER` | Any path that does not match a lane | Stop and classify before edit/stage/commit. |

## 4. Shared-File Stop Rules

The following files are high-risk because many lanes need them:

- `AGENTS.md`
- `package.json`
- `docs/HEU_CURRENT_STATE_INVENTORY.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`
- `scripts/audit-heu-implementation-log.mjs`
- `scripts/audit-heu-current-state-inventory.mjs`
- `scripts/audit-heu-data-foundation.mjs`
- `scripts/audit-ttgdtx-release-gates.mjs`

If any of these are dirty while more than one business lane is dirty, the next
commit must use hunk-level staging or wait until the owning lane is selected.

## 5. Current Operating Rule

Master Control should select exactly one lane at a time:

1. Run the router.
2. Pick the smallest clear lane with a focused audit path.
3. Read diffs for every selected dirty file.
4. Do not edit or stage other lanes.
5. Run focused audit plus baseline PASS_LOCAL checks.
6. Commit only the selected lane when checks pass.

Expected current result in a mixed worktree is:

- `AI_WORKSTREAM_ROUTER_READY: PASS_LOCAL_CONTROL`
- `CURRENT_ROUTE_DECISION: NO_GO`
- `NEXT_SAFE_LANE: <smallest clear lane>`

Production remains NO-GO. PASS_LOCAL routing does not approve UAT, evidence,
finance action, owner GO/NO-GO or production.
