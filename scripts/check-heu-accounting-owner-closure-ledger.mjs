import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const ledgerPath = "docs/HEU_ACCOUNTING_UAT_OWNER_CLOSURE_LEDGER_20260703.md";
const statuses = [];

function addStatus(code, status, detail) {
  statuses.push({ code, status, detail });
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireTokens(contents, tokens) {
  return tokens.filter((token) => !contents.includes(token));
}

function countToken(contents, token) {
  return contents.split(token).length - 1;
}

function tableRows(contents, prefix) {
  return contents
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith(`| ${prefix}`));
}

function countRowsWithToken(rows, token) {
  return rows.filter((row) => row.includes(token)).length;
}

function formatOwnerUatRouteChecklist({
  pendingRouteExternalEvidence,
  pendingRouteOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "owner_route_checklist=ACCT-12_OWNER_UAT_ROUTE",
    `pending_route_external_evidence=${pendingRouteExternalEvidence}`,
    `pending_route_owner=${pendingRouteOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_order=UAT-ROUTE-01 before UAT-ROUTE-02 before UAT-ROUTE-03 before UAT-ROUTE-04 before UAT-ROUTE-05 before UAT-ROUTE-06 before UAT-ROUTE-07 before UAT-ROUTE-08 before UAT-ROUTE-09 before UAT-ROUTE-10 before UAT-ROUTE-11",
    "required_closure=pending_route_external_evidence=0,pending_route_owner=0,pending_acceptance_owner=0,finance_reliance_decision_recorded,final_owner_go_no_go_recorded",
    "no_raw_pii_or_payment_evidence=true",
    "no_auto_approval=true",
  ].join("; ");
}

function formatNegativeControlProofDependencyLock({
  pendingRouteExternalEvidence,
  pendingRouteOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "negative_control_proof_dependency_lock=ACCT-12_NEGATIVE_CONTROL_PROOF_DEPENDENCY",
    `pending_route_external_evidence=${pendingRouteExternalEvidence}`,
    `pending_route_owner=${pendingRouteOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed,negative_control_final_proof_decision_packet_closed,negative_control_proof_decision_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded,blocker_state_recorded",
    "required_dependency_record=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed,ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION_closed,scope_baseline_closed,negative_control_proof_ready_verified,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,linked_signed_route_evidence_packet_recorded",
    "blocked_if=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed=no,scope_baseline_closed=no,negative_control_proof_ready=no,ttgdtx_negative_candidates=0,missing_visibility>0,missing_business_scope>0",
    "next_allowed_step=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE",
    "no_raw_screenshot_or_pii=true",
    "no_password_or_invite_link=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatSignedRouteEvidenceIntakePacket({
  pendingRouteExternalEvidence,
  pendingRouteOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "signed_route_evidence_packet=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE",
    "source=accounting_owner_closure_ledger_runtime",
    `pending_route_external_evidence=${pendingRouteExternalEvidence}`,
    `pending_route_owner=${pendingRouteOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=negative_control_proof_closed,route_execution_log_reviewed,controlled_evidence_storage_confirmed,owner_lane_confirmed",
    "required_route_record=uat_route_id_recorded,controlled_evidence_id_recorded,redaction_reviewer_recorded,route_result_recorded,route_owner_signature_recorded,linked_acceptance_item_recorded,blocker_state_recorded",
    "no_raw_screenshot_or_pii=true",
    "no_raw_pii_or_payment_evidence=true",
    "no_password_or_invite_link=true",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatFinanceRelianceDependencyLock({
  pendingRouteExternalEvidence,
  pendingRouteOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "finance_reliance_dependency_lock=ACCT-12_FINANCE_RELIANCE_DEPENDENCY",
    "source=accounting_owner_closure_ledger_runtime",
    `pending_route_external_evidence=${pendingRouteExternalEvidence}`,
    `pending_route_owner=${pendingRouteOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=signed_route_evidence_closed,negative_control_dependency_closed,legal_finance_gate_signed,no_duplicate_ledger_signed,risk_closure_signed,dashboard_finance_desk_signed,access_closure_route_recorded",
    "required_dependency_record=signed_route_evidence_packet_closed,negative_control_proof_dependency_lock_closed,p0_19_legal_finance_gate_signed,no_duplicate_ledger_signed,final_risk_decision_packet_closed,dashboard_finance_desk_signed,access_closure_route_recorded",
    "blocked_if=signed_route_evidence_closed=no,negative_control_proof_ready=no,legal_finance_gate_signed=no,no_duplicate_ledger_signed=no,risk_closure_signed=no,dashboard_finance_desk_signed=no,access_closure_route_recorded=no",
    "next_allowed_step=ACCT-12_FINANCE_RELIANCE_DECISION",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_voucher_posting=true",
    "no_bank_transfer=true",
    "no_owner_go_inference=true",
    "no_auto_approval=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatFinalOwnerDecisionChecklist({
  pendingRouteExternalEvidence,
  pendingRouteOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "owner_decision_checklist=ACCT-12_FINAL_OWNER_DECISION",
    `pending_route_external_evidence=${pendingRouteExternalEvidence}`,
    `pending_route_owner=${pendingRouteOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_closure=finance_reliance_decision_recorded,final_owner_go_no_go_recorded,owner_quorum_recorded,access_closure_decision_recorded,controlled_evidence_ids_recorded",
    "no_finance_reliance_inference=true",
    "no_uat_pass_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatFinalOwnerDependencyLock({
  pendingRouteExternalEvidence,
  pendingRouteOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "final_owner_dependency_lock=ACCT-12_FINAL_OWNER_DEPENDENCY",
    "source=accounting_owner_closure_ledger_runtime",
    `pending_route_external_evidence=${pendingRouteExternalEvidence}`,
    `pending_route_owner=${pendingRouteOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=finance_reliance_decision_closed,access_closure_decision_closed,signed_route_evidence_closed,final_risk_decision_closed,p0_09_owner_packet_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded",
    "required_dependency_record=finance_reliance_decision_recorded,access_closure_decision_recorded,signed_route_evidence_packet_closed,final_risk_decision_packet_closed,p0_09_final_owner_packet_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded,blocker_state_recorded",
    "blocked_if=finance_reliance_decision_recorded=no,access_closure_decision_recorded=no,final_risk_decision_recorded=no,p0_09_final_owner_packet_recorded=no,owner_quorum_recorded=no,controlled_evidence_ids_recorded=no",
    "next_allowed_step=ACCT-12_FINAL_OWNER_DECISION",
    "no_evidence_acceptance=true",
    "no_uat_pass_inference=true",
    "no_finance_reliance_inference=true",
    "no_access_closure_inference=true",
    "no_owner_go_inference=true",
    "no_auto_approval=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatFinanceRelianceDecisionChecklist({
  pendingRouteExternalEvidence,
  pendingRouteOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "finance_reliance_checklist=ACCT-12_FINANCE_RELIANCE_DECISION",
    `pending_route_external_evidence=${pendingRouteExternalEvidence}`,
    `pending_route_owner=${pendingRouteOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=scope_negative_control_closed,legal_finance_gate_signed,no_duplicate_ledger_signed,risk_closure_signed,dashboard_finance_desk_signed,access_closure_recorded",
    "required_closure=finance_reliance_decision_recorded,finance_owner_recorded,accountant_access_decision_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "no_finance_reliance_inference=true",
    "no_voucher_posting=true",
    "no_bank_transfer=true",
    "no_auto_approval=true",
  ].join("; ");
}

function formatAccessClosureDependencyLock({
  pendingRouteExternalEvidence,
  pendingRouteOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "access_closure_dependency_lock=ACCT-12_ACCESS_CLOSURE_DEPENDENCY",
    "source=accounting_owner_closure_ledger_runtime",
    `pending_route_external_evidence=${pendingRouteExternalEvidence}`,
    `pending_route_owner=${pendingRouteOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=finance_reliance_decision_closed,signed_route_evidence_closed,negative_control_dependency_closed,scope_baseline_closed,risk_closure_signed,p0_17_access_closure_route_recorded,owner_lane_confirmed",
    "required_dependency_record=finance_reliance_decision_recorded,finance_owner_recorded,accountant_access_decision_recorded,signed_route_evidence_packet_closed,negative_control_proof_dependency_lock_closed,scope_baseline_closed,final_risk_decision_packet_closed,p0_17_access_closure_route_recorded",
    "blocked_if=finance_reliance_decision_recorded=no,signed_route_evidence_closed=no,scope_baseline_closed=no,risk_closure_signed=no,p0_17_access_closure_route_recorded=no,owner_lane_confirmed=no",
    "next_allowed_step=ACCT-12_ACCESS_CLOSURE_DECISION",
    "no_password_or_invite_link=true",
    "no_auto_access_change=true",
    "no_account_create=true",
    "no_scope_grant=true",
    "no_evidence_acceptance=true",
    "no_finance_reliance_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatAccessClosureDecisionChecklist({
  pendingRouteExternalEvidence,
  pendingRouteOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "access_closure_checklist=ACCT-12_ACCESS_CLOSURE_DECISION",
    `pending_route_external_evidence=${pendingRouteExternalEvidence}`,
    `pending_route_owner=${pendingRouteOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=scope_baseline_closed,negative_control_proof_closed,signed_route_evidence_closed,finance_reliance_decision_recorded,risk_closure_signed",
    "required_closure=accountant_retain_revoke_block_recorded,privileged_access_review_recorded,temporary_access_removed,negative_account_access_locked,access_closure_decision_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "no_password_or_invite_link=true",
    "no_auto_access_change=true",
    "no_finance_reliance_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

console.log("HEU accounting UAT owner closure ledger check");
console.log(
  "Mode: PASS_LOCAL read-only owner ledger check. It does not execute UAT, create accounts, assign permissions, accept evidence, approve legal position, approve finance reliance, approve payout, approve migration, approve waiver, approve owner GO/NO-GO or mark production GO.",
);

if (!existsSync(path.join(repoRoot, ledgerPath))) {
  addStatus("ACCT-12-OWNER-LEDGER-FILE", "NO_GO", `Missing ${ledgerPath}.`);
} else {
  const ledger = read(ledgerPath);
  const packageJson = JSON.parse(read("package.json"));
  const missingTokens = requireTokens(ledger, [
    "Status: PASS_LOCAL_OWNER_LEDGER_TEMPLATE",
    "ACCT_12_OWNER_READY / NO_GO / BLOCKED",
    "ACCT-12-ROUTE-01",
    "ACCT-12-ROUTE-11",
    "ACCT-12-ACCEPT-01",
    "ACCT-12-ACCEPT-06",
    "ACCT-12-BLOCKER-01",
    "HEU_ACCOUNTING_NEGATIVE_CONTROL_OWNER_ACTION_QUEUE_20260703.md",
    "ACCT-12-OWNER-UAT-ROUTE-CHECKLIST",
    "owner_route_checklist=ACCT-12_OWNER_UAT_ROUTE",
    "ACCT-12-NEGATIVE-CONTROL-PROOF-DEPENDENCY-LOCK",
    "negative_control_proof_dependency_lock=ACCT-12_NEGATIVE_CONTROL_PROOF_DEPENDENCY",
    "required_inputs=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed,negative_control_final_proof_decision_packet_closed,negative_control_proof_decision_recorded,controlled_evidence_id_recorded,reviewer_recorded,owner_decision_recorded,blocker_state_recorded",
    "required_dependency_record=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed,ACCT-00_NEGATIVE_CONTROL_FINAL_PROOF_DECISION_closed,scope_baseline_closed,negative_control_proof_ready_verified,lead_route_denial_recorded,finance_route_denial_recorded,evidence_route_denial_recorded,audit_route_denial_recorded,settings_route_denial_recorded,linked_signed_route_evidence_packet_recorded",
    "blocked_if=ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed=no,scope_baseline_closed=no,negative_control_proof_ready=no,ttgdtx_negative_candidates=0,missing_visibility>0,missing_business_scope>0",
    "next_allowed_step=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE",
    "negative_control_final_proof_decision_packet_closed",
    "ACCT-00_SCOPE_EXTERNAL_CLOSURE_HANDOFF_closed",
    "scope_baseline_closed",
    "negative_control_proof_ready_verified",
    "linked_signed_route_evidence_packet_recorded",
    "ACCT-12-SIGNED-ROUTE-EVIDENCE-INTAKE-PACKET",
    "signed_route_evidence_packet=ACCT-12_SIGNED_ROUTE_EVIDENCE_INTAKE",
    "source=accounting_owner_closure_ledger_runtime",
    "required_inputs=negative_control_proof_closed,route_execution_log_reviewed,controlled_evidence_storage_confirmed,owner_lane_confirmed",
    "required_route_record=uat_route_id_recorded,controlled_evidence_id_recorded,redaction_reviewer_recorded,route_result_recorded,route_owner_signature_recorded,linked_acceptance_item_recorded,blocker_state_recorded",
    "uat_route_id_recorded",
    "redaction_reviewer_recorded",
    "route_owner_signature_recorded",
    "linked_acceptance_item_recorded",
    "blocker_state_recorded",
    "ACCT-12-FINANCE-RELIANCE-DEPENDENCY-LOCK",
    "finance_reliance_dependency_lock=ACCT-12_FINANCE_RELIANCE_DEPENDENCY",
    "source=accounting_owner_closure_ledger_runtime",
    "required_inputs=signed_route_evidence_closed,negative_control_dependency_closed,legal_finance_gate_signed,no_duplicate_ledger_signed,risk_closure_signed,dashboard_finance_desk_signed,access_closure_route_recorded",
    "required_dependency_record=signed_route_evidence_packet_closed,negative_control_proof_dependency_lock_closed,p0_19_legal_finance_gate_signed,no_duplicate_ledger_signed,final_risk_decision_packet_closed,dashboard_finance_desk_signed,access_closure_route_recorded",
    "blocked_if=signed_route_evidence_closed=no,negative_control_proof_ready=no,legal_finance_gate_signed=no,no_duplicate_ledger_signed=no,risk_closure_signed=no,dashboard_finance_desk_signed=no,access_closure_route_recorded=no",
    "next_allowed_step=ACCT-12_FINANCE_RELIANCE_DECISION",
    "signed_route_evidence_packet_closed",
    "negative_control_proof_dependency_lock_closed",
    "p0_19_legal_finance_gate_signed",
    "no_duplicate_ledger_signed",
    "final_risk_decision_packet_closed",
    "dashboard_finance_desk_signed",
    "access_closure_route_recorded",
    "ACCT-12-FINANCE-RELIANCE-DECISION-CHECKLIST",
    "finance_reliance_checklist=ACCT-12_FINANCE_RELIANCE_DECISION",
    "required_inputs=scope_negative_control_closed,legal_finance_gate_signed,no_duplicate_ledger_signed,risk_closure_signed,dashboard_finance_desk_signed,access_closure_recorded",
    "required_closure=finance_reliance_decision_recorded,finance_owner_recorded,accountant_access_decision_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "finance_owner_recorded",
    "accountant_access_decision_recorded",
    "no_voucher_posting=true",
    "no_bank_transfer=true",
    "ACCT-12-ACCESS-CLOSURE-DEPENDENCY-LOCK",
    "access_closure_dependency_lock=ACCT-12_ACCESS_CLOSURE_DEPENDENCY",
    "source=accounting_owner_closure_ledger_runtime",
    "required_inputs=finance_reliance_decision_closed,signed_route_evidence_closed,negative_control_dependency_closed,scope_baseline_closed,risk_closure_signed,p0_17_access_closure_route_recorded,owner_lane_confirmed",
    "required_dependency_record=finance_reliance_decision_recorded,finance_owner_recorded,accountant_access_decision_recorded,signed_route_evidence_packet_closed,negative_control_proof_dependency_lock_closed,scope_baseline_closed,final_risk_decision_packet_closed,p0_17_access_closure_route_recorded",
    "blocked_if=finance_reliance_decision_recorded=no,signed_route_evidence_closed=no,scope_baseline_closed=no,risk_closure_signed=no,p0_17_access_closure_route_recorded=no,owner_lane_confirmed=no",
    "next_allowed_step=ACCT-12_ACCESS_CLOSURE_DECISION",
    "p0_17_access_closure_route_recorded",
    "no_account_create=true",
    "no_scope_grant=true",
    "ACCT-12-ACCESS-CLOSURE-DECISION-CHECKLIST",
    "access_closure_checklist=ACCT-12_ACCESS_CLOSURE_DECISION",
    "required_inputs=scope_baseline_closed,negative_control_proof_closed,signed_route_evidence_closed,finance_reliance_decision_recorded,risk_closure_signed",
    "required_closure=accountant_retain_revoke_block_recorded,privileged_access_review_recorded,temporary_access_removed,negative_account_access_locked,access_closure_decision_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "accountant_retain_revoke_block_recorded",
    "privileged_access_review_recorded",
    "temporary_access_removed",
    "negative_account_access_locked",
    "ACCT-12-FINAL-OWNER-DEPENDENCY-LOCK",
    "final_owner_dependency_lock=ACCT-12_FINAL_OWNER_DEPENDENCY",
    "source=accounting_owner_closure_ledger_runtime",
    "required_inputs=finance_reliance_decision_closed,access_closure_decision_closed,signed_route_evidence_closed,final_risk_decision_closed,p0_09_owner_packet_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded",
    "required_dependency_record=finance_reliance_decision_recorded,access_closure_decision_recorded,signed_route_evidence_packet_closed,final_risk_decision_packet_closed,p0_09_final_owner_packet_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded,blocker_state_recorded",
    "blocked_if=finance_reliance_decision_recorded=no,access_closure_decision_recorded=no,final_risk_decision_recorded=no,p0_09_final_owner_packet_recorded=no,owner_quorum_recorded=no,controlled_evidence_ids_recorded=no",
    "next_allowed_step=ACCT-12_FINAL_OWNER_DECISION",
    "p0_09_final_owner_packet_recorded",
    "no_access_closure_inference=true",
    "no_password_or_invite_link=true",
    "no_auto_access_change=true",
    "ACCT-12-FINAL-OWNER-DECISION-CHECKLIST",
    "owner_decision_checklist=ACCT-12_FINAL_OWNER_DECISION",
    "required_closure=finance_reliance_decision_recorded,final_owner_go_no_go_recorded,owner_quorum_recorded,access_closure_decision_recorded,controlled_evidence_ids_recorded",
    "finance_reliance_decision_recorded",
    "final_owner_go_no_go_recorded",
    "owner_quorum_recorded",
    "access_closure_decision_recorded",
    "controlled_evidence_ids_recorded",
    "no_raw_pii_or_payment_evidence=true",
    "no_raw_screenshot_or_pii=true",
    "no_auto_approval=true",
    "no_finance_reliance_inference=true",
    "no_evidence_acceptance=true",
    "no_owner_go_inference=true",
    "no_uat_pass_inference=true",
    "no_auto_production_go=true",
    "UAT-ROUTE-01 through UAT-ROUTE-11",
    "REAL_OPS_03_UAT_CLOSURE_READY / NO_GO / BLOCKED",
    "REAL_OPS_04_FINANCE_RELIANCE_READY / NO_GO / BLOCKED",
    "REAL_OPS_08_FINAL_OWNER_READY / NO_GO / BLOCKED",
    "P0_09_FINAL_GO / NO_GO / BLOCKED",
    "ttgdtx_negative_candidates=0",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "PENDING_EXTERNAL_EVIDENCE",
    "PENDING_OWNER",
    "does not execute UAT",
    "accept evidence",
    "approve finance reliance",
    "production GO",
    "npm.cmd run check:heu-negative-control-account-queue",
    "npm.cmd run audit:ttgdtx-signed-uat-execution-routing-hub",
    "npm.cmd run audit:ttgdtx-production-owner-signoff-pack",
    "npm.cmd run audit:ttgdtx-production-readiness-guard",
  ]);
  const routeRows = tableRows(ledger, "ACCT-12-ROUTE-");
  const acceptanceRows = tableRows(ledger, "ACCT-12-ACCEPT-");
  const pendingExternalEvidence = countToken(ledger, "PENDING_EXTERNAL_EVIDENCE");
  const pendingOwner = countToken(ledger, "PENDING_OWNER");
  const pendingRouteExternalEvidence = countRowsWithToken(
    routeRows,
    "PENDING_EXTERNAL_EVIDENCE",
  );
  const pendingRouteOwner = countRowsWithToken(routeRows, "PENDING_OWNER");
  const pendingAcceptanceOwner = countRowsWithToken(
    acceptanceRows,
    "PENDING_OWNER",
  );
  const packageScriptOk =
    packageJson.scripts?.["check:heu-accounting-owner-closure-ledger"] ===
    "node scripts/check-heu-accounting-owner-closure-ledger.mjs";

  addStatus(
    "ACCT-12-OWNER-STATIC-GUARD",
    missingTokens.length === 0 && packageScriptOk ? "READY" : "NO_GO",
    missingTokens.length === 0 && packageScriptOk
      ? "Owner closure ledger template, package command and local guard references are wired."
      : `Owner closure static guard missing tokens/scripts: tokens=${missingTokens.length}; package_script=${packageScriptOk ? "ok" : "missing"}.`,
  );

  addStatus(
    "ACCT-12-OWNER-ROUTE-COVERAGE",
    routeRows.length === 11 && acceptanceRows.length >= 6 ? "READY" : "NO_GO",
    `route_rows=${routeRows.length}; acceptance_rows=${acceptanceRows.length}; UAT-ROUTE-01..11 and owner acceptance closure rows are present.`,
  );

  addStatus(
    "ACCT-12-OWNER-EVIDENCE-CLOSURE",
    pendingExternalEvidence === 0 && pendingOwner === 0 ? "READY" : "NO_GO",
    pendingExternalEvidence === 0 && pendingOwner === 0
      ? "No pending external evidence or owner decision placeholders remain in ACCT-12."
      : [
          `pending_external_evidence=${pendingExternalEvidence}`,
          `pending_owner=${pendingOwner}`,
          `pending_route_external_evidence=${pendingRouteExternalEvidence}`,
          `pending_route_owner=${pendingRouteOwner}`,
          `pending_acceptance_owner=${pendingAcceptanceOwner}`,
          "owners must close signed route evidence, finance reliance, risk closure and final GO/NO-GO outside Git/Codex/chat.",
        ].join("; "),
  );

  addStatus(
    "ACCT-12-OWNER-UAT-ROUTE-CHECKLIST",
    "READY",
    formatOwnerUatRouteChecklist({
      pendingRouteExternalEvidence,
      pendingRouteOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-12-NEGATIVE-CONTROL-PROOF-DEPENDENCY-LOCK",
    "READY",
    formatNegativeControlProofDependencyLock({
      pendingRouteExternalEvidence,
      pendingRouteOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-12-SIGNED-ROUTE-EVIDENCE-INTAKE-PACKET",
    "READY",
    formatSignedRouteEvidenceIntakePacket({
      pendingRouteExternalEvidence,
      pendingRouteOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-12-FINANCE-RELIANCE-DEPENDENCY-LOCK",
    "READY",
    formatFinanceRelianceDependencyLock({
      pendingRouteExternalEvidence,
      pendingRouteOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-12-FINANCE-RELIANCE-DECISION-CHECKLIST",
    "READY",
    formatFinanceRelianceDecisionChecklist({
      pendingRouteExternalEvidence,
      pendingRouteOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-12-ACCESS-CLOSURE-DEPENDENCY-LOCK",
    "READY",
    formatAccessClosureDependencyLock({
      pendingRouteExternalEvidence,
      pendingRouteOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-12-ACCESS-CLOSURE-DECISION-CHECKLIST",
    "READY",
    formatAccessClosureDecisionChecklist({
      pendingRouteExternalEvidence,
      pendingRouteOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-12-FINAL-OWNER-DEPENDENCY-LOCK",
    "READY",
    formatFinalOwnerDependencyLock({
      pendingRouteExternalEvidence,
      pendingRouteOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-12-FINAL-OWNER-DECISION-CHECKLIST",
    "READY",
    formatFinalOwnerDecisionChecklist({
      pendingRouteExternalEvidence,
      pendingRouteOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-12-OWNER-NO-AUTO-ACTION",
    "READY",
    "This checker is read-only; it never creates accounts, changes scope, records signatures, accepts evidence or approves finance/owner decisions.",
  );

  addStatus(
    "ACCT-12-OWNER-SECRET-BOUNDARY",
    "READY",
    "The ledger must use controlled evidence IDs only; passwords, invite/reset links, raw PII, bank data and raw payment evidence must stay outside Git/Codex/chat.",
  );
}

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
