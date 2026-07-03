-- File: database/step119_tchc_records_archive_intake_audit.sql
-- Purpose:
-- - Open controlled draft metadata intake for TCHC records/archive tables.
-- - Add updated_at and audit_log triggers to the three records/archive tables.
-- - Keep the module DRAFT_CONTROL only: no file upload, no delete route,
--   no archive disposal, no legal approval and no production GO.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Run after database/step118_tchc_records_archive_system.sql.

begin;

create or replace function public.can_intake_tchc_records_archive()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.can_manage_master_control()
    or public.can_manage_permission_matrix()
    or exists (
      select 1
      from public.users_profile up
      join public.admission_departments d on d.id = up.department_id
      where up.id = auth.uid()
        and up.status = 'ACTIVE'
        and d.code = 'TCHC'
        and d.status = 'ACTIVE'
    );
$$;

grant execute on function public.can_intake_tchc_records_archive() to authenticated;

drop trigger if exists trg_heu_tchc_document_register_updated_at
on public.heu_tchc_document_register;
create trigger trg_heu_tchc_document_register_updated_at
before update on public.heu_tchc_document_register
for each row execute function public.set_updated_at();

drop trigger if exists trg_heu_tchc_archive_register_updated_at
on public.heu_tchc_archive_register;
create trigger trg_heu_tchc_archive_register_updated_at
before update on public.heu_tchc_archive_register
for each row execute function public.set_updated_at();

drop trigger if exists trg_heu_tchc_archive_handover_register_updated_at
on public.heu_tchc_archive_handover_register;
create trigger trg_heu_tchc_archive_handover_register_updated_at
before update on public.heu_tchc_archive_handover_register
for each row execute function public.set_updated_at();

drop trigger if exists trg_heu_tchc_document_register_audit
on public.heu_tchc_document_register;
create trigger trg_heu_tchc_document_register_audit
after insert or update or delete on public.heu_tchc_document_register
for each row execute function public.write_audit_log();

drop trigger if exists trg_heu_tchc_archive_register_audit
on public.heu_tchc_archive_register;
create trigger trg_heu_tchc_archive_register_audit
after insert or update or delete on public.heu_tchc_archive_register
for each row execute function public.write_audit_log();

drop trigger if exists trg_heu_tchc_archive_handover_register_audit
on public.heu_tchc_archive_handover_register;
create trigger trg_heu_tchc_archive_handover_register_audit
after insert or update or delete on public.heu_tchc_archive_handover_register
for each row execute function public.write_audit_log();

drop policy if exists "heu_tchc_document_register_controlled_insert" on public.heu_tchc_document_register;
create policy "heu_tchc_document_register_controlled_insert"
on public.heu_tchc_document_register for insert
to authenticated
with check (
  public.can_intake_tchc_records_archive()
  and owner_position_code = 'TCHC_VAN_THU_LUU_TRU'
  and control_status = 'DRAFT_CONTROL'
  and legal_gate_code = 'TCHC-LEGAL-01'
);

drop policy if exists "heu_tchc_archive_register_controlled_insert" on public.heu_tchc_archive_register;
create policy "heu_tchc_archive_register_controlled_insert"
on public.heu_tchc_archive_register for insert
to authenticated
with check (
  public.can_intake_tchc_records_archive()
  and owner_position_code = 'TCHC_VAN_THU_LUU_TRU'
  and control_status = 'DRAFT_CONTROL'
  and legal_gate_code = 'TCHC-LEGAL-02'
);

drop policy if exists "heu_tchc_archive_handover_register_controlled_insert" on public.heu_tchc_archive_handover_register;
create policy "heu_tchc_archive_handover_register_controlled_insert"
on public.heu_tchc_archive_handover_register for insert
to authenticated
with check (
  public.can_intake_tchc_records_archive()
  and from_position_code = 'TCHC_VAN_THU_LUU_TRU'
  and control_status = 'DRAFT_CONTROL'
  and legal_gate_code in ('TCHC-LEGAL-01', 'TCHC-LEGAL-02')
);

commit;
