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

console.log("HEU executive production blocker triage readiness check");
console.log(
  "Secrets, raw PII, bank data, vouchers, passwords, cookies and signed evidence are never printed by this script.",
);

const executiveDashboardPath =
  "components/dashboard/executive-dashboard-overview.tsx";
const executiveReadinessPath =
  "scripts/check-heu-executive-dashboard-readiness.mjs";
const visualQaPath = "scripts/check-heu-executive-dashboard-visual-qa.mjs";
const productionBlockerSourcePath =
  "scripts/audit-heu-production-blocker-source.mjs";
const blueprintPath = "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md";
const implementationLogPath = "docs/HEU_IMPLEMENTATION_LOG.md";
const packageJsonPath = "package.json";

const executiveDashboard = read(executiveDashboardPath);
const executiveReadiness = read(executiveReadinessPath);
const visualQa = read(visualQaPath);
const productionBlockerSource = read(productionBlockerSourcePath);
const blueprint = read(blueprintPath);
const implementationLog = read(implementationLogPath);
const packageJson = JSON.parse(read(packageJsonPath));

const triageTokens = [
  "ExecutiveProductionBlockerTriage",
  "productionBlockerTriageRows",
  "STD-28_EXECUTIVE_PRODUCTION_BLOCKER_TRIAGE",
  "STD-28 Production blocker owner triage",
  "PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE",
  "BACKUP_RESTORE_PROOF_REQUIRED",
  "MIGRATION_ORDER_SIGNOFF_REQUIRED",
  "SIGNED_UAT_PENDING",
  "OWNER_SIGNOFF_PENDING",
  "CONTROLLED_EVIDENCE_REQUIRED",
  "NO_UAT_ACCEPTANCE",
  "NO_EVIDENCE_ACCEPTANCE",
  "NO_FINANCE_RELIANCE",
  "NO_LEGAL_CONCLUSION",
  "NO_MIGRATION_APPROVAL",
  "NO_OWNER_GO",
  "NO_PRODUCTION_GO",
  "BLK-CLOSE-01",
  "BLK-CLOSE-02",
  "BLK-CLOSE-03",
  "BLK-CLOSE-04",
  "BLK-CLOSE-05",
  "Backup/restore proof",
  "Migration order signoff",
  "Signed UAT route closure",
  "Finance/legal reliance closure",
  "Final owner GO/NO-GO packet",
];

requireText(
  executiveDashboard,
  /data-heu-executive-production-blocker-triage="STD-28_EXECUTIVE_PRODUCTION_BLOCKER_TRIAGE"[\s\S]*data-heu-executive-production-blocker-boundary="PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE READ_ONLY BACKUP_RESTORE_PROOF_REQUIRED MIGRATION_ORDER_SIGNOFF_REQUIRED SIGNED_UAT_PENDING OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_MIGRATION_APPROVAL NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-production-blocker-overflow-guard="STD-28_NO_OVERFLOW"/,
  "EXEC-DASHBOARD-STD28-PRODUCTION-BLOCKER-TRIAGE-ANCHOR",
  executiveDashboardPath,
);
requireAllText(
  executiveDashboard,
  triageTokens,
  "EXEC-DASHBOARD-STD28-PRODUCTION-BLOCKER-TRIAGE-TOKENS",
  executiveDashboardPath,
);
requireAllText(
  executiveReadiness,
  [
    "EXEC-DASHBOARD-PRODUCTION-BLOCKER-TRIAGE-ANCHOR",
    "EXEC-DASHBOARD-PRODUCTION-BLOCKER-TRIAGE-TOKENS",
    "PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE",
    "check:heu-executive-production-blocker-triage-readiness",
  ],
  "EXECUTIVE-READINESS-STD28",
  executiveReadinessPath,
);
requireAllText(
  productionBlockerSource,
  [
    "PRODUCTION_BLOCKERS",
    "PRODUCTION_EXECUTION_STEPS",
    "P0-03",
    "Step90-Step110",
    "P0-09",
    "P0-15",
    "audit:heu-production-blocker-source",
  ],
  "PRODUCTION-BLOCKER-SOURCE-STD28",
  productionBlockerSourcePath,
);
requireAllText(
  visualQa,
  [
    'data-heu-executive-production-blocker-triage="STD-28_EXECUTIVE_PRODUCTION_BLOCKER_TRIAGE"',
    "STD-28 Production blocker owner triage",
    "BLK-CLOSE-01",
    "BLK-CLOSE-05",
    "PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE",
  ],
  "VISUAL-QA-STD28",
  visualQaPath,
);
requireAllText(
  blueprint,
  [
    "STD-28",
    "STD-28_EXECUTIVE_PRODUCTION_BLOCKER_TRIAGE",
    "PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE",
    "BACKUP_RESTORE_PROOF_REQUIRED",
    "MIGRATION_ORDER_SIGNOFF_REQUIRED",
    "OWNER_SIGNOFF_PENDING",
    "NO_MIGRATION_APPROVAL",
    "NO_PRODUCTION_GO",
  ],
  "BLUEPRINT-STD28",
  blueprintPath,
);
requireAllText(
  implementationLog,
  [
    "STD-28 Executive Production Blocker Triage",
    'data-heu-executive-production-blocker-triage="STD-28_EXECUTIVE_PRODUCTION_BLOCKER_TRIAGE"',
    "BLK-CLOSE-01",
    "BLK-CLOSE-05",
    "PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE",
    "check:heu-executive-production-blocker-triage-readiness",
    /does not approve\s+waiver/i,
    "owner GO/NO-GO",
    "mark production GO",
  ],
  "IMPLEMENTATION-LOG-STD28",
  implementationLogPath,
);

if (
  packageJson.scripts?.[
    "check:heu-executive-production-blocker-triage-readiness"
  ] !== "node scripts/check-heu-executive-production-blocker-triage-readiness.mjs"
) {
  fail(
    "package.json missing check:heu-executive-production-blocker-triage-readiness script",
  );
}

console.log("READY PACKAGE-SCRIPT");
console.log(
  "HEU_EXECUTIVE_PRODUCTION_BLOCKER_TRIAGE_READY / NO_GO / BLOCKED: PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE. This check verifies executive production blocker owner triage only; it does not collect evidence, execute UAT, accept evidence, approve migration, approve waiver, approve finance reliance, approve legal conclusion, approve owner GO/NO-GO or mark production GO.",
);
