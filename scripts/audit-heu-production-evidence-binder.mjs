import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
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

const sourcePath = "lib/production-readiness.ts";
const componentPath = "components/ttgdtx/ttgdtx-production-evidence-binder.tsx";
const pagePath = "app/ttgdtx/page.tsx";

for (const file of [
  sourcePath,
  componentPath,
  pagePath,
  "AGENTS.md",
  "package.json",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const source = existsSync(path.join(repoRoot, sourcePath)) ? read(sourcePath) : "";
const component = existsSync(path.join(repoRoot, componentPath))
  ? read(componentPath)
  : "";
const page = existsSync(path.join(repoRoot, pagePath)) ? read(pagePath) : "";
const agents = existsSync(path.join(repoRoot, "AGENTS.md")) ? read("AGENTS.md") : "";
const backlog = existsSync(path.join(repoRoot, "docs/HEU_SYSTEM_BUILD_BACKLOG.md"))
  ? read("docs/HEU_SYSTEM_BUILD_BACKLOG.md")
  : "";
const checklist = existsSync(
  path.join(repoRoot, "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md"),
)
  ? read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md")
  : "";
const inventory = existsSync(path.join(repoRoot, "docs/HEU_CURRENT_STATE_INVENTORY.md"))
  ? read("docs/HEU_CURRENT_STATE_INVENTORY.md")
  : "";
const releaseGateAudit = existsSync(
  path.join(repoRoot, "scripts/audit-ttgdtx-release-gates.mjs"),
)
  ? read("scripts/audit-ttgdtx-release-gates.mjs")
  : "";
const packageJson = JSON.parse(read("package.json"));

requireText(
  source,
  /export type ProductionEvidenceRequirement[\s\S]*export const PRODUCTION_EVIDENCE_REQUIREMENTS/i,
  "production evidence requirement type and export",
  sourcePath,
);

if (/blockerCode:\s*"P6-04\/P6-03\/P6-06"/.test(source)) {
  fail(`${sourcePath}: P6-04, P6-03 and P6-06 evidence must stay split.`);
}

for (const caseId of [
  "P0-14-01",
  "P0-14-02",
  "P0-14-03",
  "P0-14-04",
  "P0-14-05",
  "P0-14-06",
  "P0-14-07",
  "P0-14-08",
  "P0-14-09",
]) {
  requireText(source, new RegExp(caseId), `${caseId} evidence case`, sourcePath);
}

for (const blocker of [
  "P0-03",
  "Step90-Step110",
  "P0-19",
  "P2-17",
  "P2-18",
  "P6-04",
  "P6-03",
  "P6-06",
  "P0-09",
]) {
  requireText(source, new RegExp(blocker.replaceAll("/", "\\/")), `${blocker} evidence blocker`, sourcePath);
}

requireText(
  source,
  /(?=[\s\S]*CONTROLLED_SENSITIVE)(?=[\s\S]*CONTROLLED_REDACTED)(?=[\s\S]*service-role key)(?=[\s\S]*password)(?=[\s\S]*OTP)(?=[\s\S]*raw student PII)(?=[\s\S]*bank statements?)(?=[\s\S]*AI(?:-produced)? approvals?)/i,
  "sensitive evidence and forbidden-content boundaries",
  sourcePath,
);

requireText(
  source,
  /P0-14-01[\s\S]*P0-03[\s\S]*Backup and restore dry-run evidence[\s\S]*Target identity lock, operator run sheet, backup ID, restore target, preflight\/postflight result, restore smoke-check result proving P0-19 and P3-01\/P3-02 gate preservation, and operator\/checker names[\s\S]*P0-19\/P3 gate preservation/i,
  "P0-14-01 backup/restore operator run sheet proof",
  sourcePath,
);

requireText(
  source,
  /P0-14-06[\s\S]*P6-04[\s\S]*Role and workspace UAT evidence[\s\S]*Synthetic-account role\/workspace test matrix[\s\S]*blocked out-of-scope cases/i,
  "P0-14-06 role/workspace UAT proof",
  sourcePath,
);

requireText(
  source,
  /P0-14-07[\s\S]*P6-03[\s\S]*Audit-log traceability evidence[\s\S]*Trace rows for create, update, check, approve, pay and source-control events/i,
  "P0-14-07 audit-log traceability proof",
  sourcePath,
);

requireText(
  source,
  /P0-14-08[\s\S]*P6-06[\s\S]*Hard-delete and cascade conversion evidence[\s\S]*Protected cascade paths converted to restrict\/archive\/status patterns[\s\S]*derived-only waiver signed with rollback note/i,
  "P0-14-08 hard-delete/cascade conversion proof",
  sourcePath,
);

requireText(
  source,
  /P0-14-09[\s\S]*P0-09[\s\S]*Final owner GO\/NO-GO evidence[\s\S]*signed decision referencing the owner sign-off pack, final owner decision manifest and UAT operator handoff/i,
  "P0-14-09 owner sign-off UAT handoff proof",
  sourcePath,
);

requireText(
  component,
  /(?=[\s\S]*data-ttgdtx-production-evidence-binder="P0-14")(?=[\s\S]*P0-14 production evidence binder)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*PRODUCTION_EVIDENCE_REQUIREMENTS)(?=[\s\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS)(?=[\s\S]*governanceEvidenceCases)(?=[\s\S]*NO-GO until signed)(?=[\s\S]*what proof is needed, where\s+it must live, who signs it and what must never be pasted into\s+Git\/Codex\/chat)(?=[\s\S]*Forbidden:[\s\S]*item\.forbiddenContent)(?=[\s\S]*data-p014-controlled-evidence-intake-ledger="P0-14")(?=[\s\S]*P0-14 controlled evidence intake ledger)(?=[\s\S]*P0_14_INTAKE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*evidence ID, controlled folder reference,\s+evidence class, redaction reviewer, owner signature state and\s+blocker decision)(?=[\s\S]*data-p014-governance-evidence-checkpoint="P6-04_P6-03")(?=[\s\S]*P0-14 governance evidence checkpoint: P6-04 \+ P6-03)(?=[\s\S]*controlled references, redaction checks and human sign-off)(?=[\s\S]*role leak, missing trace row, broad\s+access path or unsigned evidence keeps P0-14 NO-GO)(?=[\s\S]*P6_04_SCOPE \+ P6_03_TRACE)(?=[\s\S]*data-p014-production-evidence-closure-tracker="P0-14")(?=[\s\S]*P0-14 production evidence closure tracker)(?=[\s\S]*P0_14_CLOSE \/ NO_GO \/ BLOCKED)(?=[\s\S]*controlled evidence reference exists)(?=[\s\S]*Missing proof keeps production NO-GO)(?=[\s\S]*Stop if proof is missing)(?=[\s\S]*Forbidden content stays out of Git\/Codex\/chat)(?=[\s\S]*service-role keys,\s+passwords, OTPs)(?=[\s\S]*raw student PII)(?=[\s\S]*bank statements)(?=[\s\S]*AI-produced approvals)/i,
  "P0-14 production evidence binder UI",
  componentPath,
);

requireText(
  page,
  /TtgdtxProductionEvidenceBinder[\s\S]*<TtgdtxProductionExecutionQueue\s*\/>[\s\S]*<TtgdtxProductionEvidenceBinder\s*\/>[\s\S]*<TtgdtxOwnerGoNoGoEvidenceChecklist\s*\/>/,
  "TTGDTX page mounts evidence binder between execution queue and owner signoff",
  pagePath,
);

if (!packageJson.scripts?.["audit:heu-production-evidence-binder"]) {
  fail("package.json: missing audit:heu-production-evidence-binder script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:heu-production-evidence-binder/i,
  "final handoff production evidence binder audit command",
  "AGENTS.md",
);

requireText(
  backlog,
  /P0-14[\s\S]*Production evidence binder[\s\S]*PASS_LOCAL[\s\S]*controlled evidence intake ledger[\s\S]*governance evidence checkpoint for P6-04\/P6-03[\s\S]*closure tracker[\s\S]*audit:heu-production-evidence-binder[\s\S]*redaction reviewer[\s\S]*owner signature state[\s\S]*P0-03 operator run sheet proof and restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*separate P6-04 role\/workspace proof[\s\S]*P6-03 audit-log proof[\s\S]*P6-06 hard-delete\/cascade conversion-or-waiver proof[\s\S]*P0-09 owner sign-off\/UAT handoff\/final owner decision manifest proof/i,
  "P0-14 production evidence binder backlog row",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireText(
  checklist,
  /Production evidence binder[\s\S]*PASS_LOCAL[\s\S]*controlled evidence intake ledger[\s\S]*governance evidence checkpoint for P6-04\/P6-03[\s\S]*closure tracker[\s\S]*audit:heu-production-evidence-binder[\s\S]*redaction reviewer[\s\S]*owner signature state[\s\S]*P0-03 operator run sheet proof and restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*separate P6-04 role\/workspace proof[\s\S]*P6-03 audit-log proof[\s\S]*P6-06 hard-delete\/cascade conversion-or-waiver proof[\s\S]*P0-09 owner sign-off\/UAT handoff\/final owner decision manifest proof/i,
  "production checklist evidence binder row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  checklist,
  /P0 controls include[\s\S]*P0-14 production evidence binder[\s\S]*Production remains NO-GO until\s+controlled external evidence and required owner signatures exist/i,
  "P0 Go/No-Go controls include P0-14 evidence binder",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  checklist,
  /highest priority blockers[\s\S]*Close P0-14 production evidence binder[\s\S]*controlled evidence intake ledger[\s\S]*controlled evidence locations[\s\S]*redaction class[\s\S]*redaction reviewer[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*P6-04\/P6-03 governance evidence checkpoint[\s\S]*owner sign-off path[\s\S]*no forbidden content/i,
  "priority blocker list includes P0-14 evidence binder closure",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  inventory,
  /npm\.cmd run audit:heu-production-evidence-binder[\s\S]*PASS[\s\S]*Backup\/restore[\s\S]*restore smoke-check acceptance matrix with P0-19\/P3 gate preservation[\s\S]*Controlled evidence[\s\S]*P0-14 evidence binder, controlled evidence intake ledger, governance evidence checkpoint and closure tracker[\s\S]*P0-03 operator run sheet proof[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*separate P6-04 role\/workspace proof[\s\S]*P6-03 audit-log proof[\s\S]*P6-06 hard-delete\/cascade conversion-or-waiver proof[\s\S]*P0-09 owner sign-off\/UAT handoff\/final owner decision manifest proof/i,
  "current-state production evidence binder audit evidence",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
);

for (const needle of [
  componentPath,
  "scripts/audit-heu-production-evidence-binder.mjs",
  "audit:heu-production-evidence-binder",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("HEU production evidence binder audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU production evidence binder audit passed. P0-14 evidence ownership, storage and redaction rules are visible.",
);
