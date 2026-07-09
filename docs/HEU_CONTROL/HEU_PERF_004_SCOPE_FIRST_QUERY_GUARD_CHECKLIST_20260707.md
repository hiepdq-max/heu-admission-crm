# HEU Performance 004 Scope-First Query Guard Checklist

Task ID: HEU-PERF-004-SCOPE-FIRST-QUERY-GUARD-CHECKLIST
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
HEAD at start: 246c206
Status: DRAFT_CONTROL
Executive direction: CHO_BGH_DUYET
Production status: NO-GO

## 1. Purpose

Tai lieu nay la checklist thuc chien de dua `HEUWorkspaceContext` vao route
pilot ma khong mo rong tran scope. Lat dau tien duoc chot la `/reports`.

Muc tieu:

```text
Context truoc.
Scope truoc.
Query sau.
UI render sau cung.
Khong broad query.
Khong filter business data tren client sau khi da doc rong.
```

Tai lieu nay la query-guard/control only. It does not change runtime code, SQL,
permissions, RLS, cache, user access, evidence acceptance, UAT, finance
reliance, owner GO/NO-GO or production GO.

## 2. Pilot Route Locked

| Item | Decision |
|---|---|
| Pilot route | `/reports` |
| Why this route | Read-only, already uses workspace helper, already scopes lead queries, lower risk than auth/settings/finance writes |
| Out of scope | `/settings`, `/auth`, `/finance-desk`, payment requests, mutation flows |
| First target | Replace route-local workspace logic with `HEUWorkspaceContext` read guard, keep business output the same |

## 3. Current `/reports` Query Snapshot

Current route behavior confirmed from `app/reports/page.tsx`:

| Query / source | Current state | Scope state now | Risk note |
|---|---|---|---|
| `supabase.auth.getUser()` | Required first | Safe | Good first actor gate |
| `getAdmissionWorkspaceContext(...)` | Already used | Safe | Good current base for runtime wrapper |
| `segmentFilterIds = admissionWorkspaceSegmentIds(workspace)` | Already used | Safe | Good current scope derivation |
| `leads` query | `applyAdmissionSegmentIds(...).eq("is_deleted", false).order(...).limit(5000)` | Scoped | Limit exists but still large for long-term budget |
| `lead_documents` query | `applyAdmissionSegmentIds(..., "leads.admission_segment_id")` | Scoped | Good join-scope example |
| `lead_sources` query | Unscoped lookup | Acceptable for shared master lookup if non-sensitive and small | Must stay small and read-only |
| `admission_flows` query | Unscoped lookup | Acceptable for shared master lookup if non-sensitive and small | Must stay small and read-only |
| `users_profile` query | Unscoped lookup | Risky | Current route fetches all selected names without explicit HEU runtime action gate |

## 4. Scope-First Guard Rules For The Pilot

Every item below must be true before the pilot can be called `PASS_LOCAL`.

| Guard ID | Rule | PASS condition | FAIL condition |
|---|---|---|---|
| QG-01 | Actor first | Route resolves auth user before any business query | Business query starts before actor is known |
| QG-02 | Shared context first | Route resolves `HEUWorkspaceContext` before business query construction | Route still derives local scope ad hoc |
| QG-03 | Scope decision gate | Route branches on `SCOPED`, `ALL_READONLY`, `NO_SCOPE`, `BLOCKED` before main queries | Route ignores `scopeDecision` |
| QG-04 | Read action gate | Route checks `allowedActions.read` before fetching business rows | UI route path is treated as permission |
| QG-05 | Base query scoping | Main business query applies segment/workspace predicate at query construction time | Query fetches broad rows then filters later |
| QG-06 | Joined query scoping | Joined reads like `lead_documents -> leads` keep source table scope on the join path | Join path escapes the base scope |
| QG-07 | Bounded result set | Main list query uses a bounded limit or pagination contract | Unbounded table read |
| QG-08 | Small lookup exception | Shared lookup tables are allowed only if small, non-sensitive and read-only | Large or sensitive lookup is fetched unscoped |
| QG-09 | Profile lookup minimization | `users_profile` read must be limited to already scoped owner ids only | All-user profile scan or global profile helper read |
| QG-10 | No-secret boundary | Context and route never fetch raw restricted fields for convenience | CCCD, bank, secret, password, token, raw evidence enters the route |

## 5. `/reports` Specific Query Checklist

### 5.1 Must Keep

- `auth.getUser()` before route data load
- `HEUWorkspaceContext` before business query
- `applyHEUSegmentScope(...)` or equivalent on `leads`
- scoped join on `lead_documents`
- read-only UI boundary
- bounded result set

### 5.2 Must Change In Pilot

- Replace direct route-local `getAdmissionWorkspaceContext(...)` usage with
  `getHEUWorkspaceContext(...)`.
- Replace route-local segment filter derivation with context-driven helper.
- Add explicit `scopeDecision` branching:
  - `SCOPED`: proceed with scoped queries
  - `ALL_READONLY`: proceed read-only with explicit no-mutation boundary
  - `NO_SCOPE`: render safe empty/no-scope state
  - `BLOCKED`: render blocked state; no business query
- Add explicit `allowedActions.read` gate.
- Reduce `users_profile` lookup to only ids already present in scoped lead rows.

### 5.3 Must Not Change In Pilot

- No broad dashboard redesign
- No new KPIs
- No new SQL
- No cache policy changes
- No search integration changes
- No report-view/source-map contract rewrite

## 6. Safe Lookup Rule

Khong phai query nao cung can scope theo segment. Rule cho route pilot:

| Lookup type | Allowed unscoped? | Condition |
|---|---|---|
| Small master lookup | Yes | Small table, non-sensitive, read-only, no owner-sensitive payload |
| Actor-related profile lookup | Only partially | Must be restricted to ids already discovered from scoped business rows |
| Business rows | No | Must be scope-first |
| Evidence / file / payment / sensitive personal data | No | Must never use convenience broad read |

Applied to `/reports`:

- `lead_sources`: allowed unscoped for now
- `admission_flows`: allowed unscoped for now
- `users_profile`: not allowed as broad read; must narrow to scoped counselor ids

## 7. Query Budget For The Pilot

| Area | Budget now | Why |
|---|---|---|
| `leads` | bounded, current `limit(5000)` only as transitional pilot budget | Current state exists, but later should move to smaller report/read-model budget |
| `lead_documents` | bounded by scoped leads | Join should stay under lead scope |
| `users_profile` | only scoped counselor ids | Prevent all-user scan |
| rendering | derived aggregates only from already scoped rows | No second broad fetch for convenience |

Transitional note:

- `limit(5000)` duoc chap nhan cho pilot docs/control only vi route da ton tai.
- Sau pilot, route nay nen di tiep sang read-model/query-budget slice.

## 8. Blocked Conditions

Stop and report `NO_GO` or `BLOCKED` if:

- Route cannot produce `HEUWorkspaceContext`.
- `scopeDecision` is `BLOCKED` or `NO_SCOPE` and code still tries to read leads.
- `users_profile` remains broad read with no scoped id narrowing.
- Pilot needs new SQL or new permissions to work.
- Any optimization request tries to bypass role/scope/RLS.
- Pilot changes behavior of finance, auth, settings or mutation flows.

## 9. Minimal Pilot Refactor Shape

Allowed code shape only:

```text
get user
-> getHEUWorkspaceContext
-> if no read access, stop
-> derive scope ids from context
-> run scoped lead query
-> derive scoped owner ids
-> run narrow profile lookup
-> render
```

Forbidden code shape:

```text
get user
-> read broad leads or profiles
-> derive scope after data load
-> hide rows in UI
```

## 10. Checklist For Final Review Of The Pilot

Use this exact pass/fail sheet when runtime pilot starts:

| Check | PASS when | Result field |
|---|---|---|
| Context wrapper used | Route imports `getHEUWorkspaceContext` | `QG-CONTEXT` |
| Scope decision handled | Route handles all four states | `QG-SCOPE-DECISION` |
| Read gate handled | Route checks `allowedActions.read` | `QG-READ-ACTION` |
| Lead query scoped | `applyHEUSegmentScope` or equivalent on base lead query | `QG-LEADS-SCOPED` |
| Join query scoped | joined reads keep scoped path | `QG-JOIN-SCOPED` |
| Profile lookup narrowed | profile ids come from scoped rows only | `QG-PROFILE-NARROWED` |
| No broad fallback | `NO_SCOPE/BLOCKED` do not query business rows | `QG-NO-BROAD-FALLBACK` |
| Bounded query | lead query still bounded | `QG-BOUNDED` |
| No secrets | no restricted raw fields added | `QG-NO-SECRET` |
| No route sprawl | only `/reports` pilot changed | `QG-NO-SPRAWL` |

## 11. Required Follow-Up After The Pilot

| Next file / slice | Why |
|---|---|
| `HEU_UX_001_ROLE_BASED_FAST_ACCESS_MAP_20260707.md` | Use the same context for first-screen fast access |
| `HEU_DATA_001_DEPARTMENT_TASK_INBOX_BLUEPRINT_20260707.md` | Build task-first screens on top of shared actor/scope context |
| `HEU_DATA_002_READ_MODEL_BUDGET_MAP_20260707.md` | Reduce heavy report reads after the pilot proves runtime context |

## 12. Verification Plan

Docs-only verification for this slice:

```powershell
Test-Path -LiteralPath 'docs/HEU_CONTROL/HEU_PERF_004_SCOPE_FIRST_QUERY_GUARD_CHECKLIST_20260707.md'
Select-String -Path 'docs/HEU_CONTROL/HEU_PERF_004_SCOPE_FIRST_QUERY_GUARD_CHECKLIST_20260707.md' -Pattern 'Pilot route|users_profile|QG-01|QG-PROFILE-NARROWED'
git diff --check -- docs/HEU_CONTROL
```

Future runtime verification for the `/reports` pilot:

```powershell
npm.cmd run check:heu-permission-scope-readiness
npm.cmd run check:heu-reports-dashboard-scope-readiness
npm.cmd run check:heu-fast-local-loop -- --runtime
npm.cmd run audit:heu-user-account-security
npm.cmd run lint
npm.cmd run build
```

Do not run the runtime bundle for this docs-only checklist slice.

## 13. Decision

| Item | Result |
|---|---|
| Query guard direction | CAN_SUA |
| Local docs/control artifact | DAT_TAM_THOI after docs verification |
| Executive direction | CHO_BGH_DUYET remains required |
| Runtime code | Not changed |
| Database/migration | Not changed |
| Production | NO-GO |

## 14. SOP Slice Result Record

SOP-SCOPE:
- `HEU-PERF-004` creates one scope-first query guard checklist for the
  `/reports` runtime pilot.
- No runtime code, SQL, user access, cache, search, dashboard, task or
  production behavior is changed.

SOP-CHECK:
- Live worktree is mixed and dirty.
- Runtime source checked: `app/reports/page.tsx`.
- Control docs checked: `HEU_PERF_003`, `HEU_PERF_002`, `HEU_CONTROL/README`.

SOP-PROFESSIONAL:
- Owner lanes: Architecture, IT_DATA, Audit, Security/Privacy,
  Performance/UX and reports/module owners.
- Result: DRAFT_CONTROL until the route pilot is reviewed with focused guards.

SOP-LEGAL:
- No legal/SOP approval is granted.
- No raw restricted data, evidence, bank data, password, token or secret is
  introduced.

SOP-LOGIC:
- The checklist forces `context -> scopeDecision -> allowedActions.read ->
  scoped query -> narrow lookup -> render`, and explicitly flags broad
  `users_profile` lookup as the current route risk to remove in the pilot.

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
- Apply the first runtime pilot only to `/reports`, and keep the touched code
  limited to shared context import, scope decision gate and narrowed profile
  lookup.
