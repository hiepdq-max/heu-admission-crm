import { Ban, FileLock2, ShieldAlert } from "lucide-react";

const accountControlRules = [
  {
    caseId: "ACCT-CTRL-01",
    title: "Thông báo phong tỏa tài khoản học phí",
    scope:
      "Chỉ theo dõi metadata/evidence link, owner, phạm vi bị ảnh hưởng và mã tham chiếu trao đổi.",
    boundary:
      "Không tạo lệnh ngân hàng, không lưu danh sách người nhận thô và không phê duyệt phong tỏa tài khoản.",
  },
  {
    caseId: "ACCT-CTRL-02",
    title: "Yêu cầu giải tỏa tài khoản học phí",
    scope:
      "Chỉ theo dõi metadata/evidence link, mã xác nhận ngân hàng và mã phê duyệt tài chính của người có thẩm quyền.",
    boundary:
      "Không thực hiện giải tỏa tài khoản, không gửi chỉ dẫn ngân hàng và không vận hành production.",
  },
  {
    caseId: "ACCT-CTRL-03",
    title: "Bằng chứng trao đổi",
    scope:
      "Theo dõi kênh trao đổi, owner, trạng thái xác nhận và mã bằng chứng trong nơi lưu trữ kiểm soát.",
    boundary:
      "Không đưa danh sách số điện thoại thô, danh sách người nhận ngân hàng, CCCD hoặc nội dung tin nhắn riêng vào Git/Codex/chat.",
  },
  {
    caseId: "ACCT-CTRL-04",
    title: "Tách biệt giải chấp tài sản bảo đảm",
    scope:
      "Giữ giải chấp tài sản bảo đảm trong sổ đăng ký pháp chế-tài chính hạn chế, tách khỏi luồng thanh toán TTGDTX.",
    boundary:
      "Không trộn giải chấp tài sản bảo đảm với giải tỏa tài khoản học phí hoặc phê duyệt thanh toán đối tác.",
  },
];

export function TtgdtxAccountControlScopeGuard() {
  return (
    <section
      data-ttgdtx-account-control-scope-guard="P2-19"
      className="rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <FileLock2 className="mt-0.5 size-5 shrink-0 text-slate-700" />
          <div>
            <h2 className="font-semibold text-slate-950">
              Account-control scope guard: metadata-only
            </h2>
            <p className="mt-2 leading-6 text-slate-700">
              Phong tỏa/giải tỏa tài khoản trong TTGDTX 9+ chỉ được theo dõi
              như metadata/evidence reference. Ứng dụng không gửi lệnh ngân
              hàng, không đánh dấu tài khoản đã phong tỏa/giải tỏa, không phê
              duyệt giải chấp và không thay thế chữ ký KHTC/CTHSSV/Pháp chế.
            </p>
          </div>
        </div>
        <div className="flex min-w-64 items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
          <Ban className="mt-0.5 size-4 shrink-0" />
          <p>
            PASS_LOCAL chỉ là quyết định phạm vi. Không vận hành ngân hàng,
            không giải chấp tài sản bảo đảm, không payout, không accept UAT,
            không import dữ liệu, không production migration và không
            production GO.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {accountControlRules.map((item) => (
          <article
            key={item.caseId}
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-slate-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-600">
                  {item.caseId}
                </p>
                <p className="mt-1 font-medium text-slate-950">{item.title}</p>
                <p className="mt-2 leading-5 text-slate-700">
                  Phạm vi: {item.scope}
                </p>
                <p className="mt-2 leading-5 text-rose-800">
                  Ranh giới: {item.boundary}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
