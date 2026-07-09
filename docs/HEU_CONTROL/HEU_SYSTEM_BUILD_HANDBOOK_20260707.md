# HEU System Build Handbook 2026-07-07

Task ID: HEU-CONTROL-003-CREATE-SYSTEM-BUILD-HANDBOOK
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
HEAD at handbook start: 246c206
Status: DRAFT_CONTROL
Production status: NO-GO

## 1. Purpose

This handbook is the central operating guide for continuing the HEU software
build without losing context, repeating known mistakes, mixing unrelated dirty
worktree scopes, or letting AI/Codex overstep into approval, finance, evidence,
migration, UAT, or production decisions.

This file is a routing and control document only. It does not approve
production, migration, UAT, evidence acceptance, finance reliance, owner
GO/NO-GO, or official SOP issuance.

## 2. Read These 5 Files Before Any New Slice

| Order | File | Why it must be read |
|---:|---|---|
| 1 | `docs/HEU_CODEX_OPERATING_PLAYBOOK.md` | Defines Codex working rules, PASS_LOCAL SOP loop, forbidden AI behavior, and Windows `npm.cmd` rule. |
| 2 | `docs/HEU_CURRENT_STATE_INVENTORY.md` | Shows current technical stack, Stage D boundary, live-state rule, and production NO-GO posture. |
| 3 | `docs/HEU_SYSTEM_BUILD_BACKLOG.md` | Shows P0/P1/P2 build queue, owners, gates, blockers, and which controls are PASS_LOCAL only. |
| 4 | `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md` | Classifies modules as `DAT`, `CAN_SUA`, `CHUA_DU_DIEU_KIEN`, or `CAM_CODE`, with allowed and forbidden next work. |
| 5 | `docs/HEU_IMPLEMENTATION_LOG.md` | Records what was changed, why, local checks, remaining owner work, and exact boundaries from previous slices. |

Minimum live checks before editing:

```powershell
git status --short --branch
git rev-parse --short HEAD
git diff --name-only
git diff --cached --name-status
git ls-files -o --exclude-standard
```

Use `npm.cmd` on Windows. Do not use bare `npm` in this workspace.

## 3. Current System Position

| Area | What exists now | Current boundary |
|---|---|---|
| P0 governance/control | Current-state inventory, system backlog, gap matrix, implementation log, control register, evidence redaction, production blocker, owner signoff pack | Strong local control foundation; still DRAFT_CONTROL/PASS_LOCAL until owner evidence and signoff exist |
| TTGDTX 9+ pilot | P2-01 through P2-19 packages, finance flow docs, production checklist, accounting local readiness chain, duplicate payout controls | Current approved hardening scope; production remains NO-GO |
| Finance Desk | Read-only `/finance-desk`, Day-1 handoff/checklists, controlled trial plan, UAT/runbook, evidence and reliance decision docs | Read-only cockpit only; no statutory accounting, voucher posting, payment approval, or finance reliance |
| Identity/permission/auth | User create/security guards, permission/scope readiness, role/position owner queues, password reset handoff, scope baseline repair | Local readiness and owner routing exist; real user creation/link/scope widening remains owner-controlled |
| Data Confirmation Task Center | Schema contract and route-control model for `CHO_XAC_NHAN`, `DUNG`, `CAN_SUA`, `KHONG_THUOC_TOI`, `DA_KHOA` | Migration-candidate and controlled route only; no real task seeding or production SQL without approval |
| Reports/dashboard/executive | Read-only dashboard/report-source maps, BGH/executive control rows, report-view reliance locks | Read-only decision support; no dashboard reliance before signed UAT/report-view owner signoff |
| Admissions M05 | Lead/import, pipeline/follow-up, document scope, signed UAT evidence intake and local completion packages | Local/read-only packaging; no real lead import, handover acceptance, evidence acceptance, or owner GO |
| CTHSSV M06 | Module completion breakdown, owner evidence handoff, external execution, reporting handoff, aggregate readiness alignment | Local completion/read-only packaging; real operation remains NO-GO |
| Dao Tao/Khoa/Short Course | Short Course, Khoa/Giang vien, and Dao Tao local readiness packages and handoff proof docs | Non-current production scope; review-only unless selected as a later small slice |
| AI/automation | AI assistant policy, AI agent scope register, cloud-agent plan, fast-local-loop, dynamic guards, daily report/email readiness dry-run | Advisory and local automation only; no autonomous approval, write, email, task, payment, migration, or production GO |

## 4. Known Mistakes And How To Avoid Them

| Mistake already seen | Symptom | Prevention |
|---|---|---|
| Dirty worktree collision | Many modules dirty at once; a broad stage/commit would mix docs, scripts, SQL, app routes, config, and local Codex files | Always lock `git status`, classify scope, choose one small slice, and stage only reviewed related files |
| Green check with untracked dependency | A checker passes locally but depends on untracked docs/scripts | Package the dependency chain first or mark the result as local-only and incomplete |
| Build lock / concurrent Next process | Build says another Next build is running, or `.next/lock` blocks runtime verification | Inspect active Next dev/build process first; do not claim build PASS until rerun in a clean runtime state |
| Missing implementation log entry | Audit fails even after code/doc change exists | Re-read the top of `HEU_IMPLEMENTATION_LOG.md` immediately before adding the log entry; use exact tokens required by the checker |
| Regex token drift | Audit expects exact wording and fails on paraphrase | Preserve required literal tokens and section names from the checker/script |
| PASS_LOCAL misread as approval | Local check passes and someone treats it as UAT, finance, owner, or production approval | Always write `PASS_LOCAL`, `DRAFT_CONTROL`, `NO_GO`, `BLOCKED`, and external owner decision boundaries explicitly |
| Hard-delete risk | Data cleanup removes or hides finance/evidence/audit history | Use status transitions, archive fields, rollback notes, and audit records; never hard-delete protected rows |
| Migration order risk | SQL is run before backup, restore proof, migration order, or owner approval | Keep database work review-only until backup/rollback/migration order and authority approval exist |
| AI approval drift | AI suggests an action and it is treated as approval | AI may draft, summarize, warn, and check only; humans approve, sign, pay, migrate, and go-live |
| Finance reliance drift | Read-only Finance Desk/dashboard is treated as official accounting | Finance reliance requires signed finance UAT, source proof, controlled evidence, access closure, and owner decision |
| Sensitive evidence drift | Raw evidence, CCCD, phone, bank, payment, password, token, or reset link enters Git/Codex/chat | Use only sanitized metadata and controlled evidence refs; raw evidence stays outside Git/Codex/chat |

## 5. Standard Build Flow For Every Slice

| Step | Action | Required output |
|---:|---|---|
| 1 | Status lock | Live `git status --short --branch`, HEAD, changed files, staged files, untracked files |
| 2 | Choose one small slice | One module, one control lane, one clear owner boundary |
| 3 | Read required sources | The 5 mandatory files plus the module-specific runbook/register/checker |
| 4 | Edit only in scope | No unrelated refactor; no broad formatting; no unrelated dirty-file overwrite |
| 5 | Verify locally | Use focused `npm.cmd` check/audit/lint/build only after scope is clean enough |
| 6 | Log the slice | Update implementation log or control register when the slice changes state |
| 7 | Decide next | `PASS_LOCAL`, `NO_GO`, or `BLOCKED`, then name the next smallest safe slice or blocker |

Default conclusion rules:

| Situation | Conclusion |
|---|---|
| Only classified or routed work, no focused verification | `CAN_SUA` or `DAT_TAM_THOI` for routing only |
| Local docs/control slice created and verified by file/diff checks | `DAT_TAM_THOI` for local control docs only |
| Focused guard fails or external owner evidence is missing | `NO_GO` or `BLOCKED` |
| BGH/authorized owner has not signed | Never `DAT_CHINH_THUC` |

## 6. Smart Automation Map

| Need | Command | Use when | Boundary |
|---|---|---|---|
| Quick worktree and dynamic guard routing | `npm.cmd run check:heu-fast-local-loop` | Before choosing the next slice or when the worktree is broad | Snapshot/guard routing only unless explicit runtime mode is used |
| Runtime/lint/build bundle | `npm.cmd run check:heu-fast-local-loop -- --runtime` | After runtime scope is isolated and no active Next build/dev process blocks verification | Local PASS only, not production runtime approval |
| Strict clean handoff | `npm.cmd run check:heu-fast-local-loop -- --strict-worktree` | Before final handoff when the slice should be clean and isolated | Should not be used to hide unrelated dirty files |
| Run registered dynamic guards | `npm.cmd run check:heu-fast-local-loop -- --run-dynamic-guards` | Only when operator intentionally wants focused registered guards to execute | Do not widen into unrelated modules automatically |
| Git hygiene | `npm.cmd run audit:heu-git-hygiene` | Before staging/commit/handoff of a clean slice | Does not replace human scope review |
| Implementation log coverage | `npm.cmd run audit:heu-implementation-log` | After changing docs/control state or adding a slice log | Requires exact wording/tokens |
| Current-state inventory coverage | `npm.cmd run audit:heu-current-state-inventory` | After changing status inventory or build-state docs | Does not approve production |
| Release gate consistency | `npm.cmd run audit:ttgdtx-release-gates` | Before claiming a TTGDTX release-gate local state | Production still NO-GO until owner signoff |
| AI policy enforcement | `npm.cmd run audit:heu-ai-policy` | When AI docs, assistant, agent, or automation boundaries change | AI remains advisory-only |
| TTGDTX/accounting readiness | `npm.cmd run check:heu-accounting-local-readiness` | For TTGDTX/Finance local accounting chain | Does not approve finance reliance or payout |
| User/account readiness | `npm.cmd run check:heu-user-create-readiness` | For account creation/link readiness review | Does not create accounts or send reset/invite links |
| Permission/scope readiness | `npm.cmd run check:heu-permission-scope-readiness` | For role/workspace/scope changes | Does not grant access |
| Admissions local completion | `npm.cmd run check:heu-admissions-local-completion` | For M05 admissions package review | Does not import or mutate leads |
| CTHSSV local completion | `npm.cmd run check:heu-cthssv-local-completion` | For M06 CTHSSV package review | Real operation remains NO-GO |
| Dao Tao local readiness | `npm.cmd run check:heu-dao-tao-local-readiness` | For M07/M08 local package aggregation | No class operation or owner GO |
| Daily report dry-run | `npm.cmd run report:heu-daily-dry-run` | To produce a local report draft | Does not send email or create tasks |
| Email readiness dry-run | `npm.cmd run report:heu-email-readiness` | To check email readiness checklist | Does not send real email |

## 7. What AI/Codex May And Must Not Do

AI/Codex may:

- Draft docs, checklists, summaries, owner questions, and safe control rows.
- Read role-scoped, approved, redacted, or metadata-only sources.
- Detect missing evidence, duplicate risk, hard-delete risk, scope leakage, and production blockers.
- Run local read-only checks and focused local verification when allowed.
- Suggest the next small slice or blocker.

AI/Codex must not:

- Approve legal, SOP, finance, admission, UAT, migration, evidence, owner GO/NO-GO, or production decisions.
- Pay, mark money received, clear debt, post vouchers, issue bank instructions, or finalize COM.
- Create real accounts, send passwords, send reset/invite links, grant scope, or widen permissions without owner-controlled workflow.
- Run production SQL/migration/deploy without backup, rollback, migration order, and explicit authority approval.
- Read, store, expose, or request raw restricted data, secrets, CCCD, phone, bank, payment, salary, or raw student data.
- Send real email, create real tasks/tickets, or activate autonomous cloud agents without approved configuration and owner signoff.

## 8. Module-Specific First Check

| If the slice touches | Read first | First likely command |
|---|---|---|
| TTGDTX/Finance | TTGDTX production checklist, accounting breakdown, finance runbooks, controlled evidence docs | `npm.cmd run check:heu-accounting-local-readiness` |
| Database/SQL | Migration order audit, SQL object map, backup/restore docs, rollback note | Review-only first; no command that mutates DB |
| User/auth/scope | User permission gate, scope baseline repair queue, role/position owner queue, auth handoff | `npm.cmd run check:heu-permission-scope-readiness` |
| Admissions M05 | Lead lifecycle, handover policy, M05 owner closure/docs queue | `npm.cmd run check:heu-admissions-local-completion` |
| CTHSSV M06 | CTHSSV module breakdown, signed UAT intake, owner evidence proof | `npm.cmd run check:heu-cthssv-local-completion` |
| Dao Tao/Khoa/Short Course | Training breakdown, short-course/khoa local gates, evidence handoff docs | `npm.cmd run check:heu-dao-tao-local-readiness` |
| Dashboard/report | Report view register, report source map, data-master compatibility, BGH dashboard spec | `npm.cmd run audit:heu-bgh-dashboard-spec` plus focused report checker |
| AI/automation | AI assistant policy, AI agent scope register, cloud-agent plan, build collision triage | `npm.cmd run audit:heu-ai-policy` |

## 9. SOP Slice Result Record Template

Use this template in final reports and local handoff notes:

```text
SOP-SCOPE:
- Task ID:
- Module:
- Files touched:
- Stage D / NO-GO boundary:

SOP-CHECK:
- git status --short --branch:
- HEAD:
- git diff --name-only:
- git diff --cached --name-status:
- git ls-files -o --exclude-standard:
- Required docs read:

SOP-PROFESSIONAL:
- Owner lane/source:
- Checked artifact:
- Result: PASS / NO_GO / BLOCKED
- Advisory/DRAFT_CONTROL or external owner decision:

SOP-LEGAL:
- PHAP_CHE/SOP/evidence-class source:
- Checked artifact:
- Result: PASS / NO_GO / BLOCKED
- Stop rule:

SOP-LOGIC:
- IT_DATA/Audit source:
- Data boundary:
- Role/workspace scope:
- Audit path:
- No-secret handling:
- Result: PASS / NO_GO / BLOCKED

SOP-VERIFY:
- Commands run:
- Result per command:
- Not run:
- Why not run:

SOP-RESULT:
- CHUA_KIEM / DANG_KIEM / CAN_SUA / DAT_TAM_THOI / CHO_BGH_DUYET / DAT_CHINH_THUC
- PASS_LOCAL / NO_GO / BLOCKED wording:

SOP-NEXT:
- Next smallest safe slice:
- Smallest blocker if not safe:
- Owner decision still required:
```

## 10. Stop Conditions

Stop immediately and report `NO_GO` or `BLOCKED` if any of these appear:

- Missing live Git status or mixed scope cannot be separated safely.
- Required 5 source files are not read for a meaningful change.
- The change would touch production data, run migration, deploy, or alter finance state without approval.
- The slice depends on raw evidence, raw workbook, raw bank statement, secrets, passwords, reset links, or personal data.
- A local PASS result would be interpreted as signed UAT, evidence acceptance, legal advice, finance reliance, owner GO, or production GO.
- Focused guard fails and the next step depends on that guard.
- External owner decision, controlled evidence reference, backup, restore proof, or signed migration order is missing.

## 11. Version Log

| Version | Date | Change | Evidence |
|---|---|---|---|
| V01 | 2026-07-07 | Created central HEU system build handbook for future slices | Live Git status, 5 required source docs, AI policy/register, build collision triage, package script list |

## 12. Current Handbook Result

SOP-SCOPE: `HEU-CONTROL-003` creates a central build handbook under
`docs/HEU_CONTROL`.

SOP-CHECK: Live Git status and handbook file existence were checked before
creation; five required sources and AI/automation sources were read.

SOP-PROFESSIONAL: Owner lanes remain the module owners listed in backlog and
gap matrix; this handbook does not replace them.

SOP-LEGAL: PHAP_CHE still owns legal/SOP/evidence-class decisions; this
handbook is not legal approval.

SOP-LOGIC: No code, script, SQL, config, secret, raw data, or runtime behavior
is changed by this handbook.

SOP-VERIFY: Docs-only verification is file existence plus `git diff --check`
for `docs/HEU_CONTROL`; no `npm.cmd` check is required for this docs-only
handbook.

SOP-RESULT: `DAT_TAM_THOI` for local control handbook only.

SOP-NEXT: Use this handbook before starting `HEU-SCRIPTS-003` or any module
PR split.
