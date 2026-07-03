"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Building2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  ShieldAlert,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { AdmissionSegmentCatalogRow } from "@/lib/admission-segments";
import { withAdmissionSegmentParam } from "@/lib/workspace-url";

type SegmentWorkspaceGuideProps = {
  segment: AdmissionSegmentCatalogRow;
};

type SegmentWorkItem = {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
};

function scopedHref(href: string, segmentId: string) {
  return withAdmissionSegmentParam(href, segmentId);
}

function getSegmentWorkItems(
  segmentCode: string,
  segmentId: string,
): SegmentWorkItem[] {
  if (segmentCode === "UNIVERSITY_TRANSFER_HOU") {
    return [
      {
        label: "HOU",
        description: "Theo dõi hệ HOU, ngành, địa điểm học, bước xử lý và COM.",
        icon: GraduationCap,
        href: scopedHref("/hou", segmentId),
      },
      {
        label: "Hồ sơ HOU",
        description: "Kiểm tra hồ sơ, học phí kỳ đầu và minh chứng trước khi chốt COM.",
        icon: ClipboardCheck,
        href: scopedHref("/documents", segmentId),
      },
      {
        label: "Kế toán COM",
        description: "Chỉ xử lý COM sau khi đủ điều kiện và có chứng từ đối soát.",
        icon: Banknote,
        href: scopedHref("/hou", segmentId),
      },
    ];
  }

  if (segmentCode === "TC9_TTGDTX_LINKED") {
    return [
      {
        label: "TTGDTX",
        description: "Lead trong khu này là danh sách học sinh do TTGDTX/đối tác cung cấp.",
        icon: Building2,
        href: scopedHref("/ttgdtx", segmentId),
      },
      {
        label: "Hồ sơ liên kết",
        description: "Theo dõi hợp đồng, thẩm quyền, mô hình học văn hóa và trung cấp.",
        icon: FileText,
        href: scopedHref("/ttgdtx/master", segmentId),
      },
      {
        label: "COM/đối soát",
        description: "COM theo chính sách liên kết, tránh trùng nguồn và chi sai kỳ.",
        icon: Banknote,
        href: scopedHref("/ttgdtx/reconciliation", segmentId),
      },
    ];
  }

  if (segmentCode.startsWith("SHORT_")) {
    return [
      {
        label: "Khóa ngắn hạn",
        description: "Quản lý học viên, khóa học, lịch học và chứng chỉ theo từng khóa.",
        icon: ClipboardCheck,
        href: scopedHref("/short-course/intake", segmentId),
      },
      {
        label: "Học phí",
        description: "Theo dõi thu học phí, nguồn hỗ trợ nếu có và chứng từ kế toán.",
        icon: Banknote,
        href: scopedHref("/short-course/drilldown?type=payments", segmentId),
      },
      {
        label: "Rủi ro chính sách",
        description: "Kiểm tra điều kiện nếu khóa có liên quan trợ cấp hoặc chính sách hỗ trợ.",
        icon: ShieldAlert,
        href: scopedHref("/short-course/actions", segmentId),
      },
    ];
  }

  return [
      {
        label: "Tuyển sinh",
        description: "Quản lý lead, tư vấn, hồ sơ và bàn giao theo đúng đối tượng.",
        icon: Users,
        href: scopedHref("/leads", segmentId),
      },
      {
        label: "Hồ sơ",
        description: "Kiểm tra hồ sơ nhập học và điều kiện trước khi chuyển trạng thái.",
        icon: ClipboardCheck,
        href: scopedHref("/documents", segmentId),
      },
      {
        label: "Tài chính",
        description: "Theo dõi học phí, COM và công nợ theo chính sách đang hiệu lực.",
        icon: Banknote,
        href: scopedHref("/reports", segmentId),
      },
    ];
}

export function SegmentWorkspaceGuide({ segment }: SegmentWorkspaceGuideProps) {
  const workItems = getSegmentWorkItems(segment.segment_code, segment.id);
  const [activeLabel, setActiveLabel] = useState(workItems[0]?.label ?? "");
  const activeIndex = Math.max(
    0,
    workItems.findIndex((item) => item.label === activeLabel),
  );
  const activeItem = workItems[activeIndex] ?? workItems[0];
  const ActiveIcon = activeItem?.icon ?? Users;

  function moveToItem(nextIndex: number) {
    if (workItems.length === 0) return;

    const normalizedIndex = (nextIndex + workItems.length) % workItems.length;
    const nextItem = workItems[normalizedIndex];
    if (!nextItem) return;

    setActiveLabel(nextItem.label);
    requestAnimationFrame(() => {
      document
        .getElementById(`segment-work-item-tab-${normalizedIndex}`)
        ?.focus();
    });
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveToItem(index + 1);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveToItem(index - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveToItem(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveToItem(workItems.length - 1);
    }
  }

  return (
    <section className="space-y-4">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-zinc-500">
                {segment.program_group}
              </p>
              <h2 className="mt-1 break-words text-lg font-semibold">
                {segment.segment_name}
              </h2>
              <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
                {segment.admission_object}
              </p>
            </div>
            <span className="max-w-full rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-600">
              {segment.segment_code}
            </span>
          </div>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-md bg-zinc-50 px-3 py-2">
              <dt className="font-medium text-zinc-950">Mô hình triển khai</dt>
              <dd className="mt-1 break-words leading-5 text-zinc-600">
                {segment.delivery_context}
              </dd>
            </div>
            <div className="rounded-md bg-zinc-50 px-3 py-2">
              <dt className="font-medium text-zinc-950">Phòng phụ trách</dt>
              <dd className="mt-1 break-words leading-5 text-zinc-600">
                {segment.owner_department}
              </dd>
            </div>
            <div className="rounded-md bg-zinc-50 px-3 py-2">
              <dt className="font-medium text-zinc-950">Đối tác / nguồn</dt>
              <dd className="mt-1 break-words leading-5 text-zinc-600">
                {segment.partner_model}
              </dd>
            </div>
            <div className="rounded-md bg-zinc-50 px-3 py-2">
              <dt className="font-medium text-zinc-950">COM / hợp đồng</dt>
              <dd className="mt-1 break-words leading-5 text-zinc-600">
                {segment.commission_model}
              </dd>
            </div>
          </dl>
        </article>

        <article className="min-w-0 overflow-hidden rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-1 size-5 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-semibold">Nguyên tắc vận hành riêng</h2>
              <p className="mt-2 break-words text-sm leading-6">
                {segment.finance_risk}
              </p>
              <p className="mt-2 break-words text-sm leading-6">
                Lead tạo trong khu này phải gắn đúng đối tượng tuyển sinh. Nếu
                user bị giới hạn theo đối tác/trung tâm, hệ thống chỉ mở phần
                trong phạm vi được phân.
              </p>
            </div>
          </div>
        </article>
      </div>

      <div
        className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
        data-heu-segment-workspace-guide="P0-05_WORKSPACE_GUIDE"
        data-heu-segment-workspace-guide-focus="P0-05_WORKSPACE_GUIDE_FOCUS"
        data-heu-segment-workspace-guide-overflow-guard="P0-05_WORKSPACE_GUIDE_NO_OVERFLOW"
        data-heu-segment-workspace-scoped-links="P0-05_SEGMENT_SCOPED_WORK_LINKS"
      >
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <h2 className="text-sm font-semibold text-zinc-950">
            Truy cập theo nghiệp vụ
          </h2>
          <span className="text-xs text-zinc-500">Mở nhanh phần liên quan</span>
        </div>
        {activeItem ? (
          <div className="grid min-w-0 gap-3 lg:grid-cols-[16rem_1fr]">
            <div
              className="grid min-w-0 gap-2"
              role="tablist"
              aria-label="Segment workspace business entries"
              data-heu-segment-workspace-guide-tabs="P0-05_WORKSPACE_GUIDE_TABS"
            >
              {workItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = item.label === activeItem.label;
                const tabId = `segment-work-item-tab-${index}`;
                const panelId = "segment-work-item-panel";

                return (
                  <button
                    key={item.label}
                    id={tabId}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={panelId}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveLabel(item.label)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    className={`flex min-h-12 min-w-0 items-center gap-2 overflow-hidden rounded-md border px-3 text-left transition ${
                      isActive
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400 hover:bg-white"
                    }`}
                    title={item.label}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 truncate text-sm font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              id="segment-work-item-panel"
              className="min-w-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 p-4"
              role="tabpanel"
              aria-labelledby={`segment-work-item-tab-${activeIndex}`}
              data-heu-segment-workspace-guide-panel="P0-05_WORKSPACE_GUIDE_PANEL"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-zinc-700 ring-1 ring-zinc-200">
                  <ActiveIcon className="size-5 shrink-0" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-zinc-950">
                    {activeItem.label}
                  </h3>
                  <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
                    {activeItem.description}
                  </p>
                </div>
              </div>
              <Link
                href={activeItem.href}
                aria-label={`Mo phan nghiep vu: ${activeItem.label}`}
                title={`Mo phan nghiep vu: ${activeItem.label}`}
                className="mt-4 inline-flex max-w-full min-w-0 items-center gap-2 overflow-hidden rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
              >
                <span className="truncate">Mo phan nay</span>
                <ArrowRight className="size-3 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
