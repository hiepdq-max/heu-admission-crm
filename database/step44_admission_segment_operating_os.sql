-- Step 44 - P0-05 Admission Segment Operating OS.
-- Run after step43_module_readiness_gate.sql.
-- Purpose: each admission segment becomes its own operating workspace with
-- scoped lead list, import, required fields, controls and readiness status.

create table if not exists public.admission_segment_workspaces (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid not null unique references public.admission_segments(id) on delete cascade,
  workspace_code text not null unique,
  operating_model text not null default 'STANDARD',
  lead_scope_rule text not null default 'Lead must be tagged with this admission_segment_id.',
  required_partner boolean not null default false,
  required_contract boolean not null default false,
  required_commission_policy boolean not null default false,
  required_finance_tracking boolean not null default true,
  required_document_checklist boolean not null default true,
  required_handover_cthssv boolean not null default true,
  hou_controls_enabled boolean not null default false,
  ai_allowed boolean not null default false,
  ai_policy text not null default 'AI chi duoc goi y va canh bao trong pham vi doi tuong tuyen sinh cua user.',
  control_note text,
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admission_segment_workspaces_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.admission_segment_operation_steps (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid not null references public.admission_segments(id) on delete cascade,
  step_code text not null,
  step_name text not null,
  step_group text not null default 'OPERATE',
  owner_department text not null,
  action_href text not null,
  required_for_operation boolean not null default true,
  control_note text,
  sort_order int not null default 0,
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (segment_id, step_code),
  constraint admission_segment_operation_steps_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.admission_segment_field_rules (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid not null references public.admission_segments(id) on delete cascade,
  field_code text not null,
  field_label text not null,
  field_group text not null default 'LEAD',
  is_visible boolean not null default true,
  is_required boolean not null default false,
  help_text text,
  sort_order int not null default 0,
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (segment_id, field_code),
  constraint admission_segment_field_rules_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create index if not exists idx_admission_segment_workspaces_segment
on public.admission_segment_workspaces(segment_id)
where status = 'ACTIVE';

create index if not exists idx_admission_segment_steps_segment
on public.admission_segment_operation_steps(segment_id, sort_order)
where status = 'ACTIVE';

create index if not exists idx_admission_segment_field_rules_segment
on public.admission_segment_field_rules(segment_id, sort_order)
where status = 'ACTIVE';

alter table public.admission_segment_workspaces enable row level security;
alter table public.admission_segment_operation_steps enable row level security;
alter table public.admission_segment_field_rules enable row level security;

drop policy if exists "admission_segment_workspaces_select_authenticated"
on public.admission_segment_workspaces;
create policy "admission_segment_workspaces_select_authenticated"
on public.admission_segment_workspaces for select
to authenticated
using (true);

drop policy if exists "admission_segment_workspaces_manage_settings"
on public.admission_segment_workspaces;
create policy "admission_segment_workspaces_manage_settings"
on public.admission_segment_workspaces for all
to authenticated
using (public.is_admin() or public.has_permission('settings.manage'))
with check (public.is_admin() or public.has_permission('settings.manage'));

drop policy if exists "admission_segment_steps_select_authenticated"
on public.admission_segment_operation_steps;
create policy "admission_segment_steps_select_authenticated"
on public.admission_segment_operation_steps for select
to authenticated
using (true);

drop policy if exists "admission_segment_steps_manage_settings"
on public.admission_segment_operation_steps;
create policy "admission_segment_steps_manage_settings"
on public.admission_segment_operation_steps for all
to authenticated
using (public.is_admin() or public.has_permission('settings.manage'))
with check (public.is_admin() or public.has_permission('settings.manage'));

drop policy if exists "admission_segment_field_rules_select_authenticated"
on public.admission_segment_field_rules;
create policy "admission_segment_field_rules_select_authenticated"
on public.admission_segment_field_rules for select
to authenticated
using (true);

drop policy if exists "admission_segment_field_rules_manage_settings"
on public.admission_segment_field_rules;
create policy "admission_segment_field_rules_manage_settings"
on public.admission_segment_field_rules for all
to authenticated
using (public.is_admin() or public.has_permission('settings.manage'))
with check (public.is_admin() or public.has_permission('settings.manage'));

drop trigger if exists trg_admission_segment_workspaces_updated_at
on public.admission_segment_workspaces;
create trigger trg_admission_segment_workspaces_updated_at
before update on public.admission_segment_workspaces
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_segment_steps_updated_at
on public.admission_segment_operation_steps;
create trigger trg_admission_segment_steps_updated_at
before update on public.admission_segment_operation_steps
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_segment_field_rules_updated_at
on public.admission_segment_field_rules;
create trigger trg_admission_segment_field_rules_updated_at
before update on public.admission_segment_field_rules
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_segment_workspaces_audit
on public.admission_segment_workspaces;
create trigger trg_admission_segment_workspaces_audit
after insert or update or delete on public.admission_segment_workspaces
for each row execute function public.write_audit_log();

drop trigger if exists trg_admission_segment_steps_audit
on public.admission_segment_operation_steps;
create trigger trg_admission_segment_steps_audit
after insert or update or delete on public.admission_segment_operation_steps
for each row execute function public.write_audit_log();

drop trigger if exists trg_admission_segment_field_rules_audit
on public.admission_segment_field_rules;
create trigger trg_admission_segment_field_rules_audit
after insert or update or delete on public.admission_segment_field_rules
for each row execute function public.write_audit_log();

insert into public.admission_segment_workspaces (
  segment_id,
  workspace_code,
  operating_model,
  lead_scope_rule,
  required_partner,
  required_contract,
  required_commission_policy,
  required_finance_tracking,
  required_document_checklist,
  required_handover_cthssv,
  hou_controls_enabled,
  ai_allowed,
  ai_policy,
  control_note,
  control_status
)
select
  s.id,
  'WS_' || s.segment_code,
  case
    when s.segment_code = 'UNIVERSITY_TRANSFER_HOU' then 'HOU_LINKAGE'
    when s.segment_code = 'TC9_TTGDTX_LINKED' then 'TTGDTX_LINKAGE'
    when s.segment_code like 'SHORT_%' then 'SHORT_COURSE'
    when s.segment_code like 'UNIVERSITY_TRANSFER_%' then 'UNIVERSITY_LINKAGE'
    else 'ONSITE_ADMISSION'
  end,
  'Lead trong workspace nay bat buoc gan admission_segment_id = ' || s.segment_code || '.',
  s.segment_code in (
    'TC9_TTGDTX_LINKED',
    'UNIVERSITY_TRANSFER_HOU',
    'UNIVERSITY_TRANSFER_OTHER',
    'SHORT_UNEMPLOYMENT_SUPPORT'
  ),
  s.segment_code in (
    'TC9_TTGDTX_LINKED',
    'UNIVERSITY_TRANSFER_HOU',
    'UNIVERSITY_TRANSFER_OTHER',
    'SHORT_UNEMPLOYMENT_SUPPORT'
  ),
  true,
  true,
  true,
  s.segment_code in (
    'TC9_TTGDTX_LINKED',
    'TC9_ONSITE_HEU',
    'UNIVERSITY_TRANSFER_HOU',
    'UNIVERSITY_TRANSFER_OTHER'
  ),
  s.segment_code = 'UNIVERSITY_TRANSFER_HOU',
  false,
  case
    when s.segment_code = 'UNIVERSITY_TRANSFER_HOU'
      then 'AI chi duoc canh bao trong pham vi HOU; khong hien ty le hop tac/COM nhay cam cho user khong co quyen.'
    else 'AI chi duoc goi y, kiem tra thieu du lieu va canh bao rui ro trong pham vi doi tuong.'
  end,
  'P0-05 workspace rieng cho ' || s.segment_name,
  'DAT_TAM_THOI'
from public.admission_segments s
where s.status = 'ACTIVE'
on conflict (segment_id) do update set
  workspace_code = excluded.workspace_code,
  operating_model = excluded.operating_model,
  lead_scope_rule = excluded.lead_scope_rule,
  required_partner = excluded.required_partner,
  required_contract = excluded.required_contract,
  required_commission_policy = excluded.required_commission_policy,
  required_finance_tracking = excluded.required_finance_tracking,
  required_document_checklist = excluded.required_document_checklist,
  required_handover_cthssv = excluded.required_handover_cthssv,
  hou_controls_enabled = excluded.hou_controls_enabled,
  ai_allowed = excluded.ai_allowed,
  ai_policy = excluded.ai_policy,
  control_note = excluded.control_note,
  updated_at = now();

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
  v.step_code,
  v.step_name,
  v.step_group,
  v.owner_department,
  replace(v.action_href, '{segment_id}', s.id::text),
  v.required_for_operation,
  v.control_note,
  v.sort_order,
  'DAT_TAM_THOI'
from public.admission_segments s
join public.admission_segment_workspaces w on w.segment_id = s.id
cross join lateral (
  values
    (
      'LEAD_LIST',
      'Danh sach lead cua doi tuong',
      'LEAD',
      'Tuyen sinh',
      '/leads?segment={segment_id}',
      true,
      'Chi hien lead gan dung admission_segment_id va nam trong pham vi user.',
      10
    ),
    (
      'LEAD_CREATE',
      'Tao lead trong doi tuong',
      'LEAD',
      'Tuyen sinh',
      '/leads/new?segment={segment_id}',
      true,
      'Form tao lead tu dong chon doi tuong nay neu user duoc phan quyen.',
      20
    ),
    (
      'LEAD_IMPORT',
      'Import danh sach cho doi tuong',
      'LEAD',
      'Tuyen sinh',
      '/import?segment={segment_id}',
      true,
      'Import CSV phai gan dung doi tuong de tranh lan lead.',
      30
    ),
    (
      'PARTNER_CONTRACT',
      'Doi tac, hop dong va nguon',
      'PARTNER',
      'Tuyen sinh + Phap che',
      '/partners',
      w.required_partner or w.required_contract,
      'Bat buoc neu doi tuong co mo hinh lien ket/doi tac.',
      40
    ),
    (
      'DOCUMENT_CHECKLIST',
      'Ho so va checklist bat buoc',
      'DOCUMENT',
      'CTHSSV',
      '/documents',
      w.required_document_checklist,
      'Ho so bat buoc phai du truoc khi ban giao/du dieu kien.',
      50
    ),
    (
      'FINANCE_COM',
      'Tai chinh, hoc phi va COM',
      'FINANCE',
      'KHTC',
      case when w.hou_controls_enabled then '/hou' else '/reports' end,
      w.required_finance_tracking or w.required_commission_policy,
      'Khong chi COM hai lan; phai co ky, chinh sach va chung tu.',
      60
    ),
    (
      'HOU_CONTROL',
      'Kiem soat HOU',
      'SPECIAL',
      'Tuyen sinh + KHTC',
      '/hou',
      w.hou_controls_enabled,
      'Chi bat buoc voi doi tuong lien thong dai hoc HOU.',
      70
    )
) as v(
  step_code,
  step_name,
  step_group,
  owner_department,
  action_href,
  required_for_operation,
  control_note,
  sort_order
)
where s.status = 'ACTIVE'
on conflict (segment_id, step_code) do update set
  step_name = excluded.step_name,
  step_group = excluded.step_group,
  owner_department = excluded.owner_department,
  action_href = excluded.action_href,
  required_for_operation = excluded.required_for_operation,
  control_note = excluded.control_note,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.admission_segment_field_rules (
  segment_id,
  field_code,
  field_label,
  field_group,
  is_visible,
  is_required,
  help_text,
  sort_order,
  control_status
)
select
  s.id,
  v.field_code,
  v.field_label,
  v.field_group,
  v.is_visible,
  v.is_required,
  v.help_text,
  v.sort_order,
  'DAT_TAM_THOI'
from public.admission_segments s
join public.admission_segment_workspaces w on w.segment_id = s.id
cross join lateral (
  values
    (
      'admission_segment_id',
      'Doi tuong tuyen sinh',
      'LEAD',
      true,
      true,
      'He thong tu gan khi thao tac trong workspace doi tuong.',
      10
    ),
    (
      'student_name',
      'Ho ten hoc sinh/hoc vien',
      'LEAD',
      true,
      true,
      'Thong tin bat buoc de tao lead.',
      20
    ),
    (
      'student_or_parent_phone',
      'So dien thoai hoc sinh hoac phu huynh',
      'LEAD',
      true,
      true,
      'Can it nhat mot so dien thoai de chong trung lead.',
      30
    ),
    (
      'current_school',
      'Truong/lop hien tai',
      'LEAD',
      s.segment_code in ('TC9_TTGDTX_LINKED', 'TC9_ONSITE_HEU'),
      s.segment_code in ('TC9_TTGDTX_LINKED', 'TC9_ONSITE_HEU'),
      'Quan trong voi tuyen sinh 9+.',
      40
    ),
    (
      'partner_id',
      'Doi tac/CTV/TTGDTX',
      'SCOPE',
      w.required_partner,
      w.required_partner,
      'Bat buoc khi doi tuong co nguon doi tac hoac lien ket.',
      50
    ),
    (
      'hou_major_id',
      'Nganh HOU',
      'HOU',
      w.hou_controls_enabled,
      w.hou_controls_enabled,
      'Bat buoc voi lien thong dai hoc HOU.',
      60
    ),
    (
      'hou_location_id',
      'Dia diem hoc HOU',
      'HOU',
      w.hou_controls_enabled,
      w.hou_controls_enabled,
      'Dia diem co the cau hinh them trong he thong.',
      70
    ),
    (
      'first_tuition_evidence',
      'Minh chung hoc phi ky dau',
      'FINANCE',
      w.hou_controls_enabled or w.required_finance_tracking,
      w.hou_controls_enabled,
      'Can truoc khi tinh/duyet COM voi HOU.',
      80
    ),
    (
      'document_checklist',
      'Checklist ho so bat buoc',
      'DOCUMENT',
      true,
      true,
      'Ho so duoc cau hinh theo doi tuong va chuong trinh.',
      90
    )
) as v(
  field_code,
  field_label,
  field_group,
  is_visible,
  is_required,
  help_text,
  sort_order
)
where s.status = 'ACTIVE'
on conflict (segment_id, field_code) do update set
  field_label = excluded.field_label,
  field_group = excluded.field_group,
  is_visible = excluded.is_visible,
  is_required = excluded.is_required,
  help_text = excluded.help_text,
  sort_order = excluded.sort_order,
  updated_at = now();

create or replace view public.admission_segment_operating_readiness
with (security_invoker = true)
as
with counts as (
  select
    s.id as segment_id,
    count(distinct l.id) filter (where l.is_deleted = false)::int as lead_count,
    count(distinct l.id) filter (
      where l.is_deleted = false
        and l.status = 'ENROLLED'
    )::int as enrolled_count,
    count(distinct us.user_id) filter (where us.status = 'ACTIVE')::int as scoped_user_count,
    count(distinct os.id) filter (where os.status = 'ACTIVE')::int as operation_step_count,
    count(distinct os.id) filter (
      where os.status = 'ACTIVE'
        and os.required_for_operation = true
    )::int as required_step_count,
    count(distinct fr.id) filter (
      where fr.status = 'ACTIVE'
        and fr.is_visible = true
    )::int as visible_field_count,
    count(distinct fr.id) filter (
      where fr.status = 'ACTIVE'
        and fr.is_required = true
    )::int as required_field_count
  from public.admission_segments s
  left join public.leads l on l.admission_segment_id = s.id
  left join public.user_admission_segment_scopes us on us.segment_id = s.id
  left join public.admission_segment_operation_steps os on os.segment_id = s.id
  left join public.admission_segment_field_rules fr on fr.segment_id = s.id
  where s.status = 'ACTIVE'
  group by s.id
)
select
  s.id as segment_id,
  s.segment_code,
  s.segment_name,
  s.program_group,
  s.owner_department,
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
  w.control_status,
  coalesce(c.lead_count, 0) as lead_count,
  coalesce(c.enrolled_count, 0) as enrolled_count,
  coalesce(c.scoped_user_count, 0) as scoped_user_count,
  coalesce(c.operation_step_count, 0) as operation_step_count,
  coalesce(c.required_step_count, 0) as required_step_count,
  coalesce(c.visible_field_count, 0) as visible_field_count,
  coalesce(c.required_field_count, 0) as required_field_count,
  (w.id is not null) as has_workspace_profile,
  (coalesce(c.required_step_count, 0) > 0) as has_required_steps,
  (coalesce(c.required_field_count, 0) > 0) as has_required_fields,
  (coalesce(c.scoped_user_count, 0) > 0) as has_user_scope,
  round((
    (case when w.id is not null then 1 else 0 end) +
    (case when coalesce(c.required_step_count, 0) > 0 then 1 else 0 end) +
    (case when coalesce(c.required_field_count, 0) > 0 then 1 else 0 end) +
    (case when coalesce(c.scoped_user_count, 0) > 0 then 1 else 0 end) +
    (case when coalesce(w.control_status, 'CHUA_DU_DIEU_KIEN') in ('DAT', 'DAT_TAM_THOI') then 1 else 0 end)
  ) * 100.0 / 5)::int as readiness_score,
  case
    when w.id is null then 'BLOCKED'
    when coalesce(c.required_step_count, 0) = 0 then 'BLOCKED'
    when coalesce(c.required_field_count, 0) = 0 then 'BLOCKED'
    when coalesce(c.scoped_user_count, 0) = 0 then 'NEEDS_SCOPE'
    when w.control_status = 'DAT' then 'READY'
    else 'READY_TEMP'
  end as readiness_status,
  array_remove(array[
    case when w.id is null then 'WORKSPACE_PROFILE' end,
    case when coalesce(c.required_step_count, 0) = 0 then 'OPERATION_STEPS' end,
    case when coalesce(c.required_field_count, 0) = 0 then 'FIELD_RULES' end,
    case when coalesce(c.scoped_user_count, 0) = 0 then 'USER_SCOPE' end,
    case
      when coalesce(w.control_status, 'CHUA_DU_DIEU_KIEN') <> 'DAT'
        then 'FINAL_CONTROL_STATUS'
    end
  ], null) as missing_items,
  case
    when w.id is null
      or coalesce(c.required_step_count, 0) = 0
      or coalesce(c.required_field_count, 0) = 0
      or coalesce(c.scoped_user_count, 0) = 0
      then 'AI_LOCKED'
    when w.control_status <> 'DAT' then 'AI_REVIEW_ONLY'
    when w.ai_allowed then 'AI_ALLOWED_WITH_HUMAN_REVIEW'
    else 'AI_REVIEW_ONLY'
  end as ai_gate_status
from public.admission_segments s
left join public.admission_segment_workspaces w
  on w.segment_id = s.id
  and w.status = 'ACTIVE'
left join counts c on c.segment_id = s.id
where s.status = 'ACTIVE';

grant select on public.admission_segment_operating_readiness to authenticated;

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
  'ADMISSION_SEGMENT_OPERATING_READINESS',
  'Admission Segment Operating Readiness',
  'M05_ADMISSION_CRM',
  'REPORT_VIEW',
  'TUYEN_SINH + IT_DATA',
  'View kiem tra moi doi tuong tuyen sinh da co workspace, field rule, step va user scope hay chua.',
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
  'GATE_P0_05_SEGMENT_OPERATING_OS',
  'P0-05 Admission Segment Operating OS',
  'GO_LIVE',
  'ADMISSION_SEGMENT',
  'ALL_SEGMENTS',
  'TUYEN_SINH + IT_DATA + PHAP_CHE',
  'Kiem tra moi doi tuong co workspace, field rule, operation step va user scope truoc khi mo production.',
  'Chi mo automation/AI khi readiness khong con muc bat buoc bi thieu.',
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
