import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const scanRoot = path.join(repoRoot, "app", "ttgdtx");
const failures = [];

function fail(message) {
  failures.push(message);
}

function walk(currentPath, results = []) {
  const stats = statSync(currentPath);

  if (stats.isDirectory()) {
    for (const child of readdirSync(currentPath)) {
      walk(path.join(currentPath, child), results);
    }
    return results;
  }

  if (stats.isFile() && path.basename(currentPath) === "page.tsx") {
    results.push(currentPath);
  }

  return results;
}

function relativePath(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function lineNumber(contents, index) {
  return contents.slice(0, index).split(/\r?\n/).length;
}

function findBlockEnd(contents, openBraceIndex) {
  let depth = 0;

  for (let index = openBraceIndex; index < contents.length; index += 1) {
    const char = contents[index];

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function guardedByAccessCheck(contents, queryIndex) {
  const accessGuardPattern = /if\s*\(\s*(canOpen|canManage)\s*\)\s*\{/g;
  let match;

  while ((match = accessGuardPattern.exec(contents)) !== null) {
    const guardIndex = match.index;

    if (guardIndex > queryIndex) {
      break;
    }

    const openBraceIndex = contents.indexOf("{", guardIndex);
    const blockEndIndex = findBlockEnd(contents, openBraceIndex);

    if (blockEndIndex !== -1 && queryIndex > openBraceIndex && queryIndex < blockEndIndex) {
      return true;
    }
  }

  return false;
}

const pageFiles = walk(scanRoot);
const businessQueryPattern = /\.from\(\s*["'`](ttgdtx_[^"'`]+)["'`]\s*\)/g;

for (const filePath of pageFiles) {
  const relative = relativePath(filePath);
  const contents = readFileSync(filePath, "utf8");
  const matches = [...contents.matchAll(businessQueryPattern)];

  for (const match of matches) {
    const tableName = match[1];
    const queryIndex = match.index ?? 0;

    if (!guardedByAccessCheck(contents, queryIndex)) {
      fail(
        `${relative}:${lineNumber(contents, queryIndex)}: ${tableName} query must be inside if (canOpen) or if (canManage)`,
      );
    }
  }
}

const simulationPath = path.join(scanRoot, "simulation", "page.tsx");
const simulationContents = readFileSync(simulationPath, "utf8");

for (const guard of [
  "canReadContracts",
  "canReadPolicies",
  "canReadReceivables",
]) {
  if (!simulationContents.includes(guard)) {
    fail(`app/ttgdtx/simulation/page.tsx: missing ${guard} scoped fetch guard`);
  }
}

const simulationScopedChecks = [
  {
    label: "contract readiness",
    pattern:
      /if\s*\(\s*canReadContracts\s*\)\s*\{[\s\S]*\.from\(\s*"ttgdtx_partner_contract_readiness"/,
  },
  {
    label: "tuition policy readiness",
    pattern:
      /if\s*\(\s*canReadPolicies\s*\)\s*\{[\s\S]*\.from\(\s*"ttgdtx_tuition_policy_readiness"/,
  },
  {
    label: "receivable readiness",
    pattern:
      /if\s*\(\s*canReadReceivables\s*\)\s*\{[\s\S]*\.from\(\s*"ttgdtx_receivable_candidate_leads"/,
  },
  {
    label: "student receivable readiness",
    pattern:
      /if\s*\(\s*canReadReceivables\s*\)\s*\{[\s\S]*\.from\(\s*"ttgdtx_student_receivable_readiness"/,
  },
];

for (const check of simulationScopedChecks) {
  if (!check.pattern.test(simulationContents)) {
    fail(
      `app/ttgdtx/simulation/page.tsx: missing ${check.label} query under its scoped read guard`,
    );
  }
}

if (failures.length > 0) {
  console.error("TTGDTX data-fetch gate audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `TTGDTX data-fetch gate audit passed. Checked ${pageFiles.length} TTGDTX pages.`,
);
