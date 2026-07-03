-- File: database/step118_tchc_records_archive_system.sql
-- Purpose:
-- - Create the controlled data foundation for TCHC records/archive operations.
-- - Track safe metadata for incoming/outgoing documents, archive boxes/folders
--   and handover queues.
-- - Keep the module read-only/control-first until PHAP_CHE signs legal basis,
--   SOP, UAT evidence and owner GO.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order
-- approval and owner Go/No-Go sign-off.

begin;

create table if not exists public.heu_tchc_document_register (
  id uuid primary key default gen_random_uuid(),
  document_code text not null unique,
  direction text not null,
  document_number_safe text,
  title_safe text not null,
  issuing_unit_safe text,
  receiving_unit_code text,
  document_date date,
  received_or_sent_at timestamptz,
  due_date date,
  owner_position_code text not null default 'TCHC_VAN_THU_LUU_TRU'
    references public.heu_org_positions(position_code) on update cascade on delete restrict,
  handler_position_code text
    references public.heu_org_positions(position_code) on update cascade on delete restrict,
  document_status text not null default 'DRAFT_INTAKE',
  confidentiality_level text not null default 'CONFIDENTIAL',
  evidence_ref_code text,
  archive_code text,
  legal_gate_code text not null default 'TCHC-LEGAL-01',
  control_status text not null default 'DRAFT_CONTROL',
  status public.record_status not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_tchc_document_direction_valid check (
    direction in ('INCOMING', 'OUTGOING', 'INTERNAL')
  ),
  constraint heu_tchc_document_status_valid check (
    document_status in (
      'DRAFT_INTAKE',
      'ROUTED',
      'IN_PROGRESS',
      'WAITING_RESPONSE',
      'COMPLETED',
      'ARCHIVE_PENDING',
      'ARCHIVED',
      'BLOCKED'
    )
  ),
  constraint heu_tchc_document_confidentiality_valid check (
    confidentiality_level in ('PUBLIC_METADATA', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')
  ),
  constraint heu_tchc_document_control_status_valid check (
    control_status in ('DRAFT_CONTROL', 'READY_FOR_UAT', 'SIGNED_OFF', 'BLOCKED')
  )
);

create table if not exists public.heu_tchc_archive_register (
  id uuid primary key default gen_random_uuid(),
  archive_code text not null unique,
  archive_title_safe text not null,
  archive_domain text not null,
  archive_category text not null,
  shelf_code text,
  box_code text,
  folder_code text,
  retention_rule_code text,
  retention_until date,
  digitization_status text not null default 'NOT_DIGITIZED',
  owner_position_code text not null default 'TCHC_VAN_THU_LUU_TRU'
    references public.heu_org_positions(position_code) on update cascade on delete restrict,
  confidentiality_level text not null default 'CONFIDENTIAL',
  evidence_ref_code text,
  legal_gate_code text not null default 'TCHC-LEGAL-02',
  control_status text not null default 'DRAFT_CONTROL',
  status public.record_status not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_tchc_archive_domain_valid check (
    archive_domain in (
      'CONG_VAN_DEN_DI',
      'HO_SO_PHAP_CHE',
      'HO_SO_NHAN_SU',
      'HO_SO_DAO_TAO',
      'HO_SO_TAI_CHINH',
      'HO_SO_CSVC',
      'HO_SO_KHAC'
    )
  ),
  constraint heu_tchc_archive_digitization_status_valid check (
    digitization_status in ('NOT_DIGITIZED', 'IN_PROGRESS', 'DIGITIZED_METADATA_ONLY', 'DIGITIZED_CONTROLLED_COPY', 'BLOCKED')
  ),
  constraint heu_tchc_archive_confidentiality_valid check (
    confidentiality_level in ('PUBLIC_METADATA', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')
  ),
  constraint heu_tchc_archive_control_status_valid check (
    control_status in ('DRAFT_CONTROL', 'READY_FOR_UAT', 'SIGNED_OFF', 'BLOCKED')
  )
);

create table if not exists public.heu_tchc_archive_handover_register (
  id uuid primary key default gen_random_uuid(),
  handover_code text not null unique,
  item_type text not null,
  source_item_code text not null,
  from_position_code text not null default 'TCHC_VAN_THU_LUU_TRU'
    references public.heu_org_positions(position_code) on update cascade on delete restrict,
  to_department_code text,
  to_position_code text
    references public.heu_org_positions(position_code) on update cascade on delete restrict,
  handover_reason text not null,
  due_date date,
  handover_status text not null default 'DRAFT_ROUTE',
  evidence_ref_code text,
  legal_gate_code text not null default 'TCHC-LEGAL-01',
  control_status text not null default 'DRAFT_CONTROL',
  status public.record_status not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heu_tchc_archive_handover_item_type_valid check (
    item_type in ('DOCUMENT', 'ARCHIVE_FILE', 'ARCHIVE_BOX')
  ),
  constraint heu_tchc_archive_handover_status_valid check (
    handover_status in ('DRAFT_ROUTE', 'SENT', 'RECEIVED', 'RETURNED', 'OVERDUE', 'BLOCKED')
  ),
  constraint heu_tchc_archive_handover_control_status_valid check (
    control_status in ('DRAFT_CONTROL', 'READY_FOR_UAT', 'SIGNED_OFF', 'BLOCKED')
  )
);

alter table public.heu_tchc_document_register enable row level security;
alter table public.heu_tchc_archive_register enable row level security;
alter table public.heu_tchc_archive_handover_register enable row level security;

drop policy if exists "heu_tchc_document_register_select_authenticated" on public.heu_tchc_document_register;
create policy "heu_tchc_document_register_select_authenticated"
on public.heu_tchc_document_register for select
to authenticated
using (public.can_read_permission_matrix() or public.has_permission('reports.read_scope'));

drop policy if exists "heu_tchc_document_register_admin_write" on public.heu_tchc_document_register;
create policy "heu_tchc_document_register_admin_write"
on public.heu_tchc_document_register for all
to authenticated
using (public.can_manage_master_control() or public.can_manage_permission_matrix())
with check (public.can_manage_master_control() or public.can_manage_permission_matrix());

drop policy if exists "heu_tchc_archive_register_select_authenticated" on public.heu_tchc_archive_register;
create policy "heu_tchc_archive_register_select_authenticated"
on public.heu_tchc_archive_register for select
to authenticated
using (public.can_read_permission_matrix() or public.has_permission('reports.read_scope'));

drop policy if exists "heu_tchc_archive_register_admin_write" on public.heu_tchc_archive_register;
create policy "heu_tchc_archive_register_admin_write"
on public.heu_tchc_archive_register for all
to authenticated
using (public.can_manage_master_control() or public.can_manage_permission_matrix())
with check (public.can_manage_master_control() or public.can_manage_permission_matrix());

drop policy if exists "heu_tchc_archive_handover_register_select_authenticated" on public.heu_tchc_archive_handover_register;
create policy "heu_tchc_archive_handover_register_select_authenticated"
on public.heu_tchc_archive_handover_register for select
to authenticated
using (public.can_read_permission_matrix() or public.has_permission('reports.read_scope'));

drop policy if exists "heu_tchc_archive_handover_register_admin_write" on public.heu_tchc_archive_handover_register;
create policy "heu_tchc_archive_handover_register_admin_write"
on public.heu_tchc_archive_handover_register for all
to authenticated
using (public.can_manage_master_control() or public.can_manage_permission_matrix())
with check (public.can_manage_master_control() or public.can_manage_permission_matrix());

create index if not exists heu_tchc_document_register_direction_idx
  on public.heu_tchc_document_register(direction, document_status, due_date);

create index if not exists heu_tchc_archive_register_domain_idx
  on public.heu_tchc_archive_register(archive_domain, digitization_status, retention_until);

create index if not exists heu_tchc_archive_handover_status_idx
  on public.heu_tchc_archive_handover_register(handover_status, due_date);

create or replace view public.heu_tchc_records_archive_dashboard
with (security_invoker = true)
as
select
  'DOCUMENT_FLOW'::text as dashboard_code,
  'So van ban den/di'::text as dashboard_name,
  count(*)::integer as item_count,
  count(*) filter (where document_status in ('DRAFT_INTAKE', 'ROUTED', 'IN_PROGRESS', 'WAITING_RESPONSE'))::integer as open_count,
  count(*) filter (where document_status = 'BLOCKED' or control_status = 'BLOCKED')::integer as blocked_count,
  count(*) filter (where due_date is not null and due_date < current_date and document_status not in ('COMPLETED', 'ARCHIVED'))::integer as overdue_count,
  count(*) filter (where document_status in ('ARCHIVE_PENDING', 'ARCHIVED'))::integer as archive_ready_count,
  max(updated_at) as last_activity_at,
  case
    when count(*) = 0 then 'NO_DATA'
    when count(*) filter (where control_status <> 'SIGNED_OFF') > 0 then 'DRAFT_CONTROL'
    else 'READY'
  end as readiness_state
from public.heu_tchc_document_register
where status = 'ACTIVE'
union all
select
  'ARCHIVE_STATUS'::text as dashboard_code,
  'Ho so luu tru'::text as dashboard_name,
  count(*)::integer as item_count,
  count(*) filter (where digitization_status in ('NOT_DIGITIZED', 'IN_PROGRESS'))::integer as open_count,
  count(*) filter (where digitization_status = 'BLOCKED' or control_status = 'BLOCKED')::integer as blocked_count,
  count(*) filter (where retention_until is not null and retention_until < current_date and control_status <> 'SIGNED_OFF')::integer as overdue_count,
  count(*) filter (where digitization_status in ('DIGITIZED_METADATA_ONLY', 'DIGITIZED_CONTROLLED_COPY'))::integer as archive_ready_count,
  max(updated_at) as last_activity_at,
  case
    when count(*) = 0 then 'NO_DATA'
    when count(*) filter (where control_status <> 'SIGNED_OFF') > 0 then 'DRAFT_CONTROL'
    else 'READY'
  end as readiness_state
from public.heu_tchc_archive_register
where status = 'ACTIVE'
union all
select
  'HANDOVER_QUEUE'::text as dashboard_code,
  'Ban giao/xu ly ho so'::text as dashboard_name,
  count(*)::integer as item_count,
  count(*) filter (where handover_status in ('DRAFT_ROUTE', 'SENT'))::integer as open_count,
  count(*) filter (where handover_status = 'BLOCKED' or control_status = 'BLOCKED')::integer as blocked_count,
  count(*) filter (where due_date is not null and due_date < current_date and handover_status not in ('RECEIVED', 'RETURNED'))::integer as overdue_count,
  count(*) filter (where handover_status = 'RECEIVED')::integer as archive_ready_count,
  max(updated_at) as last_activity_at,
  case
    when count(*) = 0 then 'NO_DATA'
    when count(*) filter (where control_status <> 'SIGNED_OFF') > 0 then 'DRAFT_CONTROL'
    else 'READY'
  end as readiness_state
from public.heu_tchc_archive_handover_register
where status = 'ACTIVE';

grant select on public.heu_tchc_document_register to authenticated;
grant select on public.heu_tchc_archive_register to authenticated;
grant select on public.heu_tchc_archive_handover_register to authenticated;
grant select on public.heu_tchc_records_archive_dashboard to authenticated;

commit;
