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

const sourcePath = "lib/production-readiness.ts";
const blockerSummaryPath =
  "components/master-control/production-readiness-blocker-summary.tsx";
const executionQueuePath =
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx";

for (const file of [
  sourcePath,
  blockerSummaryPath,
  executionQueuePath,
  "AGENTS.md",
  "package.json",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "scripts/audit-heu-bgh-dashboard-spec.mjs",
  "scripts/audit-ttgdtx-production-readiness-guard.mjs",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const source = existsSync(path.join(repoRoot, sourcePath)) ? read(sourcePath) : "";
const blockerSummary = existsSync(path.join(repoRoot, blockerSummaryPath))
  ? read(blockerSummaryPath)
  : "";
const executionQueue = existsSync(path.join(repoRoot, executionQueuePath))
  ? read(executionQueuePath)
  : "";
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
const packageJson = JSON.parse(read("package.json"));

requireText(
  source,
  /export const PRODUCTION_BLOCKERS[\s\S]*export const PRODUCTION_EXECUTION_STEPS/i,
  "shared blocker and execution-step exports",
  sourcePath,
);

requireText(
  source,
  /P0-03[\s\S]*Operator run sheet, backup ID, restore target, preflight\/postflight result and smoke-check evidence[\s\S]*Complete the operator run sheet, then attach backup ID, restore target, preflight\/postflight output and smoke-check evidence outside Git[\s\S]*Operator run sheet, backup ID, restore target, preflight\/postflight result, smoke-check result and operator\/checker names/i,
  "P0-03 operator run sheet source coverage",
  sourcePath,
);

requireText(
  source,
  /P0-09[\s\S]*Final signed multi-owner GO\/NO-GO note using the owner sign-off pack, UAT operator handoff and redacted evidence references[\s\S]*Use the owner sign-off pack and UAT operator handoff references[\s\S]*signed decision referencing the owner sign-off pack and UAT operator handoff/i,
  "P0-09 owner sign-off handoff source coverage",
  sourcePath,
);

requireText(
  source,
  /P0-15[\s\S]*Prepare final handoff summary[\s\S]*Record live git state, local checks, Stage D\/NO-GO and P0-03\/P0-09\/P0-13\/P0-14 evidence paths[\s\S]*P0-14 split into P6-04\/P6-03\/P6-06 proof paths and the P6-06 finding register[\s\S]*before owner decision/i,
  "P0-15 final handoff split evidence source coverage",
  sourcePath,
);

for (const code of [
  "P0-03",
  "Step90-Step110",
  "P0-19",
  "P2-17",
  "P2-18",
  "P6-04",
  "P6-03",
  "P6-06",
  "P0-10",
  "P0-09",
]) {
  requireText(source, new RegExp(code.replace("/", "\\/")), `${code} blocker`, sourcePath);
}

const orderedExecutionCodes = [
  "P0-10",
  "P0-03",
  "Step90-Step110",
  "P6-04",
  "P0-19",
  "P2-17",
  "P2-18",
  "P6-03",
  "P6-06",
  "P0-14",
  "P0-15",
  "Owner GO/NO-GO",
];

let lastIndex = -1;
const executionSource = source.slice(
  source.indexOf("export const PRODUCTION_EXECUTION_STEPS"),
);
for (const code of orderedExecutionCodes) {
  const index = executionSource.indexOf(`code: "${code}"`);
  if (index === -1) {
    fail(`${sourcePath}: missing execution step ${code}`);
    continue;
  }
  if (index <= lastIndex) {
    fail(`${sourcePath}: execution step ${code} is out of order`);
  }
  lastIndex = index;
}

requireText(
  blockerSummary,
  /import \{[\s\S]*PRODUCTION_BLOCKERS[\s\S]*PRODUCTION_EXECUTION_STEPS[\s\S]*\} from "@\/lib\/production-readiness"/,
  "blocker summary imports shared blocker and execution sources",
  blockerSummaryPath,
);

requireText(
  executionQueue,
  /import \{ PRODUCTION_EXECUTION_STEPS \} from "@\/lib\/production-readiness"/,
  "execution queue imports shared execution source",
  executionQueuePath,
);

if (/const\s+productionBlockers\s*=/.test(blockerSummary)) {
  fail(`${blockerSummaryPath}: must not keep a local productionBlockers array`);
}

if (/const\s+executionSteps\s*=/.test(executionQueue)) {
  fail(`${executionQueuePath}: must not keep a local executionSteps array`);
}

if (!packageJson.scripts?.["audit:heu-production-blocker-source"]) {
  fail("package.json: missing audit:heu-production-blocker-source script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:heu-production-blocker-source/i,
  "final handoff production blocker source audit command",
  "AGENTS.md",
);

requireText(
  backlog,
  /P0-13[\s\S]*Production blocker shared source[\s\S]*PASS_LOCAL[\s\S]*audit:heu-production-blocker-source[\s\S]*P0-03 operator run sheet evidence path[\s\S]*P0-09 owner sign-off\/UAT handoff evidence path/i,
  "P0-13 shared blocker source backlog row",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireText(
  checklist,
  /Production blocker shared source[\s\S]*PASS_LOCAL[\s\S]*audit:heu-production-blocker-source[\s\S]*P0-03 operator run sheet evidence path[\s\S]*P0-09 owner sign-off\/UAT handoff evidence path/i,
  "production checklist shared blocker source row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  inventory,
  /npm\.cmd run audit:heu-production-blocker-source[\s\S]*PASS/i,
  "current-state shared blocker source audit evidence",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
);

for (const needle of [sourcePath, "scripts/audit-heu-production-blocker-source.mjs"]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

for (const needle of [
  "audit:heu-production-blocker-source",
  "audit:heu-bgh-dashboard-spec",
  "audit:ttgdtx-production-readiness-guard",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("HEU production blocker source audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU production blocker source audit passed. Blocker summary and execution queue use one shared source.",
);
