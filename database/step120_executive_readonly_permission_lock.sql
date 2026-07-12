-- Step 120 - Executive read-only permission lock.
-- File: database/step120_executive_readonly_permission_lock.sql
-- Purpose:
-- - Soft-revoke active write/approval/payment/raw-source permissions from
--   BGH, HIEU_TRUONG and PHO_HIEU_TRUONG.
-- - Keep the executive cockpit read-only/advisory before dashboard reliance.
-- - Align role_permissions and heu_position_permission_matrix with STD-44.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, signed migration order,
-- owner-approved reduce/revoke evidence and business Go/No-Go sign-off.
-- Secret boundary: do not paste passwords, OTPs, invite/reset links,
-- service-role keys, raw PII, CCCD, bank data or screenshots into SQL comments,
-- logs or evidence.

begin;

alter table public.role_permissions
  add column if not exists status public.record_status not null default 'ACTIVE',
  add column if not exists revoked_by uuid references public.users_profile(id),
  add column if not exists revoked_at timestamptz,
  add column if not exists note text,
  add column if not exists updated_at timestamptz not null default now();

create temporary table heu_executive_readonly_allowed_permissions (
  permission text primary key
) on commit drop;

insert into heu_executive_readonly_allowed_permissions (permission)
values
  ('audit.read'),
  ('finance_desk.read'),
  ('heu_os.search.read'),
  ('leads.read_all'),
  ('master_control.read'),
  ('permission_matrix.read'),
  ('process_ownership.read'),
  ('reports.read_all'),
  ('scope.audit'),
  ('scope.enforcement.read'),
  ('workflow_request.read')
on conflict (permission) do nothing;

update public.role_permissions rp
set
  status = 'INACTIVE',
  revoked_at = coalesce(rp.revoked_at, now()),
  note = concat_ws(
    ' | ',
    nullif(rp.note, ''),
    'EXEC-ACCESS-REVOKE-01 STD-44 executive read-only soft revoke; reversible by approved forward migration.'
  ),
  updated_at = now()
from public.roles r
where rp.role_id = r.id
  and r.code in ('BGH', 'HIEU_TRUONG', 'PHO_HIEU_TRUONG')
  and coalesce(rp.status, 'ACTIVE') = 'ACTIVE'
  and not exists (
    select 1
    from heu_executive_readonly_allowed_permissions allowed
    where allowed.permission = rp.permission
  );

update public.heu_position_permission_matrix ppm
set
  status = 'INACTIVE',
  updated_at = now()
from public.heu_org_positions p
where ppm.position_id = p.id
  and p.default_role_code in ('BGH', 'HIEU_TRUONG', 'PHO_HIEU_TRUONG')
  and coalesce(ppm.status, 'ACTIVE') = 'ACTIVE'
  and not exists (
    select 1
    from heu_executive_readonly_allowed_permissions allowed
    where allowed.permission = ppm.permission
  );

commit;
