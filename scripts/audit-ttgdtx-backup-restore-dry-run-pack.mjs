import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packPath = "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md";
const runbookPath = "docs/STEP90_STEP110_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md";
const operatorRunSheetPath =
  "docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const realOps01ProofIntakePath =
  "docs/HEU_REAL_OPS_01_BACKUP_RESTORE_PROOF_INTAKE_20260702.md";
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
  realOps01ProofIntakePath,
  componentPath,
  pagePath,
  "docs/MIGRATION_ORDER_AUDIT.md",
  "docs/HARD_DELETE_AUDIT.md",
  "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
  "docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md",
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
const realOps01ProofIntake = exists(realOps01ProofIntakePath)
  ? read(realOps01ProofIntakePath)
  : "";
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
requireText(pack, /Do not paste secrets, passwords, temporary passwords, OTPs, password reset\s+links, account activation\/invite links, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data/i, "secret and PII boundary");
requireText(pack, /Backup Evidence Record[\s\S]*Backup ID \/ snapshot ID[\s\S]*Backup operator[\s\S]*Backup checker[\s\S]*Backup result/i, "backup evidence fields");
requireText(pack, /Restore Evidence Record[\s\S]*Restore target project\/ref[\s\S]*App connection checked against restore target[\s\S]*Restore result/i, "restore evidence fields");
requireText(pack, /Static Preflight And Postflight Evidence[\s\S]*audit:ttgdtx-release-gates[\s\S]*audit:ttgdtx-backup-restore-dry-run-pack[\s\S]*npm\.cmd run build/i, "preflight and postflight command set");
requireText(pack, /Migration Execution Record[\s\S]*Step90[\s\S]*Step110/i, "Step90 through Step110 migration record");
requireText(pack, /Data Smoke-Check Evidence[\s\S]*Receivable duplicate guard[\s\S]*P0-19 legal\/finance gate blocks unresolved basis before receivable creation[\s\S]*P3 handover cannot bypass P0-19\/P2-05\/P2-03 finance gates[\s\S]*Payout cannot exceed approved amount[\s\S]*Dashboard views are read-only and role-scoped[\s\S]*P0-17 access closure states remain ACCESS_RETAIN, REVOKE_OR_REDUCE or BLOCKED after restore/i, "data smoke-check coverage");
requireText(pack, /UAT Evidence Index[\s\S]*P0-19 legal\/finance gate UAT[\s\S]*P3-01\/P3-02 lead lifecycle and handover UAT[\s\S]*P2-17 duplicate payout UAT[\s\S]*P2-18 accounting dashboard UAT[\s\S]*Step109 role permission UAT[\s\S]*P0-17 access closure review[\s\S]*TTGDTX audit-log UAT/i, "UAT evidence index");
requireText(pack, /Exception Log[\s\S]*HIGH or BLOCKER exception keeps production NO-GO/i, "exception NO-GO rule");
requireText(pack, /Human Sign-Off[\s\S]*IT_DATA[\s\S]*KHTC[\s\S]*Phap Che[\s\S]*Audit[\s\S]*BGH/i, "human sign-off matrix");
requireText(pack, /PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,\s+production migration is approved, or production GO is approved/i, "PASS_LOCAL local-only boundary");
requireText(
  pack,
  /(?=[\s\S]*P0-03 External Evidence Manifest)(?=[\s\S]*P0-03-EVID-01)(?=[\s\S]*P0-03-EVID-06)(?=[\s\S]*Backup reference)(?=[\s\S]*Restore target reference)(?=[\s\S]*Preflight\/postflight command reference)(?=[\s\S]*Migration dry-run step reference)(?=[\s\S]*Smoke-check and UAT reference)(?=[\s\S]*Final sign-off reference)(?=[\s\S]*EVIDENCE_INDEX_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Missing evidence ID, uncontrolled storage, raw sensitive attachment or unsigned\s+owner decision keeps production NO-GO)/i,
  "external evidence manifest",
);
requireText(
  pack,
  /(?=[\s\S]*Restore Smoke-Check Acceptance Matrix)(?=[\s\S]*data-p003-restore-smoke-check-acceptance-matrix="P0-03")(?=[\s\S]*P0-03-SMOKE-01)(?=[\s\S]*P0-03-SMOKE-07)(?=[\s\S]*Restore target identity)(?=[\s\S]*Core master records readable)(?=[\s\S]*Finance guard behavior preserved)(?=[\s\S]*Role and workspace scope preserved)(?=[\s\S]*P0-17 access closure states)(?=[\s\S]*ACCESS_RETAIN)(?=[\s\S]*REVOKE_OR_REDUCE)(?=[\s\S]*BLOCKED)(?=[\s\S]*soft-revoked\/INACTIVE user regains access)(?=[\s\S]*Audit trace preserved)(?=[\s\S]*Dashboard source reconciliation preserved)(?=[\s\S]*Lead handover finance gate preserved)(?=[\s\S]*P0-19\/P2-05\/P2-03)(?=[\s\S]*RESTORE_SMOKE_CHECK_PASS \/ FAIL \/ BLOCKED)(?=[\s\S]*PASS_LOCAL does not prove an actual restore, smoke-check, UAT pass, rollback\s+proof, migration approval or production GO)/i,
  "restore smoke-check acceptance matrix",
);

requireText(
  pack,
  /(?=[\s\S]*P0-03 Backup\/Restore Closure Decision Manifest)(?=[\s\S]*data-p003-backup-restore-closure-decision-manifest="P0-03")(?=[\s\S]*P0-03-CLOSE-01)(?=[\s\S]*P0-03-CLOSE-06)(?=[\s\S]*Execution authority and target isolation confirmed)(?=[\s\S]*Backup and restore proof accepted)(?=[\s\S]*Preflight and postflight checks pass)(?=[\s\S]*Smoke-check and UAT index accepted)(?=[\s\S]*P0-19 gate UAT)(?=[\s\S]*P3-01\/P3-02 lifecycle and handover UAT)(?=[\s\S]*P0-17 access closure decision)(?=[\s\S]*P0-17 access closure evidence)(?=[\s\S]*Exceptions and waivers controlled)(?=[\s\S]*Human closure decision recorded)(?=[\s\S]*P0_03_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*PASS_LOCAL keeps P0-03 at evidence-structure readiness only)/i,
  "backup/restore closure decision manifest",
);
requireText(
  pack,
  /(?=[\s\S]*REAL-OPS-01 Backup\/Restore Proof Intake)(?=[\s\S]*data-p003-real-ops-01-proof-intake="REAL-OPS-01_P0-03")(?=[\s\S]*HEU_REAL_OPS_01_BACKUP_RESTORE_PROOF_INTAKE_20260702\.md)(?=[\s\S]*REAL_OPS_01_PROOF_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*REAL-OPS-01-IN-01)(?=[\s\S]*REAL-OPS-01-IN-05)(?=[\s\S]*Controlled evidence ID recorded)(?=[\s\S]*Backup reference accepted)(?=[\s\S]*Restore target proof accepted)(?=[\s\S]*Smoke-check result accepted)(?=[\s\S]*Closure owner decision prepared)(?=[\s\S]*P0-19, P3 gate preservation, P2-18\/P5-03 source reconciliation, P6-04 scope and P0-17 access closure state)(?=[\s\S]*PASS_LOCAL proves only that REAL-OPS-01 proof intake is structured)(?=[\s\S]*Owner\s+evidence acceptance, backup execution, restore execution, migration-order review\s+and production GO remain outside this evidence pack and outside Codex\/chat)/i,
  "REAL-OPS-01 backup/restore proof intake evidence-pack reference",
);

requireText(
  realOps01ProofIntake,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_PROOF_INTAKE)(?=[\s\S]*REAL_OPS_01_PROOF_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does\s+not execute backup, execute restore, accept evidence, approve migration,\s+approve UAT, approve finance reliance, approve legal position or mark\s+production GO)(?=[\s\S]*backup dumps, restore exports, connection strings, database URLs,\s+service-role keys, credentials, passwords, temporary passwords, OTPs,\s+password reset links, account activation\/invite links, raw PII, CCCD, bank\s+data, bank statements, vouchers and raw payment evidence outside\s+Git\/Codex\/chat)(?=[\s\S]*REAL-OPS-01-IN-01)(?=[\s\S]*REAL-OPS-01-IN-05)(?=[\s\S]*Controlled evidence ID recorded)(?=[\s\S]*Backup reference accepted)(?=[\s\S]*Restore target proof accepted)(?=[\s\S]*Smoke-check result accepted)(?=[\s\S]*Closure owner decision prepared)(?=[\s\S]*data-p003-real-ops-01-proof-intake="REAL-OPS-01_P0-03")(?=[\s\S]*Passing local checks means only the proof-intake structure exists and is\s+audited)/i,
  "REAL-OPS-01 proof intake source document",
  realOps01ProofIntakePath,
);

requireText(
  pack,
  /(?=[\s\S]*data-p003-backup-restore-operator-run-sheet="P0-03")(?=[\s\S]*STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md)(?=[\s\S]*P0-03-RUN-01 through P0-03-RUN-06)(?=[\s\S]*BACKUP_RESTORE_RUN_READY \/ STOP \/ BLOCKED)(?=[\s\S]*execution window)(?=[\s\S]*target identity)(?=[\s\S]*backup evidence)(?=[\s\S]*isolated restore)(?=[\s\S]*postflight owner review)/i,
  "operator run sheet evidence-pack reference",
);

requireText(
  pack,
  /(?=[\s\S]*P0-03 Target Identity Lock)(?=[\s\S]*data-p003-backup-restore-target-identity-lock="P0-03")(?=[\s\S]*P0-03-TARGET-01)(?=[\s\S]*P0-03-TARGET-06)(?=[\s\S]*Execution authority recorded)(?=[\s\S]*Production source is source-only)(?=[\s\S]*Restore target is isolated)(?=[\s\S]*App banner points to restore target)(?=[\s\S]*SQL editor and CLI profile locked)(?=[\s\S]*Controlled evidence folder confirmed)(?=[\s\S]*TARGET_LOCK_READY \/ STOP \/ BLOCKED)(?=[\s\S]*PASS_LOCAL proves only that the target-lock checklist exists)/i,
  "target identity lock evidence-pack reference",
);

requireText(
  operatorRunSheet,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TEMPLATE)(?=[\s\S]*does not execute backup, restore, migration, rollback, UAT\s+acceptance, owner waiver or production GO)(?=[\s\S]*Do not run production migration from Codex\/chat)(?=[\s\S]*Do not paste secrets, passwords, temporary passwords, OTPs, password reset\s+links, account activation\/invite links, service-role keys, bank credentials)(?=[\s\S]*P0-03-RUN-01)(?=[\s\S]*P0-03-RUN-06)(?=[\s\S]*BACKUP_RESTORE_RUN_READY \/ STOP \/ BLOCKED)(?=[\s\S]*Immediate Stop Conditions)(?=[\s\S]*npm\.cmd run audit:ttgdtx-backup-restore-dry-run-pack)(?=[\s\S]*does not prove an actual backup, restore, migration\s+dry-run, rollback proof, UAT pass, owner sign-off or production GO)/i,
  "operator run sheet local-only boundary",
  operatorRunSheetPath,
);
requireText(
  operatorRunSheet,
  /(?=[\s\S]*Target Identity Lock)(?=[\s\S]*TARGET_LOCK_READY \/ STOP \/ BLOCKED)(?=[\s\S]*P0-03-TARGET-01)(?=[\s\S]*P0-03-TARGET-06)(?=[\s\S]*Mark production as source-only)(?=[\s\S]*Prove restore target isolation)(?=[\s\S]*Prove app banner points to restore target)(?=[\s\S]*Lock SQL editor and CLI profile)(?=[\s\S]*Confirm controlled evidence folder)/i,
  "operator run sheet target identity lock",
  operatorRunSheetPath,
);

requireText(
  component,
  /(?=[\s\S]*data-supabase-backup-restore-guard="P0-03")(?=[\s\S]*P0-03 Supabase backup\/restore dry-run)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Production remains NO-GO until real backup evidence, restore\s+evidence, migration preflight\/postflight results and owner\s+sign-off exist)(?=[\s\S]*PASS_LOCAL does not mean backup was executed,\s+restore was executed, UAT passed, production migration is\s+approved, or production GO is approved)(?=[\s\S]*Do not run production migration from Codex\/chat)(?=[\s\S]*secrets, passwords, temporary passwords, OTPs, password reset\s+links, account activation\/invite links, service-role keys, bank\s+credentials, raw student PII, raw CCCD, raw phone numbers or raw\s+payment data)(?=[\s\S]*data-p003-backup-restore-immediate-stop="P0-03")(?=[\s\S]*P0-03 immediate operator stop conditions)(?=[\s\S]*P0_03_STOP_CHECK \/ GO_NEXT \/ BLOCKED)(?=[\s\S]*Target identity unclear)(?=[\s\S]*Backup or restore proof incomplete)(?=[\s\S]*Secret or raw evidence exposure)(?=[\s\S]*temporary passwords)(?=[\s\S]*account activation\/invite links)(?=[\s\S]*Backup ID \/ snapshot ID)(?=[\s\S]*Restore target project\/ref)(?=[\s\S]*App connection checked against restore target)(?=[\s\S]*Human sign-off)(?=[\s\S]*audit:ttgdtx-backup-restore-dry-run-pack)(?=[\s\S]*audit:ttgdtx-migration-order-guard)(?=[\s\S]*audit:ttgdtx-release-gates)(?=[\s\S]*npm\.cmd run lint)(?=[\s\S]*npm\.cmd run build)/i,
  "P0-03 Supabase backup/restore UI guard",
  componentPath,
);
requireText(
  component,
  /(?=[\s\S]*data-p003-backup-restore-target-identity-lock="P0-03")(?=[\s\S]*P0-03 backup\/restore target identity lock)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0-03-TARGET-01)(?=[\s\S]*P0-03-TARGET-06)(?=[\s\S]*TARGET_LOCK_READY \/ STOP \/ BLOCKED)(?=[\s\S]*Execution authority recorded)(?=[\s\S]*Production source is source-only)(?=[\s\S]*Restore target is isolated)(?=[\s\S]*App banner points to restore target)(?=[\s\S]*SQL editor and CLI profile locked)(?=[\s\S]*Controlled evidence folder confirmed)(?=[\s\S]*PASS_LOCAL proves only that the target-lock checklist exists)/i,
  "P0-03 backup/restore target identity lock",
  componentPath,
);
requireText(
  component,
  /(?=[\s\S]*realOps01ProofIntakeItems)(?=[\s\S]*data-p003-real-ops-01-proof-intake="REAL-OPS-01_P0-03")(?=[\s\S]*REAL-OPS-01 backup\/restore proof intake)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*REAL_OPS_01_PROOF_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*REAL-OPS-01-IN-01)(?=[\s\S]*REAL-OPS-01-IN-05)(?=[\s\S]*Controlled evidence ID recorded)(?=[\s\S]*Backup reference accepted)(?=[\s\S]*Restore target proof accepted)(?=[\s\S]*Smoke-check result accepted)(?=[\s\S]*Closure owner decision prepared)(?=[\s\S]*P0-19, P3 gate preservation, P2-18\/P5-03 source reconciliation, P6-04 scope and P0-17 access closure state)(?=[\s\S]*PASS_LOCAL proves only that REAL-OPS-01 proof intake is structured)(?=[\s\S]*Owner\s+evidence acceptance, backup execution, restore execution,\s+migration-order review and production GO remain outside this app\s+screen and outside Codex\/chat)/i,
  "REAL-OPS-01 backup/restore proof intake UI guard",
  componentPath,
);
requireText(
  component,
  /(?=[\s\S]*data-p003-backup-restore-evidence-checklist="P0-03")(?=[\s\S]*P0-03 backup\/restore execution evidence checklist)(?=[\s\S]*PASS_LOCAL\s+only)(?=[\s\S]*P0-03-01)(?=[\s\S]*P0-03-06)(?=[\s\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\.md)(?=[\s\S]*Actual backup, restore dry-run, migration preflight\/postflight,\s+data smoke-check, signed UAT and owner GO\/NO-GO evidence are still\s+required)(?=[\s\S]*PASS_LOCAL does not prove backup was executed, restore was executed,\s+migration is safe, UAT passed, rollback is proven or production GO is\s+approved)(?=[\s\S]*secrets, passwords, temporary passwords, OTPs,\s+password reset links, account activation\/invite links, service-role\s+keys, bank credentials, raw student PII, raw CCCD, raw phone numbers\s+or raw payment data)/i,
  "P0-03 backup/restore execution evidence checklist",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*data-p003-backup-restore-evidence-manifest="P0-03")(?=[\s\S]*P0-03 backup\/restore external evidence manifest)(?=[\s\S]*PASS_LOCAL\s+only)(?=[\s\S]*P0-03-EVID-01)(?=[\s\S]*P0-03-EVID-06)(?=[\s\S]*EVIDENCE_INDEX_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Backup reference)(?=[\s\S]*Restore target reference)(?=[\s\S]*Preflight\/postflight command reference)(?=[\s\S]*Migration dry-run step reference)(?=[\s\S]*Smoke-check and UAT reference)(?=[\s\S]*Final sign-off reference)(?=[\s\S]*PASS_LOCAL only means the manifest structure exists)(?=[\s\S]*Missing evidence\s+ID, uncontrolled storage, raw sensitive attachment or unsigned owner\s+decision keeps production NO-GO)/i,
  "P0-03 backup/restore external evidence manifest",
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
  /(?=[\s\S]*data-p003-restore-smoke-check-acceptance-matrix="P0-03")(?=[\s\S]*P0-03 restore smoke-check acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*target isolation)(?=[\s\S]*core master readability)(?=[\s\S]*finance guard\s+behavior)(?=[\s\S]*role\/workspace scope)(?=[\s\S]*P0-17 access closure states)(?=[\s\S]*ACCESS_RETAIN)(?=[\s\S]*REVOKE_OR_REDUCE)(?=[\s\S]*BLOCKED)(?=[\s\S]*soft-revoked\/INACTIVE user regains access)(?=[\s\S]*audit trace)(?=[\s\S]*dashboard source\s+reconciliation)(?=[\s\S]*Lead handover finance gate preserved)(?=[\s\S]*P0-19\/P2-05\/P2-03)(?=[\s\S]*P0-03-SMOKE-01)(?=[\s\S]*P0-03-SMOKE-07)(?=[\s\S]*RESTORE_SMOKE_CHECK_PASS \/ FAIL \/ BLOCKED)(?=[\s\S]*PASS_LOCAL does not prove an actual restore, smoke-check, UAT pass,\s+rollback proof, migration approval or production GO)(?=[\s\S]*raw exports, credentials, bank data,\s+vouchers and personal data outside Git\/Codex\/chat)/i,
  "P0-03 restore smoke-check acceptance matrix",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*data-p003-backup-restore-closure-decision-manifest="P0-03")(?=[\s\S]*P0-03 backup\/restore closure decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0_03_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-03-CLOSE-01)(?=[\s\S]*P0-03-CLOSE-06)(?=[\s\S]*Execution authority and target isolation confirmed)(?=[\s\S]*Backup and restore proof accepted)(?=[\s\S]*Preflight and postflight checks pass)(?=[\s\S]*Smoke-check and UAT index accepted)(?=[\s\S]*P0-19 gate UAT)(?=[\s\S]*P3-01\/P3-02 lifecycle and handover UAT)(?=[\s\S]*P0-17 access closure decision)(?=[\s\S]*P0-17 access closure evidence)(?=[\s\S]*Exceptions and waivers controlled)(?=[\s\S]*Human closure decision recorded)(?=[\s\S]*PASS_LOCAL keeps P0-03 at evidence-structure readiness only)/i,
  "P0-03 backup/restore closure decision manifest",
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
  /STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md[\s\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\.md[\s\S]*components\/settings\/supabase-backup-restore-guard\.tsx[\s\S]*backup\/restore target identity lock[\s\S]*backup\/restore operator run sheet[\s\S]*backup\/restore execution evidence checklist[\s\S]*external evidence manifest[\s\S]*restore smoke-check acceptance matrix[\s\S]*P0-17 access closure state preservation[\s\S]*backup\/restore closure decision manifest/i,
  "production checklist evidence-pack reference",
  checklistPath,
);
requireText(
  checklist,
  /Supabase backup before production migration[\s\S]*HEU_REAL_OPS_01_BACKUP_RESTORE_PROOF_INTAKE_20260702\.md[\s\S]*REAL-OPS-01 proof intake[\s\S]*REAL_OPS_01_PROOF_READY \/ NO_GO \/ BLOCKED[\s\S]*controlled evidence outside Git when sensitive/i,
  "production checklist REAL-OPS-01 proof intake reference",
  checklistPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-backup-restore-dry-run-pack"]) {
  fail("package.json: missing audit:ttgdtx-backup-restore-dry-run-pack script");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (
  !releaseGateAudit.includes(packPath) ||
  !releaseGateAudit.includes(realOps01ProofIntakePath) ||
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
if (!/P0-03[\s\S]*STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md[\s\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\.md[\s\S]*components\/settings\/supabase-backup-restore-guard\.tsx[\s\S]*backup\/restore target identity lock[\s\S]*backup\/restore operator run sheet[\s\S]*backup\/restore execution evidence checklist[\s\S]*external evidence manifest[\s\S]*restore smoke-check acceptance matrix[\s\S]*P0-17 access closure state preservation[\s\S]*backup\/restore closure decision manifest[\s\S]*audit:ttgdtx-backup-restore-dry-run-pack/.test(backlog)) {
  fail("Backlog P0-03 must reference the backup/restore evidence pack audit.");
}
if (!/P0-03[\s\S]*HEU_REAL_OPS_01_BACKUP_RESTORE_PROOF_INTAKE_20260702\.md[\s\S]*REAL-OPS-01 proof intake[\s\S]*REAL_OPS_01_PROOF_READY \/ NO_GO \/ BLOCKED[\s\S]*actual backup\/restore evidence still required before production/i.test(backlog)) {
  fail("Backlog P0-03 must reference the REAL-OPS-01 proof intake boundary.");
}

if (failures.length > 0) {
  console.error("TTGDTX backup/restore dry-run evidence-pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX backup/restore dry-run evidence-pack audit passed. Template is local-only; production remains NO-GO.");
