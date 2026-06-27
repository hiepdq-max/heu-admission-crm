import { FileSearch, ShieldAlert } from "lucide-react";

type ReconciliationCheck = {
  caseId: string;
  sourceStep: string;
  dashboardField: string;
  expectedCheck: string;
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
