import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env.local");
const repairQueuePath =
  "docs/HEU_USER_SCOPE_BASELINE_REPAIR_QUEUE_20260703.md";
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
const statuses = [];
const staticOnly = process.argv.includes("--static-only");

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

function hashLabel(value) {
  const hash = crypto.createHash("sha256");

  hash["update"](String(value));

  return hash.digest("hex").slice(0, 10);
}

function formatOwnerRepairLabels(rows, issueCode, roleById) {
  const labels = rows.slice(0, 10).map((profile) => {
    const roleCode = roleById.get(profile.role_id)?.code ?? "NO_ROLE";

    return `${hashLabel(`${issueCode}:${profile.id}`)}:${roleCode}`;
  });

  return labels.length > 0 ? labels.join(", ") : "none";
}

function formatOwnerActionPacket(missingLeadVisibility, missingBusinessScope, roleById) {
  const profilesById = new Map();

  for (const profile of missingLeadVisibility) {
    profilesById.set(profile.id, {
      profile,
      missingLeadVisibility: true,
      missingBusinessScope: false,
    });
  }

  for (const profile of missingBusinessScope) {
    const current = profilesById.get(profile.id) ?? {
      profile,
      missingLeadVisibility: false,
      missingBusinessScope: false,
    };

    current.missingBusinessScope = true;
    profilesById.set(profile.id, current);
  }

  const packets = Array.from(profilesById.values()).sort((left, right) => {
    const leftRole = roleById.get(left.profile.role_id)?.code ?? "NO_ROLE";
    const rightRole = roleById.get(right.profile.role_id)?.code ?? "NO_ROLE";

    return leftRole.localeCompare(rightRole) || left.profile.id.localeCompare(right.profile.id);
  });
  const roleCodes = Array.from(
    new Set(
      packets.map((packet) => roleById.get(packet.profile.role_id)?.code ?? "NO_ROLE"),
    ),
  );
  const decisionCount =
    missingLeadVisibility.length + missingBusinessScope.length;
  const requiredDecisions = [
    missingLeadVisibility.length > 0
      ? "lead_visibility_choice_required"
      : null,
    missingBusinessScope.length > 0
      ? "segment_or_partner_scope_required"
      : null,
  ].filter(Boolean);

  return [
    `owner_action_packet=profile_count=${packets.length}`,
    `role_codes=${roleCodes.length > 0 ? roleCodes.join(",") : "none"}`,
    `decision_count=${decisionCount}`,
    `required_decisions=${
      requiredDecisions.length > 0 ? requiredDecisions.join(",") : "none"
    }`,
    "repair_order=USER-SCOPE-REPAIR-01 before USER-SCOPE-REPAIR-02 before USER-SCOPE-REPAIR-03",
    "TCHC_LEAD packet is owner-side routing only when present",
  ].join("; ");
}

function formatScopeRepairOwnerPacketLock(
  missingLeadVisibility,
  missingBusinessScope,
  roleById,
) {
  const profilesById = new Map();

  for (const profile of missingLeadVisibility) {
    profilesById.set(profile.id, profile);
  }

  for (const profile of missingBusinessScope) {
    profilesById.set(profile.id, profile);
  }

  const profiles = Array.from(profilesById.values()).sort((left, right) => {
    const leftRole = roleById.get(left.role_id)?.code ?? "NO_ROLE";
    const rightRole = roleById.get(right.role_id)?.code ?? "NO_ROLE";

    return leftRole.localeCompare(rightRole) || left.id.localeCompare(right.id);
  });
  const roleCodes = Array.from(
    new Set(profiles.map((profile) => roleById.get(profile.role_id)?.code ?? "NO_ROLE")),
  );

  return [
    "scope_repair_owner_packet_lock=ACCT-00_SCOPE_REPAIR_OWNER_PACKET_LOCK",
    `profile_count=${profiles.length}`,
    `decision_count=${missingLeadVisibility.length + missingBusinessScope.length}`,
    `role_codes=${roleCodes.length > 0 ? roleCodes.join(",") : "none"}`,
    "required_inputs=safe_owner_repair_labels_generated,owner_action_packet_generated,role_codes_recorded,decision_count_recorded,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded",
    "required_dependency_record=safe_label,role_code,owner_label_mapped,owner_lane_confirmed,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded",
    "blocked_if=safe_owner_repair_labels_missing,owner_action_packet_missing,role_codes_missing,decision_count_mismatch,owner_label_unmapped,secure_owner_lookup_channel_missing,controlled_evidence_id_missing,raw_profile_id_present",
    "next_allowed_step=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX",
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

function formatScopeRepairOwnerDecisionMatrix(
  missingLeadVisibility,
  missingBusinessScope,
  roleById,
) {
  const profilesById = new Map();

  for (const profile of missingLeadVisibility) {
    profilesById.set(profile.id, profile);
  }

  for (const profile of missingBusinessScope) {
    profilesById.set(profile.id, profile);
  }

  const profiles = Array.from(profilesById.values()).sort((left, right) => {
    const leftRole = roleById.get(left.role_id)?.code ?? "NO_ROLE";
    const rightRole = roleById.get(right.role_id)?.code ?? "NO_ROLE";

    return leftRole.localeCompare(rightRole) || left.id.localeCompare(right.id);
  });
  const roleCodes = Array.from(
    new Set(profiles.map((profile) => roleById.get(profile.role_id)?.code ?? "NO_ROLE")),
  );

  return [
    "scope_repair_owner_decision_matrix=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX",
    `profile_count=${profiles.length}`,
    `decision_count=${missingLeadVisibility.length + missingBusinessScope.length}`,
    `role_codes=${roleCodes.length > 0 ? roleCodes.join(",") : "none"}`,
    `missing_visibility_labels=${formatOwnerRepairLabels(
      missingLeadVisibility,
      "missing_lead_visibility",
      roleById,
    )}`,
    `missing_business_scope_labels=${formatOwnerRepairLabels(
      missingBusinessScope,
      "missing_business_scope",
      roleById,
    )}`,
    "required_owner_record=owner_label_mapped,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded",
    "required_per_label_record=safe_label,role_code,approved_visibility_choice_when_required,approved_segment_or_partner_scope_when_required,owner_reviewer,controlled_evidence_id",
    "blocked_if=owner_label_unmapped,required_visibility_choice_missing,required_business_scope_choice_missing,secure_admin_channel_missing,controlled_evidence_id_missing",
    "next_allowed_step=ACCT-00_SCOPE_BASELINE_OWNER_DECISION",
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
  missingLeadVisibility,
  missingBusinessScope,
  broadLeadVisibility,
  workspaceMismatch,
}) {
  return [
    "scope_decision_checklist=ACCT-00_SCOPE_BASELINE_OWNER_DECISION",
    `missing_visibility=${missingLeadVisibility.length}`,
    `missing_business_scope=${missingBusinessScope.length}`,
    `non_admin_all_visibility=${broadLeadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    "required_closure=lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded,post_repair_snapshot_recorded",
    "no_all_visibility_for_non_admin=true",
    "no_password_or_invite_link=true",
    "no_auto_scope_change=true",
  ].join("; ");
}

function formatScopeRepairExecutionPacket({
  missingLeadVisibility,
  missingBusinessScope,
  broadLeadVisibility,
  workspaceMismatch,
}) {
  return [
    "scope_repair_execution_packet=ACCT-00_SCOPE_REPAIR_EXECUTION",
    `missing_visibility=${missingLeadVisibility.length}`,
    `missing_business_scope=${missingBusinessScope.length}`,
    `non_admin_all_visibility=${broadLeadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    "required_inputs=owner_lane_confirmed,lead_visibility_choice_recorded,business_scope_choice_recorded,secure_admin_channel_recorded",
    "required_execution_record=pre_repair_snapshot_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_verified,post_repair_snapshot_recorded,controlled_evidence_id_recorded",
    "no_all_visibility_for_non_admin=true",
    "no_password_or_invite_link=true",
    "no_raw_profile_id=true",
    "no_service_role_key_in_evidence=true",
    "no_auto_scope_change=true",
    "no_auto_uat_approval=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatScopeRepairDecisionDependencyLock({
  missingLeadVisibility,
  missingBusinessScope,
  broadLeadVisibility,
  workspaceMismatch,
}) {
  return [
    "scope_repair_decision_dependency_lock=ACCT-00_SCOPE_REPAIR_DECISION_DEPENDENCY",
    `missing_visibility=${missingLeadVisibility.length}`,
    `missing_business_scope=${missingBusinessScope.length}`,
    `non_admin_all_visibility=${broadLeadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    "required_inputs=scope_baseline_decision_checklist_closed,lead_visibility_choice_recorded,business_scope_choice_recorded,owner_lane_confirmed,secure_admin_channel_recorded",
    "required_dependency_record=approved_visibility_choice_recorded,approved_business_scope_recorded,owner_lane_confirmed,secure_admin_channel_recorded,controlled_evidence_id_recorded",
    "blocked_if=scope_baseline_decision_checklist_closed=no,owner_lane_confirmed=no,lead_visibility_choice_recorded=no,business_scope_choice_recorded=no,secure_admin_channel_recorded=no",
    "next_allowed_step=ACCT-00_SCOPE_REPAIR_EXECUTION",
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

function formatScopePostRepairRerunProofPacket({
  missingLeadVisibility,
  missingBusinessScope,
  broadLeadVisibility,
  workspaceMismatch,
}) {
  const scopeBaselineClosed =
    missingLeadVisibility.length === 0 &&
    missingBusinessScope.length === 0 &&
    broadLeadVisibility.length === 0 &&
    workspaceMismatch.length === 0;

  return [
    "scope_post_repair_rerun_proof_packet=ACCT-00_SCOPE_POST_REPAIR_RERUN_PROOF",
    `missing_visibility=${missingLeadVisibility.length}`,
    `missing_business_scope=${missingBusinessScope.length}`,
    `non_admin_all_visibility=${broadLeadVisibility.length}`,
    `workspace_mismatch=${workspaceMismatch.length}`,
    `scope_baseline_closed=${scopeBaselineClosed ? "yes" : "no"}`,
    "required_inputs=scope_repair_execution_closed,post_repair_snapshot_recorded,controlled_evidence_id_recorded,owner_lane_confirmed",
    "required_rerun_record=check_heu_user_scope_baseline_repair_queue_rerun,check_heu_negative_control_account_queue_rerun,check_heu_finance_payment_scope_readiness_rerun,check_heu_role_scope_uat_pack_rerun,check_heu_user_account_security_rerun",
    "required_result_record=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,ttgdtx_negative_candidates_recomputed,finance_payment_scope_ready_recorded,role_scope_pack_passed,controlled_evidence_id_recorded",
    "blocked_if=scope_baseline_closed=no,post_repair_snapshot_recorded=no,controlled_evidence_id_recorded=no,negative_control_queue_re_run_recorded=no",
    "next_allowed_step=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION",
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

function formatScopePostRepairVerificationPacket({
  missingLeadVisibility,
  missingBusinessScope,
  broadLeadVisibility,
  workspaceMismatch,
}) {
  const scopeBaselineClosed =
    missingLeadVisibility.length === 0 &&
    missingBusinessScope.length === 0 &&
    broadLeadVisibility.length === 0 &&
    workspaceMismatch.length === 0;

  return [
    "scope_post_repair_verification_packet=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION",
    `missing_visibility=${missingLeadVisibility.length}`,
    `missing_business_scope=${missingBusinessScope.length}`,
    `non_admin_all_visibility=${broadLeadVisibility.length}`,
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
  missingLeadVisibility,
  missingBusinessScope,
  broadLeadVisibility,
  workspaceMismatch,
}) {
  const scopeBaselineClosed =
    missingLeadVisibility.length === 0 &&
    missingBusinessScope.length === 0 &&
    broadLeadVisibility.length === 0 &&
    workspaceMismatch.length === 0;

  return [
    "scope_external_closure_handoff_packet=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF",
    `missing_visibility=${missingLeadVisibility.length}`,
    `missing_business_scope=${missingBusinessScope.length}`,
    `non_admin_all_visibility=${broadLeadVisibility.length}`,
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

function addToSetMap(map, key, value) {
  const current = map.get(key) ?? new Set();
  current.add(value);
  map.set(key, current);
}

function hasBusinessScope(profileId, segmentScopeIdsByUserId, partnerScopeIdsByUserId) {
  return (
    (segmentScopeIdsByUserId.get(profileId)?.size ?? 0) > 0 ||
    (partnerScopeIdsByUserId.get(profileId)?.size ?? 0) > 0
  );
}

function checkStaticGuards() {
  try {
    const packageJson = JSON.parse(read("package.json"));
    const repairQueue = read(repairQueuePath);
    const auditSource = read("scripts/audit-heu-user-account-security.mjs");
    const cutoverPanel = read("components/settings/user-operation-cutover-panel.tsx");
    const businessScope = read(
      "components/settings/user-business-scope-settings.tsx",
    );
    const actions = read("app/settings/actions.ts");

    const requiredTokens = [
      packageJson.scripts?.["check:heu-user-scope-baseline-repair-queue"] ===
      "node scripts/check-heu-user-scope-baseline-repair-queue.mjs"
        ? "package-script-ok"
        : null,
      repairQueue.includes("HEU User Scope Baseline Repair Queue - 2026-07-03")
        ? "doc-title-ok"
        : null,
      repairQueue.includes("USER_SCOPE_BASELINE_REPAIR_READY / NO_GO / BLOCKED")
        ? "decision-lane-ok"
        : null,
      repairQueue.includes("USER-SCOPE-REPAIR-01") &&
      repairQueue.includes("USER-SCOPE-REPAIR-02") &&
      repairQueue.includes("USER-SCOPE-REPAIR-03") &&
      repairQueue.includes("USER-SCOPE-REPAIR-04")
        ? "queue-order-ok"
        : null,
      repairQueue.includes("missing_visibility=2") &&
      repairQueue.includes("missing_business_scope=2")
        ? "live-blocker-ok"
        : null,
      repairQueue.includes("safe_owner_repair_labels")
        ? "owner-labels-ok"
        : null,
      repairQueue.includes("ACCT-00-SCOPE-REPAIR-OWNER-PACKET-LOCK") &&
      repairQueue.includes(
        "scope_repair_owner_packet_lock=ACCT-00_SCOPE_REPAIR_OWNER_PACKET_LOCK",
      ) &&
      repairQueue.includes(
        "required_inputs=safe_owner_repair_labels_generated,owner_action_packet_generated,role_codes_recorded,decision_count_recorded,secure_owner_lookup_channel_recorded,controlled_evidence_id_recorded",
      ) &&
      repairQueue.includes(
        "blocked_if=safe_owner_repair_labels_missing,owner_action_packet_missing,role_codes_missing,decision_count_mismatch,owner_label_unmapped,secure_owner_lookup_channel_missing,controlled_evidence_id_missing,raw_profile_id_present",
      ) &&
      repairQueue.includes("next_allowed_step=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX")
        ? "scope-repair-owner-packet-lock-ok"
        : null,
      repairQueue.includes("ACCT-00-SCOPE-REPAIR-OWNER-DECISION-MATRIX") &&
      repairQueue.includes(
        "scope_repair_owner_decision_matrix=ACCT-00_SCOPE_REPAIR_OWNER_DECISION_MATRIX",
      ) &&
      repairQueue.includes(
        "required_per_label_record=safe_label,role_code,approved_visibility_choice_when_required,approved_segment_or_partner_scope_when_required,owner_reviewer,controlled_evidence_id",
      ) &&
      repairQueue.includes(
        "blocked_if=owner_label_unmapped,required_visibility_choice_missing,required_business_scope_choice_missing,secure_admin_channel_missing,controlled_evidence_id_missing",
      )
        ? "scope-repair-owner-decision-matrix-ok"
        : null,
      repairQueue.includes("ACCT-00-SCOPE-BASELINE-DECISION-CHECKLIST") &&
      repairQueue.includes(
        "scope_decision_checklist=ACCT-00_SCOPE_BASELINE_OWNER_DECISION",
      ) &&
      repairQueue.includes("no_auto_scope_change=true")
        ? "scope-decision-checklist-ok"
        : null,
      repairQueue.includes("ACCT-00-SCOPE-REPAIR-DECISION-DEPENDENCY-LOCK") &&
      repairQueue.includes(
        "scope_repair_decision_dependency_lock=ACCT-00_SCOPE_REPAIR_DECISION_DEPENDENCY",
      ) &&
      repairQueue.includes(
        "blocked_if=scope_baseline_decision_checklist_closed=no,owner_lane_confirmed=no,lead_visibility_choice_recorded=no,business_scope_choice_recorded=no,secure_admin_channel_recorded=no",
      )
        ? "scope-repair-decision-dependency-lock-ok"
        : null,
      repairQueue.includes("ACCT-00-SCOPE-REPAIR-EXECUTION-PACKET") &&
      repairQueue.includes(
        "scope_repair_execution_packet=ACCT-00_SCOPE_REPAIR_EXECUTION",
      ) &&
      repairQueue.includes("no_service_role_key_in_evidence=true")
        ? "scope-repair-execution-packet-ok"
        : null,
      repairQueue.includes("ACCT-00-SCOPE-POST-REPAIR-RERUN-PROOF-PACKET") &&
      repairQueue.includes(
        "scope_post_repair_rerun_proof_packet=ACCT-00_SCOPE_POST_REPAIR_RERUN_PROOF",
      ) &&
      repairQueue.includes(
        "required_rerun_record=check_heu_user_scope_baseline_repair_queue_rerun,check_heu_negative_control_account_queue_rerun,check_heu_finance_payment_scope_readiness_rerun,check_heu_role_scope_uat_pack_rerun,check_heu_user_account_security_rerun",
      ) &&
      repairQueue.includes("next_allowed_step=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION")
        ? "scope-post-repair-rerun-proof-packet-ok"
        : null,
      repairQueue.includes("ACCT-00-SCOPE-POST-REPAIR-VERIFICATION-PACKET") &&
      repairQueue.includes(
        "scope_post_repair_verification_packet=ACCT-00_SCOPE_POST_REPAIR_VERIFICATION",
      ) &&
      repairQueue.includes("next_allowed_step=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF") &&
      repairQueue.includes("no_auto_acceptance=true")
        ? "scope-post-repair-verification-packet-ok"
        : null,
      repairQueue.includes("ACCT-00-SCOPE-EXTERNAL-CLOSURE-HANDOFF-PACKET") &&
      repairQueue.includes(
        "scope_external_closure_handoff_packet=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF",
      ) &&
      repairQueue.includes(
        "required_owner_closure=missing_visibility=0,missing_business_scope=0,non_admin_all_visibility=0,workspace_mismatch=0,lead_visibility_choice_recorded,business_scope_choice_recorded,approved_visibility_choice_applied,approved_business_scope_applied,workspace_preference_inside_scope_confirmed,post_repair_snapshot_recorded,negative_control_queue_re_run_recorded,controlled_evidence_id_recorded",
      ) &&
      repairQueue.includes("next_allowed_step=ACCT-00_NEGATIVE_ACCOUNT_DEPENDENCY")
        ? "scope-external-closure-handoff-packet-ok"
        : null,
      auditSource.includes("check-heu-user-scope-baseline-repair-queue.mjs")
        ? "audit-hook-ok"
        : null,
      cutoverPanel.includes("HEU_USER_SCOPE_BASELINE_REPAIR_QUEUE_20260703.md")
        ? "ui-link-ok"
        : null,
      businessScope.includes(
        'data-heu-scope-owner-approval-ack="P0-17_SCOPE_OWNER_APPROVAL_ACK"',
      ) &&
      businessScope.includes('name="scope_owner_approved"') &&
      businessScope.includes('value="yes"') &&
      businessScope.includes("Owner-approved secure channel confirmed")
        ? "ui-owner-approval-ack-ok"
        : null,
      businessScope.includes(
        'data-heu-scope-controlled-evidence-id="P0-17_SCOPE_CONTROLLED_EVIDENCE_ID"',
      ) &&
      businessScope.includes('name="scope_controlled_evidence_id"') &&
      businessScope.includes("CE-SCOPE-20260703-001") &&
      businessScope.includes("Use a safe redacted reference only")
        ? "ui-controlled-evidence-id-ok"
        : null,
      actions.includes("scope_owner_approved") &&
      actions.includes("scope_owner_approval_required") &&
      actions.includes("owner-approved scope channel confirmed")
        ? "server-owner-approval-guard-ok"
        : null,
      actions.includes("normalizeControlledEvidenceId") &&
      actions.includes("scope_controlled_evidence_id") &&
      actions.includes("scope_controlled_evidence_id_required") &&
      actions.includes("scope_controlled_evidence_id_invalid") &&
      actions.includes("controlled_evidence_id=") &&
      actions.includes("lead_visibility: leadVisibility") &&
      actions.includes("note: scopeUpdateNote")
        ? "server-controlled-evidence-id-guard-ok"
        : null,
      repairQueue.includes("In-App Scope Save Guard") &&
      repairQueue.includes("P0-17_SCOPE_OWNER_APPROVAL_ACK") &&
      repairQueue.includes("scope_owner_approved=yes") &&
      repairQueue.includes("scope_owner_approval_required") &&
      repairQueue.includes("P0-17_SCOPE_CONTROLLED_EVIDENCE_ID") &&
      repairQueue.includes("scope_controlled_evidence_id") &&
      repairQueue.includes("scope_controlled_evidence_id_required") &&
      repairQueue.includes("scope_controlled_evidence_id_invalid") &&
      repairQueue.includes("controlled_evidence_id=<safe token>") &&
      repairQueue.includes("lead_visibility_note_with_controlled_evidence")
        ? "owner-approval-doc-ok"
        : null,
    ];
    const missingCount = requiredTokens.filter((token) => !token).length;

    addStatus(
      "USER-SCOPE-REPAIR-APP-GUARD",
      missingCount === 0 ? "READY" : "NO_GO",
      missingCount === 0
        ? "Scope baseline repair queue doc, package command, UI reference and audit static guard are wired."
        : `Scope baseline repair queue static guards missing: ${missingCount}.`,
    );
  } catch {
    addStatus(
      "USER-SCOPE-REPAIR-APP-GUARD",
      "NO_GO",
      "Scope baseline repair queue static guard check could not complete. Raw errors are not printed.",
    );
  }
}

const localEnv = staticOnly ? {} : parseEnvFile(envPath);
const missingKeys = staticOnly
  ? []
  : requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

if (!staticOnly) {
  addStatus(
    "USER-SCOPE-REPAIR-ENV",
    missingKeys.length === 0 ? "READY" : "NO_GO",
    missingKeys.length === 0
      ? ".env.local has required Supabase env keys. Values are intentionally hidden."
      : `.env.local missing or placeholder keys: ${missingKeys.join(", ")}.`,
  );
}

checkStaticGuards();

if (staticOnly) {
  addStatus(
    "USER-SCOPE-REPAIR-STATIC-ONLY",
    "READY",
    "Static-only mode verified the PASS_LOCAL queue package without reading live Supabase data or changing scope.",
  );
} else if (missingKeys.length === 0) {
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
    ] = await Promise.all([
      fetchAllRows(
        adminClient,
        "users_profile",
        "id,role_id,status",
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
    ]);

    const readFailed =
      profilesResult.error ||
      rolesResult.error ||
      leadVisibilityResult.error ||
      segmentScopesResult.error ||
      partnerScopesResult.error ||
      workspacePreferencesResult.error;

    addStatus(
      "USER-SCOPE-REPAIR-DB-READ",
      readFailed ? "NO_GO" : "READY",
      readFailed
        ? "Could not read one or more scope baseline tables. Raw errors are not printed."
        : "Scope baseline tables are readable with the server-only service role key.",
    );

    if (!readFailed) {
      const profiles = profilesResult.data ?? [];
      const roles = rolesResult.data ?? [];
      const leadVisibilityRows = leadVisibilityResult.data ?? [];
      const segmentScopes = segmentScopesResult.data ?? [];
      const partnerScopes = partnerScopesResult.data ?? [];
      const workspacePreferences = workspacePreferencesResult.data ?? [];
      const roleById = new Map(roles.map((row) => [row.id, row]));
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
      const missingLeadVisibility = activeNonPrivilegedProfiles.filter(
        (profile) => !visibilityByUserId.has(profile.id),
      );
      const broadLeadVisibility = activeNonPrivilegedProfiles.filter(
        (profile) => visibilityByUserId.get(profile.id) === "ALL",
      );
      const missingBusinessScope = activeNonPrivilegedProfiles.filter(
        (profile) =>
          !hasBusinessScope(
            profile.id,
            segmentScopeIdsByUserId,
            partnerScopeIdsByUserId,
          ),
      );
      const workspaceMismatch = activeNonPrivilegedProfiles.filter((profile) => {
        const segmentIds = segmentScopeIdsByUserId.get(profile.id);
        const activeSegmentId = workspacePreferenceByUserId.get(profile.id);

        return Boolean(segmentIds?.size) && !segmentIds.has(activeSegmentId);
      });

      addStatus(
        "USER-SCOPE-REPAIR-LEAD-VISIBILITY",
        missingLeadVisibility.length === 0 ? "READY" : "NO_GO",
        missingLeadVisibility.length === 0
          ? "Every active non-ADMIN/BGH profile has explicit lead visibility."
          : `missing_visibility=${missingLeadVisibility.length}; owner must choose OWN/TEAM/DEPARTMENT visibility through Settings/RPC before cutover.`,
      );

      addStatus(
        "USER-SCOPE-REPAIR-BUSINESS-SCOPE",
        missingBusinessScope.length === 0 ? "READY" : "NO_GO",
        missingBusinessScope.length === 0
          ? "Every active non-ADMIN/BGH profile has at least one active segment or partner scope."
          : `missing_business_scope=${missingBusinessScope.length}; owner must approve segment/partner scope before position assignment or cutover.`,
      );

      addStatus(
        "USER-SCOPE-REPAIR-NO-BROAD-VISIBILITY",
        broadLeadVisibility.length === 0 ? "READY" : "NO_GO",
        broadLeadVisibility.length === 0
          ? "No active non-ADMIN/BGH profile has lead visibility ALL."
          : `non_admin_all_visibility=${broadLeadVisibility.length}; reduce broad visibility before cutover.`,
      );

      addStatus(
        "USER-SCOPE-REPAIR-WORKSPACE",
        workspaceMismatch.length === 0 ? "READY" : "NO_GO",
        workspaceMismatch.length === 0
          ? "Every scoped non-ADMIN/BGH profile has workspace preference inside assigned segment scope."
          : `workspace_mismatch=${workspaceMismatch.length}; fix active workspace before cutover.`,
      );

      addStatus(
        "USER-SCOPE-REPAIR-OWNER-LABELS",
        "READY",
        [
          `safe_owner_repair_labels=lead_visibility:${formatOwnerRepairLabels(
            missingLeadVisibility,
            "missing_lead_visibility",
            roleById,
          )}`,
          `business_scope:${formatOwnerRepairLabels(
            missingBusinessScope,
            "missing_business_scope",
            roleById,
          )}`,
          "hash labels are for secure owner-side lookup only",
        ].join("; "),
      );

      addStatus(
        "USER-SCOPE-REPAIR-OWNER-PACKET",
        "READY",
        formatOwnerActionPacket(
          missingLeadVisibility,
          missingBusinessScope,
          roleById,
        ),
      );

      addStatus(
        "ACCT-00-SCOPE-REPAIR-OWNER-PACKET-LOCK",
        "READY",
        formatScopeRepairOwnerPacketLock(
          missingLeadVisibility,
          missingBusinessScope,
          roleById,
        ),
      );

      addStatus(
        "ACCT-00-SCOPE-REPAIR-OWNER-DECISION-MATRIX",
        "READY",
        formatScopeRepairOwnerDecisionMatrix(
          missingLeadVisibility,
          missingBusinessScope,
          roleById,
        ),
      );

      addStatus(
        "ACCT-00-SCOPE-BASELINE-DECISION-CHECKLIST",
        "READY",
        formatScopeBaselineDecisionChecklist({
          missingLeadVisibility,
          missingBusinessScope,
          broadLeadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-REPAIR-DECISION-DEPENDENCY-LOCK",
        "READY",
        formatScopeRepairDecisionDependencyLock({
          missingLeadVisibility,
          missingBusinessScope,
          broadLeadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-REPAIR-EXECUTION-PACKET",
        "READY",
        formatScopeRepairExecutionPacket({
          missingLeadVisibility,
          missingBusinessScope,
          broadLeadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-POST-REPAIR-RERUN-PROOF-PACKET",
        "READY",
        formatScopePostRepairRerunProofPacket({
          missingLeadVisibility,
          missingBusinessScope,
          broadLeadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-POST-REPAIR-VERIFICATION-PACKET",
        "READY",
        formatScopePostRepairVerificationPacket({
          missingLeadVisibility,
          missingBusinessScope,
          broadLeadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "ACCT-00-SCOPE-EXTERNAL-CLOSURE-HANDOFF-PACKET",
        "READY",
        formatScopeExternalClosureHandoffPacket({
          missingLeadVisibility,
          missingBusinessScope,
          broadLeadVisibility,
          workspaceMismatch,
        }),
      );

      addStatus(
        "USER-SCOPE-REPAIR-NO-AUTO-ACTION",
        "READY",
        "This checker is read-only; owner-approved scope repair must be applied through Settings/RPC or a secure admin channel, not by this script.",
      );

      addStatus(
        "USER-SCOPE-REPAIR-SECRET-BOUNDARY",
        "READY",
        "The queue reports counts and safe process labels only; it does not print emails, names, phone numbers, passwords, reset links, service-role keys or raw IDs.",
      );

      addStatus(
        "USER-SCOPE-REPAIR-SUMMARY",
        "READY",
        [
          `active_profiles=${profiles.length}`,
          `active_non_admin_bgh=${activeNonPrivilegedProfiles.length}`,
          `missing_visibility=${missingLeadVisibility.length}`,
          `missing_business_scope=${missingBusinessScope.length}`,
          `non_admin_all_visibility=${broadLeadVisibility.length}`,
          `workspace_mismatch=${workspaceMismatch.length}`,
        ].join("; "),
      );
    }
  } catch {
    addStatus(
      "USER-SCOPE-REPAIR-CHECK",
      "NO_GO",
      "Scope baseline repair queue check could not complete. Check server env/project and database schema. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "USER-SCOPE-REPAIR-CHECK",
    "NO_GO",
    "Scope baseline repair queue checks were skipped because required env keys are missing.",
  );
}

console.log("HEU user scope baseline repair queue check");
console.log(
  "Secrets, emails, names, phone numbers and raw IDs are never printed by this script.",
);
console.log(
  "Repair order: USER-SCOPE-REPAIR-01 -> USER-SCOPE-REPAIR-02 -> USER-SCOPE-REPAIR-03 -> USER-SCOPE-REPAIR-04.",
);

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
