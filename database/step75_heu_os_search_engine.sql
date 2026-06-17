-- P1-11: HEU OS Search Engine
-- Run after step74_short_course_dashboard_exception_control.sql.
-- Purpose:
-- - Create one controlled search function for HEU OS.
-- - Search Master Control, navigation map, admission objects, leads, short-course students/classes and exceptions.
-- - Respect the current user's permissions, lead visibility and admission workspace scope.
-- - Keep AI/search in read-only support mode.

insert into public.role_permissions (role_id, permission)
select r.id, 'heu_os.search.read'
from public.roles r
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
  'heu_os.search.read',
  'HEU_OS',
  'Tìm kiếm HEU OS',
  'M00_MASTER_CONTROL',
  'IT_DATA',
  'HIGH',
  'ROLE_AND_SCOPE',
  true,
  false,
  true,
  true,
  'Search chỉ trả dữ liệu mà user đã có quyền xem qua RLS, phạm vi đối tượng tuyển sinh và quyền nghiệp vụ.',
  'DAT_TAM_THOI'
)
on conflict (permission_code) do update
set permission_group = excluded.permission_group,
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

create or replace function public.can_read_heu_os_search()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and (
      public.is_admin()
      or public.has_permission('heu_os.search.read')
      or public.has_permission('master_control.read')
      or public.has_permission('leads.read_all')
      or public.has_permission('leads.read_team')
      or public.has_permission('leads.read_assigned')
      or public.has_permission('reports.read_scope')
      or public.has_permission('short_course.dashboard.read')
      or public.has_permission('short_course.exception.read')
    )
$$;

grant execute on function public.can_read_heu_os_search() to authenticated;

create or replace function public.search_heu_os(
  p_query text,
  p_limit int default 40
)
returns table (
  result_rank int,
  result_type text,
  result_label text,
  result_code text,
  result_summary text,
  href text,
  module_code text,
  source_table text,
  entity_id uuid,
  segment_id uuid,
  segment_label text,
  owner_department text,
  status_label text,
  risk_level text,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  with params as (
    select
      lower(trim(coalesce(p_query, ''))) as q,
      nullif(regexp_replace(coalesce(p_query, ''), '\D', '', 'g'), '') as q_digits,
      greatest(1, least(coalesce(p_limit, 40), 80)) as safe_limit
  ),
  raw_results as (
    select
      10 as result_rank,
      'NAVIGATION'::text as result_type,
      n.node_name as result_label,
      n.node_code as result_code,
      concat_ws(' · ', n.summary, n.primary_action, n.requires_attention_rule) as result_summary,
      n.href,
      n.module_code,
      'heu_os_navigation_nodes'::text as source_table,
      n.id as entity_id,
      null::uuid as segment_id,
      null::text as segment_label,
      n.owner_department,
      n.control_status as status_label,
      null::text as risk_level,
      n.updated_at
    from public.heu_os_navigation_nodes n
    cross join params p
    where public.can_read_heu_os_search()
      and public.can_read_master_control()
      and n.status = 'ACTIVE'
      and p.q <> ''
      and lower(concat_ws(' ', n.node_code, n.node_name, n.node_group, n.summary, n.primary_action, n.requires_attention_rule)) like '%' || p.q || '%'

    union all

    select
      20,
      'MODULE',
      m.module_name,
      m.module_code,
      concat_ws(' · ', m.objective, m.core_policy, m.ai_policy),
      '/master-control/modules/' || m.module_code,
      m.module_code,
      'heu_os_modules',
      m.id,
      null::uuid,
      null::text,
      m.owner_department,
      m.control_status,
      null::text,
      m.updated_at
    from public.heu_os_modules m
    cross join params p
    where public.can_read_heu_os_search()
      and public.can_read_master_control()
      and m.status = 'ACTIVE'
      and p.q <> ''
      and lower(concat_ws(' ', m.module_code, m.module_name, m.module_group, m.objective, m.owner_department, m.core_policy, m.ai_policy)) like '%' || p.q || '%'

    union all

    select
      30,
      'WORKFLOW',
      w.workflow_name,
      w.workflow_code,
      concat_ws(' · ', w.trigger_event, w.output_result, w.handover_rule, w.audit_rule),
      '/master-control/modules/' || w.module_code,
      w.module_code,
      'heu_os_workflows',
      w.id,
      null::uuid,
      null::text,
      w.owner_department,
      w.control_status,
      null::text,
      w.updated_at
    from public.heu_os_workflows w
    cross join params p
    where public.can_read_heu_os_search()
      and public.can_read_master_control()
      and w.status = 'ACTIVE'
      and p.q <> ''
      and lower(concat_ws(' ', w.workflow_code, w.workflow_name, w.module_code, w.trigger_event, w.output_result, w.handover_rule, w.audit_rule)) like '%' || p.q || '%'

    union all

    select
      40,
      'APPROVAL',
      a.decision_name,
      a.approval_code,
      concat_ws(' · ', a.decision_level, a.required_evidence, a.blocking_rule),
      '/master-control/modules/' || a.module_code,
      a.module_code,
      'heu_os_approval_matrix',
      a.id,
      null::uuid,
      null::text,
      concat_ws(' + ', a.maker_role, a.checker_role, a.approver_role),
      a.control_status,
      null::text,
      a.updated_at
    from public.heu_os_approval_matrix a
    cross join params p
    where public.can_read_heu_os_search()
      and public.can_read_master_control()
      and a.status = 'ACTIVE'
      and p.q <> ''
      and lower(concat_ws(' ', a.approval_code, a.decision_name, a.module_code, a.decision_level, a.required_evidence, a.blocking_rule)) like '%' || p.q || '%'

    union all

    select
      50,
      'MASTER_DATA',
      d.data_name,
      d.data_code,
      concat_ws(' · ', d.source_table, d.data_type, d.system_of_record, d.change_rule),
      '/master-control/modules/' || d.module_code,
      d.module_code,
      'heu_os_master_data_map',
      d.id,
      null::uuid,
      null::text,
      d.owner_department,
      d.control_status,
      d.sensitivity_level,
      d.updated_at
    from public.heu_os_master_data_map d
    cross join params p
    where public.can_read_heu_os_search()
      and public.can_read_master_control()
      and d.status = 'ACTIVE'
      and p.q <> ''
      and lower(concat_ws(' ', d.data_code, d.data_name, d.module_code, d.source_table, d.data_type, d.owner_department, d.change_rule)) like '%' || p.q || '%'

    union all

    select
      60,
      'RISK',
      r.risk_name,
      r.risk_code,
      concat_ws(' · ', r.risk_group, r.risk_description, r.control_rule, r.escalation_rule, r.dashboard_metric),
      '/master-control/modules/' || r.module_code,
      r.module_code,
      'heu_os_risk_controls',
      r.id,
      null::uuid,
      null::text,
      r.owner_department,
      r.control_status,
      r.severity,
      r.updated_at
    from public.heu_os_risk_controls r
    cross join params p
    where public.can_read_heu_os_search()
      and public.can_read_master_control()
      and r.status = 'ACTIVE'
      and p.q <> ''
      and lower(concat_ws(' ', r.risk_code, r.risk_name, r.module_code, r.risk_group, r.risk_description, r.control_rule, r.escalation_rule)) like '%' || p.q || '%'

    union all

    select
      70,
      'ADMISSION_OBJECT',
      concat_ws(' - ', s.program_group, s.segment_name),
      s.segment_code,
      concat_ws(' · ', s.admission_object, s.delivery_context, s.partner_model, s.commission_model, s.contract_model, s.finance_risk),
      '/segments/' || s.id::text,
      null::text,
      'admission_segments',
      s.id,
      s.id,
      concat_ws(' - ', s.program_group, s.segment_name),
      s.owner_department,
      s.status::text,
      null::text,
      s.updated_at
    from public.admission_segments s
    cross join params p
    where public.can_read_heu_os_search()
      and s.status = 'ACTIVE'
      and public.can_access_business_scope(s.id, null::uuid)
      and p.q <> ''
      and lower(concat_ws(' ', s.segment_code, s.segment_name, s.program_group, s.admission_object, s.delivery_context, s.partner_model, s.commission_model, s.contract_model, s.finance_risk)) like '%' || p.q || '%'

    union all

    select
      80,
      'LEAD',
      l.student_name,
      l.lead_code,
      concat_ws(' · ', l.student_phone, l.parent_phone, l.interested_program, l.interested_major, l.current_school, l.status::text, l.priority::text),
      '/leads/' || l.id::text,
      'M05_ADMISSION_CRM',
      'leads',
      l.id,
      l.admission_segment_id,
      concat_ws(' - ', s.program_group, s.segment_name),
      up.full_name,
      l.status::text,
      l.priority::text,
      l.updated_at
    from public.leads l
    left join public.admission_segments s on s.id = l.admission_segment_id
    left join public.users_profile up on up.id = l.assigned_to
    cross join params p
    where public.can_read_heu_os_search()
      and l.is_deleted = false
      and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
      and public.can_read_lead(l.assigned_to, l.created_by)
      and p.q <> ''
      and (
        lower(concat_ws(' ', l.lead_code, l.student_name, l.student_phone, l.parent_phone, l.current_school, l.interested_program, l.interested_major, l.status::text, l.priority::text, l.note)) like '%' || p.q || '%'
        or (p.q_digits is not null and (l.student_phone_norm like '%' || p.q_digits || '%' or l.parent_phone_norm like '%' || p.q_digits || '%'))
      )

    union all

    select
      90,
      'SHORT_STUDENT',
      st.student_name,
      st.student_code,
      concat_ws(' · ', st.student_phone, st.identity_no, st.student_status, st.source_status, st.note),
      '/master-control/modules/M11_SHORT_COURSE_ERP',
      'M11_SHORT_COURSE_ERP',
      'short_student_master',
      st.id,
      st.admission_segment_id,
      concat_ws(' - ', s.program_group, s.segment_name),
      'CTHSSV + DAO_TAO',
      st.student_status,
      null::text,
      st.updated_at
    from public.short_student_master st
    left join public.admission_segments s on s.id = st.admission_segment_id
    cross join params p
    where public.can_read_heu_os_search()
      and public.can_read_short_course_erp()
      and st.status = 'ACTIVE'
      and public.can_access_business_scope(st.admission_segment_id, null::uuid)
      and p.q <> ''
      and (
        lower(concat_ws(' ', st.student_code, st.student_name, st.student_phone, st.identity_no, st.student_status, st.source_status, st.note)) like '%' || p.q || '%'
        or (p.q_digits is not null and st.student_phone_norm like '%' || p.q_digits || '%')
      )

    union all

    select
      100,
      'SHORT_CLASS',
      c.class_name,
      c.class_code,
      concat_ws(' · ', c.training_location, c.instructor_name, c.class_status, c.schedule_note, c.note),
      '/master-control/modules/M11_SHORT_COURSE_ERP',
      'M11_SHORT_COURSE_ERP',
      'short_class_master',
      c.id,
      c.admission_segment_id,
      concat_ws(' - ', s.program_group, s.segment_name),
      'DAO_TAO',
      c.class_status,
      null::text,
      c.updated_at
    from public.short_class_master c
    left join public.admission_segments s on s.id = c.admission_segment_id
    cross join params p
    where public.can_read_heu_os_search()
      and public.can_read_short_course_erp()
      and c.status = 'ACTIVE'
      and public.can_access_business_scope(c.admission_segment_id, null::uuid)
      and p.q <> ''
      and lower(concat_ws(' ', c.class_code, c.class_name, c.training_location, c.instructor_name, c.class_status, c.schedule_note, c.note)) like '%' || p.q || '%'

    union all

    select
      110,
      'EXCEPTION',
      e.exception_title,
      e.exception_code,
      concat_ws(' · ', e.module_step, e.entity_type, e.entity_code, e.entity_name, e.readiness_status, e.action_hint, array_to_string(e.control_flags, ', ')),
      '/master-control/modules/M11_SHORT_COURSE_ERP',
      'M11_SHORT_COURSE_ERP',
      e.source_view,
      e.entity_id,
      e.admission_segment_id,
      concat_ws(' - ', e.segment_code, e.segment_name),
      e.owner_department,
      e.readiness_status,
      e.severity,
      e.updated_at
    from public.short_course_exception_register e
    cross join params p
    where public.can_read_heu_os_search()
      and public.can_read_short_dashboard()
      and p.q <> ''
      and lower(concat_ws(' ', e.exception_code, e.exception_title, e.module_step, e.exception_group, e.severity, e.entity_type, e.entity_code, e.entity_name, e.readiness_status, e.action_hint, array_to_string(e.control_flags, ' '))) like '%' || p.q || '%'
  )
  select
    r.result_rank,
    r.result_type,
    r.result_label,
    r.result_code,
    r.result_summary,
    r.href,
    r.module_code,
    r.source_table,
    r.entity_id,
    r.segment_id,
    r.segment_label,
    r.owner_department,
    r.status_label,
    r.risk_level,
    r.updated_at
  from raw_results r
  cross join params p
  order by
    case
      when lower(coalesce(r.result_code, '')) = p.q then 0
      when lower(coalesce(r.result_label, '')) = p.q then 1
      when lower(coalesce(r.result_code, '')) like p.q || '%' then 2
      when lower(coalesce(r.result_label, '')) like p.q || '%' then 3
      else 9
    end,
    r.result_rank,
    r.updated_at desc nulls last
  limit (select safe_limit from params)
$$;

grant execute on function public.search_heu_os(text, int) to authenticated;

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
  'WF_P1_11_HEU_OS_SEARCH_ENGINE',
  'P1-11 Search Engine HEU OS',
  'M00_MASTER_CONTROL',
  'User nhập từ khóa để tìm đúng module, quy trình, lead, học viên, lớp hoặc exception trong phạm vi được phép.',
  'ALL_AUTHORIZED_USERS',
  'IT_DATA',
  'AUDIT',
  'BGH',
  'Danh sách kết quả tìm kiếm có link mở nhanh và không vượt quyền.',
  'Nếu kết quả liên quan dữ liệu nghiệp vụ thì xử lý tại module gốc, không sửa trực tiếp từ search.',
  'Search chỉ đọc dữ liệu, không tự cập nhật. Mọi xử lý tiếp theo phải qua module gốc và audit log.',
  920,
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
  'APPROVE_P1_11_SEARCH_SCOPE_POLICY',
  'M00_MASTER_CONTROL',
  'WF_P1_11_HEU_OS_SEARCH_ENGINE',
  'Duyệt chính sách phạm vi dữ liệu Search Engine',
  'SYSTEM',
  'IT_DATA',
  'AUDIT',
  'BGH',
  'Danh sách nguồn search, permission, RLS và rule không hiển thị dữ liệu ngoài phạm vi.',
  'Không được đưa nguồn dữ liệu nhạy cảm vào search nếu chưa có permission, RLS và owner phê duyệt.',
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
    'HEU_OS_SEARCH_FUNCTION',
    'Hàm tìm kiếm HEU OS',
    'M00_MASTER_CONTROL',
    'search_heu_os',
    'REPORT_VIEW',
    'IT_DATA',
    'SUPABASE',
    'RESTRICTED',
    true,
    'Chỉ thêm nguồn search khi có owner, permission/RLS và link mở module gốc.',
    'DAT_TAM_THOI'
  ),
  (
    'HEU_OS_SEARCH_PERMISSION',
    'Quyền sử dụng Search Engine',
    'M00_MASTER_CONTROL',
    'can_read_heu_os_search, role_permissions, permission_registry',
    'CONFIG',
    'IT_DATA',
    'SUPABASE',
    'INTERNAL',
    true,
    'Search permission được cấp rộng nhưng kết quả vẫn bị chặn bởi quyền dữ liệu gốc.',
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
    'RISK_P1_11_SEARCH_DATA_LEAK',
    'Search trả dữ liệu ngoài phạm vi user',
    'M00_MASTER_CONTROL',
    'DATA_SECURITY',
    'CRITICAL',
    'IT_DATA + AUDIT',
    'Nếu search bỏ qua RLS/phạm vi, user có thể thấy lead, học viên, công nợ hoặc exception không thuộc quyền.',
    'Tất cả nguồn search phải qua permission, RLS và can_access_business_scope/can_read_lead khi cần.',
    'Nếu phát hiện kết quả vượt quyền, khóa nguồn search đó và audit toàn bộ truy vấn liên quan.',
    'Số nguồn search chưa có kiểm soát phạm vi.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_11_SEARCH_CONFUSION',
    'Search trả kết quả không có link xử lý rõ ràng',
    'M00_MASTER_CONTROL',
    'OPERATION',
    'MEDIUM',
    'IT_DATA',
    'Nếu kết quả tìm kiếm không dẫn về module gốc, người dùng dễ sửa nhầm hoặc dùng file ngoài hệ thống.',
    'Mỗi kết quả search phải có href mở module/trang xử lý gốc.',
    'Nếu user báo không biết xử lý ở đâu, bổ sung href/module mapping trước khi mở rộng search.',
    'Tỷ lệ kết quả không có href/module.',
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
  'search_heu_os',
  'Search Engine HEU OS',
  'M00_MASTER_CONTROL',
  'REPORT_VIEW',
  'IT_DATA',
  'Hàm tìm kiếm có kiểm soát, trả kết quả trong phạm vi user được phép xem.',
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
    ('result_type', 'Loại kết quả', 'text', true, false, false, true, 'MODULE/WORKFLOW/LEAD/SHORT_STUDENT/SHORT_CLASS/EXCEPTION...', 'Dùng để hiển thị nhóm kết quả.'),
    ('result_label', 'Tên hiển thị', 'text', true, false, false, true, 'Không để trống.', 'Tên người dùng nhìn thấy.'),
    ('href', 'Link mở nhanh', 'text', true, false, false, true, 'Phải là đường dẫn nội bộ app.', 'Không xử lý nghiệp vụ trực tiếp tại search.'),
    ('source_table', 'Nguồn dữ liệu', 'text', true, false, false, true, 'Phải có owner và RLS/permission.', 'Dùng audit/governance.')
) as f(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, validation_rule, note)
where t.table_code = 'search_heu_os'
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
  'OWN_P1_11_HEU_OS_SEARCH_ENGINE',
  'P1-11 Search Engine HEU OS',
  'M00_MASTER_CONTROL',
  'WF_P1_11_HEU_OS_SEARCH_ENGINE',
  'FUNCTION',
  'search_heu_os',
  'IT_DATA',
  'IT_DATA',
  'AUDIT',
  'BGH',
  'ROLE_AND_SCOPE',
  'ALL_MODULES',
  'MODULE_OWNER',
  'Danh sách nguồn search, permission/RLS và ví dụ kết quả không vượt phạm vi.',
  'Search chỉ đọc; thao tác tiếp theo phải về module gốc để có audit log.',
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
  'GATE_P1_11_HEU_OS_SEARCH_ENGINE',
  'Gate P1-11: search chỉ trả dữ liệu đúng quyền',
  'DATA',
  'FUNCTION',
  'search_heu_os',
  'IT_DATA + AUDIT',
  'AUDIT kiểm tra các nguồn search đều có RLS/permission và không lộ dữ liệu ngoài phạm vi.',
  'BGH duyệt mở rộng nguồn search sau khi có owner và kiểm soát dữ liệu.',
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
  'NAV_P1_11_HEU_OS_SEARCH_ENGINE',
  'P1-11 Search Engine HEU OS',
  'CONTROL',
  'M00_MASTER_CONTROL',
  '/search',
  'Ô tìm kiếm nội bộ để mở nhanh module, lead, học viên, lớp, exception đúng phạm vi quyền.',
  'IT_DATA',
  'Tìm và mở đúng nơi xử lý',
  30,
  true,
  'Search phải tôn trọng RLS, phạm vi đối tượng tuyển sinh và quyền dữ liệu gốc.',
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
