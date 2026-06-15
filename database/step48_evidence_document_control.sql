-- Step 48 - P0-09 Evidence & Document Control.
-- Run after step47_workflow_request_engine.sql.
-- Purpose: central evidence/document registry for workflow requests, leads, HOU, finance and AI control.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('evidence.read'),
    ('evidence.create'),
    ('evidence.check'),
    ('evidence.manage'),
    ('evidence.read_sensitive')
) as p(permission)
where r.code in ('ADMIN', 'BGH', 'AUDIT')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('evidence.read'),
    ('evidence.create'),
    ('evidence.check')
) as p(permission)
where r.code in ('ADMISSION_HEAD', 'TEAM_LEAD', 'CTHSSV_LEAD', 'ACCOUNTING_LEAD', 'HOU_OPERATOR')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('evidence.read'),
    ('evidence.create')
) as p(permission)
where r.code in ('COUNSELOR', 'ADMISSION_STAFF', 'CTHSSV', 'ACCOUNTING_STAFF')
on conflict (role_id, permission) do nothing;

create table if not exists public.evidence_documents (
  id uuid primary key default gen_random_uuid(),
  evidence_code text not null unique,
  evidence_title text not null,
  evidence_type text not null default 'OTHER',
  entity_type text not null default 'GENERAL',
  entity_id uuid,
  entity_code text,
  lead_id uuid references public.leads(id) on delete cascade,
  approval_request_id uuid references public.approval_requests(id) on delete cascade,
  file_url text not null,
  file_name text,
  file_mime_hint text,
  file_date date,
  storage_provider text not null default 'GOOGLE_DRIVE',
  confidentiality text not null default 'INTERNAL',
  document_status text not null default 'SUBMITTED',
  verification_note text,
  checked_by uuid references public.users_profile(id),
  checked_at timestamptz,
  note text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evidence_documents_type_valid check (
    evidence_type in (
      'STUDENT_DOCUMENT',
      'TUITION_PROOF',
      'COM_PROOF',
      'PAYMENT_VOUCHER',
      'CONTRACT',
      'DECISION',
      'LOCATION_PROOF',
      'HOU_DOCUMENT',
      'REQUEST_EVIDENCE',
      'LEGAL_SOP',
      'AI_LOG',
      'OTHER'
    )
  ),
  constraint evidence_documents_confidentiality_valid check (
    confidentiality in ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'SECRET')
  ),
  constraint evidence_documents_status_valid check (
    document_status in ('DRAFT', 'SUBMITTED', 'CHECKED', 'NEEDS_FIX', 'REJECTED', 'ARCHIVED')
  ),
  constraint evidence_documents_storage_provider_valid check (
    storage_provider in ('GOOGLE_DRIVE', 'SUPABASE_STORAGE', 'URL', 'LOCAL_NOTE', 'OTHER')
  )
);

create index if not exists idx_evidence_documents_lead_id
on public.evidence_documents(lead_id)
where lead_id is not null and record_status = 'ACTIVE';

create index if not exists idx_evidence_documents_request_id
on public.evidence_documents(approval_request_id)
where approval_request_id is not null and record_status = 'ACTIVE';

create index if not exists idx_evidence_documents_entity
on public.evidence_documents(entity_type, entity_id, entity_code)
where record_status = 'ACTIVE';

create index if not exists idx_evidence_documents_status
on public.evidence_documents(document_status, confidentiality)
where record_status = 'ACTIVE';

alter table public.evidence_documents enable row level security;

create or replace function public.can_read_evidence_document()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('evidence.read')
    or public.has_permission('evidence.check')
    or public.has_permission('evidence.manage')
    or public.has_permission('evidence.read_sensitive')
    or public.can_read_workflow_request()
$$;

create or replace function public.can_create_evidence_document()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('evidence.create')
    or public.has_permission('evidence.manage')
    or public.can_create_workflow_request()
$$;

create or replace function public.can_check_evidence_document()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('evidence.check')
    or public.has_permission('evidence.manage')
    or public.can_check_workflow_request()
$$;

create or replace function public.can_manage_evidence_document()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.has_permission('evidence.manage')
$$;

grant execute on function public.can_read_evidence_document() to authenticated;
grant execute on function public.can_create_evidence_document() to authenticated;
grant execute on function public.can_check_evidence_document() to authenticated;
grant execute on function public.can_manage_evidence_document() to authenticated;

create or replace function public.next_evidence_code(p_entity_type text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  with prefix as (
    select 'EVD-' || upper(regexp_replace(coalesce(p_entity_type, 'GENERAL'), '[^A-Z0-9]+', '_', 'g'))
      || '-' || to_char(now(), 'YYYYMMDD') || '-' as value
  ),
  last_no as (
    select coalesce(
      max(nullif(regexp_replace(evidence_code, '^.*-([0-9]{3})$', '\1'), evidence_code)::int),
      0
    ) as value
    from public.evidence_documents ed
    cross join prefix p
    where ed.evidence_code like p.value || '%'
  )
  select prefix.value || lpad((last_no.value + 1)::text, 3, '0')
  from prefix, last_no
$$;

grant execute on function public.next_evidence_code(text) to authenticated;

drop policy if exists "evidence_documents_select" on public.evidence_documents;
create policy "evidence_documents_select"
on public.evidence_documents for select
to authenticated
using (
  public.can_read_evidence_document()
  or created_by = auth.uid()
  or (
    confidentiality in ('PUBLIC', 'INTERNAL')
    and lead_id is not null
    and exists (
      select 1
      from public.leads l
      where l.id = evidence_documents.lead_id
        and l.is_deleted = false
        and public.can_read_lead(l.assigned_to, l.created_by)
    )
  )
  or (
    approval_request_id is not null
    and exists (
      select 1
      from public.approval_requests ar
      where ar.id = evidence_documents.approval_request_id
        and ar.record_status = 'ACTIVE'
        and (
          public.can_read_workflow_request()
          or ar.requested_by = auth.uid()
          or ar.checked_by = auth.uid()
          or ar.approved_by = auth.uid()
        )
    )
  )
);

drop policy if exists "evidence_documents_insert" on public.evidence_documents;
create policy "evidence_documents_insert"
on public.evidence_documents for insert
to authenticated
with check (
  public.can_create_evidence_document()
  and (
    confidentiality in ('PUBLIC', 'INTERNAL')
    or public.has_permission('evidence.read_sensitive')
    or public.can_manage_evidence_document()
  )
);

drop policy if exists "evidence_documents_update" on public.evidence_documents;
create policy "evidence_documents_update"
on public.evidence_documents for update
to authenticated
using (
  public.can_check_evidence_document()
  or public.can_manage_evidence_document()
  or created_by = auth.uid()
)
with check (
  public.can_check_evidence_document()
  or public.can_manage_evidence_document()
  or created_by = auth.uid()
);

drop policy if exists "evidence_documents_delete_admin" on public.evidence_documents;
create policy "evidence_documents_delete_admin"
on public.evidence_documents for delete
to authenticated
using (public.can_manage_evidence_document());

drop trigger if exists trg_evidence_documents_updated_at on public.evidence_documents;
create trigger trg_evidence_documents_updated_at
before update on public.evidence_documents
for each row execute function public.set_updated_at();

drop trigger if exists trg_evidence_documents_audit on public.evidence_documents;
create trigger trg_evidence_documents_audit
after insert or update or delete on public.evidence_documents
for each row execute function public.write_audit_log();

create or replace view public.evidence_document_control_status
with (security_invoker = true)
as
select
  ed.id,
  ed.evidence_code,
  ed.evidence_title,
  ed.evidence_type,
  ed.entity_type,
  ed.entity_id,
  ed.entity_code,
  ed.lead_id,
  l.lead_code,
  l.student_name,
  ed.approval_request_id,
  ar.request_code,
  ar.request_title,
  ed.file_url,
  ed.file_name,
  ed.file_mime_hint,
  ed.file_date,
  ed.storage_provider,
  ed.confidentiality,
  ed.document_status,
  ed.verification_note,
  ed.checked_by,
  checker.full_name as checked_by_name,
  ed.checked_at,
  ed.note,
  ed.created_by,
  creator.full_name as created_by_name,
  ed.created_at,
  ed.updated_at,
  array_remove(array[
    case when ed.file_url is null or length(trim(ed.file_url)) = 0 then 'MISSING_FILE_URL' end,
    case when ed.evidence_title is null or length(trim(ed.evidence_title)) = 0 then 'MISSING_TITLE' end,
    case when ed.document_status = 'SUBMITTED' and ed.checked_at is null then 'WAITING_CHECK' end,
    case when ed.document_status = 'NEEDS_FIX' then 'NEEDS_FIX' end,
    case when ed.document_status = 'REJECTED' then 'REJECTED' end,
    case when ed.confidentiality in ('RESTRICTED', 'SECRET') then 'SENSITIVE' end
  ], null) as control_flags,
  case
    when ed.document_status = 'CHECKED' then 'READY'
    when ed.document_status in ('NEEDS_FIX', 'REJECTED') then 'NEEDS_FIX'
    when ed.file_url is null or length(trim(ed.file_url)) = 0 then 'BLOCKED'
    else 'WAITING_CHECK'
  end as control_status
from public.evidence_documents ed
left join public.leads l on l.id = ed.lead_id
left join public.approval_requests ar on ar.id = ed.approval_request_id
left join public.users_profile checker on checker.id = ed.checked_by
left join public.users_profile creator on creator.id = ed.created_by
where ed.record_status = 'ACTIVE'
  and (
    public.can_read_evidence_document()
    or ed.created_by = auth.uid()
    or (
      ed.lead_id is not null
      and exists (
        select 1
        from public.leads scoped_lead
        where scoped_lead.id = ed.lead_id
          and scoped_lead.is_deleted = false
          and public.can_read_lead(scoped_lead.assigned_to, scoped_lead.created_by)
      )
    )
  );

grant select on public.evidence_document_control_status to authenticated;

create or replace view public.evidence_document_control_summary
with (security_invoker = true)
as
select
  count(*)::int as evidence_count,
  count(*) filter (where control_status = 'READY')::int as ready_count,
  count(*) filter (where control_status = 'WAITING_CHECK')::int as waiting_check_count,
  count(*) filter (where control_status = 'NEEDS_FIX')::int as needs_fix_count,
  count(*) filter (where control_status = 'BLOCKED')::int as blocked_count,
  count(*) filter (where confidentiality in ('RESTRICTED', 'SECRET'))::int as sensitive_count
from public.evidence_document_control_status;

grant select on public.evidence_document_control_summary to authenticated;

insert into public.data_dictionary_tables (
  table_code,
  table_name,
  module_code,
  table_type,
  data_owner_department,
  purpose,
  sensitivity_level,
  ai_allowed,
  control_status
) values
  (
    'EVIDENCE_DOCUMENTS',
    'Evidence Documents',
    'M00_MASTER_CONTROL',
    'TRANSACTION',
    'BGH + OWNER_DEPARTMENT',
    'Registry chung cho link/file/anh/chung tu/minh chung cua workflow request, lead, HOU, tai chinh va AI control.',
    'RESTRICTED',
    false,
    'DAT_TAM_THOI'
  ),
  (
    'EVIDENCE_DOCUMENT_CONTROL_STATUS',
    'Evidence Document Control Status',
    'M00_MASTER_CONTROL',
    'REPORT_VIEW',
    'BGH + IT_DATA',
    'View kiem tra minh chung da co link, co trang thai kiem, muc bao mat va canh bao thieu/sai.',
    'RESTRICTED',
    false,
    'DAT_TAM_THOI'
  )
on conflict (table_code) do update set
  table_name = excluded.table_name,
  module_code = excluded.module_code,
  table_type = excluded.table_type,
  data_owner_department = excluded.data_owner_department,
  purpose = excluded.purpose,
  sensitivity_level = excluded.sensitivity_level,
  ai_allowed = excluded.ai_allowed,
  control_status = excluded.control_status,
  updated_at = now();

insert into public.decision_gates (
  gate_code,
  gate_name,
  gate_type,
  entity_type,
  entity_code,
  owner_department,
  checker_note,
  approver_note,
  decision_status
) values (
  'GATE_P0_09_EVIDENCE_DOCUMENT_CONTROL',
  'P0-09 Evidence & Document Control',
  'DATA',
  'EVIDENCE_CONTROL',
  'EVIDENCE_DOCUMENTS',
  'BGH + PHAP_CHE + IT_DATA',
  'Kiem tra moi minh chung co link/file, phan loai, muc bao mat, doi tuong lien quan va nguoi kiem.',
  'Khong duyet request/COM/tai chinh/AI neu minh chung bat buoc chua CHECKED hoac con NEEDS_FIX.',
  'DRAFT'
)
on conflict (gate_code) do update set
  gate_name = excluded.gate_name,
  gate_type = excluded.gate_type,
  entity_type = excluded.entity_type,
  entity_code = excluded.entity_code,
  owner_department = excluded.owner_department,
  checker_note = excluded.checker_note,
  approver_note = excluded.approver_note,
  updated_at = now();
