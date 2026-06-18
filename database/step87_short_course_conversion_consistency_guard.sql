-- Step 87 - Short-course conversion consistency guard.
-- Run after step86_short_course_food_beverage_p0_19_gate.sql.
--
-- Purpose:
-- - Prevent wrong or conflicting selections when converting a short-course lead
--   into a student/enrollment.
-- - UI should only show the correct offering, but database must still block
--   bad data if someone submits a wrong offering by URL/API/manual SQL.
-- - Rules:
--   1) Lead must already have program_id and admission_major_id.
--   2) Student offering must belong to the same workspace/segment as the lead.
--   3) Student offering must match the lead's program and major.
--   4) If the lead already has admission_offering_id, the student must use it.
--   5) Enrollment must match its student record.

create or replace function public.validate_short_student_lead_offering_consistency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead record;
  v_offering record;
  v_segment_code text;
begin
  if new.lead_id is null then
    return new;
  end if;

  if new.offering_id is null then
    raise exception 'P1-20: Học viên ngắn hạn phải có ngành/khóa chi tiết.';
  end if;

  select
    l.id,
    l.lead_code,
    l.student_name,
    l.admission_segment_id,
    l.admission_program_id,
    l.admission_major_id,
    l.admission_offering_id
  into v_lead
  from public.leads l
  where l.id = new.lead_id
    and l.is_deleted = false;

  if not found then
    raise exception 'P1-20: Không tìm thấy lead gốc hoặc lead đã bị xóa.';
  end if;

  if v_lead.admission_segment_id is null then
    raise exception 'P1-20: Lead % chưa có đối tượng tuyển sinh.', v_lead.lead_code;
  end if;

  if new.admission_segment_id is distinct from v_lead.admission_segment_id then
    raise exception 'P1-20: Đối tượng tuyển sinh của học viên không khớp với lead %. Không được chuyển sai workspace.', v_lead.lead_code;
  end if;

  if v_lead.admission_program_id is null then
    raise exception 'P1-20: Lead % chưa có hệ đào tạo. Hãy cập nhật lead trước khi chuyển.', v_lead.lead_code;
  end if;

  if v_lead.admission_major_id is null then
    raise exception 'P1-20: Lead % chưa có ngành/khóa. Hãy cập nhật lead trước khi chuyển.', v_lead.lead_code;
  end if;

  select
    o.id,
    o.offering_code,
    o.offering_name,
    o.program_id,
    o.admission_major_id,
    o.allowed_segment_codes
  into v_offering
  from public.admission_offering_catalog o
  where o.id = new.offering_id
    and o.status = 'ACTIVE';

  if not found then
    raise exception 'P1-20: Ngành/khóa chi tiết không tồn tại hoặc đã ngừng dùng.';
  end if;

  select s.segment_code
  into v_segment_code
  from public.admission_segments s
  where s.id = v_lead.admission_segment_id
    and s.status = 'ACTIVE';

  if v_segment_code is null then
    raise exception 'P1-20: Đối tượng tuyển sinh của lead % không còn hoạt động.', v_lead.lead_code;
  end if;

  if v_offering.allowed_segment_codes is null
     or not (v_segment_code = any(v_offering.allowed_segment_codes)) then
    raise exception 'P1-20: Khóa % không thuộc đối tượng tuyển sinh của lead %. Không được chọn sai luồng.', v_offering.offering_name, v_lead.lead_code;
  end if;

  if v_offering.program_id is distinct from v_lead.admission_program_id then
    raise exception 'P1-20: Hệ đào tạo của khóa % không khớp với hệ đào tạo của lead %.', v_offering.offering_name, v_lead.lead_code;
  end if;

  if v_offering.admission_major_id is distinct from v_lead.admission_major_id then
    raise exception 'P1-20: Ngành/khóa % không khớp với ngành của lead %. Không được chọn nhầm ngành.', v_offering.offering_name, v_lead.lead_code;
  end if;

  if v_lead.admission_offering_id is not null
     and new.offering_id is distinct from v_lead.admission_offering_id then
    raise exception 'P1-20: Lead % đã gắn một khóa chi tiết khác. Không được đổi khóa khi chuyển học viên.', v_lead.lead_code;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_short_student_lead_offering_consistency
on public.short_student_master;

create trigger trg_short_student_lead_offering_consistency
before insert or update on public.short_student_master
for each row execute function public.validate_short_student_lead_offering_consistency();

create or replace function public.validate_short_enrollment_student_consistency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student record;
begin
  if new.student_id is null then
    return new;
  end if;

  select
    s.id,
    s.student_code,
    s.lead_id,
    s.admission_segment_id,
    s.offering_id
  into v_student
  from public.short_student_master s
  where s.id = new.student_id
    and s.status = 'ACTIVE';

  if not found then
    raise exception 'P1-20: Không tìm thấy học viên gốc hoặc học viên đã ngừng hoạt động.';
  end if;

  if new.lead_id is distinct from v_student.lead_id then
    raise exception 'P1-20: Ghi danh không khớp lead gốc của học viên %.', v_student.student_code;
  end if;

  if new.admission_segment_id is distinct from v_student.admission_segment_id then
    raise exception 'P1-20: Ghi danh không khớp đối tượng tuyển sinh của học viên %.', v_student.student_code;
  end if;

  if new.offering_id is distinct from v_student.offering_id then
    raise exception 'P1-20: Ghi danh không khớp ngành/khóa của học viên %.', v_student.student_code;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_short_enrollment_student_consistency
on public.short_enrollments;

create trigger trg_short_enrollment_student_consistency
before insert or update on public.short_enrollments
for each row execute function public.validate_short_enrollment_student_consistency();

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
) values (
  'P1_20_SHORT_CONVERSION_CONSISTENCY_GUARD',
  'P1-20 khóa logic chuyển lead ngắn hạn thành học viên',
  'M11_SHORT_COURSE_ERP',
  'short_student_master; short_enrollments; leads; admission_offering_catalog',
  'CONFIG',
  'IT_DATA + DAO_TAO + TUYEN_SINH',
  'SUPABASE',
  'INTERNAL',
  true,
  'Database chặn chuyển sai workspace, sai hệ, sai ngành, sai khóa hoặc ghi danh lệch học viên.',
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
