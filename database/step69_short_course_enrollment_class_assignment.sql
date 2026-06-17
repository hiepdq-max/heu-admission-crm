-- P1-05: Short Course Enrollment -> Class Assignment
-- Run after step68_short_course_class_master_control.sql.
-- Purpose:
-- - Assign verified short-course students to the correct class.
-- - Block wrong offering/segment, unverified student profile, duplicate class assignment and over-capacity.
-- - Keep assignment state separate from class opening so P1-04 and P1-05 do not block each other.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('short_course.enrollment.read'),
    ('short_course.enrollment.assign'),
    ('short_course.enrollment.update'),
    ('short_course.enrollment.cancel')
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
    ('short_course.enrollment.read')
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
    'short_course.enrollment.read',
    'SHORT_COURSE',
    'Xem ghi danh/lớp học viên ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'CTHSSV + DAO_TAO',
    'MEDIUM',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    true,
    'Chỉ xem học viên/lớp trong phạm vi đối tượng tuyển sinh được phân.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.enrollment.assign',
    'SHORT_COURSE',
    'Gán học viên ngắn hạn vào lớp',
    'M11_SHORT_COURSE_ERP',
    'CTHSSV + DAO_TAO',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    false,
    true,
    'Chỉ gán khi hồ sơ học viên đã xác minh, lớp cùng ngành/khoá và chưa vượt sĩ số.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.enrollment.update',
    'SHORT_COURSE',
    'Cập nhật ghi danh ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'CTHSSV + DAO_TAO',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    false,
    true,
    'Cập nhật trạng thái ghi danh phải qua function kiểm soát, có audit log.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.enrollment.cancel',
    'SHORT_COURSE',
    'Hủy gán lớp ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'CTHSSV + DAO_TAO',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    false,
    true,
    'Chỉ hủy gán trước khi có điểm danh; sau khi có điểm danh phải dùng quy trình điều chỉnh.',
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
$$;

create or replace function public.can_read_short_enrollment()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.can_read_short_course_erp()
    or public.has_permission('short_course.enrollment.read')
    or public.has_permission('short_course.enrollment.assign')
    or public.has_permission('short_course.enrollment.update')
$$;

create or replace function public.can_manage_short_enrollment()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.can_manage_short_course_erp()
    or public.has_permission('short_course.enrollment.assign')
    or public.has_permission('short_course.enrollment.update')
    or public.has_permission('short_course.enrollment.cancel')
$$;

grant execute on function public.can_read_short_course_erp() to authenticated;
grant execute on function public.can_manage_short_course_erp() to authenticated;
grant execute on function public.can_read_short_enrollment() to authenticated;
grant execute on function public.can_manage_short_enrollment() to authenticated;

alter table public.short_enrollments
  add column if not exists assignment_status text not null default 'UNASSIGNED',
  add column if not exists assigned_at timestamptz,
  add column if not exists assigned_by uuid references public.users_profile(id),
  add column if not exists assignment_verified_at timestamptz,
  add column if not exists assignment_verified_by uuid references public.users_profile(id),
  add column if not exists assignment_cancelled_at timestamptz,
  add column if not exists assignment_cancelled_by uuid references public.users_profile(id),
  add column if not exists assignment_cancel_reason text,
  add column if not exists assignment_note text,
  add column if not exists assignment_version int not null default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_enrollments_assignment_status_valid'
      and conrelid = 'public.short_enrollments'::regclass
  ) then
    alter table public.short_enrollments
      add constraint short_enrollments_assignment_status_valid
      check (assignment_status in (
        'UNASSIGNED',
        'ASSIGNED',
        'VERIFIED',
        'NEEDS_FIX',
        'CANCELLED'
      ));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'short_enrollments_assignment_version_positive'
      and conrelid = 'public.short_enrollments'::regclass
  ) then
    alter table public.short_enrollments
      add constraint short_enrollments_assignment_version_positive
      check (assignment_version > 0);
  end if;
end $$;

update public.short_enrollments
set assignment_status = case
      when enrollment_status = 'CANCELLED' then 'CANCELLED'
      when class_id is null then 'UNASSIGNED'
      when assignment_status = 'UNASSIGNED' then 'ASSIGNED'
      else assignment_status
    end,
    assigned_at = case
      when class_id is not null and assigned_at is null then coalesce(updated_at, created_at, now())
      else assigned_at
    end,
    assignment_version = greatest(coalesce(assignment_version, 1), 1),
    updated_at = now()
where record_status = 'ACTIVE';

create index if not exists idx_short_enrollments_assignment_status
on public.short_enrollments(assignment_status, enrollment_status)
where record_status = 'ACTIVE';

create index if not exists idx_short_enrollments_assignment_class
on public.short_enrollments(class_id, assignment_status, enrollment_status)
where record_status = 'ACTIVE' and class_id is not null;

create index if not exists idx_short_enrollments_assignment_student
on public.short_enrollments(student_id, class_id, assignment_status)
where record_status = 'ACTIVE';

create or replace view public.short_enrollment_class_assignment_readiness
with (security_invoker = true)
as
with base as (
  select
    e.id as enrollment_id,
    e.enrollment_code,
    e.student_id,
    s.student_code,
    s.student_name,
    s.student_phone,
    sq.profile_status as student_profile_status,
    sq.control_flags as student_control_flags,
    e.lead_id,
    l.lead_code,
    e.class_id,
    c.class_code,
    c.class_name,
    c.class_status,
    c.training_location,
    c.instructor_name,
    c.instructor_user_id,
    c.planned_start_date,
    c.planned_end_date,
    c.min_capacity,
    c.capacity,
    e.admission_segment_id,
    c.admission_segment_id as class_admission_segment_id,
    seg.segment_code,
    seg.segment_name,
    e.offering_id,
    c.offering_id as class_offering_id,
    eo.offering_code as enrollment_offering_code,
    eo.offering_name as enrollment_offering_name,
    co.offering_code as class_offering_code,
    co.offering_name as class_offering_name,
    co.is_enrollment_ready as class_offering_enrollment_ready,
    co.allowed_segment_codes as class_allowed_segment_codes,
    e.enrolled_on,
    e.enrollment_status,
    e.assignment_status,
    e.attendance_status,
    e.finance_status,
    e.bhxh_policy_status,
    e.evidence_status,
    e.assignment_note,
    e.assigned_at,
    e.assigned_by,
    e.assignment_verified_at,
    e.assignment_verified_by,
    e.assignment_cancelled_at,
    e.assignment_cancel_reason,
    e.assignment_version,
    e.record_status,
    e.created_at,
    e.updated_at,
    coalesce(class_stats.active_class_enrollment_count, 0)::int as active_class_enrollment_count,
    coalesce(class_stats.verified_class_student_count, 0)::int as verified_class_student_count,
    coalesce(dup_stats.duplicate_student_class_count, 0)::int as duplicate_student_class_count,
    coalesce(attendance_stats.attendance_record_count, 0)::int as attendance_record_count
  from public.short_enrollments e
  join public.short_student_master s on s.id = e.student_id
  left join public.short_student_master_quality_status sq on sq.id = e.student_id
  left join public.leads l on l.id = e.lead_id
  left join public.short_class_master c on c.id = e.class_id
  join public.admission_segments seg on seg.id = e.admission_segment_id
  left join public.admission_offering_catalog eo on eo.id = e.offering_id
  left join public.admission_offering_catalog co on co.id = c.offering_id
  left join lateral (
    select
      count(*) filter (where ce.enrollment_status not in ('CANCELLED')) as active_class_enrollment_count,
      count(*) filter (
        where ce.enrollment_status not in ('CANCELLED')
          and csq.profile_status in ('VERIFIED', 'VERIFIED_LOCKED')
      ) as verified_class_student_count
    from public.short_enrollments ce
    left join public.short_student_master_quality_status csq on csq.id = ce.student_id
    where ce.class_id = e.class_id
      and ce.record_status = 'ACTIVE'
  ) class_stats on e.class_id is not null
  left join lateral (
    select count(*) as duplicate_student_class_count
    from public.short_enrollments de
    where de.student_id = e.student_id
      and de.class_id = e.class_id
      and de.record_status = 'ACTIVE'
      and de.enrollment_status not in ('CANCELLED')
  ) dup_stats on e.class_id is not null
  left join lateral (
    select count(*) as attendance_record_count
    from public.short_attendance_records ar
    where ar.enrollment_id = e.id
      and ar.record_status = 'ACTIVE'
  ) attendance_stats on true
),
evaluated as (
  select
    b.*,
    array_remove(array[
      case when b.record_status <> 'ACTIVE'::public.record_status then 'ARCHIVED_ENROLLMENT' end,
      case when b.enrollment_status = 'CANCELLED' then 'CANCELLED_ENROLLMENT' end,
      case when b.student_id is null then 'NO_STUDENT' end,
      case when coalesce(b.student_profile_status, 'BLOCKED') not in ('VERIFIED', 'VERIFIED_LOCKED') then 'STUDENT_NOT_VERIFIED' end,
      case when b.class_id is null then 'NO_CLASS' end,
      case when b.class_id is not null and b.class_code is null then 'CLASS_NOT_FOUND' end,
      case when b.class_status in ('CANCELLED', 'ARCHIVED') then 'CLASS_CANCELLED_OR_ARCHIVED' end,
      case when b.class_status = 'COMPLETED' then 'CLASS_COMPLETED' end,
      case when b.class_status is not null and b.class_status not in ('PLANNED', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ARCHIVED') then 'INVALID_CLASS_STATUS' end,
      case when b.class_status in ('IN_PROGRESS') and b.attendance_record_count = 0 then 'CLASS_ALREADY_IN_PROGRESS' end,
      case when b.class_id is not null and b.class_status not in ('PLANNED', 'OPEN', 'IN_PROGRESS') then 'CLASS_NOT_ASSIGNABLE' end,
      case when b.class_id is not null and nullif(trim(coalesce(b.class_name, '')), '') is null then 'NO_CLASS_NAME' end,
      case when b.class_id is not null and nullif(trim(coalesce(b.training_location, '')), '') is null then 'NO_TRAINING_LOCATION' end,
      case when b.class_id is not null and nullif(trim(coalesce(b.instructor_name, '')), '') is null and b.instructor_user_id is null then 'NO_INSTRUCTOR' end,
      case when b.class_id is not null and b.planned_start_date is null then 'NO_START_DATE' end,
      case when b.class_id is not null and b.capacity is null then 'NO_CAPACITY' end,
      case when b.class_id is not null and b.capacity is not null and b.capacity < b.min_capacity then 'CAPACITY_LT_MIN' end,
      case when b.class_id is not null and b.capacity is not null and b.active_class_enrollment_count > b.capacity then 'CLASS_OVER_CAPACITY' end,
      case when b.class_id is not null and b.offering_id is distinct from b.class_offering_id then 'OFFERING_MISMATCH' end,
      case when b.class_id is not null and b.admission_segment_id is distinct from b.class_admission_segment_id then 'SEGMENT_MISMATCH' end,
      case when b.class_id is not null and b.class_offering_enrollment_ready = false then 'OFFERING_NOT_ENROLLMENT_READY' end,
      case when b.class_id is not null and b.class_allowed_segment_codes is not null and not (b.segment_code = any(b.class_allowed_segment_codes)) then 'OFFERING_NOT_ALLOWED_FOR_SEGMENT' end,
      case when b.duplicate_student_class_count > 1 then 'DUPLICATE_STUDENT_CLASS' end,
      case when b.attendance_record_count > 0 or b.attendance_status <> 'NOT_STARTED' then 'ATTENDANCE_ALREADY_STARTED' end
    ]::text[], null) as control_flags
  from base b
)
select
  e.*,
  case
    when e.record_status <> 'ACTIVE'::public.record_status then 'ARCHIVED'
    when e.enrollment_status = 'CANCELLED' or e.assignment_status = 'CANCELLED' then 'CANCELLED'
    when 'NO_CLASS' = any(e.control_flags) then 'UNASSIGNED'
    when e.control_flags && array[
      'STUDENT_NOT_VERIFIED',
      'CLASS_NOT_FOUND',
      'CLASS_CANCELLED_OR_ARCHIVED',
      'CLASS_COMPLETED',
      'CLASS_NOT_ASSIGNABLE',
      'NO_CLASS_NAME',
      'NO_TRAINING_LOCATION',
      'NO_INSTRUCTOR',
      'NO_START_DATE',
      'NO_CAPACITY',
      'CAPACITY_LT_MIN',
      'CLASS_OVER_CAPACITY',
      'OFFERING_MISMATCH',
      'SEGMENT_MISMATCH',
      'OFFERING_NOT_ENROLLMENT_READY',
      'OFFERING_NOT_ALLOWED_FOR_SEGMENT',
      'DUPLICATE_STUDENT_CLASS'
    ]::text[] then 'BLOCKED'
    when 'ATTENDANCE_ALREADY_STARTED' = any(e.control_flags) then 'IN_OPERATION'
    when e.class_status = 'PLANNED' and e.assignment_status = 'VERIFIED' then 'VERIFIED_READY_FOR_CLASS_OPEN'
    when e.class_status = 'PLANNED' then 'ASSIGNED_READY_FOR_CLASS_OPEN'
    when e.class_status in ('OPEN', 'IN_PROGRESS') and e.assignment_status = 'VERIFIED' then 'READY_FOR_ATTENDANCE'
    when e.class_status in ('OPEN', 'IN_PROGRESS') then 'ASSIGNED_NEEDS_VERIFY'
    else 'NEEDS_FIX'
  end as readiness_status
from evaluated e;

grant select on public.short_enrollment_class_assignment_readiness to authenticated;

create or replace function public.assign_short_enrollment_to_class(
  target_enrollment_id uuid,
  target_class_id uuid,
  p_assignment_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment public.short_enrollments%rowtype;
  v_class public.short_class_master%rowtype;
  v_student_quality record;
  v_class_segment_code text;
  v_class_offering_ready boolean;
  v_allowed_segment_codes text[];
  v_active_count int;
  v_duplicate_count int;
  v_attendance_count int;
begin
  if not (
    public.can_manage_short_enrollment()
    or public.has_permission('short_course.enrollment.assign')
  ) then
    raise exception 'Bạn chưa có quyền gán học viên ngắn hạn vào lớp.';
  end if;

  select *
  into v_enrollment
  from public.short_enrollments
  where id = target_enrollment_id
  for update;

  if not found then
    raise exception 'Không tìm thấy ghi danh ngắn hạn cần gán lớp.';
  end if;

  if v_enrollment.record_status <> 'ACTIVE'::public.record_status then
    raise exception 'Ghi danh này đã lưu trữ/không còn hiệu lực.';
  end if;

  if v_enrollment.enrollment_status in ('CANCELLED', 'COMPLETED') then
    raise exception 'Ghi danh đã % nên không thể gán lớp.', v_enrollment.enrollment_status;
  end if;

  select *
  into v_class
  from public.short_class_master
  where id = target_class_id
    and status = 'ACTIVE'::public.record_status
  for update;

  if not found then
    raise exception 'Không tìm thấy lớp ngắn hạn cần gán.';
  end if;

  select q.*
  into v_student_quality
  from public.short_student_master_quality_status q
  where q.id = v_enrollment.student_id;

  if not found or coalesce(v_student_quality.profile_status, 'BLOCKED') not in ('VERIFIED', 'VERIFIED_LOCKED') then
    raise exception 'Hồ sơ học viên chưa được xác minh. Hãy hoàn thiện Student Master trước khi gán lớp.';
  end if;

  if v_class.class_status not in ('PLANNED', 'OPEN') then
    raise exception 'Chỉ được gán học viên vào lớp PLANNED hoặc OPEN. Lớp hiện tại đang là %.', v_class.class_status;
  end if;

  if v_enrollment.offering_id is distinct from v_class.offering_id then
    raise exception 'Sai ngành/khoá: ghi danh và lớp không cùng offering.';
  end if;

  if v_enrollment.admission_segment_id is distinct from v_class.admission_segment_id then
    raise exception 'Sai đối tượng tuyển sinh: ghi danh và lớp không cùng phân hệ/đối tượng.';
  end if;

  select seg.segment_code,
         o.is_enrollment_ready,
         o.allowed_segment_codes
  into v_class_segment_code,
       v_class_offering_ready,
       v_allowed_segment_codes
  from public.short_class_master c
  join public.admission_segments seg on seg.id = c.admission_segment_id
  left join public.admission_offering_catalog o on o.id = c.offering_id
  where c.id = target_class_id;

  if coalesce(v_class_offering_ready, false) = false then
    raise exception 'Ngành/khoá của lớp chưa đủ điều kiện tuyển sinh/nhập học.';
  end if;

  if v_allowed_segment_codes is not null
     and not (v_class_segment_code = any(v_allowed_segment_codes)) then
    raise exception 'Ngành/khoá này không được phép dùng cho đối tượng tuyển sinh của lớp.';
  end if;

  if nullif(trim(coalesce(v_class.class_name, '')), '') is null then
    raise exception 'Lớp chưa có tên lớp.';
  end if;

  if nullif(trim(coalesce(v_class.training_location, '')), '') is null then
    raise exception 'Lớp chưa có địa điểm học.';
  end if;

  if nullif(trim(coalesce(v_class.instructor_name, '')), '') is null
     and v_class.instructor_user_id is null then
    raise exception 'Lớp chưa có giảng viên/phụ trách.';
  end if;

  if v_class.planned_start_date is null then
    raise exception 'Lớp chưa có ngày bắt đầu dự kiến.';
  end if;

  if v_class.capacity is null then
    raise exception 'Lớp chưa có sĩ số tối đa.';
  end if;

  if v_class.capacity < v_class.min_capacity then
    raise exception 'Sĩ số tối đa của lớp đang nhỏ hơn sĩ số tối thiểu.';
  end if;

  select count(*)::int
  into v_duplicate_count
  from public.short_enrollments de
  where de.id <> v_enrollment.id
    and de.student_id = v_enrollment.student_id
    and de.class_id = target_class_id
    and de.record_status = 'ACTIVE'::public.record_status
    and de.enrollment_status not in ('CANCELLED');

  if v_duplicate_count > 0 then
    raise exception 'Học viên này đã có ghi danh còn hiệu lực trong lớp này. Không được gán trùng.';
  end if;

  select count(*)::int
  into v_attendance_count
  from public.short_attendance_records ar
  where ar.enrollment_id = v_enrollment.id
    and ar.record_status = 'ACTIVE'::public.record_status;

  if v_enrollment.class_id is not null
     and v_enrollment.class_id is distinct from target_class_id
     and (v_enrollment.attendance_status <> 'NOT_STARTED' or v_attendance_count > 0) then
    raise exception 'Ghi danh đã có dữ liệu điểm danh nên không thể chuyển lớp trực tiếp.';
  end if;

  select count(*)::int
  into v_active_count
  from public.short_enrollments ce
  where ce.class_id = target_class_id
    and ce.id <> v_enrollment.id
    and ce.record_status = 'ACTIVE'::public.record_status
    and ce.enrollment_status not in ('CANCELLED');

  if v_active_count >= v_class.capacity
     and v_enrollment.class_id is distinct from target_class_id then
    raise exception 'Lớp đã đủ sĩ số tối đa (% học viên).', v_class.capacity;
  end if;

  update public.short_enrollments
  set class_id = target_class_id,
      enrolled_on = coalesce(enrolled_on, current_date),
      enrollment_status = case
        when enrollment_status = 'DRAFT' then 'ENROLLED'
        else enrollment_status
      end,
      assignment_status = 'ASSIGNED',
      assigned_at = now(),
      assigned_by = auth.uid(),
      assignment_verified_at = null,
      assignment_verified_by = null,
      assignment_cancelled_at = null,
      assignment_cancelled_by = null,
      assignment_cancel_reason = null,
      assignment_note = nullif(trim(coalesce(p_assignment_note, '')), ''),
      note = concat_ws(E'\n', nullif(note, ''), nullif(trim(coalesce(p_assignment_note, '')), '')),
      assignment_version = assignment_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_enrollment_id;

  return target_enrollment_id;
end;
$$;

create or replace function public.verify_short_enrollment_assignment(
  target_enrollment_id uuid,
  p_verify_note text default null
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
    public.can_manage_short_enrollment()
    or public.has_permission('short_course.enrollment.update')
  ) then
    raise exception 'Bạn chưa có quyền xác nhận gán lớp ngắn hạn.';
  end if;

  select *
  into v_ready
  from public.short_enrollment_class_assignment_readiness
  where enrollment_id = target_enrollment_id;

  if not found then
    raise exception 'Không tìm thấy ghi danh cần xác nhận gán lớp.';
  end if;

  if v_ready.readiness_status = 'BLOCKED' then
    raise exception 'Chưa thể xác nhận gán lớp. Lỗi cần xử lý: %', array_to_string(v_ready.control_flags, ', ');
  end if;

  if v_ready.readiness_status not in (
    'ASSIGNED_READY_FOR_CLASS_OPEN',
    'ASSIGNED_NEEDS_VERIFY',
    'READY_FOR_ATTENDANCE',
    'VERIFIED_READY_FOR_CLASS_OPEN'
  ) then
    raise exception 'Ghi danh chưa ở trạng thái có thể xác nhận gán lớp. Trạng thái hiện tại: %.', v_ready.readiness_status;
  end if;

  update public.short_enrollments
  set assignment_status = 'VERIFIED',
      assignment_verified_at = now(),
      assignment_verified_by = auth.uid(),
      assignment_note = nullif(trim(coalesce(p_verify_note, assignment_note, '')), ''),
      note = concat_ws(E'\n', nullif(note, ''), nullif(trim(coalesce(p_verify_note, '')), '')),
      assignment_version = assignment_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_enrollment_id;

  return target_enrollment_id;
end;
$$;

create or replace function public.unassign_short_enrollment_from_class(
  target_enrollment_id uuid,
  p_cancel_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment public.short_enrollments%rowtype;
  v_attendance_count int;
begin
  if not (
    public.can_manage_short_enrollment()
    or public.has_permission('short_course.enrollment.cancel')
  ) then
    raise exception 'Bạn chưa có quyền hủy gán lớp ngắn hạn.';
  end if;

  if nullif(trim(coalesce(p_cancel_reason, '')), '') is null then
    raise exception 'Hủy gán lớp phải có lý do.';
  end if;

  select *
  into v_enrollment
  from public.short_enrollments
  where id = target_enrollment_id
  for update;

  if not found then
    raise exception 'Không tìm thấy ghi danh cần hủy gán lớp.';
  end if;

  select count(*)::int
  into v_attendance_count
  from public.short_attendance_records ar
  where ar.enrollment_id = target_enrollment_id
    and ar.record_status = 'ACTIVE'::public.record_status;

  if v_enrollment.attendance_status <> 'NOT_STARTED' or v_attendance_count > 0 then
    raise exception 'Ghi danh đã có điểm danh nên không thể hủy gán lớp trực tiếp.';
  end if;

  update public.short_enrollments
  set class_id = null,
      enrollment_status = case
        when enrollment_status = 'ENROLLED' then 'DRAFT'
        else enrollment_status
      end,
      assignment_status = 'UNASSIGNED',
      assigned_at = null,
      assigned_by = null,
      assignment_verified_at = null,
      assignment_verified_by = null,
      assignment_cancelled_at = now(),
      assignment_cancelled_by = auth.uid(),
      assignment_cancel_reason = trim(p_cancel_reason),
      assignment_note = trim(p_cancel_reason),
      note = concat_ws(E'\n', nullif(note, ''), 'Hủy gán lớp: ' || trim(p_cancel_reason)),
      assignment_version = assignment_version + 1,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_enrollment_id;

  return target_enrollment_id;
end;
$$;

grant execute on function public.assign_short_enrollment_to_class(uuid, uuid, text) to authenticated;
grant execute on function public.verify_short_enrollment_assignment(uuid, text) to authenticated;
grant execute on function public.unassign_short_enrollment_from_class(uuid, text) to authenticated;

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
  (select count(*)::int from public.short_enrollment_class_assignment_readiness where readiness_status in ('ASSIGNED_NEEDS_VERIFY', 'READY_FOR_ATTENDANCE')) as enrollment_ready_for_attendance_count;

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
    'SHORT_ENROLLMENT_ASSIGN_REQUIRES_VERIFIED_STUDENT',
    'Gán lớp chỉ cho học viên đã xác minh hồ sơ',
    'ENROLLMENT_CLASS_ASSIGNMENT',
    'Học viên ngắn hạn phải đạt trạng thái VERIFIED hoặc VERIFIED_LOCKED trong Student Master trước khi được gán vào lớp.',
    'BLOCK',
    'short_enrollments,short_student_master',
    'P1-05 Short Enrollment Class Assignment',
    'CTHSSV + DAO_TAO',
    'IT_DATA',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_ENROLLMENT_ASSIGN_MATCHES_CLASS_OFFERING',
    'Gán lớp phải đúng ngành/khoá và đối tượng tuyển sinh',
    'ENROLLMENT_CLASS_ASSIGNMENT',
    'Ghi danh chỉ được gán vào lớp có cùng admission_segment_id và offering_id để tránh trộn Trung cấp, ngắn hạn, liên thông hoặc sai ngành.',
    'BLOCK',
    'short_enrollments,short_class_master,admission_offering_catalog',
    'P1-05 Short Enrollment Class Assignment',
    'CTHSSV + DAO_TAO',
    'IT_DATA',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_ENROLLMENT_ASSIGN_NO_OVER_CAPACITY',
    'Không gán vượt sĩ số lớp',
    'ENROLLMENT_CLASS_ASSIGNMENT',
    'Function assign_short_enrollment_to_class chặn gán học viên khi lớp đã đạt sĩ số tối đa.',
    'BLOCK',
    'short_enrollments,short_class_master',
    'P1-05 Short Enrollment Class Assignment',
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
  'WF_P1_05_SHORT_ENROLLMENT_CLASS_ASSIGNMENT',
  'P1-05 Gán học viên ngắn hạn vào lớp',
  'M11_SHORT_COURSE_ERP',
  'Sau khi học viên ngắn hạn có Student Master đã xác minh và có lớp PLANNED/OPEN đúng ngành/khoá.',
  'CTHSSV',
  'CTHSSV + DAO_TAO',
  'IT_DATA',
  'BGH',
  'Học viên được gán đúng lớp, đúng ngành/khoá, không trùng và không vượt sĩ số để chuẩn bị mở lớp/điểm danh.',
  'Ghi danh VERIFIED_READY_FOR_CLASS_OPEN được chuyển sang P1-04 mở lớp; lớp OPEN/IN_PROGRESS chuyển tiếp sang điểm danh P1-06.',
  'Mọi gán/xác nhận/hủy gán lớp đều ghi audit log qua bảng short_enrollments.',
  905,
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
  'APPROVE_P1_05_SHORT_ENROLLMENT_ASSIGNMENT',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_05_SHORT_ENROLLMENT_CLASS_ASSIGNMENT',
  'Xác nhận danh sách học viên vào lớp ngắn hạn',
  'DEPARTMENT',
  'CTHSSV',
  'IT_DATA',
  'BGH',
  'Student Master đã xác minh, lớp đúng ngành/khoá/đối tượng, lớp chưa vượt sĩ số và chưa có điểm danh sai.',
  'Không xác nhận nếu short_enrollment_class_assignment_readiness = BLOCKED.',
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
    'SHORT_ENROLLMENT_CLASS_ASSIGNMENT',
    'Gán học viên ngắn hạn vào lớp',
    'M11_SHORT_COURSE_ERP',
    'short_enrollments',
    'TRANSACTION',
    'CTHSSV + DAO_TAO',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'P1-05: Chỉ tạo/sửa/hủy gán lớp qua function kiểm soát đúng học viên, đúng lớp, đúng ngành/khoá và sĩ số.',
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_ENROLLMENT_CLASS_ASSIGNMENT_READINESS',
    'Tình trạng sẵn sàng gán lớp học viên ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_enrollment_class_assignment_readiness',
    'REPORT_VIEW',
    'CTHSSV + IT_DATA',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'View chỉ đọc để phát hiện học viên chưa xác minh, sai ngành/khoá, lớp đầy, trùng lớp hoặc đã phát sinh điểm danh.',
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
    'RISK_P1_05_WRONG_CLASS_ASSIGNMENT',
    'Gán học viên sai lớp/sai ngành/sai đối tượng',
    'M11_SHORT_COURSE_ERP',
    'DATA_CONTROL',
    'HIGH',
    'CTHSSV + DAO_TAO',
    'Nếu học viên ngắn hạn bị gán nhầm lớp hoặc nhầm ngành/khoá, điểm danh, BHXH, tài chính và thanh toán sẽ sai dây chuyền.',
    'Function assign_short_enrollment_to_class chặn OFFERING_MISMATCH và SEGMENT_MISMATCH.',
    'IT_DATA rà soát readiness BLOCKED hằng ngày; BGH xử lý nếu phát sinh gán sai đã có điểm danh.',
    'Số ghi danh có readiness_status = BLOCKED hoặc flag OFFERING_MISMATCH/SEGMENT_MISMATCH.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_05_DUPLICATE_OR_OVER_CAPACITY',
    'Gán trùng học viên hoặc vượt sĩ số lớp',
    'M11_SHORT_COURSE_ERP',
    'OPERATION',
    'HIGH',
    'DAO_TAO',
    'Gán trùng hoặc vượt sĩ số làm sai danh sách lớp, sai điểm danh, sai nghĩa vụ tài chính và sai báo cáo vận hành.',
    'Unique/index hiện có và function gán lớp kiểm soát trùng học viên/lớp, lớp đầy và over capacity.',
    'Đào tạo tách lớp hoặc điều chỉnh lớp trước khi mở nếu cảnh báo CLASS_OVER_CAPACITY xuất hiện.',
    'Số ghi danh có flag DUPLICATE_STUDENT_CLASS hoặc CLASS_OVER_CAPACITY.',
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
    'short_enrollment_class_assignment_readiness',
    'Kiểm tra gán học viên ngắn hạn vào lớp',
    'M11_SHORT_COURSE_ERP',
    'REPORT_VIEW',
    'CTHSSV + DAO_TAO + IT_DATA',
    'View kiểm tra từng ghi danh đã đủ điều kiện gán/xác nhận vào lớp hay chưa.',
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
    ('assignment_status', 'Trạng thái gán lớp', 'text', true, false, false, true, 'UNASSIGNED/ASSIGNED/VERIFIED/NEEDS_FIX/CANCELLED', 'Không dùng để thay thế trạng thái học tập; chỉ kiểm soát việc gán lớp.'),
    ('class_id', 'Lớp được gán', 'uuid', false, false, false, true, 'Phải cùng admission_segment_id và offering_id với ghi danh.', 'Lớp là điểm nối sang điểm danh, tài chính và vận hành.'),
    ('readiness_status', 'Trạng thái sẵn sàng', 'text', true, false, false, true, 'UNASSIGNED/BLOCKED/ASSIGNED_READY_FOR_CLASS_OPEN/VERIFIED_READY_FOR_CLASS_OPEN/ASSIGNED_NEEDS_VERIFY/READY_FOR_ATTENDANCE/IN_OPERATION', 'Dùng cho dashboard và cảnh báo vận hành.'),
    ('control_flags', 'Cờ lỗi/kiểm soát', 'text[]', false, false, false, true, 'Danh sách lỗi chi tiết theo từng ghi danh.', 'Chỗ nào sai thì chỉ đúng chỗ đó, dữ liệu đúng giữ nguyên.')
) as f(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, validation_rule, note)
where t.table_code = 'short_enrollment_class_assignment_readiness'
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
  'OWN_P1_05_SHORT_ENROLLMENT_CLASS_ASSIGNMENT',
  'P1-05 Gán học viên ngắn hạn vào lớp',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_05_SHORT_ENROLLMENT_CLASS_ASSIGNMENT',
  'WORKFLOW',
  'short_enrollments',
  'CTHSSV + DAO_TAO',
  'CTHSSV',
  'IT_DATA',
  'BGH',
  'ROLE_AND_SCOPE',
  'TUYEN_SINH',
  'DAO_TAO',
  'Student Master đã xác minh, Class Master đúng ngành/khoá, lớp còn sĩ số và chưa có cảnh báo BLOCKED.',
  'Mọi thay đổi class_id/assignment_status phải qua function và audit log.',
  24,
  'HIGH',
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
  'GATE_P1_05_SHORT_ENROLLMENT_READY',
  'Gate P1-05: học viên ngắn hạn sẵn sàng vào lớp',
  'DATA',
  'VIEW',
  'short_enrollment_class_assignment_readiness',
  'CTHSSV + DAO_TAO',
  'IT_DATA kiểm tra không còn BLOCKED trước khi xác nhận danh sách lớp.',
  'BGH chỉ duyệt khi học viên đúng lớp/ngành/khoá và không vượt sĩ số.',
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
  'NAV_P1_05_SHORT_ENROLLMENT_ASSIGNMENT',
  'P1-05 Gán học viên vào lớp',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/master-control/modules/M11_SHORT_COURSE_ERP',
  'Kiểm soát gán học viên ngắn hạn vào đúng lớp/ngành/khoá, không trùng, không vượt sĩ số.',
  'CTHSSV + DAO_TAO',
  'Kiểm tra readiness và xác nhận gán lớp',
  115,
  true,
  'Cảnh báo nếu short_enrollment_class_assignment_readiness có readiness_status = BLOCKED hoặc UNASSIGNED.',
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
