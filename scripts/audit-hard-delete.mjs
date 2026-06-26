import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const jsScanRoots = ["app", "components", "lib"];
const sqlScanRoot = "database";

const allowedDeleteCallSubstrings = [
  "cookieStore.delete(",
  ".searchParams.delete(",
  "allowedProgramIds.delete(",
  "allowedMajorIds.delete(",
];

const excludedDirs = new Set([".git", ".next", "node_modules", "coverage"]);

function walkFiles(root, predicate) {
  const absoluteRoot = path.join(repoRoot, root);
  const results = [];

  function walk(currentPath) {
    const stats = statSync(currentPath);

    if (stats.isDirectory()) {
      const name = path.basename(currentPath);
      if (excludedDirs.has(name)) {
        return;
      }

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

function lineFindings(filePath, predicate) {
  const contents = readFileSync(filePath, "utf8");
  const lines = contents.split(/\r?\n/);
  const findings = [];

  for (const [index, line] of lines.entries()) {
    if (predicate(line)) {
      findings.push({
        file: relativePath(filePath),
        line: index + 1,
        text: line.trim(),
      });
    }
  }

  return findings;
}

const jsFiles = jsScanRoots.flatMap((root) =>
  walkFiles(root, (filePath) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(filePath)),
);

const sqlFiles = walkFiles(sqlScanRoot, (filePath) => {
  const name = path.basename(filePath);
  return /^step(9[0-9]|10[0-9]|110)_.*\.sql$/.test(name);
});

const deleteCallFindings = jsFiles.flatMap((filePath) =>
  lineFindings(filePath, (line) => {
    if (!line.includes(".delete(")) {
      return false;
    }

    return !allowedDeleteCallSubstrings.some((allowed) =>
      line.includes(allowed),
    );
  }),
);

const sqlHardDeleteFindings = sqlFiles.flatMap((filePath) =>
  lineFindings(filePath, (line) => {
    const normalized = line.toLowerCase();
    return (
      /\bdelete\s+from\b/.test(normalized) ||
      /\btruncate\b/.test(normalized) ||
      /\bdrop\s+table\b/.test(normalized)
    );
  }),
);

const allFindings = [
  ...deleteCallFindings.map((finding) => ({
    ...finding,
    kind: "JS_DELETE_CALL",
  })),
  ...sqlHardDeleteFindings.map((finding) => ({
    ...finding,
    kind: "SQL_HARD_DELETE",
  })),
];

if (allFindings.length > 0) {
  console.error("Business hard-delete audit failed.");
  for (const finding of allFindings) {
    console.error(
      `${finding.kind} ${finding.file}:${finding.line} ${finding.text}`,
    );
  }
  process.exit(1);
}

console.log(
  `Business hard-delete audit passed. Scanned ${jsFiles.length} app files and ${sqlFiles.length} step90-step110 SQL files.`,
);
