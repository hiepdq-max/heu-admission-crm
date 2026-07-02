import { AlertTriangle, Eye, ListChecks, Route, ShieldCheck } from "lucide-react";

const operatorGuidePath =
  "docs/HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md";

type FinanceDayOnePreflightItem = {
  code: string;
  owner: string;
  requiredState: string;
  operatorMeaning: string;
  stopCondition: string;
};

const preflightItems: FinanceDayOnePreflightItem[] = [
  {
    code: "FIN-DAY1-PREFLIGHT-01",
    owner: "IT_DATA + KHTC",
    requiredState: "FIN_START_READY / NO_GO / BLOCKED",
    operatorMeaning:
      "Start-gate checklist is recorded before the first accountant opens Finance Desk.",
    stopCondition:
      "Stop if backup/restore proof, controlled evidence path or signed route readiness is missing.",
  },
  {
    code: "FIN-DAY1-PREFLIGHT-02",
    owner: "ADMIN + IT_DATA",
    requiredState: "FIN_ACTIVATION_READY / NO_GO / BLOCKED",
    operatorMeaning:
      "Real accounting account is created or linked outside Codex/chat and never shares passwords, OTPs or invite links here.",
    stopCondition:
      "Stop if an account credential, reset link, invite link or service-role key appears in Git/Codex/chat.",
  },
  {
    code: "FIN-DAY1-PREFLIGHT-03",
    owner: "IT_DATA + Audit",
    requiredState: "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    operatorMeaning:
      "Role, department, manager and TTGDTX scope are checked before login.",
    stopCondition:
      "Stop if the accountant can see out-of-scope totals or protected routes before P6-04 closure.",
  },
  {
    code: "FIN-DAY1-PREFLIGHT-04",
    owner: "KHTC + BGH",
    requiredState: "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    operatorMeaning:
      "Kế toán only reviews read-only Finance Desk, dashboard, import readiness and source-control status.",
    stopCondition:
      "Stop if the operator edits source facts, approves payment, posts vouchers, moves money or issues bank instructions.",
  },
  {
    code: "FIN-DAY1-PREFLIGHT-05",
    owner: "KHTC + Audit + BGH",
    requiredState: "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    operatorMeaning:
      "Day-1 result ledger and ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED are recorded before adding another user.",
    stopCondition:
      "Stop if evidence is raw, ownerless, stored in Git/Codex/chat or treated as UAT/finance/owner approval.",
  },
];

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
          <p className="mt-2">
            Operator guide: <code>{operatorGuidePath}</code>. Use it to confirm
            start conditions, read-only steps, escalation owners, forbidden content
            and Day-1 closure before expanding beyond the first accountant.
          </p>
        </div>
        <div className="rounded-md border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800">
          Decision: FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED
        </div>
      </div>

      <div
        className="mt-4 rounded-md border border-emerald-200 bg-white p-4"
        data-finance-day-one-preflight-summary="P5-03_FIN_DAY1_PREFLIGHT"
      >
        <div className="flex items-start gap-3">
          <ListChecks className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <div>
            <h3 className="font-semibold text-zinc-950">
              Finance Day-1 controlled trial preflight
            </h3>
            <p className="mt-1 text-zinc-700">
              Decision: FIN_DAY1_PREFLIGHT_READY / NO_GO / BLOCKED. This is a
              visible checklist for the first accounting trial only; it does not
              grant access, execute UAT, accept evidence, approve finance
              reliance or mark production GO.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {preflightItems.map((item) => (
            <article
              className="border-l-2 border-emerald-300 bg-emerald-50 px-3 py-3"
              key={item.code}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white px-2 py-1 font-mono text-xs font-semibold text-emerald-800">
                  {item.code}
                </span>
                <span className="text-xs font-semibold text-zinc-600">
                  Owner: {item.owner}
                </span>
              </div>
              <p className="mt-2 font-semibold text-zinc-950">
                {item.requiredState}
              </p>
              <p className="mt-2 text-zinc-700">
                Meaning: {item.operatorMeaning}
              </p>
              <p className="mt-2 text-emerald-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
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
