import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  RefreshCcw,
  Save,
  ShieldCheck,
  WalletCards,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { firstParam } from "@/lib/workspace";

import { reviewTtgdtxPartnerPaymentRequestAction } from "./actions";

type PaymentRequestReviewPageProps = {
  searchParams?: Promise<{
    updated?: string | string[];
    error?: string | string[];
  }>;
};

type SegmentRow = {
  id: string;
  segment_code: string;
  segment_name: string;
};

type ScopeRow = {
  segment_id: string;
};

type SummaryRow = {
  request_count: number;
  submitted_count: number;
  checked_count: number;
  approved_count: number;
  returned_count: number;
  paid_count: number;
  requested_total_vnd: number | string;
  approved_total_vnd: number | string;
  paid_total_vnd: number | string;
};

type ApprovalRow = {
  request_id: string;
  request_code: string;
  request_name: string;
  reconciliation_batch_id: string;
  batch_code: string;
  batch_name: string;
  partner_id: string;
  partner_code: string | null;
  partner_name: string;
  admission_segment_id: string;
  segment_code: string | null;
  segment_name: string | null;
  period_label: string;
  period_start: string;
  period_end: string;
  total_reconciled_vnd: number | string;
  requested_amount_vnd: number | string;
  approved_amount_vnd: number | string;
  paid_amount_vnd: number | string;
  payment_count: number;
  student_count: number;
  line_count: number;
  request_status: string;
  evidence_url: string | null;
  note: string | null;
  risk_level: string | null;
  control_status: string | null;
  created_by_name: string | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
  blocking_items: string[] | null;
  can_check: boolean;
  can_approve: boolean;
  can_return: boolean;
  is_approval_open: boolean;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500";
const textAreaClass =
  "min-h-20 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500";

const emptySummary: SummaryRow = {
  request_count: 0,
  submitted_count: 0,
  checked_count: 0,
  approved_count: 0,
  returned_count: 0,
  paid_count: 0,
  requested_total_vnd: 0,
  approved_total_vnd: 0,
  paid_total_vnd: 0,
};

const requestStatusLabels: Record<string, string> = {
  SUBMITTED: "Chờ kiểm",
  CHECKED: "Đã kiểm, chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Trả về / hủy",
  PAID: "Đã chi",
};

const requestStatusTone: Record<string, string> = {
  SUBMITTED: "border-blue-200 bg-blue-50 text-blue-700",
  CHECKED: "border-cyan-200 bg-cyan-50 text-cyan-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  CANCELLED: "border-amber-200 bg-amber-50 text-amber-800",
  PAID: "border-purple-200 bg-purple-50 text-purple-700",
};

const blockLabels: Record<string, string> = {
  REQUEST_NOT_OPEN: "Phiếu không còn ở trạng thái chờ kiểm/duyệt",
  REQUEST_ALREADY_PAID: "Phiếu đã có tiền chi, không được sửa ở P2-16",
  NO_REQUEST_AMOUNT: "Phiếu chưa có số tiền đề nghị chi",
  NO_REQUEST_LINES: "Phiếu chưa có dòng chi tiết",
  REQUEST_GREATER_THAN_RECONCILED: "Số tiền đề nghị lớn hơn số đã đối soát",
};

function money(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  const safeValue = Number.isFinite(numeric) ? numeric : 0;
  const formatted = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(safeValue);

  return `${formatted.replace(/\./g, " ")} đ`;
}

function amountInput(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  const safeValue = Number.isFinite(numeric) ? numeric : 0;
  const formatted = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(safeValue);

  return formatted.replace(/\./g, " ");
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function messageFromParams(updated?: string | null, error?: string | null) {
  if (error) {
    return {
      tone: "error" as const,
      text: `Chưa lưu được P2-16: ${error}`,
    };
  }

  if (!updated) {
    return null;
  }

  const labels: Record<string, string> = {
    CHECK: "Đã kiểm phiếu P2-16 và chuyển sang chờ duyệt.",
    APPROVE: "Đã duyệt đề nghị chi P2-16. Bước này chưa chi tiền.",
    RETURN: "Đã trả phiếu về bổ sung ở P2-16.",
    REJECT: "Đã từ chối đề nghị chi ở P2-16.",
  };

  return {
    tone: "success" as const,
    text: labels[updated] ?? "Đã lưu xử lý P2-16.",
  };
}

function canOpenTtgdtxPaymentApproval(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasPaymentManage: boolean,
  hasPaymentApprove: boolean,
  hasLegacyApprove: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  return Boolean(
    segmentId &&
      (hasPaymentManage || hasPaymentApprove || hasLegacyApprove) &&
      scopes.some((scope) => scope.segment_id === segmentId),
  );
}

function blockText(code: string) {
  return blockLabels[code] ?? code;
}

export default async function PaymentRequestReviewPage({
  searchParams,
}: PaymentRequestReviewPageProps) {
  const params = await searchParams;
  const updated = firstParam(params?.updated) ?? null;
  const error = firstParam(params?.error) ?? null;
  const pageMessage = messageFromParams(updated, error);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    roleResult,
    paymentManageResult,
    paymentApproveResult,
    legacyApproveResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.payment_request.manage",
    }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.payment_request.approve",
    }),
    supabase.rpc("has_permission", { permission_name: "payments.approve" }),
    supabase
      .from("admission_segments")
      .select("id, segment_code, segment_name")
      .eq("segment_code", "TC9_TTGDTX_LINKED")
      .eq("status", "ACTIVE")
      .maybeSingle<SegmentRow>(),
    supabase
      .from("user_admission_segment_scopes")
      .select("segment_id")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .returns<ScopeRow[]>(),
  ]);

  const roleCode = (roleResult.data as string | null) ?? null;
  const hasPaymentManage = Boolean(paymentManageResult.data);
  const hasPaymentApprove = Boolean(paymentApproveResult.data);
  const hasLegacyApprove = Boolean(legacyApproveResult.data);
  const segment = segmentResult.data ?? null;
  const scopes = scopeResult.data ?? [];
  const canManage = canOpenTtgdtxPaymentApproval(
    segment?.id ?? null,
    roleCode,
    scopes,
    hasPaymentManage,
    hasPaymentApprove,
    hasLegacyApprove,
  );
  let summary = emptySummary;
  let requests: ApprovalRow[] = [];
  let dataError: { message: string } | null = null;

  if (canManage) {
    const [summaryResult, boardResult] = await Promise.all([
      supabase
        .from("ttgdtx_partner_payment_approval_summary")
        .select("*")
        .maybeSingle<SummaryRow>(),
      supabase
        .from("ttgdtx_partner_payment_approval_board")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)
        .returns<ApprovalRow[]>(),
    ]);

    summary = summaryResult.data ?? emptySummary;
    requests = boardResult.data ?? [];
    dataError = summaryResult.error ?? boardResult.error;
  }

  return (
    <AppShell
      active="ttgdtx"
      description="Kiểm, duyệt, trả về hoặc từ chối đề nghị chi TTGDTX đã tạo ở P2-15. Bước này chưa chi tiền."
      title="P2-16 - Kiểm/duyệt đề nghị chi TTGDTX"
      workspaceReturnTo="/ttgdtx/payment-requests/review"
      workspaceSegmentId={segment?.id ?? null}
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests">
              <ArrowLeft className="size-4" />
              P2-15 đề nghị chi
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/reconciliation/review">
              <ShieldCheck className="size-4" />
              P2-14 duyệt kỳ
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests/review">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-16">
              <FileSearch className="size-4" />
              Tìm P2-16
            </Link>
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {pageMessage ? (
          <div
            className={`rounded-lg border p-4 text-sm ${
              pageMessage.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {pageMessage.text}
          </div>
        ) : null}

        {!canManage ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Tài khoản hiện tại chỉ có thể xem theo phạm vi, chưa có quyền
            kiểm/duyệt đề nghị chi TTGDTX. Nếu cần thao tác, hãy phân quyền
            <span className="font-semibold">
              {" "}
              ttgdtx.payment_request.approve
            </span>
            .
          </div>
        ) : null}

        {dataError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Chưa đọc được P2-16: {dataError.message}. Nếu chưa chạy SQL, hãy
            chạy file step106 trước.
          </div>
        ) : null}

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 size-5 shrink-0" />
            <div>
              <h2 className="font-semibold">Nguyên tắc P2-16</h2>
              <p className="mt-2 text-sm leading-6">
                P2-16 chỉ kiểm/duyệt đề nghị chi đã lập ở P2-15. Bước này
                không chi tiền thật, không thay chứng từ kế toán chính thức và
                không được duyệt vượt số tiền đã đề nghị. Ghi chú duyệt sẽ được
                lưu vào phiếu để phục vụ audit.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Chờ kiểm", summary.submitted_count, money(summary.requested_total_vnd), "text-blue-700"],
            ["Đã kiểm", summary.checked_count, "Chờ duyệt", "text-cyan-700"],
            ["Đã duyệt", summary.approved_count, money(summary.approved_total_vnd), "text-emerald-700"],
            ["Trả về/từ chối", summary.returned_count, `Đã chi: ${money(summary.paid_total_vnd)}`, "text-amber-700"],
          ].map(([label, value, note, color]) => (
            <div
              key={label}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-zinc-500">{label}</p>
              <p className={`mt-4 text-3xl font-semibold ${color}`}>{value}</p>
              <p className="mt-2 text-sm text-zinc-500">{note}</p>
            </div>
          ))}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <div className="flex items-start gap-3">
              <WalletCards className="mt-1 size-5 text-zinc-500" />
              <div>
                <h2 className="font-semibold">Đề nghị chi chờ P2-16</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Mỗi dòng là một phiếu P2-15. Nếu số liệu đúng, chọn kiểm
                  hoặc duyệt. Nếu còn thiếu, trả về và ghi rõ lý do.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-zinc-200">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">
                Chưa có đề nghị chi TTGDTX để kiểm/duyệt.
              </div>
            ) : (
              requests.map((row) => {
                const blockingItems = row.blocking_items ?? [];
                const openActions =
                  row.is_approval_open &&
                  canManage &&
                  (row.can_check || row.can_approve || row.can_return);

                return (
                  <article
                    className="grid gap-5 p-5 xl:grid-cols-[1.2fr_1.4fr_1.2fr]"
                    key={row.request_id}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                            requestStatusTone[row.request_status] ??
                            "border-zinc-200 bg-zinc-50 text-zinc-700"
                          }`}
                        >
                          {requestStatusLabels[row.request_status] ??
                            row.request_status}
                        </span>
                        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                          {row.request_code}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold">
                        {row.request_name}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-500">
                        {row.partner_name} - {row.period_label}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {formatDate(row.period_start)} -{" "}
                        {formatDate(row.period_end)}
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-zinc-50 p-3">
                          <p className="text-xs uppercase text-zinc-500">
                            Đề nghị
                          </p>
                          <p className="mt-1 font-semibold">
                            {money(row.requested_amount_vnd)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
                          <p className="text-xs uppercase">Duyệt</p>
                          <p className="mt-1 font-semibold">
                            {money(row.approved_amount_vnd)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-3">
                          <p className="text-xs uppercase text-zinc-500">
                            Đã chi
                          </p>
                          <p className="mt-1 font-semibold">
                            {money(row.paid_amount_vnd)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-zinc-500">
                        {row.payment_count} chứng từ - {row.student_count} học
                        sinh - {row.line_count} dòng
                      </p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                        <p className="text-xs uppercase text-zinc-500">
                          Kiểm soát
                        </p>
                        <p className="mt-2 font-medium">
                          {row.control_status ?? "Chưa có"} - Rủi ro: {" "}
                          {row.risk_level ?? "Chưa đánh giá"}
                        </p>
                        <p className="mt-2 text-zinc-500">
                          Tạo: {formatDateTime(row.created_at)} - Người tạo:{" "}
                          {row.created_by_name ?? "Chưa rõ"}
                        </p>
                      </div>

                      {blockingItems.length > 0 ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                          <p className="font-medium">Cần kiểm tra trước</p>
                          <div className="mt-2 space-y-2">
                            {blockingItems.map((item) => (
                              <p className="flex gap-2" key={item}>
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                <span>{blockText(item)}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                          <div className="flex gap-2">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                            <span>Không có lỗi chặn tự động.</span>
                          </div>
                        </div>
                      )}

                      {row.evidence_url ? (
                        <a
                          className="inline-flex text-blue-700 underline"
                          href={row.evidence_url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Mở minh chứng
                        </a>
                      ) : (
                        <p className="text-zinc-500">Chưa gắn link minh chứng.</p>
                      )}

                      {row.note ? (
                        <div className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-4 text-zinc-600">
                          {row.note}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      {openActions ? (
                        <form
                          action={reviewTtgdtxPartnerPaymentRequestAction}
                          className="space-y-3"
                        >
                          <input
                            name="request_id"
                            type="hidden"
                            value={row.request_id}
                          />
                          <input
                            name="return_to"
                            type="hidden"
                            value="/ttgdtx/payment-requests/review"
                          />
                          <label className="block text-sm">
                            <span className="font-medium">Hành động P2-16</span>
                            <select
                              className={`${fieldClass} mt-1`}
                              name="action_type"
                            >
                              {row.can_check ? (
                                <option value="CHECK">
                                  Đã kiểm, chuyển duyệt
                                </option>
                              ) : null}
                              {row.can_approve ? (
                                <option value="APPROVE">
                                  Duyệt đề nghị chi
                                </option>
                              ) : null}
                              {row.can_return ? (
                                <option value="RETURN">Trả về bổ sung</option>
                              ) : null}
                              {row.can_return ? (
                                <option value="REJECT">Từ chối</option>
                              ) : null}
                            </select>
                          </label>

                          <label className="block text-sm">
                            <span className="font-medium">
                              Số tiền duyệt
                            </span>
                            <input
                              className={`${fieldClass} mt-1`}
                              defaultValue={amountInput(
                                row.requested_amount_vnd,
                              )}
                              inputMode="numeric"
                              name="approved_amount_vnd"
                              placeholder="VD: 1 000 000"
                            />
                            <span className="mt-1 block text-xs text-zinc-500">
                              Có thể nhập 1000000 hoặc 1 000 000; hệ thống tự
                              hiểu là một triệu đồng.
                            </span>
                          </label>

                          <label className="block text-sm">
                            <span className="font-medium">
                              Link minh chứng nếu có
                            </span>
                            <input
                              className={`${fieldClass} mt-1`}
                              name="evidence_url"
                              placeholder="Link Drive, biên bản kiểm/duyệt..."
                            />
                          </label>

                          <label className="block text-sm">
                            <span className="font-medium">
                              Ghi chú kiểm/duyệt
                            </span>
                            <textarea
                              className={`${textAreaClass} mt-1`}
                              name="note"
                              placeholder="VD: Đề nghị chi thử sau khi đã khóa kỳ đối soát P2-14."
                            />
                          </label>

                          <Button className="w-full" type="submit">
                            <Save className="size-4" />
                            Lưu P2-16
                          </Button>
                        </form>
                      ) : row.is_approval_open && canManage ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                          <div className="flex gap-2">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <span>
                              Phiếu còn cảnh báo, chưa mở hành động duyệt. Nếu
                              cần trả về/từ chối, hãy kiểm tra quyền P2-16.
                            </span>
                          </div>
                        </div>
                      ) : row.is_approval_open ? (
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                          Tài khoản hiện tại chưa có quyền thao tác P2-16.
                        </div>
                      ) : (
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                          <div className="flex gap-2">
                            {row.request_status === "REJECTED" ||
                            row.request_status === "CANCELLED" ? (
                              <XCircle className="mt-0.5 size-4 shrink-0" />
                            ) : (
                              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                            )}
                            <span>
                              Phiếu đang ở trạng thái{" "}
                              {requestStatusLabels[row.request_status] ??
                                row.request_status}
                              .
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
