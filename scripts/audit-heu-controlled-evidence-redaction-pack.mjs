import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packPath = "docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md";
const ownerPackPath = "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";
const componentPath = "components/audit/controlled-evidence-redaction-guard.tsx";
const auditPagePath = "app/audit/page.tsx";
const failures = [];

function fail(message) {
  failures.push(message);
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(contents, pattern, label, file = packPath) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

for (const file of [
  packPath,
  ownerPackPath,
  checklistPath,
  backlogPath,
  componentPath,
  auditPagePath,
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const pack = exists(packPath) ? read(packPath) : "";
const ownerPack = exists(ownerPackPath) ? read(ownerPackPath) : "";
const checklist = exists(checklistPath) ? read(checklistPath) : "";
const backlog = exists(backlogPath) ? read(backlogPath) : "";
const component = exists(componentPath) ? read(componentPath) : "";
const auditPage = exists(auditPagePath) ? read(auditPagePath) : "";
const agents = exists("AGENTS.md") ? read("AGENTS.md") : "";
const releaseGateAudit = exists("scripts/audit-ttgdtx-release-gates.mjs")
  ? read("scripts/audit-ttgdtx-release-gates.mjs")
  : "";
const packageJson = exists("package.json")
  ? JSON.parse(read("package.json"))
  : { scripts: {} };

requireText(pack, /Controlled Evidence Redaction Pack/i, "pack title");
requireText(pack, /Status:\s*PASS_LOCAL_PACK/i, "PASS_LOCAL_PACK status");
requireText(pack, /This document does not approve\s+production, UAT pass, backup completion, migration, finance action or owner\s+Go\/No-Go/i, "non-approval boundary");
requireText(pack, /Production remains NO-GO until required evidence is collected/i, "production NO-GO boundary");
requireText(pack, /Do not paste secrets, passwords, temporary passwords, OTPs, service-role\s+keys, API keys, private keys, bank credentials, password reset links, account\s+activation\/invite links, raw student PII, raw CCCD, raw phone numbers, raw\s+bank account numbers, bank statements, vouchers or raw payment data/i, "secret and sensitive-data boundary");
requireText(pack, /Do not store raw controlled evidence in Git/i, "no raw evidence in Git rule");
requireText(pack, /Store sensitive backup\/UAT\/bank\/source evidence outside Git/i, "controlled evidence location rule");
requireText(pack, /PUBLIC_CONTROL[\s\S]*CONTROLLED_REDACTED[\s\S]*CONTROLLED_SENSITIVE[\s\S]*FORBIDDEN_IN_GIT_OR_CODEX/i, "evidence classification levels");
requireText(pack, /Mask CCCD\/passport\/private identifiers as `\*{8}1234`/i, "CCCD masking rule");
requireText(pack, /Mask bank accounts as `\*{12}1234`/i, "bank account masking rule");
requireText(pack, /Intake Workflow[\s\S]*Receive evidence[\s\S]*Classify[\s\S]*Redact[\s\S]*Review[\s\S]*Reference[\s\S]*Sign/i, "intake workflow");
requireText(
  pack,
  /Evidence Types Requiring This Pack[\s\S]*Supabase backup and restore proof[\s\S]*P2-17 payout evidence[\s\S]*P2-18 dashboard comparison evidence[\s\S]*P6-04 role\/workspace browser UAT screenshots[\s\S]*P6-03 audit-log UAT trace evidence[\s\S]*P6-06 hard-delete\/cascade conversion or narrow waiver evidence[\s\S]*Final production owner Go\/No-Go pack/i,
  "covered evidence types",
);
requireText(
  pack,
  /P6-04 role\/workspace browser UAT screenshots[\s\S]*IT_DATA \+ TRUONG_PHONG \+ Audit[\s\S]*P6-03 audit-log UAT trace evidence[\s\S]*Audit \+ IT_DATA \+ KHTC[\s\S]*P6-06 hard-delete\/cascade conversion or narrow waiver evidence[\s\S]*IT_DATA \+ Audit \+ affected business owner/i,
  "P6 evidence redaction owner split",
);
requireText(pack, /Stop Conditions[\s\S]*password, temporary password, OTP, password reset link[\s\S]*account\s+activation\/invite link[\s\S]*Raw student PII[\s\S]*Evidence has no owner[\s\S]*Backup\/restore proof is stored only in the repo/i, "stop conditions");
requireText(pack, /Local Preflight[\s\S]*audit:heu-controlled-evidence-redaction-pack[\s\S]*audit:ttgdtx-production-owner-signoff-pack[\s\S]*audit:ttgdtx-release-gates[\s\S]*npm\.cmd run lint[\s\S]*npm\.cmd run build/i, "local preflight commands");
requireText(pack, /Passing these checks proves only that local documentation and gates are aligned/i, "PASS_LOCAL local-only statement");
requireText(
  pack,
  /(?=[\s\S]*P0-10 Controlled Evidence Acceptance Matrix)(?=[\s\S]*data-heu-controlled-evidence-acceptance-matrix="P0-10")(?=[\s\S]*P0-10-ACCEPT-01)(?=[\s\S]*P0-10-ACCEPT-06)(?=[\s\S]*Evidence classified before use)(?=[\s\S]*Sensitive originals stay outside Git\/Codex)(?=[\s\S]*Redaction preserves proof while removing private data)(?=[\s\S]*Owner and Audit review recorded)(?=[\s\S]*Only safe references enter tracked work)(?=[\s\S]*Production boundary acknowledged)(?=[\s\S]*P0_10_ACCEPT \/ NO_GO \/ BLOCKED)/i,
  "controlled evidence acceptance matrix",
);
requireText(
  pack,
  /(?=[\s\S]*P0-14 Controlled Evidence Intake Ledger)(?=[\s\S]*data-p014-controlled-evidence-intake-ledger="P0-14")(?=[\s\S]*P0_14_INTAKE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Evidence ID)(?=[\s\S]*Controlled folder reference)(?=[\s\S]*Evidence class)(?=[\s\S]*Redaction reviewer)(?=[\s\S]*Owner signature state)(?=[\s\S]*Blocker decision)(?=[\s\S]*PASS_LOCAL proves only that the intake-ledger structure exists)/i,
  "P0-14 controlled evidence intake ledger handoff",
);

requireText(
  component,
  /(?=[\s\S]*data-heu-controlled-evidence-redaction-guard="P0-10")(?=[\s\S]*P0-10 controlled evidence redaction\/intake)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Production remains NO-GO until evidence is collected in the\s+controlled location, redacted where needed, reviewed by Audit and\s+signed by the required human owners)(?=[\s\S]*Raw evidence stays outside\s+Git\/Codex\/chat)(?=[\s\S]*Do not paste secrets, passwords, temporary passwords, OTPs,\s+service-role keys, API keys, private keys, bank credentials,\s+password reset links, account activation\/invite links, raw\s+student PII, raw CCCD, raw phone numbers, raw bank account\s+numbers, bank statements, vouchers or raw payment data)(?=[\s\S]*PUBLIC_CONTROL)(?=[\s\S]*CONTROLLED_REDACTED)(?=[\s\S]*CONTROLLED_SENSITIVE)(?=[\s\S]*FORBIDDEN_IN_GIT_OR_CODEX)(?=[\s\S]*audit:heu-controlled-evidence-redaction-pack)(?=[\s\S]*audit:ttgdtx-production-owner-signoff-pack)(?=[\s\S]*audit:ttgdtx-release-gates)(?=[\s\S]*does not\s+prove evidence was collected, accepted, signed, or production-approved)/i,
  "controlled evidence redaction UI guard",
  componentPath,
);

requireText(
  component,
  /(?=[\s\S]*data-heu-controlled-evidence-acceptance-matrix="P0-10")(?=[\s\S]*P0-10 controlled evidence acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0_10_ACCEPT \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-10-ACCEPT-01)(?=[\s\S]*P0-10-ACCEPT-06)(?=[\s\S]*Evidence classified before use)(?=[\s\S]*Sensitive originals stay outside Git\/Codex)(?=[\s\S]*Redaction preserves proof while removing private data)(?=[\s\S]*Owner and Audit review recorded)(?=[\s\S]*Only safe references enter tracked work)(?=[\s\S]*Production boundary acknowledged)/i,
  "controlled evidence acceptance matrix UI",
  componentPath,
);

requireText(
  auditPage,
  /ControlledEvidenceRedactionGuard[\s\S]*<ControlledEvidenceRedactionGuard \/>[\s\S]*TtgdtxAuditTrailGuard[\s\S]*HardDeleteBoundaryGuard/i,
  "audit page mounts controlled evidence guard before audit/hard-delete guards",
  auditPagePath,
);

requireText(
  ownerPack,
  /HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\.md[\s\S]*audit:heu-controlled-evidence-redaction-pack/i,
  "owner sign-off pack redaction-pack reference",
  ownerPackPath,
);

requireText(
  checklist,
  /Controlled evidence redaction\/intake[\s\S]*PASS_LOCAL[\s\S]*HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\.md[\s\S]*controlled evidence acceptance matrix[\s\S]*audit:heu-controlled-evidence-redaction-pack[\s\S]*raw evidence stays outside Git[\s\S]*temporary passwords, password reset links and account activation\/invite links are forbidden in Git\/Codex\/chat/i,
  "production checklist redaction row",
  checklistPath,
);

requireText(
  backlog,
  /P0-10[\s\S]*Controlled evidence redaction\/intake[\s\S]*PASS_LOCAL[\s\S]*HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\.md[\s\S]*controlled evidence acceptance matrix[\s\S]*audit:heu-controlled-evidence-redaction-pack[\s\S]*raw evidence stays outside Git[\s\S]*temporary passwords, password reset links and account activation\/invite links are forbidden in Git\/Codex\/chat/i,
  "backlog P0-10 redaction row",
  backlogPath,
);

if (!packageJson.scripts?.["audit:heu-controlled-evidence-redaction-pack"]) {
  fail("package.json: missing audit:heu-controlled-evidence-redaction-pack script");
}

if (!agents.includes(packPath)) {
  fail("AGENTS.md: missing controlled evidence redaction pack in required reading.");
}

if (!agents.includes("npm.cmd run audit:heu-controlled-evidence-redaction-pack")) {
  fail("AGENTS.md: missing controlled evidence redaction audit in final checks.");
}

if (
  !releaseGateAudit.includes(packPath) ||
  !releaseGateAudit.includes("audit:heu-controlled-evidence-redaction-pack")
) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing redaction-pack coverage.");
}

if (failures.length > 0) {
  console.error("HEU controlled evidence redaction-pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU controlled evidence redaction-pack audit passed. Raw sensitive evidence remains outside Git/Codex.",
);
