# HEU Search 002 Workspace Context Scope First Runtime 2026-07-10

Task ID: HEU-SEARCH-002-WORKSPACE-CONTEXT-SCOPE-FIRST-RUNTIME
Repository: heu-admission-crm
Branch: codex/heu/search-workspace-context-scope-first
Status: DRAFT_CONTROL
Production status: NO-GO
Scope: one route runtime pilot for `/search`

## 1. Purpose

This slice applies `HEUWorkspaceContext` to `/search` after the first `/reports`
runtime pilot.

Goal:

- keep HEU as one main modular monolith app;
- reuse one shared workspace context before search queries;
- keep search metadata scoped by workspace, role and permission;
- block broad search fallback when the scoped RPC is missing;
- keep AI in draft/check/suggest mode only.

This slice does not add SQL, does not run migration, does not change RLS, does
not enable AI runtime, does not add paid automation, does not write business
data and does not approve production.

## 2. Runtime Boundary

| Item | Decision |
|---|---|
| Route | `/search` only |
| Shared context | `getHEUWorkspaceContext` |
| Route permission | `heu_os.search.read` plus existing context read guard |
| Query target | `search_heu_os` RPC only after context and read gate |
| Result budget | `SEARCH_REMOTE_QUERY_LIMIT = 50` |
| Broad fallback | Blocked |
| Write mutation | Not allowed |
| AI call | Not allowed |

## 3. Required Flow

Allowed flow:

```text
auth.getUser
-> getHEUWorkspaceContext
-> has_permission("heu_os.search.read")
-> allowed read gate
-> BLOCKED/NO_SCOPE/active segment guard
-> scoped search_heu_os RPC
-> defensive row filter
-> render metadata results
```

Forbidden flow:

```text
auth.getUser
-> call unscoped search_heu_os
-> filter or hide rows after broad search
```

## 4. PASS_LOCAL Conditions

| Check | Required evidence |
|---|---|
| Context first | `/search` imports and calls `getHEUWorkspaceContext` before remote search |
| Read gate | `/search` checks `heu_os.search.read` or context read before RPC |
| No broad fallback | `/search` does not call `search_heu_os` without `p_segment_id` |
| Scope stop | `BLOCKED`, `NO_SCOPE` and no active scoped segment stop before RPC |
| Result budget | Remote search limit is a named constant of 50 |
| Defensive filter | Remote rows are filtered against active segment unless all-segment read-only applies |
| No mutation | Route has no insert, update, upsert, delete, service role, env or fetch path |

## 5. Owner Review

| Owner lane | Review item |
|---|---|
| IT_DATA | Confirm context-first and no broad search fallback |
| Audit | Confirm PASS_LOCAL/NO_GO wording and no hidden production reliance |
| Security/Privacy | Confirm search remains metadata-only and does not index raw PII |
| BGH/Owner | Confirm search is navigation/discovery only, not official decision |

## 6. Verification

Focused checks:

```powershell
node --check scripts/check-heu-search-workspace-context-scope-first-readiness.mjs
npm.cmd run check:heu-search-workspace-context-scope-first-readiness
npm.cmd run check:heu-workspace-context-runtime-readiness
git diff --check
```

Full build/lint may be run after the focused checks:

```powershell
npm.cmd run lint
npm.cmd run build -- --webpack
```

Use dummy public Supabase env only for local build if required. Do not use
secret keys.

## 7. Rollback

Rollback is revert-only:

- revert `/search` changes;
- revert this doc;
- revert the checker script;
- revert the package alias.

No database rollback is required because this slice has no SQL, migration,
schema, storage, AI provider or production change.

## 8. SOP Slice Result Record

SOP-SCOPE:

- Apply `HEUWorkspaceContext` to `/search` only.
- Keep route read-only and metadata-only.

SOP-CHECK:

- Static checker verifies context-first flow, read gate, no broad fallback and
  no mutation APIs.

SOP-PROFESSIONAL:

- IT_DATA and Security/Privacy own search scope and metadata allowlist.
- Audit owns PASS_LOCAL/NO_GO evidence wording.

SOP-LEGAL:

- This slice does not issue SOP, accept evidence, approve student status,
  approve finance, or grant legal reliance.

SOP-LOGIC:

- Search must not become a data-export path.
- Scoped query must happen before result rendering.

SOP-VERIFY:

- `node --check`
- `npm.cmd run check:heu-search-workspace-context-scope-first-readiness`
- `npm.cmd run check:heu-workspace-context-runtime-readiness`
- `git diff --check`

SOP-RESULT:

- `DAT_TAM_THOI` only when focused checks pass.
- Runtime search remains a controlled pilot.
- Production remains `NO-GO`.

SOP-NEXT:

- If this PR is accepted, choose either `/data-confirmation` context gate or
  first role-based landing screen contract.
