import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import {
  ApprovalGateEnforcement,
  type ApprovalGateEnforcementRow,
  type ApprovalGateEnforcementSummaryRow,
} from "@/components/master-control/approval-gate-enforcement";
import {
  EvidenceDocumentControl,
  type EvidenceDocumentRow,
  type EvidenceDocumentSummaryRow,
  type EvidenceRequestOptionRow,
} from "@/components/master-control/evidence-document-control";
import {
  WorkflowRequestEngine,
  type WorkflowApprovalOptionRow,
  type WorkflowRequestRow,
  type WorkflowRequestSummaryRow,
} from "@/components/master-control/workflow-request-engine";
import {
  HeuOsMapOverview,
  type HeuOsApprovalRow,
  type HeuOsMasterDataRow,
  type HeuOsModuleRow,
  type HeuOsRiskRow,
  type HeuOsWorkflowRow,
} from "@/components/master-control/heu-os-map-overview";
import {
  HeuOsVisualNavigationMap,
  type HeuOsNavigationNodeRow,
  type HeuOsNavigationSummaryRow,
} from "@/components/master-control/heu-os-visual-navigation-map";
import {
  MasterDataGovernance,
  type MasterDataChangeRequestRow,
  type MasterDataGovernanceRow,
  type MasterDataGovernanceSummaryRow,
  type MasterDataModuleOptionRow,
} from "@/components/master-control/master-data-governance";
import {
  ModuleReadinessOverview,
  type HeuOsModuleReadinessRow,
} from "@/components/master-control/module-readiness-overview";
import {
  ProcessOwnershipMatrix,
  type ProcessOwnershipRow,
  type ProcessOwnershipSummaryRow,
} from "@/components/master-control/process-ownership-matrix";
import { ProductionReadinessBlockerSummary } from "@/components/master-control/production-readiness-blocker-summary";
import {
  RolePermissionDelegationMatrix,
  type PermissionDelegationRow,
  type PermissionModuleOptionRow,
  type PermissionRegistryRow,
  type PermissionUserOptionRow,
  type RolePermissionDelegationSummaryRow,
  type UserPermissionMatrixRow,
} from "@/components/master-control/role-permission-delegation-matrix";
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
    workflow_request_created?: string;
    workflow_request_updated?: string;
    evidence_created?: string;
    evidence_updated?: string;
    master_data_created?: string;
    master_data_updated?: string;
    master_data_request_created?: string;
    master_data_request_updated?: string;
    permission_registry_updated?: string;
    permission_delegation_created?: string;
    permission_delegation_updated?: string;
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  missing_workflow_request: "Thiếu thông tin workflow request.",
  invalid_workflow_request_status: "Trạng thái workflow request không hợp lệ.",
  not_allowed_workflow_request:
    "Bạn chưa có quyền tạo, kiểm hoặc duyệt workflow request.",
  not_allowed: "Bạn chưa có quyền thao tác Master Control.",
  missing_legal_data: "Thiếu mã hoặc tên căn cứ pháp chế.",
  missing_sop_data: "Thiếu mã SOP, tên SOP hoặc module.",
  missing_data_table: "Thiếu mã bảng, tên bảng hoặc module.",
  missing_data_field: "Thiếu bảng, mã cột hoặc tên cột.",
  missing_decision_gate: "Thiếu thông tin decision gate.",
  missing_evidence_document: "Thiếu thông tin minh chứng.",
  invalid_evidence_url: "Link minh chứng cần bắt đầu bằng http:// hoặc https://.",
  invalid_evidence_status: "Trạng thái minh chứng không hợp lệ.",
  not_allowed_evidence: "Bạn chưa có quyền tạo hoặc kiểm minh chứng.",
  missing_master_data_governance: "Thiếu thông tin dữ liệu gốc.",
  missing_master_data_request: "Thiếu thông tin yêu cầu thay đổi dữ liệu gốc.",
  invalid_master_data_json:
    "Giá trị hiện tại/đề xuất cần là JSON hợp lệ, ví dụ {\"name\":\"ABC\"}.",
  invalid_master_data_request_status:
    "Trạng thái yêu cầu thay đổi dữ liệu gốc không hợp lệ.",
  not_allowed_master_data: "Bạn chưa có quyền thao tác dữ liệu gốc.",
  missing_permission_registry: "Thiếu thông tin registry quyền.",
  missing_permission_delegation: "Thiếu thông tin ủy quyền.",
  invalid_permission_delegation_user:
    "Người ủy quyền và người nhận quyền không được trùng nhau.",
  invalid_permission_delegation_time:
    "Thời gian ủy quyền không hợp lệ. Thời điểm kết thúc phải sau thời điểm bắt đầu.",
  invalid_permission_delegation_status: "Trạng thái ủy quyền không hợp lệ.",
  not_allowed_permission_matrix: "Bạn chưa có quyền thao tác ma trận quyền.",
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
  if (params?.workflow_request_created) return "Đã tạo workflow request.";
  if (params?.workflow_request_updated) return "Đã cập nhật workflow request.";
  if (params?.evidence_created) return "Đã thêm minh chứng.";
  if (params?.evidence_updated) return "Đã cập nhật minh chứng.";
  if (params?.master_data_created) return "Đã đăng ký dữ liệu gốc.";
  if (params?.master_data_updated) return "Đã cập nhật governance dữ liệu gốc.";
  if (params?.master_data_request_created)
    return "Đã tạo yêu cầu thay đổi dữ liệu gốc.";
  if (params?.master_data_request_updated)
    return "Đã cập nhật yêu cầu thay đổi dữ liệu gốc.";
  if (params?.permission_registry_updated) return "Đã cập nhật registry quyền.";
  if (params?.permission_delegation_created) return "Đã tạo ủy quyền.";
  if (params?.permission_delegation_updated) return "Đã cập nhật ủy quyền.";
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
  const canCheck = currentRoleCode === "ADMIN" || Boolean(canCheckPermission);
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
    { data: navigationRows, error: navigationRowsError },
    { data: navigationSummary, error: navigationSummaryError },
    { data: approvalGateRows, error: approvalGateRowsError },
    { data: approvalGateSummary, error: approvalGateSummaryError },
    { data: workflowRequestRows, error: workflowRequestRowsError },
    { data: workflowRequestSummary, error: workflowRequestSummaryError },
    { data: evidenceRows, error: evidenceRowsError },
    { data: evidenceSummary, error: evidenceSummaryError },
    { data: masterDataGovernanceRows, error: masterDataGovernanceRowsError },
    { data: masterDataGovernanceSummary, error: masterDataGovernanceSummaryError },
    { data: masterDataChangeRequests, error: masterDataChangeRequestsError },
    { data: permissionRegistryRows, error: permissionRegistryRowsError },
    { data: userPermissionRows, error: userPermissionRowsError },
    { data: permissionDelegationRows, error: permissionDelegationRowsError },
    { data: permissionDelegationSummary, error: permissionDelegationSummaryError },
    { data: processOwnershipRows, error: processOwnershipRowsError },
    { data: processOwnershipSummary, error: processOwnershipSummaryError },
    { data: userOptionRows, error: userOptionRowsError },
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
      .from("heu_os_visual_navigation_status")
      .select(
        "id,node_code,node_name,node_group,module_code,href,summary,owner_department,primary_action,sort_order,is_core,requires_attention_rule,control_status,module_name,module_group,readiness_score,readiness_status,missing_items,ai_gate_status,attention_count,visual_status",
      )
      .order("sort_order", { ascending: true })
      .returns<HeuOsNavigationNodeRow[]>(),
    supabase
      .from("heu_os_visual_navigation_summary")
      .select(
        "node_count,ready_count,temp_ready_count,needs_fix_count,blocked_count,core_count",
      )
      .maybeSingle<HeuOsNavigationSummaryRow>(),
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
    supabase
      .from("workflow_request_engine_status")
      .select(
        "id,request_code,request_title,approval_code,decision_name,decision_level,module_code,module_name,workflow_code,workflow_name,maker_role,checker_role,approver_role,required_evidence,blocking_rule,sla_hours,entity_type,entity_id,entity_code,request_note,evidence_url,maker_note,checker_note,approver_note,request_status,requested_by,requested_by_name,requested_by_email,checked_by,checked_by_name,approved_by,approved_by_name,rejected_by,rejected_by_name,due_at,checked_at,approved_at,rejected_at,created_at,updated_at,is_overdue,request_flags,next_action",
      )
      .order("created_at", { ascending: false })
      .returns<WorkflowRequestRow[]>(),
    supabase
      .from("workflow_request_engine_summary")
      .select(
        "request_count,draft_count,pending_check_count,checked_count,approved_count,rejected_count,needs_fix_count,overdue_count",
      )
      .maybeSingle<WorkflowRequestSummaryRow>(),
    supabase
      .from("evidence_document_control_status")
      .select(
        "id,evidence_code,evidence_title,evidence_type,entity_type,entity_id,entity_code,lead_id,lead_code,student_name,approval_request_id,request_code,request_title,file_url,file_name,file_mime_hint,file_date,storage_provider,confidentiality,document_status,verification_note,checked_by,checked_by_name,checked_at,note,created_by,created_by_name,created_at,updated_at,control_flags,control_status",
      )
      .order("created_at", { ascending: false })
      .returns<EvidenceDocumentRow[]>(),
    supabase
      .from("evidence_document_control_summary")
      .select(
        "evidence_count,ready_count,waiting_check_count,needs_fix_count,blocked_count,sensitive_count",
      )
      .maybeSingle<EvidenceDocumentSummaryRow>(),
    supabase
      .from("master_data_governance_status")
      .select(
        "id,master_code,master_name,module_code,module_name,source_table,data_domain,owner_department,steward_role,approval_required,checker_role,approver_role,sensitivity_level,change_frequency,ai_allowed,duplicate_rule,effective_date_required,audit_required,evidence_required,scope_rule,control_note,control_status,created_by,created_by_name,updated_by,updated_by_name,created_at,updated_at,open_request_count,approved_request_count,needs_fix_request_count,control_flags,governance_status",
      )
      .order("governance_status", { ascending: true })
      .returns<MasterDataGovernanceRow[]>(),
    supabase
      .from("master_data_governance_summary")
      .select(
        "master_count,ready_count,temp_ready_count,needs_evidence_count,needs_fix_count,blocked_count,ai_allowed_count,open_request_count",
      )
      .maybeSingle<MasterDataGovernanceSummaryRow>(),
    supabase
      .from("master_data_change_request_status")
      .select(
        "id,request_code,governance_id,master_code,master_name,source_table,change_type,target_record_id,target_record_code,change_title,current_value,proposed_value,request_reason,evidence_url,request_status,requested_by,requested_by_name,checked_by,checked_by_name,checked_at,approved_by,approved_by_name,approved_at,applied_by,applied_by_name,applied_at,rejection_reason,created_at,updated_at,request_flags,request_control_status",
      )
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<MasterDataChangeRequestRow[]>(),
    supabase
      .from("permission_registry_status")
      .select(
        "id,permission_code,permission_group,permission_label,module_code,module_name,owner_department,risk_level,grant_scope,requires_scope,requires_approval,allow_delegation,max_delegation_hours,ai_allowed,control_note,control_status,role_count,user_count,active_delegation_count,control_flags,registry_status",
      )
      .order("permission_group", { ascending: true })
      .returns<PermissionRegistryRow[]>(),
    supabase
      .from("user_permission_matrix_status")
      .select(
        "id,email,full_name,status,role_id,role_code,role_name,department_id,department_code,department_name,manager_id,manager_name,role_permission_count,high_risk_permission_count,critical_permission_count,broad_permission_count,segment_scope_count,partner_scope_count,active_delegation_count,expired_delegation_count,control_flags,permission_status",
      )
      .order("permission_status", { ascending: true })
      .returns<UserPermissionMatrixRow[]>(),
    supabase
      .from("permission_delegation_status")
      .select(
        "id,delegation_code,from_user_id,from_user_name,from_user_email,from_role_code,to_user_id,to_user_name,to_user_email,to_role_code,permission_code,permission_label,permission_group,risk_level,allow_delegation,max_delegation_hours,delegation_reason,scope_note,starts_at,ends_at,delegation_status,requested_by,requested_by_name,approved_by,approved_by_name,approved_at,revoked_by,revoked_by_name,revoked_at,note,created_at,updated_at,effective_status,control_flags",
      )
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<PermissionDelegationRow[]>(),
    supabase
      .from("role_permission_delegation_summary")
      .select(
        "permission_count,role_permission_count,user_count,ready_user_count,high_risk_user_count,delegated_user_count,active_delegation_count,expired_delegation_count,permission_needs_fix_count",
      )
      .maybeSingle<RolePermissionDelegationSummaryRow>(),
    supabase
      .from("process_ownership_matrix_status")
      .select(
        "id,ownership_code,process_name,module_code,module_name,workflow_code,workflow_name,entity_type,source_table,owner_department,maker_role,checker_role,approver_role,viewer_scope,handover_from_department,handover_to_department,required_evidence,audit_rule,sla_hours,risk_level,control_status,control_flags,ownership_status",
      )
      .order("ownership_status", { ascending: true })
      .order("risk_level", { ascending: false })
      .returns<ProcessOwnershipRow[]>(),
    supabase
      .from("process_ownership_matrix_summary")
      .select(
        "process_count,ready_count,temp_ready_count,needs_fix_count,blocked_count,high_risk_count,missing_approver_count",
      )
      .maybeSingle<ProcessOwnershipSummaryRow>(),
    supabase
      .from("users_profile")
      .select("id,full_name,email")
      .eq("status", "ACTIVE")
      .order("full_name", { ascending: true })
      .returns<PermissionUserOptionRow[]>(),
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
        <ProductionReadinessBlockerSummary />
        <HeuOsVisualNavigationMap
          rows={navigationRows ?? []}
          summary={navigationSummary}
          loadError={navigationRowsError?.message ?? navigationSummaryError?.message}
        />
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
        <WorkflowRequestEngine
          rows={workflowRequestRows ?? []}
          summary={workflowRequestSummary}
          approvalOptions={(heuOsApprovals ?? []).map(
            (approval): WorkflowApprovalOptionRow => ({
              approval_code: approval.approval_code,
              decision_name: approval.decision_name,
              module_code: approval.module_code,
              workflow_code: approval.workflow_code,
              required_evidence: approval.required_evidence,
              blocking_rule: approval.blocking_rule,
              control_status: approval.control_status,
            }),
          )}
          canCreate={canManage}
          canCheck={canCheck || canManage}
          canApprove={canApprove}
          loadError={
            workflowRequestRowsError?.message ??
            workflowRequestSummaryError?.message
          }
        />
        <EvidenceDocumentControl
          rows={evidenceRows ?? []}
          summary={evidenceSummary}
          requestOptions={(workflowRequestRows ?? []).map(
            (request): EvidenceRequestOptionRow => ({
              id: request.id,
              request_code: request.request_code,
              request_title: request.request_title,
              request_status: request.request_status,
            }),
          )}
          canCreate={canManage}
          canCheck={canCheck || canManage}
          loadError={evidenceRowsError?.message ?? evidenceSummaryError?.message}
        />
        <MasterDataGovernance
          rows={masterDataGovernanceRows ?? []}
          requests={masterDataChangeRequests ?? []}
          summary={masterDataGovernanceSummary}
          moduleOptions={(heuOsModules ?? []).map(
            (module): MasterDataModuleOptionRow => ({
              module_code: module.module_code,
              module_name: module.module_name,
            }),
          )}
          canManage={canManage}
          canCheck={canCheck || canManage}
          canApprove={canApprove}
          loadError={
            masterDataGovernanceRowsError?.message ??
            masterDataGovernanceSummaryError?.message ??
            masterDataChangeRequestsError?.message
          }
        />
        <RolePermissionDelegationMatrix
          permissions={permissionRegistryRows ?? []}
          users={userPermissionRows ?? []}
          delegations={permissionDelegationRows ?? []}
          summary={permissionDelegationSummary}
          userOptions={userOptionRows ?? []}
          moduleOptions={(heuOsModules ?? []).map(
            (module): PermissionModuleOptionRow => ({
              module_code: module.module_code,
              module_name: module.module_name,
            }),
          )}
          canManage={canManage}
          canApprove={canApprove || canManage}
          canRevoke={canApprove || canManage}
          loadError={
            permissionRegistryRowsError?.message ??
            userPermissionRowsError?.message ??
            permissionDelegationRowsError?.message ??
            permissionDelegationSummaryError?.message ??
            userOptionRowsError?.message
          }
        />
        <ProcessOwnershipMatrix
          rows={processOwnershipRows ?? []}
          summary={processOwnershipSummary}
          loadError={
            processOwnershipRowsError?.message ??
            processOwnershipSummaryError?.message
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
