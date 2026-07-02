import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FileCheck2,
  Route,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import {
  SIGNED_UAT_AUTHORITY_ACTIONS,
  SIGNED_UAT_EXECUTION_ROUTES,
} from "@/lib/production-readiness";

const summaryCards = [
  {
    title: "Start with controlled evidence",
    detail:
      "P0-10 runs before screenshots, vouchers, backup proof or signed UAT notes are referenced.",
  },
  {
    title: "Prove access before trace",
    detail:
      "P6-04 role/workspace UAT runs before P6-03 audit-log traceability sampling.",
  },
  {
    title: "Keep result state explicit",
    detail:
      "Every route ends as SIGNED_UAT_READY, NO_GO or BLOCKED; PASS_LOCAL is never owner acceptance.",
  },
];

const trackerHandoff = [
  {
    label: "Result tracker",
    value: "TTGDTX_UAT_EXECUTION_LOG_20260625.md Section 5.2",
  },
  {
    label: "Current state",
    value: "11 UAT-ROUTE rows remain PENDING until signed evidence exists.",
  },
  {
    label: "Required record",
    value:
      "Controlled evidence reference, redaction reviewer, result, reviewer and owner signature.",
  },
];

export function TtgdtxSignedUatExecutionRoutingHub() {
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white text-sm shadow-sm"
      data-ttgdtx-signed-uat-execution-routing-hub="P0-08_UAT_ROUTING"
    >
      <div className="border-b border-zinc-200 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-4xl items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
              <Route className="size-5 text-zinc-700" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-zinc-950">
                  TTGDTX signed UAT execution routing hub: PASS_LOCAL only
                </h2>
                <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                  SIGNED_UAT_READY / NO_GO / BLOCKED
                </span>
              </div>
              <p className="mt-2 leading-6 text-zinc-600">
                This hub turns the remaining signed TTGDTX/Finance UAT work into
                one execution route list. It shows the route to test, runbook,
                owner, minimum proof and stop condition before any owner relies
                on finance, dashboard, migration or production evidence.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold uppercase text-rose-700">
            production no-go
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.title} className="rounded-md bg-zinc-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-zinc-500">
              <ShieldCheck className="size-4" />
              {card.title}
            </div>
            <p className="mt-3 leading-6 text-zinc-700">{card.detail}</p>
          </article>
        ))}
      </div>

      <div
        className="border-t border-zinc-200 bg-sky-50/50 p-5"
        data-ttgdtx-uat-route-tracker-handoff="SECTION_5_2"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-sky-800">
          <FileCheck2 className="size-4" />
          Operator tracker handoff
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {trackerHandoff.map((item) => (
            <div key={item.label} className="rounded-md bg-white p-3">
              <div className="text-[11px] font-semibold uppercase text-zinc-500">
                {item.label}
              </div>
              <div className="mt-2 leading-6 text-zinc-800">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="border-t border-zinc-200 bg-amber-50/50 p-5"
        data-ttgdtx-signed-uat-authority-action-queue="P0-08_AUTHORITY_ACTIONS"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-amber-800">
              <UserCheck className="size-4" />
              Authority action queue
            </div>
            <p className="mt-2 max-w-4xl leading-6 text-amber-950">
              These rows show who must confirm the next UAT handoff facts
              outside Git/Codex/chat. They are task routing only; they do not
              execute UAT, accept evidence or sign owner results.
            </p>
          </div>
          <span className="inline-flex rounded-md border border-amber-200 bg-white px-2 py-1 font-mono text-xs font-semibold text-amber-800">
            SIGNED_UAT_AUTHORITY_ACTION_READY / NO_GO / BLOCKED
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {SIGNED_UAT_AUTHORITY_ACTIONS.map((item) => (
            <article
              key={item.code}
              className="rounded-md border border-amber-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold text-amber-800">
                  {item.code}
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  {item.route}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-zinc-950">
                {item.authority}
              </h3>
              <p className="mt-2 leading-6 text-zinc-700">
                {item.actionNeeded}
              </p>
              <div className="mt-3 rounded-md bg-zinc-50 p-3">
                <div className="text-[11px] font-semibold uppercase text-zinc-500">
                  Safe record
                </div>
                <p className="mt-2 leading-6 text-zinc-700">
                  {item.safeRecord}
                </p>
              </div>
              <div className="mt-3 font-mono text-xs font-semibold text-amber-800">
                {item.decisionValue}
              </div>
              <p className="mt-3 leading-6 text-rose-700">
                {item.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-200 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Minimum proof</th>
                <th className="px-4 py-3">Decision lane</th>
                <th className="px-4 py-3">Stop condition</th>
                <th className="px-4 py-3">Guard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {SIGNED_UAT_EXECUTION_ROUTES.map((row) => (
                <tr key={row.order} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-mono text-xs text-zinc-500">
                      {row.order}
                    </div>
                    <div className="mt-1 font-mono text-xs font-semibold text-zinc-800">
                      {row.code}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-zinc-950">{row.title}</p>
                    <p className="mt-2 font-mono text-xs text-zinc-500">
                      {row.runbook}
                    </p>
                    <Link
                      href={row.route}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase text-sky-700 hover:text-sky-950"
                    >
                      Open route
                      <ArrowRight className="size-3" />
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-zinc-700">{row.owner}</td>
                  <td className="px-4 py-4 leading-6 text-zinc-600">
                    {row.minimumProof}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs font-semibold text-amber-800">
                      {row.decisionValue}
                    </span>
                  </td>
                  <td className="px-4 py-4 leading-6 text-rose-700">
                    {row.stopCondition}
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-zinc-600">
                      {row.auditCommand}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 border-t border-zinc-200 bg-zinc-50 p-5 lg:grid-cols-2">
        <div className="flex items-start gap-3 rounded-md border border-zinc-200 bg-white p-4">
          <ClipboardList className="mt-0.5 size-5 shrink-0 text-zinc-600" />
          <div>
            <h3 className="font-semibold text-zinc-950">
              Closure rule
            </h3>
            <p className="mt-2 leading-6 text-zinc-700">
              All rows need controlled evidence reference, redaction reviewer,
              route result, reviewer name and required owner signature outside
              Git/Codex/chat before the UAT result can leave NO-GO.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <h3 className="font-semibold text-amber-950">
              Strict boundary
            </h3>
            <p className="mt-2 leading-6 text-amber-900">
              PASS_LOCAL does not execute UAT, accept evidence, sign owner
              results, grant access, approve finance action, approve migration,
              approve owner GO/NO-GO or mark production GO.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 px-5 py-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-zinc-500">
          <FileCheck2 className="size-4" />
          Evidence references only, never raw evidence
        </div>
      </div>
    </section>
  );
}
