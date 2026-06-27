import { FileWarning, ListChecks, ShieldAlert, Split } from "lucide-react";

type DecisionQueueItem = {
  queueId: string;
  bucket: string;
  files: string;
  risk: string;
  requiredDecision: string;
  allowedOutcome: string;
  owner: string;
  stopCondition: string;
};

const decisionQueue: DecisionQueueItem[] = [
  {
    queueId: "HDQ-01",
    bucket: "Base identity and CRM lead children",
    files: "database/schema.sql; database/step36a_lead_condition_checklist.sql",
    risk:
      "Deleting a user or lead can remove activity, follow-up, document, payment or checklist evidence.",
    requiredDecision: "Convert to restrict/archive or signed owner waiver.",
    allowedOutcome: "RESTRICT_OR_ARCHIVE first; waiver only for proven derived rows.",
    owner: "IT_DATA + TUYEN_SINH + Audit",
    stopCondition:
      "Any parent delete that can remove lead history, payment evidence or checklist evidence blocks production.",
  },
  {
    queueId: "HDQ-02",
    bucket: "HOU finance and evidence",
    files:
      "database/step35d_hou_commission_foundation.sql; database/step35g_hou_evidence_files.sql",
    risk:
      "Commission, payment-line and evidence history can disappear with parent deletion.",
    requiredDecision: "Convert protected rows to restrict/archive before finance use.",
    allowedOutcome: "Conversion required unless finance and audit sign a narrow waiver.",
    owner: "KHTC + IT_DATA + Audit",
    stopCondition:
      "Any cascade touching commission, payment, evidence or approval history blocks production.",
  },
  {
    queueId: "HDQ-03",
    bucket: "Workspace and scope helpers",
    files:
      "database/step38_user_scopes_and_handovers.sql; database/step40_user_lead_visibility.sql; database/step52_admission_workspace_selector.sql",
    risk:
      "Access-scope history can disappear and weaken audit or handover traceability.",
    requiredDecision: "Prefer status soft-revoke pattern; waive only pure derived helper rows.",
    allowedOutcome: "SOFT_REVOKE_OR_WAIVER with owner reason and rollback note.",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    stopCondition:
      "Any cascade that hides who had access, scope or handover responsibility blocks production.",
  },
  {
    queueId: "HDQ-04",
    bucket: "Master, control and dynamic configuration",
    files:
      "database/step41_master_control.sql; database/step44_admission_segment_operating_os.sql; database/step49_master_data_governance.sql; database/step54_admission_object_field_schema.sql; database/step56_dynamic_admission_configuration.sql; database/step57_dynamic_lead_form_enforcement.sql; database/step60_admission_catalog_workspace_gate.sql",
    risk:
      "Deleting a master row can remove configuration, form, gate or governance history.",
    requiredDecision: "Convert to restrict/archive unless proven derived-only.",
    allowedOutcome: "RESTRICT_OR_ARCHIVE, or derived-helper waiver with evidence.",
    owner: "IT_DATA + process owner + Audit",
    stopCondition:
      "Any cascade that removes governance, gate or configuration evidence blocks production.",
  },
  {
    queueId: "HDQ-05",
    bucket: "Legal, tuition and short-course operations",
    files:
      "database/step59_major_legal_tuition_gate.sql; database/step62_short_course_data_foundation.sql",
    risk:
      "Legal/tuition gate and attendance/enrollment evidence can be removed.",
    requiredDecision: "Convert to restrict/archive before production use.",
    allowedOutcome: "Conversion required before production finance or training reliance.",
    owner: "PHAP_CHE + KHTC + DAO_TAO + Audit",
    stopCondition:
      "Any cascade that removes legal, tuition, attendance or enrollment evidence blocks production.",
  },
];

export function HardDeleteConversionDecisionQueue() {
  return (
    <section
      className="rounded-lg border border-red-200 bg-white p-5 text-sm shadow-sm"
      data-hard-delete-conversion-decision-queue="P6-06"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-4xl items-start gap-3">
          <Split className="mt-0.5 size-5 shrink-0 text-red-700" />
          <div>
            <h2 className="font-semibold text-zinc-950">
              P6-06 hard-delete conversion decision queue: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-zinc-700">
              The 44 non-TTGDTX/base cascade findings are grouped into owner
              decision lanes. Protected finance, evidence, approval, legal,
              audit, lead and operating-history rows must be converted to
              restrict/archive/status transitions, or explicitly waived by the
              accountable owner group before production can be considered.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-950">
          Decision source:
          <span className="mt-1 block font-mono text-xs">
            HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {decisionQueue.map((item) => (
          <article
            key={item.queueId}
            className="border-l-2 border-red-300 bg-red-50/50 px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <FileWarning className="mt-0.5 size-4 shrink-0 text-red-700" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-red-700">
                  {item.queueId} - {item.bucket}
                </p>
                <p className="mt-2 break-words font-mono text-xs text-red-950">
                  {item.files}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">{item.risk}</p>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <p className="rounded-md border border-red-100 bg-white px-3 py-2 leading-5 text-zinc-700">
                    <span className="block text-xs font-semibold uppercase text-zinc-500">
                      Required decision
                    </span>
                    {item.requiredDecision}
                  </p>
                  <p className="rounded-md border border-red-100 bg-white px-3 py-2 leading-5 text-zinc-700">
                    <span className="block text-xs font-semibold uppercase text-zinc-500">
                      Allowed outcome
                    </span>
                    {item.allowedOutcome}
                  </p>
                  <p className="rounded-md border border-red-100 bg-white px-3 py-2 leading-5 text-zinc-700">
                    <span className="block text-xs font-semibold uppercase text-zinc-500">
                      Owner
                    </span>
                    {item.owner}
                  </p>
                </div>
                <p className="mt-3 flex items-start gap-2 rounded-md border border-rose-200 bg-white px-3 py-2 leading-5 text-rose-700">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                  Stop: {item.stopCondition}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <ListChecks className="mt-0.5 size-4 shrink-0" />
        <p>
          PASS_LOCAL only proves the decision queue is visible. It does not
          approve production deletion, cascade execution, waiver, conversion
          migration, cleanup, rollback success or production GO.
        </p>
      </div>
    </section>
  );
}
