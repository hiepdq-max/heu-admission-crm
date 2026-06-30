-- Step 111 - HEU Finance Desk module shell and code policy.
-- Run after Step98, Step108 and the TTGDTX finance P2 chain on an approved UAT
-- or restore environment only.
-- Migration candidate only. Do not run production migration from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order
-- approval, signed UAT and business Go/No-Go sign-off.
--
-- Purpose:
-- - Register HEU Finance Desk as the compact accounting workbench for KHTC.
-- - Keep it as a controlled module over existing TTGDTX import/source/dashboard
--   objects, not as a replacement for statutory accounting software.
-- - Provide code-generation rules and a document-link registry for Excel links
--   without committing raw evidence links into Git.
--
-- Boundary statement for audit:
-- Migration candidate only. Do not run production migration from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval, signed UAT and business Go/No-Go sign-off.
--
-- Control statement for audit:
-- finance_desk.read, finance_desk.manage and finance_desk.export are guarded
-- by enable row level security, can_read_finance_desk,
-- can_manage_finance_desk and write_audit_log controls.

begin;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('finance_desk.read'),
    ('finance_desk.manage'),
    ('finance_desk.export')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA', 'ACCOUNTING_LEAD', 'KHTC')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('finance_desk.read'),
    ('finance_desk.export')
) as p(permission)
where r.code in ('BGH', 'AUDIT')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, 'finance_desk.read'
from public.roles r
where r.code in ('ACCOUNTING', 'LEGAL', 'CTHSSV_LEAD', 'ADMISSION_HEAD')
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
    'finance_desk.read',
    'FINANCE_DESK',
    'Xem HEU Finance Desk',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + IT_DATA + AUDIT',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    72,
    true,
    'Chi xem tong hop cong no, import, doi soat nguon va thanh toan trung tam trong pham vi duoc cap.',
    'DAT_TAM_THOI'
  ),
  (
    'finance_desk.manage',
    'FINANCE_DESK',
    'Quan ly registry/link/import HEU Finance Desk',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + IT_DATA',
    'CRITICAL',
    'ROLE_AND_SCOPE',
    true,
    true,
    true,
    24,
    false,
    'Quan ly registry/link/import phai qua audit log; khong duoc sua thang so tien da khoa.',
    'DAT_TAM_THOI'
  ),
  (
    'finance_desk.export',
    'FINANCE_DESK',
    'Xuat bao cao HEU Finance Desk',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + BGH + AUDIT',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    true,
    24,
    false,
    'Moi bao cao xuat ra phai co ma bao cao, nguoi xuat, thoi diem xuat va nguon du lieu.',
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

create table if not exists public.heu_finance_desk_code_policy (
  id uuid primary key default gen_random_uuid(),
  code_kind text not null unique,
  code_prefix text not null unique,
  code_pattern text not null,
  file_name_pattern text,
  owner_department text not null default 'KHTC + IT_DATA',
  description text not null,
  control_status text not null default 'DAT_TAM_THOI',
  record_status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_finance_desk_code_policy_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

insert into public.heu_finance_desk_code_policy (
  code_kind,
  code_prefix,
  code_pattern,
  file_name_pattern,
  description
) values
  (
    'IMPORT_BATCH',
    'HFD-BATCH',
    'HFD-BATCH-[YYYYMMDD]-[NNN]',
    'HEU_KT_FINANCE_DESK_IMPORT_BATCH_[YYYYMMDD]_V[VV]_[TRANG_THAI]',
    'Ma batch import tu Excel/Google Sheet vao staging Finance Desk.'
  ),
  (
    'DOCUMENT_LINK',
    'HFD-LINK',
    'HFD-LINK-[YYYYMMDD]-[NNN]',
    'HEU_KT_FINANCE_DESK_LINK_INVENTORY_[YYYYMMDD]_V[VV]_[TRANG_THAI]',
    'Ma dong link hop dong, phu luc, bien ban nghiem thu hoac chung tu.'
  ),
  (
    'SOURCE_CHECK',
    'HFD-CHK',
    'HFD-CHK-[YYYYMMDD]-[NNN]',
    'HEU_KT_FINANCE_DESK_SOURCE_CHECK_[YYYYMMDD]_V[VV]_[TRANG_THAI]',
    'Ma checklist kiem nguon file, metadata, quyen truy cap va OCR.'
  ),
  (
    'REPORT_EXPORT',
    'HFD-RPT',
    'HFD-RPT-[YYYYMMDD]-[NNN]',
    'HEU_KT_FINANCE_DESK_REPORT_[YYYYMMDD]_V[VV]_[TRANG_THAI]',
    'Ma bao cao xuat cho KHTC/BGH/Audit.'
  ),
  (
    'PERIOD_LOCK',
    'HFD-LOCK',
    'HFD-LOCK-[YYYYMMDD]-[NNN]',
    'HEU_KT_FINANCE_DESK_PERIOD_LOCK_[YYYYMMDD]_V[VV]_[TRANG_THAI]',
    'Ma khoa ky doi soat Finance Desk.'
  ),
  (
    'PAYMENT_REVIEW',
    'HFD-PAYREV',
    'HFD-PAYREV-[YYYYMMDD]-[NNN]',
    'HEU_KT_FINANCE_DESK_PAYMENT_REVIEW_[YYYYMMDD]_V[VV]_[TRANG_THAI]',
    'Ma phien ra soat de nghi chi/thanh toan trung tam.'
  )
on conflict (code_kind) do update set
  code_prefix = excluded.code_prefix,
  code_pattern = excluded.code_pattern,
  file_name_pattern = excluded.file_name_pattern,
  description = excluded.description,
  updated_at = now();

create or replace function public.build_heu_finance_desk_code(
  code_kind text,
  event_date date default current_date,
  sequence_no int default 1
)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  selected_prefix text;
begin
  if sequence_no is null or sequence_no < 1 or sequence_no > 999 then
    raise exception 'sequence_no must be between 1 and 999';
  end if;

  select code_prefix
  into selected_prefix
  from public.heu_finance_desk_code_policy
  where heu_finance_desk_code_policy.code_kind = build_heu_finance_desk_code.code_kind
    and record_status = 'ACTIVE';

  if selected_prefix is null then
    raise exception 'Unknown HEU Finance Desk code_kind: %', code_kind;
  end if;

  return selected_prefix
    || '-'
    || to_char(coalesce(event_date, current_date), 'YYYYMMDD')
    || '-'
    || lpad(sequence_no::text, 3, '0');
end;
$$;

grant execute on function public.build_heu_finance_desk_code(text, date, int)
to authenticated;

create table if not exists public.heu_finance_desk_document_links (
  id uuid primary key default gen_random_uuid(),
  link_code text not null unique,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  source_batch_id uuid references public.ttgdtx_tuition_import_batches(id) on delete restrict,
  source_file_name text not null,
  source_sheet text,
  source_cell text,
  link_platform text not null default 'OTHER',
  link_url text not null,
  external_file_id text,
  target_title text,
  target_mime_type text,
  document_scope text not null default 'EVIDENCE',
  access_status text not null default 'NOT_CHECKED',
  ocr_status text not null default 'NOT_REQUIRED',
  owner_department text not null default 'KHTC',
  checker_role text,
  approver_role text,
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_finance_desk_link_platform_valid check (
    link_platform in ('GOOGLE_DRIVE', 'GOOGLE_SHEET', 'SHAREPOINT', 'ONEDRIVE', 'LOCAL_PATH', 'OTHER')
  ),
  constraint heu_finance_desk_link_scope_valid check (
    document_scope in ('CONTRACT', 'CONTRACT_APPENDIX', 'ACCEPTANCE_MINUTES', 'PAYMENT_EVIDENCE', 'TUITION_SOURCE', 'IMPORT_SOURCE', 'EVIDENCE', 'OTHER')
  ),
  constraint heu_finance_desk_link_access_valid check (
    access_status in ('NOT_CHECKED', 'METADATA_OK', 'DOWNLOAD_OK', 'OCR_REQUIRED', 'ACCESS_BLOCKED', 'NEEDS_PERMISSION', 'BROKEN_LINK')
  ),
  constraint heu_finance_desk_link_ocr_valid check (
    ocr_status in ('NOT_REQUIRED', 'REQUIRED', 'IN_PROGRESS', 'DONE', 'FAILED', 'WAIVED')
  )
);

create index if not exists idx_heu_finance_desk_links_segment
on public.heu_finance_desk_document_links(admission_segment_id, document_scope, access_status)
where record_status = 'ACTIVE';

create index if not exists idx_heu_finance_desk_links_external_file
on public.heu_finance_desk_document_links(external_file_id)
where record_status = 'ACTIVE' and external_file_id is not null;

drop trigger if exists trg_heu_finance_desk_code_policy_updated_at
on public.heu_finance_desk_code_policy;
create trigger trg_heu_finance_desk_code_policy_updated_at
before update on public.heu_finance_desk_code_policy
for each row execute function public.set_updated_at();

drop trigger if exists trg_heu_finance_desk_links_updated_at
on public.heu_finance_desk_document_links;
create trigger trg_heu_finance_desk_links_updated_at
before update on public.heu_finance_desk_document_links
for each row execute function public.set_updated_at();

drop trigger if exists trg_heu_finance_desk_code_policy_audit
on public.heu_finance_desk_code_policy;
create trigger trg_heu_finance_desk_code_policy_audit
after insert or update or delete on public.heu_finance_desk_code_policy
for each row execute function public.write_audit_log();

drop trigger if exists trg_heu_finance_desk_links_audit
on public.heu_finance_desk_document_links;
create trigger trg_heu_finance_desk_links_audit
after insert or update or delete on public.heu_finance_desk_document_links
for each row execute function public.write_audit_log();

alter table public.heu_finance_desk_code_policy enable row level security;
alter table public.heu_finance_desk_document_links enable row level security;

create or replace function public.can_read_finance_desk(target_segment_id uuid)
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
        public.has_permission('finance_desk.read')
        or public.has_permission('finance_desk.manage')
        or public.has_permission('finance_desk.export')
        or public.has_permission('ttgdtx.report.read')
        or public.has_permission('ttgdtx.import.read')
        or public.has_permission('ttgdtx.source.read')
      )
      and public.can_access_business_scope(target_segment_id, null::uuid)
    )
$$;

create or replace function public.can_manage_finance_desk()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('finance_desk.manage')
$$;

grant execute on function public.can_read_finance_desk(uuid) to authenticated;
grant execute on function public.can_manage_finance_desk() to authenticated;

drop policy if exists "heu_finance_desk_code_policy_select"
on public.heu_finance_desk_code_policy;
create policy "heu_finance_desk_code_policy_select"
on public.heu_finance_desk_code_policy for select
to authenticated
using (
  public.is_admin()
  or public.current_user_role_code() in ('BGH', 'AUDIT')
  or public.has_permission('finance_desk.read')
  or public.has_permission('finance_desk.manage')
);

drop policy if exists "heu_finance_desk_code_policy_manage"
on public.heu_finance_desk_code_policy;
create policy "heu_finance_desk_code_policy_manage"
on public.heu_finance_desk_code_policy for all
to authenticated
using (public.can_manage_finance_desk())
with check (public.can_manage_finance_desk());

drop policy if exists "heu_finance_desk_links_select"
on public.heu_finance_desk_document_links;
create policy "heu_finance_desk_links_select"
on public.heu_finance_desk_document_links for select
to authenticated
using (public.can_read_finance_desk(admission_segment_id));

drop policy if exists "heu_finance_desk_links_insert"
on public.heu_finance_desk_document_links;
create policy "heu_finance_desk_links_insert"
on public.heu_finance_desk_document_links for insert
to authenticated
with check (
  public.can_manage_finance_desk()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
);

drop policy if exists "heu_finance_desk_links_update"
on public.heu_finance_desk_document_links;
create policy "heu_finance_desk_links_update"
on public.heu_finance_desk_document_links for update
to authenticated
using (
  public.can_manage_finance_desk()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
)
with check (
  public.can_manage_finance_desk()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
);

create or replace view public.heu_finance_desk_code_policy_status
with (security_invoker = true)
as
select
  code_kind,
  code_prefix,
  code_pattern,
  file_name_pattern,
  owner_department,
  description,
  control_status,
  updated_at
from public.heu_finance_desk_code_policy
where record_status = 'ACTIVE';

grant select on public.heu_finance_desk_code_policy_status to authenticated;

create or replace view public.heu_finance_desk_document_link_status
with (security_invoker = true)
as
select
  l.id,
  l.link_code,
  l.admission_segment_id,
  s.segment_code,
  s.segment_name,
  l.source_file_name,
  l.source_sheet,
  l.source_cell,
  l.link_platform,
  l.external_file_id,
  l.target_title,
  l.target_mime_type,
  l.document_scope,
  l.access_status,
  l.ocr_status,
  l.owner_department,
  l.checker_role,
  l.approver_role,
  l.note,
  array_remove(array[
    case when l.access_status in ('NOT_CHECKED', 'NEEDS_PERMISSION', 'ACCESS_BLOCKED', 'BROKEN_LINK') then 'LINK_NEEDS_CHECK' end,
    case when l.link_platform in ('SHAREPOINT', 'ONEDRIVE') and l.access_status = 'NOT_CHECKED' then 'MICROSOFT_PERMISSION_NOT_VERIFIED' end,
    case when l.ocr_status = 'REQUIRED' then 'OCR_REQUIRED' end,
    case when l.checker_role is null or length(trim(l.checker_role)) = 0 then 'MISSING_CHECKER' end,
    case when l.approver_role is null or length(trim(l.approver_role)) = 0 then 'MISSING_APPROVER' end
  ], null) as control_flags,
  case
    when l.access_status in ('BROKEN_LINK', 'ACCESS_BLOCKED') then 'BLOCKED'
    when l.access_status in ('NOT_CHECKED', 'NEEDS_PERMISSION') then 'WAITING_CHECK'
    when l.ocr_status = 'REQUIRED' then 'OCR_REQUIRED'
    else 'READY'
  end as readiness_status,
  l.updated_at
from public.heu_finance_desk_document_links l
join public.admission_segments s on s.id = l.admission_segment_id
where l.record_status = 'ACTIVE'
  and public.can_read_finance_desk(l.admission_segment_id);

grant select on public.heu_finance_desk_document_link_status to authenticated;

create or replace view public.heu_finance_desk_summary
with (security_invoker = true)
as
select
  coalesce(dashboard_summary.receivable_total_vnd, 0)::numeric as receivable_total_vnd,
  coalesce(dashboard_summary.receivable_paid_vnd, 0)::numeric as receivable_paid_vnd,
  coalesce(dashboard_summary.receivable_balance_vnd, 0)::numeric as receivable_balance_vnd,
  coalesce(dashboard_summary.collected_total_vnd, 0)::numeric as collected_total_vnd,
  coalesce(dashboard_summary.locked_reconciled_total_vnd, 0)::numeric as locked_reconciled_total_vnd,
  coalesce(dashboard_summary.requested_total_vnd, 0)::numeric as requested_total_vnd,
  coalesce(dashboard_summary.approved_total_vnd, 0)::numeric as approved_total_vnd,
  coalesce(dashboard_summary.disbursed_total_vnd, 0)::numeric as disbursed_total_vnd,
  coalesce(dashboard_summary.remaining_to_pay_vnd, 0)::numeric as remaining_to_pay_vnd,
  coalesce(dashboard_summary.partner_with_exception_count, 0)::int as partner_with_exception_count,
  coalesce(i.import_batch_count, 0)::int as import_batch_count,
  coalesce(i.import_issue_count, 0)::int as import_issue_count,
  coalesce(l.document_link_count, 0)::int as document_link_count,
  coalesce(l.link_issue_count, 0)::int as link_issue_count,
  now() as updated_at
from public.ttgdtx_accounting_dashboard_summary dashboard_summary
cross join lateral (
  select
    count(*)::int as import_batch_count,
    coalesce(sum(critical_check_count + failed_check_count + warning_check_count), 0)::int as import_issue_count
  from public.ttgdtx_tuition_import_batch_readiness
) i
cross join lateral (
  select
    count(*)::int as document_link_count,
    count(*) filter (where readiness_status <> 'READY')::int as link_issue_count
  from public.heu_finance_desk_document_link_status
) l;

grant select on public.heu_finance_desk_summary to authenticated;

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
  'HEU_FINANCE_DESK_MVP',
  'HEU Finance Desk - Cong no hoc phi va thanh toan trung tam',
  'FINANCE',
  'KHTC + IT_DATA + AUDIT',
  '/finance-desk',
  false,
  'Module tong hop import Excel, link ho so, cong no, thu hoc phi, doi soat, de nghi chi va chi trung tam; khong thay the phan mem ke toan thue.',
  800,
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
  control_status,
  status
) values (
  'WF_HEU_FINANCE_DESK_MVP',
  'HEU Finance Desk - Cong no hoc phi va thanh toan trung tam',
  'M08_FINANCE_ACCOUNTING',
  'Khi KHTC can tong hop file Excel, cong no hoc phi, link chung tu va thanh toan trung tam.',
  'KHTC',
  'KHTC + IT_DATA + AUDIT',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/KE_TOAN_TRUONG',
  'Ban lam viec tong hop co chi bao import, ho so nguon, cong no, thu tien, doi soat va con phai chi.',
  'Moi dieu chinh tien quay ve buoc goc P2; Finance Desk chi tong hop va dieu huong.',
  'Moi thay doi registry/link/import phai co audit log; AI khong phe duyet, khong chi tien.',
  8000,
  'DAT_TAM_THOI',
  'ACTIVE'
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
  status = excluded.status,
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
  control_status,
  status
) values
  (
    'HEU_FINANCE_DESK_MVP',
    'HEU Finance Desk summary and workbench',
    'M08_FINANCE_ACCOUNTING',
    'heu_finance_desk_summary; heu_finance_desk_document_links; heu_finance_desk_code_policy',
    'REPORT_VIEW',
    'KHTC + IT_DATA + AUDIT',
    'SUPABASE',
    'RESTRICTED',
    true,
    'Finance Desk chi tong hop/dieu huong; sua giao dich tien phai thuc hien tai bang/buoc goc co phe duyet.',
    'DAT_TAM_THOI',
    'ACTIVE'
  ),
  (
    'HEU_FINANCE_DESK_LINK_REGISTRY',
    'Registry link chung tu Finance Desk',
    'M08_FINANCE_ACCOUNTING',
    'heu_finance_desk_document_links; heu_finance_desk_document_link_status',
    'EVIDENCE',
    'KHTC + PHAP_CHE + IT_DATA',
    'SUPABASE',
    'RESTRICTED',
    true,
    'Link hop dong, phu luc, BBNT va chung tu chi la can cu khi access/OCR/checker/approver da duoc ghi nhan.',
    'DAT_TAM_THOI',
    'ACTIVE'
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
  status = excluded.status,
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
  'NAV_HEU_FINANCE_DESK',
  'HEU Finance Desk',
  'FINANCE',
  'M08_FINANCE_ACCOUNTING',
  '/finance-desk',
  'Cong no hoc phi, import Excel, doi soat nguon va thanh toan trung tam.',
  'KHTC + IT_DATA + AUDIT',
  'Mo Finance Desk de xem canh bao import, link ho so va khop so tien.',
  8000,
  false,
  'Can xu ly khi import co fail/critical, link chua kiem quyen/OCR, hoac dashboard P2-18 co chenh lech.',
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
