-- Step 103 - retired P2-13 reconciliation repair script.
-- Migration candidate only. Do not run production migration from Codex/chat.
-- Do not run this file as a current P2-13 fix.
-- Current P2-13 reconciliation logic is controlled by:
-- - database/step101_ttgdtx_reconciliation_p2_13.sql
-- - database/step104_ttgdtx_reconciliation_approval_p2_14.sql
--
-- Reason:
-- - Earlier repair versions targeted draft reconciliation columns.
-- - Running an old repair after Step101 could overwrite invoice-control logic.
-- - This file is intentionally no-op to preserve migration history safely.

do $$
begin
  raise notice 'Step103 retired: Step101 owns create_ttgdtx_reconciliation_batch with invoice-control columns. No changes applied.';
end;
$$;
