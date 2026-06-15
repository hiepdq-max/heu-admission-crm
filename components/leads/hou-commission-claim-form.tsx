"use client";

import { useActionState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Loader2,
  PlusCircle,
  ReceiptText,
} from "lucide-react";

import {
  createHouCommissionClaimAction,
  type HouCommissionClaimFormState,
} from "@/app/leads/[id]/actions";
import { Button } from "@/components/ui/button";

export type HouCommissionPolicyOption = {
  id: string;
  policy_code: string;
  policy_name: string;
  effective_from: string;
  effective_to: string | null;
  status: string;
};

export type HouCommissionPayeeOption = {
  id: string;
  payee_type: string;
  payee_code: string | null;
  payee_name: string;
  status: string;
};

export type HouCommissionClaimRow = {
  id: string;
  policy_id: string;
  payee_id: string | null;
  classification: string;
  hou_student_code: string | null;
  student_name: string;
  commission_base_date: string;
  claim_status: string;
  dropout_risk_level: string;
  debt_offset_amount_vnd: number;
  created_at: string;
};

export type HouCommissionClaimLineRow = {
  id: string;
  claim_id: string;
  component_code: string;
  component_name: string;
  gross_amount_vnd: number;
  tax_withheld_vnd: number;
  debt_offset_amount_vnd: number;
  net_amount_vnd: number;
  line_status: string;
};

type HouCommissionClaimFormProps = {
  leadId: string;
  partnerName: string | null;
  ownerName: string | null;
  canManageHouCommission: boolean;
  loadError?: string;
  policies: HouCommissionPolicyOption[];
  payees: HouCommissionPayeeOption[];
  claims: HouCommissionClaimRow[];
  claimLines: HouCommissionClaimLineRow[];
  defaultCommissionBaseDate: string;
  defaultFirstTuitionPaidAt: string;
};

const initialState: HouCommissionClaimFormState = {};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-20 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN").format(new Date(`${value}T00:00:00`));
}

function statusClass(status: string) {
  if (status === "PAID" || status === "APPROVED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "RISK_HOLD" || status === "REJECTED") {
    return "bg-rose-50 text-rose-700";
  }

  if (status === "REVIEWING" || status === "ELIGIBLE") {
    return "bg-sky-50 text-sky-700";
  }

  return "bg-zinc-100 text-zinc-700";
}

function fieldValue(
  state: HouCommissionClaimFormState,
  name: string,
  fallback = "",
) {
  return state.fields?.[name] ?? fallback;
}

function fieldError(state: HouCommissionClaimFormState, name: string) {
  return state.fieldErrors?.[name];
}

function fieldClass(
  state: HouCommissionClaimFormState,
  name: string,
  baseClass = inputClass,
) {
  return fieldError(state, name)
    ? baseClass.replace("border-zinc-300", "border-rose-300").replace(
        "focus:border-zinc-500",
        "focus:border-rose-500",
      )
    : baseClass;
}

function FieldError({
  state,
  name,
}: {
  state: HouCommissionClaimFormState;
  name: string;
}) {
  const message = fieldError(state, name);

  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-rose-600">{message}</p>;
}

export function HouCommissionClaimForm({
  leadId,
  partnerName,
  ownerName,
  canManageHouCommission,
  loadError,
  policies,
  payees,
  claims,
  claimLines,
  defaultCommissionBaseDate,
  defaultFirstTuitionPaidAt,
}: HouCommissionClaimFormProps) {
  const [state, formAction, isPending] = useActionState(
    createHouCommissionClaimAction,
    initialState,
  );
  const activePolicies = policies.filter((policy) => policy.status === "ACTIVE");
  const activePayees = payees.filter((payee) => payee.status === "ACTIVE");
  const linesByClaim = new Map<string, HouCommissionClaimLineRow[]>();

  for (const line of claimLines) {
    const lines = linesByClaim.get(line.claim_id) ?? [];
    lines.push(line);
    linesByClaim.set(line.claim_id, lines);
  }

  if (!canManageHouCommission) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p>
            Cơ chế COM HOU là dữ liệu tài chính nhạy cảm. Chỉ Admin, BGH, Trưởng
            phòng tuyển sinh hoặc Kế toán được tạo và xem đề nghị COM.
          </p>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        Chưa đọc được dữ liệu COM HOU. Hãy kiểm tra đã chạy SQL bước 35D chưa.
        Chi tiết: {loadError}
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
          <ReceiptText className="size-5 text-zinc-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Đề nghị COM HOU</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Tạo hồ sơ đề nghị COM từ lead HOU đủ điều kiện. Bước này chưa chi
            tiền, chỉ sinh claim và dòng COM để kế toán/duyệt xử lý sau.
          </p>
        </div>
      </div>

      {claims.length > 0 ? (
        <div className="mt-5 space-y-3">
          <h4 className="text-sm font-semibold">Claim COM đã tạo</h4>
          {claims.map((claim) => {
            const lines = linesByClaim.get(claim.id) ?? [];
            const grossTotal = lines.reduce(
              (total, line) => total + line.gross_amount_vnd,
              0,
            );
            const netTotal = lines.reduce(
              (total, line) => total + line.net_amount_vnd,
              0,
            );

            return (
              <div key={claim.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                        {claim.classification}
                      </span>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass(
                          claim.claim_status,
                        )}`}
                      >
                        {claim.claim_status}
                      </span>
                      <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                        Rủi ro: {claim.dropout_risk_level}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">
                      Mã SV HOU:{" "}
                      <span className="font-mono">{claim.hou_student_code}</span> ·
                      Ngày tính COM: {formatDate(claim.commission_base_date)}
                    </p>
                  </div>
                  <div className="text-sm lg:text-right">
                    <p className="font-semibold text-zinc-950">
                      Gross {formatCurrency(grossTotal)}
                    </p>
                    <p className="mt-1 text-zinc-500">
                      Net sau thuế {formatCurrency(netTotal)}
                    </p>
                  </div>
                </div>

                {lines.length > 0 ? (
                  <div className="mt-4 overflow-x-auto rounded-md border border-zinc-200">
                    <table className="w-full min-w-[680px] text-sm">
                      <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                        <tr>
                          <th className="px-3 py-2">Thành phần</th>
                          <th className="px-3 py-2">Gross</th>
                          <th className="px-3 py-2">Thuế</th>
                          <th className="px-3 py-2">Net</th>
                          <th className="px-3 py-2">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {lines.map((line) => (
                          <tr key={line.id}>
                            <td className="px-3 py-2">
                              <p className="font-medium text-zinc-950">
                                {line.component_name}
                              </p>
                              <p className="font-mono text-xs text-zinc-500">
                                {line.component_code}
                              </p>
                            </td>
                            <td className="px-3 py-2">
                              {formatCurrency(line.gross_amount_vnd)}
                            </td>
                            <td className="px-3 py-2">
                              {formatCurrency(line.tax_withheld_vnd)}
                            </td>
                            <td className="px-3 py-2 font-medium text-zinc-950">
                              {formatCurrency(line.net_amount_vnd)}
                            </td>
                            <td className="px-3 py-2">{line.line_status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {state.error ? (
        <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <p>{state.success}</p>
          </div>
        </div>
      ) : null}

      <form
        key={
          state.success
            ? "success"
            : state.error
              ? JSON.stringify(state.fields ?? {})
              : "initial"
        }
        action={formAction}
        className="mt-5 space-y-5"
      >
        <input type="hidden" name="lead_id" value={leadId} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label htmlFor="policy_id" className="text-sm font-medium text-zinc-700">
              Chính sách COM
            </label>
            <select
              id="policy_id"
              name="policy_id"
              className={fieldClass(state, "policy_id")}
              defaultValue={fieldValue(
                state,
                "policy_id",
                activePolicies[0]?.id ?? "",
              )}
              required
              disabled={activePolicies.length === 0}
            >
              {activePolicies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.policy_code}
                </option>
              ))}
            </select>
            <FieldError state={state} name="policy_id" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="classification"
              className="text-sm font-medium text-zinc-700"
            >
              Phân loại HOU
            </label>
            <select
              id="classification"
              name="classification"
              className={fieldClass(state, "classification")}
              defaultValue={fieldValue(state, "classification", "L8A")}
              required
            >
              <option value="L8A">L8A - HEU nhập hệ thống HOU</option>
              <option value="L8B">L8B - CTV nhập hệ thống HOU</option>
            </select>
            <FieldError state={state} name="classification" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="commission_base_date"
              className="text-sm font-medium text-zinc-700"
            >
              Ngày căn cứ tính COM
            </label>
            <input
              id="commission_base_date"
              name="commission_base_date"
              type="date"
              className={fieldClass(state, "commission_base_date")}
              defaultValue={fieldValue(
                state,
                "commission_base_date",
                defaultCommissionBaseDate,
              )}
              required
            />
            <FieldError state={state} name="commission_base_date" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="hou_student_code"
              className="text-sm font-medium text-zinc-700"
            >
              Mã sinh viên HOU
            </label>
            <input
              id="hou_student_code"
              name="hou_student_code"
              className={fieldClass(state, "hou_student_code")}
              placeholder="VD: 25A..."
              defaultValue={fieldValue(state, "hou_student_code")}
              required
            />
            <FieldError state={state} name="hou_student_code" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label
              htmlFor="admission_decision_no"
              className="text-sm font-medium text-zinc-700"
            >
              Số QĐ trúng tuyển
            </label>
            <input
              id="admission_decision_no"
              name="admission_decision_no"
              className={fieldClass(state, "admission_decision_no")}
              placeholder="VD: 123/QĐ-..."
              defaultValue={fieldValue(state, "admission_decision_no")}
              required
            />
            <FieldError state={state} name="admission_decision_no" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="admission_decision_date"
              className="text-sm font-medium text-zinc-700"
            >
              Ngày QĐ trúng tuyển
            </label>
            <input
              id="admission_decision_date"
              name="admission_decision_date"
              type="date"
              className={fieldClass(state, "admission_decision_date")}
              defaultValue={fieldValue(state, "admission_decision_date")}
              required
            />
            <FieldError state={state} name="admission_decision_date" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="first_tuition_amount_vnd"
              className="text-sm font-medium text-zinc-700"
            >
              Học phí kỳ đầu đã nộp
            </label>
            <input
              id="first_tuition_amount_vnd"
              name="first_tuition_amount_vnd"
              type="number"
              min="0"
              step="1000"
              className={fieldClass(state, "first_tuition_amount_vnd")}
              placeholder="VD: 4000000"
              defaultValue={fieldValue(state, "first_tuition_amount_vnd")}
            />
            <FieldError state={state} name="first_tuition_amount_vnd" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="first_tuition_paid_at"
              className="text-sm font-medium text-zinc-700"
            >
              Ngày nộp học phí
            </label>
            <input
              id="first_tuition_paid_at"
              name="first_tuition_paid_at"
              type="date"
              className={fieldClass(state, "first_tuition_paid_at")}
              defaultValue={fieldValue(
                state,
                "first_tuition_paid_at",
                defaultFirstTuitionPaidAt,
              )}
            />
            <FieldError state={state} name="first_tuition_paid_at" />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2">
            <Banknote className="size-4 text-zinc-500" />
            <h4 className="text-sm font-semibold">Người nhận COM</h4>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label
                htmlFor="payee_mode"
                className="text-sm font-medium text-zinc-700"
              >
                Cách xác định
              </label>
              <select
                id="payee_mode"
                name="payee_mode"
                className={fieldClass(state, "payee_mode")}
                defaultValue={fieldValue(
                  state,
                  "payee_mode",
                  partnerName ? "lead_partner" : "assigned_user",
                )}
                required
              >
                <option value="lead_partner">
                  Đối tác/CTV của lead {partnerName ? `- ${partnerName}` : ""}
                </option>
                <option value="assigned_user">
                  Nhân viên phụ trách {ownerName ? `- ${ownerName}` : ""}
                </option>
                <option value="existing_payee">Chọn người nhận đã có</option>
                <option value="manual">Tạo người nhận mới</option>
              </select>
              <FieldError state={state} name="payee_mode" />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="existing_payee_id"
                className="text-sm font-medium text-zinc-700"
              >
                Người nhận đã có
              </label>
              <select
                id="existing_payee_id"
                name="existing_payee_id"
                className={fieldClass(state, "existing_payee_id")}
                defaultValue={fieldValue(state, "existing_payee_id")}
              >
                <option value="">Không chọn</option>
                {activePayees.map((payee) => (
                  <option key={payee.id} value={payee.id}>
                    {payee.payee_name} ({payee.payee_type})
                  </option>
                ))}
              </select>
              <FieldError state={state} name="existing_payee_id" />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="manual_payee_type"
                className="text-sm font-medium text-zinc-700"
              >
                Loại người nhận mới
              </label>
              <select
                id="manual_payee_type"
                name="manual_payee_type"
                className={fieldClass(state, "manual_payee_type")}
                defaultValue={fieldValue(state, "manual_payee_type", "CTV")}
              >
                <option value="CTV">CTV</option>
                <option value="EMPLOYEE">Nhân viên</option>
                <option value="ORGANIZATION">Tổ chức</option>
                <option value="PARTNER">Đối tác</option>
                <option value="OTHER">Khác</option>
              </select>
              <FieldError state={state} name="manual_payee_type" />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="manual_payee_code"
                className="text-sm font-medium text-zinc-700"
              >
                Mã người nhận mới
              </label>
              <input
                id="manual_payee_code"
                name="manual_payee_code"
                className={fieldClass(state, "manual_payee_code")}
                placeholder="VD: CTV-HOU-001"
                defaultValue={fieldValue(state, "manual_payee_code")}
              />
              <FieldError state={state} name="manual_payee_code" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="manual_payee_name"
                className="text-sm font-medium text-zinc-700"
              >
                Tên người nhận mới
              </label>
              <input
                id="manual_payee_name"
                name="manual_payee_name"
                className={fieldClass(state, "manual_payee_name")}
                placeholder="Tên CTV / nhân viên / tổ chức"
                defaultValue={fieldValue(state, "manual_payee_name")}
              />
              <FieldError state={state} name="manual_payee_name" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label
              htmlFor="dropout_risk_level"
              className="text-sm font-medium text-zinc-700"
            >
              Rủi ro bỏ học
            </label>
            <select
              id="dropout_risk_level"
              name="dropout_risk_level"
              className={fieldClass(state, "dropout_risk_level")}
              defaultValue={fieldValue(state, "dropout_risk_level", "LOW")}
            >
              <option value="LOW">LOW - thấp</option>
              <option value="MEDIUM">MEDIUM - cần theo dõi</option>
              <option value="HIGH">HIGH - giữ lại để rà soát</option>
              <option value="LEFT">LEFT - đã bỏ học</option>
            </select>
            <FieldError state={state} name="dropout_risk_level" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="debt_offset_amount_vnd"
              className="text-sm font-medium text-zinc-700"
            >
              Công nợ/bù trừ dự kiến
            </label>
            <input
              id="debt_offset_amount_vnd"
              name="debt_offset_amount_vnd"
              type="number"
              min="0"
              step="1000"
              className={fieldClass(state, "debt_offset_amount_vnd")}
              defaultValue={fieldValue(state, "debt_offset_amount_vnd", "0")}
            />
            <FieldError state={state} name="debt_offset_amount_vnd" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="dropout_risk_note"
              className="text-sm font-medium text-zinc-700"
            >
              Ghi chú rủi ro bỏ học
            </label>
            <input
              id="dropout_risk_note"
              name="dropout_risk_note"
              className={fieldClass(state, "dropout_risk_note")}
              placeholder="VD: mới đóng tạm thu, cần theo dõi trước khi chi"
              defaultValue={fieldValue(state, "dropout_risk_note")}
            />
            <FieldError state={state} name="dropout_risk_note" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="note" className="text-sm font-medium text-zinc-700">
            Ghi chú claim
          </label>
          <textarea
            id="note"
            name="note"
            className={fieldClass(state, "note", textareaClass)}
            defaultValue={fieldValue(state, "note")}
            placeholder="Ghi chú đối soát, chứng từ, danh sách đính kèm..."
          />
          <FieldError state={state} name="note" />
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 text-amber-700" />
            <p className="text-sm leading-6 text-amber-800">
              Hệ thống sẽ chặn claim trùng theo lead/chính sách và mã sinh viên
              HOU/chính sách. Claim có rủi ro cao sẽ vào RISK_HOLD, chưa chuyển
              sang thanh toán.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || activePolicies.length === 0}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <PlusCircle className="size-4" />
            )}
            Tạo đề nghị COM
          </Button>
        </div>
      </form>
    </section>
  );
}
