import {
  FileSearch,
  Gauge,
  ListChecks,
  ShieldCheck,
  TableProperties,
} from "lucide-react";

type ReportViewSource = {
  code: string;
  owner: string;
  consumer: string;
  source: string;
  qualityGate: string;
  status: string;
};

type KpiDefinition = {
  code: string;
  sourceView: string;
  allowedUse: string;
  forbiddenUse: string;
};

type DataQualityCheck = {
  id: string;
  appliesTo: string;
  captureStatus: string;
  ownerAction: string;
  evidenceState: string;
  stopCondition: string;
};

type OwnerSignoffCapture = {
  id: string;
  reportView: string;
  requiredOwners: string;
  signoffState: string;
  blocker: string;
};

const reportViewSources: ReportViewSource[] = [
  {
    code: "RV_TTGDTX_FINANCE_SUMMARY",
    owner: "KHTC + BGH + IT_DATA + Audit",
    consumer: "/finance-desk, /ttgdtx/accounting-dashboard, BGH",
    source:
      "ttgdtx_accounting_dashboard_summary, partner/control boards, heu_finance_desk_summary",
    qualityGate: "P2-18 source reconciliation and P5-03 Finance Desk UAT",
    status: "SOURCE_MAP_DRAFT",
  },
  {
    code: "RV_TTGDTX_CONG_NO_THUC_THU",
    owner: "KHTC + Audit",
    consumer: "Finance Desk and accounting dashboard",
    source:
      "student receivable readiness, tuition payment board, collection summary",
    qualityGate: "Real HEU receipt and reconciliation evidence required",
    status: "SOURCE_MAP_DRAFT",
  },
  {
    code: "RV_TTGDTX_COM_CHI_TRA",
    owner: "KHTC + PHAP_CHE + BGH + Audit",
    consumer: "Finance Desk and payment request/pay routes",
    source:
      "payment request, approval, execution and recent disbursement boards",
    qualityGate: "BBNT, partner invoice, duplicate guard and payout readiness",
    status: "SOURCE_MAP_DRAFT",
  },
  {
    code: "RV_HOU_LEDGER_SUMMARY",
    owner: "HOU owner + KHTC + IT_DATA + Audit",
    consumer: "/hou and HOU workspace",
    source: "HOU program, major, location, financial policy and COM objects",
    qualityGate: "HOU handover, tuition ledger and commission policy signoff",
    status: "SOURCE_MAP_DRAFT",
  },
  {
    code: "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    owner: "DAO_TAO + KHTC + IT_DATA + Audit",
    consumer: "/short-course and Short Course dashboard",
    source: "short-course foundation, attendance, invoice and payment views",
    qualityGate: "Attendance lock, exception register and payment UAT",
    status: "SOURCE_MAP_DRAFT",
  },
  {
    code: "RV_AI_ALLOWED_CONTEXT",
    owner: "BGH + IT_DATA + Audit",
    consumer: "/ai-assistant and advisory boards",
    source: "AI policy, AI scope register, dictionary and approved views",
    qualityGate: "No raw restricted data, no AI write, prompt audit needed",
    status: "SOURCE_MAP_DRAFT",
  },
];

const kpiDefinitions: KpiDefinition[] = [
  {
    code: "KPI_TTGDTX_ACTUAL_COLLECTION",
    sourceView: "RV_TTGDTX_CONG_NO_THUC_THU",
    allowedUse: "Compare controlled payment views with reconciliation evidence",
    forbiddenUse: "Does not replace bank reconciliation or HEU receipt proof",
  },
  {
    code: "KPI_TTGDTX_PENDING_PAYOUT",
    sourceView: "RV_TTGDTX_COM_CHI_TRA",
    allowedUse: "Monitor duplicate-risk and payout-readiness queues",
    forbiddenUse: "Does not authorize payout",
  },
  {
    code: "KPI_HOU_COM_RISK",
    sourceView: "RV_HOU_LEDGER_SUMMARY",
    allowedUse: "Review HOU commission risk and dropout/debt-offset signals",
    forbiddenUse: "Does not finalize COM payable",
  },
  {
    code: "KPI_SHORT_PAYMENT_READY",
    sourceView: "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    allowedUse: "Prepare payment verification queue",
    forbiddenUse: "Does not close payment period",
  },
  {
    code: "KPI_AI_ALLOWED_SCOPE",
    sourceView: "RV_AI_ALLOWED_CONTEXT",
    allowedUse: "Review AI pilot readiness from approved context",
    forbiddenUse: "Does not enable AI production action",
  },
];

const dataQualityChecks: DataQualityCheck[] = [
  {
    id: "DQ-RV-01",
    appliesTo: "All report views",
    captureStatus: "CAPTURE_REQUIRED",
    ownerAction: "IT/Data records owner, physical source and allowed consumer",
    evidenceState: "No owner signoff yet",
    stopCondition: "Missing owner, physical source or allowed consumer",
  },
  {
    id: "DQ-RV-03",
    appliesTo: "Cong no / thuc thu",
    captureStatus: "RECON_EVIDENCE_REQUIRED",
    ownerAction: "KHTC attaches HEU receipt and reconciliation reference",
    evidenceState: "Draft metadata only",
    stopCondition: "Dashboard claims real HEU receipt without evidence",
  },
  {
    id: "DQ-RV-04",
    appliesTo: "COM / chi tra",
    captureStatus: "PAYOUT_LOCK_REQUIRED",
    ownerAction: "KHTC + Audit mark payout implication as blocked",
    evidenceState: "No payment authorization",
    stopCondition: "COM finalization or payout is implied",
  },
  {
    id: "DQ-RV-08",
    appliesTo: "AI",
    captureStatus: "READ_ONLY_SCOPE_REQUIRED",
    ownerAction: "IT/Data confirms approved context and prompt audit need",
    evidenceState: "AI production action remains blocked",
    stopCondition: "AI reads raw restricted data or writes workflow state",
  },
];

const ownerSignoffCaptures: OwnerSignoffCapture[] = [
  {
    id: "RV-SIGN-01",
    reportView: "RV_TTGDTX_FINANCE_SUMMARY",
    requiredOwners: "KHTC + BGH + IT_DATA + Audit",
    signoffState: "OWNER_SIGNOFF_PENDING",
    blocker: "P2-18 and P5-03 signed browser UAT are still missing",
  },
  {
    id: "RV-SIGN-02",
    reportView: "RV_TTGDTX_COM_CHI_TRA",
    requiredOwners: "KHTC + PHAP_CHE + BGH + Audit",
    signoffState: "PAYOUT_SIGNOFF_REQUIRED",
    blocker: "P2-17 payout UAT and duplicate guard proof are still missing",
  },
  {
    id: "RV-SIGN-03",
    reportView: "RV_HOU_LEDGER_SUMMARY",
    requiredOwners: "HOU owner + KHTC + IT_DATA + Audit",
    signoffState: "HOU_OWNER_SIGNOFF_REQUIRED",
    blocker: "HOU ledger, handover and commission policy signoff are missing",
  },
  {
    id: "RV-SIGN-04",
    reportView: "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    requiredOwners: "DAO_TAO + KHTC + IT_DATA + Audit",
    signoffState: "SHORT_COURSE_SIGNOFF_REQUIRED",
    blocker: "Attendance/payment UAT and report-view signoff are missing",
  },
  {
    id: "RV-SIGN-05",
    reportView: "RV_AI_ALLOWED_CONTEXT",
    requiredOwners: "BGH + IT_DATA + Audit",
    signoffState: "AI_SCOPE_SIGNOFF_REQUIRED",
    blocker: "AI scope registry approval and signed AI UAT are missing",
  },
];

function StatusBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs font-medium text-amber-800">
      {children}
    </span>
  );
}

export function ReportViewSourceMapPanel() {
  return (
    <section
      data-heu-report-view-source-map-panel="P0-16"
      className="space-y-5 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2">
            <TableProperties className="size-5 text-zinc-700" />
            <h2 className="text-base font-semibold">
              Report View Source Map: PASS_LOCAL only
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Dashboard must read approved report views and trace each KPI to a
            controlled source, data-quality check and owner signoff need. This
            panel is read-only governance; it does not approve production
            reliance, statutory accounting, finance action, UAT acceptance,
            evidence acceptance or owner GO.
          </p>
        </div>
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          Production remains NO-GO until backup/restore, migration order,
          signed UAT, hard-delete/cascade closure and final owner Go/No-Go are
          complete.
        </div>
      </div>

      <div
        data-heu-report-view-source-map-audit="RV_TTGDTX_FINANCE_SUMMARY RV_TTGDTX_CONG_NO_THUC_THU RV_TTGDTX_COM_CHI_TRA RV_HOU_LEDGER_SUMMARY RV_SHORT_COURSE_ATTENDANCE_PAYMENT RV_AI_ALLOWED_CONTEXT KPI_TTGDTX_ACTUAL_COLLECTION DQ-RV-08 CAPTURE_REQUIRED OWNER_SIGNOFF_PENDING RECON_EVIDENCE_REQUIRED"
        hidden
      />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileSearch className="size-4 text-blue-700" />
            Source rule
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Dashboard -&gt; Report View -&gt; Physical Source -&gt; Data Quality
            Check -&gt; Owner Signoff -&gt; UAT Evidence.
          </p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Gauge className="size-4 text-emerald-700" />
            KPI rule
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            KPI definitions must show business meaning, source report view,
            allowed use and forbidden interpretation.
          </p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-amber-700" />
            Stop rule
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Stop when a dashboard reads raw workbooks, raw bank files,
            unrestricted tables or unapproved sensitive data.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Report view</th>
              <th className="px-4 py-3">Controlled source</th>
              <th className="px-4 py-3">Consumer</th>
              <th className="px-4 py-3">Quality gate</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {reportViewSources.map((item) => (
              <tr key={item.code}>
                <td className="px-4 py-4 font-mono text-xs text-zinc-950">
                  {item.code}
                </td>
                <td className="px-4 py-4 text-zinc-700">{item.source}</td>
                <td className="px-4 py-4 text-zinc-700">{item.consumer}</td>
                <td className="px-4 py-4 text-zinc-700">{item.qualityGate}</td>
                <td className="px-4 py-4 text-zinc-700">{item.owner}</td>
                <td className="px-4 py-4">
                  <StatusBadge>{item.status}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section className="rounded-lg border border-zinc-200">
          <div className="border-b border-zinc-200 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Gauge className="size-4 text-emerald-700" />
              KPI dictionary shell
            </h3>
          </div>
          <div className="divide-y divide-zinc-200">
            {kpiDefinitions.map((item) => (
              <article key={item.code} className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-mono text-xs font-semibold text-zinc-950">
                    {item.code}
                  </p>
                  <span className="font-mono text-xs text-zinc-500">
                    {item.sourceView}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-700">{item.allowedUse}</p>
                <p className="mt-1 text-sm text-rose-700">
                  Stop: {item.forbiddenUse}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200">
          <div className="border-b border-zinc-200 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <ListChecks className="size-4 text-blue-700" />
              Data Quality Check status capture
            </h3>
          </div>
          <div className="divide-y divide-zinc-200">
            {dataQualityChecks.map((item) => (
              <article key={item.id} className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-mono text-xs font-semibold text-zinc-950">
                    {item.id}
                  </p>
                  <StatusBadge>{item.captureStatus}</StatusBadge>
                </div>
                <p className="mt-2 text-sm text-zinc-700">{item.appliesTo}</p>
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

      <section className="rounded-lg border border-zinc-200">
        <div className="border-b border-zinc-200 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-emerald-700" />
            Owner signoff capture
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            This queue shows which owner signatures must be captured outside
            Git/Codex/chat before report views can support signed UAT or
            dashboard reliance. It is read-only and does not collect signatures.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Signoff ID</th>
                <th className="px-4 py-3">Report view</th>
                <th className="px-4 py-3">Required owners</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Blocker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {ownerSignoffCaptures.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 font-mono text-xs text-zinc-950">
                    {item.id}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-zinc-700">
                    {item.reportView}
                  </td>
                  <td className="px-4 py-4 text-zinc-700">
                    {item.requiredOwners}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge>{item.signoffState}</StatusBadge>
                  </td>
                  <td className="px-4 py-4 text-rose-700">{item.blocker}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
