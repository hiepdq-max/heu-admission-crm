-- Step 107 / P2-17: TTGDTX partner payment execution.
-- P2-17 records actual disbursement only after P2-16 approved.
-- It blocks overpayment, duplicate voucher numbers and wrong request status.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - No physical removal of payment/disbursement records is used.
-- - If rollback is needed, mark affected disbursement rows CANCELLED/INACTIVE
--   through an approved corrective migration and keep audit evidence.

do $$
declare
  v_role_column text;
begin
  select column_name
  into v_role_column
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'roles'
    and column_name in ('role_code', 'code', 'role_name', 'name')
  order by case column_name
    when 'role_code' then 1
    when 'code' then 2
    when 'role_name' then 3
    when 'name' then 4
    else 5
  end
  limit 1;

  if v_role_column is not null then
    execute format($sql$
      insert into public.role_permissions (role_id, permission)
      select r.id, p.permission
      from public.roles r
      cross join (
        values
          ('ttgdtx.payment_request.pay'),
          ('payments.pay')
      ) as p(permission)
      where upper(r.%I::text) in ('ADMIN', 'BGH', 'KHTC', 'KE_TOAN', 'ACCOUNTANT', 'TRUONG_PHONG')
      on conflict (role_id, permission) do nothing
    $sql$, v_role_column);
  end if;
end $$;

create or replace function public.can_pay_ttgdtx_partner_payment()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or public.current_user_role_code() in ('ADMIN', 'BGH')
    or public.has_permission('ttgdtx.payment_request.pay')
    or public.has_permission('ttgdtx.payment_request.manage')
    or public.has_permission('payments.pay');
$$;

grant execute on function public.can_pay_ttgdtx_partner_payment() to authenticated;

create table if not exists public.ttgdtx_partner_payment_disbursements (
  id uuid primary key default gen_random_uuid(),
  disbursement_code text not null unique,
  request_id uuid not null references public.ttgdtx_partner_payment_requests(id) on delete restrict,
  reconciliation_batch_id uuid not null references public.ttgdtx_tuition_reconciliation_batches(id) on delete restrict,
  partner_id uuid not null references public.partners(id) on delete restrict,
  admission_segment_id uuid not null references public.admission_segments(id) on delete restrict,
  amount_vnd numeric(14,2) not null default 0,
  payment_date date not null default current_date,
  payment_method text not null default 'BANK_TRANSFER',
  voucher_no text not null,
  recipient_name text,
  recipient_account text,
  recipient_bank text,
  evidence_url text,
  note text,
  payment_status text not null default 'POSTED',
  risk_level text not null default 'HIGH',
  control_status text not null default 'DAT_TAM_THOI',
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_partner_payment_disbursements_amount_positive check (amount_vnd > 0),
  constraint ttgdtx_partner_payment_disbursements_method_valid check (payment_method in ('BANK_TRANSFER', 'CASH', 'OFFSET', 'OTHER')),
  constraint ttgdtx_partner_payment_disbursements_status_valid check (payment_status in ('POSTED', 'CANCELLED')),
  constraint ttgdtx_partner_payment_disbursements_risk_valid check (risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  constraint ttgdtx_partner_payment_disbursements_control_valid check (control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN'))
);

do $$
begin
  if exists (
    select 1
    from public.ttgdtx_partner_payment_disbursements
    where voucher_no <> btrim(voucher_no)
       or btrim(voucher_no) = ''
  ) then
    raise exception 'P2-17 voucher_no must be trimmed and non-empty before enabling normalized duplicate guard.';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ttgdtx_partner_payment_disbursements'::regclass
      and conname = 'ttgdtx_partner_payment_disbursements_voucher_trimmed'
  ) then
    alter table public.ttgdtx_partner_payment_disbursements
      add constraint ttgdtx_partner_payment_disbursements_voucher_trimmed
      check (voucher_no = btrim(voucher_no) and voucher_no <> '');
  end if;
end $$;

create index if not exists idx_ttgdtx_partner_payment_disbursements_request
on public.ttgdtx_partner_payment_disbursements(request_id, created_at desc)
where record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_partner_payment_disbursements_partner
on public.ttgdtx_partner_payment_disbursements(partner_id, payment_date desc)
where record_status = 'ACTIVE';

drop index if exists public.uq_ttgdtx_partner_payment_disbursement_voucher;
create unique index uq_ttgdtx_partner_payment_disbursement_voucher
on public.ttgdtx_partner_payment_disbursements(lower(btrim(voucher_no)))
where record_status = 'ACTIVE' and payment_status <> 'CANCELLED';

comment on index public.uq_ttgdtx_partner_payment_disbursement_voucher
is 'P2-17 normalized voucher idempotency guard; blocks duplicate voucher numbers regardless of surrounding spaces.';

drop trigger if exists trg_ttgdtx_partner_payment_disbursements_updated_at on public.ttgdtx_partner_payment_disbursements;
create trigger trg_ttgdtx_partner_payment_disbursements_updated_at
before update on public.ttgdtx_partner_payment_disbursements
for each row execute function public.set_updated_at();

drop trigger if exists audit_ttgdtx_partner_payment_disbursements on public.ttgdtx_partner_payment_disbursements;
create trigger audit_ttgdtx_partner_payment_disbursements
after insert or update or delete on public.ttgdtx_partner_payment_disbursements
for each row execute function public.write_audit_log();

alter table public.ttgdtx_partner_payment_disbursements enable row level security;

drop policy if exists ttgdtx_partner_payment_disbursements_select on public.ttgdtx_partner_payment_disbursements;
create policy ttgdtx_partner_payment_disbursements_select
on public.ttgdtx_partner_payment_disbursements
for select
to authenticated
using (public.can_read_ttgdtx_partner_payment(partner_id));

drop policy if exists ttgdtx_partner_payment_disbursements_insert on public.ttgdtx_partner_payment_disbursements;
create policy ttgdtx_partner_payment_disbursements_insert
on public.ttgdtx_partner_payment_disbursements
for insert
to authenticated
with check (
  public.can_pay_ttgdtx_partner_payment()
  and public.can_read_ttgdtx_partner_payment(partner_id)
);

drop policy if exists ttgdtx_partner_payment_disbursements_update on public.ttgdtx_partner_payment_disbursements;
create policy ttgdtx_partner_payment_disbursements_update
on public.ttgdtx_partner_payment_disbursements
for update
to authenticated
using (
  public.can_pay_ttgdtx_partner_payment()
  and public.can_read_ttgdtx_partner_payment(partner_id)
)
with check (
  public.can_pay_ttgdtx_partner_payment()
  and public.can_read_ttgdtx_partner_payment(partner_id)
);

revoke insert, update, delete on table public.ttgdtx_partner_payment_disbursements from authenticated;
grant select on table public.ttgdtx_partner_payment_disbursements to authenticated;

create or replace function public.record_ttgdtx_partner_payment_disbursement(
  p_request_id uuid,
  p_amount_vnd numeric,
  p_payment_date date default current_date,
  p_payment_method text default 'BANK_TRANSFER',
  p_voucher_no text default null,
  p_recipient_name text default null,
  p_recipient_account text default null,
  p_recipient_bank text default null,
  p_evidence_url text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_request public.ttgdtx_partner_payment_requests%rowtype;
  v_amount numeric(14,2) := coalesce(p_amount_vnd, 0);
  v_remaining numeric(14,2);
  v_paid_after numeric(14,2);
  v_disbursement_id uuid;
  v_code text;
begin
  if v_user_id is null then
    raise exception 'Bạn cần đăng nhập để ghi nhận chi tiền P2-17.';
  end if;

  if not public.can_pay_ttgdtx_partner_payment() then
    raise exception 'Tài khoản chưa có quyền ghi nhận chi tiền TTGDTX P2-17.';
  end if;

  if p_request_id is null then
    raise exception 'Thiếu phiếu đề nghị chi P2-15/P2-16.';
  end if;

  if v_amount <= 0 then
    raise exception 'Số tiền chi phải lớn hơn 0.';
  end if;

  if coalesce(nullif(trim(p_voucher_no), ''), '') = '' then
    raise exception 'P2-17 cần số chứng từ/số phiếu chi để tránh chi trùng.';
  end if;

  if nullif(trim(coalesce(p_evidence_url, '')), '') is null then
    raise exception 'P2-17: Can gan link chung tu chi tien/uy nhiem chi truoc khi ghi nhan payout.';
  end if;

  if coalesce(p_payment_method, 'BANK_TRANSFER') not in ('BANK_TRANSFER', 'CASH', 'OFFSET', 'OTHER') then
    raise exception 'Hình thức chi không hợp lệ.';
  end if;

  select *
  into v_request
  from public.ttgdtx_partner_payment_requests
  where id = p_request_id
    and record_status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'Không tìm thấy phiếu đề nghị chi TTGDTX.';
  end if;

  if not public.can_read_ttgdtx_partner_payment(v_request.partner_id) then
    raise exception 'Bạn không có phạm vi thao tác TTGDTX của phiếu này.';
  end if;

  if v_request.request_status = 'PAID' then
    raise exception 'Phiếu này đã chi đủ, không được ghi nhận chi lần nữa.';
  end if;

  if v_request.request_status <> 'APPROVED' then
    raise exception 'P2-17 chỉ được chi sau khi đề nghị đã được duyệt ở P2-16.';
  end if;

  if exists (
    select 1
    from public.ttgdtx_source_control_checks control_check
    where control_check.check_code = 'P2_19_ACCEPTANCE_BEFORE_PAYOUT'
      and control_check.record_status = 'ACTIVE'
      and control_check.severity in ('ERROR', 'CRITICAL')
      and control_check.check_status in ('FAIL', 'NOT_CHECKED')
  ) then
    raise exception 'P2-17: Chua du BBNT/accepted-period evidence P2-19, khong duoc ghi nhan chi tien.';
  end if;

  if exists (
    select 1
    from public.ttgdtx_source_control_checks control_check
    where control_check.check_code = 'P2_19_PARTNER_INVOICE_BEFORE_PAYOUT'
      and control_check.record_status = 'ACTIVE'
      and control_check.severity in ('ERROR', 'CRITICAL')
      and control_check.check_status in ('FAIL', 'NOT_CHECKED')
  ) then
    raise exception 'P2-17: Chua du hoa don doi tac/payment invoice evidence P2-19, khong duoc ghi nhan chi tien.';
  end if;

  if coalesce(v_request.approved_amount_vnd, 0) <= 0 then
    raise exception 'Phiếu chưa có số tiền được duyệt.';
  end if;

  v_remaining := coalesce(v_request.approved_amount_vnd, 0) - coalesce(v_request.paid_amount_vnd, 0);

  if v_remaining <= 0 then
    raise exception 'Phiếu không còn số tiền phải chi.';
  end if;

  if v_amount > v_remaining then
    raise exception 'Không được chi vượt số tiền còn lại. Còn phải chi: % đồng.', v_remaining;
  end if;

  if exists (
    select 1
    from public.ttgdtx_partner_payment_disbursements d
    where lower(btrim(d.voucher_no)) = lower(btrim(p_voucher_no))
      and d.record_status = 'ACTIVE'
      and d.payment_status <> 'CANCELLED'
  ) then
    raise exception 'Số chứng từ này đã được dùng ở P2-17, không được ghi nhận trùng.';
  end if;

  v_code := 'P2-17-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.ttgdtx_partner_payment_disbursements (
    disbursement_code,
    request_id,
    reconciliation_batch_id,
    partner_id,
    admission_segment_id,
    amount_vnd,
    payment_date,
    payment_method,
    voucher_no,
    recipient_name,
    recipient_account,
    recipient_bank,
    evidence_url,
    note,
    payment_status,
    risk_level,
    control_status,
    created_by,
    updated_by
  )
  values (
    v_code,
    v_request.id,
    v_request.reconciliation_batch_id,
    v_request.partner_id,
    v_request.admission_segment_id,
    v_amount,
    coalesce(p_payment_date, current_date),
    coalesce(p_payment_method, 'BANK_TRANSFER'),
    trim(p_voucher_no),
    nullif(trim(coalesce(p_recipient_name, '')), ''),
    nullif(trim(coalesce(p_recipient_account, '')), ''),
    nullif(trim(coalesce(p_recipient_bank, '')), ''),
    nullif(trim(coalesce(p_evidence_url, '')), ''),
    nullif(trim(coalesce(p_note, '')), ''),
    'POSTED',
    'HIGH',
    'DAT_TAM_THOI',
    v_user_id,
    v_user_id
  )
  returning id into v_disbursement_id;

  v_paid_after := coalesce(v_request.paid_amount_vnd, 0) + v_amount;

  update public.ttgdtx_partner_payment_requests
  set
    paid_amount_vnd = v_paid_after,
    request_status = case
      when v_paid_after >= coalesce(v_request.approved_amount_vnd, 0) then 'PAID'
      else 'APPROVED'
    end,
    control_status = case
      when v_paid_after >= coalesce(v_request.approved_amount_vnd, 0) then 'DAT'
      else control_status
    end,
    note = concat_ws(E'\n', nullif(note, ''), '[P2-17] Đã ghi nhận chi ' || v_amount::text || ' đ, chứng từ ' || trim(p_voucher_no) || '.'),
    updated_by = v_user_id,
    updated_at = now()
  where id = v_request.id;

  return v_disbursement_id;
end;
$$;

grant execute on function public.record_ttgdtx_partner_payment_disbursement(uuid, numeric, date, text, text, text, text, text, text, text) to authenticated;

drop view if exists public.ttgdtx_partner_payment_disbursement_recent;
drop view if exists public.ttgdtx_partner_payment_execution_summary;
drop view if exists public.ttgdtx_partner_payment_execution_board;

create or replace view public.ttgdtx_partner_payment_execution_board
with (security_invoker = true) as
select
  x.*,
  coalesce(array_length(x.blocking_items, 1), 0) = 0 as is_payment_open,
  coalesce(array_length(x.blocking_items, 1), 0) = 0
    and public.can_pay_ttgdtx_partner_payment() as can_pay
from (
  select
    b.*,
    greatest(coalesce(b.approved_amount_vnd, 0) - coalesce(b.paid_amount_vnd, 0), 0)::numeric(14,2) as remaining_amount_vnd,
    array_remove(array[
      case
        when b.request_status = 'PAID' then 'REQUEST_ALREADY_PAID'
        when b.request_status <> 'APPROVED' then 'REQUEST_NOT_APPROVED'
      end,
      case when coalesce(b.approved_amount_vnd, 0) <= 0 then 'NO_APPROVED_AMOUNT' end,
      case when greatest(coalesce(b.approved_amount_vnd, 0) - coalesce(b.paid_amount_vnd, 0), 0) <= 0 then 'NO_REMAINING_AMOUNT' end,
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
      ) then 'P2_19_PARTNER_INVOICE_BEFORE_PAYOUT' end
    ], null::text) as blocking_items
  from public.ttgdtx_partner_payment_request_board b
  where b.request_status in ('APPROVED', 'PAID')
) x;

grant select on public.ttgdtx_partner_payment_execution_board to authenticated;

create or replace view public.ttgdtx_partner_payment_execution_summary
with (security_invoker = true) as
select
  count(*)::int as request_count,
  count(*) filter (where is_payment_open)::int as payable_count,
  count(*) filter (where not is_payment_open and request_status <> 'PAID')::int as blocked_count,
  count(*) filter (where request_status = 'PAID')::int as paid_count,
  coalesce(sum(approved_amount_vnd), 0)::numeric(14,2) as approved_total_vnd,
  coalesce(sum(paid_amount_vnd), 0)::numeric(14,2) as paid_total_vnd,
  coalesce(sum(remaining_amount_vnd), 0)::numeric(14,2) as remaining_total_vnd
from public.ttgdtx_partner_payment_execution_board;

grant select on public.ttgdtx_partner_payment_execution_summary to authenticated;

create or replace view public.ttgdtx_partner_payment_disbursement_recent
with (security_invoker = true) as
select
  d.id as disbursement_id,
  d.disbursement_code,
  d.request_id,
  r.request_code,
  r.request_name,
  d.partner_id,
  p.partner_code,
  p.partner_name as partner_name,
  b.period_label,
  d.payment_date,
  d.payment_method,
  d.voucher_no,
  d.amount_vnd,
  d.recipient_name,
  d.recipient_account,
  d.recipient_bank,
  d.evidence_url,
  d.note,
  d.payment_status,
  d.risk_level,
  d.control_status,
  creator.full_name as created_by_name,
  d.created_at
from public.ttgdtx_partner_payment_disbursements d
join public.ttgdtx_partner_payment_requests r on r.id = d.request_id
join public.ttgdtx_tuition_reconciliation_batches b on b.id = d.reconciliation_batch_id
join public.partners p on p.id = d.partner_id
left join public.users_profile creator on creator.id = d.created_by
where d.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_partner_payment(d.partner_id)
order by d.created_at desc;

grant select on public.ttgdtx_partner_payment_disbursement_recent to authenticated;

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
  'TTGDTX_PAYMENT_EXECUTION_P2_17',
  'P2-17 Ghi nhan chi tien TTGDTX',
  'FINANCE',
  'KHTC',
  '/ttgdtx/payment-requests/pay',
  false,
  'Chi tien chi mo sau khi P2-16 APPROVED; chan chi vuot, chan trung chung tu va luu audit log.',
  2170,
  'DAT_TAM_THOI'
from public.admission_segments s
where s.segment_code = 'TC9_TTGDTX_LINKED'
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
  control_status,
  status
)
values (
  'WF_P2_17_TTGDTX_PAYMENT_EXECUTION',
  'P2-17 Ghi nhan chi tien TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Sau khi de nghi chi TTGDTX da duoc duyet o P2-16.',
  'KHTC',
  'KHTC',
  'KHTC + AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Ghi nhan chung tu da chi va cap nhat paid_amount/request_status.',
  'Neu chi du, phieu P2-15/P2-16 chuyen PAID; neu chi mot phan, giu APPROVED de tiep tuc chi phan con lai.',
  'Moi lan chi tien phai co so chung tu duy nhat va audit log.',
  2170,
  'DAT_TAM_THOI',
  'ACTIVE'
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
  status = excluded.status,
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
  control_status,
  status
)
values (
  'P2_17_TTGDTX_PAYMENT_DISBURSEMENT',
  'Chung tu chi tien TTGDTX P2-17',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_partner_payment_disbursements; ttgdtx_partner_payment_execution_board',
  'TRANSACTION',
  'KHTC',
  'SUPABASE',
  'RESTRICTED',
  false,
  'Chi duoc ghi qua function P2-17; khong sua truc tiep bang loi; chung tu khong duoc trung.',
  'DAT_TAM_THOI',
  'ACTIVE'
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
  status = excluded.status,
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
  control_status,
  status
)
values (
  'OWN_P2_17_TTGDTX_PAYMENT_EXECUTION',
  'P2-17 Ghi nhan chi tien TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_17_TTGDTX_PAYMENT_EXECUTION',
  'TTGDTX_PARTNER_PAYMENT_DISBURSEMENT',
  'ttgdtx_partner_payment_disbursements,ttgdtx_partner_payment_requests',
  'KHTC',
  'KHTC',
  'KHTC/AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'ROLE_AND_SCOPE',
  'P2_16_APPROVED_REQUEST',
  'ACCOUNTING_PAYMENT_RECORD',
  'So chung tu, ngay chi, so tien, hinh thuc chi va link minh chung neu co.',
  'Chan chi vuot, chan trung so chung tu, moi thao tac qua RPC va audit log.',
  24,
  'HIGH',
  'DAT_TAM_THOI',
  'ACTIVE'
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
  status = excluded.status,
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
)
values (
  'GATE_P2_17_TTGDTX_PAYMENT_EXECUTION',
  'Gate P2-17: Ghi nhan chi tien TTGDTX',
  'FINANCE',
  'TTGDTX_PAYMENT_DISBURSEMENT',
  'ttgdtx_partner_payment_disbursements',
  'KHTC + AUDIT + BGH',
  'KHTC kiem tra phieu da duyet, so tien con lai va so chung tu khong trung.',
  'BGH/nguoi duoc uy quyen chi phe duyet truoc do o P2-16; P2-17 la ghi nhan chi tien.',
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
)
values (
  'NAV_P2_17_TTGDTX_PAYMENT_EXECUTION',
  'P2-17 Chi tien TTGDTX',
  'FINANCE',
  'M08_FINANCE_ACCOUNTING',
  '/ttgdtx/payment-requests/pay',
  'Ghi nhan chi tien TTGDTX sau khi P2-16 da duyet; chan chi vuot va trung chung tu.',
  'KHTC + AUDIT + BGH',
  'OPEN_PAYMENT_EXECUTION',
  2170,
  true,
  'request_status = APPROVED and approved_amount_vnd > paid_amount_vnd',
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
