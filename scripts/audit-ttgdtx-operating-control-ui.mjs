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

const pageChecks = [
  {
    path: "app/ttgdtx/payments/page.tsx",
    code: "P2-10",
    label: "Thu học phí",
  },
  {
    path: "app/ttgdtx/payment-requests/page.tsx",
    code: "P2-15",
    label: "Đề nghị thanh toán",
  },
  {
    path: "app/ttgdtx/payment-requests/pay/page.tsx",
    code: "P2-17",
    label: "Chi tiền",
  },
  {
    path: "app/ttgdtx/accounting-dashboard/page.tsx",
    code: "P2-18",
    label: "Dashboard kế toán",
  },
];

requireFile(controlLibPath);
requireFile(stripPath);
requireFile(matrixPath);
requireFile("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");

for (const page of pageChecks) {
  requireFile(page.path);
}

const controlLib = read(controlLibPath);
const strip = read(stripPath);
const matrix = read(matrixPath);
const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");

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
    new RegExp(`code: "${page.code}"[\\s\\S]*label: "${page.label}"[\\s\\S]*owner:[\\s\\S]*mustHave:[\\s\\S]*blocks:`),
    `${page.code} operating-control metadata`,
    controlLibPath,
  );
}

requireText(
  controlLib,
  /code: "P2-15"[\s\S]*"BBNT"[\s\S]*"partner invoice"[\s\S]*blocks: "Duyệt thanh toán và chi tiền"/,
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
  "production checklist PASS_LOCAL row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:ttgdtx-operating-control-ui"]) {
  fail("package.json: missing audit:ttgdtx-operating-control-ui script");
}

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (!releaseGateAudit.includes(controlLibPath) || !releaseGateAudit.includes("audit:ttgdtx-operating-control-ui")) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing operating-control UI audit coverage.");
}

if (failures.length > 0) {
  console.error("TTGDTX operating-control UI audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("TTGDTX operating-control UI audit passed. Key finance pages show owner, blockers and chain position.");
