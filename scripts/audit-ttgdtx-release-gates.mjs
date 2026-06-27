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
  "docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  "docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md",
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md",
  "docs/HEU_DATA_MODEL_V1.md",
  "docs/HEU_DATA_DICTIONARY_V1.md",
  "docs/HEU_ROLE_PERMISSION_MATRIX_V1.md",
  "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CODEX_OPERATING_PLAYBOOK.md",
  "docs/TTGDTX_LINKED_OPERATING_REVIEW_20260625.md",
  "docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md",
  "docs/TTGDTX_PROCESS_CODE_MAP_20260625.md",
  "docs/TTGDTX_BANK_RECEIPT_BATCH_POLICY_20260627.md",
  "docs/TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627.md",
  "docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md",
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
  "docs/P2_13_RECONCILIATION_REPAIR_SAFETY_UAT_RUNBOOK.md",
  "docs/TTGDTX_LEAD_QUICK_FIX_UAT_RUNBOOK.md",
  "docs/TTGDTX_SYNTHETIC_REAL_LIKE_UAT_PACK_20260627.md",
  "fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json",
  "lib/vnd-money.ts",
  "scripts/audit-heu-backlog-codes.mjs",
  "scripts/audit-heu-bgh-dashboard-spec.mjs",
  "scripts/audit-heu-data-foundation.mjs",
  "scripts/audit-heu-ai-policy.mjs",
  "scripts/audit-heu-lead-handover-policy.mjs",
  "scripts/audit-heu-role-scope-uat-pack.mjs",
  "scripts/audit-heu-sql-object-master-map.mjs",
  "scripts/audit-ttgdtx-backup-restore-dry-run-pack.mjs",
  "scripts/audit-ttgdtx-accounting-dashboard-uat-plan.mjs",
  "scripts/audit-ttgdtx-synthetic-uat-pack.mjs",
  "scripts/audit-ttgdtx-period-lock-policy.mjs",
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
  "audit:heu-data-foundation",
  "audit:heu-lead-handover-policy",
  "audit:heu-role-scope-uat-pack",
  "audit:heu-sql-object-master-map",
  "audit:hard-delete",
  "audit:vnd-money-format",
  "audit:permission-soft-revoke",
  "audit:ttgdtx-accounting-dashboard-uat-plan",
  "audit:ttgdtx-audit-log",
  "audit:ttgdtx-backup-restore-dry-run-pack",
  "audit:ttgdtx-cascade",
  "audit:ttgdtx-dashboard-access",
  "audit:ttgdtx-data-fetch-gate",
  "audit:ttgdtx-generic-source-evidence",
  "audit:ttgdtx-lead-quick-fix-safety",
  "audit:ttgdtx-pilot-open-safety",
  "audit:ttgdtx-period-lock-policy",
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
  /Do not run production migration from Codex\/chat/i,
  "Codex/chat production migration boundary",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  /PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,\s+production migration is approved, or production GO is approved/i,
  "backup/restore evidence pack local-only boundary",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  /Do not paste secrets, passwords, OTPs, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data/i,
  "backup/restore evidence pack secret boundary",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Current recommendation:\s*NO-GO/i,
  "NO-GO current recommendation",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /Result:\s*PARTIAL PASS/i,
  "partial UAT pass marker",
);

requireText(
  "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md",
  /(?=[\s\S]*P5-01 is PASS_LOCAL)(?=[\s\S]*not production-approved)(?=[\s\S]*P2-18 remains IN_PROGRESS)/i,
  "P5-01 dashboard UAT plan is local-only and P2-18 remains in progress",
);

requireText(
  "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md",
  /P5-02 is PASS_LOCAL[\s\S]*does not implement a production BGH dashboard[\s\S]*approve production GO or replace signed UAT/i,
  "P5-02 BGH dashboard spec local-only boundary",
);

requireText(
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  /(?=[\s\S]*P6-04 is PASS_LOCAL)(?=[\s\S]*Signed role-scope UAT evidence is still required)(?=[\s\S]*NO-GO until signed UAT evidence exists)/i,
  "P6-04 role-scope UAT pack stays local-only",
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
  "docs/TTGDTX_PROCESS_CODE_MAP_20260625.md",
  /business name first/i,
  "business-name-first process label rule",
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
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  /(?=[\s\S]*P3-02 is PASS_LOCAL)(?=[\s\S]*P2-05 remains the receivable gate)(?=[\s\S]*P2-03 remains the final\s+student receivable creation control)/i,
  "P3-02 handover PASS_LOCAL and finance-gate boundary",
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
