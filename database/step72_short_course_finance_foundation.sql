-- P1-08: Short Course Finance Foundation
-- Run after step71_short_course_bhxh_policy_foundation.sql.
-- Purpose:
-- - Create and control short-course receivables/invoices.
-- - Track expected, discount, payable, paid and balance amounts.
-- - Block BHXH/support finance records if the policy case is not approved.
-- - Prepare clean source data for P1-09 payments.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('short_course.finance.read'),
    ('short_course.finance.create'),
    ('short_course.finance.update'),
    ('short_course.finance.issue'),
    ('short_course.finance.lock'),
    ('short_course.finance.cancel'),
    ('short_course.finance.manage')
) as p(permission)
where r.code in (
  'ADMIN',
  'BGH',
  'AUDIT',
  'KHTC',
  'ACCOUNTING',
  'ACCOUNTING_LEAD',
  'CTHSSV',
  'CTHSSV_LEAD',
  'DAO_TAO',
  'DAO_TAO_LEAD',
  'IT_DATA'
)
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('short_course.finance.read')
) as p(permission)
where r.code in (
  'COUNSELOR',
  'ADMISSION_STAFF',
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
    'short_course.finance.read',
    'SHORT_COURSE',
    'Xem công nợ/tài chính ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    true,
    'Chỉ xem công nợ trong phạm vi lớp/đối tượng tuyển sinh được phân.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.finance.create',
    'SHORT_COURSE',
    'Tạo công nợ ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    false,
    true,
    'Tạo công nợ từ enrollment hợp lệ; khoản BHXH_SUPPORT phải gắn policy case đã duyệt.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.finance.update',
    'SHORT_COURSE',
    'Cập nhật công nợ ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    false,
    true,
    'Chỉ cập nhật công nợ chưa khóa/chưa phát sinh thanh toán đã xác nhận.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.finance.issue',
    'SHORT_COURSE',
    'Phát hành công nợ ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    false,
    true,
    'Phát hành khi số tiền, học viên, lớp và chính sách liên quan đã hợp lệ.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.finance.lock',
    'SHORT_COURSE',
    'Khóa công nợ ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC + AUDIT',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    true,
    'Khóa sau khi công nợ phát hành để không sửa tự do; thay đổi sau khóa phải qua điều chỉnh ở bước sau.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.finance.cancel',
    'SHORT_COURSE',
    'Hủy công nợ ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    false,
    true,
    'Hủy công nợ phải có lý do, không hủy trực tiếp nếu đã có thanh toán VERIFIED.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.finance.manage',
    'SHORT_COURSE',
    'Quản trị công nợ ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC + BGH',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    true,
    'Quyền tổng hợp cho KHTC/BGH quản trị công nợ ngắn hạn theo phạm vi được phân.',
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
    or public.has_permission('short_course.payment.verify')
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
    or public.has_permission('short_course.payment.verify')
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
    or public.has_permission('short_course.payment.verify')
$$;

grant execute on function public.can_read_short_course_erp() to authenticated;
grant execute on function public.can_manage_short_course_erp() to authenticated;
grant execute on function public.can_read_short_finance() to authenticated;
grant execute on function public.can_manage_short_finance() to authenticated;

create sequence if not exists public.short_invoice_code_seq;

create or replace function public.next_short_invoice_code()
returns text
language sql
security definer
set search_path = public
as $$
  select 'INV-' ||
    to_char(current_date, 'YYYY') ||
    '-' ||
    lpad(nextval('public.short_invoice_code_seq')::text, 6, '0')
$$;

grant execute on function public.next_short_invoice_code() to authenticated;

alter table public.short_finance_invoices
  add column if not exists policy_case_id uuid references public.short_bhxh_policy_cases(id) on delete restrict,
  add column if not exists invoice_period text,
  add column if not exists source_type text not null default 'MANUAL',
  add column if not exists invoice_locked boolean not null default false,
  add column if not exists issued_by uuid references public.users_profile(id),
  add column if not exists issued_at timestamptz,
  add column if not exists cancelled_by uuid references public.users_profile(id),
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancel_reason text,
  add column if not exists locked_reason text,
  add column if not exists finance_note text,
  add column if not exists invoice_version int not null default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_finance_invoice_source_type_valid'
      and conrelid = 'public.short_finance_invoices'::regclass
  ) then
    alter table public.short_finance_invoices
      add constraint short_finance_invoice_source_type_valid
      check (source_type in ('MANUAL', 'TUITION_POLICY', 'BHXH_POLICY', 'IMPORT', 'ADJUSTMENT'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_finance_invoice_version_positive'
      and conrelid = 'public.short_finance_invoices'::regclass
  ) then
    alter table public.short_finance_invoices
      add constraint short_finance_invoice_version_positive
      check (invoice_version > 0);
  end if;
end $$;

update public.short_finance_invoices
set invoice_locked = case
      when invoice_status = 'LOCKED' or locked_at is not null then true
      else coalesce(invoice_locked, false)
    end,
    source_type = coalesce(source_type, 'MANUAL'),
    invoice_version = greatest(coalesce(invoice_version, 1), 1),
    updated_at = now()
where record_status = 'ACTIVE'::public.record_status;

create index if not exists idx_short_finance_invoices_type_status
on public.short_finance_invoices(invoice_type, invoice_status, invoice_locked)
where record_status = 'ACTIVE';

create index if not exists idx_short_finance_invoices_policy_case
on public.short_finance_invoices(policy_case_id, invoice_status)
where record_status = 'ACTIVE' and policy_case_id is not null;

create index if not exists idx_short_finance_invoices_due_date
on public.short_finance_invoices(due_date, invoice_status)
where record_status = 'ACTIVE';

create or replace view public.short_finance_invoice_readiness
with (security_invoker = true)
as
with base as (
  select
    i.id as invoice_id,
    i.invoice_code,
    i.enrollment_id,
    e.enrollment_code,
    i.student_id,
    s.student_code,
    s.student_name,
    i.class_id,
    c.class_code,
    c.class_name,
    i.offering_id,
    o.offering_code,
    o.offering_name,
    o.is_finance_ready as offering_finance_ready,
    e.admission_segment_id,
    seg.segment_code,
    seg.segment_name,
    e.enrollment_status,
    e.assignment_status,
    e.finance_status as enrollment_finance_status,
    i.invoice_type,
    i.expected_amount_vnd,
    i.discount_amount_vnd,
    i.payable_amount_vnd,
    i.paid_amount_vnd,
    i.balance_amount_vnd,
    i.due_date,
    i.invoice_status,
    i.invoice_locked,
    i.locked_by,
    i.locked_at,
    i.locked_reason,
    i.issued_by,
    i.issued_at,
    i.cancelled_by,
    i.cancelled_at,
    i.cancel_reason,
    i.policy_case_id,
    pc.case_code as policy_case_code,
    pc.policy_type,
    pc.case_status as policy_case_status,
    pc.eligibility_status as policy_eligibility_status,
    pc.approved_amount_vnd as policy_approved_amount_vnd,
    i.invoice_period,
    i.source_type,
    i.finance_note,
    i.invoice_version,
    i.record_status,
    i.created_at,
    i.updated_at,
    coalesce(payment_stats.verified_payment_total, 0)::numeric(14,2) as verified_payment_total,
    coalesce(payment_stats.pending_payment_total, 0)::numeric(14,2) as pending_payment_total,
    coalesce(payment_stats.rejected_payment_total, 0)::numeric(14,2) as rejected_payment_total,
    coalesce(payment_stats.verified_payment_count, 0)::int as verified_payment_count
  from public.short_finance_invoices i
  join public.short_enrollments e on e.id = i.enrollment_id
  join public.short_student_master s on s.id = i.student_id
  left join public.short_class_master c on c.id = i.class_id
  join public.admission_segments seg on seg.id = e.admission_segment_id
  join public.admission_offering_catalog o on o.id = i.offering_id
  left join public.short_bhxh_policy_cases pc on pc.id = i.policy_case_id
  left join lateral (
    select
      coalesce(sum(p.payment_amount_vnd) filter (where p.payment_status = 'VERIFIED'), 0) as verified_payment_total,
      coalesce(sum(p.payment_amount_vnd) filter (where p.payment_status = 'PENDING'), 0) as pending_payment_total,
      coalesce(sum(p.payment_amount_vnd) filter (where p.payment_status = 'REJECTED'), 0) as rejected_payment_total,
      count(*) filter (where p.payment_status = 'VERIFIED') as verified_payment_count
    from public.short_payments p
    where p.invoice_id = i.id
      and p.record_status = 'ACTIVE'::public.record_status
  ) payment_stats on true
  where i.record_status = 'ACTIVE'::public.record_status
),
evaluated as (
  select
    b.*,
    array_remove(array[
      case when b.record_status <> 'ACTIVE'::public.record_status then 'ARCHIVED_INVOICE' end,
      case when b.enrollment_status not in ('ENROLLED', 'STUDYING', 'COMPLETED') then 'ENROLLMENT_NOT_ACTIVE' end,
      case when b.assignment_status <> 'VERIFIED' then 'ASSIGNMENT_NOT_VERIFIED' end,
      case when b.class_id is null then 'NO_CLASS' end,
      case when b.offering_finance_ready = false then 'OFFERING_NOT_FINANCE_READY' end,
      case when b.expected_amount_vnd < 0 or b.discount_amount_vnd < 0 or b.payable_amount_vnd < 0 or b.paid_amount_vnd < 0 then 'NEGATIVE_AMOUNT' end,
      case when b.expected_amount_vnd = 0 then 'NO_EXPECTED_AMOUNT' end,
      case when b.discount_amount_vnd > b.expected_amount_vnd then 'DISCOUNT_GT_EXPECTED' end,
      case when b.payable_amount_vnd <> greatest(b.expected_amount_vnd - b.discount_amount_vnd, 0) then 'PAYABLE_MISMATCH' end,
      case when b.paid_amount_vnd > b.payable_amount_vnd then 'PAID_GT_PAYABLE' end,
      case when b.verified_payment_total <> b.paid_amount_vnd then 'PAID_NOT_MATCH_VERIFIED_PAYMENTS' end,
      case when b.invoice_type = 'BHXH_SUPPORT' and b.policy_case_id is null then 'NO_POLICY_CASE' end,
      case when b.invoice_type = 'BHXH_SUPPORT' and coalesce(b.policy_case_status, '') <> 'APPROVED' then 'POLICY_NOT_APPROVED' end,
      case when b.invoice_type = 'BHXH_SUPPORT'
             and b.policy_approved_amount_vnd is not null
             and b.payable_amount_vnd > b.policy_approved_amount_vnd
        then 'PAYABLE_GT_POLICY_APPROVED' end,
      case when b.invoice_status = 'CANCELLED' and nullif(trim(coalesce(b.cancel_reason, '')), '') is null then 'CANCELLED_WITHOUT_REASON' end,
      case when b.invoice_locked = true and nullif(trim(coalesce(b.locked_reason, '')), '') is null then 'LOCKED_WITHOUT_REASON' end,
      case when b.due_date is not null and b.due_date < current_date and b.balance_amount_vnd > 0 and b.invoice_status in ('ISSUED', 'PARTIAL_PAID', 'LOCKED') then 'OVERDUE_BALANCE' end
    ]::text[], null) as control_flags
  from base b
)
select
  e.*,
  case
    when e.record_status <> 'ACTIVE'::public.record_status then 'ARCHIVED'
    when e.invoice_status = 'CANCELLED' then 'CANCELLED'
    when e.invoice_status = 'REFUNDED' then 'REFUNDED'
    when e.invoice_status = 'PAID' or e.balance_amount_vnd = 0 then 'PAID'
    when e.control_flags && array[
      'ENROLLMENT_NOT_ACTIVE',
      'ASSIGNMENT_NOT_VERIFIED',
      'NO_CLASS',
      'OFFERING_NOT_FINANCE_READY',
      'NEGATIVE_AMOUNT',
      'DISCOUNT_GT_EXPECTED',
      'PAYABLE_MISMATCH',
      'PAID_GT_PAYABLE',
      'NO_POLICY_CASE',
      'POLICY_NOT_APPROVED',
      'PAYABLE_GT_POLICY_APPROVED'
    ]::text[] then 'BLOCKED'
    when 'NO_EXPECTED_AMOUNT' = any(e.control_flags) then 'NEEDS_AMOUNT'
    when e.invoice_status in ('ISSUED', 'PARTIAL_PAID', 'LOCKED') and 'OVERDUE_BALANCE' = any(e.control_flags) then 'OVERDUE'
    when e.invoice_status = 'DRAFT' then 'READY_TO_ISSUE'
    when e.invoice_status = 'ISSUED' and e.invoice_locked = false then 'READY_TO_LOCK'
    when e.invoice_status = 'PARTIAL_PAID' then 'PARTIAL_PAID'
    when e.invoice_status = 'LOCKED' or e.invoice_locked = true then 'LOCKED'
    else 'NEEDS_FIX'
  end as readiness_status
from evaluated e;

grant select on public.short_finance_invoice_readiness to authenticated;

create or replace function public.refresh_short_finance_invoice_status(target_invoice_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice public.short_finance_invoices%rowtype;
  v_verified_total numeric(14,2);
  v_new_status text;
begin
  if not public.can_read_short_finance() then
    raise exception 'Bạn chưa có quyền đọc công nợ ngắn hạn.';
  end if;

  select *
  into v_invoice
  from public.short_finance_invoices
  where id = target_invoice_id
  for update;

  if not found then
    raise exception 'Không tìm thấy công nợ.';
  end if;

  if not exists (
    select 1
    from public.short_enrollments e
    where e.id = v_invoice.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  ) then
    raise exception 'Bạn không có phạm vi thao tác với công nợ này.';
  end if;

  select coalesce(sum(p.payment_amount_vnd), 0)::numeric(14,2)
  into v_verified_total
  from public.short_payments p
  where p.invoice_id = target_invoice_id
    and p.payment_status = 'VERIFIED'
    and p.record_status = 'ACTIVE'::public.record_status;

  if v_invoice.invoice_status in ('CANCELLED', 'REFUNDED') then
    return target_invoice_id;
  end if;

  v_new_status := case
    when v_verified_total >= v_invoice.payable_amount_vnd and v_invoice.payable_amount_vnd > 0 then 'PAID'
    when v_verified_total > 0 then 'PARTIAL_PAID'
    when v_invoice.invoice_locked = true or v_invoice.invoice_status = 'LOCKED' then 'LOCKED'
    when v_invoice.invoice_status in ('ISSUED', 'DRAFT') then v_invoice.invoice_status
    else v_invoice.invoice_status
  end;

  update public.short_finance_invoices
  set paid_amount_vnd = v_verified_total,
      invoice_status = v_new_status,
      invoice_version = invoice_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_invoice_id;

  update public.short_enrollments e
  set finance_status = case
        when totals.active_invoice_count = 0 then 'NOT_CREATED'
        when totals.open_balance_vnd <= 0 then 'PAID'
        when totals.verified_paid_vnd > 0 then 'PARTIAL'
        else 'INVOICED'
      end,
      updated_by = auth.uid(),
      updated_at = now()
  from (
    select
      count(*) filter (where i.invoice_status not in ('CANCELLED', 'REFUNDED')) as active_invoice_count,
      coalesce(sum(i.balance_amount_vnd) filter (where i.invoice_status not in ('CANCELLED', 'REFUNDED')), 0) as open_balance_vnd,
      coalesce(sum(i.paid_amount_vnd) filter (where i.invoice_status not in ('CANCELLED', 'REFUNDED')), 0) as verified_paid_vnd
    from public.short_finance_invoices i
    where i.enrollment_id = v_invoice.enrollment_id
      and i.record_status = 'ACTIVE'::public.record_status
  ) totals
  where e.id = v_invoice.enrollment_id;

  return target_invoice_id;
end;
$$;

create or replace function public.create_short_finance_invoice(
  target_enrollment_id uuid,
  p_invoice_type text default 'TUITION',
  p_expected_amount_vnd numeric default 0,
  p_discount_amount_vnd numeric default 0,
  p_due_date date default null,
  p_policy_case_id uuid default null,
  p_invoice_period text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment public.short_enrollments%rowtype;
  v_offering record;
  v_policy public.short_bhxh_policy_cases%rowtype;
  v_expected numeric(14,2);
  v_discount numeric(14,2);
  v_payable numeric(14,2);
  v_invoice_id uuid;
  v_duplicate_id uuid;
begin
  if not (
    public.can_manage_short_finance()
    or public.has_permission('short_course.finance.create')
  ) then
    raise exception 'Bạn chưa có quyền tạo công nợ ngắn hạn.';
  end if;

  if coalesce(p_invoice_type, 'TUITION') not in ('TUITION', 'BHXH_SUPPORT', 'CERTIFICATE_FEE', 'OTHER') then
    raise exception 'Loại công nợ không hợp lệ.';
  end if;

  v_expected := coalesce(p_expected_amount_vnd, 0);
  v_discount := coalesce(p_discount_amount_vnd, 0);

  if v_expected < 0 or v_discount < 0 then
    raise exception 'Số tiền không được âm.';
  end if;

  if v_discount > v_expected then
    raise exception 'Giảm trừ không được lớn hơn số tiền phải thu dự kiến.';
  end if;

  if v_expected = 0 then
    raise exception 'Công nợ cần có số tiền dự kiến lớn hơn 0.';
  end if;

  v_payable := greatest(v_expected - v_discount, 0);

  select *
  into v_enrollment
  from public.short_enrollments
  where id = target_enrollment_id
    and record_status = 'ACTIVE'::public.record_status
  for update;

  if not found then
    raise exception 'Không tìm thấy ghi danh ngắn hạn.';
  end if;

  if not public.can_access_business_scope(v_enrollment.admission_segment_id, null::uuid) then
    raise exception 'Bạn không có phạm vi thao tác với ghi danh này.';
  end if;

  if v_enrollment.class_id is null
     or v_enrollment.assignment_status <> 'VERIFIED'
     or v_enrollment.enrollment_status not in ('ENROLLED', 'STUDYING', 'COMPLETED') then
    raise exception 'Ghi danh chưa đủ điều kiện tạo công nợ: cần có lớp, đã xác nhận gán lớp và còn hiệu lực.';
  end if;

  select o.*
  into v_offering
  from public.admission_offering_catalog o
  where o.id = v_enrollment.offering_id;

  if not found or coalesce(v_offering.is_finance_ready, false) = false then
    raise exception 'Ngành/khoá chưa sẵn sàng tài chính.';
  end if;

  if coalesce(p_invoice_type, 'TUITION') = 'BHXH_SUPPORT' then
    if p_policy_case_id is null then
      raise exception 'Công nợ BHXH_SUPPORT phải gắn hồ sơ chính sách đã duyệt.';
    end if;

    select *
    into v_policy
    from public.short_bhxh_policy_cases
    where id = p_policy_case_id
      and enrollment_id = target_enrollment_id
      and record_status = 'ACTIVE'::public.record_status
    for update;

    if not found then
      raise exception 'Không tìm thấy hồ sơ chính sách phù hợp với ghi danh.';
    end if;

    if v_policy.case_status <> 'APPROVED' or v_policy.eligibility_status <> 'ELIGIBLE' then
      raise exception 'Hồ sơ chính sách chưa được duyệt nên chưa thể ghi nhận tài chính.';
    end if;

    if v_policy.approved_amount_vnd is not null and v_payable > v_policy.approved_amount_vnd then
      raise exception 'Số tiền công nợ không được vượt số tiền chính sách đã duyệt.';
    end if;
  elsif p_policy_case_id is not null then
    raise exception 'Chỉ công nợ BHXH_SUPPORT mới được gắn policy_case_id.';
  end if;

  select id
  into v_duplicate_id
  from public.short_finance_invoices i
  where i.enrollment_id = target_enrollment_id
    and i.invoice_type = coalesce(p_invoice_type, 'TUITION')
    and coalesce(i.invoice_period, '') = coalesce(p_invoice_period, '')
    and i.record_status = 'ACTIVE'::public.record_status
    and i.invoice_status not in ('CANCELLED', 'REFUNDED')
  limit 1;

  if v_duplicate_id is not null then
    raise exception 'Đã có công nợ cùng loại/kỳ cho ghi danh này.';
  end if;

  insert into public.short_finance_invoices (
    invoice_code,
    enrollment_id,
    student_id,
    class_id,
    offering_id,
    invoice_type,
    expected_amount_vnd,
    discount_amount_vnd,
    payable_amount_vnd,
    paid_amount_vnd,
    due_date,
    invoice_status,
    policy_case_id,
    invoice_period,
    source_type,
    finance_note,
    note,
    record_status,
    created_by,
    updated_by
  ) values (
    public.next_short_invoice_code(),
    v_enrollment.id,
    v_enrollment.student_id,
    v_enrollment.class_id,
    v_enrollment.offering_id,
    coalesce(p_invoice_type, 'TUITION'),
    v_expected,
    v_discount,
    v_payable,
    0,
    p_due_date,
    'DRAFT',
    p_policy_case_id,
    nullif(trim(coalesce(p_invoice_period, '')), ''),
    case when coalesce(p_invoice_type, 'TUITION') = 'BHXH_SUPPORT' then 'BHXH_POLICY' else 'MANUAL' end,
    nullif(trim(coalesce(p_note, '')), ''),
    nullif(trim(coalesce(p_note, '')), ''),
    'ACTIVE'::public.record_status,
    auth.uid(),
    auth.uid()
  )
  returning id into v_invoice_id;

  update public.short_enrollments
  set finance_status = 'INVOICED',
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_enrollment.id
    and finance_status = 'NOT_CREATED';

  return v_invoice_id;
end;
$$;

create or replace function public.update_short_finance_invoice(
  target_invoice_id uuid,
  p_expected_amount_vnd numeric default null,
  p_discount_amount_vnd numeric default null,
  p_due_date date default null,
  p_invoice_period text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice public.short_finance_invoices%rowtype;
  v_verified_payments numeric(14,2);
  v_expected numeric(14,2);
  v_discount numeric(14,2);
begin
  if not (
    public.can_manage_short_finance()
    or public.has_permission('short_course.finance.update')
  ) then
    raise exception 'Bạn chưa có quyền cập nhật công nợ ngắn hạn.';
  end if;

  select *
  into v_invoice
  from public.short_finance_invoices
  where id = target_invoice_id
  for update;

  if not found then
    raise exception 'Không tìm thấy công nợ.';
  end if;

  if not exists (
    select 1
    from public.short_enrollments e
    where e.id = v_invoice.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  ) then
    raise exception 'Bạn không có phạm vi cập nhật công nợ này.';
  end if;

  if v_invoice.invoice_locked = true or v_invoice.invoice_status in ('LOCKED', 'PAID', 'CANCELLED', 'REFUNDED') then
    raise exception 'Công nợ đã khóa/đã tất toán/đã hủy nên không thể cập nhật trực tiếp.';
  end if;

  select coalesce(sum(payment_amount_vnd), 0)::numeric(14,2)
  into v_verified_payments
  from public.short_payments
  where invoice_id = target_invoice_id
    and payment_status = 'VERIFIED'
    and record_status = 'ACTIVE'::public.record_status;

  if v_verified_payments > 0 then
    raise exception 'Công nợ đã có thanh toán VERIFIED nên không cập nhật số tiền trực tiếp.';
  end if;

  v_expected := coalesce(p_expected_amount_vnd, v_invoice.expected_amount_vnd);
  v_discount := coalesce(p_discount_amount_vnd, v_invoice.discount_amount_vnd);

  if v_expected < 0 or v_discount < 0 then
    raise exception 'Số tiền không được âm.';
  end if;

  if v_expected = 0 then
    raise exception 'Công nợ cần có số tiền dự kiến lớn hơn 0.';
  end if;

  if v_discount > v_expected then
    raise exception 'Giảm trừ không được lớn hơn số tiền phải thu dự kiến.';
  end if;

  update public.short_finance_invoices
  set expected_amount_vnd = v_expected,
      discount_amount_vnd = v_discount,
      payable_amount_vnd = greatest(v_expected - v_discount, 0),
      due_date = coalesce(p_due_date, due_date),
      invoice_period = coalesce(nullif(trim(coalesce(p_invoice_period, '')), ''), invoice_period),
      finance_note = coalesce(nullif(trim(coalesce(p_note, '')), ''), finance_note),
      note = concat_ws(E'\n', nullif(note, ''), nullif(trim(coalesce(p_note, '')), '')),
      invoice_version = invoice_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_invoice_id;

  return target_invoice_id;
end;
$$;

create or replace function public.issue_short_finance_invoice(
  target_invoice_id uuid,
  p_issue_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ready record;
begin
  if not (
    public.can_manage_short_finance()
    or public.has_permission('short_course.finance.issue')
  ) then
    raise exception 'Bạn chưa có quyền phát hành công nợ ngắn hạn.';
  end if;

  perform public.refresh_short_finance_invoice_status(target_invoice_id);

  select *
  into v_ready
  from public.short_finance_invoice_readiness
  where invoice_id = target_invoice_id;

  if not found then
    raise exception 'Không tìm thấy công nợ cần phát hành.';
  end if;

  if not public.can_access_business_scope(v_ready.admission_segment_id, null::uuid) then
    raise exception 'Bạn không có phạm vi phát hành công nợ này.';
  end if;

  if v_ready.invoice_status <> 'DRAFT' then
    raise exception 'Chỉ công nợ DRAFT mới được phát hành. Trạng thái hiện tại: %.', v_ready.invoice_status;
  end if;

  if v_ready.readiness_status <> 'READY_TO_ISSUE' then
    raise exception 'Chưa thể phát hành công nợ. Trạng thái: %, lỗi: %',
      v_ready.readiness_status,
      array_to_string(v_ready.control_flags, ', ');
  end if;

  update public.short_finance_invoices
  set invoice_status = 'ISSUED',
      issued_by = auth.uid(),
      issued_at = now(),
      finance_note = concat_ws(E'\n', nullif(finance_note, ''), nullif(trim(coalesce(p_issue_note, '')), '')),
      invoice_version = invoice_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_invoice_id;

  update public.short_enrollments
  set finance_status = 'INVOICED',
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_ready.enrollment_id
    and finance_status in ('NOT_CREATED', 'INVOICED');

  return target_invoice_id;
end;
$$;

create or replace function public.lock_short_finance_invoice(
  target_invoice_id uuid,
  p_lock_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ready record;
begin
  if not (
    public.can_manage_short_finance()
    or public.has_permission('short_course.finance.lock')
  ) then
    raise exception 'Bạn chưa có quyền khóa công nợ ngắn hạn.';
  end if;

  perform public.refresh_short_finance_invoice_status(target_invoice_id);

  select *
  into v_ready
  from public.short_finance_invoice_readiness
  where invoice_id = target_invoice_id;

  if not found then
    raise exception 'Không tìm thấy công nợ cần khóa.';
  end if;

  if not public.can_access_business_scope(v_ready.admission_segment_id, null::uuid) then
    raise exception 'Bạn không có phạm vi khóa công nợ này.';
  end if;

  if v_ready.invoice_status not in ('ISSUED', 'PARTIAL_PAID') then
    raise exception 'Chỉ công nợ ISSUED/PARTIAL_PAID mới được khóa. Trạng thái hiện tại: %.', v_ready.invoice_status;
  end if;

  if v_ready.readiness_status not in ('READY_TO_LOCK', 'PARTIAL_PAID', 'OVERDUE') then
    raise exception 'Chưa thể khóa công nợ. Trạng thái: %, lỗi: %',
      v_ready.readiness_status,
      array_to_string(v_ready.control_flags, ', ');
  end if;

  update public.short_finance_invoices
  set invoice_status = 'LOCKED',
      invoice_locked = true,
      locked_by = auth.uid(),
      locked_at = now(),
      locked_reason = coalesce(nullif(trim(coalesce(p_lock_reason, '')), ''), 'Khóa công nợ sau khi đã phát hành và kiểm tra dữ liệu.'),
      invoice_version = invoice_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_invoice_id;

  return target_invoice_id;
end;
$$;

create or replace function public.cancel_short_finance_invoice(
  target_invoice_id uuid,
  p_cancel_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice public.short_finance_invoices%rowtype;
  v_verified_payments numeric(14,2);
begin
  if not (
    public.can_manage_short_finance()
    or public.has_permission('short_course.finance.cancel')
  ) then
    raise exception 'Bạn chưa có quyền hủy công nợ ngắn hạn.';
  end if;

  if nullif(trim(coalesce(p_cancel_reason, '')), '') is null then
    raise exception 'Hủy công nợ phải có lý do.';
  end if;

  select *
  into v_invoice
  from public.short_finance_invoices
  where id = target_invoice_id
  for update;

  if not found then
    raise exception 'Không tìm thấy công nợ cần hủy.';
  end if;

  if not exists (
    select 1
    from public.short_enrollments e
    where e.id = v_invoice.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  ) then
    raise exception 'Bạn không có phạm vi hủy công nợ này.';
  end if;

  if v_invoice.invoice_status in ('PAID', 'REFUNDED') then
    raise exception 'Công nợ đã PAID/REFUNDED, không hủy trực tiếp.';
  end if;

  select coalesce(sum(payment_amount_vnd), 0)::numeric(14,2)
  into v_verified_payments
  from public.short_payments
  where invoice_id = target_invoice_id
    and payment_status = 'VERIFIED'
    and record_status = 'ACTIVE'::public.record_status;

  if v_verified_payments > 0 then
    raise exception 'Công nợ đã có thanh toán VERIFIED nên không hủy trực tiếp.';
  end if;

  update public.short_finance_invoices
  set invoice_status = 'CANCELLED',
      invoice_locked = true,
      cancelled_by = auth.uid(),
      cancelled_at = now(),
      cancel_reason = trim(p_cancel_reason),
      locked_by = coalesce(locked_by, auth.uid()),
      locked_at = coalesce(locked_at, now()),
      locked_reason = coalesce(locked_reason, 'Hủy công nợ: ' || trim(p_cancel_reason)),
      finance_note = concat_ws(E'\n', nullif(finance_note, ''), 'Hủy: ' || trim(p_cancel_reason)),
      invoice_version = invoice_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_invoice_id;

  perform public.refresh_short_finance_invoice_status(target_invoice_id);

  return target_invoice_id;
end;
$$;

grant execute on function public.refresh_short_finance_invoice_status(uuid) to authenticated;
grant execute on function public.create_short_finance_invoice(uuid, text, numeric, numeric, date, uuid, text, text) to authenticated;
grant execute on function public.update_short_finance_invoice(uuid, numeric, numeric, date, text, text) to authenticated;
grant execute on function public.issue_short_finance_invoice(uuid, text) to authenticated;
grant execute on function public.lock_short_finance_invoice(uuid, text) to authenticated;
grant execute on function public.cancel_short_finance_invoice(uuid, text) to authenticated;

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
  (select coalesce(sum(balance_amount_vnd), 0)::numeric(14,2) from public.short_finance_invoice_readiness where readiness_status not in ('CANCELLED', 'REFUNDED')) as finance_open_balance_vnd;

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
    'SHORT_FINANCE_REQUIRES_READY_OFFERING',
    'Công nợ ngắn hạn phải theo ngành/khoá đã sẵn sàng tài chính',
    'FINANCE_CONTROL',
    'Không phát hành công nợ nếu offering chưa is_finance_ready hoặc ghi danh chưa có lớp/xác nhận gán lớp.',
    'BLOCK',
    'short_finance_invoices,admission_offering_catalog,short_enrollments',
    'P1-08 Short Finance Foundation',
    'KHTC',
    'IT_DATA',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_FINANCE_BHXH_SUPPORT_REQUIRES_APPROVED_POLICY',
    'Khoản BHXH/chính sách phải có hồ sơ đã duyệt',
    'FINANCE_CONTROL',
    'Không tạo/phát hành công nợ BHXH_SUPPORT nếu policy case chưa APPROVED hoặc số tiền vượt mức duyệt.',
    'BLOCK',
    'short_finance_invoices,short_bhxh_policy_cases',
    'P1-08 Short Finance Foundation',
    'KHTC + PHAP_CHE',
    'AUDIT',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_FINANCE_LOCKED_INVOICE_NOT_FREE_EDIT',
    'Công nợ đã khóa không sửa tự do',
    'FINANCE_CONTROL',
    'Sau khi công nợ được khóa hoặc đã có thanh toán VERIFIED, không sửa số tiền trực tiếp; cần quy trình điều chỉnh ở bước sau.',
    'BLOCK',
    'short_finance_invoices,short_payments',
    'P1-08 Short Finance Foundation',
    'KHTC + AUDIT',
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
  'WF_P1_08_SHORT_FINANCE_FOUNDATION',
  'P1-08 Công nợ/tài chính ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'Sau khi học viên có ghi danh/lớp hợp lệ hoặc hồ sơ chính sách đã duyệt.',
  'KHTC',
  'KHTC',
  'IT_DATA',
  'BGH',
  'Công nợ ngắn hạn được tạo, phát hành, khóa và sẵn sàng cho bước thu/đối soát thanh toán.',
  'Chỉ invoice ISSUED/LOCKED/PARTIAL_PAID mới chuyển sang P1-09 Payment; invoice DRAFT chưa dùng để thu chính thức.',
  'Mọi tạo/sửa/phát hành/khóa/hủy công nợ đều ghi audit log.',
  908,
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
  'APPROVE_P1_08_SHORT_FINANCE_INVOICE_LOCK',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_08_SHORT_FINANCE_FOUNDATION',
  'Khóa công nợ ngắn hạn',
  'DEPARTMENT',
  'KHTC',
  'IT_DATA',
  'BGH',
  'Công nợ có enrollment/lớp/offering hợp lệ, số tiền đúng, khoản BHXH_SUPPORT có policy case đã APPROVED nếu có.',
  'Không khóa nếu short_finance_invoice_readiness = BLOCKED/NEEDS_AMOUNT/NEEDS_FIX.',
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
    'SHORT_FINANCE_INVOICE',
    'Công nợ ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_finance_invoices',
    'TRANSACTION',
    'KHTC',
    'HEU_OS',
    'RESTRICTED',
    true,
    'P1-08: Tạo/sửa/phát hành/khóa/hủy công nợ qua function, không sửa tự do khi đã khóa hoặc có thanh toán.',
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_FINANCE_INVOICE_READINESS',
    'Tình trạng sẵn sàng công nợ ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_finance_invoice_readiness',
    'REPORT_VIEW',
    'KHTC + IT_DATA',
    'HEU_OS',
    'RESTRICTED',
    true,
    'View chỉ đọc để phát hiện công nợ thiếu số tiền, sai offering, sai hồ sơ chính sách hoặc lệch thanh toán.',
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
    'RISK_P1_08_FINANCE_WITHOUT_READY_OFFERING',
    'Ghi công nợ khi ngành/khoá chưa sẵn sàng tài chính',
    'M11_SHORT_COURSE_ERP',
    'FINANCE',
    'HIGH',
    'KHTC + IT_DATA',
    'Nếu tạo công nợ khi offering chưa finance_ready, học phí/công nợ có thể sai chính sách.',
    'Function tạo/phát hành công nợ kiểm is_finance_ready và readiness view cảnh báo OFFERING_NOT_FINANCE_READY.',
    'KHTC/IT_DATA rà soát finance_needs_fix_count hằng ngày.',
    'Số công nợ có flag OFFERING_NOT_FINANCE_READY.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_08_SUPPORT_WITHOUT_APPROVED_POLICY',
    'Ghi nhận tài chính chính sách khi hồ sơ chưa duyệt',
    'M11_SHORT_COURSE_ERP',
    'GOVERNANCE',
    'CRITICAL',
    'KHTC + PHAP_CHE',
    'Nếu ghi nhận BHXH_SUPPORT khi hồ sơ chính sách chưa duyệt, trường có rủi ro sai công nợ, sai báo cáo và sai thanh toán.',
    'Invoice BHXH_SUPPORT phải gắn policy_case_id APPROVED và không vượt approved_amount_vnd.',
    'BGH/KHTC kiểm tra công nợ có flag POLICY_NOT_APPROVED hoặc PAYABLE_GT_POLICY_APPROVED.',
    'Số công nợ BHXH_SUPPORT bị BLOCKED.',
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
    'short_finance_invoice_readiness',
    'Kiểm tra công nợ ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'REPORT_VIEW',
    'KHTC + IT_DATA',
    'View kiểm tra công nợ đủ điều kiện phát hành/khóa/thu hay chưa.',
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
    ('readiness_status', 'Trạng thái sẵn sàng công nợ', 'text', true, false, false, true, 'BLOCKED/NEEDS_AMOUNT/READY_TO_ISSUE/READY_TO_LOCK/LOCKED/PARTIAL_PAID/PAID/OVERDUE', 'Dùng cho dashboard và kiểm soát tài chính.'),
    ('control_flags', 'Cờ lỗi/kiểm soát công nợ', 'text[]', false, false, false, true, 'Danh sách lỗi chi tiết từng công nợ.', 'Chỗ nào sai thì chỉ đúng chỗ đó.'),
    ('payable_amount_vnd', 'Số tiền phải thu', 'numeric', true, false, true, true, 'expected_amount_vnd - discount_amount_vnd, không âm.', 'Dữ liệu nhạy cảm tài chính.'),
    ('balance_amount_vnd', 'Số tiền còn phải thu', 'numeric', true, false, true, true, 'payable_amount_vnd - paid_amount_vnd.', 'Nguồn cho P1-09 Payment.')
) as f(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, validation_rule, note)
where t.table_code = 'short_finance_invoice_readiness'
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
  'OWN_P1_08_SHORT_FINANCE_FOUNDATION',
  'P1-08 Công nợ/tài chính ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_08_SHORT_FINANCE_FOUNDATION',
  'WORKFLOW',
  'short_finance_invoices',
  'KHTC',
  'KHTC',
  'IT_DATA',
  'BGH',
  'RESTRICTED',
  'DAO_TAO + CTHSSV',
  'KHTC',
  'Enrollment/lớp/offering hợp lệ, số tiền hợp lệ, hồ sơ chính sách APPROVED nếu là BHXH_SUPPORT.',
  'Mọi tạo/sửa/phát hành/khóa/hủy công nợ phải ghi audit log.',
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
  'GATE_P1_08_SHORT_FINANCE_READY',
  'Gate P1-08: công nợ ngắn hạn đủ điều kiện thu',
  'FINANCE',
  'VIEW',
  'short_finance_invoice_readiness',
  'KHTC + IT_DATA',
  'IT_DATA kiểm tra công nợ không bị BLOCKED/NEEDS_AMOUNT/NEEDS_FIX trước khi thu.',
  'BGH/KHTC chỉ khóa công nợ khi readiness_status = READY_TO_LOCK/PARTIAL_PAID/OVERDUE.',
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
  'NAV_P1_08_SHORT_FINANCE_FOUNDATION',
  'P1-08 Công nợ ngắn hạn',
  'FINANCE',
  'M11_SHORT_COURSE_ERP',
  '/master-control/modules/M11_SHORT_COURSE_ERP',
  'Tạo, phát hành, khóa và kiểm soát công nợ ngắn hạn trước bước thanh toán.',
  'KHTC',
  'Kiểm tra readiness và phát hành/khóa công nợ',
  118,
  true,
  'Cảnh báo nếu short_finance_invoice_readiness có readiness_status = BLOCKED/NEEDS_AMOUNT/OVERDUE.',
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
