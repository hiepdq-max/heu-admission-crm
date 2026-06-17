-- P1-06: Short Course Attendance Foundation
-- Run after step69_short_course_enrollment_class_assignment.sql.
-- Purpose:
-- - Create attendance sessions only for valid short-course classes.
-- - Generate attendance records only for verified class assignments.
-- - Lock attendance before BHXH/finance/payment uses it as source data.
-- - Register P1-06 in Master Control / HEU OS Map.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('short_course.attendance.read'),
    ('short_course.attendance.create'),
    ('short_course.attendance.update'),
    ('short_course.attendance.lock'),
    ('short_course.attendance.approve')
) as p(permission)
where r.code in (
  'ADMIN',
  'BGH',
  'AUDIT',
  'ADMISSION_HEAD',
  'TEAM_LEAD',
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
    ('short_course.attendance.read')
) as p(permission)
where r.code in (
  'COUNSELOR',
  'ADMISSION_STAFF',
  'ACCOUNTING',
  'ACCOUNTING_LEAD',
  'KHTC'
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
    'short_course.attendance.read',
    'SHORT_COURSE',
    'Xem điểm danh ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'DAO_TAO + CTHSSV',
    'MEDIUM',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    true,
    'Chỉ xem điểm danh trong phạm vi lớp/đối tượng tuyển sinh được phân.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.attendance.create',
    'SHORT_COURSE',
    'Tạo buổi điểm danh ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'DAO_TAO',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    false,
    true,
    'Chỉ tạo buổi điểm danh cho lớp OPEN/IN_PROGRESS và có học viên đã xác nhận gán lớp.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.attendance.update',
    'SHORT_COURSE',
    'Cập nhật dòng điểm danh ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'DAO_TAO',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    false,
    true,
    'Chỉ cập nhật khi buổi chưa khóa. Dòng đã khóa không sửa tự do.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.attendance.lock',
    'SHORT_COURSE',
    'Khóa buổi điểm danh ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'DAO_TAO + IT_DATA',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    false,
    true,
    'Khóa khi tất cả học viên hợp lệ đã có trạng thái điểm danh, không còn UNKNOWN.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.attendance.approve',
    'SHORT_COURSE',
    'Duyệt buổi điểm danh ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'DAO_TAO + BGH',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    true,
    'Duyệt sau khi đã khóa để BHXH, tài chính và thanh toán được dùng làm dữ liệu gốc.',
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
$$;

create or replace function public.can_read_short_attendance()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.can_read_short_course_erp()
    or public.has_permission('short_course.attendance.read')
    or public.has_permission('short_course.attendance.create')
    or public.has_permission('short_course.attendance.update')
    or public.has_permission('short_course.attendance.lock')
    or public.has_permission('short_course.attendance.approve')
    or public.has_permission('short_course.attendance.manage')
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
    or public.has_permission('short_course.attendance.create')
    or public.has_permission('short_course.attendance.update')
    or public.has_permission('short_course.attendance.lock')
    or public.has_permission('short_course.attendance.approve')
    or public.has_permission('short_course.attendance.manage')
$$;

grant execute on function public.can_read_short_course_erp() to authenticated;
grant execute on function public.can_manage_short_course_erp() to authenticated;
grant execute on function public.can_read_short_attendance() to authenticated;
grant execute on function public.can_manage_short_attendance() to authenticated;

create sequence if not exists public.short_attendance_session_code_seq;

create or replace function public.next_short_attendance_session_code()
returns text
language sql
security definer
set search_path = public
as $$
  select 'ATT-' ||
    to_char(current_date, 'YYYY') ||
    '-' ||
    lpad(nextval('public.short_attendance_session_code_seq')::text, 6, '0')
$$;

grant execute on function public.next_short_attendance_session_code() to authenticated;

alter table public.short_attendance_sessions
  add column if not exists session_type text not null default 'LESSON',
  add column if not exists sequence_no int,
  add column if not exists expected_student_count int not null default 0,
  add column if not exists actual_present_count int not null default 0,
  add column if not exists actual_absent_count int not null default 0,
  add column if not exists actual_late_count int not null default 0,
  add column if not exists actual_unknown_count int not null default 0,
  add column if not exists attendance_quality_status text not null default 'DRAFT',
  add column if not exists attendance_version int not null default 1,
  add column if not exists locked_reason text,
  add column if not exists approved_by uuid references public.users_profile(id),
  add column if not exists approved_at timestamptz,
  add column if not exists approval_note text;

alter table public.short_attendance_records
  add column if not exists recorded_method text not null default 'MANUAL',
  add column if not exists late_minutes int,
  add column if not exists absence_reason text,
  add column if not exists lock_snapshot jsonb,
  add column if not exists attendance_version int not null default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_attendance_session_type_valid'
      and conrelid = 'public.short_attendance_sessions'::regclass
  ) then
    alter table public.short_attendance_sessions
      add constraint short_attendance_session_type_valid
      check (session_type in ('LESSON', 'PRACTICE', 'EXAM', 'MAKEUP', 'OTHER'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_attendance_session_counts_valid'
      and conrelid = 'public.short_attendance_sessions'::regclass
  ) then
    alter table public.short_attendance_sessions
      add constraint short_attendance_session_counts_valid
      check (
        expected_student_count >= 0
        and actual_present_count >= 0
        and actual_absent_count >= 0
        and actual_late_count >= 0
        and actual_unknown_count >= 0
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_attendance_session_quality_valid'
      and conrelid = 'public.short_attendance_sessions'::regclass
  ) then
    alter table public.short_attendance_sessions
      add constraint short_attendance_session_quality_valid
      check (attendance_quality_status in (
        'DRAFT',
        'NEEDS_RECORDING',
        'READY_TO_LOCK',
        'LOCKED',
        'APPROVED',
        'NEEDS_FIX'
      ));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_attendance_session_version_positive'
      and conrelid = 'public.short_attendance_sessions'::regclass
  ) then
    alter table public.short_attendance_sessions
      add constraint short_attendance_session_version_positive
      check (attendance_version > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_attendance_record_method_valid'
      and conrelid = 'public.short_attendance_records'::regclass
  ) then
    alter table public.short_attendance_records
      add constraint short_attendance_record_method_valid
      check (recorded_method in ('MANUAL', 'IMPORT', 'AI_ASSISTED', 'SYSTEM'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_attendance_record_late_minutes_valid'
      and conrelid = 'public.short_attendance_records'::regclass
  ) then
    alter table public.short_attendance_records
      add constraint short_attendance_record_late_minutes_valid
      check (late_minutes is null or late_minutes >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_attendance_record_version_positive'
      and conrelid = 'public.short_attendance_records'::regclass
  ) then
    alter table public.short_attendance_records
      add constraint short_attendance_record_version_positive
      check (attendance_version > 0);
  end if;
end $$;

update public.short_attendance_sessions
set sequence_no = coalesce(sequence_no, ranked.session_rank),
    expected_student_count = greatest(coalesce(expected_student_count, 0), 0),
    actual_present_count = greatest(coalesce(actual_present_count, 0), 0),
    actual_absent_count = greatest(coalesce(actual_absent_count, 0), 0),
    actual_late_count = greatest(coalesce(actual_late_count, 0), 0),
    actual_unknown_count = greatest(coalesce(actual_unknown_count, 0), 0),
    attendance_version = greatest(coalesce(attendance_version, 1), 1),
    updated_at = now()
from (
  select
    id,
    row_number() over (
      partition by class_id
      order by session_date, start_time nulls first, created_at, id
    )::int as session_rank
  from public.short_attendance_sessions
  where record_status = 'ACTIVE'
) ranked
where ranked.id = short_attendance_sessions.id;

update public.short_attendance_records
set recorded_method = coalesce(recorded_method, 'MANUAL'),
    attendance_version = greatest(coalesce(attendance_version, 1), 1),
    updated_at = now()
where record_status = 'ACTIVE';

create index if not exists idx_short_attendance_sessions_status
on public.short_attendance_sessions(class_id, session_status, attendance_locked)
where record_status = 'ACTIVE';

create index if not exists idx_short_attendance_sessions_quality
on public.short_attendance_sessions(attendance_quality_status, session_date)
where record_status = 'ACTIVE';

create index if not exists idx_short_attendance_records_session_status
on public.short_attendance_records(session_id, attendance_status)
where record_status = 'ACTIVE';

create index if not exists idx_short_attendance_records_student
on public.short_attendance_records(student_id, attendance_status)
where record_status = 'ACTIVE';

create or replace view public.short_attendance_session_readiness
with (security_invoker = true)
as
select
  sess.id as session_id,
  sess.session_code,
  sess.class_id,
  c.class_code,
  c.class_name,
  c.class_status,
  c.admission_segment_id,
  seg.segment_code,
  seg.segment_name,
  c.offering_id,
  o.offering_code,
  o.offering_name,
  sess.sequence_no,
  sess.session_date,
  sess.start_time,
  sess.end_time,
  sess.session_title,
  sess.session_type,
  sess.instructor_user_id,
  sess.session_status,
  sess.attendance_locked,
  sess.locked_by,
  sess.locked_at,
  sess.locked_reason,
  sess.approved_by,
  sess.approved_at,
  sess.approval_note,
  sess.expected_student_count,
  sess.actual_present_count,
  sess.actual_absent_count,
  sess.actual_late_count,
  sess.actual_unknown_count,
  sess.attendance_quality_status,
  sess.attendance_version,
  sess.record_status,
  sess.created_at,
  sess.updated_at,
  coalesce(eligible_stats.eligible_enrollment_count, 0)::int as eligible_enrollment_count,
  coalesce(record_stats.record_count, 0)::int as record_count,
  coalesce(record_stats.present_count, 0)::int as present_count,
  coalesce(record_stats.online_count, 0)::int as online_count,
  coalesce(record_stats.late_count, 0)::int as late_count,
  coalesce(record_stats.absent_count, 0)::int as absent_count,
  coalesce(record_stats.excused_count, 0)::int as excused_count,
  coalesce(record_stats.unknown_count, 0)::int as unknown_count,
  array_remove(array[
    case when sess.record_status <> 'ACTIVE'::public.record_status then 'ARCHIVED_SESSION' end,
    case when c.id is null then 'CLASS_NOT_FOUND' end,
    case when c.class_status not in ('OPEN', 'IN_PROGRESS') then 'CLASS_NOT_OPEN' end,
    case when sess.session_status = 'CANCELLED' then 'SESSION_CANCELLED' end,
    case when sess.session_date is null then 'NO_SESSION_DATE' end,
    case when sess.end_time is not null and sess.start_time is not null and sess.end_time <= sess.start_time then 'INVALID_TIME_RANGE' end,
    case when coalesce(eligible_stats.eligible_enrollment_count, 0) = 0 then 'NO_VERIFIED_ENROLLMENT' end,
    case when coalesce(record_stats.record_count, 0) < coalesce(eligible_stats.eligible_enrollment_count, 0) then 'MISSING_ATTENDANCE_RECORDS' end,
    case when coalesce(record_stats.record_count, 0) > coalesce(eligible_stats.eligible_enrollment_count, 0) then 'EXTRA_ATTENDANCE_RECORDS' end,
    case when coalesce(record_stats.unknown_count, 0) > 0 then 'HAS_UNKNOWN_ATTENDANCE' end,
    case when sess.attendance_locked = true and nullif(trim(coalesce(sess.locked_reason, '')), '') is null then 'LOCKED_WITHOUT_REASON' end
  ]::text[], null) as control_flags,
  case
    when sess.record_status <> 'ACTIVE'::public.record_status then 'ARCHIVED'
    when sess.session_status = 'CANCELLED' then 'CANCELLED'
    when sess.session_status = 'APPROVED' then 'APPROVED'
    when sess.session_status = 'LOCKED' or sess.attendance_locked = true then 'LOCKED'
    when c.id is null
      or c.class_status not in ('OPEN', 'IN_PROGRESS')
      or sess.session_date is null
      or (sess.end_time is not null and sess.start_time is not null and sess.end_time <= sess.start_time)
      or coalesce(eligible_stats.eligible_enrollment_count, 0) = 0
      then 'BLOCKED'
    when coalesce(record_stats.record_count, 0) < coalesce(eligible_stats.eligible_enrollment_count, 0)
      or coalesce(record_stats.record_count, 0) > coalesce(eligible_stats.eligible_enrollment_count, 0)
      then 'NEEDS_SYNC'
    when coalesce(record_stats.unknown_count, 0) > 0 then 'NEEDS_RECORDING'
    else 'READY_TO_LOCK'
  end as readiness_status
from public.short_attendance_sessions sess
left join public.short_class_master c on c.id = sess.class_id
left join public.admission_segments seg on seg.id = c.admission_segment_id
left join public.admission_offering_catalog o on o.id = c.offering_id
left join lateral (
  select count(*) as eligible_enrollment_count
  from public.short_enrollments e
  where e.class_id = sess.class_id
    and e.record_status = 'ACTIVE'::public.record_status
    and e.enrollment_status in ('ENROLLED', 'STUDYING')
    and e.assignment_status = 'VERIFIED'
) eligible_stats on true
left join lateral (
  select
    count(*) as record_count,
    count(*) filter (where ar.attendance_status = 'PRESENT') as present_count,
    count(*) filter (where ar.attendance_status = 'ONLINE') as online_count,
    count(*) filter (where ar.attendance_status = 'LATE') as late_count,
    count(*) filter (where ar.attendance_status = 'ABSENT') as absent_count,
    count(*) filter (where ar.attendance_status = 'EXCUSED') as excused_count,
    count(*) filter (where ar.attendance_status = 'UNKNOWN') as unknown_count
  from public.short_attendance_records ar
  where ar.session_id = sess.id
    and ar.record_status = 'ACTIVE'::public.record_status
) record_stats on true;

create or replace view public.short_attendance_enrollment_summary
with (security_invoker = true)
as
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
  coalesce(stats.locked_session_count, 0)::int as locked_session_count,
  coalesce(stats.present_count, 0)::int as present_count,
  coalesce(stats.online_count, 0)::int as online_count,
  coalesce(stats.late_count, 0)::int as late_count,
  coalesce(stats.absent_count, 0)::int as absent_count,
  coalesce(stats.excused_count, 0)::int as excused_count,
  coalesce(stats.unknown_count, 0)::int as unknown_count,
  case
    when coalesce(stats.locked_session_count, 0) = 0 then null
    else round(
      (
        (coalesce(stats.present_count, 0)
         + coalesce(stats.online_count, 0)
         + coalesce(stats.late_count, 0))::numeric
        / nullif(stats.locked_session_count, 0)::numeric
      ) * 100,
      2
    )
  end as attendance_percent,
  case
    when coalesce(stats.locked_session_count, 0) = 0 then 'NO_LOCKED_ATTENDANCE'
    when round(
      (
        (coalesce(stats.present_count, 0)
         + coalesce(stats.online_count, 0)
         + coalesce(stats.late_count, 0))::numeric
        / nullif(stats.locked_session_count, 0)::numeric
      ) * 100,
      2
    ) < 80 then 'AT_RISK'
    else 'OK'
  end as attendance_risk_status
from public.short_enrollments e
join public.short_student_master s on s.id = e.student_id
left join public.short_class_master c on c.id = e.class_id
join public.admission_segments seg on seg.id = e.admission_segment_id
join public.admission_offering_catalog o on o.id = e.offering_id
left join lateral (
  select
    count(*) filter (where sess.attendance_locked = true and sess.session_status in ('LOCKED', 'APPROVED')) as locked_session_count,
    count(*) filter (where sess.attendance_locked = true and sess.session_status in ('LOCKED', 'APPROVED') and ar.attendance_status = 'PRESENT') as present_count,
    count(*) filter (where sess.attendance_locked = true and sess.session_status in ('LOCKED', 'APPROVED') and ar.attendance_status = 'ONLINE') as online_count,
    count(*) filter (where sess.attendance_locked = true and sess.session_status in ('LOCKED', 'APPROVED') and ar.attendance_status = 'LATE') as late_count,
    count(*) filter (where sess.attendance_locked = true and sess.session_status in ('LOCKED', 'APPROVED') and ar.attendance_status = 'ABSENT') as absent_count,
    count(*) filter (where sess.attendance_locked = true and sess.session_status in ('LOCKED', 'APPROVED') and ar.attendance_status = 'EXCUSED') as excused_count,
    count(*) filter (where sess.attendance_locked = true and sess.session_status in ('LOCKED', 'APPROVED') and ar.attendance_status = 'UNKNOWN') as unknown_count
  from public.short_attendance_records ar
  join public.short_attendance_sessions sess on sess.id = ar.session_id
  where ar.enrollment_id = e.id
    and ar.record_status = 'ACTIVE'::public.record_status
    and sess.record_status = 'ACTIVE'::public.record_status
) stats on true
where e.record_status = 'ACTIVE'::public.record_status;

grant select on public.short_attendance_session_readiness to authenticated;
grant select on public.short_attendance_enrollment_summary to authenticated;

create or replace function public.sync_short_attendance_records(target_session_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.short_attendance_sessions%rowtype;
  v_inserted_count int;
  v_eligible_count int;
  v_record_count int;
  v_unknown_count int;
begin
  if not public.can_manage_short_attendance() then
    raise exception 'Bạn chưa có quyền đồng bộ danh sách điểm danh ngắn hạn.';
  end if;

  select *
  into v_session
  from public.short_attendance_sessions
  where id = target_session_id
  for update;

  if not found then
    raise exception 'Không tìm thấy buổi điểm danh.';
  end if;

  if v_session.attendance_locked = true or v_session.session_status in ('LOCKED', 'APPROVED') then
    raise exception 'Buổi điểm danh đã khóa/duyệt nên không thể đồng bộ lại.';
  end if;

  if v_session.session_status = 'CANCELLED' then
    raise exception 'Buổi điểm danh đã hủy.';
  end if;

  insert into public.short_attendance_records (
    session_id,
    enrollment_id,
    student_id,
    attendance_status,
    recorded_method,
    record_status,
    created_by,
    updated_by
  )
  select
    v_session.id,
    e.id,
    e.student_id,
    'UNKNOWN',
    'SYSTEM',
    'ACTIVE'::public.record_status,
    auth.uid(),
    auth.uid()
  from public.short_enrollments e
  where e.class_id = v_session.class_id
    and e.record_status = 'ACTIVE'::public.record_status
    and e.enrollment_status in ('ENROLLED', 'STUDYING')
    and e.assignment_status = 'VERIFIED'
  on conflict (session_id, enrollment_id) do update
  set student_id = excluded.student_id,
      record_status = 'ACTIVE'::public.record_status,
      updated_by = auth.uid(),
      updated_at = now()
  where public.short_attendance_records.record_status <> 'ACTIVE'::public.record_status;

  get diagnostics v_inserted_count = row_count;

  select count(*)::int
  into v_eligible_count
  from public.short_enrollments e
  where e.class_id = v_session.class_id
    and e.record_status = 'ACTIVE'::public.record_status
    and e.enrollment_status in ('ENROLLED', 'STUDYING')
    and e.assignment_status = 'VERIFIED';

  select count(*)::int,
         count(*) filter (where attendance_status = 'UNKNOWN')::int
  into v_record_count,
       v_unknown_count
  from public.short_attendance_records ar
  where ar.session_id = v_session.id
    and ar.record_status = 'ACTIVE'::public.record_status;

  update public.short_attendance_sessions
  set expected_student_count = v_eligible_count,
      actual_unknown_count = v_unknown_count,
      attendance_quality_status = case
        when v_eligible_count = 0 then 'NEEDS_FIX'
        when v_record_count <> v_eligible_count then 'NEEDS_FIX'
        when v_unknown_count > 0 then 'NEEDS_RECORDING'
        else 'READY_TO_LOCK'
      end,
      attendance_version = attendance_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_session.id;

  return v_inserted_count;
end;
$$;

create or replace function public.create_short_attendance_session(
  target_class_id uuid,
  p_session_date date,
  p_start_time time default null,
  p_end_time time default null,
  p_session_title text default null,
  p_session_type text default 'LESSON',
  p_instructor_user_id uuid default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.short_class_master%rowtype;
  v_session_id uuid;
  v_sequence_no int;
  v_existing_session_id uuid;
  v_eligible_count int;
begin
  if not (
    public.can_manage_short_attendance()
    or public.has_permission('short_course.attendance.create')
  ) then
    raise exception 'Bạn chưa có quyền tạo buổi điểm danh ngắn hạn.';
  end if;

  if p_session_date is null then
    raise exception 'Buổi điểm danh phải có ngày học.';
  end if;

  if p_end_time is not null and p_start_time is not null and p_end_time <= p_start_time then
    raise exception 'Giờ kết thúc phải sau giờ bắt đầu.';
  end if;

  if coalesce(p_session_type, 'LESSON') not in ('LESSON', 'PRACTICE', 'EXAM', 'MAKEUP', 'OTHER') then
    raise exception 'Loại buổi học không hợp lệ.';
  end if;

  select *
  into v_class
  from public.short_class_master
  where id = target_class_id
    and status = 'ACTIVE'::public.record_status
  for update;

  if not found then
    raise exception 'Không tìm thấy lớp ngắn hạn.';
  end if;

  if not public.can_access_business_scope(v_class.admission_segment_id, null::uuid) then
    raise exception 'Bạn không có phạm vi thao tác với lớp này.';
  end if;

  if v_class.class_status not in ('OPEN', 'IN_PROGRESS') then
    raise exception 'Chỉ lớp OPEN hoặc IN_PROGRESS mới được tạo buổi điểm danh. Lớp hiện tại: %.', v_class.class_status;
  end if;

  select count(*)::int
  into v_eligible_count
  from public.short_enrollments e
  where e.class_id = target_class_id
    and e.record_status = 'ACTIVE'::public.record_status
    and e.enrollment_status in ('ENROLLED', 'STUDYING')
    and e.assignment_status = 'VERIFIED';

  if v_eligible_count = 0 then
    raise exception 'Lớp chưa có học viên đã xác nhận gán lớp nên chưa thể tạo buổi điểm danh.';
  end if;

  select id
  into v_existing_session_id
  from public.short_attendance_sessions sess
  where sess.class_id = target_class_id
    and sess.record_status = 'ACTIVE'::public.record_status
    and sess.session_status <> 'CANCELLED'
    and sess.session_date = p_session_date
    and coalesce(sess.start_time, time '00:00') = coalesce(p_start_time, time '00:00')
  limit 1;

  if v_existing_session_id is not null then
    raise exception 'Lớp đã có buổi điểm danh cùng ngày/giờ này.';
  end if;

  select coalesce(max(sequence_no), 0) + 1
  into v_sequence_no
  from public.short_attendance_sessions
  where class_id = target_class_id
    and record_status = 'ACTIVE'::public.record_status;

  insert into public.short_attendance_sessions (
    session_code,
    class_id,
    session_date,
    start_time,
    end_time,
    session_title,
    session_type,
    sequence_no,
    instructor_user_id,
    session_status,
    expected_student_count,
    actual_unknown_count,
    attendance_quality_status,
    note,
    record_status,
    created_by,
    updated_by
  ) values (
    public.next_short_attendance_session_code(),
    target_class_id,
    p_session_date,
    p_start_time,
    p_end_time,
    coalesce(nullif(trim(coalesce(p_session_title, '')), ''), 'Buổi học ' || v_sequence_no::text),
    coalesce(p_session_type, 'LESSON'),
    v_sequence_no,
    p_instructor_user_id,
    'OPEN',
    v_eligible_count,
    v_eligible_count,
    'NEEDS_RECORDING',
    nullif(trim(coalesce(p_note, '')), ''),
    'ACTIVE'::public.record_status,
    auth.uid(),
    auth.uid()
  )
  returning id into v_session_id;

  perform public.sync_short_attendance_records(v_session_id);

  update public.short_class_master
  set class_status = 'IN_PROGRESS',
      actual_start_date = coalesce(actual_start_date, p_session_date),
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_class_id
    and class_status = 'OPEN';

  return v_session_id;
end;
$$;

create or replace function public.record_short_attendance(
  target_session_id uuid,
  target_enrollment_id uuid,
  p_attendance_status text,
  p_note text default null,
  p_evidence_url text default null,
  p_absence_reason text default null,
  p_late_minutes int default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.short_attendance_sessions%rowtype;
  v_enrollment public.short_enrollments%rowtype;
  v_record_id uuid;
begin
  if not (
    public.can_manage_short_attendance()
    or public.has_permission('short_course.attendance.update')
  ) then
    raise exception 'Bạn chưa có quyền cập nhật điểm danh.';
  end if;

  if p_attendance_status not in ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'ONLINE', 'UNKNOWN') then
    raise exception 'Trạng thái điểm danh không hợp lệ.';
  end if;

  if p_attendance_status = 'LATE' and p_late_minutes is not null and p_late_minutes < 0 then
    raise exception 'Số phút đi muộn không được âm.';
  end if;

  select *
  into v_session
  from public.short_attendance_sessions
  where id = target_session_id
  for update;

  if not found then
    raise exception 'Không tìm thấy buổi điểm danh.';
  end if;

  if v_session.attendance_locked = true or v_session.session_status in ('LOCKED', 'APPROVED') then
    raise exception 'Buổi điểm danh đã khóa/duyệt nên không thể sửa.';
  end if;

  if v_session.session_status = 'CANCELLED' then
    raise exception 'Buổi điểm danh đã hủy.';
  end if;

  select *
  into v_enrollment
  from public.short_enrollments
  where id = target_enrollment_id
  for update;

  if not found then
    raise exception 'Không tìm thấy ghi danh cần điểm danh.';
  end if;

  if v_enrollment.class_id is distinct from v_session.class_id then
    raise exception 'Học viên không thuộc lớp của buổi điểm danh.';
  end if;

  if v_enrollment.record_status <> 'ACTIVE'::public.record_status
     or v_enrollment.enrollment_status not in ('ENROLLED', 'STUDYING')
     or v_enrollment.assignment_status <> 'VERIFIED' then
    raise exception 'Ghi danh chưa đủ điều kiện điểm danh.';
  end if;

  insert into public.short_attendance_records (
    session_id,
    enrollment_id,
    student_id,
    attendance_status,
    checked_by,
    checked_at,
    evidence_url,
    absence_reason,
    late_minutes,
    note,
    recorded_method,
    record_status,
    created_by,
    updated_by
  ) values (
    target_session_id,
    target_enrollment_id,
    v_enrollment.student_id,
    p_attendance_status,
    auth.uid(),
    now(),
    nullif(trim(coalesce(p_evidence_url, '')), ''),
    nullif(trim(coalesce(p_absence_reason, '')), ''),
    case when p_attendance_status = 'LATE' then coalesce(p_late_minutes, 0) else null end,
    nullif(trim(coalesce(p_note, '')), ''),
    'MANUAL',
    'ACTIVE'::public.record_status,
    auth.uid(),
    auth.uid()
  )
  on conflict (session_id, enrollment_id) do update
  set student_id = excluded.student_id,
      attendance_status = excluded.attendance_status,
      checked_by = auth.uid(),
      checked_at = now(),
      evidence_url = excluded.evidence_url,
      absence_reason = excluded.absence_reason,
      late_minutes = excluded.late_minutes,
      note = excluded.note,
      recorded_method = 'MANUAL',
      record_status = 'ACTIVE'::public.record_status,
      attendance_version = public.short_attendance_records.attendance_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  returning id into v_record_id;

  update public.short_attendance_sessions sess
  set actual_present_count = stats.present_count,
      actual_absent_count = stats.absent_count,
      actual_late_count = stats.late_count,
      actual_unknown_count = stats.unknown_count,
      attendance_quality_status = case
        when stats.unknown_count > 0 then 'NEEDS_RECORDING'
        else 'READY_TO_LOCK'
      end,
      attendance_version = attendance_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  from (
    select
      count(*) filter (where ar.attendance_status in ('PRESENT', 'ONLINE'))::int as present_count,
      count(*) filter (where ar.attendance_status = 'ABSENT')::int as absent_count,
      count(*) filter (where ar.attendance_status = 'LATE')::int as late_count,
      count(*) filter (where ar.attendance_status = 'UNKNOWN')::int as unknown_count
    from public.short_attendance_records ar
    where ar.session_id = target_session_id
      and ar.record_status = 'ACTIVE'::public.record_status
  ) stats
  where sess.id = target_session_id;

  update public.short_enrollments
  set attendance_status = 'ACTIVE',
      enrollment_status = case
        when enrollment_status = 'ENROLLED' then 'STUDYING'
        else enrollment_status
      end,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_enrollment_id
    and attendance_status = 'NOT_STARTED';

  return v_record_id;
end;
$$;

create or replace function public.bulk_mark_short_attendance(
  target_session_id uuid,
  p_attendance_status text,
  p_note text default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.short_attendance_sessions%rowtype;
  v_updated_count int;
begin
  if not (
    public.can_manage_short_attendance()
    or public.has_permission('short_course.attendance.update')
  ) then
    raise exception 'Bạn chưa có quyền cập nhật điểm danh hàng loạt.';
  end if;

  if p_attendance_status not in ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'ONLINE') then
    raise exception 'Chỉ được đánh dấu hàng loạt bằng PRESENT/ABSENT/LATE/EXCUSED/ONLINE.';
  end if;

  select *
  into v_session
  from public.short_attendance_sessions
  where id = target_session_id
  for update;

  if not found then
    raise exception 'Không tìm thấy buổi điểm danh.';
  end if;

  if v_session.attendance_locked = true or v_session.session_status in ('LOCKED', 'APPROVED') then
    raise exception 'Buổi điểm danh đã khóa/duyệt nên không thể sửa.';
  end if;

  update public.short_attendance_records ar
  set attendance_status = p_attendance_status,
      checked_by = auth.uid(),
      checked_at = now(),
      note = nullif(trim(coalesce(p_note, '')), ''),
      recorded_method = 'MANUAL',
      late_minutes = case when p_attendance_status = 'LATE' then coalesce(ar.late_minutes, 0) else null end,
      attendance_version = attendance_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where ar.session_id = target_session_id
    and ar.record_status = 'ACTIVE'::public.record_status
    and ar.attendance_status = 'UNKNOWN';

  get diagnostics v_updated_count = row_count;

  update public.short_attendance_sessions sess
  set actual_present_count = stats.present_count,
      actual_absent_count = stats.absent_count,
      actual_late_count = stats.late_count,
      actual_unknown_count = stats.unknown_count,
      attendance_quality_status = case
        when stats.unknown_count > 0 then 'NEEDS_RECORDING'
        else 'READY_TO_LOCK'
      end,
      attendance_version = attendance_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  from (
    select
      count(*) filter (where ar.attendance_status in ('PRESENT', 'ONLINE'))::int as present_count,
      count(*) filter (where ar.attendance_status = 'ABSENT')::int as absent_count,
      count(*) filter (where ar.attendance_status = 'LATE')::int as late_count,
      count(*) filter (where ar.attendance_status = 'UNKNOWN')::int as unknown_count
    from public.short_attendance_records ar
    where ar.session_id = target_session_id
      and ar.record_status = 'ACTIVE'::public.record_status
  ) stats
  where sess.id = target_session_id;

  update public.short_enrollments e
  set attendance_status = 'ACTIVE',
      enrollment_status = case
        when enrollment_status = 'ENROLLED' then 'STUDYING'
        else enrollment_status
      end,
      updated_by = auth.uid(),
      updated_at = now()
  where e.id in (
    select ar.enrollment_id
    from public.short_attendance_records ar
    where ar.session_id = target_session_id
      and ar.record_status = 'ACTIVE'::public.record_status
  )
    and e.attendance_status = 'NOT_STARTED';

  return v_updated_count;
end;
$$;

create or replace function public.lock_short_attendance_session(
  target_session_id uuid,
  p_lock_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.short_attendance_sessions%rowtype;
  v_ready record;
begin
  if not (
    public.can_manage_short_attendance()
    or public.has_permission('short_course.attendance.lock')
  ) then
    raise exception 'Bạn chưa có quyền khóa buổi điểm danh.';
  end if;

  select *
  into v_session
  from public.short_attendance_sessions
  where id = target_session_id
  for update;

  if not found then
    raise exception 'Không tìm thấy buổi điểm danh.';
  end if;

  if v_session.session_status in ('LOCKED', 'APPROVED') or v_session.attendance_locked = true then
    raise exception 'Buổi điểm danh đã khóa/duyệt.';
  end if;

  perform public.sync_short_attendance_records(target_session_id);

  select *
  into v_ready
  from public.short_attendance_session_readiness
  where session_id = target_session_id;

  if v_ready.readiness_status <> 'READY_TO_LOCK' then
    raise exception 'Chưa thể khóa điểm danh. Trạng thái: %, lỗi: %',
      v_ready.readiness_status,
      array_to_string(v_ready.control_flags, ', ');
  end if;

  update public.short_attendance_records ar
  set lock_snapshot = jsonb_build_object(
        'locked_at', now(),
        'locked_by', auth.uid(),
        'attendance_status', ar.attendance_status,
        'checked_by', ar.checked_by,
        'checked_at', ar.checked_at
      ),
      updated_by = auth.uid(),
      updated_at = now()
  where ar.session_id = target_session_id
    and ar.record_status = 'ACTIVE'::public.record_status;

  update public.short_attendance_sessions sess
  set session_status = 'LOCKED',
      attendance_locked = true,
      locked_by = auth.uid(),
      locked_at = now(),
      locked_reason = coalesce(nullif(trim(coalesce(p_lock_reason, '')), ''), 'Khóa điểm danh sau khi đã ghi đủ trạng thái học viên.'),
      expected_student_count = v_ready.eligible_enrollment_count,
      actual_present_count = v_ready.present_count + v_ready.online_count,
      actual_absent_count = v_ready.absent_count,
      actual_late_count = v_ready.late_count,
      actual_unknown_count = v_ready.unknown_count,
      attendance_quality_status = 'LOCKED',
      attendance_version = attendance_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where sess.id = target_session_id;

  update public.short_enrollments e
  set attendance_status = 'ACTIVE',
      enrollment_status = case
        when enrollment_status = 'ENROLLED' then 'STUDYING'
        else enrollment_status
      end,
      updated_by = auth.uid(),
      updated_at = now()
  where e.id in (
    select ar.enrollment_id
    from public.short_attendance_records ar
    where ar.session_id = target_session_id
      and ar.record_status = 'ACTIVE'::public.record_status
  );

  return target_session_id;
end;
$$;

create or replace function public.approve_short_attendance_session(
  target_session_id uuid,
  p_approval_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.short_attendance_sessions%rowtype;
begin
  if not (
    public.can_manage_short_attendance()
    or public.has_permission('short_course.attendance.approve')
  ) then
    raise exception 'Bạn chưa có quyền duyệt buổi điểm danh.';
  end if;

  select *
  into v_session
  from public.short_attendance_sessions
  where id = target_session_id
  for update;

  if not found then
    raise exception 'Không tìm thấy buổi điểm danh.';
  end if;

  if v_session.attendance_locked <> true or v_session.session_status <> 'LOCKED' then
    raise exception 'Chỉ buổi điểm danh đã khóa mới được duyệt.';
  end if;

  update public.short_attendance_sessions
  set session_status = 'APPROVED',
      attendance_quality_status = 'APPROVED',
      approved_by = auth.uid(),
      approved_at = now(),
      approval_note = nullif(trim(coalesce(p_approval_note, '')), ''),
      attendance_version = attendance_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_session_id;

  return target_session_id;
end;
$$;

grant execute on function public.sync_short_attendance_records(uuid) to authenticated;
grant execute on function public.create_short_attendance_session(uuid, date, time, time, text, text, uuid, text) to authenticated;
grant execute on function public.record_short_attendance(uuid, uuid, text, text, text, text, int) to authenticated;
grant execute on function public.bulk_mark_short_attendance(uuid, text, text) to authenticated;
grant execute on function public.lock_short_attendance_session(uuid, text) to authenticated;
grant execute on function public.approve_short_attendance_session(uuid, text) to authenticated;

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
  (select count(*)::int from public.short_attendance_session_readiness where readiness_status in ('LOCKED', 'APPROVED')) as attendance_locked_or_approved_count;

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
    'SHORT_ATTENDANCE_REQUIRES_OPEN_CLASS',
    'Điểm danh chỉ chạy với lớp đã mở',
    'ATTENDANCE_CONTROL',
    'Buổi điểm danh ngắn hạn chỉ được tạo cho lớp OPEN hoặc IN_PROGRESS để tránh điểm danh lớp chưa duyệt mở.',
    'BLOCK',
    'short_attendance_sessions,short_class_master',
    'P1-06 Short Attendance Foundation',
    'DAO_TAO',
    'IT_DATA',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_ATTENDANCE_REQUIRES_VERIFIED_ASSIGNMENT',
    'Điểm danh chỉ gồm học viên đã xác nhận gán lớp',
    'ATTENDANCE_CONTROL',
    'Danh sách điểm danh chỉ sinh từ ghi danh có assignment_status = VERIFIED để không lẫn học viên sai lớp/sai ngành.',
    'BLOCK',
    'short_attendance_records,short_enrollments',
    'P1-06 Short Attendance Foundation',
    'DAO_TAO + CTHSSV',
    'IT_DATA',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_ATTENDANCE_LOCK_REQUIRES_COMPLETE_RECORDS',
    'Khóa điểm danh khi đã ghi đủ trạng thái',
    'ATTENDANCE_CONTROL',
    'Không khóa buổi điểm danh nếu còn thiếu dòng điểm danh hoặc còn trạng thái UNKNOWN.',
    'BLOCK',
    'short_attendance_sessions,short_attendance_records',
    'P1-06 Short Attendance Foundation',
    'DAO_TAO',
    'IT_DATA',
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
  'WF_P1_06_SHORT_ATTENDANCE_FOUNDATION',
  'P1-06 Điểm danh ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'Sau khi lớp ngắn hạn đã mở và học viên đã được xác nhận gán lớp.',
  'DAO_TAO',
  'DAO_TAO + CTHSSV',
  'IT_DATA',
  'BGH',
  'Buổi điểm danh có đủ dòng học viên, được ghi nhận, khóa và duyệt để làm dữ liệu gốc cho BHXH/tài chính/thanh toán.',
  'Chỉ attendance LOCKED/APPROVED mới được chuyển sang BHXH, tài chính, thanh toán và dashboard chính thức.',
  'Mọi tạo buổi, cập nhật dòng, khóa và duyệt điểm danh đều ghi audit log.',
  906,
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
  'APPROVE_P1_06_SHORT_ATTENDANCE_LOCK',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_06_SHORT_ATTENDANCE_FOUNDATION',
  'Khóa/duyệt buổi điểm danh ngắn hạn',
  'DEPARTMENT',
  'DAO_TAO',
  'IT_DATA',
  'BGH',
  'Danh sách điểm danh đủ học viên hợp lệ, không còn UNKNOWN, buổi học có ngày/giờ/lớp hợp lệ.',
  'Không khóa/duyệt nếu short_attendance_session_readiness khác READY_TO_LOCK hoặc LOCKED.',
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
    'SHORT_ATTENDANCE_SESSION',
    'Buổi điểm danh ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_attendance_sessions',
    'TRANSACTION',
    'DAO_TAO',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'P1-06: Tạo buổi qua function, chỉ với lớp OPEN/IN_PROGRESS và học viên đã xác nhận gán lớp.',
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_ATTENDANCE_RECORD',
    'Dòng điểm danh học viên ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_attendance_records',
    'TRANSACTION',
    'DAO_TAO',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'P1-06: Cập nhật dòng điểm danh qua function; sau khi buổi khóa thì không sửa trực tiếp.',
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_ATTENDANCE_SESSION_READINESS',
    'Tình trạng sẵn sàng khóa điểm danh ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_attendance_session_readiness',
    'REPORT_VIEW',
    'DAO_TAO + IT_DATA',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'View chỉ đọc để phát hiện thiếu dòng điểm danh, còn UNKNOWN, lớp chưa mở hoặc không có học viên hợp lệ.',
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_ATTENDANCE_ENROLLMENT_SUMMARY',
    'Tỷ lệ chuyên cần học viên ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_attendance_enrollment_summary',
    'REPORT_VIEW',
    'DAO_TAO + IT_DATA',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'View chỉ đọc làm dữ liệu gốc cho BHXH, cảnh báo bỏ học, tài chính và dashboard.',
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
    'RISK_P1_06_ATTENDANCE_WRONG_CLASS',
    'Điểm danh sai lớp hoặc sai học viên',
    'M11_SHORT_COURSE_ERP',
    'DATA_CONTROL',
    'CRITICAL',
    'DAO_TAO + CTHSSV',
    'Nếu điểm danh sai lớp/học viên, dữ liệu BHXH, tài chính, thanh toán và báo cáo sẽ sai từ gốc.',
    'Function tạo/sync điểm danh chỉ lấy học viên assignment_status = VERIFIED trong đúng class_id.',
    'IT_DATA rà soát session readiness có flag CLASS_NOT_OPEN, NO_VERIFIED_ENROLLMENT hoặc EXTRA_ATTENDANCE_RECORDS.',
    'Số buổi điểm danh có readiness_status = BLOCKED/NEEDS_SYNC.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_06_UNLOCKED_ATTENDANCE_USED_FOR_PAYMENT',
    'Dùng điểm danh chưa khóa để tính tiền/chính sách',
    'M11_SHORT_COURSE_ERP',
    'GOVERNANCE',
    'CRITICAL',
    'DAO_TAO + KHTC',
    'Nếu tài chính/BHXH dùng điểm danh chưa khóa, số liệu có thể bị sửa sau đó và gây sai thanh toán.',
    'Chỉ attendance session LOCKED/APPROVED mới được dùng cho bước BHXH, tài chính và thanh toán.',
    'BGH/IT_DATA theo dõi attendance_needs_fix_count và attendance_ready_to_lock_count hằng ngày.',
    'Số buổi READY_TO_LOCK nhưng chưa LOCKED/APPROVED.',
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
    'short_attendance_session_readiness',
    'Kiểm tra buổi điểm danh ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'REPORT_VIEW',
    'DAO_TAO + IT_DATA',
    'View kiểm tra buổi điểm danh đủ điều kiện khóa/duyệt hay chưa.',
    'CONFIDENTIAL',
    true,
    'DAT_TAM_THOI'
  ),
  (
    'short_attendance_enrollment_summary',
    'Tổng hợp chuyên cần học viên ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'REPORT_VIEW',
    'DAO_TAO + IT_DATA',
    'View tính số buổi đã khóa, số buổi có mặt/vắng/muộn và tỷ lệ chuyên cần từng học viên.',
    'CONFIDENTIAL',
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
    ('readiness_status', 'Trạng thái sẵn sàng khóa điểm danh', 'text', true, false, false, true, 'BLOCKED/NEEDS_SYNC/NEEDS_RECORDING/READY_TO_LOCK/LOCKED/APPROVED', 'Dùng cho kiểm soát buổi điểm danh.'),
    ('control_flags', 'Cờ lỗi/kiểm soát điểm danh', 'text[]', false, false, false, true, 'Danh sách lỗi chi tiết từng buổi.', 'Chỗ nào sai thì chỉ đúng chỗ đó.'),
    ('attendance_percent', 'Tỷ lệ chuyên cần', 'numeric', false, false, false, true, 'Tính từ buổi đã LOCKED/APPROVED.', 'Nguồn cho BHXH, rủi ro bỏ học và dashboard.')
) as f(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, validation_rule, note)
where t.table_code in ('short_attendance_session_readiness', 'short_attendance_enrollment_summary')
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
  'OWN_P1_06_SHORT_ATTENDANCE_FOUNDATION',
  'P1-06 Điểm danh ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_06_SHORT_ATTENDANCE_FOUNDATION',
  'WORKFLOW',
  'short_attendance_sessions,short_attendance_records',
  'DAO_TAO',
  'DAO_TAO',
  'IT_DATA',
  'BGH',
  'ROLE_AND_SCOPE',
  'DAO_TAO',
  'KHTC + CTHSSV',
  'Lớp đã mở, học viên đã xác nhận gán lớp, buổi học ghi đủ trạng thái và được khóa/duyệt.',
  'Mọi tạo/sửa/khóa/duyệt điểm danh phải ghi audit log và không sửa tự do sau khóa.',
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
  'GATE_P1_06_SHORT_ATTENDANCE_LOCKED',
  'Gate P1-06: điểm danh ngắn hạn đã khóa',
  'DATA',
  'VIEW',
  'short_attendance_session_readiness',
  'DAO_TAO + IT_DATA',
  'IT_DATA kiểm tra không còn UNKNOWN, không thiếu dòng điểm danh và lớp đã mở.',
  'BGH/Đào tạo duyệt khi buổi điểm danh đã đủ và khóa để dùng cho BHXH/tài chính.',
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
  'NAV_P1_06_SHORT_ATTENDANCE_FOUNDATION',
  'P1-06 Điểm danh ngắn hạn',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/master-control/modules/M11_SHORT_COURSE_ERP',
  'Tạo buổi học, ghi nhận điểm danh, khóa và duyệt điểm danh làm dữ liệu gốc.',
  'DAO_TAO',
  'Kiểm tra readiness, khóa và duyệt điểm danh',
  116,
  true,
  'Cảnh báo nếu short_attendance_session_readiness có readiness_status = BLOCKED/NEEDS_SYNC/NEEDS_RECORDING.',
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
