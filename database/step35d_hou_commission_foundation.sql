-- Step 35D - HOU commission accounting foundation.
-- Run after step35a_hou_foundation.sql and step35c_hou_sensitive_finance_policy.sql.
--
-- Design notes:
-- - Commission mechanisms are versioned by effective dates.
-- - Each policy contains one or more payable components, such as COM1/COM2.
-- - Payment is tracked through accounting cycles, claim lines, and payment lines.
-- - Unique indexes prevent paying the same student/policy/component twice.
-- - Sensitive financial data is restricted to ADMIN, BGH, ADMISSION_HEAD,
--   and ACCOUNTING.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('hou.com.read_sensitive'),
    ('hou.com.manage'),
    ('hou.com.approve')
) as p(permission)
where r.code in ('ADMIN', 'BGH', 'ADMISSION_HEAD')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('hou.com.read_sensitive'),
    ('hou.com.manage')
) as p(permission)
where r.code = 'ACCOUNTING'
on conflict (role_id, permission) do nothing;

create or replace function public.can_read_hou_commission()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.has_permission('hou.com.read_sensitive')
$$;

create or replace function public.can_manage_hou_commission()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.has_permission('hou.com.manage')
$$;

create or replace function public.can_approve_hou_commission()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.has_permission('hou.com.approve')
$$;

create or replace function public.can_read_hou_commission_strategy()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or public.current_user_role_code() in ('ADMIN', 'BGH', 'ADMISSION_HEAD')
$$;

create table if not exists public.hou_commission_policies (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.hou_programs(id),
  policy_code text not null unique,
  policy_name text not null,
  station_code text not null default 'HEU',
  effective_from date not null,
  effective_to date,
  approval_document_no text,
  approval_document_date date,
  source_document text,
  payment_day_of_month int not null default 10,
  settlement_cutoff_rule text not null,
  tax_withholding_percent numeric(5,2),
  dropout_risk_rule text,
  breakeven_rule text,
  notes text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hou_commission_policies_valid_dates check (
    effective_to is null or effective_to >= effective_from
  ),
  constraint hou_commission_policies_payment_day check (
    payment_day_of_month between 1 and 31
  )
);

create table if not exists public.hou_commission_policy_lines (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.hou_commission_policies(id) on delete cascade,
  classification text not null check (classification in ('L8A', 'L8B')),
  component_code text not null,
  component_name text not null,
  receiver_type text not null check (
    receiver_type in ('CTV', 'EMPLOYEE', 'ORGANIZATION', 'PARTNER', 'OTHER')
  ),
  payer_source text not null check (
    payer_source in ('HEU_INTERNAL', 'HOU_SUPPORT', 'PARTNER_SUPPORT', 'OTHER')
  ),
  gross_amount_vnd int not null,
  tax_withholding_percent numeric(5,2),
  is_taxable boolean not null default true,
  condition_note text,
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (policy_id, classification, component_code),
  constraint hou_commission_policy_lines_amount_positive check (
    gross_amount_vnd >= 0
  )
);

create table if not exists public.hou_commission_eligibility_rules (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.hou_commission_policies(id) on delete cascade,
  rule_code text not null,
  rule_name text not null,
  rule_description text not null,
  blocking_level text not null check (blocking_level in ('BLOCK', 'WARN')),
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (policy_id, rule_code)
);

create table if not exists public.hou_commission_cycles (
  id uuid primary key default gen_random_uuid(),
  station_code text not null default 'HEU',
  cycle_code text not null unique,
  cycle_name text not null,
  period_start date not null,
  period_end date not null,
  payment_due_date date,
  status text not null default 'DRAFT' check (
    status in ('DRAFT', 'REVIEWING', 'APPROVED', 'PAID', 'CANCELLED')
  ),
  approved_by uuid references public.users_profile(id),
  approved_at timestamptz,
  paid_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (station_code, period_start, period_end),
  constraint hou_commission_cycles_valid_period check (period_end >= period_start)
);

create table if not exists public.hou_commission_payees (
  id uuid primary key default gen_random_uuid(),
  payee_type text not null check (
    payee_type in ('CTV', 'EMPLOYEE', 'ORGANIZATION', 'PARTNER', 'OTHER')
  ),
  partner_id uuid references public.partners(id),
  user_id uuid references public.users_profile(id),
  payee_code text,
  payee_name text not null,
  tax_code text,
  bank_account_name text,
  bank_account_number text,
  bank_name text,
  identity_note text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hou_commission_payees_has_identity check (
    partner_id is not null
    or user_id is not null
    or nullif(trim(coalesce(payee_code, '')), '') is not null
  )
);

create unique index if not exists uniq_hou_commission_payees_partner
on public.hou_commission_payees(partner_id)
where partner_id is not null;

create unique index if not exists uniq_hou_commission_payees_user
on public.hou_commission_payees(user_id)
where user_id is not null;

create unique index if not exists uniq_hou_commission_payees_code
on public.hou_commission_payees(payee_code)
where payee_code is not null;

create table if not exists public.hou_commission_claims (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  policy_id uuid not null references public.hou_commission_policies(id),
  cycle_id uuid references public.hou_commission_cycles(id),
  payee_id uuid references public.hou_commission_payees(id),
  program_id uuid references public.hou_programs(id),
  major_id uuid references public.hou_majors(id),
  station_code text not null default 'HEU',
  classification text not null check (classification in ('L8A', 'L8B')),
  hou_student_code text,
  student_name text not null,
  student_phone text,
  admission_decision_no text,
  admission_decision_date date,
  recognition_decision_no text,
  recognition_decision_date date,
  first_tuition_amount_vnd int,
  first_tuition_paid_at date,
  tuition_account text,
  hou_input_account text,
  commission_base_date date not null,
  claim_status text not null default 'DRAFT' check (
    claim_status in (
      'DRAFT',
      'ELIGIBLE',
      'RISK_HOLD',
      'REVIEWING',
      'APPROVED',
      'REJECTED',
      'PAID',
      'CANCELLED'
    )
  ),
  dropout_risk_level text not null default 'LOW' check (
    dropout_risk_level in ('LOW', 'MEDIUM', 'HIGH', 'LEFT')
  ),
  dropout_risk_note text,
  breakeven_status text not null default 'NOT_CALCULATED' check (
    breakeven_status in (
      'NOT_CALCULATED',
      'BELOW_BREAKEVEN',
      'AT_BREAKEVEN',
      'ABOVE_BREAKEVEN',
      'RISK'
    )
  ),
  breakeven_note text,
  is_debt_offset boolean not null default false,
  debt_offset_amount_vnd int not null default 0,
  approved_by uuid references public.users_profile(id),
  approved_at timestamptz,
  paid_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hou_commission_claims_tuition_positive check (
    first_tuition_amount_vnd is null or first_tuition_amount_vnd >= 0
  ),
  constraint hou_commission_claims_debt_offset_positive check (
    debt_offset_amount_vnd >= 0
  ),
  constraint hou_commission_claims_approved_requires_user check (
    claim_status not in ('APPROVED', 'PAID') or approved_by is not null
  )
);

create unique index if not exists uniq_hou_commission_claims_lead_policy_active
on public.hou_commission_claims(lead_id, policy_id)
where lead_id is not null and claim_status <> 'CANCELLED';

create unique index if not exists uniq_hou_commission_claims_student_policy_active
on public.hou_commission_claims(policy_id, station_code, hou_student_code)
where hou_student_code is not null and claim_status <> 'CANCELLED';

create table if not exists public.hou_commission_claim_lines (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.hou_commission_claims(id) on delete cascade,
  policy_line_id uuid references public.hou_commission_policy_lines(id),
  component_code text not null,
  component_name text not null,
  receiver_type text not null check (
    receiver_type in ('CTV', 'EMPLOYEE', 'ORGANIZATION', 'PARTNER', 'OTHER')
  ),
  payer_source text not null check (
    payer_source in ('HEU_INTERNAL', 'HOU_SUPPORT', 'PARTNER_SUPPORT', 'OTHER')
  ),
  gross_amount_vnd int not null,
  tax_withheld_vnd int not null default 0,
  debt_offset_amount_vnd int not null default 0,
  net_amount_vnd int not null,
  line_status text not null default 'DRAFT' check (
    line_status in (
      'DRAFT',
      'REVIEWING',
      'APPROVED',
      'PAYMENT_REQUESTED',
      'PAID',
      'CANCELLED'
    )
  ),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (claim_id, component_code),
  constraint hou_commission_claim_lines_amounts_valid check (
    gross_amount_vnd >= 0
    and tax_withheld_vnd >= 0
    and debt_offset_amount_vnd >= 0
    and net_amount_vnd >= 0
    and net_amount_vnd = gross_amount_vnd - tax_withheld_vnd - debt_offset_amount_vnd
  )
);

create table if not exists public.hou_commission_payment_batches (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid references public.hou_commission_cycles(id),
  payment_batch_code text not null unique,
  payment_batch_name text not null,
  payment_method text not null check (
    payment_method in (
      'BANK_TRANSFER',
      'CASH',
      'OFFSET_DEBT',
      'INTERNAL_TRANSFER',
      'OTHER'
    )
  ),
  status text not null default 'DRAFT' check (
    status in ('DRAFT', 'REVIEWING', 'APPROVED', 'PAID', 'CANCELLED')
  ),
  requested_by uuid references public.users_profile(id),
  requested_at timestamptz,
  approved_by uuid references public.users_profile(id),
  approved_at timestamptz,
  paid_by uuid references public.users_profile(id),
  paid_at timestamptz,
  accounting_voucher_no text,
  total_gross_vnd int not null default 0,
  total_tax_withheld_vnd int not null default 0,
  total_debt_offset_vnd int not null default 0,
  total_net_vnd int not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hou_commission_payment_batches_totals_valid check (
    total_gross_vnd >= 0
    and total_tax_withheld_vnd >= 0
    and total_debt_offset_vnd >= 0
    and total_net_vnd >= 0
  )
);

create table if not exists public.hou_commission_payment_lines (
  id uuid primary key default gen_random_uuid(),
  payment_batch_id uuid not null references public.hou_commission_payment_batches(id) on delete cascade,
  claim_line_id uuid not null references public.hou_commission_claim_lines(id),
  paid_amount_vnd int not null,
  payment_method text not null check (
    payment_method in (
      'BANK_TRANSFER',
      'CASH',
      'OFFSET_DEBT',
      'INTERNAL_TRANSFER',
      'OTHER'
    )
  ),
  paid_at timestamptz,
  accounting_voucher_no text,
  status text not null default 'DRAFT' check (
    status in ('DRAFT', 'APPROVED', 'PAID', 'CANCELLED')
  ),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hou_commission_payment_lines_amount_positive check (
    paid_amount_vnd >= 0
  )
);

create unique index if not exists uniq_hou_commission_active_payment_per_line
on public.hou_commission_payment_lines(claim_line_id)
where status <> 'CANCELLED';

create table if not exists public.hou_tuition_credit_rates (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.hou_programs(id),
  major_id uuid references public.hou_majors(id),
  rate_code text not null unique,
  rate_name text not null,
  tuition_per_credit_vnd int not null,
  effective_from date not null,
  effective_to date,
  source_document text,
  note text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hou_tuition_credit_rates_amount_positive check (
    tuition_per_credit_vnd > 0
  ),
  constraint hou_tuition_credit_rates_valid_dates check (
    effective_to is null or effective_to >= effective_from
  )
);

create table if not exists public.hou_revenue_share_versions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.hou_programs(id),
  share_code text not null unique,
  share_name text not null,
  heu_share_percent numeric(5,2) not null,
  hou_share_percent numeric(5,2) not null,
  effective_from date not null,
  effective_to date,
  source_document text,
  note text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hou_revenue_share_versions_percent_valid check (
    heu_share_percent >= 0
    and hou_share_percent >= 0
    and heu_share_percent + hou_share_percent = 100
  ),
  constraint hou_revenue_share_versions_valid_dates check (
    effective_to is null or effective_to >= effective_from
  )
);

create table if not exists public.hou_commission_breakeven_checks (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.hou_commission_claims(id) on delete cascade,
  tuition_rate_id uuid references public.hou_tuition_credit_rates(id),
  revenue_share_id uuid references public.hou_revenue_share_versions(id),
  credit_count numeric(6,2),
  tuition_per_credit_vnd int,
  expected_tuition_vnd int,
  heu_share_percent numeric(5,2),
  expected_heu_revenue_vnd int,
  total_commission_cost_vnd int not null default 0,
  other_cost_vnd int not null default 0,
  breakeven_margin_vnd int,
  result text not null default 'NOT_CALCULATED' check (
    result in (
      'NOT_CALCULATED',
      'BELOW_BREAKEVEN',
      'AT_BREAKEVEN',
      'ABOVE_BREAKEVEN',
      'RISK'
    )
  ),
  checked_by uuid references public.users_profile(id),
  checked_at timestamptz,
  note text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hou_commission_breakeven_amounts_valid check (
    (credit_count is null or credit_count >= 0)
    and (tuition_per_credit_vnd is null or tuition_per_credit_vnd >= 0)
    and (expected_tuition_vnd is null or expected_tuition_vnd >= 0)
    and (heu_share_percent is null or heu_share_percent >= 0)
    and (expected_heu_revenue_vnd is null or expected_heu_revenue_vnd >= 0)
    and total_commission_cost_vnd >= 0
    and other_cost_vnd >= 0
  )
);

create unique index if not exists uniq_hou_commission_breakeven_claim_active
on public.hou_commission_breakeven_checks(claim_id)
where status = 'ACTIVE';

create index if not exists idx_hou_commission_policy_lines_policy_id
on public.hou_commission_policy_lines(policy_id);

create index if not exists idx_hou_commission_rules_policy_id
on public.hou_commission_eligibility_rules(policy_id);

create index if not exists idx_hou_commission_claims_policy_id
on public.hou_commission_claims(policy_id);

create index if not exists idx_hou_commission_claims_cycle_id
on public.hou_commission_claims(cycle_id);

create index if not exists idx_hou_commission_claims_payee_id
on public.hou_commission_claims(payee_id);

create index if not exists idx_hou_commission_claim_lines_claim_id
on public.hou_commission_claim_lines(claim_id);

create index if not exists idx_hou_commission_payment_lines_batch_id
on public.hou_commission_payment_lines(payment_batch_id);

create index if not exists idx_hou_tuition_credit_rates_program_id
on public.hou_tuition_credit_rates(program_id);

create index if not exists idx_hou_tuition_credit_rates_major_id
on public.hou_tuition_credit_rates(major_id);

create index if not exists idx_hou_revenue_share_versions_program_id
on public.hou_revenue_share_versions(program_id);

alter table public.hou_commission_policies enable row level security;
alter table public.hou_commission_policy_lines enable row level security;
alter table public.hou_commission_eligibility_rules enable row level security;
alter table public.hou_commission_cycles enable row level security;
alter table public.hou_commission_payees enable row level security;
alter table public.hou_commission_claims enable row level security;
alter table public.hou_commission_claim_lines enable row level security;
alter table public.hou_commission_payment_batches enable row level security;
alter table public.hou_commission_payment_lines enable row level security;
alter table public.hou_tuition_credit_rates enable row level security;
alter table public.hou_revenue_share_versions enable row level security;
alter table public.hou_commission_breakeven_checks enable row level security;

drop policy if exists "hou_commission_policies_select_sensitive" on public.hou_commission_policies;
create policy "hou_commission_policies_select_sensitive"
on public.hou_commission_policies for select
to authenticated
using (public.can_read_hou_commission());

drop policy if exists "hou_commission_policies_manage" on public.hou_commission_policies;
create policy "hou_commission_policies_manage"
on public.hou_commission_policies for all
to authenticated
using (public.can_manage_hou_commission())
with check (public.can_manage_hou_commission());

drop policy if exists "hou_commission_policy_lines_select_sensitive" on public.hou_commission_policy_lines;
create policy "hou_commission_policy_lines_select_sensitive"
on public.hou_commission_policy_lines for select
to authenticated
using (public.can_read_hou_commission());

drop policy if exists "hou_commission_policy_lines_manage" on public.hou_commission_policy_lines;
create policy "hou_commission_policy_lines_manage"
on public.hou_commission_policy_lines for all
to authenticated
using (public.can_manage_hou_commission())
with check (public.can_manage_hou_commission());

drop policy if exists "hou_commission_rules_select_sensitive" on public.hou_commission_eligibility_rules;
create policy "hou_commission_rules_select_sensitive"
on public.hou_commission_eligibility_rules for select
to authenticated
using (public.can_read_hou_commission());

drop policy if exists "hou_commission_rules_manage" on public.hou_commission_eligibility_rules;
create policy "hou_commission_rules_manage"
on public.hou_commission_eligibility_rules for all
to authenticated
using (public.can_manage_hou_commission())
with check (public.can_manage_hou_commission());

drop policy if exists "hou_commission_cycles_select_sensitive" on public.hou_commission_cycles;
create policy "hou_commission_cycles_select_sensitive"
on public.hou_commission_cycles for select
to authenticated
using (public.can_read_hou_commission());

drop policy if exists "hou_commission_cycles_manage" on public.hou_commission_cycles;
create policy "hou_commission_cycles_manage"
on public.hou_commission_cycles for all
to authenticated
using (public.can_manage_hou_commission())
with check (public.can_manage_hou_commission());

drop policy if exists "hou_commission_payees_select_sensitive" on public.hou_commission_payees;
create policy "hou_commission_payees_select_sensitive"
on public.hou_commission_payees for select
to authenticated
using (public.can_read_hou_commission());

drop policy if exists "hou_commission_payees_manage" on public.hou_commission_payees;
create policy "hou_commission_payees_manage"
on public.hou_commission_payees for all
to authenticated
using (public.can_manage_hou_commission())
with check (public.can_manage_hou_commission());

drop policy if exists "hou_commission_claims_select_sensitive" on public.hou_commission_claims;
create policy "hou_commission_claims_select_sensitive"
on public.hou_commission_claims for select
to authenticated
using (public.can_read_hou_commission());

drop policy if exists "hou_commission_claims_manage" on public.hou_commission_claims;
create policy "hou_commission_claims_manage"
on public.hou_commission_claims for all
to authenticated
using (public.can_manage_hou_commission())
with check (public.can_manage_hou_commission());

drop policy if exists "hou_commission_claim_lines_select_sensitive" on public.hou_commission_claim_lines;
create policy "hou_commission_claim_lines_select_sensitive"
on public.hou_commission_claim_lines for select
to authenticated
using (public.can_read_hou_commission());

drop policy if exists "hou_commission_claim_lines_manage" on public.hou_commission_claim_lines;
create policy "hou_commission_claim_lines_manage"
on public.hou_commission_claim_lines for all
to authenticated
using (public.can_manage_hou_commission())
with check (public.can_manage_hou_commission());

drop policy if exists "hou_commission_payment_batches_select_sensitive" on public.hou_commission_payment_batches;
create policy "hou_commission_payment_batches_select_sensitive"
on public.hou_commission_payment_batches for select
to authenticated
using (public.can_read_hou_commission());

drop policy if exists "hou_commission_payment_batches_manage" on public.hou_commission_payment_batches;
create policy "hou_commission_payment_batches_manage"
on public.hou_commission_payment_batches for all
to authenticated
using (public.can_manage_hou_commission())
with check (public.can_manage_hou_commission());

drop policy if exists "hou_commission_payment_lines_select_sensitive" on public.hou_commission_payment_lines;
create policy "hou_commission_payment_lines_select_sensitive"
on public.hou_commission_payment_lines for select
to authenticated
using (public.can_read_hou_commission());

drop policy if exists "hou_commission_payment_lines_manage" on public.hou_commission_payment_lines;
create policy "hou_commission_payment_lines_manage"
on public.hou_commission_payment_lines for all
to authenticated
using (public.can_manage_hou_commission())
with check (public.can_manage_hou_commission());

drop policy if exists "hou_tuition_credit_rates_select_sensitive" on public.hou_tuition_credit_rates;
create policy "hou_tuition_credit_rates_select_sensitive"
on public.hou_tuition_credit_rates for select
to authenticated
using (public.can_read_hou_commission());

drop policy if exists "hou_tuition_credit_rates_manage" on public.hou_tuition_credit_rates;
create policy "hou_tuition_credit_rates_manage"
on public.hou_tuition_credit_rates for all
to authenticated
using (public.can_manage_hou_commission())
with check (public.can_manage_hou_commission());

drop policy if exists "hou_revenue_share_versions_select_strategy" on public.hou_revenue_share_versions;
create policy "hou_revenue_share_versions_select_strategy"
on public.hou_revenue_share_versions for select
to authenticated
using (public.can_read_hou_commission_strategy());

drop policy if exists "hou_revenue_share_versions_manage" on public.hou_revenue_share_versions;
create policy "hou_revenue_share_versions_manage"
on public.hou_revenue_share_versions for all
to authenticated
using (public.can_read_hou_commission_strategy())
with check (public.can_read_hou_commission_strategy());

drop policy if exists "hou_commission_breakeven_checks_select_strategy" on public.hou_commission_breakeven_checks;
create policy "hou_commission_breakeven_checks_select_strategy"
on public.hou_commission_breakeven_checks for select
to authenticated
using (public.can_read_hou_commission_strategy());

drop policy if exists "hou_commission_breakeven_checks_manage" on public.hou_commission_breakeven_checks;
create policy "hou_commission_breakeven_checks_manage"
on public.hou_commission_breakeven_checks for all
to authenticated
using (public.can_read_hou_commission_strategy())
with check (public.can_read_hou_commission_strategy());

drop trigger if exists trg_hou_commission_policies_updated_at on public.hou_commission_policies;
create trigger trg_hou_commission_policies_updated_at
before update on public.hou_commission_policies
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_commission_policy_lines_updated_at on public.hou_commission_policy_lines;
create trigger trg_hou_commission_policy_lines_updated_at
before update on public.hou_commission_policy_lines
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_commission_rules_updated_at on public.hou_commission_eligibility_rules;
create trigger trg_hou_commission_rules_updated_at
before update on public.hou_commission_eligibility_rules
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_commission_cycles_updated_at on public.hou_commission_cycles;
create trigger trg_hou_commission_cycles_updated_at
before update on public.hou_commission_cycles
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_commission_payees_updated_at on public.hou_commission_payees;
create trigger trg_hou_commission_payees_updated_at
before update on public.hou_commission_payees
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_commission_claims_updated_at on public.hou_commission_claims;
create trigger trg_hou_commission_claims_updated_at
before update on public.hou_commission_claims
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_commission_claim_lines_updated_at on public.hou_commission_claim_lines;
create trigger trg_hou_commission_claim_lines_updated_at
before update on public.hou_commission_claim_lines
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_commission_payment_batches_updated_at on public.hou_commission_payment_batches;
create trigger trg_hou_commission_payment_batches_updated_at
before update on public.hou_commission_payment_batches
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_commission_payment_lines_updated_at on public.hou_commission_payment_lines;
create trigger trg_hou_commission_payment_lines_updated_at
before update on public.hou_commission_payment_lines
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_tuition_credit_rates_updated_at on public.hou_tuition_credit_rates;
create trigger trg_hou_tuition_credit_rates_updated_at
before update on public.hou_tuition_credit_rates
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_revenue_share_versions_updated_at on public.hou_revenue_share_versions;
create trigger trg_hou_revenue_share_versions_updated_at
before update on public.hou_revenue_share_versions
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_commission_breakeven_checks_updated_at on public.hou_commission_breakeven_checks;
create trigger trg_hou_commission_breakeven_checks_updated_at
before update on public.hou_commission_breakeven_checks
for each row execute function public.set_updated_at();

drop trigger if exists trg_hou_commission_policies_audit on public.hou_commission_policies;
create trigger trg_hou_commission_policies_audit
after insert or update or delete on public.hou_commission_policies
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_commission_policy_lines_audit on public.hou_commission_policy_lines;
create trigger trg_hou_commission_policy_lines_audit
after insert or update or delete on public.hou_commission_policy_lines
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_commission_rules_audit on public.hou_commission_eligibility_rules;
create trigger trg_hou_commission_rules_audit
after insert or update or delete on public.hou_commission_eligibility_rules
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_commission_cycles_audit on public.hou_commission_cycles;
create trigger trg_hou_commission_cycles_audit
after insert or update or delete on public.hou_commission_cycles
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_commission_payees_audit on public.hou_commission_payees;
create trigger trg_hou_commission_payees_audit
after insert or update or delete on public.hou_commission_payees
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_commission_claims_audit on public.hou_commission_claims;
create trigger trg_hou_commission_claims_audit
after insert or update or delete on public.hou_commission_claims
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_commission_claim_lines_audit on public.hou_commission_claim_lines;
create trigger trg_hou_commission_claim_lines_audit
after insert or update or delete on public.hou_commission_claim_lines
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_commission_payment_batches_audit on public.hou_commission_payment_batches;
create trigger trg_hou_commission_payment_batches_audit
after insert or update or delete on public.hou_commission_payment_batches
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_commission_payment_lines_audit on public.hou_commission_payment_lines;
create trigger trg_hou_commission_payment_lines_audit
after insert or update or delete on public.hou_commission_payment_lines
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_tuition_credit_rates_audit on public.hou_tuition_credit_rates;
create trigger trg_hou_tuition_credit_rates_audit
after insert or update or delete on public.hou_tuition_credit_rates
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_revenue_share_versions_audit on public.hou_revenue_share_versions;
create trigger trg_hou_revenue_share_versions_audit
after insert or update or delete on public.hou_revenue_share_versions
for each row execute function public.write_audit_log();

drop trigger if exists trg_hou_commission_breakeven_checks_audit on public.hou_commission_breakeven_checks;
create trigger trg_hou_commission_breakeven_checks_audit
after insert or update or delete on public.hou_commission_breakeven_checks
for each row execute function public.write_audit_log();

insert into public.hou_commission_policies (
  program_id,
  policy_code,
  policy_name,
  station_code,
  effective_from,
  approval_document_no,
  approval_document_date,
  source_document,
  payment_day_of_month,
  settlement_cutoff_rule,
  tax_withholding_percent,
  dropout_risk_rule,
  breakeven_rule,
  notes
)
select
  p.id,
  'HEU_HOU_COM_2025_06_01',
  'Cơ chế COM CTV tuyển sinh HOU - HEU từ 01/06/2025',
  'HEU',
  '2025-06-01',
  '/QĐ-CN&KTĐN',
  '2025-06-01',
  'HEU_Cơ chế COM TUYỂN SINH HOU 2025 TỪ 1_6_2025.docx',
  10,
  'Chốt số lượng sinh viên đến hết tháng trước; thanh toán vào ngày 10 hàng tháng sau khi đủ hồ sơ và phê duyệt.',
  10.00,
  'Cảnh báo khi sinh viên có rủi ro bỏ học, chưa học ổn định, chưa đủ quyết định hoặc chưa xác nhận học phí kỳ I. Có thể giữ thanh toán ở trạng thái RISK_HOLD.',
  'Theo dõi doanh thu học phí theo tín chỉ, tỷ lệ HEU được nhận theo phiên bản hợp tác có hiệu lực, và tổng COM/chi phí để cảnh báo dưới điểm hòa vốn. Tỷ lệ hợp tác là dữ liệu nhạy cảm và có thể thay đổi theo hợp đồng từng thời kỳ.',
  'L8A do HEU nhập hệ thống HOU. L8B do CTV nhập hệ thống HOU. Mức COM có thể thay đổi theo chính sách hiệu lực từng thời điểm.'
from public.hou_programs p
where p.program_code = 'HOU_DISTANCE_UNIVERSITY'
on conflict (policy_code) do update set
  program_id = excluded.program_id,
  policy_name = excluded.policy_name,
  station_code = excluded.station_code,
  effective_from = excluded.effective_from,
  approval_document_no = excluded.approval_document_no,
  approval_document_date = excluded.approval_document_date,
  source_document = excluded.source_document,
  payment_day_of_month = excluded.payment_day_of_month,
  settlement_cutoff_rule = excluded.settlement_cutoff_rule,
  tax_withholding_percent = excluded.tax_withholding_percent,
  dropout_risk_rule = excluded.dropout_risk_rule,
  breakeven_rule = excluded.breakeven_rule,
  notes = excluded.notes,
  status = 'ACTIVE',
  updated_at = now();

insert into public.hou_commission_policy_lines (
  policy_id,
  classification,
  component_code,
  component_name,
  receiver_type,
  payer_source,
  gross_amount_vnd,
  tax_withholding_percent,
  is_taxable,
  condition_note,
  sort_order
)
select policy.id, v.classification, v.component_code, v.component_name,
       v.receiver_type, v.payer_source, v.gross_amount_vnd,
       v.tax_withholding_percent, v.is_taxable, v.condition_note, v.sort_order
from public.hou_commission_policies policy
cross join (
  values
    (
      'L8A',
      'COM1',
      'COM tuyển sinh L8A',
      'CTV',
      'HEU_INTERNAL',
      2500000,
      10.00,
      true,
      'Sinh viên có quyết định trúng tuyển và đã nộp học phí tạm thu học kỳ 1; tài khoản nhập hệ thống HOU là HEU.',
      10
    ),
    (
      'L8B',
      'COM1',
      'COM tuyển sinh L8B - phần 1',
      'CTV',
      'HEU_INTERNAL',
      2500000,
      10.00,
      true,
      'Sinh viên có quyết định trúng tuyển và đã nộp học phí tạm thu học kỳ 1; tài khoản nhập hệ thống HOU là CTV.',
      20
    ),
    (
      'L8B',
      'COM2',
      'COM tuyển sinh L8B - phần HOU hỗ trợ',
      'CTV',
      'HOU_SUPPORT',
      540000,
      10.00,
      true,
      'Khoản kinh phí tuyển sinh HOU chi cho HEU, HEU chi trả lại CTV sau khi trừ thuế TNCN theo quy định.',
      30
    )
) as v(
  classification,
  component_code,
  component_name,
  receiver_type,
  payer_source,
  gross_amount_vnd,
  tax_withholding_percent,
  is_taxable,
  condition_note,
  sort_order
)
where policy.policy_code = 'HEU_HOU_COM_2025_06_01'
on conflict (policy_id, classification, component_code) do update set
  component_name = excluded.component_name,
  receiver_type = excluded.receiver_type,
  payer_source = excluded.payer_source,
  gross_amount_vnd = excluded.gross_amount_vnd,
  tax_withholding_percent = excluded.tax_withholding_percent,
  is_taxable = excluded.is_taxable,
  condition_note = excluded.condition_note,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

insert into public.hou_commission_eligibility_rules (
  policy_id,
  rule_code,
  rule_name,
  rule_description,
  blocking_level,
  sort_order
)
select policy.id, v.rule_code, v.rule_name, v.rule_description,
       v.blocking_level, v.sort_order
from public.hou_commission_policies policy
cross join (
  values
    (
      'ADMISSION_DECISION_REQUIRED',
      'Có quyết định trúng tuyển',
      'Sinh viên phải có quyết định trúng tuyển hoặc quyết định tương đương của HOU.',
      'BLOCK',
      10
    ),
    (
      'FIRST_TUITION_REQUIRED',
      'Đã nộp học phí kỳ I',
      'Sinh viên phải nộp học phí tạm thu học kỳ 1 hoặc nghĩa vụ tài chính kỳ đầu.',
      'BLOCK',
      20
    ),
    (
      'HOU_INPUT_ACCOUNT_REQUIRED',
      'Xác định tài khoản nhập hệ thống HOU',
      'Phải xác định L8A/L8B dựa trên tài khoản nhập hệ thống HOU để tính đúng COM.',
      'BLOCK',
      30
    ),
    (
      'NO_DUPLICATE_COMMISSION',
      'Không chi COM hai lần',
      'Mỗi sinh viên, chính sách và thành phần COM chỉ được có một dòng thanh toán còn hiệu lực.',
      'BLOCK',
      40
    ),
    (
      'DROPOUT_RISK_REVIEW',
      'Soát rủi ro bỏ học',
      'Nếu sinh viên có dấu hiệu bỏ học hoặc hoàn hủy học phí, giữ hồ sơ ở RISK_HOLD để kế toán/tuyển sinh rà soát.',
      'WARN',
      50
    ),
    (
      'BREAKEVEN_REVIEW',
      'Soát điểm hòa vốn',
      'Cảnh báo khi học phí thực thu theo tín chỉ và tỷ lệ HEU được nhận không đủ bù COM/chi phí liên quan.',
      'WARN',
      60
    )
) as v(rule_code, rule_name, rule_description, blocking_level, sort_order)
where policy.policy_code = 'HEU_HOU_COM_2025_06_01'
on conflict (policy_id, rule_code) do update set
  rule_name = excluded.rule_name,
  rule_description = excluded.rule_description,
  blocking_level = excluded.blocking_level,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();

insert into public.hou_revenue_share_versions (
  program_id,
  share_code,
  share_name,
  heu_share_percent,
  hou_share_percent,
  effective_from,
  effective_to,
  source_document,
  note
)
select
  p.id,
  'HOU_HEU_SHARE_2141_2024',
  'Tỷ lệ hợp tác đào tạo HOU - HEU theo HĐ 2141/2024',
  28.00,
  72.00,
  '2024-06-05',
  '2028-06-04',
  'Hợp đồng 2141/2024/HĐ-ĐHM ngày 05/06/2024',
  'Dữ liệu chiến lược nhạy cảm. Chỉ dùng để tính điểm hòa vốn và báo cáo quản trị, không hiển thị cho CTV hoặc người dùng thường.'
from public.hou_programs p
where p.program_code = 'HOU_DISTANCE_UNIVERSITY'
on conflict (share_code) do update set
  program_id = excluded.program_id,
  share_name = excluded.share_name,
  heu_share_percent = excluded.heu_share_percent,
  hou_share_percent = excluded.hou_share_percent,
  effective_from = excluded.effective_from,
  effective_to = excluded.effective_to,
  source_document = excluded.source_document,
  note = excluded.note,
  status = 'ACTIVE',
  updated_at = now();
