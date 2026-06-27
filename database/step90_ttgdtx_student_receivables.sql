-- Step 90 - P2-03 TTGDTX Student Tuition Receivables.
-- Run after step89_ttgdtx_tuition_policy.sql.
--
-- Purpose:
-- - Create controlled student-level receivables for TC9 + TTGDTX.
-- - Do not record cash collection, invoice finalization, or partner settlement yet.
-- - Block wrong segment, wrong partner, wrong program/major, inactive contract,
--   inactive tuition policy, duplicate receivable, and weak lead status.
-- Migration candidate only. Do not run production migration from Codex/chat.
-- Production requires backup, restore dry-run, UAT and human approval.

begin;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.receivable.read'),
    ('ttgdtx.receivable.manage'),
    ('ttgdtx.receivable.approve')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA', 'ACCOUNTING', 'ACCOUNTING_LEAD', 'KHTC')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.receivable.read'),
    ('ttgdtx.receivable.approve')
) as p(permission)
where r.code = 'BGH'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, 'ttgdtx.receivable.read'
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
    'ttgdtx.receivable.read',
    'TTGDTX',
    'Xem công nợ học phí TTGDTX theo học sinh',
    'M08_FINANCE_ACCOUNTING',
    'KHTC',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    true,
    'Chỉ xem công nợ học phí TTGDTX trong phạm vi đối tượng/đối tác được phân quyền.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.receivable.manage',
    'TTGDTX',
    'Tạo và cập nhật công nợ học phí TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC',
    'CRITICAL',
    'ROLE_AND_SCOPE',
    true,
    true,
    false,
    false,
    'Không tạo công nợ nếu thiếu P2-01 hợp đồng, P2-02 chính sách học phí, ngành/hệ chuẩn, hoặc lead chưa đủ trạng thái.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.receivable.approve',
    'TTGDTX',
    'Duyệt khóa/đối soát công nợ học phí TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + BGH',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    false,
    'Duyệt công nợ trước khi ghi nhận thu, xuất chứng từ, hoặc chuyển sang đối soát/chi trả TTGDTX.',
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

create table if not exists public.ttgdtx_student_receivables (
  id uuid primary key default gen_random_uuid(),
  receivable_code text not null unique,
  lead_id uuid not null references public.leads(id) on delete restrict,
  partner_id uuid not null references public.partners(id) on delete restrict,
  contract_id uuid not null references public.ttgdtx_partner_contracts(id) on delete restrict,
  tuition_policy_id uuid not null references public.ttgdtx_tuition_policies(id) on delete restrict,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  admission_program_id uuid not null references public.admission_programs(id) on delete restrict,
  admission_major_id uuid not null references public.admission_majors(id) on delete restrict,
  admission_offering_id uuid references public.admission_offering_catalog(id) on delete restrict,
  academic_year text not null default '2026',
  term_label text not null default 'KY_1',
  student_name text not null,
  student_phone text,
  expected_amount_vnd numeric(14,2) not null default 0,
  discount_amount_vnd numeric(14,2) not null default 0,
  payable_amount_vnd numeric(14,2) generated always as (
    greatest(expected_amount_vnd - discount_amount_vnd, 0)
  ) stored,
  paid_amount_vnd numeric(14,2) not null default 0,
  balance_amount_vnd numeric(14,2) generated always as (
    greatest(expected_amount_vnd - discount_amount_vnd - paid_amount_vnd, 0)
  ) stored,
  due_date date not null,
  receivable_status text not null default 'PENDING_COLLECTION',
  collection_status text not null default 'NOT_COLLECTED',
  invoice_status text not null default 'NOT_ISSUED',
  overdue_risk_level text not null default 'MEDIUM',
  evidence_url text,
  voucher_no text,
  note text,
  approved_by uuid references public.users_profile(id),
  approved_at timestamptz,
  cancelled_by uuid references public.users_profile(id),
  cancelled_at timestamptz,
  cancel_reason text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_receivable_status_valid check (
    receivable_status in (
      'DRAFT',
      'PENDING_COLLECTION',
      'PARTIAL',
      'PAID',
      'OVERDUE',
      'WAIVED',
      'CANCELLED'
    )
  ),
  constraint ttgdtx_receivable_collection_valid check (
    collection_status in (
      'NOT_COLLECTED',
      'PARTIAL',
      'COLLECTED',
      'WAIVED',
      'REFUNDED',
      'CANCELLED'
    )
  ),
  constraint ttgdtx_receivable_invoice_valid check (
    invoice_status in ('NOT_ISSUED', 'PENDING', 'ISSUED', 'VOIDED', 'NOT_REQUIRED')
  ),
  constraint ttgdtx_receivable_risk_valid check (
    overdue_risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
  ),
  constraint ttgdtx_receivable_amount_valid check (
    expected_amount_vnd >= 0
    and discount_amount_vnd >= 0
    and paid_amount_vnd >= 0
    and discount_amount_vnd <= expected_amount_vnd
    and paid_amount_vnd <= greatest(expected_amount_vnd - discount_amount_vnd, 0)
  )
);

create index if not exists idx_ttgdtx_receivables_lead
on public.ttgdtx_student_receivables(lead_id, receivable_status)
where record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_receivables_partner_due
on public.ttgdtx_student_receivables(partner_id, due_date, receivable_status)
where record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_receivables_policy
on public.ttgdtx_student_receivables(tuition_policy_id, term_label)
where record_status = 'ACTIVE';

create unique index if not exists uq_ttgdtx_receivable_lead_policy_term_active
on public.ttgdtx_student_receivables(lead_id, tuition_policy_id, term_label)
where record_status = 'ACTIVE'
  and receivable_status <> 'CANCELLED';

create or replace function public.validate_ttgdtx_student_receivable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead record;
  v_policy record;
  v_segment_code text;
  v_payable numeric(14,2);
begin
  select
    l.id,
    l.lead_code,
    l.student_name,
    l.student_phone,
    l.status as lead_status,
    l.partner_id,
    l.admission_segment_id,
    l.admission_program_id,
    l.admission_major_id,
    l.admission_offering_id,
    l.is_deleted
  into v_lead
  from public.leads l
  where l.id = new.lead_id;

  if not found or v_lead.is_deleted then
    raise exception 'P2-03: Không tìm thấy lead đang hoạt động.';
  end if;

  select s.segment_code
  into v_segment_code
  from public.admission_segments s
  where s.id = v_lead.admission_segment_id
    and s.status = 'ACTIVE';

  if v_segment_code is distinct from 'TC9_TTGDTX_LINKED' then
    raise exception 'P2-03: Công nợ này chỉ dùng cho Trung cấp 9+ liên kết TTGDTX.';
  end if;

  if v_lead.partner_id is null then
    raise exception 'P2-03: Lead chưa gắn TTGDTX/đối tác.';
  end if;

  if v_lead.admission_program_id is null then
    raise exception 'P2-03: Lead chưa gắn hệ đào tạo chuẩn.';
  end if;

  if v_lead.admission_major_id is null then
    raise exception 'P2-03: Lead chưa gắn ngành/nghề chuẩn.';
  end if;

  if v_lead.lead_status not in ('DOCUMENT_SUBMITTED', 'ELIGIBLE', 'ENROLLED') then
    raise exception 'P2-03: Lead chưa đủ trạng thái tạo công nợ. Cần Đã nộp hồ sơ, Đủ điều kiện hoặc Đã nhập học.';
  end if;

  select
    tp.id,
    tp.policy_code,
    tp.contract_id,
    tp.partner_id,
    tp.admission_segment_id,
    tp.admission_program_id,
    tp.admission_major_id,
    tp.admission_offering_id,
    tp.academic_year,
    tp.tuition_amount_vnd,
    tp.discount_allowed,
    tp.due_rule,
    tp.settlement_basis,
    tp.evidence_required,
    tp.policy_status,
    tp.effective_from,
    tp.effective_to,
    c.contract_status,
    c.status as contract_record_status
  into v_policy
  from public.ttgdtx_tuition_policies tp
  join public.ttgdtx_partner_contracts c on c.id = tp.contract_id
  where tp.id = new.tuition_policy_id
    and tp.status = 'ACTIVE';

  if not found then
    raise exception 'P2-03: Không tìm thấy chính sách học phí TTGDTX đang hoạt động.';
  end if;

  if v_policy.contract_record_status <> 'ACTIVE'
     or v_policy.contract_status <> 'ACTIVE' then
    raise exception 'P2-03: Hợp đồng TTGDTX chưa ACTIVE.';
  end if;

  if v_policy.policy_status <> 'ACTIVE'
     or v_policy.tuition_amount_vnd <= 0
     or nullif(trim(coalesce(v_policy.due_rule, '')), '') is null
     or nullif(trim(coalesce(v_policy.settlement_basis, '')), '') is null
     or nullif(trim(coalesce(v_policy.evidence_required, '')), '') is null
     or (v_policy.effective_to is not null and v_policy.effective_to < current_date) then
    raise exception 'P2-03: Chính sách học phí P2-02 chưa READY.';
  end if;

  if v_policy.partner_id <> v_lead.partner_id then
    raise exception 'P2-03: Lead không thuộc TTGDTX của chính sách học phí.';
  end if;

  if v_policy.admission_segment_id <> v_lead.admission_segment_id then
    raise exception 'P2-03: Đối tượng tuyển sinh của lead không khớp chính sách học phí.';
  end if;

  if v_policy.admission_program_id <> v_lead.admission_program_id then
    raise exception 'P2-03: Hệ đào tạo của lead không khớp chính sách học phí.';
  end if;

  if v_policy.admission_major_id is distinct from v_lead.admission_major_id then
    raise exception 'P2-03: Ngành/nghề của lead không khớp chính sách học phí.';
  end if;

  if v_policy.admission_offering_id is not null
     and v_lead.admission_offering_id is distinct from v_policy.admission_offering_id then
    raise exception 'P2-03: Khoá/chương trình chi tiết của lead không khớp chính sách học phí.';
  end if;

  new.partner_id := v_policy.partner_id;
  new.contract_id := v_policy.contract_id;
  new.admission_segment_id := v_policy.admission_segment_id;
  new.admission_program_id := v_policy.admission_program_id;
  new.admission_major_id := v_policy.admission_major_id;
  new.admission_offering_id := v_policy.admission_offering_id;
  new.academic_year := coalesce(nullif(trim(new.academic_year), ''), v_policy.academic_year);
  new.student_name := coalesce(nullif(trim(new.student_name), ''), v_lead.student_name);
  new.student_phone := coalesce(nullif(trim(new.student_phone), ''), v_lead.student_phone);
  new.expected_amount_vnd := v_policy.tuition_amount_vnd;

  if new.discount_amount_vnd > 0 and not v_policy.discount_allowed then
    raise exception 'P2-03: Chính sách học phí này chưa cho phép giảm trừ.';
  end if;

  if new.paid_amount_vnd > 0
     and nullif(trim(coalesce(new.evidence_url, new.voucher_no, '')), '') is null then
    raise exception 'P2-03: Có số tiền đã thu thì phải có chứng từ hoặc link minh chứng.';
  end if;

  v_payable := greatest(new.expected_amount_vnd - new.discount_amount_vnd, 0);

  if new.receivable_status not in ('DRAFT', 'WAIVED', 'CANCELLED') then
    if new.paid_amount_vnd >= v_payable and v_payable > 0 then
      new.receivable_status := 'PAID';
      new.collection_status := 'COLLECTED';
      new.overdue_risk_level := 'LOW';
    elsif new.paid_amount_vnd > 0 then
      new.receivable_status := 'PARTIAL';
      new.collection_status := 'PARTIAL';
      new.overdue_risk_level := case
        when new.due_date < current_date - 30 then 'HIGH'
        when new.due_date < current_date then 'MEDIUM'
        else 'LOW'
      end;
    elsif new.due_date < current_date then
      new.receivable_status := 'OVERDUE';
      new.collection_status := 'NOT_COLLECTED';
      new.overdue_risk_level := case
        when new.due_date < current_date - 30 then 'CRITICAL'
        else 'HIGH'
      end;
    else
      new.receivable_status := 'PENDING_COLLECTION';
      new.collection_status := 'NOT_COLLECTED';
      new.overdue_risk_level := 'MEDIUM';
    end if;
  end if;

  if new.receivable_status = 'CANCELLED' then
    if nullif(trim(coalesce(new.cancel_reason, '')), '') is null then
      raise exception 'P2-03: Hủy công nợ phải có lý do.';
    end if;

    new.collection_status := 'CANCELLED';
    new.cancelled_at := coalesce(new.cancelled_at, now());
    new.cancelled_by := coalesce(new.cancelled_by, auth.uid());
  end if;

  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
  end if;

  new.updated_by := coalesce(auth.uid(), new.updated_by);
  new.updated_at := now();

  return new;
end;
$$;

drop trigger if exists trg_ttgdtx_receivables_validate
on public.ttgdtx_student_receivables;

create trigger trg_ttgdtx_receivables_validate
before insert or update on public.ttgdtx_student_receivables
for each row execute function public.validate_ttgdtx_student_receivable();

drop trigger if exists trg_ttgdtx_receivables_audit
on public.ttgdtx_student_receivables;

create trigger trg_ttgdtx_receivables_audit
after insert or update or delete on public.ttgdtx_student_receivables
for each row execute function public.write_audit_log();

alter table public.ttgdtx_student_receivables enable row level security;

create or replace function public.can_read_ttgdtx_receivable(target_partner_id uuid)
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
        public.has_permission('ttgdtx.receivable.read')
        or public.has_permission('ttgdtx.receivable.manage')
        or public.has_permission('ttgdtx.receivable.approve')
      )
      and public.can_access_business_scope(
        (
          select id
          from public.admission_segments
          where segment_code = 'TC9_TTGDTX_LINKED'
          limit 1
        ),
        target_partner_id
      )
    )
$$;

create or replace function public.can_manage_ttgdtx_receivable()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('ttgdtx.receivable.manage')
    or public.has_permission('payments.verify')
$$;

grant execute on function public.can_read_ttgdtx_receivable(uuid) to authenticated;
grant execute on function public.can_manage_ttgdtx_receivable() to authenticated;

drop policy if exists "ttgdtx_receivables_select"
on public.ttgdtx_student_receivables;

create policy "ttgdtx_receivables_select"
on public.ttgdtx_student_receivables for select
to authenticated
using (public.can_read_ttgdtx_receivable(partner_id));

drop policy if exists "ttgdtx_receivables_manage"
on public.ttgdtx_student_receivables;

drop policy if exists "ttgdtx_receivables_insert"
on public.ttgdtx_student_receivables;

create policy "ttgdtx_receivables_insert"
on public.ttgdtx_student_receivables for insert
to authenticated
with check (
  public.can_manage_ttgdtx_receivable()
  and public.can_access_business_scope(admission_segment_id, partner_id)
);

drop policy if exists "ttgdtx_receivables_update"
on public.ttgdtx_student_receivables;

create policy "ttgdtx_receivables_update"
on public.ttgdtx_student_receivables for update
to authenticated
using (
  public.can_manage_ttgdtx_receivable()
  and public.can_access_business_scope(admission_segment_id, partner_id)
)
with check (
  public.can_manage_ttgdtx_receivable()
  and public.can_access_business_scope(admission_segment_id, partner_id)
);

create or replace view public.ttgdtx_receivable_candidate_leads
with (security_invoker = true)
as
select
  l.id as lead_id,
  l.lead_code,
  l.student_name,
  l.student_phone,
  l.status::text as lead_status,
  l.partner_id,
  p.partner_code,
  p.partner_name,
  l.admission_segment_id,
  s.segment_code,
  s.segment_name,
  l.admission_program_id,
  pr.program_code,
  pr.program_name,
  l.admission_major_id,
  m.major_code,
  m.major_name,
  l.admission_offering_id,
  o.offering_code,
  o.offering_name,
  pol.policy_id,
  pol.policy_code,
  pol.policy_name,
  pol.contract_id,
  pol.contract_code,
  pol.tuition_amount_vnd,
  pol.min_first_payment_vnd,
  pol.due_rule,
  pol.readiness_status as policy_readiness_status,
  existing.receivable_id as existing_receivable_id,
  existing.receivable_code as existing_receivable_code,
  array_remove(array[
    case when l.status::text not in ('DOCUMENT_SUBMITTED', 'ELIGIBLE', 'ENROLLED') then 'LEAD_STATUS_NOT_READY' end,
    case when l.partner_id is null then 'MISSING_TTGDTX_PARTNER' end,
    case when l.admission_program_id is null then 'MISSING_PROGRAM' end,
    case when l.admission_major_id is null then 'MISSING_MAJOR' end,
    case when pol.policy_id is null then 'NO_MATCHING_READY_TUITION_POLICY' end,
    case when pol.policy_id is not null and pol.readiness_status <> 'READY' then 'TUITION_POLICY_NOT_READY' end,
    case when existing.receivable_id is not null then 'RECEIVABLE_ALREADY_EXISTS' end
  ], null) as blocking_items,
  case
    when l.status::text not in ('DOCUMENT_SUBMITTED', 'ELIGIBLE', 'ENROLLED') then 'NEEDS_LEAD_STATUS'
    when l.partner_id is null then 'NEEDS_PARTNER'
    when l.admission_program_id is null then 'NEEDS_PROGRAM'
    when l.admission_major_id is null then 'NEEDS_MAJOR'
    when pol.policy_id is null then 'NEEDS_TUITION_POLICY'
    when pol.readiness_status <> 'READY' then 'POLICY_NOT_READY'
    when existing.receivable_id is not null then 'ALREADY_CREATED'
    else 'READY_TO_CREATE'
  end as readiness_status,
  (
    l.status::text in ('DOCUMENT_SUBMITTED', 'ELIGIBLE', 'ENROLLED')
    and l.partner_id is not null
    and l.admission_program_id is not null
    and l.admission_major_id is not null
    and pol.policy_id is not null
    and pol.readiness_status = 'READY'
    and existing.receivable_id is null
  ) as can_create_receivable,
  l.created_at,
  l.updated_at
from public.leads l
join public.admission_segments s on s.id = l.admission_segment_id
left join public.partners p on p.id = l.partner_id
left join public.admission_programs pr on pr.id = l.admission_program_id
left join public.admission_majors m on m.id = l.admission_major_id
left join public.admission_offering_catalog o on o.id = l.admission_offering_id
left join lateral (
  select tp.*
  from public.ttgdtx_tuition_policy_readiness tp
  where tp.partner_id = l.partner_id
    and tp.admission_segment_id = l.admission_segment_id
    and tp.admission_program_id = l.admission_program_id
    and tp.admission_major_id is not distinct from l.admission_major_id
    and (
      tp.admission_offering_id is null
      or tp.admission_offering_id = l.admission_offering_id
    )
  order by
    case tp.readiness_status when 'READY' then 1 else 2 end,
    tp.effective_from desc,
    tp.updated_at desc
  limit 1
) pol on true
left join lateral (
  select r.id as receivable_id, r.receivable_code
  from public.ttgdtx_student_receivables r
  where r.lead_id = l.id
    and r.tuition_policy_id = pol.policy_id
    and r.term_label = 'KY_1'
    and r.record_status = 'ACTIVE'
    and r.receivable_status <> 'CANCELLED'
  order by r.created_at desc
  limit 1
) existing on true
where l.is_deleted = false
  and s.segment_code = 'TC9_TTGDTX_LINKED'
  and public.can_access_business_scope(l.admission_segment_id, l.partner_id);

grant select on public.ttgdtx_receivable_candidate_leads to authenticated;

create or replace view public.ttgdtx_student_receivable_readiness
with (security_invoker = true)
as
select
  r.id as receivable_id,
  r.receivable_code,
  r.lead_id,
  l.lead_code,
  r.student_name,
  r.student_phone,
  r.partner_id,
  p.partner_code,
  p.partner_name,
  r.contract_id,
  c.contract_code,
  c.contract_status,
  r.tuition_policy_id,
  tp.policy_code,
  tp.policy_name,
  r.admission_segment_id,
  s.segment_code,
  s.segment_name,
  r.admission_program_id,
  pr.program_code,
  pr.program_name,
  r.admission_major_id,
  m.major_code,
  m.major_name,
  r.academic_year,
  r.term_label,
  r.expected_amount_vnd,
  r.discount_amount_vnd,
  r.payable_amount_vnd,
  r.paid_amount_vnd,
  r.balance_amount_vnd,
  r.due_date,
  greatest((current_date - r.due_date), 0)::int as days_overdue,
  r.receivable_status,
  r.collection_status,
  r.invoice_status,
  r.overdue_risk_level,
  r.evidence_url,
  r.voucher_no,
  r.note,
  r.created_at,
  r.updated_at,
  array_remove(array[
    case when c.contract_status <> 'ACTIVE' then 'CONTRACT_NOT_ACTIVE' end,
    case when tp.policy_status <> 'ACTIVE' then 'POLICY_NOT_ACTIVE' end,
    case when r.balance_amount_vnd > 0 and r.due_date < current_date then 'OVERDUE_BALANCE' end,
    case when r.receivable_status = 'PAID' and r.balance_amount_vnd > 0 then 'STATUS_AMOUNT_MISMATCH' end,
    case when r.paid_amount_vnd > 0 and nullif(trim(coalesce(r.evidence_url, r.voucher_no, '')), '') is null then 'MISSING_PAYMENT_EVIDENCE' end
  ], null) as control_flags,
  case
    when r.receivable_status = 'CANCELLED' then 'CANCELLED'
    when r.receivable_status = 'WAIVED' then 'WAIVED'
    when c.contract_status <> 'ACTIVE' then 'CONTRACT_NOT_READY'
    when tp.policy_status <> 'ACTIVE' then 'POLICY_NOT_READY'
    when r.balance_amount_vnd = 0 and r.payable_amount_vnd > 0 then 'PAID'
    when r.balance_amount_vnd > 0 and r.due_date < current_date then 'OVERDUE'
    when r.paid_amount_vnd > 0 then 'PARTIAL'
    else 'OPEN'
  end as readiness_status
from public.ttgdtx_student_receivables r
join public.leads l on l.id = r.lead_id
join public.partners p on p.id = r.partner_id
join public.ttgdtx_partner_contracts c on c.id = r.contract_id
join public.ttgdtx_tuition_policies tp on tp.id = r.tuition_policy_id
join public.admission_segments s on s.id = r.admission_segment_id
join public.admission_programs pr on pr.id = r.admission_program_id
join public.admission_majors m on m.id = r.admission_major_id
where r.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_receivable(r.partner_id);

grant select on public.ttgdtx_student_receivable_readiness to authenticated;

create or replace view public.ttgdtx_receivable_summary
with (security_invoker = true)
as
select
  count(*)::int as receivable_count,
  count(*) filter (where readiness_status = 'OPEN')::int as open_count,
  count(*) filter (where readiness_status = 'OVERDUE')::int as overdue_count,
  count(*) filter (where readiness_status = 'PAID')::int as paid_count,
  coalesce(sum(payable_amount_vnd), 0)::numeric(14,2) as payable_total_vnd,
  coalesce(sum(paid_amount_vnd), 0)::numeric(14,2) as paid_total_vnd,
  coalesce(sum(balance_amount_vnd), 0)::numeric(14,2) as balance_total_vnd
from public.ttgdtx_student_receivable_readiness;

grant select on public.ttgdtx_receivable_summary to authenticated;

create or replace function public.create_ttgdtx_student_receivable(
  p_lead_id uuid,
  p_tuition_policy_id uuid,
  p_due_date date,
  p_term_label text default 'KY_1',
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead record;
  v_policy record;
  v_receivable_id uuid;
begin
  if not public.can_manage_ttgdtx_receivable() then
    raise exception 'P2-03: Tài khoản chưa có quyền tạo công nợ TTGDTX.';
  end if;

  if p_lead_id is null or p_tuition_policy_id is null or p_due_date is null then
    raise exception 'P2-03: Cần chọn lead, chính sách học phí và hạn thu.';
  end if;

  select
    l.id,
    l.student_name,
    l.student_phone,
    l.partner_id,
    l.admission_segment_id,
    l.admission_program_id,
    l.admission_major_id,
    l.admission_offering_id
  into v_lead
  from public.leads l
  where l.id = p_lead_id
    and l.is_deleted = false;

  if not found then
    raise exception 'P2-03: Không tìm thấy lead.';
  end if;

  if not public.can_access_business_scope(v_lead.admission_segment_id, v_lead.partner_id) then
    raise exception 'P2-03: Tài khoản chưa được phân vào phạm vi lead/TTGDTX này.';
  end if;

  select *
  into v_policy
  from public.ttgdtx_tuition_policies
  where id = p_tuition_policy_id
    and status = 'ACTIVE';

  if not found then
    raise exception 'P2-03: Không tìm thấy chính sách học phí.';
  end if;

  insert into public.ttgdtx_student_receivables (
    receivable_code,
    lead_id,
    partner_id,
    contract_id,
    tuition_policy_id,
    admission_segment_id,
    admission_program_id,
    admission_major_id,
    admission_offering_id,
    academic_year,
    term_label,
    student_name,
    student_phone,
    expected_amount_vnd,
    due_date,
    note
  ) values (
    'TTGDTX-AR-' || to_char(now(), 'YYYYMMDD') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
    p_lead_id,
    v_policy.partner_id,
    v_policy.contract_id,
    p_tuition_policy_id,
    v_policy.admission_segment_id,
    v_policy.admission_program_id,
    v_policy.admission_major_id,
    v_policy.admission_offering_id,
    v_policy.academic_year,
    coalesce(nullif(trim(p_term_label), ''), 'KY_1'),
    v_lead.student_name,
    v_lead.student_phone,
    v_policy.tuition_amount_vnd,
    p_due_date,
    p_note
  )
  returning id into v_receivable_id;

  return v_receivable_id;
end;
$$;

grant execute on function public.create_ttgdtx_student_receivable(uuid, uuid, date, text, text) to authenticated;

update public.admission_segment_operation_steps os
set
  action_href = '/ttgdtx/receivables',
  step_name = 'Công nợ học phí TTGDTX',
  control_note = 'P2-03: tạo công nợ học phí theo từng học sinh TTGDTX; chỉ mở khi P2-01 hợp đồng và P2-02 học phí READY, lead đúng đối tượng/ngành và đủ trạng thái.',
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
  'WF_P2_03_TTGDTX_STUDENT_RECEIVABLE',
  'P2-03 Công nợ học phí theo học sinh TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'KHTC tạo công nợ học phí cho lead/học sinh TTGDTX sau khi hợp đồng và học phí đã sẵn sàng.',
  'KHTC',
  'KHTC + TUYEN_SINH + CTHSSV',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH',
  'Mỗi học sinh TTGDTX có dòng công nợ rõ số tiền, hạn thu, trạng thái, đối tác, hợp đồng và chính sách học phí.',
  'Công nợ chưa phải phiếu thu; bước sau mới ghi nhận thu tiền, chứng từ, đối soát và chi trả TTGDTX.',
  'Mọi tạo/sửa/hủy công nợ phải ghi audit log; không tạo trùng công nợ cùng lead/chính sách/kỳ.',
  2030,
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
) values
  (
    'P2_03_TTGDTX_STUDENT_RECEIVABLES',
    'P2-03 công nợ học phí TTGDTX theo học sinh',
    'M08_FINANCE_ACCOUNTING',
    'ttgdtx_student_receivables; create_ttgdtx_student_receivable',
    'TRANSACTION',
    'KHTC',
    'SUPABASE',
    'RESTRICTED',
    false,
    'Không nhập thẳng vào bảng lõi; phải qua function kiểm tra P2-01/P2-02, lead, đối tượng, ngành, đối tác và audit log.',
    'DAT_TAM_THOI'
  ),
  (
    'P2_03_TTGDTX_RECEIVABLE_READINESS',
    'P2-03 view kiểm tra công nợ học phí TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'ttgdtx_receivable_candidate_leads; ttgdtx_student_receivable_readiness; ttgdtx_receivable_summary',
    'REPORT_VIEW',
    'KHTC + IT_DATA',
    'SUPABASE',
    'CONFIDENTIAL',
    true,
    'View chỉ dùng để chỉ rõ đủ/thiếu; không thay thế function tạo công nợ.',
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
  'OWN_P2_03_TTGDTX_STUDENT_RECEIVABLE',
  'P2-03 Công nợ học phí theo học sinh TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_03_TTGDTX_STUDENT_RECEIVABLE',
  'TTGDTX_RECEIVABLE',
  'ttgdtx_student_receivables',
  'KHTC',
  'ACCOUNTING_STAFF/KHTC',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/KE_TOAN_TRUONG',
  'ROLE_AND_SCOPE',
  'TUYEN_SINH/CTHSSV',
  'KHTC',
  'Lead đúng đối tượng TTGDTX, hợp đồng P2-01 ACTIVE, chính sách học phí P2-02 READY, ngành/hệ chuẩn, hạn thu và căn cứ chứng từ.',
  'Không tạo trùng công nợ; mọi sửa/hủy phải ghi lý do và audit log; không ghi nhận đã thu nếu thiếu chứng từ.',
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
  'GATE_P2_03_TTGDTX_RECEIVABLE_READY',
  'Gate P2-03: công nợ học phí TTGDTX đủ điều kiện tạo',
  'FINANCE',
  'TTGDTX_RECEIVABLE',
  'TC9_TTGDTX_LINKED',
  'KHTC + TUYEN_SINH + CTHSSV',
  'Kiểm tra lead đúng TTGDTX, đúng ngành/hệ, đủ trạng thái, hợp đồng ACTIVE và chính sách học phí READY.',
  'BGH/Kế toán trưởng chỉ mở thu/đối soát khi công nợ không trùng, không sai ngành và có audit log.',
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

commit;
