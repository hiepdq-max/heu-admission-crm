import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileSpreadsheet,
  ReceiptText,
  RefreshCcw,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TtgdtxP019GateGuard } from "@/components/ttgdtx/ttgdtx-p019-gate-guard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { firstParam } from "@/lib/workspace";

import { createTtgdtxReceivableAction } from "./actions";

type ReceivablesPageProps = {
  searchParams?: Promise<{
    created?: string | string[];
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

type CandidateRow = {
  lead_id: string;
  lead_code: string;
  student_name: string;
  student_phone: string | null;
  lead_status: string | null;
  partner_name: string | null;
  partner_code: string | null;
  program_name: string | null;
  major_name: string | null;
  major_code: string | null;
  policy_id: string | null;
  policy_code: string | null;
  policy_name: string | null;
  contract_code: string | null;
  tuition_amount_vnd: number | string | null;
  min_first_payment_vnd: number | string | null;
  due_rule: string | null;
  policy_readiness_status: string | null;
  existing_receivable_code: string | null;
  blocking_items: string[] | null;
  readiness_status: string;
  can_create_receivable: boolean;
  updated_at: string | null;
  major_gate_id?: string | null;
  major_legal_status?: string | null;
  major_tuition_status?: string | null;
  major_finance_gate?: string | null;
  major_gate_required_action?: string | null;
};

type ReceivableRow = {
  receivable_id: string;
  receivable_code: string;
  lead_code: string | null;
  student_name: string;
  student_phone: string | null;
  partner_name: string;
  contract_code: string | null;
  policy_code: string | null;
  major_name: string;
  academic_year: string;
  term_label: string;
  expected_amount_vnd: number | string;
  discount_amount_vnd: number | string;
  payable_amount_vnd: number | string;
  paid_amount_vnd: number | string;
  balance_amount_vnd: number | string;
  due_date: string;
  days_overdue: number;
  receivable_status: string;
  collection_status: string;
  invoice_status: string;
  overdue_risk_level: string;
  note: string | null;
  control_flags: string[] | null;
  readiness_status: string;
  updated_at: string | null;
};

type SummaryRow = {
  receivable_count: number;
  open_count: number;
  overdue_count: number;
  paid_count: number;
  payable_total_vnd: number | string;
  paid_total_vnd: number | string;
  balance_total_vnd: number | string;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500";
const textAreaClass =
  "min-h-20 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500";

const candidateStatusLabels: Record<string, string> = {
  NEEDS_P0_19_MAJOR_GATE: "Ngành chưa có cổng P0-19",
  P0_19_FINANCE_NOT_READY: "P0-19 chưa cho phép kế toán",
  READY_TO_CREATE: "Đủ điều kiện tạo công nợ",
  NEEDS_LEAD_STATUS: "Lead chưa đủ trạng thái",
  NEEDS_PARTNER: "Thiếu TTGDTX/đối tác",
  NEEDS_PROGRAM: "Thiếu hệ đào tạo chuẩn",
  NEEDS_MAJOR: "Thiếu ngành/nghề chuẩn",
  NEEDS_TUITION_POLICY: "Chưa có chính sách học phí phù hợp",
  POLICY_NOT_READY: "Chính sách học phí chưa READY",
  ALREADY_CREATED: "Đã có công nợ",
};

const candidateFlagLabels: Record<string, string> = {
  P0_19_MAJOR_GATE_MISSING: "Ngành chưa có gate P0-19 pháp lý/học phí",
  P0_19_MAJOR_FINANCE_GATE_NOT_READY:
    "P0-19 chưa cho phép kế toán tạo công nợ cho ngành này",
  LEAD_STATUS_NOT_READY:
    "Lead cần đạt Đã nộp hồ sơ, Đủ điều kiện hoặc Đã nhập học",
  MISSING_TTGDTX_PARTNER: "Lead chưa gắn TTGDTX/đối tác",
  MISSING_PROGRAM: "Lead chưa gắn hệ đào tạo chuẩn",
  MISSING_MAJOR: "Lead chưa gắn ngành/nghề chuẩn",
  NO_MATCHING_READY_TUITION_POLICY:
    "Chưa có P2-02 học phí READY đúng TTGDTX và ngành",
  TUITION_POLICY_NOT_READY: "P2-02 còn thiếu hợp đồng, học phí, hạn thu hoặc chứng từ",
  RECEIVABLE_ALREADY_EXISTS: "Lead này đã có công nợ cùng kỳ/chính sách",
};

const p019Labels: Record<string, string> = {
  VERIFIED: "Pháp lý đã đối chiếu",
  PENDING: "Pháp lý chờ đối chiếu",
  BLOCKED: "Pháp lý đang chặn",
  CONFIGURED: "Học phí đã cấu hình",
  ALLOW_FINANCE: "Cho phép kế toán",
  WARN_BEFORE_FINANCE: "Cảnh báo trước kế toán",
  BLOCK_FINANCE: "Chặn kế toán",
};

const receivableStatusLabels: Record<string, string> = {
  OPEN: "Đang phải thu",
  OVERDUE: "Quá hạn",
  PAID: "Đã đủ",
  PARTIAL: "Thu một phần",
  CANCELLED: "Đã hủy",
  WAIVED: "Miễn/không thu",
  CONTRACT_NOT_READY: "Hợp đồng chưa sẵn sàng",
  POLICY_NOT_READY: "Học phí chưa sẵn sàng",
};

const leadStatusLabels: Record<string, string> = {
  NEW: "Lead mới",
  ASSIGNED: "Đã phân tư vấn",
  CONTACTED: "Đã liên hệ",
  INTERESTED: "Có quan tâm",
  FOLLOW_UP: "Chăm sóc tiếp",
  DOCUMENT_PENDING: "Chờ hồ sơ",
  DOCUMENT_SUBMITTED: "Đã nộp hồ sơ",
  ELIGIBLE: "Đủ điều kiện",
  ENROLLED: "Đã nhập học",
  LOST: "Không đăng ký",
};

function money(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function p019Summary(row: CandidateRow) {
  if (!row.major_gate_id) {
    return "P0-19: chưa có gate pháp lý/học phí ngành";
  }

  const legal = p019Labels[row.major_legal_status ?? ""] ?? row.major_legal_status;
  const tuition =
    p019Labels[row.major_tuition_status ?? ""] ?? row.major_tuition_status;
  const finance =
    p019Labels[row.major_finance_gate ?? ""] ?? row.major_finance_gate;

  return `P0-19: ${legal ?? "Chưa rõ pháp lý"} · ${
    tuition ?? "Chưa rõ học phí"
  } · ${finance ?? "Chưa rõ kế toán"}`;
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

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

function canOpenTtgdtxReceivables(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasReceivableRead: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || !hasReceivableRead) {
    return false;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

function messageFromParams(params: Awaited<ReceivablesPageProps["searchParams"]>) {
  const error = firstParam(params?.error);

  if (error) {
    return {
      tone: "error",
      text: error,
    };
  }

  if (firstParam(params?.created)) {
    return {
      tone: "success",
      text: "Đã tạo công nợ học phí TTGDTX qua cổng kiểm soát P2-03.",
    };
  }

  return null;
}

function candidateTone(row: CandidateRow) {
  if (row.can_create_receivable) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (row.readiness_status === "ALREADY_CREATED") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function receivableTone(status: string) {
  if (status === "PAID") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "OVERDUE") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (status === "PARTIAL") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function explainFlags(flags: string[] | null) {
  if (!flags || flags.length === 0) {
    return ["Không có lỗi kiểm soát"];
  }

  return flags.map((flag) => candidateFlagLabels[flag] ?? flag);
}

export default async function TtgdtxReceivablesPage({
  searchParams,
}: ReceivablesPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const message = messageFromParams(resolvedSearchParams);

  const [
    roleResult,
    readPermissionResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", { permission_name: "ttgdtx.receivable.read" }),
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
  const canOpen = canOpenTtgdtxReceivables(
    segment?.id ?? null,
    roleResult.data,
    scopeResult.data ?? [],
    Boolean(readPermissionResult.data),
  );
  let candidates: CandidateRow[] = [];
  let receivables: ReceivableRow[] = [];
  let dataError: { message: string } | null = null;
  let summary: SummaryRow = {
    receivable_count: receivables.length,
    open_count: receivables.filter((row) => row.readiness_status === "OPEN").length,
    overdue_count: receivables.filter((row) => row.readiness_status === "OVERDUE")
      .length,
    paid_count: receivables.filter((row) => row.readiness_status === "PAID").length,
    payable_total_vnd: receivables.reduce(
      (total, row) => total + Number(row.payable_amount_vnd ?? 0),
      0,
    ),
    paid_total_vnd: receivables.reduce(
      (total, row) => total + Number(row.paid_amount_vnd ?? 0),
      0,
    ),
    balance_total_vnd: receivables.reduce(
      (total, row) => total + Number(row.balance_amount_vnd ?? 0),
      0,
    ),
  };

  if (canOpen) {
    const [candidateResult, receivableResult, summaryResult] =
      await Promise.all([
        supabase
          .from("ttgdtx_receivable_candidate_leads")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(40)
          .returns<CandidateRow[]>(),
        supabase
          .from("ttgdtx_student_receivable_readiness")
          .select("*")
          .order("due_date", { ascending: true })
          .limit(80)
          .returns<ReceivableRow[]>(),
        supabase
          .from("ttgdtx_receivable_summary")
          .select("*")
          .maybeSingle<SummaryRow>(),
      ]);

    candidates = candidateResult.data ?? [];
    receivables = receivableResult.data ?? [];
    summary = summaryResult.data ?? {
      receivable_count: receivables.length,
      open_count: receivables.filter((row) => row.readiness_status === "OPEN")
        .length,
      overdue_count: receivables.filter(
        (row) => row.readiness_status === "OVERDUE",
      ).length,
      paid_count: receivables.filter((row) => row.readiness_status === "PAID")
        .length,
      payable_total_vnd: receivables.reduce(
        (total, row) => total + Number(row.payable_amount_vnd ?? 0),
        0,
      ),
      paid_total_vnd: receivables.reduce(
        (total, row) => total + Number(row.paid_amount_vnd ?? 0),
        0,
      ),
      balance_total_vnd: receivables.reduce(
        (total, row) => total + Number(row.balance_amount_vnd ?? 0),
        0,
      ),
    };
    dataError =
      candidateResult.error ?? receivableResult.error ?? summaryResult.error;
  }

  const returnTo = "/ttgdtx/receivables";

  return (
    <AppShell
      active="ttgdtx"
      title="P2-03 · Công nợ học phí TTGDTX"
      description="Tạo công nợ học phí theo từng học sinh TTGDTX, có kiểm tra hợp đồng P2-01, chính sách P2-02, ngành/hệ và trạng thái lead."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/receivables"
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
              <WalletCards className="size-4" />
              P2-02 học phí
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/receivables">
              <RefreshCcw className="size-4" />
              Tải lại
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
              P2-13 đối soát
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
            <Link href="/search?q=P2-03">
              <FileSearch className="size-4" />
              Tìm P2-03
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa được phân quyền xem công nợ học phí TTGDTX.
          Cần quyền P2-03 hoặc được phân vào đối tượng Trung cấp 9+ liên kết TTGDTX.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được P2-03</p>
              <p className="mt-1">
                Hãy chạy SQL{" "}
                <span className="font-medium">
                  step90_ttgdtx_student_receivables.sql
                </span>
                . Chi tiết: {dataError.message}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          <TtgdtxP019GateGuard />

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
                <h2 className="font-semibold">Nguyên tắc P2-03</h2>
                <p className="mt-1">
                  P2-03 chỉ tạo công nợ phải thu theo học sinh. Bước này chưa xác
                  nhận đã thu tiền, chưa xuất chứng từ cuối cùng và chưa chi trả
                  TTGDTX. Muốn tạo được công nợ thì lead phải đúng TTGDTX, đúng hệ
                  Trung cấp, đúng ngành, hợp đồng P2-01 ACTIVE và học phí P2-02
                  READY.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Dòng công nợ</p>
              <p className="mt-3 text-3xl font-semibold">
                {summary.receivable_count}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Phải thu</p>
              <p className="mt-3 text-2xl font-semibold">
                {money(summary.payable_total_vnd)}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Còn phải thu</p>
              <p className="mt-3 text-2xl font-semibold text-amber-700">
                {money(summary.balance_total_vnd)}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Quá hạn</p>
              <p className="mt-3 text-3xl font-semibold text-rose-700">
                {summary.overdue_count}
              </p>
            </article>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <div className="flex items-start gap-3">
                <ReceiptText className="mt-0.5 size-5 text-zinc-500" />
                <div>
                  <h2 className="text-lg font-semibold">
                    Lead sẵn sàng tạo công nợ
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Nếu nút bị mờ, hệ thống chỉ đúng chỗ còn thiếu. Dữ liệu đúng
                    vẫn giữ nguyên, không bắt nhập lại.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-zinc-200">
              {candidates.length === 0 ? (
                <div className="p-6 text-sm text-zinc-500">
                  Chưa có lead TTGDTX phù hợp trong phạm vi hiện tại. Hãy tạo hoặc
                  import lead thuộc đối tượng Trung cấp 9+ liên kết TTGDTX trước.
                </div>
              ) : (
                candidates.map((candidate) => {
                  const flags = explainFlags(candidate.blocking_items);

                  return (
                    <form
                      key={candidate.lead_id}
                      action={createTtgdtxReceivableAction}
                      className="grid gap-4 p-5 xl:grid-cols-[1.1fr_1fr_1fr_auto]"
                    >
                      <input type="hidden" name="return_to" value={returnTo} />
                      <input type="hidden" name="lead_id" value={candidate.lead_id} />
                      {candidate.policy_id ? (
                        <input
                          type="hidden"
                          name="tuition_policy_id"
                          value={candidate.policy_id}
                        />
                      ) : null}

                      <div>
                        <p className="font-semibold">{candidate.student_name}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {candidate.lead_code} ·{" "}
                          {candidate.student_phone ?? "Chưa có SĐT"} ·{" "}
                          {leadStatusLabels[candidate.lead_status ?? ""] ??
                            candidate.lead_status ??
                            "Chưa rõ trạng thái"}
                        </p>
                        <p className="mt-2 text-sm text-zinc-600">
                          {candidate.partner_name ?? "Chưa gắn TTGDTX"} ·{" "}
                          {candidate.major_name ?? "Chưa gắn ngành chuẩn"}
                        </p>
                        <span
                          className={`mt-3 inline-flex rounded-md border px-2 py-1 text-xs font-medium ${candidateTone(
                            candidate,
                          )}`}
                        >
                          {candidateStatusLabels[candidate.readiness_status] ??
                            candidate.readiness_status}
                        </span>
                        <p className="mt-2 text-xs leading-5 text-zinc-500">
                          {p019Summary(candidate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-zinc-700">
                          Chính sách học phí
                        </p>
                        <p className="mt-2 font-medium">
                          {candidate.policy_name ?? "Chưa có P2-02 phù hợp"}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {candidate.policy_code ?? "Chưa có mã"} ·{" "}
                          {candidate.contract_code ?? "Chưa có hợp đồng"}
                        </p>
                        <p className="mt-2 text-sm text-zinc-600">
                          Học phí: {money(candidate.tuition_amount_vnd)}
                        </p>
                        <p className="mt-1 text-sm text-zinc-600">
                          Hạn thu: {candidate.due_rule ?? "Chưa khai báo"}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="space-y-1.5">
                          <span className="text-sm font-medium text-zinc-700">
                            Kỳ công nợ
                          </span>
                          <input
                            name="term_label"
                            className={fieldClass}
                            defaultValue="KY_1"
                            disabled={!candidate.can_create_receivable}
                          />
                        </label>
                        <label className="space-y-1.5">
                          <span className="text-sm font-medium text-zinc-700">
                            Hạn thu
                          </span>
                          <input
                            name="due_date"
                            type="date"
                            className={fieldClass}
                            defaultValue={defaultDueDate()}
                            disabled={!candidate.can_create_receivable}
                            required
                          />
                        </label>
                        <textarea
                          name="note"
                          className={textAreaClass}
                          placeholder="Ghi chú công nợ, ví dụ: học phí kỳ 1 theo danh sách TTGDTX."
                          disabled={!candidate.can_create_receivable}
                        />
                      </div>

                      <div className="flex flex-col justify-between gap-3">
                        <ul className="space-y-2 text-sm text-amber-800">
                          {candidate.can_create_receivable ? (
                            <li className="flex gap-2 text-emerald-700">
                              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                              Đủ điều kiện tạo công nợ
                            </li>
                          ) : (
                            flags.map((item) => (
                              <li key={item} className="flex gap-2">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))
                          )}
                        </ul>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button asChild variant="outline">
                            <Link href={`/leads/${candidate.lead_id}`}>Mở lead</Link>
                          </Button>
                          <Button
                            type="submit"
                            disabled={!candidate.can_create_receivable}
                          >
                            <ReceiptText className="size-4" />
                            Tạo công nợ
                          </Button>
                        </div>
                      </div>
                    </form>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-lg font-semibold">Công nợ học phí đã tạo</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Danh sách này là công nợ phải thu, không phải chứng từ đã thu tiền.
                Thu tiền/xác nhận chứng từ sẽ làm ở bước kế toán tiếp theo.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Học sinh</th>
                    <th className="px-5 py-3">TTGDTX / Ngành</th>
                    <th className="px-5 py-3">Số tiền</th>
                    <th className="px-5 py-3">Hạn thu</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Kiểm soát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {receivables.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-zinc-500"
                        colSpan={6}
                      >
                        Chưa có công nợ học phí TTGDTX nào.
                      </td>
                    </tr>
                  ) : (
                    receivables.map((row) => (
                      <tr key={row.receivable_id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-semibold">{row.student_name}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {row.receivable_code}
                          </p>
                          <p className="mt-2 text-sm text-zinc-600">
                            {row.lead_code ?? "Chưa rõ lead"} ·{" "}
                            {row.student_phone ?? "Chưa có SĐT"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium">{row.partner_name}</p>
                          <p className="mt-1 text-sm text-zinc-600">
                            {row.major_name}
                          </p>
                          <p className="mt-2 text-xs text-zinc-500">
                            {row.contract_code ?? "Chưa rõ hợp đồng"} ·{" "}
                            {row.policy_code ?? "Chưa rõ chính sách"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p>Phải thu: {money(row.payable_amount_vnd)}</p>
                          <p className="mt-1 text-zinc-600">
                            Đã thu: {money(row.paid_amount_vnd)}
                          </p>
                          <p className="mt-1 font-medium text-amber-700">
                            Còn lại: {money(row.balance_amount_vnd)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p>{formatDate(row.due_date)}</p>
                          <p className="mt-1 text-zinc-600">
                            {row.days_overdue > 0
                              ? `Quá hạn ${row.days_overdue} ngày`
                              : "Chưa quá hạn"}
                          </p>
                          <p className="mt-2 text-xs text-zinc-500">
                            {row.academic_year} · {row.term_label}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${receivableTone(
                              row.readiness_status,
                            )}`}
                          >
                            {receivableStatusLabels[row.readiness_status] ??
                              row.readiness_status}
                          </span>
                          <p className="mt-3 text-zinc-500">
                            Công nợ: {row.receivable_status}
                          </p>
                          <p className="mt-1 text-zinc-500">
                            Thu: {row.collection_status}
                          </p>
                          <p className="mt-1 text-zinc-500">
                            Chứng từ: {row.invoice_status}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {row.control_flags && row.control_flags.length > 0 ? (
                            <ul className="space-y-2 text-amber-800">
                              {row.control_flags.map((flag) => (
                                <li key={flag} className="flex gap-2">
                                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                  <span>{flag}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                              <CheckCircle2 className="size-4" />
                              Không có lỗi kiểm soát
                            </div>
                          )}
                          {row.note ? (
                            <p className="mt-3 text-zinc-500">{row.note}</p>
                          ) : null}
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
