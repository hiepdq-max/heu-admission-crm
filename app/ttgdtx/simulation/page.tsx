import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileSpreadsheet,
  Handshake,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Users,
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

type ContractRow = {
  partner_id: string;
  partner_code: string;
  partner_name: string;
  contract_code: string | null;
  contract_status: string | null;
  readiness_status: string;
  blocking_items: string[] | null;
};

type PolicyRow = {
  policy_id: string;
  partner_id: string;
  partner_code: string;
  partner_name: string;
  policy_code: string;
  policy_name: string;
  major_name: string | null;
  tuition_amount_vnd: number | string;
  readiness_status: string;
  blocking_items: string[] | null;
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
  major_name: string | null;
  policy_code: string | null;
  readiness_status: string;
  can_create_receivable: boolean;
  blocking_items: string[] | null;
  existing_receivable_code: string | null;
};

type ReceivableRow = {
  receivable_id: string;
  receivable_code: string;
  lead_id: string;
  lead_code: string | null;
  student_name: string;
  partner_id: string;
  partner_code: string;
  partner_name: string;
  policy_code: string | null;
  major_name: string;
  payable_amount_vnd: number | string;
  balance_amount_vnd: number | string;
  readiness_status: string;
  control_flags: string[] | null;
};

type PartnerSimulationRow = {
  partnerId: string;
  partnerCode: string;
  partnerName: string;
  contract: ContractRow | null;
  policies: PolicyRow[];
  candidates: CandidateRow[];
  receivables: ReceivableRow[];
};

const candidateFlagLabels: Record<string, string> = {
  LEAD_STATUS_NOT_READY:
    "Lead chưa đạt Đã nộp hồ sơ, Đủ điều kiện hoặc Đã nhập học",
  MISSING_TTGDTX_PARTNER: "Lead chưa gắn TTGDTX/đối tác",
  MISSING_PROGRAM: "Lead chưa gắn hệ đào tạo chuẩn",
  MISSING_MAJOR: "Lead chưa gắn ngành/nghề chuẩn",
  NO_MATCHING_READY_TUITION_POLICY:
    "Chưa có P2-02 học phí READY đúng TTGDTX và ngành",
  TUITION_POLICY_NOT_READY:
    "P2-02 còn thiếu hợp đồng, học phí, hạn thu hoặc chứng từ",
  RECEIVABLE_ALREADY_EXISTS: "Đã có công nợ P2-03 cho kỳ này",
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

function countBy<T>(rows: T[], predicate: (row: T) => boolean) {
  return rows.filter(predicate).length;
}

function money(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function canOpenSimulation(
  segmentId: string | null,
  roleCode: string | null,
  scopes: ScopeRow[],
  hasAnyTtgdtxRead: boolean,
) {
  if (roleCode === "ADMIN" || roleCode === "BGH") {
    return true;
  }

  if (!segmentId || !hasAnyTtgdtxRead) {
    return false;
  }

  return scopes.some((scope) => scope.segment_id === segmentId);
}

function leadBlockers(row: CandidateRow) {
  return (row.blocking_items ?? []).map(
    (flag) => candidateFlagLabels[flag] ?? flag,
  );
}

function statusBox(ok: boolean) {
  return ok
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-800";
}

function stepStatus(row: PartnerSimulationRow) {
  const contractOk = row.contract?.readiness_status === "READY";
  const policyOk = row.policies.some(
    (policy) => policy.readiness_status === "READY",
  );
  const leadReady = row.candidates.some(
    (candidate) => candidate.can_create_receivable,
  );
  const hasReceivable = row.receivables.length > 0;

  if (!contractOk) {
    return {
      label: "Chặn tại P2-01",
      detail: "Cần hợp đồng TTGDTX ACTIVE và đủ căn cứ pháp lý/kế toán.",
      href: "/ttgdtx",
      tone: "warn",
    };
  }

  if (!policyOk) {
    return {
      label: "Chặn tại P2-02",
      detail: "Cần chính sách học phí READY đúng TTGDTX và ngành.",
      href: "/ttgdtx/tuition",
      tone: "warn",
    };
  }

  if (!leadReady && !hasReceivable) {
    return {
      label: "Chờ lead đủ điều kiện",
      detail: "Cần lead đúng TTGDTX, đúng ngành và đủ trạng thái hồ sơ.",
      href: "/leads",
      tone: "warn",
    };
  }

  if (leadReady && !hasReceivable) {
    return {
      label: "Đạt mô phỏng",
      detail: "Có thể sang P2-03 tạo công nợ cho lead đủ điều kiện.",
      href: "/ttgdtx/receivables",
      tone: "ready",
    };
  }

  return {
    label: "Đã phát sinh P2-03",
    detail: "Đã có công nợ để kế toán theo dõi thu/đối soát.",
    href: "/ttgdtx/receivables",
    tone: "ready",
  };
}

function buildPartnerRows(
  contracts: ContractRow[],
  policies: PolicyRow[],
  candidates: CandidateRow[],
  receivables: ReceivableRow[],
) {
  const map = new Map<string, PartnerSimulationRow>();

  function ensurePartner(
    partnerId: string,
    partnerCode: string | null,
    partnerName: string | null,
  ) {
    if (!map.has(partnerId)) {
      map.set(partnerId, {
        partnerId,
        partnerCode: partnerCode ?? "Chưa có mã",
        partnerName: partnerName ?? "Chưa rõ TTGDTX",
        contract: null,
        policies: [],
        candidates: [],
        receivables: [],
      });
    }

    return map.get(partnerId)!;
  }

  for (const contract of contracts) {
    ensurePartner(
      contract.partner_id,
      contract.partner_code,
      contract.partner_name,
    ).contract = contract;
  }

  for (const policy of policies) {
    ensurePartner(policy.partner_id, policy.partner_code, policy.partner_name)
      .policies.push(policy);
  }

  for (const candidate of candidates) {
    if (!candidate.partner_id) {
      continue;
    }

    ensurePartner(
      candidate.partner_id,
      candidate.partner_code,
      candidate.partner_name,
    ).candidates.push(candidate);
  }

  for (const receivable of receivables) {
    ensurePartner(
      receivable.partner_id,
      receivable.partner_code,
      receivable.partner_name,
    ).receivables.push(receivable);
  }

  return [...map.values()].sort((a, b) =>
    a.partnerName.localeCompare(b.partnerName, "vi"),
  );
}

export default async function TtgdtxSimulationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    roleResult,
    contractReadResult,
    tuitionReadResult,
    receivableReadResult,
    segmentResult,
    scopeResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", { permission_name: "ttgdtx.contract.read" }),
    supabase.rpc("has_permission", { permission_name: "ttgdtx.tuition.read" }),
    supabase.rpc("has_permission", {
      permission_name: "ttgdtx.receivable.read",
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

  const segment = segmentResult.data;
  const roleCode = roleResult.data;
  const canReadAllSimulationData = roleCode === "ADMIN" || roleCode === "BGH";
  const canReadContracts =
    canReadAllSimulationData || Boolean(contractReadResult.data);
  const canReadPolicies =
    canReadAllSimulationData || Boolean(tuitionReadResult.data);
  const canReadReceivables =
    canReadAllSimulationData || Boolean(receivableReadResult.data);
  const canOpen = canOpenSimulation(
    segment?.id ?? null,
    roleCode,
    scopeResult.data ?? [],
    canReadContracts || canReadPolicies || canReadReceivables,
  );
  let dataError: { message: string } | null = null;
  let contracts: ContractRow[] = [];
  let policies: PolicyRow[] = [];
  let candidates: CandidateRow[] = [];
  let receivables: ReceivableRow[] = [];

  if (canOpen) {
    if (canReadContracts) {
      const contractResult = await supabase
        .from("ttgdtx_partner_contract_readiness")
        .select("*")
        .order("partner_name", { ascending: true })
        .returns<ContractRow[]>();

      contracts = contractResult.data ?? [];
      dataError = dataError ?? contractResult.error;
    }

    if (canReadPolicies) {
      const policyResult = await supabase
        .from("ttgdtx_tuition_policy_readiness")
        .select("*")
        .order("partner_name", { ascending: true })
        .order("major_name", { ascending: true })
        .returns<PolicyRow[]>();

      policies = policyResult.data ?? [];
      dataError = dataError ?? policyResult.error;
    }

    if (canReadReceivables) {
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
      dataError =
        dataError ?? candidateResult.error ?? receivableResult.error;
    }
  }

  const partnerRows = buildPartnerRows(
    contracts,
    policies,
    candidates,
    receivables,
  );
  const candidatesWithoutPartner = candidates.filter(
    (candidate) => !candidate.partner_id,
  );
  const readyCandidates = candidates.filter(
    (candidate) => candidate.can_create_receivable,
  );
  const blockedCandidates = candidates.filter(
    (candidate) => !candidate.can_create_receivable,
  );
  const readyPolicyCount = countBy(
    policies,
    (policy) => policy.readiness_status === "READY",
  );
  const readyContractCount = countBy(
    contracts,
    (contract) => contract.readiness_status === "READY",
  );

  return (
    <AppShell
      active="ttgdtx"
      title="P2-04 · Kiểm tra mô phỏng TTGDTX"
      description="Mô phỏng chuỗi vận hành TTGDTX: hợp đồng P2-01, học phí P2-02, lead đủ điều kiện và công nợ P2-03."
      workspaceSegmentId={segment?.id ?? null}
      workspaceReturnTo="/ttgdtx/simulation"
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
            <Link href="/ttgdtx/simulation">
              <RefreshCcw className="size-4" />
              Tải lại
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
            <Link href="/search?q=P2">
              <FileSearch className="size-4" />
              Tìm P2
            </Link>
          </Button>
        </>
      }
    >
      {!canOpen ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          Tài khoản hiện tại chưa được phân quyền xem chuỗi TTGDTX. Cần quyền
          P2-01/P2-02/P2-03 hoặc được phân vào đối tượng Trung cấp 9+ liên kết
          TTGDTX.
        </section>
      ) : dataError ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa đọc được dữ liệu mô phỏng</p>
              <p className="mt-1">
                Hãy kiểm tra đã chạy step88, step89 và step90. Chi tiết:{" "}
                {dataError.message}
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
                <h2 className="font-semibold">Nguyên tắc kiểm tra mô phỏng</h2>
                <p className="mt-1">
                  Trang này chỉ kiểm tra và chỉ đường sửa lỗi. Nó không tự thu
                  tiền, không tự tạo công nợ và không tự duyệt chi. Khi một dòng
                  đạt, hệ thống sẽ hiện rõ nút mở P2-03 để thầy/cô kiểm tra trước
                  khi tạo công nợ thật.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Handshake className="size-5 text-zinc-500" />
                <p className="text-sm text-zinc-500">P2-01 hợp đồng đạt</p>
              </div>
              <p className="mt-3 text-3xl font-semibold">
                {readyContractCount}/{contracts.length}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <WalletCards className="size-5 text-zinc-500" />
                <p className="text-sm text-zinc-500">P2-02 học phí đạt</p>
              </div>
              <p className="mt-3 text-3xl font-semibold">
                {readyPolicyCount}/{policies.length}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Users className="size-5 text-zinc-500" />
                <p className="text-sm text-zinc-500">Lead đạt để tạo công nợ</p>
              </div>
              <p className="mt-3 text-3xl font-semibold text-emerald-700">
                {readyCandidates.length}
              </p>
            </article>
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <ReceiptText className="size-5 text-zinc-500" />
                <p className="text-sm text-zinc-500">Công nợ đã tạo</p>
              </div>
              <p className="mt-3 text-3xl font-semibold">
                {receivables.length}
              </p>
            </article>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <div className="flex items-start gap-3">
                <ClipboardCheck className="mt-0.5 size-5 text-zinc-500" />
                <div>
                  <h2 className="text-lg font-semibold">
                    Bảng mô phỏng theo TTGDTX
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Mỗi dòng cho biết đang chặn ở P2-01, P2-02, lead hay đã sẵn
                    sàng sang P2-03.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-zinc-200">
              {partnerRows.length === 0 ? (
                <div className="p-6 text-sm text-zinc-500">
                  Chưa có TTGDTX nào trong phạm vi đang chọn.
                </div>
              ) : (
                partnerRows.map((row) => {
                  const status = stepStatus(row);
                  const contractOk = row.contract?.readiness_status === "READY";
                  const readyPolicies = row.policies.filter(
                    (policy) => policy.readiness_status === "READY",
                  ).length;
                  const readyLeads = row.candidates.filter(
                    (candidate) => candidate.can_create_receivable,
                  ).length;

                  return (
                    <article
                      key={row.partnerId}
                      className="grid gap-4 p-5 xl:grid-cols-[1fr_1fr_1fr_auto]"
                    >
                      <div>
                        <p className="font-semibold">{row.partnerName}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {row.partnerCode}
                        </p>
                        <span
                          className={`mt-3 inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                            status.tone === "ready"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {status.label}
                        </span>
                        <p className="mt-2 text-sm text-zinc-600">
                          {status.detail}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className={`rounded-lg border p-3 ${statusBox(contractOk)}`}>
                          <p className="font-medium">P2-01 hợp đồng</p>
                          <p className="mt-1">
                            {contractOk ? "Đạt" : "Chưa đạt"} ·{" "}
                            {row.contract?.contract_code ?? "Chưa có hợp đồng"}
                          </p>
                        </div>
                        <div
                          className={`rounded-lg border p-3 ${statusBox(
                            readyPolicies > 0,
                          )}`}
                        >
                          <p className="font-medium">P2-02 học phí</p>
                          <p className="mt-1">
                            {readyPolicies} chính sách READY / {row.policies.length}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div
                          className={`rounded-lg border p-3 ${statusBox(
                            readyLeads > 0 || row.receivables.length > 0,
                          )}`}
                        >
                          <p className="font-medium">Lead đủ điều kiện</p>
                          <p className="mt-1">
                            {readyLeads} sẵn sàng / {row.candidates.length} lead
                          </p>
                        </div>
                        <div
                          className={`rounded-lg border p-3 ${statusBox(
                            row.receivables.length > 0,
                          )}`}
                        >
                          <p className="font-medium">P2-03 công nợ</p>
                          <p className="mt-1">
                            {row.receivables.length} dòng đã tạo ·{" "}
                            {money(
                              row.receivables.reduce(
                                (total, item) =>
                                  total + Number(item.balance_amount_vnd ?? 0),
                                0,
                              ),
                            )}{" "}
                            còn phải thu
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center xl:justify-end">
                        <Button asChild variant="outline">
                          <Link href={status.href}>
                            Mở bước cần xử lý
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <h2 className="text-lg font-semibold">Lead cần xử lý để đạt</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Danh sách này chỉ hiện lỗi tại chỗ thiếu. Dữ liệu nào đúng thì
                giữ nguyên, không bắt nhập lại.
              </p>
            </div>

            <div className="divide-y divide-zinc-200">
              {blockedCandidates.length === 0 &&
              candidatesWithoutPartner.length === 0 ? (
                <div className="flex items-center gap-2 p-6 text-sm text-emerald-700">
                  <CheckCircle2 className="size-5" />
                  Không còn lead bị chặn trong phạm vi đang chọn.
                </div>
              ) : (
                [...candidatesWithoutPartner, ...blockedCandidates]
                  .filter(
                    (candidate, index, all) =>
                      all.findIndex((item) => item.lead_id === candidate.lead_id) ===
                      index,
                  )
                  .slice(0, 12)
                  .map((candidate) => {
                    const blockers = leadBlockers(candidate);

                    return (
                      <article
                        key={candidate.lead_id}
                        className="grid gap-4 p-5 lg:grid-cols-[1fr_1.5fr_auto]"
                      >
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
                        </div>

                        <ul className="space-y-2 text-sm text-amber-800">
                          {blockers.length > 0 ? (
                            blockers.map((blocker) => (
                              <li key={blocker} className="flex gap-2">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                <span>{blocker}</span>
                              </li>
                            ))
                          ) : (
                            <li className="flex gap-2 text-emerald-700">
                              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                              <span>Lead đã sẵn sàng tạo công nợ P2-03.</span>
                            </li>
                          )}
                        </ul>

                        <div className="flex items-center lg:justify-end">
                          <Button asChild variant="outline">
                            <Link href={`/leads/${candidate.lead_id}`}>
                              Mở lead
                              <ArrowRight className="size-4" />
                            </Link>
                          </Button>
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
