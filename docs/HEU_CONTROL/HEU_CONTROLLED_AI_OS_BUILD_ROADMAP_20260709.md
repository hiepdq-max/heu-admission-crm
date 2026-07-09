# HEU Controlled AI OS Build Roadmap 2026-07-09

Task ID: HEU-BUILD-ROADMAP-001-CONTROLLED-AI-OS
Repository: heu-admission-crm
Branch: codex/heu/build-roadmap-control
Status: DRAFT_CONTROL
Production status: NO-GO
Scope: docs-only build roadmap, no runtime code

## 1. Executive Goal

Build HEU as one main app for real use as early as possible.

Core decision:

| Principle | Decision |
|---|---|
| Architecture | One main modular monolith app, not one app per module |
| Data | One shared database, separated by workspace, role and scope |
| Users | Each department/user sees only their authorized data and tasks |
| AI | Draft, check and suggest only; no real-data mutation |
| Cost | Few automation steps, few AI calls, no new paid service unless required |
| Delivery | Small PRs, focused checks, clear rollback |

This roadmap does not approve production, UAT, evidence acceptance, finance
action, migration, owner GO/NO-GO or BGH signoff.

## 2. Current Evidence Read

This roadmap is based on the current HEU control sources:

| Evidence | Current control meaning |
|---|---|
| `docs/HEU_CONTROL/README.md` | `docs/HEU_CONTROL` is the local control hub for PR split and scope routing |
| `docs/HEU_CURRENT_STATE_INVENTORY.md` | HEU is Stage D internal controlled test only; production remains NO-GO |
| `docs/HEU_SYSTEM_BUILD_BACKLOG.md` | P0/P1/P7 gates already define repo, user/scope, Data Confirmation and AI advisory boundaries |
| `docs/HEU_AI_ASSISTANT_POLICY_20260627.md` | AI remains advisory; no approval, finance action or production GO |
| `docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md` | AI may draft/check/warn from approved role-scoped sources only |

Live worktree status must still be checked before every implementation slice.

## 3. Non-Negotiable Stop Rules

Stop and return `NO_GO` if a future slice tries to:

- split HEU into multiple production apps before the shared scope model is
  stable;
- add a paid service without cost cap, owner and rollback;
- call AI before deterministic filters, logging and kill switch exist;
- send raw PII, CCCD, bank/payment evidence, secrets, reset links or uncontrolled
  files to AI;
- run migration, deploy, Supabase push, install or CI without explicit approved
  scope;
- merge app, database, scripts, config and docs in one broad PR;
- let AI approve, pay, admit, mark revenue, write real data, send official
  email, create real users or mark production GO.

## 4. Phase 0 - Build Control Lock

Target duration: 3-7 days.

Goal: make the workspace controllable before expanding features.

| Work item | Output | Owner lane | Exit gate |
|---|---|---|---|
| Split dirty scope | PR groups by docs, scripts, app/components, database, config and codex | IT_DATA + Audit | No broad mixed PR |
| Keep `docs/HEU_CONTROL` as handbook | Build decisions, rollback and PR split are discoverable | IT_DATA + Audit | DRAFT_CONTROL docs exist |
| Lock `HEUWorkspaceContext` | Every route/query can be scope-first | IT_DATA | Focused runtime checks pass |
| Lock AI cost guard | AI/automation has cap, log and kill switch | IT_DATA + Audit | Cost guard checker passes |
| Lock command rules | Use `npm.cmd`; no install/migration/deploy by default | IT_DATA | Local command policy visible |

Phase 0 result:

- Worktree is split into small PRs.
- HEU remains Stage D.
- Production remains NO-GO.

## 5. Phase 1 - User, Role And Scope Core

Target duration: 1-2 weeks.

Goal: login works and each user sees only their department scope.

| Core module | Required capability | First real-user behavior |
|---|---|---|
| User/Role | BGH, IT_DATA, Audit, Tuyen sinh, Ke toan, CTHSSV, Dao tao/Khoa | User lands on authorized home |
| Workspace scope | User department, role lane and business scope are explicit | No broad fallback query |
| Audit log | Read/write/confirm actions leave trace | Audit can inspect actions |
| Task Center | Department confirmation tasks can be assigned | User sees assigned tasks |
| Data Confirmation | Data waits for confirmation before official reliance | User can mark correct/fix/out-of-scope |

Exit gate:

- Users can log in.
- Unauthorized scope is not visible.
- Every write-capable route has permission and business-status guard.
- No finance reliance yet.

## 6. Phase 2 - Shared Data Foundation

Target duration: 2-4 weeks.

Goal: stop floating data by giving every major record an owner, status and source
trace.

| Data area | Required result |
|---|---|
| Student/profile master | Clean identity, dedupe route and status |
| Class/program/cohort | Standard code and owner |
| Admissions lead | Lifecycle status and handover point |
| CTV/source | Source owner and attribution |
| File registry | File/evidence metadata, no raw uncontrolled dump |
| Confirmation tasks | Department signs off before official use |

Exit gate:

- Data has owner lane, status and source reference.
- Raw evidence stays outside Git/Codex/chat.
- Dashboard/report uses only approved read models or clearly labeled draft data.

## 7. Phase 3 - Real Users First

Target duration: 4-6 weeks.

Goal: let real departments use narrow workflows before building everything.

Rollout order:

| Order | User group | First workflow | Allowed result |
|---:|---|---|---|
| 1 | Tuyen sinh | Lead -> tu van -> ho so -> ban giao | Real work tracking with owner review |
| 2 | CTHSSV | Student file -> status confirmation | Department confirmation queue |
| 3 | Ke toan | Receivable/tuition read-only and reconciliation draft | No official finance conclusion |
| 4 | Dao tao/Khoa | Class/list/schedule data confirmation | No class delivery reliance without owner evidence |
| 5 | BGH | Read-only dashboard | No daily data entry role |
| 6 | HOU | Separate HOU lane | HOU not mixed with HEU trung cap ledger |

Exit gate:

- Each pilot group has a small user guide.
- Each workflow has audit trace.
- Each blocker has owner lane.
- Signed UAT/evidence remains outside Git/Codex/chat.

## 8. Phase 4 - Finance And HOU With Controls

Target duration: 4-8 weeks after Phase 1/2 stability.

Goal: handle money only after legal, data and audit gates exist.

| Area | Required condition before deeper build |
|---|---|
| Receivable/tuition | Policy, status, owner and confirmation |
| HOU COM in | Contract, policy and HOU reconciliation |
| CTV/HEU COM out | Only after HOU/HEU confirmation and owner policy |
| Payment | Evidence, audit log, duplicate-payment guard |
| Finance dashboard | Read-only until data is reconciled and signed |

Exit gate:

- No revenue/debt/COM conclusion is official without owner confirmation.
- No payout action is possible without evidence and duplicate guard.
- HOU remains separated from TTGDTX and HEU trung cap data.

## 9. Phase 5 - AI Agent With Cost Guard

Target start: after scope, data and audit core are stable.

Goal: AI saves work without becoming an approver or cost leak.

| Agent | Start order | Role | Hard stop |
|---|---:|---|---|
| Control Agent | 1 | Read Git/worktree status and propose PR split | No automatic commit/push/PR |
| Audit Agent | 2 | Run/check focused local guards | No migration/deploy/install |
| Data Quality Agent | 3 | Find missing/duplicate metadata | No raw PII or source-data mutation |
| Workflow Agent | 4 | Draft department task suggestions | No real task/email write until approved |
| Finance Guard Agent | 5 | Warn about finance anomalies | No official finance conclusion |
| Legal/SOP Agent | 6 | Draft SOP/checklist | No issuance or waiver |

AI exit gate:

- Prompt/output audit design exists.
- Approved source allowlist exists.
- AI cost cap and kill switch exist.
- AI calls are off by default.
- Human approval gates are explicit.

## 10. PR Stack Recommendation

Recommended PR order from the current HEU state:

| PR order | Scope | Why first | Must not include |
|---:|---|---|---|
| 1 | HEU_CONTROL docs and build roadmap | Freeze direction and stop rules | Runtime code |
| 2 | AI cost guard docs/checker | Prevent expensive AI/automation drift | AI provider/runtime |
| 3 | AppShell + HEUWorkspaceContext + Data Confirmation shell | Opens the controlled user path | Database migration execution |
| 4 | Identity/scope review | User must see only authorized scope | Finance/HOU writes |
| 5 | Data Confirmation Task Center | Real users can confirm data | Production evidence acceptance |
| 6 | Admissions first workflow | Fastest real-use path | Broad finance decisions |
| 7 | CTHSSV confirmation workflow | Department use after admissions | HOU/finance mixing |
| 8 | Finance read-only/draft | Accounting visibility | Payment execution |
| 9 | Dao tao/Khoa confirmation | Academic data confirmation | Payroll/teaching reliance |
| 10 | HOU separated lane | Partnership tracking | Mixing HOU with HEU trung cap |

Every PR must name:

- scope;
- owner lane;
- files touched;
- focused `npm.cmd` check;
- rollback;
- remaining NO-GO.

## 11. Day-1 Real Use Definition

HEU is ready for controlled Day-1 real use only when all are true:

| Gate | Required evidence |
|---|---|
| Login | Real user can log in without secret exposure in Codex/chat |
| Role/scope | User sees only assigned department/workspace |
| Task queue | User sees assigned confirmation tasks |
| Data source | Record has source route/label and owner |
| Audit | Action leaves audit trace |
| Rollback | Admin can disable or revert the workflow |
| Privacy | No raw sensitive data goes to AI or Git |
| Status | Day-1 is controlled pilot, not production GO |

Day-1 status label:

```text
DAT_TAM_THOI_CONTROLLED_PILOT
Production remains NO-GO
```

## 12. Cost Control Model

Default spending rule:

| Layer | Default |
|---|---|
| App hosting | One app only |
| Database | One shared Supabase/Postgres database |
| Automation | In-app/local code first |
| AI | Off by default, dry-run first |
| Storage | Metadata in app; raw evidence in controlled external storage |
| Email | Existing mail flow first; no real send until owner approves |

Do not buy or enable a new paid service until there is:

- owner;
- monthly cap;
- test path;
- kill switch;
- rollback;
- audit log;
- reason existing HEU code cannot do it cheaper.

## 13. Operating Cadence

Weekly loop:

| Day/step | Action | Output |
|---|---|---|
| 1 | Pick one PR slice | Scope locked |
| 2 | Read current docs and dirty diff | Risk known |
| 3 | Implement or document one narrow change | Small PR |
| 4 | Run focused `npm.cmd` check | PASS_LOCAL or NO_GO |
| 5 | Draft PR for IT_DATA + Audit | Reviewable unit |
| 6 | Owner review | Decision or blocker |
| 7 | Update roadmap/backlog | Next slice selected |

Do not start the next dependent slice while a required owner decision is
missing.

## 14. Result Record

SOP-SCOPE:

- This roadmap records the controlled build direction for one main HEU app,
  shared data, department scope, advisory AI and small PR delivery.

SOP-CHECK:

- Checked current control hub, current-state inventory and build backlog before
  writing this roadmap.

SOP-PROFESSIONAL:

- IT_DATA owns technical sequencing.
- Audit owns PASS/NO-GO and evidence discipline.
- Department owners own workflow correctness.
- BGH/Owner owns final priority and official approval.

SOP-LEGAL:

- PHAP_CHE must review legal/SOP/finance/HOU policy dependencies before reliance.

SOP-LOGIC:

- Scope-first runtime, data confirmation and audit log must precede broad module
  rollout.
- Finance and HOU remain behind legal/data/audit gates.

SOP-VERIFY:

- This docs-only roadmap should be checked by file existence, token review,
  whitespace check and `git status --short --branch`.

SOP-RESULT:

- `DAT_TAM_THOI` for local roadmap control only after docs/scope check passes.
- Runtime completion remains `NO_GO`.
- Production remains `NO-GO`.

SOP-NEXT:

- Review this roadmap with IT_DATA + Audit + BGH.
- Then choose the next PR: AI cost guard Draft PR or AppShell/HEUWorkspaceContext
  Draft PR review.
