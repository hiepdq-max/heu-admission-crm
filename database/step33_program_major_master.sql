-- Step 33 - Admission program and major master
-- Run this once in Supabase SQL Editor for the current project.

create table if not exists public.admission_programs (
  id uuid primary key default gen_random_uuid(),
  program_code text not null unique,
  program_name text not null,
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admission_majors (
  id uuid primary key default gen_random_uuid(),
  major_code text not null unique,
  major_name text not null,
  program_id uuid references public.admission_programs(id),
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admission_majors_program_id
on public.admission_majors(program_id);

alter table public.admission_programs enable row level security;
alter table public.admission_majors enable row level security;

drop policy if exists "admission_programs_select_authenticated" on public.admission_programs;
create policy "admission_programs_select_authenticated"
on public.admission_programs for select
to authenticated
using (true);

drop policy if exists "admission_programs_admin_write" on public.admission_programs;
create policy "admission_programs_admin_write"
on public.admission_programs for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop policy if exists "admission_majors_select_authenticated" on public.admission_majors;
create policy "admission_majors_select_authenticated"
on public.admission_majors for select
to authenticated
using (true);

drop policy if exists "admission_majors_admin_write" on public.admission_majors;
create policy "admission_majors_admin_write"
on public.admission_majors for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop trigger if exists trg_admission_programs_updated_at on public.admission_programs;
create trigger trg_admission_programs_updated_at
before update on public.admission_programs
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_majors_updated_at on public.admission_majors;
create trigger trg_admission_majors_updated_at
before update on public.admission_majors
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_programs_audit on public.admission_programs;
create trigger trg_admission_programs_audit
after insert or update or delete on public.admission_programs
for each row execute function public.write_audit_log();

drop trigger if exists trg_admission_majors_audit on public.admission_majors;
create trigger trg_admission_majors_audit
after insert or update or delete on public.admission_majors
for each row execute function public.write_audit_log();

insert into public.admission_programs (program_code, program_name, sort_order) values
  ('TRUNG_CAP', 'Trung cấp', 10),
  ('NGAN_HAN', 'Ngắn hạn', 20),
  ('LIEN_THONG_DAI_HOC', 'Liên thông đại học', 30)
on conflict (program_code) do update set
  program_name = excluded.program_name,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

update public.admission_programs
set status = 'INACTIVE', updated_at = now()
where program_code in ('HE_9_PLUS', 'CAO_DANG', 'TTGDTX');

insert into public.admission_majors (major_code, major_name, program_id, sort_order)
select v.major_code, v.major_name, p.id, v.sort_order
from (
  values
    ('HUONG_DAN_DU_LICH', 'Hướng dẫn du lịch', 'TRUNG_CAP', 10),
    ('NGHIEP_VU_LE_TAN', 'Nghiệp vụ lễ tân', 'TRUNG_CAP', 20),
    ('TIN_HOC_UNG_DUNG', 'Tin học ứng dụng', 'TRUNG_CAP', 30),
    ('KE_TOAN_DOANH_NGHIEP', 'Kế toán doanh nghiệp', 'TRUNG_CAP', 40),
    ('TAO_MAU_CHAM_SOC_SAC_DEP', 'Tạo mẫu và chăm sóc sắc đẹp', 'TRUNG_CAP', 50),
    ('TIENG_ANH', 'Tiếng Anh', 'TRUNG_CAP', 60),
    ('MARKETING', 'Marketing', 'TRUNG_CAP', 70),
    ('QUAN_LY_DOANH_NGHIEP', 'Quản lý doanh nghiệp', 'TRUNG_CAP', 80),
    ('KINH_DOANH_THUONG_MAI_DICH_VU', 'Kinh doanh thương mại và dịch vụ', 'TRUNG_CAP', 90),
    ('VAN_THU_HANH_CHINH', 'Văn thư hành chính', 'TRUNG_CAP', 100),
    ('DIGITAL_MARKETING_NGAN_HAN', 'Digital Marketing', 'NGAN_HAN', 110),
    ('THUONG_MAI_DIEN_TU_NGAN_HAN', 'Thương mại điện tử', 'NGAN_HAN', 120),
    ('MARKETING_SEO', 'Marketing - SEO', 'NGAN_HAN', 130),
    ('KY_THUAT_CAT_TOC', 'Kỹ thuật cắt tóc', 'NGAN_HAN', 140),
    ('KY_THUAT_NHUOM_TOC', 'Kỹ thuật nhuộm tóc', 'NGAN_HAN', 150),
    ('KY_THUAT_UON_LA_TOC', 'Kỹ thuật uốn và là tóc', 'NGAN_HAN', 160),
    ('TRANG_DIEM_THAM_MY', 'Trang điểm thẩm mỹ', 'NGAN_HAN', 170),
    ('LIEN_THONG_DH_MO_HN', 'Liên thông Đại học Mở Hà Nội', 'LIEN_THONG_DAI_HOC', 180),
    ('LIEN_THONG_HV_BUU_CHINH_VIEN_THONG', 'Liên thông Học viện Công nghệ Bưu chính Viễn thông', 'LIEN_THONG_DAI_HOC', 190)
) as v(major_code, major_name, program_code, sort_order)
join public.admission_programs p on p.program_code = v.program_code
on conflict (major_code) do update set
  major_name = excluded.major_name,
  program_id = excluded.program_id,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

update public.admission_majors
set status = 'INACTIVE', updated_at = now()
where major_code in (
  'AUTO_TECH',
  'IT',
  'ELECTRIC',
  'ACCOUNTING',
  'BUSINESS_ADMIN',
  'TOURISM'
);
