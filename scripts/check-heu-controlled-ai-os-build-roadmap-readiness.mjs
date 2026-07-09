import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const roadmapPath =
  "docs/HEU_CONTROL/HEU_CONTROLLED_AI_OS_BUILD_ROADMAP_20260709.md";
const packagePath = "package.json";
const checkerScriptPath =
  "scripts/check-heu-controlled-ai-os-build-roadmap-readiness.mjs";
const checkerAlias = "check:heu-controlled-ai-os-build-roadmap-readiness";
const checkerCommand = `node ${checkerScriptPath}`;

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

for (const file of [roadmapPath, packagePath, checkerScriptPath]) {
  requireFile(file);
}

if (failures.length === 0) {
  const roadmap = read(roadmapPath);
  const packageJson = JSON.parse(read(packagePath));
  const checkerScript = read(checkerScriptPath);

  requireTokens(
    roadmap,
    [
      "HEU-BUILD-ROADMAP-001-CONTROLLED-AI-OS",
      "One main modular monolith app, not one app per module",
      "One shared database, separated by workspace, role and scope",
      "Each department/user sees only their authorized data and tasks",
      "Draft, check and suggest only; no real-data mutation",
      "Few automation steps, few AI calls, no new paid service unless required",
      "Small PRs, focused checks, clear rollback",
      "Production status: NO-GO",
      "docs/HEU_CONTROL",
      "HEUWorkspaceContext",
      "AI cost guard",
      "Use `npm.cmd`; no install/migration/deploy by default",
      "User/Role",
      "Workspace scope",
      "Audit log",
      "Task Center",
      "Data Confirmation",
      "Student/profile master",
      "Admissions lead",
      "File registry",
      "Tuyen sinh",
      "CTHSSV",
      "Ke toan",
      "Dao tao/Khoa",
      "HOU",
      "Finance And HOU With Controls",
      "AI Agent With Cost Guard",
      "Control Agent",
      "Audit Agent",
      "Data Quality Agent",
      "Workflow Agent",
      "Finance Guard Agent",
      "Legal/SOP Agent",
      "DAT_TAM_THOI_CONTROLLED_PILOT",
      "Do not buy or enable a new paid service until there is:",
      "Runtime completion remains `NO_GO`",
      "Production remains `NO-GO`",
    ],
    "roadmap control token",
    roadmapPath,
  );

  requireTokens(
    roadmap,
    [
      "split HEU into multiple production apps before the shared scope model is",
      "call AI before deterministic filters, logging and kill switch exist",
      "run migration, deploy, Supabase push, install or CI without explicit approved",
      "let AI approve, pay, admit, mark revenue, write real data, send official",
    ],
    "stop-rule token",
    roadmapPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "readFileSync",
      "existsSync",
      "HEU_CONTROLLED_AI_OS_BUILD_ROADMAP_READY: PASS_LOCAL",
      "NO_RUNTIME_CHANGE: docs/control roadmap checker only; no app, database, SQL, migration, AI provider, paid automation, finance action or production GO",
    ],
    "checker-script read-only token",
    checkerScriptPath,
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
    ],
    "mutation or command-execution API",
    checkerScriptPath,
  );
}

if (failures.length > 0) {
  console.error("HEU Controlled AI OS build roadmap readiness failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Controlled AI OS build roadmap readiness check");
console.log("HEU_CONTROLLED_AI_OS_BUILD_ROADMAP_READY: PASS_LOCAL");
console.log(
  "NO_RUNTIME_CHANGE: docs/control roadmap checker only; no app, database, SQL, migration, AI provider, paid automation, finance action or production GO",
);
