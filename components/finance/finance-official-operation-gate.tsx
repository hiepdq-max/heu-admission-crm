import { ListChecks, LockKeyhole, ShieldCheck } from "lucide-react";

const officialOperationGates = [
  {
    code: "FIN-OFFICIAL-01",
    title: "UAT vai trò/workspace P6-04 đã ký",
    proof:
      "Bằng chứng vai trò/phạm vi đã ký chứng minh user kế toán chỉ truy cập được phạm vi TTGDTX đã duyệt và tài khoản kiểm thử âm bị BLOCKED hoặc EMPTY_SCOPED_STATE.",
    stop:
      "Thiếu chữ ký P6-04, phạm vi quá rộng, lộ route, bằng chứng thô hoặc bài kiểm thử âm chưa ký đều giữ vận hành chính thức ở NO-GO.",
  },
  {
    code: "FIN-OFFICIAL-02",
    title: "UAT dashboard kế toán P2-18 đã ký",
    proof:
      "KHTC/BGH/IT_DATA ký xác nhận hành vi chỉ đọc của dashboard, đối soát nguồn, vệ sinh bằng chứng và ranh giới sử dụng ngoài Codex/chat.",
    stop:
      "Dashboard có thể ghi dữ liệu, tổng nguồn lệch, bằng chứng không được kiểm soát hoặc việc sử dụng của owner chưa có chữ ký.",
  },
  {
    code: "FIN-OFFICIAL-03",
    title: "UAT Finance Desk P5-03 đã ký",
    proof:
      "UAT trên trình duyệt chứng minh Finance Desk chỉ là màn hình điều hành chỉ đọc, liên kết thao tác đúng phạm vi, từ chối truy cập, truy vết nguồn và quyết định sử dụng.",
    stop:
      "Finance Desk hiển thị sửa, duyệt, thanh toán, phạm vi không giới hạn, lỗi database thô hoặc quyết định sử dụng chưa ký.",
  },
  {
    code: "FIN-OFFICIAL-04",
    title: "Bằng chứng backup/restore P0-03 đã được chấp nhận",
    proof:
      "Mã backup, đích khôi phục, kết quả smoke-check, phiếu vận hành và quyết định đóng được ghi trong nơi lưu bằng chứng có kiểm soát.",
    stop:
      "Thiếu bằng chứng backup/restore, chưa kiểm thử, chưa ký, còn dữ liệu thô, lưu trong Git/Codex/chat hoặc không bảo toàn được bằng chứng P2-18/P5-03/P6-04.",
  },
  {
    code: "FIN-OFFICIAL-05",
    title: "Owner ký GO/NO-GO P0-09",
    proof:
      "BGH, IT_DATA, KHTC, PHAP_CHE, Audit và owner nghiệp vụ ký bộ GO/NO-GO cuối cùng kèm tham chiếu bằng chứng có kiểm soát.",
    stop:
      "Thiếu bất kỳ owner nào, có owner đánh dấu NO_GO/BLOCKED, yêu cầu bổ sung bằng chứng hoặc coi PASS_LOCAL là phê duyệt production.",
  },
];

const safePilotOrder = [
  {
    code: "FIN-PILOT-01",
    title: "Tạo tài khoản qua kênh bảo mật ngoài Codex/chat",
    action:
      "Owner tài khoản tạo hoặc mời tài khoản kế toán thật chỉ qua kênh bảo mật đã được phê duyệt.",
    stop:
      "Mật khẩu, OTP, link reset, link kích hoạt, service-role key, PII thô, dữ liệu ngân hàng hoặc chứng từ xuất hiện trong Codex/chat.",
  },
  {
    code: "FIN-PILOT-02",
    title: "Giới hạn profile và workspace TTGDTX",
    action:
      "IT liên kết Auth user với profile HEU và chỉ cấp role, workspace, phạm vi đối tác TTGDTX đã được duyệt.",
    stop:
      "Role quá rộng, workspace chưa rõ, thiếu phạm vi đối tác hoặc chưa chuẩn bị tài khoản kiểm thử âm.",
  },
  {
    code: "FIN-PILOT-03",
    title: "Ma trận trước đăng nhập và tài khoản kiểm thử âm P6-04",
    action:
      "Chạy ma trận route P6-04 trước khi dùng Finance Desk, gồm bằng chứng BLOCKED hoặc EMPTY_SCOPED_STATE cho user ngoài phạm vi.",
    stop:
      "Bất kỳ route nào làm lộ dữ liệu, hiển thị bằng chứng thô hoặc thiếu bằng chứng đã ẩn danh và chữ ký owner.",
  },
  {
    code: "FIN-PILOT-04",
    title: "Chỉ pilot chỉ đọc P2-18 và P5-03",
    action:
      "Mở dashboard kế toán và Finance Desk như bề mặt diễn tập chỉ đọc; mọi điều chỉnh phải thực hiện tại workflow nguồn P2.",
    stop:
      "Pilot có thể sửa, duyệt, thanh toán, hạch toán chứng từ, phát lệnh ngân hàng hoặc coi tổng dashboard là số liệu production.",
  },
  {
    code: "FIN-PILOT-05",
    title: "Sổ kết quả và đóng quyền trước khi mở rộng",
    action:
      "Ghi mã bằng chứng kiểm soát, quyết định owner và ACCESS_RETAIN hoặc REVOKE_OR_REDUCE trước khi thêm user.",
    stop:
      "Thiếu sổ kết quả Day-1, đóng quyền P0-17, bằng chứng backup/restore hoặc GO/NO-GO của owner.",
  },
];

export function FinanceOfficialOperationGate() {
  return (
    <section
      className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-950 shadow-sm"
      data-finance-official-operation-gate="P6-04_P2-18_P5-03_P0-03_P0-09"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2">
            <LockKeyhole className="size-5 text-rose-700" />
            <h2 className="text-base font-semibold">
              Cổng vận hành Finance chính thức: NO-GO cho đến khi đủ chữ ký
            </h2>
          </div>
          <p className="mt-2">
            Trang này chỉ hỗ trợ diễn tập chỉ đọc có kiểm soát. Vận hành chính
            thức vẫn bị khóa cho đến khi P6-04, P2-18, P5-03, bằng chứng
            backup/restore và GO/NO-GO của owner được ký ngoài Codex/chat.
          </p>
          <p className="mt-2">
            Trang này không phê duyệt kế toán theo quy định, hạch toán chứng từ,
            phê duyệt tài chính, lệnh chuyển khoản, sử dụng dashboard production,
            nghiệm thu UAT hoặc GO production. Không có nút GO.
          </p>
        </div>
        <div className="rounded-md border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-800">
          Quyết định: OFFICIAL_OPERATION_READY / NO_GO / BLOCKED
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-5">
        {officialOperationGates.map((gate) => (
          <article
            className="border-l-2 border-rose-300 bg-white px-3 py-3"
            key={gate.code}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-rose-700" />
              <p className="font-mono text-xs font-semibold text-rose-800">
                {gate.code}
              </p>
            </div>
            <h3 className="mt-2 font-semibold text-zinc-950">{gate.title}</h3>
            <p className="mt-2 text-zinc-700">Bằng chứng: {gate.proof}</p>
            <p className="mt-2 text-rose-800">Điểm dừng: {gate.stop}</p>
          </article>
        ))}
      </div>

      <div
        className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-950"
        data-finance-safe-pilot-order="P6-04_P2-18_P5-03"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2">
              <ListChecks className="size-5 text-amber-700" />
              <h3 className="text-sm font-semibold">
                Thứ tự pilot Finance an toàn: chỉ đọc trước khi mở rộng
              </h3>
            </div>
            <p className="mt-2">
              Thứ tự này cho phép một luồng pilot kế toán có kiểm soát mà không
              biến hệ thống thành vận hành chính thức. Phải hoàn tất sổ kết quả
              và quyết định đóng quyền trước khi bàn đến thêm user, mở rộng phạm
              vi hoặc sử dụng cho production.
            </p>
            <p className="mt-2">
              Panel này không tạo tài khoản, gửi lời mời, lưu mật khẩu, cấp quyền,
              thực hiện UAT, chấp nhận bằng chứng, phê duyệt sử dụng số liệu tài
              chính, phê duyệt đóng quyền, chuyển tiền, phát lệnh ngân hàng hoặc
              đánh dấu production GO.
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-800">
            Quyết định: FIN_PILOT_READY / NO_GO / BLOCKED
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-5">
          {safePilotOrder.map((step) => (
            <article
              className="border-l-2 border-amber-300 bg-white px-3 py-3"
              key={step.code}
            >
              <p className="font-mono text-xs font-semibold text-amber-800">
                {step.code}
              </p>
              <h4 className="mt-2 font-semibold text-zinc-950">
                {step.title}
              </h4>
              <p className="mt-2 text-zinc-700">Thao tác: {step.action}</p>
              <p className="mt-2 text-amber-800">Điểm dừng: {step.stop}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
