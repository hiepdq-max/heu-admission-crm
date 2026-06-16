-- Step 56 - P0-17 Dynamic Admission Configuration.
-- Run after step55_process_ownership_matrix.sql.
-- Purpose: configure admission objects dynamically: allowed programs/majors,
-- lead form fields, required/optional conditions, evidence and blocking rules.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('admission_config.read'),
    ('admission_config.manage')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA', 'ADMISSION_HEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('admission_config.read')
) as p(permission)
where r.code in ('BGH', 'TEAM_LEAD', 'LEGAL', 'AUDIT', 'CTHSSV_LEAD', 'ACCOUNTING_LEAD', 'HOU_OPERATOR')
on conflict (role_id, permission) do nothing;

create table if not exists public.admission_form_field_configs (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid not null references public.admission_segments(id) on delete cascade,
  field_key text not null,
  field_label text not null,
  field_group text not null default 'LEAD',
  field_type text not null default 'TEXT',
  is_visible boolean not null default true,
  is_required boolean not null default false,
  option_source text not null default 'NONE',
  placeholder text,
  help_text text,
  validation_rule text,
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admission_form_field_configs_unique unique (segment_id, field_key),
  constraint admission_form_field_configs_type_valid check (
    field_type in (
      'TEXT',
      'TEXTAREA',
      'PHONE',
      'EMAIL',
      'DATE',
      'DATETIME',
      'SELECT',
      'MULTI_SELECT',
      'NUMBER',
      'MONEY',
      'CHECKBOX',
      'FILE_URL',
      'PARTNER',
      'PROGRAM',
      'MAJOR',
      'LOCATION',
      'HOU_PROGRAM',
      'HOU_MAJOR',
      'HOU_LOCATION'
    )
  ),
  constraint admission_form_field_configs_source_valid check (
    option_source in (
      'NONE',
      'STATIC',
      'LEAD_SOURCE',
      'PARTNER',
      'PROGRAM_BY_SEGMENT',
      'MAJOR_BY_PROGRAM',
      'HOU_PROGRAM',
      'HOU_MAJOR',
      'HOU_LOCATION',
      'USER',
      'CAMPAIGN'
    )
  )
);

create table if not exists public.admission_condition_rule_configs (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid not null references public.admission_segments(id) on delete cascade,
  condition_code text not null,
  condition_name text not null,
  condition_group text not null default 'ADMISSION',
  is_required boolean not null default false,
  blocking_level text not null default 'WARN',
  evidence_required boolean not null default false,
  owner_department text,
  checker_role text,
  approver_role text,
  rule_note text,
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admission_condition_rule_configs_unique unique (segment_id, condition_code),
  constraint admission_condition_rule_configs_group_valid check (
    condition_group in ('ADMISSION', 'DOCUMENT', 'ENROLLMENT', 'HANDOVER', 'FINANCE', 'COM', 'HOU', 'CUSTOM')
  ),
  constraint admission_condition_rule_configs_blocking_valid check (
    blocking_level in ('INFO', 'WARN', 'BLOCK')
  )
);

create index if not exists idx_admission_form_field_configs_segment
on public.admission_form_field_configs(segment_id, sort_order)
where status = 'ACTIVE';

create index if not exists idx_admission_condition_rule_configs_segment
on public.admission_condition_rule_configs(segment_id, condition_group, sort_order)
where status = 'ACTIVE';

alter table public.admission_form_field_configs enable row level security;
alter table public.admission_condition_rule_configs enable row level security;

create or replace function public.can_read_admission_dynamic_config()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('admission_config.read')
    or public.has_permission('admission_config.manage')
    or public.has_permission('settings.manage')
    or public.can_read_master_control()
$$;

create or replace function public.can_manage_admission_dynamic_config()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('admission_config.manage')
    or public.has_permission('settings.manage')
    or public.can_manage_master_control()
$$;

grant execute on function public.can_read_admission_dynamic_config() to authenticated;
grant execute on function public.can_manage_admission_dynamic_config() to authenticated;

drop policy if exists "admission_form_field_configs_select"
on public.admission_form_field_configs;
create policy "admission_form_field_configs_select"
on public.admission_form_field_configs for select
to authenticated
using (public.can_read_admission_dynamic_config());

drop policy if exists "admission_form_field_configs_manage"
on public.admission_form_field_configs;
create policy "admission_form_field_configs_manage"
on public.admission_form_field_configs for all
to authenticated
using (public.can_manage_admission_dynamic_config())
with check (public.can_manage_admission_dynamic_config());

drop policy if exists "admission_condition_rule_configs_select"
on public.admission_condition_rule_configs;
create policy "admission_condition_rule_configs_select"
on public.admission_condition_rule_configs for select
to authenticated
using (public.can_read_admission_dynamic_config());

drop policy if exists "admission_condition_rule_configs_manage"
on public.admission_condition_rule_configs;
create policy "admission_condition_rule_configs_manage"
on public.admission_condition_rule_configs for all
to authenticated
using (public.can_manage_admission_dynamic_config())
with check (public.can_manage_admission_dynamic_config());

drop policy if exists "admission_segment_program_rules_manage_settings"
on public.admission_segment_program_rules;
create policy "admission_segment_program_rules_manage_settings"
on public.admission_segment_program_rules for all
to authenticated
using (public.can_manage_admission_dynamic_config())
with check (public.can_manage_admission_dynamic_config());

drop trigger if exists trg_admission_form_field_configs_updated_at
on public.admission_form_field_configs;
create trigger trg_admission_form_field_configs_updated_at
before update on public.admission_form_field_configs
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_condition_rule_configs_updated_at
on public.admission_condition_rule_configs;
create trigger trg_admission_condition_rule_configs_updated_at
before update on public.admission_condition_rule_configs
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_form_field_configs_audit
on public.admission_form_field_configs;
create trigger trg_admission_form_field_configs_audit
after insert or update or delete on public.admission_form_field_configs
for each row execute function public.write_audit_log();

drop trigger if exists trg_admission_condition_rule_configs_audit
on public.admission_condition_rule_configs;
create trigger trg_admission_condition_rule_configs_audit
after insert or update or delete on public.admission_condition_rule_configs
for each row execute function public.write_audit_log();

create or replace view public.admission_segment_program_rule_status
with (security_invoker = true)
as
select
  r.id,
  r.segment_id,
  s.segment_code,
  s.segment_name,
  s.program_group,
  r.program_id,
  p.program_code,
  p.program_name,
  r.major_id,
  m.major_code,
  m.major_name,
  r.is_default,
  r.is_required,
  r.sort_order,
  r.note,
  r.status
from public.admission_segment_program_rules r
join public.admission_segments s on s.id = r.segment_id
join public.admission_programs p on p.id = r.program_id
left join public.admission_majors m on m.id = r.major_id
where public.can_read_admission_dynamic_config();

grant select on public.admission_segment_program_rule_status to authenticated;

create or replace view public.admission_form_field_config_status
with (security_invoker = true)
as
select
  f.id,
  f.segment_id,
  s.segment_code,
  s.segment_name,
  f.field_key,
  f.field_label,
  f.field_group,
  f.field_type,
  f.is_visible,
  f.is_required,
  f.option_source,
  f.placeholder,
  f.help_text,
  f.validation_rule,
  f.sort_order,
  f.status,
  array_remove(array[
    case when f.is_visible and (f.field_label is null or length(trim(f.field_label)) = 0) then 'MISSING_LABEL' end,
    case when f.is_required and f.is_visible is false then 'REQUIRED_BUT_HIDDEN' end,
    case when f.field_type in ('SELECT', 'MULTI_SELECT', 'PARTNER', 'PROGRAM', 'MAJOR', 'LOCATION') and f.option_source = 'NONE' then 'MISSING_OPTION_SOURCE' end,
    case when f.field_key in ('student_name', 'phone') and f.is_required is false then 'CORE_FIELD_NOT_REQUIRED' end
  ], null) as control_flags,
  case
    when f.is_required and f.is_visible is false then 'BLOCKED'
    when f.field_type in ('SELECT', 'MULTI_SELECT', 'PARTNER', 'PROGRAM', 'MAJOR', 'LOCATION') and f.option_source = 'NONE' then 'NEEDS_FIX'
    when f.status = 'ACTIVE' then 'READY'
    else 'INACTIVE'
  end as field_status
from public.admission_form_field_configs f
join public.admission_segments s on s.id = f.segment_id
where public.can_read_admission_dynamic_config();

grant select on public.admission_form_field_config_status to authenticated;

create or replace view public.admission_condition_rule_config_status
with (security_invoker = true)
as
select
  c.id,
  c.segment_id,
  s.segment_code,
  s.segment_name,
  c.condition_code,
  c.condition_name,
  c.condition_group,
  c.is_required,
  c.blocking_level,
  c.evidence_required,
  c.owner_department,
  c.checker_role,
  c.approver_role,
  c.rule_note,
  c.sort_order,
  c.status,
  array_remove(array[
    case when c.is_required and c.blocking_level <> 'BLOCK' then 'REQUIRED_NOT_BLOCKING' end,
    case when c.is_required and (c.owner_department is null or length(trim(c.owner_department)) = 0) then 'MISSING_OWNER' end,
    case when c.evidence_required and (c.rule_note is null or length(trim(c.rule_note)) = 0) then 'MISSING_EVIDENCE_NOTE' end,
    case when c.blocking_level = 'BLOCK' and (c.approver_role is null or length(trim(c.approver_role)) = 0) then 'BLOCKING_MISSING_APPROVER' end
  ], null) as control_flags,
  case
    when c.blocking_level = 'BLOCK' and (c.approver_role is null or length(trim(c.approver_role)) = 0) then 'BLOCKED'
    when c.is_required and c.blocking_level <> 'BLOCK' then 'NEEDS_FIX'
    when c.is_required and (c.owner_department is null or length(trim(c.owner_department)) = 0) then 'NEEDS_FIX'
    when c.status = 'ACTIVE' then 'READY'
    else 'INACTIVE'
  end as rule_status
from public.admission_condition_rule_configs c
join public.admission_segments s on s.id = c.segment_id
where public.can_read_admission_dynamic_config();

grant select on public.admission_condition_rule_config_status to authenticated;

create or replace view public.admission_dynamic_config_status
with (security_invoker = true)
as
select
  s.id as segment_id,
  s.segment_code,
  s.segment_name,
  s.program_group,
  s.owner_department,
  coalesce(program_stats.program_rule_count, 0)::int as program_rule_count,
  coalesce(program_stats.program_count, 0)::int as program_count,
  coalesce(program_stats.major_rule_count, 0)::int as major_rule_count,
  coalesce(field_stats.field_count, 0)::int as field_count,
  coalesce(field_stats.visible_field_count, 0)::int as visible_field_count,
  coalesce(field_stats.required_field_count, 0)::int as required_field_count,
  coalesce(condition_stats.condition_count, 0)::int as condition_count,
  coalesce(condition_stats.required_condition_count, 0)::int as required_condition_count,
  array_remove(array[
    case when coalesce(program_stats.program_rule_count, 0) = 0 then 'NO_PROGRAM_RULES' end,
    case when coalesce(field_stats.visible_field_count, 0) = 0 then 'NO_VISIBLE_FIELDS' end,
    case when not coalesce(field_stats.has_student_name, false) then 'NO_STUDENT_NAME_FIELD' end,
    case when not coalesce(field_stats.has_phone, false) then 'NO_PHONE_FIELD' end,
    case when coalesce(condition_stats.required_condition_count, 0) = 0 then 'NO_REQUIRED_CONDITIONS' end,
    case when s.segment_code = 'UNIVERSITY_TRANSFER_HOU' and not coalesce(condition_stats.has_hou_system, false) then 'HOU_MISSING_SYSTEM_CONDITION' end,
    case when s.segment_code like 'TC9_%' and not coalesce(condition_stats.has_document_condition, false) then 'TC9_MISSING_DOCUMENT_CONDITION' end
  ], null) as control_flags,
  case
    when coalesce(program_stats.program_rule_count, 0) = 0 then 'BLOCKED'
    when coalesce(field_stats.visible_field_count, 0) = 0 then 'BLOCKED'
    when not coalesce(field_stats.has_student_name, false) then 'NEEDS_FIX'
    when not coalesce(field_stats.has_phone, false) then 'NEEDS_FIX'
    when coalesce(condition_stats.required_condition_count, 0) = 0 then 'NEEDS_FIX'
    when s.segment_code = 'UNIVERSITY_TRANSFER_HOU' and not coalesce(condition_stats.has_hou_system, false) then 'NEEDS_FIX'
    else 'READY'
  end as config_status
from public.admission_segments s
left join lateral (
  select
    count(*) as program_rule_count,
    count(distinct r.program_id) as program_count,
    count(*) filter (where r.major_id is not null) as major_rule_count
  from public.admission_segment_program_rules r
  where r.segment_id = s.id
    and r.status = 'ACTIVE'
) program_stats on true
left join lateral (
  select
    count(*) as field_count,
    count(*) filter (where f.is_visible and f.status = 'ACTIVE') as visible_field_count,
    count(*) filter (where f.is_required and f.status = 'ACTIVE') as required_field_count,
    bool_or(f.field_key = 'student_name' and f.is_visible and f.is_required and f.status = 'ACTIVE') as has_student_name,
    bool_or(f.field_key = 'phone' and f.is_visible and f.is_required and f.status = 'ACTIVE') as has_phone
  from public.admission_form_field_configs f
  where f.segment_id = s.id
) field_stats on true
left join lateral (
  select
    count(*) as condition_count,
    count(*) filter (where c.is_required and c.status = 'ACTIVE') as required_condition_count,
    bool_or(c.condition_code = 'HOU_SYSTEM_ENTERED' and c.status = 'ACTIVE') as has_hou_system,
    bool_or(c.condition_group = 'DOCUMENT' and c.is_required and c.status = 'ACTIVE') as has_document_condition
  from public.admission_condition_rule_configs c
  where c.segment_id = s.id
) condition_stats on true
where s.status = 'ACTIVE'
  and public.can_read_admission_dynamic_config();

grant select on public.admission_dynamic_config_status to authenticated;

create or replace view public.admission_dynamic_config_summary
with (security_invoker = true)
as
select
  count(*)::int as segment_count,
  count(*) filter (where config_status = 'READY')::int as ready_count,
  count(*) filter (where config_status = 'NEEDS_FIX')::int as needs_fix_count,
  count(*) filter (where config_status = 'BLOCKED')::int as blocked_count,
  coalesce(sum(program_rule_count), 0)::int as program_rule_count,
  coalesce(sum(visible_field_count), 0)::int as visible_field_count,
  coalesce(sum(required_condition_count), 0)::int as required_condition_count
from public.admission_dynamic_config_status;

grant select on public.admission_dynamic_config_summary to authenticated;

with field_seed as (
  select *
  from (
    values
      ('student_name', 'Ho ten hoc vien', 'LEAD_CORE', 'TEXT', true, true, 'NONE', 'Nguyen Van A', 'Bat buoc de nhan dien lead', 10),
      ('phone', 'So dien thoai hoc vien', 'LEAD_CORE', 'PHONE', true, true, 'NONE', '09xxxxxxxx', 'Dung de chong trung lead va lien he', 20),
      ('parent_name', 'Ho ten phu huynh/nguoi giam ho', 'CONTACT', 'TEXT', true, false, 'NONE', 'Ho ten phu huynh', 'Bat buoc tuy doi tuong 9+ neu truong quy dinh', 30),
      ('parent_phone', 'So dien thoai phu huynh', 'CONTACT', 'PHONE', true, false, 'NONE', '09xxxxxxxx', 'Lien he phu huynh khi can', 40),
      ('lead_source_id', 'Nguon lead', 'SOURCE', 'SELECT', true, false, 'LEAD_SOURCE', null, 'Nguon dung cho bao cao va chong tranh chap', 50),
      ('partner_id', 'Doi tac/CTV/TTGDTX', 'SOURCE', 'PARTNER', true, false, 'PARTNER', null, 'Chi hien doi tac trong pham vi user neu co', 60),
      ('interested_program', 'He dao tao quan tam', 'ACADEMIC', 'PROGRAM', true, true, 'PROGRAM_BY_SEGMENT', null, 'He dao tao duoc loc theo doi tuong tuyen sinh', 70),
      ('interested_major', 'Nganh/khoa quan tam', 'ACADEMIC', 'MAJOR', true, true, 'MAJOR_BY_PROGRAM', null, 'Nganh duoc loc theo he dao tao da chon', 80),
      ('province', 'Tinh/thanh pho', 'LOCATION', 'TEXT', true, false, 'NONE', 'Ha Noi', 'Dung dia gioi moi, khong bat buoc quan/huyen', 90),
      ('ward', 'Xa/phuong', 'LOCATION', 'TEXT', true, false, 'NONE', 'Phuong/Xa', 'Dung dia gioi moi sau khi bo cap quan/huyen', 100),
      ('legacy_district', 'Quan/huyen cu neu ho so cu co', 'LOCATION', 'TEXT', true, false, 'NONE', 'Quan/Huyen cu', 'Chi dung khi ho so/vung du lieu cu con quan huyen', 110),
      ('note', 'Ghi chu tu van', 'OPERATION', 'TEXTAREA', true, false, 'NONE', 'Noi dung tu van', 'Khong thay the activity log', 120)
  ) as v(field_key, field_label, field_group, field_type, is_visible, is_required, option_source, placeholder, help_text, sort_order)
)
insert into public.admission_form_field_configs (
  segment_id,
  field_key,
  field_label,
  field_group,
  field_type,
  is_visible,
  is_required,
  option_source,
  placeholder,
  help_text,
  sort_order,
  status
)
select
  s.id,
  f.field_key,
  f.field_label,
  f.field_group,
  f.field_type,
  f.is_visible,
  f.is_required,
  f.option_source,
  f.placeholder,
  f.help_text,
  f.sort_order,
  'ACTIVE'::public.record_status
from public.admission_segments s
cross join field_seed f
where s.status = 'ACTIVE'
on conflict (segment_id, field_key) do update set
  field_label = excluded.field_label,
  field_group = excluded.field_group,
  field_type = excluded.field_type,
  is_visible = excluded.is_visible,
  is_required = excluded.is_required,
  option_source = excluded.option_source,
  placeholder = excluded.placeholder,
  help_text = excluded.help_text,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

with hou_field_seed as (
  select *
  from (
    values
      ('hou_program_id', 'Chuong trinh HOU', 'HOU', 'HOU_PROGRAM', true, true, 'HOU_PROGRAM', null, 'Chi dung cho lien thong dai hoc HOU', 210),
      ('hou_major_id', 'Nganh HOU', 'HOU', 'HOU_MAJOR', true, true, 'HOU_MAJOR', null, 'Nganh HOU chi tiet', 220),
      ('hou_location_id', 'Dia diem hoc HOU', 'HOU', 'HOU_LOCATION', true, true, 'HOU_LOCATION', null, 'Co the cau hinh them dia diem hoc trong Settings', 230),
      ('first_tuition_confirmed', 'Da xac nhan hoc phi ky dau', 'FINANCE', 'CHECKBOX', true, true, 'NONE', null, 'Dieu kien quan trong truoc COM HOU', 240)
  ) as v(field_key, field_label, field_group, field_type, is_visible, is_required, option_source, placeholder, help_text, sort_order)
)
insert into public.admission_form_field_configs (
  segment_id,
  field_key,
  field_label,
  field_group,
  field_type,
  is_visible,
  is_required,
  option_source,
  placeholder,
  help_text,
  sort_order,
  status
)
select
  s.id,
  f.field_key,
  f.field_label,
  f.field_group,
  f.field_type,
  f.is_visible,
  f.is_required,
  f.option_source,
  f.placeholder,
  f.help_text,
  f.sort_order,
  'ACTIVE'::public.record_status
from public.admission_segments s
cross join hou_field_seed f
where s.segment_code = 'UNIVERSITY_TRANSFER_HOU'
on conflict (segment_id, field_key) do update set
  field_label = excluded.field_label,
  field_group = excluded.field_group,
  field_type = excluded.field_type,
  is_visible = excluded.is_visible,
  is_required = excluded.is_required,
  option_source = excluded.option_source,
  placeholder = excluded.placeholder,
  help_text = excluded.help_text,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

with condition_seed as (
  select *
  from (
    values
      ('PROGRAM_MAJOR_CONFIRMED', 'Xac nhan dung he/nganh theo doi tuong', 'ADMISSION', true, 'BLOCK', false, 'TUYEN_SINH', 'TRUONG_PHONG_TUYEN_SINH', 'BGH', 'Lead phai co he/nganh hop le theo quy tac P0-15.', 10),
      ('REQUIRED_DOCUMENTS_READY', 'Du ho so bat buoc', 'DOCUMENT', true, 'BLOCK', true, 'CTHSSV + TUYEN_SINH', 'CTHSSV_LEAD', 'BGH', 'Tat ca giay to bat buoc phai dat truoc khi ban giao.', 20),
      ('FIRST_TUITION_CONFIRMED', 'Xac nhan hoc phi/khoan thu dau', 'FINANCE', true, 'BLOCK', true, 'KHTC', 'ACCOUNTING_LEAD', 'BGH', 'Khoan thu dau phai duoc ke toan xac nhan neu chuong trinh yeu cau.', 30),
      ('NO_DUPLICATE_LEAD_OR_STUDENT', 'Khong trung lead/hoc vien', 'ADMISSION', true, 'BLOCK', false, 'TUYEN_SINH + CTHSSV', 'TRUONG_PHONG_TUYEN_SINH', 'BGH', 'Can kiem tra so dien thoai, ho so cu, tai nhap hoc/chuyen nganh.', 40),
      ('HANDOVER_CTHSSV_READY', 'San sang ban giao CTHSSV', 'HANDOVER', true, 'BLOCK', true, 'TUYEN_SINH + CTHSSV', 'CTHSSV_LEAD', 'BGH', 'Ban giao phai co nguoi giao, nguoi nhan, thoi diem va minh chung.', 50)
  ) as v(condition_code, condition_name, condition_group, is_required, blocking_level, evidence_required, owner_department, checker_role, approver_role, rule_note, sort_order)
)
insert into public.admission_condition_rule_configs (
  segment_id,
  condition_code,
  condition_name,
  condition_group,
  is_required,
  blocking_level,
  evidence_required,
  owner_department,
  checker_role,
  approver_role,
  rule_note,
  sort_order,
  status
)
select
  s.id,
  c.condition_code,
  c.condition_name,
  c.condition_group,
  c.is_required,
  c.blocking_level,
  c.evidence_required,
  c.owner_department,
  c.checker_role,
  c.approver_role,
  c.rule_note,
  c.sort_order,
  'ACTIVE'::public.record_status
from public.admission_segments s
cross join condition_seed c
where s.status = 'ACTIVE'
on conflict (segment_id, condition_code) do update set
  condition_name = excluded.condition_name,
  condition_group = excluded.condition_group,
  is_required = excluded.is_required,
  blocking_level = excluded.blocking_level,
  evidence_required = excluded.evidence_required,
  owner_department = excluded.owner_department,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  rule_note = excluded.rule_note,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

with segment_condition_seed as (
  select *
  from (
    values
      ('UNIVERSITY_TRANSFER_HOU', 'HOU_SYSTEM_ENTERED', 'Da ghi nhan tren he thong HOU', 'HOU', true, 'BLOCK', true, 'TUYEN_SINH + HOU_OPERATOR', 'HOU_OPERATOR', 'BGH', 'Lead HOU phai co trang thai/he thong HOU truoc COM.', 110),
      ('UNIVERSITY_TRANSFER_HOU', 'HOU_EVIDENCE_READY', 'Du minh chung HOU', 'HOU', true, 'BLOCK', true, 'TUYEN_SINH + HOU_OPERATOR', 'HOU_OPERATOR', 'BGH', 'Can link/anh/quyet dinh/hoc phi hoac minh chung HOU lien quan.', 120),
      ('UNIVERSITY_TRANSFER_HOU', 'HOU_COM_ELIGIBILITY_READY', 'Du dieu kien de nghi COM HOU', 'COM', true, 'BLOCK', true, 'KHTC + TUYEN_SINH', 'ACCOUNTING_LEAD', 'BGH', 'Khong chi COM hai lan; phai kiem hoc phi, cong no va rui ro bo hoc.', 130),
      ('TC9_TTGDTX_LINKED', 'TTGDTX_PARTNER_CONTRACT_READY', 'Hop dong/van ban lien ket TTGDTX san sang', 'ADMISSION', true, 'BLOCK', true, 'TUYEN_SINH + PHAP_CHE', 'LEGAL', 'BGH', 'Khong mo luong TTGDTX neu chua ro don vi lien ket va ho so phap ly.', 110),
      ('TC9_TTGDTX_LINKED', 'TTGDTX_STUDENT_LIST_SOURCE_CONFIRMED', 'Nguon danh sach hoc sinh TTGDTX da xac nhan', 'ADMISSION', true, 'BLOCK', true, 'TUYEN_SINH', 'TRUONG_PHONG_TUYEN_SINH', 'BGH', 'Danh sach do TTGDTX cung cap phai ro nguon va nguoi phu trach.', 120),
      ('SHORT_UNEMPLOYMENT_SUPPORT', 'UNEMPLOYMENT_POLICY_EVIDENCE_READY', 'Du minh chung dien tro cap that nghiep', 'DOCUMENT', true, 'BLOCK', true, 'TUYEN_SINH + KHTC', 'ACCOUNTING_LEAD', 'BGH', 'Khong ghi nhan sai nguon ho tro/chung tu chinh sach.', 110)
  ) as v(segment_code, condition_code, condition_name, condition_group, is_required, blocking_level, evidence_required, owner_department, checker_role, approver_role, rule_note, sort_order)
)
insert into public.admission_condition_rule_configs (
  segment_id,
  condition_code,
  condition_name,
  condition_group,
  is_required,
  blocking_level,
  evidence_required,
  owner_department,
  checker_role,
  approver_role,
  rule_note,
  sort_order,
  status
)
select
  s.id,
  c.condition_code,
  c.condition_name,
  c.condition_group,
  c.is_required,
  c.blocking_level,
  c.evidence_required,
  c.owner_department,
  c.checker_role,
  c.approver_role,
  c.rule_note,
  c.sort_order,
  'ACTIVE'::public.record_status
from segment_condition_seed c
join public.admission_segments s on s.segment_code = c.segment_code
on conflict (segment_id, condition_code) do update set
  condition_name = excluded.condition_name,
  condition_group = excluded.condition_group,
  is_required = excluded.is_required,
  blocking_level = excluded.blocking_level,
  evidence_required = excluded.evidence_required,
  owner_department = excluded.owner_department,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  rule_note = excluded.rule_note,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

insert into public.heu_os_workflows (
  workflow_code,
  workflow_name,
  module_code,
  trigger_event,
  start_role,
  owner_department,
  checker_role,
  approver_role,
  output_result,
  handover_rule,
  audit_rule,
  sort_order,
  control_status
) values (
  'WF_P0_17_DYNAMIC_ADMISSION_CONFIG',
  'Cau hinh dong doi tuong tuyen sinh',
  'M05_ADMISSION_CRM',
  'Admin/IT Data can them/sua doi tuong, he/nganh, truong form va dieu kien bat buoc.',
  'ADMIN',
  'TUYEN_SINH + IT_DATA',
  'TRUONG_PHONG_TUYEN_SINH + DAO_TAO + CTHSSV + KHTC',
  'BGH',
  'Moi doi tuong tuyen sinh co cau hinh he/nganh, field form va dieu kien rieng.',
  'Module lead/import/pipeline/documents se doc cau hinh nay de hien dung thong tin.',
  'Moi thay doi cau hinh dong phai ghi audit log.',
  517,
  'DAT_TAM_THOI'
) on conflict (workflow_code) do update set
  workflow_name = excluded.workflow_name,
  module_code = excluded.module_code,
  trigger_event = excluded.trigger_event,
  start_role = excluded.start_role,
  owner_department = excluded.owner_department,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  output_result = excluded.output_result,
  handover_rule = excluded.handover_rule,
  audit_rule = excluded.audit_rule,
  sort_order = excluded.sort_order,
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
) values
  (
    'P0_17_ADMISSION_FORM_FIELD_CONFIGS',
    'P0-17 Admission Form Field Configs',
    'M05_ADMISSION_CRM',
    'admission_form_field_configs',
    'CONFIG',
    'TUYEN_SINH + IT_DATA',
    'HEU_OS',
    'INTERNAL',
    true,
    'Them/sua truong form lead phai qua Settings va audit log; field bat buoc khong duoc an.',
    'DAT_TAM_THOI'
  ),
  (
    'P0_17_ADMISSION_CONDITION_RULE_CONFIGS',
    'P0-17 Admission Condition Rule Configs',
    'M05_ADMISSION_CRM',
    'admission_condition_rule_configs',
    'CONFIG',
    'TUYEN_SINH + CTHSSV + KHTC + IT_DATA',
    'HEU_OS',
    'INTERNAL',
    true,
    'Dieu kien bat buoc/BLOCK phai co owner, checker, approver va rule note.',
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

insert into public.heu_os_risk_controls (
  risk_code,
  risk_name,
  module_code,
  risk_group,
  severity,
  owner_department,
  risk_description,
  control_rule,
  escalation_rule,
  dashboard_metric,
  control_status
) values (
  'RISK_P0_17_WRONG_DYNAMIC_ADMISSION_CONFIG',
  'Cau hinh dong tuyen sinh sai hoac thieu',
  'M05_ADMISSION_CRM',
  'DATA_QUALITY',
  'HIGH',
  'TUYEN_SINH + IT_DATA + BGH',
  'Neu doi tuong tuyen sinh thieu he/nganh, field bat buoc hoac dieu kien bat buoc thi lead/import/handover/COM se sai.',
  'Moi segment phai co program rules, field ho ten/SDT bat buoc va dieu kien required truoc khi production.',
  'Bao truong phong/IT Data va tam khoa go-live segment neu config_status la BLOCKED.',
  'So doi tuong tuyen sinh co config_status BLOCKED/NEEDS_FIX',
  'DAT_TAM_THOI'
) on conflict (risk_code) do update set
  risk_name = excluded.risk_name,
  module_code = excluded.module_code,
  risk_group = excluded.risk_group,
  severity = excluded.severity,
  owner_department = excluded.owner_department,
  risk_description = excluded.risk_description,
  control_rule = excluded.control_rule,
  escalation_rule = excluded.escalation_rule,
  dashboard_metric = excluded.dashboard_metric,
  control_status = excluded.control_status,
  updated_at = now();

insert into public.heu_os_navigation_nodes (
  node_code,
  node_name,
  node_group,
  module_code,
  href,
  summary,
  owner_department,
  primary_action,
  sort_order,
  is_core,
  requires_attention_rule,
  control_status
) values (
  'NAV_DYNAMIC_ADMISSION_CONFIG_P0_17',
  'Cau hinh tuyen sinh dong P0-17',
  'ADMISSION',
  'M05_ADMISSION_CRM',
  '/settings',
  'Cau hinh he/nganh, field form lead va dieu kien bat buoc theo tung doi tuong tuyen sinh.',
  'TUYEN_SINH + IT_DATA',
  'Mo cau hinh',
  37,
  true,
  'Can xem khi doi tuong tuyen sinh BLOCKED/NEEDS_FIX hoac form lead hien sai truong.',
  'DAT_TAM_THOI'
) on conflict (node_code) do update set
  node_name = excluded.node_name,
  node_group = excluded.node_group,
  module_code = excluded.module_code,
  href = excluded.href,
  summary = excluded.summary,
  owner_department = excluded.owner_department,
  primary_action = excluded.primary_action,
  sort_order = excluded.sort_order,
  is_core = excluded.is_core,
  requires_attention_rule = excluded.requires_attention_rule,
  control_status = excluded.control_status,
  updated_at = now();

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
    'ADMISSION_FORM_FIELD_CONFIGS',
    'Admission Form Field Configs',
    'M05_ADMISSION_CRM',
    'CONFIG',
    'TUYEN_SINH + IT_DATA',
    'Cau hinh truong form lead theo tung doi tuong tuyen sinh.',
    'INTERNAL',
    true,
    'DAT_TAM_THOI'
  ),
  (
    'ADMISSION_CONDITION_RULE_CONFIGS',
    'Admission Condition Rule Configs',
    'M05_ADMISSION_CRM',
    'CONFIG',
    'TUYEN_SINH + CTHSSV + KHTC + IT_DATA',
    'Cau hinh dieu kien bat buoc/khong bat buoc va muc chan theo tung doi tuong tuyen sinh.',
    'INTERNAL',
    true,
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
  'GATE_P0_17_DYNAMIC_ADMISSION_CONFIG',
  'P0-17 Dynamic Admission Configuration',
  'GO_LIVE',
  'HEU_OS',
  'DYNAMIC_ADMISSION_CONFIG',
  'BGH + TUYEN_SINH + DAO_TAO + CTHSSV + KHTC + IT_DATA',
  'Kiem tra moi doi tuong co he/nganh hop le, field bat buoc, dieu kien bat buoc, owner va muc chan.',
  'Chi duyet khi khong con segment BLOCKED va form lead/import khong cho du lieu ngoai cau hinh.',
  'DRAFT'
) on conflict (gate_code) do update set
  gate_name = excluded.gate_name,
  gate_type = excluded.gate_type,
  entity_type = excluded.entity_type,
  entity_code = excluded.entity_code,
  owner_department = excluded.owner_department,
  checker_note = excluded.checker_note,
  approver_note = excluded.approver_note,
  updated_at = now();
