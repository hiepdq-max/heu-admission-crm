import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packPath = "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";
const ownerChecklistPath =
  "components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx";
const ttgdtxPagePath = "app/ttgdtx/page.tsx";
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
  checklistPath,
  backlogPath,
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  "docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md",
  "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
  "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md",
  "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
  "docs/HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md",
  "docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  "docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md",
  "docs/HARD_DELETE_AUDIT.md",
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  "docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md",
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  "docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md",
  ownerChecklistPath,
  ttgdtxPagePath,
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const pack = exists(packPath) ? read(packPath) : "";
const checklist = exists(checklistPath) ? read(checklistPath) : "";
const backlog = exists(backlogPath) ? read(backlogPath) : "";
const ownerChecklist = exists(ownerChecklistPath) ? read(ownerChecklistPath) : "";
const ttgdtxPage = exists(ttgdtxPagePath) ? read(ttgdtxPagePath) : "";
const agents = exists("AGENTS.md") ? read("AGENTS.md") : "";
const releaseGateAudit = exists("scripts/audit-ttgdtx-release-gates.mjs")
  ? read("scripts/audit-ttgdtx-release-gates.mjs")
  : "";
const packageJson = JSON.parse(read("package.json"));

requireText(pack, /Production Owner Sign-Off Pack/i, "pack title");
requireText(pack, /Status:\s*PASS_LOCAL_PACK/i, "PASS_LOCAL_PACK status");
requireText(pack, /This document does not approve production/i, "non-approval mode");
requireText(pack, /Production remains NO-GO until the required owners review the evidence,[\s\S]*record\s+their decision, and sign the final Go\/No-Go decision/i, "owner sign-off boundary");
requireText(pack, /Codex\/AI output is\s+advisory only/i, "AI advisory boundary");
requireText(pack, /Do not run production migration from Codex\/chat/i, "Codex/chat migration boundary");
requireText(pack, /Do not mark production GO from Codex\/chat/i, "Codex/chat GO boundary");
requireText(pack, /Do not paste secrets, passwords, temporary passwords, OTPs, password reset\s+links, account activation\/invite links, service-role keys, bank credentials,\s+raw student PII, raw CCCD, raw phone numbers or raw payment data/i, "secret and PII boundary");
requireText(pack, /PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,\s+production migration is approved, owner waiver is approved, finance action is\s+approved, or production GO is approved/i, "PASS_LOCAL non-approval boundary");
requireText(pack, /HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\.md[\s\S]*audit:heu-controlled-evidence-redaction-pack[\s\S]*Raw evidence stays outside Git/i, "controlled evidence redaction reference");

requireText(
  pack,
  /Internal multi-account UAT[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md[\s\S]*TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP\.md[\s\S]*TTGDTX_BROWSER_UAT_MATRIX_20260625\.md[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md[\s\S]*NO-GO/i,
  "internal multi-account UAT operator handoff evidence",
);

requireText(
  pack,
  /Hard-delete\/cascade risk[\s\S]*HEU_NON_TTGDTX_CASCADE_REVIEW_20260627\.md[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*P6-06-FIND-001 through P6-06-FIND-044[\s\S]*conversion evidence or written waiver[\s\S]*NO-GO/i,
  "hard-delete/cascade finding register owner decision evidence",
);

for (const required of [
  "Production backup and restore dry-run",
  "Step90-Step110 migration order",
  "P0-19 legal/finance gate",
  "P3-01/P3-02 lead lifecycle and handover UAT",
  "P2-17 payout once",
  "P2-18 accounting dashboard",
  "P5-03 Finance Desk controlled trial and UAT",
  "Role and workspace permission",
  "Audit log completeness",
  "Hard-delete/cascade risk",
  "Internal multi-account UAT",
  "Controlled evidence redaction",
]) {
  requireText(pack, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${required} decision`);
}

for (const owner of ["BGH", "IT_DATA", "KHTC", "PHAP_CHE", "AUDIT", "TRUONG_PHONG"]) {
  requireText(pack, new RegExp(owner), `${owner} owner`);
}

requireText(
  pack,
  /Required Local Preflight[\s\S]*audit:ttgdtx-release-gates[\s\S]*audit:ttgdtx-production-owner-signoff-pack[\s\S]*npm\.cmd run lint[\s\S]*npm\.cmd run build[\s\S]*git status --short --branch/i,
  "required local preflight commands",
);

requireText(
  pack,
  /Required Local Preflight[\s\S]*audit:heu-controlled-evidence-redaction-pack/i,
  "redaction-pack local preflight command",
);

requireText(
  pack,
  /Stop Conditions[\s\S]*Any required owner decision is unsigned[\s\S]*Backup exists but restore dry-run is missing[\s\S]*P3-01\/P3-02 lead lifecycle or handover UAT is unsigned[\s\S]*P0-19\/P2-05\/P2-03 finance gates[\s\S]*P2-17 can pay twice[\s\S]*P2-18 dashboard can write data[\s\S]*Any real password, temporary password, OTP, password reset link, account\s+activation\/invite link, service-role key, bank credential, raw student PII/i,
  "stop conditions",
);

requireText(
  pack,
  /(?=[\s\S]*P5-03 Finance Desk controlled trial and UAT)(?=[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md)(?=[\s\S]*HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630\.md)(?=[\s\S]*P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005)(?=[\s\S]*P5_03_CONTROLLED_TRIAL_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P5-03 Finance Desk controlled-trial evidence)(?=[\s\S]*P5-03 Finance Desk controlled-trial evidence is missing, unsigned,\s+uncontrolled or lacks)/i,
  "P5-03 controlled-trial owner evidence path",
);

requireText(
  pack,
  /(?=[\s\S]*P5-03 Finance Desk controlled trial and UAT)(?=[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md)(?=[\s\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005)(?=[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED)(?=[\s\S]*Finance Day-1 result ledger is missing)(?=[\s\S]*access-retain\/revoke\/block decision is missing)(?=[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*or[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED)/i,
  "P5-03 Finance Day-1 result ledger owner evidence path",
);

requireText(
  pack,
  /(?=[\s\S]*P0-09-ACCEPT-03[\s\S]*P5-03 Finance Desk controlled trial)(?=[\s\S]*HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630\.md)(?=[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md)(?=[\s\S]*P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005)(?=[\s\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005)(?=[\s\S]*P5_03_CONTROLLED_TRIAL_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED)(?=[\s\S]*P5-03 controlled-trial evidence is missing)(?=[\s\S]*Finance Day-1 result ledger is missing)(?=[\s\S]*P0-09-DEC-04[\s\S]*P5-03 Finance Desk UAT[\s\S]*P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005[\s\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005[\s\S]*P5_03_CONTROLLED_TRIAL_READY \/ NO_GO \/ BLOCKED[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED)/i,
  "P0-09 acceptance and decision require P5-03 controlled trial",
);

requireText(
  pack,
  /(?=[\s\S]*P0-09 Owner GO\/NO-GO Acceptance Matrix)(?=[\s\S]*P0_09_ACCEPT \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-09-ACCEPT-01)(?=[\s\S]*P0-09-ACCEPT-06)(?=[\s\S]*P3-01\/P3-02 lifecycle and handover UAT)(?=[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md)(?=[\s\S]*P0-19\/P2-05\/P2-03 finance gates)(?=[\s\S]*P0-17 access closure decision)(?=[\s\S]*P0-17 access closure is missing)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*every unresolved P6-06 finding is converted or narrowly waived in writing)(?=[\s\S]*Codex\/AI is advisory only)(?=[\s\S]*Final outcome stays NO-GO until every stop condition is closed)/i,
  "P0-09 owner GO/NO-GO acceptance matrix",
);

requireText(
  pack,
  /(?=[\s\S]*P0-09 Final Owner GO\/NO-GO Decision Manifest)(?=[\s\S]*P0_09_FINAL_GO \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-09-DEC-01)(?=[\s\S]*P0-09-DEC-06)(?=[\s\S]*Evidence pack and redaction decision)(?=[\s\S]*Backup\/restore and migration authority decision)(?=[\s\S]*Legal, tuition and finance gate decision)(?=[\s\S]*UAT and operating proof decision)(?=[\s\S]*signed P3-01\/P3-02 lifecycle and handover UAT)(?=[\s\S]*P3 handover bypass of P0-19\/P2-05\/P2-03)(?=[\s\S]*Role, audit and hard-delete proof decision)(?=[\s\S]*P0-17 access closure decision)(?=[\s\S]*missing P0-17 access closure decision)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*Final multi-owner accountability decision)(?=[\s\S]*does not approve\s+production, backup, restore, migration, legal waiver, finance action, UAT\s+acceptance, payout, dashboard reliance or production GO)(?=[\s\S]*AI\/Codex is\s+named as approver, or PASS_LOCAL is treated as production GO)/i,
  "P0-09 final owner GO/NO-GO decision manifest",
);

requireText(
  pack,
  /Final production recommendation remains NO-GO until every required owner signs\s+GO, P0-09-ACCEPT-01 through P0-09-ACCEPT-06 are accepted and no stop condition\s+remains open/i,
  "final NO-GO until all owners sign",
);

requireText(
  ownerChecklist,
  /(?=[\s\S]*data-ttgdtx-owner-go-no-go-evidence-checklist="P0-09")(?=[\s\S]*P0-09 owner GO\/NO-GO evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0-09-01)(?=[\s\S]*P0-09-06)(?=[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md)(?=[\s\S]*P3-01\/P3-02 lead lifecycle and handover UAT)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md)(?=[\s\S]*Signed final GO\/NO-GO is still required)(?=[\s\S]*BGH, IT_DATA, KHTC, PHAP_CHE, AUDIT and\s+TRUONG_PHONG\/process owner must sign the decision outside\s+Codex\/chat)(?=[\s\S]*PASS_LOCAL does not approve backup, restore, migration, legal waiver,\s+finance action, UAT acceptance, payout, dashboard reliance or\s+production GO)(?=[\s\S]*secrets, passwords, temporary passwords,\s+OTPs, password reset links, account activation\/invite links,\s+service-role keys, bank credentials, raw student PII, raw CCCD, raw\s+phone numbers, raw bank account numbers, bank statements, vouchers or\s+raw payment data)/i,
  "P0-09 owner GO/NO-GO evidence checklist",
  ownerChecklistPath,
);

requireText(
  ownerChecklist,
  /(?=[\s\S]*P5-03 Finance Desk controlled-trial evidence P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005)(?=[\s\S]*HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630\.md)(?=[\s\S]*P5_03_CONTROLLED_TRIAL_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005 is missing)(?=[\s\S]*missing P5-03 controlled-trial evidence)/i,
  "P0-09 owner checklist P5-03 controlled-trial evidence",
  ownerChecklistPath,
);

requireText(
  ownerChecklist,
  /(?=[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md)(?=[\s\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005)(?=[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED)(?=[\s\S]*Finance Day-1 result ledger lacks)(?=[\s\S]*missing Finance Day-1 result ledger)(?=[\s\S]*missing access-retain\/revoke\/block decision)/i,
  "P0-09 owner checklist Finance Day-1 result ledger evidence",
  ownerChecklistPath,
);

requireText(
  ownerChecklist,
  /(?=[\s\S]*data-ttgdtx-owner-go-no-go-acceptance-matrix="P0-09")(?=[\s\S]*P0-09 owner GO\/NO-GO acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0_09_ACCEPT \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-09-ACCEPT-01)(?=[\s\S]*P0-09-ACCEPT-06)(?=[\s\S]*Evidence pack completeness and redaction)(?=[\s\S]*Backup\/restore and migration readiness)(?=[\s\S]*Finance, legal and UAT blockers closed)(?=[\s\S]*P3-01\/P3-02 lifecycle and handover UAT)(?=[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md)(?=[\s\S]*P0-19\/P2-05\/P2-03 finance gates)(?=[\s\S]*P0-17 access closure decision)(?=[\s\S]*P0-17 access closure is missing)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*Owner decision quorum and accountability)(?=[\s\S]*Production boundary and AI\/Codex limitation)(?=[\s\S]*Final outcome stays NO-GO until every stop condition is closed)/i,
  "P0-09 owner GO/NO-GO acceptance matrix",
  ownerChecklistPath,
);

requireText(
  ownerChecklist,
  /(?=[\s\S]*data-ttgdtx-owner-go-no-go-decision-manifest="P0-09")(?=[\s\S]*P0-09 final owner GO\/NO-GO decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0_09_FINAL_GO \/ NO_GO \/ BLOCKED)(?=[\s\S]*P0-09-DEC-01)(?=[\s\S]*P0-09-DEC-06)(?=[\s\S]*Evidence pack and redaction decision)(?=[\s\S]*Backup\/restore and migration authority decision)(?=[\s\S]*Legal, tuition and finance gate decision)(?=[\s\S]*UAT and operating proof decision)(?=[\s\S]*signed P3-01\/P3-02 lifecycle and handover UAT)(?=[\s\S]*P3 handover bypass of P0-19\/P2-05\/P2-03)(?=[\s\S]*Role, audit and hard-delete proof decision)(?=[\s\S]*P0-17 access closure decision)(?=[\s\S]*missing P0-17 access closure decision)(?=[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md)(?=[\s\S]*Final multi-owner accountability decision)(?=[\s\S]*does not approve production, backup, restore, migration,\s+legal waiver, finance action, UAT acceptance, payout,\s+dashboard reliance or production GO)(?=[\s\S]*AI\/Codex is named as approver, or PASS_LOCAL is treated\s+as production GO)/i,
  "P0-09 final owner GO/NO-GO decision manifest",
  ownerChecklistPath,
);

requireText(
  ttgdtxPage,
  /TtgdtxOwnerGoNoGoEvidenceChecklist[\s\S]*<TtgdtxProductionExecutionQueue\s*\/>[\s\S]*<TtgdtxOwnerGoNoGoEvidenceChecklist\s*\/>[\s\S]*<TtgdtxOperatingControlStrip\b/i,
  "TTGDTX page mounts owner GO/NO-GO evidence checklist after execution queue",
  ttgdtxPagePath,
);

requireText(
  checklist,
  /Final owner Go\/No-Go sign-off[\s\S]*IN_PROGRESS[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*P0-17 access closure decision[\s\S]*ttgdtx-owner-go-no-go-evidence-checklist\.tsx[\s\S]*owner GO\/NO-GO acceptance matrix[\s\S]*owner GO\/NO-GO decision manifest[\s\S]*audit:ttgdtx-production-owner-signoff-pack[\s\S]*signed final GO\/NO-GO decision still required/i,
  "production checklist final owner sign-off row",
  checklistPath,
);

requireText(
  checklist,
  /Final owner Go\/No-Go sign-off[\s\S]*HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630\.md[\s\S]*P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005[\s\S]*P5_03_CONTROLLED_TRIAL_READY \/ NO_GO \/ BLOCKED/i,
  "production checklist P0-09 P5-03 controlled-trial owner evidence",
  checklistPath,
);

requireText(
  checklist,
  /Final owner Go\/No-Go sign-off[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md[\s\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED/i,
  "production checklist P0-09 Finance Day-1 result ledger owner evidence",
  checklistPath,
);

requireText(
  backlog,
  /P0-09[\s\S]*Owner Go\/No-Go sign-off pack[\s\S]*PASS_LOCAL[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*P0-17 access closure decision[\s\S]*ttgdtx-owner-go-no-go-evidence-checklist\.tsx[\s\S]*owner GO\/NO-GO acceptance matrix[\s\S]*owner GO\/NO-GO decision manifest[\s\S]*audit:ttgdtx-production-owner-signoff-pack[\s\S]*owner GO\/NO-GO still required/i,
  "backlog P0-09 owner sign-off row",
  backlogPath,
);

requireText(
  backlog,
  /P0-09[\s\S]*Owner Go\/No-Go sign-off pack[\s\S]*HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630\.md[\s\S]*P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005[\s\S]*P5_03_CONTROLLED_TRIAL_READY \/ NO_GO \/ BLOCKED/i,
  "backlog P0-09 P5-03 controlled-trial owner evidence",
  backlogPath,
);

requireText(
  backlog,
  /P0-09[\s\S]*Owner Go\/No-Go sign-off pack[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md[\s\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED/i,
  "backlog P0-09 Finance Day-1 result ledger owner evidence",
  backlogPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-production-owner-signoff-pack"]) {
  fail("package.json: missing audit:ttgdtx-production-owner-signoff-pack script");
}

if (!packageJson.scripts?.["audit:heu-controlled-evidence-redaction-pack"]) {
  fail("package.json: missing audit:heu-controlled-evidence-redaction-pack script");
}

if (!agents.includes(packPath)) {
  fail("AGENTS.md: missing owner sign-off pack in required reading.");
}

if (!agents.includes("npm.cmd run audit:ttgdtx-production-owner-signoff-pack")) {
  fail("AGENTS.md: missing owner sign-off pack audit in final checks.");
}

if (
  !releaseGateAudit.includes(packPath) ||
  !releaseGateAudit.includes("docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md") ||
  !releaseGateAudit.includes(ownerChecklistPath) ||
  !releaseGateAudit.includes("audit:ttgdtx-production-owner-signoff-pack")
) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing owner sign-off pack coverage.");
}

if (failures.length > 0) {
  console.error("TTGDTX production owner sign-off pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "TTGDTX production owner sign-off pack audit passed. Production remains NO-GO until owners sign.",
);
