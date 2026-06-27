import { AlertTriangle, ClipboardCheck, ShieldCheck } from "lucide-react";

import {
  leadLifecycleFinanceBoundaries,
  leadLifecyclePhases,
  leadLifecycleStatusLabels,
} from "@/lib/lead-lifecycle";

type LeadLifecycleAcceptanceItem = {
  caseId: string;
  requirement: string;
  minimumEvidence: string;
  stopCondition: string;
};

type LeadLifecycleHandoverUatItem = {
  caseId: string;
  actor: string;
  route: string;
  expectedEvidence: string;
  stopCondition: string;
};

const leadLifecycleAcceptanceItems: LeadLifecycleAcceptanceItem[] = [
  {
    caseId: "P3-01-ACCEPT-01",
    requirement: "Scoped lead identity and source",
    minimumEvidence:
      "Lead has lead id/code, source, admission segment, owner and workspace scope before it can be used in reports or handover.",
    stopCondition:
      "Stop if source, owner, segment or workspace scope is missing or unclear.",
  },
  {
    caseId: "P3-01-ACCEPT-02",
    requirement: "Status transition evidence",
    minimumEvidence:
      "FOLLOW_UP has next_followup_at, LOST has lost_reason, and every status change has actor/time/activity context.",
    stopCondition:
      "Stop if a required reason, date, actor or timestamp is missing.",
  },
  {
    caseId: "P3-01-ACCEPT-03",
    requirement: "Document and evidence readiness",
    minimumEvidence:
      "DOCUMENT_PENDING and DOCUMENT_SUBMITTED show checklist state and redacted source/evidence reference.",
    stopCondition:
      "Stop if raw PII, CCCD, phone, bank data, vouchers, credentials or private forms are pasted into Git/Codex/chat.",
  },
  {
    caseId: "P3-01-ACCEPT-04",
    requirement: "Eligibility gate before finance",
    minimumEvidence:
      "ELIGIBLE and ENROLLED are allowed only after P0-19 legal/tuition gate is accepted for the lead major/program.",
    stopCondition:
      "Stop if eligibility or enrollment bypasses P0-19, P2-01, P2-02 or scoped owner review.",
  },
  {
    caseId: "P3-01-ACCEPT-05",
    requirement: "P3-02 handover boundary",
    minimumEvidence:
      "P3-02 handover packet is requested, accepted or rejected by scoped receiver before finance relies on the lead context.",
    stopCondition:
      "Stop if KHTC or another department relies on an unaccepted or out-of-scope handover.",
  },
  {
    caseId: "P3-01-ACCEPT-06",
    requirement: "No finance, AI or production approval",
    minimumEvidence:
      "Lead lifecycle evidence states that P2-05/P2-03 remain finance gates and AI output is advisory only.",
    stopCondition:
      "PASS_LOCAL is treated as UAT acceptance, receivable approval, revenue approval or production GO.",
  },
];

const leadLifecycleHandoverUatItems: LeadLifecycleHandoverUatItem[] = [
  {
    caseId: "P3-UAT-01",
    actor: "UAT_TUYEN_SINH_TTGDTX",
    route: "/leads",
    expectedEvidence:
      "Scoped lead list shows only assigned/allowed TTGDTX leads with source, segment, owner and status context.",
    stopCondition:
      "Stop if out-of-scope leads, raw private evidence or unrestricted finance totals are visible.",
  },
  {
    caseId: "P3-UAT-02",
    actor: "UAT_TUYEN_SINH_TTGDTX",
    route: "/leads/[id]",
    expectedEvidence:
      "FOLLOW_UP requires next_followup_at and LOST requires lost_reason before the status change is accepted.",
    stopCondition:
      "Stop if a required date/reason can be bypassed or a status change lacks actor/time trace.",
  },
  {
    caseId: "P3-UAT-03",
    actor: "UAT_TUYEN_SINH_TTGDTX + UAT_PHAP_CHE",
    route: "/leads/[id]",
    expectedEvidence:
      "ELIGIBLE/ENROLLED is blocked until P0-19 legal/tuition gate, P2-01 contract master and P2-02 tuition policy are ready.",
    stopCondition:
      "Stop if lead lifecycle creates receivable, tuition collection, invoice, revenue or finance approval.",
  },
  {
    caseId: "P3-UAT-04",
    actor: "UAT_TUYEN_SINH_TTGDTX -> UAT_CTHSSV",
    route: "/leads/[id]",
    expectedEvidence:
      "Handover packet includes lead id/code, status, segment, program/major, source reference and maker department.",
    stopCondition:
      "Stop if handover packet is accepted without scoped packet identity or controlled evidence reference.",
  },
  {
    caseId: "P3-UAT-05",
    actor: "UAT_CTHSSV + UAT_DAO_TAO",
    route: "/leads/[id]",
    expectedEvidence:
      "Receiving department can accept or reject only scoped handover packets and rejection includes a reason.",
    stopCondition:
      "Stop if an out-of-scope receiver can read, accept, reject or rely on the handover.",
  },
  {
    caseId: "P3-UAT-06",
    actor: "UAT_KHTC_TTGDTX_OPERATOR",
    route: "/leads/[id]",
    expectedEvidence:
      "KHTC can rely on accepted handover context only through P0-19, P2-05 and P2-03 finance gates.",
    stopCondition:
      "Stop if KHTC relies on unaccepted handover or P3 evidence directly creates receivable/payment state.",
  },
  {
    caseId: "P3-UAT-07",
    actor: "UAT_OUT_OF_SCOPE_STAFF",
    route: "/leads, /leads/[id]",
    expectedEvidence:
      "Out-of-scope user is blocked or sees an empty scoped state without private lead/handover detail.",
    stopCondition:
      "Stop if workspace filtering is UI-only and server data still leaks.",
  },
  {
    caseId: "P3-UAT-08",
    actor: "Audit + Process owner",
    route: "Controlled evidence folder",
    expectedEvidence:
      "Redacted screenshots, route/account labels, sampled audit rows and P3_01/P3_02 decisions are signed outside Codex/chat.",
    stopCondition:
      "Stop if PASS_LOCAL or AI output is treated as signed UAT, handover acceptance, finance approval or production GO.",
  },
];

export function LeadLifecycleGuard() {
  return (
    <section
      data-heu-lead-lifecycle-guard="P3-01"
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-700" />
            <h2 className="text-base font-semibold text-zinc-950">
              P3-01 Lead lifecycle standard
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            PASS_LOCAL only. Lead đi từ tiếp nhận, chăm sóc, hồ sơ, đủ điều
            kiện, nhập học/bàn giao đến đóng ngoại lệ; P3-02 mới là bàn giao
            liên phòng và P2-05/P2-03 vẫn là gate tài chính.
          </p>
          <p className="mt-1 text-xs font-medium uppercase text-zinc-500">
            Control chain: P3-02 handover; P2-05/P2-03 remain final finance
            controls.
          </p>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              No raw form dump into AI. Không paste passwords, OTPs,
              service-role keys, raw student PII, CCCD, phone, bank data,
              vouchers or payment evidence vào Git/Codex/chat.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Phase</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Control</th>
              <th className="px-4 py-3">Stop condition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {leadLifecyclePhases.map((phase) => (
              <tr key={phase.code} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-950">{phase.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{phase.code}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {phase.statuses.map((status) => (
                      <span
                        key={status}
                        className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700"
                      >
                        {leadLifecycleStatusLabels[status]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-700">{phase.owner}</td>
                <td className="px-4 py-3 text-zinc-700">
                  <p>{phase.requiredControl}</p>
                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    {phase.nextGate}
                  </p>
                </td>
                <td className="px-4 py-3 text-zinc-700">{phase.stopCondition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-start gap-2">
            <ClipboardCheck className="mt-0.5 size-4 text-emerald-700" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Server-side checks already required
              </p>
              <p className="mt-1 text-sm leading-6 text-emerald-800">
                FOLLOW_UP requires next_followup_at; LOST requires lost_reason;
                ELIGIBLE/ENROLLED require legal/tuition gate before finance use.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
          <p className="text-sm font-semibold text-rose-900">
            Lead lifecycle does not
          </p>
          <p className="mt-1 text-sm leading-6 text-rose-800">
            {leadLifecycleFinanceBoundaries.join(", ")}.
          </p>
        </div>
      </div>

      <div
        className="mt-5 border-l-2 border-emerald-300 bg-emerald-50/70 p-4"
        data-heu-lead-lifecycle-acceptance-matrix="P3-01"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-4 text-emerald-700" />
              <p className="text-sm font-semibold text-emerald-950">
                P3-01 lead lifecycle acceptance matrix: PASS_LOCAL only
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-emerald-900">
              A lead can support handover or downstream finance context only
              after scoped identity, status-transition evidence, document
              readiness, eligibility gate, P3-02 handover boundary and no-AI/no-
              finance approval boundaries are proven.
            </p>
          </div>
          <div className="min-w-72 border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-950">
            Decision:
            <span className="mt-1 block font-mono text-xs">
              P3_01_ACCEPT / FAIL / BLOCKED
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {leadLifecycleAcceptanceItems.map((item) => (
            <div key={item.caseId} className="border-l-2 border-emerald-300 bg-white px-3 py-3">
              <p className="text-xs font-semibold uppercase text-emerald-700">
                {item.caseId}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-950">
                {item.requirement}
              </p>
              <p className="mt-2 text-sm leading-5 text-zinc-700">
                Minimum evidence: {item.minimumEvidence}
              </p>
              <p className="mt-2 text-sm leading-5 text-rose-800">
                Stop condition: {item.stopCondition}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-5 border-l-2 border-sky-300 bg-sky-50/70 p-4"
        data-heu-lead-lifecycle-handover-uat-pack="P3-01-P3-02"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-4 text-sky-700" />
              <p className="text-sm font-semibold text-sky-950">
                P3-01/P3-02 UAT execution pack: PASS_LOCAL only
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-sky-900">
              Run this pack with synthetic or redacted evidence before any
              department relies on lead lifecycle or handover data. Required
              signers are Tuyen Sinh, CTHSSV, Dao Tao, KHTC, IT_DATA and Audit.
            </p>
          </div>
          <div className="min-w-72 border border-sky-200 bg-white px-3 py-2 text-sm text-sky-950">
            Runbook:
            <span className="mt-1 block font-mono text-xs">
              HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {leadLifecycleHandoverUatItems.map((item) => (
            <div key={item.caseId} className="border-l-2 border-sky-300 bg-white px-3 py-3">
              <p className="text-xs font-semibold uppercase text-sky-700">
                {item.caseId}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-950">
                {item.actor}
              </p>
              <p className="mt-1 text-xs font-medium text-zinc-500">
                Route: {item.route}
              </p>
              <p className="mt-2 text-sm leading-5 text-zinc-700">
                Expected evidence: {item.expectedEvidence}
              </p>
              <p className="mt-2 text-sm leading-5 text-rose-800">
                Stop condition: {item.stopCondition}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm leading-6 text-sky-900">
          PASS_LOCAL does not accept UAT, approve handover reliance, create
          finance facts, waive evidence, approve owner sign-off or mark
          production GO.
        </p>
      </div>
    </section>
  );
}
