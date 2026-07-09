# HEU Performance 001 Workspace Context And Scope-First Query

Task ID: HEU-PERF-001-WORKSPACE-CONTEXT-AND-SCOPE-FIRST-QUERY
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
HEAD at start: 246c206
Status: DRAFT_CONTROL
Production status: NO-GO

## 1. Purpose

This document locks the first performance and access-control slice before any
new feature work: every user must resolve one server-side workspace context,
then every business query must apply scope before reading data.

Target outcome:

```text
User vao nhanh.
Phong ban thay dung viec cua minh.
Query khong quet rong.
Dashboard/search/task inbox khong copy du lieu tho.
AI/Codex khong tu phe duyet owner, UAT, finance, migration hoac production.
```

This is a control contract only. It does not change runtime code, create user
access, run SQL, migrate data, approve UAT, accept evidence, approve finance
reliance, approve owner GO/NO-GO, or mark production GO.

## 2. Current Surfaces Found

| Surface | Current role | Notes |
|---|---|---|
| `lib/workspace.ts` | Existing admission workspace context helper | Exposes `getAdmissionWorkspaceContext`, `admissionWorkspaceSegmentIds` and `applyAdmissionSegmentIds` |
| `lib/workspace-url.ts` | Existing scoped URL helper | Exposes `withAdmissionSegmentParam`, `withoutAdmissionSegmentParam`, `safeReturnPath` and `workspaceRedirectPath` |
| `current_user_admission_workspaces` | Preferred workspace view | Used by `getAdmissionWorkspaceContext` when available |
| `user_admission_segment_scopes` | Fallback business-scope source | Used when the current workspace view is not available |
| `current_user_role_code` | Role source | Used to decide executive all-segment read-only visibility |
| `isExecutiveRole` | Executive role helper | Used by workspace context to allow read-only all-segment visibility |
| `docs/HEU_PERMISSION_SCOPE_OPERATION_BREAKDOWN_20260703.md` | Current permission/scope rollout source | Records scope slices and guard commands |
| `docs/HEU_CONTROL/HEU_ARCH_REVIEW_COMMITTEE_CRITERIA_20260707.md` | Architecture gate | Requires scope -> query guard before task/read-model/search/audit/performance |

## 3. Minimum Workspace Context Contract

Future code work should not invent local per-page scope rules. The shared
context must provide these fields or explicit equivalents:

| Field | Required meaning | Source or derivation |
|---|---|---|
| `authUserId` | Supabase Auth user for the request | Server session |
| `crmUserId` | HEU user/profile row linked to auth user | User/profile link table or view |
| `roleCode` | Current HEU role code | `current_user_role_code` or effective-access view |
| `orgUnitCode` | Department/owner lane | Org/position assignment surface |
| `activeWorkspaceId` | Current workspace/segment selected by user or route | Cookie, route param, saved preference |
| `activeSegmentId` | Current admission segment | `getAdmissionWorkspaceContext` |
| `visibleSegmentIds` | Segments the user may see | `AdmissionWorkspaceContext.visibleSegmentIds` |
| `canSeeAllSegments` | Executive read-only all-segment visibility | `isExecutiveRole(roleCode)` plus route permission |
| `allowedActions` | Read/write/review/approve/pay/admin flags | Role/permission matrix |
| `scopeDecision` | `SCOPED`, `ALL_READONLY`, `NO_SCOPE`, or `BLOCKED` | Derived before query execution |
| `scopeSource` | Which view/table proved access | Example: `current_user_admission_workspaces` |
| `noSecretBoundary` | Confirms no secret/raw PII is loaded into context | Must be true for every context |

HEU-PERF-001 does not require all fields to exist in code today. It requires
future code slices to identify the gap before adding or widening a route.

## 4. Scope-First Query Rules

Every read or write path must satisfy these rules before the query runs.

| Rule ID | Rule | Stop condition |
|---|---|---|
| PERF-001-Q01 | Resolve workspace context server-side before business data fetch | Page/action queries business rows before context is known |
| PERF-001-Q02 | Use `admissionWorkspaceSegmentIds(context)` or equivalent before querying scoped data | Query fetches all rows then filters in UI |
| PERF-001-Q03 | Apply `applyAdmissionSegmentIds(query, segmentIds, column)` or equivalent on the base query | Child-table counts bypass scoped parent rows |
| PERF-001-Q04 | Executive/BGH all-segment access is read-only unless an explicit approved action permission exists | Executive role can mutate scoped operational data by default |
| PERF-001-Q05 | Non-executive users must have at least one active business scope or return a no-scope state | Non-admin user sees global rows |
| PERF-001-Q06 | Write actions must check both permission and business scope again server-side | Client-side filter is treated as authorization |
| PERF-001-Q07 | Queries must return bounded result sets with pagination or small limits | Page renders full tables or unbounded dashboards |
| PERF-001-Q08 | Search/task/read-model must store refs or summaries, not raw records | Duplicate raw lead/student/payment/evidence payload appears |

## 5. Fast User Access Contract

| User type | First response should be | Required guard |
|---|---|---|
| ADMIN | Admin/control view with explicit no-production boundary | Permission matrix and audit visibility |
| BGH/executive | Read-only summary, blockers and owner decisions needed | `canSeeAllSegments` plus no state mutation |
| Department owner | Own department queue and scoped dashboards | Active workspace and department role |
| Staff/operator | Assigned tasks/leads/documents only | `visibleSegmentIds` plus `OWN` or assigned-scope checks |
| Out-of-scope user | Safe no-scope/no-access message | No fallback to global query |

## 6. Query Guard Review Checklist

Use this checklist before touching any page, server action, RPC wrapper or
report:

| Check | Required answer |
|---|---|
| What is the active workspace/segment? | Named field and source |
| Who is the actor? | Auth user + CRM profile or explicit blocker |
| What role and owner lane apply? | Role code + department/source |
| What rows can be read? | Segment/workspace/owner predicate before query |
| What rows can be written? | Permission + scope + status guard |
| Is the query bounded? | Limit/pagination/small count query |
| Does it load restricted data? | No CCCD, bank, raw evidence, secret, password, token |
| What audit is required? | No-write proof or audit log path |
| What rollback exists? | Revert/doc rollback; DB rollback if schema/data later |

## 7. Gap Register For Next Code Slice

| Gap ID | Gap | Risk | Next action |
|---|---|---|---|
| PERF-001-G01 | `AdmissionWorkspaceContext` currently covers segment visibility, but not full org unit, allowed actions or audit decision in one object | Pages may each recompute partial scope | Design a typed `HEUWorkspaceContext` wrapper after dirty settings/scope work is isolated |
| PERF-001-G02 | Several settings/scope files are already dirty in the worktree | Code edit could overwrite another slice | Do not touch settings/scope code until current dirty scope is reviewed |
| PERF-001-G03 | Permission/scope scripts are dirty | Checker updates may conflict | Review scripts before trusting or extending PASS/NO_GO gates |
| PERF-001-G04 | Broad dashboard/search/read-model work is downstream | Feature work may bypass scope guard | Require this contract before task inbox, read model and search slices |

## 8. Allowed Next Code Shape

When the worktree is clean enough, the next code slice should be small:

```text
Create or extend one shared server-side context helper.
Do not update every page at once.
Pick one low-risk route and prove the query is scope-first.
Run the focused permission/scope check with npm.cmd.
Record SOP result.
```

Candidate implementation path after review:

| Candidate | Why | Risk |
|---|---|---|
| Extend `lib/workspace.ts` with a richer context type | Reuses existing helper and imports | Must avoid breaking current callers |
| Add a new wrapper file under `lib/` | Keeps existing helper stable | Needs careful naming and adoption path |
| Add focused checker for one route | Makes scope-first behavior enforceable | Scripts folder is currently dirty, so defer |

Preferred next code slice: add a wrapper or extension only after
`HEU-SCRIPTS-003` and settings/scope dirty files are reviewed.

## 9. Verification Plan

Docs-only verification for this slice:

```powershell
Test-Path -LiteralPath 'docs/HEU_CONTROL/HEU_PERF_001_WORKSPACE_CONTEXT_SCOPE_FIRST_QUERY_20260707.md'
Select-String -Path 'docs/HEU_CONTROL/HEU_PERF_001_WORKSPACE_CONTEXT_SCOPE_FIRST_QUERY_20260707.md' -Pattern 'PERF-001-Q01|PERF-001-G01|Scope-First Query Rules'
git diff --check -- docs/HEU_CONTROL
```

Future code verification after runtime changes:

```powershell
npm.cmd run check:heu-permission-scope-readiness
npm.cmd run check:heu-fast-local-loop
npm.cmd run audit:heu-user-account-security
npm.cmd run lint
npm.cmd run build
```

Do not run the future code verification bundle for this docs-only contract.

## 10. Decision

| Item | Result |
|---|---|
| Executive direction | CHO_BGH_DUYET remains required |
| Technical contract | CAN_SUA -> DAT_TAM_THOI after docs-only verification |
| Runtime code | Not changed |
| Database/migration | Not changed; no SQL executed |
| User access | Not changed; no permission grant |
| Production | NO-GO |

## 11. SOP Slice Result Record

SOP-SCOPE:
- `HEU-PERF-001` creates a workspace-context and scope-first query contract
  under `docs/HEU_CONTROL`.
- No app, component, script, SQL, config, runtime, user access or production
  behavior is changed.

SOP-CHECK:
- Live Git status is mixed and dirty.
- Related settings/scope code and permission scripts are dirty, so runtime code
  changes are deferred.
- Existing `lib/workspace.ts` and `lib/workspace-url.ts` were checked as the
  current workspace helper surfaces.

SOP-PROFESSIONAL:
- Owner lanes: Architecture, IT_DATA, Audit, module owner, Performance/UX.
- Result: DRAFT_CONTROL until the next code slice is reviewed by owner lanes.

SOP-LEGAL:
- PHAP_CHE/SOP approval is not granted by this document.
- No raw restricted data, evidence, secrets, student records, bank data or
  personal data are introduced.

SOP-LOGIC:
- The contract requires server-side context resolution and scope-first query
  predicates before any business data read or write.

SOP-VERIFY:
- Docs-only verification expected: file existence, section/token search,
  trailing-whitespace check and `git diff --check -- docs/HEU_CONTROL`.
- `npm.cmd`, migration, deploy, install, commit and push are not required and
  should not be run for this docs-only contract.

SOP-RESULT:
- `DAT_TAM_THOI` for local docs-control only after verification.
- Technical next code state remains `CAN_SUA`.
- Production remains `NO-GO`.

SOP-NEXT:
- Review settings/scope and permission scripts before implementing a shared
  runtime `HEUWorkspaceContext` wrapper or applying it to a route.
