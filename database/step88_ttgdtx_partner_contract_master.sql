-- Step 88 - P2-01 TTGDTX Partner Contract Master.
-- Run after step87_short_course_conversion_consistency_guard.sql.
--
-- Purpose:
-- - Start the HEU + TTGDTX pilot with contract/legal/finance control first.
-- - One TTGDTX partner must have a controlled contract profile before tuition,
--   settlement, commission or partner payment can run in production.
-- - This step is intentionally conservative: it does not pay anyone. It only
--   creates the master control layer used by later accounting steps.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.contract.read'),
    ('ttgdtx.contract.manage'),
    ('ttgdtx.contract.approve')
) as p(permission)
where r.code in ('ADMIN', 'LEGAL', 'IT_DATA', 'ACCOUNTING', 'ACCOUNTING_LEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.contract.read'),
    ('ttgdtx.contract.approve')
) as p(permission)
where r.code = 'BGH'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, 'ttgdtx.contract.read'
from public.roles r
where r.code in ('ADMISSION_HEAD', 'TEAM_LEAD', 'COUNSELOR', 'AUDIT', 'CTHSSV_LEAD')
on conflict (role_id, permission) do nothing;

create table if not exists public.ttgdtx_partner_contracts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete restrict,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  contract_code text not null unique,
  contract_name text not null,
  contract_no text,
  contract_type text not null default 'LINKAGE',
  signed_on date,
  effective_from date not null,
  effective_to date,
  contract_file_url text,
  legal_basis text,
  scope_note text,
  student_list_owner text,
  training_delivery_note text,
  tuition_collection_model text not null default 'HEU_COLLECTS',
  tuition_collection_note text,
  settlement_cycle text not null default 'MONTHLY',
  settlement_cutoff_rule text,
  partner_payment_model text not null default 'CONTRACT_POLICY',
  commission_policy_note text,
  payment_condition text not null default 'AFTER_TUITION_VERIFIED',
  tax_invoice_required boolean not null default true,
  accounting_voucher_required boolean not null default true,
  duplicate_payment_guard text not null default 'Chi/doi soat theo partner_id + admission_segment_id + hoc sinh + ky thu; khong cho chi trung.',
  admission_owner_department text not null default 'TUYEN_SINH',
  legal_owner_department text not null default 'PHAP_CHE',
  finance_owner_department text not null default 'KHTC',
  checker_role text not null default 'LEGAL + ACCOUNTING_LEAD',
  approver_role text not null default 'BGH',
  contract_status text not null default 'DRAFT',
  risk_level text not null default 'HIGH',
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_contract_type_valid check (
    contract_type in ('LINKAGE', 'MOU', 'SERVICE', 'COMMISSION', 'APPENDIX', 'OTHER')
  ),
  constraint ttgdtx_tuition_collection_model_valid check (
    tuition_collection_model in ('HEU_COLLECTS', 'TTGDTX_COLLECTS', 'SPLIT_COLLECTION', 'OTHER')
  ),
  constraint ttgdtx_settlement_cycle_valid check (
    settlement_cycle in ('MONTHLY', 'TERM', 'AFTER_COLLECTION', 'AFTER_ENROLLMENT', 'CUSTOM')
  ),
  constraint ttgdtx_partner_payment_model_valid check (
    partner_payment_model in ('CONTRACT_POLICY', 'COMMISSION', 'SERVICE_FEE', 'REVENUE_SHARE', 'NO_PAYMENT', 'OTHER')
  ),
  constraint ttgdtx_payment_condition_valid check (
    payment_condition in (
      'AFTER_TUITION_VERIFIED',
      'AFTER_ENROLLMENT_CONFIRMED',
      'AFTER_CLASS_OPENED',
      'AFTER_STUDENT_ACTIVE',
      'MANUAL_APPROVAL_ONLY'
    )
  ),
  constraint ttgdtx_contract_status_valid check (
    contract_status in ('DRAFT', 'LEGAL_REVIEW', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED')
  ),
  constraint ttgdtx_contract_risk_valid check (
    risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
  ),
  constraint ttgdtx_contract_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  ),
  constraint ttgdtx_contract_date_valid check (
    effective_to is null or effective_to >= effective_from
  )
);

create index if not exists idx_ttgdtx_contract_partner
on public.ttgdtx_partner_contracts(partner_id, admission_segment_id, contract_status)
where status = 'ACTIVE';

create index if not exists idx_ttgdtx_contract_effective
on public.ttgdtx_partner_contracts(effective_from, effective_to)
where status = 'ACTIVE';

create or replace function public.validate_ttgdtx_partner_contract()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partner record;
  v_segment_code text;
  v_overlap_id uuid;
begin
  select p.id, p.partner_code, p.partner_name, p.partner_type, p.status, p.is_deleted
  into v_partner
  from public.partners p
  where p.id = new.partner_id;

  if not found or v_partner.is_deleted = true or v_partner.status <> 'ACTIVE' then
    raise exception 'P2-01: Không tìm thấy TTGDTX đang hoạt động.';
  end if;

  if v_partner.partner_type <> 'TTGDTX' then
    raise exception 'P2-01: Đối tác % không phải loại TTGDTX.', v_partner.partner_name;
  end if;

  select s.segment_code
  into v_segment_code
  from public.admission_segments s
  where s.id = new.admission_segment_id
    and s.status = 'ACTIVE';

  if v_segment_code is distinct from 'TC9_TTGDTX_LINKED' then
    raise exception 'P2-01: Hợp đồng TTGDTX chỉ được gắn với đối tượng Trung cấp 9+ liên kết TTGDTX.';
  end if;

  if new.effective_to is not null and new.effective_to < new.effective_from then
    raise exception 'P2-01: Ngày hết hiệu lực không được trước ngày bắt đầu.';
  end if;

  if new.contract_status = 'ACTIVE' then
    if nullif(trim(coalesce(new.contract_no, '')), '') is null then
      raise exception 'P2-01: Hợp đồng ACTIVE phải có số hợp đồng/văn bản.';
    end if;

    if new.signed_on is null then
      raise exception 'P2-01: Hợp đồng ACTIVE phải có ngày ký.';
    end if;

    if nullif(trim(coalesce(new.scope_note, '')), '') is null then
      raise exception 'P2-01: Hợp đồng ACTIVE phải ghi rõ phạm vi phối hợp TTGDTX.';
    end if;

    if nullif(trim(coalesce(new.legal_basis, new.contract_file_url, '')), '') is null then
      raise exception 'P2-01: Hợp đồng ACTIVE phải có căn cứ pháp lý hoặc link file hợp đồng.';
    end if;

    if nullif(trim(coalesce(new.commission_policy_note, '')), '') is null
       and new.partner_payment_model <> 'NO_PAYMENT' then
      raise exception 'P2-01: Hợp đồng ACTIVE phải có mô tả chính sách chi/đối soát hoặc chọn không chi.';
    end if;
  end if;

  select c.id
  into v_overlap_id
  from public.ttgdtx_partner_contracts c
  where c.partner_id = new.partner_id
    and c.admission_segment_id = new.admission_segment_id
    and c.status = 'ACTIVE'
    and c.contract_status in ('LEGAL_REVIEW', 'PENDING_APPROVAL', 'ACTIVE')
    and c.id is distinct from new.id
    and daterange(c.effective_from, coalesce(c.effective_to, '9999-12-31'::date), '[]')
        && daterange(new.effective_from, coalesce(new.effective_to, '9999-12-31'::date), '[]')
  limit 1;

  if v_overlap_id is not null and new.contract_status in ('LEGAL_REVIEW', 'PENDING_APPROVAL', 'ACTIVE') then
    raise exception 'P2-01: TTGDTX này đã có hợp đồng cùng kỳ hiệu lực. Không được tạo chồng thời gian.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ttgdtx_contract_validate
on public.ttgdtx_partner_contracts;

create trigger trg_ttgdtx_contract_validate
before insert or update on public.ttgdtx_partner_contracts
for each row execute function public.validate_ttgdtx_partner_contract();

drop trigger if exists trg_ttgdtx_contract_updated_at
on public.ttgdtx_partner_contracts;

create trigger trg_ttgdtx_contract_updated_at
before update on public.ttgdtx_partner_contracts
for each row execute function public.set_updated_at();

drop trigger if exists trg_ttgdtx_contract_audit
on public.ttgdtx_partner_contracts;

create trigger trg_ttgdtx_contract_audit
after insert or update or delete on public.ttgdtx_partner_contracts
for each row execute function public.write_audit_log();

alter table public.ttgdtx_partner_contracts enable row level security;

create or replace function public.can_read_ttgdtx_partner_contract(target_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('ttgdtx.contract.read')
    or public.has_permission('ttgdtx.contract.manage')
    or public.has_permission('ttgdtx.contract.approve')
    or exists (
      select 1
      from public.user_partner_scopes ups
      where ups.user_id = auth.uid()
        and ups.partner_id = target_partner_id
        and ups.status = 'ACTIVE'
    )
$$;

create or replace function public.can_manage_ttgdtx_partner_contract()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('ttgdtx.contract.manage')
    or public.has_permission('partners.manage')
    or public.has_permission('settings.manage')
$$;

grant execute on function public.can_read_ttgdtx_partner_contract(uuid) to authenticated;
grant execute on function public.can_manage_ttgdtx_partner_contract() to authenticated;

drop policy if exists "ttgdtx_contract_select"
on public.ttgdtx_partner_contracts;

create policy "ttgdtx_contract_select"
on public.ttgdtx_partner_contracts for select
to authenticated
using (public.can_read_ttgdtx_partner_contract(partner_id));

drop policy if exists "ttgdtx_contract_manage"
on public.ttgdtx_partner_contracts;

create policy "ttgdtx_contract_manage"
on public.ttgdtx_partner_contracts for all
to authenticated
using (public.can_manage_ttgdtx_partner_contract())
with check (public.can_manage_ttgdtx_partner_contract());

create or replace view public.ttgdtx_partner_contract_readiness
with (security_invoker = true)
as
with ttgdtx_segment as (
  select id
  from public.admission_segments
  where segment_code = 'TC9_TTGDTX_LINKED'
    and status = 'ACTIVE'
  limit 1
)
select
  p.id as partner_id,
  p.partner_code,
  p.partner_name,
  p.phone,
  p.email,
  p.area,
  p.owner_user_id,
  c.id as contract_id,
  c.contract_code,
  c.contract_name,
  c.contract_no,
  c.contract_type,
  c.signed_on,
  c.effective_from,
  c.effective_to,
  c.contract_file_url,
  c.legal_basis,
  c.scope_note,
  c.student_list_owner,
  c.training_delivery_note,
  c.tuition_collection_model,
  c.tuition_collection_note,
  c.settlement_cycle,
  c.settlement_cutoff_rule,
  c.partner_payment_model,
  c.commission_policy_note,
  c.payment_condition,
  c.tax_invoice_required,
  c.accounting_voucher_required,
  c.duplicate_payment_guard,
  c.checker_role,
  c.approver_role,
  c.contract_status,
  c.risk_level,
  c.control_status,
  c.updated_at,
  case
    when c.id is null then 'NEEDS_CONTRACT'
    when c.contract_status in ('SUSPENDED', 'CANCELLED') then 'BLOCKED'
    when c.effective_to is not null and c.effective_to < current_date then 'EXPIRED'
    when c.contract_status <> 'ACTIVE' then 'LEGAL_REVIEW'
    when nullif(trim(coalesce(c.contract_no, '')), '') is null
      or c.signed_on is null
      or nullif(trim(coalesce(c.scope_note, '')), '') is null
      or nullif(trim(coalesce(c.legal_basis, c.contract_file_url, '')), '') is null
      then 'NEEDS_LEGAL'
    when nullif(trim(coalesce(c.tuition_collection_model, '')), '') is null
      or nullif(trim(coalesce(c.settlement_cycle, '')), '') is null
      or nullif(trim(coalesce(c.payment_condition, '')), '') is null
      then 'NEEDS_FINANCE_RULE'
    else 'READY'
  end as readiness_status,
  array_remove(array[
    case when c.id is null then 'Chưa có hợp đồng/văn bản liên kết TTGDTX' end,
    case when c.id is not null and c.contract_status <> 'ACTIVE' then 'Hợp đồng chưa ACTIVE hoặc đang chờ pháp chế/BGH duyệt' end,
    case when c.id is not null and c.effective_to is not null and c.effective_to < current_date then 'Hợp đồng đã hết hiệu lực' end,
    case when c.id is not null and nullif(trim(coalesce(c.contract_no, '')), '') is null then 'Thiếu số hợp đồng/văn bản' end,
    case when c.id is not null and c.signed_on is null then 'Thiếu ngày ký' end,
    case when c.id is not null and nullif(trim(coalesce(c.scope_note, '')), '') is null then 'Thiếu phạm vi phối hợp' end,
    case when c.id is not null and nullif(trim(coalesce(c.legal_basis, c.contract_file_url, '')), '') is null then 'Thiếu căn cứ pháp lý hoặc file hợp đồng' end,
    case when c.id is not null and nullif(trim(coalesce(c.commission_policy_note, '')), '') is null and c.partner_payment_model <> 'NO_PAYMENT' then 'Thiếu mô tả chính sách chi/đối soát TTGDTX' end,
    case when c.id is not null and nullif(trim(coalesce(c.settlement_cutoff_rule, '')), '') is null then 'Thiếu quy tắc chốt kỳ đối soát' end
  ], null) as blocking_items
from public.partners p
cross join ttgdtx_segment s
left join lateral (
  select c.*
  from public.ttgdtx_partner_contracts c
  where c.partner_id = p.id
    and c.admission_segment_id = s.id
    and c.status = 'ACTIVE'
  order by
    case c.contract_status
      when 'ACTIVE' then 1
      when 'PENDING_APPROVAL' then 2
      when 'LEGAL_REVIEW' then 3
      when 'DRAFT' then 4
      else 5
    end,
    c.effective_from desc,
    c.created_at desc
  limit 1
) c on true
where p.partner_type = 'TTGDTX'
  and p.status = 'ACTIVE'
  and p.is_deleted = false;

grant select on public.ttgdtx_partner_contract_readiness to authenticated;

insert into public.ttgdtx_partner_contracts (
  partner_id,
  admission_segment_id,
  contract_code,
  contract_name,
  contract_no,
  contract_type,
  signed_on,
  effective_from,
  effective_to,
  legal_basis,
  scope_note,
  student_list_owner,
  training_delivery_note,
  tuition_collection_model,
  tuition_collection_note,
  settlement_cycle,
  settlement_cutoff_rule,
  partner_payment_model,
  commission_policy_note,
  payment_condition,
  contract_status,
  risk_level,
  control_status
)
select
  p.id,
  s.id,
  'P2-01-' || p.partner_code || '-DRAFT',
  'Hồ sơ hợp đồng liên kết ' || p.partner_name,
  null,
  'LINKAGE',
  null,
  date '2026-01-01',
  null,
  'Cần gắn hợp đồng/văn bản liên kết TTGDTX trước khi chạy kế toán thật.',
  'Phạm vi tạm: TTGDTX cung cấp danh sách học sinh, HEU quản lý tuyển sinh/trung cấp theo quy trình được duyệt.',
  'TTGDTX cung cấp danh sách; HEU kiểm tra trùng lead và phân công tư vấn.',
  'Chưa chốt mô hình đào tạo/địa điểm/lịch học chi tiết.',
  'HEU_COLLECTS',
  'Chưa chốt chính sách thu hộ/thu trực tiếp; kế toán phải xác nhận trước khi đối soát.',
  'MONTHLY',
  'Chốt đối soát theo tháng sau khi học phí được xác nhận.',
  'CONTRACT_POLICY',
  'Chưa chốt chính sách chi; không được chi khi chưa có phụ lục/chính sách hiệu lực.',
  'AFTER_TUITION_VERIFIED',
  'LEGAL_REVIEW',
  'HIGH',
  'DAT_TAM_THOI'
from public.partners p
join public.admission_segments s
  on s.segment_code = 'TC9_TTGDTX_LINKED'
where p.partner_type = 'TTGDTX'
  and p.partner_code = 'TTGDTX-0001'
  and p.is_deleted = false
on conflict (contract_code) do update set
  contract_name = excluded.contract_name,
  legal_basis = excluded.legal_basis,
  scope_note = excluded.scope_note,
  student_list_owner = excluded.student_list_owner,
  training_delivery_note = excluded.training_delivery_note,
  tuition_collection_model = excluded.tuition_collection_model,
  tuition_collection_note = excluded.tuition_collection_note,
  settlement_cycle = excluded.settlement_cycle,
  settlement_cutoff_rule = excluded.settlement_cutoff_rule,
  partner_payment_model = excluded.partner_payment_model,
  commission_policy_note = excluded.commission_policy_note,
  payment_condition = excluded.payment_condition,
  contract_status = excluded.contract_status,
  risk_level = excluded.risk_level,
  control_status = excluded.control_status,
  updated_at = now();

update public.admission_segment_operation_steps os
set
  action_href = '/ttgdtx',
  step_name = 'Hồ sơ hợp đồng TTGDTX',
  control_note = 'P2-01: mỗi TTGDTX phải có hợp đồng, phạm vi, quy tắc thu học phí và chính sách chi/đối soát trước khi chạy thật.',
  updated_at = now()
from public.admission_segments s
where os.segment_id = s.id
  and s.segment_code = 'TC9_TTGDTX_LINKED'
  and os.step_code = 'PARTNER_CONTRACT';

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
  'WF_P2_01_TTGDTX_CONTRACT_MASTER',
  'P2-01 Hồ sơ hợp đồng TTGDTX',
  'M09_PARTNER_CONTRACT',
  'Tạo hoặc cập nhật đối tác TTGDTX trước khi thu học phí/chi trả đối tác.',
  'TUYEN_SINH/PHAP_CHE',
  'TUYEN_SINH + PHAP_CHE + KHTC',
  'LEGAL + ACCOUNTING_LEAD',
  'BGH',
  'TTGDTX có hợp đồng/phạm vi/quy tắc kế toán được kiểm soát.',
  'Chưa đủ P2-01 thì không mở đối soát hoặc chi trả TTGDTX.',
  'Log mọi thay đổi hợp đồng, trạng thái, kỳ hiệu lực và chính sách chi.',
  2010,
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
  'P2_01_TTGDTX_CONTRACT_MASTER',
  'P2-01 hồ sơ hợp đồng TTGDTX',
  'M09_PARTNER_CONTRACT',
  'ttgdtx_partner_contracts; ttgdtx_partner_contract_readiness; partners; admission_segments',
  'MASTER',
  'PHAP_CHE + KHTC + TUYEN_SINH',
  'SUPABASE',
  'CONFIDENTIAL',
  false,
  'Không thu/chi theo TTGDTX nếu thiếu hợp đồng hiệu lực, phạm vi phối hợp, quy tắc học phí, điều kiện chi và người duyệt.',
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
  'OWN_P2_01_TTGDTX_CONTRACT_MASTER',
  'P2-01 Quản lý hợp đồng TTGDTX',
  'M09_PARTNER_CONTRACT',
  'WF_P2_01_TTGDTX_CONTRACT_MASTER',
  'PARTNER_CONTRACT',
  'ttgdtx_partner_contracts',
  'PHAP_CHE + KHTC + TUYEN_SINH',
  'TUYEN_SINH/PHAP_CHE',
  'LEGAL + ACCOUNTING_LEAD',
  'BGH',
  'ROLE_AND_SCOPE',
  'TUYEN_SINH',
  'KHTC',
  'Hợp đồng/văn bản liên kết, phạm vi phối hợp, chính sách học phí, quy tắc đối soát, điều kiện chi, chứng từ.',
  'Mọi sửa hợp đồng/chính sách/kỳ hiệu lực phải ghi audit log; không được xóa lịch sử.',
  72,
  'HIGH',
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
  'GATE_P2_01_TTGDTX_CONTRACT_READY',
  'Gate P2-01: hợp đồng TTGDTX đủ điều kiện vận hành',
  'LEGAL',
  'TTGDTX_CONTRACT',
  'TC9_TTGDTX_LINKED',
  'PHAP_CHE + KHTC + TUYEN_SINH',
  'Kiểm tra hợp đồng, phạm vi, hiệu lực, học phí, điều kiện chi, chống chi trùng và chứng từ.',
  'BGH chỉ duyệt chạy thật khi không còn blocker pháp lý/kế toán trọng yếu.',
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
