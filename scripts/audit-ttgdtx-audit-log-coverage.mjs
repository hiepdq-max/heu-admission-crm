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

const allDatabaseSql = walkFiles(sqlScanRoot, (filePath) =>
  /\.sql$/i.test(filePath),
)
  .map((filePath) => readFileSync(filePath, "utf8"))
  .join("\n");

if (
  !/create\s+or\s+replace\s+function\s+public\.write_audit_log\b/i.test(
    allDatabaseSql,
  )
) {
  console.error("TTGDTX audit-log coverage failed: public.write_audit_log is missing.");
  process.exit(1);
}

const sqlFiles = walkFiles(sqlScanRoot, (filePath) => {
  const name = path.basename(filePath);
  return /^step(9[0-9]|10[0-9]|110)_.*\.sql$/.test(name);
});

const findings = [];
const coveredTables = [];

for (const filePath of sqlFiles) {
  const contents = readFileSync(filePath, "utf8");
  const relative = relativePath(filePath);
  const tableMatches = contents.matchAll(
    /create\s+table\s+if\s+not\s+exists\s+public\.(ttgdtx_[a-z0-9_]+)/gi,
  );

  for (const match of tableMatches) {
    const tableName = match[1];
    const escapedTableName = tableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const auditPattern = new RegExp(
      `after\\s+insert\\s+or\\s+update\\s+or\\s+delete\\s+on\\s+public\\.${escapedTableName}[\\s\\S]*?execute\\s+function\\s+public\\.write_audit_log\\s*\\(\\s*\\)`,
      "i",
    );

    if (!auditPattern.test(contents)) {
      findings.push(`${relative}: missing audit trigger for public.${tableName}`);
      continue;
    }

    coveredTables.push(`public.${tableName}`);
  }
}

if (findings.length > 0) {
  console.error("TTGDTX audit-log coverage failed.");
  for (const finding of findings) {
    console.error(finding);
  }
  process.exit(1);
}

console.log(
  `TTGDTX audit-log coverage passed. ${coveredTables.length} TTGDTX tables have write_audit_log triggers.`,
);
