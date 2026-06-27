import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const standardPath = "docs/HEU_LEAD_LIFECYCLE_STANDARD_20260627.md";
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

function requireText(contents, pattern, label, file = standardPath) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

for (const file of [
  standardPath,
  "lib/lead-lifecycle.ts",
  "components/leads/lead-lifecycle-guard.tsx",
  "app/leads/page.tsx",
  "app/leads/[id]/actions.ts",
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const standard = exists(standardPath) ? read(standardPath) : "";
const lifecycle = exists("lib/lead-lifecycle.ts") ? read("lib/lead-lifecycle.ts") : "";
const guard = exists("components/leads/lead-lifecycle-guard.tsx")
  ? read("components/leads/lead-lifecycle-guard.tsx")
  : "";
const leadsPage = exists("app/leads/page.tsx") ? read("app/leads/page.tsx") : "";
const leadActions = exists("app/leads/[id]/actions.ts")
  ? read("app/leads/[id]/actions.ts")
  : "";

requireText(
  standard,
  /NEW[\s\S]*ASSIGNED[\s\S]*CONTACTED[\s\S]*INTERESTED[\s\S]*FOLLOW_UP[\s\S]*VISITED[\s\S]*DOCUMENT_PENDING[\s\S]*DOCUMENT_SUBMITTED[\s\S]*ELIGIBLE[\s\S]*ENROLLED[\s\S]*LOST[\s\S]*DUPLICATE/i,
  "full lead status lifecycle",
);
requireText(standard, /No raw form dump into AI/i, "AI raw-form-dump boundary");
requireText(
  standard,
  /FOLLOW_UP[\s\S]*next_followup_at[\s\S]*LOST[\s\S]*lost_reason[\s\S]*ELIGIBLE[\s\S]*ENROLLED[\s\S]*P0-19/i,
  "server-side status controls",
);
requireText(
  standard,
  /P3-02 prepares lead-to-student handover[\s\S]*P2-05 remains the receivable gate[\s\S]*P2-03 remains the final student receivable creation control/i,
  "handover and finance gate boundary",
);
requireText(
  standard,
  /Lead lifecycle does not:[\s\S]*Create receivables[\s\S]*Collect tuition[\s\S]*Issue invoice or receipt[\s\S]*Reconcile money[\s\S]*Approve partner payment[\s\S]*Execute payout[\s\S]*Mark revenue[\s\S]*Mark production GO/i,
  "finance and production boundary",
);
requireText(standard, /P3-01 is PASS_LOCAL/i, "PASS_LOCAL result");
requireText(
  standard,
  /Signed role\/workflow UAT[\s\S]*workspace scope[\s\S]*status transitions[\s\S]*evidence redaction[\s\S]*handover boundary[\s\S]*finance-gate behavior/i,
  "signed UAT boundary",
);

for (const code of [
  "P3-01-L01",
  "P3-01-L02",
  "P3-01-L03",
  "P3-01-L04",
  "P3-01-L05",
  "P3-01-L06",
]) {
  if (!lifecycle.includes(code)) {
    fail(`lib/lead-lifecycle.ts: missing ${code}`);
  }
}

for (const status of [
  "NEW",
  "ASSIGNED",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "VISITED",
  "DOCUMENT_PENDING",
  "DOCUMENT_SUBMITTED",
  "ELIGIBLE",
  "ENROLLED",
  "LOST",
  "DUPLICATE",
]) {
  if (!lifecycle.includes(status)) {
    fail(`lib/lead-lifecycle.ts: missing ${status}`);
  }
}

requireText(
  guard,
  /(?=[\s\S]*data-heu-lead-lifecycle-guard="P3-01")(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*No raw form dump into AI)(?=[\s\S]*FOLLOW_UP requires next_followup_at)(?=[\s\S]*LOST requires lost_reason)(?=[\s\S]*ELIGIBLE\/ENROLLED require legal\/tuition gate)(?=[\s\S]*P2-05\/P2-03 remain final finance\s+controls)/i,
  "P3-01 visible UI guard",
  "components/leads/lead-lifecycle-guard.tsx",
);

requireText(
  leadsPage,
  /LeadLifecycleGuard[\s\S]*<LeadLifecycleGuard \/>/i,
  "lead lifecycle guard mount",
  "app/leads/page.tsx",
);

requireText(
  leadActions,
  /status === "FOLLOW_UP"[\s\S]*nextFollowupAt[\s\S]*status === "LOST"[\s\S]*lostReason[\s\S]*\["ELIGIBLE", "ENROLLED"\]\.includes\(status\)[\s\S]*readMajorGateForLead/i,
  "server-side lifecycle status checks",
  "app/leads/[id]/actions.ts",
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-lead-lifecycle-standard"]) {
  fail("package.json: missing audit:heu-lead-lifecycle-standard script");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
requireText(
  backlog,
  /P3-01[\s\S]*Lead lifecycle standard[\s\S]*PASS_LOCAL[\s\S]*HEU_LEAD_LIFECYCLE_STANDARD_20260627\.md[\s\S]*audit:heu-lead-lifecycle-standard/i,
  "P3-01 PASS_LOCAL backlog row",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
requireText(
  checklist,
  /Lead lifecycle standard[\s\S]*PASS_LOCAL[\s\S]*HEU_LEAD_LIFECYCLE_STANDARD_20260627\.md[\s\S]*audit:heu-lead-lifecycle-standard[\s\S]*No raw form dump into AI/i,
  "production checklist lead lifecycle row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

const agents = read("AGENTS.md");
if (!agents.includes(standardPath)) {
  fail("AGENTS.md: missing lead lifecycle standard in required reading.");
}
if (!agents.includes("npm.cmd run audit:heu-lead-lifecycle-standard")) {
  fail("AGENTS.md: missing lead lifecycle audit in final handoff checks.");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (
  !releaseGateAudit.includes(standardPath) ||
  !releaseGateAudit.includes("audit:heu-lead-lifecycle-standard")
) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing lead lifecycle gate coverage.");
}

if (failures.length > 0) {
  console.error("HEU lead lifecycle standard audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU lead lifecycle standard audit passed. P3-01 is PASS_LOCAL and finance-gated.");
