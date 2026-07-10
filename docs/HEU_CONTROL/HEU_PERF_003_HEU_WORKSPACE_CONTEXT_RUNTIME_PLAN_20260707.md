# HEU Performance 003 HEUWorkspaceContext Runtime Plan

Task ID: HEU-PERF-003-HEU-WORKSPACE-CONTEXT-RUNTIME-PLAN
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
HEAD at start: 246c206
Status: DRAFT_CONTROL
Executive direction: CHO_BGH_DUYET
Production status: NO-GO

## 1. Purpose

Tai lieu nay khoa lat runtime nho nhat tiep theo sau `HEU-PERF-001` va
`HEU-PERF-002`: tao mot `HEUWorkspaceContext` dung chung o server-side de moi
route khong tu suy scope rieng, khong query rong truoc roi moi loc tren UI,
va khong refactor tran toan repo.

Target result:

```text
Moi request resolve 1 context dung chung.
Moi route doc context truoc roi moi query.
Executive chi all-scope read-only.
Phong ban/operator chi thay dung queue va data cua minh.
Khong phat sinh broad refactor toan he thong trong 1 lat.
```

Tai lieu nay la runtime-plan/control only. It does not change code, SQL,
permissions, RLS, migration, user access, UAT status, evidence acceptance,
finance reliance, owner GO/NO-GO or production GO.

## 2. Current Runtime Surfaces Confirmed

| Surface | Exists now | What it already proves | Current gap |
|---|---|---|---|
| `lib/workspace.ts` | Yes | `getAdmissionWorkspaceContext`, `admissionWorkspaceSegmentIds`, `applyAdmissionSegmentIds`, active segment cookie, executive all-segment read-only helper | Only covers admission-segment workspace context, not full HEU runtime context |
| `lib/workspace-url.ts` | Yes | Safe segment param and redirect helpers | URL layer only; no actor/action/scope decision contract |
| `lib/executive-roles.ts` | Yes | Executive read-only role classification | Not yet wrapped into a shared action matrix |
| `app/reports/page.tsx` | Yes | Current example of `context -> segmentIds -> scoped queries` | Still route-local; not a shared HEU runtime contract |
| `app/data-confirmation/page.tsx` | Yes | Department/status/scope queue filters and DCTC read boundary | Uses route-local filter model, not a common `HEUWorkspaceContext` |
| Permission/scope docs and checks | Yes | P0-17 scope, role, auth, position, negative-control boundaries exist | Dirty worktree prevents broad runtime adoption right now |

## 3. Why HEU Needs A Shared Runtime Context

Khong co `HEUWorkspaceContext`, he thong se bi 4 loi lap lai:

1. Moi route tu tinh scope theo cach rieng.
2. Query business rows truoc khi biet actor/role/workspace.
3. Executive/BGH de bi mo rong thanh "all access" thay vi "all-scope read-only".
4. Muon toi uu toc do thi phai copy raw data sang dashboard/search/task inbox.

`HEUWorkspaceContext` phai cat 4 loi nay truoc khi mo rong task inbox,
read-model, search, cache hay observability.

## 4. Proposed Runtime Contract

Khong thay the ngay `AdmissionWorkspaceContext`. Tao 1 wrapper moi, dung helper
hien co ben trong.

### 4.1 Core Types

```ts
type HEUScopeDecision =
  | "SCOPED"
  | "ALL_READONLY"
  | "NO_SCOPE"
  | "BLOCKED";

type HEUAllowedAction = {
  read: boolean;
  create: boolean;
  update: boolean;
  review: boolean;
  approve: boolean;
  pay: boolean;
  admin: boolean;
};

type HEUWorkspaceContext = {
  authUserId: string;
  crmUserId: string | null;
  roleCode: string | null;
  orgUnitCode: string | null;
  activeWorkspaceId: string | null;
  activeSegmentId: string | null;
  visibleSegmentIds: string[];
  canSeeAllSegments: boolean;
  scopeDecision: HEUScopeDecision;
  scopeSource: string;
  allowedActions: HEUAllowedAction;
  admissionWorkspace: AdmissionWorkspaceContext;
  noSecretBoundary: true;
};
```

### 4.2 Required Meanings

| Field | Meaning | Source strategy |
|---|---|---|
| `authUserId` | Supabase Auth user for request | Session |
| `crmUserId` | HEU linked profile row | Profile/link view or RPC; may stay `null` with explicit blocker |
| `roleCode` | Current effective HEU role | Existing role source/RPC |
| `orgUnitCode` | Department lane / owner lane | Position or org assignment surface |
| `activeWorkspaceId` | Current workspace selector result | Cookie/route/preference; may equal active segment for admission-first slices |
| `activeSegmentId` | Current admission segment | Existing `AdmissionWorkspaceContext` |
| `visibleSegmentIds` | What the actor may read | Existing helper |
| `canSeeAllSegments` | Executive all-segment read-only | Existing helper + permission boundary |
| `scopeDecision` | `SCOPED`, `ALL_READONLY`, `NO_SCOPE`, `BLOCKED` | Derived after actor/role/workspace resolution |
| `scopeSource` | Exact proof source | Example: `current_user_admission_workspaces` |
| `allowedActions` | Explicit action flags, not inferred from UI route | Role/permission matrix or adapter |
| `admissionWorkspace` | Preserve current helper payload | Existing helper output |
| `noSecretBoundary` | Hard invariant | Always `true`; no secret/raw PII in context |

## 5. Adapter Strategy

Khong refactor `lib/workspace.ts` manh ngay. Runtime plan uu tien 1 wrapper moi:

| Option | Decision | Why |
|---|---|---|
| Extend `AdmissionWorkspaceContext` directly | Not first choice | De gay break current callers |
| Create `lib/heu-workspace-context.ts` wrapper | Preferred | Giu helper cu on dinh, them adoption tung route |
| Refactor all routes at once | Forbidden | Worktree dang ban, scope se tran |

Proposed runtime flow:

1. Resolve auth user.
2. Resolve existing `AdmissionWorkspaceContext`.
3. Resolve role code and executive flag.
4. Resolve CRM user + org unit if safe source exists.
5. Derive `scopeDecision`.
6. Derive `allowedActions`.
7. Return `HEUWorkspaceContext`.
8. Route must call context first, query second.

## 6. Scope Decision Rules

| Case | Decision | Meaning |
|---|---|---|
| Non-executive with visible segments | `SCOPED` | Query only visible or active segment ids |
| Executive/BGH read-only lane | `ALL_READONLY` | Read may widen; write paths must still stop |
| No active scope for non-executive | `NO_SCOPE` | Render safe no-scope state; no broad query |
| Missing actor/profile/permission proof | `BLOCKED` | Stop route from reading business rows |

Stop rules:

- `ALL_READONLY` khong bao gio duoc coi la write permission.
- `NO_SCOPE` khong fallback ve global rows.
- `BLOCKED` khong duoc query business tables de "thu xem co du lieu khong".

## 7. Allowed Action Strategy

Luc dau khong can giai full matrix cho moi module. Runtime plan chia 2 tang:

### Layer A - Minimum now

- `read`
- `create`
- `update`
- `review`
- `approve`
- `pay`
- `admin`

### Layer B - Later module detail

- `lead.write`
- `handover.review`
- `finance.reconcile`
- `finance.pay`
- `documents.manage`
- `reports.read`
- `data_confirmation.confirm`

Rule:

- Tang A du de khoa route pilot.
- Tang B chi mo rong khi mot module can that.
- Khong route nao duoc infer write power tu role name hoac UI state.

## 8. First Adoption Route

### Recommended pilot: `/reports`

Why:

- Da dung `getAdmissionWorkspaceContext` va `applyAdmissionSegmentIds`.
- Read-only nature phu hop voi docs-only runtime-plan.
- It already has bounded list logic and no mutation path in the main flow.
- It is safer than touching settings/auth/finance writes first.

### Pilot result expected

`/reports` should move from:

```text
auth -> local workspace helper -> local query code
```

to:

```text
auth -> HEUWorkspaceContext -> scopeDecision -> allowedActions.read -> scoped query
```

### Pilot must not do

- No broad dashboard redesign.
- No cross-module query consolidation.
- No new SQL.
- No permission widening.
- No cache tuning yet.

## 9. Route Adoption Order After Pilot

| Order | Route group | Why |
|---:|---|---|
| 1 | `/reports` | Read-only, already near scope-first pattern |
| 2 | `/data-confirmation` | Queue and owner/assignee filters need common actor context |
| 3 | `/search` | Metadata-only search must read scope from one context |
| 4 | Executive read-only surfaces | Need explicit `ALL_READONLY` handling |
| 5 | Admissions read-only overviews | Can reuse same context without write risk |
| 6 | Settings/auth/permission routes | High risk; touch only after pilot evidence is clear |
| 7 | Finance write paths | Last; require separate owner/security review |

## 10. Runtime API Shape

Minimal API plan:

```ts
export async function getHEUWorkspaceContext(params?: {
  requestedSegmentId?: string | null;
  requestedWorkspaceId?: string | null;
}): Promise<HEUWorkspaceContext>
```

Optional helpers after pilot:

```ts
export function assertHEUReadAccess(
  context: HEUWorkspaceContext,
): HEUWorkspaceContext;

export function applyHEUSegmentScope<T>(
  query: T,
  context: HEUWorkspaceContext,
  column?: string,
): T;
```

Khong tao helper write/assert approve/pay trong slice dau tien.

## 11. Data Sources And Boundaries

| Need | Allowed source | Boundary |
|---|---|---|
| Auth user | Session | No raw tokens or secrets |
| Role code | Existing RPC/view | Read-only lookup |
| Segment scope | `current_user_admission_workspaces`, fallback existing scope tables | No broad fallback for non-executive |
| CRM profile/org unit | Approved profile/assignment surface only | If not safe, keep `null` and mark blocker |
| Allowed actions | Role/permission mapping | No inference from page path alone |

If any source is missing:

- Prefer `BLOCKED` or `NO_SCOPE`.
- Do not invent fake broad visibility.
- Do not hardcode special cases per page.

## 12. Risks And Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Broad refactor drift | Shared helper touched by many dirty routes | Keep wrapper new and adopt one route only |
| Executive write drift | `canSeeAllSegments` misread as all-powerful | Separate `scopeDecision` from `allowedActions` |
| Missing CRM profile source | Context may not fill all fields at once | Allow `crmUserId/orgUnitCode` to be `null` with explicit blocker |
| Checker drift | Scripts folder dirty, hard to trust wide claims | Do docs/control first; add route pilot later |
| Performance overengineering | Jump to cache/index before context | Lock context first, then query budgets |

## 13. Required Follow-Up Files

| File | Why | Status after this slice |
|---|---|---|
| `docs/HEU_CONTROL/HEU_PERF_004_SCOPE_FIRST_QUERY_GUARD_CHECKLIST_20260707.md` | Lock pilot route checklist before code | Next |
| `docs/HEU_CONTROL/HEU_UX_001_ROLE_BASED_FAST_ACCESS_MAP_20260707.md` | Map first-screen access after context | Pending |
| `docs/HEU_CONTROL/HEU_DATA_001_DEPARTMENT_TASK_INBOX_BLUEPRINT_20260707.md` | Build task-first department queues on top of shared context | Pending |

## 14. Verification Plan

Docs-only verification for this slice:

```powershell
Test-Path -LiteralPath 'docs/HEU_CONTROL/HEU_PERF_003_HEU_WORKSPACE_CONTEXT_RUNTIME_PLAN_20260707.md'
Select-String -Path 'docs/HEU_CONTROL/HEU_PERF_003_HEU_WORKSPACE_CONTEXT_RUNTIME_PLAN_20260707.md' -Pattern 'HEUWorkspaceContext|Recommended pilot: /reports|scopeDecision|allowedActions'
git diff --check -- docs/HEU_CONTROL
```

Future code verification after pilot implementation:

```powershell
npm.cmd run check:heu-permission-scope-readiness
npm.cmd run check:heu-fast-local-loop -- --runtime
npm.cmd run check:heu-reports-dashboard-scope-readiness
npm.cmd run audit:heu-user-account-security
npm.cmd run lint
npm.cmd run build
```

Do not run the future code verification bundle for this docs-only runtime plan.

## 15. 2026-07-10 Runtime Review Addendum

Task ID: HEU-PERF-003R-WORKSPACE-CONTEXT-RUNTIME-READINESS-CHECK

Current runtime evidence in this clean slice:

| Artifact | Observed state | Review result |
|---|---|---|
| `lib/heu-workspace-context.ts` | Exists as a wrapper around `lib/workspace.ts` | CAN_SUA, review as isolated PR |
| `app/reports/page.tsx` | Uses `getHEUWorkspaceContext`, `allowedActions.read`, `BLOCKED`, `NO_SCOPE`, and `applyHEUSegmentScope` before reading lead rows | PASS_LOCAL_CHECKER_GUARDED |

Local checker:

```powershell
node --check scripts/check-heu-workspace-context-runtime-readiness.mjs
npm.cmd run check:heu-workspace-context-runtime-readiness
```

Expected local result:

- `HEU_WORKSPACE_CONTEXT_RUNTIME_READY: PASS_LOCAL`
- `NO_SCOPE_OVERFLOW: context checker only; no database migration, no broad fallback, no write mutation, no AI runtime, no production GO`

This addendum does not approve production. It only records that the wrapper and
the `/reports` pilot can be reviewed as a narrow runtime slice.

## 16. Decision

| Item | Result |
|---|---|
| Runtime architecture direction | CAN_SUA |
| Local docs/control artifact | DAT_TAM_THOI after docs verification |
| Executive direction | CHO_BGH_DUYET remains required |
| Database/migration | Not changed |
| Runtime code | Narrow `/reports` pilot is present in this PR |
| Production | NO-GO |

## 17. SOP Slice Result Record

SOP-SCOPE:
- `HEU-PERF-003` creates one runtime-plan document for a shared
  `HEUWorkspaceContext`.
- No runtime code, SQL, migration, auth, permission, task storage, search,
  dashboard or production behavior is changed.

SOP-CHECK:
- Live worktree is mixed and dirty.
- Existing runtime surfaces checked: `lib/workspace.ts`,
  `lib/workspace-url.ts`, `app/reports/page.tsx`,
  `app/data-confirmation/page.tsx`.
- Related control docs checked: `HEU_PERF_001`, `HEU_PERF_002`,
  `HEU_ARCH_REVIEW_001`, `HEU_SYSTEM_BUILD_HANDBOOK`.

SOP-PROFESSIONAL:
- Owner lanes: Architecture, IT_DATA, Audit, Security/Privacy,
  Performance/UX and module owners for each adoption route.
- Result: DRAFT_CONTROL until the pilot route and follow-up query guard are
  reviewed.

SOP-LEGAL:
- No legal/SOP approval is granted.
- No raw restricted data, evidence, secret, bank data, password, token or
  personal data is introduced.

SOP-LOGIC:
- The plan keeps runtime small by wrapping existing workspace helpers instead of
  refactoring all routes at once, and by separating `scopeDecision` from
  `allowedActions`.

SOP-VERIFY:
- Docs-only verification expected: file existence, token search and
  `git diff --check -- docs/HEU_CONTROL`.
- No `npm.cmd`, migration, deploy, install, commit or push is required for this
  docs-only control slice.

SOP-RESULT:
- `DAT_TAM_THOI` for local docs-control only after docs verification.
- Technical next state remains `CAN_SUA`.
- Executive direction remains `CHO_BGH_DUYET`.
- Production remains `NO-GO`.

SOP-NEXT:
- Create `HEU_PERF_004_SCOPE_FIRST_QUERY_GUARD_CHECKLIST_20260707.md` as the
  next smallest safe slice, then apply the pilot only to `/reports`.
