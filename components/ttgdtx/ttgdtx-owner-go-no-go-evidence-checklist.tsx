import { ClipboardCheck, FileCheck2, ShieldAlert } from "lucide-react";

type EvidenceItem = {
  caseId: string;
  title: string;
  owner: string;
  evidence: string;
};

const evidenceItems: EvidenceItem[] = [
  {
    caseId: "P0-09-01",
    title: "Backup and restore proof accepted",
    owner: "IT_DATA + Audit",
    evidence:
      "Controlled reference to backup ID, restore target, preflight/postflight output and smoke-check result.",
  },
  {
    caseId: "P0-09-02",
    title: "Migration order signed",
    owner: "IT_DATA + KHTC + PHAP_CHE",
    evidence:
      "Signed Step90-Step110 order with P0-03 restore proof attached before any production migration.",
  },
  {
    caseId: "P0-09-03",
    title: "Legal and finance gate accepted",
    owner: "PHAP_CHE + KHTC + BGH",
    evidence:
      "P0-19 legal basis, tuition policy and finance gate UAT evidence accepted outside Codex/chat.",
  },
  {
    caseId: "P0-09-04",
    title: "Payout and dashboard UAT accepted",
    owner: "KHTC + BGH + Audit + IT_DATA",
    evidence:
      "P2-17 duplicate-payout UAT and P2-18 read-only dashboard reconciliation signed by required owners.",
  },
  {
    caseId: "P0-09-05",
    title: "Role, audit and hard-delete evidence accepted",
    owner: "IT_DATA + Audit + process owners",
    evidence:
      "Role/workspace, audit-log and hard-delete/cascade evidence or written waiver accepted by the responsible owners.",
  },
  {
    caseId: "P0-09-06",
    title: "Final multi-owner GO/NO-GO recorded",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT + TRUONG_PHONG",
    evidence:
      "Final signed owner decision references only controlled redacted evidence and keeps NO-GO if any stop condition remains.",
  },
];

export function TtgdtxOwnerGoNoGoEvidenceChecklist() {
  return (
    <section
      data-ttgdtx-owner-go-no-go-evidence-checklist="P0-09"
      className="rounded-lg border border-sky-200 bg-sky-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-sky-700" />
          <div>
            <h2 className="font-semibold text-sky-950">
              P0-09 owner GO/NO-GO evidence checklist: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-sky-900">
              Signed final GO/NO-GO is still required before TTGDTX production
              can move from NO-GO. Codex can package evidence and run local
              checks, but BGH, IT_DATA, KHTC, PHAP_CHE, AUDIT and
              TRUONG_PHONG/process owner must sign the decision outside
              Codex/chat.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-sky-200 bg-white px-3 py-2 text-sky-950">
          Required pack:
          <span className="mt-1 block font-mono text-xs">
            TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {evidenceItems.map((item) => (
          <article
            key={item.caseId}
            className="border-l-2 border-sky-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-sky-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-sky-700">
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
          PASS_LOCAL does not approve backup, restore, migration, legal waiver,
          finance action, UAT acceptance, payout, dashboard reliance or
          production GO. Do not paste secrets, passwords, OTPs, service-role
          keys, bank credentials, raw student PII, raw CCCD, raw phone numbers,
          raw bank account numbers, bank statements, vouchers or raw payment
          data into Git/Codex/chat.
        </p>
      </div>
    </section>
  );
}
