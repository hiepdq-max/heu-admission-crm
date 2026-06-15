-- Step 34A - Admission flow master
-- Run this file in Supabase SQL Editor after the earlier schema/policy/trigger files.

create table if not exists public.admission_flows (
  id uuid primary key default gen_random_uuid(),
  flow_code text not null unique,
  flow_name text not null,
  short_description text not null,
  owner_department text not null,
  main_risk text not null,
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admission_flows enable row level security;

drop policy if exists "admission_flows_select_authenticated" on public.admission_flows;
create policy "admission_flows_select_authenticated"
on public.admission_flows for select
to authenticated
using (true);

drop policy if exists "admission_flows_admin_write" on public.admission_flows;
create policy "admission_flows_admin_write"
on public.admission_flows for all
to authenticated
using (public.is_admin() or public.has_permission('campaigns.manage'))
with check (public.is_admin() or public.has_permission('campaigns.manage'));

drop trigger if exists trg_admission_flows_updated_at on public.admission_flows;
create trigger trg_admission_flows_updated_at
before update on public.admission_flows
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_flows_audit on public.admission_flows;
create trigger trg_admission_flows_audit
after insert or update or delete on public.admission_flows
for each row execute function public.write_audit_log();

insert into public.admission_flows (
  flow_code,
  flow_name,
  short_description,
  owner_department,
  main_risk,
  sort_order
) values
  ('DIRECT_ADMISSION', 'Luồng tuyển sinh trực tiếp', 'Học sinh/phụ huynh đến trường hoặc gọi trực tiếp', 'Tuyển sinh', 'Không log tư vấn, thiếu hồ sơ', 10),
  ('ONLINE_MARKETING', 'Luồng online marketing', 'Facebook, TikTok, Zalo, website, landing page, ads', 'Tuyển sinh + Marketing', 'Trùng lead, Form Response chứa SĐT', 20),
  ('THCS_THPT', 'Luồng THCS/THPT', 'Nguồn từ trường phổ thông, tư vấn định hướng', 'Tuyển sinh', 'Tư vấn sai chính sách/ngành', 30),
  ('TTGDTX', 'Luồng TTGDTX', 'Học sinh học văn hóa tại TTGDTX, học trung cấp tại HEU', 'Tuyển sinh + Pháp chế + Đào tạo', 'Sai mô hình liên kết, thiếu hồ sơ pháp lý', 40),
  ('BUSINESS_PARTNER', 'Luồng đối tác doanh nghiệp', 'Doanh nghiệp/đơn vị giới thiệu học viên hoặc liên kết đào tạo', 'Tuyển sinh + Pháp chế', 'Thiếu hợp đồng/thẩm quyền', 50),
  ('INDIVIDUAL_CTV', 'Luồng CTV cá nhân', 'Cộng tác viên giới thiệu học sinh', 'Tuyển sinh + KHTC', 'Tranh chấp nguồn, chi COM sai', 60),
  ('ORGANIZATION_CTV', 'Luồng CTV tổ chức/trường/địa phương', 'Đơn vị/tổ chức giới thiệu theo danh sách', 'Tuyển sinh + KHTC + Pháp chế', 'Không rõ chính sách COM', 70),
  ('RE_ENTRY_TRANSFER', 'Luồng tái nhập học/chuyển ngành/chuyển lớp', 'Học sinh cũ quay lại, chuyển ngành, chuyển lớp', 'CTHSSV + Đào tạo + KHTC', 'Trùng hồ sơ, sai công nợ', 80)
on conflict (flow_code) do update set
  flow_name = excluded.flow_name,
  short_description = excluded.short_description,
  owner_department = excluded.owner_department,
  main_risk = excluded.main_risk,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();
