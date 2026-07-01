import { AlertTriangle, Scale, ShieldCheck, UserCheck } from "lucide-react";

type ApprovalSeparationItem = {
  caseId: string;
  title: string;
  requiredControl: string;
  stopCondition: string;
};

const approvalSeparationItems: ApprovalSeparationItem[] = [
  {
    caseId: "P2-16-SEP-01",
    title: "Maker không tự duyệt",
    requiredControl:
      "Người lập P2-15, người CHECK và người APPROVE P2-16 phải được ghi nhận rõ trong bằng chứng UAT/owner evidence.",
    stopCondition:
      "Dừng nếu cùng một người tự lập, tự kiểm, tự duyệt mà không có owner exception bằng văn bản.",
  },
  {
    caseId: "P2-16-SEP-02",
    title: "CHECK trước APPROVE",
    requiredControl:
      "P2-16 chỉ được APPROVE khi request_status đã CHECKED và số tiền duyệt không vượt số tiền đề nghị.",
    stopCondition:
      "Dừng nếu bỏ qua CHECK, approve trực tiếp từ SUBMITTED, approve âm/0, hoặc approve vượt request amount.",
  },
  {
    caseId: "P2-16-SEP-03",
    title: "Hồ sơ trước lệnh chi",
    requiredControl:
      "P2-14 locked period, BBNT, partner invoice/waiver, payment amount basis và P2-19 checks phải được đối chiếu trước khi APPROVE.",
    stopCondition:
      "Dừng nếu hồ sơ BBNT/invoice/waiver/P2-19 còn FAIL, NOT_CHECKED, ownerless hoặc chưa có evidence reference.",
  },
  {
    caseId: "P2-16-SEP-04",
    title: "Duyệt không phải chi tiền",
    requiredControl:
      "APPROVE ở P2-16 chỉ mở đầu vào cho P2-17; không phát lệnh ngân hàng, không xác nhận đã chi và không chấp nhận UAT.",
    stopCondition:
      "Dừng nếu P2-16 bị dùng như bank instruction, payout approval cuối cùng, revenue recognition hoặc production GO.",
  },
  {
    caseId: "P2-16-SEP-05",
    title: "Return/reject bắt buộc lý do",
    requiredControl:
      "RETURN hoặc REJECT phải có note rõ lý do, người xử lý, thời điểm và evidence nếu có.",
    stopCondition:
      "Dừng nếu trả về/từ chối không có note, không rõ owner hoặc làm mất dấu vết audit.",
  },
  {
    caseId: "P2-16-SEP-06",
    title: "Bằng chứng đã redact",
    requiredControl:
      "Evidence URL chỉ trỏ tới hồ sơ đã phân quyền/redact; không đưa sao kê, voucher gốc, mật khẩu, OTP, bank account hay raw PII vào Git/Codex/chat.",
    stopCondition:
      "Dừng nếu bằng chứng chưa redact, chưa kiểm soát quyền xem hoặc chưa có P0-14/P6-03 audit trail.",
  },
];

export function TtgdtxPaymentApprovalSeparationGuard() {
  return (
    <section
      data-ttgdtx-payment-approval-separation-guard="P2-16"
      className="rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <UserCheck className="mt-0.5 size-5 shrink-0 text-cyan-700" />
          <div>
            <h2 className="font-semibold text-zinc-950">
              Guard tách kiểm tra/duyệt P2-16
            </h2>
            <p className="mt-1 leading-6 text-zinc-600">
              P2-16 chỉ là bước kiểm tra và duyệt đề nghị chi sau P2-15. Màn
              này phải chứng minh được người lập, người kiểm, người duyệt, hồ
              sơ BBNT/hóa đơn và giới hạn số tiền trước khi mở P2-17.
            </p>
          </div>
        </div>
        <div className="flex min-w-72 items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            PASS_LOCAL only. Signed payout UAT and owner evidence are still
            required; P2-16 does not initiate payout or approve production use.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {approvalSeparationItems.map((item) => (
          <article
            className="border-l-2 border-cyan-200 bg-cyan-50/60 px-3 py-3"
            key={item.caseId}
          >
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cyan-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-cyan-700">
                  {item.caseId}
                </p>
                <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {item.requiredControl}
                </p>
                <p className="mt-2 leading-5 text-rose-800">
                  Stop: {item.stopCondition}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div
        data-ttgdtx-payment-approval-decision-boundary="P2-16"
        className="mt-5 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-3 text-cyan-950"
      >
        <div className="flex items-start gap-2">
          <Scale className="mt-0.5 size-4 shrink-0 text-cyan-700" />
          <p>
            Decision lane: P2_16_APPROVAL_SEPARATED / NO_GO / BLOCKED. Missing
            role separation proof, unresolved dossier evidence, unsigned owner
            result or unclear bank-transfer boundary keeps P2-16 NO-GO.
          </p>
        </div>
      </div>
    </section>
  );
}
