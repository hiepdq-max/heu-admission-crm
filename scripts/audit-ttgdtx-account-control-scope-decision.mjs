import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const decisionPath = "docs/TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627.md";
const sourceNotePath = "docs/TTGDTX_ACCOUNT_FREEZE_RELEASE_ACCEPTANCE_NOTE_20260625.md";
const guardPath = "components/ttgdtx/ttgdtx-account-control-scope-guard.tsx";
const sourceControlPagePath = "app/ttgdtx/source-control/page.tsx";
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

function requireText(contents, pattern, label, file = decisionPath) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

requireFile(decisionPath);
requireFile(sourceNotePath);
requireFile(guardPath);
requireFile(sourceControlPagePath);
requireFile("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");

const decision = read(decisionPath);
const sourceNote = read(sourceNotePath);
const guard = read(guardPath);
const sourceControlPage = read(sourceControlPagePath);
const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");

requireText(decision, /Status:\s*PASS_LOCAL_SCOPE_DECISION/i, "PASS_LOCAL_SCOPE_DECISION status");
requireText(decision, /will not build or operate a real bank\s+freeze\/release action workflow inside the payment flow/i, "real bank action deferral");
requireText(decision, /only track account-control evidence as metadata/i, "metadata-only account-control scope");
requireText(decision, /Collateral giai-chap is explicitly outside the normal TTGDTX tuition collection,\s+reconciliation and partner-payment workflow/i, "collateral separation");
requireText(decision, /No bank action/i, "no bank action table rule");
requireText(decision, /No raw student\/bank recipient list/i, "no raw recipient list rule");
requireText(decision, /BBNT evidence[\s\S]*Blocks P2-15\/P2-17 if missing/i, "BBNT payment gate");
requireText(decision, /Partner invoice[\s\S]*Blocks P2-15\/P2-17 if missing/i, "partner invoice payment gate");
requireText(decision, /Allowing AI to approve, freeze, release, giai-chap, pay or mark production\s+GO/i, "AI stop condition");
requireText(decision, /PASS_LOCAL means scope is clarified and the risky real workflow is deferred[\s\S]*does not approve production bank operation, collateral release, production data\s+import, real UAT, production migration or production GO/i, "PASS_LOCAL non-approval boundary");
requireText(decision, /ttgdtx-account-control-scope-guard\.tsx[\s\S]*data-ttgdtx-account-control-scope-guard="P2-19"[\s\S]*metadata-only boundary/i, "UI guard reference");

requireText(
  guard,
  /(?=[\s\S]*data-ttgdtx-account-control-scope-guard="P2-19")(?=[\s\S]*Account-control scope guard: metadata-only)(?=[\s\S]*Phong tỏa\/giải tỏa tài khoản)(?=[\s\S]*không gửi lệnh ngân\s+hàng)(?=[\s\S]*không đánh dấu tài khoản đã phong tỏa\/giải tỏa)(?=[\s\S]*không phê\s+duyệt giải chấp)(?=[\s\S]*ACCT-CTRL-01)(?=[\s\S]*ACCT-CTRL-04)(?=[\s\S]*Tách biệt giải chấp tài sản bảo đảm)(?=[\s\S]*PASS_LOCAL chỉ là quyết định phạm vi)(?=[\s\S]*Không vận hành ngân hàng)(?=[\s\S]*không giải chấp tài sản bảo đảm)(?=[\s\S]*không\s+production GO)/i,
  "account-control scope UI guard",
  guardPath,
);

requireText(
  sourceControlPage,
  /TtgdtxAccountControlScopeGuard[\s\S]*<TtgdtxAccountControlScopeGuard \/>[\s\S]*P2-11/i,
  "source-control page mounts account-control scope guard",
  sourceControlPagePath,
);

requireText(
  sourceNote,
  /This is a read-only design-control artifact[\s\S]*does not approve production\s+migration, production import, bank action, payment, payout, collateral release\s+or go-live/i,
  "source note non-approval boundary",
  sourceNotePath,
);

requireText(
  checklist,
  /Account-control workflow for phong toa\/giai toa[\s\S]*PASS_LOCAL[\s\S]*TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627\.md[\s\S]*ttgdtx-account-control-scope-guard\.tsx[\s\S]*audit:ttgdtx-account-control-scope-decision/i,
  "account-control PASS_LOCAL checklist row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);
requireText(
  checklist,
  /Collateral giai-chap separation[\s\S]*PASS_LOCAL[\s\S]*TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627\.md[\s\S]*ttgdtx-account-control-scope-guard\.tsx[\s\S]*restricted legal-finance register/i,
  "collateral separation PASS_LOCAL checklist row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:ttgdtx-account-control-scope-decision"]) {
  fail("package.json: missing audit:ttgdtx-account-control-scope-decision script");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (!releaseGateAudit.includes(decisionPath) || !releaseGateAudit.includes("audit:ttgdtx-account-control-scope-decision")) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing account-control scope decision coverage.");
}

if (failures.length > 0) {
  console.error("TTGDTX account-control scope decision audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX account-control scope decision audit passed. Real bank/collateral operations remain deferred.");
