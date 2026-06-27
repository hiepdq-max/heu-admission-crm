-- Debug helper for ERROR 42P01: relation "a" does not exist.
-- Run this in Supabase SQL editor if Step110 fails with relation "a".
-- It does not change data. It returns one table only.
-- V004 scans non-system schemas broadly, because relation "a" can come from
-- a trigger/function dependency rather than the Step110 file body.

with matches as (
  select
    'VIEW'::text as object_type,
    n.nspname as schema_name,
    c.relname as object_name,
    c.relkind::text as object_detail
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname not in ('pg_catalog', 'information_schema')
    and c.relkind in ('v', 'm')
    and lower(pg_get_viewdef(c.oid, true)) ~
      '\mfrom\s+"?a"?\M|\mjoin\s+"?a"?\M|\mupdate\s+"?a"?\M|\mdelete\s+from\s+"?a"?\M|\minsert\s+into\s+"?a"?\M'

  union all

  select
    'FUNCTION'::text as object_type,
    n.nspname as schema_name,
    p.proname as object_name,
    pg_get_function_identity_arguments(p.oid) as object_detail
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname not in ('pg_catalog', 'information_schema')
    and p.prokind in ('f', 'p', 'w')
    and lower(pg_get_functiondef(p.oid)) ~
      '\mfrom\s+"?a"?\M|\mjoin\s+"?a"?\M|\mupdate\s+"?a"?\M|\mdelete\s+from\s+"?a"?\M|\minsert\s+into\s+"?a"?\M'

  union all

  select
    'POLICY'::text as object_type,
    schemaname as schema_name,
    tablename || '.' || policyname as object_name,
    cmd as object_detail
  from pg_policies
  where schemaname not in ('pg_catalog', 'information_schema')
    and lower(coalesce(qual, '') || ' ' || coalesce(with_check, '')) ~
      '\mfrom\s+"?a"?\M|\mjoin\s+"?a"?\M|\mupdate\s+"?a"?\M|\mdelete\s+from\s+"?a"?\M|\minsert\s+into\s+"?a"?\M'

  union all

  select
    'TRIGGER_FUNCTION'::text as object_type,
    trigger_schema.nspname as schema_name,
    trigger_table.relname || '.' || trigger_row.tgname as object_name,
    function_schema.nspname || '.' || function_proc.proname || '(' ||
      pg_get_function_identity_arguments(function_proc.oid) || ')' as object_detail
  from pg_trigger trigger_row
  join pg_class trigger_table on trigger_table.oid = trigger_row.tgrelid
  join pg_namespace trigger_schema on trigger_schema.oid = trigger_table.relnamespace
  join pg_proc function_proc on function_proc.oid = trigger_row.tgfoid
  join pg_namespace function_schema on function_schema.oid = function_proc.pronamespace
  where not trigger_row.tgisinternal
    and trigger_schema.nspname not in ('pg_catalog', 'information_schema')
    and function_proc.prokind in ('f', 'p', 'w')
    and lower(pg_get_functiondef(function_proc.oid)) ~
      '\mfrom\s+"?a"?\M|\mjoin\s+"?a"?\M|\mupdate\s+"?a"?\M|\mdelete\s+from\s+"?a"?\M|\minsert\s+into\s+"?a"?\M'
)
select
  'HEU_FIND_RELATION_A_DEBUG_20260626_V004' as debug_marker,
  object_type,
  schema_name,
  object_name,
  object_detail
from matches

union all

select
  'HEU_FIND_RELATION_A_DEBUG_20260626_V004' as debug_marker,
  'NO_MATCH' as object_type,
  null::text as schema_name,
  'No non-system view/function/policy/trigger function contains relation A references.' as object_name,
  'If Step110 still fails, run only Step110 and note the last HEU_STEP110_CHECKPOINT notice before the error.' as object_detail
where not exists (select 1 from matches)
order by object_type, schema_name, object_name;
