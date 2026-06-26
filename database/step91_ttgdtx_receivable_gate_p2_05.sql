-- Step 91 - P2-05 TTGDTX Receivable Gate.
-- Run after step90_ttgdtx_student_receivables.sql.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - No physical removal of business data is used.
-- - If rollback is needed, mark introduced P2-05 workflow/permission records
--   inactive through an approved corrective migration and keep audit evidence.
--
-- Purpose:
-- - Register P2-05 as the controlled gate before creating TTGDTX receivables.
-- - P2-05 is read-only/check-only. It does not create receivables, collect cash,
--   issue invoices, or approve partner payment.

insert into public.role_permissions (role_id, permission)
select r.id, 'ttgdtx.receivable.gate.read'
from public.roles r
where r.code in (
  'ADMIN',
  'BGH',
  'IT_DATA',
  'ACCOUNTING',
  'ACCOUNTING_LEAD',
  'KHTC',
  'ADMISSION_HEAD',
  'TEAM_LEAD',
  'COUNSELOR',
  'CTHSSV_LEAD',
  'LEGAL',
  'AUDIT'
)
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
  ai_allowed,
  control_note,
  control_status
) values (
  'ttgdtx.receivable.gate.read',
  'TTGDTX',
  'Xem gate P2-05 điều kiện tạo công nợ TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'KHTC + TUYEN_SINH + CTHSSV',
  'HIGH',
  'ROLE_AND_SCOPE',
  true,
  false,
  true,
  true,
  'P2-05 chỉ kiểm tra điều kiện tạo công nợ TTGDTX; không tự tạo công nợ, không xác nhận thu tiền và không chi trả đối tác.',
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
  ai_allowed = excluded.ai_allowed,
  control_note = excluded.control_note,
  control_status = excluded.control_status,
  updated_at = now();

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
  'TTGDTX_RECEIVABLE_GATE',
  'P2-05 Gate tạo công nợ TTGDTX',
  'FINANCE',
  'KHTC + TUYEN_SINH + CTHSSV',
  '/ttgdtx/gate',
  true,
  'P2-05 kiểm tra từng lead trước khi tạo công nợ: đúng TTGDTX, đúng hệ/ngành, đủ trạng thái, có P2-02 READY và chưa trùng công nợ.',
  65,
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
  'WF_P2_05_TTGDTX_RECEIVABLE_GATE',
  'P2-05 Gate điều kiện tạo công nợ TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Trước khi kế toán tạo công nợ học phí TTGDTX ở P2-03.',
  'KHTC/TUYEN_SINH/CTHSSV',
  'KHTC + TUYEN_SINH + CTHSSV',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/KE_TOAN_TRUONG',
  'Lead đạt hoặc bị chặn với lý do cụ thể: trạng thái, TTGDTX, hệ/ngành, P2-02 hoặc trùng công nợ.',
  'Chỉ lead đạt P2-05 mới được chuyển sang P2-03 để tạo công nợ thật.',
  'P2-05 không sửa dữ liệu; mọi tạo công nợ vẫn phải qua function P2-03 và audit log.',
  2050,
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
  'P2_05_TTGDTX_RECEIVABLE_GATE_VIEW',
  'P2-05 view điều kiện tạo công nợ TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_receivable_candidate_leads; ttgdtx_student_receivable_readiness',
  'REPORT_VIEW',
  'KHTC + IT_DATA',
  'SUPABASE',
  'CONFIDENTIAL',
  true,
  'View chỉ dùng để kiểm tra đủ/thiếu; không được dùng thay function tạo công nợ P2-03.',
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
  'OWN_P2_05_TTGDTX_RECEIVABLE_GATE',
  'P2-05 Gate điều kiện tạo công nợ TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_05_TTGDTX_RECEIVABLE_GATE',
  'TTGDTX_RECEIVABLE_GATE',
  'ttgdtx_receivable_candidate_leads',
  'KHTC + TUYEN_SINH + CTHSSV',
  'COUNSELOR/CTHSSV/KHTC',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/KE_TOAN_TRUONG',
  'ROLE_AND_SCOPE',
  'TUYEN_SINH/CTHSSV',
  'KHTC',
  'Lead đúng đối tượng TTGDTX, đúng hệ/ngành, đủ trạng thái, hợp đồng P2-01 ACTIVE, chính sách P2-02 READY và chưa có công nợ trùng.',
  'P2-05 chỉ kiểm tra; tạo công nợ thật vẫn phải đi qua P2-03 và ghi audit log.',
  24,
  'CRITICAL',
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
  'GATE_P2_05_TTGDTX_RECEIVABLE_GATE',
  'Gate P2-05: kiểm tra điều kiện trước khi tạo công nợ TTGDTX',
  'FINANCE',
  'TTGDTX_RECEIVABLE_GATE',
  'TC9_TTGDTX_LINKED',
  'KHTC + TUYEN_SINH + CTHSSV',
  'Kiểm tra từng lead: trạng thái, đối tác TTGDTX, hệ/ngành, chính sách P2-02 READY và chưa trùng công nợ.',
  'Chỉ cho phép tạo công nợ thật ở P2-03 khi P2-05 đạt; ngoại lệ phải có người duyệt và audit log.',
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
