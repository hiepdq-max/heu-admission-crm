import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

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

const guardDoc = "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md";
const requiredFiles = [
  guardDoc,
  "docs/MIGRATION_ORDER_AUDIT.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/STEP90_STEP110_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:ttgdtx-migration-order-guard"]) {
  fail("package.json: missing npm script audit:ttgdtx-migration-order-guard");
}

requireText(guardDoc, /Production remains NO-GO/i, "production NO-GO boundary");
requireText(
  guardDoc,
  /Do not run production migration from Codex\/chat/i,
  "Codex/chat production migration boundary",
);
requireText(
  guardDoc,
  /PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,\s+production migration is approved, or production GO is approved/i,
  "PASS_LOCAL local-only boundary",
);
requireText(
  guardDoc,
  /IT_DATA, KHTC and PHAP_CHE sign\s+the migration order, waiver decisions and rollback plan/i,
  "signed owner approval requirement",
);
requireText(
  guardDoc,
  /Step97[\s\S]*P0-19 status mismatch exists/i,
  "Step97 conditional rule",
);
requireText(
  guardDoc,
  /Step100[\s\S]*formally approved as pilot\s+waiver/i,
  "Step100 formal pilot waiver rule",
);
requireText(
  guardDoc,
  /(?=[\s\S]*Backup\/Restore Evidence Acceptance Lock)(?=[\s\S]*MIG-LOCK-01)(?=[\s\S]*MIG-LOCK-06)(?=[\s\S]*P0-03 target identity lock accepted)(?=[\s\S]*Backup and restore proof accepted)(?=[\s\S]*Preflight and postflight checks accepted)(?=[\s\S]*Restore smoke-check accepted)(?=[\s\S]*Rollback point and exception decision accepted)(?=[\s\S]*Required owners accept evidence before signing)(?=[\s\S]*MIGRATION_EVIDENCE_ACCEPTED \/ NO_GO \/ BLOCKED)(?=[\s\S]*PASS_LOCAL proves only that this acceptance-lock structure exists)/i,
  "backup/restore evidence acceptance lock",
);
requireText(
  guardDoc,
  /(?=[\s\S]*Step Decision Manifest)(?=[\s\S]*MIG-DEC-01)(?=[\s\S]*MIG-DEC-06)(?=[\s\S]*Step90-Step96)(?=[\s\S]*Step97)(?=[\s\S]*Step100)(?=[\s\S]*Step101-Step108)(?=[\s\S]*Step109)(?=[\s\S]*Step110)(?=[\s\S]*MIGRATION_ORDER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Any missing decision ID, unsigned waiver, missing rollback note, raw sensitive\s+evidence or unclear production target keeps the migration order NO-GO)/i,
  "Step90-Step110 decision manifest",
);
requireText(
  guardDoc,
  /raw student PII[\s\S]*raw payment data/i,
  "no raw sensitive data rule",
);
requireText(
  guardDoc,
  /Do not paste secrets, passwords, temporary passwords, OTPs, password reset\s+links, account activation\/invite links, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data/i,
  "account secret and sensitive-data boundary",
);
requireText(
  guardDoc,
  /npm\.cmd run audit:ttgdtx-migration-order-guard/i,
  "local guard command",
);

requireText(
  "docs/MIGRATION_ORDER_AUDIT.md",
  /step90_ttgdtx_student_receivables\.sql[\s\S]*step110_ttgdtx_real_data_evidence_metadata_p2_19\.sql/i,
  "Step90 through Step110 ordered inventory",
);
requireText(
  "docs/MIGRATION_ORDER_AUDIT.md",
  /Local Sign-Off Guard Evidence[\s\S]*STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627\.md[\s\S]*audit:ttgdtx-migration-order-guard/i,
  "local sign-off guard evidence section",
);
requireText(
  "docs/MIGRATION_ORDER_AUDIT.md",
  /step97_ttgdtx_p0_19_finance_gate_fix\.sql only if P0-19 status mismatch exists/i,
  "Step97 conditional order note",
);
requireText(
  "docs/MIGRATION_ORDER_AUDIT.md",
  /step100_ttgdtx_pilot_open_p2_01_p2_02_p0_19\.sql only if formally approved as pilot waiver/i,
  "Step100 waiver order note",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Approve Step90-Step110 migration order[\s\S]*IN_PROGRESS[\s\S]*STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627\.md[\s\S]*Migration Evidence Acceptance Lock[\s\S]*MIG-LOCK-01 through MIG-LOCK-06[\s\S]*Step Decision Manifest[\s\S]*MIG-DEC-01 through MIG-DEC-06[\s\S]*audit:ttgdtx-migration-order-guard[\s\S]*signed approval/i,
  "migration order checklist row remains signed-approval gated",
);
requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P0-03[\s\S]*STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627\.md[\s\S]*migration evidence acceptance lock[\s\S]*MIG-LOCK-01 through MIG-LOCK-06[\s\S]*audit:ttgdtx-migration-order-guard[\s\S]*actual backup\/restore evidence still required/i,
  "P0-03 backlog guard evidence",
);
requireText(
  "docs/STEP90_STEP110_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  /Do not run production migration from Codex\/chat/i,
  "runbook Codex/chat migration boundary",
);
requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  /PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,\s+production migration is approved, or production GO is approved/i,
  "backup/restore local-only boundary",
);
requireText(
  "AGENTS.md",
  /STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627\.md/i,
  "AGENTS required reading includes migration-order guard",
);
requireText(
  "AGENTS.md",
  /audit:ttgdtx-migration-order-guard/i,
  "AGENTS final handoff includes migration-order guard audit",
);
requireText(
  "scripts/audit-ttgdtx-release-gates.mjs",
  /STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627\.md[\s\S]*audit-ttgdtx-migration-order-guard\.mjs[\s\S]*audit:ttgdtx-migration-order-guard/i,
  "release-gate includes migration-order guard",
);

if (failures.length > 0) {
  console.error("TTGDTX migration-order guard audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `TTGDTX migration-order guard audit passed. Checked ${requiredFiles.length} files.`,
);
