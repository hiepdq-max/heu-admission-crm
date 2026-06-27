-- Step 110 - TTGDTX real-data evidence metadata and privacy fit.
-- Run after Step92 and Step98 on an isolated UAT/restore target.
-- This migration candidate does not import real student/bank rows and does not
-- approve production use. It only adds metadata needed to control real source
-- packs such as the Phu Xuyen K23/K24 folder.
-- Do not run production migration from Codex/chat.
-- Run database/step110_preflight_check_before_p2_19.sql first. If any required
-- object is MISSING, stop and apply the missing previous step on UAT/restore.
-- Run this file as a whole transaction. Do not copy only the lower half.
-- If Supabase still reports relation "a", rollback and run
-- database/step110_find_relation_a_debug.sql to locate the legacy object.

begin;

do $$
begin
  raise notice 'HEU_STEP110_20260626_P2_19_METADATA_VERSION_006';
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_user_id uuid;
  record_id uuid;
begin
  acting_user_id = auth.uid();

  if acting_user_id is not null and not exists (
    select 1 from public.users_profile where id = acting_user_id
  ) then
    acting_user_id = null;
  end if;

  if tg_op = 'DELETE' then
    record_id = nullif(coalesce(to_jsonb(old)->>'id', ''), '')::uuid;
  else
    record_id = nullif(coalesce(to_jsonb(new)->>'id', ''), '')::uuid;
  end if;

  insert into public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value
  ) values (
    acting_user_id,
    tg_op,
    tg_table_name,
    record_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  return coalesce(new, old);
end;
$$;

grant execute on function public.set_updated_at() to authenticated;
grant execute on function public.write_audit_log() to authenticated;

do $$
begin
  raise notice 'HEU_STEP110_CHECKPOINT_01_BASE_TRIGGER_FUNCTIONS_READY';
end $$;

alter table public.ttgdtx_source_documents
  add column if not exists drive_file_id text,
  add column if not exists source_folder_id text,
  add column if not exists evidence_type text not null default 'OTHER',
  add column if not exists pii_level text not null default 'NONE',
  add column if not exists extraction_status text not null default 'FILE_ONLY',
  add column if not exists evidence_hash text,
  add column if not exists manual_reviewed_by uuid references public.users_profile(id),
  add column if not exists manual_reviewed_at timestamptz;

alter table public.ttgdtx_source_documents
  drop constraint if exists ttgdtx_source_document_type_valid;

alter table public.ttgdtx_source_documents
  add constraint ttgdtx_source_document_type_valid check (
    source_type in (
      'DRIVE_FOLDER',
      'EXCEL_WORKBOOK',
      'GOOGLE_SHEET',
      'DOCX_REGULATION',
      'DOCX_CONTRACT',
      'DOCX_APPENDIX',
      'DOCX_ACCEPTANCE',
      'XLSX_ACCEPTANCE',
      'PDF_CONTRACT',
      'PDF_SCANNED_CONTRACT',
      'PDF_BANK_RECEIPT',
      'PDF_INVOICE',
      'BANK_CONTRACT',
      'EMAIL_THREAD',
      'E_INVOICE',
      'RECEIPT_VOUCHER',
      'ZIP_EVIDENCE',
      'HTML_PREVIEW',
      'OTHER'
    )
  );

alter table public.ttgdtx_source_documents
  drop constraint if exists ttgdtx_source_document_scope_valid;

alter table public.ttgdtx_source_documents
  add constraint ttgdtx_source_document_scope_valid check (
    document_scope in (
      'LEGAL_REGULATION',
      'SOP_MAP',
      'TTGDTX_MASTER',
      'CONTRACT_MASTER',
      'CONTRACT_APPENDIX',
      'TUITION_POLICY',
      'RECEIVABLE_GATE',
      'PAYMENT_COLLECTION',
      'BANK_RECEIPT',
      'ACCOUNT_CONTROL',
      'ACCEPTANCE',
      'COLLATERAL_RELEASE',
      'PAYOUT_EVIDENCE',
      'AUDIT',
      'PERMISSION_SCOPE',
      'LOCATION',
      'EVIDENCE',
      'OTHER'
    )
  );

alter table public.ttgdtx_source_documents
  drop constraint if exists ttgdtx_source_document_evidence_type_valid;

alter table public.ttgdtx_source_documents
  add constraint ttgdtx_source_document_evidence_type_valid check (
    evidence_type in (
      'SOURCE_PACK',
      'CONTRACT',
      'APPENDIX',
      'TUITION_WORKBOOK',
      'BANK_RECEIPT_PDF',
      'RECEIPT_VOUCHER',
      'COLLECTION_INVOICE',
      'ACCEPTANCE_MINUTES',
      'ACCEPTANCE_FOLDER',
      'ACCEPTANCE_ZIP',
      'INVOICE',
      'PARTNER_INVOICE',
      'TAX_INVOICE_POLICY',
      'ACCOUNT_FREEZE_NOTICE',
      'ACCOUNT_RELEASE_NOTICE',
      'CREDIT_CONTRACT',
      'COLLATERAL_CONTRACT',
      'COLLATERAL_RELEASE',
      'REGULATION',
      'SOP',
      'OTHER'
    )
  );

alter table public.ttgdtx_source_documents
  drop constraint if exists ttgdtx_source_document_pii_level_valid;

alter table public.ttgdtx_source_documents
  add constraint ttgdtx_source_document_pii_level_valid check (
    pii_level in ('NONE', 'PERSONAL', 'BANK', 'HIGH')
  );

alter table public.ttgdtx_source_documents
  drop constraint if exists ttgdtx_source_document_extraction_status_valid;

alter table public.ttgdtx_source_documents
  add constraint ttgdtx_source_document_extraction_status_valid check (
    extraction_status in (
      'FILE_ONLY',
      'EXTRACTED',
      'OCR_REQUIRED',
      'MANUAL_REVIEWED'
    )
  );

create index if not exists idx_ttgdtx_source_documents_drive_file
on public.ttgdtx_source_documents(drive_file_id)
where drive_file_id is not null and record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_source_documents_real_data_fit
on public.ttgdtx_source_documents(admission_segment_id, evidence_type, pii_level, extraction_status)
where record_status = 'ACTIVE';

alter table public.ttgdtx_source_control_checks
  drop constraint if exists ttgdtx_source_check_group_valid;

alter table public.ttgdtx_source_control_checks
  add constraint ttgdtx_source_check_group_valid check (
    check_group in (
      'SOURCE_FILE',
      'TTGDTX_MASTER',
      'CONTRACT',
      'LEGAL_GATE',
      'TUITION_POLICY',
      'RECEIVABLE_GATE',
      'IMPORT',
      'PAYMENT',
      'EVIDENCE',
      'PRIVACY',
      'AUDIT',
      'SCOPE',
      'WORKFLOW'
    )
  );

alter table public.ttgdtx_tuition_import_batches
  add column if not exists source_document_id uuid references public.ttgdtx_source_documents(id) on delete restrict,
  add column if not exists source_folder_id text,
  add column if not exists drive_file_id text,
  add column if not exists pii_level text not null default 'NONE',
  add column if not exists extraction_status text not null default 'FILE_ONLY',
  add column if not exists section_detection_status text not null default 'NOT_STARTED',
  add column if not exists redaction_status text not null default 'NOT_STARTED',
  add column if not exists duplicate_fingerprint_status text not null default 'NOT_STARTED';

alter table public.ttgdtx_tuition_import_batches
  drop constraint if exists ttgdtx_import_source_kind_valid;

alter table public.ttgdtx_tuition_import_batches
  add constraint ttgdtx_import_source_kind_valid check (
    source_kind in (
      'EXCEL',
      'MULTI_SECTION_EXCEL',
      'GOOGLE_SHEET',
      'CSV',
      'BANK_PDF',
      'DRIVE_FOLDER',
      'ACCEPTANCE_DOCX',
      'ACCEPTANCE_XLSX',
      'INVOICE_PDF',
      'E_INVOICE',
      'RECEIPT_VOUCHER',
      'EMAIL_THREAD',
      'MANUAL_SUMMARY',
      'API'
    )
  );

alter table public.ttgdtx_tuition_import_batches
  drop constraint if exists ttgdtx_import_batch_pii_level_valid;

alter table public.ttgdtx_tuition_import_batches
  add constraint ttgdtx_import_batch_pii_level_valid check (
    pii_level in ('NONE', 'PERSONAL', 'BANK', 'HIGH')
  );

alter table public.ttgdtx_tuition_import_batches
  drop constraint if exists ttgdtx_import_batch_extraction_status_valid;

alter table public.ttgdtx_tuition_import_batches
  add constraint ttgdtx_import_batch_extraction_status_valid check (
    extraction_status in (
      'FILE_ONLY',
      'EXTRACTED',
      'OCR_REQUIRED',
      'MANUAL_REVIEWED'
    )
  );

alter table public.ttgdtx_tuition_import_batches
  drop constraint if exists ttgdtx_import_section_status_valid;

alter table public.ttgdtx_tuition_import_batches
  add constraint ttgdtx_import_section_status_valid check (
    section_detection_status in ('NOT_STARTED', 'DETECTED', 'NEEDS_REVIEW', 'APPROVED')
  );

alter table public.ttgdtx_tuition_import_batches
  drop constraint if exists ttgdtx_import_redaction_status_valid;

alter table public.ttgdtx_tuition_import_batches
  add constraint ttgdtx_import_redaction_status_valid check (
    redaction_status in ('NOT_STARTED', 'MASKED', 'NEEDS_REVIEW', 'APPROVED')
  );

alter table public.ttgdtx_tuition_import_batches
  drop constraint if exists ttgdtx_import_duplicate_fingerprint_status_valid;

alter table public.ttgdtx_tuition_import_batches
  add constraint ttgdtx_import_duplicate_fingerprint_status_valid check (
    duplicate_fingerprint_status in ('NOT_STARTED', 'CHECKED', 'HAS_DUPLICATE', 'APPROVED')
  );

create index if not exists idx_ttgdtx_import_batches_source_document
on public.ttgdtx_tuition_import_batches(source_document_id)
where source_document_id is not null and record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_import_batches_real_data_status
on public.ttgdtx_tuition_import_batches(
  admission_segment_id,
  pii_level,
  extraction_status,
  section_detection_status,
  redaction_status,
  duplicate_fingerprint_status
)
where record_status = 'ACTIVE';

alter table public.ttgdtx_tuition_import_staging_rows
  add column if not exists section_code text,
  add column if not exists section_type text,
  add column if not exists source_row_kind text,
  add column if not exists sensitive_field_flags text[] not null default '{}',
  add column if not exists masked_payload jsonb not null default '{}'::jsonb,
  add column if not exists transaction_fingerprint text;

alter table public.ttgdtx_tuition_import_staging_rows
  drop constraint if exists ttgdtx_import_row_type_valid;

alter table public.ttgdtx_tuition_import_staging_rows
  add constraint ttgdtx_import_row_type_valid check (
    row_type in (
      'BATCH_SUMMARY',
      'CLASS_POLICY',
      'STUDENT_RECEIVABLE',
      'PAYMENT_TRANSACTION',
      'BANK_RECEIPT_TRANSACTION',
      'COLLECTION_REQUEST',
      'COLLECTION_INVOICE',
      'RECEIPT_VOUCHER',
      'ACCOUNT_CONTROL_NOTICE',
      'PARTNER_ACCEPTANCE',
      'PARTNER_INVOICE',
      'ACCEPTANCE_SUMMARY',
      'PARTNER_PAYABLE',
      'CONTRACT_APPENDIX',
      'COLLATERAL_RELEASE',
      'VOUCHER_TEMPLATE',
      'TOTAL_ROW',
      'IGNORED_SOURCE_ROW',
      'ISSUE_SAMPLE',
      'UNKNOWN'
    )
  );

alter table public.ttgdtx_tuition_import_staging_rows
  drop constraint if exists ttgdtx_import_section_type_valid;

alter table public.ttgdtx_tuition_import_staging_rows
  add constraint ttgdtx_import_section_type_valid check (
    section_type is null
    or section_type in (
      'POLICY',
      'STUDENT_COLLECTION',
      'COLLECTION_REQUEST',
      'ACCOUNT_CONTROL',
      'BANK_RECEIPT',
      'CONTRACT',
      'APPENDIX',
      'ACCEPTANCE',
      'COLLATERAL',
      'INVOICE',
      'TOTAL',
      'OTHER'
    )
  );

create index if not exists idx_ttgdtx_import_rows_section
on public.ttgdtx_tuition_import_staging_rows(batch_id, section_type, row_type, row_status)
where record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_import_rows_transaction_fingerprint
on public.ttgdtx_tuition_import_staging_rows(transaction_fingerprint)
where transaction_fingerprint is not null and record_status = 'ACTIVE';

create or replace view public.ttgdtx_p2_19_real_data_evidence_status as
select
  d.id as source_document_id,
  d.source_code,
  d.source_title,
  d.source_type,
  d.document_scope,
  d.evidence_type,
  d.pii_level,
  d.extraction_status,
  d.drive_file_id,
  d.source_folder_id,
  d.confidentiality,
  d.document_status,
  d.control_status,
  count(c.id)::int as control_check_count,
  count(c.id) filter (
    where c.check_status in ('FAIL', 'NOT_CHECKED')
      and c.severity in ('ERROR', 'CRITICAL')
  )::int as blocking_check_count,
  max(c.updated_at) as latest_check_at
from public.ttgdtx_source_documents d
left join public.ttgdtx_source_control_checks c
  on c.source_document_id = d.id
  and c.record_status = 'ACTIVE'
where d.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_source_control(d.admission_segment_id)
group by
  d.id,
  d.source_code,
  d.source_title,
  d.source_type,
  d.document_scope,
  d.evidence_type,
  d.pii_level,
  d.extraction_status,
  d.drive_file_id,
  d.source_folder_id,
  d.confidentiality,
  d.document_status,
  d.control_status;

grant select on public.ttgdtx_p2_19_real_data_evidence_status to authenticated;

do $$
begin
  raise notice 'HEU_STEP110_CHECKPOINT_02_SCHEMA_AND_P2_19_STATUS_VIEW_READY';
end $$;

create or replace view public.ttgdtx_source_document_status
with (security_invoker = true)
as
select
  -- Keep the Step98 column order stable; append P2-19 columns at the end.
  d.id,
  d.admission_segment_id,
  s.segment_code,
  s.segment_name,
  d.source_code,
  d.source_title,
  d.source_type,
  d.document_scope,
  d.related_step_code,
  d.related_module_code,
  d.source_path_or_url,
  d.file_name,
  d.version_label,
  d.owner_department,
  d.checker_role,
  d.approver_role,
  d.confidentiality,
  d.required_for_go_live,
  d.effective_from,
  d.effective_to,
  d.last_seen_at,
  d.checksum_note,
  d.source_note,
  d.document_status,
  d.control_status,
  d.updated_at,
  array_remove(array[
    case
      when d.required_for_go_live
        and d.document_status not in ('CHECKED', 'APPROVED')
        then 'SOURCE_NOT_APPROVED'
    end,
    case
      when position(':' in d.source_path_or_url) = 2
        and substring(d.source_path_or_url from 3 for 1) = chr(92)
        then 'LOCAL_PATH_NEEDS_PRODUCTION_LINK'
    end,
    case when d.document_status = 'NEEDS_FIX' then 'DOCUMENT_NEEDS_FIX' end,
    case when d.checker_role is null or length(trim(d.checker_role)) = 0 then 'MISSING_CHECKER' end,
    case when d.approver_role is null or length(trim(d.approver_role)) = 0 then 'MISSING_APPROVER' end,
    case
      when d.pii_level in ('BANK', 'HIGH')
        and d.extraction_status not in ('MANUAL_REVIEWED')
        then 'SENSITIVE_EVIDENCE_REVIEW_REQUIRED'
    end,
    case
      when d.evidence_type in ('ACCEPTANCE_MINUTES', 'ACCEPTANCE_FOLDER', 'PARTNER_INVOICE', 'COLLECTION_INVOICE')
        and d.source_path_or_url is null
        then 'EVIDENCE_LINK_MISSING'
    end
  ], null) as control_flags,
  case
    when d.document_status = 'ARCHIVED' then 'ARCHIVED'
    when d.document_status = 'NEEDS_FIX' then 'NEEDS_FIX'
    when d.required_for_go_live and d.document_status not in ('CHECKED', 'APPROVED') then 'WAITING_CHECK'
    when d.pii_level in ('BANK', 'HIGH')
      and d.extraction_status not in ('MANUAL_REVIEWED')
      then 'NEEDS_REVIEW'
    when position(':' in d.source_path_or_url) = 2
      and substring(d.source_path_or_url from 3 for 1) = chr(92)
      then 'READY_BUT_LOCAL_PATH'
    else 'READY'
  end as readiness_status,
  d.drive_file_id,
  d.source_folder_id,
  d.evidence_type,
  d.pii_level,
  d.extraction_status,
  d.evidence_hash,
  d.manual_reviewed_at
from public.ttgdtx_source_documents d
join public.admission_segments s on s.id = d.admission_segment_id
where d.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_source_control(d.admission_segment_id);

grant select on public.ttgdtx_source_document_status to authenticated;

comment on column public.ttgdtx_source_documents.pii_level is
  'Sensitivity marker for source evidence. HIGH means student or bank data must be masked before UAT/import.';
comment on column public.ttgdtx_source_documents.extraction_status is
  'FILE_ONLY, EXTRACTED, OCR_REQUIRED or MANUAL_REVIEWED extraction/readback status.';
comment on column public.ttgdtx_tuition_import_staging_rows.masked_payload is
  'Redacted payload for UI/review. Do not put raw student or bank fields here.';
comment on column public.ttgdtx_tuition_import_staging_rows.transaction_fingerprint is
  'Normalized non-secret fingerprint used to detect duplicate bank receipt lines.';

do $$
begin
  raise notice 'HEU_STEP110_CHECKPOINT_03_SOURCE_STATUS_VIEW_READY';
end $$;

with segment as (
  select id
  from public.admission_segments
  where segment_code = 'TC9_TTGDTX_LINKED'
  limit 1
)
insert into public.ttgdtx_source_documents (
  admission_segment_id,
  source_code,
  source_title,
  source_type,
  document_scope,
  related_step_code,
  related_module_code,
  source_path_or_url,
  file_name,
  version_label,
  owner_department,
  checker_role,
  approver_role,
  confidentiality,
  required_for_go_live,
  source_note,
  document_status,
  control_status,
  drive_file_id,
  source_folder_id,
  evidence_type,
  pii_level,
  extraction_status
)
select
  segment.id,
  'P2_19_PHU_XUYEN_SOURCE_PACK',
  'Phu Xuyen K23/K24 real-data source pack - metadata only',
  'DRIVE_FOLDER',
  'EVIDENCE',
  'P2-19',
  'M08_FINANCE_ACCOUNTING',
  'https://drive.google.com/drive/folders/1FY4Bd0psV-t6Ab_mks7qxztz6xGk_FLU',
  null,
  '2026-06-25-read-only-fit',
  'IT_DATA + KHTC + PHAP_CHE',
  'IT_DATA',
  'BGH',
  'SECRET',
  true,
  'Metadata only. Source pack contains high-sensitivity student/bank data; do not import or copy raw values before anonymized UAT approval.',
  'SUBMITTED',
  'DAT_TAM_THOI',
  null,
  '1FY4Bd0psV-t6Ab_mks7qxztz6xGk_FLU',
  'SOURCE_PACK',
  'HIGH',
  'MANUAL_REVIEWED'
from segment
on conflict (source_code) do update set
  source_title = excluded.source_title,
  source_type = excluded.source_type,
  document_scope = excluded.document_scope,
  related_step_code = excluded.related_step_code,
  related_module_code = excluded.related_module_code,
  source_path_or_url = excluded.source_path_or_url,
  version_label = excluded.version_label,
  owner_department = excluded.owner_department,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  confidentiality = excluded.confidentiality,
  required_for_go_live = excluded.required_for_go_live,
  source_note = excluded.source_note,
  document_status = excluded.document_status,
  control_status = excluded.control_status,
  source_folder_id = excluded.source_folder_id,
  evidence_type = excluded.evidence_type,
  pii_level = excluded.pii_level,
  extraction_status = excluded.extraction_status,
  updated_at = now();

do $$
begin
  raise notice 'HEU_STEP110_CHECKPOINT_04_SOURCE_PACK_SEEDED';
end $$;

with segment as (
  select id
  from public.admission_segments
  where segment_code = 'TC9_TTGDTX_LINKED'
  limit 1
),
source_docs as (
  select *
  from (
    values
      (
        'P2_19_ACCOUNT_FREEZE_LAI_CHAU_NOTICE',
        'TTGDTX tuition account freeze notice - Lai Chau classes',
        'EMAIL_THREAD',
        'ACCOUNT_CONTROL',
        'M08_FINANCE_ACCOUNTING',
        'gmail:thread/199e619aa36a5bf2',
        null::text,
        '2025-10-15-manual-review',
        'KHTC + CTHSSV',
        'IT_DATA',
        'BGH',
        'SECRET',
        true,
        'Metadata only. Notice describes planned tuition-account freeze by class/cohort/term and must be converted into a controlled bank-account workflow before any real operation.',
        'SUBMITTED',
        'DAT_TAM_THOI',
        null::text,
        null::text,
        'ACCOUNT_FREEZE_NOTICE',
        'HIGH',
        'MANUAL_REVIEWED'
      ),
      (
        'P2_19_TUITION_ACCOUNT_COMMUNICATION_NOTICE',
        'TTGDTX tuition account communication notice - special collection account',
        'EMAIL_THREAD',
        'ACCOUNT_CONTROL',
        'M08_FINANCE_ACCOUNTING',
        'gmail:thread/19aba1f5ca636426',
        null::text,
        '2025-11-25-manual-review',
        'KHTC + CTHSSV',
        'IT_DATA',
        'BGH',
        'SECRET',
        true,
        'Metadata only. Thread and attachment describe parent/student communication, locked outgoing transactions and backup communication needs for centers without direct class groups.',
        'SUBMITTED',
        'DAT_TAM_THOI',
        null::text,
        null::text,
        'ACCOUNT_FREEZE_NOTICE',
        'HIGH',
        'MANUAL_REVIEWED'
      ),
      (
        'P2_19_BBNT_HDLK_CENTER_FOLDER',
        'BBNT and HDLK linked-center Drive folder - K20 to K25 evidence pack',
        'DRIVE_FOLDER',
        'EVIDENCE',
        'M08_FINANCE_ACCOUNTING',
        'https://drive.google.com/drive/folders/1Hb8aBa9KsKtSRrzuiG7nQu_jkh62SL6Y',
        null::text,
        '2026-06-25-drive-metadata-review',
        'KHTC + PHAP_CHE',
        'IT_DATA',
        'BGH',
        'SECRET',
        true,
        'Shared folder contains separate BBNT and HDLK branches. The app must keep acceptance evidence separate from legal-contract evidence even when Drive stores them under one shared pack.',
        'SUBMITTED',
        'DAT_TAM_THOI',
        null::text,
        '1Hb8aBa9KsKtSRrzuiG7nQu_jkh62SL6Y',
        'ACCEPTANCE_FOLDER',
        'HIGH',
        'MANUAL_REVIEWED'
      ),
      (
        'P2_19_BBNT_PHU_XUYEN_K24_HK1_DOCX',
        'BBNT Phu Xuyen K24 HK1 sample - formula and payout evidence',
        'DOCX_ACCEPTANCE',
        'ACCEPTANCE',
        'M08_FINANCE_ACCOUNTING',
        'https://docs.google.com/document/d/1jDOSvNqkWewrdQx08ngIXTgIHA3qg2wE/edit',
        '3. BBNT Phu Xuyen - K24 HK1.docx',
        '2026-06-25-read-only-fit',
        'KHTC + TTGDTX_OWNER',
        'IT_DATA',
        'BGH',
        'SECRET',
        true,
        'Metadata only. Sample proves BBNT needs contract reference, center, cohort, term, class counts, formula, invoice requirement and signed-sealed evidence before payout. Do not store raw bank/account fields in repo.',
        'SUBMITTED',
        'DAT_TAM_THOI',
        '1jDOSvNqkWewrdQx08ngIXTgIHA3qg2wE',
        '1CvqB2k8ftuvEhdzwhZs8HCS3ncYmIBSL',
        'ACCEPTANCE_MINUTES',
        'BANK',
        'MANUAL_REVIEWED'
      ),
      (
        'P2_19_BANK_COLLATERAL_RELEASE_RULE',
        'Bank credit and collateral contracts - giai chap control rule',
        'BANK_CONTRACT',
        'COLLATERAL_RELEASE',
        'M08_FINANCE_ACCOUNTING',
        'gmail:thread/19928e8acbf01847',
        null::text,
        '2025-09-08-manual-review',
        'KHTC + PHAP_CHE',
        'IT_DATA',
        'BGH',
        'SECRET',
        true,
        'Metadata only. Credit/collateral attachments contain high-sensitivity legal, asset and personal data. Giai chap must be modeled as a separate legal-finance release workflow after obligations and handover evidence are complete.',
        'SUBMITTED',
        'DAT_TAM_THOI',
        null::text,
        null::text,
        'COLLATERAL_CONTRACT',
        'HIGH',
        'MANUAL_REVIEWED'
      )
  ) as v(
    source_code,
    source_title,
    source_type,
    document_scope,
    related_module_code,
    source_path_or_url,
    file_name,
    version_label,
    owner_department,
    checker_role,
    approver_role,
    confidentiality,
    required_for_go_live,
    source_note,
    document_status,
    control_status,
    drive_file_id,
    source_folder_id,
    evidence_type,
    pii_level,
    extraction_status
  )
)
insert into public.ttgdtx_source_documents (
  admission_segment_id,
  source_code,
  source_title,
  source_type,
  document_scope,
  related_step_code,
  related_module_code,
  source_path_or_url,
  file_name,
  version_label,
  owner_department,
  checker_role,
  approver_role,
  confidentiality,
  required_for_go_live,
  source_note,
  document_status,
  control_status,
  drive_file_id,
  source_folder_id,
  evidence_type,
  pii_level,
  extraction_status
)
select
  segment.id,
  source_docs.source_code,
  source_docs.source_title,
  source_docs.source_type,
  source_docs.document_scope,
  'P2-19',
  source_docs.related_module_code,
  source_docs.source_path_or_url,
  source_docs.file_name,
  source_docs.version_label,
  source_docs.owner_department,
  source_docs.checker_role,
  source_docs.approver_role,
  source_docs.confidentiality,
  source_docs.required_for_go_live,
  source_docs.source_note,
  source_docs.document_status,
  source_docs.control_status,
  source_docs.drive_file_id,
  source_docs.source_folder_id,
  source_docs.evidence_type,
  source_docs.pii_level,
  source_docs.extraction_status
from segment
cross join source_docs
on conflict (source_code) do update set
  source_title = excluded.source_title,
  source_type = excluded.source_type,
  document_scope = excluded.document_scope,
  related_step_code = excluded.related_step_code,
  related_module_code = excluded.related_module_code,
  source_path_or_url = excluded.source_path_or_url,
  file_name = excluded.file_name,
  version_label = excluded.version_label,
  owner_department = excluded.owner_department,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  confidentiality = excluded.confidentiality,
  required_for_go_live = excluded.required_for_go_live,
  source_note = excluded.source_note,
  document_status = excluded.document_status,
  control_status = excluded.control_status,
  drive_file_id = excluded.drive_file_id,
  source_folder_id = excluded.source_folder_id,
  evidence_type = excluded.evidence_type,
  pii_level = excluded.pii_level,
  extraction_status = excluded.extraction_status,
  updated_at = now();

do $$
begin
  raise notice 'HEU_STEP110_CHECKPOINT_05_EVIDENCE_SOURCES_SEEDED';
end $$;

do $$
begin
  raise notice 'HEU_STEP110_CHECKPOINT_05B_PREPARE_CONTROL_CHECK_TEMP_SEED';
end $$;

create temp table ttgdtx_p2_19_control_check_seed (
  check_code text primary key,
  check_name text not null,
  check_group text not null,
  severity text not null,
  expected_control text not null,
  current_observation text not null,
  fix_owner text not null,
  fix_action text not null,
  check_status text not null
) on commit drop;

with checks as (
  select *
  from (
    values
      (
        'P2_19_NO_RAW_PII_REPO',
        'No raw PII or bank data in repo/log/chat',
        'PRIVACY',
        'CRITICAL',
        'Real student, DOB, account, CIF and transaction account fields are masked or excluded from repo files, logs and chat.',
        'Phu Xuyen source pack contains high-sensitivity data. Only metadata and design rules are recorded in repo.',
        'IT_DATA + AUDIT',
        'Create anonymized UAT pack and verify logs/UI before any real import.',
        'FAIL'
      ),
      (
        'P2_19_MULTI_SECTION_EXCEL',
        'Multi-section workbook staging required',
        'IMPORT',
        'ERROR',
        'Policy, student collection, collection-request and total rows are separated before posting.',
        'Observed workbook shape mixes several table sections in one source pack.',
        'KHTC + IT_DATA',
        'Implement section detection and owner review before ledger posting.',
        'FAIL'
      ),
      (
        'P2_19_BANK_PDF_BATCH_FINGERPRINT',
        'Bank PDF batch fingerprint required',
        'PAYMENT',
        'ERROR',
        'Each bank receipt line has a non-secret duplicate fingerprint before receipt creation.',
        'Observed bank PDFs can contain many transaction records in one file.',
        'KHTC + AUDIT',
        'Parse one PDF into many staged lines and check duplicate fingerprints.',
        'FAIL'
      ),
      (
        'P2_19_COLLECTION_INVOICE_POLICY',
        'Collection invoice or receipt policy is required',
        'PAYMENT',
        'ERROR',
        'Each tuition collection resolves invoice_required, invoice_issuer, invoice_status, evidence_url and authorized waiver when invoice is not required.',
        'User clarified that thu tien may require invoice/chung-tu control; the app must not treat receipt as complete without the invoice decision.',
        'KHTC + PHAP_CHE + IT_DATA',
        'Add collection invoice/receipt policy matrix and status gate to P2-10 before real UAT.',
        'FAIL'
      ),
      (
        'P2_19_PARTNER_INVOICE_BEFORE_PAYOUT',
        'Partner invoice evidence before payment request and payout',
        'EVIDENCE',
        'CRITICAL',
        'Payment request and payout require partner invoice evidence when required by the accepted-period dossier.',
        'BBNT evidence shows partner payment depends on signed acceptance evidence and a valid financial invoice; the gate must separate partner invoice from collection invoice.',
        'KHTC + PHAP_CHE + BGH',
        'Gate P2-15 and P2-17 by partner invoice evidence together with BBNT and accepted student-period evidence.',
        'FAIL'
      ),
      (
        'P2_19_CONTRACT_APPENDIX_PAYMENT_PROFILE',
        'Contract appendix controls payment profile',
        'CONTRACT',
        'ERROR',
        'Appendix effective dates and payment-profile versions are checked before payout.',
        'Observed appendix pattern can amend partner/payment information.',
        'PHAP_CHE + KHTC',
        'Add appendix/payment profile version review before P2-15 and P2-17.',
        'FAIL'
      ),
      (
        'P2_19_ACCEPTANCE_BEFORE_PAYOUT',
        'Acceptance evidence before payout',
        'EVIDENCE',
        'CRITICAL',
        'Payment request and payout require acceptance/minutes, finalized student list and invoice evidence.',
        'Observed contract terms require payment dossier evidence before partner payment.',
        'KHTC + PHAP_CHE + BGH',
        'Gate payment request and payout by accepted-period evidence.',
        'FAIL'
      ),
      (
        'P2_19_ACCOUNT_FREEZE_WORKFLOW',
        'Tuition account freeze workflow state is required',
        'WORKFLOW',
        'ERROR',
        'Each tuition account control event has planned date, bank, affected class/cohort/term, requester, approver, bank confirmation, freeze state and release state.',
        'Observed finance notices describe planned account freeze/locked debit behavior, but the app has no explicit account-control workflow state yet.',
        'KHTC + IT_DATA',
        'Add account-control event model before any real freeze/release tracking in TTGDTX finance operations.',
        'FAIL'
      ),
      (
        'P2_19_ACCOUNT_CONTROL_COMMUNICATION_ACK',
        'Account-control communication acknowledgement required',
        'EVIDENCE',
        'ERROR',
        'Parent/student/center/GVCN communication evidence and backup plan are attached before account freeze is treated as operationally ready.',
        'Observed communication thread requires CTHSSV and center/class-channel coordination, including a gap where one center has no direct group.',
        'KHTC + CTHSSV + TTGDTX_OWNER',
        'Add communication evidence checklist and exception owner before freeze execution.',
        'FAIL'
      ),
      (
        'P2_19_ACCOUNT_RELEASE_GATE',
        'Tuition account release gate required',
        'PAYMENT',
        'CRITICAL',
        'A release/unfreeze event requires collection reconciliation complete, finance approval, bank confirmation and communication evidence.',
        'Observed freeze logic implies release must be controlled, but no final release evidence thread was identified in the read-only mailbox review.',
        'KHTC + AUDIT',
        'Add release/unfreeze state and block ad-hoc status changes without audit evidence.',
        'FAIL'
      ),
      (
        'P2_19_COLLATERAL_RELEASE_SEPARATE_WORKFLOW',
        'Collateral giai chap is separate from tuition-account release',
        'LEGAL_GATE',
        'CRITICAL',
        'Credit/collateral release requires obligation-clearance evidence, bank confirmation, security-registration release where applicable and collateral document handover evidence.',
        'Observed bank credit/collateral contracts contain high-sensitivity release conditions and must not be mixed with tuition account freeze/release.',
        'PHAP_CHE + KHTC + BGH',
        'Model collateral release as a legal-finance register with strict confidentiality and no row-level exposure outside approved roles.',
        'FAIL'
      ),
      (
        'P2_19_BBNT_HDLK_EVIDENCE_SPLIT',
        'BBNT evidence is separated from HDLK legal evidence',
        'EVIDENCE',
        'ERROR',
        'Drive packs that contain both BBNT and HDLK are indexed into separate acceptance and legal-contract evidence streams.',
        'Observed Drive folder has separate BBNT and HDLK branches under one shared pack, with BBNT organized by cohort K20-K24 and HDLK by K20-K25.',
        'KHTC + PHAP_CHE + IT_DATA',
        'Extend evidence registry UI to classify one Drive pack into separated legal and acceptance evidence cards.',
        'FAIL'
      )
  ) as v(
    check_code,
    check_name,
    check_group,
    severity,
    expected_control,
    current_observation,
    fix_owner,
    fix_action,
    check_status
  )
)
insert into pg_temp.ttgdtx_p2_19_control_check_seed (
  check_code,
  check_name,
  check_group,
  severity,
  expected_control,
  current_observation,
  fix_owner,
  fix_action,
  check_status
)
select
  checks.check_code,
  checks.check_name,
  checks.check_group,
  checks.severity,
  checks.expected_control,
  checks.current_observation,
  checks.fix_owner,
  checks.fix_action,
  checks.check_status
from checks;

do $$
begin
  raise notice 'HEU_STEP110_CHECKPOINT_05C_DISABLE_SOURCE_CHECK_TRIGGERS_FOR_METADATA_SEED';
end $$;

alter table public.ttgdtx_source_control_checks disable trigger user;

with segment as (
  select id
  from public.admission_segments
  where segment_code = 'TC9_TTGDTX_LINKED'
  limit 1
),
source_doc as (
  select d.id
  from public.ttgdtx_source_documents d
  where d.source_code = 'P2_19_PHU_XUYEN_SOURCE_PACK'
  limit 1
),
seed as (
  select *
  from pg_temp.ttgdtx_p2_19_control_check_seed
)
update public.ttgdtx_source_control_checks target
set
  admission_segment_id = segment.id,
  check_name = seed.check_name,
  related_step_code = 'P2-19',
  source_document_id = source_doc.id,
  check_group = seed.check_group,
  owner_department = seed.fix_owner,
  severity = seed.severity,
  expected_control = seed.expected_control,
  current_observation = seed.current_observation,
  fix_owner = seed.fix_owner,
  fix_action = seed.fix_action,
  evidence_url = 'docs/TTGDTX_PHU_XUYEN_REAL_DATA_FIT_NOTE_20260625.md',
  check_status = seed.check_status,
  control_status = 'CAN_SUA',
  updated_at = now()
from segment
cross join source_doc
cross join seed
where target.check_code = seed.check_code;

with segment as (
  select id
  from public.admission_segments
  where segment_code = 'TC9_TTGDTX_LINKED'
  limit 1
),
source_doc as (
  select d.id
  from public.ttgdtx_source_documents d
  where d.source_code = 'P2_19_PHU_XUYEN_SOURCE_PACK'
  limit 1
),
seed as (
  select *
  from pg_temp.ttgdtx_p2_19_control_check_seed
)
insert into public.ttgdtx_source_control_checks (
  admission_segment_id,
  check_code,
  check_name,
  related_step_code,
  source_document_id,
  check_group,
  owner_department,
  severity,
  expected_control,
  current_observation,
  fix_owner,
  fix_action,
  evidence_url,
  check_status,
  control_status
)
select
  segment.id,
  seed.check_code,
  seed.check_name,
  'P2-19',
  source_doc.id,
  seed.check_group,
  seed.fix_owner,
  seed.severity,
  seed.expected_control,
  seed.current_observation,
  seed.fix_owner,
  seed.fix_action,
  'docs/TTGDTX_PHU_XUYEN_REAL_DATA_FIT_NOTE_20260625.md',
  seed.check_status,
  'CAN_SUA'
from segment
cross join source_doc
cross join seed
where not exists (
  select 1
  from public.ttgdtx_source_control_checks existing
  where existing.check_code = seed.check_code
);

alter table public.ttgdtx_source_control_checks enable trigger user;

do $$
begin
  raise notice 'HEU_STEP110_CHECKPOINT_06_CONTROL_CHECKS_SEEDED';
end $$;

commit;
