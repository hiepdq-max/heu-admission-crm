-- P1-17 Short Course Workflow Application Gate
-- Purpose: connect real operational drilldown rows to workflow requests.
-- Users can create/open a workflow request directly from student/class/enrollment/
-- attendance/BHXH/finance/payment/risk rows without editing business data directly.

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
  'WF_P1_17_SHORT_WORKFLOW_APPLICATION_GATE',
  'P1-17 Ap workflow request vao nghiep vu ngan han',
  'M11_SHORT_COURSE_ERP',
  'Nguoi dung mo drilldown P1-13 va can xu ly mot dong du lieu that nhu hoc vien, lop, diem danh, cong no, thanh toan hoac rui ro.',
  'NHAN_VIEN_DUOC_PHAN_QUYEN',
  'OWNER_DEPARTMENTS + IT_DATA',
  'TRUONG_PHONG/LEAD + AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Moi dong drilldown co nut Phieu xu ly va hien trang thai phieu moi nhat neu da co.',
  'Khong sua truc tiep du lieu nghiep vu tu drilldown; moi viec can xu ly phai tao phieu P1-15/P1-16 va quay lai module nguon khi duyet.',
  'Lien ket entity_type/entity_id/entity_code voi approval_requests; moi cap nhat phieu van di qua audit log.',
  980,
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
  'APPROVE_P1_17_SHORT_WORKFLOW_APPLICATION_GO_LIVE',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_17_SHORT_WORKFLOW_APPLICATION_GATE',
  'Duyet go-live ap workflow vao drilldown nghiep vu ngan han',
  'OPERATION',
  'IT_DATA',
  'AUDIT + OWNER_DEPARTMENTS',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Anh man hinh drilldown co nut Phieu xu ly, trang thai phieu gan dung entity va ket qua lint/build.',
  'Khong go-live neu nut Phieu xu ly tao sai entity_type/entity_id/entity_code hoac lam lo du lieu ngoai workspace.',
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
) values (
  'SHORT_COURSE_WORKFLOW_APPLICATION_MAP',
  'Ban do gan workflow request voi dong nghiep vu ngan han',
  'M11_SHORT_COURSE_ERP',
  'short_student_master; short_class_master; short_enrollments; short_attendance_sessions; short_bhxh_policy_cases; short_finance_invoices; short_payments; short_risk_alerts; short_course_workflow_request_status',
  'CONFIG',
  'IT_DATA + AUDIT',
  'APP_CODE + SUPABASE',
  'RESTRICTED',
  true,
  'Chi IT_DATA duoc doi mapping entity_type. Moi doi thay phai qua Git, lint/build va Master Control.',
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
  'OWN_P1_17_SHORT_WORKFLOW_APPLICATION_GATE',
  'P1-17 Ap workflow request vao nghiep vu ngan han',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_17_SHORT_WORKFLOW_APPLICATION_GATE',
  'OPERATIONAL_ROW_WORKFLOW_GATE',
  'short_course_drilldown_ui,approval_requests,short_course_workflow_request_status',
  'IT_DATA + OWNER_DEPARTMENTS + AUDIT',
  'NHAN_VIEN_DUOC_PHAN_QUYEN',
  'TRUONG_PHONG/LEAD/AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'ROLE_AND_SCOPE',
  'P1_13_DRILLDOWN',
  'P1_15_WORKFLOW_REQUEST',
  'Dong nghiep vu nguon, entity_type/entity_id/entity_code, ly do xu ly va minh chung neu co.',
  'Drilldown chi tao/mo phieu; khong ghi du lieu nghiep vu. Moi phieu van bi kiem soat boi P1-15/P1-16.',
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
  'GATE_P1_17_SHORT_WORKFLOW_APPLICATION_GATE',
  'Gate P1-17: ap workflow vao dong nghiep vu ngan han duoc phep go-live',
  'GO_LIVE',
  'ROUTE',
  '/short-course/drilldown',
  'BGH + IT_DATA + AUDIT',
  'Kiem tra tung loai drilldown tao dung entity_type, dung entity_id/entity_code va khong bo qua workspace.',
  'Xac nhan P1-17 chi mo phieu xu ly, chua tu dong sua du lieu nghiep vu va chua cho AI tu duyet.',
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
  'NAV_P1_17_SHORT_WORKFLOW_APPLICATION_GATE',
  'P1-17 Ap workflow vao nghiep vu',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/short-course/drilldown',
  'Moi dong hoc vien, lop, ghi danh, diem danh, BHXH, cong no, thanh toan va rui ro co duong tao/mo phieu xu ly.',
  'IT_DATA + OWNER_DEPARTMENTS + AUDIT',
  'Mo drilldown va bam Phieu xu ly tren dong can xu ly',
  139,
  false,
  'Can canh bao neu dong nghiep vu khong hien nut Phieu xu ly hoac phieu tao sai doi tuong.',
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
  'RISK_P1_17_WORKFLOW_WRONG_ENTITY',
  'Phieu xu ly gan sai dong nghiep vu ngan han',
  'M11_SHORT_COURSE_ERP',
  'DATA_LINKAGE',
  'HIGH',
  'IT_DATA + AUDIT',
  'Nut Phieu xu ly tao sai entity_type/entity_id/entity_code lam nguoi duyet xu ly nham hoc vien, lop, cong no hoac thanh toan.',
  'Mapping entity_type phai co dinh theo drilldown type va form phieu phai loc theo entity khi mo tu dong nguon.',
  'Neu phat hien gan sai: khoa phieu, tao phieu moi dung entity, audit nguoi tao va sua mapping truoc khi go-live tiep.',
  'So phieu xu ly co entity_type/entity_id khong khop dong nguon.',
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
