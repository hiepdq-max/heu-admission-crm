-- File: database/step116_tchc_position_report_foundation.sql
-- Purpose:
-- - Expand TCHC from generic seats into operational positions.
-- - Create the first controlled data foundation for TCHC reports by position.
-- - Keep reports as metadata/readiness requirements only; no workflow approval,
--   no evidence acceptance and no production reporting reliance.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order
-- approval and owner Go/No-Go sign-off.

begin;

insert into public.admission_departments (code, name, status)
values ('TCHC', 'Phong To chuc hanh chinh (TCHC)', 'ACTIVE')
on conflict (code) do update set
  name = excluded.name,
  status = excluded.status,
  updated_at = now();

insert into public.roles (code, name, description)
values
  ('TCHC_LEAD', 'Truong phong To chuc hanh chinh', 'Manage administrative organization and staffing assignments'),
  ('TCHC', 'Nhan su To chuc hanh chinh', 'Operate administrative organization workflows in assigned scope')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

update public.heu_org_positions
set position_code = 'TCHC_VAN_THU_LUU_TRU'
where position_code = 'TCHC_01'
  and not exists (
    select 1
    from public.heu_org_positions p
    where p.position_code = 'TCHC_VAN_THU_LUU_TRU'
  );

update public.heu_org_positions
set position_code = 'TCHC_HANH_CHINH_NHAN_SU'
where position_code = 'TCHC_02'
  and not exists (
    select 1
    from public.heu_org_positions p
    where p.position_code = 'TCHC_HANH_CHINH_NHAN_SU'
  );

update public.heu_org_positions
set position_code = 'TCHC_CSVC_TAI_SAN'
where position_code = 'TCHC_03'
  and not exists (
    select 1
    from public.heu_org_positions p
    where p.position_code = 'TCHC_CSVC_TAI_SAN'
  );

update public.heu_org_positions
set
  reports_to_position_code = case reports_to_position_code
    when 'TCHC_01' then 'TCHC_VAN_THU_LUU_TRU'
    when 'TCHC_02' then 'TCHC_HANH_CHINH_NHAN_SU'
    when 'TCHC_03' then 'TCHC_CSVC_TAI_SAN'
    else reports_to_position_code
  end,
  updated_at = now()
where reports_to_position_code in ('TCHC_01', 'TCHC_02', 'TCHC_03');

insert into public.heu_org_positions (
  position_code,
  position_name,
  position_group,
  department_code,
  default_role_code,
  reports_to_position_code,
  seat_order,
  required_assignment,
  control_status,
  notes
)
values
  ('TCHC_HEAD', 'Truong phong To chuc hanh chinh', 'TCHC', 'TCHC', 'TCHC_LEAD', 'PHT_VAN_HANH', 1000, true, 'DRAFT', 'Owner cua toan bo bao cao TCHC.'),
  ('TCHC_DEPUTY', 'Pho phong To chuc hanh chinh', 'TCHC', 'TCHC', 'TCHC_LEAD', 'TCHC_HEAD', 1005, false, 'DRAFT', 'Du phong phe duyet noi bo khi Truong phong vang mat.'),
  ('TCHC_VAN_THU_LUU_TRU', 'Van thu - luu tru', 'TCHC', 'TCHC', 'TCHC', 'TCHC_HEAD', 1010, true, 'DRAFT', 'Quan ly cong van den/di, so van ban, ho so luu tru.'),
  ('TCHC_HANH_CHINH_NHAN_SU', 'Hanh chinh nhan su', 'TCHC', 'TCHC', 'TCHC', 'TCHC_HEAD', 1020, true, 'DRAFT', 'Quan ly ho so nhan su, bien dong, cham cong/nghi phep theo pham vi TCHC.'),
  ('TCHC_HO_SO_NHAN_SU', 'Ho so nhan su', 'TCHC', 'TCHC', 'TCHC', 'TCHC_HANH_CHINH_NHAN_SU', 1021, false, 'DRAFT', 'Phu trach cap nhat, doi chieu va luu tru ho so nhan su.'),
  ('TCHC_CSVC_TAI_SAN', 'Co so vat chat - tai san', 'TCHC', 'TCHC', 'TCHC', 'TCHC_HEAD', 1030, true, 'DRAFT', 'Quan ly tai san, thiet bi, phong hoc, sua chua va hien trang CSVC.'),
  ('TCHC_BAO_TRI_SUA_CHUA', 'Bao tri - sua chua', 'TCHC', 'TCHC', 'TCHC', 'TCHC_CSVC_TAI_SAN', 1031, false, 'DRAFT', 'Theo doi yeu cau sua chua, nghiem thu va ton dong CSVC.'),
  ('TCHC_MUA_SAM_CAP_PHAT', 'Mua sam - cap phat', 'TCHC', 'TCHC', 'TCHC', 'TCHC_CSVC_TAI_SAN', 1032, false, 'DRAFT', 'Theo doi de xuat mua sam, cap phat van phong pham, vat tu va thiet bi.'),
  ('TCHC_LE_TAN_HAU_CAN', 'Le tan - hau can', 'TCHC', 'TCHC', 'TCHC', 'TCHC_HEAD', 1040, false, 'DRAFT', 'Quan ly tiep don, hau can su kien, phong hop va lich phuc vu.'),
  ('TCHC_BAO_VE_AN_NINH', 'Bao ve - an ninh trat tu', 'TCHC', 'TCHC', 'TCHC', 'TCHC_HEAD', 1041, false, 'DRAFT', 'Theo doi ca truc, su co an ninh, ra vao va an toan truong.'),
  ('TCHC_PHUONG_TIEN', 'Phuong tien - lai xe', 'TCHC', 'TCHC', 'TCHC', 'TCHC_HEAD', 1042, false, 'DRAFT', 'Quan ly lich xe, nhien lieu, bao duong va dieu phoi phuong tien.'),
  ('TCHC_VE_SINH_MOI_TRUONG', 'Ve sinh - moi truong', 'TCHC', 'TCHC', 'TCHC', 'TCHC_HEAD', 1043, false, 'DRAFT', 'Theo doi ve sinh khuon vien, lop hoc, nha ve sinh va moi truong.'),
  ('TCHC_Y_TE_HOC_DUONG', 'Y te hoc duong', 'TCHC', 'TCHC', 'TCHC', 'TCHC_HEAD', 1044, false, 'DRAFT', 'Theo doi y te truong hoc, so cap cuu, tu thuoc va an toan suc khoe.'),
  ('TCHC_TONG_HOP_BAO_CAO', 'Tong hop bao cao TCHC', 'TCHC', 'TCHC', 'TCHC', 'TCHC_HEAD', 1050, false, 'DRAFT', 'Tong hop bao cao tu cac vi tri TCHC truoc khi trinh truong phong.')
on conflict (position_code) do update set
  position_name = excluded.position_name,
  position_group = excluded.position_group,
  department_code = excluded.department_code,
  default_role_code = excluded.default_role_code,
  reports_to_position_code = excluded.reports_to_position_code,
  seat_order = excluded.seat_order,
  required_assignment = excluded.required_assignment,
  control_status = excluded.control_status,
  status = 'ACTIVE',
  notes = coalesce(excluded.notes, heu_org_positions.notes),
  updated_at = now();

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('users.manage_department'),
    ('scope.manage_department'),
    ('reports.read_team'),
    ('workflow_request.read'),
    ('workflow_request.create'),
    ('workflow_request.check')
) as p(permission)
where r.code = 'TCHC_LEAD'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('reports.read_scope'),
    ('workflow_request.read'),
    ('workflow_request.create')
) as p(permission)
where r.code = 'TCHC'
on conflict (role_id, permission) do nothing;

insert into public.heu_position_permission_matrix (
  position_id,
  permission,
  permission_source,
  status
)
select p.id, rp.permission, 'DEFAULT_ROLE', 'ACTIVE'
from public.heu_org_positions p
join public.roles r on r.code = p.default_role_code
join public.role_permissions rp on rp.role_id = r.id
where p.position_group = 'TCHC'
on conflict (position_id, permission) do update set
  permission_source = excluded.permission_source,
  status = 'ACTIVE',
  updated_at = now();

create table if not exists public.heu_position_report_requirements (
  id uuid primary key default gen_random_uuid(),
  report_code text not null unique,
  report_name text not null,
  report_domain text not null,
  owner_position_code text not null references public.heu_org_positions(position_code) on update cascade on delete restrict,
  reviewer_position_code text references public.heu_org_positions(position_code) on update cascade on delete restrict,
  cadence text not null,
  source_data_hint text not null,
  output_scope text not null,
  report_view_code text,
  required_status text not null default 'REQUIRED',
  control_status text not null default 'DRAFT_CONTROL',
  status public.record_status not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_position_report_cadence_valid check (
    cadence in ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'EVENT', 'AD_HOC')
  ),
  constraint heu_position_report_required_status_valid check (
    required_status in ('REQUIRED', 'OPTIONAL', 'DRAFT')
  ),
  constraint heu_position_report_control_status_valid check (
    control_status in ('DRAFT_CONTROL', 'READY_FOR_UAT', 'SIGNED_OFF', 'BLOCKED')
  )
);

alter table public.heu_position_report_requirements enable row level security;

drop policy if exists "heu_position_report_requirements_select_authenticated" on public.heu_position_report_requirements;
create policy "heu_position_report_requirements_select_authenticated"
on public.heu_position_report_requirements for select
to authenticated
using (public.can_read_permission_matrix() or public.has_permission('reports.read_scope'));

drop policy if exists "heu_position_report_requirements_admin_write" on public.heu_position_report_requirements;
create policy "heu_position_report_requirements_admin_write"
on public.heu_position_report_requirements for all
to authenticated
using (public.can_manage_permission_matrix())
with check (public.can_manage_permission_matrix());

insert into public.heu_position_report_requirements (
  report_code,
  report_name,
  report_domain,
  owner_position_code,
  reviewer_position_code,
  cadence,
  source_data_hint,
  output_scope,
  report_view_code,
  required_status,
  control_status,
  notes
)
values
  ('RPT_TCHC_TONG_HOP_THANG', 'Bao cao tong hop TCHC thang', 'TCHC_TONG_HOP', 'TCHC_HEAD', 'PHT_VAN_HANH', 'MONTHLY', 'Tong hop tu tat ca report_code TCHC da duoc nop trong ky.', 'BGH + PHT van hanh + Audit xem tong hop, khong hien PII thua muc dich.', 'RV_TCHC_MONTHLY_SUMMARY', 'REQUIRED', 'DRAFT_CONTROL', 'Bao cao quan tri tong hop, chua phai dashboard production.'),
  ('RPT_TCHC_CONG_VAN_DEN_DI', 'So cong van den/di', 'VAN_THU_LUU_TRU', 'TCHC_VAN_THU_LUU_TRU', 'TCHC_HEAD', 'WEEKLY', 'So cong van den, so cong van di, nguoi nhan, han xu ly, tinh trang.', 'TCHC + BGH xem metadata; khong dua raw van ban nhay cam vao report.', 'RV_TCHC_DOCUMENT_FLOW', 'REQUIRED', 'DRAFT_CONTROL', null),
  ('RPT_TCHC_HO_SO_LUU_TRU', 'Tinh trang ho so luu tru', 'VAN_THU_LUU_TRU', 'TCHC_VAN_THU_LUU_TRU', 'TCHC_HEAD', 'MONTHLY', 'Danh muc ho so, hop/ke, thoi han bao quan, tinh trang so hoa.', 'TCHC + Audit xem tinh trang, khong hien file goc nhay cam.', 'RV_TCHC_ARCHIVE_STATUS', 'REQUIRED', 'DRAFT_CONTROL', null),
  ('RPT_TCHC_NHAN_SU_BIEN_DONG', 'Bien dong nhan su', 'HANH_CHINH_NHAN_SU', 'TCHC_HANH_CHINH_NHAN_SU', 'TCHC_HEAD', 'MONTHLY', 'Tang/giam nhan su, thay doi vi tri, hop dong, trang thai ho so.', 'BGH + TCHC xem chi so tong hop; chi tiet nhan su theo quyen.', 'RV_TCHC_HR_MOVEMENT', 'REQUIRED', 'DRAFT_CONTROL', null),
  ('RPT_TCHC_HO_SO_NHAN_SU', 'Ho so nhan su can bo sung', 'HANH_CHINH_NHAN_SU', 'TCHC_HO_SO_NHAN_SU', 'TCHC_HANH_CHINH_NHAN_SU', 'WEEKLY', 'Ho so thieu, ho so het han, ho so can ky/bo sung.', 'TCHC xem theo nhiem vu; khong dua CCCD/raw hop dong vao report.', 'RV_TCHC_HR_DOSSIER_GAP', 'REQUIRED', 'DRAFT_CONTROL', null),
  ('RPT_TCHC_CHAM_CONG_NGHI_PHEP', 'Cham cong va nghi phep', 'HANH_CHINH_NHAN_SU', 'TCHC_HANH_CHINH_NHAN_SU', 'TCHC_HEAD', 'MONTHLY', 'Bang tong hop ngay cong, nghi phep, di muon, vang mat theo quy che.', 'TCHC + KHTC xem theo gate luong; khong tu phe duyet bang luong.', 'RV_TCHC_ATTENDANCE_LEAVE', 'REQUIRED', 'DRAFT_CONTROL', 'Chi la nguon doi chieu, khong thay the ky duyet luong.'),
  ('RPT_TCHC_TAI_SAN_THIET_BI', 'Tai san va thiet bi', 'CSVC_TAI_SAN', 'TCHC_CSVC_TAI_SAN', 'TCHC_HEAD', 'MONTHLY', 'Danh muc tai san, tinh trang, phong/bo phan su dung, thieu/hong.', 'TCHC + BGH + Audit xem tinh trang; khong la bien ban kiem ke signed.', 'RV_TCHC_ASSET_STATUS', 'REQUIRED', 'DRAFT_CONTROL', null),
  ('RPT_TCHC_BAO_TRI_SUA_CHUA', 'Bao tri va sua chua', 'CSVC_TAI_SAN', 'TCHC_BAO_TRI_SUA_CHUA', 'TCHC_CSVC_TAI_SAN', 'WEEKLY', 'Yeu cau sua chua, muc do uu tien, chi phi du kien, ket qua nghiem thu.', 'TCHC + KHTC xem de doi soat; khong tu phe duyet chi phi.', 'RV_TCHC_MAINTENANCE_QUEUE', 'REQUIRED', 'DRAFT_CONTROL', null),
  ('RPT_TCHC_MUA_SAM_CAP_PHAT', 'Mua sam va cap phat', 'CSVC_TAI_SAN', 'TCHC_MUA_SAM_CAP_PHAT', 'TCHC_CSVC_TAI_SAN', 'MONTHLY', 'De xuat mua sam, cap phat, ton kho, nguoi nhan, chung tu lien quan.', 'TCHC + KHTC xem metadata; thanh toan theo finance gate rieng.', 'RV_TCHC_PROCUREMENT_ISSUE', 'REQUIRED', 'DRAFT_CONTROL', null),
  ('RPT_TCHC_HAU_CAN_SU_KIEN', 'Hau can va su kien', 'HAU_CAN', 'TCHC_LE_TAN_HAU_CAN', 'TCHC_HEAD', 'EVENT', 'Lich phong hop, tiep khach, su kien, nhan su/hau can phuc vu.', 'TCHC xem dieu phoi; BGH xem tong hop su kien quan trong.', 'RV_TCHC_LOGISTICS_EVENT', 'OPTIONAL', 'DRAFT_CONTROL', null),
  ('RPT_TCHC_AN_NINH_TRAT_TU', 'An ninh trat tu', 'AN_NINH', 'TCHC_BAO_VE_AN_NINH', 'TCHC_HEAD', 'DAILY', 'Ca truc, su co, khach ra vao, tai san/diem nong an ninh.', 'TCHC + BGH xem su co; thong tin nhay cam can redaction.', 'RV_TCHC_SECURITY_INCIDENT', 'REQUIRED', 'DRAFT_CONTROL', null),
  ('RPT_TCHC_PHUONG_TIEN', 'Phuong tien va lai xe', 'PHUONG_TIEN', 'TCHC_PHUONG_TIEN', 'TCHC_HEAD', 'MONTHLY', 'Lich xe, km, nhien lieu, bao duong, chi phi/nhu cau phuong tien.', 'TCHC + KHTC xem doi soat; khong tu phe duyet chi phi.', 'RV_TCHC_VEHICLE_LOG', 'OPTIONAL', 'DRAFT_CONTROL', null),
  ('RPT_TCHC_VE_SINH_MOI_TRUONG', 'Ve sinh va moi truong', 'MOI_TRUONG', 'TCHC_VE_SINH_MOI_TRUONG', 'TCHC_HEAD', 'WEEKLY', 'Khu vuc ve sinh, ton tai, vat tu ve sinh, diem can xu ly.', 'TCHC xem dieu hanh; BGH xem tong hop khi co ton dong.', 'RV_TCHC_CLEANING_ENVIRONMENT', 'OPTIONAL', 'DRAFT_CONTROL', null),
  ('RPT_TCHC_Y_TE_HOC_DUONG', 'Y te hoc duong', 'Y_TE', 'TCHC_Y_TE_HOC_DUONG', 'TCHC_HEAD', 'MONTHLY', 'Tu thuoc, su co y te, so cap cuu, canh bao suc khoe/an toan.', 'TCHC + BGH xem tong hop; khong dua benh an/du lieu nhay cam vao report.', 'RV_TCHC_SCHOOL_HEALTH', 'OPTIONAL', 'DRAFT_CONTROL', null)
on conflict (report_code) do update set
  report_name = excluded.report_name,
  report_domain = excluded.report_domain,
  owner_position_code = excluded.owner_position_code,
  reviewer_position_code = excluded.reviewer_position_code,
  cadence = excluded.cadence,
  source_data_hint = excluded.source_data_hint,
  output_scope = excluded.output_scope,
  report_view_code = excluded.report_view_code,
  required_status = excluded.required_status,
  control_status = excluded.control_status,
  status = 'ACTIVE',
  notes = coalesce(excluded.notes, heu_position_report_requirements.notes),
  updated_at = now();

create or replace view public.heu_position_report_requirement_status
with (security_invoker = true)
as
select
  r.id,
  r.report_code,
  r.report_name,
  r.report_domain,
  r.cadence,
  r.required_status,
  r.control_status,
  r.status,
  r.owner_position_code,
  owner.position_name as owner_position_name,
  owner.department_code as owner_department_code,
  owner.position_group as owner_position_group,
  r.reviewer_position_code,
  reviewer.position_name as reviewer_position_name,
  r.source_data_hint,
  r.output_scope,
  r.report_view_code,
  r.notes,
  owner_assignment.assignment_status as owner_assignment_status,
  reviewer_assignment.assignment_status as reviewer_assignment_status,
  case
    when owner_assignment.id is null then 'NO_OWNER_ASSIGNED'
    when r.control_status <> 'SIGNED_OFF' then 'DRAFT_CONTROL'
    else 'READY'
  end as report_readiness_state
from public.heu_position_report_requirements r
join public.heu_org_positions owner
  on owner.position_code = r.owner_position_code
left join public.heu_org_positions reviewer
  on reviewer.position_code = r.reviewer_position_code
left join public.heu_position_assignments owner_assignment
  on owner_assignment.position_id = owner.id
  and owner_assignment.status = 'ACTIVE'
left join public.heu_position_assignments reviewer_assignment
  on reviewer_assignment.position_id = reviewer.id
  and reviewer_assignment.status = 'ACTIVE';

grant select on public.heu_position_report_requirements to authenticated;
grant select on public.heu_position_report_requirement_status to authenticated;

commit;
