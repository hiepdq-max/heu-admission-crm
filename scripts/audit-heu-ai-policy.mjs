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
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  /P7-04 prompt\/output audit logging design[\s\S]*HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628\.md[\s\S]*actor, role, workspace scope, registered agent, source scope,\s+prompt\/output redaction status, prompt\/output hash where available, forbidden\s+action flags, human decision status and controlled evidence reference[\s\S]*does not implement AI logging, enable AI\s+service calls, approve AI-readable data access, accept UAT or approve\s+production AI/i,
  "P7-04 AI scope register boundary",
);
requireText(
  "docs/HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628.md",
  /Required Logical Records[\s\S]*AI_PROMPT_OUTPUT_AUDIT_LOG[\s\S]*AI_SCOPE_SOURCE_ACCESS_LOG[\s\S]*AI_ASSISTED_DECISION_LINK[\s\S]*AI_RISK_REVIEW_LOG[\s\S]*Minimum Event Fields[\s\S]*actor_user_id[\s\S]*workspace_scope[\s\S]*source_scope_refs[\s\S]*forbidden_action_flag[\s\S]*human_decision_status[\s\S]*Stop Conditions[\s\S]*AI suggests approval, payment, revenue recognition, account release,\s+deletion, evidence hiding, migration approval or production GO/i,
  "P7-04 required records fields and stop conditions",
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
  /(?=[\s\S]*data-heu-ai-task-checklist-generator="P7-02")(?=[\s\S]*P7-02 AI task checklist generator)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*choose a small slice, run checks, commit only after pass, then\s+continue)(?=[\s\S]*does not call AI, save prompts, write data, approve\s+finance, accept UAT, run migration or mark production GO)(?=[\s\S]*TTGDTX UAT evidence run)(?=[\s\S]*Owner GO\/NO-GO review)(?=[\s\S]*Small build slice)(?=[\s\S]*No production migration, no raw credentials, no hidden approval)(?=[\s\S]*Do not paste secrets, passwords, OTPs, service-role keys, bank\s+credentials, raw student PII, raw CCCD, raw phone numbers, raw bank\s+account numbers, bank statements, vouchers or raw payment data)(?=[\s\S]*PASS_LOCAL does not enable\s+autonomous AI, prompt\/output logging, production AI, production\s+migration, finance action, UAT acceptance, owner waiver or production\s+GO)/i,
  "P7-02 checklist generator UI boundary",
);
requireText(
  "components/ai/ai-risk-suggestion-board.tsx",
  /(?=[\s\S]*data-heu-ai-risk-suggestion-board="P7-03")(?=[\s\S]*P7-03 AI risk suggestion board)(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*review prompts for humans)(?=[\s\S]*does not call AI,\s+score people, hide exceptions, write data, approve finance, accept\s+UAT, waive evidence, run migration or mark production GO)(?=[\s\S]*AI-RISK-01)(?=[\s\S]*AI-RISK-06)(?=[\s\S]*AI output treated as approval)(?=[\s\S]*Human review required)(?=[\s\S]*AI never does)(?=[\s\S]*Do not paste secrets, passwords, OTPs, service-role keys, bank\s+credentials, raw student PII, raw CCCD, raw phone numbers, raw bank\s+account numbers, bank statements, vouchers or raw payment data)(?=[\s\S]*PASS_LOCAL does not enable autonomous AI, risk scoring, production AI,\s+finance action, UAT acceptance, owner waiver or production GO)/i,
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

if (!/No AI approval[\s\S]*PASS_LOCAL[\s\S]*HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628\.md[\s\S]*P7-04 is PASS_LOCAL_DESIGN only[\s\S]*cannot call AI services, store live prompts, approve, pay, recognize revenue, freeze\/release or mark go-live/i.test(checklist)) {
  fail("Production checklist must include P7-04 as design-only under the No AI approval control.");
}

if (/raw PII|bank statement|service-role key/i.test(promptOutputDesign) && !/forbidden in AI prompts, outputs, logs and Git/i.test(promptOutputDesign)) {
  fail("P7-04 design must explicitly forbid raw sensitive content in AI logs.");
}

if (failures.length > 0) {
  console.error("HEU AI policy audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `HEU AI policy audit passed. Checked ${aiRouteFiles.length} AI route file(s); AI remains advisory only.`,
);
