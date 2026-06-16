-- Step 53 - P0-14 Admission Workspace Operation Guard.
-- Run after step52_admission_workspace_selector.sql.
-- Purpose: prevent create/import/update lead operations from being written
-- without a valid admission workspace. UI filtering is helpful, but database
-- policies must also block cross-workspace writes.

create or replace function public.can_write_admission_workspace_lead(
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
    lead_segment_id is not null
    and public.can_use_admission_workspace(lead_segment_id)
    and public.can_access_business_scope(lead_segment_id, lead_partner_id)
    and (
      public.is_admin()
      or public.has_permission('leads.write_all')
      or public.has_permission('leads.write_team')
      or public.has_permission('leads.write_assigned')
    )
$$;

grant execute on function public.can_write_admission_workspace_lead(uuid, uuid)
to authenticated;

drop policy if exists "leads_insert_by_permission" on public.leads;
create policy "leads_insert_by_permission"
on public.leads for insert
to authenticated
with check (
  public.can_write_admission_workspace_lead(admission_segment_id, partner_id)
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
  and public.can_write_admission_workspace_lead(admission_segment_id, partner_id)
);

create or replace view public.current_user_admission_workspace_guard
with (security_invoker = true)
as
with preference as (
  select p.active_segment_id
  from public.user_admission_workspace_preferences p
  where p.user_id = auth.uid()
    and p.status = 'ACTIVE'
  limit 1
),
workspaces as (
  select *
  from public.current_user_admission_workspaces
),
summary as (
  select
    count(*)::int as allowed_workspace_count,
    count(*) filter (where is_active)::int as active_workspace_count
  from workspaces
),
active_workspace as (
  select w.*
  from workspaces w
  join preference p on p.active_segment_id = w.segment_id
  limit 1
)
select
  auth.uid() as user_id,
  (select active_segment_id from preference) as active_segment_id,
  aw.segment_code as active_segment_code,
  aw.segment_name as active_segment_name,
  aw.program_group as active_program_group,
  coalesce(s.allowed_workspace_count, 0) as allowed_workspace_count,
  coalesce(s.active_workspace_count, 0) as active_workspace_count,
  (
    (select active_segment_id from preference) is not null
    and aw.segment_id is not null
  ) as has_valid_active_workspace,
  case
    when coalesce(s.allowed_workspace_count, 0) = 0 then 'NO_WORKSPACE_ASSIGNED'
    when (select active_segment_id from preference) is null then 'NEEDS_WORKSPACE_SELECTION'
    when aw.segment_id is null then 'ACTIVE_WORKSPACE_NOT_ALLOWED'
    else 'READY'
  end as guard_status,
  case
    when coalesce(s.allowed_workspace_count, 0) = 0
      then 'User chua duoc phan doi tuong tuyen sinh nen khong duoc tao/import lead.'
    when (select active_segment_id from preference) is null
      then 'Can chon mot doi tuong tuyen sinh truoc khi tao/import lead.'
    when aw.segment_id is null
      then 'Doi tuong dang chon khong con nam trong pham vi duoc phan.'
    else 'Da san sang thao tac lead theo dung workspace.'
  end as guard_message
from summary s
left join active_workspace aw on true;

grant select on public.current_user_admission_workspace_guard to authenticated;

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
  'WF_P0_14_WORKSPACE_GUARDED_LEAD_WRITE',
  'Tao/import lead theo workspace bat buoc',
  'M05_ADMISSION_CRM',
  'User tao lead moi hoac import danh sach lead.',
  'TUYEN_SINH',
  'TUYEN_SINH + IT_DATA',
  'TRUONG_PHONG_TUYEN_SINH',
  'BGH',
  'Lead duoc gan dung admission_segment_id, dung doi tac neu co scope, va ghi nguoi cap nhat.',
  'Lead sau khi du dieu kien se ban giao CTHSSV/KHTC theo quy trinh rieng.',
  'Moi tao/import/update lead phai qua RLS, scope, workspace guard va audit log.',
  514,
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

insert into public.heu_os_approval_matrix (
  approval_code,
  module_code,
  workflow_code,
  decision_name,
  decision_level,
  maker_role,
  checker_role,
  approver_role,
  required_evidence,
  blocking_rule,
  sla_hours,
  control_status
) values (
  'APPR_P0_14_WORKSPACE_GUARD_GO_LIVE',
  'M05_ADMISSION_CRM',
  'WF_P0_14_WORKSPACE_GUARDED_LEAD_WRITE',
  'Phe duyet khoa thao tac lead theo workspace',
  'SYSTEM',
  'IT_DATA',
  'TRUONG_PHONG_TUYEN_SINH',
  'BGH',
  'Can co SQL guard, UI guard, test tao lead, test import CSV va test user khong dung scope.',
  'Khong cho production neu user co the tao/import lead khi chua chon doi tuong hoac ghi sang doi tuong ngoai pham vi.',
  24,
  'DAT_TAM_THOI'
) on conflict (approval_code) do update set
  module_code = excluded.module_code,
  workflow_code = excluded.workflow_code,
  decision_name = excluded.decision_name,
  decision_level = excluded.decision_level,
  maker_role = excluded.maker_role,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  required_evidence = excluded.required_evidence,
  blocking_rule = excluded.blocking_rule,
  sla_hours = excluded.sla_hours,
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
  'DATA_P0_14_ADMISSION_WORKSPACE_GUARD',
  'Admission Workspace Operation Guard',
  'M05_ADMISSION_CRM',
  'current_user_admission_workspace_guard',
  'REPORT_VIEW',
  'IT_DATA + TUYEN_SINH',
  'HEU_OS',
  'INTERNAL',
  true,
  'Chi doc trang thai khoa workspace; moi thay doi scope/workspace phai qua user scope va audit log.',
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
  'RISK_P0_14_CROSS_WORKSPACE_LEAD_WRITE',
  'Tao/import lead sai doi tuong tuyen sinh',
  'M05_ADMISSION_CRM',
  'DATA_SCOPE',
  'CRITICAL',
  'TUYEN_SINH + IT_DATA',
  'Lead HOU, TTGDTX, ngan han hoac tuyen sinh tai cho bi ghi nham workspace lam sai bao cao, COM, ho so va ban giao.',
  'Bat buoc admission_segment_id, can_use_admission_workspace va can_write_admission_workspace_lead truoc moi insert/update.',
  'Neu phat hien lead sai workspace: khoa user, dung import, audit log va yeu cau Truong phong/IT_DATA xu ly chuyen dung doi tuong.',
  'So lead thieu/sai admission_segment_id',
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
  'NAV_WORKSPACE_GUARD',
  'Khoa workspace P0-14',
  'ADMISSION',
  'M05_ADMISSION_CRM',
  '/leads',
  'Kiem soat tao, import va sua lead theo dung doi tuong tuyen sinh dang chon.',
  'TUYEN_SINH + IT_DATA',
  'Kiem tra guard',
  35,
  true,
  'Neu chua chon workspace thi khong duoc tao/import lead; CSV khong duoc ghi khac doi tuong dang chon.',
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
  'CURRENT_USER_ADMISSION_WORKSPACE_GUARD',
  'Current User Admission Workspace Guard',
  'M05_ADMISSION_CRM',
  'REPORT_VIEW',
  'IT_DATA',
  'View cho biet user hien tai co workspace hop le de tao/import lead hay chua.',
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
  'GATE_P0_14_ADMISSION_WORKSPACE_OPERATION_GUARD',
  'P0-14 Admission Workspace Operation Guard',
  'GO_LIVE',
  'HEU_OS',
  'ADMISSION_WORKSPACE_OPERATION_GUARD',
  'BGH + TRUONG_PHONG_TUYEN_SINH + IT_DATA',
  'Kiem tra UI va SQL deu chan tao/import lead khi chua chon workspace hoac ghi sai doi tuong.',
  'Chi phe duyet khi lead moi/import/update khong the vuot scope doi tuong, doi tac va audit log ghi du.',
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
