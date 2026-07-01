import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  FileSearch,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TtgdtxOperatingControlStrip } from "@/components/ttgdtx/ttgdtx-operating-control-strip";
import { TtgdtxPaymentDossierChecklist } from "@/components/ttgdtx/ttgdtx-payment-dossier-checklist";
import { TtgdtxPayoutDuplicateGuard } from "@/components/ttgdtx/ttgdtx-payout-duplicate-guard";
import { TtgdtxPayoutExecutionReadinessChecklist } from "@/components/ttgdtx/ttgdtx-payout-execution-readiness-checklist";
import { TtgdtxPayoutUatEvidenceChecklist } from "@/components/ttgdtx/ttgdtx-payout-uat-evidence-checklist";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  formatVndAmount as money,
  formatVndInput as amountInput,
} from "@/lib/vnd-money";
import { firstParam } from "@/lib/workspace";

import { PaymentSubmitButton } from "./payment-submit-button";
import { recordTtgdtxPartnerPaymentDisbursementAction } from "./actions";

type PaymentExecutionPageProps = {
  searchParams?: Promise<{
    paid?: string | string[];
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
  payable_count: number;
  blocked_count: number;
  paid_count: number;
  approved_total_vnd: number | string;
  paid_total_vnd: number | string;
  remaining_total_vnd: number | string;
};

type ExecutionRow = {
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
  remaining_amount_vnd: number | string;
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
  is_payment_open: boolean;
  can_pay: boolean;
};

type RecentPaymentRow = {
  disbursement_id: string;
  disbursement_code: string;
  request_id: string;
  request_code: string;
  request_name: string;
  partner_code: string | null;
  partner_name: string;
  period_label: string;
  payment_date: string;
  payment_method: string;
  voucher_no: string;
  amount_vnd: number | string;
  recipient_name: string | null;
  recipient_account: string | null;
  recipient_bank: string | null;
  evidence_url: string | null;
  note: string | null;
  payment_status: string;
  risk_level: string | null;
  control_status: string | null;
  created_by_name: string | null;
  created_at: string;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500";
const textAreaClass =
  "min-h-20 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500";

const emptySummary: SummaryRow = {
  request_count: 0,
  payable_count: 0,
  blocked_count: 0,
  paid_count: 0,
  approved_total_vnd: 0,
  paid_total_vnd: 0,
  remaining_total_vnd: 0,
};

const requestStatusLabels: Record<string, string> = {
  APPROVED: "Đã duyệt, chờ chi",
  PAID: "Đã chi đủ",
};

const blockLabels: Record<string, string> = {
  REQUEST_ALREADY_PAID: "Phiếu đã chi đủ",
  REQUEST_NOT_APPROVED: "Phiếu chưa được duyệt P2-16",
  NO_APPROVED_AMOUNT: "Chưa có số tiền duyệt",
  NO_REMAINING_AMOUNT: "Không còn số tiền phải chi",
  P2_19_ACCEPTANCE_BEFORE_PAYOUT:
    "Thiếu BBNT hoặc hồ sơ nghiệm thu đã kiểm trước khi chi tiền",
  P2_19_PARTNER_INVOICE_BEFORE_PAYOUT:
    "Thiếu hóa đơn/chứng từ thanh toán của đối tác trước khi chi tiền",
};

const paymentMethodLabels: Record<string, string> = {
  BANK_TRANSFER: "Chuyển khoản",
  CASH: "Tiền mặt",
  OFFSET: "Bù trừ công nợ",
  OTHER: "Khác",
};

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

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function blockText(code: string) {
  return blockLabels[code] ?? code;
}

function canOpenTtgdtxPaymentExecution(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasPaymentManage: boolean,
  hasPaymentPay: boolean,
  hasLegacyPay: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  return Boolean(
    segmentId &&
      (hasPaymentManage || hasPaymentPay || hasLegacyPay) &&
      scopes.some((scope) => scope.segment_id === segmentId),
  );
}

function messageFromParams(paid?: string | null, error?: string | null) {
  if (error) {
    return {
      tone: "error" as const,
      text: `Chưa ghi nhận được P2-17: ${error}`,
    };
  }

  if (paid) {
    return {
      tone: "success" as const,
      text: "Đã ghi nhận chi tiền P2-17 và cập nhật trạng thái đề nghị thanh toán.",
    };
  }

  return null;
}

export default async function PaymentExecutionPage({
  searchParams,
}: PaymentExecutionPageProps) {
  const params = await searchParams;
  const pageMessage = messageFromParams(
    firstParam(params?.paid),
    firstParam(params?.error),
  );

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
    paymentPayResult,
    legacyPayResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.payment_request.manage",
    }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.payment_request.pay",
    }),
    supabase.rpc("has_permission", { permission_name: "payments.pay" }),
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
  const segment = segmentResult.data ?? null;
  const scopes = scopeResult.data ?? [];
  const canManage = canOpenTtgdtxPaymentExecution(
    segment?.id ?? null,
    roleCode,
    scopes,
    Boolean(paymentManageResult.data),
    Boolean(paymentPayResult.data),
    Boolean(legacyPayResult.data),
  );
  let summary = emptySummary;
  let requests: ExecutionRow[] = [];
  let recentPayments: RecentPaymentRow[] = [];
  let dataError: { message: string } | null = null;

  if (canManage) {
    const [summaryResult, boardResult, recentResult] = await Promise.all([
      supabase
        .from("ttgdtx_partner_payment_execution_summary")
        .select("*")
        .maybeSingle<SummaryRow>(),
      supabase
        .from("ttgdtx_partner_payment_execution_board")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)
        .returns<ExecutionRow[]>(),
      supabase
        .from("ttgdtx_partner_payment_disbursement_recent")
        .select("*")
        .limit(30)
        .returns<RecentPaymentRow[]>(),
    ]);

    summary = summaryResult.data ?? emptySummary;
    requests = boardResult.data ?? [];
    recentPayments = recentResult.data ?? [];
    dataError = summaryResult.error ?? boardResult.error ?? recentResult.error;
  }

  const today = todayDate();

  return (
    <AppShell
      active="ttgdtx"
      title="Chi tiền TTGDTX (P2-17)"
      description="Ghi nhận tiền đã chi sau khi P2-16 duyệt, đồng thời khóa trùng chứng từ, vượt số tiền, thiếu BBNT/hóa đơn đối tác và thiếu chứng từ chi."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/payment-requests/pay"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests/review">
              <ArrowLeft className="size-4" />
              Duyệt thanh toán (P2-16)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests">
              <WalletCards className="size-4" />
              Đề nghị thanh toán (P2-15)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests/pay">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-17">
              <FileSearch className="size-4" />
              Tìm chứng từ chi
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
            Tài khoản hiện tại chỉ có thể xem P2-17 theo phạm vi. Muốn ghi nhận
            chi tiền, cần quyền{" "}
            <span className="font-semibold">ttgdtx.payment_request.pay</span>{" "}
            hoặc <span className="font-semibold">payments.pay</span>.
          </div>
        ) : null}

        {dataError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Chưa đọc được dữ liệu P2-17: {dataError.message}. Nếu bạn chưa chạy
            SQL thì hãy chạy file database/step107_ttgdtx_payment_execution_p2_17.sql.
          </div>
        ) : null}

        <TtgdtxOperatingControlStrip currentCode="P2-17" />

        <TtgdtxPaymentDossierChecklist currentStep="P2-17" />

        <TtgdtxPayoutDuplicateGuard />
        <TtgdtxPayoutExecutionReadinessChecklist />
        <TtgdtxPayoutUatEvidenceChecklist />

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 size-5 shrink-0" />
            <div>
              <h2 className="font-semibold">Nguyên tắc P2-17</h2>
              <p className="mt-2 text-sm leading-6">
                P2-17 chỉ ghi nhận tiền đã chi sau khi P2-16 đã duyệt. Hệ thống
                chặn chi vượt số tiền duyệt, chặn trùng số chứng từ, chặn nếu
                BBNT/hóa đơn đối tác P2-19 chưa đạt, yêu cầu link chứng từ chi và
                lưu log để kế toán/audit đối chiếu sau này.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">Phiếu theo dõi</p>
            <p className="mt-4 text-3xl font-semibold">
              {summary.request_count}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">Sẵn sàng chi</p>
            <p className="mt-4 text-3xl font-semibold text-emerald-700">
              {summary.payable_count}
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              {money(summary.remaining_total_vnd)}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">Đã chi</p>
            <p className="mt-4 text-3xl font-semibold text-blue-700">
              {summary.paid_count}
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              {money(summary.paid_total_vnd)}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">Đang bị chặn</p>
            <p className="mt-4 text-3xl font-semibold text-orange-700">
              {summary.blocked_count}
            </p>
          </div>
        </section>

        <section className="rounded-lg border bg-white shadow-sm">
          <div className="border-b p-5">
            <div className="flex items-start gap-3">
              <Banknote className="mt-1 size-5 text-zinc-500" />
              <div>
                <h2 className="text-xl font-semibold">
                  Phiếu P2-16 đã duyệt chờ chi
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Nhập đúng số tiền thực chi, số chứng từ và link chứng từ chi.
                  Nếu BBNT/hóa đơn đối tác chưa đạt hoặc chứng từ chi thiếu,
                  hệ thống khóa ngay tại phiếu này.
                </p>
              </div>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="p-5 text-sm text-zinc-500">
              Chưa có phiếu P2-16 đã duyệt trong phạm vi đang chọn.
            </div>
          ) : (
            <div className="divide-y">
              {requests.map((request) => {
                const blocks = request.blocking_items ?? [];
                const canPayThisRequest = canManage && request.can_pay;

                return (
                  <div
                    className="grid gap-5 p-5 xl:grid-cols-[1.15fr_1fr]"
                    key={request.request_id}
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-lg border px-3 py-1 text-sm ${
                            request.request_status === "PAID"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {requestStatusLabels[request.request_status] ??
                            request.request_status}
                        </span>
                        <span className="rounded-lg bg-zinc-100 px-3 py-1 text-sm text-zinc-600">
                          {request.request_code}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">
                          {request.request_name}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {request.partner_name} · {request.period_label}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {formatDate(request.period_start)} -{" "}
                          {formatDate(request.period_end)}
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-lg bg-zinc-50 p-4">
                          <p className="text-xs font-semibold uppercase text-zinc-500">
                            Đề nghị
                          </p>
                          <p className="mt-2 text-lg font-semibold">
                            {money(request.requested_amount_vnd)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-4">
                          <p className="text-xs font-semibold uppercase text-emerald-700">
                            Đã duyệt
                          </p>
                          <p className="mt-2 text-lg font-semibold text-emerald-700">
                            {money(request.approved_amount_vnd)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-orange-50 p-4">
                          <p className="text-xs font-semibold uppercase text-orange-700">
                            Còn phải chi
                          </p>
                          <p className="mt-2 text-lg font-semibold text-orange-700">
                            {money(request.remaining_amount_vnd)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">
                          <p>
                            Chứng từ Thu học phí (P2-10):{" "}
                            <span className="font-semibold text-zinc-900">
                              {request.payment_count}
                            </span>
                          </p>
                          <p>
                            Học sinh:{" "}
                            <span className="font-semibold text-zinc-900">
                              {request.student_count}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">
                          <p>
                            Kiểm soát:{" "}
                            <span className="font-semibold text-zinc-900">
                              {request.control_status ?? "Chưa có"}
                            </span>
                          </p>
                          <p>
                            Rủi ro:{" "}
                            <span className="font-semibold text-zinc-900">
                              {request.risk_level ?? "Chưa có"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {blocks.length > 0 ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                          <div className="flex gap-2">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <div>
                              <p className="font-semibold">Chưa thể chi P2-17</p>
                              <ul className="mt-2 space-y-1">
                                {blocks.map((item) => (
                                  <li key={item}>- {blockText(item)}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                          <div className="flex gap-2">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                            <span>Đủ điều kiện ghi nhận chi P2-17.</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <form
                      action={recordTtgdtxPartnerPaymentDisbursementAction}
                      className="space-y-4 rounded-lg border bg-zinc-50 p-4"
                    >
                      <input
                        name="request_id"
                        type="hidden"
                        value={request.request_id}
                      />
                      <input
                        name="return_to"
                        type="hidden"
                        value="/ttgdtx/payment-requests/pay"
                      />

                      <label
                        className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
                          canPayThisRequest
                            ? "border-amber-200 bg-amber-50 text-amber-900"
                            : "border-zinc-200 bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        <input
                          className="mt-1 size-4 shrink-0"
                          disabled={!canPayThisRequest}
                          name="payout_boundary_ack"
                          required
                          type="checkbox"
                          value="on"
                        />
                        <span>
                          Toi xac nhan P2-17 chi ghi nhan chung tu da chi,
                          khong tao lenh chuyen khoan, khong nhap OTP/ngan hang
                          va khong phe duyet tai chinh thay cho chu so huu.
                        </span>
                      </label>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1 text-sm">
                          <span>Số tiền chi</span>
                          <input
                            className={fieldClass}
                            defaultValue={amountInput(
                              request.remaining_amount_vnd,
                            )}
                            disabled={!canPayThisRequest}
                            inputMode="numeric"
                            name="amount_vnd"
                            placeholder="VD: 1 000 000"
                          />
                          <span className="block text-xs text-zinc-500">
                            Có thể nhập 1000000 hoặc 1 000 000.
                          </span>
                        </label>

                        <label className="space-y-1 text-sm">
                          <span>Ngày chi</span>
                          <input
                            className={fieldClass}
                            defaultValue={today}
                            disabled={!canPayThisRequest}
                            name="payment_date"
                            type="date"
                          />
                        </label>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1 text-sm">
                          <span>Hình thức chi</span>
                          <select
                            className={fieldClass}
                            defaultValue="BANK_TRANSFER"
                            disabled={!canPayThisRequest}
                            name="payment_method"
                          >
                            {Object.entries(paymentMethodLabels).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        </label>

                        <label className="space-y-1 text-sm">
                          <span>Số chứng từ / phiếu chi</span>
                          <input
                            className={fieldClass}
                            disabled={!canPayThisRequest}
                            name="voucher_no"
                            placeholder="VD: PC-TTGDTX-202606-001"
                          />
                        </label>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <label className="space-y-1 text-sm">
                          <span>Người nhận</span>
                          <input
                            className={fieldClass}
                            disabled={!canPayThisRequest}
                            name="recipient_name"
                            placeholder="Tên trung tâm/người nhận"
                          />
                        </label>
                        <label className="space-y-1 text-sm">
                          <span>Số tài khoản</span>
                          <input
                            className={fieldClass}
                            disabled={!canPayThisRequest}
                            name="recipient_account"
                            placeholder="Nếu chuyển khoản"
                          />
                        </label>
                        <label className="space-y-1 text-sm">
                          <span>Ngân hàng</span>
                          <input
                            className={fieldClass}
                            disabled={!canPayThisRequest}
                            name="recipient_bank"
                            placeholder="Tên ngân hàng"
                          />
                        </label>
                      </div>

                      <label className="space-y-1 text-sm">
                        <span>Link chứng từ chi bắt buộc</span>
                        <input
                          className={fieldClass}
                          disabled={!canPayThisRequest}
                          name="evidence_url"
                          placeholder="Link Drive tới ủy nhiệm chi, phiếu chi hoặc chứng từ ngân hàng"
                          required
                        />
                        <span className="block text-xs text-zinc-500">
                          Chỉ gắn link hồ sơ đã phân quyền; không dán mật khẩu,
                          OTP, số tài khoản cá nhân hoặc dữ liệu học viên chi
                          tiết vào ô này.
                        </span>
                      </label>

                      <label className="space-y-1 text-sm">
                        <span>Ghi chú kế toán</span>
                        <textarea
                          className={textAreaClass}
                          disabled={!canPayThisRequest}
                          name="note"
                          placeholder="VD: Đã chi theo đề nghị đã duyệt P2-16."
                        />
                      </label>

                      <PaymentSubmitButton disabled={!canPayThisRequest} />
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-lg border bg-white shadow-sm">
          <div className="border-b p-5">
            <div className="flex items-start gap-3">
              <ReceiptText className="mt-1 size-5 text-zinc-500" />
              <div>
                <h2 className="text-xl font-semibold">Chứng từ chi gần đây</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Danh sách này là nhật ký các lần ghi nhận chi ở P2-17.
                </p>
              </div>
            </div>
          </div>

          {recentPayments.length === 0 ? (
            <div className="p-5 text-sm text-zinc-500">
              Chưa có chứng từ chi P2-17 trong phạm vi đang chọn.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Chứng từ</th>
                    <th className="px-5 py-3">TTGDTX / kỳ</th>
                    <th className="px-5 py-3">Số tiền</th>
                    <th className="px-5 py-3">Người nhận</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Minh chứng</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentPayments.map((payment) => (
                    <tr key={payment.disbursement_id}>
                      <td className="px-5 py-4 align-top">
                        <p className="font-semibold">{payment.voucher_no}</p>
                        <p className="text-xs text-zinc-500">
                          {payment.disbursement_code}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Tạo: {formatDateTime(payment.created_at)}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="font-semibold">{payment.partner_name}</p>
                        <p className="text-xs text-zinc-500">
                          {payment.period_label}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {payment.request_code}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="font-semibold text-emerald-700">
                          {money(payment.amount_vnd)}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatDate(payment.payment_date)} ·{" "}
                          {paymentMethodLabels[payment.payment_method] ??
                            payment.payment_method}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p>{payment.recipient_name ?? "Chưa nhập"}</p>
                        <p className="text-xs text-zinc-500">
                          {payment.recipient_bank ?? "Chưa nhập ngân hàng"}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {payment.payment_status}
                        </span>
                        <p className="mt-2 text-xs text-zinc-500">
                          Người ghi: {payment.created_by_name ?? "Chưa có"}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        {payment.evidence_url ? (
                          <Button asChild size="sm" variant="outline">
                            <Link href={payment.evidence_url} target="_blank">
                              Mở minh chứng
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-zinc-500">Chưa gắn link</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
