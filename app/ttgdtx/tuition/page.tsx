import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileSpreadsheet,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  WalletCards,
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

type TtgdtxTuitionPolicyRow = {
  policy_id: string;
  policy_code: string;
  policy_name: string;
  contract_id: string;
  contract_code: string | null;
  contract_name: string | null;
  contract_status: string | null;
  partner_id: string;
  partner_code: string;
  partner_name: string;
  partner_area: string | null;
  segment_code: string;
  segment_name: string;
  program_code: string;
  program_name: string;
  major_code: string | null;
  major_name: string | null;
  offering_code: string | null;
  offering_name: string | null;
  academic_year: string;
  cohort_label: string | null;
  tuition_item: string;
  tuition_amount_vnd: number | string;
  min_first_payment_vnd: number | string;
  discount_allowed: boolean;
  collection_model: string;
  collection_account_note: string | null;
  due_rule: string | null;
  debt_owner_department: string;
  invoice_issue_rule: string;
  revenue_recognition_rule: string | null;
  settlement_basis: string | null;
  evidence_required: string | null;
  effective_from: string | null;
  effective_to: string | null;
  policy_status: string;
  risk_level: string;
  control_status: string;
  updated_at: string | null;
  readiness_status: string;
  blocking_items: string[] | null;
};

const readinessLabels: Record<string, string> = {
  READY: "Sẵn sàng kế toán",
  CONTRACT_NOT_READY: "Hợp đồng chưa sẵn sàng",
  FINANCE_REVIEW: "Kế toán đang kiểm",
  NEEDS_AMOUNT: "Thiếu học phí",
  NEEDS_DUE_RULE: "Thiếu hạn thu",
  NEEDS_SETTLEMENT: "Thiếu đối soát",
  NEEDS_EVIDENCE: "Thiếu chứng từ",
  EXPIRED: "Hết hiệu lực",
  BLOCKED: "Đang khóa",
};

const readinessTone: Record<string, string> = {
  READY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CONTRACT_NOT_READY: "border-amber-200 bg-amber-50 text-amber-700",
  FINANCE_REVIEW: "border-sky-200 bg-sky-50 text-sky-700",
  NEEDS_AMOUNT: "border-orange-200 bg-orange-50 text-orange-700",
  NEEDS_DUE_RULE: "border-orange-200 bg-orange-50 text-orange-700",
  NEEDS_SETTLEMENT: "border-orange-200 bg-orange-50 text-orange-700",
  NEEDS_EVIDENCE: "border-orange-200 bg-orange-50 text-orange-700",
  EXPIRED: "border-rose-200 bg-rose-50 text-rose-700",
  BLOCKED: "border-rose-200 bg-rose-50 text-rose-700",
};

const collectionModelLabels: Record<string, string> = {
  HEU_COLLECTS: "HEU thu học phí",
  TTGDTX_COLLECTS: "TTGDTX thu hộ",
  SPLIT_COLLECTION: "Hai bên phân chia phần thu",
  OTHER: "Cách thu khác",
};

const invoiceRuleLabels: Record<string, string> = {
  AFTER_ENROLLMENT_CONFIRMED: "Sau khi xác nhận nhập học",
  AFTER_DOCUMENT_READY: "Sau khi đủ hồ sơ",
  AFTER_CLASS_OPENED: "Sau khi mở lớp",
  MANUAL_APPROVAL_ONLY: "Chỉ khi được duyệt thủ công",
};

function money(value: number | string | null) {
  const numeric = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa nhập";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));
}

function canOpenTtgdtxTuition(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasTuitionRead: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || !hasTuitionRead) {
    return false;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

function countBy(
  rows: TtgdtxTuitionPolicyRow[],
  predicate: (row: TtgdtxTuitionPolicyRow) => boolean,
) {
  return rows.filter(predicate).length;
}

export default async function TtgdtxTuitionPage() {
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
    supabase.rpc("has_permission", { permission_name: "ttgdtx.tuition.read" }),
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
  const canOpen = canOpenTtgdtxTuition(
    segment?.id ?? null,
    roleResult.data,
    scopeResult.data ?? [],
    Boolean(readPermissionResult.data),
  );
  let rows: TtgdtxTuitionPolicyRow[] = [];
  let dataError: { message: string } | null = null;

  if (canOpen) {
    const policyResult = await supabase
      .from("ttgdtx_tuition_policy_readiness")
      .select("*")
      .order("partner_name", { ascending: true })
      .order("major_name", { ascending: true })
      .returns<TtgdtxTuitionPolicyRow[]>();

    rows = policyResult.data ?? [];
    dataError = policyResult.error;
  }
  const readyCount = countBy(rows, (row) => row.readiness_status === "READY");
  const missingAmountCount = countBy(
    rows,
    (row) => Number(row.tuition_amount_vnd) <= 0,
  );
  const contractBlockedCount = countBy(
    rows,
    (row) => row.readiness_status === "CONTRACT_NOT_READY",
  );
  const criticalCount = countBy(rows, (row) => row.risk_level === "CRITICAL");

  return (
    <AppShell
      active="ttgdtx"
      title="P2-02 · Học phí và công nợ TTGDTX"
      description="Khai báo chính sách học phí/công nợ theo hợp đồng TTGDTX và ngành Trung cấp trước khi phát sinh kế toán thật."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/tuition"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx">
              <ArrowLeft className="size-4" />
              P2-01 hợp đồng
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/tuition">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/receivables">
              <ReceiptText className="size-4" />
              P2-03 công nợ
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/simulation">
              <ClipboardCheck className="size-4" />
              P2-04 mô phỏng
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/gate">
              <ShieldCheck className="size-4" />
              P2-05 gate
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import">
              <FileSpreadsheet className="size-4" />
              P2-06 import
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-02">
              <FileSearch className="size-4" />
              Tìm P2-02
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa được phân quyền xem học phí/công nợ TTGDTX.
          Cần quyền P2-02 hoặc được phân vào đối tượng Trung cấp 9+ liên kết
          TTGDTX.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được P2-02</p>
              <p className="mt-1">
                Hãy chạy SQL{" "}
                <span className="font-medium">
                  step89_ttgdtx_tuition_policy.sql
                </span>
                . Chi tiết: {dataError.message}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Nguyên tắc P2-02</h2>
                <p className="mt-1">
                  Đây là bước khai báo chính sách, chưa thu tiền và chưa chi
                  tiền. Chỉ khi hợp đồng TTGDTX ACTIVE, ngành đúng hệ Trung cấp,
                  có số học phí, hạn thu/công nợ, chứng từ và căn cứ đối soát
                  thì mới coi là sẵn sàng kế toán.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Chính sách học phí</p>
              <p className="mt-3 text-3xl font-semibold">{rows.length}</p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Sẵn sàng kế toán</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-700">
                {readyCount}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Thiếu học phí</p>
              <p className="mt-3 text-3xl font-semibold text-orange-700">
                {missingAmountCount}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Hợp đồng chưa sẵn sàng</p>
              <p className="mt-3 text-3xl font-semibold text-rose-700">
                {contractBlockedCount + criticalCount}
              </p>
            </article>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <div className="flex items-start gap-3">
                <WalletCards className="mt-0.5 size-5 text-zinc-500" />
                <div>
                  <h2 className="text-base font-semibold">
                    Chính sách học phí/công nợ TTGDTX
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Mỗi dòng là một chính sách theo TTGDTX, hợp đồng, hệ Trung
                    cấp và ngành. Dòng chưa READY chỉ dùng để kiểm, không dùng
                    để phát sinh công nợ thật.
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1480px] text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">TTGDTX / Hợp đồng</th>
                    <th className="px-5 py-3">Ngành / Kỳ</th>
                    <th className="px-5 py-3">Học phí</th>
                    <th className="px-5 py-3">Thu và công nợ</th>
                    <th className="px-5 py-3">Đối soát / Chứng từ</th>
                    <th className="px-5 py-3">Kiểm soát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-zinc-500"
                        colSpan={6}
                      >
                        Chưa có chính sách P2-02. Hãy chạy SQL step89 sau khi
                        P2-01 đã có hợp đồng TTGDTX.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.policy_id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-medium text-zinc-950">
                            {row.partner_name}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {row.partner_code} ·{" "}
                            {row.partner_area ?? "Chưa nhập khu vực"}
                          </p>
                          <p className="mt-3 font-medium text-zinc-800">
                            {row.contract_name ?? "Chưa rõ hợp đồng"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {row.contract_code ?? "Chưa có mã hợp đồng"} ·{" "}
                            {row.contract_status ?? "Chưa có trạng thái"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-zinc-950">
                            {row.major_name ?? row.offering_name ?? "Chưa rõ ngành"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {row.major_code ?? row.offering_code ?? "Chưa có mã"} ·{" "}
                            {row.program_name}
                          </p>
                          <p className="mt-3 text-zinc-600">
                            Năm: {row.academic_year}
                          </p>
                          <p className="mt-1 text-zinc-600">
                            Kỳ/khóa: {row.cohort_label ?? "Áp dụng chung"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Hiệu lực: {formatDate(row.effective_from)} -{" "}
                            {formatDate(row.effective_to)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-lg font-semibold text-zinc-950">
                            {money(row.tuition_amount_vnd)}
                          </p>
                          <p className="mt-1 text-zinc-600">
                            Tối thiểu kỳ đầu: {money(row.min_first_payment_vnd)}
                          </p>
                          <p className="mt-2 text-xs text-zinc-500">
                            Mã: {row.policy_code}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Loại thu: {row.tuition_item}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-zinc-900">
                            {collectionModelLabels[row.collection_model] ??
                              row.collection_model}
                          </p>
                          <p className="mt-2 text-zinc-600">
                            Hạn thu/công nợ:{" "}
                            {row.due_rule ?? "Chưa khai báo"}
                          </p>
                          <p className="mt-2 text-zinc-600">
                            Chủ công nợ: {row.debt_owner_department}
                          </p>
                          <p className="mt-2 text-zinc-600">
                            Ghi nhận:{" "}
                            {invoiceRuleLabels[row.invoice_issue_rule] ??
                              row.invoice_issue_rule}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-zinc-600">
                            {row.settlement_basis ??
                              "Chưa có căn cứ đối soát TTGDTX"}
                          </p>
                          <p className="mt-3 text-zinc-600">
                            {row.evidence_required ??
                              "Chưa khai báo chứng từ/minh chứng bắt buộc"}
                          </p>
                          <p className="mt-3 text-xs text-zinc-500">
                            Doanh thu:{" "}
                            {row.revenue_recognition_rule ??
                              "Chưa có quy tắc ghi nhận"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                              readinessTone[row.readiness_status] ??
                              "border-zinc-200 bg-zinc-50 text-zinc-700"
                            }`}
                          >
                            {readinessLabels[row.readiness_status] ??
                              row.readiness_status}
                          </span>
                          <p className="mt-3 text-zinc-500">
                            Chính sách: {row.policy_status}
                          </p>
                          <p className="mt-1 text-zinc-500">
                            Rủi ro: {row.risk_level}
                          </p>
                          <p className="mt-1 text-zinc-500">
                            Kiểm soát: {row.control_status}
                          </p>
                          {row.readiness_status === "READY" ? (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                              <CheckCircle2 className="size-4" />
                              Có thể chuyển bước kế toán sau
                            </div>
                          ) : (
                            <ul className="mt-3 space-y-2 text-amber-800">
                              {(row.blocking_items ?? [
                                "Cần kiểm tra lại P2-02",
                              ]).map((item) => (
                                <li key={item} className="flex gap-2">
                                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
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
