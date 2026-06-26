-- Step 109 - P0-11 Role Permission Soft Revoke.
-- Purpose: remove the app-level hard-delete pattern from role permission
-- replacement. Production execution still requires backup, rollback and
-- approval under the TTGDTX pilot production checklist.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - Do not drop the new columns and do not delete audit evidence.
-- - If rollback is needed, restore active permissions through an approved
--   forward corrective migration or restore from backup after approval.

begin;

alter table public.role_permissions
  add column if not exists status public.record_status not null default 'ACTIVE',
  add column if not exists assigned_by uuid references public.users_profile(id),
  add column if not exists revoked_by uuid references public.users_profile(id),
  add column if not exists revoked_at timestamptz,
  add column if not exists note text,
  add column if not exists updated_at timestamptz not null default now();

update public.role_permissions
set status = 'ACTIVE'
where status is null;

create index if not exists idx_role_permissions_active_role
on public.role_permissions(role_id, permission)
where status = 'ACTIVE';

drop trigger if exists trg_role_permissions_updated_at
on public.role_permissions;

create trigger trg_role_permissions_updated_at
before update on public.role_permissions
for each row execute function public.set_updated_at();

drop trigger if exists trg_role_permissions_audit
on public.role_permissions;

create trigger trg_role_permissions_audit
after insert or update or delete on public.role_permissions
for each row execute function public.write_audit_log();

create or replace view public.active_role_permissions
with (security_invoker = true)
as
select
  id,
  role_id,
  permission,
  assigned_by,
  revoked_by,
  revoked_at,
  note,
  created_at,
  updated_at
from public.role_permissions
where status = 'ACTIVE';

grant select on public.active_role_permissions to authenticated;

create or replace function public.has_permission(permission_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  role_match boolean := false;
  delegation_match boolean := false;
begin
  select exists (
    select 1
    from public.users_profile u
    join public.role_permissions rp on rp.role_id = u.role_id
    where u.id = auth.uid()
      and u.status = 'ACTIVE'
      and rp.status = 'ACTIVE'
      and rp.permission = permission_name
  )
  into role_match;

  if role_match then
    return true;
  end if;

  if to_regclass('public.permission_delegations') is not null then
    execute $delegation$
      select exists (
        select 1
        from public.permission_delegations d
        where d.to_user_id = auth.uid()
          and d.permission_code = $1
          and d.delegation_status = 'ACTIVE'
          and d.record_status = 'ACTIVE'
          and now() >= d.starts_at
          and now() <= d.ends_at
      )
    $delegation$
    into delegation_match
    using permission_name;
  end if;

  return coalesce(delegation_match, false);
end;
$$;

grant execute on function public.has_permission(text) to authenticated;

commit;
