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

const componentPath = "components/ttgdtx/ttgdtx-p019-gate-guard.tsx";
const evidenceChecklistPath =
  "components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx";
const gatePagePath = "app/ttgdtx/gate/page.tsx";
const receivablesPagePath = "app/ttgdtx/receivables/page.tsx";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";
const backlogPath = "docs/HEU_SYSTEM_BUILD_BACKLOG.md";

for (const file of [
  componentPath,
  evidenceChecklistPath,
  gatePagePath,
  receivablesPagePath,
  checklistPath,
  backlogPath,
  "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
  "scripts/audit-ttgdtx-pilot-open-safety.mjs",
]) {
  requireFile(file);
}

const component = read(componentPath);
const evidenceChecklist = read(evidenceChecklistPath);
const gatePage = read(gatePagePath);
const receivablesPage = read(receivablesPagePath);
const checklist = read(checklistPath);
const backlog = read(backlogPath);
const runbook = read("docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md");
const agents = read("AGENTS.md");
const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
const packageJson = JSON.parse(read("package.json"));

requireText(
  component,
  /data-ttgdtx-p019-gate-guard="P0-19"/,
  "P0-19 guard marker",
  componentPath,
);
requireText(
  component,
  /(?=[\s\S]*P0-19)(?=[\s\S]*(Legal basis|Căn cứ pháp lý))(?=[\s\S]*(Tuition policy|Chính sách học phí))(?=[\s\S]*(Finance gate|Cửa kiểm soát tài chính))(?=[\s\S]*ALLOW_FINANCE)(?=[\s\S]*công nợ phải thu)/i,
  "P0-19 legal tuition finance explanation",
  componentPath,
);
requireText(
  component,
  /P0_19_MAJOR_GATE_MISSING[\s\S]*P0_19_MAJOR_FINANCE_GATE_NOT_READY[\s\S]*signed UAT/i,
  "P0-19 stop conditions",
  componentPath,
);
requireText(
  component,
  /Step100[\s\S]*sandbox\/UAT[\s\S]*(Khong dung Step100 lam bang\s+chung production|Không dùng Step100 làm bằng\s+chứng production)/i,
  "Step100 sandbox-only warning",
  componentPath,
);
requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-ttgdtx-p019-uat-evidence-checklist="P0-19")(?=[\s\S]*P0-19 legal\/finance UAT evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Signed legal\/finance UAT is still required before P0-19 can move\s+from IN_PROGRESS)(?=[\s\S]*P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK\.md)(?=[\s\S]*P0-19-01)(?=[\s\S]*P0-19-07)(?=[\s\S]*temporary passwords)(?=[\s\S]*password reset links)(?=[\s\S]*account activation\/invite links)(?=[\s\S]*service-role keys and production\s+credentials)(?=[\s\S]*PHAP_CHE, KHTC, BGH and\s+Audit must sign the evidence outside Codex\/chat)/i,
  "P0-19 UAT evidence checklist",
  evidenceChecklistPath,
);
requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-ttgdtx-p019-immediate-stop="P0-19")(?=[\s\S]*P0-19 legal\/finance immediate stop guard: PASS_LOCAL only)(?=[\s\S]*P0-19-STOP-01)(?=[\s\S]*P0-19-STOP-05)(?=[\s\S]*P0_19_STOP_CHECK \/ GO_NEXT \/ BLOCKED)(?=[\s\S]*Legal scope, center, program\/major, effective period or approving owner is unclear)(?=[\s\S]*Tuition amount, term, due rule, payer model, invoice\/chung-tu responsibility or waiver basis is unresolved)(?=[\s\S]*P2-05 or P2-03 can create receivable while P0-19 is missing)(?=[\s\S]*Step100 or any legal\/tuition\/finance exception is oral, ownerless, expired, broad or treated as production authority)(?=[\s\S]*Signed legal\/finance UAT or owner sign-off is missing)(?=[\s\S]*private contracts, raw PII, CCCD, bank data, credentials, passwords, temporary passwords, OTPs, password reset links, account activation\/invite links, vouchers or payment data)/i,
  "P0-19 immediate stop guard",
  evidenceChecklistPath,
);
requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-ttgdtx-p019-waiver-exception-register="P0-19")(?=[\s\S]*P0-19 waiver\/exception register)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0-19-WAIVE-01)(?=[\s\S]*P0-19-WAIVE-04)(?=[\s\S]*Step100 sandbox pilot open)(?=[\s\S]*Legal basis exception)(?=[\s\S]*Tuition\/invoice policy exception)(?=[\s\S]*Finance gate override request)(?=[\s\S]*P0_19_WAIVER_ACCEPT \/ NO_GO \/ BLOCKED)(?=[\s\S]*PASS_LOCAL does not approve a legal waiver, tuition exception, finance\s+override, Step100 production use, receivable creation, revenue\s+recognition or production GO)/i,
  "P0-19 waiver/exception register",
  evidenceChecklistPath,
);
requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-ttgdtx-p019-acceptance-matrix="P0-19")(?=[\s\S]*P0-19 legal\/finance acceptance matrix)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*legal\s+authority)(?=[\s\S]*tuition policy)(?=[\s\S]*finance gate status)(?=[\s\S]*Step100 sandbox\s+boundary)(?=[\s\S]*blocked\/allowed receivable path)(?=[\s\S]*owner sign-off)(?=[\s\S]*P0-19-ACCEPT-01)(?=[\s\S]*P0-19-ACCEPT-06)(?=[\s\S]*P0_19_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*Missing owner signature keeps production NO-GO)/i,
  "P0-19 legal/finance acceptance matrix",
  evidenceChecklistPath,
);

requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-ttgdtx-p019-gate-decision-manifest="P0-19")(?=[\s\S]*P0-19 legal\/finance gate decision manifest)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*P0-19-DEC-01)(?=[\s\S]*P0-19-DEC-06)(?=[\s\S]*Legal authority accepted)(?=[\s\S]*Tuition and invoice policy aligned)(?=[\s\S]*Finance gate blocks then allows)(?=[\s\S]*Step100 and exceptions controlled)(?=[\s\S]*Redacted evidence and owner signatures complete)(?=[\s\S]*Human gate decision recorded)(?=[\s\S]*P0_19_GATE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Missing gate decision ID, unsigned owner evidence, unresolved\s+invoice\/chung-tu basis, uncontrolled exception or raw sensitive\s+evidence keeps P0-19 NO-GO)/i,
  "P0-19 gate decision manifest",
  evidenceChecklistPath,
);

for (const [file, contents] of [
  [gatePagePath, gatePage],
  [receivablesPagePath, receivablesPage],
]) {
  requireText(
    contents,
    /<TtgdtxP019GateGuard\s*\/>[\s\S]*<TtgdtxP019UatEvidenceChecklist\s*\/>/,
    "P0-19 guard and UAT evidence checklist mount",
    file,
  );
}

requireText(
  runbook,
  /Step100 is sandbox\/UAT only and must never be used as production legal, tuition, revenue or payout authority/i,
  "Step100 production boundary in runbook",
  "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
);
requireText(
  runbook,
  /(?=[\s\S]*data-ttgdtx-p019-immediate-stop="P0-19")(?=[\s\S]*P0-19-STOP-01 through P0-19-STOP-05)(?=[\s\S]*P0_19_STOP_CHECK \/ GO_NEXT \/ BLOCKED)(?=[\s\S]*Immediate stop guard)(?=[\s\S]*legal scope, center, program\/major,\s+effective period or owner is unclear)(?=[\s\S]*tuition, payer, invoice\/chung-tu or\s+waiver basis is unresolved)(?=[\s\S]*P2-05\/P2-03 can create receivable while P0-19\s+is missing, blocked, unsigned, broadly waived or sandbox-only)(?=[\s\S]*signed UAT\/owner sign-off is missing or raw sensitive\s+evidence appears)(?=[\s\S]*temporary passwords)(?=[\s\S]*password reset links)(?=[\s\S]*account activation\/invite links)/i,
  "P0-19 immediate stop guard in runbook",
  "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
);
requireText(
  runbook,
  /(?=[\s\S]*P0-19 Waiver\/Exception Register)(?=[\s\S]*data-ttgdtx-p019-waiver-exception-register="P0-19")(?=[\s\S]*P0-19-WAIVE-01)(?=[\s\S]*P0-19-WAIVE-04)(?=[\s\S]*P0_19_WAIVER_ACCEPT \/ NO_GO \/ BLOCKED)(?=[\s\S]*PASS_LOCAL does not approve a legal waiver, tuition exception, finance override,\s+Step100 production use, receivable creation, revenue recognition or production\s+GO)/i,
  "P0-19 waiver/exception register in runbook",
  "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
);
requireText(
  runbook,
  /(?=[\s\S]*P0-19 Acceptance Matrix)(?=[\s\S]*data-ttgdtx-p019-acceptance-matrix="P0-19")(?=[\s\S]*P0-19-ACCEPT-01)(?=[\s\S]*P0-19-ACCEPT-06)(?=[\s\S]*P0_19_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*PASS_LOCAL is treated as legal, finance, UAT, revenue or production approval)(?=[\s\S]*Missing owner signature keeps production NO-GO)/i,
  "P0-19 acceptance matrix in runbook",
  "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
);

requireText(
  runbook,
  /(?=[\s\S]*P0-19 Gate Decision Manifest)(?=[\s\S]*data-ttgdtx-p019-gate-decision-manifest="P0-19")(?=[\s\S]*P0-19-DEC-01)(?=[\s\S]*P0-19-DEC-06)(?=[\s\S]*P0_19_GATE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Missing gate decision ID, unsigned owner evidence, unresolved invoice\/chung-tu\s+basis, uncontrolled exception or raw sensitive evidence keeps P0-19 NO-GO)/i,
  "P0-19 gate decision manifest in runbook",
  "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
);

requireText(
  checklist,
  /P0-19 legal\/finance gate ready[\s\S]*IN_PROGRESS[\s\S]*ttgdtx-p019-gate-guard\.tsx[\s\S]*ttgdtx-p019-uat-evidence-checklist\.tsx[\s\S]*P0-19 immediate stop guard[\s\S]*P0-19 waiver\/exception register[\s\S]*P0-19 acceptance matrix[\s\S]*P0-19 gate decision manifest[\s\S]*audit:ttgdtx-p019-gate-guard[\s\S]*signed legal\/finance UAT still required/i,
  "P0-19 checklist row remains signed-UAT gated",
  checklistPath,
);
requireText(
  backlog,
  /P2-00[\s\S]*P0-19 major legal\/tuition finance gate[\s\S]*PASS_LOCAL[\s\S]*ttgdtx-p019-uat-evidence-checklist\.tsx[\s\S]*P0-19 immediate stop guard[\s\S]*P0-19 waiver\/exception register[\s\S]*P0-19 acceptance matrix[\s\S]*P0-19 gate decision manifest[\s\S]*audit:ttgdtx-p019-gate-guard/i,
  "P2-00 backlog guard evidence",
  backlogPath,
);

if (!packageJson.scripts?.["audit:ttgdtx-p019-gate-guard"]) {
  failures.push("package.json: missing audit:ttgdtx-p019-gate-guard script");
}

requireText(
  agents,
  /npm\.cmd run audit:ttgdtx-p019-gate-guard/,
  "AGENTS final handoff audit command",
  "AGENTS.md",
);

for (const needle of [
  componentPath,
  evidenceChecklistPath,
  "scripts/audit-ttgdtx-p019-gate-guard.mjs",
  "audit:ttgdtx-p019-gate-guard",
]) {
  if (!releaseGateAudit.includes(needle)) {
    failures.push(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX P0-19 gate guard audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "TTGDTX P0-19 gate guard audit passed. Legal/tuition/finance blockers are visible before P2-03.",
);
