import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packPath = "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";
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

for (const file of [
  packPath,
  checklistPath,
  backlogPath,
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
  "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md",
  "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md",
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  "docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md",
  "docs/HARD_DELETE_AUDIT.md",
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const pack = exists(packPath) ? read(packPath) : "";
const checklist = exists(checklistPath) ? read(checklistPath) : "";
const backlog = exists(backlogPath) ? read(backlogPath) : "";
const agents = exists("AGENTS.md") ? read("AGENTS.md") : "";
const releaseGateAudit = exists("scripts/audit-ttgdtx-release-gates.mjs")
  ? read("scripts/audit-ttgdtx-release-gates.mjs")
  : "";
const packageJson = JSON.parse(read("package.json"));

requireText(pack, /Production Owner Sign-Off Pack/i, "pack title");
requireText(pack, /Status:\s*PASS_LOCAL_PACK/i, "PASS_LOCAL_PACK status");
requireText(pack, /This document does not approve production/i, "non-approval mode");
requireText(pack, /Production remains NO-GO until the required owners review the evidence,[\s\S]*record\s+their decision, and sign the final Go\/No-Go decision/i, "owner sign-off boundary");
requireText(pack, /Codex\/AI output is\s+advisory only/i, "AI advisory boundary");
requireText(pack, /Do not run production migration from Codex\/chat/i, "Codex/chat migration boundary");
requireText(pack, /Do not mark production GO from Codex\/chat/i, "Codex/chat GO boundary");
requireText(pack, /Do not paste secrets, passwords, OTPs, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data/i, "secret and PII boundary");
requireText(pack, /PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,\s+production migration is approved, owner waiver is approved, finance action is\s+approved, or production GO is approved/i, "PASS_LOCAL non-approval boundary");

for (const required of [
  "Production backup and restore dry-run",
  "Step90-Step110 migration order",
  "P0-19 legal/finance gate",
  "P2-17 payout once",
  "P2-18 accounting dashboard",
  "Role and workspace permission",
  "Audit log completeness",
  "Hard-delete/cascade risk",
  "Internal multi-account UAT",
]) {
  requireText(pack, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${required} decision`);
}

for (const owner of ["BGH", "IT_DATA", "KHTC", "PHAP_CHE", "AUDIT", "TRUONG_PHONG"]) {
  requireText(pack, new RegExp(owner), `${owner} owner`);
}

requireText(
  pack,
  /Required Local Preflight[\s\S]*audit:ttgdtx-release-gates[\s\S]*audit:ttgdtx-production-owner-signoff-pack[\s\S]*npm\.cmd run lint[\s\S]*npm\.cmd run build[\s\S]*git status --short --branch/i,
  "required local preflight commands",
);

requireText(
  pack,
  /Stop Conditions[\s\S]*Any required owner decision is unsigned[\s\S]*Backup exists but restore dry-run is missing[\s\S]*P2-17 can pay twice[\s\S]*P2-18 dashboard can write data[\s\S]*Any real password, OTP, service-role key, bank credential, raw student PII/i,
  "stop conditions",
);

requireText(
  pack,
  /Final production recommendation remains NO-GO until every required owner signs\s+GO and no stop condition remains open/i,
  "final NO-GO until all owners sign",
);

requireText(
  checklist,
  /Final owner Go\/No-Go sign-off[\s\S]*IN_PROGRESS[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md[\s\S]*audit:ttgdtx-production-owner-signoff-pack[\s\S]*signed final GO\/NO-GO decision still required/i,
  "production checklist final owner sign-off row",
  checklistPath,
);

requireText(
  backlog,
  /P0-09[\s\S]*Owner Go\/No-Go sign-off pack[\s\S]*PASS_LOCAL[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md[\s\S]*audit:ttgdtx-production-owner-signoff-pack[\s\S]*owner GO\/NO-GO still required/i,
  "backlog P0-09 owner sign-off row",
  backlogPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-production-owner-signoff-pack"]) {
  fail("package.json: missing audit:ttgdtx-production-owner-signoff-pack script");
}

if (!agents.includes(packPath)) {
  fail("AGENTS.md: missing owner sign-off pack in required reading.");
}

if (!agents.includes("npm.cmd run audit:ttgdtx-production-owner-signoff-pack")) {
  fail("AGENTS.md: missing owner sign-off pack audit in final checks.");
}

if (
  !releaseGateAudit.includes(packPath) ||
  !releaseGateAudit.includes("audit:ttgdtx-production-owner-signoff-pack")
) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing owner sign-off pack coverage.");
}

if (failures.length > 0) {
  console.error("TTGDTX production owner sign-off pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "TTGDTX production owner sign-off pack audit passed. Production remains NO-GO until owners sign.",
);
