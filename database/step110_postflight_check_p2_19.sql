-- Postflight check for Step110 / P2-19.
-- Run this after database/step110_ttgdtx_real_data_evidence_metadata_p2_19.sql.
-- It does not change data.

select
  'HEU_STEP110_POSTFLIGHT_20260626_V001' as check_marker,
  to_regclass('public.ttgdtx_p2_19_real_data_evidence_status') as p2_19_status_view,
  to_regclass('public.ttgdtx_source_document_status') as source_status_view,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ttgdtx_source_documents'
      and column_name = 'drive_file_id'
  ) as has_drive_file_id,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ttgdtx_source_documents'
      and column_name = 'evidence_type'
  ) as has_evidence_type,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ttgdtx_source_documents'
      and column_name = 'pii_level'
  ) as has_pii_level,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ttgdtx_source_documents'
      and column_name = 'manual_reviewed_at'
  ) as has_manual_reviewed_at;

select
  'HEU_STEP110_POSTFLIGHT_ROWS_20260626_V001' as check_marker,
  count(*) filter (where source_code like 'P2_19_%') as p2_19_source_count
from public.ttgdtx_source_documents
where record_status = 'ACTIVE';

select
  'HEU_STEP110_POSTFLIGHT_CHECKS_20260626_V001' as check_marker,
  count(*) filter (where check_code like 'P2_19_%') as p2_19_check_count,
  count(*) filter (
    where check_code in (
      'P2_19_ACCEPTANCE_BEFORE_PAYOUT',
      'P2_19_PARTNER_INVOICE_BEFORE_PAYOUT'
    )
  ) as payout_gate_check_count
from public.ttgdtx_source_control_checks
where record_status = 'ACTIVE';

select
  'HEU_STEP110_POSTFLIGHT_TRIGGERS_20260626_V001' as check_marker,
  trigger_row.tgname as trigger_name,
  case trigger_row.tgenabled
    when 'O' then 'ENABLED'
    when 'D' then 'DISABLED'
    when 'R' then 'REPLICA'
    when 'A' then 'ALWAYS'
    else trigger_row.tgenabled::text
  end as trigger_status
from pg_trigger trigger_row
join pg_class trigger_table on trigger_table.oid = trigger_row.tgrelid
join pg_namespace trigger_schema on trigger_schema.oid = trigger_table.relnamespace
where trigger_schema.nspname = 'public'
  and trigger_table.relname = 'ttgdtx_source_control_checks'
  and not trigger_row.tgisinternal
order by trigger_row.tgname;
