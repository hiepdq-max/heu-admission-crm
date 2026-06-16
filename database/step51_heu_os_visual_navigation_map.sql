-- Step 51 - P0-12 HEU OS Visual Navigation Map.
-- Run after step50_role_permission_delegation_matrix.sql.
-- Purpose: one clickable navigation map for HEU ERP/AI OS so operators can
-- enter the right object/module without mixing admission segments.

create table if not exists public.heu_os_navigation_nodes (
  id uuid primary key default gen_random_uuid(),
  node_code text not null unique,
  node_name text not null,
  node_group text not null,
  module_code text references public.heu_os_modules(module_code),
  href text not null,
  summary text not null,
  owner_department text,
  primary_action text,
  sort_order int not null default 0,
  is_core boolean not null default false,
  requires_attention_rule text,
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_os_navigation_nodes_group_valid check (
    node_group in (
      'CONTROL',
      'ADMISSION',
      'HOU',
      'OPERATION',
      'FINANCE',
      'REPORT_AI',
      'SETTINGS'
    )
  ),
  constraint heu_os_navigation_nodes_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create index if not exists idx_heu_os_navigation_nodes_group
on public.heu_os_navigation_nodes(node_group, sort_order)
where status = 'ACTIVE';

create index if not exists idx_heu_os_navigation_nodes_module
on public.heu_os_navigation_nodes(module_code, control_status)
where status = 'ACTIVE';

alter table public.heu_os_navigation_nodes enable row level security;

drop policy if exists "heu_os_navigation_nodes_select_master_control"
on public.heu_os_navigation_nodes;
create policy "heu_os_navigation_nodes_select_master_control"
on public.heu_os_navigation_nodes for select
to authenticated
using (public.can_read_master_control());

drop policy if exists "heu_os_navigation_nodes_manage_master_control"
on public.heu_os_navigation_nodes;
create policy "heu_os_navigation_nodes_manage_master_control"
on public.heu_os_navigation_nodes for all
to authenticated
using (public.can_manage_master_control())
with check (public.can_manage_master_control());

drop trigger if exists trg_heu_os_navigation_nodes_updated_at
on public.heu_os_navigation_nodes;
create trigger trg_heu_os_navigation_nodes_updated_at
before update on public.heu_os_navigation_nodes
for each row execute function public.set_updated_at();

drop trigger if exists trg_heu_os_navigation_nodes_audit
on public.heu_os_navigation_nodes;
create trigger trg_heu_os_navigation_nodes_audit
after insert or update or delete on public.heu_os_navigation_nodes
for each row execute function public.write_audit_log();

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
) values
  (
    'NAV_DASHBOARD',
    'Dashboard dieu hanh',
    'CONTROL',
    'M05_ADMISSION_CRM',
    '/',
    'Man hinh tong hop so lieu hien tai theo pham vi user.',
    'BGH + TRUONG_PHONG',
    'Xem tong quan',
    10,
    true,
    'So lieu phai dung pham vi user va dung doi tuong tuyen sinh dang chon.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_MASTER_CONTROL',
    'Master Control',
    'CONTROL',
    'M00_MASTER_CONTROL',
    '/master-control',
    'Noi quan tri phap ly, SOP, data dictionary, gate, readiness va ban do HEU OS.',
    'BGH + PHAP_CHE + IT_DATA',
    'Kiem soat he thong',
    20,
    true,
    'Moi module production phai co owner, SOP, data, gate va audit.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_SEGMENTS',
    'Doi tuong tuyen sinh',
    'ADMISSION',
    'M05_ADMISSION_CRM',
    '/segments',
    'Tach rieng Trung cap 9+, TTGDTX, HOU, ngan han, tai nhap hoc va cac doi tuong co the them sau.',
    'TUYEN_SINH + PHAP_CHE',
    'Chon doi tuong',
    30,
    true,
    'Lead phai gan dung doi tuong; user chi thay doi tuong duoc phan.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_LEADS',
    'Lead tuyen sinh',
    'ADMISSION',
    'M05_ADMISSION_CRM',
    '/leads',
    'Danh sach lead cua doi tuong/pham vi dang chon; khong tron HOU, TTGDTX, ngan han hay tuyen sinh tai cho.',
    'TUYEN_SINH',
    'Lam viec voi lead',
    40,
    true,
    'Can RLS + UI filter theo pham vi user, doi tuong tuyen sinh va doi tac.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_PIPELINE',
    'Pipeline tuyen sinh',
    'ADMISSION',
    'M05_ADMISSION_CRM',
    '/pipeline',
    'Kanban lead theo trang thai, doc dung pham vi user va dung doi tuong tuyen sinh.',
    'TUYEN_SINH',
    'Theo doi tien do',
    50,
    true,
    'Moi chuyen trang thai quan trong phai qua rule database va ghi log.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_FOLLOWUPS',
    'Lich tu van',
    'ADMISSION',
    'M05_ADMISSION_CRM',
    '/followups',
    'Danh sach viec can cham soc, hen goi lai, qua han va lich tu van.',
    'TUYEN_SINH',
    'Cham soc dung han',
    60,
    false,
    'FOLLOW_UP can ngay hen; qua han can hien canh bao cho nguoi phu trach.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_HOU',
    'Kiem soat HOU',
    'HOU',
    'M10_HOU_LINKAGE',
    '/hou',
    'Lien thong HOU: chuong trinh, nganh, dia diem, hoc phi ky dau, ho so, minh chung, COM va ky thanh toan.',
    'TUYEN_SINH + KHTC + PHAP_CHE',
    'Xu ly HOU',
    70,
    true,
    'Ty le hop tac va chinh sach nhay cam chi hien cho role duoc phep.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_DOCUMENTS',
    'Ho so nhap hoc',
    'OPERATION',
    'M06_HSSV_HANDOVER',
    '/documents',
    'Kiem tra checklist ho so bat buoc truoc khi ban giao CTHSSV.',
    'CTHSSV + TUYEN_SINH',
    'Kiem tra ho so',
    80,
    true,
    'Chi ban giao khi ho so bat buoc dat va co log nguoi ban giao.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_PARTNERS',
    'Doi tac / CTV',
    'OPERATION',
    'M09_PARTNER_CONTRACT',
    '/partners',
    'Quan ly TTGDTX, CTV ca nhan, CTV to chuc, doanh nghiep va doi tac lien ket.',
    'TUYEN_SINH + PHAP_CHE + KHTC',
    'Quan ly doi tac',
    90,
    true,
    'Nguon va COM phai gan hop dong/chinh sach co hieu luc theo thoi diem.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_CAMPAIGNS',
    'Chien dich marketing',
    'ADMISSION',
    'M05_ADMISSION_CRM',
    '/campaigns',
    'Theo doi kenh online, landing page, ads, Zalo, TikTok, Facebook va nguon lead.',
    'TUYEN_SINH + MARKETING',
    'Theo doi chien dich',
    100,
    false,
    'Can chong trung lead, an/mask so dien thoai neu nguon form co du lieu ca nhan.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_REPORTS',
    'Bao cao',
    'REPORT_AI',
    'M05_ADMISSION_CRM',
    '/reports',
    'Bao cao theo doi tuong, nguon, tu van vien, doi tac, pipeline, HOU va chuyen doi.',
    'BGH + TRUONG_PHONG',
    'Xem bao cao',
    110,
    true,
    'Bao cao phai ton trong pham vi user, phong ban va doi tuong duoc phan.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_IMPORT',
    'Import du lieu',
    'OPERATION',
    'M05_ADMISSION_CRM',
    '/import',
    'Nhap danh sach tu file CSV theo dung doi tuong tuyen sinh va nguon.',
    'TUYEN_SINH + IT_DATA',
    'Import danh sach',
    120,
    false,
    'Import phai chong trung, gan dung doi tuong, nguon, doi tac va nguoi cap nhat.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_AUDIT',
    'Audit log',
    'CONTROL',
    'M00_MASTER_CONTROL',
    '/audit',
    'Tra cuu ai tao, ai sua, ai duyet va thay doi gi trong he thong.',
    'AUDIT + IT_DATA',
    'Kiem tra log',
    130,
    true,
    'Audit log khong duoc sua/xoa bang UI.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_AI_ASSISTANT',
    'AI Assistant',
    'REPORT_AI',
    'M20_AI_ASSISTANT',
    '/ai-assistant',
    'Tro ly AI chi doc du lieu trong pham vi duoc phep, goi y va canh bao; khong tu duyet.',
    'IT_DATA + PHAP_CHE + BGH',
    'Dung AI ho tro',
    140,
    false,
    'AI chi bat production khi co legal, SOP, data scope, prompt log va approval gate.',
    'CHUA_DU_DIEU_KIEN'
  ),
  (
    'NAV_SCOPES',
    'Pham vi user',
    'SETTINGS',
    'M01_IDENTITY_SCOPE',
    '/settings/scopes',
    'Phan user theo phong ban, nguoi quan ly truc tiep, doi tuong tuyen sinh va doi tac duoc lam.',
    'ADMIN + TRUONG_PHONG',
    'Phan viec cho user',
    150,
    true,
    'User chi duoc thay va lam trong pham vi duoc phan; truong phong chi quan ly cap duoi cua phong.',
    'DAT_TAM_THOI'
  ),
  (
    'NAV_SETTINGS',
    'Cau hinh',
    'SETTINGS',
    'M01_IDENTITY_SCOPE',
    '/settings',
    'Cau hinh vai tro, checklist, dia ban, he dao tao, nganh, dia diem va master data co ban.',
    'ADMIN + IT_DATA',
    'Cau hinh he thong',
    160,
    true,
    'Thay doi master data can co owner, ly do, log va nguoi duyet neu anh huong nghiep vu.',
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
  status = 'ACTIVE',
  updated_at = now();

create or replace view public.heu_os_visual_navigation_status
with (security_invoker = true)
as
with base as (
  select
    n.id,
    n.node_code,
    n.node_name,
    n.node_group,
    n.module_code,
    n.href,
    n.summary,
    n.owner_department,
    n.primary_action,
    n.sort_order,
    n.is_core,
    n.requires_attention_rule,
    n.control_status,
    r.module_name,
    r.module_group,
    r.readiness_score,
    r.readiness_status,
    r.missing_items,
    r.ai_gate_status,
    (
      coalesce(array_length(r.missing_items, 1), 0)
      + case when n.control_status in ('CAN_SUA', 'CHUA_DU_DIEU_KIEN') then 1 else 0 end
    )::int as attention_count
  from public.heu_os_navigation_nodes n
  left join public.heu_os_module_readiness r
    on r.module_code = n.module_code
  where n.status = 'ACTIVE'
)
select
  id,
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
  control_status,
  module_name,
  module_group,
  readiness_score,
  readiness_status,
  missing_items,
  ai_gate_status,
  attention_count,
  case
    when control_status = 'CHUA_DU_DIEU_KIEN'
      or readiness_status = 'BLOCKED'
      then 'BLOCKED'
    when control_status = 'CAN_SUA'
      or attention_count > 0
      then 'NEEDS_FIX'
    when control_status = 'DAT'
      and coalesce(readiness_status, 'READY') in ('READY', 'READY_TEMP')
      then 'READY'
    else 'TEMP_READY'
  end as visual_status
from base;

create or replace view public.heu_os_visual_navigation_summary
with (security_invoker = true)
as
select
  count(*)::int as node_count,
  count(*) filter (where visual_status = 'READY')::int as ready_count,
  count(*) filter (where visual_status = 'TEMP_READY')::int as temp_ready_count,
  count(*) filter (where visual_status = 'NEEDS_FIX')::int as needs_fix_count,
  count(*) filter (where visual_status = 'BLOCKED')::int as blocked_count,
  count(*) filter (where is_core)::int as core_count
from public.heu_os_visual_navigation_status;

grant select, insert, update, delete on public.heu_os_navigation_nodes to authenticated;
grant select on public.heu_os_visual_navigation_status to authenticated;
grant select on public.heu_os_visual_navigation_summary to authenticated;

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
) values
  (
    'HEU_OS_NAVIGATION_NODES',
    'HEU OS Navigation Nodes',
    'M00_MASTER_CONTROL',
    'CONFIG',
    'IT_DATA + MASTER_CONTROL',
    'Cau hinh cac o dieu huong trong ban do HEU OS; co the them bot module ma khong sua code UI.',
    'INTERNAL',
    true,
    'DAT_TAM_THOI'
  ),
  (
    'HEU_OS_VISUAL_NAVIGATION_STATUS',
    'HEU OS Visual Navigation Status',
    'M00_MASTER_CONTROL',
    'REPORT_VIEW',
    'IT_DATA + MASTER_CONTROL',
    'View tong hop trang thai cac o dieu huong, readiness module va canh bao can xu ly.',
    'INTERNAL',
    true,
    'DAT_TAM_THOI'
  )
on conflict (table_code) do update set
  table_name = excluded.table_name,
  module_code = excluded.module_code,
  table_type = excluded.table_type,
  data_owner_department = excluded.data_owner_department,
  purpose = excluded.purpose,
  sensitivity_level = excluded.sensitivity_level,
  ai_allowed = excluded.ai_allowed,
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
  'GATE_P0_12_HEU_OS_VISUAL_NAVIGATION_MAP',
  'P0-12 HEU OS Visual Navigation Map',
  'GO_LIVE',
  'HEU_OS',
  'VISUAL_NAVIGATION_MAP',
  'BGH + IT_DATA + PHAP_CHE',
  'Kiem tra cac o dieu huong co dung module, dung pham vi, dung doi tuong tuyen sinh va khong mo nham du lieu nhay cam.',
  'Chi phe duyet khi user co the bam vao dung module, khong bi tron doi tuong tuyen sinh, HOU, TTGDTX, ngan han hay doi tac.',
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
  updated_at = now();
