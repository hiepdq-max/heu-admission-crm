-- Step 61 - P0-21 Admission Offering Catalog.
-- Run after step60_admission_catalog_workspace_gate.sql.
--
-- Purpose:
-- - Create a controlled detail catalog for short courses and university-transfer
--   offerings outside the Trung cap catalog.
-- - Map each offering to the exact admission workspace(s) allowed to use it.
-- - Replace broad "all majors under program" rules for short/other university
--   workspaces with explicit offering-level rules.
-- - Keep legal/tuition readiness visible; do not mark temporary data as final.

create table if not exists public.admission_offering_catalog (
  id uuid primary key default gen_random_uuid(),
  offering_code text not null unique,
  offering_name text not null,
  catalog_group_code text not null references public.admission_catalog_groups(catalog_group_code)
    on update cascade,
  program_id uuid not null references public.admission_programs(id) on delete restrict,
  admission_major_id uuid references public.admission_majors(id) on delete set null,
  allowed_segment_codes text[] not null default '{}'::text[],
  delivery_model text,
  partner_policy text,
  legal_ref text,
  tuition_policy_ref text,
  com_policy_ref text,
  is_advisable boolean not null default true,
  is_enrollment_ready boolean not null default false,
  is_finance_ready boolean not null default false,
  owner_department text not null default 'DAO_TAO + TUYEN_SINH',
  checker_department text not null default 'PHAP_CHE + KHTC + IT_DATA',
  approver_role text not null default 'BGH_HIEU_TRUONG',
  control_status text not null default 'DAT_TAM_THOI',
  note text,
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admission_offering_catalog_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create index if not exists idx_admission_offering_catalog_group
on public.admission_offering_catalog(catalog_group_code, status, control_status);

create index if not exists idx_admission_offering_catalog_segments
on public.admission_offering_catalog using gin(allowed_segment_codes);

create index if not exists idx_admission_offering_catalog_major
on public.admission_offering_catalog(admission_major_id)
where admission_major_id is not null and status = 'ACTIVE';

alter table public.admission_offering_catalog enable row level security;

drop policy if exists "admission_offering_catalog_select_authenticated"
on public.admission_offering_catalog;
create policy "admission_offering_catalog_select_authenticated"
on public.admission_offering_catalog for select
to authenticated
using (status = 'ACTIVE' or public.can_read_master_control());

drop policy if exists "admission_offering_catalog_manage_config"
on public.admission_offering_catalog;
create policy "admission_offering_catalog_manage_config"
on public.admission_offering_catalog for all
to authenticated
using (
  public.can_manage_master_control()
  or public.has_permission('settings.manage')
  or public.has_permission('admission_config.manage')
)
with check (
  public.can_manage_master_control()
  or public.has_permission('settings.manage')
  or public.has_permission('admission_config.manage')
);

drop trigger if exists trg_admission_offering_catalog_updated_at
on public.admission_offering_catalog;
create trigger trg_admission_offering_catalog_updated_at
before update on public.admission_offering_catalog
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_offering_catalog_audit
on public.admission_offering_catalog;
create trigger trg_admission_offering_catalog_audit
after insert or update or delete on public.admission_offering_catalog
for each row execute function public.write_audit_log();

insert into public.admission_programs (
  program_code,
  program_name,
  sort_order,
  status
) values
  ('NGAN_HAN', 'Ngắn hạn', 20, 'ACTIVE'::public.record_status),
  ('LIEN_THONG_DAI_HOC', 'Liên thông đại học', 30, 'ACTIVE'::public.record_status)
on conflict (program_code) do update set
  program_name = excluded.program_name,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

with major_seed as (
  select *
  from (
    values
      ('DIGITAL_MARKETING_NGAN_HAN', 'Digital Marketing', 'NGAN_HAN', 110),
      ('THUONG_MAI_DIEN_TU_NGAN_HAN', 'Thương mại điện tử', 'NGAN_HAN', 120),
      ('MARKETING_SEO', 'Marketing - SEO', 'NGAN_HAN', 130),
      ('KY_THUAT_CAT_TOC', 'Kỹ thuật cắt tóc', 'NGAN_HAN', 140),
      ('KY_THUAT_NHUOM_TOC', 'Kỹ thuật nhuộm tóc', 'NGAN_HAN', 150),
      ('KY_THUAT_UON_LA_TOC', 'Kỹ thuật uốn và là tóc', 'NGAN_HAN', 160),
      ('TRANG_DIEM_THAM_MY', 'Trang điểm thẩm mỹ', 'NGAN_HAN', 170),
      ('LIEN_THONG_HV_BUU_CHINH_VIEN_THONG', 'Liên thông Học viện Công nghệ Bưu chính Viễn thông', 'LIEN_THONG_DAI_HOC', 190)
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
        'SHORT_DIGITAL_MARKETING',
        'Digital Marketing',
        'NGAN_HAN',
        'DIGITAL_MARKETING_NGAN_HAN',
        array['SHORT_UNEMPLOYMENT_SUPPORT', 'SHORT_ONSITE_HEU']::text[],
        'Khóa ngắn hạn',
        'Có thể áp dụng tuyển sinh tại chỗ/CTV; nếu theo diện trợ cấp thất nghiệp phải có minh chứng chính sách.',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        true,
        false,
        false,
        'DAT_TAM_THOI',
        'Danh mục tạm kiểm soát từ dữ liệu cũ; cần đối chiếu thông báo tuyển sinh, học phí, lịch học và điều kiện chứng chỉ.'
      ),
      (
        'SHORT_THUONG_MAI_DIEN_TU',
        'Thương mại điện tử',
        'NGAN_HAN',
        'THUONG_MAI_DIEN_TU_NGAN_HAN',
        array['SHORT_UNEMPLOYMENT_SUPPORT', 'SHORT_ONSITE_HEU']::text[],
        'Khóa ngắn hạn',
        'Có thể áp dụng tuyển sinh tại chỗ/CTV; nếu theo diện trợ cấp thất nghiệp phải có minh chứng chính sách.',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        true,
        false,
        false,
        'DAT_TAM_THOI',
        'Danh mục tạm kiểm soát; chưa coi là danh mục pháp lý cuối cùng.'
      ),
      (
        'SHORT_MARKETING_SEO',
        'Marketing - SEO',
        'NGAN_HAN',
        'MARKETING_SEO',
        array['SHORT_UNEMPLOYMENT_SUPPORT', 'SHORT_ONSITE_HEU']::text[],
        'Khóa ngắn hạn',
        'Có thể áp dụng tuyển sinh tại chỗ/CTV; nếu theo diện trợ cấp thất nghiệp phải có minh chứng chính sách.',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        true,
        false,
        false,
        'DAT_TAM_THOI',
        'Danh mục tạm kiểm soát; cần xác nhận học phí và điều kiện mở lớp.'
      ),
      (
        'SHORT_KY_THUAT_CAT_TOC',
        'Kỹ thuật cắt tóc',
        'NGAN_HAN',
        'KY_THUAT_CAT_TOC',
        array['SHORT_UNEMPLOYMENT_SUPPORT', 'SHORT_ONSITE_HEU']::text[],
        'Khóa ngắn hạn nghề dịch vụ',
        'Nếu có hỗ trợ/chính sách bên ngoài thì phải tách hồ sơ chính sách khỏi COM.',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        true,
        false,
        false,
        'DAT_TAM_THOI',
        'Danh mục tạm kiểm soát; cần xác nhận chương trình, thời lượng, học phí, chứng chỉ.'
      ),
      (
        'SHORT_KY_THUAT_NHUOM_TOC',
        'Kỹ thuật nhuộm tóc',
        'NGAN_HAN',
        'KY_THUAT_NHUOM_TOC',
        array['SHORT_UNEMPLOYMENT_SUPPORT', 'SHORT_ONSITE_HEU']::text[],
        'Khóa ngắn hạn nghề dịch vụ',
        'Nếu có hỗ trợ/chính sách bên ngoài thì phải tách hồ sơ chính sách khỏi COM.',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        true,
        false,
        false,
        'DAT_TAM_THOI',
        'Danh mục tạm kiểm soát; cần xác nhận chương trình, thời lượng, học phí, chứng chỉ.'
      ),
      (
        'SHORT_KY_THUAT_UON_LA_TOC',
        'Kỹ thuật uốn và là tóc',
        'NGAN_HAN',
        'KY_THUAT_UON_LA_TOC',
        array['SHORT_UNEMPLOYMENT_SUPPORT', 'SHORT_ONSITE_HEU']::text[],
        'Khóa ngắn hạn nghề dịch vụ',
        'Nếu có hỗ trợ/chính sách bên ngoài thì phải tách hồ sơ chính sách khỏi COM.',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        true,
        false,
        false,
        'DAT_TAM_THOI',
        'Danh mục tạm kiểm soát; cần xác nhận chương trình, thời lượng, học phí, chứng chỉ.'
      ),
      (
        'SHORT_TRANG_DIEM_THAM_MY',
        'Trang điểm thẩm mỹ',
        'NGAN_HAN',
        'TRANG_DIEM_THAM_MY',
        array['SHORT_UNEMPLOYMENT_SUPPORT', 'SHORT_ONSITE_HEU']::text[],
        'Khóa ngắn hạn nghề dịch vụ',
        'Nếu có hỗ trợ/chính sách bên ngoài thì phải tách hồ sơ chính sách khỏi COM.',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        true,
        false,
        false,
        'DAT_TAM_THOI',
        'Danh mục tạm kiểm soát; cần xác nhận chương trình, thời lượng, học phí, chứng chỉ.'
      ),
      (
        'UNI_OTHER_HV_BC_VT',
        'Liên thông Học viện Công nghệ Bưu chính Viễn thông',
        'LIEN_THONG_DAI_HOC',
        'LIEN_THONG_HV_BUU_CHINH_VIEN_THONG',
        array['UNIVERSITY_TRANSFER_OTHER']::text[],
        'Liên thông đại học ngoài HOU',
        'Chỉ dùng khi có hợp đồng/trường liên kết, phụ lục học phí, cơ chế COM và người duyệt riêng.',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        'CAN_BO_SUNG',
        true,
        false,
        false,
        'CAN_SUA',
        'Mục này là dữ liệu cũ để giữ cấu trúc hệ thống; chưa đủ căn cứ vận hành chính thức nếu thiếu hợp đồng/học phí/chỉ tiêu.'
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
    nullif(o.legal_ref, 'CAN_BO_SUNG') as legal_ref,
    nullif(o.tuition_policy_ref, 'CAN_BO_SUNG') as tuition_policy_ref,
    nullif(o.com_policy_ref, 'CAN_BO_SUNG') as com_policy_ref,
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
  case
    when catalog_group_code = 'NGAN_HAN' then 'DAO_TAO + TUYEN_SINH + KHTC'
    else 'TUYEN_SINH + PHAP_CHE + KHTC'
  end,
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

-- Once P0-21 has explicit offerings, remove broad "all majors in program" rules
-- for short-course and non-HOU university-transfer workspaces.
update public.admission_segment_program_rules r
set status = 'INACTIVE',
    updated_at = now(),
    note = concat(coalesce(r.note, ''), ' | P0-21 replaced broad rule by explicit offering rules.')
from public.admission_segments s
join public.admission_programs p on p.id = r.program_id
where r.segment_id = s.id
  and r.major_id is null
  and r.status = 'ACTIVE'
  and (
    s.segment_code in ('SHORT_UNEMPLOYMENT_SUPPORT', 'SHORT_ONSITE_HEU')
    or s.segment_code = 'UNIVERSITY_TRANSFER_OTHER'
  )
  and p.program_code in ('NGAN_HAN', 'LIEN_THONG_DAI_HOC');

with explicit_rules as (
  select
    s.id as segment_id,
    o.program_id,
    o.admission_major_id as major_id,
    true as is_required,
    row_number() over (
      partition by s.segment_code
      order by p.sort_order nulls last, m.sort_order nulls last, o.offering_name
    )::int as sort_order,
    'P0-21: Chi hien offering "' || o.offering_name || '" cho workspace ' || s.segment_code || '.' as note
  from public.admission_offering_catalog o
  join public.admission_segments s on s.segment_code = any(o.allowed_segment_codes)
  join public.admission_programs p on p.id = o.program_id
  join public.admission_majors m on m.id = o.admission_major_id
  where o.status = 'ACTIVE'
    and o.is_advisable = true
    and s.status = 'ACTIVE'
    and p.status = 'ACTIVE'
    and m.status = 'ACTIVE'
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
  (sort_order = 1) as is_default,
  is_required,
  sort_order * 10,
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

update public.admission_segment_catalog_controls c
set allowed_major_policy = 'PROGRAM_ACTIVE_MAJORS',
    requires_major_catalog = true,
    control_status = 'DAT_TAM_THOI',
    note = concat(coalesce(c.note, ''), ' | P0-21 da co offering catalog chi tiet.'),
    updated_at = now()
from public.admission_segments s
where c.segment_id = s.id
  and s.segment_code in (
    'SHORT_UNEMPLOYMENT_SUPPORT',
    'SHORT_ONSITE_HEU',
    'UNIVERSITY_TRANSFER_OTHER'
  );

create or replace view public.admission_offering_catalog_status
with (security_invoker = true)
as
select
  o.id,
  o.offering_code,
  o.offering_name,
  o.catalog_group_code,
  g.catalog_group_name,
  p.program_code,
  p.program_name,
  m.major_code,
  m.major_name,
  o.allowed_segment_codes,
  coalesce(segment_stats.segment_count, 0)::int as segment_count,
  o.delivery_model,
  o.partner_policy,
  o.legal_ref,
  o.tuition_policy_ref,
  o.com_policy_ref,
  o.is_advisable,
  o.is_enrollment_ready,
  o.is_finance_ready,
  o.owner_department,
  o.checker_department,
  o.approver_role,
  o.control_status,
  array_remove(array[
    case when o.admission_major_id is null then 'NO_MAJOR_MAPPING' end,
    case when cardinality(o.allowed_segment_codes) = 0 then 'NO_WORKSPACE_SCOPE' end,
    case when o.legal_ref is null or length(trim(o.legal_ref)) = 0 then 'MISSING_LEGAL_REF' end,
    case when o.tuition_policy_ref is null or length(trim(o.tuition_policy_ref)) = 0 then 'MISSING_TUITION_POLICY' end,
    case when o.is_enrollment_ready = false then 'NOT_ENROLLMENT_READY' end,
    case when o.is_finance_ready = false then 'NOT_FINANCE_READY' end,
    case when o.control_status in ('CAN_SUA', 'CHUA_DU_DIEU_KIEN') then 'CONTROL_NOT_READY' end,
    case when m.status <> 'ACTIVE' then 'MAJOR_INACTIVE' end,
    case when p.status <> 'ACTIVE' then 'PROGRAM_INACTIVE' end
  ], null) as control_flags,
  case
    when o.admission_major_id is null then 'BLOCKED'
    when cardinality(o.allowed_segment_codes) = 0 then 'BLOCKED'
    when m.status <> 'ACTIVE' or p.status <> 'ACTIVE' then 'BLOCKED'
    when o.control_status in ('CAN_SUA', 'CHUA_DU_DIEU_KIEN') then 'NEEDS_FIX'
    when o.legal_ref is null or o.tuition_policy_ref is null then 'NEEDS_FIX'
    else 'READY'
  end as offering_status,
  o.note,
  o.status,
  o.created_at,
  o.updated_at
from public.admission_offering_catalog o
join public.admission_catalog_groups g on g.catalog_group_code = o.catalog_group_code
join public.admission_programs p on p.id = o.program_id
left join public.admission_majors m on m.id = o.admission_major_id
left join lateral (
  select count(*) as segment_count
  from public.admission_segments s
  where s.status = 'ACTIVE'
    and s.segment_code = any(o.allowed_segment_codes)
) segment_stats on true
where o.status = 'ACTIVE'
  and (public.can_read_master_control() or public.has_permission('admission_config.manage'));

grant select on public.admission_offering_catalog to authenticated;
grant select on public.admission_offering_catalog_status to authenticated;

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
  'WF_P0_21_ADMISSION_OFFERING_CATALOG',
  'P0-21 Danh muc khoa/nganh chi tiet theo workspace',
  'M05_ADMISSION_CRM',
  'Them/sua danh muc ngan han hoac lien thong dai hoc ngoai HOU.',
  'IT_DATA',
  'DAO_TAO + TUYEN_SINH + KHTC',
  'PHAP_CHE + KHTC + TRUONG_PHONG_TUYEN_SINH',
  'BGH',
  'Moi offering chi hien trong workspace duoc phep va co trang thai kiem soat rieng.',
  'Neu offering chua co legal_ref/hoc phi thi chi dung de tu van tam, khong coi la san sang nhap hoc/tai chinh.',
  'Moi thay doi admission_offering_catalog va admission_segment_program_rules phai ghi audit log.',
  521,
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
  'MD_P0_21_ADMISSION_OFFERING_CATALOG',
  'Danh muc khoa/nganh chi tiet theo workspace',
  'M05_ADMISSION_CRM',
  'admission_offering_catalog,admission_majors,admission_segment_program_rules',
  'CONFIG',
  'DAO_TAO + TUYEN_SINH + KHTC + IT_DATA',
  'HEU_OS',
  'INTERNAL',
  true,
  'Them/sua offering phai gan catalog_group_code, program, major, workspace scope, owner, checker, approver va trang thai kiem soat.',
  'DAT_TAM_THOI'
) on conflict (data_code) do update set
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
) values (
  'RISK_P0_21_OFFERING_NOT_VERIFIED',
  'Khoa/nganh tu van chua du can cu phap ly/hoc phi',
  'M05_ADMISSION_CRM',
  'LEGAL_FINANCE_DATA',
  'HIGH',
  'DAO_TAO + TUYEN_SINH + KHTC + PHAP_CHE',
  'Neu danh muc ngan han/lien thong ngoai HOU chua co legal_ref, hoc phi, hop dong hoac chinh sach COM thi co rui ro tu van sai, thu sai, chi sai.',
  'admission_offering_catalog phai ghi control_status, legal_ref, tuition_policy_ref va readiness; form chi hien dung workspace, handover/tai chinh phai kiem gate sau.',
  'Offering NEEDS_FIX/BLOCKED phai duoc Truong phong + Phap che/KHTC xu ly truoc khi chot nhap hoc/tai chinh.',
  'So offering NEEDS_FIX/BLOCKED; so lead chon offering chua enrollment_ready/finance_ready.',
  'DAT_TAM_THOI'
) on conflict (risk_code) do update set
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
  'admission_offering_catalog',
  'Danh muc khoa/nganh chi tiet theo workspace',
  'M05_ADMISSION_CRM',
  'CONFIG',
  'DAO_TAO + TUYEN_SINH + KHTC + IT_DATA',
  'Luu tung khoa/nganh duoc phep hien trong tung doi tuong tuyen sinh, gom trang thai phap ly, hoc phi va COM.',
  'INTERNAL',
  true,
  'DAT_TAM_THOI'
) on conflict (table_code) do update set
  table_name = excluded.table_name,
  module_code = excluded.module_code,
  table_type = excluded.table_type,
  data_owner_department = excluded.data_owner_department,
  purpose = excluded.purpose,
  sensitivity_level = excluded.sensitivity_level,
  ai_allowed = excluded.ai_allowed,
  control_status = excluded.control_status,
  updated_at = now();

with target_table as (
  select id
  from public.data_dictionary_tables
  where table_code = 'admission_offering_catalog'
),
field_seed as (
  select *
  from (
    values
      ('offering_code', 'Ma khoa/nganh chi tiet', 'text', true, true, false, true,
       'Ma duy nhat cho tung offering.'),
      ('catalog_group_code', 'Nhom catalog', 'text', true, false, false, true,
       'TRUNG_CAP / NGAN_HAN / LIEN_THONG_DAI_HOC.'),
      ('allowed_segment_codes', 'Workspace duoc phep', 'text[]', true, false, false, true,
       'Danh sach admission segment duoc hien offering nay.'),
      ('legal_ref', 'Can cu phap ly', 'text', false, false, false, true,
       'Can bo sung truoc khi coi la san sang nhap hoc.'),
      ('tuition_policy_ref', 'Chinh sach hoc phi', 'text', false, false, false, true,
       'Can bo sung truoc khi ban giao tai chinh.'),
      ('is_enrollment_ready', 'San sang nhap hoc', 'boolean', true, false, false, true,
       'false neu chua du legal/hoc phi/ho so.'),
      ('is_finance_ready', 'San sang tai chinh', 'boolean', true, false, false, true,
       'false neu chua du hoc phi/chung tu/doi soat.')
  ) as v(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, note)
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
  f.note,
  'DAT_TAM_THOI'
from target_table t
cross join field_seed f
on conflict (table_id, field_code) do update set
  field_name = excluded.field_name,
  data_type = excluded.data_type,
  is_required = excluded.is_required,
  is_unique = excluded.is_unique,
  is_sensitive = excluded.is_sensitive,
  ai_allowed = excluded.ai_allowed,
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
  control_status,
  status
) values (
  'OWN_P0_21_ADMISSION_OFFERING_CATALOG',
  'Quan ly danh muc khoa/nganh chi tiet theo workspace',
  'M05_ADMISSION_CRM',
  'WF_P0_21_ADMISSION_OFFERING_CATALOG',
  'CONFIG',
  'admission_offering_catalog',
  'DAO_TAO + TUYEN_SINH + KHTC',
  'IT_DATA',
  'PHAP_CHE + KHTC + TRUONG_PHONG_TUYEN_SINH',
  'BGH',
  'ROLE_AND_SCOPE',
  'DAO_TAO',
  'TUYEN_SINH + KHTC + IT_DATA',
  'Thong bao tuyen sinh, can cu phap ly, hoc phi, chinh sach COM, workspace duoc phep.',
  'Moi tao/sua offering phai ghi audit log va khong duoc mo rong workspace neu chua co owner/checker/approver.',
  48,
  'HIGH',
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
  'GATE_P0_21_OFFERING_CATALOG_READY',
  'P0-21 Danh muc khoa/nganh chi tiet san sang van hanh',
  'DATA',
  'ADMISSION_OFFERING',
  'P0_21_ADMISSION_OFFERING_CATALOG',
  'DAO_TAO + TUYEN_SINH + KHTC',
  'Kiem tra moi offering co workspace scope, major mapping, legal_ref, tuition_policy_ref va readiness phu hop.',
  'BGH/Truong phong phe duyet truoc khi mo offering thanh chinh thuc hoac cho phep AI tu dong goi y.',
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
