import { ClipboardCheck, FileCheck2, ShieldAlert } from "lucide-react";

type EvidenceItem = {
  caseId: string;
  title: string;
  owner: string;
  evidence: string;
};

const evidenceItems: EvidenceItem[] = [
  {
    caseId: "AUD-01",
    title: "Receivable create/update trace",
    owner: "KHTC + Audit",
    evidence:
      "Audit rows for ttgdtx_student_receivables with actor, action, entity id and timestamp.",
  },
  {
    caseId: "AUD-02",
    title: "Tuition payment and receivable movement trace",
    owner: "KHTC + Audit",
    evidence:
      "Audit rows for ttgdtx_tuition_payments and the linked receivable paid/balance update.",
  },
  {
    caseId: "AUD-03",
    title: "Reconciliation create/review/lock trace",
    owner: "KHTC + Audit",
    evidence:
      "Audit rows for reconciliation batches and lines showing review, approve or lock changes.",
  },
  {
    caseId: "AUD-04",
    title: "Payment request check/approve trace",
    owner: "KHTC + BGH + Audit",
    evidence:
      "Audit rows for partner payment request creation, checker action and approver status change.",
  },
  {
    caseId: "AUD-05",
    title: "Payout disbursement trace",
    owner: "KHTC + Audit",
    evidence:
      "Audit rows for disbursement voucher plus partner payment request paid amount/status update.",
  },
  {
    caseId: "AUD-06",
    title: "Source-control evidence trace",
    owner: "PHAP_CHE + KHTC + Audit",
    evidence:
      "Audit rows for ttgdtx_source_documents or ttgdtx_source_control_checks after evidence/control update.",
  },
];

export function TtgdtxAuditLogUatEvidenceChecklist() {
  return (
    <section
      data-ttgdtx-audit-log-uat-evidence-checklist="P6-03"
      className="rounded-lg border border-cyan-200 bg-cyan-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-cyan-700" />
          <div>
            <h2 className="font-semibold text-cyan-950">
              P6-03 audit-log UAT evidence checklist: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-cyan-900">
              Signed audit-log UAT is still required before P6-03 can move from
              IN_PROGRESS. Collect only redacted screenshots, count queries or
              evidence references; passwords, OTPs, service-role keys, raw
              student identity data, CCCD, bank accounts and raw payment data
              stay outside Git/Codex/chat.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-cyan-200 bg-white px-3 py-2 text-cyan-950">
          Required runbook:
          <span className="mt-1 block font-mono text-xs">
            TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {evidenceItems.map((item) => (
          <article
            key={item.caseId}
            className="border-l-2 border-cyan-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-cyan-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-cyan-700">
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
          PASS_LOCAL does not mean audit evidence was accepted, financial
          traceability is complete, UAT passed, or production GO is approved.
          Audit, KHTC, IT_DATA, PHAP_CHE and BGH must sign the evidence outside
          Codex/chat.
        </p>
      </div>
    </section>
  );
}
