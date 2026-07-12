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

function forbidAllText(text, patterns, label, path) {
  for (const pattern of patterns) {
    const found =
      typeof pattern === "string" ? text.includes(pattern) : pattern.test(text);

    if (found) {
      fail(`${label} found forbidden ${pattern.toString()} in ${path}`);
    }
  }

  console.log(`READY ${label}`);
}

console.log("HEU executive global focus compact labels readiness check");
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
  /data-heu-executive-focus-compact-labels="STD-31_EXECUTIVE_GLOBAL_FOCUS_COMPACT_LABELS"[\s\S]*data-heu-executive-focus-compact-labels-boundary="PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS EXECUTIVE_ONLY COMPACT_LABELS READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM NO_LONG_COPY NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_STATE_MUTATION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-focus-compact-labels-overflow-guard="STD-31_NO_OVERFLOW"/,
  "APP-SHELL-STD31-COMPACT-LABELS-ANCHOR",
  appShellPath,
);
requireAllText(
  appShell,
  [
    "buildExecutiveFocusQuickLinks",
    "Tổng quan",
    "Báo cáo",
    "Tài chính",
    "Bằng chứng",
    "Phân quyền",
    "Pháp chế",
    "M01-M12",
    "Blocker",
    'href: focusHref("roles")',
    "PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS",
    "COMPACT_LABELS",
    "NO_LONG_COPY",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
    "NO_FINANCE_ACTION",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
  ],
  "APP-SHELL-STD31-COMPACT-LABELS-TOKENS",
  appShellPath,
);
forbidAllText(
  appShell,
  [
    "BGH overview",
    "BGH reports",
    "BGH finance",
    "BGH evidence",
    "BGH roles",
    "BGH legal",
    "BGH modules",
    "BGH blockers",
  ],
  "APP-SHELL-STD31-NO-LONG-BGH-LABELS",
  appShellPath,
);
requireAllText(
  executiveReadiness,
  [
    "APP-SHELL-EXECUTIVE-GLOBAL-FOCUS-COMPACT-LABELS-ANCHOR",
    "PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS",
    "STD-31_NO_OVERFLOW",
  ],
  "EXECUTIVE-READINESS-STD31",
  executiveReadinessPath,
);
requireAllText(
  globalFocus,
  [
    "Tổng quan",
    "Báo cáo",
    "Tài chính",
    "Bằng chứng",
    "Phân quyền",
    "Pháp chế",
    "M01-M12",
    "Blocker",
  ],
  "GLOBAL-FOCUS-GUARD-USES-COMPACT-LABELS",
  globalFocusPath,
);
requireAllText(
  blueprint,
  [
    "STD-31",
    "STD-31_EXECUTIVE_GLOBAL_FOCUS_COMPACT_LABELS",
    "PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS",
    "COMPACT_LABELS",
    "NO_LONG_COPY",
    "NO_ACCESS_GRANT",
    "NO_PERMISSION_EXPANSION",
  ],
  "BLUEPRINT-STD31-COMPACT-LABELS",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-31 Executive Global Focus Compact Labels",
    'data-heu-executive-focus-compact-labels="STD-31_EXECUTIVE_GLOBAL_FOCUS_COMPACT_LABELS"',
    "Tổng quan",
    "Báo cáo",
    "Tài chính",
    "Bằng chứng",
    "Phân quyền",
    "Pháp chế",
    "M01-M12",
    "Blocker",
    "check:heu-executive-global-focus-compact-labels-readiness",
    "PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS",
    "does not grant access",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD31",
  implementationLogPath,
);

if (
  packageJson.scripts?.[
    "check:heu-executive-global-focus-compact-labels-readiness"
  ] !==
  "node scripts/check-heu-executive-global-focus-compact-labels-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-global-focus-compact-labels-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_GLOBAL_FOCUS_COMPACT_LABELS_READY / NO_GO / BLOCKED: PASS_LOCAL_GLOBAL_FOCUS_COMPACT_LABELS. This check verifies compact executive route labels only; it does not grant access, expand permissions, mutate workflow state, execute UAT, accept evidence, approve finance action, approve owner GO/NO-GO or mark production GO.",
);
