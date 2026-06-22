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
| `.delete()` | app/hou/actions.ts | HIGH | HOU operational/commission data may be removed instead of archived |
| `.delete()` | app/leads/[id]/actions.ts | CRITICAL | `hou_commission_claims` deletion can affect finance/commission audit trail |
| `.delete()` | app/settings/actions.ts | HIGH | Role/permission/user configuration deletion can affect access audit |
| `delete from` | database/step101_ttgdtx_reconciliation_p2_13.sql | CRITICAL | Reconciliation batch cleanup can remove finance/audit context if transaction behavior changes |
| `delete from` | database/step103_fix_p2_13_reconciliation_line_columns.sql | CRITICAL | Same P2-13 reconciliation cleanup risk |
| `delete from` | database/step105_ttgdtx_partner_payment_request_p2_15.sql | CRITICAL | Payment request cleanup is in payout control chain |
| `drop function` | database/step83_search_workspace_scope.sql | MEDIUM | Replacing function can be acceptable but must be migration-controlled |
| `on delete cascade` | database/schema.sql | HIGH | Base schema cascades can remove child business evidence |
| `on delete cascade` | database/step35a, step35d, step35g, step36a | HIGH | HOU program/commission/evidence cascades need review |
| `on delete cascade` | database/step38, step40, step41, step44, step48, step49, step52, step54, step56, step57, step59, step60, step62 | HIGH | Scope, evidence, workflow and short-course cascades need domain-by-domain review |
| `on delete cascade` | database/step92, step93, step94, step101, step105 | CRITICAL | TTGDTX finance/import/reconciliation/payment cascades affect pilot controls |
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
| SQL `delete from` in finance function cleanup | Transaction-local staging or mark draft as `FAILED_ROLLBACK` |
| `on delete cascade` for finance/evidence | `on delete restrict` or explicit archive transition |
| `on delete cascade` for pure join tables | Allowed only if documented and non-financial |
| Drop/recreate function | Versioned migration with compatibility note |

## 7. Allowed Only in Dev/Rollback

Hard delete, drop and truncate actions are allowed only for local development reset, isolated rollback procedures, or reviewed cleanup scripts that are not run against production finance, evidence, approval or audit records.

## 8. Approval Required

Any exception to the replacement policy requires written approval from IT/Data and the business owner. Finance, tuition, reconciliation, payment and evidence exceptions also require KHTC/Audit approval before production use.

## 9. Current Conclusion

This audit is a No-Go blocker for production until:

1. All CRITICAL findings are reviewed by IT/Data and KHTC.
2. All finance deletion paths are converted to status/archive or explicitly waived.
3. Audit log is proven to preserve before/after values.
4. TTGDTX P2-03, P2-10, P2-13, P2-15, P2-16 and P2-17 cannot lose evidence through cascade.
