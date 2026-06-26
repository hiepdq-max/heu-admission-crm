-- Step 94 - P2-08 TTGDTX Import Issue Resolution.
-- Run after step93_ttgdtx_import_issue_routing_p2_07.sql.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - No physical removal of business data is used.
-- - If rollback is needed, mark introduced P2-08 resolution/event records inactive
--   through an approved corrective migration and keep audit evidence.
--
-- Purpose:
-- - Turn P2-07 issue tasks into a controlled resolution workflow.
-- - Keep every action as an auditable event: start, submit fix, request approval,
--   approve, return, escalate, cancel, reopen.
-- - Do not change source accounting data directly from this step.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.import.issue.resolve'),
    ('ttgdtx.import.issue.close')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA', 'ACCOUNTING', 'ACCOUNTING_LEAD', 'KHTC')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.import.issue.resolve')
) as p(permission)
where r.code in ('PHAP_CHE', 'DAO_TAO', 'CTHSSV', 'TUYEN_SINH')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, 'ttgdtx.import.issue.close'
from public.roles r
where r.code in ('BGH', 'AUDIT')
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
  max_delegation_hours,
  ai_allowed,
  control_note,
  control_status
) values
  (
    'ttgdtx.import.issue.resolve',
    'TTGDTX',
    'Xu ly phieu loi import TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + IT_DATA + OWNER_DEPARTMENTS',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    true,
    24,
    true,
    'Cho phep cap nhat trang thai xu ly, ghi chu va minh chung. Khong cho phep sua truc tiep du lieu thu/chi.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.import.issue.close',
    'TTGDTX',
    'Duyet dong phieu loi import TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'BGH + AUDIT + KHTC',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    24,
    false,
    'Chi dong loi nghiem trong, phap che hoac ke toan khi co ghi chu xu ly va minh chung/ghi chu duyet.',
    'DAT_TAM_THOI'
  )
on conflict (permission_code) do update set
  permission_group = excluded.permission_group,
  permission_label = excluded.permission_label,
  module_code = excluded.module_code,
  owner_department = excluded.owner_department,
  risk_level = excluded.risk_level,
  grant_scope = excluded.grant_scope,
  requires_scope = excluded.requires_scope,
  requires_approval = excluded.requires_approval,
  allow_delegation = excluded.allow_delegation,
  max_delegation_hours = excluded.max_delegation_hours,
  ai_allowed = excluded.ai_allowed,
  control_note = excluded.control_note,
  control_status = excluded.control_status,
  updated_at = now();

create table if not exists public.ttgdtx_import_issue_task_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ttgdtx_import_issue_tasks(id) on delete restrict,
  event_code text not null unique,
  event_type text not null,
  from_status text,
  to_status text not null,
  actor_department text,
  actor_note text not null,
  evidence_url text,
  decision_note text,
  created_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  record_status public.record_status not null default 'ACTIVE',
  constraint ttgdtx_import_issue_task_event_type_valid check (
    event_type in (
      'COMMENT',
      'START',
      'SUBMIT_FIX',
      'REQUEST_APPROVAL',
      'APPROVE_RESOLUTION',
      'RETURN_FIX',
      'ESCALATE',
      'CANCEL',
      'REOPEN'
    )
  ),
  constraint ttgdtx_import_issue_task_event_to_status_valid check (
    to_status in (
      'OPEN',
      'IN_PROGRESS',
      'WAITING_OWNER',
      'WAITING_APPROVAL',
      'RESOLVED',
      'ESCALATED',
      'CANCELLED'
    )
  )
);

create index if not exists idx_ttgdtx_import_issue_task_events_task
on public.ttgdtx_import_issue_task_events(task_id, created_at desc)
where record_status = 'ACTIVE';

drop trigger if exists trg_ttgdtx_import_issue_task_events_audit
on public.ttgdtx_import_issue_task_events;
create trigger trg_ttgdtx_import_issue_task_events_audit
after insert or update or delete on public.ttgdtx_import_issue_task_events
for each row execute function public.write_audit_log();

alter table public.ttgdtx_import_issue_task_events enable row level security;

drop policy if exists "ttgdtx_import_issue_task_events_select"
on public.ttgdtx_import_issue_task_events;
create policy "ttgdtx_import_issue_task_events_select"
on public.ttgdtx_import_issue_task_events for select
to authenticated
using (
  exists (
    select 1
    from public.ttgdtx_import_issue_tasks t
    join public.ttgdtx_tuition_import_batches b on b.id = t.batch_id
    where t.id = ttgdtx_import_issue_task_events.task_id
      and public.can_read_ttgdtx_import_issue(b.admission_segment_id)
  )
);

drop policy if exists "ttgdtx_import_issue_task_events_manage"
on public.ttgdtx_import_issue_task_events;
create policy "ttgdtx_import_issue_task_events_manage"
on public.ttgdtx_import_issue_task_events for all
to authenticated
using (
  public.can_manage_ttgdtx_import_issue()
  or public.has_permission('ttgdtx.import.issue.resolve')
  or public.has_permission('ttgdtx.import.issue.close')
)
with check (
  public.can_manage_ttgdtx_import_issue()
  or public.has_permission('ttgdtx.import.issue.resolve')
  or public.has_permission('ttgdtx.import.issue.close')
);

create or replace function public.resolve_ttgdtx_import_issue_task(
  target_task_id uuid,
  next_action text,
  actor_note text,
  evidence_url text default null,
  decision_note text default null
)
returns table (
  task_id uuid,
  task_code text,
  task_status text,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  task_row public.ttgdtx_import_issue_tasks%rowtype;
  segment_id uuid;
  normalized_action text := upper(trim(coalesce(next_action, '')));
  normalized_note text := nullif(trim(coalesce(actor_note, '')), '');
  normalized_evidence text := nullif(trim(coalesce(evidence_url, '')), '');
  normalized_decision text := nullif(trim(coalesce(decision_note, '')), '');
  previous_status text;
  target_status text;
  needs_close_permission boolean := false;
  needs_evidence_or_decision boolean := false;
begin
  select *
  into task_row
  from public.ttgdtx_import_issue_tasks
  where id = target_task_id
    and record_status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'P2-08: Khong tim thay phieu loi can xu ly.';
  end if;

  select b.admission_segment_id
  into segment_id
  from public.ttgdtx_tuition_import_batches b
  where b.id = task_row.batch_id;

  if auth.uid() is not null
    and not public.can_read_ttgdtx_import_issue(segment_id) then
    raise exception 'P2-08: Tai khoan khong co quyen xem phieu loi nay.';
  end if;

  if auth.uid() is not null
    and not (
      public.can_manage_ttgdtx_import_issue()
      or public.has_permission('ttgdtx.import.issue.resolve')
      or public.has_permission('ttgdtx.import.issue.close')
    ) then
    raise exception 'P2-08: Tai khoan chua co quyen xu ly phieu loi import TTGDTX.';
  end if;

  if normalized_note is null then
    raise exception 'P2-08: Can nhap ghi chu xu ly de luu log.';
  end if;

  previous_status := task_row.task_status;

  if normalized_action = 'START' then
    if previous_status in ('RESOLVED', 'CANCELLED') then
      raise exception 'P2-08: Phieu da dong/huy. Neu can xu ly lai hay chon Mo lai.';
    end if;
    target_status := 'IN_PROGRESS';

  elsif normalized_action = 'SUBMIT_FIX' then
    if previous_status in ('RESOLVED', 'CANCELLED') then
      raise exception 'P2-08: Phieu da dong/huy. Neu can xu ly lai hay chon Mo lai.';
    end if;

    if task_row.requires_approval
      or task_row.severity in ('ERROR', 'CRITICAL')
      or task_row.issue_category = 'LEGAL_FINANCE' then
      target_status := 'WAITING_APPROVAL';
    else
      target_status := 'RESOLVED';
    end if;

  elsif normalized_action = 'REQUEST_APPROVAL' then
    if previous_status in ('RESOLVED', 'CANCELLED') then
      raise exception 'P2-08: Phieu da dong/huy. Neu can xu ly lai hay chon Mo lai.';
    end if;
    target_status := 'WAITING_APPROVAL';

  elsif normalized_action = 'APPROVE_RESOLUTION' then
    needs_close_permission := true;
    target_status := 'RESOLVED';
    needs_evidence_or_decision := task_row.requires_approval
      or task_row.severity in ('ERROR', 'CRITICAL')
      or task_row.issue_category = 'LEGAL_FINANCE';

  elsif normalized_action = 'RETURN_FIX' then
    needs_close_permission := true;
    target_status := 'WAITING_OWNER';

  elsif normalized_action = 'ESCALATE' then
    target_status := 'ESCALATED';

  elsif normalized_action = 'CANCEL' then
    needs_close_permission := true;
    target_status := 'CANCELLED';

  elsif normalized_action = 'REOPEN' then
    needs_close_permission := true;
    target_status := 'OPEN';

  else
    raise exception 'P2-08: Thao tac khong hop le.';
  end if;

  if auth.uid() is not null
    and needs_close_permission
    and not (
      public.is_admin()
      or public.current_user_role_code() = 'BGH'
      or public.has_permission('ttgdtx.import.issue.close')
      or public.has_permission('ttgdtx.import.issue.approve')
    ) then
    raise exception 'P2-08: Thao tac nay can quyen duyet/dong phieu loi.';
  end if;

  if needs_evidence_or_decision
    and coalesce(normalized_evidence, task_row.evidence_url, normalized_decision) is null then
    raise exception 'P2-08: Loi nghiem trong/phap che/ke toan can link minh chung hoac ghi chu duyet truoc khi dong.';
  end if;

  update public.ttgdtx_import_issue_tasks as t
  set
    task_status = target_status,
    resolution_note = case
      when normalized_action in ('SUBMIT_FIX', 'APPROVE_RESOLUTION', 'RETURN_FIX', 'ESCALATE', 'CANCEL', 'REOPEN')
        then normalized_note
      else t.resolution_note
    end,
    evidence_url = coalesce(normalized_evidence, t.evidence_url),
    updated_by = coalesce(auth.uid(), t.updated_by),
    updated_at = now()
  where t.id = task_row.id;

  insert into public.ttgdtx_import_issue_task_events (
    task_id,
    event_code,
    event_type,
    from_status,
    to_status,
    actor_department,
    actor_note,
    evidence_url,
    decision_note,
    created_by
  ) values (
    task_row.id,
    'P2-08-' || regexp_replace(task_row.task_code, '[^A-Za-z0-9_]+', '-', 'g')
      || '-' || replace(gen_random_uuid()::text, '-', ''),
    normalized_action,
    previous_status,
    target_status,
    task_row.owner_department,
    normalized_note,
    normalized_evidence,
    normalized_decision,
    auth.uid()
  );

  return query
  select
    task_row.id,
    task_row.task_code,
    target_status,
    case
      when target_status = 'RESOLVED' then 'P2-08: Da dong phieu loi.'
      when target_status = 'WAITING_APPROVAL' then 'P2-08: Da chuyen cho duyet.'
      when target_status = 'WAITING_OWNER' then 'P2-08: Da tra ve don vi xu ly.'
      when target_status = 'ESCALATED' then 'P2-08: Da bao cap tren.'
      when target_status = 'CANCELLED' then 'P2-08: Da huy phieu.'
      when target_status = 'OPEN' then 'P2-08: Da mo lai phieu.'
      else 'P2-08: Da cap nhat phieu loi.'
    end;
end;
$$;

grant execute on function public.resolve_ttgdtx_import_issue_task(uuid, text, text, text, text)
to authenticated;

create or replace view public.ttgdtx_import_issue_resolution_timeline
with (security_invoker = true)
as
select
  e.id as event_id,
  e.event_code,
  e.task_id,
  t.task_code,
  t.issue_title,
  e.event_type,
  case e.event_type
    when 'COMMENT' then 'Ghi chu'
    when 'START' then 'Bat dau xu ly'
    when 'SUBMIT_FIX' then 'Da xu ly, chuyen kiem/duyet'
    when 'REQUEST_APPROVAL' then 'Chuyen cho duyet'
    when 'APPROVE_RESOLUTION' then 'Duyet dong loi'
    when 'RETURN_FIX' then 'Tra ve bo sung'
    when 'ESCALATE' then 'Bao cap tren'
    when 'CANCEL' then 'Huy phieu'
    when 'REOPEN' then 'Mo lai'
    else e.event_type
  end as event_type_label,
  e.from_status,
  e.to_status,
  e.actor_department,
  e.actor_note,
  e.evidence_url,
  e.decision_note,
  u.full_name as created_by_name,
  e.created_at
from public.ttgdtx_import_issue_task_events e
join public.ttgdtx_import_issue_tasks t on t.id = e.task_id
left join public.users_profile u on u.id = e.created_by
where e.record_status = 'ACTIVE'
  and exists (
    select 1
    from public.ttgdtx_tuition_import_batches b
    where b.id = t.batch_id
      and public.can_read_ttgdtx_import_issue(b.admission_segment_id)
  );

grant select on public.ttgdtx_import_issue_resolution_timeline to authenticated;

insert into public.admission_segment_operation_steps (
  segment_id,
  step_code,
  step_name,
  step_group,
  owner_department,
  action_href,
  required_for_operation,
  control_note,
  sort_order,
  control_status
)
select
  s.id,
  'TTGDTX_IMPORT_ISSUE_RESOLUTION',
  'P2-08 Xu ly va dong phieu loi import TTGDTX',
  'FINANCE',
  'KHTC + IT_DATA + AUDIT + OWNER_DEPARTMENTS',
  '/ttgdtx/import/issues',
  true,
  'P2-08 cap nhat trang thai xu ly, minh chung va duyet dong phieu loi P2-07; khong sua truc tiep du lieu nguon.',
  70,
  'DAT_TAM_THOI'
from public.admission_segments s
where s.segment_code = 'TC9_TTGDTX_LINKED'
  and s.status = 'ACTIVE'
on conflict (segment_id, step_code) do update set
  step_name = excluded.step_name,
  step_group = excluded.step_group,
  owner_department = excluded.owner_department,
  action_href = excluded.action_href,
  required_for_operation = excluded.required_for_operation,
  control_note = excluded.control_note,
  sort_order = excluded.sort_order,
  control_status = excluded.control_status,
  updated_at = now();

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
  'WF_P2_08_TTGDTX_IMPORT_ISSUE_RESOLUTION',
  'P2-08 Xu ly va dong phieu loi import TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Khi P2-07 da sinh phieu loi can don vi phu trach xu ly, kiem tra, duyet dong hoac bao cap tren.',
  'OWNER_DEPARTMENTS',
  'KHTC + IT_DATA + AUDIT + OWNER_DEPARTMENTS',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/KE_TOAN_TRUONG',
  'Moi phieu loi co trang thai, ghi chu xu ly, minh chung va lich su xu ly.',
  'Loi thuoc don vi nao thi don vi do cap nhat; loi nghiem trong/phap che/ke toan phai co quyen duyet dong.',
  'Moi action P2-08 tao event rieng va trigger audit log; khong thay the chung tu ke toan.',
  2080,
  'DAT_TAM_THOI'
)
on conflict (workflow_code) do update set
  workflow_name = excluded.workflow_name,
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
  'P2_08_TTGDTX_IMPORT_ISSUE_EVENTS',
  'P2-08 lich su xu ly phieu loi import TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_import_issue_task_events; ttgdtx_import_issue_resolution_timeline',
  'TRANSACTION',
  'KHTC + IT_DATA + AUDIT + OWNER_DEPARTMENTS',
  'SUPABASE',
  'RESTRICTED',
  true,
  'Chi them event xu ly qua function P2-08. Khong sua/xoa lich su xu ly neu khong co audit va phe duyet.',
  'DAT_TAM_THOI'
)
on conflict (data_code) do update set
  data_name = excluded.data_name,
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
  'OWN_P2_08_TTGDTX_IMPORT_ISSUE_RESOLUTION',
  'P2-08 Xu ly va dong phieu loi import TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_08_TTGDTX_IMPORT_ISSUE_RESOLUTION',
  'TTGDTX_IMPORT_ISSUE_EVENT',
  'ttgdtx_import_issue_task_events',
  'KHTC + IT_DATA + AUDIT + OWNER_DEPARTMENTS',
  'OWNER_DEPARTMENTS',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/KE_TOAN_TRUONG',
  'ROLE_AND_SCOPE',
  'P2-07',
  'KHTC + IT_DATA + PHAP_CHE + CTHSSV + DAO_TAO + AUDIT',
  'Ghi chu xu ly, minh chung neu co, ghi chu duyet voi loi nghiem trong/phap che/ke toan.',
  'Moi cap nhat P2-08 sinh event va audit log; khong dong loi nghiêm trong khi thieu minh chung/ghi chu duyet.',
  24,
  'CRITICAL',
  'DAT_TAM_THOI'
)
on conflict (ownership_code) do update set
  process_name = excluded.process_name,
  module_code = excluded.module_code,
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
  decision_status
) values (
  'GATE_P2_08_TTGDTX_IMPORT_ISSUE_RESOLUTION',
  'Gate P2-08: xu ly va dong loi import TTGDTX co minh chung',
  'SOP',
  'TTGDTX_IMPORT_ISSUE_EVENT',
  'P2-08-ISSUE-RESOLUTION',
  'KHTC + IT_DATA + AUDIT',
  'Kiem tra action P2-08 co dung loai loi, dung owner, dung minh chung va khong thay doi du lieu goc.',
  'Loi nghiem trong, phap che hoac ke toan chi duoc dong khi co quyen duyet va co minh chung/ghi chu duyet.',
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
  decision_status = excluded.decision_status,
  updated_at = now();
