"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FileSpreadsheet,
  Plus,
  Route,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { AdmissionSegmentOperationStepRow } from "@/lib/admission-segments";
import { withAdmissionSegmentParam } from "@/lib/workspace-url";

type SegmentStepFocusPanelProps = {
  steps: AdmissionSegmentOperationStepRow[];
  segmentId: string | null;
};

type StepGroup = {
  key: string;
  label: string;
  steps: AdmissionSegmentOperationStepRow[];
};

function stepIcon(stepCode: string): LucideIcon {
  if (stepCode === "LEAD_CREATE") return Plus;
  if (stepCode === "LEAD_IMPORT") return Upload;
  if (stepCode === "DOCUMENT_CHECKLIST") return ClipboardCheck;
  if (stepCode === "FINANCE_COM") return FileSpreadsheet;
  if (stepCode === "PARTNER_CONTRACT") return Users;
  return Route;
}

function scopedActionHref(href: string, segmentId: string | null) {
  if (
    !segmentId ||
    href.startsWith("#") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    !href.startsWith("/")
  ) {
    return href;
  }

  return withAdmissionSegmentParam(href, segmentId);
}

function buildGroups(steps: AdmissionSegmentOperationStepRow[]): StepGroup[] {
  const groups = new Map<string, AdmissionSegmentOperationStepRow[]>();

  for (const step of steps) {
    const label = step.step_group || "Khác";
    groups.set(label, [...(groups.get(label) ?? []), step]);
  }

  return Array.from(groups.entries()).map(([label, groupSteps], index) => ({
    key: `group-${index}`,
    label,
    steps: groupSteps,
  }));
}

export function SegmentStepFocusPanel({
  steps,
  segmentId,
}: SegmentStepFocusPanelProps) {
  const groups = useMemo(() => buildGroups(steps), [steps]);
  const [activeKey, setActiveKey] = useState(groups[0]?.key ?? "");
  const activeIndex = Math.max(
    0,
    groups.findIndex((group) => group.key === activeKey),
  );
  const activeGroup = groups[activeIndex] ?? groups[0];

  function moveToGroup(nextIndex: number) {
    if (groups.length === 0) return;

    const normalizedIndex = (nextIndex + groups.length) % groups.length;
    const nextGroup = groups[normalizedIndex];
    if (!nextGroup) return;

    setActiveKey(nextGroup.key);
    requestAnimationFrame(() => {
      document
        .getElementById(`segment-step-group-tab-${nextGroup.key}`)
        ?.focus();
    });
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveToGroup(index + 1);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveToGroup(index - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveToGroup(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveToGroup(groups.length - 1);
    }
  }

  if (!activeGroup) {
    return (
      <div
        className="p-5 text-sm text-zinc-500"
        data-heu-segment-step-focus-panel="P0-05_SEGMENT_STEP_FOCUS_PANEL"
      >
        Các thao tác chính đã nằm ở khu Truy cập nhanh.
      </div>
    );
  }

  return (
    <div
      className="min-w-0"
      data-heu-segment-step-focus-panel="P0-05_SEGMENT_STEP_FOCUS_PANEL"
      data-heu-segment-step-group-tabs="P0-05_SEGMENT_STEP_GROUP_TABS"
      data-heu-segment-step-group-panel="P0-05_SEGMENT_STEP_GROUP_PANEL"
      data-heu-segment-step-overflow-guard="P0-05_SEGMENT_STEP_NO_OVERFLOW"
    >
      <div className="border-b border-zinc-200 p-3">
        <div
          className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3"
          role="tablist"
          aria-label="Segment operation step groups"
        >
          {groups.map((group, index) => {
            const isActive = group.key === activeGroup.key;
            const tabId = `segment-step-group-tab-${group.key}`;
            const panelId = `segment-step-group-panel-${group.key}`;

            return (
              <button
                key={group.key}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveKey(group.key)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`flex min-h-14 min-w-0 items-center justify-between gap-3 overflow-hidden rounded-md border px-3 text-left transition ${
                  isActive
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400 hover:bg-white"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {group.label}
                  </span>
                  <span
                    className={`mt-1 block truncate text-xs ${
                      isActive ? "text-zinc-200" : "text-zinc-500"
                    }`}
                  >
                    {group.steps.length} bước
                  </span>
                </span>
                <ArrowRight
                  className={`size-4 shrink-0 ${
                    isActive ? "text-zinc-200" : "text-zinc-400"
                  }`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`segment-step-group-panel-${activeGroup.key}`}
        className="grid min-w-0 gap-3 p-5 md:grid-cols-2 xl:grid-cols-3"
        role="tabpanel"
        aria-labelledby={`segment-step-group-tab-${activeGroup.key}`}
      >
        {activeGroup.steps.map((step) => {
          const Icon = stepIcon(step.step_code);

          return (
            <article
              key={step.id}
              className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white text-zinc-700 ring-1 ring-zinc-200">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-950">
                      {step.step_name}
                    </p>
                    <p className="mt-1 break-words text-xs uppercase text-zinc-500">
                      {step.step_group} - {step.owner_department}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
                    step.required_for_operation
                      ? "bg-rose-50 text-rose-700"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {step.required_for_operation ? "Bắt buộc" : "Tùy chọn"}
                </span>
              </div>
              <p className="mt-3 break-words text-sm leading-6 text-zinc-600">
                {step.control_note ?? "Chưa có ghi chú kiểm soát."}
              </p>
              <Link
                href={scopedActionHref(step.action_href, segmentId)}
                aria-label={`Mo phan ${step.step_name}`}
                title={`Mo phan ${step.step_name}`}
                className="mt-4 inline-flex max-w-full min-w-0 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
              >
                <span className="truncate">Mở phần này</span>
                <ArrowRight className="size-3 shrink-0" aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
