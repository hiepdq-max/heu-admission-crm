import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  FileWarning,
  GraduationCap,
  Landmark,
  ReceiptText,
  RefreshCcw,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { HouClaimReviewForm } from "@/components/hou/hou-claim-review-form";
import {
  HouPaymentBatches,
  type HouPaymentBatchRow,
  type HouPaymentCandidateRow,
} from "@/components/hou/hou-payment-batches";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type HouLeadRow = {
  id: string;
  lead_code: string;
  student_name: string;
  student_phone: string | null;
  status: string;
  priority: string;
  interested_program: string | null;
  interested_major: string | null;
  assigned_to: string | null;
  next_followup_at: string | null;
  updated_at: string;
  hou_program_id: string | null;
  hou_major_id: string | null;
  hou_location_id: string | null;
  hou_stage_id: string | null;
  hou_admission_system_status: string | null;
  hou_admission_system_synced_at: string | null;
  hou_first_term_tuition_confirmed: boolean;
  hou_first_term_tuition_confirmed_at: string | null;
  hou_enrollment_recorded_at: string | null;
};

type LookupRow = {
  id: string;
  label: string;
};

type HouEvidenceRow = {
  id: string;
  lead_id: string | null;
  claim_id: string | null;
  evidence_type: string;
  confidential_level: string;
  status: string;
  created_at: string;
};

type HouClaimRow = {
  id: string;
  lead_id: string | null;
  payee_id: string | null;
  classification: string;
  hou_student_code: string | null;
  student_name: string;
  claim_status: string;
  dropout_risk_level: string;
  breakeven_status: string;
  debt_offset_amount_vnd: number;
  commission_base_date: string;
  created_at: string;
  approved_at: string | null;
  paid_at: string | null;
};

type HouClaimLineRow = {
  id: string;
  claim_id: string;
  component_name: string;
  gross_amount_vnd: number;
  tax_withheld_vnd: number;
  debt_offset_amount_vnd: number;
  net_amount_vnd: number;
  line_status: string;
};

type HouPaymentLineRow = {
  id: string;
  payment_batch_id: string;
  claim_line_id: string;
  paid_amount_vnd: number;
  status: string;
};

type HouPaymentBatchRawRow = {
  id: string;
  payment_batch_code: string;
  payment_batch_name: string;
  payment_method: string;
  status: string;
  accounting_voucher_no: string | null;
  total_gross_vnd: number;
  total_tax_withheld_vnd: number;
  total_debt_offset_vnd: number;
  total_net_vnd: number;
  requested_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  note: string | null;
  created_at: string;
};

type HouTuitionCreditRateRow = {
  id: string;
  program_id: string | null;
  major_id: string | null;
  rate_code: string;
  rate_name: string;
  tuition_per_credit_vnd: number;
  effective_from: string;
  effective_to: string | null;
  status: string;
};

type HouRevenueShareVersionRow = {
  id: string;
  program_id: string | null;
  share_code: string;
  share_name: string;
  heu_share_percent: number;
  hou_share_percent: number;
  effective_from: string;
  effective_to: string | null;
  status: string;
};

type HouBreakevenCheckRow = {
  id: string;
  claim_id: string;
  credit_count: number | null;
  tuition_per_credit_vnd: number | null;
  expected_tuition_vnd: number | null;
  heu_share_percent: number | null;
  expected_heu_revenue_vnd: number | null;
  total_commission_cost_vnd: number;
  other_cost_vnd: number;
  breakeven_margin_vnd: number | null;
  result: string;
  checked_at: string | null;
  note: string | null;
};

type UserLookupRow = {
  id: string;
  full_name: string | null;
  role_id: string | null;
};

type RoleLookupRow = {
  id: string;
  code: string;
};

type QualityRow = {
  lead: HouLeadRow;
  issues: string[];
  evidenceCount: number;
  claimCount: number;
};

type HouCommissionReportStats = {
  totalGrossVnd: number;
  totalTaxWithheldVnd: number;
  totalDebtOffsetVnd: number;
  totalNetVnd: number;
  paidNetVnd: number;
  unpaidNetVnd: number;
  readyToPayVnd: number;
  inPaymentBatchVnd: number;
  expectedHeuRevenueVnd: number;
  breakevenMarginVnd: number | null;
  breakevenCheckedCount: number;
  breakevenMissingCount: number;
  breakevenRiskCount: number;
};

type HouCommissionRiskRow = {
  claim: HouClaimRow;
  reasons: string[];
  totalNetVnd: number;
  paidNetVnd: number;
  breakeven?: HouBreakevenCheckRow;
};

const statusLabels: Record<string, string> = {
  NEW: "Lead mới",
  ASSIGNED: "Đã phân tư vấn",
  CONTACTED: "Đã liên hệ",
  INTERESTED: "Có quan tâm",
  FOLLOW_UP: "Cần chăm sóc",
  VISITED: "Đã đến trường",
  DOCUMENT_PENDING: "Chờ hồ sơ",
  DOCUMENT_SUBMITTED: "Đã nộp hồ sơ",
  ELIGIBLE: "Đủ điều kiện",
  ENROLLED: "Đã nhập học",
  LOST: "Không đăng ký",
  DUPLICATE: "Trùng lead",
};

const claimStatusClasses: Record<string, string> = {
  ELIGIBLE: "bg-sky-50 text-sky-700",
  REVIEWING: "bg-violet-50 text-violet-700",
  RISK_HOLD: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  PAID: "bg-green-50 text-green-700",
  REJECTED: "bg-rose-50 text-rose-700",
  DRAFT: "bg-zinc-100 text-zinc-700",
};

function toLookup<T extends Record<string, unknown>>(
  rows: T[] | null,
  labelKey: keyof T,
): LookupRow[] {
  return (rows ?? []).map((row) => ({
    id: String(row.id),
    label: String(row[labelKey] ?? ""),
  }));
}

function toMap(rows: LookupRow[]) {
  return new Map(rows.map((row) => [row.id, row.label]));
}

function normalizeText(value: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isHouLead(lead: HouLeadRow) {
  const searchText = normalizeText(
    [lead.interested_program, lead.interested_major].filter(Boolean).join(" "),
  );

  return Boolean(
    lead.hou_program_id ||
      lead.hou_major_id ||
      lead.hou_location_id ||
      lead.hou_stage_id ||
      searchText.includes("hou") ||
      searchText.includes("lien thong") ||
      searchText.includes("dai hoc tu xa"),
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function percent(count: number, total: number) {
  if (total <= 0) {
    return "0.0%";
  }

  return `${((count / total) * 100).toFixed(1)}%`;
}

function percentValue(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Chưa có";
  }

  return `${Number(value).toFixed(2)}%`;
}

function numberValue(value: number | null | undefined) {
  return Number(value ?? 0);
}

function sumBy<T>(rows: T[], getValue: (row: T) => number | null | undefined) {
  return rows.reduce((total, row) => total + numberValue(getValue(row)), 0);
}

function isActiveOnDate(
  row: { effective_from: string; effective_to: string | null; status: string },
  date: Date,
) {
  const day = date.toISOString().slice(0, 10);

  return (
    row.status === "ACTIVE" &&
    row.effective_from <= day &&
    (!row.effective_to || row.effective_to >= day)
  );
}

function groupCount<T>(
  rows: T[],
  getKey: (row: T) => string,
  getLabel: (key: string) => string,
) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const key = getKey(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      label: getLabel(key),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function countByLead<T extends { lead_id: string | null }>(rows: T[]) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    if (!row.lead_id) {
      continue;
    }

    counts.set(row.lead_id, (counts.get(row.lead_id) ?? 0) + 1);
  }

  return counts;
}

function getLeadIssues(
  lead: HouLeadRow,
  evidenceCount: number,
  claimCount: number,
) {
  const issues: string[] = [];

  if (!lead.hou_program_id) {
    issues.push("Thiếu chương trình HOU");
  }

  if (!lead.hou_major_id) {
    issues.push("Thiếu ngành HOU");
  }

  if (!lead.hou_location_id) {
    issues.push("Thiếu địa điểm học");
  }

  if (!lead.hou_stage_id) {
    issues.push("Thiếu bước xử lý HOU");
  }

  if (!lead.hou_first_term_tuition_confirmed) {
    issues.push("Chưa xác nhận học phí kỳ đầu");
  }

  if (evidenceCount === 0) {
    issues.push("Chưa có minh chứng HOU");
  }

  if (lead.hou_first_term_tuition_confirmed && claimCount === 0) {
    issues.push("Đã có học phí nhưng chưa có claim COM");
  }

  return issues;
}

function KpiCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 inline-flex rounded-md border px-2 py-1 text-xs font-medium ${tone}`}>
        {label}
      </div>
      <p className="text-3xl font-semibold tracking-normal">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{note}</p>
    </article>
  );
}

function CountTable({
  title,
  description,
  rows,
  emptyText,
}: {
  title: string;
  description: string;
  rows: { key: string; label: string; count: number }[];
  emptyText: string;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Nhóm</th>
              <th className="px-5 py-3">Số lead</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rows.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-center text-zinc-500" colSpan={2}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key}>
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    {row.label}
                  </td>
                  <td className="px-5 py-4 text-zinc-700">{row.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function HouCommissionReport({
  stats,
  currentRevenueShare,
  tuitionRates,
  canSeeStrategy,
}: {
  stats: HouCommissionReportStats;
  currentRevenueShare?: HouRevenueShareVersionRow;
  tuitionRates: HouTuitionCreditRateRow[];
  canSeeStrategy: boolean;
}) {
  const hasBreakevenData = stats.breakevenCheckedCount > 0;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <CircleDollarSign className="size-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Báo cáo COM HOU</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Tổng hợp tiền COM, công nợ, trạng thái chi trả và cảnh báo hòa vốn từ
              dữ liệu Supabase.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <ReceiptText className="size-4" />
            Tổng COM net
          </div>
          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(stats.totalNetVnd)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Gross {formatCurrency(stats.totalGrossVnd)}, thuế{" "}
            {formatCurrency(stats.totalTaxWithheldVnd)}
          </p>
        </div>

        <div className="rounded-md bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-emerald-700">
            <Banknote className="size-4" />
            Đã chi
          </div>
          <p className="mt-3 text-2xl font-semibold text-emerald-900">
            {formatCurrency(stats.paidNetVnd)}
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Chỉ tính các dòng thanh toán trạng thái PAID.
          </p>
        </div>

        <div className="rounded-md bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-amber-700">
            <Landmark className="size-4" />
            Còn treo / chờ chi
          </div>
          <p className="mt-3 text-2xl font-semibold text-amber-900">
            {formatCurrency(stats.unpaidNetVnd)}
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Sẵn sàng lập kỳ: {formatCurrency(stats.readyToPayVnd)}. Đang trong kỳ:{" "}
            {formatCurrency(stats.inPaymentBatchVnd)}.
          </p>
        </div>

        <div className="rounded-md bg-rose-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-rose-700">
            <TrendingDown className="size-4" />
            Hòa vốn
          </div>
          <p className="mt-3 text-2xl font-semibold text-rose-900">
            {canSeeStrategy && hasBreakevenData
              ? formatCurrency(stats.breakevenMarginVnd ?? 0)
              : "Chưa đủ dữ liệu"}
          </p>
          <p className="mt-1 text-xs text-rose-700">
            {canSeeStrategy
              ? `Doanh thu HEU dự kiến ${formatCurrency(stats.expectedHeuRevenueVnd)}. ${formatNumber(stats.breakevenRiskCount)} claim dưới/rủi ro hòa vốn, ${formatNumber(stats.breakevenMissingCount)} claim chưa kiểm tra.`
              : "Tỷ lệ HEU-HOU và hòa vốn chỉ hiển thị cho nhóm quản trị được phép."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 border-t border-zinc-200 p-5 lg:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase text-zinc-500">
            Bù trừ công nợ
          </p>
          <p className="mt-2 text-lg font-semibold">
            {formatCurrency(stats.totalDebtOffsetVnd)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Theo dõi riêng để kế toán đối soát trước khi chi.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-zinc-500">
            Đơn giá tín chỉ HOU
          </p>
          <p className="mt-2 text-lg font-semibold">
            {formatNumber(tuitionRates.length)} biểu giá
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Học phí HOU tính theo tín chỉ, cần chọn đúng biểu giá theo thời điểm.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-zinc-500">
            Tỷ lệ HEU/HOU hiện hành
          </p>
          <p className="mt-2 text-lg font-semibold">
            {canSeeStrategy && currentRevenueShare
              ? `HEU ${percentValue(currentRevenueShare.heu_share_percent)}`
              : "Ẩn theo quyền"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {canSeeStrategy && currentRevenueShare
              ? `${currentRevenueShare.share_code} · hiệu lực từ ${formatDateTime(`${currentRevenueShare.effective_from}T00:00:00`)}`
              : "Chỉ Admin, BGH hoặc Trưởng phòng tuyển sinh được xem tỷ lệ hợp tác."}
          </p>
        </div>
      </div>
    </section>
  );
}

function HouCommissionRiskTable({
  rows,
  canSeeStrategy,
}: {
  rows: HouCommissionRiskRow[];
  canSeeStrategy: boolean;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-50">
            <ShieldAlert className="size-5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              Cảnh báo rủi ro COM HOU
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Ưu tiên soát các claim có nguy cơ bỏ học, thiếu kiểm tra hòa vốn,
              còn treo thanh toán hoặc có bù trừ công nợ.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Học viên</th>
              <th className="px-5 py-3">Cảnh báo</th>
              <th className="px-5 py-3">COM net</th>
              <th className="px-5 py-3">Đã chi</th>
              <th className="px-5 py-3">Hòa vốn</th>
              <th className="px-5 py-3">Lead</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rows.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-center text-zinc-500" colSpan={6}>
                  Chưa có cảnh báo rủi ro COM HOU.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.claim.id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-900">
                      {row.claim.student_name}
                    </p>
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                      {row.claim.hou_student_code ?? "Chưa có mã SV HOU"}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {row.claim.claim_status} · rủi ro{" "}
                      {row.claim.dropout_risk_level}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {row.reasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-zinc-950">
                    {formatCurrency(row.totalNetVnd)}
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {formatCurrency(row.paidNetVnd)}
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {canSeeStrategy ? (
                      <>
                        <p>{row.breakeven?.result ?? "Chưa kiểm tra"}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Margin:{" "}
                          {row.breakeven?.breakeven_margin_vnd === null ||
                          row.breakeven?.breakeven_margin_vnd === undefined
                            ? "Chưa có"
                            : formatCurrency(row.breakeven.breakeven_margin_vnd)}
                        </p>
                      </>
                    ) : (
                      "Ẩn theo quyền"
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {row.claim.lead_id ? (
                      <Link
                        href={`/leads/${row.claim.lead_id}`}
                        className="inline-flex items-center gap-1 text-zinc-950 hover:underline"
                      >
                        Mở lead
                        <ExternalLink className="size-3.5" />
                      </Link>
                    ) : (
                      <span className="text-zinc-500">Không gắn lead</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function QualityTable({
  rows,
  userMap,
  majorMap,
  stageMap,
}: {
  rows: QualityRow[];
  userMap: Map<string, string>;
  majorMap: Map<string, string>;
  stageMap: Map<string, string>;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Lead HOU cần bổ sung dữ liệu</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Ưu tiên các lead thiếu chương trình, ngành, địa điểm, minh chứng hoặc
            dữ liệu học phí.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/leads">
            <ExternalLink className="size-4" />
            Danh sách lead
          </Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Lead</th>
              <th className="px-5 py-3">HOU hiện tại</th>
              <th className="px-5 py-3">Người phụ trách</th>
              <th className="px-5 py-3">Thiếu / cảnh báo</th>
              <th className="px-5 py-3">Minh chứng</th>
              <th className="px-5 py-3">Claim COM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rows.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-center text-zinc-500" colSpan={6}>
                  Chưa có lead HOU nào cần bổ sung dữ liệu.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.lead.id} className="align-top">
                  <td className="px-5 py-4">
                    <Link
                      href={`/leads/${row.lead.id}`}
                      className="font-medium text-zinc-950 hover:underline"
                    >
                      {row.lead.student_name}
                    </Link>
                    <p className="mt-1 text-xs text-zinc-500">
                      {row.lead.lead_code} · {row.lead.student_phone ?? "Chưa có SĐT"}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {statusLabels[row.lead.status] ?? row.lead.status}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-900">
                      {row.lead.hou_major_id
                        ? majorMap.get(row.lead.hou_major_id) ?? "Không rõ ngành"
                        : "Chưa chọn ngành"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Bước:{" "}
                      {row.lead.hou_stage_id
                        ? stageMap.get(row.lead.hou_stage_id) ?? "Không rõ bước"
                        : "Chưa chọn"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Hệ thống HOU: {row.lead.hou_admission_system_status ?? "Chưa nhập"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {row.lead.assigned_to
                      ? userMap.get(row.lead.assigned_to) ?? "Không rõ"
                      : "Chưa phân công"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {row.issues.map((issue) => (
                        <span
                          key={issue}
                          className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"
                        >
                          {issue}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {row.evidenceCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="size-3.5" />
                        {row.evidenceCount} file
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                        <FileWarning className="size-3.5" />
                        Chưa có
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {row.claimCount > 0 ? `${row.claimCount} claim` : "Chưa có"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ClaimTable({
  claims,
  canSeeFinancial,
  canReviewCom,
}: {
  claims: HouClaimRow[];
  canSeeFinancial: boolean;
  canReviewCom: boolean;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <h2 className="text-base font-semibold">Claim COM HOU cần xử lý</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Theo dõi claim đang chờ duyệt, đang rà soát rủi ro hoặc cần kế toán xử lý.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Học viên</th>
              <th className="px-5 py-3">Phân loại</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Rủi ro</th>
              <th className="px-5 py-3">Ngày tính COM</th>
              {canSeeFinancial ? <th className="px-5 py-3">Công nợ/bù trừ</th> : null}
              <th className="px-5 py-3">Lead</th>
              <th className="px-5 py-3">Xử lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {claims.length === 0 ? (
              <tr>
                <td
                  className="px-5 py-6 text-center text-zinc-500"
                  colSpan={canSeeFinancial ? 8 : 7}
                >
                  Chưa có claim COM HOU cần xử lý theo quyền hiện tại.
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr key={claim.id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-900">{claim.student_name}</p>
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                      {claim.hou_student_code ?? "Chưa có mã SV HOU"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-zinc-700">{claim.classification}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-medium ${
                        claimStatusClasses[claim.claim_status] ??
                        "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {claim.claim_status}
                    </span>
                    <p className="mt-2 text-xs text-zinc-500">
                      Breakeven: {claim.breakeven_status}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-medium ${
                        claim.dropout_risk_level === "HIGH" ||
                        claim.dropout_risk_level === "LEFT"
                          ? "bg-rose-50 text-rose-700"
                          : claim.dropout_risk_level === "MEDIUM"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {claim.dropout_risk_level}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {formatDateTime(`${claim.commission_base_date}T00:00:00`)}
                  </td>
                  {canSeeFinancial ? (
                    <td className="px-5 py-4 text-zinc-700">
                      {formatCurrency(claim.debt_offset_amount_vnd)}
                    </td>
                  ) : null}
                  <td className="px-5 py-4">
                    {claim.lead_id ? (
                      <Link
                        href={`/leads/${claim.lead_id}`}
                        className="inline-flex items-center gap-1 text-zinc-950 hover:underline"
                      >
                        Mở lead
                        <ExternalLink className="size-3.5" />
                      </Link>
                    ) : (
                      <span className="text-zinc-500">Không gắn lead</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {canReviewCom ? (
                      <HouClaimReviewForm
                        claimId={claim.id}
                        currentStatus={claim.claim_status}
                      />
                    ) : (
                      <span className="text-xs text-zinc-500">
                        Không có quyền xử lý
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function HouControlPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    leadsResult,
    programsResult,
    majorsResult,
    locationsResult,
    stagesResult,
    usersResult,
    rolesResult,
  ] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id,lead_code,student_name,student_phone,status,priority,interested_program,interested_major,assigned_to,next_followup_at,updated_at,hou_program_id,hou_major_id,hou_location_id,hou_stage_id,hou_admission_system_status,hou_admission_system_synced_at,hou_first_term_tuition_confirmed,hou_first_term_tuition_confirmed_at,hou_enrollment_recorded_at",
      )
      .eq("is_deleted", false)
      .order("updated_at", { ascending: false })
      .limit(5000)
      .returns<HouLeadRow[]>(),
    supabase.from("hou_programs").select("id,program_name"),
    supabase.from("hou_majors").select("id,major_code,major_name"),
    supabase.from("hou_locations").select("id,location_name"),
    supabase.from("hou_admission_stages").select("id,stage_name"),
    supabase.from("users_profile").select("id,full_name,role_id").returns<UserLookupRow[]>(),
    supabase.from("roles").select("id,code").returns<RoleLookupRow[]>(),
  ]);

  const allLeads = leadsResult.data ?? [];
  const houLeads = allLeads.filter(isHouLead);
  const leadIds = houLeads.map((lead) => lead.id);

  const [evidenceResult, claimsResult] =
    leadIds.length > 0
      ? await Promise.all([
          supabase
            .from("hou_evidence_files")
            .select(
              "id,lead_id,claim_id,evidence_type,confidential_level,status,created_at",
            )
            .in("lead_id", leadIds)
            .eq("status", "ACTIVE")
            .returns<HouEvidenceRow[]>(),
          supabase
            .from("hou_commission_claims")
            .select(
              "id,lead_id,payee_id,classification,hou_student_code,student_name,claim_status,dropout_risk_level,breakeven_status,debt_offset_amount_vnd,commission_base_date,created_at,approved_at,paid_at",
            )
            .in("lead_id", leadIds)
            .neq("claim_status", "CANCELLED")
            .order("created_at", { ascending: false })
            .returns<HouClaimRow[]>(),
        ])
      : [
          { data: [] as HouEvidenceRow[], error: null },
          { data: [] as HouClaimRow[], error: null },
        ];

  const userRows = usersResult.data ?? [];
  const roleRows = rolesResult.data ?? [];
  const currentUserProfile = userRows.find((profile) => profile.id === user.id);
  const currentRoleCode =
    roleRows.find((role) => role.id === currentUserProfile?.role_id)?.code ?? "";
  const canSeeFinancial = [
    "ADMIN",
    "BGH",
    "ADMISSION_HEAD",
    "ACCOUNTING",
  ].includes(currentRoleCode);
  const canReviewCom = canSeeFinancial;
  const canSeeStrategy = ["ADMIN", "BGH", "ADMISSION_HEAD"].includes(
    currentRoleCode,
  );

  const programMap = toMap(toLookup(programsResult.data, "program_name"));
  const majorMap = new Map(
    (majorsResult.data ?? []).map((row) => [
      String(row.id),
      `${row.major_code} - ${row.major_name}`,
    ]),
  );
  const locationMap = toMap(toLookup(locationsResult.data, "location_name"));
  const stageMap = toMap(toLookup(stagesResult.data, "stage_name"));
  const userMap = new Map(
    userRows.map((row) => [row.id, row.full_name ?? "Chưa đặt tên"]),
  );

  const evidenceRows = evidenceResult.data ?? [];
  const claimRows = claimsResult.data ?? [];
  const claimIds = claimRows.map((claim) => claim.id);
  const [claimLinesResult, paymentLinesResult, paymentBatchesResult] =
    canSeeFinancial && claimIds.length > 0
      ? await Promise.all([
          supabase
            .from("hou_commission_claim_lines")
            .select(
              "id,claim_id,component_name,gross_amount_vnd,tax_withheld_vnd,debt_offset_amount_vnd,net_amount_vnd,line_status",
            )
            .in("claim_id", claimIds)
            .returns<HouClaimLineRow[]>(),
          supabase
            .from("hou_commission_payment_lines")
            .select("id,payment_batch_id,claim_line_id,paid_amount_vnd,status")
            .neq("status", "CANCELLED")
            .returns<HouPaymentLineRow[]>(),
          supabase
            .from("hou_commission_payment_batches")
            .select(
              "id,payment_batch_code,payment_batch_name,payment_method,status,accounting_voucher_no,total_gross_vnd,total_tax_withheld_vnd,total_debt_offset_vnd,total_net_vnd,requested_at,approved_at,paid_at,note,created_at",
            )
            .order("created_at", { ascending: false })
            .limit(20)
            .returns<HouPaymentBatchRawRow[]>(),
        ])
      : [
          { data: [] as HouClaimLineRow[], error: null },
          { data: [] as HouPaymentLineRow[], error: null },
          { data: [] as HouPaymentBatchRawRow[], error: null },
        ];
  const tuitionRatesResult = canSeeFinancial
    ? await supabase
        .from("hou_tuition_credit_rates")
        .select(
          "id,program_id,major_id,rate_code,rate_name,tuition_per_credit_vnd,effective_from,effective_to,status",
        )
        .eq("status", "ACTIVE")
        .order("effective_from", { ascending: false })
        .returns<HouTuitionCreditRateRow[]>()
    : { data: [] as HouTuitionCreditRateRow[], error: null };
  const [revenueSharesResult, breakevenChecksResult] =
    canSeeStrategy
      ? await Promise.all([
          supabase
            .from("hou_revenue_share_versions")
            .select(
              "id,program_id,share_code,share_name,heu_share_percent,hou_share_percent,effective_from,effective_to,status",
            )
            .eq("status", "ACTIVE")
            .order("effective_from", { ascending: false })
            .returns<HouRevenueShareVersionRow[]>(),
          claimIds.length > 0
            ? supabase
                .from("hou_commission_breakeven_checks")
                .select(
                  "id,claim_id,credit_count,tuition_per_credit_vnd,expected_tuition_vnd,heu_share_percent,expected_heu_revenue_vnd,total_commission_cost_vnd,other_cost_vnd,breakeven_margin_vnd,result,checked_at,note",
                )
                .in("claim_id", claimIds)
                .eq("status", "ACTIVE")
                .returns<HouBreakevenCheckRow[]>()
            : Promise.resolve({
                data: [] as HouBreakevenCheckRow[],
                error: null,
              }),
        ])
      : [
          { data: [] as HouRevenueShareVersionRow[], error: null },
          { data: [] as HouBreakevenCheckRow[], error: null },
        ];
  const claimLineRows = claimLinesResult.data ?? [];
  const paymentLineRows = paymentLinesResult.data ?? [];
  const paymentBatchRows = paymentBatchesResult.data ?? [];
  const tuitionRateRows = tuitionRatesResult.data ?? [];
  const revenueShareRows = revenueSharesResult.data ?? [];
  const breakevenRows = breakevenChecksResult.data ?? [];
  const activePaymentLineIds = new Set(
    paymentLineRows.map((line) => line.claim_line_id),
  );
  const claimMap = new Map(claimRows.map((claim) => [claim.id, claim]));
  const paymentCandidates: HouPaymentCandidateRow[] = claimLineRows
    .filter(
      (line) =>
        line.line_status === "APPROVED" && !activePaymentLineIds.has(line.id),
    )
    .map((line) => {
      const claim = claimMap.get(line.claim_id);

      return {
        claimLineId: line.id,
        claimId: line.claim_id,
        studentName: claim?.student_name ?? "Không rõ học viên",
        houStudentCode: claim?.hou_student_code ?? null,
        classification: claim?.classification ?? "N/A",
        componentName: line.component_name,
        grossAmountVnd: line.gross_amount_vnd,
        taxWithheldVnd: line.tax_withheld_vnd,
        debtOffsetAmountVnd: line.debt_offset_amount_vnd,
        netAmountVnd: line.net_amount_vnd,
        claimStatus: claim?.claim_status ?? "N/A",
        lineStatus: line.line_status,
      };
    });
  const paymentLineCountByBatch = new Map<string, number>();

  for (const line of paymentLineRows) {
    paymentLineCountByBatch.set(
      line.payment_batch_id,
      (paymentLineCountByBatch.get(line.payment_batch_id) ?? 0) + 1,
    );
  }

  const paymentBatches: HouPaymentBatchRow[] = paymentBatchRows.map((batch) => ({
    ...batch,
    line_count: paymentLineCountByBatch.get(batch.id) ?? 0,
  }));
  const now = new Date();
  const defaultBatchCode = `HOU-COM-${now.getFullYear()}${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}-${String(paymentBatches.length + 1).padStart(2, "0")}`;
  const defaultBatchName = `Kỳ thanh toán COM HOU ${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}/${now.getFullYear()}`;
  const activeClaimLineRows = claimLineRows.filter(
    (line) => line.line_status !== "CANCELLED",
  );
  const paidPaymentLineRows = paymentLineRows.filter(
    (line) => line.status === "PAID",
  );
  const inPaymentBatchRows = paymentLineRows.filter(
    (line) => line.status !== "PAID" && line.status !== "CANCELLED",
  );
  const claimLineById = new Map(claimLineRows.map((line) => [line.id, line]));
  const claimLinesByClaim = new Map<string, HouClaimLineRow[]>();

  for (const line of activeClaimLineRows) {
    const rows = claimLinesByClaim.get(line.claim_id) ?? [];
    rows.push(line);
    claimLinesByClaim.set(line.claim_id, rows);
  }

  const paidNetByClaim = new Map<string, number>();

  for (const line of paidPaymentLineRows) {
    const claimId = claimLineById.get(line.claim_line_id)?.claim_id;

    if (!claimId) {
      continue;
    }

    paidNetByClaim.set(
      claimId,
      (paidNetByClaim.get(claimId) ?? 0) + line.paid_amount_vnd,
    );
  }

  const breakevenByClaim = new Map(
    breakevenRows.map((row) => [row.claim_id, row]),
  );
  const currentRevenueShare = revenueShareRows.find((row) =>
    isActiveOnDate(row, now),
  );
  const activeBreakevenRows = breakevenRows.filter(
    (row) => row.result !== "NOT_CALCULATED",
  );
  const breakevenRiskCount = claimRows.filter((claim) => {
    const check = breakevenByClaim.get(claim.id);

    return (
      ["BELOW_BREAKEVEN", "RISK"].includes(claim.breakeven_status) ||
      ["BELOW_BREAKEVEN", "RISK"].includes(check?.result ?? "")
    );
  }).length;
  const breakevenMissingCount = claimRows.filter(
    (claim) =>
      ["ELIGIBLE", "REVIEWING", "RISK_HOLD", "APPROVED", "PAID"].includes(
        claim.claim_status,
      ) && !breakevenByClaim.has(claim.id),
  ).length;
  const breakevenMarginValues = breakevenRows
    .map((row) => {
      if (row.breakeven_margin_vnd !== null) {
        return row.breakeven_margin_vnd;
      }

      if (row.expected_heu_revenue_vnd === null) {
        return null;
      }

      return (
        row.expected_heu_revenue_vnd -
        row.total_commission_cost_vnd -
        row.other_cost_vnd
      );
    })
    .filter((value): value is number => value !== null);
  const totalNetVnd = sumBy(activeClaimLineRows, (line) => line.net_amount_vnd);
  const paidNetVnd = sumBy(paidPaymentLineRows, (line) => line.paid_amount_vnd);
  const houCommissionStats: HouCommissionReportStats = {
    totalGrossVnd: sumBy(activeClaimLineRows, (line) => line.gross_amount_vnd),
    totalTaxWithheldVnd: sumBy(
      activeClaimLineRows,
      (line) => line.tax_withheld_vnd,
    ),
    totalDebtOffsetVnd: sumBy(
      activeClaimLineRows,
      (line) => line.debt_offset_amount_vnd,
    ),
    totalNetVnd,
    paidNetVnd,
    unpaidNetVnd: Math.max(totalNetVnd - paidNetVnd, 0),
    readyToPayVnd: sumBy(paymentCandidates, (line) => line.netAmountVnd),
    inPaymentBatchVnd: sumBy(inPaymentBatchRows, (line) => line.paid_amount_vnd),
    expectedHeuRevenueVnd: sumBy(
      breakevenRows,
      (row) => row.expected_heu_revenue_vnd,
    ),
    breakevenMarginVnd:
      breakevenMarginValues.length > 0
        ? sumBy(breakevenMarginValues, (value) => value)
        : null,
    breakevenCheckedCount: activeBreakevenRows.length,
    breakevenMissingCount,
    breakevenRiskCount,
  };
  const houCommissionRiskRows: HouCommissionRiskRow[] = claimRows
    .map((claim) => {
      const lines = claimLinesByClaim.get(claim.id) ?? [];
      const claimTotalNetVnd = sumBy(lines, (line) => line.net_amount_vnd);
      const claimPaidNetVnd = paidNetByClaim.get(claim.id) ?? 0;
      const breakeven = breakevenByClaim.get(claim.id);
      const reasons: string[] = [];

      if (claim.claim_status === "RISK_HOLD") {
        reasons.push("Claim đang giữ do rủi ro");
      }

      if (["HIGH", "LEFT"].includes(claim.dropout_risk_level)) {
        reasons.push("Rủi ro bỏ học cao");
      }

      if (
        ["BELOW_BREAKEVEN", "RISK"].includes(claim.breakeven_status) ||
        ["BELOW_BREAKEVEN", "RISK"].includes(breakeven?.result ?? "")
      ) {
        reasons.push("Dưới/rủi ro hòa vốn");
      }

      if (
        canSeeStrategy &&
        ["ELIGIBLE", "REVIEWING", "RISK_HOLD", "APPROVED", "PAID"].includes(
          claim.claim_status,
        ) &&
        !breakeven
      ) {
        reasons.push("Chưa kiểm tra hòa vốn");
      }

      if (claimTotalNetVnd > claimPaidNetVnd && claim.claim_status !== "REJECTED") {
        reasons.push("Còn COM chưa chi");
      }

      if (
        claimPaidNetVnd > 0 &&
        ["HIGH", "LEFT"].includes(claim.dropout_risk_level)
      ) {
        reasons.push("Đã chi nhưng có rủi ro bỏ học");
      }

      if (claim.debt_offset_amount_vnd > 0) {
        reasons.push("Có bù trừ công nợ");
      }

      return {
        claim,
        reasons,
        totalNetVnd: claimTotalNetVnd,
        paidNetVnd: claimPaidNetVnd,
        breakeven,
      };
    })
    .filter((row) => row.reasons.length > 0)
    .sort((a, b) => b.reasons.length - a.reasons.length)
    .slice(0, 30);
  const evidenceCountByLead = countByLead(evidenceRows);
  const claimCountByLead = countByLead(claimRows);

  const qualityRows = houLeads
    .map((lead) => {
      const evidenceCount = evidenceCountByLead.get(lead.id) ?? 0;
      const claimCount = claimCountByLead.get(lead.id) ?? 0;

      return {
        lead,
        evidenceCount,
        claimCount,
        issues: getLeadIssues(lead, evidenceCount, claimCount),
      };
    })
    .filter((row) => row.issues.length > 0)
    .sort((a, b) => b.issues.length - a.issues.length)
    .slice(0, 30);

  const claimsNeedAction = claimRows
    .filter((claim) =>
      ["ELIGIBLE", "REVIEWING", "RISK_HOLD", "APPROVED"].includes(
        claim.claim_status,
      ),
    )
    .slice(0, 30);

  const totalHou = houLeads.length;
  const completedCore = houLeads.filter(
    (lead) =>
      lead.hou_program_id &&
      lead.hou_major_id &&
      lead.hou_location_id &&
      lead.hou_stage_id,
  ).length;
  const tuitionConfirmed = houLeads.filter(
    (lead) => lead.hou_first_term_tuition_confirmed,
  ).length;
  const evidenceReady = houLeads.filter(
    (lead) => (evidenceCountByLead.get(lead.id) ?? 0) > 0,
  ).length;
  const enrolledHou = houLeads.filter(
    (lead) => lead.hou_enrollment_recorded_at || lead.status === "ENROLLED",
  ).length;
  const riskClaims = claimRows.filter(
    (claim) =>
      claim.claim_status === "RISK_HOLD" ||
      claim.dropout_risk_level === "HIGH" ||
      claim.dropout_risk_level === "LEFT",
  ).length;

  const byStage = groupCount(
    houLeads,
    (lead) => lead.hou_stage_id ?? "NO_STAGE",
    (key) => (key === "NO_STAGE" ? "Chưa chọn bước" : stageMap.get(key) ?? "Không rõ bước"),
  );

  const byLocation = groupCount(
    houLeads,
    (lead) => lead.hou_location_id ?? "NO_LOCATION",
    (key) =>
      key === "NO_LOCATION"
        ? "Chưa chọn địa điểm"
        : locationMap.get(key) ?? "Không rõ địa điểm",
  );

  const byProgram = groupCount(
    houLeads,
    (lead) => lead.hou_program_id ?? "NO_PROGRAM",
    (key) =>
      key === "NO_PROGRAM"
        ? "Chưa chọn chương trình"
        : programMap.get(key) ?? "Không rõ chương trình",
  );

  return (
    <AppShell
      active="hou"
      title="Kiểm soát HOU"
      description="Theo dõi lead liên thông đại học HOU, minh chứng, học phí kỳ đầu và claim COM từ dữ liệu Supabase."
      actions={
        <Button asChild variant="outline">
          <Link href="/hou">
            <RefreshCcw className="size-4" />
            Tải lại
          </Link>
        </Button>
      }
    >
      {leadsResult.error ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Không đọc được dữ liệu lead: {leadsResult.error.message}
        </section>
      ) : null}

      {evidenceResult.error ||
      claimsResult.error ||
      claimLinesResult.error ||
      paymentLinesResult.error ||
      paymentBatchesResult.error ||
      tuitionRatesResult.error ||
      revenueSharesResult.error ||
      breakevenChecksResult.error ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Một phần dữ liệu HOU chưa đọc được hoặc đang bị giới hạn theo phân
              quyền. Minh chứng: {evidenceResult.error?.message ?? "OK"}. COM:{" "}
              {claimsResult.error?.message ?? "OK"}. Dòng COM:{" "}
              {claimLinesResult.error?.message ?? "OK"}. Kỳ thanh toán:{" "}
              {paymentBatchesResult.error?.message ??
                paymentLinesResult.error?.message ??
                "OK"}. Biểu giá/hòa vốn:{" "}
              {tuitionRatesResult.error?.message ??
                revenueSharesResult.error?.message ??
                breakevenChecksResult.error?.message ??
                "OK"}.
            </p>
          </div>
        </section>
      ) : null}

      {!canSeeFinancial ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          Phần COM/tài chính nhạy cảm có thể bị ẩn theo quyền hiện tại. Admin,
          BGH, Trưởng phòng tuyển sinh hoặc Kế toán sẽ thấy đầy đủ hơn.
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Lead HOU"
          value={formatNumber(totalHou)}
          note={`${formatNumber(completedCore)} lead đủ thông tin lõi, ${formatNumber(enrolledHou)} đã nhập học`}
          tone="border-sky-200 bg-sky-50 text-sky-700"
        />
        <KpiCard
          label="Học phí kỳ đầu"
          value={percent(tuitionConfirmed, totalHou)}
          note={`${formatNumber(tuitionConfirmed)} lead đã xác nhận học phí`}
          tone="border-emerald-200 bg-emerald-50 text-emerald-700"
        />
        <KpiCard
          label="Minh chứng"
          value={percent(evidenceReady, totalHou)}
          note={`${formatNumber(evidenceReady)} lead đã có file/link minh chứng`}
          tone="border-violet-200 bg-violet-50 text-violet-700"
        />
        <KpiCard
          label="Rủi ro COM"
          value={formatNumber(riskClaims)}
          note={`${formatNumber(claimsNeedAction.length)} claim đang cần xử lý`}
          tone="border-amber-200 bg-amber-50 text-amber-700"
        />
      </section>

      {canSeeFinancial ? (
        <>
          <HouCommissionReport
            stats={houCommissionStats}
            currentRevenueShare={currentRevenueShare}
            tuitionRates={tuitionRateRows}
            canSeeStrategy={canSeeStrategy}
          />

          <HouCommissionRiskTable
            rows={houCommissionRiskRows}
            canSeeStrategy={canSeeStrategy}
          />
        </>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-3">
        <CountTable
          title="Theo chương trình"
          description="Lead HOU phân bổ theo chương trình đã gắn."
          rows={byProgram}
          emptyText="Chưa có dữ liệu chương trình HOU."
        />
        <CountTable
          title="Theo địa điểm"
          description="Kiểm soát nhu cầu theo nơi học, gồm 786 Kim Giang và các điểm sau này."
          rows={byLocation}
          emptyText="Chưa có dữ liệu địa điểm HOU."
        />
        <CountTable
          title="Theo bước xử lý"
          description="Theo dõi tiến độ lead trên quy trình HOU."
          rows={byStage}
          emptyText="Chưa có dữ liệu bước xử lý HOU."
        />
      </section>

      {totalHou === 0 ? (
        <section className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-zinc-100">
            <GraduationCap className="size-5 text-zinc-500" />
          </div>
          <h2 className="mt-4 text-base font-semibold">Chưa có lead HOU</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-500">
            Khi lead được gắn chương trình/ngành/địa điểm HOU hoặc nội dung quan
            tâm có HOU/liên thông, màn hình này sẽ tự tổng hợp.
          </p>
        </section>
      ) : (
        <>
          <QualityTable
            rows={qualityRows}
            userMap={userMap}
            majorMap={majorMap}
            stageMap={stageMap}
          />

          <ClaimTable
            claims={claimsNeedAction}
            canSeeFinancial={canSeeFinancial}
            canReviewCom={canReviewCom}
          />

          <HouPaymentBatches
            canManageCom={canReviewCom}
            candidates={paymentCandidates}
            batches={paymentBatches}
            defaultBatchCode={defaultBatchCode}
            defaultBatchName={defaultBatchName}
          />
        </>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ReceiptText className="size-5 text-zinc-600" />
              <h2 className="text-base font-semibold">Nguyên tắc kiểm soát</h2>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
              Màn hình này chỉ tổng hợp và cảnh báo. Việc sửa dữ liệu vẫn thực hiện
              tại từng lead để mọi thay đổi đi qua rule database, audit log và phân
              quyền đã thiết lập.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <GraduationCap className="size-4" />
            HOU control center
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
