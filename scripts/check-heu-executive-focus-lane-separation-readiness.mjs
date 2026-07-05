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

console.log("HEU executive focus lane separation readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords and signed evidence are never printed by this script.",
);

const appShellPath = "components/layout/app-shell.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const globalFocusPath =
  "scripts/check-heu-executive-global-focus-shortcuts-readiness.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const appShell = read(appShellPath);
const executiveReadiness = read(executiveReadinessPath);
const globalFocus = read(globalFocusPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

requireText(
  appShell,
  /data-heu-executive-focus-lane-separation="STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION"[\s\S]*data-heu-executive-focus-lane-separation-boundary="EXECUTIVE_ONLY SEPARATE_FROM_WORKSPACE READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_STATE_MUTATION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-focus-lane-separation-overflow-guard="STD-20_NO_OVERFLOW"/,
  "APP-SHELL-STD20-FOCUS-LANE-SEPARATION-ANCHOR",
  appShellPath,
);
requireText(
  appShell,
  /const executiveFocusQuickLinks = isExecutive[\s\S]*buildExecutiveFocusQuickLinks\(workspace\?\.activeSegmentId \?\? null\)[\s\S]*const workspaceQuickLinks = buildWorkspaceQuickLinks[\s\S]*executiveFocusQuickLinks\.length > 0 \? \([\s\S]*data-heu-executive-focus-lane-separation="STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION"[\s\S]*aria-label=\{`Mo nhanh BGH focus: \$\{link\.label\}`\}[\s\S]*\) : null\}[\s\S]*workspaceQuickLinks\.length > 0 \? \([\s\S]*data-heu-workspace-quick-links="P0-13_WORKSPACE_QUICK_LINKS"/,
  "APP-SHELL-STD20-EXECUTIVE-BEFORE-WORKSPACE-LANES",
  appShellPath,
);
requireAllText(
  appShell,
  [
    "STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION",
    "SEPARATE_FROM_WORKSPACE",
    "executiveFocusQuickLinks",
    "workspaceQuickLinks",
    "Mo nhanh BGH focus",
    "STD-19_EXECUTIVE_GLOBAL_FOCUS_SHORTCUTS",
    "P0-13_WORKSPACE_QUICK_LINKS",
    "P0-13_WORKSPACE_QUICK_OPEN_DAILY",
    "P0-13_WORKSPACE_QUICK_LINKS_NO_OVERFLOW",
    "EXECUTIVE_ONLY",
    "READ_ONLY_ROUTE_HINT",
    "FOCUS_QUERY_PARAM",
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
  "APP-SHELL-STD20-FOCUS-LANE-SEPARATION-TOKENS",
  appShellPath,
);
requireAllText(
  globalFocus,
  [
    "APP-SHELL-STD19-SEPARATE-EXECUTIVE-LANE",
    "STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION",
    "SEPARATE_FROM_WORKSPACE",
  ],
  "GLOBAL-FOCUS-STD20-INTEGRATION",
  globalFocusPath,
);
requireAllText(
  executiveReadiness,
  [
    "APP-SHELL-EXECUTIVE-FOCUS-LANE-SEPARATION-ANCHOR",
    "APP-SHELL-EXECUTIVE-FOCUS-LANE-SEPARATION-TOKENS",
    "PASS_LOCAL_FOCUS_LANE_SEPARATION",
    "check:heu-executive-focus-lane-separation-readiness",
  ],
  "EXECUTIVE-READINESS-STD20",
  executiveReadinessPath,
);
requireAllText(
  blueprint,
  [
    "STD-20",
    "STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION",
    "PASS_LOCAL_FOCUS_LANE_SEPARATION",
    "SEPARATE_FROM_WORKSPACE",
    "EXECUTIVE_ONLY",
    "READ_ONLY_ROUTE_HINT",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
  ],
  "BLUEPRINT-STD20-FOCUS-LANE-SEPARATION",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-20 Executive Focus Lane Separation",
    'data-heu-executive-focus-lane-separation="STD-20_EXECUTIVE_FOCUS_LANE_SEPARATION"',
    "executive focus lane",
    "P0-13 workspace quick strip",
    "check:heu-executive-focus-lane-separation-readiness",
    "PASS_LOCAL_FOCUS_LANE_SEPARATION",
    "does not grant access",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD20",
  implementationLogPath,
);

if (
  packageJson.scripts?.[
    "check:heu-executive-focus-lane-separation-readiness"
  ] !== "node scripts/check-heu-executive-focus-lane-separation-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-focus-lane-separation-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_FOCUS_LANE_SEPARATION_READY / NO_GO / BLOCKED: PASS_LOCAL_FOCUS_LANE_SEPARATION. This check verifies executive focus shortcuts are separated from workspace quick links; it does not grant access, expand permissions, mutate workflow state, execute UAT, accept evidence, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
