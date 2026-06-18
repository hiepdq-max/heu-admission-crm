-- Step 86 - P0-19 gate for short-course food and beverage offerings.
-- Run after step85_short_course_food_beverage_offerings.sql.
--
-- Purpose:
-- - Add "Pha chế" and "Chế biến món ăn" to nganh_nghe_master so P0-19 can
--   recognise the lead major instead of showing "chua map nganh".
-- - Open ENROLLMENT gate only at DAT_TAM_THOI level so P1-20 can convert a
--   qualified lead into Short Student staging.
-- - Keep finance gate as WARN because tuition/payment policy still needs
--   accounting confirmation before issuing debt/payment.

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

with short_program as (
  select id
  from public.admission_programs
  where program_code = 'NGAN_HAN'
),
short_major_seed as (
  select *
  from (
    values
      (
        'CHE_BIEN_MON_AN_NGAN_HAN',
        'Chế biến món ăn',
        'Chế biến món ăn',
        'Ngắn hạn',
        null::text,
        'Dịch vụ ăn uống',
        'P1_20_SHORT_COURSE_FOOD_BEVERAGE_TUITION_PENDING',
        'P1_20_SHORT_COURSE_FOOD_BEVERAGE_LEGAL_PENDING',
        'Danh mục tạm kiểm soát phục vụ P1-20. Được phép tư vấn/chuyển staging khi đủ dữ liệu lead; kế toán/học phí vẫn cần xác nhận riêng.'
      ),
      (
        'PHA_CHE_NGAN_HAN',
        'Pha chế',
        'Pha chế',
        'Ngắn hạn',
        null::text,
        'Dịch vụ ăn uống',
        'P1_20_SHORT_COURSE_FOOD_BEVERAGE_TUITION_PENDING',
        'P1_20_SHORT_COURSE_FOOD_BEVERAGE_LEGAL_PENDING',
        'Danh mục tạm kiểm soát phục vụ P1-20. Được phép tư vấn/chuyển staging khi đủ dữ liệu lead; kế toán/học phí vẫn cần xác nhận riêng.'
      )
  ) as v(
    nganh_id,
    ten_nganh_tu_van,
    ten_nganh_phap_ly,
    trinh_do,
    ma_nganh_nghe,
    khoa_phu_trach,
    hoc_phi_policy_id,
    legal_ref,
    note
  )
)
insert into public.nganh_nghe_master (
  nganh_id,
  ten_nganh_tu_van,
  ten_nganh_phap_ly,
  trinh_do,
  ma_nganh_nghe,
  khoa_phu_trach,
  chuong_trinh_id,
  hoc_phi_policy_id,
  trang_thai_tuyen_sinh,
  legal_ref,
  owner_department,
  checker_department,
  approver_role,
  control_status,
  note,
  status
)
select
  m.nganh_id,
  m.ten_nganh_tu_van,
  m.ten_nganh_phap_ly,
  m.trinh_do,
  m.ma_nganh_nghe,
  m.khoa_phu_trach,
  p.id,
  m.hoc_phi_policy_id,
  'DANG_TUYEN',
  m.legal_ref,
  'DAO_TAO + TUYEN_SINH',
  'PHAP_CHE + KHTC + IT_DATA',
  'BGH_HIEU_TRUONG',
  'DAT_TAM_THOI',
  m.note,
  'ACTIVE'::public.record_status
from short_major_seed m
cross join short_program p
on conflict (nganh_id) do update set
  ten_nganh_tu_van = excluded.ten_nganh_tu_van,
  ten_nganh_phap_ly = excluded.ten_nganh_phap_ly,
  trinh_do = excluded.trinh_do,
  ma_nganh_nghe = excluded.ma_nganh_nghe,
  khoa_phu_trach = excluded.khoa_phu_trach,
  chuong_trinh_id = excluded.chuong_trinh_id,
  hoc_phi_policy_id = excluded.hoc_phi_policy_id,
  trang_thai_tuyen_sinh = excluded.trang_thai_tuyen_sinh,
  legal_ref = excluded.legal_ref,
  owner_department = excluded.owner_department,
  checker_department = excluded.checker_department,
  approver_role = excluded.approver_role,
  control_status = excluded.control_status,
  note = excluded.note,
  status = 'ACTIVE',
  updated_at = now();

with gate_seed as (
  select
    n.nganh_id,
    n.ten_nganh_tu_van,
    n.legal_ref,
    n.hoc_phi_policy_id,
    n.owner_department,
    n.checker_department,
    n.approver_role,
    n.control_status,
    m.id as admission_major_id,
    m.major_code
  from public.nganh_nghe_master n
  join public.admission_majors m on m.major_code = n.nganh_id
  where n.nganh_id in ('CHE_BIEN_MON_AN_NGAN_HAN', 'PHA_CHE_NGAN_HAN')
    and n.status = 'ACTIVE'
)
insert into public.major_legal_tuition_gates (
  nganh_id,
  admission_major_id,
  major_code,
  legal_status,
  tuition_status,
  enrollment_gate,
  handover_gate,
  finance_gate,
  legal_ref,
  tuition_policy_ref,
  issue_summary,
  required_action,
  owner_department,
  checker_department,
  approver_role,
  control_status,
  status
)
select
  nganh_id,
  admission_major_id,
  major_code,
  'VERIFIED',
  'CONFIGURED',
  'ALLOW_ENROLLMENT',
  'WARN_BEFORE_HANDOVER',
  'WARN_BEFORE_FINANCE',
  legal_ref,
  hoc_phi_policy_id,
  'Gate tạm kiểm soát cho P1-20: cho phép chuyển lead đủ dữ liệu thành học viên staging; chưa tự động phát sinh công nợ/thanh toán.',
  'KHTC và Pháp chế cần bổ sung file/căn cứ chính thức trước khi mở finance_gate=ALLOW_FINANCE hoặc chốt quy trình production.',
  owner_department,
  checker_department,
  approver_role,
  control_status,
  'ACTIVE'::public.record_status
from gate_seed
on conflict (nganh_id) do update set
  admission_major_id = excluded.admission_major_id,
  major_code = excluded.major_code,
  legal_status = excluded.legal_status,
  tuition_status = excluded.tuition_status,
  enrollment_gate = excluded.enrollment_gate,
  handover_gate = excluded.handover_gate,
  finance_gate = excluded.finance_gate,
  legal_ref = excluded.legal_ref,
  tuition_policy_ref = excluded.tuition_policy_ref,
  issue_summary = excluded.issue_summary,
  required_action = excluded.required_action,
  owner_department = excluded.owner_department,
  checker_department = excluded.checker_department,
  approver_role = excluded.approver_role,
  control_status = excluded.control_status,
  status = 'ACTIVE',
  updated_at = now();

update public.admission_offering_catalog o
set
  legal_ref = coalesce(o.legal_ref, 'P1_20_SHORT_COURSE_FOOD_BEVERAGE_LEGAL_PENDING'),
  tuition_policy_ref = coalesce(o.tuition_policy_ref, 'P1_20_SHORT_COURSE_FOOD_BEVERAGE_TUITION_PENDING'),
  is_enrollment_ready = true,
  is_finance_ready = false,
  control_status = 'DAT_TAM_THOI',
  note = concat_ws(
    ' ',
    nullif(o.note, ''),
    'Step86: mở enrollment gate tạm kiểm soát cho P1-20; finance gate vẫn cần KHTC xác nhận.'
  ),
  updated_at = now()
where o.offering_code in ('SHORT_CHE_BIEN_MON_AN', 'SHORT_PHA_CHE')
  and o.status = 'ACTIVE';

-- Backfill existing leads that were created before P0-19/Offering gate was added.
with resolved as (
  select
    p.id as program_id,
    m.id as major_id,
    o.id as offering_id,
    o.offering_name
  from public.admission_offering_catalog o
  join public.admission_majors m on m.id = o.admission_major_id
  join public.admission_programs p on p.id = o.program_id
  where o.offering_code in ('SHORT_CHE_BIEN_MON_AN', 'SHORT_PHA_CHE')
    and o.status = 'ACTIVE'
)
update public.leads l
set
  admission_program_id = coalesce(l.admission_program_id, r.program_id),
  admission_major_id = coalesce(l.admission_major_id, r.major_id),
  admission_offering_id = coalesce(l.admission_offering_id, r.offering_id),
  updated_at = now()
from resolved r
where l.is_deleted = false
  and l.admission_segment_id is not null
  and lower(trim(coalesce(l.interested_major, ''))) = lower(trim(r.offering_name))
  and (
    l.admission_program_id is null
    or l.admission_major_id is null
    or l.admission_offering_id is null
  );

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
  'P0_19_SHORT_FOOD_BEVERAGE_GATE',
  'P0-19 gate ngành ngắn hạn Pha chế và Chế biến món ăn',
  'M11_SHORT_COURSE_ERP',
  'nganh_nghe_master; major_legal_tuition_gates; admission_offering_catalog',
  'CONFIG',
  'DAO_TAO + TUYEN_SINH + KHTC + IT_DATA',
  'SUPABASE',
  'INTERNAL',
  true,
  'Enrollment gate tạm mở để tạo học viên staging; finance/payment chỉ mở sau khi KHTC xác nhận học phí và chứng từ.',
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
