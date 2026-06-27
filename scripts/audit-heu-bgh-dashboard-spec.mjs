import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const specPath = "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md";
const blockerSourcePath = "lib/production-readiness.ts";
const blockerSummaryPath =
  "components/master-control/production-readiness-blocker-summary.tsx";
const masterControlPagePath = "app/master-control/page.tsx";
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

function requireText(contents, pattern, label, file = specPath) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

const requiredFiles = [
  specPath,
  blockerSourcePath,
  "app/page.tsx",
  "app/reports/page.tsx",
  masterControlPagePath,
  blockerSummaryPath,
  "app/ttgdtx/accounting-dashboard/page.tsx",
  "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md",
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  "docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const spec = exists(specPath) ? read(specPath) : "";
const blockerSource = exists(blockerSourcePath) ? read(blockerSourcePath) : "";
const blockerSummary = exists(blockerSummaryPath) ? read(blockerSummaryPath) : "";
const masterControlPage = exists(masterControlPagePath)
  ? read(masterControlPagePath)
  : "";

requireText(spec, /P5-02 BGH operating dashboard specification/i, "P5-02 scope");
requireText(spec, /NO-GO until source workflows, role-scope UAT and owner\s+sign-off are complete/i, "production NO-GO boundary");
requireText(spec, /executive\s+read-only control surface/i, "read-only executive surface");
requireText(spec, /not a daily data-entry screen/i, "not daily data-entry rule");
requireText(spec, /Workflow before dashboard[\s\S]*Locked\/approved facts before conclusion[\s\S]*Exception first[\s\S]*Scope aware[\s\S]*Read-only by default/i, "design principles");
requireText(spec, /Admission pipeline[\s\S]*TTGDTX finance cockpit[\s\S]*Go\/No-Go readiness[\s\S]*Risk and exception board[\s\S]*Source\/evidence health[\s\S]*Role\/scope health[\s\S]*AI advisory health/i, "dashboard section coverage");
requireText(spec, /Lead conversion[\s\S]*Handover backlog[\s\S]*Receivable total[\s\S]*Collected total[\s\S]*Reconciliation health[\s\S]*Partner payable[\s\S]*Exception count[\s\S]*Production blockers/i, "minimum KPI set");
requireText(spec, /BGH should not be the daily data-entry role/i, "BGH posture");
requireText(spec, /must not expose row-level PII, raw bank data, credentials,\s+service keys, OTPs, unredacted source files or private contract terms/i, "privacy rule");
requireText(spec, /A dashboard card can mutate business or finance state/i, "mutation stop condition");
requireText(spec, /production checklist remains\s+NO-GO/i, "GO/NO-GO stop condition");
requireText(
  spec,
  /(?=[\s\S]*P5-02 Read-Only Blocker Summary)(?=[\s\S]*production-readiness-blocker-summary\.tsx)(?=[\s\S]*data-heu-production-blocker-summary="P5-02")(?=[\s\S]*data-heu-production-safe-iteration-loop="P5-02")(?=[\s\S]*data-heu-production-action-queue="P5-02")(?=[\s\S]*Safe iteration loop)(?=[\s\S]*Next controlled actions)(?=[\s\S]*P0-14 intake-ledger evidence binder closure)(?=[\s\S]*P0-15 final\s+handoff summary)(?=[\s\S]*No GO button is provided)/i,
  "read-only blocker summary implementation note",
);
requireText(spec, /P5-02 is PASS_LOCAL[\s\S]*does not implement a production BGH\s+dashboard[\s\S]*replace signed UAT/i, "PASS_LOCAL local-only boundary");

requireText(
  blockerSummary,
  /(?=[\s\S]*SAFE_ITERATION_STEPS)(?=[\s\S]*data-heu-production-blocker-summary="P5-02")(?=[\s\S]*P5-02 production blocker summary)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Read-only BGH\/owner view)(?=[\s\S]*Production remains NO-GO until backup\/restore, migration order,\s+legal\/finance UAT, payout UAT, dashboard UAT, role-scope UAT,\s+audit-log UAT, hard-delete conversion\/waiver, redaction, P0-14\s+intake-ledger evidence binder, P0-15 final handoff summary and\s+final owner sign-off are completed outside Codex\/chat)(?=[\s\S]*PRODUCTION_BLOCKERS)(?=[\s\S]*PRODUCTION_EXECUTION_STEPS)(?=[\s\S]*data-heu-production-safe-iteration-loop="P5-02")(?=[\s\S]*Safe iteration loop)(?=[\s\S]*Master Control follows the same rhythm as TTGDTX)(?=[\s\S]*data-heu-production-action-queue="P5-02")(?=[\s\S]*Next controlled actions)(?=[\s\S]*P0-14\s+intake-ledger evidence binder)(?=[\s\S]*P0-15 final handoff summary)(?=[\s\S]*owner GO\/NO-GO discussion)(?=[\s\S]*Current recommendation:[\s\S]*NO-GO)(?=[\s\S]*No GO button is provided here)(?=[\s\S]*PASS_LOCAL does not approve production\s+dashboard use, finance actions, production migration, UAT acceptance,\s+owner waiver or production GO)(?=[\s\S]*secrets, passwords, OTPs,\s+service-role keys, bank credentials, raw student PII, raw CCCD, raw\s+phone numbers, raw bank account numbers, bank statements, vouchers or\s+raw payment data)/i,
  "P5-02 production blocker summary UI shell",
  blockerSummaryPath,
);

requireText(
  blockerSource,
  /P0-03[\s\S]*Step90-Step110[\s\S]*P0-19[\s\S]*P2-17[\s\S]*P2-18[\s\S]*P6-04[\s\S]*P6-03[\s\S]*P6-06[\s\S]*P0-10[\s\S]*P0-09/i,
  "P5-02 production blocker shared source coverage",
  blockerSourcePath,
);

requireText(
  masterControlPage,
  /ProductionReadinessBlockerSummary[\s\S]*<ProductionReadinessBlockerSummary\s*\/>[\s\S]*<HeuOsVisualNavigationMap/i,
  "Master Control mounts production blocker summary before navigation map",
  masterControlPagePath,
);

const accountingPlan = read("docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md");
requireText(
  accountingPlan,
  /The dashboard must not:[\s\S]*Create receivables[\s\S]*Execute payout[\s\S]*Mark production GO/i,
  "accounting dashboard read-only boundary",
  "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md",
);

const rolePack = read("docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md");
requireText(
  rolePack,
  /UAT_BGH[\s\S]*Read dashboards and approved summary views[\s\S]*Daily entry, payment execution, hidden source evidence/i,
  "BGH role-scope UAT row",
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
);

const accountingPage = read("app/ttgdtx/accounting-dashboard/page.tsx");
requireText(
  accountingPage,
  /roleCode === "ADMIN" \|\| roleCode === "BGH"[\s\S]*hasReportsReadAll/i,
  "BGH/report access guard",
  "app/ttgdtx/accounting-dashboard/page.tsx",
);
requireText(
  accountingPage,
  /if \(canOpen\)[\s\S]*ttgdtx_accounting_dashboard_summary/i,
  "dashboard queries after canOpen",
  "app/ttgdtx/accounting-dashboard/page.tsx",
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-bgh-dashboard-spec"]) {
  fail("package.json: missing audit:heu-bgh-dashboard-spec script");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
if (!/P5-02[\s\S]*PASS_LOCAL[\s\S]*HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627\.md[\s\S]*production-readiness-blocker-summary\.tsx[\s\S]*safe iteration loop[\s\S]*next controlled actions queue includes P0-14 intake-ledger evidence binder and P0-15 final handoff summary[\s\S]*audit:heu-bgh-dashboard-spec/.test(backlog)) {
  fail("Backlog P5-02 must be PASS_LOCAL and reference BGH dashboard spec audit.");
}

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
if (!/BGH operating dashboard specification[\s\S]*PASS_LOCAL[\s\S]*HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627\.md[\s\S]*production-readiness-blocker-summary\.tsx[\s\S]*safe iteration loop[\s\S]*next controlled actions queue includes P0-14 intake-ledger evidence binder and P0-15 final handoff summary/.test(checklist)) {
  fail("Production checklist must include BGH operating dashboard specification PASS_LOCAL evidence.");
}

const agents = read("AGENTS.md");
if (!agents.includes("docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md")) {
  fail("AGENTS.md: missing BGH dashboard spec in required reading.");
}
if (!agents.includes("npm.cmd run audit:heu-bgh-dashboard-spec")) {
  fail("AGENTS.md: missing BGH dashboard spec audit in final handoff checks.");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (
  !releaseGateAudit.includes(specPath) ||
  !releaseGateAudit.includes(blockerSummaryPath) ||
  !releaseGateAudit.includes("audit:heu-bgh-dashboard-spec")
) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing BGH dashboard spec gate coverage.");
}

if (failures.length > 0) {
  console.error("HEU BGH dashboard spec audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU BGH dashboard spec audit passed. P5-02 blocker summary is read-only and does not approve production.");
