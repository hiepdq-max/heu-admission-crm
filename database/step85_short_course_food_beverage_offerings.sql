-- Step 85 - Short-course food and beverage offerings.
-- Run after step84_short_course_controlled_intake.sql.
--
-- Purpose:
-- - Add two missing core short-course occupations:
--   1) Che bien mon an
--   2) Pha che
-- - Keep them in Master Data so P1-20 "Chuong trinh/nganh" reads them
--   automatically by workspace, instead of users typing free text.
-- - Mark as DAT_TAM_THOI until HEU confirms legal basis, tuition policy,
--   schedule/duration and certificate rules.

insert into public.admission_programs (
  program_code,
  program_name,
  sort_order,
  status
) values (
  'NGAN_HAN',
  'Ngắn hạn',
  20,
  'ACTIVE'::public.record_status
)
on conflict (program_code) do update set
  program_name = excluded.program_name,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

with major_seed as (
  select *
  from (
    values
      ('CHE_BIEN_MON_AN_NGAN_HAN', 'Chế biến món ăn', 'NGAN_HAN', 180),
      ('PHA_CHE_NGAN_HAN', 'Pha chế', 'NGAN_HAN', 190)
  ) as v(major_code, major_name, program_code, sort_order)
)
insert into public.admission_majors (
  major_code,
  major_name,
  program_id,
  sort_order,
  status
)
select
  m.major_code,
  m.major_name,
  p.id,
  m.sort_order,
  'ACTIVE'::public.record_status
from major_seed m
join public.admission_programs p on p.program_code = m.program_code
on conflict (major_code) do update set
  major_name = excluded.major_name,
  program_id = excluded.program_id,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

with offering_seed as (
  select *
  from (
    values
      (
        'SHORT_CHE_BIEN_MON_AN',
        'Chế biến món ăn',
        'NGAN_HAN',
        'CHE_BIEN_MON_AN_NGAN_HAN',
        array['SHORT_UNEMPLOYMENT_SUPPORT', 'SHORT_ONSITE_HEU']::text[],
        'Khóa ngắn hạn nghề dịch vụ ăn uống',
        'Có thể áp dụng tuyển sinh tại chỗ/CTV; nếu theo diện trợ cấp thất nghiệp phải có minh chứng chính sách và điều kiện lớp.',
        null::text,
        null::text,
        null::text,
        true,
        false,
        false,
        'DAT_TAM_THOI',
        'Bổ sung theo yêu cầu vận hành P1-20. Cần đối chiếu chương trình, thời lượng, học phí, chứng chỉ và căn cứ pháp lý trước khi đánh dấu chính thức.'
      ),
      (
        'SHORT_PHA_CHE',
        'Pha chế',
        'NGAN_HAN',
        'PHA_CHE_NGAN_HAN',
        array['SHORT_UNEMPLOYMENT_SUPPORT', 'SHORT_ONSITE_HEU']::text[],
        'Khóa ngắn hạn nghề dịch vụ ăn uống',
        'Có thể áp dụng tuyển sinh tại chỗ/CTV; nếu theo diện trợ cấp thất nghiệp phải có minh chứng chính sách và điều kiện lớp.',
        null::text,
        null::text,
        null::text,
        true,
        false,
        false,
        'DAT_TAM_THOI',
        'Bổ sung theo yêu cầu vận hành P1-20. Cần đối chiếu chương trình, thời lượng, học phí, chứng chỉ và căn cứ pháp lý trước khi đánh dấu chính thức.'
      )
  ) as v(
    offering_code,
    offering_name,
    catalog_group_code,
    major_code,
    allowed_segment_codes,
    delivery_model,
    partner_policy,
    legal_ref,
    tuition_policy_ref,
    com_policy_ref,
    is_advisable,
    is_enrollment_ready,
    is_finance_ready,
    control_status,
    note
  )
),
resolved as (
  select
    o.offering_code,
    o.offering_name,
    o.catalog_group_code,
    p.id as program_id,
    m.id as admission_major_id,
    o.allowed_segment_codes,
    o.delivery_model,
    o.partner_policy,
    o.legal_ref,
    o.tuition_policy_ref,
    o.com_policy_ref,
    o.is_advisable,
    o.is_enrollment_ready,
    o.is_finance_ready,
    o.control_status,
    o.note
  from offering_seed o
  join public.admission_majors m on m.major_code = o.major_code
  join public.admission_programs p on p.id = m.program_id
)
insert into public.admission_offering_catalog (
  offering_code,
  offering_name,
  catalog_group_code,
  program_id,
  admission_major_id,
  allowed_segment_codes,
  delivery_model,
  partner_policy,
  legal_ref,
  tuition_policy_ref,
  com_policy_ref,
  is_advisable,
  is_enrollment_ready,
  is_finance_ready,
  owner_department,
  checker_department,
  approver_role,
  control_status,
  note,
  status
)
select
  offering_code,
  offering_name,
  catalog_group_code,
  program_id,
  admission_major_id,
  allowed_segment_codes,
  delivery_model,
  partner_policy,
  legal_ref,
  tuition_policy_ref,
  com_policy_ref,
  is_advisable,
  is_enrollment_ready,
  is_finance_ready,
  'DAO_TAO + TUYEN_SINH + KHTC',
  'PHAP_CHE + KHTC + IT_DATA',
  'BGH_HIEU_TRUONG',
  control_status,
  note,
  'ACTIVE'::public.record_status
from resolved
on conflict (offering_code) do update set
  offering_name = excluded.offering_name,
  catalog_group_code = excluded.catalog_group_code,
  program_id = excluded.program_id,
  admission_major_id = excluded.admission_major_id,
  allowed_segment_codes = excluded.allowed_segment_codes,
  delivery_model = excluded.delivery_model,
  partner_policy = excluded.partner_policy,
  legal_ref = excluded.legal_ref,
  tuition_policy_ref = excluded.tuition_policy_ref,
  com_policy_ref = excluded.com_policy_ref,
  is_advisable = excluded.is_advisable,
  is_enrollment_ready = excluded.is_enrollment_ready,
  is_finance_ready = excluded.is_finance_ready,
  owner_department = excluded.owner_department,
  checker_department = excluded.checker_department,
  approver_role = excluded.approver_role,
  control_status = excluded.control_status,
  note = excluded.note,
  status = 'ACTIVE',
  updated_at = now();

with explicit_rules as (
  select
    s.id as segment_id,
    o.program_id,
    o.admission_major_id as major_id,
    false as is_default,
    true as is_required,
    m.sort_order * 10 as sort_order,
    'Step85: Hiển thị ngành/khoá "' || o.offering_name || '" cho workspace ' || s.segment_code || '.' as note
  from public.admission_offering_catalog o
  join public.admission_segments s on s.segment_code = any(o.allowed_segment_codes)
  join public.admission_majors m on m.id = o.admission_major_id
  where o.offering_code in ('SHORT_CHE_BIEN_MON_AN', 'SHORT_PHA_CHE')
    and o.status = 'ACTIVE'
    and o.is_advisable = true
    and s.status = 'ACTIVE'
)
insert into public.admission_segment_program_rules (
  segment_id,
  program_id,
  major_id,
  is_default,
  is_required,
  sort_order,
  note,
  status
)
select
  segment_id,
  program_id,
  major_id,
  is_default,
  is_required,
  sort_order,
  note,
  'ACTIVE'::public.record_status
from explicit_rules
on conflict (segment_id, program_id, major_id) do update set
  is_default = excluded.is_default,
  is_required = excluded.is_required,
  sort_order = excluded.sort_order,
  note = excluded.note,
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
) values (
  'P1_20_SHORT_FOOD_BEVERAGE_OFFERINGS',
  'Ngành ngắn hạn Chế biến món ăn và Pha chế',
  'M11_SHORT_COURSE_ERP',
  'admission_majors; admission_offering_catalog; admission_segment_program_rules',
  'CONFIG',
  'DAO_TAO + TUYEN_SINH + KHTC + IT_DATA',
  'SUPABASE',
  'INTERNAL',
  true,
  'Ngành/khoá được chọn từ danh mục gốc; không nhập tự do trên từng lớp. Muốn đánh dấu sẵn sàng nhập học/tài chính phải bổ sung legal_ref, tuition_policy_ref và gate duyệt.',
  'DAT_TAM_THOI'
)
on conflict (data_code) do update
set data_name = excluded.data_name,
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
