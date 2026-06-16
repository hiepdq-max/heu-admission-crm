-- Step 54 - P0-15 Admission Object Field Schema.
-- Run after step53_admission_workspace_operation_guard.sql.
-- Purpose: each admission object controls its own valid programs and majors.
-- Example: TC9 only shows Trung cap majors; short courses only show Ngan han;
-- HOU only shows the HOU transfer object instead of unrelated programs.

create table if not exists public.admission_segment_program_rules (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid not null references public.admission_segments(id) on delete cascade,
  program_id uuid not null references public.admission_programs(id) on delete cascade,
  major_id uuid references public.admission_majors(id) on delete cascade,
  is_default boolean not null default false,
  is_required boolean not null default false,
  sort_order int not null default 0,
  note text,
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admission_segment_program_rules_unique
    unique nulls not distinct (segment_id, program_id, major_id)
);

create index if not exists idx_admission_segment_program_rules_segment
on public.admission_segment_program_rules(segment_id, status, sort_order);

create index if not exists idx_admission_segment_program_rules_program
on public.admission_segment_program_rules(program_id, major_id)
where status = 'ACTIVE';

alter table public.admission_segment_program_rules enable row level security;

drop policy if exists "admission_segment_program_rules_select_authenticated"
on public.admission_segment_program_rules;
create policy "admission_segment_program_rules_select_authenticated"
on public.admission_segment_program_rules for select
to authenticated
using (true);

drop policy if exists "admission_segment_program_rules_manage_settings"
on public.admission_segment_program_rules;
create policy "admission_segment_program_rules_manage_settings"
on public.admission_segment_program_rules for all
to authenticated
using (public.is_admin() or public.has_permission('settings.manage'))
with check (public.is_admin() or public.has_permission('settings.manage'));

drop trigger if exists trg_admission_segment_program_rules_updated_at
on public.admission_segment_program_rules;
create trigger trg_admission_segment_program_rules_updated_at
before update on public.admission_segment_program_rules
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_segment_program_rules_audit
on public.admission_segment_program_rules;
create trigger trg_admission_segment_program_rules_audit
after insert or update or delete on public.admission_segment_program_rules
for each row execute function public.write_audit_log();

create or replace view public.admission_segment_allowed_catalog
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
where r.status = 'ACTIVE'
  and s.status = 'ACTIVE'
  and p.status = 'ACTIVE'
  and (m.id is null or m.status = 'ACTIVE');

grant select on public.admission_segment_program_rules to authenticated;
grant select on public.admission_segment_allowed_catalog to authenticated;

with rule_seed as (
  select *
  from (
    values
      ('TC9_TTGDTX_LINKED', 'TRUNG_CAP', null::text, true, true, 10,
       'Trung cap 9+ lien ket TTGDTX chi duoc chon he Trung cap va cac nganh Trung cap.'),
      ('TC9_ONSITE_HEU', 'TRUNG_CAP', null::text, true, true, 20,
       'Trung cap 9+ tuyen sinh tai cho HEU chi duoc chon he Trung cap va cac nganh Trung cap.'),
      ('UNIVERSITY_TRANSFER_HOU', 'LIEN_THONG_DAI_HOC', 'LIEN_THONG_DH_MO_HN', true, true, 30,
       'Lien thong HOU chi hien doi tuong Dai hoc Mo Ha Noi o danh muc tong; nganh HOU chi tiet nam trong bang hou_majors.'),
      ('UNIVERSITY_TRANSFER_OTHER', 'LIEN_THONG_DAI_HOC', 'LIEN_THONG_HV_BUU_CHINH_VIEN_THONG', true, true, 40,
       'Lien thong dai hoc khac dung danh muc lien thong dai hoc ngoai HOU.'),
      ('SHORT_UNEMPLOYMENT_SUPPORT', 'NGAN_HAN', null::text, true, true, 50,
       'Ngan han dien tro cap that nghiep chi duoc chon cac khoa/nganh Ngan han.'),
      ('SHORT_ONSITE_HEU', 'NGAN_HAN', null::text, true, true, 60,
       'Ngan han tuyen sinh tai cho HEU chi duoc chon cac khoa/nganh Ngan han.')
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
  'WF_P0_15_ADMISSION_OBJECT_FIELD_SCHEMA',
  'Loc he/nganh theo doi tuong tuyen sinh',
  'M05_ADMISSION_CRM',
  'User chon workspace/doi tuong tuyen sinh khi tao lead hoac import.',
  'TUYEN_SINH',
  'TUYEN_SINH + IT_DATA',
  'TRUONG_PHONG_TUYEN_SINH',
  'BGH',
  'Form chi hien dung he/nganh cua doi tuong; server chan du lieu he/nganh ngoai quy tac.',
  'Neu thay doi danh muc he/nganh phai cap nhat rule va audit log.',
  'Moi thay doi rule admission_segment_program_rules phai ghi audit log.',
  515,
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
  'DATA_P0_15_ADMISSION_SEGMENT_PROGRAM_RULES',
  'Admission Segment Program Rules',
  'M05_ADMISSION_CRM',
  'admission_segment_program_rules',
  'CONFIG',
  'TUYEN_SINH + IT_DATA',
  'HEU_OS',
  'INTERNAL',
  true,
  'Them/sua quy tac he-nganh theo doi tuong tuyen sinh phai qua Settings/Master Control va co audit log.',
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
  'RISK_P0_15_WRONG_PROGRAM_MAJOR_BY_SEGMENT',
  'Chon sai he/nganh theo doi tuong tuyen sinh',
  'M05_ADMISSION_CRM',
  'DATA_QUALITY',
  'HIGH',
  'TUYEN_SINH + DAO_TAO',
  'Vi du lead 9+ bi chon nganh ngan han/HOU se lam sai tu van, sai ho so, sai lop va sai bao cao.',
  'Form va server chi chap nhan he/nganh trong admission_segment_program_rules cua segment dang chon.',
  'Neu phat hien sai: khoa lead, sua rule, audit nguoi tao/import va bao truong phong xu ly.',
  'So lead co he/nganh khong khop doi tuong',
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
  'NAV_FIELD_SCHEMA_P0_15',
  'Quy tac he/nganh P0-15',
  'ADMISSION',
  'M05_ADMISSION_CRM',
  '/settings',
  'Cau hinh doi tuong tuyen sinh nao duoc chon he/nganh nao.',
  'TUYEN_SINH + IT_DATA',
  'Kiem tra danh muc',
  36,
  true,
  'Khi chon 9+ thi chi hien nganh Trung cap; chon Ngan han chi hien khoa Ngan han; chon HOU chi hien lien thong HOU.',
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
) values (
  'ADMISSION_SEGMENT_PROGRAM_RULES',
  'Admission Segment Program Rules',
  'M05_ADMISSION_CRM',
  'CONFIG',
  'TUYEN_SINH + IT_DATA',
  'Bang cau hinh doi tuong tuyen sinh nao duoc su dung he/nganh nao.',
  'INTERNAL',
  true,
  'DAT_TAM_THOI'
) on conflict (table_code) do update set
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
  'GATE_P0_15_ADMISSION_OBJECT_FIELD_SCHEMA',
  'P0-15 Admission Object Field Schema',
  'GO_LIVE',
  'HEU_OS',
  'ADMISSION_OBJECT_FIELD_SCHEMA',
  'BGH + TUYEN_SINH + DAO_TAO + IT_DATA',
  'Kiem tra tung doi tuong: 9+ chi Trung cap; Ngan han chi Ngan han; HOU chi lien thong/HOU; import CSV khong vuot rule.',
  'Chi phe duyet khi form va server deu chan he/nganh khong khop doi tuong tuyen sinh.',
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
