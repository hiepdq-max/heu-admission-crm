import { execFileSync } from "node:child_process";
import path from "node:path";

const GROUP_ORDER = [
  "docs",
  "scripts",
  "config",
  "codex",
  "database",
  "app",
  "components",
  "other",
];

const GROUP_META = {
  docs: {
    risk: "Low-medium",
    owner: "Audit + PHAP_CHE + module owners",
    taskId: "HEU-DOCS-REVIEW-BY-MODULE",
    priority: 1,
  },
  scripts: {
    risk: "High",
    owner: "IT_DATA + Audit",
    taskId: "HEU-SCRIPTS-REVIEW-CHECKERS",
    priority: 2,
  },
  config: {
    risk: "Very high",
    owner: "IT_DATA + DevOps/Codex operator",
    taskId: "HEU-CONFIG-REVIEW-BUILD-RUNTIME",
    priority: 3,
  },
  codex: {
    risk: "High",
    owner: "Codex operator + IT_DATA + Audit",
    taskId: "HEU-CODEX-REVIEW-LOCAL-ENV",
    priority: 4,
  },
  database: {
    risk: "Very high",
    owner: "IT_DATA + Audit + PHAP_CHE + finance/data owner",
    taskId: "HEU-DATABASE-FREEZE-AND-REVIEW-SQL",
    priority: 5,
  },
  app: {
    risk: "High",
    owner: "Module owners + IT_DATA + Audit",
    taskId: "HEU-APP-REVIEW-BY-MODULE",
    priority: 6,
  },
  components: {
    risk: "Medium-high",
    owner: "Module owners + IT_DATA + Audit",
    taskId: "HEU-COMPONENTS-REVIEW-BY-MODULE",
    priority: 7,
  },
  other: {
    risk: "Medium",
    owner: "IT_DATA + Audit",
    taskId: "HEU-OTHER-CLASSIFY-BEFORE-PR",
    priority: 8,
  },
};

const CONFIG_FILE_PATTERNS = [
  /^package\.json$/,
  /^package-lock\.json$/,
  /^next\.config\./,
  /^tsconfig\./,
  /^tailwind\.config\./,
  /^postcss\.config\./,
  /^eslint\.config\./,
  /^components\.json$/,
  /^\.env/,
  /^\.gitignore$/,
];

function runGit(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trimEnd();
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^"|"$/g, "");
}

function extractPathFromStatusLine(line) {
  const status = line.slice(0, 2);
  const rawPath = line.slice(3).trim();
  const pathPart = rawPath.includes(" -> ")
    ? rawPath.split(" -> ").at(-1)
    : rawPath;

  return {
    status,
    filePath: normalizePath(pathPart),
  };
}

function groupForPath(filePath) {
  if (filePath.startsWith("docs/")) return "docs";
  if (filePath.startsWith("scripts/")) return "scripts";
  if (filePath.startsWith("app/")) return "app";
  if (filePath.startsWith("components/")) return "components";
  if (filePath.startsWith("database/")) return "database";
  if (filePath.startsWith(".codex/")) return "codex";
  if (CONFIG_FILE_PATTERNS.some((pattern) => pattern.test(filePath))) {
    return "config";
  }

  return "other";
}

function countStatuses(entries) {
  const labels = {
    " M": "modified",
    "M ": "modified-staged",
    "MM": "modified-staged-and-worktree",
    " A": "added",
    "A ": "added-staged",
    "??": "untracked",
    " D": "deleted",
    "D ": "deleted-staged",
  };
  const counts = new Map();
  for (const entry of entries) {
    const key = labels[entry.status] ?? entry.status.trim() ?? "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([status, count]) => `${status}:${count}`)
    .join(", ");
}

function markdownRow(cells) {
  return `| ${cells.join(" | ")} |`;
}

const repoRoot = runGit(["rev-parse", "--show-toplevel"]);
const head = runGit(["rev-parse", "--short", "HEAD"]);
const statusOutput = runGit(["status", "--short", "--branch"]);
const diffNameStatus = runGit(["diff", "--name-status"]);
const untrackedOutput = runGit(["ls-files", "-o", "--exclude-standard"]);

const statusLines = statusOutput.split(/\r?\n/).filter(Boolean);
const branchLine = statusLines.find((line) => line.startsWith("##")) ?? "## UNKNOWN";
const entries = statusLines
  .filter((line) => !line.startsWith("##"))
  .map(extractPathFromStatusLine)
  .filter((entry) => entry.filePath.length > 0);

const grouped = new Map(GROUP_ORDER.map((group) => [group, []]));
for (const entry of entries) {
  grouped.get(groupForPath(entry.filePath)).push(entry);
}

const activeGroups = GROUP_ORDER.filter((group) => grouped.get(group).length > 0);
const total = entries.length;
const untrackedCount = untrackedOutput
  ? untrackedOutput.split(/\r?\n/).filter(Boolean).length
  : 0;
const diffCount = diffNameStatus
  ? diffNameStatus.split(/\r?\n/).filter(Boolean).length
  : 0;

console.log("# HEU AI 003 Dry Run PR Split");
console.log("");
console.log(`Repository root: \`${repoRoot}\``);
console.log(`HEAD: \`${head}\``);
console.log(`Branch/status: \`${branchLine}\``);
console.log(`Read-only commands: \`git rev-parse\`, \`git status --short --branch\`, \`git diff --name-status\`, \`git ls-files -o --exclude-standard\``);
console.log("");
console.log("## Worktree Counts");
console.log("");
console.log(markdownRow(["Metric", "Count"]));
console.log(markdownRow(["---", "---:"]));
console.log(markdownRow(["status entries", String(total)]));
console.log(markdownRow(["diff name-status entries", String(diffCount)]));
console.log(markdownRow(["untracked entries", String(untrackedCount)]));
console.log("");
console.log("## Suggested PR Split Table");
console.log("");
console.log(markdownRow([
  "Priority",
  "TASK_ID",
  "Group",
  "Files",
  "Status mix",
  "Risk",
  "Review owner lane",
  "Separate PR",
  "Backup/rollback",
]));
console.log(markdownRow([
  "---:",
  "---",
  "---",
  "---:",
  "---",
  "---",
  "---",
  "---",
  "---",
]));

for (const group of activeGroups) {
  const groupEntries = grouped.get(group);
  const meta = GROUP_META[group];
  const backup =
    group === "database"
      ? "Backup/rollback required before any SQL execution"
      : "Rollback by revert PR; no DB backup for dry-run";

  console.log(markdownRow([
    String(meta.priority),
    meta.taskId,
    group,
    String(groupEntries.length),
    countStatuses(groupEntries),
    meta.risk,
    meta.owner,
    "Yes",
    backup,
  ]));
}

console.log("");
console.log("## Stop Rules");
console.log("");
console.log("- This dry-run did not stage, commit, push, create PR or write files.");
console.log("- Do not combine database, config, scripts and runtime app changes in one PR.");
console.log("- Do not run install, CI, migration, deploy, SQL or Supabase push from this command.");
console.log("- Do not treat this output as owner approval, UAT approval, finance approval or production GO.");
console.log("");
console.log("HEU_AI_003_DRY_RUN_PR_SPLIT: PASS_LOCAL");
console.log("Runtime AI Agent readiness remains NO_GO.");
console.log("Production remains NO-GO.");
