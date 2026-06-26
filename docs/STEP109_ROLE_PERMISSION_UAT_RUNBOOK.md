# Step109 Role Permission Soft Revoke UAT Runbook

Date: 2026-06-25
Scope: `database/step109_role_permission_soft_revoke_p0_11.sql`
Status: DRAFT, not approved for production

## 1. Purpose

Step109 removes the last app-level business hard-delete pattern in role
permission management. Instead of physically deleting rows from
`role_permissions`, the system revokes old rows with `status = 'INACTIVE'` and
activates selected rows with upsert.

This runbook must be completed before Step109 is allowed in production.

## 2. Non-Negotiable Rules

1. Do not run Step109 on production without backup evidence.
2. Do not run Step109 if there is no tested restore path.
3. Do not test with real passwords, OTPs, service keys or bank data.
4. Do not let AI approve the migration. AI may only check, warn and summarize.
5. Keep at least one verified ADMIN account active before and after the test.

## 3. Owners

| Control | Owner | Required evidence |
|---|---|---|
| Backup | IT_DATA | Backup ID, timestamp, restore note |
| Permission UAT | IT_DATA + ADMIN | Screenshots or query output |
| Audit review | AUDIT | Audit rows for role permission change |
| Approval | BGH + IT_DATA | Written approval or waiver |

## 4. Pre-Migration Checklist

Run these checks in a staging Supabase project first:

Run local/static guards before touching any database:

```powershell
npm.cmd run audit:hard-delete
npm.cmd run audit:permission-soft-revoke
```

```sql
select count(*) as admin_user_count
from public.users_profile u
join public.roles r on r.id = u.role_id
where u.status = 'ACTIVE'
  and r.code = 'ADMIN';

select r.code, count(rp.*) as permission_count
from public.roles r
left join public.role_permissions rp on rp.role_id = r.id
group by r.code
order by r.code;

select public.has_permission('system.manage') as can_manage_system;
select public.has_permission('users.manage') as can_manage_users;
```

Pass criteria:

1. `admin_user_count >= 1`.
2. ADMIN has `system.manage` and `users.manage`.
3. Current `role_permissions` row count is recorded.
4. Backup ID is recorded.
5. Static permission soft-revoke audit passes.

## 5. Migration Execution

Allowed environment order:

1. Local/staging only.
2. UAT database only.
3. Production only after signed approval.

Run:

```sql
\i database/step109_role_permission_soft_revoke_p0_11.sql
```

Do not run this from a chat message against production.

## 6. Post-Migration Checks

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'role_permissions'
  and column_name in (
    'status',
    'assigned_by',
    'revoked_by',
    'revoked_at',
    'note',
    'updated_at'
  )
order by column_name;

select count(*) as active_permission_count
from public.role_permissions
where status = 'ACTIVE';

select count(*) as inactive_permission_count
from public.role_permissions
where status = 'INACTIVE';

select public.has_permission('system.manage') as can_manage_system;
select public.has_permission('users.manage') as can_manage_users;
```

Pass criteria:

1. All six new columns exist.
2. Active permission count is not zero.
3. ADMIN still has `system.manage` and `users.manage`.
4. Settings page can display role permissions.
5. Updating a non-ADMIN role does not remove audit history.

## 7. App UAT Steps

Use synthetic users and staging data.

1. Login as ADMIN.
2. Open `/settings`.
3. Pick a non-ADMIN role.
4. Remove one harmless permission.
5. Save.
6. Confirm removed permission row is `INACTIVE`, not deleted.
7. Add the same permission back.
8. Confirm the same role/permission pair is `ACTIVE`.
9. Confirm ADMIN role still includes `system.manage` and `users.manage`.
10. Confirm audit log records update events on `role_permissions`.

Expected database state:

```sql
select role_id, permission, status, revoked_by, revoked_at, note
from public.role_permissions
where permission = '<tested_permission>'
order by updated_at desc;
```

## 8. Emergency Rollback Principle

Do not drop columns and do not delete audit evidence.

If Step109 causes a permission outage in staging/UAT:

1. Stop testing.
2. Do not continue role edits.
3. Restore from backup if this is production.
4. If the issue is only the `has_permission()` filter, apply an approved forward
   fix that restores access while preserving Step109 columns and audit history.

Minimal emergency access restoration for UAT only:

```sql
update public.role_permissions
set status = 'ACTIVE',
    note = coalesce(note, '') || E'\n[EMERGENCY_UAT_RESTORE] Reactivated during Step109 UAT.',
    revoked_by = null,
    revoked_at = null
where status = 'INACTIVE';
```

This statement is not approved for production unless BGH + IT_DATA + AUDIT
explicitly approve it after reviewing the backup state.

## 9. Go/No-Go

Step109 remains NO-GO for production until:

1. Backup exists.
2. Restore path is tested.
3. ADMIN lockout test passes.
4. Audit log evidence is captured.
5. Settings UI test passes.
6. `npm.cmd run audit:permission-soft-revoke` passes.
7. `docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md` is updated by a human
   owner after UAT evidence is attached.
