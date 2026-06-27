import { ClipboardCheck, FileSearch, ShieldAlert } from "lucide-react";

type ReconciliationCheck = {
  caseId: string;
  sourceStep: string;
  dashboardField: string;
  expectedCheck: string;
  owner: string;
  stopCondition: string;
};

type DashboardRelianceDecisionItem = {
  caseId: string;
  relianceGate: string;
  requiredDecision: string;
  owner: string;
  stopCondition: string;
};

const reconciliationChecks: ReconciliationCheck[] = [
  {
    caseId: "P2-18-SRC-01",
    sourceStep: "P2-03 receivable",
    dashboardField: "receivable_total_vnd / receivable_balance_vnd",
    expectedCheck:
      "Totals match active receivable source rows; cancelled or duplicate rows are excluded.",
    owner: "KHTC + Audit",
    stopCondition:
      "Any unexplained receivable variance blocks dashboard sign-off.",
  },
  {
    caseId: "P2-18-SRC-02",
    sourceStep: "P2-10 collection",
    dashboardField: "collected_total_vnd / receivable_paid_vnd",
    expectedCheck:
      "Collected amount matches accepted receipt/voucher records and invoice/receipt decisions.",
    owner: "KHTC + PHAP_CHE",
    stopCondition:
      "Unresolved invoice/receipt decision blocks dashboard reliance.",
  },
  {
    caseId: "P2-18-SRC-03",
    sourceStep: "P2-13/P2-14 reconciliation",
    dashboardField: "locked_reconciled_total_vnd",
    expectedCheck:
      "Only locked reconciliation periods are counted as reconciled source totals.",
    owner: "KHTC + Audit",
    stopCondition:
      "Unlocked or unexplained REVIEW/CRITICAL rows must be investigated.",
  },
  {
    caseId: "P2-18-SRC-04",
    sourceStep: "P2-15/P2-16 payment request",
    dashboardField: "requested_total_vnd / approved_total_vnd",
    expectedCheck:
      "Requested and approved totals match payment-request states and dossier requirements.",
    owner: "KHTC + BGH + Audit",
    stopCondition:
      "Missing BBNT, partner invoice or approval evidence blocks sign-off.",
  },
  {
    caseId: "P2-18-SRC-05",
    sourceStep: "P2-17 payout",
    dashboardField: "disbursed_total_vnd / remaining_to_pay_vnd",
    expectedCheck:
      "Disbursed totals match unique payout vouchers and do not exceed approved amounts.",
    owner: "KHTC + BGH + Audit",
    stopCondition:
      "Duplicate voucher, overpayment or missing payout evidence blocks sign-off.",
  },
  {
    caseId: "P2-18-SRC-06",
    sourceStep: "P2-19 source/evidence metadata",
    dashboardField: "evidence_url / movement evidence links",
    expectedCheck:
      "Movement and exception evidence links point to controlled redacted references only.",
    owner: "IT_DATA + Audit",
    stopCondition:
      "Raw PII, bank data, voucher image, password, OTP or service key in evidence blocks UAT.",
  },
];

const dashboardRelianceDecisionItems: DashboardRelianceDecisionItem[] = [
  {
    caseId: "P2-18-REL-01",
    relianceGate: "Authorized read-only access",
    requiredDecision:
      "BGH/KHTC can open the dashboard only after permission and TTGDTX scope checks pass; the page exposes no write action.",
    owner: "IT_DATA + BGH",
    stopCondition:
      "Stop if a query runs before canOpen, a write button exists, or contract-only/out-of-scope access exposes finance totals.",
  },
  {
    caseId: "P2-18-REL-02",
    relianceGate: "Source-total reconciliation",
    requiredDecision:
      "Dashboard totals reconcile to P2-03, P2-10, P2-13/P2-14, P2-15/P2-16, P2-17 and P2-19 controlled references.",
    owner: "KHTC + Audit",
    stopCondition:
      "Stop if any accepted KPI cannot be traced to the approved source workflow, query or evidence reference.",
  },
  {
    caseId: "P2-18-REL-03",
    relianceGate: "Control-board status",
    requiredDecision:
      "All intentional completed flows are PASS; REVIEW items have owner notes; CRITICAL rows are explained or block reliance.",
    owner: "KHTC + BGH + Audit",
    stopCondition:
      "Stop if a CRITICAL row is unexplained, a REVIEW row has no owner, or an exception route points to the wrong workflow.",
  },
  {
    caseId: "P2-18-REL-04",
    relianceGate: "Evidence redaction and storage",
    requiredDecision:
      "Screenshots, exports and source comparisons use controlled redacted evidence IDs outside Git/Codex/chat.",
    owner: "IT_DATA + Audit",
    stopCondition:
      "Stop if raw PII, CCCD, bank accounts, vouchers, bank statements, passwords, OTPs or service keys appear.",
  },
  {
    caseId: "P2-18-REL-05",
    relianceGate: "Dashboard reliance boundary",
    requiredDecision:
      "Owners record whether the dashboard can support internal review only, with no finance action or statutory-accounting reliance.",
    owner: "KHTC + BGH + PHAP_CHE",
    stopCondition:
      "Stop if dashboard PASS_LOCAL is treated as finance approval, statutory accounting, UAT acceptance or production GO.",
  },
  {
    caseId: "P2-18-REL-06",
    relianceGate: "Human reliance decision",
    requiredDecision:
      "Operator, checker, owner signers, timestamp, evidence IDs and final decision are recorded as P2_18_RELIANCE_READY, NO_GO or BLOCKED.",
    owner: "KHTC + BGH + IT_DATA + Audit",
    stopCondition:
      "Stop if signed browser UAT, owner sign-off, backup/restore proof or final GO/NO-GO evidence is missing.",
  },
];

export function TtgdtxDashboardSourceReconciliationChecklist() {
  return (
    <section
      data-ttgdtx-dashboard-source-reconciliation-checklist="P2-18"
      className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-4xl items-start gap-3">
          <FileSearch className="mt-0.5 size-5 shrink-0 text-blue-700" />
          <div>
            <h2 className="font-semibold text-blue-950">
              P2-18 source reconciliation checklist: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-blue-900">
              Dashboard UAT must compare each KPI with its source workflow
              before KHTC/BGH rely on the number. This checklist tells testers
              which source step, field, owner and stop condition to verify.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-blue-200 bg-white px-3 py-2 text-blue-950">
          Required evidence:
          <span className="mt-1 block font-mono text-xs">
            P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {reconciliationChecks.map((item) => (
          <article
            key={item.caseId}
            className="border-l-2 border-blue-300 bg-white px-3 py-3"
          >
            <p className="text-xs font-semibold uppercase text-blue-700">
              {item.caseId} - {item.sourceStep}
            </p>
            <p className="mt-2 font-mono text-xs text-blue-950">
              {item.dashboardField}
            </p>
            <p className="mt-2 leading-5 text-zinc-700">
              {item.expectedCheck}
            </p>
            <p className="mt-2 text-xs font-medium text-zinc-500">
              Owner: {item.owner}
            </p>
            <p className="mt-2 leading-5 text-rose-700">
              Stop: {item.stopCondition}
            </p>
          </article>
        ))}
      </div>

      <div
        data-ttgdtx-dashboard-reliance-decision-manifest="P2-18"
        className="mt-5 rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-cyan-950"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 font-semibold">
              <ClipboardCheck className="size-4 shrink-0" />
              <span>
                P2-18 dashboard reliance decision manifest: PASS_LOCAL only
              </span>
            </div>
            <p className="mt-2 leading-6">
              Use this manifest before BGH/KHTC rely on dashboard numbers for
              internal review. It does not approve finance action, statutory
              accounting, UAT acceptance, dashboard production reliance or
              production GO.
            </p>
          </div>
          <div className="min-w-72 rounded-md border border-cyan-200 bg-white px-3 py-2">
            Reliance decision:
            <span className="mt-1 block font-mono text-xs">
              P2_18_RELIANCE_READY / NO_GO / BLOCKED
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {dashboardRelianceDecisionItems.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-cyan-300 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-cyan-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">
                {item.relianceGate}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                {item.requiredDecision}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {item.owner}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-cyan-200 bg-white px-3 py-2 text-cyan-900">
          Missing reliance decision ID, unresolved variance, unsigned owner
          decision, uncontrolled evidence or raw sensitive dashboard data keeps
          P2-18 NO-GO.
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          PASS_LOCAL does not mean source reconciliation is complete. Signed
          browser UAT must still prove at least one complete flow and one
          exception flow against controlled redacted evidence.
        </p>
      </div>
    </section>
  );
}
