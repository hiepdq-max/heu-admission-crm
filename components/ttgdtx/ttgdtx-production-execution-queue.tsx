import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";

import { PRODUCTION_EXECUTION_STEPS } from "@/lib/production-readiness";

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
              role UAT, P0-19, P2-17, P2-18, audit/hard-delete, P0-14
              evidence binder, P0-15 final handoff summary, then final owner
              Go/No-Go. Do not skip ahead; every item needs controlled evidence
              and human owner sign-off.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-indigo-200 bg-white px-3 py-2 text-indigo-950">
          Final result stays NO-GO until signed owner GO exists.
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
