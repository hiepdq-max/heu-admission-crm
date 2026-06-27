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
const componentPath = "components/ttgdtx/ttgdtx-production-evidence-binder.tsx";
const pagePath = "app/ttgdtx/page.tsx";

for (const file of [
  sourcePath,
  componentPath,
  pagePath,
  "AGENTS.md",
  "package.json",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const source = existsSync(path.join(repoRoot, sourcePath)) ? read(sourcePath) : "";
const component = existsSync(path.join(repoRoot, componentPath))
  ? read(componentPath)
  : "";
const page = existsSync(path.join(repoRoot, pagePath)) ? read(pagePath) : "";
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
  /export type ProductionEvidenceRequirement[\s\S]*export const PRODUCTION_EVIDENCE_REQUIREMENTS/i,
  "production evidence requirement type and export",
  sourcePath,
);

for (const caseId of [
  "P0-14-01",
  "P0-14-02",
  "P0-14-03",
  "P0-14-04",
  "P0-14-05",
  "P0-14-06",
  "P0-14-07",
]) {
  requireText(source, new RegExp(caseId), `${caseId} evidence case`, sourcePath);
}

for (const blocker of [
  "P0-03",
  "Step90-Step110",
  "P0-19",
  "P2-17",
  "P2-18",
  "P6-04/P6-03/P6-06",
  "P0-09",
]) {
  requireText(source, new RegExp(blocker.replaceAll("/", "\\/")), `${blocker} evidence blocker`, sourcePath);
}

requireText(
  source,
  /(?=[\s\S]*CONTROLLED_SENSITIVE)(?=[\s\S]*CONTROLLED_REDACTED)(?=[\s\S]*service-role key)(?=[\s\S]*password)(?=[\s\S]*OTP)(?=[\s\S]*raw student PII)(?=[\s\S]*bank statements?)(?=[\s\S]*AI(?:-produced)? approvals?)/i,
  "sensitive evidence and forbidden-content boundaries",
  sourcePath,
);

requireText(
  component,
  /(?=[\s\S]*data-ttgdtx-production-evidence-binder="P0-14")(?=[\s\S]*P0-14 production evidence binder)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*PRODUCTION_EVIDENCE_REQUIREMENTS)(?=[\s\S]*NO-GO until signed)(?=[\s\S]*what proof is needed, where\s+it must live, who signs it and what must never be pasted into\s+Git\/Codex\/chat)(?=[\s\S]*Forbidden content stays out of Git\/Codex\/chat)(?=[\s\S]*service-role keys,\s+passwords, OTPs)(?=[\s\S]*raw student PII)(?=[\s\S]*bank statements)(?=[\s\S]*AI-produced approvals)/i,
  "P0-14 production evidence binder UI",
  componentPath,
);

requireText(
  page,
  /TtgdtxProductionEvidenceBinder[\s\S]*<TtgdtxProductionExecutionQueue\s*\/>[\s\S]*<TtgdtxProductionEvidenceBinder\s*\/>[\s\S]*<TtgdtxOwnerGoNoGoEvidenceChecklist\s*\/>/,
  "TTGDTX page mounts evidence binder between execution queue and owner signoff",
  pagePath,
);

if (!packageJson.scripts?.["audit:heu-production-evidence-binder"]) {
  fail("package.json: missing audit:heu-production-evidence-binder script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:heu-production-evidence-binder/i,
  "final handoff production evidence binder audit command",
  "AGENTS.md",
);

requireText(
  backlog,
  /P0-14[\s\S]*Production evidence binder[\s\S]*PASS_LOCAL[\s\S]*audit:heu-production-evidence-binder/i,
  "P0-14 production evidence binder backlog row",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireText(
  checklist,
  /Production evidence binder[\s\S]*PASS_LOCAL[\s\S]*audit:heu-production-evidence-binder/i,
  "production checklist evidence binder row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  inventory,
  /npm\.cmd run audit:heu-production-evidence-binder[\s\S]*PASS/i,
  "current-state production evidence binder audit evidence",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
);

for (const needle of [
  componentPath,
  "scripts/audit-heu-production-evidence-binder.mjs",
  "audit:heu-production-evidence-binder",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("HEU production evidence binder audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU production evidence binder audit passed. P0-14 evidence ownership, storage and redaction rules are visible.",
);
