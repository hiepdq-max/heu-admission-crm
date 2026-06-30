import {
  Archive,
  ClipboardList,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES,
  PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST,
  PRODUCTION_FINANCE_DAY_ONE_START_GATES,
  PRODUCTION_EVIDENCE_REQUIREMENTS,
  PRODUCTION_GOVERNANCE_ASSURANCE_STEPS,
  PRODUCTION_UAT_LAUNCH_STEPS,
} from "@/lib/production-readiness";

const governanceEvidenceCases = PRODUCTION_EVIDENCE_REQUIREMENTS.filter(
  (item) => item.blockerCode === "P6-04" || item.blockerCode === "P6-03",
);

const financeRelianceEvidenceCases = PRODUCTION_UAT_LAUNCH_STEPS.filter(
  (item) => item.code === "P2-18" || item.code === "P5-03",
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
                <p className="mt-2 leading-5 text-rose-800">
                  <span className="font-medium">Forbidden:</span>{" "}
                  {item.forbiddenContent}
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

        <div
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3"
          data-p014-finance-day-one-start-gate-evidence="FIN-START-EVID"
        >
          <p className="font-semibold text-emerald-950">
            Finance Day-1 start-gate evidence checklist
          </p>
          <p className="mt-1 leading-6 text-emerald-900">
            P0-14 must cite the start-gate checklist before any
            real-accounting invite/create, activation row, Finance Desk
            reliance review or owner GO/NO-GO review. Missing start-gate
            evidence keeps P0-14 NO-GO.
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-800">
            Checklist: {PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-800">
            Decision: FIN_START_READY / NO_GO / BLOCKED
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-800">
            Evidence range: FIN-START-EVID-001 through FIN-START-EVID-005
          </p>
          <div className="mt-3 grid gap-3 xl:grid-cols-5">
            {PRODUCTION_FINANCE_DAY_ONE_START_GATES.map((gate, index) => (
              <article
                key={`${gate.code}-p014-start-gate`}
                className="border-l-2 border-emerald-300 bg-white px-3 py-3"
              >
                <p className="text-xs font-semibold uppercase text-emerald-700">
                  FIN-START-EVID-{String(index + 1).padStart(3, "0")}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase text-emerald-700">
                  {gate.code}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Owner: {gate.owner}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  Proof: {gate.requiredProof}
                </p>
                <p className="mt-2 leading-5 text-rose-800">
                  Stop: {gate.stopCondition}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div
          className="mt-4 rounded-md border border-indigo-200 bg-indigo-50 p-3"
          data-p014-finance-day-one-access-closure-lanes="P0-17-FIN-USER"
        >
          <p className="font-semibold text-indigo-950">
            Finance Day-1 access closure evidence lanes
          </p>
          <p className="mt-1 leading-6 text-indigo-900">
            P0-14 reliance evidence must cite each Day-1 lane closure before
            Finance Desk reliance or owner GO/NO-GO review. Missing lane
            closure keeps P0-14 NO-GO.
          </p>
          <div className="mt-3 grid gap-3 xl:grid-cols-5">
            {PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES.map((lane) => (
              <article
                key={`${lane.rolloutOrder}-p014-closure`}
                className="border-l-2 border-indigo-300 bg-white px-3 py-3"
              >
                <p className="text-xs font-semibold uppercase text-indigo-700">
                  {lane.rolloutOrder}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase text-indigo-700">
                  {lane.accountLabel}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Owner: {lane.owner}
                </p>
                <p className="mt-2 text-xs font-medium text-indigo-800">
                  Decision: {lane.closureDecisionValue}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  Proof: {lane.requiredProof}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  Next gate: {lane.nextLaneGate}
                </p>
                <p className="mt-2 leading-5 text-rose-800">
                  Stop: {lane.stopCondition}
                </p>
              </article>
            ))}
          </div>
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
        className="mt-5 rounded-md border border-indigo-200 bg-white p-4"
        data-p014-finance-reliance-evidence-checkpoint="P2-18_P5-03_P6-04"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-indigo-700" />
            <div>
              <h3 className="font-semibold text-indigo-950">
                P0-14 finance reliance evidence checkpoint: P2-18 + P5-03 + P6-04
              </h3>
              <p className="mt-2 leading-6 text-zinc-700">
                Dashboard and Finance Desk evidence must cite the P6-04 real
                accounting user queue/result proof and P0-17 real-user access
                closure decision before owner review. Missing P6-04 proof,
                unsigned reliance, open access closure or uncontrolled
                screenshots keep P0-14 NO-GO.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 font-mono text-xs text-indigo-950">
            P2_18_P5_03_FINANCE_PROOF / NO_GO / BLOCKED
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {financeRelianceEvidenceCases.map((step) => (
            <article
              key={`${step.code}-p014-finance-checkpoint`}
              className="border-l-2 border-indigo-300 bg-indigo-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-indigo-700">
                {step.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
              <p className="mt-2 leading-5 text-zinc-700">
                <span className="font-medium">Evidence:</span> {step.evidence}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                <span className="font-medium">P6-04 bridge:</span> cite
                data-heu-real-accounting-user-uat-queue and
                data-heu-real-accounting-user-result-template controlled
                evidence references outside Git/Codex/chat.
              </p>
              <p
                className="mt-2 leading-5 text-zinc-700"
                data-p014-real-user-access-closure-proof="P0-17-P6-04"
              >
                <span className="font-medium">Access closure:</span> cite the
                ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED decision from
                data-heu-real-user-access-closure before final owner review.
              </p>
              {step.code === "P5-03" ? (
                <>
                  <p
                    className="mt-2 leading-5 text-zinc-700"
                    data-p014-finance-controlled-trial-evidence="P5-03-TRIAL-EVID"
                  >
                    <span className="font-medium">P5-03 controlled trial:</span>{" "}
                    cite P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005
                    plus P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED before
                    any Finance Desk reliance review.
                  </p>
                  <p
                    className="mt-2 leading-5 text-zinc-700"
                    data-p014-finance-day-one-result-ledger="FIN-DAY1-EVID"
                  >
                    <span className="font-medium">Finance Day-1 ledger:</span>{" "}
                    cite HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md,
                    FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005,
                    FIN_DAY1_RESULT_READY / NO_GO / BLOCKED and ACCESS_RETAIN /
                    REVOKE_OR_REDUCE / BLOCKED before Finance Desk reliance or
                    owner GO/NO-GO review.
                  </p>
                </>
              ) : null}
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {step.stopCondition}
              </p>
              <p className="mt-2 text-xs font-medium text-indigo-800">
                Guard: {step.auditCommand}
              </p>
            </article>
          ))}
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
          passwords, temporary passwords, OTPs, password reset links, account
          activation/invite links, private connection strings, raw student PII,
          raw CCCD, bank accounts, bank statements, raw vouchers, raw payment
          data, unsigned GO decisions and AI-produced approvals.
        </p>
      </div>
    </section>
  );
}
