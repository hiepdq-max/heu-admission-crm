# Hard Delete Audit

## 1. Scope

Date: 2026-06-22  
Scope: repository pattern scan excluding node_modules, .next and env files  
Mode: documentation-only audit

## 2. Search Patterns

- `.delete()`
- `delete from`
- `truncate`
- `drop table`
- `drop function`
- `cascade delete`
- `on delete cascade`

## 3. Findings

| Pattern | Location | Classification | Risk |
|---|---|---|---|
| `.delete()` | app/hou/actions.ts | RESOLVED 2026-06-25 | Former HOU payment batch rollback hard delete was replaced with `status = 'CANCELLED'` plus explanatory note |
| `.delete()` | app/leads/[id]/actions.ts | RESOLVED 2026-06-25 | Former `hou_commission_claims` rollback hard delete was replaced with `claim_status = 'CANCELLED'` plus lead activity audit note |
| `.delete()` | app/settings/actions.ts | RESOLVED 2026-06-25 | User segment/partner scope reset now uses `status = 'INACTIVE'` plus upsert `ACTIVE`; role permission replace-all now requires step109 soft revoke migration and uses `status = 'INACTIVE'` plus upsert `ACTIVE` |
| `delete from` | database/step101_ttgdtx_reconciliation_p2_13.sql | RESOLVED 2026-06-25 | Explicit rollback delete removed; exception now rolls back the draft batch without hard deleting records |
| `delete from` | database/step103_fix_p2_13_reconciliation_line_columns.sql | RESOLVED 2026-06-25 | Explicit rollback delete removed; exception now rolls back the draft batch without hard deleting records |
| `delete from` | database/step105_ttgdtx_partner_payment_request_p2_15.sql | RESOLVED 2026-06-25 | Explicit rollback delete removed; exception now rolls back the draft payment request without hard deleting records |
| `drop function` | database/step83_search_workspace_scope.sql | MEDIUM | Replacing function can be acceptable but must be migration-controlled |
| `on delete cascade` | database/schema.sql | HIGH | Base schema cascades can remove child business evidence |
| `on delete cascade` | database/step35a, step35d, step35g, step36a | HIGH | HOU program/commission/evidence cascades need review |
| `on delete cascade` | database/step38, step40, step41, step44, step48, step49, step52, step54, step56, step57, step59, step60, step62 | HIGH | Scope, evidence, workflow and short-course cascades need domain-by-domain review |
| `on delete cascade` | database/step92, step93, step94, step101, step105 | RESOLVED 2026-06-25 | TTGDTX step90-step110 cascade risk converted to `on delete restrict`; guarded by `npm.cmd run audit:ttgdtx-cascade` |
| `truncate` | CSS class names only | LOW | Pattern appears as UI text/class usage, not SQL truncate |
| `drop table` | Not detected in current scan | LOW | No current evidence |
| `cascade delete` | Not detected as literal phrase | LOW | Actual risk appears as `on delete cascade` |

## 4. Risk Classification

| Severity | Meaning |
|---|---|
| LOW | Non-database or harmless local object operation |
| MEDIUM | Migration/admin operation that can be safe if documented |
| HIGH | Business data deletion or cascade affecting operational records |
| CRITICAL | Finance, evidence, audit, approval or payout data can be removed or made unverifiable |

## 5. Required Replacement Policy

Finance, tuition, debt, reconciliation, payment, approval, evidence and audit records must not be hard deleted in production.

Use these safer patterns:

- soft delete
- archive table
- status transition
- restricted admin action
- mandatory audit log
- `status = 'CANCELLED'`
- `status = 'VOIDED'`
- `status = 'ARCHIVED'`
- `is_deleted = true`
- `deleted_at`
- `deleted_by`
- `delete_reason`
- append-only audit event
- archive table for old operational records

## 6. Must Fix Before Production

| Current pattern | Recommended replacement |
|---|---|
| Supabase `.delete()` for business rows | `update({ status: 'VOIDED', archived_at, archived_by, reason })` |
| SQL `delete from` in finance function cleanup | RESOLVED for step101/step103/step105; future cleanup must use transaction-local rollback, status transition or `FAILED_ROLLBACK` |
| `on delete cascade` for finance/evidence | `on delete restrict` or explicit archive transition |
| `on delete cascade` for pure join tables | Allowed only if documented and non-financial |
| Drop/recreate function | Versioned migration with compatibility note |

## 7. Allowed Only in Dev/Rollback

Hard delete, drop and truncate actions are allowed only for local development reset, isolated rollback procedures, or reviewed cleanup scripts that are not run against production finance, evidence, approval or audit records.

## 8. Approval Required

Any exception to the replacement policy requires written approval from IT/Data and the business owner. Finance, tuition, reconciliation, payment and evidence exceptions also require KHTC/Audit approval before production use.

## 9. Current Conclusion

This audit remains a No-Go blocker for production until:

1. All unresolved CRITICAL/HIGH findings are reviewed by IT/Data and KHTC.
2. All remaining non-TTGDTX finance deletion/cascade paths are converted to status/archive/restrict or explicitly waived.
3. Audit log is proven to preserve before/after values.
4. TTGDTX P2-03, P2-10, P2-13, P2-15, P2-16, P2-17 and P2-19 cannot lose evidence through cascade in Step90-Step110.

## 10. 2026-06-25 Update

- Resolved app-level critical finding in `app/leads/[id]/actions.ts`.
- The HOU COM claim rollback path now soft-cancels the claim with
  `claim_status = 'CANCELLED'`, stores an explanatory note, and writes a
  `lead_activities` audit event.
- Resolved SQL `delete from` rollback patterns in step101, step103 and step105.
- A current Step90-Step110 scan shows no remaining SQL `delete from`.
- Resolved HOU payment batch rollback hard delete in `app/hou/actions.ts`.
- Resolved user segment/partner scope hard delete in `app/settings/actions.ts`
  by inactivating old scope rows and upserting active rows.
- Added `database/step109_role_permission_soft_revoke_p0_11.sql` and updated
  `app/settings/actions.ts` so role permission replacement no longer uses
  Supabase `.delete()`.
- Added `npm.cmd run audit:permission-soft-revoke` to verify Step109 columns,
  ACTIVE permission filtering and settings soft-revoke/upsert behavior.
- Added `npm.cmd run audit:hard-delete` to detect business `.delete()` and SQL
  hard-delete patterns before handoff.
- Converted TTGDTX Step90-Step110 `on delete cascade` findings to
  `on delete restrict` in step92, step93, step94, step101 and step105.
- Added `npm.cmd run audit:ttgdtx-cascade` to fail if a Step90-Step110 SQL
  file reintroduces `on delete cascade`.
- Production remains NO-GO because non-TTGDTX/base schema cascade review,
  unapplied step109, role/audit evidence, backup and rollback still require
  review and approval.
