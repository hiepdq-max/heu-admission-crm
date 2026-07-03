import { spawnSync } from "node:child_process";

const businessLaneOrder = [
  "P0_17_USER_ROLE_SCOPE_TCHC",
  "FINANCE_ACCOUNTING_TTGDTX",
  "CTHSSV",
  "KHOA_GIANG_VIEN",
  "SHORT_COURSE_TRAINING",
  "CRM_NAV_REPORT_SHARED",
];

const lanes = new Map([
  ["P0_17_USER_ROLE_SCOPE_TCHC", []],
  ["FINANCE_ACCOUNTING_TTGDTX", []],
  ["CTHSSV", []],
  ["KHOA_GIANG_VIEN", []],
  ["SHORT_COURSE_TRAINING", []],
  ["CRM_NAV_REPORT_SHARED", []],
  ["AI_WORKSTREAM_ROUTER", []],
  ["AUDIT_RELEASE_SCRIPTS", []],
  ["GOVERNANCE_SHARED_DOCS", []],
  ["UNKNOWN_OTHER", []],
]);

const sharedPathPatterns = [
  /^AGENTS\.md$/i,
  /^package\.json$/i,
  /^docs\/HEU_CURRENT_STATE_INVENTORY\.md$/i,
  /^docs\/HEU_SYSTEM_BUILD_BACKLOG\.md$/i,
  /^docs\/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\.md$/i,
  /^docs\/HEU_IMPLEMENTATION_LOG\.md$/i,
  /^scripts\/audit-heu-implementation-log\.mjs$/i,
  /^scripts\/audit-heu-current-state-inventory\.mjs$/i,
  /^scripts\/audit-heu-data-foundation\.mjs$/i,
  /^scripts\/audit-ttgdtx-release-gates\.mjs$/i,
];

function runGit(args) {
  return spawnSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 4,
    windowsHide: true,
  });
}

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/").trim();
}

function pathFromStatusLine(line) {
  return normalizePath(line.replace(/^.. /, ""));
}

function laneForPath(filePath) {
  if (
    filePath === "docs/HEU_AI_WORKSTREAM_SCOPE_ROUTER_20260703.md" ||
    filePath === "scripts/check-heu-ai-workstream-scope-router.mjs"
  ) {
    return "AI_WORKSTREAM_ROUTER";
  }

  if (
    /^(app|components)\/(tchc|settings\/position-assignment)/i.test(filePath) ||
    /^database\/step11[4-7]/i.test(filePath) ||
    /TCHC|USER_ACTIVATION|PERMISSION_SCOPE|SYSTEM_WIDE_PERMISSION|user-operation|user-activation|system-wide-permission|position-report|legal-compliance/i.test(filePath)
  ) {
    return "P0_17_USER_ROLE_SCOPE_TCHC";
  }

  if (
    /ttgdtx\/payment-requests/i.test(filePath) ||
    /^database\/step10[5-7]/i.test(filePath) ||
    /ACCOUNTING|FINANCE|P2_17|finance-payment|accounting-/i.test(filePath)
  ) {
    return "FINANCE_ACCOUNTING_TTGDTX";
  }

  if (/cthssv/i.test(filePath)) {
    return "CTHSSV";
  }

  if (/khoa|giang_vien|GIANG_VIEN/i.test(filePath)) {
    return "KHOA_GIANG_VIEN";
  }

  if (/short-course|SHORT_COURSE|TRAINING|training-module/i.test(filePath)) {
    return "SHORT_COURSE_TRAINING";
  }

  if (/^scripts\/audit-|release-gates|data-foundation|p0-register|hard-delete|audit-trail/i.test(filePath)) {
    return "AUDIT_RELEASE_SCRIPTS";
  }

  if (
    /^(AGENTS\.md|package\.json|docs\/HEU_(CURRENT_STATE|SYSTEM_BUILD|MODULE_READINESS|IMPLEMENTATION|CODEX|DATA_MASTER|REPORT_VIEW|SQL_OBJECT|REAL_DATA|SYSTEM_FRAMEWORK)|docs\/TTGDTX_9PLUS)/i.test(filePath)
  ) {
    return "GOVERNANCE_SHARED_DOCS";
  }

  if (
    /^(app|components)\/(audit|followups|leads|login|page|pipeline|reports|search|segments|dashboard|layout)/i.test(filePath) ||
    /seed_sample_leads|reports-dashboard|pipeline-followup/i.test(filePath)
  ) {
    return "CRM_NAV_REPORT_SHARED";
  }

  return "UNKNOWN_OTHER";
}

function printList(label, values, limit = 10) {
  if (values.length === 0) {
    return;
  }

  console.log(`${label}: count=${values.length}`);
  for (const value of values.slice(0, limit)) {
    console.log(`- ${value}`);
  }
  if (values.length > limit) {
    console.log(`- ... +${values.length - limit} more`);
  }
}

const statusResult = runGit(["status", "--short", "--branch"]);
const diffResult = runGit(["diff", "--name-status"]);
const untrackedResult = runGit(["ls-files", "-o", "--exclude-standard"]);

console.log("HEU AI workstream scope router");
console.log("Mode: PASS_LOCAL read-only routing. No user creation, password handling, email, task, migration, UAT, evidence acceptance, finance reliance, owner GO or production GO.");

if (statusResult.status !== 0 || diffResult.status !== 0 || untrackedResult.status !== 0) {
  console.error("AI_WORKSTREAM_ROUTER_READY: BLOCKED - local Git state could not be read.");
  process.exit(1);
}

const statusLines = statusResult.stdout.split(/\r?\n/).filter(Boolean);
const branch = statusLines.find((line) => line.startsWith("## "))?.slice(3) ?? "UNKNOWN_BRANCH";
const changedEntries = statusLines.filter((line) => !line.startsWith("## "));
const changedPaths = changedEntries.map(pathFromStatusLine);
const untrackedPaths = untrackedResult.stdout
  .split(/\r?\n/)
  .filter(Boolean)
  .map(normalizePath);

for (const filePath of changedPaths) {
  lanes.get(laneForPath(filePath)).push(filePath);
}

const activeBusinessLanes = businessLaneOrder.filter((lane) => lanes.get(lane).length > 0);
const activeSharedLanes = ["AUDIT_RELEASE_SCRIPTS", "GOVERNANCE_SHARED_DOCS", "UNKNOWN_OTHER"].filter(
  (lane) => lanes.get(lane).length > 0,
);
const sharedDirtyPaths = changedPaths.filter((filePath) =>
  sharedPathPatterns.some((pattern) => pattern.test(filePath)),
);
const conflictedPaths = changedEntries
  .filter((line) => /^(UU|AA|DD|AU|UA|DU|UD) /.test(line))
  .map(pathFromStatusLine);

console.log(`AI_WORKSTREAM_BRANCH: ${branch}`);
console.log(
  `AI_WORKSTREAM_COUNTS: changed=${changedEntries.length}; untracked=${untrackedPaths.length}; business_lanes=${activeBusinessLanes.length}; shared_lanes=${activeSharedLanes.length}; shared_dirty=${sharedDirtyPaths.length}; conflicted=${conflictedPaths.length}`,
);

for (const [lane, files] of lanes) {
  printList(`AI_WORKSTREAM_LANE ${lane}`, files, 8);
}

printList("AI_WORKSTREAM_SHARED_DIRTY", sharedDirtyPaths, 12);
printList("AI_WORKSTREAM_CONFLICTED", conflictedPaths, 12);

const sortedBusinessLanes = activeBusinessLanes
  .map((lane) => ({ lane, count: lanes.get(lane).length }))
  .sort((a, b) => a.count - b.count || a.lane.localeCompare(b.lane));
const nextLane = sortedBusinessLanes[0]?.lane ?? "NONE";

if (conflictedPaths.length > 0) {
  console.log("CURRENT_ROUTE_DECISION: BLOCKED - conflicted files must be resolved by the owning human/IT lane before packaging.");
} else if (activeBusinessLanes.length > 1 || (activeBusinessLanes.length > 0 && sharedDirtyPaths.length > 0)) {
  console.log("CURRENT_ROUTE_DECISION: NO_GO - mixed workstreams are dirty; package exactly one lane and use hunk-level staging for shared files.");
} else if (activeBusinessLanes.length === 1) {
  console.log(`CURRENT_ROUTE_DECISION: READY_FOR_SINGLE_LANE_REVIEW - ${activeBusinessLanes[0]}`);
} else if (changedEntries.length > 0) {
  console.log("CURRENT_ROUTE_DECISION: NO_GO - only shared/unknown files are dirty; classify the owning lane before packaging.");
} else {
  console.log("CURRENT_ROUTE_DECISION: CLEAN - no dirty workstream detected.");
}

console.log(`NEXT_SAFE_LANE: ${nextLane}`);
console.log("NEXT_SAFE_RULE: read every selected diff, do not edit or stage other lanes, then run focused audit plus baseline PASS_LOCAL checks.");
console.log("AI_WORKSTREAM_ROUTER_READY: PASS_LOCAL_CONTROL");
