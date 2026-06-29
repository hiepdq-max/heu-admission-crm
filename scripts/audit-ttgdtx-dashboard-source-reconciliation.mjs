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

const componentPath =
  "components/ttgdtx/ttgdtx-dashboard-source-reconciliation-checklist.tsx";
const pagePath = "app/ttgdtx/accounting-dashboard/page.tsx";
const runbookPath = "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";

for (const file of [
  componentPath,
  pagePath,
  runbookPath,
  checklistPath,
  backlogPath,
  "AGENTS.md",
  "package.json",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const component = existsSync(path.join(repoRoot, componentPath))
  ? read(componentPath)
  : "";
const page = existsSync(path.join(repoRoot, pagePath)) ? read(pagePath) : "";
const runbook = existsSync(path.join(repoRoot, runbookPath)) ? read(runbookPath) : "";
const checklist = existsSync(path.join(repoRoot, checklistPath))
  ? read(checklistPath)
  : "";
const backlog = existsSync(path.join(repoRoot, backlogPath)) ? read(backlogPath) : "";
const agents = existsSync(path.join(repoRoot, "AGENTS.md")) ? read("AGENTS.md") : "";
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
  component,
  /(?=[\s\S]*data-ttgdtx-dashboard-source-reconciliation-checklist="P2-18")(?=[\s\S]*P2-18 source reconciliation checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2-18-SRC-01)(?=[\s\S]*P2-18-SRC-06)(?=[\s\S]*P2-03 receivable)(?=[\s\S]*P2-10 collection)(?=[\s\S]*P2-13\/P2-14 reconciliation)(?=[\s\S]*P2-15\/P2-16 payment request)(?=[\s\S]*P2-17 payout)(?=[\s\S]*P2-19 source\/evidence metadata)(?=[\s\S]*Stop:)(?=[\s\S]*Signed\s+browser UAT must still prove at least one complete flow and one\s+exception flow)/i,
  "P2-18 source reconciliation checklist UI",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*data-ttgdtx-dashboard-reliance-decision-manifest="P2-18")(?=[\s\S]*P2-18 dashboard reliance decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P2-18-REL-01)(?=[\s\S]*P2-18-REL-06)(?=[\s\S]*Authorized read-only access)(?=[\s\S]*Source-total reconciliation)(?=[\s\S]*Control-board status)(?=[\s\S]*Evidence redaction and storage)(?=[\s\S]*Dashboard reliance boundary)(?=[\s\S]*Human reliance decision)(?=[\s\S]*P2_18_RELIANCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not approve finance action, statutory\s+accounting, UAT acceptance, dashboard production reliance or\s+production GO)(?=[\s\S]*Missing reliance decision ID, unresolved variance, unsigned owner\s+decision, uncontrolled evidence or raw sensitive dashboard data keeps\s+P2-18 NO-GO)/i,
  "P2-18 dashboard reliance decision manifest UI",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*data-ttgdtx-dashboard-immediate-stop="P2-18")(?=[\s\S]*P2-18 dashboard immediate stop guard: PASS_LOCAL only)(?=[\s\S]*P2-18-STOP-01)(?=[\s\S]*P2-18-STOP-05)(?=[\s\S]*P2_18_STOP_CHECK \/ GO_NEXT \/ BLOCKED)(?=[\s\S]*finance approval, statutory accounting, revenue recognition, payment approval, bank transfer instruction or production GO)(?=[\s\S]*Signed browser UAT, source reconciliation, reliance decision, backup\/restore proof or owner sign-off is missing)(?=[\s\S]*contract-only\/out-of-scope access exposes finance totals)(?=[\s\S]*unresolved source variance, unexplained CRITICAL status, ownerless REVIEW status or a wrong exception route)(?=[\s\S]*Raw PII, CCCD, bank accounts, vouchers, bank statements, passwords, temporary passwords, OTPs, password reset links, account activation\/invite links or service-role keys)/i,
  "P2-18 dashboard immediate stop guard UI",
  componentPath,
);

requireText(
  page,
  /<TtgdtxDashboardReadonlyGuard\s*\/>[\s\S]*<TtgdtxDashboardSourceReconciliationChecklist\s*\/>[\s\S]*<TtgdtxDashboardUatEvidenceChecklist\s*\/>/,
  "P2-18 page mounts source reconciliation between guard and evidence checklist",
  pagePath,
);

requireText(
  page,
  /import \{ formatVndAmount \} from "@\/lib\/vnd-money"[\s\S]*function money\([\s\S]*return formatVndAmount\(value\)/i,
  "P2-18 dashboard uses shared VND formatter",
  pagePath,
);

if (/replace\(\s*\/\\\.\//.test(page)) {
  fail(`${pagePath}: must not replace dot separators with spaces for VND display`);
}

requireText(
  runbook,
  /(?=[\s\S]*source reconciliation checklist)(?=[\s\S]*ttgdtx-dashboard-source-reconciliation-checklist\.tsx)(?=[\s\S]*P2-03)(?=[\s\S]*P2-10)(?=[\s\S]*P2-13\/P2-14)(?=[\s\S]*P2-15\/P2-16)(?=[\s\S]*P2-17)(?=[\s\S]*P2-19)(?=[\s\S]*data-ttgdtx-dashboard-immediate-stop="P2-18")(?=[\s\S]*P2-18-STOP-01 through\s+P2-18-STOP-05)(?=[\s\S]*P2_18_STOP_CHECK \/ GO_NEXT \/ BLOCKED)(?=[\s\S]*Dashboard Reliance Decision Manifest)(?=[\s\S]*Immediate stop guard)(?=[\s\S]*data-ttgdtx-dashboard-reliance-decision-manifest="P2-18")(?=[\s\S]*P2-18-REL-01)(?=[\s\S]*P2-18-REL-06)(?=[\s\S]*P2_18_RELIANCE_READY \/ NO_GO \/ BLOCKED)/i,
  "P2-18 runbook source reconciliation checklist reference",
  runbookPath,
);

requireText(
  checklist,
  /(?=[\s\S]*P2-18 accounting dashboard)(?=[\s\S]*dashboard immediate stop guard)(?=[\s\S]*dashboard reliance decision manifest)(?=[\s\S]*ttgdtx-dashboard-source-reconciliation-checklist\.tsx)(?=[\s\S]*audit:ttgdtx-dashboard-source-reconciliation)(?=[\s\S]*signed UAT evidence)/i,
  "production checklist P2-18 source reconciliation guard row",
  checklistPath,
);

requireText(
  backlog,
  /P2-18[\s\S]*dashboard immediate stop guard[\s\S]*dashboard reliance decision manifest[\s\S]*ttgdtx-dashboard-source-reconciliation-checklist\.tsx[\s\S]*audit:ttgdtx-dashboard-source-reconciliation/i,
  "backlog P2-18 source reconciliation guard",
  backlogPath,
);

requireText(
  inventory,
  /(?=[\s\S]*Accounting dashboard \/ BGH control[\s\S]*dashboard immediate stop guard[\s\S]*dashboard reliance decision manifest[\s\S]*Signed browser UAT pending)(?=[\s\S]*npm\.cmd run audit:ttgdtx-dashboard-source-reconciliation[\s\S]*PASS)/i,
  "current-state P2-18 source reconciliation audit evidence",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
);

if (!packageJson.scripts?.["audit:ttgdtx-dashboard-source-reconciliation"]) {
  fail("package.json: missing audit:ttgdtx-dashboard-source-reconciliation script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:ttgdtx-dashboard-source-reconciliation/i,
  "AGENTS final handoff dashboard source reconciliation audit command",
  "AGENTS.md",
);

for (const needle of [
  componentPath,
  "scripts/audit-ttgdtx-dashboard-source-reconciliation.mjs",
  "audit:ttgdtx-dashboard-source-reconciliation",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX dashboard source reconciliation audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "TTGDTX dashboard source reconciliation audit passed. P2-18 UAT has source-by-source KPI checks.",
);
