-- HEU Admission CRM - row level security policies
-- Run after schema.sql and seed.sql

create or replace function public.current_user_role_code()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.code
  from public.users_profile u
  join public.roles r on r.id = u.role_id
  where u.id = auth.uid()
    and u.status = 'ACTIVE'
  limit 1
$$;

create or replace function public.has_permission(permission_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users_profile u
    join public.role_permissions rp on rp.role_id = u.role_id
    where u.id = auth.uid()
      and u.status = 'ACTIVE'
      and rp.permission = permission_name
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role_code(), '') = 'ADMIN'
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
  select
    public.has_permission('leads.read_all')
    or lead_assigned_to = auth.uid()
    or lead_created_by = auth.uid()
    or (
      public.has_permission('leads.read_team')
      and exists (
        select 1
        from public.users_profile teammate
        where teammate.id = lead_assigned_to
          and teammate.manager_id = auth.uid()
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
  select
    public.has_permission('leads.write_all')
    or lead_assigned_to = auth.uid()
    or lead_created_by = auth.uid()
    or (
      public.has_permission('leads.write_team')
      and exists (
        select 1
        from public.users_profile teammate
        where teammate.id = lead_assigned_to
          and teammate.manager_id = auth.uid()
      )
    )
$$;

alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.admission_departments enable row level security;
alter table public.users_profile enable row level security;
alter table public.lead_sources enable row level security;
alter table public.admission_flows enable row level security;
alter table public.admission_programs enable row level security;
alter table public.admission_majors enable row level security;
alter table public.campaigns enable row level security;
alter table public.partners enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.lead_followups enable row level security;
alter table public.enrollment_checklists enable row level security;
alter table public.lead_documents enable row level security;
alter table public.enrollments enable row level security;
alter table public.admission_payments enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "roles_select_authenticated" on public.roles;
create policy "roles_select_authenticated"
on public.roles for select
to authenticated
using (true);

drop policy if exists "roles_admin_write" on public.roles;
create policy "roles_admin_write"
on public.roles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "role_permissions_select_authenticated" on public.role_permissions;
create policy "role_permissions_select_authenticated"
on public.role_permissions for select
to authenticated
using (true);

drop policy if exists "role_permissions_admin_write" on public.role_permissions;
create policy "role_permissions_admin_write"
on public.role_permissions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "departments_select_authenticated" on public.admission_departments;
create policy "departments_select_authenticated"
on public.admission_departments for select
to authenticated
using (true);

drop policy if exists "departments_admin_write" on public.admission_departments;
create policy "departments_admin_write"
on public.admission_departments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users_profile_select_authenticated" on public.users_profile;
create policy "users_profile_select_authenticated"
on public.users_profile for select
to authenticated
using (status = 'ACTIVE' or id = auth.uid() or public.is_admin());

drop policy if exists "users_profile_update_self" on public.users_profile;
create policy "users_profile_update_self"
on public.users_profile for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "users_profile_admin_insert" on public.users_profile;
create policy "users_profile_admin_insert"
on public.users_profile for insert
to authenticated
with check (public.is_admin());

drop policy if exists "lead_sources_select_authenticated" on public.lead_sources;
create policy "lead_sources_select_authenticated"
on public.lead_sources for select
to authenticated
using (true);

drop policy if exists "lead_sources_admin_write" on public.lead_sources;
create policy "lead_sources_admin_write"
on public.lead_sources for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "admission_flows_select_authenticated" on public.admission_flows;
create policy "admission_flows_select_authenticated"
on public.admission_flows for select
to authenticated
using (true);

drop policy if exists "admission_flows_admin_write" on public.admission_flows;
create policy "admission_flows_admin_write"
on public.admission_flows for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "admission_programs_select_authenticated" on public.admission_programs;
create policy "admission_programs_select_authenticated"
on public.admission_programs for select
to authenticated
using (true);

drop policy if exists "admission_programs_admin_write" on public.admission_programs;
create policy "admission_programs_admin_write"
on public.admission_programs for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "admission_majors_select_authenticated" on public.admission_majors;
create policy "admission_majors_select_authenticated"
on public.admission_majors for select
to authenticated
using (true);

drop policy if exists "admission_majors_admin_write" on public.admission_majors;
create policy "admission_majors_admin_write"
on public.admission_majors for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "campaigns_select_authenticated" on public.campaigns;
create policy "campaigns_select_authenticated"
on public.campaigns for select
to authenticated
using (is_deleted = false);

drop policy if exists "campaigns_manage" on public.campaigns;
create policy "campaigns_manage"
on public.campaigns for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "partners_select_authenticated" on public.partners;
create policy "partners_select_authenticated"
on public.partners for select
to authenticated
using (is_deleted = false);

drop policy if exists "partners_manage" on public.partners;
create policy "partners_manage"
on public.partners for all
to authenticated
using (public.is_admin() or public.has_permission('partners.manage'))
with check (public.is_admin() or public.has_permission('partners.manage'));

drop policy if exists "leads_select_by_scope" on public.leads;
create policy "leads_select_by_scope"
on public.leads for select
to authenticated
using (
  is_deleted = false
  and public.can_read_lead(assigned_to, created_by)
);

drop policy if exists "leads_insert_by_permission" on public.leads;
create policy "leads_insert_by_permission"
on public.leads for insert
to authenticated
with check (
  public.has_permission('leads.write_all')
  or public.has_permission('leads.write_team')
  or public.has_permission('leads.write_assigned')
);

drop policy if exists "leads_update_by_scope" on public.leads;
create policy "leads_update_by_scope"
on public.leads for update
to authenticated
using (
  is_deleted = false
  and public.can_write_lead(assigned_to, created_by)
)
with check (
  public.can_write_lead(assigned_to, created_by)
);

drop policy if exists "lead_activities_select_by_lead_scope" on public.lead_activities;
create policy "lead_activities_select_by_lead_scope"
on public.lead_activities for select
to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_activities.lead_id
      and public.can_read_lead(l.assigned_to, l.created_by)
  )
);

drop policy if exists "lead_activities_insert_by_lead_scope" on public.lead_activities;
create policy "lead_activities_insert_by_lead_scope"
on public.lead_activities for insert
to authenticated
with check (
  exists (
    select 1
    from public.leads l
    where l.id = lead_activities.lead_id
      and public.can_write_lead(l.assigned_to, l.created_by)
  )
);

drop policy if exists "lead_followups_select_by_lead_scope" on public.lead_followups;
create policy "lead_followups_select_by_lead_scope"
on public.lead_followups for select
to authenticated
using (
  is_deleted = false
  and exists (
    select 1
    from public.leads l
    where l.id = lead_followups.lead_id
      and public.can_read_lead(l.assigned_to, l.created_by)
  )
);

drop policy if exists "lead_followups_write_by_lead_scope" on public.lead_followups;
create policy "lead_followups_write_by_lead_scope"
on public.lead_followups for all
to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_followups.lead_id
      and public.can_write_lead(l.assigned_to, l.created_by)
  )
)
with check (
  exists (
    select 1
    from public.leads l
    where l.id = lead_followups.lead_id
      and public.can_write_lead(l.assigned_to, l.created_by)
  )
);

drop policy if exists "checklists_select_authenticated" on public.enrollment_checklists;
create policy "checklists_select_authenticated"
on public.enrollment_checklists for select
to authenticated
using (status = 'ACTIVE');

drop policy if exists "checklists_admin_write" on public.enrollment_checklists;
create policy "checklists_admin_write"
on public.enrollment_checklists for all
to authenticated
using (public.is_admin() or public.has_permission('documents.manage'))
with check (public.is_admin() or public.has_permission('documents.manage'));

drop policy if exists "lead_documents_select_by_lead_scope" on public.lead_documents;
create policy "lead_documents_select_by_lead_scope"
on public.lead_documents for select
to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_documents.lead_id
      and public.can_read_lead(l.assigned_to, l.created_by)
  )
);

drop policy if exists "lead_documents_write_by_lead_scope" on public.lead_documents;
create policy "lead_documents_write_by_lead_scope"
on public.lead_documents for all
to authenticated
using (
  public.has_permission('documents.manage')
  or exists (
    select 1
    from public.leads l
    where l.id = lead_documents.lead_id
      and public.can_write_lead(l.assigned_to, l.created_by)
  )
)
with check (
  public.has_permission('documents.manage')
  or exists (
    select 1
    from public.leads l
    where l.id = lead_documents.lead_id
      and public.can_write_lead(l.assigned_to, l.created_by)
  )
);

drop policy if exists "enrollments_select_by_lead_scope" on public.enrollments;
create policy "enrollments_select_by_lead_scope"
on public.enrollments for select
to authenticated
using (
  is_deleted = false
  and (
    public.has_permission('leads.read_all')
    or exists (
      select 1
      from public.leads l
      where l.id = enrollments.lead_id
        and public.can_read_lead(l.assigned_to, l.created_by)
    )
  )
);

drop policy if exists "enrollments_manage" on public.enrollments;
create policy "enrollments_manage"
on public.enrollments for all
to authenticated
using (public.has_permission('leads.write_all') or public.has_permission('documents.manage'))
with check (public.has_permission('leads.write_all') or public.has_permission('documents.manage'));

drop policy if exists "payments_select_by_role" on public.admission_payments;
create policy "payments_select_by_role"
on public.admission_payments for select
to authenticated
using (
  public.has_permission('payments.read')
  or public.has_permission('leads.read_all')
  or exists (
    select 1
    from public.leads l
    where l.id = admission_payments.lead_id
      and public.can_read_lead(l.assigned_to, l.created_by)
  )
);

drop policy if exists "payments_verify_by_role" on public.admission_payments;
create policy "payments_verify_by_role"
on public.admission_payments for all
to authenticated
using (public.has_permission('payments.verify') or public.is_admin())
with check (public.has_permission('payments.verify') or public.is_admin());

drop policy if exists "audit_logs_select_authorized" on public.audit_logs;
create policy "audit_logs_select_authorized"
on public.audit_logs for select
to authenticated
using (public.has_permission('audit.read') or public.is_admin());
