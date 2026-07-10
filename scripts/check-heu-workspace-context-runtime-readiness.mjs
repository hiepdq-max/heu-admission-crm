import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const contextPath = "lib/heu-workspace-context.ts";
const workspacePath = "lib/workspace.ts";
const reportsPath = "app/reports/page.tsx";
const planPath =
  "docs/HEU_CONTROL/HEU_PERF_003_HEU_WORKSPACE_CONTEXT_RUNTIME_PLAN_20260707.md";
const guardPath =
  "docs/HEU_CONTROL/HEU_PERF_004_SCOPE_FIRST_QUERY_GUARD_CHECKLIST_20260707.md";
const buildRoadmapPath =
  "docs/HEU_CONTROL/HEU_BUILD_001_MASTER_ROADMAP_AND_USER_PILOT_PLAN_20260710.md";
const readmePath = "docs/HEU_CONTROL/README.md";
const packagePath = "package.json";
const checkerPath = "scripts/check-heu-workspace-context-runtime-readiness.mjs";
const checkerAlias = "check:heu-workspace-context-runtime-readiness";
const checkerCommand = `node ${checkerPath}`;

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function fail(message) {
  failures.push(message);
}

function requireFile(relativePath) {
  if (!existsSync(absolute(relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function read(relativePath) {
  return readFileSync(absolute(relativePath), "utf8");
}

function requireTokens(contents, tokens, label, file) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      fail(`${file}: missing ${label}: ${token}`);
    }
  }
}

function requireOrder(contents, orderedTokens, label, file) {
  let cursor = -1;

  for (const token of orderedTokens) {
    const next = contents.indexOf(token, cursor + 1);

    if (next === -1) {
      fail(`${file}: missing ordered ${label}: ${token}`);
      return;
    }

    cursor = next;
  }
}

function forbidPatterns(contents, patterns, label, file) {
  for (const item of patterns) {
    if (item.pattern.test(contents)) {
      fail(`${file}: forbidden ${label}: ${item.label}`);
    }
  }
}

for (const file of [
  contextPath,
  workspacePath,
  reportsPath,
  planPath,
  guardPath,
  buildRoadmapPath,
  readmePath,
  packagePath,
  checkerPath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const context = read(contextPath);
  const workspace = read(workspacePath);
  const reports = read(reportsPath);
  const plan = read(planPath);
  const guard = read(guardPath);
  const buildRoadmap = read(buildRoadmapPath);
  const readme = read(readmePath);
  const checker = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    context,
    [
      "export type HEUScopeDecision",
      '"SCOPED"',
      '"ALL_READONLY"',
      '"NO_SCOPE"',
      '"BLOCKED"',
      "export type HEUAllowedActions",
      "export type HEUWorkspaceContext",
      "authUserId: string",
      "crmUserId: string | null",
      "roleCode: string | null",
      "orgUnitCode: string | null",
      "activeWorkspaceId: string | null",
      "visibleSegmentIds: string[]",
      "canSeeAllSegments: boolean",
      "scopeDecision: HEUScopeDecision",
      "allowedActions: HEUAllowedActions",
      "noSecretBoundary: true",
      "deriveScopeDecision",
      "return \"BLOCKED\"",
      "return \"ALL_READONLY\"",
      "return \"SCOPED\"",
      "return \"NO_SCOPE\"",
      "getAdmissionWorkspaceContext",
      "applyAdmissionSegmentIds",
      "getHEUAdmissionSegmentIds",
      "applyHEUSegmentScope",
      "getHEUWorkspaceContext",
      "create: false",
      "update: false",
      "review: false",
      "approve: false",
      "pay: false",
      "admin: false",
    ],
    "HEU workspace context token",
    contextPath,
  );

  requireOrder(
    context,
    [
      "const [",
      "getAdmissionWorkspaceContext",
      "deriveScopeDecision",
      "const allowedActions",
      "return {",
      "noSecretBoundary: true",
    ],
    "context resolve-before-return flow",
    contextPath,
  );

  forbidPatterns(
    context,
    [
      { label: "insert mutation", pattern: /\.insert\s*\(/ },
      { label: "update mutation", pattern: /\.update\s*\(/ },
      { label: "upsert mutation", pattern: /\.upsert\s*\(/ },
      { label: "delete mutation", pattern: /\.delete\s*\(/ },
      { label: "service role token", pattern: /service[_-]?role/i },
      { label: "process env access", pattern: /process\.env/ },
      { label: "network fetch", pattern: /\bfetch\s*\(/ },
    ],
    "runtime context mutation or secret path",
    contextPath,
  );

  requireTokens(
    workspace,
    [
      "export type AdmissionWorkspaceContext",
      "admissionWorkspaceSegmentIds",
      "applyAdmissionSegmentIds",
      "NO_MATCH_SEGMENT_ID",
      "current_user_admission_workspaces",
      "user_admission_segment_scopes",
      "canSeeAllSegments",
    ],
    "legacy workspace helper token",
    workspacePath,
  );

  requireTokens(
    reports,
    [
      "getHEUWorkspaceContext",
      "applyHEUSegmentScope",
      "type HEUWorkspaceContext",
      "workspaceContext.allowedActions.read",
      'workspaceContext.scopeDecision === "BLOCKED"',
      'workspaceContext.scopeDecision === "NO_SCOPE"',
      "khong doc business rows",
      "khong fallback sang broad query",
      "REPORTS_LEAD_QUERY_LIMIT = 500",
      ".limit(REPORTS_LEAD_QUERY_LIMIT)",
      "REPORTS_LOOKUP_QUERY_LIMIT = 200",
    ],
    "reports pilot scope-first token",
    reportsPath,
  );

  requireOrder(
    reports,
    [
      "const workspaceContext = await getHEUWorkspaceContext",
      "if (!workspaceContext.allowedActions.read)",
      'if (workspaceContext.scopeDecision === "BLOCKED")',
      'if (workspaceContext.scopeDecision === "NO_SCOPE")',
      "applyHEUSegmentScope",
      '.from("leads")',
    ],
    "reports context-before-query flow",
    reportsPath,
  );

  if (reports.includes(".limit(5000)")) {
    fail(`${reportsPath}: reports must not keep broad .limit(5000)`);
  }

  requireTokens(
    plan,
    [
      "HEU-PERF-003-HEU-WORKSPACE-CONTEXT-RUNTIME-PLAN",
      "HEU-PERF-003R-WORKSPACE-CONTEXT-RUNTIME-READINESS-CHECK",
      "lib/heu-workspace-context.ts",
      "app/reports/page.tsx",
      "scopeDecision",
      "allowedActions",
      "NO_SCOPE",
      "BLOCKED",
      "Production status: NO-GO",
    ],
    "plan/checker token",
    planPath,
  );

  requireTokens(
    guard,
    [
      "HEUWorkspaceContext",
      "applyHEUSegmentScope",
      "QG-CONTEXT",
      "QG-LEADS-SCOPED",
    ],
    "scope-first guard token",
    guardPath,
  );

  requireTokens(
    buildRoadmap,
    [
      "One main modular monolith app",
      "One shared database, separated by workspace, role, and scope",
      "HEUWorkspaceContext",
      "Each department sees only its own permitted work and data",
      "Production remains NO-GO",
    ],
    "build roadmap token",
    buildRoadmapPath,
  );

  requireTokens(
    readme,
    [
      "HEU_PERF_003_HEU_WORKSPACE_CONTEXT_RUNTIME_PLAN_20260707.md",
      "HEU-PERF-003R workspace context runtime readiness checker",
      "V03",
    ],
    "README checker token",
    readmePath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checker,
    [
      "existsSync",
      "readFileSync",
      "HEU_WORKSPACE_CONTEXT_RUNTIME_READY: PASS_LOCAL",
      "NO_SCOPE_OVERFLOW: context checker only; no database migration, no broad fallback, no write mutation, no AI runtime, no production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    checker,
    [
      { label: "node child_process import", pattern: /from\s+["']node:child_process["']/ },
      { label: "child_process import", pattern: /from\s+["']child_process["']/ },
      { label: "execSync call", pattern: /\bexecSync\s*\(/ },
      { label: "spawn call", pattern: /\bspawn\s*\(/ },
      { label: "writeFileSync call", pattern: /\bwriteFileSync\s*\(/ },
      { label: "appendFileSync call", pattern: /\bappendFileSync\s*\(/ },
      { label: "unlinkSync call", pattern: /\bunlinkSync\s*\(/ },
      { label: "rmSync call", pattern: /\brmSync\s*\(/ },
      { label: "renameSync call", pattern: /\brenameSync\s*\(/ },
      { label: "mkdirSync call", pattern: /\bmkdirSync\s*\(/ },
      { label: "network fetch", pattern: /\bfetch\s*\(/ },
    ],
    "mutation, network or command-execution API",
    checkerPath,
  );
}

if (failures.length > 0) {
  console.error("HEU workspace context runtime readiness failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Workspace Context runtime readiness check");
console.log("HEU_WORKSPACE_CONTEXT_RUNTIME_READY: PASS_LOCAL");
console.log(
  "NO_SCOPE_OVERFLOW: context checker only; no database migration, no broad fallback, no write mutation, no AI runtime, no production GO",
);
