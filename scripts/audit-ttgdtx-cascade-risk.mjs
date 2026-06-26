import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sqlScanRoot = "database";
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

const sqlFiles = walkFiles(sqlScanRoot, (filePath) => {
  const name = path.basename(filePath);
  return /^step(9[0-9]|10[0-9]|110)_.*\.sql$/.test(name);
});

const cascadeFindings = sqlFiles.flatMap((filePath) =>
  lineFindings(filePath, (line) => /\bon\s+delete\s+cascade\b/i.test(line)),
);

if (cascadeFindings.length > 0) {
  console.error("TTGDTX cascade-risk audit failed.");
  for (const finding of cascadeFindings) {
    console.error(
      `SQL_ON_DELETE_CASCADE ${finding.file}:${finding.line} ${finding.text}`,
    );
  }
  process.exit(1);
}

console.log(
  `TTGDTX cascade-risk audit passed. Scanned ${sqlFiles.length} step90-step110 SQL files.`,
);
