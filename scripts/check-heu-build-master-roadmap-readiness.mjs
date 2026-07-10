import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const roadmapPath =
  "docs/HEU_CONTROL/HEU_BUILD_001_MASTER_ROADMAP_AND_USER_PILOT_PLAN_20260710.md";
const readmePath = "docs/HEU_CONTROL/README.md";
const prSplitPath = "docs/HEU_CONTROL/PR_SPLIT_REGISTER_20260707.md";
const packagePath = "package.json";
const checkerPath = "scripts/check-heu-build-master-roadmap-readiness.mjs";
const checkerAlias = "check:heu-build-master-roadmap-readiness";
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

function forbidPatterns(contents, patterns, label, file) {
  for (const item of patterns) {
    if (item.pattern.test(contents)) {
      fail(`${file}: forbidden ${label}: ${item.label}`);
    }
  }
}

for (const file of [
  roadmapPath,
  readmePath,
  prSplitPath,
  packagePath,
  checkerPath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const roadmap = read(roadmapPath);
  const readme = read(readmePath);
  const prSplit = read(prSplitPath);
  const checkerScript = read(checkerPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    roadmap,
    [
      "HEU-BUILD-001-MASTER-ROADMAP-AND-USER-PILOT-PLAN",
      "Build HEU as one main production-ready app used early by real users",
      "One main modular monolith app",
      "One shared database, separated by workspace, role, and scope",
      "Each department sees only its own permitted work and data",
      "Draft, check, and suggest only; no real-data mutation",
      "Few automation steps, few AI calls, no paid service unless justified",
      "Small PRs, focused checks, clear rollback",
      "Production status: NO-GO",
      "Do not create separate apps per department in this phase",
      "Do not run migrations without backup, rollback, order, and approval",
      "AI cannot approve, pay, issue SOP, mutate real data, or unlock production",
      "No paid/broad automation before a filter, log, and kill switch exist",
      "Keep HOU separated from internal HEU training data and authority",
      "HEUWorkspaceContext",
      "Task Center",
      "Data Confirmation",
      "Admission",
      "CTHSSV",
      "Finance",
      "Training/Khoa",
      "BGH dashboard",
      "HEU-BUILD-002-ROADMAP-STATIC-CHECKER",
      "HEU-PERF-003R-WORKSPACE-CONTEXT-RUNTIME-READINESS-CHECK",
      "Conclusion status: CAN_SUA",
      "Production remains NO-GO",
    ],
    "roadmap control token",
    roadmapPath,
  );

  requireTokens(
    readme,
    [
      "HEU_BUILD_001_MASTER_ROADMAP_AND_USER_PILOT_PLAN_20260710.md",
      "HEU-BUILD-001 master roadmap",
      "V02",
    ],
    "README routing token",
    readmePath,
  );

  requireTokens(
    prSplit,
    [
      "HEU-BUILD-001-MASTER-ROADMAP-AND-USER-PILOT-PLAN",
      "HEU-BUILD-002-ROADMAP-STATIC-CHECKER",
      "one roadmap doc + one read-only checker script + one package alias",
      "No runtime, DB, migration, AI call, automation or production GO",
    ],
    "PR split token",
    prSplitPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "existsSync",
      "readFileSync",
      "HEU_BUILD_MASTER_ROADMAP_READY: PASS_LOCAL",
      "NO_RUNTIME_CHANGE: roadmap checker only; no separate app, no database migration, no AI runtime, no paid automation, no production GO",
    ],
    "checker-script read-only token",
    checkerPath,
  );

  forbidPatterns(
    checkerScript,
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
      { label: "fetch call", pattern: /\bfetch\s*\(/ },
    ],
    "mutation, network or command-execution API",
    checkerPath,
  );
}

if (failures.length > 0) {
  console.error("HEU build master roadmap readiness failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Build master roadmap readiness check");
console.log("HEU_BUILD_MASTER_ROADMAP_READY: PASS_LOCAL");
console.log(
  "NO_RUNTIME_CHANGE: roadmap checker only; no separate app, no database migration, no AI runtime, no paid automation, no production GO",
);
