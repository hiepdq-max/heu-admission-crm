-- Step 64 - P1-02 Short Course Lead -> Student conversion.
-- Run after step63_fix_p1_01_vietnamese_encoding.sql.
--
-- Purpose:
-- - Store real program/major/offering IDs on leads, not only display text.
-- - Check whether a short-course lead can become a short-course student.
-- - Convert exactly once: Lead -> short_student_master -> short_enrollments.
-- - Keep the converted enrollment in DRAFT until class, attendance, finance and evidence gates are completed.

insert into public.role_permissions (role_id, permission)
select r.id, p.permission
from public.roles r
cross join lateral (
  values
    ('short_course.student.convert')
) as p(permission)
where r.code in ('ADMIN', 'BGH', 'ADMISSION_HEAD', 'TEAM_LEAD', 'CTHSSV', 'CTHSSV_LEAD')
on conflict (role_id, permission) do nothing;

alter table public.leads
add column if not exists admission_program_id uuid references public.admission_programs(id) on delete set null,
add column if not exists admission_major_id uuid references public.admission_majors(id) on delete set null,
add column if not exists admission_offering_id uuid references public.admission_offering_catalog(id) on delete set null;

create index if not exists idx_leads_admission_program_id
on public.leads(admission_program_id)
where admission_program_id is not null and is_deleted = false;

create index if not exists idx_leads_admission_major_id
on public.leads(admission_major_id)
where admission_major_id is not null and is_deleted = false;

create index if not exists idx_leads_admission_offering_id
on public.leads(admission_offering_id)
where admission_offering_id is not null and is_deleted = false;

update public.leads l
set admission_program_id = p.id,
    updated_at = now()
from public.admission_programs p
where l.admission_program_id is null
  and l.is_deleted = false
  and nullif(trim(coalesce(l.interested_program, '')), '') is not null
  and lower(trim(l.interested_program)) = lower(trim(p.program_name))
  and p.status = 'ACTIVE';

update public.leads l
set admission_major_id = m.id,
    admission_program_id = coalesce(l.admission_program_id, m.program_id),
    updated_at = now()
from public.admission_majors m
where l.admission_major_id is null
  and l.is_deleted = false
  and nullif(trim(coalesce(l.interested_major, '')), '') is not null
  and lower(trim(l.interested_major)) = lower(trim(m.major_name))
  and m.status = 'ACTIVE';

with single_offering as (
  select
    l.id as lead_id,
    min(o.id) as offering_id,
    count(*) as offering_count
  from public.leads l
  join public.admission_segments s on s.id = l.admission_segment_id
  join public.admission_offering_catalog o
    on o.admission_major_id = l.admission_major_id
   and s.segment_code = any(o.allowed_segment_codes)
   and o.status = 'ACTIVE'
  where l.admission_offering_id is null
    and l.admission_major_id is not null
    and l.is_deleted = false
  group by l.id
  having count(*) = 1
)
update public.leads l
set admission_offering_id = so.offering_id,
    updated_at = now()
from single_offering so
where so.lead_id = l.id;

create sequence if not exists public.short_student_code_seq;
create sequence if not exists public.short_enrollment_code_seq;

create or replace function public.next_short_student_code()
returns text
language sql
volatile
security definer
set search_path = public
as $$
  select 'SC-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.short_student_code_seq')::text, 6, '0')
$$;

create or replace function public.next_short_enrollment_code()
returns text
language sql
volatile
security definer
set search_path = public
as $$
  select 'SE-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.short_enrollment_code_seq')::text, 6, '0')
$$;

create or replace function public.can_convert_short_course_lead()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.has_permission('short_course.student.convert')
    or public.has_permission('short_course.student.manage')
    or public.has_permission('short_course.manage')
$$;

grant execute on function public.next_short_student_code() to authenticated;
grant execute on function public.next_short_enrollment_code() to authenticated;
grant execute on function public.can_convert_short_course_lead() to authenticated;

create or replace view public.short_course_lead_to_student_readiness
with (security_invoker = true)
as
select
  l.id as lead_id,
  l.lead_code,
  l.student_name,
  l.student_phone,
  l.student_phone_norm,
  l.parent_phone_norm,
  l.status as lead_status,
  l.assigned_to,
  l.created_by,
  l.admission_segment_id,
  s.segment_code,
  s.segment_name,
  w.operating_model,
  l.admission_program_id,
  p.program_code,
  p.program_name,
  l.admission_major_id,
  m.major_code,
  m.major_name,
  l.admission_offering_id,
  o.id as resolved_offering_id,
  o.offering_code,
  o.offering_name,
  o.is_enrollment_ready,
  o.is_finance_ready,
  o.control_status as offering_control_status,
  coalesce(offering_stats.offering_count, 0)::int as matching_offering_count,
  existing_by_lead.id as existing_student_id,
  duplicate_by_phone.id as duplicate_student_id,
  array_remove(array[
    case
      when not (
        s.segment_code like 'SHORT_%'
        or coalesce(w.operating_model, '') = 'SHORT_COURSE'
      ) then 'NOT_SHORT_COURSE_WORKSPACE'
    end,
    case
      when l.status::text not in ('DOCUMENT_SUBMITTED', 'ELIGIBLE', 'ENROLLED')
      then 'LEAD_NOT_ELIGIBLE'
    end,
    case
      when coalesce(l.student_phone_norm, l.parent_phone_norm) is null
      then 'NO_PHONE'
    end,
    case when l.admission_program_id is null then 'NO_PROGRAM_ID' end,
    case when l.admission_major_id is null then 'NO_MAJOR_ID' end,
    case
      when l.admission_offering_id is null
       and coalesce(offering_stats.offering_count, 0) > 1
      then 'MULTIPLE_OFFERINGS_NEED_SELECT'
    end,
    case when o.id is null then 'NO_OFFERING' end,
    case
      when o.id is not null and coalesce(o.is_enrollment_ready, false) is false
      then 'OFFERING_NOT_ENROLLMENT_READY'
    end,
    case
      when o.id is not null
       and coalesce(o.control_status, '') not in ('DAT', 'DAT_TAM_THOI')
      then 'OFFERING_NEEDS_CONTROL'
    end,
    case when existing_by_lead.id is not null then 'ALREADY_CONVERTED' end,
    case when duplicate_by_phone.id is not null then 'DUPLICATE_STUDENT_PHONE' end
  ], null) as control_flags,
  case
    when existing_by_lead.id is not null then 'CONVERTED'
    when not (
      s.segment_code like 'SHORT_%'
      or coalesce(w.operating_model, '') = 'SHORT_COURSE'
    ) then 'BLOCKED'
    when l.status::text not in ('DOCUMENT_SUBMITTED', 'ELIGIBLE', 'ENROLLED') then 'BLOCKED'
    when coalesce(l.student_phone_norm, l.parent_phone_norm) is null then 'BLOCKED'
    when l.admission_program_id is null or l.admission_major_id is null then 'BLOCKED'
    when l.admission_offering_id is null and coalesce(offering_stats.offering_count, 0) > 1 then 'BLOCKED'
    when o.id is null then 'BLOCKED'
    when duplicate_by_phone.id is not null then 'BLOCKED'
    when coalesce(o.is_enrollment_ready, false) is false then 'NEEDS_APPROVAL'
    when coalesce(o.control_status, '') not in ('DAT', 'DAT_TAM_THOI') then 'NEEDS_APPROVAL'
    else 'READY'
  end as readiness_status,
  (
    public.can_convert_short_course_lead()
    and public.can_write_lead(l.assigned_to, l.created_by)
    and public.can_access_business_scope(l.admission_segment_id, l.partner_id)
  ) as can_convert
from public.leads l
join public.admission_segments s on s.id = l.admission_segment_id
left join public.admission_segment_workspaces w
  on w.segment_id = s.id
 and w.status = 'ACTIVE'
left join public.admission_programs p on p.id = l.admission_program_id
left join public.admission_majors m on m.id = l.admission_major_id
left join lateral (
  select count(*) as offering_count
  from public.admission_offering_catalog offer_count
  where offer_count.status = 'ACTIVE'
    and s.segment_code = any(offer_count.allowed_segment_codes)
    and (
      l.admission_major_id is null
      or offer_count.admission_major_id = l.admission_major_id
    )
) offering_stats on true
left join lateral (
  select offer.*
  from public.admission_offering_catalog offer
  where offer.status = 'ACTIVE'
    and s.segment_code = any(offer.allowed_segment_codes)
    and (
      offer.id = l.admission_offering_id
      or (
        l.admission_offering_id is null
        and l.admission_major_id is not null
        and offer.admission_major_id = l.admission_major_id
      )
    )
  order by
    case when offer.id = l.admission_offering_id then 0 else 1 end,
    offer.offering_name
  limit 1
) o on true
left join public.short_student_master existing_by_lead
  on existing_by_lead.lead_id = l.id
 and existing_by_lead.status = 'ACTIVE'
left join public.short_student_master duplicate_by_phone
  on duplicate_by_phone.lead_id is distinct from l.id
 and duplicate_by_phone.status = 'ACTIVE'
 and coalesce(l.student_phone_norm, l.parent_phone_norm) is not null
 and duplicate_by_phone.student_phone_norm = coalesce(l.student_phone_norm, l.parent_phone_norm)
where l.is_deleted = false
  and (
    s.segment_code like 'SHORT_%'
    or coalesce(w.operating_model, '') = 'SHORT_COURSE'
  )
  and public.can_read_lead(l.assigned_to, l.created_by)
  and public.can_access_business_scope(l.admission_segment_id, l.partner_id);

grant select on public.short_course_lead_to_student_readiness to authenticated;

create or replace function public.convert_short_course_lead_to_student(
  target_lead_id uuid,
  target_offering_id uuid default null,
  conversion_note text default null
)
returns table (
  student_id uuid,
  enrollment_id uuid,
  result_status text,
  result_message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
  v_segment_code text;
  v_operating_model text;
  v_offering public.admission_offering_catalog%rowtype;
  v_offering_count int;
  v_existing_student_id uuid;
  v_existing_enrollment_id uuid;
  v_duplicate_student_id uuid;
  v_student_id uuid;
  v_enrollment_id uuid;
begin
  select *
  into v_lead
  from public.leads
  where id = target_lead_id
    and is_deleted = false
  for update;

  if not found then
    raise exception 'Không tìm thấy lead hoặc lead đã bị xoá.';
  end if;

  if not public.can_convert_short_course_lead() then
    raise exception 'Tài khoản chưa có quyền P1-02 chuyển lead ngắn hạn thành học viên.';
  end if;

  if not public.can_write_lead(v_lead.assigned_to, v_lead.created_by) then
    raise exception 'Tài khoản chưa có quyền cập nhật lead này.';
  end if;

  if not public.can_access_business_scope(v_lead.admission_segment_id, v_lead.partner_id) then
    raise exception 'Lead nằm ngoài phạm vi đối tượng tuyển sinh/đối tác được phân.';
  end if;

  select s.segment_code, coalesce(w.operating_model, '')
  into v_segment_code, v_operating_model
  from public.admission_segments s
  left join public.admission_segment_workspaces w
    on w.segment_id = s.id
   and w.status = 'ACTIVE'
  where s.id = v_lead.admission_segment_id
    and s.status = 'ACTIVE';

  if v_segment_code is null then
    raise exception 'Lead chưa gắn đối tượng tuyển sinh hợp lệ.';
  end if;

  if not (v_segment_code like 'SHORT_%' or v_operating_model = 'SHORT_COURSE') then
    raise exception 'P1-02 này chỉ dùng cho lead ngắn hạn.';
  end if;

  if v_lead.status::text not in ('DOCUMENT_SUBMITTED', 'ELIGIBLE', 'ENROLLED') then
    raise exception 'Lead chưa đủ trạng thái để chuyển thành học viên. Cần DOCUMENT_SUBMITTED, ELIGIBLE hoặc ENROLLED.';
  end if;

  if coalesce(v_lead.student_phone_norm, v_lead.parent_phone_norm) is null then
    raise exception 'Lead cần có số điện thoại hợp lệ trước khi chuyển thành học viên.';
  end if;

  select id
  into v_existing_student_id
  from public.short_student_master
  where lead_id = v_lead.id
    and status = 'ACTIVE'
  limit 1;

  if v_existing_student_id is not null then
    select id
    into v_existing_enrollment_id
    from public.short_enrollments
    where student_id = v_existing_student_id
      and record_status = 'ACTIVE'
    order by created_at desc
    limit 1;

    student_id := v_existing_student_id;
    enrollment_id := v_existing_enrollment_id;
    result_status := 'EXISTS';
    result_message := 'Lead này đã được chuyển sang Student Master trước đó, hệ thống không tạo trùng.';
    return next;
    return;
  end if;

  select id
  into v_duplicate_student_id
  from public.short_student_master
  where status = 'ACTIVE'
    and student_phone_norm is not null
    and student_phone_norm = coalesce(v_lead.student_phone_norm, v_lead.parent_phone_norm)
  limit 1;

  if v_duplicate_student_id is not null then
    raise exception 'Đã có học viên ngắn hạn khác dùng cùng số điện thoại. Cần kiểm tra trùng trước khi chuyển.';
  end if;

  if target_offering_id is not null then
    select *
    into v_offering
    from public.admission_offering_catalog
    where id = target_offering_id
      and status = 'ACTIVE';
  elsif v_lead.admission_offering_id is not null then
    select *
    into v_offering
    from public.admission_offering_catalog
    where id = v_lead.admission_offering_id
      and status = 'ACTIVE';
  elsif v_lead.admission_major_id is not null then
    select count(*)
    into v_offering_count
    from public.admission_offering_catalog o
    where o.status = 'ACTIVE'
      and o.admission_major_id = v_lead.admission_major_id
      and v_segment_code = any(o.allowed_segment_codes);

    if v_offering_count = 1 then
      select *
      into v_offering
      from public.admission_offering_catalog o
      where o.status = 'ACTIVE'
        and o.admission_major_id = v_lead.admission_major_id
        and v_segment_code = any(o.allowed_segment_codes)
      limit 1;
    elsif v_offering_count > 1 then
      raise exception 'Lead có nhiều ngành/khoá chi tiết phù hợp. Cần chọn admission_offering_id trước khi chuyển.';
    end if;
  end if;

  if v_offering.id is null then
    raise exception 'Lead chưa có ngành/khoá chi tiết hợp lệ để chuyển thành học viên.';
  end if;

  if not (v_segment_code = any(v_offering.allowed_segment_codes)) then
    raise exception 'Ngành/khoá chi tiết không thuộc workspace ngắn hạn của lead.';
  end if;

  if coalesce(v_offering.is_enrollment_ready, false) is false then
    raise exception 'Ngành/khoá chi tiết chưa sẵn sàng nhập học. Cần hoàn thiện pháp lý/học phí/gate trước.';
  end if;

  if coalesce(v_offering.control_status, '') not in ('DAT', 'DAT_TAM_THOI') then
    raise exception 'Ngành/khoá chi tiết đang cần sửa hoặc chưa đủ điều kiện kiểm soát.';
  end if;

  insert into public.short_student_master (
    student_code,
    lead_id,
    admission_segment_id,
    offering_id,
    student_name,
    student_phone,
    student_dob,
    student_gender,
    parent_name,
    parent_phone,
    address_line,
    province,
    ward,
    legacy_district,
    source_status,
    student_status,
    note,
    status,
    created_by,
    updated_by
  ) values (
    public.next_short_student_code(),
    v_lead.id,
    v_lead.admission_segment_id,
    v_offering.id,
    v_lead.student_name,
    coalesce(v_lead.student_phone, v_lead.parent_phone),
    v_lead.student_dob,
    v_lead.student_gender,
    v_lead.parent_name,
    v_lead.parent_phone,
    null,
    v_lead.province,
    v_lead.ward,
    v_lead.district,
    'FROM_LEAD',
    'STAGING',
    conversion_note,
    'ACTIVE'::public.record_status,
    auth.uid(),
    auth.uid()
  )
  returning id into v_student_id;

  insert into public.short_enrollments (
    enrollment_code,
    student_id,
    lead_id,
    admission_segment_id,
    offering_id,
    enrolled_on,
    enrollment_status,
    attendance_status,
    finance_status,
    bhxh_policy_status,
    evidence_status,
    note,
    record_status,
    created_by,
    updated_by
  ) values (
    public.next_short_enrollment_code(),
    v_student_id,
    v_lead.id,
    v_lead.admission_segment_id,
    v_offering.id,
    current_date,
    'DRAFT',
    'NOT_STARTED',
    'NOT_CREATED',
    'NOT_APPLICABLE',
    'NOT_READY',
    conversion_note,
    'ACTIVE'::public.record_status,
    auth.uid(),
    auth.uid()
  )
  returning id into v_enrollment_id;

  update public.leads
  set admission_program_id = coalesce(v_lead.admission_program_id, v_offering.program_id),
      admission_major_id = coalesce(v_lead.admission_major_id, v_offering.admission_major_id),
      admission_offering_id = v_offering.id,
      updated_at = now()
  where id = v_lead.id;

  insert into public.lead_activities (
    lead_id,
    activity_type,
    content,
    created_by
  ) values (
    v_lead.id,
    'NOTE'::public.activity_type,
    'P1-02: Đã chuyển lead ngắn hạn sang Student Master và tạo Enrollment nháp. ' ||
      coalesce(conversion_note, ''),
    auth.uid()
  );

  student_id := v_student_id;
  enrollment_id := v_enrollment_id;
  result_status := 'CREATED';
  result_message := 'Đã tạo Student Master và Enrollment nháp. Chưa ghi nhận nhập học chính thức cho tới khi qua các gate lớp/hồ sơ/tài chính.';
  return next;
end;
$$;

grant execute on function public.convert_short_course_lead_to_student(uuid, uuid, text) to authenticated;

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
    'SHORT_LEAD_TO_STUDENT_NO_DUPLICATE',
    'Không tạo trùng học viên từ lead ngắn hạn',
    'ENROLLMENT',
    'Một lead chỉ được chuyển thành một Student Master; số điện thoại đã có học viên thì phải kiểm tra trùng trước.',
    'BLOCK',
    'leads,short_student_master',
    'P1_02_LEAD_TO_STUDENT',
    'TUYEN_SINH + CTHSSV',
    'CTHSSV_LEAD',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'SHORT_LEAD_TO_STUDENT_REQUIRES_READY_OFFERING',
    'Chỉ chuyển khi ngành/khoá đã sẵn sàng nhập học',
    'CATALOG',
    'Lead phải có admission_offering_id thuộc đúng workspace ngắn hạn và offering phải qua gate pháp lý/học phí tối thiểu.',
    'BLOCK',
    'admission_offering_catalog,leads',
    'P1_02_LEAD_TO_STUDENT',
    'DAO_TAO + PHAP_CHE + KHTC',
    'PHAP_CHE + KHTC',
    'BGH',
    true,
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  )
on conflict (rule_code) do update set
  rule_name = excluded.rule_name,
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
  status = 'ACTIVE',
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
  'WF_P1_02_SHORT_LEAD_TO_STUDENT',
  'P1-02 Chuyển lead ngắn hạn thành học viên',
  'M11_SHORT_COURSE_ERP',
  'Lead ngắn hạn đã đủ điều kiện tư vấn/hồ sơ và chọn đúng ngành/khoá chi tiết.',
  'TUYEN_SINH',
  'TUYEN_SINH + CTHSSV + DAO_TAO',
  'CTHSSV_LEAD + DAO_TAO',
  'BGH',
  'Tạo short_student_master và short_enrollments ở trạng thái nháp, chưa tự ghi nhận nhập học chính thức.',
  'Sau P1-02, CTHSSV/Đào tạo tiếp tục gắn lớp, hồ sơ, điểm danh và tài chính theo các gate P1 tiếp theo.',
  'Function convert_short_course_lead_to_student ghi audit qua trigger bảng đích và tạo lead activity.',
  602,
  'DAT_TAM_THOI'
) on conflict (workflow_code) do update set
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
  control_status,
  status
) values (
  'APPROVE_P1_02_SHORT_LEAD_TO_STUDENT',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_02_SHORT_LEAD_TO_STUDENT',
  'Duyệt chuyển lead ngắn hạn thành học viên',
  'DEPARTMENT',
  'TUYEN_SINH',
  'CTHSSV_LEAD + DAO_TAO',
  'BGH',
  'Lead, đối tượng tuyển sinh, hệ/ngành, ngành/khoá chi tiết, điện thoại, trạng thái đủ điều kiện và kiểm tra trùng.',
  'Chặn nếu sai workspace, thiếu program/major/offering, offering chưa sẵn sàng nhập học hoặc trùng học viên.',
  24,
  'DAT_TAM_THOI',
  'ACTIVE'::public.record_status
) on conflict (approval_code) do update set
  module_code = excluded.module_code,
  workflow_code = excluded.workflow_code,
  decision_name = excluded.decision_name,
  decision_level = excluded.decision_level,
  maker_role = excluded.maker_role,
  checker_role = excluded.checker_role,
  approver_role = excluded.approver_role,
  required_evidence = excluded.required_evidence,
  blocking_rule = excluded.blocking_rule,
  sla_hours = excluded.sla_hours,
  control_status = excluded.control_status,
  status = 'ACTIVE',
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
    'MD_P1_02_SHORT_LEAD_LINK_IDS',
    'ID hệ/ngành/khoá trên lead',
    'M11_SHORT_COURSE_ERP',
    'leads.admission_program_id,leads.admission_major_id,leads.admission_offering_id',
    'TRANSACTION',
    'TUYEN_SINH + IT_DATA',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'Form tạo lead phải lưu ID thật; không dùng chữ tự nhập để chuyển học viên.',
    'DAT_TAM_THOI'
  ),
  (
    'MD_P1_02_SHORT_CONVERSION_READINESS',
    'Readiness chuyển lead ngắn hạn thành học viên',
    'M11_SHORT_COURSE_ERP',
    'short_course_lead_to_student_readiness',
    'REPORT_VIEW',
    'CTHSSV + DAO_TAO + IT_DATA',
    'HEU_OS',
    'CONFIDENTIAL',
    true,
    'View chỉ đọc; mọi chuyển đổi phải đi qua function convert_short_course_lead_to_student để chống tạo trùng.',
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
  control_status,
  status
) values
  (
    'RISK_P1_02_SHORT_DUPLICATE_STUDENT',
    'Tạo trùng học viên ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'DATA_QUALITY',
    'HIGH',
    'CTHSSV + IT_DATA',
    'Cùng một lead hoặc cùng số điện thoại bị chuyển thành nhiều Student Master làm sai học phí, điểm danh và báo cáo.',
    'short_student_master.lead_id unique; function kiểm tra phone trước khi insert; không cho tạo trực tiếp ngoài function.',
    'Nếu nghi trùng phải tạo cảnh báo rủi ro và trưởng bộ phận quyết định merge/sửa.',
    'Số lead có readiness DUPLICATE_STUDENT_PHONE hoặc ALREADY_CONVERTED.',
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'RISK_P1_02_SHORT_WRONG_OFFERING',
    'Chuyển sai ngành/khoá ngắn hạn',
    'M11_SHORT_COURSE_ERP',
    'COMPLIANCE',
    'HIGH',
    'TUYEN_SINH + DAO_TAO',
    'Nếu lead chỉ lưu chữ tự nhập hoặc chọn sai catalog thì học viên vào sai lớp/học phí/chính sách.',
    'Lead phải có admission_program_id, admission_major_id và admission_offering_id thuộc đúng allowed_segment_codes.',
    'Nếu thiếu ID thì dừng chuyển đổi, yêu cầu cập nhật lại lead theo form P0-17/P0-21.',
    'Số lead P1-02 bị NO_PROGRAM_ID, NO_MAJOR_ID, NO_OFFERING.',
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  ),
  (
    'RISK_P1_02_SHORT_PREMATURE_ENROLLMENT',
    'Ghi nhận nhập học quá sớm',
    'M11_SHORT_COURSE_ERP',
    'GOVERNANCE',
    'CRITICAL',
    'CTHSSV + KHTC + DAO_TAO',
    'Nếu chuyển lead thành nhập học chính thức trước khi có lớp/hồ sơ/tài chính thì báo cáo và công nợ sai.',
    'P1-02 chỉ tạo Enrollment DRAFT; trạng thái ENROLLED/STUDYING phải qua gate lớp, hồ sơ, tài chính và điểm danh sau.',
    'BGH/KHTC kiểm tra nếu có enrollment được ghi nhận chính thức khi thiếu gate.',
    'Số enrollment DRAFT, số enrollment bị thiếu class/finance/evidence.',
    'DAT_TAM_THOI',
    'ACTIVE'::public.record_status
  )
on conflict (risk_code) do update set
  risk_name = excluded.risk_name,
  module_code = excluded.module_code,
  risk_group = excluded.risk_group,
  severity = excluded.severity,
  owner_department = excluded.owner_department,
  risk_description = excluded.risk_description,
  control_rule = excluded.control_rule,
  escalation_rule = excluded.escalation_rule,
  dashboard_metric = excluded.dashboard_metric,
  control_status = excluded.control_status,
  status = 'ACTIVE',
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
    'short_course_lead_to_student_readiness',
    'Readiness chuyển lead ngắn hạn thành học viên',
    'M11_SHORT_COURSE_ERP',
    'REPORT_VIEW',
    'CTHSSV + DAO_TAO + IT_DATA',
    'Kiểm tra lead ngắn hạn đã đủ điều kiện chuyển sang Student Master/Enrollment hay chưa.',
    'CONFIDENTIAL',
    true,
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
  control_status,
  status
) values (
  'OWN_P1_02_SHORT_LEAD_TO_STUDENT',
  'Chuyển lead ngắn hạn thành học viên',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_02_SHORT_LEAD_TO_STUDENT',
  'SHORT_COURSE_LEAD',
  'leads,admission_offering_catalog,short_student_master,short_enrollments',
  'TUYEN_SINH + CTHSSV + DAO_TAO',
  'TUYEN_SINH',
  'CTHSSV_LEAD + DAO_TAO',
  'BGH',
  'ROLE_AND_SCOPE',
  'TUYEN_SINH',
  'CTHSSV + DAO_TAO',
  'Lead đủ điều kiện, ngành/khoá chi tiết hợp lệ, không trùng học viên.',
  'Function và bảng đích đều có audit; lead activity ghi dấu P1-02.',
  24,
  'HIGH',
  'DAT_TAM_THOI',
  'ACTIVE'::public.record_status
) on conflict (ownership_code) do update set
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
  status = 'ACTIVE',
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
  'GATE_P1_02_SHORT_LEAD_TO_STUDENT_READY',
  'P1-02 chuyển lead ngắn hạn thành học viên sẵn sàng',
  'GO_LIVE',
  'SHORT_COURSE_ERP',
  'P1_02_SHORT_LEAD_TO_STUDENT',
  'TUYEN_SINH + CTHSSV + DAO_TAO',
  'Kiểm tra view readiness, function convert, chống trùng và ID offering trên lead.',
  'BGH duyệt trước khi mở nút chuyển đổi cho vận hành hàng ngày hoặc AI gợi ý tự động.',
  'PENDING',
  'ACTIVE'::public.record_status
) on conflict (gate_code) do update set
  gate_name = excluded.gate_name,
  gate_type = excluded.gate_type,
  entity_type = excluded.entity_type,
  entity_code = excluded.entity_code,
  owner_department = excluded.owner_department,
  checker_note = excluded.checker_note,
  approver_note = excluded.approver_note,
  decision_status = excluded.decision_status,
  record_status = 'ACTIVE',
  updated_at = now();

insert into public.heu_os_navigation_nodes (
  node_code,
  node_name,
  node_group,
  module_code,
  href,
  owner_department,
  summary,
  primary_action,
  sort_order,
  is_core,
  requires_attention_rule,
  control_status
) values (
  'NAV_P1_02_SHORT_LEAD_TO_STUDENT',
  'P1-02 Lead sang học viên ngắn hạn',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/master-control/modules/M11_SHORT_COURSE_ERP',
  'TUYEN_SINH + CTHSSV + DAO_TAO',
  'Kiểm tra và chuyển lead ngắn hạn đủ điều kiện sang Student Master/Enrollment nháp.',
  'Xem readiness P1-02',
  213,
  true,
  'Cần chú ý nếu lead thiếu program/major/offering, offering chưa sẵn sàng hoặc bị trùng học viên.',
  'DAT_TAM_THOI'
) on conflict (node_code) do update set
  node_name = excluded.node_name,
  node_group = excluded.node_group,
  module_code = excluded.module_code,
  href = excluded.href,
  owner_department = excluded.owner_department,
  summary = excluded.summary,
  primary_action = excluded.primary_action,
  sort_order = excluded.sort_order,
  is_core = excluded.is_core,
  requires_attention_rule = excluded.requires_attention_rule,
  control_status = excluded.control_status,
  updated_at = now();
