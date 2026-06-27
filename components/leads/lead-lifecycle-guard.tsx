import { AlertTriangle, ClipboardCheck, ShieldCheck } from "lucide-react";

import {
  leadLifecycleFinanceBoundaries,
  leadLifecyclePhases,
  leadLifecycleStatusLabels,
} from "@/lib/lead-lifecycle";

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
    </section>
  );
}
