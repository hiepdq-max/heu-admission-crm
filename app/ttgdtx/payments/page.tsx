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
  Save,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  formatVndAmount as money,
  formatVndInput as amountInput,
} from "@/lib/vnd-money";
import { firstParam } from "@/lib/workspace";

import { recordTtgdtxTuitionPaymentAction } from "./actions";

type PaymentsPageProps = {
  searchParams?: Promise<{
    collected?: string | string[];
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

type CollectionSummaryRow = {
  receivable_count: number;
  collectible_count: number;
  payable_total_vnd: number | string;
  paid_total_vnd: number | string;
  balance_total_vnd: number | string;
  payment_count: number;
  collected_today_vnd: number | string;
};

type CandidateRow = {
  receivable_id: string;
  receivable_code: string;
  lead_id: string;
  lead_code: string | null;
  student_name: string;
  student_phone: string | null;
  partner_id: string;
  partner_code: string | null;
  partner_name: string;
  contract_code: string | null;
  policy_code: string | null;
  segment_name: string | null;
  program_name: string | null;
  major_name: string;
  academic_year: string;
  term_label: string;
  payable_amount_vnd: number | string;
  paid_amount_vnd: number | string;
  balance_amount_vnd: number | string;
  due_date: string;
  days_overdue: number;
  receivable_status: string;
  collection_status: string;
  readiness_status: string;
  blocking_items: string[] | null;
  can_record_payment: boolean;
  collection_model: string;
  invoice_issue_rule: string;
  updated_at: string | null;
};

type PaymentRow = {
  payment_id: string;
  payment_code: string;
  receivable_code: string;
  lead_code: string | null;
  student_name: string;
  student_phone: string | null;
  partner_name: string;
  major_name: string;
  policy_code: string | null;
  term_label: string;
  payment_amount_vnd: number | string;
  payment_date: string;
  payment_method: string;
  voucher_no: string;
  evidence_url: string | null;
  payer_name: string | null;
  collector_note: string | null;
  collection_model: string;
  invoice_required: string;
  invoice_issuer: string | null;
  invoice_status: string;
  invoice_no: string | null;
  invoice_issue_date: string | null;
  invoice_evidence_url: string | null;
  invoice_waiver_reason: string | null;
  invoice_control_status: string;
  payment_status: string;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500";
const textAreaClass =
  "min-h-20 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500";

const blockingLabels: Record<string, string> = {
  RECEIVABLE_CLOSED: "Công nợ đã hủy hoặc đã miễn",
  NO_BALANCE: "Không còn số tiền phải thu",
  CONTRACT_NOT_READY: "Hợp đồng P2-01 chưa sẵn sàng",
  POLICY_NOT_READY: "Chính sách học phí P2-02 chưa sẵn sàng",
};

const statusLabels: Record<string, string> = {
  OPEN: "Đang phải thu",
  OVERDUE: "Quá hạn",
  PAID: "Đã đủ",
  PARTIAL: "Thu một phần",
  CANCELLED: "Đã hủy",
  WAIVED: "Miễn/không thu",
  CONTRACT_NOT_READY: "Hợp đồng chưa sẵn sàng",
  POLICY_NOT_READY: "Học phí chưa sẵn sàng",
};

const methodLabels: Record<string, string> = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
  POS: "POS",
  QR: "QR",
  OFFSET: "Bù trừ",
  OTHER: "Khác",
};

const collectionModelLabels: Record<string, string> = {
  HEU_COLLECTS: "HEU thu",
  TTGDTX_COLLECTS: "TTGDTX thu",
  SPLIT_COLLECTION: "Chia phần thu",
  OTHER: "Cách thu khác",
};

const invoiceRuleLabels: Record<string, string> = {
  AFTER_ENROLLMENT_CONFIRMED: "Sau nhập học",
  AFTER_DOCUMENT_READY: "Sau đủ hồ sơ",
  AFTER_CLASS_OPENED: "Sau mở lớp",
  MANUAL_APPROVAL_ONLY: "Duyệt thủ công",
};

const invoiceRequiredLabels: Record<string, string> = {
  PENDING_POLICY: "Chưa chốt chính sách",
  REQUIRED: "Bắt buộc hóa đơn/chứng từ",
  NOT_REQUIRED: "Không bắt buộc",
  WAIVED_BY_AUTHORITY: "Miễn theo phê duyệt",
};

const invoiceIssuerLabels: Record<string, string> = {
  HEU: "HEU",
  TTGDTX: "TTGDTX",
  PARTNER: "Đối tác",
  OTHER_APPROVED: "Đơn vị được duyệt",
};

const invoiceStatusLabels: Record<string, string> = {
  NOT_STARTED: "Chưa bắt đầu",
  PENDING: "Đang chờ",
  ISSUED: "Đã phát hành",
  CANCELLED: "Đã hủy",
  REPLACED: "Đã thay thế",
  WAIVED: "Đã miễn",
  NOT_REQUIRED: "Không cần",
};

const invoiceControlLabels: Record<string, string> = {
  RESOLVED: "Đã rõ hóa đơn",
  NEEDS_INVOICE_DECISION: "Cần chốt hóa đơn",
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

function today() {
  return new Date().toISOString().slice(0, 10);
}

function canOpenTtgdtxPayments(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasCollectionRead: boolean,
  hasReceivableRead: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || (!hasCollectionRead && !hasReceivableRead)) {
    return false;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

function messageFromParams(params: Awaited<PaymentsPageProps["searchParams"]>) {
  const error = firstParam(params?.error);

  if (error) {
    return {
      tone: "error",
      text: error,
    };
  }

  if (firstParam(params?.collected)) {
    return {
      tone: "success",
      text: "Đã ghi nhận thu học phí và cập nhật công nợ P2-03.",
    };
  }

  return null;
}

function collectionTone(row: CandidateRow) {
  if (row.readiness_status === "PAID") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (row.readiness_status === "OVERDUE") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (row.readiness_status === "PARTIAL") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

export default async function TtgdtxPaymentsPage({
  searchParams,
}: PaymentsPageProps) {
  const params = await searchParams;
  const message = messageFromParams(params);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    roleResult,
    collectionReadResult,
    collectionManageResult,
    receivableReadResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.collection.read",
    }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.collection.manage",
    }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.receivable.read",
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
  const roleCode = roleResult.data;
  const canOpen = canOpenTtgdtxPayments(
    segment?.id ?? null,
    roleCode,
    scopeResult.data ?? [],
    Boolean(collectionReadResult.data),
    Boolean(receivableReadResult.data),
  );
  const canManage =
    roleCode === "ADMIN" ||
    Boolean(collectionManageResult.data);
  let dataError: { message: string } | null = null;
  let summary: CollectionSummaryRow | null = null;
  let candidates: CandidateRow[] = [];
  let payments: PaymentRow[] = [];

  if (canOpen) {
    const [summaryResult, candidateResult, paymentResult] = await Promise.all([
      supabase
        .from("ttgdtx_collection_summary")
        .select("*")
        .maybeSingle<CollectionSummaryRow>(),
      supabase
        .from("ttgdtx_collection_candidate_receivables")
        .select("*")
        .order("due_date", { ascending: true })
        .order("updated_at", { ascending: false })
        .limit(40)
        .returns<CandidateRow[]>(),
      supabase
        .from("ttgdtx_tuition_payment_board")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<PaymentRow[]>(),
    ]);

    dataError =
      summaryResult.error ?? candidateResult.error ?? paymentResult.error;
    summary = summaryResult.data;
    candidates = candidateResult.data ?? [];
    payments = paymentResult.data ?? [];
  }

  return (
    <AppShell
      active="ttgdtx"
      title="Thu học phí TTGDTX (P2-10)"
      description="Ghi nhận số tiền đã thu, chứng từ thu và trạng thái hóa đơn/chứng từ theo từng công nợ. Mã nội bộ của bước này là P2-10."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/payments"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/receivables">
              <ArrowLeft className="size-4" />
              Công nợ (P2-03)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/reconciliation">
              <Scale className="size-4" />
              Đối soát (P2-13)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import/workload">
              <ShieldCheck className="size-4" />
              Việc lỗi (P2-09)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payments">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=Thu%20h%E1%BB%8Dc%20ph%C3%AD%20P2-10">
              <FileSearch className="size-4" />
              Tìm thu học phí
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa có quyền xem màn Thu học phí (P2-10) hoặc chưa được phân
          phạm vi Trung cấp 9+ liên kết TTGDTX.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được Thu học phí (P2-10)</p>
              <p className="mt-1">
                Hãy chạy SQL step96 sau step95. Chi tiết kỹ thuật:{" "}
                {dataError.message}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {message ? (
            <section
              className={`rounded-lg border p-5 text-sm leading-6 ${
                message.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              <div className="flex items-start gap-3">
                {message.tone === "success" ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                )}
                <p>{message.text}</p>
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Nguyên tắc Thu học phí (P2-10)</h2>
                <p className="mt-1">
                  Đây là bước kế toán xác nhận tiền đã thu. Hệ thống tự cập nhật
                  Công nợ (P2-03), chặn thu vượt, chặn trùng số chứng từ và giữ
                  log để sau này đối soát, kiểm tra hóa đơn/chứng từ và chi trả
                  TTGDTX.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-zinc-900">Vị trí trong quy trình</p>
                <p className="mt-1 text-zinc-500">
                  Sau Công nợ (P2-03), trước Đối soát (P2-13). Đây chưa phải
                  bước đề nghị thanh toán cho trung tâm.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-600">
                  Trước: Công nợ
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                  Đang làm: Thu học phí
                </span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                  Sau: Đối soát
                </span>
              </div>
            </div>
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
              Điểm cần kiểm soát thêm: khoản thu này có cần hóa đơn/chứng từ
              không, ai xuất, trạng thái gì, và link bằng chứng ở đâu.
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Công nợ đang theo dõi</p>
              <p className="mt-3 text-3xl font-semibold">
                {summary?.receivable_count ?? 0}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Có thể thu: {summary?.collectible_count ?? 0}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Phải thu</p>
              <p className="mt-3 text-3xl font-semibold">
                {money(summary?.payable_total_vnd)}
              </p>
              <p className="mt-2 text-xs text-zinc-500">Theo Công nợ (P2-03)</p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đã thu</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-700">
                {money(summary?.paid_total_vnd)}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Hôm nay: {money(summary?.collected_today_vnd)}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Còn phải thu</p>
              <p className="mt-3 text-3xl font-semibold text-orange-700">
                {money(summary?.balance_total_vnd)}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Chứng từ: {summary?.payment_count ?? 0}
              </p>
            </article>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <div className="flex items-start gap-3">
                <ReceiptText className="mt-1 size-5 text-zinc-500" />
                <div>
                  <h2 className="text-lg font-semibold">Công nợ sẵn sàng thu</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Nhập đúng số tiền thực thu, số chứng từ và link minh chứng
                    nếu có. Ô nào đúng giữ nguyên, ô nào thiếu hệ thống chỉ
                    báo ngay chỗ đó.
                  </p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-zinc-200">
              {candidates.length === 0 ? (
                <div className="p-5 text-sm text-zinc-500">
                  Chưa có công nợ P2-03 phù hợp trong phạm vi đang chọn.
                </div>
              ) : (
                candidates.map((row) => {
                  const blockingItems = row.blocking_items ?? [];
                  const disabled = !canManage || !row.can_record_payment;

                  return (
                    <article
                      key={row.receivable_id}
                      className="grid gap-5 p-5 xl:grid-cols-[1fr_1.25fr]"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                            {row.receivable_code}
                          </span>
                          <span
                            className={`rounded-md border px-2 py-1 text-xs ${collectionTone(
                              row,
                            )}`}
                          >
                            {statusLabels[row.readiness_status] ??
                              row.readiness_status}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {row.student_name}
                          </h3>
                          <p className="mt-1 text-sm text-zinc-500">
                            {row.lead_code ?? "Chưa có mã lead"} ·{" "}
                            {row.student_phone ?? "Chưa có SĐT"}
                          </p>
                        </div>
                        <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
                          <p>
                            <span className="text-zinc-400">TTGDTX:</span>{" "}
                            {row.partner_name}
                          </p>
                          <p>
                            <span className="text-zinc-400">Ngành:</span>{" "}
                            {row.major_name}
                          </p>
                          <p>
                            <span className="text-zinc-400">Kỳ:</span>{" "}
                            {row.academic_year} · {row.term_label}
                          </p>
                          <p>
                            <span className="text-zinc-400">Hạn thu:</span>{" "}
                            {formatDate(row.due_date)}
                          </p>
                          <p>
                            <span className="text-zinc-400">Mô hình thu:</span>{" "}
                            {collectionModelLabels[row.collection_model] ??
                              row.collection_model}
                          </p>
                          <p>
                            <span className="text-zinc-400">Rule hóa đơn:</span>{" "}
                            {invoiceRuleLabels[row.invoice_issue_rule] ??
                              row.invoice_issue_rule}
                          </p>
                        </div>
                        <div className="grid gap-3 text-sm md:grid-cols-3">
                          <div className="rounded-lg bg-zinc-50 p-3">
                            <p className="text-zinc-500">Phải thu</p>
                            <p className="mt-1 font-semibold">
                              {money(row.payable_amount_vnd)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
                            <p>Đã thu</p>
                            <p className="mt-1 font-semibold">
                              {money(row.paid_amount_vnd)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-orange-50 p-3 text-orange-700">
                            <p>Còn phải thu</p>
                            <p className="mt-1 font-semibold">
                              {money(row.balance_amount_vnd)}
                            </p>
                          </div>
                        </div>
                        {blockingItems.length > 0 ? (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                            {blockingItems.map((item) => (
                              <p key={item}>
                                <AlertTriangle className="mr-2 inline size-4" />
                                {blockingLabels[item] ?? item}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <form
                        action={recordTtgdtxTuitionPaymentAction}
                        className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-2"
                      >
                        <input
                          type="hidden"
                          name="receivable_id"
                          value={row.receivable_id}
                        />
                        <input
                          type="hidden"
                          name="return_to"
                          value="/ttgdtx/payments"
                        />
                        <label className="space-y-1">
                          <span className="text-sm text-zinc-600">
                            Số tiền thu
                          </span>
                          <input
                            className={fieldClass}
                            type="text"
                            inputMode="numeric"
                            name="payment_amount_vnd"
                            defaultValue={amountInput(row.balance_amount_vnd)}
                            placeholder="VD: 1 000 000"
                            disabled={disabled}
                            required
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm text-zinc-600">Ngày thu</span>
                          <input
                            className={fieldClass}
                            type="date"
                            name="payment_date"
                            defaultValue={today()}
                            disabled={disabled}
                            required
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm text-zinc-600">
                            Hình thức thu
                          </span>
                          <select
                            className={fieldClass}
                            name="payment_method"
                            defaultValue="BANK_TRANSFER"
                            disabled={disabled}
                          >
                            {Object.entries(methodLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm text-zinc-600">
                            Số chứng từ
                          </span>
                          <input
                            className={fieldClass}
                            name="voucher_no"
                            placeholder="VD: PT-202606-001"
                            disabled={disabled}
                            required
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm text-zinc-600">
                            Người nộp
                          </span>
                          <input
                            className={fieldClass}
                            name="payer_name"
                            placeholder="VD: phụ huynh/học sinh"
                            disabled={disabled}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm text-zinc-600">
                            Link minh chứng
                          </span>
                          <input
                            className={fieldClass}
                            name="evidence_url"
                            placeholder="Link ảnh/chứng từ/Drive nếu có"
                            disabled={disabled}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm text-zinc-600">
                            Hóa đơn/chứng từ
                          </span>
                          <select
                            className={fieldClass}
                            name="invoice_required"
                            defaultValue="PENDING_POLICY"
                            disabled={disabled}
                            required
                          >
                            {Object.entries(invoiceRequiredLabels).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm text-zinc-600">
                            Bên phát hành
                          </span>
                          <select
                            className={fieldClass}
                            name="invoice_issuer"
                            defaultValue=""
                            disabled={disabled}
                          >
                            <option value="">Chưa xác định</option>
                            {Object.entries(invoiceIssuerLabels).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm text-zinc-600">
                            Trạng thái hóa đơn
                          </span>
                          <select
                            className={fieldClass}
                            name="invoice_status"
                            defaultValue="PENDING"
                            disabled={disabled}
                            required
                          >
                            {Object.entries(invoiceStatusLabels).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm text-zinc-600">
                            Số hóa đơn/chứng từ
                          </span>
                          <input
                            className={fieldClass}
                            name="invoice_no"
                            placeholder="Nếu đã phát hành"
                            disabled={disabled}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm text-zinc-600">
                            Ngày hóa đơn
                          </span>
                          <input
                            className={fieldClass}
                            type="date"
                            name="invoice_issue_date"
                            disabled={disabled}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm text-zinc-600">
                            Link hóa đơn/chứng từ
                          </span>
                          <input
                            className={fieldClass}
                            name="invoice_evidence_url"
                            placeholder="Link hóa đơn hoặc biên bản miễn"
                            disabled={disabled}
                          />
                        </label>
                        <label className="space-y-1 md:col-span-2">
                          <span className="text-sm text-zinc-600">
                            Lý do miễn/chưa xuất
                          </span>
                          <input
                            className={fieldClass}
                            name="invoice_waiver_reason"
                            placeholder="Bắt buộc nếu chọn miễn theo phê duyệt"
                            disabled={disabled}
                          />
                        </label>
                        <label className="space-y-1 md:col-span-2">
                          <span className="text-sm text-zinc-600">
                            Ghi chú kế toán
                          </span>
                          <textarea
                            className={textAreaClass}
                            name="collector_note"
                            placeholder="VD: đã đối chiếu sao kê ngày..."
                            disabled={disabled}
                          />
                        </label>
                        <label className="space-y-1 md:col-span-2">
                          <span className="text-sm text-zinc-600">
                            Ghi chú kiểm soát hóa đơn
                          </span>
                          <textarea
                            className={textAreaClass}
                            name="invoice_control_note"
                            placeholder="VD: chờ quyết định KHTC/Pháp chế, hoặc đã đối chiếu hóa đơn điện tử..."
                            disabled={disabled}
                          />
                        </label>
                        <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                          <Button type="submit" disabled={disabled}>
                            <Save className="size-4" />
                            Ghi nhận thu
                          </Button>
                          <Button asChild variant="outline">
                            <Link href={`/leads/${row.lead_id}`}>Mở lead</Link>
                          </Button>
                          {!canManage ? (
                            <span className="text-xs text-amber-700">
                              Tài khoản chỉ được xem, chưa có quyền ghi thu.
                            </span>
                          ) : null}
                        </div>
                      </form>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <div className="flex items-start gap-3">
                <Banknote className="mt-1 size-5 text-zinc-500" />
                <div>
                  <h2 className="text-lg font-semibold">Chứng từ thu gần đây</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Danh sách này là nhật ký kế toán đã ghi nhận qua Thu học phí
                    (P2-10).
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Chứng từ</th>
                    <th className="px-5 py-3">Học sinh</th>
                    <th className="px-5 py-3">TTGDTX / ngành</th>
                    <th className="px-5 py-3">Số tiền</th>
                    <th className="px-5 py-3">Hóa đơn</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Minh chứng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td className="px-5 py-6 text-center text-zinc-500" colSpan={7}>
                        Chưa có chứng từ thu học phí (P2-10) trong phạm vi đang chọn.
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.payment_id}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium">{payment.voucher_no}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {payment.payment_code}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {formatDateTime(payment.created_at)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium">{payment.student_name}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {payment.lead_code ?? "Chưa có mã"} ·{" "}
                            {payment.student_phone ?? "Chưa có SĐT"}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p>{payment.partner_name}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {payment.major_name} · {payment.term_label}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-semibold">
                            {money(payment.payment_amount_vnd)}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {formatDate(payment.payment_date)} ·{" "}
                            {methodLabels[payment.payment_method] ??
                              payment.payment_method}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`rounded-md border px-2 py-1 text-xs ${
                              payment.invoice_control_status === "RESOLVED"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-800"
                            }`}
                          >
                            {invoiceControlLabels[payment.invoice_control_status] ??
                              payment.invoice_control_status}
                          </span>
                          <p className="mt-2 text-xs text-zinc-500">
                            {invoiceRequiredLabels[payment.invoice_required] ??
                              payment.invoice_required}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {payment.invoice_issuer
                              ? invoiceIssuerLabels[payment.invoice_issuer] ??
                                payment.invoice_issuer
                              : "Chưa rõ bên phát hành"}{" "}
                            ·{" "}
                            {invoiceStatusLabels[payment.invoice_status] ??
                              payment.invoice_status}
                          </p>
                          {payment.invoice_no ? (
                            <p className="mt-1 text-xs text-zinc-500">
                              Số: {payment.invoice_no}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                            {payment.payment_status}
                          </span>
                          <p className="mt-2 text-xs text-zinc-500">
                            Người ghi: {payment.created_by_name ?? "Chưa rõ"}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-col items-start gap-2">
                            {payment.evidence_url ? (
                              <Button asChild variant="outline" size="sm">
                                <a href={payment.evidence_url} target="_blank">
                                  Chứng từ thu
                                </a>
                              </Button>
                            ) : (
                              <span className="text-xs text-zinc-500">
                                Chưa gắn chứng từ thu
                              </span>
                            )}
                            {payment.invoice_evidence_url ? (
                              <Button asChild variant="outline" size="sm">
                                <a
                                  href={payment.invoice_evidence_url}
                                  target="_blank"
                                >
                                  Hóa đơn/chứng từ
                                </a>
                              </Button>
                            ) : null}
                          </div>
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
