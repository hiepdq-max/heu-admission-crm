-- Step 121 - Data Confirmation Task Center core contract.
-- File: database/step121_data_confirmation_task_center.sql
-- Purpose:
-- - Create the controlled task rail for department/user data confirmation.
-- - Lock the five task-center statuses requested by the executive decision.
-- - CONTROLLED_PILOT_DEPARTMENT_ONLY: lock task routing to the six controlled
--   pilot departments only.
-- - DCTC_SOURCE_PROVENANCE_LOCK_READY: route tasks require source label,
--   data domain, source route, DQ check ref, controlled evidence ref,
--   due/batch and owner decision ref before CHO_XAC_NHAN.
-- - DCTC_OWNER_ASSIGNEE_DEPARTMENT_MATCH_READY: owner and assigned users
--   must be active and match the task department before CHO_XAC_NHAN.
-- - DCTC_RPC_ONLY_MUTATION_LOCK_READY: authenticated users may read the
--   filtered task/timeline surfaces, but task creation and status mutation must
--   go through route_data_confirmation_task and confirm_data_confirmation_task.
-- - Preserve status history through audit_log triggers and a status-history table.
-- - Route confirmation by assigned user, owner user, or scope-bound department /
--   workspace lane; global route/manage permission is not a final confirmation
--   bypass and no real tasks are seeded.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, signed migration order,
-- signed UAT, controlled evidence, owner GO/NO-GO and production Go/No-Go.
-- Secret boundary: do not paste passwords, OTPs, invite/reset links,
-- service-role keys, raw PII, CCCD, bank data, vouchers or screenshots into
-- SQL comments, logs, task notes or evidence references.

begin;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'data_confirmation_task_status'
      and n.nspname = 'public'
  ) then
    create type public.data_confirmation_task_status as enum (
      'CHO_XAC_NHAN',
      'DUNG',
      'CAN_SUA',
      'KHONG_THUOC_TOI',
      'DA_KHOA'
    );
  end if;
end $$;

create table if not exists public.heu_data_confirmation_tasks (
  id uuid primary key default gen_random_uuid(),
  task_code text not null unique,
  department_code text not null,
  owner_user_id uuid references public.users_profile(id),
  assigned_user_id uuid references public.users_profile(id),
  admission_segment_id uuid references public.admission_segments(id),
  source_record_label text not null,
  source_route text,
  data_domain text not null,
  dq_check_ref text,
  controlled_evidence_ref text,
  due_date_or_batch text not null,
  owner_decision_ref text not null,
  scope_gate_ref text not null,
  task_center_status public.data_confirmation_task_status not null default 'CHO_XAC_NHAN',
  blocker_state text not null default 'WAITING_OWNER_CONFIRMATION',
  status_note text,
  repair_note text,
  confirmed_by uuid references public.users_profile(id),
  confirmed_at timestamptz,
  locked_by uuid references public.users_profile(id),
  locked_at timestamptz,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_data_confirmation_tasks_department_valid check (
    department_code in (
      'KHTC',
      'TUYEN_SINH',
      'CTHSSV',
      'DAO_TAO',
      'KHOA',
      'SHORT_COURSE'
    )
  ),
  constraint heu_data_confirmation_tasks_blocker_valid check (
    blocker_state in (
      'WAITING_OWNER_CONFIRMATION',
      'CONFIRMED_BY_DEPARTMENT',
      'RETURNED_FOR_REPAIR',
      'OUT_OF_SCOPE',
      'LOCKED',
      'BLOCKED_BY_SCOPE',
      'SIGNED_UAT_READY_EXTERNAL'
    )
  ),
  constraint heu_data_confirmation_tasks_confirmed_pair check (
    (
      task_center_status in ('DUNG', 'CAN_SUA', 'KHONG_THUOC_TOI', 'DA_KHOA')
      and confirmed_by is not null
      and confirmed_at is not null
    )
    or (
      task_center_status = 'CHO_XAC_NHAN'
      and confirmed_by is null
      and confirmed_at is null
    )
  ),
  constraint heu_data_confirmation_tasks_locked_pair check (
    (
      task_center_status = 'DA_KHOA'
      and locked_by is not null
      and locked_at is not null
    )
    or task_center_status <> 'DA_KHOA'
  )
);

alter table public.heu_data_confirmation_tasks
add column if not exists due_date_or_batch text;

alter table public.heu_data_confirmation_tasks
add column if not exists owner_decision_ref text;

alter table public.heu_data_confirmation_tasks
add column if not exists scope_gate_ref text;

create table if not exists public.heu_data_confirmation_task_status_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.heu_data_confirmation_tasks(id) on delete restrict,
  previous_status public.data_confirmation_task_status,
  next_status public.data_confirmation_task_status not null,
  actor_user_id uuid references public.users_profile(id),
  action_note text,
  controlled_evidence_ref text,
  created_at timestamptz not null default now()
);

create index if not exists idx_heu_dctc_tasks_department_status
on public.heu_data_confirmation_tasks(department_code, task_center_status, updated_at desc)
where record_status = 'ACTIVE';

create index if not exists idx_heu_dctc_tasks_assigned_user
on public.heu_data_confirmation_tasks(assigned_user_id, task_center_status, updated_at desc)
where record_status = 'ACTIVE';

create index if not exists idx_heu_dctc_tasks_owner_user
on public.heu_data_confirmation_tasks(owner_user_id, task_center_status, updated_at desc)
where record_status = 'ACTIVE';

create index if not exists idx_heu_dctc_tasks_segment
on public.heu_data_confirmation_tasks(admission_segment_id, task_center_status, updated_at desc)
where record_status = 'ACTIVE';

create index if not exists idx_heu_dctc_history_task
on public.heu_data_confirmation_task_status_history(task_id, created_at desc);

alter table public.heu_data_confirmation_tasks enable row level security;
alter table public.heu_data_confirmation_task_status_history enable row level security;

create or replace function public.can_read_data_confirmation_task(
  task_department_code text,
  task_assigned_user_id uuid,
  task_owner_user_id uuid,
  task_segment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.is_executive_role()
    or public.has_permission('data_confirmation.read')
    or public.has_permission('data_confirmation.route')
    or public.has_permission('data_confirmation.confirm')
    or public.has_permission('reports.read_all')
    or public.has_permission('audit.read')
    or task_assigned_user_id = auth.uid()
    or task_owner_user_id = auth.uid()
    or exists (
      select 1
      from public.users_profile up
      left join public.admission_departments d on d.id = up.department_id
      where up.id = auth.uid()
        and up.status = 'ACTIVE'
        and (
          d.code = task_department_code
          or (
            task_department_code = 'KHTC'
            and public.current_user_role_code() in ('ACCOUNTING', 'ACCOUNTING_LEAD')
          )
        )
    )
    or (
      task_segment_id is not null
      and public.can_use_admission_workspace(task_segment_id)
    )
$$;

create or replace function public.can_route_data_confirmation_task()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('data_confirmation.route')
    or public.has_permission('data_confirmation.manage')
    or public.can_manage_permission_matrix()
$$;

create or replace function public.can_confirm_data_confirmation_task(
  task_department_code text,
  task_assigned_user_id uuid,
  task_owner_user_id uuid,
  task_segment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- DCTC_SCOPE_BOUND_CONFIRMER_LOCK_READY /
  -- NO_GLOBAL_CONFIRM_PERMISSION_BYPASS:
  -- final confirmation must stay inside the task's assigned, owner,
  -- department or workspace lane.
  select
    task_assigned_user_id = auth.uid()
    or task_owner_user_id = auth.uid()
    or exists (
      select 1
      from public.users_profile up
      left join public.admission_departments d on d.id = up.department_id
      where up.id = auth.uid()
        and up.status = 'ACTIVE'
        and d.code = task_department_code
        and public.has_permission('data_confirmation.confirm')
    )
    or (
      task_segment_id is not null
      and public.can_use_admission_workspace(task_segment_id)
      and public.has_permission('data_confirmation.confirm')
    )
$$;

create or replace function public.dctc_user_matches_department(
  candidate_user_id uuid,
  task_department_code text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users_profile up
    join public.admission_departments d on d.id = up.department_id
    where up.id = candidate_user_id
      and up.status = 'ACTIVE'
      and d.status = 'ACTIVE'
      and d.code = task_department_code
  )
$$;

grant execute on function public.can_read_data_confirmation_task(text, uuid, uuid, uuid) to authenticated;
grant execute on function public.can_route_data_confirmation_task() to authenticated;
grant execute on function public.can_confirm_data_confirmation_task(text, uuid, uuid, uuid) to authenticated;
grant execute on function public.dctc_user_matches_department(uuid, text) to authenticated;

create or replace function public.route_data_confirmation_task(
  p_task_code text,
  p_department_code text,
  p_source_record_label text,
  p_data_domain text,
  p_source_route text default null,
  p_owner_user_id uuid default null,
  p_assigned_user_id uuid default null,
  p_admission_segment_id uuid default null,
  p_dq_check_ref text default null,
  p_controlled_evidence_ref text default null,
  p_due_date_or_batch text default null,
  p_owner_decision_ref text default null,
  p_scope_gate_ref text default null,
  p_status_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_user_id uuid;
  cleaned_task_code text;
  cleaned_department_code text;
  cleaned_source_record_label text;
  cleaned_data_domain text;
  cleaned_source_route text;
  cleaned_dq_check_ref text;
  cleaned_controlled_evidence_ref text;
  cleaned_due_date_or_batch text;
  cleaned_owner_decision_ref text;
  cleaned_scope_gate_ref text;
  cleaned_status_note text;
  new_task_id uuid := gen_random_uuid();
begin
  acting_user_id = auth.uid();
  cleaned_task_code = nullif(trim(coalesce(p_task_code, '')), '');
  cleaned_department_code = upper(nullif(trim(coalesce(p_department_code, '')), ''));
  cleaned_source_record_label = nullif(trim(coalesce(p_source_record_label, '')), '');
  cleaned_data_domain = nullif(trim(coalesce(p_data_domain, '')), '');
  cleaned_source_route = nullif(trim(coalesce(p_source_route, '')), '');
  cleaned_dq_check_ref = nullif(trim(coalesce(p_dq_check_ref, '')), '');
  cleaned_controlled_evidence_ref = nullif(trim(coalesce(p_controlled_evidence_ref, '')), '');
  cleaned_due_date_or_batch = nullif(trim(coalesce(p_due_date_or_batch, '')), '');
  cleaned_owner_decision_ref = nullif(trim(coalesce(p_owner_decision_ref, '')), '');
  cleaned_scope_gate_ref = nullif(trim(coalesce(p_scope_gate_ref, '')), '');
  cleaned_status_note = nullif(trim(coalesce(p_status_note, '')), '');

  if acting_user_id is null then
    raise exception 'Authentication is required to route a data-confirmation task';
  end if;

  if not public.can_route_data_confirmation_task() then
    raise exception 'Not allowed to route data-confirmation tasks';
  end if;

  -- DCTC_SOURCE_PROVENANCE_LOCK_READY /
  -- SOURCE_METADATA_REQUIRED_BEFORE_CHO_XAC_NHAN:
  -- the task center only routes approved source metadata, never raw payloads.
  if cleaned_task_code is null
    or cleaned_department_code is null
    or cleaned_source_record_label is null
    or cleaned_data_domain is null
    or cleaned_source_route is null
    or cleaned_dq_check_ref is null
    or cleaned_controlled_evidence_ref is null
    or cleaned_due_date_or_batch is null
    or cleaned_owner_decision_ref is null
  then
    raise exception 'Task code, department, source label, data domain, source route, DQ check ref, controlled evidence ref, due date or batch and owner decision ref are required';
  end if;

  -- DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN /
  -- SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN:
  -- the route must carry the scope/permission gate reference, but it does not grant access.
  if cleaned_scope_gate_ref is null then
    raise exception 'Data-confirmation task requires scope gate ref before CHO_XAC_NHAN';
  end if;

  -- DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY /
  -- OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN:
  -- routed tasks must name both the owner lane and assigned user.
  if p_owner_user_id is null or p_assigned_user_id is null then
    raise exception 'Data-confirmation task requires both owner user lane and assigned user before CHO_XAC_NHAN';
  end if;

  if cleaned_department_code not in (
    'KHTC',
    'TUYEN_SINH',
    'CTHSSV',
    'DAO_TAO',
    'KHOA',
    'SHORT_COURSE'
  ) then
    raise exception 'Invalid data-confirmation department code';
  end if;

  -- DCTC_OWNER_ASSIGNEE_DEPARTMENT_MATCH_READY /
  -- OWNER_ASSIGNEE_MUST_MATCH_TASK_DEPARTMENT:
  -- a waiting task belongs to one department lane only.
  if not public.dctc_user_matches_department(p_owner_user_id, cleaned_department_code)
    or not public.dctc_user_matches_department(p_assigned_user_id, cleaned_department_code)
  then
    raise exception 'Owner and assigned users must match the data-confirmation department';
  end if;

  insert into public.heu_data_confirmation_tasks (
    id,
    task_code,
    department_code,
    owner_user_id,
    assigned_user_id,
    admission_segment_id,
    source_record_label,
    source_route,
    data_domain,
    dq_check_ref,
    controlled_evidence_ref,
    due_date_or_batch,
    owner_decision_ref,
    scope_gate_ref,
    task_center_status,
    blocker_state,
    status_note,
    created_by,
    updated_by
  ) values (
    new_task_id,
    cleaned_task_code,
    cleaned_department_code,
    p_owner_user_id,
    p_assigned_user_id,
    p_admission_segment_id,
    cleaned_source_record_label,
    cleaned_source_route,
    cleaned_data_domain,
    cleaned_dq_check_ref,
    cleaned_controlled_evidence_ref,
    cleaned_due_date_or_batch,
    cleaned_owner_decision_ref,
    cleaned_scope_gate_ref,
    'CHO_XAC_NHAN',
    'WAITING_OWNER_CONFIRMATION',
    cleaned_status_note,
    acting_user_id,
    acting_user_id
  );

  insert into public.heu_data_confirmation_task_status_history (
    task_id,
    previous_status,
    next_status,
    actor_user_id,
    action_note,
    controlled_evidence_ref
  ) values (
    new_task_id,
    null,
    'CHO_XAC_NHAN',
    acting_user_id,
    coalesce(cleaned_status_note, 'Routed to waiting owner confirmation'),
    cleaned_controlled_evidence_ref
  );

  return new_task_id;
exception
  when unique_violation then
    raise exception 'Data-confirmation task code already exists';
end;
$$;

grant execute on function public.route_data_confirmation_task(
  text,
  text,
  text,
  text,
  text,
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;

create or replace function public.confirm_data_confirmation_task(
  p_task_id uuid,
  p_next_status public.data_confirmation_task_status,
  p_note text default null,
  p_controlled_evidence_ref text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  task_row public.heu_data_confirmation_tasks%rowtype;
  acting_user_id uuid;
  cleaned_note text;
  cleaned_controlled_evidence_ref text;
begin
  acting_user_id = auth.uid();

  if acting_user_id is null then
    raise exception 'Authentication is required to confirm a data-confirmation task';
  end if;

  select *
  into task_row
  from public.heu_data_confirmation_tasks
  where id = p_task_id
    and record_status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'Data-confirmation task not found or inactive';
  end if;

  if task_row.task_center_status = 'DA_KHOA' then
    raise exception 'Data-confirmation task is already locked';
  end if;

  if task_row.task_center_status <> 'CHO_XAC_NHAN' then
    raise exception 'Data-confirmation task can only be confirmed from CHO_XAC_NHAN';
  end if;

  if p_next_status = 'CHO_XAC_NHAN' then
    raise exception 'Use task routing to keep CHO_XAC_NHAN; confirmation cannot reset a task';
  end if;

  cleaned_note = nullif(trim(coalesce(p_note, '')), '');
  cleaned_controlled_evidence_ref = nullif(trim(coalesce(p_controlled_evidence_ref, '')), '');

  -- REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED: owner handoff needs a reason.
  if p_next_status in ('CAN_SUA', 'KHONG_THUOC_TOI')
    and cleaned_note is null
  then
    raise exception 'CAN_SUA and KHONG_THUOC_TOI require confirmation note';
  end if;

  if p_next_status = 'DA_KHOA'
    and (
      cleaned_note is null
      or coalesce(cleaned_controlled_evidence_ref, task_row.controlled_evidence_ref) is null
    )
  then
    raise exception 'DA_KHOA requires lock note and controlled evidence ref';
  end if;

  if not public.can_confirm_data_confirmation_task(
    task_row.department_code,
    task_row.assigned_user_id,
    task_row.owner_user_id,
    task_row.admission_segment_id
  ) then
    raise exception 'Not allowed to confirm this data-confirmation task';
  end if;

  insert into public.heu_data_confirmation_task_status_history (
    task_id,
    previous_status,
    next_status,
    actor_user_id,
    action_note,
    controlled_evidence_ref
  ) values (
    task_row.id,
    task_row.task_center_status,
    p_next_status,
    acting_user_id,
    cleaned_note,
    cleaned_controlled_evidence_ref
  );

  update public.heu_data_confirmation_tasks
  set
    task_center_status = p_next_status,
    blocker_state = case p_next_status
      when 'DUNG' then 'CONFIRMED_BY_DEPARTMENT'
      when 'CAN_SUA' then 'RETURNED_FOR_REPAIR'
      when 'KHONG_THUOC_TOI' then 'OUT_OF_SCOPE'
      when 'DA_KHOA' then 'LOCKED'
      else blocker_state
    end,
    status_note = cleaned_note,
    controlled_evidence_ref = coalesce(
      cleaned_controlled_evidence_ref,
      controlled_evidence_ref
    ),
    confirmed_by = acting_user_id,
    confirmed_at = now(),
    locked_by = case when p_next_status = 'DA_KHOA' then acting_user_id else locked_by end,
    locked_at = case when p_next_status = 'DA_KHOA' then now() else locked_at end,
    updated_by = acting_user_id,
    updated_at = now()
  where id = task_row.id;

  return task_row.id;
end;
$$;

grant execute on function public.confirm_data_confirmation_task(
  uuid,
  public.data_confirmation_task_status,
  text,
  text
) to authenticated;

drop policy if exists "heu_dctc_tasks_select"
on public.heu_data_confirmation_tasks;
create policy "heu_dctc_tasks_select"
on public.heu_data_confirmation_tasks for select
to authenticated
using (
  record_status = 'ACTIVE'
  and public.can_read_data_confirmation_task(
    department_code,
    assigned_user_id,
    owner_user_id,
    admission_segment_id
  )
);

drop policy if exists "heu_dctc_tasks_controlled_insert"
on public.heu_data_confirmation_tasks;
drop policy if exists "heu_dctc_tasks_controlled_update"
on public.heu_data_confirmation_tasks;
-- DCTC_RPC_ONLY_MUTATION_LOCK_READY / NO_DIRECT_TABLE_UPDATE:
-- Do not recreate direct insert/update policies for authenticated users.
-- route_data_confirmation_task and confirm_data_confirmation_task are the only
-- authenticated write paths for task rows and status history.

drop policy if exists "heu_dctc_history_select"
on public.heu_data_confirmation_task_status_history;
create policy "heu_dctc_history_select"
on public.heu_data_confirmation_task_status_history for select
to authenticated
using (
  exists (
    select 1
    from public.heu_data_confirmation_tasks t
    where t.id = heu_data_confirmation_task_status_history.task_id
      and public.can_read_data_confirmation_task(
        t.department_code,
        t.assigned_user_id,
        t.owner_user_id,
        t.admission_segment_id
      )
  )
);

drop policy if exists "heu_dctc_history_rpc_insert_only"
on public.heu_data_confirmation_task_status_history;
-- DCTC_RPC_ONLY_MUTATION_LOCK_READY / NO_DIRECT_STATUS_HISTORY_INSERT:
-- Status history is appended only inside route_data_confirmation_task and
-- confirm_data_confirmation_task so the task state and history cannot drift.

drop trigger if exists trg_heu_data_confirmation_tasks_updated_at
on public.heu_data_confirmation_tasks;
create trigger trg_heu_data_confirmation_tasks_updated_at
before update on public.heu_data_confirmation_tasks
for each row execute function public.set_updated_at();

drop trigger if exists trg_heu_data_confirmation_tasks_audit
on public.heu_data_confirmation_tasks;
create trigger trg_heu_data_confirmation_tasks_audit
after insert or update or delete on public.heu_data_confirmation_tasks
for each row execute function public.write_audit_log();

drop trigger if exists trg_heu_data_confirmation_task_status_history_audit
on public.heu_data_confirmation_task_status_history;
create trigger trg_heu_data_confirmation_task_status_history_audit
after insert or update or delete on public.heu_data_confirmation_task_status_history
for each row execute function public.write_audit_log();

create or replace view public.heu_data_confirmation_task_center
with (security_invoker = true)
as
select
  t.id,
  t.task_code,
  t.department_code,
  t.owner_user_id,
  owner_user.full_name as owner_user_name,
  t.assigned_user_id,
  assigned_user.full_name as assigned_user_name,
  t.admission_segment_id,
  s.segment_code,
  s.segment_name,
  t.source_record_label,
  t.source_route,
  t.data_domain,
  t.dq_check_ref,
  t.controlled_evidence_ref,
  t.due_date_or_batch,
  t.owner_decision_ref,
  t.scope_gate_ref,
  t.task_center_status,
  t.blocker_state,
  t.status_note,
  t.repair_note,
  t.confirmed_by,
  confirmer.full_name as confirmed_by_name,
  t.confirmed_at,
  t.locked_by,
  locker.full_name as locked_by_name,
  t.locked_at,
  ('DCTC_TASK:' || t.task_code) as audit_trace_ref,
  coalesce(public.can_confirm_data_confirmation_task(
    t.department_code,
    t.assigned_user_id,
    t.owner_user_id,
    t.admission_segment_id
  ), false) as can_current_user_confirm,
  t.record_status,
  t.created_at,
  t.updated_at
from public.heu_data_confirmation_tasks t
left join public.users_profile owner_user on owner_user.id = t.owner_user_id
left join public.users_profile assigned_user on assigned_user.id = t.assigned_user_id
left join public.users_profile confirmer on confirmer.id = t.confirmed_by
left join public.users_profile locker on locker.id = t.locked_by
left join public.admission_segments s on s.id = t.admission_segment_id
where t.record_status = 'ACTIVE'
  and public.can_read_data_confirmation_task(
    t.department_code,
    t.assigned_user_id,
    t.owner_user_id,
    t.admission_segment_id
  );

grant select on public.heu_data_confirmation_task_center to authenticated;

create or replace view public.heu_data_confirmation_task_status_timeline
with (security_invoker = true)
as
select
  h.id as history_id,
  h.task_id,
  t.task_code,
  t.department_code,
  t.owner_user_id,
  t.assigned_user_id,
  t.source_record_label,
  t.due_date_or_batch,
  t.owner_decision_ref,
  t.scope_gate_ref,
  h.previous_status,
  h.next_status,
  h.actor_user_id,
  actor.full_name as actor_user_name,
  h.action_note,
  h.controlled_evidence_ref,
  ('DCTC_HISTORY:' || h.id::text) as audit_trace_ref,
  h.created_at
from public.heu_data_confirmation_task_status_history h
join public.heu_data_confirmation_tasks t on t.id = h.task_id
left join public.users_profile actor on actor.id = h.actor_user_id
where t.record_status = 'ACTIVE'
  and public.can_read_data_confirmation_task(
    t.department_code,
    t.assigned_user_id,
    t.owner_user_id,
    t.admission_segment_id
  );

grant select on public.heu_data_confirmation_task_status_timeline to authenticated;

revoke insert, update, delete on public.heu_data_confirmation_tasks from authenticated;
revoke insert, update, delete on public.heu_data_confirmation_task_status_history from authenticated;
grant select on public.heu_data_confirmation_tasks to authenticated;
grant select on public.heu_data_confirmation_task_status_history to authenticated;

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
    'data_confirmation.read',
    'DATA_CONFIRMATION',
    'Read Data Confirmation Task Center',
    'M00_MASTER_CONTROL',
    'IT_DATA + Audit',
    'MEDIUM',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    72,
    false,
    'Read metadata-only confirmation tasks; no raw PII, evidence acceptance or production reliance.',
    'DAT_TAM_THOI'
  ),
  (
    'data_confirmation.route',
    'DATA_CONFIRMATION',
    'Route Data Confirmation Tasks',
    'M00_MASTER_CONTROL',
    'IT_DATA + TRUONG_PHONG',
    'HIGH',
    'APPROVAL',
    true,
    true,
    true,
    24,
    false,
    'Create CHO_XAC_NHAN metadata tasks only after scope and owner lane are approved.',
    'CAN_SUA'
  ),
  (
    'data_confirmation.confirm',
    'DATA_CONFIRMATION',
    'Confirm Department Data Tasks',
    'M00_MASTER_CONTROL',
    'Department owner lanes',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    true,
    24,
    false,
    'Move a task to DUNG, CAN_SUA, KHONG_THUOC_TOI or DA_KHOA with audit history.',
    'CAN_SUA'
  ),
  (
    'data_confirmation.manage',
    'DATA_CONFIRMATION',
    'Manage Data Confirmation Task Center',
    'M00_MASTER_CONTROL',
    'IT_DATA + Audit',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    0,
    false,
    'Administrative DCTC routing only; not a production GO, UAT acceptance or evidence acceptance permission.',
    'CAN_SUA'
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
    'HEU_DATA_CONFIRMATION_TASKS',
    'HEU Data Confirmation Tasks',
    'M00_MASTER_CONTROL',
    'WORKFLOW',
    'IT_DATA + department owner lanes',
    'Metadata-only queue that turns real-data review into owner/user confirmation tasks with CHO_XAC_NHAN, DUNG, CAN_SUA, KHONG_THUOC_TOI and DA_KHOA statuses.',
    'INTERNAL',
    false,
    'CAN_SUA'
  ),
  (
    'HEU_DATA_CONFIRMATION_TASK_STATUS_HISTORY',
    'HEU Data Confirmation Task Status History',
    'M00_MASTER_CONTROL',
    'AUDIT_LOG',
    'IT_DATA + Audit',
    'Append status history for Data Confirmation Task Center transitions before any report/dashboard reliance.',
    'INTERNAL',
    false,
    'CAN_SUA'
  ),
  (
    'HEU_DATA_CONFIRMATION_TASK_CENTER',
    'HEU Data Confirmation Task Center',
    'M00_MASTER_CONTROL',
    'REPORT_VIEW',
    'IT_DATA + Audit',
    'Read-only report view for department/user confirmation tasks after RLS and workspace scope filters, with DCTC_TASK audit_trace_ref for audit-log lookup.',
    'INTERNAL',
    false,
    'CAN_SUA'
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

commit;
