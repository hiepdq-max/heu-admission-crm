-- Step 52 - P0-13 Admission Workspace Selector.
-- Run after step51_heu_os_visual_navigation_map.sql.
-- Purpose: remember the active admission segment workspace per user and expose
-- only the workspaces that the current user is allowed to enter.

create table if not exists public.user_admission_workspace_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users_profile(id) on delete cascade,
  active_segment_id uuid references public.admission_segments(id) on delete set null,
  assigned_by uuid references public.users_profile(id),
  note text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_admission_workspace_preferences_user
on public.user_admission_workspace_preferences(user_id)
where status = 'ACTIVE';

create index if not exists idx_user_admission_workspace_preferences_segment
on public.user_admission_workspace_preferences(active_segment_id)
where status = 'ACTIVE';

alter table public.user_admission_workspace_preferences enable row level security;

drop policy if exists "user_admission_workspace_preferences_select"
on public.user_admission_workspace_preferences;
create policy "user_admission_workspace_preferences_select"
on public.user_admission_workspace_preferences for select
to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_user_scope(user_id)
);

drop policy if exists "user_admission_workspace_preferences_manage"
on public.user_admission_workspace_preferences;
create policy "user_admission_workspace_preferences_manage"
on public.user_admission_workspace_preferences for all
to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_user_scope(user_id)
)
with check (
  (
    user_id = auth.uid()
    or public.can_manage_user_scope(user_id)
  )
  and (
    active_segment_id is null
    or public.can_use_admission_workspace(active_segment_id)
    or public.can_manage_user_scope(user_id)
  )
);

drop trigger if exists trg_user_admission_workspace_preferences_updated_at
on public.user_admission_workspace_preferences;
create trigger trg_user_admission_workspace_preferences_updated_at
before update on public.user_admission_workspace_preferences
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_admission_workspace_preferences_audit
on public.user_admission_workspace_preferences;
create trigger trg_user_admission_workspace_preferences_audit
after insert or update or delete on public.user_admission_workspace_preferences
for each row execute function public.write_audit_log();

create or replace function public.can_use_admission_workspace(target_segment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or exists (
      select 1
      from public.user_admission_segment_scopes scope
      where scope.user_id = auth.uid()
        and scope.segment_id = target_segment_id
        and scope.status = 'ACTIVE'
    )
$$;

grant execute on function public.can_use_admission_workspace(uuid) to authenticated;

create or replace view public.current_user_admission_workspaces
with (security_invoker = true)
as
select
  s.id as segment_id,
  s.segment_code,
  s.segment_name,
  s.program_group,
  s.admission_object,
  s.delivery_context,
  s.partner_model,
  s.commission_model,
  s.contract_model,
  s.finance_risk,
  s.owner_department,
  s.sort_order,
  w.id as workspace_id,
  w.workspace_code,
  w.operating_model,
  w.required_partner,
  w.required_contract,
  w.required_commission_policy,
  w.required_finance_tracking,
  w.required_document_checklist,
  w.required_handover_cthssv,
  w.hou_controls_enabled,
  w.ai_allowed,
  r.readiness_score,
  r.readiness_status,
  r.ai_gate_status,
  coalesce(p.active_segment_id = s.id, false) as is_active
from public.admission_segments s
left join public.admission_segment_workspaces w
  on w.segment_id = s.id
  and w.status = 'ACTIVE'
left join public.admission_segment_operating_readiness r
  on r.segment_id = s.id
left join public.user_admission_workspace_preferences p
  on p.user_id = auth.uid()
  and p.status = 'ACTIVE'
where s.status = 'ACTIVE'
  and public.can_use_admission_workspace(s.id);

grant select on public.current_user_admission_workspaces to authenticated;
grant select, insert, update, delete on public.user_admission_workspace_preferences to authenticated;

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
    'USER_ADMISSION_WORKSPACE_PREFERENCES',
    'User Admission Workspace Preferences',
    'M01_IDENTITY_SCOPE',
    'CONFIG',
    'IT_DATA + TRUONG_PHONG',
    'Luu doi tuong tuyen sinh dang chon cua tung user de app khong tron lead giua HOU, TTGDTX, ngan han va cac workspace khac.',
    'INTERNAL',
    false,
    'DAT_TAM_THOI'
  ),
  (
    'CURRENT_USER_ADMISSION_WORKSPACES',
    'Current User Admission Workspaces',
    'M01_IDENTITY_SCOPE',
    'REPORT_VIEW',
    'IT_DATA',
    'View tra ve cac workspace doi tuong tuyen sinh ma user hien tai duoc phep vao.',
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
  'GATE_P0_13_ADMISSION_WORKSPACE_SELECTOR',
  'P0-13 Admission Workspace Selector',
  'GO_LIVE',
  'HEU_OS',
  'ADMISSION_WORKSPACE_SELECTOR',
  'BGH + IT_DATA + TRUONG_PHONG_TUYEN_SINH',
  'Kiem tra user chi thay workspace doi tuong tuyen sinh duoc phan va cac trang lead/pipeline/report chay theo workspace dang chon.',
  'Chi phe duyet khi chon HOU/TTGDTX/ngan han/tai cho thi dashboard, lead, pipeline, follow-up va report khong bi tron du lieu.',
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
