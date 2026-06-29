import { ClipboardCheck, FileCheck2, ShieldAlert } from "lucide-react";

type EvidenceItem = {
  caseId: string;
  title: string;
  owner: string;
  evidence: string;
};

type PayoutAcceptanceItem = {
  caseId: string;
  requirement: string;
  minimumEvidence: string;
  stopCondition: string;
};

const evidenceItems: EvidenceItem[] = [
  {
    caseId: "P2-17-01/P2-17-02",
    title: "Single payout and double-submit proof",
    owner: "KHTC + Audit",
    evidence:
      "Screenshot or export proving one approved request creates at most one disbursement while the submit button is pending.",
  },
  {
    caseId: "P2-17-03",
    title: "Duplicate voucher rejection",
    owner: "KHTC + IT_DATA",
    evidence:
      "Evidence that reused voucher number with different spacing/casing is rejected.",
  },
  {
    caseId: "P2-17-04/P2-17-05/P2-17-07",
    title: "Amount and paid-status controls",
    owner: "KHTC + Audit",
    evidence:
      "Proof that overpayment and already-paid requests are blocked, while intended partial payouts stay within approved amount.",
  },
  {
    caseId: "P2-17-06",
    title: "RPC-only write path",
    owner: "IT_DATA + Audit",
    evidence:
      "Database evidence that authenticated users cannot insert/update/delete disbursement rows directly.",
  },
  {
    caseId: "P2-17-08",
    title: "Payout evidence URL required",
    owner: "KHTC + Audit",
    evidence: "Screenshot or server result proving payout without evidence URL is rejected.",
  },
  {
    caseId: "P2-17-09/P2-17-10/P2-17-11",
    title: "P2-19 BBNT and partner invoice gates",
    owner: "KHTC + PHAP_CHE + Audit",
    evidence:
      "Block/pass evidence for BBNT and partner-invoice checks before payout can proceed.",
  },
];

const payoutAcceptanceItems: PayoutAcceptanceItem[] = [
  {
    caseId: "P2-17-ACCEPT-01",
    requirement: "Approved request identity and remaining amount",
    minimumEvidence:
      "Payout record ties to one P2-15 request approved in P2-16; amount is within remaining approved balance and request is not already PAID.",
    stopCondition:
      "Stop if request identity is unclear, approved amount cannot be proven, or overpayment remains possible.",
  },
  {
    caseId: "P2-17-ACCEPT-02",
    requirement: "Single write path and double-submit control",
    minimumEvidence:
      "PaymentSubmitButton disables while pending and the server action reaches payout write only through the approved RPC.",
    stopCondition:
      "Stop if direct table writes, duplicate clicks or any non-RPC path can create payout records.",
  },
  {
    caseId: "P2-17-ACCEPT-03",
    requirement: "Voucher and evidence uniqueness",
    minimumEvidence:
      "Normalized voucher uniqueness and payout evidence URL requirement are proven with redacted, non-secret references.",
    stopCondition:
      "Stop if voucher reuse is accepted, evidence URL is optional, or raw bank/payment evidence enters Git/Codex/chat.",
  },
  {
    caseId: "P2-17-ACCEPT-04",
    requirement: "P2-19 dossier blockers",
    minimumEvidence:
      "BBNT and partner-invoice checks are PASS before payout; FAIL or NOT_CHECKED blocks the board and RPC.",
    stopCondition:
      "Stop if P2_19_ACCEPTANCE_BEFORE_PAYOUT or P2_19_PARTNER_INVOICE_BEFORE_PAYOUT can be bypassed.",
  },
  {
    caseId: "P2-17-ACCEPT-05",
    requirement: "Partial and final payout lifecycle",
    minimumEvidence:
      "Partial payout stays within remaining balance, final payout updates paid status, and audit trace records actor/time/voucher.",
    stopCondition:
      "Stop if paid amount, request status or audit trace drifts from actual payout records.",
  },
  {
    caseId: "P2-17-ACCEPT-06",
    requirement: "Owner sign-off and production boundary",
    minimumEvidence:
      "KHTC, PHAP_CHE, BGH and Audit sign redacted evidence outside Codex/chat before P2-17 can support production review.",
    stopCondition:
      "Stop if PASS_LOCAL is treated as payout UAT pass, bank transfer approval, finance approval, money movement or production GO.",
  },
];

export function TtgdtxPayoutUatEvidenceChecklist() {
  return (
    <section
      data-ttgdtx-payout-uat-evidence-checklist="P2-17"
      className="rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-fuchsia-700" />
          <div>
            <h2 className="font-semibold text-fuchsia-950">
              P2-17 payout UAT evidence checklist: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-fuchsia-900">
              Signed payout UAT is still required before P2-17 can move from
              IN_PROGRESS. Collect only redacted screenshots, database snippets
              or non-secret evidence references; raw bank statements, raw bank
              accounts, vouchers, passwords, temporary passwords, OTPs,
              password reset links, account activation/invite links,
              service-role keys, raw payment data, student PII and CCCD stay
              outside Git/Codex/chat.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-fuchsia-200 bg-white px-3 py-2 text-fuchsia-950">
          Required runbook:
          <span className="mt-1 block font-mono text-xs">
            P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {evidenceItems.map((item) => (
          <article
            key={item.caseId}
            className="border-l-2 border-fuchsia-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-fuchsia-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-fuchsia-700">
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
        data-ttgdtx-payout-acceptance-matrix="P2-17"
        className="mt-5 border-t border-fuchsia-200 pt-5"
      >
        <div>
          <h3 className="font-semibold text-fuchsia-950">
            P2-17 payout acceptance matrix: PASS_LOCAL only
          </h3>
          <p className="mt-1 leading-6 text-fuchsia-900">
            Decision value:{" "}
            <span className="font-mono text-xs">
              P2_17_ACCEPT / FAIL / BLOCKED
            </span>
            . Use this matrix to decide whether payout evidence is ready for
            owner review, not to initiate money movement or approve production.
          </p>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {payoutAcceptanceItems.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-fuchsia-300 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-fuchsia-700">
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
          PASS_LOCAL does not mean payout UAT passed, payout evidence was
          accepted, money movement is approved, or production GO is approved.
          KHTC, PHAP_CHE, BGH and Audit must sign the evidence outside
          Codex/chat.
        </p>
      </div>
    </section>
  );
}
