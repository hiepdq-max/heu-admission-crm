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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const requiredFiles = [
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  "docs/HEU_REAL_OPS_03_SIGNED_UAT_CLOSURE_INTAKE_20260702.md",
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  "app/ttgdtx/page.tsx",
  "lib/production-readiness.ts",
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  "docs/HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
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

const signedUatRouteResultRows = [
  "UAT-ROUTE-01 P0-10 controlled evidence redaction intake",
  "UAT-ROUTE-02 P0-03 backup/restore dry-run proof",
  "UAT-ROUTE-03 Step90-Step110 signed production migration order",
  "UAT-ROUTE-04 P6-04 role/workspace scope UAT",
  "UAT-ROUTE-05 P0-19 legal and finance gate UAT",
  "UAT-ROUTE-06 P3-01/P3-02 lead lifecycle and handover UAT",
  "UAT-ROUTE-07 P2-17 payout duplicate and dossier UAT",
  "UAT-ROUTE-08 P2-18/P5-03 dashboard and Finance Desk browser UAT",
  "UAT-ROUTE-09 P6-03 audit-log traceability UAT",
  "UAT-ROUTE-10 P6-06 hard-delete/cascade closure proof",
  "UAT-ROUTE-11 P0-09 final owner GO/NO-GO decision",
];

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  /(?=[\s\S]*Status:\s*DRAFT_CONTROL)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*data-ttgdtx-signed-uat-execution-routing-hub="P0-08_UAT_ROUTING")(?=[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*UAT-ROUTE-01)(?=[\s\S]*UAT-ROUTE-11)(?=[\s\S]*P0-10)(?=[\s\S]*P0-03)(?=[\s\S]*Step90-Step110)(?=[\s\S]*P6-04)(?=[\s\S]*P0-19)(?=[\s\S]*P3-01\/P3-02)(?=[\s\S]*P2-17)(?=[\s\S]*P2-18\/P5-03)(?=[\s\S]*P6-03)(?=[\s\S]*P6-06)(?=[\s\S]*P0-09)(?=[\s\S]*controlled evidence reference, redaction reviewer, route result)(?=[\s\S]*PASS_LOCAL means the routing structure, visible panel and audit guard exist)(?=[\s\S]*Production remains NO-GO until controlled external evidence and required owner\s+signatures exist)/i,
  "signed UAT routing hub DRAFT_CONTROL boundary",
);

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  /(?=[\s\S]*Authority Action Queue)(?=[\s\S]*data-ttgdtx-signed-uat-authority-action-queue="P0-08_AUTHORITY_ACTIONS")(?=[\s\S]*SIGNED_UAT_AUTHORITY_ACTION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*UAT-AUTH-01)(?=[\s\S]*UAT-AUTH-04)(?=[\s\S]*IT_DATA \+ Audit)(?=[\s\S]*IT_DATA \+ TRUONG_PHONG \+ Audit)(?=[\s\S]*KHTC \+ BGH \+ IT_DATA \+ Audit)(?=[\s\S]*BGH \+ IT_DATA \+ KHTC \+ PHAP_CHE \+ Audit \+ TRUONG_PHONG)(?=[\s\S]*task routing only)(?=[\s\S]*does not execute UAT, accept evidence, sign\s+owner results, create accounts, grant access, approve finance action, approve\s+owner GO\/NO-GO or mark production GO)/i,
  "signed UAT authority action queue",
);

requireText(
  "docs/HEU_REAL_OPS_03_SIGNED_UAT_CLOSURE_INTAKE_20260702.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_UAT_CLOSURE_INTAKE)(?=[\s\S]*REAL_OPS_03_UAT_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*REAL-OPS-03-UAT-01)(?=[\s\S]*REAL-OPS-03-UAT-06)(?=[\s\S]*UAT-ROUTE-01 through\s+UAT-ROUTE-11)(?=[\s\S]*Finance reliance routes closed)(?=[\s\S]*Governance routes closed)(?=[\s\S]*Final handoff boundary acknowledged)(?=[\s\S]*data-ttgdtx-real-ops-03-signed-uat-closure="REAL-OPS-03_UAT_ROUTES")(?=[\s\S]*does not execute UAT, accept evidence, sign owner\s+results, create accounts, grant access, approve finance reliance, approve\s+legal position, approve migration, approve owner GO\/NO-GO or mark production\s+GO)(?=[\s\S]*does not mean any UAT route was executed, accepted, signed,\s+evidence-approved, finance-approved, migration-approved, owner-approved or\s+production-approved)/i,
  "REAL-OPS-03 signed UAT closure intake source document",
);

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  /(?=[\s\S]*REAL-OPS-03 Signed UAT Closure Intake)(?=[\s\S]*HEU_REAL_OPS_03_SIGNED_UAT_CLOSURE_INTAKE_20260702\.md)(?=[\s\S]*data-ttgdtx-real-ops-03-signed-uat-closure="REAL-OPS-03_UAT_ROUTES")(?=[\s\S]*REAL_OPS_03_UAT_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*REAL-OPS-03-UAT-01)(?=[\s\S]*REAL-OPS-03-UAT-06)(?=[\s\S]*Route result index complete)(?=[\s\S]*Finance reliance routes closed)(?=[\s\S]*Governance routes closed)(?=[\s\S]*PASS_LOCAL proves only that REAL-OPS-03 signed UAT closure intake is\s+structured)/i,
  "routing hub REAL-OPS-03 signed UAT closure intake",
);

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  /\| Order \| Code \| Route \| Runbook \| Owner \| Minimum proof \| Decision lane \| Stop condition \| Guard \|[\s\S]*UAT-ROUTE-01[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-11[\s\S]*P0-17 access closure decision[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED[\s\S]*P0-17 access closure is missing/i,
  "signed UAT route table decision lane",
);

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  /(?=[\s\S]*UAT-ROUTE-08[\s\S]*P2-18\/P5-03)(?=[\s\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\.md)(?=[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md|[\s\S]*Finance Day-1 result ledger)(?=[\s\S]*P6-04 real accounting user queue\/result proof)(?=[\s\S]*Finance Day-1 start-gate checklist)(?=[\s\S]*Finance Day-1 start-gate checklist is missing)(?=[\s\S]*Finance Day-1 result ledger is missing)(?=[\s\S]*UAT-ROUTE-11[\s\S]*P0-09)(?=[\s\S]*Finance Day-1 start-gate checklist[\s\S]*Finance Day-1 result ledger[\s\S]*P0-17 access closure decision)(?=[\s\S]*Any required owner signs NO-GO\/BLOCKED, Finance Day-1 start-gate checklist is missing)/i,
  "signed UAT route table Finance Day-1 ledger handoff",
);

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  /UAT-ROUTE-01[\s\S]*Raw PII, CCCD, bank data, passwords, temporary passwords, OTPs, password reset links, account activation\/invite links, service-role keys, vouchers or unredacted screenshots are present/i,
  "signed UAT route P0-10 account-secret stop condition",
);

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  /(?=[\s\S]*Operator Handoff Link)(?=[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md)(?=[\s\S]*UAT-HANDOFF-03)(?=[\s\S]*UAT-HANDOFF-04)(?=[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md` Section 5\.2)(?=[\s\S]*all routes PENDING until controlled evidence and\s+required owner signature exist)/i,
  "routing hub links handoff and execution-log result tracker",
);

requireText(
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  /(?=[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md)(?=[\s\S]*UAT-HANDOFF-03)(?=[\s\S]*\/ttgdtx)(?=[\s\S]*data-ttgdtx-signed-uat-execution-routing-hub="P0-08_UAT_ROUTING")(?=[\s\S]*UAT-HANDOFF-03A)(?=[\s\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\.md)(?=[\s\S]*FIN-START-EVID-001)(?=[\s\S]*FIN-START-EVID-005)(?=[\s\S]*FIN_START_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*UAT-HANDOFF-04)(?=[\s\S]*UAT-HANDOFF-05[\s\S]*Section 5\.2)(?=[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11)(?=[\s\S]*UAT-ROUTE-01 P0-10)(?=[\s\S]*UAT-ROUTE-11 P0-09)(?=[\s\S]*P0-17 access closure decision)(?=[\s\S]*does not execute UAT, approve production, create accounts, collect evidence or\s+record owner GO\/NO-GO)/i,
  "operator handoff is aligned to signed UAT routing hub",
);

requireText(
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  /(?=[\s\S]*UAT-HANDOFF-03B)(?=[\s\S]*data-ttgdtx-signed-uat-authority-action-queue="P0-08_AUTHORITY_ACTIONS")(?=[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md` Section 3)(?=[\s\S]*UAT-AUTH-01 through UAT-AUTH-04)(?=[\s\S]*SIGNED_UAT_AUTHORITY_ACTION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*right authority confirms them outside Git\/Codex\/chat)(?=[\s\S]*UAT-AUTH-01 through UAT-AUTH-04 authority action is unresolved,\s+ownerless, stored only in Codex\/chat or interpreted as UAT approval)/i,
  "operator handoff authority action queue",
);

requireText(
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  /(?=[\s\S]*UAT-ROUTE-08 P2-18\/P5-03 dashboard and Finance Desk browser UAT)(?=[\s\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\.md)(?=[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md)(?=[\s\S]*Finance Day-1 start-gate checklist and result ledger are recorded)(?=[\s\S]*UAT-ROUTE-11 P0-09 final owner GO\/NO-GO decision)(?=[\s\S]*Finance Day-1 start-gate checklist, Finance Day-1 result ledger, P0-17 access closure decision)/i,
  "operator handoff Finance Day-1 ledger route handoff",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /(?=[\s\S]*Signed UAT Route Result Tracker)(?=[\s\S]*BLOCKED_PENDING_SIGNED_UAT_ROUTE_EVIDENCE)(?=[\s\S]*UAT-ROUTE-01 P0-10[\s\S]*PENDING)(?=[\s\S]*UAT-ROUTE-11 P0-09[\s\S]*PENDING)(?=[\s\S]*PASS_LOCAL does not mean any UAT route was executed, accepted, signed,\s+evidence-approved, finance-approved, migration-approved or production-approved)/i,
  "execution log tracks signed UAT route outcomes without accepting UAT",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /\| Route \| Current status \| Decision lane \| Route\/source \| Minimum proof to record \| Owner \| Evidence\/reference \|[\s\S]*UAT-ROUTE-01 P0-10 controlled evidence redaction intake \| PENDING \| SIGNED_UAT_READY \/ NO_GO \/ BLOCKED \|[\s\S]*UAT-ROUTE-11 P0-09 final owner GO\/NO-GO decision \| PENDING \| SIGNED_UAT_READY \/ NO_GO \/ BLOCKED \|[\s\S]*P0-17 access closure decision/i,
  "execution log route tracker exposes per-route decision lane",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  /(?=[\s\S]*UAT-ROUTE-08 P2-18\/P5-03 dashboard and Finance Desk browser UAT \| PENDING \| SIGNED_UAT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\.md)(?=[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md)(?=[\s\S]*Finance Day-1 start-gate checklist, Finance Day-1 result ledger and reliance decision)(?=[\s\S]*UAT-ROUTE-11 P0-09 final owner GO\/NO-GO decision \| PENDING \| SIGNED_UAT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Finance Day-1 start-gate checklist, Finance Day-1 result ledger, P0-17 access closure decision)/i,
  "execution log Finance Day-1 ledger route tracker",
);

for (const row of signedUatRouteResultRows) {
  requireText(
    "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
    new RegExp(
      `\\|\\s*${escapeRegExp(row)}\\s*\\|\\s*PENDING\\s*\\|\\s*SIGNED_UAT_READY / NO_GO / BLOCKED\\s*\\|`,
      "i",
    ),
    `decision lane for ${row}`,
  );
}

requireText(
  "lib/production-readiness.ts",
  /(?=[\s\S]*export type SignedUatExecutionRoute)(?=[\s\S]*decisionValue:\s*string)(?=[\s\S]*export const SIGNED_UAT_EXECUTION_ROUTES)(?=[\s\S]*UAT-ROUTE-01)(?=[\s\S]*decisionValue:\s*"SIGNED_UAT_READY \/ NO_GO \/ BLOCKED")(?=[\s\S]*UAT-ROUTE-11)(?=[\s\S]*P0-10)(?=[\s\S]*P0-03)(?=[\s\S]*Step90-Step110)(?=[\s\S]*P6-04)(?=[\s\S]*P0-19)(?=[\s\S]*P3-01\/P3-02)(?=[\s\S]*P2-17)(?=[\s\S]*P2-18\/P5-03)(?=[\s\S]*P6-03)(?=[\s\S]*P6-06)(?=[\s\S]*P0-09)(?=[\s\S]*P0-17 access closure decision)(?=[\s\S]*P0-17 access closure is missing)(?=[\s\S]*audit:ttgdtx-production-owner-signoff-pack)/i,
  "shared signed UAT execution route source",
);

requireText(
  "lib/production-readiness.ts",
  /(?=[\s\S]*UAT-ROUTE-08)(?=[\s\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\.md)(?=[\s\S]*Finance Day-1 start-gate checklist)(?=[\s\S]*Finance Day-1 result ledger)(?=[\s\S]*UAT-ROUTE-11)(?=[\s\S]*Final owner decision manifest with signed UAT, evidence binder, migration, backup, role, Finance Day-1 start-gate checklist, Finance Day-1 result ledger, P0-17 access closure decision)(?=[\s\S]*Any required owner signs NO-GO\/BLOCKED, Finance Day-1 start-gate checklist is missing)/i,
  "shared signed UAT Finance Day-1 ledger handoff source",
);

requireText(
  "lib/production-readiness.ts",
  /UAT-ROUTE-01[\s\S]*Raw student PII, CCCD, bank data, passwords, temporary passwords, OTPs, password reset links, account activation\/invite links, service-role keys, vouchers or unredacted screenshots are present/i,
  "shared signed UAT route P0-10 account-secret stop condition",
);

requireText(
  "lib/production-readiness.ts",
  /(?=[\s\S]*export type SignedUatAuthorityAction)(?=[\s\S]*export const SIGNED_UAT_AUTHORITY_ACTIONS)(?=[\s\S]*UAT-AUTH-01)(?=[\s\S]*UAT-AUTH-04)(?=[\s\S]*SIGNED_UAT_AUTHORITY_ACTION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*IT_DATA \+ Audit)(?=[\s\S]*IT_DATA \+ TRUONG_PHONG \+ Audit)(?=[\s\S]*KHTC \+ BGH \+ IT_DATA \+ Audit)(?=[\s\S]*BGH \+ IT_DATA \+ KHTC \+ PHAP_CHE \+ Audit \+ TRUONG_PHONG)(?=[\s\S]*storage label, redaction class, reviewer role and evidence ID pattern only)(?=[\s\S]*source-comparison ID, Day-1 checklist ID, result-ledger ID, reliance decision state and owner labels only)(?=[\s\S]*interpreted as production GO from a local audit)/i,
  "shared signed UAT authority action source",
);

requireText(
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  /(?=[\s\S]*data-ttgdtx-signed-uat-execution-routing-hub="P0-08_UAT_ROUTING")(?=[\s\S]*TTGDTX signed UAT execution routing hub:\s*PASS_LOCAL only)(?=[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*SIGNED_UAT_EXECUTION_ROUTES)(?=[\s\S]*Decision lane)(?=[\s\S]*row\.decisionValue)(?=[\s\S]*Open route)(?=[\s\S]*Closure rule)(?=[\s\S]*Strict boundary)(?=[\s\S]*PASS_LOCAL does not execute UAT, accept evidence, sign owner\s+results, grant access, approve finance action, approve migration,\s+approve owner GO\/NO-GO or mark production GO)/i,
  "visible signed UAT execution routing hub",
);

requireText(
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  /(?=[\s\S]*SIGNED_UAT_AUTHORITY_ACTIONS)(?=[\s\S]*data-ttgdtx-signed-uat-authority-action-queue="P0-08_AUTHORITY_ACTIONS")(?=[\s\S]*Authority action queue)(?=[\s\S]*SIGNED_UAT_AUTHORITY_ACTION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*item\.actionNeeded)(?=[\s\S]*item\.safeRecord)(?=[\s\S]*They are task routing only; they do not\s+execute UAT, accept evidence or sign owner results)/i,
  "visible signed UAT authority action queue",
);

requireText(
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  /(?=[\s\S]*realOps03SignedUatClosureItems)(?=[\s\S]*data-ttgdtx-real-ops-03-signed-uat-closure="REAL-OPS-03_UAT_ROUTES")(?=[\s\S]*REAL-OPS-03 signed UAT closure intake)(?=[\s\S]*REAL_OPS_03_UAT_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*REAL-OPS-03-UAT-01)(?=[\s\S]*REAL-OPS-03-UAT-06)(?=[\s\S]*Route result index complete)(?=[\s\S]*Finance reliance routes closed)(?=[\s\S]*Governance routes closed)(?=[\s\S]*PASS_LOCAL proves only that REAL-OPS-03 signed UAT closure intake is\s+structured)(?=[\s\S]*does not execute UAT, accept evidence, sign owner\s+results, approve finance reliance, approve migration, approve owner\s+GO\/NO-GO or mark production GO)/i,
  "visible REAL-OPS-03 signed UAT closure intake",
);

requireText(
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  /(?=[\s\S]*data-ttgdtx-uat-route-tracker-handoff="SECTION_5_2")(?=[\s\S]*Operator tracker handoff)(?=[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md Section 5\.2)(?=[\s\S]*11 UAT-ROUTE rows remain PENDING until signed evidence exists)(?=[\s\S]*Controlled evidence reference, redaction reviewer, result, reviewer and owner signature)/i,
  "visible route tracker handoff points operators to Section 5.2",
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
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P0-08[\s\S]*signed UAT authority action queue[\s\S]*SIGNED_UAT_AUTHORITY_ACTION_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-AUTH-01 through UAT-AUTH-04[\s\S]*audit:ttgdtx-signed-uat-execution-routing-hub/i,
  "P0-08 backlog signed UAT authority action queue",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P0-08 REAL-OPS-03 Signed UAT Closure Intake[\s\S]*HEU_REAL_OPS_03_SIGNED_UAT_CLOSURE_INTAKE_20260702\.md[\s\S]*data-ttgdtx-real-ops-03-signed-uat-closure="REAL-OPS-03_UAT_ROUTES"[\s\S]*REAL_OPS_03_UAT_CLOSURE_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*does not execute UAT, accept evidence, sign owner results, approve\s+finance reliance, approve migration, approve owner GO\/NO-GO or mark production\s+GO/i,
  "P0-08 backlog REAL-OPS-03 signed UAT closure intake",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Internal UAT sign-off[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*ttgdtx-signed-uat-execution-routing-hub\.tsx[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*audit:ttgdtx-signed-uat-execution-routing-hub[\s\S]*signed multi-account UAT still required/i,
  "production checklist signed UAT routing evidence",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Internal UAT sign-off[\s\S]*UAT-HANDOFF-03B[\s\S]*signed UAT authority action queue[\s\S]*SIGNED_UAT_AUTHORITY_ACTION_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-AUTH-01 through UAT-AUTH-04[\s\S]*signed multi-account UAT still required/i,
  "production checklist signed UAT authority action queue",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /REAL-OPS-03 Signed UAT Closure Intake[\s\S]*HEU_REAL_OPS_03_SIGNED_UAT_CLOSURE_INTAKE_20260702\.md[\s\S]*data-ttgdtx-real-ops-03-signed-uat-closure="REAL-OPS-03_UAT_ROUTES"[\s\S]*REAL_OPS_03_UAT_CLOSURE_READY \/ NO_GO \/ BLOCKED[\s\S]*signed multi-account UAT required[\s\S]*does not execute UAT, accept evidence, sign owner results, approve finance\s+reliance, approve migration, approve owner GO\/NO-GO or mark production GO/i,
  "production checklist REAL-OPS-03 signed UAT closure intake",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /npm\.cmd run audit:ttgdtx-signed-uat-execution-routing-hub[\s\S]*PASS[\s\S]*TTGDTX signed UAT execution routing hub[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*ttgdtx-signed-uat-execution-routing-hub\.tsx[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*UAT-ROUTE-08 carries the Finance Day-1 start-gate checklist and result ledger into dashboard\/Finance Desk signed UAT[\s\S]*UAT-ROUTE-11 carries the Finance Day-1 start-gate checklist, Finance Day-1 result ledger plus P0-17 access closure decision into final owner GO\/NO-GO[\s\S]*PASS_LOCAL; signed UAT and owner reliance still required/i,
  "current-state signed UAT routing evidence",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /TTGDTX signed UAT execution routing hub[\s\S]*signed UAT authority action queue[\s\S]*SIGNED_UAT_AUTHORITY_ACTION_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-AUTH-01 through UAT-AUTH-04[\s\S]*BGH, IT_DATA, KHTC, PHAP_CHE, Audit and TRUONG_PHONG authority labels[\s\S]*UAT-HANDOFF-03B[\s\S]*PASS_LOCAL; signed UAT and owner reliance still required/i,
  "current-state signed UAT authority action queue",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /TTGDTX\/Finance signed UAT execution support[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*ttgdtx-signed-uat-execution-routing-hub\.tsx[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*signed UAT and owner signatures still required/i,
  "module readiness signed UAT routing output",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /TTGDTX\/Finance signed UAT execution support[\s\S]*SIGNED_UAT_AUTHORITY_ACTION_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-AUTH-01 through UAT-AUTH-04[\s\S]*signed UAT and owner signatures still required/i,
  "module readiness signed UAT authority action output",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-06-28 - TTGDTX Signed UAT Execution Routing Hub[\s\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\.md[\s\S]*ttgdtx-signed-uat-execution-routing-hub\.tsx[\s\S]*SIGNED_UAT_READY \/ NO_GO \/ BLOCKED[\s\S]*UAT-ROUTE-01 through UAT-ROUTE-11[\s\S]*audit:ttgdtx-signed-uat-execution-routing-hub[\s\S]*does not execute UAT, accept evidence, sign owner results, grant access, approve finance action, approve migration, approve owner GO\/NO-GO or mark production GO/i,
  "implementation log signed UAT routing entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-06-30 - UAT Routing Finance Day-1 Ledger Handoff[\s\S]*UAT-ROUTE-08[\s\S]*Finance Day-1 result ledger[\s\S]*UAT-ROUTE-11[\s\S]*final owner GO\/NO-GO[\s\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\.md[\s\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\.md[\s\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\.md[\s\S]*audit-ttgdtx-signed-uat-execution-routing-hub\.mjs[\s\S]*does not execute UAT[\s\S]*approve owner GO\/NO-GO[\s\S]*mark production GO/i,
  "implementation log UAT routing Finance Day-1 ledger handoff entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-02 - Signed UAT Authority Action Queue[\s\S]*SIGNED_UAT_AUTHORITY_ACTIONS[\s\S]*UAT-AUTH-01 through UAT-AUTH-04[\s\S]*SIGNED_UAT_AUTHORITY_ACTION_READY \/ NO_GO \/ BLOCKED[\s\S]*data-ttgdtx-signed-uat-authority-action-queue="P0-08_AUTHORITY_ACTIONS"[\s\S]*BGH, IT_DATA, KHTC[\s\S]*PHAP_CHE[\s\S]*Audit[\s\S]*TRUONG_PHONG[\s\S]*UAT-HANDOFF-03B[\s\S]*audit-ttgdtx-signed-uat-execution-routing-hub\.mjs[\s\S]*authority task routing only[\s\S]*does not execute UAT[\s\S]*accept evidence[\s\S]*approve owner GO\/NO-GO[\s\S]*mark production GO/i,
  "implementation log signed UAT authority action queue entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-02 - REAL-OPS-03 Signed UAT Closure Intake[\s\S]*HEU_REAL_OPS_03_SIGNED_UAT_CLOSURE_INTAKE_20260702\.md[\s\S]*PASS_LOCAL_UAT_CLOSURE_INTAKE[\s\S]*REAL_OPS_03_UAT_CLOSURE_READY \/ NO_GO \/ BLOCKED[\s\S]*data-ttgdtx-real-ops-03-signed-uat-closure="REAL-OPS-03_UAT_ROUTES"[\s\S]*REAL-OPS-03-UAT-01 through REAL-OPS-03-UAT-06[\s\S]*audit-ttgdtx-signed-uat-execution-routing-hub\.mjs[\s\S]*does not execute UAT[\s\S]*accept evidence[\s\S]*approve finance reliance[\s\S]*approve owner GO\/NO-GO[\s\S]*mark production GO/i,
  "implementation log REAL-OPS-03 signed UAT closure intake entry",
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
