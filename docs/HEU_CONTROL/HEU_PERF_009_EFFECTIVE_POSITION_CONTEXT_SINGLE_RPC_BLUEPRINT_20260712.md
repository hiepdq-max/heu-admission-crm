# HEU Performance 009 Effective Position Context Single RPC Blueprint

Task ID: HEU-PERF-009-EFFECTIVE-POSITION-CONTEXT-SINGLE-RPC-BLUEPRINT
Date: 2026-07-12
Status: DRAFT_CONTROL
Stage: Stage D - internal controlled test only
Production status: NO-GO

## 1. Purpose

Reduce permission and workspace-context round trips without weakening role,
position, department, workspace or RLS boundaries.

The target is one authenticated, read-only RPC for the current actor's HEU
context and requested action permissions. It replaces application-side
permission fan-out only after a controlled dual-read comparison proves the new
result. Existing RLS policies and `public.has_permission(text)` remain in place
during the pilot.

This blueprint does not create executable SQL, run a migration, change RLS,
grant permissions, enable cache, create users, call AI or approve Production.

## 2. Current Baseline

Current `lib/heu-workspace-context.ts` behavior when
`includeActionPermissions=true`:

```text
permission_round_trips=13
unique_permission_codes=12
duplicate_permission_code=handover.accept_cthssv
permission_execution_shape=PARALLEL_FAN_OUT
current_runtime=ROLE_OR_VALID_DELEGATION
database_write=NOT_PERFORMED
```

The permission groups contain 3 write-draft checks, 1 import check, 1 CTHSSV
handover check, 3 review checks and 5 system checks. Running them in parallel
reduces elapsed time but does not reduce database round trips, connection work
or per-RPC authorization overhead.

The current live dry-run also reports:

```text
active_profiles=6
fail_closed_profiles=1
active_role_matrix_coverage_gaps=0
inactive_role_permission_rows=152
BGH_ROLE_BYPASS=NO_GO_REVIEW_REQUIRED
runtime_enforcement=NO_GO_UNTIL_APPROVED_MIGRATION
```

## 3. Target Runtime Contract

Proposed contract name for a later SQL draft:

```text
public.get_current_heu_workspace_context(
  requested_permission_codes text[],
  requested_segment_id uuid default null
)
```

The exact signature remains DRAFT until IT_DATA + Audit review.
The function must never accept a `user_id`; it always resolves the actor with
`auth.uid()`.

Target output:

| Field | Required meaning |
| --- | --- |
| `contract_version` | Versioned response contract |
| `decision` | `SCOPED`, `ALL_READONLY`, `NO_SCOPE` or `BLOCKED` |
| `role_code` | Active role linked to the current profile |
| `department_code` | Department matching the assigned position |
| `position_code` | The one active assigned operating position |
| `active_segment_id` | Requested or saved active admission segment |
| `visible_segment_ids` | Explicit segments visible to the actor |
| `allowed_permission_codes` | Requested codes that pass the effective-position formula |
| `denied_permission_codes` | Requested codes that do not pass or cannot be proved |
| `no_secret_boundary` | Always true; no PII, credential or raw evidence returned |

No full profile row, email, phone, CCCD, bank field, password, token, secret,
raw lead, raw student, payment payload or evidence payload may be returned.

## 4. Effective Permission Formula

The later implementation must use:

```text
effective_permission_formula=POSITION_MATRIX_INTERSECT_ROLE_OR_VALID_DELEGATION
effective_permissions =
  active_position_permission_matrix
  INTERSECT
  (active_role_permissions UNION valid_delegations)
```

Fail closed when any condition is not proved:

1. `auth.uid()` is missing.
2. The linked profile is not `ACTIVE`.
3. The profile has zero or more than one `ACTIVE_ASSIGNED` position.
4. Position status is not active.
5. Profile role does not match the position default role.
6. Profile department does not match the position department.
7. Delegation is inactive, revoked, not started or expired.
8. Requested segment is outside explicit workspace scope.
9. HOU and non-HOU workspace scopes are mixed.
10. Any required source is missing or ambiguous.

There is no BGH role-name bypass. Executive access must be represented by the
approved position matrix and returns `ALL_READONLY`; mutation permissions still
require explicit effective permission and module gates.

## 5. RPC Security Boundary

The later SQL review must enforce all of these controls:

- The function is callable only by `authenticated`.
- Revoke execute from `PUBLIC` and `anon`.
- No service-role key is used by browser or normal application runtime.
- Explicitly resolve the caller with `(select auth.uid())`; no `user_id` input.
- If `SECURITY DEFINER` is used, record `SECURITY DEFINER REVIEW REQUIRED`, set
  `search_path = ''` and fully qualify every relation/function reference.
- Validate and de-duplicate requested permission codes.
- Limit requested permission codes to at most 32.
- Use static SQL only; no dynamic SQL from request values.
- Return only current-actor context and requested permission decisions.
- Keep RLS enabled on business tables; this RPC does not become a broad data
  reader or replace business-table RLS.

The exposed RPC is an access-decision helper, not an owner approval, finance
approval, payment action, migration action or production gate.

## 6. Performance Budget

| Metric | Current | Target |
| --- | ---: | ---: |
| Permission RPC round trips | 13 | 1 |
| Unique requested permission codes | 12 | At most 32 |
| Permission payload | 13 booleans/errors | One bounded response under 8 KiB |
| Application permission fan-out | Five groups | None |
| Shared cross-user cache | Not approved | Forbidden |

The first acceptance metric is round-trip count, not an unproven millisecond
claim. Staging/local measurements must later record p50/p95 with the same
account, position, workspace and route before and after the adapter change.

No shared static cache may store context or permissions across users,
positions, departments or workspaces. Request-level memoization is allowed only
after the context key includes actor, position, workspace and contract version.

## 7. Query And Index Review

The SQL draft must be reviewed with `EXPLAIN (ANALYZE, BUFFERS)` only in an
approved disposable/local or staging environment with synthetic identities.
Production `EXPLAIN ANALYZE` is not approved by this blueprint.

Review indexes for the exact lookup predicates, without creating them here:

- active `users_profile(id, status)` lookup;
- active assignment lookup by `user_id`, `status`, `assignment_status`;
- active position matrix lookup by `position_id`, `status`;
- active role permission lookup by `role_id`, `status`;
- valid delegation lookup by `to_user_id`, status and time window;
- active segment/workspace scope lookup by `user_id` and status.

Do not add indexes speculatively. Record query plan evidence first, then create
an index in a separate reviewed migration with backup and rollback.

## 8. Rollout Order

1. Approve this blueprint and static checker only.
2. Create a separate commented/non-executable SQL draft and Data Dictionary.
3. Review function privileges, `auth.uid()`, search path, RLS interaction and
   index access paths with IT_DATA + Audit.
4. Run the existing effective-position dry-run; no DB write.
5. In an approved local/staging database, install the candidate function under
   migration-order, backup and rollback controls.
6. Add a server-only dual-read adapter. The old result remains authoritative;
   the new result is logged as metadata-only comparison.
7. Require zero unsafe widening. Any difference that grants more access is
   `NO_GO`; expected fail-closed differences require owner review.
8. Pilot one read-only route, preferably `/reports`.
9. Only after evidence may `HEUWorkspaceContext` use the single RPC as the
   authoritative action gate.
10. Keep `public.has_permission(text)` for RLS until a separate RLS migration
    is reviewed; do not replace all policies in this slice.

## 9. Rollback

Rollback must not require destructive data changes:

1. Disable the server adapter/feature switch.
2. Return `HEUWorkspaceContext` to the existing `has_permission` fan-out.
3. Revoke execute on the candidate RPC if required.
4. Preserve comparison logs as compact metadata only.
5. Revert the candidate migration using its approved down/restore procedure.

No account, permission row, assignment, finance row, evidence row or audit row
may be hard-deleted during rollback.

## 10. Required Verification

```powershell
node scripts/check-heu-effective-position-context-single-rpc-blueprint.mjs
npm.cmd run check:heu-effective-position-permission-dry-run
npm.cmd run check:heu-settings-permission-matrix-readiness
npm.cmd run audit:heu-git-hygiene
```

Future implementation gates, not approved in this PR:

```text
SQL_EXECUTION=NOT_PERFORMED
MIGRATION=NO_GO
RLS_REPLACEMENT=NO_GO
PRODUCTION=NO_GO
```

## 11. Decision

| Item | Result |
| --- | --- |
| Single-RPC direction | CAN_SUA after IT_DATA + Audit review |
| Blueprint/checker | DAT_TAM_THOI after local gates PASS |
| SQL or migration | NOT_CREATED / NOT_PERFORMED |
| Runtime adapter | NOT_CREATED |
| AI/API runtime | NOT_USED |
| Production | NO-GO |
