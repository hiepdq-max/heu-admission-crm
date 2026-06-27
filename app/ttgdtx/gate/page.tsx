import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  FileSpreadsheet,
  Handshake,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  WalletCards,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TtgdtxOperatingControlStrip } from "@/components/ttgdtx/ttgdtx-operating-control-strip";
import { TtgdtxP019GateGuard } from "@/components/ttgdtx/ttgdtx-p019-gate-guard";
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

type CandidateRow = {
  lead_id: string;
  lead_code: string;
  student_name: string;
  student_phone: string | null;
  lead_status: string | null;
  partner_id: string | null;
  partner_code: string | null;
  partner_name: string | null;
  program_name: string | null;
  major_name: string | null;
  major_code: string | null;
  policy_id: string | null;
  policy_code: string | null;
  policy_name: string | null;
  contract_code: string | null;
  tuition_amount_vnd: number | string | null;
  due_rule: string | null;
  policy_readiness_status: string | null;
  existing_receivable_code: string | null;
  blocking_items: string[] | null;
  readiness_status: string;
  can_create_receivable: boolean;
  updated_at: string | null;
};

type ReceivableRow = {
  receivable_id: string;
  lead_id: string;
  receivable_code: string;
  student_name: string;
  partner_name: string;
  major_name: string;
  payable_amount_vnd: number | string;
  balance_amount_vnd: number | string;
  due_date: string;
  readiness_status: string;
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

const candidateStatusLabels: Record<string, string> = {
  READY_TO_CREATE: "Đạt P2-05",
  NEEDS_LEAD_STATUS: "Chưa đủ trạng thái",
  NEEDS_PARTNER: "Thiếu TTGDTX",
  NEEDS_PROGRAM: "Thiếu hệ đào tạo",
  NEEDS_MAJOR: "Thiếu ngành/nghề",
  NEEDS_TUITION_POLICY: "Thiếu P2-02 phù hợp",
  POLICY_NOT_READY: "P2-02 chưa READY",
  ALREADY_CREATED: "Đã có công nợ",
};

const flagLabels: Record<string, string> = {
  LEAD_STATUS_NOT_READY:
    "Lead phải đạt Đã nộp hồ sơ, Đủ điều kiện hoặc Đã nhập học",
  MISSING_TTGDTX_PARTNER: "Lead chưa gắn đúng TTGDTX/đối tác",
  MISSING_PROGRAM: "Lead chưa gắn hệ đào tạo chuẩn",
  MISSING_MAJOR: "Lead chưa gắn ngành/nghề chuẩn",
  NO_MATCHING_READY_TUITION_POLICY:
    "Chưa có P2-02 học phí READY đúng TTGDTX và ngành",
  TUITION_POLICY_NOT_READY:
    "P2-02 còn thiếu hợp đồng, học phí, hạn thu hoặc chứng từ",
  RECEIVABLE_ALREADY_EXISTS: "Lead đã có công nợ cùng kỳ/chính sách",
};

function money(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function canOpenGate(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasGateRead: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || !hasGateRead) {
    return false;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

function countBy<T>(rows: T[], predicate: (row: T) => boolean) {
  return rows.filter(predicate).length;
}

function hasFlag(row: CandidateRow, flag: string) {
  return Boolean(row.blocking_items?.includes(flag));
}

function conditionRows(row: CandidateRow) {
  return [
    {
      label: "Đúng đối tượng TTGDTX",
      ok: true,
      detail: "Lead đang nằm trong workspace Trung cấp 9+ liên kết TTGDTX.",
      href: "/segments",
    },
    {
      label: "Trạng thái đủ để tạo công nợ",
      ok: !hasFlag(row, "LEAD_STATUS_NOT_READY"),
      detail:
        leadStatusLabels[row.lead_status ?? ""] ??
        row.lead_status ??
        "Chưa rõ trạng thái",
      href: `/leads/${row.lead_id}`,
    },
    {
      label: "Đã gắn đúng TTGDTX",
      ok: !hasFlag(row, "MISSING_TTGDTX_PARTNER"),
      detail: row.partner_name ?? "Chưa gắn TTGDTX",
      href: `/leads/${row.lead_id}`,
    },
    {
      label: "Đã gắn hệ và ngành/nghề chuẩn",
      ok: !hasFlag(row, "MISSING_PROGRAM") && !hasFlag(row, "MISSING_MAJOR"),
      detail: `${row.program_name ?? "Chưa có hệ"} · ${
        row.major_name ?? "Chưa có ngành"
      }`,
      href: `/leads/${row.lead_id}`,
    },
    {
      label: "Có P2-02 học phí READY",
      ok:
        !hasFlag(row, "NO_MATCHING_READY_TUITION_POLICY") &&
        !hasFlag(row, "TUITION_POLICY_NOT_READY"),
      detail: row.policy_code
        ? `${row.policy_code} · ${money(row.tuition_amount_vnd)}`
        : "Chưa có chính sách học phí phù hợp",
      href: "/ttgdtx/tuition",
    },
    {
      label: "Chưa trùng công nợ P2-03",
      ok: !hasFlag(row, "RECEIVABLE_ALREADY_EXISTS"),
      detail: row.existing_receivable_code
        ? `Đã có ${row.existing_receivable_code}`
        : "Chưa có công nợ cùng kỳ/chính sách",
      href: "/ttgdtx/receivables",
    },
  ];
}

function blockerText(row: CandidateRow) {
  const flags = row.blocking_items ?? [];

  if (flags.length === 0) {
    return ["Đạt toàn bộ điều kiện P2-05."];
  }

  return flags.map((flag) => flagLabels[flag] ?? flag);
}

function gateTone(row: CandidateRow) {
  if (row.can_create_receivable) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (row.readiness_status === "ALREADY_CREATED") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

export default async function TtgdtxReceivableGatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    roleResult,
    gatePermissionResult,
    receivablePermissionResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.receivable.gate.read",
    }),
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
  const canOpen = canOpenGate(
    segment?.id ?? null,
    roleResult.data,
    scopeResult.data ?? [],
    Boolean(gatePermissionResult.data || receivablePermissionResult.data),
  );
  let candidates: CandidateRow[] = [];
  let receivables: ReceivableRow[] = [];
  let dataError: { message: string } | null = null;

  if (canOpen) {
    const [candidateResult, receivableResult] = await Promise.all([
      supabase
        .from("ttgdtx_receivable_candidate_leads")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(80)
        .returns<CandidateRow[]>(),
      supabase
        .from("ttgdtx_student_receivable_readiness")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(80)
        .returns<ReceivableRow[]>(),
    ]);

    candidates = candidateResult.data ?? [];
    receivables = receivableResult.data ?? [];
    dataError = candidateResult.error ?? receivableResult.error;
  }

  const readyCount = countBy(candidates, (row) => row.can_create_receivable);
  const blockedCount = countBy(
    candidates,
    (row) => !row.can_create_receivable && row.readiness_status !== "ALREADY_CREATED",
  );
  const alreadyCreatedCount = countBy(
    candidates,
    (row) => row.readiness_status === "ALREADY_CREATED",
  );

  return (
    <AppShell
      active="ttgdtx"
      title="P2-05 · Gate tạo công nợ TTGDTX"
      description="Kiểm tra đủ điều kiện trước khi kế toán tạo công nợ học phí TTGDTX. Màn này chỉ kiểm tra, không tự tạo dữ liệu."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/gate"
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
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ttgdtx/import">
              <FileSpreadsheet className="size-4" />
              P2-06 import
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P2-05">
              <FileSearch className="size-4" />
              Tìm P2-05
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa được phân quyền xem gate công nợ TTGDTX. Cần
          quyền P2-03/P2-05 hoặc được phân vào đối tượng Trung cấp 9+ liên kết
          TTGDTX.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được P2-05</p>
              <p className="mt-1">
                Hãy kiểm tra Step90/Step91/P2-01/P2-02/P2-03 ở môi trường đã có
                backup/approval. Chi tiết: {dataError.message}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          <TtgdtxOperatingControlStrip currentCode="P2-05" />
          <TtgdtxP019GateGuard />

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Nguyên tắc P2-05</h2>
                <p className="mt-1">
                  P2-05 là cổng kiểm tra trước khi tạo công nợ. Đủ thì mới mở
                  đường sang P2-03; thiếu chỗ nào thì chỉ đúng chỗ đó. Dữ liệu
                  đã đúng được giữ nguyên, không bắt nhập lại.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Lead kiểm tra</p>
              <p className="mt-3 text-3xl font-semibold">{candidates.length}</p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đạt P2-05</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-700">
                {readyCount}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đang bị chặn</p>
              <p className="mt-3 text-3xl font-semibold text-amber-700">
                {blockedCount}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">Đã có công nợ</p>
              <p className="mt-3 text-3xl font-semibold text-sky-700">
                {alreadyCreatedCount || receivables.length}
              </p>
            </article>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-lg font-semibold">Checklist theo từng lead</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Mỗi dòng là một lead TTGDTX. Cột bên phải cho biết cần sửa ở
                lead, P2-02 hay đã có thể sang P2-03.
              </p>
            </div>

            <div className="divide-y divide-zinc-200">
              {candidates.length === 0 ? (
                <div className="p-6 text-sm text-zinc-500">
                  Chưa có lead TTGDTX phù hợp trong phạm vi đang chọn.
                </div>
              ) : (
                candidates.map((candidate) => {
                  const conditions = conditionRows(candidate);
                  const blockers = blockerText(candidate);

                  return (
                    <article
                      key={candidate.lead_id}
                      className="grid gap-5 p-5 xl:grid-cols-[1fr_1.4fr_1fr]"
                    >
                      <div>
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${gateTone(
                            candidate,
                          )}`}
                        >
                          {candidateStatusLabels[candidate.readiness_status] ??
                            candidate.readiness_status}
                        </span>
                        <h3 className="mt-3 text-lg font-semibold">
                          {candidate.student_name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          {candidate.lead_code} ·{" "}
                          {candidate.student_phone ?? "Chưa có SĐT"}
                        </p>
                        <p className="mt-3 text-sm text-zinc-600">
                          {candidate.partner_name ?? "Chưa gắn TTGDTX"} ·{" "}
                          {candidate.major_name ?? "Chưa gắn ngành"}
                        </p>
                        <p className="mt-1 text-sm text-zinc-600">
                          {candidate.policy_code
                            ? `P2-02: ${candidate.policy_code}`
                            : "Chưa có P2-02 phù hợp"}
                        </p>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {conditions.map((condition) => (
                          <Link
                            key={condition.label}
                            href={condition.href}
                            className={`rounded-lg border p-3 text-sm transition hover:shadow-sm ${
                              condition.ok
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-amber-200 bg-amber-50 text-amber-900"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {condition.ok ? (
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                              ) : (
                                <XCircle className="mt-0.5 size-4 shrink-0" />
                              )}
                              <div>
                                <p className="font-medium">{condition.label}</p>
                                <p className="mt-1 text-xs leading-5 opacity-80">
                                  {condition.detail}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      <div className="flex flex-col justify-between gap-4">
                        <ul className="space-y-2 text-sm">
                          {blockers.map((blocker) => (
                            <li
                              key={blocker}
                              className={`flex gap-2 ${
                                candidate.can_create_receivable
                                  ? "text-emerald-700"
                                  : "text-amber-800"
                              }`}
                            >
                              {candidate.can_create_receivable ? (
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                              ) : (
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                              )}
                              <span>{blocker}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex flex-wrap justify-end gap-2">
                          <Button asChild variant="outline">
                            <Link href={`/leads/${candidate.lead_id}`}>
                              Mở lead
                            </Link>
                          </Button>
                          <Button asChild>
                            <Link
                              href={
                                candidate.can_create_receivable
                                  ? "/ttgdtx/receivables"
                                  : `/leads/${candidate.lead_id}?fix=ttgdtx-gate#p2-05-fix`
                              }
                            >
                              {candidate.can_create_receivable
                                ? "Sang P2-03"
                                : "Sửa chỗ thiếu"}
                              <ArrowRight className="size-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
