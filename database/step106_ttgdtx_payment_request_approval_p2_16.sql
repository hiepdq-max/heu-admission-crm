-- P2-16: Review/approve TTGDTX partner payment requests.
-- This step does not pay money. It only checks, approves, returns, or rejects
-- the P2-15 payment request before a later payment execution step.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - No physical removal of payment request records is used.
-- - If rollback is needed, move affected P2-16 requests back through an approved
--   corrective status migration and keep audit evidence.

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
    execute format(
      $sql$
        insert into public.role_permissions (role_id, permission)
        select r.id, 'ttgdtx.payment_request.approve'
        from public.roles r
        where upper(r.%I::text) in ('ADMIN', 'BGH', 'KHTC', 'KE_TOAN', 'ACCOUNTANT', 'TRUONG_PHONG')
        on conflict (role_id, permission) do nothing
      $sql$,
      v_role_column
    );
  end if;
end $$;

create or replace function public.can_approve_ttgdtx_partner_payment()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or public.current_user_role_code() in ('ADMIN', 'BGH')
    or public.has_permission('ttgdtx.payment_request.approve')
    or public.has_permission('ttgdtx.payment_request.manage')
    or public.has_permission('payments.approve');
$$;

grant execute on function public.can_approve_ttgdtx_partner_payment() to authenticated;

drop view if exists public.ttgdtx_partner_payment_approval_summary;
drop view if exists public.ttgdtx_partner_payment_approval_board;
create or replace view public.ttgdtx_partner_payment_approval_board
with (security_invoker = true)
as
select
  x.*,
  coalesce(array_length(x.blocking_items, 1), 0) = 0
    and x.request_status = 'SUBMITTED'
    and public.can_approve_ttgdtx_partner_payment() as can_check,
  coalesce(array_length(x.blocking_items, 1), 0) = 0
    and x.request_status = 'CHECKED'
    and public.can_approve_ttgdtx_partner_payment() as can_approve,
  x.request_status in ('SUBMITTED', 'CHECKED')
    and coalesce(x.paid_amount_vnd, 0) = 0
    and public.can_approve_ttgdtx_partner_payment() as can_return,
  x.request_status in ('SUBMITTED', 'CHECKED')
    and coalesce(x.paid_amount_vnd, 0) = 0 as is_approval_open
from (
  select
    b.*,
    array_remove(array[
      case when b.request_status not in ('SUBMITTED', 'CHECKED') then 'REQUEST_NOT_OPEN' end,
      case when coalesce(b.paid_amount_vnd, 0) > 0 then 'REQUEST_ALREADY_PAID' end,
      case when coalesce(b.requested_amount_vnd, 0) <= 0 then 'NO_REQUEST_AMOUNT' end,
      case when coalesce(b.line_count, 0) <= 0 then 'NO_REQUEST_LINES' end,
      case when coalesce(b.requested_amount_vnd, 0) > coalesce(b.total_reconciled_vnd, 0) then 'REQUEST_GREATER_THAN_RECONCILED' end
    ], null::text) as blocking_items
  from public.ttgdtx_partner_payment_request_board b
) x;

grant select on public.ttgdtx_partner_payment_approval_board to authenticated;

drop view if exists public.ttgdtx_partner_payment_approval_summary;
create or replace view public.ttgdtx_partner_payment_approval_summary
with (security_invoker = true)
as
select
  count(*)::int as request_count,
  count(*) filter (where request_status = 'SUBMITTED')::int as submitted_count,
  count(*) filter (where request_status = 'CHECKED')::int as checked_count,
  count(*) filter (where request_status = 'APPROVED')::int as approved_count,
  count(*) filter (where request_status in ('REJECTED', 'CANCELLED'))::int as returned_count,
  count(*) filter (where request_status = 'PAID')::int as paid_count,
  coalesce(sum(requested_amount_vnd), 0)::numeric as requested_total_vnd,
  coalesce(sum(approved_amount_vnd), 0)::numeric as approved_total_vnd,
  coalesce(sum(paid_amount_vnd), 0)::numeric as paid_total_vnd
from public.ttgdtx_partner_payment_approval_board;

grant select on public.ttgdtx_partner_payment_approval_summary to authenticated;

create or replace function public.review_ttgdtx_partner_payment_request(
  p_request_id uuid,
  p_action text,
  p_approved_amount_vnd numeric default null,
  p_note text default null,
  p_evidence_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.ttgdtx_partner_payment_requests%rowtype;
  v_action text := upper(trim(coalesce(p_action, '')));
  v_note text := nullif(trim(coalesce(p_note, '')), '');
  v_evidence_url text := nullif(trim(coalesce(p_evidence_url, '')), '');
  v_approved_amount numeric;
  v_next_status text;
  v_next_control text;
begin
  if auth.uid() is null then
    raise exception 'Bạn cần đăng nhập để xử lý P2-16';
  end if;

  if not public.can_approve_ttgdtx_partner_payment() then
    raise exception 'Tài khoản chưa có quyền kiểm/duyệt đề nghị chi TTGDTX';
  end if;

  if v_action not in ('CHECK', 'APPROVE', 'RETURN', 'REJECT') then
    raise exception 'Hành động P2-16 không hợp lệ';
  end if;

  select *
  into v_request
  from public.ttgdtx_partner_payment_requests
  where id = p_request_id
    and record_status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'Không tìm thấy đề nghị chi P2-15';
  end if;

  if not public.can_read_ttgdtx_partner_payment(v_request.partner_id) then
    raise exception 'Tài khoản không có phạm vi xem đề nghị chi này';
  end if;

  if coalesce(v_request.paid_amount_vnd, 0) > 0 then
    raise exception 'Đề nghị chi đã có tiền chi, không được duyệt/trả về ở P2-16';
  end if;

  if v_request.request_status not in ('SUBMITTED', 'CHECKED') then
    raise exception 'Chỉ xử lý P2-16 khi đề nghị đang ở trạng thái SUBMITTED hoặc CHECKED';
  end if;

  if v_action = 'CHECK' and v_request.request_status <> 'SUBMITTED' then
    raise exception 'Chỉ đánh dấu đã kiểm khi đề nghị đang chờ kiểm';
  end if;

  if v_action = 'APPROVE' and v_request.request_status <> 'CHECKED' then
    raise exception 'P2-16: Can kiem phieu truoc khi duyet.';
  end if;

  if v_action in ('CHECK', 'APPROVE') then
    if coalesce(v_request.requested_amount_vnd, 0) <= 0 then
      raise exception 'Đề nghị chi chưa có số tiền hợp lệ';
    end if;

    if coalesce(v_request.line_count, 0) <= 0 then
      raise exception 'Đề nghị chi chưa có dòng chi tiết';
    end if;

    if coalesce(v_request.requested_amount_vnd, 0) > coalesce(v_request.total_reconciled_vnd, 0) then
      raise exception 'Số tiền đề nghị chi vượt số đã đối soát';
    end if;
  end if;

  if v_action in ('RETURN', 'REJECT') and v_note is null then
    raise exception 'Trả về hoặc từ chối bắt buộc nhập lý do';
  end if;

  if v_action = 'CHECK' then
    v_next_status := 'CHECKED';
    v_next_control := 'DAT_TAM_THOI';
    v_approved_amount := coalesce(v_request.approved_amount_vnd, 0);
  elsif v_action = 'APPROVE' then
    v_next_status := 'APPROVED';
    v_next_control := 'DAT_TAM_THOI';
    v_approved_amount := coalesce(p_approved_amount_vnd, v_request.requested_amount_vnd);

    if v_approved_amount <= 0 then
      raise exception 'Số tiền duyệt phải lớn hơn 0';
    end if;

    if v_approved_amount > v_request.requested_amount_vnd then
      raise exception 'Số tiền duyệt không được vượt số tiền đề nghị chi';
    end if;

    if v_approved_amount < v_request.requested_amount_vnd and v_note is null then
      raise exception 'Duyệt ít hơn số đề nghị phải nhập ghi chú lý do';
    end if;
  elsif v_action = 'RETURN' then
    v_next_status := 'CANCELLED';
    v_next_control := 'CAN_SUA';
    v_approved_amount := 0;
  else
    v_next_status := 'REJECTED';
    v_next_control := 'CHUA_DU_DIEU_KIEN';
    v_approved_amount := 0;
  end if;

  update public.ttgdtx_partner_payment_requests
  set request_status = v_next_status,
      approved_amount_vnd = v_approved_amount,
      evidence_url = coalesce(v_evidence_url, v_request.evidence_url),
      note = coalesce(v_request.note || E'\n', '')
        || '[P2-16 ' || v_action || '] '
        || coalesce(v_note, 'Da xu ly kiem/duyet de nghi chi TTGDTX.'),
      control_status = v_next_control,
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_request.id;

  return v_request.id;
end;
$$;

grant execute on function public.review_ttgdtx_partner_payment_request(uuid, text, numeric, text, text) to authenticated;

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
  'TTGDTX_PAYMENT_REQUEST_APPROVAL_P2_16',
  'P2-16 Kiem/duyet de nghi chi TTGDTX',
  'FINANCE',
  'KHTC + AUDIT + BGH',
  '/ttgdtx/payment-requests/review',
  true,
  'Chi kiem/duyet de nghi chi P2-15; chua chi tien that.',
  2160,
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
  'WF_P2_16_TTGDTX_PAYMENT_REQUEST_APPROVAL',
  'P2-16 Kiem/duyet de nghi chi TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Sau khi tao de nghi chi P2-15 tu ky doi soat da khoa P2-14.',
  'KHTC',
  'KHTC + AUDIT + BGH',
  'AUDIT + KHTC',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'De nghi chi o trang thai CHECKED, APPROVED, CANCELLED hoac REJECTED.',
  'P2-16 khong ghi nhan da chi tien; buoc chi tien that se lam rieng sau.',
  'Moi thay doi trang thai P2-16 phai qua function va co audit/updated_by. AI chi goi y rui ro, khong tu duyet chi.',
  2160,
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
  'P2_16_TTGDTX_PAYMENT_REQUEST_APPROVAL',
  'Kiem/duyet de nghi chi TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_partner_payment_requests; ttgdtx_partner_payment_approval_board',
  'TRANSACTION',
  'KHTC + AUDIT + BGH',
  'SUPABASE',
  'RESTRICTED',
  false,
  'Moi thay doi trang thai P2-16 phai qua function va co audit/updated_by.',
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
  'OWN_P2_16_TTGDTX_PAYMENT_REQUEST_APPROVAL',
  'P2-16 Kiem/duyet de nghi chi TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_16_TTGDTX_PAYMENT_REQUEST_APPROVAL',
  'TTGDTX_PARTNER_PAYMENT_REQUEST_APPROVAL',
  'ttgdtx_partner_payment_requests; ttgdtx_partner_payment_request_lines; ttgdtx_partner_payment_approval_board',
  'KHTC + AUDIT + BGH',
  'KHTC',
  'AUDIT/KIEM_SOAT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'ROLE_AND_SCOPE',
  'KHTC',
  'BGH + TTGDTX_SETTLEMENT',
  'Ky doi soat da khoa, so tien de nghi, ghi chu duyet, minh chung neu co.',
  'Khong duyet neu so tien vuot de nghi, da chi tien, thieu dong chi tiet hoac ngoai pham vi.',
  48,
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
  'GATE_P2_16_TTGDTX_PAYMENT_REQUEST_APPROVAL',
  'Gate P2-16: Kiem/duyet de nghi chi TTGDTX',
  'FINANCE',
  'TTGDTX_PAYMENT_REQUEST',
  'ttgdtx_partner_payment_requests',
  'KHTC + AUDIT + BGH',
  'KHTC/Audit kiem tra ky doi soat da khoa, so tien, dong chi tiet va ghi chu.',
  'BGH/nguoi duoc uy quyen chi duyet de nghi, khong chi tien o buoc nay.',
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
  'NAV_P2_16_TTGDTX_PAYMENT_APPROVAL',
  'P2-16 Kiem/duyet de nghi chi TTGDTX',
  'FINANCE',
  'M08_FINANCE_ACCOUNTING',
  '/ttgdtx/payment-requests/review',
  'Kiem/duyet de nghi chi TTGDTX da tao tu P2-15 truoc khi sang buoc chi tien.',
  'KHTC + AUDIT + BGH',
  'OPEN_PAYMENT_APPROVAL',
  2160,
  true,
  'request_status in SUBMITTED/CHECKED hoac requested_amount_vnd > approved_amount_vnd',
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
