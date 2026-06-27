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

requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  /AI must not:[\s\S]*Approve[\s\S]*Pay partners[\s\S]*Recognize revenue[\s\S]*Freeze\/release[\s\S]*production GO/i,
  "forbidden AI behavior list",
);

requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  /Production AI remains locked/i,
  "production AI locked statement",
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

if (!policy.includes("Prompt/output audit logging")) {
  fail("AI policy must require prompt/output audit logging before automation.");
}

if (!aiPage.includes("Cảnh báo rủi ro nhưng không thay người duyệt")) {
  fail("AI page must show that risk warnings do not replace human approval.");
}

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
if (!/No AI approval[\s\S]*PASS_LOCAL[\s\S]*audit:heu-ai-policy/i.test(checklist)) {
  fail("Production checklist must mark No AI approval PASS_LOCAL with audit:heu-ai-policy evidence.");
}

const backlog = read("docs/HEU_SYSTEM_BUILD_BACKLOG.md");
if (!/P7-01[\s\S]*PASS_LOCAL[\s\S]*HEU_AI_ASSISTANT_POLICY_20260627\.md/i.test(backlog)) {
  fail("Backlog P7-01 must be PASS_LOCAL and reference the AI policy.");
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
