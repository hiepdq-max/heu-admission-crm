import { AlertTriangle, Eye, Route, ShieldCheck } from "lucide-react";

const handoffRules = [
  {
    code: "FIN-ACCT-HANDOFF-01",
    title: "Allowed read-only review",
    icon: Eye,
    detail:
      "KHTC accountant may view /finance-desk, /ttgdtx/accounting-dashboard, import readiness and source-control status inside the assigned TTGDTX scope.",
    stop:
      "Any unrestricted total, out-of-scope partner, raw evidence body or hidden route appears.",
  },
  {
    code: "FIN-ACCT-HANDOFF-02",
    title: "Blocked finance actions",
    icon: ShieldCheck,
    detail:
      "No create, update, approve, pay, import-write, source-edit, voucher posting, period lock, bank instruction or production reliance is allowed from this cockpit.",
    stop:
      "Any write control, approval control, payout control, bank-instruction path or voucher-posting path is visible.",
  },
  {
    code: "FIN-ACCT-HANDOFF-03",
    title: "Escalation route",
    icon: Route,
    detail:
      "Data variance goes to KHTC owner; route/scope issue goes to IT_DATA; legal/source exception goes to PHAP_CHE; access leak goes to Audit.",
    stop:
      "The operator edits Finance Desk output directly, uses chat as evidence storage or resolves an exception without owner route.",
  },
  {
    code: "FIN-ACCT-HANDOFF-04",
    title: "Day-1 evidence closure",
    icon: AlertTriangle,
    detail:
      "Record controlled evidence IDs, result ledger and ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED before expanding to another user.",
    stop:
      "Day-1 result ledger, P0-17 access closure, negative-account proof or owner decision is missing.",
  },
];

export function FinanceDayOneAccountantHandoff() {
  return (
    <section
      className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950 shadow-sm"
      data-finance-day-one-accountant-handoff="P5-03_FIN_DAY1_OPERATOR"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-700" />
            <h2 className="text-base font-semibold">
              Finance Day-1 accountant handoff: read-only pilot
            </h2>
          </div>
          <p className="mt-2">
            Use this handoff for the first KHTC accountant pilot after the safe
            pilot order is ready. It tells the operator what can be viewed, what
            must stay locked, who owns exceptions and what evidence closes the
            lane.
          </p>
          <p className="mt-2">
            This panel does not create accounts, send invites, store passwords,
            grant access, execute UAT, accept evidence, approve finance
            reliance, approve access closure, post vouchers, move money, issue
            bank instructions or mark production GO.
          </p>
        </div>
        <div className="rounded-md border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800">
          Decision: FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-4">
        {handoffRules.map((rule) => {
          const Icon = rule.icon;

          return (
            <article
              className="border-l-2 border-emerald-300 bg-white px-3 py-3"
              key={rule.code}
            >
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-emerald-700" />
                <p className="font-mono text-xs font-semibold text-emerald-800">
                  {rule.code}
                </p>
              </div>
              <h3 className="mt-2 font-semibold text-zinc-950">
                {rule.title}
              </h3>
              <p className="mt-2 text-zinc-700">Rule: {rule.detail}</p>
              <p className="mt-2 text-emerald-800">Stop: {rule.stop}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
