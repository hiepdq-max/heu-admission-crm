# HEU Control Register

Task ID: HEU-CONTROL-001-BOOTSTRAP-GIT-SCOPE-REGISTER
Date: 2026-07-07
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
HEAD at classification: 94fb31e
Snapshot reference: D:\Web app HEU\HEU_CODEX_RESTART_SNAPSHOT_20260707_142046
Status: DRAFT_CONTROL

## 1. Purpose

This folder records the local control package used to split the current mixed
Git worktree into reviewable scopes before any further implementation,
migration, deployment, or production decision.

It is a control and routing artifact only. It does not approve production,
UAT, evidence acceptance, finance action, migration, owner GO/NO-GO, or BGH
signoff.

## 2. Files In This Package

| File | Purpose | Owner lane |
|---|---|---|
| `GIT_STATUS_CLASSIFICATION_20260707.md` | Current dirty worktree classification by file group, status, risk, and review lane | IT_DATA + Audit |
| `PR_SPLIT_REGISTER_20260707.md` | Proposed small PR split and handling order | IT_DATA + module owners + Audit |
| `ROLLBACK_AND_BACKUP_NOTE_20260707.md` | Backup, rollback, and no-run boundaries before touching high-risk groups | IT_DATA + Audit + PHAP_CHE + KHTC where applicable |
| `HEU_BUILD_001_MASTER_ROADMAP_AND_USER_PILOT_PLAN_20260710.md` | HEU-BUILD-001 master roadmap for one main modular monolith app, shared database by workspace/role/scope, real-user pilot order, AI cost guard, and production NO-GO boundary | BGH + IT_DATA + Audit + PHAP_CHE |
| `HEU_PERF_003_HEU_WORKSPACE_CONTEXT_RUNTIME_PLAN_20260707.md` | Runtime plan plus HEU-PERF-003R workspace context runtime readiness checker for the `/reports` pilot | Architecture + IT_DATA + Audit + Security/Privacy + Performance/UX |

## 3. Current Worktree Summary

Live read on 2026-07-07:

| Status | Count |
|---|---:|
| Modified | 168 |
| Added | 25 |
| Untracked | 45 |
| Total entries | 238 |

Grouped view:

| Group | Count |
|---|---:|
| app | 28 |
| components | 31 |
| database | 10 |
| docs | 77 |
| scripts | 87 |
| config | 2 |
| codex | 2 |
| other | 1 |

## 4. Version Log

| Version | Date | Change | Local evidence |
|---|---|---|---|
| V01 | 2026-07-07 | Created HEU_CONTROL bootstrap package for Git scope classification and PR split routing | `git status --porcelain=v1 -uall`; `git rev-parse --short HEAD`; file existence check |
| V02 | 2026-07-10 | Added HEU-BUILD-001 master roadmap and HEU-BUILD-002 static checker | Roadmap doc, read-only checker script, package alias, one-app strategy, shared database scope boundary, AI cost guard and production NO-GO |
| V03 | 2026-07-10 | Added HEU-PERF-003R workspace context runtime readiness checker | `lib/heu-workspace-context.ts` and `/reports` are checked for scope-first flow, no broad fallback, no write mutation, no AI runtime and production NO-GO |

## 5. Audit Note

This package was created after checking the live worktree and the HEU current
state sources:

| Evidence | Result |
|---|---|
| `docs/HEU_CURRENT_STATE_INVENTORY.md` | Stage D internal controlled test only; production remains NO-GO |
| `docs/HEU_SYSTEM_BUILD_BACKLOG.md` | P0 scope requires dirty worktree split and no production decision from local control docs |
| `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md` | Control documents are DRAFT_CONTROL/PASS_LOCAL only and require owner evidence before reliance |

## 6. Stop Rules

- Do not run database migrations from this package.
- Do not deploy from this package.
- Do not run `npm install`, `npm ci`, or dependency mutation commands from this package.
- Do not commit broad dirty worktree groups together.
- Do not include raw personal, bank, payment, lead, or student data in any follow-up docs.
- Do not treat this package as UAT approval, evidence acceptance, finance approval, owner GO/NO-GO, or production GO.

## 7. Local Result

SOP-SCOPE: HEU-CONTROL-001 creates only `docs/HEU_CONTROL` routing documents.

SOP-CHECK: Current worktree remains mixed and must be split before review or PR.

SOP-PROFESSIONAL: IT_DATA and module owners must review affected business areas.

SOP-LEGAL: PHAP_CHE review is required before any legal/SOP/finance reliance.

SOP-LOGIC: Database, config, app actions, scripts, and role-lane changes stay high-risk until reviewed.

SOP-VERIFY: File existence and Git scope check only; no runtime, migration, lint, or build was executed by this package.

SOP-RESULT: DAT_TAM_THOI for local control document bootstrap only.

SOP-NEXT: Review `GIT_STATUS_CLASSIFICATION_20260707.md`, then split PRs using `PR_SPLIT_REGISTER_20260707.md`.
