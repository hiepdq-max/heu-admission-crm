-- Step 58 - HEU Intermediate Major Master.
-- Run after step57_dynamic_lead_form_enforcement.sql.
-- Purpose: control the temporary HEU intermediate major list used for
-- admission advice, lead creation, enrollment documents, tuition mapping,
-- class opening and reports.

create table if not exists public.nganh_nghe_master (
  id uuid primary key default gen_random_uuid(),
  nganh_id text not null unique,
  ten_nganh_tu_van text not null,
  ten_nganh_phap_ly text,
  trinh_do text not null,
  ma_nganh_nghe text,
  khoa_phu_trach text,
  chuong_trinh_id uuid references public.admission_programs(id),
  hoc_phi_policy_id text,
  trang_thai_tuyen_sinh text not null default 'DANG_TUYEN',
  legal_ref text,
  owner_department text not null default 'DAO_TAO',
  checker_department text not null default 'PHAP_CHE + IT_DATA',
  approver_role text not null default 'BGH_HIEU_TRUONG',
  control_status text not null default 'DAT_TAM_THOI',
  note text,
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nganh_nghe_master_trang_thai_valid check (
    trang_thai_tuyen_sinh in ('DANG_TUYEN', 'TAM_DUNG', 'CHUA_DU_DIEU_KIEN')
  ),
  constraint nganh_nghe_master_control_status_valid check (
    control_status in ('DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN', 'CHINH_THUC')
  )
);

create index if not exists idx_nganh_nghe_master_trinh_do
on public.nganh_nghe_master(trinh_do, trang_thai_tuyen_sinh, status);

create index if not exists idx_nganh_nghe_master_chuong_trinh
on public.nganh_nghe_master(chuong_trinh_id)
where status = 'ACTIVE';

alter table public.nganh_nghe_master enable row level security;

drop policy if exists "nganh_nghe_master_select_authenticated"
on public.nganh_nghe_master;
create policy "nganh_nghe_master_select_authenticated"
on public.nganh_nghe_master for select
to authenticated
using (true);

drop policy if exists "nganh_nghe_master_manage_admission_config"
on public.nganh_nghe_master;
create policy "nganh_nghe_master_manage_admission_config"
on public.nganh_nghe_master for all
to authenticated
using (
  public.is_admin()
  or public.has_permission('settings.manage')
  or public.has_permission('admission_config.manage')
)
with check (
  public.is_admin()
  or public.has_permission('settings.manage')
  or public.has_permission('admission_config.manage')
);

drop trigger if exists trg_nganh_nghe_master_updated_at
on public.nganh_nghe_master;
create trigger trg_nganh_nghe_master_updated_at
before update on public.nganh_nghe_master
for each row execute function public.set_updated_at();

drop trigger if exists trg_nganh_nghe_master_audit
on public.nganh_nghe_master;
create trigger trg_nganh_nghe_master_audit
after insert or update or delete on public.nganh_nghe_master
for each row execute function public.write_audit_log();

create or replace view public.nganh_nghe_master_readable
with (security_invoker = true)
as
select
  n.id,
  n.nganh_id,
  n.ten_nganh_tu_van,
  n.ten_nganh_phap_ly,
  n.trinh_do,
  n.ma_nganh_nghe,
  n.khoa_phu_trach,
  n.chuong_trinh_id,
  p.program_code as chuong_trinh_code,
  p.program_name as chuong_trinh_name,
  n.hoc_phi_policy_id,
  n.trang_thai_tuyen_sinh,
  n.legal_ref,
  n.owner_department,
  n.checker_department,
  n.approver_role,
  n.control_status,
  n.note,
  n.status,
  n.created_at,
  n.updated_at
from public.nganh_nghe_master n
left join public.admission_programs p on p.id = n.chuong_trinh_id;

grant select on public.nganh_nghe_master_readable to authenticated;

insert into public.admission_programs (
  program_code,
  program_name,
  sort_order,
  status
) values (
  'TRUNG_CAP',
  'Trung cấp',
  10,
  'ACTIVE'::public.record_status
) on conflict (program_code) do update set
  program_name = excluded.program_name,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

with trung_cap_program as (
  select id
  from public.admission_programs
  where program_code = 'TRUNG_CAP'
),
major_seed as (
  select *
  from (
    values
      ('TUD', 'Tin học ứng dụng (TUD)', 'Tin học ứng dụng', 'Trung cấp', null::text, 'CNTT/Tin học', 10,
       'DAT_TAM_THOI', 'DANG_TUYEN', 'Nguồn hiện có xác nhận ở mức khoa/chuyên môn. Cần đối chiếu quyết định cho phép đào tạo, mã ngành/nghề, chỉ tiêu và học phí.'),
      ('CNTT', 'Công nghệ thông tin (CNTT)', 'Công nghệ thông tin', 'Trung cấp', null::text, 'CNTT/Tin học', 20,
       'DAT_TAM_THOI', 'DANG_TUYEN', 'Không dùng tên IT khi tư vấn. Dùng CNTT/Tin học ứng dụng theo chuẩn HEU.'),
      ('KTDN', 'Kế toán doanh nghiệp', 'Kế toán doanh nghiệp', 'Trung cấp', null::text, 'Kế toán', 30,
       'DAT_TAM_THOI', 'DANG_TUYEN', 'Cần map học phí và căn cứ pháp lý trước khi chốt chính thức.'),
      ('MKT', 'Marketing thương mại / Marketing', 'Marketing', 'Trung cấp', null::text, 'Marketing', 40,
       'DAT_TAM_THOI', 'DANG_TUYEN', 'Tên tư vấn tạm kiểm soát, cần xác nhận tên pháp lý cuối cùng.'),
      ('DL', 'Hướng dẫn du lịch / Du lịch', 'Hướng dẫn du lịch', 'Trung cấp', null::text, 'Du lịch', 50,
       'DAT_TAM_THOI', 'DANG_TUYEN', 'Tên tư vấn tạm kiểm soát, cần xác nhận tên pháp lý cuối cùng.')
  ) as v(
    nganh_id,
    ten_nganh_tu_van,
    ten_nganh_phap_ly,
    trinh_do,
    ma_nganh_nghe,
    khoa_phu_trach,
    sort_order,
    control_status,
    trang_thai_tuyen_sinh,
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
  null,
  m.trang_thai_tuyen_sinh,
  'CAN_DOI_CHIEU_FILE_REGISTRY_QUYET_DINH_CHO_PHEP_DAO_TAO',
  'DAO_TAO',
  'PHAP_CHE + IT_DATA',
  'BGH_HIEU_TRUONG',
  m.control_status,
  m.note,
  'ACTIVE'::public.record_status
from major_seed m
cross join trung_cap_program p
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

with trung_cap_program as (
  select id
  from public.admission_programs
  where program_code = 'TRUNG_CAP'
),
major_seed as (
  select *
  from (
    values
      ('TUD', 'Tin học ứng dụng (TUD)', 10),
      ('CNTT', 'Công nghệ thông tin (CNTT)', 20),
      ('KTDN', 'Kế toán doanh nghiệp', 30),
      ('MKT', 'Marketing thương mại / Marketing', 40),
      ('DL', 'Hướng dẫn du lịch / Du lịch', 50)
  ) as v(major_code, major_name, sort_order)
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
cross join trung_cap_program p
on conflict (major_code) do update set
  major_name = excluded.major_name,
  program_id = excluded.program_id,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

-- Temporarily hide old/uncorroborated intermediate majors from lead forms.
update public.admission_majors m
set status = 'INACTIVE',
    updated_at = now()
from public.admission_programs p
where m.program_id = p.id
  and p.program_code = 'TRUNG_CAP'
  and m.major_code not in ('TUD', 'CNTT', 'KTDN', 'MKT', 'DL');

-- Keep all active TC9 admission objects mapped to the Trung cap program.
-- Because these rules use major_id = null, the UI will show only active
-- Trung cap majors, currently the 5 temporary controlled HEU majors above.
with trung_cap_program as (
  select id
  from public.admission_programs
  where program_code = 'TRUNG_CAP'
),
tc9_segments as (
  select id, segment_code
  from public.admission_segments
  where segment_code in ('TC9_TTGDTX_LINKED', 'TC9_ONSITE_HEU')
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
  s.id,
  p.id,
  null,
  true,
  true,
  case when s.segment_code = 'TC9_TTGDTX_LINKED' then 10 else 20 end,
  'P0-18/Step58: TC9 only shows HEU controlled intermediate majors: TUD, CNTT, KTDN, MKT, DL.',
  'ACTIVE'::public.record_status
from tc9_segments s
cross join trung_cap_program p
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
  'NGANH_NGHE_MASTER',
  'Nganh nghe Master HEU',
  'M05_ADMISSION_CRM',
  'nganh_nghe_master',
  'MASTER',
  'DAO_TAO + PHAP_CHE + IT_DATA',
  'HEU_OS',
  'INTERNAL',
  true,
  'Moi nganh nghe phai co ten tu van, ten phap ly, trinh do, owner, checker, approver va trang thai kiem soat truoc khi dung production.',
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
  'NGANH_NGHE_MASTER',
  'Nganh nghe Master',
  'M05_ADMISSION_CRM',
  'MASTER',
  'DAO_TAO + PHAP_CHE + IT_DATA',
  'Danh muc nganh/nghe dung cho tu van, ho so nhap hoc, hoc phi, lop va bao cao tuyen sinh.',
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
  'RISK_TC_MAJOR_NOT_LEGAL_CONFIRMED',
  'Nganh trung cap chua doi chieu can cu phap ly',
  'M05_ADMISSION_CRM',
  'LEGAL_DATA',
  'HIGH',
  'DAO_TAO + PHAP_CHE',
  'Neu tu van hoac mo ho so theo ten nganh chua duoc doi chieu quyet dinh/ma nganh/hoc phi/chi tieu thi co rui ro sai phap ly va sai bao cao.',
  'Chi dung danh muc DAT_TAM_THOI cho tu van ban dau; truoc khi chot nhap hoc/hoc phi/lop phai co checker Phap che + IT/Data va approver BGH/Hieu truong.',
  'Tam dung tu van/nganh neu trang thai CHUA_DU_DIEU_KIEN hoac thieu LEGAL_REF.',
  'So nganh trung cap dang DAT_TAM_THOI/chua co legal_ref chinh thuc',
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
  'WF_STEP58_TC_MAJOR_MASTER',
  'Kiem soat danh muc nganh trung cap HEU',
  'M05_ADMISSION_CRM',
  'Cap nhat danh muc nganh/nghe he Trung cap dung cho tu van va tao lead.',
  'DAO_TAO',
  'DAO_TAO + PHAP_CHE + IT_DATA',
  'PHAP_CHE + IT_DATA',
  'BGH_HIEU_TRUONG',
  'Form lead TC9 chi hien 5 nganh trung cap tam kiem soat: TUD, CNTT, KTDN, MKT, DL.',
  'Truoc khi ban giao CTHSSV/KHTC/Dao tao phai doi chieu LEGAL_REF, hoc phi va chi tieu.',
  'Moi thay doi nganh_nghe_master/admission_majors/admission_segment_program_rules phai ghi audit log.',
  558,
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
