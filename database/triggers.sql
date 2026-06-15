-- HEU Admission CRM - functions and triggers
-- Run after schema.sql, seed.sql, and policies.sql

create sequence if not exists public.lead_code_seq;
create sequence if not exists public.enrollment_code_seq;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.assign_lead_defaults()
returns trigger
language plpgsql
as $$
begin
  if new.lead_code is null or trim(new.lead_code) = '' then
    new.lead_code =
      'LEAD-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.lead_code_seq')::text, 6, '0');
  end if;

  if new.created_by is null then
    new.created_by = auth.uid();
  end if;

  if new.assigned_to is not null and new.status = 'NEW' then
    new.status = 'ASSIGNED';
  end if;

  return new;
end;
$$;

create or replace function public.assign_enrollment_defaults()
returns trigger
language plpgsql
as $$
begin
  if new.enrollment_code is null or trim(new.enrollment_code) = '' then
    new.enrollment_code =
      'ENR-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.enrollment_code_seq')::text, 6, '0');
  end if;

  return new;
end;
$$;

create or replace function public.validate_lead_status_transition()
returns trigger
language plpgsql
as $$
declare
  missing_required_count int;
  payment_ok boolean;
begin
  if new.status = 'DOCUMENT_SUBMITTED' then
    if not exists (
      select 1
      from public.lead_documents d
      where d.lead_id = new.id
    ) then
      raise exception 'Cannot move lead to DOCUMENT_SUBMITTED without at least one document';
    end if;
  end if;

  if new.status = 'ELIGIBLE' then
    select count(*)
    into missing_required_count
    from public.enrollment_checklists c
    where c.status = 'ACTIVE'
      and c.is_required = true
      and not exists (
        select 1
        from public.lead_documents d
        where d.lead_id = new.id
          and d.document_type = c.document_code
          and d.status = 'CHECKED'
      );

    if missing_required_count > 0 then
      raise exception 'Cannot move lead to ELIGIBLE while required documents are missing or unchecked';
    end if;
  end if;

  if new.status = 'ENROLLED' then
    select exists (
      select 1
      from public.admission_payments p
      where p.lead_id = new.id
        and p.payment_status in ('NOT_REQUIRED', 'VERIFIED')
    )
    into payment_ok;

    if not exists (
      select 1
      from public.enrollments e
      where e.lead_id = new.id
        and e.status in ('CONFIRMED', 'TRANSFERRED')
    ) then
      raise exception 'Cannot move lead to ENROLLED without confirmed enrollment';
    end if;

    if payment_ok is not true then
      raise exception 'Cannot move lead to ENROLLED without verified or not-required admission payment';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_user_id uuid;
  record_id uuid;
begin
  acting_user_id = auth.uid();

  if acting_user_id is not null and not exists (
    select 1 from public.users_profile where id = acting_user_id
  ) then
    acting_user_id = null;
  end if;

  if tg_op = 'DELETE' then
    record_id = nullif(coalesce(to_jsonb(old)->>'id', ''), '')::uuid;
  else
    record_id = nullif(coalesce(to_jsonb(new)->>'id', ''), '')::uuid;
  end if;

  insert into public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value
  ) values (
    acting_user_id,
    tg_op,
    tg_table_name,
    record_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  return coalesce(new, old);
end;
$$;

create or replace function public.write_lead_activity_for_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_user_id uuid;
begin
  acting_user_id = auth.uid();

  if acting_user_id is not null and not exists (
    select 1 from public.users_profile where id = acting_user_id
  ) then
    acting_user_id = null;
  end if;

  if new.status is distinct from old.status then
    insert into public.lead_activities (
      lead_id,
      activity_type,
      activity_result,
      content,
      created_by
    ) values (
      new.id,
      'STATUS_CHANGE',
      new.status::text,
      'Status changed from ' || old.status::text || ' to ' || new.status::text,
      acting_user_id
    );
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    insert into public.lead_activities (
      lead_id,
      activity_type,
      activity_result,
      content,
      created_by
    ) values (
      new.id,
      'ASSIGNMENT',
      'ASSIGNED',
      'Lead assignment changed',
      acting_user_id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_roles_updated_at on public.roles;
create trigger trg_roles_updated_at
before update on public.roles
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_departments_updated_at on public.admission_departments;
create trigger trg_admission_departments_updated_at
before update on public.admission_departments
for each row execute function public.set_updated_at();

drop trigger if exists trg_users_profile_updated_at on public.users_profile;
create trigger trg_users_profile_updated_at
before update on public.users_profile
for each row execute function public.set_updated_at();

drop trigger if exists trg_lead_sources_updated_at on public.lead_sources;
create trigger trg_lead_sources_updated_at
before update on public.lead_sources
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_flows_updated_at on public.admission_flows;
create trigger trg_admission_flows_updated_at
before update on public.admission_flows
for each row execute function public.set_updated_at();

drop trigger if exists trg_campaigns_updated_at on public.campaigns;
create trigger trg_campaigns_updated_at
before update on public.campaigns
for each row execute function public.set_updated_at();

drop trigger if exists trg_partners_updated_at on public.partners;
create trigger trg_partners_updated_at
before update on public.partners
for each row execute function public.set_updated_at();

drop trigger if exists trg_leads_assign_defaults on public.leads;
create trigger trg_leads_assign_defaults
before insert on public.leads
for each row execute function public.assign_lead_defaults();

drop trigger if exists trg_leads_validate_status on public.leads;
create trigger trg_leads_validate_status
before update of status on public.leads
for each row execute function public.validate_lead_status_transition();

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists trg_lead_followups_updated_at on public.lead_followups;
create trigger trg_lead_followups_updated_at
before update on public.lead_followups
for each row execute function public.set_updated_at();

drop trigger if exists trg_enrollment_checklists_updated_at on public.enrollment_checklists;
create trigger trg_enrollment_checklists_updated_at
before update on public.enrollment_checklists
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_programs_updated_at on public.admission_programs;
create trigger trg_admission_programs_updated_at
before update on public.admission_programs
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_majors_updated_at on public.admission_majors;
create trigger trg_admission_majors_updated_at
before update on public.admission_majors
for each row execute function public.set_updated_at();

drop trigger if exists trg_lead_documents_updated_at on public.lead_documents;
create trigger trg_lead_documents_updated_at
before update on public.lead_documents
for each row execute function public.set_updated_at();

drop trigger if exists trg_enrollments_assign_defaults on public.enrollments;
create trigger trg_enrollments_assign_defaults
before insert on public.enrollments
for each row execute function public.assign_enrollment_defaults();

drop trigger if exists trg_enrollments_updated_at on public.enrollments;
create trigger trg_enrollments_updated_at
before update on public.enrollments
for each row execute function public.set_updated_at();

drop trigger if exists trg_admission_payments_updated_at on public.admission_payments;
create trigger trg_admission_payments_updated_at
before update on public.admission_payments
for each row execute function public.set_updated_at();

drop trigger if exists trg_leads_activity_changes on public.leads;
create trigger trg_leads_activity_changes
after update of status, assigned_to on public.leads
for each row execute function public.write_lead_activity_for_changes();

drop trigger if exists trg_campaigns_audit on public.campaigns;
create trigger trg_campaigns_audit
after insert or update or delete on public.campaigns
for each row execute function public.write_audit_log();

drop trigger if exists trg_partners_audit on public.partners;
create trigger trg_partners_audit
after insert or update or delete on public.partners
for each row execute function public.write_audit_log();

drop trigger if exists trg_admission_flows_audit on public.admission_flows;
create trigger trg_admission_flows_audit
after insert or update or delete on public.admission_flows
for each row execute function public.write_audit_log();

drop trigger if exists trg_admission_programs_audit on public.admission_programs;
create trigger trg_admission_programs_audit
after insert or update or delete on public.admission_programs
for each row execute function public.write_audit_log();

drop trigger if exists trg_admission_majors_audit on public.admission_majors;
create trigger trg_admission_majors_audit
after insert or update or delete on public.admission_majors
for each row execute function public.write_audit_log();

drop trigger if exists trg_leads_audit on public.leads;
create trigger trg_leads_audit
after insert or update or delete on public.leads
for each row execute function public.write_audit_log();

drop trigger if exists trg_lead_activities_audit on public.lead_activities;
create trigger trg_lead_activities_audit
after insert or update or delete on public.lead_activities
for each row execute function public.write_audit_log();

drop trigger if exists trg_lead_followups_audit on public.lead_followups;
create trigger trg_lead_followups_audit
after insert or update or delete on public.lead_followups
for each row execute function public.write_audit_log();

drop trigger if exists trg_lead_documents_audit on public.lead_documents;
create trigger trg_lead_documents_audit
after insert or update or delete on public.lead_documents
for each row execute function public.write_audit_log();

drop trigger if exists trg_enrollments_audit on public.enrollments;
create trigger trg_enrollments_audit
after insert or update or delete on public.enrollments
for each row execute function public.write_audit_log();

drop trigger if exists trg_admission_payments_audit on public.admission_payments;
create trigger trg_admission_payments_audit
after insert or update or delete on public.admission_payments
for each row execute function public.write_audit_log();
