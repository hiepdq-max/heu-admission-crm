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
  /(?=[\s\S]*P0-19)(?=[\s\S]*Legal basis)(?=[\s\S]*Tuition policy)(?=[\s\S]*Finance gate)(?=[\s\S]*ALLOW_FINANCE)/i,
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
  /Step100[\s\S]*sandbox\/UAT[\s\S]*Khong dung Step100 lam bang\s+chung production/i,
  "Step100 sandbox-only warning",
  componentPath,
);
requireText(
  evidenceChecklist,
  /(?=[\s\S]*data-ttgdtx-p019-uat-evidence-checklist="P0-19")(?=[\s\S]*P0-19 legal\/finance UAT evidence checklist)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*Signed legal\/finance UAT is still required before P0-19 can move\s+from IN_PROGRESS)(?=[\s\S]*P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK\.md)(?=[\s\S]*P0-19-01)(?=[\s\S]*P0-19-07)(?=[\s\S]*PHAP_CHE, KHTC, BGH and\s+Audit must sign the evidence outside Codex\/chat)/i,
  "P0-19 UAT evidence checklist",
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
  checklist,
  /P0-19 legal\/finance gate ready[\s\S]*IN_PROGRESS[\s\S]*ttgdtx-p019-gate-guard\.tsx[\s\S]*ttgdtx-p019-uat-evidence-checklist\.tsx[\s\S]*audit:ttgdtx-p019-gate-guard[\s\S]*signed legal\/finance UAT still required/i,
  "P0-19 checklist row remains signed-UAT gated",
  checklistPath,
);
requireText(
  backlog,
  /P2-00[\s\S]*P0-19 major legal\/tuition finance gate[\s\S]*PASS_LOCAL[\s\S]*ttgdtx-p019-uat-evidence-checklist\.tsx[\s\S]*audit:ttgdtx-p019-gate-guard/i,
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
