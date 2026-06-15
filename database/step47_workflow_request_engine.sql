-- Step 47 - P0-08 Workflow Request Engine.
-- Run after step46_approval_gate_enforcement.sql.
-- Purpose: create real workflow approval requests from the P0-07 approval gate matrix.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('workflow_request.read'),
    ('workflow_request.create'),
    ('workflow_request.check'),
    ('workflow_request.approve')
) as p(permission)
where r.code in ('ADMIN', 'BGH', 'AUDIT')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('workflow_request.read'),
    ('workflow_request.create')
) as p(permission)
where r.code in ('COUNSELOR', 'ADMISSION_STAFF', 'HOU_OPERATOR', 'CTHSSV', 'ACCOUNTING_STAFF')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('workflow_request.read'),
    ('workflow_request.create'),
    ('workflow_request.check')
) as p(permission)
where r.code in ('TEAM_LEAD', 'ADMISSION_HEAD', 'CTHSSV_LEAD', 'ACCOUNTING_LEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('workflow_request.read'),
    ('workflow_request.approve')
) as p(permission)
where r.code in ('PRINCIPAL', 'HIEU_TRUONG', 'KE_TOAN_TRUONG')
on conflict (role_id, permission) do nothing;

create or replace function public.can_read_workflow_request()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('workflow_request.read')
    or public.has_permission('workflow_request.create')
    or public.has_permission('workflow_request.check')
    or public.has_permission('workflow_request.approve')
    or public.can_read_approval_gate()
$$;

create or replace function public.can_create_workflow_request()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('workflow_request.create')
    or public.has_permission('master_control.manage')
$$;

create or replace function public.can_check_workflow_request()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('workflow_request.check')
    or public.can_check_approval_gate()
$$;

create or replace function public.can_approve_workflow_request()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('workflow_request.approve')
    or public.can_approve_approval_gate()
$$;

grant execute on function public.can_read_workflow_request() to authenticated;
grant execute on function public.can_create_workflow_request() to authenticated;
grant execute on function public.can_check_workflow_request() to authenticated;
grant execute on function public.can_approve_workflow_request() to authenticated;

create or replace function public.next_workflow_request_code(p_approval_code text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  with prefix as (
    select upper(regexp_replace(coalesce(p_approval_code, 'WORKFLOW'), '[^A-Z0-9]+', '_', 'g'))
      || '-' || to_char(now(), 'YYYYMMDD') || '-' as value
  ),
  last_no as (
    select coalesce(
      max(nullif(regexp_replace(request_code, '^.*-([0-9]{3})$', '\1'), request_code)::int),
      0
    ) as value
    from public.approval_requests ar
    cross join prefix p
    where ar.request_code like p.value || '%'
  )
  select prefix.value || lpad((last_no.value + 1)::text, 3, '0')
  from prefix, last_no
$$;

grant execute on function public.next_workflow_request_code(text) to authenticated;

drop policy if exists "approval_requests_select" on public.approval_requests;
create policy "approval_requests_select"
on public.approval_requests for select
to authenticated
using (
  public.can_read_workflow_request()
  or requested_by = auth.uid()
  or checked_by = auth.uid()
  or approved_by = auth.uid()
  or rejected_by = auth.uid()
);

drop policy if exists "approval_requests_insert" on public.approval_requests;
create policy "approval_requests_insert"
on public.approval_requests for insert
to authenticated
with check (
  public.can_create_workflow_request()
  and (
    requested_by = auth.uid()
    or created_by = auth.uid()
    or public.is_admin()
  )
);

drop policy if exists "approval_requests_update_check" on public.approval_requests;
create policy "approval_requests_update_check"
on public.approval_requests for update
to authenticated
using (
  public.can_check_workflow_request()
  or public.can_approve_workflow_request()
  or requested_by = auth.uid()
)
with check (
  public.can_check_workflow_request()
  or public.can_approve_workflow_request()
  or requested_by = auth.uid()
);

create or replace view public.workflow_request_engine_status
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
  m.module_name,
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
join public.heu_os_approval_matrix am on am.approval_code = ar.approval_code
left join public.heu_os_modules m on m.module_code = am.module_code
left join public.heu_os_workflows w on w.workflow_code = am.workflow_code
left join public.users_profile requester on requester.id = ar.requested_by
left join public.users_profile checker on checker.id = ar.checked_by
left join public.users_profile approver on approver.id = ar.approved_by
left join public.users_profile rejecter on rejecter.id = ar.rejected_by
where ar.record_status = 'ACTIVE'
  and (
    public.can_read_workflow_request()
    or ar.requested_by = auth.uid()
    or ar.checked_by = auth.uid()
    or ar.approved_by = auth.uid()
    or ar.rejected_by = auth.uid()
  );

grant select on public.workflow_request_engine_status to authenticated;

create or replace view public.workflow_request_engine_summary
with (security_invoker = true)
as
select
  count(*)::int as request_count,
  count(*) filter (where request_status = 'DRAFT')::int as draft_count,
  count(*) filter (where request_status = 'PENDING_CHECK')::int as pending_check_count,
  count(*) filter (where request_status = 'CHECKED')::int as checked_count,
  count(*) filter (where request_status = 'APPROVED')::int as approved_count,
  count(*) filter (where request_status = 'REJECTED')::int as rejected_count,
  count(*) filter (where request_status = 'NEEDS_FIX')::int as needs_fix_count,
  count(*) filter (
    where is_overdue = true
  )::int as overdue_count
from public.workflow_request_engine_status;

grant select on public.workflow_request_engine_summary to authenticated;

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
  'WORKFLOW_REQUEST_ENGINE_STATUS',
  'Workflow Request Engine Status',
  'M00_MASTER_CONTROL',
  'REPORT_VIEW',
  'BGH + OWNER_DEPARTMENT',
  'View dieu phoi request duyet theo workflow: tao, kiem, duyet, tra ve, tu choi va qua han.',
  'RESTRICTED',
  false,
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
  'GATE_P0_08_WORKFLOW_REQUEST_ENGINE',
  'P0-08 Workflow Request Engine',
  'GO_LIVE',
  'WORKFLOW_ENGINE',
  'APPROVAL_REQUESTS',
  'BGH + IT_DATA + OWNER_DEPARTMENT',
  'Kiem tra request co approval_code, entity, minh chung, nguoi tao/kiem/duyet va trang thai ro rang.',
  'Khong cho automation/AI/finance tu dong xu ly neu request chua APPROVED hoac con qua han/can sua.',
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
