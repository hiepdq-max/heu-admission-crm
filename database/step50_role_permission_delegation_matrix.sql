-- Step 50 - P0-11 Role, Permission & Delegation Matrix.
-- Run after step49_master_data_governance.sql.
-- Purpose: central matrix for roles, permissions, direct manager line, scope risk and temporary delegation.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('permission_matrix.read'),
    ('permission_matrix.manage'),
    ('permission_delegation.request'),
    ('permission_delegation.approve'),
    ('permission_delegation.revoke')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('permission_matrix.read'),
    ('permission_delegation.approve')
) as p(permission)
where r.code = 'BGH'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('permission_matrix.read'),
    ('permission_delegation.request'),
    ('permission_delegation.approve'),
    ('permission_delegation.revoke')
) as p(permission)
where r.code in ('ADMISSION_HEAD', 'TEAM_LEAD', 'CTHSSV_LEAD', 'ACCOUNTING_LEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('permission_matrix.read'),
    ('permission_delegation.request')
) as p(permission)
where r.code in ('LEGAL', 'AUDIT', 'HOU_OPERATOR')
on conflict (role_id, permission) do nothing;

create table if not exists public.permission_registry (
  id uuid primary key default gen_random_uuid(),
  permission_code text not null unique,
  permission_group text not null default 'OTHER',
  permission_label text not null,
  module_code text,
  owner_department text,
  risk_level text not null default 'MEDIUM',
  grant_scope text not null default 'ROLE',
  requires_scope boolean not null default false,
  requires_approval boolean not null default false,
  allow_delegation boolean not null default false,
  max_delegation_hours int not null default 72,
  ai_allowed boolean not null default false,
  control_note text,
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint permission_registry_risk_valid check (
    risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
  ),
  constraint permission_registry_grant_scope_valid check (
    grant_scope in ('ROLE', 'ROLE_AND_SCOPE', 'APPROVAL', 'TEMP_DELEGATION', 'SYSTEM_ONLY')
  ),
  constraint permission_registry_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.permission_delegations (
  id uuid primary key default gen_random_uuid(),
  delegation_code text not null unique,
  from_user_id uuid not null references public.users_profile(id),
  to_user_id uuid not null references public.users_profile(id),
  permission_code text not null,
  delegation_reason text not null,
  scope_note text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  delegation_status text not null default 'PENDING',
  requested_by uuid references public.users_profile(id),
  approved_by uuid references public.users_profile(id),
  approved_at timestamptz,
  revoked_by uuid references public.users_profile(id),
  revoked_at timestamptz,
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint permission_delegations_status_valid check (
    delegation_status in ('PENDING', 'ACTIVE', 'REJECTED', 'REVOKED', 'CANCELLED')
  ),
  constraint permission_delegations_time_valid check (ends_at > starts_at),
  constraint permission_delegations_users_different check (from_user_id <> to_user_id)
);

create index if not exists idx_permission_registry_group
on public.permission_registry(permission_group, risk_level, control_status)
where status = 'ACTIVE';

create index if not exists idx_permission_delegations_to_user
on public.permission_delegations(to_user_id, permission_code, starts_at, ends_at)
where record_status = 'ACTIVE';

create index if not exists idx_permission_delegations_status
on public.permission_delegations(delegation_status, ends_at)
where record_status = 'ACTIVE';

alter table public.permission_registry enable row level security;
alter table public.permission_delegations enable row level security;

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
  or exists (
    select 1
    from public.permission_delegations d
    where d.to_user_id = auth.uid()
      and d.permission_code = permission_name
      and d.delegation_status = 'ACTIVE'
      and d.record_status = 'ACTIVE'
      and now() >= d.starts_at
      and now() <= d.ends_at
  )
$$;

create or replace function public.can_read_permission_matrix()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('permission_matrix.read')
    or public.has_permission('permission_matrix.manage')
    or public.has_permission('master_control.read')
    or public.can_read_master_control()
$$;

create or replace function public.can_manage_permission_matrix()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('permission_matrix.manage')
    or public.can_manage_master_control()
$$;

create or replace function public.can_request_permission_delegation()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('permission_delegation.request')
    or public.has_permission('permission_delegation.approve')
    or public.can_manage_permission_matrix()
$$;

create or replace function public.can_approve_permission_delegation()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('permission_delegation.approve')
    or public.can_manage_permission_matrix()
$$;

create or replace function public.can_revoke_permission_delegation()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('permission_delegation.revoke')
    or public.has_permission('permission_delegation.approve')
    or public.can_manage_permission_matrix()
$$;

grant execute on function public.can_read_permission_matrix() to authenticated;
grant execute on function public.can_manage_permission_matrix() to authenticated;
grant execute on function public.can_request_permission_delegation() to authenticated;
grant execute on function public.can_approve_permission_delegation() to authenticated;
grant execute on function public.can_revoke_permission_delegation() to authenticated;

create or replace function public.next_permission_delegation_code()
returns text
language sql
stable
security definer
set search_path = public
as $$
  with prefix as (
    select 'PDL-' || to_char(now(), 'YYYYMMDD') || '-' as value
  ),
  last_no as (
    select coalesce(max((substring(delegation_code from '([0-9]{3})$'))::int), 0) as value
    from public.permission_delegations d
    cross join prefix p
    where d.delegation_code like p.value || '%'
  )
  select prefix.value || lpad((last_no.value + 1)::text, 3, '0')
  from prefix, last_no
$$;

grant execute on function public.next_permission_delegation_code() to authenticated;

drop policy if exists "permission_registry_select" on public.permission_registry;
create policy "permission_registry_select"
on public.permission_registry for select
to authenticated
using (public.can_read_permission_matrix());

drop policy if exists "permission_registry_manage" on public.permission_registry;
create policy "permission_registry_manage"
on public.permission_registry for all
to authenticated
using (public.can_manage_permission_matrix())
with check (public.can_manage_permission_matrix());

drop policy if exists "permission_delegations_select" on public.permission_delegations;
create policy "permission_delegations_select"
on public.permission_delegations for select
to authenticated
using (
  public.can_read_permission_matrix()
  or from_user_id = auth.uid()
  or to_user_id = auth.uid()
  or requested_by = auth.uid()
  or approved_by = auth.uid()
);

drop policy if exists "permission_delegations_insert" on public.permission_delegations;
create policy "permission_delegations_insert"
on public.permission_delegations for insert
to authenticated
with check (
  public.can_request_permission_delegation()
  and (
    requested_by = auth.uid()
    or public.can_manage_permission_matrix()
  )
  and (
    delegation_status = 'PENDING'
    or public.can_approve_permission_delegation()
  )
  and exists (
    select 1
    from public.permission_registry pr
    where pr.permission_code = permission_delegations.permission_code
      and pr.status = 'ACTIVE'
      and (
        pr.allow_delegation
        or public.can_manage_permission_matrix()
      )
  )
);

drop policy if exists "permission_delegations_update" on public.permission_delegations;
create policy "permission_delegations_update"
on public.permission_delegations for update
to authenticated
using (
  public.can_approve_permission_delegation()
  or public.can_revoke_permission_delegation()
  or public.can_manage_permission_matrix()
)
with check (
  public.can_approve_permission_delegation()
  or public.can_revoke_permission_delegation()
  or public.can_manage_permission_matrix()
);

drop trigger if exists trg_permission_registry_updated_at on public.permission_registry;
create trigger trg_permission_registry_updated_at
before update on public.permission_registry
for each row execute function public.set_updated_at();

drop trigger if exists trg_permission_delegations_updated_at on public.permission_delegations;
create trigger trg_permission_delegations_updated_at
before update on public.permission_delegations
for each row execute function public.set_updated_at();

drop trigger if exists trg_permission_registry_audit on public.permission_registry;
create trigger trg_permission_registry_audit
after insert or update or delete on public.permission_registry
for each row execute function public.write_audit_log();

drop trigger if exists trg_permission_delegations_audit on public.permission_delegations;
create trigger trg_permission_delegations_audit
after insert or update or delete on public.permission_delegations
for each row execute function public.write_audit_log();

insert into public.permission_registry (
  permission_code,
  permission_group,
  permission_label,
  module_code,
  owner_department,
  risk_level,
  grant_scope,
  requires_scope,
  requires_approval,
  allow_delegation,
  max_delegation_hours,
  ai_allowed,
  control_note,
  control_status
) values
  ('system.manage', 'SYSTEM', 'Quan tri he thong', 'M01_IDENTITY_SCOPE', 'IT_DATA', 'CRITICAL', 'SYSTEM_ONLY', false, true, false, 0, false, 'Chi Admin duoc giu quyen he thong loi.', 'DAT_TAM_THOI'),
  ('users.manage', 'SYSTEM', 'Quan ly user', 'M01_IDENTITY_SCOPE', 'ADMIN', 'CRITICAL', 'APPROVAL', false, true, false, 0, false, 'Tao/sua user phai co audit va nguoi quan ly truc tiep.', 'DAT_TAM_THOI'),
  ('users.manage_department', 'SYSTEM', 'Quan ly user cung phong', 'M01_IDENTITY_SCOPE', 'TRUONG_PHONG', 'HIGH', 'ROLE_AND_SCOPE', true, true, true, 72, false, 'Chi quan ly nhan su trong phong minh.', 'DAT_TAM_THOI'),
  ('scope.manage_department', 'SCOPE', 'Phan scope trong phong', 'M01_IDENTITY_SCOPE', 'TRUONG_PHONG', 'HIGH', 'ROLE_AND_SCOPE', true, true, true, 72, false, 'Chi phan doi tuong/doi tac trong pham vi phong.', 'DAT_TAM_THOI'),
  ('master_control.manage', 'MASTER_CONTROL', 'Quan ly Master Control', 'M00_MASTER_CONTROL', 'BGH + IT_DATA', 'CRITICAL', 'APPROVAL', false, true, false, 0, false, 'Anh huong toan he dieu hanh HEU OS.', 'DAT_TAM_THOI'),
  ('master_control.approve', 'MASTER_CONTROL', 'Duyet Master Control', 'M00_MASTER_CONTROL', 'BGH', 'CRITICAL', 'APPROVAL', false, true, true, 24, false, 'Chi BGH/nguoi duoc uy quyen ngan han duyet gate.', 'DAT_TAM_THOI'),
  ('master_control.check', 'MASTER_CONTROL', 'Kiem Master Control', 'M00_MASTER_CONTROL', 'PHAP_CHE + IT_DATA + AUDIT', 'HIGH', 'APPROVAL', false, true, true, 72, false, 'Kiem can cu, SOP, data va gate.', 'DAT_TAM_THOI'),
  ('leads.read_all', 'LEAD', 'Xem toan bo lead', 'M05_ADMISSION_CRM', 'TUYEN_SINH', 'HIGH', 'APPROVAL', true, true, true, 48, false, 'Doc toan bo lead la quyen rong, can giam sat.', 'DAT_TAM_THOI'),
  ('leads.write_all', 'LEAD', 'Sua toan bo lead', 'M05_ADMISSION_CRM', 'TUYEN_SINH', 'CRITICAL', 'APPROVAL', true, true, true, 24, false, 'Sua toan bo lead co rui ro sai trang thai/nguon/COM.', 'DAT_TAM_THOI'),
  ('leads.read_team', 'LEAD', 'Xem lead cua doi', 'M05_ADMISSION_CRM', 'TUYEN_SINH', 'MEDIUM', 'ROLE_AND_SCOPE', true, false, true, 168, false, 'Can manager_id va scope phong/doi.', 'DAT_TAM_THOI'),
  ('leads.write_team', 'LEAD', 'Sua lead cua doi', 'M05_ADMISSION_CRM', 'TUYEN_SINH', 'HIGH', 'ROLE_AND_SCOPE', true, true, true, 72, false, 'Chi trong doi/pham vi duoc phan.', 'DAT_TAM_THOI'),
  ('leads.read_assigned', 'LEAD', 'Xem lead duoc giao', 'M05_ADMISSION_CRM', 'TUYEN_SINH', 'LOW', 'ROLE_AND_SCOPE', true, false, true, 168, false, 'Nhan vien xem lead minh duoc giao.', 'DAT_TAM_THOI'),
  ('leads.write_assigned', 'LEAD', 'Sua lead duoc giao', 'M05_ADMISSION_CRM', 'TUYEN_SINH', 'MEDIUM', 'ROLE_AND_SCOPE', true, false, true, 168, false, 'Nhan vien chi sua lead minh phu trach.', 'DAT_TAM_THOI'),
  ('leads.assign', 'LEAD', 'Phan lead', 'M05_ADMISSION_CRM', 'TUYEN_SINH', 'HIGH', 'APPROVAL', true, true, true, 72, false, 'Can tranh tranh chap nguon lead.', 'DAT_TAM_THOI'),
  ('leads.import', 'LEAD', 'Import lead', 'M05_ADMISSION_CRM', 'TUYEN_SINH + MARKETING', 'HIGH', 'ROLE_AND_SCOPE', true, true, true, 72, false, 'Import can chong trung va gan dung doi tuong tuyen sinh.', 'DAT_TAM_THOI'),
  ('documents.manage', 'DOCUMENT', 'Quan ly ho so', 'M06_HSSV_HANDOVER', 'CTHSSV', 'HIGH', 'ROLE_AND_SCOPE', true, true, true, 72, false, 'Ho so anh huong du dieu kien va ban giao.', 'DAT_TAM_THOI'),
  ('payments.verify', 'FINANCE', 'Xac nhan thanh toan', 'M07_FINANCE_ACCOUNTING', 'KHTC', 'CRITICAL', 'APPROVAL', true, true, true, 24, false, 'Xac nhan thu/chi phai theo chuan ke toan.', 'DAT_TAM_THOI'),
  ('hou.com.read_sensitive', 'HOU_COM', 'Xem COM HOU nhay cam', 'M08_HOU_LINKAGE', 'BGH + KHTC + TUYEN_SINH', 'CRITICAL', 'APPROVAL', true, true, false, 0, false, 'Chi BGH/quan tri/truong phong/ketoan duoc xem ti le nhay cam.', 'DAT_TAM_THOI'),
  ('hou.com.manage', 'HOU_COM', 'Quan ly COM HOU', 'M08_HOU_LINKAGE', 'KHTC + TUYEN_SINH', 'CRITICAL', 'APPROVAL', true, true, true, 24, false, 'Khong de chi COM hai lan.', 'DAT_TAM_THOI'),
  ('hou.com.approve', 'HOU_COM', 'Duyet COM HOU', 'M08_HOU_LINKAGE', 'BGH + KHTC', 'CRITICAL', 'APPROVAL', true, true, true, 24, false, 'Can kiem cong no, bo hoc, hoc phi va rui ro.', 'DAT_TAM_THOI'),
  ('permission_matrix.manage', 'PERMISSION', 'Quan ly ma tran quyen', 'M01_IDENTITY_SCOPE', 'BGH + IT_DATA', 'CRITICAL', 'SYSTEM_ONLY', false, true, false, 0, false, 'Quyen nay khong duoc uy quyen dai han.', 'DAT_TAM_THOI'),
  ('permission_delegation.approve', 'PERMISSION', 'Duyet uy quyen tam thoi', 'M01_IDENTITY_SCOPE', 'BGH + TRUONG_PHONG', 'CRITICAL', 'APPROVAL', true, true, true, 24, false, 'Duyet uy quyen phai co ly do va han.', 'DAT_TAM_THOI')
on conflict (permission_code) do update set
  permission_group = excluded.permission_group,
  permission_label = excluded.permission_label,
  module_code = excluded.module_code,
  owner_department = excluded.owner_department,
  risk_level = excluded.risk_level,
  grant_scope = excluded.grant_scope,
  requires_scope = excluded.requires_scope,
  requires_approval = excluded.requires_approval,
  allow_delegation = excluded.allow_delegation,
  max_delegation_hours = excluded.max_delegation_hours,
  ai_allowed = excluded.ai_allowed,
  control_note = excluded.control_note,
  control_status = excluded.control_status,
  updated_at = now();

insert into public.permission_registry (
  permission_code,
  permission_group,
  permission_label,
  module_code,
  owner_department,
  risk_level,
  grant_scope,
  requires_scope,
  requires_approval,
  allow_delegation,
  max_delegation_hours,
  ai_allowed,
  control_note,
  control_status
)
select distinct
  rp.permission,
  upper(split_part(rp.permission, '.', 1)),
  rp.permission,
  'M01_IDENTITY_SCOPE',
  'IT_DATA',
  case
    when rp.permission like '%manage%' or rp.permission like '%approve%' or rp.permission like '%verify%' then 'HIGH'
    when rp.permission like '%read_all%' or rp.permission like '%write_all%' then 'HIGH'
    else 'MEDIUM'
  end,
  case
    when rp.permission like '%read_all%' or rp.permission like '%write_all%' then 'APPROVAL'
    when rp.permission like '%manage%' or rp.permission like '%approve%' or rp.permission like '%verify%' then 'APPROVAL'
    else 'ROLE'
  end,
  rp.permission like '%team%' or rp.permission like '%assigned%' or rp.permission like '%scope%',
  rp.permission like '%manage%' or rp.permission like '%approve%' or rp.permission like '%verify%' or rp.permission like '%read_all%' or rp.permission like '%write_all%',
  not (rp.permission = 'system.manage' or rp.permission like '%read_sensitive%'),
  72,
  false,
  'Tu dong dang ky tu role_permissions hien co. Can IT_DATA/ADMIN bo sung nhan, owner va rule neu can.',
  'DAT_TAM_THOI'
from public.role_permissions rp
where not exists (
  select 1
  from public.permission_registry pr
  where pr.permission_code = rp.permission
);

create or replace view public.permission_registry_status
with (security_invoker = true)
as
select
  pr.id,
  pr.permission_code,
  pr.permission_group,
  pr.permission_label,
  pr.module_code,
  m.module_name,
  pr.owner_department,
  pr.risk_level,
  pr.grant_scope,
  pr.requires_scope,
  pr.requires_approval,
  pr.allow_delegation,
  pr.max_delegation_hours,
  pr.ai_allowed,
  pr.control_note,
  pr.control_status,
  coalesce(role_stats.role_count, 0)::int as role_count,
  coalesce(user_stats.user_count, 0)::int as user_count,
  coalesce(delegation_stats.active_delegation_count, 0)::int as active_delegation_count,
  array_remove(array[
    case when pr.owner_department is null or length(trim(pr.owner_department)) = 0 then 'MISSING_OWNER' end,
    case when pr.risk_level in ('HIGH', 'CRITICAL') and not pr.requires_approval then 'HIGH_RISK_WITHOUT_APPROVAL' end,
    case when pr.risk_level = 'CRITICAL' and pr.allow_delegation and pr.max_delegation_hours > 24 then 'CRITICAL_DELEGATION_TOO_LONG' end,
    case when pr.risk_level in ('HIGH', 'CRITICAL') and pr.ai_allowed then 'AI_ON_HIGH_RISK_PERMISSION' end,
    case when pr.control_status in ('CAN_SUA', 'CHUA_DU_DIEU_KIEN') then 'CONTROL_NOT_READY' end
  ], null) as control_flags,
  case
    when pr.owner_department is null or length(trim(pr.owner_department)) = 0 then 'BLOCKED'
    when pr.risk_level in ('HIGH', 'CRITICAL') and not pr.requires_approval then 'NEEDS_FIX'
    when pr.risk_level = 'CRITICAL' and pr.allow_delegation and pr.max_delegation_hours > 24 then 'NEEDS_FIX'
    when pr.control_status in ('CAN_SUA', 'CHUA_DU_DIEU_KIEN') then 'NEEDS_FIX'
    when pr.control_status = 'DAT' then 'READY'
    else 'TEMP_READY'
  end as registry_status
from public.permission_registry pr
left join public.heu_os_modules m on m.module_code = pr.module_code
left join lateral (
  select count(distinct rp.role_id) as role_count
  from public.role_permissions rp
  where rp.permission = pr.permission_code
) role_stats on true
left join lateral (
  select count(distinct u.id) as user_count
  from public.users_profile u
  join public.role_permissions rp on rp.role_id = u.role_id
  where rp.permission = pr.permission_code
    and u.status = 'ACTIVE'
) user_stats on true
left join lateral (
  select count(*) as active_delegation_count
  from public.permission_delegations d
  where d.permission_code = pr.permission_code
    and d.delegation_status = 'ACTIVE'
    and d.record_status = 'ACTIVE'
    and now() between d.starts_at and d.ends_at
) delegation_stats on true
where pr.status = 'ACTIVE'
  and public.can_read_permission_matrix();

grant select on public.permission_registry_status to authenticated;

create or replace view public.role_permission_matrix_status
with (security_invoker = true)
as
select
  rp.id,
  r.id as role_id,
  r.code as role_code,
  r.name as role_name,
  rp.permission as permission_code,
  pr.permission_group,
  pr.permission_label,
  pr.module_code,
  pr.risk_level,
  pr.grant_scope,
  pr.requires_scope,
  pr.requires_approval,
  pr.allow_delegation,
  pr.control_status,
  array_remove(array[
    case when pr.id is null then 'NOT_IN_PERMISSION_REGISTRY' end,
    case when pr.risk_level in ('HIGH', 'CRITICAL') and pr.requires_approval is false then 'HIGH_RISK_WITHOUT_APPROVAL' end,
    case when r.code not in ('ADMIN', 'BGH') and rp.permission in ('system.manage', 'permission_matrix.manage') then 'SYSTEM_PERMISSION_ON_NON_ADMIN_ROLE' end
  ], null) as control_flags,
  case
    when pr.id is null then 'NEEDS_REGISTRY'
    when r.code not in ('ADMIN', 'BGH') and rp.permission in ('system.manage', 'permission_matrix.manage') then 'BLOCKED'
    when pr.control_status in ('CAN_SUA', 'CHUA_DU_DIEU_KIEN') then 'NEEDS_FIX'
    else 'READY'
  end as matrix_status
from public.role_permissions rp
join public.roles r on r.id = rp.role_id
left join public.permission_registry pr on pr.permission_code = rp.permission and pr.status = 'ACTIVE'
where public.can_read_permission_matrix();

grant select on public.role_permission_matrix_status to authenticated;

create or replace view public.permission_delegation_status
with (security_invoker = true)
as
select
  d.id,
  d.delegation_code,
  d.from_user_id,
  from_user.full_name as from_user_name,
  from_user.email as from_user_email,
  from_role.code as from_role_code,
  d.to_user_id,
  to_user.full_name as to_user_name,
  to_user.email as to_user_email,
  to_role.code as to_role_code,
  d.permission_code,
  pr.permission_label,
  pr.permission_group,
  pr.risk_level,
  pr.allow_delegation,
  pr.max_delegation_hours,
  d.delegation_reason,
  d.scope_note,
  d.starts_at,
  d.ends_at,
  d.delegation_status,
  d.requested_by,
  requester.full_name as requested_by_name,
  d.approved_by,
  approver.full_name as approved_by_name,
  d.approved_at,
  d.revoked_by,
  revoker.full_name as revoked_by_name,
  d.revoked_at,
  d.note,
  d.created_at,
  d.updated_at,
  case
    when d.record_status <> 'ACTIVE' then 'INACTIVE'
    when d.delegation_status = 'ACTIVE' and now() > d.ends_at then 'EXPIRED'
    when d.delegation_status = 'ACTIVE' and now() < d.starts_at then 'SCHEDULED'
    else d.delegation_status
  end as effective_status,
  array_remove(array[
    case when pr.id is null then 'PERMISSION_NOT_REGISTERED' end,
    case when pr.allow_delegation is false then 'DELEGATION_NOT_ALLOWED' end,
    case when pr.risk_level = 'CRITICAL' and extract(epoch from (d.ends_at - d.starts_at)) / 3600 > pr.max_delegation_hours then 'DELEGATION_TOO_LONG' end,
    case when d.delegation_reason is null or length(trim(d.delegation_reason)) = 0 then 'MISSING_REASON' end,
    case when d.delegation_status = 'ACTIVE' and d.approved_by is null then 'ACTIVE_WITHOUT_APPROVER' end,
    case when d.delegation_status = 'ACTIVE' and now() > d.ends_at then 'EXPIRED' end
  ], null) as control_flags
from public.permission_delegations d
left join public.permission_registry pr on pr.permission_code = d.permission_code
left join public.users_profile from_user on from_user.id = d.from_user_id
left join public.roles from_role on from_role.id = from_user.role_id
left join public.users_profile to_user on to_user.id = d.to_user_id
left join public.roles to_role on to_role.id = to_user.role_id
left join public.users_profile requester on requester.id = d.requested_by
left join public.users_profile approver on approver.id = d.approved_by
left join public.users_profile revoker on revoker.id = d.revoked_by
where d.record_status = 'ACTIVE'
  and (
    public.can_read_permission_matrix()
    or d.from_user_id = auth.uid()
    or d.to_user_id = auth.uid()
    or d.requested_by = auth.uid()
    or d.approved_by = auth.uid()
  );

grant select on public.permission_delegation_status to authenticated;

create or replace view public.user_permission_matrix_status
with (security_invoker = true)
as
select
  u.id,
  u.email,
  u.full_name,
  u.status,
  u.role_id,
  r.code as role_code,
  r.name as role_name,
  u.department_id,
  d.code as department_code,
  d.name as department_name,
  u.manager_id,
  manager.full_name as manager_name,
  coalesce(role_perm.permission_count, 0)::int as role_permission_count,
  coalesce(role_perm.high_risk_permission_count, 0)::int as high_risk_permission_count,
  coalesce(role_perm.critical_permission_count, 0)::int as critical_permission_count,
  coalesce(role_perm.broad_permission_count, 0)::int as broad_permission_count,
  coalesce(segment_scope.segment_scope_count, 0)::int as segment_scope_count,
  coalesce(partner_scope.partner_scope_count, 0)::int as partner_scope_count,
  coalesce(active_delegation.active_delegation_count, 0)::int as active_delegation_count,
  coalesce(expired_delegation.expired_delegation_count, 0)::int as expired_delegation_count,
  array_remove(array[
    case when u.role_id is null then 'NO_ROLE' end,
    case when u.department_id is null then 'NO_DEPARTMENT' end,
    case when u.manager_id is null and coalesce(r.code, '') not in ('ADMIN', 'BGH') then 'NO_MANAGER' end,
    case when coalesce(role_perm.permission_count, 0) = 0 then 'NO_PERMISSION' end,
    case when coalesce(role_perm.broad_permission_count, 0) > 0 and coalesce(r.code, '') not in ('ADMIN', 'BGH') then 'HAS_BROAD_PERMISSION' end,
    case when coalesce(role_perm.critical_permission_count, 0) > 0 and coalesce(r.code, '') not in ('ADMIN', 'BGH') then 'HAS_CRITICAL_PERMISSION' end,
    case when coalesce(segment_scope.segment_scope_count, 0) = 0 and coalesce(partner_scope.partner_scope_count, 0) = 0 and coalesce(r.code, '') not in ('ADMIN', 'BGH') then 'NO_BUSINESS_SCOPE' end,
    case when coalesce(active_delegation.active_delegation_count, 0) > 0 then 'HAS_ACTIVE_DELEGATION' end,
    case when coalesce(expired_delegation.expired_delegation_count, 0) > 0 then 'HAS_EXPIRED_DELEGATION' end
  ], null) as control_flags,
  case
    when u.status <> 'ACTIVE' then 'INACTIVE'
    when u.role_id is null then 'BLOCKED'
    when u.department_id is null then 'NEEDS_FIX'
    when u.manager_id is null and coalesce(r.code, '') not in ('ADMIN', 'BGH') then 'NEEDS_FIX'
    when coalesce(role_perm.broad_permission_count, 0) > 0 and coalesce(r.code, '') not in ('ADMIN', 'BGH') then 'HIGH_RISK'
    when coalesce(role_perm.critical_permission_count, 0) > 0 and coalesce(r.code, '') not in ('ADMIN', 'BGH') then 'HIGH_RISK'
    when coalesce(segment_scope.segment_scope_count, 0) = 0 and coalesce(partner_scope.partner_scope_count, 0) = 0 and coalesce(r.code, '') not in ('ADMIN', 'BGH') then 'NEEDS_SCOPE'
    else 'READY'
  end as permission_status
from public.users_profile u
left join public.roles r on r.id = u.role_id
left join public.admission_departments d on d.id = u.department_id
left join public.users_profile manager on manager.id = u.manager_id
left join lateral (
  select
    count(*) as permission_count,
    count(*) filter (where coalesce(pr.risk_level, 'MEDIUM') = 'HIGH') as high_risk_permission_count,
    count(*) filter (where coalesce(pr.risk_level, 'MEDIUM') = 'CRITICAL') as critical_permission_count,
    count(*) filter (
      where rp.permission in (
        'system.manage',
        'users.manage',
        'leads.read_all',
        'leads.write_all',
        'master_control.manage',
        'permission_matrix.manage',
        'hou.com.read_sensitive'
      )
      or rp.permission like '%.manage'
      or rp.permission like '%.approve'
    ) as broad_permission_count
  from public.role_permissions rp
  left join public.permission_registry pr on pr.permission_code = rp.permission
  where rp.role_id = u.role_id
) role_perm on true
left join lateral (
  select count(*) as segment_scope_count
  from public.user_admission_segment_scopes s
  where s.user_id = u.id
    and s.status = 'ACTIVE'
) segment_scope on true
left join lateral (
  select count(*) as partner_scope_count
  from public.user_partner_scopes s
  where s.user_id = u.id
    and s.status = 'ACTIVE'
) partner_scope on true
left join lateral (
  select count(*) as active_delegation_count
  from public.permission_delegations pd
  where pd.to_user_id = u.id
    and pd.delegation_status = 'ACTIVE'
    and pd.record_status = 'ACTIVE'
    and now() between pd.starts_at and pd.ends_at
) active_delegation on true
left join lateral (
  select count(*) as expired_delegation_count
  from public.permission_delegations pd
  where pd.to_user_id = u.id
    and pd.delegation_status = 'ACTIVE'
    and pd.record_status = 'ACTIVE'
    and now() > pd.ends_at
) expired_delegation on true
where public.can_read_permission_matrix();

grant select on public.user_permission_matrix_status to authenticated;

create or replace view public.role_permission_delegation_summary
with (security_invoker = true)
as
select
  (select count(*)::int from public.permission_registry_status) as permission_count,
  (select count(*)::int from public.role_permission_matrix_status) as role_permission_count,
  (select count(*)::int from public.user_permission_matrix_status where status = 'ACTIVE') as user_count,
  (select count(*)::int from public.user_permission_matrix_status where permission_status = 'READY') as ready_user_count,
  (select count(*)::int from public.user_permission_matrix_status where permission_status in ('HIGH_RISK', 'BLOCKED')) as high_risk_user_count,
  (select count(*)::int from public.user_permission_matrix_status where active_delegation_count > 0) as delegated_user_count,
  (select count(*)::int from public.permission_delegation_status where effective_status = 'ACTIVE') as active_delegation_count,
  (select count(*)::int from public.permission_delegation_status where effective_status = 'EXPIRED') as expired_delegation_count,
  (select count(*)::int from public.permission_registry_status where registry_status in ('BLOCKED', 'NEEDS_FIX')) as permission_needs_fix_count;

grant select on public.role_permission_delegation_summary to authenticated;

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
) values
  (
    'PERMISSION_REGISTRY',
    'Permission Registry',
    'M01_IDENTITY_SCOPE',
    'MASTER',
    'BGH + IT_DATA',
    'Danh muc quyen co owner, risk, co duoc uy quyen hay khong, thoi han uy quyen toi da va AI policy.',
    'RESTRICTED',
    false,
    'DAT_TAM_THOI'
  ),
  (
    'PERMISSION_DELEGATIONS',
    'Permission Delegations',
    'M01_IDENTITY_SCOPE',
    'TRANSACTION',
    'BGH + TRUONG_PHONG + IT_DATA',
    'Uy quyen tam thoi theo user, quyen, ly do, thoi han, nguoi duyet, nguoi thu hoi va audit log.',
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

insert into public.heu_os_master_data_map (
  data_code,
  data_name,
  module_code,
  source_table,
  data_type,
  owner_department,
  system_of_record,
  sensitivity_level,
  ai_allowed,
  change_rule,
  control_status
) values (
  'P0_11_ROLE_PERMISSION_DELEGATION',
  'P0-11 Role, Permission & Delegation Matrix',
  'M01_IDENTITY_SCOPE',
  'permission_registry',
  'MASTER',
  'BGH + IT_DATA',
  'HEU_OS',
  'RESTRICTED',
  false,
  'Quyen phai di qua role/scope; uy quyen chi tam thoi, co ly do, nguoi duyet, han va audit.',
  'DAT_TAM_THOI'
)
on conflict (data_code) do update set
  data_name = excluded.data_name,
  module_code = excluded.module_code,
  source_table = excluded.source_table,
  data_type = excluded.data_type,
  owner_department = excluded.owner_department,
  system_of_record = excluded.system_of_record,
  sensitivity_level = excluded.sensitivity_level,
  ai_allowed = excluded.ai_allowed,
  change_rule = excluded.change_rule,
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
  'GATE_P0_11_ROLE_PERMISSION_DELEGATION',
  'P0-11 Role, Permission & Delegation Matrix',
  'DATA',
  'PERMISSION',
  'PERMISSION_REGISTRY',
  'BGH + IT_DATA',
  'Kiem tra user co role, phong ban, quan ly truc tiep, scope, quyen rong va uy quyen tam thoi.',
  'Khong mo automation/AI neu quyen va delegation chua ro ai lam, ai duyet, het han khi nao.',
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
