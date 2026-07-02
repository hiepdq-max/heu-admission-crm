-- Step 114 - P0-17 HEU organization position, permission and assignment matrix.
-- File: database/step114_organization_position_permission_matrix.sql
-- Purpose:
-- - Create standard HEU seats/positions before assigning real people.
-- - Map each position to a default role and seeded permissions.
-- - Keep real account assignment separate from role design.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Secret boundary: do not paste passwords, OTPs, invite/reset links,
-- service-role keys, raw PII, CCCD, bank data or screenshots into SQL comments,
-- logs or evidence.

begin;

insert into public.admission_departments (code, name, status)
values
  ('LEADERSHIP', 'Ban giam hieu', 'ACTIVE'),
  ('DAO_TAO', 'Phong dao tao', 'ACTIVE'),
  ('ADMISSION', 'Phong tuyen sinh', 'ACTIVE'),
  ('CTHSSV', 'Cong tac HSSV', 'ACTIVE'),
  ('ACCOUNTING', 'Ke toan', 'ACTIVE'),
  ('PHAP_CHE', 'Phap che', 'ACTIVE'),
  ('AUDIT', 'Audit', 'ACTIVE'),
  ('IT_DATA', 'IT/Data', 'ACTIVE'),
  ('KHOA', 'Khoa', 'ACTIVE'),
  ('NGAN_HAN', 'Dao tao ngan han', 'ACTIVE'),
  ('HR', 'To chuc nhan su', 'ACTIVE')
on conflict (code) do update set
  name = excluded.name,
  status = excluded.status,
  updated_at = now();

insert into public.roles (code, name, description)
values
  ('HIEU_TRUONG', 'Hieu truong', 'Final school executive approver'),
  ('PHO_HIEU_TRUONG', 'Pho hieu truong', 'Delegated school executive approver'),
  ('DAO_TAO_LEAD', 'Truong phong dao tao', 'Manage training operations and training users'),
  ('DAO_TAO', 'Chuyen vien dao tao', 'Operate training workflows in assigned scope'),
  ('CTHSSV_LEAD', 'Truong phong CTHSSV', 'Manage CTHSSV users and scopes'),
  ('ACCOUNTING_LEAD', 'Ke toan truong', 'Manage accounting users and finance scopes'),
  ('PHAP_CHE_LEAD', 'Truong phong phap che', 'Manage legal review and legal gates'),
  ('LEGAL', 'Nhan su phap che', 'Operate legal review workflows in assigned scope'),
  ('AUDIT_HEAD', 'Truong bo phan audit', 'Manage audit review and control checks'),
  ('IT_DATA_HEAD', 'Truong bo phan IT/Data', 'Manage system, data and access operations'),
  ('KHOA_LEAD', 'Truong khoa', 'Manage faculty operations and faculty users'),
  ('KHOA', 'Nhan su khoa', 'Operate faculty workflows in assigned scope'),
  ('NGAN_HAN_LEAD', 'Truong bo phan ngan han', 'Manage short-course operations and users'),
  ('NGAN_HAN', 'Nhan su ngan han', 'Operate short-course workflows in assigned scope'),
  ('HR_LEAD', 'Truong phong to chuc nhan su', 'Manage HR and organization assignments'),
  ('HR', 'Nhan su to chuc nhan su', 'Operate HR workflows in assigned scope')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('reports.read_all'),
    ('audit.read'),
    ('master_control.read'),
    ('master_control.approve'),
    ('workflow_request.read'),
    ('workflow_request.approve'),
    ('permission_matrix.read')
) as p(permission)
where r.code = 'HIEU_TRUONG'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('reports.read_all'),
    ('audit.read'),
    ('master_control.read'),
    ('master_control.check'),
    ('workflow_request.read'),
    ('workflow_request.approve'),
    ('permission_matrix.read')
) as p(permission)
where r.code = 'PHO_HIEU_TRUONG'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('users.manage_department'),
    ('scope.manage_department'),
    ('reports.read_team'),
    ('workflow_request.read'),
    ('workflow_request.create'),
    ('workflow_request.check')
) as p(permission)
where r.code in (
  'DAO_TAO_LEAD',
  'ADMISSION_HEAD',
  'CTHSSV_LEAD',
  'ACCOUNTING_LEAD',
  'PHAP_CHE_LEAD',
  'AUDIT_HEAD',
  'IT_DATA_HEAD',
  'KHOA_LEAD',
  'NGAN_HAN_LEAD',
  'HR_LEAD'
)
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('reports.read_scope'),
    ('workflow_request.read'),
    ('workflow_request.create')
) as p(permission)
where r.code in ('DAO_TAO', 'KHOA', 'NGAN_HAN', 'HR', 'LEGAL', 'AUDIT', 'IT_DATA')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('admission_config.read'),
    ('documents.manage'),
    ('reports.read_team')
) as p(permission)
where r.code in ('DAO_TAO_LEAD', 'DAO_TAO')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('master_control.read'),
    ('master_control.check'),
    ('audit.read')
) as p(permission)
where r.code in ('PHAP_CHE_LEAD', 'LEGAL', 'AUDIT_HEAD', 'AUDIT')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('settings.manage'),
    ('users.manage'),
    ('users.create'),
    ('permission_matrix.read'),
    ('permission_matrix.manage')
) as p(permission)
where r.code in ('IT_DATA_HEAD', 'IT_DATA')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('short_course.read'),
    ('short_course.class.read'),
    ('short_course.student.read'),
    ('short_course.attendance.read')
) as p(permission)
where r.code in ('NGAN_HAN_LEAD', 'NGAN_HAN')
on conflict (role_id, permission) do nothing;

create table if not exists public.heu_org_positions (
  id uuid primary key default gen_random_uuid(),
  position_code text not null unique,
  position_name text not null,
  position_group text not null,
  department_code text not null,
  default_role_code text not null,
  reports_to_position_code text,
  seat_order int not null default 0,
  required_assignment boolean not null default true,
  control_status text not null default 'DRAFT',
  status public.record_status not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.heu_org_positions
  add column if not exists required_assignment boolean not null default true,
  add column if not exists control_status text not null default 'DRAFT',
  add column if not exists notes text;

alter table public.heu_org_positions enable row level security;

drop policy if exists "heu_org_positions_select_authenticated" on public.heu_org_positions;
create policy "heu_org_positions_select_authenticated"
on public.heu_org_positions for select
to authenticated
using (public.can_read_permission_matrix());

drop policy if exists "heu_org_positions_admin_write" on public.heu_org_positions;
create policy "heu_org_positions_admin_write"
on public.heu_org_positions for all
to authenticated
using (public.can_manage_permission_matrix())
with check (public.can_manage_permission_matrix());

insert into public.heu_org_positions (
  position_code,
  position_name,
  position_group,
  department_code,
  default_role_code,
  reports_to_position_code,
  seat_order,
  required_assignment,
  control_status,
  notes
)
values
  ('HT', 'Hieu truong', 'BGH', 'LEADERSHIP', 'HIEU_TRUONG', null, 10, true, 'DRAFT', 'Assign real principal email after owner approval.'),
  ('PHT_01', 'Pho hieu truong 01', 'BGH', 'LEADERSHIP', 'PHO_HIEU_TRUONG', 'HT', 20, true, 'DRAFT', 'Delegated vice-principal seat.'),
  ('PHT_02', 'Pho hieu truong 02', 'BGH', 'LEADERSHIP', 'PHO_HIEU_TRUONG', 'HT', 30, false, 'DRAFT', 'Optional delegated vice-principal seat.'),
  ('PHT_DAO_TAO', 'Pho hieu truong phu trach dao tao', 'BGH', 'LEADERSHIP', 'PHO_HIEU_TRUONG', 'HT', 40, false, 'DRAFT', 'Training executive lane.'),
  ('PHT_TAI_CHINH', 'Pho hieu truong phu trach tai chinh', 'BGH', 'LEADERSHIP', 'PHO_HIEU_TRUONG', 'HT', 50, false, 'DRAFT', 'Finance executive lane.'),
  ('PHT_VAN_HANH', 'Pho hieu truong phu trach van hanh', 'BGH', 'LEADERSHIP', 'PHO_HIEU_TRUONG', 'HT', 60, false, 'DRAFT', 'Operations executive lane.'),

  ('DAO_TAO_HEAD', 'Truong phong dao tao', 'PHONG_DAO_TAO', 'DAO_TAO', 'DAO_TAO_LEAD', 'PHT_DAO_TAO', 100, true, 'DRAFT', 'Department head must be assigned before staff rollout.'),
  ('DAO_TAO_01', 'Dao tao 01', 'PHONG_DAO_TAO', 'DAO_TAO', 'DAO_TAO', 'DAO_TAO_HEAD', 101, false, 'DRAFT', null),
  ('DAO_TAO_02', 'Dao tao 02', 'PHONG_DAO_TAO', 'DAO_TAO', 'DAO_TAO', 'DAO_TAO_HEAD', 102, false, 'DRAFT', null),
  ('DAO_TAO_03', 'Dao tao 03', 'PHONG_DAO_TAO', 'DAO_TAO', 'DAO_TAO', 'DAO_TAO_HEAD', 103, false, 'DRAFT', null),
  ('DAO_TAO_04', 'Dao tao 04', 'PHONG_DAO_TAO', 'DAO_TAO', 'DAO_TAO', 'DAO_TAO_HEAD', 104, false, 'DRAFT', null),
  ('DAO_TAO_05', 'Dao tao 05', 'PHONG_DAO_TAO', 'DAO_TAO', 'DAO_TAO', 'DAO_TAO_HEAD', 105, false, 'DRAFT', null),

  ('TUYEN_SINH_HEAD', 'Truong phong tuyen sinh', 'PHONG_TUYEN_SINH', 'ADMISSION', 'ADMISSION_HEAD', 'PHT_VAN_HANH', 200, true, 'DRAFT', 'Existing ADMISSION_HEAD role.'),
  ('TUYEN_SINH_01', 'Tuyen sinh 01', 'PHONG_TUYEN_SINH', 'ADMISSION', 'COUNSELOR', 'TUYEN_SINH_HEAD', 201, false, 'DRAFT', null),
  ('TUYEN_SINH_02', 'Tuyen sinh 02', 'PHONG_TUYEN_SINH', 'ADMISSION', 'COUNSELOR', 'TUYEN_SINH_HEAD', 202, false, 'DRAFT', null),
  ('TUYEN_SINH_03', 'Tuyen sinh 03', 'PHONG_TUYEN_SINH', 'ADMISSION', 'COUNSELOR', 'TUYEN_SINH_HEAD', 203, false, 'DRAFT', null),
  ('TUYEN_SINH_04', 'Tuyen sinh 04', 'PHONG_TUYEN_SINH', 'ADMISSION', 'COUNSELOR', 'TUYEN_SINH_HEAD', 204, false, 'DRAFT', null),
  ('TUYEN_SINH_05', 'Tuyen sinh 05', 'PHONG_TUYEN_SINH', 'ADMISSION', 'COUNSELOR', 'TUYEN_SINH_HEAD', 205, false, 'DRAFT', null),

  ('CTHSSV_HEAD', 'Truong phong CTHSSV', 'PHONG_CTHSSV', 'CTHSSV', 'CTHSSV_LEAD', 'PHT_VAN_HANH', 300, true, 'DRAFT', null),
  ('CTHSSV_01', 'CTHSSV 01', 'PHONG_CTHSSV', 'CTHSSV', 'CTHSSV', 'CTHSSV_HEAD', 301, false, 'DRAFT', null),
  ('CTHSSV_02', 'CTHSSV 02', 'PHONG_CTHSSV', 'CTHSSV', 'CTHSSV', 'CTHSSV_HEAD', 302, false, 'DRAFT', null),
  ('CTHSSV_03', 'CTHSSV 03', 'PHONG_CTHSSV', 'CTHSSV', 'CTHSSV', 'CTHSSV_HEAD', 303, false, 'DRAFT', null),
  ('CTHSSV_04', 'CTHSSV 04', 'PHONG_CTHSSV', 'CTHSSV', 'CTHSSV', 'CTHSSV_HEAD', 304, false, 'DRAFT', null),
  ('CTHSSV_05', 'CTHSSV 05', 'PHONG_CTHSSV', 'CTHSSV', 'CTHSSV', 'CTHSSV_HEAD', 305, false, 'DRAFT', null),

  ('KE_TOAN_TRUONG', 'Ke toan truong', 'PHONG_KHTC', 'ACCOUNTING', 'ACCOUNTING_LEAD', 'PHT_TAI_CHINH', 400, true, 'DRAFT', null),
  ('KE_TOAN_01', 'Ke toan 01', 'PHONG_KHTC', 'ACCOUNTING', 'ACCOUNTING', 'KE_TOAN_TRUONG', 401, false, 'DRAFT', null),
  ('KE_TOAN_02', 'Ke toan 02', 'PHONG_KHTC', 'ACCOUNTING', 'ACCOUNTING', 'KE_TOAN_TRUONG', 402, false, 'DRAFT', null),
  ('KE_TOAN_03', 'Ke toan 03', 'PHONG_KHTC', 'ACCOUNTING', 'ACCOUNTING', 'KE_TOAN_TRUONG', 403, false, 'DRAFT', null),
  ('KE_TOAN_04', 'Ke toan 04', 'PHONG_KHTC', 'ACCOUNTING', 'ACCOUNTING', 'KE_TOAN_TRUONG', 404, false, 'DRAFT', null),
  ('KE_TOAN_05', 'Ke toan 05', 'PHONG_KHTC', 'ACCOUNTING', 'ACCOUNTING', 'KE_TOAN_TRUONG', 405, false, 'DRAFT', null),

  ('PHAP_CHE_HEAD', 'Truong phong phap che', 'PHAP_CHE', 'PHAP_CHE', 'PHAP_CHE_LEAD', 'HT', 500, true, 'DRAFT', null),
  ('PHAP_CHE_01', 'Phap che 01', 'PHAP_CHE', 'PHAP_CHE', 'LEGAL', 'PHAP_CHE_HEAD', 501, false, 'DRAFT', null),
  ('PHAP_CHE_02', 'Phap che 02', 'PHAP_CHE', 'PHAP_CHE', 'LEGAL', 'PHAP_CHE_HEAD', 502, false, 'DRAFT', null),
  ('PHAP_CHE_03', 'Phap che 03', 'PHAP_CHE', 'PHAP_CHE', 'LEGAL', 'PHAP_CHE_HEAD', 503, false, 'DRAFT', null),

  ('AUDIT_HEAD', 'Truong bo phan audit', 'AUDIT', 'AUDIT', 'AUDIT_HEAD', 'HT', 600, true, 'DRAFT', null),
  ('AUDIT_01', 'Audit 01', 'AUDIT', 'AUDIT', 'AUDIT', 'AUDIT_HEAD', 601, false, 'DRAFT', null),
  ('AUDIT_02', 'Audit 02', 'AUDIT', 'AUDIT', 'AUDIT', 'AUDIT_HEAD', 602, false, 'DRAFT', null),
  ('AUDIT_03', 'Audit 03', 'AUDIT', 'AUDIT', 'AUDIT', 'AUDIT_HEAD', 603, false, 'DRAFT', null),

  ('IT_DATA_HEAD', 'Truong bo phan IT/Data', 'IT_DATA', 'IT_DATA', 'IT_DATA_HEAD', 'HT', 700, true, 'DRAFT', null),
  ('IT_DATA_01', 'IT/Data 01', 'IT_DATA', 'IT_DATA', 'IT_DATA', 'IT_DATA_HEAD', 701, false, 'DRAFT', null),
  ('IT_DATA_02', 'IT/Data 02', 'IT_DATA', 'IT_DATA', 'IT_DATA', 'IT_DATA_HEAD', 702, false, 'DRAFT', null),
  ('IT_DATA_03', 'IT/Data 03', 'IT_DATA', 'IT_DATA', 'IT_DATA', 'IT_DATA_HEAD', 703, false, 'DRAFT', null),

  ('KHOA_HEAD', 'Truong khoa', 'KHOA', 'KHOA', 'KHOA_LEAD', 'PHT_DAO_TAO', 800, true, 'DRAFT', null),
  ('KHOA_01', 'Khoa 01', 'KHOA', 'KHOA', 'KHOA', 'KHOA_HEAD', 801, false, 'DRAFT', null),
  ('KHOA_02', 'Khoa 02', 'KHOA', 'KHOA', 'KHOA', 'KHOA_HEAD', 802, false, 'DRAFT', null),
  ('KHOA_03', 'Khoa 03', 'KHOA', 'KHOA', 'KHOA', 'KHOA_HEAD', 803, false, 'DRAFT', null),
  ('KHOA_04', 'Khoa 04', 'KHOA', 'KHOA', 'KHOA', 'KHOA_HEAD', 804, false, 'DRAFT', null),
  ('KHOA_05', 'Khoa 05', 'KHOA', 'KHOA', 'KHOA', 'KHOA_HEAD', 805, false, 'DRAFT', null),
  ('KHOA_06', 'Khoa 06', 'KHOA', 'KHOA', 'KHOA', 'KHOA_HEAD', 806, false, 'DRAFT', null),
  ('KHOA_07', 'Khoa 07', 'KHOA', 'KHOA', 'KHOA', 'KHOA_HEAD', 807, false, 'DRAFT', null),
  ('KHOA_08', 'Khoa 08', 'KHOA', 'KHOA', 'KHOA', 'KHOA_HEAD', 808, false, 'DRAFT', null),
  ('KHOA_09', 'Khoa 09', 'KHOA', 'KHOA', 'KHOA', 'KHOA_HEAD', 809, false, 'DRAFT', null),
  ('KHOA_10', 'Khoa 10', 'KHOA', 'KHOA', 'KHOA', 'KHOA_HEAD', 810, false, 'DRAFT', null),

  ('NGAN_HAN_HEAD', 'Truong bo phan dao tao ngan han', 'DAO_TAO_NGAN_HAN', 'NGAN_HAN', 'NGAN_HAN_LEAD', 'PHT_DAO_TAO', 900, true, 'DRAFT', null),
  ('NGAN_HAN_01', 'Dao tao ngan han 01', 'DAO_TAO_NGAN_HAN', 'NGAN_HAN', 'NGAN_HAN', 'NGAN_HAN_HEAD', 901, false, 'DRAFT', null),
  ('NGAN_HAN_02', 'Dao tao ngan han 02', 'DAO_TAO_NGAN_HAN', 'NGAN_HAN', 'NGAN_HAN', 'NGAN_HAN_HEAD', 902, false, 'DRAFT', null),
  ('NGAN_HAN_03', 'Dao tao ngan han 03', 'DAO_TAO_NGAN_HAN', 'NGAN_HAN', 'NGAN_HAN', 'NGAN_HAN_HEAD', 903, false, 'DRAFT', null),
  ('NGAN_HAN_04', 'Dao tao ngan han 04', 'DAO_TAO_NGAN_HAN', 'NGAN_HAN', 'NGAN_HAN', 'NGAN_HAN_HEAD', 904, false, 'DRAFT', null),
  ('NGAN_HAN_05', 'Dao tao ngan han 05', 'DAO_TAO_NGAN_HAN', 'NGAN_HAN', 'NGAN_HAN', 'NGAN_HAN_HEAD', 905, false, 'DRAFT', null),

  ('HR_HEAD', 'Truong phong to chuc nhan su', 'TO_CHUC_NHAN_SU', 'HR', 'HR_LEAD', 'PHT_VAN_HANH', 1000, true, 'DRAFT', null),
  ('HR_01', 'To chuc nhan su 01', 'TO_CHUC_NHAN_SU', 'HR', 'HR', 'HR_HEAD', 1001, false, 'DRAFT', null),
  ('HR_02', 'To chuc nhan su 02', 'TO_CHUC_NHAN_SU', 'HR', 'HR', 'HR_HEAD', 1002, false, 'DRAFT', null),
  ('HR_03', 'To chuc nhan su 03', 'TO_CHUC_NHAN_SU', 'HR', 'HR', 'HR_HEAD', 1003, false, 'DRAFT', null)
on conflict (position_code) do update set
  position_name = excluded.position_name,
  position_group = excluded.position_group,
  department_code = excluded.department_code,
  default_role_code = excluded.default_role_code,
  reports_to_position_code = excluded.reports_to_position_code,
  seat_order = excluded.seat_order,
  required_assignment = excluded.required_assignment,
  control_status = excluded.control_status,
  status = 'ACTIVE',
  notes = coalesce(excluded.notes, heu_org_positions.notes),
  updated_at = now();

create table if not exists public.heu_position_permission_matrix (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references public.heu_org_positions(id) on delete restrict,
  permission text not null,
  permission_source text not null default 'DEFAULT_ROLE',
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (position_id, permission)
);

alter table public.heu_position_permission_matrix enable row level security;

drop policy if exists "heu_position_permission_matrix_select_authenticated" on public.heu_position_permission_matrix;
create policy "heu_position_permission_matrix_select_authenticated"
on public.heu_position_permission_matrix for select
to authenticated
using (public.can_read_permission_matrix());

drop policy if exists "heu_position_permission_matrix_admin_write" on public.heu_position_permission_matrix;
create policy "heu_position_permission_matrix_admin_write"
on public.heu_position_permission_matrix for all
to authenticated
using (public.can_manage_permission_matrix())
with check (public.can_manage_permission_matrix());

insert into public.heu_position_permission_matrix (
  position_id,
  permission,
  permission_source,
  status
)
select
  p.id,
  rp.permission,
  'DEFAULT_ROLE',
  'ACTIVE'
from public.heu_org_positions p
join public.roles r on r.code = p.default_role_code
join public.role_permissions rp on rp.role_id = r.id
on conflict (position_id, permission) do update set
  permission_source = excluded.permission_source,
  status = 'ACTIVE',
  updated_at = now();

create table if not exists public.heu_position_assignments (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references public.heu_org_positions(id) on delete restrict,
  user_id uuid references public.users_profile(id) on delete set null,
  assignment_status text not null default 'PENDING_USER',
  assignment_note text,
  assigned_by uuid references public.users_profile(id),
  assigned_at timestamptz not null default now(),
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_position_assignment_status_valid check (
    assignment_status in ('PENDING_USER', 'ACTIVE_ASSIGNED', 'REVOKED', 'BLOCKED')
  )
);

create unique index if not exists idx_heu_position_assignments_active_position
on public.heu_position_assignments(position_id)
where status = 'ACTIVE';

create unique index if not exists idx_heu_position_assignments_active_user
on public.heu_position_assignments(user_id)
where status = 'ACTIVE' and user_id is not null;

alter table public.heu_position_assignments enable row level security;

drop policy if exists "heu_position_assignments_select_authenticated" on public.heu_position_assignments;
create policy "heu_position_assignments_select_authenticated"
on public.heu_position_assignments for select
to authenticated
using (
  public.can_read_permission_matrix()
  or public.has_permission('users.manage')
);

drop policy if exists "heu_position_assignments_admin_write" on public.heu_position_assignments;
create policy "heu_position_assignments_admin_write"
on public.heu_position_assignments for all
to authenticated
using (public.can_manage_permission_matrix())
with check (public.can_manage_permission_matrix());

create or replace function public.assign_heu_position_by_email(
  target_position_code text,
  target_email text,
  target_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_position_id uuid;
  target_user_id uuid;
  target_role_id uuid;
  target_department_id uuid;
  manager_user_id uuid;
  acting_user_id uuid := auth.uid();
  assignment_id uuid;
begin
  if not public.can_manage_permission_matrix() then
    raise exception 'Only ADMIN or permission_matrix.manage can assign HEU positions';
  end if;

  select
    p.id,
    r.id,
    d.id
  into
    target_position_id,
    target_role_id,
    target_department_id
  from public.heu_org_positions p
  left join public.roles r on r.code = p.default_role_code
  left join public.admission_departments d on d.code = p.department_code
  where p.position_code = upper(trim(target_position_code))
    and p.status = 'ACTIVE'
  limit 1;

  if target_position_id is null then
    raise exception 'HEU position not found';
  end if;

  if target_role_id is null then
    raise exception 'Default role for HEU position is missing';
  end if;

  if target_department_id is null then
    raise exception 'Department for HEU position is missing';
  end if;

  select manager_assignment.user_id
  into manager_user_id
  from public.heu_org_positions target_position
  join public.heu_org_positions manager_position
    on manager_position.position_code = target_position.reports_to_position_code
  join public.heu_position_assignments manager_assignment
    on manager_assignment.position_id = manager_position.id
    and manager_assignment.status = 'ACTIVE'
    and manager_assignment.assignment_status = 'ACTIVE_ASSIGNED'
  where target_position.id = target_position_id
    and target_position.status = 'ACTIVE'
  limit 1;

  select id
  into target_user_id
  from public.users_profile
  where lower(email) = lower(trim(target_email))
    and status = 'ACTIVE'
  limit 1;

  if target_user_id is null then
    raise exception 'Active users_profile not found for email. Create/link Auth user before assigning position.';
  end if;

  update public.heu_position_assignments
  set status = 'INACTIVE',
      assignment_status = 'REVOKED',
      updated_at = now()
  where position_id = target_position_id
    and status = 'ACTIVE';

  insert into public.heu_position_assignments (
    position_id,
    user_id,
    assignment_status,
    assignment_note,
    assigned_by,
    status
  )
  values (
    target_position_id,
    target_user_id,
    'ACTIVE_ASSIGNED',
    nullif(trim(coalesce(target_note, '')), ''),
    acting_user_id,
    'ACTIVE'
  )
  returning id into assignment_id;

  update public.users_profile
  set role_id = target_role_id,
      department_id = target_department_id,
      manager_id = case
        when manager_user_id is not null and manager_user_id <> target_user_id
          then manager_user_id
        else null
      end,
      status = 'ACTIVE',
      updated_at = now()
  where id = target_user_id;

  return assignment_id;
end;
$$;

grant execute on function public.assign_heu_position_by_email(text, text, text) to authenticated;

create or replace view public.heu_position_matrix_status
with (security_invoker = true)
as
select
  p.id,
  p.position_code,
  p.position_name,
  p.position_group,
  p.department_code,
  d.name as department_name,
  p.default_role_code,
  r.name as default_role_name,
  p.reports_to_position_code,
  manager.position_name as reports_to_position_name,
  p.seat_order,
  p.required_assignment,
  p.control_status,
  p.status,
  count(distinct ppm.permission) filter (where ppm.status = 'ACTIVE')::int as permission_count,
  assignment.id as active_assignment_id,
  assignee.full_name as assigned_full_name,
  assignee.email as assigned_email,
  case
    when assignment.id is not null then 'ASSIGNED'
    when p.required_assignment then 'NEEDS_USER'
    else 'READY_EMPTY'
  end as assignment_state
from public.heu_org_positions p
left join public.admission_departments d on d.code = p.department_code
left join public.roles r on r.code = p.default_role_code
left join public.heu_org_positions manager
  on manager.position_code = p.reports_to_position_code
left join public.heu_position_permission_matrix ppm
  on ppm.position_id = p.id
left join public.heu_position_assignments assignment
  on assignment.position_id = p.id
  and assignment.status = 'ACTIVE'
left join public.users_profile assignee
  on assignee.id = assignment.user_id
group by
  p.id,
  p.position_code,
  p.position_name,
  p.position_group,
  p.department_code,
  d.name,
  p.default_role_code,
  r.name,
  p.reports_to_position_code,
  manager.position_name,
  p.seat_order,
  p.required_assignment,
  p.control_status,
  p.status,
  assignment.id,
  assignee.full_name,
  assignee.email;

grant select on public.heu_org_positions to authenticated;
grant select on public.heu_position_permission_matrix to authenticated;
grant select on public.heu_position_assignments to authenticated;
grant select on public.heu_position_matrix_status to authenticated;
grant insert, update on public.heu_position_assignments to authenticated;

commit;
