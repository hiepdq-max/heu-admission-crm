import { AlertTriangle, FileSearch, ShieldAlert } from "lucide-react";

type RiskSuggestion = {
  code: string;
  risk: string;
  check: string;
  owner: string;
};

const riskSuggestions: RiskSuggestion[] = [
  {
    code: "AI-RISK-01",
    risk: "Missing evidence before finance action",
    check:
      "Confirm BBNT, invoice/chung-tu, voucher, source file and approval evidence are present before P2-15/P2-17.",
    owner: "KHTC + PHAP_CHE + Audit",
  },
  {
    code: "AI-RISK-02",
    risk: "Role or workspace data leak",
    check:
      "Run UAT_ADMIN, UAT_BGH, UAT_KHTC, UAT_PHAP_CHE, UAT_AUDIT and out-of-scope tests before trusting data.",
    owner: "IT_DATA + Audit",
  },
  {
    code: "AI-RISK-03",
    risk: "Production migration without restore proof",
    check:
      "Keep production NO-GO unless P0-03 backup ID, restore target and smoke-check evidence are accepted.",
    owner: "IT_DATA + BGH",
  },
  {
    code: "AI-RISK-04",
    risk: "Duplicate payout or overpayment",
    check:
      "Verify P2-17 duplicate-click, voucher normalization, overpay and RPC-only evidence before owner sign-off.",
    owner: "KHTC + BGH + Audit",
  },
  {
    code: "AI-RISK-05",
    risk: "Dashboard trusted before reconciliation",
    check:
      "Compare P2-18 totals to P2-03, P2-10, P2-13/P2-14, P2-15/P2-16 and P2-17 source records.",
    owner: "KHTC + IT_DATA",
  },
  {
    code: "AI-RISK-06",
    risk: "AI output treated as approval",
    check:
      "Reject any workflow where an AI suggestion is used as legal, finance, UAT, waiver or production GO evidence.",
    owner: "BGH + IT_DATA + Audit",
  },
];

export function AiRiskSuggestionBoard() {
  return (
    <section
      data-heu-ai-risk-suggestion-board="P7-03"
      className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-4xl items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="font-semibold text-amber-950">
              P7-03 AI risk suggestion board: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-amber-900">
              This board shows review prompts for humans. It does not call AI,
              score people, hide exceptions, write data, approve finance, accept
              UAT, waive evidence, run migration or mark production GO.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-amber-200 bg-white px-3 py-2 text-amber-950">
          Human review required:
          <span className="mt-1 block text-xs">
            BGH, IT_DATA, KHTC, PHAP_CHE, Audit or the process owner decides;
            AI never does.
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {riskSuggestions.map((item) => (
          <article
            key={item.code}
            className="border-l-2 border-amber-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <FileSearch className="mt-0.5 size-4 shrink-0 text-amber-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-amber-700">
                  {item.code}
                </p>
                <p className="mt-1 font-medium text-zinc-950">{item.risk}</p>
                <p className="mt-2 leading-5 text-zinc-700">{item.check}</p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Owner: {item.owner}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          Do not paste secrets, passwords, OTPs, service-role keys, bank
          credentials, raw student PII, raw CCCD, raw phone numbers, raw bank
          account numbers, bank statements, vouchers or raw payment data.
          PASS_LOCAL does not enable autonomous AI, risk scoring, production AI,
          finance action, UAT acceptance, owner waiver or production GO.
        </p>
      </div>
    </section>
  );
}
