# Git Status Classification 2026-07-07

Task ID: HEU-RESTART-001-PHAN-LOAI-GIT-STATUS
Follow-up control: HEU-CONTROL-001-BOOTSTRAP-GIT-SCOPE-REGISTER
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
HEAD at classification: 94fb31e
Snapshot reference: D:\Web app HEU\HEU_CODEX_RESTART_SNAPSHOT_20260707_142046
Status: DRAFT_CONTROL

## 1. Scope

This document classifies the current mixed Git worktree so the changes can be
reviewed and split safely. It does not inspect every diff line and does not
approve any code, SQL, migration, UAT, finance action, or production decision.

## 2. Live Status Counts

Source command: `git status --porcelain=v1 -uall`

| Status | Count |
|---|---:|
| Modified | 168 |
| Added | 25 |
| Untracked | 45 |
| Total entries | 238 |

## 3. Group Classification

| Group | Count | Status mix | Risk | Review lane | Review order |
|---|---:|---|---|---|---:|
| docs | 77 | 46 modified, 14 added, 17 untracked | Medium | Audit + PHAP_CHE + module owners | 1 |
| scripts | 87 | 55 modified, 8 added, 24 untracked | High | IT_DATA + Audit | 2 |
| config | 2 | 2 modified | Very high | IT_DATA + DevOps/Codex operator | 3 |
| codex | 2 | 1 modified, 1 untracked | High | Codex operator + IT_DATA + Audit | 4 |
| database | 10 | 10 modified | Very high | IT_DATA + Audit + PHAP_CHE + KHTC where finance related | 5 |
| app | 28 | 24 modified, 2 added, 2 untracked | High | IT_DATA + module owners + Audit | 6 |
| components | 31 | 29 modified, 1 added, 1 untracked | Medium-high | IT_DATA + module owners | 7 |
| other | 1 | 1 modified | High | IT_DATA + PHAP_CHE + Audit | 8 |

## 4. High-Risk Groups

| Group | Reason | Stop rule |
|---|---|---|
| database | SQL and policy files can affect schema, RLS, finance, scope, and migration order | Review only until backup, rollback, migration order, and owner approval exist |
| config | `package.json` and `next.config.ts` can change runtime, build, scripts, or dependency assumptions | Review separately before running broad checks |
| app | Server actions and route logic can mutate finance, scope, lead, or user state | Review route/action diffs before runtime testing |
| scripts | Audit/check scripts define gate evidence and may change PASS/NO_GO outcomes | Pair each script with the document or module it verifies |
| codex | Agent/local environment files can change operating rules or local machine behavior | Keep `.codex` local unless explicitly approved |
| other | `lib/heu-role-lanes.ts` is shared role/governance logic | Review with permission and legal/SOP lanes |

## 5. Reviewable First

| Priority | Group | Why first |
|---:|---|---|
| 1 | docs | Lowest execution risk and can explain intent before code review |
| 2 | scripts | Needed to understand which local gates will be trusted |
| 3 | config/codex | Must be isolated before running automated checks |
| 4 | database | High-risk review-only pass before any migration discussion |
| 5 | app/components/other | Review after docs/scripts define intended behavior and guards |

## 6. Absolutely Do Not Run Or Modify Yet

- Do not run Supabase migration commands.
- Do not run `supabase db push`.
- Do not deploy.
- Do not run `npm install` or `npm ci`.
- Do not execute finance/payment actions from `app/ttgdtx/payment-requests/**`.
- Do not change or stage `database/**` until review scope and rollback are approved.
- Do not commit `.codex/**` without explicit local-environment review.
- Do not bundle `package.json`, `next.config.ts`, SQL files, and app actions into one PR.

## 7. Conclusion

Current classification result: CAN_SUA.

Reason: The worktree has been classified, but the mixed dirty state is broad.
It requires PR splitting, owner review, and focused verification before any
PASS_LOCAL claim outside this local control document package.
