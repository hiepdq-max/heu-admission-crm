import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Database,
  FileSearch,
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

type PartnerScopeRow = {
  partner_id: string;
};

type SummaryRow = {
  center_count: number;
  selectable_count: number;
  production_ready_count: number;
  pilot_temp_count: number;
  contract_ready_count: number;
  tuition_ready_count: number;
  needs_action_count: number;
};

type CenterMasterRow = {
  center_master_id: string;
  partner_id: string;
  partner_code: string | null;
  partner_name: string;
  admission_segment_id: string;
  segment_code: string;
  segment_name: string;
  center_code: string;
  center_name: string;
  official_name: string | null;
  center_type: string;
  province: string | null;
  district: string | null;
  area: string | null;
  phone: string | null;
  email: string | null;
  source_code: string | null;
  source_title: string | null;
  source_status: string | null;
  source_version: string | null;
  approved_document_url: string | null;
  effective_from: string | null;
  effective_to: string | null;
  master_status: string;
  selection_status: string;
  owner_department: string;
  checker_role: string | null;
  approver_role: string | null;
  risk_level: string;
  control_note: string | null;
  control_status: string;
  contract_code: string | null;
  contract_status: string | null;
  contract_readiness_status: string | null;
  ready_policy_count: number;
  policy_count: number;
  lead_count: number;
  readiness_status: string;
  blocking_items: string[] | null;
};

type DropdownRow = {
  center_master_id: string;
  partner_id: string;
  partner_code: string | null;
  center_code: string;
  center_name: string;
  official_name: string | null;
  display_label: string;
  area: string | null;
  selection_status: string;
  master_status: string;
  readiness_status: string;
  blocking_items: string[] | null;
};

const readinessLabels: Record<string, string> = {
  READY: "Đủ dùng production",
  PILOT_TEMP: "Được chọn tạm để pilot",
  NEEDS_APPROVAL: "Chờ duyệt master",
  NEEDS_FIX: "Cần sửa master",
  NEEDS_REVIEW: "Cần rà soát",
  EXPIRED: "Hết hiệu lực",
  BLOCKED: "Đang khóa",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Nháp",
  IN_REVIEW: "Chờ rà soát",
  APPROVED: "Đã duyệt",
  NEEDS_FIX: "Cần sửa",
  SUSPENDED: "Tạm dừng",
  RETIRED: "Ngừng dùng",
  TEMP_ENABLED: "Cho chọn tạm",
  ENABLED: "Cho chọn production",
  DISABLED: "Không cho chọn",
};

function canOpenMaster(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  partnerScopes: PartnerScopeRow[],
  hasReadPermission: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || !hasReadPermission) {
    return false;
  }

  return (
    scopes.some((scope) => scope.segment_id === segmentId) ||
    partnerScopes.length > 0
  );
}

function badgeClass(status: string) {
  if (["READY", "APPROVED", "ENABLED"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (["BLOCKED", "EXPIRED", "NEEDS_FIX", "SUSPENDED", "DISABLED"].includes(status)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (["PILOT_TEMP", "TEMP_ENABLED", "IN_REVIEW", "NEEDS_APPROVAL"].includes(status)) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));
}

function countValue(summary: SummaryRow | null, key: keyof SummaryRow) {
  return summary?.[key] ?? 0;
}

function blockersText(items: string[] | null) {
  if (!items || items.length === 0) {
    return "Không có cảnh báo chính";
  }

  return items.join(" · ");
}

export default async function TtgdtxMasterPage() {
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
    partnerScopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", { permission_name: "ttgdtx.master.read" }),
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
    supabase
      .from("user_partner_scopes")
      .select("partner_id")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .returns<PartnerScopeRow[]>(),
  ]);

  const segment = segmentResult.data;
  const canOpen = canOpenMaster(
    segment?.id ?? null,
    roleResult.data,
    scopeResult.data ?? [],
    partnerScopeResult.data ?? [],
    Boolean(readPermissionResult.data),
  );
  let centers: CenterMasterRow[] = [];
  let dropdownRows: DropdownRow[] = [];
  let summary: SummaryRow | null = null;
  let readError: { message: string } | null = null;

  if (canOpen) {
    const [summaryResult, centersResult, dropdownResult] = await Promise.all([
      supabase
        .from("ttgdtx_p2_12_summary")
        .select("*")
        .limit(1)
        .maybeSingle<SummaryRow>(),
      supabase
        .from("ttgdtx_center_master_readiness")
        .select("*")
        .order("center_name", { ascending: true })
        .returns<CenterMasterRow[]>(),
      supabase
        .from("ttgdtx_center_dropdown_options")
        .select("*")
        .order("center_name", { ascending: true })
        .returns<DropdownRow[]>(),
    ]);

    centers = centersResult.data ?? [];
    dropdownRows = dropdownResult.data ?? [];
    summary = summaryResult.data ?? null;
    readError =
      summaryResult.error ?? centersResult.error ?? dropdownResult.error ?? null;
  }

  return (
    <AppShell
      active="ttgdtx"
      title="P2-12 · Danh mục TTGDTX"
      description="Kiểm soát danh mục trung tâm được phép chọn trong lead, P2-05 và các bước kế toán TTGDTX."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/master"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/ttgdtx">
              <ArrowLeft className="size-4" />
              P2-01 hợp đồng
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/source-control">
              <Database className="size-4" />
              P2-11 nguồn
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/tuition">
              <WalletCards className="size-4" />
              P2-02 học phí
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/master">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-12">
              <FileSearch className="size-4" />
              Tìm P2-12
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa được phân quyền xem danh mục TTGDTX P2-12.
          Cần quyền <span className="font-medium">ttgdtx.master.read</span> và
          phạm vi đối tượng tuyển sinh/TTGDTX phù hợp.
        </section>
      ) : readError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được P2-12</p>
              <p className="mt-1">
                Hãy kiểm tra SQL{" "}
                <span className="font-medium">
                  database/step99_ttgdtx_master_dropdown_p2_12.sql
                </span>
                {" "}và chỉ áp dụng ở môi trường đã có backup/approval. Chi tiết:{" "}
                {readError.message}
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
                <h2 className="font-semibold">Nguyên tắc P2-12</h2>
                <p className="mt-1">
                  Tên TTGDTX phải chọn từ master. P2-12 không tạo công nợ, không
                  ghi nhận thu tiền và không chi trả đối tác. Nếu trung tâm đang
                  ở trạng thái chọn tạm, hệ thống cho pilot nhưng vẫn cảnh báo
                  trước production.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Tổng TTGDTX master</p>
              <p className="mt-3 text-3xl font-semibold">
                {countValue(summary, "center_count")}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Được phép chọn</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-700">
                {countValue(summary, "selectable_count")}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Pilot tạm</p>
              <p className="mt-3 text-3xl font-semibold text-amber-700">
                {countValue(summary, "pilot_temp_count")}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Cần xử lý</p>
              <p className="mt-3 text-3xl font-semibold text-rose-700">
                {countValue(summary, "needs_action_count")}
              </p>
            </article>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-zinc-200 p-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-base font-semibold">
                  Danh mục TTGDTX master
                </h2>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Đây là bảng kiểm soát nguồn chọn. Muốn lead/P2-05/P2-03 dùng
                  đúng trung tâm, trung tâm đó phải nằm ở đây.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                  Production: {countValue(summary, "production_ready_count")}
                </span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                  Hợp đồng ready: {countValue(summary, "contract_ready_count")}
                </span>
                <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-violet-700">
                  Học phí ready: {countValue(summary, "tuition_ready_count")}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Trung tâm</th>
                    <th className="px-5 py-3">Trạng thái chọn</th>
                    <th className="px-5 py-3">Nguồn / hiệu lực</th>
                    <th className="px-5 py-3">Hợp đồng</th>
                    <th className="px-5 py-3">Học phí / lead</th>
                    <th className="px-5 py-3">Cảnh báo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {centers.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-zinc-500"
                        colSpan={6}
                      >
                        Chưa có TTGDTX trong master. Hãy kiểm tra P2-11 hoặc tạo
                        đối tác loại TTGDTX trước.
                      </td>
                    </tr>
                  ) : (
                    centers.map((center) => (
                      <tr key={center.center_master_id} className="align-top">
                        <td className="px-5 py-4">
                          <div className="flex gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                              <Building2 className="size-5" />
                            </div>
                            <div>
                              <p className="font-medium text-zinc-950">
                                {center.center_name}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {center.center_code} · {center.partner_code}
                              </p>
                              <p className="mt-2 text-zinc-500">
                                {center.area ?? center.province ?? "Chưa nhập khu vực"}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {center.phone ?? "Chưa có SĐT"} ·{" "}
                                {center.email ?? "Chưa có email"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClass(center.selection_status)}`}
                          >
                            {statusLabels[center.selection_status] ??
                              center.selection_status}
                          </span>
                          <p className="mt-2">
                            Master:{" "}
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs ${badgeClass(center.master_status)}`}
                            >
                              {statusLabels[center.master_status] ??
                                center.master_status}
                            </span>
                          </p>
                          <p className="mt-2 text-zinc-500">
                            Sẵn sàng:{" "}
                            {readinessLabels[center.readiness_status] ??
                              center.readiness_status}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-zinc-900">
                            {center.source_title ?? "Chưa gắn nguồn P2-11"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {center.source_code ?? "Chưa có mã nguồn"} ·{" "}
                            {center.source_status ?? "Chưa kiểm"}
                          </p>
                          <p className="mt-2 text-zinc-600">
                            Từ {formatDate(center.effective_from)} đến{" "}
                            {formatDate(center.effective_to)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p>{center.contract_code ?? "Chưa có P2-01"}</p>
                          <p className="mt-2 text-zinc-500">
                            {center.contract_status ?? "Chưa nhập hợp đồng"}
                          </p>
                          <p className="mt-1 text-zinc-500">
                            {center.contract_readiness_status ??
                              "Chưa có readiness"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p>Chính sách ready: {center.ready_policy_count}</p>
                          <p className="mt-1 text-zinc-500">
                            Tổng chính sách: {center.policy_count}
                          </p>
                          <p className="mt-2 text-zinc-500">
                            Lead đang gắn: {center.lead_count}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="leading-6 text-amber-800">
                            {blockersText(center.blocking_items)}
                          </p>
                          <p className="mt-2 text-xs text-zinc-500">
                            Owner: {center.owner_department}
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-base font-semibold">
                Dropdown đang cấp cho lead
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Những dòng dưới đây là trung tâm sẽ xuất hiện ở ô chọn TTGDTX
                trong sửa nhanh P2-05. Không có ở đây thì không được chọn.
              </p>
            </div>
            <div className="divide-y divide-zinc-200">
              {dropdownRows.length === 0 ? (
                <div className="p-5 text-sm text-zinc-500">
                  Chưa có TTGDTX nào được mở cho dropdown.
                </div>
              ) : (
                dropdownRows.map((row) => (
                  <div
                    key={row.center_master_id}
                    className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium text-zinc-950">
                        {row.display_label}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {row.center_code} · {row.partner_code ?? "Chưa có mã đối tác"} ·{" "}
                        {row.area ?? "Chưa nhập khu vực"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${badgeClass(row.selection_status)}`}
                      >
                        {statusLabels[row.selection_status] ??
                          row.selection_status}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${badgeClass(row.readiness_status)}`}
                      >
                        {readinessLabels[row.readiness_status] ??
                          row.readiness_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-semibold">P2-12 đã nối vào quy trình</p>
                <p className="mt-1">
                  Sau khi môi trường đã áp dụng step99 theo quy trình phê duyệt,
                  màn hình sửa nhanh P2-05 của lead sẽ chỉ lấy tên TTGDTX từ
                  dropdown master này. Nếu thiếu tên trung
                  tâm, hãy bổ sung/duyệt tại P2-12 thay vì gõ tay ở lead.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
