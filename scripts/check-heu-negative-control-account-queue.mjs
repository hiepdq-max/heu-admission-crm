import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env.local");
const negativeQueueDocPath =
  "docs/HEU_NEGATIVE_CONTROL_ACCOUNT_QUEUE_20260703.md";
const requiredEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const privilegedRoleCodes = new Set([
  "ADMIN",
  "BGH",
  "HIEU_TRUONG",
  "PHO_HIEU_TRUONG",
]);
const targetSegmentCodes = {
  ttgdtx: "TC9_TTGDTX_LINKED",
  hou: "UNIVERSITY_TRANSFER_HOU",
};
const statuses = [];

function addStatus(code, status, detail) {
  statuses.push({ code, status, detail });
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const env = {};
  const contents = readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }

  return env;
}

function isMeaningfulSecret(value) {
  return (
    typeof value === "string" &&
    value.length > 20 &&
    !/your|todo|changeme|placeholder/i.test(value)
  );
}

function formatNegativeOwnerActionPacket({
  ttgdtxCandidates,
  ttgdtxSegmentId,
  activeNonPrivilegedWithoutLeadVisibility,
  nonPrivilegedBroadVisibility,
}) {
  const requiredDecisions = [
    activeNonPrivilegedWithoutLeadVisibility.length > 0
      ? "repair_scope_baseline_first"
      : null,
    ttgdtxCandidates.length === 0 ? "create_or_link_negative_account" : null,
    ttgdtxCandidates.length === 0 ? "assign_non_target_business_scope" : null,
    "run_browser_denial_evidence",
    "record_controlled_evidence_id",
  ].filter(Boolean);

  return [
    "owner_action_packet=target_account_label=REAL_OUT_OF_SCOPE_NEGATIVE_01",
    `target_segment=${targetSegmentCodes.ttgdtx}`,
    `target_segment_present=${ttgdtxSegmentId ? "yes" : "no"}`,
    `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
    `baseline_missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    `non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}`,
    `required_decisions=${requiredDecisions.join(",")}`,
    "repair_order=USER-SCOPE-REPAIR-01 before ACCT-NEG-02 before ACCT-NEG-04 before ACCT-NEG-05",
    "packet is owner-side routing only and does not create accounts",
  ].join("; ");
}

function formatScopeRepairOwnerPacketLock({
  activeNonPrivilegedWithoutLeadVisibility,
  activeNonPrivilegedWithoutBusinessScope,
  roleById,
}) {
  const profilesById = new Map();

  for (const profile of activeNonPrivilegedWithoutLeadVisibility) {
    profilesById.set(profile.id, profile);
  }

  for (const profile of activeNonPrivilegedWithoutBusinessScope) {
    profilesById.set(profile.id, profile);
  }

  const roleCodes = Array.from(
    new Set(
      Array.from(profilesById.values()).map(
        (profile) => roleById.get(profile.role_id)?.code ?? "NO_ROLE",
      ),
    ),
  ).sort((left, right) => left.localeCompare(right));

  return [
    "scope_repair_owner_packet_lock=ACCT-00_SCOPE_REPAIR_OWNER_PACKET_LOCK",
    `profile_count=${profilesById.size}`,
    `decision_count=${
      activeNonPrivilegedWithoutLeadVisibility.length +
      activeNonPrivilegedWithoutBusinessScope.length
    }`,
    `role_codes=${roleCodes.length > 0 ? roleCodes.join(",") : "none"}`,
    "required_inputs=safe_owner_repair_labels_generated,owner_action_packet_generated,role_codes_recorded,decision_count_recorded,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded",
    "required_dependency_record=safe_label,role_code,owner_label_mapped,owner_lane_confirmed,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded",
    "blocked_if=safe_owner_repair_labels_missing,owner_action_packet_missing,role_codes_missing,decision_count_mismatch,owner_label_unmapped,secure_owner_lookup_channel_missing,controlled_evidence_id_missing,raw_profile_id_present",
    "next_allowed_step=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX",
    "source=negative_control_account_queue_runtime",
    "no_raw_profile_id=true",
    "no_email_or_phone=true",
    "no_password_or_invite_link=true",
    "no_service_role_key_in_evidence=true",
    "no_auto_scope_change=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatScopeRepairOwnerDecisionMatrix({
  activeNonPrivilegedWithoutLeadVisibility,
  activeNonPrivilegedWithoutBusinessScope,
  roleById,
}) {
  const profilesById = new Map();

  for (const profile of activeNonPrivilegedWithoutLeadVisibility) {
    profilesById.set(profile.id, profile);
  }

  for (const profile of activeNonPrivilegedWithoutBusinessScope) {
    profilesById.set(profile.id, profile);
  }

  const roleCodes = Array.from(
    new Set(
      Array.from(profilesById.values()).map(
        (profile) => roleById.get(profile.role_id)?.code ?? "NO_ROLE",
      ),
    ),
  ).sort((left, right) => left.localeCompare(right));

  return [
    "scope_repair_owner_decision_matrix=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX",
    `profile_count=${profilesById.size}`,
    `decision_count=${
      activeNonPrivilegedWithoutLeadVisibility.length +
      activeNonPrivilegedWithoutBusinessScope.length
    }`,
    `role_codes=${roleCodes.length > 0 ? roleCodes.join(",") : "none"}`,
    "required_owner_record=owner_label_mapped,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded",
    "required_per_label_record=safe_label,role_code,approved_visibility_choice_when_required,approved_segment_or_partner_scope_when_required,owner_reviewer,controlled_evidence_id",
    "blocked_if=owner_label_unmapped,required_visibility_choice_missing,required_business_scope_choice_missing,secure_admin_channel_missing,controlled_evidence_id_missing",
    "next_allowed_step=ACCT-00_SCOPE_BASELINE_OWNER_DECISION",
    "source=negative_control_account_queue_runtime",
    "no_raw_profile_id=true",
    "no_email_or_phone=true",
    "no_password_or_invite_link=true",
    "no_service_role_key_in_evidence=true",
    "no_auto_scope_change=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatScopeBaselineDecisionChecklist({
  activeNonPrivilegedWithoutLeadVisibility,
  activeNonPrivilegedWithoutBusinessScope,
  nonPrivilegedBroadVisibility,
  workspaceMismatch,
}) {
  return [
    "scope_decision_checklist=ACCT-00_SCOPE_BASELINE_OWNER_DECISION",
    `missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    `missing_business_scope=${activeNonPrivilegedWithoutBusinessScope.length}`,
    `non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    "required_closure=lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,post_repair_snapshot_recorded",
    "no_all_visibility_for_non_admin=true",
    "no_password_or_invite_link=true",
    "no_auto_scope_change=true",
    "source=negative_control_account_queue_runtime",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatScopeRepairDecisionDependencyLock({
  activeNonPrivilegedWithoutLeadVisibility,
  activeNonPrivilegedWithoutBusinessScope,
  nonPrivilegedBroadVisibility,
  workspaceMismatch,
}) {
  return [
    "scope_repair_decision_dependency_lock=ACCT-00_SCOPE_REPAIR_DECISION_DEPENDENCY",
    `missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    `missing_business_scope=${activeNonPrivilegedWithoutBusinessScope.length}`,
    `non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    "required_inputs=scope_baseline_decision_checklist_closed,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded",
    "required_dependency_record=approved_visibility_choice_recorded,approved_business_scope_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded",
    "blocked_if=scope_baseline_decision_checklist_closed=no,owner_lane_confirmed=no,lead_visibility_choice_recorded=no,business_scope_choice_recorded=no,secure_admin_channel_recorded=no",
    "next_allowed_step=ACCT-00_SCOPE_REPAIR_EXECUTION",
    "source=negative_control_account_queue_runtime",
    "no_all_visibility_for_non_admin=true",
    "no_password_or_invite_link=true",
    "no_raw_profile_id=true",
    "no_service_role_key_in_evidence=true",
    "no_auto_scope_change=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatScopeRepairExecutionPacket({
  activeNonPrivilegedWithoutLeadVisibility,
  activeNonPrivilegedWithoutBusinessScope,
  nonPrivilegedBroadVisibility,
  workspaceMismatch,
}) {
  return [
    "scope_repair_execution_packet=ACCT-00_SCOPE_REPAIR_EXECUTION",
    `missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    `missing_business_scope=${activeNonPrivilegedWithoutBusinessScope.length}`,
    `non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    "required_inputs=owner_lane_confirmed,lead_visibility_choice_recorded,business_scope_choice_recorded,secure_admin_channel_recorded",
    "required_execution_record=pre_repair_snapshot_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_verified,post_repair_snapshot_recorded,controlled_evidence_id_recorded",
    "source=negative_control_account_queue_runtime",
    "no_all_visibility_for_non_admin=true",
    "no_password_or_invite_link=true",
    "no_raw_profile_id=true",
    "no_service_role_key_in_evidence=true",
    "no_auto_scope_change=true",
    "no_auto_uat_approval=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatScopePostRepairRerunProofPacket({
  activeNonPrivilegedWithoutLeadVisibility,
  activeNonPrivilegedWithoutBusinessScope,
  nonPrivilegedBroadVisibility,
  workspaceMismatch,
}) {
  const scopeBaselineClosed =
    activeNonPrivilegedWithoutLeadVisibility.length === 0 &&
    activeNonPrivilegedWithoutBusinessScope.length === 0 &&
    nonPrivilegedBroadVisibility.length === 0 &&
    workspaceMismatch.length === 0;

  return [
    "scope_post_repair_rerun_proof_packet=ACCT-00_SCOPE_POST_REPAIR_RERUN_PROOF",
    `missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    `missing_business_scope=${activeNonPrivilegedWithoutBusinessScope.length}`,
    `non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    `scope_baseline_closed=${scopeBaselineClosed ? "yes" : "no"}`,
    "required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded,owner_lane_confirmed",
    "required_rerun_record=check_heu_user_scope_baseline_repair_queue_rerun,check_heu_negative_control_account_queue_rerun,check_heu_finance_payment_scope_readiness_rerun,check_heu_role_scope_uat_pack_rerun,check_heu_user_account_security_rerun",
    "required_result_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates_recomputed,finance_payment_scope_ready_recorded,role_scope_pack_passed,controlled_evidence_id_recorded",
    "blocked_if=scope_baseline_closed=no,post_repair_snapshot_recorded=no,controlled_evidence_id_recorded=no,negative_control_queue_re_run_recorded=no",
    "next_allowed_step=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION",
    "source=negative_control_account_queue_runtime",
    "no_raw_profile_id=true",
    "no_service_role_key_in_evidence=true",
    "no_password_or_invite_link=true",
    "no_auto_scope_change=true",
    "no_auto_account_create=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatNegativeAccountProvisioningChecklist({
  ttgdtxCandidates,
  ttgdtxSegmentId,
  activeNonPrivilegedWithoutLeadVisibility,
}) {
  return [
    "negative_account_checklist=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING",
    `target_segment=${targetSegmentCodes.ttgdtx}`,
    `target_segment_present=${ttgdtxSegmentId ? "yes" : "no"}`,
    `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
    `baseline_missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    "required_closure=target_account_label_recorded,non_target_business_scope_recorded,target_segment_exclusion_recorded,credential_boundary_acknowledged,controlled_evidence_id_recorded",
    "no_ttgdtx_scope=true",
    "no_settings_or_permission_access=true",
    "no_password_or_invite_link=true",
    "no_auto_account_create=true",
  ].join("; ");
}

function formatNegativeAccountExecutionPacket({
  ttgdtxCandidates,
  ttgdtxSegmentId,
  activeNonPrivilegedWithoutLeadVisibility,
}) {
  return [
    "negative_account_execution_packet=ACCT-00_NEGATIVE_ACCOUNT_EXECUTION",
    "target_account_label=REAL_OUT_OF_SCOPE_NEGATIVE_01",
    `target_segment=${targetSegmentCodes.ttgdtx}`,
    `target_segment_present=${ttgdtxSegmentId ? "yes" : "no"}`,
    `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
    `baseline_missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    "required_inputs=negative_account_dependency_lock_closed,provisioning_decision_closed,target_account_label_recorded,secure_admin_channel_recorded",
    "blocked_if=negative_account_dependency_lock_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0",
    "required_execution_record=auth_profile_link_recorded,non_target_business_scope_applied,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,credential_boundary_acknowledged,controlled_evidence_id_recorded",
    "no_ttgdtx_scope=true",
    "no_settings_or_permission_access=true",
    "no_password_or_invite_link=true",
    "no_raw_account_id=true",
    "no_auto_account_create=true",
    "no_auto_scope_grant=true",
    "no_auto_uat_approval=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatNegativeAccountPostExecutionVerificationPacket({
  ttgdtxCandidates,
  activeNonPrivilegedWithoutLeadVisibility,
}) {
  return [
    "negative_account_post_execution_verification_packet=ACCT-00_NEGATIVE_ACCOUNT_POST_EXECUTION_VERIFICATION",
    "target_account_label=REAL_OUT_OF_SCOPE_NEGATIVE_01",
    `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
    `baseline_missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    `negative_account_ready=${ttgdtxCandidates.length > 0 ? "yes" : "no"}`,
    "required_inputs=negative_account_execution_closed,auth_profile_link_recorded,non_target_business_scope_applied,target_segment_exclusion_verified,controlled_evidence_id_recorded",
    "required_verification_record=ttgdtx_negative_candidates>=1,negative_account_label_recorded,auth_profile_link_verified,non_target_business_scope_verified,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,controlled_evidence_id_recorded",
    "next_allowed_step=ACCT-00_NEGATIVE_BROWSER_DENIAL",
    "no_ttgdtx_scope=true",
    "no_settings_or_permission_access=true",
    "no_password_or_invite_link=true",
    "no_raw_account_id=true",
    "no_auto_account_create=true",
    "no_auto_scope_grant=true",
    "no_auto_acceptance=true",
    "no_auto_uat_approval=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatNegativeBrowserEvidenceDependencyLock({
  ttgdtxCandidates,
  activeNonPrivilegedWithoutLeadVisibility,
  activeNonPrivilegedWithoutBusinessScope,
  nonPrivilegedBroadVisibility,
  workspaceMismatch,
}) {
  const scopeBaselineClosed =
    activeNonPrivilegedWithoutLeadVisibility.length === 0 &&
    activeNonPrivilegedWithoutBusinessScope.length === 0 &&
    nonPrivilegedBroadVisibility.length === 0 &&
    workspaceMismatch.length === 0;
  const negativeAccountReady = ttgdtxCandidates.length > 0;

  return [
    "negative_browser_evidence_dependency_lock=ACCT-00_NEGATIVE_BROWSER_EVIDENCE_DEPENDENCY",
    `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
    `negative_account_ready=${negativeAccountReady ? "yes" : "no"}`,
    `scope_baseline_closed=${scopeBaselineClosed ? "yes" : "no"}`,
    `missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    `missing_business_scope=${activeNonPrivilegedWithoutBusinessScope.length}`,
    `non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    "required_inputs=negative_account_post_execution_verification_closed,negative_account_ready,controlled_evidence_id_recorded,reviewer_recorded,owner_lane_confirmed",
    "required_dependency_record=ttgdtx_negative_candidates>=1,negative_account_label_recorded,auth_profile_link_verified,non_target_business_scope_verified,target_segment_exclusion_verified,lead_visibility_non_all_verified,settings_permission_denial_ready,controlled_evidence_id_recorded",
    "blocked_if=negative_account_ready=no,ttgdtx_negative_candidates=0,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0",
    "next_allowed_step=ACCT-00_NEGATIVE_BROWSER_DENIAL",
    "no_browser_uat_execution=true",
    "no_raw_screenshot_or_pii=true",
    "no_password_or_invite_link=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatPreUatOwnerChecklist({
  ttgdtxCandidates,
  activeNonPrivilegedWithoutLeadVisibility,
  activeNonPrivilegedWithoutBusinessScope,
  nonPrivilegedBroadVisibility,
}) {
  return [
    "owner_checklist=ACCT-00_PRE_UAT",
    `missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    `missing_business_scope=${activeNonPrivilegedWithoutBusinessScope.length}`,
    `non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}`,
    `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
    "required_order=USER-SCOPE-REPAIR-01 before USER-SCOPE-REPAIR-02 before ACCT-NEG-02 before ACCT-NEG-03 before ACCT-NEG-04 before ACCT-NEG-05",
    "required_closure=missing_visibility=0,missing_business_scope=0,ttgdtx_negative_candidates>=1,controlled_evidence_id_recorded",
    "no_password_or_invite_link=true",
    "no_auto_fix=true",
  ].join("; ");
}

function formatScopePostRepairVerificationPacket({
  activeNonPrivilegedWithoutLeadVisibility,
  activeNonPrivilegedWithoutBusinessScope,
  nonPrivilegedBroadVisibility,
  workspaceMismatch,
}) {
  const scopeBaselineClosed =
    activeNonPrivilegedWithoutLeadVisibility.length === 0 &&
    activeNonPrivilegedWithoutBusinessScope.length === 0 &&
    nonPrivilegedBroadVisibility.length === 0 &&
    workspaceMismatch.length === 0;

  return [
    "scope_post_repair_verification_packet=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION",
    `missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    `missing_business_scope=${activeNonPrivilegedWithoutBusinessScope.length}`,
    `non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    `scope_baseline_closed=${scopeBaselineClosed ? "yes" : "no"}`,
    "required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded",
    "required_verification_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded",
    "next_allowed_step=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF",
    "no_raw_profile_id=true",
    "no_service_role_key_in_evidence=true",
    "no_password_or_invite_link=true",
    "no_auto_scope_change=true",
    "no_auto_acceptance=true",
    "no_auto_uat_approval=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatScopeExternalClosureHandoffPacket({
  activeNonPrivilegedWithoutLeadVisibility,
  activeNonPrivilegedWithoutBusinessScope,
  nonPrivilegedBroadVisibility,
  workspaceMismatch,
}) {
  const scopeBaselineClosed =
    activeNonPrivilegedWithoutLeadVisibility.length === 0 &&
    activeNonPrivilegedWithoutBusinessScope.length === 0 &&
    nonPrivilegedBroadVisibility.length === 0 &&
    workspaceMismatch.length === 0;

  return [
    "scope_external_closure_handoff_packet=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF",
    `missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    `missing_business_scope=${activeNonPrivilegedWithoutBusinessScope.length}`,
    `non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    `scope_baseline_closed=${scopeBaselineClosed ? "yes" : "no"}`,
    "required_inputs=scope_baseline_decision_checklist_closed,scope_repair_execution_closed,scope_post_repair_rerun_proof_closed,scope_post_repair_verification_closed,controlled_evidence_id_recorded,owner_lane_confirmed",
    "required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,lead_visibility_choice_recorded,business_scope_choice_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_inside_scope_confirmed,post_repair_snapshot_recorded,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded",
    "blocked_if=scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0,controlled_evidence_id_recorded=no",
    "next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY",
    "no_raw_profile_id=true",
    "no_service_role_key_in_evidence=true",
    "no_password_or_invite_link=true",
    "no_auto_scope_change=true",
    "no_auto_account_create=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatNegativeAccountDependencyLock({
  ttgdtxCandidates,
  activeNonPrivilegedWithoutLeadVisibility,
  activeNonPrivilegedWithoutBusinessScope,
  nonPrivilegedBroadVisibility,
  workspaceMismatch,
}) {
  const scopeBaselineClosed =
    activeNonPrivilegedWithoutLeadVisibility.length === 0 &&
    activeNonPrivilegedWithoutBusinessScope.length === 0 &&
    nonPrivilegedBroadVisibility.length === 0 &&
    workspaceMismatch.length === 0;

  return [
    "negative_account_dependency_lock=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY",
    `missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    `missing_business_scope=${activeNonPrivilegedWithoutBusinessScope.length}`,
    `non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    `scope_baseline_closed=${scopeBaselineClosed ? "yes" : "no"}`,
    `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
    "required_inputs=scope_external_closure_handoff_closed,scope_post_repair_verification_closed,scope_baseline_closed,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded",
    "required_dependency_record=scope_external_closure_handoff_closed,missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded,post_repair_snapshot_recorded",
    "blocked_if=scope_external_closure_handoff_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0",
    "next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING",
    "no_auto_account_create=true",
    "no_auto_scope_grant=true",
    "no_auto_scope_change=true",
    "no_password_or_invite_link=true",
    "no_raw_profile_id=true",
    "no_service_role_key_in_evidence=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatNegativeEvidenceChecklist({ ttgdtxCandidates }) {
  return [
    "negative_evidence_checklist=ACCT-00_NEGATIVE_BROWSER_DENIAL",
    `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
    "route_scope=lead,finance,evidence,audit,settings",
    "required_result=BLOCKED_OR_EMPTY_SCOPED_STATE",
    "required_closure=controlled_evidence_id_recorded,reviewer_recorded,route_result_recorded,owner_decision_recorded",
    "no_raw_screenshot_or_pii=true",
    "no_password_or_invite_link=true",
    "no_auto_acceptance=true",
  ].join("; ");
}

function formatNegativeBrowserRouteMatrix({ ttgdtxCandidates }) {
  const routeCodes = ["lead", "finance", "evidence", "audit", "settings"];

  return [
    "negative_route_matrix=ACCT-00_NEGATIVE_BROWSER_ROUTES",
    `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
    `route_count=${routeCodes.length}`,
    `required_routes=${routeCodes.join(",")}`,
    "expected_result=BLOCKED_OR_EMPTY_SCOPED_STATE",
    "required_closure=lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded",
    "no_raw_screenshot_or_pii=true",
    "no_password_or_invite_link=true",
    "no_auto_acceptance=true",
  ].join("; ");
}

function formatNegativeControlFinalProofDecisionPacket({ ttgdtxCandidates }) {
  return [
    "negative_control_final_proof_decision_packet=ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION",
    "target_account_label=REAL_OUT_OF_SCOPE_NEGATIVE_01",
    `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
    `negative_control_proof_ready=${ttgdtxCandidates.length > 0 ? "external_required" : "no"}`,
    "required_inputs=negative_browser_denial_closed,negative_browser_route_matrix_closed,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded",
    "required_decision_record=negative_control_proof_decision_recorded,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded,blocker_state_recorded",
    "allowed_decision_values=PASS,NO_GO,BLOCKED",
    "next_allowed_step=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE",
    "no_raw_screenshot_or_pii=true",
    "no_password_or_invite_link=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_acceptance=true",
    "no_auto_uat_approval=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatOwnerExternalClosureHandoffPacket({
  ttgdtxCandidates,
  activeNonPrivilegedWithoutLeadVisibility,
  activeNonPrivilegedWithoutBusinessScope,
  nonPrivilegedBroadVisibility,
  workspaceMismatch,
}) {
  const scopeBaselineClosed =
    activeNonPrivilegedWithoutLeadVisibility.length === 0 &&
    activeNonPrivilegedWithoutBusinessScope.length === 0 &&
    nonPrivilegedBroadVisibility.length === 0 &&
    workspaceMismatch.length === 0;
  const negativeAccountReady = ttgdtxCandidates.length > 0;

  return [
    "owner_external_closure_handoff_packet=ACCT-00_OWNER_EXTERNAL_CLOSURE_HANDOFF",
    `missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}`,
    `missing_business_scope=${activeNonPrivilegedWithoutBusinessScope.length}`,
    `non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
    `scope_baseline_closed=${scopeBaselineClosed ? "yes" : "no"}`,
    `negative_account_ready=${negativeAccountReady ? "yes" : "no"}`,
    `negative_control_proof_ready=${negativeAccountReady ? "external_required" : "no"}`,
    "required_inputs=scope_post_repair_verification_closed,negative_account_post_execution_verification_closed,negative_browser_denial_closed,negative_control_final_proof_decision_recorded,controlled_evidence_id_recorded,owner_lane_confirmed",
    "required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates>=1,negative_control_proof_decision_recorded,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,blocker_state_recorded,controlled_evidence_id_recorded",
    "blocked_if=missing_visibility>0,missing_business_scope>0,ttgdtx_negative_candidates=0,negative_control_proof_ready=no,controlled_evidence_id_recorded=no",
    "next_allowed_step=ACCT-12_NEGATIVE_CONTROL_PROOF_DEPENDENCY",
    "no_raw_profile_id=true",
    "no_raw_account_id=true",
    "no_raw_screenshot_or_pii=true",
    "no_password_or_invite_link=true",
    "no_auto_scope_change=true",
    "no_auto_account_create=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function mapById(rows) {
  return new Map((rows ?? []).map((row) => [row.id, row]));
}

function addToSetMap(map, key, value) {
  const current = map.get(key) ?? new Set();
  current.add(value);
  map.set(key, current);
}

async function fetchAllRows(adminClient, table, select, buildQuery = (query) => query) {
  const rows = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await buildQuery(
      adminClient
        .from(table)
        .select(select)
        .range(from, from + pageSize - 1),
    );

    if (error) {
      return { data: null, error: true };
    }

    const page = data ?? [];
    rows.push(...page);

    if (page.length < pageSize) {
      return { data: rows, error: false };
    }

    from += pageSize;
  }
}

function checkStaticGuards() {
  try {
    const packageJson = JSON.parse(read("package.json"));
    const negativeQueueDoc = read(negativeQueueDocPath);
    const permissionScopeCheck = read("scripts/check-heu-permission-scope-readiness.mjs");
    const userAccountAudit = read("scripts/audit-heu-user-account-security.mjs");
    const productionReadiness = read("lib/production-readiness.ts");

    const requiredTokens = [
      packageJson.scripts?.["check:heu-negative-control-account-queue"] ===
      "node scripts/check-heu-negative-control-account-queue.mjs"
        ? "package-script-ok"
        : null,
      negativeQueueDoc.includes("HEU Negative Control Account Queue - 2026-07-03")
        ? "doc-title-ok"
        : null,
      negativeQueueDoc.includes("NEGATIVE_CONTROL_QUEUE_READY / NO_GO / BLOCKED")
        ? "decision-lane-ok"
        : null,
      negativeQueueDoc.includes("REAL_OUT_OF_SCOPE_NEGATIVE_01")
        ? "negative-label-ok"
        : null,
      negativeQueueDoc.includes("NEGATIVE-CONTROL-OWNER-PACKET")
        ? "owner-packet-ok"
        : null,
      negativeQueueDoc.includes("ACCT-00-PRE-UAT-OWNER-CHECKLIST") &&
      negativeQueueDoc.includes("owner_checklist=ACCT-00_PRE_UAT") &&
      negativeQueueDoc.includes("no_auto_fix=true")
        ? "pre-uat-checklist-ok"
        : null,
      negativeQueueDoc.includes("ACCT-00-SCOPE-BASELINE-DECISION-CHECKLIST") &&
      negativeQueueDoc.includes(
        "scope_decision_checklist=ACCT-00_SCOPE_BASELINE_OWNER_DECISION",
      ) &&
      negativeQueueDoc.includes("no_auto_scope_change=true")
        ? "scope-decision-checklist-ok"
        : null,
      negativeQueueDoc.includes("ACCT-00-SCOPE-REPAIR-OWNER-PACKET-LOCK") &&
      negativeQueueDoc.includes(
        "scope_repair_owner_packet_lock=ACCT-00_SCOPE_REPAIR_OWNER_PACKET_LOCK",
      ) &&
      negativeQueueDoc.includes(
        "required_inputs=safe_owner_repair_labels_generated,owner_action_packet_generated,role_codes_recorded,decision_count_recorded,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded",
      ) &&
      negativeQueueDoc.includes(
        "required_dependency_record=safe_label,role_code,owner_label_mapped,owner_lane_confirmed,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded",
      ) &&
      negativeQueueDoc.includes(
        "blocked_if=safe_owner_repair_labels_missing,owner_action_packet_missing,role_codes_missing,decision_count_mismatch,owner_label_unmapped,secure_owner_lookup_channel_missing,controlled_evidence_id_missing,raw_profile_id_present",
      ) &&
      negativeQueueDoc.includes(
        "next_allowed_step=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX",
      )
        ? "scope-repair-owner-packet-lock-ok"
        : null,
      negativeQueueDoc.includes("ACCT-00-SCOPE-REPAIR-OWNER-DECISION-MATRIX") &&
      negativeQueueDoc.includes(
        "scope_repair_owner_decision_matrix=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX",
      ) &&
      negativeQueueDoc.includes(
        "required_per_label_record=safe_label,role_code,approved_visibility_choice_when_required,approved_segment_or_partner_scope_when_required,owner_reviewer,controlled_evidence_id",
      ) &&
      negativeQueueDoc.includes(
        "blocked_if=owner_label_unmapped,required_visibility_choice_missing,required_business_scope_choice_missing,secure_admin_channel_missing,controlled_evidence_id_missing",
      )
        ? "scope-repair-owner-decision-matrix-ok"
        : null,
      negativeQueueDoc.includes("ACCT-00-SCOPE-REPAIR-EXECUTION-PACKET") &&
      negativeQueueDoc.includes(
        "scope_repair_execution_packet=ACCT-00_SCOPE_REPAIR_EXECUTION",
      ) &&
      negativeQueueDoc.includes("no_service_role_key_in_evidence=true")
        ? "scope-repair-execution-packet-ok"
        : null,
      negativeQueueDoc.includes(
        "ACCT-00-SCOPE-POST-REPAIR-RERUN-PROOF-PACKET",
      ) &&
      negativeQueueDoc.includes(
        "scope_post_repair_rerun_proof_packet=ACCT-00_SCOPE_POST_REPAIR_RERUN_PROOF",
      ) &&
      negativeQueueDoc.includes(
        "required_rerun_record=check_heu_user_scope_baseline_repair_queue_rerun,check_heu_negative_control_account_queue_rerun,check_heu_finance_payment_scope_readiness_rerun,check_heu_role_scope_uat_pack_rerun,check_heu_user_account_security_rerun",
      ) &&
      negativeQueueDoc.includes("next_allowed_step=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION")
        ? "scope-post-repair-rerun-proof-packet-ok"
        : null,
      negativeQueueDoc.includes(
        "ACCT-00-SCOPE-POST-REPAIR-VERIFICATION-PACKET",
      ) &&
      negativeQueueDoc.includes(
        "scope_post_repair_verification_packet=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION",
      ) &&
      negativeQueueDoc.includes("next_allowed_step=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF") &&
      negativeQueueDoc.includes("no_auto_acceptance=true")
        ? "scope-post-repair-verification-packet-ok"
        : null,
      negativeQueueDoc.includes(
        "ACCT-00-SCOPE-EXTERNAL-CLOSURE-HANDOFF-PACKET",
      ) &&
      negativeQueueDoc.includes(
        "scope_external_closure_handoff_packet=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF",
      ) &&
      negativeQueueDoc.includes(
        "required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,lead_visibility_choice_recorded,business_scope_choice_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_inside_scope_confirmed,post_repair_snapshot_recorded,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded",
      ) &&
      negativeQueueDoc.includes(
        "next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY",
      )
        ? "scope-external-closure-handoff-packet-ok"
        : null,
      negativeQueueDoc.includes("ACCT-00-NEGATIVE-ACCOUNT-DEPENDENCY-LOCK") &&
      negativeQueueDoc.includes(
        "negative_account_dependency_lock=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY",
      ) &&
      negativeQueueDoc.includes(
        "required_inputs=scope_external_closure_handoff_closed,scope_post_repair_verification_closed,scope_baseline_closed,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded",
      ) &&
      negativeQueueDoc.includes(
        "required_dependency_record=scope_external_closure_handoff_closed,missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,workspace_preference_inside_scope_confirmed,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded,post_repair_snapshot_recorded",
      ) &&
      negativeQueueDoc.includes(
        "blocked_if=scope_external_closure_handoff_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0,non_admin_all_visibility>0,workspace_mismatch>0",
      ) &&
      negativeQueueDoc.includes("no_evidence_acceptance=true")
        ? "negative-account-dependency-lock-ok"
        : null,
      negativeQueueDoc.includes(
        "ACCT-00-NEGATIVE-ACCOUNT-PROVISIONING-CHECKLIST",
      ) &&
      negativeQueueDoc.includes(
        "negative_account_checklist=ACCT-00_NEGATIVE_ACCOUNT_PROVISIONING",
      ) &&
      negativeQueueDoc.includes("no_auto_account_create=true")
        ? "negative-account-provisioning-checklist-ok"
        : null,
      negativeQueueDoc.includes(
        "ACCT-00-NEGATIVE-ACCOUNT-EXECUTION-PACKET",
      ) &&
      negativeQueueDoc.includes(
        "negative_account_execution_packet=ACCT-00_NEGATIVE_ACCOUNT_EXECUTION",
      ) &&
      negativeQueueDoc.includes(
        "required_inputs=negative_account_dependency_lock_closed,provisioning_decision_closed,target_account_label_recorded,secure_admin_channel_recorded",
      ) &&
      negativeQueueDoc.includes(
        "blocked_if=negative_account_dependency_lock_closed=no,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0",
      ) &&
      negativeQueueDoc.includes("no_raw_account_id=true")
        ? "negative-account-execution-packet-ok"
        : null,
      negativeQueueDoc.includes(
        "ACCT-00-NEGATIVE-ACCOUNT-POST-EXECUTION-VERIFICATION-PACKET",
      ) &&
      negativeQueueDoc.includes(
        "negative_account_post_execution_verification_packet=ACCT-00_NEGATIVE_ACCOUNT_POST_EXECUTION_VERIFICATION",
      ) &&
      negativeQueueDoc.includes("next_allowed_step=ACCT-00_NEGATIVE_BROWSER_DENIAL") &&
      negativeQueueDoc.includes("no_auto_acceptance=true")
        ? "negative-account-post-execution-verification-packet-ok"
        : null,
      negativeQueueDoc.includes(
        "ACCT-00-NEGATIVE-BROWSER-EVIDENCE-DEPENDENCY-LOCK",
      ) &&
      negativeQueueDoc.includes(
        "negative_browser_evidence_dependency_lock=ACCT-00_NEGATIVE_BROWSER_EVIDENCE_DEPENDENCY",
      ) &&
      negativeQueueDoc.includes(
        "blocked_if=negative_account_ready=no,ttgdtx_negative_candidates=0,scope_baseline_closed=no,missing_visibility>0,missing_business_scope>0",
      ) &&
      negativeQueueDoc.includes("no_browser_uat_execution=true")
        ? "negative-browser-evidence-dependency-lock-ok"
        : null,
      negativeQueueDoc.includes("ACCT-00-NEGATIVE-CONTROL-EVIDENCE-CHECKLIST") &&
      negativeQueueDoc.includes("negative_evidence_checklist=ACCT-00_NEGATIVE_BROWSER_DENIAL") &&
      negativeQueueDoc.includes("no_raw_screenshot_or_pii=true") &&
      negativeQueueDoc.includes("no_auto_acceptance=true")
        ? "negative-evidence-checklist-ok"
        : null,
      negativeQueueDoc.includes("ACCT-00-NEGATIVE-BROWSER-ROUTE-MATRIX") &&
      negativeQueueDoc.includes("negative_route_matrix=ACCT-00_NEGATIVE_BROWSER_ROUTES") &&
      negativeQueueDoc.includes("required_routes=lead,finance,evidence,audit,settings") &&
      negativeQueueDoc.includes("lead_route_denial_recorded")
        ? "negative-browser-route-matrix-ok"
        : null,
      negativeQueueDoc.includes(
        "ACCT-00-NEGATIVE-CONTROL-FINAL-PROOF-DECISION-PACKET",
      ) &&
      negativeQueueDoc.includes(
        "negative_control_final_proof_decision_packet=ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION",
      ) &&
      negativeQueueDoc.includes("next_allowed_step=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE") &&
      negativeQueueDoc.includes("no_evidence_acceptance=true")
        ? "negative-control-final-proof-decision-packet-ok"
        : null,
      negativeQueueDoc.includes(
        "ACCT-00-OWNER-EXTERNAL-CLOSURE-HANDOFF-PACKET",
      ) &&
      negativeQueueDoc.includes(
        "owner_external_closure_handoff_packet=ACCT-00_OWNER_EXTERNAL_CLOSURE_HANDOFF",
      ) &&
      negativeQueueDoc.includes(
        "required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates>=1,negative_control_proof_decision_recorded,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,blocker_state_recorded,controlled_evidence_id_recorded",
      ) &&
      negativeQueueDoc.includes(
        "next_allowed_step=ACCT-12_NEGATIVE_CONTROL_PROOF_DEPENDENCY",
      ) &&
      negativeQueueDoc.includes("no_owner_go_inference=true")
        ? "owner-external-closure-handoff-packet-ok"
        : null,
      negativeQueueDoc.includes(
        "owner_action_packet=target_account_label=REAL_OUT_OF_SCOPE_NEGATIVE_01",
      )
        ? "owner-packet-label-ok"
        : null,
      negativeQueueDoc.includes("Do not paste passwords")
        ? "secret-boundary-ok"
        : null,
      permissionScopeCheck.includes("PERMISSION-SCOPE-NO-BROAD-NON-ADMIN")
        ? "permission-scope-link-ok"
        : null,
      productionReadiness.includes("REAL_OUT_OF_SCOPE_NEGATIVE_01")
        ? "production-readiness-link-ok"
        : null,
      userAccountAudit.includes("check-heu-negative-control-account-queue.mjs")
        ? "audit-hook-ok"
        : null,
    ];
    const missingCount = requiredTokens.filter((token) => !token).length;

    addStatus(
      "NEGATIVE-CONTROL-APP-GUARD",
      missingCount === 0 ? "READY" : "NO_GO",
      missingCount === 0
        ? "Negative-control queue doc, package command, permission-scope guard and user-account audit hook are wired."
        : `Negative-control static guards missing: ${missingCount}.`,
    );
  } catch {
    addStatus(
      "NEGATIVE-CONTROL-APP-GUARD",
      "NO_GO",
      "Negative-control static guard check could not complete. Raw errors are not printed.",
    );
  }
}

function hasBusinessScope(profileId, segmentScopeIdsByUserId, partnerScopeIdsByUserId) {
  return (
    (segmentScopeIdsByUserId.get(profileId)?.size ?? 0) > 0 ||
    (partnerScopeIdsByUserId.get(profileId)?.size ?? 0) > 0
  );
}

function isUsableNegativeCandidate(
  profile,
  roleById,
  visibilityByUserId,
  segmentScopeIdsByUserId,
  partnerScopeIdsByUserId,
  workspacePreferenceByUserId,
  targetSegmentId,
) {
  const roleCode = roleById.get(profile.role_id)?.code ?? "";
  const segmentIds = segmentScopeIdsByUserId.get(profile.id) ?? new Set();
  const leadVisibility = visibilityByUserId.get(profile.id);

  return (
    !privilegedRoleCodes.has(roleCode) &&
    Boolean(leadVisibility) &&
    leadVisibility !== "ALL" &&
    hasBusinessScope(profile.id, segmentScopeIdsByUserId, partnerScopeIdsByUserId) &&
    (!targetSegmentId || !segmentIds.has(targetSegmentId)) &&
    workspacePreferenceByUserId.get(profile.id) !== targetSegmentId
  );
}

const localEnv = parseEnvFile(envPath);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "NEGATIVE-CONTROL-ENV",
  missingKeys.length === 0 ? "READY" : "NO_GO",
  missingKeys.length === 0
    ? ".env.local has required Supabase env keys. Values are intentionally hidden."
    : `.env.local missing or placeholder keys: ${missingKeys.join(", ")}.`,
);

checkStaticGuards();

if (missingKeys.length === 0) {
  try {
    const adminClient = createClient(
      localEnv.NEXT_PUBLIC_SUPABASE_URL,
      localEnv.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const [
      profilesResult,
      rolesResult,
      leadVisibilityResult,
      segmentScopesResult,
      partnerScopesResult,
      workspacePreferencesResult,
      segmentsResult,
    ] = await Promise.all([
      fetchAllRows(
        adminClient,
        "users_profile",
        "id,role_id,department_id,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(adminClient, "roles", "id,code,name"),
      fetchAllRows(
        adminClient,
        "user_lead_visibility_scopes",
        "user_id,lead_visibility,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(
        adminClient,
        "user_admission_segment_scopes",
        "user_id,segment_id,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(
        adminClient,
        "user_partner_scopes",
        "user_id,partner_id,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(
        adminClient,
        "user_admission_workspace_preferences",
        "user_id,active_segment_id,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
      fetchAllRows(
        adminClient,
        "admission_segments",
        "id,segment_code,status",
        (query) => query.eq("status", "ACTIVE"),
      ),
    ]);

    const readFailed =
      profilesResult.error ||
      rolesResult.error ||
      leadVisibilityResult.error ||
      segmentScopesResult.error ||
      partnerScopesResult.error ||
      workspacePreferencesResult.error ||
      segmentsResult.error;

    addStatus(
      "NEGATIVE-CONTROL-DB-READ",
      readFailed ? "NO_GO" : "READY",
      readFailed
        ? "Could not read one or more negative-control queue tables. Raw errors are not printed."
        : "Negative-control queue tables are readable with the server-only service role key.",
    );

    if (!readFailed) {
      const profiles = profilesResult.data ?? [];
      const roles = rolesResult.data ?? [];
      const leadVisibilityRows = leadVisibilityResult.data ?? [];
      const segmentScopes = segmentScopesResult.data ?? [];
      const partnerScopes = partnerScopesResult.data ?? [];
      const workspacePreferences = workspacePreferencesResult.data ?? [];
      const segments = segmentsResult.data ?? [];

      const roleById = mapById(roles);
      const segmentByCode = new Map(segments.map((row) => [row.segment_code, row]));
      const visibilityByUserId = new Map(
        leadVisibilityRows.map((row) => [row.user_id, row.lead_visibility]),
      );
      const segmentScopeIdsByUserId = new Map();
      const partnerScopeIdsByUserId = new Map();
      const workspacePreferenceByUserId = new Map(
        workspacePreferences.map((row) => [row.user_id, row.active_segment_id]),
      );

      for (const row of segmentScopes) {
        addToSetMap(segmentScopeIdsByUserId, row.user_id, row.segment_id);
      }

      for (const row of partnerScopes) {
        addToSetMap(partnerScopeIdsByUserId, row.user_id, row.partner_id);
      }

      const activeNonPrivilegedProfiles = profiles.filter((profile) => {
        const roleCode = roleById.get(profile.role_id)?.code ?? "";

        return !privilegedRoleCodes.has(roleCode);
      });
      const nonPrivilegedBroadVisibility = activeNonPrivilegedProfiles.filter(
        (profile) => visibilityByUserId.get(profile.id) === "ALL",
      );
      const activeNonPrivilegedWithBusinessScope = activeNonPrivilegedProfiles.filter(
        (profile) =>
          hasBusinessScope(profile.id, segmentScopeIdsByUserId, partnerScopeIdsByUserId),
      );
      const activeNonPrivilegedWithoutBusinessScope =
        activeNonPrivilegedProfiles.filter(
          (profile) =>
            !hasBusinessScope(
              profile.id,
              segmentScopeIdsByUserId,
              partnerScopeIdsByUserId,
            ),
        );
      const activeNonPrivilegedWithoutLeadVisibility =
        activeNonPrivilegedProfiles.filter(
          (profile) => !visibilityByUserId.has(profile.id),
        );
      const workspaceMismatch = activeNonPrivilegedProfiles.filter((profile) => {
        const segmentIds = segmentScopeIdsByUserId.get(profile.id);
        const activeSegmentId = workspacePreferenceByUserId.get(profile.id);

        return Boolean(segmentIds?.size) && !segmentIds.has(activeSegmentId);
      });

      addStatus(
        "NEGATIVE-CONTROL-BASELINE",
        activeNonPrivilegedWithoutLeadVisibility.length === 0 &&
          nonPrivilegedBroadVisibility.length === 0
          ? "READY"
          : "NO_GO",
        activeNonPrivilegedWithoutLeadVisibility.length === 0 &&
          nonPrivilegedBroadVisibility.length === 0
          ? [
              `active_non_admin_bgh=${activeNonPrivilegedProfiles.length}`,
              `active_non_admin_bgh_with_business_scope=${activeNonPrivilegedWithBusinessScope.length}`,
              "no active non-ADMIN/BGH profile has lead visibility ALL",
            ].join("; ")
          : `Negative-control baseline findings: missing_visibility=${activeNonPrivilegedWithoutLeadVisibility.length}; non_admin_all_visibility=${nonPrivilegedBroadVisibility.length}.`,
      );

      const ttgdtxSegmentId = segmentByCode.get(targetSegmentCodes.ttgdtx)?.id;
      const houSegmentId = segmentByCode.get(targetSegmentCodes.hou)?.id;
      const shortSegmentIds = new Set(
        segments
          .filter((segment) => segment.segment_code?.startsWith("SHORT_"))
          .map((segment) => segment.id),
      );

      const ttgdtxCandidates = activeNonPrivilegedProfiles.filter((profile) =>
        isUsableNegativeCandidate(
          profile,
          roleById,
          visibilityByUserId,
          segmentScopeIdsByUserId,
          partnerScopeIdsByUserId,
          workspacePreferenceByUserId,
          ttgdtxSegmentId,
        ),
      );
      const houCandidates = activeNonPrivilegedProfiles.filter((profile) =>
        isUsableNegativeCandidate(
          profile,
          roleById,
          visibilityByUserId,
          segmentScopeIdsByUserId,
          partnerScopeIdsByUserId,
          workspacePreferenceByUserId,
          houSegmentId,
        ),
      );
      const shortCandidates = activeNonPrivilegedProfiles.filter((profile) => {
        const segmentIds = segmentScopeIdsByUserId.get(profile.id) ?? new Set();
        const activeWorkspace = workspacePreferenceByUserId.get(profile.id);

        return (
          isUsableNegativeCandidate(
            profile,
            roleById,
            visibilityByUserId,
            segmentScopeIdsByUserId,
            partnerScopeIdsByUserId,
            workspacePreferenceByUserId,
            null,
          ) &&
          ![...shortSegmentIds].some((segmentId) => segmentIds.has(segmentId)) &&
          !shortSegmentIds.has(activeWorkspace)
        );
      });

      addStatus(
        "NEGATIVE-CONTROL-TTGDTX-QUEUE",
        ttgdtxSegmentId ? "READY" : "NO_GO",
        ttgdtxSegmentId
          ? [
              `target_segment=${targetSegmentCodes.ttgdtx}`,
              `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
              ttgdtxCandidates.length === 0
                ? "owner create/link pending for REAL_OUT_OF_SCOPE_NEGATIVE_01"
                : "candidate evidence only, not signed UAT",
            ].join("; ")
          : `Target segment ${targetSegmentCodes.ttgdtx} is missing.`,
      );

      addStatus(
        "NEGATIVE-CONTROL-OWNER-PACKET",
        "READY",
        formatNegativeOwnerActionPacket({
          ttgdtxCandidates,
          ttgdtxSegmentId,
          activeNonPrivilegedWithoutLeadVisibility,
          nonPrivilegedBroadVisibility,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-REPAIR-OWNER-PACKET-LOCK",
        "READY",
        formatScopeRepairOwnerPacketLock({
          activeNonPrivilegedWithoutLeadVisibility,
          activeNonPrivilegedWithoutBusinessScope,
          roleById,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-REPAIR-OWNER-DECISION-MATRIX",
        "READY",
        formatScopeRepairOwnerDecisionMatrix({
          activeNonPrivilegedWithoutLeadVisibility,
          activeNonPrivilegedWithoutBusinessScope,
          roleById,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-BASELINE-DECISION-CHECKLIST",
        "READY",
        formatScopeBaselineDecisionChecklist({
          activeNonPrivilegedWithoutLeadVisibility,
          activeNonPrivilegedWithoutBusinessScope,
          nonPrivilegedBroadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-REPAIR-DECISION-DEPENDENCY-LOCK",
        "READY",
        formatScopeRepairDecisionDependencyLock({
          activeNonPrivilegedWithoutLeadVisibility,
          activeNonPrivilegedWithoutBusinessScope,
          nonPrivilegedBroadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-REPAIR-EXECUTION-PACKET",
        "READY",
        formatScopeRepairExecutionPacket({
          activeNonPrivilegedWithoutLeadVisibility,
          activeNonPrivilegedWithoutBusinessScope,
          nonPrivilegedBroadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-POST-REPAIR-RERUN-PROOF-PACKET",
        "READY",
        formatScopePostRepairRerunProofPacket({
          activeNonPrivilegedWithoutLeadVisibility,
          activeNonPrivilegedWithoutBusinessScope,
          nonPrivilegedBroadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-POST-REPAIR-VERIFICATION-PACKET",
        "READY",
        formatScopePostRepairVerificationPacket({
          activeNonPrivilegedWithoutLeadVisibility,
          activeNonPrivilegedWithoutBusinessScope,
          nonPrivilegedBroadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-EXTERNAL-CLOSURE-HANDOFF-PACKET",
        "READY",
        formatScopeExternalClosureHandoffPacket({
          activeNonPrivilegedWithoutLeadVisibility,
          activeNonPrivilegedWithoutBusinessScope,
          nonPrivilegedBroadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-NEGATIVE-ACCOUNT-DEPENDENCY-LOCK",
        "READY",
        formatNegativeAccountDependencyLock({
          ttgdtxCandidates,
          activeNonPrivilegedWithoutLeadVisibility,
          activeNonPrivilegedWithoutBusinessScope,
          nonPrivilegedBroadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-NEGATIVE-ACCOUNT-PROVISIONING-CHECKLIST",
        "READY",
        formatNegativeAccountProvisioningChecklist({
          ttgdtxCandidates,
          ttgdtxSegmentId,
          activeNonPrivilegedWithoutLeadVisibility,
        }),
      );

      addStatus(
        "ACCT-00-NEGATIVE-ACCOUNT-EXECUTION-PACKET",
        "READY",
        formatNegativeAccountExecutionPacket({
          ttgdtxCandidates,
          ttgdtxSegmentId,
          activeNonPrivilegedWithoutLeadVisibility,
        }),
      );

      addStatus(
        "ACCT-00-NEGATIVE-ACCOUNT-POST-EXECUTION-VERIFICATION-PACKET",
        "READY",
        formatNegativeAccountPostExecutionVerificationPacket({
          ttgdtxCandidates,
          activeNonPrivilegedWithoutLeadVisibility,
        }),
      );

      addStatus(
        "ACCT-00-NEGATIVE-BROWSER-EVIDENCE-DEPENDENCY-LOCK",
        "READY",
        formatNegativeBrowserEvidenceDependencyLock({
          ttgdtxCandidates,
          activeNonPrivilegedWithoutLeadVisibility,
          activeNonPrivilegedWithoutBusinessScope,
          nonPrivilegedBroadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-PRE-UAT-OWNER-CHECKLIST",
        "READY",
        formatPreUatOwnerChecklist({
          ttgdtxCandidates,
          activeNonPrivilegedWithoutLeadVisibility,
          activeNonPrivilegedWithoutBusinessScope,
          nonPrivilegedBroadVisibility,
        }),
      );

      addStatus(
        "ACCT-00-NEGATIVE-CONTROL-EVIDENCE-CHECKLIST",
        "READY",
        formatNegativeEvidenceChecklist({ ttgdtxCandidates }),
      );

      addStatus(
        "ACCT-00-NEGATIVE-BROWSER-ROUTE-MATRIX",
        "READY",
        formatNegativeBrowserRouteMatrix({ ttgdtxCandidates }),
      );

      addStatus(
        "ACCT-00-NEGATIVE-CONTROL-FINAL-PROOF-DECISION-PACKET",
        "READY",
        formatNegativeControlFinalProofDecisionPacket({ ttgdtxCandidates }),
      );

      addStatus(
        "ACCT-00-OWNER-EXTERNAL-CLOSURE-HANDOFF-PACKET",
        "READY",
        formatOwnerExternalClosureHandoffPacket({
          ttgdtxCandidates,
          activeNonPrivilegedWithoutLeadVisibility,
          activeNonPrivilegedWithoutBusinessScope,
          nonPrivilegedBroadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "NEGATIVE-CONTROL-MODULE-QUEUE",
        houSegmentId && shortSegmentIds.size > 0 ? "READY" : "NO_GO",
        houSegmentId && shortSegmentIds.size > 0
          ? [
              `hou_negative_candidates=${houCandidates.length}`,
              `short_course_negative_candidates=${shortCandidates.length}`,
              `short_course_target_segments=${shortSegmentIds.size}`,
            ].join("; ")
          : `Module negative-control targets missing: hou=${houSegmentId ? 0 : 1}; short=${shortSegmentIds.size}.`,
      );

      addStatus(
        "NEGATIVE-CONTROL-NO-AUTO-CREATE",
        "READY",
        "This checker is read-only; owner-approved negative-control accounts must be created/linked through approved secure channels, not by this script.",
      );

      addStatus(
        "NEGATIVE-CONTROL-SECRET-BOUNDARY",
        "READY",
        "The queue reports counts and target labels only; it does not print emails, names, phone numbers, passwords, reset links, service-role keys or raw IDs.",
      );

      addStatus(
        "NEGATIVE-CONTROL-SUMMARY",
        "READY",
        [
          `active_profiles=${profiles.length}`,
          `active_non_admin_bgh=${activeNonPrivilegedProfiles.length}`,
          `ttgdtx_negative_candidates=${ttgdtxCandidates.length}`,
          `hou_negative_candidates=${houCandidates.length}`,
          `short_course_negative_candidates=${shortCandidates.length}`,
        ].join("; "),
      );
    }
  } catch {
    addStatus(
      "NEGATIVE-CONTROL-CHECK",
      "NO_GO",
      "Negative-control account queue check could not complete. Check server env/project and database schema. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "NEGATIVE-CONTROL-CHECK",
    "NO_GO",
    "Negative-control checks were skipped because required env keys are missing.",
  );
}

console.log("HEU negative-control account queue check");
console.log(
  "Secrets, emails, names, phone numbers and raw IDs are never printed by this script.",
);

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
