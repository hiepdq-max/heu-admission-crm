import {
  AlertTriangle,
  DatabaseZap,
  FileSearch,
  GitCompareArrows,
  ShieldCheck,
} from "lucide-react";

type CompatibilityMaster = {
  code: string;
  target: string;
  currentSources: string;
  reportConsumers: string;
  qualityCheck: string;
  status: string;
};

type ReportViewMasterNeed = {
  reportView: string;
  requiredMasters: string;
  useContract: string;
  blocker: string;
};

type CompatibilityCheckpoint = {
  id: string;
  checkpoint: string;
  ownerAction: string;
  evidenceState: string;
  stopCondition: string;
};

const compatibilityMasters: CompatibilityMaster[] = [
  {
    code: "CV_STUDENT_MASTER_UNIFIED",
    target: "STUDENT_MASTER / HOC_SINH_MASTER",
    currentSources:
      "leads and handover state; TTGDTX student-receivable references; HOU workspace; short_student_master",
    reportConsumers:
      "RV_TTGDTX_CONG_NO_THUC_THU, RV_HOU_LEDGER_SUMMARY, RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    qualityCheck: "DQ-DM-01 stable identity and lifecycle-state reconciliation",
    status: "DESIGN_ONLY",
  },
  {
    code: "CV_CLASS_MASTER_UNIFIED",
    target: "CLASS_MASTER",
    currentSources:
      "TTGDTX center/class metadata; short_class_master; HOU program/location/class-like intake fields",
    reportConsumers:
      "RV_TTGDTX_FINANCE_SUMMARY, RV_HOU_LEDGER_SUMMARY, RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    qualityCheck: "DQ-DM-02 class key, owner and module-separation proof",
    status: "DESIGN_ONLY",
  },
  {
    code: "CV_COHORT_MASTER_UNIFIED",
    target: "COHORT_MASTER",
    currentSources:
      "admission segment, school year, intake, TTGDTX period and short-course session references",
    reportConsumers:
      "RV_TTGDTX_UAT_READINESS, RV_TTGDTX_FINANCE_SUMMARY, RV_AUDIT_RISK_CONTROL",
    qualityCheck: "DQ-DM-03 reporting period and intake boundary check",
    status: "DESIGN_ONLY",
  },
  {
    code: "CV_PROGRAM_MASTER_COMPAT",
    target: "PROGRAM_MASTER",
    currentSources:
      "program_major_master, HOU programs/majors and short-course offerings",
    reportConsumers:
      "RV_HOU_LEDGER_SUMMARY, RV_SHORT_COURSE_ATTENDANCE_PAYMENT, admissions reports",
    qualityCheck: "DQ-DM-04 active version, owner and business meaning check",
    status: "DESIGN_ONLY",
  },
  {
    code: "REPORT_VIEW_MASTER_CONTRACT",
    target: "REPORT_VIEW_REGISTER + DATA_QUALITY_CHECK_LOG",
    currentSources:
      "HEU report-view register, source map, DQ checks, owner signoff capture and UAT evidence references",
    reportConsumers: "/reports, /finance-desk, /ttgdtx/accounting-dashboard, BGH",
    qualityCheck: "DQ-DM-05 dashboards read approved report views only",
    status: "DRAFT_CONTROL",
  },
];

const reportViewMasterNeeds: ReportViewMasterNeed[] = [
  {
    reportView: "RV_TTGDTX_FINANCE_SUMMARY",
    requiredMasters:
      "TTGDTX_MASTER, STUDENT_MASTER, CLASS_MASTER, RECEIPT/PAYMENT masters",
    useContract:
      "Read only from approved TTGDTX dashboard and Finance Desk report views",
    blocker: "Signed P2-18 and P5-03 UAT plus owner signoff are missing",
  },
  {
    reportView: "RV_TTGDTX_CONG_NO_THUC_THU",
    requiredMasters:
      "STUDENT_MASTER, CONTRACT/TUITION master, RECEIPT_MASTER, DOI_SOAT_MASTER",
    useContract:
      "Show receivable/actual-collection signals only when receipt and reconciliation references exist",
    blocker: "Cannot claim real HEU receipt without external reconciliation evidence",
  },
  {
    reportView: "RV_HOU_LEDGER_SUMMARY",
    requiredMasters:
      "HOU_STUDENT_MASTER, PROGRAM_MASTER, LOCATION master, HOU_COMMISSION_LEDGER",
    useContract:
      "Keep HOU ledger and COM review separate from TTGDTX and Short Course flows",
    blocker: "HOU handover, ledger and commission owner signoff are missing",
  },
  {
    reportView: "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    requiredMasters:
      "SHORT_COURSE_STUDENT_MASTER, CLASS_MASTER, ATTENDANCE, payment readiness objects",
    useContract:
      "Use attendance/class/payment compatibility only for UAT preparation and read-only review",
    blocker: "Attendance/payment UAT and report-view signoff are missing",
  },
  {
    reportView: "RV_AI_ALLOWED_CONTEXT",
    requiredMasters:
      "REPORT_VIEW_REGISTER, DATA_DICTIONARY, AI_AGENT_SCOPE_REGISTER, RISK_CONTROL",
    useContract:
      "AI may read approved context only; no raw restricted data and no workflow writes",
    blocker: "AI scope registry approval and prompt/output audit design are missing",
  },
];

const compatibilityCheckpoints: CompatibilityCheckpoint[] = [
  {
    id: "DQ-DM-01",
    checkpoint: "Student identity compatibility",
    ownerAction:
      "IT/Data maps stable student identifiers without importing raw PII or merging module tables",
    evidenceState: "Design-only mapping; no production view created",
    stopCondition: "A report mixes lead, student, parent or CCCD data without owner-approved scope",
  },
  {
    id: "DQ-DM-02",
    checkpoint: "Class and cohort boundary",
    ownerAction:
      "Dao Tao, TTGDTX and Short Course owners confirm class/cohort meaning per module",
    evidenceState: "Owner signoff pending",
    stopCondition: "A class or cohort key is reused across modules with different meaning",
  },
  {
    id: "DQ-DM-03",
    checkpoint: "Report-view contract",
    ownerAction:
      "BGH, KHTC, IT/Data and Audit confirm dashboard reads approved report views only",
    evidenceState: "Report-view source map is DRAFT_CONTROL",
    stopCondition: "Dashboard reads raw workbook, raw bank file, voucher or unrestricted table",
  },
  {
    id: "DQ-DM-04",
    checkpoint: "Sensitive data and AI boundary",
    ownerAction:
      "Audit verifies restricted data is not exposed to AI or broad dashboards",
    evidenceState: "AI production action remains blocked",
    stopCondition: "AI reads raw restricted data, writes workflow state or implies approval",
  },
  {
    id: "DQ-DM-05",
    checkpoint: "Dashboard reliance lock",
    ownerAction:
      "BGH + KHTC confirm each dashboard/Finance Desk reliance path has an approved report-view contract, owner signoff and controlled evidence reference",
    evidenceState: "Reliance signoff pending; dashboard remains read-only/UAT-only",
    stopCondition:
      "/reports, /finance-desk or /ttgdtx/accounting-dashboard is used for management, finance or statutory reliance before owner signoff",
  },
];

function StatusBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs font-medium text-amber-800">
      {children}
    </span>
  );
}

export function DataMasterReportViewBridgePanel() {
  return (
    <section
      data-heu-data-master-report-view-bridge-panel="DM-RV-03"
      className="space-y-5 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="size-5 text-zinc-700" />
            <h2 className="text-base font-semibold">
              Data Master / Report View Bridge: DESIGN_ONLY
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            This panel connects the P0 Data Master register to controlled Report
            Views. It is a non-destructive compatibility plan for future
            STUDENT_MASTER, CLASS_MASTER and COHORT_MASTER views. It does not
            create production SQL, merge source records, import real data or
            approve dashboard reliance.
          </p>
        </div>
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          Production remains NO-GO. Owner signoff, UAT evidence, migration order
          and backup/restore proof are still required outside Git/Codex/chat.
        </div>
      </div>

      <div
        data-heu-data-master-report-view-bridge-audit="STUDENT_MASTER CLASS_MASTER COHORT_MASTER CV_STUDENT_MASTER_UNIFIED CV_CLASS_MASTER_UNIFIED CV_COHORT_MASTER_UNIFIED REPORT_VIEW_MASTER_CONTRACT RV_TTGDTX_FINANCE_SUMMARY RV_HOU_LEDGER_SUMMARY RV_SHORT_COURSE_ATTENDANCE_PAYMENT DQ-DM-01 DQ-DM-04 DQ-DM-05 DESIGN_ONLY DRAFT_CONTROL NON_DESTRUCTIVE NO_PRODUCTION_RELIANCE"
        hidden
      />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <DatabaseZap className="size-4 text-blue-700" />
            Master rule
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Keep current module tables as source of record. Add compatibility
            designs only after owner meaning, scope and lifecycle states match.
          </p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileSearch className="size-4 text-emerald-700" />
            Report rule
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Dashboards read Report Views, not raw workbooks, raw bank files,
            vouchers, unrestricted tables or unapproved sensitive data.
          </p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-amber-700" />
            Stop rule
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Stop before destructive rename/drop/merge, real-data import,
            finance posting, owner approval, evidence acceptance or production
            GO.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full min-w-[1080px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Compatibility object</th>
              <th className="px-4 py-3">Target master</th>
              <th className="px-4 py-3">Current sources</th>
              <th className="px-4 py-3">Report consumers</th>
              <th className="px-4 py-3">Quality check</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {compatibilityMasters.map((item) => (
              <tr key={item.code} className="align-top">
                <td className="px-4 py-4 font-mono text-xs text-zinc-950">
                  {item.code}
                </td>
                <td className="px-4 py-4 font-mono text-xs text-zinc-700">
                  {item.target}
                </td>
                <td className="px-4 py-4 text-zinc-700">
                  {item.currentSources}
                </td>
                <td className="px-4 py-4 text-zinc-700">
                  {item.reportConsumers}
                </td>
                <td className="px-4 py-4 text-zinc-700">
                  {item.qualityCheck}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge>{item.status}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <section className="rounded-lg border border-zinc-200">
          <div className="border-b border-zinc-200 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <FileSearch className="size-4 text-blue-700" />
              Report view master requirements
            </h3>
          </div>
          <div className="divide-y divide-zinc-200">
            {reportViewMasterNeeds.map((item) => (
              <article key={item.reportView} className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-mono text-xs font-semibold text-zinc-950">
                    {item.reportView}
                  </p>
                  <StatusBadge>OWNER_SIGNOFF_PENDING</StatusBadge>
                </div>
                <p className="mt-2 text-sm text-zinc-700">
                  Required masters: {item.requiredMasters}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Use contract: {item.useContract}
                </p>
                <p className="mt-1 text-sm font-medium text-rose-700">
                  Stop: {item.blocker}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200">
          <div className="border-b border-zinc-200 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="size-4 text-amber-700" />
              Compatibility checkpoints
            </h3>
          </div>
          <div className="divide-y divide-zinc-200">
            {compatibilityCheckpoints.map((item) => (
              <article key={item.id} className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-mono text-xs font-semibold text-zinc-950">
                    {item.id}
                  </p>
                  <StatusBadge>CAPTURE_REQUIRED</StatusBadge>
                </div>
                <p className="mt-2 text-sm font-medium text-zinc-900">
                  {item.checkpoint}
                </p>
                <p className="mt-2 text-sm text-zinc-600">
                  Owner action: {item.ownerAction}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Evidence state: {item.evidenceState}
                </p>
                <p className="mt-1 text-sm font-medium text-rose-700">
                  Stop: {item.stopCondition}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
