-- P2-18: TTGDTX accounting dashboard.
-- Read-only rollup from P2-01 -> P2-17. This step does not create money movement.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - P2-18 creates read-only dashboard views and governance metadata only.
-- - If rollback is needed, disable/remove introduced dashboard navigation or
--   views through an approved corrective migration; source transaction tables
--   remain untouched.

drop view if exists public.ttgdtx_accounting_dashboard_exception_board;
drop view if exists public.ttgdtx_accounting_dashboard_recent_movements;
drop view if exists public.ttgdtx_accounting_dashboard_summary;
drop view if exists public.ttgdtx_accounting_dashboard_control_board;
drop view if exists public.ttgdtx_accounting_dashboard_partner_board;

create or replace view public.ttgdtx_accounting_dashboard_partner_board
with (security_invoker = true)
as
with partner_seed as (
  select distinct
    p.partner_id,
    p.partner_code,
    p.partner_name,
    p.area
  from public.ttgdtx_partner_contract_readiness p
),
contract_stats as (
  select
    partner_id,
    count(contract_id)::int as contract_count,
    count(contract_id) filter (where readiness_status = 'READY')::int as contract_ready_count,
    max(updated_at) as updated_at
  from public.ttgdtx_partner_contract_readiness
  group by partner_id
),
policy_stats as (
  select
    partner_id,
    count(policy_id)::int as policy_count,
    count(policy_id) filter (where readiness_status = 'READY')::int as policy_ready_count,
    max(updated_at) as updated_at
  from public.ttgdtx_tuition_policy_readiness
  group by partner_id
),
receivable_stats as (
  select
    partner_id,
    count(receivable_id)::int as receivable_count,
    count(receivable_id) filter (where coalesce(balance_amount_vnd, 0) > 0)::int as open_receivable_count,
    count(receivable_id) filter (where coalesce(days_overdue, 0) > 0)::int as overdue_receivable_count,
    coalesce(sum(payable_amount_vnd), 0)::numeric as receivable_total_vnd,
    coalesce(sum(paid_amount_vnd), 0)::numeric as receivable_paid_vnd,
    coalesce(sum(balance_amount_vnd), 0)::numeric as receivable_balance_vnd,
    max(updated_at) as updated_at
  from public.ttgdtx_student_receivable_readiness
  group by partner_id
),
payment_stats as (
  select
    partner_id,
    count(payment_id)::int as payment_count,
    coalesce(sum(payment_amount_vnd) filter (
      where coalesce(payment_status, '') <> 'REVERSED'
    ), 0)::numeric as collected_total_vnd,
    max(created_at) as updated_at
  from public.ttgdtx_tuition_payment_board
  group by partner_id
),
reconciliation_stats as (
  select
    partner_id,
    count(batch_id)::int as reconciliation_count,
    count(batch_id) filter (where reconciliation_status = 'LOCKED')::int as locked_reconciliation_count,
    coalesce(sum(total_collected_vnd), 0)::numeric as reconciled_total_vnd,
    coalesce(sum(total_collected_vnd) filter (where reconciliation_status = 'LOCKED'), 0)::numeric as locked_reconciled_total_vnd,
    max(updated_at) as updated_at
  from public.ttgdtx_reconciliation_review_board
  group by partner_id
),
request_stats as (
  select
    partner_id,
    count(request_id)::int as payment_request_count,
    coalesce(sum(requested_amount_vnd), 0)::numeric as requested_total_vnd,
    coalesce(sum(approved_amount_vnd), 0)::numeric as approved_total_vnd,
    coalesce(sum(paid_amount_vnd), 0)::numeric as request_paid_total_vnd,
    max(updated_at) as updated_at
  from public.ttgdtx_partner_payment_request_board
  group by partner_id
),
disbursement_stats as (
  select
    partner_id,
    count(disbursement_id)::int as disbursement_count,
    coalesce(sum(amount_vnd), 0)::numeric as disbursed_total_vnd,
    max(created_at) as updated_at
  from public.ttgdtx_partner_payment_disbursement_recent
  group by partner_id
),
base as (
  select
    p.partner_id,
    p.partner_code,
    p.partner_name,
    p.area,
    coalesce(c.contract_count, 0) as contract_count,
    coalesce(c.contract_ready_count, 0) as contract_ready_count,
    coalesce(tp.policy_count, 0) as policy_count,
    coalesce(tp.policy_ready_count, 0) as policy_ready_count,
    coalesce(r.receivable_count, 0) as receivable_count,
    coalesce(r.open_receivable_count, 0) as open_receivable_count,
    coalesce(r.overdue_receivable_count, 0) as overdue_receivable_count,
    coalesce(r.receivable_total_vnd, 0) as receivable_total_vnd,
    coalesce(r.receivable_paid_vnd, 0) as receivable_paid_vnd,
    coalesce(r.receivable_balance_vnd, 0) as receivable_balance_vnd,
    coalesce(pay.payment_count, 0) as payment_count,
    coalesce(pay.collected_total_vnd, 0) as collected_total_vnd,
    coalesce(rec.reconciliation_count, 0) as reconciliation_count,
    coalesce(rec.locked_reconciliation_count, 0) as locked_reconciliation_count,
    coalesce(rec.reconciled_total_vnd, 0) as reconciled_total_vnd,
    coalesce(rec.locked_reconciled_total_vnd, 0) as locked_reconciled_total_vnd,
    coalesce(req.payment_request_count, 0) as payment_request_count,
    coalesce(req.requested_total_vnd, 0) as requested_total_vnd,
    coalesce(req.approved_total_vnd, 0) as approved_total_vnd,
    coalesce(req.request_paid_total_vnd, 0) as request_paid_total_vnd,
    coalesce(dis.disbursement_count, 0) as disbursement_count,
    coalesce(dis.disbursed_total_vnd, 0) as disbursed_total_vnd,
    greatest(coalesce(pay.collected_total_vnd, 0) - coalesce(rec.locked_reconciled_total_vnd, 0), 0)::numeric as remaining_to_reconcile_vnd,
    greatest(coalesce(rec.locked_reconciled_total_vnd, 0) - coalesce(req.requested_total_vnd, 0), 0)::numeric as remaining_to_request_vnd,
    greatest(coalesce(req.requested_total_vnd, 0) - coalesce(req.approved_total_vnd, 0), 0)::numeric as remaining_to_approve_vnd,
    greatest(coalesce(req.approved_total_vnd, 0) - coalesce(dis.disbursed_total_vnd, 0), 0)::numeric as remaining_to_pay_vnd,
    greatest(
      coalesce(c.updated_at, '1970-01-01'::timestamptz),
      coalesce(tp.updated_at, '1970-01-01'::timestamptz),
      coalesce(r.updated_at, '1970-01-01'::timestamptz),
      coalesce(pay.updated_at, '1970-01-01'::timestamptz),
      coalesce(rec.updated_at, '1970-01-01'::timestamptz),
      coalesce(req.updated_at, '1970-01-01'::timestamptz),
      coalesce(dis.updated_at, '1970-01-01'::timestamptz)
    ) as updated_at
  from partner_seed p
  left join contract_stats c on c.partner_id = p.partner_id
  left join policy_stats tp on tp.partner_id = p.partner_id
  left join receivable_stats r on r.partner_id = p.partner_id
  left join payment_stats pay on pay.partner_id = p.partner_id
  left join reconciliation_stats rec on rec.partner_id = p.partner_id
  left join request_stats req on req.partner_id = p.partner_id
  left join disbursement_stats dis on dis.partner_id = p.partner_id
),
classified as (
  select
    b.*,
    case
      when b.contract_ready_count = 0 then 'P2-01'
      when b.policy_ready_count = 0 then 'P2-02'
      when b.receivable_count = 0 then 'P2-03'
      when b.receivable_balance_vnd > 0 then 'P2-10'
      when b.remaining_to_reconcile_vnd > 0 then 'P2-13'
      when b.reconciliation_count > b.locked_reconciliation_count then 'P2-14'
      when b.remaining_to_request_vnd > 0 then 'P2-15'
      when b.remaining_to_approve_vnd > 0 then 'P2-16'
      when b.remaining_to_pay_vnd > 0 then 'P2-17'
      else 'DONE'
    end as next_step_code,
    case
      when b.contract_ready_count = 0 then 'Hoàn thiện hợp đồng TTGDTX'
      when b.policy_ready_count = 0 then 'Hoàn thiện học phí/công nợ'
      when b.receivable_count = 0 then 'Tạo công nợ học phí'
      when b.receivable_balance_vnd > 0 then 'Thu học phí còn thiếu'
      when b.remaining_to_reconcile_vnd > 0 then 'Tạo kỳ đối soát'
      when b.reconciliation_count > b.locked_reconciliation_count then 'Rà soát/duyệt/khóa kỳ đối soát'
      when b.remaining_to_request_vnd > 0 then 'Tạo đề nghị chi'
      when b.remaining_to_approve_vnd > 0 then 'Kiểm/duyệt đề nghị chi'
      when b.remaining_to_pay_vnd > 0 then 'Ghi nhận chi TTGDTX'
      else 'Đã khớp chu trình P2'
    end as next_step_label,
    case
      when b.contract_ready_count = 0 then '/ttgdtx'
      when b.policy_ready_count = 0 then '/ttgdtx/tuition'
      when b.receivable_count = 0 then '/ttgdtx/receivables'
      when b.receivable_balance_vnd > 0 then '/ttgdtx/payments'
      when b.remaining_to_reconcile_vnd > 0 then '/ttgdtx/reconciliation'
      when b.reconciliation_count > b.locked_reconciliation_count then '/ttgdtx/reconciliation/review'
      when b.remaining_to_request_vnd > 0 then '/ttgdtx/payment-requests'
      when b.remaining_to_approve_vnd > 0 then '/ttgdtx/payment-requests/review'
      when b.remaining_to_pay_vnd > 0 then '/ttgdtx/payment-requests/pay'
      else '/ttgdtx/accounting-dashboard'
    end as next_step_href,
    array_remove(array[
      case when b.contract_ready_count = 0 then 'P2_01_CONTRACT_NOT_READY' end,
      case when b.policy_ready_count = 0 then 'P2_02_TUITION_POLICY_NOT_READY' end,
      case when b.receivable_count = 0 then 'P2_03_NO_RECEIVABLE' end,
      case when b.receivable_balance_vnd > 0 then 'P2_10_STILL_HAS_BALANCE' end,
      case when b.remaining_to_reconcile_vnd > 0 then 'P2_13_NOT_FULLY_RECONCILED' end,
      case when b.reconciliation_count > b.locked_reconciliation_count then 'P2_14_RECONCILIATION_NOT_LOCKED' end,
      case when b.remaining_to_request_vnd > 0 then 'P2_15_PAYMENT_REQUEST_NOT_CREATED' end,
      case when b.remaining_to_approve_vnd > 0 then 'P2_16_PAYMENT_REQUEST_NOT_APPROVED' end,
      case when b.remaining_to_pay_vnd > 0 then 'P2_17_PAYMENT_NOT_COMPLETED' end
    ], null::text) as blocking_items
  from base b
)
select
  c.*,
  coalesce(array_length(c.blocking_items, 1), 0)::int as exception_count
from classified c;

create or replace view public.ttgdtx_accounting_dashboard_control_board
with (security_invoker = true)
as
with controls as (
  select
    10 as sort_order,
    'P2_03_P2_10_COLLECTION_MATCH'::text as control_code,
    'P2-03 paid amount khớp P2-10 collection'::text as control_name,
    'P2-03'::text as source_step,
    'P2-10'::text as target_step,
    coalesce(sum(receivable_paid_vnd), 0)::numeric as expected_total_vnd,
    coalesce(sum(collected_total_vnd), 0)::numeric as actual_total_vnd,
    coalesce(sum(collected_total_vnd - receivable_paid_vnd), 0)::numeric as variance_vnd,
    count(*) filter (where abs(collected_total_vnd - receivable_paid_vnd) > 0)::int as affected_partner_count,
    'CRITICAL'::text as severity,
    '/ttgdtx/payments'::text as action_href,
    'Nếu lệch, kiểm tra lại chứng từ thu P2-10 và số đã thu trên công nợ P2-03.'::text as guidance
  from public.ttgdtx_accounting_dashboard_partner_board
  union all
  select
    20,
    'P2_10_P2_13_RECONCILIATION_COVERAGE',
    'P2-10 collected amount da vao P2-13 locked reconciliation',
    'P2-10',
    'P2-13/P2-14',
    coalesce(sum(collected_total_vnd), 0)::numeric,
    coalesce(sum(locked_reconciled_total_vnd), 0)::numeric,
    coalesce(sum(collected_total_vnd - locked_reconciled_total_vnd), 0)::numeric,
    count(*) filter (where collected_total_vnd > locked_reconciled_total_vnd)::int,
    'HIGH',
    '/ttgdtx/reconciliation',
    'Nếu còn chênh lệch, lập/duyệt/khóa kỳ đối soát P2-13/P2-14 trước khi đề nghị chi.'
  from public.ttgdtx_accounting_dashboard_partner_board
  union all
  select
    30,
    'P2_13_P2_15_PAYMENT_REQUEST_COVERAGE',
    'P2-13 locked amount da tao P2-15 payment request',
    'P2-13/P2-14',
    'P2-15',
    coalesce(sum(locked_reconciled_total_vnd), 0)::numeric,
    coalesce(sum(requested_total_vnd), 0)::numeric,
    coalesce(sum(locked_reconciled_total_vnd - requested_total_vnd), 0)::numeric,
    count(*) filter (where locked_reconciled_total_vnd > requested_total_vnd)::int,
    'HIGH',
    '/ttgdtx/payment-requests',
    'Nếu còn chênh lệch, tạo đề nghị chi P2-15 từ kỳ đối soát đã khóa.'
  from public.ttgdtx_accounting_dashboard_partner_board
  union all
  select
    40,
    'P2_15_P2_16_APPROVAL_COVERAGE',
    'P2-15 requested amount da duoc P2-16 approve',
    'P2-15',
    'P2-16',
    coalesce(sum(requested_total_vnd), 0)::numeric,
    coalesce(sum(approved_total_vnd), 0)::numeric,
    coalesce(sum(requested_total_vnd - approved_total_vnd), 0)::numeric,
    count(*) filter (where requested_total_vnd > approved_total_vnd)::int,
    'HIGH',
    '/ttgdtx/payment-requests/review',
    'Nếu còn chênh lệch, kiểm/duyệt hoặc trả lại đề nghị chi P2-16.'
  from public.ttgdtx_accounting_dashboard_partner_board
  union all
  select
    50,
    'P2_16_P2_17_PAYMENT_COVERAGE',
    'P2-16 approved amount da ghi nhan P2-17 disbursement',
    'P2-16',
    'P2-17',
    coalesce(sum(approved_total_vnd), 0)::numeric,
    coalesce(sum(disbursed_total_vnd), 0)::numeric,
    coalesce(sum(approved_total_vnd - disbursed_total_vnd), 0)::numeric,
    count(*) filter (where approved_total_vnd > disbursed_total_vnd)::int,
    'HIGH',
    '/ttgdtx/payment-requests/pay',
    'Nếu còn chênh lệch, ghi nhận chi P2-17 bằng chứng từ duy nhất và đúng số tiền còn lại.'
  from public.ttgdtx_accounting_dashboard_partner_board
  union all
  select
    60,
    'P2_17_LEDGER_MATCH',
    'P2-17 disbursement khop paid_amount tren payment request',
    'P2-17',
    'P2-15/P2-16 ledger',
    coalesce(sum(request_paid_total_vnd), 0)::numeric,
    coalesce(sum(disbursed_total_vnd), 0)::numeric,
    coalesce(sum(disbursed_total_vnd - request_paid_total_vnd), 0)::numeric,
    count(*) filter (where abs(disbursed_total_vnd - request_paid_total_vnd) > 0)::int,
    'CRITICAL',
    '/ttgdtx/payment-requests/pay',
    'Nếu lệch, dừng go-live và đối chiếu audit log P2-17 trước khi thao tác tiếp.'
  from public.ttgdtx_accounting_dashboard_partner_board
)
select
  sort_order,
  control_code,
  control_name,
  source_step,
  target_step,
  expected_total_vnd,
  actual_total_vnd,
  variance_vnd,
  affected_partner_count,
  severity,
  case
    when affected_partner_count = 0 and abs(variance_vnd) = 0 then 'PASS'
    when severity = 'CRITICAL' then 'CRITICAL'
    else 'REVIEW'
  end as control_status,
  action_href,
  guidance,
  now() as updated_at
from controls
order by sort_order;

create or replace view public.ttgdtx_accounting_dashboard_summary
with (security_invoker = true)
as
select
  count(*)::int as partner_count,
  count(*) filter (where next_step_code = 'DONE')::int as ready_partner_count,
  count(*) filter (where exception_count > 0)::int as partner_with_exception_count,
  coalesce(sum(receivable_total_vnd), 0)::numeric as receivable_total_vnd,
  coalesce(sum(receivable_paid_vnd), 0)::numeric as receivable_paid_vnd,
  coalesce(sum(receivable_balance_vnd), 0)::numeric as receivable_balance_vnd,
  coalesce(sum(collected_total_vnd), 0)::numeric as collected_total_vnd,
  coalesce(sum(locked_reconciled_total_vnd), 0)::numeric as locked_reconciled_total_vnd,
  coalesce(sum(requested_total_vnd), 0)::numeric as requested_total_vnd,
  coalesce(sum(approved_total_vnd), 0)::numeric as approved_total_vnd,
  coalesce(sum(disbursed_total_vnd), 0)::numeric as disbursed_total_vnd,
  coalesce(sum(remaining_to_pay_vnd), 0)::numeric as remaining_to_pay_vnd,
  max(updated_at) as updated_at
from public.ttgdtx_accounting_dashboard_partner_board;

create or replace view public.ttgdtx_accounting_dashboard_exception_board
with (security_invoker = true)
as
select
  partner_id,
  partner_code,
  partner_name,
  area,
  next_step_code,
  next_step_label,
  next_step_href,
  blocking_items,
  exception_count,
  receivable_balance_vnd,
  remaining_to_reconcile_vnd,
  remaining_to_request_vnd,
  remaining_to_approve_vnd,
  remaining_to_pay_vnd,
  updated_at
from public.ttgdtx_accounting_dashboard_partner_board
where exception_count > 0
   or next_step_code <> 'DONE'
order by exception_count desc, remaining_to_pay_vnd desc, partner_name;

create or replace view public.ttgdtx_accounting_dashboard_recent_movements
with (security_invoker = true)
as
select
  'P2-17_DA_CHI'::text as movement_type,
  d.disbursement_code::text as movement_code,
  d.partner_id,
  d.partner_code,
  d.partner_name,
  d.period_label::text as period_label,
  d.amount_vnd::numeric as amount_vnd,
  d.payment_status::text as status,
  d.request_code::text as related_code,
  d.evidence_url::text as evidence_url,
  d.created_by_name::text as actor_name,
  d.created_at as movement_at
from public.ttgdtx_partner_payment_disbursement_recent d
union all
select
  'P2-15_DE_NGHI_CHI'::text,
  r.request_code::text,
  r.partner_id,
  r.partner_code,
  r.partner_name,
  r.period_label::text,
  r.requested_amount_vnd::numeric,
  r.request_status::text,
  r.batch_code::text,
  r.evidence_url::text,
  r.created_by_name::text,
  r.created_at
from public.ttgdtx_partner_payment_request_board r
union all
select
  'P2-13_DOI_SOAT'::text,
  b.batch_code::text,
  b.partner_id,
  b.partner_code,
  b.partner_name,
  b.period_label::text,
  b.total_collected_vnd::numeric,
  b.reconciliation_status::text,
  null::text,
  b.evidence_url::text,
  b.created_by_name::text,
  b.created_at
from public.ttgdtx_reconciliation_review_board b
union all
select
  'P2-10_DA_THU'::text,
  p.payment_code::text,
  p.partner_id,
  p.partner_code,
  p.partner_name,
  p.term_label::text,
  p.payment_amount_vnd::numeric,
  p.payment_status::text,
  p.receivable_code::text,
  p.evidence_url::text,
  p.created_by_name::text,
  p.created_at
from public.ttgdtx_tuition_payment_board p
order by movement_at desc;

grant select on public.ttgdtx_accounting_dashboard_partner_board to authenticated;
grant select on public.ttgdtx_accounting_dashboard_control_board to authenticated;
grant select on public.ttgdtx_accounting_dashboard_summary to authenticated;
grant select on public.ttgdtx_accounting_dashboard_exception_board to authenticated;
grant select on public.ttgdtx_accounting_dashboard_recent_movements to authenticated;

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
  'TTGDTX_ACCOUNTING_DASHBOARD_P2_18',
  'P2-18 Dashboard ke toan TTGDTX',
  'FINANCE',
  'KHTC + BGH + AUDIT',
  '/ttgdtx/accounting-dashboard',
  false,
  'Dashboard chi doc tong hop P2-01 den P2-17; khong tao giao dich tien moi.',
  2180,
  'DAT_TAM_THOI'
from public.admission_segments s
where s.segment_code in ('TC9_TTGDTX_LINKED', 'TC9_TTGDTX')
order by case when s.segment_code = 'TC9_TTGDTX_LINKED' then 0 else 1 end
limit 1
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
) values (
  'WF_P2_18_TTGDTX_ACCOUNTING_DASHBOARD',
  'P2-18 Dashboard ke toan TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'P2-17_PAID_OR_EXCEPTION_REVIEW',
  'KHTC',
  'KHTC + BGH + AUDIT',
  'AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Tổng hợp chu trình TTGDTX từ hợp đồng, học phí, công nợ, thu tiền, đối soát, đề nghị chi, duyệt chi đến đã chi.',
  'Chi doc va dieu huong dung buoc; khong sua so lieu, khong tao lenh chi tien.',
  'AI chỉ được gợi ý điểm nghẽn và rủi ro; không tự phê duyệt hay chi tiền.',
  2180,
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
) values (
  'P2_18_TTGDTX_ACCOUNTING_DASHBOARD',
  'Dashboard ke toan TTGDTX P2-18',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_accounting_dashboard_summary;ttgdtx_accounting_dashboard_partner_board;ttgdtx_accounting_dashboard_control_board;ttgdtx_accounting_dashboard_exception_board;ttgdtx_accounting_dashboard_recent_movements',
  'TRANSACTION',
  'KHTC + BGH + AUDIT',
  'SUPABASE',
  'RESTRICTED',
  false,
  'Read-only dashboard; so lieu goc van nam o cac bang P2-01 den P2-17.',
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
) values (
  'OWN_P2_18_TTGDTX_ACCOUNTING_DASHBOARD',
  'P2-18 Dashboard ke toan TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_18_TTGDTX_ACCOUNTING_DASHBOARD',
  'TTGDTX_ACCOUNTING_DASHBOARD',
  'ttgdtx_accounting_dashboard_summary,ttgdtx_accounting_dashboard_partner_board,ttgdtx_accounting_dashboard_control_board,ttgdtx_accounting_dashboard_exception_board,ttgdtx_accounting_dashboard_recent_movements',
  'KHTC + BGH + AUDIT',
  'KHTC',
  'AUDIT',
  'BGH',
  'ROLE_AND_SCOPE',
  'Contracts, tuition policies, receivables, payments, reconciliation batches, payment requests and disbursements.',
  'Accounting dashboard and exception board.',
  'Dashboard chi doc; moi chinh sua phai quay ve buoc goc P2-01..P2-17.',
  'Doc dashboard khong tao audit; cac giao dich tien da duoc log o buoc goc.',
  24,
  'MEDIUM',
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

select
  (select count(*) from public.ttgdtx_accounting_dashboard_partner_board)::int as p2_18_partner_rows,
  (select count(*) from public.ttgdtx_accounting_dashboard_control_board)::int as p2_18_control_rows,
  (select count(*) from public.ttgdtx_accounting_dashboard_exception_board)::int as p2_18_exception_rows,
  (select count(*) from public.ttgdtx_accounting_dashboard_recent_movements)::int as p2_18_recent_movements;
