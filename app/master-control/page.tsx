import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import {
  ApprovalGateEnforcement,
  type ApprovalGateEnforcementRow,
  type ApprovalGateEnforcementSummaryRow,
} from "@/components/master-control/approval-gate-enforcement";
import {
  HeuOsMapOverview,
  type HeuOsApprovalRow,
  type HeuOsMasterDataRow,
  type HeuOsModuleRow,
  type HeuOsRiskRow,
  type HeuOsWorkflowRow,
} from "@/components/master-control/heu-os-map-overview";
import {
  ModuleReadinessOverview,
  type HeuOsModuleReadinessRow,
} from "@/components/master-control/module-readiness-overview";
import {
  MasterControlOverview,
  type DataDictionaryFieldRow,
  type DataDictionaryTableRow,
  type DecisionGateRow,
  type LegalRegistryRow,
  type SopRegistryRow,
} from "@/components/master-control/master-control-overview";
import { createClient } from "@/lib/supabase/server";

type MasterControlPageProps = {
  searchParams?: Promise<{
    legal_created?: string;
    legal_updated?: string;
    sop_created?: string;
    sop_updated?: string;
    data_table_created?: string;
    data_field_created?: string;
    decision_created?: string;
    decision_updated?: string;
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  not_allowed: "Bạn chưa có quyền thao tác Master Control.",
  missing_legal_data: "Thiếu mã hoặc tên căn cứ pháp chế.",
  missing_sop_data: "Thiếu mã SOP, tên SOP hoặc module.",
  missing_data_table: "Thiếu mã bảng, tên bảng hoặc module.",
  missing_data_field: "Thiếu bảng, mã cột hoặc tên cột.",
  missing_decision_gate: "Thiếu thông tin decision gate.",
};

function getMessage(params: Awaited<MasterControlPageProps["searchParams"]>) {
  if (params?.legal_created) return "Đã thêm căn cứ pháp chế.";
  if (params?.legal_updated) return "Đã cập nhật căn cứ pháp chế.";
  if (params?.sop_created) return "Đã thêm SOP.";
  if (params?.sop_updated) return "Đã cập nhật SOP.";
  if (params?.data_table_created) return "Đã thêm bảng data dictionary.";
  if (params?.data_field_created) return "Đã thêm cột data dictionary.";
  if (params?.decision_created) return "Đã tạo decision gate.";
  if (params?.decision_updated) return "Đã cập nhật decision gate.";
  return undefined;
}

export default async function MasterControlPage({
  searchParams,
}: MasterControlPageProps) {
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

  const canManage = currentRoleCode === "ADMIN" || Boolean(canManagePermission);
  const canApprove =
    currentRoleCode === "ADMIN" || Boolean(canApprovePermission);
  const params = await searchParams;

  const [
    { data: legalRows, error: legalError },
    { data: sopRows, error: sopError },
    { data: dataTables, error: dataTablesError },
    { data: dataFields, error: dataFieldsError },
    { data: decisionGates, error: decisionGatesError },
    { data: heuOsModules, error: heuOsModulesError },
    { data: heuOsWorkflows, error: heuOsWorkflowsError },
    { data: heuOsApprovals, error: heuOsApprovalsError },
    { data: heuOsMasterData, error: heuOsMasterDataError },
    { data: heuOsRisks, error: heuOsRisksError },
    { data: moduleReadiness, error: moduleReadinessError },
    { data: approvalGateRows, error: approvalGateRowsError },
    { data: approvalGateSummary, error: approvalGateSummaryError },
  ] = await Promise.all([
    supabase
      .from("legal_registry")
      .select(
        "id,legal_code,title,source_type,issuing_authority,document_no,issued_on,effective_from,effective_to,source_url,file_url,scope_note,owner_department,checker,approver,control_status",
      )
      .order("created_at", { ascending: false })
      .returns<LegalRegistryRow[]>(),
    supabase
      .from("sop_registry")
      .select(
        "id,sop_code,sop_name,module_code,objective,owner_department,checker_role,approver_role,legal_registry_id,input_note,output_note,risk_note,control_note,file_url,effective_from,control_status",
      )
      .order("created_at", { ascending: false })
      .returns<SopRegistryRow[]>(),
    supabase
      .from("data_dictionary_tables")
      .select(
        "id,table_code,table_name,module_code,table_type,data_owner_department,purpose,sensitivity_level,ai_allowed,control_status",
      )
      .order("created_at", { ascending: false })
      .returns<DataDictionaryTableRow[]>(),
    supabase
      .from("data_dictionary_fields")
      .select(
        "id,table_id,field_code,field_name,data_type,is_required,is_unique,is_sensitive,ai_allowed,validation_rule,note,control_status",
      )
      .order("created_at", { ascending: false })
      .returns<DataDictionaryFieldRow[]>(),
    supabase
      .from("decision_gates")
      .select(
        "id,gate_code,gate_name,gate_type,entity_type,entity_code,owner_department,checker_note,approver_note,evidence_url,decision_status,due_at,decided_at",
      )
      .eq("record_status", "ACTIVE")
      .order("created_at", { ascending: false })
      .returns<DecisionGateRow[]>(),
    supabase
      .from("heu_os_modules")
      .select(
        "id,module_code,module_name,module_group,objective,owner_department,core_policy,ai_policy,sort_order,control_status",
      )
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .returns<HeuOsModuleRow[]>(),
    supabase
      .from("heu_os_workflows")
      .select(
        "id,workflow_code,workflow_name,module_code,trigger_event,start_role,owner_department,checker_role,approver_role,output_result,handover_rule,audit_rule,sort_order,control_status",
      )
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .returns<HeuOsWorkflowRow[]>(),
    supabase
      .from("heu_os_approval_matrix")
      .select(
        "id,approval_code,module_code,workflow_code,decision_name,decision_level,maker_role,checker_role,approver_role,required_evidence,blocking_rule,sla_hours,control_status",
      )
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: true })
      .returns<HeuOsApprovalRow[]>(),
    supabase
      .from("heu_os_master_data_map")
      .select(
        "id,data_code,data_name,module_code,source_table,data_type,owner_department,system_of_record,sensitivity_level,ai_allowed,change_rule,control_status",
      )
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: true })
      .returns<HeuOsMasterDataRow[]>(),
    supabase
      .from("heu_os_risk_controls")
      .select(
        "id,risk_code,risk_name,module_code,risk_group,severity,owner_department,risk_description,control_rule,escalation_rule,dashboard_metric,control_status",
      )
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: true })
      .returns<HeuOsRiskRow[]>(),
    supabase
      .from("heu_os_module_readiness")
      .select(
        "id,module_code,module_name,module_group,owner_department,control_status,has_owner,workflow_count,approval_count,master_data_count,risk_count,sop_count,legal_count,has_workflow,has_approval,has_master_data,has_risk,has_sop,has_legal,readiness_score,readiness_status,missing_items,ai_gate_status",
      )
      .order("readiness_score", { ascending: false })
      .returns<HeuOsModuleReadinessRow[]>(),
    supabase
      .from("approval_gate_enforcement_status")
      .select(
        "id,approval_code,module_code,module_name,workflow_code,workflow_name,decision_name,decision_level,maker_role,checker_role,approver_role,required_evidence,blocking_rule,sla_hours,control_status,gate_code,gate_status,decided_by,decided_at,open_request_count,approved_request_count,has_checker_role,has_approver_role,has_required_evidence,has_blocking_rule,has_audit_rule,has_decision_gate,has_approved_gate,missing_items,enforcement_status",
      )
      .order("enforcement_status", { ascending: true })
      .returns<ApprovalGateEnforcementRow[]>(),
    supabase
      .from("approval_gate_enforcement_summary")
      .select(
        "approval_count,ready_count,needs_approval_count,needs_fix_count,blocked_count,open_request_count,approved_request_count",
      )
      .maybeSingle<ApprovalGateEnforcementSummaryRow>(),
  ]);

  const error = params?.error
    ? errorMessages[params.error] ?? decodeURIComponent(params.error)
    : undefined;

  return (
    <AppShell
      active="master-control"
      title="Master Control"
      description="Legal Registry, SOP Registry, Data Dictionary và Decision Gate cho HEU OS."
    >
      <div className="space-y-6">
        <ModuleReadinessOverview
          rows={moduleReadiness ?? []}
          loadError={moduleReadinessError?.message}
        />
        <ApprovalGateEnforcement
          rows={approvalGateRows ?? []}
          summary={approvalGateSummary}
          loadError={
            approvalGateRowsError?.message ?? approvalGateSummaryError?.message
          }
        />
        <HeuOsMapOverview
          modules={heuOsModules ?? []}
          workflows={heuOsWorkflows ?? []}
          approvals={heuOsApprovals ?? []}
          masterData={heuOsMasterData ?? []}
          risks={heuOsRisks ?? []}
          loadError={
            heuOsModulesError?.message ??
            heuOsWorkflowsError?.message ??
            heuOsApprovalsError?.message ??
            heuOsMasterDataError?.message ??
            heuOsRisksError?.message
          }
        />
        <MasterControlOverview
          legalRows={legalRows ?? []}
          sopRows={sopRows ?? []}
          dataTables={dataTables ?? []}
          dataFields={dataFields ?? []}
          decisionGates={decisionGates ?? []}
          canManage={canManage}
          canApprove={canApprove}
          message={getMessage(params)}
          error={error}
          loadError={
            legalError?.message ??
            sopError?.message ??
            dataTablesError?.message ??
            dataFieldsError?.message ??
            decisionGatesError?.message
          }
        />
      </div>
    </AppShell>
  );
}
