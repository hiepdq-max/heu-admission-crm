"use client";

import { useActionState } from "react";
import {
  ArrowRightLeft,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  Save,
  Send,
  XCircle,
} from "lucide-react";

import {
  createLeadHandoverAction,
  updateLeadHandoverAction,
  type HandoverFormState,
} from "@/app/leads/[id]/actions";
import { Button } from "@/components/ui/button";

export type LeadHandoverRow = {
  id: string;
  lead_id: string;
  handover_type: string;
  from_department: string;
  to_department: string;
  handover_status: string;
  requested_by: string | null;
  requested_at: string;
  accepted_by: string | null;
  accepted_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  note: string | null;
};

type LookupRow = {
  id: string;
  label: string;
};

type LeadHandoverPanelProps = {
  leadId: string;
  handovers: LeadHandoverRow[];
  users: LookupRow[];
  loadError?: string;
};

type HandoverAcceptanceItem = {
  caseId: string;
  requirement: string;
  minimumEvidence: string;
  stopCondition: string;
};

type HandoverDecisionItem = {
  caseId: string;
  decisionGate: string;
  requiredDecision: string;
  stopCondition: string;
};

const initialState: HandoverFormState = {};

const handoverTypeLabels: Record<string, string> = {
  ADMISSION_TO_CTHSSV: "Tuyển sinh -> CTHSSV",
  CTHSSV_TO_ACCOUNTING: "CTHSSV -> Kế toán",
  ADMISSION_TO_ACCOUNTING: "Tuyển sinh -> Kế toán",
};

const departmentLabels: Record<string, string> = {
  ADMISSION: "Tuyển sinh",
  CTHSSV: "CTHSSV",
  ACCOUNTING: "Kế toán",
};

const statusLabels: Record<string, string> = {
  REQUESTED: "Chờ nhận",
  ACCEPTED: "Đã nhận",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

const statusClasses: Record<string, string> = {
  REQUESTED: "border-amber-200 bg-amber-50 text-amber-800",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  CANCELLED: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

const handoverOptions = [
  {
    value: "ADMISSION_TO_CTHSSV",
    label: "Bàn giao hồ sơ đủ điều kiện cho CTHSSV",
  },
  {
    value: "CTHSSV_TO_ACCOUNTING",
    label: "CTHSSV bàn giao học viên cho Kế toán",
  },
  {
    value: "ADMISSION_TO_ACCOUNTING",
    label: "Bàn giao trực tiếp cho Kế toán",
  },
];

const handoverAcceptanceItems: HandoverAcceptanceItem[] = [
  {
    caseId: "P3-02-ACCEPT-01",
    requirement: "Complete handover packet",
    minimumEvidence:
      "Packet includes lead id/code, current status, segment, program/major, source/evidence reference and maker department.",
    stopCondition:
      "Stop if required identity, status, scope or evidence reference is missing.",
  },
  {
    caseId: "P3-02-ACCEPT-02",
    requirement: "Receiving role and workspace scope",
    minimumEvidence:
      "Receiver belongs to the target department and can only read scoped handover/student context.",
    stopCondition:
      "Stop if out-of-scope receiver can read, accept or reject the handover.",
  },
  {
    caseId: "P3-02-ACCEPT-03",
    requirement: "Accept/reject decision trace",
    minimumEvidence:
      "Accept or reject action records actor, timestamp, status and reason/note when rejecting or returning.",
    stopCondition:
      "Stop if decision is missing actor, timestamp, status or required rejection reason.",
  },
  {
    caseId: "P3-02-ACCEPT-04",
    requirement: "Finance boundary preserved",
    minimumEvidence:
      "KHTC can use accepted context only through P0-19, P2-05 and P2-03; handover itself creates no receivable.",
    stopCondition:
      "Stop if handover creates receivable, collects tuition, issues invoice, approves payment or marks revenue.",
  },
  {
    caseId: "P3-02-ACCEPT-05",
    requirement: "Redacted evidence only",
    minimumEvidence:
      "UAT evidence uses synthetic/redacted references and keeps raw PII, CCCD, phone, bank data and credentials out of Git/Codex/chat.",
    stopCondition:
      "Stop if raw controlled evidence is pasted into the app note, screenshot, repo or Codex/chat.",
  },
  {
    caseId: "P3-02-ACCEPT-06",
    requirement: "Human approval, audit and AI boundary",
    minimumEvidence:
      "Human accept/reject is auditable; AI suggestion is advisory and cannot accept, reject, waive or approve finance.",
    stopCondition:
      "PASS_LOCAL or AI output is treated as handover acceptance, UAT pass, finance approval or production GO.",
  },
];

const handoverDecisionItems: HandoverDecisionItem[] = [
  {
    caseId: "P3-02-DEC-01",
    decisionGate: "Handover packet readiness decision",
    requiredDecision:
      "Lead id/code, status, segment, program or major, source evidence reference and maker department are complete before handover reliance.",
    stopCondition:
      "Missing identity, status, segment, source reference, maker department or controlled packet ID keeps handover NO_GO.",
  },
  {
    caseId: "P3-02-DEC-02",
    decisionGate: "Receiver role and workspace decision",
    requiredDecision:
      "Receiving department and actor are allowed for the route, role and workspace scope being handed over.",
    stopCondition:
      "Out-of-scope receiver can read, accept, reject or rely on the packet.",
  },
  {
    caseId: "P3-02-DEC-03",
    decisionGate: "Accept or reject trace decision",
    requiredDecision:
      "Accept/reject action records actor, timestamp, status and reason when rejected or returned.",
    stopCondition:
      "Decision is missing actor, timestamp, final status, rejection reason or audit trail.",
  },
  {
    caseId: "P3-02-DEC-04",
    decisionGate: "Downstream reliance decision",
    requiredDecision:
      "CTHSSV, Dao Tao and KHTC may rely only on accepted handover context; KHTC still uses P0-19, P2-05 and P2-03 finance gates.",
    stopCondition:
      "Handover is treated as enrollment approval, receivable creation, tuition collection, invoice issuance, revenue recognition or finance posting.",
  },
  {
    caseId: "P3-02-DEC-05",
    decisionGate: "Evidence redaction decision",
    requiredDecision:
      "Evidence is synthetic or redacted and stored as controlled references outside Git/Codex/chat.",
    stopCondition:
      "Raw PII, CCCD, phone, bank data, parent data, credentials, screenshots or uncontrolled evidence enter the app note, repo or Codex/chat.",
  },
  {
    caseId: "P3-02-DEC-06",
    decisionGate: "Human handover decision recorded",
    requiredDecision:
      "Process owner records P3_02_HANDOVER_READY, NO_GO or BLOCKED with signer, date, route result and evidence reference.",
    stopCondition:
      "PASS_LOCAL or AI output is treated as signed handover acceptance, UAT acceptance, finance approval, owner waiver or production GO.",
  },
];

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function toMap(rows: LookupRow[]) {
  return new Map(rows.map((row) => [row.id, row.label]));
}

function fieldValue(state: HandoverFormState, name: string, fallback = "") {
  return state.fields?.[name] ?? fallback;
}

function fieldError(state: HandoverFormState, name: string) {
  return state.fieldErrors?.[name];
}

function CreateHandoverForm({
  leadId,
  activeTypes,
}: {
  leadId: string;
  activeTypes: Set<string>;
}) {
  const [state, formAction, isPending] = useActionState(
    createLeadHandoverAction,
    initialState,
  );

  return (
    <form action={formAction} className="rounded-md border border-zinc-200 p-4">
      <input type="hidden" name="lead_id" value={leadId} />

      <div className="grid gap-3 lg:grid-cols-[280px_1fr_auto]">
        <div className="space-y-2">
          <label
            htmlFor="handover_type"
            className="text-sm font-medium text-zinc-700"
          >
            Loại bàn giao
          </label>
          <select
            id="handover_type"
            name="handover_type"
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200"
            defaultValue={fieldValue(state, "handover_type")}
          >
            <option value="">Chọn loại bàn giao</option>
            {handoverOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={activeTypes.has(option.value)}
              >
                {option.label}
              </option>
            ))}
          </select>
          {fieldError(state, "handover_type") ? (
            <p className="text-xs font-medium text-rose-600">
              {fieldError(state, "handover_type")}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="note" className="text-sm font-medium text-zinc-700">
            Ghi chú bàn giao
          </label>
          <input
            id="note"
            name="note"
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200"
            defaultValue={fieldValue(state, "note")}
            placeholder="VD: Hồ sơ đã đủ, chờ CTHSSV ra quyết định mở lớp."
          />
        </div>

        <div className="flex items-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Tạo bàn giao
          </Button>
        </div>
      </div>

      {state.error ? (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </div>
      ) : null}
    </form>
  );
}

function UpdateHandoverForm({
  leadId,
  handover,
}: {
  leadId: string;
  handover: LeadHandoverRow;
}) {
  const [state, formAction, isPending] = useActionState(
    updateLeadHandoverAction,
    initialState,
  );

  if (handover.handover_status !== "REQUESTED") {
    return null;
  }

  return (
    <form action={formAction} className="mt-4 grid gap-3 lg:grid-cols-[200px_1fr_auto]">
      <input type="hidden" name="lead_id" value={leadId} />
      <input type="hidden" name="handover_id" value={handover.id} />

      <div className="space-y-2">
        <label
          htmlFor={`handover-status-${handover.id}`}
          className="text-xs font-medium text-zinc-600"
        >
          Xử lý
        </label>
        <select
          id={`handover-status-${handover.id}`}
          name="handover_status"
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200"
          defaultValue={fieldValue(state, "handover_status", "ACCEPTED")}
        >
          <option value="ACCEPTED">Nhận bàn giao</option>
          <option value="REJECTED">Từ chối</option>
        </select>
        {fieldError(state, "handover_status") ? (
          <p className="text-xs font-medium text-rose-600">
            {fieldError(state, "handover_status")}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`handover-note-${handover.id}`}
          className="text-xs font-medium text-zinc-600"
        >
          Ghi chú xử lý
        </label>
        <input
          id={`handover-note-${handover.id}`}
          name="note"
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200"
          defaultValue={fieldValue(state, "note")}
          placeholder="Nhập số quyết định, lý do từ chối hoặc ghi chú kế toán."
        />
        {fieldError(state, "note") ? (
          <p className="text-xs font-medium text-rose-600">
            {fieldError(state, "note")}
          </p>
        ) : null}
      </div>

      <div className="flex items-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Lưu xử lý
        </Button>
      </div>

      {state.error ? (
        <div className="lg:col-span-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="lg:col-span-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </div>
      ) : null}
    </form>
  );
}

export function LeadHandoverPanel({
  leadId,
  handovers,
  users,
  loadError,
}: LeadHandoverPanelProps) {
  const userMap = toMap(users);
  const activeTypes = new Set(
    handovers
      .filter((handover) =>
        ["REQUESTED", "ACCEPTED"].includes(handover.handover_status),
      )
      .map((handover) => handover.handover_type),
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <ArrowRightLeft className="size-5 text-zinc-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Bàn giao liên phòng</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Tuyển sinh bàn giao hồ sơ đủ điều kiện cho CTHSSV; CTHSSV nhận
              và bàn giao tiếp cho Kế toán để theo dõi học sinh, học phí và
              công nợ.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div
          className="border-l-2 border-sky-300 bg-sky-50/70 p-4 text-sm"
          data-heu-lead-handover-acceptance-matrix="P3-02"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold text-sky-950">
                <ClipboardCheck className="size-4 text-sky-700" />
                <span>
                  P3-02 lead-to-student handover acceptance matrix: PASS_LOCAL
                  only
                </span>
              </div>
              <p className="mt-2 leading-6 text-sky-900">
                Handover can support downstream student or finance context only
                when the packet is complete, receiver scope is valid, the
                accept/reject trace is auditable, finance gates remain separate,
                evidence is redacted and human approval is explicit.
              </p>
            </div>
            <div className="min-w-72 border border-sky-200 bg-white px-3 py-2 text-sky-950">
              Decision:
              <span className="mt-1 block font-mono text-xs">
                P3_02_ACCEPT / FAIL / BLOCKED
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {handoverAcceptanceItems.map((item) => (
              <div
                key={item.caseId}
                className="border-l-2 border-sky-300 bg-white px-3 py-3"
              >
                <p className="text-xs font-semibold uppercase text-sky-700">
                  {item.caseId}
                </p>
                <p className="mt-1 font-medium text-zinc-950">
                  {item.requirement}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  Minimum evidence: {item.minimumEvidence}
                </p>
                <p className="mt-2 leading-5 text-rose-800">
                  Stop condition: {item.stopCondition}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="border-l-2 border-indigo-300 bg-indigo-50/70 p-4 text-sm"
          data-heu-lead-handover-decision-manifest="P3-02"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold text-indigo-950">
                <ClipboardCheck className="size-4 text-indigo-700" />
                <span>
                  P3-02 handover decision manifest: PASS_LOCAL only
                </span>
              </div>
              <p className="mt-2 leading-6 text-indigo-900">
                Use after the acceptance matrix. It prepares a human handover
                reliance decision only and does not approve enrollment,
                receivable creation, tuition collection, invoice issuance,
                revenue recognition, finance posting, UAT acceptance, owner
                waiver or production GO.
              </p>
            </div>
            <div className="min-w-72 border border-indigo-200 bg-white px-3 py-2 text-indigo-950">
              Decision:
              <span className="mt-1 block font-mono text-xs">
                P3_02_HANDOVER_READY / NO_GO / BLOCKED
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {handoverDecisionItems.map((item) => (
              <div
                key={item.caseId}
                className="border-l-2 border-indigo-300 bg-white px-3 py-3"
              >
                <p className="text-xs font-semibold uppercase text-indigo-700">
                  {item.caseId}
                </p>
                <p className="mt-1 font-medium text-zinc-950">
                  {item.decisionGate}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  Required decision: {item.requiredDecision}
                </p>
                <p className="mt-2 leading-5 text-rose-800">
                  Stop condition: {item.stopCondition}
                </p>
              </div>
            ))}
          </div>
        </div>

        {loadError ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Chưa đọc được bảng bàn giao. Hãy chạy SQL
            database/step38_user_scopes_and_handovers.sql rồi tải lại trang.
            Chi tiết: {loadError}
          </div>
        ) : null}

        <CreateHandoverForm leadId={leadId} activeTypes={activeTypes} />

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Lịch sử bàn giao</h4>
          {handovers.length === 0 ? (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
              Chưa có bàn giao liên phòng cho lead này.
            </div>
          ) : (
            handovers.map((handover) => (
              <div
                key={handover.id}
                className="rounded-md border border-zinc-200 p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="font-medium text-zinc-950">
                        {handoverTypeLabels[handover.handover_type] ??
                          handover.handover_type}
                      </h5>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${
                          statusClasses[handover.handover_status] ??
                          "border-zinc-200 bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {handover.handover_status === "ACCEPTED" ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : handover.handover_status === "REJECTED" ? (
                          <XCircle className="size-3.5" />
                        ) : (
                          <Clock3 className="size-3.5" />
                        )}
                        {statusLabels[handover.handover_status] ??
                          handover.handover_status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-500">
                      {departmentLabels[handover.from_department] ??
                        handover.from_department}
                      {" -> "}
                      {departmentLabels[handover.to_department] ??
                        handover.to_department}
                    </p>
                    {handover.note ? (
                      <p className="mt-2 text-sm leading-6 text-zinc-700">
                        {handover.note}
                      </p>
                    ) : null}
                  </div>

                  <div className="min-w-[260px] rounded-md bg-zinc-50 p-3 text-xs leading-6 text-zinc-600">
                    <p>
                      Tạo: {formatDateTime(handover.requested_at)} bởi{" "}
                      {handover.requested_by
                        ? userMap.get(handover.requested_by) ?? "Không rõ"
                        : "Không rõ"}
                    </p>
                    <p>
                      Nhận: {formatDateTime(handover.accepted_at)}{" "}
                      {handover.accepted_by
                        ? `bởi ${userMap.get(handover.accepted_by) ?? "Không rõ"}`
                        : ""}
                    </p>
                    <p>
                      Từ chối: {formatDateTime(handover.rejected_at)}{" "}
                      {handover.rejected_by
                        ? `bởi ${userMap.get(handover.rejected_by) ?? "Không rõ"}`
                        : ""}
                    </p>
                  </div>
                </div>

                <UpdateHandoverForm leadId={leadId} handover={handover} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
