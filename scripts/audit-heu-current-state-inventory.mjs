import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const inventoryPath = "docs/HEU_CURRENT_STATE_INVENTORY.md";
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

function requireText(contents, pattern, label, file = inventoryPath) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

for (const file of [
  inventoryPath,
  "docs/GIT_CLEANUP_ANALYSIS.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "AGENTS.md",
  "package.json",
]) {
  requireFile(file);
}

const inventory = existsSync(path.join(repoRoot, inventoryPath))
  ? read(inventoryPath)
  : "";
const agents = existsSync(path.join(repoRoot, "AGENTS.md")) ? read("AGENTS.md") : "";

requireText(inventory, /Date:\s*2026-06-27/i, "current inventory date");
requireText(
  inventory,
  /Git state:\s*clean local worktree at last verified handoff; exact ahead count and\s+current commit are live Git state/i,
  "live Git state boundary",
);
requireText(
  inventory,
  /Conclusion:\s*Stage D - internal controlled test only\. Production remains NO-GO/i,
  "Stage D NO-GO conclusion",
);
requireText(
  inventory,
  /npm\.cmd run audit:ttgdtx-release-gates[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-git-hygiene[\s\S]*PASS[\s\S]*Full `audit:\*` suite[\s\S]*PASS/i,
  "current audit evidence",
);
requireText(
  inventory,
  /P7-01\/P7-02\/P7-03 are PASS_LOCAL; autonomous AI remains locked/i,
  "AI remains advisory-only",
);
requireText(
  inventory,
  /Current stage:\s*Stage D - internal controlled test only[\s\S]*Production is still NO-GO because:[\s\S]*No real production backup\/restore dry-run evidence[\s\S]*Step90-Step110 production migration order is not signed[\s\S]*Final BGH\/IT_DATA\/KHTC\/PHAP_CHE\/Audit\/owner GO\/NO-GO is not signed/i,
  "production NO-GO blocker list",
);
requireText(
  inventory,
  /Do not paste|Raw PII, bank data, passwords, keys and vouchers must stay outside Git\/Codex\/chat/i,
  "sensitive-data boundary",
);

if (/Git state:\s*dirty/i.test(inventory)) {
  fail(`${inventoryPath}: must not say the current Git state is dirty.`);
}
if (/Latest known commit:\s*9d54348/i.test(inventory)) {
  fail(`${inventoryPath}: must not keep the stale 2026-06-22 commit marker.`);
}
if (/Dirty working tree\s*\|\s*HIGH/i.test(inventory)) {
  fail(`${inventoryPath}: stale dirty working tree risk row must be replaced.`);
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-current-state-inventory"]) {
  fail("package.json: missing audit:heu-current-state-inventory script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:heu-current-state-inventory/i,
  "final handoff current-state inventory audit command",
  "AGENTS.md",
);

if (failures.length > 0) {
  console.error("HEU current-state inventory audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU current-state inventory audit passed. Inventory reflects Stage D NO-GO current state.");
