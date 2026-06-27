import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  FileSearch,
  LayoutDashboard,
  ReceiptText,
  RefreshCcw,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TtgdtxDashboardReadonlyGuard } from "@/components/ttgdtx/ttgdtx-dashboard-readonly-guard";
import { TtgdtxDashboardUatEvidenceChecklist } from "@/components/ttgdtx/ttgdtx-dashboard-uat-evidence-checklist";
import { TtgdtxOperatingControlStrip } from "@/components/ttgdtx/ttgdtx-operating-control-strip";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type SegmentRow = {
  id: string;
  segment_code: string;
  segment_name: string;
};

type ScopeRow = {
  segment_id: string;
};

type SummaryRow = {
  partner_count: number;
  ready_partner_count: number;
  partner_with_exception_count: number;
  receivable_total_vnd: number | string;
  receivable_paid_vnd: number | string;
  receivable_balance_vnd: number | string;
  collected_total_vnd: number | string;
  locked_reconciled_total_vnd: number | string;
  requested_total_vnd: number | string;
  approved_total_vnd: number | string;
  disbursed_total_vnd: number | string;
  remaining_to_pay_vnd: number | string;
  updated_at: string | null;
};

type PartnerRow = {
  partner_id: string;
  partner_code: string | null;
  partner_name: string;
  area: string | null;
  contract_count: number;
  contract_ready_count: number;
  policy_count: number;
  policy_ready_count: number;
  receivable_count: number;
  open_receivable_count: number;
  overdue_receivable_count: number;
  receivable_total_vnd: number | string;
  receivable_paid_vnd: number | string;
  receivable_balance_vnd: number | string;
  payment_count: number;
  collected_total_vnd: number | string;
  reconciliation_count: number;
  locked_reconciliation_count: number;
  reconciled_total_vnd: number | string;
  locked_reconciled_total_vnd: number | string;
  payment_request_count: number;
  requested_total_vnd: number | string;
  approved_total_vnd: number | string;
  request_paid_total_vnd: number | string;
  disbursement_count: number;
  disbursed_total_vnd: number | string;
  remaining_to_reconcile_vnd: number | string;
  remaining_to_request_vnd: number | string;
  remaining_to_approve_vnd: number | string;
  remaining_to_pay_vnd: number | string;
  updated_at: string | null;
  next_step_code: string;
  next_step_label: string;
  next_step_href: string;
  blocking_items: string[] | null;
  exception_count: number;
};

type ExceptionRow = {
  partner_id: string;
  partner_code: string | null;
  partner_name: string;
  area: string | null;
  next_step_code: string;
  next_step_label: string;
  next_step_href: string;
  blocking_items: string[] | null;
  exception_count: number;
  receivable_balance_vnd: number | string;
  remaining_to_reconcile_vnd: number | string;
  remaining_to_request_vnd: number | string;
  remaining_to_approve_vnd: number | string;
  remaining_to_pay_vnd: number | string;
  updated_at: string | null;
};

type ControlRow = {
  sort_order: number;
  control_code: string;
  control_name: string;
  source_step: string;
  target_step: string;
  expected_total_vnd: number | string;
  actual_total_vnd: number | string;
  variance_vnd: number | string;
  affected_partner_count: number;
  severity: string;
  control_status: string;
  action_href: string;
  guidance: string;
  updated_at: string | null;
};

type MovementRow = {
  movement_type: string;
  movement_code: string;
  partner_id: string;
  partner_code: string | null;
  partner_name: string;
  period_label: string | null;
  amount_vnd: number | string;
  status: string;
  related_code: string | null;
  evidence_url: string | null;
  actor_name: string | null;
  movement_at: string;
};

const emptySummary: SummaryRow = {
  partner_count: 0,
  ready_partner_count: 0,
  partner_with_exception_count: 0,
  receivable_total_vnd: 0,
  receivable_paid_vnd: 0,
  receivable_balance_vnd: 0,
  collected_total_vnd: 0,
  locked_reconciled_total_vnd: 0,
  requested_total_vnd: 0,
  approved_total_vnd: 0,
  disbursed_total_vnd: 0,
  remaining_to_pay_vnd: 0,
  updated_at: null,
};

const movementLabels: Record<string, string> = {
  RECEIVABLE: "Công nợ",
  COLLECTION: "Thu tiền",
  RECONCILIATION: "Đối soát",
  PAYMENT_REQUEST: "Đề nghị chi",
  DISBURSEMENT: "Đã chi",
};

const issueLabels: Record<string, string> = {
  P2_01_CONTRACT_NOT_READY: "Hợp đồng P2-01 chưa đủ nền",
  P2_02_POLICY_NOT_READY: "Chính sách học phí P2-02 chưa sẵn sàng",
  P2_03_RECEIVABLE_OVERDUE: "Có công nợ quá hạn",
  P2_03_RECEIVABLE_BALANCE: "Còn công nợ phải thu",
  P2_10_NOT_COLLECTED: "Chưa có chứng từ thu học phí (P2-10)",
  P2_13_NEED_RECONCILIATION: "Cần lập kỳ đối soát P2-13",
  P2_14_NEED_LOCK: "Kỳ đối soát chưa khóa P2-14",
  P2_15_NEED_PAYMENT_REQUEST: "Cần lập đề nghị chi P2-15",
  P2_16_NEED_APPROVAL: "Đề nghị chi chưa duyệt P2-16",
  P2_17_NEED_PAYMENT: "Cần chi tiền P2-17",
};

const movementDisplayLabels: Record<string, string> = {
  ...movementLabels,
  "P2-10_DA_THU": "Thu học phí (P2-10)",
  "P2-13_DOI_SOAT": "Đối soát P2-13",
  "P2-15_DE_NGHI_CHI": "Đề nghị chi P2-15",
  "P2-17_DA_CHI": "Đã chi P2-17",
};

const issueDisplayLabels: Record<string, string> = {
  ...issueLabels,
  P2_02_TUITION_POLICY_NOT_READY:
    "Chính sách học phí P2-02 chưa sẵn sàng",
  P2_03_NO_RECEIVABLE: "Chưa tạo công nợ P2-03",
  P2_10_STILL_HAS_BALANCE: "Còn số dư phải thu sau Thu học phí (P2-10)",
  P2_13_NOT_FULLY_RECONCILED: "Còn tiền thu chưa vào kỳ đối soát P2-13",
  P2_14_RECONCILIATION_NOT_LOCKED: "Kỳ đối soát chưa khóa P2-14",
  P2_15_PAYMENT_REQUEST_NOT_CREATED: "Cần lập đề nghị chi P2-15",
  P2_16_PAYMENT_REQUEST_NOT_APPROVED: "Đề nghị chi chưa duyệt P2-16",
  P2_17_PAYMENT_NOT_COMPLETED: "Cần ghi nhận chi P2-17",
};

function money(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  const safeValue = Number.isFinite(numeric) ? numeric : 0;
  const formatted = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(safeValue);

  return `${formatted.replace(/\./g, " ")} đ`;
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
    return "/ttgdtx";
  }

  return value;
}

function issueText(code: string) {
  return issueDisplayLabels[code] ?? code;
}

function canOpenTtgdtxAccountingDashboard(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasPaymentManage: boolean,
  hasTtgdtxReportRead: boolean,
  hasLegacyReportsRead: boolean,
  hasReportsReadAll: boolean,
  hasReportsReadScope: boolean,
  hasAuditRead: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH" || hasReportsReadAll) {
    return true;
  }

  const hasDashboardPermission =
    hasPaymentManage ||
    hasTtgdtxReportRead ||
    hasLegacyReportsRead ||
    hasReportsReadScope ||
    hasAuditRead;

  return Boolean(
    segmentId &&
      hasDashboardPermission &&
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
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-4 text-3xl font-semibold ${tone}`}>{value}</p>
      <p className="mt-3 text-sm text-zinc-500">{hint}</p>
    </div>
  );
}

function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "danger" | "info";
}) {
  const tones = {
    neutral: "border-zinc-200 bg-zinc-50 text-zinc-700",
    good: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    info: "border-sky-200 bg-sky-50 text-sky-700",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-lg border px-3 py-1 text-sm ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function controlTone(
  control: ControlRow,
): "neutral" | "good" | "warn" | "danger" | "info" {
  if (control.control_status === "PASS") {
    return "good";
  }

  if (control.control_status === "CRITICAL" || control.severity === "CRITICAL") {
    return "danger";
  }

  if (control.severity === "HIGH") {
    return "warn";
  }

  return "info";
}

export default async function TtgdtxAccountingDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    roleResult,
    paymentPermissionResult,
    ttgdtxReportPermissionResult,
    legacyReportPermissionResult,
    reportsReadAllPermissionResult,
    reportsReadScopePermissionResult,
    auditReadPermissionResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.payment_request.manage",
    }),
    supabase.rpc("has_permission", { permission_name: "ttgdtx.report.read" }),
    supabase.rpc("has_permission", { permission_name: "reports.read" }),
    supabase.rpc("has_permission", { permission_name: "reports.read_all" }),
    supabase.rpc("has_permission", { permission_name: "reports.read_scope" }),
    supabase.rpc("has_permission", { permission_name: "audit.read" }),
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

  const segment = segmentResult.data;
  const roleCode = (roleResult.data as string | null) ?? null;
  const scopes = scopeResult.data ?? [];
  const canOpen = canOpenTtgdtxAccountingDashboard(
    segment?.id ?? null,
    roleCode,
    scopes,
    Boolean(paymentPermissionResult.data),
    Boolean(ttgdtxReportPermissionResult.data),
    Boolean(legacyReportPermissionResult.data),
    Boolean(reportsReadAllPermissionResult.data),
    Boolean(reportsReadScopePermissionResult.data),
    Boolean(auditReadPermissionResult.data),
  );
  let dataError: { message: string } | null = null;
  let controlError: { message: string } | null = null;
  let summary = emptySummary;
  let controls: ControlRow[] = [];
  let partners: PartnerRow[] = [];
  let exceptions: ExceptionRow[] = [];
  let movements: MovementRow[] = [];

  if (canOpen) {
    const [
      summaryResult,
      controlResult,
      partnerResult,
      exceptionResult,
      movementResult,
    ] = await Promise.all([
      supabase
        .from("ttgdtx_accounting_dashboard_summary")
        .select("*")
        .maybeSingle<SummaryRow>(),
      supabase
        .from("ttgdtx_accounting_dashboard_control_board")
        .select("*")
        .order("sort_order", { ascending: true })
        .returns<ControlRow[]>(),
      supabase
        .from("ttgdtx_accounting_dashboard_partner_board")
        .select("*")
        .order("partner_name", { ascending: true })
        .returns<PartnerRow[]>(),
      supabase
        .from("ttgdtx_accounting_dashboard_exception_board")
        .select("*")
        .limit(30)
        .returns<ExceptionRow[]>(),
      supabase
        .from("ttgdtx_accounting_dashboard_recent_movements")
        .select("*")
        .order("movement_at", { ascending: false })
        .limit(30)
        .returns<MovementRow[]>(),
    ]);

    dataError =
      summaryResult.error ??
      partnerResult.error ??
      exceptionResult.error ??
      movementResult.error;
    controlError = controlResult.error;
    summary = summaryResult.data ?? emptySummary;
    controls = controlResult.data ?? [];
    partners = partnerResult.data ?? [];
    exceptions = exceptionResult.data ?? [];
    movements = movementResult.data ?? [];
  }

  return (
    <AppShell
      active="ttgdtx"
      title="P2-18 · Dashboard kế toán TTGDTX"
      description="Tổng hợp hợp đồng, học phí, công nợ, thu tiền, đối soát, đề nghị chi, duyệt chi và chi tiền TTGDTX."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/accounting-dashboard"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests/pay">
              <Banknote className="size-4" />
              P2-17 chi tiền
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests/review">
              <ShieldCheck className="size-4" />
              P2-16 duyệt chi
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests">
              <WalletCards className="size-4" />
              P2-15 đề nghị chi
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/reconciliation/review">
              <Scale className="size-4" />
              P2-14 duyệt kỳ
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/reconciliation">
              <ReceiptText className="size-4" />
              P2-13 đối soát
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payments">
              <Banknote className="size-4" />
              Thu học phí (P2-10)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/accounting-dashboard">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-18">
              <FileSearch className="size-4" />
              Tìm P2-18
            </Link>
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <TtgdtxOperatingControlStrip currentCode="P2-18" />

        <TtgdtxDashboardReadonlyGuard />
        <TtgdtxDashboardUatEvidenceChecklist />

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <div className="flex gap-3">
            <LayoutDashboard className="mt-1 size-5 shrink-0" />
            <div>
              <h2 className="text-lg font-semibold">Nguyên tắc P2-18</h2>
              <p className="mt-2 text-sm leading-6">
                P2-18 là màn hình đọc và điều hành. Nếu số liệu sai, hệ thống chỉ
                đúng bước gốc cần xử lý: P2-01 hợp đồng, P2-02 học phí, P2-03
                công nợ, thu học phí (P2-10), đối soát (P2-13), khóa kỳ (P2-14), đề
                nghị chi, P2-16 duyệt chi hoặc P2-17 chi tiền. Dashboard không tự
                sửa dữ liệu tiền.
              </p>
            </div>
          </div>
        </section>

        {!canOpen ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-700">
            Tài khoản hiện tại chưa được mở quyền xem dashboard kế toán TTGDTX.
            Hãy kiểm tra phạm vi P0-13 hoặc quyền ttgdtx.report.read.
          </section>
        ) : null}

        {dataError ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-700">
            Chưa đọc được P2-18: {dataError.message}. Nếu vừa thêm P2-18, hãy
            chạy SQL step108 rồi tải lại trang.
          </section>
        ) : null}

        {canOpen ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="TTGDTX đang theo dõi"
                value={summary.partner_count}
                hint={`${summary.ready_partner_count} đủ nền hợp đồng/chính sách`}
              />
              <KpiCard
                label="Có cảnh báo"
                value={summary.partner_with_exception_count}
                hint="Cần quay lại đúng bước gốc để xử lý"
                tone={
                  count(summary.partner_with_exception_count) > 0
                    ? "text-amber-700"
                    : "text-emerald-700"
                }
              />
              <KpiCard
                label="Phải thu"
                value={money(summary.receivable_total_vnd)}
                hint={`Còn phải thu: ${money(summary.receivable_balance_vnd)}`}
              />
              <KpiCard
                label="Đã thu"
                value={money(summary.collected_total_vnd)}
                hint={`Thu học phí (P2-10) đã ghi nhận: ${money(summary.receivable_paid_vnd)}`}
                tone="text-emerald-700"
              />
              <KpiCard
                label="Đã khóa đối soát"
                value={money(summary.locked_reconciled_total_vnd)}
                hint="Dữ liệu đủ điều kiện sang đề nghị chi"
              />
              <KpiCard
                label="Đã đề nghị chi"
                value={money(summary.requested_total_vnd)}
                hint="Tạo từ kỳ đối soát đã khóa"
                tone="text-blue-700"
              />
              <KpiCard
                label="Đã duyệt chi"
                value={money(summary.approved_total_vnd)}
                hint="P2-16 đã kiểm/duyệt"
                tone="text-emerald-700"
              />
              <KpiCard
                label="Còn phải chi"
                value={money(summary.remaining_to_pay_vnd)}
                hint={`Đã chi: ${money(summary.disbursed_total_vnd)}`}
                tone={
                  count(summary.remaining_to_pay_vnd) > 0
                    ? "text-amber-700"
                    : "text-emerald-700"
                }
              />
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-200 p-5">
                <h2 className="text-xl font-semibold">Kiểm soát khớp số</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Các dòng này đối chiếu Công nợ (P2-03), Thu học phí (P2-10),
                  Đối soát (P2-13), Đề nghị chi (P2-15), Duyệt chi (P2-16) và
                  Chi tiền (P2-17).
                  để phát hiện chênh lệch trước khi kết luận dashboard đúng.
                </p>
              </div>

              {controlError ? (
                <div className="border-b border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                  Chưa đọc được bảng kiểm soát P2-18: {controlError.message}.
                  Hãy chạy step108 mới trên môi trường test trước khi UAT.
                </div>
              ) : null}

              {controls.length === 0 && !controlError ? (
                <div className="p-5 text-sm text-zinc-500">
                  Chưa có dòng kiểm soát P2-18.
                </div>
              ) : (
                <div className="grid gap-4 p-5 xl:grid-cols-2">
                  {controls.map((control) => (
                    <div
                      className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                      key={control.control_code}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={controlTone(control)}>
                          {control.control_status}
                        </StatusBadge>
                        <StatusBadge tone="neutral">
                          {control.source_step} -&gt; {control.target_step}
                        </StatusBadge>
                      </div>
                      <h3 className="mt-3 font-semibold">
                        {control.control_name}
                      </h3>
                      <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                        <p>
                          Goc: <b>{money(control.expected_total_vnd)}</b>
                        </p>
                        <p>
                          Doi chieu: <b>{money(control.actual_total_vnd)}</b>
                        </p>
                        <p
                          className={
                            count(control.affected_partner_count) > 0
                              ? "text-amber-700"
                              : "text-emerald-700"
                          }
                        >
                          Lech: <b>{money(control.variance_vnd)}</b>
                        </p>
                      </div>
                      <p className="mt-3 text-sm text-zinc-600">
                        {control.affected_partner_count} đối tác cần rà soát.
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        {control.guidance}
                      </p>
                      {control.control_status !== "PASS" ? (
                        <Button asChild className="mt-4" variant="outline">
                          <Link href={safeHref(control.action_href)}>
                            Mo buoc xu ly
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-200 p-5">
                <h2 className="text-xl font-semibold">Bảng điều hành theo TTGDTX</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Mỗi dòng là một đối tác/TTGDTX. Cột cuối cho biết bước cần làm
                  tiếp để dữ liệu không bị lệch.
                </p>
              </div>
              <div className="divide-y divide-zinc-200">
                {partners.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500">
                    Chưa có dữ liệu TTGDTX phù hợp trong phạm vi đang chọn.
                  </div>
                ) : (
                  partners.map((partner) => (
                    <div
                      key={partner.partner_id}
                      className="grid gap-4 p-5 xl:grid-cols-[1.1fr_1fr_1fr_1fr_auto]"
                    >
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge
                            tone={
                              count(partner.exception_count) > 0 ? "warn" : "good"
                            }
                          >
                            {count(partner.exception_count) > 0
                              ? `${partner.exception_count} cảnh báo`
                              : "Đang ổn"}
                          </StatusBadge>
                          <StatusBadge tone="neutral">
                            {partner.partner_code ?? "Chưa có mã"}
                          </StatusBadge>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold">
                          {partner.partner_name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          {partner.area ?? "Chưa rõ khu vực"} · cập nhật{" "}
                          {formatDateTime(partner.updated_at)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-zinc-50 p-4">
                        <p className="text-xs font-semibold uppercase text-zinc-500">
                          Nền kiểm soát
                        </p>
                        <p className="mt-2 text-sm">
                          Hợp đồng: {partner.contract_ready_count}/
                          {partner.contract_count}
                        </p>
                        <p className="mt-1 text-sm">
                          Học phí: {partner.policy_ready_count}/
                          {partner.policy_count}
                        </p>
                      </div>

                      <div className="rounded-lg bg-zinc-50 p-4">
                        <p className="text-xs font-semibold uppercase text-zinc-500">
                          Thu học phí
                        </p>
                        <p className="mt-2 text-sm">
                          Phải thu: <b>{money(partner.receivable_total_vnd)}</b>
                        </p>
                        <p className="mt-1 text-sm text-emerald-700">
                          Đã thu: <b>{money(partner.collected_total_vnd)}</b>
                        </p>
                        <p className="mt-1 text-sm text-amber-700">
                          Còn thu: <b>{money(partner.receivable_balance_vnd)}</b>
                        </p>
                      </div>

                      <div className="rounded-lg bg-zinc-50 p-4">
                        <p className="text-xs font-semibold uppercase text-zinc-500">
                          Đối soát / chi trả
                        </p>
                        <p className="mt-2 text-sm">
                          Đã khóa:{" "}
                          <b>{money(partner.locked_reconciled_total_vnd)}</b>
                        </p>
                        <p className="mt-1 text-sm">
                          Đã duyệt: <b>{money(partner.approved_total_vnd)}</b>
                        </p>
                        <p className="mt-1 text-sm text-emerald-700">
                          Đã chi: <b>{money(partner.disbursed_total_vnd)}</b>
                        </p>
                      </div>

                      <div className="flex flex-col justify-center gap-2">
                        <Button asChild>
                          <Link href={safeHref(partner.next_step_href)}>
                            {partner.next_step_label}
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                        {partner.blocking_items?.length ? (
                          <div className="space-y-1 text-sm text-amber-800">
                            {partner.blocking_items.map((item) => (
                              <p key={item} className="flex gap-2">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                {issueText(item)}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="flex gap-2 text-sm text-emerald-700">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                            Không có lỗi chặn.
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-200 p-5">
                  <h2 className="text-xl font-semibold">Cảnh báo cần xử lý</h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    Danh sách này giúp cấp quản lý nhìn đúng nút thắt hiện tại.
                  </p>
                </div>
                <div className="divide-y divide-zinc-200">
                  {exceptions.length === 0 ? (
                    <div className="p-6 text-sm text-emerald-700">
                      Không có cảnh báo kế toán TTGDTX.
                    </div>
                  ) : (
                    exceptions.map((item) => (
                      <div key={item.partner_id} className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <StatusBadge tone="warn">
                              {item.exception_count} cảnh báo
                            </StatusBadge>
                            <h3 className="mt-3 font-semibold">{item.partner_name}</h3>
                            <p className="mt-1 text-sm text-zinc-500">
                              {item.partner_code ?? "Chưa có mã"} ·{" "}
                              {item.area ?? "Chưa rõ khu vực"}
                            </p>
                          </div>
                          <Button asChild variant="outline">
                            <Link href={safeHref(item.next_step_href)}>
                              {item.next_step_label}
                              <ArrowRight className="size-4" />
                            </Link>
                          </Button>
                        </div>
                        {item.blocking_items?.length ? (
                          <div className="mt-4 grid gap-2 text-sm text-amber-800">
                            {item.blocking_items.map((issue) => (
                              <p key={issue} className="flex gap-2">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                {issueText(issue)}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-200 p-5">
                  <h2 className="text-xl font-semibold">Nhật ký tiền gần đây</h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    Gồm công nợ, thu tiền, đối soát, đề nghị chi và chi tiền.
                  </p>
                </div>
                <div className="divide-y divide-zinc-200">
                  {movements.length === 0 ? (
                    <div className="p-6 text-sm text-zinc-500">
                      Chưa có phát sinh kế toán TTGDTX.
                    </div>
                  ) : (
                    movements.map((movement) => (
                      <div key={movement.movement_code} className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <StatusBadge tone="info">
                              {movementDisplayLabels[movement.movement_type] ??
                                movement.movement_type}
                            </StatusBadge>
                            <h3 className="mt-3 font-semibold">
                              {movement.partner_name}
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500">
                              {movement.movement_code} ·{" "}
                              {movement.period_label ?? "Chưa có kỳ"} ·{" "}
                              {formatDateTime(movement.movement_at)}
                            </p>
                          </div>
                          <p className="text-lg font-semibold">
                            {money(movement.amount_vnd)}
                          </p>
                        </div>
                        <p className="mt-3 text-sm text-zinc-500">
                          Trạng thái: {movement.status} · Người ghi:{" "}
                          {movement.actor_name ?? "Chưa có"}
                        </p>
                        {movement.evidence_url ? (
                          <Button asChild variant="outline" className="mt-3">
                            <Link href={movement.evidence_url}>Mở minh chứng</Link>
                          </Button>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
