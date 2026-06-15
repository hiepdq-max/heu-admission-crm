"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type FieldErrors = Record<string, string>;
type FormFields = Record<string, string>;

export type HouClaimReviewState = {
  error?: string;
  success?: string;
  fields?: FormFields;
  fieldErrors?: FieldErrors;
};

export type HouPaymentBatchState = {
  error?: string;
  success?: string;
  fields?: FormFields;
  fieldErrors?: FieldErrors;
};

type ClaimForReview = {
  id: string;
  lead_id: string | null;
  claim_status: string;
  dropout_risk_level: string;
  student_name: string;
  note: string | null;
};

type ClaimLineForPayment = {
  id: string;
  claim_id: string;
  line_status: string;
  gross_amount_vnd: number;
  tax_withheld_vnd: number;
  debt_offset_amount_vnd: number;
  net_amount_vnd: number;
};

type PaymentLineForStatus = {
  id: string;
  claim_line_id: string;
};

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
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
): HouClaimReviewState {
  return { error: message, fields, fieldErrors };
}

function paymentFormError(
  message: string,
  fields?: FormFields,
  fieldErrors?: FieldErrors,
): HouPaymentBatchState {
  return { error: message, fields, fieldErrors };
}

async function getCurrentRoleCode(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users_profile")
    .select("role_id")
    .eq("id", userId)
    .maybeSingle<{ role_id: string | null }>();

  if (!profile?.role_id) {
    return "";
  }

  const { data: role } = await supabase
    .from("roles")
    .select("code")
    .eq("id", profile.role_id)
    .maybeSingle<{ code: string }>();

  return role?.code ?? "";
}

function lineStatusForTarget(targetStatus: string) {
  if (targetStatus === "APPROVED") {
    return "APPROVED";
  }

  if (targetStatus === "REJECTED") {
    return "CANCELLED";
  }

  if (targetStatus === "RISK_HOLD") {
    return "DRAFT";
  }

  return "REVIEWING";
}

function targetLabel(targetStatus: string) {
  const labels: Record<string, string> = {
    REVIEWING: "chuyển rà soát",
    APPROVED: "duyệt COM",
    REJECTED: "từ chối COM",
    RISK_HOLD: "giữ lại do rủi ro",
  };

  return labels[targetStatus] ?? targetStatus;
}

function paymentStatusLabel(targetStatus: string) {
  const labels: Record<string, string> = {
    REVIEWING: "chuyển kỳ sang rà soát",
    APPROVED: "duyệt kỳ thanh toán",
    PAID: "ghi nhận đã chi",
    CANCELLED: "hủy kỳ thanh toán",
  };

  return labels[targetStatus] ?? targetStatus;
}

export async function reviewHouCommissionClaimAction(
  _previousState: HouClaimReviewState,
  formData: FormData,
): Promise<HouClaimReviewState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const claimId = textValue(formData, "claim_id");
  const targetStatus = textValue(formData, "target_status");
  const reviewNote = textValue(formData, "review_note");
  const fields = submittedFields(formData, [
    "claim_id",
    "target_status",
    "review_note",
  ]);

  const roleCode = await getCurrentRoleCode(user.id);
  const canReview = [
    "ADMIN",
    "BGH",
    "ADMISSION_HEAD",
    "ACCOUNTING",
  ].includes(roleCode);

  if (!canReview) {
    return formError(
      "Bạn không có quyền duyệt COM HOU. Chỉ Admin, BGH, Trưởng phòng tuyển sinh hoặc Kế toán được thao tác.",
      fields,
    );
  }

  const allowedTargets = new Set([
    "REVIEWING",
    "APPROVED",
    "REJECTED",
    "RISK_HOLD",
  ]);

  if (!claimId) {
    return formError("Thiếu claim COM, chưa thể xử lý.", fields);
  }

  if (!targetStatus || !allowedTargets.has(targetStatus)) {
    return formError("Vui lòng chọn hướng xử lý claim.", fields, {
      target_status: "Chọn hướng xử lý claim.",
    });
  }

  if (!reviewNote) {
    return formError("Vui lòng nhập lý do xử lý claim.", fields, {
      review_note: "Nhập lý do duyệt, từ chối hoặc giữ rủi ro.",
    });
  }

  const { data: claim, error: claimError } = await supabase
    .from("hou_commission_claims")
    .select("id,lead_id,claim_status,dropout_risk_level,student_name,note")
    .eq("id", claimId)
    .maybeSingle<ClaimForReview>();

  if (claimError || !claim) {
    return formError(
      "Chưa đọc được claim COM. Chi tiết: " +
        (claimError?.message ?? "không thấy claim"),
      fields,
    );
  }

  if (["PAID", "CANCELLED"].includes(claim.claim_status)) {
    return formError(
      "Claim đã PAID/CANCELLED nên không được đổi trạng thái ở bước duyệt.",
      fields,
    );
  }

  if (claim.claim_status === "APPROVED" && targetStatus !== "RISK_HOLD") {
    return formError(
      "Claim đã APPROVED. Nếu cần dừng lại, chỉ được chuyển sang RISK_HOLD trước khi lập thanh toán.",
      fields,
      {
        target_status: "Claim đã duyệt, chỉ nên giữ rủi ro nếu cần dừng thanh toán.",
      },
    );
  }

  const reviewEntry = `[${new Date().toISOString()}] ${roleCode} ${targetLabel(
    targetStatus,
  )}: ${reviewNote}`;
  const nextNote = claim.note ? `${claim.note}\n${reviewEntry}` : reviewEntry;
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    claim_status: targetStatus,
    note: nextNote,
  };

  if (targetStatus === "APPROVED") {
    payload.approved_by = user.id;
    payload.approved_at = now;
  } else {
    payload.approved_by = null;
    payload.approved_at = null;
  }

  if (targetStatus === "RISK_HOLD") {
    payload.dropout_risk_level =
      claim.dropout_risk_level === "LEFT" ? "LEFT" : "HIGH";
    payload.dropout_risk_note = reviewNote;
  }

  const { error: updateClaimError } = await supabase
    .from("hou_commission_claims")
    .update(payload)
    .eq("id", claim.id);

  if (updateClaimError) {
    return formError(
      "Chưa cập nhật được claim COM. Chi tiết: " + updateClaimError.message,
      fields,
    );
  }

  const { error: updateLinesError } = await supabase
    .from("hou_commission_claim_lines")
    .update({
      line_status: lineStatusForTarget(targetStatus),
      note:
        targetStatus === "RISK_HOLD" || targetStatus === "REJECTED"
          ? reviewNote
          : null,
    })
    .eq("claim_id", claim.id)
    .not("line_status", "in", "(PAID,CANCELLED)");

  if (updateLinesError) {
    return formError(
      "Đã cập nhật claim nhưng chưa cập nhật được dòng COM. Cần kiểm tra lại thủ công. Chi tiết: " +
        updateLinesError.message,
      fields,
    );
  }

  if (claim.lead_id) {
    await supabase.from("lead_activities").insert({
      lead_id: claim.lead_id,
      activity_type: "PAYMENT",
      activity_result: `HOU_COM_${targetStatus}`,
      content: `Đã ${targetLabel(targetStatus)} cho claim COM HOU của ${claim.student_name}. Lý do: ${reviewNote}`,
      created_by: user.id,
    });
  }

  revalidatePath("/hou");

  if (claim.lead_id) {
    revalidatePath(`/leads/${claim.lead_id}`);
  }

  return { success: `Đã ${targetLabel(targetStatus)}.` };
}

export async function createHouCommissionPaymentBatchAction(
  _previousState: HouPaymentBatchState,
  formData: FormData,
): Promise<HouPaymentBatchState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const paymentBatchCode = textValue(formData, "payment_batch_code");
  const paymentBatchName = textValue(formData, "payment_batch_name");
  const paymentMethod = textValue(formData, "payment_method");
  const note = textValue(formData, "note");
  const selectedLineIds = formData
    .getAll("claim_line_ids")
    .map((value) => String(value))
    .filter(Boolean);
  const fields = submittedFields(formData, [
    "payment_batch_code",
    "payment_batch_name",
    "payment_method",
    "note",
  ]);

  const roleCode = await getCurrentRoleCode(user.id);
  const canManage = [
    "ADMIN",
    "BGH",
    "ADMISSION_HEAD",
    "ACCOUNTING",
  ].includes(roleCode);

  if (!canManage) {
    return paymentFormError(
      "Bạn không có quyền lập kỳ thanh toán COM HOU.",
      fields,
    );
  }

  const allowedMethods = new Set([
    "BANK_TRANSFER",
    "CASH",
    "OFFSET_DEBT",
    "INTERNAL_TRANSFER",
    "OTHER",
  ]);

  if (!paymentBatchCode) {
    return paymentFormError("Vui lòng nhập mã kỳ thanh toán.", fields, {
      payment_batch_code: "Nhập mã kỳ thanh toán.",
    });
  }

  if (!paymentBatchName) {
    return paymentFormError("Vui lòng nhập tên kỳ thanh toán.", fields, {
      payment_batch_name: "Nhập tên kỳ thanh toán.",
    });
  }

  if (!paymentMethod || !allowedMethods.has(paymentMethod)) {
    return paymentFormError("Vui lòng chọn hình thức chi trả.", fields, {
      payment_method: "Chọn hình thức chi trả.",
    });
  }

  if (selectedLineIds.length === 0) {
    return paymentFormError(
      "Vui lòng chọn ít nhất một dòng COM đã duyệt để lập kỳ thanh toán.",
      fields,
    );
  }

  const { data: existingBatch, error: existingBatchError } = await supabase
    .from("hou_commission_payment_batches")
    .select("id")
    .eq("payment_batch_code", paymentBatchCode)
    .maybeSingle<{ id: string }>();

  if (existingBatchError) {
    return paymentFormError(
      "Chưa kiểm tra được mã kỳ thanh toán: " + existingBatchError.message,
      fields,
    );
  }

  if (existingBatch) {
    return paymentFormError("Mã kỳ thanh toán đã tồn tại.", fields, {
      payment_batch_code: "Chọn mã kỳ thanh toán khác.",
    });
  }

  const { data: claimLines, error: claimLinesError } = await supabase
    .from("hou_commission_claim_lines")
    .select(
      "id,claim_id,line_status,gross_amount_vnd,tax_withheld_vnd,debt_offset_amount_vnd,net_amount_vnd",
    )
    .in("id", selectedLineIds)
    .returns<ClaimLineForPayment[]>();

  if (claimLinesError) {
    return paymentFormError(
      "Chưa đọc được dòng COM được chọn: " + claimLinesError.message,
      fields,
    );
  }

  if (!claimLines || claimLines.length !== selectedLineIds.length) {
    return paymentFormError(
      "Một số dòng COM được chọn không còn tồn tại hoặc không có quyền đọc.",
      fields,
    );
  }

  const invalidLine = claimLines.find((line) => line.line_status !== "APPROVED");

  if (invalidLine) {
    return paymentFormError(
      "Chỉ được lập kỳ thanh toán cho dòng COM ở trạng thái APPROVED.",
      fields,
    );
  }

  const { data: existingPaymentLines, error: existingPaymentLinesError } =
    await supabase
      .from("hou_commission_payment_lines")
      .select("id,claim_line_id")
      .in("claim_line_id", selectedLineIds)
      .neq("status", "CANCELLED")
      .returns<PaymentLineForStatus[]>();

  if (existingPaymentLinesError) {
    return paymentFormError(
      "Chưa kiểm tra được dòng COM đã vào kỳ khác: " +
        existingPaymentLinesError.message,
      fields,
    );
  }

  if ((existingPaymentLines ?? []).length > 0) {
    return paymentFormError(
      "Có dòng COM đã nằm trong kỳ thanh toán khác, hệ thống chặn để không chi trùng.",
      fields,
    );
  }

  const totalGross = claimLines.reduce(
    (total, line) => total + line.gross_amount_vnd,
    0,
  );
  const totalTax = claimLines.reduce(
    (total, line) => total + line.tax_withheld_vnd,
    0,
  );
  const totalDebtOffset = claimLines.reduce(
    (total, line) => total + line.debt_offset_amount_vnd,
    0,
  );
  const totalNet = claimLines.reduce(
    (total, line) => total + line.net_amount_vnd,
    0,
  );

  const { data: batch, error: batchError } = await supabase
    .from("hou_commission_payment_batches")
    .insert({
      payment_batch_code: paymentBatchCode,
      payment_batch_name: paymentBatchName,
      payment_method: paymentMethod,
      status: "DRAFT",
      requested_by: user.id,
      requested_at: new Date().toISOString(),
      total_gross_vnd: totalGross,
      total_tax_withheld_vnd: totalTax,
      total_debt_offset_vnd: totalDebtOffset,
      total_net_vnd: totalNet,
      note,
    })
    .select("id")
    .single<{ id: string }>();

  if (batchError || !batch) {
    return paymentFormError(
      "Chưa tạo được kỳ thanh toán: " + (batchError?.message ?? "không có id"),
      fields,
    );
  }

  const paymentLines = claimLines.map((line) => ({
    payment_batch_id: batch.id,
    claim_line_id: line.id,
    paid_amount_vnd: line.net_amount_vnd,
    payment_method: paymentMethod,
    status: "DRAFT",
    note,
  }));

  const { error: insertLinesError } = await supabase
    .from("hou_commission_payment_lines")
    .insert(paymentLines);

  if (insertLinesError) {
    await supabase
      .from("hou_commission_payment_batches")
      .delete()
      .eq("id", batch.id);

    return paymentFormError(
      "Đã tạo kỳ nhưng chưa tạo được dòng thanh toán, hệ thống đã hoàn tác kỳ. Chi tiết: " +
        insertLinesError.message,
      fields,
    );
  }

  const { error: updateClaimLinesError } = await supabase
    .from("hou_commission_claim_lines")
    .update({ line_status: "PAYMENT_REQUESTED" })
    .in("id", selectedLineIds);

  if (updateClaimLinesError) {
    return paymentFormError(
      "Đã tạo kỳ thanh toán nhưng chưa cập nhật được trạng thái dòng COM. Cần kiểm tra thủ công. Chi tiết: " +
        updateClaimLinesError.message,
      fields,
    );
  }

  revalidatePath("/hou");

  return {
    success: `Đã tạo kỳ thanh toán ${paymentBatchCode} với ${claimLines.length} dòng COM.`,
  };
}

export async function updateHouCommissionPaymentBatchStatusAction(
  _previousState: HouPaymentBatchState,
  formData: FormData,
): Promise<HouPaymentBatchState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const batchId = textValue(formData, "payment_batch_id");
  const targetStatus = textValue(formData, "target_status");
  const accountingVoucherNo = textValue(formData, "accounting_voucher_no");
  const note = textValue(formData, "note");
  const fields = submittedFields(formData, [
    "payment_batch_id",
    "target_status",
    "accounting_voucher_no",
    "note",
  ]);

  const roleCode = await getCurrentRoleCode(user.id);
  const canManage = [
    "ADMIN",
    "BGH",
    "ADMISSION_HEAD",
    "ACCOUNTING",
  ].includes(roleCode);

  if (!canManage) {
    return paymentFormError(
      "Bạn không có quyền cập nhật kỳ thanh toán COM HOU.",
      fields,
    );
  }

  const allowedTargets = new Set([
    "REVIEWING",
    "APPROVED",
    "PAID",
    "CANCELLED",
  ]);

  if (!batchId) {
    return paymentFormError("Thiếu kỳ thanh toán, chưa thể cập nhật.", fields);
  }

  if (!targetStatus || !allowedTargets.has(targetStatus)) {
    return paymentFormError("Vui lòng chọn trạng thái kỳ thanh toán.", fields, {
      target_status: "Chọn trạng thái kỳ thanh toán.",
    });
  }

  if (targetStatus === "PAID" && !accountingVoucherNo) {
    return paymentFormError("Khi ghi nhận đã chi cần nhập số chứng từ kế toán.", fields, {
      accounting_voucher_no: "Nhập số chứng từ kế toán.",
    });
  }

  const { data: batch, error: batchError } = await supabase
    .from("hou_commission_payment_batches")
    .select("id,status,note")
    .eq("id", batchId)
    .maybeSingle<{ id: string; status: string; note: string | null }>();

  if (batchError || !batch) {
    return paymentFormError(
      "Chưa đọc được kỳ thanh toán: " +
        (batchError?.message ?? "không thấy kỳ"),
      fields,
    );
  }

  if (["PAID", "CANCELLED"].includes(batch.status)) {
    return paymentFormError(
      "Kỳ đã PAID/CANCELLED nên không được đổi trạng thái ở bước này.",
      fields,
    );
  }

  const statusEntry = `[${new Date().toISOString()}] ${roleCode} ${paymentStatusLabel(
    targetStatus,
  )}${note ? `: ${note}` : ""}`;
  const nextNote = batch.note ? `${batch.note}\n${statusEntry}` : statusEntry;
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    status: targetStatus,
    note: nextNote,
  };

  if (accountingVoucherNo) {
    payload.accounting_voucher_no = accountingVoucherNo;
  }

  if (targetStatus === "APPROVED") {
    payload.approved_by = user.id;
    payload.approved_at = now;
  }

  if (targetStatus === "PAID") {
    payload.approved_by = user.id;
    payload.approved_at = now;
    payload.paid_by = user.id;
    payload.paid_at = now;
  }

  const { data: paymentLines, error: paymentLinesError } = await supabase
    .from("hou_commission_payment_lines")
    .select("id,claim_line_id")
    .eq("payment_batch_id", batch.id)
    .neq("status", "CANCELLED")
    .returns<PaymentLineForStatus[]>();

  if (paymentLinesError) {
    return paymentFormError(
      "Chưa đọc được dòng thanh toán: " + paymentLinesError.message,
      fields,
    );
  }

  const claimLineIds = (paymentLines ?? []).map((line) => line.claim_line_id);

  if (claimLineIds.length === 0) {
    return paymentFormError(
      "Kỳ thanh toán này chưa có dòng thanh toán hợp lệ.",
      fields,
    );
  }

  const { error: updateBatchError } = await supabase
    .from("hou_commission_payment_batches")
    .update(payload)
    .eq("id", batch.id);

  if (updateBatchError) {
    return paymentFormError(
      "Chưa cập nhật được kỳ thanh toán: " + updateBatchError.message,
      fields,
    );
  }

  const linePayload: Record<string, unknown> = {
    status:
      targetStatus === "CANCELLED"
        ? "CANCELLED"
        : targetStatus === "PAID"
          ? "PAID"
          : targetStatus === "APPROVED"
            ? "APPROVED"
            : "DRAFT",
  };

  if (targetStatus === "PAID") {
    linePayload.paid_at = now;
    linePayload.accounting_voucher_no = accountingVoucherNo;
  }

  const { error: updatePaymentLinesError } = await supabase
    .from("hou_commission_payment_lines")
    .update(linePayload)
    .eq("payment_batch_id", batch.id)
    .neq("status", "CANCELLED");

  if (updatePaymentLinesError) {
    return paymentFormError(
      "Đã cập nhật kỳ nhưng chưa cập nhật được dòng thanh toán: " +
        updatePaymentLinesError.message,
      fields,
    );
  }

  if (targetStatus === "CANCELLED") {
    await supabase
      .from("hou_commission_claim_lines")
      .update({ line_status: "APPROVED" })
      .in("id", claimLineIds);
  }

  if (targetStatus === "PAID") {
    await supabase
      .from("hou_commission_claim_lines")
      .update({ line_status: "PAID" })
      .in("id", claimLineIds);

    const { data: paidLines } = await supabase
      .from("hou_commission_claim_lines")
      .select("claim_id")
      .in("id", claimLineIds)
      .returns<{ claim_id: string }[]>();

    const claimIds = Array.from(
      new Set((paidLines ?? []).map((line) => line.claim_id)),
    );

    for (const claimId of claimIds) {
      const { data: allLines } = await supabase
        .from("hou_commission_claim_lines")
        .select("line_status")
        .eq("claim_id", claimId)
        .returns<{ line_status: string }[]>();
      const allPaid = (allLines ?? []).every((line) =>
        ["PAID", "CANCELLED"].includes(line.line_status),
      );

      if (allPaid) {
        await supabase
          .from("hou_commission_claims")
          .update({
            claim_status: "PAID",
            paid_at: now,
          })
          .eq("id", claimId);
      }
    }
  }

  revalidatePath("/hou");

  return { success: `Đã ${paymentStatusLabel(targetStatus)}.` };
}
