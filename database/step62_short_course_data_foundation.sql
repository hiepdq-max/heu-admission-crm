-- Step 62 - P1-01 Short Course Data Foundation.
-- Run after step61_admission_offering_catalog.sql.
--
-- Purpose:
-- - Build the operational data backbone for HEU short-course ERP.
-- - Keep short-course operation inside HEU OS, not as a separate app.
-- - Create the source-of-truth chain:
--   Lead -> Short Student -> Class -> Enrollment -> Attendance -> BHXH/Policy -> Finance -> Payment.
-- - Add governance/risk controls from day one. AI can read/warn later, not approve.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('short_course.read'),
    ('short_course.manage'),
    ('short_course.student.manage'),
    ('short_course.class.manage'),
    ('short_course.attendance.manage'),
    ('short_course.finance.read'),
    ('short_course.finance.manage'),
    ('short_course.payment.verify'),
    ('short_course.governance.manage')
) as p(permission)
where r.code in ('ADMIN', 'BGH', 'AUDIT')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('short_course.read'),
    ('short_course.student.manage'),
    ('short_course.class.manage'),
    ('short_course.attendance.manage')
) as p(permission)
where r.code in ('ADMISSION_HEAD', 'TEAM_LEAD', 'CTHSSV', 'CTHSSV_LEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('short_course.read'),
    ('short_course.attendance.manage')
) as p(permission)
where r.code in ('COUNSELOR', 'ADMISSION_STAFF')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('short_course.read'),
    ('short_course.finance.read'),
    ('short_course.finance.manage'),
    ('short_course.payment.verify')
) as p(permission)
where r.code in ('ACCOUNTING', 'ACCOUNTING_LEAD', 'KHTC')
on conflict (role_id, permission) do nothing;

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
    or public.has_permission('short_course.student.manage')
    or public.has_permission('short_course.class.manage')
    or public.has_permission('short_course.attendance.manage')
    or public.has_permission('short_course.finance.read')
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
    or public.has_permission('short_course.class.manage')
$$;

create or replace function public.can_manage_short_attendance()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('short_course.manage')
    or public.has_permission('short_course.attendance.manage')
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
    or public.has_permission('short_course.finance.manage')
    or public.has_permission('short_course.payment.verify')
$$;

grant execute on function public.can_read_short_course_erp() to authenticated;
grant execute on function public.can_manage_short_course_erp() to authenticated;
grant execute on function public.can_manage_short_attendance() to authenticated;
grant execute on function public.can_read_short_finance() to authenticated;
grant execute on function public.can_manage_short_finance() to authenticated;

create table if not exists public.short_student_master (
  id uuid primary key default gen_random_uuid(),
  student_code text not null unique,
  lead_id uuid unique references public.leads(id) on delete restrict,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  offering_id uuid references public.admission_offering_catalog(id) on delete restrict,
  student_name text not null,
  student_phone text,
  student_phone_norm text generated always as (
    nullif(regexp_replace(coalesce(student_phone, ''), '\D', '', 'g'), '')
  ) stored,
  student_dob date,
  student_gender text,
  identity_no text,
  identity_issued_on date,
  identity_issued_by text,
  parent_name text,
  parent_phone text,
  address_line text,
  province text,
  ward text,
  legacy_district text,
  source_status text not null default 'FROM_LEAD',
  student_status text not null default 'STAGING',
  data_locked boolean not null default false,
  locked_reason text,
  locked_by uuid references public.users_profile(id),
  locked_at timestamptz,
  note text,
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint short_student_source_status_valid check (
    source_status in ('FROM_LEAD', 'MANUAL', 'IMPORT', 'MIGRATION')
  ),
  constraint short_student_status_valid check (
    student_status in ('STAGING', 'ACTIVE', 'PAUSED', 'DROPPED', 'COMPLETED', 'ARCHIVED')
  )
);

create table if not exists public.short_class_master (
  id uuid primary key default gen_random_uuid(),
  class_code text not null unique,
  class_name text not null,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  offering_id uuid not null references public.admission_offering_catalog(id) on delete restrict,
  training_location text,
  instructor_name text,
  instructor_user_id uuid references public.users_profile(id),
  planned_start_date date,
  planned_end_date date,
  actual_start_date date,
  actual_end_date date,
  capacity int,
  schedule_note text,
  class_status text not null default 'PLANNED',
  data_locked boolean not null default false,
  locked_by uuid references public.users_profile(id),
  locked_at timestamptz,
  note text,
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint short_class_capacity_positive check (capacity is null or capacity > 0),
  constraint short_class_dates_valid check (
    planned_end_date is null or planned_start_date is null or planned_end_date >= planned_start_date
  ),
  constraint short_class_status_valid check (
    class_status in ('PLANNED', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ARCHIVED')
  )
);

create table if not exists public.short_enrollments (
  id uuid primary key default gen_random_uuid(),
  enrollment_code text not null unique,
  student_id uuid not null references public.short_student_master(id) on delete restrict,
  lead_id uuid references public.leads(id) on delete restrict,
  class_id uuid references public.short_class_master(id) on delete restrict,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  offering_id uuid not null references public.admission_offering_catalog(id) on delete restrict,
  enrolled_on date,
  enrollment_status text not null default 'DRAFT',
  attendance_status text not null default 'NOT_STARTED',
  finance_status text not null default 'NOT_CREATED',
  bhxh_policy_status text not null default 'NOT_APPLICABLE',
  evidence_status text not null default 'NOT_READY',
  handover_request_id uuid references public.approval_requests(id) on delete set null,
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint short_enrollment_status_valid check (
    enrollment_status in ('DRAFT', 'ENROLLED', 'STUDYING', 'PAUSED', 'DROPPED', 'COMPLETED', 'CANCELLED')
  ),
  constraint short_enrollment_attendance_status_valid check (
    attendance_status in ('NOT_STARTED', 'ACTIVE', 'AT_RISK', 'COMPLETED')
  ),
  constraint short_enrollment_finance_status_valid check (
    finance_status in ('NOT_CREATED', 'INVOICED', 'PARTIAL', 'PAID', 'REFUNDED', 'CANCELLED')
  ),
  constraint short_enrollment_bhxh_status_valid check (
    bhxh_policy_status in ('NOT_APPLICABLE', 'PENDING', 'ELIGIBLE', 'SUBMITTED', 'REJECTED', 'COMPLETED')
  ),
  constraint short_enrollment_evidence_status_valid check (
    evidence_status in ('NOT_READY', 'PARTIAL', 'READY', 'CHECKED', 'REJECTED')
  )
);

create table if not exists public.short_attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  session_code text not null unique,
  class_id uuid not null references public.short_class_master(id) on delete cascade,
  session_date date not null,
  start_time time,
  end_time time,
  session_title text,
  instructor_user_id uuid references public.users_profile(id),
  session_status text not null default 'PLANNED',
  attendance_locked boolean not null default false,
  locked_by uuid references public.users_profile(id),
  locked_at timestamptz,
  approval_request_id uuid references public.approval_requests(id) on delete set null,
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint short_attendance_session_time_valid check (
    end_time is null or start_time is null or end_time > start_time
  ),
  constraint short_attendance_session_status_valid check (
    session_status in ('PLANNED', 'OPEN', 'LOCKED', 'APPROVED', 'CANCELLED')
  )
);

create table if not exists public.short_attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.short_attendance_sessions(id) on delete cascade,
  enrollment_id uuid not null references public.short_enrollments(id) on delete cascade,
  student_id uuid not null references public.short_student_master(id) on delete restrict,
  attendance_status text not null default 'UNKNOWN',
  checked_by uuid references public.users_profile(id),
  checked_at timestamptz,
  evidence_url text,
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint short_attendance_record_unique unique (session_id, enrollment_id),
  constraint short_attendance_record_status_valid check (
    attendance_status in ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'ONLINE', 'UNKNOWN')
  )
);

create table if not exists public.short_bhxh_policy_cases (
  id uuid primary key default gen_random_uuid(),
  case_code text not null unique,
  enrollment_id uuid not null references public.short_enrollments(id) on delete restrict,
  student_id uuid not null references public.short_student_master(id) on delete restrict,
  class_id uuid references public.short_class_master(id) on delete restrict,
  policy_type text not null default 'UNEMPLOYMENT_SUPPORT',
  required_attendance_percent numeric(5,2),
  actual_attendance_percent numeric(5,2),
  requested_amount_vnd numeric(14,2),
  approved_amount_vnd numeric(14,2),
  eligibility_status text not null default 'PENDING',
  case_status text not null default 'DRAFT',
  evidence_url text,
  checked_by uuid references public.users_profile(id),
  checked_at timestamptz,
  approval_request_id uuid references public.approval_requests(id) on delete set null,
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint short_bhxh_attendance_percent_valid check (
    required_attendance_percent is null or (required_attendance_percent >= 0 and required_attendance_percent <= 100)
  ),
  constraint short_bhxh_actual_percent_valid check (
    actual_attendance_percent is null or (actual_attendance_percent >= 0 and actual_attendance_percent <= 100)
  ),
  constraint short_bhxh_amount_valid check (
    (requested_amount_vnd is null or requested_amount_vnd >= 0)
    and (approved_amount_vnd is null or approved_amount_vnd >= 0)
  ),
  constraint short_bhxh_policy_type_valid check (
    policy_type in ('UNEMPLOYMENT_SUPPORT', 'OTHER_SUPPORT', 'NOT_APPLICABLE')
  ),
  constraint short_bhxh_eligibility_status_valid check (
    eligibility_status in ('PENDING', 'ELIGIBLE', 'NOT_ELIGIBLE', 'NEEDS_FIX')
  ),
  constraint short_bhxh_case_status_valid check (
    case_status in ('DRAFT', 'PENDING_CHECK', 'CHECKED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED')
  )
);

create table if not exists public.short_finance_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_code text not null unique,
  enrollment_id uuid not null references public.short_enrollments(id) on delete restrict,
  student_id uuid not null references public.short_student_master(id) on delete restrict,
  class_id uuid references public.short_class_master(id) on delete restrict,
  offering_id uuid not null references public.admission_offering_catalog(id) on delete restrict,
  invoice_type text not null default 'TUITION',
  expected_amount_vnd numeric(14,2) not null default 0,
  discount_amount_vnd numeric(14,2) not null default 0,
  payable_amount_vnd numeric(14,2) not null default 0,
  paid_amount_vnd numeric(14,2) not null default 0,
  balance_amount_vnd numeric(14,2) generated always as (
    payable_amount_vnd - paid_amount_vnd
  ) stored,
  due_date date,
  invoice_status text not null default 'DRAFT',
  locked_by uuid references public.users_profile(id),
  locked_at timestamptz,
  approval_request_id uuid references public.approval_requests(id) on delete set null,
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint short_invoice_amount_valid check (
    expected_amount_vnd >= 0
    and discount_amount_vnd >= 0
    and payable_amount_vnd >= 0
    and paid_amount_vnd >= 0
  ),
  constraint short_invoice_type_valid check (
    invoice_type in ('TUITION', 'BHXH_SUPPORT', 'CERTIFICATE_FEE', 'OTHER')
  ),
  constraint short_invoice_status_valid check (
    invoice_status in ('DRAFT', 'ISSUED', 'PARTIAL_PAID', 'PAID', 'CANCELLED', 'REFUNDED', 'LOCKED')
  )
);

create table if not exists public.short_payments (
  id uuid primary key default gen_random_uuid(),
  payment_code text not null unique,
  invoice_id uuid not null references public.short_finance_invoices(id) on delete restrict,
  enrollment_id uuid not null references public.short_enrollments(id) on delete restrict,
  student_id uuid not null references public.short_student_master(id) on delete restrict,
  payment_amount_vnd numeric(14,2) not null,
  payment_date date not null default current_date,
  payment_method text not null default 'BANK_TRANSFER',
  voucher_no text,
  bank_ref text,
  payer_name text,
  payment_status text not null default 'PENDING',
  verified_by uuid references public.users_profile(id),
  verified_at timestamptz,
  approval_request_id uuid references public.approval_requests(id) on delete set null,
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint short_payment_amount_positive check (payment_amount_vnd > 0),
  constraint short_payment_method_valid check (
    payment_method in ('CASH', 'BANK_TRANSFER', 'POS', 'OFFSET', 'REFUND', 'OTHER')
  ),
  constraint short_payment_status_valid check (
    payment_status in ('PENDING', 'VERIFIED', 'REJECTED', 'REVERSED')
  )
);

create table if not exists public.short_governance_rules (
  id uuid primary key default gen_random_uuid(),
  rule_code text not null unique,
  rule_name text not null,
  rule_group text not null,
  rule_description text not null,
  enforcement_level text not null default 'WARN',
  source_table text not null,
  target_process text not null,
  owner_department text not null default 'DAO_TAO + KHTC + PHAP_CHE',
  checker_role text,
  approver_role text not null default 'BGH',
  ai_allowed boolean not null default true,
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint short_governance_enforcement_valid check (
    enforcement_level in ('INFO', 'WARN', 'BLOCK', 'APPROVAL_REQUIRED')
  ),
  constraint short_governance_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.short_risk_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_code text not null unique,
  alert_type text not null,
  alert_title text not null,
  entity_type text not null,
  entity_id uuid,
  entity_code text,
  severity text not null default 'MEDIUM',
  alert_status text not null default 'OPEN',
  detected_by text not null default 'SYSTEM',
  owner_department text not null default 'DAO_TAO + KHTC',
  assigned_to uuid references public.users_profile(id),
  due_at timestamptz,
  resolved_by uuid references public.users_profile(id),
  resolved_at timestamptz,
  resolution_note text,
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint short_risk_alert_severity_valid check (
    severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
  ),
  constraint short_risk_alert_status_valid check (
    alert_status in ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED')
  )
);

create index if not exists idx_short_student_master_segment
on public.short_student_master(admission_segment_id, student_status, status);

create index if not exists idx_short_student_master_phone
on public.short_student_master(student_phone_norm)
where student_phone_norm is not null;

create index if not exists idx_short_class_master_segment
on public.short_class_master(admission_segment_id, class_status, status);

create index if not exists idx_short_class_master_offering
on public.short_class_master(offering_id, class_status)
where status = 'ACTIVE';

create index if not exists idx_short_enrollments_student
on public.short_enrollments(student_id, enrollment_status)
where record_status = 'ACTIVE';

create index if not exists idx_short_enrollments_class
on public.short_enrollments(class_id, enrollment_status)
where record_status = 'ACTIVE';

create unique index if not exists uniq_short_active_student_class
on public.short_enrollments(student_id, class_id)
where record_status = 'ACTIVE'
  and class_id is not null
  and enrollment_status not in ('CANCELLED');

create index if not exists idx_short_attendance_sessions_class_date
on public.short_attendance_sessions(class_id, session_date)
where record_status = 'ACTIVE';

create unique index if not exists uniq_short_active_session_time
on public.short_attendance_sessions(class_id, session_date, start_time)
where record_status = 'ACTIVE';

create index if not exists idx_short_attendance_records_enrollment
on public.short_attendance_records(enrollment_id, attendance_status)
where record_status = 'ACTIVE';

create index if not exists idx_short_bhxh_cases_enrollment
on public.short_bhxh_policy_cases(enrollment_id, case_status)
where record_status = 'ACTIVE';

create index if not exists idx_short_finance_invoices_enrollment
on public.short_finance_invoices(enrollment_id, invoice_status)
where record_status = 'ACTIVE';

create index if not exists idx_short_payments_invoice
on public.short_payments(invoice_id, payment_status)
where record_status = 'ACTIVE';

create index if not exists idx_short_risk_alerts_status
on public.short_risk_alerts(alert_status, severity)
where record_status = 'ACTIVE';

alter table public.short_student_master enable row level security;
alter table public.short_class_master enable row level security;
alter table public.short_enrollments enable row level security;
alter table public.short_attendance_sessions enable row level security;
alter table public.short_attendance_records enable row level security;
alter table public.short_bhxh_policy_cases enable row level security;
alter table public.short_finance_invoices enable row level security;
alter table public.short_payments enable row level security;
alter table public.short_governance_rules enable row level security;
alter table public.short_risk_alerts enable row level security;

drop policy if exists "short_student_select_scope" on public.short_student_master;
create policy "short_student_select_scope"
on public.short_student_master for select
to authenticated
using (
  public.can_read_short_course_erp()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
);

drop policy if exists "short_student_manage_scope" on public.short_student_master;
create policy "short_student_manage_scope"
on public.short_student_master for all
to authenticated
using (
  public.can_manage_short_course_erp()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
)
with check (
  public.can_manage_short_course_erp()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
);

drop policy if exists "short_class_select_scope" on public.short_class_master;
create policy "short_class_select_scope"
on public.short_class_master for select
to authenticated
using (
  public.can_read_short_course_erp()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
);

drop policy if exists "short_class_manage_scope" on public.short_class_master;
create policy "short_class_manage_scope"
on public.short_class_master for all
to authenticated
using (
  public.can_manage_short_course_erp()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
)
with check (
  public.can_manage_short_course_erp()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
);

drop policy if exists "short_enrollment_select_scope" on public.short_enrollments;
create policy "short_enrollment_select_scope"
on public.short_enrollments for select
to authenticated
using (
  public.can_read_short_course_erp()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
);

drop policy if exists "short_enrollment_manage_scope" on public.short_enrollments;
create policy "short_enrollment_manage_scope"
on public.short_enrollments for all
to authenticated
using (
  public.can_manage_short_course_erp()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
)
with check (
  public.can_manage_short_course_erp()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
);

drop policy if exists "short_attendance_sessions_select_scope" on public.short_attendance_sessions;
create policy "short_attendance_sessions_select_scope"
on public.short_attendance_sessions for select
to authenticated
using (
  public.can_read_short_course_erp()
  and exists (
    select 1
    from public.short_class_master c
    where c.id = short_attendance_sessions.class_id
      and public.can_access_business_scope(c.admission_segment_id, null::uuid)
  )
);

drop policy if exists "short_attendance_sessions_manage_scope" on public.short_attendance_sessions;
create policy "short_attendance_sessions_manage_scope"
on public.short_attendance_sessions for all
to authenticated
using (
  public.can_manage_short_attendance()
  and exists (
    select 1
    from public.short_class_master c
    where c.id = short_attendance_sessions.class_id
      and public.can_access_business_scope(c.admission_segment_id, null::uuid)
  )
)
with check (
  public.can_manage_short_attendance()
  and exists (
    select 1
    from public.short_class_master c
    where c.id = short_attendance_sessions.class_id
      and public.can_access_business_scope(c.admission_segment_id, null::uuid)
  )
);

drop policy if exists "short_attendance_records_select_scope" on public.short_attendance_records;
create policy "short_attendance_records_select_scope"
on public.short_attendance_records for select
to authenticated
using (
  public.can_read_short_course_erp()
  and exists (
    select 1
    from public.short_enrollments e
    where e.id = short_attendance_records.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  )
);

drop policy if exists "short_attendance_records_manage_scope" on public.short_attendance_records;
create policy "short_attendance_records_manage_scope"
on public.short_attendance_records for all
to authenticated
using (
  public.can_manage_short_attendance()
  and exists (
    select 1
    from public.short_enrollments e
    where e.id = short_attendance_records.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  )
)
with check (
  public.can_manage_short_attendance()
  and exists (
    select 1
    from public.short_enrollments e
    where e.id = short_attendance_records.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  )
);

drop policy if exists "short_bhxh_cases_select_scope" on public.short_bhxh_policy_cases;
create policy "short_bhxh_cases_select_scope"
on public.short_bhxh_policy_cases for select
to authenticated
using (
  public.can_read_short_course_erp()
  and exists (
    select 1
    from public.short_enrollments e
    where e.id = short_bhxh_policy_cases.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  )
);

drop policy if exists "short_bhxh_cases_manage_scope" on public.short_bhxh_policy_cases;
create policy "short_bhxh_cases_manage_scope"
on public.short_bhxh_policy_cases for all
to authenticated
using (
  public.can_manage_short_course_erp()
  and exists (
    select 1
    from public.short_enrollments e
    where e.id = short_bhxh_policy_cases.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  )
)
with check (
  public.can_manage_short_course_erp()
  and exists (
    select 1
    from public.short_enrollments e
    where e.id = short_bhxh_policy_cases.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  )
);

drop policy if exists "short_invoices_select_finance_scope" on public.short_finance_invoices;
create policy "short_invoices_select_finance_scope"
on public.short_finance_invoices for select
to authenticated
using (
  (public.can_read_short_finance() or public.can_read_short_course_erp())
  and exists (
    select 1
    from public.short_enrollments e
    where e.id = short_finance_invoices.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  )
);

drop policy if exists "short_invoices_manage_finance_scope" on public.short_finance_invoices;
create policy "short_invoices_manage_finance_scope"
on public.short_finance_invoices for all
to authenticated
using (
  public.can_manage_short_finance()
  and exists (
    select 1
    from public.short_enrollments e
    where e.id = short_finance_invoices.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  )
)
with check (
  public.can_manage_short_finance()
  and exists (
    select 1
    from public.short_enrollments e
    where e.id = short_finance_invoices.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  )
);

drop policy if exists "short_payments_select_finance_scope" on public.short_payments;
create policy "short_payments_select_finance_scope"
on public.short_payments for select
to authenticated
using (
  (public.can_read_short_finance() or public.can_read_short_course_erp())
  and exists (
    select 1
    from public.short_enrollments e
    where e.id = short_payments.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  )
);

drop policy if exists "short_payments_manage_finance_scope" on public.short_payments;
create policy "short_payments_manage_finance_scope"
on public.short_payments for all
to authenticated
using (
  public.can_manage_short_finance()
  and exists (
    select 1
    from public.short_enrollments e
    where e.id = short_payments.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  )
)
with check (
  public.can_manage_short_finance()
  and exists (
    select 1
    from public.short_enrollments e
    where e.id = short_payments.enrollment_id
      and public.can_access_business_scope(e.admission_segment_id, null::uuid)
  )
);

drop policy if exists "short_governance_rules_select" on public.short_governance_rules;
create policy "short_governance_rules_select"
on public.short_governance_rules for select
to authenticated
using (public.can_read_short_course_erp() or public.can_read_master_control());

drop policy if exists "short_governance_rules_manage" on public.short_governance_rules;
create policy "short_governance_rules_manage"
on public.short_governance_rules for all
to authenticated
using (
  public.can_manage_master_control()
  or public.has_permission('short_course.governance.manage')
)
with check (
  public.can_manage_master_control()
  or public.has_permission('short_course.governance.manage')
);

drop policy if exists "short_risk_alerts_select" on public.short_risk_alerts;
create policy "short_risk_alerts_select"
on public.short_risk_alerts for select
to authenticated
using (public.can_read_short_course_erp() or public.can_read_master_control());

drop policy if exists "short_risk_alerts_manage" on public.short_risk_alerts;
create policy "short_risk_alerts_manage"
on public.short_risk_alerts for all
to authenticated
using (
  public.can_manage_short_course_erp()
  or public.can_manage_short_finance()
  or public.can_manage_master_control()
)
with check (
  public.can_manage_short_course_erp()
  or public.can_manage_short_finance()
  or public.can_manage_master_control()
);

grant select, insert, update, delete on
  public.short_student_master,
  public.short_class_master,
  public.short_enrollments,
  public.short_attendance_sessions,
  public.short_attendance_records,
  public.short_bhxh_policy_cases,
  public.short_finance_invoices,
  public.short_payments,
  public.short_governance_rules,
  public.short_risk_alerts
to authenticated;

drop trigger if exists trg_short_student_master_updated_at on public.short_student_master;
create trigger trg_short_student_master_updated_at
before update on public.short_student_master
for each row execute function public.set_updated_at();

drop trigger if exists trg_short_class_master_updated_at on public.short_class_master;
create trigger trg_short_class_master_updated_at
before update on public.short_class_master
for each row execute function public.set_updated_at();

drop trigger if exists trg_short_enrollments_updated_at on public.short_enrollments;
create trigger trg_short_enrollments_updated_at
before update on public.short_enrollments
for each row execute function public.set_updated_at();

drop trigger if exists trg_short_attendance_sessions_updated_at on public.short_attendance_sessions;
create trigger trg_short_attendance_sessions_updated_at
before update on public.short_attendance_sessions
for each row execute function public.set_updated_at();

drop trigger if exists trg_short_attendance_records_updated_at on public.short_attendance_records;
create trigger trg_short_attendance_records_updated_at
before update on public.short_attendance_records
for each row execute function public.set_updated_at();

drop trigger if exists trg_short_bhxh_policy_cases_updated_at on public.short_bhxh_policy_cases;
create trigger trg_short_bhxh_policy_cases_updated_at
before update on public.short_bhxh_policy_cases
for each row execute function public.set_updated_at();

drop trigger if exists trg_short_finance_invoices_updated_at on public.short_finance_invoices;
create trigger trg_short_finance_invoices_updated_at
before update on public.short_finance_invoices
for each row execute function public.set_updated_at();

drop trigger if exists trg_short_payments_updated_at on public.short_payments;
create trigger trg_short_payments_updated_at
before update on public.short_payments
for each row execute function public.set_updated_at();

drop trigger if exists trg_short_governance_rules_updated_at on public.short_governance_rules;
create trigger trg_short_governance_rules_updated_at
before update on public.short_governance_rules
for each row execute function public.set_updated_at();

drop trigger if exists trg_short_risk_alerts_updated_at on public.short_risk_alerts;
create trigger trg_short_risk_alerts_updated_at
before update on public.short_risk_alerts
for each row execute function public.set_updated_at();

drop trigger if exists trg_short_student_master_audit on public.short_student_master;
create trigger trg_short_student_master_audit
after insert or update or delete on public.short_student_master
for each row execute function public.write_audit_log();

drop trigger if exists trg_short_class_master_audit on public.short_class_master;
create trigger trg_short_class_master_audit
after insert or update or delete on public.short_class_master
for each row execute function public.write_audit_log();

drop trigger if exists trg_short_enrollments_audit on public.short_enrollments;
create trigger trg_short_enrollments_audit
after insert or update or delete on public.short_enrollments
for each row execute function public.write_audit_log();

drop trigger if exists trg_short_attendance_sessions_audit on public.short_attendance_sessions;
create trigger trg_short_attendance_sessions_audit
after insert or update or delete on public.short_attendance_sessions
for each row execute function public.write_audit_log();

drop trigger if exists trg_short_attendance_records_audit on public.short_attendance_records;
create trigger trg_short_attendance_records_audit
after insert or update or delete on public.short_attendance_records
for each row execute function public.write_audit_log();

drop trigger if exists trg_short_bhxh_policy_cases_audit on public.short_bhxh_policy_cases;
create trigger trg_short_bhxh_policy_cases_audit
after insert or update or delete on public.short_bhxh_policy_cases
for each row execute function public.write_audit_log();

drop trigger if exists trg_short_finance_invoices_audit on public.short_finance_invoices;
create trigger trg_short_finance_invoices_audit
after insert or update or delete on public.short_finance_invoices
for each row execute function public.write_audit_log();

drop trigger if exists trg_short_payments_audit on public.short_payments;
create trigger trg_short_payments_audit
after insert or update or delete on public.short_payments
for each row execute function public.write_audit_log();

drop trigger if exists trg_short_governance_rules_audit on public.short_governance_rules;
create trigger trg_short_governance_rules_audit
after insert or update or delete on public.short_governance_rules
for each row execute function public.write_audit_log();

drop trigger if exists trg_short_risk_alerts_audit on public.short_risk_alerts;
create trigger trg_short_risk_alerts_audit
after insert or update or delete on public.short_risk_alerts
for each row execute function public.write_audit_log();

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
  (select count(*)::int from public.short_risk_alerts where record_status = 'ACTIVE' and alert_status <> 'RESOLVED') as open_risk_count;

create or replace view public.short_course_enrollment_readiness
with (security_invoker = true)
as
select
  e.id,
  e.enrollment_code,
  e.student_id,
  s.student_code,
  s.student_name,
  e.class_id,
  c.class_code,
  c.class_name,
  e.admission_segment_id,
  seg.segment_code,
  seg.segment_name,
  e.offering_id,
  o.offering_code,
  o.offering_name,
  e.enrollment_status,
  e.attendance_status,
  e.finance_status,
  e.bhxh_policy_status,
  e.evidence_status,
  coalesce(attendance_stats.session_count, 0)::int as session_count,
  coalesce(attendance_stats.present_count, 0)::int as present_count,
  coalesce(invoice_stats.invoice_count, 0)::int as invoice_count,
  coalesce(invoice_stats.total_balance_vnd, 0)::numeric(14,2) as total_balance_vnd,
  array_remove(array[
    case when e.class_id is null then 'NO_CLASS' end,
    case when e.enrollment_status = 'DRAFT' then 'NOT_ENROLLED' end,
    case when coalesce(attendance_stats.session_count, 0) = 0 then 'NO_ATTENDANCE_SESSION' end,
    case when e.finance_status = 'NOT_CREATED' then 'NO_FINANCE_INVOICE' end,
    case when e.evidence_status in ('NOT_READY', 'REJECTED') then 'EVIDENCE_NOT_READY' end
  ], null) as control_flags,
  case
    when e.class_id is null then 'BLOCKED'
    when e.enrollment_status = 'DRAFT' then 'NEEDS_FIX'
    when e.evidence_status in ('NOT_READY', 'REJECTED') then 'NEEDS_FIX'
    else 'READY_TEMP'
  end as readiness_status
from public.short_enrollments e
join public.short_student_master s on s.id = e.student_id
left join public.short_class_master c on c.id = e.class_id
join public.admission_segments seg on seg.id = e.admission_segment_id
join public.admission_offering_catalog o on o.id = e.offering_id
left join lateral (
  select
    count(*) as session_count,
    count(*) filter (where ar.attendance_status in ('PRESENT', 'LATE', 'ONLINE')) as present_count
  from public.short_attendance_records ar
  where ar.enrollment_id = e.id
    and ar.record_status = 'ACTIVE'
) attendance_stats on true
left join lateral (
  select
    count(*) as invoice_count,
    coalesce(sum(i.balance_amount_vnd), 0) as total_balance_vnd
  from public.short_finance_invoices i
  where i.enrollment_id = e.id
    and i.record_status = 'ACTIVE'
) invoice_stats on true
where e.record_status = 'ACTIVE';

grant select on public.short_course_data_foundation_summary to authenticated;
grant select on public.short_course_enrollment_readiness to authenticated;

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
    'SHORT_ATTENDANCE_REQUIRED_FOR_BHXH',
    'CÃ³ Ä‘iá»ƒm danh má»›i xá»­ lÃ½ BHXH/chÃ­nh sÃ¡ch',
    'BHXH',
    'KhÃ´ng táº¡o há»“ sÆ¡ BHXH/chÃ­nh sÃ¡ch há»— trá»£ náº¿u lá»›p chÆ°a cÃ³ buá»•i há»c hoáº·c há»c viÃªn chÆ°a cÃ³ dá»¯ liá»‡u Ä‘iá»ƒm danh há»£p lá»‡.',
    'BLOCK',
    'short_attendance_records',
    'BHXH_POLICY_CASE',
    'DAO_TAO + KHTC',
    'KHTC + DAO_TAO',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_PAYMENT_REQUIRES_INVOICE_AND_APPROVAL',
    'Thanh toÃ¡n pháº£i cÃ³ phiáº¿u thu/cÃ´ng ná»£ vÃ  quyá»n xÃ¡c nháº­n',
    'FINANCE',
    'KhÃ´ng ghi nháº­n thanh toÃ¡n náº¿u chÆ°a cÃ³ invoice hoáº·c ngÆ°á»i xÃ¡c nháº­n khÃ´ng cÃ³ quyá»n tÃ i chÃ­nh.',
    'APPROVAL_REQUIRED',
    'short_finance_invoices',
    'SHORT_PAYMENT',
    'KHTC',
    'ACCOUNTING_LEAD',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_LOCKED_DATA_NO_DIRECT_EDIT',
    'Dá»¯ liá»‡u Ä‘Ã£ khÃ³a khÃ´ng sá»­a trá»±c tiáº¿p',
    'DATA_LOCK',
    'Há»c viÃªn, lá»›p, Ä‘iá»ƒm danh hoáº·c tÃ i chÃ­nh Ä‘Ã£ khÃ³a pháº£i má»Ÿ yÃªu cáº§u duyá»‡t trÆ°á»›c khi sá»­a.',
    'APPROVAL_REQUIRED',
    'short_student_master,short_class_master,short_attendance_sessions,short_finance_invoices',
    'DATA_CORRECTION',
    'IT_DATA + PHAP_CHE',
    'AUDIT + TRUONG_PHONG',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  )
on conflict (rule_code) do update set
  rule_name = excluded.rule_name,
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
  status = 'ACTIVE',
  updated_at = now();

insert into public.heu_os_modules (
  module_code,
  module_name,
  module_group,
  objective,
  owner_department,
  core_policy,
  ai_policy,
  sort_order,
  control_status
) values (
  'M11_SHORT_COURSE_ERP',
  'ERP ngáº¯n háº¡n',
  'CORE_OPERATION',
  'Quáº£n lÃ½ há»c viÃªn ngáº¯n háº¡n, lá»›p, Ä‘iá»ƒm danh, BHXH/chÃ­nh sÃ¡ch, cÃ´ng ná»£ vÃ  thanh toÃ¡n.',
  'DAO_TAO + TUYEN_SINH + CTHSSV + KHTC',
  'Student ID vÃ  Class ID lÃ  xÆ°Æ¡ng sá»‘ng; Ä‘iá»ƒm danh lÃ  nguá»“n dá»¯ liá»‡u gá»‘c; thanh toÃ¡n pháº£i qua governance.',
  'AI chá»‰ há»— trá»£ phÃ¡t hiá»‡n thiáº¿u Ä‘iá»ƒm danh, sai cÃ´ng ná»£, rá»§i ro BHXH/thanh toÃ¡n; khÃ´ng tá»± duyá»‡t.',
  110,
  'DAT_TAM_THOI'
) on conflict (module_code) do update set
  module_name = excluded.module_name,
  module_group = excluded.module_group,
  objective = excluded.objective,
  owner_department = excluded.owner_department,
  core_policy = excluded.core_policy,
  ai_policy = excluded.ai_policy,
  sort_order = excluded.sort_order,
  control_status = excluded.control_status,
  status = 'ACTIVE',
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
  'WF_P1_01_SHORT_DATA_FOUNDATION',
  'P1-01 XÆ°Æ¡ng sá»‘ng dá»¯ liá»‡u ERP ngáº¯n háº¡n',
  'M11_SHORT_COURSE_ERP',
  'Lead ngáº¯n háº¡n Ä‘á»§ Ä‘iá»u kiá»‡n hoáº·c lá»›p ngáº¯n háº¡n Ä‘Æ°á»£c má»Ÿ.',
  'TUYEN_SINH/DAO_TAO',
  'DAO_TAO + CTHSSV + KHTC + IT_DATA',
  'PHAP_CHE + KHTC + TRUONG_PHONG',
  'BGH',
  'CÃ³ báº£ng dá»¯ liá»‡u chuáº©n Ä‘á»ƒ váº­n hÃ nh Student, Class, Enrollment, Attendance, BHXH, Finance vÃ  Payment.',
  'Lead Ä‘á»§ Ä‘iá»u kiá»‡n chuyá»ƒn sang short_student_master; lá»›p dÃ¹ng short_class_master; tiá»n dÃ¹ng short_finance_invoices/short_payments.',
  'Má»i báº£ng P1-01 cÃ³ trigger audit; dá»¯ liá»‡u Ä‘Ã£ khÃ³a pháº£i má»Ÿ approval request trÆ°á»›c khi sá»­a.',
  601,
  'DAT_TAM_THOI'
) on conflict (workflow_code) do update set
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
) values
  (
    'APPROVE_SHORT_STUDENT_MASTER',
    'M11_SHORT_COURSE_ERP',
    'WF_P1_01_SHORT_DATA_FOUNDATION',
    'Duyá»‡t chuyá»ƒn lead ngáº¯n háº¡n thÃ nh há»c viÃªn',
    'DEPARTMENT',
    'TUYEN_SINH/CTHSSV',
    'TRUONG_PHONG_TUYEN_SINH + CTHSSV_LEAD',
    'BGH',
    'Lead ngáº¯n háº¡n, ngÃ nh/khoÃ¡, há»“ sÆ¡ tá»‘i thiá»ƒu vÃ  tráº¡ng thÃ¡i Ä‘á»§ Ä‘iá»u kiá»‡n.',
    'Cháº·n náº¿u lead khÃ´ng thuá»™c workspace ngáº¯n háº¡n, thiáº¿u offering hoáº·c trÃ¹ng student_code.',
    48,
    'DAT_TAM_THOI'
  ),
  (
    'APPROVE_SHORT_ATTENDANCE_LOCK',
    'M11_SHORT_COURSE_ERP',
    'WF_P1_01_SHORT_DATA_FOUNDATION',
    'Duyá»‡t khÃ³a Ä‘iá»ƒm danh lá»›p ngáº¯n háº¡n',
    'DEPARTMENT',
    'DAO_TAO',
    'DAO_TAO + CTHSSV',
    'BGH',
    'Danh sÃ¡ch buá»•i há»c, Ä‘iá»ƒm danh tá»«ng há»c viÃªn vÃ  minh chá»©ng náº¿u cÃ³.',
    'Cháº·n xá»­ lÃ½ BHXH/chÃ­nh sÃ¡ch náº¿u Ä‘iá»ƒm danh chÆ°a khÃ³a hoáº·c thiáº¿u dá»¯ liá»‡u.',
    24,
    'DAT_TAM_THOI'
  ),
  (
    'APPROVE_SHORT_PAYMENT_VERIFY',
    'M11_SHORT_COURSE_ERP',
    'WF_P1_01_SHORT_DATA_FOUNDATION',
    'Duyá»‡t xÃ¡c nháº­n thanh toÃ¡n ngáº¯n háº¡n',
    'FINANCE',
    'KHTC',
    'ACCOUNTING_LEAD',
    'BGH',
    'Invoice, chá»©ng tá»« thanh toÃ¡n, ngÆ°á»i ná»™p, sá»‘ tiá»n vÃ  Ä‘á»‘i soÃ¡t ngÃ¢n hÃ ng/quá»¹.',
    'Cháº·n náº¿u chÆ°a cÃ³ invoice, thiáº¿u chá»©ng tá»« hoáº·c user khÃ´ng cÃ³ quyá»n xÃ¡c nháº­n.',
    24,
    'DAT_TAM_THOI'
  )
on conflict (approval_code) do update set
  module_code = excluded.module_code,
  workflow_code = excluded.workflow_code,
  decision_name = excluded.decision_name,
  decision_level = excluded.decision_level,
  maker_role = excluded.maker_role,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  required_evidence = excluded.required_evidence,
  blocking_rule = excluded.blocking_rule,
  sla_hours = excluded.sla_hours,
  control_status = excluded.control_status,
  status = 'ACTIVE',
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
    'MD_P1_01_SHORT_STUDENT_MASTER',
    'Student Master ngáº¯n háº¡n',
    'M11_SHORT_COURSE_ERP',
    'short_student_master',
    'MASTER',
    'CTHSSV + DAO_TAO + IT_DATA',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'Student ID lÃ  Ä‘á»‹nh danh xuyÃªn há»‡ thá»‘ng; khÃ´ng sá»­a dá»¯ liá»‡u Ä‘Ã£ khÃ³a náº¿u chÆ°a cÃ³ approval.',
    'DAT_TAM_THOI'
  ),
  (
    'MD_P1_01_SHORT_CLASS_MASTER',
    'Class Master ngáº¯n háº¡n',
    'M11_SHORT_COURSE_ERP',
    'short_class_master',
    'MASTER',
    'DAO_TAO + IT_DATA',
    'HEU_OS',
    'INTERNAL',
    true,
    'Class ID lÃ  trung tÃ¢m cho Ä‘iá»ƒm danh, BHXH, tÃ i chÃ­nh vÃ  dashboard.',
    'DAT_TAM_THOI'
  ),
  (
    'MD_P1_01_SHORT_ENROLLMENT',
    'Ghi danh há»c viÃªn ngáº¯n háº¡n',
    'M11_SHORT_COURSE_ERP',
    'short_enrollments',
    'TRANSACTION',
    'DAO_TAO + CTHSSV',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'Enrollment ná»‘i Student, Class, Offering vÃ  tráº¡ng thÃ¡i tÃ i chÃ­nh/BHXH.',
    'DAT_TAM_THOI'
  ),
  (
    'MD_P1_01_SHORT_ATTENDANCE',
    'Äiá»ƒm danh ngáº¯n háº¡n',
    'M11_SHORT_COURSE_ERP',
    'short_attendance_sessions,short_attendance_records',
    'TRANSACTION',
    'DAO_TAO',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'Attendance lÃ  nguá»“n dá»¯ liá»‡u gá»‘c; khÃ´ng cÃ³ attendance thÃ¬ khÃ´ng xá»­ lÃ½ BHXH/chÃ­nh sÃ¡ch.',
    'DAT_TAM_THOI'
  ),
  (
    'MD_P1_01_SHORT_FINANCE_PAYMENT',
    'CÃ´ng ná»£ vÃ  thanh toÃ¡n ngáº¯n háº¡n',
    'M11_SHORT_COURSE_ERP',
    'short_finance_invoices,short_payments',
    'TRANSACTION',
    'KHTC',
    'HEU_OS',
    'RESTRICTED',
    true,
    'Thanh toÃ¡n pháº£i cÃ³ invoice, chá»©ng tá»« vÃ  ngÆ°á»i xÃ¡c nháº­n Ä‘Ãºng quyá»n.',
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
  status = 'ACTIVE',
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
    'RISK_P1_01_SHORT_STUDENT_DUPLICATE',
    'TrÃ¹ng há»c viÃªn ngáº¯n háº¡n',
    'M11_SHORT_COURSE_ERP',
    'DATA_QUALITY',
    'HIGH',
    'CTHSSV + IT_DATA',
    'Má»™t ngÆ°á»i há»c bá»‹ táº¡o nhiá»u Student ID lÃ m sai Ä‘iá»ƒm danh, cÃ´ng ná»£, BHXH vÃ  dashboard.',
    'Kiá»ƒm tra lead_id, sá»‘ Ä‘iá»‡n thoáº¡i, CCCD vÃ  student_code trÆ°á»›c khi chuyá»ƒn lead thÃ nh student.',
    'Náº¿u nghi trÃ¹ng pháº£i táº¡o risk alert vÃ  trÆ°á»Ÿng bá»™ pháº­n duyá»‡t xá»­ lÃ½ merge/sá»­a.',
    'Sá»‘ há»c viÃªn cÃ³ cÃ¹ng SÄT/CCCD; sá»‘ risk duplicate cÃ²n má»Ÿ.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_01_SHORT_ATTENDANCE_MISSING',
    'Thiáº¿u Ä‘iá»ƒm danh nhÆ°ng xá»­ lÃ½ BHXH/tÃ i chÃ­nh',
    'M11_SHORT_COURSE_ERP',
    'COMPLIANCE',
    'CRITICAL',
    'DAO_TAO + KHTC',
    'Náº¿u khÃ´ng cÃ³ Ä‘iá»ƒm danh mÃ  váº«n xá»­ lÃ½ BHXH/chÃ­nh sÃ¡ch hoáº·c thanh toÃ¡n liÃªn quan thÃ¬ sai nguá»“n dá»¯ liá»‡u gá»‘c.',
    'short_governance_rules cháº·n quy trÃ¬nh BHXH/chÃ­nh sÃ¡ch khi chÆ°a cÃ³ attendance há»£p lá»‡.',
    'BÃ¡o BGH/KHTC náº¿u phÃ¡t hiá»‡n há»“ sÆ¡ BHXH/chÃ­nh sÃ¡ch thiáº¿u attendance.',
    'Sá»‘ há»“ sÆ¡ BHXH/chÃ­nh sÃ¡ch thiáº¿u attendance; sá»‘ lá»›p chÆ°a khÃ³a Ä‘iá»ƒm danh.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_01_SHORT_PAYMENT_WITHOUT_APPROVAL',
    'Thanh toÃ¡n ngáº¯n háº¡n thiáº¿u chá»©ng tá»«/quyá»n duyá»‡t',
    'M11_SHORT_COURSE_ERP',
    'FINANCE_CONTROL',
    'CRITICAL',
    'KHTC',
    'Ghi nháº­n thanh toÃ¡n khi chÆ°a cÃ³ invoice/chá»©ng tá»«/ngÆ°á»i xÃ¡c nháº­n Ä‘Ãºng quyá»n lÃ m sai cÃ´ng ná»£ vÃ  káº¿ toÃ¡n.',
    'short_payments pháº£i gáº¯n invoice, sá»‘ tiá»n dÆ°Æ¡ng, chá»©ng tá»« náº¿u cÃ³ vÃ  verified_by Ä‘Ãºng quyá»n.',
    'Káº¿ toÃ¡n trÆ°á»Ÿng/BGH xá»­ lÃ½ náº¿u cÃ³ thanh toÃ¡n bá»‹ nghi sai.',
    'Sá»‘ payment PENDING/REJECTED; sá»‘ invoice cÃ²n balance.',
    'DAT_TAM_THOI'
  )
on conflict (risk_code) do update set
  risk_name = excluded.risk_name,
  module_code = excluded.module_code,
  risk_group = excluded.risk_group,
  severity = excluded.severity,
  owner_department = excluded.owner_department,
  risk_description = excluded.risk_description,
  control_rule = excluded.control_rule,
  escalation_rule = excluded.escalation_rule,
  dashboard_metric = excluded.dashboard_metric,
  control_status = excluded.control_status,
  status = 'ACTIVE',
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
  ('short_student_master', 'Student Master ngáº¯n háº¡n', 'M11_SHORT_COURSE_ERP', 'MASTER', 'CTHSSV + DAO_TAO', 'Äá»‹nh danh há»c viÃªn ngáº¯n háº¡n xuyÃªn há»‡ thá»‘ng.', 'CONFIDENTIAL', true, 'DAT_TAM_THOI'),
  ('short_class_master', 'Class Master ngáº¯n háº¡n', 'M11_SHORT_COURSE_ERP', 'MASTER', 'DAO_TAO', 'Quáº£n lÃ½ lá»›p, lá»‹ch, giáº£ng viÃªn, Ä‘á»‹a Ä‘iá»ƒm vÃ  tráº¡ng thÃ¡i lá»›p.', 'INTERNAL', true, 'DAT_TAM_THOI'),
  ('short_enrollments', 'Ghi danh ngáº¯n háº¡n', 'M11_SHORT_COURSE_ERP', 'TRANSACTION', 'DAO_TAO + CTHSSV', 'Ná»‘i há»c viÃªn vá»›i lá»›p/khoÃ¡ vÃ  tráº¡ng thÃ¡i váº­n hÃ nh.', 'CONFIDENTIAL', true, 'DAT_TAM_THOI'),
  ('short_attendance_sessions', 'Buá»•i Ä‘iá»ƒm danh ngáº¯n háº¡n', 'M11_SHORT_COURSE_ERP', 'TRANSACTION', 'DAO_TAO', 'Danh sÃ¡ch buá»•i há»c lÃ m gá»‘c cho attendance.', 'CONFIDENTIAL', true, 'DAT_TAM_THOI'),
  ('short_attendance_records', 'DÃ²ng Ä‘iá»ƒm danh ngáº¯n háº¡n', 'M11_SHORT_COURSE_ERP', 'TRANSACTION', 'DAO_TAO', 'Nguá»“n dá»¯ liá»‡u gá»‘c cho BHXH/chÃ­nh sÃ¡ch/cáº£nh bÃ¡o bá» há»c.', 'CONFIDENTIAL', true, 'DAT_TAM_THOI'),
  ('short_bhxh_policy_cases', 'Há»“ sÆ¡ BHXH/chÃ­nh sÃ¡ch ngáº¯n háº¡n', 'M11_SHORT_COURSE_ERP', 'TRANSACTION', 'KHTC + DAO_TAO', 'Theo dÃµi Ä‘iá»u kiá»‡n/chá»©ng tá»« chÃ­nh sÃ¡ch há»— trá»£ náº¿u cÃ³.', 'RESTRICTED', true, 'DAT_TAM_THOI'),
  ('short_finance_invoices', 'CÃ´ng ná»£ ngáº¯n háº¡n', 'M11_SHORT_COURSE_ERP', 'TRANSACTION', 'KHTC', 'Theo dÃµi pháº£i thu, giáº£m trá»«, Ä‘Ã£ thu vÃ  cÃ²n pháº£i thu.', 'RESTRICTED', true, 'DAT_TAM_THOI'),
  ('short_payments', 'Thanh toÃ¡n ngáº¯n háº¡n', 'M11_SHORT_COURSE_ERP', 'TRANSACTION', 'KHTC', 'Ghi nháº­n chá»©ng tá»« thanh toÃ¡n Ä‘Ã£/Ä‘ang xÃ¡c nháº­n.', 'RESTRICTED', true, 'DAT_TAM_THOI'),
  ('short_governance_rules', 'Rule governance ngáº¯n háº¡n', 'M11_SHORT_COURSE_ERP', 'CONFIG', 'PHAP_CHE + IT_DATA', 'Quy táº¯c cháº·n/cáº£nh bÃ¡o cho váº­n hÃ nh ngáº¯n háº¡n.', 'INTERNAL', true, 'DAT_TAM_THOI'),
  ('short_risk_alerts', 'Cáº£nh bÃ¡o rá»§i ro ngáº¯n háº¡n', 'M11_SHORT_COURSE_ERP', 'TRANSACTION', 'DAO_TAO + KHTC + AUDIT', 'Theo dÃµi cáº£nh bÃ¡o váº­n hÃ nh, tÃ i chÃ­nh, BHXH vÃ  dá»¯ liá»‡u.', 'INTERNAL', true, 'DAT_TAM_THOI')
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
  control_status,
  status
) values (
  'OWN_P1_01_SHORT_COURSE_DATA_FOUNDATION',
  'XÃ¢y xÆ°Æ¡ng sá»‘ng dá»¯ liá»‡u váº­n hÃ nh ngáº¯n háº¡n',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_01_SHORT_DATA_FOUNDATION',
  'DATA_FOUNDATION',
  'short_student_master,short_class_master,short_enrollments,short_attendance_records,short_finance_invoices,short_payments',
  'DAO_TAO + CTHSSV + KHTC + IT_DATA',
  'IT_DATA',
  'DAO_TAO + KHTC + PHAP_CHE',
  'BGH',
  'ROLE_AND_SCOPE',
  'TUYEN_SINH',
  'DAO_TAO + CTHSSV + KHTC',
  'Catalog P0-21, lead Ä‘á»§ Ä‘iá»u kiá»‡n, há»“ sÆ¡/lá»›p/há»c phÃ­/chá»©ng tá»« náº¿u cÃ³.',
  'Má»i báº£ng P1-01 cÃ³ audit trigger; dá»¯ liá»‡u Ä‘Ã£ khÃ³a khÃ´ng sá»­a trá»±c tiáº¿p.',
  72,
  'CRITICAL',
  'DAT_TAM_THOI',
  'ACTIVE'::public.record_status
) on conflict (ownership_code) do update set
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
  status = 'ACTIVE',
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
  'GATE_P1_01_SHORT_DATA_FOUNDATION_READY',
  'P1-01 XÆ°Æ¡ng sá»‘ng dá»¯ liá»‡u ngáº¯n háº¡n sáºµn sÃ ng',
  'DATA',
  'SHORT_COURSE_ERP',
  'P1_01_SHORT_DATA_FOUNDATION',
  'DAO_TAO + CTHSSV + KHTC + IT_DATA',
  'Kiá»ƒm tra Ä‘á»§ báº£ng, RLS, audit trigger, data dictionary, ownership vÃ  governance rule.',
  'BGH duyá»‡t trÆ°á»›c khi má»Ÿ P1-02 Lead -> Student tá»± Ä‘á»™ng hoáº·c AI agent can thiá»‡p.',
  'PENDING',
  'ACTIVE'::public.record_status
) on conflict (gate_code) do update set
  gate_name = excluded.gate_name,
  gate_type = excluded.gate_type,
  entity_type = excluded.entity_type,
  entity_code = excluded.entity_code,
  owner_department = excluded.owner_department,
  checker_note = excluded.checker_note,
  approver_note = excluded.approver_note,
  decision_status = excluded.decision_status,
  record_status = 'ACTIVE',
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
  'NAV_P1_01_SHORT_COURSE_ERP',
  'ERP ngáº¯n háº¡n',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/master-control/modules/M11_SHORT_COURSE_ERP',
  'XÆ°Æ¡ng sá»‘ng dá»¯ liá»‡u há»c viÃªn, lá»›p, Ä‘iá»ƒm danh, BHXH/chÃ­nh sÃ¡ch, cÃ´ng ná»£ vÃ  thanh toÃ¡n ngáº¯n háº¡n.',
  'DAO_TAO + CTHSSV + KHTC',
  'Xem readiness P1-01',
  212,
  true,
  'Cáº§n chÃº Ã½ náº¿u chÆ°a cÃ³ class/enrollment/attendance hoáº·c payment thiáº¿u invoice/approval.',
  'DAT_TAM_THOI'
) on conflict (node_code) do update set
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
  status = 'ACTIVE',
  updated_at = now();

