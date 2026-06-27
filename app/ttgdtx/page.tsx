import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Banknote,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileSpreadsheet,
  Handshake,
  LayoutDashboard,
  ReceiptText,
  RefreshCcw,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TtgdtxProductionReadinessGuard } from "@/components/ttgdtx/ttgdtx-production-readiness-guard";
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

type TtgdtxContractReadinessRow = {
  partner_id: string;
  partner_code: string;
  partner_name: string;
  phone: string | null;
  email: string | null;
  area: string | null;
  contract_id: string | null;
  contract_code: string | null;
  contract_name: string | null;
  contract_no: string | null;
  contract_type: string | null;
  signed_on: string | null;
  effective_from: string | null;
  effective_to: string | null;
  contract_file_url: string | null;
  legal_basis: string | null;
  scope_note: string | null;
  tuition_collection_model: string | null;
  settlement_cycle: string | null;
  settlement_cutoff_rule: string | null;
  partner_payment_model: string | null;
  commission_policy_note: string | null;
  payment_condition: string | null;
  tax_invoice_required: boolean | null;
  accounting_voucher_required: boolean | null;
  duplicate_payment_guard: string | null;
  checker_role: string | null;
  approver_role: string | null;
  contract_status: string | null;
  risk_level: string | null;
  control_status: string | null;
  updated_at: string | null;
  readiness_status: string;
  blocking_items: string[] | null;
};

const readinessLabels: Record<string, string> = {
  READY: "Đủ nền hợp đồng",
  NEEDS_CONTRACT: "Thiếu hợp đồng",
  LEGAL_REVIEW: "Chờ pháp chế/BGH",
  NEEDS_LEGAL: "Thiếu căn cứ pháp lý",
  NEEDS_FINANCE_RULE: "Thiếu quy tắc kế toán",
  EXPIRED: "Hết hiệu lực",
  BLOCKED: "Đang bị khóa",
};

const readinessTone: Record<string, string> = {
  READY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  NEEDS_CONTRACT: "border-rose-200 bg-rose-50 text-rose-700",
  LEGAL_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  NEEDS_LEGAL: "border-amber-200 bg-amber-50 text-amber-700",
  NEEDS_FINANCE_RULE: "border-orange-200 bg-orange-50 text-orange-700",
  EXPIRED: "border-rose-200 bg-rose-50 text-rose-700",
  BLOCKED: "border-rose-200 bg-rose-50 text-rose-700",
};

const paymentModelLabels: Record<string, string> = {
  CONTRACT_POLICY: "Theo hợp đồng/chính sách",
  COMMISSION: "Chi COM",
  SERVICE_FEE: "Phí dịch vụ",
  REVENUE_SHARE: "Chia sẻ doanh thu",
  NO_PAYMENT: "Không chi",
  OTHER: "Khác",
};

const tuitionModelLabels: Record<string, string> = {
  HEU_COLLECTS: "HEU thu",
  TTGDTX_COLLECTS: "TTGDTX thu",
  SPLIT_COLLECTION: "Phân chia bên thu",
  OTHER: "Khác",
};

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

function canOpenTtgdtx(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasContractRead: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || !hasContractRead) {
    return false;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

function countBy(
  rows: TtgdtxContractReadinessRow[],
  predicate: (row: TtgdtxContractReadinessRow) => boolean,
) {
  return rows.filter(predicate).length;
}

export default async function TtgdtxPage() {
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
    supabase.rpc("has_permission", { permission_name: "ttgdtx.contract.read" }),
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
  const canOpen = canOpenTtgdtx(
    segment?.id ?? null,
    roleResult.data,
    scopeResult.data ?? [],
    Boolean(readPermissionResult.data),
  );
  let rows: TtgdtxContractReadinessRow[] = [];
  let dataError: { message: string } | null = null;

  if (canOpen) {
    const readinessResult = await supabase
      .from("ttgdtx_partner_contract_readiness")
      .select("*")
      .order("partner_name", { ascending: true })
      .returns<TtgdtxContractReadinessRow[]>();

    rows = readinessResult.data ?? [];
    dataError = readinessResult.error;
  }
  const readyCount = countBy(rows, (row) => row.readiness_status === "READY");
  const blockedCount = countBy(rows, (row) => row.readiness_status !== "READY");
  const highRiskCount = countBy(rows, (row) =>
    ["HIGH", "CRITICAL"].includes(row.risk_level ?? ""),
  );

  return (
    <AppShell
      active="ttgdtx"
      title="P2-01 · TTGDTX Contract Master"
      description="Kiểm soát hợp đồng, phạm vi liên kết, quy tắc học phí và điều kiện chi trả TTGDTX trước khi chạy kế toán thật."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/partners">
              <Handshake className="size-4" />
              Đối tác
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/master">
              <Building2 className="size-4" />
              Danh mục TTGDTX (P2-12)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/tuition">
              <WalletCards className="size-4" />
              Chính sách học phí (P2-02)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/receivables">
              <ReceiptText className="size-4" />
              Công nợ (P2-03)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payments">
              <Banknote className="size-4" />
              Thu học phí (P2-10)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/reconciliation">
              <Scale className="size-4" />
              Đối soát (P2-13)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/reconciliation/review">
              <CheckCircle2 className="size-4" />
              Duyệt kỳ (P2-14)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests">
              <WalletCards className="size-4" />
              Đề nghị chi (P2-15)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests/review">
              <ShieldCheck className="size-4" />
              Duyệt chi (P2-16)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/payment-requests/pay">
              <Banknote className="size-4" />
              Chi tiền (P2-17)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/accounting-dashboard">
              <LayoutDashboard className="size-4" />
              Dashboard kế toán (P2-18)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/simulation">
              <ClipboardCheck className="size-4" />
              Mô phỏng (P2-04)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/gate">
              <ShieldCheck className="size-4" />
              Gate điều kiện (P2-05)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import">
              <FileSpreadsheet className="size-4" />
              Import dữ liệu (P2-06)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=TTGDTX%20contract%20P2-01">
              <FileSearch className="size-4" />
              Tìm hồ sơ TTGDTX
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa được phân quyền xem hồ sơ TTGDTX. Cần quyền
          P2-01 hoặc được phân vào đối tượng tuyển sinh Trung cấp 9+ liên kết
          TTGDTX.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được P2-01</p>
              <p className="mt-1">
                Có thể bạn chưa chạy SQL{" "}
                <span className="font-medium">
                  step88_ttgdtx_partner_contract_master.sql
                </span>
                . Chi tiết: {dataError.message}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          <TtgdtxProductionReadinessGuard />

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Nguyên tắc P2-01</h2>
                <p className="mt-1">
                  Không thu/chi theo TTGDTX nếu thiếu hợp đồng hiệu lực, phạm
                  vi phối hợp, quy tắc học phí, điều kiện chi, chứng từ và
                  người duyệt. AI chỉ được cảnh báo thiếu dữ liệu, không tự
                  duyệt chi.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">TTGDTX đang quản lý</p>
              <p className="mt-3 text-3xl font-semibold">{rows.length}</p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đủ nền hợp đồng</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-700">
                {readyCount}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Cần bổ sung</p>
              <p className="mt-3 text-3xl font-semibold text-amber-700">
                {blockedCount}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Rủi ro cao</p>
              <p className="mt-3 text-3xl font-semibold text-rose-700">
                {highRiskCount}
              </p>
            </article>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-base font-semibold">
                Hồ sơ hợp đồng TTGDTX
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Đây là cổng kiểm soát đầu tiên cho luồng Trung cấp 9+ liên kết
                TTGDTX. Chỉ khi dòng này đủ nền thì các bước học phí, công nợ
                và chi trả đối tác mới nên mở.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">TTGDTX</th>
                    <th className="px-5 py-3">Hợp đồng</th>
                    <th className="px-5 py-3">Hiệu lực</th>
                    <th className="px-5 py-3">Kế toán / chi trả</th>
                    <th className="px-5 py-3">Kiểm soát</th>
                    <th className="px-5 py-3">Việc cần làm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-zinc-500"
                        colSpan={6}
                      >
                        Chưa có TTGDTX nào. Hãy tạo đối tác loại TTGDTX trước.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.partner_id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-medium text-zinc-950">
                            {row.partner_name}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {row.partner_code}
                          </p>
                          <p className="mt-2 text-zinc-500">
                            {row.area ?? "Chưa nhập khu vực"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {row.phone ?? "Chưa có SĐT"} ·{" "}
                            {row.email ?? "Chưa có email"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-zinc-900">
                            {row.contract_name ?? "Chưa có hợp đồng"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {row.contract_code ?? "Chưa tạo mã P2-01"}
                          </p>
                          <p className="mt-2 text-zinc-600">
                            Số: {row.contract_no ?? "Chưa nhập"}
                          </p>
                          <p className="mt-1 text-zinc-600">
                            Ngày ký: {formatDate(row.signed_on)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p>
                            Từ {formatDate(row.effective_from)} đến{" "}
                            {formatDate(row.effective_to)}
                          </p>
                          <p className="mt-2 text-zinc-500">
                            {row.scope_note ?? "Chưa ghi phạm vi phối hợp"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p>
                            Thu học phí:{" "}
                            <span className="font-medium">
                              {tuitionModelLabels[
                                row.tuition_collection_model ?? ""
                              ] ??
                                row.tuition_collection_model ??
                                "Chưa rõ"}
                            </span>
                          </p>
                          <p className="mt-1">
                            Kỳ đối soát: {row.settlement_cycle ?? "Chưa rõ"}
                          </p>
                          <p className="mt-1">
                            Chi trả:{" "}
                            {paymentModelLabels[
                              row.partner_payment_model ?? ""
                            ] ??
                              row.partner_payment_model ??
                              "Chưa rõ"}
                          </p>
                          <p className="mt-2 text-zinc-500">
                            {row.commission_policy_note ??
                              "Chưa có mô tả chính sách chi/đối soát"}
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
                            Hợp đồng: {row.contract_status ?? "Chưa có"}
                          </p>
                          <p className="mt-1 text-zinc-500">
                            Rủi ro: {row.risk_level ?? "Chưa đánh giá"}
                          </p>
                          <p className="mt-1 text-zinc-500">
                            Duyệt: {row.approver_role ?? "Chưa rõ"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {row.readiness_status === "READY" ? (
                            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                              <CheckCircle2 className="size-4" />
                              Có thể chuyển sang bước kế toán tiếp theo
                            </div>
                          ) : (
                            <ul className="space-y-2 text-amber-800">
                              {(row.blocking_items ?? [
                                "Cần kiểm tra lại hồ sơ P2-01",
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
