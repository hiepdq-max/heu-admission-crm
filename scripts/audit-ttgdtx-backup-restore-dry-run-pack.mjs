import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packPath = "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md";
const runbookPath = "docs/STEP90_STEP109_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md";
const operatorRunSheetPath =
  "docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const componentPath = "components/settings/supabase-backup-restore-guard.tsx";
const pagePath = "app/settings/supabase-check/page.tsx";
const failures = [];

function fail(message) {
  failures.push(message);
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(contents, pattern, label, file = packPath) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

const requiredFiles = [
  packPath,
  runbookPath,
  operatorRunSheetPath,
  checklistPath,
  componentPath,
  pagePath,
  "docs/MIGRATION_ORDER_AUDIT.md",
  "docs/HARD_DELETE_AUDIT.md",
  "docs/STEP109_ROLE_PERMISSION_UAT_RUNBOOK.md",
  "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
  "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md",
  "docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const pack = exists(packPath) ? read(packPath) : "";
const runbook = exists(runbookPath) ? read(runbookPath) : "";
const operatorRunSheet = exists(operatorRunSheetPath)
  ? read(operatorRunSheetPath)
  : "";
const checklist = exists(checklistPath) ? read(checklistPath) : "";
const component = exists(componentPath) ? read(componentPath) : "";
const page = exists(pagePath) ? read(pagePath) : "";
const packageJson = JSON.parse(read("package.json"));

requireText(pack, /Backup\/Restore Dry-Run Evidence Pack/i, "pack title");
requireText(
  pack,
  /STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md[\s\S]*One-page operator\/checker run sheet before execution/i,
  "operator run sheet source document",
);
requireText(pack, /This document does not approve\s+production migration/i, "non-approval mode statement");
requireText(pack, /Production remains NO-GO until this pack is completed/i, "NO-GO completion boundary");
requireText(pack, /Do not run production migration from Codex\/chat/i, "Codex/chat production migration boundary");
requireText(pack, /Do not paste secrets, passwords, OTPs, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data/i, "secret and PII boundary");
requireText(pack, /Backup Evidence Record[\s\S]*Backup ID \/ snapshot ID[\s\S]*Backup operator[\s\S]*Backup checker[\s\S]*Backup result/i, "backup evidence fields");
requireText(pack, /Restore Evidence Record[\s\S]*Restore target project\/ref[\s\S]*App connection checked against restore target[\s\S]*Restore result/i, "restore evidence fields");
requireText(pack, /Static Preflight And Postflight Evidence[\s\S]*audit:ttgdtx-release-gates[\s\S]*audit:ttgdtx-backup-restore-dry-run-pack[\s\S]*npm\.cmd run build/i, "preflight and postflight command set");
requireText(pack, /Migration Execution Record[\s\S]*Step90[\s\S]*Step110/i, "Step90 through Step110 migration record");
requireText(pack, /Data Smoke-Check Evidence[\s\S]*Receivable duplicate guard[\s\S]*Payout cannot exceed approved amount[\s\S]*Dashboard views are read-only and role-scoped/i, "data smoke-check coverage");
requireText(pack, /UAT Evidence Index[\s\S]*P2-17 duplicate payout UAT[\s\S]*P2-18 accounting dashboard UAT[\s\S]*Step109 role permission UAT[\s\S]*TTGDTX audit-log UAT/i, "UAT evidence index");
requireText(pack, /Exception Log[\s\S]*HIGH or BLOCKER exception keeps production NO-GO/i, "exception NO-GO rule");
requireText(pack, /Human Sign-Off[\s\S]*IT_DATA[\s\S]*KHTC[\s\S]*Phap Che[\s\S]*Audit[\s\S]*BGH/i, "human sign-off matrix");
requireText(pack, /PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,\s+production migration is approved, or production GO is approved/i, "PASS_LOCAL local-only boundary");
requireText(
  pack,
  /(?=[\s\S]*Restore Smoke-Check Acceptance Matrix)(?=[\s\S]*data-p003-restore-smoke-check-acceptance-matrix="P0-03")(?=[\s\S]*P0-03-SMOKE-01)(?=[\s\S]*P0-03-SMOKE-06)(?=[\s\S]*Restore target identity)(?=[\s\S]*Core master records readable)(?=[\s\S]*Finance guard behavior preserved)(?=[\s\S]*Role and workspace scope preserved)(?=[\s\S]*Audit trace preserved)(?=[\s\S]*Dashboard source reconciliation preserved)(?=[\s\S]*RESTORE_SMOKE_CHECK_PASS \/ FAIL \/ BLOCKED)(?=[\s\S]*PASS_LOCAL does not prove an actual restore, smoke-check, UAT pass, rollback\s+proof, migration approval or production GO)/i,
  "restore smoke-check acceptance matrix",
);

requireText(
  pack,
  /(?=[\s\S]*data-p003-backup-restore-operator-run-sheet="P0-03")(?=[\s\S]*STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md)(?=[\s\S]*P0-03-RUN-01 through P0-03-RUN-06)(?=[\s\S]*BACKUP_RESTORE_RUN_READY \/ STOP \/ BLOCKED)(?=[\s\S]*execution window)(?=[\s\S]*target identity)(?=[\s\S]*backup evidence)(?=[\s\S]*isolated restore)(?=[\s\S]*postflight owner review)/i,
  "operator run sheet evidence-pack reference",
);

requireText(
  operatorRunSheet,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TEMPLATE)(?=[\s\S]*does not execute backup, restore, migration, rollback, UAT\s+acceptance, owner waiver or production GO)(?=[\s\S]*Do not run production migration from Codex\/chat)(?=[\s\S]*P0-03-RUN-01)(?=[\s\S]*P0-03-RUN-06)(?=[\s\S]*BACKUP_RESTORE_RUN_READY \/ STOP \/ BLOCKED)(?=[\s\S]*Immediate Stop Conditions)(?=[\s\S]*npm\.cmd run audit:ttgdtx-backup-restore-dry-run-pack)(?=[\s\S]*does not prove an actual backup, restore, migration\s+dry-run, rollback proof, UAT pass, owner sign-off or production GO)/i,
  "operator run sheet local-only boundary",
  operatorRunSheetPath,
);

requireText(
  component,
  /(?=[\s\S]*data-supabase-backup-restore-guard="P0-03")(?=[\s\S]*P0-03 Supabase backup\/restore dry-run)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Production remains NO-GO until real backup evidence, restore\s+evidence, migration preflight\/postflight results and owner\s+sign-off exist)(?=[\s\S]*PASS_LOCAL does not mean backup was executed,\s+restore was executed, UAT passed, production migration is\s+approved, or production GO is approved)(?=[\s\S]*Do not run production migration from Codex\/chat)(?=[\s\S]*secrets, passwords, OTPs, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data)(?=[\s\S]*Backup ID \/ snapshot ID)(?=[\s\S]*Restore target project\/ref)(?=[\s\S]*App connection checked against restore target)(?=[\s\S]*Human sign-off)(?=[\s\S]*audit:ttgdtx-backup-restore-dry-run-pack)(?=[\s\S]*audit:ttgdtx-release-gates)(?=[\s\S]*npm\.cmd run build)/i,
  "P0-03 Supabase backup/restore UI guard",
  componentPath,
);
requireText(
  component,
  /(?=[\s\S]*data-p003-backup-restore-evidence-checklist="P0-03")(?=[\s\S]*P0-03 backup\/restore execution evidence checklist)(?=[\s\S]*PASS_LOCAL\s+only)(?=[\s\S]*P0-03-01)(?=[\s\S]*P0-03-06)(?=[\s\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\.md)(?=[\s\S]*Actual backup, restore dry-run, migration preflight\/postflight,\s+data smoke-check, signed UAT and owner GO\/NO-GO evidence are still\s+required)(?=[\s\S]*PASS_LOCAL does not prove backup was executed, restore was executed,\s+migration is safe, UAT passed, rollback is proven or production GO is\s+approved)(?=[\s\S]*secrets, passwords, OTPs, service-role keys,\s+bank credentials, raw student PII, raw CCCD, raw phone numbers or raw\s+payment data)/i,
  "P0-03 backup/restore execution evidence checklist",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*data-p003-backup-restore-operator-run-sheet="P0-03")(?=[\s\S]*P0-03 backup\/restore operator run sheet)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*BACKUP_RESTORE_RUN_READY \/ STOP \/ BLOCKED)(?=[\s\S]*P0-03-RUN-01)(?=[\s\S]*P0-03-RUN-06)(?=[\s\S]*Confirm approved execution window)(?=[\s\S]*Prove production versus restore target identity)(?=[\s\S]*Capture backup evidence before restore)(?=[\s\S]*Apply Step90-Step110 only on restore target)(?=[\s\S]*PASS_LOCAL does not prove an approved execution window, backup,\s+restore, migration dry-run, rollback proof, owner sign-off or\s+production GO)(?=[\s\S]*raw\s+exports, credentials, bank data, vouchers and personal data outside\s+Git\/Codex\/chat)/i,
  "P0-03 backup/restore operator run sheet",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*data-p003-restore-smoke-check-acceptance-matrix="P0-03")(?=[\s\S]*P0-03 restore smoke-check acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*target isolation)(?=[\s\S]*core master readability)(?=[\s\S]*finance guard\s+behavior)(?=[\s\S]*role\/workspace scope)(?=[\s\S]*audit trace)(?=[\s\S]*dashboard source\s+reconciliation)(?=[\s\S]*P0-03-SMOKE-01)(?=[\s\S]*P0-03-SMOKE-06)(?=[\s\S]*RESTORE_SMOKE_CHECK_PASS \/ FAIL \/ BLOCKED)(?=[\s\S]*PASS_LOCAL does not prove an actual restore, smoke-check, UAT pass,\s+rollback proof, migration approval or production GO)(?=[\s\S]*raw exports, credentials, bank data,\s+vouchers and personal data outside Git\/Codex\/chat)/i,
  "P0-03 restore smoke-check acceptance matrix",
  componentPath,
);

requireText(
  page,
  /SupabaseBackupRestoreGuard[\s\S]*<SupabaseBackupRestoreGuard \/>[\s\S]*SupabaseCheck/i,
  "Supabase check page mounts backup/restore guard before SupabaseCheck",
  pagePath,
);

requireText(
  runbook,
  /STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\.md[\s\S]*STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md[\s\S]*Complete the operator run sheet through P0-03-RUN-03/i,
  "evidence pack reference",
  runbookPath,
);

requireText(
  checklist,
  /STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md[\s\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\.md[\s\S]*components\/settings\/supabase-backup-restore-guard\.tsx[\s\S]*backup\/restore operator run sheet/i,
  "production checklist evidence-pack reference",
  checklistPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-backup-restore-dry-run-pack"]) {
  fail("package.json: missing audit:ttgdtx-backup-restore-dry-run-pack script");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (
  !releaseGateAudit.includes(packPath) ||
  !releaseGateAudit.includes(operatorRunSheetPath) ||
  !releaseGateAudit.includes(componentPath) ||
  !releaseGateAudit.includes("audit:ttgdtx-backup-restore-dry-run-pack")
) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing backup/restore evidence pack coverage.");
}

const agents = read("AGENTS.md");
if (!agents.includes(packPath)) {
  fail("AGENTS.md: missing backup/restore evidence pack in required reading.");
}
if (!agents.includes(operatorRunSheetPath)) {
  fail("AGENTS.md: missing backup/restore operator run sheet in required reading.");
}
if (!agents.includes("npm.cmd run audit:ttgdtx-backup-restore-dry-run-pack")) {
  fail("AGENTS.md: missing backup/restore evidence-pack audit in final checks.");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
if (!/P0-03[\s\S]*STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md[\s\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\.md[\s\S]*components\/settings\/supabase-backup-restore-guard\.tsx[\s\S]*backup\/restore operator run sheet[\s\S]*backup\/restore execution evidence checklist[\s\S]*restore smoke-check acceptance matrix[\s\S]*audit:ttgdtx-backup-restore-dry-run-pack/.test(backlog)) {
  fail("Backlog P0-03 must reference the backup/restore evidence pack audit.");
}

if (failures.length > 0) {
  console.error("TTGDTX backup/restore dry-run evidence-pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX backup/restore dry-run evidence-pack audit passed. Template is local-only; production remains NO-GO.");
