import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const scanRoot = path.join(repoRoot, "app", "ttgdtx");
const failures = [];

function fail(message) {
  failures.push(message);
}

function walk(currentPath, results = []) {
  const stats = statSync(currentPath);

  if (stats.isDirectory()) {
    for (const child of readdirSync(currentPath)) {
      walk(path.join(currentPath, child), results);
    }
    return results;
  }

  if (stats.isFile() && path.basename(currentPath) === "page.tsx") {
    results.push(currentPath);
  }

  return results;
}

function relativePath(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

const pageFiles = walk(scanRoot);

for (const filePath of pageFiles) {
  const relative = relativePath(filePath);
  const contents = readFileSync(filePath, "utf8");

  if (!/supabase\.auth\.getUser\s*\(/.test(contents)) {
    fail(`${relative}: missing Supabase auth.getUser() check`);
  }

  if (!/redirect\(\s*"\/login"\s*\)/.test(contents)) {
    fail(`${relative}: missing login redirect for unauthenticated users`);
  }

  if (!/current_user_role_code/.test(contents)) {
    fail(`${relative}: missing current_user_role_code() role check`);
  }

  if (!/has_permission/.test(contents)) {
    fail(`${relative}: missing has_permission() business permission check`);
  }

  if (!/user_admission_segment_scopes/.test(contents)) {
    fail(`${relative}: missing user_admission_segment_scopes workspace check`);
  }

  const lines = contents.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (!/return\s+scopes\.some\(\(scope\)\s*=>\s*scope\.segment_id\s*===\s*segmentId\)/.test(line)) {
      continue;
    }

    const previousGuard = lines
      .slice(Math.max(0, index - 12), index + 1)
      .join("\n");

    if (!/!\s*has[A-Za-z0-9_]*|!\(\s*has[A-Za-z0-9_]*[\s\S]*&&\s*!has[A-Za-z0-9_]*/.test(previousGuard)) {
      fail(
        `${relative}:${index + 1}: scope-only access must also require a business permission`,
      );
    }
  }

  for (const match of contents.matchAll(
    /return\s+Boolean\(\s*([\s\S]*?scopes\.some\(\(scope\)\s*=>\s*scope\.segment_id\s*===\s*segmentId\)[\s\S]*?)\);/g,
  )) {
    if (!/has[A-Za-z0-9_]*|hasDashboardPermission/.test(match[1])) {
      fail(`${relative}: Boolean scope access must include a business permission`);
    }
  }
}

if (failures.length > 0) {
  console.error("TTGDTX role-scope access audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `TTGDTX role-scope access audit passed. Checked ${pageFiles.length} TTGDTX pages.`,
);
