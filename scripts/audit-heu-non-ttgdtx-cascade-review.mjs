import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const reviewPath = "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md";
const registerPath =
  "docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md";
const expectedScanCount = 44;
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function walkFiles(root, predicate) {
  const absoluteRoot = path.join(repoRoot, root);
  const results = [];

  function walk(currentPath) {
    const stats = statSync(currentPath);

    if (stats.isDirectory()) {
      for (const child of readdirSync(currentPath)) {
        walk(path.join(currentPath, child));
      }
      return;
    }

    if (stats.isFile() && predicate(currentPath)) {
      results.push(currentPath);
    }
  }

  walk(absoluteRoot);
  return results;
}

function relativePath(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function isTtgdtxStep90To110(filePath) {
  const name = path.basename(filePath);
  return /^step(9[0-9]|10[0-9]|110)_.*\.sql$/i.test(name);
}

function requireText(contents, pattern, label, file = reviewPath) {
  if (!pattern.test(contents)) {
    fail(`${file}: missing ${label}`);
  }
}

const sqlFiles = walkFiles("database", (filePath) => filePath.endsWith(".sql"));
const findings = [];

for (const filePath of sqlFiles) {
  if (isTtgdtxStep90To110(filePath)) {
    continue;
  }

  const contents = readFileSync(filePath, "utf8");
  const lines = contents.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    if (/on\s+delete\s+cascade/i.test(line)) {
      findings.push({
        file: relativePath(filePath),
        line: index + 1,
      });
    }
  }
}

const review = read(reviewPath);
const register = read(registerPath);

if (findings.length !== expectedScanCount) {
  fail(`Expected ${expectedScanCount} non-TTGDTX/base cascade findings, found ${findings.length}. Update ${reviewPath} after review.`);
}

requireText(review, /Status:\s*PASS_LOCAL_REVIEW/i, "PASS_LOCAL_REVIEW status");
requireText(review, /Current scan count:\s*44/i, "current scan count");
requireText(review, /Production remains NO-GO until the unresolved HIGH\/CRITICAL cascade paths are\s+converted or waived with written approval/i, "production NO-GO boundary");
requireText(review, /Do not run production migration from Codex\/chat/i, "Codex/chat migration boundary");
requireText(review, /REQUIRES_CONVERSION_OR_WAIVER/i, "conversion or waiver decision");
requireText(review, /Pure derived join rows may be waived only when they do not carry finance,\s+evidence, approval, legal, audit or student-operating history/i, "derived-only waiver boundary");
requireText(review, /P6-06 is PASS_LOCAL[\s\S]*does not approve\s+production migration, production deletion, cascade execution, waiver, data\s+cleanup or production GO/i, "PASS_LOCAL non-approval boundary");
requireText(
  review,
  /HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\.md[\s\S]*P6-06-FIND-001 through P6-06-FIND-044[\s\S]*current SQL\s+locations, child tables, parent references, owner lanes and required\s+dispositions[\s\S]*PASS_LOCAL only[\s\S]*does not approve production deletion,\s+cascade execution, waiver, conversion migration, cleanup, rollback success or\s+production GO/i,
  "P6-06 finding register reference",
);
requireText(
  review,
  /(?=[\s\S]*P6-06 Acceptance Matrix)(?=[\s\S]*data-hard-delete-cascade-acceptance-matrix="P6-06")(?=[\s\S]*P6-06-ACCEPT-01)(?=[\s\S]*P6-06-ACCEPT-06)(?=[\s\S]*P6_06_ACCEPT \/ FAIL \/ BLOCKED)(?=[\s\S]*P6-06 Closure Decision Manifest)(?=[\s\S]*data-hard-delete-cascade-closure-decision-manifest="P6-06")(?=[\s\S]*P6-06-DEC-01)(?=[\s\S]*P6-06-DEC-06)(?=[\s\S]*P6_06_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*signed owner approval)/i,
  "P6-06 hard-delete/cascade acceptance matrix",
);

requireText(register, /Status:\s*PASS_LOCAL_REGISTER/i, "PASS_LOCAL_REGISTER status", registerPath);
requireText(register, /Current scan count:\s*44/i, "register current scan count", registerPath);
requireText(register, /P6-06-FIND-001/i, "first register finding ID", registerPath);
requireText(register, /P6-06-FIND-044/i, "last register finding ID", registerPath);
requireText(
  register,
  /child tables, parent references and owner lanes/i,
  "register maps child tables, parent references and owner lanes",
  registerPath,
);
requireText(register, /P6-06 remains IN_PROGRESS/i, "register closure rule", registerPath);
requireText(
  register,
  /does not approve production migration, data\s+deletion, cascade execution, waiver, conversion migration, cleanup, rollback\s+success or production GO/i,
  "register local-only non-approval boundary",
  registerPath,
);

for (const finding of findings) {
  const location = `${finding.file}:${finding.line}`;
  if (!register.includes(`\`${location}\``)) {
    fail(`${registerPath}: missing current cascade finding location ${location}`);
  }
}

const files = new Set(findings.map((finding) => finding.file));
for (const file of files) {
  if (!review.includes(`\`${file}\``)) {
    fail(`${reviewPath}: missing reviewed cascade file ${file}`);
  }
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-non-ttgdtx-cascade-review"]) {
  fail("package.json: missing audit:heu-non-ttgdtx-cascade-review script");
}

const hardDeleteAudit = read("docs/HARD_DELETE_AUDIT.md");
requireText(
  hardDeleteAudit,
  /HEU_NON_TTGDTX_CASCADE_REVIEW_20260627\.md[\s\S]*non-TTGDTX\/base cascade review/i,
  "hard-delete audit review reference",
  "docs/HARD_DELETE_AUDIT.md",
);

const checklist = read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md");
requireText(
  checklist,
  /HEU_NON_TTGDTX_CASCADE_REVIEW_20260627\.md[\s\S]*audit:heu-non-ttgdtx-cascade-review/i,
  "production checklist review reference",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

const releaseGateAudit = read("scripts/audit-ttgdtx-release-gates.mjs");
if (!releaseGateAudit.includes(reviewPath) || !releaseGateAudit.includes("audit:heu-non-ttgdtx-cascade-review")) {
  fail("scripts/audit-ttgdtx-release-gates.mjs: missing non-TTGDTX cascade review coverage.");
}
if (!releaseGateAudit.includes(registerPath)) {
  fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${registerPath} coverage.`);
}

if (failures.length > 0) {
  console.error("HEU non-TTGDTX/base cascade review audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`HEU non-TTGDTX/base cascade review audit passed. Reviewed ${findings.length} current cascade findings; production remains NO-GO.`);
