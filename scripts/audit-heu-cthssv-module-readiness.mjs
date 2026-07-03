import { existsSync, readFileSync } from "node:fs";
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

function requireText(relativePath, pattern, label) {
  if (!existsSync(path.join(repoRoot, relativePath))) {
    return;
  }

  const contents = read(relativePath);

  if (!pattern.test(contents)) {
    fail(`${relativePath}: missing ${label}`);
  }
}

for (const file of [
  "app/cthssv/page.tsx",
  "components/layout/app-shell.tsx",
  "database/step38_user_scopes_and_handovers.sql",
  "scripts/check-heu-cthssv-local-completion.mjs",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_CTHSSV_MODULE_COMPLETION_BREAKDOWN_20260703.md",
  "docs/HEU_CTHSSV_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
  "docs/HEU_CTHSSV_CONTROLLED_EVIDENCE_TRACE_CHECKLIST_20260703.md",
  "docs/HEU_CTHSSV_FINAL_MODULE_CLOSURE_GATE_20260703.md",
  "docs/HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
  "docs/HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703.md",
  "docs/HEU_CTHSSV_PASS_LOCAL_REVIEW_DOSSIER_20260703.md",
  "docs/HEU_CTHSSV_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  "docs/HEU_CTHSSV_OWNER_SIGNOFF_MANIFEST_20260703.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "package.json",
]) {
  requireFile(file);
}

requireText(
  "app/cthssv/page.tsx",
  /(?=[\s\S]*active="cthssv")(?=[\s\S]*data-heu-cthssv-module-readiness="M06_CTHSSV")(?=[\s\S]*data-heu-cthssv-boundary="M06_CTHSSV_PASS_LOCAL_ONLY")(?=[\s\S]*CTHSSV_PROFILE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*does not approve enrollment, handover\s+reliance, evidence acceptance, finance posting, UAT acceptance,\s+owner GO\/NO-GO or production GO)/i,
  "M06 CTHSSV page boundary",
);

requireText(
  "app/cthssv/page.tsx",
  /(?=[\s\S]*\.from\("lead_handovers"\))(?=[\s\S]*leads!inner)(?=[\s\S]*\.in\("handover_type", cthssvHandoverTypes\))(?=[\s\S]*"leads\.admission_segment_id")(?=[\s\S]*handover\.accept_cthssv)(?=[\s\S]*current_user_role_code)(?=[\s\S]*has_permission)/,
  "lead handover query and permission gate",
);

requireText(
  "app/cthssv/page.tsx",
  /(?=[\s\S]*data-heu-cthssv-quick-access="M06_CTHSSV_QUICK_ACCESS")(?=[\s\S]*data-heu-cthssv-quick-access-overflow-guard="M06_CTHSSV_QUICK_ACCESS_NO_OVERFLOW")(?=[\s\S]*\/leads\?quick=documents)(?=[\s\S]*\/documents)(?=[\s\S]*\/pipeline#pipeline-document-pending)(?=[\s\S]*\/master-control)(?=[\s\S]*aria-label=\{`Mo nhanh CTHSSV: \$\{link\.label\}`\})(?=[\s\S]*title=\{`Mo nhanh CTHSSV: \$\{link\.label\}`\})/,
  "CTHSSV quick access no-overflow navigation",
);

for (const marker of [
  "data-heu-cthssv-module-completion-breakdown",
  "data-heu-cthssv-role-negative-access",
  "data-heu-cthssv-controlled-evidence-trace",
  "data-heu-cthssv-final-module-closure",
  "data-heu-cthssv-external-owner-action-queue",
  "data-heu-cthssv-signed-uat-evidence-intake",
  "data-heu-cthssv-pass-local-review-dossier",
  "data-heu-cthssv-acceptance-matrix",
  "data-heu-cthssv-decision-manifest",
  "data-heu-cthssv-owner-signoff-manifest",
  "data-heu-cthssv-uat-result-ledger",
]) {
  requireText(
    "app/cthssv/page.tsx",
    new RegExp(`${marker}": "M06_CTHSSV"`),
    `${marker} marker`,
  );
}

for (const token of [
  "CTHSSV-00",
  "CTHSSV-10",
  "CTHSSV-ROLE-01",
  "CTHSSV-ROLE-08",
  "CTHSSV-EVID-01",
  "CTHSSV-EVID-08",
  "CTHSSV-CLOSE-01",
  "CTHSSV-CLOSE-08",
  "CTHSSV-OWNER-ACTION-01",
  "CTHSSV-OWNER-ACTION-08",
  "CTHSSV-UAT-EVID-01",
  "CTHSSV-UAT-EVID-08",
  "CTHSSV-REVIEW-01",
  "CTHSSV-REVIEW-08",
  "M06-CTHSSV-01",
  "M06-CTHSSV-06",
  "M06-DEC-01",
  "M06-DEC-03",
  "M06-SIGN-01",
  "M06-SIGN-06",
  "M06-UAT-01",
  "M06-UAT-04",
]) {
  requireText("app/cthssv/page.tsx", new RegExp(token), `${token} case`);
}

requireText(
  "app/cthssv/page.tsx",
  /(?=[\s\S]*HEU_CTHSSV_MODULE_COMPLETION_BREAKDOWN_20260703\.md)(?=[\s\S]*HEU_CTHSSV_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703\.md)(?=[\s\S]*HEU_CTHSSV_CONTROLLED_EVIDENCE_TRACE_CHECKLIST_20260703\.md)(?=[\s\S]*HEU_CTHSSV_FINAL_MODULE_CLOSURE_GATE_20260703\.md)(?=[\s\S]*HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703\.md)(?=[\s\S]*HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703\.md)(?=[\s\S]*HEU_CTHSSV_PASS_LOCAL_REVIEW_DOSSIER_20260703\.md)(?=[\s\S]*HEU_CTHSSV_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md)(?=[\s\S]*HEU_CTHSSV_OWNER_SIGNOFF_MANIFEST_20260703\.md)(?=[\s\S]*CTHSSV_MODULE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_ROLE_SCOPE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_EVIDENCE_TRACE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_FINAL_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_EXTERNAL_OWNER_ACTION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_SIGNED_UAT_EVIDENCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_PASS_LOCAL_REVIEW_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_OWNER_READY \/ NO_GO \/ BLOCKED)/,
  "CTHSSV breakdown, role access, evidence trace, final closure, external owner action queue, signed UAT evidence intake, review dossier, UAT ledger and owner signoff sources on page",
);

requireText(
  "app/cthssv/page.tsx",
  /raw PII, CCCD, phone, bank data, vouchers, passwords, OTPs or credentials/i,
  "raw evidence and secret boundary",
);

requireText(
  "components/layout/app-shell.tsx",
  /(?=[\s\S]*label: "CTHSSV")(?=[\s\S]*href: "\/cthssv")(?=[\s\S]*key: "cthssv")(?=[\s\S]*permission: "handover\.accept_cthssv")(?=[\s\S]*"cthssv")/,
  "sidebar CTHSSV navigation",
);

requireText(
  "database/step38_user_scopes_and_handovers.sql",
  /(?=[\s\S]*lead_handovers)(?=[\s\S]*ADMISSION_TO_CTHSSV)(?=[\s\S]*CTHSSV_TO_ACCOUNTING)(?=[\s\S]*handover\.accept_cthssv)(?=[\s\S]*trg_lead_handovers_audit)(?=[\s\S]*can_access_lead_handover)/i,
  "existing Step38 handover/RLS/audit foundation",
);

requireText(
  "docs/HEU_CTHSSV_UAT_RESULT_LEDGER_TEMPLATE_20260703.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TEMPLATE)(?=[\s\S]*M06 CTHSSV student\/profile handover UAT and owner result ledger)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*CTHSSV_PROFILE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_HANDOVER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*No raw PII, CCCD, phone, bank data, vouchers, passwords, temporary passwords,\s+OTPs, password reset links, account activation\/invite links, service-role keys\s+or API keys)(?=[\s\S]*CTHSSV-UAT-01)(?=[\s\S]*CTHSSV-UAT-08)(?=[\s\S]*CTHSSV-DEC-01)(?=[\s\S]*CTHSSV-DEC-06)(?=[\s\S]*does not\s+execute UAT, accept evidence, approve enrollment, approve handover reliance,\s+create student finance facts, approve finance action, approve owner GO\/NO-GO or\s+mark production GO)/i,
  "CTHSSV UAT result ledger template",
);

requireText(
  "docs/HEU_CTHSSV_MODULE_COMPLETION_BREAKDOWN_20260703.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_BREAKDOWN)(?=[\s\S]*Production\/UAT status:\s*NO-GO)(?=[\s\S]*CTHSSV_MODULE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV-00)(?=[\s\S]*CTHSSV-10)(?=[\s\S]*CTHSSV-08 now has a local role\/negative-access checklist)(?=[\s\S]*CTHSSV-09 now has a local controlled evidence\/audit trace checklist)(?=[\s\S]*CTHSSV-10 now has a local final module closure gate)(?=[\s\S]*CTHSSV_ROLE_SCOPE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_EVIDENCE_TRACE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_FINAL_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_SIGNED_UAT_EVIDENCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*HEU_CTHSSV_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703\.md)(?=[\s\S]*HEU_CTHSSV_CONTROLLED_EVIDENCE_TRACE_CHECKLIST_20260703\.md)(?=[\s\S]*HEU_CTHSSV_FINAL_MODULE_CLOSURE_GATE_20260703\.md)(?=[\s\S]*HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703\.md)(?=[\s\S]*HEU_CTHSSV_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md)(?=[\s\S]*HEU_CTHSSV_OWNER_SIGNOFF_MANIFEST_20260703\.md)(?=[\s\S]*npm\.cmd run check:heu-cthssv-local-completion)(?=[\s\S]*npm\.cmd run audit:heu-cthssv-module-readiness)(?=[\s\S]*does not approve enrollment, student-state reliance, evidence\s+acceptance, finance posting, UAT acceptance, owner GO\/NO-GO or production GO)/i,
  "CTHSSV module completion breakdown",
);

requireText(
  "docs/HEU_CTHSSV_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_CHECKLIST)(?=[\s\S]*CTHSSV-08 role scope and negative-access proof)(?=[\s\S]*Production\/UAT status:\s*NO-GO)(?=[\s\S]*CTHSSV_ROLE_SCOPE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV-ROLE-01)(?=[\s\S]*CTHSSV-ROLE-08)(?=[\s\S]*OUT_OF_SCOPE_NEGATIVE_USER)(?=[\s\S]*ALLOW_SCOPED, READ_ONLY_REVIEW, DENY or BLOCKED)(?=[\s\S]*does not grant\s+access, change role scope, create accounts, execute UAT, accept evidence,\s+approve enrollment, approve handover reliance, approve finance action, approve\s+owner GO\/NO-GO or mark production GO)/i,
  "CTHSSV role and negative access checklist",
);

requireText(
  "docs/HEU_CTHSSV_CONTROLLED_EVIDENCE_TRACE_CHECKLIST_20260703.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_TRACE)(?=[\s\S]*CTHSSV-09 audit and controlled evidence trace)(?=[\s\S]*Production\/UAT status:\s*NO-GO)(?=[\s\S]*CTHSSV_EVIDENCE_TRACE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_SIGNED_UAT_EVIDENCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV-EVID-01)(?=[\s\S]*CTHSSV-EVID-08)(?=[\s\S]*HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703\.md)(?=[\s\S]*HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\.md)(?=[\s\S]*P0-10-ACCEPT-02)(?=[\s\S]*P0-10-ACCEPT-05)(?=[\s\S]*does not execute UAT, accept evidence,\s+approve enrollment, approve handover reliance, create student finance facts,\s+approve finance action, approve owner GO\/NO-GO or mark production GO)/i,
  "CTHSSV controlled evidence trace checklist",
);

requireText(
  "docs/HEU_CTHSSV_FINAL_MODULE_CLOSURE_GATE_20260703.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_GATE)(?=[\s\S]*CTHSSV-10 final module closure gate)(?=[\s\S]*Production\/UAT status:\s*NO-GO)(?=[\s\S]*CTHSSV_FINAL_CLOSURE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_MODULE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_SIGNED_UAT_EVIDENCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV-CLOSE-01)(?=[\s\S]*CTHSSV-CLOSE-08)(?=[\s\S]*CTHSSV-00 through CTHSSV-10)(?=[\s\S]*CTHSSV-UAT-01 through CTHSSV-UAT-08)(?=[\s\S]*CTHSSV-UAT-EVID-01 through CTHSSV-UAT-EVID-08)(?=[\s\S]*CTHSSV-SIGN-01 through CTHSSV-SIGN-06)(?=[\s\S]*CTHSSV-ROLE-01 through CTHSSV-ROLE-08)(?=[\s\S]*CTHSSV-EVID-01 through CTHSSV-EVID-08)(?=[\s\S]*npm\.cmd run check:heu-cthssv-local-completion)(?=[\s\S]*does\s+not execute UAT, accept evidence,\s+approve enrollment, approve handover reliance,\s+create student finance facts, approve finance action, approve owner GO\/NO-GO\s+or mark production GO)/i,
  "CTHSSV final module closure gate",
);

requireText(
  "docs/HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_OWNER_ACTION_QUEUE)(?=[\s\S]*Decision lane:\s*CTHSSV_EXTERNAL_OWNER_ACTION_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Production\/UAT status:\s*NO-GO)(?=[\s\S]*CTHSSV-OWNER-ACTION-01)(?=[\s\S]*CTHSSV-OWNER-ACTION-08)(?=[\s\S]*signed CTHSSV owner UAT)(?=[\s\S]*signed role\/negative-access UAT)(?=[\s\S]*controlled evidence\/audit trace)(?=[\s\S]*signed UAT evidence intake refs)(?=[\s\S]*finance gate preservation proof)(?=[\s\S]*final owner quorum GO\/NO-GO)(?=[\s\S]*does\s+not execute UAT, accept\s+evidence, approve enrollment, approve handover reliance, create student finance\s+facts, approve finance action, approve owner GO\/NO-GO or mark production GO)/i,
  "CTHSSV external owner action queue",
);

requireText(
  "docs/HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_EVIDENCE_INTAKE)(?=[\s\S]*Decision lane:\s*CTHSSV_SIGNED_UAT_EVIDENCE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Production\/UAT status:\s*NO-GO)(?=[\s\S]*CTHSSV-UAT-EVID-01)(?=[\s\S]*CTHSSV-UAT-EVID-08)(?=[\s\S]*evidence_ref)(?=[\s\S]*storage_class)(?=[\s\S]*owner_lane)(?=[\s\S]*linked_uat_case)(?=[\s\S]*linked_owner_action)(?=[\s\S]*linked_review_item)(?=[\s\S]*route_or_artifact)(?=[\s\S]*redaction_reviewer)(?=[\s\S]*signed_date)(?=[\s\S]*blocker_state)(?=[\s\S]*Forbidden content boundary)(?=[\s\S]*does not execute UAT, accept evidence,\s+approve enrollment, approve handover reliance, create student finance facts,\s+approve finance action, approve owner GO\/NO-GO or mark production GO)/i,
  "CTHSSV signed UAT evidence intake",
);

requireText(
  "docs/HEU_CTHSSV_PASS_LOCAL_REVIEW_DOSSIER_20260703.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_REVIEW_DOSSIER)(?=[\s\S]*Decision lane:\s*CTHSSV_PASS_LOCAL_REVIEW_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*Production\/UAT status:\s*NO-GO)(?=[\s\S]*CTHSSV-REVIEW-01)(?=[\s\S]*CTHSSV-REVIEW-08)(?=[\s\S]*CTHSSV_LOCAL_COMPLETION_READY: PASS_LOCAL)(?=[\s\S]*CTHSSV_REAL_OPERATION_READY: NO_GO)(?=[\s\S]*CTHSSV-UAT-EVID-01 through CTHSSV-UAT-EVID-08)(?=[\s\S]*CTHSSV-OWNER-ACTION-01 through CTHSSV-OWNER-ACTION-08)(?=[\s\S]*does not execute UAT, accept evidence,\s+approve enrollment, approve handover reliance, create student finance facts,\s+approve finance action, approve owner GO\/NO-GO or mark production GO)/i,
  "CTHSSV PASS_LOCAL review dossier",
);

requireText(
  "scripts/check-heu-cthssv-local-completion.mjs",
  /(?=[\s\S]*CTHSSV_LOCAL_COMPLETION_READY: PASS_LOCAL)(?=[\s\S]*CTHSSV_REAL_OPERATION_READY: NO_GO)(?=[\s\S]*HEU_CTHSSV_WORKTREE_SCOPE)(?=[\s\S]*audit:heu-cthssv-module-readiness)(?=[\s\S]*audit:heu-lead-handover-policy)(?=[\s\S]*audit:heu-lead-lifecycle-handover-uat-pack)(?=[\s\S]*audit:heu-role-scope-uat-pack)(?=[\s\S]*audit:heu-controlled-evidence-redaction-pack)(?=[\s\S]*audit:heu-current-state-inventory)(?=[\s\S]*audit:heu-implementation-log)(?=[\s\S]*audit:ttgdtx-release-gates)(?=[\s\S]*--runtime)(?=[\s\S]*No UAT execution, evidence acceptance, enrollment approval, handover reliance approval, finance action, owner GO\/NO-GO or production GO)/i,
  "CTHSSV local completion gate script",
);

requireText(
  "docs/HEU_CTHSSV_OWNER_SIGNOFF_MANIFEST_20260703.md",
  /(?=[\s\S]*Status:\s*PASS_LOCAL_MANIFEST)(?=[\s\S]*M06 CTHSSV owner signoff control for student\/profile handover reliance)(?=[\s\S]*Production status:\s*NO-GO)(?=[\s\S]*CTHSSV_OWNER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_PROFILE_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_HANDOVER_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV_UAT_RESULT_READY \/ NO_GO \/ BLOCKED)(?=[\s\S]*CTHSSV-SIGN-01)(?=[\s\S]*CTHSSV-SIGN-06)(?=[\s\S]*CTHSSV-UAT-01 through CTHSSV-UAT-08)(?=[\s\S]*does not execute UAT, accept\s+evidence, approve enrollment, approve handover reliance, create student finance\s+facts, approve finance action, approve owner GO\/NO-GO or mark production GO)/i,
  "CTHSSV owner signoff manifest",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /M06 CTHSSV[\s\S]*\/cthssv[\s\S]*HEU_CTHSSV_MODULE_COMPLETION_BREAKDOWN_20260703\.md[\s\S]*HEU_CTHSSV_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703\.md[\s\S]*HEU_CTHSSV_CONTROLLED_EVIDENCE_TRACE_CHECKLIST_20260703\.md[\s\S]*HEU_CTHSSV_FINAL_MODULE_CLOSURE_GATE_20260703\.md[\s\S]*HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703\.md[\s\S]*HEU_CTHSSV_PASS_LOCAL_REVIEW_DOSSIER_20260703\.md[\s\S]*HEU_CTHSSV_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*HEU_CTHSSV_OWNER_SIGNOFF_MANIFEST_20260703\.md[\s\S]*M06_CTHSSV[\s\S]*CTHSSV_MODULE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_ROLE_SCOPE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_EVIDENCE_TRACE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_FINAL_CLOSURE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_EXTERNAL_OWNER_ACTION_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_PASS_LOCAL_REVIEW_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_PROFILE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*npm\.cmd run check:heu-cthssv-local-completion[\s\S]*signed CTHSSV owner UAT, controlled evidence\/audit trace, external owner action queue, final owner quorum and handover reliance still required/i,
  "current-state M06 CTHSSV cockpit",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  /M06 CTHSSV signed UAT evidence intake guard[\s\S]*HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703\.md[\s\S]*CTHSSV-UAT-EVID-01 through CTHSSV-UAT-EVID-08[\s\S]*CTHSSV_SIGNED_UAT_EVIDENCE_READY \/ NO_GO \/ BLOCKED[\s\S]*data-heu-cthssv-signed-uat-evidence-intake="M06_CTHSSV"[\s\S]*npm\.cmd run check:heu-cthssv-local-completion[\s\S]*does not execute UAT, accept evidence, approve enrollment, approve handover reliance, approve finance action, approve owner GO\/NO-GO or mark production GO/i,
  "current-state CTHSSV signed UAT evidence intake guard",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P3-02[\s\S]*HEU_CTHSSV_MODULE_COMPLETION_BREAKDOWN_20260703\.md[\s\S]*HEU_CTHSSV_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703\.md[\s\S]*HEU_CTHSSV_CONTROLLED_EVIDENCE_TRACE_CHECKLIST_20260703\.md[\s\S]*HEU_CTHSSV_FINAL_MODULE_CLOSURE_GATE_20260703\.md[\s\S]*HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703\.md[\s\S]*HEU_CTHSSV_PASS_LOCAL_REVIEW_DOSSIER_20260703\.md[\s\S]*HEU_CTHSSV_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*HEU_CTHSSV_OWNER_SIGNOFF_MANIFEST_20260703\.md[\s\S]*\/cthssv[\s\S]*M06 CTHSSV cockpit[\s\S]*M06_CTHSSV[\s\S]*CTHSSV_MODULE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_ROLE_SCOPE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_EVIDENCE_TRACE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_FINAL_CLOSURE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_EXTERNAL_OWNER_ACTION_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_PASS_LOCAL_REVIEW_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-cthssv-module-readiness[\s\S]*check:heu-cthssv-local-completion[\s\S]*signed role-scope UAT and handover decision still required[\s\S]*signed controlled evidence\/audit trace still required[\s\S]*signed final module closure still required[\s\S]*external owner action queue still required[\s\S]*CTHSSV owner UAT still required/i,
  "backlog P3-02 M06 CTHSSV cockpit",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  /P3-02E[\s\S]*CTHSSV signed UAT evidence intake[\s\S]*PASS_LOCAL_EVIDENCE_INTAKE[\s\S]*HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703\.md[\s\S]*CTHSSV-UAT-EVID-01 through CTHSSV-UAT-EVID-08[\s\S]*CTHSSV_SIGNED_UAT_EVIDENCE_READY \/ NO_GO \/ BLOCKED[\s\S]*data-heu-cthssv-signed-uat-evidence-intake="M06_CTHSSV"[\s\S]*audit:heu-cthssv-module-readiness[\s\S]*check:heu-cthssv-local-completion[\s\S]*does not execute UAT, accept evidence, approve enrollment, approve handover reliance, create student finance facts, approve finance action, approve owner GO\/NO-GO or mark production GO/i,
  "backlog P3-02E CTHSSV signed UAT evidence intake",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /M06 CTHSSV Module[\s\S]*\/cthssv[\s\S]*HEU_CTHSSV_MODULE_COMPLETION_BREAKDOWN_20260703\.md[\s\S]*HEU_CTHSSV_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703\.md[\s\S]*HEU_CTHSSV_CONTROLLED_EVIDENCE_TRACE_CHECKLIST_20260703\.md[\s\S]*HEU_CTHSSV_FINAL_MODULE_CLOSURE_GATE_20260703\.md[\s\S]*HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703\.md[\s\S]*HEU_CTHSSV_PASS_LOCAL_REVIEW_DOSSIER_20260703\.md[\s\S]*HEU_CTHSSV_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*HEU_CTHSSV_OWNER_SIGNOFF_MANIFEST_20260703\.md[\s\S]*CTHSSV_MODULE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_ROLE_SCOPE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_EVIDENCE_TRACE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_FINAL_CLOSURE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_EXTERNAL_OWNER_ACTION_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_PASS_LOCAL_REVIEW_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_PROFILE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*check:heu-cthssv-local-completion[\s\S]*Signed CTHSSV owner UAT, controlled evidence\/audit trace, external owner action queue, final owner quorum and handover reliance decision/i,
  "module readiness gap matrix M06 CTHSSV",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  /M06 CTHSSV signed UAT evidence intake[\s\S]*HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703\.md[\s\S]*data-heu-cthssv-signed-uat-evidence-intake="M06_CTHSSV"[\s\S]*CTHSSV-UAT-EVID-01 through CTHSSV-UAT-EVID-08[\s\S]*CTHSSV_SIGNED_UAT_EVIDENCE_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-cthssv-module-readiness[\s\S]*check:heu-cthssv-local-completion[\s\S]*Signed UAT evidence packages, redaction reviewer, role\/negative-access proof, finance gate proof, owner signoff linkage and final owner quorum evidence outside Git\/Codex\/chat/i,
  "module readiness gap matrix CTHSSV signed UAT evidence intake",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /Lead-to-student handover guard[\s\S]*HEU_CTHSSV_MODULE_COMPLETION_BREAKDOWN_20260703\.md[\s\S]*HEU_CTHSSV_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703\.md[\s\S]*HEU_CTHSSV_CONTROLLED_EVIDENCE_TRACE_CHECKLIST_20260703\.md[\s\S]*HEU_CTHSSV_FINAL_MODULE_CLOSURE_GATE_20260703\.md[\s\S]*HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703\.md[\s\S]*HEU_CTHSSV_PASS_LOCAL_REVIEW_DOSSIER_20260703\.md[\s\S]*HEU_CTHSSV_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*HEU_CTHSSV_OWNER_SIGNOFF_MANIFEST_20260703\.md[\s\S]*\/cthssv[\s\S]*CTHSSV-00 through CTHSSV-10[\s\S]*CTHSSV-ROLE-01 through CTHSSV-ROLE-08[\s\S]*CTHSSV-EVID-01 through CTHSSV-EVID-08[\s\S]*CTHSSV-CLOSE-01 through CTHSSV-CLOSE-08[\s\S]*CTHSSV-OWNER-ACTION-01 through CTHSSV-OWNER-ACTION-08[\s\S]*CTHSSV-REVIEW-01 through CTHSSV-REVIEW-08[\s\S]*CTHSSV-SIGN-01 through CTHSSV-SIGN-06[\s\S]*CTHSSV_MODULE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_ROLE_SCOPE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_EVIDENCE_TRACE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_FINAL_CLOSURE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_EXTERNAL_OWNER_ACTION_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_PASS_LOCAL_REVIEW_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*audit:heu-cthssv-module-readiness[\s\S]*check:heu-cthssv-local-completion[\s\S]*signed CTHSSV owner UAT[\s\S]*signed role\/negative-access UAT[\s\S]*signed controlled evidence\/audit trace[\s\S]*signed final module closure[\s\S]*external owner action queue closure[\s\S]*signed owner signoff manifest[\s\S]*signed UAT and handover decision still required/i,
  "production checklist CTHSSV UAT ledger boundary",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  /CTHSSV signed UAT evidence intake[\s\S]*PASS_LOCAL_EVIDENCE_INTAKE[\s\S]*HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703\.md[\s\S]*CTHSSV-UAT-EVID-01 through CTHSSV-UAT-EVID-08[\s\S]*CTHSSV_SIGNED_UAT_EVIDENCE_READY \/ NO_GO \/ BLOCKED[\s\S]*data-heu-cthssv-signed-uat-evidence-intake="M06_CTHSSV"[\s\S]*audit:heu-cthssv-module-readiness[\s\S]*check:heu-cthssv-local-completion[\s\S]*no UAT execution, evidence acceptance, enrollment approval, handover reliance, finance action, owner GO\/NO-GO or production GO/i,
  "production checklist CTHSSV signed UAT evidence intake boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - M06 CTHSSV External Owner Action Queue[\s\S]*docs\/HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703\.md[\s\S]*CTHSSV-OWNER-ACTION-01 through CTHSSV-OWNER-ACTION-08[\s\S]*CTHSSV_EXTERNAL_OWNER_ACTION_READY \/ NO_GO \/ BLOCKED[\s\S]*does not execute UAT, accept evidence, approve enrollment, approve handover reliance, create student finance facts, approve finance action, approve owner GO\/NO-GO or mark production GO/i,
  "implementation log CTHSSV external owner action queue boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - M06 CTHSSV Signed UAT Evidence Intake[\s\S]*docs\/HEU_CTHSSV_SIGNED_UAT_EVIDENCE_INTAKE_20260703\.md[\s\S]*CTHSSV-UAT-EVID-01 through CTHSSV-UAT-EVID-08[\s\S]*CTHSSV_SIGNED_UAT_EVIDENCE_READY \/ NO_GO \/ BLOCKED[\s\S]*does not execute UAT, accept evidence, approve enrollment, approve handover reliance, create student finance facts, approve finance action, approve owner GO\/NO-GO or mark production GO/i,
  "implementation log CTHSSV signed UAT evidence intake boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - M06 CTHSSV PASS_LOCAL Review Dossier[\s\S]*docs\/HEU_CTHSSV_PASS_LOCAL_REVIEW_DOSSIER_20260703\.md[\s\S]*CTHSSV-REVIEW-01 through CTHSSV-REVIEW-08[\s\S]*CTHSSV_PASS_LOCAL_REVIEW_READY \/ NO_GO \/ BLOCKED[\s\S]*does not execute UAT, accept evidence, approve enrollment, approve handover reliance, create student finance facts, approve finance action, approve owner GO\/NO-GO or mark production GO/i,
  "implementation log CTHSSV PASS_LOCAL review dossier boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - M06 CTHSSV Cockpit Readiness[\s\S]*app\/cthssv\/page\.tsx[\s\S]*components\/layout\/app-shell\.tsx[\s\S]*scripts\/audit-heu-cthssv-module-readiness\.mjs[\s\S]*M06_CTHSSV[\s\S]*CTHSSV_PROFILE_READY \/ NO_GO \/ BLOCKED[\s\S]*CTHSSV_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*does not execute UAT, accept evidence, approve enrollment, approve finance action, approve owner GO\/NO-GO or mark production GO/i,
  "implementation log CTHSSV cockpit boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - M06 CTHSSV UAT Result Ledger Template[\s\S]*docs\/HEU_CTHSSV_UAT_RESULT_LEDGER_TEMPLATE_20260703\.md[\s\S]*CTHSSV-UAT-01 through CTHSSV-UAT-08[\s\S]*CTHSSV-DEC-01 through[\s\S]*CTHSSV-DEC-06[\s\S]*CTHSSV_UAT_RESULT_READY \/ NO_GO \/ BLOCKED[\s\S]*does not execute UAT, accept evidence, approve enrollment, approve handover reliance, create student finance facts, approve finance action, approve owner GO\/NO-GO or mark production GO/i,
  "implementation log CTHSSV UAT ledger template boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - M06 CTHSSV Owner Signoff Manifest[\s\S]*docs\/HEU_CTHSSV_OWNER_SIGNOFF_MANIFEST_20260703\.md[\s\S]*CTHSSV-SIGN-01 through CTHSSV-SIGN-06[\s\S]*CTHSSV_OWNER_READY \/ NO_GO \/ BLOCKED[\s\S]*does not execute UAT, accept evidence, approve enrollment, approve handover reliance, create student finance facts, approve finance action, approve owner GO\/NO-GO or mark production GO/i,
  "implementation log CTHSSV owner signoff manifest boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - M06 CTHSSV Module Completion Breakdown[\s\S]*docs\/HEU_CTHSSV_MODULE_COMPLETION_BREAKDOWN_20260703\.md[\s\S]*CTHSSV-00 through CTHSSV-10[\s\S]*CTHSSV_MODULE_READY \/ NO_GO \/ BLOCKED[\s\S]*does not approve enrollment, student-state reliance, evidence acceptance, finance posting, UAT acceptance, owner GO\/NO-GO or production GO/i,
  "implementation log CTHSSV module completion breakdown boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - M06 CTHSSV Role Negative Access Checklist[\s\S]*docs\/HEU_CTHSSV_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703\.md[\s\S]*CTHSSV-ROLE-01 through CTHSSV-ROLE-08[\s\S]*CTHSSV_ROLE_SCOPE_READY \/ NO_GO \/ BLOCKED[\s\S]*does not grant access, change role scope, create accounts, execute UAT, accept evidence, approve enrollment, approve handover reliance, approve finance action, approve owner GO\/NO-GO or mark production GO/i,
  "implementation log CTHSSV role negative access checklist boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - M06 CTHSSV Controlled Evidence Trace Checklist[\s\S]*docs\/HEU_CTHSSV_CONTROLLED_EVIDENCE_TRACE_CHECKLIST_20260703\.md[\s\S]*CTHSSV-EVID-01 through CTHSSV-EVID-08[\s\S]*CTHSSV_EVIDENCE_TRACE_READY \/ NO_GO \/ BLOCKED[\s\S]*does not execute UAT, accept evidence, approve enrollment, approve handover reliance, approve finance action, approve owner GO\/NO-GO or mark production GO/i,
  "implementation log CTHSSV controlled evidence trace checklist boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - M06 CTHSSV Final Module Closure Gate[\s\S]*docs\/HEU_CTHSSV_FINAL_MODULE_CLOSURE_GATE_20260703\.md[\s\S]*CTHSSV-CLOSE-01 through CTHSSV-CLOSE-08[\s\S]*CTHSSV_FINAL_CLOSURE_READY \/ NO_GO \/ BLOCKED[\s\S]*does not execute UAT, accept evidence, approve enrollment, approve handover reliance, approve finance action, approve owner GO\/NO-GO or mark production GO/i,
  "implementation log CTHSSV final module closure gate boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  /## 2026-07-03 - M06 CTHSSV Local Completion Gate[\s\S]*scripts\/check-heu-cthssv-local-completion\.mjs[\s\S]*CTHSSV_LOCAL_COMPLETION_READY: PASS_LOCAL[\s\S]*CTHSSV_REAL_OPERATION_READY: NO_GO[\s\S]*does not execute UAT, accept evidence, approve enrollment, approve handover reliance, approve finance action, approve owner GO\/NO-GO or mark production GO/i,
  "implementation log CTHSSV local completion gate boundary",
);

const packageJson = JSON.parse(read("package.json"));

if (
  packageJson.scripts?.["audit:heu-cthssv-module-readiness"] !==
  "node scripts/audit-heu-cthssv-module-readiness.mjs"
) {
  fail("package.json: missing audit:heu-cthssv-module-readiness script");
}

if (
  packageJson.scripts?.["check:heu-cthssv-local-completion"] !==
  "node scripts/check-heu-cthssv-local-completion.mjs"
) {
  fail("package.json: missing check:heu-cthssv-local-completion script");
}

if (failures.length > 0) {
  console.error("HEU CTHSSV module readiness audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "HEU CTHSSV module readiness audit passed. M06 cockpit is PASS_LOCAL only.",
);
