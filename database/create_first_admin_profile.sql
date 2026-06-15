-- Create the first CRM admin profile after creating a user in Supabase Auth.
-- Replace the email value before running.

insert into public.users_profile (
  id,
  email,
  full_name,
  role_id,
  department_id,
  status
)
select
  au.id,
  au.email,
  'HEU Admin',
  r.id,
  d.id,
  'ACTIVE'
from auth.users au
cross join public.roles r
cross join public.admission_departments d
where au.email = 'REPLACE_WITH_ADMIN_EMAIL'
  and r.code = 'ADMIN'
  and d.code = 'ADMISSION'
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  role_id = excluded.role_id,
  department_id = excluded.department_id,
  status = excluded.status,
  updated_at = now();
