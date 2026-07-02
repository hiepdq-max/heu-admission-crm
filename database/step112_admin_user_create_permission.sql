-- Step 112 - P0-17 Admin user-create permission grant.
-- File: database/step112_admin_user_create_permission.sql
-- Purpose: make existing databases ready for in-app user creation without
-- rerunning the full seed file.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Secret boundary: do not paste service-role keys, passwords, OTPs, invite links
-- or raw PII into SQL comments, logs or evidence.

begin;

do $$
declare
  admin_role_id uuid;
  has_status_column boolean := false;
begin
  select id
  into admin_role_id
  from public.roles
  where code = 'ADMIN'
  limit 1;

  if admin_role_id is null then
    raise exception 'ADMIN role is missing; cannot grant users.create.';
  end if;

  insert into public.role_permissions (role_id, permission)
  values (admin_role_id, 'users.create')
  on conflict (role_id, permission) do nothing;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'role_permissions'
      and column_name = 'status'
  )
  into has_status_column;

  if has_status_column then
    execute $sql$
      update public.role_permissions
      set status = 'ACTIVE'
      where role_id = $1
        and permission = 'users.create'
    $sql$
    using admin_role_id;
  end if;
end
$$;

commit;
