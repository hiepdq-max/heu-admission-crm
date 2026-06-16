-- Step 57 - P0-18 Dynamic Lead Form Enforcement.
-- Run after step56_dynamic_admission_configuration.sql.
-- Purpose: lead creation reads P0-17 field configs, validates the exact fields
-- that are required for the selected admission object, and stores custom values.

create table if not exists public.lead_custom_field_values (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  segment_id uuid not null references public.admission_segments(id) on delete cascade,
  field_config_id uuid references public.admission_form_field_configs(id) on delete set null,
  field_key text not null,
  field_label text not null,
  field_type text not null default 'TEXT',
  field_value text,
  field_value_json jsonb,
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_custom_field_values_unique unique (lead_id, field_key)
);

create index if not exists idx_lead_custom_field_values_lead
on public.lead_custom_field_values(lead_id, status);

create index if not exists idx_lead_custom_field_values_segment
on public.lead_custom_field_values(segment_id, field_key)
where status = 'ACTIVE';

alter table public.lead_custom_field_values enable row level security;

drop policy if exists "lead_custom_field_values_select_lead_access"
on public.lead_custom_field_values;
create policy "lead_custom_field_values_select_lead_access"
on public.lead_custom_field_values for select
to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_custom_field_values.lead_id
      and l.is_deleted = false
      and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
      and (
        public.can_read_lead(l.assigned_to, l.created_by)
        or public.can_access_lead_handover(l.id)
      )
  )
);

drop policy if exists "lead_custom_field_values_write_lead_access"
on public.lead_custom_field_values;
create policy "lead_custom_field_values_write_lead_access"
on public.lead_custom_field_values for all
to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_custom_field_values.lead_id
      and l.is_deleted = false
      and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
      and public.can_write_lead(l.assigned_to, l.created_by)
  )
)
with check (
  exists (
    select 1
    from public.leads l
    where l.id = lead_custom_field_values.lead_id
      and l.is_deleted = false
      and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
      and public.can_write_lead(l.assigned_to, l.created_by)
  )
);

drop trigger if exists trg_lead_custom_field_values_updated_at
on public.lead_custom_field_values;
create trigger trg_lead_custom_field_values_updated_at
before update on public.lead_custom_field_values
for each row execute function public.set_updated_at();

drop trigger if exists trg_lead_custom_field_values_audit
on public.lead_custom_field_values;
create trigger trg_lead_custom_field_values_audit
after insert or update or delete on public.lead_custom_field_values
for each row execute function public.write_audit_log();

create or replace view public.lead_custom_field_values_readable
with (security_invoker = true)
as
select
  v.id,
  v.lead_id,
  l.lead_code,
  l.student_name,
  v.segment_id,
  s.segment_code,
  s.segment_name,
  v.field_config_id,
  v.field_key,
  v.field_label,
  v.field_type,
  v.field_value,
  v.field_value_json,
  v.status,
  v.created_at,
  v.updated_at
from public.lead_custom_field_values v
join public.leads l on l.id = v.lead_id
join public.admission_segments s on s.id = v.segment_id
where v.status = 'ACTIVE';

grant select on public.lead_custom_field_values_readable to authenticated;

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
  'WF_P0_18_DYNAMIC_LEAD_FORM',
  'P0-18 Tao lead theo cau hinh dong',
  'M05_ADMISSION_CRM',
  'User tao lead trong workspace tuyen sinh da chon.',
  'TUYEN_SINH',
  'TUYEN_SINH + IT_DATA',
  'TRUONG_PHONG_TUYEN_SINH',
  'BGH',
  'Form lead chi hien field duoc cau hinh va chan dung field bat buoc.',
  'Lead, field tuy bien va audit log phai di theo admission_segment_id.',
  'Moi gia tri custom field ghi vao lead_custom_field_values va audit log.',
  518,
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
  'P0_18_LEAD_CUSTOM_FIELD_VALUES',
  'P0-18 Lead Custom Field Values',
  'M05_ADMISSION_CRM',
  'lead_custom_field_values',
  'TRANSACTION',
  'TUYEN_SINH + IT_DATA',
  'HEU_OS',
  'INTERNAL',
  true,
  'Chi luu field tuy bien da duoc P0-17 cau hinh va user co quyen lead.',
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
  'RISK_P0_18_LEAD_FORM_CONFIG_NOT_ENFORCED',
  'Form tao lead khong chay theo cau hinh P0-17',
  'M05_ADMISSION_CRM',
  'DATA_QUALITY',
  'HIGH',
  'TUYEN_SINH + IT_DATA',
  'Neu form lead hien sai field hoac bo qua field bat buoc thi lead se sai doi tuong, sai he/nganh, sai dieu kien ban giao/COM.',
  'Form va server action phai doc admission_form_field_configs theo admission_segment_id.',
  'Tam dung go-live segment neu config_status BLOCKED hoac field bat buoc khong duoc enforce.',
  'So lead bi tu choi do thieu field bat buoc theo P0-17',
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
) values (
  'LEAD_CUSTOM_FIELD_VALUES',
  'Lead Custom Field Values',
  'M05_ADMISSION_CRM',
  'TRANSACTION',
  'TUYEN_SINH + IT_DATA',
  'Luu gia tri cac field tuy bien cua lead theo cau hinh P0-17.',
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
  'GATE_P0_18_DYNAMIC_LEAD_FORM',
  'P0-18 Dynamic Lead Form Enforcement',
  'GO_LIVE',
  'HEU_OS',
  'DYNAMIC_LEAD_FORM',
  'BGH + TUYEN_SINH + IT_DATA',
  'Kiem tra form tao lead doc dung P0-17, giu lai du lieu da nhap khi loi va khong cho field sai doi tuong.',
  'Chi duyet khi tao lead dung workspace, dung he/nganh va custom field co RLS/audit log.',
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
