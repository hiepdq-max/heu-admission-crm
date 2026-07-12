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

console.log("HEU executive UAT/evidence fast action readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, cookies and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const uatEvidencePath = "scripts/check-heu-uat-evidence-route-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const uatEvidence = read(uatEvidencePath);
const visualQa = read(visualQaPath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const fastActionTokens = [
  "ExecutiveUatEvidenceFastAction",
  "uatEvidenceFastActionRows",
  "STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE",
  "STD-36 UAT/evidence fast action queue",
  "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
  "FAST_ACTION_QUEUE",
  "P0-14",
  "P6-04",
  "P2-18",
  "P5-03",
  "P6-03",
  "P6-06",
  "P0-09",
  "P0-15",
  "SIGNED_UAT_PENDING",
  "CONTROLLED_EVIDENCE_REQUIRED",
  "OWNER_SIGNOFF_PENDING",
  "NO_EVIDENCE_UPLOAD",
  "NO_UAT_EXECUTION",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_ACCESS_GRANT",
  "NO_ACCESS_CLOSURE",
  "NO_PERMISSION_EXPANSION",
  "NO_FINANCE_RELIANCE",
  "NO_LEGAL_CONCLUSION",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
  "UAT-FAST-01",
  "UAT-FAST-02",
  "UAT-FAST-03",
  "UAT-FAST-04",
  "UAT-FAST-05",
  "UAT-FAST-06",
  "P0-14 controlled evidence intake",
  "P6-04 role/workspace proof",
  "P2-18/P5-03 finance signed proof",
  "P0-19 legal/SOP confirmation",
  "P6-03/P6-06 audit and cascade closure",
  "P0-09/P0-15 final owner packet",
  "Create the external evidence id",
  "Open scope controls",
  "Open Finance Desk/P2-18 route",
  "Open legal gates",
  "Open audit lane",
  "Open Master Control",
];

requireText(
  executiveDashboard,
  /data-heu-executive-uat-evidence-fast-action="STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE"[\s\S]*data-heu-executive-uat-evidence-fast-action-boundary="PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE READ_ONLY FAST_ACTION_QUEUE P0-14 P6-04 P2-18 P5-03 P6-03 P6-06 P0-09 P0-15 SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING NO_EVIDENCE_UPLOAD NO_UAT_EXECUTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_ACCESS_GRANT NO_ACCESS_CLOSURE NO_PERMISSION_EXPANSION NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-uat-evidence-fast-action-overflow-guard="STD-36_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD36-UAT-EVIDENCE-FAST-ACTION-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  fastActionTokens,
  "EXEC-DASHBOARD-STD36-UAT-EVIDENCE-FAST-ACTION-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-UAT-EVIDENCE-FAST-ACTION-ANCHOR",
    "EXEC-DASHBOARD-UAT-EVIDENCE-FAST-ACTION-TOKENS",
    "EXEC-DASHBOARD-UAT-EVIDENCE-ACCEPTANCE-LOCK-ANCHOR",
    "EXEC-DASHBOARD-UAT-EVIDENCE-ACCEPTANCE-LOCK-TOKENS",
    "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "check:heu-executive-uat-evidence-fast-action-readiness",
    "check:heu-executive-uat-evidence-acceptance-lock-readiness",
  ],
  "EXECUTIVE-READINESS-STD36",
  executiveReadinessPath,
);
requireAllText(
  uatEvidence,
  [
    "STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "UAT-FAST-01",
    "UAT-FAST-06",
    "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  ],
  "UAT-EVIDENCE-STD36",
  uatEvidencePath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-uat-evidence-fast-action="STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE"',
    'data-heu-executive-uat-evidence-acceptance-lock="STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK"',
    "STD-36 UAT/evidence fast action queue",
    "UAT-FAST-01",
    "UAT-FAST-06",
    "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "STD-42 UAT/evidence acceptance lock",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  ],
  "VISUAL-QA-STD36",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-36",
    "STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "FAST_ACTION_QUEUE",
    "NO_EVIDENCE_UPLOAD",
    "NO_UAT_ACCEPTANCE",
    "NO_EVIDENCE_ACCEPTANCE",
    "NO_ACCESS_CLOSURE",
    "STD-42",
    "STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "ACCEPTANCE_LOCK",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
  ],
  "BLUEPRINT-STD36",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-36 Executive UAT Evidence Fast Action Queue",
    'data-heu-executive-uat-evidence-fast-action="STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE"',
    "UAT-FAST-01",
    "UAT-FAST-06",
    "PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE",
    "check:heu-executive-uat-evidence-fast-action-readiness",
    /does not upload evidence/i,
    "accept evidence",
    "mark production GO",
    "STD-42 Executive UAT Evidence Acceptance Lock",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  ],
  "IMPLEMENTATION-LOG-STD36",
  implementationLogPath,
);

if (
  packageJson.scripts?.[
    "check:heu-executive-uat-evidence-fast-action-readiness"
  ] !==
  "node scripts/check-heu-executive-uat-evidence-fast-action-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-uat-evidence-fast-action-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
if (
  packageJson.scripts?.[
    "check:heu-executive-uat-evidence-acceptance-lock-readiness"
  ] !==
  "node scripts/check-heu-executive-uat-evidence-acceptance-lock-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-uat-evidence-acceptance-lock-readiness script",
  );
}

console.log("READY PACKAGE-EXECUTIVE-UAT-EVIDENCE-ACCEPTANCE-LOCK-SCRIPT");
console.log(
  "HEU_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_READY / NO_GO / BLOCKED: PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE with PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK. This check verifies the executive UAT/evidence fast action queue only; it does not upload evidence, collect evidence, move raw evidence, execute UAT, accept UAT, accept evidence, grant access, close access, approve finance reliance, issue legal conclusions, approve owner GO/NO-GO or mark production GO.",
);
