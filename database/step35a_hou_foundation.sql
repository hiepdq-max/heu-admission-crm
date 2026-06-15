-- Step 35A - HOU foundation for the university transfer / distance-learning flow.
-- Run after step34b_lead_flow_link.sql.

insert into public.admission_programs (program_code, program_name, sort_order)
values ('LIEN_THONG_DAI_HOC', 'Liên thông đại học', 30)
on conflict (program_code) do update set
  program_name = excluded.program_name,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

create table if not exists public.hou_programs (
  id uuid primary key default gen_random_uuid(),
  admission_program_id uuid references public.admission_programs(id),
  program_code text not null unique,
  program_name text not null,
  program_type text not null,
  awarding_institution text not null,
  coordinating_institution text not null,
  delivery_mode text not null,
  admission_system_url text,
  admission_system_account text,
  lms_url text,
  lms_management_account text,
  info_url text,
  contract_code text,
  contract_signed_on date,
  valid_from date,
  valid_to date,
  tuition_collection_owner text not null default 'HOU',
  notes text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hou_locations (
  id uuid primary key default gen_random_uuid(),
  location_code text not null unique,
  location_name text not null,
  address_line text not null,
  ward text,
  district_legacy text,
  province text,
  approval_decision_no text,
  approval_decision_date date,
  valid_from date,
  source_document text,
  notes text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hou_majors (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.hou_programs(id),
  major_code text not null unique,
  major_name text not null,
  source_document text,
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hou_admission_stages (
  id uuid primary key default gen_random_uuid(),
  stage_code text not null unique,
  stage_name text not null,
  stage_description text not null,
  sort_order int not null default 0,
  is_terminal boolean not null default false,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hou_academic_years (
  id uuid primary key default gen_random_uuid(),
  academic_year_code text not null unique,
  academic_year_name text not null,
  starts_on date not null,
  ends_on date not null,
  source_document text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hou_academic_years_valid_range check (ends_on >= starts_on)
);

create table if not exists public.hou_terms (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.hou_academic_years(id) on delete cascade,
  term_code text not null,
  term_name text not null,
  starts_on date not null,
  ends_on date not null,
  learning_start_on date,
  second_learning_start_on date,
  tuition_collection_starts_on date,
  tuition_collection_ends_on date,
  result_recognition_month text,
  source_document text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (academic_year_id, term_code),
  constraint hou_terms_valid_range check (ends_on >= starts_on),
  constraint hou_terms_valid_tuition_range check (
    tuition_collection_ends_on is null
    or tuition_collection_starts_on is null
    or tuition_collection_ends_on >= tuition_collection_starts_on
  )
);

create table if not exists public.hou_exam_dates (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.hou_academic_years(id) on delete cascade,
  exam_code text not null unique,
  exam_date date not null,
  exam_type text not null default 'END_OF_MODULE',
  note text,
  source_document text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hou_graduation_rounds (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.hou_academic_years(id) on delete cascade,
  round_code text not null unique,
  planned_month date not null,
  note text,
  source_document text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hou_financial_policies (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.hou_programs(id),
  policy_code text not null unique,
  policy_name text not null,
  policy_type text not null check (
    policy_type in ('RECRUITMENT_SUPPORT', 'TRAINING_COOP_SHARE')
  ),
  amount_vnd int,
  hou_share_percent numeric(5,2),
  heu_share_percent numeric(5,2),
  effective_from date not null,
  effective_to date,
  payment_condition text not null,
  source_document text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hou_financial_policies_has_value check (
    amount_vnd is not null
    or (hou_share_percent is not null and heu_share_percent is not null)
  ),
  constraint hou_financial_policies_amount_positive check (
    amount_vnd is null or amount_vnd >= 0
  ),
  constraint hou_financial_policies_share_total check (
    hou_share_percent is null
    or heu_share_percent is null
    or hou_share_percent + heu_share_percent = 100
  )
);

create table if not exists public.hou_admin_classes (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.hou_programs(id),
  major_id uuid references public.hou_majors(id),
  location_id uuid references public.hou_locations(id),
  class_code text not null unique,
  class_name text not null,
  cohort_code text,
  academic_year_code text,
  source_document text,
  notes text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_hou_majors_program_id
on public.hou_majors(program_id);

create index if not exists idx_hou_terms_academic_year_id
on public.hou_terms(academic_year_id);

create index if not exists idx_hou_exam_dates_academic_year_id
on public.hou_exam_dates(academic_year_id);

create index if not exists idx_hou_graduation_rounds_academic_year_id
on public.hou_graduation_rounds(academic_year_id);

create index if not exists idx_hou_financial_policies_program_id
on public.hou_financial_policies(program_id);

create index if not exists idx_hou_admin_classes_program_id
on public.hou_admin_classes(program_id);

create index if not exists idx_hou_admin_classes_major_id
on public.hou_admin_classes(major_id);

alter table public.hou_programs enable row level security;
alter table public.hou_locations enable row level security;
alter table public.hou_majors enable row level security;
alter table public.hou_admission_stages enable row level security;
alter table public.hou_academic_years enable row level security;
alter table public.hou_terms enable row level security;
alter table public.hou_exam_dates enable row level security;
alter table public.hou_graduation_rounds enable row level security;
alter table public.hou_financial_policies enable row level security;
alter table public.hou_admin_classes enable row level security;

drop policy if exists "hou_programs_select_authenticated" on public.hou_programs;
create policy "hou_programs_select_authenticated"
on public.hou_programs for select
to authenticated
using (true);

drop policy if exists "hou_programs_admin_write" on public.hou_programs;
create policy "hou_programs_admin_write"
on public.hou_programs for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "hou_locations_select_authenticated" on public.hou_locations;
create policy "hou_locations_select_authenticated"
on public.hou_locations for select
to authenticated
using (true);

drop policy if exists "hou_locations_admin_write" on public.hou_locations;
create policy "hou_locations_admin_write"
on public.hou_locations for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "hou_majors_select_authenticated" on public.hou_majors;
create policy "hou_majors_select_authenticated"
on public.hou_majors for select
to authenticated
using (true);

drop policy if exists "hou_majors_admin_write" on public.hou_majors;
create policy "hou_majors_admin_write"
on public.hou_majors for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "hou_admission_stages_select_authenticated" on public.hou_admission_stages;
create policy "hou_admission_stages_select_authenticated"
on public.hou_admission_stages for select
to authenticated
using (true);

drop policy if exists "hou_admission_stages_admin_write" on public.hou_admission_stages;
create policy "hou_admission_stages_admin_write"
on public.hou_admission_stages for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "hou_academic_years_select_authenticated" on public.hou_academic_years;
create policy "hou_academic_years_select_authenticated"
on public.hou_academic_years for select
to authenticated
using (true);

drop policy if exists "hou_academic_years_admin_write" on public.hou_academic_years;
create policy "hou_academic_years_admin_write"
on public.hou_academic_years for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "hou_terms_select_authenticated" on public.hou_terms;
create policy "hou_terms_select_authenticated"
on public.hou_terms for select
to authenticated
using (true);

drop policy if exists "hou_terms_admin_write" on public.hou_terms;
create policy "hou_terms_admin_write"
on public.hou_terms for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "hou_exam_dates_select_authenticated" on public.hou_exam_dates;
create policy "hou_exam_dates_select_authenticated"
on public.hou_exam_dates for select
to authenticated
using (true);

drop policy if exists "hou_exam_dates_admin_write" on public.hou_exam_dates;
create policy "hou_exam_dates_admin_write"
on public.hou_exam_dates for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "hou_graduation_rounds_select_authenticated" on public.hou_graduation_rounds;
create policy "hou_graduation_rounds_select_authenticated"
on public.hou_graduation_rounds for select
to authenticated
using (true);

drop policy if exists "hou_graduation_rounds_admin_write" on public.hou_graduation_rounds;
create policy "hou_graduation_rounds_admin_write"
on public.hou_graduation_rounds for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "hou_financial_policies_select_authenticated" on public.hou_financial_policies;
create policy "hou_financial_policies_select_authenticated"
on public.hou_financial_policies for select
to authenticated
using (
  policy_type <> 'TRAINING_COOP_SHARE'
  or public.current_user_role_code() in ('ADMIN', 'BGH', 'ADMISSION_HEAD')
);

drop policy if exists "hou_financial_policies_admin_write" on public.hou_financial_policies;
create policy "hou_financial_policies_admin_write"
on public.hou_financial_policies for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "hou_admin_classes_select_authenticated" on public.hou_admin_classes;
create policy "hou_admin_classes_select_authenticated"
on public.hou_admin_classes for select
to authenticated
using (true);

drop policy if exists "hou_admin_classes_admin_write" on public.hou_admin_classes;
create policy "hou_admin_classes_admin_write"
on public.hou_admin_classes for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop trigger if exists trg_hou_programs_updated_at on public.hou_programs;
create trigger trg_hou_programs_updated_at
before update on public.hou_programs
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_locations_updated_at on public.hou_locations;
create trigger trg_hou_locations_updated_at
before update on public.hou_locations
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_majors_updated_at on public.hou_majors;
create trigger trg_hou_majors_updated_at
before update on public.hou_majors
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_admission_stages_updated_at on public.hou_admission_stages;
create trigger trg_hou_admission_stages_updated_at
before update on public.hou_admission_stages
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_academic_years_updated_at on public.hou_academic_years;
create trigger trg_hou_academic_years_updated_at
before update on public.hou_academic_years
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_terms_updated_at on public.hou_terms;
create trigger trg_hou_terms_updated_at
before update on public.hou_terms
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_exam_dates_updated_at on public.hou_exam_dates;
create trigger trg_hou_exam_dates_updated_at
before update on public.hou_exam_dates
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_graduation_rounds_updated_at on public.hou_graduation_rounds;
create trigger trg_hou_graduation_rounds_updated_at
before update on public.hou_graduation_rounds
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_financial_policies_updated_at on public.hou_financial_policies;
create trigger trg_hou_financial_policies_updated_at
before update on public.hou_financial_policies
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_admin_classes_updated_at on public.hou_admin_classes;
create trigger trg_hou_admin_classes_updated_at
before update on public.hou_admin_classes
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_programs_audit on public.hou_programs;
create trigger trg_hou_programs_audit
after insert or update or delete on public.hou_programs
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_locations_audit on public.hou_locations;
create trigger trg_hou_locations_audit
after insert or update or delete on public.hou_locations
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_majors_audit on public.hou_majors;
create trigger trg_hou_majors_audit
after insert or update or delete on public.hou_majors
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_admission_stages_audit on public.hou_admission_stages;
create trigger trg_hou_admission_stages_audit
after insert or update or delete on public.hou_admission_stages
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_academic_years_audit on public.hou_academic_years;
create trigger trg_hou_academic_years_audit
after insert or update or delete on public.hou_academic_years
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_terms_audit on public.hou_terms;
create trigger trg_hou_terms_audit
after insert or update or delete on public.hou_terms
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_exam_dates_audit on public.hou_exam_dates;
create trigger trg_hou_exam_dates_audit
after insert or update or delete on public.hou_exam_dates
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_graduation_rounds_audit on public.hou_graduation_rounds;
create trigger trg_hou_graduation_rounds_audit
after insert or update or delete on public.hou_graduation_rounds
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_financial_policies_audit on public.hou_financial_policies;
create trigger trg_hou_financial_policies_audit
after insert or update or delete on public.hou_financial_policies
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_admin_classes_audit on public.hou_admin_classes;
create trigger trg_hou_admin_classes_audit
after insert or update or delete on public.hou_admin_classes
for each row execute function public.write_audit_log();

with admission_program as (
  select id
  from public.admission_programs
  where program_code = 'LIEN_THONG_DAI_HOC'
)
insert into public.hou_programs (
  admission_program_id,
  program_code,
  program_name,
  program_type,
  awarding_institution,
  coordinating_institution,
  delivery_mode,
  admission_system_url,
  admission_system_account,
  lms_url,
  lms_management_account,
  info_url,
  contract_code,
  contract_signed_on,
  valid_from,
  valid_to,
  tuition_collection_owner,
  notes
)
select
  admission_program.id,
  'HOU_DISTANCE_UNIVERSITY',
  'Đại học từ xa HOU',
  'DISTANCE_UNIVERSITY',
  'Trường Đại học Mở Hà Nội',
  'Trường Trung cấp Công nghệ và Kinh tế Đối ngoại',
  'Đào tạo từ xa trình độ đại học',
  'https://tuyensinh.hou.edu.vn/admin',
  'ehou_ktdoingoai',
  'https://learning.ehou.edu.vn/',
  'HCT',
  'https://vdtsd.hou.edu.vn/',
  '2141/2024/HĐ-ĐHM',
  '2024-06-05',
  '2024-06-05',
  '2028-06-04',
  'HOU',
  'HEU phối hợp tuyển sinh, tư vấn, hỗ trợ hồ sơ và địa điểm; HOU quản lý chương trình, học liệu, học phí, kết quả học tập, tốt nghiệp và cấp bằng.'
from admission_program
on conflict (program_code) do update set
  admission_program_id = excluded.admission_program_id,
  program_name = excluded.program_name,
  program_type = excluded.program_type,
  awarding_institution = excluded.awarding_institution,
  coordinating_institution = excluded.coordinating_institution,
  delivery_mode = excluded.delivery_mode,
  admission_system_url = excluded.admission_system_url,
  admission_system_account = excluded.admission_system_account,
  lms_url = excluded.lms_url,
  lms_management_account = excluded.lms_management_account,
  info_url = excluded.info_url,
  contract_code = excluded.contract_code,
  contract_signed_on = excluded.contract_signed_on,
  valid_from = excluded.valid_from,
  valid_to = excluded.valid_to,
  tuition_collection_owner = excluded.tuition_collection_owner,
  notes = excluded.notes,
  status = 'ACTIVE',
  updated_at = now();

insert into public.hou_locations (
  location_code,
  location_name,
  address_line,
  ward,
  district_legacy,
  province,
  approval_decision_no,
  approval_decision_date,
  valid_from,
  source_document,
  notes
) values (
  'HOU_HEU_41_DTC',
  'HEU - 41 Đặng Trần Côn',
  '41 Đặng Trần Côn',
  'Phường Quốc Tử Giám',
  'Quận Đống Đa',
  'Thành phố Hà Nội',
  '263/QĐ-ĐHM',
  '2025-01-15',
  '2025-01-15',
  'QĐ bổ sung địa điểm HEU số 263/QĐ-ĐHM ngày 15/01/2025',
  'Lưu địa chỉ theo quyết định gốc. Trường district_legacy giữ Quận Đống Đa để phục vụ hồ sơ cũ.'
)
on conflict (location_code) do update set
  location_name = excluded.location_name,
  address_line = excluded.address_line,
  ward = excluded.ward,
  district_legacy = excluded.district_legacy,
  province = excluded.province,
  approval_decision_no = excluded.approval_decision_no,
  approval_decision_date = excluded.approval_decision_date,
  valid_from = excluded.valid_from,
  source_document = excluded.source_document,
  notes = excluded.notes,
  status = 'ACTIVE',
  updated_at = now();

insert into public.hou_majors (
  program_id,
  major_code,
  major_name,
  source_document,
  sort_order
)
select p.id, v.major_code, v.major_name, 'CV 353/CV-ĐTSĐ năm học 2025-2026', v.sort_order
from public.hou_programs p
cross join (
  values
    ('A', 'Kế toán', 10),
    ('B', 'Quản trị Kinh doanh', 20),
    ('C', 'Công nghệ Thông tin', 30),
    ('D', 'Tài chính - Ngân hàng', 40),
    ('E', 'Luật Kinh tế', 50),
    ('F', 'Ngôn ngữ Anh', 60),
    ('G', 'Quản trị Dịch vụ Du lịch và Lữ hành', 70),
    ('H', 'Luật', 80),
    ('M', 'Quản trị Khách sạn', 90),
    ('N', 'Thương mại Điện tử', 100),
    ('O', 'Ngôn ngữ Trung Quốc', 110)
) as v(major_code, major_name, sort_order)
where p.program_code = 'HOU_DISTANCE_UNIVERSITY'
on conflict (major_code) do update set
  program_id = excluded.program_id,
  major_name = excluded.major_name,
  source_document = excluded.source_document,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

insert into public.hou_admission_stages (
  stage_code,
  stage_name,
  stage_description,
  sort_order,
  is_terminal
) values
  ('CONSULTING', 'Đang tư vấn HOU', 'Lead đang được tư vấn chương trình HOU.', 10, false),
  ('HOU_SYSTEM_ENTERED', 'Đã nhập hệ thống HOU', 'Đã ghi nhận thông tin lên hệ thống tuyển sinh HOU.', 20, false),
  ('APPLICATION_SUBMITTED', 'Đã nộp hồ sơ HOU', 'Hồ sơ đã được gửi/ghi nhận theo quy trình HOU.', 30, false),
  ('ADMITTED', 'HOU báo trúng tuyển', 'HOU đã ghi nhận kết quả đủ điều kiện/trúng tuyển.', 40, false),
  ('ENROLLED', 'Đã nhập học HOU', 'Người học đã hoàn tất thủ tục nhập học.', 50, false),
  ('FIRST_TUITION_CONFIRMED', 'Đã xác nhận học phí kỳ đầu', 'Đã xác nhận nghĩa vụ tài chính kỳ đầu theo thông báo HOU.', 60, false),
  ('STUDYING', 'Đang học HOU', 'Người học đang theo học trên hệ thống HOU.', 70, false),
  ('DROPOUT', 'Thôi học HOU', 'Người học dừng học hoặc không tiếp tục theo học.', 80, true),
  ('GRADUATED', 'Tốt nghiệp HOU', 'Người học đã được xét/công nhận tốt nghiệp.', 90, true)
on conflict (stage_code) do update set
  stage_name = excluded.stage_name,
  stage_description = excluded.stage_description,
  sort_order = excluded.sort_order,
  is_terminal = excluded.is_terminal,
  status = 'ACTIVE',
  updated_at = now();

insert into public.hou_academic_years (
  academic_year_code,
  academic_year_name,
  starts_on,
  ends_on,
  source_document
) values (
  '2025_2026',
  'Năm học 2025-2026',
  '2025-08-11',
  '2026-08-09',
  'CV 353/CV-ĐTSĐ ngày 10/10/2025'
)
on conflict (academic_year_code) do update set
  academic_year_name = excluded.academic_year_name,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  source_document = excluded.source_document,
  status = 'ACTIVE',
  updated_at = now();

insert into public.hou_terms (
  academic_year_id,
  term_code,
  term_name,
  starts_on,
  ends_on,
  learning_start_on,
  second_learning_start_on,
  tuition_collection_starts_on,
  tuition_collection_ends_on,
  result_recognition_month,
  source_document
)
select y.id, v.term_code, v.term_name, v.starts_on::date, v.ends_on::date,
       v.learning_start_on::date, v.second_learning_start_on::date,
       v.tuition_collection_starts_on::date, v.tuition_collection_ends_on::date,
       v.result_recognition_month, 'CV 353/CV-ĐTSĐ ngày 10/10/2025'
from public.hou_academic_years y
cross join (
  values
    ('HK1_2025_2026', 'Học kỳ I', '2025-08-11', '2025-12-21', '2025-08-24', '2025-09-07', '2025-08-19', '2025-08-24', '12/2025'),
    ('HK2_2025_2026', 'Học kỳ II', '2025-12-22', '2026-05-17', '2026-01-11', null, '2026-01-05', '2026-01-11', '05/2026'),
    ('HK3_2025_2026', 'Học kỳ III', '2026-05-18', '2026-08-09', '2026-05-24', null, '2026-05-18', '2026-05-24', null)
) as v(
  term_code,
  term_name,
  starts_on,
  ends_on,
  learning_start_on,
  second_learning_start_on,
  tuition_collection_starts_on,
  tuition_collection_ends_on,
  result_recognition_month
)
where y.academic_year_code = '2025_2026'
on conflict (academic_year_id, term_code) do update set
  term_name = excluded.term_name,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  learning_start_on = excluded.learning_start_on,
  second_learning_start_on = excluded.second_learning_start_on,
  tuition_collection_starts_on = excluded.tuition_collection_starts_on,
  tuition_collection_ends_on = excluded.tuition_collection_ends_on,
  result_recognition_month = excluded.result_recognition_month,
  source_document = excluded.source_document,
  status = 'ACTIVE',
  updated_at = now();

insert into public.hou_exam_dates (
  academic_year_id,
  exam_code,
  exam_date,
  note,
  source_document
)
select y.id, v.exam_code, v.exam_date::date, v.note, 'CV 353/CV-ĐTSĐ ngày 10/10/2025'
from public.hou_academic_years y
cross join (
  values
    ('HOU_EXAM_2025_10_04', '2025-10-04', 'Lịch thi theo kế hoạch năm học 2025-2026'),
    ('HOU_EXAM_2025_10_05', '2025-10-05', 'Lịch thi theo kế hoạch năm học 2025-2026'),
    ('HOU_EXAM_2025_11_15', '2025-11-15', 'Lịch thi theo kế hoạch năm học 2025-2026'),
    ('HOU_EXAM_2025_11_16', '2025-11-16', 'Lịch thi theo kế hoạch năm học 2025-2026'),
    ('HOU_EXAM_2025_11_23', '2025-11-23', 'Lịch thi theo kế hoạch năm học 2025-2026'),
    ('HOU_EXAM_2026_04_11', '2026-04-11', 'Lịch thi theo kế hoạch năm học 2025-2026'),
    ('HOU_EXAM_2026_04_12', '2026-04-12', 'Lịch thi theo kế hoạch năm học 2025-2026'),
    ('HOU_EXAM_2026_04_19', '2026-04-19', 'Lịch thi theo kế hoạch năm học 2025-2026'),
    ('HOU_EXAM_2026_08_15', '2026-08-15', 'Lịch thi theo kế hoạch năm học 2025-2026'),
    ('HOU_EXAM_2026_08_16', '2026-08-16', 'Lịch thi theo kế hoạch năm học 2025-2026'),
    ('HOU_EXAM_2026_08_23', '2026-08-23', 'Lịch thi theo kế hoạch năm học 2025-2026')
) as v(exam_code, exam_date, note)
where y.academic_year_code = '2025_2026'
on conflict (exam_code) do update set
  academic_year_id = excluded.academic_year_id,
  exam_date = excluded.exam_date,
  note = excluded.note,
  source_document = excluded.source_document,
  status = 'ACTIVE',
  updated_at = now();

insert into public.hou_graduation_rounds (
  academic_year_id,
  round_code,
  planned_month,
  note,
  source_document
)
select y.id, v.round_code, v.planned_month::date, v.note, 'CV 353/CV-ĐTSĐ ngày 10/10/2025'
from public.hou_academic_years y
cross join (
  values
    ('HOU_GRAD_2025_08', '2025-08-01', 'Đợt xét tốt nghiệp tháng 08/2025'),
    ('HOU_GRAD_2025_10', '2025-10-01', 'Đợt xét tốt nghiệp tháng 10/2025'),
    ('HOU_GRAD_2026_01', '2026-01-01', 'Đợt xét tốt nghiệp tháng 01/2026'),
    ('HOU_GRAD_2026_03', '2026-03-01', 'Đợt xét tốt nghiệp tháng 03/2026'),
    ('HOU_GRAD_2026_06', '2026-06-01', 'Đợt xét tốt nghiệp tháng 06/2026'),
    ('HOU_GRAD_2026_08', '2026-08-01', 'Đợt xét tốt nghiệp tháng 08/2026')
) as v(round_code, planned_month, note)
where y.academic_year_code = '2025_2026'
on conflict (round_code) do update set
  academic_year_id = excluded.academic_year_id,
  planned_month = excluded.planned_month,
  note = excluded.note,
  source_document = excluded.source_document,
  status = 'ACTIVE',
  updated_at = now();

insert into public.hou_financial_policies (
  program_id,
  policy_code,
  policy_name,
  policy_type,
  amount_vnd,
  hou_share_percent,
  heu_share_percent,
  effective_from,
  effective_to,
  payment_condition,
  source_document
)
select p.id, v.policy_code, v.policy_name, v.policy_type, v.amount_vnd,
       v.hou_share_percent, v.heu_share_percent, v.effective_from::date,
       v.effective_to::date, v.payment_condition, v.source_document
from public.hou_programs p
cross join (
  values
    (
      'HOU_RECRUITMENT_SUPPORT_2024',
      'Đơn giá hỗ trợ tư vấn tuyển sinh HOU 2024',
      'RECRUITMENT_SUPPORT',
      600000,
      null::numeric,
      null::numeric,
      '2024-01-24',
      null,
      'Tính sau khi học viên hoàn thiện thủ tục nhập học và nghĩa vụ tài chính kỳ đầu theo thông báo HOU.',
      'Thông báo 313/ĐHM ngày 24/01/2024'
    ),
    (
      'HOU_TRAINING_COOP_2141_2024',
      'Tỷ lệ phân chia hợp tác đào tạo HOU - HEU',
      'TRAINING_COOP_SHARE',
      null,
      72.00,
      28.00,
      '2024-06-05',
      '2028-06-04',
      'Tính trên số học phí thực thu. Nếu HEU thu hộ, phải chuyển 100% về HOU trong 05 ngày làm việc kèm danh sách và chứng từ.',
      'Hợp đồng 2141/2024/HĐ-ĐHM ngày 05/06/2024'
    )
) as v(
  policy_code,
  policy_name,
  policy_type,
  amount_vnd,
  hou_share_percent,
  heu_share_percent,
  effective_from,
  effective_to,
  payment_condition,
  source_document
)
where p.program_code = 'HOU_DISTANCE_UNIVERSITY'
on conflict (policy_code) do update set
  program_id = excluded.program_id,
  policy_name = excluded.policy_name,
  policy_type = excluded.policy_type,
  amount_vnd = excluded.amount_vnd,
  hou_share_percent = excluded.hou_share_percent,
  heu_share_percent = excluded.heu_share_percent,
  effective_from = excluded.effective_from,
  effective_to = excluded.effective_to,
  payment_condition = excluded.payment_condition,
  source_document = excluded.source_document,
  status = 'ACTIVE',
  updated_at = now();

alter table public.leads
add column if not exists hou_program_id uuid references public.hou_programs(id) on delete set null,
add column if not exists hou_major_id uuid references public.hou_majors(id) on delete set null,
add column if not exists hou_location_id uuid references public.hou_locations(id) on delete set null,
add column if not exists hou_admin_class_id uuid references public.hou_admin_classes(id) on delete set null,
add column if not exists hou_stage_id uuid references public.hou_admission_stages(id) on delete set null,
add column if not exists hou_admission_system_status text,
add column if not exists hou_admission_system_synced_at timestamptz,
add column if not exists hou_first_term_tuition_confirmed boolean not null default false,
add column if not exists hou_first_term_tuition_confirmed_at timestamptz,
add column if not exists hou_enrollment_recorded_at timestamptz;

create index if not exists idx_leads_hou_program_id
on public.leads(hou_program_id)
where is_deleted = false;

create index if not exists idx_leads_hou_major_id
on public.leads(hou_major_id)
where is_deleted = false;

create index if not exists idx_leads_hou_stage_id
on public.leads(hou_stage_id)
where is_deleted = false;

create index if not exists idx_leads_hou_location_id
on public.leads(hou_location_id)
where is_deleted = false;
