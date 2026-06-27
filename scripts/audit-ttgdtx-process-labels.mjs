import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const labelPath = "lib/ttgdtx-process-labels.ts";
const searchPagePath = "app/search/page.tsx";
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

requireFile(labelPath);
requireFile(searchPagePath);
requireFile("docs/TTGDTX_PROCESS_CODE_MAP_20260625.md");
requireFile("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");

const labels = read(labelPath);
const searchPage = read(searchPagePath);
const processMap = read("docs/TTGDTX_PROCESS_CODE_MAP_20260625.md");
const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");

const requiredCodes = [
  "P2-01",
  "P2-02",
  "P2-03",
  "P2-04",
  "P2-05",
  "P2-06",
  "P2-10",
  "P2-11",
  "P2-12",
  "P2-13",
  "P2-14",
  "P2-15",
  "P2-16",
  "P2-17",
  "P2-18",
  "P2-19",
];

for (const code of requiredCodes) {
  const match = new RegExp(`code: "${code}"[\\s\\S]*?label: "([^"]+)"`).exec(
    labels,
  );

  if (!match) {
    fail(`${labelPath}: missing process label for ${code}`);
    continue;
  }

  const label = match[1];
  if (label.startsWith(code)) {
    fail(`${labelPath}: ${code} label must show business name before code`);
  }
  if (!label.includes(`(${code})`)) {
    fail(`${labelPath}: ${code} label must include code in parentheses`);
  }
}

requireText(
  labels,
  /code: "P2-10"[\s\S]*businessName: "Thu học phí"[\s\S]*label: "Thu học phí \(P2-10\)"[\s\S]*hoa don thu tien/i,
  "P2-10 Thu hoc phi search terms",
  labelPath,
);
requireText(
  labels,
  /TTGDTX_PROCESS_SEARCH_SUGGESTIONS = TTGDTX_PROCESS_LABELS\.map/i,
  "search suggestions export",
  labelPath,
);
requireText(
  searchPage,
  /TTGDTX_PROCESS_SEARCH_SUGGESTIONS/i,
  "TTGDTX process suggestions in search page",
  searchPagePath,
);
requireText(
  processMap,
  /User-facing screens and documents should show the business name first/i,
  "business-name-first rule",
  "docs/TTGDTX_PROCESS_CODE_MAP_20260625.md",
);
requireText(
  checklist,
  /User-friendly TTGDTX process labels[\s\S]*PASS_LOCAL[\s\S]*audit:ttgdtx-process-labels/i,
  "production checklist process-label PASS_LOCAL row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:ttgdtx-process-labels"]) {
  fail("package.json: missing audit:ttgdtx-process-labels script");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (!releaseGateAudit.includes(labelPath) || !releaseGateAudit.includes("audit:ttgdtx-process-labels")) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing process-label audit coverage.");
}

if (failures.length > 0) {
  console.error("TTGDTX process-label audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX process-label audit passed. Business names stay before P2 codes.");
