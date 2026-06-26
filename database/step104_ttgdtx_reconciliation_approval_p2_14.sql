-- Step 104 / P2-14: review, approve and lock TTGDTX tuition reconciliation.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - No physical removal of business data is used.
-- - If rollback is needed, mark introduced P2-14 approval/control records inactive
--   through an approved corrective migration and keep audit evidence.
--
-- Purpose: control the P2-13 reconciliation batch before any later TTGDTX payment request.
-- P2-14 does not pay money. It only reviews, approves, locks or cancels a reconciliation batch.
-- It must not approve or lock a batch containing unresolved P2-10 invoice/receipt decisions.

drop view if exists public.ttgdtx_reconciliation_summary;

create or replace view public.ttgdtx_reconciliation_summary
with (security_invoker = true)
as
select
  coalesce((select count(*)::int from public.ttgdtx_reconciliation_candidates), 0) as candidate_count,
  coalesce((
    select count(*)::int
    from public.ttgdtx_reconciliation_candidates
    where can_reconcile
      and existing_batch_id is null
  ), 0) as ready_count,
  coalesce((
    select count(*)::int
    from public.ttgdtx_reconciliation_candidates
    where not can_reconcile
      and existing_batch_id is null
  ), 0) as blocked_count,
  coalesce((
    select count(*)::int
    from public.ttgdtx_reconciliation_candidates
    where existing_batch_id is not null
  ), 0) as already_in_batch_count,
  coalesce((
    select sum(payment_amount_vnd)
    from public.ttgdtx_reconciliation_candidates
  ), 0)::numeric(14,2) as candidate_total_vnd,
  coalesce((
    select sum(payment_amount_vnd)
    from public.ttgdtx_reconciliation_candidates
    where can_reconcile
      and existing_batch_id is null
  ), 0)::numeric(14,2) as ready_total_vnd,
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
      and reconciliation_status <> 'CANCELLED'
      and public.can_read_ttgdtx_reconciliation(partner_id)
  ), 0)::numeric(14,2) as batched_total_vnd;

grant select on public.ttgdtx_reconciliation_summary to authenticated;

drop view if exists public.ttgdtx_reconciliation_review_board;

create or replace view public.ttgdtx_reconciliation_review_board
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
  s.segment_code,
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
  coalesce(stats.line_count, 0) as line_count,
  coalesce(stats.warning_line_count, 0) as warning_line_count,
  coalesce(stats.unresolved_invoice_line_count, 0) as unresolved_invoice_line_count,
  coalesce(stats.reviewed_line_count, 0) as reviewed_line_count,
  creator.full_name as created_by_name,
  updater.full_name as updated_by_name,
  b.created_at,
  b.updated_at,
  array_remove(array[
    case when coalesce(stats.line_count, 0) <= 0 then 'NO_RECONCILIATION_LINES' end,
    case when coalesce(b.total_collected_vnd, 0) <= 0 then 'NO_COLLECTED_AMOUNT' end,
    case when coalesce(stats.unresolved_invoice_line_count, 0) > 0 then 'UNRESOLVED_INVOICE_DECISION' end,
    case when b.reconciliation_status in ('CANCELLED', 'LOCKED') then 'BATCH_CLOSED' end
  ], null::text) as blocking_items,
  (
    b.reconciliation_status = 'READY_FOR_REVIEW'
    and coalesce(stats.line_count, 0) > 0
    and coalesce(b.total_collected_vnd, 0) > 0
    and coalesce(stats.unresolved_invoice_line_count, 0) = 0
  ) as can_review,
  (
    b.reconciliation_status = 'REVIEWED'
    and coalesce(stats.unresolved_invoice_line_count, 0) = 0
  ) as can_approve,
  (
    b.reconciliation_status = 'APPROVED'
    and coalesce(stats.unresolved_invoice_line_count, 0) = 0
  ) as can_lock
from public.ttgdtx_tuition_reconciliation_batches b
join public.partners partner on partner.id = b.partner_id
join public.admission_segments s on s.id = b.admission_segment_id
left join public.users_profile creator on creator.id = b.created_by
left join public.users_profile updater on updater.id = b.updated_by
left join lateral (
  select
    count(*)::int as line_count,
    sum(
      case
        when coalesce(array_length(line.warning_items, 1), 0) > 0 then 1
        else 0
      end
    )::int as warning_line_count,
    sum(
      case
        when coalesce(line.invoice_control_status, 'NEEDS_INVOICE_DECISION') <> 'RESOLVED' then 1
        else 0
      end
    )::int as unresolved_invoice_line_count,
    sum(case when line.line_status = 'REVIEWED' then 1 else 0 end)::int as reviewed_line_count
  from public.ttgdtx_tuition_reconciliation_lines line
  where line.batch_id = b.id
    and line.record_status = 'ACTIVE'
    and line.line_status not in ('CANCELLED', 'EXCLUDED')
) stats on true
where b.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_reconciliation(b.partner_id);

grant select on public.ttgdtx_reconciliation_review_board to authenticated;

create or replace function public.review_ttgdtx_reconciliation_batch(
  p_batch_id uuid,
  p_action text,
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
  v_action text;
  v_note text;
  v_evidence_url text;
  v_line_count integer;
  v_unresolved_invoice_count integer;
begin
  if not public.can_manage_ttgdtx_reconciliation() then
    raise exception 'P2-14: Tai khoan chua co quyen ra soat/duyet ky doi soat TTGDTX.';
  end if;

  v_action := upper(nullif(trim(coalesce(p_action, '')), ''));
  if p_batch_id is null or v_action is null then
    raise exception 'P2-14: Can chon ky doi soat va hanh dong xu ly.';
  end if;

  select *
  into v_batch
  from public.ttgdtx_tuition_reconciliation_batches
  where id = p_batch_id
    and record_status = 'ACTIVE'
  for update;

  if not found then
    raise exception 'P2-14: Khong tim thay ky doi soat dang hoat dong.';
  end if;

  if not public.can_read_ttgdtx_reconciliation(v_batch.partner_id) then
    raise exception 'P2-14: Tai khoan chua duoc xem TTGDTX cua ky doi soat nay.';
  end if;

  select count(*)::int
  into v_line_count
  from public.ttgdtx_tuition_reconciliation_lines line
  where line.batch_id = p_batch_id
    and line.record_status = 'ACTIVE'
    and line.line_status not in ('CANCELLED', 'EXCLUDED');

  select count(*)::int
  into v_unresolved_invoice_count
  from public.ttgdtx_tuition_reconciliation_lines line
  where line.batch_id = p_batch_id
    and line.record_status = 'ACTIVE'
    and line.line_status not in ('CANCELLED', 'EXCLUDED')
    and coalesce(line.invoice_control_status, 'NEEDS_INVOICE_DECISION') <> 'RESOLVED';

  v_note := nullif(trim(coalesce(p_note, '')), '');
  v_evidence_url := nullif(trim(coalesce(p_evidence_url, '')), '');

  if v_action = 'REVIEW' then
    if v_batch.reconciliation_status <> 'READY_FOR_REVIEW' then
      raise exception 'P2-14: Chi ky READY_FOR_REVIEW moi duoc ra soat.';
    end if;

    if coalesce(v_line_count, 0) <= 0 then
      raise exception 'P2-14: Ky doi soat chua co dong chung tu.';
    end if;

    if coalesce(v_batch.total_collected_vnd, 0) <= 0 then
      raise exception 'P2-14: Ky doi soat chua co so tien da thu.';
    end if;

    if coalesce(v_unresolved_invoice_count, 0) > 0 then
      raise exception 'P2-14: Con chung tu P2-10 chua chot hoa don/chung tu, khong duoc ra soat ky.';
    end if;

    update public.ttgdtx_tuition_reconciliation_lines
    set
      line_status = 'REVIEWED',
      note = coalesce(note || E'\n', '') || '[P2-14 REVIEW] ' || coalesce(v_note, 'Da ra soat.'),
      updated_by = auth.uid(),
      updated_at = now()
    where batch_id = p_batch_id
      and record_status = 'ACTIVE'
      and line_status in ('READY', 'IN_BATCH');

    update public.ttgdtx_tuition_reconciliation_batches
    set
      reconciliation_status = 'REVIEWED',
      control_status = 'DAT_TAM_THOI',
      evidence_url = coalesce(v_evidence_url, evidence_url),
      note = coalesce(note || E'\n', '') || '[P2-14 REVIEW] ' || coalesce(v_note, 'Da ra soat.'),
      updated_by = auth.uid(),
      updated_at = now()
    where id = p_batch_id;

  elsif v_action = 'APPROVE' then
    if v_batch.reconciliation_status <> 'REVIEWED' then
      raise exception 'P2-14: Ky doi soat phai duoc ra soat truoc khi duyet.';
    end if;

    if coalesce(v_unresolved_invoice_count, 0) > 0 then
      raise exception 'P2-14: Con chung tu P2-10 chua chot hoa don/chung tu, khong duoc duyet ky.';
    end if;

    update public.ttgdtx_tuition_reconciliation_batches
    set
      reconciliation_status = 'APPROVED',
      control_status = 'DAT_TAM_THOI',
      evidence_url = coalesce(v_evidence_url, evidence_url),
      note = coalesce(note || E'\n', '') || '[P2-14 APPROVE] ' || coalesce(v_note, 'Da duyet ky doi soat.'),
      updated_by = auth.uid(),
      updated_at = now()
    where id = p_batch_id;

  elsif v_action = 'LOCK' then
    if v_batch.reconciliation_status <> 'APPROVED' then
      raise exception 'P2-14: Ky doi soat phai duoc duyet truoc khi khoa.';
    end if;

    if coalesce(v_unresolved_invoice_count, 0) > 0 then
      raise exception 'P2-14: Con chung tu P2-10 chua chot hoa don/chung tu, khong duoc khoa ky.';
    end if;

    update public.ttgdtx_tuition_reconciliation_batches
    set
      reconciliation_status = 'LOCKED',
      control_status = 'DAT',
      evidence_url = coalesce(v_evidence_url, evidence_url),
      note = coalesce(note || E'\n', '') || '[P2-14 LOCK] ' || coalesce(v_note, 'Da khoa ky doi soat.'),
      updated_by = auth.uid(),
      updated_at = now()
    where id = p_batch_id;

  elsif v_action = 'CANCEL' then
    if v_batch.reconciliation_status = 'LOCKED' then
      raise exception 'P2-14: Ky da khoa khong duoc huy tren man hinh nay.';
    end if;

    if v_note is null then
      raise exception 'P2-14: Huy/tra ve phai ghi ro ly do.';
    end if;

    update public.ttgdtx_tuition_reconciliation_lines
    set
      line_status = 'CANCELLED',
      note = coalesce(note || E'\n', '') || '[P2-14 CANCEL] ' || v_note,
      updated_by = auth.uid(),
      updated_at = now()
    where batch_id = p_batch_id
      and record_status = 'ACTIVE'
      and line_status not in ('CANCELLED', 'EXCLUDED');

    update public.ttgdtx_tuition_reconciliation_batches
    set
      reconciliation_status = 'CANCELLED',
      control_status = 'CAN_SUA',
      evidence_url = coalesce(v_evidence_url, evidence_url),
      note = coalesce(note || E'\n', '') || '[P2-14 CANCEL] ' || v_note,
      updated_by = auth.uid(),
      updated_at = now()
    where id = p_batch_id;

  else
    raise exception 'P2-14: Hanh dong khong hop le. Chi dung REVIEW, APPROVE, LOCK hoac CANCEL.';
  end if;

  return p_batch_id;
end;
$$;

grant execute on function public.review_ttgdtx_reconciliation_batch(uuid, text, text, text) to authenticated;

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
  'TTGDTX_RECONCILIATION_APPROVAL_P2_14',
  'P2-14 Duyet va khoa ky doi soat TTGDTX',
  'FINANCE',
  'KHTC + AUDIT + BGH',
  '/ttgdtx/reconciliation/review',
  true,
  'P2-14 ra soat, duyet va khoa ky doi soat P2-13 truoc khi chuyen sang de nghi chi/doi soat thanh toan TTGDTX; khong cho khoa ky neu con chung tu thu thieu quyet dinh hoa don/chung tu.',
  2140,
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
  'WF_P2_14_TTGDTX_RECONCILIATION_APPROVAL',
  'P2-14 Duyet va khoa ky doi soat TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Sau khi P2-13 da gom chung tu thu hoc phi thanh ky doi soat.',
  'KHTC',
  'KHTC + AUDIT + BGH',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Ky doi soat duoc REVIEWED, APPROVED hoac LOCKED de lam dau vao cho de nghi chi TTGDTX.',
  'Chi ky APPROVED/LOCKED moi duoc chuyen sang buoc de nghi thanh toan/chi tra TTGDTX.',
  'Moi hanh dong P2-14 di qua function, co audit log, khong sua truc tiep bang loi va khong bo qua quyet dinh hoa don/chung tu P2-10.',
  2140,
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
  'P2_14_TTGDTX_RECONCILIATION_APPROVAL',
  'P2-14 Duyet va khoa ky doi soat TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'ttgdtx_tuition_reconciliation_batches; ttgdtx_tuition_reconciliation_lines; ttgdtx_reconciliation_review_board',
  'TRANSACTION',
  'KHTC + AUDIT + BGH',
  'SUPABASE',
  'RESTRICTED',
  false,
  'Chi cap nhat trang thai ky doi soat qua function P2-14; khong chi tien va khong post chung tu ke toan tai buoc nay.',
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
  'OWN_P2_14_TTGDTX_RECONCILIATION_APPROVAL',
  'P2-14 Duyet va khoa ky doi soat TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_14_TTGDTX_RECONCILIATION_APPROVAL',
  'TTGDTX_RECONCILIATION_APPROVAL',
  'ttgdtx_tuition_reconciliation_batches; ttgdtx_tuition_reconciliation_lines',
  'KHTC + AUDIT + BGH',
  'KHTC',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'ROLE_AND_SCOPE',
  'KHTC',
  'TTGDTX_SETTLEMENT + BGH',
  'Ky doi soat P2-13, danh sach chung tu thu, link minh chung/doi soat neu co va ghi chu nguoi duyet.',
  'Khong sua truc tiep batch; REVIEW, APPROVE, LOCK, CANCEL deu qua function va audit log.',
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
  'GATE_P2_14_TTGDTX_RECONCILIATION_APPROVAL',
  'Gate P2-14: duyet va khoa ky doi soat TTGDTX',
  'FINANCE',
  'TTGDTX_RECONCILIATION_APPROVAL',
  'P2-14-TTGDTX-RECONCILIATION',
  'KHTC + AUDIT + BGH',
  'Kiem tra batch P2-13 co dong chung tu, co tien da thu, khong bi huy/khoa va co ghi chu/minh chung khi can.',
  'BGH/Audit xac nhan truoc khi chuyen sang de nghi chi/settlement TTGDTX.',
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
  'NAV_P2_14_TTGDTX_RECONCILIATION_APPROVAL',
  'P2-14 Duyet ky doi soat TTGDTX',
  'FINANCE',
  'M08_FINANCE_ACCOUNTING',
  '/ttgdtx/reconciliation/review',
  'Ra soat, duyet va khoa ky doi soat TTGDTX da tao o P2-13 truoc khi de nghi chi tra.',
  'KHTC + AUDIT + BGH',
  'Mo P2-14 de REVIEW, APPROVE hoac LOCK ky doi soat.',
  2140,
  false,
  'Can xu ly khi co ky READY_FOR_REVIEW/REVIEWED/APPROVED chua duoc chot hoac bi huy/tra ve.',
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
