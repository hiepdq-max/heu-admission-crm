"use client";

import { Children, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  Database,
  FileCheck2,
  Files,
  GitBranch,
  ListChecks,
  Network,
  Route,
  ShieldAlert,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

type SectionIcon =
  | "shield"
  | "route"
  | "module"
  | "approval"
  | "workflow"
  | "evidence"
  | "data"
  | "permission"
  | "owner"
  | "registry";

export type MasterControlFocusSection = {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: SectionIcon;
};

type MasterControlFocusLayoutProps = {
  sections: MasterControlFocusSection[];
  children: ReactNode;
};

const iconMap: Record<SectionIcon, LucideIcon> = {
  shield: ShieldAlert,
  route: Route,
  module: Network,
  approval: ListChecks,
  workflow: GitBranch,
  evidence: Files,
  data: Database,
  permission: ShieldCheck,
  owner: Users,
  registry: FileCheck2,
};

export function MasterControlFocusLayout({
  sections,
  children,
}: MasterControlFocusLayoutProps) {
  const sectionChildren = Children.toArray(children);
  const sectionCount = sections.length;
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeId),
  );
  const activeSection = sections[activeIndex] ?? sections[0];
  const ActiveIcon = iconMap[activeSection?.icon ?? "shield"];
  const activeChild = sectionChildren[activeIndex] ?? sectionChildren[0];

  function moveToSection(nextIndex: number) {
    if (sectionCount === 0) return;

    const normalizedIndex = (nextIndex + sectionCount) % sectionCount;
    const nextSection = sections[normalizedIndex];
    if (!nextSection) return;

    setActiveId(nextSection.id);
    requestAnimationFrame(() => {
      document.getElementById(`master-control-tab-${nextSection.id}`)?.focus();
    });
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveToSection(index + 1);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveToSection(index - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveToSection(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveToSection(sectionCount - 1);
    }
  }

  if (!activeSection) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-w-0 space-y-5"
      data-heu-master-control-focus-layout="P5-02_FOCUS_LAYOUT"
    >
      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
              <ActiveIcon className="size-4" />
              <span>
                {activeIndex + 1}/{sections.length}
              </span>
            </div>
            <h2 className="mt-2 break-words text-xl font-semibold tracking-normal text-zinc-950">
              {activeSection.title}
            </h2>
            <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-zinc-600">
              {activeSection.description}
            </p>
          </div>

          <div
            className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-5 xl:max-w-3xl"
            role="tablist"
            aria-label="Master Control sections"
          >
            {sections.map((section, index) => {
              const Icon = iconMap[section.icon];
              const isActive = section.id === activeSection.id;
              const tabId = `master-control-tab-${section.id}`;
              const panelId = `master-control-panel-${section.id}`;

              return (
                <button
                  key={section.id}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveId(section.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`flex min-h-11 min-w-0 items-center justify-start gap-2 overflow-hidden rounded-md border px-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="min-w-0 truncate">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div
        id={`master-control-panel-${activeSection.id}`}
        className="min-w-0"
        role="tabpanel"
        aria-labelledby={`master-control-tab-${activeSection.id}`}
      >
        {activeChild}
      </div>
    </div>
  );
}
