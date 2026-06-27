import { AlertTriangle, LockKeyhole, ShieldCheck } from "lucide-react";

type GuardItem = {
  title: string;
  enforcement: string;
  uatCase: string;
};

const payoutGuards: GuardItem[] = [
  {
    title: "Submit một lần trên trình duyệt",
    enforcement: "Nút P2-17 chuyển pending và disabled trong lúc gửi form.",
    uatCase: "P2-17-02",
  },
  {
    title: "Chỉ đi qua RPC đã duyệt",
    enforcement: "Authenticated user bị revoke insert/update/delete trực tiếp; ghi chi qua record_ttgdtx_partner_payment_disbursement.",
    uatCase: "P2-17-06",
  },
  {
    title: "Khóa phiếu khi ghi chi",
    enforcement: "RPC select phiếu P2-15/P2-16 for update trước khi tính số còn phải chi.",
    uatCase: "P2-17-01, P2-17-04, P2-17-05",
  },
  {
    title: "Chặn số chứng từ trùng",
    enforcement: "Số chứng từ được trim/normalize và có unique index lower(btrim(voucher_no)).",
    uatCase: "P2-17-03",
  },
  {
    title: "Chặn chi vượt hoặc phiếu đã PAID",
    enforcement: "RPC so sánh amount với remaining approved amount và từ chối request_status = PAID.",
    uatCase: "P2-17-04, P2-17-07",
  },
  {
    title: "Bắt buộc chứng từ chi và P2-19",
    enforcement: "Server action yêu cầu evidence_url; RPC chặn thiếu BBNT hoặc partner invoice checks.",
    uatCase: "P2-17-08, P2-17-09, P2-17-10, P2-17-11",
  },
];

export function TtgdtxPayoutDuplicateGuard() {
  return (
    <section
      data-ttgdtx-payout-duplicate-guard="P2-17"
      className="rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 size-5 shrink-0 text-rose-700" />
          <div>
            <h2 className="font-semibold text-zinc-950">
              Guard chống chi trùng P2-17
            </h2>
            <p className="mt-1 leading-6 text-zinc-600">
              P2-17 chỉ là ghi nhận chứng từ đã chi, không khởi tạo lệnh ngân
              hàng. Một khoản chi phải đi qua nút pending, RPC, khóa dòng,
              voucher guard, kiểm soát số còn phải chi và P2-19 evidence gate.
            </p>
          </div>
        </div>
        <div className="flex min-w-64 items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            PASS_LOCAL chỉ chứng minh guard được đóng gói trong code. P2-17 vẫn
            cần chạy `P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK` và ký UAT.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {payoutGuards.map((guard) => (
          <div
            key={guard.title}
            className="border-l-2 border-rose-200 bg-rose-50/50 px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-rose-700" />
              <div>
                <p className="font-medium text-zinc-950">{guard.title}</p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {guard.enforcement}
                </p>
                <p className="mt-1 text-xs font-medium uppercase text-rose-700">
                  UAT: {guard.uatCase}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
