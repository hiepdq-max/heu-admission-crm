-- HEU Admission CRM - seed data
-- Run after schema.sql

insert into public.roles (code, name, description) values
  ('ADMIN', 'Admin', 'Full system administration'),
  ('BGH', 'BGH', 'School leadership and all reports'),
  ('ADMISSION_HEAD', 'Truong phong tuyen sinh', 'Manage all admission leads and reports'),
  ('TEAM_LEAD', 'Truong nhom', 'Manage assigned team leads'),
  ('COUNSELOR', 'Tu van vien', 'Work with assigned leads'),
  ('CTHSSV', 'CTHSSV', 'View enrolled student handover data'),
  ('ACCOUNTING', 'Ke toan', 'Verify admission payments'),
  ('AUDIT', 'Audit', 'View audit logs'),
  ('VIEWER', 'Viewer', 'Read selected reports')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('system.manage'),
    ('users.manage'),
    ('users.create'),
    ('leads.read_all'),
    ('leads.write_all'),
    ('leads.assign'),
    ('leads.import'),
    ('pipeline.manage'),
    ('documents.manage'),
    ('payments.verify'),
    ('partners.manage'),
    ('campaigns.manage'),
    ('reports.read_all'),
    ('audit.read')
) as p(permission)
where r.code = 'ADMIN'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('leads.read_all'),
    ('reports.read_all'),
    ('audit.read')
) as p(permission)
where r.code = 'BGH'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('leads.read_all'),
    ('leads.write_all'),
    ('leads.assign'),
    ('leads.import'),
    ('pipeline.manage'),
    ('documents.manage'),
    ('partners.manage'),
    ('campaigns.manage'),
    ('reports.read_all')
) as p(permission)
where r.code = 'ADMISSION_HEAD'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('leads.read_team'),
    ('leads.write_team'),
    ('leads.assign_team'),
    ('pipeline.manage_team'),
    ('documents.manage_team'),
    ('reports.read_team')
) as p(permission)
where r.code = 'TEAM_LEAD'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('leads.read_assigned'),
    ('leads.write_assigned'),
    ('activities.create'),
    ('documents.read_assigned')
) as p(permission)
where r.code = 'COUNSELOR'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('payments.read'),
    ('payments.verify')
) as p(permission)
where r.code = 'ACCOUNTING'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, 'audit.read'
from public.roles r
where r.code = 'AUDIT'
on conflict (role_id, permission) do nothing;

insert into public.admission_departments (code, name) values
  ('ADMISSION', 'Phong tuyen sinh'),
  ('ACCOUNTING', 'Ke toan'),
  ('CTHSSV', 'Cong tac HSSV'),
  ('LEADERSHIP', 'Ban giam hieu')
on conflict (code) do update set
  name = excluded.name,
  updated_at = now();

insert into public.lead_sources (source_code, source_name, source_group) values
  ('FB_ADS', 'Facebook Ads', 'Online'),
  ('TIKTOK', 'TikTok', 'Online'),
  ('ZALO', 'Zalo', 'Online'),
  ('WEBSITE', 'Website', 'Online'),
  ('HOTLINE', 'Hotline', 'Direct'),
  ('CTV', 'Cong tac vien', 'Partner'),
  ('THCS', 'Truong THCS', 'School'),
  ('TTGDTX', 'Trung tam GDTX', 'Partner'),
  ('PARTNER', 'Doi tac', 'Partner'),
  ('REFERRAL', 'Gioi thieu', 'Referral'),
  ('EVENT', 'Su kien tu van', 'Offline'),
  ('IMPORT', 'Import Excel/CSV', 'Import')
on conflict (source_code) do update set
  source_name = excluded.source_name,
  source_group = excluded.source_group,
  updated_at = now();

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

insert into public.campaigns (campaign_code, campaign_name, source_id, start_date, end_date, note)
select 'TS2026-FB-Q3', 'Tuyen sinh 2026 - Facebook Q3', s.id, date '2026-07-01', date '2026-09-30', 'Seed campaign'
from public.lead_sources s
where s.source_code = 'FB_ADS'
on conflict (campaign_code) do update set
  campaign_name = excluded.campaign_name,
  source_id = excluded.source_id,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  updated_at = now();

insert into public.campaigns (campaign_code, campaign_name, source_id, start_date, end_date, note)
select 'TS2026-EVENT-SUMMER', 'Tuyen sinh 2026 - Su kien he', s.id, date '2026-06-01', date '2026-08-31', 'Seed campaign'
from public.lead_sources s
where s.source_code = 'EVENT'
on conflict (campaign_code) do update set
  campaign_name = excluded.campaign_name,
  source_id = excluded.source_id,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  updated_at = now();

insert into public.partners (
  partner_code,
  partner_name,
  partner_type,
  phone,
  area,
  commission_note,
  contract_status
) values
  ('CTV-0001', 'CTV mau 01', 'CTV', '0900000001', 'Ha Noi', 'Luu mo ta COM, chua tu dong chi', 'DRAFT'),
  ('TTGDTX-0001', 'TTGDTX mau 01', 'TTGDTX', '0900000002', 'Vinh Phuc', 'Theo thoa thuan doi tac', 'DRAFT')
on conflict (partner_code) do update set
  partner_name = excluded.partner_name,
  partner_type = excluded.partner_type,
  phone = excluded.phone,
  area = excluded.area,
  commission_note = excluded.commission_note,
  contract_status = excluded.contract_status,
  updated_at = now();

insert into public.enrollment_checklists (
  document_code,
  document_name,
  is_required,
  applies_to_program,
  sort_order
) values
  ('APPLICATION_FORM', 'Phieu dang ky nhap hoc', true, null, 10),
  ('STUDENT_ID_CARD', 'CCCD hoc sinh', true, null, 20),
  ('PARENT_ID_CARD', 'CCCD phu huynh/nguoi giam ho', true, null, 30),
  ('SCHOOL_RECORD', 'Hoc ba', true, null, 40),
  ('GRADUATION_CERT', 'Bang tot nghiep/giay chung nhan tot nghiep tam thoi', true, null, 50),
  ('BIRTH_CERT', 'Giay khai sinh', true, null, 60),
  ('PHOTO_3X4', 'Anh 3x4', true, null, 70),
  ('PRIORITY_CERT', 'Giay xac nhan uu tien/chinh sach', false, null, 80),
  ('TTGDTX_PROFILE', 'Ho so TTGDTX', false, null, 90),
  ('ADMISSION_RECEIPT', 'Bien nhan/phieu thu dau vao', false, null, 100)
on conflict (document_code) do update set
  document_name = excluded.document_name,
  is_required = excluded.is_required,
  applies_to_program = excluded.applies_to_program,
  sort_order = excluded.sort_order,
  updated_at = now();
