-- Step 89 - P2-02 TTGDTX Tuition & Receivable Policy.
-- Run after step88_ttgdtx_partner_contract_master.sql.
--
-- Purpose:
-- - Define tuition and receivable policy for TC9 + TTGDTX before creating any
--   real accounting receivable, invoice, partner settlement or payment.
-- - Keep policy tied to a valid TTGDTX contract, admission segment and major.
-- - Block production readiness if amount, due rule, evidence or settlement
--   rule is missing.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.tuition.read'),
    ('ttgdtx.tuition.manage'),
    ('ttgdtx.tuition.approve')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA', 'ACCOUNTING', 'ACCOUNTING_LEAD', 'KHTC')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, 'ttgdtx.contract.read'
from public.roles r
where r.code in ('KHTC', 'ACCOUNTING', 'ACCOUNTING_LEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.tuition.read'),
    ('ttgdtx.tuition.approve')
) as p(permission)
where r.code = 'BGH'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, 'ttgdtx.tuition.read'
from public.roles r
where r.code in (
  'ADMISSION_HEAD',
  'TEAM_LEAD',
  'COUNSELOR',
  'CTHSSV_LEAD',
  'LEGAL',
  'AUDIT'
)
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
    'ttgdtx.tuition.read',
    'TTGDTX',
    'Xem chính sách học phí/công nợ TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    true,
    'Chỉ xem chính sách học phí/công nợ TTGDTX trong phạm vi được phân quyền.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.tuition.manage',
    'TTGDTX',
    'Quản lý chính sách học phí/công nợ TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC',
    'CRITICAL',
    'ROLE_AND_SCOPE',
    true,
    true,
    false,
    false,
    'Không được tự tạo công nợ thật nếu thiếu hợp đồng, học phí, quy tắc thu, chứng từ và gate duyệt.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.tuition.approve',
    'TTGDTX',
    'Duyệt chính sách học phí/công nợ TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + BGH',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    false,
    'Duyệt chính sách trước khi mở công nợ, đối soát hoặc thanh toán cho TTGDTX.',
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

create table if not exists public.ttgdtx_tuition_policies (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.ttgdtx_partner_contracts(id) on delete restrict,
  partner_id uuid not null references public.partners(id) on delete restrict,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  admission_program_id uuid not null references public.admission_programs(id) on delete restrict,
  admission_major_id uuid references public.admission_majors(id) on delete restrict,
  admission_offering_id uuid references public.admission_offering_catalog(id) on delete restrict,
  policy_code text not null unique,
  policy_name text not null,
  academic_year text not null default '2026',
  cohort_label text,
  tuition_item text not null default 'TUITION',
  tuition_amount_vnd numeric(14,2) not null default 0,
  min_first_payment_vnd numeric(14,2) not null default 0,
  discount_allowed boolean not null default false,
  collection_model text not null default 'HEU_COLLECTS',
  collection_account_note text,
  due_rule text,
  debt_owner_department text not null default 'KHTC',
  invoice_issue_rule text not null default 'AFTER_ENROLLMENT_CONFIRMED',
  revenue_recognition_rule text,
  settlement_basis text,
  evidence_required text,
  effective_from date not null default current_date,
  effective_to date,
  policy_status text not null default 'DRAFT',
  risk_level text not null default 'HIGH',
  control_status text not null default 'DAT_TAM_THOI',
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_tuition_item_valid check (
    tuition_item in ('TUITION', 'APPLICATION_FEE', 'MATERIAL_FEE', 'CERTIFICATE_FEE', 'OTHER')
  ),
  constraint ttgdtx_tuition_collection_model_valid check (
    collection_model in ('HEU_COLLECTS', 'TTGDTX_COLLECTS', 'SPLIT_COLLECTION', 'OTHER')
  ),
  constraint ttgdtx_tuition_invoice_rule_valid check (
    invoice_issue_rule in (
      'AFTER_ENROLLMENT_CONFIRMED',
      'AFTER_DOCUMENT_READY',
      'AFTER_CLASS_OPENED',
      'MANUAL_APPROVAL_ONLY'
    )
  ),
  constraint ttgdtx_tuition_policy_status_valid check (
    policy_status in ('DRAFT', 'FINANCE_REVIEW', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED')
  ),
  constraint ttgdtx_tuition_risk_valid check (
    risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
  ),
  constraint ttgdtx_tuition_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  ),
  constraint ttgdtx_tuition_amount_valid check (
    tuition_amount_vnd >= 0 and min_first_payment_vnd >= 0 and min_first_payment_vnd <= tuition_amount_vnd
  ),
  constraint ttgdtx_tuition_date_valid check (
    effective_to is null or effective_to >= effective_from
  )
);

create index if not exists idx_ttgdtx_tuition_contract
on public.ttgdtx_tuition_policies(contract_id, policy_status)
where status = 'ACTIVE';

create index if not exists idx_ttgdtx_tuition_partner_segment
on public.ttgdtx_tuition_policies(partner_id, admission_segment_id, academic_year)
where status = 'ACTIVE';

create index if not exists idx_ttgdtx_tuition_major
on public.ttgdtx_tuition_policies(admission_major_id, admission_offering_id)
where status = 'ACTIVE';

create or replace function public.validate_ttgdtx_tuition_policy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contract record;
  v_partner record;
  v_segment_code text;
  v_program_code text;
  v_major record;
  v_offering record;
  v_overlap_id uuid;
begin
  select c.*
  into v_contract
  from public.ttgdtx_partner_contracts c
  where c.id = new.contract_id
    and c.status = 'ACTIVE';

  if not found then
    raise exception 'P2-02: Không tìm thấy hợp đồng TTGDTX đang hoạt động.';
  end if;

  if v_contract.partner_id <> new.partner_id then
    raise exception 'P2-02: Đối tác trên chính sách học phí không khớp hợp đồng.';
  end if;

  if v_contract.admission_segment_id <> new.admission_segment_id then
    raise exception 'P2-02: Đối tượng tuyển sinh trên chính sách học phí không khớp hợp đồng.';
  end if;

  select p.id, p.partner_code, p.partner_name, p.partner_type, p.status, p.is_deleted
  into v_partner
  from public.partners p
  where p.id = new.partner_id;

  if not found or v_partner.is_deleted = true or v_partner.status <> 'ACTIVE' then
    raise exception 'P2-02: Không tìm thấy TTGDTX đang hoạt động.';
  end if;

  if v_partner.partner_type <> 'TTGDTX' then
    raise exception 'P2-02: Chính sách này chỉ áp dụng cho đối tác TTGDTX.';
  end if;

  select s.segment_code
  into v_segment_code
  from public.admission_segments s
  where s.id = new.admission_segment_id
    and s.status = 'ACTIVE';

  if v_segment_code is distinct from 'TC9_TTGDTX_LINKED' then
    raise exception 'P2-02: Chính sách học phí TTGDTX chỉ dùng cho Trung cấp 9+ liên kết TTGDTX.';
  end if;

  select p.program_code
  into v_program_code
  from public.admission_programs p
  where p.id = new.admission_program_id
    and p.status = 'ACTIVE';

  if v_program_code is distinct from 'TRUNG_CAP' then
    raise exception 'P2-02: Chính sách TTGDTX hiện chỉ áp dụng cho hệ Trung cấp.';
  end if;

  if new.admission_major_id is not null then
    select m.id, m.major_code, m.major_name, m.program_id, m.status
    into v_major
    from public.admission_majors m
    where m.id = new.admission_major_id;

    if not found or v_major.status <> 'ACTIVE'::public.record_status then
      raise exception 'P2-02: Ngành được chọn không hoạt động.';
    end if;

    if v_major.program_id <> new.admission_program_id then
      raise exception 'P2-02: Ngành không thuộc hệ Trung cấp đã chọn.';
    end if;
  end if;

  if new.admission_offering_id is not null then
    select o.id, o.offering_code, o.offering_name, o.program_id, o.admission_major_id,
           o.allowed_segment_codes, o.status
    into v_offering
    from public.admission_offering_catalog o
    where o.id = new.admission_offering_id;

    if not found or v_offering.status <> 'ACTIVE'::public.record_status then
      raise exception 'P2-02: Chương trình/ngành chi tiết không hoạt động.';
    end if;

    if not ('TC9_TTGDTX_LINKED' = any(v_offering.allowed_segment_codes)) then
      raise exception 'P2-02: Chương trình/ngành chi tiết không thuộc luồng TTGDTX.';
    end if;

    if v_offering.program_id <> new.admission_program_id then
      raise exception 'P2-02: Chương trình/ngành chi tiết không thuộc hệ đã chọn.';
    end if;

    if new.admission_major_id is not null
       and v_offering.admission_major_id is not null
       and v_offering.admission_major_id <> new.admission_major_id then
      raise exception 'P2-02: Chương trình/ngành chi tiết không khớp ngành chính.';
    end if;
  end if;

  if new.policy_status = 'ACTIVE' then
    if v_contract.contract_status <> 'ACTIVE' then
      raise exception 'P2-02: Không được ACTIVE chính sách học phí khi hợp đồng TTGDTX chưa ACTIVE.';
    end if;

    if new.tuition_amount_vnd <= 0 then
      raise exception 'P2-02: Chính sách ACTIVE phải có số học phí lớn hơn 0.';
    end if;

    if nullif(trim(coalesce(new.due_rule, '')), '') is null then
      raise exception 'P2-02: Chính sách ACTIVE phải có quy tắc hạn thu/công nợ.';
    end if;

    if nullif(trim(coalesce(new.settlement_basis, '')), '') is null then
      raise exception 'P2-02: Chính sách ACTIVE phải có căn cứ đối soát TTGDTX.';
    end if;

    if nullif(trim(coalesce(new.evidence_required, '')), '') is null then
      raise exception 'P2-02: Chính sách ACTIVE phải có yêu cầu chứng từ/minh chứng.';
    end if;
  end if;

  select p.id
  into v_overlap_id
  from public.ttgdtx_tuition_policies p
  where p.id is distinct from new.id
    and p.status = 'ACTIVE'
    and p.contract_id = new.contract_id
    and p.tuition_item = new.tuition_item
    and p.academic_year = new.academic_year
    and p.cohort_label is not distinct from new.cohort_label
    and p.admission_major_id is not distinct from new.admission_major_id
    and p.admission_offering_id is not distinct from new.admission_offering_id
    and p.policy_status in ('FINANCE_REVIEW', 'PENDING_APPROVAL', 'ACTIVE')
    and new.policy_status in ('FINANCE_REVIEW', 'PENDING_APPROVAL', 'ACTIVE')
    and daterange(p.effective_from, coalesce(p.effective_to, '9999-12-31'::date), '[]')
        && daterange(new.effective_from, coalesce(new.effective_to, '9999-12-31'::date), '[]')
  limit 1;

  if v_overlap_id is not null then
    raise exception 'P2-02: Đã có chính sách học phí cùng hợp đồng/ngành/kỳ hiệu lực. Không được tạo chồng chính sách.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ttgdtx_tuition_validate
on public.ttgdtx_tuition_policies;

create trigger trg_ttgdtx_tuition_validate
before insert or update on public.ttgdtx_tuition_policies
for each row execute function public.validate_ttgdtx_tuition_policy();

drop trigger if exists trg_ttgdtx_tuition_updated_at
on public.ttgdtx_tuition_policies;

create trigger trg_ttgdtx_tuition_updated_at
before update on public.ttgdtx_tuition_policies
for each row execute function public.set_updated_at();

drop trigger if exists trg_ttgdtx_tuition_audit
on public.ttgdtx_tuition_policies;

create trigger trg_ttgdtx_tuition_audit
after insert or update or delete on public.ttgdtx_tuition_policies
for each row execute function public.write_audit_log();

alter table public.ttgdtx_tuition_policies enable row level security;

create or replace function public.can_read_ttgdtx_tuition_policy(target_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('ttgdtx.tuition.read')
    or public.has_permission('ttgdtx.tuition.manage')
    or public.has_permission('ttgdtx.tuition.approve')
    or exists (
      select 1
      from public.user_partner_scopes ups
      where ups.user_id = auth.uid()
        and ups.partner_id = target_partner_id
        and ups.status = 'ACTIVE'
    )
$$;

create or replace function public.can_manage_ttgdtx_tuition_policy()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('ttgdtx.tuition.manage')
    or public.has_permission('payments.verify')
    or public.has_permission('settings.manage')
$$;

grant execute on function public.can_read_ttgdtx_tuition_policy(uuid) to authenticated;
grant execute on function public.can_manage_ttgdtx_tuition_policy() to authenticated;

drop policy if exists "ttgdtx_tuition_select"
on public.ttgdtx_tuition_policies;

create policy "ttgdtx_tuition_select"
on public.ttgdtx_tuition_policies for select
to authenticated
using (public.can_read_ttgdtx_tuition_policy(partner_id));

drop policy if exists "ttgdtx_tuition_manage"
on public.ttgdtx_tuition_policies;

create policy "ttgdtx_tuition_manage"
on public.ttgdtx_tuition_policies for all
to authenticated
using (public.can_manage_ttgdtx_tuition_policy())
with check (public.can_manage_ttgdtx_tuition_policy());

create or replace view public.ttgdtx_tuition_policy_readiness
with (security_invoker = true)
as
select
  tp.id as policy_id,
  tp.policy_code,
  tp.policy_name,
  tp.contract_id,
  c.contract_code,
  c.contract_name,
  c.contract_status,
  c.effective_from as contract_effective_from,
  c.effective_to as contract_effective_to,
  tp.partner_id,
  p.partner_code,
  p.partner_name,
  p.area as partner_area,
  tp.admission_segment_id,
  s.segment_code,
  s.segment_name,
  tp.admission_program_id,
  pr.program_code,
  pr.program_name,
  tp.admission_major_id,
  m.major_code,
  m.major_name,
  tp.admission_offering_id,
  o.offering_code,
  o.offering_name,
  tp.academic_year,
  tp.cohort_label,
  tp.tuition_item,
  tp.tuition_amount_vnd,
  tp.min_first_payment_vnd,
  tp.discount_allowed,
  tp.collection_model,
  tp.collection_account_note,
  tp.due_rule,
  tp.debt_owner_department,
  tp.invoice_issue_rule,
  tp.revenue_recognition_rule,
  tp.settlement_basis,
  tp.evidence_required,
  tp.effective_from,
  tp.effective_to,
  tp.policy_status,
  tp.risk_level,
  tp.control_status,
  tp.updated_at,
  case
    when c.contract_status is distinct from 'ACTIVE' then 'CONTRACT_NOT_READY'
    when tp.policy_status in ('SUSPENDED', 'CANCELLED') then 'BLOCKED'
    when tp.policy_status = 'EXPIRED'
      or (tp.effective_to is not null and tp.effective_to < current_date)
      then 'EXPIRED'
    when tp.policy_status <> 'ACTIVE' then 'FINANCE_REVIEW'
    when tp.tuition_amount_vnd <= 0 then 'NEEDS_AMOUNT'
    when nullif(trim(coalesce(tp.due_rule, '')), '') is null then 'NEEDS_DUE_RULE'
    when nullif(trim(coalesce(tp.settlement_basis, '')), '') is null then 'NEEDS_SETTLEMENT'
    when nullif(trim(coalesce(tp.evidence_required, '')), '') is null then 'NEEDS_EVIDENCE'
    else 'READY'
  end as readiness_status,
  array_remove(array[
    case when c.contract_status is distinct from 'ACTIVE' then 'Hợp đồng TTGDTX chưa ACTIVE' end,
    case when tp.policy_status <> 'ACTIVE' then 'Chính sách học phí chưa ACTIVE' end,
    case when tp.tuition_amount_vnd <= 0 then 'Thiếu số học phí' end,
    case when nullif(trim(coalesce(tp.due_rule, '')), '') is null then 'Thiếu quy tắc hạn thu/công nợ' end,
    case when nullif(trim(coalesce(tp.settlement_basis, '')), '') is null then 'Thiếu căn cứ đối soát với TTGDTX' end,
    case when nullif(trim(coalesce(tp.evidence_required, '')), '') is null then 'Thiếu yêu cầu chứng từ/minh chứng' end,
    case when tp.effective_to is not null and tp.effective_to < current_date then 'Chính sách đã hết hiệu lực' end
  ], null) as blocking_items
from public.ttgdtx_tuition_policies tp
join public.ttgdtx_partner_contracts c on c.id = tp.contract_id
join public.partners p on p.id = tp.partner_id
join public.admission_segments s on s.id = tp.admission_segment_id
join public.admission_programs pr on pr.id = tp.admission_program_id
left join public.admission_majors m on m.id = tp.admission_major_id
left join public.admission_offering_catalog o on o.id = tp.admission_offering_id
where tp.status = 'ACTIVE';

grant select on public.ttgdtx_tuition_policy_readiness to authenticated;

create or replace view public.ttgdtx_tuition_policy_summary
with (security_invoker = true)
as
select
  partner_id,
  partner_code,
  partner_name,
  count(*)::int as policy_count,
  count(*) filter (where readiness_status = 'READY')::int as ready_count,
  count(*) filter (where readiness_status <> 'READY')::int as blocked_count,
  coalesce(sum(tuition_amount_vnd) filter (where readiness_status = 'READY'), 0)::numeric(14,2) as ready_tuition_total
from public.ttgdtx_tuition_policy_readiness
group by partner_id, partner_code, partner_name;

grant select on public.ttgdtx_tuition_policy_summary to authenticated;

with seed_context as (
  select
    c.id as contract_id,
    p.id as partner_id,
    p.partner_code,
    p.partner_name,
    s.id as segment_id,
    pr.id as program_id
  from public.ttgdtx_partner_contracts c
  join public.partners p on p.id = c.partner_id
  join public.admission_segments s on s.id = c.admission_segment_id
  join public.admission_programs pr on pr.program_code = 'TRUNG_CAP'
  where p.partner_code = 'TTGDTX-0001'
    and p.partner_type = 'TTGDTX'
    and s.segment_code = 'TC9_TTGDTX_LINKED'
    and c.status = 'ACTIVE'
  order by
    case c.contract_status when 'ACTIVE' then 1 when 'PENDING_APPROVAL' then 2 else 3 end,
    c.effective_from desc,
    c.created_at desc
  limit 1
),
major_seed as (
  select m.id, m.major_code, m.major_name, m.sort_order
  from public.admission_majors m
  join public.admission_programs p on p.id = m.program_id
  where p.program_code = 'TRUNG_CAP'
    and m.major_code in ('TUD', 'CNTT', 'KTDN', 'MKT', 'DL')
    and m.status = 'ACTIVE'
)
insert into public.ttgdtx_tuition_policies (
  contract_id,
  partner_id,
  admission_segment_id,
  admission_program_id,
  admission_major_id,
  policy_code,
  policy_name,
  academic_year,
  cohort_label,
  tuition_item,
  tuition_amount_vnd,
  min_first_payment_vnd,
  collection_model,
  due_rule,
  debt_owner_department,
  invoice_issue_rule,
  revenue_recognition_rule,
  settlement_basis,
  evidence_required,
  effective_from,
  policy_status,
  risk_level,
  control_status
)
select
  sc.contract_id,
  sc.partner_id,
  sc.segment_id,
  sc.program_id,
  ms.id,
  'P2-02-' || sc.partner_code || '-' || ms.major_code || '-2026',
  'Học phí TTGDTX ' || ms.major_name || ' năm 2026',
  '2026',
  null,
  'TUITION',
  0,
  0,
  'HEU_COLLECTS',
  null,
  'KHTC',
  'AFTER_ENROLLMENT_CONFIRMED',
  'Chỉ ghi nhận doanh thu/công nợ sau khi học viên đủ điều kiện nhập học và chính sách học phí ACTIVE.',
  'Đối soát theo hợp đồng TTGDTX, danh sách học viên hợp lệ và học phí đã xác nhận.',
  null,
  date '2026-01-01',
  'FINANCE_REVIEW',
  'HIGH',
  'DAT_TAM_THOI'
from seed_context sc
cross join major_seed ms
on conflict (policy_code) do update set
  policy_name = excluded.policy_name,
  contract_id = excluded.contract_id,
  partner_id = excluded.partner_id,
  admission_segment_id = excluded.admission_segment_id,
  admission_program_id = excluded.admission_program_id,
  admission_major_id = excluded.admission_major_id,
  tuition_amount_vnd = case
    when public.ttgdtx_tuition_policies.tuition_amount_vnd > 0
      then public.ttgdtx_tuition_policies.tuition_amount_vnd
    else excluded.tuition_amount_vnd
  end,
  min_first_payment_vnd = case
    when public.ttgdtx_tuition_policies.min_first_payment_vnd > 0
      then public.ttgdtx_tuition_policies.min_first_payment_vnd
    else excluded.min_first_payment_vnd
  end,
  collection_model = coalesce(public.ttgdtx_tuition_policies.collection_model, excluded.collection_model),
  revenue_recognition_rule = coalesce(public.ttgdtx_tuition_policies.revenue_recognition_rule, excluded.revenue_recognition_rule),
  settlement_basis = coalesce(public.ttgdtx_tuition_policies.settlement_basis, excluded.settlement_basis),
  policy_status = case
    when public.ttgdtx_tuition_policies.policy_status = 'ACTIVE'
      then public.ttgdtx_tuition_policies.policy_status
    else excluded.policy_status
  end,
  risk_level = excluded.risk_level,
  control_status = excluded.control_status,
  updated_at = now();

update public.admission_segment_operation_steps os
set
  action_href = '/ttgdtx/tuition',
  step_name = 'Học phí và công nợ TTGDTX',
  control_note = 'P2-02: khai báo chính sách học phí/công nợ theo hợp đồng TTGDTX và ngành. Chưa phát sinh công nợ thật nếu chính sách chưa READY.',
  updated_at = now()
from public.admission_segments s
where os.segment_id = s.id
  and s.segment_code = 'TC9_TTGDTX_LINKED'
  and os.step_code = 'FINANCE_COM';

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
  'WF_P2_02_TTGDTX_TUITION_POLICY',
  'P2-02 Chính sách học phí và công nợ TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Khai báo học phí/công nợ cho TTGDTX sau khi có hồ sơ hợp đồng P2-01.',
  'KHTC',
  'KHTC + PHAP_CHE + TUYEN_SINH',
  'ACCOUNTING_LEAD + LEGAL',
  'BGH',
  'Chính sách học phí/công nợ theo hợp đồng, ngành và kỳ hiệu lực được kiểm soát.',
  'Chỉ P2-02 READY mới chuyển sang phát sinh công nợ/thanh toán ở bước sau.',
  'Log mọi thay đổi số học phí, quy tắc thu, đối soát, chứng từ và trạng thái duyệt.',
  2020,
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
  'P2_02_TTGDTX_TUITION_POLICY',
  'P2-02 chính sách học phí/công nợ TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_tuition_policies; ttgdtx_tuition_policy_readiness; ttgdtx_partner_contracts; admission_majors',
  'CONFIG',
  'KHTC + PHAP_CHE + TUYEN_SINH',
  'SUPABASE',
  'CONFIDENTIAL',
  false,
  'Không phát sinh công nợ, hóa đơn, đối soát hoặc chi TTGDTX nếu chính sách học phí chưa READY.',
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
  'OWN_P2_02_TTGDTX_TUITION_POLICY',
  'P2-02 Quản lý học phí và công nợ TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_02_TTGDTX_TUITION_POLICY',
  'FINANCE_POLICY',
  'ttgdtx_tuition_policies',
  'KHTC + PHAP_CHE + TUYEN_SINH',
  'KHTC',
  'ACCOUNTING_LEAD + LEGAL',
  'BGH',
  'ROLE_AND_SCOPE',
  'TUYEN_SINH',
  'KHTC',
  'Hợp đồng TTGDTX, ngành/hệ đào tạo, mức học phí, quy tắc thu, quy tắc công nợ, chứng từ và căn cứ đối soát.',
  'Mọi sửa học phí, trạng thái chính sách, kỳ hiệu lực hoặc quy tắc đối soát phải ghi audit log; không được xóa lịch sử.',
  72,
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
  'GATE_P2_02_TTGDTX_TUITION_READY',
  'Gate P2-02: học phí/công nợ TTGDTX đủ điều kiện kế toán',
  'FINANCE',
  'TTGDTX_TUITION_POLICY',
  'TC9_TTGDTX_LINKED',
  'KHTC + PHAP_CHE + TUYEN_SINH',
  'Kiểm tra hợp đồng ACTIVE, ngành Trung cấp, số học phí, quy tắc thu/công nợ, chứng từ và căn cứ đối soát.',
  'BGH chỉ duyệt mở công nợ/đối soát khi không còn blocker tài chính/pháp lý trọng yếu.',
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
