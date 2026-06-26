-- Step 101 / P2-13: TTGDTX tuition reconciliation.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - No physical removal of business data is used.
-- - If rollback is needed, mark introduced P2-13 batch/line records inactive
--   through an approved corrective migration and keep audit evidence.
--
-- Purpose: group posted P2-10 receipts into an accounting reconciliation batch.
-- This step does not pay TTGDTX and does not post final accounting entries.
-- P2-13 must not pull a P2-10 payment into reconciliation while its
-- collection invoice/receipt decision is unresolved.

create table if not exists public.ttgdtx_tuition_reconciliation_batches (
  id uuid primary key default gen_random_uuid(),
  batch_code text not null unique,
  batch_name text not null,
  partner_id uuid not null references public.partners(id) on delete restrict,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  period_label text not null,
  period_start date not null,
  period_end date not null,
  total_receivable_vnd numeric(14,2) not null default 0,
  total_collected_vnd numeric(14,2) not null default 0,
  total_balance_vnd numeric(14,2) not null default 0,
  payment_count integer not null default 0,
  student_count integer not null default 0,
  reconciliation_status text not null default 'READY_FOR_REVIEW',
  evidence_url text,
  note text,
  risk_level text not null default 'HIGH',
  control_status text not null default 'DAT_TAM_THOI',
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_reconciliation_period_valid check (period_end >= period_start),
  constraint ttgdtx_reconciliation_status_valid check (
    reconciliation_status in ('DRAFT', 'READY_FOR_REVIEW', 'REVIEWED', 'APPROVED', 'LOCKED', 'CANCELLED')
  ),
  constraint ttgdtx_reconciliation_risk_valid check (
    risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
  ),
  constraint ttgdtx_reconciliation_control_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.ttgdtx_tuition_reconciliation_lines (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.ttgdtx_tuition_reconciliation_batches(id) on delete restrict,
  receivable_id uuid not null references public.ttgdtx_student_receivables(id) on delete restrict,
  payment_id uuid not null references public.ttgdtx_tuition_payments(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete restrict,
  partner_id uuid not null references public.partners(id) on delete restrict,
  contract_id uuid not null references public.ttgdtx_partner_contracts(id) on delete restrict,
  tuition_policy_id uuid not null references public.ttgdtx_tuition_policies(id) on delete restrict,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  admission_program_id uuid not null references public.admission_programs(id) on delete restrict,
  admission_major_id uuid not null references public.admission_majors(id) on delete restrict,
  receivable_code text not null,
  payment_code text not null,
  voucher_no text not null,
  student_name text not null,
  student_phone text,
  academic_year text not null,
  term_label text not null,
  receivable_amount_vnd numeric(14,2) not null default 0,
  collected_amount_vnd numeric(14,2) not null default 0,
  balance_amount_vnd numeric(14,2) not null default 0,
  payment_date date not null,
  invoice_required text,
  invoice_issuer text,
  invoice_status text,
  invoice_no text,
  invoice_control_status text not null default 'NEEDS_INVOICE_DECISION',
  line_status text not null default 'IN_BATCH',
  warning_items text[] not null default '{}'::text[],
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_reconciliation_line_status_valid check (
    line_status in ('READY', 'BLOCKED', 'IN_BATCH', 'REVIEWED', 'EXCLUDED', 'CANCELLED')
  )
);

alter table public.ttgdtx_tuition_reconciliation_lines
  add column if not exists invoice_required text,
  add column if not exists invoice_issuer text,
  add column if not exists invoice_status text,
  add column if not exists invoice_no text,
  add column if not exists invoice_control_status text not null default 'NEEDS_INVOICE_DECISION';

create index if not exists idx_ttgdtx_reconciliation_batches_partner
on public.ttgdtx_tuition_reconciliation_batches(partner_id, period_start, period_end)
where record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_reconciliation_lines_batch
on public.ttgdtx_tuition_reconciliation_lines(batch_id)
where record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_reconciliation_lines_partner
on public.ttgdtx_tuition_reconciliation_lines(partner_id, payment_date)
where record_status = 'ACTIVE';

create unique index if not exists uq_ttgdtx_reconciliation_payment_once
on public.ttgdtx_tuition_reconciliation_lines(payment_id)
where record_status = 'ACTIVE'
  and line_status not in ('CANCELLED', 'EXCLUDED');

drop trigger if exists set_updated_at_ttgdtx_reconciliation_batches on public.ttgdtx_tuition_reconciliation_batches;
create trigger set_updated_at_ttgdtx_reconciliation_batches
before update on public.ttgdtx_tuition_reconciliation_batches
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_ttgdtx_reconciliation_lines on public.ttgdtx_tuition_reconciliation_lines;
create trigger set_updated_at_ttgdtx_reconciliation_lines
before update on public.ttgdtx_tuition_reconciliation_lines
for each row execute function public.set_updated_at();

drop trigger if exists audit_ttgdtx_reconciliation_batches on public.ttgdtx_tuition_reconciliation_batches;
create trigger audit_ttgdtx_reconciliation_batches
after insert or update or delete on public.ttgdtx_tuition_reconciliation_batches
for each row execute function public.write_audit_log();

drop trigger if exists audit_ttgdtx_reconciliation_lines on public.ttgdtx_tuition_reconciliation_lines;
create trigger audit_ttgdtx_reconciliation_lines
after insert or update or delete on public.ttgdtx_tuition_reconciliation_lines
for each row execute function public.write_audit_log();

create or replace function public.can_read_ttgdtx_reconciliation(target_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('ttgdtx.reconciliation.read')
    or public.has_permission('ttgdtx.reconciliation.manage')
    or public.can_read_ttgdtx_collection(target_partner_id);
$$;

create or replace function public.can_manage_ttgdtx_reconciliation()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() in ('BGH', 'ADMIN')
    or public.has_permission('ttgdtx.reconciliation.manage')
    or public.has_permission('payments.verify')
    or public.can_manage_ttgdtx_collection();
$$;

grant execute on function public.can_read_ttgdtx_reconciliation(uuid) to authenticated;
grant execute on function public.can_manage_ttgdtx_reconciliation() to authenticated;

alter table public.ttgdtx_tuition_reconciliation_batches enable row level security;
alter table public.ttgdtx_tuition_reconciliation_lines enable row level security;

drop policy if exists ttgdtx_reconciliation_batches_select on public.ttgdtx_tuition_reconciliation_batches;
create policy ttgdtx_reconciliation_batches_select
on public.ttgdtx_tuition_reconciliation_batches
for select
using (public.can_read_ttgdtx_reconciliation(partner_id));

drop policy if exists ttgdtx_reconciliation_batches_manage on public.ttgdtx_tuition_reconciliation_batches;
create policy ttgdtx_reconciliation_batches_manage
on public.ttgdtx_tuition_reconciliation_batches
for all
using (
  public.can_manage_ttgdtx_reconciliation()
  and public.can_read_ttgdtx_reconciliation(partner_id)
)
with check (public.can_manage_ttgdtx_reconciliation());

drop policy if exists ttgdtx_reconciliation_lines_select on public.ttgdtx_tuition_reconciliation_lines;
create policy ttgdtx_reconciliation_lines_select
on public.ttgdtx_tuition_reconciliation_lines
for select
using (public.can_read_ttgdtx_reconciliation(partner_id));

drop policy if exists ttgdtx_reconciliation_lines_manage on public.ttgdtx_tuition_reconciliation_lines;
create policy ttgdtx_reconciliation_lines_manage
on public.ttgdtx_tuition_reconciliation_lines
for all
using (
  public.can_manage_ttgdtx_reconciliation()
  and public.can_read_ttgdtx_reconciliation(partner_id)
)
with check (public.can_manage_ttgdtx_reconciliation());

create or replace view public.ttgdtx_reconciliation_candidates
with (security_invoker = true)
as
select
  candidate.*,
  coalesce(array_length(candidate.blocking_items, 1), 0) = 0 as can_reconcile
from (
  select
    p.payment_id,
    p.payment_code,
    p.receivable_id,
    p.receivable_code,
    p.lead_id,
    p.lead_code,
    p.partner_id,
    p.partner_code,
    p.partner_name,
    p.admission_segment_id,
    p.segment_name,
    p.admission_program_id,
    p.program_name,
    p.admission_major_id,
    p.major_name,
    p.tuition_policy_id,
    p.policy_code,
    p.contract_id,
    p.contract_code,
    p.academic_year,
    p.term_label,
    p.student_name,
    p.student_phone,
    r.payable_amount_vnd,
    r.paid_amount_vnd,
    r.balance_amount_vnd,
    p.payment_amount_vnd,
    p.payment_date,
    p.payment_method,
    p.voucher_no,
    p.evidence_url,
    p.payer_name,
    p.collector_note,
    p.invoice_required,
    p.invoice_issuer,
    p.invoice_status,
    p.invoice_no,
    p.invoice_control_status,
    p.payment_status,
    r.receivable_status,
    r.collection_status,
    batch.id as existing_batch_id,
    batch.batch_code as existing_batch_code,
    array_remove(array[
      case when p.payment_status <> 'POSTED' then 'PAYMENT_NOT_POSTED' end,
      case when r.receivable_status in ('CANCELLED', 'WAIVED') then 'RECEIVABLE_CLOSED' end,
      case when r.balance_amount_vnd > 0 then 'RECEIVABLE_NOT_FULLY_PAID' end,
      case when nullif(trim(coalesce(p.voucher_no, '')), '') is null then 'MISSING_VOUCHER' end,
      case when p.invoice_control_status <> 'RESOLVED' then 'NEEDS_INVOICE_DECISION' end,
      case when line.id is not null then 'ALREADY_RECONCILED' end
    ], null::text) as blocking_items,
    array_remove(array[
      case when nullif(trim(coalesce(p.evidence_url, '')), '') is null then 'MISSING_EVIDENCE_URL' end,
      case when p.invoice_required = 'REQUIRED' and p.invoice_status <> 'ISSUED' then 'INVOICE_REQUIRED_NOT_ISSUED' end,
      case when p.payment_method = 'OFFSET' then 'OFFSET_PAYMENT_NEEDS_CHECK' end
    ], null::text) as warning_items
  from public.ttgdtx_tuition_payment_board p
  join public.ttgdtx_student_receivables r
    on r.id = p.receivable_id
  left join public.ttgdtx_tuition_reconciliation_lines line
    on line.payment_id = p.payment_id
   and line.record_status = 'ACTIVE'
   and line.line_status not in ('CANCELLED', 'EXCLUDED')
  left join public.ttgdtx_tuition_reconciliation_batches batch
    on batch.id = line.batch_id
   and batch.record_status = 'ACTIVE'
  where public.can_read_ttgdtx_reconciliation(p.partner_id)
) candidate;

grant select on public.ttgdtx_reconciliation_candidates to authenticated;

create or replace view public.ttgdtx_reconciliation_summary
with (security_invoker = true)
as
select
  coalesce((select count(*)::int from public.ttgdtx_reconciliation_candidates), 0) as candidate_count,
  coalesce((select count(*)::int from public.ttgdtx_reconciliation_candidates where can_reconcile), 0) as ready_count,
  coalesce((select count(*)::int from public.ttgdtx_reconciliation_candidates where not can_reconcile and existing_batch_id is null), 0) as blocked_count,
  coalesce((select count(*)::int from public.ttgdtx_reconciliation_candidates where existing_batch_id is not null), 0) as already_in_batch_count,
  coalesce((select sum(payment_amount_vnd) from public.ttgdtx_reconciliation_candidates), 0)::numeric(14,2) as candidate_total_vnd,
  coalesce((select sum(payment_amount_vnd) from public.ttgdtx_reconciliation_candidates where can_reconcile), 0)::numeric(14,2) as ready_total_vnd,
  coalesce((select sum(payment_amount_vnd) from public.ttgdtx_reconciliation_candidates where payment_status = 'POSTED'), 0)::numeric(14,2) as posted_collected_vnd,
  coalesce((
    select count(*)::int
    from public.ttgdtx_tuition_reconciliation_batches
    where record_status = 'ACTIVE'
      and public.can_read_ttgdtx_reconciliation(partner_id)
  ), 0) as batch_count,
  coalesce((
    select sum(total_collected_vnd)
    from public.ttgdtx_tuition_reconciliation_batches
    where record_status = 'ACTIVE'
      and public.can_read_ttgdtx_reconciliation(partner_id)
  ), 0)::numeric(14,2) as batched_total_vnd;

grant select on public.ttgdtx_reconciliation_summary to authenticated;

create or replace view public.ttgdtx_reconciliation_batch_board
with (security_invoker = true)
as
select
  b.id as batch_id,
  b.batch_code,
  b.batch_name,
  b.partner_id,
  partner.partner_code,
  partner.partner_name,
  b.admission_segment_id,
  s.segment_name,
  b.period_label,
  b.period_start,
  b.period_end,
  b.total_receivable_vnd,
  b.total_collected_vnd,
  b.total_balance_vnd,
  b.payment_count,
  b.student_count,
  b.reconciliation_status,
  b.evidence_url,
  b.note,
  b.risk_level,
  b.control_status,
  creator.full_name as created_by_name,
  b.created_at,
  b.updated_at
from public.ttgdtx_tuition_reconciliation_batches b
join public.partners partner on partner.id = b.partner_id
join public.admission_segments s on s.id = b.admission_segment_id
left join public.users_profile creator on creator.id = b.created_by
where b.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_reconciliation(b.partner_id);

grant select on public.ttgdtx_reconciliation_batch_board to authenticated;

create or replace function public.create_ttgdtx_reconciliation_batch(
  p_partner_id uuid,
  p_period_label text,
  p_period_start date,
  p_period_end date,
  p_note text default null,
  p_evidence_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_batch_id uuid;
  v_segment_id uuid;
  v_partner_name text;
  v_line_count integer;
begin
  if not public.can_manage_ttgdtx_reconciliation() then
    raise exception 'P2-13: Tai khoan chua co quyen lap ky doi soat TTGDTX.';
  end if;

  if p_partner_id is null
     or nullif(trim(coalesce(p_period_label, '')), '') is null
     or p_period_start is null
     or p_period_end is null then
    raise exception 'P2-13: Can chon TTGDTX, ky doi soat, ngay bat dau va ngay ket thuc.';
  end if;

  if p_period_end < p_period_start then
    raise exception 'P2-13: Ngay ket thuc khong duoc truoc ngay bat dau.';
  end if;

  if not public.can_read_ttgdtx_reconciliation(p_partner_id) then
    raise exception 'P2-13: Tai khoan chua duoc xem TTGDTX nay.';
  end if;

  select p.partner_name
  into v_partner_name
  from public.partners p
  where p.id = p_partner_id
    and p.status = 'ACTIVE';

  if v_partner_name is null then
    raise exception 'P2-13: Khong tim thay TTGDTX/doi tac dang hoat dong.';
  end if;

  select c.admission_segment_id
  into v_segment_id
  from public.ttgdtx_reconciliation_candidates c
  where c.partner_id = p_partner_id
    and c.can_reconcile
    and c.payment_date between p_period_start and p_period_end
  order by c.payment_date desc
  limit 1;

  if v_segment_id is null then
    raise exception 'P2-13: Khong co chung tu du dieu kien doi soat trong ky nay.';
  end if;

  insert into public.ttgdtx_tuition_reconciliation_batches (
    batch_code,
    batch_name,
    partner_id,
    admission_segment_id,
    period_label,
    period_start,
    period_end,
    evidence_url,
    note,
    created_by,
    updated_by
  ) values (
    'P2-13-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
    'Doi soat thu hoc phi TTGDTX - ' || v_partner_name || ' - ' || trim(p_period_label),
    p_partner_id,
    v_segment_id,
    trim(p_period_label),
    p_period_start,
    p_period_end,
    nullif(trim(coalesce(p_evidence_url, '')), ''),
    nullif(trim(coalesce(p_note, '')), ''),
    auth.uid(),
    auth.uid()
  )
  returning id into v_batch_id;

  insert into public.ttgdtx_tuition_reconciliation_lines (
    batch_id,
    receivable_id,
    payment_id,
    lead_id,
    partner_id,
    contract_id,
    tuition_policy_id,
    admission_segment_id,
    admission_program_id,
    admission_major_id,
    receivable_code,
    payment_code,
    voucher_no,
    student_name,
    student_phone,
    academic_year,
    term_label,
    receivable_amount_vnd,
    collected_amount_vnd,
    balance_amount_vnd,
    payment_date,
    invoice_required,
    invoice_issuer,
    invoice_status,
    invoice_no,
    invoice_control_status,
    warning_items,
    note,
    created_by,
    updated_by
  )
  select
    v_batch_id,
    c.receivable_id,
    c.payment_id,
    c.lead_id,
    c.partner_id,
    c.contract_id,
    c.tuition_policy_id,
    c.admission_segment_id,
    c.admission_program_id,
    c.admission_major_id,
    c.receivable_code,
    c.payment_code,
    c.voucher_no,
    c.student_name,
    c.student_phone,
    c.academic_year,
    c.term_label,
    c.payable_amount_vnd,
    c.payment_amount_vnd,
    c.balance_amount_vnd,
    c.payment_date,
    c.invoice_required,
    c.invoice_issuer,
    c.invoice_status,
    c.invoice_no,
    c.invoice_control_status,
    c.warning_items,
    nullif(trim(coalesce(p_note, '')), ''),
    auth.uid(),
    auth.uid()
  from public.ttgdtx_reconciliation_candidates c
  where c.partner_id = p_partner_id
    and c.can_reconcile
    and c.payment_date between p_period_start and p_period_end;

  get diagnostics v_line_count = row_count;

  if v_line_count <= 0 then
    -- The exception rolls back the inserted draft batch in the same statement.
    -- Do not hard-delete finance/reconciliation records in migration logic.
    raise exception 'P2-13: Khong co chung tu du dieu kien doi soat trong ky nay.';
  end if;

  update public.ttgdtx_tuition_reconciliation_batches b
  set
    total_receivable_vnd = totals.total_receivable_vnd,
    total_collected_vnd = totals.total_collected_vnd,
    total_balance_vnd = totals.total_balance_vnd,
    payment_count = totals.payment_count,
    student_count = totals.student_count,
    reconciliation_status = 'READY_FOR_REVIEW',
    updated_by = auth.uid(),
    updated_at = now()
  from (
    select
      coalesce(sum(receivable_amount_vnd), 0)::numeric(14,2) as total_receivable_vnd,
      coalesce(sum(collected_amount_vnd), 0)::numeric(14,2) as total_collected_vnd,
      coalesce(sum(balance_amount_vnd), 0)::numeric(14,2) as total_balance_vnd,
      count(*)::int as payment_count,
      count(distinct lead_id)::int as student_count
    from public.ttgdtx_tuition_reconciliation_lines
    where batch_id = v_batch_id
      and record_status = 'ACTIVE'
      and line_status not in ('CANCELLED', 'EXCLUDED')
  ) totals
  where b.id = v_batch_id;

  return v_batch_id;
end;
$$;

grant execute on function public.create_ttgdtx_reconciliation_batch(uuid, text, date, date, text, text) to authenticated;

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
  'TTGDTX_TUITION_RECONCILIATION_P2_13',
  'P2-13 Doi soat thu hoc phi TTGDTX',
  'FINANCE',
  'KHTC + AUDIT + BGH',
  '/ttgdtx/reconciliation',
  true,
  'P2-13 gom chung tu da thu P2-10 thanh ky doi soat. Khong chi tien, khong post ke toan cuoi cung va khong nhan chung tu con thieu quyet dinh hoa don/chung tu.',
  2130,
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
  'WF_P2_13_TTGDTX_TUITION_RECONCILIATION',
  'P2-13 Doi soat thu hoc phi TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Sau khi P2-10 da ghi nhan tien thu, P2-03 het so du can thu va hoa don/chung tu thu da duoc phan loai.',
  'KHTC',
  'KHTC + AUDIT + BGH',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Mot ky doi soat gom cac chung tu da thu, so tien, hoc sinh, doi tac va canh bao minh chung.',
  'P2-13 la dau vao cho doi soat chi tra TTGDTX va bao cao ke toan, khong tu chi tien.',
  'Moi chung tu chi vao mot ky doi soat dang hieu luc; moi batch va line deu ghi audit log; chung tu can chot hoa don/chung tu khong duoc vao ky.',
  2130,
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
  'P2_13_TTGDTX_TUITION_RECONCILIATION',
  'P2-13 Doi soat thu hoc phi TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_tuition_reconciliation_batches; ttgdtx_tuition_reconciliation_lines; ttgdtx_reconciliation_candidates',
  'TRANSACTION',
  'KHTC + AUDIT + BGH',
  'SUPABASE',
  'RESTRICTED',
  false,
  'Chi tao batch qua function P2-13; khong sua truc tiep bang loi; khong dua mot voucher vao hai ky.',
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
  'OWN_P2_13_TTGDTX_TUITION_RECONCILIATION',
  'P2-13 Doi soat thu hoc phi TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_13_TTGDTX_TUITION_RECONCILIATION',
  'TTGDTX_TUITION_RECONCILIATION',
  'ttgdtx_tuition_reconciliation_batches; ttgdtx_tuition_reconciliation_lines',
  'KHTC + AUDIT + BGH',
  'KHTC',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'ROLE_AND_SCOPE',
  'KHTC',
  'AUDIT + BGH + TTGDTX_SETTLEMENT',
  'Danh sach chung tu thu, so tien, hoc sinh, TTGDTX, link minh chung neu co.',
  'Khong cho mot payment_id vao hai batch active; batch va line deu ghi audit log.',
  48,
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
  'GATE_P2_13_TTGDTX_TUITION_RECONCILIATION',
  'Gate P2-13: doi soat thu hoc phi TTGDTX truoc khi chi/bao cao',
  'FINANCE',
  'TTGDTX_TUITION_RECONCILIATION',
  'P2-13-TTGDTX-RECONCILIATION',
  'KHTC + AUDIT + BGH',
  'Chi doi soat chung tu POSTED, cong no da thu du, khong trung batch, co so chung tu.',
  'BGH/Audit xem batch truoc khi chuyen sang chi tra TTGDTX hoac bao cao tai chinh.',
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
  'NAV_P2_13_TTGDTX_RECONCILIATION',
  'P2-13 Doi soat thu TTGDTX',
  'FINANCE',
  'M08_FINANCE_ACCOUNTING',
  '/ttgdtx/reconciliation',
  'Lap ky doi soat cac chung tu thu hoc phi TTGDTX da ghi nhan o P2-10.',
  'KHTC + AUDIT + BGH',
  'Mo P2-13 de gom chung tu da thu thanh mot ky doi soat.',
  2130,
  false,
  'Can xu ly khi co chung tu da thu chua doi soat, thieu minh chung hoac bi chan do cong no chua thu du.',
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
