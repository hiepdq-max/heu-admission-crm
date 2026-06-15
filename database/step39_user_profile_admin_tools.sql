-- Step 39 - Admin tools for linking manually-created Supabase Auth users.
-- Use this when users are created manually in Authentication -> Users and
-- need to be linked to CRM users_profile without exposing service role key.

create or replace function public.upsert_user_profile_from_auth(
  target_email text,
  target_full_name text,
  target_phone text default null,
  target_role_id uuid default null,
  target_department_id uuid default null,
  target_manager_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  auth_user_id uuid;
  normalized_email text;
begin
  if not public.is_admin() then
    raise exception 'Only ADMIN can link Auth users to CRM profiles';
  end if;

  normalized_email := lower(trim(target_email));

  if normalized_email is null or normalized_email = '' then
    raise exception 'Missing email';
  end if;

  if target_full_name is null or trim(target_full_name) = '' then
    raise exception 'Missing full name';
  end if;

  select u.id
  into auth_user_id
  from auth.users u
  where lower(u.email) = normalized_email
  limit 1;

  if auth_user_id is null then
    raise exception 'Auth user not found for email %', normalized_email;
  end if;

  if target_manager_id is not null and target_manager_id = auth_user_id then
    raise exception 'Manager cannot be the same as target user';
  end if;

  insert into public.users_profile (
    id,
    email,
    full_name,
    phone,
    role_id,
    department_id,
    manager_id,
    status
  )
  values (
    auth_user_id,
    normalized_email,
    trim(target_full_name),
    nullif(trim(coalesce(target_phone, '')), ''),
    target_role_id,
    target_department_id,
    target_manager_id,
    'ACTIVE'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone,
    role_id = excluded.role_id,
    department_id = excluded.department_id,
    manager_id = excluded.manager_id,
    status = 'ACTIVE',
    updated_at = now();

  return auth_user_id;
end;
$$;

grant execute on function public.upsert_user_profile_from_auth(
  text,
  text,
  text,
  uuid,
  uuid,
  uuid
) to authenticated;
