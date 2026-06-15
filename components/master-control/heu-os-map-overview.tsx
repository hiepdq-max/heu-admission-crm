import Link from "next/link";
import {
  Bot,
  Database,
  FileCheck2,
  GitBranch,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import {
  aiAllowedLabel,
  approvalDisplay,
  labelToken,
  masterDataDisplay,
  moduleDisplay,
  riskDisplay,
  severityLabel,
  statusLabel,
  statusTone,
  typeLabel,
  workflowDisplay,
} from "@/lib/heu-os-display";

export type HeuOsModuleRow = {
  id: string;
  module_code: string;
  module_name: string;
  module_group: string;
  objective: string;
  owner_department: string;
  core_policy: string;
  ai_policy: string;
  sort_order: number;
  control_status: string;
};

export type HeuOsWorkflowRow = {
  id: string;
  workflow_code: string;
  workflow_name: string;
  module_code: string;
  trigger_event: string;
  start_role: string;
  owner_department: string;
  checker_role: string | null;
  approver_role: string | null;
  output_result: string;
  handover_rule: string | null;
  audit_rule: string;
  sort_order: number;
  control_status: string;
};

export type HeuOsApprovalRow = {
  id: string;
  approval_code: string;
  module_code: string;
  workflow_code: string | null;
  decision_name: string;
  decision_level: string;
  maker_role: string;
  checker_role: string | null;
  approver_role: string;
  required_evidence: string;
  blocking_rule: string;
  sla_hours: number | null;
  control_status: string;
};

export type HeuOsMasterDataRow = {
  id: string;
  data_code: string;
  data_name: string;
  module_code: string;
  source_table: string;
  data_type: string;
  owner_department: string;
  system_of_record: string;
  sensitivity_level: string;
  ai_allowed: boolean;
  change_rule: string;
  control_status: string;
};

export type HeuOsRiskRow = {
  id: string;
  risk_code: string;
  risk_name: string;
  module_code: string;
  risk_group: string;
  severity: string;
  owner_department: string;
  risk_description: string;
  control_rule: string;
  escalation_rule: string;
  dashboard_metric: string | null;
  control_status: string;
};

type HeuOsMapOverviewProps = {
  modules: HeuOsModuleRow[];
  workflows: HeuOsWorkflowRow[];
  approvals: HeuOsApprovalRow[];
  masterData: HeuOsMasterDataRow[];
  risks: HeuOsRiskRow[];
  loadError?: string;
};

const severityTones: Record<string, string> = {
  LOW: "border-zinc-200 bg-zinc-50 text-zinc-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
};

function groupByModule<T extends { module_code: string }>(rows: T[]) {
  const groups = new Map<string, T[]>();

  for (const row of rows) {
    const items = groups.get(row.module_code) ?? [];
    items.push(row);
    groups.set(row.module_code, items);
  }

  return groups;
}

function SmallMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ShieldCheck;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-zinc-100">
          <Icon className="size-5 text-zinc-600" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm text-zinc-500">{label}</p>
        </div>
      </div>
    </article>
  );
}

export function HeuOsMapOverview({
  modules,
  workflows,
  approvals,
  masterData,
  risks,
  loadError,
}: HeuOsMapOverviewProps) {
  const workflowMap = groupByModule(workflows);
  const approvalMap = groupByModule(approvals);
  const dataMap = groupByModule(masterData);
  const riskMap = groupByModule(risks);

  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">Chưa có HEU OS Map P0-02</h2>
            <p className="mt-1">
              Hãy chạy file{" "}
              <span className="font-mono">database/step42_heu_os_map.sql</span>{" "}
              trong Supabase SQL Editor rồi tải lại Master Control. Chi tiết:{" "}
              {loadError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-zinc-600" />
              <h2 className="text-lg font-semibold">HEU OS Map P0-02</h2>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Bản đồ điều hành ERP/AI OS: module nào thuộc phòng nào, quy trình
              nào chạy qua ai, ai kiểm/duyệt, dữ liệu gốc nằm ở đâu, rủi ro nào
              phải chặn trước khi cho automation hoặc AI vào production.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
            Đúng luật · Đúng dữ liệu · Đúng quy trình · Đúng người duyệt
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SmallMetric label="Module OS" value={modules.length} icon={FileCheck2} />
        <SmallMetric label="Quy trình" value={workflows.length} icon={GitBranch} />
        <SmallMetric label="Điểm duyệt" value={approvals.length} icon={ListChecks} />
        <SmallMetric label="Dữ liệu gốc" value={masterData.length} icon={Database} />
        <SmallMetric label="Rủi ro kiểm soát" value={risks.length} icon={ShieldAlert} />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h3 className="text-base font-semibold">Module vận hành</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Mỗi module phải có owner, chính sách kiểm soát và chính sách AI rõ
            ràng trước khi mở rộng.
          </p>
        </div>
        <div className="grid gap-4 p-5 xl:grid-cols-2">
          {modules.length === 0 ? (
            <p className="text-sm text-zinc-500">Chưa có module HEU OS.</p>
          ) : (
            modules.map((module) => {
              const moduleWorkflows = workflowMap.get(module.module_code) ?? [];
              const moduleApprovals = approvalMap.get(module.module_code) ?? [];
              const moduleData = dataMap.get(module.module_code) ?? [];
              const moduleRisks = riskMap.get(module.module_code) ?? [];
              const display = moduleDisplay(module.module_code, {
                name: module.module_name,
                objective: module.objective,
                corePolicy: module.core_policy,
                aiPolicy: module.ai_policy,
                group: module.module_group,
                owner: module.owner_department,
              });

              return (
                <article
                  key={module.id}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-xs text-zinc-500">
                        {module.module_code}
                      </p>
                      <h4 className="mt-1 font-semibold text-zinc-950">
                        {display.name}
                      </h4>
                      <p className="mt-1 text-xs uppercase text-zinc-500">
                        {display.group} · {display.owner}
                      </p>
                    </div>
                    <span
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${statusTone(
                        module.control_status,
                      )}`}
                    >
                      {statusLabel(module.control_status)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {display.objective}
                  </p>
                  <div className="mt-4 grid gap-2 text-xs sm:grid-cols-4">
                    <span className="rounded-md bg-white px-2 py-2 text-zinc-600">
                      {moduleWorkflows.length} quy trình
                    </span>
                    <span className="rounded-md bg-white px-2 py-2 text-zinc-600">
                      {moduleApprovals.length} điểm duyệt
                    </span>
                    <span className="rounded-md bg-white px-2 py-2 text-zinc-600">
                      {moduleData.length} dữ liệu
                    </span>
                    <span className="rounded-md bg-white px-2 py-2 text-zinc-600">
                      {moduleRisks.length} rủi ro
                    </span>
                  </div>
                  <dl className="mt-4 space-y-3 text-xs leading-5 text-zinc-600">
                    <div>
                      <dt className="font-medium text-zinc-900">Control</dt>
                      <dd>{display.corePolicy}</dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1 font-medium text-zinc-900">
                        <Bot className="size-3.5" />
                        AI policy
                      </dt>
                      <dd>{display.aiPolicy}</dd>
                    </div>
                  </dl>
                  <Link
                    href={`/master-control/modules/${encodeURIComponent(
                      module.module_code,
                    )}`}
                    className="mt-4 inline-flex rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
                  >
                    Mở chi tiết module
                  </Link>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">Quy trình liên phòng</h3>
          </div>
          <div className="divide-y divide-zinc-200">
            {workflows.slice(0, 8).map((workflow) => {
              const display = workflowDisplay(workflow.workflow_code, {
                name: workflow.workflow_name,
                trigger: workflow.trigger_event,
                output: workflow.output_result,
                handover: workflow.handover_rule,
                audit: workflow.audit_rule,
              });

              return (
                <article key={workflow.id} className="p-5 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-zinc-500">
                        {workflow.workflow_code}
                      </p>
                      <h4 className="mt-1 font-semibold">{display.name}</h4>
                    </div>
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                      {workflow.module_code}
                    </span>
                  </div>
                  <p className="mt-3 leading-6 text-zinc-600">
                    {display.trigger}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Bắt đầu: {labelToken(workflow.start_role)} · Kiểm:{" "}
                    {labelToken(workflow.checker_role)} · Duyệt:{" "}
                    {labelToken(workflow.approver_role)}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Kết quả: {display.output}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">Ma trận duyệt</h3>
          </div>
          <div className="divide-y divide-zinc-200">
            {approvals.slice(0, 8).map((approval) => {
              const display = approvalDisplay(approval.approval_code, {
                name: approval.decision_name,
                evidence: approval.required_evidence,
                blocking: approval.blocking_rule,
              });

              return (
                <article key={approval.id} className="p-5 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-zinc-500">
                        {approval.approval_code}
                      </p>
                      <h4 className="mt-1 font-semibold">{display.name}</h4>
                    </div>
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                      {labelToken(approval.decision_level)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Người làm: {labelToken(approval.maker_role)} · Kiểm:{" "}
                    {labelToken(approval.checker_role)} · Duyệt:{" "}
                    {labelToken(approval.approver_role)}
                  </p>
                  <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                    Chặn nếu: {display.blocking}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">Dữ liệu gốc</h3>
          </div>
          <div className="divide-y divide-zinc-200">
            {masterData.slice(0, 8).map((data) => {
              const display = masterDataDisplay(data.data_code, {
                name: data.data_name,
                changeRule: data.change_rule,
              });

              return (
                <article key={data.id} className="p-5 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-zinc-500">
                        {data.data_code}
                      </p>
                      <h4 className="mt-1 font-semibold">{display.name}</h4>
                    </div>
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                      {typeLabel(data.sensitivity_level)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Bảng: {data.source_table} · Owner:{" "}
                    {labelToken(data.owner_department)} ·{" "}
                    {aiAllowedLabel(data.ai_allowed)}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-zinc-600">
                    {display.changeRule}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">Rủi ro và kiểm soát</h3>
          </div>
          <div className="divide-y divide-zinc-200">
            {risks.slice(0, 8).map((risk) => {
              const display = riskDisplay(risk.risk_code, {
                name: risk.risk_name,
                description: risk.risk_description,
                control: risk.control_rule,
                escalation: risk.escalation_rule,
              });

              return (
                <article key={risk.id} className="p-5 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-zinc-500">
                        {risk.risk_code}
                      </p>
                      <h4 className="mt-1 font-semibold">{display.name}</h4>
                    </div>
                    <span
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${
                        severityTones[risk.severity] ?? severityTones.MEDIUM
                      }`}
                    >
                      {severityLabel(risk.severity)}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-zinc-600">
                    {display.description}
                  </p>
                  <p className="mt-3 rounded-md bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">
                    Kiểm soát: {display.control}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </section>
  );
}
