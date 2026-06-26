-- Step 93 - P2-07 TTGDTX Import Issue Routing.
-- Run after step92_ttgdtx_tuition_import_control_p2_06.sql.
-- Migration candidate only. Do not run in production from Codex/chat.
-- Production requires backup evidence, restore dry-run, migration order approval
-- and business Go/No-Go sign-off.
-- Rollback note:
-- - No physical removal of business data is used.
-- - If rollback is needed, mark introduced P2-07 routing/task records inactive
--   through an approved corrective migration and keep audit evidence.
--
-- Purpose:
-- - Do not treat every issue as a system error.
-- - Classify each P2-06 issue into data, system, process logic, professional,
--   or legal/finance.
-- - Generate controlled work items for the right owner department and escalation line.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.import.issue.read'),
    ('ttgdtx.import.issue.manage'),
    ('ttgdtx.import.issue.approve')
) as p(permission)
where r.code in ('ADMIN', 'IT_DATA', 'ACCOUNTING', 'ACCOUNTING_LEAD', 'KHTC')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.import.issue.read'),
    ('ttgdtx.import.issue.approve')
) as p(permission)
where r.code in ('BGH', 'AUDIT')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('ttgdtx.import.issue.read'),
    ('ttgdtx.import.issue.manage')
) as p(permission)
where r.code in ('PHAP_CHE', 'DAO_TAO', 'CTHSSV', 'TUYEN_SINH')
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, 'ttgdtx.import.issue.read'
from public.roles r
where r.code in ('TEAM_LEAD', 'COUNSELOR', 'VIEWER')
on conflict (role_id, permission) do nothing;

insert into public.permission_registry (
  permission_code,
  permission_group,
  permission_label,
  module_code,
  owner_department,
  risk_level,
  grant_scope,
  requires_scope,
  requires_approval,
  allow_delegation,
  max_delegation_hours,
  ai_allowed,
  control_note,
  control_status
) values
  (
    'ttgdtx.import.issue.read',
    'TTGDTX',
    'Xem phân luồng lỗi import học phí TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + IT_DATA + AUDIT',
    'MEDIUM',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    72,
    true,
    'Chỉ đọc lỗi, hướng xử lý, owner và tuyến báo cáo. Không sửa dữ liệu gốc.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.import.issue.manage',
    'TTGDTX',
    'Tạo/cập nhật phiếu xử lý lỗi import TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'KHTC + IT_DATA',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    true,
    true,
    24,
    true,
    'Chỉ dùng để tạo đầu việc xử lý lỗi; không thay thế quyền sửa file, duyệt tài chính hoặc duyệt pháp chế.',
    'DAT_TAM_THOI'
  ),
  (
    'ttgdtx.import.issue.approve',
    'TTGDTX',
    'Duyệt đóng/escalate lỗi import TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'BGH + AUDIT + KHTC',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    24,
    false,
    'Lỗi pháp chế/kế toán hoặc lỗi nghiêm trọng chỉ được đóng khi có ghi chú xử lý và minh chứng.',
    'DAT_TAM_THOI'
  )
on conflict (permission_code) do update set
  permission_group = excluded.permission_group,
  permission_label = excluded.permission_label,
  module_code = excluded.module_code,
  owner_department = excluded.owner_department,
  risk_level = excluded.risk_level,
  grant_scope = excluded.grant_scope,
  requires_scope = excluded.requires_scope,
  requires_approval = excluded.requires_approval,
  allow_delegation = excluded.allow_delegation,
  max_delegation_hours = excluded.max_delegation_hours,
  ai_allowed = excluded.ai_allowed,
  control_note = excluded.control_note,
  control_status = excluded.control_status,
  updated_at = now();

create table if not exists public.ttgdtx_import_issue_route_rules (
  id uuid primary key default gen_random_uuid(),
  rule_code text not null unique,
  check_code text not null unique,
  issue_title text not null,
  issue_category text not null,
  issue_explanation text not null,
  source_department text not null,
  owner_department text not null,
  report_to_department text not null,
  severity_override text,
  auto_create_task boolean not null default true,
  requires_approval boolean not null default false,
  sla_hours int not null default 48,
  default_fix_action text not null,
  escalation_rule text not null,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_import_issue_route_category_valid check (
    issue_category in ('DATA_FILE', 'SYSTEM_TECH', 'PROCESS_LOGIC', 'PROFESSIONAL', 'LEGAL_FINANCE')
  ),
  constraint ttgdtx_import_issue_route_severity_valid check (
    severity_override is null
    or severity_override in ('INFO', 'WARNING', 'ERROR', 'CRITICAL')
  ),
  constraint ttgdtx_import_issue_route_sla_valid check (sla_hours > 0)
);

create table if not exists public.ttgdtx_import_issue_tasks (
  id uuid primary key default gen_random_uuid(),
  task_code text not null unique,
  batch_id uuid not null references public.ttgdtx_tuition_import_batches(id) on delete restrict,
  check_id uuid references public.ttgdtx_tuition_import_checks(id) on delete set null,
  issue_code text not null,
  issue_title text not null,
  issue_category text not null,
  issue_explanation text not null,
  severity text not null,
  source_department text not null,
  owner_department text not null,
  report_to_department text not null,
  task_status text not null default 'OPEN',
  sla_hours int not null default 48,
  due_at timestamptz not null default (now() + interval '48 hours'),
  requires_approval boolean not null default false,
  default_fix_action text not null,
  escalation_rule text not null,
  source_sheet text,
  check_status text,
  check_message text,
  fix_hint text,
  resolution_note text,
  evidence_url text,
  ai_suggestion text,
  record_status public.record_status not null default 'ACTIVE',
  created_by uuid references public.users_profile(id),
  updated_by uuid references public.users_profile(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ttgdtx_import_issue_task_category_valid check (
    issue_category in ('DATA_FILE', 'SYSTEM_TECH', 'PROCESS_LOGIC', 'PROFESSIONAL', 'LEGAL_FINANCE')
  ),
  constraint ttgdtx_import_issue_task_severity_valid check (
    severity in ('INFO', 'WARNING', 'ERROR', 'CRITICAL')
  ),
  constraint ttgdtx_import_issue_task_status_valid check (
    task_status in ('OPEN', 'IN_PROGRESS', 'WAITING_OWNER', 'WAITING_APPROVAL', 'RESOLVED', 'ESCALATED', 'CANCELLED')
  ),
  constraint ttgdtx_import_issue_task_sla_valid check (sla_hours > 0)
);

create index if not exists idx_ttgdtx_import_issue_rules_category
on public.ttgdtx_import_issue_route_rules(issue_category, record_status);

create index if not exists idx_ttgdtx_import_issue_tasks_batch
on public.ttgdtx_import_issue_tasks(batch_id, task_status, severity)
where record_status = 'ACTIVE';

create index if not exists idx_ttgdtx_import_issue_tasks_owner
on public.ttgdtx_import_issue_tasks(owner_department, due_at)
where record_status = 'ACTIVE';

drop trigger if exists trg_ttgdtx_import_issue_rules_updated_at
on public.ttgdtx_import_issue_route_rules;
create trigger trg_ttgdtx_import_issue_rules_updated_at
before update on public.ttgdtx_import_issue_route_rules
for each row execute function public.set_updated_at();

drop trigger if exists trg_ttgdtx_import_issue_tasks_updated_at
on public.ttgdtx_import_issue_tasks;
create trigger trg_ttgdtx_import_issue_tasks_updated_at
before update on public.ttgdtx_import_issue_tasks
for each row execute function public.set_updated_at();

drop trigger if exists trg_ttgdtx_import_issue_rules_audit
on public.ttgdtx_import_issue_route_rules;
create trigger trg_ttgdtx_import_issue_rules_audit
after insert or update or delete on public.ttgdtx_import_issue_route_rules
for each row execute function public.write_audit_log();

drop trigger if exists trg_ttgdtx_import_issue_tasks_audit
on public.ttgdtx_import_issue_tasks;
create trigger trg_ttgdtx_import_issue_tasks_audit
after insert or update or delete on public.ttgdtx_import_issue_tasks
for each row execute function public.write_audit_log();

alter table public.ttgdtx_import_issue_route_rules enable row level security;
alter table public.ttgdtx_import_issue_tasks enable row level security;

create or replace function public.can_read_ttgdtx_import_issue(target_segment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('ttgdtx.import.issue.read')
    or public.has_permission('ttgdtx.import.issue.manage')
    or public.has_permission('ttgdtx.import.issue.approve')
    or public.has_permission('ttgdtx.import.read')
    or public.can_access_business_scope(target_segment_id, null)
$$;

create or replace function public.can_manage_ttgdtx_import_issue()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('ttgdtx.import.issue.manage')
    or public.has_permission('ttgdtx.import.issue.approve')
$$;

grant execute on function public.can_read_ttgdtx_import_issue(uuid) to authenticated;
grant execute on function public.can_manage_ttgdtx_import_issue() to authenticated;

drop policy if exists "ttgdtx_import_issue_rules_select"
on public.ttgdtx_import_issue_route_rules;
create policy "ttgdtx_import_issue_rules_select"
on public.ttgdtx_import_issue_route_rules for select
to authenticated
using (
  public.is_admin()
  or public.current_user_role_code() = 'BGH'
  or public.has_permission('ttgdtx.import.issue.read')
  or public.has_permission('ttgdtx.import.issue.manage')
  or public.has_permission('ttgdtx.import.read')
);

drop policy if exists "ttgdtx_import_issue_rules_manage"
on public.ttgdtx_import_issue_route_rules;
create policy "ttgdtx_import_issue_rules_manage"
on public.ttgdtx_import_issue_route_rules for all
to authenticated
using (public.can_manage_ttgdtx_import_issue())
with check (public.can_manage_ttgdtx_import_issue());

drop policy if exists "ttgdtx_import_issue_tasks_select"
on public.ttgdtx_import_issue_tasks;
create policy "ttgdtx_import_issue_tasks_select"
on public.ttgdtx_import_issue_tasks for select
to authenticated
using (
  exists (
    select 1
    from public.ttgdtx_tuition_import_batches b
    where b.id = batch_id
      and public.can_read_ttgdtx_import_issue(b.admission_segment_id)
  )
);

drop policy if exists "ttgdtx_import_issue_tasks_manage"
on public.ttgdtx_import_issue_tasks;
create policy "ttgdtx_import_issue_tasks_manage"
on public.ttgdtx_import_issue_tasks for all
to authenticated
using (public.can_manage_ttgdtx_import_issue())
with check (public.can_manage_ttgdtx_import_issue());

insert into public.ttgdtx_import_issue_route_rules (
  rule_code,
  check_code,
  issue_title,
  issue_category,
  issue_explanation,
  source_department,
  owner_department,
  report_to_department,
  severity_override,
  auto_create_task,
  requires_approval,
  sla_hours,
  default_fix_action,
  escalation_rule
) values
  (
    'RULE_P2_07_RECEIPT_DATE_MISSING',
    'P2_06_RECEIPT_DATE_MISSING',
    'Phiếu thu thiếu ngày thu/chứng từ',
    'DATA_FILE',
    'Đây là lỗi dữ liệu trong file thu học phí. Chưa đủ căn cứ kế toán để xác nhận đã thu nếu thiếu ngày hoặc chứng từ.',
    'KHTC',
    'KHTC',
    'ACCOUNTING_LEAD',
    'WARNING',
    true,
    false,
    24,
    'Bổ sung ngày thu, số chứng từ hoặc đánh dấu dòng không dùng. Nếu đã có chứng từ thì gắn link minh chứng.',
    'Quá hạn 24 giờ thì báo ACCOUNTING_LEAD; nếu ảnh hưởng số tổng thì báo BGH/AUDIT.'
  ),
  (
    'RULE_P2_07_NEGATIVE_STUDENT_BALANCE',
    'P2_06_NEGATIVE_STUDENT_BALANCE',
    'Công nợ học viên âm',
    'LEGAL_FINANCE',
    'Đây là lỗi rủi ro kế toán: có thể thu thừa, nhập sai giảm trừ, hoàn tiền hoặc cấn trừ chưa có căn cứ.',
    'KHTC',
    'KHTC + AUDIT',
    'ACCOUNTING_LEAD + BGH',
    'ERROR',
    true,
    true,
    24,
    'Đối chiếu chứng từ thu, giảm trừ, hoàn tiền và công nợ từng học viên. Không dùng dòng âm để tạo công nợ hoặc chi trung tâm khi chưa giải trình.',
    'Quá hạn 24 giờ hoặc có số tiền âm lớn thì escalate BGH và AUDIT.'
  ),
  (
    'RULE_P2_07_MISSING_DROPOUT_REASON',
    'P2_06_MISSING_DROPOUT_REASON',
    'Thiếu lý do không thu/bỏ học',
    'PROFESSIONAL',
    'Đây là lỗi chuyên môn vận hành học sinh: thiếu căn cứ vì sao không thu, bỏ học, bảo lưu hoặc không đủ điều kiện.',
    'CTHSSV + KHTC',
    'CTHSSV + KHTC',
    'CTHSSV_LEAD + ACCOUNTING_LEAD',
    'WARNING',
    true,
    false,
    48,
    'CTHSSV xác nhận trạng thái học sinh; KHTC đối chiếu công nợ. Bổ sung lý do rõ ràng trước khi khóa batch.',
    'Quá hạn 48 giờ thì báo trưởng phòng CTHSSV và kế toán trưởng.'
  ),
  (
    'RULE_P2_07_MISSING_STUDENT_DOB',
    'P2_06_MISSING_STUDENT_DOB',
    'Thiếu ngày sinh học viên',
    'DATA_FILE',
    'Đây là lỗi dữ liệu định danh học viên. Chưa ảnh hưởng ngay đến thu tiền nhưng ảnh hưởng hồ sơ và đối soát học sinh.',
    'CTHSSV',
    'CTHSSV',
    'CTHSSV_LEAD',
    'WARNING',
    true,
    false,
    48,
    'Bổ sung ngày sinh theo hồ sơ gốc hoặc CCCD. Nếu chưa có hồ sơ, đánh dấu chờ bổ sung.',
    'Quá hạn 48 giờ thì báo trưởng phòng CTHSSV.'
  ),
  (
    'RULE_P2_07_PARTNER_ACCEPTANCE_LINK',
    'P2_06_PARTNER_ACCEPTANCE_LINK',
    'Thiếu hợp đồng/biên bản nghiệm thu trung tâm',
    'LEGAL_FINANCE',
    'Đây là lỗi pháp chế/kế toán. Không đủ căn cứ để chi trả hoặc đối soát với TTGDTX nếu thiếu hợp đồng/phụ lục/biên bản.',
    'KHTC + PHAP_CHE',
    'KHTC + PHAP_CHE',
    'ACCOUNTING_LEAD + BGH',
    'ERROR',
    true,
    true,
    24,
    'Gắn link hợp đồng, phụ lục, nghiệm thu hoặc biên bản xác nhận đã được kiểm tra. Chỉ chi khi đủ căn cứ.',
    'Quá hạn 24 giờ thì báo kế toán trưởng, pháp chế và BGH.'
  ),
  (
    'RULE_P2_07_NEGATIVE_PARTNER_PAYABLE',
    'P2_06_NEGATIVE_PARTNER_PAYABLE',
    'Công nợ chi TTGDTX âm',
    'LEGAL_FINANCE',
    'Đây là lỗi nghiêm trọng trong đối soát chi. Có nguy cơ chi vượt, nhập sai số đã chi hoặc sai nghiệm thu.',
    'KHTC',
    'KHTC + AUDIT',
    'ACCOUNTING_LEAD + BGH',
    'CRITICAL',
    true,
    true,
    12,
    'Khóa dòng chi liên quan, đối chiếu số nghiệm thu, số đã chi, khoản hoàn/điều chỉnh. Chưa được lập lệnh chi khi còn âm.',
    'Quá hạn 12 giờ hoặc phát sinh chi tiền thì escalate ngay BGH và AUDIT.'
  ),
  (
    'RULE_P2_07_CLASS_POLICY_CLASS_CODE',
    'P2_06_CLASS_POLICY_CLASS_CODE',
    'Danh sách lớp thiếu mã lớp',
    'PROCESS_LOGIC',
    'Đây là lỗi logic dữ liệu lớp: không có mã lớp thì không map ổn định sang công nợ, lớp, học viên và báo cáo.',
    'DAO_TAO + KHTC',
    'DAO_TAO + KHTC',
    'DAO_TAO_LEAD + IT_DATA',
    'ERROR',
    true,
    false,
    48,
    'Bổ sung mã lớp chuẩn, thống nhất với danh mục lớp. Không tự sinh công nợ từ dòng thiếu mã lớp.',
    'Quá hạn 48 giờ thì báo Đào tạo và IT/Data để chặn import dòng sai.'
  ),
  (
    'RULE_P2_07_CLASS_POLICY_TUITION',
    'P2_06_CLASS_POLICY_TUITION',
    'Danh sách lớp thiếu học phí',
    'LEGAL_FINANCE',
    'Đây là lỗi chính sách học phí. Thiếu học phí thì không thể tạo P2-02, P2-03 hoặc báo cáo công nợ đúng.',
    'KHTC',
    'KHTC',
    'ACCOUNTING_LEAD',
    'ERROR',
    true,
    true,
    24,
    'Bổ sung mức học phí theo chính sách đã duyệt hoặc đánh dấu dòng không áp dụng. Nếu là mức mới phải đi qua duyệt P2-02.',
    'Quá hạn 24 giờ thì báo kế toán trưởng.'
  ),
  (
    'RULE_P2_07_FORMULA_REF',
    'P2_06_FORMULA_REF',
    'File Excel/Google Sheet lỗi công thức #REF!',
    'SYSTEM_TECH',
    'Đây là lỗi kỹ thuật ở file/công thức. Không được dùng file làm căn cứ chi hoặc khóa batch khi công thức còn lỗi.',
    'IT_DATA + KHTC',
    'IT_DATA + KHTC',
    'IT_DATA_LEAD + ACCOUNTING_LEAD + AUDIT',
    'CRITICAL',
    true,
    true,
    12,
    'Sửa công thức, kiểm tra lại vùng tham chiếu, lưu bản đối soát mới và ghi rõ người xác nhận. Nếu lỗi đến từ import parser thì IT/Data xử lý.',
    'Quá hạn 12 giờ hoặc ảnh hưởng chứng từ chi thì báo IT/Data lead, kế toán trưởng và AUDIT.'
  )
on conflict (check_code) do update set
  rule_code = excluded.rule_code,
  issue_title = excluded.issue_title,
  issue_category = excluded.issue_category,
  issue_explanation = excluded.issue_explanation,
  source_department = excluded.source_department,
  owner_department = excluded.owner_department,
  report_to_department = excluded.report_to_department,
  severity_override = excluded.severity_override,
  auto_create_task = excluded.auto_create_task,
  requires_approval = excluded.requires_approval,
  sla_hours = excluded.sla_hours,
  default_fix_action = excluded.default_fix_action,
  escalation_rule = excluded.escalation_rule,
  record_status = 'ACTIVE',
  updated_at = now();

create or replace function public.generate_ttgdtx_import_issue_tasks(target_batch_id uuid default null)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count int := 0;
begin
  if auth.uid() is not null and not public.can_manage_ttgdtx_import_issue() then
    raise exception 'P2-07: Tài khoản chưa có quyền tạo phiếu xử lý lỗi import TTGDTX.';
  end if;

  with source_rows as (
    select
      b.id as batch_id,
      b.batch_code,
      c.id as check_id,
      c.check_code,
      coalesce(r.severity_override, c.severity) as severity,
      r.issue_title,
      r.issue_category,
      r.issue_explanation,
      r.source_department,
      r.owner_department,
      r.report_to_department,
      r.requires_approval,
      r.sla_hours,
      r.default_fix_action,
      r.escalation_rule,
      c.source_sheet,
      c.check_status,
      c.check_message,
      c.fix_hint
    from public.ttgdtx_tuition_import_checks c
    join public.ttgdtx_tuition_import_batches b on b.id = c.batch_id
    join public.ttgdtx_import_issue_route_rules r
      on r.check_code = c.check_code
     and r.record_status = 'ACTIVE'
     and r.auto_create_task = true
    where c.check_status <> 'PASS'
      and (target_batch_id is null or b.id = target_batch_id)
  ),
  upserted as (
    insert into public.ttgdtx_import_issue_tasks (
      task_code,
      batch_id,
      check_id,
      issue_code,
      issue_title,
      issue_category,
      issue_explanation,
      severity,
      source_department,
      owner_department,
      report_to_department,
      task_status,
      sla_hours,
      due_at,
      requires_approval,
      default_fix_action,
      escalation_rule,
      source_sheet,
      check_status,
      check_message,
      fix_hint,
      ai_suggestion
    )
    select
      'P2-07-' || batch_code || '-' || check_code,
      batch_id,
      check_id,
      check_code,
      issue_title,
      issue_category,
      issue_explanation,
      severity,
      source_department,
      owner_department,
      report_to_department,
      'OPEN',
      sla_hours,
      now() + make_interval(hours => sla_hours),
      requires_approval,
      default_fix_action,
      escalation_rule,
      source_sheet,
      check_status,
      check_message,
      fix_hint,
      case
        when issue_category = 'SYSTEM_TECH' then 'AI chỉ được gợi ý nguyên nhân kỹ thuật và checklist kiểm tra, không tự sửa file gốc.'
        when issue_category = 'LEGAL_FINANCE' then 'AI chỉ nhắc rủi ro, đối chiếu số và hồ sơ cần có; không tự duyệt chi hoặc xác nhận thu.'
        when issue_category = 'PROFESSIONAL' then 'AI có thể gợi ý hồ sơ/trạng thái cần bổ sung, quyết định vẫn thuộc phòng chuyên môn.'
        when issue_category = 'PROCESS_LOGIC' then 'AI có thể chỉ ra xung đột logic, IT/Data và owner quy trình quyết định cách sửa.'
        else 'AI hỗ trợ tìm dữ liệu thiếu và mẫu minh chứng cần bổ sung.'
      end
    from source_rows
    on conflict (task_code) do update set
      check_id = excluded.check_id,
      issue_title = excluded.issue_title,
      issue_category = excluded.issue_category,
      issue_explanation = excluded.issue_explanation,
      severity = excluded.severity,
      source_department = excluded.source_department,
      owner_department = excluded.owner_department,
      report_to_department = excluded.report_to_department,
      sla_hours = excluded.sla_hours,
      requires_approval = excluded.requires_approval,
      default_fix_action = excluded.default_fix_action,
      escalation_rule = excluded.escalation_rule,
      source_sheet = excluded.source_sheet,
      check_status = excluded.check_status,
      check_message = excluded.check_message,
      fix_hint = excluded.fix_hint,
      ai_suggestion = excluded.ai_suggestion,
      due_at = case
        when public.ttgdtx_import_issue_tasks.task_status in ('RESOLVED', 'CANCELLED')
          then public.ttgdtx_import_issue_tasks.due_at
        else excluded.due_at
      end,
      task_status = case
        when public.ttgdtx_import_issue_tasks.task_status in ('RESOLVED', 'CANCELLED')
          then public.ttgdtx_import_issue_tasks.task_status
        else public.ttgdtx_import_issue_tasks.task_status
      end,
      updated_at = now()
    returning 1
  )
  select count(*) into affected_count from upserted;

  return affected_count;
end;
$$;

grant execute on function public.generate_ttgdtx_import_issue_tasks(uuid) to authenticated;

select public.generate_ttgdtx_import_issue_tasks(null);

create or replace view public.ttgdtx_import_issue_task_board
with (security_invoker = true)
as
select
  t.id as task_id,
  t.task_code,
  t.issue_code,
  t.issue_title,
  t.issue_category,
  case t.issue_category
    when 'DATA_FILE' then 'Lỗi dữ liệu/file'
    when 'SYSTEM_TECH' then 'Lỗi hệ thống/kỹ thuật'
    when 'PROCESS_LOGIC' then 'Lỗi logic/quy trình'
    when 'PROFESSIONAL' then 'Lỗi chuyên môn/nghiệp vụ'
    when 'LEGAL_FINANCE' then 'Lỗi pháp chế/kế toán'
    else t.issue_category
  end as issue_category_label,
  t.issue_explanation,
  t.severity,
  case t.severity
    when 'INFO' then 'Thông tin'
    when 'WARNING' then 'Cảnh báo'
    when 'ERROR' then 'Lỗi'
    when 'CRITICAL' then 'Nghiêm trọng'
    else t.severity
  end as severity_label,
  t.source_department,
  t.owner_department,
  t.report_to_department,
  t.task_status,
  case t.task_status
    when 'OPEN' then 'Mới mở'
    when 'IN_PROGRESS' then 'Đang xử lý'
    when 'WAITING_OWNER' then 'Chờ đơn vị xử lý'
    when 'WAITING_APPROVAL' then 'Chờ duyệt'
    when 'RESOLVED' then 'Đã xử lý'
    when 'ESCALATED' then 'Đã báo cáo cấp trên'
    when 'CANCELLED' then 'Đã hủy'
    else t.task_status
  end as task_status_label,
  t.sla_hours,
  t.due_at,
  case
    when t.task_status not in ('RESOLVED', 'CANCELLED') and t.due_at < now() then true
    else false
  end as is_overdue,
  t.requires_approval,
  t.default_fix_action,
  t.escalation_rule,
  t.source_sheet,
  t.check_status,
  t.check_message,
  t.fix_hint,
  t.resolution_note,
  t.evidence_url,
  t.ai_suggestion,
  b.batch_code,
  b.batch_name,
  b.admission_segment_id,
  s.segment_code,
  s.segment_name,
  t.created_at,
  t.updated_at
from public.ttgdtx_import_issue_tasks t
join public.ttgdtx_tuition_import_batches b on b.id = t.batch_id
join public.admission_segments s on s.id = b.admission_segment_id
where t.record_status = 'ACTIVE'
  and public.can_read_ttgdtx_import_issue(b.admission_segment_id);

grant select on public.ttgdtx_import_issue_task_board to authenticated;

create or replace view public.ttgdtx_import_issue_task_summary
with (security_invoker = true)
as
select
  issue_category,
  issue_category_label,
  count(*)::int as task_count,
  count(*) filter (where task_status not in ('RESOLVED', 'CANCELLED'))::int as open_count,
  count(*) filter (where severity = 'CRITICAL')::int as critical_count,
  count(*) filter (where is_overdue)::int as overdue_count,
  count(*) filter (where requires_approval)::int as approval_required_count
from public.ttgdtx_import_issue_task_board
group by issue_category, issue_category_label;

grant select on public.ttgdtx_import_issue_task_summary to authenticated;

insert into public.admission_segment_operation_steps (
  segment_id,
  step_code,
  step_name,
  step_group,
  owner_department,
  action_href,
  required_for_operation,
  control_note,
  sort_order,
  control_status
)
select
  s.id,
  'TTGDTX_IMPORT_ISSUE_ROUTING',
  'P2-07 Phân luồng lỗi import học phí TTGDTX',
  'FINANCE',
  'KHTC + IT_DATA + AUDIT + OWNER_DEPARTMENTS',
  '/ttgdtx/import/issues',
  true,
  'P2-07 phân loại lỗi P2-06 thành lỗi dữ liệu, hệ thống, logic, chuyên môn hoặc pháp chế/kế toán; tự sinh đầu việc đúng đơn vị và tuyến báo cáo.',
  69,
  'DAT_TAM_THOI'
from public.admission_segments s
where s.segment_code = 'TC9_TTGDTX_LINKED'
  and s.status = 'ACTIVE'
on conflict (segment_id, step_code) do update set
  step_name = excluded.step_name,
  step_group = excluded.step_group,
  owner_department = excluded.owner_department,
  action_href = excluded.action_href,
  required_for_operation = excluded.required_for_operation,
  control_note = excluded.control_note,
  sort_order = excluded.sort_order,
  control_status = excluded.control_status,
  updated_at = now();

insert into public.heu_os_workflows (
  workflow_code,
  workflow_name,
  module_code,
  trigger_event,
  start_role,
  owner_department,
  checker_role,
  approver_role,
  output_result,
  handover_rule,
  audit_rule,
  sort_order,
  control_status
) values (
  'WF_P2_07_TTGDTX_IMPORT_ISSUE_ROUTING',
  'P2-07 Phân luồng lỗi import học phí TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'Khi P2-06 phát hiện lỗi/cảnh báo trong file thu học phí hoặc nghiệm thu TTGDTX.',
  'KHTC/IT_DATA',
  'KHTC + IT_DATA + AUDIT + OWNER_DEPARTMENTS',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/KE_TOAN_TRUONG',
  'Danh sách đầu việc xử lý lỗi theo loại lỗi, owner, cấp báo cáo, SLA và trạng thái.',
  'Lỗi thuộc phòng nào thì phòng đó xử lý; lỗi pháp chế/kế toán hoặc nghiêm trọng phải báo cấp trên và có minh chứng trước khi đóng.',
  'Log mọi thay đổi route rule, task, trạng thái, minh chứng và ghi chú xử lý.',
  2070,
  'DAT_TAM_THOI'
)
on conflict (workflow_code) do update set
  workflow_name = excluded.workflow_name,
  module_code = excluded.module_code,
  trigger_event = excluded.trigger_event,
  start_role = excluded.start_role,
  owner_department = excluded.owner_department,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  output_result = excluded.output_result,
  handover_rule = excluded.handover_rule,
  audit_rule = excluded.audit_rule,
  sort_order = excluded.sort_order,
  control_status = excluded.control_status,
  updated_at = now();

insert into public.heu_os_master_data_map (
  data_code,
  data_name,
  module_code,
  source_table,
  data_type,
  owner_department,
  system_of_record,
  sensitivity_level,
  ai_allowed,
  change_rule,
  control_status
) values
  (
    'P2_07_TTGDTX_IMPORT_ISSUE_ROUTE_RULES',
    'P2-07 luật phân loại lỗi import TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'ttgdtx_import_issue_route_rules',
    'CONFIG',
    'KHTC + IT_DATA + AUDIT',
    'SUPABASE',
    'CONFIDENTIAL',
    true,
    'Thay đổi luật phân loại lỗi phải có owner nghiệp vụ và IT/Data kiểm tra; không tự ý đổi tuyến báo cáo lỗi tài chính.',
    'DAT_TAM_THOI'
  ),
  (
    'P2_07_TTGDTX_IMPORT_ISSUE_TASKS',
    'P2-07 phiếu xử lý lỗi import TTGDTX',
    'M08_FINANCE_ACCOUNTING',
    'ttgdtx_import_issue_tasks; ttgdtx_import_issue_task_board; ttgdtx_import_issue_task_summary',
    'TRANSACTION',
    'KHTC + IT_DATA + OWNER_DEPARTMENTS',
    'SUPABASE',
    'RESTRICTED',
    true,
    'Phiếu lỗi chỉ đóng khi có ghi chú xử lý; lỗi cần duyệt phải có minh chứng hoặc người chịu trách nhiệm.',
    'DAT_TAM_THOI'
  )
on conflict (data_code) do update set
  data_name = excluded.data_name,
  module_code = excluded.module_code,
  source_table = excluded.source_table,
  data_type = excluded.data_type,
  owner_department = excluded.owner_department,
  system_of_record = excluded.system_of_record,
  sensitivity_level = excluded.sensitivity_level,
  ai_allowed = excluded.ai_allowed,
  change_rule = excluded.change_rule,
  control_status = excluded.control_status,
  updated_at = now();

insert into public.process_ownership_matrix (
  ownership_code,
  process_name,
  module_code,
  workflow_code,
  entity_type,
  source_table,
  owner_department,
  maker_role,
  checker_role,
  approver_role,
  viewer_scope,
  handover_from_department,
  handover_to_department,
  required_evidence,
  audit_rule,
  sla_hours,
  risk_level,
  control_status
) values (
  'OWN_P2_07_TTGDTX_IMPORT_ISSUE_ROUTING',
  'P2-07 Phân luồng lỗi import học phí TTGDTX',
  'M08_FINANCE_ACCOUNTING',
  'WF_P2_07_TTGDTX_IMPORT_ISSUE_ROUTING',
  'TTGDTX_IMPORT_ISSUE_TASK',
  'ttgdtx_import_issue_tasks',
  'KHTC + IT_DATA + AUDIT + OWNER_DEPARTMENTS',
  'KHTC/IT_DATA',
  'ACCOUNTING_LEAD + AUDIT',
  'BGH/KE_TOAN_TRUONG',
  'ROLE_AND_SCOPE',
  'P2-06',
  'KHTC + IT_DATA + PHAP_CHE + CTHSSV + DAO_TAO + AUDIT',
  'Nguồn lỗi P2-06, loại lỗi, phòng xử lý, ghi chú xử lý, link minh chứng nếu có.',
  'Mọi phiếu lỗi đều ghi audit log; không được đóng lỗi pháp chế/kế toán khi chưa có minh chứng hoặc ghi chú trách nhiệm.',
  24,
  'CRITICAL',
  'DAT_TAM_THOI'
)
on conflict (ownership_code) do update set
  process_name = excluded.process_name,
  module_code = excluded.module_code,
  workflow_code = excluded.workflow_code,
  entity_type = excluded.entity_type,
  source_table = excluded.source_table,
  owner_department = excluded.owner_department,
  maker_role = excluded.maker_role,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  viewer_scope = excluded.viewer_scope,
  handover_from_department = excluded.handover_from_department,
  handover_to_department = excluded.handover_to_department,
  required_evidence = excluded.required_evidence,
  audit_rule = excluded.audit_rule,
  sla_hours = excluded.sla_hours,
  risk_level = excluded.risk_level,
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
  'GATE_P2_07_TTGDTX_IMPORT_ISSUE_ROUTING',
  'Gate P2-07: đóng lỗi import TTGDTX đúng tuyến',
  'SOP',
  'TTGDTX_IMPORT_ISSUE_TASK',
  'P2-07-ISSUE-ROUTING',
  'KHTC + IT_DATA + AUDIT',
  'Kiểm tra lỗi đã được phân đúng loại: dữ liệu, hệ thống, logic, chuyên môn hoặc pháp chế/kế toán.',
  'Lỗi nghiêm trọng hoặc lỗi pháp chế/kế toán chỉ được đóng khi có ghi chú xử lý, minh chứng và người chịu trách nhiệm.',
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
  decision_status = excluded.decision_status,
  updated_at = now();
