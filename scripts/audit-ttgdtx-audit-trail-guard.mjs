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
const evidenceChecklistPath =
  "components/audit/ttgdtx-audit-log-uat-evidence-checklist.tsx";
const pagePath = "app/audit/page.tsx";
const runbookPath = "docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";

for (const file of [
  componentPath,
  evidenceChecklistPath,
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
const evidenceChecklist = read(evidenceChecklistPath);
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

requireText(
  component,
  /(?=[\s\S]*data-ttgdtx-audit-log-uat-boundary="P6-03")(?=[\s\S]*P6-03 audit-log UAT)(?=[\s\S]*PASS_LOCAL)(?=[\s\S]*Signed audit-log UAT evidence is still required)(?=[\s\S]*NO-GO until signed\s+audit-log evidence exists)(?=[\s\S]*create)(?=[\s\S]*update)(?=[\s\S]*check)(?=[\s\S]*approve)(?=[\s\S]*pay)(?=[\s\S]*source-control)(?=[\s\S]*passwords)(?=[\s\S]*OTPs)(?=[\s\S]*service-role keys)(?=[\s\S]*CCCD)(?=[\s\S]*bank accounts)(?=[\s\S]*raw student identity data)/i,
  "P6-03 audit-log UAT boundary and no-secret warning",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*data-ttgdtx-audit-trace-acceptance-matrix="P6-03")(?=[\s\S]*P6-03 audit trace acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*actor identity)(?=[\s\S]*timestamp)(?=[\s\S]*entity\/action coverage)(?=[\s\S]*before\/after value usefulness)(?=[\s\S]*evidence link or controlled reference)(?=[\s\S]*workflow chain continuity)(?=[\s\S]*reviewer sign-off)(?=[\s\S]*AUD-TRACE-01)(?=[\s\S]*AUD-TRACE-06)(?=[\s\S]*passwords)(?=[\s\S]*OTPs)(?=[\s\S]*service-role keys)(?=[\s\S]*CCCD)(?=[\s\S]*bank accounts)(?=[\s\S]*raw student identity data)(?=[\s\S]*raw payment data)(?=[\s\S]*raw vouchers)/i,
  "P6-03 audit trace acceptance matrix",
  componentPath,
);

requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-ttgdtx-audit-log-uat-evidence-checklist="P6-03")(?=[\s\S]*P6-03 audit-log UAT evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Signed audit-log UAT is still required before P6-03 can move from\s+IN_PROGRESS)(?=[\s\S]*TTGDTX_AUDIT_LOG_UAT_RUNBOOK\.md)(?=[\s\S]*AUD-01)(?=[\s\S]*AUD-06)(?=[\s\S]*passwords, OTPs, service-role keys, raw\s+student identity data, CCCD, bank accounts and raw payment data)(?=[\s\S]*Audit, KHTC, IT_DATA, PHAP_CHE and BGH must sign the evidence outside\s+Codex\/chat)/i,
  "P6-03 audit-log UAT evidence checklist",
  evidenceChecklistPath,
);

requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-ttgdtx-audit-log-evidence-acceptance-matrix="P6-03")(?=[\s\S]*P6-03 audit-log evidence acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P6_03_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P6-03-ACCEPT-01)(?=[\s\S]*P6-03-ACCEPT-02)(?=[\s\S]*P6-03-ACCEPT-03)(?=[\s\S]*P6-03-ACCEPT-04)(?=[\s\S]*P6-03-ACCEPT-05)(?=[\s\S]*P6-03-ACCEPT-06)(?=[\s\S]*Static trigger coverage and read-only audit surface)(?=[\s\S]*Required event coverage)(?=[\s\S]*Actor, entity, action and timestamp sufficiency)(?=[\s\S]*Before\/after payload and evidence reference usefulness)(?=[\s\S]*Redaction and owner sign-off)(?=[\s\S]*Production boundary)(?=[\s\S]*PASS_LOCAL is treated as audit-log UAT pass, financial traceability acceptance, owner waiver, finance approval or production GO)/i,
  "P6-03 audit-log evidence acceptance matrix",
  evidenceChecklistPath,
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
  /<TtgdtxAuditTrailGuard\s*\/>[\s\S]*<TtgdtxAuditLogUatEvidenceChecklist\s*\/>/,
  "audit page mounts TTGDTX audit trail guard and UAT evidence checklist",
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
  /Local Audit Trail Guard Evidence[\s\S]*ttgdtx-audit-log-uat-evidence-checklist\.tsx[\s\S]*audit:ttgdtx-audit-trail-guard[\s\S]*does not replace signed UAT/i,
  "runbook local audit trail guard evidence section",
  runbookPath,
);

requireText(
  runbook,
  /(?=[\s\S]*Audit Trace Acceptance Matrix)(?=[\s\S]*data-ttgdtx-audit-trace-acceptance-matrix="P6-03")(?=[\s\S]*AUD-TRACE-01)(?=[\s\S]*AUD-TRACE-06)(?=[\s\S]*does not replace signed UAT)(?=[\s\S]*weak screenshots)(?=[\s\S]*financial\s+traceability)(?=[\s\S]*PASS_LOCAL is treated as UAT acceptance)/i,
  "runbook audit trace acceptance matrix",
  runbookPath,
);

requireText(
  runbook,
  /(?=[\s\S]*Audit-Log Evidence Acceptance Matrix)(?=[\s\S]*data-ttgdtx-audit-log-evidence-acceptance-matrix="P6-03")(?=[\s\S]*P6-03-ACCEPT-01)(?=[\s\S]*P6-03-ACCEPT-06)(?=[\s\S]*P6_03_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P6-03-ACCEPT-01 through\s+P6-03-ACCEPT-06 all pass with redacted evidence)/i,
  "runbook audit-log evidence acceptance matrix",
  runbookPath,
);

requireText(
  checklist,
  /(?=[\s\S]*Audit log completeness)(?=[\s\S]*IN_PROGRESS)(?=[\s\S]*ttgdtx-audit-log-uat-evidence-checklist\.tsx)(?=[\s\S]*audit trace acceptance matrix)(?=[\s\S]*audit-log evidence acceptance matrix)(?=[\s\S]*audit:ttgdtx-audit-trail-guard)(?=[\s\S]*P6-03 audit-log UAT boundary)(?=[\s\S]*signed UAT)/i,
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
  evidenceChecklistPath,
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
