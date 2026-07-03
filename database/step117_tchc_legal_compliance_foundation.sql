-- File: database/step117_tchc_legal_compliance_foundation.sql
-- Purpose:
-- - Add a legal/SOP compliance foundation for Phong To chuc hanh chinh (TCHC).
-- - Link TCHC positions and report contracts to legal-review gates.
-- - Keep all legal basis rows as PHAP_CHE review-required placeholders until a
--   human legal owner confirms official law/regulation/source documents.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order
-- approval and owner Go/No-Go sign-off.

begin;

insert into public.legal_registry (
  legal_code,
  title,
  source_type,
  issuing_authority,
  document_no,
  scope_note,
  owner_department,
  checker,
  approver,
  control_status
)
values
  (
    'LEGAL_TCHC_VAN_THU_LUU_TRU_REVIEW_REQUIRED',
    'TCHC van thu - luu tru: can Phap che xac nhan can cu van ban va luu tru',
    'OTHER',
    'PHAP_CHE_TO_CONFIRM',
    'PENDING_PHAP_CHE',
    'Ap dung cho cong van den/di, so van ban, ho so luu tru, thoi han bao quan va so hoa. Chua duoc coi la can cu phap ly chinh thuc.',
    'PHAP_CHE',
    'PHAP_CHE_REVIEWER_LABEL',
    'BGH_HIEU_TRUONG',
    'CHUA_DU_DIEU_KIEN'
  ),
  (
    'LEGAL_TCHC_HANH_CHINH_NHAN_SU_REVIEW_REQUIRED',
    'TCHC hanh chinh nhan su: can Phap che xac nhan can cu nhan su/lao dong',
    'OTHER',
    'PHAP_CHE_TO_CONFIRM',
    'PENDING_PHAP_CHE',
    'Ap dung cho ho so nhan su, bien dong nhan su, cham cong, nghi phep va du lieu ca nhan. Chua duoc coi la can cu phap ly chinh thuc.',
    'PHAP_CHE',
    'PHAP_CHE_REVIEWER_LABEL',
    'BGH_HIEU_TRUONG',
    'CHUA_DU_DIEU_KIEN'
  ),
  (
    'LEGAL_TCHC_CSVC_TAI_SAN_REVIEW_REQUIRED',
    'TCHC CSVC - tai san: can Phap che xac nhan can cu tai san, mua sam va sua chua',
    'OTHER',
    'PHAP_CHE_TO_CONFIRM',
    'PENDING_PHAP_CHE',
    'Ap dung cho tai san, thiet bi, mua sam, cap phat, bao tri, sua chua va nghiem thu. Chua duoc coi la can cu phap ly chinh thuc.',
    'PHAP_CHE',
    'PHAP_CHE_REVIEWER_LABEL',
    'BGH_HIEU_TRUONG',
    'CHUA_DU_DIEU_KIEN'
  ),
  (
    'LEGAL_TCHC_HAU_CAN_AN_NINH_Y_TE_REVIEW_REQUIRED',
    'TCHC hau can - an ninh - y te: can Phap che xac nhan can cu an toan truong hoc',
    'OTHER',
    'PHAP_CHE_TO_CONFIRM',
    'PENDING_PHAP_CHE',
    'Ap dung cho le tan, hau can, bao ve, phuong tien, ve sinh moi truong va y te hoc duong. Chua duoc coi la can cu phap ly chinh thuc.',
    'PHAP_CHE',
    'PHAP_CHE_REVIEWER_LABEL',
    'BGH_HIEU_TRUONG',
    'CHUA_DU_DIEU_KIEN'
  ),
  (
    'LEGAL_TCHC_REPORT_PRIVACY_REVIEW_REQUIRED',
    'TCHC report privacy: can Phap che xac nhan pham vi du lieu hien thi trong bao cao',
    'OTHER',
    'PHAP_CHE_TO_CONFIRM',
    'PENDING_PHAP_CHE',
    'Ap dung cho tat ca report view TCHC; bat buoc masking/redaction voi CCCD, hop dong, ho so nhan su, y te, an ninh, tai chinh va file goc nhay cam.',
    'PHAP_CHE',
    'PHAP_CHE_REVIEWER_LABEL',
    'BGH_HIEU_TRUONG',
    'CHUA_DU_DIEU_KIEN'
  )
on conflict (legal_code) do update set
  title = excluded.title,
  source_type = excluded.source_type,
  issuing_authority = excluded.issuing_authority,
  document_no = excluded.document_no,
  scope_note = excluded.scope_note,
  owner_department = excluded.owner_department,
  checker = excluded.checker,
  approver = excluded.approver,
  control_status = excluded.control_status,
  updated_at = now();

with sop_seed as (
  select *
  from (
    values
      ('SOP_TCHC_VAN_THU_LUU_TRU', 'SOP van thu - luu tru', 'LEGAL_TCHC_VAN_THU_LUU_TRU_REVIEW_REQUIRED', 'TCHC_VAN_THU_LUU_TRU', 'Cong van den/di, so van ban, ho so luu tru, thoi han bao quan va so hoa.'),
      ('SOP_TCHC_HANH_CHINH_NHAN_SU', 'SOP hanh chinh nhan su', 'LEGAL_TCHC_HANH_CHINH_NHAN_SU_REVIEW_REQUIRED', 'TCHC_HANH_CHINH_NHAN_SU', 'Ho so nhan su, bien dong, cham cong, nghi phep va pham vi du lieu ca nhan.'),
      ('SOP_TCHC_CSVC_TAI_SAN', 'SOP CSVC - tai san', 'LEGAL_TCHC_CSVC_TAI_SAN_REVIEW_REQUIRED', 'TCHC_CSVC_TAI_SAN', 'Tai san, thiet bi, mua sam, cap phat, bao tri, sua chua va nghiem thu.'),
      ('SOP_TCHC_HAU_CAN_AN_NINH_Y_TE', 'SOP hau can - an ninh - y te', 'LEGAL_TCHC_HAU_CAN_AN_NINH_Y_TE_REVIEW_REQUIRED', 'TCHC_LE_TAN_HAU_CAN', 'Le tan, hau can, bao ve, phuong tien, ve sinh moi truong va y te hoc duong.'),
      ('SOP_TCHC_REPORT_PRIVACY', 'SOP bao cao va bao mat du lieu TCHC', 'LEGAL_TCHC_REPORT_PRIVACY_REVIEW_REQUIRED', 'TCHC_TONG_HOP_BAO_CAO', 'Chuan hoa bao cao TCHC, redaction, owner signoff va report view reliance.')
  ) as seed(sop_code, sop_name, legal_code, owner_position_code, objective)
)
insert into public.sop_registry (
  sop_code,
  sop_name,
  module_code,
  objective,
  owner_department,
  checker_role,
  approver_role,
  legal_registry_id,
  input_note,
  output_note,
  risk_note,
  control_note,
  control_status
)
select
  seed.sop_code,
  seed.sop_name,
  'M02_TCHC',
  seed.objective,
  'TCHC',
  'PHAP_CHE_REVIEWER_LABEL',
  'BGH_HIEU_TRUONG',
  lr.id,
  'Input chi la metadata/report contract/controlled evidence reference; khong dua raw CCCD, hop dong, benh an, sao ke, password, OTP hoac file goc nhay cam.',
  'Output la SOP draft va report gate; khong la SOP ban hanh chinh thuc khi chua co PHAP_CHE/BGH signoff.',
  'Rui ro: su dung report TCHC nhu can cu phap ly/chung tu/quyet dinh nhan su, tai san, y te hoac thanh toan khi chua co signoff.',
  'Bat buoc PHAP_CHE legal check, TCHC professional owner check, IT_DATA/Audit data check va owner signoff ngoai Git/Codex/chat.',
  'CHUA_DU_DIEU_KIEN'
from sop_seed seed
left join public.legal_registry lr on lr.legal_code = seed.legal_code
on conflict (sop_code) do update set
  sop_name = excluded.sop_name,
  module_code = excluded.module_code,
  objective = excluded.objective,
  owner_department = excluded.owner_department,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  legal_registry_id = excluded.legal_registry_id,
  input_note = excluded.input_note,
  output_note = excluded.output_note,
  risk_note = excluded.risk_note,
  control_note = excluded.control_note,
  control_status = excluded.control_status,
  updated_at = now();

create table if not exists public.heu_tchc_legal_compliance_requirements (
  id uuid primary key default gen_random_uuid(),
  compliance_code text not null unique,
  compliance_name text not null,
  domain_code text not null,
  owner_position_code text not null references public.heu_org_positions(position_code) on update cascade on delete restrict,
  legal_code text not null references public.legal_registry(legal_code) on update cascade on delete restrict,
  sop_code text not null references public.sop_registry(sop_code) on update cascade on delete restrict,
  report_code text references public.heu_position_report_requirements(report_code) on update cascade on delete restrict,
  evidence_class text not null,
  retention_gate text not null,
  data_boundary text not null,
  stop_condition text not null,
  phap_che_required boolean not null default true,
  audit_required boolean not null default true,
  automation_allowed boolean not null default false,
  ai_allowed boolean not null default false,
  legal_status text not null default 'LEGAL_REVIEW_REQUIRED',
  status public.record_status not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_tchc_legal_evidence_class_valid check (
    evidence_class in (
      'PUBLIC_METADATA',
      'INTERNAL',
      'CONFIDENTIAL',
      'SENSITIVE_PII',
      'HEALTH_SENSITIVE',
      'FINANCE_EVIDENCE'
    )
  ),
  constraint heu_tchc_legal_status_valid check (
    legal_status in (
      'LEGAL_REVIEW_REQUIRED',
      'SOP_REQUIRED',
      'READY_FOR_UAT',
      'SIGNED_OFF',
      'BLOCKED'
    )
  )
);

alter table public.heu_tchc_legal_compliance_requirements enable row level security;

drop policy if exists "heu_tchc_legal_compliance_select_master_control"
on public.heu_tchc_legal_compliance_requirements;
create policy "heu_tchc_legal_compliance_select_master_control"
on public.heu_tchc_legal_compliance_requirements for select
to authenticated
using (public.can_read_master_control() or public.can_read_permission_matrix());

drop policy if exists "heu_tchc_legal_compliance_manage_master_control"
on public.heu_tchc_legal_compliance_requirements;
create policy "heu_tchc_legal_compliance_manage_master_control"
on public.heu_tchc_legal_compliance_requirements for all
to authenticated
using (public.can_manage_master_control())
with check (public.can_manage_master_control());

insert into public.heu_tchc_legal_compliance_requirements (
  compliance_code,
  compliance_name,
  domain_code,
  owner_position_code,
  legal_code,
  sop_code,
  report_code,
  evidence_class,
  retention_gate,
  data_boundary,
  stop_condition,
  phap_che_required,
  audit_required,
  automation_allowed,
  ai_allowed,
  legal_status,
  notes
)
values
  ('TCHC-LEGAL-01', 'Van thu cong van den/di legal gate', 'VAN_THU_LUU_TRU', 'TCHC_VAN_THU_LUU_TRU', 'LEGAL_TCHC_VAN_THU_LUU_TRU_REVIEW_REQUIRED', 'SOP_TCHC_VAN_THU_LUU_TRU', 'RPT_TCHC_CONG_VAN_DEN_DI', 'CONFIDENTIAL', 'Retention schedule must be confirmed by PHAP_CHE before archive/disposal.', 'Report stores metadata only; raw document body and sensitive attachments stay in controlled evidence storage.', 'Stop if raw official documents or sensitive attachments are pasted into report, chat, Git or AI context.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-02', 'Ho so luu tru legal gate', 'VAN_THU_LUU_TRU', 'TCHC_VAN_THU_LUU_TRU', 'LEGAL_TCHC_VAN_THU_LUU_TRU_REVIEW_REQUIRED', 'SOP_TCHC_VAN_THU_LUU_TRU', 'RPT_TCHC_HO_SO_LUU_TRU', 'CONFIDENTIAL', 'Archive category and retention/disposal rule must be signed by PHAP_CHE.', 'Report stores archive status/classification only, not raw files.', 'Stop if archive disposal, file movement or legal retention conclusion is made without PHAP_CHE signoff.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-03', 'Bien dong nhan su legal gate', 'HANH_CHINH_NHAN_SU', 'TCHC_HANH_CHINH_NHAN_SU', 'LEGAL_TCHC_HANH_CHINH_NHAN_SU_REVIEW_REQUIRED', 'SOP_TCHC_HANH_CHINH_NHAN_SU', 'RPT_TCHC_NHAN_SU_BIEN_DONG', 'SENSITIVE_PII', 'Personnel record retention and access scope must be confirmed by PHAP_CHE.', 'Report shows aggregated/status data only; no raw CCCD, contract body, salary detail or disciplinary sensitive content.', 'Stop if personnel decision, contract interpretation or disciplinary/legal conclusion is inferred from PASS_LOCAL.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-04', 'Ho so nhan su bo sung legal gate', 'HANH_CHINH_NHAN_SU', 'TCHC_HO_SO_NHAN_SU', 'LEGAL_TCHC_HANH_CHINH_NHAN_SU_REVIEW_REQUIRED', 'SOP_TCHC_HANH_CHINH_NHAN_SU', 'RPT_TCHC_HO_SO_NHAN_SU', 'SENSITIVE_PII', 'Personnel dossier checklist and retention route must be signed by PHAP_CHE.', 'Report stores gap status only; raw employee files stay outside report view.', 'Stop if raw personal documents, CCCD, medical data or contract scans are stored in chat/Git/report output.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-05', 'Cham cong nghi phep legal gate', 'HANH_CHINH_NHAN_SU', 'TCHC_HANH_CHINH_NHAN_SU', 'LEGAL_TCHC_HANH_CHINH_NHAN_SU_REVIEW_REQUIRED', 'SOP_TCHC_HANH_CHINH_NHAN_SU', 'RPT_TCHC_CHAM_CONG_NGHI_PHEP', 'SENSITIVE_PII', 'Attendance/leave source, correction route and payroll handoff must be signed by TCHC + KHTC + PHAP_CHE.', 'Report is a reconciliation source only; it does not approve payroll or labor conclusion.', 'Stop if attendance report is treated as payroll approval, sanction basis or final labor decision.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-06', 'Tai san thiet bi legal gate', 'CSVC_TAI_SAN', 'TCHC_CSVC_TAI_SAN', 'LEGAL_TCHC_CSVC_TAI_SAN_REVIEW_REQUIRED', 'SOP_TCHC_CSVC_TAI_SAN', 'RPT_TCHC_TAI_SAN_THIET_BI', 'INTERNAL', 'Asset inventory, handover, liquidation and loss/damage route must be confirmed by PHAP_CHE + KHTC.', 'Report stores status and control metadata only; signed inventory minutes remain controlled evidence.', 'Stop if report is treated as signed inventory, liquidation, liability or accounting basis.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-07', 'Bao tri sua chua legal gate', 'CSVC_TAI_SAN', 'TCHC_BAO_TRI_SUA_CHUA', 'LEGAL_TCHC_CSVC_TAI_SAN_REVIEW_REQUIRED', 'SOP_TCHC_CSVC_TAI_SAN', 'RPT_TCHC_BAO_TRI_SUA_CHUA', 'FINANCE_EVIDENCE', 'Repair request, quotation, acceptance and payment handoff route must be signed by TCHC + KHTC + PHAP_CHE.', 'Report is a queue/status view; vouchers, invoices and acceptance minutes stay in controlled evidence.', 'Stop if repair report approves cost, payment, vendor selection or acceptance without finance/legal signoff.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-08', 'Mua sam cap phat legal gate', 'CSVC_TAI_SAN', 'TCHC_MUA_SAM_CAP_PHAT', 'LEGAL_TCHC_CSVC_TAI_SAN_REVIEW_REQUIRED', 'SOP_TCHC_CSVC_TAI_SAN', 'RPT_TCHC_MUA_SAM_CAP_PHAT', 'FINANCE_EVIDENCE', 'Procurement proposal, approval, receipt and issue route must be confirmed by TCHC + KHTC + PHAP_CHE.', 'Report stores request/status metadata only; finance documents and supplier evidence stay outside report view.', 'Stop if purchase, payment, supplier or issue approval is made from report/dashboard alone.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-09', 'Hau can su kien legal gate', 'HAU_CAN', 'TCHC_LE_TAN_HAU_CAN', 'LEGAL_TCHC_HAU_CAN_AN_NINH_Y_TE_REVIEW_REQUIRED', 'SOP_TCHC_HAU_CAN_AN_NINH_Y_TE', 'RPT_TCHC_HAU_CAN_SU_KIEN', 'INTERNAL', 'Event/logistics scope, guest data and cost handoff route must be reviewed by PHAP_CHE where sensitive.', 'Report stores logistics metadata only; guest/sensitive event details require controlled evidence.', 'Stop if event report exposes guest sensitive data or approves expenses without owner/finance gate.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-10', 'An ninh trat tu legal gate', 'AN_NINH', 'TCHC_BAO_VE_AN_NINH', 'LEGAL_TCHC_HAU_CAN_AN_NINH_Y_TE_REVIEW_REQUIRED', 'SOP_TCHC_HAU_CAN_AN_NINH_Y_TE', 'RPT_TCHC_AN_NINH_TRAT_TU', 'CONFIDENTIAL', 'Security incident classification, retention and escalation route must be signed by PHAP_CHE + BGH.', 'Report stores incident metadata and redacted summaries only.', 'Stop if report contains raw identities, camera evidence, accusations or legal conclusion without PHAP_CHE/BGH review.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-11', 'Phuong tien lai xe legal gate', 'PHUONG_TIEN', 'TCHC_PHUONG_TIEN', 'LEGAL_TCHC_HAU_CAN_AN_NINH_Y_TE_REVIEW_REQUIRED', 'SOP_TCHC_HAU_CAN_AN_NINH_Y_TE', 'RPT_TCHC_PHUONG_TIEN', 'INTERNAL', 'Vehicle use, fuel, maintenance and accident/incident route must be confirmed by TCHC + KHTC + PHAP_CHE.', 'Report stores route/cost/status metadata only; invoices and incident evidence stay controlled.', 'Stop if report approves cost, liability, insurance/legal conclusion or driver decision.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-12', 'Ve sinh moi truong legal gate', 'MOI_TRUONG', 'TCHC_VE_SINH_MOI_TRUONG', 'LEGAL_TCHC_HAU_CAN_AN_NINH_Y_TE_REVIEW_REQUIRED', 'SOP_TCHC_HAU_CAN_AN_NINH_Y_TE', 'RPT_TCHC_VE_SINH_MOI_TRUONG', 'INTERNAL', 'Environmental/sanitation checklist, hazard escalation and supplier handoff route must be confirmed by TCHC + PHAP_CHE where required.', 'Report stores checklist/status metadata only.', 'Stop if hazard, vendor, expense or compliance conclusion is finalized from report alone.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-13', 'Y te hoc duong legal gate', 'Y_TE', 'TCHC_Y_TE_HOC_DUONG', 'LEGAL_TCHC_HAU_CAN_AN_NINH_Y_TE_REVIEW_REQUIRED', 'SOP_TCHC_HAU_CAN_AN_NINH_Y_TE', 'RPT_TCHC_Y_TE_HOC_DUONG', 'HEALTH_SENSITIVE', 'Health/school medical incident scope, retention, disclosure and escalation route must be signed by PHAP_CHE + BGH.', 'Report stores redacted health incident metadata only; no diagnosis or medical file content in report/chat/Git.', 'Stop if health data, diagnosis, treatment detail or medical conclusion is exposed or used without signed legal/medical owner route.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null),
  ('TCHC-LEGAL-14', 'Tong hop bao cao TCHC legal/privacy gate', 'TCHC_TONG_HOP', 'TCHC_TONG_HOP_BAO_CAO', 'LEGAL_TCHC_REPORT_PRIVACY_REVIEW_REQUIRED', 'SOP_TCHC_REPORT_PRIVACY', 'RPT_TCHC_TONG_HOP_THANG', 'CONFIDENTIAL', 'Report-view reliance, masking, retention and owner signoff must be confirmed by PHAP_CHE + Audit before any dashboard reliance.', 'Summary report must only read approved report views and redacted metadata.', 'Stop if TCHC summary is treated as legal evidence, HR decision, finance approval, UAT acceptance or production dashboard source before signoff.', true, true, false, false, 'LEGAL_REVIEW_REQUIRED', null)
on conflict (compliance_code) do update set
  compliance_name = excluded.compliance_name,
  domain_code = excluded.domain_code,
  owner_position_code = excluded.owner_position_code,
  legal_code = excluded.legal_code,
  sop_code = excluded.sop_code,
  report_code = excluded.report_code,
  evidence_class = excluded.evidence_class,
  retention_gate = excluded.retention_gate,
  data_boundary = excluded.data_boundary,
  stop_condition = excluded.stop_condition,
  phap_che_required = excluded.phap_che_required,
  audit_required = excluded.audit_required,
  automation_allowed = excluded.automation_allowed,
  ai_allowed = excluded.ai_allowed,
  legal_status = excluded.legal_status,
  status = 'ACTIVE',
  notes = coalesce(excluded.notes, heu_tchc_legal_compliance_requirements.notes),
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
select
  'GATE_' || compliance_code,
  compliance_name || ' - PHAP_CHE gate',
  'LEGAL',
  'TCHC_LEGAL_COMPLIANCE',
  compliance_code,
  'PHAP_CHE',
  'PHAP_CHE must confirm legal basis, SOP route, retention gate, data boundary and stop condition outside Git/Codex/chat.',
  'BGH/TCHC owner must sign before READY_FOR_UAT or SIGNED_OFF.',
  'PENDING'
from public.heu_tchc_legal_compliance_requirements
where compliance_code like 'TCHC-LEGAL-%'
on conflict (gate_code) do update set
  gate_name = excluded.gate_name,
  gate_type = excluded.gate_type,
  entity_type = excluded.entity_type,
  entity_code = excluded.entity_code,
  owner_department = excluded.owner_department,
  checker_note = excluded.checker_note,
  approver_note = excluded.approver_note,
  decision_status = case
    when public.decision_gates.decision_status = 'APPROVED' then public.decision_gates.decision_status
    else excluded.decision_status
  end,
  updated_at = now();

create or replace view public.heu_tchc_legal_compliance_status
with (security_invoker = true)
as
select
  c.id,
  c.compliance_code,
  c.compliance_name,
  c.domain_code,
  c.owner_position_code,
  p.position_name as owner_position_name,
  c.legal_code,
  lr.title as legal_title,
  lr.control_status as legal_control_status,
  c.sop_code,
  sr.sop_name,
  sr.control_status as sop_control_status,
  c.report_code,
  rr.report_name,
  rr.control_status as report_control_status,
  c.evidence_class,
  c.retention_gate,
  c.data_boundary,
  c.stop_condition,
  c.phap_che_required,
  c.audit_required,
  c.automation_allowed,
  c.ai_allowed,
  c.legal_status,
  dg.decision_status as legal_gate_decision_status,
  case
    when c.legal_status <> 'SIGNED_OFF' then 'LEGAL_NO_GO'
    when coalesce(lr.control_status, 'CHUA_DU_DIEU_KIEN') <> 'DAT' then 'LEGAL_NO_GO'
    when coalesce(sr.control_status, 'CHUA_DU_DIEU_KIEN') <> 'DAT' then 'SOP_NO_GO'
    when coalesce(dg.decision_status, 'DRAFT') <> 'APPROVED' then 'GATE_NO_GO'
    else 'LEGAL_READY'
  end as compliance_readiness_state
from public.heu_tchc_legal_compliance_requirements c
join public.heu_org_positions p on p.position_code = c.owner_position_code
left join public.legal_registry lr on lr.legal_code = c.legal_code
left join public.sop_registry sr on sr.sop_code = c.sop_code
left join public.heu_position_report_requirements rr on rr.report_code = c.report_code
left join public.decision_gates dg on dg.gate_code = 'GATE_' || c.compliance_code
where c.status = 'ACTIVE';

grant select on public.heu_tchc_legal_compliance_requirements to authenticated;
grant select on public.heu_tchc_legal_compliance_status to authenticated;

commit;
