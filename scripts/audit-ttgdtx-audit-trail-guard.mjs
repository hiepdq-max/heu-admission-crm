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

const componentPath = "components/audit/ttgdtx-audit-trail-guard.tsx";
const pagePath = "app/audit/page.tsx";
const runbookPath = "docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";

for (const file of [
  componentPath,
  pagePath,
  runbookPath,
  checklistPath,
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-audit-log-coverage.mjs",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const component = read(componentPath);
const page = read(pagePath);
const runbook = read(runbookPath);
const checklist = read(checklistPath);
const agents = read("AGENTS.md");
const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
const packageJson = JSON.parse(read("package.json"));

requireText(
  component,
  /data-ttgdtx-audit-trail-guard="AUDIT_LOG"[\s\S]*audit_logs[\s\S]*không phê duyệt[\s\S]*không sửa tiền|data-ttgdtx-audit-trail-guard="AUDIT_LOG"[\s\S]*audit_logs[\s\S]*khong phe duyet[\s\S]*khong sua tien/i,
  "audit trail guard read-only boundary",
  componentPath,
);

for (const entity of [
  "ttgdtx_student_receivables",
  "ttgdtx_tuition_payments",
  "ttgdtx_tuition_reconciliation_batches",
  "ttgdtx_partner_payment_requests",
  "ttgdtx_partner_payment_disbursements",
  "ttgdtx_source_documents",
  "ttgdtx_source_control_checks",
]) {
  requireText(component, new RegExp(entity), `${entity} guard item`, componentPath);
  requireText(runbook, new RegExp(entity), `${entity} runbook coverage`, runbookPath);
}

for (const uatCase of ["AUD-01", "AUD-02", "AUD-03", "AUD-04", "AUD-05", "AUD-06"]) {
  requireText(component, new RegExp(uatCase), `${uatCase} UI guard reference`, componentPath);
  requireText(runbook, new RegExp(`\\| ${uatCase} \\|`), `${uatCase} runbook case`, runbookPath);
}

requireText(
  page,
  /TtgdtxAuditTrailGuard[\s\S]*<TtgdtxAuditTrailGuard \/>/,
  "audit page mounts TTGDTX audit trail guard",
  pagePath,
);

requireText(
  page,
  /\.from\("audit_logs"\)[\s\S]*\.select\(/,
  "audit page reads audit_logs",
  pagePath,
);

if (/\.(insert|update|delete|upsert|rpc)\(/.test(page)) {
  fail("app/audit/page.tsx must remain read-only and must not write or call RPC.");
}

requireText(
  runbook,
  /Local Audit Trail Guard Evidence[\s\S]*audit:ttgdtx-audit-trail-guard[\s\S]*does not replace signed UAT/i,
  "runbook local audit trail guard evidence section",
  runbookPath,
);

requireText(
  checklist,
  /Audit log completeness[\s\S]*IN_PROGRESS[\s\S]*audit:ttgdtx-audit-trail-guard[\s\S]*signed UAT/i,
  "production checklist keeps audit log IN_PROGRESS with guard evidence",
  checklistPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-audit-trail-guard"]) {
  fail("package.json: missing audit:ttgdtx-audit-trail-guard script");
}

requireText(
  agents,
  /npm\.cmd run audit:ttgdtx-audit-trail-guard/,
  "AGENTS final handoff audit command",
  "AGENTS.md",
);

for (const needle of [
  componentPath,
  "scripts/audit-ttgdtx-audit-trail-guard.mjs",
  "audit:ttgdtx-audit-trail-guard",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX audit trail guard audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX audit trail guard audit passed. Audit page shows required TTGDTX traceability without write actions.");
