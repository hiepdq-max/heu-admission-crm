-- P1-09: Short Course Payment Foundation
-- Run after step72_short_course_finance_foundation.sql.
-- Purpose:
-- - Record short-course payments against issued/locked invoices.
-- - Require accounting evidence and prevent duplicate/over payments.
-- - Verify/reject/reverse payments through controlled functions.
-- - Refresh invoice paid/balance status after every approved payment action.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('short_course.payment.read'),
    ('short_course.payment.create'),
    ('short_course.payment.update'),
    ('short_course.payment.verify'),
    ('short_course.payment.reject'),
    ('short_course.payment.reverse'),
    ('short_course.payment.manage')
) as p(permission)
where r.code in (
  'ADMIN',
  'BGH',
  'KHTC',
  'ACCOUNTING',
  'ACCOUNTING_LEAD'
)
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('short_course.payment.read')
) as p(permission)
where r.code in (
  'AUDIT',
  'IT_DATA',
  'CTHSSV',
  'CTHSSV_LEAD',
  'DAO_TAO',
  'DAO_TAO_LEAD',
  'ADMISSION_HEAD',
  'TEAM_LEAD'
)
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
    'short_course.payment.read',
    'SHORT_COURSE',
    'Xem thanh toán ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC',
    'CRITICAL',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    true,
    'Chỉ xem thanh toán trong phạm vi đối tượng tuyển sinh/lớp được phân.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.payment.create',
    'SHORT_COURSE',
    'Ghi nhận thanh toán ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC',
    'CRITICAL',
    'ROLE_AND_SCOPE',
    true,
    false,
    false,
    true,
    'Chỉ ghi nhận thanh toán cho invoice đã phát hành/khóa, còn số phải thu và có chứng từ.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.payment.update',
    'SHORT_COURSE',
    'Sửa thanh toán chờ xác nhận',
    'M11_SHORT_COURSE_ERP',
    'KHTC',
    'CRITICAL',
    'ROLE_AND_SCOPE',
    true,
    true,
    false,
    true,
    'Chỉ sửa payment PENDING chưa khóa; payment VERIFIED/REVERSED không sửa trực tiếp.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.payment.verify',
    'SHORT_COURSE',
    'Xác nhận thanh toán ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC + ACCOUNTING',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    true,
    'Xác nhận thanh toán sau khi đối chiếu chứng từ kế toán/ngân hàng.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.payment.reject',
    'SHORT_COURSE',
    'Từ chối thanh toán ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC + ACCOUNTING',
    'HIGH',
    'APPROVAL',
    true,
    true,
    false,
    true,
    'Từ chối payment phải có lý do để kế toán/audit truy vết.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.payment.reverse',
    'SHORT_COURSE',
    'Đảo/hủy xác nhận thanh toán ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC + ACCOUNTING_LEAD',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    true,
    'Đảo thanh toán VERIFIED là nghiệp vụ rủi ro cao, phải có lý do và log đầy đủ.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.payment.manage',
    'SHORT_COURSE',
    'Quản trị thanh toán ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC + BGH',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    true,
    'Quyền tổng hợp để quản trị payment ngắn hạn theo phạm vi được phân.',
    'DAT_TAM_THOI'
  )
on conflict (permission_code) do update
set permission_group = excluded.permission_group,
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

create or replace function public.can_read_short_course_erp()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('short_course.read')
    or public.has_permission('short_course.manage')
    or public.has_permission('short_course.student.read')
    or public.has_permission('short_course.student.manage')
    or public.has_permission('short_course.student.update')
    or public.has_permission('short_course.student.verify')
    or public.has_permission('short_course.student.lock')
    or public.has_permission('short_course.class.read')
    or public.has_permission('short_course.class.manage')
    or public.has_permission('short_course.class.create')
    or public.has_permission('short_course.class.update')
    or public.has_permission('short_course.class.open')
    or public.has_permission('short_course.class.lock')
    or public.has_permission('short_course.enrollment.read')
    or public.has_permission('short_course.enrollment.assign')
    or public.has_permission('short_course.enrollment.update')
    or public.has_permission('short_course.enrollment.cancel')
    or public.has_permission('short_course.attendance.read')
    or public.has_permission('short_course.attendance.create')
    or public.has_permission('short_course.attendance.update')
    or public.has_permission('short_course.attendance.lock')
    or public.has_permission('short_course.attendance.approve')
    or public.has_permission('short_course.attendance.manage')
    or public.has_permission('short_course.bhxh.read')
    or public.has_permission('short_course.bhxh.create')
    or public.has_permission('short_course.bhxh.check')
    or public.has_permission('short_course.bhxh.submit')
    or public.has_permission('short_course.bhxh.approve')
    or public.has_permission('short_course.bhxh.reject')
    or public.has_permission('short_course.finance.read')
    or public.has_permission('short_course.finance.create')
    or public.has_permission('short_course.finance.update')
    or public.has_permission('short_course.finance.issue')
    or public.has_permission('short_course.finance.lock')
    or public.has_permission('short_course.finance.cancel')
    or public.has_permission('short_course.finance.manage')
    or public.has_permission('short_course.payment.read')
    or public.has_permission('short_course.payment.create')
    or public.has_permission('short_course.payment.update')
    or public.has_permission('short_course.payment.verify')
    or public.has_permission('short_course.payment.reject')
    or public.has_permission('short_course.payment.reverse')
    or public.has_permission('short_course.payment.manage')
$$;

create or replace function public.can_manage_short_course_erp()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('short_course.manage')
    or public.has_permission('short_course.student.manage')
    or public.has_permission('short_course.student.update')
    or public.has_permission('short_course.student.verify')
    or public.has_permission('short_course.student.lock')
    or public.has_permission('short_course.class.manage')
    or public.has_permission('short_course.class.create')
    or public.has_permission('short_course.class.update')
    or public.has_permission('short_course.class.open')
    or public.has_permission('short_course.class.lock')
    or public.has_permission('short_course.enrollment.assign')
    or public.has_permission('short_course.enrollment.update')
    or public.has_permission('short_course.enrollment.cancel')
    or public.has_permission('short_course.attendance.create')
    or public.has_permission('short_course.attendance.update')
    or public.has_permission('short_course.attendance.lock')
    or public.has_permission('short_course.attendance.approve')
    or public.has_permission('short_course.attendance.manage')
    or public.has_permission('short_course.bhxh.create')
    or public.has_permission('short_course.bhxh.check')
    or public.has_permission('short_course.bhxh.submit')
    or public.has_permission('short_course.bhxh.approve')
    or public.has_permission('short_course.bhxh.reject')
    or public.has_permission('short_course.finance.create')
    or public.has_permission('short_course.finance.update')
    or public.has_permission('short_course.finance.issue')
    or public.has_permission('short_course.finance.lock')
    or public.has_permission('short_course.finance.cancel')
    or public.has_permission('short_course.finance.manage')
    or public.has_permission('short_course.payment.create')
    or public.has_permission('short_course.payment.update')
    or public.has_permission('short_course.payment.verify')
    or public.has_permission('short_course.payment.reject')
    or public.has_permission('short_course.payment.reverse')
    or public.has_permission('short_course.payment.manage')
$$;

create or replace function public.can_read_short_finance()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('short_course.finance.read')
    or public.has_permission('short_course.finance.create')
    or public.has_permission('short_course.finance.update')
    or public.has_permission('short_course.finance.issue')
    or public.has_permission('short_course.finance.lock')
    or public.has_permission('short_course.finance.cancel')
    or public.has_permission('short_course.finance.manage')
    or public.has_permission('short_course.payment.read')
    or public.has_permission('short_course.payment.create')
    or public.has_permission('short_course.payment.update')
    or public.has_permission('short_course.payment.verify')
    or public.has_permission('short_course.payment.reject')
    or public.has_permission('short_course.payment.reverse')
    or public.has_permission('short_course.payment.manage')
$$;

create or replace function public.can_manage_short_finance()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('short_course.finance.create')
    or public.has_permission('short_course.finance.update')
    or public.has_permission('short_course.finance.issue')
    or public.has_permission('short_course.finance.lock')
    or public.has_permission('short_course.finance.cancel')
    or public.has_permission('short_course.finance.manage')
    or public.has_permission('short_course.payment.create')
    or public.has_permission('short_course.payment.update')
    or public.has_permission('short_course.payment.verify')
    or public.has_permission('short_course.payment.reject')
    or public.has_permission('short_course.payment.reverse')
    or public.has_permission('short_course.payment.manage')
$$;

create or replace function public.can_read_short_payment()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('short_course.payment.read')
    or public.has_permission('short_course.payment.create')
    or public.has_permission('short_course.payment.update')
    or public.has_permission('short_course.payment.verify')
    or public.has_permission('short_course.payment.reject')
    or public.has_permission('short_course.payment.reverse')
    or public.has_permission('short_course.payment.manage')
    or public.has_permission('short_course.finance.manage')
$$;

create or replace function public.can_manage_short_payment()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('short_course.payment.create')
    or public.has_permission('short_course.payment.update')
    or public.has_permission('short_course.payment.verify')
    or public.has_permission('short_course.payment.reject')
    or public.has_permission('short_course.payment.reverse')
    or public.has_permission('short_course.payment.manage')
$$;

grant execute on function public.can_read_short_course_erp() to authenticated;
grant execute on function public.can_manage_short_course_erp() to authenticated;
grant execute on function public.can_read_short_finance() to authenticated;
grant execute on function public.can_manage_short_finance() to authenticated;
grant execute on function public.can_read_short_payment() to authenticated;
grant execute on function public.can_manage_short_payment() to authenticated;

create sequence if not exists public.short_payment_code_seq;

create or replace function public.next_short_payment_code()
returns text
language sql
security definer
set search_path = public
as $$
  select 'PAY-' ||
    to_char(current_date, 'YYYY') ||
    '-' ||
    lpad(nextval('public.short_payment_code_seq')::text, 6, '0')
$$;

grant execute on function public.next_short_payment_code() to authenticated;

alter table public.short_payments
  add column if not exists receipt_no text,
  add column if not exists evidence_url text,
  add column if not exists reconcile_status text not null default 'NOT_RECONCILED',
  add column if not exists reconciled_by uuid references public.users_profile(id),
  add column if not exists reconciled_at timestamptz,
  add column if not exists rejected_by uuid references public.users_profile(id),
  add column if not exists rejected_at timestamptz,
  add column if not exists reject_reason text,
  add column if not exists reversed_by uuid references public.users_profile(id),
  add column if not exists reversed_at timestamptz,
  add column if not exists reverse_reason text,
  add column if not exists payment_locked boolean not null default false,
  add column if not exists payment_source text not null default 'MANUAL',
  add column if not exists payment_version int not null default 1,
  add column if not exists accounting_note text,
  add column if not exists verified_note text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_payment_reconcile_status_valid'
      and conrelid = 'public.short_payments'::regclass
  ) then
    alter table public.short_payments
      add constraint short_payment_reconcile_status_valid
      check (reconcile_status in ('NOT_RECONCILED', 'MATCHED', 'MISMATCH', 'MANUAL_CHECK'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_payment_source_valid'
      and conrelid = 'public.short_payments'::regclass
  ) then
    alter table public.short_payments
      add constraint short_payment_source_valid
      check (payment_source in ('MANUAL', 'IMPORT', 'BANK_STATEMENT', 'ADJUSTMENT'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_payment_version_positive'
      and conrelid = 'public.short_payments'::regclass
  ) then
    alter table public.short_payments
      add constraint short_payment_version_positive
      check (payment_version > 0);
  end if;
end;
$$;

update public.short_payments
set payment_locked = case
      when payment_status in ('VERIFIED', 'REJECTED', 'REVERSED') then true
      else coalesce(payment_locked, false)
    end,
    reconcile_status = case
      when payment_status = 'VERIFIED' then 'MATCHED'
      when payment_status in ('REJECTED', 'REVERSED') then 'MISMATCH'
      else coalesce(reconcile_status, 'NOT_RECONCILED')
    end,
    payment_source = coalesce(payment_source, 'MANUAL'),
    payment_version = greatest(coalesce(payment_version, 1), 1)
where record_status = 'ACTIVE'::public.record_status;

create unique index if not exists uq_short_payments_active_bank_ref
on public.short_payments(lower(bank_ref))
where nullif(trim(bank_ref), '') is not null
  and record_status = 'ACTIVE'::public.record_status
  and payment_status in ('PENDING', 'VERIFIED');

create unique index if not exists uq_short_payments_active_voucher_no
on public.short_payments(lower(voucher_no))
where nullif(trim(voucher_no), '') is not null
  and record_status = 'ACTIVE'::public.record_status
  and payment_status in ('PENDING', 'VERIFIED');

create index if not exists idx_short_payments_status_date
on public.short_payments(payment_status, payment_date);

create index if not exists idx_short_payments_reconcile_status
on public.short_payments(reconcile_status, payment_status);

create or replace view public.short_payment_readiness
with (security_invoker = true)
as
with base as (
  select
    p.id as payment_id,
    p.payment_code,
    p.invoice_id,
    i.invoice_code,
    p.enrollment_id,
    e.enrollment_code,
    p.student_id,
    s.student_code,
    s.student_name,
    i.class_id,
    c.class_code,
    c.class_name,
    i.offering_id,
    o.offering_code,
    o.offering_name,
    e.admission_segment_id,
    seg.segment_code,
    seg.segment_name,
    i.invoice_type,
    i.invoice_status,
    i.payable_amount_vnd,
    i.paid_amount_vnd,
    i.balance_amount_vnd,
    i.issued_at,
    i.invoice_locked,
    ir.readiness_status as invoice_readiness_status,
    ir.control_flags as invoice_control_flags,
    p.payment_amount_vnd,
    p.payment_date,
    p.payment_method,
    p.voucher_no,
    p.receipt_no,
    p.bank_ref,
    p.payer_name,
    p.evidence_url,
    p.payment_status,
    p.reconcile_status,
    p.verified_by,
    p.verified_at,
    p.verified_note,
    p.rejected_by,
    p.rejected_at,
    p.reject_reason,
    p.reversed_by,
    p.reversed_at,
    p.reverse_reason,
    p.payment_locked,
    p.payment_source,
    p.payment_version,
    p.note,
    p.accounting_note,
    p.record_status,
    p.created_at,
    p.updated_at,
    coalesce(payment_stats.verified_other_total, 0)::numeric(14,2) as verified_other_total,
    coalesce(payment_stats.pending_other_total, 0)::numeric(14,2) as pending_other_total,
    greatest(i.payable_amount_vnd - coalesce(payment_stats.verified_other_total, 0), 0)::numeric(14,2) as available_before_payment_vnd,
    coalesce(duplicate_stats.bank_ref_duplicate_count, 0)::int as bank_ref_duplicate_count,
    coalesce(duplicate_stats.voucher_no_duplicate_count, 0)::int as voucher_no_duplicate_count
  from public.short_payments p
  join public.short_finance_invoices i on i.id = p.invoice_id
  join public.short_enrollments e on e.id = p.enrollment_id
  join public.short_student_master s on s.id = p.student_id
  left join public.short_class_master c on c.id = i.class_id
  join public.admission_offering_catalog o on o.id = i.offering_id
  join public.admission_segments seg on seg.id = e.admission_segment_id
  left join public.short_finance_invoice_readiness ir on ir.invoice_id = i.id
  left join lateral (
    select
      coalesce(sum(x.payment_amount_vnd) filter (where x.payment_status = 'VERIFIED'), 0) as verified_other_total,
      coalesce(sum(x.payment_amount_vnd) filter (where x.payment_status = 'PENDING'), 0) as pending_other_total
    from public.short_payments x
    where x.invoice_id = p.invoice_id
      and x.id <> p.id
      and x.record_status = 'ACTIVE'::public.record_status
  ) payment_stats on true
  left join lateral (
    select
      count(*) filter (
        where nullif(trim(coalesce(p.bank_ref, '')), '') is not null
          and nullif(trim(coalesce(x.bank_ref, '')), '') is not null
          and lower(trim(x.bank_ref)) = lower(trim(p.bank_ref))
          and x.payment_status in ('PENDING', 'VERIFIED')
      ) as bank_ref_duplicate_count,
      count(*) filter (
        where nullif(trim(coalesce(p.voucher_no, '')), '') is not null
          and nullif(trim(coalesce(x.voucher_no, '')), '') is not null
          and lower(trim(x.voucher_no)) = lower(trim(p.voucher_no))
          and x.payment_status in ('PENDING', 'VERIFIED')
      ) as voucher_no_duplicate_count
    from public.short_payments x
    where x.id <> p.id
      and x.record_status = 'ACTIVE'::public.record_status
  ) duplicate_stats on true
  where p.record_status = 'ACTIVE'::public.record_status
),
evaluated as (
  select
    b.*,
    array_remove(array[
      case when b.record_status <> 'ACTIVE'::public.record_status then 'ARCHIVED_PAYMENT' end,
      case when b.payment_amount_vnd <= 0 then 'INVALID_AMOUNT' end,
      case when b.payment_date > current_date then 'PAYMENT_DATE_IN_FUTURE' end,
      case when b.issued_at is not null and b.payment_date < b.issued_at::date then 'PAYMENT_BEFORE_INVOICE_ISSUED' end,
      case when b.payment_status = 'PENDING' and b.invoice_status not in ('ISSUED', 'LOCKED', 'PARTIAL_PAID') then 'INVOICE_NOT_COLLECTIBLE' end,
      case when b.payment_status in ('PENDING', 'VERIFIED') and b.invoice_status in ('CANCELLED', 'REFUNDED') then 'INVOICE_CANCELLED_OR_REFUNDED' end,
      case when b.payment_status in ('PENDING', 'VERIFIED') and b.payment_amount_vnd > b.available_before_payment_vnd then 'AMOUNT_EXCEEDS_OPEN_BALANCE' end,
      case when b.payment_status in ('PENDING', 'VERIFIED') and b.pending_other_total + b.payment_amount_vnd > b.available_before_payment_vnd and b.payment_status = 'PENDING' then 'PENDING_TOTAL_EXCEEDS_OPEN_BALANCE' end,
      case when b.payment_method in ('BANK_TRANSFER', 'POS') and nullif(trim(coalesce(b.bank_ref, '')), '') is null and nullif(trim(coalesce(b.evidence_url, '')), '') is null then 'NO_BANK_EVIDENCE' end,
      case when b.payment_method = 'CASH' and nullif(trim(coalesce(b.voucher_no, '')), '') is null then 'NO_CASH_VOUCHER' end,
      case when b.payment_method in ('OFFSET', 'OTHER') and nullif(trim(coalesce(b.voucher_no, '')), '') is null and nullif(trim(coalesce(b.evidence_url, '')), '') is null then 'NO_PAYMENT_EVIDENCE' end,
      case when b.payment_method = 'REFUND' then 'REFUND_NOT_ALLOWED_IN_COLLECTION' end,
      case when b.bank_ref_duplicate_count > 0 then 'DUPLICATE_BANK_REF' end,
      case when b.voucher_no_duplicate_count > 0 then 'DUPLICATE_VOUCHER_NO' end,
      case when b.payment_status = 'VERIFIED' and (b.verified_by is null or b.verified_at is null) then 'VERIFIED_WITHOUT_VERIFIER' end,
      case when b.payment_status = 'REJECTED' and nullif(trim(coalesce(b.reject_reason, '')), '') is null then 'REJECTED_WITHOUT_REASON' end,
      case when b.payment_status = 'REVERSED' and nullif(trim(coalesce(b.reverse_reason, '')), '') is null then 'REVERSED_WITHOUT_REASON' end
    ]::text[], null) as control_flags
  from base b
)
select
  e.*,
  case
    when e.record_status <> 'ACTIVE'::public.record_status then 'ARCHIVED'
    when e.payment_status = 'REVERSED' then 'REVERSED'
    when e.payment_status = 'REJECTED' then 'REJECTED'
    when e.control_flags && array[
      'INVALID_AMOUNT',
      'PAYMENT_DATE_IN_FUTURE',
      'PAYMENT_BEFORE_INVOICE_ISSUED',
      'INVOICE_NOT_COLLECTIBLE',
      'INVOICE_CANCELLED_OR_REFUNDED',
      'AMOUNT_EXCEEDS_OPEN_BALANCE',
      'PENDING_TOTAL_EXCEEDS_OPEN_BALANCE',
      'NO_BANK_EVIDENCE',
      'NO_CASH_VOUCHER',
      'NO_PAYMENT_EVIDENCE',
      'REFUND_NOT_ALLOWED_IN_COLLECTION',
      'DUPLICATE_BANK_REF',
      'DUPLICATE_VOUCHER_NO',
      'VERIFIED_WITHOUT_VERIFIER',
      'REJECTED_WITHOUT_REASON',
      'REVERSED_WITHOUT_REASON'
    ]::text[] then 'BLOCKED'
    when e.payment_status = 'VERIFIED' then 'VERIFIED'
    when e.payment_status = 'PENDING' then 'READY_TO_VERIFY'
    else 'NEEDS_FIX'
  end as readiness_status
from evaluated e;

grant select on public.short_payment_readiness to authenticated;

create or replace function public.create_short_payment(
  target_invoice_id uuid,
  p_payment_amount_vnd numeric,
  p_payment_date date default current_date,
  p_payment_method text default 'BANK_TRANSFER',
  p_voucher_no text default null,
  p_bank_ref text default null,
  p_payer_name text default null,
  p_evidence_url text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice public.short_finance_invoices%rowtype;
  v_amount numeric(14,2);
  v_method text;
  v_pending_other numeric(14,2);
  v_payment_id uuid;
begin
  if not (
    public.can_manage_short_payment()
    or public.has_permission('short_course.payment.create')
  ) then
    raise exception 'Bạn chưa có quyền ghi nhận thanh toán ngắn hạn.';
  end if;

  v_amount := coalesce(p_payment_amount_vnd, 0);
  v_method := coalesce(nullif(trim(coalesce(p_payment_method, '')), ''), 'BANK_TRANSFER');

  if v_amount <= 0 then
    raise exception 'Số tiền thanh toán phải lớn hơn 0.';
  end if;

  if v_method not in ('CASH', 'BANK_TRANSFER', 'POS', 'OFFSET', 'OTHER') then
    raise exception 'Phương thức thanh toán không hợp lệ cho bước thu tiền.';
  end if;

  if p_payment_date is null or p_payment_date > current_date then
    raise exception 'Ngày thanh toán không được trống hoặc lớn hơn ngày hiện tại.';
  end if;

  if v_method in ('BANK_TRANSFER', 'POS')
     and nullif(trim(coalesce(p_bank_ref, '')), '') is null
     and nullif(trim(coalesce(p_evidence_url, '')), '') is null then
    raise exception 'Chuyển khoản/POS cần mã giao dịch ngân hàng hoặc link minh chứng.';
  end if;

  if v_method = 'CASH'
     and nullif(trim(coalesce(p_voucher_no, '')), '') is null then
    raise exception 'Thu tiền mặt cần số phiếu thu/chứng từ kế toán.';
  end if;

  if v_method in ('OFFSET', 'OTHER')
     and nullif(trim(coalesce(p_voucher_no, '')), '') is null
     and nullif(trim(coalesce(p_evidence_url, '')), '') is null then
    raise exception 'Thanh toán bù trừ/khác cần chứng từ hoặc link minh chứng.';
  end if;

  if nullif(trim(coalesce(p_bank_ref, '')), '') is not null
     and exists (
       select 1
       from public.short_payments p
       where lower(trim(p.bank_ref)) = lower(trim(p_bank_ref))
         and p.payment_status in ('PENDING', 'VERIFIED')
         and p.record_status = 'ACTIVE'::public.record_status
     ) then
    raise exception 'Mã giao dịch ngân hàng đã tồn tại, không ghi nhận thanh toán trùng.';
  end if;

  if nullif(trim(coalesce(p_voucher_no, '')), '') is not null
     and exists (
       select 1
       from public.short_payments p
       where lower(trim(p.voucher_no)) = lower(trim(p_voucher_no))
         and p.payment_status in ('PENDING', 'VERIFIED')
         and p.record_status = 'ACTIVE'::public.record_status
     ) then
    raise exception 'Số chứng từ đã tồn tại, không ghi nhận thanh toán trùng.';
  end if;

  perform public.refresh_short_finance_invoice_status(target_invoice_id);

  select *
  into v_invoice
  from public.short_finance_invoices
  where id = target_invoice_id
    and record_status = 'ACTIVE'::public.record_status
  for update;

  if not found then
    raise exception 'Không tìm thấy công nợ cần thu.';
  end if;

  if not exists (
    select 1
    from public.short_enrollments e
    where e.id = v_invoice.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  ) then
    raise exception 'Bạn không có phạm vi ghi nhận thanh toán cho công nợ này.';
  end if;

  if v_invoice.invoice_status not in ('ISSUED', 'LOCKED', 'PARTIAL_PAID') then
    raise exception 'Chỉ thu tiền với công nợ ISSUED/LOCKED/PARTIAL_PAID. Trạng thái hiện tại: %.', v_invoice.invoice_status;
  end if;

  if v_invoice.balance_amount_vnd <= 0 then
    raise exception 'Công nợ này không còn số phải thu.';
  end if;

  select coalesce(sum(p.payment_amount_vnd), 0)::numeric(14,2)
  into v_pending_other
  from public.short_payments p
  where p.invoice_id = target_invoice_id
    and p.payment_status = 'PENDING'
    and p.record_status = 'ACTIVE'::public.record_status;

  if v_amount + v_pending_other > v_invoice.balance_amount_vnd then
    raise exception 'Tổng tiền chờ xác nhận và khoản mới vượt số còn phải thu.';
  end if;

  insert into public.short_payments (
    payment_code,
    invoice_id,
    enrollment_id,
    student_id,
    payment_amount_vnd,
    payment_date,
    payment_method,
    voucher_no,
    bank_ref,
    payer_name,
    evidence_url,
    payment_status,
    reconcile_status,
    payment_source,
    note,
    accounting_note,
    record_status,
    created_by,
    updated_by
  ) values (
    public.next_short_payment_code(),
    v_invoice.id,
    v_invoice.enrollment_id,
    v_invoice.student_id,
    v_amount,
    p_payment_date,
    v_method,
    nullif(trim(coalesce(p_voucher_no, '')), ''),
    nullif(trim(coalesce(p_bank_ref, '')), ''),
    nullif(trim(coalesce(p_payer_name, '')), ''),
    nullif(trim(coalesce(p_evidence_url, '')), ''),
    'PENDING',
    'NOT_RECONCILED',
    'MANUAL',
    nullif(trim(coalesce(p_note, '')), ''),
    nullif(trim(coalesce(p_note, '')), ''),
    'ACTIVE'::public.record_status,
    auth.uid(),
    auth.uid()
  )
  returning id into v_payment_id;

  return v_payment_id;
end;
$$;

create or replace function public.update_short_payment(
  target_payment_id uuid,
  p_payment_amount_vnd numeric default null,
  p_payment_date date default null,
  p_payment_method text default null,
  p_voucher_no text default null,
  p_bank_ref text default null,
  p_payer_name text default null,
  p_evidence_url text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.short_payments%rowtype;
  v_invoice public.short_finance_invoices%rowtype;
  v_amount numeric(14,2);
  v_method text;
  v_verified_other numeric(14,2);
  v_pending_other numeric(14,2);
  v_available numeric(14,2);
begin
  if not (
    public.can_manage_short_payment()
    or public.has_permission('short_course.payment.update')
  ) then
    raise exception 'Bạn chưa có quyền cập nhật thanh toán ngắn hạn.';
  end if;

  select *
  into v_payment
  from public.short_payments
  where id = target_payment_id
  for update;

  if not found then
    raise exception 'Không tìm thấy thanh toán.';
  end if;

  if v_payment.payment_status <> 'PENDING' or v_payment.payment_locked = true then
    raise exception 'Chỉ thanh toán PENDING chưa khóa mới được sửa.';
  end if;

  select *
  into v_invoice
  from public.short_finance_invoices
  where id = v_payment.invoice_id
  for update;

  if not found then
    raise exception 'Không tìm thấy công nợ của thanh toán.';
  end if;

  if not exists (
    select 1
    from public.short_enrollments e
    where e.id = v_payment.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  ) then
    raise exception 'Bạn không có phạm vi cập nhật thanh toán này.';
  end if;

  v_amount := coalesce(p_payment_amount_vnd, v_payment.payment_amount_vnd);
  v_method := coalesce(nullif(trim(coalesce(p_payment_method, '')), ''), v_payment.payment_method);

  if v_amount <= 0 then
    raise exception 'Số tiền thanh toán phải lớn hơn 0.';
  end if;

  if v_method not in ('CASH', 'BANK_TRANSFER', 'POS', 'OFFSET', 'OTHER') then
    raise exception 'Phương thức thanh toán không hợp lệ cho bước thu tiền.';
  end if;

  if coalesce(p_payment_date, v_payment.payment_date) > current_date then
    raise exception 'Ngày thanh toán không được lớn hơn ngày hiện tại.';
  end if;

  if v_method in ('BANK_TRANSFER', 'POS')
     and nullif(trim(coalesce(p_bank_ref, v_payment.bank_ref, '')), '') is null
     and nullif(trim(coalesce(p_evidence_url, v_payment.evidence_url, '')), '') is null then
    raise exception 'Chuyển khoản/POS cần mã giao dịch ngân hàng hoặc link minh chứng.';
  end if;

  if v_method = 'CASH'
     and nullif(trim(coalesce(p_voucher_no, v_payment.voucher_no, '')), '') is null then
    raise exception 'Thu tiền mặt cần số phiếu thu/chứng từ kế toán.';
  end if;

  if v_method in ('OFFSET', 'OTHER')
     and nullif(trim(coalesce(p_voucher_no, v_payment.voucher_no, '')), '') is null
     and nullif(trim(coalesce(p_evidence_url, v_payment.evidence_url, '')), '') is null then
    raise exception 'Thanh toán bù trừ/khác cần chứng từ hoặc link minh chứng.';
  end if;

  if nullif(trim(coalesce(p_bank_ref, v_payment.bank_ref, '')), '') is not null
     and exists (
       select 1
       from public.short_payments p
       where p.id <> target_payment_id
         and lower(trim(p.bank_ref)) = lower(trim(coalesce(p_bank_ref, v_payment.bank_ref)))
         and p.payment_status in ('PENDING', 'VERIFIED')
         and p.record_status = 'ACTIVE'::public.record_status
     ) then
    raise exception 'Mã giao dịch ngân hàng đã tồn tại.';
  end if;

  if nullif(trim(coalesce(p_voucher_no, v_payment.voucher_no, '')), '') is not null
     and exists (
       select 1
       from public.short_payments p
       where p.id <> target_payment_id
         and lower(trim(p.voucher_no)) = lower(trim(coalesce(p_voucher_no, v_payment.voucher_no)))
         and p.payment_status in ('PENDING', 'VERIFIED')
         and p.record_status = 'ACTIVE'::public.record_status
     ) then
    raise exception 'Số chứng từ đã tồn tại.';
  end if;

  select coalesce(sum(p.payment_amount_vnd), 0)::numeric(14,2)
  into v_verified_other
  from public.short_payments p
  where p.invoice_id = v_payment.invoice_id
    and p.payment_status = 'VERIFIED'
    and p.record_status = 'ACTIVE'::public.record_status;

  select coalesce(sum(p.payment_amount_vnd), 0)::numeric(14,2)
  into v_pending_other
  from public.short_payments p
  where p.invoice_id = v_payment.invoice_id
    and p.id <> target_payment_id
    and p.payment_status = 'PENDING'
    and p.record_status = 'ACTIVE'::public.record_status;

  v_available := greatest(v_invoice.payable_amount_vnd - v_verified_other, 0);

  if v_amount + v_pending_other > v_available then
    raise exception 'Tổng tiền chờ xác nhận và khoản đang sửa vượt số còn phải thu.';
  end if;

  update public.short_payments
  set payment_amount_vnd = v_amount,
      payment_date = coalesce(p_payment_date, payment_date),
      payment_method = v_method,
      voucher_no = coalesce(nullif(trim(coalesce(p_voucher_no, '')), ''), voucher_no),
      bank_ref = coalesce(nullif(trim(coalesce(p_bank_ref, '')), ''), bank_ref),
      payer_name = coalesce(nullif(trim(coalesce(p_payer_name, '')), ''), payer_name),
      evidence_url = coalesce(nullif(trim(coalesce(p_evidence_url, '')), ''), evidence_url),
      note = concat_ws(E'\n', nullif(note, ''), nullif(trim(coalesce(p_note, '')), '')),
      accounting_note = concat_ws(E'\n', nullif(accounting_note, ''), nullif(trim(coalesce(p_note, '')), '')),
      payment_version = payment_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_payment_id;

  return target_payment_id;
end;
$$;

create or replace function public.verify_short_payment(
  target_payment_id uuid,
  p_voucher_no text default null,
  p_verify_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.short_payments%rowtype;
  v_ready record;
begin
  if not (
    public.can_manage_short_payment()
    or public.has_permission('short_course.payment.verify')
  ) then
    raise exception 'Bạn chưa có quyền xác nhận thanh toán.';
  end if;

  select *
  into v_payment
  from public.short_payments
  where id = target_payment_id
  for update;

  if not found then
    raise exception 'Không tìm thấy thanh toán cần xác nhận.';
  end if;

  if v_payment.payment_status <> 'PENDING' then
    raise exception 'Chỉ payment PENDING mới được xác nhận. Trạng thái hiện tại: %.', v_payment.payment_status;
  end if;

  if not exists (
    select 1
    from public.short_enrollments e
    where e.id = v_payment.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  ) then
    raise exception 'Bạn không có phạm vi xác nhận thanh toán này.';
  end if;

  if nullif(trim(coalesce(p_voucher_no, '')), '') is not null then
    if exists (
      select 1
      from public.short_payments p
      where p.id <> target_payment_id
        and lower(trim(p.voucher_no)) = lower(trim(p_voucher_no))
        and p.payment_status in ('PENDING', 'VERIFIED')
        and p.record_status = 'ACTIVE'::public.record_status
    ) then
      raise exception 'Số chứng từ đã tồn tại.';
    end if;

    update public.short_payments
    set voucher_no = trim(p_voucher_no),
        updated_by = auth.uid(),
        updated_at = now()
    where id = target_payment_id;
  end if;

  perform public.refresh_short_finance_invoice_status(v_payment.invoice_id);

  select *
  into v_ready
  from public.short_payment_readiness
  where payment_id = target_payment_id;

  if not found then
    raise exception 'Không đọc được trạng thái thanh toán.';
  end if;

  if v_ready.readiness_status <> 'READY_TO_VERIFY' then
    raise exception 'Chưa thể xác nhận thanh toán. Trạng thái: %, lỗi: %',
      v_ready.readiness_status,
      array_to_string(v_ready.control_flags, ', ');
  end if;

  update public.short_payments
  set payment_status = 'VERIFIED',
      reconcile_status = 'MATCHED',
      payment_locked = true,
      verified_by = auth.uid(),
      verified_at = now(),
      reconciled_by = auth.uid(),
      reconciled_at = now(),
      verified_note = nullif(trim(coalesce(p_verify_note, '')), ''),
      accounting_note = concat_ws(E'\n', nullif(accounting_note, ''), nullif(trim(coalesce(p_verify_note, '')), '')),
      payment_version = payment_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_payment_id;

  perform public.refresh_short_finance_invoice_status(v_payment.invoice_id);

  return target_payment_id;
end;
$$;

create or replace function public.reject_short_payment(
  target_payment_id uuid,
  p_reject_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.short_payments%rowtype;
begin
  if not (
    public.can_manage_short_payment()
    or public.has_permission('short_course.payment.reject')
  ) then
    raise exception 'Bạn chưa có quyền từ chối thanh toán.';
  end if;

  if nullif(trim(coalesce(p_reject_reason, '')), '') is null then
    raise exception 'Từ chối thanh toán phải có lý do.';
  end if;

  select *
  into v_payment
  from public.short_payments
  where id = target_payment_id
  for update;

  if not found then
    raise exception 'Không tìm thấy thanh toán cần từ chối.';
  end if;

  if v_payment.payment_status <> 'PENDING' then
    raise exception 'Chỉ payment PENDING mới được từ chối. Trạng thái hiện tại: %.', v_payment.payment_status;
  end if;

  if not exists (
    select 1
    from public.short_enrollments e
    where e.id = v_payment.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  ) then
    raise exception 'Bạn không có phạm vi từ chối thanh toán này.';
  end if;

  update public.short_payments
  set payment_status = 'REJECTED',
      reconcile_status = 'MISMATCH',
      payment_locked = true,
      rejected_by = auth.uid(),
      rejected_at = now(),
      reject_reason = trim(p_reject_reason),
      accounting_note = concat_ws(E'\n', nullif(accounting_note, ''), 'Từ chối: ' || trim(p_reject_reason)),
      payment_version = payment_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_payment_id;

  return target_payment_id;
end;
$$;

create or replace function public.reverse_short_payment(
  target_payment_id uuid,
  p_reverse_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.short_payments%rowtype;
begin
  if not (
    public.can_manage_short_payment()
    or public.has_permission('short_course.payment.reverse')
  ) then
    raise exception 'Bạn chưa có quyền đảo thanh toán đã xác nhận.';
  end if;

  if nullif(trim(coalesce(p_reverse_reason, '')), '') is null then
    raise exception 'Đảo thanh toán phải có lý do.';
  end if;

  select *
  into v_payment
  from public.short_payments
  where id = target_payment_id
  for update;

  if not found then
    raise exception 'Không tìm thấy thanh toán cần đảo.';
  end if;

  if v_payment.payment_status <> 'VERIFIED' then
    raise exception 'Chỉ payment VERIFIED mới được đảo. Trạng thái hiện tại: %.', v_payment.payment_status;
  end if;

  if not exists (
    select 1
    from public.short_enrollments e
    where e.id = v_payment.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  ) then
    raise exception 'Bạn không có phạm vi đảo thanh toán này.';
  end if;

  update public.short_payments
  set payment_status = 'REVERSED',
      reconcile_status = 'MISMATCH',
      payment_locked = true,
      reversed_by = auth.uid(),
      reversed_at = now(),
      reverse_reason = trim(p_reverse_reason),
      accounting_note = concat_ws(E'\n', nullif(accounting_note, ''), 'Đảo thanh toán: ' || trim(p_reverse_reason)),
      payment_version = payment_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_payment_id;

  perform public.refresh_short_finance_invoice_status(v_payment.invoice_id);

  return target_payment_id;
end;
$$;

grant execute on function public.next_short_payment_code() to authenticated;
grant execute on function public.create_short_payment(uuid, numeric, date, text, text, text, text, text, text) to authenticated;
grant execute on function public.update_short_payment(uuid, numeric, date, text, text, text, text, text, text) to authenticated;
grant execute on function public.verify_short_payment(uuid, text, text) to authenticated;
grant execute on function public.reject_short_payment(uuid, text) to authenticated;
grant execute on function public.reverse_short_payment(uuid, text) to authenticated;

create or replace view public.short_course_data_foundation_summary
with (security_invoker = true)
as
select
  (select count(*)::int from public.short_student_master where status = 'ACTIVE') as student_count,
  (select count(*)::int from public.short_class_master where status = 'ACTIVE') as class_count,
  (select count(*)::int from public.short_enrollments where record_status = 'ACTIVE') as enrollment_count,
  (select count(*)::int from public.short_attendance_sessions where record_status = 'ACTIVE') as attendance_session_count,
  (select count(*)::int from public.short_bhxh_policy_cases where record_status = 'ACTIVE') as bhxh_case_count,
  (select count(*)::int from public.short_finance_invoices where record_status = 'ACTIVE') as invoice_count,
  (select count(*)::int from public.short_payments where record_status = 'ACTIVE') as payment_count,
  (select count(*)::int from public.short_risk_alerts where record_status = 'ACTIVE' and alert_status <> 'RESOLVED') as open_risk_count,
  (select count(*)::int from public.short_student_master_quality_status where profile_status in ('BLOCKED', 'NEEDS_FIX')) as student_needs_fix_count,
  (select count(*)::int from public.short_student_master_quality_status where profile_status = 'DUPLICATE_RISK') as student_duplicate_risk_count,
  (select count(*)::int from public.short_student_master_quality_status where profile_status in ('VERIFIED', 'VERIFIED_LOCKED')) as student_verified_count,
  (select count(*)::int from public.short_class_master_readiness where readiness_status in ('BLOCKED', 'NEEDS_FIX')) as class_needs_fix_count,
  (select count(*)::int from public.short_class_master_readiness where readiness_status = 'OPEN_READY') as class_open_ready_count,
  (select count(*)::int from public.short_class_master_readiness where readiness_status in ('OPEN', 'IN_PROGRESS')) as class_running_count,
  (select count(*)::int from public.short_enrollment_class_assignment_readiness where readiness_status = 'UNASSIGNED') as enrollment_unassigned_count,
  (select count(*)::int from public.short_enrollment_class_assignment_readiness where readiness_status = 'BLOCKED') as enrollment_assignment_blocked_count,
  (select count(*)::int from public.short_enrollment_class_assignment_readiness where readiness_status in ('ASSIGNED_READY_FOR_CLASS_OPEN', 'VERIFIED_READY_FOR_CLASS_OPEN')) as enrollment_ready_for_class_open_count,
  (select count(*)::int from public.short_enrollment_class_assignment_readiness where readiness_status in ('ASSIGNED_NEEDS_VERIFY', 'READY_FOR_ATTENDANCE')) as enrollment_ready_for_attendance_count,
  (select count(*)::int from public.short_attendance_session_readiness where readiness_status in ('BLOCKED', 'NEEDS_SYNC', 'NEEDS_RECORDING')) as attendance_needs_fix_count,
  (select count(*)::int from public.short_attendance_session_readiness where readiness_status = 'READY_TO_LOCK') as attendance_ready_to_lock_count,
  (select count(*)::int from public.short_attendance_session_readiness where readiness_status in ('LOCKED', 'APPROVED')) as attendance_locked_or_approved_count,
  (select count(*)::int from public.short_bhxh_policy_case_readiness where readiness_status in ('BLOCKED', 'NEEDS_EVIDENCE', 'NEEDS_FIX', 'NEEDS_AMOUNT')) as bhxh_needs_fix_count,
  (select count(*)::int from public.short_bhxh_policy_case_readiness where readiness_status in ('READY_TO_CHECK', 'READY_TO_SUBMIT', 'SUBMITTED_READY_APPROVAL')) as bhxh_ready_count,
  (select count(*)::int from public.short_bhxh_policy_case_readiness where readiness_status = 'APPROVED') as bhxh_approved_count,
  (select count(*)::int from public.short_finance_invoice_readiness where readiness_status in ('BLOCKED', 'NEEDS_AMOUNT', 'NEEDS_FIX')) as finance_needs_fix_count,
  (select count(*)::int from public.short_finance_invoice_readiness where readiness_status in ('READY_TO_ISSUE', 'READY_TO_LOCK')) as finance_ready_count,
  (select coalesce(sum(balance_amount_vnd), 0)::numeric(14,2) from public.short_finance_invoice_readiness where readiness_status not in ('CANCELLED', 'REFUNDED')) as finance_open_balance_vnd,
  (select count(*)::int from public.short_payment_readiness where readiness_status = 'READY_TO_VERIFY') as payment_ready_to_verify_count,
  (select count(*)::int from public.short_payment_readiness where readiness_status = 'BLOCKED') as payment_needs_fix_count,
  (select count(*)::int from public.short_payment_readiness where payment_status = 'VERIFIED') as payment_verified_count,
  (select count(*)::int from public.short_payment_readiness where payment_status = 'PENDING') as payment_pending_count,
  (select coalesce(sum(payment_amount_vnd), 0)::numeric(14,2) from public.short_payment_readiness where payment_status = 'VERIFIED') as payment_verified_amount_vnd;

grant select on public.short_course_data_foundation_summary to authenticated;

insert into public.short_governance_rules (
  rule_code,
  rule_name,
  rule_group,
  rule_description,
  enforcement_level,
  source_table,
  target_process,
  owner_department,
  checker_role,
  approver_role,
  ai_allowed,
  control_status,
  status
) values
  (
    'SHORT_PAYMENT_REQUIRES_ISSUED_INVOICE',
    'Thanh toán ngắn hạn phải gắn công nợ đã phát hành/khóa',
    'PAYMENT_CONTROL',
    'Không ghi nhận payment nếu invoice còn DRAFT, đã hủy, đã hoàn hoặc không còn số phải thu.',
    'BLOCK',
    'short_payments,short_finance_invoices',
    'P1-09 Short Payment Foundation',
    'KHTC',
    'ACCOUNTING',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_PAYMENT_REQUIRES_EVIDENCE',
    'Thanh toán ngắn hạn phải có chứng từ',
    'PAYMENT_CONTROL',
    'Tiền mặt cần số phiếu thu; chuyển khoản/POS cần mã giao dịch hoặc link minh chứng; bù trừ cần chứng từ.',
    'BLOCK',
    'short_payments',
    'P1-09 Short Payment Foundation',
    'KHTC + ACCOUNTING',
    'AUDIT',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_PAYMENT_NO_DUPLICATE_OR_OVERPAY',
    'Không thu trùng hoặc thu vượt công nợ',
    'PAYMENT_CONTROL',
    'Mã giao dịch/số chứng từ không được trùng; tổng PENDING/VERIFIED không được vượt số còn phải thu.',
    'BLOCK',
    'short_payments,short_finance_invoices',
    'P1-09 Short Payment Foundation',
    'KHTC + ACCOUNTING',
    'AUDIT',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  )
on conflict (rule_code) do update
set rule_name = excluded.rule_name,
    rule_group = excluded.rule_group,
    rule_description = excluded.rule_description,
    enforcement_level = excluded.enforcement_level,
    source_table = excluded.source_table,
    target_process = excluded.target_process,
    owner_department = excluded.owner_department,
    checker_role = excluded.checker_role,
    approver_role = excluded.approver_role,
    ai_allowed = excluded.ai_allowed,
    control_status = excluded.control_status,
    status = excluded.status,
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
  'WF_P1_09_SHORT_PAYMENT_FOUNDATION',
  'P1-09 Thanh toán ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'Sau khi công nợ ngắn hạn được ISSUED/LOCKED/PARTIAL_PAID và còn số phải thu.',
  'KHTC',
  'KHTC',
  'ACCOUNTING',
  'BGH',
  'Payment được ghi nhận, đối soát, xác nhận/từ chối/đảo và cập nhật lại công nợ.',
  'Payment VERIFIED cập nhật paid_amount/balance của invoice; payment PENDING chưa tính là đã thu.',
  'Mọi tạo/sửa/xác nhận/từ chối/đảo payment đều ghi audit log.',
  909,
  'DAT_TAM_THOI'
)
on conflict (workflow_code) do update
set workflow_name = excluded.workflow_name,
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

insert into public.heu_os_approval_matrix (
  approval_code,
  module_code,
  workflow_code,
  decision_name,
  decision_level,
  maker_role,
  checker_role,
  approver_role,
  required_evidence,
  blocking_rule,
  sla_hours,
  control_status
) values (
  'APPROVE_P1_09_SHORT_PAYMENT_VERIFY',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_09_SHORT_PAYMENT_FOUNDATION',
  'Xác nhận thanh toán ngắn hạn',
  'DEPARTMENT',
  'KHTC',
  'ACCOUNTING',
  'BGH',
  'Payment có invoice hợp lệ, không vượt số còn phải thu, có chứng từ và không trùng mã giao dịch/chứng từ.',
  'Không verify nếu short_payment_readiness = BLOCKED.',
  24,
  'DAT_TAM_THOI'
)
on conflict (approval_code) do update
set workflow_code = excluded.workflow_code,
    decision_name = excluded.decision_name,
    maker_role = excluded.maker_role,
    checker_role = excluded.checker_role,
    approver_role = excluded.approver_role,
    required_evidence = excluded.required_evidence,
    blocking_rule = excluded.blocking_rule,
    sla_hours = excluded.sla_hours,
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
    'SHORT_PAYMENT',
    'Thanh toán ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_payments',
    'TRANSACTION',
    'KHTC',
    'HEU_OS',
    'RESTRICTED',
    true,
    'P1-09: Payment chỉ được tạo/sửa/xác nhận/từ chối/đảo qua function, không sửa tay payment VERIFIED.',
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_PAYMENT_READINESS',
    'Tình trạng sẵn sàng xác nhận thanh toán ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_payment_readiness',
    'REPORT_VIEW',
    'KHTC + IT_DATA',
    'HEU_OS',
    'RESTRICTED',
    true,
    'View chỉ đọc để kiểm tra payment thiếu chứng từ, trùng chứng từ hoặc vượt số phải thu.',
    'DAT_TAM_THOI'
  )
on conflict (data_code) do update
set data_name = excluded.data_name,
    source_table = excluded.source_table,
    data_type = excluded.data_type,
    owner_department = excluded.owner_department,
    sensitivity_level = excluded.sensitivity_level,
    ai_allowed = excluded.ai_allowed,
    change_rule = excluded.change_rule,
    control_status = excluded.control_status,
    updated_at = now();

insert into public.heu_os_risk_controls (
  risk_code,
  risk_name,
  module_code,
  risk_group,
  severity,
  owner_department,
  risk_description,
  control_rule,
  escalation_rule,
  dashboard_metric,
  control_status
) values
  (
    'RISK_P1_09_PAYMENT_WITHOUT_EVIDENCE',
    'Xác nhận thanh toán thiếu chứng từ',
    'M11_SHORT_COURSE_ERP',
    'FINANCE_CONTROL',
    'CRITICAL',
    'KHTC + ACCOUNTING',
    'Payment thiếu chứng từ làm sai công nợ, sai kế toán và khó đối soát.',
    'short_payment_readiness chặn NO_BANK_EVIDENCE/NO_CASH_VOUCHER/NO_PAYMENT_EVIDENCE.',
    'Kế toán trưởng/BGH xử lý nếu payment bị verify thiếu chứng từ.',
    'Số payment readiness_status = BLOCKED do thiếu chứng từ.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_09_DUPLICATE_OR_OVERPAY',
    'Thu trùng hoặc thu vượt công nợ',
    'M11_SHORT_COURSE_ERP',
    'FINANCE_CONTROL',
    'CRITICAL',
    'KHTC + ACCOUNTING',
    'Một payment bị ghi trùng hoặc tổng tiền vượt số phải thu làm sai doanh thu/công nợ.',
    'Unique index theo bank_ref/voucher_no và function chặn amount vượt balance.',
    'Audit/KHTC rà soát payment_needs_fix_count hằng ngày.',
    'Số payment DUPLICATE hoặc AMOUNT_EXCEEDS_OPEN_BALANCE.',
    'DAT_TAM_THOI'
  )
on conflict (risk_code) do update
set risk_name = excluded.risk_name,
    risk_group = excluded.risk_group,
    severity = excluded.severity,
    owner_department = excluded.owner_department,
    risk_description = excluded.risk_description,
    control_rule = excluded.control_rule,
    escalation_rule = excluded.escalation_rule,
    dashboard_metric = excluded.dashboard_metric,
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
    'short_payment_readiness',
    'Kiểm tra thanh toán ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'REPORT_VIEW',
    'KHTC + IT_DATA',
    'View kiểm tra payment đủ điều kiện xác nhận hay chưa.',
    'RESTRICTED',
    true,
    'DAT_TAM_THOI'
  )
on conflict (table_code) do update
set table_name = excluded.table_name,
    module_code = excluded.module_code,
    table_type = excluded.table_type,
    data_owner_department = excluded.data_owner_department,
    purpose = excluded.purpose,
    sensitivity_level = excluded.sensitivity_level,
    ai_allowed = excluded.ai_allowed,
    control_status = excluded.control_status,
    updated_at = now();

insert into public.data_dictionary_fields (
  table_id,
  field_code,
  field_name,
  data_type,
  is_required,
  is_unique,
  is_sensitive,
  ai_allowed,
  validation_rule,
  note,
  control_status
)
select
  t.id,
  f.field_code,
  f.field_name,
  f.data_type,
  f.is_required,
  f.is_unique,
  f.is_sensitive,
  f.ai_allowed,
  f.validation_rule,
  f.note,
  'DAT_TAM_THOI'
from public.data_dictionary_tables t
cross join (
  values
    ('readiness_status', 'Trạng thái sẵn sàng xác nhận payment', 'text', true, false, false, true, 'READY_TO_VERIFY/VERIFIED/REJECTED/REVERSED/BLOCKED', 'Dùng cho KHTC/kế toán xác nhận payment.'),
    ('control_flags', 'Cờ lỗi/kiểm soát payment', 'text[]', false, false, false, true, 'Danh sách lỗi chi tiết từng payment.', 'Chỉ đúng chỗ sai để người dùng không nhập lại chỗ đúng.'),
    ('payment_amount_vnd', 'Số tiền thanh toán', 'numeric', true, false, true, true, 'Số tiền dương, không vượt số còn phải thu.', 'Dữ liệu nhạy cảm tài chính.'),
    ('bank_ref', 'Mã giao dịch ngân hàng', 'text', false, true, true, false, 'Không trùng với payment PENDING/VERIFIED khác nếu có.', 'Dữ liệu đối soát kế toán.'),
    ('voucher_no', 'Số chứng từ/phiếu thu', 'text', false, true, true, false, 'Không trùng với payment PENDING/VERIFIED khác nếu có.', 'Dữ liệu đối soát kế toán.')
) as f(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, validation_rule, note)
where t.table_code = 'short_payment_readiness'
on conflict (table_id, field_code) do update
set field_name = excluded.field_name,
    data_type = excluded.data_type,
    is_required = excluded.is_required,
    is_unique = excluded.is_unique,
    is_sensitive = excluded.is_sensitive,
    ai_allowed = excluded.ai_allowed,
    validation_rule = excluded.validation_rule,
    note = excluded.note,
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
  'OWN_P1_09_SHORT_PAYMENT_FOUNDATION',
  'P1-09 Thanh toán ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_09_SHORT_PAYMENT_FOUNDATION',
  'WORKFLOW',
  'short_payments',
  'KHTC',
  'KHTC',
  'ACCOUNTING',
  'BGH',
  'RESTRICTED',
  'KHTC',
  'ACCOUNTING + AUDIT',
  'Invoice hợp lệ, payment không vượt balance, có chứng từ, không trùng bank_ref/voucher_no.',
  'Mọi tạo/sửa/xác nhận/từ chối/đảo payment phải ghi audit log.',
  24,
  'CRITICAL',
  'DAT_TAM_THOI'
)
on conflict (ownership_code) do update
set process_name = excluded.process_name,
    workflow_code = excluded.workflow_code,
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
  decision_status,
  record_status
) values (
  'GATE_P1_09_SHORT_PAYMENT_READY',
  'Gate P1-09: payment ngắn hạn đủ điều kiện xác nhận',
  'FINANCE',
  'VIEW',
  'short_payment_readiness',
  'KHTC + ACCOUNTING',
  'Kế toán kiểm tra payment không bị BLOCKED trước khi xác nhận.',
  'BGH/KHTC chỉ chấp nhận payment có chứng từ và không vượt/trùng công nợ.',
  'DRAFT',
  'ACTIVE'::public.record_status
)
on conflict (gate_code) do update
set gate_name = excluded.gate_name,
    gate_type = excluded.gate_type,
    entity_type = excluded.entity_type,
    entity_code = excluded.entity_code,
    owner_department = excluded.owner_department,
    checker_note = excluded.checker_note,
    approver_note = excluded.approver_note,
    decision_status = excluded.decision_status,
    record_status = excluded.record_status,
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
  'NAV_P1_09_SHORT_PAYMENT_FOUNDATION',
  'P1-09 Thanh toán ngắn hạn',
  'FINANCE',
  'M11_SHORT_COURSE_ERP',
  '/master-control/modules/M11_SHORT_COURSE_ERP',
  'Ghi nhận, đối soát, xác nhận, từ chối và đảo thanh toán ngắn hạn.',
  'KHTC + ACCOUNTING',
  'Kiểm tra payment readiness và xác nhận thanh toán',
  119,
  true,
  'Cảnh báo nếu short_payment_readiness có readiness_status = BLOCKED hoặc payment_pending_count tăng bất thường.',
  'DAT_TAM_THOI'
)
on conflict (node_code) do update
set node_name = excluded.node_name,
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
