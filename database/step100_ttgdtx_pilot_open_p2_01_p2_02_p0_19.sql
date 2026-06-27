-- Step 100 - P2-01/P2-02/P0-19 TTGDTX Pilot Open Fixture.
-- Run after step99_ttgdtx_master_dropdown_p2_12.sql and step97_ttgdtx_p0_19_finance_gate_fix.sql.
-- Migration candidate only. Do not run production migration from Codex/chat.
-- Sandbox/UAT only. Production remains NO-GO unless official contract,
-- tuition decision, legal gate, backup/restore evidence and human approval exist.
-- Rollback note:
-- - This step intentionally marks pilot records ACTIVE only for an approved
--   sandbox/UAT run.
-- - If rollback is needed, restore official P2-01/P2-02/P0-19 values from
--   backup evidence through an approved corrective migration.
--
-- Purpose:
-- - Open a controlled TTGDTX sample path to test P2-01 -> P2-10.
-- - Keep every changed value labeled PILOT and blocked from real partner payout.
-- - Do not use this script as legal, tuition, revenue or payout authority.

begin;

-- To intentionally run in an approved sandbox/UAT SQL session only, add this
-- line after `begin;` and before the guard below:
-- set local app.heu_allow_pilot_open = 'YES';
do $$
begin
  if coalesce(current_setting('app.heu_allow_pilot_open', true), '') <> 'YES' then
    raise exception 'Step100 blocked: set app.heu_allow_pilot_open=YES only in approved sandbox/UAT, never production.';
  end if;
end $$;

-- 1) Mo tam hop dong P2-01 cho TTGDTX-0001.
update public.ttgdtx_partner_contracts c
set
  contract_no = coalesce(nullif(c.contract_no, ''), 'PILOT-TTGDTX-0001-2026-001'),
  signed_on = coalesce(c.signed_on, current_date),
  effective_from = coalesce(c.effective_from, date '2026-01-01'),
  contract_file_url = coalesce(
    nullif(c.contract_file_url, ''),
    'PILOT_NO_REAL_FILE__DO_NOT_PAY_PARTNER'
  ),
  legal_basis = 'PILOT A: open temporary gate for internal system testing only; replace with official legal contract before production.',
  scope_note = 'PILOT A: TTGDTX provides student list, HEU tests admission, receivable and collection flow. Not valid for real payment.',
  student_list_owner = 'TTGDTX provides student list; HEU checks duplicate, scope and admission status.',
  training_delivery_note = 'PILOT A: training operation not confirmed for production.',
  tuition_collection_model = 'HEU_COLLECTS',
  tuition_collection_note = 'PILOT A: HEU records collection only for test flow; not accounting final posting.',
  settlement_cycle = 'MONTHLY',
  settlement_cutoff_rule = 'PILOT A: monthly reconciliation for test only.',
  partner_payment_model = 'CONTRACT_POLICY',
  commission_policy_note = 'PILOT A: partner payment policy is blocked from real payment until official contract and approval are completed.',
  payment_condition = 'MANUAL_APPROVAL_ONLY',
  contract_status = 'ACTIVE',
  risk_level = 'HIGH',
  control_status = 'DAT_TAM_THOI',
  updated_at = now()
from public.partners p,
     public.admission_segments s
where c.partner_id = p.id
  and c.admission_segment_id = s.id
  and p.partner_code = 'TTGDTX-0001'
  and s.segment_code = 'TC9_TTGDTX_LINKED'
  and c.status = 'ACTIVE';

-- 2) Mo tam chinh sach hoc phi P2-02 cho cac nganh trung cap trong TTGDTX pilot.
-- So tien 1,000,000 VND chi la so pilot de test cong no/thu tien.
update public.ttgdtx_tuition_policies tp
set
  tuition_amount_vnd = case
    when m.major_code in ('TUD', 'CNTT', 'KTDN', 'MKT', 'DL') then 1000000
    else coalesce(nullif(tp.tuition_amount_vnd, 0), 1000000)
  end,
  min_first_payment_vnd = case
    when m.major_code in ('TUD', 'CNTT', 'KTDN', 'MKT', 'DL') then 1000000
    else coalesce(nullif(tp.min_first_payment_vnd, 0), 1000000)
  end,
  due_rule = 'PILOT A: due date for term 1 is 14 days after receivable creation; replace before production.',
  settlement_basis = 'PILOT A: reconcile by valid student list, P2-03 receivable and P2-10 receipt evidence.',
  evidence_required = 'PILOT A: require receipt/voucher/link/image evidence before payment review.',
  collection_account_note = 'PILOT A: test collection only; not final accounting posting.',
  invoice_issue_rule = 'MANUAL_APPROVAL_ONLY',
  revenue_recognition_rule = 'PILOT A: revenue is not final until KHTC confirms official rule.',
  policy_status = 'ACTIVE',
  risk_level = 'HIGH',
  control_status = 'DAT_TAM_THOI',
  updated_at = now()
from public.ttgdtx_partner_contracts c,
     public.partners p,
     public.admission_segments s,
     public.admission_majors m
where tp.contract_id = c.id
  and c.partner_id = p.id
  and c.admission_segment_id = s.id
  and tp.admission_major_id = m.id
  and p.partner_code = 'TTGDTX-0001'
  and s.segment_code = 'TC9_TTGDTX_LINKED'
  and m.major_code in ('TUD', 'CNTT', 'KTDN', 'MKT', 'DL')
  and tp.status = 'ACTIVE';

-- 3) Mo tam gate P0-19 de P2-03 co the tao cong no trong pilot.
with gate_seed as (
  select
    n.nganh_id,
    m.id as admission_major_id,
    n.nganh_id as major_code,
    n.ten_nganh_tu_van
  from public.nganh_nghe_master n
  left join public.admission_majors m
    on m.major_code = n.nganh_id
   and m.status = 'ACTIVE'
  where n.nganh_id in ('TUD', 'CNTT', 'KTDN', 'MKT', 'DL')
    and n.status = 'ACTIVE'
)
insert into public.major_legal_tuition_gates (
  nganh_id,
  admission_major_id,
  major_code,
  legal_status,
  tuition_status,
  enrollment_gate,
  handover_gate,
  finance_gate,
  legal_ref,
  tuition_policy_ref,
  issue_summary,
  required_action,
  owner_department,
  checker_department,
  approver_role,
  control_status,
  status
)
select
  gs.nganh_id,
  gs.admission_major_id,
  gs.major_code,
  'VERIFIED',
  'CONFIGURED',
  'ALLOW_ENROLLMENT',
  'ALLOW_HANDOVER',
  'ALLOW_FINANCE',
  'PILOT_A_P2_01_TTGDTX_CONTRACT',
  'PILOT_A_P2_02_TTGDTX_TUITION',
  'PILOT A: temporary legal/tuition gate opened for TTGDTX system test only.',
  'Before production, replace pilot data with official contract, tuition decision, quota and legal file registry.',
  'DAO_TAO',
  'PHAP_CHE + IT_DATA',
  'BGH_HIEU_TRUONG',
  'DAT_TAM_THOI',
  'ACTIVE'
from gate_seed gs
on conflict (nganh_id) do update set
  admission_major_id = excluded.admission_major_id,
  major_code = excluded.major_code,
  legal_status = excluded.legal_status,
  tuition_status = excluded.tuition_status,
  enrollment_gate = excluded.enrollment_gate,
  handover_gate = excluded.handover_gate,
  finance_gate = excluded.finance_gate,
  legal_ref = excluded.legal_ref,
  tuition_policy_ref = excluded.tuition_policy_ref,
  issue_summary = excluded.issue_summary,
  required_action = excluded.required_action,
  owner_department = excluded.owner_department,
  checker_department = excluded.checker_department,
  approver_role = excluded.approver_role,
  control_status = excluded.control_status,
  status = excluded.status,
  updated_at = now();

commit;

-- Ket qua mong doi:
-- p2_01_ready = 1
-- p2_02_ready = 5
-- p0_19_finance_ready = 5
select
  (
    select count(*)::int
    from public.ttgdtx_partner_contract_readiness
    where partner_code = 'TTGDTX-0001'
      and readiness_status = 'READY'
  ) as p2_01_ready,
  (
    select count(*)::int
    from public.ttgdtx_tuition_policy_readiness
    where partner_code = 'TTGDTX-0001'
      and readiness_status = 'READY'
  ) as p2_02_ready,
  (
    select count(*)::int
    from public.major_legal_tuition_gates
    where major_code in ('TUD', 'CNTT', 'KTDN', 'MKT', 'DL')
      and legal_status = 'VERIFIED'
      and tuition_status = 'CONFIGURED'
      and finance_gate = 'ALLOW_FINANCE'
      and status = 'ACTIVE'
  ) as p0_19_finance_ready;
