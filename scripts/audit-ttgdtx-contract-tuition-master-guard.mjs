import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const guardDocPath = "docs/TTGDTX_CONTRACT_TUITION_MASTER_GUARD_20260627.md";
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

function requireText(contents, pattern, label, file = guardDocPath) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

for (const file of [
  guardDocPath,
  "components/ttgdtx/ttgdtx-contract-tuition-master-guard.tsx",
  "app/ttgdtx/page.tsx",
  "app/ttgdtx/tuition/page.tsx",
  "database/step88_ttgdtx_partner_contract_master.sql",
  "database/step89_ttgdtx_tuition_policy.sql",
  "database/step97_ttgdtx_p0_19_finance_gate_fix.sql",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const guardDoc = exists(guardDocPath) ? read(guardDocPath) : "";
const guardComponent = exists("components/ttgdtx/ttgdtx-contract-tuition-master-guard.tsx")
  ? read("components/ttgdtx/ttgdtx-contract-tuition-master-guard.tsx")
  : "";
const ttgdtxPage = exists("app/ttgdtx/page.tsx") ? read("app/ttgdtx/page.tsx") : "";
const tuitionPage = exists("app/ttgdtx/tuition/page.tsx")
  ? read("app/ttgdtx/tuition/page.tsx")
  : "";
const step88 = exists("database/step88_ttgdtx_partner_contract_master.sql")
  ? read("database/step88_ttgdtx_partner_contract_master.sql")
  : "";
const step89 = exists("database/step89_ttgdtx_tuition_policy.sql")
  ? read("database/step89_ttgdtx_tuition_policy.sql")
  : "";
const step97 = exists("database/step97_ttgdtx_p0_19_finance_gate_fix.sql")
  ? read("database/step97_ttgdtx_p0_19_finance_gate_fix.sql")
  : "";

requireText(
  guardDoc,
  /P2-01 contract must be ACTIVE[\s\S]*ttgdtx_partner_contract_readiness[\s\S]*ttgdtx\.contract\.read/i,
  "P2-01 contract master readiness rule",
);
requireText(
  guardDoc,
  /P2-02 tuition policy must be READY[\s\S]*tuition amount greater than zero[\s\S]*due rule[\s\S]*settlement basis[\s\S]*evidence requirement[\s\S]*ttgdtx_tuition_policy_readiness/i,
  "P2-02 tuition policy readiness rule",
);
requireText(
  guardDoc,
  /P2-03 creates receivable only after:[\s\S]*P2-01 contract is ACTIVE[\s\S]*P2-02 tuition policy is READY[\s\S]*P0-19 legal\/tuition finance gate[\s\S]*P2-05 receivable gate passes/i,
  "P2-03 finance gate boundary",
);
requireText(
  guardDoc,
  /PASS_LOCAL does not approve legal contract, tuition policy, finance\s+action, production migration, UAT acceptance, owner waiver or production GO/i,
  "PASS_LOCAL local-only boundary",
);
requireText(
  guardDoc,
  /Do not paste private contract bodies, raw student PII, CCCD, bank data,\s+passwords, OTPs, service-role keys, production credentials/i,
  "sensitive-data boundary",
);
requireText(guardDoc, /P2-01 and P2-02 are PASS_LOCAL/i, "PASS_LOCAL result");

requireText(
  guardComponent,
  /(?=[\s\S]*data-ttgdtx-contract-tuition-master-guard="P2-01-P2-02")(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2-01 contract must be ACTIVE)(?=[\s\S]*P2-02 tuition policy must be READY)(?=[\s\S]*P0-19 legal\/tuition finance gate)(?=[\s\S]*P2-05)(?=[\s\S]*P2-03 creates receivable only after)(?=[\s\S]*does not approve legal\s+contract, tuition policy, finance action, UAT acceptance, owner waiver\s+or production GO)/i,
  "visible P2-01/P2-02 guard",
  "components/ttgdtx/ttgdtx-contract-tuition-master-guard.tsx",
);

requireText(
  ttgdtxPage,
  /TtgdtxContractTuitionMasterGuard[\s\S]*<TtgdtxContractTuitionMasterGuard \/>/i,
  "P2-01 page guard mount",
  "app/ttgdtx/page.tsx",
);
requireText(
  tuitionPage,
  /TtgdtxContractTuitionMasterGuard[\s\S]*<TtgdtxContractTuitionMasterGuard \/>/i,
  "P2-02 page guard mount",
  "app/ttgdtx/tuition/page.tsx",
);

requireText(
  step88,
  /create or replace view public\.ttgdtx_partner_contract_readiness[\s\S]*contract_status[\s\S]*readiness_status[\s\S]*grant select on public\.ttgdtx_partner_contract_readiness/i,
  "P2-01 readiness view",
  "database/step88_ttgdtx_partner_contract_master.sql",
);
requireText(
  step88,
  /new\.contract_status = 'ACTIVE'[\s\S]*contract_no[\s\S]*signed_on[\s\S]*scope_note[\s\S]*legal_basis[\s\S]*commission_policy_note/i,
  "P2-01 ACTIVE contract required fields",
  "database/step88_ttgdtx_partner_contract_master.sql",
);
requireText(
  step89,
  /create or replace view public\.ttgdtx_tuition_policy_readiness[\s\S]*tuition_amount_vnd[\s\S]*due_rule[\s\S]*settlement_basis[\s\S]*evidence_required[\s\S]*readiness_status/i,
  "P2-02 readiness view",
  "database/step89_ttgdtx_tuition_policy.sql",
);
requireText(
  step89,
  /new\.tuition_amount_vnd <= 0[\s\S]*due_rule[\s\S]*settlement_basis[\s\S]*evidence_required/i,
  "P2-02 ACTIVE policy required fields",
  "database/step89_ttgdtx_tuition_policy.sql",
);
requireText(
  step97,
  /(?=[\s\S]*ttgdtx_tuition_policy_readiness)(?=[\s\S]*readiness_status = 'READY')(?=[\s\S]*contract_status <> 'ACTIVE')(?=[\s\S]*P2-03: Chinh sach hoc phi P2-02 chua READY)/i,
  "P2-03 checks P2-01/P2-02 readiness",
  "database/step97_ttgdtx_p0_19_finance_gate_fix.sql",
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:ttgdtx-contract-tuition-master-guard"]) {
  fail("package.json: missing audit:ttgdtx-contract-tuition-master-guard script");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
requireText(
  backlog,
  /P2-01[\s\S]*Contract\/partner master[\s\S]*PASS_LOCAL[\s\S]*TTGDTX_CONTRACT_TUITION_MASTER_GUARD_20260627\.md[\s\S]*audit:ttgdtx-contract-tuition-master-guard/i,
  "P2-01 PASS_LOCAL backlog row",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);
requireText(
  backlog,
  /P2-02[\s\S]*Tuition policy master[\s\S]*PASS_LOCAL[\s\S]*TTGDTX_CONTRACT_TUITION_MASTER_GUARD_20260627\.md[\s\S]*audit:ttgdtx-contract-tuition-master-guard/i,
  "P2-02 PASS_LOCAL backlog row",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
requireText(
  checklist,
  /P2-01 TTGDTX contract active[\s\S]*PASS_LOCAL[\s\S]*ttgdtx-contract-tuition-master-guard\.tsx[\s\S]*audit:ttgdtx-contract-tuition-master-guard[\s\S]*signed legal\/finance UAT still required/i,
  "P2-01 PASS_LOCAL checklist row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);
requireText(
  checklist,
  /P2-02 tuition policy ready[\s\S]*PASS_LOCAL[\s\S]*ttgdtx-contract-tuition-master-guard\.tsx[\s\S]*audit:ttgdtx-contract-tuition-master-guard[\s\S]*signed KHTC\/Phap Che UAT still required/i,
  "P2-02 PASS_LOCAL checklist row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);
if (/^\| P2-01 TTGDTX contract active \|[^\r\n]*\|\s*DONE\s*\|/im.test(checklist)) {
  fail("Production checklist must not mark P2-01 DONE without signed evidence.");
}
if (/^\| P2-02 tuition policy ready \|[^\r\n]*\|\s*DONE\s*\|/im.test(checklist)) {
  fail("Production checklist must not mark P2-02 DONE without signed evidence.");
}

const agents = read("AGENTS.md");
if (!agents.includes(guardDocPath)) {
  fail("AGENTS.md: missing P2-01/P2-02 guard doc in required reading.");
}
if (!agents.includes("npm.cmd run audit:ttgdtx-contract-tuition-master-guard")) {
  fail("AGENTS.md: missing P2-01/P2-02 guard audit in final handoff checks.");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (
  !releaseGateAudit.includes(guardDocPath) ||
  !releaseGateAudit.includes("audit:ttgdtx-contract-tuition-master-guard")
) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing P2-01/P2-02 gate coverage.");
}

if (failures.length > 0) {
  console.error("TTGDTX contract/tuition master guard audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX contract/tuition master guard audit passed. P2-01/P2-02 are PASS_LOCAL and finance-gated.");
