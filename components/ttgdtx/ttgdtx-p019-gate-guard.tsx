import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  FileCheck2,
  LockKeyhole,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

type P019GuardItem = {
  title: string;
  detail: string;
  href: string;
  icon: "legal" | "tuition" | "finance";
};

const guardItems: P019GuardItem[] = [
  {
    title: "Căn cứ pháp lý",
    detail:
      "Có hợp đồng, phạm vi liên kết, ngành/nghề và căn cứ pháp lý được Pháp chế/BGH chấp nhận.",
    href: "/ttgdtx",
    icon: "legal",
  },
  {
    title: "Chính sách học phí",
    detail:
      "Có P2-02 READY đúng TTGDTX, đúng ngành, đúng năm học/kỳ, đúng số tiền và hạn thu.",
    href: "/ttgdtx/tuition",
    icon: "tuition",
  },
  {
    title: "Cửa kiểm soát tài chính",
    detail:
      "Chỉ khi P0-19 là ALLOW_FINANCE thì P2-03 mới được tạo công nợ phải thu.",
    href: "/ttgdtx/gate",
    icon: "finance",
  },
];

function GuardIcon({ icon }: { icon: P019GuardItem["icon"] }) {
  if (icon === "legal") {
    return <Scale className="mt-0.5 size-4 shrink-0 text-emerald-700" />;
  }

  if (icon === "tuition") {
    return <WalletCards className="mt-0.5 size-4 shrink-0 text-emerald-700" />;
  }

  return <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" />;
}

export function TtgdtxP019GateGuard() {
  return (
    <section
      data-ttgdtx-p019-gate-guard="P0-19"
      className="rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-4xl items-start gap-3">
          <FileCheck2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <div>
            <h2 className="font-semibold text-zinc-950">
              P0-19 legal/tuition finance gate
            </h2>
            <p className="mt-2 leading-6 text-zinc-600">
              P0-19 trả lời một câu hỏi vận hành: ngành này đã đủ căn cứ pháp
              lý, đã có chính sách học phí đúng, và đã được phép kế toán tạo
              công nợ hay chưa. Nếu P0-19 chưa sẵn sàng, P2-05/P2-03 phải chặn
              trước khi ghi công nợ.
            </p>
          </div>
        </div>

        <div className="flex min-w-64 items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          <LockKeyhole className="mt-0.5 size-4 shrink-0" />
          <p>
            Step100 chỉ là sandbox/UAT pilot open. Không dùng Step100 làm bằng
            chứng production, không để AI phê duyệt gate và không tạo công nợ
            khi thiếu chữ ký owner.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {guardItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="border-l-2 border-emerald-200 bg-emerald-50/60 px-3 py-3 transition hover:bg-emerald-50"
          >
            <div className="flex items-start gap-2">
              <GuardIcon icon={item.icon} />
              <div>
                <p className="font-medium text-zinc-950">{item.title}</p>
                <p className="mt-2 leading-5 text-zinc-700">{item.detail}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium uppercase text-emerald-700">
                  Open control
                  <ArrowRight className="size-3" />
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          Stop nếu thấy P0_19_MAJOR_GATE_MISSING,
          P0_19_MAJOR_FINANCE_GATE_NOT_READY, thiếu P2-01, thiếu P2-02, thiếu
          signed UAT, hoặc chỉ có pilot waiver. Sửa đúng chỗ thiếu, không nhập
          lại dữ liệu đã đúng.
        </p>
      </div>
    </section>
  );
}
