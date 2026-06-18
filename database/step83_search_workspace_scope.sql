-- Step 83 - P1-19 Search Workspace Scope.
-- Run after step82_short_course_controlled_sample_data.sql.
--
-- Purpose:
-- - Make HEU OS Search respect the active P0-13 admission workspace.
-- - Admin users may have broad data access, but search results should still follow
--   the workspace they are currently operating in.
-- - Keep global Master Control results visible because they are not tied to one
--   admission segment.

do $$
begin
  if to_regprocedure('public.search_heu_os_unscoped_v1(text,integer)') is null
     and to_regprocedure('public.search_heu_os(text,integer)') is not null then
    alter function public.search_heu_os(text, integer)
      rename to search_heu_os_unscoped_v1;
  end if;

  if to_regprocedure('public.search_heu_os(text,integer)') is not null then
    drop function public.search_heu_os(text, integer);
  end if;
end $$;

create or replace function public.search_heu_os(
  p_query text,
  p_limit int default 40,
  p_segment_id uuid default null
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
      greatest(1, least(coalesce(p_limit, 40), 80)) as safe_limit,
      p_segment_id as segment_filter_id
  ),
  scoped_results as (
    select r.*
    from public.search_heu_os_unscoped_v1(
      p_query,
      greatest(80, least(coalesce(p_limit, 40) * 4, 80))
    ) r
    cross join params p
    where p.segment_filter_id is null
      or r.segment_id is null
      or r.segment_id = p.segment_filter_id
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
  from scoped_results r
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

grant execute on function public.search_heu_os(text, int, uuid) to authenticated;
grant execute on function public.search_heu_os_unscoped_v1(text, int) to authenticated;

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
  'WF_P1_19_SEARCH_WORKSPACE_SCOPE',
  'P1-19 Search theo đúng workspace P0-13',
  'M00_MASTER_CONTROL',
  'Người dùng tìm kiếm trong HEU OS khi đã chọn workspace P0-13.',
  'USER_DUOC_PHAN_QUYEN',
  'IT_DATA + AUDIT',
  'AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Search trả dữ liệu nghiệp vụ đúng admission_segment_id đang chọn, vẫn giữ kết quả Master Control toàn hệ thống.',
  'Nếu cần xử lý, người dùng mở module gốc từ kết quả search.',
  'Không cho search trở thành nơi sửa dữ liệu; search chỉ đọc và điều hướng.',
  219,
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
  'APPROVE_P1_19_SEARCH_WORKSPACE_SCOPE_GO_LIVE',
  'M00_MASTER_CONTROL',
  'WF_P1_19_SEARCH_WORKSPACE_SCOPE',
  'Duyệt P1-19 Search theo đúng workspace',
  'GO_LIVE',
  'IT_DATA',
  'AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Ảnh search P1-18 khi chọn từng workspace và xác nhận không lẫn kết quả nghiệp vụ khác admission_segment_id.',
  'Không mở production nếu search trả học viên/lead/lớp/công nợ/rủi ro của workspace khác.',
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
  'SEARCH_HEU_OS_SCOPED',
  'Search HEU OS có lọc workspace',
  'M00_MASTER_CONTROL',
  'search_heu_os; search_heu_os_unscoped_v1; admission_segments',
  'REPORT_VIEW',
  'IT_DATA + AUDIT',
  'SUPABASE',
  'INTERNAL',
  true,
  'Search chỉ đọc dữ liệu. Khi có p_segment_id, mọi kết quả nghiệp vụ có segment phải khớp workspace; kết quả global được phép hiển thị.',
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
  'OWN_P1_19_SEARCH_WORKSPACE_SCOPE',
  'P1-19 Kiểm soát phạm vi search theo workspace',
  'M00_MASTER_CONTROL',
  'WF_P1_19_SEARCH_WORKSPACE_SCOPE',
  'SEARCH_SCOPE',
  'search_heu_os',
  'IT_DATA + AUDIT',
  'IT_DATA',
  'AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'ROLE_AND_SCOPE',
  'IT_DATA',
  'ALL_MODULES',
  'Ảnh kiểm thử search cùng từ khóa trong hai workspace khác nhau.',
  'Search không sửa dữ liệu nhưng vẫn phải bảo vệ phạm vi xem dữ liệu.',
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
  'GATE_P1_19_SEARCH_WORKSPACE_SCOPE',
  'Gate P1-19: Search không lộ dữ liệu ngoài workspace',
  'DATA',
  'FUNCTION',
  'search_heu_os',
  'BGH + IT_DATA + AUDIT',
  'Kiểm tra cùng từ khóa P1-18 khi chọn SHORT_UNEMPLOYMENT_SUPPORT không hiện dòng SHORT_ONSITE_HEU ở nguồn nghiệp vụ.',
  'BGH xác nhận search chỉ là công cụ tìm/mở nơi xử lý, không thay thế phân quyền module gốc.',
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
  'NAV_P1_19_SEARCH_WORKSPACE_SCOPE',
  'P1-19 Search theo workspace',
  'CONTROL',
  'M00_MASTER_CONTROL',
  '/search?q=P1-18',
  'Kiểm tra Search Engine có lọc đúng workspace P0-13.',
  'IT_DATA + AUDIT',
  'Chọn workspace rồi tìm P1-18 để kiểm tra phạm vi',
  141,
  false,
  'Cảnh báo nếu kết quả nghiệp vụ có admission_segment_id khác workspace đang chọn.',
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
  'RISK_P1_19_SEARCH_SCOPE_LEAK',
  'Search hiển thị dữ liệu nghiệp vụ ngoài workspace',
  'M00_MASTER_CONTROL',
  'DATA_SCOPE',
  'HIGH',
  'IT_DATA + AUDIT',
  'Nếu search trả kết quả thuộc đối tượng tuyển sinh khác, người dùng có thể xem nhầm hoặc lộ dữ liệu ngoài phạm vi vận hành.',
  'Mọi kết quả có segment_id phải khớp p_segment_id; chỉ kết quả global không có segment_id mới được hiển thị chung.',
  'Nếu phát hiện leak, khóa search scoped, kiểm tra RPC, RLS và audit truy vấn.',
  'Số kết quả search có segment_id khác workspace hiện tại.',
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
