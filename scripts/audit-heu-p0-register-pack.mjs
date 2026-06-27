import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
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

function requireText(relativePath, pattern, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  if (!pattern.test(contents)) {
    fail(`${relativePath}: missing ${label}`);
  }
}

const registerFiles = [
  "docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_DATA_MASTER_P0_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_DATA_DICTIONARY_MIN_20260627_V01_DRAFT.md",
  "docs/HEU_SOP_TO_DATA_MAPPING_20260627_V01_DRAFT.md",
  "docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT.md",
];

for (const file of [
  ...registerFiles,
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

for (const file of registerFiles) {
  requireText(file, /Status:\s*DRAFT_CONTROL/i, "DRAFT_CONTROL status");
  requireText(file, /Production status:.*NO-GO/i, "NO-GO production boundary");
}

requireText(
  "docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md",
  /No new level-1 folder is allowed[\s\S]*00_HE_THONG[\s\S]*11_AUDIT_KIEM_SOAT[\s\S]*Folder Registry, File Registry,\s*Version Log, Audit Log and Signoff Register/i,
  "root folder and registry rule",
);

requireText(
  "docs/HEU_DATA_MASTER_P0_REGISTER_20260627_V01_DRAFT.md",
  /Data Master comes before workflow, dashboard, automation and AI[\s\S]*STUDENT_MASTER \/ HOC_SINH_MASTER[\s\S]*REPORT_VIEW_REGISTER[\s\S]*SIGNOFF_REGISTER/i,
  "P0 data master ordering and required masters",
);

requireText(
  "docs/HEU_DATA_DICTIONARY_MIN_20260627_V01_DRAFT.md",
  /AI is never approver[\s\S]*Money is recognized only after HEU receives and reconciles it[\s\S]*Do not commit or paste raw CCCD/i,
  "minimum dictionary control fields and sensitive-data rule",
);

requireText(
  "docs/HEU_SOP_TO_DATA_MAPPING_20260627_V01_DRAFT.md",
  /Event -> Legal Check -> Regulation -> SOP[\s\S]*Report View -> Dashboard -> Audit[\s\S]*CHUA_DU_DIEU_KIEN/i,
  "SOP-to-data gate chain",
);

requireText(
  "docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md",
  /Dashboard -> Report View -> Data Quality Check -> Source Map -> Owner Signoff[\s\S]*RV_TTGDTX_FINANCE_SUMMARY[\s\S]*RV_AI_ALLOWED_CONTEXT/i,
  "report-view source control",
);

requireText(
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  /AI may draft, check, summarize and warn[\s\S]*AI must not\s+approve, pay, post finance records, delete data or mark production GO[\s\S]*Signed UAT proving AI cannot approve, pay, release, delete or go-live/i,
  "AI scope lock",
);

requireText(
  "docs/HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT.md",
  /PASS_LOCAL means local packaging or static audit passed[\s\S]*does not mean:[\s\S]*production ready[\s\S]*owner GO granted[\s\S]*Human signer only/i,
  "risk signoff boundary",
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-p0-register-pack"]) {
  fail("package.json: missing audit:heu-p0-register-pack script");
}

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P0-16[\s\S]*HEU P0 register pack[\s\S]*PASS_LOCAL[\s\S]*HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT\.md[\s\S]*audit:heu-p0-register-pack[\s\S]*does not approve production/i,
  "P0-16 backlog row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /HEU P0 register pack[\s\S]*PASS_LOCAL[\s\S]*HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT\.md[\s\S]*HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT\.md[\s\S]*audit:heu-p0-register-pack[\s\S]*does not approve production/i,
  "production checklist P0 register row",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /npm\.cmd run audit:heu-p0-register-pack[\s\S]*PASS[\s\S]*P0 register pack[\s\S]*root control, data master, dictionary, SOP-to-data, report view, AI scope and risk signoff registers/i,
  "current-state P0 register evidence",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /P0 Register Pack Foundation[\s\S]*HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT\.md[\s\S]*audit:heu-p0-register-pack[\s\S]*This is register packaging only[\s\S]*does not execute UAT, approve migration,\s+approve finance action or mark production GO/i,
  "implementation log entry",
);

requireText(
  "AGENTS.md",
  /HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT\.md[\s\S]*HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT\.md[\s\S]*npm\.cmd run audit:heu-p0-register-pack/i,
  "AGENTS required reading and handoff command",
);

requireText(
  "scripts/audit-ttgdtx-release-gates.mjs",
  /scripts\/audit-heu-p0-register-pack\.mjs[\s\S]*audit:heu-p0-register-pack/i,
  "release-gate required file and script coverage",
);

if (failures.length > 0) {
  console.error("HEU P0 register pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU P0 register pack audit passed. P0 registers are packaged as DRAFT_CONTROL with production NO-GO.");
