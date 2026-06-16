-- Step 60 - P0-20 Admission Catalog Workspace Gate.
-- Run after step59_major_legal_tuition_gate.sql.
--
-- Purpose:
-- - Lock each admission workspace to the correct training catalog.
-- - TC9 workspaces can only use Trung cap programs/majors.
-- - Short-course workspaces can only use Ngan han programs/majors.
-- - University-transfer workspaces can only use Lien thong dai hoc programs/majors.
-- - This is the governance layer above the UI filter, so wrong catalogs are
--   visible, auditable and blocked before data goes into production.

create table if not exists public.admission_catalog_groups (
  id uuid primary key default gen_random_uuid(),
  catalog_group_code text not null unique,
  catalog_group_name text not null,
  description text,
  owner_department text not null default 'DAO_TAO + TUYEN_SINH',
  checker_department text not null default 'PHAP_CHE + IT_DATA',
  approver_role text not null default 'BGH_HIEU_TRUONG',
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admission_catalog_groups_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.admission_segment_catalog_controls (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid not null unique references public.admission_segments(id) on delete cascade,
  catalog_group_code text not null references public.admission_catalog_groups(catalog_group_code)
    on update cascade,
  allowed_program_codes text[] not null default '{}'::text[],
  allowed_major_policy text not null default 'PROGRAM_ACTIVE_MAJORS',
  requires_program_rule boolean not null default true,
  requires_major_catalog boolean not null default true,
  requires_hou_detail boolean not null default false,
  blocks_cross_catalog boolean not null default true,
  note text,
  owner_department text not null default 'DAO_TAO + TUYEN_SINH',
  checker_department text not null default 'PHAP_CHE + IT_DATA',
  approver_role text not null default 'BGH_HIEU_TRUONG',
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admission_segment_catalog_policy_valid check (
    allowed_major_policy in (
      'PROGRAM_ACTIVE_MAJORS',
      'HOU_DETAIL_TABLE',
      'CUSTOM_CATALOG_REQUIRED',
      'CONFIG_ONLY'
    )
  ),
  constraint admission_segment_catalog_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create index if not exists idx_admission_segment_catalog_controls_group
on public.admission_segment_catalog_controls(catalog_group_code, status);

create index if not exists idx_admission_segment_catalog_controls_programs
on public.admission_segment_catalog_controls using gin(allowed_program_codes);

alter table public.admission_catalog_groups enable row level security;
alter table public.admission_segment_catalog_controls enable row level security;

drop policy if exists "admission_catalog_groups_select_authenticated"
on public.admission_catalog_groups;
create policy "admission_catalog_groups_select_authenticated"
on public.admission_catalog_groups for select
to authenticated
using (status = 'ACTIVE' or public.can_read_master_control());

drop policy if exists "admission_catalog_groups_manage_config"
on public.admission_catalog_groups;
create policy "admission_catalog_groups_manage_config"
on public.admission_catalog_groups for all
to authenticated
using (
  public.can_manage_master_control()
  or public.has_permission('settings.manage')
  or public.has_permission('admission_config.manage')
)
with check (
  public.can_manage_master_control()
  or public.has_permission('settings.manage')
  or public.has_permission('admission_config.manage')
);

drop policy if exists "admission_segment_catalog_controls_select_authenticated"
on public.admission_segment_catalog_controls;
create policy "admission_segment_catalog_controls_select_authenticated"
on public.admission_segment_catalog_controls for select
to authenticated
using (status = 'ACTIVE' or public.can_read_master_control());

drop policy if exists "admission_segment_catalog_controls_manage_config"
on public.admission_segment_catalog_controls;
create policy "admission_segment_catalog_controls_manage_config"
on public.admission_segment_catalog_controls for all
to authenticated
using (
  public.can_manage_master_control()
  or public.has_permission('settings.manage')
  or public.has_permission('admission_config.manage')
)
with check (
  public.can_manage_master_control()
  or public.has_permission('settings.manage')
  or public.has_permission('admission_config.manage')
);

drop trigger if exists trg_admission_catalog_groups_updated_at
on public.admission_catalog_groups;
create trigger trg_admission_catalog_groups_updated_at
before update on public.admission_catalog_groups
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_catalog_groups_audit
on public.admission_catalog_groups;
create trigger trg_admission_catalog_groups_audit
after insert or update or delete on public.admission_catalog_groups
for each row execute function public.write_audit_log();

drop trigger if exists trg_admission_segment_catalog_controls_updated_at
on public.admission_segment_catalog_controls;
create trigger trg_admission_segment_catalog_controls_updated_at
before update on public.admission_segment_catalog_controls
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_segment_catalog_controls_audit
on public.admission_segment_catalog_controls;
create trigger trg_admission_segment_catalog_controls_audit
after insert or update or delete on public.admission_segment_catalog_controls
for each row execute function public.write_audit_log();

insert into public.admission_catalog_groups (
  catalog_group_code,
  catalog_group_name,
  description,
  owner_department,
  checker_department,
  approver_role,
  control_status,
  status
) values
  (
    'TRUNG_CAP',
    'Trung cấp',
    'Catalog he Trung cap HEU: nganh/nghe dung cho tuyen sinh, ho so, hoc phi, lop va bao cao trung cap.',
    'DAO_TAO + TUYEN_SINH',
    'PHAP_CHE + IT_DATA',
    'BGH_HIEU_TRUONG',
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'NGAN_HAN',
    'Ngắn hạn',
    'Catalog khoa/nganh ngan han. Danh muc phai duoc tach rieng voi Trung cap va Lien thong dai hoc.',
    'DAO_TAO + TUYEN_SINH',
    'PHAP_CHE + IT_DATA',
    'BGH_HIEU_TRUONG',
    'CAN_SUA',
    'ACTIVE'::public.record_status
  ),
  (
    'LIEN_THONG_DAI_HOC',
    'Liên thông đại học',
    'Catalog lien thong dai hoc/HOU va cac doi tac dai hoc khac. Khong duoc tron voi Trung cap hoac Ngan han.',
    'TUYEN_SINH + PHAP_CHE + KHTC',
    'PHAP_CHE + IT_DATA',
    'BGH_HIEU_TRUONG',
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  )
on conflict (catalog_group_code) do update set
  catalog_group_name = excluded.catalog_group_name,
  description = excluded.description,
  owner_department = excluded.owner_department,
  checker_department = excluded.checker_department,
  approver_role = excluded.approver_role,
  control_status = excluded.control_status,
  status = 'ACTIVE',
  updated_at = now();

insert into public.admission_programs (
  program_code,
  program_name,
  sort_order,
  status
) values
  ('TRUNG_CAP', 'Trung cấp', 10, 'ACTIVE'::public.record_status),
  ('NGAN_HAN', 'Ngắn hạn', 20, 'ACTIVE'::public.record_status),
  ('LIEN_THONG_DAI_HOC', 'Liên thông đại học', 30, 'ACTIVE'::public.record_status)
on conflict (program_code) do update set
  program_name = excluded.program_name,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

with control_seed as (
  select *
  from (
    values
      (
        'TC9_TTGDTX_LINKED',
        'TRUNG_CAP',
        array['TRUNG_CAP']::text[],
        'PROGRAM_ACTIVE_MAJORS',
        true,
        true,
        false,
        true,
        'Trung cap 9+ lien ket TTGDTX chi duoc dung catalog Trung cap. Lead cua TTGDTX khong duoc tron voi ngan han hoac lien thong.',
        'DAT_TAM_THOI'
      ),
      (
        'TC9_ONSITE_HEU',
        'TRUNG_CAP',
        array['TRUNG_CAP']::text[],
        'PROGRAM_ACTIVE_MAJORS',
        true,
        true,
        false,
        true,
        'Trung cap 9+ tuyen sinh tai cho HEU chi duoc dung catalog Trung cap.',
        'DAT_TAM_THOI'
      ),
      (
        'UNIVERSITY_TRANSFER_HOU',
        'LIEN_THONG_DAI_HOC',
        array['LIEN_THONG_DAI_HOC']::text[],
        'HOU_DETAIL_TABLE',
        true,
        false,
        true,
        true,
        'Lien thong HOU dung catalog Lien thong dai hoc; nganh, dia diem va buoc xu ly chi tiet nam trong cac bang HOU.',
        'DAT_TAM_THOI'
      ),
      (
        'UNIVERSITY_TRANSFER_OTHER',
        'LIEN_THONG_DAI_HOC',
        array['LIEN_THONG_DAI_HOC']::text[],
        'CUSTOM_CATALOG_REQUIRED',
        true,
        true,
        false,
        true,
        'Lien thong dai hoc khac phai co catalog rieng theo tung truong/doi tac, hop dong va hoc phi.',
        'CAN_SUA'
      ),
      (
        'SHORT_UNEMPLOYMENT_SUPPORT',
        'NGAN_HAN',
        array['NGAN_HAN']::text[],
        'CUSTOM_CATALOG_REQUIRED',
        true,
        true,
        false,
        true,
        'Ngan han dien tro cap that nghiep chi duoc dung catalog Ngan han; can xac minh dieu kien chinh sach va hoc phi.',
        'CAN_SUA'
      ),
      (
        'SHORT_ONSITE_HEU',
        'NGAN_HAN',
        array['NGAN_HAN']::text[],
        'CUSTOM_CATALOG_REQUIRED',
        true,
        true,
        false,
        true,
        'Ngan han tuyen sinh tai cho HEU chi duoc dung catalog Ngan han.',
        'CAN_SUA'
      )
  ) as v(
    segment_code,
    catalog_group_code,
    allowed_program_codes,
    allowed_major_policy,
    requires_program_rule,
    requires_major_catalog,
    requires_hou_detail,
    blocks_cross_catalog,
    note,
    control_status
  )
)
insert into public.admission_segment_catalog_controls (
  segment_id,
  catalog_group_code,
  allowed_program_codes,
  allowed_major_policy,
  requires_program_rule,
  requires_major_catalog,
  requires_hou_detail,
  blocks_cross_catalog,
  note,
  owner_department,
  checker_department,
  approver_role,
  control_status,
  status
)
select
  s.id,
  c.catalog_group_code,
  c.allowed_program_codes,
  c.allowed_major_policy,
  c.requires_program_rule,
  c.requires_major_catalog,
  c.requires_hou_detail,
  c.blocks_cross_catalog,
  c.note,
  s.owner_department,
  'PHAP_CHE + IT_DATA',
  'BGH_HIEU_TRUONG',
  c.control_status,
  'ACTIVE'::public.record_status
from control_seed c
join public.admission_segments s on s.segment_code = c.segment_code
on conflict (segment_id) do update set
  catalog_group_code = excluded.catalog_group_code,
  allowed_program_codes = excluded.allowed_program_codes,
  allowed_major_policy = excluded.allowed_major_policy,
  requires_program_rule = excluded.requires_program_rule,
  requires_major_catalog = excluded.requires_major_catalog,
  requires_hou_detail = excluded.requires_hou_detail,
  blocks_cross_catalog = excluded.blocks_cross_catalog,
  note = excluded.note,
  owner_department = excluded.owner_department,
  checker_department = excluded.checker_department,
  approver_role = excluded.approver_role,
  control_status = excluded.control_status,
  status = 'ACTIVE',
  updated_at = now();

with rule_seed as (
  select *
  from (
    values
      ('TC9_TTGDTX_LINKED', 'TRUNG_CAP', null::text, true, true, 10,
       'P0-20: Workspace TTGDTX chi dung catalog Trung cap.'),
      ('TC9_ONSITE_HEU', 'TRUNG_CAP', null::text, true, true, 20,
       'P0-20: Workspace Trung cap tai cho HEU chi dung catalog Trung cap.'),
      ('UNIVERSITY_TRANSFER_HOU', 'LIEN_THONG_DAI_HOC', 'LIEN_THONG_DH_MO_HN', true, true, 30,
       'P0-20: Workspace HOU chi dung catalog Lien thong dai hoc/HOU.'),
      ('UNIVERSITY_TRANSFER_OTHER', 'LIEN_THONG_DAI_HOC', null::text, true, true, 40,
       'P0-20: Workspace lien thong dai hoc khac chi dung catalog Lien thong dai hoc.'),
      ('SHORT_UNEMPLOYMENT_SUPPORT', 'NGAN_HAN', null::text, true, true, 50,
       'P0-20: Workspace ngan han tro cap that nghiep chi dung catalog Ngan han.'),
      ('SHORT_ONSITE_HEU', 'NGAN_HAN', null::text, true, true, 60,
       'P0-20: Workspace ngan han tai HEU chi dung catalog Ngan han.')
  ) as v(segment_code, program_code, major_code, is_default, is_required, sort_order, note)
),
resolved as (
  select
    s.id as segment_id,
    p.id as program_id,
    m.id as major_id,
    v.is_default,
    v.is_required,
    v.sort_order,
    v.note
  from rule_seed v
  join public.admission_segments s on s.segment_code = v.segment_code
  join public.admission_programs p on p.program_code = v.program_code
  left join public.admission_majors m on m.major_code = v.major_code
)
insert into public.admission_segment_program_rules (
  segment_id,
  program_id,
  major_id,
  is_default,
  is_required,
  sort_order,
  note,
  status
)
select
  segment_id,
  program_id,
  major_id,
  is_default,
  is_required,
  sort_order,
  note,
  'ACTIVE'::public.record_status
from resolved
on conflict (segment_id, program_id, major_id) do update set
  is_default = excluded.is_default,
  is_required = excluded.is_required,
  sort_order = excluded.sort_order,
  note = excluded.note,
  status = 'ACTIVE',
  updated_at = now();

create or replace view public.admission_catalog_control_status
with (security_invoker = true)
as
select
  c.id,
  c.segment_id,
  s.segment_code,
  s.segment_name,
  s.program_group,
  c.catalog_group_code,
  g.catalog_group_name,
  c.allowed_program_codes,
  c.allowed_major_policy,
  c.requires_program_rule,
  c.requires_major_catalog,
  c.requires_hou_detail,
  c.blocks_cross_catalog,
  coalesce(rule_stats.program_rule_count, 0)::int as program_rule_count,
  coalesce(rule_stats.major_rule_count, 0)::int as major_rule_count,
  coalesce(catalog_stats.active_program_count, 0)::int as active_program_count,
  coalesce(catalog_stats.active_major_count, 0)::int as active_major_count,
  c.owner_department,
  c.checker_department,
  c.approver_role,
  c.control_status,
  array_remove(array[
    case when cardinality(c.allowed_program_codes) = 0 then 'NO_ALLOWED_PROGRAMS' end,
    case when c.requires_program_rule and coalesce(rule_stats.program_rule_count, 0) = 0 then 'NO_PROGRAM_RULE' end,
    case when c.requires_major_catalog and c.allowed_major_policy <> 'HOU_DETAIL_TABLE' and coalesce(catalog_stats.active_major_count, 0) = 0 then 'NO_ACTIVE_MAJOR_IN_CATALOG' end,
    case when c.requires_hou_detail and not exists (
      select 1 from public.hou_programs hp where hp.status = 'ACTIVE'
    ) then 'NO_ACTIVE_HOU_PROGRAM' end,
    case when c.control_status in ('CAN_SUA', 'CHUA_DU_DIEU_KIEN') then 'CONTROL_NOT_READY' end
  ], null) as control_flags,
  case
    when cardinality(c.allowed_program_codes) = 0 then 'BLOCKED'
    when c.requires_program_rule and coalesce(rule_stats.program_rule_count, 0) = 0 then 'BLOCKED'
    when c.requires_major_catalog
      and c.allowed_major_policy <> 'HOU_DETAIL_TABLE'
      and coalesce(catalog_stats.active_major_count, 0) = 0 then 'BLOCKED'
    when c.requires_hou_detail and not exists (
      select 1 from public.hou_programs hp where hp.status = 'ACTIVE'
    ) then 'BLOCKED'
    when c.control_status in ('CAN_SUA', 'CHUA_DU_DIEU_KIEN') then 'NEEDS_FIX'
    else 'READY'
  end as catalog_status,
  c.note,
  c.status,
  c.created_at,
  c.updated_at
from public.admission_segment_catalog_controls c
join public.admission_segments s on s.id = c.segment_id
join public.admission_catalog_groups g on g.catalog_group_code = c.catalog_group_code
left join lateral (
  select
    count(*) as program_rule_count,
    count(*) filter (where r.major_id is not null) as major_rule_count
  from public.admission_segment_program_rules r
  where r.segment_id = c.segment_id
    and r.status = 'ACTIVE'
) rule_stats on true
left join lateral (
  select
    count(distinct p.id) as active_program_count,
    count(distinct m.id) as active_major_count
  from public.admission_programs p
  left join public.admission_majors m
    on m.program_id = p.id
   and m.status = 'ACTIVE'
  where p.status = 'ACTIVE'
    and p.program_code = any(c.allowed_program_codes)
) catalog_stats on true
where c.status = 'ACTIVE'
  and s.status = 'ACTIVE'
  and public.can_read_master_control();

grant select on public.admission_catalog_groups to authenticated;
grant select on public.admission_segment_catalog_controls to authenticated;
grant select on public.admission_catalog_control_status to authenticated;

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
  'WF_P0_20_ADMISSION_CATALOG_GATE',
  'P0-20 Khoa catalog he/nganh theo doi tuong tuyen sinh',
  'M05_ADMISSION_CRM',
  'User chon workspace khi tao/import lead.',
  'TUYEN_SINH',
  'DAO_TAO + TUYEN_SINH + IT_DATA',
  'PHAP_CHE + TRUONG_PHONG_TUYEN_SINH',
  'BGH',
  'Moi workspace chi thay va ghi du lieu he/nganh thuoc catalog duoc phep.',
  'Neu mo them he/nganh/doi tuong moi phai tao catalog control truoc khi cho nhap lead.',
  'Moi thay doi admission_segment_catalog_controls va admission_segment_program_rules phai ghi audit log.',
  520,
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
) values (
  'MD_P0_20_ADMISSION_CATALOG_CONTROLS',
  'Catalog he/nganh theo doi tuong tuyen sinh',
  'M05_ADMISSION_CRM',
  'admission_catalog_groups,admission_segment_catalog_controls,admission_segment_program_rules',
  'CONFIG',
  'DAO_TAO + TUYEN_SINH + IT_DATA',
  'HEU_OS',
  'INTERNAL',
  true,
  'Chi ADMIN/IT_DATA/nguoi duoc phan quyen admission_config.manage duoc sua. Moi sua doi phai co audit log va doi chieu P0-17/P0-18.',
  'DAT_TAM_THOI'
) on conflict (data_code) do update set
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
  'RISK_P0_20_CROSS_CATALOG_LEAD',
  'Lead bi nhap sai catalog he/nganh',
  'M05_ADMISSION_CRM',
  'DATA_QUALITY',
  'HIGH',
  'TUYEN_SINH + DAO_TAO + IT_DATA',
  'Neu user chon doi tuong 9+ nhung lai nhap nganh ngan han/lien thong, bao cao, hoc phi, ho so va COM se sai.',
  'Form va server phai doc admission_segment_catalog_controls; he/nganh ngoai allowed_program_codes khong duoc hien va khong duoc ghi.',
  'Neu catalog_status BLOCKED/NEEDS_FIX thi Truong phong tuyen sinh + IT_DATA phai xu ly truoc khi cho van hanh.',
  'So workspace catalog_status khac READY; so lead bi chan do sai catalog.',
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
    'admission_catalog_groups',
    'Nhom catalog tuyen sinh',
    'M05_ADMISSION_CRM',
    'CONFIG',
    'DAO_TAO + TUYEN_SINH + IT_DATA',
    'Quan ly cac nhom catalog lon: Trung cap, Ngan han, Lien thong dai hoc.',
    'INTERNAL',
    true,
    'DAT_TAM_THOI'
  ),
  (
    'admission_segment_catalog_controls',
    'Khoa catalog theo doi tuong tuyen sinh',
    'M05_ADMISSION_CRM',
    'CONFIG',
    'DAO_TAO + TUYEN_SINH + IT_DATA',
    'Quy dinh moi doi tuong tuyen sinh duoc dung he dao tao/nganh nghe nao.',
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

with target_tables as (
  select id, table_code
  from public.data_dictionary_tables
  where table_code in (
    'admission_catalog_groups',
    'admission_segment_catalog_controls'
  )
),
field_seed as (
  select *
  from (
    values
      ('admission_catalog_groups', 'catalog_group_code', 'Ma nhom catalog', 'text', true, true, false, true,
       'TRUNG_CAP / NGAN_HAN / LIEN_THONG_DAI_HOC'),
      ('admission_catalog_groups', 'control_status', 'Trang thai kiem soat', 'text', true, false, false, true,
       'DAT / DAT_TAM_THOI / CAN_SUA / CHUA_DU_DIEU_KIEN'),
      ('admission_segment_catalog_controls', 'segment_id', 'Doi tuong tuyen sinh', 'uuid', true, true, false, true,
       'Lien ket admission_segments'),
      ('admission_segment_catalog_controls', 'allowed_program_codes', 'He dao tao duoc phep', 'text[]', true, false, false, true,
       'Danh sach program_code duoc phep trong workspace'),
      ('admission_segment_catalog_controls', 'allowed_major_policy', 'Chinh sach nganh', 'text', true, false, false, true,
       'PROGRAM_ACTIVE_MAJORS / HOU_DETAIL_TABLE / CUSTOM_CATALOG_REQUIRED / CONFIG_ONLY')
  ) as v(table_code, field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, note)
)
insert into public.data_dictionary_fields (
  table_id,
  field_code,
  field_name,
  data_type,
  is_required,
  is_unique,
  is_sensitive,
  ai_allowed,
  note,
  control_status
)
select
  t.id,
  f.field_code,
  f.field_name,
  f.data_type,
  f.is_required,
  f.is_unique,
  f.is_sensitive,
  f.ai_allowed,
  f.note,
  'DAT_TAM_THOI'
from field_seed f
join target_tables t on t.table_code = f.table_code
on conflict (table_id, field_code) do update set
  field_name = excluded.field_name,
  data_type = excluded.data_type,
  is_required = excluded.is_required,
  is_unique = excluded.is_unique,
  is_sensitive = excluded.is_sensitive,
  ai_allowed = excluded.ai_allowed,
  note = excluded.note,
  control_status = excluded.control_status,
  updated_at = now();

insert into public.process_ownership_matrix (
  ownership_code,
  process_name,
  module_code,
  workflow_code,
  entity_type,
  source_table,
  owner_department,
  maker_role,
  checker_role,
  approver_role,
  viewer_scope,
  handover_from_department,
  handover_to_department,
  required_evidence,
  audit_rule,
  sla_hours,
  risk_level,
  control_status,
  status
) values (
  'OWN_P0_20_ADMISSION_CATALOG_GATE',
  'Quan ly catalog he/nganh theo doi tuong tuyen sinh',
  'M05_ADMISSION_CRM',
  'WF_P0_20_ADMISSION_CATALOG_GATE',
  'CONFIG',
  'admission_segment_catalog_controls',
  'DAO_TAO + TUYEN_SINH + IT_DATA',
  'IT_DATA',
  'PHAP_CHE + TRUONG_PHONG_TUYEN_SINH',
  'BGH',
  'ROLE_AND_SCOPE',
  'TUYEN_SINH',
  'DAO_TAO + IT_DATA',
  'Danh muc nganh/nghe, can cu phap ly, hoc phi va quy tac workspace.',
  'Moi sua catalog control phai ghi audit log; khong sua truc tiep tren production neu chua doi chieu P0-17/P0-18.',
  48,
  'HIGH',
  'DAT_TAM_THOI',
  'ACTIVE'::public.record_status
) on conflict (ownership_code) do update set
  process_name = excluded.process_name,
  module_code = excluded.module_code,
  workflow_code = excluded.workflow_code,
  entity_type = excluded.entity_type,
  source_table = excluded.source_table,
  owner_department = excluded.owner_department,
  maker_role = excluded.maker_role,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  viewer_scope = excluded.viewer_scope,
  handover_from_department = excluded.handover_from_department,
  handover_to_department = excluded.handover_to_department,
  required_evidence = excluded.required_evidence,
  audit_rule = excluded.audit_rule,
  sla_hours = excluded.sla_hours,
  risk_level = excluded.risk_level,
  control_status = excluded.control_status,
  status = 'ACTIVE',
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
  decision_status,
  record_status
) values (
  'GATE_P0_20_ADMISSION_CATALOG_READY',
  'P0-20 Catalog he/nganh san sang van hanh',
  'DATA',
  'ADMISSION_CATALOG',
  'P0_20_ADMISSION_CATALOG_WORKSPACE_GATE',
  'DAO_TAO + TUYEN_SINH + IT_DATA',
  'Kiem tra admission_catalog_control_status: moi workspace production phai co allowed_program_codes, program rule va active major/detail phu hop.',
  'BGH/Truong phong tuyen sinh phe duyet truoc khi mo rong doi tuong tuyen sinh moi.',
  'PENDING',
  'ACTIVE'::public.record_status
) on conflict (gate_code) do update set
  gate_name = excluded.gate_name,
  gate_type = excluded.gate_type,
  entity_type = excluded.entity_type,
  entity_code = excluded.entity_code,
  owner_department = excluded.owner_department,
  checker_note = excluded.checker_note,
  approver_note = excluded.approver_note,
  decision_status = excluded.decision_status,
  record_status = 'ACTIVE',
  updated_at = now();
