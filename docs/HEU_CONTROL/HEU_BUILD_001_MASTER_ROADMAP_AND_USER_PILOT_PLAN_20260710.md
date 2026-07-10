# HEU Build 001 - Master Roadmap And User Pilot Plan

Task ID: HEU-BUILD-001-MASTER-ROADMAP-AND-USER-PILOT-PLAN
Date: 2026-07-10
Repository: heu-admission-crm
Status: DRAFT_CONTROL
Production status: NO-GO
Scope: docs-only planning control

## 1. Operating Objective

Build HEU as one main production-ready app used early by real users, without
splitting every module into a separate application during this stage.

The target architecture is:

| Layer | Decision |
|---|---|
| App architecture | One main modular monolith app |
| Data | One shared database, separated by workspace, role, and scope |
| Users | Each department sees only its own permitted work and data |
| AI | Draft, check, and suggest only; no real-data mutation |
| Cost | Few automation steps, few AI calls, no paid service unless justified |
| Delivery | Small PRs, focused checks, clear rollback |

This document does not approve production, migration, real finance action,
official SOP issuance, or owner GO/NO-GO.

## 2. Non-Negotiable Boundaries

| Boundary | Rule |
|---|---|
| Architecture | Do not create separate apps per department in this phase |
| Database | Do not run migrations without backup, rollback, order, and approval |
| AI | AI cannot approve, pay, issue SOP, mutate real data, or unlock production |
| Automation | No paid/broad automation before a filter, log, and kill switch exist |
| Finance | No official revenue, debt, tuition, or COM conclusion without owner evidence |
| HOU | Keep HOU separated from internal HEU training data and authority |
| Evidence | Raw PII, bank, CCCD, payment, token, password data stay outside Git/Codex/chat |
| Git | Do not combine dirty scopes; keep PRs small and draft until reviewed |

## 3. Build Phases

| Phase | Duration | Main goal | Required result |
|---:|---|---|---|
| 0 | 3-7 days | Lock build foundation | Dirty scope split, HEU_CONTROL as handbook, AI cost guard, no unsafe migration |
| 1 | 1-2 weeks | User, role, workspace, audit, task core | Login user sees the right department work only |
| 2 | 2-4 weeks | Data foundation | Students, leads, classes, files, and tasks stop drifting |
| 3 | 4-6 weeks | Real-user pilot | Departments use Task Center and Data Confirmation on controlled data |
| 4 | 4-8 weeks | Finance and HOU control | Finance/HOU run as controlled workflows, not broad calculations |
| 5 | After scope is stable | Low-cost AI agents | AI checks and drafts only, with logs and no autonomous write |

## 4. Phase 1 Core

| Core module | Required capability | First acceptance check |
|---|---|---|
| User/Role | BGH, IT_DATA, Audit, Admission, Finance, CTHSSV, Training/Khoa | Each user has one clear owner lane |
| Workspace scope | Department and business-scope boundary | No broad fallback when scope is missing |
| HEUWorkspaceContext | Shared context wrapper for app routes | Scope resolved before query |
| RBAC/RLS | Permission checked before read/write | User cannot see another department by default |
| Audit log | Who viewed, changed, confirmed, approved | Every meaningful action has metadata |
| Task Center | Department task inbox | Task has owner, status, evidence ref, and due lane |
| Data Confirmation | Pending data must be confirmed before official use | Data state is explicit |

## 5. Real-User Pilot Order

| Priority | User group | First usable workflow | Why first |
|---:|---|---|---|
| 1 | Admission | Lead -> advise -> dossier -> handover | High daily value, clear statuses |
| 2 | CTHSSV | Student dossier -> status confirmation | Reduces data mismatch after handover |
| 3 | Finance | Debt/tuition read-only draft reconciliation | High risk, so read-only first |
| 4 | Training/Khoa | Class/list/schedule confirmation | Needs clean student and class master |
| 5 | BGH dashboard | Read-only operating dashboard | Decision support, not data entry |
| 6 | HOU | Separated HOU workflow and ledger | Different authority and finance basis |

## 6. Low-Cost AI Agent Plan

| Agent | Enable first? | Allowed work | Forbidden work |
|---|---|---|---|
| Control Agent | Yes | Read git status, classify PR split, detect scope overflow | Edit code without explicit task |
| Audit Agent | Yes | Run local checkers, report PASS/NO-GO | Approve UAT/production |
| Data Quality Agent | Later | Detect missing/duplicate metadata | Read raw PII/payment data |
| Workflow Agent | Later | Draft task suggestions | Assign official tasks without human confirmation |
| Finance Guard Agent | Much later | Warn about unusual finance patterns | Conclude debt/revenue/COM officially |
| Legal/SOP Agent | Later | Draft SOP/checklist | Issue official SOP |

Cost rule: prefer deterministic code, filters, and local checkers before AI
calls. Use automation tools only for stable If/Then flows with filters, logs,
and an on/off switch.

## 7. First Runtime Slice

The first runtime slice is narrow:

| Runtime item | Minimum result |
|---|---|
| `lib/heu-workspace-context.ts` | Shared scope wrapper on top of existing admission workspace helper |
| `/reports` | Resolve context before query, block missing read/scope, then apply scoped query |
| Query budget | Lead list is capped and lookups are capped |
| AI/runtime | No AI call, no paid automation, no production GO |

## 8. Local Static Checker

HEU-BUILD-002-ROADMAP-STATIC-CHECKER adds a read-only local checker for this
roadmap:

```powershell
node --check scripts/check-heu-build-master-roadmap-readiness.mjs
npm.cmd run check:heu-build-master-roadmap-readiness
```

Expected local result:

- `HEU_BUILD_MASTER_ROADMAP_READY: PASS_LOCAL`
- `NO_RUNTIME_CHANGE: roadmap checker only; no separate app, no database migration, no AI runtime, no paid automation, no production GO`

## 9. Next Small Tasks

| Order | TASK_ID | Goal | Stop condition |
|---:|---|---|---|
| 1 | HEU-BUILD-001-MASTER-ROADMAP-AND-USER-PILOT-PLAN | Lock the master plan | This docs-only file exists and is reviewed |
| 2 | HEU-BUILD-002-ROADMAP-STATIC-CHECKER | Add a checker for this roadmap | Checker is read-only and local |
| 3 | HEU-PERF-003R-WORKSPACE-CONTEXT-RUNTIME-READINESS-CHECK | Guard the first `/reports` context pilot | No route fan-out |
| 4 | HEU-DATA-024-TASK-CENTER-ADAPTER-DRY-RUN-READINESS-REVIEW | Review Task Center adapter readiness | Still no DB migration |

## 10. Decision Needed From Human Authority

| Decision | Authority |
|---|---|
| Confirm one-app modular monolith strategy | BGH + IT_DATA |
| Confirm first real-user pilot department | BGH + department owner |
| Confirm data allowed for pilot | IT_DATA + PHAP_CHE + Audit |
| Confirm finance remains read-only/draft first | KHTC + Audit + BGH |
| Confirm AI remains draft/check/suggest only | BGH + IT_DATA + Audit |

## 11. Current Status

Conclusion status: CAN_SUA

Reason: The roadmap is a DRAFT_CONTROL planning artifact. It can guide the
next implementation slices, but it does not prove runtime readiness, user UAT,
database safety, finance reliance, or production readiness.

Production remains NO-GO.
