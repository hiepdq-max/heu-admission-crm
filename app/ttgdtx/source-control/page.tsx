import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardList,
  Database,
  ExternalLink,
  FileSearch,
  FileText,
  LinkIcon,
  RefreshCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TtgdtxAccountControlScopeGuard } from "@/components/ttgdtx/ttgdtx-account-control-scope-guard";
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

type BoardRow = {
  admission_segment_id: string;
  segment_code: string;
  segment_name: string;
  related_step_code: string;
  source_count: number;
  source_ready_count: number;
  source_pending_count: number;
  local_path_count: number;
  check_count: number;
  check_pass_count: number;
  check_fail_count: number;
  check_warning_count: number;
  critical_fail_count: number;
  readiness_status: string;
  next_actions: string[] | null;
};

type SourceRow = {
  id: string;
  source_code: string;
  source_title: string;
  source_type: string;
  document_scope: string;
  related_step_code: string;
  source_path_or_url: string;
  file_name: string | null;
  version_label: string | null;
  owner_department: string;
  checker_role: string | null;
  approver_role: string | null;
  required_for_go_live: boolean;
  drive_file_id?: string | null;
  source_folder_id?: string | null;
  evidence_type?: string | null;
  pii_level?: string | null;
  extraction_status?: string | null;
  evidence_hash?: string | null;
  manual_reviewed_at?: string | null;
  source_note: string | null;
  document_status: string;
  control_status: string;
  control_flags: string[] | null;
  readiness_status: string;
  updated_at: string | null;
};

type CheckRow = {
  id: string;
  check_code: string;
  check_name: string;
  related_step_code: string;
  check_group: string;
  owner_department: string;
  severity: string;
  expected_control: string;
  current_observation: string;
  fix_owner: string | null;
  fix_action: string | null;
  check_status: string;
  readiness_status: string;
  source_code: string | null;
  source_title: string | null;
  updated_at: string | null;
};

const statusLabels: Record<string, string> = {
  READY: "Đã sẵn sàng",
  READY_BUT_LOCAL_PATH: "Đạt nhưng còn đường dẫn local",
  WAITING_CHECK: "Chờ kiểm",
  WAITING_SOURCE_CHECK: "Chờ kiểm nguồn",
  NEEDS_REVIEW: "Cần rà soát",
  NEEDS_FIX: "Cần sửa",
  BLOCKED: "Đang chặn",
  BLOCKED_CRITICAL: "Chặn nghiêm trọng",
  PASS: "Đạt",
  FAIL: "Không đạt",
  WARNING: "Cảnh báo",
  NOT_CHECKED: "Chưa kiểm",
  WAIVED: "Bỏ qua có kiểm soát",
};

const flagLabels: Record<string, string> = {
  SOURCE_NOT_APPROVED: "Nguồn chưa được duyệt",
  LOCAL_PATH_NEEDS_PRODUCTION_LINK: "Đường dẫn local, cần link production",
  DOCUMENT_NEEDS_FIX: "Tài liệu cần sửa",
  MISSING_CHECKER: "Thiếu người kiểm",
  MISSING_APPROVER: "Thiếu người duyệt",
  SENSITIVE_EVIDENCE_REVIEW_REQUIRED: "Bằng chứng nhạy cảm cần duyệt tay",
  EVIDENCE_LINK_MISSING: "Thiếu link bằng chứng",
};

const evidenceTypeLabels: Record<string, string> = {
  SOURCE_PACK: "Gói nguồn",
  CONTRACT: "Hợp đồng",
  APPENDIX: "Phụ lục",
  TUITION_WORKBOOK: "Bảng học phí",
  BANK_RECEIPT_PDF: "Chứng từ ngân hàng",
  RECEIPT_VOUCHER: "Phiếu/chứng từ thu",
  COLLECTION_INVOICE: "Hóa đơn/chứng từ thu",
  ACCEPTANCE_MINUTES: "BBNT",
  ACCEPTANCE_FOLDER: "Thư mục BBNT",
  ACCEPTANCE_ZIP: "File nén BBNT",
  ACCOUNT_FREEZE_NOTICE: "Thông báo phong tỏa",
  ACCOUNT_RELEASE_NOTICE: "Thông báo giải tỏa",
  CREDIT_CONTRACT: "Hợp đồng tín dụng",
  COLLATERAL_CONTRACT: "Hợp đồng bảo đảm",
  COLLATERAL_RELEASE: "Giải chấp",
  PARTNER_INVOICE: "Hóa đơn đối tác",
  TAX_INVOICE_POLICY: "Chính sách hóa đơn",
  INVOICE: "Hóa đơn",
  REGULATION: "Quy chế",
  SOP: "Quy trình",
  OTHER: "Khác",
};

const piiLevelLabels: Record<string, string> = {
  NONE: "Không nhạy cảm",
  PERSONAL: "Có dữ liệu cá nhân",
  BANK: "Có dữ liệu ngân hàng",
  HIGH: "Nhạy cảm cao",
};

const extractionStatusLabels: Record<string, string> = {
  FILE_ONLY: "Chỉ lưu metadata",
  EXTRACTED: "Đã trích xuất",
  OCR_REQUIRED: "Cần OCR",
  MANUAL_REVIEWED: "Đã duyệt tay",
};

function canOpenSourceControl(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasReadPermission: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || !hasReadPermission) {
    return false;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

function badgeClass(status: string) {
  if (["READY", "PASS", "CHECKED", "APPROVED"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (["BLOCKED", "BLOCKED_CRITICAL", "FAIL", "NEEDS_FIX"].includes(status)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (["WARNING", "NEEDS_REVIEW", "READY_BUT_LOCAL_PATH"].includes(status)) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function piiBadgeClass(level: string | null | undefined) {
  if (level === "HIGH") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (level === "BANK") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  if (level === "PERSONAL") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function extractionBadgeClass(status: string | null | undefined) {
  if (status === "MANUAL_REVIEWED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "OCR_REQUIRED") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "EXTRACTED") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));
}

function sourceHref(value: string) {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : null;
}

function flagsToText(flags: string[] | null) {
  if (!flags || flags.length === 0) {
    return ["Không có cờ kiểm soát"];
  }

  return flags.map((flag) => flagLabels[flag] ?? flag);
}

export default async function TtgdtxSourceControlPage() {
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
    supabase.rpc("has_permission", { permission_name: "ttgdtx.source.read" }),
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
  const canOpen = canOpenSourceControl(
    segment?.id ?? null,
    roleResult.data,
    scopeResult.data ?? [],
    Boolean(readPermissionResult.data),
  );
  let dataError: { message: string } | null = null;
  let summary: SummaryRow = {
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
  let boardRows: BoardRow[] = [];
  let sourceRows: SourceRow[] = [];
  let checkRows: CheckRow[] = [];

  if (canOpen) {
    const [summaryResult, boardResult, sourceResult, checkResult] =
      await Promise.all([
        supabase
          .from("ttgdtx_p2_11_summary")
          .select("*")
          .maybeSingle<SummaryRow>(),
        supabase
          .from("ttgdtx_p2_11_control_board")
          .select("*")
          .order("related_step_code", { ascending: true })
          .returns<BoardRow[]>(),
        supabase
          .from("ttgdtx_source_document_status")
          .select("*")
          .order("related_step_code", { ascending: true })
          .order("source_code", { ascending: true })
          .returns<SourceRow[]>(),
        supabase
          .from("ttgdtx_p2_11_check_status")
          .select("*")
          .order("severity", { ascending: true })
          .order("related_step_code", { ascending: true })
          .returns<CheckRow[]>(),
      ]);

    dataError =
      summaryResult.error ??
      boardResult.error ??
      sourceResult.error ??
      checkResult.error;
    summary = summaryResult.data ?? summary;
    boardRows = boardResult.data ?? [];
    sourceRows = sourceResult.data ?? [];
    checkRows = checkResult.data ?? [];
  }

  const p2_19Sources = sourceRows.filter(
    (row) =>
      row.related_step_code === "P2-19" ||
      Boolean(row.evidence_type && row.evidence_type !== "OTHER"),
  );
  const sensitiveSourceCount = sourceRows.filter((row) =>
    ["BANK", "HIGH"].includes(row.pii_level ?? ""),
  ).length;
  const manualReviewedCount = sourceRows.filter(
    (row) => row.extraction_status === "MANUAL_REVIEWED",
  ).length;
  const needsOcrCount = sourceRows.filter(
    (row) => row.extraction_status === "OCR_REQUIRED",
  ).length;

  return (
    <AppShell
      active="ttgdtx"
      title="Kiểm soát nguồn TTGDTX (P2-11/P2-19)"
      description="Quản lý file nguồn, hợp đồng, BBNT, chứng từ, hóa đơn, phong tỏa/giải tỏa và metadata nhạy cảm trước khi chạy thật."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/source-control"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx">
              <ArrowLeft className="size-4" />
              Hồ sơ liên kết (P2-01)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/tuition">
              <Database className="size-4" />
              Chính sách học phí (P2-02)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/receivables">
              <ClipboardList className="size-4" />
              Công nợ (P2-03)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payments">
              <ShieldCheck className="size-4" />
              Thu học phí (P2-10)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/master">
              <Building2 className="size-4" />
              Danh mục (P2-12)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/source-control">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=Kiem%20soat%20nguon%20P2-11%20P2-19">
              <FileSearch className="size-4" />
              Tìm nguồn
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700">
          Tài khoản của bạn chưa được phân quyền xem P2-11 trong phạm vi TTGDTX.
        </section>
      ) : (
        <div className="space-y-6">
          <TtgdtxAccountControlScopeGuard />

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <div className="flex gap-4">
              <ShieldCheck className="mt-1 size-5 shrink-0" />
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Nguyên tắc P2-11</h2>
                <p className="leading-7">
                  P2-11 chỉ kiểm soát nguồn dữ liệu và căn cứ pháp lý. Màn hình
                  này không tạo công nợ, không ghi nhận thu tiền, không duyệt chi
                  và không thay kế toán. Khi có lỗi, hệ thống chỉ ra đúng nơi cần
                  xử lý: pháp chế, kế toán, tuyển sinh, CTHSSV, đào tạo, IT/Data
                  hoặc audit.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Bằng chứng dữ liệu thật (P2-19)
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                  Đây là lớp metadata cho các source pack thực tế hoặc đã ẩn
                  danh, BBNT, hóa đơn/chứng từ, phong tỏa/giải tỏa và giải
                  chấp. Màn hình chỉ hiển thị phân
                  loại và trạng thái kiểm soát, không sao chép dữ liệu học sinh,
                  tài khoản ngân hàng hay tài sản bảo đảm.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/ttgdtx/source-control">
                  <RefreshCcw className="size-4" />
                  Làm mới bằng chứng
                </Link>
              </Button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase text-zinc-500">Nguồn P2-19</p>
                <p className="mt-2 text-2xl font-semibold">
                  {p2_19Sources.length}
                </p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
                <p className="text-xs uppercase">Nhạy cảm BANK/HIGH</p>
                <p className="mt-2 text-2xl font-semibold">
                  {sensitiveSourceCount}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                <p className="text-xs uppercase">Đã duyệt tay</p>
                <p className="mt-2 text-2xl font-semibold">
                  {manualReviewedCount}
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700">
                <p className="text-xs uppercase">Cần OCR</p>
                <p className="mt-2 text-2xl font-semibold">{needsOcrCount}</p>
              </div>
            </div>
          </section>

          {dataError ? (
            <section className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700">
              Chưa đọc được dữ liệu P2-11: {dataError.message}. Hãy chạy SQL{" "}
              <span className="font-semibold">
                database/step98_ttgdtx_source_control_p2_11.sql
              </span>
              .
            </section>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Nguồn đã đăng ký</p>
              <p className="mt-4 text-3xl font-bold">{summary.source_count}</p>
              <p className="mt-2 text-sm text-zinc-500">
                File/quy chế/link đang được theo dõi
              </p>
            </div>
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Nguồn đã kiểm</p>
              <p className="mt-4 text-3xl font-bold text-emerald-700">
                {summary.checked_source_count}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                CHECKED hoặc sẵn sàng có kiểm soát
              </p>
            </div>
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Checklist lỗi</p>
              <p className="mt-4 text-3xl font-bold text-rose-700">
                {summary.failed_check_count}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Trong đó nghiêm trọng: {summary.critical_failed_count}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đường dẫn local</p>
              <p className="mt-4 text-3xl font-bold text-amber-700">
                {summary.local_path_count}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Cần đổi sang Drive/File Registry trước production
              </p>
            </div>
          </section>

          <section className="rounded-lg border bg-white shadow-sm">
            <div className="border-b p-6">
              <h2 className="text-xl font-semibold">Tình trạng theo bước</h2>
              <p className="mt-2 text-zinc-500">
                Dùng bảng này để biết bước nào đang chặn: hợp đồng, pháp lý
                ngành, học phí, công nợ, thu tiền hay nguồn file.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-6 py-4">Bước</th>
                    <th className="px-6 py-4">Nguồn</th>
                    <th className="px-6 py-4">Checklist</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Việc cần làm</th>
                  </tr>
                </thead>
                <tbody>
                  {boardRows.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8 text-center text-zinc-500" colSpan={5}>
                        Chưa có dữ liệu P2-11 trong phạm vi đang chọn.
                      </td>
                    </tr>
                  ) : (
                    boardRows.map((row) => (
                      <tr key={row.related_step_code} className="border-t">
                        <td className="px-6 py-4 font-semibold">
                          {row.related_step_code}
                        </td>
                        <td className="px-6 py-4 text-zinc-600">
                          {row.source_ready_count}/{row.source_count} nguồn đạt
                          {row.local_path_count > 0 ? (
                            <span className="ml-2 text-amber-700">
                              · {row.local_path_count} local
                            </span>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 text-zinc-600">
                          {row.check_pass_count}/{row.check_count} đạt
                          {row.check_fail_count > 0 ? (
                            <span className="ml-2 text-rose-700">
                              · {row.check_fail_count} lỗi
                            </span>
                          ) : null}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-lg border px-3 py-1 text-xs font-medium ${badgeClass(
                              row.readiness_status,
                            )}`}
                          >
                            {statusLabels[row.readiness_status] ??
                              row.readiness_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-600">
                          {(row.next_actions ?? ["Không có việc đang chặn"]).map(
                            (action) => (
                              <div key={action}>{action}</div>
                            ),
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border bg-white shadow-sm">
            <div className="border-b p-6">
              <h2 className="text-xl font-semibold">Nguồn tài liệu đã đăng ký</h2>
              <p className="mt-2 text-zinc-500">
                Các file anh/chị cung cấp được đưa vào registry để sau này thay
                file rời bằng link production, tránh thất lạc và sai phiên bản.
              </p>
            </div>
            <div className="divide-y">
              {sourceRows.length === 0 ? (
                <div className="p-6 text-zinc-500">
                  Chưa có nguồn tài liệu P2-11.
                </div>
              ) : (
                sourceRows.map((row) => {
                  const href = sourceHref(row.source_path_or_url);

                  return (
                    <article
                      key={row.id}
                      className="grid gap-4 p-6 lg:grid-cols-[1fr_220px]"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
                            {row.related_step_code}
                          </span>
                          <span
                            className={`rounded-lg border px-3 py-1 text-xs font-medium ${badgeClass(
                              row.readiness_status,
                            )}`}
                          >
                            {statusLabels[row.readiness_status] ??
                              row.readiness_status}
                          </span>
                          <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
                            {row.document_scope}
                          </span>
                          <span className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-700">
                            {evidenceTypeLabels[row.evidence_type ?? "OTHER"] ??
                              row.evidence_type ??
                              "Khác"}
                          </span>
                          <span
                            className={`rounded-lg border px-3 py-1 text-xs font-medium ${piiBadgeClass(
                              row.pii_level,
                            )}`}
                          >
                            {piiLevelLabels[row.pii_level ?? "NONE"] ??
                              row.pii_level ??
                              "Không nhạy cảm"}
                          </span>
                          <span
                            className={`rounded-lg border px-3 py-1 text-xs font-medium ${extractionBadgeClass(
                              row.extraction_status,
                            )}`}
                          >
                            {extractionStatusLabels[
                              row.extraction_status ?? "FILE_ONLY"
                            ] ??
                              row.extraction_status ??
                              "Chỉ lưu metadata"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {row.source_title}
                          </h3>
                          <p className="mt-1 text-sm text-zinc-500">
                            {row.source_code} · {row.source_type} ·{" "}
                            {row.version_label ?? "Chưa có version"}
                          </p>
                        </div>
                        <p className="text-sm leading-6 text-zinc-600">
                          {row.source_note ?? "Chưa có ghi chú nguồn."}
                        </p>
                        <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
                          {href ? (
                            <a
                              className="inline-flex items-center gap-2 text-sky-700 underline-offset-4 hover:underline"
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <LinkIcon className="size-4" />
                              Mở link nguồn
                              <ExternalLink className="size-3" />
                            </a>
                          ) : (
                            <span className="break-all font-mono text-xs">
                              {row.source_path_or_url}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {flagsToText(row.control_flags).map((flag) => (
                            <span
                              key={flag}
                              className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg border bg-zinc-50 p-4 text-sm text-zinc-600">
                        <div className="font-semibold text-zinc-900">
                          Owner: {row.owner_department}
                        </div>
                        <div className="mt-3">Checker: {row.checker_role ?? "Chưa có"}</div>
                        <div>Approver: {row.approver_role ?? "Chưa có"}</div>
                        <div className="mt-3 rounded-md bg-white p-3">
                          <div className="font-medium text-zinc-900">
                            Metadata P2-19
                          </div>
                          <div className="mt-2 text-xs leading-5">
                            Drive file: {row.drive_file_id ?? "Chưa có"}
                          </div>
                          <div className="text-xs leading-5">
                            Folder: {row.source_folder_id ?? "Chưa có"}
                          </div>
                          <div className="text-xs leading-5">
                            Duyệt tay: {formatDate(row.manual_reviewed_at ?? null)}
                          </div>
                        </div>
                        <div className="mt-3">
                          Cập nhật: {formatDate(row.updated_at)}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-lg border bg-white shadow-sm">
            <div className="border-b p-6">
              <h2 className="text-xl font-semibold">Checklist kiểm soát</h2>
              <p className="mt-2 text-zinc-500">
                Mỗi dòng là một điều kiện kiểm soát. Dòng FAIL/CRITICAL là chỗ
                chưa nên cho chạy production.
              </p>
            </div>
            <div className="divide-y">
              {checkRows.length === 0 ? (
                <div className="p-6 text-zinc-500">Chưa có checklist P2-11.</div>
              ) : (
                checkRows.map((row) => (
                  <article
                    key={row.id}
                    className="grid gap-4 p-6 lg:grid-cols-[220px_1fr_260px]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {row.check_status === "PASS" ? (
                          <CheckCircle2 className="size-5 text-emerald-700" />
                        ) : row.check_status === "FAIL" ? (
                          <XCircle className="size-5 text-rose-700" />
                        ) : (
                          <AlertTriangle className="size-5 text-amber-700" />
                        )}
                        <span
                          className={`rounded-lg border px-3 py-1 text-xs font-medium ${badgeClass(
                            row.check_status,
                          )}`}
                        >
                          {statusLabels[row.check_status] ?? row.check_status}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-500">
                        {row.related_step_code} · {row.check_group}
                      </div>
                      <div className="text-sm text-zinc-500">
                        Mức: {row.severity}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold">{row.check_name}</h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          {row.check_code}
                        </p>
                      </div>
                      <div className="grid gap-3 lg:grid-cols-2">
                        <div className="rounded-lg bg-zinc-50 p-4">
                          <p className="text-xs font-semibold uppercase text-zinc-500">
                            Chuẩn cần đạt
                          </p>
                          <p className="mt-2 text-sm leading-6 text-zinc-700">
                            {row.expected_control}
                          </p>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-4">
                          <p className="text-xs font-semibold uppercase text-zinc-500">
                            Hiện trạng
                          </p>
                          <p className="mt-2 text-sm leading-6 text-zinc-700">
                            {row.current_observation}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-zinc-50 p-4 text-sm text-zinc-600">
                      <div className="font-semibold text-zinc-900">
                        Xử lý: {row.fix_owner ?? row.owner_department}
                      </div>
                      <p className="mt-3 leading-6">
                        {row.fix_action ?? "Chưa có hành động xử lý."}
                      </p>
                      {row.source_title ? (
                        <div className="mt-3 flex items-start gap-2 text-xs text-zinc-500">
                          <FileText className="mt-0.5 size-4 shrink-0" />
                          {row.source_title}
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
