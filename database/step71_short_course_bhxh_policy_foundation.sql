-- P1-07: Short Course BHXH / Unemployment Support Foundation
-- Run after step70_short_course_attendance_foundation.sql.
-- Purpose:
-- - Use locked/approved attendance as the only source for policy eligibility.
-- - Track unemployment-support / BHXH policy cases for short-course learners.
-- - Block submit/approve if attendance is not locked, evidence is missing, or attendance is below threshold.
-- - Register P1-07 in Master Control / HEU OS Map.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('short_course.bhxh.read'),
    ('short_course.bhxh.create'),
    ('short_course.bhxh.check'),
    ('short_course.bhxh.submit'),
    ('short_course.bhxh.approve'),
    ('short_course.bhxh.reject')
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
    ('short_course.bhxh.read')
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
    'short_course.bhxh.read',
    'SHORT_COURSE',
    'Xem hồ sơ chính sách/BHXH ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC + CTHSSV + DAO_TAO',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    true,
    'Chỉ xem hồ sơ chính sách trong phạm vi lớp/đối tượng tuyển sinh được phân.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.bhxh.create',
    'SHORT_COURSE',
    'Tạo hồ sơ chính sách ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC + CTHSSV',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    false,
    true,
    'Tạo hồ sơ từ enrollment hợp lệ; điều kiện chính sách vẫn phải kiểm qua điểm danh đã khóa.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.bhxh.check',
    'SHORT_COURSE',
    'Kiểm hồ sơ chính sách ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC + IT_DATA',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    false,
    true,
    'Kiểm hồ sơ bằng dữ liệu điểm danh LOCKED/APPROVED và minh chứng chính sách.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.bhxh.submit',
    'SHORT_COURSE',
    'Nộp hồ sơ chính sách ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    false,
    true,
    'Chỉ nộp hồ sơ đã CHECKED, đủ minh chứng và đủ tỷ lệ chuyên cần.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.bhxh.approve',
    'SHORT_COURSE',
    'Duyệt hồ sơ chính sách ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'BGH + KHTC',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    true,
    'Không duyệt nếu chưa nộp, thiếu điểm danh khóa, thiếu minh chứng hoặc số tiền duyệt vượt đề nghị.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.bhxh.reject',
    'SHORT_COURSE',
    'Từ chối/hủy hồ sơ chính sách ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'KHTC + BGH',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    false,
    true,
    'Từ chối/hủy phải có lý do rõ ràng để truy vết pháp chế/kế toán.',
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
$$;

create or replace function public.can_read_short_bhxh_policy()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.can_read_short_course_erp()
    or public.has_permission('short_course.bhxh.read')
    or public.has_permission('short_course.bhxh.create')
    or public.has_permission('short_course.bhxh.check')
    or public.has_permission('short_course.bhxh.submit')
    or public.has_permission('short_course.bhxh.approve')
    or public.has_permission('short_course.bhxh.reject')
$$;

create or replace function public.can_manage_short_bhxh_policy()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.can_manage_short_course_erp()
    or public.has_permission('short_course.bhxh.create')
    or public.has_permission('short_course.bhxh.check')
    or public.has_permission('short_course.bhxh.submit')
    or public.has_permission('short_course.bhxh.approve')
    or public.has_permission('short_course.bhxh.reject')
$$;

grant execute on function public.can_read_short_course_erp() to authenticated;
grant execute on function public.can_manage_short_course_erp() to authenticated;
grant execute on function public.can_read_short_bhxh_policy() to authenticated;
grant execute on function public.can_manage_short_bhxh_policy() to authenticated;

create sequence if not exists public.short_bhxh_case_code_seq;

create or replace function public.next_short_bhxh_case_code()
returns text
language sql
security definer
set search_path = public
as $$
  select 'POL-' ||
    to_char(current_date, 'YYYY') ||
    '-' ||
    lpad(nextval('public.short_bhxh_case_code_seq')::text, 6, '0')
$$;

grant execute on function public.next_short_bhxh_case_code() to authenticated;

alter table public.short_bhxh_policy_cases
  add column if not exists policy_rule_code text,
  add column if not exists policy_period text,
  add column if not exists locked_session_count int not null default 0,
  add column if not exists attendance_snapshot jsonb,
  add column if not exists evidence_status text not null default 'NOT_READY',
  add column if not exists evidence_note text,
  add column if not exists eligibility_checked_by uuid references public.users_profile(id),
  add column if not exists eligibility_checked_at timestamptz,
  add column if not exists submitted_by uuid references public.users_profile(id),
  add column if not exists submitted_at timestamptz,
  add column if not exists approved_by uuid references public.users_profile(id),
  add column if not exists approved_at timestamptz,
  add column if not exists rejected_by uuid references public.users_profile(id),
  add column if not exists rejected_at timestamptz,
  add column if not exists rejection_reason text,
  add column if not exists cancelled_by uuid references public.users_profile(id),
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancel_reason text,
  add column if not exists review_note text,
  add column if not exists case_version int not null default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_bhxh_locked_session_count_valid'
      and conrelid = 'public.short_bhxh_policy_cases'::regclass
  ) then
    alter table public.short_bhxh_policy_cases
      add constraint short_bhxh_locked_session_count_valid
      check (locked_session_count >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_bhxh_evidence_status_valid'
      and conrelid = 'public.short_bhxh_policy_cases'::regclass
  ) then
    alter table public.short_bhxh_policy_cases
      add constraint short_bhxh_evidence_status_valid
      check (evidence_status in ('NOT_READY', 'PARTIAL', 'READY', 'CHECKED', 'REJECTED'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_bhxh_case_version_positive'
      and conrelid = 'public.short_bhxh_policy_cases'::regclass
  ) then
    alter table public.short_bhxh_policy_cases
      add constraint short_bhxh_case_version_positive
      check (case_version > 0);
  end if;
end $$;

update public.short_bhxh_policy_cases
set required_attendance_percent = coalesce(required_attendance_percent, 80),
    locked_session_count = greatest(coalesce(locked_session_count, 0), 0),
    evidence_status = case
      when evidence_status is not null then evidence_status
      when nullif(trim(coalesce(evidence_url, '')), '') is not null then 'READY'
      else 'NOT_READY'
    end,
    case_version = greatest(coalesce(case_version, 1), 1),
    updated_at = now()
where record_status = 'ACTIVE'::public.record_status;

create index if not exists idx_short_bhxh_cases_policy_status
on public.short_bhxh_policy_cases(policy_type, eligibility_status, case_status)
where record_status = 'ACTIVE';

create index if not exists idx_short_bhxh_cases_enrollment_policy
on public.short_bhxh_policy_cases(enrollment_id, policy_type, case_status)
where record_status = 'ACTIVE';

create index if not exists idx_short_bhxh_cases_evidence_status
on public.short_bhxh_policy_cases(evidence_status, case_status)
where record_status = 'ACTIVE';

create or replace view public.short_bhxh_policy_case_readiness
with (security_invoker = true)
as
with base as (
  select
    e.id as enrollment_id,
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
    e.assignment_status,
    e.attendance_status as enrollment_attendance_status,
    e.bhxh_policy_status,
    ats.locked_session_count,
    ats.present_count,
    ats.online_count,
    ats.late_count,
    ats.absent_count,
    ats.excused_count,
    ats.unknown_count,
    ats.attendance_percent,
    ats.attendance_risk_status,
    pc.id as case_id,
    pc.case_code,
    pc.policy_type,
    coalesce(pc.required_attendance_percent, 80)::numeric(5,2) as required_attendance_percent,
    pc.actual_attendance_percent,
    pc.requested_amount_vnd,
    pc.approved_amount_vnd,
    pc.eligibility_status,
    pc.case_status,
    pc.evidence_url,
    pc.evidence_status,
    pc.evidence_note,
    pc.checked_by,
    pc.checked_at,
    pc.eligibility_checked_by,
    pc.eligibility_checked_at,
    pc.submitted_by,
    pc.submitted_at,
    pc.approved_by,
    pc.approved_at,
    pc.rejected_by,
    pc.rejected_at,
    pc.rejection_reason,
    pc.cancelled_by,
    pc.cancelled_at,
    pc.cancel_reason,
    pc.policy_rule_code,
    pc.policy_period,
    pc.locked_session_count as case_locked_session_count,
    pc.attendance_snapshot,
    pc.review_note,
    pc.case_version,
    pc.record_status as case_record_status,
    pc.created_at as case_created_at,
    pc.updated_at as case_updated_at
  from public.short_enrollments e
  join public.short_student_master s on s.id = e.student_id
  left join public.short_class_master c on c.id = e.class_id
  join public.admission_segments seg on seg.id = e.admission_segment_id
  join public.admission_offering_catalog o on o.id = e.offering_id
  left join public.short_attendance_enrollment_summary ats on ats.enrollment_id = e.id
  left join lateral (
    select pc_latest.*
    from public.short_bhxh_policy_cases pc_latest
    where pc_latest.enrollment_id = e.id
      and pc_latest.record_status = 'ACTIVE'::public.record_status
    order by pc_latest.created_at desc, pc_latest.id desc
    limit 1
  ) pc on true
  where e.record_status = 'ACTIVE'::public.record_status
),
evaluated as (
  select
    b.*,
    array_remove(array[
      case when b.case_id is null then 'NO_POLICY_CASE' end,
      case when b.class_id is null then 'NO_CLASS' end,
      case when b.enrollment_status not in ('STUDYING', 'COMPLETED') then 'ENROLLMENT_NOT_STUDYING' end,
      case when b.assignment_status <> 'VERIFIED' then 'ASSIGNMENT_NOT_VERIFIED' end,
      case when coalesce(b.policy_type, 'UNEMPLOYMENT_SUPPORT') = 'UNEMPLOYMENT_SUPPORT'
             and b.segment_code <> 'SHORT_UNEMPLOYMENT_SUPPORT'
        then 'NOT_UNEMPLOYMENT_SUPPORT_SEGMENT' end,
      case when b.case_id is not null and coalesce(b.locked_session_count, 0) = 0 then 'NO_LOCKED_ATTENDANCE' end,
      case when b.case_id is not null
             and b.attendance_percent is not null
             and b.attendance_percent < b.required_attendance_percent
        then 'ATTENDANCE_BELOW_REQUIRED' end,
      case when b.case_id is not null and b.attendance_percent is null then 'NO_ATTENDANCE_PERCENT' end,
      case when b.case_id is not null and nullif(trim(coalesce(b.evidence_url, '')), '') is null then 'NO_EVIDENCE' end,
      case when b.case_id is not null and b.evidence_status = 'REJECTED' then 'EVIDENCE_REJECTED' end,
      case when b.case_id is not null and b.requested_amount_vnd is null then 'NO_REQUESTED_AMOUNT' end,
      case when b.case_id is not null
             and b.approved_amount_vnd is not null
             and b.requested_amount_vnd is not null
             and b.approved_amount_vnd > b.requested_amount_vnd
        then 'APPROVED_GT_REQUESTED' end,
      case when b.case_id is not null and b.case_status = 'CANCELLED' then 'CASE_CANCELLED' end
    ]::text[], null) as control_flags
  from base b
)
select
  e.*,
  case
    when e.case_id is null and e.segment_code <> 'SHORT_UNEMPLOYMENT_SUPPORT' then 'NOT_APPLICABLE'
    when e.case_id is null then 'NO_CASE'
    when e.case_status in ('PAID', 'APPROVED', 'REJECTED', 'CANCELLED') then e.case_status
    when 'NOT_UNEMPLOYMENT_SUPPORT_SEGMENT' = any(e.control_flags) then 'BLOCKED'
    when e.control_flags && array[
      'NO_CLASS',
      'ENROLLMENT_NOT_STUDYING',
      'ASSIGNMENT_NOT_VERIFIED',
      'NO_LOCKED_ATTENDANCE',
      'NO_ATTENDANCE_PERCENT',
      'APPROVED_GT_REQUESTED'
    ]::text[] then 'BLOCKED'
    when 'ATTENDANCE_BELOW_REQUIRED' = any(e.control_flags) then 'NOT_ELIGIBLE'
    when 'EVIDENCE_REJECTED' = any(e.control_flags) then 'NEEDS_FIX'
    when 'NO_EVIDENCE' = any(e.control_flags) then 'NEEDS_EVIDENCE'
    when e.case_status in ('DRAFT', 'PENDING_CHECK') then 'READY_TO_CHECK'
    when e.case_status = 'CHECKED' and not ('NO_REQUESTED_AMOUNT' = any(e.control_flags)) then 'READY_TO_SUBMIT'
    when e.case_status = 'CHECKED' then 'NEEDS_AMOUNT'
    when e.case_status = 'SUBMITTED' then 'SUBMITTED_READY_APPROVAL'
    else 'NEEDS_FIX'
  end as readiness_status
from evaluated e;

grant select on public.short_bhxh_policy_case_readiness to authenticated;

create or replace function public.evaluate_short_bhxh_policy_case(target_case_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case public.short_bhxh_policy_cases%rowtype;
  v_attendance record;
  v_required numeric(5,2);
  v_actual numeric(5,2);
  v_locked_count int;
  v_eligibility text;
begin
  if not public.can_read_short_bhxh_policy() then
    raise exception 'Bạn chưa có quyền kiểm tra hồ sơ chính sách ngắn hạn.';
  end if;

  select *
  into v_case
  from public.short_bhxh_policy_cases
  where id = target_case_id
  for update;

  if not found then
    raise exception 'Không tìm thấy hồ sơ chính sách.';
  end if;

  select *
  into v_attendance
  from public.short_attendance_enrollment_summary
  where enrollment_id = v_case.enrollment_id;

  if not found then
    raise exception 'Không tìm thấy dữ liệu chuyên cần của học viên.';
  end if;

  v_required := coalesce(v_case.required_attendance_percent, 80);
  v_actual := v_attendance.attendance_percent;
  v_locked_count := coalesce(v_attendance.locked_session_count, 0);

  v_eligibility := case
    when v_case.policy_type = 'NOT_APPLICABLE' then 'NOT_ELIGIBLE'
    when v_locked_count = 0 or v_actual is null then 'NEEDS_FIX'
    when v_actual >= v_required then 'ELIGIBLE'
    else 'NOT_ELIGIBLE'
  end;

  update public.short_bhxh_policy_cases
  set required_attendance_percent = v_required,
      actual_attendance_percent = v_actual,
      locked_session_count = v_locked_count,
      eligibility_status = v_eligibility,
      evidence_status = case
        when evidence_status in ('CHECKED', 'REJECTED') then evidence_status
        when nullif(trim(coalesce(evidence_url, '')), '') is not null then 'READY'
        else 'NOT_READY'
      end,
      attendance_snapshot = jsonb_build_object(
        'locked_session_count', v_attendance.locked_session_count,
        'present_count', v_attendance.present_count,
        'online_count', v_attendance.online_count,
        'late_count', v_attendance.late_count,
        'absent_count', v_attendance.absent_count,
        'excused_count', v_attendance.excused_count,
        'unknown_count', v_attendance.unknown_count,
        'attendance_percent', v_attendance.attendance_percent,
        'evaluated_at', now()
      ),
      case_version = case_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_case_id;

  update public.short_enrollments
  set bhxh_policy_status = case
        when v_eligibility = 'ELIGIBLE' then 'ELIGIBLE'
        when v_eligibility = 'NOT_ELIGIBLE' then 'REJECTED'
        when v_eligibility = 'NEEDS_FIX' then 'PENDING'
        else bhxh_policy_status
      end,
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_case.enrollment_id
    and bhxh_policy_status <> 'COMPLETED';

  return target_case_id;
end;
$$;

create or replace function public.create_short_bhxh_policy_case(
  target_enrollment_id uuid,
  p_policy_type text default 'UNEMPLOYMENT_SUPPORT',
  p_required_attendance_percent numeric default 80,
  p_requested_amount_vnd numeric default null,
  p_evidence_url text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment public.short_enrollments%rowtype;
  v_segment_code text;
  v_case_id uuid;
  v_existing_case_id uuid;
begin
  if not (
    public.can_manage_short_bhxh_policy()
    or public.has_permission('short_course.bhxh.create')
  ) then
    raise exception 'Bạn chưa có quyền tạo hồ sơ chính sách ngắn hạn.';
  end if;

  if coalesce(p_policy_type, 'UNEMPLOYMENT_SUPPORT') not in ('UNEMPLOYMENT_SUPPORT', 'OTHER_SUPPORT', 'NOT_APPLICABLE') then
    raise exception 'Loại chính sách không hợp lệ.';
  end if;

  if p_required_attendance_percent is not null
     and (p_required_attendance_percent < 0 or p_required_attendance_percent > 100) then
    raise exception 'Tỷ lệ chuyên cần yêu cầu phải từ 0 đến 100.';
  end if;

  if p_requested_amount_vnd is not null and p_requested_amount_vnd < 0 then
    raise exception 'Số tiền đề nghị không được âm.';
  end if;

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

  select segment_code
  into v_segment_code
  from public.admission_segments
  where id = v_enrollment.admission_segment_id;

  if coalesce(p_policy_type, 'UNEMPLOYMENT_SUPPORT') = 'UNEMPLOYMENT_SUPPORT'
     and v_segment_code <> 'SHORT_UNEMPLOYMENT_SUPPORT' then
    raise exception 'Chỉ đối tượng ngắn hạn theo trợ cấp thất nghiệp mới tạo hồ sơ UNEMPLOYMENT_SUPPORT.';
  end if;

  if v_enrollment.class_id is null
     or v_enrollment.assignment_status <> 'VERIFIED'
     or v_enrollment.enrollment_status not in ('STUDYING', 'COMPLETED') then
    raise exception 'Ghi danh chưa đủ điều kiện tạo hồ sơ chính sách: cần có lớp, đã xác nhận gán lớp và đã học/đang học.';
  end if;

  select id
  into v_existing_case_id
  from public.short_bhxh_policy_cases
  where enrollment_id = target_enrollment_id
    and policy_type = coalesce(p_policy_type, 'UNEMPLOYMENT_SUPPORT')
    and record_status = 'ACTIVE'::public.record_status
    and case_status <> 'CANCELLED'
  order by created_at desc
  limit 1;

  if v_existing_case_id is not null then
    raise exception 'Ghi danh này đã có hồ sơ chính sách cùng loại còn hiệu lực.';
  end if;

  insert into public.short_bhxh_policy_cases (
    case_code,
    enrollment_id,
    student_id,
    class_id,
    policy_type,
    required_attendance_percent,
    requested_amount_vnd,
    eligibility_status,
    case_status,
    evidence_url,
    evidence_status,
    note,
    record_status,
    created_by,
    updated_by
  ) values (
    public.next_short_bhxh_case_code(),
    v_enrollment.id,
    v_enrollment.student_id,
    v_enrollment.class_id,
    coalesce(p_policy_type, 'UNEMPLOYMENT_SUPPORT'),
    coalesce(p_required_attendance_percent, 80),
    p_requested_amount_vnd,
    'PENDING',
    'DRAFT',
    nullif(trim(coalesce(p_evidence_url, '')), ''),
    case
      when nullif(trim(coalesce(p_evidence_url, '')), '') is not null then 'READY'
      else 'NOT_READY'
    end,
    nullif(trim(coalesce(p_note, '')), ''),
    'ACTIVE'::public.record_status,
    auth.uid(),
    auth.uid()
  )
  returning id into v_case_id;

  update public.short_enrollments
  set bhxh_policy_status = 'PENDING',
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_enrollment.id;

  perform public.evaluate_short_bhxh_policy_case(v_case_id);

  return v_case_id;
end;
$$;

create or replace function public.check_short_bhxh_policy_case(
  target_case_id uuid,
  p_evidence_url text default null,
  p_review_note text default null
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
    public.can_manage_short_bhxh_policy()
    or public.has_permission('short_course.bhxh.check')
  ) then
    raise exception 'Bạn chưa có quyền kiểm hồ sơ chính sách.';
  end if;

  if nullif(trim(coalesce(p_evidence_url, '')), '') is not null then
    update public.short_bhxh_policy_cases
    set evidence_url = trim(p_evidence_url),
        evidence_status = 'READY',
        updated_by = auth.uid(),
        updated_at = now()
    where id = target_case_id;
  end if;

  perform public.evaluate_short_bhxh_policy_case(target_case_id);

  select *
  into v_ready
  from public.short_bhxh_policy_case_readiness
  where case_id = target_case_id;

  if not found then
    raise exception 'Không tìm thấy hồ sơ chính sách cần kiểm.';
  end if;

  if v_ready.readiness_status in ('BLOCKED', 'NOT_ELIGIBLE', 'NEEDS_EVIDENCE', 'NEEDS_FIX') then
    raise exception 'Chưa thể kiểm đạt hồ sơ. Trạng thái: %, lỗi: %',
      v_ready.readiness_status,
      array_to_string(v_ready.control_flags, ', ');
  end if;

  update public.short_bhxh_policy_cases
  set eligibility_status = 'ELIGIBLE',
      case_status = 'CHECKED',
      checked_by = auth.uid(),
      checked_at = now(),
      eligibility_checked_by = auth.uid(),
      eligibility_checked_at = now(),
      evidence_status = 'CHECKED',
      review_note = nullif(trim(coalesce(p_review_note, review_note, '')), ''),
      case_version = case_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_case_id;

  update public.short_enrollments
  set bhxh_policy_status = 'ELIGIBLE',
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_ready.enrollment_id;

  return target_case_id;
end;
$$;

create or replace function public.submit_short_bhxh_policy_case(
  target_case_id uuid,
  p_requested_amount_vnd numeric default null,
  p_submit_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ready record;
  v_requested numeric(14,2);
begin
  if not (
    public.can_manage_short_bhxh_policy()
    or public.has_permission('short_course.bhxh.submit')
  ) then
    raise exception 'Bạn chưa có quyền nộp hồ sơ chính sách.';
  end if;

  if p_requested_amount_vnd is not null and p_requested_amount_vnd < 0 then
    raise exception 'Số tiền đề nghị không được âm.';
  end if;

  if p_requested_amount_vnd is not null then
    update public.short_bhxh_policy_cases
    set requested_amount_vnd = p_requested_amount_vnd,
        updated_by = auth.uid(),
        updated_at = now()
    where id = target_case_id;
  end if;

  perform public.evaluate_short_bhxh_policy_case(target_case_id);

  select *
  into v_ready
  from public.short_bhxh_policy_case_readiness
  where case_id = target_case_id;

  if not found then
    raise exception 'Không tìm thấy hồ sơ chính sách cần nộp.';
  end if;

  if v_ready.case_status <> 'CHECKED' then
    raise exception 'Chỉ hồ sơ đã CHECKED mới được nộp. Trạng thái hiện tại: %.', v_ready.case_status;
  end if;

  v_requested := coalesce(p_requested_amount_vnd, v_ready.requested_amount_vnd);

  if v_requested is null or v_requested < 0 then
    raise exception 'Nộp hồ sơ chính sách cần có số tiền đề nghị hợp lệ.';
  end if;

  if v_ready.readiness_status not in ('READY_TO_SUBMIT', 'NEEDS_AMOUNT') then
    raise exception 'Chưa thể nộp hồ sơ. Trạng thái: %, lỗi: %',
      v_ready.readiness_status,
      array_to_string(v_ready.control_flags, ', ');
  end if;

  update public.short_bhxh_policy_cases
  set case_status = 'SUBMITTED',
      requested_amount_vnd = v_requested,
      submitted_by = auth.uid(),
      submitted_at = now(),
      review_note = concat_ws(E'\n', nullif(review_note, ''), nullif(trim(coalesce(p_submit_note, '')), '')),
      case_version = case_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_case_id;

  update public.short_enrollments
  set bhxh_policy_status = 'SUBMITTED',
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_ready.enrollment_id;

  return target_case_id;
end;
$$;

create or replace function public.approve_short_bhxh_policy_case(
  target_case_id uuid,
  p_approved_amount_vnd numeric default null,
  p_approval_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ready record;
  v_approved numeric(14,2);
begin
  if not (
    public.can_manage_short_bhxh_policy()
    or public.has_permission('short_course.bhxh.approve')
  ) then
    raise exception 'Bạn chưa có quyền duyệt hồ sơ chính sách.';
  end if;

  if p_approved_amount_vnd is not null and p_approved_amount_vnd < 0 then
    raise exception 'Số tiền duyệt không được âm.';
  end if;

  perform public.evaluate_short_bhxh_policy_case(target_case_id);

  select *
  into v_ready
  from public.short_bhxh_policy_case_readiness
  where case_id = target_case_id;

  if not found then
    raise exception 'Không tìm thấy hồ sơ chính sách cần duyệt.';
  end if;

  if v_ready.case_status <> 'SUBMITTED' then
    raise exception 'Chỉ hồ sơ đã SUBMITTED mới được duyệt. Trạng thái hiện tại: %.', v_ready.case_status;
  end if;

  if v_ready.readiness_status <> 'SUBMITTED_READY_APPROVAL' then
    raise exception 'Chưa thể duyệt hồ sơ. Trạng thái: %, lỗi: %',
      v_ready.readiness_status,
      array_to_string(v_ready.control_flags, ', ');
  end if;

  v_approved := coalesce(p_approved_amount_vnd, v_ready.requested_amount_vnd);

  if v_approved is null or v_approved < 0 then
    raise exception 'Duyệt hồ sơ cần có số tiền duyệt hợp lệ.';
  end if;

  if v_ready.requested_amount_vnd is not null and v_approved > v_ready.requested_amount_vnd then
    raise exception 'Số tiền duyệt không được vượt số tiền đề nghị.';
  end if;

  update public.short_bhxh_policy_cases
  set case_status = 'APPROVED',
      eligibility_status = 'ELIGIBLE',
      approved_amount_vnd = v_approved,
      approved_by = auth.uid(),
      approved_at = now(),
      review_note = concat_ws(E'\n', nullif(review_note, ''), nullif(trim(coalesce(p_approval_note, '')), '')),
      case_version = case_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_case_id;

  update public.short_enrollments
  set bhxh_policy_status = 'COMPLETED',
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_ready.enrollment_id;

  return target_case_id;
end;
$$;

create or replace function public.reject_short_bhxh_policy_case(
  target_case_id uuid,
  p_rejection_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case public.short_bhxh_policy_cases%rowtype;
begin
  if not (
    public.can_manage_short_bhxh_policy()
    or public.has_permission('short_course.bhxh.reject')
  ) then
    raise exception 'Bạn chưa có quyền từ chối hồ sơ chính sách.';
  end if;

  if nullif(trim(coalesce(p_rejection_reason, '')), '') is null then
    raise exception 'Từ chối hồ sơ phải có lý do.';
  end if;

  select *
  into v_case
  from public.short_bhxh_policy_cases
  where id = target_case_id
  for update;

  if not found then
    raise exception 'Không tìm thấy hồ sơ chính sách cần từ chối.';
  end if;

  if v_case.case_status in ('APPROVED', 'PAID') then
    raise exception 'Hồ sơ đã APPROVED/PAID, không được từ chối trực tiếp.';
  end if;

  update public.short_bhxh_policy_cases
  set case_status = 'REJECTED',
      eligibility_status = 'NOT_ELIGIBLE',
      evidence_status = case
        when nullif(trim(coalesce(evidence_url, '')), '') is null then 'NOT_READY'
        else evidence_status
      end,
      rejected_by = auth.uid(),
      rejected_at = now(),
      rejection_reason = trim(p_rejection_reason),
      review_note = concat_ws(E'\n', nullif(review_note, ''), 'Từ chối: ' || trim(p_rejection_reason)),
      case_version = case_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_case_id;

  update public.short_enrollments
  set bhxh_policy_status = 'REJECTED',
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_case.enrollment_id;

  return target_case_id;
end;
$$;

create or replace function public.cancel_short_bhxh_policy_case(
  target_case_id uuid,
  p_cancel_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case public.short_bhxh_policy_cases%rowtype;
begin
  if not (
    public.can_manage_short_bhxh_policy()
    or public.has_permission('short_course.bhxh.reject')
  ) then
    raise exception 'Bạn chưa có quyền hủy hồ sơ chính sách.';
  end if;

  if nullif(trim(coalesce(p_cancel_reason, '')), '') is null then
    raise exception 'Hủy hồ sơ phải có lý do.';
  end if;

  select *
  into v_case
  from public.short_bhxh_policy_cases
  where id = target_case_id
  for update;

  if not found then
    raise exception 'Không tìm thấy hồ sơ chính sách cần hủy.';
  end if;

  if v_case.case_status in ('APPROVED', 'PAID') then
    raise exception 'Hồ sơ đã APPROVED/PAID, không được hủy trực tiếp.';
  end if;

  update public.short_bhxh_policy_cases
  set case_status = 'CANCELLED',
      cancelled_by = auth.uid(),
      cancelled_at = now(),
      cancel_reason = trim(p_cancel_reason),
      review_note = concat_ws(E'\n', nullif(review_note, ''), 'Hủy: ' || trim(p_cancel_reason)),
      case_version = case_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_case_id;

  update public.short_enrollments
  set bhxh_policy_status = 'NOT_APPLICABLE',
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_case.enrollment_id
    and bhxh_policy_status <> 'COMPLETED';

  return target_case_id;
end;
$$;

grant execute on function public.evaluate_short_bhxh_policy_case(uuid) to authenticated;
grant execute on function public.create_short_bhxh_policy_case(uuid, text, numeric, numeric, text, text) to authenticated;
grant execute on function public.check_short_bhxh_policy_case(uuid, text, text) to authenticated;
grant execute on function public.submit_short_bhxh_policy_case(uuid, numeric, text) to authenticated;
grant execute on function public.approve_short_bhxh_policy_case(uuid, numeric, text) to authenticated;
grant execute on function public.reject_short_bhxh_policy_case(uuid, text) to authenticated;
grant execute on function public.cancel_short_bhxh_policy_case(uuid, text) to authenticated;

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
  (select count(*)::int from public.short_bhxh_policy_case_readiness where readiness_status = 'APPROVED') as bhxh_approved_count;

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
    'SHORT_BHXH_REQUIRES_LOCKED_ATTENDANCE',
    'Hồ sơ chính sách phải dùng điểm danh đã khóa',
    'BHXH_POLICY_CONTROL',
    'Không kiểm/nộp/duyệt hồ sơ chính sách nếu học viên chưa có buổi điểm danh LOCKED hoặc APPROVED.',
    'BLOCK',
    'short_bhxh_policy_cases,short_attendance_records',
    'P1-07 Short BHXH Policy Foundation',
    'KHTC + DAO_TAO',
    'IT_DATA',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_BHXH_REQUIRES_POLICY_SEGMENT',
    'Chính sách thất nghiệp chỉ áp dụng đúng đối tượng',
    'BHXH_POLICY_CONTROL',
    'Hồ sơ UNEMPLOYMENT_SUPPORT chỉ tạo cho admission segment SHORT_UNEMPLOYMENT_SUPPORT để tránh áp dụng sai chính sách.',
    'BLOCK',
    'short_bhxh_policy_cases,admission_segments',
    'P1-07 Short BHXH Policy Foundation',
    'KHTC + PHAP_CHE',
    'IT_DATA',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_BHXH_REQUIRES_EVIDENCE_AND_AMOUNT',
    'Nộp/duyệt hồ sơ chính sách phải có minh chứng và số tiền',
    'BHXH_POLICY_CONTROL',
    'Không nộp hoặc duyệt hồ sơ nếu thiếu minh chứng, thiếu số tiền đề nghị hoặc số tiền duyệt vượt số tiền đề nghị.',
    'BLOCK',
    'short_bhxh_policy_cases',
    'P1-07 Short BHXH Policy Foundation',
    'KHTC',
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
  'WF_P1_07_SHORT_BHXH_POLICY',
  'P1-07 Hồ sơ BHXH/chính sách ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'Sau khi học viên ngắn hạn có điểm danh LOCKED/APPROVED và thuộc đối tượng chính sách.',
  'KHTC',
  'KHTC + CTHSSV + DAO_TAO',
  'IT_DATA',
  'BGH',
  'Hồ sơ chính sách được kiểm, nộp và duyệt dựa trên dữ liệu chuyên cần đã khóa.',
  'Chỉ hồ sơ APPROVED mới chuyển tiếp sang tài chính/thanh toán; hồ sơ SUBMITTED chờ BGH/KHTC duyệt.',
  'Mọi tạo/kiểm/nộp/duyệt/từ chối/hủy hồ sơ chính sách đều ghi audit log.',
  907,
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
  'APPROVE_P1_07_SHORT_BHXH_POLICY',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_07_SHORT_BHXH_POLICY',
  'Duyệt hồ sơ chính sách/trợ cấp thất nghiệp ngắn hạn',
  'DEPARTMENT',
  'KHTC',
  'IT_DATA',
  'BGH',
  'Điểm danh LOCKED/APPROVED, tỷ lệ chuyên cần đạt ngưỡng, có minh chứng chính sách và số tiền đề nghị hợp lệ.',
  'Không duyệt nếu short_bhxh_policy_case_readiness khác SUBMITTED_READY_APPROVAL.',
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
    'SHORT_BHXH_POLICY_CASE',
    'Hồ sơ chính sách/BHXH ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_bhxh_policy_cases',
    'TRANSACTION',
    'KHTC + CTHSSV',
    'HEU_OS',
    'RESTRICTED',
    true,
    'P1-07: Tạo/kiểm/nộp/duyệt/từ chối qua function, dùng điểm danh đã khóa làm nguồn dữ liệu gốc.',
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_BHXH_POLICY_CASE_READINESS',
    'Tình trạng sẵn sàng hồ sơ chính sách ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_bhxh_policy_case_readiness',
    'REPORT_VIEW',
    'KHTC + IT_DATA',
    'HEU_OS',
    'RESTRICTED',
    true,
    'View chỉ đọc để phát hiện thiếu điểm danh khóa, thiếu minh chứng, không đạt chuyên cần hoặc sai đối tượng chính sách.',
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
    'RISK_P1_07_POLICY_WITHOUT_LOCKED_ATTENDANCE',
    'Xử lý chính sách khi điểm danh chưa khóa',
    'M11_SHORT_COURSE_ERP',
    'GOVERNANCE',
    'CRITICAL',
    'KHTC + DAO_TAO',
    'Nếu dùng điểm danh chưa khóa để xử lý chính sách/trợ cấp, số liệu có thể thay đổi sau khi duyệt và gây sai thanh toán/pháp chế.',
    'Function check/submit/approve hồ sơ chính sách chặn khi không có locked_session_count.',
    'BGH/KHTC rà soát bhxh_needs_fix_count và hồ sơ có flag NO_LOCKED_ATTENDANCE.',
    'Số hồ sơ chính sách có flag NO_LOCKED_ATTENDANCE.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_07_WRONG_POLICY_SEGMENT',
    'Áp dụng sai đối tượng chính sách thất nghiệp',
    'M11_SHORT_COURSE_ERP',
    'LEGAL',
    'CRITICAL',
    'KHTC + PHAP_CHE',
    'Nếu áp dụng chính sách thất nghiệp cho sai đối tượng tuyển sinh, trường có rủi ro pháp lý và tài chính.',
    'Function tạo hồ sơ UNEMPLOYMENT_SUPPORT chỉ cho segment SHORT_UNEMPLOYMENT_SUPPORT.',
    'Pháp chế/KHTC kiểm tra hồ sơ BLOCKED có flag NOT_UNEMPLOYMENT_SUPPORT_SEGMENT.',
    'Số hồ sơ có flag NOT_UNEMPLOYMENT_SUPPORT_SEGMENT.',
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
    'short_bhxh_policy_case_readiness',
    'Kiểm tra hồ sơ chính sách ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'REPORT_VIEW',
    'KHTC + IT_DATA',
    'View kiểm tra hồ sơ chính sách đủ điều kiện kiểm/nộp/duyệt hay chưa.',
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
    ('readiness_status', 'Trạng thái sẵn sàng hồ sơ chính sách', 'text', true, false, false, true, 'NO_CASE/BLOCKED/NOT_ELIGIBLE/NEEDS_EVIDENCE/READY_TO_CHECK/READY_TO_SUBMIT/SUBMITTED_READY_APPROVAL/APPROVED/REJECTED/PAID', 'Dùng cho dashboard và kiểm soát chính sách.'),
    ('control_flags', 'Cờ lỗi/kiểm soát hồ sơ chính sách', 'text[]', false, false, false, true, 'Danh sách lỗi chi tiết từng hồ sơ.', 'Chỗ nào sai thì chỉ đúng chỗ đó.'),
    ('attendance_percent', 'Tỷ lệ chuyên cần dùng xét chính sách', 'numeric', false, false, false, true, 'Tính từ short_attendance_enrollment_summary, chỉ dùng buổi LOCKED/APPROVED.', 'Không lấy điểm danh chưa khóa.'),
    ('requested_amount_vnd', 'Số tiền đề nghị', 'numeric', false, false, true, true, 'Không âm; cần có trước khi submit.', 'Dữ liệu nhạy cảm tài chính.')
) as f(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, validation_rule, note)
where t.table_code = 'short_bhxh_policy_case_readiness'
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
  'OWN_P1_07_SHORT_BHXH_POLICY',
  'P1-07 Hồ sơ BHXH/chính sách ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_07_SHORT_BHXH_POLICY',
  'WORKFLOW',
  'short_bhxh_policy_cases',
  'KHTC',
  'KHTC',
  'IT_DATA',
  'BGH',
  'RESTRICTED',
  'DAO_TAO + CTHSSV',
  'KHTC',
  'Điểm danh LOCKED/APPROVED, tỷ lệ chuyên cần đạt ngưỡng, minh chứng chính sách và số tiền đề nghị.',
  'Mọi tạo/kiểm/nộp/duyệt/từ chối/hủy hồ sơ chính sách phải ghi audit log.',
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
  'GATE_P1_07_SHORT_BHXH_POLICY_APPROVAL',
  'Gate P1-07: hồ sơ chính sách ngắn hạn đủ điều kiện duyệt',
  'FINANCE',
  'VIEW',
  'short_bhxh_policy_case_readiness',
  'KHTC + IT_DATA',
  'IT_DATA kiểm tra điểm danh đã khóa, đúng đối tượng chính sách, đủ minh chứng và số tiền.',
  'BGH/KHTC chỉ duyệt khi readiness_status = SUBMITTED_READY_APPROVAL.',
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
  'NAV_P1_07_SHORT_BHXH_POLICY',
  'P1-07 Chính sách/BHXH ngắn hạn',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/master-control/modules/M11_SHORT_COURSE_ERP',
  'Kiểm soát hồ sơ trợ cấp thất nghiệp/BHXH ngắn hạn bằng điểm danh đã khóa.',
  'KHTC + CTHSSV',
  'Kiểm tra readiness, nộp và duyệt hồ sơ chính sách',
  117,
  true,
  'Cảnh báo nếu short_bhxh_policy_case_readiness có readiness_status = BLOCKED/NEEDS_EVIDENCE/NOT_ELIGIBLE.',
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
