"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type FormFields = Record<string, string>;
type FieldErrors = Record<string, string>;

export type ActivityFormState = {
  error?: string;
  success?: string;
  fields?: FormFields;
  fieldErrors?: FieldErrors;
};

export type DocumentFormState = {
  error?: string;
  success?: string;
  fields?: FormFields;
  fieldErrors?: FieldErrors;
};

export type ConditionFormState = {
  error?: string;
  success?: string;
  fields?: FormFields;
  fieldErrors?: FieldErrors;
};

export type StatusFormState = {
  error?: string;
  success?: string;
  fields?: FormFields;
  fieldErrors?: FieldErrors;
};

export type HouLeadFormState = {
  error?: string;
  success?: string;
  fields?: FormFields;
  fieldErrors?: FieldErrors;
};

export type HouCommissionClaimFormState = {
  error?: string;
  success?: string;
  fields?: FormFields;
  fieldErrors?: FieldErrors;
};

export type HouEvidenceFormState = {
  error?: string;
  success?: string;
  fields?: FormFields;
  fieldErrors?: FieldErrors;
};

export type HandoverFormState = {
  error?: string;
  success?: string;
  fields?: FormFields;
  fieldErrors?: FieldErrors;
};

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function intValue(formData: FormData, key: string) {
  const value = textValue(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(/[^\d-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function submittedFields(formData: FormData, keys: string[]) {
  return Object.fromEntries(
    keys.map((key) => [key, String(formData.get(key) ?? "")]),
  );
}

function formError(
  message: string,
  fields?: FormFields,
  fieldErrors?: FieldErrors,
) {
  return {
    error: message,
    fields,
    fieldErrors,
  };
}

function partnerTypeToPayeeType(partnerType: string | null) {
  if (partnerType === "CTV") {
    return "CTV";
  }

  if (partnerType === "THCS" || partnerType === "TTGDTX" || partnerType === "BUSINESS") {
    return "ORGANIZATION";
  }

  return "PARTNER";
}

type LeadConditionTemplateRow = {
  id: string;
  condition_scope: string;
  condition_code: string;
  condition_name: string;
  is_required_default: boolean;
  status: string;
};

export async function createLeadActivityAction(
  _previousState: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const leadId = textValue(formData, "lead_id");
  const activityType = textValue(formData, "activity_type");
  const activityResult = textValue(formData, "activity_result");
  const content = textValue(formData, "content");
  const nextAction = textValue(formData, "next_action");
  const nextFollowupAt = textValue(formData, "next_followup_at");
  const fields = submittedFields(formData, [
    "activity_type",
    "activity_result",
    "content",
    "next_action",
    "next_followup_at",
  ]);

  if (!leadId) {
    return formError("Thiếu lead_id, chưa thể ghi hoạt động.", fields);
  }

  if (!activityType) {
    return formError("Vui lòng chọn loại hoạt động.", fields, {
      activity_type: "Vui lòng chọn loại hoạt động.",
    });
  }

  if (!content) {
    return formError("Vui lòng nhập nội dung tư vấn.", fields, {
      content: "Vui lòng nhập nội dung tư vấn.",
    });
  }

  const { error: activityError } = await supabase
    .from("lead_activities")
    .insert({
      lead_id: leadId,
      activity_type: activityType,
      activity_result: activityResult,
      content,
      next_action: nextAction,
      next_followup_at: nextFollowupAt,
      created_by: user.id,
    });

  if (activityError) {
    return formError("Chưa lưu được hoạt động: " + activityError.message, fields);
  }

  if (nextFollowupAt) {
    const { error: leadUpdateError } = await supabase
      .from("leads")
      .update({ next_followup_at: nextFollowupAt })
      .eq("id", leadId)
      .eq("is_deleted", false);

    if (leadUpdateError) {
      return {
        error:
          "Đã ghi hoạt động nhưng chưa cập nhật được ngày follow-up: " +
          leadUpdateError.message,
        fields,
      };
    }

    const { error: followupError } = await supabase
      .from("lead_followups")
      .insert({
        lead_id: leadId,
        assigned_to: user.id,
        due_at: nextFollowupAt,
        result: activityResult,
        note: nextAction ?? content,
        created_by: user.id,
      });

    if (followupError) {
      return {
        error:
          "Đã ghi hoạt động nhưng chưa tạo được lịch follow-up: " +
          followupError.message,
        fields,
      };
    }
  }

  revalidatePath(`/leads/${leadId}`);

  return { success: "Đã ghi hoạt động tư vấn." };
}

export async function updateLeadDocumentAction(
  _previousState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const leadId = textValue(formData, "lead_id");
  const checklistId = textValue(formData, "checklist_id");
  const documentType = textValue(formData, "document_type");
  const status = textValue(formData, "status");
  const fileUrl = textValue(formData, "file_url");
  const note = textValue(formData, "note");
  const fields = submittedFields(formData, [
    "checklist_id",
    "document_type",
    "status",
    "file_url",
    "note",
  ]);

  if (!leadId || !checklistId || !documentType) {
    return formError("Thiếu thông tin hồ sơ, chưa thể cập nhật.", fields);
  }

  if (!status) {
    return formError("Vui lòng chọn trạng thái hồ sơ.", fields, {
      status: "Vui lòng chọn trạng thái hồ sơ.",
    });
  }

  const checkedFields =
    status === "CHECKED"
      ? {
          checked_by: user.id,
          checked_at: new Date().toISOString(),
        }
      : {
          checked_by: null,
          checked_at: null,
        };

  const { error } = await supabase.from("lead_documents").upsert(
    {
      lead_id: leadId,
      checklist_id: checklistId,
      document_type: documentType,
      status,
      file_url: fileUrl,
      note,
      ...checkedFields,
    },
    {
      onConflict: "lead_id,document_type",
    },
  );

  if (error) {
    return formError("Chưa cập nhật được hồ sơ: " + error.message, fields);
  }

  revalidatePath(`/leads/${leadId}`);

  return { success: "Đã cập nhật hồ sơ." };
}

export async function updateLeadConditionAction(
  _previousState: ConditionFormState,
  formData: FormData,
): Promise<ConditionFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const leadId = textValue(formData, "lead_id");
  const conditionTemplateId = textValue(formData, "condition_template_id");
  const isChecked = formData.get("is_checked") === "on";
  const requestedRequired = formData.get("is_required") === "on";
  const note = textValue(formData, "note");
  const fields = submittedFields(formData, [
    "condition_template_id",
    "is_checked",
    "is_required",
    "note",
  ]);

  if (!leadId || !conditionTemplateId) {
    return formError("Thiếu thông tin điều kiện, chưa thể cập nhật.", fields);
  }

  const { data: template, error: templateError } = await supabase
    .from("lead_condition_templates")
    .select(
      "id,condition_scope,condition_code,condition_name,is_required_default,status",
    )
    .eq("id", conditionTemplateId)
    .maybeSingle<LeadConditionTemplateRow>();

  if (templateError || !template) {
    return formError(
      "Chưa đọc được điều kiện. Hãy kiểm tra đã chạy SQL bước 36A chưa. Chi tiết: " +
        (templateError?.message ?? "không thấy điều kiện"),
      fields,
    );
  }

  if (template.status !== "ACTIVE") {
    return formError("Điều kiện này không còn ACTIVE.", fields);
  }

  const lockedRequired = ["ENROLLMENT", "COM"].includes(
    template.condition_scope,
  );
  const isRequired = lockedRequired
    ? true
    : requestedRequired || template.is_required_default;
  const checkedFields = isChecked
    ? {
        checked_by: user.id,
        checked_at: new Date().toISOString(),
      }
    : {
        checked_by: null,
        checked_at: null,
      };

  const { error } = await supabase.from("lead_condition_checks").upsert(
    {
      lead_id: leadId,
      condition_template_id: template.id,
      condition_scope: template.condition_scope,
      condition_code: template.condition_code,
      condition_name: template.condition_name,
      is_required: isRequired,
      is_checked: isChecked,
      note,
      ...checkedFields,
    },
    {
      onConflict: "lead_id,condition_code",
    },
  );

  if (error) {
    return formError("Chưa cập nhật được điều kiện: " + error.message, fields);
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/hou");

  return { success: "Đã cập nhật điều kiện." };
}

export async function updateLeadStatusAction(
  _previousState: StatusFormState,
  formData: FormData,
): Promise<StatusFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const leadId = textValue(formData, "lead_id");
  const status = textValue(formData, "status");
  const lostReason = textValue(formData, "lost_reason");
  const nextFollowupAt = textValue(formData, "next_followup_at");
  const note = textValue(formData, "note");
  const fields = submittedFields(formData, [
    "status",
    "lost_reason",
    "next_followup_at",
    "note",
  ]);

  if (!leadId) {
    return formError("Thiếu lead_id, chưa thể cập nhật trạng thái.", fields);
  }

  if (!status) {
    return formError("Vui lòng chọn trạng thái mới.", fields, {
      status: "Vui lòng chọn trạng thái mới.",
    });
  }

  if (status === "FOLLOW_UP" && !nextFollowupAt) {
    return formError("Trạng thái FOLLOW_UP phải có ngày hẹn tiếp theo.", fields, {
      next_followup_at: "Chọn ngày hẹn tiếp theo cho trạng thái FOLLOW_UP.",
    });
  }

  if (status === "LOST" && !lostReason) {
    return formError("Trạng thái LOST phải có lý do mất lead.", fields, {
      lost_reason: "Chọn lý do mất lead cho trạng thái LOST.",
    });
  }

  const payload: {
    status: string;
    lost_reason: string | null;
    next_followup_at: string | null;
    note?: string;
  } = {
    status,
    lost_reason: status === "LOST" ? lostReason : null,
    next_followup_at: nextFollowupAt,
  };

  if (note) {
    payload.note = note;
  }

  const { error } = await supabase
    .from("leads")
    .update(payload)
    .eq("id", leadId)
    .eq("is_deleted", false);

  if (error) {
    return formError("Chưa cập nhật được trạng thái: " + error.message, fields);
  }

  if (nextFollowupAt) {
    await supabase.from("lead_followups").insert({
      lead_id: leadId,
      assigned_to: user.id,
      due_at: nextFollowupAt,
      result: status,
      note: note ?? "Tạo follow-up khi cập nhật trạng thái.",
      created_by: user.id,
    });
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  revalidatePath("/pipeline");
  revalidatePath("/followups");
  revalidatePath("/reports");
  revalidatePath("/");

  return { success: "Đã cập nhật trạng thái lead." };
}

export async function updateLeadHouAction(
  _previousState: HouLeadFormState,
  formData: FormData,
): Promise<HouLeadFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const leadId = textValue(formData, "lead_id");
  const houProgramId = textValue(formData, "hou_program_id");
  const houMajorId = textValue(formData, "hou_major_id");
  const houLocationId = textValue(formData, "hou_location_id");
  const houStageId = textValue(formData, "hou_stage_id");
  const houAdmissionSystemStatus = textValue(
    formData,
    "hou_admission_system_status",
  );
  const houAdmissionSystemSyncedAt = textValue(
    formData,
    "hou_admission_system_synced_at",
  );
  const houFirstTermTuitionConfirmed =
    formData.get("hou_first_term_tuition_confirmed") === "on";
  const houFirstTermTuitionConfirmedAt = textValue(
    formData,
    "hou_first_term_tuition_confirmed_at",
  );
  const houEnrollmentRecordedAt = textValue(
    formData,
    "hou_enrollment_recorded_at",
  );
  const fields = submittedFields(formData, [
    "hou_program_id",
    "hou_major_id",
    "hou_location_id",
    "hou_stage_id",
    "hou_admission_system_status",
    "hou_admission_system_synced_at",
    "hou_first_term_tuition_confirmed",
    "hou_first_term_tuition_confirmed_at",
    "hou_enrollment_recorded_at",
  ]);

  if (!leadId) {
    return formError("Thiếu lead_id, chưa thể cập nhật thông tin HOU.", fields);
  }

  if ((houMajorId || houStageId || houLocationId) && !houProgramId) {
    return formError(
      "Nếu chọn ngành, bước xử lý hoặc địa điểm HOU thì cần chọn chương trình HOU.",
      fields,
      {
        hou_program_id:
          "Chọn chương trình HOU trước khi chọn ngành, địa điểm hoặc bước xử lý.",
      },
    );
  }

  if (houFirstTermTuitionConfirmed && !houProgramId) {
    return formError(
      "Muốn xác nhận học phí kỳ đầu thì cần chọn chương trình HOU.",
      fields,
      {
        hou_program_id: "Chọn chương trình HOU trước khi xác nhận học phí kỳ đầu.",
      },
    );
  }

  const tuitionConfirmedAt =
    houFirstTermTuitionConfirmed && !houFirstTermTuitionConfirmedAt
      ? new Date().toISOString()
      : houFirstTermTuitionConfirmedAt;

  const { error } = await supabase
    .from("leads")
    .update({
      hou_program_id: houProgramId,
      hou_major_id: houMajorId,
      hou_location_id: houLocationId,
      hou_admin_class_id: null,
      hou_stage_id: houStageId,
      hou_admission_system_status: houAdmissionSystemStatus,
      hou_admission_system_synced_at: houAdmissionSystemSyncedAt,
      hou_first_term_tuition_confirmed: houFirstTermTuitionConfirmed,
      hou_first_term_tuition_confirmed_at: houFirstTermTuitionConfirmed
        ? tuitionConfirmedAt
        : null,
      hou_enrollment_recorded_at: houEnrollmentRecordedAt,
    })
    .eq("id", leadId)
    .eq("is_deleted", false);

  if (error) {
    return formError("Chưa cập nhật được thông tin HOU: " + error.message, fields);
  }

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: "NOTE",
    activity_result: "HOU_UPDATE",
    content: "Đã cập nhật thông tin theo dõi HOU cho lead.",
    created_by: user.id,
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  revalidatePath("/pipeline");
  revalidatePath("/reports");

  return { success: "Đã cập nhật thông tin HOU cho lead." };
}
type ClaimLeadRow = {
  id: string;
  student_name: string;
  student_phone: string | null;
  partner_id: string | null;
  assigned_to: string | null;
  hou_program_id: string | null;
  hou_major_id: string | null;
  hou_first_term_tuition_confirmed: boolean;
  hou_first_term_tuition_confirmed_at: string | null;
};

type CommissionPolicyRow = {
  id: string;
  policy_code: string;
  effective_from: string;
  effective_to: string | null;
  status: string;
};

type CommissionPolicyLineRow = {
  id: string;
  component_code: string;
  component_name: string;
  receiver_type: string;
  payer_source: string;
  gross_amount_vnd: number;
  tax_withholding_percent: number | null;
  is_taxable: boolean;
};

export async function createHouCommissionClaimAction(
  _previousState: HouCommissionClaimFormState,
  formData: FormData,
): Promise<HouCommissionClaimFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const leadId = textValue(formData, "lead_id");
  const policyId = textValue(formData, "policy_id");
  const classification = textValue(formData, "classification");
  const payeeMode = textValue(formData, "payee_mode");
  const existingPayeeId = textValue(formData, "existing_payee_id");
  const manualPayeeType = textValue(formData, "manual_payee_type");
  const manualPayeeCode = textValue(formData, "manual_payee_code");
  const manualPayeeName = textValue(formData, "manual_payee_name");
  const houStudentCode = textValue(formData, "hou_student_code");
  const admissionDecisionNo = textValue(formData, "admission_decision_no");
  const admissionDecisionDate = textValue(formData, "admission_decision_date");
  const firstTuitionAmountVnd = intValue(formData, "first_tuition_amount_vnd");
  const firstTuitionPaidAt = textValue(formData, "first_tuition_paid_at");
  const commissionBaseDate = textValue(formData, "commission_base_date");
  const dropoutRiskLevel = textValue(formData, "dropout_risk_level") ?? "LOW";
  const dropoutRiskNote = textValue(formData, "dropout_risk_note");
  const debtOffsetAmountVnd = intValue(formData, "debt_offset_amount_vnd") ?? 0;
  const note = textValue(formData, "note");
  const fields = submittedFields(formData, [
    "policy_id",
    "classification",
    "payee_mode",
    "existing_payee_id",
    "manual_payee_type",
    "manual_payee_code",
    "manual_payee_name",
    "hou_student_code",
    "admission_decision_no",
    "admission_decision_date",
    "first_tuition_amount_vnd",
    "first_tuition_paid_at",
    "commission_base_date",
    "dropout_risk_level",
    "dropout_risk_note",
    "debt_offset_amount_vnd",
    "note",
  ]);

  if (!leadId) {
    return formError("Thieu lead_id, chua the tao de nghi COM.", fields);
  }

  if (!policyId) {
    return formError("Vui long chon chinh sach COM HOU.", fields, {
      policy_id: "Chon chinh sach COM HOU.",
    });
  }

  if (classification !== "L8A" && classification !== "L8B") {
    return formError("Vui long chon phan loai L8A hoac L8B.", fields, {
      classification: "Chon phan loai L8A hoac L8B.",
    });
  }

  if (!houStudentCode) {
    return formError(
      "Vui long nhap ma sinh vien HOU de chong chi trung.",
      fields,
      {
        hou_student_code: "Nhap ma sinh vien HOU de chong chi trung.",
      },
    );
  }

  if (!admissionDecisionNo || !admissionDecisionDate) {
    return formError(
      "Can so va ngay quyet dinh trung tuyen truoc khi tao COM.",
      fields,
      {
        ...(!admissionDecisionNo
          ? { admission_decision_no: "Nhap so quyet dinh trung tuyen." }
          : {}),
        ...(!admissionDecisionDate
          ? { admission_decision_date: "Chon ngay quyet dinh trung tuyen." }
          : {}),
      },
    );
  }

  if (!commissionBaseDate) {
    return formError("Vui long chon ngay can cu tinh COM.", fields, {
      commission_base_date: "Chon ngay can cu tinh COM.",
    });
  }

  if ((dropoutRiskLevel === "HIGH" || dropoutRiskLevel === "LEFT") && !dropoutRiskNote) {
    return formError("Rui ro bo hoc cao can ghi ro ghi chu ra soat.", fields, {
      dropout_risk_note: "Ghi ro ly do ra soat khi rui ro bo hoc cao.",
    });
  }

  if (debtOffsetAmountVnd < 0) {
    return formError("So tien bu tru cong no khong duoc am.", fields, {
      debt_offset_amount_vnd: "So tien bu tru cong no khong duoc am.",
    });
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select(
      "id,student_name,student_phone,partner_id,assigned_to,hou_program_id,hou_major_id,hou_first_term_tuition_confirmed,hou_first_term_tuition_confirmed_at",
    )
    .eq("id", leadId)
    .eq("is_deleted", false)
    .maybeSingle<ClaimLeadRow>();

  if (leadError || !lead) {
    return formError(
      "Chua doc duoc lead: " + (leadError?.message ?? "khong thay lead"),
      fields,
    );
  }

  if (!lead.hou_program_id) {
    return formError("Lead nay chua gan chuong trinh HOU.", fields);
  }

  const resolvedFirstTuitionPaidAt =
    firstTuitionPaidAt ?? lead.hou_first_term_tuition_confirmed_at?.slice(0, 10) ?? null;

  if (!lead.hou_first_term_tuition_confirmed && !resolvedFirstTuitionPaidAt) {
    return formError(
      "Chua xac nhan hoc phi ky dau. Hay cap nhat phan Theo doi HOU truoc.",
      fields,
      {
        first_tuition_paid_at: "Nhap ngay nop hoc phi hoac cap nhat phan Theo doi HOU.",
      },
    );
  }

  const { data: policy, error: policyError } = await supabase
    .from("hou_commission_policies")
    .select("id,policy_code,effective_from,effective_to,status")
    .eq("id", policyId)
    .maybeSingle<CommissionPolicyRow>();

  if (policyError || !policy) {
    return formError(
      "Chua doc duoc chinh sach COM. Hay kiem tra da chay buoc 35D chua. Chi tiet: " +
        (policyError?.message ?? "khong thay policy"),
      fields,
      {
        policy_id: "Chon lai chinh sach COM.",
      },
    );
  }

  if (policy.status !== "ACTIVE") {
    return formError("Chinh sach COM dang chon khong con ACTIVE.", fields, {
      policy_id: "Chinh sach COM dang chon khong con ACTIVE.",
    });
  }

  if (
    commissionBaseDate < policy.effective_from ||
    (policy.effective_to && commissionBaseDate > policy.effective_to)
  ) {
    return formError(
      "Ngay can cu tinh COM khong nam trong thoi gian hieu luc cua chinh sach.",
      fields,
      {
        commission_base_date:
          "Ngay nay khong nam trong thoi gian hieu luc cua chinh sach.",
      },
    );
  }

  const { data: existingClaim, error: existingClaimError } = await supabase
    .from("hou_commission_claims")
    .select("id,claim_status")
    .eq("lead_id", leadId)
    .eq("policy_id", policyId)
    .neq("claim_status", "CANCELLED")
    .maybeSingle<{ id: string; claim_status: string }>();

  if (existingClaimError) {
    return formError(
      "Chua kiem tra duoc COM trung: " + existingClaimError.message,
      fields,
    );
  }

  if (existingClaim) {
    return formError(
      "Lead nay da co de nghi COM con hieu luc trong chinh sach dang chon.",
      fields,
      {
        policy_id: "Lead nay da co de nghi COM trong chinh sach dang chon.",
      },
    );
  }

  const { data: existingStudentClaim, error: existingStudentClaimError } =
    await supabase
      .from("hou_commission_claims")
      .select("id,student_name,claim_status")
      .eq("policy_id", policyId)
      .eq("station_code", "HEU")
      .eq("hou_student_code", houStudentCode)
      .neq("claim_status", "CANCELLED")
      .maybeSingle<{ id: string; student_name: string; claim_status: string }>();

  if (existingStudentClaimError) {
    return formError(
      "Chua kiem tra duoc ma sinh vien HOU trung: " +
        existingStudentClaimError.message,
      fields,
    );
  }

  if (existingStudentClaim) {
    return formError(
      `Ma sinh vien HOU nay da co de nghi COM cho ${existingStudentClaim.student_name}.`,
      fields,
      {
        hou_student_code: "Ma sinh vien HOU nay da co de nghi COM.",
      },
    );
  }

  const { data: policyLines, error: policyLinesError } = await supabase
    .from("hou_commission_policy_lines")
    .select(
      "id,component_code,component_name,receiver_type,payer_source,gross_amount_vnd,tax_withholding_percent,is_taxable",
    )
    .eq("policy_id", policyId)
    .eq("classification", classification)
    .eq("status", "ACTIVE")
    .order("sort_order", { ascending: true })
    .returns<CommissionPolicyLineRow[]>();

  if (policyLinesError) {
    return formError("Chua doc duoc dong COM: " + policyLinesError.message, fields);
  }

  if (!policyLines || policyLines.length === 0) {
    return formError(
      "Chinh sach nay chua co dong COM cho phan loai da chon.",
      fields,
      {
        classification: "Chinh sach nay chua co dong COM cho phan loai da chon.",
      },
    );
  }

  let payeeId: string | null = null;

  if (payeeMode === "existing_payee") {
    if (!existingPayeeId) {
      return formError("Vui long chon nguoi nhan COM co san.", fields, {
        existing_payee_id: "Chon nguoi nhan COM co san.",
      });
    }

    payeeId = existingPayeeId;
  } else if (payeeMode === "lead_partner") {
    if (!lead.partner_id) {
      return formError("Lead nay chua gan doi tac/CTV.", fields, {
        payee_mode: "Lead nay chua gan doi tac/CTV.",
      });
    }

    const { data: existingPayee } = await supabase
      .from("hou_commission_payees")
      .select("id")
      .eq("partner_id", lead.partner_id)
      .maybeSingle<{ id: string }>();

    if (existingPayee) {
      payeeId = existingPayee.id;
    } else {
      const { data: partner, error: partnerError } = await supabase
        .from("partners")
        .select("id,partner_code,partner_name,partner_type")
        .eq("id", lead.partner_id)
        .maybeSingle<{
          id: string;
          partner_code: string;
          partner_name: string;
          partner_type: string;
        }>();

      if (partnerError || !partner) {
        return formError(
          "Chua doc duoc doi tac/CTV cua lead: " +
            (partnerError?.message ?? "khong thay doi tac"),
          fields,
          {
            payee_mode: "Kiem tra lai doi tac/CTV cua lead.",
          },
        );
      }

      const { data: insertedPayee, error: insertedPayeeError } = await supabase
        .from("hou_commission_payees")
        .insert({
          payee_type: partnerTypeToPayeeType(partner.partner_type),
          partner_id: partner.id,
          payee_code: partner.partner_code,
          payee_name: partner.partner_name,
        })
        .select("id")
        .single<{ id: string }>();

      if (insertedPayeeError) {
        return formError(
          "Chua tao duoc nguoi nhan COM: " + insertedPayeeError.message,
          fields,
        );
      }

      payeeId = insertedPayee.id;
    }
  } else if (payeeMode === "assigned_user") {
    if (!lead.assigned_to) {
      return formError("Lead nay chua co nhan vien phu trach.", fields, {
        payee_mode: "Lead nay chua co nhan vien phu trach.",
      });
    }

    const { data: existingPayee } = await supabase
      .from("hou_commission_payees")
      .select("id")
      .eq("user_id", lead.assigned_to)
      .maybeSingle<{ id: string }>();

    if (existingPayee) {
      payeeId = existingPayee.id;
    } else {
      const { data: profile, error: profileError } = await supabase
        .from("users_profile")
        .select("id,email,full_name")
        .eq("id", lead.assigned_to)
        .maybeSingle<{ id: string; email: string; full_name: string | null }>();

      if (profileError || !profile) {
        return formError(
          "Chua doc duoc nhan vien phu trach: " +
            (profileError?.message ?? "khong thay nhan vien"),
          fields,
          {
            payee_mode: "Kiem tra lai nhan vien phu trach.",
          },
        );
      }

      const { data: insertedPayee, error: insertedPayeeError } = await supabase
        .from("hou_commission_payees")
        .insert({
          payee_type: "EMPLOYEE",
          user_id: profile.id,
          payee_code: profile.email,
          payee_name: profile.full_name ?? profile.email,
        })
        .select("id")
        .single<{ id: string }>();

      if (insertedPayeeError) {
        return formError(
          "Chua tao duoc nguoi nhan COM: " + insertedPayeeError.message,
          fields,
        );
      }

      payeeId = insertedPayee.id;
    }
  } else if (payeeMode === "manual") {
    if (!manualPayeeType || !manualPayeeCode || !manualPayeeName) {
      return formError("Nguoi nhan nhap tay can loai, ma va ten.", fields, {
        ...(!manualPayeeType
          ? { manual_payee_type: "Chon loai nguoi nhan moi." }
          : {}),
        ...(!manualPayeeCode
          ? { manual_payee_code: "Nhap ma nguoi nhan moi." }
          : {}),
        ...(!manualPayeeName
          ? { manual_payee_name: "Nhap ten nguoi nhan moi." }
          : {}),
      });
    }

    const { data: existingPayee } = await supabase
      .from("hou_commission_payees")
      .select("id")
      .eq("payee_code", manualPayeeCode)
      .maybeSingle<{ id: string }>();

    if (existingPayee) {
      payeeId = existingPayee.id;
    } else {
      const { data: insertedPayee, error: insertedPayeeError } = await supabase
        .from("hou_commission_payees")
        .insert({
          payee_type: manualPayeeType,
          payee_code: manualPayeeCode,
          payee_name: manualPayeeName,
        })
        .select("id")
        .single<{ id: string }>();

      if (insertedPayeeError) {
        return formError(
          "Chua tao duoc nguoi nhan COM: " + insertedPayeeError.message,
          fields,
        );
      }

      payeeId = insertedPayee.id;
    }
  } else {
    return formError("Vui long chon cach xac dinh nguoi nhan COM.", fields, {
      payee_mode: "Chon cach xac dinh nguoi nhan COM.",
    });
  }

  const claimStatus =
    dropoutRiskLevel === "HIGH" || dropoutRiskLevel === "LEFT"
      ? "RISK_HOLD"
      : "ELIGIBLE";

  const { data: claim, error: claimError } = await supabase
    .from("hou_commission_claims")
    .insert({
      lead_id: leadId,
      policy_id: policyId,
      payee_id: payeeId,
      program_id: lead.hou_program_id,
      major_id: lead.hou_major_id,
      station_code: "HEU",
      classification,
      hou_student_code: houStudentCode,
      student_name: lead.student_name,
      student_phone: lead.student_phone,
      admission_decision_no: admissionDecisionNo,
      admission_decision_date: admissionDecisionDate,
      first_tuition_amount_vnd: firstTuitionAmountVnd,
      first_tuition_paid_at: resolvedFirstTuitionPaidAt,
      hou_input_account: classification === "L8A" ? "HEU" : "CTV",
      commission_base_date: commissionBaseDate,
      claim_status: claimStatus,
      dropout_risk_level: dropoutRiskLevel,
      dropout_risk_note: dropoutRiskNote,
      breakeven_status: "NOT_CALCULATED",
      is_debt_offset: debtOffsetAmountVnd > 0,
      debt_offset_amount_vnd: debtOffsetAmountVnd,
      note,
    })
    .select("id")
    .single<{ id: string }>();

  if (claimError) {
    return formError("Chua tao duoc de nghi COM: " + claimError.message, fields);
  }

  const claimLines = policyLines.map((line) => {
    const taxPercent = line.is_taxable ? Number(line.tax_withholding_percent ?? 0) : 0;
    const taxWithheld = Math.round((line.gross_amount_vnd * taxPercent) / 100);

    return {
      claim_id: claim.id,
      policy_line_id: line.id,
      component_code: line.component_code,
      component_name: line.component_name,
      receiver_type: line.receiver_type,
      payer_source: line.payer_source,
      gross_amount_vnd: line.gross_amount_vnd,
      tax_withheld_vnd: taxWithheld,
      debt_offset_amount_vnd: 0,
      net_amount_vnd: line.gross_amount_vnd - taxWithheld,
      line_status: claimStatus === "RISK_HOLD" ? "DRAFT" : "REVIEWING",
      note:
        claimStatus === "RISK_HOLD"
          ? "Giu lai do co canh bao rui ro bo hoc."
          : null,
    };
  });

  const { error: claimLinesError } = await supabase
    .from("hou_commission_claim_lines")
    .insert(claimLines);

  if (claimLinesError) {
    await supabase.from("hou_commission_claims").delete().eq("id", claim.id);

    return {
      error:
        "Da tao claim nhung chua sinh duoc dong COM, he thong da hoan tac claim. Chi tiet: " +
        claimLinesError.message,
      fields,
    };
  }

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: "PAYMENT",
    activity_result: "HOU_COM_CLAIM_CREATED",
    content: `Da tao de nghi COM HOU ${classification} theo chinh sach ${policy.policy_code}.`,
    created_by: user.id,
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/settings");

  return {
    success:
      claimStatus === "RISK_HOLD"
        ? "Da tao de nghi COM o trang thai RISK_HOLD de ra soat."
        : "Da tao de nghi COM va sinh dong COM theo chinh sach.",
  };
}

export async function createHouEvidenceFileAction(
  _previousState: HouEvidenceFormState,
  formData: FormData,
): Promise<HouEvidenceFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const leadId = textValue(formData, "lead_id");
  const evidenceScope = textValue(formData, "evidence_scope") ?? "LEAD";
  const claimId = textValue(formData, "claim_id");
  const evidenceType = textValue(formData, "evidence_type");
  const evidenceTitle = textValue(formData, "evidence_title");
  const fileUrl = textValue(formData, "file_url");
  const fileName = textValue(formData, "file_name");
  const fileMimeHint = textValue(formData, "file_mime_hint");
  const fileDate = textValue(formData, "file_date");
  const confidentialLevel = textValue(formData, "confidential_level") ?? "INTERNAL";
  const note = textValue(formData, "note");
  const fields = submittedFields(formData, [
    "evidence_scope",
    "claim_id",
    "evidence_type",
    "evidence_title",
    "file_url",
    "file_name",
    "file_mime_hint",
    "file_date",
    "confidential_level",
    "note",
  ]);

  const allowedScopes = new Set(["LEAD", "COM_CLAIM"]);
  const allowedTypes = new Set([
    "HOU_STUDENT_LIST",
    "ADMISSION_DECISION",
    "TUITION_PROOF",
    "COM_PROOF",
    "PAYMENT_VOUCHER",
    "STUDENT_DOCUMENT",
    "OTHER",
  ]);
  const allowedConfidentialLevels = new Set([
    "INTERNAL",
    "SENSITIVE",
    "FINANCE_CONFIDENTIAL",
  ]);

  if (!leadId) {
    return formError("Thiếu lead_id, chưa thể lưu minh chứng HOU.", fields);
  }

  if (!allowedScopes.has(evidenceScope)) {
    return formError("Phạm vi minh chứng chưa hợp lệ trên trang lead.", fields, {
      evidence_scope: "Chọn lại phạm vi minh chứng.",
    });
  }

  if (evidenceScope === "COM_CLAIM" && !claimId) {
    return formError("Minh chứng COM cần chọn đề nghị COM liên quan.", fields, {
      claim_id: "Chọn đề nghị COM liên quan.",
    });
  }

  if (!evidenceType || !allowedTypes.has(evidenceType)) {
    return formError("Vui lòng chọn loại minh chứng HOU.", fields, {
      evidence_type: "Chọn loại minh chứng HOU.",
    });
  }

  if (!evidenceTitle) {
    return formError("Vui lòng nhập tiêu đề minh chứng.", fields, {
      evidence_title: "Nhập tiêu đề minh chứng.",
    });
  }

  if (!fileUrl) {
    return formError("Vui lòng nhập link file hoặc ảnh minh chứng.", fields, {
      file_url: "Dán link file hoặc ảnh minh chứng.",
    });
  }

  try {
    const parsedUrl = new URL(fileUrl);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return formError(
        "Link minh chứng cần bắt đầu bằng http:// hoặc https://.",
        fields,
        {
          file_url: "Link cần bắt đầu bằng http:// hoặc https://.",
        },
      );
    }
  } catch {
    return formError("Link minh chứng chưa đúng định dạng URL.", fields, {
      file_url: "Kiểm tra lại link file hoặc ảnh.",
    });
  }

  if (!allowedConfidentialLevels.has(confidentialLevel)) {
    return formError("Mức bảo mật minh chứng chưa hợp lệ.", fields, {
      confidential_level: "Chọn lại mức bảo mật.",
    });
  }

  if (evidenceScope === "COM_CLAIM" && claimId) {
    const { data: claim, error: claimError } = await supabase
      .from("hou_commission_claims")
      .select("id,lead_id")
      .eq("id", claimId)
      .maybeSingle<{ id: string; lead_id: string }>();

    if (claimError || !claim) {
      return formError(
        "Chưa đọc được đề nghị COM liên quan. Chi tiết: " +
          (claimError?.message ?? "không thấy claim"),
        fields,
        {
          claim_id: "Chọn lại đề nghị COM.",
        },
      );
    }

    if (claim.lead_id !== leadId) {
      return formError("Đề nghị COM đang chọn không thuộc lead này.", fields, {
        claim_id: "Đề nghị COM này không thuộc lead hiện tại.",
      });
    }
  }

  const { error } = await supabase.from("hou_evidence_files").insert({
    evidence_scope: evidenceScope,
    lead_id: leadId,
    claim_id: evidenceScope === "COM_CLAIM" ? claimId : null,
    evidence_type: evidenceType,
    evidence_title: evidenceTitle,
    file_url: fileUrl,
    file_name: fileName,
    file_mime_hint: fileMimeHint,
    file_date: fileDate,
    confidential_level: confidentialLevel,
    note,
    created_by: user.id,
  });

  if (error) {
    return formError(
      "Chưa lưu được minh chứng HOU. Hãy kiểm tra đã chạy SQL bước 35G chưa. Chi tiết: " +
        error.message,
      fields,
    );
  }

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: "DOCUMENT",
    activity_result: "HOU_EVIDENCE_CREATED",
    content: `Đã lưu minh chứng HOU: ${evidenceTitle}.`,
    created_by: user.id,
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/settings");

  return { success: "Đã lưu minh chứng HOU." };
}

const handoverConfig: Record<
  string,
  { label: string; fromDepartment: string; toDepartment: string }
> = {
  ADMISSION_TO_CTHSSV: {
    label: "Bàn giao Tuyển sinh -> CTHSSV",
    fromDepartment: "ADMISSION",
    toDepartment: "CTHSSV",
  },
  CTHSSV_TO_ACCOUNTING: {
    label: "Bàn giao CTHSSV -> Kế toán",
    fromDepartment: "CTHSSV",
    toDepartment: "ACCOUNTING",
  },
  ADMISSION_TO_ACCOUNTING: {
    label: "Bàn giao Tuyển sinh -> Kế toán",
    fromDepartment: "ADMISSION",
    toDepartment: "ACCOUNTING",
  },
};

export async function createLeadHandoverAction(
  _previousState: HandoverFormState,
  formData: FormData,
): Promise<HandoverFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const leadId = textValue(formData, "lead_id");
  const handoverType = textValue(formData, "handover_type");
  const note = textValue(formData, "note");
  const fields = submittedFields(formData, ["handover_type", "note"]);

  if (!leadId) {
    return formError("Thiếu lead_id, chưa thể tạo bàn giao.", fields);
  }

  if (!handoverType || !handoverConfig[handoverType]) {
    return formError("Vui lòng chọn đúng loại bàn giao.", fields, {
      handover_type: "Chọn loại bàn giao.",
    });
  }

  const config = handoverConfig[handoverType];
  const { error } = await supabase.from("lead_handovers").insert({
    lead_id: leadId,
    handover_type: handoverType,
    from_department: config.fromDepartment,
    to_department: config.toDepartment,
    note,
    requested_by: user.id,
  });

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) {
      return formError(
        "Lead này đang có bàn giao cùng loại ở trạng thái chờ nhận hoặc đã nhận. Không tạo trùng để tránh bàn giao hai lần.",
        fields,
      );
    }

    return formError(
      "Chưa tạo được bàn giao. Hãy kiểm tra đã chạy SQL bước 38 và tài khoản có quyền bàn giao chưa. Chi tiết: " +
        error.message,
      fields,
    );
  }

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: "NOTE",
    activity_result: "HANDOVER_REQUESTED",
    content: `${config.label}. ${note ?? ""}`.trim(),
    created_by: user.id,
  });

  revalidatePath(`/leads/${leadId}`);

  return { success: "Đã tạo bàn giao liên phòng." };
}

export async function updateLeadHandoverAction(
  _previousState: HandoverFormState,
  formData: FormData,
): Promise<HandoverFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const handoverId = textValue(formData, "handover_id");
  const leadId = textValue(formData, "lead_id");
  const handoverStatus = textValue(formData, "handover_status");
  const note = textValue(formData, "note");
  const fields = submittedFields(formData, [
    "handover_id",
    "handover_status",
    "note",
  ]);

  if (!handoverId || !leadId) {
    return formError("Thiếu thông tin bàn giao, chưa thể cập nhật.", fields);
  }

  if (!handoverStatus || !["ACCEPTED", "REJECTED"].includes(handoverStatus)) {
    return formError("Vui lòng chọn nhận hoặc từ chối bàn giao.", fields, {
      handover_status: "Chọn nhận hoặc từ chối.",
    });
  }

  if (handoverStatus === "REJECTED" && !note) {
    return formError("Từ chối bàn giao cần ghi rõ lý do.", fields, {
      note: "Nhập lý do từ chối.",
    });
  }

  const now = new Date().toISOString();
  const payload =
    handoverStatus === "ACCEPTED"
      ? {
          handover_status: "ACCEPTED",
          accepted_by: user.id,
          accepted_at: now,
          rejected_by: null,
          rejected_at: null,
          note,
        }
      : {
          handover_status: "REJECTED",
          accepted_by: null,
          accepted_at: null,
          rejected_by: user.id,
          rejected_at: now,
          note,
        };

  const { data: handover, error: readError } = await supabase
    .from("lead_handovers")
    .select("handover_type")
    .eq("id", handoverId)
    .maybeSingle<{ handover_type: string }>();

  if (readError || !handover) {
    return formError(
      "Chưa đọc được bàn giao cần cập nhật. Chi tiết: " +
        (readError?.message ?? "không thấy bàn giao"),
      fields,
    );
  }

  const { error } = await supabase
    .from("lead_handovers")
    .update(payload)
    .eq("id", handoverId);

  if (error) {
    return formError(
      "Chưa cập nhật được bàn giao. Hãy kiểm tra quyền của phòng nhận bàn giao. Chi tiết: " +
        error.message,
      fields,
    );
  }

  const config = handoverConfig[handover.handover_type];
  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: "NOTE",
    activity_result:
      handoverStatus === "ACCEPTED" ? "HANDOVER_ACCEPTED" : "HANDOVER_REJECTED",
    content: `${config?.label ?? "Bàn giao liên phòng"}: ${
      handoverStatus === "ACCEPTED" ? "đã nhận" : "đã từ chối"
    }. ${note ?? ""}`.trim(),
    created_by: user.id,
  });

  revalidatePath(`/leads/${leadId}`);

  return {
    success:
      handoverStatus === "ACCEPTED"
        ? "Đã nhận bàn giao."
        : "Đã từ chối bàn giao.",
  };
}
