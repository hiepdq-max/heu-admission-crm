-- Step 95 - P2-09 TTGDTX Department Workload Board.
-- Run after step94_ttgdtx_import_issue_resolution_p2_08.sql.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - No physical removal of business data is used.
-- - If rollback is needed, mark introduced P2-09 workload/control records inactive
--   through an approved corrective migration and keep audit evidence.
--
-- Purpose:
-- - Give each department a clean work board from P2-07/P2-08 issue tasks.
-- - Keep the actual resolution workflow in P2-08.
-- - Let BGH/Audit/department leads see overdue, critical and waiting approval work.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.department.task.read'),
    ('ttgdtx.department.task.manage')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA', 'ACCOUNTING', 'ACCOUNTING_LEAD', 'KHTC')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.department.task.read')
) as p(permission)
where r.code in ('BGH', 'AUDIT', 'PHAP_CHE', 'DAO_TAO', 'CTHSSV', 'TUYEN_SINH', 'TEAM_LEAD')
on conflict (role_id, permission) do nothing;

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
  (
    'ttgdtx.department.task.read',
    'TTGDTX',
    'Xem bang viec P2-09 theo phong ban',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + IT_DATA + AUDIT',
    'MEDIUM',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    72,
    true,
    'Chi doc bang viec theo phong ban tu P2-07/P2-08; khong thay the quyen xu ly hoac dong phieu.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.department.task.manage',
    'TTGDTX',
    'Dieu phoi bang viec P2-09 theo phong ban',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + IT_DATA + AUDIT',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    true,
    24,
    true,
    'Dieu phoi chi duoc thuc hien qua P2-08; P2-09 la man hinh tong hop/loc viec.',
    'DAT_TAM_THOI'
  )
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

create or replace view public.ttgdtx_department_issue_workload
with (security_invoker = true)
as
with task_departments as (
  select
    t.*,
    trim(dept.department_code) as department_code
  from public.ttgdtx_import_issue_task_board t
  cross join lateral regexp_split_to_table(
    replace(coalesce(t.owner_department, ''), '/', ' + '),
    '\s*\+\s*'
  ) as dept(department_code)
  where trim(dept.department_code) <> ''
),
latest_events as (
  select distinct on (e.task_id)
    e.task_id,
    e.event_type,
    e.event_type_label,
    e.actor_note,
    e.created_by_name,
    e.created_at
  from public.ttgdtx_import_issue_resolution_timeline e
  order by e.task_id, e.created_at desc
)
select
  td.department_code,
  case td.department_code
    when 'KHTC' then 'Ke hoach - Tai chinh'
    when 'ACCOUNTING' then 'Ke toan'
    when 'ACCOUNTING_LEAD' then 'Ke toan truong'
    when 'IT_DATA' then 'IT/Data'
    when 'AUDIT' then 'Audit/Kiem soat'
    when 'PHAP_CHE' then 'Phap che'
    when 'CTHSSV' then 'Cong tac HSSV'
    when 'DAO_TAO' then 'Dao tao'
    when 'TUYEN_SINH' then 'Tuyen sinh'
    when 'BGH' then 'Ban giam hieu'
    else td.department_code
  end as department_label,
  td.task_id,
  td.task_code,
  td.issue_code,
  td.issue_title,
  td.issue_category,
  td.issue_category_label,
  td.severity,
  td.severity_label,
  td.task_status,
  td.task_status_label,
  case
    when td.task_status in ('RESOLVED', 'CANCELLED') then 'CLOSED'
    when td.task_status = 'WAITING_APPROVAL' then 'WAITING_APPROVAL'
    when td.is_overdue then 'OVERDUE'
    when td.task_status in ('OPEN', 'WAITING_OWNER') then 'WAITING_OWNER'
    when td.task_status = 'IN_PROGRESS' then 'IN_PROGRESS'
    when td.task_status = 'ESCALATED' then 'ESCALATED'
    else 'OPEN'
  end as work_status_group,
  td.source_department,
  td.owner_department,
  td.report_to_department,
  td.requires_approval,
  td.sla_hours,
  td.due_at,
  td.is_overdue,
  td.default_fix_action,
  td.escalation_rule,
  td.check_message,
  td.fix_hint,
  td.resolution_note,
  td.evidence_url,
  td.batch_code,
  td.batch_name,
  td.admission_segment_id,
  td.segment_code,
  td.segment_name,
  le.event_type as latest_event_type,
  le.event_type_label as latest_event_type_label,
  le.actor_note as latest_actor_note,
  le.created_by_name as latest_event_by,
  le.created_at as latest_event_at,
  case
    when td.task_status in ('RESOLVED', 'CANCELLED') then 'Da dong, chi theo doi log.'
    when td.is_overdue then 'Qua han: can truong phong/owner xu ly ngay.'
    when td.task_status = 'WAITING_APPROVAL' then 'Dang cho nguoi co tham quyen duyet/dong.'
    when td.task_status = 'WAITING_OWNER' then 'Dang cho don vi phu trach bo sung.'
    when td.task_status = 'IN_PROGRESS' then 'Dang xu ly, can cap nhat minh chung neu co.'
    when td.task_status = 'ESCALATED' then 'Da bao cap tren, can theo doi den khi dong.'
    else 'Moi mo: can phan cong nguoi xu ly.'
  end as next_work_hint,
  case
    when td.severity = 'CRITICAL' then 100
    when td.is_overdue then 90
    when td.severity = 'ERROR' then 80
    when td.task_status = 'WAITING_APPROVAL' then 70
    when td.requires_approval then 60
    when td.severity = 'WARNING' then 40
    else 20
  end as priority_score,
  td.created_at,
  td.updated_at
from task_departments td
left join latest_events le on le.task_id = td.task_id;

grant select on public.ttgdtx_department_issue_workload to authenticated;

create or replace view public.ttgdtx_department_issue_workload_summary
with (security_invoker = true)
as
select
  department_code,
  department_label,
  count(*)::int as task_count,
  count(*) filter (where task_status not in ('RESOLVED', 'CANCELLED'))::int as open_count,
  count(*) filter (where work_status_group = 'WAITING_OWNER')::int as waiting_owner_count,
  count(*) filter (where work_status_group = 'IN_PROGRESS')::int as in_progress_count,
  count(*) filter (where work_status_group = 'WAITING_APPROVAL')::int as waiting_approval_count,
  count(*) filter (where is_overdue)::int as overdue_count,
  count(*) filter (where severity = 'CRITICAL')::int as critical_count,
  max(priority_score)::int as top_priority_score,
  min(due_at) filter (where task_status not in ('RESOLVED', 'CANCELLED')) as nearest_due_at
from public.ttgdtx_department_issue_workload
group by department_code, department_label;

grant select on public.ttgdtx_department_issue_workload_summary to authenticated;

insert into public.admission_segment_operation_steps (
  segment_id,
  step_code,
  step_name,
  step_group,
  owner_department,
  action_href,
  required_for_operation,
  control_note,
  sort_order,
  control_status
)
select
  s.id,
  'TTGDTX_DEPARTMENT_WORKLOAD_BOARD',
  'P2-09 Bang viec theo phong ban TTGDTX',
  'FINANCE',
  'KHTC + IT_DATA + AUDIT + OWNER_DEPARTMENTS',
  '/ttgdtx/import/workload',
  true,
  'P2-09 tong hop phieu loi P2-07/P2-08 theo phong ban, trang thai, qua han, nghiem trong va cho duyet.',
  71,
  'DAT_TAM_THOI'
from public.admission_segments s
where s.segment_code = 'TC9_TTGDTX_LINKED'
  and s.status = 'ACTIVE'
on conflict (segment_id, step_code) do update set
  step_name = excluded.step_name,
  step_group = excluded.step_group,
  owner_department = excluded.owner_department,
  action_href = excluded.action_href,
  required_for_operation = excluded.required_for_operation,
  control_note = excluded.control_note,
  sort_order = excluded.sort_order,
  control_status = excluded.control_status,
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
  'WF_P2_09_TTGDTX_DEPARTMENT_WORKLOAD',
  'P2-09 Bang viec theo phong ban TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Khi P2-07/P2-08 co phieu loi can dieu phoi cho dung phong ban xu ly.',
  'KHTC/IT_DATA/AUDIT',
  'KHTC + IT_DATA + AUDIT + OWNER_DEPARTMENTS',
  'TRUONG_PHONG',
  'BGH/AUDIT',
  'Bang viec theo phong ban, loc viec qua han, nghiem trong, dang cho duyet va dang xu ly.',
  'P2-09 chi dieu huong nhin viec; cap nhat trang thai van phai thuc hien tai P2-08 de giu log.',
  'Moi du lieu hien tren P2-09 lay tu P2-07/P2-08 va audit log da co.',
  2090,
  'DAT_TAM_THOI'
)
on conflict (workflow_code) do update set
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
  'P2_09_TTGDTX_DEPARTMENT_WORKLOAD',
  'P2-09 bang viec phieu loi TTGDTX theo phong ban',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_department_issue_workload; ttgdtx_department_issue_workload_summary',
  'TRANSACTION',
  'KHTC + IT_DATA + AUDIT',
  'SUPABASE',
  'RESTRICTED',
  true,
  'P2-09 chi la view tong hop. Muon thay doi trang thai phai qua function P2-08.',
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
  control_status
) values (
  'OWN_P2_09_TTGDTX_DEPARTMENT_WORKLOAD',
  'P2-09 Bang viec theo phong ban TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_09_TTGDTX_DEPARTMENT_WORKLOAD',
  'TTGDTX_DEPARTMENT_WORKLOAD',
  'ttgdtx_department_issue_workload',
  'KHTC + IT_DATA + AUDIT + OWNER_DEPARTMENTS',
  'OWNER_DEPARTMENTS',
  'TRUONG_PHONG',
  'BGH/AUDIT',
  'ROLE_AND_SCOPE',
  'P2-07/P2-08',
  'KHTC + IT_DATA + PHAP_CHE + CTHSSV + DAO_TAO + AUDIT',
  'Lay tu phieu loi, ghi chu xu ly, minh chung va lich su P2-08.',
  'Khong cap nhat truc tiep tu P2-09; moi dong viec phai truy ve P2-08 de xu ly co log.',
  24,
  'HIGH',
  'DAT_TAM_THOI'
)
on conflict (ownership_code) do update set
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
  'GATE_P2_09_TTGDTX_DEPARTMENT_WORKLOAD',
  'Gate P2-09: bang viec dung phong ban, khong xu ly sai tuyen',
  'SOP',
  'TTGDTX_DEPARTMENT_WORKLOAD',
  'P2-09-DEPARTMENT-WORKLOAD',
  'KHTC + IT_DATA + AUDIT',
  'Kiem tra viec duoc gom dung owner_department tu P2-07 va trang thai moi nhat tu P2-08.',
  'BGH/Audit dung P2-09 de nhin viec qua han/nghiem trong; cap nhat van phai qua P2-08.',
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
  decision_status = excluded.decision_status,
  updated_at = now();
