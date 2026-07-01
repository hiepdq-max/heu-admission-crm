import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  LockKeyhole,
  RefreshCcw,
  Save,
  Scale,
  ShieldCheck,
  WalletCards,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TtgdtxReconciliationExceptionGate } from "@/components/ttgdtx/ttgdtx-reconciliation-exception-gate";
import { TtgdtxOperatingControlStrip } from "@/components/ttgdtx/ttgdtx-operating-control-strip";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { firstParam } from "@/lib/workspace";

import { reviewTtgdtxReconciliationBatchAction } from "./actions";

type ReviewPageProps = {
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

type ReviewBatchRow = {
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
  total_collected_vnd: number | string;
  total_balance_vnd: number | string;
  payment_count: number;
  student_count: number;
  reconciliation_status: string;
  evidence_url: string | null;
  note: string | null;
  risk_level: string | null;
  control_status: string | null;
  line_count: number;
  warning_line_count: number;
  unresolved_invoice_line_count: number;
  reviewed_line_count: number;
  created_by_name: string | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
  blocking_items: string[] | null;
  can_review: boolean;
  can_approve: boolean;
  can_lock: boolean;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500";
const textAreaClass =
  "min-h-20 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500";

const statusLabels: Record<string, string> = {
  DRAFT: "Nháp",
  READY_FOR_REVIEW: "Chờ rà soát",
  REVIEWED: "Đã rà soát",
  APPROVED: "Đã duyệt",
  LOCKED: "Đã khóa",
  CANCELLED: "Đã hủy",
};

const statusTone: Record<string, string> = {
  READY_FOR_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  REVIEWED: "border-blue-200 bg-blue-50 text-blue-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  LOCKED: "border-zinc-300 bg-zinc-100 text-zinc-700",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-700",
};

const blockLabels: Record<string, string> = {
  NO_RECONCILIATION_LINES: "Chưa có dòng chứng từ trong kỳ",
  NO_COLLECTED_AMOUNT: "Chưa có số tiền đã thu",
  UNRESOLVED_INVOICE_DECISION:
    "Còn chứng từ P2-10 chưa chốt hóa đơn/chứng từ",
  BATCH_CLOSED: "Kỳ đã khóa hoặc đã hủy",
};

const actionLabels: Record<string, string> = {
  REVIEW: "Đã rà soát",
  APPROVE: "Duyệt kỳ",
  LOCK: "Khóa kỳ",
  CANCEL: "Hủy/trả về",
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

function countBy(
  rows: ReviewBatchRow[],
  predicate: (row: ReviewBatchRow) => boolean,
) {
  return rows.filter(predicate).length;
}

function messageFromParams(updated?: string | null, error?: string | null) {
  if (error) {
    return {
      tone: "error" as const,
      text: `Chưa lưu được P2-14: ${error}`,
    };
  }

  if (updated) {
    return {
      tone: "success" as const,
      text: "Đã lưu xử lý P2-14 cho kỳ đối soát.",
    };
  }

  return null;
}

function canOpenTtgdtxReview(
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

function availableActions(row: ReviewBatchRow) {
  const actions: string[] = [];

  if (row.can_review) {
    actions.push("REVIEW");
  }

  if (row.can_approve) {
    actions.push("APPROVE");
  }

  if (row.can_lock) {
    actions.push("LOCK");
  }

  if (!["LOCKED", "CANCELLED"].includes(row.reconciliation_status)) {
    actions.push("CANCEL");
  }

  return actions;
}

export default async function TtgdtxReconciliationReviewPage({
  searchParams,
}: ReviewPageProps) {
  const params = await searchParams;
  const message = messageFromParams(
    firstParam(params?.updated),
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

  const segment = segmentResult.data;
  const roleCode = roleResult.data as string | null;
  const canOpen = canOpenTtgdtxReview(
    segment?.id ?? null,
    roleCode,
    scopeResult.data ?? [],
    Boolean(reconciliationReadResult.data),
    Boolean(collectionReadResult.data),
  );
  const canManage =
    roleCode === "ADMIN" ||
    roleCode === "BGH" ||
    Boolean(reconciliationManageResult.data);
  let rows: ReviewBatchRow[] = [];
  let dataError: { message: string } | null = null;

  if (canOpen) {
    const reviewResult = await supabase
      .from("ttgdtx_reconciliation_review_board")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<ReviewBatchRow[]>();

    rows = reviewResult.data ?? [];
    dataError = reviewResult.error;
  }

  const readyCount = countBy(
    rows,
    (row) => row.reconciliation_status === "READY_FOR_REVIEW",
  );
  const approvedCount = countBy(
    rows,
    (row) => row.reconciliation_status === "APPROVED",
  );
  const lockedCount = countBy(
    rows,
    (row) => row.reconciliation_status === "LOCKED",
  );

  return (
    <AppShell
      active="ttgdtx"
      title="P2-14 · Duyệt kỳ đối soát TTGDTX"
      description="Rà soát, duyệt và khóa kỳ đối soát đã tạo ở P2-13. Bước này chưa chi tiền cho TTGDTX."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/reconciliation/review"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/reconciliation">
              <ArrowLeft className="size-4" />
              P2-13 đối soát
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payments">
              <Scale className="size-4" />
              Thu học phí (P2-10)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests">
              <WalletCards className="size-4" />
              P2-15 đề nghị chi
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests/review">
              <ShieldCheck className="size-4" />
              P2-16 duyệt chi
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/reconciliation/review">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-14">
              <FileSearch className="size-4" />
              Tìm P2-14
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa có quyền xem P2-14 hoặc chưa được phân phạm
          vi Trung cấp 9+ liên kết TTGDTX.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được P2-14</p>
              <p className="mt-1">
                Hãy chạy SQL step104 sau P2-13. Chi tiết kỹ thuật:{" "}
                {dataError.message}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          <TtgdtxOperatingControlStrip currentCode="P2-14" />
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
              <ShieldCheck className="mt-0.5 size-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Nguyên tắc P2-14</h2>
                <p className="mt-2">
                  P2-14 chỉ rà soát, duyệt và khóa kỳ đối soát đã tạo ở P2-13.
                  Bước này chưa chi tiền. Kỳ đã khóa sẽ trở thành đầu vào cho
                  bước đề nghị chi/chi trả TTGDTX sau này.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Kỳ đối soát</p>
              <p className="mt-3 text-3xl font-bold">{rows.length}</p>
            </div>
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Chờ rà soát</p>
              <p className="mt-3 text-3xl font-bold text-amber-700">
                {readyCount}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đã duyệt, chờ khóa</p>
              <p className="mt-3 text-3xl font-bold text-emerald-700">
                {approvedCount}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đã khóa</p>
              <p className="mt-3 text-3xl font-bold text-blue-700">
                {lockedCount}
              </p>
            </div>
          </section>

          <section className="rounded-lg border bg-white shadow-sm">
            <div className="border-b p-5">
              <h2 className="text-lg font-semibold">
                Kỳ đối soát cần xử lý
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Chọn đúng hành động theo quy trình: rà soát → duyệt → khóa.
                Nếu kỳ sai, chọn hủy/trả về và ghi rõ lý do.
              </p>
            </div>

            {rows.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500">
                Chưa có kỳ đối soát P2-13 trong phạm vi TTGDTX đang chọn.
              </div>
            ) : (
              <div className="divide-y divide-zinc-200">
                {rows.map((row) => {
                  const actions = availableActions(row);
                  const blocks = row.blocking_items ?? [];

                  return (
                    <article
                      className="grid gap-5 p-5 xl:grid-cols-[1.2fr_1.4fr_1fr]"
                      key={row.batch_id}
                    >
                      <div className="space-y-3">
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-xs ${
                            statusTone[row.reconciliation_status] ??
                            "border-zinc-200 bg-zinc-50 text-zinc-700"
                          }`}
                        >
                          {statusLabels[row.reconciliation_status] ??
                            row.reconciliation_status}
                        </span>
                        <div>
                          <h3 className="font-semibold">{row.period_label}</h3>
                          <p className="mt-1 text-sm text-zinc-500">
                            {row.batch_code}
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {formatDate(row.period_start)} -{" "}
                            {formatDate(row.period_end)}
                          </p>
                        </div>
                        <div className="text-sm leading-6">
                          <p className="font-medium">{row.partner_name}</p>
                          <p className="text-zinc-500">
                            {row.partner_code ?? "Chưa có mã TTGDTX"}
                          </p>
                          <p className="text-zinc-500">
                            Tạo: {formatDateTime(row.created_at)}
                          </p>
                          <p className="text-zinc-500">
                            Cập nhật: {formatDateTime(row.updated_at)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-zinc-50 p-4">
                          <p className="text-xs uppercase text-zinc-500">
                            Chứng từ / học sinh
                          </p>
                          <p className="mt-2 font-semibold">
                            {row.payment_count} chứng từ · {row.student_count}{" "}
                            học sinh
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Dòng đã rà soát: {row.reviewed_line_count}/
                            {row.line_count}
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Cần chốt hóa đơn: {row.unresolved_invoice_line_count}
                          </p>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-4">
                          <p className="text-xs uppercase text-zinc-500">
                            Đã thu
                          </p>
                          <p className="mt-2 font-semibold">
                            {money(row.total_collected_vnd)}
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Còn: {money(row.total_balance_vnd)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-4">
                          <p className="text-xs uppercase text-zinc-500">
                            Kiểm soát
                          </p>
                          <p className="mt-2 font-semibold">
                            {row.control_status ?? "Chưa rõ"}
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Rủi ro: {row.risk_level ?? "Chưa rõ"}
                          </p>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-4">
                          <p className="text-xs uppercase text-zinc-500">
                            Minh chứng
                          </p>
                          {row.evidence_url ? (
                            <a
                              className="mt-2 block text-sm text-blue-700 underline"
                              href={row.evidence_url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Mở minh chứng
                            </a>
                          ) : (
                            <p className="mt-2 text-sm text-zinc-500">
                              Chưa gắn link
                            </p>
                          )}
                        </div>
                        {blocks.length > 0 ? (
                          <div className="sm:col-span-2">
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                              {blocks.map((item) => (
                                <div className="flex gap-2" key={item}>
                                  <AlertTriangle className="mt-1 size-4 shrink-0" />
                                  <span>{blockLabels[item] ?? item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div>
                        {canManage ? (
                          <form
                            action={reviewTtgdtxReconciliationBatchAction}
                            className="space-y-3"
                          >
                            <input
                              name="return_to"
                              type="hidden"
                              value="/ttgdtx/reconciliation/review"
                            />
                            <input
                              name="batch_id"
                              type="hidden"
                              value={row.batch_id}
                            />
                            <label className="block text-sm font-medium">
                              Hành động P2-14
                              <select
                                className={`${fieldClass} mt-1`}
                                disabled={actions.length === 0}
                                name="action_type"
                                required
                              >
                                {actions.length === 0 ? (
                                  <option value="">Không còn hành động</option>
                                ) : null}
                                {actions.map((item) => (
                                  <option key={item} value={item}>
                                    {actionLabels[item] ?? item}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="block text-sm font-medium">
                              Link minh chứng nếu có
                              <input
                                className={`${fieldClass} mt-1`}
                                name="evidence_url"
                                placeholder="Link Drive, biên bản đối soát..."
                                type="url"
                              />
                            </label>
                            <label className="block text-sm font-medium">
                              Ghi chú xử lý
                              <textarea
                                className={`${textAreaClass} mt-1`}
                                name="note"
                                placeholder="VD: đã đối chiếu chứng từ, số tiền và danh sách học sinh. Nếu hủy/trả về thì bắt buộc ghi lý do."
                              />
                            </label>
                            <Button
                              className="w-full"
                              disabled={actions.length === 0}
                              type="submit"
                            >
                              {row.can_lock ? (
                                <LockKeyhole className="size-4" />
                              ) : row.can_approve ? (
                                <CheckCircle2 className="size-4" />
                              ) : actions.includes("CANCEL") &&
                                actions.length === 1 ? (
                                <XCircle className="size-4" />
                              ) : (
                                <Save className="size-4" />
                              )}
                              Lưu xử lý P2-14
                            </Button>
                          </form>
                        ) : (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                            Tài khoản chỉ được xem P2-14. Muốn rà soát/duyệt/khóa
                            kỳ cần quyền ttgdtx.reconciliation.manage hoặc vai trò
                            quản trị/BGH.
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
