import { ClipboardCheck, FileCheck2, ShieldAlert } from "lucide-react";

type EvidenceItem = {
  caseId: string;
  title: string;
  owner: string;
  evidence: string;
};

const evidenceItems: EvidenceItem[] = [
  {
    caseId: "P0-19-01",
    title: "Legal basis accepted",
    owner: "PHAP_CHE + BGH",
    evidence:
      "Redacted reference proving contract scope, linked-training basis, center, major and effective period are accepted.",
  },
  {
    caseId: "P0-19-02",
    title: "Tuition policy ready",
    owner: "KHTC + PHAP_CHE",
    evidence:
      "Redacted P2-02 evidence showing the tuition amount, term, due rule and policy version match the legal basis.",
  },
  {
    caseId: "P0-19-03/P0-19-04",
    title: "Finance gate blocks until ALLOW_FINANCE",
    owner: "KHTC + IT_DATA",
    evidence:
      "Before/after screenshots or exports proving P2-05/P2-03 block when P0-19 is missing or not allowed.",
  },
  {
    caseId: "P0-19-05",
    title: "Step100 sandbox boundary",
    owner: "IT_DATA + Audit",
    evidence:
      "Proof that Step100 is sandbox/UAT only, requires the explicit session flag, and is not used as production authority.",
  },
  {
    caseId: "P0-19-06",
    title: "Receivable creation trace",
    owner: "KHTC + Audit",
    evidence:
      "Evidence that a receivable can be created only after legal, tuition and finance gate checks pass.",
  },
  {
    caseId: "P0-19-07",
    title: "Owner sign-off and no-secret evidence",
    owner: "PHAP_CHE + KHTC + BGH + Audit",
    evidence:
      "Signed UAT reference using controlled redaction; raw contracts, student PII, CCCD, bank data and credentials stay outside Git/Codex/chat.",
  },
];

export function TtgdtxP019UatEvidenceChecklist() {
  return (
    <section
      data-ttgdtx-p019-uat-evidence-checklist="P0-19"
      className="rounded-lg border border-teal-200 bg-teal-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-teal-700" />
          <div>
            <h2 className="font-semibold text-teal-950">
              P0-19 legal/finance UAT evidence checklist: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-teal-900">
              Signed legal/finance UAT is still required before P0-19 can move
              from IN_PROGRESS. Collect only redacted evidence references;
              private contract bodies, raw student PII, CCCD, bank data,
              passwords, OTPs, service-role keys and production credentials stay
              outside Git/Codex/chat.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-teal-200 bg-white px-3 py-2 text-teal-950">
          Required runbook:
          <span className="mt-1 block font-mono text-xs">
            P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {evidenceItems.map((item) => (
          <article
            key={item.caseId}
            className="border-l-2 border-teal-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-teal-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-teal-700">
                  {item.caseId}
                </p>
                <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Owner: {item.owner}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {item.evidence}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          PASS_LOCAL does not mean legal evidence was accepted, receivable
          creation is approved, Step100 is production-ready, revenue recognition
          is approved, or production GO is approved. PHAP_CHE, KHTC, BGH and
          Audit must sign the evidence outside Codex/chat.
        </p>
      </div>
    </section>
  );
}
