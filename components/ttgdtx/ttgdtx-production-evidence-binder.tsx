import { Archive, FileCheck2, LockKeyhole } from "lucide-react";

import { PRODUCTION_EVIDENCE_REQUIREMENTS } from "@/lib/production-readiness";

export function TtgdtxProductionEvidenceBinder() {
  return (
    <section
      data-ttgdtx-production-evidence-binder="P0-14"
      className="rounded-lg border border-cyan-200 bg-cyan-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-4xl items-start gap-3">
          <Archive className="mt-0.5 size-5 shrink-0 text-cyan-700" />
          <div>
            <h2 className="font-semibold text-cyan-950">
              P0-14 production evidence binder: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-cyan-900">
              One controlled index for the evidence required before TTGDTX can
              move from NO-GO. This binder records what proof is needed, where
              it must live, who signs it and what must never be pasted into
              Git/Codex/chat.
            </p>
          </div>
        </div>

        <div className="min-w-72 rounded-md border border-cyan-200 bg-white px-3 py-2 text-cyan-950">
          Binder status:
          <span className="mt-1 block font-semibold">NO-GO until signed</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {PRODUCTION_EVIDENCE_REQUIREMENTS.map((item) => (
          <article
            key={item.caseId}
            className="border-l-2 border-cyan-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-cyan-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-cyan-700">
                  {item.caseId} - {item.blockerCode}
                </p>
                <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Owner: {item.owner}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  <span className="font-medium">Proof:</span>{" "}
                  {item.requiredProof}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  <span className="font-medium">Location:</span>{" "}
                  {item.controlledLocation}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  <span className="font-medium">Sign-off:</span> {item.signoff}
                </p>
                <p className="mt-2 font-mono text-xs text-cyan-900">
                  {item.evidenceClass}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <LockKeyhole className="mt-0.5 size-4 shrink-0" />
        <p>
          Forbidden content stays out of Git/Codex/chat: service-role keys,
          passwords, OTPs, private connection strings, raw student PII, raw
          CCCD, bank accounts, bank statements, raw vouchers, raw payment data,
          unsigned GO decisions and AI-produced approvals.
        </p>
      </div>
    </section>
  );
}
