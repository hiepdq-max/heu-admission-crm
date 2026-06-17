-- P1-10: Short Course Dashboard & Exception Control
-- Run after step73_short_course_payment_foundation.sql.
-- Purpose:
-- - Build one exception register for the short-course ERP chain.
-- - Summarize operational, finance and compliance blockers for dashboard use.
-- - Allow controlled sync from exception register into short_risk_alerts.
-- - Keep AI in support mode: read, suggest and warn; no auto approval.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('short_course.dashboard.read'),
    ('short_course.exception.read'),
    ('short_course.exception.manage')
) as p(permission)
where r.code in (
  'ADMIN',
  'BGH',
  'KHTC',
  'ACCOUNTING',
  'ACCOUNTING_LEAD',
  'CTHSSV',
  'CTHSSV_LEAD',
  'DAO_TAO',
  'DAO_TAO_LEAD',
  'AUDIT',
  'IT_DATA'
)
on conflict (role_id, permission) do nothing;

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join (
  values
    ('short_course.dashboard.read'),
    ('short_course.exception.read')
) as p(permission)
where r.code in (
  'ADMISSION_HEAD',
  'TEAM_LEAD',
  'COUNSELOR',
  'ADMISSION_STAFF'
)
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
  ai_allowed,
  control_note,
  control_status
) values
  (
    'short_course.dashboard.read',
    'SHORT_COURSE',
    'Xem dashboard ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'BGH + IT_DATA',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    true,
    'Dashboard chỉ hiển thị dữ liệu trong phạm vi user được phân.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.exception.read',
    'SHORT_COURSE',
    'Xem cảnh báo/lỗi vận hành ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'AUDIT + IT_DATA',
    'HIGH',
    'ROLE_AND_SCOPE',
    true,
    false,
    true,
    true,
    'Chỉ xem exception theo phạm vi đối tượng tuyển sinh/lớp được phân.',
    'DAT_TAM_THOI'
  ),
  (
    'short_course.exception.manage',
    'SHORT_COURSE',
    'Đồng bộ cảnh báo vận hành ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'AUDIT + IT_DATA',
    'CRITICAL',
    'APPROVAL',
    true,
    true,
    false,
    true,
    'Đồng bộ exception HIGH/CRITICAL thành short_risk_alerts để phòng phụ trách xử lý.',
    'DAT_TAM_THOI'
  )
on conflict (permission_code) do update
set permission_group = excluded.permission_group,
    permission_label = excluded.permission_label,
    module_code = excluded.module_code,
    owner_department = excluded.owner_department,
    risk_level = excluded.risk_level,
    grant_scope = excluded.grant_scope,
    requires_scope = excluded.requires_scope,
    requires_approval = excluded.requires_approval,
    allow_delegation = excluded.allow_delegation,
    ai_allowed = excluded.ai_allowed,
    control_note = excluded.control_note,
    control_status = excluded.control_status,
    updated_at = now();

create or replace function public.can_read_short_course_erp()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('short_course.read')
    or public.has_permission('short_course.manage')
    or public.has_permission('short_course.dashboard.read')
    or public.has_permission('short_course.exception.read')
    or public.has_permission('short_course.exception.manage')
    or public.has_permission('short_course.student.read')
    or public.has_permission('short_course.student.manage')
    or public.has_permission('short_course.student.update')
    or public.has_permission('short_course.student.verify')
    or public.has_permission('short_course.student.lock')
    or public.has_permission('short_course.class.read')
    or public.has_permission('short_course.class.manage')
    or public.has_permission('short_course.class.create')
    or public.has_permission('short_course.class.update')
    or public.has_permission('short_course.class.open')
    or public.has_permission('short_course.class.lock')
    or public.has_permission('short_course.enrollment.read')
    or public.has_permission('short_course.enrollment.assign')
    or public.has_permission('short_course.enrollment.update')
    or public.has_permission('short_course.enrollment.cancel')
    or public.has_permission('short_course.attendance.read')
    or public.has_permission('short_course.attendance.create')
    or public.has_permission('short_course.attendance.update')
    or public.has_permission('short_course.attendance.lock')
    or public.has_permission('short_course.attendance.approve')
    or public.has_permission('short_course.attendance.manage')
    or public.has_permission('short_course.bhxh.read')
    or public.has_permission('short_course.bhxh.create')
    or public.has_permission('short_course.bhxh.check')
    or public.has_permission('short_course.bhxh.submit')
    or public.has_permission('short_course.bhxh.approve')
    or public.has_permission('short_course.bhxh.reject')
    or public.has_permission('short_course.finance.read')
    or public.has_permission('short_course.finance.create')
    or public.has_permission('short_course.finance.update')
    or public.has_permission('short_course.finance.issue')
    or public.has_permission('short_course.finance.lock')
    or public.has_permission('short_course.finance.cancel')
    or public.has_permission('short_course.finance.manage')
    or public.has_permission('short_course.payment.read')
    or public.has_permission('short_course.payment.create')
    or public.has_permission('short_course.payment.update')
    or public.has_permission('short_course.payment.verify')
    or public.has_permission('short_course.payment.reject')
    or public.has_permission('short_course.payment.reverse')
    or public.has_permission('short_course.payment.manage')
$$;

create or replace function public.can_manage_short_course_erp()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('short_course.manage')
    or public.has_permission('short_course.exception.manage')
    or public.has_permission('short_course.student.manage')
    or public.has_permission('short_course.student.update')
    or public.has_permission('short_course.student.verify')
    or public.has_permission('short_course.student.lock')
    or public.has_permission('short_course.class.manage')
    or public.has_permission('short_course.class.create')
    or public.has_permission('short_course.class.update')
    or public.has_permission('short_course.class.open')
    or public.has_permission('short_course.class.lock')
    or public.has_permission('short_course.enrollment.assign')
    or public.has_permission('short_course.enrollment.update')
    or public.has_permission('short_course.enrollment.cancel')
    or public.has_permission('short_course.attendance.create')
    or public.has_permission('short_course.attendance.update')
    or public.has_permission('short_course.attendance.lock')
    or public.has_permission('short_course.attendance.approve')
    or public.has_permission('short_course.attendance.manage')
    or public.has_permission('short_course.bhxh.create')
    or public.has_permission('short_course.bhxh.check')
    or public.has_permission('short_course.bhxh.submit')
    or public.has_permission('short_course.bhxh.approve')
    or public.has_permission('short_course.bhxh.reject')
    or public.has_permission('short_course.finance.create')
    or public.has_permission('short_course.finance.update')
    or public.has_permission('short_course.finance.issue')
    or public.has_permission('short_course.finance.lock')
    or public.has_permission('short_course.finance.cancel')
    or public.has_permission('short_course.finance.manage')
    or public.has_permission('short_course.payment.create')
    or public.has_permission('short_course.payment.update')
    or public.has_permission('short_course.payment.verify')
    or public.has_permission('short_course.payment.reject')
    or public.has_permission('short_course.payment.reverse')
    or public.has_permission('short_course.payment.manage')
$$;

create or replace function public.can_read_short_dashboard()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_user_role_code() = 'BGH'
    or public.has_permission('short_course.dashboard.read')
    or public.has_permission('short_course.exception.read')
    or public.has_permission('short_course.exception.manage')
$$;

create or replace function public.can_manage_short_exceptions()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('short_course.exception.manage')
$$;

grant execute on function public.can_read_short_course_erp() to authenticated;
grant execute on function public.can_manage_short_course_erp() to authenticated;
grant execute on function public.can_read_short_dashboard() to authenticated;
grant execute on function public.can_manage_short_exceptions() to authenticated;

create or replace view public.short_course_exception_register
with (security_invoker = true)
as
select
  'P1-03_STUDENT_' || q.id::text as exception_code,
  'P1-03 Student Master' as module_step,
  'DATA_QUALITY' as exception_group,
  case
    when q.profile_status = 'DUPLICATE_RISK' then 'CRITICAL'
    when q.profile_status = 'BLOCKED' then 'HIGH'
    else 'MEDIUM'
  end as severity,
  'Hồ sơ học viên cần xử lý' as exception_title,
  'STUDENT' as entity_type,
  q.id as entity_id,
  q.student_code as entity_code,
  q.student_name as entity_name,
  q.admission_segment_id,
  q.segment_code,
  q.segment_name,
  q.profile_status as readiness_status,
  q.control_flags,
  'CTHSSV + IT_DATA' as owner_department,
  'Mở Student Master, sửa đúng trường bị báo lỗi, sau đó xác minh lại hồ sơ.' as action_hint,
  'short_student_master_quality_status' as source_view,
  q.updated_at
from public.short_student_master_quality_status q
where q.profile_status in ('BLOCKED', 'NEEDS_FIX', 'DUPLICATE_RISK')
  and public.can_access_business_scope(q.admission_segment_id, null::uuid)

union all

select
  'P1-04_CLASS_' || c.id::text as exception_code,
  'P1-04 Class Master' as module_step,
  'OPERATION' as exception_group,
  case when c.readiness_status = 'BLOCKED' then 'HIGH' else 'MEDIUM' end as severity,
  'Lớp ngắn hạn chưa đủ điều kiện vận hành' as exception_title,
  'CLASS' as entity_type,
  c.id as entity_id,
  c.class_code as entity_code,
  c.class_name as entity_name,
  c.admission_segment_id,
  c.segment_code,
  c.segment_name,
  c.readiness_status,
  c.control_flags,
  'DAO_TAO + IT_DATA' as owner_department,
  'Mở Class Master, bổ sung địa điểm/giảng viên/sức chứa/lịch học hoặc kiểm tra vượt sức chứa.' as action_hint,
  'short_class_master_readiness' as source_view,
  c.updated_at
from public.short_class_master_readiness c
where c.readiness_status in ('BLOCKED', 'NEEDS_FIX')
  and public.can_access_business_scope(c.admission_segment_id, null::uuid)

union all

select
  'P1-05_ENROLLMENT_' || e.enrollment_id::text as exception_code,
  'P1-05 Enrollment/Class Assignment' as module_step,
  'OPERATION' as exception_group,
  case
    when e.readiness_status = 'BLOCKED' then 'HIGH'
    when e.readiness_status = 'UNASSIGNED' then 'MEDIUM'
    else 'LOW'
  end as severity,
  'Ghi danh/gán lớp cần xử lý' as exception_title,
  'ENROLLMENT' as entity_type,
  e.enrollment_id as entity_id,
  e.enrollment_code as entity_code,
  e.student_name as entity_name,
  e.admission_segment_id,
  e.segment_code,
  e.segment_name,
  e.readiness_status,
  e.control_flags,
  'CTHSSV + DAO_TAO' as owner_department,
  'Gán lớp, xác minh gán lớp, hoặc xử lý lỗi class/offer/segment trước khi điểm danh.' as action_hint,
  'short_enrollment_class_assignment_readiness' as source_view,
  e.updated_at
from public.short_enrollment_class_assignment_readiness e
where e.readiness_status in ('UNASSIGNED', 'BLOCKED', 'NEEDS_FIX', 'ASSIGNED_NEEDS_VERIFY')
  and public.can_access_business_scope(e.admission_segment_id, null::uuid)

union all

select
  'P1-06_ATTENDANCE_' || a.session_id::text as exception_code,
  'P1-06 Attendance' as module_step,
  'COMPLIANCE' as exception_group,
  case when a.readiness_status = 'BLOCKED' then 'HIGH' else 'MEDIUM' end as severity,
  'Buổi học/điểm danh cần xử lý' as exception_title,
  'ATTENDANCE_SESSION' as entity_type,
  a.session_id as entity_id,
  a.session_code as entity_code,
  coalesce(a.session_title, a.class_name) as entity_name,
  a.admission_segment_id,
  a.segment_code,
  a.segment_name,
  a.readiness_status,
  a.control_flags,
  'DAO_TAO + CTHSSV' as owner_department,
  'Kiểm tra lớp đã mở, số record điểm danh, trạng thái UNKNOWN và khóa buổi học khi đủ điều kiện.' as action_hint,
  'short_attendance_session_readiness' as source_view,
  a.updated_at
from public.short_attendance_session_readiness a
where a.readiness_status in ('BLOCKED', 'NEEDS_SYNC', 'NEEDS_RECORDING')
  and public.can_access_business_scope(a.admission_segment_id, null::uuid)

union all

select
  'P1-07_BHXH_' || b.enrollment_id::text as exception_code,
  'P1-07 BHXH/Policy' as module_step,
  'LEGAL_COMPLIANCE' as exception_group,
  case
    when b.readiness_status in ('BLOCKED', 'NOT_ELIGIBLE') then 'CRITICAL'
    else 'HIGH'
  end as severity,
  'Hồ sơ chính sách/BHXH cần xử lý' as exception_title,
  'BHXH_POLICY_CASE' as entity_type,
  coalesce(b.case_id, b.enrollment_id) as entity_id,
  coalesce(b.case_code, b.enrollment_code) as entity_code,
  b.student_name as entity_name,
  b.admission_segment_id,
  b.segment_code,
  b.segment_name,
  b.readiness_status,
  b.control_flags,
  'KHTC + PHAP_CHE + DAO_TAO' as owner_department,
  'Kiểm tra chuyên cần đã khóa, minh chứng, số tiền đề nghị và điều kiện chính sách trước khi nộp/duyệt.' as action_hint,
  'short_bhxh_policy_case_readiness' as source_view,
  coalesce(b.case_updated_at, now()) as updated_at
from public.short_bhxh_policy_case_readiness b
where b.readiness_status in ('BLOCKED', 'NOT_ELIGIBLE', 'NEEDS_EVIDENCE', 'NEEDS_FIX', 'NEEDS_AMOUNT')
  and public.can_access_business_scope(b.admission_segment_id, null::uuid)

union all

select
  'P1-08_FINANCE_' || f.invoice_id::text as exception_code,
  'P1-08 Finance/Invoice' as module_step,
  'FINANCE_CONTROL' as exception_group,
  case
    when f.readiness_status = 'BLOCKED' then 'CRITICAL'
    when f.readiness_status = 'OVERDUE' then 'HIGH'
    else 'MEDIUM'
  end as severity,
  'Công nợ ngắn hạn cần xử lý' as exception_title,
  'FINANCE_INVOICE' as entity_type,
  f.invoice_id as entity_id,
  f.invoice_code as entity_code,
  f.student_name as entity_name,
  f.admission_segment_id,
  f.segment_code,
  f.segment_name,
  f.readiness_status,
  f.control_flags,
  'KHTC + ACCOUNTING' as owner_department,
  'Kiểm tra số tiền, trạng thái invoice, hồ sơ chính sách nếu có và xử lý quá hạn/còn nợ.' as action_hint,
  'short_finance_invoice_readiness' as source_view,
  f.updated_at
from public.short_finance_invoice_readiness f
where f.readiness_status in ('BLOCKED', 'NEEDS_AMOUNT', 'NEEDS_FIX', 'OVERDUE')
  and public.can_access_business_scope(f.admission_segment_id, null::uuid)

union all

select
  'P1-09_PAYMENT_' || p.payment_id::text as exception_code,
  'P1-09 Payment' as module_step,
  'FINANCE_CONTROL' as exception_group,
  'CRITICAL' as severity,
  'Thanh toán ngắn hạn cần xử lý' as exception_title,
  'PAYMENT' as entity_type,
  p.payment_id as entity_id,
  p.payment_code as entity_code,
  p.student_name as entity_name,
  p.admission_segment_id,
  p.segment_code,
  p.segment_name,
  p.readiness_status,
  p.control_flags,
  'KHTC + ACCOUNTING + AUDIT' as owner_department,
  'Kiểm tra chứng từ, trùng mã giao dịch, số tiền vượt công nợ hoặc payment bị chặn trước khi xác nhận.' as action_hint,
  'short_payment_readiness' as source_view,
  p.updated_at
from public.short_payment_readiness p
where p.readiness_status = 'BLOCKED'
  and public.can_access_business_scope(p.admission_segment_id, null::uuid);

grant select on public.short_course_exception_register to authenticated;

create or replace view public.short_course_exception_summary
with (security_invoker = true)
as
select
  exception_group,
  module_step,
  owner_department,
  severity,
  count(*)::int as exception_count,
  min(updated_at) as oldest_updated_at,
  max(updated_at) as newest_updated_at
from public.short_course_exception_register
group by exception_group, module_step, owner_department, severity;

grant select on public.short_course_exception_summary to authenticated;

create or replace view public.short_course_dashboard_kpis
with (security_invoker = true)
as
select
  'TOTAL_STUDENTS' as metric_code,
  'Tổng học viên ngắn hạn' as metric_label,
  'OPERATIONS' as metric_group,
  student_count::numeric as metric_value,
  'LOW' as severity,
  'CTHSSV + DAO_TAO' as owner_department,
  'Tổng số Student Master ngắn hạn đang ACTIVE.' as metric_note
from public.short_course_data_foundation_summary

union all

select
  'OPEN_CLASSES',
  'Lớp đang vận hành/mở',
  'OPERATIONS',
  class_running_count::numeric,
  'LOW',
  'DAO_TAO',
  'Số lớp OPEN/IN_PROGRESS.'
from public.short_course_data_foundation_summary

union all

select
  'OPEN_EXCEPTIONS',
  'Việc lỗi đang cần xử lý',
  'EXCEPTION',
  coalesce((select count(*) from public.short_course_exception_register), 0)::numeric,
  case when coalesce((select count(*) from public.short_course_exception_register where severity in ('CRITICAL', 'HIGH')), 0) > 0 then 'CRITICAL' else 'LOW' end,
  'BGH + IT_DATA',
  'Tổng số exception từ Student/Class/Enrollment/Attendance/BHXH/Finance/Payment.'
from public.short_course_data_foundation_summary

union all

select
  'CRITICAL_EXCEPTIONS',
  'Lỗi nghiêm trọng',
  'EXCEPTION',
  coalesce((select count(*) from public.short_course_exception_register where severity = 'CRITICAL'), 0)::numeric,
  case when coalesce((select count(*) from public.short_course_exception_register where severity = 'CRITICAL'), 0) > 0 then 'CRITICAL' else 'LOW' end,
  'BGH + AUDIT',
  'Exception CRITICAL cần xử lý trước.'
from public.short_course_data_foundation_summary

union all

select
  'FINANCE_OPEN_BALANCE',
  'Công nợ còn phải thu',
  'FINANCE',
  finance_open_balance_vnd,
  case when finance_open_balance_vnd > 0 then 'HIGH' else 'LOW' end,
  'KHTC + ACCOUNTING',
  'Tổng số tiền còn phải thu từ công nợ ngắn hạn.'
from public.short_course_data_foundation_summary

union all

select
  'PAYMENT_PENDING',
  'Thanh toán chờ xác nhận',
  'FINANCE',
  payment_pending_count::numeric,
  case when payment_pending_count > 0 then 'MEDIUM' else 'LOW' end,
  'KHTC + ACCOUNTING',
  'Payment PENDING cần kế toán xác nhận hoặc từ chối.'
from public.short_course_data_foundation_summary

union all

select
  'BHXH_NEEDS_FIX',
  'Hồ sơ chính sách cần xử lý',
  'COMPLIANCE',
  bhxh_needs_fix_count::numeric,
  case when bhxh_needs_fix_count > 0 then 'HIGH' else 'LOW' end,
  'KHTC + PHAP_CHE + DAO_TAO',
  'Hồ sơ BHXH/chính sách chưa đủ điều kiện.'
from public.short_course_data_foundation_summary

union all

select
  'ATTENDANCE_NEEDS_FIX',
  'Điểm danh cần xử lý',
  'COMPLIANCE',
  attendance_needs_fix_count::numeric,
  case when attendance_needs_fix_count > 0 then 'HIGH' else 'LOW' end,
  'DAO_TAO + CTHSSV',
  'Buổi học thiếu/sai record điểm danh hoặc chưa sẵn sàng khóa.'
from public.short_course_data_foundation_summary;

grant select on public.short_course_dashboard_kpis to authenticated;

create or replace function public.sync_short_course_exception_alerts(p_limit int default 200)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not public.can_manage_short_exceptions() then
    raise exception 'Bạn chưa có quyền đồng bộ cảnh báo ngắn hạn.';
  end if;

  with picked as (
    select *
    from public.short_course_exception_register
    where severity in ('HIGH', 'CRITICAL')
    order by
      case severity when 'CRITICAL' then 1 when 'HIGH' then 2 else 3 end,
      updated_at asc
    limit greatest(1, least(coalesce(p_limit, 200), 500))
  ),
  upserted as (
    insert into public.short_risk_alerts (
      alert_code,
      alert_type,
      alert_title,
      entity_type,
      entity_id,
      entity_code,
      severity,
      alert_status,
      detected_by,
      owner_department,
      due_at,
      note,
      record_status,
      created_by,
      updated_by
    )
    select
      'AUTO_' || exception_code,
      exception_group,
      exception_title,
      entity_type,
      entity_id,
      entity_code,
      severity,
      'OPEN',
      'SYSTEM',
      owner_department,
      now() + case when severity = 'CRITICAL' then interval '24 hours' else interval '72 hours' end,
      action_hint || E'\nNguồn: ' || source_view || E'\nLỗi: ' || array_to_string(control_flags, ', '),
      'ACTIVE'::public.record_status,
      auth.uid(),
      auth.uid()
    from picked
    on conflict (alert_code) do update
    set alert_title = excluded.alert_title,
        entity_type = excluded.entity_type,
        entity_id = excluded.entity_id,
        entity_code = excluded.entity_code,
        severity = excluded.severity,
        alert_status = case
          when public.short_risk_alerts.alert_status in ('RESOLVED', 'DISMISSED') then 'OPEN'
          else public.short_risk_alerts.alert_status
        end,
        owner_department = excluded.owner_department,
        due_at = excluded.due_at,
        note = excluded.note,
        record_status = excluded.record_status,
        updated_by = auth.uid(),
        updated_at = now()
    returning id
  )
  select count(*)::int into v_count from upserted;

  return coalesce(v_count, 0);
end;
$$;

grant execute on function public.sync_short_course_exception_alerts(int) to authenticated;

create or replace view public.short_course_data_foundation_summary
with (security_invoker = true)
as
select
  (select count(*)::int from public.short_student_master where status = 'ACTIVE') as student_count,
  (select count(*)::int from public.short_class_master where status = 'ACTIVE') as class_count,
  (select count(*)::int from public.short_enrollments where record_status = 'ACTIVE') as enrollment_count,
  (select count(*)::int from public.short_attendance_sessions where record_status = 'ACTIVE') as attendance_session_count,
  (select count(*)::int from public.short_bhxh_policy_cases where record_status = 'ACTIVE') as bhxh_case_count,
  (select count(*)::int from public.short_finance_invoices where record_status = 'ACTIVE') as invoice_count,
  (select count(*)::int from public.short_payments where record_status = 'ACTIVE') as payment_count,
  (select count(*)::int from public.short_risk_alerts where record_status = 'ACTIVE' and alert_status <> 'RESOLVED') as open_risk_count,
  (select count(*)::int from public.short_student_master_quality_status where profile_status in ('BLOCKED', 'NEEDS_FIX')) as student_needs_fix_count,
  (select count(*)::int from public.short_student_master_quality_status where profile_status = 'DUPLICATE_RISK') as student_duplicate_risk_count,
  (select count(*)::int from public.short_student_master_quality_status where profile_status in ('VERIFIED', 'VERIFIED_LOCKED')) as student_verified_count,
  (select count(*)::int from public.short_class_master_readiness where readiness_status in ('BLOCKED', 'NEEDS_FIX')) as class_needs_fix_count,
  (select count(*)::int from public.short_class_master_readiness where readiness_status = 'OPEN_READY') as class_open_ready_count,
  (select count(*)::int from public.short_class_master_readiness where readiness_status in ('OPEN', 'IN_PROGRESS')) as class_running_count,
  (select count(*)::int from public.short_enrollment_class_assignment_readiness where readiness_status = 'UNASSIGNED') as enrollment_unassigned_count,
  (select count(*)::int from public.short_enrollment_class_assignment_readiness where readiness_status = 'BLOCKED') as enrollment_assignment_blocked_count,
  (select count(*)::int from public.short_enrollment_class_assignment_readiness where readiness_status in ('ASSIGNED_READY_FOR_CLASS_OPEN', 'VERIFIED_READY_FOR_CLASS_OPEN')) as enrollment_ready_for_class_open_count,
  (select count(*)::int from public.short_enrollment_class_assignment_readiness where readiness_status in ('ASSIGNED_NEEDS_VERIFY', 'READY_FOR_ATTENDANCE')) as enrollment_ready_for_attendance_count,
  (select count(*)::int from public.short_attendance_session_readiness where readiness_status in ('BLOCKED', 'NEEDS_SYNC', 'NEEDS_RECORDING')) as attendance_needs_fix_count,
  (select count(*)::int from public.short_attendance_session_readiness where readiness_status = 'READY_TO_LOCK') as attendance_ready_to_lock_count,
  (select count(*)::int from public.short_attendance_session_readiness where readiness_status in ('LOCKED', 'APPROVED')) as attendance_locked_or_approved_count,
  (select count(*)::int from public.short_bhxh_policy_case_readiness where readiness_status in ('BLOCKED', 'NEEDS_EVIDENCE', 'NEEDS_FIX', 'NEEDS_AMOUNT')) as bhxh_needs_fix_count,
  (select count(*)::int from public.short_bhxh_policy_case_readiness where readiness_status in ('READY_TO_CHECK', 'READY_TO_SUBMIT', 'SUBMITTED_READY_APPROVAL')) as bhxh_ready_count,
  (select count(*)::int from public.short_bhxh_policy_case_readiness where readiness_status = 'APPROVED') as bhxh_approved_count,
  (select count(*)::int from public.short_finance_invoice_readiness where readiness_status in ('BLOCKED', 'NEEDS_AMOUNT', 'NEEDS_FIX')) as finance_needs_fix_count,
  (select count(*)::int from public.short_finance_invoice_readiness where readiness_status in ('READY_TO_ISSUE', 'READY_TO_LOCK')) as finance_ready_count,
  (select coalesce(sum(balance_amount_vnd), 0)::numeric(14,2) from public.short_finance_invoice_readiness where readiness_status not in ('CANCELLED', 'REFUNDED')) as finance_open_balance_vnd,
  (select count(*)::int from public.short_payment_readiness where readiness_status = 'READY_TO_VERIFY') as payment_ready_to_verify_count,
  (select count(*)::int from public.short_payment_readiness where readiness_status = 'BLOCKED') as payment_needs_fix_count,
  (select count(*)::int from public.short_payment_readiness where payment_status = 'VERIFIED') as payment_verified_count,
  (select count(*)::int from public.short_payment_readiness where payment_status = 'PENDING') as payment_pending_count,
  (select coalesce(sum(payment_amount_vnd), 0)::numeric(14,2) from public.short_payment_readiness where payment_status = 'VERIFIED') as payment_verified_amount_vnd,
  (select count(*)::int from public.short_course_exception_register) as dashboard_exception_count,
  (select count(*)::int from public.short_course_exception_register where severity = 'CRITICAL') as dashboard_critical_exception_count,
  (select count(*)::int from public.short_course_exception_register where severity = 'HIGH') as dashboard_high_exception_count;

grant select on public.short_course_data_foundation_summary to authenticated;

insert into public.short_governance_rules (
  rule_code,
  rule_name,
  rule_group,
  rule_description,
  enforcement_level,
  source_table,
  target_process,
  owner_department,
  checker_role,
  approver_role,
  ai_allowed,
  control_status,
  status
) values
  (
    'SHORT_DASHBOARD_EXCEPTION_REGISTER_REQUIRED',
    'Dashboard ngắn hạn phải đọc từ exception register',
    'DASHBOARD_CONTROL',
    'BGH và trưởng bộ phận theo dõi lỗi vận hành qua short_course_exception_register, không dựa vào file rời hoặc trí nhớ cá nhân.',
    'WARN',
    'short_course_exception_register,short_course_dashboard_kpis',
    'P1-10 Short Course Dashboard & Exception Control',
    'BGH + IT_DATA',
    'AUDIT',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_EXCEPTION_SYNC_CONTROLLED',
    'Đồng bộ exception thành risk alert phải có quyền',
    'DASHBOARD_CONTROL',
    'Chỉ user có quyền exception.manage mới được đồng bộ exception HIGH/CRITICAL vào short_risk_alerts.',
    'BLOCK',
    'short_course_exception_register,short_risk_alerts',
    'P1-10 Short Course Dashboard & Exception Control',
    'AUDIT + IT_DATA',
    'BGH',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  )
on conflict (rule_code) do update
set rule_name = excluded.rule_name,
    rule_group = excluded.rule_group,
    rule_description = excluded.rule_description,
    enforcement_level = excluded.enforcement_level,
    source_table = excluded.source_table,
    target_process = excluded.target_process,
    owner_department = excluded.owner_department,
    checker_role = excluded.checker_role,
    approver_role = excluded.approver_role,
    ai_allowed = excluded.ai_allowed,
    control_status = excluded.control_status,
    status = excluded.status,
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
  'WF_P1_10_SHORT_DASHBOARD_EXCEPTION_CONTROL',
  'P1-10 Dashboard và kiểm soát exception ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'Mỗi ngày hoặc trước họp giao ban vận hành ngắn hạn.',
  'IT_DATA',
  'BGH + IT_DATA',
  'AUDIT',
  'BGH',
  'Dashboard KPI và exception register phản ánh lỗi/rủi ro thật trong chuỗi ngắn hạn.',
  'Exception HIGH/CRITICAL được đồng bộ thành short_risk_alerts để bộ phận phụ trách xử lý.',
  'Mọi đồng bộ exception sang risk alert phải qua function có quyền và được audit log.',
  910,
  'DAT_TAM_THOI'
)
on conflict (workflow_code) do update
set workflow_name = excluded.workflow_name,
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

insert into public.heu_os_approval_matrix (
  approval_code,
  module_code,
  workflow_code,
  decision_name,
  decision_level,
  maker_role,
  checker_role,
  approver_role,
  required_evidence,
  blocking_rule,
  sla_hours,
  control_status
) values (
  'APPROVE_P1_10_SHORT_EXCEPTION_SYNC',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_10_SHORT_DASHBOARD_EXCEPTION_CONTROL',
  'Đồng bộ exception ngắn hạn thành risk alert',
  'SYSTEM_CONTROL',
  'IT_DATA',
  'AUDIT',
  'BGH',
  'Exception register có lỗi HIGH/CRITICAL, nguồn view và action_hint rõ ràng.',
  'Không đồng bộ nếu user không có short_course.exception.manage.',
  24,
  'DAT_TAM_THOI'
)
on conflict (approval_code) do update
set workflow_code = excluded.workflow_code,
    decision_name = excluded.decision_name,
    maker_role = excluded.maker_role,
    checker_role = excluded.checker_role,
    approver_role = excluded.approver_role,
    required_evidence = excluded.required_evidence,
    blocking_rule = excluded.blocking_rule,
    sla_hours = excluded.sla_hours,
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
    'SHORT_COURSE_EXCEPTION_REGISTER',
    'Exception register ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_course_exception_register',
    'REPORT_VIEW',
    'BGH + IT_DATA',
    'HEU_OS',
    'RESTRICTED',
    true,
    'View chỉ đọc, gom lỗi từ các readiness view; xử lý lỗi tại module gốc.',
    'DAT_TAM_THOI'
  ),
  (
    'SHORT_COURSE_DASHBOARD_KPIS',
    'KPI dashboard ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'short_course_dashboard_kpis',
    'REPORT_VIEW',
    'BGH + IT_DATA',
    'HEU_OS',
    'INTERNAL',
    true,
    'View chỉ đọc cho dashboard; không nhập liệu trực tiếp.',
    'DAT_TAM_THOI'
  )
on conflict (data_code) do update
set data_name = excluded.data_name,
    source_table = excluded.source_table,
    data_type = excluded.data_type,
    owner_department = excluded.owner_department,
    sensitivity_level = excluded.sensitivity_level,
    ai_allowed = excluded.ai_allowed,
    change_rule = excluded.change_rule,
    control_status = excluded.control_status,
    updated_at = now();

insert into public.heu_os_risk_controls (
  risk_code,
  risk_name,
  module_code,
  risk_group,
  severity,
  owner_department,
  risk_description,
  control_rule,
  escalation_rule,
  dashboard_metric,
  control_status
) values
  (
    'RISK_P1_10_EXCEPTION_NOT_MONITORED',
    'Lỗi vận hành ngắn hạn không được theo dõi tập trung',
    'M11_SHORT_COURSE_ERP',
    'GOVERNANCE',
    'HIGH',
    'BGH + IT_DATA',
    'Nếu các lỗi nằm rải rác trong từng module, BGH/trưởng phòng không thấy điểm nghẽn và hệ thống quay lại phụ thuộc trí nhớ cá nhân.',
    'short_course_exception_register gom toàn bộ lỗi từ Student/Class/Enrollment/Attendance/BHXH/Finance/Payment.',
    'Nếu dashboard_exception_count tăng, IT_DATA/AUDIT phải phân công owner xử lý.',
    'dashboard_exception_count, dashboard_critical_exception_count',
    'DAT_TAM_THOI'
  ),
  (
    'RISK_P1_10_AI_OVERREACH',
    'AI vượt quyền trong xử lý exception',
    'M11_SHORT_COURSE_ERP',
    'AI_GOVERNANCE',
    'CRITICAL',
    'BGH + IT_DATA + AUDIT',
    'AI chỉ được đọc, gợi ý và cảnh báo; không tự duyệt, không tự sửa master data, không tự xác nhận tài chính.',
    'Exception sync chỉ tạo risk alert, không sửa trạng thái module gốc.',
    'BGH/AUDIT kiểm tra log nếu có thao tác tự động ngoài phạm vi.',
    'Số thao tác AI/automation không có người duyệt.',
    'DAT_TAM_THOI'
  )
on conflict (risk_code) do update
set risk_name = excluded.risk_name,
    risk_group = excluded.risk_group,
    severity = excluded.severity,
    owner_department = excluded.owner_department,
    risk_description = excluded.risk_description,
    control_rule = excluded.control_rule,
    escalation_rule = excluded.escalation_rule,
    dashboard_metric = excluded.dashboard_metric,
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
    'short_course_exception_register',
    'Exception register ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'REPORT_VIEW',
    'BGH + IT_DATA',
    'Danh sách lỗi/rủi ro tập trung trong chuỗi ngắn hạn.',
    'RESTRICTED',
    true,
    'DAT_TAM_THOI'
  ),
  (
    'short_course_dashboard_kpis',
    'Dashboard KPI ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'REPORT_VIEW',
    'BGH + IT_DATA',
    'Chỉ số dashboard vận hành, pháp chế, tài chính của module ngắn hạn.',
    'INTERNAL',
    true,
    'DAT_TAM_THOI'
  )
on conflict (table_code) do update
set table_name = excluded.table_name,
    module_code = excluded.module_code,
    table_type = excluded.table_type,
    data_owner_department = excluded.data_owner_department,
    purpose = excluded.purpose,
    sensitivity_level = excluded.sensitivity_level,
    ai_allowed = excluded.ai_allowed,
    control_status = excluded.control_status,
    updated_at = now();

insert into public.data_dictionary_fields (
  table_id,
  field_code,
  field_name,
  data_type,
  is_required,
  is_unique,
  is_sensitive,
  ai_allowed,
  validation_rule,
  note,
  control_status
)
select
  t.id,
  f.field_code,
  f.field_name,
  f.data_type,
  f.is_required,
  f.is_unique,
  f.is_sensitive,
  f.ai_allowed,
  f.validation_rule,
  f.note,
  'DAT_TAM_THOI'
from public.data_dictionary_tables t
cross join (
  values
    ('exception_code', 'Mã exception', 'text', true, true, false, true, 'Duy nhất theo module/entity.', 'Dùng để sync sang short_risk_alerts.'),
    ('severity', 'Mức độ nghiêm trọng', 'text', true, false, false, true, 'LOW/MEDIUM/HIGH/CRITICAL.', 'Dùng sắp xếp ưu tiên xử lý.'),
    ('control_flags', 'Cờ lỗi chi tiết', 'text[]', false, false, false, true, 'Danh sách lỗi từ view gốc.', 'Chỉ đúng chỗ sai.'),
    ('action_hint', 'Gợi ý xử lý', 'text', false, false, false, true, 'Gợi ý thao tác; AI không tự duyệt/sửa.', 'Dùng cho dashboard và AI assistant.')
) as f(field_code, field_name, data_type, is_required, is_unique, is_sensitive, ai_allowed, validation_rule, note)
where t.table_code = 'short_course_exception_register'
on conflict (table_id, field_code) do update
set field_name = excluded.field_name,
    data_type = excluded.data_type,
    is_required = excluded.is_required,
    is_unique = excluded.is_unique,
    is_sensitive = excluded.is_sensitive,
    ai_allowed = excluded.ai_allowed,
    validation_rule = excluded.validation_rule,
    note = excluded.note,
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
  'OWN_P1_10_SHORT_DASHBOARD_EXCEPTION_CONTROL',
  'P1-10 Dashboard và kiểm soát exception ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_10_SHORT_DASHBOARD_EXCEPTION_CONTROL',
  'WORKFLOW',
  'short_course_exception_register,short_course_dashboard_kpis',
  'BGH + IT_DATA',
  'IT_DATA',
  'AUDIT',
  'BGH',
  'RESTRICTED',
  'ALL_SHORT_MODULES',
  'BGH + OWNER_DEPARTMENTS',
  'Exception register, dashboard KPI và risk alert được đồng bộ có nguồn view rõ ràng.',
  'Mọi đồng bộ exception sang risk alert phải ghi audit log.',
  24,
  'HIGH',
  'DAT_TAM_THOI'
)
on conflict (ownership_code) do update
set process_name = excluded.process_name,
    workflow_code = excluded.workflow_code,
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
  decision_status,
  record_status
) values (
  'GATE_P1_10_SHORT_DASHBOARD_EXCEPTION_CONTROL',
  'Gate P1-10: dashboard exception ngắn hạn có nguồn dữ liệu đúng',
  'DATA',
  'VIEW',
  'short_course_exception_register',
  'BGH + IT_DATA + AUDIT',
  'IT_DATA kiểm tra exception register lấy từ đúng readiness view, không trộn file ngoài.',
  'BGH/AUDIT xác nhận AI chỉ hỗ trợ cảnh báo, không tự duyệt/sửa dữ liệu.',
  'DRAFT',
  'ACTIVE'::public.record_status
)
on conflict (gate_code) do update
set gate_name = excluded.gate_name,
    gate_type = excluded.gate_type,
    entity_type = excluded.entity_type,
    entity_code = excluded.entity_code,
    owner_department = excluded.owner_department,
    checker_note = excluded.checker_note,
    approver_note = excluded.approver_note,
    decision_status = excluded.decision_status,
    record_status = excluded.record_status,
    updated_at = now();

insert into public.heu_os_navigation_nodes (
  node_code,
  node_name,
  node_group,
  module_code,
  href,
  summary,
  owner_department,
  primary_action,
  sort_order,
  is_core,
  requires_attention_rule,
  control_status
) values (
  'NAV_P1_10_SHORT_DASHBOARD_EXCEPTION_CONTROL',
  'P1-10 Dashboard exception ngắn hạn',
  'REPORT_AI',
  'M11_SHORT_COURSE_ERP',
  '/master-control/modules/M11_SHORT_COURSE_ERP',
  'Dashboard KPI và exception register cho toàn chuỗi ngắn hạn.',
  'BGH + IT_DATA + AUDIT',
  'Xem exception register và đồng bộ HIGH/CRITICAL thành risk alert',
  120,
  true,
  'Cảnh báo nếu dashboard_critical_exception_count > 0 hoặc dashboard_exception_count tăng bất thường.',
  'DAT_TAM_THOI'
)
on conflict (node_code) do update
set node_name = excluded.node_name,
    node_group = excluded.node_group,
    module_code = excluded.module_code,
    href = excluded.href,
    summary = excluded.summary,
    owner_department = excluded.owner_department,
    primary_action = excluded.primary_action,
    sort_order = excluded.sort_order,
    is_core = excluded.is_core,
    requires_attention_rule = excluded.requires_attention_rule,
    control_status = excluded.control_status,
    updated_at = now();
