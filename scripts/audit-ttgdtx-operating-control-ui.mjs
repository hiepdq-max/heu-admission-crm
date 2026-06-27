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

const controlLibPath = "lib/ttgdtx-operating-controls.ts";
const stripPath = "components/ttgdtx/ttgdtx-operating-control-strip.tsx";
const matrixPath = "docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md";
const checklistPath = "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md";

const pageChecks = [
  { path: "app/ttgdtx/page.tsx", code: "P2-01" },
  { path: "app/ttgdtx/tuition/page.tsx", code: "P2-02" },
  { path: "app/ttgdtx/gate/page.tsx", code: "P2-05" },
  { path: "app/ttgdtx/receivables/page.tsx", code: "P2-03" },
  { path: "app/ttgdtx/payments/page.tsx", code: "P2-10" },
  { path: "app/ttgdtx/reconciliation/page.tsx", code: "P2-13" },
  { path: "app/ttgdtx/reconciliation/review/page.tsx", code: "P2-14" },
  { path: "app/ttgdtx/payment-requests/page.tsx", code: "P2-15" },
  { path: "app/ttgdtx/payment-requests/review/page.tsx", code: "P2-16" },
  { path: "app/ttgdtx/payment-requests/pay/page.tsx", code: "P2-17" },
  { path: "app/ttgdtx/accounting-dashboard/page.tsx", code: "P2-18" },
];

requireFile(controlLibPath);
requireFile(stripPath);
requireFile(matrixPath);
requireFile(checklistPath);
requireFile("package.json");
requireFile("scripts/audit-ttgdtx-release-gates.mjs");

for (const page of pageChecks) {
  requireFile(page.path);
}

const controlLib = read(controlLibPath);
const strip = read(stripPath);
const matrix = read(matrixPath);
const checklist = read(checklistPath);

requireText(
  matrix,
  /Show "where am I in the chain" at top of the page[\s\S]*Show missing evidence as a blocking checklist[\s\S]*Show owner and next action/i,
  "UI optimization requirements",
  matrixPath,
);

requireText(
  strip,
  /data-ttgdtx-operating-control=\{current\.code\}/,
  "stable operating-control marker",
  stripPath,
);
requireText(strip, /Owner:/, "owner display", stripPath);
requireText(strip, /Điều kiện trước khi đi tiếp/, "must-have display", stripPath);
requireText(strip, /Nếu thiếu điều kiện, bước này phải chặn/, "blocking display", stripPath);

requireText(
  controlLib,
  /code: "P2-01"[\s\S]*code: "P2-02"[\s\S]*code: "P2-05"[\s\S]*code: "P2-03"[\s\S]*code: "P2-10"[\s\S]*code: "P2-13"[\s\S]*code: "P2-14"[\s\S]*code: "P2-15"[\s\S]*code: "P2-16"[\s\S]*code: "P2-17"[\s\S]*code: "P2-18"/,
  "core TTGDTX operating spine order",
  controlLibPath,
);

for (const page of pageChecks) {
  const contents = read(page.path);

  requireText(
    contents,
    /TtgdtxOperatingControlStrip/,
    `${page.code} control strip import/use`,
    page.path,
  );
  requireText(
    contents,
    new RegExp(`currentCode="${page.code}"`),
    `${page.code} current-code binding`,
    page.path,
  );
  requireText(
    controlLib,
    new RegExp(`code: "${page.code}"[\\s\\S]*owner:[\\s\\S]*mustHave:[\\s\\S]*blocks:`),
    `${page.code} operating-control metadata`,
    controlLibPath,
  );
}

requireText(
  controlLib,
  /code: "P2-05"[\s\S]*"P0-19 ALLOW_FINANCE"[\s\S]*"P2-02 READY"[\s\S]*blocks: "Tạo công nợ P2-03"/,
  "P2-05 P0-19 gate metadata",
  controlLibPath,
);
requireText(
  controlLib,
  /code: "P2-15"[\s\S]*"BBNT"[\s\S]*"partner invoice"/,
  "P2-15 BBNT and partner-invoice control",
  controlLibPath,
);
requireText(
  controlLib,
  /code: "P2-18"[\s\S]*"read-only totals"[\s\S]*"locked source facts"[\s\S]*"approved source facts"/,
  "P2-18 read-only dashboard facts",
  controlLibPath,
);
requireText(
  checklist,
  /TTGDTX operating control matrix[\s\S]*PASS_LOCAL[\s\S]*audit:ttgdtx-operating-control-ui[\s\S]*signed UAT still required/i,
  "production checklist operating-control PASS_LOCAL row",
  checklistPath,
);
requireText(
  checklist,
  /Align TTGDTX linked operating spine[\s\S]*PASS_LOCAL[\s\S]*P2-01\/P2-02\/P2-05\/P2-03\/P2-10\/P2-13\/P2-14\/P2-15\/P2-16\/P2-17\/P2-18[\s\S]*signed UAT still required/i,
  "linked operating spine PASS_LOCAL row",
  checklistPath,
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:ttgdtx-operating-control-ui"]) {
  fail("package.json: missing audit:ttgdtx-operating-control-ui script");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
for (const needle of [
  controlLibPath,
  stripPath,
  "audit:ttgdtx-operating-control-ui",
  "core TTGDTX operating spine order",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

if (failures.length > 0) {
  console.error("TTGDTX operating-control UI audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `TTGDTX operating-control UI audit passed. Checked ${pageChecks.length} core spine pages.`,
);
