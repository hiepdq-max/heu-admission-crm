import { ClipboardCheck, FileCheck2, ShieldAlert } from "lucide-react";

type EvidenceItem = {
  caseId: string;
  title: string;
  owner: string;
  evidence: string;
};

type AcceptanceItem = {
  caseId: string;
  requirement: string;
  minimumEvidence: string;
  stopCondition: string;
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

const acceptanceItems: AcceptanceItem[] = [
  {
    caseId: "P0-19-ACCEPT-01",
    requirement: "Legal authority is current and scoped",
    minimumEvidence:
      "Contract/legal reference identifies center, program/major, effective period, training scope and approving owner.",
    stopCondition:
      "Stop if legal scope, effective period, center or major is unclear, expired or only assumed from a pilot note.",
  },
  {
    caseId: "P0-19-ACCEPT-02",
    requirement: "Tuition policy matches legal authority",
    minimumEvidence:
      "P2-02 tuition policy version, amount, term, due rule and payer model match the accepted legal basis.",
    stopCondition:
      "Stop if tuition amount, term, due date rule, invoice/chung-tu responsibility or waiver basis is unresolved.",
  },
  {
    caseId: "P0-19-ACCEPT-03",
    requirement: "Finance gate result is explicit",
    minimumEvidence:
      "P0-19 gate status shows ALLOW_FINANCE only after legal and tuition checks pass, with actor/time trace.",
    stopCondition:
      "Stop if P2-03 can create receivable while gate is missing, blocked, waived or not signed.",
  },
  {
    caseId: "P0-19-ACCEPT-04",
    requirement: "Step100 remains sandbox/UAT only",
    minimumEvidence:
      "Evidence proves Step100 uses explicit session flag and is not used as production legal, tuition or finance authority.",
    stopCondition:
      "Stop if Step100 output is treated as production approval, legal acceptance, tuition approval or revenue authority.",
  },
  {
    caseId: "P0-19-ACCEPT-05",
    requirement: "Receivable path is blocked then allowed",
    minimumEvidence:
      "One negative case blocks P2-05/P2-03 before P0-19 readiness and one positive case allows after all prerequisites pass.",
    stopCondition:
      "Stop if only a positive screenshot exists or no blocked-path proof is attached.",
  },
  {
    caseId: "P0-19-ACCEPT-06",
    requirement: "Owners sign redacted evidence",
    minimumEvidence:
      "PHAP_CHE, KHTC, BGH and Audit sign redacted evidence references outside Codex/chat.",
    stopCondition:
      "PASS_LOCAL is treated as legal, finance, UAT, revenue or production approval.",
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

      <div
        className="mt-5 rounded-lg border border-emerald-200 bg-white p-4"
        data-ttgdtx-p019-acceptance-matrix="P0-19"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 font-semibold text-emerald-950">
              <ClipboardCheck className="size-4 shrink-0 text-emerald-700" />
              <span>
                P0-19 legal/finance acceptance matrix: PASS_LOCAL only
              </span>
            </div>
            <p className="mt-2 leading-6 text-emerald-900">
              P0-19 can only support P2-03 receivable creation after legal
              authority, tuition policy, finance gate status, Step100 sandbox
              boundary, blocked/allowed receivable path and owner sign-off are
              all proven with redacted evidence.
            </p>
          </div>
          <div className="min-w-72 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-950">
            Decision:
            <span className="mt-1 block font-mono text-xs">
              P0_19_ACCEPT / FAIL / BLOCKED
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {acceptanceItems.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-emerald-300 bg-emerald-50/70 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-emerald-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">
                {item.requirement}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Minimum evidence: {item.minimumEvidence}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop condition: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          Do not attach private contract bodies, raw student PII, CCCD, bank
          data, credentials, passwords, OTPs, service-role keys, raw vouchers or
          raw payment data. Missing owner signature keeps production NO-GO.
        </div>
      </div>
    </section>
  );
}
