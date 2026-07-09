import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const blueprintPath =
  "docs/HEU_CONTROL/HEU_AI_COST_001_CREDIT_GUARD_BLUEPRINT_20260709.md";
const checkerDocPath =
  "docs/HEU_CONTROL/HEU_AI_COST_002_STATIC_CHECKER_20260709.md";
const packagePath = "package.json";
const checkerScriptPath =
  "scripts/check-heu-ai-cost-002-static-checker-readiness.mjs";
const checkerAlias = "check:heu-ai-cost-002-static-checker-readiness";
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

for (const file of [blueprintPath, checkerDocPath, packagePath, checkerScriptPath]) {
  requireFile(file);
}

if (failures.length === 0) {
  const blueprint = read(blueprintPath);
  const checkerDoc = read(checkerDocPath);
  const checkerScript = read(checkerScriptPath);
  const packageJson = JSON.parse(read(packagePath));

  requireTokens(
    blueprint,
    [
      "HEU-AI-COST-001-CREDIT-GUARD-BLUEPRINT",
      "Scope: docs-only blueprint, no runtime code",
      "Không được sửa code ngay. Hãy phân tích rủi ro và đề xuất phương án an toàn trước.",
      "ít automation step, ít AI call",
      "không thêm dịch vụ trả phí mới nếu không cần",
      "có log và có công tắc bật/tắt",
      "Cost Guard Principle",
      "Automation Step Budget",
      "AI Call Budget",
      "AI_MAX_CALLS_PER_RUN = 0",
      "AI_DRY_RUN = true",
      "AI_PROVIDER = none",
      "AI_CREDIT_GUARD_ENABLED",
      "AI_ALLOW_PAID_AUTOMATION",
      "Kill switch rule",
      "Logging Contract",
      "No raw PII",
      "Do not combine this slice with:",
      "Runtime AI Agent readiness remains `NO_GO`",
      "Production remains `NO-GO`",
    ],
    "cost-guard blueprint token",
    blueprintPath,
  );

  requireTokens(
    checkerDoc,
    [
      "HEU-AI-COST-002-STATIC-CHECKER",
      "local static checker",
      checkerAlias,
      checkerScriptPath,
      "The checker must not:",
      "No database backup is required",
      "node --check scripts/check-heu-ai-cost-002-static-checker-readiness.mjs",
      "npm.cmd run check:heu-ai-cost-002-static-checker-readiness",
      "Runtime AI Agent readiness remains `NO_GO`",
      "Production remains `NO-GO`",
    ],
    "checker-doc token",
    checkerDocPath,
  );

  if (packageJson.scripts?.[checkerAlias] !== checkerCommand) {
    fail(`${packagePath}: missing or mismatched ${checkerAlias}`);
  }

  requireTokens(
    checkerScript,
    [
      "readFileSync",
      "existsSync",
      "HEU_AI_COST_002_STATIC_CHECKER_READY: PASS_LOCAL",
      "NO_RUNTIME_AI_COST_AUTOMATION: no OpenAI call, no prompt/output storage, no paid automation, no SQL, no migration, no deploy, no install, no account/scope mutation, no finance action, no production GO",
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
  console.error("HEU AI Cost 002 static checker readiness failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU AI Cost 002 static checker readiness check");
console.log("HEU_AI_COST_002_STATIC_CHECKER_READY: PASS_LOCAL");
console.log(
  "NO_RUNTIME_AI_COST_AUTOMATION: no OpenAI call, no prompt/output storage, no paid automation, no SQL, no migration, no deploy, no install, no account/scope mutation, no finance action, no production GO",
);
