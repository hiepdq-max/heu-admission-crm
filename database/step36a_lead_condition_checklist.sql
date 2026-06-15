-- Step 36A - Lead condition checklist for enrollment and COM.
-- Run after step35g_hou_evidence_files.sql.
--
-- Purpose:
-- - Admission and COM conditions are tracked separately from document files.
-- - ENROLLMENT and COM templates are seeded as mandatory business conditions.
-- - OTHER templates can be marked required/not required per lead.

create table if not exists public.lead_condition_templates (
  id uuid primary key default gen_random_uuid(),
  condition_scope text not null check (
    condition_scope in ('ENROLLMENT', 'COM', 'OTHER')
  ),
  condition_code text not null unique,
  condition_name text not null,
  condition_description text,
  is_required_default boolean not null default false,
  sort_order int not null default 0,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_condition_checks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  condition_template_id uuid references public.lead_condition_templates(id),
  condition_scope text not null check (
    condition_scope in ('ENROLLMENT', 'COM', 'OTHER')
  ),
  condition_code text not null,
  condition_name text not null,
  is_required boolean not null default false,
  is_checked boolean not null default false,
  note text,
  checked_by uuid references public.users_profile(id),
  checked_at timestamptz,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id, condition_code)
);

create index if not exists idx_lead_condition_checks_lead_id
on public.lead_condition_checks(lead_id);

create index if not exists idx_lead_condition_checks_scope
on public.lead_condition_checks(condition_scope);

alter table public.lead_condition_templates enable row level security;
alter table public.lead_condition_checks enable row level security;

drop policy if exists "lead_condition_templates_select_authenticated"
on public.lead_condition_templates;
create policy "lead_condition_templates_select_authenticated"
on public.lead_condition_templates for select
to authenticated
using (status = 'ACTIVE' or public.is_admin());

drop policy if exists "lead_condition_templates_admin_write"
on public.lead_condition_templates;
create policy "lead_condition_templates_admin_write"
on public.lead_condition_templates for all
to authenticated
using (public.is_admin() or public.has_permission('settings.manage'))
with check (public.is_admin() or public.has_permission('settings.manage'));

drop policy if exists "lead_condition_checks_select_lead_access"
on public.lead_condition_checks;
create policy "lead_condition_checks_select_lead_access"
on public.lead_condition_checks for select
to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_condition_checks.lead_id
      and public.can_read_lead(l.assigned_to, l.created_by)
  )
);

drop policy if exists "lead_condition_checks_write_lead_access"
on public.lead_condition_checks;
create policy "lead_condition_checks_write_lead_access"
on public.lead_condition_checks for all
to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_condition_checks.lead_id
      and public.can_write_lead(l.assigned_to, l.created_by)
  )
)
with check (
  exists (
    select 1
    from public.leads l
    where l.id = lead_condition_checks.lead_id
      and public.can_write_lead(l.assigned_to, l.created_by)
  )
);

drop trigger if exists trg_lead_condition_templates_updated_at
on public.lead_condition_templates;
create trigger trg_lead_condition_templates_updated_at
before update on public.lead_condition_templates
for each row execute function public.set_updated_at();

drop trigger if exists trg_lead_condition_checks_updated_at
on public.lead_condition_checks;
create trigger trg_lead_condition_checks_updated_at
before update on public.lead_condition_checks
for each row execute function public.set_updated_at();

drop trigger if exists trg_lead_condition_templates_audit
on public.lead_condition_templates;
create trigger trg_lead_condition_templates_audit
after insert or update or delete on public.lead_condition_templates
for each row execute function public.write_audit_log();

drop trigger if exists trg_lead_condition_checks_audit
on public.lead_condition_checks;
create trigger trg_lead_condition_checks_audit
after insert or update or delete on public.lead_condition_checks
for each row execute function public.write_audit_log();

insert into public.lead_condition_templates (
  condition_scope,
  condition_code,
  condition_name,
  condition_description,
  is_required_default,
  sort_order
)
values
  (
    'ENROLLMENT',
    'ENROLLMENT_PROGRAM_CONFIRMED',
    'Xác nhận hệ/ngành/địa điểm học',
    'Lead phải được gắn đúng hệ đào tạo, ngành, địa điểm học và bước xử lý trước khi chốt nhập học.',
    true,
    10
  ),
  (
    'ENROLLMENT',
    'ENROLLMENT_REQUIRED_DOCUMENTS_READY',
    'Đủ hồ sơ nhập học bắt buộc',
    'Các giấy tờ bắt buộc phải ở trạng thái Đã nhận hoặc Đã kiểm tra.',
    true,
    20
  ),
  (
    'ENROLLMENT',
    'ENROLLMENT_FIRST_TUITION_CONFIRMED',
    'Xác nhận học phí/khoản thu đầu',
    'Đã xác nhận học phí kỳ đầu hoặc khoản thu bắt buộc theo chương trình.',
    true,
    30
  ),
  (
    'ENROLLMENT',
    'ENROLLMENT_NO_DUPLICATE_OR_BLOCKING_DEBT',
    'Không trùng hồ sơ, không vướng công nợ chặn',
    'Đã rà soát trùng học viên, tái nhập học, chuyển ngành/chuyển lớp và công nợ chặn nhập học.',
    true,
    40
  ),
  (
    'COM',
    'COM_SOURCE_PAYEE_CONFIRMED',
    'Xác nhận nguồn và người nhận COM',
    'Nguồn lead, CTV/đối tác/nhân viên nhận COM phải được xác định rõ trước khi tạo đề nghị COM.',
    true,
    110
  ),
  (
    'COM',
    'COM_NO_DUPLICATE_PAYMENT',
    'Không chi COM trùng',
    'Đã kiểm tra không có claim hoặc dòng thanh toán COM còn hiệu lực cho cùng học viên/chính sách/thành phần.',
    true,
    120
  ),
  (
    'COM',
    'COM_POLICY_EFFECTIVE_DATE',
    'Chính sách COM đúng thời điểm hiệu lực',
    'Ngày căn cứ tính COM phải nằm trong khoảng hiệu lực của chính sách COM đang áp dụng.',
    true,
    130
  ),
  (
    'COM',
    'COM_STUDENT_CODE_AND_ADMISSION_DECISION',
    'Có mã sinh viên/quyết định trúng tuyển',
    'Đã có mã sinh viên HOU hoặc thông tin tương đương và quyết định trúng tuyển/ghi nhận nhập học.',
    true,
    140
  ),
  (
    'COM',
    'COM_FIRST_TUITION_CONFIRMED',
    'Đã xác nhận học phí trước khi nhận COM',
    'Học phí kỳ đầu phải được xác nhận trước khi tạo hoặc duyệt đề nghị COM.',
    true,
    150
  ),
  (
    'COM',
    'COM_DROPOUT_DEBT_RISK_REVIEWED',
    'Đã rà soát rủi ro bỏ học/công nợ',
    'Nếu học viên có nguy cơ bỏ học, hoàn phí hoặc công nợ chưa rõ thì giữ claim để rà soát.',
    true,
    160
  ),
  (
    'OTHER',
    'OTHER_ORIENTATION_DONE',
    'Đã tư vấn định hướng',
    'Đã tư vấn rõ chương trình, thời gian học, địa điểm học và nghĩa vụ tài chính.',
    false,
    210
  ),
  (
    'OTHER',
    'OTHER_PARENT_CONFIRMED',
    'Phụ huynh/người bảo trợ đã xác nhận',
    'Áp dụng khi cần xác nhận thêm từ phụ huynh hoặc người bảo trợ tài chính.',
    false,
    220
  ),
  (
    'OTHER',
    'OTHER_ZALO_GROUP_JOINED',
    'Đã vào nhóm Zalo/lớp',
    'Điều kiện vận hành nội bộ, có thể đặt bắt buộc theo từng đợt tuyển sinh.',
    false,
    230
  )
on conflict (condition_code) do update set
  condition_scope = excluded.condition_scope,
  condition_name = excluded.condition_name,
  condition_description = excluded.condition_description,
  is_required_default = excluded.is_required_default,
  sort_order = excluded.sort_order,
  status = 'ACTIVE',
  updated_at = now();
