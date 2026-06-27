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
  "docs/HEU_DATA_MODEL_V1.md",
  "docs/HEU_DATA_DICTIONARY_V1.md",
  "docs/GIT_CLEANUP_ANALYSIS.md",
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  "docs/HEU_ROLE_PERMISSION_MATRIX_V1.md",
  "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CODEX_OPERATING_PLAYBOOK.md",
  "docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/TTGDTX_LINKED_OPERATING_REVIEW_20260625.md",
  "docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md",
  "docs/TTGDTX_PROCESS_CODE_MAP_20260625.md",
  "docs/TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627.md",
  "docs/TTGDTX_BANK_RECEIPT_BATCH_POLICY_20260627.md",
  "docs/TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627.md",
  "docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md",
  "docs/HEU_LEAD_LIFECYCLE_STANDARD_20260627.md",
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
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
  "components/settings/supabase-backup-restore-guard.tsx",
  "components/settings/user-scope-enforcement-panel.tsx",
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
  "scripts/audit-heu-final-handoff-coverage.mjs",
  "scripts/audit-heu-git-hygiene.mjs",
  "scripts/audit-heu-ai-policy.mjs",
  "scripts/audit-heu-lead-handover-policy.mjs",
  "scripts/audit-heu-lead-lifecycle-standard.mjs",
  "scripts/audit-heu-non-ttgdtx-cascade-review.mjs",
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
  "audit:heu-final-handoff-coverage",
  "audit:heu-git-hygiene",
  "audit:heu-lead-handover-policy",
  "audit:heu-lead-lifecycle-standard",
  "audit:heu-non-ttgdtx-cascade-review",
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
  /(?=[\s\S]*Restore Smoke-Check Acceptance Matrix)(?=[\s\S]*data-p003-restore-smoke-check-acceptance-matrix="P0-03")(?=[\s\S]*P0-03-SMOKE-01)(?=[\s\S]*P0-03-SMOKE-06)(?=[\s\S]*RESTORE_SMOKE_CHECK_PASS \/ FAIL \/ BLOCKED)(?=[\s\S]*PASS_LOCAL does not prove an actual restore, smoke-check, UAT pass, rollback\s+proof, migration approval or production GO)/i,
  "backup/restore smoke-check acceptance evidence pack",
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
  /(?=[\s\S]*data-p003-backup-restore-operator-run-sheet="P0-03")(?=[\s\S]*P0-03 backup\/restore operator run sheet)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*BACKUP_RESTORE_RUN_READY \/ STOP \/ BLOCKED)(?=[\s\S]*P0-03-RUN-01)(?=[\s\S]*P0-03-RUN-06)(?=[\s\S]*Prove production versus restore target identity)(?=[\s\S]*Apply Step90-Step110 only on restore target)(?=[\s\S]*PASS_LOCAL does not prove an approved execution window, backup,\s+restore, migration dry-run, rollback proof, owner sign-off or\s+production GO)/i,
  "P0-03 backup/restore operator run sheet",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  /(?=[\s\S]*data-p003-restore-smoke-check-acceptance-matrix="P0-03")(?=[\s\S]*P0-03 restore smoke-check acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*target isolation)(?=[\s\S]*core master readability)(?=[\s\S]*finance guard\s+behavior)(?=[\s\S]*role\/workspace scope)(?=[\s\S]*audit trace)(?=[\s\S]*dashboard source\s+reconciliation)(?=[\s\S]*P0-03-SMOKE-01)(?=[\s\S]*P0-03-SMOKE-06)(?=[\s\S]*RESTORE_SMOKE_CHECK_PASS \/ FAIL \/ BLOCKED)(?=[\s\S]*PASS_LOCAL does not prove an actual restore, smoke-check, UAT pass,\s+rollback proof, migration approval or production GO)/i,
  "P0-03 restore smoke-check acceptance matrix",
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
  /Date:\s*2026-06-27[\s\S]*Git state:\s*clean local worktree at last verified handoff; exact ahead count and\s+current commit are live Git state[\s\S]*Conclusion:\s*Stage D - internal controlled test only\. Production remains NO-GO[\s\S]*TTGDTX process quick finder, P5-02 Master Control action queue, P0-13 blocker source evidence-path alignment, P0-14 evidence closure tracker, internal UAT run closure tracker, UAT execution closure template, UAT operator handoff sweeps and owner sign-off handoff alignment[\s\S]*Production readiness guard[\s\S]*internal UAT closure tracker[\s\S]*UAT execution closure template[\s\S]*UAT operator handoff[\s\S]*owner sign-off handoff evidence path[\s\S]*Production blocker shared source[\s\S]*P0-03 operator run sheet evidence path[\s\S]*P0-09 owner sign-off\/UAT handoff evidence path[\s\S]*Process discovery\/navigation[\s\S]*\/ttgdtx` quick finder[\s\S]*Accounting dashboard \/ BGH control[\s\S]*P5-02 Master Control action queue[\s\S]*Production is still NO-GO because:[\s\S]*No real production backup\/restore dry-run evidence[\s\S]*Step90-Step110 production migration order is not signed[\s\S]*Final BGH\/IT_DATA\/KHTC\/PHAP_CHE\/Audit\/owner GO\/NO-GO is not signed[\s\S]*Record final owner GO\/NO-GO outside Codex\/chat using the owner sign-off pack\s+and UAT operator handoff references/i,
  "HEU current-state inventory Stage D NO-GO snapshot",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Review dirty Git state[\s\S]*PASS_LOCAL[\s\S]*GIT_CLEANUP_ANALYSIS\.md[\s\S]*audit:heu-git-hygiene[\s\S]*current exact ahead count must be verified live/i,
  "P0-02 Git hygiene checklist row",
);

requireText(
  "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_PACK)(?=[\s\S]*This document does not approve production)(?=[\s\S]*Production remains NO-GO until the required owners review the evidence,[\s\S]*record\s+their decision, and sign the final Go\/No-Go decision)(?=[\s\S]*Codex\/AI output is\s+advisory only)(?=[\s\S]*Do not run production migration from Codex\/chat)(?=[\s\S]*Do not mark production GO from Codex\/chat)(?=[\s\S]*Do not paste secrets, passwords, OTPs, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data)(?=[\s\S]*Production backup and restore dry-run)(?=[\s\S]*Step90-Step110 migration order)(?=[\s\S]*P0-19 legal\/finance gate)(?=[\s\S]*P2-17 payout once)(?=[\s\S]*P2-18 accounting dashboard)(?=[\s\S]*Role and workspace permission)(?=[\s\S]*Audit log completeness)(?=[\s\S]*Hard-delete\/cascade risk)(?=[\s\S]*Internal multi-account UAT)(?=[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md)(?=[\s\S]*P0-09 Owner GO\/NO-GO Acceptance Matrix)(?=[\s\S]*P0_09_ACCEPT \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-09-ACCEPT-01)(?=[\s\S]*P0-09-ACCEPT-06)(?=[\s\S]*Final production recommendation remains NO-GO until every required owner signs\s+GO, P0-09-ACCEPT-01 through P0-09-ACCEPT-06 are accepted and no stop condition\s+remains open)/i,
  "production owner sign-off pack local-only boundary",
);

requireText(
  "docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_PACK)(?=[\s\S]*This document does not approve\s+production, UAT pass, backup completion, migration, finance action or owner\s+Go\/No-Go)(?=[\s\S]*Production remains NO-GO until required evidence is collected)(?=[\s\S]*Do not paste secrets, passwords, OTPs, service-role keys, API keys, private\s+keys, bank credentials, reset links, raw student PII, raw CCCD, raw phone\s+numbers, raw bank account numbers, bank statements, vouchers or raw payment\s+data)(?=[\s\S]*Do not store raw controlled evidence in Git)(?=[\s\S]*PUBLIC_CONTROL)(?=[\s\S]*CONTROLLED_REDACTED)(?=[\s\S]*CONTROLLED_SENSITIVE)(?=[\s\S]*FORBIDDEN_IN_GIT_OR_CODEX)(?=[\s\S]*Receive evidence)(?=[\s\S]*Classify)(?=[\s\S]*Redact)(?=[\s\S]*Review)(?=[\s\S]*Reference)(?=[\s\S]*Sign)(?=[\s\S]*audit:heu-controlled-evidence-redaction-pack)/i,
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
  /Final owner Go\/No-Go sign-off[\s\S]*IN_PROGRESS[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md[\s\S]*ttgdtx-owner-go-no-go-evidence-checklist\.tsx[\s\S]*owner GO\/NO-GO acceptance matrix[\s\S]*audit:ttgdtx-production-owner-signoff-pack[\s\S]*signed final GO\/NO-GO decision still required/i,
  "final owner Go/No-Go sign-off checklist row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Controlled evidence redaction\/intake[\s\S]*PASS_LOCAL[\s\S]*HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\.md[\s\S]*audit:heu-controlled-evidence-redaction-pack[\s\S]*raw evidence stays outside Git/i,
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
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /(?=[\s\S]*Audit log completeness)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*ttgdtx-audit-log-uat-evidence-checklist\.tsx)(?=[\s\S]*audit trace acceptance matrix)(?=[\s\S]*audit-log evidence acceptance matrix)(?=[\s\S]*audit:ttgdtx-audit-trail-guard)(?=[\s\S]*signed UAT)/i,
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
  /(?=[\s\S]*P2-18 accounting dashboard)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*ttgdtx-dashboard-readonly-guard\.tsx)(?=[\s\S]*ttgdtx-dashboard-source-reconciliation-checklist\.tsx)(?=[\s\S]*ttgdtx-dashboard-uat-evidence-checklist\.tsx)(?=[\s\S]*dashboard acceptance matrix)(?=[\s\S]*audit:ttgdtx-dashboard-readonly-guard)(?=[\s\S]*audit:ttgdtx-dashboard-source-reconciliation)(?=[\s\S]*signed UAT evidence)/i,
  "P2-18 read-only guard checklist row",
);

requireText(
  "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md",
  /(?=[\s\S]*Dashboard Acceptance Matrix)(?=[\s\S]*P2-18-ACCEPT-01)(?=[\s\S]*P2-18-ACCEPT-06)(?=[\s\S]*P2_18_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P2-18-ACCEPT-01 through P2-18-ACCEPT-06 all pass with redacted evidence)/i,
  "P2-18 runbook dashboard acceptance matrix",
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
  "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md",
  /(?=[\s\S]*P5-02 Read-Only Blocker Summary)(?=[\s\S]*production-readiness-blocker-summary\.tsx)(?=[\s\S]*data-heu-production-action-queue="P5-02")(?=[\s\S]*Next controlled actions)(?=[\s\S]*No GO button is provided)(?=[\s\S]*P5-02 is PASS_LOCAL[\s\S]*does not implement a production BGH\s+dashboard[\s\S]*approve\s+production GO or replace signed UAT)/i,
  "P5-02 BGH dashboard spec local-only boundary",
);

requireText(
  "components/master-control/production-readiness-blocker-summary.tsx",
  /(?=[\s\S]*data-heu-production-blocker-summary="P5-02")(?=[\s\S]*P5-02 production blocker summary)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Read-only BGH\/owner view)(?=[\s\S]*Production remains NO-GO until backup\/restore, migration order,\s+legal\/finance UAT, payout UAT, dashboard UAT, role-scope UAT,\s+audit-log UAT, cascade waiver, redaction and final owner\s+sign-off are completed outside Codex\/chat)(?=[\s\S]*PRODUCTION_BLOCKERS)(?=[\s\S]*PRODUCTION_EXECUTION_STEPS)(?=[\s\S]*data-heu-production-action-queue="P5-02")(?=[\s\S]*Next controlled actions)(?=[\s\S]*owner GO\/NO-GO discussion)(?=[\s\S]*Current recommendation:[\s\S]*NO-GO)(?=[\s\S]*No GO button is provided here)(?=[\s\S]*PASS_LOCAL does not approve production\s+dashboard use, finance actions, production migration, UAT acceptance,\s+owner waiver or production GO)(?=[\s\S]*secrets, passwords, OTPs,\s+service-role keys, bank credentials, raw student PII, raw CCCD, raw\s+phone numbers, raw bank account numbers, bank statements, vouchers or\s+raw payment data)/i,
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
  /(?=[\s\S]*P6-06 is PASS_LOCAL)(?=[\s\S]*hard-delete-conversion-decision-queue\.tsx)(?=[\s\S]*hard-delete-waiver-evidence-checklist\.tsx)(?=[\s\S]*Decision Queue Evidence)(?=[\s\S]*audit:hard-delete-conversion-decision-queue)(?=[\s\S]*does not approve production deletion, cascade execution, waiver,\s+conversion\s+migration, cleanup, rollback success or production GO)/i,
  "P6-06 non-TTGDTX cascade review local-only boundary",
);

requireText(
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  /(?=[\s\S]*P6-06 Acceptance Matrix)(?=[\s\S]*data-hard-delete-cascade-acceptance-matrix="P6-06")(?=[\s\S]*P6-06-ACCEPT-01)(?=[\s\S]*P6-06-ACCEPT-06)(?=[\s\S]*P6_06_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*signed owner approval)/i,
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
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /(?=[\s\S]*Hard delete review)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*hard-delete\/cascade acceptance matrix)(?=[\s\S]*audit:hard-delete-boundary-guard)(?=[\s\S]*audit:hard-delete-conversion-decision-queue)(?=[\s\S]*non-TTGDTX conversion or written waiver still required)/i,
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
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /(?=[\s\S]*Permission by role and workspace)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627\.md)(?=[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md)(?=[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md)(?=[\s\S]*role-scope evidence checklist, route matrix, acceptance matrix, UAT execution closure template and UAT operator handoff)(?=[\s\S]*signed UAT still required)/i,
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
  /(?=[\s\S]*data-ttgdtx-production-execution-queue="TTGDTX_9PLUS")(?=[\s\S]*TTGDTX production execution queue)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*PRODUCTION_EXECUTION_STEPS)(?=[\s\S]*redaction, backup\/restore, migration order,\s+role UAT, P0-19, P2-17, P2-18, audit\/hard-delete, then final\s+owner Go\/No-Go)(?=[\s\S]*Final result stays NO-GO until signed owner GO exists)/i,
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
  /P0-10[\s\S]*P0-03[\s\S]*Step90-Step110[\s\S]*P6-04[\s\S]*P0-19[\s\S]*P2-17[\s\S]*P2-18[\s\S]*P6-03\/P6-06[\s\S]*Owner GO\/NO-GO/i,
  "TTGDTX production execution shared source order",
);

requireText(
  "lib/production-readiness.ts",
  /(?=[\s\S]*PRODUCTION_EVIDENCE_REQUIREMENTS)(?=[\s\S]*P0-14-01)(?=[\s\S]*Operator run sheet, backup ID, restore target, preflight\/postflight result, smoke-check result and operator\/checker names)(?=[\s\S]*P0-14-07)(?=[\s\S]*signed decision referencing the owner sign-off pack and UAT operator handoff)(?=[\s\S]*CONTROLLED_SENSITIVE)(?=[\s\S]*CONTROLLED_REDACTED)(?=[\s\S]*raw student PII)(?=[\s\S]*bank statements?)(?=[\s\S]*AI(?:-produced)? approvals?)/i,
  "P0-14 production evidence shared source",
);

requireText(
  "components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-owner-go-no-go-evidence-checklist="P0-09")(?=[\s\S]*P0-09 owner GO\/NO-GO evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0-09-01)(?=[\s\S]*P0-09-06)(?=[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md)(?=[\s\S]*Signed final GO\/NO-GO is still required)(?=[\s\S]*BGH, IT_DATA, KHTC, PHAP_CHE, AUDIT and\s+TRUONG_PHONG\/process owner must sign the decision outside\s+Codex\/chat)(?=[\s\S]*PASS_LOCAL does not approve backup, restore, migration, legal waiver,\s+finance action, UAT acceptance, payout, dashboard reliance or\s+production GO)(?=[\s\S]*secrets, passwords, OTPs, service-role\s+keys, bank credentials, raw student PII, raw CCCD, raw phone numbers,\s+raw bank account numbers, bank statements, vouchers or raw payment\s+data)/i,
  "P0-09 owner GO/NO-GO evidence checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx",
  /(?=[\s\S]*data-ttgdtx-owner-go-no-go-acceptance-matrix="P0-09")(?=[\s\S]*P0-09 owner GO\/NO-GO acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0_09_ACCEPT \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-09-ACCEPT-01)(?=[\s\S]*P0-09-ACCEPT-06)(?=[\s\S]*Evidence pack completeness and redaction)(?=[\s\S]*Backup\/restore and migration readiness)(?=[\s\S]*Finance, legal and UAT blockers closed)(?=[\s\S]*Owner decision quorum and accountability)(?=[\s\S]*Production boundary and AI\/Codex limitation)(?=[\s\S]*Final outcome stays NO-GO until every stop condition is closed)/i,
  "P0-09 owner GO/NO-GO acceptance matrix",
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
  /P2-10\)[\s\S]*PASS_LOCAL[\s\S]*invoice\/chung-tu UAT evidence checklist[\s\S]*TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627\.md[\s\S]*audit:ttgdtx-invoice-policy[\s\S]*signed KHTC\/Phap Che|P2-10\)[\s\S]*PASS_LOCAL[\s\S]*invoice\/chung-tu UAT evidence checklist[\s\S]*TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627\.md[\s\S]*audit:ttgdtx-invoice-policy[\s\S]*signed KHTC\/Pháp chế/i,
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
  "docs/TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TEMPLATE)(?=[\s\S]*does not approve invoice issuance, tax\/legal interpretation,\s+finance posting, UAT acceptance or production GO)(?=[\s\S]*P2-10-INV-01)(?=[\s\S]*P2-10-INV-06)(?=[\s\S]*Downstream blocking check)(?=[\s\S]*Final KHTC\/PHAP_CHE UAT sign-off)(?=[\s\S]*P2-10 invoice\/chung-tu policy remains production NO-GO)/i,
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
  /BBNT evidence gate before partner payment[\s\S]*PASS_LOCAL[\s\S]*audit:ttgdtx-payment-dossier-checklist[\s\S]*signed UAT/i,
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
  /(?=[\s\S]*P2-17 execute payout once)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*ttgdtx-payout-duplicate-guard\.tsx)(?=[\s\S]*ttgdtx-payout-execution-readiness-checklist\.tsx)(?=[\s\S]*ttgdtx-payout-uat-evidence-checklist\.tsx)(?=[\s\S]*payout acceptance matrix)(?=[\s\S]*audit:ttgdtx-payout-duplicate-guard)(?=[\s\S]*audit:ttgdtx-payout-execution-readiness)(?=[\s\S]*signed UAT)/i,
  "P2-17 duplicate guard checklist row",
);

requireText(
  "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
  /(?=[\s\S]*Payout Acceptance Matrix)(?=[\s\S]*P2-17-ACCEPT-01)(?=[\s\S]*P2-17-ACCEPT-06)(?=[\s\S]*P2_17_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P2-17-ACCEPT-01 through P2-17-ACCEPT-06 all pass with redacted evidence)/i,
  "P2-17 runbook payout acceptance matrix",
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
  /(?=[\s\S]*data-ttgdtx-p019-acceptance-matrix="P0-19")(?=[\s\S]*P0-19 legal\/finance acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*legal\s+authority)(?=[\s\S]*tuition policy)(?=[\s\S]*finance gate status)(?=[\s\S]*Step100 sandbox\s+boundary)(?=[\s\S]*blocked\/allowed receivable path)(?=[\s\S]*owner sign-off)(?=[\s\S]*P0-19-ACCEPT-01)(?=[\s\S]*P0-19-ACCEPT-06)(?=[\s\S]*P0_19_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*Missing owner signature keeps production NO-GO)/i,
  "P0-19 legal/finance acceptance matrix",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /(?=[\s\S]*P0-19 legal\/finance gate ready)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*ttgdtx-p019-gate-guard\.tsx)(?=[\s\S]*ttgdtx-p019-uat-evidence-checklist\.tsx)(?=[\s\S]*P0-19 acceptance matrix)(?=[\s\S]*audit:ttgdtx-p019-gate-guard)(?=[\s\S]*signed legal\/finance UAT still required)/i,
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
  /business name first[\s\S]*TTGDTX\s+landing quick finder/i,
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
  "components/ttgdtx/ttgdtx-process-quick-finder.tsx",
  /(?=[\s\S]*data-ttgdtx-process-quick-finder="TTGDTX_9PLUS")(?=[\s\S]*TTGDTX_PROCESS_LABELS)(?=[\s\S]*featuredProcessCodes)(?=[\s\S]*"P2-10")(?=[\s\S]*hoa don thu tien)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*production GO)/i,
  "TTGDTX process quick finder local-only display",
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
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  /(?=[\s\S]*P3-02 Acceptance Matrix)(?=[\s\S]*data-heu-lead-handover-acceptance-matrix="P3-02")(?=[\s\S]*P3-02-ACCEPT-01)(?=[\s\S]*P3-02-ACCEPT-06)(?=[\s\S]*P3_02_ACCEPT \/ FAIL \/ BLOCKED)/i,
  "P3-02 handover acceptance matrix doc",
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
