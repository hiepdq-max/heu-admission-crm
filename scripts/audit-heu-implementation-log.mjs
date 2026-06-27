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

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(contents, pattern, label, file) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

for (const file of [
  "AGENTS.md",
  "package.json",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const agents = read("AGENTS.md");
const packageJson = JSON.parse(read("package.json"));
const log = read("docs/HEU_IMPLEMENTATION_LOG.md");
const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
const inventory = read("docs/HEU_CURRENT_STATE_INVENTORY.md");
const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");

if (!packageJson.scripts?.["audit:heu-implementation-log"]) {
  fail("package.json: missing audit:heu-implementation-log script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:heu-implementation-log/i,
  "implementation-log audit in final handoff checks",
  "AGENTS.md",
);

requireText(
  releaseGateAudit,
  /scripts\/audit-heu-implementation-log\.mjs[\s\S]*audit:heu-implementation-log/i,
  "release-gate coverage for implementation-log audit",
  "scripts/audit-ttgdtx-release-gates.mjs",
);

requireText(
  backlog,
  /P0-05[\s\S]*Record every phase in `HEU_IMPLEMENTATION_LOG\.md`[\s\S]*PASS_LOCAL[\s\S]*docs\/HEU_IMPLEMENTATION_LOG\.md[\s\S]*audit:heu-implementation-log[\s\S]*log before commit[\s\S]*does not approve production/i,
  "P0-05 implementation-log backlog guard",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireText(
  checklist,
  /Implementation log discipline[\s\S]*PASS_LOCAL[\s\S]*docs\/HEU_IMPLEMENTATION_LOG\.md[\s\S]*audit:heu-implementation-log[\s\S]*scope, checks and local-only boundary/i,
  "production checklist implementation-log row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  checklist,
  /P0 controls include implementation-log discipline[\s\S]*P0-14 production evidence binder[\s\S]*P0-15 final\s+handoff coverage[\s\S]*Production remains NO-GO until\s+controlled external evidence and required owner signatures exist/i,
  "P0 Go/No-Go controls include implementation-log and local-only boundary",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  checklist,
  /highest priority blockers[\s\S]*Keep P0-05 implementation log audit green[\s\S]*safe build slice[\s\S]*scope, checks and local-only boundary[\s\S]*before commit/i,
  "priority blocker list includes P0-05 implementation-log guard",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  inventory,
  /npm\.cmd run audit:heu-implementation-log[\s\S]*PASS[\s\S]*Full `audit:\*` suite[\s\S]*P0-05 implementation log audit guard[\s\S]*54 audit scripts passed/i,
  "current-state implementation-log audit evidence",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
);

for (const heading of [
  "P0-14 Evidence Binder Proof Alignment",
  "P0-15 Final Handoff Summary Guard",
  "P5-02 Execution Queue Evidence Closure Alignment",
  "P0-05 Implementation Log Audit Guard",
  "Production Priority Blocker List Alignment",
  "P0 Go No-Go Control Paragraph Alignment",
  "Current State Inventory P0 Control Alignment",
]) {
  requireText(
    log,
    new RegExp(`## 2026-06-27 - ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    `log heading ${heading}`,
    "docs/HEU_IMPLEMENTATION_LOG.md",
  );
}

requireText(
  log,
  /P0-05 Implementation Log Audit Guard[\s\S]*audit:heu-implementation-log[\s\S]*P0-05 backlog[\s\S]*production checklist[\s\S]*current-state\s+inventory[\s\S]*This is governance-log alignment only[\s\S]*does not execute UAT, accept real\s+evidence, approve migration, approve finance action or mark production GO/i,
  "P0-05 log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Production Priority Blocker List Alignment[\s\S]*P0-14 evidence binder[\s\S]*P0-15 final handoff coverage[\s\S]*P0-05\s+implementation-log audit[\s\S]*audit:heu-production-evidence-binder[\s\S]*audit:heu-final-handoff-coverage[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is checklist-priority alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action or mark production GO/i,
  "priority blocker list alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /P0 Go No-Go Control Paragraph Alignment[\s\S]*P0 controls paragraph[\s\S]*implementation-log\s+discipline[\s\S]*P0-14 evidence binder[\s\S]*P0-15 final handoff coverage[\s\S]*Production remains NO-GO until controlled\s+external evidence and required owner signatures exist[\s\S]*audit:heu-production-evidence-binder[\s\S]*audit:heu-final-handoff-coverage[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is P0 control wording alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action or mark production GO/i,
  "P0 Go/No-Go control paragraph alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Current State Inventory P0 Control Alignment[\s\S]*current-state inventory[\s\S]*P0\s+Go\/No-Go control paragraph alignment[\s\S]*audit:heu-current-state-inventory[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is current-state inventory alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action or mark production GO/i,
  "current-state inventory P0 control alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

if (failures.length > 0) {
  console.error("HEU implementation-log audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU implementation-log audit passed. P0-05 log discipline is guarded.");
