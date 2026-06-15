-- Step 35C - Protect sensitive HOU finance policy rows.
-- Run this after step35a_hou_foundation.sql if step35a was already executed.
--
-- Goal:
-- - Normal authenticated users can read non-sensitive HOU policies, such as
--   recruitment support conditions.
-- - The HOU/HEU training cooperation share is visible only to:
--   ADMIN, BGH, ADMISSION_HEAD.

drop policy if exists "hou_financial_policies_select_authenticated"
on public.hou_financial_policies;

create policy "hou_financial_policies_select_authenticated"
on public.hou_financial_policies for select
to authenticated
using (
  policy_type <> 'TRAINING_COOP_SHARE'
  or public.current_user_role_code() in ('ADMIN', 'BGH', 'ADMISSION_HEAD')
);

-- Keep write access restricted to Admin only.
drop policy if exists "hou_financial_policies_admin_write"
on public.hou_financial_policies;

create policy "hou_financial_policies_admin_write"
on public.hou_financial_policies for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
