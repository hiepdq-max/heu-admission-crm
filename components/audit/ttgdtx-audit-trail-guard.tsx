import { FileSearch, ShieldCheck } from "lucide-react";

type AuditTrailItem = {
  step: string;
  entity: string;
  expected: string;
  uatCase: string;
};

const auditTrailItems: AuditTrailItem[] = [
  {
    step: "P2-03",
    entity: "ttgdtx_student_receivables",
    expected: "Create/update receivable evidence with actor and timestamp.",
    uatCase: "AUD-01",
  },
  {
    step: "P2-10",
    entity: "ttgdtx_tuition_payments",
    expected: "Collection voucher and linked receivable update evidence.",
    uatCase: "AUD-02",
  },
  {
    step: "P2-13/P2-14",
    entity: "ttgdtx_tuition_reconciliation_batches",
    expected: "Reconciliation create, review, approve and lock evidence.",
    uatCase: "AUD-03",
  },
  {
    step: "P2-15/P2-16",
    entity: "ttgdtx_partner_payment_requests",
    expected: "Payment request create, check and approve status evidence.",
    uatCase: "AUD-04",
  },
  {
    step: "P2-17",
    entity: "ttgdtx_partner_payment_disbursements",
    expected: "Payout voucher evidence and paid amount/status update trace.",
    uatCase: "AUD-05",
  },
  {
    step: "P2-11/P2-19",
    entity: "ttgdtx_source_documents / ttgdtx_source_control_checks",
    expected: "Source document and control-check update evidence.",
    uatCase: "AUD-06",
  },
];

export function TtgdtxAuditTrailGuard() {
  return (
    <section
      data-ttgdtx-audit-trail-guard="AUDIT_LOG"
      className="rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <FileSearch className="mt-0.5 size-5 shrink-0 text-sky-700" />
          <div>
            <h2 className="font-semibold text-zinc-950">
              Guard audit trail TTGDTX
            </h2>
            <p className="mt-1 leading-6 text-zinc-600">
              Trước khi ký UAT, Audit/KHTC phải nhìn thấy dấu vết cho các thao
              tác tạo, cập nhật, kiểm, duyệt và chi. Màn này chỉ đọc
              `audit_logs`, không phê duyệt, không sửa tiền và không thay thế
              chữ ký UAT.
            </p>
          </div>
        </div>
        <div className="min-w-64 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          PASS_LOCAL nghĩa là guard và trigger coverage được đóng gói; UAT vẫn
          phải chứng minh có audit row thật cho create/update/approve/pay.
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 leading-6 text-amber-950"
        data-ttgdtx-audit-log-uat-boundary="P6-03"
      >
        <p className="font-semibold">
          P6-03 audit-log UAT: PASS_LOCAL only.
        </p>
        <p className="mt-2">
          Signed audit-log UAT evidence is still required. NO-GO until signed
          audit-log evidence exists for create, update, check, approve, pay and
          source-control events.
        </p>
        <p className="mt-2">
          Do not paste passwords, OTPs, service-role keys, CCCD, bank accounts
          or raw student identity data into audit screenshots, UAT notes or
          Codex prompts.
        </p>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {auditTrailItems.map((item) => (
          <div
            key={item.uatCase}
            className="border-l-2 border-sky-200 bg-sky-50/60 px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-700" />
              <div>
                <p className="font-medium text-zinc-950">
                  {item.step}: {item.entity}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">{item.expected}</p>
                <p className="mt-1 text-xs font-medium uppercase text-sky-700">
                  UAT: {item.uatCase}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
