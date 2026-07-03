import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const includeRuntime = process.argv.includes("--runtime");
const strictWorktree = process.argv.includes("--strict-worktree");

const requiredFiles = [
  "app/cthssv/page.tsx",
  "scripts/audit-heu-cthssv-module-readiness.mjs",
  "docs/HEU_CTHSSV_MODULE_COMPLETION_BREAKDOWN_20260703.md",
  "docs/HEU_CTHSSV_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
  "docs/HEU_CTHSSV_CONTROLLED_EVIDENCE_TRACE_CHECKLIST_20260703.md",
  "docs/HEU_CTHSSV_FINAL_MODULE_CLOSURE_GATE_20260703.md",
  "docs/HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
  "docs/HEU_CTHSSV_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  "docs/HEU_CTHSSV_OWNER_SIGNOFF_MANIFEST_20260703.md",
];

const commands = [
  {
    name: "audit:heu-cthssv-module-readiness",
    reason:
      "M06 cockpit, CTHSSV-00..10, role, evidence, final closure and external owner action guards",
  },
  {
    name: "audit:heu-lead-handover-policy",
    reason: "P3-02 handover remains controlled and finance-gated",
  },
  {
    name: "audit:heu-lead-lifecycle-handover-uat-pack",
    reason: "P3-01/P3-02 signed UAT pack remains packaged but not accepted",
  },
  {
    name: "audit:heu-role-scope-uat-pack",
    reason: "P6-04 role/workspace UAT pack remains explicit",
  },
  {
    name: "audit:heu-controlled-evidence-redaction-pack",
    reason: "P0-10 raw sensitive evidence stays outside Git/Codex/chat",
  },
  {
    name: "audit:heu-current-state-inventory",
    reason: "Stage D / NO-GO current-state alignment",
  },
  {
    name: "audit:heu-implementation-log",
    reason: "CTHSSV slices are logged with local-only boundaries",
  },
  {
    name: "audit:ttgdtx-release-gates",
    reason: "P3-02 and CTHSSV controls remain in the TTGDTX release gate",
  },
];

if (includeRuntime) {
  commands.push(
    {
      name: "lint",
      reason: "Runtime/source lint after CTHSSV UI or script changes",
    },
    {
      name: "build",
      reason: "Next.js build after CTHSSV route/control changes",
    },
  );
}

function elapsedMs(startedAt) {
  const elapsed = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
  return Math.round(elapsed);
}

function runGit(args) {
  return spawnSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 4,
    windowsHide: true,
  });
}

function runNpmScript(scriptName) {
  const spawnCommand =
    process.platform === "win32"
      ? {
          command: "cmd.exe",
          args: ["/d", "/s", "/c", "npm.cmd", "run", scriptName],
        }
      : {
          command: "npm",
          args: ["run", scriptName],
        };

  return spawnSync(spawnCommand.command, spawnCommand.args, {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16,
    windowsHide: true,
  });
}

function focusedOutput(result) {
  const lines = `${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error ? String(result.error) : ""}`
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const focused = lines.filter((line) =>
    /READY|PASS|PASS_LOCAL|NO_GO|BLOCKED|failed|error|missing|NO-GO|Stage D/i.test(
      line,
    ),
  );

  return (focused.length > 0 ? focused : lines).slice(-16);
}

function collectWorktreeSnapshot() {
  const statusResult = runGit(["status", "--short", "--branch"]);

  if (statusResult.status !== 0) {
    return {
      ok: false,
      detail: statusResult.error
        ? String(statusResult.error)
        : (statusResult.stderr ?? "").trim() || "git status failed",
    };
  }

  const lines = (statusResult.stdout ?? "").split(/\r?\n/).filter(Boolean);
  const branch =
    lines.find((line) => line.startsWith("## "))?.slice(3) ??
    "UNKNOWN_BRANCH";
  const entries = lines.filter((line) => !line.startsWith("## "));
  const cthssvEntries = entries.filter((line) =>
    /app\/cthssv\/|HEU_CTHSSV_|audit-heu-cthssv|check-heu-cthssv|HEU_CURRENT_STATE_INVENTORY|HEU_SYSTEM_BUILD_BACKLOG|HEU_MODULE_READINESS_GAP_MATRIX|TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST|HEU_IMPLEMENTATION_LOG|package\.json/.test(
      line,
    ),
  );

  return {
    ok: true,
    branch,
    changed: entries.length,
    cthssvChanged: cthssvEntries.length,
    conflicted: entries.filter((line) =>
      /^(UU|AA|DD|AU|UA|DU|UD) /.test(line),
    ).length,
    sample: cthssvEntries
      .slice(0, 12)
      .map((line) => line.replace(/^.. /, "").trim()),
    untracked: entries.filter((line) => line.startsWith("?? ")).length,
  };
}

function reportWorktreeSnapshot() {
  const snapshot = collectWorktreeSnapshot();

  if (!snapshot.ok) {
    console.log(`HEU_CTHSSV_WORKTREE: NO_GO - ${snapshot.detail}`);
    return false;
  }

  console.log(
    `HEU_CTHSSV_WORKTREE: branch=${snapshot.branch}; changed=${snapshot.changed}; cthssv_changed=${snapshot.cthssvChanged}; untracked=${snapshot.untracked}; conflicted=${snapshot.conflicted}`,
  );

  if (snapshot.sample.length > 0) {
    console.log(`HEU_CTHSSV_WORKTREE_SAMPLE: ${snapshot.sample.join(" | ")}`);
  }

  if (snapshot.changed === 0) {
    console.log("HEU_CTHSSV_WORKTREE_SCOPE: CLEAN");
    return true;
  }

  console.log(
    strictWorktree
      ? "HEU_CTHSSV_WORKTREE_SCOPE: NO_GO - dirty worktree under --strict-worktree; separate or clean the current slice before handoff."
      : "HEU_CTHSSV_WORKTREE_SCOPE: DIRTY_WARN_ONLY - existing unrelated changes are preserved; report current-slice files separately before handoff.",
  );

  return !strictWorktree;
}

function verifyRequiredFiles() {
  const missing = requiredFiles.filter(
    (file) => !existsSync(path.join(process.cwd(), file)),
  );

  if (missing.length === 0) {
    console.log(
      `HEU_CTHSSV_REQUIRED_FILES: PASS (${requiredFiles.length}/${requiredFiles.length})`,
    );
    return true;
  }

  console.error(`HEU_CTHSSV_REQUIRED_FILES: NO_GO - missing ${missing.join(", ")}`);
  return false;
}

console.log("HEU CTHSSV local completion gate");
console.log(
  "Mode: PASS_LOCAL read-only checks. No UAT execution, evidence acceptance, enrollment approval, handover reliance approval, finance action, owner GO/NO-GO or production GO.",
);
console.log(
  includeRuntime
    ? "Runtime mode: enabled; lint and build are included."
    : "Runtime mode: skipped; pass --runtime to include lint and build.",
);

if (!verifyRequiredFiles() || !reportWorktreeSnapshot()) {
  console.error("CTHSSV_LOCAL_COMPLETION_READY: NO_GO at preflight.");
  console.error(
    "CTHSSV_REAL_OPERATION_READY: NO_GO - signed UAT, controlled evidence, finance gate proof and owner quorum are still external.",
  );
  process.exit(1);
}

const startedAt = process.hrtime.bigint();
const results = [];

for (const [index, command] of commands.entries()) {
  const commandStartedAt = process.hrtime.bigint();
  const result = runNpmScript(command.name);
  const duration = elapsedMs(commandStartedAt);
  const status = result.status === 0 ? "PASS" : "NO_GO";

  results.push({
    command: command.name,
    duration,
    reason: command.reason,
    status,
  });

  console.log(
    `[${index + 1}/${commands.length}] ${command.name}: ${status} (${duration} ms) - ${command.reason}`,
  );

  if (result.status !== 0) {
    const relevantOutput = focusedOutput(result);

    if (relevantOutput.length > 0) {
      console.error("Relevant output:");
      for (const line of relevantOutput) {
        console.error(`  ${line}`);
      }
    }
  }
}

const failed = results.filter((result) => result.status !== "PASS");
const totalDuration = elapsedMs(startedAt);

if (failed.length > 0) {
  console.error(
    `CTHSSV_LOCAL_COMPLETION_READY: NO_GO (${results.length - failed.length}/${results.length} checks passed, ${totalDuration} ms).`,
  );
  console.error(
    `CTHSSV_LOCAL_BLOCKERS: ${failed
      .map((result) => `${result.command}=${result.status}`)
      .join("; ")}`,
  );
  console.error(
    "CTHSSV_REAL_OPERATION_READY: NO_GO - signed UAT, controlled evidence, finance gate proof and owner quorum are still external.",
  );
  process.exit(1);
}

console.log(
  `CTHSSV_LOCAL_COMPLETION_READY: PASS_LOCAL (${results.length}/${results.length} checks passed, ${totalDuration} ms).`,
);
console.log(
  "CTHSSV_REAL_OPERATION_READY: NO_GO - signed CTHSSV owner UAT, signed role/negative-access UAT, signed controlled evidence/audit trace, signed final module closure, handover reliance decision and external owner action queue closure are still required outside Git/Codex/chat.",
);
