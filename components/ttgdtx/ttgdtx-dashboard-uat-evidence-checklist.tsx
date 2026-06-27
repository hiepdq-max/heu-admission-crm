import { ClipboardCheck, FileCheck2, ShieldAlert } from "lucide-react";

type EvidenceItem = {
  caseId: string;
  title: string;
  owner: string;
  evidence: string;
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
