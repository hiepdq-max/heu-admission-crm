import { AlertTriangle, FileCheck2, ShieldCheck } from "lucide-react";

const guardItems = [
  {
    code: "P2-01",
    title: "Contract master",
    rule: "P2-01 contract must be ACTIVE with scope, effective dates, legal basis and payment/settlement terms.",
    owner: "PHAP_CHE + BGH + KHTC",
  },
  {
    code: "P2-02",
    title: "Tuition policy master",
    rule: "P2-02 tuition policy must be READY with amount, due rule, settlement basis and evidence requirement.",
    owner: "KHTC + PHAP_CHE",
  },
  {
    code: "P0-19/P2-05",
    title: "Finance gate",
    rule: "P0-19 legal/tuition finance gate and P2-05 remain required before P2-03 can create receivables.",
    owner: "KHTC + PHAP_CHE + IT_DATA",
  },
];

export function TtgdtxContractTuitionMasterGuard() {
  return (
    <section
      data-ttgdtx-contract-tuition-master-guard="P2-01-P2-02"
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-700" />
            <h2 className="text-base font-semibold text-zinc-950">
              P2-01/P2-02 contract and tuition master guard
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            PASS_LOCAL only. Contract and tuition masters are prerequisites, not
            approval to create receivables, collect money, issue invoices,
            reconcile, pay partners, run production migration or mark
            production GO.
          </p>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Signed UAT and human owner approval are still required. Do not
              paste private contract bodies, raw student PII, CCCD, bank data,
              passwords, temporary passwords, OTPs, password reset links,
              account activation/invite links, service-role keys or production
              credentials into Git/Codex/chat.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {guardItems.map((item) => (
          <article
            key={item.code}
            className="rounded-md border border-zinc-200 bg-zinc-50 p-4"
          >
            <div className="flex items-center gap-2">
              <FileCheck2 className="size-4 text-zinc-600" />
              <p className="text-sm font-semibold text-zinc-950">
                {item.code} {item.title}
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-700">{item.rule}</p>
            <p className="mt-3 text-xs font-medium uppercase text-zinc-500">
              Owner: {item.owner}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">
        P2-03 creates receivable only after P2-01 ACTIVE, P2-02 READY, P0-19
        ALLOW_FINANCE and P2-05 pass. This guard does not approve legal
        contract, tuition policy, finance action, UAT acceptance, owner waiver
        or production GO.
      </div>
    </section>
  );
}
