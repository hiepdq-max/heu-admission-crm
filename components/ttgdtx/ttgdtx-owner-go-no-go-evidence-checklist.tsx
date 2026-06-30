import {
  BadgeCheck,
  ClipboardCheck,
  FileCheck2,
  ListChecks,
  ShieldAlert,
} from "lucide-react";

type EvidenceItem = {
  caseId: string;
  title: string;
  owner: string;
  evidence: string;
};

type OwnerGoNoGoAcceptanceItem = {
  caseId: string;
  title: string;
  minimum: string;
  stopCondition: string;
};

type OwnerGoNoGoDecisionItem = {
  caseId: string;
  title: string;
  requiredDecision: string;
  stopCondition: string;
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
    title: "Lead handover, payout, dashboard and Finance Desk UAT accepted",
    owner: "TUYEN_SINH + CTHSSV + DAO_TAO + KHTC + BGH + Audit + IT_DATA",
    evidence:
      "P3-01/P3-02 lead lifecycle and handover UAT from HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md, P2-17 duplicate-payout UAT, P2-18 read-only dashboard reconciliation and P5-03 Finance Desk controlled-trial evidence P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005 signed by required owners.",
  },
  {
    caseId: "P0-09-05",
    title: "Role UAT, audit trace and hard-delete decision accepted",
    owner: "IT_DATA + Audit + process owners",
    evidence:
      "Role/workspace UAT evidence, P0-17 access closure decision, audit-log trace rows, HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md and hard-delete/cascade conversion evidence or narrow written waiver accepted by the responsible owners.",
  },
  {
    caseId: "P0-09-06",
    title: "Final multi-owner GO/NO-GO recorded",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT + TRUONG_PHONG",
    evidence:
      "Final signed owner decision references only controlled redacted evidence and keeps NO-GO if any stop condition remains.",
  },
];

const ownerGoNoGoAcceptanceItems: OwnerGoNoGoAcceptanceItem[] = [
  {
    caseId: "P0-09-ACCEPT-01",
    title: "Evidence pack completeness and redaction",
    minimum:
      "Every required evidence item has a controlled external location, owner initials, result and no raw sensitive data in Git/Codex/chat.",
    stopCondition:
      "Any evidence is missing, stored in an uncontrolled location or contains raw sensitive data.",
  },
  {
    caseId: "P0-09-ACCEPT-02",
    title: "Backup/restore and migration readiness",
    minimum:
      "Backup ID, restore target, smoke-check, preflight/postflight and signed Step90-Step110 migration order are accepted.",
    stopCondition:
      "Restore proof is missing, app connection to restore target is not proven or migration order is unsigned.",
  },
  {
    caseId: "P0-09-ACCEPT-03",
    title: "Finance, legal and UAT blockers closed",
    minimum:
      "P0-19, P3-01/P3-02 lifecycle and handover UAT, P2-17, P2-18, P5-03 Finance Desk controlled trial, role/workspace UAT, P0-17 access closure decision, audit-log trace rows and UAT operator handoff are signed; HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md, HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md and HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md are cited; P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED is recorded; every unresolved P6-06 finding is converted or narrowly waived in writing.",
    stopCondition:
      "Any UAT/waiver is unsigned, any HIGH/BLOCKER exception remains, P3-01/P3-02 is unsigned, leaks role/workspace scope or lets handover bypass P0-19/P2-05/P2-03 finance gates, P2-17 can pay twice, P2-18 can write or cannot reconcile, P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005 is missing, role leak exists, P0-17 access closure is missing, audit trace is incomplete or a P6-06 finding lacks conversion/waiver decision.",
  },
  {
    caseId: "P0-09-ACCEPT-04",
    title: "Owner decision quorum and accountability",
    minimum:
      "BGH, IT_DATA, KHTC, PHAP_CHE, AUDIT and TRUONG_PHONG/process owner each record GO/NO-GO, evidence ref, signature and date.",
    stopCondition:
      "Any owner is missing, approval is oral-only, role is ambiguous, waiver is hidden or one owner asks for more evidence.",
  },
  {
    caseId: "P0-09-ACCEPT-05",
    title: "Production boundary and AI/Codex limitation",
    minimum:
      "Decision record states Codex/AI is advisory only; no production migration or production GO is approved from Codex/chat.",
    stopCondition:
      "PASS_LOCAL is treated as production GO, or AI/Codex is used to approve finance action, migration, UAT, waiver or production.",
  },
  {
    caseId: "P0-09-ACCEPT-06",
    title: "Final outcome stays NO-GO until every stop condition is closed",
    minimum:
      "All stop conditions in the sign-off pack are explicitly closed, otherwise the final decision remains NO-GO.",
    stopCondition:
      "Any open stop condition, unsigned evidence, missing backup/restore proof, unresolved exception or raw evidence exposure remains.",
  },
];

const ownerGoNoGoDecisionItems: OwnerGoNoGoDecisionItem[] = [
  {
    caseId: "P0-09-DEC-01",
    title: "Evidence pack and redaction decision",
    requiredDecision:
      "Owner decision cites P0-10 redaction acceptance, P0-14 binder proof IDs and controlled external evidence references only.",
    stopCondition:
      "Any raw sensitive evidence, uncontrolled location, missing evidence ID or unsigned evidence owner keeps NO_GO.",
  },
  {
    caseId: "P0-09-DEC-02",
    title: "Backup/restore and migration authority decision",
    requiredDecision:
      "Owner decision cites P0-03 backup/restore closure, restore smoke-check, target isolation and signed Step90-Step110 migration order.",
    stopCondition:
      "Missing actual backup proof, restore-target proof, smoke-check result, rollback note or migration order keeps NO_GO.",
  },
  {
    caseId: "P0-09-DEC-03",
    title: "Legal, tuition and finance gate decision",
    requiredDecision:
      "PHAP_CHE, KHTC and BGH decision cites P0-19 legal basis, tuition/invoice policy, waiver register and signed finance-gate UAT evidence.",
    stopCondition:
      "Unsigned legal/finance evidence, unresolved invoice/chung-tu basis, hidden waiver or finance override request keeps NO_GO.",
  },
  {
    caseId: "P0-09-DEC-04",
    title: "UAT and operating proof decision",
    requiredDecision:
      "Owner decision cites signed P3-01/P3-02 lifecycle and handover UAT, P2-17 payout UAT, P2-18 dashboard UAT, P5-03 Finance Desk UAT, P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005, P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED and UAT operator handoff closure.",
    stopCondition:
      "Any unsigned browser UAT, missing P3 handover closure, P3 handover bypass of P0-19/P2-05/P2-03, duplicate payout risk, dashboard write path, missing P5-03 controlled-trial evidence, unreconciled total or missing handoff closure keeps NO_GO.",
  },
  {
    caseId: "P0-09-DEC-05",
    title: "Role, audit and hard-delete proof decision",
    requiredDecision:
      "Owner decision cites P6-04 role/workspace UAT, P0-17 access closure decision, P6-03 audit traceability, HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md and P6-06 hard-delete/cascade conversion or written waiver.",
    stopCondition:
      "Role leak, missing P0-17 access closure decision, missing audit trace, generic audit payload, unresolved cascade finding, missing finding-register citation or unsigned waiver keeps NO_GO.",
  },
  {
    caseId: "P0-09-DEC-06",
    title: "Final multi-owner accountability decision",
    requiredDecision:
      "BGH, IT_DATA, KHTC, PHAP_CHE, AUDIT and TRUONG_PHONG/process owner each record GO/NO-GO, signer, date and controlled evidence refs.",
    stopCondition:
      "Missing decision ID, unsigned owner, unresolved blocker, raw sensitive evidence, AI/Codex approval or PASS_LOCAL treated as production GO keeps BLOCKED or NO_GO.",
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

      <div
        data-ttgdtx-owner-go-no-go-acceptance-matrix="P0-09"
        className="mt-5 rounded-md border border-sky-200 bg-white p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-2">
            <ListChecks className="mt-0.5 size-4 shrink-0 text-sky-700" />
            <div>
              <h3 className="font-semibold text-sky-950">
                P0-09 owner GO/NO-GO acceptance matrix: PASS_LOCAL only
              </h3>
              <p className="mt-2 leading-6 text-sky-900">
                Use this matrix to decide whether the pack is ready for owner
                review. It does not approve production; missing evidence or
                any open stop condition keeps the result NO-GO.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 font-mono text-xs text-sky-950">
            P0_09_ACCEPT / NO_GO / BLOCKED
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {ownerGoNoGoAcceptanceItems.map((item) => (
            <article
              key={item.caseId}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-sky-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
              <p className="mt-2 leading-5 text-zinc-700">
                Minimum: {item.minimum}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          The acceptance matrix only says whether the pack can move to human
          review. It is not the final decision. Complete the final decision
          manifest below before any owner GO/NO-GO meeting.
        </p>
      </div>

      <div
        data-ttgdtx-owner-go-no-go-decision-manifest="P0-09"
        className="mt-5 rounded-md border border-emerald-200 bg-white p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" />
            <div>
              <h3 className="font-semibold text-emerald-950">
                P0-09 final owner GO/NO-GO decision manifest: PASS_LOCAL only
              </h3>
              <p className="mt-2 leading-6 text-emerald-900">
                Use this manifest after the evidence checklist and acceptance
                matrix are complete. It prepares a human final decision only
                and does not approve production, backup, restore, migration,
                legal waiver, finance action, UAT acceptance, payout,
                dashboard reliance or production GO.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-xs text-emerald-950">
            P0_09_FINAL_GO / NO_GO / BLOCKED
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {ownerGoNoGoDecisionItems.map((item) => (
            <article
              key={item.caseId}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-emerald-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
              <p className="mt-2 leading-5 text-zinc-700">
                Decision evidence: {item.requiredDecision}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 leading-6 text-rose-900">
          Stop immediately if any decision ID is missing, any owner signature
          is absent, any blocker remains open, raw sensitive evidence is
          referenced, AI/Codex is named as approver, or PASS_LOCAL is treated
          as production GO.
        </p>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          PASS_LOCAL does not approve backup, restore, migration, legal waiver,
          finance action, UAT acceptance, payout, dashboard reliance or
          production GO. Do not paste secrets, passwords, temporary passwords,
          OTPs, password reset links, account activation/invite links,
          service-role keys, bank credentials, raw student PII, raw CCCD, raw
          phone numbers, raw bank account numbers, bank statements, vouchers or
          raw payment data into Git/Codex/chat.
        </p>
      </div>
    </section>
  );
}
