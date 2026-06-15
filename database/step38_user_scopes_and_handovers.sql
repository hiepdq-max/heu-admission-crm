-- Step 38 - User business scopes and inter-department handovers.
-- Run after step37_admission_segments.sql.
-- Scope rule:
-- - ADMIN/BGH or users with leads.read_all/leads.write_all keep broad access.
-- - If a user has segment/partner scopes, leads must match those scopes.
-- - Users with no explicit scope keep current behavior for migration safety.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('users.manage_department'),
    ('scope.manage_department'),
    ('handover.create'),
    ('handover.accept_cthssv'),
    ('handover.accept_accounting'),
    ('reports.read_scope')
) as p(permission)
where r.code in ('ADMIN', 'ADMISSION_HEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('handover.create'),
    ('handover.accept_cthssv')
) as p(permission)
where r.code = 'CTHSSV'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('handover.accept_accounting'),
    ('payments.read'),
    ('payments.verify')
) as p(permission)
where r.code = 'ACCOUNTING'
on conflict (role_id, permission) do nothing;

create table if not exists public.user_admission_segment_scopes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  segment_id uuid not null references public.admission_segments(id) on delete cascade,
  assigned_by uuid references public.users_profile(id),
  note text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, segment_id)
);

create table if not exists public.user_partner_scopes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  assigned_by uuid references public.users_profile(id),
  note text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, partner_id)
);

create table if not exists public.lead_handovers (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  handover_type text not null,
  from_department text not null,
  to_department text not null,
  handover_status text not null default 'REQUESTED',
  requested_by uuid references public.users_profile(id),
  requested_at timestamptz not null default now(),
  accepted_by uuid references public.users_profile(id),
  accepted_at timestamptz,
  rejected_by uuid references public.users_profile(id),
  rejected_at timestamptz,
  note text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_handovers_type_valid check (
    handover_type in (
      'ADMISSION_TO_CTHSSV',
      'CTHSSV_TO_ACCOUNTING',
      'ADMISSION_TO_ACCOUNTING'
    )
  ),
  constraint lead_handovers_status_valid check (
    handover_status in ('REQUESTED', 'ACCEPTED', 'REJECTED', 'CANCELLED')
  )
);

create index if not exists idx_user_segment_scopes_user
on public.user_admission_segment_scopes(user_id)
where status = 'ACTIVE';

create index if not exists idx_user_partner_scopes_user
on public.user_partner_scopes(user_id)
where status = 'ACTIVE';

create index if not exists idx_lead_handovers_lead
on public.lead_handovers(lead_id, created_at desc);

create unique index if not exists uniq_active_lead_handover_type
on public.lead_handovers(lead_id, handover_type)
where handover_status in ('REQUESTED', 'ACCEPTED') and status = 'ACTIVE';

create or replace function public.user_has_any_business_scope()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_admission_segment_scopes s
    where s.user_id = auth.uid()
      and s.status = 'ACTIVE'
  )
  or exists (
    select 1
    from public.user_partner_scopes s
    where s.user_id = auth.uid()
      and s.status = 'ACTIVE'
  )
$$;

create or replace function public.can_access_business_scope(
  lead_segment_id uuid,
  lead_partner_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or not public.user_has_any_business_scope()
    or (
      (
        not exists (
          select 1
          from public.user_admission_segment_scopes s
          where s.user_id = auth.uid()
            and s.status = 'ACTIVE'
        )
        or exists (
          select 1
          from public.user_admission_segment_scopes s
          where s.user_id = auth.uid()
            and s.segment_id = lead_segment_id
            and s.status = 'ACTIVE'
        )
      )
      and
      (
        not exists (
          select 1
          from public.user_partner_scopes s
          where s.user_id = auth.uid()
            and s.status = 'ACTIVE'
        )
        or exists (
          select 1
          from public.user_partner_scopes s
          where s.user_id = auth.uid()
            and s.partner_id = lead_partner_id
            and s.status = 'ACTIVE'
        )
      )
    )
$$;

create or replace function public.can_manage_user_scope(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or (
      public.has_permission('scope.manage_department')
      and exists (
        select 1
        from public.users_profile manager
        join public.users_profile target
          on target.department_id = manager.department_id
        where manager.id = auth.uid()
          and target.id = target_user_id
          and target.status = 'ACTIVE'
      )
    )
$$;

create or replace function public.can_access_lead_handover(target_lead_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lead_handovers h
    where h.lead_id = target_lead_id
      and h.status = 'ACTIVE'
      and h.handover_status in ('REQUESTED', 'ACCEPTED')
      and (
        (
          h.to_department = 'CTHSSV'
          and public.has_permission('handover.accept_cthssv')
        )
        or (
          h.to_department = 'ACCOUNTING'
          and public.has_permission('handover.accept_accounting')
        )
      )
  )
$$;

alter table public.user_admission_segment_scopes enable row level security;
alter table public.user_partner_scopes enable row level security;
alter table public.lead_handovers enable row level security;

drop policy if exists "user_segment_scopes_select_authorized"
on public.user_admission_segment_scopes;
create policy "user_segment_scopes_select_authorized"
on public.user_admission_segment_scopes for select
to authenticated
using (
  public.is_admin()
  or user_id = auth.uid()
  or public.can_manage_user_scope(user_id)
);

drop policy if exists "user_segment_scopes_manage_authorized"
on public.user_admission_segment_scopes;
create policy "user_segment_scopes_manage_authorized"
on public.user_admission_segment_scopes for all
to authenticated
using (public.can_manage_user_scope(user_id))
with check (
  public.can_manage_user_scope(user_id)
  and (
    assigned_by is null
    or assigned_by = auth.uid()
    or public.is_admin()
  )
);

drop policy if exists "user_partner_scopes_select_authorized"
on public.user_partner_scopes;
create policy "user_partner_scopes_select_authorized"
on public.user_partner_scopes for select
to authenticated
using (
  public.is_admin()
  or user_id = auth.uid()
  or public.can_manage_user_scope(user_id)
);

drop policy if exists "user_partner_scopes_manage_authorized"
on public.user_partner_scopes;
create policy "user_partner_scopes_manage_authorized"
on public.user_partner_scopes for all
to authenticated
using (public.can_manage_user_scope(user_id))
with check (
  public.can_manage_user_scope(user_id)
  and (
    assigned_by is null
    or assigned_by = auth.uid()
    or public.is_admin()
  )
);

drop policy if exists "lead_handovers_select_by_lead_scope"
on public.lead_handovers;
create policy "lead_handovers_select_by_lead_scope"
on public.lead_handovers for select
to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_handovers.lead_id
      and public.can_read_lead(l.assigned_to, l.created_by)
      and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
  )
  or requested_by = auth.uid()
  or (
    to_department = 'CTHSSV'
    and public.has_permission('handover.accept_cthssv')
  )
  or (
    from_department = 'CTHSSV'
    and public.has_permission('handover.accept_cthssv')
  )
  or (
    to_department = 'ACCOUNTING'
    and public.has_permission('handover.accept_accounting')
  )
);

drop policy if exists "lead_handovers_insert_authorized"
on public.lead_handovers;
create policy "lead_handovers_insert_authorized"
on public.lead_handovers for insert
to authenticated
with check (
  (
    public.has_permission('handover.create')
    and exists (
      select 1
      from public.leads l
      where l.id = lead_handovers.lead_id
        and public.can_write_lead(l.assigned_to, l.created_by)
        and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
    )
  )
  or (
    handover_type = 'CTHSSV_TO_ACCOUNTING'
    and from_department = 'CTHSSV'
    and to_department = 'ACCOUNTING'
    and public.has_permission('handover.accept_cthssv')
    and public.can_access_lead_handover(lead_id)
  )
);

drop policy if exists "lead_handovers_update_authorized"
on public.lead_handovers;
create policy "lead_handovers_update_authorized"
on public.lead_handovers for update
to authenticated
using (
  public.is_admin()
  or (
    to_department = 'CTHSSV'
    and public.has_permission('handover.accept_cthssv')
  )
  or (
    to_department = 'ACCOUNTING'
    and public.has_permission('handover.accept_accounting')
  )
)
with check (
  public.is_admin()
  or (
    to_department = 'CTHSSV'
    and public.has_permission('handover.accept_cthssv')
  )
  or (
    to_department = 'ACCOUNTING'
    and public.has_permission('handover.accept_accounting')
  )
);

drop policy if exists "leads_select_by_scope" on public.leads;
create policy "leads_select_by_scope"
on public.leads for select
to authenticated
using (
  is_deleted = false
  and public.can_access_business_scope(admission_segment_id, partner_id)
  and (
    public.can_read_lead(assigned_to, created_by)
    or public.can_access_lead_handover(id)
  )
);

drop policy if exists "lead_activities_select_by_lead_scope"
on public.lead_activities;
create policy "lead_activities_select_by_lead_scope"
on public.lead_activities for select
to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_activities.lead_id
      and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
      and (
        public.can_read_lead(l.assigned_to, l.created_by)
        or public.can_access_lead_handover(l.id)
      )
  )
);

drop policy if exists "lead_activities_insert_by_lead_scope"
on public.lead_activities;
create policy "lead_activities_insert_by_lead_scope"
on public.lead_activities for insert
to authenticated
with check (
  exists (
    select 1
    from public.leads l
    where l.id = lead_activities.lead_id
      and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
      and (
        public.can_write_lead(l.assigned_to, l.created_by)
        or public.can_access_lead_handover(l.id)
      )
  )
);

drop policy if exists "lead_documents_select_by_lead_scope"
on public.lead_documents;
create policy "lead_documents_select_by_lead_scope"
on public.lead_documents for select
to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_documents.lead_id
      and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
      and (
        public.can_read_lead(l.assigned_to, l.created_by)
        or public.can_access_lead_handover(l.id)
      )
  )
);

drop policy if exists "lead_documents_write_by_lead_scope"
on public.lead_documents;
create policy "lead_documents_write_by_lead_scope"
on public.lead_documents for all
to authenticated
using (
  public.has_permission('documents.manage')
  or exists (
    select 1
    from public.leads l
    where l.id = lead_documents.lead_id
      and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
      and (
        public.can_write_lead(l.assigned_to, l.created_by)
        or (
          public.has_permission('handover.accept_cthssv')
          and public.can_access_lead_handover(l.id)
        )
      )
  )
)
with check (
  public.has_permission('documents.manage')
  or exists (
    select 1
    from public.leads l
    where l.id = lead_documents.lead_id
      and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
      and (
        public.can_write_lead(l.assigned_to, l.created_by)
        or (
          public.has_permission('handover.accept_cthssv')
          and public.can_access_lead_handover(l.id)
        )
      )
  )
);

drop policy if exists "lead_condition_checks_select_lead_access"
on public.lead_condition_checks;
create policy "lead_condition_checks_select_lead_access"
on public.lead_condition_checks for select
to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_condition_checks.lead_id
      and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
      and (
        public.can_read_lead(l.assigned_to, l.created_by)
        or public.can_access_lead_handover(l.id)
      )
  )
);

drop policy if exists "leads_update_by_scope" on public.leads;
create policy "leads_update_by_scope"
on public.leads for update
to authenticated
using (
  is_deleted = false
  and public.can_write_lead(assigned_to, created_by)
  and public.can_access_business_scope(admission_segment_id, partner_id)
)
with check (
  public.can_write_lead(assigned_to, created_by)
  and public.can_access_business_scope(admission_segment_id, partner_id)
);

drop policy if exists "leads_insert_by_permission" on public.leads;
create policy "leads_insert_by_permission"
on public.leads for insert
to authenticated
with check (
  (
    public.has_permission('leads.write_all')
    or public.has_permission('leads.write_team')
    or public.has_permission('leads.write_assigned')
  )
  and public.can_access_business_scope(admission_segment_id, partner_id)
);

drop trigger if exists trg_user_segment_scopes_updated_at
on public.user_admission_segment_scopes;
create trigger trg_user_segment_scopes_updated_at
before update on public.user_admission_segment_scopes
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_partner_scopes_updated_at
on public.user_partner_scopes;
create trigger trg_user_partner_scopes_updated_at
before update on public.user_partner_scopes
for each row execute function public.set_updated_at();

drop trigger if exists trg_lead_handovers_updated_at
on public.lead_handovers;
create trigger trg_lead_handovers_updated_at
before update on public.lead_handovers
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_segment_scopes_audit
on public.user_admission_segment_scopes;
create trigger trg_user_segment_scopes_audit
after insert or update or delete on public.user_admission_segment_scopes
for each row execute function public.write_audit_log();

drop trigger if exists trg_user_partner_scopes_audit
on public.user_partner_scopes;
create trigger trg_user_partner_scopes_audit
after insert or update or delete on public.user_partner_scopes
for each row execute function public.write_audit_log();

drop trigger if exists trg_lead_handovers_audit
on public.lead_handovers;
create trigger trg_lead_handovers_audit
after insert or update or delete on public.lead_handovers
for each row execute function public.write_audit_log();
