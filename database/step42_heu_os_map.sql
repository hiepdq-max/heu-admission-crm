-- Step 42 - P0-02 HEU OS operating map.
-- Run after step41_master_control.sql.
-- Purpose: map HEU ERP/AI OS modules, workflows, approval matrix,
-- master data ownership, and compliance/finance/operation risks.

create table if not exists public.heu_os_modules (
  id uuid primary key default gen_random_uuid(),
  module_code text not null unique,
  module_name text not null,
  module_group text not null,
  objective text not null,
  owner_department text not null,
  core_policy text not null,
  ai_policy text not null default 'AI chi duoc ho tro nhap, kiem tra va canh bao; khong tu phe duyet.',
  sort_order int not null default 0,
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_os_modules_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.heu_os_workflows (
  id uuid primary key default gen_random_uuid(),
  workflow_code text not null unique,
  workflow_name text not null,
  module_code text not null references public.heu_os_modules(module_code),
  trigger_event text not null,
  start_role text not null,
  owner_department text not null,
  checker_role text,
  approver_role text,
  output_result text not null,
  handover_rule text,
  audit_rule text not null default 'Moi tao/sua/duyet/huy phai ghi audit log.',
  sort_order int not null default 0,
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_os_workflows_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.heu_os_approval_matrix (
  id uuid primary key default gen_random_uuid(),
  approval_code text not null unique,
  module_code text not null references public.heu_os_modules(module_code),
  workflow_code text references public.heu_os_workflows(workflow_code),
  decision_name text not null,
  decision_level text not null default 'DEPARTMENT',
  maker_role text not null,
  checker_role text,
  approver_role text not null,
  required_evidence text not null,
  blocking_rule text not null,
  sla_hours int,
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_os_approval_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.heu_os_master_data_map (
  id uuid primary key default gen_random_uuid(),
  data_code text not null unique,
  data_name text not null,
  module_code text not null references public.heu_os_modules(module_code),
  source_table text not null,
  data_type text not null default 'MASTER',
  owner_department text not null,
  system_of_record text not null default 'HEU_OS',
  sensitivity_level text not null default 'INTERNAL',
  ai_allowed boolean not null default false,
  change_rule text not null,
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_os_master_data_type_valid check (
    data_type in ('MASTER', 'TRANSACTION', 'REPORT_VIEW', 'CONFIG', 'EVIDENCE')
  ),
  constraint heu_os_master_data_sensitivity_valid check (
    sensitivity_level in ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'SECRET')
  ),
  constraint heu_os_master_data_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.heu_os_risk_controls (
  id uuid primary key default gen_random_uuid(),
  risk_code text not null unique,
  risk_name text not null,
  module_code text not null references public.heu_os_modules(module_code),
  risk_group text not null,
  severity text not null default 'MEDIUM',
  owner_department text not null,
  risk_description text not null,
  control_rule text not null,
  escalation_rule text not null,
  dashboard_metric text,
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_os_risk_severity_valid check (
    severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
  ),
  constraint heu_os_risk_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create index if not exists idx_heu_os_modules_group
on public.heu_os_modules(module_group, control_status)
where status = 'ACTIVE';

create index if not exists idx_heu_os_workflows_module
on public.heu_os_workflows(module_code, control_status)
where status = 'ACTIVE';

create index if not exists idx_heu_os_approval_module
on public.heu_os_approval_matrix(module_code, workflow_code, control_status)
where status = 'ACTIVE';

create index if not exists idx_heu_os_master_data_module
on public.heu_os_master_data_map(module_code, data_type, sensitivity_level)
where status = 'ACTIVE';

create index if not exists idx_heu_os_risk_module
on public.heu_os_risk_controls(module_code, severity, control_status)
where status = 'ACTIVE';

alter table public.heu_os_modules enable row level security;
alter table public.heu_os_workflows enable row level security;
alter table public.heu_os_approval_matrix enable row level security;
alter table public.heu_os_master_data_map enable row level security;
alter table public.heu_os_risk_controls enable row level security;

drop policy if exists "heu_os_modules_select_master_control" on public.heu_os_modules;
create policy "heu_os_modules_select_master_control"
on public.heu_os_modules for select
to authenticated
using (public.can_read_master_control());

drop policy if exists "heu_os_modules_manage_master_control" on public.heu_os_modules;
create policy "heu_os_modules_manage_master_control"
on public.heu_os_modules for all
to authenticated
using (public.can_manage_master_control())
with check (public.can_manage_master_control());

drop policy if exists "heu_os_workflows_select_master_control" on public.heu_os_workflows;
create policy "heu_os_workflows_select_master_control"
on public.heu_os_workflows for select
to authenticated
using (public.can_read_master_control());

drop policy if exists "heu_os_workflows_manage_master_control" on public.heu_os_workflows;
create policy "heu_os_workflows_manage_master_control"
on public.heu_os_workflows for all
to authenticated
using (public.can_manage_master_control())
with check (public.can_manage_master_control());

drop policy if exists "heu_os_approval_select_master_control" on public.heu_os_approval_matrix;
create policy "heu_os_approval_select_master_control"
on public.heu_os_approval_matrix for select
to authenticated
using (public.can_read_master_control());

drop policy if exists "heu_os_approval_manage_master_control" on public.heu_os_approval_matrix;
create policy "heu_os_approval_manage_master_control"
on public.heu_os_approval_matrix for all
to authenticated
using (public.can_manage_master_control())
with check (public.can_manage_master_control());

drop policy if exists "heu_os_master_data_select_master_control" on public.heu_os_master_data_map;
create policy "heu_os_master_data_select_master_control"
on public.heu_os_master_data_map for select
to authenticated
using (public.can_read_master_control());

drop policy if exists "heu_os_master_data_manage_master_control" on public.heu_os_master_data_map;
create policy "heu_os_master_data_manage_master_control"
on public.heu_os_master_data_map for all
to authenticated
using (public.can_manage_master_control())
with check (public.can_manage_master_control());

drop policy if exists "heu_os_risk_select_master_control" on public.heu_os_risk_controls;
create policy "heu_os_risk_select_master_control"
on public.heu_os_risk_controls for select
to authenticated
using (public.can_read_master_control());

drop policy if exists "heu_os_risk_manage_master_control" on public.heu_os_risk_controls;
create policy "heu_os_risk_manage_master_control"
on public.heu_os_risk_controls for all
to authenticated
using (public.can_manage_master_control())
with check (public.can_manage_master_control());

drop trigger if exists trg_heu_os_modules_updated_at on public.heu_os_modules;
create trigger trg_heu_os_modules_updated_at
before update on public.heu_os_modules
for each row execute function public.set_updated_at();

drop trigger if exists trg_heu_os_workflows_updated_at on public.heu_os_workflows;
create trigger trg_heu_os_workflows_updated_at
before update on public.heu_os_workflows
for each row execute function public.set_updated_at();

drop trigger if exists trg_heu_os_approval_updated_at on public.heu_os_approval_matrix;
create trigger trg_heu_os_approval_updated_at
before update on public.heu_os_approval_matrix
for each row execute function public.set_updated_at();

drop trigger if exists trg_heu_os_master_data_updated_at on public.heu_os_master_data_map;
create trigger trg_heu_os_master_data_updated_at
before update on public.heu_os_master_data_map
for each row execute function public.set_updated_at();

drop trigger if exists trg_heu_os_risk_updated_at on public.heu_os_risk_controls;
create trigger trg_heu_os_risk_updated_at
before update on public.heu_os_risk_controls
for each row execute function public.set_updated_at();

drop trigger if exists trg_heu_os_modules_audit on public.heu_os_modules;
create trigger trg_heu_os_modules_audit
after insert or update or delete on public.heu_os_modules
for each row execute function public.write_audit_log();

drop trigger if exists trg_heu_os_workflows_audit on public.heu_os_workflows;
create trigger trg_heu_os_workflows_audit
after insert or update or delete on public.heu_os_workflows
for each row execute function public.write_audit_log();

drop trigger if exists trg_heu_os_approval_audit on public.heu_os_approval_matrix;
create trigger trg_heu_os_approval_audit
after insert or update or delete on public.heu_os_approval_matrix
for each row execute function public.write_audit_log();

drop trigger if exists trg_heu_os_master_data_audit on public.heu_os_master_data_map;
create trigger trg_heu_os_master_data_audit
after insert or update or delete on public.heu_os_master_data_map
for each row execute function public.write_audit_log();

drop trigger if exists trg_heu_os_risk_audit on public.heu_os_risk_controls;
create trigger trg_heu_os_risk_audit
after insert or update or delete on public.heu_os_risk_controls
for each row execute function public.write_audit_log();

insert into public.heu_os_modules (
  module_code,
  module_name,
  module_group,
  objective,
  owner_department,
  core_policy,
  ai_policy,
  sort_order,
  control_status
) values
  (
    'M00_MASTER_CONTROL',
    'Master Control',
    'CONTROL',
    'Quan tri can cu phap ly, SOP, data dictionary, approval gate va ban do HEU OS.',
    'BGH + PHAP_CHE + IT_DATA',
    'Moi module production phai co owner, legal/SOP/data/control va gate neu co phe duyet.',
    'AI chi duoc doc phan duoc phep, goi y/kiem tra/canh bao; khong tu thay doi master data.',
    10,
    'DAT_TAM_THOI'
  ),
  (
    'M01_IDENTITY_SCOPE',
    'Nguoi dung, vai tro va pham vi',
    'CONTROL',
    'Quan ly user, phong ban, vai tro, quan ly truc tiep va pham vi doi tuong/doi tac duoc lam viec.',
    'ADMIN + TRUONG_PHONG',
    'User chi nhin va thao tac trong phong ban, doi tuong tuyen sinh va doi tac duoc phan.',
    'AI khong duoc tiet lo du lieu ngoai pham vi user.',
    20,
    'DAT_TAM_THOI'
  ),
  (
    'M05_ADMISSION_CRM',
    'CRM tuyen sinh',
    'CORE_OPERATION',
    'Quan ly lead theo doi tuong tuyen sinh, nguon, doi tac, tu van, pipeline va follow-up.',
    'TUYEN_SINH',
    'Lead phai gan dung doi tuong tuyen sinh; moi chuyen trang thai quan trong phai qua rule.',
    'AI duoc goi y noi dung tu van va canh bao thieu thong tin, khong tu chuyen trang thai.',
    50,
    'DAT_TAM_THOI'
  ),
  (
    'M06_HSSV_HANDOVER',
    'CTHSSV va ho so nhap hoc',
    'CORE_OPERATION',
    'Nhan ban giao ho so du dieu kien, kiem tra giay to va theo doi trang thai hoc sinh.',
    'CTHSSV',
    'Chi tiep nhan khi ho so bat buoc dat dieu kien va co log ban giao tu tuyen sinh.',
    'AI duoc kiem tra checklist, phat hien thieu/khong khop; khong tu xac nhan du dieu kien.',
    60,
    'DAT_TAM_THOI'
  ),
  (
    'M07_TRAINING',
    'Dao tao va lop hoc',
    'CORE_OPERATION',
    'Quan ly chuong trinh, nganh, lop, lich hoc, mo lop va thay doi hoc tap.',
    'DAO_TAO',
    'Mo lop/chuyen lop/chuyen nganh phai co dieu kien, ho so va nguoi duyet ro rang.',
    'AI duoc goi y xep lop/lich, khong tu ra quyet dinh dao tao.',
    70,
    'CHUA_DU_DIEU_KIEN'
  ),
  (
    'M08_FINANCE_ACCOUNTING',
    'Ke toan, hoc phi, cong no va COM',
    'FINANCE',
    'Theo doi hoc phi, cong no, thu chi, doi soat COM va chung tu ke toan.',
    'KHTC',
    'Khong chi COM hai lan; moi chi tra phai co du dieu kien, ky, nguoi duyet va chung tu.',
    'AI chi canh bao rui ro, tinh nhap/du kien; khong tu tao lenh chi tien.',
    80,
    'DAT_TAM_THOI'
  ),
  (
    'M09_PARTNER_CONTRACT',
    'Doi tac, CTV va hop dong',
    'CORE_OPERATION',
    'Quan ly TTGDTX, CTV, doanh nghiep, dai hoc lien ket, hop dong va chinh sach hieu luc.',
    'TUYEN_SINH + PHAP_CHE + KHTC',
    'Nguon/doi tac/COM phai gan hop dong hoac chinh sach hieu luc theo thoi diem.',
    'AI duoc soat dieu khoan va canh bao thieu hop dong, khong tu ket luan phap ly.',
    90,
    'DAT_TAM_THOI'
  ),
  (
    'M10_HOU_LINKAGE',
    'Lien thong dai hoc HOU',
    'SPECIAL_PROGRAM',
    'Quan ly chuong trinh HOU, ho so, hoc phi ky dau, COM HOU, ty le hop tac va rui ro bo hoc.',
    'TUYEN_SINH + PHAP_CHE + KHTC',
    'Ty le/chinh sach COM/HOU co hieu luc theo moc thoi gian; thong tin nhay cam chi role duoc phep xem.',
    'AI chi duoc doc phan khong bi han che; khong hien ty le hop tac cho user khong co quyen.',
    100,
    'DAT_TAM_THOI'
  ),
  (
    'M20_AI_ASSISTANT',
    'AI Assistant va automation',
    'AI_CONTROL',
    'Ho tro nhap lieu, kiem tra, soan thao, canh bao va goi y quy trinh theo quyen user.',
    'IT_DATA + PHAP_CHE + BGH',
    'AI agent chi duoc bat sau khi co legal/SOP/data scope/prompt log/approval gate.',
    'AI khong thay nguoi duyet; moi output quan trong phai co human review.',
    200,
    'CHUA_DU_DIEU_KIEN'
  )
on conflict (module_code) do update set
  module_name = excluded.module_name,
  module_group = excluded.module_group,
  objective = excluded.objective,
  owner_department = excluded.owner_department,
  core_policy = excluded.core_policy,
  ai_policy = excluded.ai_policy,
  sort_order = excluded.sort_order,
  control_status = excluded.control_status,
  status = 'ACTIVE',
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
) values
  (
    'WF_LEAD_TO_ENROLLMENT',
    'Lead tuyen sinh den nhap hoc',
    'M05_ADMISSION_CRM',
    'Co lead moi hoac import danh sach tu doi tuong tuyen sinh',
    'COUNSELOR',
    'TUYEN_SINH',
    'TEAM_LEAD',
    'TRUONG_PHONG_TUYEN_SINH',
    'Lead du dieu kien ban giao CTHSSV hoac mat lead co ly do',
    'Ban giao sang CTHSSV khi ho so bat buoc va trang thai dat dieu kien.',
    'Log tao lead, sua lead, tu van, cap nhat trang thai va ban giao.',
    10,
    'DAT_TAM_THOI'
  ),
  (
    'WF_CTHSSV_HANDOVER',
    'Ban giao ho so sang CTHSSV',
    'M06_HSSV_HANDOVER',
    'Lead da du dieu kien ho so nhap hoc',
    'COUNSELOR',
    'CTHSSV',
    'CTHSSV_STAFF',
    'CTHSSV_LEAD',
    'Ho so duoc tiep nhan hoac tra ve bo sung',
    'CTHSSV chap nhan/tu choi phai ghi ly do.',
    'Log nguoi ban giao, nguoi tiep nhan, thoi diem va ghi chu.',
    20,
    'DAT_TAM_THOI'
  ),
  (
    'WF_FINANCE_COLLECTION',
    'Thu hoc phi va theo doi cong no',
    'M08_FINANCE_ACCOUNTING',
    'Hoc sinh co nghia vu hoc phi hoac ky thanh toan',
    'ACCOUNTING_STAFF',
    'KHTC',
    'ACCOUNTING_LEAD',
    'KE_TOAN_TRUONG',
    'Ghi nhan thu, cong no, chung tu va trang thai thanh toan',
    'Thong tin tai chinh chi hien cho nguoi duoc phan quyen.',
    'Log moi giao dich, thay doi cong no, chung tu va nguoi duyet.',
    30,
    'DAT_TAM_THOI'
  ),
  (
    'WF_COM_APPROVAL',
    'De nghi va duyet COM',
    'M08_FINANCE_ACCOUNTING',
    'Lead/nguoi hoc dat dieu kien COM theo chinh sach hieu luc',
    'COUNSELOR_OR_PARTNER_OWNER',
    'KHTC',
    'ACCOUNTING_LEAD',
    'KE_TOAN_TRUONG_OR_BGH',
    'COM duoc phe duyet, tam treo hoac tu choi',
    'Khong chi COM neu thieu dieu kien, trung nguon, trung ky hoac thieu chung tu.',
    'Log claim, phe duyet, ky thanh toan, so chung tu va trang thai chi.',
    40,
    'DAT_TAM_THOI'
  ),
  (
    'WF_HOU_OPERATION',
    'Van hanh lien thong HOU',
    'M10_HOU_LINKAGE',
    'Lead thuoc doi tuong lien thong dai hoc HOU',
    'COUNSELOR',
    'TUYEN_SINH + KHTC',
    'HOU_OPERATOR',
    'TRUONG_PHONG_TUYEN_SINH_OR_BGH',
    'Ghi nhan he HOU, nganh, dia diem, hoc phi ky dau, ho so va COM',
    'Chi tao COM HOU khi du dieu kien HOU va tai chinh.',
    'Log moi thay doi HOU stage, hoc phi, ho so, minh chung va COM.',
    50,
    'DAT_TAM_THOI'
  ),
  (
    'WF_AI_AGENT_ENABLE',
    'Bat AI agent production',
    'M20_AI_ASSISTANT',
    'Can bat AI cho mot module/quy trinh',
    'IT_DATA',
    'IT_DATA + PHAP_CHE',
    'AUDIT_PHAP_CHE',
    'BGH',
    'AI agent duoc phep chay hoac bi chan',
    'Chi bat khi co data scope, prompt log, legal/SOP va human approval.',
    'Log prompt, input/output, nguoi phe duyet va pham vi duoc doc.',
    60,
    'CHUA_DU_DIEU_KIEN'
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
  status = 'ACTIVE',
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
) values
  (
    'APPROVE_LEAD_ELIGIBLE',
    'M05_ADMISSION_CRM',
    'WF_LEAD_TO_ENROLLMENT',
    'Xac nhan lead du dieu kien',
    'DEPARTMENT',
    'COUNSELOR',
    'TEAM_LEAD',
    'TRUONG_PHONG_TUYEN_SINH',
    'Log tu van, ho so bat buoc, nguon lead, doi tuong tuyen sinh, trang thai tai chinh neu co.',
    'Chan neu thieu ho so, sai doi tuong, thieu ly do hoac khong dung pham vi user.',
    24,
    'DAT_TAM_THOI'
  ),
  (
    'APPROVE_HSSV_ACCEPT',
    'M06_HSSV_HANDOVER',
    'WF_CTHSSV_HANDOVER',
    'CTHSSV tiep nhan ho so',
    'DEPARTMENT',
    'COUNSELOR',
    'CTHSSV_STAFF',
    'CTHSSV_LEAD',
    'Checklist ho so, log ban giao, ghi chu bo sung neu co.',
    'Chan neu ho so bat buoc chua dat hoac khong co log ban giao.',
    48,
    'DAT_TAM_THOI'
  ),
  (
    'APPROVE_COM_PAYMENT',
    'M08_FINANCE_ACCOUNTING',
    'WF_COM_APPROVAL',
    'Duyet chi COM',
    'FINANCE',
    'COUNSELOR_OR_PARTNER_OWNER',
    'ACCOUNTING_LEAD',
    'KE_TOAN_TRUONG_OR_BGH',
    'Chinh sach COM hieu luc, claim, doi soat, chung tu, cong no, canh bao bo hoc.',
    'Chan neu trung COM, thieu dieu kien, sai ky, sai nguoi nhan hoac thieu chung tu.',
    72,
    'DAT_TAM_THOI'
  ),
  (
    'APPROVE_HOU_SENSITIVE_FINANCE',
    'M10_HOU_LINKAGE',
    'WF_HOU_OPERATION',
    'Xem/chinh ty le hop tac HEU-HOU',
    'BOARD',
    'KHTC',
    'TRUONG_PHONG_TUYEN_SINH',
    'HIEU_TRUONG_OR_BGH',
    'Hop dong/phu luc/chinh sach hieu luc theo moc thoi gian.',
    'Chan voi user khong co quyen chien luoc tai chinh HOU.',
    null,
    'DAT_TAM_THOI'
  ),
  (
    'APPROVE_AI_AGENT_PRODUCTION',
    'M20_AI_ASSISTANT',
    'WF_AI_AGENT_ENABLE',
    'Bat AI agent production',
    'BOARD',
    'IT_DATA',
    'PHAP_CHE_AUDIT',
    'BGH',
    'Legal, SOP, data scope, prompt policy, test log, rollback plan.',
    'Chan neu AI doc du lieu nhay cam ngoai pham vi hoac co quyen tu duyet.',
    120,
    'CHUA_DU_DIEU_KIEN'
  )
on conflict (approval_code) do update set
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
) values
  (
    'ADMISSION_SEGMENTS',
    'Doi tuong tuyen sinh',
    'M05_ADMISSION_CRM',
    'admission_segments',
    'MASTER',
    'TUYEN_SINH + PHAP_CHE',
    'HEU_OS',
    'INTERNAL',
    true,
    'Chi admin/master-control duoc them/sua; moi doi tuong phai co owner, COM/hop dong/rui ro.',
    'DAT_TAM_THOI'
  ),
  (
    'USER_SCOPE',
    'Pham vi user',
    'M01_IDENTITY_SCOPE',
    'user_admission_segment_scopes,user_partner_scopes',
    'CONFIG',
    'TRUONG_PHONG + ADMIN',
    'HEU_OS',
    'RESTRICTED',
    false,
    'Truong phong chi phan user trong phong/pham vi minh duoc quan ly.',
    'DAT_TAM_THOI'
  ),
  (
    'LEADS',
    'Lead tuyen sinh',
    'M05_ADMISSION_CRM',
    'leads',
    'TRANSACTION',
    'TUYEN_SINH',
    'HEU_OS',
    'CONFIDENTIAL',
    false,
    'Lead phai theo RLS va pham vi user; khong export/AI doc ngoai quyen.',
    'DAT_TAM_THOI'
  ),
  (
    'HOU_COM_POLICY',
    'Chinh sach COM HOU',
    'M10_HOU_LINKAGE',
    'hou_commission_policies,hou_commission_rules,hou_revenue_shares',
    'CONFIG',
    'KHTC + BGH',
    'HEU_OS',
    'SECRET',
    false,
    'Chinh sach co ngay hieu luc; ty le hop tac chi role duoc phep xem/sua.',
    'DAT_TAM_THOI'
  ),
  (
    'AUDIT_LOGS',
    'Audit log',
    'M00_MASTER_CONTROL',
    'audit_logs',
    'TRANSACTION',
    'IT_DATA + AUDIT',
    'HEU_OS',
    'RESTRICTED',
    false,
    'Khong cho sua/xoa bang UI; chi audit/admin duoc doc theo pham vi.',
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
  status = 'ACTIVE',
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
) values
  (
    'RISK_SCOPE_LEAK',
    'User thay du lieu ngoai pham vi',
    'M01_IDENTITY_SCOPE',
    'SECURITY',
    'CRITICAL',
    'IT_DATA + ADMIN',
    'User duoc phan mot doi tuong/doi tac nhung thay lead cua doi tuong khac.',
    'Bat buoc RLS + filter UI + test bang user mau sau moi thay doi pham vi.',
    'Bao ADMIN/BGH neu phat hien lo du lieu.',
    'So request bi chan do ngoai pham vi; so lead chua gan doi tuong.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_DUPLICATE_COM',
    'Chi COM hai lan hoac sai doi tuong',
    'M08_FINANCE_ACCOUNTING',
    'FINANCE',
    'CRITICAL',
    'KHTC',
    'Mot lead/hoc vien co the bi claim COM trung nguon, trung ky hoac sai chinh sach hieu luc.',
    'Unique rule theo lead, policy, ky, nguoi nhan; canh bao cong no/bo hoc truoc khi chi.',
    'Ke toan truong/BGH duyet ngoai le.',
    'So claim COM bi chan; so ky thanh toan cho doi soat.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_HOU_CONFIDENTIAL_RATE',
    'Lo ty le hop tac HEU-HOU',
    'M10_HOU_LINKAGE',
    'CONFIDENTIAL_FINANCE',
    'HIGH',
    'KHTC + BGH',
    'Ty le HEU nhan lai va chinh sach hop tac HOU la thong tin han che.',
    'Chi role duoc cap quyen chien luoc tai chinh HOU moi xem/sua.',
    'Bao BGH neu user khong co quyen truy cap duoc.',
    'So lan truy cap muc sensitive HOU.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_LEGAL_MODEL_TTGDTX',
    'Sai mo hinh lien ket TTGDTX',
    'M09_PARTNER_CONTRACT',
    'LEGAL',
    'HIGH',
    'PHAP_CHE + DAO_TAO + TUYEN_SINH',
    'Tuyen sinh 9+ lien ket TTGDTX co the sai mo hinh, thieu hop dong/tham quyen/ho so.',
    'Moi doi tac TTGDTX phai gan hop dong, pham vi, nguoi duyet va checklist rieng.',
    'Phap che/BGH duyet truoc khi mo khoa/lop moi.',
    'So doi tac thieu hop dong; so lead TTGDTX thieu minh chung.',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_AI_OVERREACH',
    'AI vuot quyen hoac tu quyet dinh',
    'M20_AI_ASSISTANT',
    'AI_GOVERNANCE',
    'CRITICAL',
    'IT_DATA + PHAP_CHE',
    'AI co the doc du lieu nhay cam, goi y sai quy che hoac tu thao tac khong co nguoi duyet.',
    'AI chi chay trong data scope, prompt log, approval gate va human review.',
    'Dung AI agent neu co output sai/rui ro du lieu.',
    'So output AI can review; so lan AI bi chan boi policy.',
    'CHUA_DU_DIEU_KIEN'
  )
on conflict (risk_code) do update set
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
  status = 'ACTIVE',
  updated_at = now();
