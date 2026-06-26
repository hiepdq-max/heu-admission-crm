-- Step 92 - P2-06 TTGDTX Tuition Import Control.
-- Run after step91_ttgdtx_receivable_gate_p2_05.sql.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - No physical removal of business data is used.
-- - If rollback is needed, mark introduced P2-06 import/control records inactive
--   through an approved corrective migration and keep audit evidence.
--
-- Purpose:
-- - Bring the real tuition/debt Excel/Google Sheet workflow into Supabase safely.
-- - Do not write spreadsheet rows directly into final receivable/payment tables.
-- - Import -> staging -> reconciliation checks -> controlled handover to P2-03/P2+.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.import.read'),
    ('ttgdtx.import.manage'),
    ('ttgdtx.import.approve')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA', 'ACCOUNTING', 'ACCOUNTING_LEAD', 'KHTC')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.import.read'),
    ('ttgdtx.import.approve')
) as p(permission)
where r.code in ('BGH', 'AUDIT')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, 'ttgdtx.import.read'
from public.roles r
where r.code in ('TUYEN_SINH', 'CTHSSV', 'TEAM_LEAD', 'COUNSELOR')
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
    'ttgdtx.import.read',
    'TTGDTX',
    'Xem batch import học phí TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + IT_DATA',
    'MEDIUM',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    72,
    true,
    'Chỉ đọc dữ liệu staging và kết quả đối soát; không thay đổi công nợ thật.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.import.manage',
    'TTGDTX',
    'Tạo/cập nhật batch import học phí TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + IT_DATA',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    true,
    24,
    false,
    'Import file kế toán phải đi qua staging, kiểm trùng, kiểm tổng tiền và audit log.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.import.approve',
    'TTGDTX',
    'Duyệt khóa batch import học phí TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + BGH + AUDIT',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    24,
    false,
    'Chỉ duyệt khóa batch khi không còn lỗi CRITICAL/ERROR; không dùng để xác nhận đã thu tiền.',
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

create table if not exists public.ttgdtx_tuition_import_batches (
  id uuid primary key default gen_random_uuid(),
  batch_code text not null unique,
  batch_name text not null,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  source_kind text not null default 'EXCEL',
  source_file_name text not null,
  source_file_url text,
  source_owner text,
  workbook_modified_at timestamptz,
  workbook_sheet_count int not null default 0,
  raw_student_row_count int not null default 0,
  raw_receipt_row_count int not null default 0,
  raw_partner_acceptance_row_count int not null default 0,
  raw_class_policy_row_count int not null default 0,
  expected_total_vnd numeric(16,2) not null default 0,
  paid_total_vnd numeric(16,2) not null default 0,
  uncollectible_total_vnd numeric(16,2) not null default 0,
  balance_total_vnd numeric(16,2) not null default 0,
  partner_payable_total_vnd numeric(16,2) not null default 0,
  partner_paid_total_vnd numeric(16,2) not null default 0,
  partner_balance_total_vnd numeric(16,2) not null default 0,
  issue_error_count int not null default 0,
  issue_warning_count int not null default 0,
  import_status text not null default 'DRAFT',
  locked_by uuid references public.users_profile(id),
  locked_at timestamptz,
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_import_source_kind_valid check (
    source_kind in ('EXCEL', 'GOOGLE_SHEET', 'CSV', 'MANUAL_SUMMARY', 'API')
  ),
  constraint ttgdtx_import_status_valid check (
    import_status in (
      'DRAFT',
      'IMPORTED',
      'CHECKING',
      'HAS_ISSUES',
      'READY_TO_LOCK',
      'LOCKED',
      'CANCELLED'
    )
  ),
  constraint ttgdtx_import_counts_valid check (
    workbook_sheet_count >= 0
    and raw_student_row_count >= 0
    and raw_receipt_row_count >= 0
    and raw_partner_acceptance_row_count >= 0
    and raw_class_policy_row_count >= 0
    and issue_error_count >= 0
    and issue_warning_count >= 0
  ),
  constraint ttgdtx_import_amounts_valid check (
    expected_total_vnd >= 0
    and paid_total_vnd >= 0
    and uncollectible_total_vnd >= 0
    and balance_total_vnd >= 0
    and partner_payable_total_vnd >= 0
    and partner_paid_total_vnd >= 0
  )
);

create index if not exists idx_ttgdtx_import_batches_segment
on public.ttgdtx_tuition_import_batches(admission_segment_id, import_status)
where record_status = 'ACTIVE';

create table if not exists public.ttgdtx_tuition_import_staging_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.ttgdtx_tuition_import_batches(id) on delete restrict,
  row_code text not null unique,
  source_sheet text not null,
  source_row_number int,
  row_type text not null,
  cohort_code text,
  class_code text,
  student_external_code text,
  student_name text,
  student_phone text,
  student_dob_text text,
  partner_code text,
  partner_name text,
  program_name text,
  major_name text,
  term_label text,
  expected_amount_vnd numeric(16,2) not null default 0,
  paid_amount_vnd numeric(16,2) not null default 0,
  uncollectible_amount_vnd numeric(16,2) not null default 0,
  balance_amount_vnd numeric(16,2) not null default 0,
  receipt_code text,
  receipt_date_text text,
  receipt_amount_vnd numeric(16,2) not null default 0,
  contract_code text,
  contract_link text,
  acceptance_code text,
  acceptance_link text,
  partner_payable_amount_vnd numeric(16,2) not null default 0,
  partner_paid_amount_vnd numeric(16,2) not null default 0,
  partner_balance_amount_vnd numeric(16,2) not null default 0,
  row_status text not null default 'RAW',
  issue_codes text[] not null default '{}',
  issue_message text,
  raw_payload jsonb not null default '{}'::jsonb,
  record_status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_import_row_type_valid check (
    row_type in (
      'BATCH_SUMMARY',
      'CLASS_POLICY',
      'STUDENT_RECEIVABLE',
      'PAYMENT_TRANSACTION',
      'PARTNER_ACCEPTANCE',
      'PARTNER_PAYABLE',
      'VOUCHER_TEMPLATE',
      'ISSUE_SAMPLE',
      'UNKNOWN'
    )
  ),
  constraint ttgdtx_import_row_status_valid check (
    row_status in ('RAW', 'VALID', 'WARNING', 'ERROR', 'IGNORED')
  ),
  constraint ttgdtx_import_row_amounts_valid check (
    expected_amount_vnd >= 0
    and paid_amount_vnd >= 0
    and uncollectible_amount_vnd >= 0
    and receipt_amount_vnd >= 0
    and partner_payable_amount_vnd >= 0
    and partner_paid_amount_vnd >= 0
  )
);

create index if not exists idx_ttgdtx_import_rows_batch
on public.ttgdtx_tuition_import_staging_rows(batch_id, row_type, row_status)
where record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_import_rows_issues
on public.ttgdtx_tuition_import_staging_rows using gin(issue_codes);

create table if not exists public.ttgdtx_tuition_import_checks (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.ttgdtx_tuition_import_batches(id) on delete restrict,
  check_code text not null,
  check_name text not null,
  severity text not null default 'WARNING',
  source_sheet text,
  expected_amount_vnd numeric(16,2),
  actual_amount_vnd numeric(16,2),
  diff_amount_vnd numeric(16,2),
  actual_count int,
  check_status text not null default 'WARN',
  check_message text,
  owner_department text not null default 'KHTC',
  fix_hint text,
  record_status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (batch_id, check_code),
  constraint ttgdtx_import_check_severity_valid check (
    severity in ('INFO', 'WARNING', 'ERROR', 'CRITICAL')
  ),
  constraint ttgdtx_import_check_status_valid check (
    check_status in ('PASS', 'WARN', 'FAIL')
  )
);

create index if not exists idx_ttgdtx_import_checks_batch
on public.ttgdtx_tuition_import_checks(batch_id, severity, check_status)
where record_status = 'ACTIVE';

create table if not exists public.ttgdtx_tuition_import_field_map (
  id uuid primary key default gen_random_uuid(),
  map_code text not null unique,
  source_sheet_pattern text not null,
  row_type text not null,
  source_column_name text not null,
  normalized_field text not null,
  is_required boolean not null default false,
  validation_rule text,
  owner_department text not null default 'KHTC + IT_DATA',
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_ttgdtx_import_batches_updated_at
on public.ttgdtx_tuition_import_batches;
create trigger trg_ttgdtx_import_batches_updated_at
before update on public.ttgdtx_tuition_import_batches
for each row execute function public.set_updated_at();

drop trigger if exists trg_ttgdtx_import_rows_updated_at
on public.ttgdtx_tuition_import_staging_rows;
create trigger trg_ttgdtx_import_rows_updated_at
before update on public.ttgdtx_tuition_import_staging_rows
for each row execute function public.set_updated_at();

drop trigger if exists trg_ttgdtx_import_checks_updated_at
on public.ttgdtx_tuition_import_checks;
create trigger trg_ttgdtx_import_checks_updated_at
before update on public.ttgdtx_tuition_import_checks
for each row execute function public.set_updated_at();

drop trigger if exists trg_ttgdtx_import_field_map_updated_at
on public.ttgdtx_tuition_import_field_map;
create trigger trg_ttgdtx_import_field_map_updated_at
before update on public.ttgdtx_tuition_import_field_map
for each row execute function public.set_updated_at();

drop trigger if exists trg_ttgdtx_import_batches_audit
on public.ttgdtx_tuition_import_batches;
create trigger trg_ttgdtx_import_batches_audit
after insert or update or delete on public.ttgdtx_tuition_import_batches
for each row execute function public.write_audit_log();

drop trigger if exists trg_ttgdtx_import_rows_audit
on public.ttgdtx_tuition_import_staging_rows;
create trigger trg_ttgdtx_import_rows_audit
after insert or update or delete on public.ttgdtx_tuition_import_staging_rows
for each row execute function public.write_audit_log();

drop trigger if exists trg_ttgdtx_import_checks_audit
on public.ttgdtx_tuition_import_checks;
create trigger trg_ttgdtx_import_checks_audit
after insert or update or delete on public.ttgdtx_tuition_import_checks
for each row execute function public.write_audit_log();

drop trigger if exists trg_ttgdtx_import_field_map_audit
on public.ttgdtx_tuition_import_field_map;
create trigger trg_ttgdtx_import_field_map_audit
after insert or update or delete on public.ttgdtx_tuition_import_field_map
for each row execute function public.write_audit_log();

alter table public.ttgdtx_tuition_import_batches enable row level security;
alter table public.ttgdtx_tuition_import_staging_rows enable row level security;
alter table public.ttgdtx_tuition_import_checks enable row level security;
alter table public.ttgdtx_tuition_import_field_map enable row level security;

create or replace function public.can_read_ttgdtx_import(target_segment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('ttgdtx.import.read')
    or public.has_permission('ttgdtx.import.manage')
    or public.has_permission('ttgdtx.import.approve')
    or public.can_access_business_scope(target_segment_id, null)
$$;

create or replace function public.can_manage_ttgdtx_import()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('ttgdtx.import.manage')
    or public.has_permission('ttgdtx.import.approve')
$$;

grant execute on function public.can_read_ttgdtx_import(uuid) to authenticated;
grant execute on function public.can_manage_ttgdtx_import() to authenticated;

drop policy if exists "ttgdtx_import_batches_select"
on public.ttgdtx_tuition_import_batches;
create policy "ttgdtx_import_batches_select"
on public.ttgdtx_tuition_import_batches for select
to authenticated
using (public.can_read_ttgdtx_import(admission_segment_id));

drop policy if exists "ttgdtx_import_batches_manage"
on public.ttgdtx_tuition_import_batches;
create policy "ttgdtx_import_batches_manage"
on public.ttgdtx_tuition_import_batches for all
to authenticated
using (public.can_manage_ttgdtx_import())
with check (public.can_manage_ttgdtx_import());

drop policy if exists "ttgdtx_import_rows_select"
on public.ttgdtx_tuition_import_staging_rows;
create policy "ttgdtx_import_rows_select"
on public.ttgdtx_tuition_import_staging_rows for select
to authenticated
using (
  exists (
    select 1
    from public.ttgdtx_tuition_import_batches b
    where b.id = batch_id
      and public.can_read_ttgdtx_import(b.admission_segment_id)
  )
);

drop policy if exists "ttgdtx_import_rows_manage"
on public.ttgdtx_tuition_import_staging_rows;
create policy "ttgdtx_import_rows_manage"
on public.ttgdtx_tuition_import_staging_rows for all
to authenticated
using (public.can_manage_ttgdtx_import())
with check (public.can_manage_ttgdtx_import());

drop policy if exists "ttgdtx_import_checks_select"
on public.ttgdtx_tuition_import_checks;
create policy "ttgdtx_import_checks_select"
on public.ttgdtx_tuition_import_checks for select
to authenticated
using (
  exists (
    select 1
    from public.ttgdtx_tuition_import_batches b
    where b.id = batch_id
      and public.can_read_ttgdtx_import(b.admission_segment_id)
  )
);

drop policy if exists "ttgdtx_import_checks_manage"
on public.ttgdtx_tuition_import_checks;
create policy "ttgdtx_import_checks_manage"
on public.ttgdtx_tuition_import_checks for all
to authenticated
using (public.can_manage_ttgdtx_import())
with check (public.can_manage_ttgdtx_import());

drop policy if exists "ttgdtx_import_field_map_select"
on public.ttgdtx_tuition_import_field_map;
create policy "ttgdtx_import_field_map_select"
on public.ttgdtx_tuition_import_field_map for select
to authenticated
using (
  public.is_admin()
  or public.current_user_role_code() = 'BGH'
  or public.has_permission('ttgdtx.import.read')
  or public.has_permission('ttgdtx.import.manage')
);

drop policy if exists "ttgdtx_import_field_map_manage"
on public.ttgdtx_tuition_import_field_map;
create policy "ttgdtx_import_field_map_manage"
on public.ttgdtx_tuition_import_field_map for all
to authenticated
using (public.can_manage_ttgdtx_import())
with check (public.can_manage_ttgdtx_import());

create or replace view public.ttgdtx_tuition_import_batch_readiness
with (security_invoker = true)
as
select
  b.id as batch_id,
  b.batch_code,
  b.batch_name,
  b.admission_segment_id,
  s.segment_code,
  s.segment_name,
  b.source_kind,
  b.source_file_name,
  b.source_file_url,
  b.source_owner,
  b.workbook_modified_at,
  b.workbook_sheet_count,
  b.raw_student_row_count,
  b.raw_receipt_row_count,
  b.raw_partner_acceptance_row_count,
  b.raw_class_policy_row_count,
  b.expected_total_vnd,
  b.paid_total_vnd,
  b.uncollectible_total_vnd,
  b.balance_total_vnd,
  b.partner_payable_total_vnd,
  b.partner_paid_total_vnd,
  b.partner_balance_total_vnd,
  coalesce(c.check_count, 0)::int as check_count,
  coalesce(c.failed_count, 0)::int as failed_check_count,
  coalesce(c.warning_count, 0)::int as warning_check_count,
  coalesce(c.critical_count, 0)::int as critical_check_count,
  coalesce(r.staging_row_count, 0)::int as staging_row_count,
  b.issue_error_count,
  b.issue_warning_count,
  b.import_status,
  array_remove(array[
    case when coalesce(c.critical_count, 0) > 0 then 'CRITICAL_CHECK_FAILED' end,
    case when coalesce(c.failed_count, 0) > 0 then 'ERROR_CHECK_FAILED' end,
    case when coalesce(c.warning_count, 0) > 0 then 'HAS_WARNINGS' end,
    case when b.raw_student_row_count = 0 then 'NO_STUDENT_ROWS' end,
    case when b.raw_receipt_row_count = 0 then 'NO_RECEIPT_ROWS' end,
    case when b.partner_balance_total_vnd < 0 then 'NEGATIVE_PARTNER_BALANCE' end
  ], null) as control_flags,
  case
    when b.import_status = 'CANCELLED' then 'CANCELLED'
    when b.import_status = 'LOCKED' then 'LOCKED'
    when coalesce(c.critical_count, 0) > 0 then 'BLOCKED_CRITICAL'
    when coalesce(c.failed_count, 0) > 0 then 'NEEDS_FIX'
    when coalesce(c.warning_count, 0) > 0 then 'NEEDS_REVIEW'
    when coalesce(r.staging_row_count, 0) = 0 then 'EMPTY'
    else 'READY_TO_LOCK'
  end as readiness_status,
  (
    b.import_status <> 'CANCELLED'
    and coalesce(c.critical_count, 0) = 0
    and coalesce(c.failed_count, 0) = 0
    and coalesce(r.staging_row_count, 0) > 0
  ) as can_lock_batch,
  b.note,
  b.created_at,
  b.updated_at
from public.ttgdtx_tuition_import_batches b
join public.admission_segments s on s.id = b.admission_segment_id
left join lateral (
  select
    count(*) filter (where ch.record_status = 'ACTIVE') as check_count,
    count(*) filter (
      where ch.record_status = 'ACTIVE'
        and ch.check_status = 'FAIL'
    ) as failed_count,
    count(*) filter (
      where ch.record_status = 'ACTIVE'
        and ch.check_status = 'WARN'
    ) as warning_count,
    count(*) filter (
      where ch.record_status = 'ACTIVE'
        and ch.check_status = 'FAIL'
        and ch.severity = 'CRITICAL'
    ) as critical_count
  from public.ttgdtx_tuition_import_checks ch
  where ch.batch_id = b.id
) c on true
left join lateral (
  select count(*) as staging_row_count
  from public.ttgdtx_tuition_import_staging_rows r
  where r.batch_id = b.id
    and r.record_status = 'ACTIVE'
) r on true
where b.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_import(b.admission_segment_id);

grant select on public.ttgdtx_tuition_import_batch_readiness to authenticated;

create or replace view public.ttgdtx_tuition_import_staging_quality
with (security_invoker = true)
as
select
  b.id as batch_id,
  b.batch_code,
  r.source_sheet,
  r.row_type,
  count(*)::int as row_count,
  count(*) filter (where r.row_status = 'VALID')::int as valid_count,
  count(*) filter (where r.row_status = 'WARNING')::int as warning_count,
  count(*) filter (where r.row_status = 'ERROR')::int as error_count,
  coalesce(sum(r.expected_amount_vnd), 0)::numeric(16,2) as expected_total_vnd,
  coalesce(sum(r.paid_amount_vnd), 0)::numeric(16,2) as paid_total_vnd,
  coalesce(sum(r.balance_amount_vnd), 0)::numeric(16,2) as balance_total_vnd,
  array_agg(distinct issue_code) filter (where issue_code is not null) as issue_codes
from public.ttgdtx_tuition_import_batches b
join public.ttgdtx_tuition_import_staging_rows r on r.batch_id = b.id
left join lateral unnest(r.issue_codes) issue_code on true
where b.record_status = 'ACTIVE'
  and r.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_import(b.admission_segment_id)
group by b.id, b.batch_code, r.source_sheet, r.row_type;

grant select on public.ttgdtx_tuition_import_staging_quality to authenticated;

create or replace view public.ttgdtx_tuition_import_issue_register
with (security_invoker = true)
as
select
  ch.id as check_id,
  ch.batch_id,
  b.batch_code,
  ch.check_code,
  ch.check_name,
  ch.severity,
  ch.source_sheet,
  ch.expected_amount_vnd,
  ch.actual_amount_vnd,
  ch.diff_amount_vnd,
  ch.actual_count,
  ch.check_status,
  ch.check_message,
  ch.owner_department,
  ch.fix_hint,
  ch.updated_at
from public.ttgdtx_tuition_import_checks ch
join public.ttgdtx_tuition_import_batches b on b.id = ch.batch_id
where ch.record_status = 'ACTIVE'
  and b.record_status = 'ACTIVE'
  and ch.check_status in ('WARN', 'FAIL')
  and public.can_read_ttgdtx_import(b.admission_segment_id);

grant select on public.ttgdtx_tuition_import_issue_register to authenticated;

insert into public.ttgdtx_tuition_import_field_map (
  map_code,
  source_sheet_pattern,
  row_type,
  source_column_name,
  normalized_field,
  is_required,
  validation_rule,
  note
) values
  ('P2_06_FIELD_STUDENT_NAME', 'K*-Học viên- BC nợ học phí', 'STUDENT_RECEIVABLE', 'Họ tên học viên', 'student_name', true, 'Không được trống; dùng để đối chiếu lead/học sinh.', null),
  ('P2_06_FIELD_STUDENT_PHONE', 'K*-Học viên- BC nợ học phí', 'STUDENT_RECEIVABLE', 'Số điện thoại', 'student_phone', false, 'Chuẩn hóa 10 số nếu có.', null),
  ('P2_06_FIELD_CLASS_CODE', 'Danh sách lớp', 'CLASS_POLICY', 'Mã lớp', 'class_code', true, 'Không được trống khi tạo lớp/chính sách.', null),
  ('P2_06_FIELD_TUITION', 'Danh sách lớp', 'CLASS_POLICY', 'Học phí', 'expected_amount_vnd', true, 'Số tiền phải >= 0 và khớp P2-02.', null),
  ('P2_06_FIELD_PAID', 'Thu tiền học phí K*', 'PAYMENT_TRANSACTION', 'Số tiền thu', 'receipt_amount_vnd', true, 'Có tiền thu thì phải có ngày/chứng từ.', null),
  ('P2_06_FIELD_PAYMENT_DATE', 'Thu tiền học phí K*', 'PAYMENT_TRANSACTION', 'Ngày thu', 'receipt_date_text', true, 'Bắt buộc khi số tiền thu > 0.', null),
  ('P2_06_FIELD_CONTRACT_LINK', 'BIÊN BẢN NGHIỆM THU TRUNG TÂM', 'PARTNER_ACCEPTANCE', 'Link hợp đồng/biên bản', 'contract_link', true, 'Thiếu link thì không được duyệt đối soát chi TTGDTX.', null)
on conflict (map_code) do update set
  source_sheet_pattern = excluded.source_sheet_pattern,
  row_type = excluded.row_type,
  source_column_name = excluded.source_column_name,
  normalized_field = excluded.normalized_field,
  is_required = excluded.is_required,
  validation_rule = excluded.validation_rule,
  note = excluded.note,
  updated_at = now();

with segment as (
  select id
  from public.admission_segments
  where segment_code = 'TC9_TTGDTX_LINKED'
    and status = 'ACTIVE'
  limit 1
)
insert into public.ttgdtx_tuition_import_batches (
  batch_code,
  batch_name,
  admission_segment_id,
  source_kind,
  source_file_name,
  source_file_url,
  source_owner,
  workbook_modified_at,
  workbook_sheet_count,
  raw_student_row_count,
  raw_receipt_row_count,
  raw_partner_acceptance_row_count,
  raw_class_policy_row_count,
  expected_total_vnd,
  paid_total_vnd,
  uncollectible_total_vnd,
  balance_total_vnd,
  partner_payable_total_vnd,
  partner_paid_total_vnd,
  partner_balance_total_vnd,
  issue_error_count,
  issue_warning_count,
  import_status,
  note
)
select
  'P2-06-HP-TTGDTX-20260618-001',
  'P2-06 rà soát file thu học phí TTGDTX K22-K24',
  segment.id,
  'EXCEL',
  'BẢNG THEO DÕI CÔNG NỢ THU HỌC PHÍ.xlsx',
  'https://docs.google.com/spreadsheets/d/1tx1M3ihJ44ELcY4ijaZpCAg1_bqryRr1/edit?gid=1423132475#gid=1423132475',
  'Kế toán HEU',
  '2026-06-18 09:51:57+00'::timestamptz,
  10,
  2072,
  2072,
  8,
  37,
  76939360000,
  24066246424,
  5442721129,
  47430392447,
  258000000,
  111900000,
  146100000,
  11,
  22,
  'HAS_ISSUES',
  'Batch mẫu từ file thu học phí thực tế. Dùng để kiểm soát cấu trúc import trước khi đưa từng dòng vào công nợ/thanh toán chính.'
from segment
on conflict (batch_code) do update set
  batch_name = excluded.batch_name,
  source_file_url = excluded.source_file_url,
  source_owner = excluded.source_owner,
  workbook_modified_at = excluded.workbook_modified_at,
  workbook_sheet_count = excluded.workbook_sheet_count,
  raw_student_row_count = excluded.raw_student_row_count,
  raw_receipt_row_count = excluded.raw_receipt_row_count,
  raw_partner_acceptance_row_count = excluded.raw_partner_acceptance_row_count,
  raw_class_policy_row_count = excluded.raw_class_policy_row_count,
  expected_total_vnd = excluded.expected_total_vnd,
  paid_total_vnd = excluded.paid_total_vnd,
  uncollectible_total_vnd = excluded.uncollectible_total_vnd,
  balance_total_vnd = excluded.balance_total_vnd,
  partner_payable_total_vnd = excluded.partner_payable_total_vnd,
  partner_paid_total_vnd = excluded.partner_paid_total_vnd,
  partner_balance_total_vnd = excluded.partner_balance_total_vnd,
  issue_error_count = excluded.issue_error_count,
  issue_warning_count = excluded.issue_warning_count,
  import_status = excluded.import_status,
  note = excluded.note,
  updated_at = now();

with batch as (
  select id
  from public.ttgdtx_tuition_import_batches
  where batch_code = 'P2-06-HP-TTGDTX-20260618-001'
)
insert into public.ttgdtx_tuition_import_checks (
  batch_id,
  check_code,
  check_name,
  severity,
  source_sheet,
  expected_amount_vnd,
  actual_amount_vnd,
  diff_amount_vnd,
  actual_count,
  check_status,
  check_message,
  owner_department,
  fix_hint
)
select
  batch.id,
  v.check_code,
  v.check_name,
  v.severity,
  v.source_sheet,
  v.expected_amount_vnd,
  v.actual_amount_vnd,
  v.diff_amount_vnd,
  v.actual_count,
  v.check_status,
  v.check_message,
  v.owner_department,
  v.fix_hint
from batch
cross join lateral (
  values
    ('P2_06_K22_TOTAL', 'Tổng công nợ K22', 'INFO', 'K22-Học viên- BC nợ học phí', 15361100000::numeric, 15361100000::numeric, 0::numeric, 449, 'PASS', 'K22 đọc được 449 học viên, tổng phải thu 15.361.100.000đ.', 'KHTC', 'Dùng làm mốc đối soát, chưa ghi thẳng vào công nợ.'),
    ('P2_06_K23_TOTAL', 'Tổng công nợ K23', 'INFO', 'K23-Học viên- BC nợ học phí', 25052260000::numeric, 25052260000::numeric, 0::numeric, 710, 'PASS', 'K23 đọc được 710 học viên, tổng phải thu 25.052.260.000đ.', 'KHTC', 'Dùng làm mốc đối soát, chưa ghi thẳng vào công nợ.'),
    ('P2_06_K24_TOTAL', 'Tổng công nợ K24', 'INFO', 'K24-Học viên- BC nợ học phí', 36526000000::numeric, 36526000000::numeric, 0::numeric, 913, 'PASS', 'K24 đọc được 913 học viên, tổng phải thu 36.526.000.000đ.', 'KHTC', 'Dùng làm mốc đối soát, chưa ghi thẳng vào công nợ.'),
    ('P2_06_RECEIPT_DATE_MISSING', 'Phiếu thu thiếu ngày thu', 'WARNING', 'Thu tiền học phí K22', null::numeric, null::numeric, null::numeric, 4, 'WARN', 'Có 4 dòng thu tiền thiếu ngày thu. Chưa được xác nhận thu thật nếu thiếu ngày/chứng từ.', 'KHTC', 'Bổ sung ngày thu hoặc đánh dấu dòng không dùng.'),
    ('P2_06_NEGATIVE_STUDENT_BALANCE', 'Công nợ học viên âm', 'ERROR', 'K22/K24-Học viên- BC nợ học phí', null::numeric, null::numeric, null::numeric, 6, 'FAIL', 'Có 6 dòng công nợ âm. Đây là rủi ro thu thừa/nhập sai/hoàn tiền.', 'KHTC + AUDIT', 'Đối chiếu chứng từ thu, giảm trừ và hoàn tiền trước khi import dòng.'),
    ('P2_06_MISSING_DROPOUT_REASON', 'Thiếu lý do không thu/bỏ học', 'WARNING', 'K22/K23-Học viên- BC nợ học phí', null::numeric, null::numeric, null::numeric, 11, 'WARN', 'Có 11 dòng không thu được nhưng chưa đủ lý do. Cần rõ căn cứ để không tính sai công nợ và chi TTGDTX.', 'CTHSSV + KHTC', 'Bổ sung lý do bỏ học, bảo lưu, không đủ điều kiện hoặc quyết định liên quan.'),
    ('P2_06_MISSING_STUDENT_DOB', 'Thiếu ngày sinh học viên', 'WARNING', 'K24-Học viên- BC nợ học phí', null::numeric, null::numeric, null::numeric, 1, 'WARN', 'Có 1 học viên thiếu ngày sinh. Dữ liệu định danh chưa đủ sạch.', 'CTHSSV', 'Bổ sung ngày sinh trước khi khóa hồ sơ học viên.'),
    ('P2_06_PARTNER_ACCEPTANCE_LINK', 'Biên bản/hợp đồng trung tâm thiếu link', 'ERROR', 'BIÊN BẢN NGHIỆM THU TRUNG TÂM', null::numeric, null::numeric, null::numeric, 2, 'FAIL', 'Có 2 dòng nghiệm thu trung tâm thiếu link hợp đồng/biên bản. Không đủ căn cứ chi TTGDTX.', 'KHTC + PHAP_CHE', 'Gắn link hợp đồng, phụ lục hoặc biên bản nghiệm thu đã kiểm.'),
    ('P2_06_NEGATIVE_PARTNER_PAYABLE', 'Công nợ chi TTGDTX âm', 'ERROR', 'BIÊN BẢN NGHIỆM THU TRUNG TÂM', null::numeric, null::numeric, null::numeric, 1, 'FAIL', 'Có 1 dòng còn phải chi trung tâm bị âm. Đây là rủi ro chi vượt/đối soát sai.', 'KHTC + AUDIT', 'Kiểm tra lại số đã chi, số được nghiệm thu và khoản hoàn/điều chỉnh.'),
    ('P2_06_CLASS_POLICY_CLASS_CODE', 'Danh sách lớp thiếu mã lớp', 'ERROR', 'Danh sách lớp', null::numeric, null::numeric, null::numeric, 5, 'FAIL', 'Có 5 dòng chính sách/lớp thiếu mã lớp. Không thể map ổn định sang lớp và công nợ.', 'DAO_TAO + KHTC', 'Bổ sung mã lớp chuẩn trước khi import.'),
    ('P2_06_CLASS_POLICY_TUITION', 'Danh sách lớp thiếu học phí', 'ERROR', 'Danh sách lớp', null::numeric, null::numeric, null::numeric, 1, 'FAIL', 'Có 1 dòng thiếu học phí. Không được tạo P2-02 hoặc P2-03 từ dòng này.', 'KHTC', 'Bổ sung mức học phí hoặc đánh dấu không áp dụng.'),
    ('P2_06_FORMULA_REF', 'Công thức Excel lỗi #REF!', 'CRITICAL', 'In-Chi', null::numeric, null::numeric, null::numeric, 1, 'FAIL', 'Ô In-Chi!A3 đang lỗi #REF!. Không được dùng file làm căn cứ chi trả khi còn lỗi công thức.', 'IT_DATA + KHTC', 'Sửa công thức trước khi khóa batch hoặc xuất chứng từ.'),
    ('P2_06_PARTNER_PAYABLE_TOTAL', 'Tổng nghiệm thu/chi trung tâm', 'INFO', 'BIÊN BẢN NGHIỆM THU TRUNG TÂM', 258000000::numeric, 111900000::numeric, 146100000::numeric, 8, 'PASS', 'Đọc được 8 dòng nghiệm thu: phải chi 258.000.000đ, đã chi 111.900.000đ, còn 146.100.000đ.', 'KHTC', 'Chỉ là tổng đọc file, chưa phải lệnh chi.'),
    ('P2_06_NO_DIRECT_CORE_WRITE', 'Không ghi thẳng vào công nợ lõi', 'INFO', null, null::numeric, null::numeric, null::numeric, null::int, 'PASS', 'P2-06 chỉ tạo staging và checklist. Công nợ thật vẫn qua P2-03.', 'IT_DATA', 'Giữ nguyên nguyên tắc này khi tự động hóa import.')
) as v(
  check_code,
  check_name,
  severity,
  source_sheet,
  expected_amount_vnd,
  actual_amount_vnd,
  diff_amount_vnd,
  actual_count,
  check_status,
  check_message,
  owner_department,
  fix_hint
)
on conflict (batch_id, check_code) do update set
  check_name = excluded.check_name,
  severity = excluded.severity,
  source_sheet = excluded.source_sheet,
  expected_amount_vnd = excluded.expected_amount_vnd,
  actual_amount_vnd = excluded.actual_amount_vnd,
  diff_amount_vnd = excluded.diff_amount_vnd,
  actual_count = excluded.actual_count,
  check_status = excluded.check_status,
  check_message = excluded.check_message,
  owner_department = excluded.owner_department,
  fix_hint = excluded.fix_hint,
  updated_at = now();

with batch as (
  select id
  from public.ttgdtx_tuition_import_batches
  where batch_code = 'P2-06-HP-TTGDTX-20260618-001'
)
insert into public.ttgdtx_tuition_import_staging_rows (
  batch_id,
  row_code,
  source_sheet,
  row_type,
  cohort_code,
  expected_amount_vnd,
  paid_amount_vnd,
  uncollectible_amount_vnd,
  balance_amount_vnd,
  partner_payable_amount_vnd,
  partner_paid_amount_vnd,
  partner_balance_amount_vnd,
  row_status,
  issue_codes,
  issue_message,
  raw_payload
)
select
  batch.id,
  v.row_code,
  v.source_sheet,
  v.row_type,
  v.cohort_code,
  v.expected_amount_vnd,
  v.paid_amount_vnd,
  v.uncollectible_amount_vnd,
  v.balance_amount_vnd,
  v.partner_payable_amount_vnd,
  v.partner_paid_amount_vnd,
  v.partner_balance_amount_vnd,
  v.row_status,
  v.issue_codes,
  v.issue_message,
  v.raw_payload
from batch
cross join lateral (
  values
    ('P2-06-K22-SUMMARY', 'K22-Học viên- BC nợ học phí', 'BATCH_SUMMARY', 'K22', 15361100000::numeric, 11017971724::numeric, 1536292399::numeric, 2806835877::numeric, 0::numeric, 0::numeric, 0::numeric, 'WARNING', array['NEGATIVE_STUDENT_BALANCE','MISSING_DROPOUT_REASON']::text[], 'K22 có công nợ âm và thiếu lý do không thu ở một số dòng.', '{"student_rows":449}'::jsonb),
    ('P2-06-K23-SUMMARY', 'K23-Học viên- BC nợ học phí', 'BATCH_SUMMARY', 'K23', 25052260000::numeric, 11132556700::numeric, 2777228730::numeric, 11142474570::numeric, 0::numeric, 0::numeric, 0::numeric, 'WARNING', array['MISSING_DROPOUT_REASON']::text[], 'K23 có 5 dòng thiếu lý do không thu/bỏ học.', '{"student_rows":710}'::jsonb),
    ('P2-06-K24-SUMMARY', 'K24-Học viên- BC nợ học phí', 'BATCH_SUMMARY', 'K24', 36526000000::numeric, 1915718000::numeric, 1129200000::numeric, 33481082000::numeric, 0::numeric, 0::numeric, 0::numeric, 'WARNING', array['NEGATIVE_STUDENT_BALANCE','MISSING_STUDENT_DOB']::text[], 'K24 có công nợ âm và 1 học viên thiếu ngày sinh.', '{"student_rows":913}'::jsonb),
    ('P2-06-PARTNER-ACCEPTANCE-SUMMARY', 'BIÊN BẢN NGHIỆM THU TRUNG TÂM', 'PARTNER_ACCEPTANCE', null, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 258000000::numeric, 111900000::numeric, 146100000::numeric, 'ERROR', array['MISSING_CONTRACT_LINK','NEGATIVE_PARTNER_PAYABLE']::text[], 'Cần sửa link hợp đồng/biên bản và dòng còn phải chi âm trước khi duyệt chi.', '{"acceptance_rows":8}'::jsonb),
    ('P2-06-CLASS-POLICY-SUMMARY', 'Danh sách lớp', 'CLASS_POLICY', null, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 'ERROR', array['MISSING_CLASS_CODE','MISSING_TUITION']::text[], 'Danh sách lớp còn thiếu mã lớp và học phí.', '{"class_policy_rows":37}'::jsonb),
    ('P2-06-FORMULA-REF-SAMPLE', 'In-Chi', 'ISSUE_SAMPLE', null, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 'ERROR', array['FORMULA_REF']::text[], 'Ô In-Chi!A3 có công thức lỗi #REF!.', '{"cell":"In-Chi!A3","formula":"=''Danh sách lớp ''!#REF!"}'::jsonb)
) as v(
  row_code,
  source_sheet,
  row_type,
  cohort_code,
  expected_amount_vnd,
  paid_amount_vnd,
  uncollectible_amount_vnd,
  balance_amount_vnd,
  partner_payable_amount_vnd,
  partner_paid_amount_vnd,
  partner_balance_amount_vnd,
  row_status,
  issue_codes,
  issue_message,
  raw_payload
)
on conflict (row_code) do update set
  source_sheet = excluded.source_sheet,
  row_type = excluded.row_type,
  cohort_code = excluded.cohort_code,
  expected_amount_vnd = excluded.expected_amount_vnd,
  paid_amount_vnd = excluded.paid_amount_vnd,
  uncollectible_amount_vnd = excluded.uncollectible_amount_vnd,
  balance_amount_vnd = excluded.balance_amount_vnd,
  partner_payable_amount_vnd = excluded.partner_payable_amount_vnd,
  partner_paid_amount_vnd = excluded.partner_paid_amount_vnd,
  partner_balance_amount_vnd = excluded.partner_balance_amount_vnd,
  row_status = excluded.row_status,
  issue_codes = excluded.issue_codes,
  issue_message = excluded.issue_message,
  raw_payload = excluded.raw_payload,
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
  'TTGDTX_TUITION_IMPORT_CONTROL',
  'P2-06 Import/đối soát file học phí TTGDTX',
  'FINANCE',
  'KHTC + IT_DATA + AUDIT',
  '/ttgdtx/import',
  true,
  'P2-06 nhận file thu học phí/công nợ vào staging, kiểm lỗi công thức, tổng tiền, chứng từ và dữ liệu thiếu trước khi dùng cho P2-03 hoặc thanh toán.',
  68,
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
  'WF_P2_06_TTGDTX_TUITION_IMPORT_CONTROL',
  'P2-06 Import/đối soát file học phí TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Khi KHTC nhận file thu học phí/công nợ TTGDTX từ Excel hoặc Google Sheet.',
  'KHTC/IT_DATA',
  'KHTC + IT_DATA + AUDIT',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/KE_TOAN_TRUONG',
  'Batch staging có checklist lỗi, tổng phải thu/đã thu/còn nợ và tình trạng có được khóa hay không.',
  'Chỉ batch không còn lỗi CRITICAL/ERROR mới được khóa để chuyển sang công nợ/thanh toán.',
  'Log mọi thay đổi batch, dòng staging, kết quả kiểm lỗi và trạng thái khóa.',
  2060,
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
) values
  (
    'P2_06_TTGDTX_TUITION_IMPORT_STAGING',
    'P2-06 staging file thu học phí TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'ttgdtx_tuition_import_batches; ttgdtx_tuition_import_staging_rows; ttgdtx_tuition_import_checks',
    'TRANSACTION',
    'KHTC + IT_DATA',
    'SUPABASE',
    'CONFIDENTIAL',
    true,
    'Không ghi thẳng vào công nợ/thanh toán; batch phải qua kiểm lỗi và duyệt khóa.',
    'DAT_TAM_THOI'
  ),
  (
    'P2_06_TTGDTX_TUITION_IMPORT_READINESS',
    'P2-06 view kiểm lỗi import học phí TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'ttgdtx_tuition_import_batch_readiness; ttgdtx_tuition_import_issue_register; ttgdtx_tuition_import_staging_quality',
    'REPORT_VIEW',
    'KHTC + IT_DATA + AUDIT',
    'SUPABASE',
    'CONFIDENTIAL',
    true,
    'View chỉ dùng để kiểm soát file và chỉ lỗi; không xác nhận đã thu hoặc đã chi.',
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
  'OWN_P2_06_TTGDTX_TUITION_IMPORT_CONTROL',
  'P2-06 Import/đối soát file học phí TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_06_TTGDTX_TUITION_IMPORT_CONTROL',
  'TTGDTX_TUITION_IMPORT_BATCH',
  'ttgdtx_tuition_import_batches',
  'KHTC + IT_DATA + AUDIT',
  'KHTC/IT_DATA',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/KE_TOAN_TRUONG',
  'ROLE_AND_SCOPE',
  'KHTC',
  'KHTC + AUDIT + BGH',
  'File nguồn, ngày chốt file, checklist lỗi, tổng tiền đọc được, link chứng từ hoặc biên bản nếu có.',
  'Mọi batch/dòng staging/check đều ghi audit log; không dùng file còn lỗi CRITICAL/ERROR làm căn cứ chi trả.',
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
  'GATE_P2_06_TTGDTX_TUITION_IMPORT_CONTROL',
  'Gate P2-06: khóa batch import học phí TTGDTX',
  'DATA',
  'TTGDTX_TUITION_IMPORT_BATCH',
  'P2-06-HP-TTGDTX-20260618-001',
  'KHTC + IT_DATA + AUDIT',
  'Kiểm tra file nguồn, lỗi công thức, tổng tiền, chứng từ thu, nghiệm thu trung tâm, công nợ âm và dữ liệu thiếu.',
  'Chỉ khóa batch khi không còn lỗi CRITICAL/ERROR; không dùng gate này để xác nhận đã thu tiền hoặc đã chi TTGDTX.',
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
