import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function requireText(relativePath, pattern, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  if (!pattern.test(contents)) {
    fail(`${relativePath}: missing ${label}`);
  }
}

const requiredFiles = [
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  "app/ttgdtx/page.tsx",
  "lib/production-readiness.ts",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "AGENTS.md",
  "package.json",
  "scripts/audit-ttgdtx-release-gates.mjs",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = exists("package.json") ? JSON.parse(read("package.json")) : {};

if (!packageJson.scripts?.["audit:ttgdtx-signed-uat-execution-routing-hub"]) {
  fail("package.json: missing audit:ttgdtx-signed-uat-execution-routing-hub script");
}

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*data-ttgdtx-signed-uat-execution-routing-hub="P0-08_UAT_ROUTING")(?=[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*UAT-ROUTE-01)(?=[\s\S]*UAT-ROUTE-11)(?=[\s\S]*P0-10)(?=[\s\S]*P0-03)(?=[\s\S]*Step90-Step110)(?=[\s\S]*P6-04)(?=[\s\S]*P0-19)(?=[\s\S]*P3-01\/P3-02)(?=[\s\S]*P2-17)(?=[\s\S]*P2-18\/P5-03)(?=[\s\S]*P6-03)(?=[\s\S]*P6-06)(?=[\s\S]*P0-09)(?=[\s\S]*controlled evidence reference, redaction reviewer, route result)(?=[\s\S]*PASS_LOCAL means the routing structure, visible panel and audit guard exist)(?=[\s\S]*Production remains NO-GO until controlled external evidence and required owner\s+signatures exist)/i,
  "signed UAT routing hub DRAFT_CONTROL boundary",
);

requireText(
  "lib/production-readiness.ts",
  /(?=[\s\S]*export type SignedUatExecutionRoute)(?=[\s\S]*export const SIGNED_UAT_EXECUTION_ROUTES)(?=[\s\S]*UAT-ROUTE-01)(?=[\s\S]*UAT-ROUTE-11)(?=[\s\S]*P0-10)(?=[\s\S]*P0-03)(?=[\s\S]*Step90-Step110)(?=[\s\S]*P6-04)(?=[\s\S]*P0-19)(?=[\s\S]*P3-01\/P3-02)(?=[\s\S]*P2-17)(?=[\s\S]*P2-18\/P5-03)(?=[\s\S]*P6-03)(?=[\s\S]*P6-06)(?=[\s\S]*P0-09)(?=[\s\S]*audit:ttgdtx-production-owner-signoff-pack)/i,
  "shared signed UAT execution route source",
);

requireText(
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  /(?=[\s\S]*data-ttgdtx-signed-uat-execution-routing-hub="P0-08_UAT_ROUTING")(?=[\s\S]*TTGDTX signed UAT execution routing hub:\s*PASS_LOCAL only)(?=[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SIGNED_UAT_EXECUTION_ROUTES)(?=[\s\S]*Open route)(?=[\s\S]*Closure rule)(?=[\s\S]*Strict boundary)(?=[\s\S]*PASS_LOCAL does not execute UAT, accept evidence, sign owner\s+results, grant access, approve finance action, approve migration,\s+approve owner GO\/NO-GO or mark production GO)/i,
  "visible signed UAT execution routing hub",
);

requireText(
  "app/ttgdtx/page.tsx",
  /(?=[\s\S]*TtgdtxSignedUatExecutionRoutingHub)(?=[\s\S]*<TtgdtxUatSignoffGuard \/>[\s\S]*<TtgdtxSignedUatExecutionRoutingHub \/>[\s\S]*<TtgdtxProductionExecutionQueue \/>)/i,
  "TTGDTX page mounts signed UAT routing hub between UAT guard and execution queue",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P0-08[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*ttgdtx-signed-uat-execution-routing-hub\.tsx[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*audit:ttgdtx-signed-uat-execution-routing-hub[\s\S]*does not execute UAT, accept evidence, sign owner results, grant access, approve finance action, approve migration, approve owner GO\/NO-GO or mark production GO/i,
  "P0-08 backlog signed UAT routing evidence",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Internal UAT sign-off[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*ttgdtx-signed-uat-execution-routing-hub\.tsx[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*audit:ttgdtx-signed-uat-execution-routing-hub[\s\S]*signed multi-account UAT still required/i,
  "production checklist signed UAT routing evidence",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /npm\.cmd run audit:ttgdtx-signed-uat-execution-routing-hub[\s\S]*PASS[\s\S]*TTGDTX signed UAT execution routing hub[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*ttgdtx-signed-uat-execution-routing-hub\.tsx[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*PASS_LOCAL; signed UAT and owner reliance still required/i,
  "current-state signed UAT routing evidence",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /TTGDTX\/Finance signed UAT execution support[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*ttgdtx-signed-uat-execution-routing-hub\.tsx[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*signed UAT and owner signatures still required/i,
  "module readiness signed UAT routing output",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-06-28 - TTGDTX Signed UAT Execution Routing Hub[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*ttgdtx-signed-uat-execution-routing-hub\.tsx[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*audit:ttgdtx-signed-uat-execution-routing-hub[\s\S]*does not execute UAT, accept evidence, sign owner results, grant access, approve finance action, approve migration, approve owner GO\/NO-GO or mark production GO/i,
  "implementation log signed UAT routing entry",
);

requireText(
  "AGENTS.md",
  /docs\/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*npm\.cmd run audit:ttgdtx-signed-uat-execution-routing-hub/i,
  "AGENTS required reading and final handoff command",
);

requireText(
  "scripts/audit-ttgdtx-release-gates.mjs",
  /docs\/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*components\/ttgdtx\/ttgdtx-signed-uat-execution-routing-hub\.tsx[\s\S]*scripts\/audit-ttgdtx-signed-uat-execution-routing-hub\.mjs[\s\S]*audit:ttgdtx-signed-uat-execution-routing-hub/i,
  "release-gate file and script coverage",
);

if (failures.length > 0) {
  console.error("TTGDTX signed UAT execution routing hub audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "TTGDTX signed UAT execution routing hub audit passed. P0-08 remains PASS_LOCAL and production stays NO-GO.",
);
