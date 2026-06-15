-- Step 34B - Link admission flow to leads
-- Run after step34a_admission_flow_master.sql.

alter table public.leads
add column if not exists flow_id uuid references public.admission_flows(id);

create index if not exists idx_leads_flow_id
on public.leads(flow_id)
where is_deleted = false;

-- Best-effort backfill for existing leads based on lead source.
-- You can still edit individual leads later if the guessed flow is wrong.
update public.leads l
set flow_id = f.id,
    updated_at = now()
from public.lead_sources s
join public.admission_flows f
  on f.flow_code = case
    when s.source_code in ('FB_ADS', 'TIKTOK', 'ZALO', 'WEBSITE') then 'ONLINE_MARKETING'
    when s.source_code in ('HOTLINE', 'EVENT') then 'DIRECT_ADMISSION'
    when s.source_code = 'THCS' then 'THCS_THPT'
    when s.source_code = 'TTGDTX' then 'TTGDTX'
    when s.source_code = 'CTV' then 'INDIVIDUAL_CTV'
    when s.source_code = 'PARTNER' then 'BUSINESS_PARTNER'
    else 'DIRECT_ADMISSION'
  end
where l.source_id = s.id
  and l.flow_id is null
  and l.is_deleted = false;
