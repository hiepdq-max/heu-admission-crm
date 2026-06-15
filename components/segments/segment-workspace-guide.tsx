import Link from "next/link";
import {
  Banknote,
  Building2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AdmissionSegmentCatalogRow } from "@/lib/admission-segments";

type SegmentWorkspaceGuideProps = {
  segment: AdmissionSegmentCatalogRow;
};

function getSegmentWorkItems(segmentCode: string) {
  if (segmentCode === "UNIVERSITY_TRANSFER_HOU") {
    return [
      {
        label: "HOU",
        description: "Theo dõi hệ HOU, ngành, địa điểm học, bước xử lý và COM.",
        icon: GraduationCap,
        href: "/hou",
      },
      {
        label: "Hồ sơ HOU",
        description: "Kiểm tra hồ sơ, học phí kỳ đầu và minh chứng trước khi chốt COM.",
        icon: ClipboardCheck,
        href: "/documents",
      },
      {
        label: "Kế toán COM",
        description: "Chỉ xử lý COM sau khi đủ điều kiện và có chứng từ đối soát.",
        icon: Banknote,
        href: "/hou",
      },
    ];
  }

  if (segmentCode === "TC9_TTGDTX_LINKED") {
    return [
      {
        label: "TTGDTX",
        description: "Lead trong khu này là danh sách học sinh do TTGDTX/đối tác cung cấp.",
        icon: Building2,
        href: "/partners",
      },
      {
        label: "Hồ sơ liên kết",
        description: "Theo dõi hợp đồng, thẩm quyền, mô hình học văn hóa và trung cấp.",
        icon: FileText,
        href: "/documents",
      },
      {
        label: "COM/đối soát",
        description: "COM theo chính sách liên kết, tránh trùng nguồn và chi sai kỳ.",
        icon: Banknote,
        href: "/partners",
      },
    ];
  }

  if (segmentCode.startsWith("SHORT_")) {
    return [
      {
        label: "Khóa ngắn hạn",
        description: "Quản lý học viên, khóa học, lịch học và chứng chỉ theo từng khóa.",
        icon: ClipboardCheck,
        href: "/documents",
      },
      {
        label: "Học phí",
        description: "Theo dõi thu học phí, nguồn hỗ trợ nếu có và chứng từ kế toán.",
        icon: Banknote,
        href: "/reports",
      },
      {
        label: "Rủi ro chính sách",
        description: "Kiểm tra điều kiện nếu khóa có liên quan trợ cấp hoặc chính sách hỗ trợ.",
        icon: ShieldAlert,
        href: "/audit",
      },
    ];
  }

  return [
    {
      label: "Tuyển sinh",
      description: "Quản lý lead, tư vấn, hồ sơ và bàn giao theo đúng đối tượng.",
      icon: Users,
      href: "/leads",
    },
    {
      label: "Hồ sơ",
      description: "Kiểm tra hồ sơ nhập học và điều kiện trước khi chuyển trạng thái.",
      icon: ClipboardCheck,
      href: "/documents",
    },
    {
      label: "Tài chính",
      description: "Theo dõi học phí, COM và công nợ theo chính sách đang hiệu lực.",
      icon: Banknote,
      href: "/reports",
    },
  ];
}

export function SegmentWorkspaceGuide({ segment }: SegmentWorkspaceGuideProps) {
  const workItems = getSegmentWorkItems(segment.segment_code);

  return (
    <section className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-zinc-500">
                {segment.program_group}
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                {segment.segment_name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {segment.admission_object}
              </p>
            </div>
            <span className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-600">
              {segment.segment_code}
            </span>
          </div>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md bg-zinc-50 p-3">
              <dt className="font-medium text-zinc-950">Mô hình triển khai</dt>
              <dd className="mt-1 leading-6 text-zinc-600">
                {segment.delivery_context}
              </dd>
            </div>
            <div className="rounded-md bg-zinc-50 p-3">
              <dt className="font-medium text-zinc-950">Phòng phụ trách</dt>
              <dd className="mt-1 leading-6 text-zinc-600">
                {segment.owner_department}
              </dd>
            </div>
            <div className="rounded-md bg-zinc-50 p-3">
              <dt className="font-medium text-zinc-950">Đối tác / nguồn</dt>
              <dd className="mt-1 leading-6 text-zinc-600">
                {segment.partner_model}
              </dd>
            </div>
            <div className="rounded-md bg-zinc-50 p-3">
              <dt className="font-medium text-zinc-950">COM / hợp đồng</dt>
              <dd className="mt-1 leading-6 text-zinc-600">
                {segment.commission_model}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-1 size-5 shrink-0" />
            <div>
              <h2 className="font-semibold">Nguyên tắc vận hành riêng</h2>
              <p className="mt-2 text-sm leading-6">{segment.finance_risk}</p>
              <p className="mt-3 text-sm leading-6">
                Lead tạo trong khu này phải gắn đúng đối tượng tuyển sinh. Nếu
                user còn được giới hạn theo đối tác/trung tâm, hệ thống chỉ cho
                xem phần nằm trong phạm vi được phân.
              </p>
            </div>
          </div>
        </article>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {workItems.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
                  <Icon className="size-5 text-zinc-600" />
                </div>
                <div>
                  <h3 className="font-medium">{item.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    {item.description}
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link href={item.href}>Mở phần này</Link>
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
