import { Eye, LockKeyhole, ShieldCheck } from "lucide-react";

type DashboardGuardItem = {
  title: string;
  proof: string;
  uatCase: string;
};

const dashboardGuardItems: DashboardGuardItem[] = [
  {
    title: "Chỉ đọc, không ghi tiền",
    proof: "P2-18 không có form tạo công nợ, thu tiền, đối soát, duyệt chi hoặc chi tiền.",
    uatCase: "P2-18-08",
  },
  {
    title: "Đúng nguồn dữ liệu gốc",
    proof: "KPI phải đối chiếu P2-03, P2-10, P2-13/P2-14, P2-15/P2-16 và P2-17.",
    uatCase: "P2-18-02, P2-18-03, P2-18-07",
  },
  {
    title: "Role-scope trước khi query",
    proof: "Dashboard chỉ query sau khi có quyền dashboard/report và scope TTGDTX.",
    uatCase: "P2-18-01, P2-18-04",
  },
  {
    title: "Pháp chế/contract-only không thấy tổng tài chính",
    proof: "Quyền đọc hợp đồng không được dùng làm quyền xem dashboard kế toán.",
    uatCase: "P2-18-05",
  },
  {
    title: "Exception chỉ dẫn về bước gốc",
    proof: "Dòng cảnh báo dẫn về workflow nguồn, không sửa trực tiếp trên dashboard.",
    uatCase: "P2-18-06",
  },
];

export function TtgdtxDashboardReadonlyGuard() {
  return (
    <section
      data-ttgdtx-dashboard-readonly-guard="P2-18"
      className="rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Eye className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <div>
            <h2 className="font-semibold text-zinc-950">
              Guard dashboard kế toán P2-18
            </h2>
            <p className="mt-1 leading-6 text-zinc-600">
              P2-18 là màn đọc và điều hành. Dashboard chỉ hiển thị số liệu đã
              khóa/được duyệt từ các bước nguồn, không tạo nghiệp vụ tài chính
              mới và không thay thế ký UAT.
            </p>
          </div>
        </div>
        <div className="flex min-w-64 items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          <LockKeyhole className="mt-0.5 size-4 shrink-0" />
          <p>
            PASS_LOCAL cho guard giao diện. P2-18 vẫn IN_PROGRESS cho tới khi có
            signed browser UAT theo vai trò và dữ liệu test.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {dashboardGuardItems.map((item) => (
          <div
            key={item.title}
            className="border-l-2 border-emerald-200 bg-emerald-50/60 px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" />
              <div>
                <p className="font-medium text-zinc-950">{item.title}</p>
                <p className="mt-2 leading-5 text-zinc-700">{item.proof}</p>
                <p className="mt-1 text-xs font-medium uppercase text-emerald-700">
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
