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
  READY_TO_LOCK: "San sang khoa",
  LOCKED: "Da khoa",
  BLOCKED_CRITICAL: "Bi chan nghiem trong",
  NEEDS_FIX: "Can sua",
  NEEDS_REVIEW: "Can ra soat",
  EMPTY: "Chua co dong import",
  DRAFT: "Nhap",
  IMPORTED: "Da import",
  CHECKING: "Dang kiem",
  HAS_ISSUES: "Co loi",
  CANCELLED: "Da huy",
  PASS: "Dat",
  REVIEW: "Can xem",
  CRITICAL: "Nghiem trong",
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
    return "Chua co";
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
      description="Cong no hoc phi, import Excel, doi soat nguon va thanh toan trung tam cho TTGDTX 9+."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/finance-desk"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/finance-desk">
              <RefreshCcw className="size-4" />
              Tai lai
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
              Ho so/link
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
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tai khoan hien tai chua duoc mo quyen HEU Finance Desk hoac chua co
          pham vi TTGDTX 9+ phu hop. Can quyen finance_desk.read, quyen bao
          cao/import/nguon TTGDTX, hoac vai tro ADMIN/BGH.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chua doc duoc day du Finance Desk</p>
              <p className="mt-1">
                Hay ap dung cac migration Step90-Step111 tren moi truong UAT da
                backup. Chi tiet: {dataError.message}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 size-5 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold">
                  Nguyen tac van hanh Finance Desk
                </h2>
                <p className="mt-2 text-sm leading-6">
                  Finance Desk la ban lam viec ke toan noi bo. Module nay tong
                  hop import, cong no, thu hoc phi, doi soat, de nghi chi va
                  ho so minh chung. Moi sua so lieu tien phai quay ve dung buoc
                  goc P2; dashboard khong tu phe duyet, khong thay the chung tu
                  ke toan va khong khoi tao lenh chuyen tien.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Phai thu hoc phi"
              value={money(financeSummary.receivable_total_vnd)}
              hint={`Con no: ${money(financeSummary.receivable_balance_vnd)}`}
            />
            <KpiCard
              label="Da thu"
              value={money(financeSummary.collected_total_vnd)}
              hint={`P2-03 ghi da thu: ${money(
                financeSummary.receivable_paid_vnd,
              )}`}
              tone="text-emerald-700"
            />
            <KpiCard
              label="Con phai chi trung tam"
              value={money(financeSummary.remaining_to_pay_vnd)}
              hint={`Da chi: ${money(financeSummary.disbursed_total_vnd)}`}
              tone={
                count(financeSummary.remaining_to_pay_vnd) > 0
                  ? "text-amber-700"
                  : "text-emerald-700"
              }
            />
            <KpiCard
              label="Can xu ly"
              value={
                count(financeSummary.partner_with_exception_count) +
                totalImportIssues +
                totalSourceIssues
              }
              hint="Tong canh bao tu dashboard, import va ho so nguon"
              tone="text-amber-700"
            />
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Da khoa doi soat"
              value={money(financeSummary.locked_reconciled_total_vnd)}
              hint="Nguon hop le de lap de nghi chi"
            />
            <KpiCard
              label="Da de nghi chi"
              value={money(financeSummary.requested_total_vnd)}
              hint="P2-15 tu ky doi soat da khoa"
            />
            <KpiCard
              label="Da duyet chi"
              value={money(financeSummary.approved_total_vnd)}
              hint="P2-16 da kiem/duyet"
              tone="text-emerald-700"
            />
            <KpiCard
              label="Ho so nguon"
              value={`${sourceSummary.checked_source_count}/${sourceSummary.source_count}`}
              hint={`${sourceSummary.local_path_count} link local can chuyen registry`}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-200 p-5">
                <h2 className="text-lg font-semibold">
                  Batch import Excel/Google Sheet
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Theo quy che HEU, file chi duoc dung van hanh khi co ma,
                  nguon, nguoi phu trach, checklist loi va audit log.
                </p>
              </div>
              <div className="divide-y divide-zinc-200">
                {importBatches.length === 0 ? (
                  <div className="p-6 text-sm text-zinc-500">
                    Chua co batch import nao trong pham vi hien tai.
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
                            Mo import
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                        <p>
                          Phai thu: <b>{money(batch.expected_total_vnd)}</b>
                        </p>
                        <p>
                          Da thu: <b>{money(batch.paid_total_vnd)}</b>
                        </p>
                        <p>
                          Con no: <b>{money(batch.balance_total_vnd)}</b>
                        </p>
                        <p>
                          Phai chi:{" "}
                          <b>{money(batch.partner_payable_total_vnd)}</b>
                        </p>
                        <p>
                          Da chi: <b>{money(batch.partner_paid_total_vnd)}</b>
                        </p>
                        <p>
                          Con chi:{" "}
                          <b>{money(batch.partner_balance_total_vnd)}</b>
                        </p>
                      </div>
                      <p className="mt-3 text-sm text-zinc-500">
                        Loi/canh bao: {batch.critical_check_count} critical,{" "}
                        {batch.failed_check_count} fail,{" "}
                        {batch.warning_check_count} warning. Cap nhat{" "}
                        {formatDateTime(batch.updated_at)}.
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-200 p-5">
                <h2 className="text-lg font-semibold">Ho so va link nguon</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Link hop dong, phu luc, bien ban nghiem thu va chung tu phai
                  vao File Registry truoc khi dung lam can cu chinh thuc.
                </p>
              </div>
              <div className="grid gap-4 p-5">
                <div className="rounded-lg bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-500">Nguon da dang ky</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {sourceSummary.source_count}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {sourceSummary.checked_source_count} da checked/ready,{" "}
                    {sourceSummary.pending_source_count} dang cho kiem.
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-500">Checklist nguon</p>
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
                    Mo bang kiem ho so/link
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-lg font-semibold">Kiem soat khop so</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Neu co lech, Finance Desk chi duong ve dung buoc goc de sua:
                cong no, thu tien, doi soat, de nghi chi, duyet chi hoac chi
                tien.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Kiem soat</th>
                    <th className="px-5 py-3">Buoc</th>
                    <th className="px-5 py-3">Lech</th>
                    <th className="px-5 py-3">Trang thai</th>
                    <th className="px-5 py-3">Xu ly</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {controls.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-zinc-500"
                        colSpan={5}
                      >
                        Chua co dong kiem soat khop so.
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
                            {control.affected_partner_count} trung tam bi anh
                            huong
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={control.control_status} />
                          <p className="mt-2 text-xs text-zinc-500">
                            Muc do: {control.severity}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {control.control_status === "PASS" ? (
                            <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                              <CheckCircle2 className="size-4" />
                              Dang khop
                            </span>
                          ) : (
                            <Button asChild variant="outline">
                              <Link href={safeHref(control.action_href)}>
                                Mo buoc goc
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
                Cong no hoc phi
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/payments">
                <Banknote className="size-4" />
                Thu hoc phi
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/reconciliation">
                <Scale className="size-4" />
                Doi soat
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/payment-requests">
                <WalletCards className="size-4" />
                De nghi chi
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/payment-requests/review">
                <ShieldCheck className="size-4" />
                Duyet chi
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/ttgdtx/payment-requests/pay">
                <Banknote className="size-4" />
                Ghi nhan chi
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
                Checklist ho so
              </Link>
            </Button>
          </section>
        </div>
      )}
    </AppShell>
  );
}
