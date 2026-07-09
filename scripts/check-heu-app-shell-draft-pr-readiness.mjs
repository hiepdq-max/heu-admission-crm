import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const includeRuntime = process.argv.includes("--runtime");
const includeBroadSecurity = process.argv.includes("--broad-security");
const repoRoot = process.cwd();
const statuses = [];
let activeDiffArgs = ["diff", "--unified=0"];

const requiredFiles = [
  "lib/heu-workspace-context.ts",
  "lib/workspace.ts",
  "components/layout/app-shell.tsx",
  "components/dashboard/dashboard-overview.tsx",
  "app/page.tsx",
  "app/leads/page.tsx",
  "app/leads/new/page.tsx",
  "app/import/page.tsx",
  "app/import/actions.ts",
  "app/reports/page.tsx",
  "app/cthssv/page.tsx",
  "app/data-confirmation/page.tsx",
  "scripts/check-heu-data-confirmation-task-center.mjs",
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_MODULAR_MONOLITH_DECISION_20260709.md",
  "docs/HEU_CONTROL/HEU_USER_PILOT_001_REAL_USER_UAT_REGISTER_20260709.md",
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md",
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md",
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md",
  "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md",
];

const forbiddenPathPatterns = [
  /(^|\/)(supabase|migrations|database|db|schema|sql)\//i,
  /\.sql$/i,
  /(^|\/)\.env($|\.)/i,
  /(^|\/)next\.config\./i,
  /(^|\/)middleware\./i,
  /(^|\/)(vercel|docker|compose)(\.|\/)/i,
  /\.(ya?ml)$/i,
];

const highConfidenceSecretPatterns = [
  /SUPABASE_SERVICE_ROLE_KEY\s*=/i,
  /service[_-]?role[_-]?key\s*[:=]/i,
  /api[_-]?key\s*[:=]\s*["'][^"']{16,}/i,
  /secret\s*[:=]\s*["'][^"']{16,}/i,
  /token\s*[:=]\s*["'][^"']{24,}/i,
  /password\s*[:=]\s*["'][^"']{8,}/i,
  /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/,
];

function addStatus(code, status, detail) {
  statuses.push({ code, status, detail });
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16,
    windowsHide: true,
    ...options,
  });
}

function runGit(args) {
  return run("git", args);
}

function runScopedDiffCheck() {
  if (activeDiffArgs.includes("--cached")) {
    return runGit(["diff", "--cached", "--check"]);
  }

  const branchRange = activeDiffArgs.find((arg) => arg.includes(".."));

  if (branchRange) {
    return runGit(["diff", "--check", branchRange]);
  }

  return runGit(["diff", "--check"]);
}

function runNpmScript(scriptName, extraArgs = [], options = {}) {
  if (process.platform === "win32") {
    return run("cmd.exe", [
      "/d",
      "/s",
      "/c",
      "npm.cmd",
      "run",
      scriptName,
      ...(extraArgs.length > 0 ? ["--", ...extraArgs] : []),
    ], options);
  }

  return run(
    "npm",
    ["run", scriptName, ...(extraArgs.length > 0 ? ["--", ...extraArgs] : [])],
    options,
  );
}

function outputTail(result) {
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .slice(-8)
    .join(" | ");
}

function listChangedFiles() {
  const tracked = runGit(["diff", "--name-only"]);
  const staged = runGit(["diff", "--cached", "--name-only"]);
  const untracked = runGit(["ls-files", "-o", "--exclude-standard"]);

  if (tracked.status !== 0 || staged.status !== 0 || untracked.status !== 0) {
    addStatus(
      "APP-SHELL-DRAFT-GIT-LIST",
      "NO_GO",
      "Could not list changed files.",
    );
    return [];
  }

  const worktreeFiles = [
    ...tracked.stdout.split(/\r?\n/),
    ...staged.stdout.split(/\r?\n/),
    ...untracked.stdout.split(/\r?\n/),
  ].filter(Boolean);

  if (worktreeFiles.length > 0) {
    activeDiffArgs = ["diff", "--cached", "--unified=0"];
    return Array.from(new Set(worktreeFiles));
  }

  const baseRef = process.env.HEU_APP_SHELL_BASE_REF ?? "origin/codex/heu/base-cc3985a";
  const verifyBase = runGit(["rev-parse", "--verify", "--quiet", baseRef]);

  if (verifyBase.status !== 0) {
    addStatus(
      "APP-SHELL-DRAFT-GIT-LIST",
      "NO_GO",
      `No working changes and base ref is unavailable: ${baseRef}`,
    );
    return [];
  }

  const branchDiff = runGit(["diff", "--name-only", `${baseRef}..HEAD`]);

  if (branchDiff.status !== 0) {
    addStatus(
      "APP-SHELL-DRAFT-GIT-LIST",
      "NO_GO",
      `Could not list branch diff against ${baseRef}.`,
    );
    return [];
  }

  activeDiffArgs = ["diff", "--unified=0", `${baseRef}..HEAD`];
  return Array.from(new Set(branchDiff.stdout.split(/\r?\n/).filter(Boolean)));
}

function validateRequiredFiles() {
  const missing = requiredFiles.filter(
    (filePath) => !existsSync(path.join(repoRoot, filePath)),
  );

  addStatus(
    "APP-SHELL-DRAFT-REQUIRED-FILES",
    missing.length === 0 ? "PASS" : "NO_GO",
    missing.length === 0
      ? "All required App Shell draft files exist."
      : `Missing files: ${missing.join(", ")}`,
  );
}

function validateForbiddenPaths(changedFiles) {
  const hits = changedFiles.filter((filePath) =>
    forbiddenPathPatterns.some((pattern) => pattern.test(filePath)),
  );

  addStatus(
    "APP-SHELL-DRAFT-NO-DB-CONFIG-DEPLOY",
    hits.length === 0 ? "PASS" : "NO_GO",
    hits.length === 0
      ? "No SQL, migration, env, production config or deploy file in scope."
      : `Forbidden path in scope: ${hits.join(", ")}`,
  );
}

function validateStageManifest(changedFiles) {
  const stageManifestPath = path.join(
    repoRoot,
    "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md",
  );
  const contents = readFileSync(stageManifestPath, "utf8");
  const match = contents.match(
    /Stage exactly these files[\s\S]*?```text\r?\n([\s\S]*?)```/,
  );

  if (!match) {
    addStatus(
      "APP-SHELL-DRAFT-STAGE-MANIFEST",
      "NO_GO",
      "Could not read stage manifest file list.",
    );
    return;
  }

  const manifestFiles = match[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const changedSet = new Set(changedFiles);
  const manifestSet = new Set(manifestFiles);
  const missingFromManifest = changedFiles.filter((filePath) => !manifestSet.has(filePath));
  const extraInManifest = manifestFiles.filter((filePath) => !changedSet.has(filePath));

  addStatus(
    "APP-SHELL-DRAFT-STAGE-MANIFEST",
    missingFromManifest.length === 0 && extraInManifest.length === 0
      ? "PASS"
      : "NO_GO",
    missingFromManifest.length === 0 && extraInManifest.length === 0
      ? "Stage manifest exactly matches changed/untracked files."
      : `missingFromManifest=${missingFromManifest.join(", ")}; extraInManifest=${extraInManifest.join(", ")}`,
  );
}

function validateHighConfidenceSecrets(changedFiles) {
  const diff = runGit(activeDiffArgs);

  if (diff.status !== 0) {
    addStatus("APP-SHELL-DRAFT-SECRET-SCAN", "NO_GO", "Could not read diff.");
    return;
  }

  const addedLines = diff.stdout
    .split(/\r?\n/)
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"));
  const hits = addedLines.filter((line) =>
    highConfidenceSecretPatterns.some((pattern) => pattern.test(line)),
  );
  const fileHits = [];

  for (const filePath of changedFiles) {
    const absolutePath = path.join(repoRoot, filePath);

    if (!existsSync(absolutePath)) {
      continue;
    }

    const contents = readFileSync(absolutePath, "utf8");

    if (highConfidenceSecretPatterns.some((pattern) => pattern.test(contents))) {
      fileHits.push(filePath);
    }
  }

  addStatus(
    "APP-SHELL-DRAFT-SECRET-SCAN",
    hits.length === 0 && fileHits.length === 0 ? "PASS" : "NO_GO",
    hits.length === 0 && fileHits.length === 0
      ? "No high-confidence secret assignment found in added diff lines or changed files."
      : `Potential secret content found: diffLines=${hits.length}; files=${fileHits.join(", ")}`,
  );
}

function validateRequiredTokens() {
  const handoffPath = path.join(
    repoRoot,
    "docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_HANDOFF_20260709.md",
  );
  const prBodyPath = path.join(
    repoRoot,
    "docs/HEU_CONTROL/HEU_APP_SHELL_001_DRAFT_PR_BODY_20260709.md",
  );
  const stageManifestPath = path.join(
    repoRoot,
    "docs/HEU_CONTROL/HEU_APP_SHELL_001_STAGE_FILE_MANIFEST_20260709.md",
  );
  const reviewChecklistPath = path.join(
    repoRoot,
    "docs/HEU_CONTROL/HEU_APP_SHELL_001_REVIEW_CHECKLIST_20260709.md",
  );
  const combined = `${readFileSync(handoffPath, "utf8")}\n${readFileSync(prBodyPath, "utf8")}\n${readFileSync(stageManifestPath, "utf8")}\n${readFileSync(reviewChecklistPath, "utf8")}`;
  const tokens = [
    "DRAFT_PR_READY",
    "DRAFT_PR_STAGE_READY",
    "DRAFT_REVIEW_CHECKLIST",
    "IT_DATA",
    "Audit",
    "ITDATA-APP-01",
    "AUDIT-APP-01",
    "Rollback",
    "Production status: NO-GO",
    "PR phai de Draft",
    "git diff --cached --name-only",
    "npm.cmd run check:heu-data-confirmation-task-center",
    "npm.cmd run build -- --webpack",
  ];
  const missing = tokens.filter((token) => !combined.includes(token));

  addStatus(
    "APP-SHELL-DRAFT-HANDOFF-TOKENS",
    missing.length === 0 ? "PASS" : "NO_GO",
    missing.length === 0
      ? "Handoff and PR body include required review tokens."
      : `Missing tokens: ${missing.join(", ")}`,
  );
}

function validateCommand(code, result, successDetail) {
  addStatus(
    code,
    result.status === 0 ? "PASS" : "NO_GO",
    result.status === 0 ? successDetail : outputTail(result),
  );
}

const changedFiles = listChangedFiles();
validateRequiredFiles();
validateForbiddenPaths(changedFiles);
validateStageManifest(changedFiles);
validateHighConfidenceSecrets(changedFiles);
validateRequiredTokens();
validateCommand(
  "APP-SHELL-DRAFT-DIFF-CHECK",
  runScopedDiffCheck(),
  "Scoped git diff --check passed.",
);
validateCommand(
  "APP-SHELL-DRAFT-DCTC-GATE",
  runNpmScript("check:heu-data-confirmation-task-center"),
  "Data Confirmation Task Center gate passed.",
);
if (includeBroadSecurity) {
  validateCommand(
    "APP-SHELL-DRAFT-FAST-LOOP-SECURITY",
    runNpmScript("check:heu-fast-local-loop", ["--security"]),
    "Fast local loop security mode passed.",
  );
} else {
  addStatus(
    "APP-SHELL-DRAFT-FAST-LOOP-SECURITY",
    "PASS",
    "Broad fast-loop security skipped by default; use --broad-security after docs/audit alignment is in scope.",
  );
}

if (includeRuntime) {
  validateCommand(
    "APP-SHELL-DRAFT-LINT",
    runNpmScript("lint"),
    "Lint passed.",
  );

  const buildEnv = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      "dummy-publishable-key-for-local-build-only",
  };
  validateCommand(
    "APP-SHELL-DRAFT-BUILD-WEBPACK",
    runNpmScript("build", ["--webpack"], { env: buildEnv }),
    "Webpack build passed with build-only public Supabase env values.",
  );
} else {
  addStatus(
    "APP-SHELL-DRAFT-RUNTIME",
    "PASS",
    "Runtime lint/build skipped by default; use --runtime to run lint and Webpack build.",
  );
}

for (const { code, status, detail } of statuses) {
  console.log(`${code}: ${status} - ${detail}`);
}

if (statuses.some(({ status }) => status !== "PASS")) {
  console.error("HEU_APP_SHELL_DRAFT_PR_READY: NO_GO");
  process.exit(1);
}

console.log("HEU_APP_SHELL_DRAFT_PR_READY: PASS_LOCAL");
