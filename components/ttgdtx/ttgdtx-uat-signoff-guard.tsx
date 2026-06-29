import { CheckCircle2, ClipboardCheck, ShieldAlert } from "lucide-react";

import { PRODUCTION_GOVERNANCE_ASSURANCE_STEPS } from "@/lib/production-readiness";

const uatClosureItems = [
  {
    caseId: "UAT-CLOSE-01",
    title: "Synthetic accounts prepared",
    evidence:
      "UAT_ADMIN, UAT_BGH, UAT_KHTC, UAT_TUYEN_SINH, UAT_PHAP_CHE and UAT_OUT_OF_SCOPE exist with no real passwords, temporary passwords, password reset links or account activation/invite links shared in Codex/chat.",
  },
  {
    caseId: "UAT-CLOSE-02",
    title: "Route matrix executed",
    evidence:
      "Every TTGDTX route in TTGDTX_BROWSER_UAT_MATRIX_20260625.md is tested for allowed, blocked or empty scoped state.",
  },
  {
    caseId: "UAT-CLOSE-03",
    title: "Finance and dashboard negative tests pass",
    evidence:
      "Out-of-scope and non-finance users cannot see restricted finance, payout, dashboard or source evidence.",
  },
  {
    caseId: "UAT-CLOSE-04",
    title: "Execution log completed",
    evidence:
      "TTGDTX_UAT_EXECUTION_LOG_20260625.md records account, route, result, evidence reference and reviewer.",
  },
  {
    caseId: "UAT-CLOSE-05",
    title: "Sensitive evidence controlled",
    evidence:
      "Screenshots and notes are redacted; passwords, temporary passwords, password reset links, account activation/invite links, OTPs, service-role keys, raw PII, bank accounts and raw payment evidence stay outside Git/Codex/chat.",
  },
  {
    caseId: "UAT-CLOSE-06",
    title: "Owners sign UAT result",
    evidence:
      "BGH, KHTC, PHAP_CHE and IT_DATA sign PASS, FAIL or BLOCKED before any production GO/NO-GO discussion.",
  },
];

const syntheticAccounts = [
  "UAT_ADMIN",
  "UAT_BGH",
  "UAT_KHTC",
  "UAT_TUYEN_SINH",
  "UAT_PHAP_CHE",
  "UAT_OUT_OF_SCOPE",
];

const evidenceDocs = [
  "TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  "TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  "TTGDTX_UAT_EXECUTION_LOG_20260625.md",
];

export function TtgdtxUatSignoffGuard() {
  return (
    <section
      className="rounded-lg border border-sky-200 bg-sky-50 p-5 text-sm shadow-sm"
      data-ttgdtx-uat-signoff-guard="INTERNAL_UAT"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-4xl items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-sky-700" />
          <div>
            <h2 className="font-semibold text-sky-950">
              Internal UAT sign-off: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-sky-900">
              Production remains NO-GO until signed multi-account UAT evidence
              exists for the synthetic account matrix and every TTGDTX route.
              PASS_LOCAL does not approve real pilot start, production
              migration, revenue recognition, payout, dashboard reliance or
              Go/No-Go.
            </p>
            <p className="mt-2 leading-6 text-sky-900">
              Do not paste real passwords, temporary passwords, password reset
              links, account activation/invite links, OTPs, service-role keys,
              student PII, CCCD, phone numbers, bank accounts or raw payment
              evidence into Codex/chat, browser notes or screenshots.
            </p>
          </div>
        </div>

        <div className="min-w-72 rounded-md border border-sky-200 bg-white px-3 py-2 text-sky-950">
          Required result:
          <span className="mt-1 block font-semibold">
            signed multi-account UAT still required
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-sky-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="size-4 text-sky-700" />
            <p className="text-xs font-semibold uppercase text-sky-700">
              Synthetic account matrix
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {syntheticAccounts.map((account) => (
              <span
                key={account}
                className="rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-950"
              >
                {account}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-sky-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-sky-700">
            Evidence documents
          </p>
          <div className="mt-3 space-y-2">
            {evidenceDocs.map((doc) => (
              <div key={doc} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-sky-700" />
                <span className="font-mono text-xs text-sky-950">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="mt-5 rounded-md border border-indigo-200 bg-white p-4"
        data-ttgdtx-governance-uat-execution-readiness="P6-04_P6-03"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-indigo-950">
              Governance UAT execution readiness: P6-04 + P6-03
            </h3>
            <p className="mt-2 leading-6 text-indigo-900">
              Run P6-04 role/workspace UAT first, then P6-03 audit-log
              traceability sampling. Each run needs a synthetic account,
              controlled evidence reference, redaction check, reviewer and
              owner signature before the internal UAT result can move from
              BLOCKED.
            </p>
          </div>
          <div className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 font-mono text-xs text-indigo-950">
            P6_04_SCOPE_UAT / P6_03_TRACE_UAT
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {PRODUCTION_GOVERNANCE_ASSURANCE_STEPS.map((step) => (
            <article
              key={`${step.code}-uat-readiness`}
              className="border-l-2 border-indigo-300 bg-indigo-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-indigo-700">
                {step.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
              <p className="mt-2 leading-5 text-zinc-700">
                <span className="font-medium">Route:</span> {step.route}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                <span className="font-medium">Runbook:</span> {step.runbook}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                <span className="font-medium">Owner:</span> {step.owner}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop if evidence is unsigned, role scope leaks, audit trace is
                missing, redaction fails or the result is stored in
                Git/Codex/chat.
              </p>
              <p className="mt-2 text-xs font-medium text-indigo-800">
                Guard: {step.auditCommand}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-md border border-sky-200 bg-white p-4"
        data-ttgdtx-uat-run-closure-tracker="INTERNAL_UAT"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-sky-950">
              Internal UAT run closure tracker: PASS_LOCAL only
            </h3>
            <p className="mt-2 leading-6 text-sky-900">
              Use this tracker after browser testing. All six closure checks
              need redacted evidence and owner signatures before the result can
              move beyond NO-GO.
            </p>
          </div>
          <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 font-mono text-xs text-sky-950">
            UAT_PASS / UAT_FAIL / BLOCKED
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {uatClosureItems.map((item) => (
            <article
              key={item.caseId}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-sky-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
              <p className="mt-2 leading-5 text-zinc-700">
                Evidence: {item.evidence}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 leading-6 text-amber-900">
          PASS_LOCAL does not mean UAT was executed, accepted, signed or
          production-approved. Missing route evidence, owner signature, redaction
          proof or negative-test result keeps production NO-GO.
        </p>
      </div>
    </section>
  );
}
