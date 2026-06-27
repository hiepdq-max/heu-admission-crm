-- Step 102 - retired P2-13 repair script.
-- Migration candidate only. Do not run production migration from Codex/chat.
-- Do not use this file for P2-13 anymore.
-- Current P2-13 reconciliation logic is controlled by:
-- - database/step101_ttgdtx_reconciliation_p2_13.sql
-- - database/step104_ttgdtx_reconciliation_approval_p2_14.sql
--
-- Purpose:
-- - Preserve migration history.
-- - Prevent an old partner-status repair from being mistaken for a current fix.

do $$
begin
  raise notice 'Step102 retired: use the approved Step101/Step104 P2-13 reconciliation flow. No changes applied.';
end;
$$;
