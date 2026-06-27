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

const componentPath = "components/ttgdtx/ttgdtx-dashboard-readonly-guard.tsx";
const pagePath = "app/ttgdtx/accounting-dashboard/page.tsx";
const runbookPath = "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md";
const planPath = "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";

for (const file of [
  componentPath,
  pagePath,
  runbookPath,
  planPath,
  checklistPath,
  backlogPath,
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
  "scripts/audit-ttgdtx-dashboard-access.mjs",
  "scripts/audit-ttgdtx-accounting-dashboard-uat-plan.mjs",
]) {
  requireFile(file);
}

const component = read(componentPath);
const page = read(pagePath);
const runbook = read(runbookPath);
const plan = read(planPath);
const checklist = read(checklistPath);
const backlog = read(backlogPath);
const agents = read("AGENTS.md");
const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
const packageJson = JSON.parse(read("package.json"));

requireText(
  component,
  /data-ttgdtx-dashboard-readonly-guard="P2-18"/,
  "P2-18 read-only guard marker",
  componentPath,
);

requireText(
  component,
  /Role-scope[\s\S]*contract-only[\s\S]*signed browser UAT/i,
  "P2-18 role-scope contract-only and signed-UAT boundary",
  componentPath,
);

for (const uatCase of [
  "P2-18-01",
  "P2-18-02",
  "P2-18-03",
  "P2-18-04",
  "P2-18-05",
  "P2-18-06",
  "P2-18-07",
  "P2-18-08",
]) {
  requireText(component, new RegExp(uatCase), `${uatCase} UI guard reference`, componentPath);
  requireText(runbook, new RegExp(`\\| ${uatCase} \\|`), `${uatCase} runbook case`, runbookPath);
}

requireText(
  page,
  /TtgdtxDashboardReadonlyGuard[\s\S]*<TtgdtxDashboardReadonlyGuard \/>/,
  "P2-18 page mounts read-only guard",
  pagePath,
);

if (/permission_name:\s*"ttgdtx\.contract\.read"/.test(page)) {
  fail("P2-18 dashboard must not use ttgdtx.contract.read as finance-dashboard access.");
}

const canOpenIndex = page.indexOf("if (canOpen)");
const firstDashboardQueryIndex = page.indexOf(
  '.from("ttgdtx_accounting_dashboard_summary")',
);

if (canOpenIndex === -1 || firstDashboardQueryIndex === -1) {
  fail("P2-18 dashboard access gate or dashboard query block is missing.");
} else if (firstDashboardQueryIndex < canOpenIndex) {
  fail("P2-18 dashboard queries run before canOpen is checked.");
}

requireText(
  page,
  /hasDashboardPermission[\s\S]*scopes\.some\(\(scope\)\s*=>\s*scope\.segment_id\s*===\s*segmentId\)/,
  "dashboard permission plus TTGDTX scope",
  pagePath,
);

requireText(
  plan,
  /The dashboard must not:[\s\S]*Create receivables[\s\S]*Execute payout[\s\S]*Mark production GO/i,
  "dashboard no-write/no-production boundary",
  planPath,
);

requireText(
  runbook,
  /Local Read-Only Guard Evidence[\s\S]*audit:ttgdtx-dashboard-readonly-guard[\s\S]*does not replace signed browser UAT/i,
  "runbook local read-only guard evidence section",
  runbookPath,
);

requireText(
  checklist,
  /P2-18 accounting dashboard[\s\S]*IN_PROGRESS[\s\S]*audit:ttgdtx-dashboard-readonly-guard[\s\S]*signed UAT evidence/i,
  "production checklist keeps P2-18 IN_PROGRESS with read-only guard evidence",
  checklistPath,
);

requireText(
  backlog,
  /P2-18[\s\S]*audit:ttgdtx-dashboard-readonly-guard/i,
  "backlog records P2-18 read-only guard audit",
  backlogPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-dashboard-readonly-guard"]) {
  fail("package.json: missing audit:ttgdtx-dashboard-readonly-guard script");
}

requireText(
  agents,
  /npm\.cmd run audit:ttgdtx-dashboard-readonly-guard/,
  "AGENTS final handoff audit command",
  "AGENTS.md",
);

for (const needle of [
  componentPath,
  "scripts/audit-ttgdtx-dashboard-readonly-guard.mjs",
  "audit:ttgdtx-dashboard-readonly-guard",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX dashboard read-only guard audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX dashboard read-only guard audit passed. P2-18 read-only, role-scope and source comparison guard is packaged for UAT.");
