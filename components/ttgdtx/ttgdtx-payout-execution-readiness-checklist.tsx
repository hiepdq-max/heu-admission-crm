import { FileCheck2, ShieldAlert, ShieldCheck, WalletCards } from "lucide-react";

type ExecutionReadinessCheck = {
  caseId: string;
  check: string;
  source: string;
  passRule: string;
  owner: string;
  stopCondition: string;
};

const executionReadinessChecks: ExecutionReadinessCheck[] = [
  {
    caseId: "P2-17-EXEC-01",
    check: "Approved request identity",
    source: "ttgdtx_partner_payment_execution_board.request_id / request_status",
    passRule:
      "Request is APPROVED, scoped to TTGDTX, visible in the pay board and can_pay is true before the form is enabled.",
    owner: "KHTC + BGH",
    stopCondition:
      "Unknown request, wrong segment, non-approved status or can_pay false blocks payout recording.",
  },
  {
    caseId: "P2-17-EXEC-02",
    check: "Remaining amount control",
    source: "approved_amount_vnd / paid_amount_vnd / remaining_amount_vnd",
    passRule:
      "Entered payout amount is positive and does not exceed the remaining approved amount.",
    owner: "KHTC + Audit",
    stopCondition:
      "Zero, negative, over-remaining or already-paid request blocks payout recording.",
  },
  {
    caseId: "P2-17-EXEC-03",
    check: "Voucher uniqueness",
    source: "voucher_no and normalized unique index",
    passRule:
      "One controlled voucher number is entered and the database rejects the same voucher after trim/lower normalization.",
    owner: "KHTC + IT_DATA",
    stopCondition:
      "Missing voucher or duplicate normalized voucher blocks payout recording.",
  },
  {
    caseId: "P2-17-EXEC-04",
    check: "Evidence URL required",
    source: "evidence_url on the payout form and RPC payload",
    passRule:
      "The evidence link points to a controlled redacted reference; raw bank statements, vouchers and credentials stay outside Git/Codex/chat.",
    owner: "KHTC + Audit",
    stopCondition:
      "Missing evidence link or raw sensitive evidence in the working area blocks payout recording.",
  },
  {
    caseId: "P2-17-EXEC-05",
    check: "P2-19 dossier blockers",
    source: "P2_19_ACCEPTANCE_BEFORE_PAYOUT / P2_19_PARTNER_INVOICE_BEFORE_PAYOUT",
    passRule:
      "BBNT/accepted-period evidence and partner invoice evidence are checked before payout can proceed.",
    owner: "KHTC + PHAP_CHE + BGH",
    stopCondition:
      "Missing, failed or not-checked P2-19 control blocks payout recording.",
  },
  {
    caseId: "P2-17-EXEC-06",
    check: "RPC-only write path",
    source: "recordTtgdtxPartnerPaymentDisbursementAction -> record_ttgdtx_partner_payment_disbursement",
    passRule:
      "The screen writes through the server action and approved RPC; direct insert/update/delete is revoked.",
    owner: "IT_DATA + Audit",
    stopCondition:
      "Any direct table write path or unreviewed mutation path blocks release sign-off.",
  },
  {
    caseId: "P2-17-EXEC-07",
    check: "Double-submit guard",
    source: "PaymentSubmitButton pending state",
    passRule:
      "Submit button enters pending state and stays disabled while the payout request is being recorded.",
    owner: "IT_DATA + KHTC",
    stopCondition:
      "A user can trigger two submissions from one form interaction.",
  },
  {
    caseId: "P2-17-EXEC-08",
    check: "Audit trace and status",
    source: "recent disbursement view, request status and audit log",
    passRule:
      "After success, voucher, amount, actor, timestamp, request paid/partial status and evidence reference are traceable.",
    owner: "KHTC + Audit",
    stopCondition:
      "Payout cannot be traced from request to disbursement evidence and audit actor.",
  },
];

export function TtgdtxPayoutExecutionReadinessChecklist() {
  return (
    <section
      data-ttgdtx-payout-execution-readiness-checklist="P2-17"
      className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-4xl items-start gap-3">
          <WalletCards className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <div>
            <h2 className="font-semibold text-emerald-950">
              P2-17 payout execution readiness checklist: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-emerald-900">
              Operators must verify request status, remaining amount, voucher,
              evidence, P2-19 dossier blockers, RPC-only write path,
              double-submit behavior and audit trace before relying on a payout
              record. P2-17 records money already paid; it does not initiate a
              bank transfer.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-emerald-200 bg-white px-3 py-2 text-emerald-950">
          Required UAT:
          <span className="mt-1 block font-mono text-xs">
            P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {executionReadinessChecks.map((item) => (
          <article
            key={item.caseId}
            className="border-l-2 border-emerald-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-700">
                  {item.caseId} - {item.check}
                </p>
                <p className="mt-2 font-mono text-xs text-emerald-950">
                  {item.source}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {item.passRule}
                </p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Owner: {item.owner}
                </p>
                <p className="mt-2 leading-5 text-rose-700">
                  Stop: {item.stopCondition}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-white px-3 py-2 text-emerald-950">
          <FileCheck2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
          <p>
            PASS_LOCAL means the execution checklist is visible and wired into
            the guarded P2-17 screen. It does not prove any real payout was
            tested or approved.
          </p>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            Do not paste passwords, OTPs, service-role keys, raw student PII,
            CCCD, bank accounts, raw bank statements, raw vouchers or raw
            payment data into Git, Codex or chat.
          </p>
        </div>
      </div>
    </section>
  );
}
