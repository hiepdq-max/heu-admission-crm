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

console.log("HEU executive UAT/evidence triage readiness check");
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

const triageTokens = [
  "ExecutiveUatEvidenceClosure",
  "uatEvidenceClosureRows",
  "STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE",
  "STD-27 UAT/evidence closure triage",
  "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
  "P0-14",
  "P6-04",
  "P2-18",
  "P5-03",
  "P0-09",
  "P0-15",
  "P0-17",
  "SIGNED_UAT_PENDING",
  "CONTROLLED_EVIDENCE_REQUIRED",
  "OWNER_SIGNOFF_PENDING",
  "NO_UAT_EXECUTION",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_ACCESS_CLOSURE",
  "NO_ACCESS_GRANT",
  "NO_PERMISSION_EXPANSION",
  "NO_FINANCE_RELIANCE",
  "NO_LEGAL_CONCLUSION",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
  "UAT-CLOSE-01",
  "UAT-CLOSE-02",
  "UAT-CLOSE-03",
  "UAT-CLOSE-04",
  "UAT-CLOSE-05",
  "Controlled evidence location",
  "Signed UAT route state",
  "Role/access closure dependency",
  "Finance/legal reliance dependency",
  "Final owner decision pack",
];

requireText(
  executiveDashboard,
  /data-heu-executive-uat-evidence-closure-triage="STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE"[\s\S]*data-heu-executive-uat-evidence-closure-boundary="PASS_LOCAL_UAT_EVIDENCE_TRIAGE READ_ONLY P0-14 P6-04 P2-18 P5-03 P0-09 P0-15 P0-17 SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING NO_UAT_EXECUTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_ACCESS_CLOSURE NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-uat-evidence-closure-overflow-guard="STD-27_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD27-UAT-EVIDENCE-TRIAGE-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  triageTokens,
  "EXEC-DASHBOARD-STD27-UAT-EVIDENCE-TRIAGE-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-UAT-EVIDENCE-CLOSURE-TRIAGE-ANCHOR",
    "EXEC-DASHBOARD-UAT-EVIDENCE-CLOSURE-TRIAGE-TOKENS",
    "EXEC-DASHBOARD-UAT-EVIDENCE-ACCEPTANCE-LOCK-ANCHOR",
    "EXEC-DASHBOARD-UAT-EVIDENCE-ACCEPTANCE-LOCK-TOKENS",
    "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "check:heu-executive-uat-evidence-triage-readiness",
    "check:heu-executive-uat-evidence-acceptance-lock-readiness",
  ],
  "EXECUTIVE-READINESS-STD27",
  executiveReadinessPath,
);
requireAllText(
  uatEvidence,
  [
    "STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE",
    "UAT-CLOSE-01",
    "UAT-CLOSE-05",
    "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
    "STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  ],
  "UAT-EVIDENCE-STD27",
  uatEvidencePath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-uat-evidence-closure-triage="STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE"',
    'data-heu-executive-uat-evidence-acceptance-lock="STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK"',
    "STD-27 UAT/evidence closure triage",
    "UAT-CLOSE-01",
    "UAT-CLOSE-05",
    "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
    "STD-42 UAT/evidence acceptance lock",
    "UAT-LOCK-01",
    "UAT-LOCK-06",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  ],
  "VISUAL-QA-STD27",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-27",
    "STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE",
    "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
    "SIGNED_UAT_PENDING",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "OWNER_SIGNOFF_PENDING",
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
  "BLUEPRINT-STD27",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-27 Executive UAT Evidence Triage",
    'data-heu-executive-uat-evidence-closure-triage="STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE"',
    "UAT-CLOSE-01",
    "UAT-CLOSE-05",
    "PASS_LOCAL_UAT_EVIDENCE_TRIAGE",
    "check:heu-executive-uat-evidence-triage-readiness",
    /does not execute UAT/i,
    "accept evidence",
    "mark production GO",
    "STD-42 Executive UAT Evidence Acceptance Lock",
    "PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK",
  ],
  "IMPLEMENTATION-LOG-STD27",
  implementationLogPath,
);

if (
  packageJson.scripts?.["check:heu-executive-uat-evidence-triage-readiness"] !==
  "node scripts/check-heu-executive-uat-evidence-triage-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-uat-evidence-triage-readiness script",
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
  "HEU_EXECUTIVE_UAT_EVIDENCE_TRIAGE_READY / NO_GO / BLOCKED: PASS_LOCAL_UAT_EVIDENCE_TRIAGE with PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK. This check verifies executive UAT/evidence triage only; it does not collect evidence, upload evidence, move raw evidence, execute UAT, accept UAT, accept evidence, grant access, close access, approve finance reliance, approve owner GO/NO-GO or mark production GO.",
);
