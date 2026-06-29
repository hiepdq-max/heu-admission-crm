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

type FirstClosureBatchItem = {
  caseId: string;
  scope: string;
  requiredProof: string;
  stopCondition: string;
};

type HardDeleteClosureDecisionItem = {
  caseId: string;
  decisionGate: string;
  requiredProof: string;
  blocker: string;
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

const firstClosureBatchItems: FirstClosureBatchItem[] = [
  {
    caseId: "P6-06-B1-01",
    scope:
      "HOU commission policy, claim, payment-line and evidence rows: P6-06-FIND-010 through P6-06-FIND-017.",
    requiredProof:
      "Restrict/archive/status-transition design, rollback note, KHTC owner lane and redacted evidence ID.",
    stopCondition:
      "Stop if any commission, payment-line, claim or HOU evidence row can still vanish through parent delete.",
  },
  {
    caseId: "P6-06-B1-02",
    scope: "Legal/tuition gate row: P6-06-FIND-040.",
    requiredProof:
      "PHAP_CHE and KHTC classification, legal/tuition gate retention proof and rollback note.",
    stopCondition:
      "Stop if legal or tuition gate history can be removed, waived broadly or hidden in cleanup.",
  },
  {
    caseId: "P6-06-B1-03",
    scope:
      "Short-course attendance and enrollment rows: P6-06-FIND-042 through P6-06-FIND-044.",
    requiredProof:
      "DAO_TAO/KHTC conversion plan preserving class, session, attendance and enrollment history.",
    stopCondition:
      "Stop if attendance, payment support or enrollment evidence can disappear through cascade delete.",
  },
  {
    caseId: "P6-06-B1-04",
    scope:
      "Payment/evidence bridge rows: P6-06-FIND-006, P6-06-FIND-015 through P6-06-FIND-017, P6-06-FIND-029 and P6-06-FIND-030.",
    requiredProof:
      "Owner mapping, evidence-retention decision, rollback note and redacted controlled-evidence reference.",
    stopCondition:
      "Stop if payment, approval or evidence documents can be deleted before finance/legal review.",
  },
  {
    caseId: "P6-06-B1-05",
    scope: "Batch 1 closure record before owner GO/NO-GO.",
    requiredProof:
      "Decision value, owner signatures, controlled evidence location, redaction reviewer and no forbidden secret or raw PII content.",
    stopCondition:
      "Stop if raw data, passwords, temporary passwords, OTPs, reset links, invite links or service-role keys appear in Git/Codex/chat.",
  },
];

const secondClosureBatchItems: FirstClosureBatchItem[] = [
  {
    caseId: "P6-06-B2-01",
    scope:
      "User/profile accountability row: P6-06-FIND-002.",
    requiredProof:
      "Soft-revoke or inactive-profile design, P0-17 access closure compatibility, accountable owner lane and rollback note.",
    stopCondition:
      "Stop if deleting an auth user can erase profile accountability, role history or access-closure evidence.",
  },
  {
    caseId: "P6-06-B2-02",
    scope:
      "Lead activity, follow-up, document and custom-field rows: P6-06-FIND-003 through P6-06-FIND-005 and P6-06-FIND-038.",
    requiredProof:
      "Restrict/archive design preserving lifecycle history, lead-document evidence, custom-field evidence and redacted evidence ID.",
    stopCondition:
      "Stop if lead activity, follow-up, document or custom-field evidence can disappear through parent lead delete.",
  },
  {
    caseId: "P6-06-B2-03",
    scope:
      "Admission payment and evidence-document rows tied to leads: P6-06-FIND-006 and P6-06-FIND-029.",
    requiredProof:
      "KHTC/Audit evidence-retention decision, lead-to-payment trace proof, rollback note and controlled evidence reference.",
    stopCondition:
      "Stop if payment evidence or evidence-document history can be removed before finance or audit review.",
  },
  {
    caseId: "P6-06-B2-04",
    scope:
      "Lead condition checks and handover responsibility rows: P6-06-FIND-018 and P6-06-FIND-023.",
    requiredProof:
      "P3-01/P3-02 handover compatibility note, owner lane, checklist retention proof and redacted evidence ID.",
    stopCondition:
      "Stop if handover responsibility, condition-check evidence or lead-to-student decision history can disappear.",
  },
  {
    caseId: "P6-06-B2-05",
    scope: "Batch 2 CRM lead/handover closure record before owner GO/NO-GO.",
    requiredProof:
      "Decision value, owner signatures, controlled evidence location, redaction reviewer, P3-01/P3-02 reference and P0-17 compatibility note.",
    stopCondition:
      "Stop if broad waiver, raw PII, passwords, temporary passwords, OTPs, reset links, invite links or service-role keys appear in Git/Codex/chat.",
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
      "Stop if raw student PII, CCCD, bank data, payment data, passwords, temporary passwords, OTPs, password reset links, account activation/invite links, service-role keys or production credentials appear.",
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

const hardDeleteClosureDecisionItems: HardDeleteClosureDecisionItem[] = [
  {
    caseId: "P6-06-DEC-01",
    decisionGate: "Current scan and owner lanes locked",
    requiredProof:
      "The 44 non-TTGDTX/base cascade findings have a dated scan reference, owner lane and risk bucket.",
    blocker:
      "Block closure if the scan is stale, a table is unmapped, or a finding has no owner.",
  },
  {
    caseId: "P6-06-DEC-02",
    decisionGate: "Protected rows converted",
    requiredProof:
      "Finance, evidence, approval, payment, legal, audit, lead and operating-history rows use restrict, archive or status-transition behavior.",
    blocker:
      "Block closure if protected records can still be removed by parent delete, cascade execution, cleanup or migration.",
  },
  {
    caseId: "P6-06-DEC-03",
    decisionGate: "Derived-helper waiver controlled",
    requiredProof:
      "Every remaining derived-helper cascade has a narrow written waiver with table, reason, owner, rollback note and affected scope.",
    blocker:
      "Block closure if waiver is broad, oral, ownerless, hidden or covers protected finance/evidence/audit/legal/student-operating history.",
  },
  {
    caseId: "P6-06-DEC-04",
    decisionGate: "Rollback and cleanup proof independent of deletion",
    requiredProof:
      "Rollback evidence uses backup/restore or reversible state and cleanup evidence preserves legal, finance and audit records.",
    blocker:
      "Block closure if truncate, drop table, hard-delete or cascade execution is presented as rollback proof.",
  },
  {
    caseId: "P6-06-DEC-05",
    decisionGate: "Redacted evidence and human sign-off",
    requiredProof:
      "BGH, IT_DATA, Audit and affected owners sign redacted conversion/waiver evidence in the controlled evidence location.",
    blocker:
      "Block closure if raw sensitive data, passwords, temporary passwords, OTPs, password reset links, account activation/invite links, service-role keys or production credentials appear in Git, Codex/chat or public notes.",
  },
  {
    caseId: "P6-06-DEC-06",
    decisionGate: "Production boundary acknowledged",
    requiredProof:
      "The closure record states P6-06 is only ready for owner GO/NO-GO review after all stop conditions are cleared.",
    blocker:
      "Block closure if PASS_LOCAL is treated as production deletion approval, cascade execution approval, waiver approval, conversion migration approval, rollback success or production GO.",
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
              passwords, temporary passwords, OTPs, password reset links,
              account activation/invite links, service-role keys and production
              credentials stay outside Git/Codex/chat.
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
        data-hard-delete-finance-legal-evidence-batch="P6-06-TRIAGE-01"
        className="mt-5 border-t border-orange-200 pt-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-orange-950">
              P6-06 batch 1 finance/legal/evidence closure checklist:
              PASS_LOCAL only
            </h3>
            <p className="mt-1 leading-6 text-orange-900">
              Decision value:{" "}
              <span className="font-mono text-xs">
                P6_06_BATCH1_READY / NO_GO / BLOCKED
              </span>
              . This is the first closure batch from the owner triage plan and
              must clear before any broad waiver or owner GO/NO-GO discussion.
            </p>
          </div>
          <div className="min-w-64 rounded-md border border-orange-200 bg-white px-3 py-2 text-orange-950">
            Finance/legal/evidence rows are protected first because they affect
            money, statutory/legal records, attendance and audit evidence.
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {firstClosureBatchItems.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-orange-300 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-orange-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.scope}</p>
              <p className="mt-2 leading-5 text-zinc-700">
                {item.requiredProof}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                {item.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div
        data-hard-delete-crm-lead-handover-batch="P6-06-TRIAGE-02"
        className="mt-5 border-t border-orange-200 pt-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-orange-950">
              P6-06 batch 2 CRM lead/handover closure checklist: PASS_LOCAL
              only
            </h3>
            <p className="mt-1 leading-6 text-orange-900">
              Decision value:{" "}
              <span className="font-mono text-xs">
                P6_06_BATCH2_READY / NO_GO / BLOCKED
              </span>
              . This batch protects lead, payment, evidence and handover
              history before a parent lead or user delete can be accepted.
            </p>
          </div>
          <div className="min-w-64 rounded-md border border-orange-200 bg-white px-3 py-2 text-orange-950">
            CRM lead and handover rows are protected because they carry
            admission evidence, finance traces and P3-01/P3-02 handover
            decisions.
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {secondClosureBatchItems.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-orange-300 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-orange-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.scope}</p>
              <p className="mt-2 leading-5 text-zinc-700">
                {item.requiredProof}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                {item.stopCondition}
              </p>
            </article>
          ))}
        </div>
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

      <div
        data-hard-delete-cascade-closure-decision-manifest="P6-06"
        className="mt-5 border-t border-orange-200 pt-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-orange-950">
              P6-06 hard-delete/cascade closure decision manifest: PASS_LOCAL
              only
            </h3>
            <p className="mt-1 leading-6 text-orange-900">
              Decision value:{" "}
              <span className="font-mono text-xs">
                P6_06_CLOSURE_READY / NO_GO / BLOCKED
              </span>
              . Use this manifest to prepare a human closure decision for
              conversion/waiver evidence, not to approve deletion, cascade
              execution or production.
            </p>
          </div>
          <div className="min-w-64 rounded-md border border-orange-200 bg-white px-3 py-2 text-orange-950">
            P6-06 can close only after every protected cascade path is converted
            or every derived-helper exception has a narrow written waiver.
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {hardDeleteClosureDecisionItems.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-orange-300 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-orange-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">
                {item.decisionGate}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                {item.requiredProof}
              </p>
              <p className="mt-2 leading-5 text-rose-800">{item.blocker}</p>
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
