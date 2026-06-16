-- Step 55 - P0-16 Data & Process Ownership Matrix.
-- Run after step54_admission_object_field_schema.sql.
-- Purpose: make every process explicit: who enters data, who checks, who approves,
-- who can view, where the source data lives, and what evidence/audit is required.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('process_ownership.read'),
    ('process_ownership.manage')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('process_ownership.read')
) as p(permission)
where r.code in (
  'BGH',
  'ADMISSION_HEAD',
  'TEAM_LEAD',
  'CTHSSV_LEAD',
  'ACCOUNTING_LEAD',
  'LEGAL',
  'AUDIT',
  'HOU_OPERATOR'
)
on conflict (role_id, permission) do nothing;

create table if not exists public.process_ownership_matrix (
  id uuid primary key default gen_random_uuid(),
  ownership_code text not null unique,
  process_name text not null,
  module_code text not null references public.heu_os_modules(module_code),
  workflow_code text references public.heu_os_workflows(workflow_code),
  entity_type text not null default 'PROCESS',
  source_table text not null,
  owner_department text not null,
  maker_role text not null,
  checker_role text,
  approver_role text,
  viewer_scope text not null default 'ROLE_AND_SCOPE',
  handover_from_department text,
  handover_to_department text,
  required_evidence text,
  audit_rule text not null default 'Moi tao/sua/kiem/duyet phai ghi audit log.',
  sla_hours int,
  risk_level text not null default 'MEDIUM',
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint process_ownership_matrix_risk_valid check (
    risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
  ),
  constraint process_ownership_matrix_scope_valid check (
    viewer_scope in ('OWN', 'TEAM', 'DEPARTMENT', 'ROLE_AND_SCOPE', 'ALL_AUTHORIZED', 'RESTRICTED')
  ),
  constraint process_ownership_matrix_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create index if not exists idx_process_ownership_matrix_module
on public.process_ownership_matrix(module_code, risk_level, control_status)
where status = 'ACTIVE';

create index if not exists idx_process_ownership_matrix_workflow
on public.process_ownership_matrix(workflow_code)
where status = 'ACTIVE';

alter table public.process_ownership_matrix enable row level security;

create or replace function public.can_read_process_ownership_matrix()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('process_ownership.read')
    or public.has_permission('process_ownership.manage')
    or public.can_read_master_control()
$$;

create or replace function public.can_manage_process_ownership_matrix()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('process_ownership.manage')
    or public.can_manage_master_control()
$$;

grant execute on function public.can_read_process_ownership_matrix() to authenticated;
grant execute on function public.can_manage_process_ownership_matrix() to authenticated;

drop policy if exists "process_ownership_matrix_select"
on public.process_ownership_matrix;
create policy "process_ownership_matrix_select"
on public.process_ownership_matrix for select
to authenticated
using (public.can_read_process_ownership_matrix());

drop policy if exists "process_ownership_matrix_manage"
on public.process_ownership_matrix;
create policy "process_ownership_matrix_manage"
on public.process_ownership_matrix for all
to authenticated
using (public.can_manage_process_ownership_matrix())
with check (public.can_manage_process_ownership_matrix());

drop trigger if exists trg_process_ownership_matrix_updated_at
on public.process_ownership_matrix;
create trigger trg_process_ownership_matrix_updated_at
before update on public.process_ownership_matrix
for each row execute function public.set_updated_at();

drop trigger if exists trg_process_ownership_matrix_audit
on public.process_ownership_matrix;
create trigger trg_process_ownership_matrix_audit
after insert or update or delete on public.process_ownership_matrix
for each row execute function public.write_audit_log();

create or replace view public.process_ownership_matrix_status
with (security_invoker = true)
as
select
  pom.id,
  pom.ownership_code,
  pom.process_name,
  pom.module_code,
  m.module_name,
  pom.workflow_code,
  w.workflow_name,
  pom.entity_type,
  pom.source_table,
  pom.owner_department,
  pom.maker_role,
  pom.checker_role,
  pom.approver_role,
  pom.viewer_scope,
  pom.handover_from_department,
  pom.handover_to_department,
  pom.required_evidence,
  pom.audit_rule,
  pom.sla_hours,
  pom.risk_level,
  pom.control_status,
  pom.created_at,
  pom.updated_at,
  array_remove(array[
    case when pom.owner_department is null or length(trim(pom.owner_department)) = 0 then 'MISSING_OWNER' end,
    case when pom.maker_role is null or length(trim(pom.maker_role)) = 0 then 'MISSING_MAKER' end,
    case when pom.checker_role is null or length(trim(pom.checker_role)) = 0 then 'MISSING_CHECKER' end,
    case when pom.risk_level in ('HIGH', 'CRITICAL') and (pom.approver_role is null or length(trim(pom.approver_role)) = 0) then 'HIGH_RISK_MISSING_APPROVER' end,
    case when pom.viewer_scope is null or length(trim(pom.viewer_scope)) = 0 then 'MISSING_VIEWER_SCOPE' end,
    case when pom.source_table is null or length(trim(pom.source_table)) = 0 then 'MISSING_SOURCE_TABLE' end,
    case when pom.required_evidence is null or length(trim(pom.required_evidence)) = 0 then 'MISSING_EVIDENCE_RULE' end,
    case when pom.audit_rule is null or length(trim(pom.audit_rule)) = 0 then 'MISSING_AUDIT_RULE' end,
    case when pom.handover_to_department is null and pom.module_code in ('M06_HSSV_HANDOVER', 'M08_FINANCE_ACCOUNTING', 'M10_HOU_LINKAGE') then 'MISSING_HANDOVER_TARGET' end,
    case when pom.control_status in ('CAN_SUA', 'CHUA_DU_DIEU_KIEN') then 'CONTROL_NOT_READY' end
  ], null) as control_flags,
  case
    when pom.owner_department is null or length(trim(pom.owner_department)) = 0 then 'BLOCKED'
    when pom.maker_role is null or length(trim(pom.maker_role)) = 0 then 'BLOCKED'
    when pom.source_table is null or length(trim(pom.source_table)) = 0 then 'BLOCKED'
    when pom.risk_level in ('HIGH', 'CRITICAL') and (pom.approver_role is null or length(trim(pom.approver_role)) = 0) then 'BLOCKED'
    when pom.checker_role is null or length(trim(pom.checker_role)) = 0 then 'NEEDS_FIX'
    when pom.required_evidence is null or length(trim(pom.required_evidence)) = 0 then 'NEEDS_FIX'
    when pom.audit_rule is null or length(trim(pom.audit_rule)) = 0 then 'NEEDS_FIX'
    when pom.control_status in ('CAN_SUA', 'CHUA_DU_DIEU_KIEN') then 'NEEDS_FIX'
    when pom.control_status = 'DAT' then 'READY'
    else 'TEMP_READY'
  end as ownership_status
from public.process_ownership_matrix pom
join public.heu_os_modules m on m.module_code = pom.module_code
left join public.heu_os_workflows w on w.workflow_code = pom.workflow_code
where pom.status = 'ACTIVE'
  and public.can_read_process_ownership_matrix();

grant select on public.process_ownership_matrix_status to authenticated;

create or replace view public.process_ownership_matrix_summary
with (security_invoker = true)
as
select
  count(*)::int as process_count,
  count(*) filter (where ownership_status = 'READY')::int as ready_count,
  count(*) filter (where ownership_status = 'TEMP_READY')::int as temp_ready_count,
  count(*) filter (where ownership_status = 'NEEDS_FIX')::int as needs_fix_count,
  count(*) filter (where ownership_status = 'BLOCKED')::int as blocked_count,
  count(*) filter (where risk_level in ('HIGH', 'CRITICAL'))::int as high_risk_count,
  count(*) filter (where approver_role is null or length(trim(approver_role)) = 0)::int as missing_approver_count
from public.process_ownership_matrix_status;

grant select on public.process_ownership_matrix_summary to authenticated;

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
) values
  (
    'POM_MASTER_CONTROL_CHANGE',
    'Thay doi Master Control va rule he thong',
    'M00_MASTER_CONTROL',
    null,
    'CONTROL',
    'legal_registry,sop_registry,data_dictionary_tables,decision_gates',
    'BGH + IT_DATA',
    'IT_DATA',
    'PHAP_CHE + AUDIT',
    'BGH',
    'RESTRICTED',
    'IT_DATA',
    'BGH',
    'Can cu phap ly/SOP/minh chung thay doi neu co',
    'Moi thay doi Master Control phai co audit log va decision gate khi go-live.',
    72,
    'CRITICAL',
    'DAT_TAM_THOI'
  ),
  (
    'POM_USER_SCOPE_PERMISSION',
    'Tao user, gan phong ban, quan ly truc tiep va pham vi lam viec',
    'M01_IDENTITY_SCOPE',
    null,
    'USER_SCOPE',
    'users_profile,user_admission_segment_scopes,user_partner_scopes',
    'IT_DATA + TRUONG_PHONG',
    'IT_DATA',
    'TRUONG_PHONG',
    'BGH',
    'RESTRICTED',
    'TRUONG_PHONG',
    'NHAN_SU_DUOC_PHAN',
    'De nghi tao user/phan quyen, phong ban, nguoi quan ly truc tiep',
    'Tao/sua user, role, scope va uy quyen phai ghi audit log.',
    24,
    'CRITICAL',
    'DAT_TAM_THOI'
  ),
  (
    'POM_ADMISSION_WORKSPACE',
    'Chon doi tuong tuyen sinh va workspace lam viec',
    'M05_ADMISSION_CRM',
    null,
    'ADMISSION_WORKSPACE',
    'admission_segments,user_admission_workspace_preferences',
    'TUYEN_SINH + IT_DATA',
    'TUYEN_SINH',
    'TRUONG_PHONG_TUYEN_SINH',
    'BGH',
    'ROLE_AND_SCOPE',
    'TUYEN_SINH',
    'TUYEN_SINH',
    'User phai duoc phan scope doi tuong truoc khi tao/import lead',
    'Moi thao tac workspace va lead phai theo scope va ghi audit neu thay doi du lieu.',
    24,
    'HIGH',
    'DAT_TAM_THOI'
  ),
  (
    'POM_LEAD_CREATE_IMPORT',
    'Tao lead va import lead theo dung doi tuong tuyen sinh',
    'M05_ADMISSION_CRM',
    'WF_P0_14_WORKSPACE_GUARDED_LEAD_WRITE',
    'LEAD',
    'leads,lead_sources,partners,campaigns',
    'TUYEN_SINH',
    'TUYEN_SINH',
    'TRUONG_PHONG_TUYEN_SINH',
    'BGH',
    'ROLE_AND_SCOPE',
    'MARKETING/DOI_TAC/CTV',
    'TUYEN_SINH',
    'File import, nguon lead, doi tac/campaign neu co',
    'Tao/import lead phai ghi nguoi tao, doi tuong, nguon va audit khi sua.',
    24,
    'HIGH',
    'DAT_TAM_THOI'
  ),
  (
    'POM_ADMISSION_PROGRAM_MAJOR_RULE',
    'Loc he dao tao va nganh theo doi tuong tuyen sinh',
    'M05_ADMISSION_CRM',
    'WF_P0_15_ADMISSION_OBJECT_FIELD_SCHEMA',
    'ADMISSION_FIELD_SCHEMA',
    'admission_segment_program_rules,admission_programs,admission_majors',
    'TUYEN_SINH + DAO_TAO + IT_DATA',
    'IT_DATA',
    'DAO_TAO + TRUONG_PHONG_TUYEN_SINH',
    'BGH',
    'ROLE_AND_SCOPE',
    'DAO_TAO',
    'TUYEN_SINH',
    'Danh muc he/nganh duoc phe duyet theo tung doi tuong tuyen sinh',
    'Sai he/nganh theo doi tuong phai bi chan o form va server.',
    72,
    'HIGH',
    'DAT_TAM_THOI'
  ),
  (
    'POM_DOCUMENT_CHECKLIST',
    'Kiem tra ho so nhap hoc va dieu kien du ho so',
    'M06_HSSV_HANDOVER',
    'WF_CTHSSV_HANDOVER',
    'DOCUMENT',
    'lead_documents,enrollment_checklists',
    'CTHSSV + TUYEN_SINH',
    'TUYEN_SINH/CTHSSV',
    'CTHSSV_LEAD',
    'BGH',
    'ROLE_AND_SCOPE',
    'TUYEN_SINH',
    'CTHSSV',
    'Checklist ho so bat buoc, anh/link minh chung neu co',
    'Cap nhat ho so phai giu thong tin dung, chi bao loi tai truong sai.',
    48,
    'HIGH',
    'DAT_TAM_THOI'
  ),
  (
    'POM_HSSV_HANDOVER',
    'Ban giao lead du dieu kien sang CTHSSV',
    'M06_HSSV_HANDOVER',
    'WF_CTHSSV_HANDOVER',
    'HANDOVER',
    'leads,lead_documents,student_records',
    'TUYEN_SINH + CTHSSV',
    'TUYEN_SINH',
    'CTHSSV_LEAD',
    'BGH',
    'ROLE_AND_SCOPE',
    'TUYEN_SINH',
    'CTHSSV',
    'Ho so bat buoc da du, trang thai lead du dieu kien, log tu van',
    'Ban giao phai co nguoi giao, nguoi nhan, thoi diem va trang thai xu ly.',
    48,
    'HIGH',
    'DAT_TAM_THOI'
  ),
  (
    'POM_FINANCE_RECEIVABLE',
    'Ban giao ke toan theo doi hoc phi, cong no va chung tu',
    'M08_FINANCE_ACCOUNTING',
    'WF_FINANCE_COLLECTION',
    'FINANCE',
    'payments,tuition_receivables,commission_claims',
    'KHTC',
    'KE_TOAN',
    'ACCOUNTING_LEAD',
    'BGH',
    'RESTRICTED',
    'TUYEN_SINH/CTHSSV',
    'KHTC',
    'Phieu thu, chung tu ngan hang, bang doi soat hoc phi/cong no',
    'Tai chinh phai co chung tu, nguoi xac nhan, khong sua tay khong log.',
    48,
    'CRITICAL',
    'DAT_TAM_THOI'
  ),
  (
    'POM_HOU_COM_CONTROL',
    'De nghi, doi soat va chi COM HOU',
    'M10_HOU_LINKAGE',
    'WF_COM_APPROVAL',
    'HOU_COM',
    'hou_commission_claims,hou_commission_payment_batches',
    'KHTC + TUYEN_SINH + BGH',
    'TUYEN_SINH',
    'ACCOUNTING_LEAD',
    'BGH',
    'RESTRICTED',
    'TUYEN_SINH',
    'KHTC',
    'Hoc phi ky dau, minh chung HOU, cong no, rui ro bo hoc, chinh sach COM hieu luc',
    'Khong chi COM hai lan; moi ky thanh toan phai co duyet va chung tu ke toan.',
    72,
    'CRITICAL',
    'DAT_TAM_THOI'
  ),
  (
    'POM_PARTNER_CONTRACT_COM',
    'Quan ly doi tac/CTV, hop dong va chinh sach COM',
    'M09_PARTNER_CONTRACT',
    null,
    'PARTNER_COM',
    'partners,partner_contracts,commission_policies',
    'TUYEN_SINH + PHAP_CHE + KHTC',
    'TUYEN_SINH',
    'PHAP_CHE + ACCOUNTING_LEAD',
    'BGH',
    'RESTRICTED',
    'DOI_TAC/CTV',
    'TUYEN_SINH + KHTC',
    'Hop dong, phu luc COM, thoi diem hieu luc, bang doi soat nguon',
    'Doi tac/CTV phai co ma, scope, hop dong/chinh sach ro truoc khi tinh COM.',
    72,
    'HIGH',
    'DAT_TAM_THOI'
  ),
  (
    'POM_AI_ASSISTANT_SCOPE',
    'AI chi ho tro trong pham vi duoc phep',
    'M20_AI_ASSISTANT',
    'WF_AI_AGENT_ENABLE',
    'AI_ASSISTANT',
    'permission_registry,data_dictionary_tables,data_dictionary_fields',
    'BGH + IT_DATA',
    'AI_ASSISTANT',
    'IT_DATA + PHAP_CHE',
    'BGH',
    'RESTRICTED',
    'CAC_MODULE_NGHIEP_VU',
    'NGUOI_DUNG',
    'Danh muc du lieu AI duoc doc, quyen user, log cau hoi/tra loi',
    'AI khong duoc duyet, khong duoc sua du lieu goc, khong doc du lieu ngoai pham vi user.',
    24,
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
  'WF_P0_16_PROCESS_OWNERSHIP_MATRIX',
  'Ma tran so huu du lieu va quy trinh',
  'M00_MASTER_CONTROL',
  'BGH/IT Data can biet moi viec ai nhap, ai kiem, ai duyet va ban giao sang phong nao.',
  'IT_DATA',
  'BGH + IT_DATA',
  'PHAP_CHE + AUDIT',
  'BGH',
  'Moi quy trinh co owner, maker, checker, approver, viewer scope, source table, evidence va audit rule.',
  'Khi them module/quy trinh moi phai them dong process_ownership_matrix truoc khi go-live.',
  'Moi thay doi process_ownership_matrix phai ghi audit log.',
  516,
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

insert into public.heu_os_approval_matrix (
  approval_code,
  module_code,
  workflow_code,
  decision_name,
  decision_level,
  maker_role,
  checker_role,
  approver_role,
  required_evidence,
  blocking_rule,
  sla_hours,
  control_status
) values (
  'APPROVAL_P0_16_PROCESS_OWNERSHIP_MATRIX',
  'M00_MASTER_CONTROL',
  'WF_P0_16_PROCESS_OWNERSHIP_MATRIX',
  'Duyet ma tran so huu du lieu va quy trinh',
  'BGH',
  'IT_DATA',
  'PHAP_CHE + AUDIT',
  'BGH',
  'Bang ma tran co day du owner, nguoi nhap, nguoi kiem, nguoi duyet, viewer scope va audit rule.',
  'Khong go-live module/quy trinh moi neu chua co dong ownership hoac thieu nguoi duyet cho quy trinh rui ro cao.',
  72,
  'DAT_TAM_THOI'
) on conflict (approval_code) do update set
  module_code = excluded.module_code,
  workflow_code = excluded.workflow_code,
  decision_name = excluded.decision_name,
  decision_level = excluded.decision_level,
  maker_role = excluded.maker_role,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  required_evidence = excluded.required_evidence,
  blocking_rule = excluded.blocking_rule,
  sla_hours = excluded.sla_hours,
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
  'P0_16_PROCESS_OWNERSHIP_MATRIX',
  'P0-16 Process Ownership Matrix',
  'M00_MASTER_CONTROL',
  'process_ownership_matrix',
  'MASTER',
  'BGH + IT_DATA',
  'HEU_OS',
  'RESTRICTED',
  false,
  'Moi quy trinh/module moi phai khai bao ownership truoc khi production; thay doi phai co audit va decision gate.',
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
  'RISK_P0_16_UNCLEAR_PROCESS_OWNER',
  'Khong ro ai nhap, ai kiem, ai duyet',
  'M00_MASTER_CONTROL',
  'GOVERNANCE',
  'CRITICAL',
  'BGH + IT_DATA + AUDIT',
  'Neu quy trinh khong ro nguoi nhap/kiem/duyet, he thong se phu thuoc tri nho ca nhan va rat de sai luat/sai du lieu.',
  'Moi quy trinh production phai co dong process_ownership_matrix va khong duoc rui ro cao khi thieu approver.',
  'Bao BGH va khoa go-live/AI automation neu ownership_status la BLOCKED.',
  'So quy trinh BLOCKED/NEEDS_FIX trong process ownership matrix',
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
  'NAV_PROCESS_OWNERSHIP_P0_16',
  'Ma tran trach nhiem P0-16',
  'CONTROL',
  'M00_MASTER_CONTROL',
  '/master-control',
  'Ai nhap, ai kiem, ai duyet, ai xem, du lieu goc o dau va ban giao sang phong nao.',
  'BGH + IT_DATA',
  'Kiem tra ownership',
  16,
  true,
  'Can xem neu co quy trinh BLOCKED, thieu checker/approver/evidence/audit rule.',
  'DAT_TAM_THOI'
) on conflict (node_code) do update set
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
  'PROCESS_OWNERSHIP_MATRIX',
  'Process Ownership Matrix',
  'M00_MASTER_CONTROL',
  'MASTER',
  'BGH + IT_DATA',
  'Ma tran xac dinh ai nhap, ai kiem, ai duyet, ai xem, source table, evidence, audit va ban giao.',
  'RESTRICTED',
  false,
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
  'GATE_P0_16_PROCESS_OWNERSHIP_MATRIX',
  'P0-16 Process Ownership Matrix',
  'GO_LIVE',
  'HEU_OS',
  'PROCESS_OWNERSHIP_MATRIX',
  'BGH + IT_DATA + PHAP_CHE + AUDIT',
  'Kiem tra tung quy trinh co owner, maker, checker, approver, source table, viewer scope, evidence va audit rule.',
  'Chi duyet khi khong con quy trinh BLOCKED va cac quy trinh rui ro cao deu co nguoi duyet ro rang.',
  'DRAFT'
) on conflict (gate_code) do update set
  gate_name = excluded.gate_name,
  gate_type = excluded.gate_type,
  entity_type = excluded.entity_type,
  entity_code = excluded.entity_code,
  owner_department = excluded.owner_department,
  checker_note = excluded.checker_note,
  approver_note = excluded.approver_note,
  updated_at = now();
