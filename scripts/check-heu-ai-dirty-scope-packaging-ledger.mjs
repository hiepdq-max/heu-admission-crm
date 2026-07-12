import { spawnSync } from "node:child_process";
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

function git(args) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 4,
    windowsHide: true,
  });

  if (result.error || result.status !== 0) {
    return {
      ok: false,
      output: "",
      error:
        result.error?.code ??
        result.stderr?.trim() ??
        `exit_${result.status ?? "unknown"}`,
    };
  }

  return {
    ok: true,
    output: (result.stdout ?? "").trimEnd(),
  };
}

function parseStatusLine(line) {
  const code = line.slice(0, 2);
  const filePath = line.slice(3).replace(/^"|"$/g, "");
  return {
    code,
    filePath,
    staged: code[0] !== " " && code[0] !== "?",
    untracked: code === "??",
  };
}

const sharedControlPattern =
  /(^package\.json$|HEU_IMPLEMENTATION_LOG|HEU_CURRENT_STATE_INVENTORY|HEU_SYSTEM_BUILD_BACKLOG|HEU_MODULE_READINESS_GAP_MATRIX|TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST|HEU_CODEX_OPERATING_PLAYBOOK|AGENTS\.md|check-heu-fast-local-loop|audit-heu-current-state-inventory|audit-heu-implementation-log|audit-ttgdtx-release-gates)/i;

const scopeRules = [
  {
    scope: "SHORT_COURSE_TRN",
    test: /short-course|HEU_SHORT_COURSE|HEU_TRAINING_MODULE|check-heu-short-course|check-heu-training/i,
  },
  {
    scope: "ACCOUNTING_ACCT",
    test: /HEU_ACCOUNTING|check-heu-accounting|payment-requests|step10[567]|audit-ttgdtx-(payment|payout)/i,
  },
  {
    scope: "P0_17_USER_SCOPE",
    test: /settings|HEU_USER|HEU_PERMISSION|HEU_NEGATIVE_CONTROL|HEU_POSITION_ASSIGNMENT|SYSTEM_WIDE_PERMISSION|user-account-security|position-assignment|negative-control|user-scope/i,
  },
  {
    scope: "ADMISSIONS_CRM",
    test: /app\/(leads|pipeline|import|followups|segments|search)|components\/(leads|pipeline|followups|segments)|check-heu-(lead|pipeline|reports|admissions|documents)/i,
  },
  {
    scope: "BGH_EXECUTIVE",
    test: /executive|dashboard-overview|HEU_STANDARD_SYSTEM_BLUEPRINT|app\/page\.tsx/i,
  },
  {
    scope: "REPORT_VIEW_DATA_MASTER",
    test: /reports|HEU_REPORT_VIEW|HEU_DATA_MASTER/i,
  },
  {
    scope: "FINANCE_DAY1",
    test: /finance|HEU_FINANCE|check-heu-finance/i,
  },
  {
    scope: "DATABASE_SQL",
    test: /^database\//i,
  },
  {
    scope: "AUDIT_PRODUCTION_READINESS",
    test: /audit|TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST|production-readiness|hard-delete/i,
  },
];

function classify(filePath) {
  if (sharedControlPattern.test(filePath)) {
    return "SHARED_CONTROL";
  }

  const match = scopeRules.find((rule) => rule.test.test(filePath));
  return match?.scope ?? "UNKNOWN_OR_MANUAL";
}

function formatCounts(map) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([scope, count]) => `${scope}=${count}`)
    .join("; ");
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
    "LIVE_DIRTY_SCOPE_SNAPSHOT_REQUIRED / NO_GO / BLOCKED",
    "DIRTY_SCOPE_LIVE_WORKTREE",
    "DIRTY_SCOPE_LIVE_COUNTS",
    "DIRTY_SCOPE_LIVE_SHARED_CONTROL_FILES",
    "live counts as evidence output, not as a hardcoded pass condition",
    "modify business data",
    "create accounts",
    "handle passwords",
    "mark production GO",
  ],
  "dirty-scope packaging ledger contract",
  docPath,
);

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

const branchResult = git(["status", "--short", "--branch"]);
const statusResult = git(["status", "--short"]);

if (!branchResult.ok || !statusResult.ok) {
  console.error("HEU AI dirty-scope packaging ledger check failed.");
  console.error(
    `- Git status unavailable: ${branchResult.error ?? statusResult.error}`,
  );
  process.exit(1);
}

const branch = branchResult.output.split(/\r?\n/)[0] ?? "";
const statusLines = statusResult.output
  .split(/\r?\n/)
  .filter(Boolean)
  .map(parseStatusLine);
const scopeCounts = new Map();
const stagedScopes = new Set();
const sharedFiles = [];

for (const entry of statusLines) {
  const scope = classify(entry.filePath);
  scopeCounts.set(scope, (scopeCounts.get(scope) ?? 0) + 1);

  if (entry.staged) {
    stagedScopes.add(scope);
  }

  if (scope === "SHARED_CONTROL") {
    sharedFiles.push(entry.filePath);
  }
}

const staged = statusLines.filter((entry) => entry.staged).length;
const untracked = statusLines.filter((entry) => entry.untracked).length;
const stagedScopeCount = [...stagedScopes].filter((scope) => scope !== "SHARED_CONTROL").length;
const stageState =
  staged === 0
    ? "CLEAN_INDEX"
    : stagedScopeCount <= 1
      ? "SINGLE_SCOPE_INDEX"
      : "MIXED_SCOPE_INDEX";

console.log("HEU AI dirty-scope packaging ledger check passed.");
console.log(`DIRTY_SCOPE_LIVE_WORKTREE: branch=${branch}; changed=${statusLines.length}; staged=${staged}; untracked=${untracked}; scopes=${scopeCounts.size}; stage_state=${stageState}`);
console.log(`DIRTY_SCOPE_LIVE_COUNTS: ${formatCounts(scopeCounts) || "none"}`);
console.log(
  `DIRTY_SCOPE_LIVE_SHARED_CONTROL_FILES: count=${sharedFiles.length}; sample=${sharedFiles.slice(0, 8).join("|") || "none"}`,
);
console.log("DIRTY_SCOPE_PACKAGING_LEDGER_READY: PASS_LOCAL_CONTROL");
console.log("Mode: routing only; no production, UAT, finance, evidence, owner, account, email, task or migration approval.");
