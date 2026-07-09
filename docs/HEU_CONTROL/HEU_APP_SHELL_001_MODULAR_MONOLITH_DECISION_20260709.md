# HEU App Shell 001 Modular Monolith Decision

Task ID: HEU-APP-SHELL-001-MODULAR-MONOLITH-DECISION
Date: 2026-07-09
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
Status: DRAFT_CONTROL
Production status: NO-GO

## 1. Decision

HEU will continue as one main web app with multiple internal modules, shared
data boundaries and role/workspace scope access.

Chosen architecture:

```text
HEU Web App
|- App Shell chung
|- Login / User / Role / Workspace Scope
|- Dashboard BGH
|- Tuyen sinh
|- CTHSSV
|- Dao tao / Khoa
|- Finance read-only
|- Data Confirmation Task Center
|- Reports
|- Audit Log
`- AI Agent Control
```

Architecture name: Modular Monolith / HEU App Shell.

This decision is a control record only. It does not approve production, UAT,
evidence acceptance, finance reliance, migration, user access grants, owner
GO/NO-GO or BGH signoff.

## 2. Why This Decision

HEU is currently built by a very small delivery team. Splitting every module
into a separate application now would multiply deployment, authentication,
authorization, data-sync, audit and support cost before the real user workflows
are stable.

The right next state is:

```text
Mot app chinh.
Nhieu module noi bo.
Du lieu chung nhung tach domain.
Moi user thay dung menu va dung du lieu theo role/scope.
Task Center la noi giao viec va xac nhan.
Audit Log la noi kiem soat.
```

## 3. Comparison

| Criteria | One App Shell With Internal Modules | Separate App Per Module |
|---|---|---|
| Speed to usable software | Fastest | Slower |
| Suitable for 1-2 builders | Yes | No, high coordination cost |
| Login and permission | One authority path | Must sync across apps |
| Shared data | Easier to protect and reuse | Higher drift risk |
| Fast user access | Scope-first queries and role menu | Possible but more complex |
| Department rollout | Menu and route based | Multiple app URLs and handoffs |
| Audit | Centralized | Distributed |
| Future split | Still possible later | Premature split can break flow |

Decision: keep one HEU App Shell until module ownership, workflows, data APIs
and operating load justify a future split.

## 4. Data Domain Boundary

The app is one deployment, but data ownership remains separated by domain:

| Domain | Data family | Owner lane |
|---|---|---|
| Identity | USER_MASTER, ROLE_PERMISSION_MATRIX, ORG_UNIT_MASTER | IT_DATA + ADMIN + Audit |
| Student base | HOC_SINH_MASTER, LOP_MASTER, NGANH_MASTER | IT_DATA + department owners |
| Admission | TUYEN_SINH_* | Tuyen sinh + IT_DATA + Audit |
| CTHSSV | CTHSSV_* | CTHSSV + Audit |
| Dao tao / Khoa | DAO_TAO_*, KHOA_* | Dao tao + Khoa owner |
| Finance | FINANCE_*, CONG_NO_*, PAYMENT_* | KHTC + Audit |
| Task Center | TASK_CENTER, data confirmation tasks | Department owners + IT_DATA |
| Audit | AUDIT_LOG, APPROVAL_LOG, VERSION_LOG | Audit + IT_DATA |
| Files | FILE_REGISTRY, controlled evidence refs | IT_DATA + PHAP_CHE + Audit |

Rule: module boundaries are enforced by role, workspace scope, route guards,
query predicates and audit log, not by separate app deployments at this stage.

## 5. Fast Access Rules

Every user-facing route must follow these rules:

| Rule | Required behavior | Stop condition |
|---|---|---|
| APP-SHELL-Q01 | Resolve workspace context once on server before business queries | Route queries business rows before context |
| APP-SHELL-Q02 | Filter by user, role, department, workspace or segment before reading data | Route fetches broad data then filters in UI |
| APP-SHELL-Q03 | Use pagination, top-N or bounded summary queries | Route renders full table by default |
| APP-SHELL-Q04 | Dashboard reads summaries/read models/RPC totals, not raw large tables | Dashboard scans raw operational data |
| APP-SHELL-Q05 | Task cards store refs and metadata, not copied raw payloads | Task inbox duplicates student/payment/evidence data |
| APP-SHELL-Q06 | Finance remains read-only until signed finance UAT and owner decision | UI can clear debt, pay, post voucher or approve COM |
| APP-SHELL-Q07 | AI is draft/suggest/check only | AI approves, mutates real data, sends real email or creates real tasks |

## 6. Real User Rollout Model

First pilot should use a small controlled group, not all users.

| User lane | First menu | Permission boundary |
|---|---|---|
| BGH | Overview, blockers, reports | Read-only, no daily data entry |
| IT_DATA | User, role, scope, system checks | No business approval by default |
| Audit | Audit log, scope leak, evidence gaps | Read-only review |
| PHAP_CHE | SOP/legal/evidence-class review | No data mutation unless explicitly assigned |
| Tuyen sinh | Leads, hồ sơ, assigned tasks | Own scope only |
| CTHSSV | Student confirmation, handover tasks | Own department/scope only |
| Dao tao / Khoa | Class, program, teacher/status tasks | Own department/scope only |
| KHTC / Finance | Finance read-only, reconciliation evidence refs | No payment/debt clearing without gate |

Minimum real-user pilot size: 8 to 12 users.

## 7. First Usable Product Definition

The fastest usable HEU product is not the full ERP. It is:

```text
Login
Role/scope menu
My Work / Department Task Inbox
Data Confirmation Task Center
Read-only dashboard/report status
Audit log
Controlled evidence reference
```

This lets departments use the software immediately for confirmation and
tracking without granting broad production authority.

## 8. Implementation Phases

| Phase | Goal | Scope | Gate |
|---:|---|---|---|
| 0 | Clean delivery lane | PR split, docs/control, stale-base alignment | No broad dirty commit |
| 1 | Identity and scope | user, role, department, workspace context | negative access PASS_LOCAL |
| 2 | App Shell navigation | role-based menu and landing | each role sees only allowed modules |
| 3 | My Work / Task Center | department task inbox and DCTC route | metadata/ref-only, audit log ready |
| 4 | Module pilot | Tuyen sinh, CTHSSV, Dao tao/Khoa, Finance read-only | signed UAT per lane |
| 5 | BGH reporting | read-only executive summaries and blockers | report-view owner signoff |
| 6 | Production gate | backup, restore proof, signed UAT, owner GO/NO-GO | BGH/owner approval required |

## 9. Future Split Rule

A module may become a separate app only when all three conditions are true:

1. The module has a stable owner, stable workflow and regular real-user usage.
2. The data/API boundary is stable enough that cross-app sync will not create
   duplicate truth.
3. There is a real security, scale, compliance or operations reason to split,
   plus a responsible operator for that app.

Possible future split targets:

| Future app | Only after |
|---|---|
| finance.heu.vn | signed finance UAT, stable finance API and KHTC owner operation |
| admission.heu.vn | stable admission flow, signed handover UAT and lead/data scope closure |
| audit.heu.vn | central audit data contract and evidence reference model are stable |

Until then, keep the App Shell.

## 10. Forbidden Shortcuts

- Do not create microservices to look mature.
- Do not create one app per department before user workflows are stable.
- Do not duplicate raw student, payment, evidence or workbook data into task
  cards, AI prompts, logs or dashboards.
- Do not use dashboard PASS_LOCAL as finance reliance or owner approval.
- Do not give BGH or executive roles hidden mutation authority.
- Do not run production SQL/migration/deploy from this decision.
- Do not move raw evidence, secrets, CCCD, bank data, passwords or tokens into
  Git, Codex or chat.

## 11. Next Small Code Direction

The first runtime slice after docs/control alignment should be:

```text
HEUWorkspaceContext wrapper
One route pilot only
Scope-first query
Role-based menu/landing
Focused permission/scope check
No database migration
No broad route rewrite
```

Recommended first route order:

1. `/reports` and home dashboard read-only route: adopted in this slice chain.
2. `/data-confirmation` task queue shell: adopted as ref-only/read-only route.
3. `/search` metadata-only route.
4. Department module route selected by pilot owner.

## 12. Verification Plan

Docs-only verification:

```powershell
Test-Path -LiteralPath 'docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md'
Select-String -Path 'docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md' -Pattern 'Modular Monolith|HEU App Shell|APP-SHELL-Q01|First Usable Product|Future Split Rule|Production status: NO-GO'
git diff --check -- docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md
```

Future runtime verification after code changes:

```powershell
npm.cmd run check:heu-data-confirmation-task-center
npm.cmd run check:heu-permission-scope-readiness
npm.cmd run audit:heu-user-account-security
npm.cmd run check:heu-fast-local-loop
npm.cmd run lint
npm.cmd run build -- --webpack
```

Do not run runtime verification for this docs-only decision record.

## 13. SOP Slice Result Record

SOP-SCOPE:
- `HEU-APP-SHELL-001` records the architecture decision for one HEU App Shell
  with internal modules and shared scoped data.
- Runtime scope wrapper added at `lib/heu-workspace-context.ts` as an adapter
  around the existing admission workspace helpers.
- Draft PR handoff evidence is recorded at
  `docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md` for IT_DATA
  and Audit review.
- Route pilot integration added at `app/page.tsx`, `app/leads/page.tsx`,
  `app/leads/new/page.tsx`, `app/import/page.tsx`, `app/reports/page.tsx` and
  `app/data-confirmation/page.tsx`
  so the landing dashboard, lead list, lead-create entry route, lead-import
  entry route, reports route and Data Confirmation route resolve
  `HEUWorkspaceContext` before running scoped work.
- `app/data-confirmation/page.tsx` is a read-only/ref-only Task Center shell.
  It exposes the standard statuses `CHO_XAC_NHAN`, `DUNG`, `CAN_SUA`,
  `KHONG_THUOC_TOI` and `DA_KHOA`, but does not query task rows, mutate real
  data, accept owner evidence, approve finance action or create production
  authority.
- `components/layout/app-shell.tsx` now exposes `Viec cua toi` in quick
  navigation and workspace quick links so users can enter the Task Center while
  preserving the selected admission segment.
- `components/layout/app-shell.tsx` also gates module navigation with
  permission/role allowlists and only shows the `Tao lead` quick link when the
  user has a lead write permission.
- `app/cthssv/page.tsx` also resolves `HEUWorkspaceContext` and uses the
  dedicated `canAcceptCthssvHandover` gate so CTHSSV route access remains
  ADMIN/BGH or `handover.accept_cthssv`, not a broad review permission.
- `app/import/actions.ts` also checks `canImportLeadDraft` before lead import
  insert work, so direct form submission cannot bypass the page guard.
- `scripts/audit-heu-cthssv-module-readiness.mjs` now recognizes the centralized
  CTHSSV permission gate in `HEUWorkspaceContext` instead of requiring duplicate
  route-level RPC tokens.
- `scripts/audit-heu-implementation-log.mjs` now uses a section-token guard for
  the IT/Data fast local control-loop log entry to avoid regex backtracking
  timeout while preserving the same required tokens.
- `scripts/audit-ttgdtx-release-gates.mjs` now recognizes the HEUWorkspaceContext
  import page guard and has the Short Course gap-pack call signature corrected.
- `scripts/audit-heu-lead-lifecycle-handover-uat-pack.mjs` now accepts the
  escaped JSX marker form inside release-gate source checks.
- The CTHSSV signed-UAT evidence intake marker is linked in
  `docs/HEU_CURRENT_STATE_INVENTORY.md`,
  `docs/HEU_SYSTEM_BUILD_BACKLOG.md`,
  `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md` and
  `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md`.
- No database, config, migration, user access or production behavior is changed.

SOP-CHECK:
- Decision is based on the current HEU control direction: scope-first query,
  `HEUWorkspaceContext`, task inbox, read model budget, metadata-only search
  and compact audit event storage.
- Main worktree remains mixed; this slice is isolated in a separate worktree.
- Runtime adoption is intentionally limited to the landing route, lead list,
  lead-create entry route, lead-import route/action, reports route, Data
  Confirmation route shell and CTHSSV route; other routes must wait for focused
  review and checks before adoption.
- CTHSSV adoption is limited to route access/context resolution and existing
  scoped read queries; no handover mutation, owner signoff, evidence acceptance,
  UAT approval or finance gate is changed.

SOP-PROFESSIONAL:
- Owner lanes: BGH, IT_DATA, Audit, PHAP_CHE and module owners.
- Department owners still control their module workflows.

SOP-LEGAL:
- PHAP_CHE/SOP approval is not granted by this document.
- This document does not accept evidence, UAT or production readiness.

SOP-LOGIC:
- The decision reduces delivery risk by keeping one deployment and central
  identity/scope/audit while preserving domain ownership.

SOP-VERIFY:
- Checks: file existence, token search, `git diff --check`,
  `audit:heu-user-account-security` and TypeScript transpile syntax check for
  `lib/heu-workspace-context.ts`, `lib/workspace.ts`, `app/page.tsx` and
  `app/leads/page.tsx`, plus a focused transpile check for
  `app/leads/new/page.tsx`, `app/import/page.tsx` and `app/import/actions.ts`.
- `app/reports/page.tsx` uses `HEUWorkspaceContext` in lightweight read-only
  mode; it does not request action permission RPCs.
- `app/data-confirmation/page.tsx` uses `HEUWorkspaceContext` with action
  permissions only to show read/review boundary metadata. It does not query task
  tables or expose mutation buttons.
- `app/cthssv/page.tsx` uses `HEUWorkspaceContext` with action permissions only
  to preserve the existing ADMIN/BGH/`handover.accept_cthssv` route gate.
- `audit:heu-cthssv-module-readiness` covers the centralized CTHSSV permission
  gate plus the signed-UAT evidence intake marker in backlog, readiness matrix
  and production checklist.
- `check:heu-data-confirmation-task-center` covers the `/data-confirmation`
  route shell, `Viec cua toi` App Shell entry, required confirmation statuses,
  `HEUWorkspaceContext` scope-first markers, ref-only boundary and absence of
  route-level database query/mutation. It also checks the App Shell role/scope
  menu marker and the lead-write permission guard for the `Tao lead` quick link.
- `npm.cmd run lint` passes in the isolated worktree after linking ignored
  `node_modules` to the dependency-ready repo root.
- `npm.cmd run build -- --webpack` passes with build-only dummy public Supabase
  environment values. The route manifest includes `/data-confirmation`.
- Plain `npm.cmd run build` with default Turbopack is not used as evidence in
  this worktree because Turbopack rejects the ignored `node_modules` junction
  that points outside the worktree root.
- `audit:heu-implementation-log`, `audit:heu-lead-lifecycle-handover-uat-pack`,
  `audit:heu-current-state-inventory` and `audit:ttgdtx-release-gates` pass
  after the script/doc marker alignment.
- `check:heu-cthssv-local-completion` passes 8/8 in non-runtime mode. It still
  reports `CTHSSV_REAL_OPERATION_READY: NO_GO` because signed owner UAT,
  controlled evidence, signed final closure, handover reliance decision and
  external owner action queue closure remain outside Git/Codex/chat.
- `check:heu-permission-scope-readiness` could not run in the clean worktree
  because `node_modules` is not present there and `npm install`/`npm ci` remain
  out of scope.
- A broad `tsc --noEmit` attempt from an external dependency path is not used
  as slice evidence because the clean worktree cannot resolve Next/React module
  types without its own `node_modules`. Focused TypeScript transpile checks are
  the current local evidence for this slice.
- `audit:heu-vietnamese-text-encoding` was re-run after the lead-create and
  import guards. The new route guards no longer report a new encoding finding;
  the command still returns `NO_GO` because of an existing out-of-scope finding in
  `docs/HEU_IMPLEMENTATION_LOG.md` line 64.
- No migration, deploy, install, commit or push is required by this document.

SOP-RESULT:
- `DAT_TAM_THOI` for architecture decision record after docs-only verification.
- Runtime wrapper plus seven-route pilot is `DAT_TAM_THOI` after static gate,
  lint and Webpack build verification.
- CTHSSV local completion chain is `PASS_LOCAL` in non-runtime mode after 8/8
  checks pass.
- Wider route adoption remains `CAN_SUA`.
- Production remains `NO-GO`.

SOP-NEXT:
- Review `lib/heu-workspace-context.ts`, `app/page.tsx`, `app/leads/page.tsx`,
  `app/leads/new/page.tsx`, `app/import/page.tsx`, `app/import/actions.ts` and
  `app/reports/page.tsx`, `app/data-confirmation/page.tsx` and
  `components/layout/app-shell.tsx`, plus `app/cthssv/page.tsx`,
  `docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md`,
  `scripts/audit-heu-cthssv-module-readiness.mjs`,
  `scripts/audit-heu-implementation-log.mjs`,
  `scripts/audit-heu-lead-lifecycle-handover-uat-pack.mjs`,
  `scripts/audit-ttgdtx-release-gates.mjs` and the CTHSSV/current-state control
  rows, with IT_DATA and Audit.
- Then run focused scope and user-access checks from a dependency-ready
  worktree before adopting `getHEUWorkspaceContext` in any eighth route.
