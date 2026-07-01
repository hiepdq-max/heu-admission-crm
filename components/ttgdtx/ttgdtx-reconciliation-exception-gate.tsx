import { AlertTriangle, LockKeyhole, ShieldCheck } from "lucide-react";

type ReconciliationGateItem = {
  code: string;
  title: string;
  checkpoint: string;
  stopCondition: string;
};

const reconciliationGateItems: ReconciliationGateItem[] = [
  {
    code: "REC-GATE-01",
    title: "Chứng từ thu đã ghi nhận",
    checkpoint:
      "Payment P2-10 phải ở trạng thái POSTED, có voucher_no và không nằm trong kỳ đối soát hiệu lực khác.",
    stopCondition:
      "Dừng nếu thiếu số chứng từ, payment chưa POSTED, đã REVERSED/CANCELLED hoặc đã vào batch khác.",
  },
  {
    code: "REC-GATE-02",
    title: "Hóa đơn/chứng từ đã chốt",
    checkpoint:
      "invoice_control_status phải RESOLVED trước khi P2-14 duyệt/khóa kỳ.",
    stopCondition:
      "Dừng nếu invoice_required còn PENDING_POLICY, issuer chưa rõ hoặc invoice_status không phù hợp.",
  },
  {
    code: "REC-GATE-03",
    title: "Kỳ khóa mới được chuyển chi",
    checkpoint:
      "P2-15/P2-16/P2-17 chỉ được đọc kỳ P2-14 đã LOCKED, không đọc kỳ DRAFT/REVIEWED/APPROVED chưa khóa.",
    stopCondition:
      "Dừng nếu kỳ chưa LOCKED, bị CANCELLED, reopened không có phiếu điều chỉnh hoặc thiếu audit trail.",
  },
  {
    code: "REC-GATE-04",
    title: "Minh chứng ngoài hệ thống",
    checkpoint:
      "Link evidence chỉ là tham chiếu đã kiểm soát/redact; chứng từ gốc, sao kê, voucher và PII không đưa vào Git/Codex/chat.",
    stopCondition:
      "Dừng nếu evidence chưa được redaction, thiếu owner hoặc chưa có dấu vết P0-14/P6-03.",
  },
];

export function TtgdtxReconciliationExceptionGate() {
  return (
    <section
      data-ttgdtx-reconciliation-exception-gate="P2-13_P2-14"
      className="rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <div>
            <h2 className="font-semibold text-zinc-950">
              Gate ngoại lệ đối soát P2-13/P2-14
            </h2>
            <p className="mt-1 leading-6 text-zinc-600">
              Kỳ đối soát chỉ được tạo, duyệt và khóa khi chứng từ thu, hóa
              đơn/chứng từ, trạng thái batch và evidence đều rõ nguồn. Gate này
              chỉ cảnh báo và khóa quy trình, không tự động gạch nợ, chi tiền
              hoặc chấp nhận UAT.
            </p>
          </div>
        </div>
        <div className="flex min-w-64 items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          <LockKeyhole className="mt-0.5 size-4 shrink-0" />
          <p>
            PASS_LOCAL only. Signed finance UAT, owner evidence and locked
            reconciliation proof are still required before payout reliance.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {reconciliationGateItems.map((item) => (
          <div
            className="border-l-2 border-emerald-200 bg-emerald-50/60 px-3 py-3"
            key={item.code}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-emerald-700" />
              <div>
                <p className="text-xs font-medium uppercase text-emerald-700">
                  {item.code}
                </p>
                <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {item.checkpoint}
                </p>
                <p className="mt-2 leading-5 text-amber-800">
                  {item.stopCondition}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
