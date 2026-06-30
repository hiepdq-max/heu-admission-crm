import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";

import {
  PRODUCTION_EXECUTION_STEPS,
  PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES,
  PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS,
  PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE,
  PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES,
  PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS,
  PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX,
  PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE,
  PRODUCTION_FINANCE_DAY_ONE_RUNBOOK,
  PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS,
  PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS,
  PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST,
  PRODUCTION_FINANCE_DAY_ONE_START_GATES,
  PRODUCTION_FINANCE_UAT_FIRST_PASS_STEPS,
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
              tracks. Use synthetic accounts plus P6-04 real-accounting
              queue/result proof, store proof outside Git/Codex/chat and keep
              production NO-GO until owners sign.
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
        className="mt-5 rounded-lg border border-amber-200 bg-white p-4"
        data-ttgdtx-finance-first-uat-checklist="P2-18_P5-03"
        data-ttgdtx-finance-first-uat-range="FIN-UAT-01_FIN-UAT-05"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-amber-950">
              First signed finance UAT checklist: P2-18 + P5-03
            </h3>
            <p className="mt-1 leading-6 text-amber-900">
              Before running real-accounting browser UAT, confirm P0-10
              evidence redaction, P6-04 real users, dashboard reconciliation,
              Finance Desk read-only behavior and P0-14/P0-17 handoff are
              ready. This is a launch checklist only, not UAT acceptance.
            </p>
          </div>
          <span className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold uppercase text-amber-800">
            P2_18_P5_03_FIRST_UAT_READY / NO_GO / BLOCKED
          </span>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-5">
          {PRODUCTION_FINANCE_UAT_FIRST_PASS_STEPS.map((step) => (
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
              <p className="mt-2 leading-5 text-zinc-700">
                {step.requiredProof}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {step.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-emerald-200 bg-white p-4"
        data-ttgdtx-finance-day-one-start-gates="P0-03_P0-10_P6-04_P0-14_P0-17"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-emerald-950">
              Finance Day-1 start gates before account activation
            </h3>
            <p className="mt-1 leading-6 text-emerald-900">
              Before any real-accounting invite/create, confirm backup/restore
              evidence, signed finance UAT route readiness, controlled
              redaction storage, result-ledger path and P0-17 access-closure
              path. Missing proof keeps the first account closed.
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-800">
              Checklist: {PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST}
            </p>
          </div>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase text-emerald-800">
            FIN_START_READY / NO_GO / BLOCKED
          </span>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-5">
          {PRODUCTION_FINANCE_DAY_ONE_START_GATES.map((gate) => (
            <article
              key={gate.code}
              className="border-l-2 border-emerald-300 bg-emerald-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-emerald-700">
                {gate.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{gate.title}</p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {gate.owner}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                {gate.requiredProof}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {gate.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-blue-200 bg-white p-4"
        data-ttgdtx-finance-day-one-account-activation="P0-17_P6-04"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-blue-950">
              Finance Day-1 account activation handoff
            </h3>
            <p className="mt-1 leading-6 text-blue-900">
              Before any real-accounting login, record the approved account
              label, secure invite/create status, HEU profile link, narrow
              business scope and P6-04 pre-login result. Credential material
              stays outside Git/Codex/chat.
            </p>
            <p className="mt-1 text-xs font-medium text-blue-800">
              Template: {PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE}
            </p>
          </div>
          <span className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold uppercase text-blue-800">
            FIN_ACTIVATION_READY / NO_GO / BLOCKED
          </span>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-5">
          {PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS.map((item) => (
            <article
              key={item.code}
              className="border-l-2 border-blue-300 bg-blue-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-blue-700">
                {item.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {item.owner}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                {item.requiredProof}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-violet-200 bg-white p-4"
        data-ttgdtx-finance-day-one-p6-04-prelogin-matrix="P6-04_P0-17"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-violet-950">
              Finance Day-1 P6-04 pre-login route matrix
            </h3>
            <p className="mt-1 leading-6 text-violet-900">
              Before P2-18, P5-03 or P2-17 opens with a real-accounting
              account, record the allowed route family, blocked route family,
              required result and negative-control result. Keep filled evidence
              outside Git/Codex/chat.
            </p>
            <p className="mt-1 text-xs font-medium text-violet-800">
              Matrix: {PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX}
            </p>
          </div>
          <span className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold uppercase text-violet-800">
            P6_04_PRELOGIN_READY / NO_GO / BLOCKED
          </span>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-5">
          {PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS.map((item) => (
            <article
              key={item.code}
              className="border-l-2 border-violet-300 bg-violet-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-violet-700">
                {item.code}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase text-violet-700">
                {item.rolloutOrder}
              </p>
              <p className="mt-1 font-medium text-zinc-950">
                {item.accountLabel}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {item.owner}
              </p>
              <p className="mt-2 text-xs font-medium text-violet-800">
                Entry: {item.entryGate}
              </p>
              <p className="mt-2 text-xs font-medium text-violet-800">
                Advance: {item.advanceGate}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Allow: {item.allowedBeforeFinanceLogin}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Block: {item.blockedBeforeFinanceLogin}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Result: {item.requiredResult}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-cyan-200 bg-white p-4"
        data-ttgdtx-finance-day-one-run-rehearsal="P0-17_P6-04_P2-18_P5-03_P2-17"
        data-ttgdtx-finance-day-one-run-range="FIN-DAY1-01_FIN-DAY1-05"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-cyan-950">
              Finance Day-1 real-run rehearsal: PASS_LOCAL only
            </h3>
            <p className="mt-1 leading-6 text-cyan-900">
              After the first signed finance UAT is ready, rehearse the real
              accounting route with approved account labels only. Keep account
              activation, evidence and owner signatures outside Git/Codex/chat,
              and do not initiate a bank instruction.
            </p>
            <p className="mt-1 text-xs font-medium text-cyan-800">
              Runbook: {PRODUCTION_FINANCE_DAY_ONE_RUNBOOK}
            </p>
          </div>
          <span className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold uppercase text-cyan-800">
            FIN_DAY1_READY / NO_GO / BLOCKED
          </span>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-5">
          {PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS.map((step) => (
            <article
              key={step.code}
              className="border-l-2 border-cyan-300 bg-cyan-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-cyan-700">
                {step.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {step.owner}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                {step.requiredAction}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Proof: {step.requiredProof}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Decision: {step.decisionValue}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {step.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-teal-200 bg-white p-4"
        data-ttgdtx-finance-day-one-result-ledger="P0-17_P6-04_P2-18_P5-03_P2-17"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-teal-950">
              Finance Day-1 result ledger: real-user proof rows
            </h3>
            <p className="mt-1 leading-6 text-teal-900">
              Each real-accounting Day-1 lane needs a controlled evidence row
              with expected result, actual result, owner decision and access
              closure. Missing, ownerless or raw evidence keeps production
              NO-GO.
            </p>
            <p className="mt-1 text-xs font-medium text-teal-800">
              Template: {PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE}
            </p>
          </div>
          <span className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold uppercase text-teal-800">
            FIN_DAY1_RESULT_READY / NO_GO / BLOCKED
          </span>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-5">
          {PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES.map((lane) => (
            <article
              key={lane.accountLabel}
              className="border-l-2 border-teal-300 bg-teal-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-teal-700">
                {lane.rolloutOrder}
              </p>
              <p className="text-xs font-semibold uppercase text-teal-700">
                {lane.accountLabel}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {lane.owner}
              </p>
              <p className="mt-2 text-xs font-medium text-teal-800">
                Entry: {lane.entryGate}
              </p>
              <p className="mt-2 text-xs font-medium text-teal-800">
                Advance: {lane.advanceGate}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                {lane.allowedRoutes}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Result: {lane.requiredResult}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {lane.stopCondition}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS.map((item) => (
            <article
              key={item.field}
              className="border-l-2 border-teal-300 px-3"
            >
              <p className="text-xs font-semibold uppercase text-teal-700">
                {item.field}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                {item.requiredValue}
              </p>
              <p className="mt-2 text-xs leading-5 text-rose-800">
                Forbidden: {item.forbiddenContent}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-rose-200 bg-white p-4"
        data-ttgdtx-finance-day-one-access-closure-lanes="P0-17_FIN_USER"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-rose-950">
              Finance Day-1 access closure: one lane before the next
            </h3>
            <p className="mt-1 leading-6 text-rose-900">
              Each `FIN-USER` lane needs a controlled P0-17 decision before the
              next lane opens. ACCESS_RETAIN is allowed only for the exact
              signed scope; otherwise reduce, revoke or block the account.
            </p>
          </div>
          <span className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold uppercase text-rose-800">
            ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED
          </span>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-5">
          {PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES.map((lane) => (
            <article
              key={`${lane.rolloutOrder}-ttgdtx-access-closure`}
              className="border-l-2 border-rose-300 bg-rose-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-rose-700">
                {lane.rolloutOrder}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase text-rose-700">
                {lane.accountLabel}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {lane.owner}
              </p>
              <p className="mt-2 text-xs font-medium text-rose-800">
                Proof: {lane.requiredProof}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Retain: {lane.retainCondition}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Reduce/revoke: {lane.reduceOrRevokeCondition}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Block: {lane.blockCondition}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Next: {lane.nextLaneGate}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {lane.stopCondition}
              </p>
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
                <p className="mt-2 text-xs font-semibold uppercase text-indigo-700">
                  Decision: {step.decisionValue}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Stop: {step.stopCondition}
                </p>
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
