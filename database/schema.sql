-- HEU Admission CRM - database schema
-- Run order: schema.sql -> seed.sql -> policies.sql -> triggers.sql

create extension if not exists pgcrypto;

do $$ begin
  create type public.lead_status as enum (
    'NEW',
    'ASSIGNED',
    'CONTACTED',
    'INTERESTED',
    'FOLLOW_UP',
    'VISITED',
    'DOCUMENT_PENDING',
    'DOCUMENT_SUBMITTED',
    'ELIGIBLE',
    'ENROLLED',
    'LOST',
    'DUPLICATE'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.lead_priority as enum ('LOW', 'NORMAL', 'HIGH', 'URGENT');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.activity_type as enum (
    'CALL',
    'ZALO',
    'SMS',
    'EMAIL',
    'MEETING',
    'NOTE',
    'STATUS_CHANGE',
    'ASSIGNMENT',
    'DOCUMENT',
    'PAYMENT'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.document_status as enum (
    'MISSING',
    'PENDING',
    'SUBMITTED',
    'CHECKED',
    'REJECTED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.partner_type as enum ('CTV', 'THCS', 'TTGDTX', 'BUSINESS', 'OTHER');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.record_status as enum ('ACTIVE', 'INACTIVE');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.enrollment_status as enum (
    'DRAFT',
    'PENDING',
    'CONFIRMED',
    'TRANSFERRED',
    'CANCELLED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum (
    'NOT_REQUIRED',
    'PENDING',
    'PARTIAL',
    'PAID',
    'VERIFIED',
    'CANCELLED'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission text not null,
  created_at timestamptz not null default now(),
  unique (role_id, permission)
);

create table if not exists public.admission_departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  role_id uuid references public.roles(id),
  department_id uuid references public.admission_departments(id),
  manager_id uuid references public.users_profile(id),
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  source_code text not null unique,
  source_name text not null,
  source_group text not null,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admission_flows (
  id uuid primary key default gen_random_uuid(),
  flow_code text not null unique,
  flow_name text not null,
  short_description text not null,
  owner_department text not null,
  main_risk text not null,
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admission_programs (
  id uuid primary key default gen_random_uuid(),
  program_code text not null unique,
  program_name text not null,
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admission_majors (
  id uuid primary key default gen_random_uuid(),
  major_code text not null unique,
  major_name text not null,
  program_id uuid references public.admission_programs(id),
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_code text not null unique,
  campaign_name text not null,
  source_id uuid references public.lead_sources(id),
  start_date date,
  end_date date,
  budget numeric(14,2),
  status public.record_status not null default 'ACTIVE',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid references public.users_profile(id)
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  partner_code text not null unique,
  partner_name text not null,
  partner_type public.partner_type not null,
  phone text,
  email text,
  area text,
  owner_user_id uuid references public.users_profile(id),
  commission_note text,
  contract_status text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid references public.users_profile(id)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  lead_code text not null unique,
  student_name text not null,
  student_phone text,
  student_phone_norm text generated always as (
    nullif(regexp_replace(coalesce(student_phone, ''), '\D', '', 'g'), '')
  ) stored,
  student_dob date,
  student_gender text,
  parent_name text,
  parent_phone text,
  parent_phone_norm text generated always as (
    nullif(regexp_replace(coalesce(parent_phone, ''), '\D', '', 'g'), '')
  ) stored,
  parent_relationship text,
  current_school text,
  current_grade text,
  graduation_year int,
  interested_program text,
  interested_major text,
  province text,
  district text,
  ward text,
  source_id uuid references public.lead_sources(id),
  flow_id uuid references public.admission_flows(id),
  campaign_id uuid references public.campaigns(id),
  partner_id uuid references public.partners(id),
  assigned_to uuid references public.users_profile(id),
  status public.lead_status not null default 'NEW',
  priority public.lead_priority not null default 'NORMAL',
  lost_reason text,
  next_followup_at timestamptz,
  note text,
  is_duplicate boolean not null default false,
  duplicate_of uuid references public.leads(id),
  created_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid references public.users_profile(id),
  constraint leads_requires_phone check (
    nullif(trim(coalesce(student_phone, '')), '') is not null
    or nullif(trim(coalesce(parent_phone, '')), '') is not null
  ),
  constraint leads_follow_up_requires_date check (
    status <> 'FOLLOW_UP' or next_followup_at is not null
  ),
  constraint leads_lost_requires_reason check (
    status <> 'LOST' or nullif(trim(coalesce(lost_reason, '')), '') is not null
  )
);

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  activity_type public.activity_type not null,
  activity_result text,
  content text not null,
  next_action text,
  next_followup_at timestamptz,
  created_by uuid references public.users_profile(id),
  created_at timestamptz not null default now()
);

create table if not exists public.lead_followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  assigned_to uuid references public.users_profile(id),
  due_at timestamptz not null,
  completed_at timestamptz,
  result text,
  note text,
  created_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid references public.users_profile(id)
);

create table if not exists public.enrollment_checklists (
  id uuid primary key default gen_random_uuid(),
  document_code text not null unique,
  document_name text not null,
  is_required boolean not null default true,
  applies_to_program text,
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_documents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  checklist_id uuid references public.enrollment_checklists(id),
  document_type text not null,
  status public.document_status not null default 'MISSING',
  file_url text,
  checked_by uuid references public.users_profile(id),
  checked_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id, document_type)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads(id) on delete restrict,
  enrollment_code text not null unique,
  program text,
  major text,
  class_expected text,
  enrollment_date date,
  status public.enrollment_status not null default 'DRAFT',
  transferred_to_student_master boolean not null default false,
  transferred_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid references public.users_profile(id)
);

create table if not exists public.admission_payments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  payment_status public.payment_status not null default 'PENDING',
  expected_amount numeric(14,2),
  paid_amount numeric(14,2),
  payment_date date,
  payment_method text,
  receipt_code text,
  verified_by_finance uuid references public.users_profile(id),
  verified_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users_profile(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address inet,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_profile_role_id on public.users_profile(role_id);
create index if not exists idx_users_profile_department_id on public.users_profile(department_id);
create index if not exists idx_admission_majors_program_id on public.admission_majors(program_id);
create index if not exists idx_leads_status on public.leads(status) where is_deleted = false;
create index if not exists idx_leads_assigned_to on public.leads(assigned_to) where is_deleted = false;
create index if not exists idx_leads_source_id on public.leads(source_id) where is_deleted = false;
create index if not exists idx_leads_flow_id on public.leads(flow_id) where is_deleted = false;
create index if not exists idx_leads_campaign_id on public.leads(campaign_id) where is_deleted = false;
create index if not exists idx_leads_partner_id on public.leads(partner_id) where is_deleted = false;
create index if not exists idx_leads_next_followup_at on public.leads(next_followup_at) where is_deleted = false;
create index if not exists idx_leads_created_at on public.leads(created_at);
create index if not exists idx_leads_student_phone_norm on public.leads(student_phone_norm) where student_phone_norm is not null;
create index if not exists idx_leads_parent_phone_norm on public.leads(parent_phone_norm) where parent_phone_norm is not null;
create index if not exists idx_lead_activities_lead_id_created_at on public.lead_activities(lead_id, created_at desc);
create index if not exists idx_lead_followups_due_at on public.lead_followups(due_at) where is_deleted = false;
create index if not exists idx_lead_documents_lead_id on public.lead_documents(lead_id);
create index if not exists idx_enrollments_status on public.enrollments(status) where is_deleted = false;
create index if not exists idx_admission_payments_lead_id on public.admission_payments(lead_id);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id, created_at desc);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id, created_at desc);
