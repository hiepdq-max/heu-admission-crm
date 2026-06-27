-- Step 99 - P2-12 TTGDTX Master Dropdown Control.
-- Run after step98_ttgdtx_source_control_p2_11.sql.
-- Migration candidate only. Do not run production migration from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - No physical removal of business data is used.
-- - If rollback is needed, mark newly introduced TTGDTX master records/policies
--   inactive through an approved corrective migration and keep audit evidence.
--
-- Purpose:
-- - Create a controlled TTGDTX master list for selection/dropdown.
-- - Users must choose a TTGDTX from master data, not type free text.
-- - P2-12 does not create receivables, does not collect tuition and does not pay partners.

begin;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.master.read'),
    ('ttgdtx.master.manage'),
    ('ttgdtx.master.approve')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA', 'LEGAL', 'PHAP_CHE', 'KHTC', 'ACCOUNTING', 'ACCOUNTING_LEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.master.read'),
    ('ttgdtx.master.approve')
) as p(permission)
where r.code = 'BGH'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, 'ttgdtx.master.read'
from public.roles r
where r.code in ('ADMISSION_HEAD', 'TEAM_LEAD', 'COUNSELOR', 'CTHSSV_LEAD', 'DAO_TAO', 'AUDIT')
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
) values
  (
    'ttgdtx.master.read',
    'TTGDTX',
    'Xem danh muc TTGDTX P2-12',
    'M08_FINANCE_ACCOUNTING',
    'TUYEN_SINH + PHAP_CHE + IT_DATA',
    'MEDIUM',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    true,
    'Chi xem danh muc TTGDTX trong pham vi duoc phan. Khong thay the quyen tao cong no/thu tien.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.master.manage',
    'TTGDTX',
    'Quan ly danh muc TTGDTX P2-12',
    'M08_FINANCE_ACCOUNTING',
    'TUYEN_SINH + PHAP_CHE + IT_DATA',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    false,
    false,
    'Them/sua TTGDTX master phai co nguon file, checker/approver va audit log. Khong go tay truc tiep tren lead.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.master.approve',
    'TTGDTX',
    'Duyet TTGDTX duoc chon tren he thong',
    'M08_FINANCE_ACCOUNTING',
    'PHAP_CHE + BGH',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    false,
    'Chi trung tam da duyet moi duoc bat ENABLED production. TEMP_ENABLED chi dung pilot va van can canh bao.',
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
  ai_allowed = excluded.ai_allowed,
  control_note = excluded.control_note,
  control_status = excluded.control_status,
  updated_at = now();

create table if not exists public.ttgdtx_center_master (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete restrict,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  center_code text not null,
  center_name text not null,
  official_name text,
  center_type text not null default 'TTGDTX',
  province text,
  district text,
  area text,
  contact_name text,
  phone text,
  email text,
  source_document_id uuid references public.ttgdtx_source_documents(id) on delete restrict,
  source_version text,
  approved_document_url text,
  effective_from date not null default current_date,
  effective_to date,
  master_status text not null default 'IN_REVIEW',
  selection_status text not null default 'TEMP_ENABLED',
  owner_department text not null default 'TUYEN_SINH',
  checker_role text not null default 'PHAP_CHE + IT_DATA',
  approver_role text not null default 'BGH',
  risk_level text not null default 'HIGH',
  control_note text,
  control_status text not null default 'DAT_TAM_THOI',
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id, admission_segment_id),
  unique (center_code),
  constraint ttgdtx_center_type_valid check (
    center_type in ('TTGDTX', 'GDTX', 'SCHOOL_PARTNER', 'LOCAL_PARTNER', 'OTHER')
  ),
  constraint ttgdtx_center_master_status_valid check (
    master_status in ('DRAFT', 'IN_REVIEW', 'APPROVED', 'NEEDS_FIX', 'SUSPENDED', 'RETIRED')
  ),
  constraint ttgdtx_center_selection_status_valid check (
    selection_status in ('TEMP_ENABLED', 'ENABLED', 'DISABLED', 'SUSPENDED')
  ),
  constraint ttgdtx_center_risk_valid check (
    risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
  ),
  constraint ttgdtx_center_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  ),
  constraint ttgdtx_center_date_valid check (
    effective_to is null or effective_to >= effective_from
  )
);

create index if not exists idx_ttgdtx_center_master_segment
on public.ttgdtx_center_master(admission_segment_id, selection_status, master_status)
where record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_center_master_partner
on public.ttgdtx_center_master(partner_id, admission_segment_id)
where record_status = 'ACTIVE';

alter table public.ttgdtx_center_master
  drop constraint if exists ttgdtx_center_master_source_document_id_fkey;

alter table public.ttgdtx_center_master
  add constraint ttgdtx_center_master_source_document_id_fkey
  foreign key (source_document_id)
  references public.ttgdtx_source_documents(id)
  on delete restrict;

create or replace function public.validate_ttgdtx_center_master()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partner record;
  v_segment_code text;
begin
  select p.id, p.partner_code, p.partner_name, p.partner_type, p.status, p.is_deleted
  into v_partner
  from public.partners p
  where p.id = new.partner_id;

  if not found or v_partner.is_deleted = true or v_partner.status <> 'ACTIVE' then
    raise exception 'P2-12: Khong tim thay doi tac TTGDTX dang hoat dong.';
  end if;

  if v_partner.partner_type <> 'TTGDTX' then
    raise exception 'P2-12: Doi tac % khong phai loai TTGDTX.', v_partner.partner_name;
  end if;

  select s.segment_code
  into v_segment_code
  from public.admission_segments s
  where s.id = new.admission_segment_id
    and s.status = 'ACTIVE';

  if v_segment_code is distinct from 'TC9_TTGDTX_LINKED' then
    raise exception 'P2-12: Danh muc TTGDTX chi dung cho doi tuong Trung cap 9+ lien ket TTGDTX.';
  end if;

  if nullif(trim(coalesce(new.center_code, '')), '') is null then
    raise exception 'P2-12: Phai co ma trung tam.';
  end if;

  if nullif(trim(coalesce(new.center_name, '')), '') is null then
    raise exception 'P2-12: Phai co ten trung tam.';
  end if;

  if new.selection_status = 'ENABLED' and new.master_status <> 'APPROVED' then
    raise exception 'P2-12: Muon ENABLED production thi master_status phai APPROVED.';
  end if;

  if new.master_status = 'APPROVED'
     and nullif(trim(coalesce(new.approved_document_url, '')), '') is null
     and new.source_document_id is null then
    raise exception 'P2-12: Trung tam APPROVED phai co link/can cu duyet hoac source document.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ttgdtx_center_master_validate
on public.ttgdtx_center_master;

create trigger trg_ttgdtx_center_master_validate
before insert or update on public.ttgdtx_center_master
for each row execute function public.validate_ttgdtx_center_master();

drop trigger if exists trg_ttgdtx_center_master_updated_at
on public.ttgdtx_center_master;

create trigger trg_ttgdtx_center_master_updated_at
before update on public.ttgdtx_center_master
for each row execute function public.set_updated_at();

drop trigger if exists trg_ttgdtx_center_master_audit
on public.ttgdtx_center_master;

create trigger trg_ttgdtx_center_master_audit
after insert or update or delete on public.ttgdtx_center_master
for each row execute function public.write_audit_log();

alter table public.ttgdtx_center_master enable row level security;

create or replace function public.can_read_ttgdtx_master(
  target_partner_id uuid,
  target_segment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or (
      (
        public.has_permission('ttgdtx.master.read')
        or public.has_permission('ttgdtx.master.manage')
        or public.has_permission('ttgdtx.master.approve')
        or public.has_permission('partners.manage')
        or public.has_permission('settings.manage')
      )
      and public.can_access_business_scope(target_segment_id, target_partner_id)
    )
$$;

create or replace function public.can_manage_ttgdtx_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('ttgdtx.master.manage')
    or public.has_permission('partners.manage')
    or public.has_permission('settings.manage')
$$;

create or replace function public.can_approve_ttgdtx_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('ttgdtx.master.approve')
$$;

grant execute on function public.can_read_ttgdtx_master(uuid, uuid) to authenticated;
grant execute on function public.can_manage_ttgdtx_master() to authenticated;
grant execute on function public.can_approve_ttgdtx_master() to authenticated;

drop policy if exists "ttgdtx_center_master_select"
on public.ttgdtx_center_master;

create policy "ttgdtx_center_master_select"
on public.ttgdtx_center_master for select
to authenticated
using (public.can_read_ttgdtx_master(partner_id, admission_segment_id));

drop policy if exists "ttgdtx_center_master_manage"
on public.ttgdtx_center_master;

drop policy if exists "ttgdtx_center_master_insert"
on public.ttgdtx_center_master;

create policy "ttgdtx_center_master_insert"
on public.ttgdtx_center_master for insert
to authenticated
with check (
  public.can_manage_ttgdtx_master()
  and public.can_access_business_scope(admission_segment_id, partner_id)
);

drop policy if exists "ttgdtx_center_master_update"
on public.ttgdtx_center_master;

create policy "ttgdtx_center_master_update"
on public.ttgdtx_center_master for update
to authenticated
using (
  public.can_manage_ttgdtx_master()
  and public.can_access_business_scope(admission_segment_id, partner_id)
)
with check (
  public.can_manage_ttgdtx_master()
  and public.can_access_business_scope(admission_segment_id, partner_id)
);

with ttgdtx_segment as (
  select id
  from public.admission_segments
  where segment_code = 'TC9_TTGDTX_LINKED'
    and status = 'ACTIVE'
  limit 1
)
insert into public.ttgdtx_center_master (
  partner_id,
  admission_segment_id,
  center_code,
  center_name,
  official_name,
  area,
  phone,
  email,
  source_version,
  master_status,
  selection_status,
  risk_level,
  control_note,
  control_status
)
select
  p.id,
  s.id,
  p.partner_code,
  p.partner_name,
  p.partner_name,
  p.area,
  p.phone,
  p.email,
  'Seed tu partners; can doi chieu P2-11/File Registry truoc khi APPROVED',
  'IN_REVIEW',
  'TEMP_ENABLED',
  'HIGH',
  'P2-12 seed tam tu bang partners de co dropdown pilot. Production can duyet source, hop dong va hoc phi.',
  'DAT_TAM_THOI'
from public.partners p
cross join ttgdtx_segment s
where p.partner_type = 'TTGDTX'
  and p.status = 'ACTIVE'
  and p.is_deleted = false
on conflict (partner_id, admission_segment_id) do update set
  center_code = excluded.center_code,
  center_name = excluded.center_name,
  official_name = coalesce(nullif(ttgdtx_center_master.official_name, ''), excluded.official_name),
  area = excluded.area,
  phone = excluded.phone,
  email = excluded.email,
  source_version = coalesce(ttgdtx_center_master.source_version, excluded.source_version),
  control_note = coalesce(ttgdtx_center_master.control_note, excluded.control_note),
  updated_at = now();

create or replace view public.ttgdtx_center_master_readiness
with (security_invoker = true)
as
select
  m.id as center_master_id,
  m.partner_id,
  p.partner_code,
  p.partner_name,
  m.admission_segment_id,
  s.segment_code,
  s.segment_name,
  m.center_code,
  m.center_name,
  m.official_name,
  m.center_type,
  m.province,
  m.district,
  coalesce(m.area, p.area) as area,
  coalesce(m.phone, p.phone) as phone,
  coalesce(m.email, p.email) as email,
  m.source_document_id,
  d.source_code,
  d.source_title,
  d.document_status as source_status,
  m.source_version,
  m.approved_document_url,
  m.effective_from,
  m.effective_to,
  m.master_status,
  m.selection_status,
  m.owner_department,
  m.checker_role,
  m.approver_role,
  m.risk_level,
  m.control_note,
  m.control_status,
  c.contract_id,
  c.contract_code,
  c.contract_status,
  c.readiness_status as contract_readiness_status,
  coalesce(tp.ready_policy_count, 0) as ready_policy_count,
  coalesce(tp.policy_count, 0) as policy_count,
  coalesce(l.lead_count, 0) as lead_count,
  case
    when m.selection_status in ('DISABLED', 'SUSPENDED') then 'BLOCKED'
    when m.effective_to is not null and m.effective_to < current_date then 'EXPIRED'
    when m.master_status = 'APPROVED' and m.selection_status = 'ENABLED' then 'READY'
    when m.selection_status = 'TEMP_ENABLED' then 'PILOT_TEMP'
    when m.master_status in ('DRAFT', 'IN_REVIEW') then 'NEEDS_APPROVAL'
    when m.master_status = 'NEEDS_FIX' then 'NEEDS_FIX'
    else 'NEEDS_REVIEW'
  end as readiness_status,
  array_remove(array[
    case when m.selection_status = 'TEMP_ENABLED' then 'Dang cho chon tam de pilot, chua phai production APPROVED' end,
    case when m.master_status <> 'APPROVED' then 'Danh muc TTGDTX chua duoc duyet chinh thuc' end,
    case when m.source_document_id is null and nullif(trim(coalesce(m.approved_document_url, '')), '') is null then 'Chua gan nguon duyet/File Registry' end,
    case when c.contract_id is null then 'Chua co hop dong P2-01' end,
    case when c.contract_id is not null and c.readiness_status <> 'READY' then 'Hop dong P2-01 chua READY' end,
    case when coalesce(tp.ready_policy_count, 0) = 0 then 'Chua co hoc phi P2-02 READY' end,
    case when m.effective_to is not null and m.effective_to < current_date then 'Danh muc da het hieu luc' end
  ], null) as blocking_items
from public.ttgdtx_center_master m
join public.partners p on p.id = m.partner_id
join public.admission_segments s on s.id = m.admission_segment_id
left join public.ttgdtx_source_documents d on d.id = m.source_document_id
left join public.ttgdtx_partner_contract_readiness c on c.partner_id = m.partner_id
left join lateral (
  select
    count(*)::int as policy_count,
    count(*) filter (
      where policy_status = 'ACTIVE'
        and control_status = 'DAT'
        and effective_from <= current_date
        and (effective_to is null or effective_to >= current_date)
    )::int as ready_policy_count
  from public.ttgdtx_tuition_policies t
  where t.partner_id = m.partner_id
    and t.admission_segment_id = m.admission_segment_id
    and t.status = 'ACTIVE'
) tp on true
left join lateral (
  select count(*)::int as lead_count
  from public.leads l
  where l.partner_id = m.partner_id
    and l.admission_segment_id = m.admission_segment_id
    and l.is_deleted = false
) l on true
where m.record_status = 'ACTIVE'
  and p.status = 'ACTIVE'
  and p.is_deleted = false
  and public.can_read_ttgdtx_master(m.partner_id, m.admission_segment_id);

grant select on public.ttgdtx_center_master_readiness to authenticated;

create or replace view public.ttgdtx_center_dropdown_options
with (security_invoker = true)
as
select
  r.center_master_id,
  r.partner_id,
  r.admission_segment_id,
  r.partner_code,
  r.center_code,
  r.center_name,
  r.official_name,
  concat(
    r.center_name,
    case
      when r.selection_status = 'TEMP_ENABLED' then ' - tam cho pilot'
      when r.master_status <> 'APPROVED' then ' - cho duyet'
      else ''
    end
  ) as display_label,
  r.area,
  r.selection_status,
  r.master_status,
  r.readiness_status,
  r.blocking_items
from public.ttgdtx_center_master_readiness r
where r.selection_status in ('ENABLED', 'TEMP_ENABLED')
  and r.master_status not in ('SUSPENDED', 'RETIRED')
  and (r.effective_to is null or r.effective_to >= current_date);

grant select on public.ttgdtx_center_dropdown_options to authenticated;

create or replace view public.ttgdtx_p2_12_summary
with (security_invoker = true)
as
select
  count(*)::int as center_count,
  count(*) filter (where selection_status in ('ENABLED', 'TEMP_ENABLED'))::int as selectable_count,
  count(*) filter (where selection_status = 'ENABLED' and master_status = 'APPROVED')::int as production_ready_count,
  count(*) filter (where selection_status = 'TEMP_ENABLED')::int as pilot_temp_count,
  count(*) filter (where contract_readiness_status = 'READY')::int as contract_ready_count,
  count(*) filter (where ready_policy_count > 0)::int as tuition_ready_count,
  count(*) filter (where readiness_status in ('NEEDS_APPROVAL', 'NEEDS_FIX', 'BLOCKED', 'EXPIRED'))::int as needs_action_count
from public.ttgdtx_center_master_readiness;

grant select on public.ttgdtx_p2_12_summary to authenticated;

update public.ttgdtx_source_control_checks
set
  current_observation = 'P2-12 da tao master dropdown TTGDTX. Cac trung tam seed tam o TEMP_ENABLED de pilot, can duyet de production ENABLED.',
  check_status = case
    when exists (select 1 from public.ttgdtx_center_master where record_status = 'ACTIVE') then 'WARNING'
    else check_status
  end,
  updated_at = now()
where check_code = 'CHK_P2_11_TTGDTX_MASTER_DROPDOWN';

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
  'TTGDTX_MASTER_DROPDOWN_P2_12',
  'P2-12 Danh muc TTGDTX chon tu master',
  'MASTER_DATA',
  'TUYEN_SINH + PHAP_CHE + IT_DATA',
  '/ttgdtx/master',
  true,
  'P2-12 bat buoc chon TTGDTX tu master. TEMP_ENABLED chi dung pilot; ENABLED production can APPROVED va nguon duyet.',
  75,
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
  'WF_P2_12_TTGDTX_MASTER_DROPDOWN',
  'P2-12 Danh muc TTGDTX va dropdown co kiem soat',
  'M08_FINANCE_ACCOUNTING',
  'Khi them trung tam TTGDTX, sua ten trung tam, mo/tat cho chon tren lead hoac doi nguon du lieu.',
  'TUYEN_SINH/PHAP_CHE/IT_DATA',
  'TUYEN_SINH + PHAP_CHE + IT_DATA',
  'PHAP_CHE + IT_DATA + AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Danh muc TTGDTX duoc chon trong lead/P2-03, co trang thai pilot hoac production.',
  'P2-12 cap dropdown cho P2-05/P2-03/P2-02; trung tam chua duyet se canh bao va khong duoc coi la production ready.',
  'Moi them/sua/mo chon trung tam phai ghi audit log va co nguon P2-11.',
  2120,
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
  'P2_12_TTGDTX_CENTER_MASTER',
  'P2-12 Danh muc TTGDTX duoc chon',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_center_master; ttgdtx_center_dropdown_options',
  'MASTER',
  'TUYEN_SINH + PHAP_CHE + IT_DATA',
  'SUPABASE',
  'CONFIDENTIAL',
  true,
  'Khong go tay ten TTGDTX tren lead. Moi thay doi master phai qua P2-12, co nguon P2-11 va audit log.',
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
  'OWN_P2_12_TTGDTX_MASTER_DROPDOWN',
  'P2-12 Danh muc TTGDTX va dropdown co kiem soat',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_12_TTGDTX_MASTER_DROPDOWN',
  'TTGDTX_MASTER',
  'ttgdtx_center_master; ttgdtx_center_dropdown_options',
  'TUYEN_SINH + PHAP_CHE + IT_DATA',
  'TUYEN_SINH/IT_DATA',
  'PHAP_CHE + IT_DATA + AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'ROLE_AND_SCOPE',
  'P2-11_SOURCE_CONTROL',
  'P2-01/P2-02/P2-03/P2-05',
  'Nguon danh muc, ten chinh thuc, ma trung tam, hop dong lien quan, nguoi kiem, nguoi duyet.',
  'Khong cho dung TTGDTX ngoai master; production ENABLED phai APPROVED.',
  48,
  'HIGH',
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
  'GATE_P2_12_TTGDTX_MASTER_DROPDOWN',
  'Gate P2-12: TTGDTX phai chon tu master duoc kiem soat',
  'DATA',
  'TTGDTX_MASTER',
  'P2-12-TTGDTX-MASTER',
  'TUYEN_SINH + PHAP_CHE + IT_DATA',
  'Kiem tra trung tam co trong master, co nguon P2-11, trang thai chon phu hop va khong trung ma/ten.',
  'BGH/Phap che chi duyet production ENABLED khi trung tam co can cu va hop dong/hoc phi du duong.',
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
  'NAV_P2_12_TTGDTX_MASTER',
  'P2-12 Danh muc TTGDTX',
  'FINANCE',
  'M08_FINANCE_ACCOUNTING',
  '/ttgdtx/master',
  'Danh muc TTGDTX dung cho dropdown tren lead, P2-05 va cac buoc ke toan TTGDTX.',
  'TUYEN_SINH + PHAP_CHE + IT_DATA',
  'Mo P2-12 de xem trung tam nao duoc chon, trung tam nao can duyet.',
  2120,
  false,
  'Can xu ly khi co trung tam TEMP_ENABLED qua lau, chua gan nguon P2-11, chua hop dong P2-01 hoac chua hoc phi P2-02.',
  'DAT_TAM_THOI'
)
on conflict (node_code) do update set
  node_name = excluded.node_name,
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

commit;
