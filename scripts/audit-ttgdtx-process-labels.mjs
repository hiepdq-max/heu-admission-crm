import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const labelPath = "lib/ttgdtx-process-labels.ts";
const searchPagePath = "app/search/page.tsx";
const quickFinderPath = "components/ttgdtx/ttgdtx-process-quick-finder.tsx";
const landingPath = "app/ttgdtx/page.tsx";
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
requireFile(quickFinderPath);
requireFile(landingPath);
requireFile("docs/TTGDTX_PROCESS_CODE_MAP_20260625.md");
requireFile("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");

const labels = read(labelPath);
const searchPage = read(searchPagePath);
const quickFinder = read(quickFinderPath);
const landingPage = read(landingPath);
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
  "P5-03",
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
  /code: "P2-10"[\s\S]*businessName: "Thu học phí"[\s\S]*label: "Thu học phí \(P2-10\)"[\s\S]*thu tien co hoa don khong[\s\S]*thu tien co xuat hoa don khong[\s\S]*xuat hoa don[\s\S]*co can hoa don/i,
  "P2-10 natural invoice search terms",
  labelPath,
);
requireText(
  labels,
  /(?=[\s\S]*normalizeTtgdtxProcessSearchText)(?=[\s\S]*matchesTtgdtxProcessQuery)(?=[\s\S]*normalize\("NFD"\))(?=[\s\S]*\\u0111)(?=[\s\S]*normalizedQuery\.includes\(normalizedValue\))/i,
  "accent-insensitive process query matcher",
  labelPath,
);
requireText(
  labels,
  /code: "P5-03"[\s\S]*businessName: "HEU Finance Desk"[\s\S]*label: "HEU Finance Desk \(P5-03\)"[\s\S]*href: "\/finance-desk"[\s\S]*dashboard tai chinh/i,
  "P5-03 Finance Desk search terms",
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
  searchPage,
  /matchesTtgdtxProcessQuery[\s\S]*buildTtgdtxProcessResults[\s\S]*mergeSearchResults[\s\S]*processResults[\s\S]*loadError = null/i,
  "local TTGDTX process search fallback",
  searchPagePath,
);
requireText(
  quickFinder,
  /(?=[\s\S]*data-ttgdtx-process-quick-finder="TTGDTX_9PLUS")(?=[\s\S]*TTGDTX_PROCESS_LABELS)(?=[\s\S]*featuredProcessCodes)(?=[\s\S]*"P2-10")(?=[\s\S]*"P5-03")(?=[\s\S]*PASS_LOCAL only)(?=[\s\S]*production GO)/i,
  "TTGDTX landing quick finder with P2-10 and P5-03 business search and local-only boundary",
  quickFinderPath,
);
requireText(
  quickFinder,
  /action="\/search"[\s\S]*name="q"[\s\S]*placeholder="Finance Desk, Thu hoc phi, P2-10"/i,
  "quick finder search form",
  quickFinderPath,
);
requireText(
  landingPage,
  /TtgdtxProcessQuickFinder[\s\S]*<TtgdtxProcessQuickFinder \/>[\s\S]*<TtgdtxOperatingControlStrip currentCode="P2-01" \/>/i,
  "TTGDTX landing quick finder before operating control strip",
  landingPath,
);
requireText(
  processMap,
  /(?=[\s\S]*User-facing screens and documents should show the business name first)(?=[\s\S]*Thu tien co xuat hoa don khong)(?=[\s\S]*\/search)(?=[\s\S]*local TTGDTX process-label map)(?=[\s\S]*HEU Finance Desk)(?=[\s\S]*P5-03)(?=[\s\S]*TTGDTX\s+quick\s+finder)/i,
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
