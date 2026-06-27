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

for (const file of [
  "AGENTS.md",
  "package.json",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const agents = read("AGENTS.md");
const packageJson = JSON.parse(read("package.json"));
const log = read("docs/HEU_IMPLEMENTATION_LOG.md");
const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
const inventory = read("docs/HEU_CURRENT_STATE_INVENTORY.md");
const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");

if (!packageJson.scripts?.["audit:heu-implementation-log"]) {
  fail("package.json: missing audit:heu-implementation-log script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:heu-implementation-log/i,
  "implementation-log audit in final handoff checks",
  "AGENTS.md",
);

requireText(
  releaseGateAudit,
  /scripts\/audit-heu-implementation-log\.mjs[\s\S]*audit:heu-implementation-log/i,
  "release-gate coverage for implementation-log audit",
  "scripts/audit-ttgdtx-release-gates.mjs",
);

requireText(
  backlog,
  /P0-05[\s\S]*Record every phase in `HEU_IMPLEMENTATION_LOG\.md`[\s\S]*PASS_LOCAL[\s\S]*docs\/HEU_IMPLEMENTATION_LOG\.md[\s\S]*audit:heu-implementation-log[\s\S]*log before commit[\s\S]*does not approve production/i,
  "P0-05 implementation-log backlog guard",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireText(
  checklist,
  /Implementation log discipline[\s\S]*PASS_LOCAL[\s\S]*docs\/HEU_IMPLEMENTATION_LOG\.md[\s\S]*audit:heu-implementation-log[\s\S]*scope, checks and local-only boundary/i,
  "production checklist implementation-log row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  checklist,
  /P0 controls include implementation-log discipline[\s\S]*P0-14 production evidence binder[\s\S]*P0-15 final\s+handoff coverage[\s\S]*Production remains NO-GO until\s+controlled external evidence and required owner signatures exist/i,
  "P0 Go/No-Go controls include implementation-log and local-only boundary",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  checklist,
  /highest priority blockers[\s\S]*Keep P0-05 implementation log audit green[\s\S]*safe build slice[\s\S]*scope, checks and local-only boundary[\s\S]*before commit/i,
  "priority blocker list includes P0-05 implementation-log guard",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  inventory,
  /npm\.cmd run audit:heu-implementation-log[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-user-account-security[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-lead-lifecycle-handover-uat-pack[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-p0-register-pack[\s\S]*PASS[\s\S]*Full `audit:\*` suite[\s\S]*P5-02 Master Control action queue and safe iteration loop[\s\S]*P5-03 Finance Desk read-only cockpit guard[\s\S]*P3-01\/P3-02 UAT execution pack guard[\s\S]*P0-05 implementation log audit guard[\s\S]*P0 register pack[\s\S]*user account temporary password guard[\s\S]*58 audit scripts passed/i,
  "current-state implementation-log audit evidence",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-13 TTGDTX Guard Shared Blocker Coverage[\s\S]*audit:heu-production-blocker-source[\s\S]*TTGDTX landing guard,\s+Master Control blocker summary and TTGDTX production execution queue must all\s+render from `lib\/production-readiness\.ts`[\s\S]*P0-13 backlog row, production checklist and current-state\s+inventory[\s\S]*shared blocker source explicitly covers the TTGDTX landing\s+guard[\s\S]*current-state and release-gate audits[\s\S]*cannot silently drift\s+back to only Master Control plus execution queue coverage[\s\S]*This is shared-source coverage alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action, approve owner waiver\s+or mark production GO/i,
  "P0-13 TTGDTX guard shared blocker coverage log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX Production Guard Shared Blocker Source[\s\S]*ttgdtx-production-readiness-guard\.tsx[\s\S]*renders `PRODUCTION_BLOCKERS` from\s+`lib\/production-readiness\.ts` instead of maintaining a shorter local blocker\s+list[\s\S]*backlog, production checklist and current-state inventory[\s\S]*TTGDTX guard, Master Control blocker summary and production execution queue\s+remain tied to the same shared blocker source[\s\S]*audit:ttgdtx-production-readiness-guard[\s\S]*local\s+`readinessBlockers` array cannot silently reappear[\s\S]*This is UI\/source alignment only[\s\S]*does not collect evidence, execute UAT,\s+approve migration, approve finance action, approve owner waiver or mark\s+production GO/i,
  "TTGDTX production guard shared blocker source log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-15 Final Handoff Owner Decision Manifest Alignment[\s\S]*AGENTS\.md[\s\S]*lib\/production-readiness\.ts[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*P0-15 final handoff summaries must\s+include the P0-09 final owner decision manifest alongside the P0-09\s+sign-off\/UAT handoff evidence path[\s\S]*final-handoff, production-blocker-source, production-evidence,\s+current-state, implementation-log and release-gate audits[\s\S]*This is final-handoff packaging only[\s\S]*does not collect evidence, accept\s+evidence, execute UAT, approve migration, approve finance action, approve\s+owner waiver or mark production GO/i,
  "P0-15 final handoff owner decision manifest alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-09 Final Owner Decision Manifest Shared Source Alignment[\s\S]*lib\/production-readiness\.ts[\s\S]*P0-09 and P0-14-09 shared source\s+wording requires the final owner decision manifest alongside the owner\s+sign-off pack, UAT operator handoff and redacted evidence references[\s\S]*production-blocker-source, production-evidence-binder,\s+implementation-log and release-gate audits[\s\S]*final owner decision cannot\s+drift back to a generic sign-off note[\s\S]*This is shared-source wording and guard alignment only[\s\S]*does not collect\s+evidence, accept evidence, execute UAT, approve migration, approve finance\s+action, approve owner waiver or mark production GO/i,
  "P0-09 final owner decision manifest shared source alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P5-02 P0-14 Intake Ledger Action Queue Alignment[\s\S]*Master Control blocker summary and TTGDTX production execution\s+queue[\s\S]*P0-14 intake-ledger evidence\s+binder before P0-15 final handoff and owner GO\/NO-GO[\s\S]*BGH operating dashboard spec, backlog, production checklist and\s+current-state inventory[\s\S]*does not reduce\s+P0-14 to a generic evidence binder[\s\S]*BGH dashboard, current-state, implementation-log, production\s+readiness and release-gate audits[\s\S]*This is management-queue wording and guard alignment only[\s\S]*does not\s+collect evidence, accept evidence, execute UAT, approve migration, approve\s+finance action, approve owner waiver or mark production GO/i,
  "P5-02 P0-14 intake ledger action queue alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-15 Final Handoff Evidence Intake Ledger Alignment[\s\S]*AGENTS\.md[\s\S]*P0-14 controlled evidence intake ledger, redaction reviewer and owner\s+signature state alongside P0-03\/P0-09\/P0-13\/P0-14 evidence paths[\s\S]*lib\/production-readiness\.ts[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*cannot treat the P0-14\s+evidence binder as complete without intake-ledger proof[\s\S]*final-handoff, current-state, implementation-log and release-gate\s+audits[\s\S]*This is final-handoff packaging only[\s\S]*does not collect evidence, accept\s+evidence, execute UAT, approve migration, approve finance action, approve\s+owner waiver or mark production GO/i,
  "P0-15 final handoff evidence intake ledger alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-14 Controlled Evidence Intake Ledger[\s\S]*ttgdtx-production-evidence-binder\.tsx[\s\S]*non-secret evidence ID, controlled folder reference,\s+evidence class, redaction reviewer, owner signature state and blocker\s+decision before P0-14 closure[\s\S]*HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\.md[\s\S]*P0_14_INTAKE_READY \/ NO_GO \/ BLOCKED[\s\S]*P0-10 redaction review hands off safely into P0-14[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production-evidence, controlled-evidence, current-state,\s+implementation-log and release-gate audits[\s\S]*This is evidence-intake packaging only[\s\S]*does not collect raw evidence,\s+accept evidence, approve UAT, approve migration, approve finance action,\s+approve owner waiver or mark production GO/i,
  "P0-14 controlled evidence intake ledger log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Step90-Step110 Migration Evidence Acceptance Lock[\s\S]*STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627\.md[\s\S]*MIG-LOCK-01 through\s+MIG-LOCK-06[\s\S]*P0-03 target identity lock, backup\/restore proof,\s+preflight\/postflight checks, restore smoke-check, rollback\/exception decision\s+and required owner evidence acceptance[\s\S]*lib\/production-readiness\.ts[\s\S]*target identity lock and\s+MIGRATION_EVIDENCE_ACCEPTED before migration-order signature[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*migration-order, production-blocker-source, current-state,\s+implementation-log and release-gate audits[\s\S]*This is migration-order packaging only[\s\S]*does not execute backup, restore,\s+production migration, rollback, UAT acceptance, evidence acceptance, owner\s+waiver, finance action or production GO/i,
  "Step90-Step110 migration evidence acceptance lock log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-03 Backup\/Restore Target Identity Lock[\s\S]*supabase-backup-restore-guard\.tsx[\s\S]*execution authority, production source-only status, isolated restore\s+target, app banner, SQL editor\/CLI profile and controlled evidence folder[\s\S]*STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\.md[\s\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\.md[\s\S]*P0-03-TARGET-01 through P0-03-TARGET-06[\s\S]*TARGET_LOCK_READY \/ STOP \/\s+BLOCKED[\s\S]*backlog, production checklist and current-state inventory[\s\S]*backup\/restore, current-state, implementation-log and release-gate\s+audits[\s\S]*This is target-lock packaging only[\s\S]*does not execute backup, restore,\s+migration dry-run, rollback, UAT acceptance, evidence acceptance, finance\s+action, owner waiver or production GO/i,
  "P0-03 backup/restore target identity lock log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX Governance UAT Execution Readiness[\s\S]*ttgdtx-uat-signoff-guard\.tsx[\s\S]*P6-04\/P6-03 governance UAT execution\s+readiness section before the UAT run closure tracker[\s\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS[\s\S]*route,\s+runbook, owner, local guard command and stop conditions[\s\S]*P6-04\s+role\/workspace UAT[\s\S]*P6-03 audit-log traceability UAT[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md[\s\S]*BLOCKED_PENDING_SIGNED_GOVERNANCE_UAT[\s\S]*P6-04 must run\s+before P6-03[\s\S]*synthetic accounts, controlled evidence,\s+redaction and owner signatures outside Git\/Codex\/chat[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*UAT readiness, production readiness, current-state, implementation\s+log and release-gate audits[\s\S]*This is UAT execution-readiness packaging only[\s\S]*does not execute UAT,\s+create synthetic accounts, grant access, collect evidence, accept audit\s+traceability, approve finance action, waive evidence or mark production GO/i,
  "TTGDTX governance UAT execution readiness log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX P0-14 Governance Evidence Checkpoint[\s\S]*ttgdtx-production-evidence-binder\.tsx[\s\S]*P0-14 governance evidence checkpoint[\s\S]*P6-04 role\/workspace proof[\s\S]*P6-03\s+audit trace proof[\s\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS[\s\S]*PRODUCTION_EVIDENCE_REQUIREMENTS[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production evidence binder and release-gate audits[\s\S]*This is evidence-checkpoint packaging only[\s\S]*does not collect evidence,\s+execute UAT, grant access, accept audit traceability, approve owner review,\s+waive evidence or mark production GO/i,
  "TTGDTX P0-14 governance evidence checkpoint log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX P6-04 P6-03 Governance Assurance Plan[\s\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS[\s\S]*P6-04 role\/workspace scope UAT[\s\S]*P6-03\s+audit-log traceability UAT[\s\S]*ttgdtx-production-execution-queue\.tsx[\s\S]*route, runbook, owner, evidence and local guard command before\s+dashboard\/Finance Desk UAT and risk-closure tracks[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production readiness, production blocker source, current-state and\s+release-gate audits[\s\S]*This is governance-assurance launch packaging only[\s\S]*does not execute UAT,\s+grant access, accept audit traceability,\s+approve finance action, accept\s+evidence, waive owner sign-off or mark production GO/i,
  "TTGDTX P6-04/P6-03 governance assurance plan log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX P0-19 P3 Gate Handover Readiness Plan[\s\S]*PRODUCTION_GATE_HANDOVER_STEPS[\s\S]*P0-19 legal\/finance gate UAT[\s\S]*P3-01\/P3-02 lead lifecycle\/handover UAT[\s\S]*ttgdtx-production-execution-queue\.tsx[\s\S]*route, runbook, owner, evidence and local guard command before\s+dashboard\/Finance Desk UAT and risk-closure tracks[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production readiness, production blocker source, current-state and\s+release-gate audits[\s\S]*This is gate-handover launch packaging only[\s\S]*does not execute UAT, accept\s+handover, create receivable, approve finance action, accept evidence, waive\s+owner sign-off or mark production GO/i,
  "TTGDTX P0-19/P3 gate-handover readiness plan log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX P0-03 Step90-Step110 Infra Readiness Plan[\s\S]*PRODUCTION_INFRA_READINESS_STEPS[\s\S]*P0-03 backup\/restore dry-run evidence[\s\S]*Step90-Step110 signed production migration order[\s\S]*ttgdtx-production-execution-queue\.tsx[\s\S]*route, runbook, owner, evidence and local guard command before UAT launch\s+and risk-closure tracks[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production readiness, production blocker source, current-state and\s+release-gate audits[\s\S]*This is infra-readiness launch packaging only[\s\S]*does not execute backup,\s+restore, production migration, migration-order approval, evidence acceptance,\s+finance action, UAT acceptance or production GO/i,
  "TTGDTX P0-03/Step90-Step110 infra readiness plan log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX P6-06 P2-17 Risk Closure Plan[\s\S]*PRODUCTION_RISK_CLOSURE_STEPS[\s\S]*P6-06 hard-delete\/cascade conversion-or-waiver[\s\S]*P2-17 payout duplicate\/dossier UAT[\s\S]*ttgdtx-production-execution-queue\.tsx[\s\S]*route,\s+runbook, owner, evidence and local guard command[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production readiness, production blocker source, current-state and\s+release-gate audits[\s\S]*This is risk-closure launch packaging only[\s\S]*does not execute payout UAT,\s+convert cascade rules, approve waiver, collect evidence, approve finance\s+action, accept evidence or mark production GO/i,
  "TTGDTX P6-06/P2-17 risk closure plan log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - TTGDTX P2-18 P5-03 UAT Launch Plan[\s\S]*PRODUCTION_UAT_LAUNCH_STEPS[\s\S]*P2-18 accounting dashboard[\s\S]*P5-03\s+Finance Desk[\s\S]*ttgdtx-production-execution-queue\.tsx[\s\S]*route, runbook,\s+owner, evidence and local guard command[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*production readiness, production blocker source, current-state and\s+release-gate audits[\s\S]*This is UAT launch packaging only[\s\S]*does not execute browser UAT, collect\s+evidence, accept dashboard reliance, approve finance action, approve\s+production migration or mark production GO/i,
  "TTGDTX P2-18/P5-03 UAT launch plan log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Finance Desk UAT Evidence Checklist[\s\S]*finance-desk-uat-evidence-checklist\.tsx[\s\S]*\/finance-desk[\s\S]*P5-03\s+browser UAT cases[\s\S]*acceptance criteria[\s\S]*no-secret evidence rules[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*audit-heu-finance-desk\.mjs[\s\S]*release-gate audits[\s\S]*This is UAT packaging only[\s\S]*does not execute UAT, collect evidence,\s+approve finance action, approve dashboard reliance, run production migration\s+or mark production GO/i,
  "Finance Desk UAT evidence checklist log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /(?=[\s\S]*## 2026-06-28 - Current State User Account Security Alignment)(?=[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md)(?=[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md)(?=[\s\S]*M02\/role-workspace scope)(?=[\s\S]*user account temporary password guard)(?=[\s\S]*58-audit-script count)(?=[\s\S]*audit-heu-current-state-inventory\.mjs)(?=[\s\S]*audit-heu-implementation-log\.mjs)(?=[\s\S]*release-gate audits)(?=[\s\S]*current-state\/backlog alignment only)(?=[\s\S]*does not create accounts)(?=[\s\S]*send passwords)(?=[\s\S]*approve role scope)(?=[\s\S]*mark production GO)/i,
  "current-state user-account security alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P2-10 Quick Finder Invoice Prompt[\s\S]*ttgdtx-process-quick-finder\.tsx[\s\S]*placeholder includes `xuat hoa don`[\s\S]*invoice\/chung-tu questions toward Thu hoc phi \(P2-10\)[\s\S]*audit-ttgdtx-process-labels\.mjs[\s\S]*release-gate audits[\s\S]*This is navigation\/discovery packaging only[\s\S]*does not approve invoice\s+issuance, legal\/tax interpretation, finance posting, UAT acceptance, owner\s+waiver or production GO/i,
  "P2-10 quick finder invoice prompt log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P2-10 Natural Invoice Search Fallback[\s\S]*ttgdtx-process-labels\.ts[\s\S]*thu tien co hoa don khong[\s\S]*thu tien co xuat hoa don khong[\s\S]*xuat hoa\s+don[\s\S]*co can hoa don[\s\S]*app\/search\/page\.tsx[\s\S]*merges local TTGDTX process-label\s+matches before remote search results[\s\S]*Thu hoc phi \(P2-10\)[\s\S]*invoice\/chung-tu questions[\s\S]*TTGDTX_PROCESS_CODE_MAP_20260625\.md[\s\S]*audit-ttgdtx-process-labels\.mjs[\s\S]*release-gate audits[\s\S]*This is navigation\/discovery packaging only[\s\S]*does not approve invoice\s+issuance, legal\/tax interpretation, finance posting, UAT acceptance, owner\s+waiver or production GO/i,
  "P2-10 natural invoice search fallback log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Current State P6-06 Conversion Or Written Waiver Wording[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*P6-06 priority action[\s\S]*hard-delete\/cascade findings need conversion or a\s+written waiver[\s\S]*not a generic waiver[\s\S]*audit-heu-current-state-inventory\.mjs[\s\S]*P6-06 blocker summary loses the conversion-or-written\s+waiver requirement[\s\S]*This is current-state wording alignment only[\s\S]*does not approve production\s+deletion, cascade execution, waiver, conversion migration, data cleanup,\s+evidence acceptance, owner GO\/NO-GO or production GO/i,
  "current-state P6-06 conversion-or-written-waiver wording log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-13 Shared Source P0-03 P3 Gate Proof[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*P0-13 shared blocker\s+source coverage[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate\s+preservation[\s\S]*operator run sheet and owner sign-off\/UAT handoff\s+path[\s\S]*audit-heu-production-blocker-source\.mjs[\s\S]*backlog,\s+checklist, current-state and shared P0-15 source checks fail[\s\S]*This is P0-13 source-alignment packaging only[\s\S]*does not execute backup,\s+restore, migration dry-run, UAT, evidence acceptance, finance action, owner\s+waiver or production GO/i,
  "P0-13 shared source P0-03/P3 gate proof log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-15 Final Handoff P0-03 P3 Gate Proof[\s\S]*AGENTS\.md[\s\S]*lib\/production-readiness\.ts[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*P0-03\s+restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*final-handoff, current-state and release-gate audits[\s\S]*This is final-handoff packaging only[\s\S]*does not execute backup, restore,\s+migration dry-run, UAT, evidence acceptance, finance action, owner waiver or\s+production GO/i,
  "P0-15 final handoff P0-03/P3 gate proof log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-14 Evidence Binder P0-03 P3 Gate Proof[\s\S]*lib\/production-readiness\.ts[\s\S]*P0-14-01 backup\/restore evidence[\s\S]*restore smoke-check proof that P0-19 and P3-01\/P3-02 gate\s+preservation survived the restore dry-run[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*P0-03 restore smoke-check proof for P0-19\/P3 gate preservation[\s\S]*production-evidence, current-state and release-gate audits[\s\S]*This is evidence-binder packaging only[\s\S]*does not execute backup, restore,\s+migration dry-run, UAT, evidence acceptance, finance action, owner waiver or\s+production GO/i,
  "P0-14 evidence binder P0-03/P3 gate proof log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-03 Restore Smoke-Check P0-19 P3 Gate Coverage[\s\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\.md[\s\S]*P0-19 legal\/finance gate UAT[\s\S]*P3-01\/P3-02 lifecycle\/handover UAT[\s\S]*supabase-backup-restore-guard\.tsx[\s\S]*P0-03-SMOKE-07[\s\S]*lead handover cannot create finance facts or bypass\s+P0-19\/P2-05\/P2-03 after restore[\s\S]*backlog, production checklist, backup\/restore audit and release-gate\s+audit[\s\S]*This is restore-smoke-check packaging only[\s\S]*does not execute backup,\s+restore, migration dry-run, UAT, evidence acceptance, finance action,\s+owner waiver or production GO/i,
  "P0-03 restore smoke-check P0-19/P3 gate coverage log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - Current State P0-09 P3 Evidence Alignment[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*Stage D\/NO-GO snapshot[\s\S]*P0-09 owner sign-off\/UAT handoff evidence path includes\s+the P3-01\/P3-02 lifecycle and handover UAT requirement[\s\S]*current-state audit[\s\S]*missing P3 UAT evidence in the owner\s+signoff path, controlled evidence path, final handoff path or production\s+NO-GO blocker list fails locally[\s\S]*This is current-state inventory alignment only[\s\S]*does not execute UAT,\s+attach real evidence, approve migration, approve finance action, accept\s+handover, waive owner sign-off or mark production GO/i,
  "current-state P0-09 P3 evidence alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-09 Owner Signoff P3 UAT Alignment[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*ttgdtx-owner-go-no-go-evidence-checklist\.tsx[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*P0-19, P2-17, P2-18 and P6-06 evidence[\s\S]*missing P3 UAT, unsigned\s+P3 handover or any P3 bypass of P0-19\/P2-05\/P2-03 finance gates keeps\s+production NO-GO[\s\S]*This is owner-signoff P3 UAT alignment only[\s\S]*does not execute UAT, accept\s+handover, create receivable, approve finance action, accept evidence, waive\s+owner sign-off or mark production GO/i,
  "P0-09 owner signoff P3 UAT alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P3-01 P3-02 Lead Lifecycle Handover UAT Pack[\s\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\.md[\s\S]*lead-lifecycle-guard\.tsx[\s\S]*P3-UAT-01 through\s+P3-UAT-08[\s\S]*audit:heu-lead-lifecycle-handover-uat-pack[\s\S]*This is P3 UAT packaging only[\s\S]*does not execute UAT, accept handover,\s+create receivable, approve finance action, accept evidence, waive owner\s+sign-off or mark production GO/i,
  "P3 lead lifecycle/handover UAT pack log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

for (const heading of [
  "P0-14 Evidence Binder Proof Alignment",
  "P0-15 Final Handoff Summary Guard",
  "P5-02 Execution Queue Evidence Closure Alignment",
  "P0-05 Implementation Log Audit Guard",
  "Production Priority Blocker List Alignment",
  "P0 Go No-Go Control Paragraph Alignment",
  "Current State Inventory P0 Control Alignment",
  "VND Audit Output Vietnamese Clarity",
  "Finance Desk Read-Only Guard Packaging",
  "Finance Desk UAT Runbook Packaging",
  "Finance Desk Process Finder Link",
  "P0 Register Pack Foundation",
  "Finance Desk No-Data Boundary Guard",
  "Finance Desk Vietnamese Copy Clarity",
]) {
  requireText(
    log,
    new RegExp(`## 2026-06-27 - ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    `log heading ${heading}`,
    "docs/HEU_IMPLEMENTATION_LOG.md",
  );
}

requireText(
  log,
  /## 2026-06-28 - P0-15 Final Handoff P6-06 Register Reference[\s\S]*AGENTS\.md[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*P6-06 hard-delete\/cascade proof paths[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*P0-15 final handoff coverage[\s\S]*final-handoff, current-state, implementation-log and release-gate\s+audits[\s\S]*This is final-handoff packaging only[\s\S]*does not approve production\s+deletion, cascade execution, waiver, conversion migration, evidence\s+acceptance, owner GO\/NO-GO or production GO/i,
  "P0-15 final handoff P6-06 register reference log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P0-09 Owner Signoff P6-06 Register Alignment[\s\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\.md[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*P6-06-FIND-001\s+through P6-06-FIND-044[\s\S]*ttgdtx-owner-go-no-go-evidence-checklist\.tsx[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*owner-signoff, implementation-log and release-gate audits[\s\S]*This is owner-signoff evidence alignment only[\s\S]*does not approve production\s+deletion, cascade execution, waiver, conversion migration, UAT acceptance,\s+owner GO\/NO-GO or production GO/i,
  "P0-09 owner signoff P6-06 register alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P6-06 Cascade Finding Register[\s\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*P6-06-FIND-001 through P6-06-FIND-044[\s\S]*current SQL locations, child tables,\s+parent references, owner lanes and required dispositions[\s\S]*HEU_NON_TTGDTX_CASCADE_REVIEW_20260627\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*non-TTGDTX cascade, current-state, implementation-log and release\s+gate audits[\s\S]*This is finding-register packaging only[\s\S]*does not approve production\s+deletion, cascade execution, waiver, conversion migration, data cleanup,\s+rollback success or production GO/i,
  "P6-06 cascade finding register log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P5-03 Finance Desk Reliance Decision Manifest[\s\S]*\/finance-desk[\s\S]*KHTC,\s+BGH, IT_DATA and AUDIT[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*Finance Desk, current-state, implementation-log and release-gate\s+audits[\s\S]*This is cockpit-reliance packaging only[\s\S]*does not approve finance action,\s+statutory accounting, voucher posting, bank transfer, UAT acceptance,\s+dashboard production reliance, owner waiver or production GO/i,
  "P5-03 Finance Desk reliance decision manifest log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /## 2026-06-28 - P3-02 Lead Handover Decision Manifest[\s\S]*lead-handover-panel\.tsx[\s\S]*HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627\.md[\s\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\.md[\s\S]*HEU_SYSTEM_BUILD_BACKLOG\.md[\s\S]*HEU_CURRENT_STATE_INVENTORY\.md[\s\S]*handover, current-state, implementation-log and release-gate audits[\s\S]*This is handover-reliance packaging only[\s\S]*does not approve enrollment,\s+receivable creation, tuition collection, invoice issuance, revenue\s+recognition, finance posting, UAT acceptance, owner waiver or production GO/i,
  "P3-02 lead handover decision manifest log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /P0-05 Implementation Log Audit Guard[\s\S]*audit:heu-implementation-log[\s\S]*P0-05 backlog[\s\S]*production checklist[\s\S]*current-state\s+inventory[\s\S]*This is governance-log alignment only[\s\S]*does not execute UAT, accept real\s+evidence, approve migration, approve finance action or mark production GO/i,
  "P0-05 log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Production Priority Blocker List Alignment[\s\S]*P0-14 evidence binder[\s\S]*P0-15 final handoff coverage[\s\S]*P0-05\s+implementation-log audit[\s\S]*audit:heu-production-evidence-binder[\s\S]*audit:heu-final-handoff-coverage[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is checklist-priority alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action or mark production GO/i,
  "priority blocker list alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /P0 Go No-Go Control Paragraph Alignment[\s\S]*P0 controls paragraph[\s\S]*implementation-log\s+discipline[\s\S]*P0-14 evidence binder[\s\S]*P0-15 final handoff coverage[\s\S]*Production remains NO-GO until controlled\s+external evidence and required owner signatures exist[\s\S]*audit:heu-production-evidence-binder[\s\S]*audit:heu-final-handoff-coverage[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is P0 control wording alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action or mark production GO/i,
  "P0 Go/No-Go control paragraph alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Current State Inventory P0 Control Alignment[\s\S]*current-state inventory[\s\S]*P0\s+Go\/No-Go control paragraph alignment[\s\S]*audit:heu-current-state-inventory[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is current-state inventory alignment only[\s\S]*does not collect evidence,\s+execute UAT, approve migration, approve finance action or mark production GO/i,
  "current-state inventory P0 control alignment log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /VND Audit Output Vietnamese Clarity[\s\S]*xong\/xanh[\s\S]*1\.000\.000 đ[\s\S]*audit:vnd-money-format[\s\S]*This is audit-output clarity only[\s\S]*does not change finance calculation,\s+collect evidence, execute UAT, approve migration, approve finance action or\s+mark production GO/i,
  "VND audit output clarity log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Finance Desk Read-Only Guard Packaging[\s\S]*\/finance-desk[\s\S]*P5-03[\s\S]*lib\/vnd-money\.ts[\s\S]*audit:heu-finance-desk[\s\S]*authentication, permission\/workspace scope,\s+read-only data sources, safe internal links and no write actions[\s\S]*This is PASS_LOCAL packaging only[\s\S]*does not execute UAT, approve finance\s+action, run production migration, accept evidence or mark production GO/i,
  "Finance Desk read-only guard packaging log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Finance Desk UAT Runbook Packaging[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*P5-03 browser UAT[\s\S]*contract-only denial[\s\S]*out-of-scope denial[\s\S]*read-only behavior[\s\S]*audit:heu-finance-desk[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is UAT packaging only[\s\S]*does not execute UAT, collect evidence,\s+approve finance action, run production migration, accept evidence or mark\s+production GO/i,
  "Finance Desk UAT runbook packaging log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Finance Desk Process Finder Link[\s\S]*HEU Finance Desk \(P5-03\)[\s\S]*TTGDTX process-label map[\s\S]*\/finance-desk[\s\S]*process-label and release-gate audits[\s\S]*This is navigation\/discovery packaging only[\s\S]*does not grant production\s+access, execute UAT, approve finance action, run production migration, accept\s+evidence or mark production GO/i,
  "Finance Desk process finder log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Finance Desk No-Data Boundary Guard[\s\S]*FinanceDeskReadOnlyBoundary[\s\S]*no-access,\s+missing-view and loaded-data states[\s\S]*Step90-Step111[\s\S]*backed-up UAT environment[\s\S]*This is UI safety packaging only[\s\S]*does not run Step111, execute UAT,\s+approve migration, approve finance action, accept evidence or mark production\s+GO/i,
  "Finance Desk no-data boundary guard log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /Finance Desk Vietnamese Copy Clarity[\s\S]*status badges, KPI cards,\s+missing-data state, source registry panel, control table and action links[\s\S]*audit:heu-finance-desk[\s\S]*audit:heu-vietnamese-text-encoding[\s\S]*audit:ttgdtx-release-gates[\s\S]*This is UI text clarity only[\s\S]*does not change finance calculation, run\s+Step111, execute UAT, approve migration, approve finance action, accept\s+evidence or mark production GO/i,
  "Finance Desk Vietnamese copy clarity log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  log,
  /P0 Register Pack Foundation[\s\S]*HEU P0 register pack as DRAFT_CONTROL documents[\s\S]*HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT\.md[\s\S]*Data\s+Master, minimum data dictionary, SOP-to-data mapping, report views, AI agent\s+scope and risk\/signoff boundaries[\s\S]*audit:heu-p0-register-pack[\s\S]*This is register packaging only[\s\S]*does not execute UAT, approve migration,\s+approve finance action or mark production GO/i,
  "P0 register pack foundation log boundary",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

if (failures.length > 0) {
  console.error("HEU implementation-log audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU implementation-log audit passed. P0-05 log discipline is guarded.");
