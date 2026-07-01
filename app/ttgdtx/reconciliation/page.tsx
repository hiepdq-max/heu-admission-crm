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
import { TtgdtxReconciliationExceptionGate } from "@/components/ttgdtx/ttgdtx-reconciliation-exception-gate";
import { TtgdtxOperatingControlStrip } from "@/components/ttgdtx/ttgdtx-operating-control-strip";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { firstParam } from "@/lib/workspace";

import { createTtgdtxReconciliationBatchAction } from "./actions";

type ReconciliationPageProps = {
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
  already_in_batch_count: number;
  candidate_total_vnd: number | string;
  ready_total_vnd: number | string;
  batch_count: number;
  batched_total_vnd: number | string;
};

type CandidateRow = {
  payment_id: string;
  payment_code: string;
  receivable_id: string;
  receivable_code: string;
  lead_id: string;
  lead_code: string | null;
  partner_id: string;
  partner_code: string | null;
  partner_name: string;
  major_name: string;
  program_name: string | null;
  student_name: string;
  student_phone: string | null;
  policy_code: string | null;
  contract_code: string | null;
  academic_year: string;
  term_label: string;
  payable_amount_vnd: number | string;
  paid_amount_vnd: number | string;
  balance_amount_vnd: number | string;
  payment_amount_vnd: number | string;
  payment_date: string;
  payment_method: string;
  voucher_no: string;
  evidence_url: string | null;
  payer_name: string | null;
  invoice_required: string;
  invoice_issuer: string | null;
  invoice_status: string;
  invoice_no: string | null;
  invoice_control_status: string;
  payment_status: string;
  receivable_status: string;
  collection_status: string;
  existing_batch_id: string | null;
  existing_batch_code: string | null;
  blocking_items: string[] | null;
  warning_items: string[] | null;
  can_reconcile: boolean;
};

type BatchRow = {
  batch_id: string;
  batch_code: string;
  batch_name: string;
  partner_name: string;
  partner_code: string | null;
  period_label: string;
  period_start: string;
  period_end: string;
  total_receivable_vnd: number | string;
  total_collected_vnd: number | string;
  total_balance_vnd: number | string;
  payment_count: number;
  student_count: number;
  reconciliation_status: string;
  evidence_url: string | null;
  note: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500";
const textAreaClass =
  "min-h-20 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500";

const methodLabels: Record<string, string> = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
  POS: "POS",
  QR: "QR",
  OFFSET: "Bù trừ",
  OTHER: "Khác",
};

const blockLabels: Record<string, string> = {
  PAYMENT_NOT_POSTED: "Chứng từ Thu học phí (P2-10) chưa ở trạng thái đã ghi nhận",
  RECEIVABLE_CLOSED: "Công nợ P2-03 đã hủy hoặc đã miễn",
  RECEIVABLE_NOT_FULLY_PAID: "Công nợ P2-03 chưa thu đủ",
  MISSING_VOUCHER: "Thiếu số chứng từ thu",
  NEEDS_INVOICE_DECISION: "Cần chốt hóa đơn/chứng từ ở P2-10",
  ALREADY_RECONCILED: "Chứng từ đã nằm trong kỳ đối soát khác",
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

const batchStatusLabels: Record<string, string> = {
  DRAFT: "Nháp",
  READY_FOR_REVIEW: "Chờ kế toán rà soát",
  REVIEWED: "Đã rà soát",
  APPROVED: "Đã duyệt",
  LOCKED: "Đã khóa",
  CANCELLED: "Đã hủy",
};

function money(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
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

function inputDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function currentMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function defaultPeriodLabel() {
  const now = new Date();
  return `Đối soát ${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
}

function uniqueReadyPartners(rows: CandidateRow[]) {
  const map = new Map<string, CandidateRow>();

  rows.forEach((row) => {
    if (row.can_reconcile && !row.existing_batch_id && !map.has(row.partner_id)) {
      map.set(row.partner_id, row);
    }
  });

  return [...map.values()].sort((left, right) =>
    left.partner_name.localeCompare(right.partner_name, "vi"),
  );
}

function canOpenTtgdtxReconciliation(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasReconciliationRead: boolean,
  hasCollectionRead: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || (!hasReconciliationRead && !hasCollectionRead)) {
    return false;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

function messageFromParams(
  params: Awaited<ReconciliationPageProps["searchParams"]>,
) {
  const error = firstParam(params?.error);

  if (error) {
    return {
      tone: "error",
      text: error,
    };
  }

  if (firstParam(params?.created)) {
    return {
      tone: "success",
      text: "Đã tạo kỳ đối soát P2-13. Chứng từ đã được đưa vào một kỳ, không thể đưa trùng kỳ khác.",
    };
  }

  return null;
}

export default async function TtgdtxReconciliationPage({
  searchParams,
}: ReconciliationPageProps) {
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
    reconciliationReadResult,
    reconciliationManageResult,
    collectionReadResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.reconciliation.read",
    }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.reconciliation.manage",
    }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.collection.read",
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

  const roleCode = roleResult.data as string | null;
  const scopes = scopeResult.data ?? [];
  const segment = segmentResult.data;
  const canOpen = canOpenTtgdtxReconciliation(
    segment?.id ?? null,
    roleCode,
    scopes,
    Boolean(reconciliationReadResult.data),
    Boolean(collectionReadResult.data),
  );
  const canManage =
    roleCode === "ADMIN" ||
    roleCode === "BGH" ||
    Boolean(reconciliationManageResult.data);
  let dataError: { message: string } | null = null;
  let summary: SummaryRow | null = null;
  let candidates: CandidateRow[] = [];
  let batches: BatchRow[] = [];

  if (canOpen) {
    const [summaryResult, candidateResult, batchResult] = await Promise.all([
      supabase
        .from("ttgdtx_reconciliation_summary")
        .select("*")
        .maybeSingle<SummaryRow>(),
      supabase
        .from("ttgdtx_reconciliation_candidates")
        .select("*")
        .order("payment_date", { ascending: false })
        .limit(80)
        .returns<CandidateRow[]>(),
      supabase
        .from("ttgdtx_reconciliation_batch_board")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<BatchRow[]>(),
    ]);

    dataError =
      summaryResult.error ?? candidateResult.error ?? batchResult.error;
    summary = summaryResult.data;
    candidates = candidateResult.data ?? [];
    batches = batchResult.data ?? [];
  }

  const readyPartners = uniqueReadyPartners(candidates);
  const now = new Date();

  return (
    <AppShell
      active="ttgdtx"
      title="P2-13 · Đối soát thu học phí TTGDTX"
      description="Gom các chứng từ Thu học phí (P2-10) thành kỳ đối soát kế toán. Bước này chưa chi tiền cho TTGDTX."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/reconciliation"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payments">
              <ArrowLeft className="size-4" />
              Thu học phí (P2-10)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/receivables">
              <ReceiptText className="size-4" />
              P2-03 công nợ
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/tuition">
              <ShieldCheck className="size-4" />
              P2-02 học phí
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/reconciliation/review">
              <CheckCircle2 className="size-4" />
              P2-14 duyệt kỳ
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/reconciliation">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-13">
              <FileSearch className="size-4" />
              Tìm P2-13
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa có quyền xem P2-13 hoặc chưa được phân phạm vi
          Trung cấp 9+ liên kết TTGDTX.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được P2-13</p>
              <p className="mt-1">
                Hãy chạy SQL step101 sau các bước hồ sơ TTGDTX đến Thu học phí
                (P2-10). Chi tiết kỹ
                thuật: {dataError.message}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          <TtgdtxOperatingControlStrip currentCode="P2-13" />
          <TtgdtxReconciliationExceptionGate />

          {message ? (
            <section
              className={`rounded-lg border p-5 text-sm leading-6 ${
                message.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {message.text}
            </section>
          ) : null}

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <div className="flex items-start gap-3">
              <Scale className="mt-0.5 size-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Nguyên tắc P2-13</h2>
                <p className="mt-2">
                  Đối soát (P2-13) chỉ lấy các chứng từ đã thu ở Thu học phí
                  (P2-10). Một chứng từ
                  thu chỉ được nằm trong một kỳ đối soát đang hiệu lực. Bước này
                  chưa chi trả TTGDTX và chưa thay thế chứng từ kế toán chính
                  thức.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Chứng từ có thể kiểm</p>
              <p className="mt-5 text-3xl font-semibold">
                {summary?.candidate_count ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đủ đưa vào kỳ</p>
              <p className="mt-5 text-3xl font-semibold text-emerald-700">
                {summary?.ready_count ?? 0}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                {money(summary?.ready_total_vnd)}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đang bị chặn</p>
              <p className="mt-5 text-3xl font-semibold text-amber-700">
                {summary?.blocked_count ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đã vào kỳ đối soát</p>
              <p className="mt-5 text-3xl font-semibold text-blue-700">
                {summary?.already_in_batch_count ?? 0}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Tổng đã gom: {money(summary?.batched_total_vnd)}
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-zinc-200 p-5">
              <Save className="mt-1 size-5 text-zinc-500" />
              <div>
                <h2 className="text-lg font-semibold">Tạo kỳ đối soát</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Chọn TTGDTX và khoảng thời gian cần đối soát. Hệ thống sẽ tự
                  lấy các chứng từ Thu học phí (P2-10) đủ điều kiện trong khoảng này.
                </p>
              </div>
            </div>
            <form
              action={createTtgdtxReconciliationBatchAction}
              className="grid gap-4 p-5 lg:grid-cols-2"
            >
              <input
                type="hidden"
                name="return_to"
                value="/ttgdtx/reconciliation"
              />
              <label className="grid gap-2 text-sm">
                <span>TTGDTX cần đối soát</span>
                <select
                  className={fieldClass}
                  name="partner_id"
                  required
                  disabled={!canManage || readyPartners.length === 0}
                >
                  <option value="">Chọn TTGDTX</option>
                  {readyPartners.map((partner) => (
                    <option key={partner.partner_id} value={partner.partner_id}>
                      {partner.partner_name} · {partner.partner_code ?? "Chưa mã"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                <span>Tên kỳ đối soát</span>
                <input
                  className={fieldClass}
                  name="period_label"
                  defaultValue={defaultPeriodLabel()}
                  required
                  disabled={!canManage || readyPartners.length === 0}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Từ ngày</span>
                <input
                  className={fieldClass}
                  name="period_start"
                  type="date"
                  defaultValue={inputDate(currentMonthStart())}
                  required
                  disabled={!canManage || readyPartners.length === 0}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Đến ngày</span>
                <input
                  className={fieldClass}
                  name="period_end"
                  type="date"
                  defaultValue={inputDate(now)}
                  required
                  disabled={!canManage || readyPartners.length === 0}
                />
              </label>
              <label className="grid gap-2 text-sm lg:col-span-2">
                <span>Link minh chứng đối soát nếu có</span>
                <input
                  className={fieldClass}
                  name="evidence_url"
                  placeholder="Link Drive, biên bản đối soát hoặc file kế toán"
                  disabled={!canManage || readyPartners.length === 0}
                />
              </label>
              <label className="grid gap-2 text-sm lg:col-span-2">
                <span>Ghi chú kế toán</span>
                <textarea
                  className={textAreaClass}
                  name="note"
                  placeholder="VD: đối soát các khoản đã thu tháng 06/2026, chờ KHTC kiểm chứng từ trước khi chi."
                  disabled={!canManage || readyPartners.length === 0}
                />
              </label>
              <div className="lg:col-span-2">
                <Button disabled={!canManage || readyPartners.length === 0}>
                  <Save className="size-4" />
                  Tạo kỳ đối soát
                </Button>
                {readyPartners.length === 0 ? (
                  <p className="mt-3 text-sm text-amber-700">
                    Chưa có chứng từ Thu học phí (P2-10) nào đủ điều kiện tạo kỳ
                    đối soát. Hãy kiểm tra màn Thu học phí hoặc các dòng bị chặn
                    bên dưới.
                  </p>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-zinc-200 p-5">
              <Banknote className="mt-1 size-5 text-zinc-500" />
              <div>
                <h2 className="text-lg font-semibold">
                  Chứng từ Thu học phí (P2-10) chờ đối soát
                </h2>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Dòng đạt điều kiện sẽ được đưa vào P2-13. Dòng bị chặn sẽ chỉ
                  đúng chỗ cần xử lý, các thông tin đúng giữ nguyên.
                </p>
              </div>
            </div>
            <div className="divide-y divide-zinc-200">
              {candidates.length === 0 ? (
                <p className="p-5 text-sm text-zinc-500">
                  Chưa có chứng từ Thu học phí (P2-10) trong phạm vi TTGDTX đang chọn.
                </p>
              ) : (
                candidates.map((candidate) => {
                  const isReady =
                    candidate.can_reconcile && !candidate.existing_batch_id;

                  return (
                    <article
                      key={candidate.payment_id}
                      className="grid gap-4 p-5 lg:grid-cols-[1.2fr_1fr_1fr]"
                    >
                      <div>
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-xs ${
                            isReady
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {candidate.existing_batch_code
                            ? `Đã vào ${candidate.existing_batch_code}`
                            : isReady
                              ? "Đủ đối soát"
                              : "Cần kiểm tra"}
                        </span>
                        <h3 className="mt-3 font-semibold">
                          {candidate.student_name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          {candidate.lead_code ?? "Chưa mã lead"} ·{" "}
                          {candidate.student_phone ?? "Chưa có SĐT"}
                        </p>
                        <p className="mt-3 text-sm leading-6">
                          {candidate.partner_name} · {candidate.major_name}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {candidate.receivable_code} ·{" "}
                          {candidate.policy_code ?? "Chưa mã chính sách"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6">
                        <p>
                          <span className="text-zinc-500">Chứng từ:</span>{" "}
                          {candidate.voucher_no}
                        </p>
                        <p>
                          <span className="text-zinc-500">Thu học phí (P2-10):</span>{" "}
                          {candidate.payment_code}
                        </p>
                        <p>
                          <span className="text-zinc-500">Ngày thu:</span>{" "}
                          {formatDate(candidate.payment_date)}
                        </p>
                        <p>
                          <span className="text-zinc-500">Hình thức:</span>{" "}
                          {methodLabels[candidate.payment_method] ??
                            candidate.payment_method}
                        </p>
                        <div className="mt-3 rounded-md border border-zinc-200 bg-white p-3">
                          <p>
                            <span className="text-zinc-500">Hóa đơn:</span>{" "}
                            {invoiceRequiredLabels[candidate.invoice_required] ??
                              candidate.invoice_required}
                          </p>
                          <p>
                            <span className="text-zinc-500">Bên phát hành:</span>{" "}
                            {candidate.invoice_issuer
                              ? invoiceIssuerLabels[candidate.invoice_issuer] ??
                                candidate.invoice_issuer
                              : "Chưa rõ"}
                          </p>
                          <p>
                            <span className="text-zinc-500">Trạng thái:</span>{" "}
                            {invoiceStatusLabels[candidate.invoice_status] ??
                              candidate.invoice_status}
                          </p>
                          {candidate.invoice_no ? (
                            <p>
                              <span className="text-zinc-500">Số:</span>{" "}
                              {candidate.invoice_no}
                            </p>
                          ) : null}
                        </div>
                        {candidate.evidence_url ? (
                          <a
                            className="mt-2 inline-flex text-blue-700 underline"
                            href={candidate.evidence_url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Mở minh chứng
                          </a>
                        ) : null}
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="rounded-lg bg-zinc-50 p-3">
                            <p className="text-zinc-500">Phải thu</p>
                            <p className="font-semibold">
                              {money(candidate.payable_amount_vnd)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
                            <p>Đã thu</p>
                            <p className="font-semibold">
                              {money(candidate.payment_amount_vnd)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-orange-50 p-3 text-orange-700">
                            <p>Còn</p>
                            <p className="font-semibold">
                              {money(candidate.balance_amount_vnd)}
                            </p>
                          </div>
                        </div>
                        {candidate.blocking_items?.length ? (
                          <div className="space-y-2">
                            {candidate.blocking_items.map((item) => (
                              <p
                                key={item}
                                className="flex items-start gap-2 text-sm text-amber-700"
                              >
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                {blockLabels[item] ?? item}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="flex items-center gap-2 text-sm text-emerald-700">
                            <CheckCircle2 className="size-4" />
                            Đạt điều kiện P2-13.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-zinc-200 p-5">
              <ReceiptText className="mt-1 size-5 text-zinc-500" />
              <div>
                <h2 className="text-lg font-semibold">
                  Các kỳ đối soát gần đây
                </h2>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Đây là danh sách kỳ đã gom chứng từ. Sau này P2-14/P2-15 có
                  thể dùng dữ liệu này để duyệt và xử lý chi trả đối tác.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Kỳ</th>
                    <th className="px-5 py-3">TTGDTX</th>
                    <th className="px-5 py-3">Số chứng từ</th>
                    <th className="px-5 py-3">Đã thu</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {batches.length === 0 ? (
                    <tr>
                      <td className="px-5 py-6 text-center text-zinc-500" colSpan={6}>
                        Chưa có kỳ đối soát P2-13.
                      </td>
                    </tr>
                  ) : (
                    batches.map((batch) => (
                      <tr key={batch.batch_id}>
                        <td className="px-5 py-4 align-top">
                          <p className="font-semibold">{batch.period_label}</p>
                          <p className="text-zinc-500">{batch.batch_code}</p>
                          <p className="text-zinc-500">
                            {formatDate(batch.period_start)} -{" "}
                            {formatDate(batch.period_end)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p>{batch.partner_name}</p>
                          <p className="text-zinc-500">
                            {batch.partner_code ?? "Chưa mã"}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p>{batch.payment_count} chứng từ</p>
                          <p className="text-zinc-500">
                            {batch.student_count} học sinh
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-semibold">
                            {money(batch.total_collected_vnd)}
                          </p>
                          <p className="text-zinc-500">
                            Còn: {money(batch.total_balance_vnd)}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span className="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
                            {batchStatusLabels[batch.reconciliation_status] ??
                              batch.reconciliation_status}
                          </span>
                          {batch.evidence_url ? (
                            <a
                              className="mt-2 block text-xs text-blue-700 underline"
                              href={batch.evidence_url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Mở minh chứng
                            </a>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p>{formatDateTime(batch.updated_at)}</p>
                          <p className="text-zinc-500">
                            Tạo bởi: {batch.created_by_name ?? "Chưa rõ"}
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
