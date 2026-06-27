import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

const failures = [];

function fail(message) {
  failures.push(message);
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(relativePath, pattern, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  if (!pattern.test(contents)) {
    fail(`${relativePath}: missing ${label}`);
  }
}

const requiredFiles = [
  "docs/MIGRATION_ORDER_AUDIT.md",
  "docs/HARD_DELETE_AUDIT.md",
  "docs/STEP109_ROLE_PERMISSION_UAT_RUNBOOK.md",
  "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
  "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md",
  "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md",
  "docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md",
  "docs/TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627.md",
  "docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  "docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md",
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  "docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md",
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md",
  "docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_DATA_MASTER_P0_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_DATA_DICTIONARY_MIN_20260627_V01_DRAFT.md",
  "docs/HEU_SOP_TO_DATA_MAPPING_20260627_V01_DRAFT.md",
  "docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_DATA_MODEL_V1.md",
  "docs/HEU_DATA_DICTIONARY_V1.md",
  "docs/GIT_CLEANUP_ANALYSIS.md",
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  "docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md",
  "docs/HEU_ROLE_PERMISSION_MATRIX_V1.md",
  "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md",
  "docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CODEX_OPERATING_PLAYBOOK.md",
  "docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "docs/TTGDTX_LINKED_OPERATING_REVIEW_20260625.md",
  "docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md",
  "docs/TTGDTX_PROCESS_CODE_MAP_20260625.md",
  "docs/TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627.md",
  "docs/TTGDTX_BANK_RECEIPT_BATCH_POLICY_20260627.md",
  "docs/TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627.md",
  "docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md",
  "docs/HEU_LEAD_LIFECYCLE_STANDARD_20260627.md",
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  "docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md",
  "docs/TTGDTX_CONTRACT_TUITION_MASTER_GUARD_20260627.md",
  "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
  "docs/P2_13_RECONCILIATION_REPAIR_SAFETY_UAT_RUNBOOK.md",
  "docs/TTGDTX_LEAD_QUICK_FIX_UAT_RUNBOOK.md",
  "docs/TTGDTX_SYNTHETIC_REAL_LIKE_UAT_PACK_20260627.md",
  "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md",
  "fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json",
  "components/audit/controlled-evidence-redaction-guard.tsx",
  "components/audit/hard-delete-boundary-guard.tsx",
  "components/audit/hard-delete-conversion-decision-queue.tsx",
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  "components/audit/ttgdtx-audit-log-uat-evidence-checklist.tsx",
  "components/audit/ttgdtx-audit-trail-guard.tsx",
  "components/ai/ai-risk-suggestion-board.tsx",
  "components/ai/ai-task-checklist-generator.tsx",
  "components/master-control/production-readiness-blocker-summary.tsx",
  "components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx",
  "components/ttgdtx/ttgdtx-dashboard-readonly-guard.tsx",
  "components/ttgdtx/ttgdtx-dashboard-source-reconciliation-checklist.tsx",
  "components/ttgdtx/ttgdtx-dashboard-uat-evidence-checklist.tsx",
  "components/ttgdtx/ttgdtx-operating-control-strip.tsx",
  "components/ttgdtx/ttgdtx-process-quick-finder.tsx",
  "components/ttgdtx/ttgdtx-account-control-scope-guard.tsx",
  "components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx",
  "components/ttgdtx/ttgdtx-contract-tuition-master-guard.tsx",
  "components/ttgdtx/ttgdtx-p019-gate-guard.tsx",
  "components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx",
  "components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx",
  "components/ttgdtx/ttgdtx-payout-duplicate-guard.tsx",
  "components/ttgdtx/ttgdtx-payout-execution-readiness-checklist.tsx",
  "components/ttgdtx/ttgdtx-payout-uat-evidence-checklist.tsx",
  "components/ttgdtx/ttgdtx-production-evidence-binder.tsx",
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  "components/ttgdtx/ttgdtx-production-readiness-guard.tsx",
  "components/ttgdtx/ttgdtx-uat-signoff-guard.tsx",
  "components/leads/lead-lifecycle-guard.tsx",
  "components/leads/lead-handover-panel.tsx",
  "components/settings/supabase-backup-restore-guard.tsx",
  "components/settings/user-scope-enforcement-panel.tsx",
  "app/finance-desk/page.tsx",
  "database/step111_heu_finance_desk.sql",
  "lib/lead-lifecycle.ts",
  "lib/production-readiness.ts",
  "lib/ttgdtx-invoice-policy.ts",
  "lib/ttgdtx-operating-controls.ts",
  "lib/ttgdtx-process-labels.ts",
  "lib/vnd-money.ts",
  "scripts/audit-heu-backlog-codes.mjs",
  "scripts/audit-heu-bgh-dashboard-spec.mjs",
  "scripts/audit-heu-controlled-evidence-redaction-pack.mjs",
  "scripts/audit-heu-current-state-inventory.mjs",
  "scripts/audit-heu-data-foundation.mjs",
  "scripts/audit-heu-finance-desk.mjs",
  "scripts/audit-heu-final-handoff-coverage.mjs",
  "scripts/audit-heu-git-hygiene.mjs",
  "scripts/audit-heu-implementation-log.mjs",
  "scripts/audit-heu-ai-policy.mjs",
  "scripts/audit-heu-lead-handover-policy.mjs",
  "scripts/audit-heu-lead-lifecycle-handover-uat-pack.mjs",
  "scripts/audit-heu-lead-lifecycle-standard.mjs",
  "scripts/audit-heu-non-ttgdtx-cascade-review.mjs",
  "scripts/audit-heu-p0-register-pack.mjs",
  "scripts/audit-heu-production-blocker-source.mjs",
  "scripts/audit-heu-production-evidence-binder.mjs",
  "scripts/audit-heu-role-scope-uat-pack.mjs",
  "scripts/audit-heu-sql-object-master-map.mjs",
  "scripts/audit-heu-vietnamese-text-encoding.mjs",
  "scripts/audit-hard-delete-boundary-guard.mjs",
  "scripts/audit-hard-delete-conversion-decision-queue.mjs",
  "scripts/audit-ttgdtx-account-control-scope-decision.mjs",
  "scripts/audit-ttgdtx-audit-trail-guard.mjs",
  "scripts/audit-ttgdtx-backup-restore-dry-run-pack.mjs",
  "scripts/audit-ttgdtx-accounting-dashboard-uat-plan.mjs",
  "scripts/audit-ttgdtx-contract-tuition-master-guard.mjs",
  "scripts/audit-ttgdtx-dashboard-readonly-guard.mjs",
  "scripts/audit-ttgdtx-dashboard-source-reconciliation.mjs",
  "scripts/audit-ttgdtx-synthetic-uat-pack.mjs",
  "scripts/audit-ttgdtx-invoice-policy.mjs",
  "scripts/audit-ttgdtx-migration-order-guard.mjs",
  "scripts/audit-ttgdtx-operating-control-ui.mjs",
  "scripts/audit-ttgdtx-p019-gate-guard.mjs",
  "scripts/audit-ttgdtx-payment-dossier-checklist.mjs",
  "scripts/audit-ttgdtx-period-lock-policy.mjs",
  "scripts/audit-ttgdtx-production-owner-signoff-pack.mjs",
  "scripts/audit-ttgdtx-payout-duplicate-guard.mjs",
  "scripts/audit-ttgdtx-payout-execution-readiness.mjs",
  "scripts/audit-ttgdtx-production-readiness-guard.mjs",
  "scripts/audit-ttgdtx-process-labels.mjs",
  "scripts/audit-ttgdtx-receivable-payment-lifecycle.mjs",
  "scripts/audit-vnd-money-format.mjs",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = JSON.parse(read("package.json"));
const requiredScripts = [
  "audit:heu-ai-policy",
  "audit:heu-backlog-codes",
  "audit:heu-bgh-dashboard-spec",
  "audit:heu-controlled-evidence-redaction-pack",
  "audit:heu-current-state-inventory",
  "audit:heu-data-foundation",
  "audit:heu-finance-desk",
  "audit:heu-final-handoff-coverage",
  "audit:heu-git-hygiene",
  "audit:heu-implementation-log",
  "audit:heu-lead-handover-policy",
  "audit:heu-lead-lifecycle-handover-uat-pack",
  "audit:heu-lead-lifecycle-standard",
  "audit:heu-non-ttgdtx-cascade-review",
  "audit:heu-p0-register-pack",
  "audit:heu-production-blocker-source",
  "audit:heu-production-evidence-binder",
  "audit:heu-role-scope-uat-pack",
  "audit:heu-sql-object-master-map",
  "audit:heu-vietnamese-text-encoding",
  "audit:hard-delete",
  "audit:hard-delete-boundary-guard",
  "audit:hard-delete-conversion-decision-queue",
  "audit:vnd-money-format",
  "audit:permission-soft-revoke",
  "audit:ttgdtx-account-control-scope-decision",
  "audit:ttgdtx-accounting-dashboard-uat-plan",
  "audit:ttgdtx-audit-log",
  "audit:ttgdtx-audit-trail-guard",
  "audit:ttgdtx-backup-restore-dry-run-pack",
  "audit:ttgdtx-cascade",
  "audit:ttgdtx-contract-tuition-master-guard",
  "audit:ttgdtx-dashboard-access",
  "audit:ttgdtx-dashboard-readonly-guard",
  "audit:ttgdtx-dashboard-source-reconciliation",
  "audit:ttgdtx-data-fetch-gate",
  "audit:ttgdtx-generic-source-evidence",
  "audit:ttgdtx-invoice-policy",
  "audit:ttgdtx-lead-quick-fix-safety",
  "audit:ttgdtx-migration-order-guard",
  "audit:ttgdtx-operating-control-ui",
  "audit:ttgdtx-p019-gate-guard",
  "audit:ttgdtx-payment-dossier-checklist",
  "audit:ttgdtx-pilot-open-safety",
  "audit:ttgdtx-payout-duplicate-guard",
  "audit:ttgdtx-payout-execution-readiness",
  "audit:ttgdtx-period-lock-policy",
  "audit:ttgdtx-production-owner-signoff-pack",
  "audit:ttgdtx-production-readiness-guard",
  "audit:ttgdtx-process-labels",
  "audit:ttgdtx-receivable-payment-lifecycle",
  "audit:ttgdtx-reconciliation-repair-safety",
  "audit:ttgdtx-role-scope-access",
  "audit:ttgdtx-step110-safety",
  "audit:ttgdtx-synthetic-uat-pack",
  "audit:ttgdtx-uat-readiness",
  "audit:ttgdtx-release-gates",
];

for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) {
    fail(`package.json: missing npm script ${script}`);
  }
}

requireText(
  "docs/MIGRATION_ORDER_AUDIT.md",
  /step90[\s\S]*step110/i,
  "Step90 through Step110 migration scope",
);

requireText(
  "docs/MIGRATION_ORDER_AUDIT.md",
  /STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK\.md/,
  "backup/rollback runbook reference",
);

requireText(
  "docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  /Production remains NO-GO/i,
  "NO-GO production statement",
);

requireText(
  "docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  /Backup Evidence Template/i,
  "backup evidence template",
);

requireText(
  "docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  /Restore Dry-Run Flow/i,
  "restore dry-run flow",
);

requireText(
  "docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  /STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md[\s\S]*Complete the operator run sheet through P0-03-RUN-03/i,
  "backup/restore operator run sheet integration",
);

requireText(
  "docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  /Do not run production migration from Codex\/chat/i,
  "Codex/chat production migration boundary",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  /PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,\s+production migration is approved, or production GO is approved/i,
  "backup/restore evidence pack local-only boundary",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TEMPLATE)(?=[\s\S]*does not execute backup, restore, migration, rollback, UAT\s+acceptance, owner waiver or production GO)(?=[\s\S]*P0-03-RUN-01)(?=[\s\S]*P0-03-RUN-06)(?=[\s\S]*BACKUP_RESTORE_RUN_READY \/ STOP \/ BLOCKED)(?=[\s\S]*Immediate Stop Conditions)(?=[\s\S]*does not prove an actual backup, restore, migration\s+dry-run, rollback proof, UAT pass, owner sign-off or production GO)/i,
  "backup/restore operator run sheet local-only boundary",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  /Do not paste secrets, passwords, OTPs, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data/i,
  "backup/restore evidence pack secret boundary",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  /(?=[\s\S]*Restore Smoke-Check Acceptance Matrix)(?=[\s\S]*data-p003-restore-smoke-check-acceptance-matrix="P0-03")(?=[\s\S]*P0-03-SMOKE-01)(?=[\s\S]*P0-03-SMOKE-07)(?=[\s\S]*Lead handover finance gate preserved)(?=[\s\S]*P0-19\/P2-05\/P2-03)(?=[\s\S]*RESTORE_SMOKE_CHECK_PASS \/ FAIL \/ BLOCKED)(?=[\s\S]*PASS_LOCAL does not prove an actual restore, smoke-check, UAT pass, rollback\s+proof, migration approval or production GO)/i,
  "backup/restore smoke-check acceptance evidence pack",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  /(?=[\s\S]*P0-03 External Evidence Manifest)(?=[\s\S]*P0-03-EVID-01)(?=[\s\S]*P0-03-EVID-06)(?=[\s\S]*EVIDENCE_INDEX_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Missing evidence ID, uncontrolled storage, raw sensitive attachment or unsigned\s+owner decision keeps production NO-GO)/i,
  "backup/restore external evidence manifest pack",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  /(?=[\s\S]*P0-03 Backup\/Restore Closure Decision Manifest)(?=[\s\S]*data-p003-backup-restore-closure-decision-manifest="P0-03")(?=[\s\S]*P0-03-CLOSE-01)(?=[\s\S]*P0-03-CLOSE-06)(?=[\s\S]*P0_03_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*PASS_LOCAL keeps P0-03 at evidence-structure readiness only)/i,
  "backup/restore closure decision manifest pack",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  /(?=[\s\S]*STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md)(?=[\s\S]*data-p003-backup-restore-operator-run-sheet="P0-03")(?=[\s\S]*P0-03-RUN-01 through P0-03-RUN-06)(?=[\s\S]*BACKUP_RESTORE_RUN_READY \/ STOP \/ BLOCKED)/i,
  "backup/restore operator run sheet evidence pack reference",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  /(?=[\s\S]*data-supabase-backup-restore-guard="P0-03")(?=[\s\S]*P0-03 Supabase backup\/restore dry-run)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Production remains NO-GO until real backup evidence, restore\s+evidence, migration preflight\/postflight results and owner\s+sign-off exist)(?=[\s\S]*PASS_LOCAL does not mean backup was executed,\s+restore was executed, UAT passed, production migration is\s+approved, or production GO is approved)(?=[\s\S]*Do not run production migration from Codex\/chat)(?=[\s\S]*secrets, passwords, OTPs, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data)(?=[\s\S]*Backup ID \/ snapshot ID)(?=[\s\S]*Restore target project\/ref)(?=[\s\S]*App connection checked against restore target)(?=[\s\S]*Human sign-off)(?=[\s\S]*audit:ttgdtx-backup-restore-dry-run-pack)(?=[\s\S]*audit:ttgdtx-release-gates)(?=[\s\S]*npm\.cmd run build)/i,
  "P0-03 Supabase backup/restore UI guard",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  /(?=[\s\S]*data-p003-backup-restore-evidence-checklist="P0-03")(?=[\s\S]*P0-03 backup\/restore execution evidence checklist)(?=[\s\S]*PASS_LOCAL\s+only)(?=[\s\S]*P0-03-01)(?=[\s\S]*P0-03-06)(?=[\s\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\.md)(?=[\s\S]*Actual backup, restore dry-run, migration preflight\/postflight,\s+data smoke-check, signed UAT and owner GO\/NO-GO evidence are still\s+required)(?=[\s\S]*PASS_LOCAL does not prove backup was executed, restore was executed,\s+migration is safe, UAT passed, rollback is proven or production GO is\s+approved)(?=[\s\S]*secrets, passwords, OTPs, service-role keys,\s+bank credentials, raw student PII, raw CCCD, raw phone numbers or raw\s+payment data)/i,
  "P0-03 backup/restore execution evidence checklist",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  /(?=[\s\S]*data-p003-backup-restore-evidence-manifest="P0-03")(?=[\s\S]*P0-03 backup\/restore external evidence manifest)(?=[\s\S]*PASS_LOCAL\s+only)(?=[\s\S]*P0-03-EVID-01)(?=[\s\S]*P0-03-EVID-06)(?=[\s\S]*EVIDENCE_INDEX_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Backup reference)(?=[\s\S]*Restore target reference)(?=[\s\S]*Preflight\/postflight command reference)(?=[\s\S]*Migration dry-run step reference)(?=[\s\S]*Smoke-check and UAT reference)(?=[\s\S]*Final sign-off reference)(?=[\s\S]*PASS_LOCAL only means the manifest structure exists)/i,
  "P0-03 backup/restore external evidence manifest",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  /(?=[\s\S]*data-p003-backup-restore-operator-run-sheet="P0-03")(?=[\s\S]*P0-03 backup\/restore operator run sheet)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*BACKUP_RESTORE_RUN_READY \/ STOP \/ BLOCKED)(?=[\s\S]*P0-03-RUN-01)(?=[\s\S]*P0-03-RUN-06)(?=[\s\S]*Prove production versus restore target identity)(?=[\s\S]*Apply Step90-Step110 only on restore target)(?=[\s\S]*PASS_LOCAL does not prove an approved execution window, backup,\s+restore, migration dry-run, rollback proof, owner sign-off or\s+production GO)/i,
  "P0-03 backup/restore operator run sheet",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  /(?=[\s\S]*data-p003-restore-smoke-check-acceptance-matrix="P0-03")(?=[\s\S]*P0-03 restore smoke-check acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*target isolation)(?=[\s\S]*core master readability)(?=[\s\S]*finance guard\s+behavior)(?=[\s\S]*role\/workspace scope)(?=[\s\S]*audit trace)(?=[\s\S]*dashboard source\s+reconciliation)(?=[\s\S]*Lead handover finance gate preserved)(?=[\s\S]*P0-19\/P2-05\/P2-03)(?=[\s\S]*P0-03-SMOKE-01)(?=[\s\S]*P0-03-SMOKE-07)(?=[\s\S]*RESTORE_SMOKE_CHECK_PASS \/ FAIL \/ BLOCKED)(?=[\s\S]*PASS_LOCAL does not prove an actual restore, smoke-check, UAT pass,\s+rollback proof, migration approval or production GO)/i,
  "P0-03 restore smoke-check acceptance matrix",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  /(?=[\s\S]*data-p003-backup-restore-closure-decision-manifest="P0-03")(?=[\s\S]*P0-03 backup\/restore closure decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0_03_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-03-CLOSE-01)(?=[\s\S]*P0-03-CLOSE-06)(?=[\s\S]*Execution authority and target isolation confirmed)(?=[\s\S]*Backup and restore proof accepted)(?=[\s\S]*Preflight and postflight checks pass)(?=[\s\S]*Smoke-check and UAT index accepted)(?=[\s\S]*P0-19 gate UAT)(?=[\s\S]*P3-01\/P3-02 lifecycle and handover UAT)(?=[\s\S]*Exceptions and waivers controlled)(?=[\s\S]*Human closure decision recorded)(?=[\s\S]*PASS_LOCAL keeps P0-03 at evidence-structure readiness only)/i,
  "P0-03 backup/restore closure decision manifest",
);

requireText(
  "app/settings/supabase-check/page.tsx",
  /SupabaseBackupRestoreGuard[\s\S]*<SupabaseBackupRestoreGuard \/>[\s\S]*SupabaseCheck/i,
  "Supabase check page mounts backup/restore guard",
);

requireText(
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  /PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,\s+production migration is approved, or production GO is approved/i,
  "migration-order guard local-only boundary",
);

requireText(
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  /Step100[\s\S]*formally approved as pilot\s+waiver/i,
  "migration-order Step100 waiver boundary",
);

requireText(
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  /(?=[\s\S]*Step Decision Manifest)(?=[\s\S]*MIG-DEC-01)(?=[\s\S]*MIG-DEC-06)(?=[\s\S]*MIGRATION_ORDER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Any missing decision ID, unsigned waiver, missing rollback note, raw sensitive\s+evidence or unclear production target keeps the migration order NO-GO)/i,
  "Step90-Step110 migration decision manifest",
);

requireText(
  "docs/MIGRATION_ORDER_AUDIT.md",
  /Local Sign-Off Guard Evidence[\s\S]*audit:ttgdtx-migration-order-guard/i,
  "migration-order local sign-off guard evidence",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Current recommendation:\s*NO-GO/i,
  "NO-GO current recommendation",
);

requireText(
  "docs/GIT_CLEANUP_ANALYSIS.md",
  /Current Snapshot - 2026-06-27[\s\S]*Branch:\s*`hardening\/ttgdtx-9plus-pilot`[\s\S]*git status --short --branch[\s\S]*clean worktree[\s\S]*Exact ahead count is intentionally treated as live state[\s\S]*drifts with each safe commit[\s\S]*Do not commit runtime logs, local secrets, raw UAT evidence, exported bank\s+statements or temporary SQL scratch files/i,
  "P0-02 Git hygiene current snapshot",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /Date:\s*2026-06-27[\s\S]*Git state:\s*clean local worktree at last verified handoff; exact ahead count and\s+current commit are live Git state[\s\S]*Conclusion:\s*Stage D - internal controlled test only\. Production remains NO-GO[\s\S]*TTGDTX process quick finder, P5-02 Master Control action queue, P5-03 Finance Desk read-only cockpit guard, P3-01\/P3-02 UAT execution pack guard, P0-05 implementation log audit guard, P0-13 blocker source evidence-path alignment, P0-14 evidence closure tracker, P0-15 final handoff summary guard, P0 register pack, internal UAT run closure tracker, UAT execution closure template, UAT operator handoff sweeps, owner sign-off handoff alignment, P0-09 owner signoff P3 UAT alignment, P0-09 final owner decision manifest alignment and P0 Go\/No-Go control paragraph alignment[\s\S]*Production readiness guard[\s\S]*internal UAT closure tracker[\s\S]*UAT execution closure template[\s\S]*UAT operator handoff[\s\S]*final owner decision manifest[\s\S]*owner sign-off handoff evidence path with P3-01\/P3-02 UAT requirement[\s\S]*Production blocker shared source[\s\S]*P0-03 operator run sheet evidence path[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*P0-09 owner sign-off\/UAT handoff evidence path[\s\S]*Process discovery\/navigation[\s\S]*\/ttgdtx` quick finder[\s\S]*Lead lifecycle\/handover[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*Accounting dashboard \/ BGH control[\s\S]*P5-02 Master Control action queue with P0-14 evidence binder and P0-15 final handoff summary before owner GO\/NO-GO[\s\S]*Finance Desk \/ KHTC cockpit[\s\S]*P5-03 read-only cockpit exists at `\/finance-desk` with permission and workspace-scope gate[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*P5-03 reliance decision manifest[\s\S]*P0 register pack[\s\S]*Root control, data master, dictionary, SOP-to-data, report view, AI scope and risk signoff registers exist as DRAFT_CONTROL documents[\s\S]*Final handoff coverage[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*P0-09 owner sign-off\/UAT handoff evidence path with P3-01\/P3-02 UAT requirement[\s\S]*P0-13 blocker source[\s\S]*P0-14 evidence binder[\s\S]*Production is still NO-GO because:[\s\S]*No real production backup\/restore dry-run evidence[\s\S]*Step90-Step110 production migration order is not signed[\s\S]*P3-01\/P3-02 lifecycle and handover UAT is not signed[\s\S]*Final BGH\/IT_DATA\/KHTC\/PHAP_CHE\/Audit\/owner GO\/NO-GO is not signed[\s\S]*Record final owner GO\/NO-GO outside Codex\/chat using the owner sign-off pack,\s+final owner decision manifest and UAT operator handoff references/i,
  "HEU current-state inventory Stage D NO-GO snapshot",
);

requireText(
  "docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md",
  /Status:\s*DRAFT_CONTROL[\s\S]*No new level-1 folder is allowed[\s\S]*Folder Registry, File Registry,\s*Version Log, Audit Log and Signoff Register[\s\S]*Codex\/AI may draft, check and implement local safe controls[\s\S]*must not\s+approve production, approve migration, accept UAT, approve finance action/i,
  "P0 root control action register boundary",
);

requireText(
  "docs/HEU_DATA_MASTER_P0_REGISTER_20260627_V01_DRAFT.md",
  /Data Master comes before workflow, dashboard, automation and AI[\s\S]*STUDENT_MASTER \/ HOC_SINH_MASTER[\s\S]*REPORT_VIEW_REGISTER[\s\S]*SIGNOFF_REGISTER[\s\S]*does not rename, drop, alter or create production schema/i,
  "P0 data master register boundary",
);

requireText(
  "docs/HEU_DATA_DICTIONARY_MIN_20260627_V01_DRAFT.md",
  /AI is never approver[\s\S]*Money is recognized only after HEU receives and reconciles it[\s\S]*Do not commit or paste raw CCCD[\s\S]*does not approve real\s+data import, production dashboard use, AI production use or finance posting/i,
  "P0 minimum data dictionary boundary",
);

requireText(
  "docs/HEU_SOP_TO_DATA_MAPPING_20260627_V01_DRAFT.md",
  /Event -> Legal Check -> Regulation -> SOP[\s\S]*Report View -> Dashboard -> Audit[\s\S]*CHUA_DU_DIEU_KIEN[\s\S]*does not approve any SOP as officially issued/i,
  "P0 SOP-to-data mapping boundary",
);

requireText(
  "docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md",
  /Dashboard -> Report View -> Data Quality Check -> Source Map -> Owner Signoff[\s\S]*RV_TTGDTX_FINANCE_SUMMARY[\s\S]*RV_AI_ALLOWED_CONTEXT[\s\S]*does not approve production\s+dashboard use or replace signed dashboard UAT/i,
  "P0 report view register boundary",
);

requireText(
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  /AI may draft, check, summarize and warn[\s\S]*AI must not\s+approve, pay, post finance records, delete data or mark production GO[\s\S]*Signed UAT proving AI cannot approve, pay, release, delete or go-live/i,
  "P0 AI agent scope register boundary",
);

requireText(
  "docs/HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT.md",
  /PASS_LOCAL means local packaging or static audit passed[\s\S]*does not mean:[\s\S]*production ready[\s\S]*owner GO granted[\s\S]*Human signer only[\s\S]*does not approve production/i,
  "P0 risk control signoff register boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /P0 Register Pack Foundation[\s\S]*HEU P0 register pack as DRAFT_CONTROL documents[\s\S]*audit:heu-p0-register-pack[\s\S]*This is register packaging only[\s\S]*does not execute UAT, approve migration,\s+approve finance action or mark production GO/i,
  "P0 register pack implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /P0-05 Implementation Log Audit Guard[\s\S]*audit:heu-implementation-log[\s\S]*P0-05 backlog[\s\S]*production checklist[\s\S]*current-state\s+inventory[\s\S]*This is governance-log alignment only[\s\S]*does not execute UAT, accept real\s+evidence, approve migration, approve finance action or mark production GO/i,
  "P0-05 implementation-log audit guard entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /P0-13 Shared Source P0-03 P3 Gate Proof[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*P0-13 shared blocker\s+source coverage[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate\s+preservation[\s\S]*operator run sheet and owner sign-off\/UAT handoff\s+path[\s\S]*audit-heu-production-blocker-source\.mjs[\s\S]*backlog,\s+checklist, current-state and shared P0-15 source checks fail[\s\S]*This is P0-13 source-alignment packaging only[\s\S]*does not execute backup,\s+restore, migration dry-run, UAT, evidence acceptance, finance action, owner\s+waiver or production GO/i,
  "P0-13 shared source P0-03/P3 gate proof log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /P0-15 Final Handoff P0-03 P3 Gate Proof[\s\S]*AGENTS\.md[\s\S]*lib\/production-readiness\.ts[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*P0-03\s+restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*final-handoff, current-state and release-gate audits[\s\S]*This is final-handoff packaging only[\s\S]*does not execute backup, restore,\s+migration dry-run, UAT, evidence acceptance, finance action, owner waiver or\s+production GO/i,
  "P0-15 final handoff P0-03/P3 gate proof log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Production Priority Blocker List Alignment[\s\S]*P0-14 evidence binder[\s\S]*P0-15 final handoff coverage[\s\S]*P0-05\s+implementation-log audit[\s\S]*audit:heu-production-evidence-binder[\s\S]*audit:heu-final-handoff-coverage[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is checklist-priority alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action or mark production GO/i,
  "production priority blocker list alignment log entry",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /highest priority blockers[\s\S]*Close P0-14 production evidence binder[\s\S]*Run P0-15 final handoff coverage[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*Keep P0-05 implementation log audit green[\s\S]*Complete role\/workspace permission tests/i,
  "priority blocker list includes P0-14/P0-15/P0-05 before role tests",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /P0 controls include implementation-log discipline, backup\/restore[\s\S]*P0-14 production evidence binder[\s\S]*P0-15 final\s+handoff coverage[\s\S]*Production remains NO-GO until\s+controlled external evidence and required owner signatures exist/i,
  "P0 Go/No-Go controls include P0-05/P0-14/P0-15 and external-evidence boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /P0 Go No-Go Control Paragraph Alignment[\s\S]*P0 controls paragraph[\s\S]*implementation-log\s+discipline[\s\S]*P0-14 evidence binder[\s\S]*P0-15 final handoff coverage[\s\S]*Production remains NO-GO until controlled\s+external evidence and required owner signatures exist[\s\S]*audit:heu-production-evidence-binder[\s\S]*audit:heu-final-handoff-coverage[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is P0 control wording alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action or mark production GO/i,
  "P0 Go/No-Go control paragraph alignment log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Current State Inventory P0 Control Alignment[\s\S]*current-state inventory[\s\S]*P0\s+Go\/No-Go control paragraph alignment[\s\S]*audit:heu-current-state-inventory[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is current-state inventory alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action or mark production GO/i,
  "current-state inventory P0 control alignment log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Finance Desk Read-Only Guard Packaging[\s\S]*\/finance-desk[\s\S]*P5-03[\s\S]*lib\/vnd-money\.ts[\s\S]*audit:heu-finance-desk[\s\S]*This is PASS_LOCAL packaging only[\s\S]*does not execute UAT, approve finance\s+action, run production migration, accept evidence or mark production GO/i,
  "Finance Desk read-only guard packaging log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Finance Desk UAT Runbook Packaging[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*contract-only denial[\s\S]*out-of-scope denial[\s\S]*audit:heu-finance-desk[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is UAT packaging only[\s\S]*does not execute UAT, collect evidence,\s+approve finance action, run production migration, accept evidence or mark\s+production GO/i,
  "Finance Desk UAT runbook packaging log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Finance Desk No-Data Boundary Guard[\s\S]*FinanceDeskReadOnlyBoundary[\s\S]*no-access,\s+missing-view and loaded-data states[\s\S]*Step90-Step111[\s\S]*backed-up UAT environment[\s\S]*This is UI safety packaging only[\s\S]*does not run Step111, execute UAT,\s+approve migration, approve finance action, accept evidence or mark production\s+GO/i,
  "Finance Desk no-data boundary guard log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Finance Desk Vietnamese Copy Clarity[\s\S]*status badges, KPI cards,\s+missing-data state, source registry panel, control table and action links[\s\S]*audit:heu-finance-desk[\s\S]*audit:heu-vietnamese-text-encoding[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is UI text clarity only[\s\S]*does not change finance calculation, run\s+Step111, execute UAT, approve migration, approve finance action, accept\s+evidence or mark production GO/i,
  "Finance Desk Vietnamese copy clarity log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /P5-03 Finance Desk Reliance Decision Manifest[\s\S]*\/finance-desk[\s\S]*KHTC,\s+BGH, IT_DATA and AUDIT[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*Finance Desk, current-state, implementation-log and release-gate\s+audits[\s\S]*This is cockpit-reliance packaging only[\s\S]*does not approve finance action,\s+statutory accounting, voucher posting, bank transfer, UAT acceptance,\s+dashboard production reliance, owner waiver or production GO/i,
  "Finance Desk reliance decision manifest log entry",
);

requireText(
  "app/finance-desk/page.tsx",
  /(?=[\s\S]*FinanceDeskPage)(?=[\s\S]*formatVndAmount)(?=[\s\S]*canOpenFinanceDesk)(?=[\s\S]*FinanceDeskReadOnlyBoundary)(?=[\s\S]*data-finance-desk-readonly-boundary="P5-03")(?=[\s\S]*ttgdtx_accounting_dashboard_summary)(?=[\s\S]*ttgdtx_tuition_import_batch_readiness)(?=[\s\S]*ttgdtx_accounting_dashboard_control_board)(?=[\s\S]*dashboard không tự phê duyệt)(?=[\s\S]*không khởi tạo lệnh chuyển tiền)(?=[\s\S]*Production remains NO-GO until)/i,
  "Finance Desk read-only scoped route",
);

requireText(
  "app/finance-desk/page.tsx",
  /(?=[\s\S]*const financeDeskRelianceItems[\s\S]*P5-03-REL-01[\s\S]*P5-03-REL-06)(?=[\s\S]*function FinanceDeskRelianceDecisionManifest\(\)[\s\S]*data-finance-desk-reliance-decision-manifest="P5-03"[\s\S]*P5-03 Finance Desk reliance decision manifest: PASS_LOCAL only[\s\S]*P5_03_RELIANCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not approve\s+finance action, statutory accounting, voucher posting, bank\s+transfer, UAT acceptance, dashboard production reliance, owner\s+waiver or production GO)/i,
  "Finance Desk reliance decision manifest route",
);

requireText(
  "app/finance-desk/page.tsx",
  /<FinanceDeskReadOnlyBoundary \/>[\s\S]*!canOpen[\s\S]*dataError[\s\S]*Chưa đọc được đầy đủ Finance Desk[\s\S]*Step90-Step111[\s\S]*đã backup/i,
  "Finance Desk missing-view state keeps read-only boundary visible",
);

requireText(
  "database/step111_heu_finance_desk.sql",
  /Step 111 - HEU Finance Desk[\s\S]*Migration candidate only\. Do not run production migration from Codex\/chat[\s\S]*finance_desk\.read[\s\S]*enable row level security[\s\S]*can_read_finance_desk[\s\S]*write_audit_log[\s\S]*commit;/i,
  "Step111 Finance Desk migration candidate boundary",
);

requireText(
  "docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md",
  /Status:\s*DRAFT_CONTROL[\s\S]*Production status:\s*NO-GO[\s\S]*not statutory accounting software[\s\S]*All finance mutations still happen in the source P2 screens[\s\S]*Finance Desk does not approve payment[\s\S]*AI may summarize, validate and warn only/i,
  "Finance Desk MVP spec boundary",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P5-03[\s\S]*HEU Finance Desk read-only cockpit[\s\S]*PASS_LOCAL[\s\S]*app\/finance-desk\/page\.tsx[\s\S]*database\/step111_heu_finance_desk\.sql[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*audit:heu-finance-desk[\s\S]*P5-03 reliance decision manifest[\s\S]*signed finance\/dashboard UAT and reliance decision still required/i,
  "P5-03 Finance Desk backlog row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /HEU Finance Desk read-only cockpit[\s\S]*PASS_LOCAL[\s\S]*app\/finance-desk\/page\.tsx[\s\S]*database\/step111_heu_finance_desk\.sql[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*audit:heu-finance-desk[\s\S]*P5-03 UAT acceptance matrix and P5-03 reliance decision manifest[\s\S]*does not approve finance action, statutory accounting, voucher posting, bank transfer, production migration, UAT acceptance, dashboard production reliance or owner GO/i,
  "Finance Desk production checklist row",
);

requireText(
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
  /Status:\s*PASS_LOCAL_TEMPLATE[\s\S]*P5-03-UAT-01[\s\S]*P5-03-UAT-09[\s\S]*P5-03-ACCEPT-01[\s\S]*P5-03-ACCEPT-06[\s\S]*Final result remains NO-GO until all required owners sign/i,
  "Finance Desk UAT runbook matrix",
);

requireText(
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
  /(?=[\s\S]*Finance Desk Reliance Decision Manifest)(?=[\s\S]*P5_03_RELIANCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P5-03-REL-01[\s\S]*P5-03-REL-06)(?=[\s\S]*P5-03-ACCEPT-01 through P5-03-ACCEPT-06 and P5-03-REL-01 through\s+P5-03-REL-06)/i,
  "Finance Desk reliance decision runbook matrix",
);

requireText(
  "AGENTS.md",
  /Final handoff summaries must include[\s\S]*git status --short --branch[\s\S]*git rev-parse --short HEAD[\s\S]*Stage D - internal controlled test only[\s\S]*Production remains NO-GO[\s\S]*P0-03 operator run sheet evidence path[\s\S]*P0-03 restore smoke-check\s+proof for P0-19\/P3 gate preservation[\s\S]*P0-09 owner sign-off\/UAT\s+handoff\s+evidence path[\s\S]*P0-13 production blocker shared source[\s\S]*P0-14 production\s+evidence binder[\s\S]*separate P6-04 role\/workspace[\s\S]*P6-03 audit-log[\s\S]*P6-06 hard-delete\/cascade proof paths[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*real evidence stays outside Git\/Codex\/chat/i,
  "P0-15 final handoff summary guard",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Review dirty Git state[\s\S]*PASS_LOCAL[\s\S]*GIT_CLEANUP_ANALYSIS\.md[\s\S]*audit:heu-git-hygiene[\s\S]*current exact ahead count must be verified live/i,
  "P0-02 Git hygiene checklist row",
);

requireText(
  "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_PACK)(?=[\s\S]*This document does not approve production)(?=[\s\S]*Production remains NO-GO until the required owners review the evidence,[\s\S]*record\s+their decision, and sign the final Go\/No-Go decision)(?=[\s\S]*Codex\/AI output is\s+advisory only)(?=[\s\S]*Do not run production migration from Codex\/chat)(?=[\s\S]*Do not mark production GO from Codex\/chat)(?=[\s\S]*Do not paste secrets, passwords, OTPs, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data)(?=[\s\S]*Production backup and restore dry-run)(?=[\s\S]*Step90-Step110 migration order)(?=[\s\S]*P0-19 legal\/finance gate)(?=[\s\S]*P3-01\/P3-02 lead lifecycle and handover UAT)(?=[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md)(?=[\s\S]*P3-UAT-01 through P3-UAT-08)(?=[\s\S]*P0-19\/P2-05\/P2-03 finance gates)(?=[\s\S]*P2-17 payout once)(?=[\s\S]*P2-18 accounting dashboard)(?=[\s\S]*Role and workspace permission)(?=[\s\S]*Audit log completeness)(?=[\s\S]*Hard-delete\/cascade risk)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*P6-06-FIND-001 through P6-06-FIND-044)(?=[\s\S]*Internal multi-account UAT)(?=[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md)(?=[\s\S]*P0-09 Owner GO\/NO-GO Acceptance Matrix)(?=[\s\S]*P0_09_ACCEPT \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-09-ACCEPT-01)(?=[\s\S]*P0-09-ACCEPT-06)(?=[\s\S]*P0-09 Final Owner GO\/NO-GO Decision Manifest)(?=[\s\S]*P0_09_FINAL_GO \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-09-DEC-01)(?=[\s\S]*P0-09-DEC-06)(?=[\s\S]*Final production recommendation remains NO-GO until every required owner signs\s+GO, P0-09-ACCEPT-01 through P0-09-ACCEPT-06 are accepted and no stop condition\s+remains open)/i,
  "production owner sign-off pack local-only boundary",
);

requireText(
  "docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_PACK)(?=[\s\S]*This document does not approve\s+production, UAT pass, backup completion, migration, finance action or owner\s+Go\/No-Go)(?=[\s\S]*Production remains NO-GO until required evidence is collected)(?=[\s\S]*Do not paste secrets, passwords, OTPs, service-role keys, API keys, private\s+keys, bank credentials, reset links, raw student PII, raw CCCD, raw phone\s+numbers, raw bank account numbers, bank statements, vouchers or raw payment\s+data)(?=[\s\S]*Do not store raw controlled evidence in Git)(?=[\s\S]*PUBLIC_CONTROL)(?=[\s\S]*CONTROLLED_REDACTED)(?=[\s\S]*CONTROLLED_SENSITIVE)(?=[\s\S]*FORBIDDEN_IN_GIT_OR_CODEX)(?=[\s\S]*Receive evidence)(?=[\s\S]*Classify)(?=[\s\S]*Redact)(?=[\s\S]*Review)(?=[\s\S]*Reference)(?=[\s\S]*Sign)(?=[\s\S]*P0-10 Controlled Evidence Acceptance Matrix)(?=[\s\S]*P0_10_ACCEPT \/ NO_GO \/ BLOCKED)(?=[\s\S]*audit:heu-controlled-evidence-redaction-pack)/i,
  "controlled evidence redaction pack",
);

requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  /P7-02 Read-Only Task Checklist Generator[\s\S]*local, read-only and template-based[\s\S]*TTGDTX UAT evidence[\s\S]*owner GO\/NO-GO review[\s\S]*small build slices[\s\S]*must not:[\s\S]*Send prompts to an AI service[\s\S]*Save user-entered prompts[\s\S]*Call Supabase, RPC, mutation APIs or production workflows[\s\S]*Approve finance, accept UAT, waive evidence, run migration or mark production\s+GO[\s\S]*P7-02 remains PASS_LOCAL only/i,
  "P7-02 read-only checklist generator policy",
);

requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  /P7-03 Read-Only Risk Suggestion Board[\s\S]*static, read-only and advisory-only[\s\S]*missing evidence[\s\S]*role\/workspace leaks[\s\S]*missing restore proof[\s\S]*duplicate payout[\s\S]*dashboard reconciliation[\s\S]*AI-output misuse[\s\S]*must not:[\s\S]*Score people, hide exceptions or suppress risk[\s\S]*Save risk decisions or write workflow data[\s\S]*Call Supabase, RPC, mutation APIs, AI services or production workflows[\s\S]*Approve finance, accept UAT, waive evidence, run migration or mark production\s+GO[\s\S]*P7-03 remains PASS_LOCAL only/i,
  "P7-03 read-only risk suggestion board policy",
);

requireText(
  "components/ai/ai-task-checklist-generator.tsx",
  /(?=[\s\S]*data-heu-ai-task-checklist-generator="P7-02")(?=[\s\S]*P7-02 AI task checklist generator)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*choose a small slice, run checks, commit only after pass, then\s+continue)(?=[\s\S]*does not call AI, save prompts, write data, approve\s+finance, accept UAT, run migration or mark production GO)(?=[\s\S]*TTGDTX UAT evidence run)(?=[\s\S]*Owner GO\/NO-GO review)(?=[\s\S]*Small build slice)(?=[\s\S]*No production migration, no raw credentials, no hidden approval)(?=[\s\S]*Do not paste secrets, passwords, OTPs, service-role keys, bank\s+credentials, raw student PII, raw CCCD, raw phone numbers, raw bank\s+account numbers, bank statements, vouchers or raw payment data)(?=[\s\S]*PASS_LOCAL does not enable\s+autonomous AI, prompt\/output logging, production AI, production\s+migration, finance action, UAT acceptance, owner waiver or production\s+GO)/i,
  "P7-02 checklist generator UI boundary",
);

requireText(
  "components/ai/ai-risk-suggestion-board.tsx",
  /(?=[\s\S]*data-heu-ai-risk-suggestion-board="P7-03")(?=[\s\S]*P7-03 AI risk suggestion board)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*review prompts for humans)(?=[\s\S]*does not call AI,\s+score people, hide exceptions, write data, approve finance, accept\s+UAT, waive evidence, run migration or mark production GO)(?=[\s\S]*AI-RISK-01)(?=[\s\S]*AI-RISK-06)(?=[\s\S]*AI output treated as approval)(?=[\s\S]*Human review required)(?=[\s\S]*AI never does)(?=[\s\S]*Do not paste secrets, passwords, OTPs, service-role keys, bank\s+credentials, raw student PII, raw CCCD, raw phone numbers, raw bank\s+account numbers, bank statements, vouchers or raw payment data)(?=[\s\S]*PASS_LOCAL does not enable autonomous AI, risk scoring, production AI,\s+finance action, UAT acceptance, owner waiver or production GO)/i,
  "P7-03 risk suggestion board UI boundary",
);

requireText(
  "app/ai-assistant/page.tsx",
  /AiTaskChecklistGenerator[\s\S]*AiRiskSuggestionBoard[\s\S]*<AiTaskChecklistGenerator\s*\/>[\s\S]*<AiRiskSuggestionBoard\s*\/>[\s\S]*ModulePage/i,
  "AI page mounts P7-02 task checklist generator and P7-03 risk board",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /No AI approval[\s\S]*PASS_LOCAL[\s\S]*ai-task-checklist-generator\.tsx[\s\S]*ai-risk-suggestion-board\.tsx[\s\S]*audit:heu-ai-policy/i,
  "No AI approval checklist row includes P7-02 guard",
);

requireText(
  "components/audit/controlled-evidence-redaction-guard.tsx",
  /(?=[\s\S]*data-heu-controlled-evidence-redaction-guard="P0-10")(?=[\s\S]*P0-10 controlled evidence redaction\/intake)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Raw evidence stays outside\s+Git\/Codex\/chat)(?=[\s\S]*Do not paste secrets, passwords, OTPs, service-role keys, API\s+keys, private keys, bank credentials, reset links, raw student\s+PII, raw CCCD, raw phone numbers, raw bank account numbers, bank\s+statements, vouchers or raw payment data)(?=[\s\S]*PUBLIC_CONTROL)(?=[\s\S]*CONTROLLED_REDACTED)(?=[\s\S]*CONTROLLED_SENSITIVE)(?=[\s\S]*FORBIDDEN_IN_GIT_OR_CODEX)(?=[\s\S]*audit:heu-controlled-evidence-redaction-pack)(?=[\s\S]*does not\s+prove evidence was collected, accepted, signed, or production-approved)/i,
  "controlled evidence redaction UI guard",
);

requireText(
  "components/audit/controlled-evidence-redaction-guard.tsx",
  /(?=[\s\S]*data-heu-controlled-evidence-acceptance-matrix="P0-10")(?=[\s\S]*P0-10 controlled evidence acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0_10_ACCEPT \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-10-ACCEPT-01)(?=[\s\S]*P0-10-ACCEPT-06)(?=[\s\S]*Evidence classified before use)(?=[\s\S]*Sensitive originals stay outside Git\/Codex)(?=[\s\S]*Redaction preserves proof while removing private data)(?=[\s\S]*Owner and Audit review recorded)(?=[\s\S]*Only safe references enter tracked work)(?=[\s\S]*Production boundary acknowledged)/i,
  "controlled evidence acceptance matrix UI",
);

requireText(
  "app/audit/page.tsx",
  /ControlledEvidenceRedactionGuard[\s\S]*<ControlledEvidenceRedactionGuard \/>[\s\S]*TtgdtxAuditTrailGuard[\s\S]*HardDeleteBoundaryGuard/i,
  "audit page mounts controlled evidence redaction guard",
);

requireText(
  "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md",
  /HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\.md[\s\S]*audit:heu-controlled-evidence-redaction-pack[\s\S]*Raw evidence stays outside Git/i,
  "owner sign-off pack references controlled evidence redaction",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Final owner Go\/No-Go sign-off[\s\S]*IN_PROGRESS[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*ttgdtx-owner-go-no-go-evidence-checklist\.tsx[\s\S]*owner GO\/NO-GO acceptance matrix[\s\S]*owner GO\/NO-GO decision manifest[\s\S]*audit:ttgdtx-production-owner-signoff-pack[\s\S]*signed final GO\/NO-GO decision still required/i,
  "final owner Go/No-Go sign-off checklist row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Controlled evidence redaction\/intake[\s\S]*PASS_LOCAL[\s\S]*HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\.md[\s\S]*controlled evidence acceptance matrix[\s\S]*audit:heu-controlled-evidence-redaction-pack[\s\S]*raw evidence stays outside Git/i,
  "controlled evidence redaction checklist row",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /Result:\s*PARTIAL PASS/i,
  "partial UAT pass marker",
);

requireText(
  "components/audit/ttgdtx-audit-trail-guard.tsx",
  /(?=[\s\S]*data-ttgdtx-audit-trail-guard="AUDIT_LOG")(?=[\s\S]*data-ttgdtx-audit-log-uat-boundary="P6-03")(?=[\s\S]*P6-03 audit-log UAT)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Signed audit-log UAT evidence is still required)(?=[\s\S]*NO-GO until signed\s+audit-log evidence exists)(?=[\s\S]*audit_logs)(?=[\s\S]*AUD-01)(?=[\s\S]*AUD-06)(?=[\s\S]*passwords)(?=[\s\S]*OTPs)(?=[\s\S]*service-role keys)(?=[\s\S]*CCCD)(?=[\s\S]*bank accounts)(?=[\s\S]*raw student identity data)/i,
  "TTGDTX audit trail guard display",
);

requireText(
  "components/audit/ttgdtx-audit-trail-guard.tsx",
  /(?=[\s\S]*data-ttgdtx-audit-trace-acceptance-matrix="P6-03")(?=[\s\S]*P6-03 audit trace acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*actor identity)(?=[\s\S]*entity\/action coverage)(?=[\s\S]*before\/after value usefulness)(?=[\s\S]*evidence link or controlled reference)(?=[\s\S]*workflow chain continuity)(?=[\s\S]*reviewer sign-off)(?=[\s\S]*AUD-TRACE-01)(?=[\s\S]*AUD-TRACE-06)(?=[\s\S]*raw payment data)(?=[\s\S]*raw vouchers)/i,
  "P6-03 audit trace acceptance matrix display",
);

requireText(
  "app/audit/page.tsx",
  /<TtgdtxAuditTrailGuard\s*\/>[\s\S]*<TtgdtxAuditLogUatEvidenceChecklist\s*\/>[\s\S]*AuditLogTable/i,
  "audit page mounts TTGDTX audit trail guard and UAT evidence checklist",
);

requireText(
  "components/audit/ttgdtx-audit-log-uat-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-audit-log-uat-evidence-checklist="P6-03")(?=[\s\S]*P6-03 audit-log UAT evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Signed audit-log UAT is still required before P6-03 can move from\s+IN_PROGRESS)(?=[\s\S]*TTGDTX_AUDIT_LOG_UAT_RUNBOOK\.md)(?=[\s\S]*AUD-01)(?=[\s\S]*AUD-06)(?=[\s\S]*passwords, OTPs, service-role keys, raw\s+student identity data, CCCD, bank accounts and raw payment data)(?=[\s\S]*Audit, KHTC, IT_DATA, PHAP_CHE and BGH must sign the evidence outside\s+Codex\/chat)/i,
  "P6-03 audit-log UAT evidence checklist",
);

requireText(
  "components/audit/ttgdtx-audit-log-uat-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-audit-log-evidence-acceptance-matrix="P6-03")(?=[\s\S]*P6-03 audit-log evidence acceptance matrix)(?=[\s\S]*P6_03_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P6-03-ACCEPT-01)(?=[\s\S]*P6-03-ACCEPT-06)(?=[\s\S]*Required event coverage)(?=[\s\S]*Before\/after payload and evidence reference usefulness)(?=[\s\S]*Production boundary)/i,
  "P6-03 audit-log evidence acceptance matrix",
);

requireText(
  "components/audit/ttgdtx-audit-log-uat-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-audit-trace-decision-manifest="P6-03")(?=[\s\S]*P6-03 audit traceability decision manifest)(?=[\s\S]*P6_03_TRACE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P6-03-DEC-01)(?=[\s\S]*P6-03-DEC-06)(?=[\s\S]*Required event sample coverage)(?=[\s\S]*Workflow chain continuity)(?=[\s\S]*Human traceability decision)(?=[\s\S]*production GO)/i,
  "P6-03 audit traceability decision manifest",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /(?=[\s\S]*Audit log completeness)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*ttgdtx-audit-log-uat-evidence-checklist\.tsx)(?=[\s\S]*audit trace acceptance matrix)(?=[\s\S]*audit-log evidence acceptance matrix)(?=[\s\S]*audit traceability decision manifest)(?=[\s\S]*audit:ttgdtx-audit-trail-guard)(?=[\s\S]*signed UAT)/i,
  "audit log completeness guard checklist row",
);

requireText(
  "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md",
  /(?=[\s\S]*P5-01 is PASS_LOCAL)(?=[\s\S]*not production-approved)(?=[\s\S]*P2-18 remains IN_PROGRESS)/i,
  "P5-01 dashboard UAT plan is local-only and P2-18 remains in progress",
);

requireText(
  "components/ttgdtx/ttgdtx-dashboard-readonly-guard.tsx",
  /(?=[\s\S]*data-ttgdtx-dashboard-readonly-guard="P2-18")(?=[\s\S]*Role-scope)(?=[\s\S]*contract-only)(?=[\s\S]*signed browser UAT)/i,
  "P2-18 dashboard read-only guard display",
);

requireText(
  "components/ttgdtx/ttgdtx-dashboard-uat-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-dashboard-uat-evidence-checklist="P2-18")(?=[\s\S]*P2-18 UAT evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Signed browser UAT is still required before P2-18 can move from\s+IN_PROGRESS)(?=[\s\S]*HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\.md)(?=[\s\S]*P2-18-01)(?=[\s\S]*P2-18-08)(?=[\s\S]*KHTC, BGH, IT_DATA and Audit\s+must sign the evidence outside Codex\/chat)/i,
  "P2-18 dashboard UAT evidence checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-dashboard-uat-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-dashboard-acceptance-matrix="P2-18")(?=[\s\S]*P2-18 dashboard acceptance matrix)(?=[\s\S]*P2_18_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P2-18-ACCEPT-01)(?=[\s\S]*P2-18-ACCEPT-06)(?=[\s\S]*Source-total reconciliation)(?=[\s\S]*Role and contract-only denial)(?=[\s\S]*Production boundary)/i,
  "P2-18 dashboard acceptance matrix",
);

requireText(
  "components/ttgdtx/ttgdtx-dashboard-source-reconciliation-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-dashboard-source-reconciliation-checklist="P2-18")(?=[\s\S]*P2-18 source reconciliation checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2-18-SRC-01)(?=[\s\S]*P2-18-SRC-06)(?=[\s\S]*P2-03 receivable)(?=[\s\S]*P2-17 payout)(?=[\s\S]*P2-19 source\/evidence metadata)(?=[\s\S]*Signed\s+browser UAT must still prove at least one complete flow and one\s+exception flow)/i,
  "P2-18 dashboard source reconciliation checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-dashboard-source-reconciliation-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-dashboard-reliance-decision-manifest="P2-18")(?=[\s\S]*P2-18 dashboard reliance decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2-18-REL-01)(?=[\s\S]*P2-18-REL-06)(?=[\s\S]*P2_18_RELIANCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not approve finance action, statutory\s+accounting, UAT acceptance, dashboard production reliance or\s+production GO)/i,
  "P2-18 dashboard reliance decision manifest",
);

requireText(
  "app/ttgdtx/accounting-dashboard/page.tsx",
  /TtgdtxDashboardReadonlyGuard[\s\S]*<TtgdtxDashboardReadonlyGuard \/>/,
  "P2-18 dashboard read-only guard mount",
);

requireText(
  "app/ttgdtx/accounting-dashboard/page.tsx",
  /<TtgdtxDashboardReadonlyGuard\s*\/>[\s\S]*<TtgdtxDashboardSourceReconciliationChecklist\s*\/>[\s\S]*<TtgdtxDashboardUatEvidenceChecklist\s*\/>/,
  "P2-18 dashboard UAT evidence checklist mount",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /(?=[\s\S]*P2-18 accounting dashboard)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*ttgdtx-dashboard-readonly-guard\.tsx)(?=[\s\S]*ttgdtx-dashboard-source-reconciliation-checklist\.tsx)(?=[\s\S]*ttgdtx-dashboard-uat-evidence-checklist\.tsx)(?=[\s\S]*dashboard acceptance matrix)(?=[\s\S]*dashboard reliance decision manifest)(?=[\s\S]*audit:ttgdtx-dashboard-readonly-guard)(?=[\s\S]*audit:ttgdtx-dashboard-source-reconciliation)(?=[\s\S]*signed UAT evidence)/i,
  "P2-18 read-only guard checklist row",
);

requireText(
  "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md",
  /(?=[\s\S]*Dashboard Acceptance Matrix)(?=[\s\S]*P2-18-ACCEPT-01)(?=[\s\S]*P2-18-ACCEPT-06)(?=[\s\S]*P2_18_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P2-18-ACCEPT-01 through P2-18-ACCEPT-06 all pass with redacted evidence)/i,
  "P2-18 runbook dashboard acceptance matrix",
);

requireText(
  "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md",
  /(?=[\s\S]*Dashboard Reliance Decision Manifest)(?=[\s\S]*data-ttgdtx-dashboard-reliance-decision-manifest="P2-18")(?=[\s\S]*P2-18-REL-01)(?=[\s\S]*P2-18-REL-06)(?=[\s\S]*P2_18_RELIANCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*raw sensitive dashboard data keeps\s+P2-18 NO-GO)/i,
  "P2-18 runbook dashboard reliance decision manifest",
);

requireText(
  "docs/TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627.md",
  /will not build or operate a real bank\s+freeze\/release action workflow inside the payment flow/i,
  "account-control bank action deferral",
);

requireText(
  "docs/TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627.md",
  /PASS_LOCAL means scope is clarified and the risky real workflow is deferred[\s\S]*does not approve production bank operation, collateral release, production data\s+import, real UAT, production migration or production GO/i,
  "account-control scope decision local-only boundary",
);

requireText(
  "components/ttgdtx/ttgdtx-account-control-scope-guard.tsx",
  /(?=[\s\S]*data-ttgdtx-account-control-scope-guard="P2-19")(?=[\s\S]*Account-control scope guard: metadata-only)(?=[\s\S]*Phong toa\/giai toa tai khoan)(?=[\s\S]*khong gui lenh ngan\s+hang)(?=[\s\S]*khong danh dau tai khoan da phong toa\/giai toa)(?=[\s\S]*khong phe\s+duyet giai chap)(?=[\s\S]*ACCT-CTRL-01)(?=[\s\S]*ACCT-CTRL-04)(?=[\s\S]*Collateral giai-chap separation)(?=[\s\S]*No bank operation, collateral\s+release, payout, UAT acceptance, data import, production migration\s+or production GO)/i,
  "account-control scope UI guard",
);

requireText(
  "app/ttgdtx/source-control/page.tsx",
  /TtgdtxAccountControlScopeGuard[\s\S]*<TtgdtxAccountControlScopeGuard \/>[\s\S]*P2-11/i,
  "source-control page mounts account-control scope guard",
);

requireText(
  "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md",
  /(?=[\s\S]*P5-02 Read-Only Blocker Summary)(?=[\s\S]*production-readiness-blocker-summary\.tsx)(?=[\s\S]*data-heu-production-action-queue="P5-02")(?=[\s\S]*Next controlled actions)(?=[\s\S]*No GO button is provided)(?=[\s\S]*P5-02 is PASS_LOCAL[\s\S]*does not implement a production BGH\s+dashboard[\s\S]*approve\s+production GO or replace signed UAT)/i,
  "P5-02 BGH dashboard spec local-only boundary",
);

requireText(
  "components/master-control/production-readiness-blocker-summary.tsx",
  /(?=[\s\S]*data-heu-production-blocker-summary="P5-02")(?=[\s\S]*P5-02 production blocker summary)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Read-only BGH\/owner view)(?=[\s\S]*Production remains NO-GO until backup\/restore, migration order,\s+legal\/finance UAT, payout UAT, dashboard UAT, role-scope UAT,\s+audit-log UAT, hard-delete conversion\/waiver, redaction, P0-14\s+evidence binder, P0-15 final handoff summary and final owner\s+sign-off are completed outside Codex\/chat)(?=[\s\S]*PRODUCTION_BLOCKERS)(?=[\s\S]*PRODUCTION_EXECUTION_STEPS)(?=[\s\S]*data-heu-production-action-queue="P5-02")(?=[\s\S]*Next controlled actions)(?=[\s\S]*P0-14\s+evidence binder)(?=[\s\S]*P0-15 final handoff summary)(?=[\s\S]*owner GO\/NO-GO discussion)(?=[\s\S]*Current recommendation:[\s\S]*NO-GO)(?=[\s\S]*No GO button is provided here)(?=[\s\S]*PASS_LOCAL does not approve production\s+dashboard use, finance actions, production migration, UAT acceptance,\s+owner waiver or production GO)(?=[\s\S]*secrets, passwords, OTPs,\s+service-role keys, bank credentials, raw student PII, raw CCCD, raw\s+phone numbers, raw bank account numbers, bank statements, vouchers or\s+raw payment data)/i,
  "P5-02 production blocker summary UI shell",
);

requireText(
  "lib/production-readiness.ts",
  /P0-03[\s\S]*Step90-Step110[\s\S]*P0-19[\s\S]*P2-17[\s\S]*P2-18[\s\S]*P6-04[\s\S]*P6-03[\s\S]*P6-06[\s\S]*P0-10[\s\S]*P0-09/i,
  "P5-02 production blocker shared source coverage",
);

requireText(
  "app/master-control/page.tsx",
  /ProductionReadinessBlockerSummary[\s\S]*<ProductionReadinessBlockerSummary\s*\/>[\s\S]*<HeuOsVisualNavigationMap/i,
  "Master Control mounts production blocker summary",
);

requireText(
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  /(?=[\s\S]*P6-06 is PASS_LOCAL)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*P6-06-FIND-001 through P6-06-FIND-044)(?=[\s\S]*hard-delete-conversion-decision-queue\.tsx)(?=[\s\S]*hard-delete-waiver-evidence-checklist\.tsx)(?=[\s\S]*Decision Queue Evidence)(?=[\s\S]*audit:hard-delete-conversion-decision-queue)(?=[\s\S]*does not approve production deletion, cascade execution, waiver,\s+conversion\s+migration, cleanup, rollback success or production GO)/i,
  "P6-06 non-TTGDTX cascade review local-only boundary",
);

requireText(
  "docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_REGISTER)(?=[\s\S]*Current scan count:\s*44)(?=[\s\S]*P6-06-FIND-001)(?=[\s\S]*P6-06-FIND-044)(?=[\s\S]*child tables, parent references and owner lanes)(?=[\s\S]*P6-06 remains IN_PROGRESS)(?=[\s\S]*does not approve production\s+migration, data\s+deletion, cascade execution, waiver, conversion migration,\s+cleanup, rollback\s+success or production GO)/i,
  "P6-06 cascade finding register",
);

requireText(
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  /(?=[\s\S]*P6-06 Acceptance Matrix)(?=[\s\S]*data-hard-delete-cascade-acceptance-matrix="P6-06")(?=[\s\S]*P6-06-ACCEPT-01)(?=[\s\S]*P6-06-ACCEPT-06)(?=[\s\S]*P6_06_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P6-06 Closure Decision Manifest)(?=[\s\S]*data-hard-delete-cascade-closure-decision-manifest="P6-06")(?=[\s\S]*P6-06-DEC-01)(?=[\s\S]*P6-06-DEC-06)(?=[\s\S]*P6_06_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*signed owner approval)/i,
  "P6-06 hard-delete/cascade acceptance matrix doc",
);

requireText(
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  /Current scan count:\s*44/i,
  "P6-06 current cascade count",
);

requireText(
  "components/audit/hard-delete-boundary-guard.tsx",
  /(?=[\s\S]*data-hard-delete-boundary-guard="P6-06")(?=[\s\S]*P6-06 hard-delete and cascade review)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Production remains NO-GO until non-TTGDTX\/base cascade paths are\s+converted or waived with written approval)(?=[\s\S]*No hard-delete for\s+finance, evidence, approval, payment, lead or audit rows)(?=[\s\S]*Do not use hard-delete, truncate, drop table or on delete cascade\s+as rollback proof)(?=[\s\S]*Current scan count:\s*44)(?=[\s\S]*REQUIRES_CONVERSION_OR_WAIVER)(?=[\s\S]*audit:hard-delete)(?=[\s\S]*audit:ttgdtx-cascade)(?=[\s\S]*audit:heu-non-ttgdtx-cascade-review)/i,
  "P6-06 hard-delete boundary guard",
);

requireText(
  "app/audit/page.tsx",
  /<HardDeleteBoundaryGuard\s*\/>[\s\S]*<HardDeleteConversionDecisionQueue\s*\/>[\s\S]*<HardDeleteWaiverEvidenceChecklist\s*\/>[\s\S]*AuditLogTable/i,
  "audit page mounts hard-delete boundary guard, decision queue and evidence checklist",
);

requireText(
  "components/audit/hard-delete-conversion-decision-queue.tsx",
  /(?=[\s\S]*data-hard-delete-conversion-decision-queue="P6-06")(?=[\s\S]*P6-06 hard-delete conversion decision queue)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*44 non-TTGDTX\/base cascade findings)(?=[\s\S]*HDQ-01)(?=[\s\S]*HDQ-05)(?=[\s\S]*Base identity and CRM lead children)(?=[\s\S]*HOU finance and evidence)(?=[\s\S]*Workspace and scope helpers)(?=[\s\S]*Master, control and dynamic configuration)(?=[\s\S]*Legal, tuition and short-course operations)(?=[\s\S]*RESTRICT_OR_ARCHIVE)(?=[\s\S]*SOFT_REVOKE_OR_WAIVER)(?=[\s\S]*does not\s+approve production deletion, cascade execution, waiver, conversion\s+migration, cleanup, rollback success or production GO)/i,
  "P6-06 hard-delete conversion decision queue",
);

requireText(
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  /(?=[\s\S]*data-hard-delete-waiver-evidence-checklist="P6-06")(?=[\s\S]*P6-06 hard-delete\/cascade evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Conversion or written waiver evidence is still required before\s+P6-06 can move from IN_PROGRESS)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_REVIEW_20260627\.md)(?=[\s\S]*HD-01)(?=[\s\S]*HD-06)(?=[\s\S]*raw student PII, CCCD, bank data, payment data,\s+passwords, OTPs, service-role keys and production credentials)(?=[\s\S]*BGH, IT_DATA, Audit and affected business owners must sign the\s+evidence outside Codex\/chat)/i,
  "P6-06 hard-delete waiver evidence checklist",
);

requireText(
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  /(?=[\s\S]*data-hard-delete-cascade-acceptance-matrix="P6-06")(?=[\s\S]*P6-06 hard-delete\/cascade acceptance matrix)(?=[\s\S]*P6_06_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P6-06-ACCEPT-01)(?=[\s\S]*P6-06-ACCEPT-06)(?=[\s\S]*Protected records converted before production)(?=[\s\S]*Derived-helper waiver is narrow and written)(?=[\s\S]*Production boundary)/i,
  "P6-06 hard-delete/cascade acceptance matrix UI",
);

requireText(
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  /(?=[\s\S]*data-hard-delete-cascade-closure-decision-manifest="P6-06")(?=[\s\S]*P6-06 hard-delete\/cascade closure decision manifest)(?=[\s\S]*P6_06_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P6-06-DEC-01)(?=[\s\S]*P6-06-DEC-06)(?=[\s\S]*Current scan and owner lanes locked)(?=[\s\S]*Protected rows converted)(?=[\s\S]*Derived-helper waiver controlled)(?=[\s\S]*Rollback and cleanup proof independent of deletion)(?=[\s\S]*Production boundary acknowledged)/i,
  "P6-06 hard-delete/cascade closure decision manifest UI",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /(?=[\s\S]*Hard delete review)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*hard-delete\/cascade finding register, acceptance matrix and closure decision manifest)(?=[\s\S]*audit:hard-delete-boundary-guard)(?=[\s\S]*audit:hard-delete-conversion-decision-queue)(?=[\s\S]*non-TTGDTX conversion or written waiver still required)/i,
  "P6-06 production checklist acceptance matrix row",
);

requireText(
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  /(?=[\s\S]*P6-04 is PASS_LOCAL)(?=[\s\S]*role-scope evidence checklist)(?=[\s\S]*Signed role-scope UAT evidence is still required)(?=[\s\S]*NO-GO until signed UAT evidence exists)/i,
  "P6-04 role-scope UAT pack stays local-only",
);

requireText(
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  /(?=[\s\S]*Role-Scope Acceptance Matrix)(?=[\s\S]*data-heu-role-scope-acceptance-matrix="P6-04")(?=[\s\S]*P6-04-ACCEPT-01)(?=[\s\S]*P6-04-ACCEPT-06)(?=[\s\S]*P6_04_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*signed owner approval)/i,
  "P6-04 role-scope acceptance matrix doc",
);

requireText(
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  /(?=[\s\S]*Role-Scope Access Decision Manifest)(?=[\s\S]*data-heu-role-scope-access-decision-manifest="P6-04")(?=[\s\S]*P6-04-DEC-01)(?=[\s\S]*P6-04-DEC-06)(?=[\s\S]*P6_04_ACCESS_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*raw sensitive role-scope evidence keeps P6-04 NO-GO)/i,
  "P6-04 role-scope access decision manifest doc",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  /(?=[\s\S]*data-heu-role-scope-ui-guard="P6-04")(?=[\s\S]*P6-04 role-scope UAT)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Signed role-scope UAT evidence is still required)(?=[\s\S]*NO-GO until\s+signed UAT evidence exists)(?=[\s\S]*UAT_ADMIN)(?=[\s\S]*UAT_BGH)(?=[\s\S]*UAT_KHTC)(?=[\s\S]*UAT_TUYEN_SINH)(?=[\s\S]*UAT_PHAP_CHE)(?=[\s\S]*UAT_AUDIT)(?=[\s\S]*UAT_OUT_OF_SCOPE_STAFF)(?=[\s\S]*passwords)(?=[\s\S]*OTPs)(?=[\s\S]*service-role keys)(?=[\s\S]*CCCD)(?=[\s\S]*bank\s+accounts)(?=[\s\S]*raw student identity data)/i,
  "P6-04 role-scope UI guard stays local-only and no-secret",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  /(?=[\s\S]*data-heu-role-scope-evidence-checklist="P6-04")(?=[\s\S]*P6-04 role\/workspace evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Signed role-scope UAT is still required before P6-04 can move\s+from IN_PROGRESS)(?=[\s\S]*HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627\.md)(?=[\s\S]*P6-04-SCOPE-001)(?=[\s\S]*P6-04-SCOPE-006)(?=[\s\S]*ALLOWED, BLOCKED or EMPTY_SCOPED_STATE)(?=[\s\S]*passwords, OTPs, reset links, API keys,\s+service-role keys, CCCD, bank accounts, bank statements,\s+vouchers and raw student identity data)(?=[\s\S]*PASS_LOCAL does not approve production access, broad permissions,\s+real-data UAT, finance action, hard-delete, AI approval or\s+production GO)/i,
  "P6-04 role/workspace evidence checklist",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  /(?=[\s\S]*data-heu-role-scope-route-matrix="P6-04")(?=[\s\S]*P6-04 role-scope route matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P6-04-ROUTE-01)(?=[\s\S]*P6-04-ROUTE-07)(?=[\s\S]*Login and unauthenticated routes)(?=[\s\S]*Lead list\/detail)(?=[\s\S]*TTGDTX contract\/source pages)(?=[\s\S]*TTGDTX receivable, collection, reconciliation and payment)(?=[\s\S]*TTGDTX accounting dashboard)(?=[\s\S]*Master\/settings pages)(?=[\s\S]*Audit log pages)(?=[\s\S]*UI-only hide is not enough if a server\s+action can still write)(?=[\s\S]*Do not paste passwords, OTPs, reset links, API keys,\s+service-role keys, CCCD, bank accounts, bank statements,\s+vouchers or raw student identity data)/i,
  "P6-04 role-scope route matrix",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  /(?=[\s\S]*data-heu-role-scope-acceptance-matrix="P6-04")(?=[\s\S]*P6-04 role-scope acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P6_04_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P6-04-ACCEPT-01)(?=[\s\S]*P6-04-ACCEPT-06)(?=[\s\S]*Static preflight and synthetic-account boundary)(?=[\s\S]*Negative and out-of-scope denial)(?=[\s\S]*Server-side enforcement)(?=[\s\S]*Signed evidence and production boundary)/i,
  "P6-04 role-scope acceptance matrix UI",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  /(?=[\s\S]*data-heu-role-scope-access-decision-manifest="P6-04")(?=[\s\S]*P6-04 role-scope access decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P6_04_ACCESS_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P6-04-DEC-01)(?=[\s\S]*P6-04-DEC-06)(?=[\s\S]*Static preflight complete)(?=[\s\S]*Positive role access decision)(?=[\s\S]*Negative denial decision)(?=[\s\S]*Server-side enforcement decision)(?=[\s\S]*Broad access and delegation decision)(?=[\s\S]*Human access decision)(?=[\s\S]*production GO)/i,
  "P6-04 role-scope access decision manifest UI",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /(?=[\s\S]*Permission by role and workspace)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627\.md)(?=[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md)(?=[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md)(?=[\s\S]*role-scope evidence checklist, route matrix, acceptance matrix, access decision manifest, UAT execution closure template and UAT operator handoff)(?=[\s\S]*signed UAT still required)/i,
  "P6-04 production checklist acceptance matrix row",
);

requireText(
  "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md",
  /(?=[\s\S]*P1-04 is PASS_LOCAL)(?=[\s\S]*Do not rename, drop, alter or merge production SQL objects)(?=[\s\S]*compatibility\s+views, not destructive renames)/i,
  "P1-04 SQL object map is local-only and non-destructive",
);

requireText(
  "docs/HEU_DATA_MODEL_V1.md",
  /P1-01 is PASS_LOCAL[\s\S]*does not approve schema\s+changes, production migration, real-data import, production dashboard use or\s+automated finance posting/i,
  "P1-01 data model local-only boundary",
);

requireText(
  "docs/HEU_DATA_DICTIONARY_V1.md",
  /P1-02 is PASS_LOCAL[\s\S]*does not approve\s+schema changes, production migration, real-data import or production data\s+exposure/i,
  "P1-02 data dictionary local-only boundary",
);

requireText(
  "docs/HEU_ROLE_PERMISSION_MATRIX_V1.md",
  /P1-03 is PASS_LOCAL[\s\S]*does\s+not approve production access, broad permissions, real-data UAT or autonomous\s+AI approval/i,
  "P1-03 role permission matrix local-only boundary",
);

requireText(
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  /Do not send real passwords into Codex\/chat/i,
  "synthetic account password boundary",
);

requireText(
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  /UAT_OUT_OF_SCOPE[\s\S]*BLOCK/i,
  "browser UAT out-of-scope block expectation",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /\|\s*Rollback plan\s*\|\s*IT_DATA\s*\|\s*IN_PROGRESS\s*\|/i,
  "rollback plan IN_PROGRESS status",
);

requireText(
  "components/ttgdtx/ttgdtx-production-readiness-guard.tsx",
  /data-ttgdtx-production-readiness-guard="TTGDTX_9PLUS"[\s\S]*Production remains NO-GO[\s\S]*PASS_LOCAL[\s\S]*signed UAT/i,
  "TTGDTX production readiness guard display",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  /(?=[\s\S]*data-ttgdtx-production-execution-queue="TTGDTX_9PLUS")(?=[\s\S]*TTGDTX production execution queue)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*PRODUCTION_EXECUTION_STEPS)(?=[\s\S]*redaction, backup\/restore, migration order,\s+role UAT, P0-19, P2-17, P2-18, audit-log traceability,\s+hard-delete conversion\/waiver, P0-14 evidence binder, P0-15\s+final handoff summary, then final owner Go\/No-Go)(?=[\s\S]*Final result stays NO-GO until signed owner GO exists)/i,
  "TTGDTX production execution queue UI shell",
);

requireText(
  "components/ttgdtx/ttgdtx-production-evidence-binder.tsx",
  /(?=[\s\S]*data-ttgdtx-production-evidence-binder="P0-14")(?=[\s\S]*P0-14 production evidence binder)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*PRODUCTION_EVIDENCE_REQUIREMENTS)(?=[\s\S]*NO-GO until signed)(?=[\s\S]*data-p014-production-evidence-closure-tracker="P0-14")(?=[\s\S]*P0-14 production evidence closure tracker)(?=[\s\S]*P0_14_CLOSE \/ NO_GO \/ BLOCKED)(?=[\s\S]*Missing proof keeps production NO-GO)(?=[\s\S]*Forbidden content stays out of Git\/Codex\/chat)/i,
  "P0-14 production evidence binder UI",
);

requireText(
  "app/ttgdtx/page.tsx",
  /<TtgdtxProductionExecutionQueue\s*\/>[\s\S]*<TtgdtxProductionEvidenceBinder\s*\/>[\s\S]*<TtgdtxOwnerGoNoGoEvidenceChecklist\s*\/>/,
  "TTGDTX landing page mounts evidence binder before owner signoff",
);

requireText(
  "lib/production-readiness.ts",
  /P0-10[\s\S]*P0-03[\s\S]*Step90-Step110[\s\S]*P6-04[\s\S]*P0-19[\s\S]*P2-17[\s\S]*P2-18[\s\S]*P6-03[\s\S]*P6-06[\s\S]*P0-14[\s\S]*P0-15[\s\S]*Owner GO\/NO-GO/i,
  "TTGDTX production execution shared source order",
);

requireText(
  "lib/production-readiness.ts",
  /P0-15[\s\S]*Prepare final handoff summary[\s\S]*Record live git state, local checks, Stage D\/NO-GO and P0-03\/P0-09\/P0-13\/P0-14 evidence paths[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*P0-14 split into P6-04\/P6-03\/P6-06 proof paths and the P6-06 finding register[\s\S]*before owner decision/i,
  "P0-15 final handoff split evidence shared source",
);

requireText(
  "lib/production-readiness.ts",
  /(?=[\s\S]*PRODUCTION_EVIDENCE_REQUIREMENTS)(?=[\s\S]*P0-14-01)(?=[\s\S]*Operator run sheet, backup ID, restore target, preflight\/postflight result, restore smoke-check result proving P0-19 and P3-01\/P3-02 gate preservation, and operator\/checker names)(?=[\s\S]*P0-19\/P3 gate preservation)(?=[\s\S]*P0-14-06)(?=[\s\S]*Role and workspace UAT evidence)(?=[\s\S]*P0-14-07)(?=[\s\S]*Audit-log traceability evidence)(?=[\s\S]*P0-14-08)(?=[\s\S]*Hard-delete and cascade conversion evidence)(?=[\s\S]*P0-14-09)(?=[\s\S]*signed decision referencing the owner sign-off pack and UAT operator handoff)(?=[\s\S]*CONTROLLED_SENSITIVE)(?=[\s\S]*CONTROLLED_REDACTED)(?=[\s\S]*raw student PII)(?=[\s\S]*bank statements?)(?=[\s\S]*AI(?:-produced)? approvals?)/i,
  "P0-14 production evidence shared source",
);

requireText(
  "components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-owner-go-no-go-evidence-checklist="P0-09")(?=[\s\S]*P0-09 owner GO\/NO-GO evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0-09-01)(?=[\s\S]*P0-09-06)(?=[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md)(?=[\s\S]*P3-01\/P3-02 lead lifecycle and handover UAT)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md)(?=[\s\S]*Signed final GO\/NO-GO is still required)(?=[\s\S]*BGH, IT_DATA, KHTC, PHAP_CHE, AUDIT and\s+TRUONG_PHONG\/process owner must sign the decision outside\s+Codex\/chat)(?=[\s\S]*PASS_LOCAL does not approve backup, restore, migration, legal waiver,\s+finance action, UAT acceptance, payout, dashboard reliance or\s+production GO)(?=[\s\S]*secrets, passwords, OTPs, service-role\s+keys, bank credentials, raw student PII, raw CCCD, raw phone numbers,\s+raw bank account numbers, bank statements, vouchers or raw payment\s+data)/i,
  "P0-09 owner GO/NO-GO evidence checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-owner-go-no-go-acceptance-matrix="P0-09")(?=[\s\S]*P0-09 owner GO\/NO-GO acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0_09_ACCEPT \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-09-ACCEPT-01)(?=[\s\S]*P0-09-ACCEPT-06)(?=[\s\S]*Evidence pack completeness and redaction)(?=[\s\S]*Backup\/restore and migration readiness)(?=[\s\S]*Finance, legal and UAT blockers closed)(?=[\s\S]*P3-01\/P3-02 lifecycle and handover UAT)(?=[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md)(?=[\s\S]*P0-19\/P2-05\/P2-03 finance gates)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*Owner decision quorum and accountability)(?=[\s\S]*Production boundary and AI\/Codex limitation)(?=[\s\S]*Final outcome stays NO-GO until every stop condition is closed)/i,
  "P0-09 owner GO/NO-GO acceptance matrix",
);

requireText(
  "components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-owner-go-no-go-decision-manifest="P0-09")(?=[\s\S]*P0-09 final owner GO\/NO-GO decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0_09_FINAL_GO \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-09-DEC-01)(?=[\s\S]*P0-09-DEC-06)(?=[\s\S]*Evidence pack and redaction decision)(?=[\s\S]*Backup\/restore and migration authority decision)(?=[\s\S]*Legal, tuition and finance gate decision)(?=[\s\S]*UAT and operating proof decision)(?=[\s\S]*signed P3-01\/P3-02 lifecycle and handover UAT)(?=[\s\S]*P3 handover bypass of P0-19\/P2-05\/P2-03)(?=[\s\S]*Role, audit and hard-delete proof decision)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*Final multi-owner accountability decision)(?=[\s\S]*does not approve production, backup, restore, migration,\s+legal waiver, finance action, UAT acceptance, payout,\s+dashboard reliance or production GO)(?=[\s\S]*AI\/Codex is named as approver, or PASS_LOCAL is treated\s+as production GO)/i,
  "P0-09 final owner GO/NO-GO decision manifest",
);

requireText(
  "app/ttgdtx/page.tsx",
  /TtgdtxProductionReadinessGuard[\s\S]*<TtgdtxProductionReadinessGuard \/>/,
  "TTGDTX landing page mounts production readiness guard",
);

requireText(
  "app/ttgdtx/page.tsx",
  /<TtgdtxProductionReadinessGuard\s*\/>[\s\S]*<TtgdtxUatSignoffGuard\s*\/>[\s\S]*<TtgdtxProductionExecutionQueue\s*\/>[\s\S]*<TtgdtxOwnerGoNoGoEvidenceChecklist\s*\/>[\s\S]*<TtgdtxOperatingControlStrip\b/,
  "TTGDTX landing page mounts production execution queue",
);

requireText(
  "components/ttgdtx/ttgdtx-uat-signoff-guard.tsx",
  /(?=[\s\S]*data-ttgdtx-uat-signoff-guard="INTERNAL_UAT")(?=[\s\S]*Internal UAT sign-off)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Production remains NO-GO until signed multi-account UAT evidence\s+exists)(?=[\s\S]*PASS_LOCAL does not approve real pilot start, production\s+migration, revenue recognition, payout, dashboard reliance or\s+Go\/No-Go)(?=[\s\S]*Do not paste real passwords, OTPs, service-role keys, student\s+PII, CCCD, phone numbers, bank accounts or raw payment evidence)(?=[\s\S]*UAT_ADMIN)(?=[\s\S]*UAT_BGH)(?=[\s\S]*UAT_KHTC)(?=[\s\S]*UAT_TUYEN_SINH)(?=[\s\S]*UAT_PHAP_CHE)(?=[\s\S]*UAT_OUT_OF_SCOPE)(?=[\s\S]*TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP\.md)(?=[\s\S]*TTGDTX_BROWSER_UAT_MATRIX_20260625\.md)(?=[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md)(?=[\s\S]*signed multi-account UAT still required)(?=[\s\S]*data-ttgdtx-uat-run-closure-tracker="INTERNAL_UAT")(?=[\s\S]*Internal UAT run closure tracker)(?=[\s\S]*UAT_PASS \/ UAT_FAIL \/ BLOCKED)(?=[\s\S]*UAT-CLOSE-01)(?=[\s\S]*UAT-CLOSE-06)(?=[\s\S]*Finance and dashboard negative tests pass)(?=[\s\S]*Owners sign UAT result)(?=[\s\S]*keeps production NO-GO)/i,
  "TTGDTX internal UAT sign-off guard",
);

requireText(
  "app/ttgdtx/page.tsx",
  /<TtgdtxProductionReadinessGuard\s*\/>[\s\S]*<TtgdtxUatSignoffGuard\s*\/>[\s\S]*<TtgdtxOperatingControlStrip\b/,
  "TTGDTX landing page mounts internal UAT sign-off guard",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Internal UAT sign-off[\s\S]*IN_PROGRESS[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md[\s\S]*internal UAT run closure tracker[\s\S]*ttgdtx-uat-signoff-guard\.tsx[\s\S]*UAT run closure tracker[\s\S]*audit:ttgdtx-production-readiness-guard[\s\S]*signed multi-account UAT still required/i,
  "internal UAT readiness guard checklist row",
);

requireText(
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_HANDOFF)(?=[\s\S]*UAT-HANDOFF-01)(?=[\s\S]*UAT-HANDOFF-06)(?=[\s\S]*TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP\.md)(?=[\s\S]*TTGDTX_BROWSER_UAT_MATRIX_20260625\.md)(?=[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md)(?=[\s\S]*Any missing account, route result, negative-test result, redaction proof,\s+reviewer or owner signature keeps production NO-GO)(?=[\s\S]*Even after UAT_PASS, production remains NO-GO)/i,
  "TTGDTX UAT operator handoff local-only boundary",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /(?=[\s\S]*Internal UAT Run Closure Tracker)(?=[\s\S]*BLOCKED_PENDING_MULTI_ACCOUNT_UAT)(?=[\s\S]*UAT_PASS)(?=[\s\S]*UAT-CLOSE-01 Synthetic accounts prepared)(?=[\s\S]*UAT-CLOSE-06 Owners sign UAT result)(?=[\s\S]*Any missing account, route result, negative-test result, redaction proof or\s+owner signature keeps production NO-GO)/i,
  "internal UAT execution-log closure tracker",
);

requireText(
  "docs/TTGDTX_LINKED_OPERATING_REVIEW_20260625.md",
  /Production\s+remains\s+NO-GO/i,
  "linked operating NO-GO boundary",
);

requireText(
  "docs/TTGDTX_GENERIC_SOURCE_EVIDENCE_AUDIT_20260626.md",
  /P1-06 is PASS_LOCAL[\s\S]*app`, `components` and `lib` do not hard-code a reference center\/source[\s\S]*does not approve production migration, real-data import, source-code\s+renaming, production source metadata changes or production use/i,
  "P1-06 generic source evidence local-only boundary",
);

requireText(
  "docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md",
  /Do not let AI approve/i,
  "operating matrix AI approval boundary",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /TTGDTX operating control matrix[\s\S]*PASS_LOCAL[\s\S]*audit:ttgdtx-operating-control-ui[\s\S]*signed UAT still required/i,
  "operating-control UI PASS_LOCAL checklist row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Align TTGDTX linked operating spine[\s\S]*PASS_LOCAL[\s\S]*P2-01\/P2-02\/P2-05\/P2-03\/P2-10\/P2-13\/P2-14\/P2-15\/P2-16\/P2-17\/P2-18[\s\S]*signed UAT still required/i,
  "linked operating spine PASS_LOCAL checklist row",
);

requireText(
  "docs/TTGDTX_CONTRACT_TUITION_MASTER_GUARD_20260627.md",
  /(?=[\s\S]*P2-01 and P2-02 are PASS_LOCAL)(?=[\s\S]*P2-01 contract is ACTIVE)(?=[\s\S]*P2-02 tuition policy is READY)(?=[\s\S]*P0-19 legal\/tuition finance gate)(?=[\s\S]*P2-05 receivable gate passes)(?=[\s\S]*production approval)/i,
  "P2-01/P2-02 master guard local-only boundary",
);

requireText(
  "components/ttgdtx/ttgdtx-contract-tuition-master-guard.tsx",
  /(?=[\s\S]*data-ttgdtx-contract-tuition-master-guard="P2-01-P2-02")(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2-01 contract must be ACTIVE)(?=[\s\S]*P2-02 tuition policy must be READY)(?=[\s\S]*P2-03 creates receivable only after)/i,
  "P2-01/P2-02 master guard display",
);

requireText(
  "app/ttgdtx/page.tsx",
  /<TtgdtxOperatingControlStrip currentCode="P2-01" \/>[\s\S]*<TtgdtxContractTuitionMasterGuard \/>/,
  "P2-01 page master guard mount",
);

requireText(
  "app/ttgdtx/tuition/page.tsx",
  /<TtgdtxOperatingControlStrip currentCode="P2-02" \/>[\s\S]*<TtgdtxContractTuitionMasterGuard \/>/,
  "P2-02 page master guard mount",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /P2-01 TTGDTX contract active[\s\S]*PASS_LOCAL[\s\S]*ttgdtx-contract-tuition-master-guard\.tsx[\s\S]*audit:ttgdtx-contract-tuition-master-guard[\s\S]*signed legal\/finance UAT still required/i,
  "P2-01 contract PASS_LOCAL checklist row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /P2-02 tuition policy ready[\s\S]*PASS_LOCAL[\s\S]*ttgdtx-contract-tuition-master-guard\.tsx[\s\S]*audit:ttgdtx-contract-tuition-master-guard[\s\S]*signed KHTC\/Phap Che UAT still required/i,
  "P2-02 tuition PASS_LOCAL checklist row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /P2-10\)[\s\S]*PASS_LOCAL[\s\S]*invoice\/chung-tu UAT evidence checklist[\s\S]*P2-10 invoice\/chung-tu decision manifest[\s\S]*TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627\.md[\s\S]*audit:ttgdtx-invoice-policy[\s\S]*signed KHTC\/Phap Che|P2-10\)[\s\S]*PASS_LOCAL[\s\S]*invoice\/chung-tu UAT evidence checklist[\s\S]*P2-10 invoice\/chung-tu decision manifest[\s\S]*TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627\.md[\s\S]*audit:ttgdtx-invoice-policy[\s\S]*signed KHTC\/Pháp chế/i,
  "P2-10 invoice policy PASS_LOCAL checklist row",
);

requireText(
  "components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx",
  /data-ttgdtx-invoice-policy-matrix="P2-10"[\s\S]*yes\/no[\s\S]*PASS_LOCAL[\s\S]*PENDING_POLICY/i,
  "P2-10 invoice policy matrix local-only display",
);

requireText(
  "components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx",
  /(?=[\s\S]*data-ttgdtx-invoice-evidence-checklist="P2-10")(?=[\s\S]*P2-10 invoice\/chung-tu UAT evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2_10_INVOICE_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P2-10-INV-01)(?=[\s\S]*P2-10-INV-06)(?=[\s\S]*PENDING_POLICY chan doi soat va chi tiep)(?=[\s\S]*KHTC\/Phap Che ky UAT truoc production)(?=[\s\S]*PASS_LOCAL is treated as invoice approval, legal\/tax advice, UAT acceptance or production GO)/i,
  "P2-10 invoice/chung-tu UAT evidence checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx",
  /(?=[\s\S]*data-ttgdtx-invoice-decision-manifest="P2-10")(?=[\s\S]*P2-10 invoice\/chung-tu decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2_10_INVOICE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P2-10-DEC-01)(?=[\s\S]*P2-10-DEC-06)(?=[\s\S]*Collection model and payer decision)(?=[\s\S]*Required invoice\/chung-tu issuance decision)(?=[\s\S]*Not-required or waiver basis decision)(?=[\s\S]*Pending policy downstream blocker decision)(?=[\s\S]*Evidence redaction and storage decision)(?=[\s\S]*Final KHTC\/PHAP_CHE sign-off decision)(?=[\s\S]*PASS_LOCAL is treated as invoice approval)/i,
  "P2-10 invoice/chung-tu decision manifest",
);

requireText(
  "docs/TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TEMPLATE)(?=[\s\S]*does not approve invoice issuance, tax\/legal interpretation,\s+finance posting, UAT acceptance or production GO)(?=[\s\S]*P2-10-INV-01)(?=[\s\S]*P2-10-INV-06)(?=[\s\S]*Downstream blocking check)(?=[\s\S]*Final KHTC\/PHAP_CHE UAT sign-off)(?=[\s\S]*P2-10 Invoice\/Chung-Tu Decision Manifest)(?=[\s\S]*P2_10_INVOICE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P2-10-DEC-01)(?=[\s\S]*P2-10-DEC-06)(?=[\s\S]*P2-10 invoice\/chung-tu policy remains production NO-GO)/i,
  "P2-10 invoice/chung-tu UAT runbook",
);

requireText(
  "lib/ttgdtx-invoice-policy.ts",
  /HEU_COLLECTS_STUDENT[\s\S]*CENTER_COLLECTS_STUDENT[\s\S]*SPLIT_COLLECTION[\s\S]*OFFSET_OR_ADJUSTMENT[\s\S]*OTHER_COLLECTION_MODEL/i,
  "P2-10 invoice policy case coverage",
);

requireText(
  "components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx",
  /data-ttgdtx-payment-dossier-checklist=\{currentStep\}[\s\S]*Checklist hồ sơ thanh toán|data-ttgdtx-payment-dossier-checklist=\{currentStep\}[\s\S]*Checklist ho so thanh toan/i,
  "P2-15/P2-17 payment dossier checklist display",
);

requireText(
  "components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-payment-dossier-acceptance-matrix=\{currentStep\})(?=[\s\S]*payment dossier acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*PAYMENT_DOSSIER_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P2-DOSSIER-ACCEPT-01)(?=[\s\S]*P2-DOSSIER-ACCEPT-06)(?=[\s\S]*Locked reconciliation period accepted)(?=[\s\S]*BBNT accepted-period proof complete)(?=[\s\S]*Partner invoice or waiver controlled)(?=[\s\S]*Payment amount basis reconciles)(?=[\s\S]*P2-19 source-control checks pass)(?=[\s\S]*Signed UAT and production boundary)/i,
  "P2-15/P2-17 payment dossier acceptance matrix",
);

requireText(
  "components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx",
  /BBNT[\s\S]*Partner invoice evidence[\s\S]*duplicate payout/i,
  "P2-15/P2-17 payment dossier gate metadata",
);

requireText(
  "app/ttgdtx/payment-requests/page.tsx",
  /TtgdtxPaymentDossierChecklist[\s\S]*currentStep="P2-15"/,
  "P2-15 payment dossier checklist mount",
);

requireText(
  "app/ttgdtx/payment-requests/pay/page.tsx",
  /TtgdtxPaymentDossierChecklist[\s\S]*currentStep="P2-17"/,
  "P2-17 payment dossier checklist mount",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /BBNT evidence gate before partner payment[\s\S]*PASS_LOCAL[\s\S]*payment dossier acceptance matrix[\s\S]*audit:ttgdtx-payment-dossier-checklist[\s\S]*signed UAT/i,
  "payment dossier checklist PASS_LOCAL checklist row",
);

requireText(
  "components/ttgdtx/ttgdtx-payout-duplicate-guard.tsx",
  /data-ttgdtx-payout-duplicate-guard="P2-17"[\s\S]*nút pending[\s\S]*RPC[\s\S]*khóa dòng[\s\S]*voucher guard[\s\S]*P2-19/i,
  "P2-17 payout duplicate guard display",
);

requireText(
  "components/ttgdtx/ttgdtx-payout-execution-readiness-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-payout-execution-readiness-checklist="P2-17")(?=[\s\S]*P2-17 payout execution readiness checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2-17-EXEC-01)(?=[\s\S]*P2-17-EXEC-08)(?=[\s\S]*Approved request identity)(?=[\s\S]*Remaining amount control)(?=[\s\S]*Voucher uniqueness)(?=[\s\S]*Evidence URL required)(?=[\s\S]*P2-19 dossier blockers)(?=[\s\S]*RPC-only write path)(?=[\s\S]*Double-submit guard)(?=[\s\S]*Audit trace and status)(?=[\s\S]*does not initiate a\s+bank transfer)/i,
  "P2-17 payout execution readiness checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-payout-execution-readiness-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-payout-release-decision-manifest="P2-17")(?=[\s\S]*P2-17 payout release decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2-17-REL-01)(?=[\s\S]*P2-17-REL-06)(?=[\s\S]*P2_17_RELEASE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not\s+initiate a bank transfer, approve finance action, accept UAT or\s+mark production GO)/i,
  "P2-17 payout release decision manifest",
);

requireText(
  "components/ttgdtx/ttgdtx-payout-uat-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-payout-uat-evidence-checklist="P2-17")(?=[\s\S]*P2-17 payout UAT evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Signed payout UAT is still required before P2-17 can move from\s+IN_PROGRESS)(?=[\s\S]*P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK\.md)(?=[\s\S]*P2-17-01\/P2-17-02)(?=[\s\S]*P2-17-09\/P2-17-10\/P2-17-11)(?=[\s\S]*KHTC, PHAP_CHE, BGH and Audit must sign the evidence outside\s+Codex\/chat)/i,
  "P2-17 payout UAT evidence checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-payout-uat-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-payout-acceptance-matrix="P2-17")(?=[\s\S]*P2-17 payout acceptance matrix)(?=[\s\S]*P2_17_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P2-17-ACCEPT-01)(?=[\s\S]*P2-17-ACCEPT-06)(?=[\s\S]*Single write path and double-submit control)(?=[\s\S]*P2-19 dossier blockers)(?=[\s\S]*Owner sign-off and production boundary)/i,
  "P2-17 payout acceptance matrix",
);

requireText(
  "app/ttgdtx/payment-requests/pay/page.tsx",
  /TtgdtxPayoutDuplicateGuard[\s\S]*<TtgdtxPayoutDuplicateGuard \/>/,
  "P2-17 payout duplicate guard mount",
);

requireText(
  "app/ttgdtx/payment-requests/pay/page.tsx",
  /<TtgdtxPayoutDuplicateGuard\s*\/>[\s\S]*<TtgdtxPayoutExecutionReadinessChecklist\s*\/>[\s\S]*<TtgdtxPayoutUatEvidenceChecklist\s*\/>/,
  "P2-17 payout execution readiness and UAT evidence checklist mount",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /(?=[\s\S]*P2-17 execute payout once)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*ttgdtx-payout-duplicate-guard\.tsx)(?=[\s\S]*ttgdtx-payout-execution-readiness-checklist\.tsx)(?=[\s\S]*ttgdtx-payout-uat-evidence-checklist\.tsx)(?=[\s\S]*payout acceptance matrix)(?=[\s\S]*payout release decision manifest)(?=[\s\S]*audit:ttgdtx-payout-duplicate-guard)(?=[\s\S]*audit:ttgdtx-payout-execution-readiness)(?=[\s\S]*signed UAT)/i,
  "P2-17 duplicate guard checklist row",
);

requireText(
  "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
  /(?=[\s\S]*Payout Acceptance Matrix)(?=[\s\S]*P2-17-ACCEPT-01)(?=[\s\S]*P2-17-ACCEPT-06)(?=[\s\S]*P2_17_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P2-17-ACCEPT-01 through P2-17-ACCEPT-06 all pass with redacted evidence)/i,
  "P2-17 runbook payout acceptance matrix",
);

requireText(
  "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
  /(?=[\s\S]*Payout Release Decision Manifest)(?=[\s\S]*data-ttgdtx-payout-release-decision-manifest="P2-17")(?=[\s\S]*P2-17-REL-01)(?=[\s\S]*P2-17-REL-06)(?=[\s\S]*P2_17_RELEASE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*unclear bank-transfer boundary keeps\s+P2-17 NO-GO)/i,
  "P2-17 runbook payout release decision manifest",
);

requireText(
  "components/ttgdtx/ttgdtx-p019-gate-guard.tsx",
  /(?=[\s\S]*data-ttgdtx-p019-gate-guard="P0-19")(?=[\s\S]*Legal basis)(?=[\s\S]*Tuition policy)(?=[\s\S]*Finance gate)(?=[\s\S]*ALLOW_FINANCE)/i,
  "P0-19 legal tuition finance guard display",
);

requireText(
  "app/ttgdtx/gate/page.tsx",
  /<TtgdtxP019GateGuard\s*\/>[\s\S]*<TtgdtxP019UatEvidenceChecklist\s*\/>/,
  "P2-05 gate page mounts P0-19 guard and UAT evidence checklist",
);

requireText(
  "app/ttgdtx/receivables/page.tsx",
  /<TtgdtxP019GateGuard\s*\/>[\s\S]*<TtgdtxP019UatEvidenceChecklist\s*\/>/,
  "P2-03 receivables page mounts P0-19 guard and UAT evidence checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-p019-uat-evidence-checklist="P0-19")(?=[\s\S]*P0-19 legal\/finance UAT evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Signed legal\/finance UAT is still required before P0-19 can move\s+from IN_PROGRESS)(?=[\s\S]*P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK\.md)(?=[\s\S]*P0-19-01)(?=[\s\S]*P0-19-07)(?=[\s\S]*private contract bodies, raw student PII, CCCD, bank data,\s+passwords, OTPs, service-role keys and production credentials)(?=[\s\S]*PHAP_CHE, KHTC, BGH and\s+Audit must sign the evidence outside Codex\/chat)/i,
  "P0-19 legal/finance UAT evidence checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-p019-waiver-exception-register="P0-19")(?=[\s\S]*P0-19 waiver\/exception register)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0-19-WAIVE-01)(?=[\s\S]*P0-19-WAIVE-04)(?=[\s\S]*Step100 sandbox pilot open)(?=[\s\S]*Legal basis exception)(?=[\s\S]*Tuition\/invoice policy exception)(?=[\s\S]*Finance gate override request)(?=[\s\S]*P0_19_WAIVER_ACCEPT \/ NO_GO \/ BLOCKED)(?=[\s\S]*PASS_LOCAL does not approve a legal waiver, tuition exception, finance\s+override, Step100 production use, receivable creation, revenue\s+recognition or production GO)/i,
  "P0-19 waiver/exception register",
);

requireText(
  "components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-p019-acceptance-matrix="P0-19")(?=[\s\S]*P0-19 legal\/finance acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*legal\s+authority)(?=[\s\S]*tuition policy)(?=[\s\S]*finance gate status)(?=[\s\S]*Step100 sandbox\s+boundary)(?=[\s\S]*blocked\/allowed receivable path)(?=[\s\S]*owner sign-off)(?=[\s\S]*P0-19-ACCEPT-01)(?=[\s\S]*P0-19-ACCEPT-06)(?=[\s\S]*P0_19_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*Missing owner signature keeps production NO-GO)/i,
  "P0-19 legal/finance acceptance matrix",
);

requireText(
  "components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-p019-gate-decision-manifest="P0-19")(?=[\s\S]*P0-19 legal\/finance gate decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0-19-DEC-01)(?=[\s\S]*P0-19-DEC-06)(?=[\s\S]*Legal authority accepted)(?=[\s\S]*Tuition and invoice policy aligned)(?=[\s\S]*Finance gate blocks then allows)(?=[\s\S]*Step100 and exceptions controlled)(?=[\s\S]*Redacted evidence and owner signatures complete)(?=[\s\S]*Human gate decision recorded)(?=[\s\S]*P0_19_GATE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Missing gate decision ID, unsigned owner evidence, unresolved\s+invoice\/chung-tu basis, uncontrolled exception or raw sensitive\s+evidence keeps P0-19 NO-GO)/i,
  "P0-19 legal/finance gate decision manifest",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /(?=[\s\S]*P0-19 legal\/finance gate ready)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*ttgdtx-p019-gate-guard\.tsx)(?=[\s\S]*ttgdtx-p019-uat-evidence-checklist\.tsx)(?=[\s\S]*P0-19 waiver\/exception register)(?=[\s\S]*P0-19 acceptance matrix)(?=[\s\S]*P0-19 gate decision manifest)(?=[\s\S]*audit:ttgdtx-p019-gate-guard)(?=[\s\S]*signed legal\/finance UAT still required)/i,
  "P0-19 guard checklist row",
);

requireText(
  "components/ttgdtx/ttgdtx-operating-control-strip.tsx",
  /data-ttgdtx-operating-control=\{current\.code\}[\s\S]*Owner:[\s\S]*Điều kiện trước khi đi tiếp[\s\S]*Nếu thiếu điều kiện, bước này phải chặn/i,
  "operating-control strip owner and blocker display",
);

requireText(
  "lib/ttgdtx-operating-controls.ts",
  /code: "P2-01"[\s\S]*code: "P2-02"[\s\S]*code: "P2-05"[\s\S]*code: "P2-03"[\s\S]*code: "P2-10"[\s\S]*code: "P2-13"[\s\S]*code: "P2-14"[\s\S]*code: "P2-15"[\s\S]*code: "P2-16"[\s\S]*code: "P2-17"[\s\S]*code: "P2-18"/,
  "core TTGDTX operating spine order",
);

requireText(
  "docs/TTGDTX_PROCESS_CODE_MAP_20260625.md",
  /business name first[\s\S]*HEU Finance Desk[\s\S]*P5-03[\s\S]*TTGDTX\s+landing quick finder/i,
  "business-name-first process label rule",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /User-friendly TTGDTX process labels[\s\S]*PASS_LOCAL[\s\S]*audit:ttgdtx-process-labels/i,
  "TTGDTX process labels PASS_LOCAL checklist row",
);

requireText(
  "lib/ttgdtx-process-labels.ts",
  /code: "P2-10"[\s\S]*label: "Thu học phí \(P2-10\)"[\s\S]*hoa don thu tien/i,
  "P2-10 business-first process label",
);

requireText(
  "lib/ttgdtx-process-labels.ts",
  /code: "P5-03"[\s\S]*businessName: "HEU Finance Desk"[\s\S]*label: "HEU Finance Desk \(P5-03\)"[\s\S]*href: "\/finance-desk"[\s\S]*dashboard tai chinh/i,
  "P5-03 Finance Desk process label",
);

requireText(
  "components/ttgdtx/ttgdtx-process-quick-finder.tsx",
  /(?=[\s\S]*data-ttgdtx-process-quick-finder="TTGDTX_9PLUS")(?=[\s\S]*TTGDTX_PROCESS_LABELS)(?=[\s\S]*featuredProcessCodes)(?=[\s\S]*"P2-10")(?=[\s\S]*"P5-03")(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*production GO)/i,
  "TTGDTX process quick finder local-only display",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /Finance Desk Process Finder Link[\s\S]*HEU Finance Desk \(P5-03\)[\s\S]*TTGDTX process-label map[\s\S]*\/finance-desk[\s\S]*This is navigation\/discovery packaging only[\s\S]*does not grant production\s+access, execute UAT, approve finance action, run production migration, accept\s+evidence or mark production GO/i,
  "Finance Desk process finder log entry",
);

requireText(
  "app/ttgdtx/page.tsx",
  /TtgdtxProcessQuickFinder[\s\S]*<TtgdtxProcessQuickFinder \/>[\s\S]*<TtgdtxOperatingControlStrip currentCode="P2-01" \/>/,
  "TTGDTX landing page mounts process quick finder",
);

requireText(
  "docs/HEU_CODEX_OPERATING_PLAYBOOK.md",
  /Khong gui mat khau, OTP, API key/i,
  "Codex no-secret operating rule",
);

requireText(
  "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
  /Step100 is sandbox\/UAT only/i,
  "Step100 sandbox-only boundary",
);

requireText(
  "docs/P2_13_RECONCILIATION_REPAIR_SAFETY_UAT_RUNBOOK.md",
  /Step102 and Step103 are retired/i,
  "Step102/Step103 retired boundary",
);

requireText(
  "docs/TTGDTX_LEAD_QUICK_FIX_UAT_RUNBOOK.md",
  /quick-fix cannot self-promote/i,
  "TTGDTX lead quick-fix self-promotion boundary",
);

requireText(
  "docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md",
  /P4-01 is PASS_LOCAL[\s\S]*does not approve\s+production migration, production finance operation, real-data import, revenue\s+recognition or payout execution[\s\S]*Signed finance UAT must still prove/i,
  "P4-01 receivable/payment lifecycle local-only boundary",
);

requireText(
  "docs/HEU_LEAD_LIFECYCLE_STANDARD_20260627.md",
  /(?=[\s\S]*P3-01 is PASS_LOCAL)(?=[\s\S]*No raw form dump into AI)(?=[\s\S]*P3-02 prepares lead-to-student handover)(?=[\s\S]*P2-05 remains the receivable gate)(?=[\s\S]*P2-03 remains the final student receivable creation control)/i,
  "P3-01 lead lifecycle PASS_LOCAL and finance-gate boundary",
);

requireText(
  "components/leads/lead-lifecycle-guard.tsx",
  /(?=[\s\S]*data-heu-lead-lifecycle-acceptance-matrix="P3-01")(?=[\s\S]*P3-01 lead lifecycle acceptance matrix)(?=[\s\S]*P3-01-ACCEPT-01)(?=[\s\S]*P3-01-ACCEPT-06)(?=[\s\S]*P3_01_ACCEPT \/ FAIL \/ BLOCKED)/i,
  "P3-01 lead lifecycle acceptance matrix",
);

requireText(
  "docs/HEU_LEAD_LIFECYCLE_STANDARD_20260627.md",
  /(?=[\s\S]*P3-01 Acceptance Matrix)(?=[\s\S]*data-heu-lead-lifecycle-acceptance-matrix="P3-01")(?=[\s\S]*P3-01-ACCEPT-01)(?=[\s\S]*P3-01-ACCEPT-06)(?=[\s\S]*P3_01_ACCEPT \/ FAIL \/ BLOCKED)/i,
  "P3-01 lifecycle acceptance matrix doc",
);

requireText(
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  /(?=[\s\S]*P3-02 is PASS_LOCAL)(?=[\s\S]*P2-05 remains the receivable gate)(?=[\s\S]*P2-03 remains the final\s+student receivable creation control)/i,
  "P3-02 handover PASS_LOCAL and finance-gate boundary",
);

requireText(
  "components/leads/lead-handover-panel.tsx",
  /(?=[\s\S]*data-heu-lead-handover-acceptance-matrix="P3-02")(?=[\s\S]*P3-02 lead-to-student handover acceptance matrix)(?=[\s\S]*P3-02-ACCEPT-01)(?=[\s\S]*P3-02-ACCEPT-06)(?=[\s\S]*P3_02_ACCEPT \/ FAIL \/ BLOCKED)/i,
  "P3-02 handover acceptance matrix",
);

requireText(
  "components/leads/lead-handover-panel.tsx",
  /(?=[\s\S]*data-heu-lead-handover-decision-manifest="P3-02")(?=[\s\S]*P3-02 handover decision manifest)(?=[\s\S]*P3-02-DEC-01)(?=[\s\S]*P3-02-DEC-06)(?=[\s\S]*P3_02_HANDOVER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not approve enrollment,\s+receivable creation, tuition collection, invoice issuance,\s+revenue recognition, finance posting, UAT acceptance, owner\s+waiver or production GO)/i,
  "P3-02 handover decision manifest",
);

requireText(
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  /(?=[\s\S]*P3-02 Acceptance Matrix)(?=[\s\S]*data-heu-lead-handover-acceptance-matrix="P3-02")(?=[\s\S]*P3-02-ACCEPT-01)(?=[\s\S]*P3-02-ACCEPT-06)(?=[\s\S]*P3_02_ACCEPT \/ FAIL \/ BLOCKED)/i,
  "P3-02 handover acceptance matrix doc",
);

requireText(
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  /(?=[\s\S]*P3-02 Handover Decision Manifest)(?=[\s\S]*data-heu-lead-handover-decision-manifest="P3-02")(?=[\s\S]*P3-02-DEC-01)(?=[\s\S]*P3-02-DEC-06)(?=[\s\S]*P3_02_HANDOVER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P3-02-ACCEPT-01 through P3-02-ACCEPT-06 and P3-02-DEC-01 through\s+P3-02-DEC-06)/i,
  "P3-02 handover decision manifest doc",
);

requireText(
  "components/leads/lead-lifecycle-guard.tsx",
  /(?=[\s\S]*data-heu-lead-lifecycle-handover-uat-pack="P3-01-P3-02")(?=[\s\S]*P3-01\/P3-02 UAT execution pack:\s*PASS_LOCAL only)(?=[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md)(?=[\s\S]*P3-UAT-01)(?=[\s\S]*P3-UAT-08)(?=[\s\S]*Tuyen Sinh, CTHSSV, Dao Tao, KHTC, IT_DATA and Audit)(?=[\s\S]*PASS_LOCAL does not accept UAT, approve handover reliance, create\s+finance facts, waive evidence, approve owner sign-off or mark\s+production GO)/i,
  "P3-01/P3-02 visible UAT execution pack",
);

requireText(
  "docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TEMPLATE)(?=[\s\S]*P3-01 lead lifecycle and P3-02 lead-to-student handover)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*P3-UAT-01)(?=[\s\S]*P3-UAT-08)(?=[\s\S]*P3-UAT-DEC-01)(?=[\s\S]*P3-UAT-DEC-06)(?=[\s\S]*No raw PII, CCCD, phone, bank data, vouchers, passwords, OTPs or keys)(?=[\s\S]*P3-01\/P3-02 remain pending until every P3-UAT case is executed with redacted\s+evidence)/i,
  "P3-01/P3-02 UAT runbook and closure rule",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /(?=[\s\S]*P3-01[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*P3-01\/P3-02 UAT execution pack[\s\S]*audit:heu-lead-lifecycle-handover-uat-pack)(?=[\s\S]*P3-02[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*P3-01\/P3-02 UAT execution pack[\s\S]*signed role-scope UAT and handover decision still required)/i,
  "P3 backlog UAT execution pack reference",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /(?=[\s\S]*Lead lifecycle standard[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*P3-01\/P3-02 UAT execution pack[\s\S]*signed UAT still required)(?=[\s\S]*Lead-to-student handover guard[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*P3-01\/P3-02 UAT execution pack[\s\S]*signed UAT and handover decision still required)/i,
  "production checklist P3 UAT execution pack reference",
);

if (failures.length > 0) {
  console.error("TTGDTX release-gate audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `TTGDTX release-gate audit passed. Checked ${requiredFiles.length} files and ${requiredScripts.length} npm scripts.`,
);
