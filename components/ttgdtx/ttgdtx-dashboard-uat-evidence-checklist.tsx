import { ClipboardCheck, FileCheck2, ShieldAlert } from "lucide-react";

type EvidenceItem = {
  caseId: string;
  title: string;
  owner: string;
  evidence: string;
};

type DashboardAcceptanceItem = {
  caseId: string;
  requirement: string;
  minimumEvidence: string;
  stopCondition: string;
};

const evidenceItems: EvidenceItem[] = [
  {
    caseId: "P2-18-01",
    title: "Authorized dashboard load",
    owner: "BGH/KHTC + IT_DATA",
    evidence: "Screenshot of loaded dashboard with synthetic or redacted UAT data.",
  },
  {
    caseId: "P2-18-02",
    title: "Summary KPI source comparison",
    owner: "KHTC + Audit",
    evidence: "Reconciliation note comparing P2-03, P2-10, P2-13/P2-14 and P2-17 totals.",
  },
  {
    caseId: "P2-18-03",
    title: "Control-board variance review",
    owner: "KHTC + Audit",
    evidence: "Control-board screenshot showing PASS/REVIEW/CRITICAL rows and owner notes.",
  },
  {
    caseId: "P2-18-04/P2-18-05",
    title: "Role and contract-only denial",
    owner: "IT_DATA + Audit",
    evidence: "Screenshots proving out-of-scope and contract-only users cannot see unrestricted finance totals.",
  },
  {
    caseId: "P2-18-06/P2-18-07",
    title: "Exception routing and movements",
    owner: "KHTC + IT_DATA",
    evidence: "Evidence that exception links open source workflows and movement rows reflect source records.",
  },
  {
    caseId: "P2-18-08",
    title: "No dashboard write action",
    owner: "Audit + IT_DATA",
    evidence: "Reviewer note confirming no create/update/approve/pay action exists on P2-18.",
  },
];

const dashboardAcceptanceItems: DashboardAcceptanceItem[] = [
  {
    caseId: "P2-18-ACCEPT-01",
    requirement: "Read-only route and authorized load",
    minimumEvidence:
      "Authorized BGH/KHTC opens the dashboard after canOpen; no form or button can create, update, approve or pay.",
    stopCondition:
      "Stop if P2-18 exposes any write action or dashboard queries run before the permission and TTGDTX scope gate.",
  },
  {
    caseId: "P2-18-ACCEPT-02",
    requirement: "Source-total reconciliation",
    minimumEvidence:
      "Summary, control and partner totals reconcile to P2-03, P2-10, P2-13/P2-14, P2-15/P2-16, P2-17 and P2-19 evidence metadata.",
    stopCondition:
      "Stop if any accepted KPI lacks source query evidence or cannot be tied back to an approved source workflow.",
  },
  {
    caseId: "P2-18-ACCEPT-03",
    requirement: "Role and contract-only denial",
    minimumEvidence:
      "Out-of-scope and contract-only users are blocked or scoped; ttgdtx.contract.read alone does not expose finance totals.",
    stopCondition:
      "Stop if contract-only permission or out-of-scope access exposes unrestricted dashboard data.",
  },
  {
    caseId: "P2-18-ACCEPT-04",
    requirement: "Exception and movement traceability",
    minimumEvidence:
      "Each exception row links to the correct source workflow and recent movement rows match source records.",
    stopCondition:
      "Stop if an exception or movement row cannot be traced to the source step and owner.",
  },
  {
    caseId: "P2-18-ACCEPT-05",
    requirement: "Evidence redaction and owner sign-off",
    minimumEvidence:
      "Screenshots or exports use redacted, non-secret references; KHTC, BGH, IT_DATA and Audit sign outside Codex/chat.",
    stopCondition:
      "Stop if raw PII, CCCD, bank accounts, vouchers, passwords, OTPs or service-role keys are exposed.",
  },
  {
    caseId: "P2-18-ACCEPT-06",
    requirement: "Production boundary",
    minimumEvidence:
      "P2-18 stays an advisory read-only cockpit until backup/restore evidence, UAT evidence and owner GO/NO-GO are signed.",
    stopCondition:
      "Stop if PASS_LOCAL is treated as dashboard UAT pass, finance approval, dashboard reliance or production GO.",
  },
];

export function TtgdtxDashboardUatEvidenceChecklist() {
  return (
    <section
      data-ttgdtx-dashboard-uat-evidence-checklist="P2-18"
      className="rounded-lg border border-violet-200 bg-violet-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-violet-700" />
          <div>
            <h2 className="font-semibold text-violet-950">
              P2-18 UAT evidence checklist: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-violet-900">
              Signed browser UAT is still required before P2-18 can move from
              IN_PROGRESS. Collect only redacted screenshots or non-secret
              evidence references; raw source files, raw student PII, CCCD,
              bank accounts, vouchers, passwords, OTPs and service-role keys
              stay outside Git/Codex/chat.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-violet-200 bg-white px-3 py-2 text-violet-950">
          Required pack:
          <span className="mt-1 block font-mono text-xs">
            HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {evidenceItems.map((item) => (
          <article
            key={item.caseId}
            className="border-l-2 border-violet-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-violet-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-violet-700">
                  {item.caseId}
                </p>
                <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Owner: {item.owner}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {item.evidence}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div
        data-ttgdtx-dashboard-acceptance-matrix="P2-18"
        className="mt-5 border-t border-violet-200 pt-5"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="font-semibold text-violet-950">
              P2-18 dashboard acceptance matrix: PASS_LOCAL only
            </h3>
            <p className="mt-1 leading-6 text-violet-900">
              Decision value:{" "}
              <span className="font-mono text-xs">
                P2_18_ACCEPT / FAIL / BLOCKED
              </span>
              . Use this matrix to decide whether the dashboard is ready for
              owner review, not to approve production.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {dashboardAcceptanceItems.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-violet-300 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-violet-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">
                {item.requirement}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                {item.minimumEvidence}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                {item.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          PASS_LOCAL does not mean P2-18 UAT passed, dashboard totals were
          accepted, or production GO is approved. KHTC, BGH, IT_DATA and Audit
          must sign the evidence outside Codex/chat.
        </p>
      </div>
    </section>
  );
}
