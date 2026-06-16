"use server";

import { redirect } from "next/navigation";

import {
  getAllowedProgramMajorOptions,
  normalizedOptionLabel,
} from "@/lib/admission-segment-program-rules";
import { createClient } from "@/lib/supabase/server";

export type LeadFormState = {
  error?: string;
};

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function normalizePhone(value: string | null) {
  return value?.replace(/\D/g, "") || null;
}

export async function createLeadAction(
  _previousState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
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
  const interestedProgram = textValue(formData, "interested_program");
  const interestedMajor = textValue(formData, "interested_major");

  if (!studentName) {
    return { error: "Vui lòng nhập họ tên học sinh." };
  }

  if (!studentPhone && !parentPhone) {
    return { error: "Cần nhập ít nhất một số điện thoại học sinh hoặc phụ huynh." };
  }

  if (!admissionSegmentId) {
    return {
      error:
        "P0-14 yêu cầu chọn một đối tượng tuyển sinh trước khi tạo lead. Hãy chọn workspace ở thanh P0-13 rồi tạo lại lead.",
    };
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
    return {
      error:
        "Chưa kiểm tra được workspace tuyển sinh: " + workspaceError.message,
    };
  }

  if (!canUseAdmissionWorkspace) {
    return {
      error:
        "Bạn không được phân quyền tạo lead trong đối tượng tuyển sinh này. Hãy chọn đúng workspace hoặc nhờ quản lý cập nhật phạm vi.",
    };
  }

  const allowedCatalog = await getAllowedProgramMajorOptions(
    supabase,
    admissionSegmentId,
  );
  const allowedProgramLabels = new Set(
    allowedCatalog.programs.map((program) =>
      normalizedOptionLabel(program.label),
    ),
  );
  const allowedMajorLabels = new Set(
    allowedCatalog.majors.map((major) => normalizedOptionLabel(major.label)),
  );

  if (
    interestedProgram &&
    allowedProgramLabels.size > 0 &&
    !allowedProgramLabels.has(normalizedOptionLabel(interestedProgram))
  ) {
    return {
      error:
        "Hệ đào tạo đã chọn không thuộc đối tượng tuyển sinh hiện tại. Ví dụ 9+ chỉ được chọn hệ Trung cấp.",
    };
  }

  if (
    interestedMajor &&
    allowedMajorLabels.size > 0 &&
    !allowedMajorLabels.has(normalizedOptionLabel(interestedMajor))
  ) {
    return {
      error:
        "Ngành đã chọn không thuộc hệ/đối tượng tuyển sinh hiện tại. Hãy chọn lại đúng danh sách ngành được hệ thống lọc.",
    };
  }

  if (!canWriteAssigned && !canWriteTeam && !canWriteAll) {
    return {
      error:
        "Tài khoản này chưa có quyền tạo lead. ADMIN cần gán role Tư vấn viên/Trưởng nhóm/Trưởng phòng tuyển sinh hoặc cấp quyền tạo lead.",
    };
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
      return {
        error:
          "Tài khoản này chưa được phân đối tượng tuyển sinh nên chưa thể tạo lead. Hãy nhờ ADMIN hoặc trưởng phòng phân phạm vi trước.",
      };
    }

    if (!allowedSegmentIds.has(admissionSegmentId)) {
      return {
        error:
          "Đối tượng tuyển sinh đã chọn nằm ngoài phạm vi tài khoản này. Hãy chọn đúng đối tượng được phân hoặc nhờ quản lý cập nhật phạm vi.",
      };
    }
  }

  if (allowedPartnerIds.size > 0) {
    if (!partnerId) {
      return {
        error:
          "Tài khoản này đang được giới hạn theo đối tác/trung tâm, nên cần chọn đúng ô Đối tác / CTV. Nếu đây là lead tuyển sinh tại chỗ HEU, quản lý cần bỏ giới hạn đối tác cho user này.",
      };
    }

    if (!allowedPartnerIds.has(partnerId)) {
      return {
        error:
          "Đối tác / CTV đã chọn nằm ngoài phạm vi tài khoản này. Hãy chọn đúng đối tác được phân hoặc nhờ quản lý cập nhật phạm vi.",
      };
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
      return {
        error: "Chưa kiểm tra được lead trùng: " + duplicateError.message,
      };
    }

    if (duplicateLead) {
      return {
        error: `Số điện thoại đã tồn tại ở lead ${duplicateLead.lead_code} - ${duplicateLead.student_name}.`,
      };
    }
  }

  const status = String(formData.get("status") ?? "NEW");
  const nextFollowupAt = textValue(formData, "next_followup_at");
  const houProgramId = textValue(formData, "hou_program_id");
  const houMajorId = textValue(formData, "hou_major_id");
  const houLocationId = textValue(formData, "hou_location_id");
  const houStageId = textValue(formData, "hou_stage_id");

  if (status === "FOLLOW_UP" && !nextFollowupAt) {
    return { error: "Lead FOLLOW_UP phải có ngày hẹn chăm sóc tiếp." };
  }

  if ((houMajorId || houLocationId || houStageId) && !houProgramId) {
    return {
      error:
        "Nếu chọn ngành, địa điểm hoặc bước xử lý HOU thì cần chọn chương trình HOU.",
    };
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
    graduation_year: textValue(formData, "graduation_year")
      ? Number(textValue(formData, "graduation_year"))
      : null,
    interested_program: interestedProgram ?? (houProgram ? "Liên thông đại học" : null),
    interested_major:
      interestedMajor ?? (houMajor ? String(houMajor.major_name ?? "") : null),
    province: textValue(formData, "province"),
    district: textValue(formData, "district"),
    ward: textValue(formData, "ward"),
    source_id: textValue(formData, "source_id"),
    flow_id: textValue(formData, "flow_id"),
    admission_segment_id: admissionSegmentId,
    campaign_id: textValue(formData, "campaign_id"),
    partner_id: partnerId,
    hou_program_id: houProgramId,
    hou_major_id: houMajorId,
    hou_location_id: houLocationId,
    hou_stage_id: houStageId,
    assigned_to: user.id,
    status,
    priority: String(formData.get("priority") ?? "NORMAL"),
    next_followup_at: nextFollowupAt,
    note: textValue(formData, "note"),
  };

  const { error } = await supabase.from("leads").insert(payload);

  if (error) {
    if (
      error.message.toLowerCase().includes("row-level security") ||
      error.message.toLowerCase().includes("violates row-level security")
    ) {
      return {
        error:
          "Tài khoản của bạn chưa được phân quyền tạo lead trong đối tượng tuyển sinh hoặc đối tác đã chọn. Hãy kiểm tra lại phạm vi được phân trong Cấu hình.",
      };
    }

    return { error: "Chưa lưu được lead: " + error.message };
  }

  redirect(
    admissionSegmentId
      ? `/leads?segment=${encodeURIComponent(admissionSegmentId)}`
      : "/leads",
  );
}
