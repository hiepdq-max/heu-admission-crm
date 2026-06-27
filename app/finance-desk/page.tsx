import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  FolderSearch,
  LayoutDashboard,
  ReceiptText,
  RefreshCcw,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatVndAmount } from "@/lib/vnd-money";

type SegmentRow = {
  id: string;
  segment_code: string;
  segment_name: string;
};

type ScopeRow = {
  segment_id: string;
};

type FinanceSummaryRow = {
  receivable_total_vnd: number | string;
  receivable_paid_vnd: number | string;
  receivable_balance_vnd: number | string;
  collected_total_vnd: number | string;
  locked_reconciled_total_vnd: number | string;
  requested_total_vnd: number | string;
  approved_total_vnd: number | string;
  disbursed_total_vnd: number | string;
  remaining_to_pay_vnd: number | string;
  partner_with_exception_count: number;
};

type ImportBatchRow = {
  batch_code: string;
  batch_name: string;
  source_file_name: string;
  source_kind: string;
  expected_total_vnd: number | string;
  paid_total_vnd: number | string;
  balance_total_vnd: number | string;
  partner_payable_total_vnd: number | string;
  partner_paid_total_vnd: number | string;
  partner_balance_total_vnd: number | string;
  critical_check_count: number;
  failed_check_count: number;
  warning_check_count: number;
  import_status: string;
  readiness_status: string;
  updated_at: string | null;
};

type SourceSummaryRow = {
  source_count: number;
  checked_source_count: number;
  pending_source_count: number;
  local_path_count: number;
  check_count: number;
  pass_check_count: number;
  failed_check_count: number;
  warning_check_count: number;
  critical_failed_count: number;
};

type ControlRow = {
  sort_order: number;
  control_code: string;
  control_name: string;
  source_step: string;
  target_step: string;
  variance_vnd: number | string;
  affected_partner_count: number;
  severity: string;
  control_status: string;
  action_href: string;
  guidance: string;
};

const emptyFinanceSummary: FinanceSummaryRow = {
  receivable_total_vnd: 0,
  receivable_paid_vnd: 0,
  receivable_balance_vnd: 0,
  collected_total_vnd: 0,
  locked_reconciled_total_vnd: 0,
  requested_total_vnd: 0,
  approved_total_vnd: 0,
  disbursed_total_vnd: 0,
  remaining_to_pay_vnd: 0,
  partner_with_exception_count: 0,
};

const emptySourceSummary: SourceSummaryRow = {
  source_count: 0,
  checked_source_count: 0,
  pending_source_count: 0,
  local_path_count: 0,
  check_count: 0,
  pass_check_count: 0,
  failed_check_count: 0,
  warning_check_count: 0,
  critical_failed_count: 0,
};

const statusLabels: Record<string, string> = {
  READY_TO_LOCK: "Sẵn sàng khóa",
  LOCKED: "Đã khóa",
  BLOCKED_CRITICAL: "Bị chặn nghiêm trọng",
  NEEDS_FIX: "Cần sửa",
  NEEDS_REVIEW: "Cần rà soát",
  EMPTY: "Chưa có dòng import",
  DRAFT: "Nháp",
  IMPORTED: "Đã import",
  CHECKING: "Đang kiểm",
  HAS_ISSUES: "Có lỗi",
  CANCELLED: "Đã hủy",
  PASS: "Đạt",
  REVIEW: "Cần xem",
  CRITICAL: "Nghiêm trọng",
};

function money(value: number | string | null | undefined) {
  return formatVndAmount(value);
}

function count(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);

  return Number.isFinite(numeric) ? numeric : 0;
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

function safeHref(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/finance-desk";
  }

  return value;
}

function badgeTone(status: string) {
  if (["PASS", "READY_TO_LOCK", "LOCKED"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (["CRITICAL", "BLOCKED_CRITICAL", "NEEDS_FIX"].includes(status)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (["REVIEW", "NEEDS_REVIEW", "HAS_ISSUES"].includes(status)) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function canOpenFinanceDesk(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasFinanceDeskRead: boolean,
  hasTtgdtxReportRead: boolean,
  hasImportRead: boolean,
  hasSourceRead: boolean,
  hasPaymentManage: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  const hasPermission =
    hasFinanceDeskRead ||
    hasTtgdtxReportRead ||
    hasImportRead ||
    hasSourceRead ||
    hasPaymentManage;

  return Boolean(
    segmentId &&
      hasPermission &&
      scopes.some((scope) => scope.segment_id === segmentId),
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone = "text-zinc-950",
}: {
  label: string;
  value: string | number;
  hint: string;
  tone?: string;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-4 text-2xl font-semibold ${tone}`}>{value}</p>
      <p className="mt-3 text-sm text-zinc-500">{hint}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex w-fit rounded-lg border px-3 py-1 text-sm ${badgeTone(
        status,
      )}`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

function FinanceDeskReadOnlyBoundary() {
  return (
    <section
      className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900"
      data-finance-desk-readonly-boundary="P5-03"
    >
      <div className="flex gap-3">
        <ShieldCheck className="mt-1 size-5 shrink-0" />
        <div>
          <h2 className="text-lg font-semibold">
            Nguyên tắc vận hành Finance Desk
          </h2>
          <p className="mt-2 text-sm leading-6">
            Finance Desk là bàn làm việc kế toán nội bộ. Module này tổng hợp
            import, công nợ, thu học phí, đối soát, đề nghị chi và hồ sơ minh
            chứng. Mọi sửa số liệu tiền phải quay về đúng bước gốc P2;
            dashboard không tự phê duyệt, không thay thế chứng từ kế toán và
            không khởi tạo lệnh chuyển tiền. Production remains NO-GO until
            backup/restore evidence, signed UAT, migration approval and owner
            Go/No-Go exist outside Codex/chat.
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function FinanceDeskPage() {
  // FinanceDeskPage guard map: formatVndAmount, canOpenFinanceDesk,
  // ttgdtx_accounting_dashboard_summary,
  // ttgdtx_tuition_import_batch_readiness,
  // ttgdtx_accounting_dashboard_control_board.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    roleResult,
    financeDeskReadResult,
    ttgdtxReportReadResult,
    importReadResult,
    sourceReadResult,
    paymentManageResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", { permission_name: "finance_desk.read" }),
    supabase.rpc("has_permission", { permission_name: "ttgdtx.report.read" }),
    supabase.rpc("has_permission", { permission_name: "ttgdtx.import.read" }),
    supabase.rpc("has_permission", { permission_name: "ttgdtx.source.read" }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.payment_request.manage",
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

  const roleCode = (roleResult.data as string | null) ?? null;
  const segment = segmentResult.data;
  const canOpen = canOpenFinanceDesk(
    segment?.id ?? null,
    roleCode,
    scopeResult.data ?? [],
    Boolean(financeDeskReadResult.data),
    Boolean(ttgdtxReportReadResult.data),
    Boolean(importReadResult.data),
    Boolean(sourceReadResult.data),
    Boolean(paymentManageResult.data),
  );

  let financeSummary = emptyFinanceSummary;
  let sourceSummary = emptySourceSummary;
  let importBatches: ImportBatchRow[] = [];
  let controls: ControlRow[] = [];
  let dataError: { message: string } | null = null;

  if (canOpen) {
    const [summaryResult, sourceResult, importResult, controlResult] =
      await Promise.all([
        supabase
          .from("ttgdtx_accounting_dashboard_summary")
          .select("*")
          .maybeSingle<FinanceSummaryRow>(),
        supabase
          .from("ttgdtx_p2_11_summary")
          .select("*")
          .maybeSingle<SourceSummaryRow>(),
        supabase
          .from("ttgdtx_tuition_import_batch_readiness")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(8)
          .returns<ImportBatchRow[]>(),
        supabase
          .from("ttgdtx_accounting_dashboard_control_board")
          .select("*")
          .order("sort_order", { ascending: true })
          .returns<ControlRow[]>(),
      ]);

    financeSummary = summaryResult.data ?? emptyFinanceSummary;
    sourceSummary = sourceResult.data ?? emptySourceSummary;
    importBatches = importResult.data ?? [];
    controls = controlResult.data ?? [];
    dataError =
      summaryResult.error ??
      sourceResult.error ??
      importResult.error ??
      controlResult.error;
  }

  const totalImportIssues = importBatches.reduce(
    (total, batch) =>
      total +
      count(batch.critical_check_count) +
      count(batch.failed_check_count) +
      count(batch.warning_check_count),
    0,
  );
  const totalSourceIssues =
    count(sourceSummary.pending_source_count) +
    count(sourceSummary.local_path_count) +
    count(sourceSummary.failed_check_count) +
    count(sourceSummary.warning_check_count);

  return (
    <AppShell
      active="finance-desk"
      title="HEU Finance Desk"
      description="Công nợ học phí, import Excel, đối soát nguồn và thanh toán trung tâm cho TTGDTX 9+."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/finance-desk"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/finance-desk">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import">
              <FileSpreadsheet className="size-4" />
              Import Excel
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/source-control">
              <FolderSearch className="size-4" />
              Hồ sơ/link
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/accounting-dashboard">
              <LayoutDashboard className="size-4" />
              Dashboard P2-18
            </Link>
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <FinanceDeskReadOnlyBoundary />

        {!canOpen ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
            Tài khoản hiện tại chưa được mở quyền HEU Finance Desk hoặc chưa có
            phạm vi TTGDTX 9+ phù hợp. Cần quyền finance_desk.read, quyền báo
            cáo/import/nguồn TTGDTX, hoặc vai trò ADMIN/BGH.
          </section>
        ) : dataError ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-semibold">
                  Chưa đọc được đầy đủ Finance Desk
                </p>
                <p className="mt-1">
                  Hãy áp dụng các migration Step90-Step111 trên môi trường UAT
                  đã backup. Chi tiết: {dataError.message}
                </p>
              </div>
            </div>
          </section>
        ) : (
          <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Phải thu học phí"
              value={money(financeSummary.receivable_total_vnd)}
              hint={`Còn nợ: ${money(financeSummary.receivable_balance_vnd)}`}
            />
            <KpiCard
              label="Đã thu"
              value={money(financeSummary.collected_total_vnd)}
              hint={`P2-03 ghi đã thu: ${money(
                financeSummary.receivable_paid_vnd,
              )}`}
              tone="text-emerald-700"
            />
            <KpiCard
              label="Còn phải chi trung tâm"
              value={money(financeSummary.remaining_to_pay_vnd)}
              hint={`Đã chi: ${money(financeSummary.disbursed_total_vnd)}`}
              tone={
                count(financeSummary.remaining_to_pay_vnd) > 0
                  ? "text-amber-700"
                  : "text-emerald-700"
              }
            />
            <KpiCard
              label="Cần xử lý"
              value={
                count(financeSummary.partner_with_exception_count) +
                totalImportIssues +
                totalSourceIssues
              }
              hint="Tổng cảnh báo từ dashboard, import và hồ sơ nguồn"
              tone="text-amber-700"
            />
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Đã khóa đối soát"
              value={money(financeSummary.locked_reconciled_total_vnd)}
              hint="Nguồn hợp lệ để lập đề nghị chi"
            />
            <KpiCard
              label="Đã đề nghị chi"
              value={money(financeSummary.requested_total_vnd)}
              hint="P2-15 từ kỳ đối soát đã khóa"
            />
            <KpiCard
              label="Đã duyệt chi"
              value={money(financeSummary.approved_total_vnd)}
              hint="P2-16 đã kiểm/duyệt"
              tone="text-emerald-700"
            />
            <KpiCard
              label="Hồ sơ nguồn"
              value={`${sourceSummary.checked_source_count}/${sourceSummary.source_count}`}
              hint={`${sourceSummary.local_path_count} link local cần chuyển registry`}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-200 p-5">
                <h2 className="text-lg font-semibold">
                  Batch import Excel/Google Sheet
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Theo quy chế HEU, file chỉ được dùng vận hành khi có mã,
                  nguồn, người phụ trách, checklist lỗi và audit log.
                </p>
              </div>
              <div className="divide-y divide-zinc-200">
                {importBatches.length === 0 ? (
                  <div className="p-6 text-sm text-zinc-500">
                    Chưa có batch import nào trong phạm vi hiện tại.
                  </div>
                ) : (
                  importBatches.map((batch) => (
                    <article key={batch.batch_code} className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <StatusBadge status={batch.readiness_status} />
                            <StatusBadge status={batch.import_status} />
                          </div>
                          <h3 className="mt-3 font-semibold">
                            {batch.batch_name}
                          </h3>
                          <p className="mt-1 text-sm text-zinc-500">
                            {batch.batch_code} · {batch.source_kind} ·{" "}
                            {batch.source_file_name}
                          </p>
                        </div>
                        <Button asChild variant="outline">
                          <Link href="/ttgdtx/import">
                            Mở import
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                        <p>
                          Phải thu: <b>{money(batch.expected_total_vnd)}</b>
                        </p>
                        <p>
                          Đã thu: <b>{money(batch.paid_total_vnd)}</b>
                        </p>
                        <p>
                          Còn nợ: <b>{money(batch.balance_total_vnd)}</b>
                        </p>
                        <p>
                          Phải chi:{" "}
                          <b>{money(batch.partner_payable_total_vnd)}</b>
                        </p>
                        <p>
                          Đã chi: <b>{money(batch.partner_paid_total_vnd)}</b>
                        </p>
                        <p>
                          Còn chi:{" "}
                          <b>{money(batch.partner_balance_total_vnd)}</b>
                        </p>
                      </div>
                      <p className="mt-3 text-sm text-zinc-500">
                        Lỗi/cảnh báo: {batch.critical_check_count} critical,{" "}
                        {batch.failed_check_count} fail,{" "}
                        {batch.warning_check_count} warning. Cập nhật{" "}
                        {formatDateTime(batch.updated_at)}.
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-200 p-5">
                <h2 className="text-lg font-semibold">Hồ sơ và link nguồn</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Link hợp đồng, phụ lục, biên bản nghiệm thu và chứng từ phải
                  vào File Registry trước khi dùng làm căn cứ chính thức.
                </p>
              </div>
              <div className="grid gap-4 p-5">
                <div className="rounded-lg bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-500">Nguồn đã đăng ký</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {sourceSummary.source_count}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {sourceSummary.checked_source_count} đã checked/ready,{" "}
                    {sourceSummary.pending_source_count} đang chờ kiểm.
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-500">Checklist nguồn</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {sourceSummary.pass_check_count}/{sourceSummary.check_count}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {sourceSummary.critical_failed_count} critical fail,{" "}
                    {sourceSummary.failed_check_count} fail,{" "}
                    {sourceSummary.warning_check_count} warning.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/ttgdtx/source-control">
                    <FolderSearch className="size-4" />
                    Mở bảng kiểm hồ sơ/link
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-lg font-semibold">Kiểm soát khớp số</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Nếu có lệch, Finance Desk chỉ đường về đúng bước gốc để sửa:
                công nợ, thu tiền, đối soát, đề nghị chi, duyệt chi hoặc chi
                tiền.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Kiểm soát</th>
                    <th className="px-5 py-3">Bước</th>
                    <th className="px-5 py-3">Lệch</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {controls.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-zinc-500"
                        colSpan={5}
                      >
                        Chưa có dòng kiểm soát khớp số.
                      </td>
                    </tr>
                  ) : (
                    controls.map((control) => (
                      <tr key={control.control_code} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-medium">{control.control_name}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {control.control_code}
                          </p>
                          <p className="mt-2 text-zinc-500">
                            {control.guidance}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {control.source_step} -&gt; {control.target_step}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {money(control.variance_vnd)}
                          </p>
                          <p className="mt-1 text-zinc-500">
                            {control.affected_partner_count} trung tâm bị ảnh
                            hưởng
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={control.control_status} />
                          <p className="mt-2 text-xs text-zinc-500">
                            Mức độ: {control.severity}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {control.control_status === "PASS" ? (
                            <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                              <CheckCircle2 className="size-4" />
                              Đang khớp
                            </span>
                          ) : (
                            <Button asChild variant="outline">
                              <Link href={safeHref(control.action_href)}>
                                Mở bước gốc
                                <ArrowRight className="size-4" />
                              </Link>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/receivables">
                <ReceiptText className="size-4" />
                Công nợ học phí
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/payments">
                <Banknote className="size-4" />
                Thu học phí
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/reconciliation">
                <Scale className="size-4" />
                Đối soát
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/payment-requests">
                <WalletCards className="size-4" />
                Đề nghị chi
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/payment-requests/review">
                <ShieldCheck className="size-4" />
                Duyệt chi
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/payment-requests/pay">
                <Banknote className="size-4" />
                Ghi nhận chi
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/accounting-dashboard">
                <LayoutDashboard className="size-4" />
                Dashboard P2-18
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/source-control">
                <ClipboardList className="size-4" />
                Checklist hồ sơ
              </Link>
            </Button>
          </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
