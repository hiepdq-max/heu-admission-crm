import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const scanRoots = ["app", "components", "lib"].map((root) => path.join(repoRoot, root));
const fileExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const centerSpecificPatterns = [
  /PHU_XUYEN/g,
  /P2_19_PHU/g,
  /Phu Xuyen/g,
  /Phu-Xuyen/g,
  /Phú Xuyên/g,
  /Phú-Xuyên/g,
];
const failures = [];

function walk(currentPath, results = []) {
  if (!existsSync(currentPath)) {
    return results;
  }

  const stats = statSync(currentPath);

  if (stats.isDirectory()) {
    for (const child of readdirSync(currentPath)) {
      if (child === "node_modules" || child === ".next" || child === ".git") {
        continue;
      }

      walk(path.join(currentPath, child), results);
    }

    return results;
  }

  if (stats.isFile() && fileExtensions.has(path.extname(currentPath))) {
    results.push(currentPath);
  }

  return results;
}

function relativePath(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function lineNumber(contents, index) {
  return contents.slice(0, index).split(/\r?\n/).length;
}

for (const root of scanRoots) {
  for (const filePath of walk(root)) {
    const contents = readFileSync(filePath, "utf8");

    for (const pattern of centerSpecificPatterns) {
      const matches = contents.matchAll(pattern);

      for (const match of matches) {
        const index = match.index ?? 0;
        failures.push(
          `${relativePath(filePath)}:${lineNumber(contents, index)}: center-specific source evidence literal "${match[0]}" must not be hard-coded in product code`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error("TTGDTX generic source/evidence audit failed.");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "TTGDTX generic source/evidence audit passed. No center-specific evidence literals found in app/components/lib.",
);
