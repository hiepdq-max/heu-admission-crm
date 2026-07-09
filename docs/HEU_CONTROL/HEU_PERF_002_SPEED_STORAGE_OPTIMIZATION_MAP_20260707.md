# HEU Performance 002 Speed And Storage Optimization Map

Task ID: HEU-PERF-002-SPEED-AND-STORAGE-OPTIMIZATION-MAP
Repository: heu-admission-crm
Branch: hardening/ttgdtx-9plus-pilot
HEAD at start: 246c206
Status: DRAFT_CONTROL
Executive direction: CHO_BGH_DUYET
Production status: NO-GO

## 1. Purpose

Tai lieu nay la ban do thuc chien de toi uu toc do, do muot va chi phi luu tru
cho HEU ma khong lam tran pham vi, khong nhan ban du lieu tho, khong bo qua
scope/role va khong mo rong tinh nang truoc khi khoa query guard.

Target operating result:

```text
Moi user vao nhanh.
Moi phong ban thay dung viec cua minh truoc.
Dashboard/search/task inbox doc nhe va co scope.
Khong copy full lead/student/payment/evidence qua nhieu noi.
Kiem soat nhieu tang nhung khong ton luu tru khong can thiet.
```

Tai lieu nay la control map only. No code, SQL, migration, permission grant,
UAT acceptance, evidence acceptance, finance reliance, owner GO/NO-GO or
production GO is approved by this document.

## 2. Current Reading Base

This map is grounded in:

- `docs/HEU_CODEX_OPERATING_PLAYBOOK.md`
- `docs/HEU_CURRENT_STATE_INVENTORY.md`
- `docs/HEU_SYSTEM_BUILD_BACKLOG.md`
- `docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md`
- `docs/HEU_IMPLEMENTATION_LOG.md`
- `docs/HEU_CONTROL/HEU_SYSTEM_BUILD_HANDBOOK_20260707.md`
- `docs/HEU_CONTROL/HEU_ARCH_REVIEW_COMMITTEE_CRITERIA_20260707.md`
- `docs/HEU_CONTROL/HEU_PERF_001_WORKSPACE_CONTEXT_SCOPE_FIRST_QUERY_20260707.md`

## 3. Speed And Storage Map

| Area | Da co | Thieu | File can tao / mo rong | Slice nen lam truoc | Rui ro neu chua lam | Owner |
|---|---|---|---|---|---|---|
| Workspace context chung | `lib/workspace.ts`, `lib/workspace-url.ts`, role helper, segment visibility helper | Chua co `HEUWorkspaceContext` day du cho auth, CRM user, role, org unit, active workspace, allowed actions, scope decision | `lib/heu-workspace-context.ts` hoac mo rong `lib/workspace.ts`; `docs/HEU_CONTROL/HEU_PERF_003_HEU_WORKSPACE_CONTEXT_RUNTIME_PLAN_20260707.md` | Tao 1 wrapper server-side dung chung, chua fan-out toan bo route | Moi page tu suy ra scope rieng, query rong, user vao cham va de lo scope | Architecture + IT_DATA + Audit + Performance/UX |
| Scope-first query guard | Da co contract `HEU_PERF_001`, da co `applyAdmissionSegmentIds`, da co mot so scope checks | Chua co rule runtime bat buoc cho moi route/page/server action | `docs/HEU_CONTROL/HEU_PERF_004_SCOPE_FIRST_QUERY_GUARD_CHECKLIST_20260707.md`; sau do moi them checker | Pilot 1 route read-only de chung minh `context -> scope -> query -> render` | UI loc sau query, full scan, executive/global read vuot scope | IT_DATA + Security/Privacy + Audit |
| Landing page theo tung user | Da co executive read-only dashboard, app shell quick access, search route | Chua co role-based first screen contract cho tat ca phong ban | `docs/HEU_CONTROL/HEU_UX_001_ROLE_BASED_FAST_ACCESS_MAP_20260707.md` | Chot first-screen cho 5 nhom: TUYEN_SINH, CTHSSV, DAO_TAO_KHOA, KHTC, BGH | User vao xong moi tu tim man hinh, click nhieu, query nhieu | Performance/UX + Module owners |
| Task inbox theo phong ban | Da co DCTC schema/route, owner/assignee/scope lock | Chua co task inbox chuan hoa cho tung phong voi object ref, priority, due date, queue state | `docs/HEU_CONTROL/HEU_DATA_001_DEPARTMENT_TASK_INBOX_BLUEPRINT_20260707.md` | Dung DCTC lam xuong song, chi them 1 blueprint task-first | Moi module tu ve dashboard rieng, user kho thay viec cua minh dau tien | Module owners + Audit + IT_DATA |
| Read model / summary view | Da co report-view register, source map, bridge panel, dashboard read-only boundary | Chua co read model budget theo tung phong va staleness/refresh contract | `docs/HEU_CONTROL/HEU_DATA_002_READ_MODEL_BUDGET_MAP_20260707.md` | Xac dinh 5 read model uu tien: executive, finance, admissions, cthssv, dao tao/khoa | Dashboard doc truc tiep bang lon, cham, de vuot boundary | IT_DATA + Performance/UX + Audit |
| Search metadata-only | Da co `/search`, `search_heu_os`, workspace-scope search SQL, privacy boundary | Chua co allowlist chuan hoa theo module va source-weight/refresh budget | `docs/HEU_CONTROL/HEU_SEARCH_001_METADATA_ALLOWLIST_MAP_20260707.md` | Khoa danh sach truong duoc index truoc khi mo rong nguon search | Search nhan ban du lieu, lo phone/bank/evidence, index phinh | IT_DATA + Security/Privacy + Module owners |
| Pagination va query budget | Da co mot so route dung search params/filter | Chua co page budget chung: default limit, keyset/offset rule, top-N rule | `docs/HEU_CONTROL/HEU_PERF_005_QUERY_BUDGET_AND_PAGINATION_RULES_20260707.md` | Chot default budget cho list, dashboard, search, task queue | Route tra full table, RAM va TTFB tang nhanh | Performance/UX + IT_DATA |
| DB index va access path | Da co nhieu index nghiep vu trong `database/step*.sql` | Chua co index strategy map theo user-journey va queue filters | `docs/HEU_CONTROL/HEU_DB_001_INDEX_STRATEGY_BY_USER_JOURNEY_20260707.md` | Review docs-only truoc, chua sua SQL | Them tinh nang xong moi them index, query degrade dan | IT_DATA + Database owner |
| Audit event gon nhe | Da co audit log boundary va nhieu audit scripts | Chua co compact event contract: actor, action, object_ref, delta/ref/hash, retention | `docs/HEU_CONTROL/HEU_AUDIT_001_COMPACT_EVENT_STORAGE_CONTRACT_20260707.md` | Chot event schema logic cho task/search/read model truoc khi mo rong ghi log | Audit qua nang hoac luu snapshot raw payload ton storage | Audit + IT_DATA + Security/Privacy |
| Evidence va file storage | Da co quy tac luu raw evidence ngoai Git/Codex/chat, app giu ref/metadata | Chua co data lifecycle map hot/warm/cold va retention theo nhom file | `docs/HEU_CONTROL/HEU_STORAGE_001_HOT_WARM_COLD_LIFECYCLE_20260707.md` | Lap bang retention va archive boundary truoc khi evidence/task tang nhanh | DB va storage phinh, kho tim, kho backup, kho rollback | IT_DATA + Audit + PHAP_CHE |
| Cache / revalidation | Da co Next App Router nen co the dung cache/revalidate | Chua co cache policy map theo route: no-store, revalidate, static, dynamic | `docs/HEU_CONTROL/HEU_PERF_006_ROUTE_CACHE_POLICY_MAP_20260707.md` | Chot route classes truoc khi toi uu runtime | Luc thi stale qua muc, luc thi query lai qua nhieu | Architecture + Performance/UX + IT_DATA |
| Background refresh | Da co dry-run report/email readiness va fast-local-loop | Chua co plan cho background summary refresh an toan, khong ghi de business data | `docs/HEU_CONTROL/HEU_PERF_007_BACKGROUND_SUMMARY_REFRESH_PLAN_20260707.md` | Chi lap plan/read-model refresh, chua bat worker | Dashboard lam live aggregation moi lan mo, cham va ton tai nguyen | IT_DATA + Audit |
| Slow query / perf observability | Da co build/runtime checks, docs ve collision/build blockers | Chua co route budget, slow-query threshold, measurement checklist | `docs/HEU_CONTROL/HEU_PERF_008_ROUTE_AND_QUERY_OBSERVABILITY_PLAN_20260707.md` | Chot metric docs truoc khi code perf hooks | Khong biet route nao cham, toi uu theo cam tinh | Performance/UX + IT_DATA |
| Department information compression | Da co report source map, owner/evidence refs, DCTC refs | Chua co policy "ref-first, payload-later" cho dashboard/task/search/audit | Them section vao `HEU_DATA_001` va `HEU_AUDIT_001` | Chot quy tac: task/search/dashboard chi giu ref + summary | Moi phong sao chep 1 ban du lieu rieng, ton storage va loch version | Architecture + Audit + Module owners |

## 4. Recommended Build Order

Khong nen nhay vao cache hay performance tuning som. Thu tu de vua nhanh vua
khong tran:

1. `HEU-PERF-003` - runtime `HEUWorkspaceContext` wrapper plan.
2. `HEU-PERF-004` - scope-first query guard checklist cho 1 route pilot.
3. `HEU-UX-001` - role-based fast access map theo tung phong.
4. `HEU-DATA-001` - department task inbox blueprint.
5. `HEU-DATA-002` - read model budget map.
6. `HEU-SEARCH-001` - metadata allowlist map.
7. `HEU-PERF-005` - query budget and pagination rules.
8. `HEU-DB-001` - index strategy by user journey.
9. `HEU-AUDIT-001` + `HEU-STORAGE-001` - compact audit and lifecycle storage.
10. `HEU-PERF-006/007/008` - cache, background refresh, observability.

## 5. First 3 Slices To Do First

### Slice 1 - HEUWorkspaceContext Runtime Plan

- Muc tieu: chot 1 object context dung chung cho he thong.
- Chi lam docs/control + code-plan, chua refactor nhieu route.
- Dau ra:
  - `HEU_PERF_003_HEU_WORKSPACE_CONTEXT_RUNTIME_PLAN_20260707.md`
  - field contract
  - adoption path 1 route pilot

### Slice 2 - Scope-First Query Guard Pilot

- Muc tieu: chon 1 route read-only de chung minh pattern.
- Route nen uu tien: `app/reports/page.tsx` hoac `app/data-confirmation/page.tsx`.
- Dau ra:
  - query boundary checklist
  - predicate placement
  - limit/pagination rule
  - exact focused checks phai chay

### Slice 3 - Role-Based Fast Access Map

- Muc tieu: moi user vao la thay dung man hinh dau tien.
- Khong dung dashboard tong hop de thay task chi tiet.
- Dau ra:
  - first-screen map theo role/phong ban
  - quick access top 5 action moi role
  - "must not show by default" list

## 6. Design Rules To Keep HEU Fast But Lean

| Need | Rule |
|---|---|
| Fast user open | Resolve workspace context once on server, reuse in route and action |
| Fast department work | First screen shows assigned queue, blocker, next action, not giant dashboard |
| Fast dashboard | Read only from approved summary/read-model with source ref and staleness |
| Fast search | Index metadata only: label, code, status, route, owner ref, workspace ref |
| Fast task | Store object ref + queue state + due/priority, not full payload |
| Fast audit | Store compact event and delta/ref/hash, not raw snapshot by default |
| Low storage | Put raw files/evidence in external storage; app keeps refs and retention metadata |
| Low collision | One slice, one lane, one checker cluster before next slice |

## 7. Stop Rules

Stop and report `NO_GO` or `BLOCKED` if:

- A new speed feature tries to bypass scope/permission/RLS.
- A dashboard, task inbox or search wants to copy full lead/student/payment rows.
- A storage optimization idea would hide audit history or weaken rollback.
- A cache idea may show stale finance, stale owner decision or stale scope.
- A route optimization lacks a bounded query, limit, pagination or source ref.
- A local optimization result is described like production approval.

## 8. SOP Slice Result Record

SOP-SCOPE:
- `HEU-PERF-002` creates one practical speed/storage optimization map under
  `docs/HEU_CONTROL`.
- No runtime code, SQL, data, auth, permission, migration or production
  behavior is changed.

SOP-CHECK:
- Live worktree is still mixed and dirty.
- Current sources checked: operating playbook, current-state inventory, system
  backlog, gap matrix, implementation log, system build handbook, architecture
  review criteria and PERF-001 contract.

SOP-PROFESSIONAL:
- Owner lanes: Architecture, IT_DATA, Audit, Performance/UX, PHAP_CHE and
  module owners by department.
- Result: DRAFT_CONTROL until each follow-up slice is reviewed by the right
  owner lane.

SOP-LEGAL:
- No legal/SOP approval is granted by this map.
- No raw restricted data, evidence, bank data, personal data, password, token
  or secret is introduced.

SOP-LOGIC:
- The map keeps HEU fast by choosing `context -> scope-first query -> task inbox
  -> read model -> search -> audit -> performance` and by preferring refs over
  duplicated raw payload.

SOP-VERIFY:
- Docs-only verification expected: file existence, section/token search and
  `git diff --check -- docs/HEU_CONTROL`.
- No `npm.cmd`, migration, deploy, install, commit or push is required for this
  docs-only control slice.

SOP-RESULT:
- `DAT_TAM_THOI` for local docs-control only after docs verification.
- Technical next state remains `CAN_SUA`.
- Executive direction remains `CHO_BGH_DUYET`.
- Production remains `NO-GO`.

SOP-NEXT:
- Create `HEU_PERF_003_HEU_WORKSPACE_CONTEXT_RUNTIME_PLAN_20260707.md` as the
  next smallest safe slice before touching runtime code widely.
