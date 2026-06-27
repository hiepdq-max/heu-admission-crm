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
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  "docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md",
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md",
  "docs/HEU_DATA_MODEL_V1.md",
  "docs/HEU_DATA_DICTIONARY_V1.md",
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
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
  "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md",
  "fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json",
  "components/audit/hard-delete-boundary-guard.tsx",
  "components/audit/ttgdtx-audit-trail-guard.tsx",
  "components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx",
  "components/ttgdtx/ttgdtx-dashboard-readonly-guard.tsx",
  "components/ttgdtx/ttgdtx-operating-control-strip.tsx",
  "components/ttgdtx/ttgdtx-p019-gate-guard.tsx",
  "components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx",
  "components/ttgdtx/ttgdtx-payout-duplicate-guard.tsx",
  "components/ttgdtx/ttgdtx-production-readiness-guard.tsx",
  "components/ttgdtx/ttgdtx-uat-signoff-guard.tsx",
  "components/settings/supabase-backup-restore-guard.tsx",
  "components/settings/user-scope-enforcement-panel.tsx",
  "lib/ttgdtx-invoice-policy.ts",
  "lib/ttgdtx-operating-controls.ts",
  "lib/ttgdtx-process-labels.ts",
  "lib/vnd-money.ts",
  "scripts/audit-heu-backlog-codes.mjs",
  "scripts/audit-heu-bgh-dashboard-spec.mjs",
  "scripts/audit-heu-data-foundation.mjs",
  "scripts/audit-heu-ai-policy.mjs",
  "scripts/audit-heu-lead-handover-policy.mjs",
  "scripts/audit-heu-non-ttgdtx-cascade-review.mjs",
  "scripts/audit-heu-role-scope-uat-pack.mjs",
  "scripts/audit-heu-sql-object-master-map.mjs",
  "scripts/audit-hard-delete-boundary-guard.mjs",
  "scripts/audit-ttgdtx-account-control-scope-decision.mjs",
  "scripts/audit-ttgdtx-audit-trail-guard.mjs",
  "scripts/audit-ttgdtx-backup-restore-dry-run-pack.mjs",
  "scripts/audit-ttgdtx-accounting-dashboard-uat-plan.mjs",
  "scripts/audit-ttgdtx-dashboard-readonly-guard.mjs",
  "scripts/audit-ttgdtx-synthetic-uat-pack.mjs",
  "scripts/audit-ttgdtx-invoice-policy.mjs",
  "scripts/audit-ttgdtx-migration-order-guard.mjs",
  "scripts/audit-ttgdtx-operating-control-ui.mjs",
  "scripts/audit-ttgdtx-p019-gate-guard.mjs",
  "scripts/audit-ttgdtx-payment-dossier-checklist.mjs",
  "scripts/audit-ttgdtx-period-lock-policy.mjs",
  "scripts/audit-ttgdtx-production-owner-signoff-pack.mjs",
  "scripts/audit-ttgdtx-payout-duplicate-guard.mjs",
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
  "audit:heu-data-foundation",
  "audit:heu-lead-handover-policy",
  "audit:heu-non-ttgdtx-cascade-review",
  "audit:heu-role-scope-uat-pack",
  "audit:heu-sql-object-master-map",
  "audit:hard-delete",
  "audit:hard-delete-boundary-guard",
  "audit:vnd-money-format",
  "audit:permission-soft-revoke",
  "audit:ttgdtx-account-control-scope-decision",
  "audit:ttgdtx-accounting-dashboard-uat-plan",
  "audit:ttgdtx-audit-log",
  "audit:ttgdtx-audit-trail-guard",
  "audit:ttgdtx-backup-restore-dry-run-pack",
  "audit:ttgdtx-cascade",
  "audit:ttgdtx-dashboard-access",
  "audit:ttgdtx-dashboard-readonly-guard",
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
  "components/settings/supabase-backup-restore-guard.tsx",
  /(?=[\s\S]*data-supabase-backup-restore-guard="P0-03")(?=[\s\S]*P0-03 Supabase backup\/restore dry-run)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Production remains NO-GO until real backup evidence, restore\s+evidence, migration preflight\/postflight results and owner\s+sign-off exist)(?=[\s\S]*PASS_LOCAL does not mean backup was executed,\s+restore was executed, UAT passed, production migration is\s+approved, or production GO is approved)(?=[\s\S]*Do not run production migration from Codex\/chat)(?=[\s\S]*secrets, passwords, OTPs, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data)(?=[\s\S]*Backup ID \/ snapshot ID)(?=[\s\S]*Restore target project\/ref)(?=[\s\S]*App connection checked against restore target)(?=[\s\S]*Human sign-off)(?=[\s\S]*audit:ttgdtx-backup-restore-dry-run-pack)(?=[\s\S]*audit:ttgdtx-release-gates)(?=[\s\S]*npm\.cmd run build)/i,
  "P0-03 Supabase backup/restore UI guard",
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
  "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_PACK)(?=[\s\S]*This document does not approve production)(?=[\s\S]*Production remains NO-GO until the required owners review the evidence,[\s\S]*record\s+their decision, and sign the final Go\/No-Go decision)(?=[\s\S]*Codex\/AI output is\s+advisory only)(?=[\s\S]*Do not run production migration from Codex\/chat)(?=[\s\S]*Do not mark production GO from Codex\/chat)(?=[\s\S]*Do not paste secrets, passwords, OTPs, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data)(?=[\s\S]*Production backup and restore dry-run)(?=[\s\S]*Step90-Step110 migration order)(?=[\s\S]*P0-19 legal\/finance gate)(?=[\s\S]*P2-17 payout once)(?=[\s\S]*P2-18 accounting dashboard)(?=[\s\S]*Role and workspace permission)(?=[\s\S]*Audit log completeness)(?=[\s\S]*Hard-delete\/cascade risk)(?=[\s\S]*Internal multi-account UAT)(?=[\s\S]*Final production recommendation remains NO-GO until every required owner signs\s+GO and no stop condition remains open)/i,
  "production owner sign-off pack local-only boundary",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Final owner Go\/No-Go sign-off[\s\S]*IN_PROGRESS[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md[\s\S]*audit:ttgdtx-production-owner-signoff-pack[\s\S]*signed final GO\/NO-GO decision still required/i,
  "final owner Go/No-Go sign-off checklist row",
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
  "app/audit/page.tsx",
  /TtgdtxAuditTrailGuard[\s\S]*<TtgdtxAuditTrailGuard \/>[\s\S]*AuditLogTable/i,
  "audit page mounts TTGDTX audit trail guard",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Audit log completeness[\s\S]*IN_PROGRESS[\s\S]*audit:ttgdtx-audit-trail-guard[\s\S]*signed UAT/i,
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
  "app/ttgdtx/accounting-dashboard/page.tsx",
  /TtgdtxDashboardReadonlyGuard[\s\S]*<TtgdtxDashboardReadonlyGuard \/>/,
  "P2-18 dashboard read-only guard mount",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /P2-18 accounting dashboard[\s\S]*IN_PROGRESS[\s\S]*audit:ttgdtx-dashboard-readonly-guard[\s\S]*signed UAT evidence/i,
  "P2-18 read-only guard checklist row",
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
  /P5-02 is PASS_LOCAL[\s\S]*does not implement a production BGH dashboard[\s\S]*approve production GO or replace signed UAT/i,
  "P5-02 BGH dashboard spec local-only boundary",
);

requireText(
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  /P6-06 is PASS_LOCAL[\s\S]*does not approve\s+production migration, production deletion, cascade execution, waiver, data\s+cleanup or production GO/i,
  "P6-06 non-TTGDTX cascade review local-only boundary",
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
  /HardDeleteBoundaryGuard[\s\S]*<HardDeleteBoundaryGuard \/>[\s\S]*AuditLogTable/i,
  "audit page mounts hard-delete boundary guard",
);

requireText(
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  /(?=[\s\S]*P6-04 is PASS_LOCAL)(?=[\s\S]*Signed role-scope UAT evidence is still required)(?=[\s\S]*NO-GO until signed UAT evidence exists)/i,
  "P6-04 role-scope UAT pack stays local-only",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  /(?=[\s\S]*data-heu-role-scope-ui-guard="P6-04")(?=[\s\S]*P6-04 role-scope UAT)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Signed role-scope UAT evidence is still required)(?=[\s\S]*NO-GO until\s+signed UAT evidence exists)(?=[\s\S]*UAT_ADMIN)(?=[\s\S]*UAT_BGH)(?=[\s\S]*UAT_KHTC)(?=[\s\S]*UAT_TUYEN_SINH)(?=[\s\S]*UAT_PHAP_CHE)(?=[\s\S]*UAT_AUDIT)(?=[\s\S]*UAT_OUT_OF_SCOPE_STAFF)(?=[\s\S]*passwords)(?=[\s\S]*OTPs)(?=[\s\S]*service-role keys)(?=[\s\S]*CCCD)(?=[\s\S]*bank\s+accounts)(?=[\s\S]*raw student identity data)/i,
  "P6-04 role-scope UI guard stays local-only and no-secret",
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
  "app/ttgdtx/page.tsx",
  /TtgdtxProductionReadinessGuard[\s\S]*<TtgdtxProductionReadinessGuard \/>/,
  "TTGDTX landing page mounts production readiness guard",
);

requireText(
  "components/ttgdtx/ttgdtx-uat-signoff-guard.tsx",
  /(?=[\s\S]*data-ttgdtx-uat-signoff-guard="INTERNAL_UAT")(?=[\s\S]*Internal UAT sign-off)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Production remains NO-GO until signed multi-account UAT evidence\s+exists)(?=[\s\S]*PASS_LOCAL does not approve real pilot start, production\s+migration, revenue recognition, payout, dashboard reliance or\s+Go\/No-Go)(?=[\s\S]*Do not paste real passwords, OTPs, service-role keys, student\s+PII, CCCD, phone numbers, bank accounts or raw payment evidence)(?=[\s\S]*UAT_ADMIN)(?=[\s\S]*UAT_BGH)(?=[\s\S]*UAT_KHTC)(?=[\s\S]*UAT_TUYEN_SINH)(?=[\s\S]*UAT_PHAP_CHE)(?=[\s\S]*UAT_OUT_OF_SCOPE)(?=[\s\S]*TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP\.md)(?=[\s\S]*TTGDTX_BROWSER_UAT_MATRIX_20260625\.md)(?=[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md)(?=[\s\S]*signed multi-account UAT still required)/i,
  "TTGDTX internal UAT sign-off guard",
);

requireText(
  "app/ttgdtx/page.tsx",
  /<TtgdtxProductionReadinessGuard\s*\/>[\s\S]*<TtgdtxUatSignoffGuard\s*\/>[\s\S]*<TtgdtxOperatingControlStrip\b/,
  "TTGDTX landing page mounts internal UAT sign-off guard",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Internal UAT sign-off[\s\S]*IN_PROGRESS[\s\S]*ttgdtx-uat-signoff-guard\.tsx[\s\S]*audit:ttgdtx-production-readiness-guard[\s\S]*signed multi-account UAT still required/i,
  "internal UAT readiness guard checklist row",
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
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /P2-10\)[\s\S]*PASS_LOCAL[\s\S]*audit:ttgdtx-invoice-policy[\s\S]*signed KHTC\/Phap Che|P2-10\)[\s\S]*PASS_LOCAL[\s\S]*audit:ttgdtx-invoice-policy[\s\S]*signed KHTC\/Pháp chế/i,
  "P2-10 invoice policy PASS_LOCAL checklist row",
);

requireText(
  "components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx",
  /data-ttgdtx-invoice-policy-matrix="P2-10"[\s\S]*yes\/no[\s\S]*PASS_LOCAL[\s\S]*PENDING_POLICY/i,
  "P2-10 invoice policy matrix local-only display",
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
  "app/ttgdtx/payment-requests/pay/page.tsx",
  /TtgdtxPayoutDuplicateGuard[\s\S]*<TtgdtxPayoutDuplicateGuard \/>/,
  "P2-17 payout duplicate guard mount",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /P2-17 execute payout once[\s\S]*IN_PROGRESS[\s\S]*audit:ttgdtx-payout-duplicate-guard[\s\S]*signed UAT/i,
  "P2-17 duplicate guard checklist row",
);

requireText(
  "components/ttgdtx/ttgdtx-p019-gate-guard.tsx",
  /(?=[\s\S]*data-ttgdtx-p019-gate-guard="P0-19")(?=[\s\S]*Legal basis)(?=[\s\S]*Tuition policy)(?=[\s\S]*Finance gate)(?=[\s\S]*ALLOW_FINANCE)/i,
  "P0-19 legal tuition finance guard display",
);

requireText(
  "app/ttgdtx/gate/page.tsx",
  /TtgdtxP019GateGuard[\s\S]*<TtgdtxP019GateGuard \/>/,
  "P2-05 gate page mounts P0-19 guard",
);

requireText(
  "app/ttgdtx/receivables/page.tsx",
  /TtgdtxP019GateGuard[\s\S]*<TtgdtxP019GateGuard \/>/,
  "P2-03 receivables page mounts P0-19 guard",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /P0-19 legal\/finance gate ready[\s\S]*IN_PROGRESS[\s\S]*audit:ttgdtx-p019-gate-guard[\s\S]*signed legal\/finance UAT still required/i,
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
  /business name first/i,
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
