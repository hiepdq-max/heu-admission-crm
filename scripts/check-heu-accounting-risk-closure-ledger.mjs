import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const ledgerPath = "docs/HEU_ACCOUNTING_RISK_CLOSURE_LEDGER_20260703.md";
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

function formatRiskOwnerActionPacket({
  pendingRiskExternalEvidence,
  pendingRiskOwner,
  pendingAcceptanceOwner,
}) {
  const requiredDecisions = [
    pendingRiskExternalEvidence > 0 ? "close_audit_trace_evidence" : null,
    pendingRiskExternalEvidence > 0 ? "close_hard_delete_cascade_evidence" : null,
    pendingRiskExternalEvidence > 0 ? "close_backup_restore_proof" : null,
    pendingRiskExternalEvidence > 0 ? "sign_migration_order" : null,
    pendingRiskExternalEvidence > 0 ? "accept_rollback_redaction_proof" : null,
    pendingRiskOwner + pendingAcceptanceOwner > 0
      ? "record_final_risk_decision"
      : null,
  ].filter(Boolean);

  return [
    "owner_action_packet=ACCT-11_RISK_CLOSURE",
    "owner_lanes=Audit,IT_DATA,KHTC,PHAP_CHE,BGH,process_owners",
    `pending_risk_external_evidence=${pendingRiskExternalEvidence}`,
    `pending_risk_owner=${pendingRiskOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    `required_owner_decisions=${pendingRiskOwner + pendingAcceptanceOwner}`,
    `required_decisions=${requiredDecisions.length > 0 ? requiredDecisions.join(",") : "none"}`,
    "repair_order=ACCT-11-AUDIT before ACCT-11-HD before ACCT-11-BR before ACCT-11-MIG before ACCT-11-ROLLBACK before ACCT-11-FINAL",
    "packet is owner-side routing only and does not accept evidence",
  ].join("; ");
}

function formatRiskEvidenceIntakeChecklist({
  pendingRiskExternalEvidence,
  pendingRiskOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "risk_evidence_checklist=ACCT-11_EVIDENCE_INTAKE",
    `pending_risk_external_evidence=${pendingRiskExternalEvidence}`,
    `pending_risk_owner=${pendingRiskOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_order=ACCT-11-AUDIT before ACCT-11-HD before ACCT-11-BR before ACCT-11-MIG before ACCT-11-ROLLBACK before ACCT-11-FINAL",
    "required_closure=pending_risk_external_evidence=0,pending_risk_owner=0,pending_acceptance_owner=0,controlled_evidence_ids_recorded",
    "no_raw_backup_or_database_export=true",
    "no_auto_acceptance=true",
  ].join("; ");
}

function formatAuditTraceClosureChecklist({
  pendingRiskExternalEvidence,
  pendingRiskOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "audit_trace_checklist=ACCT-11_AUDIT_TRACE_CLOSURE",
    `pending_risk_external_evidence=${pendingRiskExternalEvidence}`,
    `pending_risk_owner=${pendingRiskOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=ttgdtx_write_trigger_coverage_confirmed,audit_trace_ui_confirmed,acceptance_matrix_reviewed,decision_manifest_reviewed",
    "required_closure=audit_log_trigger_coverage_recorded,sampled_actor_recorded,sampled_entity_recorded,sampled_action_recorded,sampled_timestamp_recorded,before_after_usefulness_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "no_raw_audit_payload=true",
    "no_audit_log_mutation=true",
    "no_auto_acceptance=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatHardDeleteCascadeClosureChecklist({
  pendingRiskExternalEvidence,
  pendingRiskOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "hard_delete_cascade_checklist=ACCT-11_HARD_DELETE_CASCADE_CLOSURE",
    `pending_risk_external_evidence=${pendingRiskExternalEvidence}`,
    `pending_risk_owner=${pendingRiskOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=audit_trace_closed,p6_06_boundary_guard_passed,cascade_finding_register_reviewed,conversion_or_waiver_path_identified",
    "required_closure=ttgdtx_hard_delete_boundary_recorded,p6_06_findings_triaged,conversion_or_written_waiver_recorded,protected_record_retention_recorded,cascade_execution_blocked,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "no_hard_delete_execution=true",
    "no_cascade_execution=true",
    "no_owner_waiver_inference=true",
    "no_auto_acceptance=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatBackupRestoreProofChecklist({
  pendingRiskExternalEvidence,
  pendingRiskOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "backup_restore_checklist=ACCT-11_BACKUP_RESTORE_PROOF",
    `pending_risk_external_evidence=${pendingRiskExternalEvidence}`,
    `pending_risk_owner=${pendingRiskOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=audit_trace_closed,hard_delete_boundary_closed,restore_target_identified,rollback_redaction_path_defined",
    "required_closure=backup_id_recorded,restore_target_recorded,target_isolation_recorded,restore_smoke_check_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "no_raw_backup_or_database_export=true",
    "no_migration_approval=true",
    "no_auto_acceptance=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatMigrationOrderSignoffChecklist({
  pendingRiskExternalEvidence,
  pendingRiskOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "migration_order_checklist=ACCT-11_MIGRATION_ORDER_SIGNOFF",
    `pending_risk_external_evidence=${pendingRiskExternalEvidence}`,
    `pending_risk_owner=${pendingRiskOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=backup_restore_proof_closed,audit_trace_closed,hard_delete_boundary_closed,rollback_redaction_path_defined",
    "required_closure=step90_step110_order_signed,signer_authority_recorded,migration_scope_recorded,exception_decisions_recorded,rollback_note_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "no_migration_execution=true",
    "no_auto_migration_approval=true",
    "no_auto_acceptance=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatRollbackRedactionProofChecklist({
  pendingRiskExternalEvidence,
  pendingRiskOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "rollback_redaction_checklist=ACCT-11_ROLLBACK_REDACTION_PROOF",
    `pending_risk_external_evidence=${pendingRiskExternalEvidence}`,
    `pending_risk_owner=${pendingRiskOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=backup_restore_proof_closed,migration_order_signed,audit_trace_closed,protected_evidence_identified",
    "required_closure=rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,audit_history_retained,cleanup_scope_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "no_hard_delete_execution=true",
    "no_cascade_execution=true",
    "no_evidence_destruction=true",
    "no_auto_acceptance=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatFinalRiskDecisionChecklist({
  pendingRiskExternalEvidence,
  pendingRiskOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "risk_decision_checklist=ACCT-11_FINAL_RISK_DECISION",
    `pending_risk_external_evidence=${pendingRiskExternalEvidence}`,
    `pending_risk_owner=${pendingRiskOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_closure=final_risk_decision_recorded,owner_quorum_recorded,waiver_or_correction_recorded,boundary_acknowledged",
    "no_owner_waiver_inference=true",
    "no_auto_migration_approval=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatFinalRiskDependencyLock({
  pendingRiskExternalEvidence,
  pendingRiskOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "final_risk_dependency_lock=ACCT-11_FINAL_RISK_DEPENDENCY",
    `pending_risk_external_evidence=${pendingRiskExternalEvidence}`,
    `pending_risk_owner=${pendingRiskOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "required_dependency_record=audit_log_trigger_coverage_recorded,p6_06_findings_triaged,backup_id_recorded,restore_smoke_check_recorded,step90_step110_order_signed,rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "blocked_if=audit_trace_closed=no,hard_delete_cascade_closed=no,backup_restore_proof_closed=no,migration_order_signed=no,rollback_redaction_proof_closed=no,controlled_evidence_ids_recorded=no,owner_quorum_recorded=no",
    "next_allowed_step=ACCT-11_FINAL_RISK_DECISION",
    "no_evidence_acceptance=true",
    "no_owner_waiver_inference=true",
    "no_finance_reliance_inference=true",
    "no_uat_pass_inference=true",
    "no_owner_go_inference=true",
    "no_auto_migration_approval=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatFinalRiskDecisionPacket({
  pendingRiskExternalEvidence,
  pendingRiskOwner,
  pendingAcceptanceOwner,
}) {
  return [
    "final_risk_decision_packet=ACCT-11_FINAL_RISK_DECISION_PACKET",
    `pending_risk_external_evidence=${pendingRiskExternalEvidence}`,
    `pending_risk_owner=${pendingRiskOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    "required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,controlled_evidence_ids_recorded",
    "allowed_decision_values=PASS,NO_GO,BLOCKED",
    "required_decision_record=final_risk_decision_recorded,owner_quorum_recorded,residual_risk_statement_recorded,waiver_or_correction_recorded,boundary_acknowledged,controlled_evidence_ids_recorded",
    "no_owner_waiver_inference=true",
    "no_evidence_acceptance=true",
    "no_migration_execution=true",
    "no_auto_migration_approval=true",
    "no_finance_reliance_inference=true",
    "no_uat_pass_inference=true",
    "no_owner_go_inference=true",
    "no_auto_production_go=true",
  ].join("; ");
}

function formatRiskExternalEvidenceHandoffPacket({
  pendingRiskExternalEvidence,
  pendingRiskOwner,
  pendingAcceptanceOwner,
}) {
  const riskClosureReady =
    pendingRiskExternalEvidence === 0 &&
    pendingRiskOwner === 0 &&
    pendingAcceptanceOwner === 0;

  return [
    "risk_external_evidence_handoff_packet=ACCT-11_RISK_EXTERNAL_EVIDENCE_HANDOFF",
    "source=accounting_risk_closure_ledger_runtime",
    `pending_risk_external_evidence=${pendingRiskExternalEvidence}`,
    `pending_risk_owner=${pendingRiskOwner}`,
    `pending_acceptance_owner=${pendingAcceptanceOwner}`,
    `risk_closure_ready=${riskClosureReady ? "yes" : "no"}`,
    "required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,final_risk_decision_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded",
    "required_owner_closure=pending_risk_external_evidence=0,pending_risk_owner=0,pending_acceptance_owner=0,audit_log_trigger_coverage_recorded,p6_06_findings_triaged,backup_id_recorded,restore_smoke_check_recorded,step90_step110_order_signed,rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,final_risk_decision_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded",
    "blocked_if=pending_risk_external_evidence>0,pending_risk_owner>0,pending_acceptance_owner>0,final_risk_decision_recorded=no,owner_quorum_recorded=no,controlled_evidence_ids_recorded=no",
    "next_allowed_step=ACCT-12_FINANCE_RELIANCE_DEPENDENCY",
    "no_raw_backup_or_database_export=true",
    "no_evidence_acceptance=true",
    "no_finance_reliance_inference=true",
    "no_uat_pass_inference=true",
    "no_owner_go_inference=true",
    "no_auto_migration_approval=true",
    "no_auto_production_go=true",
  ].join("; ");
}

console.log("HEU accounting risk closure ledger check");
console.log(
  "Mode: PASS_LOCAL read-only ledger check. It does not execute backup, restore, migration, deletion, rollback, UAT, evidence acceptance, finance action, owner waiver, owner GO/NO-GO or production GO.",
);

if (!existsSync(path.join(repoRoot, ledgerPath))) {
  addStatus("ACCT-11-RISK-LEDGER-FILE", "NO_GO", `Missing ${ledgerPath}.`);
} else {
  const ledger = read(ledgerPath);
  const packageJson = JSON.parse(read("package.json"));
  const missingTokens = requireTokens(ledger, [
    "Status: PASS_LOCAL_RISK_LEDGER_TEMPLATE",
    "ACCT_11_RISK_READY / NO_GO / BLOCKED",
    "ACCT-11-AUDIT-01",
    "ACCT-11-AUDIT-02",
    "ACCT-11-HD-01",
    "ACCT-11-HD-02",
    "ACCT-11-BR-01",
    "ACCT-11-BR-02",
    "ACCT-11-MIG-01",
    "ACCT-11-ROLLBACK-01",
    "ACCT-11-FINAL-01",
    "ACCT-11-ACCEPT-01",
    "ACCT-11-ACCEPT-06",
    "ACCT-11-RISK-OWNER-PACKET",
    "owner_action_packet=ACCT-11_RISK_CLOSURE",
    "ACCT-11-RISK-EVIDENCE-INTAKE-CHECKLIST",
    "risk_evidence_checklist=ACCT-11_EVIDENCE_INTAKE",
    "ACCT-11-AUDIT-TRACE-CLOSURE-CHECKLIST",
    "audit_trace_checklist=ACCT-11_AUDIT_TRACE_CLOSURE",
    "required_inputs=ttgdtx_write_trigger_coverage_confirmed,audit_trace_ui_confirmed,acceptance_matrix_reviewed,decision_manifest_reviewed",
    "required_closure=audit_log_trigger_coverage_recorded,sampled_actor_recorded,sampled_entity_recorded,sampled_action_recorded,sampled_timestamp_recorded,before_after_usefulness_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "audit_log_trigger_coverage_recorded",
    "sampled_actor_recorded",
    "sampled_entity_recorded",
    "sampled_action_recorded",
    "sampled_timestamp_recorded",
    "before_after_usefulness_recorded",
    "no_raw_audit_payload=true",
    "no_audit_log_mutation=true",
    "ACCT-11-HARD-DELETE-CASCADE-CLOSURE-CHECKLIST",
    "hard_delete_cascade_checklist=ACCT-11_HARD_DELETE_CASCADE_CLOSURE",
    "required_inputs=audit_trace_closed,p6_06_boundary_guard_passed,cascade_finding_register_reviewed,conversion_or_waiver_path_identified",
    "required_closure=ttgdtx_hard_delete_boundary_recorded,p6_06_findings_triaged,conversion_or_written_waiver_recorded,protected_record_retention_recorded,cascade_execution_blocked,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "ttgdtx_hard_delete_boundary_recorded",
    "p6_06_findings_triaged",
    "conversion_or_written_waiver_recorded",
    "protected_record_retention_recorded",
    "cascade_execution_blocked",
    "ACCT-11-BACKUP-RESTORE-PROOF-CHECKLIST",
    "backup_restore_checklist=ACCT-11_BACKUP_RESTORE_PROOF",
    "required_inputs=audit_trace_closed,hard_delete_boundary_closed,restore_target_identified,rollback_redaction_path_defined",
    "required_closure=backup_id_recorded,restore_target_recorded,target_isolation_recorded,restore_smoke_check_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "backup_id_recorded",
    "restore_target_recorded",
    "target_isolation_recorded",
    "restore_smoke_check_recorded",
    "no_migration_approval=true",
    "ACCT-11-MIGRATION-ORDER-SIGNOFF-CHECKLIST",
    "migration_order_checklist=ACCT-11_MIGRATION_ORDER_SIGNOFF",
    "required_inputs=backup_restore_proof_closed,audit_trace_closed,hard_delete_boundary_closed,rollback_redaction_path_defined",
    "required_closure=step90_step110_order_signed,signer_authority_recorded,migration_scope_recorded,exception_decisions_recorded,rollback_note_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "step90_step110_order_signed",
    "signer_authority_recorded",
    "migration_scope_recorded",
    "exception_decisions_recorded",
    "rollback_note_recorded",
    "no_migration_execution=true",
    "ACCT-11-ROLLBACK-REDACTION-PROOF-CHECKLIST",
    "rollback_redaction_checklist=ACCT-11_ROLLBACK_REDACTION_PROOF",
    "required_inputs=backup_restore_proof_closed,migration_order_signed,audit_trace_closed,protected_evidence_identified",
    "required_closure=rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,audit_history_retained,cleanup_scope_recorded,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "rollback_path_recorded",
    "redaction_path_recorded",
    "protected_evidence_retained",
    "audit_history_retained",
    "cleanup_scope_recorded",
    "no_hard_delete_execution=true",
    "no_cascade_execution=true",
    "no_evidence_destruction=true",
    "ACCT-11-FINAL-RISK-DEPENDENCY-LOCK",
    "final_risk_dependency_lock=ACCT-11_FINAL_RISK_DEPENDENCY",
    "required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "required_dependency_record=audit_log_trigger_coverage_recorded,p6_06_findings_triaged,backup_id_recorded,restore_smoke_check_recorded,step90_step110_order_signed,rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,controlled_evidence_ids_recorded,owner_quorum_recorded",
    "blocked_if=audit_trace_closed=no,hard_delete_cascade_closed=no,backup_restore_proof_closed=no,migration_order_signed=no,rollback_redaction_proof_closed=no,controlled_evidence_ids_recorded=no,owner_quorum_recorded=no",
    "next_allowed_step=ACCT-11_FINAL_RISK_DECISION",
    "ACCT-11-RISK-FINAL-DECISION-CHECKLIST",
    "risk_decision_checklist=ACCT-11_FINAL_RISK_DECISION",
    "ACCT-11-FINAL-RISK-DECISION-PACKET",
    "final_risk_decision_packet=ACCT-11_FINAL_RISK_DECISION_PACKET",
    "required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,controlled_evidence_ids_recorded",
    "allowed_decision_values=PASS,NO_GO,BLOCKED",
    "required_decision_record=final_risk_decision_recorded,owner_quorum_recorded,residual_risk_statement_recorded,waiver_or_correction_recorded,boundary_acknowledged,controlled_evidence_ids_recorded",
    "ACCT-11-RISK-EXTERNAL-EVIDENCE-HANDOFF-PACKET",
    "risk_external_evidence_handoff_packet=ACCT-11_RISK_EXTERNAL_EVIDENCE_HANDOFF",
    "source=accounting_risk_closure_ledger_runtime",
    "required_inputs=audit_trace_closed,hard_delete_cascade_closed,backup_restore_proof_closed,migration_order_signed,rollback_redaction_proof_closed,final_risk_decision_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded",
    "required_owner_closure=pending_risk_external_evidence=0,pending_risk_owner=0,pending_acceptance_owner=0,audit_log_trigger_coverage_recorded,p6_06_findings_triaged,backup_id_recorded,restore_smoke_check_recorded,step90_step110_order_signed,rollback_path_recorded,redaction_path_recorded,protected_evidence_retained,final_risk_decision_recorded,owner_quorum_recorded,controlled_evidence_ids_recorded",
    "blocked_if=pending_risk_external_evidence>0,pending_risk_owner>0,pending_acceptance_owner>0,final_risk_decision_recorded=no,owner_quorum_recorded=no,controlled_evidence_ids_recorded=no",
    "next_allowed_step=ACCT-12_FINANCE_RELIANCE_DEPENDENCY",
    "residual_risk_statement_recorded",
    "final_risk_decision_recorded",
    "owner_quorum_recorded",
    "waiver_or_correction_recorded",
    "boundary_acknowledged",
    "no_owner_waiver_inference=true",
    "no_evidence_acceptance=true",
    "no_finance_reliance_inference=true",
    "no_uat_pass_inference=true",
    "no_owner_go_inference=true",
    "no_auto_migration_approval=true",
    "no_auto_production_go=true",
    "controlled_evidence_ids_recorded",
    "no_raw_backup_or_database_export=true",
    "no_auto_acceptance=true",
    "PENDING_EXTERNAL_EVIDENCE",
    "PENDING_OWNER",
    "does not execute backup",
    "approve migration",
    "approve finance action",
    "production GO",
    "npm.cmd run audit:ttgdtx-audit-log",
    "npm.cmd run audit:ttgdtx-audit-trail-guard",
    "npm.cmd run audit:hard-delete-boundary-guard",
    "npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack",
    "npm.cmd run audit:ttgdtx-migration-order-guard",
  ]);
  const riskRows = tableRows(ledger, "ACCT-11-");
  const acceptanceRows = tableRows(ledger, "ACCT-11-ACCEPT-");
  const requiredRiskRows = riskRows.filter(
    (row) => !row.includes("ACCT-11-ACCEPT-"),
  );
  const pendingExternalEvidence = countToken(ledger, "PENDING_EXTERNAL_EVIDENCE");
  const pendingOwner = countToken(ledger, "PENDING_OWNER");
  const pendingRiskExternalEvidence = countRowsWithToken(
    requiredRiskRows,
    "PENDING_EXTERNAL_EVIDENCE",
  );
  const pendingRiskOwner = countRowsWithToken(requiredRiskRows, "PENDING_OWNER");
  const pendingAcceptanceOwner = countRowsWithToken(
    acceptanceRows,
    "PENDING_OWNER",
  );
  const packageScriptOk =
    packageJson.scripts?.["check:heu-accounting-risk-closure-ledger"] ===
    "node scripts/check-heu-accounting-risk-closure-ledger.mjs";

  addStatus(
    "ACCT-11-RISK-STATIC-GUARD",
    missingTokens.length === 0 && packageScriptOk ? "READY" : "NO_GO",
    missingTokens.length === 0 && packageScriptOk
      ? "Risk ledger template, package command and local guard references are wired."
      : `Risk ledger static guard missing tokens/scripts: tokens=${missingTokens.length}; package_script=${packageScriptOk ? "ok" : "missing"}.`,
  );

  addStatus(
    "ACCT-11-RISK-ROW-COVERAGE",
    riskRows.length >= 15 && acceptanceRows.length >= 6 ? "READY" : "NO_GO",
    `risk_rows=${riskRows.length}; acceptance_rows=${acceptanceRows.length}; expected risk plus acceptance closure rows are present.`,
  );

  addStatus(
    "ACCT-11-RISK-EVIDENCE-CLOSURE",
    pendingExternalEvidence === 0 && pendingOwner === 0 ? "READY" : "NO_GO",
    pendingExternalEvidence === 0 && pendingOwner === 0
      ? "No pending external evidence or owner decision placeholders remain in ACCT-11."
      : [
          `pending_external_evidence=${pendingExternalEvidence}`,
          `pending_owner=${pendingOwner}`,
          `pending_risk_external_evidence=${pendingRiskExternalEvidence}`,
          `pending_risk_owner=${pendingRiskOwner}`,
          `pending_acceptance_owner=${pendingAcceptanceOwner}`,
          "Audit/IT_DATA/KHTC/PHAP_CHE/BGH/process owners must close evidence outside Git/Codex/chat.",
        ].join("; "),
  );

  addStatus(
    "ACCT-11-RISK-OWNER-PACKET",
    "READY",
    formatRiskOwnerActionPacket({
      pendingRiskExternalEvidence,
      pendingRiskOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-11-RISK-EVIDENCE-INTAKE-CHECKLIST",
    "READY",
    formatRiskEvidenceIntakeChecklist({
      pendingRiskExternalEvidence,
      pendingRiskOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-11-AUDIT-TRACE-CLOSURE-CHECKLIST",
    "READY",
    formatAuditTraceClosureChecklist({
      pendingRiskExternalEvidence,
      pendingRiskOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-11-HARD-DELETE-CASCADE-CLOSURE-CHECKLIST",
    "READY",
    formatHardDeleteCascadeClosureChecklist({
      pendingRiskExternalEvidence,
      pendingRiskOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-11-BACKUP-RESTORE-PROOF-CHECKLIST",
    "READY",
    formatBackupRestoreProofChecklist({
      pendingRiskExternalEvidence,
      pendingRiskOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-11-MIGRATION-ORDER-SIGNOFF-CHECKLIST",
    "READY",
    formatMigrationOrderSignoffChecklist({
      pendingRiskExternalEvidence,
      pendingRiskOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-11-ROLLBACK-REDACTION-PROOF-CHECKLIST",
    "READY",
    formatRollbackRedactionProofChecklist({
      pendingRiskExternalEvidence,
      pendingRiskOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-11-FINAL-RISK-DEPENDENCY-LOCK",
    "READY",
    formatFinalRiskDependencyLock({
      pendingRiskExternalEvidence,
      pendingRiskOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-11-RISK-FINAL-DECISION-CHECKLIST",
    "READY",
    formatFinalRiskDecisionChecklist({
      pendingRiskExternalEvidence,
      pendingRiskOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-11-FINAL-RISK-DECISION-PACKET",
    "READY",
    formatFinalRiskDecisionPacket({
      pendingRiskExternalEvidence,
      pendingRiskOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-11-RISK-EXTERNAL-EVIDENCE-HANDOFF-PACKET",
    "READY",
    formatRiskExternalEvidenceHandoffPacket({
      pendingRiskExternalEvidence,
      pendingRiskOwner,
      pendingAcceptanceOwner,
    }),
  );

  addStatus(
    "ACCT-11-RISK-NO-AUTO-ACTION",
    "READY",
    "This checker is read-only; it reports ledger closure status and never creates evidence, executes migration/rollback, approves waiver or changes data.",
  );

  addStatus(
    "ACCT-11-RISK-SECRET-BOUNDARY",
    "READY",
    "The ledger must use controlled evidence IDs only; raw backup, restore, payout, bank, student, voucher or database evidence must stay outside Git/Codex/chat.",
  );
}

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
