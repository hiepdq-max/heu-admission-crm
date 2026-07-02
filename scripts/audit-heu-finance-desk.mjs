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

function requireAllText(contents, tokens, label, file) {
  for (const token of tokens) {
    if (!contents.includes(token)) {
      fail(`${file}: missing ${label}: ${token}`);
    }
  }
}

for (const file of [
  "app/finance-desk/page.tsx",
  "components/finance/finance-day-one-accountant-handoff.tsx",
  "components/finance/finance-official-operation-gate.tsx",
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
  "database/step108_ttgdtx_accounting_dashboard_p2_18.sql",
  "database/step111_heu_finance_desk.sql",
  "docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
  "docs/HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md",
  "docs/HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
  "docs/HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
  "docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
  "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md",
  "components/layout/app-shell.tsx",
  "lib/vnd-money.ts",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const page = existsSync(path.join(repoRoot, "app/finance-desk/page.tsx"))
  ? read("app/finance-desk/page.tsx")
  : "";
const officialOperationGate = existsSync(
  path.join(repoRoot, "components/finance/finance-official-operation-gate.tsx"),
)
  ? read("components/finance/finance-official-operation-gate.tsx")
  : "";
const accountantHandoff = existsSync(
  path.join(repoRoot, "components/finance/finance-day-one-accountant-handoff.tsx"),
)
  ? read("components/finance/finance-day-one-accountant-handoff.tsx")
  : "";
const uatChecklist = existsSync(
  path.join(repoRoot, "components/finance/finance-desk-uat-evidence-checklist.tsx"),
)
  ? read("components/finance/finance-desk-uat-evidence-checklist.tsx")
  : "";
const appShell = existsSync(path.join(repoRoot, "components/layout/app-shell.tsx"))
  ? read("components/layout/app-shell.tsx")
  : "";
const step111 = existsSync(path.join(repoRoot, "database/step111_heu_finance_desk.sql"))
  ? read("database/step111_heu_finance_desk.sql")
  : "";
const step108 = existsSync(
  path.join(repoRoot, "database/step108_ttgdtx_accounting_dashboard_p2_18.sql"),
)
  ? read("database/step108_ttgdtx_accounting_dashboard_p2_18.sql")
  : "";
const spec = existsSync(path.join(repoRoot, "docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md"))
  ? read("docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md")
  : "";
const uatRunbook = existsSync(path.join(repoRoot, "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md"))
  ? read("docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md")
  : "";
const controlledTrialPlan = existsSync(
  path.join(repoRoot, "docs/HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md"),
)
  ? read("docs/HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md")
  : "";
const accountantOperatorGuide = existsSync(
  path.join(repoRoot, "docs/HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md"),
)
  ? read("docs/HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md")
  : "";
const dayOneResultLedgerTemplate = existsSync(
  path.join(repoRoot, "docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md"),
)
  ? read("docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md")
  : "";
const sqlObjectMap = existsSync(path.join(repoRoot, "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md"))
  ? read("docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md")
  : "";
const backlog = existsSync(path.join(repoRoot, "docs/HEU_SYSTEM_BUILD_BACKLOG.md"))
  ? read("docs/HEU_SYSTEM_BUILD_BACKLOG.md")
  : "";
const checklist = existsSync(
  path.join(repoRoot, "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md"),
)
  ? read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md")
  : "";
const inventory = existsSync(path.join(repoRoot, "docs/HEU_CURRENT_STATE_INVENTORY.md"))
  ? read("docs/HEU_CURRENT_STATE_INVENTORY.md")
  : "";
const agents = existsSync(path.join(repoRoot, "AGENTS.md")) ? read("AGENTS.md") : "";
const packageJson = existsSync(path.join(repoRoot, "package.json"))
  ? JSON.parse(read("package.json"))
  : {};
const releaseGateAudit = existsSync(
  path.join(repoRoot, "scripts/audit-ttgdtx-release-gates.mjs"),
)
  ? read("scripts/audit-ttgdtx-release-gates.mjs")
  : "";

if (!packageJson.scripts?.["audit:heu-finance-desk"]) {
  fail("package.json: missing audit:heu-finance-desk script");
}

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:heu-finance-desk/i,
  "final handoff Finance Desk audit command",
  "AGENTS.md",
);

requireText(
  releaseGateAudit,
  /scripts\/audit-heu-finance-desk\.mjs[\s\S]*audit:heu-finance-desk/i,
  "release-gate coverage for Finance Desk audit",
  "scripts/audit-ttgdtx-release-gates.mjs",
);

requireText(
  appShell,
  /label:\s*"Finance Desk"[\s\S]*href:\s*"\/finance-desk"[\s\S]*permission:\s*"finance_desk\.read"/i,
  "Finance Desk navigation entry with permission",
  "components/layout/app-shell.tsx",
);

requireText(
  page,
  /export default async function FinanceDeskPage\(\)[\s\S]*redirect\("\/login"\)/i,
  "authenticated Finance Desk server page",
  "app/finance-desk/page.tsx",
);

requireText(
  page,
  /import \{ formatVndAmount \} from "@\/lib\/vnd-money"[\s\S]*function money\([\s\S]*return formatVndAmount\(value\)/i,
  "shared VND money formatter",
  "app/finance-desk/page.tsx",
);

if (/new Intl\.NumberFormat\("vi-VN"[\s\S]*replace\(\s*\/\\\.\/g/.test(page)) {
  fail("app/finance-desk/page.tsx: must not hand-roll VND separator replacement");
}

if (/1\.000\.000 d|`\$\{[^`]+}\s*d`|"\s*d"/i.test(page)) {
  fail("app/finance-desk/page.tsx: must not display VND with ASCII d suffix");
}

requireText(
  page,
  /supabase\.rpc\("current_user_role_code"\)[\s\S]*permission_name:\s*"finance_desk\.read"[\s\S]*permission_name:\s*"ttgdtx\.report\.read"[\s\S]*permission_name:\s*"ttgdtx\.import\.read"[\s\S]*permission_name:\s*"ttgdtx\.source\.read"[\s\S]*permission_name:\s*"ttgdtx\.payment_request\.manage"/i,
  "permission probes",
  "app/finance-desk/page.tsx",
);

requireText(
  page,
  /function canOpenFinanceDesk\([\s\S]*roleCode === "ADMIN" \|\| roleCode === "BGH"[\s\S]*hasPermission[\s\S]*scopes\.some\(\(scope\) => scope\.segment_id === segmentId\)/i,
  "role, permission and workspace-scope gate",
  "app/finance-desk/page.tsx",
);

const canOpenIndex = page.indexOf("if (canOpen)");
const firstFinanceQueryIndex = page.indexOf('.from("ttgdtx_accounting_dashboard_summary")');
if (canOpenIndex === -1 || firstFinanceQueryIndex === -1) {
  fail("app/finance-desk/page.tsx: missing canOpen gate or finance query block");
} else if (firstFinanceQueryIndex < canOpenIndex) {
  fail("app/finance-desk/page.tsx: finance queries must run only after canOpen");
}

for (const source of [
  '.from("ttgdtx_accounting_dashboard_summary")',
  '.from("ttgdtx_p2_11_summary")',
  '.from("ttgdtx_tuition_import_batch_readiness")',
  '.from("ttgdtx_accounting_dashboard_control_board")',
]) {
  if (!page.includes(source)) {
    fail(`app/finance-desk/page.tsx: missing read source ${source}`);
  }
}

for (const forbidden of [
  ".insert(",
  ".update(",
  ".upsert(",
  ".delete(",
  "createServerAction",
  "use server",
  "dangerouslySetInnerHTML",
]) {
  if (page.includes(forbidden)) {
    fail(`app/finance-desk/page.tsx: forbidden write or unsafe pattern ${forbidden}`);
  }
}

if (page.includes("dataError.message")) {
  fail("app/finance-desk/page.tsx: must not render raw database errors");
}

requireText(
  page,
  /function safeHref\([\s\S]*!value\.startsWith\("\/"\)[\s\S]*value\.startsWith\("\/\/"\)[\s\S]*return "\/finance-desk"/i,
  "safe internal action href guard",
  "app/finance-desk/page.tsx",
);

requireText(
  page,
  /function FinanceDeskActions[\s\S]*data-finance-desk-action-scope-guard="P5-03-P6-04"[\s\S]*<Link href="\/finance-desk">[\s\S]*canOpen \?[\s\S]*<Link href="\/ttgdtx\/import">[\s\S]*<Link href="\/ttgdtx\/source-control">[\s\S]*<Link href="\/ttgdtx\/accounting-dashboard">[\s\S]*: null/i,
  "Finance Desk scoped action guard",
  "app/finance-desk/page.tsx",
);

requireText(
  officialOperationGate,
  /(?=[\s\S]*data-finance-official-operation-gate="P6-04_P2-18_P5-03_P0-03_P0-09")(?=[\s\S]*Finance official operation gate: NO-GO until signed)(?=[\s\S]*OFFICIAL_OPERATION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*FIN-OFFICIAL-01[\s\S]*P6-04 signed role\/workspace UAT)(?=[\s\S]*FIN-OFFICIAL-02[\s\S]*P2-18 signed accounting-dashboard UAT)(?=[\s\S]*FIN-OFFICIAL-03[\s\S]*P5-03 signed Finance Desk UAT)(?=[\s\S]*FIN-OFFICIAL-04[\s\S]*P0-03 backup\/restore proof accepted)(?=[\s\S]*FIN-OFFICIAL-05[\s\S]*P0-09 owner GO\/NO-GO signed)(?=[\s\S]*No statutory accounting, voucher posting, finance approval, bank\s+transfer instruction, production dashboard reliance, UAT acceptance\s+or production GO is approved here)(?=[\s\S]*No GO button is provided)/i,
  "Finance official operation gate",
  "components/finance/finance-official-operation-gate.tsx",
);

requireText(
  officialOperationGate,
  /(?=[\s\S]*data-finance-safe-pilot-order="P6-04_P2-18_P5-03")(?=[\s\S]*Finance safe pilot order: read-only before any expansion)(?=[\s\S]*FIN_PILOT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*FIN-PILOT-01[\s\S]*Secure account creation outside Codex\/chat)(?=[\s\S]*FIN-PILOT-02[\s\S]*Narrow TTGDTX profile and workspace scope)(?=[\s\S]*FIN-PILOT-03[\s\S]*P6-04 pre-login and negative-account matrix)(?=[\s\S]*FIN-PILOT-04[\s\S]*P2-18 and P5-03 read-only trial only)(?=[\s\S]*FIN-PILOT-05[\s\S]*Result ledger and access closure before expansion)(?=[\s\S]*BLOCKED or EMPTY_SCOPED_STATE proof)(?=[\s\S]*ACCESS_RETAIN or REVOKE_OR_REDUCE)(?=[\s\S]*does not create accounts, send invites, store\s+passwords, grant access, execute UAT, accept evidence, approve\s+finance reliance, approve access closure, move money, issue bank\s+instructions or mark production GO)/i,
  "Finance safe pilot order",
  "components/finance/finance-official-operation-gate.tsx",
);

requireText(
  accountantHandoff,
  /(?=[\s\S]*data-finance-day-one-accountant-handoff="P5-03_FIN_DAY1_OPERATOR")(?=[\s\S]*Finance Day-1 accountant handoff: read-only pilot)(?=[\s\S]*FIN_ACCOUNTANT_HANDOFF_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*FIN-ACCT-HANDOFF-01[\s\S]*Allowed read-only review)(?=[\s\S]*FIN-ACCT-HANDOFF-02[\s\S]*Blocked finance actions)(?=[\s\S]*FIN-ACCT-HANDOFF-03[\s\S]*Escalation route)(?=[\s\S]*FIN-ACCT-HANDOFF-04[\s\S]*Day-1 evidence closure)(?=[\s\S]*KHTC accountant may view \/finance-desk)(?=[\s\S]*Data variance goes to KHTC owner)(?=[\s\S]*route\/scope issue goes to IT_DATA)(?=[\s\S]*legal\/source exception goes to PHAP_CHE)(?=[\s\S]*access leak goes to Audit)(?=[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED)(?=[\s\S]*does not create accounts, send invites, store passwords,\s+grant access, execute UAT, accept evidence, approve finance\s+reliance, approve access closure, post vouchers, move money, issue\s+bank instructions or mark production GO)/i,
  "Finance Day-1 accountant handoff",
  "components/finance/finance-day-one-accountant-handoff.tsx",
);

requireAllText(
  accountantHandoff,
  [
    'data-finance-day-one-preflight-summary="P5-03_FIN_DAY1_PREFLIGHT"',
    "Finance Day-1 controlled trial preflight",
    "FIN_DAY1_PREFLIGHT_READY / NO_GO / BLOCKED",
    "FIN-DAY1-PREFLIGHT-01",
    "FIN-DAY1-PREFLIGHT-05",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN_ACTIVATION_READY / NO_GO / BLOCKED",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED",
    "it does not",
    "grant access, execute UAT, accept evidence, approve finance",
    "reliance or mark production GO",
    "HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
    "Operator guide:",
    "start conditions",
    "read-only steps",
    "escalation owners",
    "forbidden content",
    "Day-1 closure before expanding beyond the first accountant",
  ],
  "Finance Day-1 accountant handoff guide link",
  "components/finance/finance-day-one-accountant-handoff.tsx",
);

requireAllText(
  accountantOperatorGuide,
  [
    "Status: PASS_LOCAL_OPERATOR_GUIDE",
    "P5-03 Finance Desk and P2-18 accounting dashboard",
    "Production status: NO-GO",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN-ACCT-GUIDE-01",
    "FIN-ACCT-GUIDE-05",
    "controlled evidence location outside Git/Codex/chat",
    "/finance-desk",
    "/ttgdtx/accounting-dashboard",
    "/ttgdtx/import",
    "/ttgdtx/source-control",
    "read-only operating guide",
    "Daily Operator Flow",
    "Escalation Rules",
    "Forbidden Content",
    "Passwords, temporary passwords, OTPs",
    "Service-role keys",
    "Raw PII, CCCD, bank data, vouchers or screenshots with secrets",
    "ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED",
    "do not rely on dashboard totals for production finance",
    "do not mark owner GO",
  ],
  "Finance Day-1 accountant operator guide",
  "docs/HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
);

requireText(
  page,
  /import \{ FinanceDayOneAccountantHandoff \}[\s\S]*import \{ FinanceOfficialOperationGate \}[\s\S]*<FinanceDeskReadOnlyBoundary \/>[\s\S]*<FinanceOfficialOperationGate \/>[\s\S]*<FinanceDayOneAccountantHandoff \/>[\s\S]*<FinanceDeskRelianceDecisionManifest \/>[\s\S]*<FinanceDeskUatEvidenceChecklist \/>/i,
  "Finance official operation gate mounted before reliance and UAT checklist",
  "app/finance-desk/page.tsx",
);

requireText(
  page,
  /(?=[\s\S]*type FinanceDeskAccessGateItem)(?=[\s\S]*function FinanceDeskAccessDenialChecklist)(?=[\s\S]*data-finance-desk-access-denial-checklist="P5-03-P6-04")(?=[\s\S]*P6-04 Finance Desk access-denial checklist: PASS_LOCAL only)(?=[\s\S]*No Finance Desk totals, evidence links or workflow action links are\s+rendered while any required gate is BLOCKED)(?=[\s\S]*const accessGateItems[\s\S]*P6-04-FD-ACCESS-01[\s\S]*P6-04-FD-ACCESS-02[\s\S]*P6-04-FD-ACCESS-03[\s\S]*P6-04-FD-ACCESS-04)(?=[\s\S]*!canOpen[\s\S]*<FinanceDeskAccessDenialChecklist items=\{accessGateItems\} \/>)/i,
  "Finance Desk P6-04 access-denial checklist",
  "app/finance-desk/page.tsx",
);

requireText(
  page,
  /function FinanceDeskReadOnlyBoundary\(\)[\s\S]*data-finance-desk-readonly-boundary="P5-03"[\s\S]*Mọi sửa số liệu tiền phải quay về đúng bước gốc P2[\s\S]*dashboard không tự phê duyệt[\s\S]*không thay thế chứng từ[\s\S]*không khởi tạo lệnh chuyển tiền[\s\S]*Production remains NO-GO until\s+backup\/restore evidence, signed UAT, migration approval and owner\s+Go\/No-Go exist outside Codex\/chat/i,
  "read-only finance operating boundary",
  "app/finance-desk/page.tsx",
);

requireText(
  page,
  /(?=[\s\S]*const financeDeskRelianceItems[\s\S]*P5-03-REL-01[\s\S]*Authorized scoped access accepted[\s\S]*P5-03-REL-02[\s\S]*Read-only surface accepted[\s\S]*P5-03-REL-03[\s\S]*Source reconciliation accepted[\s\S]*P5-03-REL-04[\s\S]*Evidence hygiene accepted[\s\S]*P5-03-REL-05[\s\S]*Finance reliance boundary accepted[\s\S]*P5-03-REL-06[\s\S]*Human reliance decision recorded)(?=[\s\S]*function FinanceDeskRelianceDecisionManifest\(\)[\s\S]*data-finance-desk-reliance-decision-manifest="P5-03"[\s\S]*P5-03 Finance Desk reliance decision manifest: PASS_LOCAL only[\s\S]*P5_03_RELIANCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not approve\s+finance action, statutory accounting, voucher posting, bank\s+transfer, UAT acceptance, dashboard production reliance, owner\s+waiver or production GO)/i,
  "Finance Desk reliance decision manifest",
  "app/finance-desk/page.tsx",
);

requireText(
  uatChecklist,
  /(?=[\s\S]*data-finance-desk-uat-evidence-checklist="P5-03")(?=[\s\S]*P5-03 Finance Desk UAT evidence checklist: PASS_LOCAL only)(?=[\s\S]*P5-03-UAT-01)(?=[\s\S]*P5-03-UAT-09)(?=[\s\S]*data-finance-desk-acceptance-matrix="P5-03")(?=[\s\S]*P5-03-ACCEPT-01)(?=[\s\S]*P5-03-ACCEPT-06)(?=[\s\S]*Signed browser UAT is still required)(?=[\s\S]*raw source files)(?=[\s\S]*temporary passwords)(?=[\s\S]*password reset links)(?=[\s\S]*account activation\/invite links)(?=[\s\S]*service-role keys stay outside Git\/Codex\/chat)(?=[\s\S]*PASS_LOCAL does not mean Finance Desk UAT passed)/i,
  "Finance Desk UAT evidence checklist component",
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
);

requireText(
  uatChecklist,
  /(?=[\s\S]*data-finance-desk-immediate-stop="P5-03")(?=[\s\S]*P5-03 Finance Desk immediate stop guard: PASS_LOCAL only)(?=[\s\S]*P5-03-STOP-01)(?=[\s\S]*P5-03-STOP-05)(?=[\s\S]*P5_03_STOP_CHECK \/ GO_NEXT \/ BLOCKED)(?=[\s\S]*statutory accounting, voucher posting, finance approval or a bank-transfer instruction)(?=[\s\S]*Signed browser UAT, source reconciliation, workspace-scope denial or the owner reliance decision is missing)(?=[\s\S]*Contract-only or out-of-scope users can see unrestricted Finance Desk totals)(?=[\s\S]*Dashboard\/import\/source-control totals differ without an owner note)(?=[\s\S]*Raw PII, CCCD, bank data, vouchers, payment evidence, passwords, temporary passwords, OTPs, password reset links, account activation\/invite links or service-role keys)/i,
  "Finance Desk immediate stop guard",
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
);

requireText(
  uatChecklist,
  /(?=[\s\S]*data-finance-desk-real-user-evidence-bridge="P5-03-P6-04")(?=[\s\S]*P5-03 real accounting user evidence bridge)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*data-heu-real-accounting-user-uat-queue="P6-04-P2-18-P5-03")(?=[\s\S]*data-heu-real-accounting-user-result-template="P6-04-P2-18-P5-03")(?=[\s\S]*P5_03_REAL_USER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*P5-03-REAL-01)(?=[\s\S]*P5-03-REAL-02)(?=[\s\S]*P5-03-REAL-03)(?=[\s\S]*P5-03-REAL-04)(?=[\s\S]*P5-03-REAL-05)(?=[\s\S]*KHTC accounting operator)(?=[\s\S]*BGH read-only reviewer)(?=[\s\S]*Audit and Phap Che reviewers)(?=[\s\S]*Out-of-scope negative account)(?=[\s\S]*passwords, temporary passwords, OTPs, password\s+reset links, account activation\/invite links, service-role keys, raw\s+PII, CCCD, bank data, vouchers or screenshots with secrets)/i,
  "Finance Desk real accounting user evidence bridge",
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
);

requireAllText(
  uatChecklist,
  [
    "financeDayOneStartGateChecklistPath",
    'data-finance-desk-day-one-start-gate-evidence="P5-03-FIN-START"',
    "Finance Day-1 start-gate evidence before Finance Desk trial",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "P0-03 backup and restore evidence accepted",
    "signed finance UAT route readiness",
    "P0-10 controlled evidence redaction storage ready",
    "P0-14/P0-17 result and access-closure paths ready",
    "human owner boundary accepted",
    "does not create accounts",
    "send invites",
    "store",
    "passwords",
    "grant access",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve access closure",
    "move money",
    "issue bank",
    "instructions",
    "mark production GO",
  ],
  "Finance Desk Day-1 start-gate evidence panel",
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
);

requireAllText(
  uatChecklist,
  [
    'data-finance-desk-controlled-trial-plan="P5-03"',
    "P5-03 Finance Desk controlled trial plan: PASS_LOCAL only",
    "HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md",
    "P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED",
    "FIN_START_READY + FIN_ACTIVATION_READY + P6_04_PRELOGIN_READY",
    "P5-03-TRIAL-01",
    "P5-03-TRIAL-06",
    "P5-03-TRIAL-07",
    "P5-03-TRIAL-08",
    "P5-03-TRIAL-EVID-001",
    "P5-03-TRIAL-EVID-005",
    "ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_BGH_READONLY_01",
    "REAL_AUDIT_READONLY_01",
    "REAL_PHAP_CHE_REVIEW_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "No bulk real-data import",
    "no auto gach no",
    "no COM production",
    "no payment execution",
    "no production GO",
  ],
  "Finance Desk controlled trial UI panel",
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
);

requireText(
  uatChecklist,
  /(?=[\s\S]*data-finance-desk-day-one-result-ledger="P5-03-FIN-DAY1")(?=[\s\S]*Finance Day-1 result ledger:\s*PASS_LOCAL only)(?=[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md)(?=[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED)(?=[\s\S]*FIN-DAY1-EVID-001)(?=[\s\S]*FIN-DAY1-EVID-005)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_BGH_READONLY_01)(?=[\s\S]*REAL_AUDIT_READONLY_01)(?=[\s\S]*REAL_PHAP_CHE_REVIEW_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*BLOCKED or EMPTY_SCOPED_STATE)(?=[\s\S]*does not create accounts)(?=[\s\S]*store credentials)(?=[\s\S]*accept UAT)(?=[\s\S]*approve finance reliance)(?=[\s\S]*approve access closure)(?=[\s\S]*move money)(?=[\s\S]*issue\s+bank instructions)(?=[\s\S]*mark production GO)/i,
  "Finance Desk Day-1 result ledger panel",
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
);

requireText(
  page,
  /import \{ FinanceDeskUatEvidenceChecklist \}[\s\S]*<FinanceDeskReadOnlyBoundary \/>[\s\S]*<FinanceDeskRelianceDecisionManifest \/>[\s\S]*<FinanceDeskUatEvidenceChecklist \/>[\s\S]*!canOpen/i,
  "Finance Desk UAT evidence checklist mount before access states",
  "app/finance-desk/page.tsx",
);

requireText(
  page,
  /<FinanceDeskReadOnlyBoundary \/>[\s\S]*<FinanceDeskRelianceDecisionManifest \/>[\s\S]*!canOpen[\s\S]*dataError[\s\S]*Chưa đọc được đầy đủ Finance Desk[\s\S]*Step90-Step111[\s\S]*đã backup/i,
  "read-only boundary is visible before no-access and missing-view states",
  "app/finance-desk/page.tsx",
);

requireText(
  page,
  /FIN_DESK_VIEW_UNAVAILABLE[\s\S]*raw database\/schema error[\s\S]*server logs/i,
  "controlled Finance Desk missing-view error disclosure",
  "app/finance-desk/page.tsx",
);

requireAllText(
  backlog,
  [
    "P5-03",
    "HEU Finance Desk read-only cockpit",
    "PASS_LOCAL",
    "app/finance-desk/page.tsx",
    "finance-day-one-accountant-handoff.tsx",
    "finance-desk-uat-evidence-checklist.tsx",
    "database/step111_heu_finance_desk.sql",
    "HEU_FINANCE_DESK_MVP_SPEC_20260627.md",
    "HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    "HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "audit:heu-finance-desk",
    "UAT evidence checklist",
    "immediate stop guard",
    "real accounting user evidence bridge",
    "Finance Day-1 start-gate evidence checkpoint",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "Finance Day-1 result ledger",
    "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "P5-03 reliance decision manifest",
    "Finance safe pilot order",
    "FIN_PILOT_READY / NO_GO / BLOCKED",
    "Finance Day-1 accountant handoff",
    "FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN-ACCT-HANDOFF-01",
    "FIN-ACCT-HANDOFF-04",
    "FIN-ACCT-GUIDE-01",
    "FIN-ACCT-GUIDE-05",
    "accountant operator guide",
    "read-only operator steps",
    "forbidden content",
    "blocked finance actions",
    "escalation route",
    "FIN-PILOT-01",
    "FIN-PILOT-05",
    "access closure before expansion",
    "signed finance/dashboard UAT and reliance decision still required",
  ],
  "P5-03 Finance Desk backlog row",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireAllText(
  checklist,
  [
    "HEU Finance Desk read-only cockpit",
    "PASS_LOCAL",
    "app/finance-desk/page.tsx",
    "finance-day-one-accountant-handoff.tsx",
    "finance-desk-uat-evidence-checklist.tsx",
    "database/step111_heu_finance_desk.sql",
    "HEU_FINANCE_DESK_MVP_SPEC_20260627.md",
    "HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    "HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "audit:heu-finance-desk",
    "P5-03 UAT evidence checklist",
    "P5-03 immediate stop guard",
    "real accounting user evidence bridge",
    "Finance Day-1 start-gate evidence checkpoint",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "Finance Day-1 result ledger",
    "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "P5-03 UAT acceptance matrix and P5-03 reliance decision manifest",
    "Finance safe pilot order",
    "FIN_PILOT_READY / NO_GO / BLOCKED",
    "Finance Day-1 accountant handoff",
    "FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN-ACCT-HANDOFF-01",
    "FIN-ACCT-HANDOFF-04",
    "FIN-ACCT-GUIDE-01",
    "FIN-ACCT-GUIDE-05",
    "accountant operator guide",
    "read-only operator steps",
    "forbidden content",
    "blocked finance actions",
    "escalation route",
    "FIN-PILOT-01",
    "FIN-PILOT-05",
    "safe pilot closure",
    "does not approve finance action, statutory accounting, voucher posting, bank transfer, production migration, UAT acceptance, dashboard production reliance or owner GO",
  ],
  "production checklist Finance Desk row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireAllText(
  inventory,
  [
    "npm.cmd run audit:heu-finance-desk",
    "PASS",
    "Finance Desk / KHTC cockpit",
    "read-only cockpit",
    "permission and workspace-scope gate",
    "UAT evidence checklist",
    "immediate stop guard",
    "real accounting user evidence bridge",
    "HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    "Finance Day-1 start-gate evidence checkpoint",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "Finance Day-1 result ledger",
    "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "P5-03 reliance decision manifest",
    "Finance safe pilot order",
    "FIN_PILOT_READY / NO_GO / BLOCKED",
    "Finance Day-1 accountant handoff",
    "FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED",
    "HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN-ACCT-HANDOFF-01",
    "FIN-ACCT-HANDOFF-04",
    "FIN-ACCT-GUIDE-01",
    "FIN-ACCT-GUIDE-05",
    "read-only operator steps",
    "forbidden content",
    "escalation route",
    "FIN-PILOT-01",
    "FIN-PILOT-05",
    "access closure before expansion",
    "Signed browser UAT and reliance decision pending",
  ],
  "current-state Finance Desk evidence",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
);

requireText(
  step111,
  /Step 111 - HEU Finance Desk[\s\S]*Migration candidate only\. Do not run production migration from Codex\/chat[\s\S]*Production requires backup evidence, restore dry-run, migration order\s+approval, signed UAT and business Go\/No-Go sign-off/i,
  "Step111 production boundary",
  "database/step111_heu_finance_desk.sql",
);

requireText(
  step111,
  /finance_desk\.read[\s\S]*finance_desk\.manage[\s\S]*finance_desk\.export[\s\S]*enable row level security[\s\S]*can_read_finance_desk[\s\S]*can_manage_finance_desk[\s\S]*write_audit_log/i,
  "Step111 permission, RLS and audit controls",
  "database/step111_heu_finance_desk.sql",
);

requireText(
  step108,
  /drop view if exists public\.heu_finance_desk_summary;[\s\S]*drop view if exists public\.ttgdtx_accounting_dashboard_summary;/i,
  "Step108 drops dependent Finance Desk summary before dashboard summary rebuild",
  "database/step108_ttgdtx_accounting_dashboard_p2_18.sql",
);

requireText(
  step111,
  /create or replace view public\.heu_finance_desk_summary[\s\S]*coalesce\(dashboard_summary\.receivable_total_vnd,\s*0\)::numeric[\s\S]*from public\.ttgdtx_accounting_dashboard_summary dashboard_summary[\s\S]*cross join lateral/i,
  "Step111 Finance Desk summary explicit dashboard_summary alias",
  "database/step111_heu_finance_desk.sql",
);

if (/\ba\.(receivable_total_vnd|receivable_paid_vnd|receivable_balance_vnd|collected_total_vnd|requested_total_vnd|approved_total_vnd|disbursed_total_vnd)/i.test(step111)) {
  fail("database/step111_heu_finance_desk.sql: Finance Desk summary must not use ambiguous alias a");
}

if (/from\s*\(\s*select\s+\*\s+from\s+public\.ttgdtx_accounting_dashboard_summary[\s\S]*limit\s+1/i.test(step111)) {
  fail("database/step111_heu_finance_desk.sql: Finance Desk summary must read the aggregate dashboard view directly");
}

requireText(
  step111,
  /'HEU_FINANCE_DESK_MVP'[\s\S]*'heu_finance_desk_summary; heu_finance_desk_document_links; heu_finance_desk_code_policy'[\s\S]*'REPORT_VIEW'/i,
  "Step111 Finance Desk master-data map uses REPORT_VIEW classification",
  "database/step111_heu_finance_desk.sql",
);

requireText(
  step111,
  /references public\.admission_segments\(id\) on delete restrict[\s\S]*references public\.ttgdtx_tuition_import_batches\(id\) on delete restrict/i,
  "Step111 restrict references",
  "database/step111_heu_finance_desk.sql",
);

if (/\bdrop\s+table\b|\btruncate\b|\bon\s+delete\s+cascade\b/i.test(step111)) {
  fail("database/step111_heu_finance_desk.sql: must not drop tables, truncate or use on delete cascade");
}

requireText(
  spec,
  /Status:\s*DRAFT_CONTROL[\s\S]*Production status:\s*NO-GO[\s\S]*not statutory accounting software[\s\S]*does not replace MISA, bank\s+transfer approval, tax invoicing, accounting vouchers or human payment\s+approval[\s\S]*Raw evidence links and personal data must stay outside Git\/Codex\/chat/i,
  "Finance Desk spec production boundary",
  "docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md",
);

requireText(
  spec,
  /All finance mutations still happen in the source P2 screens[\s\S]*Finance Desk does not approve payment[\s\S]*Finance Desk does not initiate bank transfers[\s\S]*AI may summarize, validate and warn only/i,
  "Finance Desk spec read-only operating boundary",
  "docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md",
);

requireText(
  uatRunbook,
  /Status:\s*PASS_LOCAL_TEMPLATE[\s\S]*Scope:\s*P5-03 HEU Finance Desk read-only cockpit[\s\S]*Production status:\s*NO-GO[\s\S]*does not approve payment, create\s+accounting vouchers, replace statutory accounting software, initiate bank\s+transfers, accept UAT or mark production GO/i,
  "Finance Desk UAT runbook local-only boundary",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
);

requireAllText(
  controlledTrialPlan,
  [
    "Status: PASS_LOCAL_PLAN",
    "P5-03 Finance Desk controlled trial",
    "Production status: NO-GO",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED",
    "FIN_PILOT_READY / NO_GO / BLOCKED",
    "FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED",
    "HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN-PILOT-01",
    "FIN-PILOT-02",
    "FIN-PILOT-03",
    "FIN-PILOT-04",
    "FIN-PILOT-05",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_BGH_READONLY_01",
    "REAL_AUDIT_READONLY_01",
    "REAL_PHAP_CHE_REVIEW_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "/finance-desk",
    "/ttgdtx/accounting-dashboard",
    "FIN_START_READY",
    "FIN_ACTIVATION_READY",
    "P6_04_PRELOGIN_READY",
    "P5-03-TRIAL-01",
    "P5-03-TRIAL-08",
    "Evidence To Capture",
    "Finance Safe Pilot Order",
    "Finance Day-1 Accountant Handoff",
    "FIN-ACCT-HANDOFF-01",
    "FIN-ACCT-HANDOFF-04",
    "FIN-ACCT-GUIDE-01",
    "FIN-ACCT-GUIDE-05",
    "first KHTC accountant start conditions",
    "forbidden content",
    "Data variance goes to KHTC owner",
    "route/scope issue goes to IT_DATA",
    "legal/source exception goes to PHAP_CHE",
    "access leak goes to Audit",
    "issue bank instructions",
    "access closure",
    "No bulk real-data import",
    "No auto gach no",
    "no COM production calculation",
    "no payment execution",
    "outside Git/Codex/chat",
    "Production remains NO-GO",
  ],
  "Finance Desk controlled trial plan",
  "docs/HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md",
);

requireText(
  dayOneResultLedgerTemplate,
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TEMPLATE)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*FIN-DAY1-EVID-001)(?=[\s\S]*FIN-DAY1-EVID-005)(?=[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\s\S]*REAL_BGH_READONLY_01)(?=[\s\S]*REAL_AUDIT_READONLY_01)(?=[\s\S]*REAL_PHAP_CHE_REVIEW_01)(?=[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\s\S]*FIN_DAY1_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED)(?=[\s\S]*does not create accounts)(?=[\s\S]*issue bank instructions)(?=[\s\S]*mark production GO)(?=[\s\S]*No raw screenshots)(?=[\s\S]*Stop and Escalate)/i,
  "Finance Day-1 result ledger template",
  "docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
);

requireAllText(
  uatRunbook,
  [
    'data-finance-desk-day-one-start-gate-evidence="P5-03-FIN-START"',
    "`FIN-START-EVID-001` through `FIN-START-EVID-005`",
    "FIN_START_READY / NO_GO / BLOCKED",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md",
    "HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
    "redacted account label",
    "route visibility",
    "read-only evidence",
    "FIN_START_READY",
    "FIN_ACTIVATION_READY",
    "P6_04_PRELOGIN_READY",
    "P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED",
    'data-finance-safe-pilot-order="P6-04_P2-18_P5-03"',
    "FIN_PILOT_READY / NO_GO / BLOCKED",
    'data-finance-day-one-accountant-handoff="P5-03_FIN_DAY1_OPERATOR"',
    "FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN-ACCT-HANDOFF-01",
    "FIN-ACCT-HANDOFF-04",
    "read-only operator steps",
    "forbidden content",
    "allowed read-only review",
    "blocked finance actions",
    "escalation route",
    "FIN-PILOT-01",
    "FIN-PILOT-05",
    "secure account creation outside Codex/chat",
    "issue bank instructions",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "bulk real-data import",
    "COM production",
    "payment execution",
    "production GO",
  ],
  "Finance Desk controlled trial plan runbook handoff",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
);

requireText(
  uatRunbook,
  /finance-desk-uat-evidence-checklist\.tsx[\s\S]*data-finance-desk-uat-evidence-checklist="P5-03"[\s\S]*P5-03-UAT-01 through\s+P5-03-UAT-09[\s\S]*data-finance-desk-acceptance-matrix="P5-03"[\s\S]*P5-03-ACCEPT-01 through P5-03-ACCEPT-06[\s\S]*data-finance-desk-immediate-stop="P5-03"[\s\S]*P5-03-STOP-01 through\s+P5-03-STOP-05[\s\S]*P5_03_STOP_CHECK \/ GO_NEXT \/ BLOCKED[\s\S]*data-finance-desk-real-user-evidence-bridge="P5-03-P6-04"[\s\S]*P5-03-REAL-01 through P5-03-REAL-05[\s\S]*P5_03_REAL_USER_READY \/ NO_GO \/ BLOCKED/i,
  "Finance Desk UAT checklist component reference",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
);

requireText(
  uatRunbook,
  /(?=[\s\S]*UAT_KHTC_TTGDTX_OPERATOR)(?=[\s\S]*UAT_BGH)(?=[\s\S]*UAT_AUDIT)(?=[\s\S]*UAT_CONTRACT_ONLY)(?=[\s\S]*UAT_OUT_OF_SCOPE_STAFF)(?=[\s\S]*contract read alone is insufficient)/i,
  "Finance Desk UAT role coverage",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
);

requireText(
  uatRunbook,
  /P5-03-UAT-01[\s\S]*P5-03-UAT-09[\s\S]*ttgdtx_accounting_dashboard_summary[\s\S]*ttgdtx_accounting_dashboard_control_board[\s\S]*ttgdtx_tuition_import_batch_readiness[\s\S]*ttgdtx_p2_11_summary/i,
  "Finance Desk UAT browser and source matrix",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
);

requireText(
  uatRunbook,
  /(?=[\s\S]*P5-03-ACCEPT-01)(?=[\s\S]*P5-03-ACCEPT-06)(?=[\s\S]*No direct create\/update\/approve\/pay\/import-write form exists inside `\/finance-desk`)(?=[\s\S]*VND values use the shared `lib\/vnd-money\.ts` display)(?=[\s\S]*Anyone treats PASS_LOCAL as production approval)/i,
  "Finance Desk UAT acceptance matrix",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
);

requireText(
  uatRunbook,
  /(?=[\s\S]*Real Accounting User Evidence Bridge)(?=[\s\S]*data-heu-real-accounting-user-uat-queue="P6-04-P2-18-P5-03")(?=[\s\S]*data-heu-real-accounting-user-result-template="P6-04-P2-18-P5-03")(?=[\s\S]*P5-03-REAL-01)(?=[\s\S]*P5-03-REAL-05)(?=[\s\S]*Do not paste real passwords, temporary passwords, OTPs, password reset links,\s+account activation\/invite links, service-role keys, raw PII, CCCD, bank data,\s+vouchers or screenshots with secrets into Finance Desk evidence)/i,
  "Finance Desk real accounting user evidence bridge runbook",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
);

requireText(
  uatRunbook,
  /(?=[\s\S]*Finance Desk Reliance Decision Manifest)(?=[\s\S]*Immediate stop guard)(?=[\s\S]*statutory accounting, voucher posting, finance approval or bank\s+transfer instruction)(?=[\s\S]*signed browser UAT, source reconciliation,\s+workspace-scope denial or owner reliance decision is missing)(?=[\s\S]*P5_03_RELIANCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does\s+not approve finance action, statutory accounting, voucher posting, bank\s+transfer, UAT acceptance, dashboard production reliance, owner waiver or\s+production GO)(?=[\s\S]*P5-03-REL-01[\s\S]*Authorized scoped access accepted[\s\S]*P5-03-REL-06[\s\S]*Human reliance decision recorded)(?=[\s\S]*P5-03-ACCEPT-01 through P5-03-ACCEPT-06 and P5-03-REL-01 through\s+P5-03-REL-06)/i,
  "Finance Desk reliance decision runbook",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
);

requireText(
  backlog,
  /P5-03[\s\S]*HEU Finance Desk read-only cockpit[\s\S]*HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630\.md[\s\S]*controlled trial plan[\s\S]*real-accounting user labels[\s\S]*route visibility[\s\S]*read-only evidence/i,
  "Finance Desk controlled trial backlog reference",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireText(
  checklist,
  /HEU Finance Desk read-only cockpit[\s\S]*HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630\.md[\s\S]*controlled trial plan[\s\S]*real-accounting user labels[\s\S]*route visibility[\s\S]*read-only evidence[\s\S]*does not approve finance action/i,
  "Finance Desk controlled trial production checklist reference",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  inventory,
  /Finance Desk \/ KHTC cockpit[\s\S]*HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630\.md[\s\S]*controlled real-accounting user labels[\s\S]*route visibility[\s\S]*read-only evidence[\s\S]*Signed browser UAT and reliance decision pending/i,
  "Finance Desk controlled trial current-state reference",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
);

requireAllText(
  read("docs/HEU_IMPLEMENTATION_LOG.md"),
  [
    "## 2026-06-30 - Finance Desk Day-1 Start Gate Evidence Checkpoint",
    'data-finance-desk-day-one-start-gate-evidence="P5-03-FIN-START"',
    "components/finance/finance-desk-uat-evidence-checklist.tsx",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "FIN_ACTIVATION_READY",
    "P6_04_PRELOGIN_READY",
    "HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md",
    "HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    "HEU_SYSTEM_BUILD_BACKLOG.md",
    "TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
    "HEU_CURRENT_STATE_INVENTORY.md",
    "audit-heu-finance-desk.mjs",
    "audit-ttgdtx-release-gates.mjs",
    "audit-heu-implementation-log.mjs",
    "does not create accounts",
    "send invites",
    "store passwords",
    "grant access",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve access closure",
    "move money",
    "issue bank instructions",
    "mark production GO",
  ],
  "Finance Desk Day-1 start-gate evidence checkpoint implementation log",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  read("docs/HEU_IMPLEMENTATION_LOG.md"),
  /## 2026-06-30 - Finance Desk Controlled Trial Plan[\s\S]*HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630\.md[\s\S]*REAL_KHTC_TTGDTX_OPERATOR_01[\s\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01[\s\S]*audit-heu-finance-desk\.mjs[\s\S]*P5_03_CONTROLLED_TRIAL_READY \/ NO_GO \/[\s\S]*BLOCKED[\s\S]*P5-03-TRIAL-01 through P5-03-TRIAL-08[\s\S]*no bulk real-data import[\s\S]*no auto gach no[\s\S]*no COM production calculation[\s\S]*no payment execution[\s\S]*does not create accounts[\s\S]*mark production GO/i,
  "Finance Desk controlled trial implementation log",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  read("docs/HEU_IMPLEMENTATION_LOG.md"),
  /## 2026-06-30 - Finance Desk Controlled Trial Evidence Surface[\s\S]*components\/finance\/finance-desk-uat-evidence-checklist\.tsx[\s\S]*P5-03-TRIAL-01 through P5-03-TRIAL-08[\s\S]*P5-03-TRIAL-EVID-001[\s\S]*P5-03-TRIAL-EVID-005[\s\S]*ACCESS_RETAIN \/ REVOKE_OR_REDUCE \/ BLOCKED[\s\S]*audit-heu-finance-desk\.mjs[\s\S]*PASS_LOCAL\/read-only[\s\S]*does not create accounts[\s\S]*store passwords[\s\S]*execute UAT[\s\S]*approve finance[\s\S]*mark production GO/i,
  "Finance Desk controlled trial evidence surface implementation log",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireAllText(
  read("docs/HEU_IMPLEMENTATION_LOG.md"),
  [
    "## 2026-07-02 - Finance Desk Safe Pilot Order Documentation",
    "finance-official-operation-gate.tsx",
    "HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    "HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md",
    "FIN-PILOT-01",
    "FIN-PILOT-05",
    "FIN_PILOT_READY / NO_GO / BLOCKED",
    "HEU_SYSTEM_BUILD_BACKLOG.md",
    "TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
    "HEU_CURRENT_STATE_INVENTORY.md",
    "HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
    "secure account creation outside Codex/chat",
    "narrow TTGDTX scope",
    "P6-04 negative-account proof",
    "P2-18/P5-03 read-only",
    "result ledger and access closure before expansion",
    "does not create accounts",
    "send invites",
    "store passwords",
    "grant access",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve access closure",
    "move money",
    "issue bank instructions",
    "mark production GO",
  ],
  "Finance Desk safe pilot order documentation implementation log",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireAllText(
  read("docs/HEU_IMPLEMENTATION_LOG.md"),
  [
    "## 2026-07-02 - Finance Day-1 Accountant Operator Guide",
    "HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
    "PASS_LOCAL_OPERATOR_GUIDE",
    "P5-03 Finance Desk and P2-18 accounting dashboard",
    "finance-day-one-accountant-handoff.tsx",
    "/finance-desk",
    "HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    "HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md",
    "HEU_SYSTEM_BUILD_BACKLOG.md",
    "TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
    "HEU_CURRENT_STATE_INVENTORY.md",
    "HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN-ACCT-GUIDE-01",
    "FIN-ACCT-GUIDE-05",
    "read-only operator steps",
    "escalation rules",
    "forbidden content",
    "Day-1 closure before expansion",
    "does not create accounts",
    "send invites",
    "store passwords",
    "grant access",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve access closure",
    "post vouchers",
    "move money",
    "issue bank instructions",
    "approve owner GO/NO-GO",
    "mark production GO",
  ],
  "Finance Day-1 accountant operator guide implementation log",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireAllText(
  read("docs/HEU_IMPLEMENTATION_LOG.md"),
  [
    "## 2026-07-02 - Finance Desk Day-1 Accountant Handoff",
    "finance-day-one-accountant-handoff.tsx",
    "/finance-desk",
    "official-operation gate",
    "before reliance",
    'data-finance-day-one-accountant-handoff="P5-03_FIN_DAY1_OPERATOR"',
    "FIN-ACCT-HANDOFF-01",
    "FIN-ACCT-HANDOFF-04",
    "FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED",
    "allowed read-only review",
    "blocked finance actions",
    "escalation",
    "Day-1 evidence closure before expansion",
    "HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    "HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md",
    "HEU_SYSTEM_BUILD_BACKLOG.md",
    "TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
    "HEU_CURRENT_STATE_INVENTORY.md",
    "HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
    "does not create accounts",
    "send invites",
    "store passwords",
    "grant access",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve access closure",
    "post vouchers",
    "move money",
    "issue bank instructions",
    "approve owner GO/NO-GO",
    "mark production GO",
  ],
  "Finance Desk Day-1 accountant handoff implementation log",
  "docs/HEU_IMPLEMENTATION_LOG.md",
);

requireText(
  uatRunbook,
  /Do not paste passwords, temporary\s+passwords, OTPs, password reset links, account activation\/invite links,\s+service-role keys, API keys, bank credentials, raw CCCD, raw phone numbers, raw\s+student PII, raw bank account numbers, bank statements, vouchers or raw payment\s+evidence into Git, Codex\/chat or this runbook/i,
  "Finance Desk UAT no-secret boundary",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
);

requireText(
  sqlObjectMap,
  /FINANCE_DESK_WORKBENCH[\s\S]*heu_finance_desk_code_policy[\s\S]*heu_finance_desk_document_links[\s\S]*heu_finance_desk_summary[\s\S]*Step111 is metadata\/control plus report-view packaging only[\s\S]*raw links\/evidence stay outside Git/i,
  "SQL object map Finance Desk workbench row",
  "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md",
);

if (failures.length > 0) {
  console.error("HEU Finance Desk audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("HEU Finance Desk audit passed. Route is read-only, scoped and VND-normalized.");
