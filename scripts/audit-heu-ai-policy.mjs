import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function requireText(relativePath, pattern, label) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
    return "";
  }

  const contents = read(relativePath);
  if (!pattern.test(contents)) {
    fail(`${relativePath}: missing ${label}`);
  }
  return contents;
}

function listFiles(relativeDir, output = []) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  if (!existsSync(absoluteDir)) {
    return output;
  }

  for (const entry of readdirSync(absoluteDir)) {
    const absolutePath = path.join(absoluteDir, entry);
    const relativePath = path
      .relative(repoRoot, absolutePath)
      .replaceAll(path.sep, "/");
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      listFiles(relativePath, output);
    } else {
      output.push(relativePath);
    }
  }

  return output;
}

const policy = requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  /AI output alone is not approval evidence/i,
  "AI output is not approval evidence rule",
);
const promptOutputDesign = requireText(
  "docs/HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628.md",
  /P7-04 is PASS_LOCAL_DESIGN only[\s\S]*does not implement\s+AI logging, enable AI service calls, enable autonomous AI, approve UAT, approve\s+finance, accept evidence, approve owner GO or mark production GO/i,
  "P7-04 prompt/output audit logging design boundary",
);
const deliveryTeamRegister = requireText(
  "docs/HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702.md",
  /Status:\s*PASS_LOCAL_CONTROL[\s\S]*Decision values:\s*TEAM_REGISTER_READY \/ NO_GO \/ BLOCKED[\s\S]*Build Agent[\s\S]*QA\/Audit Agent[\s\S]*Data Check Agent[\s\S]*Finance Trial Support Agent[\s\S]*UAT\/Evidence Coordinator[\s\S]*Report\/Email Coordinator[\s\S]*Human Authority Owner[\s\S]*Production remains NO-GO/i,
  "P7-05 AI delivery team operating register",
);
const masterGoalRegister = requireText(
  "docs/HEU_MASTER_CONTROL_GOAL_REGISTER_20260702.md",
  /Status:\s*PASS_LOCAL_GOAL_CONTROL[\s\S]*MASTER_GOAL_READY \/ NO_GO \/ BLOCKED[\s\S]*Continuous Build Goal When Local Machine Is Off[\s\S]*cloud PASS_LOCAL\s+verification, not autonomous coding[\s\S]*Expert Team Build Goal[\s\S]*Build Agent[\s\S]*Human Authority Owner[\s\S]*Production remains NO-GO/i,
  "Master Control goal register",
);
const checklistGenerator = requireText(
  "components/ai/ai-task-checklist-generator.tsx",
  /data-heu-ai-task-checklist-generator="P7-02"/i,
  "P7-02 checklist generator marker",
);
const riskSuggestionBoard = requireText(
  "components/ai/ai-risk-suggestion-board.tsx",
  /data-heu-ai-risk-suggestion-board="P7-03"/i,
  "P7-03 risk suggestion board marker",
);

requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  /AI must not:[\s\S]*Approve[\s\S]*Pay partners[\s\S]*Recognize revenue[\s\S]*Freeze\/release[\s\S]*production GO/i,
  "forbidden AI behavior list",
);

requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  /Production AI remains\s+locked/i,
  "production AI locked statement",
);
requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  /P7-02 Read-Only Task Checklist Generator[\s\S]*local, read-only and template-based[\s\S]*TTGDTX UAT evidence[\s\S]*owner GO\/NO-GO review[\s\S]*small build slices[\s\S]*must not:[\s\S]*Send prompts to an AI service[\s\S]*Save user-entered prompts[\s\S]*Call Supabase, RPC, mutation APIs or production workflows[\s\S]*Approve finance, accept UAT, waive evidence, run migration or mark production\s+GO[\s\S]*P7-02 remains PASS_LOCAL only/i,
  "P7-02 read-only checklist generator policy",
);
requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  /P7-03 Read-Only Risk Suggestion Board[\s\S]*static, read-only and advisory-only[\s\S]*missing evidence[\s\S]*role\/workspace leaks[\s\S]*missing restore proof[\s\S]*duplicate payout[\s\S]*dashboard reconciliation[\s\S]*AI-output misuse[\s\S]*must not:[\s\S]*Score people, hide exceptions or suppress risk[\s\S]*Save risk decisions or write workflow data[\s\S]*Call Supabase, RPC, mutation APIs, AI services or production workflows[\s\S]*Approve finance, accept UAT, waive evidence, run migration or mark production\s+GO[\s\S]*P7-03 remains PASS_LOCAL only/i,
  "P7-03 read-only risk suggestion board policy",
);
requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  /P7-04 Prompt\/Output Audit Logging Design[\s\S]*HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628\.md[\s\S]*PASS_LOCAL_DESIGN[\s\S]*must not:[\s\S]*Call an AI service[\s\S]*Store live user prompts, files or raw evidence in Git, Codex or chat[\s\S]*Write workflow state, approve finance, accept UAT, waive evidence, run\s+migration or mark production GO[\s\S]*P7-04 remains PASS_LOCAL_DESIGN only/i,
  "P7-04 prompt/output audit logging policy",
);
requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  /P7-05 AI Delivery Team Operating Register[\s\S]*HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702\.md[\s\S]*PASS_LOCAL_CONTROL[\s\S]*operating lanes, allowed\s+inputs, allowed outputs, required checks, human authority owners and stop\s+conditions[\s\S]*must not:[\s\S]*Create real autonomous AI workers[\s\S]*Send real email or create real software tasks from Codex[\s\S]*Store passwords, temporary passwords, OTPs, reset\/invite links, service-role\s+keys, SMTP credentials, raw PII, bank statements, vouchers or raw payment\s+data in Git, Codex or chat[\s\S]*Execute UAT, accept evidence, approve finance action, approve owner GO,\s+run production migration or mark production GO[\s\S]*TEAM_REGISTER_READY[\s\S]*does not enable\s+autonomous AI, production deployment, UAT acceptance, evidence acceptance,\s+finance approval or owner GO\/NO-GO/i,
  "P7-05 AI delivery team operating policy",
);
requireText(
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  /P7-04 prompt\/output audit logging design[\s\S]*HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628\.md[\s\S]*actor, role, workspace scope, registered agent, source scope,\s+prompt\/output redaction status, prompt\/output hash where available, forbidden\s+action flags, human decision status and controlled evidence reference[\s\S]*does not implement AI logging, enable AI\s+service calls, approve AI-readable data access, accept UAT or approve\s+production AI/i,
  "P7-04 AI scope register boundary",
);
requireText(
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  /Delivery Team Operating Scope[\s\S]*HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702\.md[\s\S]*Build\s+Agent, QA\/Audit Agent, Data Check Agent, Finance Trial Support Agent,\s+UAT\/Evidence Coordinator, Report\/Email Coordinator and Human Authority Owner[\s\S]*coordinate local PASS_LOCAL work, audit reruns, plain-language\s+reports, no-secret task handoffs and owner routing[\s\S]*must not create\s+autonomous AI workers, send real email, create real software tasks, accept UAT,\s+accept evidence, approve finance action, approve owner GO, run production\s+migration or mark production GO[\s\S]*TEAM_REGISTER_READY \/ NO_GO \/ BLOCKED[\s\S]*Human\s+authority owners remain responsible/i,
  "P7-05 AI delivery team scope register boundary",
);
requireText(
  "docs/HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628.md",
  /Required Logical Records[\s\S]*AI_PROMPT_OUTPUT_AUDIT_LOG[\s\S]*AI_SCOPE_SOURCE_ACCESS_LOG[\s\S]*AI_ASSISTED_DECISION_LINK[\s\S]*AI_RISK_REVIEW_LOG[\s\S]*Minimum Event Fields[\s\S]*actor_user_id[\s\S]*workspace_scope[\s\S]*source_scope_refs[\s\S]*forbidden_action_flag[\s\S]*human_decision_status[\s\S]*Stop Conditions[\s\S]*AI suggests approval, payment, revenue recognition, account release,\s+deletion, evidence hiding, migration approval or production GO/i,
  "P7-04 required records fields and stop conditions",
);
requireText(
  "docs/HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702.md",
  /Mandatory Operating Loop[\s\S]*git status --short --branch[\s\S]*git diff --name-status[\s\S]*current state inventory, system backlog and module readiness gap\s+matrix[\s\S]*Choose exactly one small slice[\s\S]*Report PASS_LOCAL only after checks pass; PASS_LOCAL never means production\s+ready/i,
  "P7-05 mandatory operating loop",
);
requireText(
  "docs/HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702.md",
  /Forbidden Inputs[\s\S]*Passwords, temporary passwords, OTPs, password reset links, account\s+activation links or invite links[\s\S]*Service-role keys, API keys, private keys, SMTP passwords or app passwords[\s\S]*Raw student PII[\s\S]*Raw bank statements, vouchers, payment proof, signed evidence or uncontrolled\s+Drive files[\s\S]*controlled storage outside Git\/Codex\/chat/i,
  "P7-05 forbidden inputs",
);
requireText(
  "docs/HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702.md",
  /Baseline Checks[\s\S]*audit:heu-current-state-inventory[\s\S]*audit:heu-implementation-log[\s\S]*audit:ttgdtx-release-gates[\s\S]*audit:heu-vietnamese-text-encoding[\s\S]*lint[\s\S]*build[\s\S]*git diff --check[\s\S]*Finance\/P6-04 slices[\s\S]*audit:heu-role-scope-uat-pack[\s\S]*audit:heu-user-account-security[\s\S]*audit:heu-finance-desk[\s\S]*audit:ttgdtx-production-readiness-guard[\s\S]*AI\/team-control slices[\s\S]*audit:heu-ai-policy/i,
  "P7-05 baseline checks",
);
requireText(
  "docs/HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702.md",
  /Current Result[\s\S]*TEAM_REGISTER_READY is a local control state only[\s\S]*Production remains NO-GO[\s\S]*Autonomous AI delivery, real email sending, real task\s+creation, signed UAT, evidence acceptance, finance approval, owner GO\/NO-GO and\s+production migration remain blocked/i,
  "P7-05 local-only current result",
);
requireText(
  "docs/HEU_MASTER_CONTROL_GOAL_REGISTER_20260702.md",
  /Current Result[\s\S]*MASTER_GOAL_READY is PASS_LOCAL_GOAL_CONTROL only[\s\S]*Production remains NO-GO[\s\S]*Continuous cloud checks, expert-team lanes and daily\s+reports are coordination controls only[\s\S]*signed UAT, controlled evidence, finance decisions, migration approval and final\s+owner GO\/NO-GO outside Git\/Codex\/chat/i,
  "Master Control goal register current result",
);

const aiPage = requireText(
  "app/ai-assistant/page.tsx",
  /không được[\s\S]*phê duyệt tài chính[\s\S]*chi tiền[\s\S]*ghi nhận doanh thu[\s\S]*phong tỏa\/giải tỏa[\s\S]*production/i,
  "Vietnamese no-autonomous-AI boundary",
);

requireText(
  "app/ai-assistant/page.tsx",
  /chỉ hỗ trợ[\s\S]*nháp|nháp[\s\S]*gợi ý/i,
  "draft/suggestion-only AI description",
);

requireText(
  "app/ai-assistant/page.tsx",
  /AiTaskChecklistGenerator[\s\S]*AiRiskSuggestionBoard[\s\S]*<AiTaskChecklistGenerator\s*\/>[\s\S]*<AiRiskSuggestionBoard\s*\/>[\s\S]*ModulePage/i,
  "AI page mounts P7-02 task checklist generator and P7-03 risk board before module page",
);
requireText(
  "components/ai/ai-task-checklist-generator.tsx",
  /(?=[\s\S]*data-heu-ai-task-checklist-generator="P7-02")(?=[\s\S]*P7-02 AI task checklist generator)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*choose a small slice, run checks, commit only after pass, then\s+continue)(?=[\s\S]*does not call AI, save prompts, write data, approve\s+finance, accept UAT, run migration or mark production GO)(?=[\s\S]*TTGDTX UAT evidence run)(?=[\s\S]*Owner GO\/NO-GO review)(?=[\s\S]*Small build slice)(?=[\s\S]*No production migration, no raw credentials, no hidden approval)(?=[\s\S]*Do not paste secrets, passwords, temporary passwords, OTPs,\s+password reset links, account activation\/invite links, service-role\s+keys, bank credentials, raw student PII, raw CCCD, raw phone\s+numbers, raw bank account numbers, bank statements, vouchers or raw\s+payment data)(?=[\s\S]*PASS_LOCAL does not enable\s+autonomous AI, prompt\/output logging, production AI, production\s+migration, finance action, UAT acceptance, owner waiver or production\s+GO)/i,
  "P7-02 checklist generator UI boundary",
);
requireText(
  "components/ai/ai-risk-suggestion-board.tsx",
  /(?=[\s\S]*data-heu-ai-risk-suggestion-board="P7-03")(?=[\s\S]*P7-03 AI risk suggestion board)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*review prompts for humans)(?=[\s\S]*does not call AI,\s+score people, hide exceptions, write data, approve finance, accept\s+UAT, waive evidence, run migration or mark production GO)(?=[\s\S]*AI-RISK-01)(?=[\s\S]*AI-RISK-06)(?=[\s\S]*AI output treated as approval)(?=[\s\S]*Human review required)(?=[\s\S]*AI never does)(?=[\s\S]*Do not paste secrets, passwords, temporary passwords, OTPs, password\s+reset links, account activation\/invite links, service-role keys, bank\s+credentials, raw student PII, raw CCCD, raw phone numbers, raw bank\s+account numbers, bank statements, vouchers or raw payment data)(?=[\s\S]*PASS_LOCAL does not enable autonomous AI, risk scoring, production\s+AI, finance action, UAT acceptance, owner waiver or production GO)/i,
  "P7-03 risk suggestion board UI boundary",
);

const aiRouteFiles = listFiles("app/ai-assistant");
const forbiddenAiRoutePatterns = [
  { label: "server action directive", pattern: /["']use server["']/ },
  { label: "Supabase client import", pattern: /createClient\s*\(/ },
  { label: "form action", pattern: /<form[\s\S]*action=/i },
  { label: "database insert", pattern: /\.insert\s*\(/ },
  { label: "database update", pattern: /\.update\s*\(/ },
  { label: "database upsert", pattern: /\.upsert\s*\(/ },
  { label: "database delete", pattern: /\.delete\s*\(/ },
  { label: "RPC call", pattern: /\.rpc\s*\(/ },
  { label: "fetch mutation", pattern: /fetch\s*\([\s\S]*method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/i },
];

for (const filePath of aiRouteFiles) {
  const source = read(filePath);
  for (const { label, pattern } of forbiddenAiRoutePatterns) {
    if (pattern.test(source)) {
      fail(`${filePath}: AI route must stay read-only, found ${label}`);
    }
  }
}

for (const { label, pattern } of forbiddenAiRoutePatterns) {
  if (pattern.test(checklistGenerator)) {
    fail(`components/ai/ai-task-checklist-generator.tsx: checklist generator must stay read-only, found ${label}`);
  }
  if (pattern.test(riskSuggestionBoard)) {
    fail(`components/ai/ai-risk-suggestion-board.tsx: risk board must stay read-only, found ${label}`);
  }
}

if (!policy.includes("Prompt/output audit logging")) {
  fail("AI policy must require prompt/output audit logging before automation.");
}

if (!aiPage.includes("Cảnh báo rủi ro nhưng không thay người duyệt")) {
  fail("AI page must show that risk warnings do not replace human approval.");
}

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
if (!/No AI approval[\s\S]*PASS_LOCAL[\s\S]*ai-task-checklist-generator\.tsx[\s\S]*ai-risk-suggestion-board\.tsx[\s\S]*audit:heu-ai-policy/i.test(checklist)) {
  fail("Production checklist must mark No AI approval PASS_LOCAL with audit:heu-ai-policy evidence.");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
if (!/P7-01[\s\S]*PASS_LOCAL[\s\S]*HEU_AI_ASSISTANT_POLICY_20260627\.md/i.test(backlog)) {
  fail("Backlog P7-01 must be PASS_LOCAL and reference the AI policy.");
}
if (!/P7-02[\s\S]*AI task checklist generator[\s\S]*PASS_LOCAL[\s\S]*ai-task-checklist-generator\.tsx[\s\S]*audit:heu-ai-policy[\s\S]*read-only checklist templates/i.test(backlog)) {
  fail("Backlog P7-02 must be PASS_LOCAL and reference the AI task checklist generator.");
}
if (!/P7-03[\s\S]*AI risk suggestion board[\s\S]*PASS_LOCAL[\s\S]*ai-risk-suggestion-board\.tsx[\s\S]*audit:heu-ai-policy[\s\S]*read-only advisory risk prompts/i.test(backlog)) {
  fail("Backlog P7-03 must be PASS_LOCAL and reference the AI risk suggestion board.");
}
if (!/P7-04[\s\S]*AI prompt\/output audit logging design[\s\S]*PASS_LOCAL_DESIGN[\s\S]*HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628\.md[\s\S]*HEU_AI_ASSISTANT_POLICY_20260627\.md[\s\S]*HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT\.md[\s\S]*audit:heu-ai-policy[\s\S]*design only, no AI call, no prompt storage in Git\/Codex\/chat, no workflow write, no production action/i.test(backlog)) {
  fail("Backlog P7-04 must be PASS_LOCAL_DESIGN and reference prompt/output audit logging design.");
}
if (!/P7-05[\s\S]*AI delivery team operating register[\s\S]*PASS_LOCAL_CONTROL[\s\S]*HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702\.md[\s\S]*HEU_AI_ASSISTANT_POLICY_20260627\.md[\s\S]*HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT\.md[\s\S]*audit:heu-ai-policy[\s\S]*TEAM_REGISTER_READY \/ NO_GO \/ BLOCKED[\s\S]*Build, QA\/Audit, Data Check, Finance Trial Support, UAT\/Evidence, Report\/Email and Human Authority Owner lanes[\s\S]*no autonomous AI workers, no real email sending, no real task creation[\s\S]*no UAT\/evidence\/finance\/owner approval and no production action/i.test(backlog)) {
  fail("Backlog P7-05 must be PASS_LOCAL_CONTROL and reference the AI delivery team operating register.");
}

if (!/No AI approval[\s\S]*PASS_LOCAL[\s\S]*HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628\.md[\s\S]*P7-04 is PASS_LOCAL_DESIGN only[\s\S]*cannot call AI services, store live prompts, approve, pay, recognize revenue, freeze\/release or mark go-live/i.test(checklist)) {
  fail("Production checklist must include P7-04 as design-only under the No AI approval control.");
}
if (!/No AI approval[\s\S]*PASS_LOCAL[\s\S]*HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702\.md[\s\S]*P7-05 is PASS_LOCAL_CONTROL with TEAM_REGISTER_READY \/ NO_GO \/ BLOCKED only[\s\S]*cannot create autonomous AI workers, send real email, create real tasks, accept UAT\/evidence, approve finance\/owner decisions or mark production GO/i.test(checklist)) {
  fail("Production checklist must include P7-05 as local delivery-team control under the No AI approval control.");
}

if (/raw PII|bank statement|service-role key/i.test(promptOutputDesign) && !/forbidden in AI prompts, outputs, logs and Git/i.test(promptOutputDesign)) {
  fail("P7-04 design must explicitly forbid raw sensitive content in AI logs.");
}
if (/password|OTP|SMTP|raw PII|bank statement|voucher/i.test(deliveryTeamRegister) && !/No lane may ask a human to paste or store these in Git, Codex, chat, email\s+notes or local docs/i.test(deliveryTeamRegister)) {
  fail("P7-05 register must explicitly forbid sensitive content in AI delivery lanes.");
}
if (/password|OTP|SMTP|raw PII|bank statement|voucher/i.test(masterGoalRegister) && !/Paste or store passwords, temporary passwords, OTPs, reset\/invite links,\s+service-role keys, SMTP credentials, raw PII, bank statements, vouchers or raw\s+payment data/i.test(masterGoalRegister)) {
  fail("Master Control goal register must explicitly forbid sensitive content.");
}

if (failures.length > 0) {
  console.error("HEU AI policy audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `HEU AI policy audit passed. Checked ${aiRouteFiles.length} AI route file(s); AI remains advisory only and P7-05 stays delivery-control only.`,
);
