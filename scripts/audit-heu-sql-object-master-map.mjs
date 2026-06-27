import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const mapPath = "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md";
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(contents, pattern, label) {
  if (!pattern.test(contents)) {
    fail(`${mapPath}: missing ${label}`);
  }
}

function requireSqlObject(relativePath, objectName) {
  const contents = read(relativePath);
  const pattern = new RegExp(`public\\.${objectName}\\b|\\b${objectName}\\b`, "i");
  if (!pattern.test(contents)) {
    fail(`${relativePath}: expected SQL object ${objectName}`);
  }
}

requireFile(mapPath);
requireFile("docs/HEU_DATA_MODEL_V1.md");
requireFile("docs/HEU_DATA_DICTIONARY_V1.md");
requireFile("docs/modules/TTGDTX_9PLUS_CORE_DATA_DICTIONARY.md");

const map = exists(mapPath) ? read(mapPath) : "";

requireText(map, /P1-04 map existing SQL objects/i, "P1-04 scope");
requireText(map, /NO-GO for schema rename, drop, alter or production migration/i, "no production schema change boundary");
requireText(map, /Do not rename, drop, alter or merge production SQL objects/i, "non-destructive rule");
requireText(map, /Do not run production migration from Codex\/chat/i, "Codex production migration boundary");
requireText(map, /compatibility\s+views, not destructive renames/i, "compatibility view migration path");
requireText(map, /P1-04 is PASS_LOCAL/i, "PASS_LOCAL result");

const canonicalMasters = [
  "STUDENT_MASTER",
  "CLASS_MASTER",
  "PROGRAM_MAJOR_MASTER",
  "COHORT_MASTER",
  "CENTER_TTGDTX_MASTER",
  "PARTNER_MASTER",
  "CONTRACT_MASTER",
  "TUITION_POLICY_MASTER",
  "FEE_ITEM_MASTER",
  "RECEIVABLE_MASTER",
  "PAYMENT_MASTER",
  "STAFF_USER_MASTER",
  "ROLE_PERMISSION_MASTER",
  "AUDIT_LOG",
];

for (const master of canonicalMasters) {
  if (!map.includes(`\`${master}\``)) {
    fail(`${mapPath}: missing canonical master ${master}`);
  }
}

const keyObjects = [
  "leads",
  "short_student_master",
  "ttgdtx_center_master",
  "partners",
  "ttgdtx_partner_contracts",
  "ttgdtx_tuition_policies",
  "ttgdtx_student_receivables",
  "ttgdtx_tuition_payments",
  "ttgdtx_tuition_reconciliation_batches",
  "ttgdtx_partner_payment_requests",
  "ttgdtx_partner_payment_disbursements",
  "ttgdtx_source_documents",
  "ttgdtx_source_control_checks",
  "roles",
  "role_permissions",
  "permission_registry",
  "audit_logs",
  "approval_requests",
  "ttgdtx_accounting_dashboard_summary",
];

for (const objectName of keyObjects) {
  if (!map.includes(objectName)) {
    fail(`${mapPath}: missing current SQL object ${objectName}`);
  }
}

requireSqlObject("database/schema.sql", "leads");
requireSqlObject("database/schema.sql", "audit_logs");
requireSqlObject("database/step62_short_course_data_foundation.sql", "short_student_master");
requireSqlObject("database/step88_ttgdtx_partner_contract_master.sql", "ttgdtx_partner_contracts");
requireSqlObject("database/step89_ttgdtx_tuition_policy.sql", "ttgdtx_tuition_policies");
requireSqlObject("database/step90_ttgdtx_student_receivables.sql", "ttgdtx_student_receivables");
requireSqlObject("database/step96_ttgdtx_tuition_collection_p2_10.sql", "ttgdtx_tuition_payments");
requireSqlObject("database/step101_ttgdtx_reconciliation_p2_13.sql", "ttgdtx_tuition_reconciliation_batches");
requireSqlObject("database/step105_ttgdtx_partner_payment_request_p2_15.sql", "ttgdtx_partner_payment_requests");
requireSqlObject("database/step107_ttgdtx_payment_execution_p2_17.sql", "ttgdtx_partner_payment_disbursements");
requireSqlObject("database/step108_ttgdtx_accounting_dashboard_p2_18.sql", "ttgdtx_accounting_dashboard_summary");
requireSqlObject("database/step50_role_permission_delegation_matrix.sql", "permission_registry");

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-sql-object-master-map"]) {
  fail("package.json: missing audit:heu-sql-object-master-map script");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
if (!/P1-04[\s\S]*PASS_LOCAL[\s\S]*HEU_SQL_OBJECT_MASTER_MAP_20260627\.md[\s\S]*audit:heu-sql-object-master-map/.test(backlog)) {
  fail("Backlog P1-04 must be PASS_LOCAL and reference the SQL object master map audit.");
}

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
if (!/SQL object to master-name map[\s\S]*PASS_LOCAL[\s\S]*HEU_SQL_OBJECT_MASTER_MAP_20260627\.md/.test(checklist)) {
  fail("Production checklist must include SQL object to master-name map PASS_LOCAL evidence.");
}

const agents = read("AGENTS.md");
if (!agents.includes("docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md")) {
  fail("AGENTS.md: missing SQL object master map in required reading.");
}
if (!agents.includes("npm.cmd run audit:heu-sql-object-master-map")) {
  fail("AGENTS.md: missing SQL object master map audit in final handoff checks.");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (!releaseGateAudit.includes(mapPath) || !releaseGateAudit.includes("audit:heu-sql-object-master-map")) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing SQL object master map gate coverage.");
}

if (failures.length > 0) {
  console.error("HEU SQL object master map audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU SQL object master map audit passed. P1-04 is mapped without schema changes.");
