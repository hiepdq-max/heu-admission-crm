import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

function requireText(contents, pattern, label, file) {
  if (!pattern.test(contents)) {
    failures.push(`${file}: missing ${label}`);
  }
}

const componentPath = "components/ttgdtx/ttgdtx-production-readiness-guard.tsx";
const blockerSourcePath = "lib/production-readiness.ts";
const uatGuardPath = "components/ttgdtx/ttgdtx-uat-signoff-guard.tsx";
const executionQueuePath = "components/ttgdtx/ttgdtx-production-execution-queue.tsx";
const pagePath = "app/ttgdtx/page.tsx";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";

for (const file of [
  componentPath,
  blockerSourcePath,
  uatGuardPath,
  executionQueuePath,
  pagePath,
  checklistPath,
  backlogPath,
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const component = read(componentPath);
const blockerSource = read(blockerSourcePath);
const uatGuard = read(uatGuardPath);
const executionQueue = read(executionQueuePath);
const page = read(pagePath);
const checklist = read(checklistPath);
const backlog = read(backlogPath);
const agents = read("AGENTS.md");
const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
const packageJson = JSON.parse(read("package.json"));

requireText(
  component,
  /data-ttgdtx-production-readiness-guard="TTGDTX_9PLUS"/,
  "TTGDTX production readiness guard marker",
  componentPath,
);
requireText(
  component,
  /Production remains NO-GO[\s\S]*PASS_LOCAL[\s\S]*khong phe duyet production\s+migration/i,
  "NO-GO and PASS_LOCAL boundary",
  componentPath,
);

for (const blocker of [
  "Supabase backup",
  "Step90-Step110",
  "Step97",
  "Step100",
  "Step109",
  "Step110",
  "P2-17",
  "P2-18",
  "signed UAT",
  "Audit log",
  "hard-delete",
  "rollback",
]) {
  requireText(component, new RegExp(blocker, "i"), `${blocker} blocker`, componentPath);
}

requireText(
  page,
  /TtgdtxProductionReadinessGuard[\s\S]*<TtgdtxProductionReadinessGuard \/>/,
  "TTGDTX landing page mounts production readiness guard",
  pagePath,
);

requireText(
  uatGuard,
  /(?=[\s\S]*data-ttgdtx-uat-signoff-guard="INTERNAL_UAT")(?=[\s\S]*Internal UAT sign-off)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Production remains NO-GO until signed multi-account UAT evidence\s+exists)(?=[\s\S]*PASS_LOCAL does not approve real pilot start, production\s+migration, revenue recognition, payout, dashboard reliance or\s+Go\/No-Go)(?=[\s\S]*Do not paste real passwords, OTPs, service-role keys, student\s+PII, CCCD, phone numbers, bank accounts or raw payment evidence)(?=[\s\S]*UAT_ADMIN)(?=[\s\S]*UAT_BGH)(?=[\s\S]*UAT_KHTC)(?=[\s\S]*UAT_TUYEN_SINH)(?=[\s\S]*UAT_PHAP_CHE)(?=[\s\S]*UAT_OUT_OF_SCOPE)(?=[\s\S]*TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP\.md)(?=[\s\S]*TTGDTX_BROWSER_UAT_MATRIX_20260625\.md)(?=[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md)(?=[\s\S]*signed multi-account UAT still required)(?=[\s\S]*data-ttgdtx-uat-run-closure-tracker="INTERNAL_UAT")(?=[\s\S]*Internal UAT run closure tracker)(?=[\s\S]*UAT_PASS \/ UAT_FAIL \/ BLOCKED)(?=[\s\S]*UAT-CLOSE-01)(?=[\s\S]*UAT-CLOSE-06)(?=[\s\S]*Finance and dashboard negative tests pass)(?=[\s\S]*Owners sign UAT result)(?=[\s\S]*Missing route evidence, owner signature, redaction\s+proof or negative-test result keeps production NO-GO)/i,
  "TTGDTX internal UAT sign-off guard",
  uatGuardPath,
);

requireText(
  page,
  /<TtgdtxProductionReadinessGuard\s*\/>[\s\S]*<TtgdtxUatSignoffGuard\s*\/>[\s\S]*<TtgdtxOperatingControlStrip\b/,
  "TTGDTX landing page mounts UAT sign-off guard before operating strip",
  pagePath,
);

requireText(
  executionQueue,
  /(?=[\s\S]*data-ttgdtx-production-execution-queue="TTGDTX_9PLUS")(?=[\s\S]*TTGDTX production execution queue)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*PRODUCTION_EXECUTION_STEPS)(?=[\s\S]*redaction, backup\/restore, migration order,\s+role UAT, P0-19, P2-17, P2-18, audit\/hard-delete, P0-14\s+evidence binder, P0-15 final handoff summary, then final owner\s+Go\/No-Go)(?=[\s\S]*Do not skip ahead)(?=[\s\S]*Final result stays NO-GO until signed owner GO exists)/i,
  "TTGDTX production execution queue UI shell",
  executionQueuePath,
);

requireText(
  blockerSource,
  /P0-10[\s\S]*P0-03[\s\S]*Step90-Step110[\s\S]*P6-04[\s\S]*P0-19[\s\S]*P2-17[\s\S]*P2-18[\s\S]*P6-03\/P6-06[\s\S]*P0-14[\s\S]*P0-15[\s\S]*Owner GO\/NO-GO/i,
  "TTGDTX production execution shared source order",
  blockerSourcePath,
);

requireText(
  page,
  /<TtgdtxProductionReadinessGuard\s*\/>[\s\S]*<TtgdtxUatSignoffGuard\s*\/>[\s\S]*<TtgdtxProductionExecutionQueue\s*\/>[\s\S]*<TtgdtxOperatingControlStrip\b/,
  "TTGDTX landing page mounts production execution queue before operating strip",
  pagePath,
);

requireText(
  checklist,
  /Internal UAT sign-off[\s\S]*IN_PROGRESS[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md[\s\S]*internal UAT run closure tracker[\s\S]*ttgdtx-production-readiness-guard\.tsx[\s\S]*ttgdtx-uat-signoff-guard\.tsx[\s\S]*UAT run closure tracker[\s\S]*audit:ttgdtx-production-readiness-guard[\s\S]*signed multi-account UAT still required/i,
  "production checklist keeps internal UAT IN_PROGRESS with readiness guard evidence",
  checklistPath,
);

requireText(
  backlog,
  /P0-08[\s\S]*Expose TTGDTX production readiness guard in app[\s\S]*PASS_LOCAL[\s\S]*UAT run closure tracker[\s\S]*UAT execution closure template[\s\S]*UAT operator handoff[\s\S]*audit:ttgdtx-production-readiness-guard/i,
  "P0-08 backlog guard row",
  backlogPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-production-readiness-guard"]) {
  failures.push("package.json: missing audit:ttgdtx-production-readiness-guard script");
}

requireText(
  agents,
  /npm\.cmd run audit:ttgdtx-production-readiness-guard/,
  "AGENTS final handoff audit command",
  "AGENTS.md",
);

for (const needle of [
  componentPath,
  uatGuardPath,
  executionQueuePath,
  "scripts/audit-ttgdtx-production-readiness-guard.mjs",
  "audit:ttgdtx-production-readiness-guard",
]) {
  if (!releaseGateAudit.includes(needle)) {
    failures.push(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX production readiness guard audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "TTGDTX production readiness guard audit passed. NO-GO blockers are visible in the app.",
);
