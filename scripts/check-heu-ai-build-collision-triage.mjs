import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docPath = "docs/HEU_AI_BUILD_COLLISION_TRIAGE_20260703.md";
const packagePath = "package.json";
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
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
    unstaged: code[1] !== " " || code === "??",
    untracked: code === "??",
  };
}

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
    test: /app\/(leads|pipeline|import|followups|segments|search)|components\/(leads|pipeline|followups|segments)|check-heu-(lead|pipeline|reports|admissions)/i,
  },
  {
    scope: "REPORT_VIEW_DATA_MASTER",
    test: /reports|HEU_REPORT_VIEW|HEU_DATA_MASTER|HEU_STANDARD_SYSTEM_BLUEPRINT/i,
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
    test: /audit|TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST|production-readiness|hard-delete|AGENTS\.md/i,
  },
];

const sharedControlPattern =
  /(^package\.json$|HEU_IMPLEMENTATION_LOG|HEU_CURRENT_STATE_INVENTORY|HEU_SYSTEM_BUILD_BACKLOG|HEU_MODULE_READINESS_GAP_MATRIX|TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST|HEU_CODEX_OPERATING_PLAYBOOK|AGENTS\.md|check-heu-fast-local-loop|audit-heu-current-state-inventory|audit-heu-implementation-log|audit-ttgdtx-release-gates)/i;

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

const doc = existsSync(path.join(repoRoot, docPath)) ? read(docPath) : "";
const packageJson = existsSync(path.join(repoRoot, packagePath))
  ? JSON.parse(read(packagePath))
  : { scripts: {} };

requireTokens(
  doc,
  [
    "AI_BUILD_COLLISION_TRIAGE_READY / MIXED_DIRTY / BLOCKED",
    "ERR-AI-01",
    "ERR-AI-02",
    "ERR-AI-03",
    "ERR-AI-04",
    "ERR-AI-05",
    "Hunk-level staging only",
    "Short Course TRN dependency chain",
    "Accounting ACCT chain",
    "Admissions/CRM local completion",
    "P0-17/User operation",
    "Finance payment scope",
    "AI_BUILD_SOFT_CONNECTOR_READY / HIGH_OVERLAP / BLOCKED",
    "run_registered_dynamic_guards",
    "candidate_manual=npm.cmd run check:heu-executive-report-dashboard-scope-contract-readiness",
    "DAO_TAO_M07_M08_DEPENDENCY_CHAIN",
    "lane_id",
    "files_touched",
    "shared_control_files",
    "dependency_guards",
    "stop_rule",
    "handoff_status",
    "Do not use broad `git add .`",
    "Soft connector PASS_LOCAL",
    "does not approve production",
    "does not modify business data",
    "mark production GO",
  ],
  "AI build collision triage contract",
  docPath,
);

if (
  packageJson.scripts?.["check:heu-ai-build-collision-triage"] !==
  "node scripts/check-heu-ai-build-collision-triage.mjs"
) {
  failures.push(`${packagePath}: missing check:heu-ai-build-collision-triage script`);
}

if (failures.length > 0) {
  console.error("HEU AI build collision triage check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const branchResult = git(["status", "--short", "--branch"]);
const statusResult = git(["status", "--short"]);
const gitStatusAvailable = branchResult.ok && statusResult.ok;
const branch = gitStatusAvailable
  ? (branchResult.output.split(/\r?\n/)[0] ?? "")
  : "git_status_unavailable";
const statusLines = gitStatusAvailable
  ? statusResult.output
      .split(/\r?\n/)
      .filter(Boolean)
      .map(parseStatusLine)
  : [];

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

const changed = statusLines.length;
const staged = statusLines.filter((entry) => entry.staged).length;
const untracked = statusLines.filter((entry) => entry.untracked).length;
const mixed = scopeCounts.size > 1;
const overlapRisk = !gitStatusAvailable
  ? "UNKNOWN_BLOCKED"
  : mixed && sharedFiles.length > 0
    ? "HIGH"
    : mixed
      ? "MEDIUM"
      : "LOW";
const stagedScopeCount = [...stagedScopes].filter((scope) => scope !== "SHARED_CONTROL").length;
const stageState = !gitStatusAvailable
  ? "UNKNOWN_BLOCKED"
  : staged === 0
    ? "CLEAN_INDEX"
    : stagedScopeCount <= 1
      ? "SINGLE_SCOPE_INDEX"
      : "MIXED_SCOPE_INDEX";
const changedLabel = gitStatusAvailable ? String(changed) : "unknown";
const stagedLabel = gitStatusAvailable ? String(staged) : "unknown";
const untrackedLabel = gitStatusAvailable ? String(untracked) : "unknown";
const scopesLabel = gitStatusAvailable ? String(scopeCounts.size) : "unknown";
const sharedFilesCountLabel = gitStatusAvailable ? String(sharedFiles.length) : "unknown";
const sharedFilesSampleLabel = gitStatusAvailable
  ? sharedFiles.slice(0, 8).join("|") || "none"
  : "git_status_unavailable";

let recommendation = "next=choose_one_guard_and_hunk_stage_shared_files";
if (!gitStatusAvailable) {
  recommendation = "next=rerun_direct_git_status_before_packaging";
} else if (scopeCounts.has("SHORT_COURSE_TRN")) {
  recommendation =
    "next=package_short_course_trn_dependency_chain_before_accounting";
} else if (scopeCounts.has("ACCOUNTING_ACCT")) {
  recommendation = "next=package_accounting_acct_chain";
} else if (scopeCounts.has("ADMISSIONS_CRM")) {
  recommendation = "next=package_admissions_crm_local_completion";
} else if (scopeCounts.has("P0_17_USER_SCOPE")) {
  recommendation = "next=package_p0_17_user_scope_security_lane";
}

console.log("HEU AI build collision triage");
console.log("Mode: PASS_LOCAL control only. No production, UAT, finance, owner, evidence, email, task, account or migration approval.");
console.log(
  `AI_BUILD_GIT_STATUS: ${gitStatusAvailable ? "available" : `unavailable; reason=${branchResult.error ?? statusResult.error}`}`,
);
console.log(`AI_BUILD_BRANCH: ${branch}`);
console.log(
  `AI_BUILD_WORKTREE: changed=${changedLabel}; staged=${stagedLabel}; untracked=${untrackedLabel}; scopes=${scopesLabel}; stage_state=${stageState}`,
);
console.log(`AI_BUILD_SCOPE_COUNTS: ${gitStatusAvailable ? formatCounts(scopeCounts) || "none" : "git_status_unavailable"}`);
console.log(
  `AI_BUILD_SHARED_CONTROL_FILES: count=${sharedFilesCountLabel}; sample=${sharedFilesSampleLabel}`,
);
console.log(`AI_BUILD_OVERLAP_RISK: ${overlapRisk}`);
console.log(`AI_BUILD_NEXT_ACTION: ${recommendation}; rule=one_slice_only; hunk_stage_shared_control_files=true`);
console.log("AI_BUILD_COLLISION_TRIAGE_READY: PASS_LOCAL_CONTROL");
