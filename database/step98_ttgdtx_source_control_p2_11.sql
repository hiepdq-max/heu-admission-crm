-- Step 98 - P2-11 TTGDTX Source, Legal and Data Control.
-- Run after step97_ttgdtx_p0_19_finance_gate_fix.sql.
-- Migration candidate only. Do not run production migration from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - This step is metadata/control only and does not create receivables,
--   collect money or approve payouts.
-- - If rollback is needed, mark seeded source/check records inactive through
--   an approved corrective migration and keep audit evidence.
--
-- Purpose:
-- - Register the source files used for TTGDTX accounting/governance.
-- - Separate legal/professional/data/system issues before production use.
-- - Do not create receivables, collect money or approve payouts here.

begin;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.source.read'),
    ('ttgdtx.source.manage'),
    ('ttgdtx.source.approve')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.source.read'),
    ('ttgdtx.source.approve')
) as p(permission)
where r.code in ('BGH', 'AUDIT', 'LEGAL', 'ACCOUNTING_LEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, 'ttgdtx.source.read'
from public.roles r
where r.code in ('KHTC', 'ACCOUNTING', 'ADMISSION_HEAD', 'TEAM_LEAD', 'CTHSSV_LEAD', 'COUNSELOR')
on conflict (role_id, permission) do nothing;

insert into public.permission_registry (
  permission_code,
  permission_group,
  permission_label,
  module_code,
  owner_department,
  risk_level,
  grant_scope,
  requires_scope,
  requires_approval,
  allow_delegation,
  ai_allowed,
  control_note,
  control_status
) values
  (
    'ttgdtx.source.read',
    'TTGDTX',
    'Xem nguồn dữ liệu, pháp lý và checklist TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + PHAP_CHE + IT_DATA',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    true,
    'Chỉ xem nguồn dữ liệu trong phạm vi TTGDTX được phân quyền; không làm thay đổi công nợ, thu tiền hoặc chi trả.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.source.manage',
    'TTGDTX',
    'Cập nhật nguồn dữ liệu và checklist kiểm soát TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + PHAP_CHE + IT_DATA',
    'CRITICAL',
    'ROLE_AND_SCOPE',
    true,
    true,
    false,
    false,
    'Cập nhật nguồn/kiểm tra phải có căn cứ file, người chịu trách nhiệm và audit; không được tự sửa học phí/công nợ bằng tay.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.source.approve',
    'TTGDTX',
    'Duyệt nguồn pháp lý, SOP, học phí và dữ liệu TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'BGH + PHAP_CHE + KHTC',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    false,
    'Nguồn liên quan hợp đồng, học phí, pháp lý và chi trả chỉ được chuyển APPROVED khi đúng owner/checker/approver.',
    'DAT_TAM_THOI'
  )
on conflict (permission_code) do update set
  permission_group = excluded.permission_group,
  permission_label = excluded.permission_label,
  module_code = excluded.module_code,
  owner_department = excluded.owner_department,
  risk_level = excluded.risk_level,
  grant_scope = excluded.grant_scope,
  requires_scope = excluded.requires_scope,
  requires_approval = excluded.requires_approval,
  allow_delegation = excluded.allow_delegation,
  ai_allowed = excluded.ai_allowed,
  control_note = excluded.control_note,
  control_status = excluded.control_status,
  updated_at = now();

create table if not exists public.ttgdtx_source_documents (
  id uuid primary key default gen_random_uuid(),
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  source_code text not null unique,
  source_title text not null,
  source_type text not null,
  document_scope text not null,
  related_step_code text not null default 'P2-11',
  related_module_code text not null default 'M08_FINANCE_ACCOUNTING',
  source_path_or_url text not null,
  file_name text,
  version_label text,
  owner_department text not null default 'IT_DATA',
  checker_role text,
  approver_role text,
  confidentiality text not null default 'RESTRICTED',
  required_for_go_live boolean not null default true,
  effective_from date,
  effective_to date,
  last_seen_at timestamptz,
  checksum_note text,
  source_note text,
  document_status text not null default 'SUBMITTED',
  control_status text not null default 'DAT_TAM_THOI',
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_source_document_type_valid check (
    source_type in ('EXCEL_WORKBOOK', 'GOOGLE_SHEET', 'DOCX_REGULATION', 'PDF_CONTRACT', 'HTML_PREVIEW', 'OTHER')
  ),
  constraint ttgdtx_source_document_scope_valid check (
    document_scope in (
      'LEGAL_REGULATION',
      'SOP_MAP',
      'TTGDTX_MASTER',
      'CONTRACT_MASTER',
      'TUITION_POLICY',
      'RECEIVABLE_GATE',
      'PAYMENT_COLLECTION',
      'AUDIT',
      'PERMISSION_SCOPE',
      'LOCATION',
      'EVIDENCE',
      'OTHER'
    )
  ),
  constraint ttgdtx_source_document_confidentiality_valid check (
    confidentiality in ('INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'SECRET')
  ),
  constraint ttgdtx_source_document_status_valid check (
    document_status in ('DRAFT', 'SUBMITTED', 'CHECKED', 'NEEDS_FIX', 'APPROVED', 'ARCHIVED')
  ),
  constraint ttgdtx_source_document_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.ttgdtx_source_control_checks (
  id uuid primary key default gen_random_uuid(),
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  check_code text not null unique,
  check_name text not null,
  related_step_code text not null,
  source_document_id uuid references public.ttgdtx_source_documents(id) on delete restrict,
  check_group text not null,
  owner_department text not null,
  severity text not null default 'WARNING',
  expected_control text not null,
  current_observation text not null,
  fix_owner text,
  fix_action text,
  evidence_url text,
  check_status text not null default 'NOT_CHECKED',
  due_at timestamptz,
  control_status text not null default 'DAT_TAM_THOI',
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_source_check_group_valid check (
    check_group in ('SOURCE_FILE', 'TTGDTX_MASTER', 'CONTRACT', 'LEGAL_GATE', 'TUITION_POLICY', 'RECEIVABLE_GATE', 'PAYMENT', 'AUDIT', 'SCOPE', 'WORKFLOW')
  ),
  constraint ttgdtx_source_check_severity_valid check (
    severity in ('INFO', 'WARNING', 'ERROR', 'CRITICAL')
  ),
  constraint ttgdtx_source_check_status_valid check (
    check_status in ('PASS', 'WARNING', 'FAIL', 'NOT_CHECKED', 'WAIVED')
  ),
  constraint ttgdtx_source_check_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create index if not exists idx_ttgdtx_source_documents_segment
on public.ttgdtx_source_documents(admission_segment_id, related_step_code, document_status)
where record_status = 'ACTIVE';

alter table public.ttgdtx_source_control_checks
  drop constraint if exists ttgdtx_source_control_checks_source_document_id_fkey;

alter table public.ttgdtx_source_control_checks
  add constraint ttgdtx_source_control_checks_source_document_id_fkey
  foreign key (source_document_id)
  references public.ttgdtx_source_documents(id)
  on delete restrict;

alter table public.ttgdtx_source_control_checks
  drop constraint if exists ttgdtx_source_check_group_valid;

alter table public.ttgdtx_source_control_checks
  add constraint ttgdtx_source_check_group_valid check (
    check_group in ('SOURCE_FILE', 'TTGDTX_MASTER', 'CONTRACT', 'LEGAL_GATE', 'TUITION_POLICY', 'RECEIVABLE_GATE', 'PAYMENT', 'AUDIT', 'SCOPE', 'WORKFLOW')
  );

create index if not exists idx_ttgdtx_source_checks_segment
on public.ttgdtx_source_control_checks(admission_segment_id, related_step_code, check_status, severity)
where record_status = 'ACTIVE';

drop trigger if exists trg_ttgdtx_source_documents_updated_at
on public.ttgdtx_source_documents;
create trigger trg_ttgdtx_source_documents_updated_at
before update on public.ttgdtx_source_documents
for each row execute function public.set_updated_at();

drop trigger if exists trg_ttgdtx_source_checks_updated_at
on public.ttgdtx_source_control_checks;
create trigger trg_ttgdtx_source_checks_updated_at
before update on public.ttgdtx_source_control_checks
for each row execute function public.set_updated_at();

drop trigger if exists trg_ttgdtx_source_documents_audit
on public.ttgdtx_source_documents;
create trigger trg_ttgdtx_source_documents_audit
after insert or update or delete on public.ttgdtx_source_documents
for each row execute function public.write_audit_log();

drop trigger if exists trg_ttgdtx_source_checks_audit
on public.ttgdtx_source_control_checks;
create trigger trg_ttgdtx_source_checks_audit
after insert or update or delete on public.ttgdtx_source_control_checks
for each row execute function public.write_audit_log();

alter table public.ttgdtx_source_documents enable row level security;
alter table public.ttgdtx_source_control_checks enable row level security;

create or replace function public.can_read_ttgdtx_source_control(target_segment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or (
      (
        public.has_permission('ttgdtx.source.read')
        or public.has_permission('ttgdtx.source.manage')
        or public.has_permission('ttgdtx.source.approve')
      )
      and public.can_access_business_scope(target_segment_id, null::uuid)
    )
$$;

create or replace function public.can_manage_ttgdtx_source_control()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('ttgdtx.source.manage')
    or public.has_permission('ttgdtx.source.approve')
$$;

grant execute on function public.can_read_ttgdtx_source_control(uuid) to authenticated;
grant execute on function public.can_manage_ttgdtx_source_control() to authenticated;

drop policy if exists "ttgdtx_source_documents_select"
on public.ttgdtx_source_documents;
create policy "ttgdtx_source_documents_select"
on public.ttgdtx_source_documents for select
to authenticated
using (public.can_read_ttgdtx_source_control(admission_segment_id));

drop policy if exists "ttgdtx_source_documents_manage"
on public.ttgdtx_source_documents;

drop policy if exists "ttgdtx_source_documents_insert"
on public.ttgdtx_source_documents;
create policy "ttgdtx_source_documents_insert"
on public.ttgdtx_source_documents for insert
to authenticated
with check (
  public.can_manage_ttgdtx_source_control()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
);

drop policy if exists "ttgdtx_source_documents_update"
on public.ttgdtx_source_documents;
create policy "ttgdtx_source_documents_update"
on public.ttgdtx_source_documents for update
to authenticated
using (
  public.can_manage_ttgdtx_source_control()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
)
with check (
  public.can_manage_ttgdtx_source_control()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
);

drop policy if exists "ttgdtx_source_checks_select"
on public.ttgdtx_source_control_checks;
create policy "ttgdtx_source_checks_select"
on public.ttgdtx_source_control_checks for select
to authenticated
using (public.can_read_ttgdtx_source_control(admission_segment_id));

drop policy if exists "ttgdtx_source_checks_manage"
on public.ttgdtx_source_control_checks;

drop policy if exists "ttgdtx_source_checks_insert"
on public.ttgdtx_source_control_checks;
create policy "ttgdtx_source_checks_insert"
on public.ttgdtx_source_control_checks for insert
to authenticated
with check (
  public.can_manage_ttgdtx_source_control()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
);

drop policy if exists "ttgdtx_source_checks_update"
on public.ttgdtx_source_control_checks;
create policy "ttgdtx_source_checks_update"
on public.ttgdtx_source_control_checks for update
to authenticated
using (
  public.can_manage_ttgdtx_source_control()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
)
with check (
  public.can_manage_ttgdtx_source_control()
  and public.can_access_business_scope(admission_segment_id, null::uuid)
);

with segment as (
  select id
  from public.admission_segments
  where segment_code = 'TC9_TTGDTX_LINKED'
    and status = 'ACTIVE'
  limit 1
)
insert into public.ttgdtx_source_documents (
  admission_segment_id,
  source_code,
  source_title,
  source_type,
  document_scope,
  related_step_code,
  source_path_or_url,
  file_name,
  version_label,
  owner_department,
  checker_role,
  approver_role,
  confidentiality,
  required_for_go_live,
  source_note,
  document_status,
  control_status
)
select
  segment.id,
  src.source_code,
  src.source_title,
  src.source_type,
  src.document_scope,
  src.related_step_code,
  src.source_path_or_url,
  src.file_name,
  src.version_label,
  src.owner_department,
  src.checker_role,
  src.approver_role,
  src.confidentiality,
  src.required_for_go_live,
  src.source_note,
  src.document_status,
  src.control_status
from segment
cross join (
  values
    (
      'P2_11_P2_03_GATE_CONTROL_V03',
      'File kiểm soát P2-03 công nợ TTGDTX V03',
      'EXCEL_WORKBOOK',
      'RECEIVABLE_GATE',
      'P2-03',
      'G:\My Drive\Trung cấp HEU\PHẦN MỀM_HOU_HEU_NGẮN HẠN\HEU_9+\9+\HEU_P2_03_CONG_NO_TTGDTX_GATE_CONTROL_20260619_V03.xlsx',
      'HEU_P2_03_CONG_NO_TTGDTX_GATE_CONTROL_20260619_V03.xlsx',
      '20260619_V03',
      'KHTC + IT_DATA',
      'AUDIT',
      'BGH/KE_TOAN_TRUONG',
      'RESTRICTED',
      true,
      'Nguồn phân tích gate P2-03: TTGDTX, hợp đồng, P0-19 ngành, P2-02 học phí, trạng thái lead và chống trùng công nợ.',
      'CHECKED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_TUITION_GOOGLE_SHEET',
      'Google Sheet thu học phí đang vận hành',
      'GOOGLE_SHEET',
      'TUITION_POLICY',
      'P2-02',
      'https://docs.google.com/spreadsheets/d/1tx1M3ihJ44ELcY4ijaZpCAg1_bqryRr1/edit?gid=1423132475#gid=1423132475',
      'Google Sheet thu học phí',
      'LIVE_LINK',
      'KHTC',
      'ACCOUNTING_LEAD',
      'BGH/KE_TOAN_TRUONG',
      'RESTRICTED',
      true,
      'Nguồn thực tế thu học phí cần đối chiếu thành chính sách P2-02 và chứng từ P2-10.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_SOP_MAP_TS_V01',
      'Map SOP tuyển sinh sang form/sheet/report/dashboard',
      'EXCEL_WORKBOOK',
      'SOP_MAP',
      'P2-11',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_MAP_SOP_TS_TO_FORM_SHEET_REPORT_VIEW_DASHBOARD_20260513_V01.xlsx',
      'HEU_MAP_SOP_TS_TO_FORM_SHEET_REPORT_VIEW_DASHBOARD_20260513_V01.xlsx',
      '20260513_V01',
      'PHAP_CHE + IT_DATA',
      'IT_DATA',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Bản đồ nối SOP tuyển sinh với biểu mẫu, sheet, báo cáo và dashboard.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_SOP_MAP_TS_V01_FIXED_PATHS',
      'Map SOP tuyển sinh đã sửa đường dẫn',
      'EXCEL_WORKBOOK',
      'SOP_MAP',
      'P2-11',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_MAP_SOP_TS_TO_FORM_SHEET_REPORT_VIEW_DASHBOARD_20260513_V01_DA_SUA_DUONG_DAN.xlsx',
      'HEU_MAP_SOP_TS_TO_FORM_SHEET_REPORT_VIEW_DASHBOARD_20260513_V01_DA_SUA_DUONG_DAN.xlsx',
      '20260513_V01_FIXED_PATHS',
      'PHAP_CHE + IT_DATA',
      'IT_DATA',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Bản dùng để đối chiếu đường dẫn file rời vào hệ thống.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_CTHSSV',
      'Quy chế công tác học sinh sinh viên',
      'DOCX_REGULATION',
      'LEGAL_REGULATION',
      'P2-03',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_CONG_TAC_HOC_SINH_SINH_VIEN_20260502_V01.docx',
      'HEU_QUY_CHE_CONG_TAC_HOC_SINH_SINH_VIEN_20260502_V01.docx',
      '20260502_V01',
      'CTHSSV + PHAP_CHE',
      'PHAP_CHE',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Căn cứ bàn giao hồ sơ, xác nhận đủ điều kiện và phối hợp CTHSSV.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_DAO_TAO_TRUNG_CAP',
      'Quy chế đào tạo trình độ trung cấp',
      'DOCX_REGULATION',
      'LEGAL_REGULATION',
      'P0-19',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_DAO_TAO_TRINH_DO_TRUNG_CAP_20260502_V01.docx',
      'HEU_QUY_CHE_DAO_TAO_TRINH_DO_TRUNG_CAP_20260502_V01.docx',
      '20260502_V01',
      'DAO_TAO + PHAP_CHE',
      'PHAP_CHE',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Căn cứ đối chiếu ngành/nghề, hệ đào tạo, chương trình và điều kiện nhập học.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_DATA_NAMING',
      'Quy chế dữ liệu và đặt tên hệ thống',
      'DOCX_REGULATION',
      'SOP_MAP',
      'P2-11',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_DU_LIEU_VA_DAT_TEN_HE_THONG_20260502_V01.docx',
      'HEU_QUY_CHE_DU_LIEU_VA_DAT_TEN_HE_THONG_20260502_V01.docx',
      '20260502_V01',
      'IT_DATA + PHAP_CHE',
      'IT_DATA',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Chuẩn mã, tên bảng, trạng thái, nguồn dữ liệu và quy tắc không sửa tay bảng lõi.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_INTERNAL_DOCS',
      'Quy chế hệ thống văn bản nội bộ',
      'DOCX_REGULATION',
      'LEGAL_REGULATION',
      'P2-11',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_HE_THONG_VAN_BAN_NOI_BO_20260502_V01.docx',
      'HEU_QUY_CHE_HE_THONG_VAN_BAN_NOI_BO_20260502_V01.docx',
      '20260502_V01',
      'PHAP_CHE',
      'PHAP_CHE',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Nguồn kiểm soát phiên bản văn bản, hiệu lực và nơi lưu trữ chính thức.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_FILE_DATA',
      'Quy chế hồ sơ, file data và chuyển đổi số',
      'DOCX_REGULATION',
      'EVIDENCE',
      'P2-10',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_HO_SO_FILE_DATA_CHUYEN_DOI_SO_20260502_V01.docx',
      'HEU_QUY_CHE_HO_SO_FILE_DATA_CHUYEN_DOI_SO_20260502_V01.docx',
      '20260502_V01',
      'IT_DATA + PHAP_CHE',
      'AUDIT',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Căn cứ chứng từ, link minh chứng, file upload và kiểm soát dữ liệu chuyển đổi số.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_PARTNER_CONTRACT',
      'Quy chế hợp đồng đối tác liên kết đào tạo',
      'DOCX_REGULATION',
      'CONTRACT_MASTER',
      'P2-01',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_HOP_DONG_DOI_TAC_LIEN_KET_DAO_TAO_20260502_V01.docx',
      'HEU_QUY_CHE_HOP_DONG_DOI_TAC_LIEN_KET_DAO_TAO_20260502_V01.docx',
      '20260502_V01',
      'PHAP_CHE + TUYEN_SINH',
      'PHAP_CHE',
      'BGH/HIEU_TRUONG',
      'CONFIDENTIAL',
      true,
      'Căn cứ kiểm soát hợp đồng TTGDTX, thẩm quyền ký, thời hạn, phạm vi và chính sách chi trả.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_AUDIT',
      'Quy chế kiểm soát nội bộ và audit',
      'DOCX_REGULATION',
      'AUDIT',
      'P2-07',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_KIEM_SOAT_NOI_BO_AUDIT_20260502_V01.docx',
      'HEU_QUY_CHE_KIEM_SOAT_NOI_BO_AUDIT_20260502_V01.docx',
      '20260502_V01',
      'AUDIT + PHAP_CHE',
      'AUDIT',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Căn cứ phân loại lỗi hệ thống, lỗi logic, lỗi chuyên môn và tuyến báo cáo/xử lý.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_PAYMENT_APPROVAL',
      'Quy chế mua sắm, thanh toán, nghiệm thu, duyệt chi',
      'DOCX_REGULATION',
      'PAYMENT_COLLECTION',
      'P2-10',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_MUA_SAM_THANH_TOAN_NGHIEM_THU_DUYET_CHI_20260502_V01.docx',
      'HEU_QUY_CHE_MUA_SAM_THANH_TOAN_NGHIEM_THU_DUYET_CHI_20260502_V01.docx',
      '20260502_V01',
      'KHTC + PHAP_CHE',
      'ACCOUNTING_LEAD',
      'BGH/KE_TOAN_TRUONG',
      'RESTRICTED',
      true,
      'Căn cứ kiểm soát chi trả sau đối soát, không chi sai người, không chi hai lần.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_PERMISSION',
      'Quy chế phân quyền, uỷ quyền và phối hợp liên phòng',
      'DOCX_REGULATION',
      'PERMISSION_SCOPE',
      'P2-11',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_PHAN_QUYEN_UY_QUYEN_PHOI_HOP_LIEN_PHONG_20260502_V01.docx',
      'HEU_QUY_CHE_PHAN_QUYEN_UY_QUYEN_PHOI_HOP_LIEN_PHONG_20260502_V01.docx',
      '20260502_V01',
      'PHAP_CHE + IT_DATA',
      'AUDIT',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Căn cứ phân quyền theo phòng ban, đối tượng tuyển sinh, TTGDTX và người duyệt.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_LEGAL_INTERNAL',
      'Quy chế pháp chế nội bộ',
      'DOCX_REGULATION',
      'LEGAL_REGULATION',
      'P0-19',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_PHAP_CHE_NOI_BO_20260502_V01.docx',
      'HEU_QUY_CHE_PHAP_CHE_NOI_BO_20260502_V01.docx',
      '20260502_V01',
      'PHAP_CHE',
      'PHAP_CHE',
      'BGH/HIEU_TRUONG',
      'CONFIDENTIAL',
      true,
      'Căn cứ pháp chế kiểm tra quyết định, hợp đồng, chính sách và quyền phê duyệt.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_LOCATION_ASSET',
      'Quy chế quản lý cơ sở vật chất, thiết bị, địa điểm đào tạo',
      'DOCX_REGULATION',
      'LOCATION',
      'P2-01',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_QUAN_LY_CO_SO_VAT_CHAT_THIET_BI_DIA_DIEM_DAO_TAO_20260502_V01.docx',
      'HEU_QUY_CHE_QUAN_LY_CO_SO_VAT_CHAT_THIET_BI_DIA_DIEM_DAO_TAO_20260502_V01.docx',
      '20260502_V01',
      'CSVC + DAO_TAO + PHAP_CHE',
      'PHAP_CHE',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Căn cứ kiểm tra địa điểm đào tạo/lớp trong hợp đồng và hồ sơ lớp.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_FINANCE_ACCOUNTING',
      'Quy chế tài chính, kế toán, học phí, công nợ',
      'DOCX_REGULATION',
      'TUITION_POLICY',
      'P2-02',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_TAI_CHINH_KE_TOAN_HOC_PHI_CONG_NO_20260502_V01.docx',
      'HEU_QUY_CHE_TAI_CHINH_KE_TOAN_HOC_PHI_CONG_NO_20260502_V01.docx',
      '20260502_V01',
      'KHTC + PHAP_CHE',
      'ACCOUNTING_LEAD',
      'BGH/KE_TOAN_TRUONG',
      'RESTRICTED',
      true,
      'Căn cứ học phí, công nợ, thu, chứng từ, đối soát và kế toán.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_ORG_OPERATION',
      'Quy chế tổ chức hoạt động',
      'DOCX_REGULATION',
      'LEGAL_REGULATION',
      'P2-11',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_TO_CHUC_HOAT_DONG_20260501_V01.docx',
      'HEU_QUY_CHE_TO_CHUC_HOAT_DONG_20260501_V01.docx',
      '20260501_V01',
      'BGH + PHAP_CHE',
      'PHAP_CHE',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Căn cứ owner phòng ban, luồng duyệt và phối hợp vận hành toàn trường.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_DEPARTMENT_MAJOR',
      'Quy chế tổ chức hoạt động khoa/bộ môn',
      'DOCX_REGULATION',
      'LEGAL_REGULATION',
      'P0-19',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_TO_CHUC_HOAT_DONG_KHOA_BO_MON_20260502_V01.docx',
      'HEU_QUY_CHE_TO_CHUC_HOAT_DONG_KHOA_BO_MON_20260502_V01.docx',
      '20260502_V01',
      'DAO_TAO + KHOA_BO_MON',
      'PHAP_CHE',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Căn cứ ngành/khoa/bộ môn chịu trách nhiệm chuyên môn.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_ADMISSION',
      'Quy chế tuyển sinh dự thảo',
      'DOCX_REGULATION',
      'RECEIVABLE_GATE',
      'P2-03',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_TUYEN_SINH_DU_THAO_20260502_V01_TIENG_VIET_CO_DAU_CHUAN.docx',
      'HEU_QUY_CHE_TUYEN_SINH_DU_THAO_20260502_V01_TIENG_VIET_CO_DAU_CHUAN.docx',
      '20260502_V01',
      'TUYEN_SINH + PHAP_CHE',
      'PHAP_CHE',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Căn cứ trạng thái lead, điều kiện hồ sơ, thông tin tư vấn và bàn giao liên phòng.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    ),
    (
      'P2_11_REG_ADMISSION_COMMUNICATION',
      'Quy chế truyền thông, tư vấn tuyển sinh và cam kết người học',
      'DOCX_REGULATION',
      'RECEIVABLE_GATE',
      'P2-03',
      'D:\XD_HEU_V1\1. PHÁP CHẾ (OWNER CONTROL TOÀN HỆ)\QUY CHE\HEU_QUY_CHE_TRUYEN_THONG_TU_VAN_TUYEN_SINH_CAM_KET_NGUOI_HOC_20260502_V01.docx',
      'HEU_QUY_CHE_TRUYEN_THONG_TU_VAN_TUYEN_SINH_CAM_KET_NGUOI_HOC_20260502_V01.docx',
      '20260502_V01',
      'TUYEN_SINH + PHAP_CHE',
      'PHAP_CHE',
      'BGH',
      'CONFIDENTIAL',
      true,
      'Căn cứ tránh tư vấn sai, cam kết sai, hoặc ghi nhận lead chưa đủ điều kiện.',
      'SUBMITTED',
      'DAT_TAM_THOI'
    )
) as src(
  source_code,
  source_title,
  source_type,
  document_scope,
  related_step_code,
  source_path_or_url,
  file_name,
  version_label,
  owner_department,
  checker_role,
  approver_role,
  confidentiality,
  required_for_go_live,
  source_note,
  document_status,
  control_status
)
on conflict (source_code) do update set
  admission_segment_id = excluded.admission_segment_id,
  source_title = excluded.source_title,
  source_type = excluded.source_type,
  document_scope = excluded.document_scope,
  related_step_code = excluded.related_step_code,
  related_module_code = excluded.related_module_code,
  source_path_or_url = excluded.source_path_or_url,
  file_name = excluded.file_name,
  version_label = excluded.version_label,
  owner_department = excluded.owner_department,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  confidentiality = excluded.confidentiality,
  required_for_go_live = excluded.required_for_go_live,
  source_note = excluded.source_note,
  document_status = excluded.document_status,
  control_status = excluded.control_status,
  record_status = 'ACTIVE',
  updated_at = now();

with segment as (
  select id
  from public.admission_segments
  where segment_code = 'TC9_TTGDTX_LINKED'
    and status = 'ACTIVE'
  limit 1
)
insert into public.ttgdtx_source_control_checks (
  admission_segment_id,
  check_code,
  check_name,
  related_step_code,
  source_document_id,
  check_group,
  owner_department,
  severity,
  expected_control,
  current_observation,
  fix_owner,
  fix_action,
  check_status,
  control_status
)
select
  segment.id,
  chk.check_code,
  chk.check_name,
  chk.related_step_code,
  d.id,
  chk.check_group,
  chk.owner_department,
  chk.severity,
  chk.expected_control,
  chk.current_observation,
  chk.fix_owner,
  chk.fix_action,
  chk.check_status,
  chk.control_status
from segment
cross join (
  values
    (
      'CHK_P2_01_CONTRACT_DATES',
      'P2-01 hợp đồng TTGDTX phải có ngày ký, ngày hiệu lực, phạm vi, người ký',
      'P2-01',
      'P2_11_REG_PARTNER_CONTRACT',
      'CONTRACT',
      'PHAP_CHE + TUYEN_SINH',
      'ERROR',
      'Mỗi TTGDTX dùng để tạo công nợ phải có hợp đồng ACTIVE, đủ ngày ký/hiệu lực, phạm vi ngành/hệ và thẩm quyền.',
      'File V03 đang ghi nhiều hợp đồng còn thiếu ngày ký/ngày hiệu lực hoặc mới ở mức gợi ý cần duyệt.',
      'PHAP_CHE',
      'Đối chiếu file hợp đồng gốc, bổ sung ngày hiệu lực, phạm vi, người ký và chuyển trạng thái hợp đồng sau khi duyệt.',
      'FAIL',
      'DAT_TAM_THOI'
    ),
    (
      'CHK_P0_19_MAJOR_LEGAL',
      'P0-19 ngành/nghề phải được pháp chế và đào tạo xác nhận',
      'P0-19',
      'P2_11_REG_DAO_TAO_TRUNG_CAP',
      'LEGAL_GATE',
      'DAO_TAO + PHAP_CHE',
      'CRITICAL',
      'Ngành muốn chốt nhập học/bàn giao/kế toán phải có legal_status VERIFIED và finance_gate ALLOW.',
      'File V03 cho thấy các ngành 9+ còn NOT_READY vì thiếu đối chiếu quyết định/mã ngành/chỉ tiêu/học phí.',
      'DAO_TAO + PHAP_CHE',
      'Dùng quyết định cho phép đào tạo, mã ngành/nghề, chỉ tiêu và học phí để cập nhật P0-19 theo từng ngành.',
      'FAIL',
      'DAT_TAM_THOI'
    ),
    (
      'CHK_P2_02_TUITION_READY',
      'P2-02 chính sách học phí phải READY trước khi tạo công nợ',
      'P2-02',
      'P2_11_REG_FINANCE_ACCOUNTING',
      'TUITION_POLICY',
      'KHTC',
      'CRITICAL',
      'Mỗi TTGDTX + hệ + ngành + kỳ phải có chính sách học phí READY, số tiền, hạn thu và căn cứ chính sách.',
      'File V03 cho thấy nhiều dòng học phí còn thiếu số tiền, hạn thu hoặc file chính sách.',
      'KHTC',
      'Đối chiếu Google Sheet thu học phí và quy chế tài chính để chuẩn hoá thành P2-02 theo từng TTGDTX/ngành/kỳ.',
      'FAIL',
      'DAT_TAM_THOI'
    ),
    (
      'CHK_P2_03_GATE_PASS_ONLY',
      'P2-03 chỉ tạo công nợ khi tất cả gate bắt buộc đạt',
      'P2-03',
      'P2_11_P2_03_GATE_CONTROL_V03',
      'RECEIVABLE_GATE',
      'KHTC + IT_DATA + AUDIT',
      'INFO',
      'P2-03 phải kiểm tra đúng TTGDTX, đúng ngành, trạng thái lead, hồ sơ, P2-02 READY và không trùng công nợ.',
      'Logic hiện đã có gate hiển thị đúng chỗ thiếu và giữ nguyên dữ liệu đúng.',
      'IT_DATA + AUDIT',
      'Tiếp tục giữ P2-03 ở chế độ gate, không cho nhập tắt khi thiếu điều kiện.',
      'PASS',
      'DAT_TAM_THOI'
    ),
    (
      'CHK_P2_10_NO_OVER_COLLECTION',
      'P2-10 không thu vượt, không trùng chứng từ',
      'P2-10',
      'P2_11_REG_PAYMENT_APPROVAL',
      'PAYMENT',
      'KHTC + AUDIT',
      'INFO',
      'Thu học phí chỉ ghi theo công nợ P2-03, không vượt số còn phải thu, không trùng số chứng từ.',
      'P2-10 hiện đã tách thu tiền khỏi tạo công nợ và có rule chặn thu vượt/trùng voucher.',
      'KHTC + AUDIT',
      'Khi có công nợ thật, kiểm thử thu một phần, thu đủ, thu vượt, trùng chứng từ trước production.',
      'PASS',
      'DAT_TAM_THOI'
    ),
    (
      'CHK_P2_11_LOCAL_PATH_TO_PRODUCTION_LINK',
      'Nguồn local/G Drive phải chuyển thành link production có quyền truy cập',
      'P2-11',
      'P2_11_SOP_MAP_TS_V01_FIXED_PATHS',
      'SOURCE_FILE',
      'IT_DATA',
      'WARNING',
      'Production nên dùng Google Drive link, Supabase Storage hoặc File Registry thay vì đường dẫn máy cá nhân.',
      'Nhiều nguồn hiện là đường dẫn D:\\ hoặc G:\\ nên máy khác/server có thể không mở được.',
      'IT_DATA',
      'Đưa từng file vào File Registry/Drive chuẩn, lưu URL chính thức và phân quyền theo vai trò.',
      'WARNING',
      'DAT_TAM_THOI'
    ),
    (
      'CHK_P2_11_DOC_OWNER_APPROVAL',
      'Mỗi quy chế phải có owner, checker, approver trước khi khóa sản xuất',
      'P2-11',
      'P2_11_REG_INTERNAL_DOCS',
      'AUDIT',
      'PHAP_CHE + AUDIT',
      'ERROR',
      'Nguồn quy chế dùng làm căn cứ hệ thống phải có phiên bản, người chịu trách nhiệm, người kiểm tra và người duyệt.',
      'Các file đã được đăng ký nguồn nhưng phần lớn mới ở trạng thái SUBMITTED, chưa APPROVED.',
      'PHAP_CHE + AUDIT',
      'Phân công owner/checker/approver và cập nhật trạng thái từng văn bản sau khi đối chiếu.',
      'FAIL',
      'DAT_TAM_THOI'
    ),
    (
      'CHK_P2_11_TTGDTX_MASTER_DROPDOWN',
      'Danh mục TTGDTX phải nhập từ master được duyệt để dùng dropdown',
      'P2-11',
      'P2_11_P2_03_GATE_CONTROL_V03',
      'TTGDTX_MASTER',
      'TUYEN_SINH + PHAP_CHE + IT_DATA',
      'WARNING',
      'Người dùng phải chọn TTGDTX từ danh mục, không gõ tay tên trung tâm.',
      'Danh mục TTGDTX trong file V03 đã có nhiều trung tâm nhưng vẫn có trạng thái gợi ý/cần duyệt.',
      'PHAP_CHE + IT_DATA',
      'Import/duyệt TTGDTX master chính thức rồi dùng làm dropdown cho lead, hợp đồng, học phí và công nợ.',
      'WARNING',
      'DAT_TAM_THOI'
    )
) as chk(
  check_code,
  check_name,
  related_step_code,
  source_code,
  check_group,
  owner_department,
  severity,
  expected_control,
  current_observation,
  fix_owner,
  fix_action,
  check_status,
  control_status
)
left join public.ttgdtx_source_documents d
  on d.source_code = chk.source_code
on conflict (check_code) do update set
  admission_segment_id = excluded.admission_segment_id,
  check_name = excluded.check_name,
  related_step_code = excluded.related_step_code,
  source_document_id = excluded.source_document_id,
  check_group = excluded.check_group,
  owner_department = excluded.owner_department,
  severity = excluded.severity,
  expected_control = excluded.expected_control,
  current_observation = excluded.current_observation,
  fix_owner = excluded.fix_owner,
  fix_action = excluded.fix_action,
  check_status = excluded.check_status,
  control_status = excluded.control_status,
  record_status = 'ACTIVE',
  updated_at = now();

create or replace view public.ttgdtx_source_document_status
with (security_invoker = true)
as
select
  d.id,
  d.admission_segment_id,
  s.segment_code,
  s.segment_name,
  d.source_code,
  d.source_title,
  d.source_type,
  d.document_scope,
  d.related_step_code,
  d.related_module_code,
  d.source_path_or_url,
  d.file_name,
  d.version_label,
  d.owner_department,
  d.checker_role,
  d.approver_role,
  d.confidentiality,
  d.required_for_go_live,
  d.effective_from,
  d.effective_to,
  d.last_seen_at,
  d.checksum_note,
  d.source_note,
  d.document_status,
  d.control_status,
  d.updated_at,
  array_remove(array[
    case
      when d.required_for_go_live
        and d.document_status not in ('CHECKED', 'APPROVED')
        then 'SOURCE_NOT_APPROVED'
    end,
    case
      when position(':' in d.source_path_or_url) = 2
        and substring(d.source_path_or_url from 3 for 1) = chr(92)
        then 'LOCAL_PATH_NEEDS_PRODUCTION_LINK'
    end,
    case when d.document_status = 'NEEDS_FIX' then 'DOCUMENT_NEEDS_FIX' end,
    case when d.checker_role is null or length(trim(d.checker_role)) = 0 then 'MISSING_CHECKER' end,
    case when d.approver_role is null or length(trim(d.approver_role)) = 0 then 'MISSING_APPROVER' end
  ], null) as control_flags,
  case
    when d.document_status = 'ARCHIVED' then 'ARCHIVED'
    when d.document_status = 'NEEDS_FIX' then 'NEEDS_FIX'
    when d.required_for_go_live and d.document_status not in ('CHECKED', 'APPROVED') then 'WAITING_CHECK'
    when position(':' in d.source_path_or_url) = 2
      and substring(d.source_path_or_url from 3 for 1) = chr(92)
      then 'READY_BUT_LOCAL_PATH'
    else 'READY'
  end as readiness_status
from public.ttgdtx_source_documents d
join public.admission_segments s on s.id = d.admission_segment_id
where d.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_source_control(d.admission_segment_id);

grant select on public.ttgdtx_source_document_status to authenticated;

create or replace view public.ttgdtx_p2_11_check_status
with (security_invoker = true)
as
select
  c.id,
  c.admission_segment_id,
  s.segment_code,
  s.segment_name,
  c.check_code,
  c.check_name,
  c.related_step_code,
  c.check_group,
  c.owner_department,
  c.severity,
  c.expected_control,
  c.current_observation,
  c.fix_owner,
  c.fix_action,
  c.evidence_url,
  c.check_status,
  c.control_status,
  c.updated_at,
  d.source_code,
  d.source_title,
  d.source_path_or_url,
  case
    when c.check_status = 'FAIL' and c.severity = 'CRITICAL' then 'BLOCKED_CRITICAL'
    when c.check_status = 'FAIL' then 'BLOCKED'
    when c.check_status = 'WARNING' then 'NEEDS_REVIEW'
    when c.check_status = 'NOT_CHECKED' then 'WAITING_CHECK'
    when c.check_status = 'WAIVED' then 'WAIVED'
    else 'PASS'
  end as readiness_status
from public.ttgdtx_source_control_checks c
join public.admission_segments s on s.id = c.admission_segment_id
left join public.ttgdtx_source_documents d on d.id = c.source_document_id
where c.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_source_control(c.admission_segment_id);

grant select on public.ttgdtx_p2_11_check_status to authenticated;

create or replace view public.ttgdtx_p2_11_control_board
with (security_invoker = true)
as
with docs as (
  select
    admission_segment_id,
    related_step_code,
    count(*)::int as source_count,
    count(*) filter (where readiness_status in ('READY', 'READY_BUT_LOCAL_PATH'))::int as source_ready_count,
    count(*) filter (where readiness_status in ('WAITING_CHECK', 'NEEDS_FIX'))::int as source_pending_count,
    count(*) filter (where 'LOCAL_PATH_NEEDS_PRODUCTION_LINK' = any(control_flags))::int as local_path_count
  from public.ttgdtx_source_document_status
  group by admission_segment_id, related_step_code
),
checks as (
  select
    admission_segment_id,
    related_step_code,
    count(*)::int as check_count,
    count(*) filter (where check_status = 'PASS')::int as check_pass_count,
    count(*) filter (where check_status = 'FAIL')::int as check_fail_count,
    count(*) filter (where check_status = 'WARNING')::int as check_warning_count,
    count(*) filter (where check_status = 'FAIL' and severity = 'CRITICAL')::int as critical_fail_count
  from public.ttgdtx_p2_11_check_status
  group by admission_segment_id, related_step_code
)
select
  coalesce(d.admission_segment_id, c.admission_segment_id) as admission_segment_id,
  s.segment_code,
  s.segment_name,
  coalesce(d.related_step_code, c.related_step_code) as related_step_code,
  coalesce(d.source_count, 0) as source_count,
  coalesce(d.source_ready_count, 0) as source_ready_count,
  coalesce(d.source_pending_count, 0) as source_pending_count,
  coalesce(d.local_path_count, 0) as local_path_count,
  coalesce(c.check_count, 0) as check_count,
  coalesce(c.check_pass_count, 0) as check_pass_count,
  coalesce(c.check_fail_count, 0) as check_fail_count,
  coalesce(c.check_warning_count, 0) as check_warning_count,
  coalesce(c.critical_fail_count, 0) as critical_fail_count,
  case
    when coalesce(c.critical_fail_count, 0) > 0 then 'BLOCKED_CRITICAL'
    when coalesce(c.check_fail_count, 0) > 0 then 'BLOCKED'
    when coalesce(d.source_pending_count, 0) > 0 then 'WAITING_SOURCE_CHECK'
    when coalesce(c.check_warning_count, 0) > 0 or coalesce(d.local_path_count, 0) > 0 then 'NEEDS_REVIEW'
    else 'READY'
  end as readiness_status,
  array_remove(array[
    case when coalesce(c.critical_fail_count, 0) > 0 then 'Có lỗi nghiêm trọng đang chặn production' end,
    case when coalesce(c.check_fail_count, 0) > 0 then 'Có checklist FAIL cần xử lý' end,
    case when coalesce(d.source_pending_count, 0) > 0 then 'Có nguồn chưa CHECKED/APPROVED' end,
    case when coalesce(d.local_path_count, 0) > 0 then 'Có đường dẫn local cần đổi sang link production' end,
    case when coalesce(c.check_warning_count, 0) > 0 then 'Có cảnh báo cần rà soát' end
  ], null) as next_actions
from docs d
full join checks c
  on c.admission_segment_id = d.admission_segment_id
  and c.related_step_code = d.related_step_code
join public.admission_segments s on s.id = coalesce(d.admission_segment_id, c.admission_segment_id);

grant select on public.ttgdtx_p2_11_control_board to authenticated;

create or replace view public.ttgdtx_p2_11_summary
with (security_invoker = true)
as
select
  coalesce((select count(*)::int from public.ttgdtx_source_document_status), 0) as source_count,
  coalesce((select count(*)::int from public.ttgdtx_source_document_status where readiness_status in ('READY', 'READY_BUT_LOCAL_PATH')), 0) as checked_source_count,
  coalesce((select count(*)::int from public.ttgdtx_source_document_status where readiness_status in ('WAITING_CHECK', 'NEEDS_FIX')), 0) as pending_source_count,
  coalesce((select count(*)::int from public.ttgdtx_source_document_status where 'LOCAL_PATH_NEEDS_PRODUCTION_LINK' = any(control_flags)), 0) as local_path_count,
  coalesce((select count(*)::int from public.ttgdtx_p2_11_check_status), 0) as check_count,
  coalesce((select count(*)::int from public.ttgdtx_p2_11_check_status where check_status = 'PASS'), 0) as pass_check_count,
  coalesce((select count(*)::int from public.ttgdtx_p2_11_check_status where check_status = 'FAIL'), 0) as failed_check_count,
  coalesce((select count(*)::int from public.ttgdtx_p2_11_check_status where check_status = 'WARNING'), 0) as warning_check_count,
  coalesce((select count(*)::int from public.ttgdtx_p2_11_check_status where check_status = 'FAIL' and severity = 'CRITICAL'), 0) as critical_failed_count;

grant select on public.ttgdtx_p2_11_summary to authenticated;

insert into public.admission_segment_operation_steps (
  segment_id,
  step_code,
  step_name,
  step_group,
  owner_department,
  action_href,
  required_for_operation,
  control_note,
  sort_order,
  control_status
)
select
  s.id,
  'TTGDTX_SOURCE_CONTROL_P2_11',
  'P2-11 Doi chieu nguon du lieu phap ly va checklist TTGDTX',
  'CONTROL',
  'KHTC + PHAP_CHE + IT_DATA + AUDIT',
  '/ttgdtx/source-control',
  true,
  'P2-11 dang ky nguon file/quy che, phan loai loi va chi ra buoc nao chua du truoc production.',
  74,
  'DAT_TAM_THOI'
from public.admission_segments s
where s.segment_code = 'TC9_TTGDTX_LINKED'
  and s.status = 'ACTIVE'
on conflict (segment_id, step_code) do update set
  step_name = excluded.step_name,
  step_group = excluded.step_group,
  owner_department = excluded.owner_department,
  action_href = excluded.action_href,
  required_for_operation = excluded.required_for_operation,
  control_note = excluded.control_note,
  sort_order = excluded.sort_order,
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
  'WF_P2_11_TTGDTX_SOURCE_CONTROL',
  'P2-11 Doi chieu nguon du lieu, phap ly va checklist TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Khi can dua quy trinh TTGDTX vao production hoac co file/quy che/hoc phi moi.',
  'KHTC/PHAP_CHE/IT_DATA',
  'KHTC + PHAP_CHE + IT_DATA + AUDIT',
  'AUDIT + PHAP_CHE + ACCOUNTING_LEAD',
  'BGH/KE_TOAN_TRUONG/HIEU_TRUONG',
  'Bang kiem nguon du lieu, buoc nao block, buoc nao can doi chieu truoc khi tao cong no/thu tien/chi tra.',
  'Chi khi P2-11 cho thay nguon da kiem soat thi moi chuyen sang khoa P0-19/P2-02/P2-03/P2-10 production.',
  'Moi thay doi nguon can co owner, checker, approver va khong duoc bo qua audit.',
  2110,
  'DAT_TAM_THOI'
)
on conflict (workflow_code) do update set
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
  'P2_11_TTGDTX_SOURCE_CONTROL',
  'P2-11 nguon du lieu, phap ly va checklist TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_source_documents; ttgdtx_source_control_checks; ttgdtx_p2_11_control_board',
  'EVIDENCE',
  'KHTC + PHAP_CHE + IT_DATA + AUDIT',
  'SUPABASE',
  'RESTRICTED',
  true,
  'Nguon file/quy che chi cap nhat qua P2-11; khong dung duong dan ca nhan lam nguon production neu chua vao File Registry/Drive chuan.',
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
  control_status
) values (
  'OWN_P2_11_TTGDTX_SOURCE_CONTROL',
  'P2-11 Doi chieu nguon du lieu, phap ly va checklist TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_11_TTGDTX_SOURCE_CONTROL',
  'TTGDTX_SOURCE_CONTROL',
  'ttgdtx_source_documents; ttgdtx_source_control_checks',
  'KHTC + PHAP_CHE + IT_DATA + AUDIT',
  'KHTC/PHAP_CHE/IT_DATA',
  'AUDIT + PHAP_CHE + ACCOUNTING_LEAD',
  'BGH/KE_TOAN_TRUONG/HIEU_TRUONG',
  'ROLE_AND_SCOPE',
  'FILE_REGISTRY/GOOGLE_SHEET/QUY_CHE',
  'P0-19 + P2-01 + P2-02 + P2-03 + P2-10',
  'Duong dan file/link, version, owner, checker, approver, ket qua checklist va hanh dong can sua.',
  'Khong cho chot production neu nguon bat buoc chua CHECKED/APPROVED hoac checklist CRITICAL dang FAIL.',
  48,
  'CRITICAL',
  'DAT_TAM_THOI'
)
on conflict (ownership_code) do update set
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
  decision_status
) values (
  'GATE_P2_11_TTGDTX_SOURCE_CONTROL',
  'Gate P2-11: nguon du lieu/phap ly TTGDTX phai duoc kiem soat truoc production',
  'DATA',
  'TTGDTX_SOURCE_CONTROL',
  'P2-11-SOURCE-CONTROL',
  'KHTC + PHAP_CHE + IT_DATA + AUDIT',
  'Kiem tra file nguon, quy che, hop dong, P0-19, P2-02, P2-03, P2-10 va phan loai loi dung owner.',
  'BGH/Ke toan truong/Hieu truong chi cho khoa production khi khong con critical fail va nguon bat buoc da duoc duyet.',
  'DRAFT'
)
on conflict (gate_code) do update set
  gate_name = excluded.gate_name,
  gate_type = excluded.gate_type,
  entity_type = excluded.entity_type,
  entity_code = excluded.entity_code,
  owner_department = excluded.owner_department,
  checker_note = excluded.checker_note,
  approver_note = excluded.approver_note,
  decision_status = excluded.decision_status,
  updated_at = now();

insert into public.heu_os_navigation_nodes (
  node_code,
  node_name,
  node_group,
  module_code,
  href,
  summary,
  owner_department,
  primary_action,
  sort_order,
  is_core,
  requires_attention_rule,
  control_status
) values (
  'NAV_P2_11_TTGDTX_SOURCE_CONTROL',
  'P2-11 Doi chieu nguon TTGDTX',
  'FINANCE',
  'M08_FINANCE_ACCOUNTING',
  '/ttgdtx/source-control',
  'Bang kiem nguon file, quy che, hop dong, hoc phi, cong no va thu tien TTGDTX truoc khi production.',
  'KHTC + PHAP_CHE + IT_DATA + AUDIT',
  'Mo P2-11 de xem nguon nao chua duyet va checklist nao dang chan.',
  2110,
  false,
  'Can xu ly khi co checklist FAIL/CRITICAL hoac duong dan local chua chuyen sang link production.',
  'DAT_TAM_THOI'
)
on conflict (node_code) do update set
  node_name = excluded.node_name,
  node_group = excluded.node_group,
  module_code = excluded.module_code,
  href = excluded.href,
  summary = excluded.summary,
  owner_department = excluded.owner_department,
  primary_action = excluded.primary_action,
  sort_order = excluded.sort_order,
  is_core = excluded.is_core,
  requires_attention_rule = excluded.requires_attention_rule,
  control_status = excluded.control_status,
  updated_at = now();

commit;
