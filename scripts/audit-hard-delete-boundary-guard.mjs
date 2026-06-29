import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const componentPath = "components/audit/hard-delete-boundary-guard.tsx";
const evidenceChecklistPath =
  "components/audit/hard-delete-waiver-evidence-checklist.tsx";
const pagePath = "app/audit/page.tsx";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const registerPath =
  "docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md";
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(contents, pattern, label, file) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

for (const file of [
  componentPath,
  evidenceChecklistPath,
  pagePath,
  checklistPath,
  "docs/HARD_DELETE_AUDIT.md",
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  registerPath,
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const component = existsSync(path.join(repoRoot, componentPath))
  ? read(componentPath)
  : "";
const evidenceChecklist = existsSync(path.join(repoRoot, evidenceChecklistPath))
  ? read(evidenceChecklistPath)
  : "";
const page = existsSync(path.join(repoRoot, pagePath)) ? read(pagePath) : "";
const checklist = existsSync(path.join(repoRoot, checklistPath))
  ? read(checklistPath)
  : "";
const hardDeleteAudit = existsSync(path.join(repoRoot, "docs/HARD_DELETE_AUDIT.md"))
  ? read("docs/HARD_DELETE_AUDIT.md")
  : "";
const nonTtgdtxReview = existsSync(
  path.join(repoRoot, "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md"),
)
  ? read("docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md")
  : "";
const register = existsSync(path.join(repoRoot, registerPath))
  ? read(registerPath)
  : "";
const backlog = existsSync(path.join(repoRoot, "docs/HEU_SYSTEM_BUILD_BACKLOG.md"))
  ? read("docs/HEU_SYSTEM_BUILD_BACKLOG.md")
  : "";
const agents = existsSync(path.join(repoRoot, "AGENTS.md")) ? read("AGENTS.md") : "";
const releaseGateAudit = existsSync(
  path.join(repoRoot, "scripts/audit-ttgdtx-release-gates.mjs"),
)
  ? read("scripts/audit-ttgdtx-release-gates.mjs")
  : "";
const packageJson = JSON.parse(read("package.json"));

requireText(
  component,
  /(?=[\s\S]*data-hard-delete-boundary-guard="P6-06")(?=[\s\S]*P6-06 hard-delete and cascade review)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Production remains NO-GO until non-TTGDTX\/base cascade paths are\s+converted or waived with written approval)(?=[\s\S]*No hard-delete for\s+finance, evidence, approval, payment, lead or audit rows)(?=[\s\S]*Do not use hard-delete, truncate, drop table or on delete cascade\s+as rollback proof)(?=[\s\S]*Current scan count:\s*44)(?=[\s\S]*REQUIRES_CONVERSION_OR_WAIVER)(?=[\s\S]*audit:hard-delete)(?=[\s\S]*audit:ttgdtx-cascade)(?=[\s\S]*audit:heu-non-ttgdtx-cascade-review)/i,
  "P6-06 hard-delete boundary guard",
  componentPath,
);
requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-hard-delete-waiver-evidence-checklist="P6-06")(?=[\s\S]*P6-06 hard-delete\/cascade evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Conversion or written waiver evidence is still required before\s+P6-06 can move from IN_PROGRESS)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_REVIEW_20260627\.md)(?=[\s\S]*HD-01)(?=[\s\S]*HD-06)(?=[\s\S]*raw student PII, CCCD, bank data, payment data,\s+passwords, temporary passwords, OTPs, password reset links,\s+account activation\/invite links, service-role keys and production\s+credentials)(?=[\s\S]*BGH, IT_DATA, Audit and affected business owners must sign the\s+evidence outside Codex\/chat)/i,
  "P6-06 hard-delete waiver evidence checklist",
  evidenceChecklistPath,
);

requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-hard-delete-finance-legal-evidence-batch="P6-06-TRIAGE-01")(?=[\s\S]*P6-06 batch 1 finance\/legal\/evidence closure checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P6_06_BATCH1_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P6-06-B1-01)(?=[\s\S]*P6-06-B1-05)(?=[\s\S]*P6-06-FIND-010 through P6-06-FIND-017)(?=[\s\S]*P6-06-FIND-040)(?=[\s\S]*P6-06-FIND-042 through P6-06-FIND-044)(?=[\s\S]*P6-06-FIND-006)(?=[\s\S]*P6-06-FIND-029 and P6-06-FIND-030)(?=[\s\S]*must clear before any broad waiver or owner GO\/NO-GO discussion)/i,
  "P6-06 batch 1 finance/legal/evidence closure checklist",
  evidenceChecklistPath,
);

requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-hard-delete-cascade-acceptance-matrix="P6-06")(?=[\s\S]*P6-06 hard-delete\/cascade acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P6_06_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P6-06-ACCEPT-01)(?=[\s\S]*P6-06-ACCEPT-02)(?=[\s\S]*P6-06-ACCEPT-03)(?=[\s\S]*P6-06-ACCEPT-04)(?=[\s\S]*P6-06-ACCEPT-05)(?=[\s\S]*P6-06-ACCEPT-06)(?=[\s\S]*Current cascade scan locked and mapped)(?=[\s\S]*Protected records converted before production)(?=[\s\S]*Derived-helper waiver is narrow and written)(?=[\s\S]*Rollback and cleanup do not rely on deletion)(?=[\s\S]*Evidence redaction and owner sign-off)(?=[\s\S]*Production boundary)(?=[\s\S]*PASS_LOCAL is treated as production deletion approval, cascade execution approval, waiver approval, conversion migration approval, rollback success or production GO)/i,
  "P6-06 hard-delete/cascade acceptance matrix",
  evidenceChecklistPath,
);

requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-hard-delete-cascade-closure-decision-manifest="P6-06")(?=[\s\S]*P6-06 hard-delete\/cascade closure decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P6_06_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P6-06-DEC-01)(?=[\s\S]*P6-06-DEC-06)(?=[\s\S]*Current scan and owner lanes locked)(?=[\s\S]*Protected rows converted)(?=[\s\S]*Derived-helper waiver controlled)(?=[\s\S]*Rollback and cleanup proof independent of deletion)(?=[\s\S]*Redacted evidence and human sign-off)(?=[\s\S]*Production boundary acknowledged)(?=[\s\S]*PASS_LOCAL is treated as production deletion approval, cascade execution approval, waiver approval, conversion migration approval, rollback success or production GO)/i,
  "P6-06 hard-delete/cascade closure decision manifest",
  evidenceChecklistPath,
);

requireText(
  page,
  /<HardDeleteBoundaryGuard\s*\/>[\s\S]*<HardDeleteWaiverEvidenceChecklist\s*\/>[\s\S]*AuditLogTable/i,
  "audit page mounts hard-delete boundary guard and evidence checklist before audit table",
  pagePath,
);

requireText(
  checklist,
  /Hard delete review[\s\S]*IN_PROGRESS[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*hard-delete-boundary-guard\.tsx[\s\S]*hard-delete-waiver-evidence-checklist\.tsx[\s\S]*hard-delete\/cascade finding register, owner triage batch plan, batch 1 finance\/legal\/evidence closure checklist, acceptance matrix and closure decision manifest[\s\S]*audit:hard-delete-boundary-guard[\s\S]*non-TTGDTX conversion or written waiver still required/i,
  "production checklist keeps hard-delete review IN_PROGRESS with UI guard evidence",
  checklistPath,
);

requireText(
  hardDeleteAudit,
  /Production remains NO-GO[\s\S]*non-TTGDTX\/base schema cascade review/i,
  "hard-delete audit production NO-GO boundary",
  "docs/HARD_DELETE_AUDIT.md",
);

requireText(
  nonTtgdtxReview,
  /(?=[\s\S]*P6-06 is PASS_LOCAL)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*P6-06-FIND-001 through P6-06-FIND-044)(?=[\s\S]*Owner Triage Batch Plan)(?=[\s\S]*P6-06-TRIAGE-01)(?=[\s\S]*P6-06-TRIAGE-05)(?=[\s\S]*Batch 1 Finance\/Legal\/Evidence Closure Checklist)(?=[\s\S]*P6-06-B1-01)(?=[\s\S]*P6-06-B1-05)(?=[\s\S]*hard-delete-waiver-evidence-checklist\.tsx)(?=[\s\S]*data-hard-delete-cascade-acceptance-matrix="P6-06")(?=[\s\S]*data-hard-delete-cascade-closure-decision-manifest="P6-06")(?=[\s\S]*P6-06-ACCEPT-01)(?=[\s\S]*P6-06-ACCEPT-06)(?=[\s\S]*P6-06-DEC-01)(?=[\s\S]*P6-06-DEC-06)(?=[\s\S]*does not approve\s+production migration, production deletion, cascade execution, waiver, data\s+cleanup or production GO)/i,
  "non-TTGDTX cascade review local-only boundary",
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
);

requireText(
  register,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_REGISTER)(?=[\s\S]*Current scan count:\s*44)(?=[\s\S]*P6-06-FIND-001)(?=[\s\S]*P6-06-FIND-044)(?=[\s\S]*child tables, parent references and owner lanes)(?=[\s\S]*Owner Triage Batch Plan)(?=[\s\S]*P6-06-TRIAGE-01)(?=[\s\S]*P6-06-TRIAGE-05)(?=[\s\S]*Batch 1 Finance\/Legal\/Evidence Closure Checklist)(?=[\s\S]*P6-06-B1-01)(?=[\s\S]*P6-06-B1-05)(?=[\s\S]*P6-06 remains IN_PROGRESS)(?=[\s\S]*does not approve production migration, data\s+deletion, cascade execution, waiver, conversion migration, cleanup, rollback\s+success or production GO)/i,
  "P6-06 finding register local-only boundary",
  registerPath,
);

requireText(
  backlog,
  /P6-06[\s\S]*PASS_LOCAL[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*hard-delete-boundary-guard\.tsx[\s\S]*hard-delete-waiver-evidence-checklist\.tsx[\s\S]*hard-delete\/cascade finding register, owner triage batch plan, batch 1 finance\/legal\/evidence closure checklist, acceptance matrix and closure decision manifest[\s\S]*audit:hard-delete-boundary-guard[\s\S]*conversion or written waiver still required/i,
  "backlog hard-delete boundary evidence",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

if (!packageJson.scripts?.["audit:hard-delete-boundary-guard"]) {
  fail("package.json: missing audit:hard-delete-boundary-guard script");
}

if (!agents.includes("npm.cmd run audit:hard-delete-boundary-guard")) {
  fail("AGENTS.md: missing audit:hard-delete-boundary-guard final handoff command");
}

for (const needle of [
  componentPath,
  evidenceChecklistPath,
  registerPath,
  "scripts/audit-hard-delete-boundary-guard.mjs",
  "audit:hard-delete-boundary-guard",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("Hard-delete boundary guard audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "Hard-delete boundary guard audit passed. Production remains NO-GO until conversion or written waiver.",
);
