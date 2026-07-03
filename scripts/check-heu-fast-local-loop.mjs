import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const includeRuntime = process.argv.includes("--runtime");
const includeSecurity = process.argv.includes("--security");
const strictWorktree = process.argv.includes("--strict-worktree");
const commands = [
  {
    name: "check:heu-it-data-daily-control",
    reason: "IT/Data daily PASS_LOCAL boundary and control links",
  },
  {
    name: "audit:heu-current-state-inventory",
    reason: "Stage D / production NO-GO current-state alignment",
  },
  {
    name: "audit:heu-vietnamese-text-encoding",
    reason: "Readable Vietnamese text and no mojibake in touched docs/source",
  },
];

if (includeSecurity) {
  commands.push({
    name: "audit:heu-user-account-security",
    reason: "P0-17 user, role, password and cutover guard",
  });
}

if (includeRuntime) {
  commands.push(
    {
      name: "lint",
      reason: "Runtime/source lint after UI or shared code changes",
    },
    {
      name: "build",
      reason: "Next.js build after route, component or server-action changes",
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

function normalizeProcessText(value) {
  return value.replaceAll("\\", "/").toLowerCase();
}

function collectProcessCommandLines() {
  const result =
    process.platform === "win32"
      ? spawnSync(
          "powershell.exe",
          [
            "-NoProfile",
            "-Command",
            "Get-CimInstance Win32_Process -Filter \"name = 'node.exe'\" | ForEach-Object { $_.CommandLine }",
          ],
          {
            encoding: "utf8",
            maxBuffer: 1024 * 1024 * 2,
            windowsHide: true,
          },
        )
      : spawnSync("ps", ["-eo", "args="], {
          encoding: "utf8",
          maxBuffer: 1024 * 1024 * 2,
          windowsHide: true,
        });

  if (result.status !== 0) {
    return [];
  }

  return (result.stdout ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isNextRuntimeProcess(commandLine) {
  const normalized = normalizeProcessText(commandLine);
  const repoRoot = normalizeProcessText(process.cwd());

  if (!normalized.includes(repoRoot)) {
    return false;
  }

  return (
    normalized.includes(".next/dev/") ||
    normalized.includes("start-server.js") ||
    /next[^\r\n]*(\s|")dev(\s|$)/.test(normalized) ||
    /next[^\r\n]*(\s|")build(\s|$)/.test(normalized)
  );
}

function collectRuntimeBlockers() {
  const blockers = [];

  if (existsSync(path.join(process.cwd(), ".next", "lock"))) {
    blockers.push(".next/lock exists");
  }

  if (collectProcessCommandLines().some(isNextRuntimeProcess)) {
    blockers.push("active Next dev/build process for this repo");
  }

  return blockers;
}

function reportRuntimePreflight() {
  if (!includeRuntime) {
    return true;
  }

  const blockers = collectRuntimeBlockers();

  if (blockers.length > 0) {
    console.log(`HEU_FAST_LOOP_RUNTIME_PREFLIGHT: NO_GO - ${blockers.join("; ")}`);
    return false;
  }

  console.log("HEU_FAST_LOOP_RUNTIME_PREFLIGHT: READY - no active Next dev/build process or .next/lock detected.");
  return true;
}

function extractRelevantOutput(result) {
  const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error ? String(result.error) : ""}`
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const focused = combined.filter((line) =>
    /PASS|READY|NO_GO|BLOCKED|failed|error|missing|Production remains NO-GO|Stage D/i.test(
      line,
    ),
  );
  const lines = focused.length > 0 ? focused : combined;

  return lines.slice(-12);
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
    maxBuffer: 1024 * 1024 * 8,
    windowsHide: true,
  });
}

function pathFromStatusLine(line) {
  return line.replace(/^.. /, "").trim();
}

function areaForPath(filePath) {
  if (filePath.startsWith("app/")) return "app";
  if (filePath.startsWith("components/")) return "components";
  if (filePath.startsWith("docs/")) return "docs";
  if (filePath.startsWith("scripts/")) return "scripts";
  if (filePath.startsWith("database/")) return "database";
  return "other";
}

function summarizeAreas(entries) {
  const areas = {
    app: 0,
    components: 0,
    database: 0,
    docs: 0,
    other: 0,
    scripts: 0,
  };

  for (const entry of entries) {
    const area = areaForPath(pathFromStatusLine(entry));
    areas[area] += 1;
  }

  return areas;
}

function summarizeAreaSamples(entries) {
  const samples = {
    app: [],
    components: [],
    database: [],
    docs: [],
    other: [],
    scripts: [],
  };

  for (const entry of entries) {
    const filePath = pathFromStatusLine(entry);
    const area = areaForPath(filePath);

    if (samples[area].length < 3) {
      samples[area].push(filePath);
    }
  }

  return samples;
}

function formatAreaSamples(samples) {
  return ["app", "components", "docs", "scripts", "database", "other"]
    .map((area) => {
      const paths = samples[area].length > 0 ? samples[area].join(",") : "-";
      return `${area}=${paths}`;
    })
    .join("; ");
}

function nextGuardHints(snapshot) {
  if (snapshot.changedCount === 0) {
    return [
      "clean=no extra guard",
      "handoff=npm.cmd run check:heu-fast-local-loop -- --strict-worktree",
    ];
  }

  const hints = [];

  if (snapshot.areas.app > 0 || snapshot.areas.components > 0) {
    hints.push("runtime=npm.cmd run check:heu-fast-local-loop -- --runtime");
  }

  if (snapshot.areas.docs > 0) {
    hints.push(
      "docs=npm.cmd run audit:heu-current-state-inventory + npm.cmd run audit:heu-implementation-log + npm.cmd run audit:heu-vietnamese-text-encoding",
    );
  }

  if (snapshot.areas.scripts > 0) {
    hints.push("scripts=node --check touched scripts + npx.cmd eslint touched scripts");
  }

  if (snapshot.areas.database > 0) {
    hints.push(
      "database=npm.cmd run audit:ttgdtx-migration-order-guard + npm.cmd run audit:heu-sql-object-master-map",
    );
  }

  if (snapshot.areas.other > 0) {
    hints.push("other=manual scope review before handoff");
  }

  hints.push(
    "handoff=npm.cmd run check:heu-fast-local-loop -- --strict-worktree after the slice is separated",
  );

  return hints;
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

  const statusLines = (statusResult.stdout ?? "")
    .split(/\r?\n/)
    .filter(Boolean);
  const branch =
    statusLines.find((line) => line.startsWith("## "))?.slice(3) ??
    "UNKNOWN_BRANCH";
  const entries = statusLines.filter((line) => !line.startsWith("## "));
  const areas = summarizeAreas(entries);
  const areaSamples = summarizeAreaSamples(entries);
  const stagedCount = entries.filter((line) => line[0] !== " " && line[0] !== "?")
    .length;
  const modifiedCount = entries.filter(
    (line) => !line.startsWith("?? ") && line[1] !== " ",
  ).length;
  const untrackedCount = entries.filter((line) => line.startsWith("?? ")).length;
  const conflictedCount = entries.filter((line) => /^(UU|AA|DD|AU|UA|DU|UD) /.test(line))
    .length;
  const samplePaths = entries
    .slice(0, 8)
    .map((line) => pathFromStatusLine(line));

  return {
    ok: true,
    areaSamples,
    areas,
    branch,
    changedCount: entries.length,
    conflictedCount,
    modifiedCount,
    samplePaths,
    stagedCount,
    untrackedCount,
  };
}

function reportWorktreeSnapshot() {
  const snapshot = collectWorktreeSnapshot();

  if (!snapshot.ok) {
    console.log(`HEU_FAST_LOOP_WORKTREE: NO_GO - ${snapshot.detail}`);
    return false;
  }

  console.log(
    `HEU_FAST_LOOP_WORKTREE: branch=${snapshot.branch}; changed=${snapshot.changedCount}; staged=${snapshot.stagedCount}; modified=${snapshot.modifiedCount}; untracked=${snapshot.untrackedCount}; conflicted=${snapshot.conflictedCount}`,
  );
  console.log(
    `HEU_FAST_LOOP_WORKTREE_AREAS: app=${snapshot.areas.app}; components=${snapshot.areas.components}; docs=${snapshot.areas.docs}; scripts=${snapshot.areas.scripts}; database=${snapshot.areas.database}; other=${snapshot.areas.other}`,
  );
  console.log(
    `HEU_FAST_LOOP_AREA_SAMPLE: ${formatAreaSamples(snapshot.areaSamples)}`,
  );
  console.log(
    `HEU_FAST_LOOP_NEXT_GUARDS: ${nextGuardHints(snapshot).join("; ")}`,
  );

  if (snapshot.samplePaths.length > 0) {
    console.log(
      `HEU_FAST_LOOP_WORKTREE_SAMPLE: ${snapshot.samplePaths.join(" | ")}`,
    );
  }

  if (snapshot.changedCount === 0) {
    console.log("HEU_FAST_LOOP_WORKTREE_SCOPE: CLEAN");
    return true;
  }

  console.log(
    strictWorktree
      ? "HEU_FAST_LOOP_WORKTREE_SCOPE: NO_GO - dirty worktree under --strict-worktree; separate or clean the current slice before handoff."
      : "HEU_FAST_LOOP_WORKTREE_SCOPE: DIRTY_WARN_ONLY - preserve existing changes and separate current-slice files before handoff.",
  );

  return !strictWorktree;
}

console.log("HEU fast local control loop");
console.log(
  "Mode: PASS_LOCAL read-only checks. No account creation, password handling, email, task, migration, UAT, evidence acceptance, finance reliance, owner GO or production GO.",
);
console.log(
  includeRuntime
    ? "Runtime mode: lint and build are included because --runtime was provided."
    : "Default mode: runtime lint/build are skipped; use --runtime after UI, route, server-action or shared runtime changes.",
);
console.log(
  includeSecurity
    ? "Security mode: user-account security audit is included because --security was provided."
    : "Security mode: user-account security audit is skipped by default; use --security for P0-17/P6-04 slices.",
);
console.log(
  strictWorktree
    ? "Worktree mode: strict; dirty worktree returns NO_GO before guard execution."
    : "Worktree mode: warn-only; dirty worktree is reported but preserved.",
);

if (!reportWorktreeSnapshot()) {
  console.error("HEU_FAST_LOCAL_LOOP_READY: NO_GO at worktree snapshot.");
  process.exit(1);
}

if (!reportRuntimePreflight()) {
  console.error("HEU_FAST_LOCAL_LOOP_READY: NO_GO at runtime preflight; stop the active localhost dev/build process before build verification.");
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
    const relevantOutput = extractRelevantOutput(result);

    if (relevantOutput.length > 0) {
      console.error("Relevant output:");
      for (const line of relevantOutput) {
        console.error(`  ${line}`);
      }
    }

    console.error(
      `HEU_FAST_LOCAL_LOOP_READY: NO_GO at ${command.name}; stop before widening scope.`,
    );
    process.exit(result.status ?? 1);
  }
}

const totalDuration = elapsedMs(startedAt);

console.log(
  `HEU_FAST_LOCAL_LOOP_READY: PASS_LOCAL (${results.length}/${commands.length} checks, ${totalDuration} ms)`,
);
console.log(
  "Next: keep the next action to one small PASS_LOCAL slice, or rerun with --runtime/--security when the changed surface requires it.",
);
