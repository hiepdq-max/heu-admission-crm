import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function fail(message) {
  console.error(`NO_GO ${message}`);
  process.exit(1);
}

function requireText(text, pattern, label, path) {
  const ok =
    typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);

  if (!ok) {
    fail(`${label} missing in ${path}`);
  }

  console.log(`READY ${label}`);
}

function requireAllText(text, patterns, label, path) {
  for (const pattern of patterns) {
    const ok =
      typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);

    if (!ok) {
      fail(`${label} missing ${pattern.toString()} in ${path}`);
    }
  }

  console.log(`READY ${label}`);
}

console.log("HEU AppShell quick lane labels readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords and signed evidence are never printed by this script.",
);

const appShellPath = "components/layout/app-shell.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const appShell = read(appShellPath);
const executiveReadiness = read(executiveReadinessPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

requireText(
  appShell,
  /data-heu-quick-lane-labels="STD-21_QUICK_LANE_LABELS"[\s\S]*data-heu-quick-lane-labels-boundary="COMPACT_LABELS NO_LONG_COPY NO_STATE_MUTATION NO_APPROVAL_ACTION NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-quick-lane-labels-overflow-guard="STD-21_NO_OVERFLOW"/,
  "APP-SHELL-STD21-QUICK-LANE-LABELS-ANCHOR",
  appShellPath,
);
requireText(
  appShell,
  /data-heu-quick-lane-labels="STD-21_QUICK_LANE_LABELS"[\s\S]*<span className="truncate">BGH focus<\/span>[\s\S]*Read-only[\s\S]*data-heu-workspace-quick-lane-label="STD-21_WORKSPACE_QUICK_LANE_LABEL"[\s\S]*<span className="truncate">Workspace<\/span>[\s\S]*P0-13/,
  "APP-SHELL-STD21-BGH-WORKSPACE-LABEL-ORDER",
  appShellPath,
);
requireAllText(
  appShell,
  [
    "STD-21_QUICK_LANE_LABELS",
    "STD-21_WORKSPACE_QUICK_LANE_LABEL",
    "COMPACT_LABELS",
    "NO_LONG_COPY",
    "BGH focus",
    "Read-only",
    "Workspace",
    "P0-13",
    "LayoutDashboard",
    "Route",
    "STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION",
    "P0-13_WORKSPACE_QUICK_LINKS",
    "min-w-0",
    "truncate",
    "shrink-0",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
    "NO_STATE_MUTATION",
    "NO_APPROVAL_ACTION",
    "NO_UAT_ACCEPTANCE",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_FINANCE_ACTION",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
  ],
  "APP-SHELL-STD21-QUICK-LANE-LABEL-TOKENS",
  appShellPath,
);
requireAllText(
  executiveReadiness,
  [
    "APP-SHELL-QUICK-LANE-LABELS-ANCHOR",
    "APP-SHELL-QUICK-LANE-LABELS-TOKENS",
    "PASS_LOCAL_QUICK_LANE_LABELS",
    "check:heu-appshell-quick-lane-labels-readiness",
  ],
  "EXECUTIVE-READINESS-STD21",
  executiveReadinessPath,
);
requireAllText(
  blueprint,
  [
    "STD-21",
    "STD-21_QUICK_LANE_LABELS",
    "PASS_LOCAL_QUICK_LANE_LABELS",
    "COMPACT_LABELS",
    "NO_LONG_COPY",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
  ],
  "BLUEPRINT-STD21-QUICK-LANE-LABELS",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-21 AppShell Quick Lane Labels",
    'data-heu-quick-lane-labels="STD-21_QUICK_LANE_LABELS"',
    'data-heu-workspace-quick-lane-label="STD-21_WORKSPACE_QUICK_LANE_LABEL"',
    "BGH focus",
    "Workspace",
    "check:heu-appshell-quick-lane-labels-readiness",
    "PASS_LOCAL_QUICK_LANE_LABELS",
    "does not grant access",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD21",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-appshell-quick-lane-labels-readiness"] !==
  "node scripts/check-heu-appshell-quick-lane-labels-readiness.mjs"
) {
  fail("package.json missing check:heu-appshell-quick-lane-labels-readiness script");
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_APPSHELL_QUICK_LANE_LABELS_READY / NO_GO / BLOCKED: PASS_LOCAL_QUICK_LANE_LABELS. This check verifies compact AppShell lane labels only; it does not grant access, expand permissions, mutate workflow state, execute UAT, accept evidence, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
