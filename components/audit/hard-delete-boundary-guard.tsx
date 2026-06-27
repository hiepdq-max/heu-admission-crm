import { CheckCircle2, ShieldAlert } from "lucide-react";

const protectedRows = [
  "finance",
  "evidence",
  "approval",
  "payment",
  "lead",
  "audit",
];

const requiredChecks = [
  "audit:hard-delete",
  "audit:ttgdtx-cascade",
  "audit:heu-non-ttgdtx-cascade-review",
];

export function HardDeleteBoundaryGuard() {
  return (
    <section
      className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm shadow-sm"
      data-hard-delete-boundary-guard="P6-06"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-rose-700" />
          <div>
            <h2 className="font-semibold text-rose-950">
              P6-06 hard-delete and cascade review: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-rose-900">
              Production remains NO-GO until non-TTGDTX/base cascade paths are
              converted or waived with written approval. No hard-delete for
              finance, evidence, approval, payment, lead or audit rows.
            </p>
            <p className="mt-2 leading-6 text-rose-900">
              Do not use hard-delete, truncate, drop table or on delete cascade
              as rollback proof. Current scan count: 44. Residual decision:
              REQUIRES_CONVERSION_OR_WAIVER.
            </p>
          </div>
        </div>
        <div className="min-w-64 rounded-md border border-rose-200 bg-white px-3 py-2 text-rose-950">
          Written waiver or conversion is required before production GO.
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-rose-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-rose-700">
            Protected rows
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {protectedRows.map((row) => (
              <span
                key={row}
                className="rounded-md border border-rose-100 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-900"
              >
                {row}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-rose-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-rose-700">
            Required local checks
          </p>
          <div className="mt-3 space-y-2">
            {requiredChecks.map((check) => (
              <div key={check} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-rose-700" />
                <span className="font-mono text-xs text-rose-950">
                  {check}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
