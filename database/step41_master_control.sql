-- Step 41 - P0-01 Master Control foundation.
-- Run after schema.sql, seed.sql, policies.sql, triggers.sql, and step40.
-- Purpose: Legal Registry, SOP Registry, Data Dictionary, and Decision Gate.

insert into public.roles (code, name, description)
values
  ('LEGAL', 'Phap che', 'Legal registry and compliance review'),
  ('IT_DATA', 'IT/Data', 'Data dictionary, report view, and system control')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('master_control.read'),
    ('master_control.manage'),
    ('master_control.check'),
    ('master_control.approve')
) as p(permission)
where r.code = 'ADMIN'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('master_control.read'),
    ('master_control.approve')
) as p(permission)
where r.code = 'BGH'
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('master_control.read'),
    ('master_control.manage'),
    ('master_control.check')
) as p(permission)
where r.code in ('LEGAL', 'IT_DATA')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('master_control.read'),
    ('master_control.check')
) as p(permission)
where r.code = 'AUDIT'
on conflict (role_id, permission) do nothing;

create table if not exists public.legal_registry (
  id uuid primary key default gen_random_uuid(),
  legal_code text not null unique,
  title text not null,
  source_type text not null default 'OTHER',
  issuing_authority text,
  document_no text,
  issued_on date,
  effective_from date,
  effective_to date,
  source_url text,
  file_url text,
  scope_note text,
  owner_department text,
  checker text,
  approver text,
  control_status text not null default 'DAT_TAM_THOI',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint legal_registry_source_type_valid check (
    source_type in (
      'LAW',
      'DECREE',
      'CIRCULAR',
      'REGULATION',
      'CONTRACT',
      'INTERNAL_POLICY',
      'OTHER'
    )
  ),
  constraint legal_registry_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.sop_registry (
  id uuid primary key default gen_random_uuid(),
  sop_code text not null unique,
  sop_name text not null,
  module_code text not null,
  objective text,
  owner_department text,
  checker_role text,
  approver_role text,
  legal_registry_id uuid references public.legal_registry(id),
  input_note text,
  output_note text,
  risk_note text,
  control_note text,
  file_url text,
  effective_from date,
  control_status text not null default 'DAT_TAM_THOI',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sop_registry_control_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.data_dictionary_tables (
  id uuid primary key default gen_random_uuid(),
  table_code text not null unique,
  table_name text not null,
  module_code text not null,
  table_type text not null default 'MASTER',
  data_owner_department text,
  purpose text,
  sensitivity_level text not null default 'INTERNAL',
  ai_allowed boolean not null default false,
  control_status text not null default 'DAT_TAM_THOI',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint data_dictionary_table_type_valid check (
    table_type in ('MASTER', 'TRANSACTION', 'REPORT_VIEW', 'STAGING', 'CONFIG')
  ),
  constraint data_dictionary_sensitivity_valid check (
    sensitivity_level in ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'SECRET')
  ),
  constraint data_dictionary_table_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.data_dictionary_fields (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.data_dictionary_tables(id) on delete cascade,
  field_code text not null,
  field_name text not null,
  data_type text not null default 'text',
  is_required boolean not null default false,
  is_unique boolean not null default false,
  is_sensitive boolean not null default false,
  ai_allowed boolean not null default false,
  validation_rule text,
  note text,
  control_status text not null default 'DAT_TAM_THOI',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (table_id, field_code),
  constraint data_dictionary_field_status_valid check (
    control_status in ('DAT', 'DAT_TAM_THOI', 'CAN_SUA', 'CHUA_DU_DIEU_KIEN')
  )
);

create table if not exists public.decision_gates (
  id uuid primary key default gen_random_uuid(),
  gate_code text not null unique,
  gate_name text not null,
  gate_type text not null default 'OTHER',
  entity_type text not null,
  entity_code text not null,
  owner_department text,
  requested_by uuid references public.users_profile(id),
  checker_note text,
  approver_note text,
  evidence_url text,
  decision_status text not null default 'DRAFT',
  due_at timestamptz,
  decided_by uuid references public.users_profile(id),
  decided_at timestamptz,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint decision_gates_type_valid check (
    gate_type in ('LEGAL', 'SOP', 'DATA', 'GO_LIVE', 'AI_AUTOMATION', 'FINANCE', 'OTHER')
  ),
  constraint decision_gates_status_valid check (
    decision_status in ('DRAFT', 'PENDING', 'CHECKED', 'APPROVED', 'REJECTED', 'NEEDS_FIX')
  )
);

create index if not exists idx_legal_registry_status
on public.legal_registry(control_status, effective_from);

create index if not exists idx_sop_registry_module
on public.sop_registry(module_code, control_status);

create index if not exists idx_data_dictionary_tables_module
on public.data_dictionary_tables(module_code, table_type);

create index if not exists idx_data_dictionary_fields_table
on public.data_dictionary_fields(table_id, field_code);

create index if not exists idx_decision_gates_entity
on public.decision_gates(entity_type, entity_code, decision_status);

alter table public.legal_registry enable row level security;
alter table public.sop_registry enable row level security;
alter table public.data_dictionary_tables enable row level security;
alter table public.data_dictionary_fields enable row level security;
alter table public.decision_gates enable row level security;

create or replace function public.can_read_master_control()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('master_control.read')
    or public.has_permission('master_control.manage')
    or public.has_permission('master_control.check')
    or public.has_permission('master_control.approve')
$$;

create or replace function public.can_manage_master_control()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.has_permission('master_control.manage')
$$;

create or replace function public.can_approve_master_control()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.has_permission('master_control.approve')
$$;

drop policy if exists "legal_registry_select_master_control"
on public.legal_registry;
create policy "legal_registry_select_master_control"
on public.legal_registry for select
to authenticated
using (public.can_read_master_control());

drop policy if exists "legal_registry_manage_master_control"
on public.legal_registry;
create policy "legal_registry_manage_master_control"
on public.legal_registry for all
to authenticated
using (public.can_manage_master_control())
with check (public.can_manage_master_control());

drop policy if exists "sop_registry_select_master_control"
on public.sop_registry;
create policy "sop_registry_select_master_control"
on public.sop_registry for select
to authenticated
using (public.can_read_master_control());

drop policy if exists "sop_registry_manage_master_control"
on public.sop_registry;
create policy "sop_registry_manage_master_control"
on public.sop_registry for all
to authenticated
using (public.can_manage_master_control())
with check (public.can_manage_master_control());

drop policy if exists "data_dictionary_tables_select_master_control"
on public.data_dictionary_tables;
create policy "data_dictionary_tables_select_master_control"
on public.data_dictionary_tables for select
to authenticated
using (public.can_read_master_control());

drop policy if exists "data_dictionary_tables_manage_master_control"
on public.data_dictionary_tables;
create policy "data_dictionary_tables_manage_master_control"
on public.data_dictionary_tables for all
to authenticated
using (public.can_manage_master_control())
with check (public.can_manage_master_control());

drop policy if exists "data_dictionary_fields_select_master_control"
on public.data_dictionary_fields;
create policy "data_dictionary_fields_select_master_control"
on public.data_dictionary_fields for select
to authenticated
using (public.can_read_master_control());

drop policy if exists "data_dictionary_fields_manage_master_control"
on public.data_dictionary_fields;
create policy "data_dictionary_fields_manage_master_control"
on public.data_dictionary_fields for all
to authenticated
using (public.can_manage_master_control())
with check (public.can_manage_master_control());

drop policy if exists "decision_gates_select_master_control"
on public.decision_gates;
create policy "decision_gates_select_master_control"
on public.decision_gates for select
to authenticated
using (public.can_read_master_control());

drop policy if exists "decision_gates_manage_master_control"
on public.decision_gates;
create policy "decision_gates_manage_master_control"
on public.decision_gates for all
to authenticated
using (
  public.can_manage_master_control()
  or public.can_approve_master_control()
)
with check (
  public.can_manage_master_control()
  or public.can_approve_master_control()
);

drop trigger if exists trg_legal_registry_updated_at on public.legal_registry;
create trigger trg_legal_registry_updated_at
before update on public.legal_registry
for each row execute function public.set_updated_at();

drop trigger if exists trg_sop_registry_updated_at on public.sop_registry;
create trigger trg_sop_registry_updated_at
before update on public.sop_registry
for each row execute function public.set_updated_at();

drop trigger if exists trg_data_dictionary_tables_updated_at on public.data_dictionary_tables;
create trigger trg_data_dictionary_tables_updated_at
before update on public.data_dictionary_tables
for each row execute function public.set_updated_at();

drop trigger if exists trg_data_dictionary_fields_updated_at on public.data_dictionary_fields;
create trigger trg_data_dictionary_fields_updated_at
before update on public.data_dictionary_fields
for each row execute function public.set_updated_at();

drop trigger if exists trg_decision_gates_updated_at on public.decision_gates;
create trigger trg_decision_gates_updated_at
before update on public.decision_gates
for each row execute function public.set_updated_at();

drop trigger if exists trg_legal_registry_audit on public.legal_registry;
create trigger trg_legal_registry_audit
after insert or update or delete on public.legal_registry
for each row execute function public.write_audit_log();

drop trigger if exists trg_sop_registry_audit on public.sop_registry;
create trigger trg_sop_registry_audit
after insert or update or delete on public.sop_registry
for each row execute function public.write_audit_log();

drop trigger if exists trg_data_dictionary_tables_audit on public.data_dictionary_tables;
create trigger trg_data_dictionary_tables_audit
after insert or update or delete on public.data_dictionary_tables
for each row execute function public.write_audit_log();

drop trigger if exists trg_data_dictionary_fields_audit on public.data_dictionary_fields;
create trigger trg_data_dictionary_fields_audit
after insert or update or delete on public.data_dictionary_fields
for each row execute function public.write_audit_log();

drop trigger if exists trg_decision_gates_audit on public.decision_gates;
create trigger trg_decision_gates_audit
after insert or update or delete on public.decision_gates
for each row execute function public.write_audit_log();

insert into public.legal_registry (
  legal_code,
  title,
  source_type,
  issuing_authority,
  document_no,
  effective_from,
  source_url,
  scope_note,
  owner_department,
  checker,
  approver,
  control_status
) values
  (
    'LEGAL_DATA_PRIVACY_ND13_2023',
    'Nghi dinh 13/2023/ND-CP ve bao ve du lieu ca nhan',
    'DECREE',
    'Chinh phu',
    '13/2023/ND-CP',
    '2023-07-01',
    'https://vanban.chinhphu.vn/?docid=207759&pageid=27160',
    'Can cu bat buoc khi thiet ke quyen, masking, AI_SAFE va xu ly du lieu ca nhan.',
    'PHAP_CHE',
    'AUDIT_PHAP_CHE',
    'BGH_HIEU_TRUONG',
    'DAT_TAM_THOI'
  ),
  (
    'LEGAL_TUITION_ND238_2025',
    'Nghi dinh 238/2025/ND-CP ve hoc phi, mien giam va ho tro hoc phi',
    'DECREE',
    'Chinh phu',
    '238/2025/ND-CP',
    '2025-09-03',
    'https://vanban.chinhphu.vn/?docid=215169&pageid=27160',
    'Can phap che kiem tra pham vi ap dung theo tung he dao tao va tung thoi diem.',
    'PHAP_CHE',
    'AUDIT_PHAP_CHE',
    'BGH_HIEU_TRUONG',
    'CAN_SUA'
  )
on conflict (legal_code) do update set
  title = excluded.title,
  source_type = excluded.source_type,
  issuing_authority = excluded.issuing_authority,
  document_no = excluded.document_no,
  effective_from = excluded.effective_from,
  source_url = excluded.source_url,
  scope_note = excluded.scope_note,
  owner_department = excluded.owner_department,
  checker = excluded.checker,
  approver = excluded.approver,
  control_status = excluded.control_status,
  updated_at = now();

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
    'LEGAL_REGISTRY',
    'Legal Registry',
    'M00_MASTER_CONTROL',
    'MASTER',
    'PHAP_CHE',
    'Quan ly can cu phap ly, ngay hieu luc va pham vi ap dung theo nghiep vu.',
    'INTERNAL',
    true,
    'DAT_TAM_THOI'
  ),
  (
    'SOP_REGISTRY',
    'SOP Registry',
    'M00_MASTER_CONTROL',
    'MASTER',
    'SOP_FACTORY',
    'Quan ly SOP, owner, checker, approver, input/output, risk va control.',
    'INTERNAL',
    true,
    'DAT_TAM_THOI'
  ),
  (
    'DECISION_GATES',
    'Decision Gates',
    'M00_MASTER_CONTROL',
    'TRANSACTION',
    'MASTER_CONTROL',
    'Ghi nhan trang thai trinh kiem/duyet cho legal, SOP, data, go-live va AI.',
    'CONFIDENTIAL',
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
