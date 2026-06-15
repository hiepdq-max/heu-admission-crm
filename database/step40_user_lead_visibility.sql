-- Step 40 - Per-user lead visibility control.
-- Run after step38_user_scopes_and_handovers.sql.
-- This keeps business scopes, then adds one more rule for whose leads a user can see:
-- OWN, TEAM, DEPARTMENT, or ALL.

create table if not exists public.user_lead_visibility_scopes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  lead_visibility text not null default 'OWN',
  assigned_by uuid references public.users_profile(id),
  note text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id),
  constraint user_lead_visibility_valid check (
    lead_visibility in ('OWN', 'TEAM', 'DEPARTMENT', 'ALL')
  )
);

create index if not exists idx_user_lead_visibility_scopes_user
on public.user_lead_visibility_scopes(user_id)
where status = 'ACTIVE';

alter table public.user_lead_visibility_scopes enable row level security;

drop policy if exists "user_lead_visibility_select_authorized"
on public.user_lead_visibility_scopes;
create policy "user_lead_visibility_select_authorized"
on public.user_lead_visibility_scopes for select
to authenticated
using (
  public.is_admin()
  or user_id = auth.uid()
  or public.can_manage_user_scope(user_id)
);

drop policy if exists "user_lead_visibility_manage_authorized"
on public.user_lead_visibility_scopes;
create policy "user_lead_visibility_manage_authorized"
on public.user_lead_visibility_scopes for all
to authenticated
using (public.can_manage_user_scope(user_id))
with check (
  public.can_manage_user_scope(user_id)
  and (
    lead_visibility <> 'ALL'
    or public.is_admin()
  )
  and (
    assigned_by is null
    or assigned_by = auth.uid()
    or public.is_admin()
  )
);

create or replace function public.current_user_lead_visibility()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select s.lead_visibility
      from public.user_lead_visibility_scopes s
      where s.user_id = auth.uid()
        and s.status = 'ACTIVE'
      limit 1
    ),
    case
      when public.is_admin() or public.current_user_role_code() = 'BGH' then 'ALL'
      when public.has_permission('leads.read_all') then 'ALL'
      when public.has_permission('leads.read_team') then 'TEAM'
      else 'OWN'
    end
  )
$$;

create or replace function public.can_read_lead(
  lead_assigned_to uuid,
  lead_created_by uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with visibility as (
    select public.current_user_lead_visibility() as value
  ),
  current_profile as (
    select department_id
    from public.users_profile
    where id = auth.uid()
      and status = 'ACTIVE'
    limit 1
  )
  select
    public.is_admin()
    or (select value from visibility) = 'ALL'
    or lead_assigned_to = auth.uid()
    or lead_created_by = auth.uid()
    or (
      (select value from visibility) = 'TEAM'
      and exists (
        select 1
        from public.users_profile teammate
        where teammate.id in (lead_assigned_to, lead_created_by)
          and teammate.manager_id = auth.uid()
          and teammate.status = 'ACTIVE'
      )
    )
    or (
      (select value from visibility) = 'DEPARTMENT'
      and exists (
        select 1
        from public.users_profile teammate
        cross join current_profile current_user_profile
        where teammate.id in (lead_assigned_to, lead_created_by)
          and teammate.status = 'ACTIVE'
          and teammate.department_id is not null
          and teammate.department_id = current_user_profile.department_id
      )
    )
$$;

create or replace function public.can_write_lead(
  lead_assigned_to uuid,
  lead_created_by uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with visibility as (
    select public.current_user_lead_visibility() as value
  ),
  current_profile as (
    select department_id
    from public.users_profile
    where id = auth.uid()
      and status = 'ACTIVE'
    limit 1
  )
  select
    public.is_admin()
    or lead_assigned_to = auth.uid()
    or lead_created_by = auth.uid()
    or (
      (select value from visibility) = 'ALL'
      and public.has_permission('leads.write_all')
    )
    or (
      (select value from visibility) = 'TEAM'
      and public.has_permission('leads.write_team')
      and exists (
        select 1
        from public.users_profile teammate
        where teammate.id in (lead_assigned_to, lead_created_by)
          and teammate.manager_id = auth.uid()
          and teammate.status = 'ACTIVE'
      )
    )
    or (
      (select value from visibility) = 'DEPARTMENT'
      and public.has_permission('leads.write_all')
      and exists (
        select 1
        from public.users_profile teammate
        cross join current_profile current_user_profile
        where teammate.id in (lead_assigned_to, lead_created_by)
          and teammate.status = 'ACTIVE'
          and teammate.department_id is not null
          and teammate.department_id = current_user_profile.department_id
      )
    )
$$;

drop trigger if exists trg_user_lead_visibility_scopes_updated_at
on public.user_lead_visibility_scopes;
create trigger trg_user_lead_visibility_scopes_updated_at
before update on public.user_lead_visibility_scopes
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_lead_visibility_scopes_audit
on public.user_lead_visibility_scopes;
create trigger trg_user_lead_visibility_scopes_audit
after insert or update or delete on public.user_lead_visibility_scopes
for each row execute function public.audit_changes();
