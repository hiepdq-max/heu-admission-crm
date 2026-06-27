-- Preflight for Step110 / P2-19.
-- Run this before database/step110_ttgdtx_real_data_evidence_metadata_p2_19.sql.
-- It does not change data. It returns one table only.

with required_checks as (
  select
    'Step98'::text as required_step,
    'public.ttgdtx_source_documents'::text as required_object,
    to_regclass('public.ttgdtx_source_documents')::text as found_object,
    'Run Step98 before Step110.'::text as missing_action

  union all

  select
    'Step98',
    'public.ttgdtx_source_control_checks',
    to_regclass('public.ttgdtx_source_control_checks')::text,
    'Run Step98 before Step110.'

  union all

  select
    'Step98',
    'public.can_read_ttgdtx_source_control(uuid)',
    to_regprocedure('public.can_read_ttgdtx_source_control(uuid)')::text,
    'Run Step98 before Step110.'

  union all

  select
    'Step98',
    'public.can_manage_ttgdtx_source_control()',
    to_regprocedure('public.can_manage_ttgdtx_source_control()')::text,
    'Run Step98 before Step110.'

  union all

  select
    'Step92',
    'public.ttgdtx_tuition_import_batches',
    to_regclass('public.ttgdtx_tuition_import_batches')::text,
    'Run Step92 before Step110.'

  union all

  select
    'Step92',
    'public.ttgdtx_tuition_import_staging_rows',
    to_regclass('public.ttgdtx_tuition_import_staging_rows')::text,
    'Run Step92 before Step110.'

  union all

  select
    'Step109',
    'public.active_role_permissions',
    to_regclass('public.active_role_permissions')::text,
    'Run Step109 before Step110.'

  union all

  select
    'Base permission',
    'public.has_permission(text)',
    to_regprocedure('public.has_permission(text)')::text,
    'Run base policies/Step109 before Step110.'

  union all

  select
    'Base trigger',
    'public.set_updated_at()',
    to_regprocedure('public.set_updated_at()')::text,
    'Run base triggers.sql before Step110.'

  union all

  select
    'Base trigger',
    'public.write_audit_log()',
    to_regprocedure('public.write_audit_log()')::text,
    'Run base triggers.sql before Step110.'
)
select
  'HEU_STEP110_PREFLIGHT_20260626_V003' as check_marker,
  required_step,
  required_object,
  case when found_object is null then 'MISSING' else 'OK' end as status,
  coalesce(found_object, missing_action) as result
from required_checks
order by
  case required_step
    when 'Step92' then 1
    when 'Step98' then 2
    when 'Step109' then 3
    else 4
  end,
  required_object;
