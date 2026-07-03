import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docPath = "docs/HEU_AI_DIRTY_SCOPE_PACKAGING_LEDGER_20260703.md";
const packagePath = "package.json";
const failures = [];

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

function requireTokens(contents, tokens, label, file) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      failures.push(`${file}: missing ${label}: ${token}`);
    }
  }
}

for (const file of [docPath, packagePath]) {
  requireFile(file);
}

const doc = exists(docPath) ? read(docPath) : "";
const packageJson = exists(packagePath) ? JSON.parse(read(packagePath)) : { scripts: {} };

requireTokens(
  doc,
  [
    "DIRTY_SCOPE_PACKAGING_LEDGER_READY / MIXED_DIRTY / BLOCKED",
    "ACCOUNTING_ACCT",
    "ADMISSIONS_CRM",
    "P0_17_USER_SCOPE",
    "SHORT_COURSE_TRN",
    "SHARED_CONTROL",
    "BGH_EXECUTIVE",
    "REPORT_VIEW_DATA_MASTER",
    "FINANCE_DAY1",
    "DATABASE_SQL",
    "ERR-PKG-01",
    "ERR-PKG-02",
    "ERR-PKG-03",
    "ERR-PKG-04",
    "ERR-PKG-05",
    "HUNK_STAGE_REQUIRED",
    "FOCUSED_GUARDS_GREEN_BUT_SHARED_HUNKS_MIXED",
    "SHORT_COURSE_TRN_SHARED_HUNK_PACKAGE",
    "ACCOUNTING_ACCT_CHILD_CHECKERS",
    "ADMISSIONS_CRM_LOCAL_COMPLETION",
    "P0_17_USER_SCOPE_SECURITY",
    "BGH_EXECUTIVE_DASHBOARD_SHELL",
    "FINANCE_DAY1_SMALL_CANDIDATE",
    "git diff --cached --check",
    "Do not use broad `git add .`",
    "modify business data",
    "create accounts",
    "handle passwords",
    "mark production GO",
  ],
  "dirty-scope packaging ledger contract",
  docPath,
);

for (const [lane, count] of [
  ["ACCOUNTING_ACCT", "25"],
  ["ADMISSIONS_CRM", "24"],
  ["P0_17_USER_SCOPE", "16"],
  ["SHORT_COURSE_TRN", "14"],
  ["SHARED_CONTROL", "12"],
  ["UNKNOWN_OR_MANUAL", "10"],
  ["AUDIT_PRODUCTION_READINESS", "9"],
  ["BGH_EXECUTIVE", "6"],
  ["REPORT_VIEW_DATA_MASTER", "5"],
  ["FINANCE_DAY1", "2"],
  ["DATABASE_SQL", "1"],
]) {
  requireTokens(doc, [`| ${lane} | ${count} |`], "live dirty snapshot count", docPath);
}

if (
  packageJson.scripts?.["check:heu-ai-dirty-scope-packaging-ledger"] !==
  "node scripts/check-heu-ai-dirty-scope-packaging-ledger.mjs"
) {
  failures.push(`${packagePath}: missing check:heu-ai-dirty-scope-packaging-ledger script`);
}

if (failures.length > 0) {
  console.error("HEU AI dirty-scope packaging ledger check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU AI dirty-scope packaging ledger check passed.");
console.log("DIRTY_SCOPE_PACKAGING_LEDGER_READY: PASS_LOCAL_CONTROL");
console.log("Mode: routing only; no production, UAT, finance, evidence, owner, account, email, task or migration approval.");
