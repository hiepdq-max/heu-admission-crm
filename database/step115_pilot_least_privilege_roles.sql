-- HEU-PILOT-ROLE-001
-- DRAFT_CONTROL: do not execute without a fresh permission snapshot, rollback
-- verification and IT_DATA/Audit approval. No password, email or activation.

begin;

insert into public.roles (code, name, description)
values
  ('PILOT_ADMISSION_HEAD', 'Truong phong tuyen sinh - pilot', 'TTGDTX 9+ admission only; no HOU, short-course or finance authority.'),
  ('PILOT_COUNSELOR', 'Tu van tuyen sinh - pilot', 'Assigned-lead pilot only; no HOU, short-course or finance authority.'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'Quan ly ke toan - pilot chi doc', 'Read/check draft only; no payment verify, posting, approval or money movement.'),
  ('PILOT_ACCOUNTING_READONLY', 'Ke toan - pilot chi doc', 'Read-only reconciliation preparation; no write, approval or money movement.')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

create temporary table _heu_pilot_allowed_permissions (
  role_code text not null,
  permission text not null,
  primary key (role_code, permission)
) on commit drop;

insert into _heu_pilot_allowed_permissions (role_code, permission)
values
  ('PILOT_ADMISSION_HEAD', 'activities.create'),
  ('PILOT_ADMISSION_HEAD', 'admission_config.read'),
  ('PILOT_ADMISSION_HEAD', 'documents.manage'),
  ('PILOT_ADMISSION_HEAD', 'evidence.check'),
  ('PILOT_ADMISSION_HEAD', 'evidence.create'),
  ('PILOT_ADMISSION_HEAD', 'evidence.read'),
  ('PILOT_ADMISSION_HEAD', 'handover.create'),
  ('PILOT_ADMISSION_HEAD', 'heu_os.search.read'),
  ('PILOT_ADMISSION_HEAD', 'leads.assign'),
  ('PILOT_ADMISSION_HEAD', 'leads.import'),
  ('PILOT_ADMISSION_HEAD', 'leads.read_all'),
  ('PILOT_ADMISSION_HEAD', 'leads.write_all'),
  ('PILOT_ADMISSION_HEAD', 'master_data.read'),
  ('PILOT_ADMISSION_HEAD', 'master_data.request_change'),
  ('PILOT_ADMISSION_HEAD', 'pipeline.manage'),
  ('PILOT_ADMISSION_HEAD', 'reports.read_scope'),
  ('PILOT_ADMISSION_HEAD', 'reports.read_team'),
  ('PILOT_ADMISSION_HEAD', 'workflow_request.check'),
  ('PILOT_ADMISSION_HEAD', 'workflow_request.create'),
  ('PILOT_ADMISSION_HEAD', 'workflow_request.read'),
  ('PILOT_COUNSELOR', 'activities.create'),
  ('PILOT_COUNSELOR', 'documents.read_assigned'),
  ('PILOT_COUNSELOR', 'evidence.create'),
  ('PILOT_COUNSELOR', 'evidence.read'),
  ('PILOT_COUNSELOR', 'heu_os.search.read'),
  ('PILOT_COUNSELOR', 'leads.read_assigned'),
  ('PILOT_COUNSELOR', 'leads.write_assigned'),
  ('PILOT_COUNSELOR', 'master_data.read'),
  ('PILOT_COUNSELOR', 'master_data.request_change'),
  ('PILOT_COUNSELOR', 'workflow_request.create'),
  ('PILOT_COUNSELOR', 'workflow_request.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'finance_desk.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'payments.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'reports.read_scope'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'reports.read_team'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'ttgdtx.collection.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'ttgdtx.contract.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'ttgdtx.department.task.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'ttgdtx.import.issue.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'ttgdtx.import.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'ttgdtx.master.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'ttgdtx.receivable.gate.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'ttgdtx.receivable.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'ttgdtx.source.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'ttgdtx.tuition.read'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'workflow_request.check'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'workflow_request.create'),
  ('PILOT_ACCOUNTING_LEAD_READONLY', 'workflow_request.read'),
  ('PILOT_ACCOUNTING_READONLY', 'finance_desk.read'),
  ('PILOT_ACCOUNTING_READONLY', 'payments.read'),
  ('PILOT_ACCOUNTING_READONLY', 'reports.read_scope'),
  ('PILOT_ACCOUNTING_READONLY', 'ttgdtx.collection.read'),
  ('PILOT_ACCOUNTING_READONLY', 'ttgdtx.contract.read'),
  ('PILOT_ACCOUNTING_READONLY', 'ttgdtx.department.task.read'),
  ('PILOT_ACCOUNTING_READONLY', 'ttgdtx.import.issue.read'),
  ('PILOT_ACCOUNTING_READONLY', 'ttgdtx.import.read'),
  ('PILOT_ACCOUNTING_READONLY', 'ttgdtx.master.read'),
  ('PILOT_ACCOUNTING_READONLY', 'ttgdtx.receivable.gate.read'),
  ('PILOT_ACCOUNTING_READONLY', 'ttgdtx.receivable.read'),
  ('PILOT_ACCOUNTING_READONLY', 'ttgdtx.source.read'),
  ('PILOT_ACCOUNTING_READONLY', 'ttgdtx.tuition.read'),
  ('PILOT_ACCOUNTING_READONLY', 'workflow_request.create'),
  ('PILOT_ACCOUNTING_READONLY', 'workflow_request.read');

insert into public.role_permissions (role_id, permission, status, note)
select r.id, a.permission, 'ACTIVE', 'HEU-PILOT-ROLE-001 explicit allowlist'
from _heu_pilot_allowed_permissions a
join public.roles r on r.code = a.role_code
on conflict (role_id, permission) do update set
  status = 'ACTIVE', revoked_by = null, revoked_at = null,
  note = excluded.note, updated_at = now();

update public.role_permissions rp
set status = 'INACTIVE', revoked_at = now(),
    note = 'HEU-PILOT-ROLE-001 outside explicit allowlist', updated_at = now()
where rp.role_id in (
  select id from public.roles where code like 'PILOT_%'
)
and rp.status = 'ACTIVE'
and not exists (
  select 1 from _heu_pilot_allowed_permissions a
  join public.roles r on r.code = a.role_code
  where r.id = rp.role_id and a.permission = rp.permission
);

create temporary table _heu_pilot_position_roles (
  position_code text primary key,
  role_code text not null
) on commit drop;

insert into _heu_pilot_position_roles (position_code, role_code)
values
  ('TUYEN_SINH_HEAD', 'PILOT_ADMISSION_HEAD'),
  ('TUYEN_SINH_01', 'PILOT_COUNSELOR'),
  ('KE_TOAN_DEPUTY', 'PILOT_ACCOUNTING_LEAD_READONLY'),
  ('KE_TOAN_01', 'PILOT_ACCOUNTING_READONLY'),
  ('KE_TOAN_02', 'PILOT_ACCOUNTING_READONLY');

update public.heu_org_positions p
set default_role_code = m.role_code,
    notes = concat_ws(' ', p.notes, 'HEU-PILOT-ROLE-001 least-privilege role.'),
    updated_at = now()
from _heu_pilot_position_roles m
where p.position_code = m.position_code;

create temporary table _heu_pilot_profile_role_before (
  user_id uuid primary key,
  position_code text not null,
  old_role_code text,
  new_role_code text not null
) on commit drop;

insert into _heu_pilot_profile_role_before (
  user_id,
  position_code,
  old_role_code,
  new_role_code
)
select u.id, p.position_code, old_role.code, m.role_code
from public.users_profile u
join public.heu_position_assignments a on a.user_id = u.id
join public.heu_org_positions p on p.id = a.position_id
join _heu_pilot_position_roles m on m.position_code = p.position_code
left join public.roles old_role on old_role.id = u.role_id
where a.status = 'ACTIVE'
  and a.assignment_status = 'ACTIVE_ASSIGNED'
  and u.status = 'INACTIVE';

update public.users_profile u
set role_id = r.id, updated_at = now()
from public.heu_position_assignments a
join public.heu_org_positions p on p.id = a.position_id
join _heu_pilot_position_roles m on m.position_code = p.position_code
join public.roles r on r.code = m.role_code
where a.user_id = u.id
  and a.status = 'ACTIVE'
  and a.assignment_status = 'ACTIVE_ASSIGNED'
  and u.status = 'INACTIVE';

insert into public.audit_logs (
  user_id,
  action,
  entity_type,
  entity_id,
  old_value,
  new_value,
  note
)
select
  actor.user_id,
  'HEU_PILOT_ROLE_LEAST_PRIVILEGE_STAGED',
  'users_profile',
  before.user_id,
  jsonb_build_object('role_code', before.old_role_code),
  jsonb_build_object(
    'role_code', before.new_role_code,
    'position_code', before.position_code,
    'profile_status', 'INACTIVE',
    'auth_banned', true
  ),
  'HEU-PILOT-ROLE-001'
from _heu_pilot_profile_role_before before
cross join lateral (
  select a.user_id
  from public.heu_position_assignments a
  join public.heu_org_positions p on p.id = a.position_id
  where p.position_code = 'HEU_SYSTEM_ADMIN'
    and a.status = 'ACTIVE'
    and a.assignment_status = 'ACTIVE_ASSIGNED'
  limit 1
) actor
where not exists (
  select 1 from public.audit_logs existing
  where existing.action = 'HEU_PILOT_ROLE_LEAST_PRIVILEGE_STAGED'
    and existing.entity_id = before.user_id
    and existing.note = 'HEU-PILOT-ROLE-001'
);

insert into public.heu_position_permission_matrix (
  position_id, permission, permission_source, status
)
select p.id, rp.permission, 'PILOT_ROLE', 'ACTIVE'
from _heu_pilot_position_roles m
join public.heu_org_positions p on p.position_code = m.position_code
join public.roles r on r.code = m.role_code
join public.role_permissions rp on rp.role_id = r.id and rp.status = 'ACTIVE'
on conflict (position_id, permission) do update set
  permission_source = 'PILOT_ROLE', status = 'ACTIVE', updated_at = now();

update public.heu_position_permission_matrix ppm
set status = 'INACTIVE', permission_source = 'PILOT_ROLE_REVOKED', updated_at = now()
where ppm.position_id in (
  select p.id from _heu_pilot_position_roles m
  join public.heu_org_positions p on p.position_code = m.position_code
)
and ppm.status = 'ACTIVE'
and not exists (
  select 1 from _heu_pilot_position_roles m
  join public.heu_org_positions p on p.position_code = m.position_code
  join public.roles r on r.code = m.role_code
  join public.role_permissions rp on rp.role_id = r.id and rp.status = 'ACTIVE'
  where p.id = ppm.position_id and rp.permission = ppm.permission
);

commit;

-- Soft rollback uses the controlled pre-apply snapshot. Restore prior profile
-- roles, position default roles and position-permission statuses; set all
-- PILOT_* role_permissions INACTIVE. Keep Auth BANNED and profiles INACTIVE.
