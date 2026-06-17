"use server";

import { redirect } from "next/navigation";

import {
  buildLeadDynamicFields,
  dynamicFieldByFormName,
  getAdmissionLeadFormFieldConfigs,
  type LeadDynamicField,
} from "@/lib/admission-dynamic-fields";
import {
  getAllowedProgramMajorOptions,
  normalizedOptionLabel,
} from "@/lib/admission-segment-program-rules";
import { createClient } from "@/lib/supabase/server";

export type LeadFormState = {
  error?: string;
  fields?: Record<string, string>;
  fieldErrors?: Record<string, string>;
};

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function normalizePhone(value: string | null) {
  return value?.replace(/\D/g, "") || null;
}

function collectFields(formData: FormData) {
  const fields: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      fields[key] = value;
    }
  }

  return fields;
}

function fail(
  message: string,
  fields: Record<string, string>,
  fieldErrors: Record<string, string> = {},
): LeadFormState {
  return {
    error: message,
    fields,
    fieldErrors,
  };
}

function addFieldError(
  fieldErrors: Record<string, string>,
  fieldName: string,
  message: string,
) {
  if (!fieldErrors[fieldName]) {
    fieldErrors[fieldName] = message;
  }
}

function validateTypedField(
  field: LeadDynamicField,
  value: string | null,
  fieldErrors: Record<string, string>,
) {
  if (!value) {
    return;
  }

  if (["NUMBER", "MONEY"].includes(field.field_type) && Number.isNaN(Number(value))) {
    addFieldError(
      fieldErrors,
      field.form_name,
      `${field.field_label} phải là số.`,
    );
  }

  if (field.field_type === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    addFieldError(
      fieldErrors,
      field.form_name,
      `${field.field_label} chưa đúng định dạng email.`,
    );
  }

  if (field.field_type === "PHONE" && (normalizePhone(value)?.length ?? 0) < 9) {
    addFieldError(
      fieldErrors,
      field.form_name,
      `${field.field_label} cần nhập số điện thoại hợp lệ.`,
    );
  }
}

function dynamicValue(formData: FormData, field: LeadDynamicField) {
  if (field.field_type === "CHECKBOX") {
    return formData.get(field.form_name) === "on" ? "true" : null;
  }

  return textValue(formData, field.form_name);
}

export async function createLeadAction(
  _previousState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const fields = collectFields(formData);
  const fieldErrors: Record<string, string> = {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const studentName = textValue(formData, "student_name");
  const studentPhone = textValue(formData, "student_phone");
  const parentPhone = textValue(formData, "parent_phone");
  const studentPhoneNorm = normalizePhone(studentPhone);
  const parentPhoneNorm = normalizePhone(parentPhone);
  const admissionSegmentId = textValue(formData, "admission_segment_id");
  const partnerId = textValue(formData, "partner_id");

  if (!admissionSegmentId) {
    return fail(
      "P0-14 yêu cầu chọn một đối tượng tuyển sinh trước khi tạo lead. Hãy chọn workspace ở thanh P0-13 rồi tạo lại lead.",
      fields,
      { admission_segment_id: "Cần chọn đối tượng tuyển sinh." },
    );
  }

  const [
    { data: currentRoleCode },
    { data: canWriteAssigned },
    { data: canWriteTeam },
    { data: canWriteAll },
    { data: segmentScopeRows },
    { data: partnerScopeRows },
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", {
      permission_name: "leads.write_assigned",
    }),
    supabase.rpc("has_permission", {
      permission_name: "leads.write_team",
    }),
    supabase.rpc("has_permission", {
      permission_name: "leads.write_all",
    }),
    supabase
      .from("user_admission_segment_scopes")
      .select("segment_id")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .returns<Array<{ segment_id: string }>>(),
    supabase
      .from("user_partner_scopes")
      .select("partner_id")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .returns<Array<{ partner_id: string }>>(),
  ]);

  const { data: canUseAdmissionWorkspace, error: workspaceError } =
    await supabase.rpc("can_use_admission_workspace", {
      target_segment_id: admissionSegmentId,
    });

  if (workspaceError) {
    return fail(
      "Chưa kiểm tra được workspace tuyển sinh: " + workspaceError.message,
      fields,
    );
  }

  if (!canUseAdmissionWorkspace) {
    return fail(
      "Bạn không được phân quyền tạo lead trong đối tượng tuyển sinh này. Hãy chọn đúng workspace hoặc nhờ quản lý cập nhật phạm vi.",
      fields,
      {
        admission_segment_id:
          "Đối tượng tuyển sinh này nằm ngoài phạm vi tài khoản.",
      },
    );
  }

  const { data: fieldConfigs, error: fieldConfigError } =
    await getAdmissionLeadFormFieldConfigs(supabase, admissionSegmentId);

  if (fieldConfigError) {
    return fail(
      "Chưa đọc được cấu hình form P0-17: " + fieldConfigError.message,
      fields,
    );
  }

  const dynamicFields = buildLeadDynamicFields(fieldConfigs);
  const fieldByFormName = dynamicFieldByFormName(dynamicFields);
  const usesDynamicConfig = dynamicFields.length > 0;

  for (const field of dynamicFields) {
    const value = dynamicValue(formData, field);

    if (field.is_required && !value) {
      addFieldError(fieldErrors, field.form_name, `${field.field_label} là bắt buộc.`);
    }

    validateTypedField(field, value, fieldErrors);
  }

  if (!usesDynamicConfig && !studentName) {
    addFieldError(fieldErrors, "student_name", "Vui lòng nhập họ tên học sinh.");
  }

  if (!studentPhone && !parentPhone) {
    addFieldError(
      fieldErrors,
      "student_phone",
      "Cần nhập ít nhất một số điện thoại học sinh hoặc phụ huynh.",
    );
    addFieldError(
      fieldErrors,
      "parent_phone",
      "Cần nhập ít nhất một số điện thoại học sinh hoặc phụ huynh.",
    );
  }

  if (studentPhone && (studentPhoneNorm?.length ?? 0) < 9) {
    addFieldError(fieldErrors, "student_phone", "Số điện thoại học sinh chưa hợp lệ.");
  }

  if (parentPhone && (parentPhoneNorm?.length ?? 0) < 9) {
    addFieldError(fieldErrors, "parent_phone", "Số điện thoại phụ huynh chưa hợp lệ.");
  }

  const graduationYearValue = textValue(formData, "graduation_year");

  if (graduationYearValue && Number.isNaN(Number(graduationYearValue))) {
    addFieldError(fieldErrors, "graduation_year", "Năm tốt nghiệp phải là số.");
  }

  const allowedCatalog = await getAllowedProgramMajorOptions(
    supabase,
    admissionSegmentId,
  );
  const programById = new Map(
    allowedCatalog.programs.map((program) => [program.id, program]),
  );
  const majorById = new Map(allowedCatalog.majors.map((major) => [major.id, major]));
  const offeringById = new Map(
    allowedCatalog.offerings.map((offering) => [offering.id, offering]),
  );
  const interestedProgramId = textValue(formData, "interested_program_id");
  const interestedMajorId = textValue(formData, "interested_major_id");
  const admissionOfferingId = textValue(formData, "admission_offering_id");
  const submittedProgramLabel = textValue(formData, "interested_program");
  const submittedMajorLabel = textValue(formData, "interested_major");
  let interestedProgram = submittedProgramLabel;
  let interestedMajor = submittedMajorLabel;

  if (interestedProgramId) {
    const selectedProgram = programById.get(interestedProgramId);

    if (!selectedProgram) {
      addFieldError(
        fieldErrors,
        "interested_program_id",
        "Hệ đào tạo đã chọn không thuộc đối tượng tuyển sinh hiện tại.",
      );
    } else {
      interestedProgram = selectedProgram.label;
    }
  } else if (
    fieldByFormName.get("interested_program_id")?.is_required ||
    (!usesDynamicConfig && allowedCatalog.programs.length > 0)
  ) {
    addFieldError(fieldErrors, "interested_program_id", "Cần chọn hệ đào tạo.");
  }

  if (interestedMajorId) {
    const selectedMajor = majorById.get(interestedMajorId);

    if (!selectedMajor) {
      addFieldError(
        fieldErrors,
        "interested_major_id",
        "Ngành đã chọn không thuộc hệ/đối tượng tuyển sinh hiện tại.",
      );
    } else if (
      interestedProgramId &&
      selectedMajor.programId &&
      selectedMajor.programId !== interestedProgramId
    ) {
      addFieldError(
        fieldErrors,
        "interested_major_id",
        "Ngành này không thuộc hệ đào tạo đã chọn.",
      );
    } else {
      interestedMajor = selectedMajor.label;
    }
  } else if (
    fieldByFormName.get("interested_major_id")?.is_required ||
    (!usesDynamicConfig && allowedCatalog.majors.length > 0)
  ) {
    addFieldError(fieldErrors, "interested_major_id", "Cần chọn ngành quan tâm.");
  }

  const allowedProgramLabels = new Set(
    allowedCatalog.programs.map((program) =>
      normalizedOptionLabel(program.label),
    ),
  );
  const allowedMajorLabels = new Set(
    allowedCatalog.majors.map((major) => normalizedOptionLabel(major.label)),
  );

  if (
    !interestedProgramId &&
    submittedProgramLabel &&
    allowedProgramLabels.size > 0 &&
    !allowedProgramLabels.has(normalizedOptionLabel(submittedProgramLabel))
  ) {
    addFieldError(
      fieldErrors,
      "interested_program_id",
      "Hệ đào tạo đã chọn không thuộc đối tượng tuyển sinh hiện tại.",
    );
  }

  if (
    !interestedMajorId &&
    submittedMajorLabel &&
    allowedMajorLabels.size > 0 &&
    !allowedMajorLabels.has(normalizedOptionLabel(submittedMajorLabel))
  ) {
    addFieldError(
      fieldErrors,
      "interested_major_id",
      "Ngành đã chọn không thuộc hệ/đối tượng tuyển sinh hiện tại.",
    );
  }

  if (admissionOfferingId) {
    const selectedOffering = offeringById.get(admissionOfferingId);

    if (!selectedOffering) {
      addFieldError(
        fieldErrors,
        "admission_offering_id",
        "Ngành/khoá chi tiết đã chọn không thuộc đối tượng tuyển sinh hiện tại.",
      );
    } else if (
      interestedProgramId &&
      selectedOffering.programId &&
      selectedOffering.programId !== interestedProgramId
    ) {
      addFieldError(
        fieldErrors,
        "admission_offering_id",
        "Ngành/khoá chi tiết không thuộc hệ đào tạo đã chọn.",
      );
    } else if (
      interestedMajorId &&
      selectedOffering.majorId &&
      selectedOffering.majorId !== interestedMajorId
    ) {
      addFieldError(
        fieldErrors,
        "admission_offering_id",
        "Ngành/khoá chi tiết không thuộc ngành đã chọn.",
      );
    }
  } else if (allowedCatalog.offerings.length > 0) {
    addFieldError(
      fieldErrors,
      "admission_offering_id",
      "Cần chọn ngành/khoá chi tiết để P1-02 chuyển lead sang học viên đúng dữ liệu.",
    );
  }

  const status = String(formData.get("status") ?? "NEW");
  const nextFollowupAt = textValue(formData, "next_followup_at");
  const houProgramId = textValue(formData, "hou_program_id");
  const houMajorId = textValue(formData, "hou_major_id");
  const houLocationId = textValue(formData, "hou_location_id");
  const houStageId = textValue(formData, "hou_stage_id");
  const houFirstTermTuitionConfirmed =
    formData.get("hou_first_term_tuition_confirmed") === "on";

  if (status === "FOLLOW_UP" && !nextFollowupAt) {
    addFieldError(
      fieldErrors,
      "next_followup_at",
      "Lead FOLLOW_UP phải có ngày hẹn chăm sóc tiếp.",
    );
  }

  if ((houMajorId || houLocationId || houStageId) && !houProgramId) {
    addFieldError(
      fieldErrors,
      "hou_program_id",
      "Nếu chọn ngành, địa điểm hoặc bước xử lý HOU thì cần chọn chương trình HOU.",
    );
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fail("Một số thông tin chưa đúng. Các ô cần sửa đã được đánh dấu.", fields, fieldErrors);
  }

  if (!canWriteAssigned && !canWriteTeam && !canWriteAll) {
    return fail(
      "Tài khoản này chưa có quyền tạo lead. ADMIN cần gán role Tư vấn viên/Trưởng nhóm/Trưởng phòng tuyển sinh hoặc cấp quyền tạo lead.",
      fields,
    );
  }

  const allowedSegmentIds = new Set(
    (segmentScopeRows ?? []).map((scope) => scope.segment_id),
  );
  const allowedPartnerIds = new Set(
    (partnerScopeRows ?? []).map((scope) => scope.partner_id),
  );
  const requiresSegmentScope =
    currentRoleCode !== "ADMIN" && currentRoleCode !== "BGH";

  if (requiresSegmentScope) {
    if (allowedSegmentIds.size === 0) {
      return fail(
        "Tài khoản này chưa được phân đối tượng tuyển sinh nên chưa thể tạo lead. Hãy nhờ ADMIN hoặc trưởng phòng phân phạm vi trước.",
        fields,
        { admission_segment_id: "Tài khoản chưa có phạm vi đối tượng tuyển sinh." },
      );
    }

    if (!allowedSegmentIds.has(admissionSegmentId)) {
      return fail(
        "Đối tượng tuyển sinh đã chọn nằm ngoài phạm vi tài khoản này. Hãy chọn đúng đối tượng được phân hoặc nhờ quản lý cập nhật phạm vi.",
        fields,
        { admission_segment_id: "Đối tượng này nằm ngoài phạm vi tài khoản." },
      );
    }
  }

  if (allowedPartnerIds.size > 0) {
    if (!partnerId) {
      return fail(
        "Tài khoản này đang được giới hạn theo đối tác/trung tâm, nên cần chọn đúng ô Đối tác / CTV. Nếu đây là lead tuyển sinh tại chỗ HEU, quản lý cần bỏ giới hạn đối tác cho user này.",
        fields,
        { partner_id: "Cần chọn đối tác/trung tâm được phân." },
      );
    }

    if (!allowedPartnerIds.has(partnerId)) {
      return fail(
        "Đối tác / CTV đã chọn nằm ngoài phạm vi tài khoản này. Hãy chọn đúng đối tác được phân hoặc nhờ quản lý cập nhật phạm vi.",
        fields,
        { partner_id: "Đối tác này nằm ngoài phạm vi tài khoản." },
      );
    }
  }

  const phonesToCheck = [studentPhoneNorm, parentPhoneNorm].filter(Boolean);

  if (phonesToCheck.length > 0) {
    const duplicateFilters = phonesToCheck
      .map(
        (phone) =>
          `student_phone_norm.eq.${phone},parent_phone_norm.eq.${phone}`,
      )
      .join(",");

    const { data: duplicateLead, error: duplicateError } = await supabase
      .from("leads")
      .select("lead_code,student_name")
      .eq("is_deleted", false)
      .or(duplicateFilters)
      .limit(1)
      .maybeSingle();

    if (duplicateError) {
      return fail(
        "Chưa kiểm tra được lead trùng: " + duplicateError.message,
        fields,
      );
    }

    if (duplicateLead) {
      return fail(
        `Số điện thoại đã tồn tại ở lead ${duplicateLead.lead_code} - ${duplicateLead.student_name}.`,
        fields,
        {
          student_phone: studentPhone ? "Số này có thể đã trùng lead." : "",
          parent_phone: parentPhone ? "Số này có thể đã trùng lead." : "",
        },
      );
    }
  }

  const customFieldRows = dynamicFields
    .filter((field) => field.is_custom)
    .map((field) => {
      const value = dynamicValue(formData, field);

      if (!value) {
        return null;
      }

      return {
        lead_id: "",
        segment_id: admissionSegmentId,
        field_config_id: field.id,
        field_key: field.field_key,
        field_label: field.field_label,
        field_type: field.field_type,
        field_value: value,
        created_by: user.id,
        updated_by: user.id,
        status: "ACTIVE",
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (customFieldRows.length > 0) {
    const { error: customFieldTableError } = await supabase
      .from("lead_custom_field_values")
      .select("id", { head: true })
      .limit(1);

    if (customFieldTableError) {
      return fail(
        "Chưa lưu được field tùy biến vì chưa chạy SQL step57 hoặc chưa có quyền bảng lead_custom_field_values: " +
          customFieldTableError.message,
        fields,
      );
    }
  }

  const [{ data: houProgram }, { data: houMajor }] = await Promise.all([
    houProgramId
      ? supabase
          .from("hou_programs")
          .select("program_name")
          .eq("id", houProgramId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    houMajorId
      ? supabase
          .from("hou_majors")
          .select("major_name")
          .eq("id", houMajorId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const payload = {
    student_name: studentName,
    student_phone: studentPhone,
    student_dob: textValue(formData, "student_dob"),
    student_gender: textValue(formData, "student_gender"),
    parent_name: textValue(formData, "parent_name"),
    parent_phone: parentPhone,
    parent_relationship: textValue(formData, "parent_relationship"),
    current_school: textValue(formData, "current_school"),
    current_grade: textValue(formData, "current_grade"),
    graduation_year: graduationYearValue ? Number(graduationYearValue) : null,
    interested_program:
      interestedProgram ?? (houProgram ? "Liên thông đại học" : null),
    interested_major:
      interestedMajor ?? (houMajor ? String(houMajor.major_name ?? "") : null),
    province: textValue(formData, "province"),
    district: textValue(formData, "district"),
    ward: textValue(formData, "ward"),
    source_id: textValue(formData, "source_id"),
    flow_id: textValue(formData, "flow_id"),
    admission_segment_id: admissionSegmentId,
    admission_program_id: interestedProgramId,
    admission_major_id: interestedMajorId,
    admission_offering_id: admissionOfferingId,
    campaign_id: textValue(formData, "campaign_id"),
    partner_id: partnerId,
    hou_program_id: houProgramId,
    hou_major_id: houMajorId,
    hou_location_id: houLocationId,
    hou_stage_id: houStageId,
    hou_first_term_tuition_confirmed: houFirstTermTuitionConfirmed,
    hou_first_term_tuition_confirmed_at: houFirstTermTuitionConfirmed
      ? new Date().toISOString()
      : null,
    assigned_to: user.id,
    status,
    priority: String(formData.get("priority") ?? "NORMAL"),
    next_followup_at: nextFollowupAt,
    note: textValue(formData, "note"),
  };

  const { data: insertedLead, error } = await supabase
    .from("leads")
    .insert(payload)
    .select("id")
    .single<{ id: string }>();

  if (error) {
    if (
      error.message.toLowerCase().includes("row-level security") ||
      error.message.toLowerCase().includes("violates row-level security")
    ) {
      return fail(
        "Tài khoản của bạn chưa được phân quyền tạo lead trong đối tượng tuyển sinh hoặc đối tác đã chọn. Hãy kiểm tra lại phạm vi được phân trong Cấu hình.",
        fields,
      );
    }

    return fail("Chưa lưu được lead: " + error.message, fields);
  }

  if (customFieldRows.length > 0) {
    const rowsWithLeadId = customFieldRows.map((row) => ({
      ...row,
      lead_id: insertedLead.id,
    }));
    const { error: customFieldInsertError } = await supabase
      .from("lead_custom_field_values")
      .insert(rowsWithLeadId);

    if (customFieldInsertError) {
      return fail(
        "Lead đã tạo nhưng chưa lưu được field tùy biến: " +
          customFieldInsertError.message,
        fields,
      );
    }
  }

  redirect(
    admissionSegmentId
      ? `/leads?segment=${encodeURIComponent(admissionSegmentId)}`
      : "/leads",
  );
}
