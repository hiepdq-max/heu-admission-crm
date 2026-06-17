-- Step 82 - P1-18 Short Course Controlled Sample Data.
-- Run after step81_short_course_workflow_application_gate.sql.
--
-- Purpose:
-- - Seed a small, controlled, repeatable operational dataset for the short-course ERP.
-- - Keep the sample inside short-course admission workspaces only.
-- - Let users verify P1-13 to P1-17 across: student, class, enrollment,
--   attendance, BHXH/policy, invoice, payment, risk and workflow request.
--
-- Important:
-- - These rows are DEMO/SMOKE-TEST rows, not real school records.
-- - They are deliberately prefixed with P1-18 so they are searchable and removable later.

do $$
declare
  v_admin_id uuid;
  v_segment_id uuid;
  v_program_id uuid;
  v_major_id uuid;
  v_offering_id uuid;
  v_student_1_id uuid;
  v_student_2_id uuid;
  v_class_id uuid;
  v_enrollment_1_id uuid;
  v_enrollment_2_id uuid;
  v_session_1_id uuid;
  v_session_2_id uuid;
  v_bhxh_case_id uuid;
  v_invoice_1_id uuid;
  v_invoice_2_id uuid;
  v_payment_1_id uuid;
  v_scenario record;
begin
  select id
  into v_admin_id
  from public.users_profile
  where lower(email) in ('admin@heuschool.edu.vn', 'hiepdq@heuschool.edu.vn')
  order by case when lower(email) = 'admin@heuschool.edu.vn' then 0 else 1 end, created_at
  limit 1;

  for v_scenario in
    select *
    from (
      values
        (
          'SHORT_UNEMPLOYMENT_SUPPORT',
          'SHORT_DIGITAL_MARKETING',
          'DIGITAL_MARKETING_NGAN_HAN',
          'P1-18-TCTN',
          'P1-18 demo ngắn hạn trợ cấp thất nghiệp',
          'Trung tâm Dịch vụ việc làm - demo',
          'SHORT_BHXH_POLICY'
        ),
        (
          'SHORT_ONSITE_HEU',
          'SHORT_MARKETING_SEO',
          'MARKETING_SEO',
          'P1-18-HEU',
          'P1-18 demo ngắn hạn tại HEU',
          'HEU - 786 Kim Giang',
          'SHORT_COURSE'
        )
    ) as s(
      segment_code,
      offering_code,
      major_code,
      code_prefix,
      label_prefix,
      training_location,
      class_type
    )
  loop
    select id
    into v_segment_id
    from public.admission_segments
    where segment_code = v_scenario.segment_code
      and status = 'ACTIVE'::public.record_status
    limit 1;

    if v_segment_id is null then
      raise notice 'P1-18 skipped segment %, because admission segment is not available.', v_scenario.segment_code;
      continue;
    end if;

    select id
    into v_program_id
    from public.admission_programs
    where program_code = 'NGAN_HAN'
      and status = 'ACTIVE'::public.record_status
    limit 1;

    select id
    into v_major_id
    from public.admission_majors
    where major_code = v_scenario.major_code
      and status = 'ACTIVE'::public.record_status
    limit 1;

    if v_program_id is null or v_major_id is null then
      raise notice 'P1-18 skipped segment %, because NGAN_HAN program or major % is missing.', v_scenario.segment_code, v_scenario.major_code;
      continue;
    end if;

    select id
    into v_offering_id
    from public.admission_offering_catalog
    where offering_code = v_scenario.offering_code
    limit 1;

    if v_offering_id is null then
      insert into public.admission_offering_catalog (
        offering_code,
        offering_name,
        catalog_group_code,
        program_id,
        admission_major_id,
        allowed_segment_codes,
        delivery_model,
        partner_policy,
        legal_ref,
        tuition_policy_ref,
        com_policy_ref,
        is_advisable,
        is_enrollment_ready,
        is_finance_ready,
        owner_department,
        checker_department,
        approver_role,
        control_status,
        note,
        status,
        created_by,
        updated_by
      ) values (
        v_scenario.offering_code,
        v_scenario.label_prefix,
        'NGAN_HAN',
        v_program_id,
        v_major_id,
        array[v_scenario.segment_code]::text[],
        'P1-18 demo only',
        'P1-18 demo only',
        'P1-18 demo only',
        'P1-18 demo only',
        'P1-18 demo only',
        false,
        true,
        true,
        'DAO_TAO + TUYEN_SINH',
        'PHAP_CHE + KHTC + IT_DATA',
        'BGH_HIEU_TRUONG',
        'DAT_TAM_THOI',
        'Fallback offering created only because the expected short-course offering was missing.',
        'ACTIVE'::public.record_status,
        v_admin_id,
        v_admin_id
      )
      on conflict (offering_code) do update set
        offering_name = excluded.offering_name,
        program_id = excluded.program_id,
        admission_major_id = excluded.admission_major_id,
        allowed_segment_codes = excluded.allowed_segment_codes,
        updated_by = excluded.updated_by,
        updated_at = now()
      returning id into v_offering_id;
    end if;

    insert into public.short_student_master (
      student_code,
      admission_segment_id,
      offering_id,
      student_name,
      student_phone,
      student_dob,
      student_gender,
      identity_no,
      parent_name,
      parent_phone,
      address_line,
      province,
      ward,
      source_status,
      student_status,
      note,
      status,
      created_by,
      updated_by
    ) values (
      v_scenario.code_prefix || '-STU-001',
      v_segment_id,
      v_offering_id,
      'Nguyễn Minh Anh ' || v_scenario.code_prefix,
      '0918000001',
      date '2001-02-15',
      'Nữ',
      '001201000001',
      'Nguyễn Văn Mẫu',
      '0918999001',
      'Dữ liệu mẫu P1-18',
      'Hà Nội',
      'Định Công',
      'MANUAL',
      'ACTIVE',
      'P1-18 demo: học viên mẫu đã đủ thông tin cơ bản để kiểm tra drilldown.',
      'ACTIVE'::public.record_status,
      v_admin_id,
      v_admin_id
    )
    on conflict (student_code) do update set
      admission_segment_id = excluded.admission_segment_id,
      offering_id = excluded.offering_id,
      student_name = excluded.student_name,
      student_phone = excluded.student_phone,
      student_status = excluded.student_status,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now()
    returning id into v_student_1_id;

    insert into public.short_student_master (
      student_code,
      admission_segment_id,
      offering_id,
      student_name,
      student_phone,
      student_dob,
      student_gender,
      identity_no,
      parent_name,
      parent_phone,
      address_line,
      province,
      ward,
      source_status,
      student_status,
      note,
      status,
      created_by,
      updated_by
    ) values (
      v_scenario.code_prefix || '-STU-002',
      v_segment_id,
      v_offering_id,
      'Trần Gia Bảo ' || v_scenario.code_prefix,
      '0918000002',
      date '2000-09-20',
      'Nam',
      '001200000002',
      'Trần Thị Mẫu',
      '0918999002',
      'Dữ liệu mẫu P1-18',
      'Hà Nội',
      'Kim Giang',
      'MANUAL',
      'ACTIVE',
      'P1-18 demo: học viên mẫu còn một cảnh báo để kiểm tra workflow/risk.',
      'ACTIVE'::public.record_status,
      v_admin_id,
      v_admin_id
    )
    on conflict (student_code) do update set
      admission_segment_id = excluded.admission_segment_id,
      offering_id = excluded.offering_id,
      student_name = excluded.student_name,
      student_phone = excluded.student_phone,
      student_status = excluded.student_status,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now()
    returning id into v_student_2_id;

    insert into public.short_class_master (
      class_code,
      class_name,
      admission_segment_id,
      offering_id,
      training_location,
      instructor_name,
      planned_start_date,
      planned_end_date,
      actual_start_date,
      capacity,
      schedule_note,
      class_status,
      note,
      status,
      created_by,
      updated_by
    ) values (
      v_scenario.code_prefix || '-CLASS-001',
      v_scenario.label_prefix || ' - lớp 01',
      v_segment_id,
      v_offering_id,
      v_scenario.training_location,
      'Giảng viên demo P1-18',
      current_date - 7,
      current_date + 23,
      current_date - 7,
      25,
      'Lịch mẫu: tối thứ 2/4/6. Chỉ dùng để kiểm thử hệ thống.',
      'IN_PROGRESS',
      'P1-18 demo: lớp mẫu đã qua trạng thái mở lớp để kiểm tra điểm danh, công nợ và rủi ro.',
      'ACTIVE'::public.record_status,
      v_admin_id,
      v_admin_id
    )
    on conflict (class_code) do update set
      class_name = excluded.class_name,
      admission_segment_id = excluded.admission_segment_id,
      offering_id = excluded.offering_id,
      training_location = excluded.training_location,
      instructor_name = excluded.instructor_name,
      planned_start_date = excluded.planned_start_date,
      planned_end_date = excluded.planned_end_date,
      actual_start_date = excluded.actual_start_date,
      capacity = excluded.capacity,
      schedule_note = excluded.schedule_note,
      class_status = excluded.class_status,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now()
    returning id into v_class_id;

    update public.short_class_master
    set class_type = v_scenario.class_type,
        learning_mode = 'OFFLINE',
        room_name = 'Phòng demo P1-18',
        min_capacity = 1,
        opened_at = coalesce(opened_at, now()),
        opened_by = coalesce(opened_by, v_admin_id),
        open_approved_at = coalesce(open_approved_at, now()),
        open_approved_by = coalesce(open_approved_by, v_admin_id),
        open_gate_status = 'APPROVED',
        schedule_quality_status = 'READY',
        class_quality_status = 'OPEN_APPROVED',
        data_locked = true,
        locked_reason = 'P1-18 demo: khóa dữ liệu mẫu để kiểm thử kiểm soát.',
        locked_by = coalesce(locked_by, v_admin_id),
        locked_at = coalesce(locked_at, now()),
        updated_by = v_admin_id,
        updated_at = now()
    where id = v_class_id;

    insert into public.short_enrollments (
      enrollment_code,
      student_id,
      class_id,
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
      v_scenario.code_prefix || '-ENR-001',
      v_student_1_id,
      v_class_id,
      v_segment_id,
      v_offering_id,
      current_date - 6,
      'STUDYING',
      'ACTIVE',
      'PARTIAL',
      case when v_scenario.segment_code = 'SHORT_UNEMPLOYMENT_SUPPORT' then 'ELIGIBLE' else 'NOT_APPLICABLE' end,
      'CHECKED',
      'P1-18 demo: ghi danh mẫu đã gắn lớp và có phát sinh tài chính.',
      'ACTIVE'::public.record_status,
      v_admin_id,
      v_admin_id
    )
    on conflict (enrollment_code) do update set
      student_id = excluded.student_id,
      class_id = excluded.class_id,
      admission_segment_id = excluded.admission_segment_id,
      offering_id = excluded.offering_id,
      enrolled_on = excluded.enrolled_on,
      enrollment_status = excluded.enrollment_status,
      attendance_status = excluded.attendance_status,
      finance_status = excluded.finance_status,
      bhxh_policy_status = excluded.bhxh_policy_status,
      evidence_status = excluded.evidence_status,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now()
    returning id into v_enrollment_1_id;

    insert into public.short_enrollments (
      enrollment_code,
      student_id,
      class_id,
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
      v_scenario.code_prefix || '-ENR-002',
      v_student_2_id,
      v_class_id,
      v_segment_id,
      v_offering_id,
      current_date - 6,
      'ENROLLED',
      'AT_RISK',
      'INVOICED',
      case when v_scenario.segment_code = 'SHORT_UNEMPLOYMENT_SUPPORT' then 'PENDING' else 'NOT_APPLICABLE' end,
      'PARTIAL',
      'P1-18 demo: ghi danh mẫu có cảnh báo để kiểm tra risk/workflow.',
      'ACTIVE'::public.record_status,
      v_admin_id,
      v_admin_id
    )
    on conflict (enrollment_code) do update set
      student_id = excluded.student_id,
      class_id = excluded.class_id,
      admission_segment_id = excluded.admission_segment_id,
      offering_id = excluded.offering_id,
      enrolled_on = excluded.enrolled_on,
      enrollment_status = excluded.enrollment_status,
      attendance_status = excluded.attendance_status,
      finance_status = excluded.finance_status,
      bhxh_policy_status = excluded.bhxh_policy_status,
      evidence_status = excluded.evidence_status,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now()
    returning id into v_enrollment_2_id;

    update public.short_enrollments
    set assignment_status = 'VERIFIED',
        assigned_at = coalesce(assigned_at, now()),
        assigned_by = coalesce(assigned_by, v_admin_id),
        assignment_verified_at = coalesce(assignment_verified_at, now()),
        assignment_verified_by = coalesce(assignment_verified_by, v_admin_id),
        assignment_note = 'P1-18 demo: đã xác nhận gán lớp.',
        updated_by = v_admin_id,
        updated_at = now()
    where id in (v_enrollment_1_id, v_enrollment_2_id);

    insert into public.short_attendance_sessions (
      session_code,
      class_id,
      session_date,
      start_time,
      end_time,
      session_title,
      instructor_user_id,
      session_status,
      attendance_locked,
      locked_by,
      locked_at,
      note,
      record_status,
      created_by,
      updated_by
    ) values (
      v_scenario.code_prefix || '-ATT-001',
      v_class_id,
      current_date - 3,
      time '18:30',
      time '20:30',
      'P1-18 demo: buổi 1 đã khóa điểm danh',
      null,
      'APPROVED',
      true,
      v_admin_id,
      now(),
      'P1-18 demo: dùng để kiểm tra tab điểm danh.',
      'ACTIVE'::public.record_status,
      v_admin_id,
      v_admin_id
    )
    on conflict (session_code) do update set
      class_id = excluded.class_id,
      session_date = excluded.session_date,
      start_time = excluded.start_time,
      end_time = excluded.end_time,
      session_title = excluded.session_title,
      session_status = excluded.session_status,
      attendance_locked = excluded.attendance_locked,
      locked_by = excluded.locked_by,
      locked_at = excluded.locked_at,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now()
    returning id into v_session_1_id;

    update public.short_attendance_sessions
    set session_type = 'LESSON',
        sequence_no = 1,
        expected_student_count = 2,
        actual_present_count = 1,
        actual_absent_count = 0,
        actual_late_count = 1,
        actual_unknown_count = 0,
        attendance_quality_status = 'APPROVED',
        approved_by = coalesce(approved_by, v_admin_id),
        approved_at = coalesce(approved_at, now()),
        approval_note = 'P1-18 demo: buổi điểm danh đã duyệt.',
        updated_by = v_admin_id,
        updated_at = now()
    where id = v_session_1_id;

    insert into public.short_attendance_sessions (
      session_code,
      class_id,
      session_date,
      start_time,
      end_time,
      session_title,
      session_status,
      attendance_locked,
      note,
      record_status,
      created_by,
      updated_by
    ) values (
      v_scenario.code_prefix || '-ATT-002',
      v_class_id,
      current_date + 1,
      time '18:30',
      time '20:30',
      'P1-18 demo: buổi 2 chuẩn bị điểm danh',
      'OPEN',
      false,
      'P1-18 demo: buổi mở để kiểm tra trạng thái chưa khóa.',
      'ACTIVE'::public.record_status,
      v_admin_id,
      v_admin_id
    )
    on conflict (session_code) do update set
      class_id = excluded.class_id,
      session_date = excluded.session_date,
      start_time = excluded.start_time,
      end_time = excluded.end_time,
      session_title = excluded.session_title,
      session_status = excluded.session_status,
      attendance_locked = excluded.attendance_locked,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now()
    returning id into v_session_2_id;

    insert into public.short_attendance_records (
      session_id,
      enrollment_id,
      student_id,
      attendance_status,
      checked_by,
      checked_at,
      note,
      record_status,
      created_by,
      updated_by
    ) values
      (
        v_session_1_id,
        v_enrollment_1_id,
        v_student_1_id,
        'PRESENT',
        v_admin_id,
        now(),
        'P1-18 demo: có mặt.',
        'ACTIVE'::public.record_status,
        v_admin_id,
        v_admin_id
      ),
      (
        v_session_1_id,
        v_enrollment_2_id,
        v_student_2_id,
        'LATE',
        v_admin_id,
        now(),
        'P1-18 demo: đi muộn để tạo tín hiệu theo dõi.',
        'ACTIVE'::public.record_status,
        v_admin_id,
        v_admin_id
      )
    on conflict (session_id, enrollment_id) do update set
      student_id = excluded.student_id,
      attendance_status = excluded.attendance_status,
      checked_by = excluded.checked_by,
      checked_at = excluded.checked_at,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now();

    insert into public.short_bhxh_policy_cases (
      case_code,
      enrollment_id,
      student_id,
      class_id,
      policy_type,
      required_attendance_percent,
      actual_attendance_percent,
      requested_amount_vnd,
      approved_amount_vnd,
      eligibility_status,
      case_status,
      evidence_url,
      checked_by,
      checked_at,
      note,
      record_status,
      created_by,
      updated_by
    ) values (
      v_scenario.code_prefix || '-BHXH-001',
      v_enrollment_1_id,
      v_student_1_id,
      v_class_id,
      case when v_scenario.segment_code = 'SHORT_UNEMPLOYMENT_SUPPORT' then 'UNEMPLOYMENT_SUPPORT' else 'NOT_APPLICABLE' end,
      case when v_scenario.segment_code = 'SHORT_UNEMPLOYMENT_SUPPORT' then 80 else null end,
      case when v_scenario.segment_code = 'SHORT_UNEMPLOYMENT_SUPPORT' then 92 else null end,
      case when v_scenario.segment_code = 'SHORT_UNEMPLOYMENT_SUPPORT' then 4500000 else null end,
      null,
      case when v_scenario.segment_code = 'SHORT_UNEMPLOYMENT_SUPPORT' then 'ELIGIBLE' else 'NOT_ELIGIBLE' end,
      case when v_scenario.segment_code = 'SHORT_UNEMPLOYMENT_SUPPORT' then 'CHECKED' else 'CANCELLED' end,
      'https://drive.google.com/p1-18-demo',
      v_admin_id,
      now(),
      'P1-18 demo: case chính sách để kiểm tra tab BHXH/chính sách.',
      'ACTIVE'::public.record_status,
      v_admin_id,
      v_admin_id
    )
    on conflict (case_code) do update set
      enrollment_id = excluded.enrollment_id,
      student_id = excluded.student_id,
      class_id = excluded.class_id,
      policy_type = excluded.policy_type,
      required_attendance_percent = excluded.required_attendance_percent,
      actual_attendance_percent = excluded.actual_attendance_percent,
      requested_amount_vnd = excluded.requested_amount_vnd,
      approved_amount_vnd = excluded.approved_amount_vnd,
      eligibility_status = excluded.eligibility_status,
      case_status = excluded.case_status,
      evidence_url = excluded.evidence_url,
      checked_by = excluded.checked_by,
      checked_at = excluded.checked_at,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now()
    returning id into v_bhxh_case_id;

    update public.short_bhxh_policy_cases
    set policy_rule_code = case when v_scenario.segment_code = 'SHORT_UNEMPLOYMENT_SUPPORT' then 'P1_18_UNEMPLOYMENT_SUPPORT_DEMO' else 'P1_18_NOT_APPLICABLE' end,
        policy_period = to_char(current_date, 'YYYY-MM'),
        locked_session_count = 1,
        attendance_snapshot = jsonb_build_object(
          'locked_sessions', 1,
          'actual_attendance_percent',
          case when v_scenario.segment_code = 'SHORT_UNEMPLOYMENT_SUPPORT' then 92 else null end
        ),
        evidence_status = 'CHECKED',
        evidence_note = 'P1-18 demo: minh chứng mẫu.',
        eligibility_checked_by = coalesce(eligibility_checked_by, v_admin_id),
        eligibility_checked_at = coalesce(eligibility_checked_at, now()),
        review_note = 'P1-18 demo: dùng để kiểm tra readiness.',
        updated_by = v_admin_id,
        updated_at = now()
    where id = v_bhxh_case_id;

    insert into public.short_finance_invoices (
      invoice_code,
      enrollment_id,
      student_id,
      class_id,
      offering_id,
      invoice_type,
      expected_amount_vnd,
      discount_amount_vnd,
      payable_amount_vnd,
      paid_amount_vnd,
      due_date,
      invoice_status,
      note,
      record_status,
      created_by,
      updated_by
    ) values (
      v_scenario.code_prefix || '-INV-001',
      v_enrollment_1_id,
      v_student_1_id,
      v_class_id,
      v_offering_id,
      'TUITION',
      3000000,
      0,
      3000000,
      1000000,
      current_date + 7,
      'PARTIAL_PAID',
      'P1-18 demo: công nợ đã thu một phần.',
      'ACTIVE'::public.record_status,
      v_admin_id,
      v_admin_id
    )
    on conflict (invoice_code) do update set
      enrollment_id = excluded.enrollment_id,
      student_id = excluded.student_id,
      class_id = excluded.class_id,
      offering_id = excluded.offering_id,
      invoice_type = excluded.invoice_type,
      expected_amount_vnd = excluded.expected_amount_vnd,
      discount_amount_vnd = excluded.discount_amount_vnd,
      payable_amount_vnd = excluded.payable_amount_vnd,
      paid_amount_vnd = excluded.paid_amount_vnd,
      due_date = excluded.due_date,
      invoice_status = excluded.invoice_status,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now()
    returning id into v_invoice_1_id;

    insert into public.short_finance_invoices (
      invoice_code,
      enrollment_id,
      student_id,
      class_id,
      offering_id,
      invoice_type,
      expected_amount_vnd,
      discount_amount_vnd,
      payable_amount_vnd,
      paid_amount_vnd,
      due_date,
      invoice_status,
      note,
      record_status,
      created_by,
      updated_by
    ) values (
      v_scenario.code_prefix || '-INV-002',
      v_enrollment_2_id,
      v_student_2_id,
      v_class_id,
      v_offering_id,
      'TUITION',
      3000000,
      0,
      3000000,
      0,
      current_date - 1,
      'ISSUED',
      'P1-18 demo: công nợ quá hạn nhẹ để kiểm tra cảnh báo.',
      'ACTIVE'::public.record_status,
      v_admin_id,
      v_admin_id
    )
    on conflict (invoice_code) do update set
      enrollment_id = excluded.enrollment_id,
      student_id = excluded.student_id,
      class_id = excluded.class_id,
      offering_id = excluded.offering_id,
      invoice_type = excluded.invoice_type,
      expected_amount_vnd = excluded.expected_amount_vnd,
      discount_amount_vnd = excluded.discount_amount_vnd,
      payable_amount_vnd = excluded.payable_amount_vnd,
      paid_amount_vnd = excluded.paid_amount_vnd,
      due_date = excluded.due_date,
      invoice_status = excluded.invoice_status,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now()
    returning id into v_invoice_2_id;

    update public.short_finance_invoices
    set policy_case_id = case when invoice_code = v_scenario.code_prefix || '-INV-001' then v_bhxh_case_id else policy_case_id end,
        invoice_period = to_char(current_date, 'YYYY-MM'),
        source_type = 'MANUAL',
        issued_by = coalesce(issued_by, v_admin_id),
        issued_at = coalesce(issued_at, now()),
        finance_note = 'P1-18 demo: dữ liệu mẫu kiểm tra công nợ.',
        updated_by = v_admin_id,
        updated_at = now()
    where id in (v_invoice_1_id, v_invoice_2_id);

    insert into public.short_payments (
      payment_code,
      invoice_id,
      enrollment_id,
      student_id,
      payment_amount_vnd,
      payment_date,
      payment_method,
      voucher_no,
      bank_ref,
      payer_name,
      payment_status,
      verified_by,
      verified_at,
      note,
      record_status,
      created_by,
      updated_by
    ) values (
      v_scenario.code_prefix || '-PAY-001',
      v_invoice_1_id,
      v_enrollment_1_id,
      v_student_1_id,
      1000000,
      current_date - 2,
      'BANK_TRANSFER',
      v_scenario.code_prefix || '-VOUCHER-001',
      v_scenario.code_prefix || '-BANK-REF-001',
      'Nguyễn Minh Anh',
      'VERIFIED',
      v_admin_id,
      now(),
      'P1-18 demo: khoản thu đã đối soát.',
      'ACTIVE'::public.record_status,
      v_admin_id,
      v_admin_id
    )
    on conflict (payment_code) do update set
      invoice_id = excluded.invoice_id,
      enrollment_id = excluded.enrollment_id,
      student_id = excluded.student_id,
      payment_amount_vnd = excluded.payment_amount_vnd,
      payment_date = excluded.payment_date,
      payment_method = excluded.payment_method,
      voucher_no = excluded.voucher_no,
      bank_ref = excluded.bank_ref,
      payer_name = excluded.payer_name,
      payment_status = excluded.payment_status,
      verified_by = excluded.verified_by,
      verified_at = excluded.verified_at,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now()
    returning id into v_payment_1_id;

    update public.short_payments
    set receipt_no = v_scenario.code_prefix || '-RECEIPT-001',
        evidence_url = 'https://drive.google.com/p1-18-payment-demo',
        reconcile_status = 'MATCHED',
        reconciled_by = coalesce(reconciled_by, v_admin_id),
        reconciled_at = coalesce(reconciled_at, now()),
        payment_locked = true,
        payment_source = 'MANUAL',
        accounting_note = 'P1-18 demo: đã ghi nhận kế toán mẫu.',
        verified_note = 'P1-18 demo: verified.',
        updated_by = v_admin_id,
        updated_at = now()
    where id = v_payment_1_id;

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
      assigned_to,
      due_at,
      note,
      record_status,
      created_by,
      updated_by
    ) values (
      v_scenario.code_prefix || '-RISK-001',
      'P1_18_SAMPLE_EXCEPTION',
      'P1-18 demo: ghi danh còn thiếu minh chứng/đối soát',
      'SHORT_ENROLLMENT',
      v_enrollment_2_id,
      v_scenario.code_prefix || '-ENR-002',
      'HIGH',
      'OPEN',
      'P1_18_SEED',
      'DAO_TAO + KHTC + CTHSSV',
      v_admin_id,
      now() + interval '48 hours',
      'P1-18 demo: cảnh báo mẫu để kiểm tra tab rủi ro và workflow request.',
      'ACTIVE'::public.record_status,
      v_admin_id,
      v_admin_id
    )
    on conflict (alert_code) do update set
      entity_id = excluded.entity_id,
      entity_code = excluded.entity_code,
      severity = excluded.severity,
      alert_status = excluded.alert_status,
      owner_department = excluded.owner_department,
      assigned_to = excluded.assigned_to,
      due_at = excluded.due_at,
      note = excluded.note,
      updated_by = excluded.updated_by,
      updated_at = now();

    if exists (
      select 1
      from public.heu_os_approval_matrix
      where approval_code = 'APPROVE_P1_15_SHORT_WORK_REQUEST'
    ) then
      insert into public.approval_requests (
        approval_code,
        request_code,
        request_title,
        entity_type,
        entity_id,
        entity_code,
        request_note,
        evidence_url,
        maker_note,
        request_status,
        requested_by,
        due_at,
        admission_segment_id,
        record_status,
        created_by,
        updated_by
      ) values (
        'APPROVE_P1_15_SHORT_WORK_REQUEST',
        v_scenario.code_prefix || '-WF-001',
        'P1-18 demo: xử lý cảnh báo ghi danh',
        'SHORT_ENROLLMENT',
        v_enrollment_2_id,
        v_scenario.code_prefix || '-ENR-002',
        'P1-18 demo: phiếu mẫu gắn với ghi danh để kiểm tra P1-17.',
        'https://drive.google.com/p1-18-workflow-demo',
        'Tạo tự động từ seed P1-18 để kiểm tra trạng thái phiếu trên drilldown.',
        'PENDING_CHECK',
        v_admin_id,
        now() + interval '48 hours',
        v_segment_id,
        'ACTIVE'::public.record_status,
        v_admin_id,
        v_admin_id
      )
      on conflict (request_code) do update set
        entity_id = excluded.entity_id,
        entity_code = excluded.entity_code,
        request_note = excluded.request_note,
        evidence_url = excluded.evidence_url,
        maker_note = excluded.maker_note,
        request_status = excluded.request_status,
        requested_by = excluded.requested_by,
        due_at = excluded.due_at,
        admission_segment_id = excluded.admission_segment_id,
        record_status = excluded.record_status,
        updated_by = excluded.updated_by,
        updated_at = now();
    end if;
  end loop;
end $$;

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
  'WF_P1_18_SHORT_CONTROLLED_SAMPLE_DATA',
  'P1-18 Bộ dữ liệu mẫu kiểm thử ERP ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'Cần kiểm tra P1-13 đến P1-17 bằng dữ liệu thật có kiểm soát nhưng không dùng hồ sơ thật.',
  'IT_DATA',
  'IT_DATA + OWNER_DEPARTMENTS',
  'AUDIT + OWNER_DEPARTMENTS',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Có học viên, lớp, ghi danh, điểm danh, BHXH/chính sách, công nợ, thanh toán, rủi ro và phiếu xử lý mẫu.',
  'Dữ liệu mẫu chỉ nằm trong workspace ngắn hạn và có mã P1-18 để không lẫn dữ liệu thật.',
  'Mọi dòng mẫu đều có prefix P1-18 và được ghi qua SQL migration có kiểm soát.',
  990,
  'DAT_TAM_THOI'
)
on conflict (workflow_code) do update
set workflow_name = excluded.workflow_name,
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
  control_status
) values (
  'APPROVE_P1_18_SHORT_CONTROLLED_SAMPLE_DATA_GO_LIVE',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_18_SHORT_CONTROLLED_SAMPLE_DATA',
  'Duyệt go-live bộ dữ liệu mẫu kiểm thử ERP ngắn hạn',
  'DATA_CONTROL',
  'IT_DATA',
  'AUDIT + OWNER_DEPARTMENTS',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'Ảnh màn hình các tab drilldown có dữ liệu P1-18 và kết quả lint/build.',
  'Không go-live nếu dữ liệu mẫu lẫn sang workspace Trung cấp/HOU hoặc trùng dữ liệu thật.',
  24,
  'DAT_TAM_THOI'
)
on conflict (approval_code) do update
set module_code = excluded.module_code,
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
) values (
  'SHORT_COURSE_P1_18_SAMPLE_DATA',
  'Bộ dữ liệu mẫu P1-18 cho ERP ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'short_student_master; short_class_master; short_enrollments; short_attendance_sessions; short_attendance_records; short_bhxh_policy_cases; short_finance_invoices; short_payments; short_risk_alerts; approval_requests',
  'TRANSACTION',
  'IT_DATA + AUDIT',
  'SUPABASE',
  'INTERNAL',
  true,
  'Chỉ dùng để kiểm thử. Mọi dòng phải có prefix P1-18 và không được nhập chung với hồ sơ thật.',
  'DAT_TAM_THOI'
)
on conflict (data_code) do update
set data_name = excluded.data_name,
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
  'OWN_P1_18_SHORT_CONTROLLED_SAMPLE_DATA',
  'P1-18 Bộ dữ liệu mẫu kiểm thử ERP ngắn hạn',
  'M11_SHORT_COURSE_ERP',
  'WF_P1_18_SHORT_CONTROLLED_SAMPLE_DATA',
  'CONTROLLED_SAMPLE_DATA',
  'short_* tables,approval_requests',
  'IT_DATA + AUDIT',
  'IT_DATA',
  'AUDIT + OWNER_DEPARTMENTS',
  'BGH/NGUOI_DUOC_UY_QUYEN',
  'ROLE_AND_SCOPE',
  'IT_DATA',
  'OWNER_MODULES',
  'SQL step82, ảnh kiểm tra các tab P1-13/P1-17 và xác nhận không lẫn workspace.',
  'Seed chỉ chạy qua migration; không sửa tay dữ liệu mẫu nếu chưa có ghi nhận thay đổi.',
  24,
  'MEDIUM',
  'DAT_TAM_THOI'
)
on conflict (ownership_code) do update
set process_name = excluded.process_name,
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
  decision_status,
  record_status
) values (
  'GATE_P1_18_SHORT_CONTROLLED_SAMPLE_DATA',
  'Gate P1-18: dữ liệu mẫu ERP ngắn hạn được phép dùng kiểm thử',
  'GO_LIVE',
  'DATASET',
  'P1-18',
  'BGH + IT_DATA + AUDIT',
  'Kiểm tra dữ liệu mẫu chỉ nằm trong workspace SHORT_* và các tab drilldown đọc được.',
  'Xác nhận đây là dữ liệu demo, không phải hồ sơ thật, không dùng để báo cáo chính thức.',
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
  'NAV_P1_18_SHORT_CONTROLLED_SAMPLE_DATA',
  'P1-18 Dữ liệu mẫu ERP ngắn hạn',
  'OPERATION',
  'M11_SHORT_COURSE_ERP',
  '/short-course/drilldown?type=students',
  'Bộ dữ liệu P1-18 giúp kiểm thử đầy đủ học viên, lớp, ghi danh, điểm danh, BHXH, công nợ, thanh toán, rủi ro và phiếu xử lý.',
  'IT_DATA + AUDIT',
  'Chọn workspace ngắn hạn rồi mở drilldown P1-13',
  140,
  false,
  'Cảnh báo nếu người dùng đang chọn workspace không phải ngắn hạn nên không thấy dữ liệu P1-18.',
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
) values (
  'RISK_P1_18_SAMPLE_DATA_MIXED_WITH_REAL_DATA',
  'Dữ liệu mẫu P1-18 bị lẫn dữ liệu thật hoặc sai workspace',
  'M11_SHORT_COURSE_ERP',
  'DATA_CONTROL',
  'MEDIUM',
  'IT_DATA + AUDIT',
  'Dữ liệu mẫu nếu không có prefix/không đúng workspace có thể làm sai báo cáo hoặc gây hiểu nhầm vận hành.',
  'Tất cả dòng mẫu phải có mã P1-18 và chỉ dùng trong workspace ngắn hạn.',
  'Nếu phát hiện lẫn dữ liệu thật, IT_DATA phải khóa/xóa mẫu và báo AUDIT/BGH trước khi tiếp tục kiểm thử.',
  'Số dòng P1-18 ngoài workspace SHORT_* hoặc không có prefix P1-18.',
  'DAT_TAM_THOI'
)
on conflict (risk_code) do update
set risk_name = excluded.risk_name,
    module_code = excluded.module_code,
    risk_group = excluded.risk_group,
    severity = excluded.severity,
    owner_department = excluded.owner_department,
    risk_description = excluded.risk_description,
    control_rule = excluded.control_rule,
    escalation_rule = excluded.escalation_rule,
    dashboard_metric = excluded.dashboard_metric,
    control_status = excluded.control_status,
    updated_at = now();
