-- Step 59 - P0-19 Major Legal & Tuition Gate.
-- Run after step58_heu_intermediate_major_master.sql.
--
-- Purpose:
-- - Keep advising/lead creation open while a major is still temporary.
-- - Block enrollment handover / finance handover when the major has not been
--   legally verified and mapped to a tuition policy.
-- - Make every major decision auditable: owner, checker, approver, evidence.

create table if not exists public.major_legal_tuition_gates (
  id uuid primary key default gen_random_uuid(),
  nganh_id text not null unique references public.nganh_nghe_master(nganh_id)
    on update cascade on delete cascade,
  admission_major_id uuid references public.admission_majors(id) on delete set null,
  major_code text not null,
  legal_status text not null default 'PENDING',
  tuition_status text not null default 'PENDING',
  enrollment_gate text not null default 'WARN_BEFORE_ENROLLMENT',
  handover_gate text not null default 'WARN_BEFORE_HANDOVER',
  finance_gate text not null default 'WARN_BEFORE_FINANCE',
  legal_ref text,
  tuition_policy_ref text,
  issue_summary text,
  required_action text,
  owner_department text not null default 'DAO_TAO',
  checker_department text not null default 'PHAP_CHE + IT_DATA',
  approver_role text not null default 'BGH_HIEU_TRUONG',
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint major_gate_legal_status_valid check (
    legal_status in ('PENDING', 'VERIFIED', 'BLOCKED')
  ),
  constraint major_gate_tuition_status_valid check (
    tuition_status in ('PENDING', 'CONFIGURED', 'BLOCKED')
  ),
  constraint major_gate_enrollment_valid check (
    enrollment_gate in ('ALLOW_ENROLLMENT', 'WARN_BEFORE_ENROLLMENT', 'BLOCK_ENROLLMENT')
  ),
  constraint major_gate_handover_valid check (
    handover_gate in ('ALLOW_HANDOVER', 'WARN_BEFORE_HANDOVER', 'BLOCK_HANDOVER')
  ),
  constraint major_gate_finance_valid check (
    finance_gate in ('ALLOW_FINANCE', 'WARN_BEFORE_FINANCE', 'BLOCK_FINANCE')
  ),
  constraint major_gate_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create index if not exists idx_major_legal_tuition_gates_status
on public.major_legal_tuition_gates(status, legal_status, tuition_status);

create index if not exists idx_major_legal_tuition_gates_admission_major
on public.major_legal_tuition_gates(admission_major_id)
where status = 'ACTIVE';

alter table public.major_legal_tuition_gates enable row level security;

drop policy if exists "major_legal_tuition_gates_select_authenticated"
on public.major_legal_tuition_gates;
create policy "major_legal_tuition_gates_select_authenticated"
on public.major_legal_tuition_gates for select
to authenticated
using (status = 'ACTIVE' or public.is_admin());

drop policy if exists "major_legal_tuition_gates_manage_config"
on public.major_legal_tuition_gates;
create policy "major_legal_tuition_gates_manage_config"
on public.major_legal_tuition_gates for all
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

drop trigger if exists trg_major_legal_tuition_gates_updated_at
on public.major_legal_tuition_gates;
create trigger trg_major_legal_tuition_gates_updated_at
before update on public.major_legal_tuition_gates
for each row execute function public.set_updated_at();

drop trigger if exists trg_major_legal_tuition_gates_audit
on public.major_legal_tuition_gates;
create trigger trg_major_legal_tuition_gates_audit
after insert or update or delete on public.major_legal_tuition_gates
for each row execute function public.write_audit_log();

create or replace view public.major_legal_tuition_gate_readable
with (security_invoker = true)
as
select
  g.id,
  g.nganh_id,
  g.admission_major_id,
  g.major_code,
  n.ten_nganh_tu_van,
  n.ten_nganh_phap_ly,
  n.trinh_do,
  n.ma_nganh_nghe,
  n.khoa_phu_trach,
  p.program_code,
  p.program_name,
  g.legal_status,
  g.tuition_status,
  g.enrollment_gate,
  g.handover_gate,
  g.finance_gate,
  g.legal_ref,
  g.tuition_policy_ref,
  g.issue_summary,
  g.required_action,
  g.owner_department,
  g.checker_department,
  g.approver_role,
  g.control_status,
  g.status,
  g.updated_at
from public.major_legal_tuition_gates g
join public.nganh_nghe_master n on n.nganh_id = g.nganh_id
left join public.admission_programs p on p.id = n.chuong_trinh_id;

grant select on public.major_legal_tuition_gate_readable to authenticated;

with major_map as (
  select
    n.nganh_id,
    n.ten_nganh_tu_van,
    n.legal_ref,
    n.hoc_phi_policy_id,
    n.owner_department,
    n.checker_department,
    n.approver_role,
    n.control_status,
    m.id as admission_major_id,
    coalesce(m.major_code, n.nganh_id) as major_code
  from public.nganh_nghe_master n
  left join public.admission_majors m on m.major_code = n.nganh_id
  where n.status = 'ACTIVE'
    and n.nganh_id in ('TUD', 'CNTT', 'KTDN', 'MKT', 'DL')
)
insert into public.major_legal_tuition_gates (
  nganh_id,
  admission_major_id,
  major_code,
  legal_status,
  tuition_status,
  enrollment_gate,
  handover_gate,
  finance_gate,
  legal_ref,
  tuition_policy_ref,
  issue_summary,
  required_action,
  owner_department,
  checker_department,
  approver_role,
  control_status,
  status
)
select
  nganh_id,
  admission_major_id,
  major_code,
  'PENDING',
  'PENDING',
  'WARN_BEFORE_ENROLLMENT',
  'WARN_BEFORE_HANDOVER',
  'WARN_BEFORE_FINANCE',
  legal_ref,
  hoc_phi_policy_id,
  'Danh mục ngành đang dùng được kiểm soát tạm thời; chưa đủ căn cứ để chốt production nếu thiếu quyết định/mã ngành/chỉ tiêu/học phí.',
  'Đối chiếu quyết định cho phép đào tạo, mã ngành/nghề, chỉ tiêu, học phí và FILE_REGISTRY. Sau khi đủ, cập nhật legal_status=VERIFIED, tuition_status=CONFIGURED, các gate=ALLOW_*.',
  owner_department,
  checker_department,
  approver_role,
  'DAT_TAM_THOI',
  'ACTIVE'::public.record_status
from major_map
on conflict (nganh_id) do update set
  admission_major_id = excluded.admission_major_id,
  major_code = excluded.major_code,
  legal_ref = excluded.legal_ref,
  tuition_policy_ref = excluded.tuition_policy_ref,
  issue_summary = excluded.issue_summary,
  required_action = excluded.required_action,
  owner_department = excluded.owner_department,
  checker_department = excluded.checker_department,
  approver_role = excluded.approver_role,
  status = 'ACTIVE',
  updated_at = now();

insert into public.lead_condition_templates (
  condition_scope,
  condition_code,
  condition_name,
  condition_description,
  is_required_default,
  sort_order
)
values
  (
    'ENROLLMENT',
    'ENROLLMENT_MAJOR_LEGAL_VERIFIED',
    'Ngành đã đủ căn cứ pháp lý',
    'Trước khi chốt nhập học/bàn giao, ngành phải có quyết định/mã ngành/chỉ tiêu hoặc căn cứ pháp lý được Pháp chế + IT/Data kiểm tra.',
    true,
    31
  ),
  (
    'ENROLLMENT',
    'ENROLLMENT_MAJOR_TUITION_CONFIGURED',
    'Ngành đã có chính sách học phí',
    'Trước khi bàn giao kế toán hoặc nhập học, ngành phải được map chính sách học phí đúng thời điểm áp dụng.',
    true,
    32
  ),
  (
    'ENROLLMENT',
    'ENROLLMENT_MAJOR_GATE_NOT_BLOCKED',
    'Ngành không bị chặn nhập học/bàn giao',
    'Không được chốt nhập học hoặc bàn giao liên phòng nếu ngành đang ở trạng thái CHUA_DU_DIEU_KIEN/BLOCK.',
    true,
    33
  )
on conflict (condition_code) do update set
  condition_scope = excluded.condition_scope,
  condition_name = excluded.condition_name,
  condition_description = excluded.condition_description,
  is_required_default = excluded.is_required_default,
  sort_order = excluded.sort_order,
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
  'MAJOR_LEGAL_TUITION_GATE',
  'P0-19 Major Legal & Tuition Gate',
  'M05_ADMISSION_CRM',
  'major_legal_tuition_gates',
  'CONFIG',
  'DAO_TAO + PHAP_CHE + KHTC + IT_DATA',
  'HEU_OS',
  'INTERNAL',
  true,
  'Mọi ngành/nghề trước khi chốt nhập học/bàn giao/kế toán phải có trạng thái pháp lý và học phí rõ ràng, có audit log khi thay đổi.',
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
  'WF_P0_19_MAJOR_LEGAL_TUITION_GATE',
  'P0-19 Kiểm soát pháp lý và học phí theo ngành',
  'M05_ADMISSION_CRM',
  'Lead chuẩn bị chuyển đủ điều kiện, nhập học hoặc bàn giao CTHSSV/Kế toán.',
  'TUYEN_SINH',
  'DAO_TAO + PHAP_CHE + KHTC + IT_DATA',
  'PHAP_CHE + KHTC + IT_DATA',
  'BGH_HIEU_TRUONG',
  'Lead chỉ được chốt/bàn giao khi ngành đã đủ căn cứ pháp lý và học phí.',
  'Chặn bàn giao nếu legal_status chưa VERIFIED hoặc tuition_status chưa CONFIGURED.',
  'Mọi thay đổi gate ngành và mọi lần chặn thao tác phải ghi audit/activity log.',
  559,
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
  'RISK_MAJOR_ENROLLMENT_WITHOUT_LEGAL_TUITION',
  'Chốt nhập học khi ngành chưa đủ pháp lý/học phí',
  'M05_ADMISSION_CRM',
  'LEGAL_FINANCE',
  'CRITICAL',
  'DAO_TAO + PHAP_CHE + KHTC',
  'Nếu ngành chưa có căn cứ pháp lý hoặc học phí chính thức mà vẫn nhập học/bàn giao kế toán, hệ thống có rủi ro sai luật, sai thu và sai báo cáo.',
  'P0-19 bắt buộc kiểm tra major_legal_tuition_gates trước khi chuyển ELIGIBLE/ENROLLED hoặc tạo bàn giao liên phòng.',
  'Báo BGH/Hiệu trưởng nếu có nhu cầu mở ngành nhưng gate còn PENDING/BLOCKED.',
  'Số ngành PENDING/BLOCKED và số thao tác bị chặn bởi P0-19',
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
  'MAJOR_LEGAL_TUITION_GATES',
  'Major Legal & Tuition Gates',
  'M05_ADMISSION_CRM',
  'CONFIG',
  'DAO_TAO + PHAP_CHE + KHTC + IT_DATA',
  'Cổng kiểm soát pháp lý, học phí và điều kiện bàn giao theo từng ngành/nghề.',
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
  'P0_19_MAJOR_LEGAL_TUITION_GATE',
  'P0-19 Gate pháp lý và học phí theo ngành/nghề',
  'M05_ADMISSION_CRM',
  'WF_P0_19_MAJOR_LEGAL_TUITION_GATE',
  'CONTROL_GATE',
  'major_legal_tuition_gates,nganh_nghe_master,admission_majors',
  'DAO_TAO + PHAP_CHE + KHTC + IT_DATA',
  'DAO_TAO',
  'PHAP_CHE + KHTC + IT_DATA',
  'BGH_HIEU_TRUONG',
  'ROLE_AND_SCOPE',
  'TUYEN_SINH',
  'CTHSSV + ACCOUNTING',
  'Quyết định/căn cứ pháp lý ngành, mã ngành/nghề, chỉ tiêu, chính sách học phí, FILE_REGISTRY.',
  'Mọi thay đổi gate ngành phải ghi audit log; mọi thao tác bị chặn phải hiển thị lý do rõ ràng cho user.',
  48,
  'CRITICAL',
  'DAT_TAM_THOI'
) on conflict (ownership_code) do update set
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
  'GATE_P0_19_MAJOR_LEGAL_TUITION',
  'P0-19 Major Legal & Tuition Gate',
  'DATA',
  'ADMISSION_MAJOR',
  'MAJOR_LEGAL_TUITION_GATE',
  'DAO_TAO + PHAP_CHE + KHTC + IT_DATA',
  'Kiểm tra ngành có legal_status VERIFIED, tuition_status CONFIGURED và gate không BLOCK trước khi chốt/bàn giao.',
  'Chỉ cho go-live khi không còn ngành production ở trạng thái PENDING/BLOCKED mà vẫn được phép nhập học.',
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
