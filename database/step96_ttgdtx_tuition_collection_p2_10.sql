-- Step 96 - P2-10 TTGDTX Tuition Collection.
-- Run after step90_ttgdtx_student_receivables.sql and step95_ttgdtx_department_workload_p2_09.sql.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - No physical removal of business data is used.
-- - If rollback is needed, mark introduced P2-10 payment/invoice records inactive
--   through an approved corrective migration and keep audit evidence.
--
-- Purpose:
-- - Record tuition collection vouchers against P2-03 receivables.
-- - Never create debt here; P2-10 only records collected money and evidence.
-- - Prevent duplicate vouchers and over-collection.
- - Resolve the collection invoice/receipt requirement; do not hard-code a
--   global yes/no answer for invoice issuance.
-- - Keep receivable paid/balance status synchronized for accounting.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.collection.read'),
    ('ttgdtx.collection.manage'),
    ('ttgdtx.collection.approve')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA', 'ACCOUNTING', 'ACCOUNTING_LEAD', 'KHTC')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.collection.read'),
    ('ttgdtx.collection.approve')
) as p(permission)
where r.code in ('BGH', 'AUDIT')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, 'ttgdtx.collection.read'
from public.roles r
where r.code in (
  'ADMISSION_HEAD',
  'TEAM_LEAD',
  'COUNSELOR',
  'CTHSSV_LEAD',
  'LEGAL'
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
    'ttgdtx.collection.read',
    'TTGDTX',
    'Xem thu hoc phi TTGDTX theo hoc sinh va chung tu',
    'M08_FINANCE_ACCOUNTING',
    'KHTC',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    true,
    'Chi xem thu hoc phi trong pham vi doi tuong TTGDTX/doi tac duoc phan quyen.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.collection.manage',
    'TTGDTX',
    'Ghi nhan thu hoc phi TTGDTX va cap nhat cong no',
    'M08_FINANCE_ACCOUNTING',
    'KHTC',
    'CRITICAL',
    'ROLE_AND_SCOPE',
    true,
    true,
    false,
    false,
    'Chi ghi nhan thu khi da co cong no P2-03 hop le; khong cho thu vuot, khong cho trung so chung tu.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.collection.approve',
    'TTGDTX',
    'Duyet doi soat hoac hoan/huy chung tu thu TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + BGH',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    false,
    'Hoan/huy/doi soat chung tu thu phai co ly do, minh chung va nguoi duyet.',
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

create table if not exists public.ttgdtx_tuition_payments (
  id uuid primary key default gen_random_uuid(),
  payment_code text not null unique,
  receivable_id uuid not null references public.ttgdtx_student_receivables(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete restrict,
  partner_id uuid not null references public.partners(id) on delete restrict,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  admission_program_id uuid not null references public.admission_programs(id) on delete restrict,
  admission_major_id uuid not null references public.admission_majors(id) on delete restrict,
  tuition_policy_id uuid not null references public.ttgdtx_tuition_policies(id) on delete restrict,
  contract_id uuid not null references public.ttgdtx_partner_contracts(id) on delete restrict,
  academic_year text not null,
  term_label text not null,
  payment_amount_vnd numeric(14,2) not null,
  payment_date date not null default current_date,
  payment_method text not null default 'BANK_TRANSFER',
  voucher_no text not null,
  evidence_url text,
  payer_name text,
  collector_note text,
  collection_model text not null default 'HEU_COLLECTS',
  invoice_required text not null default 'PENDING_POLICY',
  invoice_issuer text,
  invoice_status text not null default 'PENDING',
  invoice_no text,
  invoice_issue_date date,
  invoice_evidence_url text,
  invoice_waiver_reason text,
  invoice_control_note text,
  payment_status text not null default 'POSTED',
  reversed_by uuid references public.users_profile(id),
  reversed_at timestamptz,
  reverse_reason text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_payment_amount_valid check (payment_amount_vnd > 0),
  constraint ttgdtx_payment_method_valid check (
    payment_method in ('CASH', 'BANK_TRANSFER', 'POS', 'QR', 'OFFSET', 'OTHER')
  ),
  constraint ttgdtx_payment_status_valid check (
    payment_status in ('DRAFT', 'POSTED', 'REVERSED', 'CANCELLED')
  ),
  constraint ttgdtx_payment_collection_model_valid check (
    collection_model in ('HEU_COLLECTS', 'TTGDTX_COLLECTS', 'SPLIT_COLLECTION', 'OTHER')
  ),
  constraint ttgdtx_payment_invoice_required_valid check (
    invoice_required in ('REQUIRED', 'NOT_REQUIRED', 'PENDING_POLICY', 'WAIVED_BY_AUTHORITY')
  ),
  constraint ttgdtx_payment_invoice_issuer_valid check (
    invoice_issuer is null or invoice_issuer in ('HEU', 'TTGDTX', 'PARTNER', 'OTHER_APPROVED')
  ),
  constraint ttgdtx_payment_invoice_status_valid check (
    invoice_status in ('NOT_STARTED', 'PENDING', 'ISSUED', 'CANCELLED', 'REPLACED', 'WAIVED', 'NOT_REQUIRED')
  )
);

alter table public.ttgdtx_tuition_payments
  add column if not exists collection_model text not null default 'HEU_COLLECTS',
  add column if not exists invoice_required text not null default 'PENDING_POLICY',
  add column if not exists invoice_issuer text,
  add column if not exists invoice_status text not null default 'PENDING',
  add column if not exists invoice_no text,
  add column if not exists invoice_issue_date date,
  add column if not exists invoice_evidence_url text,
  add column if not exists invoice_waiver_reason text,
  add column if not exists invoice_control_note text;

create index if not exists idx_ttgdtx_payments_receivable
on public.ttgdtx_tuition_payments(receivable_id, payment_status)
where record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_payments_partner_date
on public.ttgdtx_tuition_payments(partner_id, payment_date)
where record_status = 'ACTIVE';

create unique index if not exists uq_ttgdtx_payment_voucher_active
on public.ttgdtx_tuition_payments(voucher_no)
where record_status = 'ACTIVE'
  and payment_status in ('DRAFT', 'POSTED');

create or replace function public.can_read_ttgdtx_collection(target_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('ttgdtx.collection.read')
    or public.has_permission('ttgdtx.collection.manage')
    or public.has_permission('ttgdtx.collection.approve')
    or public.can_read_ttgdtx_receivable(target_partner_id)
$$;

create or replace function public.can_manage_ttgdtx_collection()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('ttgdtx.collection.manage')
    or public.has_permission('payments.verify')
$$;

grant execute on function public.can_read_ttgdtx_collection(uuid) to authenticated;
grant execute on function public.can_manage_ttgdtx_collection() to authenticated;

create or replace function public.validate_ttgdtx_tuition_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_receivable record;
  v_policy record;
  v_existing_posted numeric(14,2);
  v_new_effective numeric(14,2);
begin
  if auth.uid() is not null and not public.can_manage_ttgdtx_collection() then
    raise exception 'P2-10: Tai khoan chua co quyen ghi nhan thu hoc phi TTGDTX.';
  end if;

  select *
  into v_receivable
  from public.ttgdtx_student_receivables
  where id = new.receivable_id
    and record_status = 'ACTIVE';

  if not found then
    raise exception 'P2-10: Khong tim thay cong no P2-03 dang hoat dong.';
  end if;

  if auth.uid() is not null and not public.can_read_ttgdtx_collection(v_receivable.partner_id) then
    raise exception 'P2-10: Tai khoan chua duoc phan pham vi TTGDTX/doi tac nay.';
  end if;

  if v_receivable.receivable_status in ('CANCELLED', 'WAIVED') then
    raise exception 'P2-10: Cong no da huy/mien, khong duoc ghi nhan thu.';
  end if;

  select collection_model, invoice_issue_rule
  into v_policy
  from public.ttgdtx_tuition_policies
  where id = v_receivable.tuition_policy_id
    and status = 'ACTIVE';

  if not found then
    raise exception 'P2-10: Khong tim thay chinh sach hoc phi P2-02 dang hoat dong.';
  end if;

  if new.payment_amount_vnd <= 0 then
    raise exception 'P2-10: So tien thu phai lon hon 0.';
  end if;

  if nullif(trim(coalesce(new.voucher_no, '')), '') is null then
    raise exception 'P2-10: Bat buoc nhap so chung tu/phieu thu.';
  end if;

  if new.payment_status = 'POSTED'
     and nullif(trim(coalesce(new.evidence_url, new.voucher_no, '')), '') is null then
    raise exception 'P2-10: Chung tu thu phai co so chung tu hoac link minh chung.';
  end if;

  if new.payment_date > current_date + 7 then
    raise exception 'P2-10: Ngay thu khong duoc qua xa ngay hien tai.';
  end if;

  select coalesce(sum(payment_amount_vnd), 0)::numeric(14,2)
  into v_existing_posted
  from public.ttgdtx_tuition_payments
  where receivable_id = new.receivable_id
    and id is distinct from new.id
    and record_status = 'ACTIVE'
    and payment_status = 'POSTED';

  v_new_effective := case
    when new.payment_status = 'POSTED' then new.payment_amount_vnd
    else 0
  end;

  if v_existing_posted + v_new_effective > v_receivable.payable_amount_vnd then
    raise exception 'P2-10: So tien thu vuot cong no con phai thu.';
  end if;

  new.lead_id := v_receivable.lead_id;
  new.partner_id := v_receivable.partner_id;
  new.admission_segment_id := v_receivable.admission_segment_id;
  new.admission_program_id := v_receivable.admission_program_id;
  new.admission_major_id := v_receivable.admission_major_id;
  new.tuition_policy_id := v_receivable.tuition_policy_id;
  new.contract_id := v_receivable.contract_id;
  new.academic_year := v_receivable.academic_year;
  new.term_label := v_receivable.term_label;
  new.voucher_no := trim(new.voucher_no);
  new.evidence_url := nullif(trim(coalesce(new.evidence_url, '')), '');
  new.payer_name := nullif(trim(coalesce(new.payer_name, '')), '');
  new.collector_note := nullif(trim(coalesce(new.collector_note, '')), '');
  new.collection_model := coalesce(nullif(trim(new.collection_model), ''), v_policy.collection_model);
  new.invoice_required := coalesce(nullif(trim(new.invoice_required), ''), 'PENDING_POLICY');
  new.invoice_issuer := nullif(trim(coalesce(new.invoice_issuer, '')), '');
  new.invoice_status := coalesce(nullif(trim(new.invoice_status), ''), 'PENDING');
  new.invoice_no := nullif(trim(coalesce(new.invoice_no, '')), '');
  new.invoice_evidence_url := nullif(trim(coalesce(new.invoice_evidence_url, '')), '');
  new.invoice_waiver_reason := nullif(trim(coalesce(new.invoice_waiver_reason, '')), '');
  new.invoice_control_note := nullif(trim(coalesce(new.invoice_control_note, '')), '');

  if new.invoice_required = 'REQUIRED' then
    if new.invoice_issuer is null then
      raise exception 'P2-10: Khoan thu can hoa don/chung tu phai khai bao ben phat hanh.';
    end if;

    if new.invoice_status = 'ISSUED'
       and (
         new.invoice_no is null
         or new.invoice_issue_date is null
         or new.invoice_evidence_url is null
       ) then
      raise exception 'P2-10: Hoa don/chung tu da phat hanh phai co so, ngay va link minh chung.';
    end if;

    if new.invoice_status in ('WAIVED', 'NOT_REQUIRED') then
      raise exception 'P2-10: Khoan thu bat buoc hoa don/chung tu khong duoc gan trang thai mien/khong can.';
    end if;
  end if;

  if new.invoice_required = 'NOT_REQUIRED' then
    new.invoice_status := 'NOT_REQUIRED';
    new.invoice_issuer := null;
    new.invoice_no := null;
    new.invoice_issue_date := null;
    new.invoice_evidence_url := null;
  end if;

  if new.invoice_required = 'PENDING_POLICY' then
    new.invoice_status := 'PENDING';
  end if;

  if new.invoice_required = 'WAIVED_BY_AUTHORITY' then
    new.invoice_status := 'WAIVED';

    if new.invoice_waiver_reason is null then
      raise exception 'P2-10: Mien hoa don/chung tu phai co ly do/can cu duoc phe duyet.';
    end if;
  end if;

  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
  end if;

  new.updated_by := coalesce(auth.uid(), new.updated_by);
  new.updated_at := now();

  return new;
end;
$$;

drop trigger if exists trg_ttgdtx_payments_validate
on public.ttgdtx_tuition_payments;

create trigger trg_ttgdtx_payments_validate
before insert or update on public.ttgdtx_tuition_payments
for each row execute function public.validate_ttgdtx_tuition_payment();

drop trigger if exists trg_ttgdtx_payments_updated_at
on public.ttgdtx_tuition_payments;

create trigger trg_ttgdtx_payments_updated_at
before update on public.ttgdtx_tuition_payments
for each row execute function public.set_updated_at();

drop trigger if exists trg_ttgdtx_payments_audit
on public.ttgdtx_tuition_payments;

create trigger trg_ttgdtx_payments_audit
after insert or update or delete on public.ttgdtx_tuition_payments
for each row execute function public.write_audit_log();

create or replace function public.refresh_ttgdtx_receivable_collection(target_receivable_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_paid numeric(14,2);
  v_latest record;
begin
  if target_receivable_id is null then
    return;
  end if;

  select coalesce(sum(payment_amount_vnd), 0)::numeric(14,2)
  into v_paid
  from public.ttgdtx_tuition_payments
  where receivable_id = target_receivable_id
    and record_status = 'ACTIVE'
    and payment_status = 'POSTED';

  select voucher_no, evidence_url
  into v_latest
  from public.ttgdtx_tuition_payments
  where receivable_id = target_receivable_id
    and record_status = 'ACTIVE'
    and payment_status = 'POSTED'
  order by payment_date desc, created_at desc
  limit 1;

  update public.ttgdtx_student_receivables
  set
    paid_amount_vnd = v_paid,
    voucher_no = case when v_paid > 0 then v_latest.voucher_no else null end,
    evidence_url = case when v_paid > 0 then v_latest.evidence_url else null end,
    updated_by = coalesce(auth.uid(), updated_by),
    updated_at = now()
  where id = target_receivable_id
    and record_status = 'ACTIVE';
end;
$$;

grant execute on function public.refresh_ttgdtx_receivable_collection(uuid) to authenticated;

create or replace function public.sync_ttgdtx_receivable_after_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_ttgdtx_receivable_collection(old.receivable_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.receivable_id is distinct from new.receivable_id then
    perform public.refresh_ttgdtx_receivable_collection(old.receivable_id);
  end if;

  perform public.refresh_ttgdtx_receivable_collection(new.receivable_id);
  return new;
end;
$$;

drop trigger if exists trg_ttgdtx_payments_sync_receivable
on public.ttgdtx_tuition_payments;

create trigger trg_ttgdtx_payments_sync_receivable
after insert or update or delete on public.ttgdtx_tuition_payments
for each row execute function public.sync_ttgdtx_receivable_after_payment();

alter table public.ttgdtx_tuition_payments enable row level security;

drop policy if exists "ttgdtx_payments_select"
on public.ttgdtx_tuition_payments;

create policy "ttgdtx_payments_select"
on public.ttgdtx_tuition_payments for select
to authenticated
using (public.can_read_ttgdtx_collection(partner_id));

drop policy if exists "ttgdtx_payments_manage"
on public.ttgdtx_tuition_payments;

create policy "ttgdtx_payments_manage"
on public.ttgdtx_tuition_payments for all
to authenticated
using (public.can_manage_ttgdtx_collection() and public.can_read_ttgdtx_collection(partner_id))
with check (public.can_manage_ttgdtx_collection());

create or replace function public.record_ttgdtx_tuition_payment(
  p_receivable_id uuid,
  p_payment_amount_vnd numeric,
  p_payment_date date,
  p_payment_method text default 'BANK_TRANSFER',
  p_voucher_no text default null,
  p_evidence_url text default null,
  p_payer_name text default null,
  p_collector_note text default null,
  p_invoice_required text default 'PENDING_POLICY',
  p_invoice_issuer text default null,
  p_invoice_status text default 'PENDING',
  p_invoice_no text default null,
  p_invoice_issue_date date default null,
  p_invoice_evidence_url text default null,
  p_invoice_waiver_reason text default null,
  p_invoice_control_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment_id uuid;
begin
  if not public.can_manage_ttgdtx_collection() then
    raise exception 'P2-10: Tai khoan chua co quyen ghi nhan thu hoc phi TTGDTX.';
  end if;

  if p_receivable_id is null
     or p_payment_amount_vnd is null
     or p_payment_date is null
     or nullif(trim(coalesce(p_voucher_no, '')), '') is null then
    raise exception 'P2-10: Can chon cong no, so tien, ngay thu va so chung tu.';
  end if;

  insert into public.ttgdtx_tuition_payments (
    payment_code,
    receivable_id,
    lead_id,
    partner_id,
    admission_segment_id,
    admission_program_id,
    admission_major_id,
    tuition_policy_id,
    contract_id,
    academic_year,
    term_label,
    payment_amount_vnd,
    payment_date,
    payment_method,
    voucher_no,
    evidence_url,
    payer_name,
    collector_note,
    collection_model,
    invoice_required,
    invoice_issuer,
    invoice_status,
    invoice_no,
    invoice_issue_date,
    invoice_evidence_url,
    invoice_waiver_reason,
    invoice_control_note,
    payment_status
  )
  select
    'P2-10-' || to_char(now(), 'YYYYMMDD') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
    r.id,
    r.lead_id,
    r.partner_id,
    r.admission_segment_id,
    r.admission_program_id,
    r.admission_major_id,
    r.tuition_policy_id,
    r.contract_id,
    r.academic_year,
    r.term_label,
    p_payment_amount_vnd,
    p_payment_date,
    coalesce(nullif(trim(p_payment_method), ''), 'BANK_TRANSFER'),
    trim(p_voucher_no),
    nullif(trim(coalesce(p_evidence_url, '')), ''),
    nullif(trim(coalesce(p_payer_name, '')), ''),
    nullif(trim(coalesce(p_collector_note, '')), ''),
    tp.collection_model,
    coalesce(nullif(trim(coalesce(p_invoice_required, '')), ''), 'PENDING_POLICY'),
    nullif(trim(coalesce(p_invoice_issuer, '')), ''),
    coalesce(nullif(trim(coalesce(p_invoice_status, '')), ''), 'PENDING'),
    nullif(trim(coalesce(p_invoice_no, '')), ''),
    p_invoice_issue_date,
    nullif(trim(coalesce(p_invoice_evidence_url, '')), ''),
    nullif(trim(coalesce(p_invoice_waiver_reason, '')), ''),
    nullif(trim(coalesce(p_invoice_control_note, '')), ''),
    'POSTED'
  from public.ttgdtx_student_receivables r
  join public.ttgdtx_tuition_policies tp on tp.id = r.tuition_policy_id
  where r.id = p_receivable_id
    and r.record_status = 'ACTIVE'
  returning id into v_payment_id;

  if v_payment_id is null then
    raise exception 'P2-10: Khong tim thay cong no P2-03 de ghi nhan thu.';
  end if;

  return v_payment_id;
end;
$$;

grant execute on function public.record_ttgdtx_tuition_payment(
  uuid,
  numeric,
  date,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  text,
  text,
  text
) to authenticated;

create or replace function public.reverse_ttgdtx_tuition_payment(
  p_payment_id uuid,
  p_reverse_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (
    public.is_admin()
    or public.has_permission('ttgdtx.collection.approve')
  ) then
    raise exception 'P2-10: Hoan/huy chung tu thu can quyen duyet.';
  end if;

  if nullif(trim(coalesce(p_reverse_reason, '')), '') is null then
    raise exception 'P2-10: Hoan/huy chung tu thu phai co ly do.';
  end if;

  update public.ttgdtx_tuition_payments
  set
    payment_status = 'REVERSED',
    reversed_by = auth.uid(),
    reversed_at = now(),
    reverse_reason = p_reverse_reason,
    updated_by = auth.uid(),
    updated_at = now()
  where id = p_payment_id
    and record_status = 'ACTIVE'
    and payment_status = 'POSTED';

  if not found then
    raise exception 'P2-10: Khong tim thay chung tu POSTED de hoan/huy.';
  end if;

  return p_payment_id;
end;
$$;

grant execute on function public.reverse_ttgdtx_tuition_payment(uuid, text) to authenticated;

create or replace view public.ttgdtx_collection_candidate_receivables
with (security_invoker = true)
as
select
  r.*,
  tp.collection_model,
  tp.invoice_issue_rule,
  array_remove(array[
    case when r.receivable_status in ('CANCELLED', 'WAIVED') then 'RECEIVABLE_CLOSED' end,
    case when r.balance_amount_vnd <= 0 then 'NO_BALANCE' end,
    case when r.readiness_status in ('CONTRACT_NOT_READY', 'POLICY_NOT_READY') then r.readiness_status end
  ], null) as blocking_items,
  (
    r.balance_amount_vnd > 0
    and r.receivable_status not in ('CANCELLED', 'WAIVED')
    and r.readiness_status not in ('CONTRACT_NOT_READY', 'POLICY_NOT_READY')
  ) as can_record_payment
from public.ttgdtx_student_receivable_readiness r
join public.ttgdtx_tuition_policies tp on tp.id = r.tuition_policy_id;

grant select on public.ttgdtx_collection_candidate_receivables to authenticated;

create or replace view public.ttgdtx_tuition_payment_board
with (security_invoker = true)
as
select
  p.id as payment_id,
  p.payment_code,
  p.receivable_id,
  r.receivable_code,
  p.lead_id,
  l.lead_code,
  p.partner_id,
  partner.partner_code,
  partner.partner_name,
  p.admission_segment_id,
  s.segment_name,
  p.admission_program_id,
  pr.program_name,
  p.admission_major_id,
  m.major_name,
  p.tuition_policy_id,
  tp.policy_code,
  p.contract_id,
  c.contract_code,
  p.academic_year,
  p.term_label,
  r.student_name,
  r.student_phone,
  p.payment_amount_vnd,
  p.payment_date,
  p.payment_method,
  p.voucher_no,
  p.evidence_url,
  p.payer_name,
  p.collector_note,
  p.collection_model,
  p.invoice_required,
  p.invoice_issuer,
  p.invoice_status,
  p.invoice_no,
  p.invoice_issue_date,
  p.invoice_evidence_url,
  p.invoice_waiver_reason,
  p.invoice_control_note,
  case
    when p.invoice_required = 'REQUIRED'
      and p.invoice_status = 'ISSUED'
      and p.invoice_no is not null
      and p.invoice_issue_date is not null
      and p.invoice_evidence_url is not null
      then 'RESOLVED'
    when p.invoice_required = 'NOT_REQUIRED'
      and p.invoice_status = 'NOT_REQUIRED'
      then 'RESOLVED'
    when p.invoice_required = 'WAIVED_BY_AUTHORITY'
      and p.invoice_status = 'WAIVED'
      and p.invoice_waiver_reason is not null
      then 'RESOLVED'
    else 'NEEDS_INVOICE_DECISION'
  end as invoice_control_status,
  p.payment_status,
  p.reversed_at,
  p.reverse_reason,
  creator.full_name as created_by_name,
  p.created_at,
  p.updated_at
from public.ttgdtx_tuition_payments p
join public.ttgdtx_student_receivables r on r.id = p.receivable_id
join public.leads l on l.id = p.lead_id
join public.partners partner on partner.id = p.partner_id
join public.admission_segments s on s.id = p.admission_segment_id
join public.admission_programs pr on pr.id = p.admission_program_id
join public.admission_majors m on m.id = p.admission_major_id
join public.ttgdtx_tuition_policies tp on tp.id = p.tuition_policy_id
join public.ttgdtx_partner_contracts c on c.id = p.contract_id
left join public.users_profile creator on creator.id = p.created_by
where p.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_collection(p.partner_id);

grant select on public.ttgdtx_tuition_payment_board to authenticated;

create or replace view public.ttgdtx_collection_summary
with (security_invoker = true)
as
select
  coalesce((select count(*)::int from public.ttgdtx_collection_candidate_receivables), 0) as receivable_count,
  coalesce((select count(*)::int from public.ttgdtx_collection_candidate_receivables where can_record_payment), 0) as collectible_count,
  coalesce((select sum(payable_amount_vnd)::numeric(14,2) from public.ttgdtx_collection_candidate_receivables), 0)::numeric(14,2) as payable_total_vnd,
  coalesce((select sum(paid_amount_vnd)::numeric(14,2) from public.ttgdtx_collection_candidate_receivables), 0)::numeric(14,2) as paid_total_vnd,
  coalesce((select sum(balance_amount_vnd)::numeric(14,2) from public.ttgdtx_collection_candidate_receivables), 0)::numeric(14,2) as balance_total_vnd,
  coalesce((select count(*)::int from public.ttgdtx_tuition_payment_board where payment_status = 'POSTED'), 0) as payment_count,
  coalesce((select sum(payment_amount_vnd)::numeric(14,2) from public.ttgdtx_tuition_payment_board where payment_status = 'POSTED' and payment_date = current_date), 0)::numeric(14,2) as collected_today_vnd;

grant select on public.ttgdtx_collection_summary to authenticated;

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
  'TTGDTX_TUITION_COLLECTION',
  'P2-10 Thu tien hoc phi va doi soat chung tu TTGDTX',
  'FINANCE',
  'KHTC',
  '/ttgdtx/payments',
  true,
  'P2-10 ghi nhan so tien da thu theo cong no P2-03, bat buoc co so chung tu, chan thu vuot va chan trung chung tu.',
  72,
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
  'WF_P2_10_TTGDTX_TUITION_COLLECTION',
  'P2-10 Thu tien hoc phi va doi soat chung tu TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Khi cong no P2-03 da san sang thu va ke toan nhan duoc tien/chung tu.',
  'KHTC/ACCOUNTING',
  'KHTC',
  'ACCOUNTING_LEAD',
  'BGH/KE_TOAN_TRUONG',
  'Chung tu thu hop le, cong no duoc cap nhat da thu/con phai thu, san sang doi soat ky sau.',
  'P2-10 chi ghi thu; chi tra TTGDTX/COM se qua buoc doi soat va duyet rieng.',
  'Moi chung tu thu phai ghi audit log, khong trung voucher, khong vuot cong no va phai co trang thai hoa don/chung tu thu.',
  2100,
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
  'P2_10_TTGDTX_TUITION_PAYMENTS',
  'P2-10 chung tu thu hoc phi TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_tuition_payments; ttgdtx_tuition_payment_board; ttgdtx_collection_summary',
  'TRANSACTION',
  'KHTC',
  'SUPABASE',
  'RESTRICTED',
  true,
  'Khong nhap truc tiep vao bang; ghi thu qua function P2-10 de chan trung chung tu, thu vuot, sai pham vi va thieu quyet dinh hoa don/chung tu.',
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
  'OWN_P2_10_TTGDTX_TUITION_COLLECTION',
  'P2-10 Thu tien hoc phi va doi soat chung tu TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_10_TTGDTX_TUITION_COLLECTION',
  'TTGDTX_TUITION_PAYMENT',
  'ttgdtx_tuition_payments',
  'KHTC',
  'ACCOUNTING_STAFF/KHTC',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/KE_TOAN_TRUONG',
  'ROLE_AND_SCOPE',
  'P2-03_CONG_NO',
  'P2-11_DOI_SOAT_TTGDTX',
  'So chung tu, ngay thu, so tien, link minh chung, quyet dinh hoa don/chung tu va cong no P2-03.',
  'Moi ghi nhan/hoan/huy chung tu thu phai qua function P2-10 va audit log; khong duoc thu vuot cong no hoac bo qua quyet dinh hoa don/chung tu.',
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
  'GATE_P2_10_TTGDTX_TUITION_COLLECTION',
  'Gate P2-10: thu hoc phi dung cong no, dung chung tu, khong thu vuot',
  'FINANCE',
  'TTGDTX_TUITION_PAYMENT',
  'P2-10-TUITION-COLLECTION',
  'KHTC + AUDIT',
  'Kiem tra chung tu khong trung, so tien khong vuot cong no P2-03, dung pham vi TTGDTX va co quyet dinh hoa don/chung tu.',
  'Ke toan truong/BGH chi cho doi soat chi tra khi thu tien co log, chung tu hop le va trang thai hoa don/chung-tu da ro.',
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
