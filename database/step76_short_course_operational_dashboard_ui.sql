-- P1-12: Short Course Operational Dashboard UI
-- Run after step75_heu_os_search_engine.sql.
-- Purpose:
-- - Register the /short-course dashboard as a controlled HEU OS operating screen.
-- - Make P1-12 visible in Master Control, HEU OS Map and Search.
-- - Confirm the dashboard reads from P1-10 views and does not write operational data.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('short_course.dashboard.read'),
    ('short_course.exception.read')
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
  'WF_P1_12_SHORT_OPERATIONAL_DASHBOARD_UI',
  'P1-12 Dashboard vận hành ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'BGH/trưởng phòng cần xem nhanh tình trạng học viên, lớp, điểm danh, chính sách, tài chính và exception.',
  'BGH/TRUONG_PHONG',
  'BGH + IT_DATA',
  'AUDIT',
  'BGH',
  'Màn hình /short-course hiển thị KPI và exception từ dữ liệu thật.',
  'Nếu phát hiện lỗi, người phụ trách mở module gốc để xử lý, không sửa trực tiếp từ dashboard.',
  'Dashboard chỉ đọc; mọi thao tác xử lý phải quay về bảng/module gốc có audit log.',
  930,
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
  'APPROVE_P1_12_SHORT_DASHBOARD_GO_LIVE',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_12_SHORT_OPERATIONAL_DASHBOARD_UI',
  'Duyệt dashboard vận hành ngắn hạn lên production',
  'SYSTEM',
  'IT_DATA',
  'AUDIT',
  'BGH',
  'Ảnh màn hình /short-course, danh sách nguồn view P1-10, kiểm tra phân quyền và phạm vi user.',
  'Không go-live nếu dashboard đọc dữ liệu ngoài phạm vi user hoặc không có nguồn view được kiểm soát.',
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
) values
  (
    'SHORT_COURSE_OPERATIONAL_DASHBOARD_UI',
    'UI Dashboard vận hành ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    '/short-course',
    'REPORT_VIEW',
    'BGH + IT_DATA',
    'NEXT_APP',
    'RESTRICTED',
    true,
    'UI chỉ được đọc từ các view P1-10; không tự cập nhật dữ liệu nghiệp vụ.',
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_COURSE_DASHBOARD_SOURCE_VIEWS',
    'Nguồn dữ liệu dashboard ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_course_dashboard_kpis,short_course_data_foundation_summary,short_course_exception_summary,short_course_exception_register',
    'REPORT_VIEW',
    'IT_DATA',
    'SUPABASE',
    'RESTRICTED',
    true,
    'Chỉ thêm KPI mới khi có source view, owner và rule phân quyền rõ ràng.',
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
    'RISK_P1_12_DASHBOARD_WRONG_SCOPE',
    'Dashboard ngắn hạn hiển thị sai phạm vi user',
    'M11_SHORT_COURSE_ERP',
    'DATA_SECURITY',
    'CRITICAL',
    'IT_DATA + AUDIT',
    'Nếu dashboard bỏ qua phạm vi đối tượng tuyển sinh, user có thể thấy học viên/lớp/exception không thuộc quyền.',
    'Dashboard phải đọc từ view có RLS/security_invoker và filter scope ở source view.',
    'Nếu phát hiện sai phạm vi, tạm tắt route /short-course và kiểm tra RLS/view nguồn.',
    'Số phản ánh dashboard vượt quyền.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_12_DASHBOARD_BECOMES_WORKAROUND',
    'Dashboard bị dùng để xử lý thay module gốc',
    'M11_SHORT_COURSE_ERP',
    'OPERATION',
    'HIGH',
    'BGH + IT_DATA',
    'Nếu người dùng sửa/xử lý trực tiếp từ dashboard, hệ thống dễ mất audit trail và sai quy trình duyệt.',
    'P1-12 chỉ đọc và dẫn về module/search; thao tác nghiệp vụ phải qua module gốc.',
    'Nếu cần nút xử lý, phải tạo workflow request/approval gate riêng trước khi mở.',
    'Số thao tác xử lý không qua module gốc.',
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
  'short_course_operational_dashboard_ui',
  'Dashboard vận hành ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'REPORT_VIEW',
  'BGH + IT_DATA',
  'Màn hình tổng hợp KPI, exception và sức khỏe vận hành ngắn hạn.',
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
    ('metric_value', 'Giá trị KPI', 'numeric', true, false, false, true, 'Đọc từ short_course_dashboard_kpis.', 'Không nhập tay.'),
    ('exception_count', 'Số exception', 'int', true, false, false, true, 'Đọc từ short_course_exception_summary.', 'Dùng ưu tiên xử lý.'),
    ('action_hint', 'Gợi ý xử lý', 'text', false, false, false, true, 'Đọc từ short_course_exception_register.', 'Chỉ gợi ý, không tự xử lý.'),
    ('scope_rule', 'Quy tắc phạm vi', 'text', true, false, true, true, 'Phải theo RLS và admission segment scope.', 'Không hiển thị dữ liệu ngoài quyền.')
) as f(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, validation_rule, note)
where t.table_code = 'short_course_operational_dashboard_ui'
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
  'OWN_P1_12_SHORT_OPERATIONAL_DASHBOARD_UI',
  'P1-12 Dashboard vận hành ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_12_SHORT_OPERATIONAL_DASHBOARD_UI',
  'REPORT_UI',
  'short_course_dashboard_kpis,short_course_data_foundation_summary,short_course_exception_summary,short_course_exception_register',
  'BGH + IT_DATA',
  'IT_DATA',
  'AUDIT',
  'BGH',
  'ROLE_AND_SCOPE',
  'P1_10_EXCEPTION_REGISTER',
  'BGH + OWNER_DEPARTMENTS',
  'Ảnh dashboard, danh sách KPI/view nguồn và kiểm tra phân quyền user.',
  'Dashboard chỉ đọc; xử lý lỗi phải mở module gốc để có audit log.',
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
  'GATE_P1_12_SHORT_OPERATIONAL_DASHBOARD_UI',
  'Gate P1-12: dashboard ngắn hạn được phép go-live',
  'GO_LIVE',
  'ROUTE',
  '/short-course',
  'BGH + IT_DATA + AUDIT',
  'AUDIT kiểm tra dashboard chỉ đọc từ view P1-10 và không vượt phạm vi user.',
  'BGH xác nhận dashboard dùng để giám sát, không thay thế quy trình xử lý/duyệt.',
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
  'NAV_P1_12_SHORT_OPERATIONAL_DASHBOARD_UI',
  'P1-12 Dashboard vận hành ngắn hạn',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/short-course',
  'Màn hình vận hành ngắn hạn đọc KPI và exception từ dữ liệu thật.',
  'BGH + IT_DATA',
  'Xem tình trạng vận hành và mở đúng nơi xử lý',
  130,
  true,
  'Dashboard phải chỉ đọc, đúng phạm vi user và không thay thế module xử lý gốc.',
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
