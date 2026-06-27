"use client";

import { useMemo, useState } from "react";
import {
  FileCheck2,
  ListChecks,
  ShieldAlert,
} from "lucide-react";

type ChecklistTemplate = {
  id: string;
  title: string;
  owner: string;
  boundary: string;
  steps: string[];
};

const templates: ChecklistTemplate[] = [
  {
    id: "ttgdtx-uat",
    title: "TTGDTX UAT evidence run",
    owner: "KHTC + IT_DATA + Audit",
    boundary:
      "Use synthetic or redacted evidence only; signed UAT remains outside Codex/chat.",
    steps: [
      "Pick one blocker from P0-03, P0-19, P2-17, P2-18, P6-03, P6-04 or P6-06.",
      "Collect the matching runbook, checklist and controlled evidence location.",
      "Run the local audit command named in the production checklist.",
      "Attach redacted screenshots or non-secret evidence references outside Git.",
      "Record PASS/FAIL, owner, exception and next small action.",
      "Commit only the safe code/docs change after audit, lint and build pass.",
    ],
  },
  {
    id: "go-no-go",
    title: "Owner GO/NO-GO review",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + Audit",
    boundary:
      "AI can prepare the review checklist, but cannot mark GO or replace signatures.",
    steps: [
      "Open the production blocker summary and owner sign-off pack.",
      "Check backup/restore, migration order, legal/finance, payout and dashboard evidence.",
      "Check role-scope, audit-log, hard-delete/cascade and redaction evidence.",
      "List every unresolved HIGH/BLOCKER exception by owner.",
      "Keep recommendation NO-GO if any owner decision or evidence reference is missing.",
      "Record the human owner decision outside Codex/chat.",
    ],
  },
  {
    id: "small-build",
    title: "Small build slice",
    owner: "IT_DATA + process owner",
    boundary:
      "No production migration, no raw credentials, no hidden approval, no broad refactor.",
    steps: [
      "Choose one page, component, audit, policy or runbook gap.",
      "Implement the smallest useful change that improves operation or evidence quality.",
      "Add or extend a local audit to lock the safety rule.",
      "Run targeted audits first, then lint, build and diff check.",
      "Commit with one clear message only after every check passes.",
      "Select the next slice from remaining NO-GO blockers.",
    ],
  },
];

export function AiTaskChecklistGenerator() {
  const [selectedId, setSelectedId] = useState(templates[0].id);
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? templates[0],
    [selectedId],
  );

  return (
    <section
      data-heu-ai-task-checklist-generator="P7-02"
      className="rounded-lg border border-cyan-200 bg-cyan-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-4xl items-start gap-3">
          <ListChecks className="mt-0.5 size-5 shrink-0 text-cyan-700" />
          <div>
            <h2 className="font-semibold text-cyan-950">
              P7-02 AI task checklist generator: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-cyan-900">
              This helper turns the HEU build method into a safe checklist:
              choose a small slice, run checks, commit only after pass, then
              continue. It does not call AI, save prompts, write data, approve
              finance, accept UAT, run migration or mark production GO.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-cyan-200 bg-white px-3 py-2 text-cyan-950">
          Data rule:
          <span className="mt-1 block text-xs">
            Do not paste secrets, passwords, OTPs, service-role keys, bank
            credentials, raw student PII, raw CCCD, raw phone numbers, raw bank
            account numbers, bank statements, vouchers or raw payment data.
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist">
        {templates.map((template) => {
          const active = template.id === selectedId;

          return (
            <button
              key={template.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                active
                  ? "border-cyan-700 bg-cyan-700 text-white"
                  : "border-cyan-200 bg-white text-cyan-900 hover:border-cyan-400"
              }`}
              onClick={() => setSelectedId(template.id)}
            >
              {template.title}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-md border border-cyan-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-cyan-700">
              {selectedTemplate.id}
            </p>
            <h3 className="mt-1 font-semibold text-zinc-950">
              {selectedTemplate.title}
            </h3>
            <p className="mt-2 text-xs font-medium text-zinc-500">
              Owner: {selectedTemplate.owner}
            </p>
          </div>
          <div className="max-w-lg rounded-md border border-cyan-100 bg-cyan-50 px-3 py-2 text-cyan-950">
            {selectedTemplate.boundary}
          </div>
        </div>

        <ol className="mt-4 grid gap-3 lg:grid-cols-2">
          {selectedTemplate.steps.map((step, index) => (
            <li key={step} className="flex items-start gap-2">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-cyan-700" />
              <span>
                <span className="font-semibold">
                  {String(index + 1).padStart(2, "0")}.
                </span>{" "}
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          This is a local read-only checklist helper. PASS_LOCAL does not enable
          autonomous AI, prompt/output logging, production AI, production
          migration, finance action, UAT acceptance, owner waiver or production
          GO.
        </p>
      </div>
    </section>
  );
}
