-- P1-15: Short Course Workflow Request
-- Run after step78_short_course_action_center.sql.
-- Purpose:
-- - Add a controlled request queue for short-course operations.
-- - Keep every action tied to an admission workspace when possible.
-- - Use the existing approval_requests engine instead of creating a separate approval silo.

alter table public.approval_requests
add column if not exists admission_segment_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'approval_requests_admission_segment_id_fkey'
  ) then
    alter table public.approval_requests
    add constraint approval_requests_admission_segment_id_fkey
    foreign key (admission_segment_id)
    references public.admission_segments(id)
    on delete set null;
  end if;
end $$;

create index if not exists idx_approval_requests_admission_segment
on public.approval_requests(admission_segment_id, request_status, created_at desc)
where record_status = 'ACTIVE';

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('workflow_request.read'),
    ('workflow_request.create')
) as p(permission)
where r.code in (
  'ADMIN',
  'BGH',
  'IT_DATA',
  'DAO_TAO',
  'DAO_TAO_LEAD',
  'CTHSSV',
  'CTHSSV_LEAD',
  'KHTC',
  'ACCOUNTING',
  'ACCOUNTING_STAFF',
  'ACCOUNTING_LEAD'
)
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('workflow_request.check')
) as p(permission)
where r.code in (
  'ADMIN',
  'BGH',
  'AUDIT',
  'IT_DATA',
  'DAO_TAO_LEAD',
  'CTHSSV_LEAD',
  'ACCOUNTING_LEAD'
)
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('workflow_request.approve')
) as p(permission)
where r.code in (
  'ADMIN',
  'BGH',
  'PRINCIPAL',
  'HIEU_TRUONG',
  'KE_TOAN_TRUONG'
)
on conflict (role_id, permission) do nothing;

create or replace view public.short_course_workflow_request_status
with (security_invoker = true)
as
select
  ar.id,
  ar.request_code,
  ar.request_title,
  ar.approval_code,
  am.decision_name,
  am.decision_level,
  am.module_code,
  am.workflow_code,
  w.workflow_name,
  am.maker_role,
  am.checker_role,
  am.approver_role,
  am.required_evidence,
  am.blocking_rule,
  am.sla_hours,
  ar.entity_type,
  ar.entity_id,
  ar.entity_code,
  ar.request_note,
  ar.evidence_url,
  ar.maker_note,
  ar.checker_note,
  ar.approver_note,
  ar.request_status,
  ar.requested_by,
  requester.full_name as requested_by_name,
  requester.email as requested_by_email,
  ar.checked_by,
  checker.full_name as checked_by_name,
  ar.approved_by,
  approver.full_name as approved_by_name,
  ar.rejected_by,
  rejecter.full_name as rejected_by_name,
  ar.due_at,
  ar.checked_at,
  ar.approved_at,
  ar.rejected_at,
  ar.admission_segment_id,
  case
    when s.id is null then null
    when s.program_group is null or length(trim(s.program_group)) = 0 then s.segment_name
    else s.program_group || ' - ' || s.segment_name
  end as segment_label,
  ar.created_at,
  ar.updated_at,
  (
    ar.due_at is not null
    and ar.due_at < now()
    and ar.request_status not in ('APPROVED', 'REJECTED', 'CANCELLED')
  ) as is_overdue,
  array_remove(array[
    case when ar.evidence_url is null or length(trim(ar.evidence_url)) = 0 then 'MISSING_EVIDENCE' end,
    case when ar.request_note is null or length(trim(ar.request_note)) = 0 then 'MISSING_REQUEST_NOTE' end,
    case when ar.request_status = 'PENDING_CHECK' and ar.due_at is not null and ar.due_at < now() then 'CHECK_OVERDUE' end,
    case when ar.request_status = 'CHECKED' and ar.due_at is not null and ar.due_at < now() then 'APPROVAL_OVERDUE' end,
    case when ar.request_status = 'NEEDS_FIX' then 'NEEDS_FIX' end,
    case when ar.request_status = 'REJECTED' then 'REJECTED' end
  ], null) as request_flags,
  case
    when ar.request_status = 'DRAFT' then 'SUBMIT_FOR_CHECK'
    when ar.request_status = 'NEEDS_FIX' then 'FIX_AND_RESUBMIT'
    when ar.request_status = 'PENDING_CHECK' then 'WAITING_CHECK'
    when ar.request_status = 'CHECKED' then 'WAITING_APPROVAL'
    when ar.request_status = 'APPROVED' then 'DONE_APPROVED'
    when ar.request_status = 'REJECTED' then 'DONE_REJECTED'
    when ar.request_status = 'CANCELLED' then 'DONE_CANCELLED'
    else 'REVIEW'
  end as next_action
from public.approval_requests ar
join public.heu_os_approval_matrix am
  on am.approval_code = ar.approval_code
left join public.heu_os_workflows w
  on w.workflow_code = am.workflow_code
left join public.users_profile requester
  on requester.id = ar.requested_by
left join public.users_profile checker
  on checker.id = ar.checked_by
left join public.users_profile approver
  on approver.id = ar.approved_by
left join public.users_profile rejecter
  on rejecter.id = ar.rejected_by
left join public.admission_segments s
  on s.id = ar.admission_segment_id
where ar.record_status = 'ACTIVE'
  and am.module_code = 'M11_SHORT_COURSE_ERP'
  and (
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('master_control.read')
    or public.has_permission('master_control.manage')
    or public.has_permission('workflow_request.check')
    or public.has_permission('workflow_request.approve')
    or ar.requested_by = auth.uid()
    or ar.checked_by = auth.uid()
    or ar.approved_by = auth.uid()
    or ar.rejected_by = auth.uid()
    or (
      ar.admission_segment_id is not null
      and public.can_use_admission_workspace(ar.admission_segment_id)
    )
  );

grant select on public.short_course_workflow_request_status to authenticated;

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
  'WF_P1_15_SHORT_WORKFLOW_REQUEST',
  'P1-15 Phiếu xử lý nghiệp vụ ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'Action Center hoặc người vận hành phát hiện việc cần xử lý trong chuỗi ERP ngắn hạn.',
  'NHAN_VIEN_DUOC_PHAN_QUYEN',
  'OWNER_DEPARTMENTS + IT_DATA',
  'TRUONG_PHONG/LEAD + AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Phiếu xử lý có trạng thái, người tạo, người kiểm, người duyệt, minh chứng và audit log.',
  'Phiếu phải gắn workspace khi phát sinh từ đối tượng tuyển sinh cụ thể; xử lý xong mới quay về module nguồn để ghi dữ liệu.',
  'Mọi tạo/sửa/duyệt phiếu nằm trong approval_requests, có audit log và không cho AI tự duyệt.',
  960,
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
  'APPROVE_P1_15_SHORT_WORK_REQUEST',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_15_SHORT_WORKFLOW_REQUEST',
  'Duyệt phiếu xử lý nghiệp vụ ngắn hạn',
  'OPERATION',
  'NHAN_VIEN_DUOC_PHAN_QUYEN',
  'TRUONG_PHONG/LEAD/AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Phiếu phải có tên việc, loại việc, mã đối tượng nếu có, lý do xử lý và minh chứng khi nghiệp vụ yêu cầu.',
  'Không được xử lý ghi dữ liệu nếu phiếu cần duyệt nhưng chưa APPROVED, hoặc phiếu không nằm trong workspace/phạm vi được phân.',
  48,
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
  'SHORT_COURSE_WORKFLOW_REQUESTS',
  'Phiếu xử lý nghiệp vụ ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'approval_requests; short_course_workflow_request_status',
  'TRANSACTION',
  'OWNER_DEPARTMENTS + IT_DATA',
  'SUPABASE',
  'RESTRICTED',
  true,
  'Chỉ tạo/cập nhật qua workflow request engine; phải gắn admission_segment_id nếu phát sinh từ một đối tượng tuyển sinh cụ thể.',
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
  'SHORT_COURSE_WORKFLOW_REQUEST_STATUS',
  'View phiếu xử lý nghiệp vụ ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'REPORT_VIEW',
  'OWNER_DEPARTMENTS + IT_DATA',
  'Hiển thị phiếu xử lý ngắn hạn theo workflow request engine và workspace P0-13.',
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

with target_table as (
  select id
  from public.data_dictionary_tables
  where table_code = 'SHORT_COURSE_WORKFLOW_REQUEST_STATUS'
  limit 1
),
fields as (
  select *
  from (
    values
      ('request_code', 'Mã phiếu xử lý', 'text', true, false, false, true, 'Mã tự sinh từ approval code và ngày tạo.'),
      ('request_status', 'Trạng thái phiếu', 'text', true, false, false, true, 'DRAFT/PENDING_CHECK/CHECKED/APPROVED/REJECTED/NEEDS_FIX/CANCELLED.'),
      ('admission_segment_id', 'Đối tượng tuyển sinh', 'uuid', false, false, false, false, 'Gắn phiếu với workspace tuyển sinh để không lẫn phạm vi.'),
      ('entity_type', 'Loại nghiệp vụ', 'text', true, false, false, true, 'SHORT_STUDENT, SHORT_CLASS, SHORT_ATTENDANCE, SHORT_FINANCE...'),
      ('evidence_url', 'Link minh chứng', 'text', false, false, true, false, 'Drive, ảnh, chứng từ, quyết định hoặc file kiểm tra.')
  ) as f(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, note)
)
insert into public.data_dictionary_fields (
  table_id,
  field_code,
  field_name,
  data_type,
  is_required,
  is_unique,
  is_sensitive,
  ai_allowed,
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
  f.note,
  'DAT_TAM_THOI'
from target_table t
cross join fields f
on conflict (table_id, field_code) do update
set field_name = excluded.field_name,
    data_type = excluded.data_type,
    is_required = excluded.is_required,
    is_unique = excluded.is_unique,
    is_sensitive = excluded.is_sensitive,
    ai_allowed = excluded.ai_allowed,
    note = excluded.note,
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
    'RISK_P1_15_SHORT_REQUEST_WITHOUT_SCOPE',
    'Phiếu xử lý ngắn hạn không gắn phạm vi',
    'M11_SHORT_COURSE_ERP',
    'DATA_SCOPE',
    'HIGH',
    'IT_DATA + AUDIT',
    'Phiếu không có admission_segment_id có thể làm lẫn dữ liệu giữa 9+, ngắn hạn, liên thông hoặc đối tác.',
    'UI phải tự gắn workspace hiện tại; view chỉ hiển thị theo phạm vi user hoặc người liên quan tới phiếu.',
    'Nếu phát hiện phiếu sai phạm vi, chuyển NEEDS_FIX và kiểm tra người tạo.',
    'short_workflow_request_without_scope_count',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_15_SHORT_REQUEST_BYPASS_APPROVAL',
    'Xử lý nghiệp vụ bỏ qua phiếu duyệt',
    'M11_SHORT_COURSE_ERP',
    'APPROVAL',
    'CRITICAL',
    'BGH + AUDIT',
    'Người dùng xử lý công nợ, điểm danh, BHXH hoặc bàn giao hồ sơ khi phiếu chưa được kiểm/duyệt.',
    'Các chức năng ghi dữ liệu sau này phải kiểm tra approval_requests nếu nghiệp vụ yêu cầu duyệt.',
    'Khóa thao tác và báo BGH/AUDIT nếu phát hiện bypass approval.',
    'short_workflow_bypass_count',
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
  'OWN_P1_15_SHORT_WORKFLOW_REQUEST',
  'P1-15 Phiếu xử lý nghiệp vụ ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_15_SHORT_WORKFLOW_REQUEST',
  'WORKFLOW_REQUEST',
  'approval_requests,short_course_workflow_request_status',
  'OWNER_DEPARTMENTS + IT_DATA',
  'NHAN_VIEN_DUOC_PHAN_QUYEN',
  'TRUONG_PHONG/LEAD/AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'ROLE_AND_ADMISSION_WORKSPACE',
  'P1_14_ACTION_CENTER_OR_OWNER_MODULE',
  'OWNER_MODULE_FOR_EXECUTION',
  'Phiếu xử lý, link minh chứng nếu nghiệp vụ yêu cầu, và màn hình nguồn từ Action Center.',
  'Tạo/cập nhật/duyệt phiếu nằm trong approval_requests và trigger audit log.',
  48,
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
  'GATE_P1_15_SHORT_WORKFLOW_REQUEST',
  'Gate P1-15: phiếu xử lý ngắn hạn được phép go-live',
  'GO_LIVE',
  'ROUTE',
  '/short-course/workflows',
  'BGH + IT_DATA + AUDIT',
  'AUDIT kiểm tra phiếu có scope, có trạng thái, có người tạo/kiểm/duyệt và không ghi dữ liệu trực tiếp ngoài workflow.',
  'BGH xác nhận P1-15 là lớp điều phối xử lý, chưa thay thế nghiệp vụ nguồn và chưa cho AI tự duyệt.',
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
  'NAV_P1_15_SHORT_WORKFLOW_REQUEST',
  'P1-15 Phiếu xử lý ERP ngắn hạn',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/short-course/workflows',
  'Tạo và theo dõi phiếu xử lý từ Action Center hoặc module nguồn, có maker-checker-approver và scope theo đối tượng tuyển sinh.',
  'OWNER_DEPARTMENTS + IT_DATA',
  'Tạo phiếu xử lý, kiểm, duyệt hoặc trả về bổ sung',
  136,
  true,
  'Phiếu xử lý phải gắn workspace khi phát sinh từ đối tượng tuyển sinh cụ thể và không được bypass approval/audit.',
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
