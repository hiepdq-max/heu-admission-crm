-- File: database/step115_tchc_department_position_correction.sql
-- Purpose:
-- - Correct HEU organization naming from "To chuc nhan su" to
--   "Phong To chuc hanh chinh (TCHC)".
-- - Preserve existing user/profile/permission links where HR records already
--   exist in a local or pilot database.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order
-- approval and owner Go/No-Go sign-off.

begin;

do $$
declare
  old_department_id uuid;
  new_department_id uuid;
begin
  select id
    into old_department_id
  from public.admission_departments
  where code = 'HR'
  limit 1;

  select id
    into new_department_id
  from public.admission_departments
  where code = 'TCHC'
  limit 1;

  if old_department_id is not null and new_department_id is null then
    update public.admission_departments
    set
      code = 'TCHC',
      name = 'Phong To chuc hanh chinh (TCHC)',
      status = 'ACTIVE',
      updated_at = now()
    where id = old_department_id;
  elsif old_department_id is not null and new_department_id is not null then
    update public.users_profile
    set
      department_id = new_department_id,
      updated_at = now()
    where department_id = old_department_id;

    update public.admission_departments
    set
      name = 'Phong To chuc hanh chinh (TCHC)',
      status = 'ACTIVE',
      updated_at = now()
    where id = new_department_id;

    update public.admission_departments
    set
      code = 'HR_LEGACY',
      name = 'Legacy HR department - replaced by TCHC',
      status = 'INACTIVE',
      updated_at = now()
    where id = old_department_id
      and not exists (
        select 1
        from public.admission_departments d
        where d.code = 'HR_LEGACY'
          and d.id <> old_department_id
      );
  elsif new_department_id is not null then
    update public.admission_departments
    set
      name = 'Phong To chuc hanh chinh (TCHC)',
      status = 'ACTIVE',
      updated_at = now()
    where id = new_department_id;
  else
    insert into public.admission_departments (code, name, status)
    values ('TCHC', 'Phong To chuc hanh chinh (TCHC)', 'ACTIVE');
  end if;
end $$;

do $$
declare
  old_role_id uuid;
  new_role_id uuid;
begin
  select id into old_role_id from public.roles where code = 'HR_LEAD' limit 1;
  select id into new_role_id from public.roles where code = 'TCHC_LEAD' limit 1;

  if old_role_id is not null and new_role_id is null then
    update public.roles
    set
      code = 'TCHC_LEAD',
      name = 'Truong phong To chuc hanh chinh',
      description = 'Manage administrative organization and staffing assignments',
      updated_at = now()
    where id = old_role_id;
  elsif old_role_id is not null and new_role_id is not null then
    insert into public.role_permissions (role_id, permission)
    select new_role_id, permission
    from public.role_permissions
    where role_id = old_role_id
    on conflict (role_id, permission) do nothing;

    update public.users_profile
    set role_id = new_role_id, updated_at = now()
    where role_id = old_role_id;

    delete from public.roles
    where id = old_role_id;
  else
    insert into public.roles (code, name, description)
    values (
      'TCHC_LEAD',
      'Truong phong To chuc hanh chinh',
      'Manage administrative organization and staffing assignments'
    )
    on conflict (code) do update set
      name = excluded.name,
      description = excluded.description,
      updated_at = now();
  end if;

  select id into old_role_id from public.roles where code = 'HR' limit 1;
  select id into new_role_id from public.roles where code = 'TCHC' limit 1;

  if old_role_id is not null and new_role_id is null then
    update public.roles
    set
      code = 'TCHC',
      name = 'Nhan su To chuc hanh chinh',
      description = 'Operate administrative organization workflows in assigned scope',
      updated_at = now()
    where id = old_role_id;
  elsif old_role_id is not null and new_role_id is not null then
    insert into public.role_permissions (role_id, permission)
    select new_role_id, permission
    from public.role_permissions
    where role_id = old_role_id
    on conflict (role_id, permission) do nothing;

    update public.users_profile
    set role_id = new_role_id, updated_at = now()
    where role_id = old_role_id;

    delete from public.roles
    where id = old_role_id;
  else
    insert into public.roles (code, name, description)
    values (
      'TCHC',
      'Nhan su To chuc hanh chinh',
      'Operate administrative organization workflows in assigned scope'
    )
    on conflict (code) do update set
      name = excluded.name,
      description = excluded.description,
      updated_at = now();
  end if;
end $$;

update public.heu_org_positions
set position_code = 'TCHC_HEAD'
where position_code = 'HR_HEAD'
  and not exists (
    select 1 from public.heu_org_positions p where p.position_code = 'TCHC_HEAD'
  );

update public.heu_org_positions
set position_code = 'TCHC_01'
where position_code = 'HR_01'
  and not exists (
    select 1 from public.heu_org_positions p where p.position_code = 'TCHC_01'
  );

update public.heu_org_positions
set position_code = 'TCHC_02'
where position_code = 'HR_02'
  and not exists (
    select 1 from public.heu_org_positions p where p.position_code = 'TCHC_02'
  );

update public.heu_org_positions
set position_code = 'TCHC_03'
where position_code = 'HR_03'
  and not exists (
    select 1 from public.heu_org_positions p where p.position_code = 'TCHC_03'
  );

update public.heu_org_positions
set
  reports_to_position_code = case
    when reports_to_position_code = 'HR_HEAD' then 'TCHC_HEAD'
    else reports_to_position_code
  end,
  updated_at = now()
where reports_to_position_code = 'HR_HEAD';

update public.heu_org_positions
set
  position_name = 'Truong phong To chuc hanh chinh',
  position_group = 'TCHC',
  department_code = 'TCHC',
  default_role_code = 'TCHC_LEAD',
  reports_to_position_code = 'PHT_VAN_HANH',
  seat_order = 1000,
  required_assignment = true,
  status = 'ACTIVE',
  updated_at = now()
where position_code = 'TCHC_HEAD';

update public.heu_org_positions
set
  position_name = 'To chuc hanh chinh 01',
  position_group = 'TCHC',
  department_code = 'TCHC',
  default_role_code = 'TCHC',
  reports_to_position_code = 'TCHC_HEAD',
  seat_order = 1001,
  required_assignment = false,
  status = 'ACTIVE',
  updated_at = now()
where position_code = 'TCHC_01';

update public.heu_org_positions
set
  position_name = 'To chuc hanh chinh 02',
  position_group = 'TCHC',
  department_code = 'TCHC',
  default_role_code = 'TCHC',
  reports_to_position_code = 'TCHC_HEAD',
  seat_order = 1002,
  required_assignment = false,
  status = 'ACTIVE',
  updated_at = now()
where position_code = 'TCHC_02';

update public.heu_org_positions
set
  position_name = 'To chuc hanh chinh 03',
  position_group = 'TCHC',
  department_code = 'TCHC',
  default_role_code = 'TCHC',
  reports_to_position_code = 'TCHC_HEAD',
  seat_order = 1003,
  required_assignment = false,
  status = 'ACTIVE',
  updated_at = now()
where position_code = 'TCHC_03';

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('users.manage_department'),
    ('scope.manage_department'),
    ('reports.read_team'),
    ('workflow_request.read'),
    ('workflow_request.create'),
    ('workflow_request.check')
) as p(permission)
where r.code = 'TCHC_LEAD'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('reports.read_scope'),
    ('workflow_request.read'),
    ('workflow_request.create')
) as p(permission)
where r.code = 'TCHC'
on conflict (role_id, permission) do nothing;

insert into public.heu_position_permission_matrix (
  position_id,
  permission,
  permission_source,
  status
)
select p.id, rp.permission, 'DEFAULT_ROLE', 'ACTIVE'
from public.heu_org_positions p
join public.roles r on r.code = p.default_role_code
join public.role_permissions rp on rp.role_id = r.id
where p.position_group = 'TCHC'
on conflict (position_id, permission) do update set
  permission_source = excluded.permission_source,
  status = 'ACTIVE',
  updated_at = now();

commit;
