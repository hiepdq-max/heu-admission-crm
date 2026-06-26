import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  RefreshCcw,
  Save,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { firstParam } from "@/lib/workspace";

import { createTtgdtxPartnerPaymentRequestAction } from "./actions";

type PaymentRequestsPageProps = {
  searchParams?: Promise<{
    created?: string | string[];
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
  candidate_count: number;
  ready_count: number;
  blocked_count: number;
  already_requested_count: number;
  ready_total_vnd: number | string;
  request_count: number;
  requested_total_vnd: number | string;
};

type CandidateRow = {
  batch_id: string;
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
  total_receivable_vnd: number | string;
  total_reconciled_vnd: number | string;
  total_balance_vnd: number | string;
  payment_count: number;
  student_count: number;
  reconciliation_status: string;
  reconciliation_evidence_url: string | null;
  reconciliation_note: string | null;
  risk_level: string | null;
  control_status: string | null;
  line_count: number;
  unresolved_invoice_line_count: number;
  existing_request_id: string | null;
  existing_request_code: string | null;
  existing_request_status: string | null;
  blocking_items: string[] | null;
  can_create_request: boolean;
};

type RequestRow = {
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
};

const fieldClass =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500";
const textAreaClass =
  "min-h-20 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500";

const blockLabels: Record<string, string> = {
  P2_14_NOT_LOCKED: "Kỳ P2-14 chưa khóa",
  NO_RECONCILED_AMOUNT: "Chưa có số tiền đã đối soát",
  NO_RECONCILIATION_LINES: "Chưa có chứng từ hợp lệ trong kỳ",
  UNRESOLVED_COLLECTION_INVOICE:
    "Còn chứng từ thu P2-10 chưa chốt hóa đơn/chứng từ",
  P2_19_ACCEPTANCE_BEFORE_PAYOUT:
    "Thiếu BBNT hoặc hồ sơ nghiệm thu đã kiểm trước khi lập đề nghị thanh toán",
  P2_19_PARTNER_INVOICE_BEFORE_PAYOUT:
    "Thiếu hóa đơn/chứng từ thanh toán của đối tác trước khi lập đề nghị thanh toán",
  P2_19_BBNT_GATE_NOT_READY:
    "Chưa khóa điều kiện BBNT đúng kỳ, đúng trung tâm, đúng số nghiệm thu",
  P2_19_PARTNER_INVOICE_NOT_READY:
    "Chưa khóa điều kiện hóa đơn đối tác hoặc miễn trừ được phê duyệt",
  MISSING_BBNT: "Thiếu biên bản nghiệm thu",
  MISSING_PARTNER_INVOICE: "Thiếu hóa đơn đối tác",
  MISSING_PAYMENT_DOSSIER: "Thiếu bộ hồ sơ thanh toán",
  ALREADY_REQUESTED: "Đã có đề nghị thanh toán P2-15",
};

const requestStatusLabels: Record<string, string> = {
  SUBMITTED: "Đã lập đề nghị",
  CHECKED: "Đã kiểm",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
  PAID: "Đã chi",
};

const requestStatusTone: Record<string, string> = {
  SUBMITTED: "border-blue-200 bg-blue-50 text-blue-700",
  CHECKED: "border-cyan-200 bg-cyan-50 text-cyan-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  CANCELLED: "border-zinc-200 bg-zinc-100 text-zinc-600",
  PAID: "border-purple-200 bg-purple-50 text-purple-700",
};

const emptySummary: SummaryRow = {
  candidate_count: 0,
  ready_count: 0,
  blocked_count: 0,
  already_requested_count: 0,
  ready_total_vnd: 0,
  request_count: 0,
  requested_total_vnd: 0,
};

function money(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  const safeValue = Number.isFinite(numeric) ? numeric : 0;
  const formatted = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(safeValue);

  return `${formatted.replace(/\./g, " ")} đ`;
}

function rawAmount(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);

  return Number.isFinite(numeric) ? String(Math.round(numeric)) : "0";
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

function messageFromParams(created?: string | null, error?: string | null) {
  if (error) {
    return {
      tone: "error" as const,
      text: `Chưa tạo được P2-15: ${error}`,
    };
  }

  if (created) {
    return {
      tone: "success" as const,
      text: "Đã tạo đề nghị thanh toán P2-15. Phiếu đã nằm ở danh sách chờ kiểm/duyệt, bước này chưa chi tiền.",
    };
  }

  return null;
}

function canOpenTtgdtxPaymentRequests(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasPaymentRequestRead: boolean,
  hasReconciliationRead: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || (!hasPaymentRequestRead && !hasReconciliationRead)) {
    return false;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

function blockText(code: string) {
  return blockLabels[code] ?? code;
}

export default async function TtgdtxPaymentRequestsPage({
  searchParams,
}: PaymentRequestsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    roleResult,
    paymentReadResult,
    paymentManageResult,
    reconciliationReadResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.payment_request.read",
    }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.payment_request.manage",
    }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.reconciliation.read",
    }),
    supabase
      .from("admission_segments")
      .select("id,segment_code,segment_name")
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

  const segment = segmentResult.data;
  const canOpen = canOpenTtgdtxPaymentRequests(
    segment?.id ?? null,
    roleResult.data as string | null,
    scopeResult.data ?? [],
    Boolean(paymentReadResult.data),
    Boolean(reconciliationReadResult.data),
  );
  const canManage =
    roleResult.data === "ADMIN" ||
    roleResult.data === "BGH" ||
    Boolean(paymentManageResult.data);
  let summary = emptySummary;
  let candidates: CandidateRow[] = [];
  let requests: RequestRow[] = [];
  let dataError: { message: string } | null = null;

  if (canOpen) {
    const [summaryResult, candidateResult, requestResult] = await Promise.all([
      supabase
        .from("ttgdtx_partner_payment_request_summary")
        .select("*")
        .maybeSingle<SummaryRow>(),
      supabase
        .from("ttgdtx_partner_payment_request_candidates")
        .select("*")
        .order("period_end", { ascending: false })
        .limit(30)
        .returns<CandidateRow[]>(),
      supabase
        .from("ttgdtx_partner_payment_request_board")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30)
        .returns<RequestRow[]>(),
    ]);

    summary = summaryResult.data ?? emptySummary;
    candidates = candidateResult.data ?? [];
    requests = requestResult.data ?? [];
    dataError =
      summaryResult.error ?? candidateResult.error ?? requestResult.error;
  }

  const pageMessage = messageFromParams(
    firstParam(params?.created),
    firstParam(params?.error),
  );

  return (
    <AppShell
      active="ttgdtx"
      title="Đề nghị thanh toán TTGDTX (P2-15)"
      description="Lập hồ sơ đề nghị thanh toán từ kỳ P2-14 đã khóa; bắt buộc có BBNT, hóa đơn/chứng từ đối tác và căn cứ số tiền trước khi chuyển duyệt."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/payment-requests"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/reconciliation/review">
              <ArrowLeft className="size-4" />
              Duyệt/khoá kỳ (P2-14)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/reconciliation">
              <Scale className="size-4" />
              Đối soát (P2-13)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-15">
              <FileSearch className="size-4" />
              Tìm đề nghị thanh toán
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa có quyền xem P2-15 hoặc chưa được phân vào
          phạm vi TTGDTX. Cần quyền đề nghị thanh toán hoặc quyền xem đối soát TTGDTX.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được P2-15</p>
              <p className="mt-1">
                Hãy chạy SQL step105 sau P2-14. Chi tiết kỹ thuật:{" "}
                {dataError.message}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {pageMessage ? (
            <section
              className={`rounded-lg border p-5 text-sm leading-6 ${
                pageMessage.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {pageMessage.text}
            </section>
          ) : null}

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Nguyên tắc P2-15</h2>
                <p className="mt-1">
                  P2-15 chỉ lập đề nghị thanh toán từ kỳ P2-14 đã khóa. Bước này chưa
                  chi tiền, không tạo trùng, không vượt số đã đối soát và mọi
                  thao tác đều đi qua function Supabase/audit log.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 text-sm leading-6 shadow-sm">
            <div className="flex items-start gap-3">
              <FileSearch className="mt-0.5 size-5 shrink-0 text-zinc-600" />
              <div>
                <h2 className="font-semibold">
                  Điểm chặn hồ sơ trước khi lập đề nghị thanh toán
                </h2>
                <p className="mt-1 text-zinc-600">
                  Một kỳ chỉ được tạo P2-15 khi đủ 4 lớp kiểm soát: P2-14 đã
                  khóa, số tiền khớp đối soát, BBNT đúng trung tâm/kỳ/học viên
                  đã được kiểm, và hóa đơn/chứng từ thanh toán của đối tác đã
                  gắn vào hồ sơ. Nếu một lớp chưa đạt, hệ thống chặn ngay tại
                  danh sách kỳ bên dưới.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Kỳ có thể kiểm</p>
              <p className="mt-3 text-3xl font-semibold">
                {summary.candidate_count}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Sẵn sàng đề nghị thanh toán</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-700">
                {summary.ready_count}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                {money(summary.ready_total_vnd)}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đang bị chặn</p>
              <p className="mt-3 text-3xl font-semibold text-amber-700">
                {summary.blocked_count}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Phiếu đã lập</p>
              <p className="mt-3 text-3xl font-semibold text-blue-700">
                {summary.request_count}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                {money(summary.requested_total_vnd)}
              </p>
            </article>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-base font-semibold">
                Kỳ P2-14 sẵn sàng lập đề nghị thanh toán
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Chỉ kỳ đã khóa, có tiền đã đối soát, có BBNT/hóa đơn đối tác đã
                kiểm và chưa từng lập P2-15 mới hiện nút tạo. Ô nào thiếu, hệ
                thống báo đúng chỗ đó.
              </p>
            </div>

            <div className="divide-y divide-zinc-200">
              {candidates.length === 0 ? (
                <div className="p-6 text-center text-sm text-zinc-500">
                  Chưa có kỳ P2-14 nào trong phạm vi TTGDTX đang chọn.
                </div>
              ) : (
                candidates.map((row) => {
                  const blockingItems = row.blocking_items ?? [];

                  return (
                    <article
                      key={row.batch_id}
                      className="grid gap-5 p-5 xl:grid-cols-[1.1fr_1.2fr_1.4fr]"
                    >
                      <div>
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                            row.can_create_request
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {row.can_create_request
                            ? "Đủ điều kiện P2-15"
                            : "Chưa đủ điều kiện"}
                        </span>
                        <h3 className="mt-3 text-base font-semibold">
                          {row.partner_name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          {row.partner_code ?? "Chưa có mã"} ·{" "}
                          {row.period_label}
                        </p>
                        <p className="mt-3 text-sm">
                          <span className="font-medium">Kỳ:</span>{" "}
                          {row.batch_name}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {formatDate(row.period_start)} -{" "}
                          {formatDate(row.period_end)}
                        </p>
                        <p className="mt-3 text-sm text-zinc-500">
                          {row.payment_count} chứng từ · {row.student_count} học
                          sinh · {row.line_count} dòng đối soát
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          Cần chốt hóa đơn: {row.unresolved_invoice_line_count}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-zinc-50 p-4">
                          <p className="text-xs uppercase text-zinc-500">
                            Đã đối soát
                          </p>
                          <p className="mt-2 text-xl font-semibold text-emerald-700">
                            {money(row.total_reconciled_vnd)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-4">
                          <p className="text-xs uppercase text-zinc-500">
                            Còn phải thu
                          </p>
                          <p className="mt-2 text-xl font-semibold text-amber-700">
                            {money(row.total_balance_vnd)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-4">
                          <p className="text-xs uppercase text-zinc-500">
                            Trạng thái P2-14
                          </p>
                          <p className="mt-2 font-medium">
                            {row.reconciliation_status}
                          </p>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-4">
                          <p className="text-xs uppercase text-zinc-500">
                            Kiểm soát
                          </p>
                          <p className="mt-2 font-medium">
                            {row.control_status ?? "Chưa có"}
                          </p>
                        </div>
                      </div>

                      <div>
                        {row.existing_request_id ? (
                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                              <div>
                                <p className="font-medium">
                                  Đã có đề nghị thanh toán P2-15
                                </p>
                                <p className="mt-1">
                                  {row.existing_request_code} ·{" "}
                                  {requestStatusLabels[
                                    row.existing_request_status ?? ""
                                  ] ??
                                    row.existing_request_status ??
                                    "Chưa rõ trạng thái"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : row.can_create_request ? (
                          canManage ? (
                            <form
                              action={
                                createTtgdtxPartnerPaymentRequestAction
                              }
                              className="space-y-3"
                            >
                              <input
                                name="batch_id"
                                type="hidden"
                                value={row.batch_id}
                              />
                              <input
                                name="requested_amount_vnd"
                                type="hidden"
                                value={rawAmount(row.total_reconciled_vnd)}
                              />
                              <input
                                name="return_to"
                                type="hidden"
                                value="/ttgdtx/payment-requests"
                              />
                              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                                Có thể lập đề nghị thanh toán:{" "}
                                <span className="font-semibold">
                                  {money(row.total_reconciled_vnd)}
                                </span>
                              </div>
                              <label className="block text-sm">
                                <span className="font-medium">
                                  Link bộ hồ sơ BBNT/hóa đơn đối tác
                                </span>
                                <input
                                  className={`${fieldClass} mt-1`}
                                  name="evidence_url"
                                  placeholder="Link Drive tới BBNT, hóa đơn đối tác, bảng tính số tiền..."
                                  required
                                />
                                <span className="mt-1 block text-xs text-zinc-500">
                                  Không nhập tài khoản ngân hàng, CCCD, mật khẩu
                                  hoặc dữ liệu học viên chi tiết vào ô này.
                                </span>
                              </label>
                              <label className="block text-sm">
                                <span className="font-medium">Ghi chú</span>
                                <textarea
                                  className={`${textAreaClass} mt-1`}
                                  name="note"
                                  placeholder="VD: BBNT đúng kỳ, hóa đơn đối tác đã nhận, số đề nghị bằng số đã đối soát."
                                />
                              </label>
                              <Button type="submit">
                                <Save className="size-4" />
                                Tạo đề nghị thanh toán P2-15
                              </Button>
                            </form>
                          ) : (
                            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                              Kỳ này đủ điều kiện, nhưng tài khoản hiện tại chỉ
                              được xem, chưa được tạo đề nghị thanh toán.
                            </div>
                          )
                        ) : (
                          <div className="space-y-2 text-sm text-amber-800">
                            {blockingItems.map((item) => (
                              <div key={item} className="flex gap-2">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                <span>{blockText(item)}</span>
                              </div>
                            ))}
                            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                              Cần xử lý đúng điểm bị chặn trước. Dữ liệu đúng
                              vẫn giữ nguyên, không bắt nhập lại; chỉ bổ sung
                              hoặc duyệt phần hồ sơ còn thiếu.
                            </p>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-base font-semibold">
                Phiếu đề nghị thanh toán P2-15 đã tạo
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Đây là hồ sơ chờ kiểm/duyệt. Chưa phải lệnh chi tiền cho
                TTGDTX.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Phiếu</th>
                    <th className="px-5 py-3">TTGDTX / kỳ</th>
                    <th className="px-5 py-3">Số tiền</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Minh chứng</th>
                    <th className="px-5 py-3">Mốc hệ thống</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {requests.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-zinc-500"
                        colSpan={6}
                      >
                        Chưa có phiếu đề nghị thanh toán P2-15.
                      </td>
                    </tr>
                  ) : (
                    requests.map((row) => (
                      <tr key={row.request_id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-medium">{row.request_code}</p>
                          <p className="mt-1 text-zinc-500">
                            {row.request_name}
                          </p>
                          <p className="mt-2 text-xs text-zinc-500">
                            {row.payment_count} chứng từ · {row.student_count}{" "}
                            học sinh · {row.line_count} dòng
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium">{row.partner_name}</p>
                          <p className="mt-1 text-zinc-500">
                            {row.partner_code ?? "Chưa có mã"} ·{" "}
                            {row.period_label}
                          </p>
                          <p className="mt-2 text-xs text-zinc-500">
                            {row.batch_code}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p>
                            Đề nghị:{" "}
                            <span className="font-semibold">
                              {money(row.requested_amount_vnd)}
                            </span>
                          </p>
                          <p className="mt-1 text-zinc-500">
                            Duyệt: {money(row.approved_amount_vnd)}
                          </p>
                          <p className="mt-1 text-zinc-500">
                            Đã chi: {money(row.paid_amount_vnd)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                              requestStatusTone[row.request_status] ??
                              "border-zinc-200 bg-zinc-50 text-zinc-700"
                            }`}
                          >
                            {requestStatusLabels[row.request_status] ??
                              row.request_status}
                          </span>
                          <p className="mt-3 text-xs text-zinc-500">
                            Kiểm soát: {row.control_status ?? "Chưa có"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Rủi ro: {row.risk_level ?? "Chưa đánh giá"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {row.evidence_url ? (
                            <a
                              className="text-blue-700 underline"
                              href={row.evidence_url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Mở minh chứng
                            </a>
                          ) : (
                            <span className="text-zinc-500">Chưa gắn link</span>
                          )}
                          {row.note ? (
                            <p className="mt-2 text-zinc-500">{row.note}</p>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-zinc-500">
                          <p>Tạo: {formatDateTime(row.created_at)}</p>
                          <p className="mt-1">
                            Người tạo: {row.created_by_name ?? "Chưa rõ"}
                          </p>
                          <p className="mt-1">
                            Cập nhật: {formatDateTime(row.updated_at)}
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
