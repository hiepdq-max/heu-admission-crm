-- Step 35G - HOU evidence file registry.
-- Run after step35d_hou_commission_foundation.sql and step35f_hou_location_management.sql.
--
-- The app stores file/image links first. Physical upload to Supabase Storage can
-- be added later without changing the evidence workflow.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('hou.evidence.read_sensitive'),
    ('hou.evidence.manage')
) as p(permission)
where r.code in ('ADMIN', 'BGH', 'ADMISSION_HEAD', 'ACCOUNTING')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('hou.evidence.read'),
    ('hou.evidence.create_lead')
) as p(permission)
where r.code in ('TEAM_LEAD', 'COUNSELOR')
on conflict (role_id, permission) do nothing;

create or replace function public.can_read_hou_evidence_sensitive()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or public.has_permission('hou.evidence.read_sensitive')
    or public.has_permission('hou.evidence.manage')
$$;

create or replace function public.can_manage_hou_evidence()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.has_permission('hou.evidence.manage')
$$;

create table if not exists public.hou_evidence_files (
  id uuid primary key default gen_random_uuid(),
  evidence_scope text not null check (
    evidence_scope in ('LEAD', 'LOCATION', 'COM_CLAIM', 'PAYMENT', 'PROGRAM', 'GENERAL')
  ),
  lead_id uuid references public.leads(id) on delete cascade,
  location_id uuid references public.hou_locations(id) on delete cascade,
  claim_id uuid references public.hou_commission_claims(id) on delete cascade,
  evidence_type text not null check (
    evidence_type in (
      'LOCATION_DECISION',
      'LOCATION_PHOTO',
      'CONTRACT',
      'HOU_STUDENT_LIST',
      'ADMISSION_DECISION',
      'TUITION_PROOF',
      'COM_PROOF',
      'PAYMENT_VOUCHER',
      'STUDENT_DOCUMENT',
      'OTHER'
    )
  ),
  evidence_title text not null,
  file_url text not null,
  file_name text,
  file_mime_hint text,
  file_date date,
  confidential_level text not null default 'INTERNAL' check (
    confidential_level in ('INTERNAL', 'SENSITIVE', 'FINANCE_CONFIDENTIAL')
  ),
  note text,
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hou_evidence_files_scope_target_required check (
    (evidence_scope = 'LEAD' and lead_id is not null)
    or (evidence_scope = 'LOCATION' and location_id is not null)
    or (evidence_scope = 'COM_CLAIM' and claim_id is not null)
    or (evidence_scope in ('PAYMENT', 'PROGRAM', 'GENERAL'))
  )
);

create index if not exists idx_hou_evidence_files_lead_id
on public.hou_evidence_files(lead_id)
where lead_id is not null;

create index if not exists idx_hou_evidence_files_location_id
on public.hou_evidence_files(location_id)
where location_id is not null;

create index if not exists idx_hou_evidence_files_claim_id
on public.hou_evidence_files(claim_id)
where claim_id is not null;

create index if not exists idx_hou_evidence_files_scope_type
on public.hou_evidence_files(evidence_scope, evidence_type);

alter table public.hou_evidence_files enable row level security;

drop policy if exists "hou_evidence_files_select" on public.hou_evidence_files;
create policy "hou_evidence_files_select"
on public.hou_evidence_files for select
to authenticated
using (
  public.can_read_hou_evidence_sensitive()
  or (
    confidential_level = 'INTERNAL'
    and (
      evidence_scope in ('LOCATION', 'PROGRAM', 'GENERAL')
      or exists (
        select 1
        from public.leads l
        where l.id = hou_evidence_files.lead_id
          and l.is_deleted = false
          and public.can_read_lead(l.assigned_to, l.created_by)
      )
      or exists (
        select 1
        from public.hou_commission_claims c
        join public.leads l on l.id = c.lead_id
        where c.id = hou_evidence_files.claim_id
          and l.is_deleted = false
          and public.can_read_lead(l.assigned_to, l.created_by)
      )
    )
  )
);

drop policy if exists "hou_evidence_files_insert" on public.hou_evidence_files;
create policy "hou_evidence_files_insert"
on public.hou_evidence_files for insert
to authenticated
with check (
  public.can_manage_hou_evidence()
  or (
    confidential_level = 'INTERNAL'
    and evidence_scope = 'LEAD'
    and exists (
      select 1
      from public.leads l
      where l.id = hou_evidence_files.lead_id
        and l.is_deleted = false
        and public.can_write_lead(l.assigned_to, l.created_by)
    )
  )
);

drop policy if exists "hou_evidence_files_update" on public.hou_evidence_files;
create policy "hou_evidence_files_update"
on public.hou_evidence_files for update
to authenticated
using (
  public.can_manage_hou_evidence()
  or (
    confidential_level = 'INTERNAL'
    and evidence_scope = 'LEAD'
    and exists (
      select 1
      from public.leads l
      where l.id = hou_evidence_files.lead_id
        and l.is_deleted = false
        and public.can_write_lead(l.assigned_to, l.created_by)
    )
  )
)
with check (
  public.can_manage_hou_evidence()
  or (
    confidential_level = 'INTERNAL'
    and evidence_scope = 'LEAD'
    and exists (
      select 1
      from public.leads l
      where l.id = hou_evidence_files.lead_id
        and l.is_deleted = false
        and public.can_write_lead(l.assigned_to, l.created_by)
    )
  )
);

drop policy if exists "hou_evidence_files_delete_admin" on public.hou_evidence_files;
create policy "hou_evidence_files_delete_admin"
on public.hou_evidence_files for delete
to authenticated
using (public.can_manage_hou_evidence());

drop trigger if exists trg_hou_evidence_files_updated_at on public.hou_evidence_files;
create trigger trg_hou_evidence_files_updated_at
before update on public.hou_evidence_files
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_evidence_files_audit on public.hou_evidence_files;
create trigger trg_hou_evidence_files_audit
after insert or update or delete on public.hou_evidence_files
for each row execute function public.write_audit_log();
