import { CheckCircle2, ClipboardCheck, ShieldAlert } from "lucide-react";

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
              Do not paste real passwords, OTPs, service-role keys, student
              PII, CCCD, phone numbers, bank accounts or raw payment evidence
              into Codex/chat, browser notes or screenshots.
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
    </section>
  );
}
