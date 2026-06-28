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
  "app/finance-desk/page.tsx",
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
  "database/step111_heu_finance_desk.sql",
  "docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
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
const spec = existsSync(path.join(repoRoot, "docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md"))
  ? read("docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md")
  : "";
const uatRunbook = existsSync(path.join(repoRoot, "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md"))
  ? read("docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md")
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

requireText(
  page,
  /function safeHref\([\s\S]*!value\.startsWith\("\/"\)[\s\S]*value\.startsWith\("\/\/"\)[\s\S]*return "\/finance-desk"/i,
  "safe internal action href guard",
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
  /(?=[\s\S]*data-finance-desk-uat-evidence-checklist="P5-03")(?=[\s\S]*P5-03 Finance Desk UAT evidence checklist: PASS_LOCAL only)(?=[\s\S]*P5-03-UAT-01)(?=[\s\S]*P5-03-UAT-09)(?=[\s\S]*data-finance-desk-acceptance-matrix="P5-03")(?=[\s\S]*P5-03-ACCEPT-01)(?=[\s\S]*P5-03-ACCEPT-06)(?=[\s\S]*Signed browser UAT is still required)(?=[\s\S]*raw source files)(?=[\s\S]*service-role keys stay\s+outside Git\/Codex\/chat)(?=[\s\S]*PASS_LOCAL does not mean Finance Desk UAT passed)/i,
  "Finance Desk UAT evidence checklist component",
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
);

requireText(
  uatChecklist,
  /(?=[\s\S]*data-finance-desk-immediate-stop="P5-03")(?=[\s\S]*P5-03 Finance Desk immediate stop guard: PASS_LOCAL only)(?=[\s\S]*P5-03-STOP-01)(?=[\s\S]*P5-03-STOP-05)(?=[\s\S]*P5_03_STOP_CHECK \/ GO_NEXT \/ BLOCKED)(?=[\s\S]*statutory accounting, voucher posting, finance approval or a bank-transfer instruction)(?=[\s\S]*Signed browser UAT, source reconciliation, workspace-scope denial or the owner reliance decision is missing)(?=[\s\S]*Contract-only or out-of-scope users can see unrestricted Finance Desk totals)(?=[\s\S]*Dashboard\/import\/source-control totals differ without an owner note)(?=[\s\S]*Raw PII, CCCD, bank data, vouchers, payment evidence, passwords, OTPs or service-role keys)/i,
  "Finance Desk immediate stop guard",
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
  backlog,
  /P5-03[\s\S]*HEU Finance Desk read-only cockpit[\s\S]*PASS_LOCAL[\s\S]*app\/finance-desk\/page\.tsx[\s\S]*finance-desk-uat-evidence-checklist\.tsx[\s\S]*database\/step111_heu_finance_desk\.sql[\s\S]*HEU_FINANCE_DESK_MVP_SPEC_20260627\.md[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*audit:heu-finance-desk[\s\S]*UAT evidence checklist[\s\S]*immediate stop guard[\s\S]*P5-03 reliance decision manifest[\s\S]*signed finance\/dashboard UAT and reliance decision still required/i,
  "P5-03 Finance Desk backlog row",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireText(
  checklist,
  /HEU Finance Desk read-only cockpit[\s\S]*PASS_LOCAL[\s\S]*app\/finance-desk\/page\.tsx[\s\S]*finance-desk-uat-evidence-checklist\.tsx[\s\S]*database\/step111_heu_finance_desk\.sql[\s\S]*HEU_FINANCE_DESK_MVP_SPEC_20260627\.md[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*audit:heu-finance-desk[\s\S]*P5-03 UAT evidence checklist[\s\S]*P5-03 immediate stop guard[\s\S]*P5-03 UAT acceptance matrix and P5-03 reliance decision manifest[\s\S]*does not approve finance action, statutory accounting, voucher posting, bank transfer, production migration, UAT acceptance, dashboard production reliance or owner GO/i,
  "production checklist Finance Desk row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

requireText(
  inventory,
  /npm\.cmd run audit:heu-finance-desk[\s\S]*PASS[\s\S]*Finance Desk \/ KHTC cockpit[\s\S]*read-only cockpit[\s\S]*permission and workspace-scope gate[\s\S]*UAT evidence checklist[\s\S]*immediate stop guard[\s\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\.md[\s\S]*P5-03 reliance decision manifest[\s\S]*Signed browser UAT and reliance decision pending/i,
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

requireText(
  uatRunbook,
  /finance-desk-uat-evidence-checklist\.tsx[\s\S]*data-finance-desk-uat-evidence-checklist="P5-03"[\s\S]*P5-03-UAT-01 through\s+P5-03-UAT-09[\s\S]*data-finance-desk-acceptance-matrix="P5-03"[\s\S]*P5-03-ACCEPT-01 through P5-03-ACCEPT-06[\s\S]*data-finance-desk-immediate-stop="P5-03"[\s\S]*P5-03-STOP-01 through\s+P5-03-STOP-05[\s\S]*P5_03_STOP_CHECK \/ GO_NEXT \/ BLOCKED/i,
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
  /(?=[\s\S]*Finance Desk Reliance Decision Manifest)(?=[\s\S]*Immediate stop guard)(?=[\s\S]*statutory accounting, voucher posting, finance approval or bank\s+transfer instruction)(?=[\s\S]*signed browser UAT, source reconciliation,\s+workspace-scope denial or owner reliance decision is missing)(?=[\s\S]*P5_03_RELIANCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does\s+not approve finance action, statutory accounting, voucher posting, bank\s+transfer, UAT acceptance, dashboard production reliance, owner waiver or\s+production GO)(?=[\s\S]*P5-03-REL-01[\s\S]*Authorized scoped access accepted[\s\S]*P5-03-REL-06[\s\S]*Human reliance decision recorded)(?=[\s\S]*P5-03-ACCEPT-01 through P5-03-ACCEPT-06 and P5-03-REL-01 through\s+P5-03-REL-06)/i,
  "Finance Desk reliance decision runbook",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
);

requireText(
  uatRunbook,
  /Do not paste passwords, OTPs,\s+reset links, service-role keys, API keys, bank credentials, raw CCCD, raw phone\s+numbers, raw student PII, raw bank account numbers, bank statements, vouchers\s+or raw payment evidence into Git, Codex\/chat or this runbook/i,
  "Finance Desk UAT no-secret boundary",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
);

requireText(
  sqlObjectMap,
  /FINANCE_DESK_WORKBENCH[\s\S]*heu_finance_desk_code_policy[\s\S]*heu_finance_desk_document_links[\s\S]*heu_finance_desk_summary[\s\S]*Step111 is metadata\/control only[\s\S]*raw links\/evidence stay outside Git/i,
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
