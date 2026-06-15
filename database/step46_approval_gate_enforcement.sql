-- Step 46 - P0-07 Approval Gate Enforcement.
-- Run after step45_user_scope_enforcement.sql.
-- Purpose: control "right person approves" before workflow, finance or AI automation moves to production.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('approval_gate.read'),
    ('approval_gate.check'),
    ('approval_gate.approve')
) as p(permission)
where r.code in ('ADMIN', 'BGH', 'AUDIT')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('approval_gate.read'),
    ('approval_gate.check')
) as p(permission)
where r.code in (
  'ADMISSION_HEAD',
  'TEAM_LEAD',
  'CTHSSV',
  'CTHSSV_LEAD',
  'ACCOUNTING_LEAD',
  'HOU_OPERATOR'
)
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('approval_gate.read'),
    ('approval_gate.approve')
) as p(permission)
where r.code in ('PRINCIPAL', 'HIEU_TRUONG', 'KE_TOAN_TRUONG')
on conflict (role_id, permission) do nothing;

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  approval_code text not null references public.heu_os_approval_matrix(approval_code),
  request_code text not null unique,
  request_title text not null,
  entity_type text not null,
  entity_id uuid,
  entity_code text,
  request_note text,
  evidence_url text,
  maker_note text,
  checker_note text,
  approver_note text,
  request_status text not null default 'DRAFT',
  requested_by uuid references public.users_profile(id),
  checked_by uuid references public.users_profile(id),
  approved_by uuid references public.users_profile(id),
  rejected_by uuid references public.users_profile(id),
  due_at timestamptz,
  checked_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint approval_requests_status_valid check (
    request_status in (
      'DRAFT',
      'PENDING_CHECK',
      'CHECKED',
      'APPROVED',
      'REJECTED',
      'NEEDS_FIX',
      'CANCELLED'
    )
  )
);

create index if not exists idx_approval_requests_code_status
on public.approval_requests(approval_code, request_status)
where record_status = 'ACTIVE';

create index if not exists idx_approval_requests_entity
on public.approval_requests(entity_type, entity_id, entity_code)
where record_status = 'ACTIVE';

alter table public.approval_requests enable row level security;

create or replace function public.can_read_approval_gate()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('approval_gate.read')
    or public.has_permission('approval_gate.check')
    or public.has_permission('approval_gate.approve')
    or public.has_permission('master_control.read')
    or public.has_permission('master_control.manage')
    or public.has_permission('master_control.check')
    or public.has_permission('master_control.approve')
$$;

create or replace function public.can_check_approval_gate()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('approval_gate.check')
    or public.has_permission('master_control.check')
$$;

create or replace function public.can_approve_approval_gate()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('approval_gate.approve')
    or public.has_permission('master_control.approve')
$$;

grant execute on function public.can_read_approval_gate() to authenticated;
grant execute on function public.can_check_approval_gate() to authenticated;
grant execute on function public.can_approve_approval_gate() to authenticated;

drop policy if exists "approval_requests_select" on public.approval_requests;
create policy "approval_requests_select"
on public.approval_requests for select
to authenticated
using (
  public.can_read_approval_gate()
  or requested_by = auth.uid()
  or checked_by = auth.uid()
  or approved_by = auth.uid()
);

drop policy if exists "approval_requests_insert" on public.approval_requests;
create policy "approval_requests_insert"
on public.approval_requests for insert
to authenticated
with check (
  public.can_read_approval_gate()
  or requested_by = auth.uid()
  or created_by = auth.uid()
);

drop policy if exists "approval_requests_update_check" on public.approval_requests;
create policy "approval_requests_update_check"
on public.approval_requests for update
to authenticated
using (
  public.can_check_approval_gate()
  or public.can_approve_approval_gate()
  or requested_by = auth.uid()
)
with check (
  public.can_check_approval_gate()
  or public.can_approve_approval_gate()
  or requested_by = auth.uid()
);

drop trigger if exists trg_approval_requests_updated_at on public.approval_requests;
create trigger trg_approval_requests_updated_at
before update on public.approval_requests
for each row execute function public.set_updated_at();

drop trigger if exists trg_approval_requests_audit on public.approval_requests;
create trigger trg_approval_requests_audit
after insert or update or delete on public.approval_requests
for each row execute function public.write_audit_log();

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
)
select
  'GATE_' || a.approval_code,
  'Approval Gate - ' || a.decision_name,
  case
    when a.module_code = 'M08_FINANCE_ACCOUNTING' then 'FINANCE'
    when a.module_code = 'M20_AI_ASSISTANT' then 'AI_AUTOMATION'
    else 'OTHER'
  end,
  'APPROVAL_RULE',
  a.approval_code,
  coalesce(w.owner_department, m.owner_department),
  a.blocking_rule,
  a.required_evidence,
  case
    when a.control_status = 'CHUA_DU_DIEU_KIEN' then 'NEEDS_FIX'
    else 'PENDING'
  end
from public.heu_os_approval_matrix a
left join public.heu_os_workflows w on w.workflow_code = a.workflow_code
left join public.heu_os_modules m on m.module_code = a.module_code
where a.status = 'ACTIVE'
on conflict (gate_code) do update set
  gate_name = excluded.gate_name,
  gate_type = excluded.gate_type,
  entity_type = excluded.entity_type,
  entity_code = excluded.entity_code,
  owner_department = excluded.owner_department,
  checker_note = excluded.checker_note,
  approver_note = excluded.approver_note,
  updated_at = now();

create or replace view public.approval_gate_enforcement_status
with (security_invoker = true)
as
with base as (
  select
    a.id,
    a.approval_code,
    a.module_code,
    m.module_name,
    a.workflow_code,
    w.workflow_name,
    a.decision_name,
    a.decision_level,
    a.maker_role,
    a.checker_role,
    a.approver_role,
    a.required_evidence,
    a.blocking_rule,
    a.sla_hours,
    a.control_status,
    dg.gate_code,
    dg.decision_status as gate_status,
    dg.decided_by,
    dg.decided_at,
    coalesce(open_request.open_request_count, 0) as open_request_count,
    coalesce(approved_request.approved_request_count, 0) as approved_request_count,
    w.audit_rule,
    w.handover_rule
  from public.heu_os_approval_matrix a
  left join public.heu_os_modules m on m.module_code = a.module_code
  left join public.heu_os_workflows w on w.workflow_code = a.workflow_code
  left join public.decision_gates dg
    on dg.entity_type = 'APPROVAL_RULE'
    and dg.entity_code = a.approval_code
    and dg.record_status = 'ACTIVE'
  left join (
    select approval_code, count(*)::int as open_request_count
    from public.approval_requests
    where record_status = 'ACTIVE'
      and request_status in ('DRAFT', 'PENDING_CHECK', 'CHECKED', 'NEEDS_FIX')
    group by approval_code
  ) open_request on open_request.approval_code = a.approval_code
  left join (
    select approval_code, count(*)::int as approved_request_count
    from public.approval_requests
    where record_status = 'ACTIVE'
      and request_status = 'APPROVED'
    group by approval_code
  ) approved_request on approved_request.approval_code = a.approval_code
  where a.status = 'ACTIVE'
    and public.can_read_approval_gate()
),
evaluated as (
  select
    *,
    coalesce(length(trim(checker_role)), 0) > 0 as has_checker_role,
    coalesce(length(trim(approver_role)), 0) > 0 as has_approver_role,
    coalesce(length(trim(required_evidence)), 0) > 0 as has_required_evidence,
    coalesce(length(trim(blocking_rule)), 0) > 0 as has_blocking_rule,
    coalesce(length(trim(audit_rule)), 0) > 0 as has_audit_rule,
    gate_code is not null as has_decision_gate,
    gate_status = 'APPROVED' as has_approved_gate
  from base
)
select
  id,
  approval_code,
  module_code,
  module_name,
  workflow_code,
  workflow_name,
  decision_name,
  decision_level,
  maker_role,
  checker_role,
  approver_role,
  required_evidence,
  blocking_rule,
  sla_hours,
  control_status,
  gate_code,
  gate_status,
  decided_by,
  decided_at,
  open_request_count,
  approved_request_count,
  has_checker_role,
  has_approver_role,
  has_required_evidence,
  has_blocking_rule,
  has_audit_rule,
  has_decision_gate,
  has_approved_gate,
  array_remove(array[
    case when not has_checker_role then 'MISSING_CHECKER_ROLE' end,
    case when not has_approver_role then 'MISSING_APPROVER_ROLE' end,
    case when not has_required_evidence then 'MISSING_REQUIRED_EVIDENCE' end,
    case when not has_blocking_rule then 'MISSING_BLOCKING_RULE' end,
    case when not has_audit_rule then 'MISSING_AUDIT_RULE' end,
    case when not has_decision_gate then 'MISSING_DECISION_GATE' end,
    case when has_decision_gate and not has_approved_gate then 'GATE_NOT_APPROVED' end,
    case when control_status = 'CHUA_DU_DIEU_KIEN' then 'APPROVAL_RULE_NOT_READY' end
  ], null) as missing_items,
  case
    when control_status = 'CHUA_DU_DIEU_KIEN' then 'BLOCKED'
    when not has_checker_role
      or not has_approver_role
      or not has_required_evidence
      or not has_blocking_rule
      or not has_audit_rule
      or not has_decision_gate then 'NEEDS_FIX'
    when not has_approved_gate then 'NEEDS_APPROVAL'
    else 'READY'
  end as enforcement_status
from evaluated;

grant select on public.approval_gate_enforcement_status to authenticated;

create or replace view public.approval_gate_enforcement_summary
with (security_invoker = true)
as
select
  count(*)::int as approval_count,
  count(*) filter (where enforcement_status = 'READY')::int as ready_count,
  count(*) filter (where enforcement_status = 'NEEDS_APPROVAL')::int as needs_approval_count,
  count(*) filter (where enforcement_status = 'NEEDS_FIX')::int as needs_fix_count,
  count(*) filter (where enforcement_status = 'BLOCKED')::int as blocked_count,
  coalesce(sum(open_request_count), 0)::int as open_request_count,
  coalesce(sum(approved_request_count), 0)::int as approved_request_count
from public.approval_gate_enforcement_status;

grant select on public.approval_gate_enforcement_summary to authenticated;

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
) values
  (
    'APPROVAL_REQUESTS',
    'Approval Requests',
    'M00_MASTER_CONTROL',
    'TRANSACTION',
    'BGH + OWNER_DEPARTMENT',
    'Luu request duyet nghiep vu theo approval matrix, dung nguoi kiem va dung nguoi duyet.',
    'RESTRICTED',
    false,
    'DAT_TAM_THOI'
  ),
  (
    'APPROVAL_GATE_ENFORCEMENT_STATUS',
    'Approval Gate Enforcement Status',
    'M00_MASTER_CONTROL',
    'REPORT_VIEW',
    'BGH + IT_DATA',
    'View kiem tra tung diem duyet co du checker, approver, minh chung, blocking rule, audit va gate approval hay chua.',
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
  'GATE_P0_07_APPROVAL_GATE_ENFORCEMENT',
  'P0-07 Approval Gate Enforcement',
  'GO_LIVE',
  'APPROVAL_GATE',
  'ALL_APPROVALS',
  'BGH + PHAP_CHE + IT_DATA',
  'Kiem tra moi diem duyet co checker/approver/evidence/blocking/audit va decision gate.',
  'Khong cho workflow, finance, handover hoac AI automation go-live neu approval gate con BLOCKED/NEEDS_FIX.',
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
