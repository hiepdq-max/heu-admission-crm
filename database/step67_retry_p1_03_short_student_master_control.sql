-- Step 67 - Retry P1-03 Short Course Student Master control.
-- Run after step66 failed with missing short_governance_rules.rule_group,
-- or after step65_retry_p1_02_short_course_lead_to_student.sql if step66 was not run.
--
-- Purpose:
-- - Upgrade short_student_master from a storage table into a controlled Student Master.
-- - Detect missing profile data and duplicate student risks by phone/CCCD.
-- - Provide controlled functions to update, verify and lock short-course student profiles.
-- - Register P1-03 in Master Control / HEU OS Map.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('short_course.student.read'),
    ('short_course.student.update'),
    ('short_course.student.verify'),
    ('short_course.student.lock')
) as p(permission)
where r.code in ('ADMIN', 'BGH', 'AUDIT', 'ADMISSION_HEAD', 'TEAM_LEAD', 'CTHSSV', 'CTHSSV_LEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('short_course.student.read')
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
    or public.has_permission('short_course.student.update')
    or public.has_permission('short_course.student.verify')
    or public.has_permission('short_course.student.lock')
    or public.has_permission('short_course.class.manage')
$$;

grant execute on function public.can_read_short_course_erp() to authenticated;
grant execute on function public.can_manage_short_course_erp() to authenticated;

alter table public.short_student_master
add column if not exists student_email text,
add column if not exists nationality text,
add column if not exists education_background text,
add column if not exists workplace text,
add column if not exists source_file_url text,
add column if not exists profile_quality_status text not null default 'NEEDS_CHECK',
add column if not exists profile_verified_at timestamptz,
add column if not exists profile_verified_by uuid references public.users_profile(id),
add column if not exists profile_verified_note text,
add column if not exists duplicate_check_status text not null default 'NOT_CHECKED',
add column if not exists duplicate_checked_at timestamptz,
add column if not exists duplicate_checked_by uuid references public.users_profile(id),
add column if not exists profile_version int not null default 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'short_student_profile_quality_status_valid'
      and conrelid = 'public.short_student_master'::regclass
  ) then
    alter table public.short_student_master
    add constraint short_student_profile_quality_status_valid
    check (profile_quality_status in ('NEEDS_CHECK', 'VERIFIED', 'NEEDS_FIX', 'DUPLICATE_RISK', 'LOCKED'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'short_student_duplicate_check_status_valid'
      and conrelid = 'public.short_student_master'::regclass
  ) then
    alter table public.short_student_master
    add constraint short_student_duplicate_check_status_valid
    check (duplicate_check_status in ('NOT_CHECKED', 'CHECKED', 'DUPLICATE_RISK', 'CLEARED'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'short_student_profile_version_positive'
      and conrelid = 'public.short_student_master'::regclass
  ) then
    alter table public.short_student_master
    add constraint short_student_profile_version_positive
    check (profile_version > 0);
  end if;
end $$;

create index if not exists idx_short_student_master_offering
on public.short_student_master(offering_id, student_status, status)
where status = 'ACTIVE';

create index if not exists idx_short_student_master_identity_no_norm
on public.short_student_master((nullif(regexp_replace(coalesce(identity_no, ''), '\D', '', 'g'), '')))
where identity_no is not null and status = 'ACTIVE';

create index if not exists idx_short_student_master_quality
on public.short_student_master(profile_quality_status, duplicate_check_status, data_locked)
where status = 'ACTIVE';

create or replace function public.can_read_short_student_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.can_read_short_course_erp()
    or public.has_permission('short_course.student.read')
    or public.has_permission('short_course.student.update')
    or public.has_permission('short_course.student.verify')
$$;

create or replace function public.can_update_short_student_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.can_manage_short_course_erp()
    or public.has_permission('short_course.student.update')
    or public.has_permission('short_course.student.verify')
$$;

grant execute on function public.can_read_short_student_master() to authenticated;
grant execute on function public.can_update_short_student_master() to authenticated;

create or replace view public.short_student_master_quality_status
with (security_invoker = true)
as
select
  s.id,
  s.student_code,
  s.lead_id,
  l.lead_code,
  s.admission_segment_id,
  seg.segment_code,
  seg.segment_name,
  s.offering_id,
  o.offering_code,
  o.offering_name,
  o.program_id,
  p.program_code,
  p.program_name,
  s.student_name,
  s.student_phone,
  s.student_phone_norm,
  s.student_email,
  s.student_dob,
  s.student_gender,
  s.identity_no,
  s.identity_no_norm,
  s.parent_name,
  s.parent_phone,
  s.address_line,
  s.province,
  s.ward,
  s.legacy_district,
  s.source_status,
  s.student_status,
  s.profile_quality_status,
  s.duplicate_check_status,
  s.data_locked,
  s.locked_reason,
  s.profile_verified_at,
  s.profile_verified_by,
  s.profile_version,
  s.status,
  s.created_at,
  s.updated_at,
  coalesce(enrollment_stats.enrollment_count, 0)::int as enrollment_count,
  coalesce(enrollment_stats.active_enrollment_count, 0)::int as active_enrollment_count,
  coalesce(dup_phone.duplicate_phone_count, 0)::int as duplicate_phone_count,
  coalesce(dup_identity.duplicate_identity_count, 0)::int as duplicate_identity_count,
  array_remove(array[
    case when nullif(trim(coalesce(s.student_name, '')), '') is null then 'NO_STUDENT_NAME' end,
    case when s.student_phone_norm is null then 'NO_STUDENT_PHONE' end,
    case when s.offering_id is null then 'NO_OFFERING' end,
    case when o.id is null then 'INVALID_OFFERING' end,
    case when nullif(trim(coalesce(s.identity_no, '')), '') is null then 'NO_IDENTITY_NO' end,
    case when s.student_dob is null then 'NO_DOB' end,
    case when nullif(trim(coalesce(s.address_line, '')), '') is null then 'NO_ADDRESS' end,
    case when s.data_locked = true and nullif(trim(coalesce(s.locked_reason, '')), '') is null then 'LOCKED_WITHOUT_REASON' end,
    case when coalesce(dup_phone.duplicate_phone_count, 0) > 0 then 'DUPLICATE_PHONE' end,
    case when coalesce(dup_identity.duplicate_identity_count, 0) > 0 then 'DUPLICATE_IDENTITY_NO' end
  ], null) as control_flags,
  case
    when s.status <> 'ACTIVE' then 'ARCHIVED'
    when s.data_locked = true and s.profile_quality_status = 'VERIFIED' then 'VERIFIED_LOCKED'
    when coalesce(dup_phone.duplicate_phone_count, 0) > 0
      or coalesce(dup_identity.duplicate_identity_count, 0) > 0 then 'DUPLICATE_RISK'
    when nullif(trim(coalesce(s.student_name, '')), '') is null
      or s.student_phone_norm is null
      or s.offering_id is null
      or o.id is null then 'BLOCKED'
    when nullif(trim(coalesce(s.identity_no, '')), '') is null
      or s.student_dob is null
      or nullif(trim(coalesce(s.address_line, '')), '') is null then 'NEEDS_FIX'
    when s.profile_quality_status = 'VERIFIED' then 'VERIFIED'
    else 'READY_TEMP'
  end as profile_status
from (
  select
    sm.*,
    nullif(regexp_replace(coalesce(sm.identity_no, ''), '\D', '', 'g'), '') as identity_no_norm
  from public.short_student_master sm
) s
left join public.leads l on l.id = s.lead_id
join public.admission_segments seg on seg.id = s.admission_segment_id
left join public.admission_offering_catalog o on o.id = s.offering_id
left join public.admission_programs p on p.id = o.program_id
left join lateral (
  select
    count(*) as enrollment_count,
    count(*) filter (where e.enrollment_status not in ('CANCELLED')) as active_enrollment_count
  from public.short_enrollments e
  where e.student_id = s.id
    and e.record_status = 'ACTIVE'
) enrollment_stats on true
left join lateral (
  select count(*) as duplicate_phone_count
  from public.short_student_master d
  where d.id <> s.id
    and d.status = 'ACTIVE'
    and s.student_phone_norm is not null
    and d.student_phone_norm = s.student_phone_norm
) dup_phone on true
left join lateral (
  select count(*) as duplicate_identity_count
  from public.short_student_master d
  where d.id <> s.id
    and d.status = 'ACTIVE'
    and s.identity_no_norm is not null
    and nullif(regexp_replace(coalesce(d.identity_no, ''), '\D', '', 'g'), '') = s.identity_no_norm
) dup_identity on true;

create or replace view public.short_student_master_duplicate_risks
with (security_invoker = true)
as
select
  q.id,
  q.student_code,
  q.student_name,
  q.student_phone_norm,
  q.identity_no_norm,
  q.duplicate_phone_count,
  q.duplicate_identity_count,
  q.control_flags,
  q.profile_status
from public.short_student_master_quality_status q
where q.duplicate_phone_count > 0
   or q.duplicate_identity_count > 0;

grant select on public.short_student_master_quality_status to authenticated;
grant select on public.short_student_master_duplicate_risks to authenticated;

create or replace function public.check_short_student_profile(target_student_id uuid)
returns table (
  student_id uuid,
  student_code text,
  profile_status text,
  control_flags text[],
  duplicate_phone_count int,
  duplicate_identity_count int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    q.id,
    q.student_code,
    q.profile_status,
    q.control_flags,
    q.duplicate_phone_count,
    q.duplicate_identity_count
  from public.short_student_master_quality_status q
  where q.id = target_student_id
    and public.can_read_short_student_master()
    and public.can_access_business_scope(q.admission_segment_id, null::uuid);
$$;

create or replace function public.update_short_student_profile(
  target_student_id uuid,
  profile_patch jsonb,
  update_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student public.short_student_master%rowtype;
  v_student_name text;
  v_student_phone text;
  v_student_phone_norm text;
  v_identity_no text;
  v_identity_no_norm text;
begin
  if profile_patch is null or jsonb_typeof(profile_patch) <> 'object' then
    raise exception 'Dữ liệu cập nhật hồ sơ học viên không hợp lệ.';
  end if;

  select *
  into v_student
  from public.short_student_master
  where id = target_student_id
    and status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'Không tìm thấy học viên ngắn hạn.';
  end if;

  if not (
    public.can_update_short_student_master()
    and public.can_access_business_scope(v_student.admission_segment_id, null::uuid)
  ) then
    raise exception 'Tài khoản chưa có quyền cập nhật hồ sơ học viên ngắn hạn.';
  end if;

  if v_student.data_locked then
    raise exception 'Hồ sơ học viên đã khóa. Cần mở khóa có lý do trước khi sửa.';
  end if;

  v_student_name :=
    case
      when profile_patch ? 'student_name' then nullif(trim(profile_patch->>'student_name'), '')
      else v_student.student_name
    end;

  if v_student_name is null then
    raise exception 'Tên học viên không được để trống.';
  end if;

  v_student_phone :=
    case
      when profile_patch ? 'student_phone' then nullif(trim(profile_patch->>'student_phone'), '')
      else v_student.student_phone
    end;
  v_student_phone_norm := nullif(regexp_replace(coalesce(v_student_phone, ''), '\D', '', 'g'), '');

  if v_student_phone_norm is null then
    raise exception 'Hồ sơ học viên cần có số điện thoại để kiểm soát trùng.';
  end if;

  v_identity_no :=
    case
      when profile_patch ? 'identity_no' then nullif(trim(profile_patch->>'identity_no'), '')
      else v_student.identity_no
    end;
  v_identity_no_norm := nullif(regexp_replace(coalesce(v_identity_no, ''), '\D', '', 'g'), '');

  if exists (
    select 1
    from public.short_student_master d
    where d.id <> target_student_id
      and d.status = 'ACTIVE'
      and d.student_phone_norm = v_student_phone_norm
  ) then
    raise exception 'Số điện thoại này đã có trong Student Master ngắn hạn. Cần kiểm tra trùng trước khi lưu.';
  end if;

  if v_identity_no_norm is not null and exists (
    select 1
    from public.short_student_master d
    where d.id <> target_student_id
      and d.status = 'ACTIVE'
      and nullif(regexp_replace(coalesce(d.identity_no, ''), '\D', '', 'g'), '') = v_identity_no_norm
  ) then
    raise exception 'CCCD/định danh này đã có trong Student Master ngắn hạn. Cần kiểm tra trùng trước khi lưu.';
  end if;

  update public.short_student_master
  set
    student_name = v_student_name,
    student_phone = v_student_phone,
    student_email = case when profile_patch ? 'student_email' then nullif(trim(profile_patch->>'student_email'), '') else student_email end,
    student_dob = case when profile_patch ? 'student_dob' and nullif(profile_patch->>'student_dob', '') is not null then (profile_patch->>'student_dob')::date when profile_patch ? 'student_dob' then null else student_dob end,
    student_gender = case when profile_patch ? 'student_gender' then nullif(trim(profile_patch->>'student_gender'), '') else student_gender end,
    identity_no = v_identity_no,
    identity_issued_on = case when profile_patch ? 'identity_issued_on' and nullif(profile_patch->>'identity_issued_on', '') is not null then (profile_patch->>'identity_issued_on')::date when profile_patch ? 'identity_issued_on' then null else identity_issued_on end,
    identity_issued_by = case when profile_patch ? 'identity_issued_by' then nullif(trim(profile_patch->>'identity_issued_by'), '') else identity_issued_by end,
    parent_name = case when profile_patch ? 'parent_name' then nullif(trim(profile_patch->>'parent_name'), '') else parent_name end,
    parent_phone = case when profile_patch ? 'parent_phone' then nullif(trim(profile_patch->>'parent_phone'), '') else parent_phone end,
    address_line = case when profile_patch ? 'address_line' then nullif(trim(profile_patch->>'address_line'), '') else address_line end,
    province = case when profile_patch ? 'province' then nullif(trim(profile_patch->>'province'), '') else province end,
    ward = case when profile_patch ? 'ward' then nullif(trim(profile_patch->>'ward'), '') else ward end,
    legacy_district = case when profile_patch ? 'legacy_district' then nullif(trim(profile_patch->>'legacy_district'), '') else legacy_district end,
    nationality = case when profile_patch ? 'nationality' then nullif(trim(profile_patch->>'nationality'), '') else nationality end,
    education_background = case when profile_patch ? 'education_background' then nullif(trim(profile_patch->>'education_background'), '') else education_background end,
    workplace = case when profile_patch ? 'workplace' then nullif(trim(profile_patch->>'workplace'), '') else workplace end,
    source_file_url = case when profile_patch ? 'source_file_url' then nullif(trim(profile_patch->>'source_file_url'), '') else source_file_url end,
    profile_quality_status = 'NEEDS_CHECK',
    duplicate_check_status = 'CHECKED',
    duplicate_checked_at = now(),
    duplicate_checked_by = auth.uid(),
    profile_verified_at = null,
    profile_verified_by = null,
    profile_verified_note = null,
    profile_version = coalesce(profile_version, 1) + 1,
    note = case
      when nullif(trim(coalesce(update_note, '')), '') is null then note
      else concat_ws(E'\n', note, 'P1-03 cập nhật hồ sơ: ' || trim(update_note))
    end,
    updated_by = auth.uid(),
    updated_at = now()
  where id = target_student_id;

  return target_student_id;
end;
$$;

create or replace function public.verify_short_student_profile(
  target_student_id uuid,
  verify_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student public.short_student_master%rowtype;
  v_quality record;
begin
  select *
  into v_student
  from public.short_student_master
  where id = target_student_id
    and status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'Không tìm thấy học viên ngắn hạn.';
  end if;

  if not (
    (public.can_manage_short_course_erp() or public.has_permission('short_course.student.verify'))
    and public.can_access_business_scope(v_student.admission_segment_id, null::uuid)
  ) then
    raise exception 'Tài khoản chưa có quyền xác minh hồ sơ học viên ngắn hạn.';
  end if;

  select *
  into v_quality
  from public.short_student_master_quality_status
  where id = target_student_id;

  if not found then
    raise exception 'Không đọc được tình trạng kiểm tra hồ sơ học viên.';
  end if;

  if v_quality.profile_status in ('BLOCKED', 'NEEDS_FIX', 'DUPLICATE_RISK', 'ARCHIVED') then
    raise exception 'Hồ sơ chưa đủ điều kiện xác minh. Cần xử lý các mục: %', array_to_string(v_quality.control_flags, ', ');
  end if;

  update public.short_student_master
  set
    student_status = case when student_status = 'STAGING' then 'ACTIVE' else student_status end,
    profile_quality_status = 'VERIFIED',
    duplicate_check_status = 'CHECKED',
    duplicate_checked_at = now(),
    duplicate_checked_by = auth.uid(),
    profile_verified_at = now(),
    profile_verified_by = auth.uid(),
    profile_verified_note = verify_note,
    data_locked = true,
    locked_reason = coalesce(nullif(trim(verify_note), ''), 'P1-03: Hồ sơ học viên đã xác minh'),
    locked_by = auth.uid(),
    locked_at = now(),
    note = case
      when nullif(trim(coalesce(verify_note, '')), '') is null then note
      else concat_ws(E'\n', note, 'P1-03 xác minh hồ sơ: ' || trim(verify_note))
    end,
    updated_by = auth.uid(),
    updated_at = now()
  where id = target_student_id;

  return target_student_id;
end;
$$;

create or replace function public.set_short_student_profile_lock(
  target_student_id uuid,
  should_lock boolean,
  lock_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student public.short_student_master%rowtype;
begin
  select *
  into v_student
  from public.short_student_master
  where id = target_student_id
    and status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'Không tìm thấy học viên ngắn hạn.';
  end if;

  if not (
    (public.can_manage_short_course_erp() or public.has_permission('short_course.student.lock'))
    and public.can_access_business_scope(v_student.admission_segment_id, null::uuid)
  ) then
    raise exception 'Tài khoản chưa có quyền khóa/mở khóa hồ sơ học viên ngắn hạn.';
  end if;

  if should_lock and nullif(trim(coalesce(lock_reason, '')), '') is null then
    raise exception 'Cần nhập lý do khóa hồ sơ.';
  end if;

  update public.short_student_master
  set
    data_locked = should_lock,
    locked_reason = case when should_lock then lock_reason else null end,
    locked_by = case when should_lock then auth.uid() else null end,
    locked_at = case when should_lock then now() else null end,
    profile_quality_status = case
      when should_lock and profile_quality_status = 'VERIFIED' then 'VERIFIED'
      when should_lock then 'LOCKED'
      when profile_quality_status = 'LOCKED' then 'NEEDS_CHECK'
      else profile_quality_status
    end,
    note = concat_ws(
      E'\n',
      note,
      case
        when should_lock then 'P1-03 khóa hồ sơ: ' || trim(lock_reason)
        else 'P1-03 mở khóa hồ sơ để chỉnh sửa.'
      end
    ),
    updated_by = auth.uid(),
    updated_at = now()
  where id = target_student_id;

  return target_student_id;
end;
$$;

grant execute on function public.check_short_student_profile(uuid) to authenticated;
grant execute on function public.update_short_student_profile(uuid, jsonb, text) to authenticated;
grant execute on function public.verify_short_student_profile(uuid, text) to authenticated;
grant execute on function public.set_short_student_profile_lock(uuid, boolean, text) to authenticated;

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
  (select count(*)::int from public.short_student_master_quality_status where profile_status in ('VERIFIED', 'VERIFIED_LOCKED')) as student_verified_count;

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
  control_status
) values
  (
    'SHORT_STUDENT_PROFILE_REQUIRED',
    'Hồ sơ học viên ngắn hạn phải đủ dữ liệu gốc',
    'STUDENT_MASTER',
    'Student Master tối thiểu cần tên, số điện thoại, ngành/khoá, ngày sinh, CCCD và địa chỉ trước khi xác minh.',
    'BLOCK',
    'short_student_master',
    'P1-03 Short Student Master',
    'CTHSSV + DAO_TAO',
    'IT_DATA',
    'BGH',
    true,
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_STUDENT_NO_DUPLICATE_PHONE_IDENTITY',
    'Không tạo trùng học viên ngắn hạn',
    'STUDENT_MASTER',
    'Số điện thoại và CCCD phải được kiểm tra trùng trước khi xác minh hồ sơ.',
    'BLOCK',
    'short_student_master',
    'P1-03 Short Student Master',
    'CTHSSV + TUYEN_SINH',
    'IT_DATA',
    'BGH',
    true,
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_STUDENT_LOCK_AFTER_VERIFY',
    'Khóa hồ sơ sau khi xác minh',
    'STUDENT_MASTER',
    'Hồ sơ đã xác minh phải khóa dữ liệu gốc; muốn sửa lại phải mở khóa có lý do và vẫn ghi audit log.',
    'APPROVAL_REQUIRED',
    'short_student_master',
    'P1-03 Short Student Master',
    'CTHSSV + DAO_TAO',
    'IT_DATA',
    'BGH',
    true,
    'DAT_TAM_THOI'
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
  'WF_P1_03_SHORT_STUDENT_MASTER',
  'P1-03 Chuẩn hóa Student Master ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'Sau P1-02, học viên ngắn hạn ở trạng thái STAGING cần được CTHSSV/Đào tạo kiểm tra và xác minh.',
  'CTHSSV',
  'CTHSSV + DAO_TAO',
  'IT_DATA',
  'BGH',
  'Student Master ngắn hạn đã sạch dữ liệu, không trùng, có trạng thái xác minh và có thể bàn giao sang lớp/tài chính.',
  'Chỉ hồ sơ VERIFIED/VERIFIED_LOCKED mới chuyển tiếp chắc chắn sang bước lớp, điểm danh và tài chính.',
  'Mọi cập nhật, xác minh, khóa/mở khóa hồ sơ đều ghi audit log và giữ link lead gốc.',
  903,
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
  'APPROVE_P1_03_SHORT_STUDENT_PROFILE',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_03_SHORT_STUDENT_MASTER',
  'Xác minh hồ sơ học viên ngắn hạn',
  'DEPARTMENT',
  'CTHSSV',
  'IT_DATA',
  'BGH',
  'Student Master có lead gốc, ngành/khoá đúng, thông tin cá nhân, CCCD, địa chỉ và kết quả kiểm tra trùng.',
  'Không xác minh nếu thiếu tên/SĐT/ngành/khoá, thiếu CCCD/ngày sinh/địa chỉ hoặc phát hiện trùng SĐT/CCCD.',
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
    'SHORT_STUDENT_MASTER',
    'Student Master ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_student_master',
    'MASTER',
    'CTHSSV + DAO_TAO',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'P1-03: Chỉ sửa qua function kiểm soát; hồ sơ đã xác minh bị khóa và muốn sửa phải mở khóa có lý do.',
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_STUDENT_MASTER_QUALITY_STATUS',
    'Tình trạng chất lượng Student Master ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_student_master_quality_status',
    'REPORT_VIEW',
    'IT_DATA + CTHSSV',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'View chỉ đọc để phát hiện thiếu dữ liệu, trùng SĐT/CCCD và trạng thái khóa/xác minh.',
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_STUDENT_DUPLICATE_RISKS',
    'Rủi ro trùng học viên ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_student_master_duplicate_risks',
    'REPORT_VIEW',
    'IT_DATA + AUDIT',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'View chỉ đọc để rà soát các hồ sơ có trùng SĐT hoặc CCCD trước khi cho đi tiếp quy trình.',
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
    'RISK_P1_03_DUP_SHORT_STUDENT',
    'Trùng học viên ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'DATA_QUALITY',
    'HIGH',
    'CTHSSV + IT_DATA',
    'Một học viên có thể bị tạo nhiều lần nếu không kiểm tra số điện thoại/CCCD trước khi chuyển sang lớp và tài chính.',
    'Dùng view short_student_master_quality_status và function update/verify để chặn trùng trước khi xác minh.',
    'Nếu trùng thật, chuyển CTHSSV + IT/Data xử lý gộp hồ sơ trước khi bàn giao lớp/tài chính.',
    'Số hồ sơ profile_status = DUPLICATE_RISK.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_03_UNVERIFIED_PROFILE',
    'Hồ sơ học viên chưa xác minh vẫn đi tiếp',
    'M11_SHORT_COURSE_ERP',
    'PROCESS_CONTROL',
    'MEDIUM',
    'CTHSSV + DAO_TAO',
    'Nếu hồ sơ STAGING/NEEDS_FIX vẫn được đưa vào lớp hoặc tài chính, dữ liệu vận hành phía sau sẽ sai.',
    'Chỉ cho hồ sơ VERIFIED/VERIFIED_LOCKED đi chắc chắn sang lớp, điểm danh và tài chính.',
    'Trưởng phòng CTHSSV/Đào tạo rà soát danh sách student_needs_fix_count mỗi ngày.',
    'Số hồ sơ BLOCKED/NEEDS_FIX trong short_student_master_quality_status.',
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
) values
  (
    'short_student_master_quality_status',
    'Tình trạng hồ sơ học viên ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'REPORT_VIEW',
    'IT_DATA + CTHSSV',
    'Kiểm tra hồ sơ học viên thiếu dữ liệu, trùng SĐT/CCCD, trạng thái khóa/xác minh trước khi bàn giao vận hành.',
    'CONFIDENTIAL',
    true,
    'DAT_TAM_THOI'
  ),
  (
    'short_student_master_duplicate_risks',
    'Danh sách nguy cơ trùng học viên ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'REPORT_VIEW',
    'IT_DATA + AUDIT',
    'Theo dõi học viên ngắn hạn có trùng số điện thoại hoặc CCCD.',
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

with target_table as (
  select id from public.data_dictionary_tables
  where table_code = 'short_student_master'
  union all
  select id from public.data_dictionary_tables
  where table_code = 'short_student_master_quality_status'
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
    ('profile_quality_status', 'Trạng thái chất lượng hồ sơ', 'text', true, false, false, true, 'NEEDS_CHECK/VERIFIED/NEEDS_FIX/DUPLICATE_RISK/LOCKED', 'P1-03 dùng để biết hồ sơ có đủ sạch để đi tiếp hay chưa.'),
    ('duplicate_check_status', 'Trạng thái kiểm tra trùng', 'text', true, false, false, true, 'NOT_CHECKED/CHECKED/DUPLICATE_RISK/CLEARED', 'Không cho xác minh nếu còn nguy cơ trùng SĐT/CCCD.'),
    ('profile_verified_at', 'Thời điểm xác minh hồ sơ', 'timestamptz', false, false, false, true, 'Có giá trị khi hồ sơ đã được xác minh.', 'Dùng để audit và bàn giao sang lớp/tài chính.'),
    ('data_locked', 'Khóa hồ sơ', 'boolean', true, false, false, false, 'true/false', 'Hồ sơ đã xác minh nên khóa để tránh sửa tự do.')
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
  'OWN_P1_03_SHORT_STUDENT_MASTER',
  'Chuẩn hóa hồ sơ học viên ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_03_SHORT_STUDENT_MASTER',
  'MASTER_DATA',
  'short_student_master',
  'CTHSSV + DAO_TAO',
  'CTHSSV',
  'IT_DATA',
  'BGH',
  'ROLE_AND_SCOPE',
  'TUYEN_SINH',
  'DAO_TAO + KHTC',
  'Lead gốc, thông tin cá nhân, SĐT, CCCD, ngành/khoá và kết quả kiểm tra trùng.',
  'Mọi sửa/xác minh/khóa/mở khóa phải ghi audit log và giữ phiên bản hồ sơ.',
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
  'GATE_P1_03_SHORT_STUDENT_MASTER_READY',
  'P1-03 Student Master ngắn hạn sẵn sàng',
  'DATA',
  'WORKFLOW',
  'WF_P1_03_SHORT_STUDENT_MASTER',
  'CTHSSV + DAO_TAO + IT_DATA',
  'PENDING',
  'Kiểm tra view short_student_master_quality_status không còn BLOCKED/DUPLICATE_RISK trước khi cho đi tiếp.',
  'BGH/Trưởng phòng xác nhận quy tắc Student Master đủ dùng cho lớp, điểm danh và tài chính.'
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
  'NAV_P1_03_SHORT_STUDENT_MASTER',
  'P1-03 Student Master ngắn hạn',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/master-control/modules/M11_SHORT_COURSE_ERP',
  'Kiểm tra, xác minh và khóa hồ sơ học viên ngắn hạn sau khi chuyển từ lead.',
  'CTHSSV + DAO_TAO + IT_DATA',
  'Xem Student Master',
  903,
  true,
  'Ưu tiên xử lý hồ sơ có profile_status BLOCKED, NEEDS_FIX hoặc DUPLICATE_RISK.',
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
