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
              Do not paste secrets, passwords, OTPs, service-role keys, API
              keys, private keys, bank credentials, reset links, raw student
              PII, raw CCCD, raw phone numbers, raw bank account numbers, bank
              statements, vouchers or raw payment data into screenshots, docs,
              browser notes or Codex prompts.
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
    </section>
  );
}
