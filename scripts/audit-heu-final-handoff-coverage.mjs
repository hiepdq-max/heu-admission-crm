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
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const packageJson = JSON.parse(read("package.json"));
const agents = existsSync(path.join(repoRoot, "AGENTS.md")) ? read("AGENTS.md") : "";
const backlog = existsSync(path.join(repoRoot, "docs/HEU_SYSTEM_BUILD_BACKLOG.md"))
  ? read("docs/HEU_SYSTEM_BUILD_BACKLOG.md")
  : "";
const checklist = existsSync(
  path.join(repoRoot, "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md"),
)
  ? read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md")
  : "";
const inventory = existsSync(path.join(repoRoot, "docs/HEU_CURRENT_STATE_INVENTORY.md"))
  ? read("docs/HEU_CURRENT_STATE_INVENTORY.md")
  : "";
const releaseGateAudit = existsSync(
  path.join(repoRoot, "scripts/audit-ttgdtx-release-gates.mjs"),
)
  ? read("scripts/audit-ttgdtx-release-gates.mjs")
  : "";

const auditScripts = Object.keys(packageJson.scripts ?? {})
  .filter((script) => script.startsWith("audit:"))
  .sort();

if (!packageJson.scripts?.["audit:heu-final-handoff-coverage"]) {
  fail("package.json: missing audit:heu-final-handoff-coverage script");
}

requireText(
  agents,
  /Before any final handoff/i,
  "final handoff section",
  "AGENTS.md",
);

for (const script of auditScripts) {
  const handoffCommand = `npm.cmd run ${script}`;
  if (!agents.includes(handoffCommand)) {
    fail(`AGENTS.md: missing final handoff command ${handoffCommand}`);
  }

  if (!releaseGateAudit.includes(`"${script}"`)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing requiredScripts entry ${script}`);
  }
}

requireText(
  releaseGateAudit,
  /scripts\/audit-heu-final-handoff-coverage\.mjs[\s\S]*audit:heu-final-handoff-coverage/i,
  "release-gate coverage for final handoff audit",
  "scripts/audit-ttgdtx-release-gates.mjs",
);

requireText(
  backlog,
  /P0-15[\s\S]*Final handoff audit coverage[\s\S]*PASS_LOCAL[\s\S]*audit:heu-final-handoff-coverage/i,
  "P0-15 final handoff coverage backlog row",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireText(
  checklist,
  /Final handoff audit coverage[\s\S]*PASS_LOCAL[\s\S]*audit:heu-final-handoff-coverage/i,
  "production checklist final handoff coverage row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  inventory,
  /npm\.cmd run audit:heu-final-handoff-coverage[\s\S]*PASS/i,
  "current-state final handoff coverage audit evidence",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
);

if (failures.length > 0) {
  console.error("HEU final handoff coverage audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `HEU final handoff coverage audit passed. ${auditScripts.length} audit scripts are listed in AGENTS.md and release gates.`,
);
