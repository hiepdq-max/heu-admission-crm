import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";

import {
  PRODUCTION_EXECUTION_STEPS,
  PRODUCTION_GATE_HANDOVER_STEPS,
  PRODUCTION_GOVERNANCE_ASSURANCE_STEPS,
  PRODUCTION_INFRA_READINESS_STEPS,
  PRODUCTION_RISK_CLOSURE_STEPS,
  PRODUCTION_UAT_LAUNCH_STEPS,
  SAFE_ITERATION_STEPS,
} from "@/lib/production-readiness";

export function TtgdtxProductionExecutionQueue() {
  return (
    <section
      className="rounded-lg border border-indigo-200 bg-indigo-50 p-5 text-sm shadow-sm"
      data-ttgdtx-production-execution-queue="TTGDTX_9PLUS"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-4xl items-start gap-3">
          <ClipboardList className="mt-0.5 size-5 shrink-0 text-indigo-700" />
          <div>
            <h2 className="font-semibold text-indigo-950">
              TTGDTX production execution queue: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-indigo-900">
              Execute in this order: redaction, backup/restore, migration order,
              role UAT, P0-19, P2-17, P2-18, audit-log traceability,
              hard-delete conversion/waiver, P0-14 intake-ledger evidence
              binder, P0-15 final handoff summary, then final owner Go/No-Go.
              Do not skip ahead; every item needs controlled evidence and
              human owner sign-off.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-indigo-200 bg-white px-3 py-2 text-indigo-950">
          Final result stays NO-GO until signed owner GO exists.
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-indigo-200 bg-white p-4"
        data-ttgdtx-safe-iteration-loop="TTGDTX_9PLUS"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-indigo-950">
              Safe iteration loop: one small slice at a time
            </h3>
            <p className="mt-1 leading-6 text-indigo-900">
              Build rhythm: select one blocker, run the local audit, attach
              controlled proof, then advance only when the guard is green.
            </p>
          </div>
          <span className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold uppercase text-indigo-800">
            fail keeps NO-GO
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          {SAFE_ITERATION_STEPS.map((step) => (
            <article
              key={step.code}
              className="border-l-2 border-indigo-300 bg-indigo-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-indigo-700">
                {step.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
              <p className="mt-2 leading-5 text-zinc-700">{step.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-sky-200 bg-white p-4"
        data-ttgdtx-infra-readiness-plan="P0-03_STEP90_STEP110"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-sky-950">
              Infra readiness plan: P0-03 + Step90-Step110
            </h3>
            <p className="mt-1 leading-6 text-sky-900">
              Prove backup/restore dry-run first, then sign the migration order.
              No production migration runs from Codex/chat and any missing proof
              keeps production NO-GO.
            </p>
          </div>
          <span className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold uppercase text-sky-800">
            backup proof first
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {PRODUCTION_INFRA_READINESS_STEPS.map((step) => (
            <article
              key={step.code}
              className="border-l-2 border-sky-300 bg-sky-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-sky-700">
                {step.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {step.owner}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">{step.evidence}</p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Decision: {step.decisionValue}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {step.stopCondition}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Runbook: {step.runbook}
              </p>
              <p className="mt-1 text-xs font-medium text-zinc-600">
                Guard: {step.auditCommand}
              </p>
              <Link
                href={step.route}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase text-sky-700 hover:text-sky-950"
              >
                Open infra route
                <ArrowRight className="size-3" />
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-emerald-200 bg-white p-4"
        data-ttgdtx-gate-handover-plan="P0-19_P3-01_P3-02"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-emerald-950">
              Gate and handover readiness: P0-19 + P3-01/P3-02
            </h3>
            <p className="mt-1 leading-6 text-emerald-900">
              Prove legal/finance basis and lead handover UAT before any
              receivable reliance. Handover cannot bypass P0-19/P2-05/P2-03
              finance gates, and unsigned evidence keeps production NO-GO.
            </p>
          </div>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase text-emerald-800">
            finance gate first
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {PRODUCTION_GATE_HANDOVER_STEPS.map((step) => (
            <article
              key={step.code}
              className="border-l-2 border-emerald-300 bg-emerald-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-emerald-700">
                {step.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {step.owner}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">{step.evidence}</p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Decision: {step.decisionValue}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {step.stopCondition}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Runbook: {step.runbook}
              </p>
              <p className="mt-1 text-xs font-medium text-zinc-600">
                Guard: {step.auditCommand}
              </p>
              <Link
                href={step.route}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase text-emerald-700 hover:text-emerald-950"
              >
                Open gate route
                <ArrowRight className="size-3" />
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-violet-200 bg-white p-4"
        data-ttgdtx-governance-assurance-plan="P6-04_P6-03"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-violet-950">
              Governance assurance plan: P6-04 + P6-03
            </h3>
            <p className="mt-1 leading-6 text-violet-900">
              Prove role/workspace scope and audit-log traceability before
              owner review. Any role leak, missing trace row or unsigned
              governance UAT keeps production NO-GO.
            </p>
          </div>
          <span className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold uppercase text-violet-800">
            scope and trace required
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {PRODUCTION_GOVERNANCE_ASSURANCE_STEPS.map((step) => (
            <article
              key={step.code}
              className="border-l-2 border-violet-300 bg-violet-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-violet-700">
                {step.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {step.owner}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">{step.evidence}</p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Decision: {step.decisionValue}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {step.stopCondition}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Runbook: {step.runbook}
              </p>
              <p className="mt-1 text-xs font-medium text-zinc-600">
                Guard: {step.auditCommand}
              </p>
              <Link
                href={step.route}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase text-violet-700 hover:text-violet-950"
              >
                Open governance route
                <ArrowRight className="size-3" />
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-indigo-200 bg-white p-4"
        data-ttgdtx-uat-launch-plan="P2-18_P5-03"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-indigo-950">
              First UAT launch plan: P2-18 + P5-03
            </h3>
            <p className="mt-1 leading-6 text-indigo-900">
              Start signed browser UAT with the dashboard and Finance Desk
              tracks. Use synthetic accounts, store proof outside Git/Codex/chat
              and keep production NO-GO until owners sign.
            </p>
          </div>
          <span className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold uppercase text-amber-800">
            signed evidence required
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {PRODUCTION_UAT_LAUNCH_STEPS.map((step) => (
            <article
              key={step.code}
              className="border-l-2 border-amber-300 bg-amber-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-amber-700">
                {step.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {step.owner}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">{step.evidence}</p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Decision: {step.decisionValue}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {step.stopCondition}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Runbook: {step.runbook}
              </p>
              <p className="mt-1 text-xs font-medium text-zinc-600">
                Guard: {step.auditCommand}
              </p>
              <Link
                href={step.route}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase text-amber-700 hover:text-amber-950"
              >
                Open UAT route
                <ArrowRight className="size-3" />
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-rose-200 bg-white p-4"
        data-ttgdtx-risk-closure-plan="P6-06_P2-17"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-rose-950">
              Next risk closure plan: P6-06 + P2-17
            </h3>
            <p className="mt-1 leading-6 text-rose-900">
              Close hard-delete/cascade conversion-or-waiver and payout
              duplicate/dossier evidence before owner GO/NO-GO. Missing proof
              keeps production NO-GO.
            </p>
          </div>
          <span className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold uppercase text-rose-800">
            closure proof required
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {PRODUCTION_RISK_CLOSURE_STEPS.map((step) => (
            <article
              key={step.code}
              className="border-l-2 border-rose-300 bg-rose-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-rose-700">
                {step.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {step.owner}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">{step.evidence}</p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Decision: {step.decisionValue}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {step.stopCondition}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Runbook: {step.runbook}
              </p>
              <p className="mt-1 text-xs font-medium text-zinc-600">
                Guard: {step.auditCommand}
              </p>
              <Link
                href={step.route}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase text-rose-700 hover:text-rose-950"
              >
                Open closure route
                <ArrowRight className="size-3" />
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-3">
        {PRODUCTION_EXECUTION_STEPS.map((step, index) => (
          <article
            key={step.code}
            className="border-l-2 border-indigo-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-indigo-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-indigo-700">
                  {String(index + 1).padStart(2, "0")} - {step.code}
                </p>
                <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Owner: {step.owner}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">{step.proof}</p>
                {step.href ? (
                  <Link
                    href={step.href}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase text-indigo-700 hover:text-indigo-950"
                  >
                    Open workflow
                    <ArrowRight className="size-3" />
                  </Link>
                ) : (
                  <p className="mt-3 text-xs font-medium uppercase text-indigo-700">
                    Evidence pack required
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
