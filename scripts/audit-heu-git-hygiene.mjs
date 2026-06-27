import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(contents, pattern, label, file) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

function runGit(args) {
  return execSync(`git ${args}`, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

for (const file of [
  "docs/GIT_CLEANUP_ANALYSIS.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  ".gitignore",
  "package.json",
]) {
  requireFile(file);
}

const analysis = existsSync(path.join(repoRoot, "docs/GIT_CLEANUP_ANALYSIS.md"))
  ? read("docs/GIT_CLEANUP_ANALYSIS.md")
  : "";
const backlog = existsSync(path.join(repoRoot, "docs/HEU_SYSTEM_BUILD_BACKLOG.md"))
  ? read("docs/HEU_SYSTEM_BUILD_BACKLOG.md")
  : "";
const checklist = existsSync(
  path.join(repoRoot, "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md"),
)
  ? read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md")
  : "";
const gitignore = existsSync(path.join(repoRoot, ".gitignore"))
  ? read(".gitignore")
  : "";
const packageJson = JSON.parse(read("package.json"));

requireText(
  analysis,
  /Current Snapshot - 2026-06-27[\s\S]*Branch:\s*`hardening\/ttgdtx-9plus-pilot`[\s\S]*git status --short --branch[\s\S]*clean worktree[\s\S]*Exact ahead count is intentionally treated as live state[\s\S]*drifts with each safe commit[\s\S]*Do not commit runtime logs, local secrets, raw UAT evidence, exported bank\s+statements or temporary SQL scratch files/i,
  "current live-state Git hygiene snapshot",
  "docs/GIT_CLEANUP_ANALYSIS.md",
);

requireText(
  backlog,
  /P0-02[\s\S]*Split dirty working tree by scope[\s\S]*PASS_LOCAL[\s\S]*GIT_CLEANUP_ANALYSIS\.md[\s\S]*audit:heu-git-hygiene[\s\S]*current exact ahead count must be verified live/i,
  "P0-02 PASS_LOCAL backlog row",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireText(
  checklist,
  /Review dirty Git state[\s\S]*PASS_LOCAL[\s\S]*GIT_CLEANUP_ANALYSIS\.md[\s\S]*audit:heu-git-hygiene[\s\S]*current exact ahead count must be verified live/i,
  "production checklist Git hygiene row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

if (/ahead (?:origin )?by 58 commits/i.test(checklist)) {
  fail("Production checklist must not keep the stale ahead-by-58 snapshot.");
}

for (const pattern of [/\.log/, /dev-server\*\.log/, /next-dev\*\.log/, /\.env/]) {
  if (!pattern.test(gitignore)) {
    fail(`.gitignore: missing ${pattern}`);
  }
}

if (!packageJson.scripts?.["audit:heu-git-hygiene"]) {
  fail("package.json: missing audit:heu-git-hygiene script");
}

const untracked = runGit("ls-files -o --exclude-standard");
if (untracked) {
  fail(`Git has unignored untracked files: ${untracked.split(/\r?\n/).join(", ")}`);
}

const trackedSensitive = runGit("ls-files").split(/\r?\n/).filter((file) =>
  /(^|\/)(?:.*\.log|\.env|\.env\.local|\.env\..*|.*\.env.*)$/.test(file),
);
if (trackedSensitive.length > 0) {
  fail(`Tracked log/env-like files are not allowed: ${trackedSensitive.join(", ")}`);
}

if (failures.length > 0) {
  console.error("HEU Git hygiene audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Git hygiene audit passed. Untracked noise and tracked log/env files are blocked.");
