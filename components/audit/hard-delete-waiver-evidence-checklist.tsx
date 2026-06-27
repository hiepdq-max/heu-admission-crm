import { ClipboardCheck, FileCheck2, ShieldAlert } from "lucide-react";

type EvidenceItem = {
  caseId: string;
  title: string;
  owner: string;
  evidence: string;
};

type HardDeleteAcceptanceItem = {
  caseId: string;
  requirement: string;
  minimumEvidence: string;
  stopCondition: string;
};

const evidenceItems: EvidenceItem[] = [
  {
    caseId: "HD-01",
    title: "Current cascade scan accepted",
    owner: "IT_DATA + Audit",
    evidence:
      "Evidence that the current 44 non-TTGDTX/base cascade findings are mapped to table, parent and risk bucket.",
  },
  {
    caseId: "HD-02",
    title: "Protected records converted",
    owner: "IT_DATA + business owner",
    evidence:
      "Migration or design evidence replacing protected cascades with restrict, archive or status-transition control.",
  },
  {
    caseId: "HD-03",
    title: "Derived-helper waiver signed",
    owner: "IT_DATA + Audit + business owner",
    evidence:
      "Written waiver naming owner, reason, affected table, rollback approach and proof no protected record is removed.",
  },
  {
    caseId: "HD-04",
    title: "No hard-delete in finance/evidence/audit flows",
    owner: "KHTC + PHAP_CHE + Audit",
    evidence:
      "Static audit and reviewer evidence that finance, evidence, approval, payment, lead and audit rows cannot be hard-deleted.",
  },
  {
    caseId: "HD-05",
    title: "Rollback proof does not use deletion",
    owner: "IT_DATA + Audit",
    evidence:
      "Restore/rollback evidence proving table drop, truncate, hard-delete and cascade execution are not used as rollback proof.",
  },
  {
    caseId: "HD-06",
    title: "Owner decision before production GO",
    owner: "BGH + IT_DATA + Audit",
    evidence:
      "Signed GO/NO-GO note confirming all conversion or waiver evidence was accepted outside Codex/chat.",
  },
];

const hardDeleteAcceptanceItems: HardDeleteAcceptanceItem[] = [
  {
    caseId: "P6-06-ACCEPT-01",
    requirement: "Current cascade scan locked and mapped",
    minimumEvidence:
      "The 44 non-TTGDTX/base cascade findings are mapped to table, parent relation, risk bucket and owner lane.",
    stopCondition:
      "Stop if the scan count changes, an owner lane is missing, or any finding is not classified before review.",
  },
  {
    caseId: "P6-06-ACCEPT-02",
    requirement: "Protected records converted before production",
    minimumEvidence:
      "Finance, evidence, approval, payment, legal, audit, lead and operating-history rows are converted to restrict/archive/status patterns.",
    stopCondition:
      "Stop if a protected record can still disappear through parent delete, cascade execution, cleanup or migration.",
  },
  {
    caseId: "P6-06-ACCEPT-03",
    requirement: "Derived-helper waiver is narrow and written",
    minimumEvidence:
      "Any waiver names affected table, derived-only proof, owner reason, rollback note and written approval.",
    stopCondition:
      "Stop if waiver is oral, broad, hidden, ownerless or covers finance/evidence/audit/legal/student-operating history.",
  },
  {
    caseId: "P6-06-ACCEPT-04",
    requirement: "Rollback and cleanup do not rely on deletion",
    minimumEvidence:
      "Rollback proof uses backup/restore or reversible state, not truncate, drop table, hard-delete or cascade execution.",
    stopCondition:
      "Stop if deletion is presented as rollback proof or cleanup hides evidence required for audit/legal review.",
  },
  {
    caseId: "P6-06-ACCEPT-05",
    requirement: "Evidence redaction and owner sign-off",
    minimumEvidence:
      "BGH, IT_DATA, Audit and affected owners sign redacted conversion/waiver evidence outside Codex/chat.",
    stopCondition:
      "Stop if raw student PII, CCCD, bank data, payment data, passwords, OTPs, service-role keys or production credentials appear.",
  },
  {
    caseId: "P6-06-ACCEPT-06",
    requirement: "Production boundary",
    minimumEvidence:
      "P6-06 remains IN_PROGRESS until all required conversions or written waivers are signed and owner GO/NO-GO exists.",
    stopCondition:
      "Stop if PASS_LOCAL is treated as production deletion approval, cascade execution approval, waiver approval, conversion migration approval, rollback success or production GO.",
  },
];

export function HardDeleteWaiverEvidenceChecklist() {
  return (
    <section
      data-hard-delete-waiver-evidence-checklist="P6-06"
      className="rounded-lg border border-orange-200 bg-orange-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-orange-700" />
          <div>
            <h2 className="font-semibold text-orange-950">
              P6-06 hard-delete/cascade evidence checklist: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-orange-900">
              Conversion or written waiver evidence is still required before
              P6-06 can move from IN_PROGRESS. Collect only redacted evidence
              references; raw student PII, CCCD, bank data, payment data,
              passwords, OTPs, service-role keys and production credentials stay
              outside Git/Codex/chat.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-orange-200 bg-white px-3 py-2 text-orange-950">
          Required review:
          <span className="mt-1 block font-mono text-xs">
            HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {evidenceItems.map((item) => (
          <article
            key={item.caseId}
            className="border-l-2 border-orange-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-orange-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-orange-700">
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

      <div
        data-hard-delete-cascade-acceptance-matrix="P6-06"
        className="mt-5 border-t border-orange-200 pt-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-orange-950">
              P6-06 hard-delete/cascade acceptance matrix: PASS_LOCAL only
            </h3>
            <p className="mt-1 leading-6 text-orange-900">
              Decision value:{" "}
              <span className="font-mono text-xs">
                P6_06_ACCEPT / FAIL / BLOCKED
              </span>
              . Use this matrix to decide whether conversion/waiver evidence
              is ready for owner review, not to approve deletion or production.
            </p>
          </div>
          <div className="min-w-64 rounded-md border border-orange-200 bg-white px-3 py-2 text-orange-950">
            Derived-helper waiver is allowed only when no protected finance,
            legal, audit, evidence or student-operating history is removed.
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {hardDeleteAcceptanceItems.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-orange-300 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-orange-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">
                {item.requirement}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                {item.minimumEvidence}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                {item.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          PASS_LOCAL does not approve production deletion, cascade execution,
          waiver, data cleanup, migration, rollback success or production GO.
          BGH, IT_DATA, Audit and affected business owners must sign the
          evidence outside Codex/chat.
        </p>
      </div>
    </section>
  );
}
