-- P1-14: Short Course Action Center
-- Run after step77_short_course_drilldown_navigation.sql.
-- Purpose:
-- - Register /short-course/actions as the controlled action center for short-course ERP.
-- - Convert dashboard/drilldown signals into owner-based work queues.
-- - Keep the screen read-only: it guides users to the source module, not bypassing approval/audit.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('short_course.action_center.read')
) as p(permission)
where r.code in (
  'ADMIN',
  'BGH',
  'IT_DATA',
  'AUDIT',
  'DAO_TAO',
  'DAO_TAO_LEAD',
  'CTHSSV',
  'CTHSSV_LEAD',
  'KHTC',
  'ACCOUNTING',
  'ACCOUNTING_LEAD'
)
on conflict (role_id, permission) do nothing;

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
  'WF_P1_14_SHORT_ACTION_CENTER',
  'P1-14 Action Center ERP ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'Dashboard/drilldown phát hiện việc cần xử lý trong chuỗi học viên, lớp, ghi danh, điểm danh, BHXH, tài chính, thanh toán hoặc rủi ro.',
  'TRUONG_PHONG/NHAN_VIEN_DUOC_PHAN_QUYEN',
  'OWNER_DEPARTMENTS + IT_DATA',
  'AUDIT',
  'BGH',
  'Danh sách việc mở có priority, owner, lý do và nút mở đúng nơi xử lý.',
  'Action Center chỉ điều phối; xử lý nghiệp vụ phải quay về module/function gốc có phân quyền và audit log.',
  'Không được ghi dữ liệu trực tiếp từ Action Center nếu chưa có workflow request/approval gate riêng.',
  950,
  'DAT_TAM_THOI'
)
on conflict (workflow_code) do update
set workflow_name = excluded.workflow_name,
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
  'APPROVE_P1_14_SHORT_ACTION_CENTER_GO_LIVE',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_14_SHORT_ACTION_CENTER',
  'Duyệt Action Center ERP ngắn hạn lên production',
  'SYSTEM',
  'IT_DATA',
  'AUDIT',
  'BGH',
  'Ảnh màn hình /short-course/actions, kiểm tra lọc owner/priority, kiểm tra nút mở đúng nguồn và kiểm tra phạm vi P0-13.',
  'Không go-live nếu Action Center tự sửa dữ liệu, vượt phạm vi user hoặc chỉ việc sai owner.',
  72,
  'DAT_TAM_THOI'
)
on conflict (approval_code) do update
set module_code = excluded.module_code,
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
  'SHORT_COURSE_ACTION_CENTER_UI',
  'UI Action Center ERP ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  '/short-course/actions; short_student_master; short_class_master; short_enrollments; short_attendance_sessions; short_bhxh_policy_cases; short_finance_invoices; short_payments; short_risk_alerts',
  'REPORT_VIEW',
  'OWNER_DEPARTMENTS + IT_DATA',
  'NEXT_APP + SUPABASE',
  'RESTRICTED',
  true,
  'Action Center chỉ đọc và điều hướng. Muốn chuyển sang xử lý tự động phải thêm workflow request, approval gate và audit rule riêng.',
  'DAT_TAM_THOI'
)
on conflict (data_code) do update
set data_name = excluded.data_name,
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
) values
  (
    'RISK_P1_14_ACTION_CENTER_WRONG_OWNER',
    'Action Center giao việc sai owner',
    'M11_SHORT_COURSE_ERP',
    'OPERATION',
    'HIGH',
    'IT_DATA + OWNER_DEPARTMENTS',
    'Nếu việc được gán sai phòng/owner, hệ thống làm tăng nhiễu vận hành và người dùng mất niềm tin vào dashboard.',
    'Mỗi nhóm task phải có owner cố định theo SOP: CTHSSV, DAO_TAO, KHTC, PHAP_CHE, AUDIT hoặc BGH.',
    'Nếu owner sai, sửa rule map task trước khi mở chức năng ghi/duyệt.',
    'Số task bị phản ánh sai owner.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_14_ACTION_CENTER_BYPASS_APPROVAL',
    'Action Center bị dùng để bỏ qua quy trình duyệt',
    'M11_SHORT_COURSE_ERP',
    'GOVERNANCE',
    'CRITICAL',
    'BGH + AUDIT + IT_DATA',
    'Nếu Action Center có nút sửa trực tiếp khi chưa có workflow/approval, hệ thống mất kiểm soát maker-checker-approver.',
    'P1-14 chỉ đọc và điều hướng; mọi nút xử lý ghi dữ liệu phải được thiết kế ở P1 sau với workflow request engine.',
    'Tạm tắt chức năng ghi nếu phát hiện thao tác không có audit log hoặc approval gate.',
    'Số thao tác ghi phát sinh từ route Action Center.',
    'DAT_TAM_THOI'
  )
on conflict (risk_code) do update
set risk_name = excluded.risk_name,
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
  'short_course_action_center_ui',
  'Action Center ERP ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'REPORT_VIEW',
  'OWNER_DEPARTMENTS + IT_DATA',
  'Màn hình gom việc cần xử lý từ dữ liệu thật, theo priority và owner.',
  'RESTRICTED',
  true,
  'DAT_TAM_THOI'
)
on conflict (table_code) do update
set table_name = excluded.table_name,
    module_code = excluded.module_code,
    table_type = excluded.table_type,
    data_owner_department = excluded.data_owner_department,
    purpose = excluded.purpose,
    sensitivity_level = excluded.sensitivity_level,
    ai_allowed = excluded.ai_allowed,
    control_status = excluded.control_status,
    updated_at = now();

insert into public.data_dictionary_fields (
  table_id,
  field_code,
  field_name,
  data_type,
  is_required,
  is_unique,
  is_sensitive,
  ai_allowed,
  validation_rule,
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
  f.validation_rule,
  f.note,
  'DAT_TAM_THOI'
from public.data_dictionary_tables t
cross join (
  values
    ('taskCode', 'Mã việc', 'text', true, false, false, true, 'Sinh từ nguồn dữ liệu và loại việc.', 'Chỉ dùng hiển thị/tra cứu.'),
    ('priority', 'Mức ưu tiên', 'text', true, false, false, true, 'CRITICAL/HIGH/MEDIUM/LOW.', 'Không phải quyết định pháp lý.'),
    ('owner', 'Bộ phận xử lý chính', 'text', true, false, false, true, 'Phải theo SOP/process ownership.', 'Dùng để lọc việc theo phòng.'),
    ('reason', 'Lý do sinh việc', 'text', true, false, false, true, 'Phải chỉ đúng chỗ sai hoặc điều kiện còn thiếu.', 'Không bắt người dùng nhập lại phần đúng.'),
    ('actionHref', 'Đường dẫn xử lý', 'text', true, false, true, true, 'Chỉ là đường dẫn nội bộ tới drilldown/module gốc.', 'Không ghi dữ liệu trực tiếp.')
) as f(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, validation_rule, note)
where t.table_code = 'short_course_action_center_ui'
on conflict (table_id, field_code) do update
set field_name = excluded.field_name,
    data_type = excluded.data_type,
    is_required = excluded.is_required,
    is_unique = excluded.is_unique,
    is_sensitive = excluded.is_sensitive,
    ai_allowed = excluded.ai_allowed,
    validation_rule = excluded.validation_rule,
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
  control_status
) values (
  'OWN_P1_14_SHORT_ACTION_CENTER',
  'P1-14 Action Center ERP ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_14_SHORT_ACTION_CENTER',
  'REPORT_UI',
  'short_student_master,short_class_master,short_enrollments,short_attendance_sessions,short_bhxh_policy_cases,short_finance_invoices,short_payments,short_risk_alerts',
  'OWNER_DEPARTMENTS + IT_DATA',
  'IT_DATA',
  'AUDIT',
  'BGH',
  'ROLE_AND_SCOPE',
  'P1_12_DASHBOARD + P1_13_DRILLDOWN',
  'OWNER_MODULES',
  'Ảnh màn hình Action Center, danh sách rule sinh task, kiểm tra owner/priority và kiểm tra user thường không thấy dữ liệu ngoài scope.',
  'Action Center chỉ đọc; mọi xử lý ghi dữ liệu phải quay về module/function gốc có audit log.',
  72,
  'HIGH',
  'DAT_TAM_THOI'
)
on conflict (ownership_code) do update
set process_name = excluded.process_name,
    workflow_code = excluded.workflow_code,
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
  decision_status,
  record_status
) values (
  'GATE_P1_14_SHORT_ACTION_CENTER',
  'Gate P1-14: Action Center ngắn hạn được phép go-live',
  'GO_LIVE',
  'ROUTE',
  '/short-course/actions',
  'BGH + IT_DATA + AUDIT',
  'AUDIT kiểm tra Action Center chỉ đọc, đúng scope, đúng owner và không bypass approval.',
  'BGH xác nhận Action Center dùng để điều phối việc, không thay thế quy trình xử lý/duyệt.',
  'DRAFT',
  'ACTIVE'::public.record_status
)
on conflict (gate_code) do update
set gate_name = excluded.gate_name,
    gate_type = excluded.gate_type,
    entity_type = excluded.entity_type,
    entity_code = excluded.entity_code,
    owner_department = excluded.owner_department,
    checker_note = excluded.checker_note,
    approver_note = excluded.approver_note,
    decision_status = excluded.decision_status,
    record_status = excluded.record_status,
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
  'NAV_P1_14_SHORT_ACTION_CENTER',
  'P1-14 Action Center ERP ngắn hạn',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/short-course/actions',
  'Trung tâm gom việc cần xử lý theo priority, owner và dữ liệu nguồn trong ERP ngắn hạn.',
  'OWNER_DEPARTMENTS + IT_DATA',
  'Mở việc cần xử lý và đi đúng module nguồn',
  134,
  true,
  'Action Center phải đúng phạm vi P0-13, chỉ đọc và không bypass maker-checker-approver.',
  'DAT_TAM_THOI'
)
on conflict (node_code) do update
set node_name = excluded.node_name,
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
