-- Step 45 - P0-06 User Scope Enforcement.
-- Run after step44_admission_segment_operating_os.sql.
-- Purpose: show effective user scope, risk flags and enforcement status.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('scope.audit'),
    ('scope.enforcement.read')
) as p(permission)
where r.code in ('ADMIN', 'BGH', 'AUDIT')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('scope.enforcement.read')
) as p(permission)
where r.code in ('ADMISSION_HEAD', 'TEAM_LEAD')
on conflict (role_id, permission) do nothing;

create or replace function public.can_read_scope_enforcement()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('scope.audit')
    or public.has_permission('scope.enforcement.read')
    or public.has_permission('scope.manage_department')
$$;

grant execute on function public.can_read_scope_enforcement() to authenticated;

-- P0-06 tightens business data access:
-- non-admin users must have at least one active segment or partner scope.
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
    or (
      public.user_has_any_business_scope()
      and (
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
      and (
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

grant execute on function public.can_access_business_scope(uuid, uuid) to authenticated;

create or replace view public.user_scope_effective_access
with (security_invoker = true)
as
with base as (
  select
    u.id as user_id,
    u.email,
    u.full_name,
    u.status as user_status,
    r.code as role_code,
    r.name as role_name,
    d.id as department_id,
    d.code as department_code,
    d.name as department_name,
    u.manager_id,
    m.full_name as manager_name,
    coalesce(v.lead_visibility,
      case
        when r.code in ('ADMIN', 'BGH') then 'ALL'
        when exists (
          select 1
          from public.role_permissions rp
          where rp.role_id = u.role_id
            and rp.permission = 'leads.read_all'
        ) then 'ALL'
        when exists (
          select 1
          from public.role_permissions rp
          where rp.role_id = u.role_id
            and rp.permission = 'leads.read_team'
        ) then 'TEAM'
        else 'OWN'
      end
    ) as lead_visibility
  from public.users_profile u
  left join public.roles r on r.id = u.role_id
  left join public.admission_departments d on d.id = u.department_id
  left join public.users_profile m on m.id = u.manager_id
  left join public.user_lead_visibility_scopes v
    on v.user_id = u.id
    and v.status = 'ACTIVE'
  where u.status = 'ACTIVE'
    and public.can_read_scope_enforcement()
    and (
      public.is_admin()
      or public.current_user_role_code() = 'BGH'
      or public.has_permission('scope.audit')
      or u.id = auth.uid()
      or (
        (
          public.has_permission('scope.manage_department')
          or public.has_permission('scope.enforcement.read')
        )
        and exists (
          select 1
          from public.users_profile current_user_profile
          where current_user_profile.id = auth.uid()
            and current_user_profile.status = 'ACTIVE'
            and current_user_profile.department_id is not null
            and current_user_profile.department_id = u.department_id
        )
      )
    )
),
scope_counts as (
  select
    b.user_id,
    count(distinct us.segment_id) filter (where us.status = 'ACTIVE')::int as segment_scope_count,
    count(distinct ps.partner_id) filter (where ps.status = 'ACTIVE')::int as partner_scope_count,
    count(distinct subordinate.id) filter (where subordinate.status = 'ACTIVE')::int as direct_report_count,
    count(distinct assigned_leads.id) filter (where assigned_leads.is_deleted = false)::int as assigned_lead_count,
    count(distinct created_leads.id) filter (where created_leads.is_deleted = false)::int as created_lead_count
  from base b
  left join public.user_admission_segment_scopes us on us.user_id = b.user_id
  left join public.user_partner_scopes ps on ps.user_id = b.user_id
  left join public.users_profile subordinate on subordinate.manager_id = b.user_id
  left join public.leads assigned_leads on assigned_leads.assigned_to = b.user_id
  left join public.leads created_leads on created_leads.created_by = b.user_id
  group by b.user_id
),
permissions as (
  select
    u.id as user_id,
    bool_or(rp.permission = 'leads.read_all') as has_leads_read_all,
    bool_or(rp.permission = 'leads.write_all') as has_leads_write_all,
    bool_or(rp.permission = 'settings.manage') as has_settings_manage,
    bool_or(rp.permission = 'scope.manage_department') as has_scope_manage_department,
    count(rp.permission)::int as permission_count
  from public.users_profile u
  left join public.role_permissions rp on rp.role_id = u.role_id
  where u.status = 'ACTIVE'
  group by u.id
),
evaluated as (
  select
    b.*,
    coalesce(sc.segment_scope_count, 0) as segment_scope_count,
    coalesce(sc.partner_scope_count, 0) as partner_scope_count,
    coalesce(sc.direct_report_count, 0) as direct_report_count,
    coalesce(sc.assigned_lead_count, 0) as assigned_lead_count,
    coalesce(sc.created_lead_count, 0) as created_lead_count,
    coalesce(p.has_leads_read_all, false) as has_leads_read_all,
    coalesce(p.has_leads_write_all, false) as has_leads_write_all,
    coalesce(p.has_settings_manage, false) as has_settings_manage,
    coalesce(p.has_scope_manage_department, false) as has_scope_manage_department,
    coalesce(p.permission_count, 0) as permission_count,
    (
      b.role_code in ('ADMIN', 'BGH')
      or coalesce(p.has_leads_read_all, false)
      or b.lead_visibility = 'ALL'
    ) as broad_lead_access,
    (
      coalesce(sc.segment_scope_count, 0) > 0
      or coalesce(sc.partner_scope_count, 0) > 0
    ) as has_business_scope,
    (
      b.role_code not in ('ADMIN', 'BGH')
      and coalesce(b.role_code, '') not like '%_HEAD'
      and b.department_id is not null
      and b.manager_id is null
    ) as missing_manager,
    (
      b.role_code not in ('ADMIN', 'BGH')
      and b.department_id is null
    ) as missing_department,
    (
      b.role_code not in ('ADMIN', 'BGH')
      and coalesce(sc.segment_scope_count, 0) = 0
      and coalesce(sc.partner_scope_count, 0) = 0
    ) as missing_business_scope,
    (
      b.role_code not in ('ADMIN', 'BGH')
      and (
        coalesce(p.has_leads_read_all, false)
        or b.lead_visibility = 'ALL'
      )
    ) as over_broad_non_admin,
    (
      b.lead_visibility = 'TEAM'
      and coalesce(sc.direct_report_count, 0) = 0
    ) as team_scope_without_subordinate
  from base b
  left join scope_counts sc on sc.user_id = b.user_id
  left join permissions p on p.user_id = b.user_id
)
select
  user_id,
  email,
  full_name,
  user_status,
  role_code,
  role_name,
  department_id,
  department_code,
  department_name,
  manager_id,
  manager_name,
  lead_visibility,
  segment_scope_count,
  partner_scope_count,
  direct_report_count,
  assigned_lead_count,
  created_lead_count,
  permission_count,
  has_leads_read_all,
  has_leads_write_all,
  has_settings_manage,
  has_scope_manage_department,
  broad_lead_access,
  has_business_scope,
  array_remove(array[
    case when missing_department then 'MISSING_DEPARTMENT' end,
    case when missing_manager then 'MISSING_MANAGER' end,
    case when missing_business_scope then 'MISSING_BUSINESS_SCOPE' end,
    case when over_broad_non_admin then 'OVER_BROAD_NON_ADMIN' end,
    case when team_scope_without_subordinate then 'TEAM_SCOPE_WITHOUT_SUBORDINATE' end
  ], null) as risk_flags,
  case
    when over_broad_non_admin then 'HIGH_RISK'
    when missing_department or missing_manager or missing_business_scope then 'NEEDS_FIX'
    when team_scope_without_subordinate then 'CHECK'
    else 'OK'
  end as enforcement_status,
  case
    when not broad_lead_access and has_business_scope then 'STRICT'
    when not broad_lead_access and not has_business_scope then 'ROLE_ONLY'
    when broad_lead_access and role_code in ('ADMIN', 'BGH') then 'FULL_CONTROL'
    else 'BROAD'
  end as access_model
from evaluated;

grant select on public.user_scope_effective_access to authenticated;

create or replace view public.user_scope_enforcement_summary
with (security_invoker = true)
as
select
  count(*)::int as user_count,
  count(*) filter (where enforcement_status = 'OK')::int as ok_count,
  count(*) filter (where enforcement_status = 'CHECK')::int as check_count,
  count(*) filter (where enforcement_status = 'NEEDS_FIX')::int as needs_fix_count,
  count(*) filter (where enforcement_status = 'HIGH_RISK')::int as high_risk_count,
  count(*) filter (where access_model in ('BROAD', 'FULL_CONTROL'))::int as broad_access_count,
  count(*) filter (where access_model = 'STRICT')::int as strict_access_count,
  count(*) filter (where segment_scope_count = 0 and partner_scope_count = 0 and role_code not in ('ADMIN', 'BGH'))::int as missing_scope_count
from public.user_scope_effective_access;

grant select on public.user_scope_enforcement_summary to authenticated;

insert into public.data_dictionary_tables (
  table_code,
  table_name,
  module_code,
  table_type,
  data_owner_department,
  purpose,
  sensitivity_level,
  ai_allowed,
  control_status
) values (
  'USER_SCOPE_EFFECTIVE_ACCESS',
  'User Scope Effective Access',
  'M01_IDENTITY_SCOPE',
  'REPORT_VIEW',
  'ADMIN + IT_DATA',
  'View tong hop pham vi hieu luc cua user, risk flags va trang thai enforcement.',
  'RESTRICTED',
  false,
  'DAT_TAM_THOI'
)
on conflict (table_code) do update set
  table_name = excluded.table_name,
  module_code = excluded.module_code,
  table_type = excluded.table_type,
  data_owner_department = excluded.data_owner_department,
  purpose = excluded.purpose,
  sensitivity_level = excluded.sensitivity_level,
  ai_allowed = excluded.ai_allowed,
  control_status = excluded.control_status,
  updated_at = now();

insert into public.decision_gates (
  gate_code,
  gate_name,
  gate_type,
  entity_type,
  entity_code,
  owner_department,
  checker_note,
  approver_note,
  decision_status
) values (
  'GATE_P0_06_USER_SCOPE_ENFORCEMENT',
  'P0-06 User Scope Enforcement',
  'DATA',
  'USER_SCOPE',
  'ALL_USERS',
  'ADMIN + BGH + IT_DATA',
  'Kiem tra user co phong ban, quan ly truc tiep, scope doi tuong/doi tac va muc hien thi lead hop ly.',
  'Khong mo automation/report/export neu user con HIGH_RISK hoac NEEDS_FIX chua duoc xu ly.',
  'DRAFT'
)
on conflict (gate_code) do update set
  gate_name = excluded.gate_name,
  gate_type = excluded.gate_type,
  entity_type = excluded.entity_type,
  entity_code = excluded.entity_code,
  owner_department = excluded.owner_department,
  checker_note = excluded.checker_note,
  approver_note = excluded.approver_note,
  updated_at = now();
