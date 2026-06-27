import { ClipboardCheck, FileCheck2, ShieldAlert } from "lucide-react";

type EvidenceItem = {
  caseId: string;
  title: string;
  owner: string;
  evidence: string;
};

type AuditLogAcceptanceItem = {
  caseId: string;
  requirement: string;
  minimumEvidence: string;
  stopCondition: string;
};

type AuditTraceDecisionItem = {
  caseId: string;
  decisionGate: string;
  requiredDecision: string;
  owner: string;
  stopCondition: string;
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

const auditLogAcceptanceItems: AuditLogAcceptanceItem[] = [
  {
    caseId: "P6-03-ACCEPT-01",
    requirement: "Static trigger coverage and read-only audit surface",
    minimumEvidence:
      "`audit:ttgdtx-audit-log` and `audit:ttgdtx-audit-trail-guard` pass; the `/audit` page reads `audit_logs` only.",
    stopCondition:
      "Stop if any required TTGDTX write table lacks trigger coverage or the audit page can insert, update, delete or call RPC.",
  },
  {
    caseId: "P6-03-ACCEPT-02",
    requirement: "Required event coverage",
    minimumEvidence:
      "UAT evidence includes create/update/check/approve/pay/source-control samples for AUD-01 through AUD-06.",
    stopCondition:
      "Stop if any required finance/control event is missing or represented only by a generic count with no sampled row.",
  },
  {
    caseId: "P6-03-ACCEPT-03",
    requirement: "Actor, entity, action and timestamp sufficiency",
    minimumEvidence:
      "Each sampled row shows actor, entity_type, entity_id, action and created_at tied to the tested workflow step.",
    stopCondition:
      "Stop if a reviewer cannot identify who changed which record, when and for which business action.",
  },
  {
    caseId: "P6-03-ACCEPT-04",
    requirement: "Before/after payload and evidence reference usefulness",
    minimumEvidence:
      "old_values, new_values, notes or controlled evidence reference prove the changed amount, status, approval or source-control result.",
    stopCondition:
      "Stop if payloads are empty, too generic or cannot prove the financial/control change.",
  },
  {
    caseId: "P6-03-ACCEPT-05",
    requirement: "Redaction and owner sign-off",
    minimumEvidence:
      "Screenshots/exports are redacted and signed by Audit, KHTC, IT_DATA, PHAP_CHE and BGH outside Codex/chat.",
    stopCondition:
      "Stop if passwords, OTPs, service-role keys, raw student identity data, CCCD, bank accounts, raw payment data or raw vouchers appear.",
  },
  {
    caseId: "P6-03-ACCEPT-06",
    requirement: "Production boundary",
    minimumEvidence:
      "Audit-log evidence stays advisory/read-only until signed UAT and owner GO/NO-GO exist.",
    stopCondition:
      "Stop if PASS_LOCAL is treated as audit-log UAT pass, financial traceability acceptance, owner waiver, finance approval or production GO.",
  },
];

const auditTraceDecisionItems: AuditTraceDecisionItem[] = [
  {
    caseId: "P6-03-DEC-01",
    decisionGate: "Static trigger and read-only surface",
    requiredDecision:
      "`audit:ttgdtx-audit-log`, `audit:ttgdtx-audit-trail-guard` and release-gate audits pass; `/audit` reads audit_logs only.",
    owner: "IT_DATA + Audit",
    stopCondition:
      "Stop if any required TTGDTX write table lacks trigger coverage or the audit surface can write, call RPC or approve workflow state.",
  },
  {
    caseId: "P6-03-DEC-02",
    decisionGate: "Required event sample coverage",
    requiredDecision:
      "AUD-01 through AUD-06 each have at least one sampled row for create/update/check/approve/pay/source-control events.",
    owner: "KHTC + Audit",
    stopCondition:
      "Stop if any event is missing, represented only by a count, or cannot be tied to a concrete UAT record.",
  },
  {
    caseId: "P6-03-DEC-03",
    decisionGate: "Actor, entity, action and time",
    requiredDecision:
      "Each sampled row identifies actor, entity_type, entity_id, action, created_at and the related business step.",
    owner: "Audit + IT_DATA",
    stopCondition:
      "Stop if reviewers cannot identify who changed which record, when and for which business action.",
  },
  {
    caseId: "P6-03-DEC-04",
    decisionGate: "Before/after and evidence usefulness",
    requiredDecision:
      "old_values, new_values, notes, evidence_url or controlled reference prove the changed amount, status, approval or source-control result.",
    owner: "KHTC + PHAP_CHE + Audit",
    stopCondition:
      "Stop if payloads are empty, too generic, unredacted, or cannot prove the financial/control change.",
  },
  {
    caseId: "P6-03-DEC-05",
    decisionGate: "Workflow chain continuity",
    requiredDecision:
      "Trace rows connect upstream request/source records to downstream receivable, collection, reconciliation, payout or control state.",
    owner: "KHTC + IT_DATA + Audit",
    stopCondition:
      "Stop if a status, approval or money movement has no traceable upstream/downstream audit link.",
  },
  {
    caseId: "P6-03-DEC-06",
    decisionGate: "Human traceability decision",
    requiredDecision:
      "Operator, checker, owner signers, evidence IDs, sampled rows and final decision are recorded as P6_03_TRACE_READY, NO_GO or BLOCKED.",
    owner: "Audit + KHTC + IT_DATA + BGH",
    stopCondition:
      "Stop if PASS_LOCAL is treated as audit-log UAT pass, financial traceability acceptance, owner waiver, finance approval or production GO.",
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

      <div
        data-ttgdtx-audit-log-evidence-acceptance-matrix="P6-03"
        className="mt-5 border-t border-cyan-200 pt-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-cyan-950">
              P6-03 audit-log evidence acceptance matrix: PASS_LOCAL only
            </h3>
            <p className="mt-1 leading-6 text-cyan-900">
              Decision value:{" "}
              <span className="font-mono text-xs">
                P6_03_ACCEPT / FAIL / BLOCKED
              </span>
              . Use this matrix to decide whether audit-log evidence is ready
              for owner review, not to approve production.
            </p>
          </div>
          <div className="min-w-64 rounded-md border border-cyan-200 bg-white px-3 py-2 text-cyan-950">
            Weak screenshots or count-only exports are not enough for financial
            traceability.
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {auditLogAcceptanceItems.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-cyan-300 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-cyan-700">
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

      <div
        data-ttgdtx-audit-trace-decision-manifest="P6-03"
        className="mt-5 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-950"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 font-semibold">
              <ClipboardCheck className="size-4 shrink-0" />
              <span>
                P6-03 audit traceability decision manifest: PASS_LOCAL only
              </span>
            </div>
            <p className="mt-2 leading-6">
              Use this manifest after audit-log UAT evidence is sampled and
              before owner review. It records whether traceability evidence is
              ready for review, but it does not accept UAT, approve finance,
              waive evidence or approve production GO.
            </p>
          </div>
          <div className="min-w-64 rounded-md border border-sky-200 bg-white px-3 py-2">
            Trace decision:
            <span className="mt-1 block font-mono text-xs">
              P6_03_TRACE_READY / NO_GO / BLOCKED
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {auditTraceDecisionItems.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-sky-300 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-sky-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">
                {item.decisionGate}
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

        <div className="mt-4 rounded-md border border-sky-200 bg-white px-3 py-2 text-sky-900">
          Missing trace decision ID, missing sampled row, generic payload,
          broken workflow chain, unsigned owner decision or raw sensitive audit
          evidence keeps P6-03 NO-GO.
        </div>
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
