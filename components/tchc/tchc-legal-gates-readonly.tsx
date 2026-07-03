import {
  AlertTriangle,
  FileWarning,
  Gavel,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

export type TchcLegalGateRow = {
  compliance_code: string;
  compliance_name: string;
  domain_code: string;
  owner_position_code: string;
  owner_position_name: string | null;
  legal_code: string;
  legal_title: string | null;
  legal_control_status: string | null;
  sop_code: string;
  sop_name: string | null;
  sop_control_status: string | null;
  report_code: string | null;
  report_name: string | null;
  report_control_status: string | null;
  evidence_class: string;
  retention_gate: string;
  data_boundary: string;
  stop_condition: string;
  phap_che_required: boolean;
  audit_required: boolean;
  automation_allowed: boolean;
  ai_allowed: boolean;
  legal_status: string;
  legal_gate_decision_status: string | null;
  compliance_readiness_state: string;
};

type TchcLegalGatesReadonlyProps = {
  rows: TchcLegalGateRow[];
  loadError?: string;
};

const domainLabels: Record<string, string> = {
  VAN_THU_LUU_TRU: "Van thu - luu tru",
  HANH_CHINH_NHAN_SU: "Hanh chinh nhan su",
  CSVC_TAI_SAN: "CSVC - tai san",
  HAU_CAN: "Hau can",
  AN_NINH: "An ninh",
  PHUONG_TIEN: "Phuong tien",
  MOI_TRUONG: "Moi truong",
  Y_TE: "Y te hoc duong",
  TCHC_TONG_HOP: "Tong hop TCHC",
};

const readinessLabels: Record<string, string> = {
  LEGAL_NO_GO: "LEGAL NO-GO",
  SOP_NO_GO: "SOP NO-GO",
  GATE_NO_GO: "GATE NO-GO",
  LEGAL_READY: "LEGAL READY",
};

const statusClass: Record<string, string> = {
  LEGAL_NO_GO: "border-red-200 bg-red-50 text-red-800",
  SOP_NO_GO: "border-amber-200 bg-amber-50 text-amber-800",
  GATE_NO_GO: "border-blue-200 bg-blue-50 text-blue-800",
  LEGAL_READY: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function statusTone(value: string) {
  return statusClass[value] ?? "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function readinessLabel(value: string) {
  return readinessLabels[value] ?? value;
}

function domainLabel(value: string) {
  return domainLabels[value] ?? value;
}

function countBy(rows: TchcLegalGateRow[], key: keyof TchcLegalGateRow) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const value = String(row[key] ?? "UNKNOWN");
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Array.from(counts.entries()).sort((left, right) =>
    left[0].localeCompare(right[0]),
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-600">{detail}</p>
    </article>
  );
}

export function TchcLegalGatesReadonly({
  rows,
  loadError,
}: TchcLegalGatesReadonlyProps) {
  const total = rows.length;
  const noGoCount = rows.filter(
    (row) => row.compliance_readiness_state !== "LEGAL_READY",
  ).length;
  const readyCount = rows.filter(
    (row) => row.compliance_readiness_state === "LEGAL_READY",
  ).length;
  const automationBlocked = rows.filter(
    (row) => !row.automation_allowed && !row.ai_allowed,
  ).length;
  const byDomain = countBy(rows, "domain_code");
  const byReadiness = countBy(rows, "compliance_readiness_state");

  return (
    <div
      className="space-y-6"
      data-heu-tchc-legal-gates-readonly="TCHC_LEGAL_GATE_READONLY"
      data-heu-tchc-legal-gates-boundary="READ_ONLY NO_APPROVAL NO_SIGNOFF NO_PRODUCTION_GO"
      data-heu-tchc-legal-gates-count="TCHC_LEGAL_01_THROUGH_14"
    >
      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <Gavel className="h-4 w-4" aria-hidden="true" />
                TCHC Legal Gate
              </div>
              <h2 className="mt-3 text-xl font-semibold text-zinc-950">
                Legal/SOP gates for TCHC
              </h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
                Read-only screen for PHAP_CHE, TCHC, BGH and Audit to inspect the
                14 required legal gates before any official SOP issuance,
                report-view reliance, automation, AI use or production operation.
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
              <div className="flex items-start gap-2">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  This screen cannot approve legal basis, issue SOP, accept
                  evidence, execute UAT or mark production GO.
                </span>
              </div>
            </div>
          </div>
        </div>

        {loadError ? (
          <div className="border-b border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Cannot load TCHC legal gates. Check whether
            `step117_tchc_legal_compliance_foundation.sql` has been applied.
          </div>
        ) : null}

        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total gates"
            value={formatNumber(total)}
            detail="Expected 14 legal/SOP compliance gates."
          />
          <StatCard
            label="NO-GO"
            value={formatNumber(noGoCount)}
            detail="Must stay blocked until PHAP_CHE/BGH signoff."
          />
          <StatCard
            label="Ready"
            value={formatNumber(readyCount)}
            detail="Should be 0 before official signoff and UAT."
          />
          <StatCard
            label="AI/Automation blocked"
            value={formatNumber(automationBlocked)}
            detail="AI and automation are disabled by default."
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
            <ShieldCheck className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            Quick filter by domain
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="#tchc-legal-gate-table"
              className="rounded-md border border-zinc-900 bg-zinc-900 px-3 py-2 text-xs font-medium text-white"
            >
              All {formatNumber(total)}
            </a>
            {byDomain.map(([domain, count]) => (
              <a
                key={domain}
                href={`#domain-${domain}`}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                {domainLabel(domain)} {formatNumber(count)}
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
            <FileWarning className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            Readiness state
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {byReadiness.map(([state, count]) => (
              <span
                key={state}
                className={`rounded-md border px-3 py-2 text-xs font-medium ${statusTone(
                  state,
                )}`}
              >
                {readinessLabel(state)} {formatNumber(count)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        id="tchc-legal-gate-table"
        className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
      >
        <div className="border-b border-zinc-100 p-5">
          <h3 className="text-base font-semibold text-zinc-950">
            14 TCHC legal gates
          </h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            PHAP_CHE updates legal basis and SOP in Master Control; this list is
            for inspection and operational routing only.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Gate</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Legal/SOP</th>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">Boundary</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-zinc-500" colSpan={6}>
                    No TCHC legal gates found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.compliance_code}
                    id={`domain-${row.domain_code}`}
                    className="align-top"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-zinc-950">
                        {row.compliance_code}
                      </p>
                      <p className="mt-1 max-w-xs break-words text-zinc-700">
                        {row.compliance_name}
                      </p>
                      <span className="mt-2 inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                        {domainLabel(row.domain_code)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-zinc-950">
                        {row.owner_position_name ?? row.owner_position_code}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {row.owner_position_code}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        PHAP_CHE: {row.phap_che_required ? "required" : "not set"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Audit: {row.audit_required ? "required" : "not set"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-zinc-950">{row.legal_code}</p>
                      <p className="mt-1 max-w-sm break-words text-xs leading-5 text-zinc-600">
                        {row.legal_title}
                      </p>
                      <p className="mt-3 font-medium text-zinc-950">{row.sop_code}</p>
                      <p className="mt-1 text-xs text-zinc-600">{row.sop_name}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-zinc-950">
                        {row.report_code ?? "NO_REPORT"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">{row.report_name}</p>
                      <p className="mt-2 text-xs text-zinc-500">
                        Report status: {row.report_control_status ?? "UNKNOWN"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700">
                        {row.evidence_class}
                      </span>
                      <p className="mt-3 max-w-md break-words text-xs leading-5 text-zinc-600">
                        {row.data_boundary}
                      </p>
                      <p className="mt-2 max-w-md break-words text-xs leading-5 text-red-700">
                        Stop: {row.stop_condition}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusTone(
                          row.compliance_readiness_state,
                        )}`}
                      >
                        {readinessLabel(row.compliance_readiness_state)}
                      </span>
                      <div className="mt-3 space-y-1 text-xs text-zinc-600">
                        <p>Legal: {row.legal_control_status ?? "UNKNOWN"}</p>
                        <p>SOP: {row.sop_control_status ?? "UNKNOWN"}</p>
                        <p>Gate: {row.legal_gate_decision_status ?? "UNKNOWN"}</p>
                        <p>Automation: {row.automation_allowed ? "YES" : "NO"}</p>
                        <p>AI: {row.ai_allowed ? "YES" : "NO"}</p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        <h3 className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Required next step
        </h3>
        <p className="mt-2">
          PHAP_CHE must update the actual legal basis and SOP records in Master
          Control, then BGH/TCHC/Audit sign outside Git/Codex/chat. Until then,
          all TCHC gates remain NO-GO and production stays NO-GO.
        </p>
      </section>
    </div>
  );
}
