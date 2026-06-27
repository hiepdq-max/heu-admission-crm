import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

function requireText(contents, pattern, label, file) {
  if (!pattern.test(contents)) {
    failures.push(`${file}: missing ${label}`);
  }
}

const componentPath = "components/ttgdtx/ttgdtx-production-readiness-guard.tsx";
const pagePath = "app/ttgdtx/page.tsx";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";

for (const file of [
  componentPath,
  pagePath,
  checklistPath,
  backlogPath,
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const component = read(componentPath);
const page = read(pagePath);
const checklist = read(checklistPath);
const backlog = read(backlogPath);
const agents = read("AGENTS.md");
const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
const packageJson = JSON.parse(read("package.json"));

requireText(
  component,
  /data-ttgdtx-production-readiness-guard="TTGDTX_9PLUS"/,
  "TTGDTX production readiness guard marker",
  componentPath,
);
requireText(
  component,
  /Production remains NO-GO[\s\S]*PASS_LOCAL[\s\S]*khong phe duyet production\s+migration/i,
  "NO-GO and PASS_LOCAL boundary",
  componentPath,
);

for (const blocker of [
  "Supabase backup",
  "Step90-Step110",
  "Step97",
  "Step100",
  "Step109",
  "Step110",
  "P2-17",
  "P2-18",
  "signed UAT",
  "Audit log",
  "hard-delete",
  "rollback",
]) {
  requireText(component, new RegExp(blocker, "i"), `${blocker} blocker`, componentPath);
}

requireText(
  page,
  /TtgdtxProductionReadinessGuard[\s\S]*<TtgdtxProductionReadinessGuard \/>/,
  "TTGDTX landing page mounts production readiness guard",
  pagePath,
);

requireText(
  checklist,
  /Internal UAT sign-off[\s\S]*IN_PROGRESS[\s\S]*ttgdtx-production-readiness-guard\.tsx[\s\S]*audit:ttgdtx-production-readiness-guard[\s\S]*signed multi-account UAT still required/i,
  "production checklist keeps internal UAT IN_PROGRESS with readiness guard evidence",
  checklistPath,
);

requireText(
  backlog,
  /P0-08[\s\S]*Expose TTGDTX production readiness guard in app[\s\S]*PASS_LOCAL[\s\S]*audit:ttgdtx-production-readiness-guard/i,
  "P0-08 backlog guard row",
  backlogPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-production-readiness-guard"]) {
  failures.push("package.json: missing audit:ttgdtx-production-readiness-guard script");
}

requireText(
  agents,
  /npm\.cmd run audit:ttgdtx-production-readiness-guard/,
  "AGENTS final handoff audit command",
  "AGENTS.md",
);

for (const needle of [
  componentPath,
  "scripts/audit-ttgdtx-production-readiness-guard.mjs",
  "audit:ttgdtx-production-readiness-guard",
]) {
  if (!releaseGateAudit.includes(needle)) {
    failures.push(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX production readiness guard audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "TTGDTX production readiness guard audit passed. NO-GO blockers are visible in the app.",
);
