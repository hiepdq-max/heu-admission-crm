import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

const evidenceClasses = [
  "PUBLIC_CONTROL",
  "CONTROLLED_REDACTED",
  "CONTROLLED_SENSITIVE",
  "FORBIDDEN_IN_GIT_OR_CODEX",
];

const requiredChecks = [
  "audit:heu-controlled-evidence-redaction-pack",
  "audit:ttgdtx-production-owner-signoff-pack",
  "audit:ttgdtx-release-gates",
];

const redactionAcceptanceItems = [
  {
    caseId: "P0-10-ACCEPT-01",
    requirement: "Evidence classified before use",
    minimumEvidence:
      "Each item is marked PUBLIC_CONTROL, CONTROLLED_REDACTED, CONTROLLED_SENSITIVE or FORBIDDEN_IN_GIT_OR_CODEX.",
    stopCondition:
      "Stop if classification is missing, guessed, or a forbidden item is treated as redacted evidence.",
  },
  {
    caseId: "P0-10-ACCEPT-02",
    requirement: "Sensitive originals stay outside Git/Codex",
    minimumEvidence:
      "Backup, UAT, bank, voucher, source workbook and signed evidence originals live only in the controlled evidence location.",
    stopCondition:
      "Stop if raw controlled evidence is stored in Git, docs, screenshots, browser notes, issues or Codex/chat.",
  },
  {
    caseId: "P0-10-ACCEPT-03",
    requirement: "Redaction preserves proof while removing private data",
    minimumEvidence:
      "Names, CCCD/passport, phone, bank account, credentials, temporary passwords, password reset links, account activation/invite links, vouchers and raw payment data are masked or removed.",
    stopCondition:
      "Stop if the redacted copy leaks private data or no longer proves the intended control.",
  },
  {
    caseId: "P0-10-ACCEPT-04",
    requirement: "Owner and Audit review recorded",
    minimumEvidence:
      "Evidence owner, Audit reviewer, date, controlled storage reference and required business owner review are recorded.",
    stopCondition:
      "Stop if evidence has no owner, reviewer, date, controlled storage reference or business owner review.",
  },
  {
    caseId: "P0-10-ACCEPT-05",
    requirement: "Only safe references enter tracked work",
    minimumEvidence:
      "Git/docs/Codex contain only non-secret evidence IDs, masked snippets or reviewed redacted copies.",
    stopCondition:
      "Stop if a secret, raw PII, bank statement, voucher, source workbook or signed sensitive document enters tracked work.",
  },
  {
    caseId: "P0-10-ACCEPT-06",
    requirement: "Production boundary acknowledged",
    minimumEvidence:
      "The evidence note states PASS_LOCAL proves structure only and does not accept evidence, UAT, migration, finance action or GO.",
    stopCondition:
      "Stop if PASS_LOCAL is treated as evidence acceptance, UAT pass, backup completion, finance approval, owner waiver or production GO.",
  },
];

export function ControlledEvidenceRedactionGuard() {
  return (
    <section
      className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm shadow-sm"
      data-heu-controlled-evidence-redaction-guard="P0-10"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <div>
            <h2 className="font-semibold text-emerald-950">
              P0-10 controlled evidence redaction/intake: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-emerald-900">
              Production remains NO-GO until evidence is collected in the
              controlled location, redacted where needed, reviewed by Audit and
              signed by the required human owners. Raw evidence stays outside
              Git/Codex/chat.
            </p>
            <p className="mt-2 leading-6 text-emerald-900">
              Do not paste secrets, passwords, temporary passwords, OTPs,
              service-role keys, API keys, private keys, bank credentials,
              password reset links, account activation/invite links, raw
              student PII, raw CCCD, raw phone numbers, raw bank account
              numbers, bank statements, vouchers or raw payment data into
              screenshots, docs, browser notes or Codex prompts.
            </p>
          </div>
        </div>
        <div className="min-w-64 rounded-md border border-emerald-200 bg-white px-3 py-2 text-emerald-950">
          Only redacted copies or non-secret evidence references may enter
          tracked docs.
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-emerald-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-emerald-700">
            Evidence classes
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {evidenceClasses.map((evidenceClass) => (
              <span
                key={evidenceClass}
                className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 font-mono text-xs font-medium text-emerald-950"
              >
                {evidenceClass}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-emerald-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-emerald-700">
            Required local checks
          </p>
          <div className="mt-3 space-y-2">
            {requiredChecks.map((check) => (
              <div key={check} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-700" />
                <span className="font-mono text-xs text-emerald-950">
                  {check}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 border-l-2 border-emerald-300 bg-white px-3 py-3 text-emerald-950">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" />
        <p className="leading-6">
          PASS_LOCAL proves the guard, pack and audits are aligned; it does not
          prove evidence was collected, accepted, signed, or production-approved.
        </p>
      </div>

      <div
        className="mt-5 rounded-lg border border-emerald-200 bg-white p-4"
        data-heu-controlled-evidence-acceptance-matrix="P0-10"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 font-semibold text-emerald-950">
              <ShieldCheck className="size-4 shrink-0 text-emerald-700" />
              <span>
                P0-10 controlled evidence acceptance matrix: PASS_LOCAL only
              </span>
            </div>
            <p className="mt-2 leading-6 text-emerald-900">
              Use this matrix before any redacted evidence reference enters a
              tracked document, checklist, issue, screenshot or Codex/chat. It
              prepares evidence for human review; it does not accept evidence or
              approve production.
            </p>
          </div>
          <div className="min-w-72 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-950">
            Decision:
            <span className="mt-1 block font-mono text-xs">
              P0_10_ACCEPT / NO_GO / BLOCKED
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {redactionAcceptanceItems.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-emerald-300 bg-emerald-50/70 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-emerald-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">
                {item.requirement}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Minimum evidence: {item.minimumEvidence}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop condition: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
