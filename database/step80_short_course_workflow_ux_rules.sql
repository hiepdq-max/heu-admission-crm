-- P1-16 Short Course Workflow UX + Action Rules
-- Purpose: register the card-based workflow request UX and state-transition rules
-- in HEU OS governance. This step does not create new business tables.

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
  'WF_P1_16_SHORT_WORKFLOW_UX_RULES',
  'P1-16 Dieu khien thao tac phieu xu ly ngan han',
  'M11_SHORT_COURSE_ERP',
  'Nguoi dung xu ly phieu P1-15 tren giao dien card, he thong chi hien dung hanh dong theo trang thai hien tai.',
  'NHAN_VIEN_DUOC_PHAN_QUYEN',
  'OWNER_DEPARTMENTS + IT_DATA',
  'TRUONG_PHONG/LEAD + AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Phieu xu ly khong con bang ngang kho thao tac; moi trang thai chi co dung nut tiep theo duoc phep.',
  'Trang thai chi duoc di theo luong DRAFT/NEEDS_FIX -> PENDING_CHECK -> CHECKED -> APPROVED/REJECTED, hoac huy dung quyen.',
  'Moi lan cap nhat van ghi vao approval_requests va di qua audit log; server chan transition sai ke ca khi gui form thu cong.',
  970,
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
  'APPROVE_P1_16_SHORT_WORKFLOW_UX_RULES_GO_LIVE',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_16_SHORT_WORKFLOW_UX_RULES',
  'Duyet go-live luat thao tac phieu xu ly ngan han',
  'OPERATION',
  'IT_DATA',
  'AUDIT + OWNER_DEPARTMENTS',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Anh man hinh card workflow, danh sach hanh dong theo tung trang thai va ket qua build/lint.',
  'Khong go-live neu giao dien con bat nguoi dung keo ngang hoac server con cho cap nhat trang thai sai luong.',
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
  'SHORT_COURSE_WORKFLOW_UX_RULES',
  'Luat hien thi va chuyen trang thai phieu xu ly ngan han',
  'M11_SHORT_COURSE_ERP',
  'app/short-course/workflows; approval_requests; short_course_workflow_request_status',
  'CONFIG',
  'IT_DATA + AUDIT',
  'APP_CODE + SUPABASE',
  'INTERNAL',
  true,
  'Chi IT_DATA duoc thay doi luat UI/server; thay doi phai co lint, build va audit trong Git.',
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
  'OWN_P1_16_SHORT_WORKFLOW_UX_RULES',
  'P1-16 Dieu khien thao tac phieu xu ly ngan han',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_16_SHORT_WORKFLOW_UX_RULES',
  'WORKFLOW_REQUEST_UX_RULE',
  'app/short-course/workflows,approval_requests',
  'IT_DATA + AUDIT',
  'IT_DATA',
  'AUDIT + OWNER_DEPARTMENTS',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'ROLE_AND_SCOPE',
  'P1_15_WORKFLOW_REQUEST',
  'P1_15_WORKFLOW_REQUEST',
  'Man hinh card workflow, state transition map va ket qua test.',
  'Moi thay doi code phai co Git commit; moi cap nhat phieu thuc te van di qua approval_requests va audit log.',
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
  'GATE_P1_16_SHORT_WORKFLOW_UX_RULES',
  'Gate P1-16: luat thao tac phieu xu ly ngan han duoc phep go-live',
  'GO_LIVE',
  'ROUTE',
  '/short-course/workflows',
  'BGH + IT_DATA + AUDIT',
  'Kiem tra giao dien khong con bang ngang, moi phieu co card rieng, nut hanh dong dung theo trang thai.',
  'Xac nhan server chan transition sai va AI chi duoc goi y/canh bao, khong tu duyet phieu.',
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
  'NAV_P1_16_SHORT_WORKFLOW_UX_RULES',
  'P1-16 Luat thao tac phieu xu ly',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/short-course/workflows',
  'Trang workflow request dang card, chi hien dung hanh dong duoc phep theo tung trang thai va quyen user.',
  'IT_DATA + AUDIT',
  'Mo trang phieu xu ly va kiem tra hanh dong tiep theo',
  138,
  false,
  'Can kiem tra neu nguoi dung van thay bang ngang, thay nut sai trang thai, hoac update bi chan sai.',
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
  'RISK_P1_16_INVALID_WORKFLOW_ACTION',
  'Nguoi dung thay hoac gui sai hanh dong phieu xu ly',
  'M11_SHORT_COURSE_ERP',
  'GOVERNANCE',
  'HIGH',
  'IT_DATA + AUDIT',
  'Phieu xu ly hien nut khong dung trang thai, hoac request status cap nhat bo qua buoc kiem/duyet.',
  'Server action chan invalid transition; UI chi hien action hop le theo request_status va quyen user.',
  'Tam dung thao tac workflow neu phat hien transition sai; IT_DATA/AUDIT kiem tra code va audit log truoc khi mo lai.',
  'So lan cap nhat workflow bi chan do invalid_workflow_transition.',
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
