import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const backlogPath = path.join(repoRoot, "docs/HEU_SYSTEM_BUILD_BACKLOG.md");
const backlog = readFileSync(backlogPath, "utf8");
const rows = backlog.split(/\r?\n/);
const codePattern = /^\|\s*(P\d+-\d{2})\s*\|/;
const seen = new Map();
const failures = [];

for (const [index, row] of rows.entries()) {
  const match = row.match(codePattern);
  if (!match) {
    continue;
  }

  const code = match[1];
  const lineNumber = index + 1;
  const firstLine = seen.get(code);

  if (firstLine) {
    failures.push(`${code} is duplicated at lines ${firstLine} and ${lineNumber}`);
  } else {
    seen.set(code, lineNumber);
  }
}

if (!seen.has("P4-04")) {
  failures.push("Missing P4-04 VND money input/display normalization backlog row");
}

if (
  !/P4-04[\s\S]*VND money input\/display normalization[\s\S]*P2-10\/P2-17 forms[\s\S]*P2-18 dashboard displays[\s\S]*shared formatter/i.test(
    backlog,
  )
) {
  failures.push("P4-04 backlog row must cover P2-10/P2-17 forms and P2-18 dashboard VND display");
}

if (!seen.has("P4-05")) {
  failures.push("Missing P4-05 period lock and adjustment policy backlog row");
}

if (failures.length > 0) {
  console.error("HEU backlog code audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`HEU backlog code audit passed. Checked ${seen.size} backlog codes.`);
