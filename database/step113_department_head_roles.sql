-- Step 113 - P0-17 department head roles for user/profile setup.
-- File: database/step113_department_head_roles.sql
-- Purpose: add department-head roles needed by Settings manager assignment
-- without rerunning the full seed file.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Secret boundary: do not paste passwords, OTPs, invite/reset links,
-- service-role keys or raw PII into SQL comments, logs or evidence.

begin;

insert into public.roles (code, name, description)
values
  ('CTHSSV_LEAD', 'Truong phong CTHSSV', 'Manage CTHSSV users and scopes'),
  ('ACCOUNTING_LEAD', 'Ke toan truong', 'Manage accounting users and finance scopes')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('users.manage_department'),
    ('scope.manage_department'),
    ('workflow_request.read'),
    ('workflow_request.create'),
    ('workflow_request.check')
) as p(permission)
where r.code in ('CTHSSV_LEAD', 'ACCOUNTING_LEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('payments.read'),
    ('payments.verify')
) as p(permission)
where r.code = 'ACCOUNTING_LEAD'
on conflict (role_id, permission) do nothing;

commit;
