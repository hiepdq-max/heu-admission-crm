-- Step 43 - P0-04 Module Readiness Gate.
-- Run after step42_heu_os_map.sql.
-- Purpose: show whether each HEU OS module is ready for production/AI.

create or replace view public.heu_os_module_readiness
with (security_invoker = true)
as
with module_counts as (
  select
    m.id,
    m.module_code,
    m.module_name,
    m.module_group,
    m.owner_department,
    m.control_status,
    (
      m.owner_department is not null
      and btrim(m.owner_department) <> ''
    ) as has_owner,
    coalesce(w.workflow_count, 0)::int as workflow_count,
    coalesce(a.approval_count, 0)::int as approval_count,
    coalesce(d.master_data_count, 0)::int as master_data_count,
    coalesce(r.risk_count, 0)::int as risk_count,
    coalesce(s.sop_count, 0)::int as sop_count,
    coalesce(s.legal_count, 0)::int as legal_count
  from public.heu_os_modules m
  left join (
    select module_code, count(*)::int as workflow_count
    from public.heu_os_workflows
    where status = 'ACTIVE'
      and control_status in ('DAT', 'DAT_TAM_THOI')
    group by module_code
  ) w on w.module_code = m.module_code
  left join (
    select module_code, count(*)::int as approval_count
    from public.heu_os_approval_matrix
    where status = 'ACTIVE'
      and control_status in ('DAT', 'DAT_TAM_THOI')
    group by module_code
  ) a on a.module_code = m.module_code
  left join (
    select module_code, count(*)::int as master_data_count
    from public.heu_os_master_data_map
    where status = 'ACTIVE'
      and control_status in ('DAT', 'DAT_TAM_THOI')
    group by module_code
  ) d on d.module_code = m.module_code
  left join (
    select module_code, count(*)::int as risk_count
    from public.heu_os_risk_controls
    where status = 'ACTIVE'
      and control_status in ('DAT', 'DAT_TAM_THOI')
    group by module_code
  ) r on r.module_code = m.module_code
  left join (
    select
      sr.module_code,
      count(*) filter (
        where sr.control_status in ('DAT', 'DAT_TAM_THOI')
      )::int as sop_count,
      count(distinct lr.id) filter (
        where lr.control_status in ('DAT', 'DAT_TAM_THOI')
      )::int as legal_count
    from public.sop_registry sr
    left join public.legal_registry lr on lr.id = sr.legal_registry_id
    group by sr.module_code
  ) s on s.module_code = m.module_code
  where m.status = 'ACTIVE'
),
readiness as (
  select
    *,
    (workflow_count > 0) as has_workflow,
    (approval_count > 0) as has_approval,
    (master_data_count > 0) as has_master_data,
    (risk_count > 0) as has_risk,
    (sop_count > 0) as has_sop,
    (legal_count > 0) as has_legal
  from module_counts
),
scored as (
  select
    *,
    round((
      (case when has_owner then 1 else 0 end) +
      (case when has_workflow then 1 else 0 end) +
      (case when has_approval then 1 else 0 end) +
      (case when has_master_data then 1 else 0 end) +
      (case when has_risk then 1 else 0 end) +
      (case when has_sop then 1 else 0 end) +
      (case when has_legal then 1 else 0 end)
    ) * 100.0 / 7)::int as readiness_score
  from readiness
)
select
  id,
  module_code,
  module_name,
  module_group,
  owner_department,
  control_status,
  has_owner,
  workflow_count,
  approval_count,
  master_data_count,
  risk_count,
  sop_count,
  legal_count,
  has_workflow,
  has_approval,
  has_master_data,
  has_risk,
  has_sop,
  has_legal,
  readiness_score,
  case
    when has_owner
      and has_workflow
      and has_approval
      and has_master_data
      and has_risk
      and has_sop
      and has_legal
      and control_status = 'DAT'
      then 'READY'
    when has_owner
      and has_workflow
      and has_approval
      and has_master_data
      and has_risk
      and has_sop
      and has_legal
      then 'READY_TEMP'
    when readiness_score < 60 then 'BLOCKED'
    else 'IN_PROGRESS'
  end as readiness_status,
  array_remove(array[
    case when not has_owner then 'OWNER' end,
    case when not has_workflow then 'WORKFLOW' end,
    case when not has_approval then 'APPROVAL_MATRIX' end,
    case when not has_master_data then 'MASTER_DATA' end,
    case when not has_risk then 'RISK_CONTROL' end,
    case when not has_sop then 'SOP' end,
    case when not has_legal then 'LEGAL_BASIS' end,
    case
      when control_status <> 'DAT' then 'FINAL_CONTROL_STATUS'
    end
  ], null) as missing_items,
  case
    when not (
      has_owner
      and has_workflow
      and has_approval
      and has_master_data
      and has_risk
      and has_sop
      and has_legal
    ) then 'AI_LOCKED'
    when control_status <> 'DAT' then 'AI_REVIEW_ONLY'
    else 'AI_ALLOWED_WITH_HUMAN_REVIEW'
  end as ai_gate_status
from scored;

grant select on public.heu_os_module_readiness to authenticated;

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
  'HEU_OS_MODULE_READINESS',
  'Module Readiness Gate',
  'M00_MASTER_CONTROL',
  'REPORT_VIEW',
  'IT_DATA + PHAP_CHE',
  'View tong hop dieu kien san sang production/AI cua tung module HEU OS.',
  'INTERNAL',
  true,
  'DAT_TAM_THOI'
)
on conflict (table_code) do update set
  table_name = excluded.table_name,
  module_code = excluded.module_code,
  table_type = excluded.table_type,
  data_owner_department = excluded.data_owner_department,
  purpose = excluded.purpose,
  sensitivity_level = excluded.sensitivity_level,
  ai_allowed = excluded.ai_allowed,
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
  'GATE_P0_04_MODULE_READINESS',
  'P0-04 Module Readiness Gate',
  'GO_LIVE',
  'HEU_OS',
  'MODULE_READINESS',
  'BGH + PHAP_CHE + IT_DATA',
  'Kiem tra owner, SOP, legal, data, workflow, approval va risk truoc khi production.',
  'Chi phe duyet production/AI khi view HEU_OS_MODULE_READINESS khong con muc bat buoc bi thieu.',
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
  updated_at = now();
