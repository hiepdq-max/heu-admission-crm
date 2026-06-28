import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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

function requireIncludes(contents, needle, label, file) {
  if (!contents.includes(needle)) {
    fail(`${file}: missing ${label}`);
  }
}

const targetRoots = ["app", "components", "docs", "lib", "scripts", "fixtures"];
const targetExtensions = new Set([".json", ".md", ".mjs", ".ts", ".tsx"]);

const forbiddenFragments = [
  {
    label: "UTF-8 accent bytes decoded as mojibake",
    value: "\u00c3",
  },
  {
    label: "Vietnamese d decoded as mojibake",
    value: "\u00c4\u2018",
  },
  {
    label: "Vietnamese D decoded as mojibake",
    value: "\u00c4\u0090",
  },
  {
    label: "Vietnamese vowel prefix decoded as mojibake",
    value: "\u00e1\u00ba",
  },
  {
    label: "Vietnamese tone prefix decoded as mojibake",
    value: "\u00e1\u00bb",
  },
  {
    label: "Vietnamese vowel-ligature prefix decoded as mojibake",
    value: "\u00c6",
  },
  {
    label: "curly quote or dash decoded as mojibake",
    value: "\u00e2\u20ac",
  },
  {
    label: "non-breaking space decoded as mojibake",
    value: "\u00c2\u00a0",
  },
];

function walk(relativeDir) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  if (!existsSync(absoluteDir)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(absoluteDir)) {
    const relativePath = path.join(relativeDir, entry);
    const absolutePath = path.join(repoRoot, relativePath);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...walk(relativePath));
      continue;
    }

    if (stats.isFile() && targetExtensions.has(path.extname(entry))) {
      files.push(relativePath.replaceAll("\\", "/"));
    }
  }

  return files;
}

for (const file of [
  "AGENTS.md",
  "package.json",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "scripts/audit-ttgdtx-release-gates.mjs",
]) {
  requireFile(file);
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.scripts?.["audit:heu-vietnamese-text-encoding"]) {
  fail("package.json: missing audit:heu-vietnamese-text-encoding script");
}

const agents = existsSync(path.join(repoRoot, "AGENTS.md")) ? read("AGENTS.md") : "";
const backlog = existsSync(path.join(repoRoot, "docs/HEU_SYSTEM_BUILD_BACKLOG.md"))
  ? read("docs/HEU_SYSTEM_BUILD_BACKLOG.md")
  : "";
const checklist = existsSync(
  path.join(repoRoot, "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md"),
)
  ? read("docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md")
  : "";
const inventory = existsSync(path.join(repoRoot, "docs/HEU_CURRENT_STATE_INVENTORY.md"))
  ? read("docs/HEU_CURRENT_STATE_INVENTORY.md")
  : "";
const releaseGateAudit = existsSync(
  path.join(repoRoot, "scripts/audit-ttgdtx-release-gates.mjs"),
)
  ? read("scripts/audit-ttgdtx-release-gates.mjs")
  : "";

requireText(
  agents,
  /Before any final handoff[\s\S]*npm\.cmd run audit:heu-vietnamese-text-encoding/i,
  "final handoff Vietnamese text encoding audit command",
  "AGENTS.md",
);

requireText(
  backlog,
  /P0-12[\s\S]*Vietnamese UI text encoding[\s\S]*PASS_LOCAL[\s\S]*audit:heu-vietnamese-text-encoding/i,
  "P0-12 Vietnamese text encoding backlog row",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
);

requireText(
  checklist,
  /Vietnamese UI text encoding[\s\S]*PASS_LOCAL[\s\S]*audit:heu-vietnamese-text-encoding/i,
  "production checklist Vietnamese text encoding row",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
);

for (const [label, needle] of [
  ["readable P2-10 tuition collection label", "Thu h\u1ecdc ph\u00ed"],
  ["readable P2-10 invoice/voucher label", "H\u00f3a \u0111\u01a1n/ch\u1ee9ng t\u1eeb"],
  ["readable BBNT acceptance basis label", "nghi\u1ec7m thu"],
  ["readable VND display suffix", "1.000.000 \u0111"],
]) {
  requireIncludes(
    checklist,
    needle,
    label,
    "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  );
}

requireText(
  inventory,
  /npm\.cmd run audit:heu-vietnamese-text-encoding[\s\S]*PASS/i,
  "current-state Vietnamese text encoding audit evidence",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
);

for (const needle of [
  "scripts/audit-heu-vietnamese-text-encoding.mjs",
  "audit:heu-vietnamese-text-encoding",
]) {
  if (!releaseGateAudit.includes(needle)) {
    fail(`scripts/audit-ttgdtx-release-gates.mjs: missing ${needle}`);
  }
}

const scannedFiles = targetRoots.flatMap((root) => walk(root));
for (const relativePath of scannedFiles) {
  const contents = read(relativePath);
  const lines = contents.split(/\r?\n/);

  for (const fragment of forbiddenFragments) {
    const index = contents.indexOf(fragment.value);
    if (index === -1) {
      continue;
    }

    const lineNumber = contents.slice(0, index).split(/\r?\n/).length;
    const linePreview = lines[lineNumber - 1]?.slice(0, 120) ?? "";
    fail(
      `${relativePath}:${lineNumber}: ${fragment.label}; preview=${JSON.stringify(
        linePreview,
      )}`,
    );
  }
}

if (failures.length > 0) {
  console.error("HEU Vietnamese text encoding audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `HEU Vietnamese text encoding audit passed. Scanned ${scannedFiles.length} source/docs files for mojibake.`,
);
