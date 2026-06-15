import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Database,
  FileCheck2,
  GitBranch,
  ListChecks,
  ShieldAlert,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import type {
  HeuOsApprovalRow,
  HeuOsMasterDataRow,
  HeuOsModuleRow,
  HeuOsRiskRow,
  HeuOsWorkflowRow,
} from "@/components/master-control/heu-os-map-overview";
import {
  ModuleReadinessCard,
  type HeuOsModuleReadinessRow,
} from "@/components/master-control/module-readiness-overview";
import { Button } from "@/components/ui/button";
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
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ moduleCode: string }>;
};

const severityTones: Record<string, string> = {
  LOW: "border-zinc-200 bg-zinc-50 text-zinc-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
};

async function canReadMasterControl() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: currentRoleCode },
    { data: canReadPermission },
    { data: canManagePermission },
    { data: canCheckPermission },
    { data: canApprovePermission },
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("has_permission", {
      permission_name: "master_control.read",
    }),
    supabase.rpc("has_permission", {
      permission_name: "master_control.manage",
    }),
    supabase.rpc("has_permission", {
      permission_name: "master_control.check",
    }),
    supabase.rpc("has_permission", {
      permission_name: "master_control.approve",
    }),
  ]);

  const canRead =
    currentRoleCode === "ADMIN" ||
    Boolean(
      canReadPermission ||
        canManagePermission ||
        canCheckPermission ||
        canApprovePermission,
    );

  if (!canRead) {
    redirect("/");
  }

  return supabase;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500">
      {label}
    </div>
  );
}

export default async function HeuOsModuleDetailPage({ params }: PageProps) {
  const { moduleCode } = await params;
  const supabase = await canReadMasterControl();
  const decodedModuleCode = decodeURIComponent(moduleCode);

  const [
    moduleResult,
    workflowsResult,
    approvalsResult,
    masterDataResult,
    risksResult,
    readinessResult,
  ] = await Promise.all([
    supabase
      .from("heu_os_modules")
      .select(
        "id,module_code,module_name,module_group,objective,owner_department,core_policy,ai_policy,sort_order,control_status",
      )
      .eq("module_code", decodedModuleCode)
      .eq("status", "ACTIVE")
      .maybeSingle<HeuOsModuleRow>(),
    supabase
      .from("heu_os_workflows")
      .select(
        "id,workflow_code,workflow_name,module_code,trigger_event,start_role,owner_department,checker_role,approver_role,output_result,handover_rule,audit_rule,sort_order,control_status",
      )
      .eq("module_code", decodedModuleCode)
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .returns<HeuOsWorkflowRow[]>(),
    supabase
      .from("heu_os_approval_matrix")
      .select(
        "id,approval_code,module_code,workflow_code,decision_name,decision_level,maker_role,checker_role,approver_role,required_evidence,blocking_rule,sla_hours,control_status",
      )
      .eq("module_code", decodedModuleCode)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: true })
      .returns<HeuOsApprovalRow[]>(),
    supabase
      .from("heu_os_master_data_map")
      .select(
        "id,data_code,data_name,module_code,source_table,data_type,owner_department,system_of_record,sensitivity_level,ai_allowed,change_rule,control_status",
      )
      .eq("module_code", decodedModuleCode)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: true })
      .returns<HeuOsMasterDataRow[]>(),
    supabase
      .from("heu_os_risk_controls")
      .select(
        "id,risk_code,risk_name,module_code,risk_group,severity,owner_department,risk_description,control_rule,escalation_rule,dashboard_metric,control_status",
      )
      .eq("module_code", decodedModuleCode)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: true })
      .returns<HeuOsRiskRow[]>(),
    supabase
      .from("heu_os_module_readiness")
      .select(
        "id,module_code,module_name,module_group,owner_department,control_status,has_owner,workflow_count,approval_count,master_data_count,risk_count,sop_count,legal_count,has_workflow,has_approval,has_master_data,has_risk,has_sop,has_legal,readiness_score,readiness_status,missing_items,ai_gate_status",
      )
      .eq("module_code", decodedModuleCode)
      .maybeSingle<HeuOsModuleReadinessRow>(),
  ]);

  const osModule = moduleResult.data;

  if (moduleResult.error || !osModule) {
    notFound();
  }

  const moduleInfo = moduleDisplay(osModule.module_code, {
    name: osModule.module_name,
    objective: osModule.objective,
    corePolicy: osModule.core_policy,
    aiPolicy: osModule.ai_policy,
    group: osModule.module_group,
    owner: osModule.owner_department,
  });
  const workflows = workflowsResult.data ?? [];
  const approvals = approvalsResult.data ?? [];
  const masterData = masterDataResult.data ?? [];
  const risks = risksResult.data ?? [];
  const readiness = readinessResult.data;

  return (
    <AppShell
      active="master-control"
      title={moduleInfo.name}
      description={`Chi tiết Module OS ${osModule.module_code}: quy trình, điểm duyệt, dữ liệu gốc và rủi ro.`}
      actions={
        <Button asChild variant="outline">
          <Link href="/master-control">
            <ArrowLeft className="size-4" />
            Quay lại Master Control
          </Link>
        </Button>
      }
    >
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-xs text-zinc-500">
              {osModule.module_code}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{moduleInfo.name}</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
              {moduleInfo.objective}
            </p>
            <p className="mt-3 text-xs uppercase text-zinc-500">
              {moduleInfo.group} · Owner: {moduleInfo.owner}
            </p>
          </div>
          <span
            className={`rounded-md border px-3 py-2 text-xs font-medium ${statusTone(
              osModule.control_status,
            )}`}
          >
            {statusLabel(osModule.control_status)}
          </span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md bg-zinc-50 p-4">
            <div className="flex items-center gap-2 font-medium">
              <FileCheck2 className="size-4 text-zinc-600" />
              Nguyên tắc kiểm soát
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {moduleInfo.corePolicy}
            </p>
          </div>
          <div className="rounded-md bg-zinc-50 p-4">
            <div className="flex items-center gap-2 font-medium">
              <Bot className="size-4 text-zinc-600" />
              Chính sách AI
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {moduleInfo.aiPolicy}
            </p>
          </div>
        </div>
      </section>

      {readiness ? (
        <ModuleReadinessCard row={readiness} compact />
      ) : readinessResult.error ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          Chưa đọc được Module Readiness Gate P0-04. Hãy chạy file{" "}
          <span className="font-mono">
            database/step43_module_readiness_gate.sql
          </span>{" "}
          rồi tải lại trang. Chi tiết: {readinessResult.error.message}
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold">{workflows.length}</p>
          <p className="text-sm text-zinc-500">Quy trình</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold">{approvals.length}</p>
          <p className="text-sm text-zinc-500">Điểm duyệt</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold">{masterData.length}</p>
          <p className="text-sm text-zinc-500">Dữ liệu gốc</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold">{risks.length}</p>
          <p className="text-sm text-zinc-500">Rủi ro</p>
        </article>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <div className="flex items-center gap-2">
            <GitBranch className="size-4 text-zinc-600" />
            <h2 className="text-base font-semibold">Quy trình của module</h2>
          </div>
        </div>
        <div className="grid gap-4 p-5 xl:grid-cols-2">
          {workflows.length === 0 ? (
            <EmptyState label="Module này chưa có quy trình." />
          ) : (
            workflows.map((workflow) => {
              const display = workflowDisplay(workflow.workflow_code, {
                name: workflow.workflow_name,
                trigger: workflow.trigger_event,
                output: workflow.output_result,
                handover: workflow.handover_rule,
                audit: workflow.audit_rule,
              });

              return (
                <article
                  key={workflow.id}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                >
                  <p className="font-mono text-xs text-zinc-500">
                    {workflow.workflow_code}
                  </p>
                  <h3 className="mt-1 font-semibold">{display.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {display.trigger}
                  </p>
                  <dl className="mt-4 space-y-2 text-xs leading-5 text-zinc-600">
                    <div>
                      <dt className="font-medium text-zinc-900">Người làm</dt>
                      <dd>{labelToken(workflow.start_role)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-900">Kiểm / duyệt</dt>
                      <dd>
                        {labelToken(workflow.checker_role)} /{" "}
                        {labelToken(workflow.approver_role)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-900">Kết quả</dt>
                      <dd>{display.output}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-900">Bàn giao</dt>
                      <dd>{display.handover}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-900">Audit log</dt>
                      <dd>{display.audit}</dd>
                    </div>
                  </dl>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <div className="flex items-center gap-2">
              <ListChecks className="size-4 text-zinc-600" />
              <h2 className="text-base font-semibold">Điểm duyệt</h2>
            </div>
          </div>
          <div className="space-y-4 p-5">
            {approvals.length === 0 ? (
              <EmptyState label="Module này chưa có điểm duyệt." />
            ) : (
              approvals.map((approval) => {
                const display = approvalDisplay(approval.approval_code, {
                  name: approval.decision_name,
                  evidence: approval.required_evidence,
                  blocking: approval.blocking_rule,
                });

                return (
                  <article
                    key={approval.id}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <p className="font-mono text-xs text-zinc-500">
                      {approval.approval_code}
                    </p>
                    <h3 className="mt-1 font-semibold">{display.name}</h3>
                    <p className="mt-2 text-xs text-zinc-500">
                      Người làm: {labelToken(approval.maker_role)} · Kiểm:{" "}
                      {labelToken(approval.checker_role)} · Duyệt:{" "}
                      {labelToken(approval.approver_role)}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-zinc-600">
                      Minh chứng: {display.evidence}
                    </p>
                    <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                      Chặn nếu: {display.blocking}
                    </p>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-zinc-600" />
              <h2 className="text-base font-semibold">Dữ liệu gốc</h2>
            </div>
          </div>
          <div className="space-y-4 p-5">
            {masterData.length === 0 ? (
              <EmptyState label="Module này chưa khai báo dữ liệu gốc." />
            ) : (
              masterData.map((data) => {
                const display = masterDataDisplay(data.data_code, {
                  name: data.data_name,
                  changeRule: data.change_rule,
                });

                return (
                  <article
                    key={data.id}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-zinc-500">
                          {data.data_code}
                        </p>
                        <h3 className="mt-1 font-semibold">{display.name}</h3>
                      </div>
                      <span className="rounded-md bg-white px-2 py-1 text-xs text-zinc-600">
                        {typeLabel(data.sensitivity_level)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                      Bảng: {data.source_table} · Loại:{" "}
                      {typeLabel(data.data_type)} · Owner:{" "}
                      {labelToken(data.owner_department)}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {aiAllowedLabel(data.ai_allowed)}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-zinc-600">
                      {display.changeRule}
                    </p>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-zinc-600" />
            <h2 className="text-base font-semibold">Rủi ro và kiểm soát</h2>
          </div>
        </div>
        <div className="grid gap-4 p-5 xl:grid-cols-2">
          {risks.length === 0 ? (
            <EmptyState label="Module này chưa khai báo rủi ro." />
          ) : (
            risks.map((risk) => {
              const display = riskDisplay(risk.risk_code, {
                name: risk.risk_name,
                description: risk.risk_description,
                control: risk.control_rule,
                escalation: risk.escalation_rule,
              });

              return (
                <article
                  key={risk.id}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-zinc-500">
                        {risk.risk_code}
                      </p>
                      <h3 className="mt-1 font-semibold">{display.name}</h3>
                    </div>
                    <span
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${
                        severityTones[risk.severity] ?? severityTones.MEDIUM
                      }`}
                    >
                      {severityLabel(risk.severity)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {display.description}
                  </p>
                  <p className="mt-3 rounded-md bg-white p-3 text-xs leading-5 text-zinc-600">
                    Kiểm soát: {display.control}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-zinc-500">
                    Leo thang: {display.escalation}
                  </p>
                </article>
              );
            })
          )}
        </div>
      </section>
    </AppShell>
  );
}
