-- Step 97 - P2-03 must obey P0-19 major legal/tuition finance gate.
-- Run after step96_ttgdtx_tuition_collection_p2_10.sql.
-- Migration candidate only. Do not run production migration from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - This step tightens P2-03 validation and the receivable candidate view.
-- - If rollback is needed, restore the previous validated Step90/Step96
--   function/view definitions through an approved corrective migration.
--
-- Purpose:
-- - P0-19 is the legal/tuition gate for a major.
-- - P2-03 is the accounting receivable creation gate.
-- - Accounting must not create receivables when P0-19 has not allowed finance.

begin;

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
    case when l.admission_major_id is not null and major_gate.id is null then 'P0_19_MAJOR_GATE_MISSING' end,
    case
      when major_gate.id is not null
       and (
         major_gate.legal_status <> 'VERIFIED'
         or major_gate.tuition_status <> 'CONFIGURED'
         or major_gate.finance_gate <> 'ALLOW_FINANCE'
       )
      then 'P0_19_MAJOR_FINANCE_GATE_NOT_READY'
    end,
    case when pol.policy_id is null then 'NO_MATCHING_READY_TUITION_POLICY' end,
    case when pol.policy_id is not null and pol.readiness_status <> 'READY' then 'TUITION_POLICY_NOT_READY' end,
    case when existing.receivable_id is not null then 'RECEIVABLE_ALREADY_EXISTS' end
  ], null) as blocking_items,
  case
    when l.status::text not in ('DOCUMENT_SUBMITTED', 'ELIGIBLE', 'ENROLLED') then 'NEEDS_LEAD_STATUS'
    when l.partner_id is null then 'NEEDS_PARTNER'
    when l.admission_program_id is null then 'NEEDS_PROGRAM'
    when l.admission_major_id is null then 'NEEDS_MAJOR'
    when major_gate.id is null then 'NEEDS_P0_19_MAJOR_GATE'
    when major_gate.legal_status <> 'VERIFIED'
      or major_gate.tuition_status <> 'CONFIGURED'
      or major_gate.finance_gate <> 'ALLOW_FINANCE' then 'P0_19_FINANCE_NOT_READY'
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
    and major_gate.id is not null
    and major_gate.legal_status = 'VERIFIED'
    and major_gate.tuition_status = 'CONFIGURED'
    and major_gate.finance_gate = 'ALLOW_FINANCE'
    and pol.policy_id is not null
    and pol.readiness_status = 'READY'
    and existing.receivable_id is null
  ) as can_create_receivable,
  l.created_at,
  l.updated_at,
  major_gate.id as major_gate_id,
  major_gate.legal_status as major_legal_status,
  major_gate.tuition_status as major_tuition_status,
  major_gate.finance_gate as major_finance_gate,
  major_gate.required_action as major_gate_required_action
from public.leads l
join public.admission_segments s on s.id = l.admission_segment_id
left join public.partners p on p.id = l.partner_id
left join public.admission_programs pr on pr.id = l.admission_program_id
left join public.admission_majors m on m.id = l.admission_major_id
left join public.admission_offering_catalog o on o.id = l.admission_offering_id
left join lateral (
  select g.*
  from public.major_legal_tuition_gates g
  where g.status = 'ACTIVE'
    and (
      g.admission_major_id = l.admission_major_id
      or (
        g.admission_major_id is null
        and g.major_code = m.major_code
      )
    )
  order by
    case
      when g.legal_status = 'VERIFIED'
       and g.tuition_status = 'CONFIGURED'
       and g.finance_gate = 'ALLOW_FINANCE'
      then 1
      else 2
    end,
    g.updated_at desc
  limit 1
) major_gate on true
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

create or replace function public.validate_ttgdtx_student_receivable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead record;
  v_policy record;
  v_major_gate record;
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
    l.is_deleted,
    m.major_code
  into v_lead
  from public.leads l
  left join public.admission_majors m on m.id = l.admission_major_id
  where l.id = new.lead_id;

  if not found or v_lead.is_deleted then
    raise exception 'P2-03: Khong tim thay lead dang hoat dong.';
  end if;

  select s.segment_code
  into v_segment_code
  from public.admission_segments s
  where s.id = v_lead.admission_segment_id
    and s.status = 'ACTIVE';

  if v_segment_code is distinct from 'TC9_TTGDTX_LINKED' then
    raise exception 'P2-03: Cong no nay chi dung cho Trung cap 9+ lien ket TTGDTX.';
  end if;

  if v_lead.partner_id is null then
    raise exception 'P2-03: Lead chua gan TTGDTX/doi tac.';
  end if;

  if v_lead.admission_program_id is null then
    raise exception 'P2-03: Lead chua gan he dao tao chuan.';
  end if;

  if v_lead.admission_major_id is null then
    raise exception 'P2-03: Lead chua gan nganh/nghe chuan.';
  end if;

  if v_lead.lead_status not in ('DOCUMENT_SUBMITTED', 'ELIGIBLE', 'ENROLLED') then
    raise exception 'P2-03: Lead chua du trang thai tao cong no. Can Da nop ho so, Du dieu kien hoac Da nhap hoc.';
  end if;

  if new.receivable_status not in ('CANCELLED', 'WAIVED') then
    select g.*
    into v_major_gate
    from public.major_legal_tuition_gates g
    where g.status = 'ACTIVE'
      and (
        g.admission_major_id = v_lead.admission_major_id
        or (
          g.admission_major_id is null
          and g.major_code = v_lead.major_code
        )
      )
    order by
      case
        when g.legal_status = 'VERIFIED'
         and g.tuition_status = 'CONFIGURED'
         and g.finance_gate = 'ALLOW_FINANCE'
        then 1
        else 2
      end,
      g.updated_at desc
    limit 1;

    if not found then
      raise exception 'P2-03: Nganh/nghe chua co gate P0-19 phap ly/hoc phi. Can cau hinh P0-19 truoc khi tao cong no.';
    end if;

    if v_major_gate.legal_status <> 'VERIFIED'
       or v_major_gate.tuition_status <> 'CONFIGURED'
       or v_major_gate.finance_gate <> 'ALLOW_FINANCE' then
      raise exception 'P2-03: P0-19 chua cho phep ke toan tao cong no cho nganh nay. Can hoan tat phap ly/hoc phi nganh truoc.';
    end if;
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
    raise exception 'P2-03: Khong tim thay chinh sach hoc phi TTGDTX dang hoat dong.';
  end if;

  if v_policy.contract_record_status <> 'ACTIVE'
     or v_policy.contract_status <> 'ACTIVE' then
    raise exception 'P2-03: Hop dong TTGDTX chua ACTIVE.';
  end if;

  if v_policy.policy_status <> 'ACTIVE'
     or v_policy.tuition_amount_vnd <= 0
     or nullif(trim(coalesce(v_policy.due_rule, '')), '') is null
     or nullif(trim(coalesce(v_policy.settlement_basis, '')), '') is null
     or nullif(trim(coalesce(v_policy.evidence_required, '')), '') is null
     or (v_policy.effective_to is not null and v_policy.effective_to < current_date) then
    raise exception 'P2-03: Chinh sach hoc phi P2-02 chua READY.';
  end if;

  if v_policy.partner_id <> v_lead.partner_id then
    raise exception 'P2-03: Lead khong thuoc TTGDTX cua chinh sach hoc phi.';
  end if;

  if v_policy.admission_segment_id <> v_lead.admission_segment_id then
    raise exception 'P2-03: Doi tuong tuyen sinh cua lead khong khop chinh sach hoc phi.';
  end if;

  if v_policy.admission_program_id <> v_lead.admission_program_id then
    raise exception 'P2-03: He dao tao cua lead khong khop chinh sach hoc phi.';
  end if;

  if v_policy.admission_major_id is distinct from v_lead.admission_major_id then
    raise exception 'P2-03: Nganh/nghe cua lead khong khop chinh sach hoc phi.';
  end if;

  if v_policy.admission_offering_id is not null
     and v_lead.admission_offering_id is distinct from v_policy.admission_offering_id then
    raise exception 'P2-03: Khoa/chuong trinh chi tiet cua lead khong khop chinh sach hoc phi.';
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
    raise exception 'P2-03: Chinh sach hoc phi nay chua cho phep giam tru.';
  end if;

  if new.paid_amount_vnd > 0
     and nullif(trim(coalesce(new.evidence_url, new.voucher_no, '')), '') is null then
    raise exception 'P2-03: Co so tien da thu thi phai co chung tu hoac link minh chung.';
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
      raise exception 'P2-03: Huy cong no phai co ly do.';
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

grant execute on function public.validate_ttgdtx_student_receivable() to authenticated;

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
  'GATE_P2_03_REQUIRES_P0_19_FINANCE',
  'Gate P2-03 requires P0-19 finance permission',
  'FINANCE',
  'VIEW',
  'ttgdtx_receivable_candidate_leads',
  'KHTC + PHAP_CHE + IT_DATA',
  'P2-03 must read major_legal_tuition_gates before allowing TTGDTX receivable creation.',
  'If legal_status is not VERIFIED, tuition_status is not CONFIGURED, or finance_gate is not ALLOW_FINANCE, accounting is blocked.',
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

commit;
