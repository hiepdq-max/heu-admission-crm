-- Step 84 - P1-20 Short Course Controlled Intake.
-- Run after step83_search_workspace_scope.sql.
--
-- Purpose:
-- - Register the real-data intake screen for short-course ERP.
-- - P1-20 does not bypass database rules. It only calls controlled functions:
--   convert_short_course_lead_to_student, create_short_class,
--   assign_short_enrollment_to_class.
-- - Keep Master Control/Search aware that short-course intake is scoped by P0-13.

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
  'WF_P1_20_SHORT_CONTROLLED_INTAKE',
  'P1-20 Nhập liệu thật ngắn hạn có kiểm soát',
  'M11_SHORT_COURSE_ERP',
  'Người dùng tạo lớp, chuyển lead thành học viên hoặc gán ghi danh vào lớp trong workspace P0-13.',
  'USER_DUOC_PHAN_QUYEN',
  'CTHSSV + DAO_TAO + TUYEN_SINH + IT_DATA',
  'TRUONG_PHONG/LEAD/AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Dữ liệu thật được tạo vào short_student_master, short_enrollments và short_class_master qua function kiểm soát.',
  'Lead đủ điều kiện được chuyển thành học viên; ghi danh nháp được gán vào lớp đúng đối tượng/ngành/khoá.',
  'Không cho nhập thẳng vào bảng lõi; mọi thay đổi phải đi qua function, RLS, phạm vi P0-13 và audit log.',
  220,
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
  'APPROVE_P1_20_SHORT_CONTROLLED_INTAKE_GO_LIVE',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_20_SHORT_CONTROLLED_INTAKE',
  'Duyệt P1-20 nhập liệu thật ngắn hạn',
  'GO_LIVE',
  'IT_DATA + OWNER_DEPARTMENTS',
  'AUDIT + PHAP_CHE',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Ảnh kiểm thử tạo lớp, chuyển lead thành học viên và gán lớp trong đúng workspace P0-13.',
  'Không go-live nếu màn hình cho tạo dữ liệu ngoài phạm vi user, sai đối tượng, sai ngành/khoá hoặc không ghi audit.',
  24,
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
    'P1_20_SHORT_CONTROLLED_INTAKE_FUNCTIONS',
    'Function nhập liệu thật ngắn hạn P1-20',
    'M11_SHORT_COURSE_ERP',
    'convert_short_course_lead_to_student; create_short_class; assign_short_enrollment_to_class',
    'TRANSACTION',
    'CTHSSV + DAO_TAO + TUYEN_SINH + IT_DATA',
    'SUPABASE',
    'RESTRICTED',
    false,
    'Chỉ thao tác qua function có kiểm tra quyền, workspace P0-13, ngành/khoá, trùng học viên, sĩ số và audit log.',
    'DAT_TAM_THOI'
  ),
  (
    'P1_20_SHORT_CONTROLLED_INTAKE_READINESS',
    'View đọc điều kiện nhập liệu P1-20',
    'M11_SHORT_COURSE_ERP',
    'short_course_lead_to_student_readiness; short_class_master_readiness; short_enrollment_class_assignment_readiness',
    'REPORT_VIEW',
    'IT_DATA + OWNER_DEPARTMENTS',
    'SUPABASE',
    'CONFIDENTIAL',
    true,
    'View chỉ đọc để chỉ đúng chỗ còn thiếu; không thay thế function ghi dữ liệu.',
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
  'OWN_P1_20_SHORT_CONTROLLED_INTAKE',
  'P1-20 Nhập liệu thật ngắn hạn có kiểm soát',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_20_SHORT_CONTROLLED_INTAKE',
  'SHORT_CONTROLLED_INTAKE',
  'short_student_master,short_enrollments,short_class_master',
  'CTHSSV + DAO_TAO + TUYEN_SINH + IT_DATA',
  'USER_DUOC_PHAN_QUYEN',
  'TRUONG_PHONG/LEAD/AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'ROLE_AND_SCOPE',
  'TUYEN_SINH/CTHSSV',
  'DAO_TAO + KHTC + AUDIT',
  'Ảnh chụp thao tác P1-20 và bản ghi audit/function trả thành công.',
  'Dữ liệu đúng thì giữ nguyên; chỗ nào sai phải hiện control_flags, không bắt nhập lại toàn bộ.',
  24,
  'HIGH',
  'DAT_TAM_THOI'
)
on conflict (ownership_code) do update
set process_name = excluded.process_name,
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
  decision_status,
  record_status
) values (
  'GATE_P1_20_SHORT_CONTROLLED_INTAKE',
  'Gate P1-20: Nhập liệu thật ngắn hạn không bypass kiểm soát',
  'GO_LIVE',
  'ROUTE',
  '/short-course/intake',
  'BGH + IT_DATA + AUDIT',
  'AUDIT kiểm tra tạo lớp, chuyển lead và gán lớp đều gọi function; không ghi trực tiếp bảng lõi.',
  'BGH xác nhận P1-20 chỉ mở sau khi phân quyền/phạm vi P0-13 và dữ liệu ngành/khoá đã đúng.',
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
  'NAV_P1_20_SHORT_CONTROLLED_INTAKE',
  'P1-20 Nhập liệu ngắn hạn',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/short-course/intake',
  'Tạo dữ liệu thật cho ERP ngắn hạn: tạo lớp, chuyển lead thành học viên, gán ghi danh vào lớp qua function kiểm soát.',
  'CTHSSV + DAO_TAO + TUYEN_SINH + IT_DATA',
  'Mở màn hình nhập liệu thật có kiểm soát',
  150,
  true,
  'Cảnh báo nếu thao tác không qua function, không đúng workspace P0-13 hoặc gán sai ngành/khoá.',
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
  'RISK_P1_20_SHORT_INTAKE_BYPASS',
  'Nhập liệu ngắn hạn bỏ qua function kiểm soát',
  'M11_SHORT_COURSE_ERP',
  'DATA_CONTROL',
  'HIGH',
  'IT_DATA + AUDIT',
  'Nếu nhập thẳng vào bảng lõi, hệ thống có thể trộn đối tượng tuyển sinh, sai ngành/khoá, trùng học viên hoặc mất audit.',
  'P1-20 chỉ gọi function kiểm soát; database tự chặn sai phạm vi, sai offering, trùng học viên và vượt sĩ số.',
  'Nếu phát hiện bypass, khóa quyền ghi, đối soát audit log và phục hồi bằng workflow request.',
  'Số bản ghi short_student_master/short_enrollments/short_class_master không có dấu vết function/audit hợp lệ.',
  'DAT_TAM_THOI'
)
on conflict (risk_code) do update
set risk_name = excluded.risk_name,
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
