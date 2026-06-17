-- Step 68 - P1-04 Short Course Class Master control.
-- Run after step67_retry_p1_03_short_student_master_control.sql.
--
-- Purpose:
-- - Upgrade short_class_master into a controlled Class Master for short-course ERP.
-- - Create/open/update classes through guarded functions, not free-form edits.
-- - Check class readiness: offering, location, instructor, schedule, capacity and verified students.
-- - Register P1-04 in Master Control / HEU OS Map.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('short_course.class.read'),
    ('short_course.class.create'),
    ('short_course.class.update'),
    ('short_course.class.open'),
    ('short_course.class.lock')
) as p(permission)
where r.code in ('ADMIN', 'BGH', 'AUDIT', 'ADMISSION_HEAD', 'TEAM_LEAD', 'CTHSSV', 'CTHSSV_LEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('short_course.class.read')
) as p(permission)
where r.code in ('COUNSELOR', 'ADMISSION_STAFF', 'ACCOUNTING', 'ACCOUNTING_LEAD', 'KHTC')
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
    or public.has_permission('short_course.class.manage')
    or public.has_permission('short_course.class.open')
$$;

grant execute on function public.can_read_short_course_erp() to authenticated;
grant execute on function public.can_manage_short_course_erp() to authenticated;
grant execute on function public.can_manage_short_attendance() to authenticated;

alter table public.short_class_master
add column if not exists class_type text not null default 'SHORT_COURSE',
add column if not exists learning_mode text not null default 'OFFLINE',
add column if not exists room_name text,
add column if not exists min_capacity int not null default 1,
add column if not exists opened_at timestamptz,
add column if not exists opened_by uuid references public.users_profile(id),
add column if not exists open_approved_at timestamptz,
add column if not exists open_approved_by uuid references public.users_profile(id),
add column if not exists open_gate_status text not null default 'NOT_READY',
add column if not exists schedule_quality_status text not null default 'NEEDS_CHECK',
add column if not exists class_quality_status text not null default 'NEEDS_CHECK',
add column if not exists locked_reason text,
add column if not exists source_file_url text,
add column if not exists class_version int not null default 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'short_class_type_valid'
      and conrelid = 'public.short_class_master'::regclass
  ) then
    alter table public.short_class_master
    add constraint short_class_type_valid
    check (class_type in ('SHORT_COURSE', 'SHORT_BHXH_POLICY', 'WORKSHOP', 'OTHER'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'short_class_learning_mode_valid'
      and conrelid = 'public.short_class_master'::regclass
  ) then
    alter table public.short_class_master
    add constraint short_class_learning_mode_valid
    check (learning_mode in ('OFFLINE', 'ONLINE', 'HYBRID'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'short_class_open_gate_status_valid'
      and conrelid = 'public.short_class_master'::regclass
  ) then
    alter table public.short_class_master
    add constraint short_class_open_gate_status_valid
    check (open_gate_status in ('NOT_READY', 'READY', 'APPROVED', 'BLOCKED', 'NEEDS_FIX'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'short_class_schedule_quality_status_valid'
      and conrelid = 'public.short_class_master'::regclass
  ) then
    alter table public.short_class_master
    add constraint short_class_schedule_quality_status_valid
    check (schedule_quality_status in ('NEEDS_CHECK', 'READY', 'NEEDS_FIX', 'LOCKED'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'short_class_quality_status_valid'
      and conrelid = 'public.short_class_master'::regclass
  ) then
    alter table public.short_class_master
    add constraint short_class_quality_status_valid
    check (class_quality_status in ('NEEDS_CHECK', 'READY', 'NEEDS_FIX', 'OPEN_APPROVED', 'LOCKED', 'CANCELLED'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'short_class_min_capacity_positive'
      and conrelid = 'public.short_class_master'::regclass
  ) then
    alter table public.short_class_master
    add constraint short_class_min_capacity_positive
    check (min_capacity > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'short_class_capacity_range_valid'
      and conrelid = 'public.short_class_master'::regclass
  ) then
    alter table public.short_class_master
    add constraint short_class_capacity_range_valid
    check (capacity is null or capacity >= min_capacity);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'short_class_version_positive'
      and conrelid = 'public.short_class_master'::regclass
  ) then
    alter table public.short_class_master
    add constraint short_class_version_positive
    check (class_version > 0);
  end if;
end $$;

create sequence if not exists public.short_class_code_seq;

create or replace function public.next_short_class_code()
returns text
language sql
volatile
security definer
set search_path = public
as $$
  select 'SC-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('public.short_class_code_seq')::text, 6, '0');
$$;

grant execute on function public.next_short_class_code() to authenticated;

create index if not exists idx_short_class_master_quality
on public.short_class_master(class_quality_status, open_gate_status, data_locked)
where status = 'ACTIVE';

create index if not exists idx_short_class_master_dates
on public.short_class_master(planned_start_date, planned_end_date, class_status)
where status = 'ACTIVE';

create or replace function public.can_read_short_class_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.can_read_short_course_erp()
    or public.has_permission('short_course.class.read')
    or public.has_permission('short_course.class.create')
    or public.has_permission('short_course.class.update')
    or public.has_permission('short_course.class.open')
$$;

create or replace function public.can_manage_short_class_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.can_manage_short_course_erp()
    or public.has_permission('short_course.class.create')
    or public.has_permission('short_course.class.update')
    or public.has_permission('short_course.class.open')
    or public.has_permission('short_course.class.lock')
$$;

grant execute on function public.can_read_short_class_master() to authenticated;
grant execute on function public.can_manage_short_class_master() to authenticated;

create or replace view public.short_class_master_readiness
with (security_invoker = true)
as
select
  c.id,
  c.class_code,
  c.class_name,
  c.admission_segment_id,
  seg.segment_code,
  seg.segment_name,
  c.offering_id,
  o.offering_code,
  o.offering_name,
  o.program_id,
  p.program_code,
  p.program_name,
  c.training_location,
  c.room_name,
  c.learning_mode,
  c.instructor_name,
  c.instructor_user_id,
  c.planned_start_date,
  c.planned_end_date,
  c.actual_start_date,
  c.actual_end_date,
  c.min_capacity,
  c.capacity,
  c.schedule_note,
  c.class_status,
  c.open_gate_status,
  c.schedule_quality_status,
  c.class_quality_status,
  c.data_locked,
  c.locked_reason,
  c.opened_at,
  c.opened_by,
  c.open_approved_at,
  c.open_approved_by,
  c.class_version,
  c.status,
  c.created_at,
  c.updated_at,
  coalesce(enrollment_stats.enrollment_count, 0)::int as enrollment_count,
  coalesce(enrollment_stats.active_enrollment_count, 0)::int as active_enrollment_count,
  coalesce(enrollment_stats.verified_student_count, 0)::int as verified_student_count,
  coalesce(attendance_stats.session_count, 0)::int as attendance_session_count,
  array_remove(array[
    case when nullif(trim(coalesce(c.class_code, '')), '') is null then 'NO_CLASS_CODE' end,
    case when nullif(trim(coalesce(c.class_name, '')), '') is null then 'NO_CLASS_NAME' end,
    case when c.admission_segment_id is null then 'NO_SEGMENT' end,
    case when c.offering_id is null then 'NO_OFFERING' end,
    case when o.id is null then 'INVALID_OFFERING' end,
    case when o.id is not null and o.is_enrollment_ready = false then 'OFFERING_NOT_ENROLLMENT_READY' end,
    case when o.id is not null and not (seg.segment_code = any(o.allowed_segment_codes)) then 'OFFERING_NOT_ALLOWED_FOR_SEGMENT' end,
    case when nullif(trim(coalesce(c.training_location, '')), '') is null then 'NO_TRAINING_LOCATION' end,
    case when nullif(trim(coalesce(c.instructor_name, '')), '') is null and c.instructor_user_id is null then 'NO_INSTRUCTOR' end,
    case when c.planned_start_date is null then 'NO_START_DATE' end,
    case when c.planned_end_date is not null and c.planned_start_date is not null and c.planned_end_date < c.planned_start_date then 'INVALID_DATE_RANGE' end,
    case when c.capacity is null then 'NO_CAPACITY' end,
    case when c.capacity is not null and c.capacity < c.min_capacity then 'CAPACITY_LT_MIN' end,
    case when c.capacity is not null and coalesce(enrollment_stats.active_enrollment_count, 0) > c.capacity then 'OVER_CAPACITY' end,
    case when coalesce(enrollment_stats.verified_student_count, 0) < c.min_capacity then 'NOT_ENOUGH_VERIFIED_STUDENTS' end,
    case when c.data_locked = true and nullif(trim(coalesce(c.locked_reason, '')), '') is null then 'LOCKED_WITHOUT_REASON' end
  ], null) as control_flags,
  case
    when c.status <> 'ACTIVE' then 'ARCHIVED'
    when c.class_status in ('CANCELLED', 'ARCHIVED') then c.class_status
    when c.class_status in ('OPEN', 'IN_PROGRESS', 'COMPLETED') then c.class_status
    when nullif(trim(coalesce(c.class_code, '')), '') is null
      or nullif(trim(coalesce(c.class_name, '')), '') is null
      or c.offering_id is null
      or o.id is null
      or c.planned_start_date is null
      or c.capacity is null
      or (c.capacity is not null and c.capacity < c.min_capacity)
      or (c.planned_end_date is not null and c.planned_start_date is not null and c.planned_end_date < c.planned_start_date)
      or (c.capacity is not null and coalesce(enrollment_stats.active_enrollment_count, 0) > c.capacity)
      then 'BLOCKED'
    when o.is_enrollment_ready = false
      or not (seg.segment_code = any(o.allowed_segment_codes))
      or nullif(trim(coalesce(c.training_location, '')), '') is null
      or (nullif(trim(coalesce(c.instructor_name, '')), '') is null and c.instructor_user_id is null)
      or coalesce(enrollment_stats.verified_student_count, 0) < c.min_capacity
      then 'NEEDS_FIX'
    when c.open_gate_status = 'APPROVED' then 'OPEN_READY_APPROVED'
    else 'OPEN_READY'
  end as readiness_status
from public.short_class_master c
join public.admission_segments seg on seg.id = c.admission_segment_id
left join public.admission_offering_catalog o on o.id = c.offering_id
left join public.admission_programs p on p.id = o.program_id
left join lateral (
  select
    count(*) as enrollment_count,
    count(*) filter (where e.enrollment_status not in ('CANCELLED')) as active_enrollment_count,
    count(*) filter (
      where e.enrollment_status not in ('CANCELLED')
        and sq.profile_status in ('VERIFIED', 'VERIFIED_LOCKED')
    ) as verified_student_count
  from public.short_enrollments e
  left join public.short_student_master_quality_status sq on sq.id = e.student_id
  where e.class_id = c.id
    and e.record_status = 'ACTIVE'
) enrollment_stats on true
left join lateral (
  select count(*) as session_count
  from public.short_attendance_sessions s
  where s.class_id = c.id
    and s.record_status = 'ACTIVE'
) attendance_stats on true
where c.status = 'ACTIVE';

grant select on public.short_class_master_readiness to authenticated;

create or replace function public.create_short_class(
  target_segment_id uuid,
  target_offering_id uuid,
  class_name text,
  training_location text default null,
  capacity int default null,
  planned_start_date date default null,
  planned_end_date date default null,
  instructor_name text default null,
  instructor_user_id uuid default null,
  schedule_note text default null,
  create_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offering public.admission_offering_catalog%rowtype;
  v_segment public.admission_segments%rowtype;
  v_class_id uuid;
begin
  if not public.can_manage_short_class_master() then
    raise exception 'Tài khoản chưa có quyền tạo lớp ngắn hạn.';
  end if;

  select *
  into v_segment
  from public.admission_segments
  where id = target_segment_id
    and status = 'ACTIVE';

  if not found then
    raise exception 'Không tìm thấy đối tượng tuyển sinh ngắn hạn.';
  end if;

  if not public.can_access_business_scope(target_segment_id, null::uuid) then
    raise exception 'Tài khoản không có phạm vi tạo lớp cho đối tượng tuyển sinh này.';
  end if;

  select *
  into v_offering
  from public.admission_offering_catalog
  where id = target_offering_id
    and status = 'ACTIVE';

  if not found then
    raise exception 'Không tìm thấy ngành/khoá ngắn hạn.';
  end if;

  if not (v_segment.segment_code = any(v_offering.allowed_segment_codes)) then
    raise exception 'Ngành/khoá này không thuộc đối tượng tuyển sinh đã chọn.';
  end if;

  if nullif(trim(coalesce(class_name, '')), '') is null then
    raise exception 'Tên lớp không được để trống.';
  end if;

  if capacity is not null and capacity <= 0 then
    raise exception 'Sức chứa lớp phải lớn hơn 0.';
  end if;

  if planned_end_date is not null
    and planned_start_date is not null
    and planned_end_date < planned_start_date then
    raise exception 'Ngày kết thúc dự kiến không được trước ngày bắt đầu.';
  end if;

  insert into public.short_class_master (
    class_code,
    class_name,
    admission_segment_id,
    offering_id,
    training_location,
    instructor_name,
    instructor_user_id,
    planned_start_date,
    planned_end_date,
    capacity,
    schedule_note,
    class_status,
    class_type,
    learning_mode,
    min_capacity,
    open_gate_status,
    schedule_quality_status,
    class_quality_status,
    note,
    status,
    created_by,
    updated_by
  ) values (
    public.next_short_class_code(),
    trim(class_name),
    target_segment_id,
    target_offering_id,
    nullif(trim(coalesce(training_location, '')), ''),
    nullif(trim(coalesce(instructor_name, '')), ''),
    instructor_user_id,
    planned_start_date,
    planned_end_date,
    capacity,
    nullif(trim(coalesce(schedule_note, '')), ''),
    'PLANNED',
    'SHORT_COURSE',
    'OFFLINE',
    1,
    'NOT_READY',
    'NEEDS_CHECK',
    'NEEDS_CHECK',
    create_note,
    'ACTIVE'::public.record_status,
    auth.uid(),
    auth.uid()
  )
  returning id into v_class_id;

  return v_class_id;
end;
$$;

create or replace function public.update_short_class_profile(
  target_class_id uuid,
  class_patch jsonb,
  update_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.short_class_master%rowtype;
  v_class_name text;
  v_capacity int;
  v_min_capacity int;
  v_start_date date;
  v_end_date date;
begin
  if class_patch is null or jsonb_typeof(class_patch) <> 'object' then
    raise exception 'Dữ liệu cập nhật lớp không hợp lệ.';
  end if;

  select *
  into v_class
  from public.short_class_master
  where id = target_class_id
    and status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'Không tìm thấy lớp ngắn hạn.';
  end if;

  if not (
    public.can_manage_short_class_master()
    and public.can_access_business_scope(v_class.admission_segment_id, null::uuid)
  ) then
    raise exception 'Tài khoản chưa có quyền cập nhật lớp ngắn hạn.';
  end if;

  if v_class.data_locked then
    raise exception 'Lớp đã khóa. Cần mở khóa có lý do trước khi sửa.';
  end if;

  if v_class.class_status in ('IN_PROGRESS', 'COMPLETED', 'ARCHIVED') then
    raise exception 'Lớp đã vận hành/kết thúc nên không được sửa trực tiếp.';
  end if;

  v_class_name :=
    case
      when class_patch ? 'class_name' then nullif(trim(class_patch->>'class_name'), '')
      else v_class.class_name
    end;

  if v_class_name is null then
    raise exception 'Tên lớp không được để trống.';
  end if;

  v_min_capacity :=
    case
      when class_patch ? 'min_capacity' and nullif(class_patch->>'min_capacity', '') is not null then (class_patch->>'min_capacity')::int
      when class_patch ? 'min_capacity' then 1
      else v_class.min_capacity
    end;

  if v_min_capacity <= 0 then
    raise exception 'Sĩ số tối thiểu phải lớn hơn 0.';
  end if;

  v_capacity :=
    case
      when class_patch ? 'capacity' and nullif(class_patch->>'capacity', '') is not null then (class_patch->>'capacity')::int
      when class_patch ? 'capacity' then null
      else v_class.capacity
    end;

  if v_capacity is not null and v_capacity < v_min_capacity then
    raise exception 'Sức chứa lớp phải lớn hơn hoặc bằng sĩ số tối thiểu.';
  end if;

  v_start_date :=
    case
      when class_patch ? 'planned_start_date' and nullif(class_patch->>'planned_start_date', '') is not null then (class_patch->>'planned_start_date')::date
      when class_patch ? 'planned_start_date' then null
      else v_class.planned_start_date
    end;

  v_end_date :=
    case
      when class_patch ? 'planned_end_date' and nullif(class_patch->>'planned_end_date', '') is not null then (class_patch->>'planned_end_date')::date
      when class_patch ? 'planned_end_date' then null
      else v_class.planned_end_date
    end;

  if v_end_date is not null and v_start_date is not null and v_end_date < v_start_date then
    raise exception 'Ngày kết thúc dự kiến không được trước ngày bắt đầu.';
  end if;

  update public.short_class_master
  set
    class_name = v_class_name,
    training_location = case when class_patch ? 'training_location' then nullif(trim(class_patch->>'training_location'), '') else training_location end,
    room_name = case when class_patch ? 'room_name' then nullif(trim(class_patch->>'room_name'), '') else room_name end,
    learning_mode = case when class_patch ? 'learning_mode' then coalesce(nullif(trim(class_patch->>'learning_mode'), ''), learning_mode) else learning_mode end,
    instructor_name = case when class_patch ? 'instructor_name' then nullif(trim(class_patch->>'instructor_name'), '') else instructor_name end,
    instructor_user_id = case when class_patch ? 'instructor_user_id' and nullif(class_patch->>'instructor_user_id', '') is not null then (class_patch->>'instructor_user_id')::uuid when class_patch ? 'instructor_user_id' then null else instructor_user_id end,
    planned_start_date = v_start_date,
    planned_end_date = v_end_date,
    capacity = v_capacity,
    min_capacity = v_min_capacity,
    schedule_note = case when class_patch ? 'schedule_note' then nullif(trim(class_patch->>'schedule_note'), '') else schedule_note end,
    source_file_url = case when class_patch ? 'source_file_url' then nullif(trim(class_patch->>'source_file_url'), '') else source_file_url end,
    open_gate_status = 'NOT_READY',
    schedule_quality_status = 'NEEDS_CHECK',
    class_quality_status = 'NEEDS_CHECK',
    class_version = coalesce(class_version, 1) + 1,
    note = case
      when nullif(trim(coalesce(update_note, '')), '') is null then note
      else concat_ws(E'\n', note, 'P1-04 cập nhật lớp: ' || trim(update_note))
    end,
    updated_by = auth.uid(),
    updated_at = now()
  where id = target_class_id;

  return target_class_id;
end;
$$;

create or replace function public.open_short_class(
  target_class_id uuid,
  open_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.short_class_master%rowtype;
  v_readiness record;
begin
  select *
  into v_class
  from public.short_class_master
  where id = target_class_id
    and status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'Không tìm thấy lớp ngắn hạn.';
  end if;

  if not (
    (public.can_manage_short_class_master() or public.has_permission('short_course.class.open'))
    and public.can_access_business_scope(v_class.admission_segment_id, null::uuid)
  ) then
    raise exception 'Tài khoản chưa có quyền mở lớp ngắn hạn.';
  end if;

  if v_class.class_status in ('OPEN', 'IN_PROGRESS', 'COMPLETED') then
    return target_class_id;
  end if;

  if v_class.class_status in ('CANCELLED', 'ARCHIVED') then
    raise exception 'Lớp đã hủy/lưu trữ nên không thể mở.';
  end if;

  select *
  into v_readiness
  from public.short_class_master_readiness
  where id = target_class_id;

  if not found then
    raise exception 'Không đọc được tình trạng kiểm tra lớp.';
  end if;

  if v_readiness.readiness_status <> 'OPEN_READY' then
    raise exception 'Lớp chưa đủ điều kiện mở. Cần xử lý các mục: %', array_to_string(v_readiness.control_flags, ', ');
  end if;

  update public.short_class_master
  set
    class_status = 'OPEN',
    open_gate_status = 'APPROVED',
    schedule_quality_status = 'READY',
    class_quality_status = 'OPEN_APPROVED',
    opened_at = now(),
    opened_by = auth.uid(),
    open_approved_at = now(),
    open_approved_by = auth.uid(),
    data_locked = true,
    locked_reason = coalesce(nullif(trim(open_note), ''), 'P1-04: Lớp đã được duyệt mở'),
    locked_by = auth.uid(),
    locked_at = now(),
    note = case
      when nullif(trim(coalesce(open_note, '')), '') is null then note
      else concat_ws(E'\n', note, 'P1-04 mở lớp: ' || trim(open_note))
    end,
    updated_by = auth.uid(),
    updated_at = now()
  where id = target_class_id;

  return target_class_id;
end;
$$;

create or replace function public.set_short_class_lock(
  target_class_id uuid,
  should_lock boolean,
  lock_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.short_class_master%rowtype;
begin
  select *
  into v_class
  from public.short_class_master
  where id = target_class_id
    and status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'Không tìm thấy lớp ngắn hạn.';
  end if;

  if not (
    (public.can_manage_short_class_master() or public.has_permission('short_course.class.lock'))
    and public.can_access_business_scope(v_class.admission_segment_id, null::uuid)
  ) then
    raise exception 'Tài khoản chưa có quyền khóa/mở khóa lớp ngắn hạn.';
  end if;

  if should_lock and nullif(trim(coalesce(lock_reason, '')), '') is null then
    raise exception 'Cần nhập lý do khóa lớp.';
  end if;

  update public.short_class_master
  set
    data_locked = should_lock,
    locked_reason = case when should_lock then lock_reason else null end,
    locked_by = case when should_lock then auth.uid() else null end,
    locked_at = case when should_lock then now() else null end,
    class_quality_status = case
      when should_lock and class_quality_status = 'OPEN_APPROVED' then 'OPEN_APPROVED'
      when should_lock then 'LOCKED'
      when class_quality_status = 'LOCKED' then 'NEEDS_CHECK'
      else class_quality_status
    end,
    schedule_quality_status = case
      when should_lock and schedule_quality_status = 'READY' then 'READY'
      when should_lock then 'LOCKED'
      when schedule_quality_status = 'LOCKED' then 'NEEDS_CHECK'
      else schedule_quality_status
    end,
    note = concat_ws(
      E'\n',
      note,
      case
        when should_lock then 'P1-04 khóa lớp: ' || trim(lock_reason)
        else 'P1-04 mở khóa lớp để chỉnh sửa.'
      end
    ),
    updated_by = auth.uid(),
    updated_at = now()
  where id = target_class_id;

  return target_class_id;
end;
$$;

create or replace function public.set_short_class_status(
  target_class_id uuid,
  target_status text,
  status_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.short_class_master%rowtype;
begin
  if target_status = 'OPEN' then
    return public.open_short_class(target_class_id, status_note);
  end if;

  select *
  into v_class
  from public.short_class_master
  where id = target_class_id
    and status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'Không tìm thấy lớp ngắn hạn.';
  end if;

  if not (
    public.can_manage_short_class_master()
    and public.can_access_business_scope(v_class.admission_segment_id, null::uuid)
  ) then
    raise exception 'Tài khoản chưa có quyền đổi trạng thái lớp ngắn hạn.';
  end if;

  if target_status not in ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') then
    raise exception 'Trạng thái lớp không hợp lệ.';
  end if;

  if v_class.class_status = 'PLANNED' and target_status not in ('PLANNED', 'CANCELLED') then
    raise exception 'Lớp PLANNED muốn mở phải dùng gate mở lớp P1-04.';
  end if;

  if v_class.class_status = 'OPEN' and target_status not in ('IN_PROGRESS', 'CANCELLED') then
    raise exception 'Lớp OPEN chỉ được chuyển sang IN_PROGRESS hoặc CANCELLED.';
  end if;

  if v_class.class_status = 'IN_PROGRESS' and target_status not in ('COMPLETED') then
    raise exception 'Lớp IN_PROGRESS chỉ được chuyển sang COMPLETED.';
  end if;

  if v_class.class_status in ('COMPLETED', 'CANCELLED', 'ARCHIVED') then
    raise exception 'Lớp đã kết thúc/hủy/lưu trữ không được đổi trạng thái.';
  end if;

  update public.short_class_master
  set
    class_status = target_status,
    class_quality_status = case
      when target_status = 'CANCELLED' then 'CANCELLED'
      when target_status in ('IN_PROGRESS', 'COMPLETED') then 'OPEN_APPROVED'
      else class_quality_status
    end,
    data_locked = case when target_status in ('IN_PROGRESS', 'COMPLETED', 'CANCELLED') then true else data_locked end,
    locked_reason = case
      when target_status in ('IN_PROGRESS', 'COMPLETED', 'CANCELLED')
      then coalesce(nullif(trim(status_note), ''), 'P1-04: Khóa theo trạng thái lớp ' || target_status)
      else locked_reason
    end,
    locked_by = case when target_status in ('IN_PROGRESS', 'COMPLETED', 'CANCELLED') then auth.uid() else locked_by end,
    locked_at = case when target_status in ('IN_PROGRESS', 'COMPLETED', 'CANCELLED') then now() else locked_at end,
    note = case
      when nullif(trim(coalesce(status_note, '')), '') is null then note
      else concat_ws(E'\n', note, 'P1-04 đổi trạng thái lớp sang ' || target_status || ': ' || trim(status_note))
    end,
    updated_by = auth.uid(),
    updated_at = now()
  where id = target_class_id;

  return target_class_id;
end;
$$;

grant execute on function public.create_short_class(uuid, uuid, text, text, int, date, date, text, uuid, text, text) to authenticated;
grant execute on function public.update_short_class_profile(uuid, jsonb, text) to authenticated;
grant execute on function public.open_short_class(uuid, text) to authenticated;
grant execute on function public.set_short_class_lock(uuid, boolean, text) to authenticated;
grant execute on function public.set_short_class_status(uuid, text, text) to authenticated;

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
  (select count(*)::int from public.short_class_master_readiness where readiness_status in ('OPEN', 'IN_PROGRESS')) as class_running_count;

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
    'SHORT_CLASS_OPEN_REQUIRES_READY_MASTER',
    'Mở lớp ngắn hạn phải đủ dữ liệu gốc',
    'CLASS_MASTER',
    'Không mở lớp nếu thiếu ngành/khoá, địa điểm, lịch học, sức chứa, giảng viên hoặc offering chưa sẵn sàng tuyển sinh.',
    'BLOCK',
    'short_class_master',
    'P1-04 Short Class Master',
    'DAO_TAO + CTHSSV',
    'IT_DATA',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_CLASS_OPEN_REQUIRES_VERIFIED_STUDENT',
    'Mở lớp phải có học viên đã xác minh',
    'CLASS_MASTER',
    'Lớp chỉ được mở khi số học viên đã xác minh đạt sĩ số tối thiểu để tránh mở lớp rỗng hoặc sai danh sách.',
    'BLOCK',
    'short_class_master,short_enrollments,short_student_master',
    'P1-04 Short Class Master',
    'DAO_TAO + CTHSSV',
    'IT_DATA',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_CLASS_LOCK_AFTER_OPEN',
    'Khóa dữ liệu lớp sau khi mở',
    'CLASS_MASTER',
    'Sau khi lớp được duyệt mở, thông tin lớp/lịch/sĩ số không sửa trực tiếp; muốn sửa phải mở khóa có lý do.',
    'APPROVAL_REQUIRED',
    'short_class_master',
    'P1-04 Short Class Master',
    'DAO_TAO + IT_DATA',
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
  'WF_P1_04_SHORT_CLASS_MASTER',
  'P1-04 Quản lý Class Master ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'Sau khi có học viên đã xác minh, Đào tạo/CTHSSV lập lớp ngắn hạn theo ngành/khoá, địa điểm, lịch và sĩ số.',
  'DAO_TAO',
  'DAO_TAO + CTHSSV',
  'IT_DATA',
  'BGH',
  'Class Master ngắn hạn đủ điều kiện mở lớp, được khóa sau khi duyệt mở và sẵn sàng cho điểm danh/tài chính.',
  'Chỉ lớp OPEN/IN_PROGRESS mới đi sang điểm danh và vận hành lớp; lớp PLANNED chưa được dùng như dữ liệu đã mở.',
  'Mọi tạo/sửa/mở/khóa/đổi trạng thái lớp đều ghi audit log và giữ version lớp.',
  904,
  'DAT_TAM_THOI'
)
on conflict (workflow_code) do update
set workflow_name = excluded.workflow_name,
    trigger_event = excluded.trigger_event,
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
  'APPROVE_P1_04_SHORT_CLASS_OPEN',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_04_SHORT_CLASS_MASTER',
  'Duyệt mở lớp ngắn hạn',
  'DEPARTMENT',
  'DAO_TAO',
  'IT_DATA',
  'BGH',
  'Class Master có ngành/khoá, địa điểm, lịch học, giảng viên, sức chứa và danh sách học viên đã xác minh.',
  'Không duyệt mở nếu view short_class_master_readiness còn BLOCKED/NEEDS_FIX.',
  24,
  'DAT_TAM_THOI'
)
on conflict (approval_code) do update
set workflow_code = excluded.workflow_code,
    decision_name = excluded.decision_name,
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
    'SHORT_CLASS_MASTER',
    'Class Master ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_class_master',
    'MASTER',
    'DAO_TAO',
    'HEU_OS',
    'INTERNAL',
    true,
    'P1-04: Tạo/sửa/mở/khóa lớp qua function kiểm soát; lớp đã mở bị khóa để không sửa tự do.',
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_CLASS_MASTER_READINESS',
    'Tình trạng sẵn sàng mở lớp ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_class_master_readiness',
    'REPORT_VIEW',
    'DAO_TAO + IT_DATA',
    'HEU_OS',
    'INTERNAL',
    true,
    'View chỉ đọc để kiểm tra lớp có đủ điều kiện mở và vận hành hay chưa.',
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
    'RISK_P1_04_OPEN_EMPTY_CLASS',
    'Mở lớp ngắn hạn khi chưa đủ điều kiện',
    'M11_SHORT_COURSE_ERP',
    'PROCESS_CONTROL',
    'HIGH',
    'DAO_TAO + CTHSSV',
    'Nếu mở lớp khi chưa có học viên xác minh, chưa có lịch/địa điểm/giảng viên, điểm danh và tài chính sẽ sai từ gốc.',
    'Function open_short_class chỉ duyệt khi short_class_master_readiness = OPEN_READY.',
    'Trưởng phòng Đào tạo/CTHSSV rà danh sách class_needs_fix_count trước mỗi kỳ mở lớp.',
    'Số lớp readiness_status = BLOCKED/NEEDS_FIX.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_04_OVER_CAPACITY',
    'Lớp vượt sức chứa',
    'M11_SHORT_COURSE_ERP',
    'OPERATION',
    'MEDIUM',
    'DAO_TAO',
    'Nếu số học viên trong lớp vượt sức chứa, lịch học/phòng học/giảng viên và chất lượng đào tạo bị ảnh hưởng.',
    'View short_class_master_readiness cảnh báo OVER_CAPACITY và chặn mở lớp nếu vượt sức chứa.',
    'Đào tạo điều chỉnh lớp hoặc tách lớp trước khi mở.',
    'Số lớp có flag OVER_CAPACITY.',
    'DAT_TAM_THOI'
  )
on conflict (risk_code) do update
set risk_name = excluded.risk_name,
    risk_group = excluded.risk_group,
    severity = excluded.severity,
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
) values (
  'short_class_master_readiness',
  'Tình trạng sẵn sàng mở lớp ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'REPORT_VIEW',
  'DAO_TAO + IT_DATA',
  'Kiểm tra Class Master thiếu dữ liệu, chưa đủ điều kiện mở lớp, vượt sức chứa hoặc chưa có học viên xác minh.',
  'INTERNAL',
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

with target_table as (
  select id from public.data_dictionary_tables
  where table_code = 'short_class_master'
  limit 1
)
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
from target_table t
cross join lateral (
  values
    ('open_gate_status', 'Trạng thái gate mở lớp', 'text', true, false, false, true, 'NOT_READY/READY/APPROVED/BLOCKED/NEEDS_FIX', 'P1-04 dùng để biết lớp đã qua gate mở lớp chưa.'),
    ('schedule_quality_status', 'Trạng thái lịch học', 'text', true, false, false, true, 'NEEDS_CHECK/READY/NEEDS_FIX/LOCKED', 'Lịch học cần đủ ngày bắt đầu/kết thúc, địa điểm và giảng viên.'),
    ('class_quality_status', 'Trạng thái chất lượng lớp', 'text', true, false, false, true, 'NEEDS_CHECK/READY/NEEDS_FIX/OPEN_APPROVED/LOCKED/CANCELLED', 'Không dùng lớp chưa đạt để tạo điểm danh/tài chính.'),
    ('min_capacity', 'Sĩ số tối thiểu', 'integer', true, false, false, true, '> 0', 'Chặn mở lớp nếu chưa đủ học viên xác minh.'),
    ('data_locked', 'Khóa lớp', 'boolean', true, false, false, false, 'true/false', 'Lớp đã mở nên khóa để tránh sửa tự do.')
) as f(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, validation_rule, note)
on conflict (table_id, field_code) do update
set field_name = excluded.field_name,
    data_type = excluded.data_type,
    is_required = excluded.is_required,
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
  'OWN_P1_04_SHORT_CLASS_MASTER',
  'Tạo và duyệt mở lớp ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_04_SHORT_CLASS_MASTER',
  'MASTER_DATA',
  'short_class_master',
  'DAO_TAO',
  'DAO_TAO',
  'IT_DATA',
  'BGH',
  'ROLE_AND_SCOPE',
  'CTHSSV',
  'DAO_TAO + KHTC',
  'Class Master, lịch học, địa điểm, giảng viên, sức chứa và danh sách học viên đã xác minh.',
  'Mọi tạo/sửa/mở/khóa/đổi trạng thái lớp phải ghi audit log và giữ version lớp.',
  24,
  'HIGH',
  'DAT_TAM_THOI'
)
on conflict (ownership_code) do update
set process_name = excluded.process_name,
    workflow_code = excluded.workflow_code,
    source_table = excluded.source_table,
    owner_department = excluded.owner_department,
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
  decision_status,
  checker_note,
  approver_note
) values (
  'GATE_P1_04_SHORT_CLASS_OPEN_READY',
  'P1-04 Class Master ngắn hạn sẵn sàng mở lớp',
  'DATA',
  'WORKFLOW',
  'WF_P1_04_SHORT_CLASS_MASTER',
  'DAO_TAO + CTHSSV + IT_DATA',
  'PENDING',
  'Kiểm tra short_class_master_readiness không còn BLOCKED/NEEDS_FIX trước khi mở lớp.',
  'BGH/Trưởng phòng xác nhận rule mở lớp đủ dùng cho điểm danh, tài chính và dashboard.'
)
on conflict (gate_code) do update
set gate_name = excluded.gate_name,
    gate_type = excluded.gate_type,
    entity_type = excluded.entity_type,
    entity_code = excluded.entity_code,
    owner_department = excluded.owner_department,
    checker_note = excluded.checker_note,
    approver_note = excluded.approver_note,
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
  'NAV_P1_04_SHORT_CLASS_MASTER',
  'P1-04 Class Master ngắn hạn',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/master-control/modules/M11_SHORT_COURSE_ERP',
  'Tạo, kiểm tra, duyệt mở và khóa lớp ngắn hạn trước khi điểm danh/tài chính vận hành.',
  'DAO_TAO + CTHSSV + IT_DATA',
  'Xem Class Master',
  904,
  true,
  'Ưu tiên xử lý lớp có readiness_status BLOCKED, NEEDS_FIX hoặc flag OVER_CAPACITY.',
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
