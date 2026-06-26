import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

const failures = [];

function fail(message) {
  failures.push(message);
}

const dashboardPage = read("app/ttgdtx/accounting-dashboard/page.tsx");
const uatRunbook = read("docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md");

if (/permission_name:\s*"ttgdtx\.contract\.read"/.test(dashboardPage)) {
  fail(
    "P2-18 dashboard must not use ttgdtx.contract.read as finance-dashboard access.",
  );
}

const canOpenIndex = dashboardPage.indexOf("if (canOpen)");
const firstDashboardQueryIndex = dashboardPage.indexOf(
  '.from("ttgdtx_accounting_dashboard_summary")',
);

if (canOpenIndex === -1 || firstDashboardQueryIndex === -1) {
  fail("P2-18 dashboard access gate or dashboard query block is missing.");
} else if (firstDashboardQueryIndex < canOpenIndex) {
  fail("P2-18 dashboard queries run before canOpen is checked.");
}

if (
  !/hasDashboardPermission[\s\S]*scopes\.some\(\(scope\)\s*=>\s*scope\.segment_id\s*===\s*segmentId\)/.test(
    dashboardPage,
  )
) {
  fail("P2-18 dashboard must require dashboard permission plus TTGDTX scope.");
}

if (!/contract read permission alone does not expose finance totals/i.test(uatRunbook)) {
  fail("P2-18 UAT runbook must test contract-only user denial.");
}

if (failures.length > 0) {
  console.error("TTGDTX dashboard-access audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX dashboard-access audit passed.");
