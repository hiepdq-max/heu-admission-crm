-- P1-13: Short Course Search + Detail Drilldown
-- Run after step76_short_course_operational_dashboard_ui.sql.
-- Purpose:
-- - Register /short-course/drilldown as a controlled read-only operating screen.
-- - Make KPI/search results open the correct short-course operational list.
-- - Keep drilldown scoped by admission workspace and user permissions.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('short_course.drilldown.read')
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
  'WF_P1_13_SHORT_COURSE_DRILLDOWN',
  'P1-13 Drilldown chi tiết ERP ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'User bấm KPI/search để mở đúng danh sách học viên, lớp, ghi danh, điểm danh, BHXH, công nợ, thanh toán hoặc rủi ro.',
  'BGH/TRUONG_PHONG/NHAN_VIEN_DUOC_PHAN_QUYEN',
  'IT_DATA + OWNER_DEPARTMENTS',
  'AUDIT',
  'BGH',
  'Màn hình /short-course/drilldown hiển thị danh sách chi tiết theo đúng phạm vi P0-13.',
  'Drilldown chỉ dẫn người dùng về module gốc; không tự sửa dữ liệu và không bỏ qua maker/checker/approver.',
  'Mọi thao tác nghiệp vụ sau drilldown vẫn phải qua bảng/function có audit log; drilldown chỉ đọc.',
  940,
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
  'APPROVE_P1_13_SHORT_DRILLDOWN_GO_LIVE',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_13_SHORT_COURSE_DRILLDOWN',
  'Duyệt drilldown ERP ngắn hạn lên production',
  'SYSTEM',
  'IT_DATA',
  'AUDIT',
  'BGH',
  'Ảnh màn hình drilldown, kiểm tra KPI click-through, kiểm tra search mở đúng danh sách và kiểm tra phạm vi user.',
  'Không go-live nếu drilldown hiển thị dữ liệu ngoài workspace hoặc nút mở nhầm module.',
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
  'SHORT_COURSE_DRILLDOWN_UI',
  'UI drilldown ERP ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  '/short-course/drilldown; short_student_master; short_class_master; short_enrollments; short_attendance_sessions; short_bhxh_policy_cases; short_finance_invoices; short_payments; short_risk_alerts',
  'REPORT_VIEW',
  'IT_DATA + OWNER_DEPARTMENTS',
  'NEXT_APP + SUPABASE',
  'RESTRICTED',
  true,
  'Drilldown chỉ đọc dữ liệu đã qua RLS/phạm vi; không tự cập nhật dữ liệu gốc.',
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
    'RISK_P1_13_DRILLDOWN_WRONG_SCOPE',
    'Drilldown ERP ngắn hạn hiển thị sai phạm vi',
    'M11_SHORT_COURSE_ERP',
    'DATA_SECURITY',
    'CRITICAL',
    'IT_DATA + AUDIT',
    'Nếu drilldown không đi theo workspace P0-13, user có thể xem dữ liệu của đối tượng tuyển sinh khác.',
    'Mọi truy vấn drilldown phải lọc theo admission segment scope hoặc quan hệ lớp/ghi danh nằm trong scope.',
    'Tạm tắt route /short-course/drilldown nếu phát hiện vượt quyền và kiểm tra RLS/function scope.',
    'Số phản ánh drilldown vượt quyền.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_13_DRILLDOWN_NO_ACTION_PATH',
    'Drilldown có dữ liệu nhưng không chỉ đường xử lý',
    'M11_SHORT_COURSE_ERP',
    'OPERATION',
    'MEDIUM',
    'OWNER_DEPARTMENTS + IT_DATA',
    'Nếu người dùng nhìn thấy lỗi nhưng không biết mở đâu xử lý, hệ thống vẫn phụ thuộc trí nhớ cá nhân.',
    'Mỗi nhóm drilldown phải có nút hoặc chỉ dẫn mở module gốc tương ứng.',
    'Bổ sung action link trước khi mở rộng thêm bảng nghiệp vụ.',
    'Tỷ lệ dòng drilldown không có action.',
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
  'short_course_drilldown_ui',
  'Drilldown ERP ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'REPORT_VIEW',
  'IT_DATA + OWNER_DEPARTMENTS',
  'Màn hình đọc chi tiết theo nhóm nghiệp vụ từ dashboard/search.',
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
    ('type', 'Nhóm drilldown', 'text', true, false, false, true, 'students/classes/enrollments/attendance/bhxh/invoices/payments/risks.', 'Điều khiển nguồn dữ liệu được đọc.'),
    ('segment', 'Phạm vi đối tượng tuyển sinh', 'uuid', false, false, true, true, 'Phải thuộc scope user hoặc ADMIN/BGH.', 'Đi theo P0-13 workspace.'),
    ('entityId', 'ID dòng cần mở', 'uuid', false, false, true, true, 'Chỉ lọc một dòng trong bảng gốc.', 'Không tự cấp quyền nếu RLS không cho đọc.'),
    ('q', 'Từ khóa lọc', 'text', false, false, false, true, 'Chỉ dùng lọc hiển thị.', 'Không thay đổi dữ liệu.'),
    ('status', 'Trạng thái/mức độ lọc', 'text', false, false, false, true, 'Lọc theo status/severity.', 'Ví dụ PENDING, CRITICAL.')
) as f(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, validation_rule, note)
where t.table_code = 'short_course_drilldown_ui'
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
  'OWN_P1_13_SHORT_COURSE_DRILLDOWN',
  'P1-13 Drilldown ERP ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_13_SHORT_COURSE_DRILLDOWN',
  'REPORT_UI',
  'short_student_master,short_class_master,short_enrollments,short_attendance_sessions,short_bhxh_policy_cases,short_finance_invoices,short_payments,short_risk_alerts',
  'IT_DATA + OWNER_DEPARTMENTS',
  'IT_DATA',
  'AUDIT',
  'BGH',
  'ROLE_AND_SCOPE',
  'P1_12_DASHBOARD_OR_P1_11_SEARCH',
  'OWNER_MODULES',
  'Ảnh màn hình drilldown, kết quả click từ KPI/search và xác nhận user thường không thấy dữ liệu ngoài phạm vi.',
  'Drilldown chỉ đọc; xử lý nghiệp vụ phải quay về module/function gốc có audit log.',
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
  'GATE_P1_13_SHORT_COURSE_DRILLDOWN',
  'Gate P1-13: drilldown ngắn hạn được phép go-live',
  'GO_LIVE',
  'ROUTE',
  '/short-course/drilldown',
  'BGH + IT_DATA + AUDIT',
  'AUDIT kiểm tra drilldown chỉ đọc, đúng phạm vi, có action path và không tự sửa dữ liệu.',
  'BGH xác nhận drilldown dùng để tìm đúng dòng xử lý, không thay quy trình duyệt.',
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
  'NAV_P1_13_SHORT_COURSE_DRILLDOWN',
  'P1-13 Drilldown chi tiết ERP ngắn hạn',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/short-course/drilldown',
  'Mở danh sách chi tiết từ dashboard/search: học viên, lớp, ghi danh, điểm danh, BHXH, công nợ, thanh toán và rủi ro.',
  'IT_DATA + OWNER_DEPARTMENTS',
  'Bấm từ KPI/search để mở đúng danh sách cần xử lý',
  132,
  true,
  'Drilldown phải đi theo workspace P0-13, chỉ đọc và có đường dẫn xử lý tiếp.',
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
