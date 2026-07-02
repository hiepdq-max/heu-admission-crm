import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
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

function requireText(relativePath, pattern, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  if (!pattern.test(contents)) {
    fail(`${relativePath}: missing ${label}`);
  }
}

const requiredFiles = [
  "docs/HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT.md",
  "docs/HEU_HOU_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  "components/hou/hou-ledger-handover-gap-pack.tsx",
  "app/hou/page.tsx",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = exists("package.json") ? JSON.parse(read("package.json")) : {};

if (!packageJson.scripts?.["audit:heu-hou-ledger-handover-gap-pack"]) {
  fail("package.json: missing audit:heu-hou-ledger-handover-gap-pack script");
}

requireText(
  "docs/HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*separate from TTGDTX and Short Course)(?=[\s\S]*HOU-LH-01)(?=[\s\S]*HOU-LH-08)(?=[\s\S]*HOU_LEDGER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*RV_HOU_LEDGER_SUMMARY)(?=[\s\S]*HOU-UAT-01)(?=[\s\S]*HOU-UAT-06)(?=[\s\S]*HEU_HOU_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md)(?=[\s\S]*HOU_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*HOU-UAT-LEDGER-01)(?=[\s\S]*HOU-UAT-LEDGER-06)(?=[\s\S]*must not:[\s\S]*Approve HOU handover)(?=[\s\S]*Finali[sz]e COM payable)(?=[\s\S]*Treat `RV_HOU_LEDGER_SUMMARY` as a production dashboard source)(?=[\s\S]*does not approve production HOU\s+handover, tuition ledger posting, invoice issuance, COM payout, finance action,\s+evidence acceptance, UAT acceptance, owner GO or production GO)(?=[\s\S]*does not execute UAT,\s+accept evidence,\s+approve HOU handover,\s+approve tuition ledger posting,\s+approve invoice issuance,\s+approve COM payout,\s+approve owner GO or mark production GO)/i,
  "HOU ledger/handover gap-pack DRAFT_CONTROL boundary",
);

requireText(
  "docs/HEU_HOU_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*HOU_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*HOU-UAT-LEDGER-01)(?=[\s\S]*HOU-UAT-LEDGER-06)(?=[\s\S]*HOU-LH-01)(?=[\s\S]*HOU-LH-08)(?=[\s\S]*PASS_LOCAL, Codex or AI output is treated as UAT or owner approval)(?=[\s\S]*does not execute UAT,\s+accept evidence, approve HOU handover,\s+approve tuition ledger posting, approve invoice issuance, approve COM payout,\s+approve owner GO or mark production GO)(?=[\s\S]*does not prove that any UAT case has been executed or\s+accepted)/i,
  "HOU UAT result ledger template",
);

requireText(
  "components/hou/hou-ledger-handover-gap-pack.tsx",
  /(?=[\s\S]*data-heu-hou-ledger-handover-gap-pack="P8-01")(?=[\s\S]*HOU Ledger\/Handover Gap Pack:\s*PASS_LOCAL only)(?=[\s\S]*HOU_LEDGER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*khỏi TTGDTX và Short Course)(?=[\s\S]*HOU-LH-01)(?=[\s\S]*HOU-LH-08)(?=[\s\S]*RV_HOU_LEDGER_SUMMARY)(?=[\s\S]*PASS_LOCAL does not approve HOU handover, tuition ledger posting,\s+invoice issuance, COM payout, finance action, UAT acceptance,\s+evidence acceptance, owner GO or production GO)/i,
  "visible HOU ledger/handover gap-pack panel",
);

requireText(
  "components/hou/hou-ledger-handover-gap-pack.tsx",
  /(?=[\s\S]*data-heu-hou-uat-result-ledger="P8-01_UAT_RESULT_LEDGER")(?=[\s\S]*data-heu-hou-uat-result-ledger="P8-01_UAT_RESULT_LEDGER"[\s\S]*table-fixed)(?=[\s\S]*data-heu-hou-uat-result-ledger="P8-01_UAT_RESULT_LEDGER"[\s\S]*whitespace-normal)(?=[\s\S]*data-heu-hou-uat-result-ledger="P8-01_UAT_RESULT_LEDGER"[\s\S]*break-words)(?=[\s\S]*data-heu-hou-uat-result-decision="HOU_UAT_RESULT_READY_NO_GO_BLOCKED")(?=[\s\S]*HOU UAT result ledger)(?=[\s\S]*docs\/HEU_HOU_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md)(?=[\s\S]*HOU_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*HOU-UAT-LEDGER-01)(?=[\s\S]*HOU-UAT-LEDGER-06)(?=[\s\S]*controlled evidence ref)(?=[\s\S]*outside Codex\/chat)/i,
  "visible HOU UAT result ledger panel",
);

requireText(
  "components/hou/hou-ledger-handover-gap-pack.tsx",
  /(?=[\s\S]*data-heu-hou-short-course-scope-switch="REAL-OPS-07_QUICK_SCOPE_SWITCH")(?=[\s\S]*data-heu-hou-short-course-quick-link="HOU_TO_SHORT_COURSE")(?=[\s\S]*href="\/short-course")(?=[\s\S]*aria-label="Open Short Course control surface from HOU scope switch")(?=[\s\S]*title="Open Short Course control surface")(?=[\s\S]*href="\/master-control")(?=[\s\S]*aria-label="Open Master Control from HOU scope switch")(?=[\s\S]*title="Open Master Control")(?=[\s\S]*HOU \/ Short Course scope switch)(?=[\s\S]*min-w-0)(?=[\s\S]*overflow-hidden)(?=[\s\S]*break-words)(?=[\s\S]*truncate)(?=[\s\S]*shrink-0)(?=[\s\S]*flex-wrap)/i,
  "HOU quick scope switch and overflow guards",
);

requireText(
  "app/hou/page.tsx",
  /(?=[\s\S]*HouLedgerHandoverGapPack)(?=[\s\S]*<HouLedgerHandoverGapPack \/>)/i,
  "HOU page mounts gap-pack panel",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P8-01[\s\S]*HOU ledger\/handover gap pack[\s\S]*PASS_LOCAL[\s\S]*HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*HEU_HOU_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*hou-ledger-handover-gap-pack\.tsx[\s\S]*\/hou[\s\S]*HOU-LH-01 through HOU-LH-08[\s\S]*HOU-UAT-LEDGER-01 through HOU-UAT-LEDGER-06[\s\S]*HOU_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-hou-ledger-handover-gap-pack[\s\S]*does not approve HOU handover, tuition ledger posting, invoice issuance, COM payout, finance action, UAT acceptance, evidence acceptance, owner GO or production GO/i,
  "P8-01 backlog row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /HOU ledger\/handover gap pack[\s\S]*PASS_LOCAL[\s\S]*HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*HEU_HOU_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*hou-ledger-handover-gap-pack\.tsx[\s\S]*\/hou[\s\S]*HOU-UAT-LEDGER-01 through HOU-UAT-LEDGER-06[\s\S]*HOU_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-hou-ledger-handover-gap-pack[\s\S]*signed HOU handover UAT, tuition ledger proof, COM policy\/signoff, UAT result ledger completion and report-view owner signoff still required/i,
  "production checklist HOU gap-pack row",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /npm\.cmd run audit:heu-hou-ledger-handover-gap-pack[\s\S]*PASS[\s\S]*HOU ledger\/handover gap pack[\s\S]*\/hou[\s\S]*HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*HEU_HOU_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*HOU-LH-01 through HOU-LH-08[\s\S]*HOU-UAT-LEDGER-01 through HOU-UAT-LEDGER-06[\s\S]*HOU_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*PASS_LOCAL; no HOU handover, tuition ledger posting, invoice issuance, COM payout, finance action, UAT acceptance, evidence acceptance, owner GO or production GO approved/i,
  "current-state HOU gap-pack evidence",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /(?=[\s\S]*HOU Partnership Module)(?=[\s\S]*HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT\.md)(?=[\s\S]*HEU_HOU_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md)(?=[\s\S]*HOU-LH-01 through HOU-LH-08)(?=[\s\S]*HOU-UAT-LEDGER-01 through HOU-UAT-LEDGER-06)(?=[\s\S]*CAN_SUA)(?=[\s\S]*UAT result ledger)(?=[\s\S]*HOU handover UAT, HOU tuition ledger, HOU UAT result ledger, HOU commission policy\/signoff)(?=[\s\S]*HOU ledger\/handover gap pack)(?=[\s\S]*hou-ledger-handover-gap-pack\.tsx)(?=[\s\S]*HOU_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*audit:heu-hou-ledger-handover-gap-pack)/i,
  "module readiness HOU gap-pack routing",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - P8-01 HOU UAT Result Ledger Guard[\s\S]*HEU_HOU_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*HOU-UAT-LEDGER-01[\s\S]*HOU-UAT-LEDGER-06[\s\S]*HOU_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*data-heu-hou-uat-result-ledger="P8-01_UAT_RESULT_LEDGER"[\s\S]*table-fixed[\s\S]*break-words[\s\S]*does not\s+execute UAT[\s\S]*accept evidence[\s\S]*approve HOU handover[\s\S]*approve tuition ledger\s+posting[\s\S]*approve invoice issuance[\s\S]*approve COM payout[\s\S]*approve owner GO[\s\S]*production GO/i,
  "implementation log HOU UAT result ledger guard entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-06-28 - HOU Ledger Handover Gap Pack[\s\S]*HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*components\/hou\/hou-ledger-handover-gap-pack\.tsx[\s\S]*HOU-LH-01 through HOU-LH-08[\s\S]*HOU_LEDGER_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-hou-ledger-handover-gap-pack[\s\S]*This is HOU control packaging only[\s\S]*does not approve HOU handover[\s\S]*tuition ledger posting[\s\S]*invoice issuance[\s\S]*COM payout[\s\S]*finance action[\s\S]*UAT\s+acceptance[\s\S]*evidence acceptance[\s\S]*owner GO[\s\S]*production GO/i,
  "implementation log HOU gap-pack entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-02 - P8\/P9 HOU Short Course Quick Scope Switch[\s\S]*components\/hou\/hou-ledger-handover-gap-pack\.tsx[\s\S]*data-heu-hou-short-course-scope-switch="REAL-OPS-07_QUICK_SCOPE_SWITCH"[\s\S]*data-heu-hou-short-course-quick-link="HOU_TO_SHORT_COURSE"[\s\S]*components\/short-course\/short-course-attendance-payment-gap-pack\.tsx[\s\S]*data-heu-hou-short-course-quick-link="SHORT_COURSE_TO_HOU"[\s\S]*audit:heu-hou-ledger-handover-gap-pack[\s\S]*audit:heu-short-course-attendance-payment-gap-pack[\s\S]*does not approve HOU handover[\s\S]*attendance lock[\s\S]*finance action[\s\S]*UAT acceptance[\s\S]*owner GO[\s\S]*production GO/i,
  "implementation log HOU/Short Course quick scope switch entry",
);

requireText(
  "AGENTS.md",
  /Required Reading Before Meaningful Changes[\s\S]*docs\/HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*docs\/HEU_HOU_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*Before any final handoff[\s\S]*npm\.cmd run audit:heu-hou-ledger-handover-gap-pack/i,
  "AGENTS required reading and final handoff audit",
);

requireText(
  "scripts/audit-ttgdtx-release-gates.mjs",
  /docs\/HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT\.md[\s\S]*docs\/HEU_HOU_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*components\/hou\/hou-ledger-handover-gap-pack\.tsx[\s\S]*scripts\/audit-heu-hou-ledger-handover-gap-pack\.mjs[\s\S]*audit:heu-hou-ledger-handover-gap-pack/i,
  "release-gate file and script coverage",
);

if (failures.length > 0) {
  console.error("HEU HOU ledger/handover gap-pack audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU HOU ledger/handover gap-pack audit passed. P8-01 remains PASS_LOCAL and production HOU stays NO-GO.",
);
