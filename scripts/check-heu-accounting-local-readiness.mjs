import { spawnSync } from "node:child_process";

const strictWorktree = process.argv.includes("--strict-worktree");
const continueOnNoGo = process.argv.includes("--continue-on-no-go");

const commands = [
  {
    name: "check:heu-accounting-module-breakdown",
    reason: "ACCT-00..ACCT-12 local completion map is present",
  },
  {
    name: "check:heu-user-scope-baseline-repair-queue",
    reason: "ACCT-00 active user visibility and business-scope baseline repair queue",
  },
  {
    name: "check:heu-finance-payment-scope-readiness",
    reason: "finance/payment views stay scoped to TC9_TTGDTX_LINKED",
  },
  {
    name: "check:heu-negative-control-account-queue",
    reason: "ACCT-00 negative-control baseline and out-of-scope account proof",
  },
  {
    name: "check:heu-accounting-negative-control-owner-action-queue",
    reason:
      "ACCT-00 negative-control owner-action queue is packaged around the live scope and negative-account blockers",
  },
  {
    name: "audit:ttgdtx-operating-control-ui",
    reason: "ACCT-01 operating-control spine is visible on accounting routes",
  },
  {
    name: "audit:ttgdtx-contract-tuition-master-guard",
    reason: "ACCT-02 contract and tuition basis remain finance-gated",
  },
  {
    name: "audit:heu-role-scope-uat-pack",
    reason: "P6-04 role/workspace UAT pack is wired",
  },
  {
    name: "audit:ttgdtx-p019-gate-guard",
    reason: "P0-19 legal/finance gate blocks unsigned reliance",
  },
  {
    name: "audit:ttgdtx-payment-dossier-checklist",
    reason: "P2-15/P2-16/P2-17 dossier and approval separation are visible",
  },
  {
    name: "audit:ttgdtx-invoice-policy",
    reason: "ACCT-05 invoice/chung-tu policy blocks unresolved downstream reliance",
  },
  {
    name: "audit:vnd-money-format",
    reason: "ACCT-05 money parsing/display stays VND-safe",
  },
  {
    name: "audit:ttgdtx-period-lock-policy",
    reason: "ACCT-06 locked periods require human adjustment evidence",
  },
  {
    name: "audit:ttgdtx-reconciliation-repair-safety",
    reason: "ACCT-06 reconciliation repair path preserves invoice-control logic",
  },
  {
    name: "audit:ttgdtx-receivable-payment-lifecycle",
    reason: "ACCT-04..ACCT-06 receivable/payment lifecycle prevents unsafe transitions",
  },
  {
    name: "check:heu-accounting-no-duplicate-control-ledger",
    reason: "ACCT-04..ACCT-09 no-duplicate ledger is packaged across receivable, collection, reconciliation, request and payout",
  },
  {
    name: "audit:ttgdtx-payout-duplicate-guard",
    reason: "P2-17 duplicate payout guard is packaged",
  },
  {
    name: "audit:ttgdtx-payout-execution-readiness",
    reason: "P2-17 operator pre-pay checks are packaged",
  },
  {
    name: "audit:ttgdtx-dashboard-source-reconciliation",
    reason: "P2-18 dashboard source reconciliation is packaged",
  },
  {
    name: "audit:heu-finance-desk",
    reason: "P5-03 Finance Desk remains read-only and scoped",
  },
  {
    name: "audit:ttgdtx-audit-log",
    reason: "P6-03 TTGDTX write tables keep audit-log trigger coverage",
  },
  {
    name: "audit:ttgdtx-audit-trail-guard",
    reason: "audit page exposes TTGDTX traceability without write action",
  },
  {
    name: "audit:hard-delete-boundary-guard",
    reason: "P6-06 hard-delete/cascade boundary remains visible",
  },
  {
    name: "audit:ttgdtx-backup-restore-dry-run-pack",
    reason: "P0-03 backup/restore evidence pack stays local-only",
  },
  {
    name: "audit:ttgdtx-migration-order-guard",
    reason: "Step90-Step110 migration-order guard is packaged",
  },
  {
    name: "check:heu-accounting-risk-closure-ledger",
    reason: "ACCT-11 risk closure ledger still requires external evidence and owner decisions",
  },
  {
    name: "audit:ttgdtx-signed-uat-execution-routing-hub",
    reason: "UAT-ROUTE-01..11 routing hub remains PASS_LOCAL only",
  },
  {
    name: "audit:ttgdtx-production-owner-signoff-pack",
    reason: "P0-09 owner GO/NO-GO pack remains explicit",
  },
  {
    name: "audit:ttgdtx-production-readiness-guard",
    reason: "production NO-GO blockers remain visible in app",
  },
  {
    name: "check:heu-accounting-owner-closure-ledger",
    reason: "ACCT-12 owner/UAT closure ledger still requires signed route evidence and owner decisions",
  },
  {
    name: "check:heu-accounting-open-blocker-action-queue",
    reason: "ACCT-00/11/12 open blocker owner-action queue is packaged",
  },
  {
    name: "audit:ttgdtx-release-gates",
    reason: "release-gate guard keeps the accounting chain in the full TTGDTX pack",
  },
];

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
    maxBuffer: 1024 * 1024 * 12,
    windowsHide: true,
  });
}

function focusedOutput(result) {
  const lines = `${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error ? String(result.error) : ""}`
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const focused = lines.filter((line) =>
    /READY|PASS|PASS_LOCAL|NO_GO|BLOCKED|failed|error|missing|Production remains NO-GO|Stage D/i.test(
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
  const sample = entries
    .slice(0, 10)
    .map((line) => line.replace(/^.. /, "").trim());

  return {
    ok: true,
    branch,
    changed: entries.length,
    conflicted: entries.filter((line) =>
      /^(UU|AA|DD|AU|UA|DU|UD) /.test(line),
    ).length,
    sample,
    untracked: entries.filter((line) => line.startsWith("?? ")).length,
  };
}

function reportWorktreeSnapshot() {
  const snapshot = collectWorktreeSnapshot();

  if (!snapshot.ok) {
    console.log(`HEU_ACCOUNTING_WORKTREE: NO_GO - ${snapshot.detail}`);
    return false;
  }

  console.log(
    `HEU_ACCOUNTING_WORKTREE: branch=${snapshot.branch}; changed=${snapshot.changed}; untracked=${snapshot.untracked}; conflicted=${snapshot.conflicted}`,
  );

  if (snapshot.sample.length > 0) {
    console.log(`HEU_ACCOUNTING_WORKTREE_SAMPLE: ${snapshot.sample.join(" | ")}`);
  }

  if (snapshot.changed === 0) {
    console.log("HEU_ACCOUNTING_WORKTREE_SCOPE: CLEAN");
    return true;
  }

  console.log(
    strictWorktree
      ? "HEU_ACCOUNTING_WORKTREE_SCOPE: NO_GO - dirty worktree under --strict-worktree; separate or clean the current slice before handoff."
      : "HEU_ACCOUNTING_WORKTREE_SCOPE: DIRTY_WARN_ONLY - existing changes are preserved; report current-slice files separately before handoff.",
  );

  return !strictWorktree;
}

console.log("HEU accounting local readiness gate");
console.log(
  "Mode: PASS_LOCAL read-only checks. No account creation, password handling, email, task, migration, UAT execution, evidence acceptance, finance reliance, owner GO or production GO.",
);
console.log(
  continueOnNoGo
    ? "Execution mode: continue-on-no-go; all checks run and the final summary decides readiness."
    : "Execution mode: full summary; all checks run and the final summary decides readiness.",
);

if (!reportWorktreeSnapshot()) {
  console.error("ACCT_LOCAL_READY: NO_GO at worktree snapshot.");
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
const passedCount = results.length - failed.length;

function blockerNames() {
  return failed.length > 0 ? failed.map((failure) => failure.command).join(",") : "none";
}

if (failed.length > 0) {
  console.error(
    `ACCT_LOCAL_READY: NO_GO (${results.length - failed.length}/${results.length} checks passed, ${totalDuration} ms).`,
  );
  console.error(
    `ACCT_LOCAL_SUMMARY: status=NO_GO; passed=${passedCount}; total=${results.length}; failed=${failed.length}; duration_ms=${totalDuration}`,
  );
  console.error(`ACCT_LOCAL_BLOCKERS: ${blockerNames()}`);
  console.error(
    "ACCT_LOCAL_NEXT_ACTION: close_owner_external_blockers=ACCT-00,ACCT-11,ACCT-12; no_auto_fix=true",
  );
  console.error(
    `TOM_TAT_KE_TOAN: NO_GO - ${results.length - failed.length}/${results.length} kiểm tra PASS; còn ${failed.length} blocker phải được owner/evidence đóng trước UAT nội bộ.`,
  );
  console.error(
    "VIEC_CAN_LAM_TIEP: đóng ACCT-00 scope baseline và negative-control account; đóng ACCT-11 evidence/owner; đóng ACCT-12 signed UAT/owner route.",
  );
  console.error(
    "Accounting remains PASS_LOCAL-packaged only. Close the listed NO_GO checks before signed browser UAT, finance reliance, owner GO/NO-GO or production GO.",
  );
  for (const failure of failed) {
    console.error(`- ${failure.command}: ${failure.reason}`);
  }
  process.exit(1);
}

console.log(
  `ACCT_LOCAL_READY: PASS_LOCAL (${results.length}/${results.length} checks, ${totalDuration} ms).`,
);
console.log(
  `ACCT_LOCAL_SUMMARY: status=PASS_LOCAL; passed=${results.length}; total=${results.length}; failed=0; duration_ms=${totalDuration}`,
);
console.log("ACCT_LOCAL_BLOCKERS: none");
console.log(
  "ACCT_LOCAL_NEXT_ACTION: signed_uat_external_flow=required; no_auto_approval=true",
);
console.log(
  `TOM_TAT_KE_TOAN: PASS_LOCAL - ${results.length}/${results.length} kiểm tra local PASS; đây chỉ là đóng gói local, không tự approve UAT, finance reliance, owner GO/NO-GO hay production GO.`,
);
console.log(
  "VIEC_CAN_LAM_TIEP: chuyển sang signed browser UAT, controlled evidence, finance reliance, owner GO/NO-GO và production GO theo luồng ngoài Git/Codex/chat.",
);
console.log(
  "This proves local packaging only; signed UAT, controlled evidence, finance reliance, owner GO/NO-GO and production GO remain separate external decisions.",
);
