import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  DatabaseZap,
  FileSearch,
  FileSpreadsheet,
  Handshake,
  ReceiptText,
  RefreshCcw,
  Route,
  ShieldCheck,
  WalletCards,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
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

type BatchRow = {
  batch_id: string;
  batch_code: string;
  batch_name: string;
  admission_segment_id: string;
  segment_code: string;
  segment_name: string;
  source_kind: string;
  source_file_name: string;
  source_file_url: string | null;
  source_owner: string | null;
  workbook_modified_at: string | null;
  workbook_sheet_count: number;
  raw_student_row_count: number;
  raw_receipt_row_count: number;
  raw_partner_acceptance_row_count: number;
  raw_class_policy_row_count: number;
  expected_total_vnd: number | string;
  paid_total_vnd: number | string;
  uncollectible_total_vnd: number | string;
  balance_total_vnd: number | string;
  partner_payable_total_vnd: number | string;
  partner_paid_total_vnd: number | string;
  partner_balance_total_vnd: number | string;
  check_count: number;
  failed_check_count: number;
  warning_check_count: number;
  critical_check_count: number;
  staging_row_count: number;
  issue_error_count: number;
  issue_warning_count: number;
  import_status: string;
  control_flags: string[] | null;
  readiness_status: string;
  can_lock_batch: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
};

type CheckRow = {
  check_id: string;
  batch_id: string;
  batch_code: string;
  check_code: string;
  check_name: string;
  severity: string;
  source_sheet: string | null;
  expected_amount_vnd: number | string | null;
  actual_amount_vnd: number | string | null;
  diff_amount_vnd: number | string | null;
  actual_count: number | null;
  check_status: string;
  check_message: string | null;
  owner_department: string;
  fix_hint: string | null;
  updated_at: string;
};

type QualityRow = {
  batch_id: string;
  batch_code: string;
  source_sheet: string;
  row_type: string;
  row_count: number;
  valid_count: number;
  warning_count: number;
  error_count: number;
  expected_total_vnd: number | string;
  paid_total_vnd: number | string;
  balance_total_vnd: number | string;
  issue_codes: string[] | null;
};

const readinessLabels: Record<string, string> = {
  BLOCKED_CRITICAL: "Chặn nghiêm trọng",
  NEEDS_FIX: "Cần sửa lỗi",
  NEEDS_REVIEW: "Cần kiểm tra",
  READY_TO_LOCK: "Có thể khóa batch",
  LOCKED: "Đã khóa",
  EMPTY: "Chưa có dòng staging",
  CANCELLED: "Đã hủy",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Nháp",
  IMPORTED: "Đã nhập file",
  CHECKING: "Đang kiểm",
  HAS_ISSUES: "Có lỗi cần xử lý",
  READY_TO_LOCK: "Sẵn sàng khóa",
  LOCKED: "Đã khóa",
  CANCELLED: "Đã hủy",
};

const severityLabels: Record<string, string> = {
  INFO: "Thông tin",
  WARNING: "Cảnh báo",
  ERROR: "Lỗi",
  CRITICAL: "Lỗi nghiêm trọng",
};

const rowTypeLabels: Record<string, string> = {
  BATCH_SUMMARY: "Tổng hợp batch",
  CLASS_POLICY: "Danh sách lớp/học phí",
  STUDENT_RECEIVABLE: "Công nợ học viên",
  PAYMENT_TRANSACTION: "Dòng thu tiền",
  PARTNER_ACCEPTANCE: "Nghiệm thu trung tâm",
  PARTNER_PAYABLE: "Phải chi trung tâm",
  VOUCHER_TEMPLATE: "Mẫu chứng từ",
  ISSUE_SAMPLE: "Mẫu lỗi",
  UNKNOWN: "Chưa phân loại",
};

function money(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function formatNumber(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function canOpenImport(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasImportRead: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || !hasImportRead) {
    return false;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

function checkTone(row: CheckRow) {
  if (row.check_status === "PASS") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (row.severity === "CRITICAL" || row.severity === "ERROR") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function readinessTone(status: string) {
  if (status === "READY_TO_LOCK" || status === "LOCKED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "BLOCKED_CRITICAL" || status === "NEEDS_FIX") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

export default async function TtgdtxTuitionImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    roleResult,
    readPermissionResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", { permission_name: "ttgdtx.import.read" }),
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
  const canOpen = canOpenImport(
    segment?.id ?? null,
    roleResult.data,
    scopeResult.data ?? [],
    Boolean(readPermissionResult.data),
  );
  let batches: BatchRow[] = [];
  let issues: CheckRow[] = [];
  let qualityRows: QualityRow[] = [];
  let dataError: { message: string } | null = null;

  if (canOpen) {
    const [batchResult, issueResult, qualityResult] = await Promise.all([
      supabase
        .from("ttgdtx_tuition_import_batch_readiness")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(12)
        .returns<BatchRow[]>(),
      supabase
        .from("ttgdtx_tuition_import_issue_register")
        .select("*")
        .order("severity", { ascending: true })
        .order("updated_at", { ascending: false })
        .limit(30)
        .returns<CheckRow[]>(),
      supabase
        .from("ttgdtx_tuition_import_staging_quality")
        .select("*")
        .order("source_sheet", { ascending: true })
        .returns<QualityRow[]>(),
    ]);

    batches = batchResult.data ?? [];
    issues = issueResult.data ?? [];
    qualityRows = qualityResult.data ?? [];
    dataError = batchResult.error ?? issueResult.error ?? qualityResult.error;
  }

  const latestBatch = batches[0] ?? null;

  return (
    <AppShell
      active="ttgdtx"
      title="P2-06 · Import đối soát học phí TTGDTX"
      description="Đưa file thu học phí/công nợ đang chạy thật vào staging để kiểm lỗi trước khi tạo công nợ, xác nhận thu hoặc chi trả trung tâm."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/import"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx">
              <Handshake className="size-4" />
              P2-01
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/tuition">
              <WalletCards className="size-4" />
              P2-02
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/receivables">
              <ReceiptText className="size-4" />
              P2-03
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/gate">
              <ShieldCheck className="size-4" />
              P2-05
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import/issues">
              <Route className="size-4" />
              P2-07 xử lý lỗi
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-06">
              <FileSearch className="size-4" />
              Tìm P2-06
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa có quyền xem P2-06. Cần quyền import TTGDTX
          hoặc được phân vào phạm vi Trung cấp 9+ liên kết TTGDTX.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được P2-06</p>
              <p className="mt-1">
                Hãy chạy SQL step92 trước. Chi tiết kỹ thuật: {dataError.message}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <div className="flex items-start gap-3">
              <DatabaseZap className="mt-0.5 size-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Nguyên tắc P2-06</h2>
                <p className="mt-1">
                  File kế toán không được nhập thẳng vào công nợ thật. P2-06 chỉ
                  nhận file vào vùng kiểm tra, so tổng tiền, chỉ lỗi từng nhóm và
                  chỉ cho đi tiếp khi lỗi nghiêm trọng đã được xử lý.
                </p>
              </div>
            </div>
          </section>

          {latestBatch ? (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-zinc-500">Phải thu</p>
                  <p className="mt-3 text-2xl font-semibold">
                    {money(latestBatch.expected_total_vnd)}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {formatNumber(latestBatch.raw_student_row_count)} học viên
                  </p>
                </article>
                <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-zinc-500">Đã thu</p>
                  <p className="mt-3 text-2xl font-semibold text-emerald-700">
                    {money(latestBatch.paid_total_vnd)}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {formatNumber(latestBatch.raw_receipt_row_count)} dòng thu
                  </p>
                </article>
                <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-zinc-500">Còn nợ</p>
                  <p className="mt-3 text-2xl font-semibold text-amber-700">
                    {money(latestBatch.balance_total_vnd)}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Không thu: {money(latestBatch.uncollectible_total_vnd)}
                  </p>
                </article>
                <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-zinc-500">Còn chi TTGDTX</p>
                  <p className="mt-3 text-2xl font-semibold text-sky-700">
                    {money(latestBatch.partner_balance_total_vnd)}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Đã chi: {money(latestBatch.partner_paid_total_vnd)}
                  </p>
                </article>
                <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-zinc-500">Trạng thái batch</p>
                  <span
                    className={`mt-3 inline-flex rounded-md border px-2 py-1 text-sm font-medium ${readinessTone(
                      latestBatch.readiness_status,
                    )}`}
                  >
                    {readinessLabels[latestBatch.readiness_status] ??
                      latestBatch.readiness_status}
                  </span>
                  <p className="mt-2 text-xs text-zinc-500">
                    {latestBatch.failed_check_count} lỗi,{" "}
                    {latestBatch.warning_check_count} cảnh báo
                  </p>
                </article>
              </section>

              <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 p-5">
                  <div>
                    <h2 className="text-lg font-semibold">Batch file đang kiểm</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Đây là lớp trung gian để đối soát file trước khi dùng cho
                      công nợ hoặc thanh toán.
                    </p>
                  </div>
                  <span
                    className={`rounded-md border px-2 py-1 text-sm font-medium ${readinessTone(
                      latestBatch.readiness_status,
                    )}`}
                  >
                    {statusLabels[latestBatch.import_status] ??
                      latestBatch.import_status}
                  </span>
                </div>

                <div className="grid gap-4 p-5 lg:grid-cols-[1.4fr_1fr]">
                  <div>
                    <p className="text-xs font-medium uppercase text-zinc-500">
                      File nguồn
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      {latestBatch.source_file_name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {latestBatch.note}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-600">
                      <span className="rounded-md bg-zinc-100 px-2 py-1">
                        {latestBatch.source_kind}
                      </span>
                      <span className="rounded-md bg-zinc-100 px-2 py-1">
                        {latestBatch.workbook_sheet_count} sheet
                      </span>
                      <span className="rounded-md bg-zinc-100 px-2 py-1">
                        Cập nhật file: {formatDate(latestBatch.workbook_modified_at)}
                      </span>
                    </div>
                    {latestBatch.source_file_url ? (
                      <Button asChild className="mt-4" variant="outline">
                        <a
                          href={latestBatch.source_file_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FileSpreadsheet className="size-4" />
                          Mở file nguồn
                        </a>
                      </Button>
                    ) : null}
                  </div>

                  <div className="rounded-lg border border-zinc-200 p-4">
                    <p className="text-sm font-semibold">Kết luận kiểm soát</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600">
                      <li className="flex gap-2">
                        {latestBatch.can_lock_batch ? (
                          <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
                        ) : (
                          <XCircle className="mt-1 size-4 shrink-0 text-rose-600" />
                        )}
                        <span>
                          {latestBatch.can_lock_batch
                            ? "Batch có thể khóa để chuyển bước tiếp theo."
                            : "Batch chưa được khóa vì còn lỗi cần xử lý."}
                        </span>
                      </li>
                      <li>
                        Mã batch:{" "}
                        <span className="font-medium">{latestBatch.batch_code}</span>
                      </li>
                      <li>
                        Cập nhật hệ thống: {formatDate(latestBatch.updated_at)}
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
              Chưa có batch P2-06. Hãy chạy SQL step92 để tạo cấu trúc và batch
              kiểm thử từ file thu học phí.
            </section>
          )}

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-lg font-semibold">Checklist lỗi cần xử lý</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Lỗi đỏ phải sửa trước khi dùng file làm căn cứ công nợ hoặc chi
                trung tâm. Cảnh báo vàng có thể cho vận hành nhưng phải có người
                chịu trách nhiệm.
              </p>
            </div>

            <div className="divide-y divide-zinc-200">
              {issues.length === 0 ? (
                <div className="p-5 text-sm text-zinc-500">
                  Chưa có lỗi/cảnh báo trong batch đang chọn.
                </div>
              ) : (
                issues.map((issue) => (
                  <article
                    key={issue.check_id}
                    className="grid gap-4 p-5 lg:grid-cols-[220px_1fr_220px]"
                  >
                    <div>
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${checkTone(
                          issue,
                        )}`}
                      >
                        {severityLabels[issue.severity] ?? issue.severity}
                      </span>
                      <p className="mt-3 text-xs text-zinc-500">
                        {issue.source_sheet ?? "Toàn batch"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">{issue.check_name}</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        {issue.check_message}
                      </p>
                      {issue.fix_hint ? (
                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                          Cách xử lý: {issue.fix_hint}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-sm text-zinc-600">
                      <p>
                        Số dòng:{" "}
                        <span className="font-medium">
                          {issue.actual_count ?? "Không áp dụng"}
                        </span>
                      </p>
                      {issue.expected_amount_vnd !== null ? (
                        <p className="mt-2">
                          Mốc tiền: {money(issue.expected_amount_vnd)}
                        </p>
                      ) : null}
                      <p className="mt-2">Owner: {issue.owner_department}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-lg font-semibold">Staging theo nhóm dữ liệu</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Mỗi nhóm bên dưới tương ứng một phần trong file kế toán. Đây là
                nơi hệ thống chỉ rõ nhóm nào sạch, nhóm nào còn lỗi.
              </p>
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-2">
              {qualityRows.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Chưa có dòng staging để tổng hợp.
                </p>
              ) : (
                qualityRows.map((row) => (
                  <article
                    key={`${row.batch_id}-${row.source_sheet}-${row.row_type}`}
                    className="rounded-lg border border-zinc-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase text-zinc-500">
                          {row.source_sheet}
                        </p>
                        <h3 className="mt-1 font-semibold">
                          {rowTypeLabels[row.row_type] ?? row.row_type}
                        </h3>
                      </div>
                      <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                        {formatNumber(row.row_count)} dòng
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div className="rounded-md bg-emerald-50 p-2 text-emerald-700">
                        Đúng: {formatNumber(row.valid_count)}
                      </div>
                      <div className="rounded-md bg-amber-50 p-2 text-amber-700">
                        Cảnh báo: {formatNumber(row.warning_count)}
                      </div>
                      <div className="rounded-md bg-rose-50 p-2 text-rose-700">
                        Lỗi: {formatNumber(row.error_count)}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-zinc-500">
                      Phải thu {money(row.expected_total_vnd)} · Đã thu{" "}
                      {money(row.paid_total_vnd)} · Còn nợ{" "}
                      {money(row.balance_total_vnd)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Chu trình chuẩn sau P2-06</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              {[
                ["1", "Nhận file", "Excel/Google Sheet từ kế toán."],
                ["2", "Đưa vào staging", "Chưa ghi vào công nợ thật."],
                ["3", "Kiểm lỗi", "Tổng tiền, công thức, chứng từ, dữ liệu thiếu."],
                ["4", "Sửa đúng chỗ", "Đúng giữ nguyên, sai chỉ sửa ô/vùng sai."],
                ["5", "Khóa batch", "Sau đó mới dùng cho P2-03 và thanh toán."],
              ].map(([step, title, description]) => (
                <div key={step} className="rounded-lg border border-zinc-200 p-4">
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
                    {step}
                  </span>
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
