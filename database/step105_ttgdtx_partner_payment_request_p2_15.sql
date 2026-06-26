-- Step 105 / P2-15: TTGDTX partner payment request.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - No physical removal of business data is used.
-- - If rollback is needed, mark introduced P2-15 request/line records inactive
--   through an approved corrective migration and keep audit evidence.
--
-- Purpose: create a controlled payment proposal from a locked P2-14 reconciliation batch.
-- P2-15 does not pay money. Actual payout must be a later approval/payment step.
-- P2-15 must not create a payment request from a batch that still has unresolved
-- P2-10 collection invoice/receipt decisions.

create table if not exists public.ttgdtx_partner_payment_requests (
  id uuid primary key default gen_random_uuid(),
  request_code text not null unique,
  request_name text not null,
  reconciliation_batch_id uuid not null references public.ttgdtx_tuition_reconciliation_batches(id) on delete restrict,
  partner_id uuid not null references public.partners(id) on delete restrict,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  period_label text not null,
  period_start date not null,
  period_end date not null,
  total_reconciled_vnd numeric(14,2) not null default 0,
  requested_amount_vnd numeric(14,2) not null default 0,
  approved_amount_vnd numeric(14,2) not null default 0,
  paid_amount_vnd numeric(14,2) not null default 0,
  payment_count integer not null default 0,
  student_count integer not null default 0,
  line_count integer not null default 0,
  request_status text not null default 'SUBMITTED',
  evidence_url text,
  note text,
  risk_level text not null default 'HIGH',
  control_status text not null default 'DAT_TAM_THOI',
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_payment_request_period_valid check (period_end >= period_start),
  constraint ttgdtx_payment_request_amount_valid check (
    total_reconciled_vnd >= 0
    and requested_amount_vnd >= 0
    and approved_amount_vnd >= 0
    and paid_amount_vnd >= 0
    and requested_amount_vnd <= total_reconciled_vnd
    and approved_amount_vnd <= requested_amount_vnd
    and paid_amount_vnd <= approved_amount_vnd
  ),
  constraint ttgdtx_payment_request_status_valid check (
    request_status in ('SUBMITTED', 'CHECKED', 'APPROVED', 'REJECTED', 'CANCELLED', 'PAID')
  ),
  constraint ttgdtx_payment_request_risk_valid check (
    risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
  ),
  constraint ttgdtx_payment_request_control_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.ttgdtx_partner_payment_request_lines (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.ttgdtx_partner_payment_requests(id) on delete restrict,
  reconciliation_line_id uuid not null references public.ttgdtx_tuition_reconciliation_lines(id) on delete restrict,
  reconciliation_batch_id uuid not null references public.ttgdtx_tuition_reconciliation_batches(id) on delete restrict,
  receivable_id uuid not null references public.ttgdtx_student_receivables(id) on delete restrict,
  payment_id uuid not null references public.ttgdtx_tuition_payments(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete restrict,
  partner_id uuid not null references public.partners(id) on delete restrict,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  receivable_code text not null,
  payment_code text not null,
  voucher_no text not null,
  student_name text not null,
  student_phone text,
  academic_year text not null,
  term_label text not null,
  collected_amount_vnd numeric(14,2) not null default 0,
  requested_amount_vnd numeric(14,2) not null default 0,
  line_status text not null default 'IN_REQUEST',
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_payment_request_line_amount_valid check (
    collected_amount_vnd >= 0
    and requested_amount_vnd >= 0
    and requested_amount_vnd <= collected_amount_vnd
  ),
  constraint ttgdtx_payment_request_line_status_valid check (
    line_status in ('IN_REQUEST', 'EXCLUDED', 'CANCELLED')
  )
);

create index if not exists idx_ttgdtx_payment_requests_partner
on public.ttgdtx_partner_payment_requests(partner_id, period_start, period_end)
where record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_payment_request_lines_request
on public.ttgdtx_partner_payment_request_lines(request_id)
where record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_payment_request_lines_partner
on public.ttgdtx_partner_payment_request_lines(partner_id, created_at)
where record_status = 'ACTIVE';

create unique index if not exists uq_ttgdtx_payment_request_batch_once
on public.ttgdtx_partner_payment_requests(reconciliation_batch_id)
where record_status = 'ACTIVE'
  and request_status not in ('CANCELLED', 'REJECTED');

create unique index if not exists uq_ttgdtx_payment_request_line_once
on public.ttgdtx_partner_payment_request_lines(reconciliation_line_id)
where record_status = 'ACTIVE'
  and line_status not in ('CANCELLED', 'EXCLUDED');

drop trigger if exists set_updated_at_ttgdtx_partner_payment_requests on public.ttgdtx_partner_payment_requests;
create trigger set_updated_at_ttgdtx_partner_payment_requests
before update on public.ttgdtx_partner_payment_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_ttgdtx_partner_payment_request_lines on public.ttgdtx_partner_payment_request_lines;
create trigger set_updated_at_ttgdtx_partner_payment_request_lines
before update on public.ttgdtx_partner_payment_request_lines
for each row execute function public.set_updated_at();

drop trigger if exists audit_ttgdtx_partner_payment_requests on public.ttgdtx_partner_payment_requests;
create trigger audit_ttgdtx_partner_payment_requests
after insert or update or delete on public.ttgdtx_partner_payment_requests
for each row execute function public.write_audit_log();

drop trigger if exists audit_ttgdtx_partner_payment_request_lines on public.ttgdtx_partner_payment_request_lines;
create trigger audit_ttgdtx_partner_payment_request_lines
after insert or update or delete on public.ttgdtx_partner_payment_request_lines
for each row execute function public.write_audit_log();

create or replace function public.can_read_ttgdtx_partner_payment(target_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('ttgdtx.payment_request.read')
    or public.has_permission('ttgdtx.payment_request.manage')
    or public.can_read_ttgdtx_reconciliation(target_partner_id);
$$;

create or replace function public.can_manage_ttgdtx_partner_payment()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() in ('BGH', 'ADMIN')
    or public.has_permission('ttgdtx.payment_request.manage')
    or public.has_permission('payments.approve')
    or public.can_manage_ttgdtx_reconciliation();
$$;

grant execute on function public.can_read_ttgdtx_partner_payment(uuid) to authenticated;
grant execute on function public.can_manage_ttgdtx_partner_payment() to authenticated;

alter table public.ttgdtx_partner_payment_requests enable row level security;
alter table public.ttgdtx_partner_payment_request_lines enable row level security;

drop policy if exists ttgdtx_partner_payment_requests_select on public.ttgdtx_partner_payment_requests;
create policy ttgdtx_partner_payment_requests_select
on public.ttgdtx_partner_payment_requests
for select
using (public.can_read_ttgdtx_partner_payment(partner_id));

drop policy if exists ttgdtx_partner_payment_requests_manage on public.ttgdtx_partner_payment_requests;
create policy ttgdtx_partner_payment_requests_manage
on public.ttgdtx_partner_payment_requests
for all
using (
  public.can_manage_ttgdtx_partner_payment()
  and public.can_read_ttgdtx_partner_payment(partner_id)
)
with check (public.can_manage_ttgdtx_partner_payment());

drop policy if exists ttgdtx_partner_payment_request_lines_select on public.ttgdtx_partner_payment_request_lines;
create policy ttgdtx_partner_payment_request_lines_select
on public.ttgdtx_partner_payment_request_lines
for select
using (public.can_read_ttgdtx_partner_payment(partner_id));

drop policy if exists ttgdtx_partner_payment_request_lines_manage on public.ttgdtx_partner_payment_request_lines;
create policy ttgdtx_partner_payment_request_lines_manage
on public.ttgdtx_partner_payment_request_lines
for all
using (
  public.can_manage_ttgdtx_partner_payment()
  and public.can_read_ttgdtx_partner_payment(partner_id)
)
with check (public.can_manage_ttgdtx_partner_payment());

drop view if exists public.ttgdtx_partner_payment_request_candidates;

create or replace view public.ttgdtx_partner_payment_request_candidates
with (security_invoker = true)
as
select
  candidate.*,
  coalesce(array_length(candidate.blocking_items, 1), 0) = 0 as can_create_request
from (
  select
    b.id as batch_id,
    b.batch_code,
    b.batch_name,
    b.partner_id,
    partner.partner_code,
    partner.partner_name,
    b.admission_segment_id,
    s.segment_code,
    s.segment_name,
    b.period_label,
    b.period_start,
    b.period_end,
    b.total_receivable_vnd,
    b.total_collected_vnd as total_reconciled_vnd,
    b.total_balance_vnd,
    b.payment_count,
    b.student_count,
    b.reconciliation_status,
    b.evidence_url as reconciliation_evidence_url,
    b.note as reconciliation_note,
    b.risk_level,
    b.control_status,
    coalesce(line_stats.line_count, 0) as line_count,
    coalesce(line_stats.unresolved_invoice_line_count, 0) as unresolved_invoice_line_count,
    request.id as existing_request_id,
    request.request_code as existing_request_code,
    request.request_status as existing_request_status,
    array_remove(array[
      case when b.reconciliation_status <> 'LOCKED' then 'P2_14_NOT_LOCKED' end,
      case when coalesce(b.total_collected_vnd, 0) <= 0 then 'NO_RECONCILED_AMOUNT' end,
      case when coalesce(line_stats.line_count, 0) <= 0 then 'NO_RECONCILIATION_LINES' end,
      case when coalesce(line_stats.unresolved_invoice_line_count, 0) > 0 then 'UNRESOLVED_COLLECTION_INVOICE' end,
      case when exists (
        select 1
        from public.ttgdtx_source_control_checks control_check
        where control_check.check_code = 'P2_19_ACCEPTANCE_BEFORE_PAYOUT'
          and control_check.record_status = 'ACTIVE'
          and control_check.severity in ('ERROR', 'CRITICAL')
          and control_check.check_status in ('FAIL', 'NOT_CHECKED')
      ) then 'P2_19_ACCEPTANCE_BEFORE_PAYOUT' end,
      case when exists (
        select 1
        from public.ttgdtx_source_control_checks control_check
        where control_check.check_code = 'P2_19_PARTNER_INVOICE_BEFORE_PAYOUT'
          and control_check.record_status = 'ACTIVE'
          and control_check.severity in ('ERROR', 'CRITICAL')
          and control_check.check_status in ('FAIL', 'NOT_CHECKED')
      ) then 'P2_19_PARTNER_INVOICE_BEFORE_PAYOUT' end,
      case when request.id is not null then 'ALREADY_REQUESTED' end
    ], null::text) as blocking_items
  from public.ttgdtx_tuition_reconciliation_batches b
  join public.partners partner on partner.id = b.partner_id
  join public.admission_segments s on s.id = b.admission_segment_id
  left join lateral (
    select
      count(*)::int as line_count,
      sum(
        case
          when coalesce(line.invoice_control_status, 'NEEDS_INVOICE_DECISION') <> 'RESOLVED' then 1
          else 0
        end
      )::int as unresolved_invoice_line_count
    from public.ttgdtx_tuition_reconciliation_lines line
    where line.batch_id = b.id
      and line.record_status = 'ACTIVE'
      and line.line_status not in ('CANCELLED', 'EXCLUDED', 'BLOCKED')
      and line.collected_amount_vnd > 0
  ) line_stats on true
  left join public.ttgdtx_partner_payment_requests request
    on request.reconciliation_batch_id = b.id
   and request.record_status = 'ACTIVE'
   and request.request_status not in ('CANCELLED', 'REJECTED')
  where b.record_status = 'ACTIVE'
    and b.reconciliation_status <> 'CANCELLED'
    and public.can_read_ttgdtx_partner_payment(b.partner_id)
) candidate;

grant select on public.ttgdtx_partner_payment_request_candidates to authenticated;

drop view if exists public.ttgdtx_partner_payment_request_summary;

create or replace view public.ttgdtx_partner_payment_request_summary
with (security_invoker = true)
as
select
  coalesce((select count(*)::int from public.ttgdtx_partner_payment_request_candidates), 0) as candidate_count,
  coalesce((select count(*)::int from public.ttgdtx_partner_payment_request_candidates where can_create_request), 0) as ready_count,
  coalesce((select count(*)::int from public.ttgdtx_partner_payment_request_candidates where not can_create_request), 0) as blocked_count,
  coalesce((select count(*)::int from public.ttgdtx_partner_payment_request_candidates where existing_request_id is not null), 0) as already_requested_count,
  coalesce((select sum(total_reconciled_vnd) from public.ttgdtx_partner_payment_request_candidates where can_create_request), 0)::numeric(14,2) as ready_total_vnd,
  coalesce((
    select count(*)::int
    from public.ttgdtx_partner_payment_requests request
    where request.record_status = 'ACTIVE'
      and request.request_status not in ('CANCELLED', 'REJECTED')
      and public.can_read_ttgdtx_partner_payment(request.partner_id)
  ), 0) as request_count,
  coalesce((
    select sum(request.requested_amount_vnd)
    from public.ttgdtx_partner_payment_requests request
    where request.record_status = 'ACTIVE'
      and request.request_status not in ('CANCELLED', 'REJECTED')
      and public.can_read_ttgdtx_partner_payment(request.partner_id)
  ), 0)::numeric(14,2) as requested_total_vnd;

grant select on public.ttgdtx_partner_payment_request_summary to authenticated;

drop view if exists public.ttgdtx_partner_payment_request_board;

create or replace view public.ttgdtx_partner_payment_request_board
with (security_invoker = true)
as
select
  request.id as request_id,
  request.request_code,
  request.request_name,
  request.reconciliation_batch_id,
  batch.batch_code,
  batch.batch_name,
  request.partner_id,
  partner.partner_code,
  partner.partner_name,
  request.admission_segment_id,
  s.segment_code,
  s.segment_name,
  request.period_label,
  request.period_start,
  request.period_end,
  request.total_reconciled_vnd,
  request.requested_amount_vnd,
  request.approved_amount_vnd,
  request.paid_amount_vnd,
  request.payment_count,
  request.student_count,
  request.line_count,
  request.request_status,
  request.evidence_url,
  request.note,
  request.risk_level,
  request.control_status,
  creator.full_name as created_by_name,
  updater.full_name as updated_by_name,
  request.created_at,
  request.updated_at
from public.ttgdtx_partner_payment_requests request
join public.ttgdtx_tuition_reconciliation_batches batch on batch.id = request.reconciliation_batch_id
join public.partners partner on partner.id = request.partner_id
join public.admission_segments s on s.id = request.admission_segment_id
left join public.users_profile creator on creator.id = request.created_by
left join public.users_profile updater on updater.id = request.updated_by
where request.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_partner_payment(request.partner_id);

grant select on public.ttgdtx_partner_payment_request_board to authenticated;

create or replace function public.create_ttgdtx_partner_payment_request(
  p_batch_id uuid,
  p_requested_amount_vnd numeric default null,
  p_note text default null,
  p_evidence_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_batch public.ttgdtx_tuition_reconciliation_batches%rowtype;
  v_request_id uuid;
  v_requested_amount numeric(14,2);
  v_line_count integer;
  v_unresolved_invoice_count integer;
  v_request_code text;
begin
  if auth.uid() is null then
    raise exception 'P2-15: Can dang nhap truoc khi tao de nghi chi TTGDTX.';
  end if;

  if not public.can_manage_ttgdtx_partner_payment() then
    raise exception 'P2-15: Tai khoan chua co quyen tao de nghi chi TTGDTX.';
  end if;

  if p_batch_id is null then
    raise exception 'P2-15: Can chon ky doi soat P2-14 da khoa.';
  end if;

  if nullif(trim(coalesce(p_evidence_url, '')), '') is null then
    raise exception 'P2-15: Can gan link bo ho so BBNT va hoa don/chung tu doi tac truoc khi tao de nghi thanh toan.';
  end if;

  select *
  into v_batch
  from public.ttgdtx_tuition_reconciliation_batches
  where id = p_batch_id
    and record_status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'P2-15: Khong tim thay ky doi soat dang hoat dong.';
  end if;

  if not public.can_read_ttgdtx_partner_payment(v_batch.partner_id) then
    raise exception 'P2-15: Tai khoan chua duoc xem TTGDTX cua ky doi soat nay.';
  end if;

  if v_batch.reconciliation_status <> 'LOCKED' then
    raise exception 'P2-15: Chi ky P2-14 da khoa moi duoc tao de nghi chi.';
  end if;

  if coalesce(v_batch.total_collected_vnd, 0) <= 0 then
    raise exception 'P2-15: Ky doi soat chua co so tien da thu.';
  end if;

  select count(*)::int
  into v_unresolved_invoice_count
  from public.ttgdtx_tuition_reconciliation_lines line
  where line.batch_id = p_batch_id
    and line.record_status = 'ACTIVE'
    and line.line_status not in ('BLOCKED', 'EXCLUDED', 'CANCELLED')
    and coalesce(line.invoice_control_status, 'NEEDS_INVOICE_DECISION') <> 'RESOLVED';

  if coalesce(v_unresolved_invoice_count, 0) > 0 then
    raise exception 'P2-15: Con chung tu P2-10 chua chot hoa don/chung tu, khong duoc tao de nghi chi.';
  end if;

  if exists (
    select 1
    from public.ttgdtx_source_control_checks control_check
    where control_check.check_code = 'P2_19_ACCEPTANCE_BEFORE_PAYOUT'
      and control_check.record_status = 'ACTIVE'
      and control_check.severity in ('ERROR', 'CRITICAL')
      and control_check.check_status in ('FAIL', 'NOT_CHECKED')
  ) then
    raise exception 'P2-15: Chua du BBNT/accepted-period evidence P2-19, khong duoc tao de nghi chi.';
  end if;

  if exists (
    select 1
    from public.ttgdtx_source_control_checks control_check
    where control_check.check_code = 'P2_19_PARTNER_INVOICE_BEFORE_PAYOUT'
      and control_check.record_status = 'ACTIVE'
      and control_check.severity in ('ERROR', 'CRITICAL')
      and control_check.check_status in ('FAIL', 'NOT_CHECKED')
  ) then
    raise exception 'P2-15: Chua du hoa don doi tac/payment invoice evidence P2-19, khong duoc tao de nghi chi.';
  end if;

  if exists (
    select 1
    from public.ttgdtx_partner_payment_requests request
    where request.reconciliation_batch_id = p_batch_id
      and request.record_status = 'ACTIVE'
      and request.request_status not in ('CANCELLED', 'REJECTED')
  ) then
    raise exception 'P2-15: Ky doi soat nay da co de nghi chi, khong tao trung.';
  end if;

  v_requested_amount := coalesce(p_requested_amount_vnd, v_batch.total_collected_vnd);

  if v_requested_amount <> v_batch.total_collected_vnd then
    raise exception 'P2-15 pilot chi cho de nghi dung bang so tien da doi soat. Neu can chi mot phan, phai tach ky doi soat truoc.';
  end if;

  v_request_code := 'P2-15-' || replace(v_batch.batch_code, 'P2-13-', '');

  insert into public.ttgdtx_partner_payment_requests (
    request_code,
    request_name,
    reconciliation_batch_id,
    partner_id,
    admission_segment_id,
    period_label,
    period_start,
    period_end,
    total_reconciled_vnd,
    requested_amount_vnd,
    payment_count,
    student_count,
    request_status,
    evidence_url,
    note,
    risk_level,
    control_status,
    created_by,
    updated_by
  ) values (
    v_request_code,
    'De nghi chi TTGDTX ' || v_batch.period_label,
    v_batch.id,
    v_batch.partner_id,
    v_batch.admission_segment_id,
    v_batch.period_label,
    v_batch.period_start,
    v_batch.period_end,
    v_batch.total_collected_vnd,
    v_requested_amount,
    v_batch.payment_count,
    v_batch.student_count,
    'SUBMITTED',
    nullif(trim(coalesce(p_evidence_url, '')), ''),
    nullif(trim(coalesce(p_note, '')), ''),
    'HIGH',
    'DAT_TAM_THOI',
    auth.uid(),
    auth.uid()
  )
  returning id into v_request_id;

  insert into public.ttgdtx_partner_payment_request_lines (
    request_id,
    reconciliation_line_id,
    reconciliation_batch_id,
    receivable_id,
    payment_id,
    lead_id,
    partner_id,
    admission_segment_id,
    receivable_code,
    payment_code,
    voucher_no,
    student_name,
    student_phone,
    academic_year,
    term_label,
    collected_amount_vnd,
    requested_amount_vnd,
    line_status,
    note,
    created_by,
    updated_by
  )
  select
    v_request_id,
    line.id,
    line.batch_id,
    line.receivable_id,
    line.payment_id,
    line.lead_id,
    line.partner_id,
    line.admission_segment_id,
    line.receivable_code,
    line.payment_code,
    line.voucher_no,
    line.student_name,
    line.student_phone,
    line.academic_year,
    line.term_label,
    line.collected_amount_vnd,
    line.collected_amount_vnd,
    'IN_REQUEST',
    'Tao tu P2-15 sau khi P2-14 da khoa.',
    auth.uid(),
    auth.uid()
  from public.ttgdtx_tuition_reconciliation_lines line
  where line.batch_id = p_batch_id
    and line.record_status = 'ACTIVE'
    and line.line_status not in ('BLOCKED', 'EXCLUDED', 'CANCELLED')
    and coalesce(line.invoice_control_status, 'NEEDS_INVOICE_DECISION') = 'RESOLVED'
    and line.collected_amount_vnd > 0;

  get diagnostics v_line_count = row_count;

  if coalesce(v_line_count, 0) <= 0 then
    -- The exception rolls back the inserted draft request in the same statement.
    -- Do not hard-delete payment request records in migration logic.
    raise exception 'P2-15: Ky doi soat khong co dong chung tu hop le de de nghi chi.';
  end if;

  update public.ttgdtx_partner_payment_requests request
  set
    line_count = stats.line_count,
    payment_count = stats.payment_count,
    student_count = stats.student_count,
    total_reconciled_vnd = stats.total_amount,
    requested_amount_vnd = stats.total_amount,
    updated_by = auth.uid(),
    updated_at = now()
  from (
    select
      count(*)::int as line_count,
      count(distinct payment_id)::int as payment_count,
      count(distinct lead_id)::int as student_count,
      coalesce(sum(requested_amount_vnd), 0)::numeric(14,2) as total_amount
    from public.ttgdtx_partner_payment_request_lines
    where request_id = v_request_id
      and record_status = 'ACTIVE'
      and line_status = 'IN_REQUEST'
  ) stats
  where request.id = v_request_id;

  return v_request_id;
end;
$$;

grant execute on function public.create_ttgdtx_partner_payment_request(uuid, numeric, text, text) to authenticated;

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
  'TTGDTX_PARTNER_PAYMENT_REQUEST_P2_15',
  'P2-15 De nghi chi TTGDTX',
  'FINANCE',
  'KHTC + BGH',
  '/ttgdtx/payment-requests',
  true,
  'P2-15 tao phieu de nghi chi tu ky P2-14 da khoa, khong con chung tu thu thieu quyet dinh hoa don/chung tu. Buoc nay chua chi tien va chua thay the chung tu ke toan.',
  2150,
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
  'WF_P2_15_TTGDTX_PARTNER_PAYMENT_REQUEST',
  'P2-15 De nghi chi TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Sau khi ky doi soat P2-14 da khoa.',
  'KHTC',
  'KHTC + BGH',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Phieu de nghi chi TTGDTX duoc tao de trinh duyet chi o buoc sau.',
  'Chi phieu SUBMITTED/CHECKED/APPROVED moi duoc chuyen sang lenh chi that; khong chi tien o P2-15.',
  'Moi phieu P2-15 tao qua function, khoa duplicate theo ky doi soat, co audit log va khong nhan dong thu con thieu quyet dinh hoa don/chung tu.',
  2150,
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
  'TTGDTX_PARTNER_PAYMENT_REQUESTS',
  'Phieu de nghi chi TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_partner_payment_requests; ttgdtx_partner_payment_request_lines; ttgdtx_partner_payment_request_board',
  'TRANSACTION',
  'KHTC + BGH',
  'SUPABASE',
  'RESTRICTED',
  false,
  'Chi tao tu ky P2-14 da khoa qua function P2-15; khong sua truc tiep bang loi va khong chi tien tai buoc nay.',
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
  'OWN_P2_15_TTGDTX_PARTNER_PAYMENT_REQUEST',
  'P2-15 De nghi chi TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_15_TTGDTX_PARTNER_PAYMENT_REQUEST',
  'TTGDTX_PARTNER_PAYMENT_REQUEST',
  'ttgdtx_partner_payment_requests; ttgdtx_partner_payment_request_lines',
  'KHTC + BGH',
  'KHTC',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'ROLE_AND_SCOPE',
  'KHTC',
  'BGH + TTGDTX_SETTLEMENT',
  'Ky P2-14 da khoa, danh sach chung tu da doi soat, link BBNT/hoa don doi tac, link bien ban doi soat neu co va ghi chu de nghi chi.',
  'Khong tao de nghi chi trung mot ky; moi dong chi deu truy ve duoc P2-10, P2-13, P2-14 va co quyet dinh hoa don/chung tu thu da ro.',
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
  'GATE_P2_15_TTGDTX_PARTNER_PAYMENT_REQUEST',
  'Gate P2-15: de nghi chi TTGDTX',
  'FINANCE',
  'TTGDTX_PARTNER_PAYMENT_REQUEST',
  'P2-15-TTGDTX-PAYMENT-REQUEST',
  'KHTC + BGH',
  'Kiem tra ky P2-14 da khoa, khong tao trung, so tien khop chung tu da doi soat.',
  'BGH/Audit duyet o buoc sau truoc khi chi tien that.',
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
  'NAV_P2_15_TTGDTX_PAYMENT_REQUEST',
  'P2-15 De nghi chi TTGDTX',
  'FINANCE',
  'M08_FINANCE_ACCOUNTING',
  '/ttgdtx/payment-requests',
  'Tao phieu de nghi chi TTGDTX tu ky doi soat P2-14 da khoa. Chua chi tien that.',
  'KHTC + BGH',
  'Mo P2-15 de tao de nghi chi tu ky P2-14 LOCKED.',
  2150,
  false,
  'Can xu ly khi co ky P2-14 LOCKED chua co de nghi chi hoac co de nghi bi tra ve.',
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
