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

function requireText(contents, pattern, label, file) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

const componentPath =
  "components/audit/hard-delete-conversion-decision-queue.tsx";
const pagePath = "app/audit/page.tsx";
const reviewPath = "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";
const inventoryPath = "docs/HEU_CURRENT_STATE_INVENTORY.md";

for (const file of [
  componentPath,
  pagePath,
  reviewPath,
  checklistPath,
  backlogPath,
  inventoryPath,
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const component = exists(componentPath) ? read(componentPath) : "";
const page = exists(pagePath) ? read(pagePath) : "";
const review = exists(reviewPath) ? read(reviewPath) : "";
const checklist = exists(checklistPath) ? read(checklistPath) : "";
const backlog = exists(backlogPath) ? read(backlogPath) : "";
const inventory = exists(inventoryPath) ? read(inventoryPath) : "";
const agents = exists("AGENTS.md") ? read("AGENTS.md") : "";
const releaseGateAudit = exists("scripts/audit-ttgdtx-release-gates.mjs")
  ? read("scripts/audit-ttgdtx-release-gates.mjs")
  : "";
const packageJson = JSON.parse(read("package.json"));

requireText(
  component,
  /(?=[\s\S]*data-hard-delete-conversion-decision-queue="P6-06")(?=[\s\S]*P6-06 hard-delete conversion decision queue)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*44 non-TTGDTX\/base cascade findings)(?=[\s\S]*HDQ-01)(?=[\s\S]*HDQ-05)(?=[\s\S]*Base identity and CRM lead children)(?=[\s\S]*HOU finance and evidence)(?=[\s\S]*Workspace and scope helpers)(?=[\s\S]*Master, control and dynamic configuration)(?=[\s\S]*Legal, tuition and short-course operations)(?=[\s\S]*RESTRICT_OR_ARCHIVE)(?=[\s\S]*SOFT_REVOKE_OR_WAIVER)(?=[\s\S]*does not\s+approve production deletion, cascade execution, waiver, conversion\s+migration, cleanup, rollback success or production GO)/i,
  "hard-delete conversion decision queue UI",
  componentPath,
);

requireText(
  page,
  /<HardDeleteBoundaryGuard\s*\/>[\s\S]*<HardDeleteConversionDecisionQueue\s*\/>[\s\S]*<HardDeleteWaiverEvidenceChecklist\s*\/>[\s\S]*AuditLogTable/i,
  "audit page mounts conversion queue between boundary and waiver checklist",
  pagePath,
);

requireText(
  review,
  /(?=[\s\S]*Decision Queue Evidence)(?=[\s\S]*hard-delete-conversion-decision-queue\.tsx)(?=[\s\S]*HDQ-01)(?=[\s\S]*HDQ-05)(?=[\s\S]*RESTRICT_OR_ARCHIVE)(?=[\s\S]*SOFT_REVOKE_OR_WAIVER)(?=[\s\S]*P6-06 Acceptance Matrix)(?=[\s\S]*P6-06-ACCEPT-01)(?=[\s\S]*P6-06-ACCEPT-06)(?=[\s\S]*audit:hard-delete-conversion-decision-queue)(?=[\s\S]*does not approve production deletion, cascade execution, waiver,\s+conversion\s+migration, cleanup, rollback success or production GO)/i,
  "non-TTGDTX cascade review decision queue evidence",
  reviewPath,
);

requireText(
  checklist,
  /Hard delete review[\s\S]*IN_PROGRESS[\s\S]*hard-delete-conversion-decision-queue\.tsx[\s\S]*hard-delete\/cascade acceptance matrix[\s\S]*audit:hard-delete-conversion-decision-queue[\s\S]*non-TTGDTX conversion or written waiver still required/i,
  "production checklist keeps hard-delete review IN_PROGRESS with decision queue",
  checklistPath,
);

requireText(
  backlog,
  /P6-06[\s\S]*hard-delete-conversion-decision-queue\.tsx[\s\S]*hard-delete\/cascade acceptance matrix[\s\S]*audit:hard-delete-conversion-decision-queue[\s\S]*conversion or written waiver still required/i,
  "backlog records hard-delete conversion decision queue",
  backlogPath,
);

requireText(
  inventory,
  /npm\.cmd run audit:hard-delete-conversion-decision-queue[\s\S]*PASS/i,
  "current-state hard-delete decision queue audit evidence",
  inventoryPath,
);

if (!packageJson.scripts?.["audit:hard-delete-conversion-decision-queue"]) {
  fail("package.json: missing audit:hard-delete-conversion-decision-queue script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:hard-delete-conversion-decision-queue/i,
  "AGENTS final handoff hard-delete conversion decision queue audit command",
  "AGENTS.md",
);

for (const needle of [
  componentPath,
  "scripts/audit-hard-delete-conversion-decision-queue.mjs",
  "audit:hard-delete-conversion-decision-queue",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("Hard-delete conversion decision queue audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "Hard-delete conversion decision queue audit passed. P6-06 conversion/waiver lanes are visible before production review.",
);
