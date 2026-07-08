import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const blueprintPath =
  "docs/HEU_CONTROL/HEU_AI_001_CONTROL_AUDIT_AGENT_BLUEPRINT_20260709.md";
const ownerReviewPath =
  "docs/HEU_CONTROL/HEU_AI_001_OWNER_REVIEW_CONTROL_AUDIT_AGENT_20260709.md";
const checkerDocPath =
  "docs/HEU_CONTROL/HEU_AI_002_STATIC_CHECKER_CONTROL_AUDIT_AGENT_BLUEPRINT_20260709.md";
const readmePath = "docs/HEU_CONTROL/README.md";
const prSplitPath = "docs/HEU_CONTROL/PR_SPLIT_REGISTER_20260707.md";
const packagePath = "package.json";
const checkerScriptPath = "scripts/check-heu-ai-002-static-checker-readiness.mjs";
const checkerAlias = "check:heu-ai-002-static-checker-readiness";
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

for (const file of [
  blueprintPath,
  ownerReviewPath,
  checkerDocPath,
  readmePath,
  prSplitPath,
  packagePath,
  checkerScriptPath,
]) {
  requireFile(file);
}

if (failures.length === 0) {
  const blueprint = read(blueprintPath);
  const ownerReview = read(ownerReviewPath);
  const checkerDoc = read(checkerDocPath);
  const readme = read(readmePath);
  const prSplit = read(prSplitPath);
  const checkerScript = read(checkerScriptPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    blueprint,
    [
      "HEU-AI-001-CONTROL-AUDIT-AGENT-BLUEPRINT",
      "HEU Controlled AI Operating System",
      "Control/Audit Agent",
      "Draft only",
      "No approval",
      "No real-data mutation",
      "Production status: NO-GO",
      "Runtime AI Agent readiness remains `NO_GO`",
      "Do not stage, commit, push or create PR automatically.",
      "Do not create users, grant scope, assign roles or send email.",
      "npm install",
      "npm ci",
      "npm.cmd install",
      "npm.cmd ci",
      "supabase db push",
      "git reset --hard",
      "service-role keys",
      "PHAP_CHE",
      "IT_DATA",
      "Audit",
      "BGH",
    ],
    "blueprint hard-stop token",
    blueprintPath,
  );

  requireTokens(
    ownerReview,
    [
      "HEU-AI-001-OWNER-REVIEW-CONTROL-AUDIT-AGENT",
      "HEU-AI-002-STATIC-CHECKER-CONTROL-AUDIT-AGENT-BLUEPRINT",
      "IT_DATA",
      "Audit",
      "BGH",
      "PHAP_CHE",
      "DAT_TAM_THOI",
      "CHO_BGH_DUYET",
      "Runtime AI Agent readiness remains `NO_GO`",
      "Production remains `NO-GO`",
      "The checker must not run install, migration, SQL, deploy, live Supabase",
    ],
    "owner-review token",
    ownerReviewPath,
  );

  requireTokens(
    checkerDoc,
    [
      "HEU-AI-002-STATIC-CHECKER-CONTROL-AUDIT-AGENT-BLUEPRINT",
      "local read-only document checker",
      checkerAlias,
      "This checker does not:",
      "No database backup is required",
      "node --check scripts/check-heu-ai-002-static-checker-readiness.mjs",
      "npm.cmd run check:heu-ai-002-static-checker-readiness",
      "Runtime AI Agent readiness remains `NO_GO`",
      "Production remains `NO-GO`",
      "HEU-AI-003-CONTROL-AUDIT-AGENT-DRY-RUN-PR-SPLIT",
    ],
    "checker-doc token",
    checkerDocPath,
  );

  requireTokens(
    readme,
    [
      "HEU_AI_001_CONTROL_AUDIT_AGENT_BLUEPRINT_20260709.md",
      "HEU_AI_001_OWNER_REVIEW_CONTROL_AUDIT_AGENT_20260709.md",
      "HEU_AI_002_STATIC_CHECKER_CONTROL_AUDIT_AGENT_BLUEPRINT_20260709.md",
      "V26",
      "HEU-AI-002 static checker",
    ],
    "README index token",
    readmePath,
  );

  requireTokens(
    prSplit,
    [
      "18.2 | HEU-AI-001-CONTROL-AUDIT-AGENT-BLUEPRINT",
      "18.3 | HEU-AI-001-OWNER-REVIEW-CONTROL-AUDIT-AGENT",
      "18.4 | HEU-AI-002-STATIC-CHECKER-CONTROL-AUDIT-AGENT-BLUEPRINT",
      "one docs/control doc + one checker script + one package alias",
      "Apply `HEU-AI-002` before any read-only dry-run Control/Audit Agent command",
      "runtime AI worker",
      "OpenAI API call",
      "SQL",
      "finance",
      ".codex",
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
      "readFileSync",
      "existsSync",
      "HEU_AI_002_STATIC_CHECKER_READY: PASS_LOCAL",
      "NO_RUNTIME_AI: no OpenAI call, no prompt/output storage, no SQL, no migration, no deploy, no install, no account/scope mutation, no finance action, no production GO",
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
  console.error("HEU AI 002 static checker readiness failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU AI 002 static checker readiness check");
console.log("HEU_AI_002_STATIC_CHECKER_READY: PASS_LOCAL");
console.log(
  "NO_RUNTIME_AI: no OpenAI call, no prompt/output storage, no SQL, no migration, no deploy, no install, no account/scope mutation, no finance action, no production GO",
);
