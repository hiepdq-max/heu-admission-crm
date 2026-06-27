import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const inventoryPath = "docs/HEU_CURRENT_STATE_INVENTORY.md";
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

function requireText(contents, pattern, label, file = inventoryPath) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

for (const file of [
  inventoryPath,
  "docs/GIT_CLEANUP_ANALYSIS.md",
  "docs/HEU_LEAD_LIFECYCLE_STANDARD_20260627.md",
  "docs/TTGDTX_CONTRACT_TUITION_MASTER_GUARD_20260627.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "AGENTS.md",
  "package.json",
]) {
  requireFile(file);
}

const inventory = existsSync(path.join(repoRoot, inventoryPath))
  ? read(inventoryPath)
  : "";
const agents = existsSync(path.join(repoRoot, "AGENTS.md")) ? read("AGENTS.md") : "";

requireText(inventory, /Date:\s*2026-06-27/i, "current inventory date");
requireText(
  inventory,
  /Git state:\s*clean local worktree at last verified handoff; exact ahead count and\s+current commit are live Git state/i,
  "live Git state boundary",
);
requireText(
  inventory,
  /Conclusion:\s*Stage D - internal controlled test only\. Production remains NO-GO/i,
  "Stage D NO-GO conclusion",
);
requireText(
  inventory,
  /npm\.cmd run audit:ttgdtx-release-gates[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-git-hygiene[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-process-labels[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-bgh-dashboard-spec[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-vietnamese-text-encoding[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-production-blocker-source[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-production-evidence-binder[\s\S]*PASS[\s\S]*npm\.cmd run audit:heu-final-handoff-coverage[\s\S]*PASS[\s\S]*npm\.cmd run audit:hard-delete-conversion-decision-queue[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-payout-execution-readiness[\s\S]*PASS[\s\S]*npm\.cmd run audit:ttgdtx-dashboard-source-reconciliation[\s\S]*PASS[\s\S]*Full `audit:\*` suite[\s\S]*TTGDTX process quick finder, P5-02 Master Control action queue, P0-13 blocker source evidence-path alignment, P0-14 evidence closure tracker, internal UAT run closure tracker, UAT execution closure template, UAT operator handoff sweeps and owner sign-off handoff alignment[\s\S]*53 audit scripts passed/i,
  "current audit evidence",
);
requireText(
  inventory,
  /npm\.cmd run audit:heu-lead-lifecycle-standard[\s\S]*PASS/i,
  "P3-01 lead lifecycle audit evidence",
);
requireText(
  inventory,
  /npm\.cmd run audit:ttgdtx-contract-tuition-master-guard[\s\S]*PASS/i,
  "P2-01/P2-02 master guard audit evidence",
);
requireText(
  inventory,
  /M05 Tuyen sinh CRM[\s\S]*P3-01 lifecycle guard, P3-01 acceptance matrix, P3-02 handover policy and P3-02 acceptance matrix exist[\s\S]*finance-gated/i,
  "M05 P3-01/P3-02 current module state",
);
requireText(
  inventory,
  /Lead lifecycle\/handover[\s\S]*P3-01 lifecycle standard, P3-01 acceptance matrix, P3-02 handover policy and P3-02 acceptance matrix exist[\s\S]*PASS_LOCAL[\s\S]*signed role\/workflow UAT pending/i,
  "P3-01/P3-02 control state",
);
requireText(
  inventory,
  /M09 Tai chinh\/Cong no[\s\S]*P2-01\/P2-02 master guard[\s\S]*P2-03 through P2-18[\s\S]*signed finance\/legal UAT still required/i,
  "M09 P2-01/P2-02 current module state",
);
requireText(
  inventory,
  /M10 Dashboard[\s\S]*P2-18 read-only guard, source reconciliation, dashboard acceptance matrix and P5-02 are read-only and UAT-gated/i,
  "M10 P2-18 dashboard acceptance matrix current module state",
);
requireText(
  inventory,
  /Production readiness guard[\s\S]*TTGDTX landing guard, internal UAT closure tracker, UAT execution closure template, UAT operator handoff, execution queue, owner GO\/NO-GO checklist, owner acceptance matrix and owner sign-off handoff evidence path[\s\S]*PASS_LOCAL, NO-GO[\s\S]*Backup\/restore[\s\S]*Evidence pack, UI guard, operator run sheet and restore smoke-check acceptance matrix exist[\s\S]*Template ready; real backup\/restore evidence missing/i,
  "P0-03 backup/restore smoke-check acceptance control state",
);
requireText(
  inventory,
  /Production blocker shared source[\s\S]*lib\/production-readiness\.ts[\s\S]*Master Control blocker summary and TTGDTX execution queue[\s\S]*P0-03 operator run sheet evidence path[\s\S]*P0-09 owner sign-off\/UAT handoff evidence path[\s\S]*PASS_LOCAL, NO-GO/i,
  "P0-13 production blocker shared source evidence-path state",
);
requireText(
  inventory,
  /Process discovery\/navigation[\s\S]*Shared TTGDTX process labels, Search suggestions and `\/ttgdtx` quick finder show business name before P2 code[\s\S]*PASS_LOCAL; signed browser UAT pending/i,
  "TTGDTX process discovery and quick finder control state",
);
requireText(
  inventory,
  /M01 Legal[\s\S]*P0-19 legal\/finance gate and acceptance matrix are packaged; signed UAT still required[\s\S]*Legal\/finance gate[\s\S]*P0-19 guard, UAT checklist and acceptance matrix exist[\s\S]*Signed legal\/finance UAT still required[\s\S]*Receivable\/collection\/reconciliation[\s\S]*P2-03, P2-10, P2-10 invoice\/chung-tu UAT evidence checklist, P2-13 and P2-14 packaged[\s\S]*Local controls pass; signed finance UAT pending/i,
  "P0-19 legal/finance acceptance matrix control state",
);
requireText(
  inventory,
  /Contract\/tuition master[\s\S]*P2-01\/P2-02 master guard exists[\s\S]*PASS_LOCAL[\s\S]*signed legal\/finance\/KHTC UAT pending/i,
  "P2-01/P2-02 control state",
);
requireText(
  inventory,
  /Accounting dashboard \/ BGH control[\s\S]*P2-18 read-only guard, source reconciliation checklist, UAT checklist, dashboard acceptance matrix and P5-02 Master Control action queue exist[\s\S]*Signed browser UAT pending/i,
  "P2-18 dashboard and P5-02 action queue control state",
);
requireText(
  inventory,
  /Partner payment\/payout[\s\S]*P2-15, P2-16, P2-17 packaged with dossier, duplicate, execution-readiness guards and payout acceptance matrix[\s\S]*Signed payout UAT pending/i,
  "P2-17 payout execution readiness control state",
);
requireText(
  inventory,
  /Hard-delete\/cascade[\s\S]*TTGDTX cascade passes; non-TTGDTX review identifies 44 findings and exposes a conversion\/waiver decision queue plus hard-delete\/cascade acceptance matrix[\s\S]*Conversion or written waiver pending/i,
  "P6-06 hard-delete decision queue control state",
);
requireText(
  inventory,
  /Controlled evidence[\s\S]*Redaction\/intake pack, audit guard, P0-14 evidence binder and closure tracker exist[\s\S]*Real evidence must stay outside Git\/Codex\/chat/i,
  "P0-14 controlled evidence binder closure tracker state",
);
requireText(
  inventory,
  /Role\/workspace scope[\s\S]*P6-04 pack, scope UI guard, evidence checklist, route matrix, acceptance matrix, internal UAT run closure tracker, execution-log closure template and UAT operator handoff exist[\s\S]*Multi-account signed UAT pending/i,
  "P6-04 role-scope route matrix control state",
);
requireText(
  inventory,
  /Audit log[\s\S]*Static coverage, audit trace acceptance matrix and audit-log evidence acceptance matrix pass locally[\s\S]*Signed audit-log UAT pending/i,
  "P6-03 audit trace acceptance matrix control state",
);
requireText(
  inventory,
  /P7-01\/P7-02\/P7-03 are PASS_LOCAL; autonomous AI remains locked/i,
  "AI remains advisory-only",
);
requireText(
  inventory,
  /Current stage:\s*Stage D - internal controlled test only[\s\S]*Production is still NO-GO because:[\s\S]*No real production backup\/restore dry-run evidence[\s\S]*Step90-Step110 production migration order is not signed[\s\S]*Final BGH\/IT_DATA\/KHTC\/PHAP_CHE\/Audit\/owner GO\/NO-GO is not signed/i,
  "production NO-GO blocker list",
);
requireText(
  inventory,
  /P3-01\/P3-02[\s\S]*still require signed evidence[\s\S]*Execute P3-01\/P3-02 lead lifecycle and handover UAT/i,
  "P3-01/P3-02 signed UAT priority",
);
requireText(
  inventory,
  /Record final owner GO\/NO-GO outside Codex\/chat using the owner sign-off pack\s+and UAT operator handoff references/i,
  "owner sign-off handoff priority",
);
requireText(
  inventory,
  /Do not paste|Raw PII, bank data, passwords, keys and vouchers must stay outside Git\/Codex\/chat/i,
  "sensitive-data boundary",
);

if (/Git state:\s*dirty/i.test(inventory)) {
  fail(`${inventoryPath}: must not say the current Git state is dirty.`);
}
if (/Latest known commit:\s*9d54348/i.test(inventory)) {
  fail(`${inventoryPath}: must not keep the stale 2026-06-22 commit marker.`);
}
if (/Dirty working tree\s*\|\s*HIGH/i.test(inventory)) {
  fail(`${inventoryPath}: stale dirty working tree risk row must be replaced.`);
}
if (/P2-01 TTGDTX contract active[\s\S]*\|\s*DONE\s*\|/i.test(inventory)) {
  fail(`${inventoryPath}: must not mark P2-01 DONE without signed evidence.`);
}
if (/P2-02 tuition policy ready[\s\S]*\|\s*DONE\s*\|/i.test(inventory)) {
  fail(`${inventoryPath}: must not mark P2-02 DONE without signed evidence.`);
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-current-state-inventory"]) {
  fail("package.json: missing audit:heu-current-state-inventory script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:heu-current-state-inventory/i,
  "final handoff current-state inventory audit command",
  "AGENTS.md",
);

if (failures.length > 0) {
  console.error("HEU current-state inventory audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU current-state inventory audit passed. Inventory reflects Stage D NO-GO current state.");
