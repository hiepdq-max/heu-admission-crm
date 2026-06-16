-- Step 49 - P0-10 Master Data Governance.
-- Run after step48_evidence_document_control.sql.
-- Purpose: govern shared master data so modules do not create conflicting catalogs.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('master_data.read'),
    ('master_data.request_change'),
    ('master_data.check'),
    ('master_data.approve'),
    ('master_data.manage')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('master_data.read'),
    ('master_data.approve')
) as p(permission)
where r.code = 'BGH'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('master_data.read'),
    ('master_data.request_change'),
    ('master_data.check')
) as p(permission)
where r.code in ('LEGAL', 'AUDIT', 'ADMISSION_HEAD', 'TEAM_LEAD', 'CTHSSV_LEAD', 'ACCOUNTING_LEAD', 'HOU_OPERATOR')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('master_data.read'),
    ('master_data.request_change')
) as p(permission)
where r.code in ('COUNSELOR', 'ADMISSION_STAFF', 'CTHSSV', 'ACCOUNTING_STAFF')
on conflict (role_id, permission) do nothing;

create table if not exists public.master_data_governance (
  id uuid primary key default gen_random_uuid(),
  master_code text not null unique,
  master_name text not null,
  module_code text not null,
  source_table text not null,
  data_domain text not null default 'OPERATION',
  owner_department text not null,
  steward_role text,
  approval_required boolean not null default true,
  checker_role text,
  approver_role text,
  sensitivity_level text not null default 'INTERNAL',
  change_frequency text not null default 'ON_DEMAND',
  ai_allowed boolean not null default false,
  duplicate_rule text,
  effective_date_required boolean not null default false,
  audit_required boolean not null default true,
  evidence_required boolean not null default false,
  scope_rule text,
  control_note text,
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint master_data_governance_domain_valid check (
    data_domain in (
      'IDENTITY',
      'ADMISSION',
      'ACADEMIC',
      'HOU',
      'FINANCE',
      'PARTNER',
      'DOCUMENT',
      'WORKFLOW',
      'AI',
      'OPERATION',
      'OTHER'
    )
  ),
  constraint master_data_governance_sensitivity_valid check (
    sensitivity_level in ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'SECRET')
  ),
  constraint master_data_governance_frequency_valid check (
    change_frequency in ('RARE', 'TERM', 'MONTHLY', 'WEEKLY', 'DAILY', 'ON_DEMAND')
  ),
  constraint master_data_governance_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.master_data_change_requests (
  id uuid primary key default gen_random_uuid(),
  request_code text not null unique,
  governance_id uuid not null references public.master_data_governance(id) on delete cascade,
  change_type text not null default 'UPDATE',
  target_record_id uuid,
  target_record_code text,
  change_title text not null,
  current_value jsonb,
  proposed_value jsonb,
  request_reason text,
  evidence_url text,
  request_status text not null default 'PENDING_CHECK',
  requested_by uuid references public.users_profile(id),
  checked_by uuid references public.users_profile(id),
  checked_at timestamptz,
  approved_by uuid references public.users_profile(id),
  approved_at timestamptz,
  applied_by uuid references public.users_profile(id),
  applied_at timestamptz,
  rejection_reason text,
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint master_data_change_type_valid check (
    change_type in ('CREATE', 'UPDATE', 'DEACTIVATE', 'MERGE', 'IMPORT', 'OTHER')
  ),
  constraint master_data_change_request_status_valid check (
    request_status in (
      'DRAFT',
      'PENDING_CHECK',
      'CHECKED',
      'APPROVED',
      'REJECTED',
      'NEEDS_FIX',
      'APPLIED',
      'CANCELLED'
    )
  )
);

create index if not exists idx_master_data_governance_module
on public.master_data_governance(module_code, data_domain, control_status)
where status = 'ACTIVE';

create index if not exists idx_master_data_governance_source_table
on public.master_data_governance(source_table)
where status = 'ACTIVE';

create index if not exists idx_master_data_change_requests_governance
on public.master_data_change_requests(governance_id, request_status, created_at desc)
where status = 'ACTIVE';

alter table public.master_data_governance enable row level security;
alter table public.master_data_change_requests enable row level security;

create or replace function public.can_read_master_data_governance()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('master_data.read')
    or public.has_permission('master_data.request_change')
    or public.has_permission('master_data.check')
    or public.has_permission('master_data.approve')
    or public.has_permission('master_data.manage')
    or public.can_read_master_control()
$$;

create or replace function public.can_request_master_data_change()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('master_data.request_change')
    or public.has_permission('master_data.manage')
    or public.can_manage_master_control()
$$;

create or replace function public.can_check_master_data_change()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('master_data.check')
    or public.has_permission('master_data.manage')
    or public.has_permission('master_control.check')
    or public.can_manage_master_control()
$$;

create or replace function public.can_approve_master_data_change()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('master_data.approve')
    or public.has_permission('master_data.manage')
    or public.can_approve_master_control()
$$;

create or replace function public.can_manage_master_data_governance()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('master_data.manage')
    or public.can_manage_master_control()
$$;

grant execute on function public.can_read_master_data_governance() to authenticated;
grant execute on function public.can_request_master_data_change() to authenticated;
grant execute on function public.can_check_master_data_change() to authenticated;
grant execute on function public.can_approve_master_data_change() to authenticated;
grant execute on function public.can_manage_master_data_governance() to authenticated;

create or replace function public.next_master_data_request_code(p_master_code text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  with prefix as (
    select 'MDR-' || upper(regexp_replace(coalesce(p_master_code, 'MASTER_DATA'), '[^A-Z0-9]+', '_', 'g'))
      || '-' || to_char(now(), 'YYYYMMDD') || '-' as value
  ),
  last_no as (
    select coalesce(max((substring(request_code from '([0-9]{3})$'))::int), 0) as value
    from public.master_data_change_requests r
    cross join prefix p
    where r.request_code like p.value || '%'
  )
  select prefix.value || lpad((last_no.value + 1)::text, 3, '0')
  from prefix, last_no
$$;

grant execute on function public.next_master_data_request_code(text) to authenticated;

drop policy if exists "master_data_governance_select" on public.master_data_governance;
create policy "master_data_governance_select"
on public.master_data_governance for select
to authenticated
using (public.can_read_master_data_governance());

drop policy if exists "master_data_governance_manage" on public.master_data_governance;
create policy "master_data_governance_manage"
on public.master_data_governance for all
to authenticated
using (public.can_manage_master_data_governance())
with check (public.can_manage_master_data_governance());

drop policy if exists "master_data_change_requests_select" on public.master_data_change_requests;
create policy "master_data_change_requests_select"
on public.master_data_change_requests for select
to authenticated
using (
  public.can_read_master_data_governance()
  or requested_by = auth.uid()
  or checked_by = auth.uid()
  or approved_by = auth.uid()
);

drop policy if exists "master_data_change_requests_insert" on public.master_data_change_requests;
create policy "master_data_change_requests_insert"
on public.master_data_change_requests for insert
to authenticated
with check (
  public.can_request_master_data_change()
  and requested_by = auth.uid()
);

drop policy if exists "master_data_change_requests_update" on public.master_data_change_requests;
create policy "master_data_change_requests_update"
on public.master_data_change_requests for update
to authenticated
using (
  public.can_check_master_data_change()
  or public.can_approve_master_data_change()
  or public.can_manage_master_data_governance()
  or requested_by = auth.uid()
)
with check (
  public.can_check_master_data_change()
  or public.can_approve_master_data_change()
  or public.can_manage_master_data_governance()
  or requested_by = auth.uid()
);

drop trigger if exists trg_master_data_governance_updated_at on public.master_data_governance;
create trigger trg_master_data_governance_updated_at
before update on public.master_data_governance
for each row execute function public.set_updated_at();

drop trigger if exists trg_master_data_change_requests_updated_at on public.master_data_change_requests;
create trigger trg_master_data_change_requests_updated_at
before update on public.master_data_change_requests
for each row execute function public.set_updated_at();

drop trigger if exists trg_master_data_governance_audit on public.master_data_governance;
create trigger trg_master_data_governance_audit
after insert or update or delete on public.master_data_governance
for each row execute function public.write_audit_log();

drop trigger if exists trg_master_data_change_requests_audit on public.master_data_change_requests;
create trigger trg_master_data_change_requests_audit
after insert or update or delete on public.master_data_change_requests
for each row execute function public.write_audit_log();

create or replace view public.master_data_governance_status
with (security_invoker = true)
as
select
  mdg.id,
  mdg.master_code,
  mdg.master_name,
  mdg.module_code,
  m.module_name,
  mdg.source_table,
  mdg.data_domain,
  mdg.owner_department,
  mdg.steward_role,
  mdg.approval_required,
  mdg.checker_role,
  mdg.approver_role,
  mdg.sensitivity_level,
  mdg.change_frequency,
  mdg.ai_allowed,
  mdg.duplicate_rule,
  mdg.effective_date_required,
  mdg.audit_required,
  mdg.evidence_required,
  mdg.scope_rule,
  mdg.control_note,
  mdg.control_status,
  mdg.created_by,
  creator.full_name as created_by_name,
  mdg.updated_by,
  updater.full_name as updated_by_name,
  mdg.created_at,
  mdg.updated_at,
  coalesce(req.open_request_count, 0)::int as open_request_count,
  coalesce(req.approved_request_count, 0)::int as approved_request_count,
  coalesce(req.needs_fix_request_count, 0)::int as needs_fix_request_count,
  array_remove(array[
    case when mdg.owner_department is null or length(trim(mdg.owner_department)) = 0 then 'MISSING_OWNER' end,
    case when mdg.approval_required and (mdg.approver_role is null or length(trim(mdg.approver_role)) = 0) then 'MISSING_APPROVER' end,
    case when mdg.audit_required is false then 'NO_AUDIT' end,
    case when mdg.evidence_required and not exists (
      select 1
      from public.evidence_documents ed
      where ed.entity_type = 'MASTER_DATA'
        and (ed.entity_code = mdg.master_code or ed.entity_id = mdg.id)
        and ed.document_status = 'CHECKED'
        and ed.record_status = 'ACTIVE'
    ) then 'MISSING_CHECKED_EVIDENCE' end,
    case when mdg.sensitivity_level in ('RESTRICTED', 'SECRET') and mdg.ai_allowed then 'AI_ON_SENSITIVE_DATA' end,
    case when mdg.control_status in ('CAN_SUA', 'CHUA_DU_DIEU_KIEN') then 'CONTROL_NOT_READY' end
  ], null) as control_flags,
  case
    when mdg.owner_department is null or length(trim(mdg.owner_department)) = 0 then 'BLOCKED'
    when mdg.approval_required and (mdg.approver_role is null or length(trim(mdg.approver_role)) = 0) then 'BLOCKED'
    when mdg.evidence_required and not exists (
      select 1
      from public.evidence_documents ed
      where ed.entity_type = 'MASTER_DATA'
        and (ed.entity_code = mdg.master_code or ed.entity_id = mdg.id)
        and ed.document_status = 'CHECKED'
        and ed.record_status = 'ACTIVE'
    ) then 'NEEDS_EVIDENCE'
    when mdg.control_status in ('CAN_SUA', 'CHUA_DU_DIEU_KIEN') then 'NEEDS_FIX'
    when mdg.control_status = 'DAT' then 'READY'
    else 'TEMP_READY'
  end as governance_status
from public.master_data_governance mdg
left join public.heu_os_modules m on m.module_code = mdg.module_code
left join public.users_profile creator on creator.id = mdg.created_by
left join public.users_profile updater on updater.id = mdg.updated_by
left join lateral (
  select
    count(*) filter (where r.request_status in ('DRAFT', 'PENDING_CHECK', 'CHECKED', 'NEEDS_FIX')) as open_request_count,
    count(*) filter (where r.request_status in ('APPROVED', 'APPLIED')) as approved_request_count,
    count(*) filter (where r.request_status = 'NEEDS_FIX') as needs_fix_request_count
  from public.master_data_change_requests r
  where r.governance_id = mdg.id
    and r.status = 'ACTIVE'
) req on true
where mdg.status = 'ACTIVE'
  and public.can_read_master_data_governance();

grant select on public.master_data_governance_status to authenticated;

create or replace view public.master_data_change_request_status
with (security_invoker = true)
as
select
  r.id,
  r.request_code,
  r.governance_id,
  mdg.master_code,
  mdg.master_name,
  mdg.source_table,
  r.change_type,
  r.target_record_id,
  r.target_record_code,
  r.change_title,
  r.current_value,
  r.proposed_value,
  r.request_reason,
  r.evidence_url,
  r.request_status,
  r.requested_by,
  requester.full_name as requested_by_name,
  r.checked_by,
  checker.full_name as checked_by_name,
  r.checked_at,
  r.approved_by,
  approver.full_name as approved_by_name,
  r.approved_at,
  r.applied_by,
  applier.full_name as applied_by_name,
  r.applied_at,
  r.rejection_reason,
  r.created_at,
  r.updated_at,
  array_remove(array[
    case when mdg.approval_required and r.request_status = 'DRAFT' then 'NOT_SUBMITTED' end,
    case when mdg.evidence_required and (r.evidence_url is null or length(trim(r.evidence_url)) = 0) then 'MISSING_EVIDENCE_URL' end,
    case when r.request_status = 'NEEDS_FIX' then 'NEEDS_FIX' end,
    case when r.request_status = 'REJECTED' then 'REJECTED' end,
    case when r.request_status = 'APPROVED' and r.applied_at is null then 'WAITING_APPLY' end
  ], null) as request_flags,
  case
    when r.request_status = 'APPLIED' then 'DONE'
    when r.request_status = 'APPROVED' and r.applied_at is null then 'WAITING_APPLY'
    when r.request_status in ('NEEDS_FIX', 'REJECTED') then 'NEEDS_FIX'
    when mdg.evidence_required and (r.evidence_url is null or length(trim(r.evidence_url)) = 0) then 'BLOCKED'
    else 'IN_REVIEW'
  end as request_control_status
from public.master_data_change_requests r
join public.master_data_governance mdg on mdg.id = r.governance_id
left join public.users_profile requester on requester.id = r.requested_by
left join public.users_profile checker on checker.id = r.checked_by
left join public.users_profile approver on approver.id = r.approved_by
left join public.users_profile applier on applier.id = r.applied_by
where r.status = 'ACTIVE'
  and public.can_read_master_data_governance();

grant select on public.master_data_change_request_status to authenticated;

create or replace view public.master_data_governance_summary
with (security_invoker = true)
as
select
  count(*)::int as master_count,
  count(*) filter (where governance_status = 'READY')::int as ready_count,
  count(*) filter (where governance_status = 'TEMP_READY')::int as temp_ready_count,
  count(*) filter (where governance_status = 'NEEDS_EVIDENCE')::int as needs_evidence_count,
  count(*) filter (where governance_status = 'NEEDS_FIX')::int as needs_fix_count,
  count(*) filter (where governance_status = 'BLOCKED')::int as blocked_count,
  count(*) filter (where ai_allowed = true)::int as ai_allowed_count,
  coalesce(sum(open_request_count), 0)::int as open_request_count
from public.master_data_governance_status;

grant select on public.master_data_governance_summary to authenticated;

insert into public.master_data_governance (
  master_code,
  master_name,
  module_code,
  source_table,
  data_domain,
  owner_department,
  steward_role,
  approval_required,
  checker_role,
  approver_role,
  sensitivity_level,
  change_frequency,
  ai_allowed,
  duplicate_rule,
  effective_date_required,
  audit_required,
  evidence_required,
  scope_rule,
  control_note,
  control_status
) values
  (
    'ADMISSION_SEGMENTS',
    'Doi tuong tuyen sinh',
    'M05_ADMISSION_CRM',
    'admission_segments',
    'ADMISSION',
    'TUYEN_SINH + BGH',
    'ADMISSION_HEAD',
    true,
    'IT_DATA',
    'BGH',
    'INTERNAL',
    'TERM',
    false,
    'Khong tao trung doi tuong tuyen sinh; moi segment phai co workspace va scope rule rieng.',
    true,
    true,
    true,
    'User chi thay segment duoc phan trong user_admission_segment_scopes.',
    'Day la truc phan tach lead theo doi tuong tuyen sinh.',
    'DAT_TAM_THOI'
  ),
  (
    'LEAD_SOURCES',
    'Nguon lead',
    'M05_ADMISSION_CRM',
    'lead_sources',
    'ADMISSION',
    'TUYEN_SINH + MARKETING',
    'ADMISSION_HEAD',
    true,
    'TEAM_LEAD',
    'ADMISSION_HEAD',
    'INTERNAL',
    'MONTHLY',
    true,
    'Source_code phai duy nhat; form/ads khong duoc tao trung nguon.',
    false,
    true,
    false,
    'Nguon lead dung de backfill flow/segment va bao cao hieu qua kenh.',
    'Can dong bo voi chien dich, doi tac va form online.',
    'DAT_TAM_THOI'
  ),
  (
    'ADMISSION_PROGRAMS',
    'He/chuong trinh dao tao HEU',
    'M05_ADMISSION_CRM',
    'admission_programs',
    'ACADEMIC',
    'DAO_TAO + TUYEN_SINH',
    'IT_DATA',
    true,
    'DAO_TAO',
    'BGH',
    'INTERNAL',
    'TERM',
    false,
    'Chi giu cac he HEU thuc te: trung cap, ngan han, lien thong dai hoc.',
    true,
    true,
    true,
    'Chuong trinh phai khop doi tuong tuyen sinh va checklist ho so.',
    'Khong tu them he dao tao khi chua co phap ly/SOP.',
    'DAT_TAM_THOI'
  ),
  (
    'ADMISSION_MAJORS',
    'Nganh dao tao HEU',
    'M05_ADMISSION_CRM',
    'admission_majors',
    'ACADEMIC',
    'DAO_TAO + TUYEN_SINH',
    'IT_DATA',
    true,
    'DAO_TAO',
    'BGH',
    'INTERNAL',
    'TERM',
    false,
    'Major_code phai duy nhat va gan dung chuong trinh.',
    true,
    true,
    true,
    'Nganh hien tren lead phai thuoc chuong trinh/doi tuong dang chon.',
    'Can kiem soat ten nganh de tranh tu van sai.',
    'DAT_TAM_THOI'
  ),
  (
    'HOU_PROGRAMS',
    'Chuong trinh lien thong HOU',
    'M08_HOU_LINKAGE',
    'hou_programs',
    'HOU',
    'TUYEN_SINH + PHAP_CHE + DAO_TAO',
    'HOU_OPERATOR',
    true,
    'LEGAL',
    'BGH',
    'RESTRICTED',
    'TERM',
    false,
    'Chuong trinh HOU phai khop van ban/lien ket/hoc phi theo thoi diem.',
    true,
    true,
    true,
    'Chi hien trong workspace lien thong dai hoc HOU.',
    'Anh huong dieu kien nhap hoc, hoc phi ky dau va COM HOU.',
    'DAT_TAM_THOI'
  ),
  (
    'HOU_MAJORS',
    'Nganh lien thong HOU',
    'M08_HOU_LINKAGE',
    'hou_majors',
    'HOU',
    'TUYEN_SINH + DAO_TAO',
    'HOU_OPERATOR',
    true,
    'DAO_TAO',
    'BGH',
    'RESTRICTED',
    'TERM',
    false,
    'Nganh HOU phai gan dung program_id va dieu kien dau vao.',
    true,
    true,
    true,
    'Chi hien khi lead gan chuong trinh HOU.',
    'Can canh bao neu nganh khong con tuyen.',
    'DAT_TAM_THOI'
  ),
  (
    'HOU_LOCATIONS',
    'Dia diem hoc HOU',
    'M08_HOU_LINKAGE',
    'hou_locations',
    'HOU',
    'PHAP_CHE + DAO_TAO + TUYEN_SINH',
    'HOU_OPERATOR',
    true,
    'LEGAL',
    'BGH',
    'RESTRICTED',
    'ON_DEMAND',
    false,
    'Moi dia diem phai co minh chung/thong tin cau hinh truoc khi dung.',
    true,
    true,
    true,
    'Dia diem hoc phai chon tu danh muc, khong go tu do tren lead.',
    'Co the bo sung dia diem moi nhu 786 Kim Giang qua request.',
    'DAT_TAM_THOI'
  ),
  (
    'HOU_COMMISSION_POLICIES',
    'Chinh sach COM HOU',
    'M08_HOU_LINKAGE',
    'hou_commission_policies',
    'FINANCE',
    'KHTC + TUYEN_SINH + BGH',
    'ACCOUNTING_LEAD',
    true,
    'ACCOUNTING_LEAD',
    'BGH',
    'SECRET',
    'ON_DEMAND',
    false,
    'Chinh sach co moc thoi gian hieu luc; khong chi COM hai lan.',
    true,
    true,
    true,
    'Chi quan tri/BGH/truong phong tuyen sinh va ke toan duoc xem chi tiet.',
    'Ty le HEU nhan lai va cong thuc COM la du lieu han che.',
    'DAT_TAM_THOI'
  ),
  (
    'ENROLLMENT_CHECKLISTS',
    'Checklist ho so nhap hoc',
    'M06_HSSV_HANDOVER',
    'enrollment_checklists',
    'DOCUMENT',
    'CTHSSV + TUYEN_SINH',
    'CTHSSV_LEAD',
    true,
    'CTHSSV_LEAD',
    'BGH',
    'INTERNAL',
    'TERM',
    false,
    'Document_code khong duoc trung; checklist phai gan dung he ap dung.',
    true,
    true,
    true,
    'Lead chi duoc len du dieu kien khi ho so bat buoc dat.',
    'Can quan tri theo tung doi tuong/he dao tao.',
    'DAT_TAM_THOI'
  ),
  (
    'PARTNERS',
    'Doi tac/CTV/don vi lien ket',
    'M05_ADMISSION_CRM',
    'partners',
    'PARTNER',
    'TUYEN_SINH + PHAP_CHE + KHTC',
    'ADMISSION_HEAD',
    true,
    'LEGAL',
    'BGH',
    'CONFIDENTIAL',
    'ON_DEMAND',
    false,
    'Partner phai co ma duy nhat; hop dong/chinh sach COM phai ro truoc khi tinh chi.',
    true,
    true,
    true,
    'User chi thay doi tac duoc phan trong user_partner_scopes.',
    'Lien quan tranh chap nguon lead va cong no COM.',
    'DAT_TAM_THOI'
  )
on conflict (master_code) do update set
  master_name = excluded.master_name,
  module_code = excluded.module_code,
  source_table = excluded.source_table,
  data_domain = excluded.data_domain,
  owner_department = excluded.owner_department,
  steward_role = excluded.steward_role,
  approval_required = excluded.approval_required,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  sensitivity_level = excluded.sensitivity_level,
  change_frequency = excluded.change_frequency,
  ai_allowed = excluded.ai_allowed,
  duplicate_rule = excluded.duplicate_rule,
  effective_date_required = excluded.effective_date_required,
  audit_required = excluded.audit_required,
  evidence_required = excluded.evidence_required,
  scope_rule = excluded.scope_rule,
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
    'MASTER_DATA_GOVERNANCE',
    'Master Data Governance',
    'M00_MASTER_CONTROL',
    'MASTER',
    'BGH + IT_DATA',
    'Registry quan tri du lieu goc: owner, steward, rule, approval, evidence, AI policy.',
    'RESTRICTED',
    false,
    'DAT_TAM_THOI'
  ),
  (
    'MASTER_DATA_CHANGE_REQUESTS',
    'Master Data Change Requests',
    'M00_MASTER_CONTROL',
    'TRANSACTION',
    'BGH + IT_DATA',
    'Yeu cau tao/sua/huy/gop/import du lieu goc, co nguoi kiem/duyet/ap dung va audit.',
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
  'P0_10_MASTER_DATA_GOVERNANCE',
  'P0-10 Master Data Governance',
  'M00_MASTER_CONTROL',
  'master_data_governance',
  'MASTER',
  'BGH + IT_DATA',
  'HEU_OS',
  'RESTRICTED',
  false,
  'Moi thay doi du lieu goc phai qua request, checker/approver va evidence neu bat buoc.',
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
  'GATE_P0_10_MASTER_DATA_GOVERNANCE',
  'P0-10 Master Data Governance',
  'DATA',
  'MASTER_DATA',
  'MASTER_DATA_GOVERNANCE',
  'BGH + IT_DATA',
  'Kiem tra du lieu goc co owner, steward, rule chong trung, pham vi, audit, evidence va AI policy.',
  'Khong cho module production tu sua danh muc goc neu chua co request duyet hoac rule ro rang.',
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
