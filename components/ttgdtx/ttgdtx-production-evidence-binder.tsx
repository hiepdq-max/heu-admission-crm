import {
  Archive,
  ClipboardList,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  PRODUCTION_EVIDENCE_REQUIREMENTS,
  PRODUCTION_GOVERNANCE_ASSURANCE_STEPS,
} from "@/lib/production-readiness";

const governanceEvidenceCases = PRODUCTION_EVIDENCE_REQUIREMENTS.filter(
  (item) => item.blockerCode === "P6-04" || item.blockerCode === "P6-03",
);

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

      <div
        className="mt-5 rounded-md border border-emerald-200 bg-white p-4"
        data-p014-controlled-evidence-intake-ledger="P0-14"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-2">
            <ClipboardList className="mt-0.5 size-4 shrink-0 text-emerald-700" />
            <div>
              <h3 className="font-semibold text-emerald-950">
                P0-14 controlled evidence intake ledger: PASS_LOCAL only
              </h3>
              <p className="mt-2 leading-6 text-zinc-700">
                Complete this ledger after P0-10 redaction review and before
                P0-14 closure. Each blocker needs a non-secret evidence ID,
                controlled folder reference, redaction reviewer, owner signature
                state and ACCEPT / NO_GO / BLOCKED decision.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-xs text-emerald-950">
            P0_14_INTAKE_READY / NO_GO / BLOCKED
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {PRODUCTION_EVIDENCE_REQUIREMENTS.map((item) => (
            <article
              key={`${item.caseId}-intake`}
              className="border-l-2 border-emerald-300 bg-emerald-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-emerald-700">
                {item.caseId} intake
              </p>
              <p className="mt-1 font-medium text-zinc-950">
                {item.blockerCode}: {item.title}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Ledger fields: evidence ID, controlled folder reference,
                evidence class, redaction reviewer, owner signature state and
                blocker decision.
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Required class: {item.evidenceClass}. Owner: {item.owner}.
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop if the evidence ID is missing, storage is uncontrolled,
                redaction review is missing, owner signature is missing or
                forbidden content appears: {item.forbiddenContent}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-md border border-sky-200 bg-white p-4"
        data-p014-governance-evidence-checkpoint="P6-04_P6-03"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-700" />
            <div>
              <h3 className="font-semibold text-sky-950">
                P0-14 governance evidence checkpoint: P6-04 + P6-03
              </h3>
              <p className="mt-2 leading-6 text-zinc-700">
                Role/workspace proof and audit trace proof must both have
                controlled references, redaction checks and human sign-off
                before owner review. A role leak, missing trace row, broad
                access path or unsigned evidence keeps P0-14 NO-GO.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 font-mono text-xs text-sky-950">
            P6_04_SCOPE + P6_03_TRACE
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {PRODUCTION_GOVERNANCE_ASSURANCE_STEPS.map((step) => {
            const evidence = governanceEvidenceCases.find(
              (item) => item.blockerCode === step.code,
            );

            return (
              <article
                key={`${step.code}-p014-checkpoint`}
                className="border-l-2 border-sky-300 bg-sky-50 px-3 py-3"
              >
                <p className="text-xs font-semibold uppercase text-sky-700">
                  {step.code}
                </p>
                <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
                <p className="mt-2 leading-5 text-zinc-700">
                  <span className="font-medium">Route:</span> {step.route}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  <span className="font-medium">Evidence:</span>{" "}
                  {evidence?.requiredProof}
                </p>
                <p className="mt-2 leading-5 text-rose-800">
                  Stop if missing, unsigned or stored with forbidden content:{" "}
                  {evidence?.forbiddenContent}
                </p>
                <p className="mt-2 text-xs font-medium text-sky-800">
                  Guard: {step.auditCommand}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      <div
        className="mt-5 rounded-md border border-cyan-200 bg-white p-4"
        data-p014-production-evidence-closure-tracker="P0-14"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-cyan-950">
              P0-14 production evidence closure tracker: PASS_LOCAL only
            </h3>
            <p className="mt-2 leading-6 text-zinc-700">
              Use this tracker before owner GO/NO-GO. Each evidence item needs
              a controlled reference, redaction check, owner signature and
              no open stop condition. Missing proof keeps production NO-GO.
            </p>
          </div>
          <div className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 font-mono text-xs text-cyan-950">
            P0_14_CLOSE / NO_GO / BLOCKED
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {PRODUCTION_EVIDENCE_REQUIREMENTS.map((item) => (
            <article
              key={`${item.caseId}-closure`}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-cyan-700">
                {item.caseId} closure
              </p>
              <p className="mt-1 font-medium text-zinc-950">
                {item.blockerCode}: {item.title}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Close when: controlled evidence reference exists,{" "}
                {item.evidenceClass} redaction/classification is correct and{" "}
                {item.signoff}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop if proof is missing, owner signature is missing, evidence
                is in the wrong location or forbidden content appears:{" "}
                {item.forbiddenContent}
              </p>
            </article>
          ))}
        </div>
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
