import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

const failures = [];

function fail(message) {
  failures.push(message);
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function literalPattern(source, flags = "") {
  return { kind: "literalPattern", source, flags };
}

function unescapePatternPart(part) {
  return part
    .replace(/\\\\u([0-9a-fA-F]{4})/g, "\\u$1")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    )
    .replace(/\\([/\\.^$*+?()[\]{}|`-])/g, "$1")
    .replace(/\(\?:?/g, "")
    .replace(/[()]/g, "")
    .replace(/\[[^\]]+\][+*?]?/g, "")
    .trim();
}

function patternParts(raw) {
  return raw
    .split(/\\s[+*]?|\[\\s\\S\]\*/)
    .map(unescapePatternPart)
    .filter((part) => part.length > 0);
}

function hasPartsInOrder(contents, parts, startIndex = 0, ignoreCase = false) {
  const haystack = ignoreCase ? contents.toLowerCase() : contents;
  let cursor = startIndex;
  for (const part of parts) {
    const needle = ignoreCase ? part.toLowerCase() : part;
    const index = haystack.indexOf(needle, cursor);
    if (index === -1) {
      return false;
    }
    cursor = index + needle.length;
  }
  return true;
}

function extractLookaheadBodies(source) {
  const prefix = "(?=[\\s\\S]*";
  const bodies = [];
  let cursor = 0;

  while (cursor < source.length) {
    const start = source.indexOf(prefix, cursor);
    if (start === -1) {
      break;
    }

    let index = start + prefix.length;
    const bodyStart = index;
    let depth = 0;
    let inClass = false;

    while (index < source.length) {
      const ch = source[index];
      if (ch === "\\") {
        index += 2;
        continue;
      }
      if (ch === "[") {
        inClass = true;
      } else if (ch === "]") {
        inClass = false;
      } else if (!inClass && ch === "(") {
        depth += 1;
      } else if (!inClass && ch === ")") {
        if (depth === 0) {
          bodies.push(source.slice(bodyStart, index));
          cursor = index + 1;
          break;
        }
        depth -= 1;
      }
      index += 1;
    }

    if (index >= source.length) {
      break;
    }
  }

  return bodies;
}

function bodyNeedsRegex(body) {
  return (
    body.includes("|") ||
    body.includes("(?:") ||
    body.includes("\\(") ||
    body.includes("\\)") ||
    body.includes("?")
  );
}

function tokenPatternMatches(contents, source, flags = "") {
  const ignoreCase = flags.includes("i");
  const lookaheadBodies = extractLookaheadBodies(source);
  if (lookaheadBodies.length > 0) {
    return lookaheadBodies.every((body) => {
      if (body.length < 240 && bodyNeedsRegex(body)) {
        return new RegExp(body, flags).test(contents);
      }
      return hasPartsInOrder(contents, patternParts(body), 0, ignoreCase);
    });
  }

  const orderedParts = patternParts(source);
  if (orderedParts.length === 0) {
    return true;
  }
  return hasPartsInOrder(contents, orderedParts, 0, ignoreCase);
}

function literalPatternMatches(contents, pattern) {
  if (
    pattern.source.length < 700 &&
    !pattern.source.includes("(?=[\\s\\S]*")
  ) {
    return new RegExp(pattern.source, pattern.flags).test(contents);
  }
  return tokenPatternMatches(contents, pattern.source, pattern.flags);
}

function requireText(relativePath, pattern, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  if (pattern?.kind === "literalPattern") {
    if (!literalPatternMatches(contents, pattern)) {
      fail(`${relativePath}: missing ${label}`);
    }
    return;
  }

  if (!pattern.test(contents)) {
    fail(`${relativePath}: missing ${label}`);
  }
}

function requireAllText(relativePath, tokens, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  for (const token of tokens) {
    if (!contents.includes(token)) {
      fail(`${relativePath}: missing ${label}: ${token}`);
    }
  }
}

function requireSectionTokens(relativePath, heading, tokens, label) {
  if (!exists(relativePath)) {
    return;
  }

  const contents = read(relativePath);
  const marker = `## ${heading}`;
  const start = contents.indexOf(marker);
  if (start === -1) {
    fail(`${relativePath}: missing ${label}: ${marker}`);
    return;
  }

  const next = contents.indexOf("\n## ", start + marker.length);
  const section = next === -1 ? contents.slice(start) : contents.slice(start, next);
  for (const token of tokens) {
    if (!section.includes(token)) {
      fail(`${relativePath}: missing ${label}: ${token}`);
    }
  }
}

const requiredFiles = [
  "docs/MIGRATION_ORDER_AUDIT.md",
  "docs/HARD_DELETE_AUDIT.md",
  "docs/STEP109_ROLE_PERMISSION_UAT_RUNBOOK.md",
  "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
  "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md",
  "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md",
  "docs/TTGDTX_AUDIT_LOG_UAT_RUNBOOK.md",
  "docs/TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627.md",
  "docs/STEP90_STEP110_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  "docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md",
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  "docs/HEU_REAL_OPS_01_BACKUP_RESTORE_PROOF_INTAKE_20260702.md",
  "docs/HEU_REAL_OPS_02_SIGNED_MIGRATION_ORDER_INTAKE_20260702.md",
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  "docs/TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md",
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  "docs/HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  "docs/HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628.md",
  "docs/HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702.md",
  "docs/HEU_CLOUD_AGENT_OPERATING_PLAN_20260702.md",
  "docs/HEU_MASTER_CONTROL_GOAL_REGISTER_20260702.md",
  "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md",
  "docs/HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702.md",
  "docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_DATA_MASTER_P0_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_DATA_DICTIONARY_MIN_20260627_V01_DRAFT.md",
  "docs/HEU_SOP_TO_DATA_MAPPING_20260627_V01_DRAFT.md",
  "docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  "docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md",
  "docs/HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT.md",
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT.md",
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  "docs/HEU_DATA_MODEL_V1.md",
  "docs/HEU_DATA_DICTIONARY_V1.md",
  "docs/GIT_CLEANUP_ANALYSIS.md",
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  "docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md",
  "docs/HEU_ROLE_PERMISSION_MATRIX_V1.md",
  "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md",
  "docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md",
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
  "docs/HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md",
  "docs/HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
  "docs/HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
  "docs/HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
  "docs/HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
  "docs/HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
  "docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  "docs/HEU_REAL_OPS_03_SIGNED_UAT_CLOSURE_INTAKE_20260702.md",
  "docs/HEU_CODEX_OPERATING_PLAYBOOK.md",
  "docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md",
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  "docs/HEU_IMPLEMENTATION_LOG.md",
  ".github/workflows/heu-pass-local.yml",
  "app/reports/page.tsx",
  "app/ttgdtx/payment-requests/pay/actions.ts",
  "app/ttgdtx/payment-requests/pay/page.tsx",
  "docs/TTGDTX_LINKED_OPERATING_REVIEW_20260625.md",
  "docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md",
  "docs/TTGDTX_PROCESS_CODE_MAP_20260625.md",
  "docs/TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627.md",
  "docs/TTGDTX_BANK_RECEIPT_BATCH_POLICY_20260627.md",
  "docs/TTGDTX_PERIOD_LOCK_ADJUSTMENT_POLICY_20260627.md",
  "docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md",
  "docs/HEU_LEAD_LIFECYCLE_STANDARD_20260627.md",
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  "docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md",
  "docs/TTGDTX_CONTRACT_TUITION_MASTER_GUARD_20260627.md",
  "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
  "docs/P2_13_RECONCILIATION_REPAIR_SAFETY_UAT_RUNBOOK.md",
  "docs/TTGDTX_LEAD_QUICK_FIX_UAT_RUNBOOK.md",
  "docs/TTGDTX_SYNTHETIC_REAL_LIKE_UAT_PACK_20260627.md",
  "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md",
  "fixtures/ttgdtx/synthetic_real_like_uat_pack_20260627.json",
  "components/audit/controlled-evidence-redaction-guard.tsx",
  "components/audit/hard-delete-boundary-guard.tsx",
  "components/audit/hard-delete-conversion-decision-queue.tsx",
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  "components/audit/ttgdtx-audit-log-uat-evidence-checklist.tsx",
  "components/audit/ttgdtx-audit-trail-guard.tsx",
  "components/ai/ai-risk-suggestion-board.tsx",
  "components/ai/ai-task-checklist-generator.tsx",
  "components/finance/finance-day-one-accountant-handoff.tsx",
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
  "components/hou/hou-ledger-handover-gap-pack.tsx",
  "components/reports/report-view-source-map-panel.tsx",
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  "components/reports/data-master-report-view-bridge-panel.tsx",
  "components/master-control/production-readiness-blocker-summary.tsx",
  "components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx",
  "components/ttgdtx/ttgdtx-dashboard-readonly-guard.tsx",
  "components/ttgdtx/ttgdtx-dashboard-source-reconciliation-checklist.tsx",
  "components/ttgdtx/ttgdtx-dashboard-uat-evidence-checklist.tsx",
  "components/ttgdtx/ttgdtx-operating-control-strip.tsx",
  "components/ttgdtx/ttgdtx-process-quick-finder.tsx",
  "components/ttgdtx/ttgdtx-account-control-scope-guard.tsx",
  "components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx",
  "components/ttgdtx/ttgdtx-contract-tuition-master-guard.tsx",
  "components/ttgdtx/ttgdtx-p019-gate-guard.tsx",
  "components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx",
  "components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx",
  "components/ttgdtx/ttgdtx-payment-approval-separation-guard.tsx",
  "components/ttgdtx/ttgdtx-payout-duplicate-guard.tsx",
  "components/ttgdtx/ttgdtx-payout-execution-readiness-checklist.tsx",
  "components/ttgdtx/ttgdtx-payout-uat-evidence-checklist.tsx",
  "components/ttgdtx/ttgdtx-production-evidence-binder.tsx",
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  "components/ttgdtx/ttgdtx-production-readiness-guard.tsx",
  "components/ttgdtx/ttgdtx-signed-uat-execution-routing-hub.tsx",
  "components/ttgdtx/ttgdtx-uat-signoff-guard.tsx",
  "components/leads/lead-lifecycle-guard.tsx",
  "components/leads/lead-handover-panel.tsx",
  "components/settings/supabase-backup-restore-guard.tsx",
  "components/settings/user-create-form.tsx",
  "components/settings/real-user-onboarding-panel.tsx",
  "components/settings/user-scope-enforcement-panel.tsx",
  "app/settings/actions.ts",
  "app/settings/page.tsx",
  "app/settings/scopes/page.tsx",
  "app/finance-desk/page.tsx",
  "database/step111_heu_finance_desk.sql",
  "lib/lead-lifecycle.ts",
  "lib/production-readiness.ts",
  "lib/ttgdtx-invoice-policy.ts",
  "lib/ttgdtx-operating-controls.ts",
  "lib/ttgdtx-process-labels.ts",
  "lib/vnd-money.ts",
  "scripts/audit-heu-backlog-codes.mjs",
  "scripts/audit-heu-bgh-dashboard-spec.mjs",
  "scripts/audit-heu-controlled-evidence-redaction-pack.mjs",
  "scripts/audit-heu-current-state-inventory.mjs",
  "scripts/audit-heu-data-foundation.mjs",
  "scripts/audit-heu-finance-advance-payment-shell.mjs",
  "scripts/audit-heu-finance-desk.mjs",
  "scripts/audit-heu-final-handoff-coverage.mjs",
  "scripts/audit-heu-git-hygiene.mjs",
  "scripts/audit-heu-hou-ledger-handover-gap-pack.mjs",
  "scripts/audit-heu-implementation-log.mjs",
  "scripts/audit-heu-user-account-security.mjs",
  "scripts/audit-heu-ai-policy.mjs",
  "scripts/audit-heu-lead-handover-policy.mjs",
  "scripts/audit-heu-lead-lifecycle-handover-uat-pack.mjs",
  "scripts/audit-heu-lead-lifecycle-standard.mjs",
  "scripts/audit-heu-non-ttgdtx-cascade-review.mjs",
  "scripts/audit-heu-p0-register-pack.mjs",
  "scripts/audit-heu-production-blocker-source.mjs",
  "scripts/audit-heu-production-evidence-binder.mjs",
  "scripts/audit-heu-role-scope-uat-pack.mjs",
  "scripts/audit-heu-short-course-attendance-payment-gap-pack.mjs",
  "scripts/audit-heu-sql-object-master-map.mjs",
  "scripts/audit-heu-vietnamese-text-encoding.mjs",
  "scripts/audit-hard-delete-boundary-guard.mjs",
  "scripts/audit-hard-delete-conversion-decision-queue.mjs",
  "scripts/audit-ttgdtx-account-control-scope-decision.mjs",
  "scripts/audit-ttgdtx-audit-trail-guard.mjs",
  "scripts/audit-ttgdtx-backup-restore-dry-run-pack.mjs",
  "scripts/audit-ttgdtx-accounting-dashboard-uat-plan.mjs",
  "scripts/audit-ttgdtx-contract-tuition-master-guard.mjs",
  "scripts/audit-ttgdtx-dashboard-readonly-guard.mjs",
  "scripts/audit-ttgdtx-dashboard-source-reconciliation.mjs",
  "scripts/audit-ttgdtx-synthetic-uat-pack.mjs",
  "scripts/audit-ttgdtx-invoice-policy.mjs",
  "scripts/audit-ttgdtx-migration-order-guard.mjs",
  "scripts/audit-ttgdtx-operating-control-ui.mjs",
  "scripts/audit-ttgdtx-p019-gate-guard.mjs",
  "scripts/audit-ttgdtx-payment-dossier-checklist.mjs",
  "scripts/audit-ttgdtx-period-lock-policy.mjs",
  "scripts/audit-ttgdtx-production-owner-signoff-pack.mjs",
  "scripts/audit-ttgdtx-payout-duplicate-guard.mjs",
  "scripts/audit-ttgdtx-payout-execution-readiness.mjs",
  "scripts/audit-ttgdtx-production-readiness-guard.mjs",
  "scripts/audit-ttgdtx-process-labels.mjs",
  "scripts/audit-ttgdtx-receivable-payment-lifecycle.mjs",
  "scripts/audit-ttgdtx-signed-uat-execution-routing-hub.mjs",
  "scripts/audit-vnd-money-format.mjs",
];

for (const file of requiredFiles) {
  requireFile(file);
}

const packageJson = JSON.parse(read("package.json"));
const requiredScripts = [
  "audit:heu-ai-policy",
  "audit:heu-backlog-codes",
  "audit:heu-bgh-dashboard-spec",
  "audit:heu-controlled-evidence-redaction-pack",
  "audit:heu-current-state-inventory",
  "audit:heu-data-foundation",
  "audit:heu-finance-advance-payment-shell",
  "audit:heu-finance-desk",
  "audit:heu-final-handoff-coverage",
  "audit:heu-git-hygiene",
  "audit:heu-hou-ledger-handover-gap-pack",
  "audit:heu-implementation-log",
  "audit:heu-user-account-security",
  "audit:heu-lead-handover-policy",
  "audit:heu-lead-lifecycle-handover-uat-pack",
  "audit:heu-lead-lifecycle-standard",
  "audit:heu-non-ttgdtx-cascade-review",
  "audit:heu-p0-register-pack",
  "audit:heu-production-blocker-source",
  "audit:heu-production-evidence-binder",
  "audit:heu-role-scope-uat-pack",
  "audit:heu-short-course-attendance-payment-gap-pack",
  "audit:heu-sql-object-master-map",
  "audit:heu-vietnamese-text-encoding",
  "audit:hard-delete",
  "audit:hard-delete-boundary-guard",
  "audit:hard-delete-conversion-decision-queue",
  "audit:vnd-money-format",
  "audit:permission-soft-revoke",
  "audit:ttgdtx-account-control-scope-decision",
  "audit:ttgdtx-accounting-dashboard-uat-plan",
  "audit:ttgdtx-audit-log",
  "audit:ttgdtx-audit-trail-guard",
  "audit:ttgdtx-backup-restore-dry-run-pack",
  "audit:ttgdtx-cascade",
  "audit:ttgdtx-contract-tuition-master-guard",
  "audit:ttgdtx-dashboard-access",
  "audit:ttgdtx-dashboard-readonly-guard",
  "audit:ttgdtx-dashboard-source-reconciliation",
  "audit:ttgdtx-data-fetch-gate",
  "audit:ttgdtx-generic-source-evidence",
  "audit:ttgdtx-invoice-policy",
  "audit:ttgdtx-lead-quick-fix-safety",
  "audit:ttgdtx-migration-order-guard",
  "audit:ttgdtx-operating-control-ui",
  "audit:ttgdtx-p019-gate-guard",
  "audit:ttgdtx-payment-dossier-checklist",
  "audit:ttgdtx-pilot-open-safety",
  "audit:ttgdtx-payout-duplicate-guard",
  "audit:ttgdtx-payout-execution-readiness",
  "audit:ttgdtx-period-lock-policy",
  "audit:ttgdtx-production-owner-signoff-pack",
  "audit:ttgdtx-production-readiness-guard",
  "audit:ttgdtx-process-labels",
  "audit:ttgdtx-receivable-payment-lifecycle",
  "audit:ttgdtx-reconciliation-repair-safety",
  "audit:ttgdtx-role-scope-access",
  "audit:ttgdtx-signed-uat-execution-routing-hub",
  "audit:ttgdtx-step110-safety",
  "audit:ttgdtx-synthetic-uat-pack",
  "audit:ttgdtx-uat-readiness",
  "audit:ttgdtx-release-gates",
];

for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) {
    fail(`package.json: missing npm script ${script}`);
  }
}

requireText(
  "docs/MIGRATION_ORDER_AUDIT.md",
  literalPattern("step90[\\s\\S]*step110", "i"),
  "Step90 through Step110 migration scope",
);

requireText(
  "docs/MIGRATION_ORDER_AUDIT.md",
  literalPattern("STEP90_STEP110_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK\\.md", ""),
  "backup/rollback runbook reference",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  literalPattern("Production remains NO-GO", "i"),
  "NO-GO production statement",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  literalPattern("Backup Evidence Template", "i"),
  "backup evidence template",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  literalPattern("Restore Dry-Run Flow", "i"),
  "restore dry-run flow",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  literalPattern("STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\\.md[\\s\\S]*Complete the operator run sheet through P0-03-RUN-03", "i"),
  "backup/restore operator run sheet integration",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_ROLLBACK_DRY_RUN_RUNBOOK.md",
  literalPattern("Do not run production migration from Codex\\/chat", "i"),
  "Codex/chat production migration boundary",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  literalPattern("PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,\\s+production migration is approved, or production GO is approved", "i"),
  "backup/restore evidence pack local-only boundary",
);

requireText(
  "docs/HEU_REAL_OPS_01_BACKUP_RESTORE_PROOF_INTAKE_20260702.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_PROOF_INTAKE)(?=[\\s\\S]*REAL_OPS_01_PROOF_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*REAL-OPS-01-IN-01)(?=[\\s\\S]*REAL-OPS-01-IN-05)(?=[\\s\\S]*Controlled evidence ID recorded)(?=[\\s\\S]*Backup reference accepted)(?=[\\s\\S]*Restore target proof accepted)(?=[\\s\\S]*Smoke-check result accepted)(?=[\\s\\S]*Closure owner decision prepared)(?=[\\s\\S]*data-p003-real-ops-01-proof-intake=\"REAL-OPS-01_P0-03\")(?=[\\s\\S]*does\\s+not execute backup, execute restore, accept evidence, approve migration,\\s+approve UAT, approve finance reliance, approve legal position or mark\\s+production GO)(?=[\\s\\S]*backup dumps, restore exports, connection strings, database URLs,\\s+service-role keys, credentials, passwords, temporary passwords, OTPs,\\s+password reset links, account activation\\/invite links, raw PII, CCCD, bank\\s+data, bank statements, vouchers and raw payment evidence outside\\s+Git\\/Codex\\/chat)", "i"),
  "REAL-OPS-01 proof intake source document",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_TEMPLATE)(?=[\\s\\S]*does not execute backup, restore, migration, rollback, UAT\\s+acceptance, owner waiver or production GO)(?=[\\s\\S]*P0-03-RUN-01)(?=[\\s\\S]*P0-03-RUN-06)(?=[\\s\\S]*BACKUP_RESTORE_RUN_READY \\/ STOP \\/ BLOCKED)(?=[\\s\\S]*Immediate Stop Conditions)(?=[\\s\\S]*does not prove an actual backup, restore, migration\\s+dry-run, rollback proof, UAT pass, owner sign-off or production GO)", "i"),
  "backup/restore operator run sheet local-only boundary",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  literalPattern("Do not paste secrets, passwords, temporary passwords, OTPs, password reset\\s+links, account activation\\/invite links, service-role keys, bank credentials,\\s+raw student PII, raw CCCD, raw phone numbers or raw payment data", "i"),
  "backup/restore evidence pack secret boundary",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*Restore Smoke-Check Acceptance Matrix)(?=[\\s\\S]*data-p003-restore-smoke-check-acceptance-matrix=\"P0-03\")(?=[\\s\\S]*P0-03-SMOKE-01)(?=[\\s\\S]*P0-03-SMOKE-07)(?=[\\s\\S]*P0-17 access closure states)(?=[\\s\\S]*ACCESS_RETAIN)(?=[\\s\\S]*REVOKE_OR_REDUCE)(?=[\\s\\S]*BLOCKED)(?=[\\s\\S]*soft-revoked\\/INACTIVE user regains access)(?=[\\s\\S]*Lead handover finance gate preserved)(?=[\\s\\S]*P0-19\\/P2-05\\/P2-03)(?=[\\s\\S]*RESTORE_SMOKE_CHECK_PASS \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*PASS_LOCAL does not prove an actual restore, smoke-check, UAT pass, rollback\\s+proof, migration approval or production GO)", "i"),
  "backup/restore smoke-check acceptance evidence pack",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*P0-03 External Evidence Manifest)(?=[\\s\\S]*P0-03-EVID-01)(?=[\\s\\S]*P0-03-EVID-06)(?=[\\s\\S]*EVIDENCE_INDEX_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Missing evidence ID, uncontrolled storage, raw sensitive attachment or unsigned\\s+owner decision keeps production NO-GO)", "i"),
  "backup/restore external evidence manifest pack",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*P0-03 Backup\\/Restore Closure Decision Manifest)(?=[\\s\\S]*data-p003-backup-restore-closure-decision-manifest=\"P0-03\")(?=[\\s\\S]*P0-03-CLOSE-01)(?=[\\s\\S]*P0-03-CLOSE-06)(?=[\\s\\S]*P0-17 access closure decision)(?=[\\s\\S]*P0-17 access closure evidence)(?=[\\s\\S]*P0_03_CLOSURE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*PASS_LOCAL keeps P0-03 at evidence-structure readiness only)", "i"),
  "backup/restore closure decision manifest pack",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\\.md)(?=[\\s\\S]*data-p003-backup-restore-operator-run-sheet=\"P0-03\")(?=[\\s\\S]*P0-03-RUN-01 through P0-03-RUN-06)(?=[\\s\\S]*BACKUP_RESTORE_RUN_READY \\/ STOP \\/ BLOCKED)", "i"),
  "backup/restore operator run sheet evidence pack reference",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*P0-03 Target Identity Lock)(?=[\\s\\S]*data-p003-backup-restore-target-identity-lock=\"P0-03\")(?=[\\s\\S]*P0-03-TARGET-01)(?=[\\s\\S]*P0-03-TARGET-06)(?=[\\s\\S]*TARGET_LOCK_READY \\/ STOP \\/ BLOCKED)(?=[\\s\\S]*PASS_LOCAL proves only that the target-lock checklist exists)", "i"),
  "backup/restore target identity lock evidence pack reference",
);

requireText(
  "docs/STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*REAL-OPS-01 Backup\\/Restore Proof Intake)(?=[\\s\\S]*data-p003-real-ops-01-proof-intake=\"REAL-OPS-01_P0-03\")(?=[\\s\\S]*HEU_REAL_OPS_01_BACKUP_RESTORE_PROOF_INTAKE_20260702\\.md)(?=[\\s\\S]*REAL_OPS_01_PROOF_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*REAL-OPS-01-IN-01)(?=[\\s\\S]*REAL-OPS-01-IN-05)(?=[\\s\\S]*P0-19, P3 gate preservation, P2-18\\/P5-03 source reconciliation, P6-04 scope and P0-17 access closure state)(?=[\\s\\S]*PASS_LOCAL proves only that REAL-OPS-01 proof intake is structured)", "i"),
  "REAL-OPS-01 proof intake evidence pack reference",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-supabase-backup-restore-guard=\"P0-03\")(?=[\\s\\S]*P0-03 Supabase backup\\/restore dry-run)(?=[\\s\\S]*PASS_LOCAL)(?=[\\s\\S]*Production remains NO-GO until real backup evidence, restore\\s+evidence, migration preflight\\/postflight results and owner\\s+sign-off exist)(?=[\\s\\S]*PASS_LOCAL does not mean backup was executed,\\s+restore was executed, UAT passed, production migration is\\s+approved, or production GO is approved)(?=[\\s\\S]*Do not run production migration from Codex\\/chat)(?=[\\s\\S]*secrets, passwords, temporary passwords, OTPs, password reset\\s+links, account activation\\/invite links, service-role keys, bank\\s+credentials, raw student PII, raw CCCD, raw phone numbers or raw\\s+payment data)(?=[\\s\\S]*data-p003-backup-restore-immediate-stop=\"P0-03\")(?=[\\s\\S]*P0-03 immediate operator stop conditions)(?=[\\s\\S]*P0_03_STOP_CHECK \\/ GO_NEXT \\/ BLOCKED)(?=[\\s\\S]*Target identity unclear)(?=[\\s\\S]*Backup or restore proof incomplete)(?=[\\s\\S]*Secret or raw evidence exposure)(?=[\\s\\S]*temporary passwords)(?=[\\s\\S]*account activation\\/invite links)(?=[\\s\\S]*Backup ID \\/ snapshot ID)(?=[\\s\\S]*Restore target project\\/ref)(?=[\\s\\S]*App connection checked against restore target)(?=[\\s\\S]*Human sign-off)(?=[\\s\\S]*audit:ttgdtx-backup-restore-dry-run-pack)(?=[\\s\\S]*audit:ttgdtx-migration-order-guard)(?=[\\s\\S]*audit:ttgdtx-release-gates)(?=[\\s\\S]*npm\\.cmd run build)", "i"),
  "P0-03 Supabase backup/restore UI guard",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-p003-backup-restore-target-identity-lock=\"P0-03\")(?=[\\s\\S]*P0-03 backup\\/restore target identity lock)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P0-03-TARGET-01)(?=[\\s\\S]*P0-03-TARGET-06)(?=[\\s\\S]*TARGET_LOCK_READY \\/ STOP \\/ BLOCKED)(?=[\\s\\S]*Execution authority recorded)(?=[\\s\\S]*Production source is source-only)(?=[\\s\\S]*Restore target is isolated)(?=[\\s\\S]*App banner points to restore target)(?=[\\s\\S]*SQL editor and CLI profile locked)(?=[\\s\\S]*Controlled evidence folder confirmed)(?=[\\s\\S]*PASS_LOCAL proves only that the target-lock checklist exists)", "i"),
  "P0-03 backup/restore target identity lock",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  literalPattern("(?=[\\s\\S]*realOps01ProofIntakeItems)(?=[\\s\\S]*data-p003-real-ops-01-proof-intake=\"REAL-OPS-01_P0-03\")(?=[\\s\\S]*REAL-OPS-01 backup\\/restore proof intake)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*REAL_OPS_01_PROOF_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*REAL-OPS-01-IN-01)(?=[\\s\\S]*REAL-OPS-01-IN-05)(?=[\\s\\S]*Controlled evidence ID recorded)(?=[\\s\\S]*Backup reference accepted)(?=[\\s\\S]*Restore target proof accepted)(?=[\\s\\S]*Smoke-check result accepted)(?=[\\s\\S]*Closure owner decision prepared)(?=[\\s\\S]*Owner evidence acceptance, backup execution, restore execution,\\s+migration-order review and production GO remain outside this app\\s+screen and outside Codex\\/chat)", "i"),
  "REAL-OPS-01 backup/restore proof intake UI guard",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-p003-backup-restore-evidence-checklist=\"P0-03\")(?=[\\s\\S]*P0-03 backup\\/restore execution evidence checklist)(?=[\\s\\S]*PASS_LOCAL\\s+only)(?=[\\s\\S]*P0-03-01)(?=[\\s\\S]*P0-03-06)(?=[\\s\\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\\.md)(?=[\\s\\S]*Actual backup, restore dry-run, migration preflight\\/postflight,\\s+data smoke-check, signed UAT and owner GO\\/NO-GO evidence are still\\s+required)(?=[\\s\\S]*PASS_LOCAL does not prove backup was executed, restore was executed,\\s+migration is safe, UAT passed, rollback is proven or production GO is\\s+approved)(?=[\\s\\S]*secrets, passwords, temporary passwords, OTPs,\\s+password reset links, account activation\\/invite links, service-role\\s+keys, bank credentials, raw student PII, raw CCCD, raw phone numbers\\s+or raw payment data)", "i"),
  "P0-03 backup/restore execution evidence checklist",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-p003-backup-restore-evidence-manifest=\"P0-03\")(?=[\\s\\S]*P0-03 backup\\/restore external evidence manifest)(?=[\\s\\S]*PASS_LOCAL\\s+only)(?=[\\s\\S]*P0-03-EVID-01)(?=[\\s\\S]*P0-03-EVID-06)(?=[\\s\\S]*EVIDENCE_INDEX_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Backup reference)(?=[\\s\\S]*Restore target reference)(?=[\\s\\S]*Preflight\\/postflight command reference)(?=[\\s\\S]*Migration dry-run step reference)(?=[\\s\\S]*Smoke-check and UAT reference)(?=[\\s\\S]*Final sign-off reference)(?=[\\s\\S]*PASS_LOCAL only means the manifest structure exists)", "i"),
  "P0-03 backup/restore external evidence manifest",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-p003-backup-restore-operator-run-sheet=\"P0-03\")(?=[\\s\\S]*P0-03 backup\\/restore operator run sheet)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*BACKUP_RESTORE_RUN_READY \\/ STOP \\/ BLOCKED)(?=[\\s\\S]*P0-03-RUN-01)(?=[\\s\\S]*P0-03-RUN-06)(?=[\\s\\S]*Prove production versus restore target identity)(?=[\\s\\S]*Apply Step90-Step110 only on restore target)(?=[\\s\\S]*PASS_LOCAL does not prove an approved execution window, backup,\\s+restore, migration dry-run, rollback proof, owner sign-off or\\s+production GO)", "i"),
  "P0-03 backup/restore operator run sheet",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-p003-restore-smoke-check-acceptance-matrix=\"P0-03\")(?=[\\s\\S]*P0-03 restore smoke-check acceptance matrix)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*target isolation)(?=[\\s\\S]*core master readability)(?=[\\s\\S]*finance guard\\s+behavior)(?=[\\s\\S]*role\\/workspace scope)(?=[\\s\\S]*P0-17 access closure states)(?=[\\s\\S]*ACCESS_RETAIN)(?=[\\s\\S]*REVOKE_OR_REDUCE)(?=[\\s\\S]*BLOCKED)(?=[\\s\\S]*soft-revoked\\/INACTIVE user regains access)(?=[\\s\\S]*audit trace)(?=[\\s\\S]*dashboard source\\s+reconciliation)(?=[\\s\\S]*Lead handover finance gate preserved)(?=[\\s\\S]*P0-19\\/P2-05\\/P2-03)(?=[\\s\\S]*P0-03-SMOKE-01)(?=[\\s\\S]*P0-03-SMOKE-07)(?=[\\s\\S]*RESTORE_SMOKE_CHECK_PASS \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*PASS_LOCAL does not prove an actual restore, smoke-check, UAT pass,\\s+rollback proof, migration approval or production GO)", "i"),
  "P0-03 restore smoke-check acceptance matrix",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-p003-backup-restore-closure-decision-manifest=\"P0-03\")(?=[\\s\\S]*P0-03 backup\\/restore closure decision manifest)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P0_03_CLOSURE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P0-03-CLOSE-01)(?=[\\s\\S]*P0-03-CLOSE-06)(?=[\\s\\S]*Execution authority and target isolation confirmed)(?=[\\s\\S]*Backup and restore proof accepted)(?=[\\s\\S]*Preflight and postflight checks pass)(?=[\\s\\S]*Smoke-check and UAT index accepted)(?=[\\s\\S]*P0-19 gate UAT)(?=[\\s\\S]*P3-01\\/P3-02 lifecycle and handover UAT)(?=[\\s\\S]*P0-17 access closure decision)(?=[\\s\\S]*P0-17 access closure evidence)(?=[\\s\\S]*Exceptions and waivers controlled)(?=[\\s\\S]*Human closure decision recorded)(?=[\\s\\S]*PASS_LOCAL keeps P0-03 at evidence-structure readiness only)", "i"),
  "P0-03 backup/restore closure decision manifest",
);

requireText(
  "app/settings/supabase-check/page.tsx",
  literalPattern("SupabaseBackupRestoreGuard[\\s\\S]*<SupabaseBackupRestoreGuard \\/>[\\s\\S]*SupabaseCheck", "i"),
  "Supabase check page mounts backup/restore guard",
);

requireText(
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  literalPattern("PASS_LOCAL does not mean backup was executed, restore was executed, UAT passed,\\s+production migration is approved, or production GO is approved", "i"),
  "migration-order guard local-only boundary",
);

requireText(
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  literalPattern("Do not paste secrets, passwords, temporary passwords, OTPs, password reset\\s+links, account activation\\/invite links, service-role keys, bank credentials,\\s+raw student PII, raw CCCD, raw phone numbers or raw payment data", "i"),
  "migration-order account secret and sensitive-data boundary",
);

requireText(
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  literalPattern("Step100[\\s\\S]*formally approved as pilot\\s+waiver", "i"),
  "migration-order Step100 waiver boundary",
);

requireText(
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  literalPattern("(?=[\\s\\S]*Backup\\/Restore Evidence Acceptance Lock)(?=[\\s\\S]*MIG-LOCK-01)(?=[\\s\\S]*MIG-LOCK-06)(?=[\\s\\S]*P0-03 target identity lock accepted)(?=[\\s\\S]*Backup and restore proof accepted)(?=[\\s\\S]*Restore smoke-check accepted)(?=[\\s\\S]*Required owners accept evidence before signing)(?=[\\s\\S]*MIGRATION_EVIDENCE_ACCEPTED \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*PASS_LOCAL proves only that this acceptance-lock structure exists)", "i"),
  "migration-order backup/restore evidence acceptance lock",
);

requireText(
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  literalPattern("(?=[\\s\\S]*Step Decision Manifest)(?=[\\s\\S]*MIG-DEC-01)(?=[\\s\\S]*MIG-DEC-06)(?=[\\s\\S]*MIGRATION_ORDER_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Any missing decision ID, unsigned waiver, missing rollback note, raw sensitive\\s+evidence or unclear production target keeps the migration order NO-GO)", "i"),
  "Step90-Step110 migration decision manifest",
);

requireText(
  "docs/HEU_REAL_OPS_02_SIGNED_MIGRATION_ORDER_INTAKE_20260702.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_SIGNOFF_INTAKE)(?=[\\s\\S]*REAL_OPS_02_MIGRATION_ORDER_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*REAL-OPS-02-IN-01)(?=[\\s\\S]*REAL-OPS-02-IN-05)(?=[\\s\\S]*Backup\\/restore prerequisite verified)(?=[\\s\\S]*Signer authority confirmed)(?=[\\s\\S]*Step90-Step110 scope locked)(?=[\\s\\S]*Exception and rollback decision recorded)(?=[\\s\\S]*Migration-order decision prepared)(?=[\\s\\S]*data-p003-real-ops-02-migration-order-intake=\"REAL-OPS-02_P0-03\")(?=[\\s\\S]*does not sign the migration order, approve production migration,\\s+execute SQL, accept evidence, accept UAT, approve finance reliance, approve\\s+legal position, approve owner GO\\/NO-GO or mark production GO)(?=[\\s\\S]*Passing local checks means only the migration-order intake structure exists and\\s+is audited)", "i"),
  "REAL-OPS-02 signed migration-order intake source document",
);

requireText(
  "docs/STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627.md",
  literalPattern("(?=[\\s\\S]*REAL-OPS-02 Signed Migration Order Intake)(?=[\\s\\S]*HEU_REAL_OPS_02_SIGNED_MIGRATION_ORDER_INTAKE_20260702\\.md)(?=[\\s\\S]*data-p003-real-ops-02-migration-order-intake=\"REAL-OPS-02_P0-03\")(?=[\\s\\S]*REAL_OPS_02_MIGRATION_ORDER_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*REAL-OPS-02-IN-01)(?=[\\s\\S]*REAL-OPS-02-IN-05)(?=[\\s\\S]*Backup\\/restore prerequisite verified)(?=[\\s\\S]*Signer authority confirmed)(?=[\\s\\S]*Step90-Step110 scope locked)(?=[\\s\\S]*Exception and rollback decision recorded)(?=[\\s\\S]*Migration-order decision prepared)(?=[\\s\\S]*PASS_LOCAL proves only that REAL-OPS-02 migration-order intake is structured)", "i"),
  "migration-order REAL-OPS-02 intake guard section",
);

requireText(
  "components/settings/supabase-backup-restore-guard.tsx",
  literalPattern("(?=[\\s\\S]*realOps02MigrationOrderIntakeItems)(?=[\\s\\S]*data-p003-real-ops-02-migration-order-intake=\"REAL-OPS-02_P0-03\")(?=[\\s\\S]*REAL-OPS-02 signed migration-order intake)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*REAL_OPS_02_MIGRATION_ORDER_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*REAL-OPS-02-IN-01)(?=[\\s\\S]*REAL-OPS-02-IN-05)(?=[\\s\\S]*Backup\\/restore prerequisite verified)(?=[\\s\\S]*Signer authority confirmed)(?=[\\s\\S]*Step90-Step110 scope locked)(?=[\\s\\S]*Exception and rollback decision recorded)(?=[\\s\\S]*Migration-order decision prepared)(?=[\\s\\S]*does not sign the migration order, approve production\\s+migration, execute SQL, accept evidence, accept UAT, approve finance\\s+reliance, approve owner GO\\/NO-GO or mark production GO)", "i"),
  "REAL-OPS-02 signed migration-order intake UI guard",
);

requireText(
  "docs/HEU_REAL_OPERATION_CLOSURE_PLAN_20260702.md",
  literalPattern("(?=[\\s\\S]*REAL-OPS-02 Source Intake)(?=[\\s\\S]*HEU_REAL_OPS_02_SIGNED_MIGRATION_ORDER_INTAKE_20260702\\.md)(?=[\\s\\S]*data-p003-real-ops-02-migration-order-intake=\"REAL-OPS-02_P0-03\")(?=[\\s\\S]*REAL_OPS_02_MIGRATION_ORDER_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*does not sign the migration order, approve production\\s+migration, execute SQL, accept evidence, accept UAT, approve finance reliance,\\s+approve owner GO\\/NO-GO or mark production GO)", "i"),
  "real operation closure plan REAL-OPS-02 intake",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("Approve Step90-Step110 migration order[\\s\\S]*HEU_REAL_OPS_02_SIGNED_MIGRATION_ORDER_INTAKE_20260702\\.md[\\s\\S]*REAL-OPS-02 signed migration-order intake[\\s\\S]*REAL_OPS_02_MIGRATION_ORDER_READY \\/ NO_GO \\/ BLOCKED[\\s\\S]*signed approval still required before production", "i"),
  "migration-order checklist REAL-OPS-02 intake row",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  literalPattern("P0-03[\\s\\S]*HEU_REAL_OPS_02_SIGNED_MIGRATION_ORDER_INTAKE_20260702\\.md[\\s\\S]*REAL-OPS-02 signed migration-order intake[\\s\\S]*REAL_OPS_02_MIGRATION_ORDER_READY \\/ NO_GO \\/ BLOCKED[\\s\\S]*signed migration order still required before production", "i"),
  "P0-03 backlog REAL-OPS-02 intake row",
);

requireText(
  "scripts/audit-ttgdtx-migration-order-guard.mjs",
  literalPattern("HEU_REAL_OPS_02_SIGNED_MIGRATION_ORDER_INTAKE_20260702\\.md[\\s\\S]*REAL-OPS-02 signed migration-order intake", "i"),
  "migration-order audit script covers REAL-OPS-02 intake",
);

requireText(
  "docs/MIGRATION_ORDER_AUDIT.md",
  literalPattern("Local Sign-Off Guard Evidence[\\s\\S]*audit:ttgdtx-migration-order-guard", "i"),
  "migration-order local sign-off guard evidence",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("Current recommendation:\\s*NO-GO", "i"),
  "NO-GO current recommendation",
);

requireText(
  "docs/GIT_CLEANUP_ANALYSIS.md",
  literalPattern("Current Snapshot - 2026-06-27[\\s\\S]*Branch:\\s*`hardening\\/ttgdtx-9plus-pilot`[\\s\\S]*git status --short --branch[\\s\\S]*clean worktree[\\s\\S]*Exact ahead count is intentionally treated as live state[\\s\\S]*drifts with each safe commit[\\s\\S]*Do not commit runtime logs, local secrets, raw UAT evidence, exported bank\\s+statements or temporary SQL scratch files", "i"),
  "P0-02 Git hygiene current snapshot",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  literalPattern("(?=[\\s\\S]*Date:\\s*2026-06-28)(?=[\\s\\S]*Git state:\\s*clean local worktree at last verified handoff; exact ahead count and\\s+current commit are live Git state)(?=[\\s\\S]*Conclusion:\\s*Stage D - internal controlled test only\\. Production remains NO-GO)(?=[\\s\\S]*TTGDTX process quick finder)(?=[\\s\\S]*Data Master \\/ Report View compatibility bridge)(?=[\\s\\S]*HOU ledger\\/handover gap pack)(?=[\\s\\S]*Short Course attendance\\/payment gap pack)(?=[\\s\\S]*TTGDTX signed UAT execution routing hub)(?=[\\s\\S]*user account temporary password guard)(?=[\\s\\S]*Finance advance\\/payment shell coverage)(?=[\\s\\S]*62 audit scripts passed)(?=[\\s\\S]*M02 HR[\\s\\S]*create-user temporary password guard)(?=[\\s\\S]*M02 HR[\\s\\S]*real-user access closure guard)(?=[\\s\\S]*M03 Data Master[\\s\\S]*Data Master \\/ Report View compatibility bridge)(?=[\\s\\S]*Production readiness guard[\\s\\S]*shared `PRODUCTION_BLOCKERS`[\\s\\S]*signed UAT execution routing hub)(?=[\\s\\S]*Production readiness guard[\\s\\S]*finance Day-1 start-gate checklist)(?=[\\s\\S]*Production readiness guard[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md)(?=[\\s\\S]*Production readiness guard[\\s\\S]*finance Day-1 real-run rehearsal)(?=[\\s\\S]*Production readiness guard[\\s\\S]*HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630\\.md)(?=[\\s\\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\\.md)(?=[\\s\\S]*UAT-ROUTE-01 through UAT-ROUTE-11)(?=[\\s\\S]*UAT-ROUTE-08 carries the Finance Day-1 start-gate checklist and result ledger into dashboard\\/Finance Desk signed UAT)(?=[\\s\\S]*UAT-ROUTE-11 carries the Finance Day-1 start-gate checklist, Finance Day-1 result ledger plus P0-17 access closure decision into final owner GO\\/NO-GO)(?=[\\s\\S]*Production blocker shared source[\\s\\S]*TTGDTX landing guard[\\s\\S]*P0-03 operator run sheet evidence path)(?=[\\s\\S]*P0-03 restore smoke-check proof for P0-19\\/P3 gate preservation)(?=[\\s\\S]*P0-09 owner sign-off\\/UAT handoff evidence path)(?=[\\s\\S]*P0-09 final owner decision manifest)(?=[\\s\\S]*Process discovery\\/navigation[\\s\\S]*\\/ttgdtx` quick finder)(?=[\\s\\S]*Lead lifecycle\\/handover[\\s\\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\\.md)(?=[\\s\\S]*Accounting dashboard \\/ BGH control[\\s\\S]*P5-02 Master Control action queue with safe iteration loop, P0-14 intake-ledger evidence binder and P0-15 final handoff summary before owner GO\\/NO-GO)(?=[\\s\\S]*Finance Desk \\/ KHTC cockpit[\\s\\S]*P5-03 read-only cockpit exists at `\\/finance-desk` with permission and workspace-scope gate)(?=[\\s\\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\\.md)(?=[\\s\\S]*P5-03 reliance decision manifest)(?=[\\s\\S]*P0 register pack[\\s\\S]*Root control, data master, dictionary, SOP-to-data, Legal\\/SOP\\/Governance control matrix, report view, report-view source map, read-only `\\/reports` source-map panel with Data Quality Check status capture, owner signoff capture and controlled evidence attachment queue[\\s\\S]*RV_TTGDTX_FINANCE_SUMMARY[\\s\\S]*Finance Day-1 start-gate checklist and Finance Day-1 result ledger[\\s\\S]*AI scope, risk signoff registers and module readiness gap matrix exist as DRAFT_CONTROL documents)(?=[\\s\\S]*HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT\\.md)(?=[\\s\\S]*STUDENT_MASTER)(?=[\\s\\S]*CLASS_MASTER)(?=[\\s\\S]*COHORT_MASTER)(?=[\\s\\S]*Role\\/workspace scope[\\s\\S]*create-user temporary password guard)(?=[\\s\\S]*Role\\/workspace scope[\\s\\S]*real-user access closure guard)(?=[\\s\\S]*Role\\/workspace scope[\\s\\S]*post-UAT access closure handoff)(?=[\\s\\S]*Final handoff coverage[\\s\\S]*P0-13 blocker source)(?=[\\s\\S]*P0-14 evidence binder)(?=[\\s\\S]*Final handoff coverage[\\s\\S]*P2-18\\/P5-03 real-accounting finance reliance proof)(?=[\\s\\S]*Final handoff coverage[\\s\\S]*Finance Day-1 start-gate checklist)(?=[\\s\\S]*Final handoff coverage[\\s\\S]*P0-17 access closure decision)(?=[\\s\\S]*Production is still NO-GO because:)(?=[\\s\\S]*No real production backup\\/restore dry-run evidence)(?=[\\s\\S]*Step90-Step110 production migration order is not signed)(?=[\\s\\S]*P3-01\\/P3-02 lifecycle and handover UAT is not signed)(?=[\\s\\S]*Final BGH\\/IT_DATA\\/KHTC\\/PHAP_CHE\\/Audit\\/owner GO\\/NO-GO is not signed)(?=[\\s\\S]*Record final owner GO\\/NO-GO outside Codex\\/chat using the owner sign-off pack,\\s+final owner decision manifest and UAT operator handoff references)", "i"),
  "HEU current-state inventory Stage D NO-GO snapshot",
);

requireAllText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  [
    "Production readiness guard",
    "finance Day-1 P6-04 pre-login matrix",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "Role/workspace scope",
  ],
  "HEU current-state inventory finance Day-1 P6-04 pre-login matrix state",
);

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  literalPattern("UAT-ROUTE-01[\\s\\S]*Raw PII, CCCD, bank data, passwords, temporary passwords, OTPs, password reset links, account activation\\/invite links, service-role keys, vouchers or unredacted screenshots are present", "i"),
  "signed UAT routing hub account-secret stop condition",
);

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  literalPattern("UAT-ROUTE-11[\\s\\S]*P0-17 access closure decision[\\s\\S]*P0-17 access closure is missing", "i"),
  "signed UAT route 11 access closure handoff",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("UAT-ROUTE-01[\\s\\S]*Raw student PII, CCCD, bank data, passwords, temporary passwords, OTPs, password reset links, account activation\\/invite links, service-role keys, vouchers or unredacted screenshots are present", "i"),
  "shared signed UAT routing account-secret stop condition",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("UAT-ROUTE-11[\\s\\S]*P0-17 access closure decision[\\s\\S]*P0-17 access closure is missing", "i"),
  "shared signed UAT route 11 access closure handoff",
);

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  literalPattern("(?=[\\s\\S]*UAT-ROUTE-08[\\s\\S]*P2-18\\/P5-03)(?=[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md)(?=[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md)(?=[\\s\\S]*Finance Day-1 start-gate checklist)(?=[\\s\\S]*Finance Day-1 result ledger)(?=[\\s\\S]*P6-04 real accounting user queue\\/result proof)(?=[\\s\\S]*Finance Day-1 start-gate checklist is missing)(?=[\\s\\S]*Finance Day-1 result ledger is missing)(?=[\\s\\S]*UAT-ROUTE-11[\\s\\S]*P0-09)(?=[\\s\\S]*Finance Day-1 start-gate checklist[\\s\\S]*Finance Day-1 result ledger[\\s\\S]*P0-17 access closure decision)(?=[\\s\\S]*Any required owner signs NO-GO\\/BLOCKED, Finance Day-1 start-gate checklist is missing)", "i"),
  "signed UAT route table Finance Day-1 ledger handoff",
);

requireText(
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  literalPattern("(?=[\\s\\S]*UAT-ROUTE-08 P2-18\\/P5-03 dashboard and Finance Desk browser UAT)(?=[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md)(?=[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md)(?=[\\s\\S]*Finance Day-1 start-gate checklist and result ledger are recorded)(?=[\\s\\S]*UAT-ROUTE-11 P0-09 final owner GO\\/NO-GO decision)(?=[\\s\\S]*Finance Day-1 start-gate checklist, Finance Day-1 result ledger, P0-17 access closure decision)", "i"),
  "operator handoff Finance Day-1 ledger route handoff",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  literalPattern("(?=[\\s\\S]*UAT-ROUTE-08 P2-18\\/P5-03 dashboard and Finance Desk browser UAT \\| PENDING \\| SIGNED_UAT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md)(?=[\\s\\S]*Finance Day-1 result ledger and reliance decision)(?=[\\s\\S]*UAT-ROUTE-11 P0-09 final owner GO\\/NO-GO decision \\| PENDING \\| SIGNED_UAT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Finance Day-1 result ledger, P0-17 access closure decision)", "i"),
  "execution log Finance Day-1 ledger route tracker",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*UAT-ROUTE-08)(?=[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md)(?=[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md)(?=[\\s\\S]*Finance Day-1 start-gate checklist)(?=[\\s\\S]*Finance Day-1 result ledger)(?=[\\s\\S]*Finance Day-1 start-gate checklist is missing)(?=[\\s\\S]*Finance Day-1 result ledger is missing)(?=[\\s\\S]*UAT-ROUTE-11)(?=[\\s\\S]*Final owner decision manifest with signed UAT, evidence binder, migration, backup, role, Finance Day-1 start-gate checklist, Finance Day-1 result ledger, P0-17 access closure decision)(?=[\\s\\S]*Any required owner signs NO-GO\\/BLOCKED, Finance Day-1 start-gate checklist is missing)", "i"),
  "shared signed UAT Finance Day-1 ledger handoff source",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  literalPattern("TTGDTX signed UAT execution routing hub[\\s\\S]*UAT-ROUTE-08 carries the Finance Day-1 start-gate checklist and result ledger into dashboard\\/Finance Desk signed UAT[\\s\\S]*UAT-ROUTE-11 carries the Finance Day-1 start-gate checklist, Finance Day-1 result ledger plus P0-17 access closure decision into final owner GO\\/NO-GO", "i"),
  "current-state signed UAT Finance Day-1 ledger handoff",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("UAT Routing Finance Day-1 Ledger Handoff[\\s\\S]*UAT-ROUTE-08[\\s\\S]*Finance Day-1 result ledger[\\s\\S]*UAT-ROUTE-11[\\s\\S]*final owner GO\\/NO-GO[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md[\\s\\S]*audit-ttgdtx-signed-uat-execution-routing-hub\\.mjs[\\s\\S]*does not execute UAT[\\s\\S]*mark production GO", "i"),
  "implementation log UAT routing Finance Day-1 ledger handoff",
);

requireText(
  "docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md",
  literalPattern("Status:\\s*DRAFT_CONTROL[\\s\\S]*No new level-1 folder is allowed[\\s\\S]*Folder Registry, File Registry,\\s*Version Log, Audit Log and Signoff Register[\\s\\S]*RC-08[\\s\\S]*DRAFT_MATRIX_READY[\\s\\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\\.md[\\s\\S]*RC-09[\\s\\S]*DRAFT_MATRIX_READY[\\s\\S]*RC-10[\\s\\S]*DRAFT_MATRIX_READY[\\s\\S]*Codex\\/AI may draft, check and implement local safe controls[\\s\\S]*must not\\s+approve production, approve migration, accept UAT, approve finance action", "i"),
  "P0 root control action register boundary",
);
requireText(
  "docs/HEU_ROOT_CONTROL_ACTION_REGISTER_20260627_V01_DRAFT.md",
  literalPattern("RC-04[\\s\\S]*HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT\\.md[\\s\\S]*RC-07A[\\s\\S]*Legal\\/SOP\\/Governance control matrix[\\s\\S]*DRAFT_CONTROL[\\s\\S]*Legal Article Master, SOP Register, evidence class, workflow gate, report view and owner decision boundaries are mapped[\\s\\S]*signed owner review still required", "i"),
  "P0 root Legal/SOP/Governance control matrix routing",
);

requireText(
  "docs/HEU_DATA_MASTER_P0_REGISTER_20260627_V01_DRAFT.md",
  literalPattern("Data Master comes before workflow, dashboard, automation and AI[\\s\\S]*STUDENT_MASTER \\/ HOC_SINH_MASTER[\\s\\S]*REPORT_VIEW_REGISTER[\\s\\S]*SIGNOFF_REGISTER[\\s\\S]*does not rename, drop, alter or create production schema", "i"),
  "P0 data master register boundary",
);

requireText(
  "docs/HEU_DATA_DICTIONARY_MIN_20260627_V01_DRAFT.md",
  literalPattern("AI is never approver[\\s\\S]*Money is recognized only after HEU receives and reconciles it[\\s\\S]*Do not commit or paste raw CCCD[\\s\\S]*does not approve real\\s+data import, production dashboard use, AI production use or finance posting", "i"),
  "P0 minimum data dictionary boundary",
);

requireText(
  "docs/HEU_SOP_TO_DATA_MAPPING_20260627_V01_DRAFT.md",
  literalPattern("Event -> Legal Check -> Regulation -> SOP[\\s\\S]*Report View -> Dashboard -> Audit[\\s\\S]*CHUA_DU_DIEU_KIEN[\\s\\S]*does not approve any SOP as officially issued", "i"),
  "P0 SOP-to-data mapping boundary",
);
requireText(
  "docs/HEU_SOP_TO_DATA_MAPPING_20260627_V01_DRAFT.md",
  literalPattern("HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT\\.md[\\s\\S]*Legal Article Master, SOP Register, evidence-class,\\s+workflow-gate, report-view, finance-reliance, AI-scope and owner-decision\\s+boundaries[\\s\\S]*cannot be used as official legal\\s+approval, official SOP issuance, evidence acceptance, UAT acceptance, finance\\s+approval, owner waiver or production GO", "i"),
  "P0 SOP-to-data Legal/SOP/Governance matrix reference",
);
requireText(
  "docs/HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*DRAFT_CONTROL)(?=[\\s\\S]*Production status:\\s*NO-GO)(?=[\\s\\S]*Legal basis -> Regulation\\/SOP -> Data source -> Workflow gate -> Evidence\\s+class -> Report view -> Audit log -> Signoff register -> Owner decision)(?=[\\s\\S]*Legal Article Master)(?=[\\s\\S]*SOP Register)(?=[\\s\\S]*Evidence Class Boundary)(?=[\\s\\S]*Workflow Gate)(?=[\\s\\S]*Report View Reliance)(?=[\\s\\S]*Finance Reliance Boundary)(?=[\\s\\S]*AI Scope Boundary)(?=[\\s\\S]*Owner Decision Boundary)(?=[\\s\\S]*does not issue legal policy, approve an SOP, accept UAT,\\s+accept evidence, approve finance action, approve migration, move Drive files or\\s+grant owner Go\\/No-Go)", "i"),
  "P0 Legal/SOP/Governance control matrix boundary",
);

requireText(
  "docs/HEU_REPORT_VIEW_REGISTER_20260627_V01_DRAFT.md",
  literalPattern("Dashboard -> Report View -> Data Quality Check -> Source Map -> Owner Signoff[\\s\\S]*HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT\\.md[\\s\\S]*RV_TTGDTX_FINANCE_SUMMARY[\\s\\S]*SOURCE_MAP_DRAFT[\\s\\S]*RV_AI_ALLOWED_CONTEXT[\\s\\S]*does not approve production\\s+dashboard use or replace signed dashboard UAT", "i"),
  "P0 report view register boundary",
);

requireText(
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
  literalPattern("Status:\\s*DRAFT_CONTROL[\\s\\S]*Production status:\\s*NO-GO[\\s\\S]*Dashboard -> Report View -> Physical Source -> Data Quality Check -> Owner\\s+Signoff -> UAT Evidence[\\s\\S]*RV_TTGDTX_FINANCE_SUMMARY[\\s\\S]*Finance Day-1 start-gate checklist[\\s\\S]*Finance Day-1 result ledger[\\s\\S]*RV_TTGDTX_COM_CHI_TRA[\\s\\S]*RV_HOU_LEDGER_SUMMARY[\\s\\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT[\\s\\S]*RV_AI_ALLOWED_CONTEXT[\\s\\S]*KPI Dictionary Shell[\\s\\S]*Data Quality Check Log Shell[\\s\\S]*Report views remain DRAFT_CONTROL until owner signoff and UAT evidence exist", "i"),
  "P0 report-view source map boundary",
);

requireText(
  "components/reports/report-view-source-map-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-report-view-source-map-panel=\"P0-16\")(?=[\\s\\S]*Report View Source Map: PASS_LOCAL only)(?=[\\s\\S]*does not approve production\\s+reliance, statutory accounting, finance action, UAT acceptance,\\s+evidence acceptance or owner GO)(?=[\\s\\S]*RV_TTGDTX_FINANCE_SUMMARY)(?=[\\s\\S]*RV_TTGDTX_COM_CHI_TRA)(?=[\\s\\S]*RV_HOU_LEDGER_SUMMARY)(?=[\\s\\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\\s\\S]*RV_AI_ALLOWED_CONTEXT)(?=[\\s\\S]*KPI_TTGDTX_ACTUAL_COLLECTION)(?=[\\s\\S]*DQ-RV-08)", "i"),
  "P0 report-view source map UI panel",
);

requireText(
  "components/reports/report-view-source-map-panel.tsx",
  literalPattern("(?=[\\s\\S]*Data Quality Check status capture)(?=[\\s\\S]*CAPTURE_REQUIRED)(?=[\\s\\S]*Owner action:)(?=[\\s\\S]*Evidence state:)(?=[\\s\\S]*RECON_EVIDENCE_REQUIRED)(?=[\\s\\S]*PAYOUT_LOCK_REQUIRED)(?=[\\s\\S]*READ_ONLY_SCOPE_REQUIRED)(?=[\\s\\S]*AI production action remains blocked)", "i"),
  "P0 report-view data-quality status capture",
);

requireText(
  "components/reports/report-view-source-map-panel.tsx",
  literalPattern("(?=[\\s\\S]*Owner signoff capture)(?=[\\s\\S]*RV-SIGN-01)(?=[\\s\\S]*OWNER_SIGNOFF_PENDING)(?=[\\s\\S]*PAYOUT_SIGNOFF_REQUIRED)(?=[\\s\\S]*HOU_OWNER_SIGNOFF_REQUIRED)(?=[\\s\\S]*SHORT_COURSE_SIGNOFF_REQUIRED)(?=[\\s\\S]*AI_SCOPE_SIGNOFF_REQUIRED)(?=[\\s\\S]*does not collect signatures)", "i"),
  "P0 report-view owner signoff capture",
);

requireText(
  "components/reports/report-view-source-map-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-report-view-evidence-attachment-queue=\"RV-EVID-01)(?=[\\s\\S]*Evidence attachment queue)(?=[\\s\\S]*RV-EVID-01)(?=[\\s\\S]*P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005)(?=[\\s\\S]*FIN-START-EVID-001 through FIN-START-EVID-005)(?=[\\s\\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005)(?=[\\s\\S]*P5_03_CONTROLLED_TRIAL_READY \\/ FIN_START_READY \\/ FIN_DAY1_RESULT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*RV-EVID-06)(?=[\\s\\S]*AUDIT_AI_SCOPE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*does not upload files,\\s+accept evidence or waive blockers)", "i"),
  "P0 report-view evidence attachment queue",
);

requireText(
  "docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*DRAFT_CONTROL)(?=[\\s\\S]*Production status:\\s*NO-GO)(?=[\\s\\S]*STUDENT_MASTER)(?=[\\s\\S]*CLASS_MASTER)(?=[\\s\\S]*COHORT_MASTER)(?=[\\s\\S]*CV_STUDENT_MASTER_UNIFIED)(?=[\\s\\S]*CV_CLASS_MASTER_UNIFIED)(?=[\\s\\S]*CV_COHORT_MASTER_UNIFIED)(?=[\\s\\S]*REPORT_VIEW_MASTER_CONTRACT)(?=[\\s\\S]*DQ-DM-01)(?=[\\s\\S]*DQ-DM-04)(?=[\\s\\S]*DQ-DM-05[\\s\\S]*Dashboard reliance lock)(?=[\\s\\S]*DESIGN_ONLY)(?=[\\s\\S]*does not approve production SQL,\\s+schema migration, UAT acceptance, dashboard reliance, evidence acceptance,\\s+finance action or owner Go\\/No-Go)", "i"),
  "P0 Data Master / Report View compatibility boundary",
);

requireText(
  "components/reports/data-master-report-view-bridge-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-data-master-report-view-bridge-panel=\"DM-RV-03\")(?=[\\s\\S]*Data Master \\/ Report View Bridge: DESIGN_ONLY)(?=[\\s\\S]*does not\\s+create production SQL, merge source records, import real data or\\s+approve dashboard reliance)(?=[\\s\\S]*CV_STUDENT_MASTER_UNIFIED)(?=[\\s\\S]*CV_CLASS_MASTER_UNIFIED)(?=[\\s\\S]*CV_COHORT_MASTER_UNIFIED)(?=[\\s\\S]*REPORT_VIEW_MASTER_CONTRACT)(?=[\\s\\S]*DQ-DM-01)(?=[\\s\\S]*DQ-DM-04)(?=[\\s\\S]*DQ-DM-05)(?=[\\s\\S]*Dashboard reliance lock)(?=[\\s\\S]*OWNER_SIGNOFF_PENDING)", "i"),
  "P0 Data Master / Report View bridge panel",
);

requireText(
  "app/reports/page.tsx",
  literalPattern("(?=[\\s\\S]*ReportViewSourceMapPanel)(?=[\\s\\S]*<ReportViewSourceMapPanel \\/>)(?=[\\s\\S]*DataMasterReportViewBridgePanel)(?=[\\s\\S]*<DataMasterReportViewBridgePanel \\/>)", "i"),
  "reports page mounts report-view source-map and Data Master / Report View bridge panels",
);

requireText(
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  literalPattern("AI may draft, check, summarize and warn[\\s\\S]*AI must not\\s+approve, pay, post finance records, delete data or mark production GO[\\s\\S]*Signed UAT proving AI cannot approve, pay, release, delete or go-live", "i"),
  "P0 AI agent scope register boundary",
);
requireText(
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  literalPattern("P7-04 prompt\\/output audit logging design[\\s\\S]*HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628\\.md[\\s\\S]*actor, role, workspace scope, registered agent, source scope,\\s+prompt\\/output redaction status, prompt\\/output hash where available, forbidden\\s+action flags, human decision status and controlled evidence reference[\\s\\S]*does not implement AI logging, enable AI\\s+service calls, approve AI-readable data access, accept UAT or approve\\s+production AI", "i"),
  "P7-04 AI agent scope register boundary",
);
requireText(
  "docs/HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702.md",
  literalPattern("Status:\\s*PASS_LOCAL_CONTROL[\\s\\S]*Decision values:\\s*TEAM_REGISTER_READY \\/ NO_GO \\/ BLOCKED[\\s\\S]*Build Agent[\\s\\S]*QA\\/Audit Agent[\\s\\S]*Data Check Agent[\\s\\S]*Finance Trial Support Agent[\\s\\S]*UAT\\/Evidence Coordinator[\\s\\S]*Report\\/Email Coordinator[\\s\\S]*Human Authority Owner[\\s\\S]*Production remains NO-GO", "i"),
  "P7-05 AI delivery team operating register",
);

requireText(
  "docs/HEU_MASTER_CONTROL_GOAL_REGISTER_20260702.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_GOAL_CONTROL)(?=[\\s\\S]*MASTER_GOAL_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Continuous Build Goal When Local Machine Is Off)(?=[\\s\\S]*cloud PASS_LOCAL\\s+verification, not autonomous coding)(?=[\\s\\S]*Build verification when local machine is off)(?=[\\s\\S]*GitHub Actions PASS_LOCAL workflow runs audits\\/lint\\/build\\/report summaries)(?=[\\s\\S]*Expert Team Build Goal)(?=[\\s\\S]*Build Agent)(?=[\\s\\S]*QA\\/Audit Agent)(?=[\\s\\S]*Data Check Agent)(?=[\\s\\S]*Finance Trial Support)(?=[\\s\\S]*UAT\\/Evidence Coordinator)(?=[\\s\\S]*Report\\/Email Coordinator)(?=[\\s\\S]*Human Authority Owner)(?=[\\s\\S]*Build Phases)(?=[\\s\\S]*A[\\s\\S]*Clean\\/package dirty scope)(?=[\\s\\S]*E[\\s\\S]*Remaining blockers)(?=[\\s\\S]*Required Reporting Style)(?=[\\s\\S]*Stop Conditions)(?=[\\s\\S]*does not create autonomous AI workers,\\s+send real email, create real tasks, create real accounts, accept UAT, accept\\s+evidence, approve finance action, approve owner GO\\/NO-GO, run production\\s+migration or mark production GO)(?=[\\s\\S]*Production remains NO-GO)", "i"),
  "Master Control goal register local-only boundary",
);
requireText(
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  literalPattern("Delivery Team Operating Scope[\\s\\S]*HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702\\.md[\\s\\S]*must not create\\s+autonomous AI workers, send real email, create real software tasks, accept UAT,\\s+accept evidence, approve finance action, approve owner GO, run production\\s+migration or mark production GO", "i"),
  "P7-05 AI agent scope register boundary",
);

requireText(
  "docs/HEU_RISK_CONTROL_SIGNOFF_REGISTER_20260627_V01_DRAFT.md",
  literalPattern("PASS_LOCAL means local packaging or static audit passed[\\s\\S]*does not mean:[\\s\\S]*production ready[\\s\\S]*owner GO granted[\\s\\S]*Legal\\/SOP\\/governance chain incomplete[\\s\\S]*Legal\\/SOP\\/Governance Control Matrix[\\s\\S]*Human signer only[\\s\\S]*does not approve production", "i"),
  "P0 risk control signoff register boundary",
);

requireText(
  "docs/HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT.md",
  literalPattern("Status:\\s*DRAFT_CONTROL[\\s\\S]*Production status:\\s*NO-GO[\\s\\S]*DAT[\\s\\S]*CAN_SUA[\\s\\S]*CHUA_DU_DIEU_KIEN[\\s\\S]*CAM_CODE[\\s\\S]*TTGDTX\\/9\\+ Operating Module[\\s\\S]*Finance Desk[\\s\\S]*Report View Register[\\s\\S]*controlled evidence attachment queue[\\s\\S]*Actual owner signoff and external controlled evidence attachment per report view[\\s\\S]*HOU Partnership Module[\\s\\S]*Short Course \\/ Day Nghe[\\s\\S]*Gach no from receipt[\\s\\S]*CAM_CODE[\\s\\S]*Partner payout execution[\\s\\S]*CAM_CODE[\\s\\S]*Bank\\/collateral operation[\\s\\S]*CAM_CODE[\\s\\S]*Production remains NO-GO until backup\\/restore, migration order, signed UAT,\\s+hard-delete\\/cascade closure and final owner Go\\/No-Go are complete", "i"),
  "P0 module readiness gap matrix boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("AI Prompt Output Audit Logging Design[\\s\\S]*HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628\\.md[\\s\\S]*actor,\\s+role\\/workspace scope, source-scope refs, redaction status, prompt\\/output\\s+hashes when available, forbidden-action flags, human decision status and\\s+controlled evidence reference[\\s\\S]*does not call an AI service, store live\\s+prompts, read restricted data, write workflow state, approve finance action,\\s+accept UAT, accept evidence, approve owner GO or mark production GO", "i"),
  "P7-04 AI prompt/output audit logging implementation log entry",
);
requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P7-06 Cloud Agent Operating Plan[\\s\\S]*HEU_CLOUD_AGENT_OPERATING_PLAN_20260702\\.md[\\s\\S]*PASS_LOCAL_PLAN[\\s\\S]*CLOUD_AGENT_PLAN_READY \\/ NO_GO \\/ BLOCKED[\\s\\S]*USD 20-40[\\s\\S]*human owner setup checklist[\\s\\S]*kill switch[\\s\\S]*audit:heu-ai-policy[\\s\\S]*audit:heu-current-state-inventory[\\s\\S]*audit:heu-implementation-log[\\s\\S]*audit:ttgdtx-release-gates[\\s\\S]*does not buy server[\\s\\S]*enter payment card[\\s\\S]*create cloud infrastructure[\\s\\S]*create autonomous AI workers[\\s\\S]*OpenAI\\/API keys[\\s\\S]*send real email[\\s\\S]*create real tasks\\/tickets[\\s\\S]*create real users[\\s\\S]*accept UAT[\\s\\S]*accept evidence[\\s\\S]*approve finance action[\\s\\S]*approve owner GO\\/NO-GO[\\s\\S]*run production migration[\\s\\S]*mark production GO", "i"),
  "P7-06 cloud agent operating plan implementation log entry",
);
requireText(
  ".github/workflows/heu-pass-local.yml",
  literalPattern("Audit release gates[\\s\\S]*npm run audit:ttgdtx-release-gates[\\s\\S]*Audit AI policy and cloud-agent plan[\\s\\S]*npm run audit:heu-ai-policy[\\s\\S]*Audit final handoff coverage[\\s\\S]*npm run audit:heu-final-handoff-coverage[\\s\\S]*Write daily-readable summary[\\s\\S]*report-heu-daily-dry-run[\\s\\S]*report-heu-email-readiness", "i"),
  "PASS_LOCAL workflow direct AI policy audit",
);
requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("PASS_LOCAL Workflow AI Policy Audit Guard[\\s\\S]*\\.github\\/workflows\\/heu-pass-local\\.yml[\\s\\S]*npm run audit:heu-ai-policy[\\s\\S]*release gates[\\s\\S]*final handoff coverage[\\s\\S]*AI policy\\/cloud-agent plan audit[\\s\\S]*does not create cloud\\s+infrastructure[\\s\\S]*buy a server[\\s\\S]*enter payment details[\\s\\S]*send real\\s+email[\\s\\S]*create real tasks[\\s\\S]*create real users[\\s\\S]*accept UAT[\\s\\S]*accept evidence[\\s\\S]*approve finance action[\\s\\S]*approve owner GO\\/NO-GO[\\s\\S]*deploy production[\\s\\S]*mark\\s+production GO", "i"),
  "PASS_LOCAL workflow AI policy audit implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Legal SOP Governance Control Matrix[\\s\\S]*HEU_LEGAL_SOP_GOVERNANCE_CONTROL_MATRIX_20260628_V01_DRAFT\\.md[\\s\\S]*Legal Article Master, SOP Register, evidence class, workflow gate,\\s+report view reliance, finance reliance, AI scope and owner decision\\s+boundaries[\\s\\S]*DRAFT_CONTROL[\\s\\S]*does not issue legal\\s+policy, approve an SOP, move Drive files, accept UAT, accept evidence,\\s+approve finance action, waive owner decision or mark production GO", "i"),
  "Legal/SOP/Governance matrix implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Data Master Report View Compatibility Bridge[\\s\\S]*HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT\\.md[\\s\\S]*components\\/reports\\/data-master-report-view-bridge-panel\\.tsx[\\s\\S]*STUDENT_MASTER[\\s\\S]*CLASS_MASTER[\\s\\S]*COHORT_MASTER[\\s\\S]*does not\\s+create production SQL, merge source data, import real data, approve\\s+report-view signoff, approve dashboard reliance, accept evidence, approve\\s+migration, approve finance action or mark production GO", "i"),
  "Data Master / Report View bridge implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0 Register Pack Foundation[\\s\\S]*HEU P0 register pack as DRAFT_CONTROL documents[\\s\\S]*audit:heu-p0-register-pack[\\s\\S]*This is register packaging only[\\s\\S]*does not execute UAT, approve migration,\\s+approve finance action or mark production GO", "i"),
  "P0 register pack implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Module Readiness Gap Matrix[\\s\\S]*HEU_MODULE_READINESS_GAP_MATRIX_20260628_V01_DRAFT\\.md[\\s\\S]*DAT[\\s\\S]*CAN_SUA[\\s\\S]*CHUA_DU_DIEU_KIEN[\\s\\S]*CAM_CODE[\\s\\S]*RC-08, RC-09 and RC-10[\\s\\S]*review\\/control routing only[\\s\\S]*does not execute UAT, approve\\s+migration, approve finance action, accept evidence or mark production GO", "i"),
  "module readiness gap matrix implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Report View Finance Day-1 Evidence Gate[\\s\\S]*RV_TTGDTX_FINANCE_SUMMARY[\\s\\S]*Finance Day-1 start-gate and result\\s+ledger evidence[\\s\\S]*FIN-START-EVID-001[\\s\\S]*FIN-DAY1-EVID-005[\\s\\S]*audit-heu-p0-register-pack\\.mjs[\\s\\S]*audit-ttgdtx-release-gates\\.mjs[\\s\\S]*does not upload files[\\s\\S]*approve report-view reliance[\\s\\S]*mark production GO", "i"),
  "report-view Finance Day-1 evidence gate log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Report View Source Map Hardening[\\s\\S]*HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT\\.md[\\s\\S]*TTGDTX\\/Finance Desk,\\s+HOU, Short Course, Audit and AI[\\s\\S]*SOURCE_MAP_DRAFT[\\s\\S]*KPI dictionary plus data-quality-check shells[\\s\\S]*read-only report governance[\\s\\S]*does not approve dashboard production\\s+reliance, statutory accounting, finance action, UAT acceptance, evidence\\s+acceptance or owner GO", "i"),
  "report-view source map implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Report View Source Map Read-Only UI[\\s\\S]*components\\/reports\\/report-view-source-map-panel\\.tsx[\\s\\S]*read-only P0-16 panel[\\s\\S]*Mounted the panel on `\\/reports`[\\s\\S]*P0 register, current-state, implementation-log and release-gate\\s+audits[\\s\\S]*read-only report governance UI only[\\s\\S]*does not approve dashboard\\s+production reliance, statutory accounting, finance action, UAT acceptance,\\s+evidence acceptance, owner GO or production GO", "i"),
  "report-view source map read-only UI implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Report View Data Quality Status Capture[\\s\\S]*components\\/reports\\/report-view-source-map-panel\\.tsx[\\s\\S]*Data Quality Check capture status[\\s\\S]*owner action[\\s\\S]*evidence state[\\s\\S]*stop condition[\\s\\S]*actual\\s+receipt\\/reconciliation evidence[\\s\\S]*AI\\s+read-only scope checks[\\s\\S]*read-only report governance UI only[\\s\\S]*does not approve dashboard\\s+production reliance, statutory accounting, finance action, UAT acceptance,\\s+evidence acceptance, owner GO or production GO", "i"),
  "report-view data-quality status capture implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Report View Owner Signoff Capture[\\s\\S]*components\\/reports\\/report-view-source-map-panel\\.tsx[\\s\\S]*owner signoff capture queue[\\s\\S]*required owner groups[\\s\\S]*signoff state and blockers[\\s\\S]*current-state, P0 register and release-gate audits[\\s\\S]*read-only report governance UI only[\\s\\S]*does not collect signatures,\\s+approve dashboard production reliance, statutory accounting, finance action,\\s+UAT acceptance, evidence acceptance, owner GO or production GO", "i"),
  "report-view owner signoff capture implementation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-05 Implementation Log Audit Guard[\\s\\S]*audit:heu-implementation-log[\\s\\S]*P0-05 backlog[\\s\\S]*production checklist[\\s\\S]*current-state\\s+inventory[\\s\\S]*This is governance-log alignment only[\\s\\S]*does not execute UAT, accept real\\s+evidence, approve migration, approve finance action or mark production GO", "i"),
  "P0-05 implementation-log audit guard entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P2-10 Quick Finder Invoice Prompt[\\s\\S]*ttgdtx-process-quick-finder\\.tsx[\\s\\S]*placeholder includes `xuat hoa don`[\\s\\S]*invoice\\/chung-tu questions toward Thu hoc phi \\(P2-10\\)[\\s\\S]*audit-ttgdtx-process-labels\\.mjs[\\s\\S]*release-gate audits[\\s\\S]*This is navigation\\/discovery packaging only[\\s\\S]*does not approve invoice\\s+issuance, legal\\/tax interpretation, finance posting, UAT acceptance, owner\\s+waiver or production GO", "i"),
  "P2-10 quick finder invoice prompt log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P2-10 Natural Invoice Search Fallback[\\s\\S]*ttgdtx-process-labels\\.ts[\\s\\S]*thu tien co hoa don khong[\\s\\S]*thu tien co xuat hoa don khong[\\s\\S]*xuat hoa\\s+don[\\s\\S]*co can hoa don[\\s\\S]*app\\/search\\/page\\.tsx[\\s\\S]*merges local TTGDTX process-label\\s+matches before remote search results[\\s\\S]*Thu hoc phi \\(P2-10\\)[\\s\\S]*invoice\\/chung-tu questions[\\s\\S]*TTGDTX_PROCESS_CODE_MAP_20260625\\.md[\\s\\S]*audit-ttgdtx-process-labels\\.mjs[\\s\\S]*release-gate audits[\\s\\S]*This is navigation\\/discovery packaging only[\\s\\S]*does not approve invoice\\s+issuance, legal\\/tax interpretation, finance posting, UAT acceptance, owner\\s+waiver or production GO", "i"),
  "P2-10 natural invoice search fallback log entry",
);

requireText(
  "components/settings/user-create-form.tsx",
  literalPattern("id=\"password\"[\\s\\S]*type=\"password\"[\\s\\S]*autoComplete=\"new-password\"[\\s\\S]*minLength=\\{8\\}[\\s\\S]*aria-describedby=\"temporary-password-help\"[\\s\\S]*temporary-password-help[\\s\\S]*không gửi qua Codex\\/chat[\\s\\S]*kênh bảo mật[\\s\\S]*Không hiển thị key[\\s\\S]*không ghi log mật khẩu tạm", "i"),
  "user account temporary password UI guard",
);

requireText(
  "app/settings/actions.ts",
  literalPattern("(?=[\\s\\S]*unsafeTemporaryPasswords)(?=[\\s\\S]*password123)(?=[\\s\\S]*heu123456)(?=[\\s\\S]*normalizePasswordSignal)(?=[\\s\\S]*isUnsafeTemporaryPassword)(?=[\\s\\S]*emailLocalPart)(?=[\\s\\S]*nameParts)(?=[\\s\\S]*unsafe_temporary_password)", "i"),
  "user account temporary password server guard",
);

requireText(
  "app/settings/page.tsx",
  literalPattern("unsafe_temporary_password[\\s\\S]*Mật khẩu tạm quá dễ đoán[\\s\\S]*email\\/tên user[\\s\\S]*kênh bảo mật", "i"),
  "user account temporary password error message",
);

requireText(
  "scripts/audit-heu-user-account-security.mjs",
  literalPattern("Temporary password and real-user onboarding handling are guarded", "i"),
  "user account temporary password security audit script",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("User Account Temporary Password Guard[\\s\\S]*user-create-form\\.tsx[\\s\\S]*actions\\.ts[\\s\\S]*unsafe temporary passwords[\\s\\S]*audit-heu-user-account-security\\.mjs[\\s\\S]*does not create production accounts,\\s+send passwords, rotate keys, enable\\s+MFA, accept UAT or mark production GO", "i"),
  "user account temporary password guard log entry",
);

requireText(
  "components/settings/real-user-onboarding-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-real-user-onboarding-panel=\"P0-17\")(?=[\\s\\S]*Real user onboarding for accounting)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*USER-REAL-01)(?=[\\s\\S]*USER-REAL-05)(?=[\\s\\S]*Supabase Auth)(?=[\\s\\S]*User Scope Enforcement)(?=[\\s\\S]*P6-04)(?=[\\s\\S]*P2-18)(?=[\\s\\S]*P5-03)(?=[\\s\\S]*USER_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*passwords, temporary passwords, OTPs, password reset links,\\s+account activation\\/invite links)(?=[\\s\\S]*production GO)", "i"),
  "P0-17 real-user accounting onboarding guard",
);

requireText(
  "components/settings/real-user-onboarding-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-real-user-finance-lanes=\"P0-17-P5-03\")(?=[\\s\\S]*KHTC accounting operator)(?=[\\s\\S]*BGH read-only reviewer)(?=[\\s\\S]*Audit read-only reviewer)(?=[\\s\\S]*Phap Che contract\\/legal reviewer)(?=[\\s\\S]*Out-of-scope negative account)", "i"),
  "P0-17 real-user finance-accounting lanes",
);

requireText(
  "components/settings/real-user-onboarding-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-real-user-access-closure=\"P0-17-P6-04\")(?=[\\s\\S]*Real-user access closure after pilot\\/UAT)(?=[\\s\\S]*USER-CLOSE-01)(?=[\\s\\S]*USER-CLOSE-04)(?=[\\s\\S]*ACCESS_RETAIN \\/ REVOKE_OR_REDUCE \\/ BLOCKED)(?=[\\s\\S]*P6-04)(?=[\\s\\S]*P2-18)(?=[\\s\\S]*P5-03)(?=[\\s\\S]*soft-revoke\\/INACTIVE)(?=[\\s\\S]*passwords, temporary passwords, OTPs, password reset links)(?=[\\s\\S]*account activation\\/invite links)", "i"),
  "P0-17 real-user access closure guard",
);

requireText(
  "components/settings/real-user-onboarding-panel.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATES)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST)(?=[\\s\\S]*data-heu-finance-day-one-start-gates=\"P0-03_P0-10_P6-04_P0-14_P0-17\")(?=[\\s\\S]*Finance Day-1 start gates before real-accounting accounts)(?=[\\s\\S]*FIN_START_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Do not invite, create or activate any real-accounting account)(?=[\\s\\S]*controlled evidence outside Git\\/Codex\\/chat)(?=[\\s\\S]*Checklist:[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST)(?=[\\s\\S]*gate\\.requiredProof)(?=[\\s\\S]*gate\\.stopCondition)", "i"),
  "P0-17 finance Day-1 start gates before real-accounting accounts guard",
);

requireText(
  "components/settings/real-user-onboarding-panel.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE)(?=[\\s\\S]*data-heu-finance-day-one-account-activation=\"P0-17-P6-04\")(?=[\\s\\S]*Finance Day-1 account activation handoff)(?=[\\s\\S]*FIN_ACTIVATION_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*invite status, profile link, narrow scope and P6-04\\s+pre-login checks)(?=[\\s\\S]*without storing credentials or invite links)(?=[\\s\\S]*Template:[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE)(?=[\\s\\S]*item\\.requiredProof)(?=[\\s\\S]*item\\.stopCondition)", "i"),
  "P0-17 finance Day-1 account activation handoff guard",
);

requireAllText(
  "components/settings/real-user-onboarding-panel.tsx",
  [
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS",
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX",
    "data-heu-finance-day-one-p6-04-prelogin-matrix=\"P6-04-P0-17\"",
    "Finance Day-1 P6-04 pre-login route matrix",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "Record one P6-04 route/scope result before any real-accounting account opens P2-18, P5-03 or P2-17",
    "Negative-control account must be BLOCKED/EMPTY_SCOPED_STATE",
    "Matrix:",
    "item.rolloutOrder",
    "item.entryGate",
    "item.advanceGate",
    "item.accountLabel",
    "item.allowedBeforeFinanceLogin",
    "item.blockedBeforeFinanceLogin",
    "item.requiredResult",
    "item.stopCondition",
  ],
  "P0-17 finance Day-1 P6-04 pre-login matrix guard",
);

requireText(
  "components/settings/real-user-onboarding-panel.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RUNBOOK)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS)(?=[\\s\\S]*data-heu-finance-day-one-run-rehearsal=\"P0-17-P6-04-P2-18-P5-03-P2-17\")(?=[\\s\\S]*Finance Day-1 real-run rehearsal before expansion)(?=[\\s\\S]*FIN_DAY1_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*approved real-accounting account labels)(?=[\\s\\S]*does not create accounts, approve access, accept\\s+UAT, move money or mark production GO)(?=[\\s\\S]*Runbook:[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RUNBOOK)(?=[\\s\\S]*step\\.requiredAction)(?=[\\s\\S]*step\\.stopCondition)", "i"),
  "P0-17 finance Day-1 real-run rehearsal guard",
);

requireText(
  "components/settings/real-user-onboarding-panel.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE)(?=[\\s\\S]*data-heu-finance-day-one-result-ledger=\"P0-17-P6-04-P2-18-P5-03-P2-17\")(?=[\\s\\S]*Finance Day-1 result ledger for real users)(?=[\\s\\S]*Template:[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE)(?=[\\s\\S]*FIN_DAY1_RESULT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Record one controlled result row per approved account label and route)(?=[\\s\\S]*does not approve\\s+access, accept UAT, approve finance reliance, move money or mark\\s+production GO)(?=[\\s\\S]*lane\\.rolloutOrder)(?=[\\s\\S]*lane\\.entryGate)(?=[\\s\\S]*lane\\.advanceGate)(?=[\\s\\S]*lane\\.accountLabel)(?=[\\s\\S]*lane\\.requiredResult)(?=[\\s\\S]*lane\\.stopCondition)(?=[\\s\\S]*item\\.forbiddenContent)", "i"),
  "P0-17 finance Day-1 result ledger guard",
);

requireText(
  "components/settings/real-user-onboarding-panel.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES)(?=[\\s\\S]*data-heu-finance-day-one-access-closure-lanes=\"P0-17-FIN-USER\")(?=[\\s\\S]*Finance Day-1 sequential access closure lanes)(?=[\\s\\S]*Close one `FIN-USER` lane at a time)(?=[\\s\\S]*controlled P0-17 closure decision)(?=[\\s\\S]*lane\\.rolloutOrder)(?=[\\s\\S]*lane\\.accountLabel)(?=[\\s\\S]*lane\\.closureDecisionValue)(?=[\\s\\S]*lane\\.retainCondition)(?=[\\s\\S]*lane\\.reduceOrRevokeCondition)(?=[\\s\\S]*lane\\.nextLaneGate)(?=[\\s\\S]*lane\\.stopCondition)", "i"),
  "P0-17 finance Day-1 sequential access closure lanes guard",
);

requireText(
  "app/settings/page.tsx",
  literalPattern("RealUserOnboardingPanel[\\s\\S]*<RealUserOnboardingPanel \\/>[\\s\\S]*<UserCreateForm", ""),
  "settings page mounts real-user onboarding before create-user form",
);

requireText(
  "app/settings/scopes/page.tsx",
  literalPattern("RealUserOnboardingPanel[\\s\\S]*<RealUserOnboardingPanel \\/>[\\s\\S]*<UserCreateForm", ""),
  "scopes page mounts real-user onboarding before create-user form",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-14 Real User Access Closure Proof[\\s\\S]*data-p014-real-user-access-closure-proof=\"P0-17-P6-04\"[\\s\\S]*ttgdtx-production-evidence-binder\\.tsx[\\s\\S]*P0-17 access-closure decision[\\s\\S]*P2-18\\/P5-03 real-accounting reliance proof[\\s\\S]*ACCESS_RETAIN \\/ REVOKE_OR_REDUCE \\/ BLOCKED[\\s\\S]*does not create accounts[\\s\\S]*revoke live users[\\s\\S]*mark production GO", "i"),
  "P0-14 real-user access closure proof log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("(?=[\\s\\S]*Real User Access Closure Guard)(?=[\\s\\S]*data-heu-real-user-access-closure=\"P0-17-P6-04\")(?=[\\s\\S]*real-user-onboarding-panel\\.tsx)(?=[\\s\\S]*ACCESS_RETAIN)(?=[\\s\\S]*REVOKE_OR_REDUCE)(?=[\\s\\S]*BLOCKED)(?=[\\s\\S]*P6-04)(?=[\\s\\S]*P2-18)(?=[\\s\\S]*P5-03)(?=[\\s\\S]*soft-revoke)(?=[\\s\\S]*INACTIVE)(?=[\\s\\S]*does not create accounts[\\s\\S]*revoke live users[\\s\\S]*send passwords[\\s\\S]*approve role scope[\\s\\S]*accept UAT[\\s\\S]*approve finance action[\\s\\S]*mark production GO)", "i"),
  "P0-17 real-user access closure log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("(?=[\\s\\S]*Real User Accounting Onboarding Guard)(?=[\\s\\S]*real-user-onboarding-panel\\.tsx)(?=[\\s\\S]*UserAuthProfileLinkForm)(?=[\\s\\S]*KHTC\\/BGH\\/Audit\\/Phap Che)(?=[\\s\\S]*Out-of-scope negative account)(?=[\\s\\S]*P6-04)(?=[\\s\\S]*P2-18)(?=[\\s\\S]*P5-03)(?=[\\s\\S]*does not create production accounts[\\s\\S]*send passwords[\\s\\S]*approve role scope[\\s\\S]*accept UAT[\\s\\S]*approve finance action[\\s\\S]*mark production GO)", "i"),
  "P0-17 real-user accounting onboarding log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("(?=[\\s\\S]*Finance Day-1 Start Gate Evidence Checklist)(?=[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md)(?=[\\s\\S]*PASS_LOCAL_CHECKLIST)(?=[\\s\\S]*FIN-START-EVID-001)(?=[\\s\\S]*FIN-START-EVID-005)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST)(?=[\\s\\S]*real-user-onboarding-panel\\.tsx)(?=[\\s\\S]*ttgdtx-production-execution-queue\\.tsx)(?=[\\s\\S]*does not create accounts)(?=[\\s\\S]*send\\s+invites)(?=[\\s\\S]*store passwords)(?=[\\s\\S]*grant access)(?=[\\s\\S]*execute UAT)(?=[\\s\\S]*accept evidence)(?=[\\s\\S]*approve finance reliance)(?=[\\s\\S]*approve access closure)(?=[\\s\\S]*move money)(?=[\\s\\S]*mark production GO)", "i"),
  "finance Day-1 start-gate checklist log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("(?=[\\s\\S]*Finance Day-1 Start Gates Before Real Account Activation)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATES)(?=[\\s\\S]*FIN-START-01)(?=[\\s\\S]*FIN-START-05)(?=[\\s\\S]*data-heu-finance-day-one-start-gates=\"P0-03_P0-10_P6-04_P0-14_P0-17\")(?=[\\s\\S]*data-ttgdtx-finance-day-one-start-gates=\"P0-03_P0-10_P6-04_P0-14_P0-17\")(?=[\\s\\S]*FIN_START_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*does not create accounts)(?=[\\s\\S]*send\\s+invites)(?=[\\s\\S]*store passwords)(?=[\\s\\S]*grant access)(?=[\\s\\S]*execute UAT)(?=[\\s\\S]*accept evidence)(?=[\\s\\S]*approve finance reliance)(?=[\\s\\S]*approve access closure)(?=[\\s\\S]*move money)(?=[\\s\\S]*mark production GO)", "i"),
  "finance Day-1 start gates log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("(?=[\\s\\S]*Finance Day-1 Account Activation Handoff)(?=[\\s\\S]*HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630\\.md)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS)(?=[\\s\\S]*data-ttgdtx-finance-day-one-account-activation=\"P0-17_P6-04\")(?=[\\s\\S]*data-heu-finance-day-one-account-activation=\"P0-17-P6-04\")(?=[\\s\\S]*FIN-ACT-01 through FIN-ACT-05)(?=[\\s\\S]*FIN_ACTIVATION_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*does not create accounts)(?=[\\s\\S]*send\\s+invites)(?=[\\s\\S]*store passwords)(?=[\\s\\S]*approve access)(?=[\\s\\S]*mark production GO)", "i"),
  "finance Day-1 account activation handoff log entry",
);

requireAllText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "Finance Day-1 P6-04 Pre-Login Matrix",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX",
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS",
    "data-ttgdtx-finance-day-one-p6-04-prelogin-matrix=\"P6-04_P0-17\"",
    "data-heu-finance-day-one-p6-04-prelogin-matrix=\"P6-04-P0-17\"",
    "P6-04-PRELOGIN-01",
    "P6-04-PRELOGIN-05",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "rolloutOrder",
    "entryGate",
    "advanceGate",
    "FIN-USER-01",
    "FIN-USER-05",
    "does not create accounts",
    "send",
    "invites",
    "store passwords",
    "execute UAT",
    "grant access",
    "accept route evidence",
    "approve finance action",
    "move money",
    "mark production GO",
  ],
  "finance Day-1 P6-04 pre-login matrix log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("(?=[\\s\\S]*Finance Day-1 Result Ledger Guard)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS)(?=[\\s\\S]*data-ttgdtx-finance-day-one-result-ledger=\"P0-17_P6-04_P2-18_P5-03_P2-17\")(?=[\\s\\S]*data-heu-finance-day-one-result-ledger=\"P0-17-P6-04-P2-18-P5-03-P2-17\")(?=[\\s\\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\\s\\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\\s\\S]*FIN_DAY1_RESULT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*does not create accounts[\\s\\S]*send passwords[\\s\\S]*grant access[\\s\\S]*accept UAT[\\s\\S]*approve finance action[\\s\\S]*mark production GO)", "i"),
  "finance Day-1 result ledger log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("(?=[\\s\\S]*Finance Day-1 Result Ledger Template)(?=[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md)(?=[\\s\\S]*PASS_LOCAL_TEMPLATE)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE)(?=[\\s\\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\\s\\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\\s\\S]*FIN_DAY1_RESULT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*ACCESS_RETAIN \\/ REVOKE_OR_REDUCE \\/ BLOCKED)(?=[\\s\\S]*does not collect evidence[\\s\\S]*create accounts[\\s\\S]*send passwords[\\s\\S]*approve finance action[\\s\\S]*issue bank instructions[\\s\\S]*mark production GO)", "i"),
  "finance Day-1 result ledger template log entry",
);

requireAllText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "Finance Day-1 Sequential Real User Rollout",
    "PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES",
    "rolloutOrder",
    "entryGate",
    "advanceGate",
    "FIN-USER-01",
    "FIN-USER-05",
    "one account lane at a time",
    "controlled result row",
    "P0-17 access closure",
    "does not create accounts",
    "send invites",
    "store passwords",
    "grant access",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve access closure",
    "expand departments or users",
    "move money",
    "mark production GO",
  ],
  "finance Day-1 sequential real-user rollout log entry",
);

requireAllText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "Finance Day-1 Sequential Access Closure Lanes",
    "PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES",
    "closureDecisionValue",
    "retainCondition",
    "reduceOrRevokeCondition",
    "blockCondition",
    "nextLaneGate",
    "data-heu-finance-day-one-access-closure-lanes=\"P0-17-FIN-USER\"",
    "data-ttgdtx-finance-day-one-access-closure-lanes=\"P0-17_FIN_USER\"",
    "data-p014-finance-day-one-access-closure-lanes=\"P0-17-FIN-USER\"",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
    "ACCESS_RETAIN",
    "REVOKE_OR_REDUCE",
    "BLOCKED",
    "does not create accounts",
    "send invites",
    "store passwords",
    "grant access",
    "revoke live users",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve access closure",
    "expand departments or users",
    "move money",
    "mark production GO",
  ],
  "finance Day-1 sequential access closure lanes log entry",
);

requireAllText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "Finance Day-1 Rollout Columns for Result Ledger Template",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "Rollout order",
    "Entry gate",
    "Advance gate",
    "FIN-USER-01",
    "FIN-USER-05",
    "PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS",
    "does not create accounts",
    "send invites",
    "store passwords",
    "grant access",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve access closure",
    "expand departments or users",
    "move money",
    "mark production GO",
  ],
  "finance Day-1 result ledger template rollout-columns log entry",
);

requireAllText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "Finance Day-1 Rollout Gates for Activation and Prelogin",
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS",
    "rolloutOrder",
    "entryGate",
    "advanceGate",
    "FIN-USER-01",
    "FIN-USER-05",
    "real-user-onboarding-panel.tsx",
    "ttgdtx-production-execution-queue.tsx",
    "HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "one lane at a time",
    "controlled result evidence",
    "P0-17 access closure",
    "does not create accounts",
    "send invites",
    "store passwords",
    "grant access",
    "execute UAT",
    "accept route evidence",
    "approve finance reliance",
    "approve access closure",
    "expand departments or users",
    "move money",
    "mark production GO",
  ],
  "finance Day-1 activation/pre-login rollout-gate log entry",
);

requireAllText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  [
    "P0-17",
    "User account temporary password security",
    "PASS_LOCAL",
    "real-user-onboarding-panel.tsx",
    "audit-heu-user-account-security.mjs",
    "finance Day-1 account activation handoff",
    "FIN_ACTIVATION_READY / NO_GO / BLOCKED",
    "HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
    "finance Day-1 P6-04 pre-login matrix",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "finance Day-1 real-run rehearsal",
    "HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED",
  ],
  "P0-17 user account temporary password backlog row",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("(?=[\\s\\S]*Current State User Account Security Alignment)(?=[\\s\\S]*HEU_CURRENT_STATE_INVENTORY\\.md)(?=[\\s\\S]*HEU_SYSTEM_BUILD_BACKLOG\\.md)(?=[\\s\\S]*user account temporary password guard)(?=[\\s\\S]*58-audit-script count)(?=[\\s\\S]*audit-heu-current-state-inventory\\.mjs)(?=[\\s\\S]*audit-heu-implementation-log\\.mjs)(?=[\\s\\S]*release-gate audits)(?=[\\s\\S]*current-state\\/backlog alignment only)(?=[\\s\\S]*does not create accounts)(?=[\\s\\S]*send passwords)(?=[\\s\\S]*approve role scope)(?=[\\s\\S]*mark production GO)", "i"),
  "current-state user account security alignment log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Current State P6-06 Conversion Or Written Waiver Wording[\\s\\S]*HEU_CURRENT_STATE_INVENTORY\\.md[\\s\\S]*P6-06 priority action[\\s\\S]*hard-delete\\/cascade findings need conversion or a\\s+written waiver[\\s\\S]*not a generic waiver[\\s\\S]*audit-heu-current-state-inventory\\.mjs[\\s\\S]*P6-06 blocker summary loses the conversion-or-written\\s+waiver requirement[\\s\\S]*This is current-state wording alignment only[\\s\\S]*does not approve production\\s+deletion, cascade execution, waiver, conversion migration, data cleanup,\\s+evidence acceptance, owner GO\\/NO-GO or production GO", "i"),
  "current-state P6-06 conversion-or-written-waiver wording log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Account-Control Guard Vietnamese Copy Polish[\\s\\S]*ttgdtx-account-control-scope-guard\\.tsx[\\s\\S]*phong tỏa\\/giải tỏa tài khoản and giải chấp separation\\s+guidance uses clear Vietnamese with accents[\\s\\S]*Vietnamese titles, `Phạm vi` and `Ranh giới`[\\s\\S]*metadata-only, no-bank-operation and no-production-GO\\s+boundaries[\\s\\S]*audit:ttgdtx-account-control-scope-decision[\\s\\S]*audit:ttgdtx-release-gates[\\s\\S]*accented Vietnamese copy and scope\\s+boundary cannot silently regress[\\s\\S]*This is UI copy and audit alignment only[\\s\\S]*does not collect evidence,\\s+execute UAT, create a bank workflow, approve account freeze\\/release, approve\\s+collateral release, approve finance action or mark production GO", "i"),
  "account-control guard Vietnamese copy polish log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("TTGDTX Production Guard Vietnamese Copy Polish[\\s\\S]*ttgdtx-production-readiness-guard\\.tsx[\\s\\S]*PASS_LOCAL, no-production-migration, no-real-data and safe\\s+iteration guidance uses clear Vietnamese with accents[\\s\\S]*audit:ttgdtx-production-readiness-guard[\\s\\S]*audit:ttgdtx-release-gates[\\s\\S]*accented Vietnamese guidance and\\s+PASS_LOCAL\\/NO-GO boundary cannot silently regress[\\s\\S]*This is UI copy and audit alignment only[\\s\\S]*does not collect evidence,\\s+execute UAT, approve migration, approve finance action, approve owner waiver\\s+or mark production GO", "i"),
  "TTGDTX production guard Vietnamese copy polish log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-13 TTGDTX Guard Shared Blocker Coverage[\\s\\S]*audit:heu-production-blocker-source[\\s\\S]*TTGDTX landing guard,\\s+Master Control blocker summary and TTGDTX production execution queue must all\\s+render from `lib\\/production-readiness\\.ts`[\\s\\S]*P0-13 backlog row, production checklist and current-state\\s+inventory[\\s\\S]*shared blocker source explicitly covers the TTGDTX landing\\s+guard[\\s\\S]*current-state and release-gate audits[\\s\\S]*cannot silently drift\\s+back to only Master Control plus execution queue coverage[\\s\\S]*This is shared-source coverage alignment only[\\s\\S]*does not collect evidence,\\s+execute UAT, approve migration, approve finance action, approve owner waiver\\s+or mark production GO", "i"),
  "P0-13 TTGDTX guard shared blocker coverage log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("TTGDTX Production Guard Shared Blocker Source[\\s\\S]*ttgdtx-production-readiness-guard\\.tsx[\\s\\S]*renders `PRODUCTION_BLOCKERS` from\\s+`lib\\/production-readiness\\.ts` instead of maintaining a shorter local blocker\\s+list[\\s\\S]*backlog, production checklist and current-state inventory[\\s\\S]*TTGDTX guard, Master Control blocker summary and production execution queue\\s+remain tied to the same shared blocker source[\\s\\S]*audit:ttgdtx-production-readiness-guard[\\s\\S]*local\\s+`readinessBlockers` array cannot silently reappear[\\s\\S]*This is UI\\/source alignment only[\\s\\S]*does not collect evidence, execute UAT,\\s+approve migration, approve finance action, approve owner waiver or mark\\s+production GO", "i"),
  "TTGDTX production guard shared blocker source log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P6-04 Post-UAT Access Closure Handoff[\\s\\S]*HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627\\.md[\\s\\S]*P0-17 access\\s+closure review[\\s\\S]*post-UAT access closure[\\s\\S]*audit-heu-role-scope-uat-pack\\.mjs[\\s\\S]*audit-heu-current-state-inventory\\.mjs[\\s\\S]*audit-heu-implementation-log\\.mjs[\\s\\S]*audit-ttgdtx-release-gates\\.mjs[\\s\\S]*role-scope handoff packaging only[\\s\\S]*does not create accounts[\\s\\S]*revoke live users[\\s\\S]*mark production GO", "i"),
  "P6-04 post-UAT access closure handoff log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-03 Restore Access Closure State Preservation[\\s\\S]*supabase-backup-restore-guard\\.tsx[\\s\\S]*STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627\\.md[\\s\\S]*P0-17 access closure states[\\s\\S]*ACCESS_RETAIN[\\s\\S]*REVOKE_OR_REDUCE[\\s\\S]*BLOCKED[\\s\\S]*P0-17 access closure state preservation[\\s\\S]*audit-ttgdtx-backup-restore-dry-run-pack\\.mjs[\\s\\S]*audit-heu-current-state-inventory\\.mjs[\\s\\S]*audit-heu-implementation-log\\.mjs[\\s\\S]*audit-ttgdtx-release-gates\\.mjs[\\s\\S]*backup\\/restore control packaging only[\\s\\S]*does not execute backup[\\s\\S]*access revocation[\\s\\S]*production GO", "i"),
  "P0-03 restore access closure state preservation log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-08 UAT Route 11 Access Closure Handoff[\\s\\S]*lib\\/production-readiness\\.ts[\\s\\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\\.md[\\s\\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\\.md[\\s\\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\\.md[\\s\\S]*UAT-ROUTE-11 P0-09 final\\s+owner GO\\/NO-GO[\\s\\S]*P0-17 access closure decision[\\s\\S]*evidence binder, migration, backup, role, audit and risk-closure references[\\s\\S]*HEU_CURRENT_STATE_INVENTORY\\.md[\\s\\S]*route-handoff packaging only[\\s\\S]*does not execute UAT[\\s\\S]*revoke live users[\\s\\S]*mark production GO", "i"),
  "P0-08 UAT route 11 access closure handoff log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-09 Owner Signoff Access Closure Decision Gate[\\s\\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\\.md[\\s\\S]*ttgdtx-owner-go-no-go-evidence-checklist\\.tsx[\\s\\S]*P0-17 access closure decision[\\s\\S]*P6-04 role\\/workspace UAT[\\s\\S]*P6-03 audit traceability[\\s\\S]*P6-06 hard-delete\\/cascade proof[\\s\\S]*HEU_SYSTEM_BUILD_BACKLOG\\.md[\\s\\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\\.md[\\s\\S]*owner-signoff packaging only[\\s\\S]*does not create accounts[\\s\\S]*revoke live users[\\s\\S]*mark production GO", "i"),
  "P0-09 owner signoff access closure decision gate log entry",
);

requireSectionTokens(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "2026-06-29 - P0-15 Final Handoff Access Closure Proof Alignment",
  [
    "AGENTS.md",
    "lib/production-readiness.ts",
    "P0-17 access closure decision",
    "P2-18/P5-03 real-accounting finance reliance proof",
    "HEU_SYSTEM_BUILD_BACKLOG.md",
    "TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
    "HEU_CURRENT_STATE_INVENTORY.md",
    "final handoff cannot omit the",
    "access closure decision",
    "final-handoff packaging only",
    "does not create accounts",
    "revoke live users",
    "mark production GO",
  ],
  "P0-15 final handoff access closure proof alignment log entry",
);

requireSectionTokens(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  "2026-06-29 - P0-15 Final Handoff Finance Reliance Proof Alignment",
  [
    "AGENTS.md",
    "lib/production-readiness.ts",
    "P0-14 finance reliance evidence checkpoint",
    "P2-18/P5-03 real-accounting finance reliance proof",
    "HEU_SYSTEM_BUILD_BACKLOG.md",
    "TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
    "HEU_CURRENT_STATE_INVENTORY.md",
    "final handoff cannot omit the",
    "real-accounting reliance proof",
    "final-handoff packaging only",
    "does not collect evidence",
    "create accounts",
    "mark production GO",
  ],
  "P0-15 final handoff finance reliance proof alignment log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-15 Final Handoff Owner Decision Manifest Alignment[\\s\\S]*AGENTS\\.md[\\s\\S]*lib\\/production-readiness\\.ts[\\s\\S]*HEU_SYSTEM_BUILD_BACKLOG\\.md[\\s\\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\\.md[\\s\\S]*HEU_CURRENT_STATE_INVENTORY\\.md[\\s\\S]*P0-15 final handoff summaries must\\s+include the P0-09 final owner decision manifest alongside the P0-09\\s+sign-off\\/UAT handoff evidence path[\\s\\S]*final-handoff, production-blocker-source, production-evidence,\\s+current-state, implementation-log and release-gate audits[\\s\\S]*This is final-handoff packaging only[\\s\\S]*does not collect evidence, accept\\s+evidence, execute UAT, approve migration, approve finance action, approve\\s+owner waiver or mark production GO", "i"),
  "P0-15 final handoff owner decision manifest alignment log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-09 Final Owner Decision Manifest Shared Source Alignment[\\s\\S]*lib\\/production-readiness\\.ts[\\s\\S]*P0-09 and P0-14-09 shared source\\s+wording requires the final owner decision manifest alongside the owner\\s+sign-off pack, UAT operator handoff and redacted evidence references[\\s\\S]*production-blocker-source, production-evidence-binder,\\s+implementation-log and release-gate audits[\\s\\S]*final owner decision cannot\\s+drift back to a generic sign-off note[\\s\\S]*This is shared-source wording and guard alignment only[\\s\\S]*does not collect\\s+evidence, accept evidence, execute UAT, approve migration, approve finance\\s+action, approve owner waiver or mark production GO", "i"),
  "P0-09 final owner decision manifest shared source alignment log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P5-02 P0-14 Intake Ledger Action Queue Alignment[\\s\\S]*Master Control blocker summary and TTGDTX production execution\\s+queue[\\s\\S]*P0-14 intake-ledger evidence\\s+binder before P0-15 final handoff and owner GO\\/NO-GO[\\s\\S]*BGH operating dashboard spec, backlog, production checklist and\\s+current-state inventory[\\s\\S]*does not reduce\\s+P0-14 to a generic evidence binder[\\s\\S]*BGH dashboard, current-state, implementation-log, production\\s+readiness and release-gate audits[\\s\\S]*This is management-queue wording and guard alignment only[\\s\\S]*does not\\s+collect evidence, accept evidence, execute UAT, approve migration, approve\\s+finance action, approve owner waiver or mark production GO", "i"),
  "P5-02 P0-14 intake ledger action queue alignment log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-15 Final Handoff Evidence Intake Ledger Alignment[\\s\\S]*AGENTS\\.md[\\s\\S]*P0-14 controlled evidence intake ledger, redaction reviewer and owner\\s+signature state alongside P0-03\\/P0-09\\/P0-13\\/P0-14 evidence paths[\\s\\S]*lib\\/production-readiness\\.ts[\\s\\S]*HEU_SYSTEM_BUILD_BACKLOG\\.md[\\s\\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\\.md[\\s\\S]*HEU_CURRENT_STATE_INVENTORY\\.md[\\s\\S]*cannot treat the P0-14\\s+evidence binder as complete without intake-ledger proof[\\s\\S]*final-handoff, current-state, implementation-log and release-gate\\s+audits[\\s\\S]*This is final-handoff packaging only[\\s\\S]*does not collect evidence, accept\\s+evidence, execute UAT, approve migration, approve finance action, approve\\s+owner waiver or mark production GO", "i"),
  "P0-15 final handoff evidence intake ledger alignment log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-13 Shared Source P0-03 P3 Gate Proof[\\s\\S]*HEU_SYSTEM_BUILD_BACKLOG\\.md[\\s\\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\\.md[\\s\\S]*P0-13 shared blocker\\s+source coverage[\\s\\S]*P0-03 restore smoke-check proof for P0-19\\/P3 gate\\s+preservation[\\s\\S]*operator run sheet and owner sign-off\\/UAT handoff\\s+path[\\s\\S]*audit-heu-production-blocker-source\\.mjs[\\s\\S]*backlog,\\s+checklist, current-state and shared P0-15 source checks fail[\\s\\S]*This is P0-13 source-alignment packaging only[\\s\\S]*does not execute backup,\\s+restore, migration dry-run, UAT, evidence acceptance, finance action, owner\\s+waiver or production GO", "i"),
  "P0-13 shared source P0-03/P3 gate proof log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-15 Final Handoff P0-03 P3 Gate Proof[\\s\\S]*AGENTS\\.md[\\s\\S]*lib\\/production-readiness\\.ts[\\s\\S]*HEU_SYSTEM_BUILD_BACKLOG\\.md[\\s\\S]*TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST\\.md[\\s\\S]*HEU_CURRENT_STATE_INVENTORY\\.md[\\s\\S]*P0-03\\s+restore smoke-check proof for P0-19\\/P3 gate preservation[\\s\\S]*final-handoff, current-state and release-gate audits[\\s\\S]*This is final-handoff packaging only[\\s\\S]*does not execute backup, restore,\\s+migration dry-run, UAT, evidence acceptance, finance action, owner waiver or\\s+production GO", "i"),
  "P0-15 final handoff P0-03/P3 gate proof log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Production Priority Blocker List Alignment[\\s\\S]*P0-14 evidence binder[\\s\\S]*P0-15 final handoff coverage[\\s\\S]*P0-05\\s+implementation-log audit[\\s\\S]*audit:heu-production-evidence-binder[\\s\\S]*audit:heu-final-handoff-coverage[\\s\\S]*audit:heu-implementation-log[\\s\\S]*audit:ttgdtx-release-gates[\\s\\S]*This is checklist-priority alignment only[\\s\\S]*does not collect evidence,\\s+execute UAT, approve migration, approve finance action or mark production GO", "i"),
  "production priority blocker list alignment log entry",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("highest priority blockers[\\s\\S]*Close P0-14 production evidence binder[\\s\\S]*controlled evidence intake ledger[\\s\\S]*redaction reviewer[\\s\\S]*P2-18\\/P5-03\\/P6-04 finance reliance evidence checkpoint with P0-17 access closure decision[\\s\\S]*Run P0-15 final handoff coverage[\\s\\S]*P0-03 restore smoke-check proof for P0-19\\/P3 gate preservation[\\s\\S]*Keep P0-05 implementation log audit green[\\s\\S]*Complete role\\/workspace permission tests", "i"),
  "priority blocker list includes P0-14/P0-15/P0-05 before role tests",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("P0 controls include implementation-log discipline, backup\\/restore[\\s\\S]*P0-14 production evidence binder[\\s\\S]*P0-15 final\\s+handoff coverage[\\s\\S]*Production remains NO-GO until\\s+controlled external evidence and required owner signatures exist", "i"),
  "P0 Go/No-Go controls include P0-05/P0-14/P0-15 and external-evidence boundary",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0 Go No-Go Control Paragraph Alignment[\\s\\S]*P0 controls paragraph[\\s\\S]*implementation-log\\s+discipline[\\s\\S]*P0-14 evidence binder[\\s\\S]*P0-15 final handoff coverage[\\s\\S]*Production remains NO-GO until controlled\\s+external evidence and required owner signatures exist[\\s\\S]*audit:heu-production-evidence-binder[\\s\\S]*audit:heu-final-handoff-coverage[\\s\\S]*audit:heu-implementation-log[\\s\\S]*audit:ttgdtx-release-gates[\\s\\S]*This is P0 control wording alignment only[\\s\\S]*does not collect evidence,\\s+execute UAT, approve migration, approve finance action or mark production GO", "i"),
  "P0 Go/No-Go control paragraph alignment log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Current State Inventory P0 Control Alignment[\\s\\S]*current-state inventory[\\s\\S]*P0\\s+Go\\/No-Go control paragraph alignment[\\s\\S]*audit:heu-current-state-inventory[\\s\\S]*audit:heu-implementation-log[\\s\\S]*audit:ttgdtx-release-gates[\\s\\S]*This is current-state inventory alignment only[\\s\\S]*does not collect evidence,\\s+execute UAT, approve migration, approve finance action or mark production GO", "i"),
  "current-state inventory P0 control alignment log entry",
);

requireAllText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  [
    "Finance Desk Day-1 Start Gate Evidence Checkpoint",
    'data-finance-desk-day-one-start-gate-evidence="P5-03-FIN-START"',
    "components/finance/finance-desk-uat-evidence-checklist.tsx",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "FIN_ACTIVATION_READY",
    "P6_04_PRELOGIN_READY",
    "HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md",
    "HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    "HEU_SYSTEM_BUILD_BACKLOG.md",
    "TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
    "HEU_CURRENT_STATE_INVENTORY.md",
    "audit-heu-finance-desk.mjs",
    "audit-ttgdtx-release-gates.mjs",
    "audit-heu-implementation-log.mjs",
    "does not create accounts",
    "send invites",
    "store passwords",
    "grant access",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve access closure",
    "move money",
    "issue bank instructions",
    "mark production GO",
  ],
  "Finance Desk Day-1 start-gate evidence checkpoint log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Finance Desk Read-Only Guard Packaging[\\s\\S]*\\/finance-desk[\\s\\S]*P5-03[\\s\\S]*lib\\/vnd-money\\.ts[\\s\\S]*audit:heu-finance-desk[\\s\\S]*This is PASS_LOCAL packaging only[\\s\\S]*does not execute UAT, approve finance\\s+action, run production migration, accept evidence or mark production GO", "i"),
  "Finance Desk read-only guard packaging log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Finance Desk UAT Runbook Packaging[\\s\\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\\.md[\\s\\S]*contract-only denial[\\s\\S]*out-of-scope denial[\\s\\S]*audit:heu-finance-desk[\\s\\S]*audit:ttgdtx-release-gates[\\s\\S]*This is UAT packaging only[\\s\\S]*does not execute UAT, collect evidence,\\s+approve finance action, run production migration, accept evidence or mark\\s+production GO", "i"),
  "Finance Desk UAT runbook packaging log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Finance Desk No-Data Boundary Guard[\\s\\S]*FinanceDeskReadOnlyBoundary[\\s\\S]*no-access,\\s+missing-view and loaded-data states[\\s\\S]*Step90-Step111[\\s\\S]*backed-up UAT environment[\\s\\S]*This is UI safety packaging only[\\s\\S]*does not run Step111, execute UAT,\\s+approve migration, approve finance action, accept evidence or mark production\\s+GO", "i"),
  "Finance Desk no-data boundary guard log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Finance Desk Vietnamese Copy Clarity[\\s\\S]*status badges, KPI cards,\\s+missing-data state, source registry panel, control table and action links[\\s\\S]*audit:heu-finance-desk[\\s\\S]*audit:heu-vietnamese-text-encoding[\\s\\S]*audit:ttgdtx-release-gates[\\s\\S]*This is UI text clarity only[\\s\\S]*does not change finance calculation, run\\s+Step111, execute UAT, approve migration, approve finance action, accept\\s+evidence or mark production GO", "i"),
  "Finance Desk Vietnamese copy clarity log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Finance Desk UAT Evidence Checklist[\\s\\S]*finance-desk-uat-evidence-checklist\\.tsx[\\s\\S]*\\/finance-desk[\\s\\S]*P5-03\\s+browser UAT cases[\\s\\S]*no-secret evidence rules[\\s\\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\\.md[\\s\\S]*audit-heu-finance-desk\\.mjs[\\s\\S]*release-gate audits[\\s\\S]*This is UAT packaging only[\\s\\S]*does not execute UAT, collect evidence,\\s+approve finance action, approve dashboard reliance, run production migration\\s+or mark production GO", "i"),
  "Finance Desk UAT evidence checklist log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P5-03 Finance Desk Immediate Stop Guard[\\s\\S]*data-finance-desk-immediate-stop=\"P5-03\"[\\s\\S]*finance-desk-uat-evidence-checklist\\.tsx[\\s\\S]*statutory accounting[\\s\\S]*voucher posting[\\s\\S]*bank-transfer\\s+instruction[\\s\\S]*signed browser UAT[\\s\\S]*workspace-scope denial[\\s\\S]*contract-only\\/out-of-scope users see totals[\\s\\S]*raw sensitive evidence[\\s\\S]*audit:heu-finance-desk[\\s\\S]*audit:ttgdtx-release-gates[\\s\\S]*does not execute UAT[\\s\\S]*mark production GO", "i"),
  "Finance Desk immediate stop guard log entry",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P5-03 Finance Desk Reliance Decision Manifest[\\s\\S]*\\/finance-desk[\\s\\S]*KHTC,\\s+BGH, IT_DATA and AUDIT[\\s\\S]*HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\\.md[\\s\\S]*Finance Desk, current-state, implementation-log and release-gate\\s+audits[\\s\\S]*This is cockpit-reliance packaging only[\\s\\S]*does not approve finance action,\\s+statutory accounting, voucher posting, bank transfer, UAT acceptance,\\s+dashboard production reliance, owner waiver or production GO", "i"),
  "Finance Desk reliance decision manifest log entry",
);

requireText(
  "app/finance-desk/page.tsx",
  literalPattern("(?=[\\s\\S]*FinanceDeskPage)(?=[\\s\\S]*formatVndAmount)(?=[\\s\\S]*canOpenFinanceDesk)(?=[\\s\\S]*FinanceDeskReadOnlyBoundary)(?=[\\s\\S]*data-finance-desk-readonly-boundary=\"P5-03\")(?=[\\s\\S]*ttgdtx_accounting_dashboard_summary)(?=[\\s\\S]*ttgdtx_tuition_import_batch_readiness)(?=[\\s\\S]*ttgdtx_accounting_dashboard_control_board)(?=[\\s\\S]*dashboard không tự phê duyệt)(?=[\\s\\S]*không khởi tạo lệnh chuyển tiền)(?=[\\s\\S]*Production remains NO-GO until)", "i"),
  "Finance Desk read-only scoped route",
);

requireText(
  "app/finance-desk/page.tsx",
  literalPattern("(?=[\\s\\S]*const financeDeskRelianceItems[\\s\\S]*P5-03-REL-01[\\s\\S]*P5-03-REL-06)(?=[\\s\\S]*function FinanceDeskRelianceDecisionManifest\\(\\)[\\s\\S]*data-finance-desk-reliance-decision-manifest=\"P5-03\"[\\s\\S]*P5-03 Finance Desk reliance decision manifest: PASS_LOCAL only[\\s\\S]*P5_03_RELIANCE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*does not approve\\s+finance action, statutory accounting, voucher posting, bank\\s+transfer, UAT acceptance, dashboard production reliance, owner\\s+waiver or production GO)", "i"),
  "Finance Desk reliance decision manifest route",
);

requireText(
  "components/finance/finance-day-one-accountant-handoff.tsx",
  literalPattern("(?=[\\s\\S]*data-finance-day-one-accountant-handoff=\"P5-03_FIN_DAY1_OPERATOR\")(?=[\\s\\S]*Finance Day-1 accountant handoff: read-only pilot)(?=[\\s\\S]*FIN_ACCOUNTANT_HANDOFF_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*FIN-ACCT-HANDOFF-01[\\s\\S]*Allowed read-only review)(?=[\\s\\S]*FIN-ACCT-HANDOFF-04[\\s\\S]*Day-1 evidence closure)(?=[\\s\\S]*Data variance goes to KHTC owner)(?=[\\s\\S]*route\\/scope issue goes to IT_DATA)(?=[\\s\\S]*legal\\/source exception goes to PHAP_CHE)(?=[\\s\\S]*access leak goes to Audit)(?=[\\s\\S]*HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702\\.md)(?=[\\s\\S]*start conditions)(?=[\\s\\S]*read-only steps)(?=[\\s\\S]*forbidden content)(?=[\\s\\S]*post vouchers, move money, issue\\s+bank instructions or mark production GO)", "i"),
  "Finance Day-1 accountant handoff component",
);

requireAllText(
  "docs/HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
  [
    "Status: PASS_LOCAL_OPERATOR_GUIDE",
    "Production status: NO-GO",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN-ACCT-GUIDE-01",
    "FIN-ACCT-GUIDE-05",
    "controlled evidence location outside Git/Codex/chat",
    "/finance-desk",
    "/ttgdtx/accounting-dashboard",
    "Daily Operator Flow",
    "Escalation Rules",
    "Forbidden Content",
    "Passwords, temporary passwords, OTPs",
    "Service-role keys",
    "Raw PII, CCCD, bank data, vouchers or screenshots with secrets",
    "ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED",
    "do not rely on dashboard totals for production finance",
    "do not mark owner GO",
  ],
  "Finance Day-1 accountant operator guide",
);

requireText(
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-finance-desk-uat-evidence-checklist=\"P5-03\")(?=[\\s\\S]*P5-03 Finance Desk UAT evidence checklist: PASS_LOCAL only)(?=[\\s\\S]*P5-03-UAT-01)(?=[\\s\\S]*P5-03-UAT-09)(?=[\\s\\S]*data-finance-desk-acceptance-matrix=\"P5-03\")(?=[\\s\\S]*P5-03-ACCEPT-01)(?=[\\s\\S]*P5-03-ACCEPT-06)(?=[\\s\\S]*Signed browser UAT is still required)(?=[\\s\\S]*temporary passwords)(?=[\\s\\S]*password reset links)(?=[\\s\\S]*account activation\\/invite links)(?=[\\s\\S]*service-role keys stay outside Git\\/Codex\\/chat)(?=[\\s\\S]*PASS_LOCAL does not mean Finance Desk UAT passed)", "i"),
  "Finance Desk UAT evidence checklist component",
);

requireText(
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-finance-desk-immediate-stop=\"P5-03\")(?=[\\s\\S]*P5-03 Finance Desk immediate stop guard: PASS_LOCAL only)(?=[\\s\\S]*P5-03-STOP-01)(?=[\\s\\S]*P5-03-STOP-05)(?=[\\s\\S]*P5_03_STOP_CHECK \\/ GO_NEXT \\/ BLOCKED)(?=[\\s\\S]*statutory accounting, voucher posting, finance approval or a bank-transfer instruction)(?=[\\s\\S]*Signed browser UAT, source reconciliation, workspace-scope denial or the owner reliance decision is missing)(?=[\\s\\S]*Contract-only or out-of-scope users can see unrestricted Finance Desk totals)(?=[\\s\\S]*Dashboard\\/import\\/source-control totals differ without an owner note)(?=[\\s\\S]*Raw PII, CCCD, bank data, vouchers, payment evidence, passwords, temporary passwords, OTPs, password reset links, account activation\\/invite links or service-role keys)", "i"),
  "Finance Desk immediate stop guard component",
);

requireAllText(
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
  [
    "financeDayOneStartGateChecklistPath",
    'data-finance-desk-day-one-start-gate-evidence="P5-03-FIN-START"',
    "Finance Day-1 start-gate evidence before Finance Desk trial",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "P0-03 backup and restore evidence accepted",
    "P0-10 controlled evidence redaction storage ready",
    "P0-14/P0-17 result and access-closure paths ready",
    "human owner boundary accepted",
    "does not create accounts",
    "send invites",
    "store",
    "passwords",
    "grant access",
    "execute UAT",
    "accept evidence",
    "approve finance reliance",
    "approve access closure",
    "move money",
    "issue bank",
    "instructions",
    "mark production GO",
  ],
  "Finance Desk Day-1 start-gate evidence panel",
);

requireText(
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-finance-desk-day-one-result-ledger=\"P5-03-FIN-DAY1\")(?=[\\s\\S]*Finance Day-1 result ledger:\\s*PASS_LOCAL only)(?=[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md)(?=[\\s\\S]*FIN_DAY1_RESULT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*ACCESS_RETAIN \\/ REVOKE_OR_REDUCE \\/ BLOCKED)(?=[\\s\\S]*FIN-DAY1-EVID-001)(?=[\\s\\S]*FIN-DAY1-EVID-005)(?=[\\s\\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\\s\\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\\s\\S]*does not create accounts)(?=[\\s\\S]*store credentials)(?=[\\s\\S]*accept UAT)(?=[\\s\\S]*approve finance reliance)(?=[\\s\\S]*move money)(?=[\\s\\S]*issue\\s+bank instructions)(?=[\\s\\S]*mark production GO)", "i"),
  "Finance Desk Day-1 result ledger panel",
);

requireText(
  "app/finance-desk/page.tsx",
  literalPattern("import \\{ FinanceDayOneAccountantHandoff \\}[\\s\\S]*import \\{ FinanceDeskUatEvidenceChecklist \\}[\\s\\S]*<FinanceDeskReadOnlyBoundary \\/>[\\s\\S]*<FinanceOfficialOperationGate \\/>[\\s\\S]*<FinanceDayOneAccountantHandoff \\/>[\\s\\S]*<FinanceDeskRelianceDecisionManifest \\/>[\\s\\S]*<FinanceDeskUatEvidenceChecklist \\/>[\\s\\S]*!canOpen", "i"),
  "Finance Desk UAT evidence checklist mounted before access states",
);

requireText(
  "app/finance-desk/page.tsx",
  literalPattern("<FinanceDeskReadOnlyBoundary \\/>[\\s\\S]*!canOpen[\\s\\S]*dataError[\\s\\S]*Chưa đọc được đầy đủ Finance Desk[\\s\\S]*Step90-Step111[\\s\\S]*đã backup", "i"),
  "Finance Desk missing-view state keeps read-only boundary visible",
);

requireText(
  "database/step111_heu_finance_desk.sql",
  literalPattern("Step 111 - HEU Finance Desk[\\s\\S]*Migration candidate only\\. Do not run production migration from Codex\\/chat[\\s\\S]*finance_desk\\.read[\\s\\S]*enable row level security[\\s\\S]*can_read_finance_desk[\\s\\S]*write_audit_log[\\s\\S]*commit;", "i"),
  "Step111 Finance Desk migration candidate boundary",
);

requireText(
  "docs/modules/HEU_FINANCE_DESK_MVP_SPEC_20260627.md",
  literalPattern("Status:\\s*DRAFT_CONTROL[\\s\\S]*Production status:\\s*NO-GO[\\s\\S]*not statutory accounting software[\\s\\S]*All finance mutations still happen in the source P2 screens[\\s\\S]*Finance Desk does not approve payment[\\s\\S]*AI may summarize, validate and warn only", "i"),
  "Finance Desk MVP spec boundary",
);

requireAllText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  [
    "P5-03",
    "HEU Finance Desk read-only cockpit",
    "PASS_LOCAL",
    "app/finance-desk/page.tsx",
    "finance-day-one-accountant-handoff.tsx",
    "database/step111_heu_finance_desk.sql",
    "HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    "HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "audit:heu-finance-desk",
    "immediate stop guard",
    "real accounting user evidence bridge",
    "Finance Day-1 start-gate evidence checkpoint",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "Finance Day-1 result ledger",
    "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "P5-03 reliance decision manifest",
    "Finance safe pilot order",
    "FIN_PILOT_READY / NO_GO / BLOCKED",
    "Finance Day-1 accountant handoff",
    "FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN-ACCT-HANDOFF-01",
    "FIN-ACCT-HANDOFF-04",
    "FIN-ACCT-GUIDE-01",
    "FIN-ACCT-GUIDE-05",
    "accountant operator guide",
    "read-only operator steps",
    "forbidden content",
    "blocked finance actions",
    "escalation route",
    "FIN-PILOT-01",
    "FIN-PILOT-05",
    "access closure before expansion",
    "signed finance/dashboard UAT and reliance decision still required",
  ],
  "P5-03 Finance Desk backlog row",
);

requireAllText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  [
    "HEU Finance Desk read-only cockpit",
    "PASS_LOCAL",
    "app/finance-desk/page.tsx",
    "finance-day-one-accountant-handoff.tsx",
    "database/step111_heu_finance_desk.sql",
    "HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    "HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "audit:heu-finance-desk",
    "P5-03 immediate stop guard",
    "real accounting user evidence bridge",
    "Finance Day-1 start-gate evidence checkpoint",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "Finance Day-1 result ledger",
    "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "P5-03 UAT acceptance matrix and P5-03 reliance decision manifest",
    "Finance safe pilot order",
    "FIN_PILOT_READY / NO_GO / BLOCKED",
    "Finance Day-1 accountant handoff",
    "FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN-ACCT-HANDOFF-01",
    "FIN-ACCT-HANDOFF-04",
    "FIN-ACCT-GUIDE-01",
    "FIN-ACCT-GUIDE-05",
    "accountant operator guide",
    "read-only operator steps",
    "forbidden content",
    "blocked finance actions",
    "escalation route",
    "FIN-PILOT-01",
    "FIN-PILOT-05",
    "safe pilot closure",
    "does not approve finance action, statutory accounting, voucher posting, bank transfer, production migration, UAT acceptance, dashboard production reliance or owner GO",
  ],
  "Finance Desk production checklist row",
);

requireAllText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  [
    "Finance Desk / KHTC cockpit",
    "read-only cockpit",
    "permission and workspace-scope gate",
    "UAT evidence checklist",
    "immediate stop guard",
    "real accounting user evidence bridge",
    "HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
    "Finance Day-1 start-gate evidence checkpoint",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "Finance Day-1 result ledger",
    "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "P5-03 reliance decision manifest",
    "Finance safe pilot order",
    "FIN_PILOT_READY / NO_GO / BLOCKED",
    "Finance Day-1 accountant handoff",
    "FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED",
    "HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN-ACCT-HANDOFF-01",
    "FIN-ACCT-HANDOFF-04",
    "FIN-ACCT-GUIDE-01",
    "FIN-ACCT-GUIDE-05",
    "read-only operator steps",
    "forbidden content",
    "escalation route",
    "FIN-PILOT-01",
    "FIN-PILOT-05",
    "access closure before expansion",
    "Signed browser UAT and reliance decision pending",
  ],
  "Finance Desk current-state inventory start-gate row",
);

requireText(
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
  literalPattern("Status:\\s*PASS_LOCAL_TEMPLATE[\\s\\S]*P5-03-UAT-01[\\s\\S]*P5-03-UAT-09[\\s\\S]*P5-03-ACCEPT-01[\\s\\S]*P5-03-ACCEPT-06[\\s\\S]*Final result remains NO-GO until all required owners sign", "i"),
  "Finance Desk UAT runbook matrix",
);

requireAllText(
  "docs/HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md",
  [
    "Status: PASS_LOCAL_PLAN",
    "P5-03 Finance Desk controlled trial",
    "Production status: NO-GO",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "FIN_START_READY / NO_GO / BLOCKED",
    "FIN-START-EVID-001",
    "FIN-START-EVID-005",
    "P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED",
    "FIN_PILOT_READY / NO_GO / BLOCKED",
    "FIN_ACCOUNTANT_HANDOFF_READY / NO_GO / BLOCKED",
    "HEU_FINANCE_DAY1_ACCOUNTANT_OPERATOR_GUIDE_20260702.md",
    "FIN_ACCOUNTANT_GUIDE_READY / NO_GO / BLOCKED",
    "FIN-PILOT-01",
    "FIN-PILOT-05",
    "FIN-ACCT-GUIDE-01",
    "FIN-ACCT-GUIDE-05",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "/finance-desk",
    "/ttgdtx/accounting-dashboard",
    "FIN_START_READY",
    "FIN_ACTIVATION_READY",
    "P6_04_PRELOGIN_READY",
    "P5-03-TRIAL-01",
    "P5-03-TRIAL-08",
    "P5-03-TRIAL-EVID-001",
    "P5-03-TRIAL-EVID-005",
    "Finance Safe Pilot Order",
    "Finance Day-1 Accountant Handoff",
    "FIN-ACCT-HANDOFF-01",
    "FIN-ACCT-HANDOFF-04",
    "Data variance goes to KHTC owner",
    "route/scope issue goes to IT_DATA",
    "legal/source exception goes to PHAP_CHE",
    "access leak goes to Audit",
    "issue bank instructions",
    "access closure",
    "No bulk real-data import",
    "No auto gach no",
    "no COM production calculation",
    "no payment execution",
    "outside Git/Codex/chat",
    "Production remains NO-GO",
  ],
  "Finance Desk controlled trial plan release-gate file lock",
);

requireText(
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
  literalPattern("finance-desk-uat-evidence-checklist\\.tsx[\\s\\S]*data-finance-desk-uat-evidence-checklist=\"P5-03\"[\\s\\S]*P5-03-UAT-01 through\\s+P5-03-UAT-09[\\s\\S]*data-finance-desk-acceptance-matrix=\"P5-03\"[\\s\\S]*P5-03-ACCEPT-01 through P5-03-ACCEPT-06[\\s\\S]*data-finance-desk-immediate-stop=\"P5-03\"[\\s\\S]*P5-03-STOP-01 through\\s+P5-03-STOP-05[\\s\\S]*P5_03_STOP_CHECK \\/ GO_NEXT \\/ BLOCKED[\\s\\S]*data-finance-desk-real-user-evidence-bridge=\"P5-03-P6-04\"[\\s\\S]*P5-03-REAL-01 through P5-03-REAL-05[\\s\\S]*P5_03_REAL_USER_READY \\/ NO_GO \\/ BLOCKED", "i"),
  "Finance Desk UAT checklist component reference",
);

requireText(
  "components/finance/finance-desk-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-finance-desk-real-user-evidence-bridge=\"P5-03-P6-04\")(?=[\\s\\S]*P5-03 real accounting user evidence bridge)(?=[\\s\\S]*data-heu-real-accounting-user-uat-queue=\"P6-04-P2-18-P5-03\")(?=[\\s\\S]*data-heu-real-accounting-user-result-template=\"P6-04-P2-18-P5-03\")(?=[\\s\\S]*P5_03_REAL_USER_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P5-03-REAL-01)(?=[\\s\\S]*P5-03-REAL-05)(?=[\\s\\S]*KHTC accounting operator)(?=[\\s\\S]*Out-of-scope negative account)(?=[\\s\\S]*Do not paste real passwords)", "i"),
  "Finance Desk real accounting user evidence bridge UI",
);

requireText(
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
  literalPattern("(?=[\\s\\S]*Real Accounting User Evidence Bridge)(?=[\\s\\S]*data-heu-real-accounting-user-uat-queue=\"P6-04-P2-18-P5-03\")(?=[\\s\\S]*data-heu-real-accounting-user-result-template=\"P6-04-P2-18-P5-03\")(?=[\\s\\S]*P5-03-REAL-01)(?=[\\s\\S]*P5-03-REAL-05)(?=[\\s\\S]*Finance Desk evidence)", "i"),
  "Finance Desk real accounting user evidence bridge runbook",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  literalPattern("P5-03[\\s\\S]*finance-desk-uat-evidence-checklist\\.tsx[\\s\\S]*UAT evidence checklist[\\s\\S]*immediate stop guard[\\s\\S]*real accounting user evidence bridge[\\s\\S]*Finance Day-1 result ledger[\\s\\S]*P5-03 reliance decision manifest", "i"),
  "P5-03 Finance Desk UAT checklist backlog reference",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("HEU Finance Desk read-only cockpit[\\s\\S]*finance-desk-uat-evidence-checklist\\.tsx[\\s\\S]*P5-03 UAT evidence checklist[\\s\\S]*P5-03 immediate stop guard[\\s\\S]*real accounting user evidence bridge[\\s\\S]*Finance Day-1 result ledger[\\s\\S]*P5-03 UAT acceptance matrix", "i"),
  "Finance Desk production checklist UAT evidence checklist reference",
);

requireText(
  "docs/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md",
  literalPattern("(?=[\\s\\S]*Finance Desk Reliance Decision Manifest)(?=[\\s\\S]*Immediate stop guard)(?=[\\s\\S]*P5_03_RELIANCE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P5-03-REL-01[\\s\\S]*P5-03-REL-06)(?=[\\s\\S]*P5-03-ACCEPT-01 through P5-03-ACCEPT-06 and P5-03-REL-01 through\\s+P5-03-REL-06)", "i"),
  "Finance Desk reliance decision runbook matrix",
);

requireAllText(
  "AGENTS.md",
  [
    "Final handoff summaries must include",
    "git status --short --branch",
    "git rev-parse --short HEAD",
    "Stage D - internal controlled test only",
    "Production remains NO-GO",
    "P0-03 operator run sheet evidence path",
    "P0-03 restore smoke-check",
    "proof for P0-19/P3 gate preservation",
    "P0-09 owner sign-off/UAT handoff",
    "evidence path",
    "P0-09 final owner decision manifest",
    "P0-13 production",
    "blocker shared source",
    "P0-14 production evidence binder",
    "controlled evidence intake ledger",
    "redaction reviewer",
    "owner signature",
    "state, P2-18/P5-03 real-accounting finance reliance proof",
    "Finance Day-1",
    "start-gate checklist",
    "Finance Day-1 result ledger",
    "P0-17 access closure",
    "decision, separate P6-04 role/workspace",
    "P6-03 audit-log",
    "P6-06",
    "hard-delete/cascade proof paths",
    "HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md",
    "real evidence stays outside Git/Codex/chat",
  ],
  "P0-15 final handoff summary guard",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("Review dirty Git state[\\s\\S]*PASS_LOCAL[\\s\\S]*GIT_CLEANUP_ANALYSIS\\.md[\\s\\S]*audit:heu-git-hygiene[\\s\\S]*current exact ahead count must be verified live", "i"),
  "P0-02 Git hygiene checklist row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("Money input\\/display format[\\s\\S]*audit:vnd-money-format[\\s\\S]*P2-10 and P2-17 money forms share `lib\\/vnd-money\\.ts`[\\s\\S]*P2-18 dashboard and P5-03 Finance Desk display `1\\.000\\.000 đ`[\\s\\S]*without replacing dot separators with spaces", "i"),
  "P4-04 VND money input/display checklist row",
);

requireText(
  "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_PACK)(?=[\\s\\S]*This document does not approve production)(?=[\\s\\S]*Production remains NO-GO until the required owners review the evidence,[\\s\\S]*record\\s+their decision, and sign the final Go\\/No-Go decision)(?=[\\s\\S]*Codex\\/AI output is\\s+advisory only)(?=[\\s\\S]*Do not run production migration from Codex\\/chat)(?=[\\s\\S]*Do not mark production GO from Codex\\/chat)(?=[\\s\\S]*Do not paste secrets, passwords, temporary passwords, OTPs, password reset\\s+links, account activation\\/invite links, service-role keys, bank credentials,\\s+raw student PII, raw CCCD, raw phone numbers or raw payment data)(?=[\\s\\S]*Production backup and restore dry-run)(?=[\\s\\S]*Step90-Step110 migration order)(?=[\\s\\S]*P0-19 legal\\/finance gate)(?=[\\s\\S]*P3-01\\/P3-02 lead lifecycle and handover UAT)(?=[\\s\\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\\.md)(?=[\\s\\S]*P3-UAT-01 through P3-UAT-08)(?=[\\s\\S]*P0-19\\/P2-05\\/P2-03 finance gates)(?=[\\s\\S]*P2-17 payout once)(?=[\\s\\S]*P2-18 accounting dashboard)(?=[\\s\\S]*Role and workspace permission)(?=[\\s\\S]*P0-17 access closure decision)(?=[\\s\\S]*Audit log completeness)(?=[\\s\\S]*Hard-delete\\/cascade risk)(?=[\\s\\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\\.md)(?=[\\s\\S]*P6-06-FIND-001 through P6-06-FIND-044)(?=[\\s\\S]*Internal multi-account UAT)(?=[\\s\\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\\.md)(?=[\\s\\S]*P0-09 Owner GO\\/NO-GO Acceptance Matrix)(?=[\\s\\S]*P0_09_ACCEPT \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P0-09-ACCEPT-01)(?=[\\s\\S]*P0-09-ACCEPT-06)(?=[\\s\\S]*P0-17 access closure is missing)(?=[\\s\\S]*P0-09 Final Owner GO\\/NO-GO Decision Manifest)(?=[\\s\\S]*P0_09_FINAL_GO \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P0-09-DEC-01)(?=[\\s\\S]*P0-09-DEC-06)(?=[\\s\\S]*missing P0-17 access closure decision)(?=[\\s\\S]*Final production recommendation remains NO-GO until every required owner signs\\s+GO, P0-09-ACCEPT-01 through P0-09-ACCEPT-06 are accepted and no stop condition\\s+remains open)", "i"),
  "production owner sign-off pack local-only boundary",
);

requireText(
  "docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_PACK)(?=[\\s\\S]*This document does not approve\\s+production, UAT pass, backup completion, migration, finance action or owner\\s+Go\\/No-Go)(?=[\\s\\S]*Production remains NO-GO until required evidence is collected)(?=[\\s\\S]*Do not paste secrets, passwords, temporary passwords, OTPs, service-role\\s+keys, API keys, private keys, bank credentials, password reset links, account\\s+activation\\/invite links, raw student PII, raw CCCD, raw phone numbers, raw\\s+bank account numbers, bank statements, vouchers or raw payment data)(?=[\\s\\S]*Do not store raw controlled evidence in Git)(?=[\\s\\S]*PUBLIC_CONTROL)(?=[\\s\\S]*CONTROLLED_REDACTED)(?=[\\s\\S]*CONTROLLED_SENSITIVE)(?=[\\s\\S]*FORBIDDEN_IN_GIT_OR_CODEX)(?=[\\s\\S]*Receive evidence)(?=[\\s\\S]*Classify)(?=[\\s\\S]*Redact)(?=[\\s\\S]*Review)(?=[\\s\\S]*Reference)(?=[\\s\\S]*Sign)(?=[\\s\\S]*P0-10 Controlled Evidence Acceptance Matrix)(?=[\\s\\S]*P0_10_ACCEPT \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Temporary passwords, password reset links and account activation\\/invite links\\s+are forbidden in Git\\/Codex\\/chat)(?=[\\s\\S]*audit:heu-controlled-evidence-redaction-pack)", "i"),
  "controlled evidence redaction pack",
);

requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  literalPattern("P7-02 Read-Only Task Checklist Generator[\\s\\S]*local, read-only and template-based[\\s\\S]*TTGDTX UAT evidence[\\s\\S]*owner GO\\/NO-GO review[\\s\\S]*small build slices[\\s\\S]*must not:[\\s\\S]*Send prompts to an AI service[\\s\\S]*Save user-entered prompts[\\s\\S]*Call Supabase, RPC, mutation APIs or production workflows[\\s\\S]*Approve finance, accept UAT, waive evidence, run migration or mark production\\s+GO[\\s\\S]*P7-02 remains PASS_LOCAL only", "i"),
  "P7-02 read-only checklist generator policy",
);

requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  literalPattern("P7-03 Read-Only Risk Suggestion Board[\\s\\S]*static, read-only and advisory-only[\\s\\S]*missing evidence[\\s\\S]*role\\/workspace leaks[\\s\\S]*missing restore proof[\\s\\S]*duplicate payout[\\s\\S]*dashboard reconciliation[\\s\\S]*AI-output misuse[\\s\\S]*must not:[\\s\\S]*Score people, hide exceptions or suppress risk[\\s\\S]*Save risk decisions or write workflow data[\\s\\S]*Call Supabase, RPC, mutation APIs, AI services or production workflows[\\s\\S]*Approve finance, accept UAT, waive evidence, run migration or mark production\\s+GO[\\s\\S]*P7-03 remains PASS_LOCAL only", "i"),
  "P7-03 read-only risk suggestion board policy",
);
requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  literalPattern("P7-04 Prompt\\/Output Audit Logging Design[\\s\\S]*HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628\\.md[\\s\\S]*PASS_LOCAL_DESIGN[\\s\\S]*must not:[\\s\\S]*Call an AI service[\\s\\S]*Store live user prompts, files or raw evidence in Git, Codex or chat[\\s\\S]*Write workflow state, approve finance, accept UAT, waive evidence, run\\s+migration or mark production GO[\\s\\S]*P7-04 remains PASS_LOCAL_DESIGN only", "i"),
  "P7-04 prompt/output audit logging policy",
);
requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  literalPattern("P7-05 AI Delivery Team Operating Register[\\s\\S]*HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702\\.md[\\s\\S]*PASS_LOCAL_CONTROL[\\s\\S]*Create real autonomous AI workers[\\s\\S]*Send real email or create real software tasks from Codex[\\s\\S]*Execute UAT, accept evidence, approve finance action, approve owner GO,\\s+run production migration or mark production GO[\\s\\S]*TEAM_REGISTER_READY[\\s\\S]*does not enable\\s+autonomous AI, production deployment, UAT acceptance, evidence acceptance,\\s+finance approval or owner GO\\/NO-GO", "i"),
  "P7-05 AI delivery team operating policy",
);
requireText(
  "docs/HEU_AI_ASSISTANT_POLICY_20260627.md",
  literalPattern("P7-06 Cloud Agent Operating Plan[\\s\\S]*HEU_CLOUD_AGENT_OPERATING_PLAN_20260702\\.md[\\s\\S]*PASS_LOCAL_PLAN[\\s\\S]*budget range, owner setup requirements and stop conditions[\\s\\S]*Buy a server, enter a payment card or create cloud infrastructure[\\s\\S]*Create autonomous AI workers[\\s\\S]*repository tokens, OpenAI\\/API keys, SMTP credentials[\\s\\S]*Send real email, create real tasks\\/tickets, create real users[\\s\\S]*accept UAT[\\s\\S]*accept evidence[\\s\\S]*approve finance action[\\s\\S]*approve owner GO\\/NO-GO[\\s\\S]*run\\s+production migration or mark production GO[\\s\\S]*P7-06 remains PASS_LOCAL_PLAN only[\\s\\S]*CLOUD_AGENT_PLAN_READY[\\s\\S]*does not enable\\s+paid infrastructure, autonomous coding, production deployment, UAT acceptance,\\s+evidence acceptance, finance approval or owner GO\\/NO-GO", "i"),
  "P7-06 cloud agent operating policy",
);
requireText(
  "docs/HEU_CLOUD_AGENT_OPERATING_PLAN_20260702.md",
  literalPattern("Status:\\s*PASS_LOCAL_PLAN[\\s\\S]*Decision lane:\\s*CLOUD_AGENT_PLAN_READY \\/ NO_GO \\/ BLOCKED[\\s\\S]*Production status:\\s*NO-GO[\\s\\S]*Approved Budget Direction[\\s\\S]*Small cloud server[\\s\\S]*USD 10-20 per month[\\s\\S]*AI\\/API usage cap[\\s\\S]*USD 10-20 per month[\\s\\S]*Initial total cap[\\s\\S]*USD 20-40 per month[\\s\\S]*Do not treat this as permission for Codex to purchase services[\\s\\S]*Required Human Setup Outside Git\\/Codex\\/Chat[\\s\\S]*Kill switch and cancellation route documented[\\s\\S]*No-production\\/no-UAT\\/no-finance authority boundary signed[\\s\\S]*Stop Conditions[\\s\\S]*Production remains NO-GO", "i"),
  "P7-06 cloud agent operating plan",
);
requireText(
  "docs/HEU_AI_AGENT_SCOPE_REGISTER_20260627_V01_DRAFT.md",
  literalPattern("Cloud Agent Operating Scope[\\s\\S]*HEU_CLOUD_AGENT_OPERATING_PLAN_20260702\\.md[\\s\\S]*initial USD 20-40 monthly\\s+cap[\\s\\S]*owner setup requirements[\\s\\S]*allowed PASS_LOCAL work and stop conditions[\\s\\S]*must not buy a server, enter payment details, create cloud\\s+infrastructure, store secrets, send real email, create real tasks, create real\\s+users, accept UAT, accept evidence, approve finance action, approve owner GO,\\s+run production migration or mark production GO[\\s\\S]*CLOUD_AGENT_PLAN_READY \\/ NO_GO \\/ BLOCKED[\\s\\S]*Human authority owners remain responsible", "i"),
  "P7-06 AI agent scope register boundary",
);
requireText(
  "docs/HEU_AI_PROMPT_OUTPUT_AUDIT_LOGGING_DESIGN_20260628.md",
  literalPattern("Required Logical Records[\\s\\S]*AI_PROMPT_OUTPUT_AUDIT_LOG[\\s\\S]*AI_SCOPE_SOURCE_ACCESS_LOG[\\s\\S]*AI_ASSISTED_DECISION_LINK[\\s\\S]*AI_RISK_REVIEW_LOG[\\s\\S]*Minimum Event Fields[\\s\\S]*actor_user_id[\\s\\S]*workspace_scope[\\s\\S]*source_scope_refs[\\s\\S]*forbidden_action_flag[\\s\\S]*human_decision_status[\\s\\S]*Stop Conditions[\\s\\S]*AI suggests approval, payment, revenue recognition, account release,\\s+deletion, evidence hiding, migration approval or production GO", "i"),
  "P7-04 prompt/output audit logging design records and stops",
);

requireText(
  "components/ai/ai-task-checklist-generator.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-ai-task-checklist-generator=\"P7-02\")(?=[\\s\\S]*P7-02 AI task checklist generator)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*choose a small slice, run checks, commit only after pass, then\\s+continue)(?=[\\s\\S]*does not call AI, save prompts, write data, approve\\s+finance, accept UAT, run migration or mark production GO)(?=[\\s\\S]*TTGDTX UAT evidence run)(?=[\\s\\S]*Owner GO\\/NO-GO review)(?=[\\s\\S]*Small build slice)(?=[\\s\\S]*No production migration, no raw credentials, no hidden approval)(?=[\\s\\S]*Do not paste secrets, passwords, temporary passwords, OTPs,\\s+password reset links, account activation\\/invite links, service-role\\s+keys, bank credentials, raw student PII, raw CCCD, raw phone\\s+numbers, raw bank account numbers, bank statements, vouchers or raw\\s+payment data)(?=[\\s\\S]*PASS_LOCAL does not enable\\s+autonomous AI, prompt\\/output logging, production AI, production\\s+migration, finance action, UAT acceptance, owner waiver or production\\s+GO)", "i"),
  "P7-02 checklist generator UI boundary",
);

requireText(
  "components/ai/ai-risk-suggestion-board.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-ai-risk-suggestion-board=\"P7-03\")(?=[\\s\\S]*P7-03 AI risk suggestion board)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*review prompts for humans)(?=[\\s\\S]*does not call AI,\\s+score people, hide exceptions, write data, approve finance, accept\\s+UAT, waive evidence, run migration or mark production GO)(?=[\\s\\S]*AI-RISK-01)(?=[\\s\\S]*AI-RISK-06)(?=[\\s\\S]*AI output treated as approval)(?=[\\s\\S]*Human review required)(?=[\\s\\S]*AI never does)(?=[\\s\\S]*Do not paste secrets, passwords, temporary passwords, OTPs, password\\s+reset links, account activation\\/invite links, service-role keys, bank\\s+credentials, raw student PII, raw CCCD, raw phone numbers, raw bank\\s+account numbers, bank statements, vouchers or raw payment data)(?=[\\s\\S]*PASS_LOCAL does not enable autonomous AI, risk scoring, production\\s+AI, finance action, UAT acceptance, owner waiver or production GO)", "i"),
  "P7-03 risk suggestion board UI boundary",
);

requireText(
  "app/ai-assistant/page.tsx",
  literalPattern("AiTaskChecklistGenerator[\\s\\S]*AiRiskSuggestionBoard[\\s\\S]*<AiTaskChecklistGenerator\\s*\\/>[\\s\\S]*<AiRiskSuggestionBoard\\s*\\/>[\\s\\S]*ModulePage", "i"),
  "AI page mounts P7-02 task checklist generator and P7-03 risk board",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("No AI approval[\\s\\S]*PASS_LOCAL[\\s\\S]*ai-task-checklist-generator\\.tsx[\\s\\S]*ai-risk-suggestion-board\\.tsx[\\s\\S]*audit:heu-ai-policy", "i"),
  "No AI approval checklist row includes P7-02 guard",
);
requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("No AI approval[\\s\\S]*PASS_LOCAL[\\s\\S]*HEU_AI_DELIVERY_TEAM_OPERATING_REGISTER_20260702\\.md[\\s\\S]*P7-05 is PASS_LOCAL_CONTROL with TEAM_REGISTER_READY \\/ NO_GO \\/ BLOCKED only[\\s\\S]*cannot create autonomous AI workers, send real email, create real tasks, accept UAT\\/evidence, approve finance\\/owner decisions or mark production GO", "i"),
  "No AI approval checklist row includes P7-05 delivery-team control",
);
requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("No AI approval[\\s\\S]*PASS_LOCAL[\\s\\S]*HEU_CLOUD_AGENT_OPERATING_PLAN_20260702\\.md[\\s\\S]*P7-06 is PASS_LOCAL_PLAN with CLOUD_AGENT_PLAN_READY \\/ NO_GO \\/ BLOCKED only[\\s\\S]*USD 20-40 monthly planning cap[\\s\\S]*owner setup checklist and stop conditions[\\s\\S]*cannot buy a server, enter payment details, create cloud infrastructure, store secrets, create users, send real email, create real tasks, accept UAT\\/evidence, approve finance\\/owner decisions or mark production GO", "i"),
  "No AI approval checklist row includes P7-06 cloud-agent plan",
);

requireText(
  "components/audit/controlled-evidence-redaction-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-controlled-evidence-redaction-guard=\"P0-10\")(?=[\\s\\S]*P0-10 controlled evidence redaction\\/intake)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*Raw evidence stays outside\\s+Git\\/Codex\\/chat)(?=[\\s\\S]*Do not paste secrets, passwords, temporary passwords, OTPs,\\s+service-role keys, API keys, private keys, bank credentials,\\s+password reset links, account activation\\/invite links, raw\\s+student PII, raw CCCD, raw phone numbers, raw bank account\\s+numbers, bank statements, vouchers or raw payment data)(?=[\\s\\S]*PUBLIC_CONTROL)(?=[\\s\\S]*CONTROLLED_REDACTED)(?=[\\s\\S]*CONTROLLED_SENSITIVE)(?=[\\s\\S]*FORBIDDEN_IN_GIT_OR_CODEX)(?=[\\s\\S]*audit:heu-controlled-evidence-redaction-pack)(?=[\\s\\S]*does not\\s+prove evidence was collected, accepted, signed, or production-approved)", "i"),
  "controlled evidence redaction UI guard",
);

requireText(
  "components/audit/controlled-evidence-redaction-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-controlled-evidence-acceptance-matrix=\"P0-10\")(?=[\\s\\S]*P0-10 controlled evidence acceptance matrix)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P0_10_ACCEPT \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P0-10-ACCEPT-01)(?=[\\s\\S]*P0-10-ACCEPT-06)(?=[\\s\\S]*Evidence classified before use)(?=[\\s\\S]*Sensitive originals stay outside Git\\/Codex)(?=[\\s\\S]*Redaction preserves proof while removing private data)(?=[\\s\\S]*password reset links)(?=[\\s\\S]*account activation\\/invite links)(?=[\\s\\S]*Owner and Audit review recorded)(?=[\\s\\S]*Only safe references enter tracked work)(?=[\\s\\S]*Production boundary acknowledged)", "i"),
  "controlled evidence acceptance matrix UI",
);

requireText(
  "docs/HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*P0-14 Controlled Evidence Intake Ledger)(?=[\\s\\S]*data-p014-controlled-evidence-intake-ledger=\"P0-14\")(?=[\\s\\S]*P0_14_INTAKE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Evidence ID)(?=[\\s\\S]*Controlled folder reference)(?=[\\s\\S]*Evidence class)(?=[\\s\\S]*Redaction reviewer)(?=[\\s\\S]*Owner signature state)(?=[\\s\\S]*Blocker decision)(?=[\\s\\S]*PASS_LOCAL proves only that the intake-ledger structure exists)", "i"),
  "P0-14 controlled evidence intake ledger handoff",
);

requireText(
  "app/audit/page.tsx",
  literalPattern("ControlledEvidenceRedactionGuard[\\s\\S]*<ControlledEvidenceRedactionGuard \\/>[\\s\\S]*TtgdtxAuditTrailGuard[\\s\\S]*HardDeleteBoundaryGuard", "i"),
  "audit page mounts controlled evidence redaction guard",
);

requireText(
  "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md",
  literalPattern("HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\\.md[\\s\\S]*audit:heu-controlled-evidence-redaction-pack[\\s\\S]*Raw evidence stays outside Git", "i"),
  "owner sign-off pack references controlled evidence redaction",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("Final owner Go\\/No-Go sign-off[\\s\\S]*IN_PROGRESS[\\s\\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\\.md[\\s\\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\\.md[\\s\\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\\.md[\\s\\S]*ttgdtx-owner-go-no-go-evidence-checklist\\.tsx[\\s\\S]*owner GO\\/NO-GO acceptance matrix[\\s\\S]*owner GO\\/NO-GO decision manifest[\\s\\S]*audit:ttgdtx-production-owner-signoff-pack[\\s\\S]*signed final GO\\/NO-GO decision still required", "i"),
  "final owner Go/No-Go sign-off checklist row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("Controlled evidence redaction\\/intake[\\s\\S]*PASS_LOCAL[\\s\\S]*HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\\.md[\\s\\S]*controlled evidence acceptance matrix[\\s\\S]*audit:heu-controlled-evidence-redaction-pack[\\s\\S]*raw evidence stays outside Git", "i"),
  "controlled evidence redaction checklist row",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  literalPattern("Result:\\s*PARTIAL PASS", "i"),
  "partial UAT pass marker",
);

requireText(
  "components/audit/ttgdtx-audit-trail-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-audit-trail-guard=\"AUDIT_LOG\")(?=[\\s\\S]*data-ttgdtx-audit-log-uat-boundary=\"P6-03\")(?=[\\s\\S]*P6-03 audit-log UAT)(?=[\\s\\S]*PASS_LOCAL)(?=[\\s\\S]*Signed audit-log UAT evidence is still required)(?=[\\s\\S]*NO-GO until signed\\s+audit-log evidence exists)(?=[\\s\\S]*audit_logs)(?=[\\s\\S]*AUD-01)(?=[\\s\\S]*AUD-06)(?=[\\s\\S]*passwords)(?=[\\s\\S]*temporary passwords)(?=[\\s\\S]*OTPs)(?=[\\s\\S]*password reset\\s+links)(?=[\\s\\S]*account activation\\/invite links)(?=[\\s\\S]*service-role keys)(?=[\\s\\S]*CCCD)(?=[\\s\\S]*bank accounts)(?=[\\s\\S]*raw student identity data)", "i"),
  "TTGDTX audit trail guard display",
);

requireText(
  "components/audit/ttgdtx-audit-trail-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-audit-trace-acceptance-matrix=\"P6-03\")(?=[\\s\\S]*P6-03 audit trace acceptance matrix)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*actor identity)(?=[\\s\\S]*entity\\/action coverage)(?=[\\s\\S]*before\\/after value usefulness)(?=[\\s\\S]*evidence link or controlled reference)(?=[\\s\\S]*workflow chain continuity)(?=[\\s\\S]*reviewer sign-off)(?=[\\s\\S]*AUD-TRACE-01)(?=[\\s\\S]*AUD-TRACE-06)(?=[\\s\\S]*raw payment data)(?=[\\s\\S]*raw vouchers)", "i"),
  "P6-03 audit trace acceptance matrix display",
);

requireText(
  "app/audit/page.tsx",
  literalPattern("<TtgdtxAuditTrailGuard\\s*\\/>[\\s\\S]*<TtgdtxAuditLogUatEvidenceChecklist\\s*\\/>[\\s\\S]*AuditLogTable", "i"),
  "audit page mounts TTGDTX audit trail guard and UAT evidence checklist",
);

requireText(
  "components/audit/ttgdtx-audit-log-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-audit-log-uat-evidence-checklist=\"P6-03\")(?=[\\s\\S]*P6-03 audit-log UAT evidence checklist)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*Signed audit-log UAT is still required before P6-03 can move from\\s+IN_PROGRESS)(?=[\\s\\S]*TTGDTX_AUDIT_LOG_UAT_RUNBOOK\\.md)(?=[\\s\\S]*AUD-01)(?=[\\s\\S]*AUD-06)(?=[\\s\\S]*passwords, temporary passwords, OTPs,\\s+password reset links, account activation\\/invite links,\\s+service-role keys, raw student identity data, CCCD, bank accounts\\s+and raw payment data)(?=[\\s\\S]*Audit, KHTC, IT_DATA, PHAP_CHE and BGH must sign the evidence outside\\s+Codex\\/chat)", "i"),
  "P6-03 audit-log UAT evidence checklist",
);

requireText(
  "components/audit/ttgdtx-audit-log-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-audit-log-evidence-acceptance-matrix=\"P6-03\")(?=[\\s\\S]*P6-03 audit-log evidence acceptance matrix)(?=[\\s\\S]*P6_03_ACCEPT \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*P6-03-ACCEPT-01)(?=[\\s\\S]*P6-03-ACCEPT-06)(?=[\\s\\S]*Required event coverage)(?=[\\s\\S]*Before\\/after payload and evidence reference usefulness)(?=[\\s\\S]*Production boundary)", "i"),
  "P6-03 audit-log evidence acceptance matrix",
);

requireText(
  "components/audit/ttgdtx-audit-log-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-audit-trace-decision-manifest=\"P6-03\")(?=[\\s\\S]*P6-03 audit traceability decision manifest)(?=[\\s\\S]*P6_03_TRACE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P6-03-DEC-01)(?=[\\s\\S]*P6-03-DEC-06)(?=[\\s\\S]*Required event sample coverage)(?=[\\s\\S]*Workflow chain continuity)(?=[\\s\\S]*Human traceability decision)(?=[\\s\\S]*production GO)", "i"),
  "P6-03 audit traceability decision manifest",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("(?=[\\s\\S]*Audit log completeness)(?=[\\s\\S]*IN_PROGRESS)(?=[\\s\\S]*ttgdtx-audit-log-uat-evidence-checklist\\.tsx)(?=[\\s\\S]*audit trace acceptance matrix)(?=[\\s\\S]*audit-log evidence acceptance matrix)(?=[\\s\\S]*audit traceability decision manifest)(?=[\\s\\S]*audit:ttgdtx-audit-trail-guard)(?=[\\s\\S]*signed UAT)", "i"),
  "audit log completeness guard checklist row",
);

requireText(
  "docs/TTGDTX_ACCOUNTING_DASHBOARD_ROLE_UAT_PLAN_20260627.md",
  literalPattern("(?=[\\s\\S]*P5-01 is PASS_LOCAL)(?=[\\s\\S]*not production-approved)(?=[\\s\\S]*P2-18 remains IN_PROGRESS)", "i"),
  "P5-01 dashboard UAT plan is local-only and P2-18 remains in progress",
);

requireText(
  "components/ttgdtx/ttgdtx-dashboard-readonly-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-dashboard-readonly-guard=\"P2-18\")(?=[\\s\\S]*Role-scope)(?=[\\s\\S]*contract-only)(?=[\\s\\S]*signed browser UAT)", "i"),
  "P2-18 dashboard read-only guard display",
);

requireText(
  "components/ttgdtx/ttgdtx-dashboard-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-dashboard-uat-evidence-checklist=\"P2-18\")(?=[\\s\\S]*P2-18 UAT evidence checklist)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*Signed browser UAT is still required before P2-18 can move from\\s+IN_PROGRESS)(?=[\\s\\S]*temporary passwords)(?=[\\s\\S]*password reset links)(?=[\\s\\S]*account activation\\/invite links)(?=[\\s\\S]*service-role keys stay outside Git\\/Codex\\/chat)(?=[\\s\\S]*HEU_CONTROLLED_EVIDENCE_REDACTION_PACK_20260627\\.md)(?=[\\s\\S]*P2-18-01)(?=[\\s\\S]*P2-18-08)(?=[\\s\\S]*KHTC, BGH, IT_DATA and Audit\\s+must sign the evidence outside Codex\\/chat)", "i"),
  "P2-18 dashboard UAT evidence checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-dashboard-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-dashboard-acceptance-matrix=\"P2-18\")(?=[\\s\\S]*P2-18 dashboard acceptance matrix)(?=[\\s\\S]*P2_18_ACCEPT \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*P2-18-ACCEPT-01)(?=[\\s\\S]*P2-18-ACCEPT-06)(?=[\\s\\S]*Source-total reconciliation)(?=[\\s\\S]*Role and contract-only denial)(?=[\\s\\S]*Production boundary)", "i"),
  "P2-18 dashboard acceptance matrix",
);

requireText(
  "components/ttgdtx/ttgdtx-dashboard-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-dashboard-real-user-evidence-bridge=\"P2-18-P6-04\")(?=[\\s\\S]*P2-18 real accounting user evidence bridge)(?=[\\s\\S]*data-heu-real-accounting-user-uat-queue=\"P6-04-P2-18-P5-03\")(?=[\\s\\S]*data-heu-real-accounting-user-result-template=\"P6-04-P2-18-P5-03\")(?=[\\s\\S]*P2_18_REAL_USER_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P2-18-REAL-01)(?=[\\s\\S]*P2-18-REAL-05)(?=[\\s\\S]*KHTC accounting operator)(?=[\\s\\S]*Out-of-scope negative account)(?=[\\s\\S]*Do not paste real passwords)", "i"),
  "P2-18 real accounting user evidence bridge UI",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P2-18 Dashboard Immediate Stop Guard[\\s\\S]*data-ttgdtx-dashboard-immediate-stop=\"P2-18\"[\\s\\S]*ttgdtx-dashboard-source-reconciliation-checklist\\.tsx[\\s\\S]*finance approval[\\s\\S]*statutory accounting[\\s\\S]*revenue\\s+recognition[\\s\\S]*bank-transfer instruction[\\s\\S]*signed browser UAT[\\s\\S]*source reconciliation[\\s\\S]*out-of-scope users see finance totals[\\s\\S]*source variance[\\s\\S]*raw sensitive dashboard evidence[\\s\\S]*audit:ttgdtx-dashboard-source-reconciliation[\\s\\S]*audit:heu-current-state-inventory[\\s\\S]*audit:ttgdtx-release-gates[\\s\\S]*does not execute browser UAT[\\s\\S]*mark production GO", "i"),
  "P2-18 dashboard immediate stop guard log entry",
);

requireText(
  "components/ttgdtx/ttgdtx-dashboard-source-reconciliation-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-dashboard-source-reconciliation-checklist=\"P2-18\")(?=[\\s\\S]*P2-18 source reconciliation checklist)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P2-18-SRC-01)(?=[\\s\\S]*P2-18-SRC-06)(?=[\\s\\S]*P2-03 receivable)(?=[\\s\\S]*P2-17 payout)(?=[\\s\\S]*P2-19 source\\/evidence metadata)(?=[\\s\\S]*Signed\\s+browser UAT must still prove at least one complete flow and one\\s+exception flow)", "i"),
  "P2-18 dashboard source reconciliation checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-dashboard-source-reconciliation-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-dashboard-immediate-stop=\"P2-18\")(?=[\\s\\S]*P2-18 dashboard immediate stop guard: PASS_LOCAL only)(?=[\\s\\S]*P2-18-STOP-01)(?=[\\s\\S]*P2-18-STOP-05)(?=[\\s\\S]*P2_18_STOP_CHECK \\/ GO_NEXT \\/ BLOCKED)(?=[\\s\\S]*finance approval, statutory accounting, revenue recognition, payment approval, bank transfer instruction or production GO)(?=[\\s\\S]*Signed browser UAT, source reconciliation, reliance decision, backup\\/restore proof or owner sign-off is missing)(?=[\\s\\S]*contract-only\\/out-of-scope access exposes finance totals)(?=[\\s\\S]*unresolved source variance, unexplained CRITICAL status, ownerless REVIEW status or a wrong exception route)(?=[\\s\\S]*Raw PII, CCCD, bank accounts, vouchers, bank statements, passwords, temporary passwords, OTPs, password reset links, account activation\\/invite links or service-role keys)", "i"),
  "P2-18 dashboard immediate stop guard",
);

requireText(
  "components/ttgdtx/ttgdtx-dashboard-source-reconciliation-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-dashboard-reliance-decision-manifest=\"P2-18\")(?=[\\s\\S]*P2-18 dashboard reliance decision manifest)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P2-18-REL-01)(?=[\\s\\S]*P2-18-REL-06)(?=[\\s\\S]*P2_18_RELIANCE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*does not approve finance action, statutory\\s+accounting, UAT acceptance, dashboard production reliance or\\s+production GO)", "i"),
  "P2-18 dashboard reliance decision manifest",
);

requireText(
  "app/ttgdtx/accounting-dashboard/page.tsx",
  literalPattern("TtgdtxDashboardReadonlyGuard[\\s\\S]*<TtgdtxDashboardReadonlyGuard \\/>", ""),
  "P2-18 dashboard read-only guard mount",
);

requireText(
  "app/ttgdtx/accounting-dashboard/page.tsx",
  literalPattern("<TtgdtxDashboardReadonlyGuard\\s*\\/>[\\s\\S]*<TtgdtxDashboardSourceReconciliationChecklist\\s*\\/>[\\s\\S]*<TtgdtxDashboardUatEvidenceChecklist\\s*\\/>", ""),
  "P2-18 dashboard UAT evidence checklist mount",
);

requireText(
  "app/ttgdtx/accounting-dashboard/page.tsx",
  literalPattern("function safeEvidenceHref\\([\\s\\S]*value\\.startsWith\\(\"\\/\"\\)[\\s\\S]*!value\\.startsWith\\(\"\\/\\/\"\\)[\\s\\S]*new URL\\(value\\)[\\s\\S]*url\\.protocol === \"https:\"[\\s\\S]*const evidenceHref = safeEvidenceHref\\(\\s*movement\\.evidence_url,\\s*\\)[\\s\\S]*<Link href=\\{evidenceHref\\}>", "i"),
  "P2-18 dashboard safe movement evidence link rendering",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("(?=[\\s\\S]*P2-18 accounting dashboard)(?=[\\s\\S]*IN_PROGRESS)(?=[\\s\\S]*ttgdtx-dashboard-readonly-guard\\.tsx)(?=[\\s\\S]*ttgdtx-dashboard-source-reconciliation-checklist\\.tsx)(?=[\\s\\S]*ttgdtx-dashboard-uat-evidence-checklist\\.tsx)(?=[\\s\\S]*safe evidence-link rendering)(?=[\\s\\S]*dashboard acceptance matrix)(?=[\\s\\S]*dashboard immediate stop guard)(?=[\\s\\S]*real accounting user evidence bridge)(?=[\\s\\S]*dashboard reliance decision manifest)(?=[\\s\\S]*audit:ttgdtx-dashboard-readonly-guard)(?=[\\s\\S]*audit:ttgdtx-dashboard-source-reconciliation)(?=[\\s\\S]*signed UAT evidence)", "i"),
  "P2-18 read-only guard checklist row",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  literalPattern("Accounting dashboard \\/ BGH control[\\s\\S]*dashboard immediate stop guard[\\s\\S]*safe evidence-link rendering for movement evidence[\\s\\S]*dashboard reliance decision manifest[\\s\\S]*Signed browser UAT pending", "i"),
  "P2-18 safe evidence-link current-state row",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P2-18 Dashboard Safe Evidence Links[\\s\\S]*safeEvidenceHref[\\s\\S]*movement\\.evidence_url[\\s\\S]*audit-ttgdtx-dashboard-source-reconciliation\\.mjs[\\s\\S]*does not accept evidence[\\s\\S]*expose raw bank data[\\s\\S]*mark production GO", "i"),
  "P2-18 safe evidence-link implementation log",
);

requireText(
  "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md",
  literalPattern("(?=[\\s\\S]*Dashboard Acceptance Matrix)(?=[\\s\\S]*P2-18-ACCEPT-01)(?=[\\s\\S]*P2-18-ACCEPT-06)(?=[\\s\\S]*P2_18_ACCEPT \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*P2-18-ACCEPT-01 through P2-18-ACCEPT-06 all pass with redacted evidence)", "i"),
  "P2-18 runbook dashboard acceptance matrix",
);

requireText(
  "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md",
  literalPattern("(?=[\\s\\S]*Real Accounting User Evidence Bridge)(?=[\\s\\S]*data-heu-real-accounting-user-uat-queue=\"P6-04-P2-18-P5-03\")(?=[\\s\\S]*data-heu-real-accounting-user-result-template=\"P6-04-P2-18-P5-03\")(?=[\\s\\S]*P2-18-REAL-01)(?=[\\s\\S]*P2-18-REAL-05)(?=[\\s\\S]*dashboard evidence)", "i"),
  "P2-18 real accounting user evidence bridge runbook",
);

requireText(
  "docs/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK.md",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-dashboard-immediate-stop=\"P2-18\")(?=[\\s\\S]*P2-18-STOP-01 through\\s+P2-18-STOP-05)(?=[\\s\\S]*P2_18_STOP_CHECK \\/ GO_NEXT \\/ BLOCKED)(?=[\\s\\S]*Dashboard Reliance Decision Manifest)(?=[\\s\\S]*Immediate stop guard)(?=[\\s\\S]*data-ttgdtx-dashboard-reliance-decision-manifest=\"P2-18\")(?=[\\s\\S]*P2-18-REL-01)(?=[\\s\\S]*P2-18-REL-06)(?=[\\s\\S]*P2_18_RELIANCE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*raw sensitive dashboard data keeps\\s+P2-18 NO-GO)", "i"),
  "P2-18 runbook dashboard reliance decision manifest",
);

requireText(
  "docs/TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627.md",
  literalPattern("will not build or operate a real bank\\s+freeze\\/release action workflow inside the payment flow", "i"),
  "account-control bank action deferral",
);

requireText(
  "docs/TTGDTX_ACCOUNT_CONTROL_SCOPE_DECISION_20260627.md",
  literalPattern("PASS_LOCAL means scope is clarified and the risky real workflow is deferred[\\s\\S]*does not approve production bank operation, collateral release, production data\\s+import, real UAT, production migration or production GO", "i"),
  "account-control scope decision local-only boundary",
);

requireText(
  "components/ttgdtx/ttgdtx-account-control-scope-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-account-control-scope-guard=\"P2-19\")(?=[\\s\\S]*Account-control scope guard: metadata-only)(?=[\\s\\S]*Phong tỏa\\/giải tỏa tài khoản)(?=[\\s\\S]*không gửi lệnh ngân\\s+hàng)(?=[\\s\\S]*không đánh dấu tài khoản đã phong tỏa\\/giải tỏa)(?=[\\s\\S]*không phê\\s+duyệt giải chấp)(?=[\\s\\S]*ACCT-CTRL-01)(?=[\\s\\S]*ACCT-CTRL-04)(?=[\\s\\S]*Tách biệt giải chấp tài sản bảo đảm)(?=[\\s\\S]*PASS_LOCAL chỉ là quyết định phạm vi)(?=[\\s\\S]*Không vận hành ngân hàng)(?=[\\s\\S]*không giải chấp tài sản bảo đảm)(?=[\\s\\S]*không\\s+production GO)", "i"),
  "account-control scope UI guard",
);

requireText(
  "app/ttgdtx/source-control/page.tsx",
  literalPattern("TtgdtxAccountControlScopeGuard[\\s\\S]*<TtgdtxAccountControlScopeGuard \\/>[\\s\\S]*P2-11", "i"),
  "source-control page mounts account-control scope guard",
);

requireText(
  "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md",
  literalPattern("(?=[\\s\\S]*P5-02 Read-Only Blocker Summary)(?=[\\s\\S]*production-readiness-blocker-summary\\.tsx)(?=[\\s\\S]*data-heu-production-safe-iteration-loop=\"P5-02\")(?=[\\s\\S]*data-heu-production-action-queue=\"P5-02\")(?=[\\s\\S]*Safe iteration loop)(?=[\\s\\S]*Next controlled actions)(?=[\\s\\S]*No GO button is provided)(?=[\\s\\S]*P5-02 is PASS_LOCAL[\\s\\S]*does not implement a production BGH\\s+dashboard[\\s\\S]*approve\\s+production GO or replace signed UAT)", "i"),
  "P5-02 BGH dashboard spec local-only boundary",
);

requireText(
  "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md",
  literalPattern("(?=[\\s\\S]*HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702\\.md)(?=[\\s\\S]*EMAIL_DISPATCH_HANDOFF_READY \\/ EMAIL_CONFIG_REQUIRED \\/ BLOCKED)(?=[\\s\\S]*allowed recipient labels)(?=[\\s\\S]*manual enablement steps)(?=[\\s\\S]*does\\s+not store recipient addresses, SMTP values or secrets in Git\\/Codex\\/chat)(?=[\\s\\S]*does\\s+not send mail)(?=[\\s\\S]*does\\s+not approve UAT,\\s+evidence, finance action, owner GO\\/NO-GO or production GO)", "i"),
  "P5-02 daily email dispatch handoff spec boundary",
);

requireText(
  "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md",
  literalPattern("(?=[\\s\\S]*HEU_MASTER_CONTROL_GOAL_REGISTER_20260702\\.md)(?=[\\s\\S]*MASTER_GOAL_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*phase order A-E)(?=[\\s\\S]*cloud\\s+PASS_LOCAL boundary)(?=[\\s\\S]*Build Agent, QA\\/Audit Agent, Data Check Agent, Finance Trial Support,\\s+UAT\\/Evidence Coordinator, Report\\/Email Coordinator and Human Authority Owner)(?=[\\s\\S]*does not self-code, self-deploy,\\s+send real email, create real tasks\\/users, approve UAT, accept evidence,\\s+approve finance\\/owner decisions or mark production GO)", "i"),
  "P5-02 Master Control goal daily report spec boundary",
);

requireText(
  "docs/HEU_BGH_OPERATING_DASHBOARD_SPEC_20260627.md",
  literalPattern("(?=[\\s\\S]*signed UAT route summary from)(?=[\\s\\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\\.md)(?=[\\s\\S]*Section 5\\.2)(?=[\\s\\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\\.md)(?=[\\s\\S]*SIGNED_UAT_ROUTE_SUMMARY_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*UAT-ROUTE-01 through\\s+UAT-ROUTE-11)(?=[\\s\\S]*PENDING status)(?=[\\s\\S]*owner labels)(?=[\\s\\S]*minimum proof)(?=[\\s\\S]*does not send email, create real tasks\\/tickets,\\s+accept evidence, execute UAT, approve finance action, approve owner GO\\/NO-GO\\s+or mark production GO)", "i"),
  "P5-02 signed UAT route summary spec boundary",
);

requireText(
  "docs/HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_CONFIG_HANDOFF)(?=[\\s\\S]*EMAIL_DISPATCH_HANDOFF_READY \\/ EMAIL_CONFIG_REQUIRED \\/ BLOCKED)(?=[\\s\\S]*HEU_DAILY_REPORT_TO)(?=[\\s\\S]*HEU_SMTP_PASSWORD)(?=[\\s\\S]*BGH_DAILY_REPORT_ALIAS)(?=[\\s\\S]*EMAIL-DISPATCH-01)(?=[\\s\\S]*EMAIL-DISPATCH-06)(?=[\\s\\S]*does not send email, create real tasks)(?=[\\s\\S]*Email receipt is not accepted as signed UAT, evidence acceptance, finance approval, owner GO\\/NO-GO or production GO)(?=[\\s\\S]*does not approve production, UAT, evidence acceptance, finance approval,\\s+owner GO\\/NO-GO or production GO)(?=[\\s\\S]*Production remains NO-GO)", "i"),
  "P5-02 daily email dispatch handoff guard",
);

requireText(
  "scripts/report-heu-daily-dry-run.mjs",
  literalPattern("(?=[\\s\\S]*Muc tieu tong chi huy)(?=[\\s\\S]*MASTER_GOAL_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*HEU_MASTER_CONTROL_GOAL_REGISTER_20260702\\.md)(?=[\\s\\S]*Khi may tinh tat)(?=[\\s\\S]*GitHub Actions co the chay PASS_LOCAL, audit, lint, build va report summary; khong tu code, tu deploy, tu approve)(?=[\\s\\S]*A Clean\\/package dirty scope)(?=[\\s\\S]*E Remaining blockers)(?=[\\s\\S]*Build Agent, QA\\/Audit Agent, Data Check Agent, Finance Trial Support)(?=[\\s\\S]*Human Authority Owner)(?=[\\s\\S]*khong production GO, khong email\\/nhiem vu\\/user that, khong UAT\\/evidence\\/finance\\/owner approval)", "i"),
  "P5-02 Master Control daily report summary guard",
);

requireText(
  "scripts/report-heu-daily-dry-run.mjs",
  literalPattern("(?=[\\s\\S]*Blocker theo phong\\/owner)(?=[\\s\\S]*BLOCKER_OWNER_LANES_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*lib\\/production-readiness\\.ts -> PRODUCTION_BLOCKERS)(?=[\\s\\S]*P0-03)(?=[\\s\\S]*Step90-Step110)(?=[\\s\\S]*P0-19)(?=[\\s\\S]*P2-17)(?=[\\s\\S]*P2-18)(?=[\\s\\S]*P6-04)(?=[\\s\\S]*P6-03)(?=[\\s\\S]*P6-06)(?=[\\s\\S]*P0-10)(?=[\\s\\S]*P0-09)(?=[\\s\\S]*no email sent, no real task created, no evidence accepted)", "i"),
  "P5-02 daily report blocker-owner lanes guard",
);

requireText(
  "scripts/report-heu-daily-dry-run.mjs",
  literalPattern("(?=[\\s\\S]*Signed UAT route summary)(?=[\\s\\S]*SIGNED_UAT_ROUTE_SUMMARY_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\\.md Section 5\\.2)(?=[\\s\\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\\.md)(?=[\\s\\S]*UAT-ROUTE-01)(?=[\\s\\S]*UAT-ROUTE-11)(?=[\\s\\S]*PENDING)(?=[\\s\\S]*no email sent, no real task created, no evidence accepted, no UAT approved)", "i"),
  "P5-02 daily report signed UAT route summary guard",
);

requireText(
  "components/master-control/production-readiness-blocker-summary.tsx",
  literalPattern("(?=[\\s\\S]*SIGNED_UAT_ROUTE_SUMMARY)(?=[\\s\\S]*data-heu-signed-uat-route-summary=\"P5-02\")(?=[\\s\\S]*Signed UAT route summary: read-only)(?=[\\s\\S]*SIGNED_UAT_ROUTE_SUMMARY_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*UAT-ROUTE-01)(?=[\\s\\S]*UAT-ROUTE-11)(?=[\\s\\S]*Status: PENDING)(?=[\\s\\S]*does not send email, create real tasks\\/tickets, accept\\s+evidence, execute UAT, approve finance action, approve owner GO\\s+or mark production GO)", "i"),
  "P5-02 in-app signed UAT route summary guard",
);

requireText(
  "scripts/report-heu-email-readiness.mjs",
  literalPattern("(?=[\\s\\S]*EMAIL_DISPATCH_HANDOFF_READY)(?=[\\s\\S]*HEU_DAILY_EMAIL_DISPATCH_HANDOFF_20260702\\.md)(?=[\\s\\S]*Required approval owners)(?=[\\s\\S]*Allowed recipient labels)(?=[\\s\\S]*Manual enablement steps)(?=[\\s\\S]*Stop conditions)(?=[\\s\\S]*BGH_DAILY_REPORT_ALIAS)(?=[\\s\\S]*EMAIL-DISPATCH-06)(?=[\\s\\S]*This checker does not send email, create tasks, accept UAT, approve finance action, approve owner GO or mark production GO)", "i"),
  "P5-02 daily email dispatch readiness report guard",
);

requireText(
  "components/master-control/production-readiness-blocker-summary.tsx",
  literalPattern("(?=[\\s\\S]*SAFE_ITERATION_STEPS)(?=[\\s\\S]*data-heu-production-blocker-summary=\"P5-02\")(?=[\\s\\S]*P5-02 production blocker summary)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*Read-only BGH\\/owner view)(?=[\\s\\S]*Production remains NO-GO until backup\\/restore, migration order,\\s+legal\\/finance UAT, payout UAT, dashboard UAT, role-scope UAT,\\s+audit-log UAT, hard-delete conversion\\/waiver, redaction, P0-14\\s+intake-ledger evidence binder, P0-15 final handoff summary and\\s+final owner sign-off are completed outside Codex\\/chat)(?=[\\s\\S]*PRODUCTION_BLOCKERS)(?=[\\s\\S]*PRODUCTION_EXECUTION_STEPS)(?=[\\s\\S]*data-heu-production-safe-iteration-loop=\"P5-02\")(?=[\\s\\S]*Safe iteration loop)(?=[\\s\\S]*Master Control follows the same rhythm as TTGDTX)(?=[\\s\\S]*data-heu-production-action-queue=\"P5-02\")(?=[\\s\\S]*Next controlled actions)(?=[\\s\\S]*P0-14\\s+intake-ledger evidence binder)(?=[\\s\\S]*P0-15 final handoff summary)(?=[\\s\\S]*owner GO\\/NO-GO discussion)(?=[\\s\\S]*Current recommendation:[\\s\\S]*NO-GO)(?=[\\s\\S]*No GO button is provided here)(?=[\\s\\S]*PASS_LOCAL does not approve production\\s+dashboard use, finance actions, production migration, UAT acceptance,\\s+owner waiver or production GO)(?=[\\s\\S]*secrets, passwords,\\s+temporary passwords, OTPs, password reset links, account\\s+activation\\/invite links, service-role keys, bank credentials, raw\\s+student PII, raw CCCD, raw phone numbers, raw bank account numbers,\\s+bank statements, vouchers or raw payment data)", "i"),
  "P5-02 production blocker summary UI shell",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("P0-03[\\s\\S]*Step90-Step110[\\s\\S]*P0-19[\\s\\S]*P2-17[\\s\\S]*P2-18[\\s\\S]*P6-04[\\s\\S]*P6-03[\\s\\S]*P6-06[\\s\\S]*P0-10[\\s\\S]*P0-09", "i"),
  "P5-02 production blocker shared source coverage",
);

requireText(
  "app/master-control/page.tsx",
  literalPattern("ProductionReadinessBlockerSummary[\\s\\S]*<ProductionReadinessBlockerSummary\\s*\\/>[\\s\\S]*<HeuOsVisualNavigationMap", "i"),
  "Master Control mounts production blocker summary",
);

requireText(
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  literalPattern("(?=[\\s\\S]*P6-06 is PASS_LOCAL)(?=[\\s\\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\\.md)(?=[\\s\\S]*P6-06-FIND-001 through P6-06-FIND-044)(?=[\\s\\S]*hard-delete-conversion-decision-queue\\.tsx)(?=[\\s\\S]*hard-delete-waiver-evidence-checklist\\.tsx)(?=[\\s\\S]*Decision Queue Evidence)(?=[\\s\\S]*Owner Triage Batch Plan)(?=[\\s\\S]*data-hard-delete-conversion-owner-triage=\"P6-06\")(?=[\\s\\S]*P6-06-TRIAGE-01)(?=[\\s\\S]*P6-06-TRIAGE-05)(?=[\\s\\S]*P6_06_TRIAGE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Batch 1 Finance\\/Legal\\/Evidence Closure Checklist)(?=[\\s\\S]*P6-06-B1-01)(?=[\\s\\S]*P6-06-B1-05)(?=[\\s\\S]*P6_06_BATCH1_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Batch 2 CRM Lead\\/Handover Closure Checklist)(?=[\\s\\S]*P6-06-B2-01)(?=[\\s\\S]*P6-06-B2-05)(?=[\\s\\S]*P6_06_BATCH2_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Batch 3 Workspace\\/Access-Scope Closure Checklist)(?=[\\s\\S]*P6-06-B3-01)(?=[\\s\\S]*P6-06-B3-05)(?=[\\s\\S]*P6_06_BATCH3_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Batch 4 Master\\/Governance\\/Config Closure Checklist)(?=[\\s\\S]*P6-06-B4-01)(?=[\\s\\S]*P6-06-B4-05)(?=[\\s\\S]*P6_06_BATCH4_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Batch 5 Derived-Helper Waiver Checklist)(?=[\\s\\S]*P6-06-B5-01)(?=[\\s\\S]*P6-06-B5-05)(?=[\\s\\S]*P6_06_BATCH5_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*audit:hard-delete-conversion-decision-queue)(?=[\\s\\S]*does not approve production deletion, cascade execution, waiver,\\s+conversion\\s+migration, cleanup, rollback success or production GO)", "i"),
  "P6-06 non-TTGDTX cascade review local-only boundary",
);

requireText(
  "docs/HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_REGISTER)(?=[\\s\\S]*Current scan count:\\s*44)(?=[\\s\\S]*P6-06-FIND-001)(?=[\\s\\S]*P6-06-FIND-044)(?=[\\s\\S]*child tables, parent references and owner lanes)(?=[\\s\\S]*Owner Triage Batch Plan)(?=[\\s\\S]*P6-06-TRIAGE-01)(?=[\\s\\S]*P6-06-TRIAGE-05)(?=[\\s\\S]*Batch 1 Finance\\/Legal\\/Evidence Closure Checklist)(?=[\\s\\S]*P6-06-B1-01)(?=[\\s\\S]*P6-06-B1-05)(?=[\\s\\S]*Batch 2 CRM Lead\\/Handover Closure Checklist)(?=[\\s\\S]*P6-06-B2-01)(?=[\\s\\S]*P6-06-B2-05)(?=[\\s\\S]*Batch 3 Workspace\\/Access-Scope Closure Checklist)(?=[\\s\\S]*P6-06-B3-01)(?=[\\s\\S]*P6-06-B3-05)(?=[\\s\\S]*Batch 4 Master\\/Governance\\/Config Closure Checklist)(?=[\\s\\S]*P6-06-B4-01)(?=[\\s\\S]*P6-06-B4-05)(?=[\\s\\S]*Batch 5 Derived-Helper Waiver Checklist)(?=[\\s\\S]*P6-06-B5-01)(?=[\\s\\S]*P6-06-B5-05)(?=[\\s\\S]*P6-06 remains IN_PROGRESS)(?=[\\s\\S]*does not approve production\\s+migration, data\\s+deletion, cascade execution, waiver, conversion migration,\\s+cleanup, rollback\\s+success or production GO)", "i"),
  "P6-06 cascade finding register",
);

requireText(
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  literalPattern("(?=[\\s\\S]*P6-06 Acceptance Matrix)(?=[\\s\\S]*data-hard-delete-cascade-acceptance-matrix=\"P6-06\")(?=[\\s\\S]*P6-06-ACCEPT-01)(?=[\\s\\S]*P6-06-ACCEPT-06)(?=[\\s\\S]*P6_06_ACCEPT \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*P6-06 Closure Decision Manifest)(?=[\\s\\S]*data-hard-delete-cascade-closure-decision-manifest=\"P6-06\")(?=[\\s\\S]*P6-06-DEC-01)(?=[\\s\\S]*P6-06-DEC-06)(?=[\\s\\S]*P6_06_CLOSURE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*signed owner approval)", "i"),
  "P6-06 hard-delete/cascade acceptance matrix doc",
);

requireText(
  "docs/HEU_NON_TTGDTX_CASCADE_REVIEW_20260627.md",
  literalPattern("Current scan count:\\s*44", "i"),
  "P6-06 current cascade count",
);

requireText(
  "components/audit/hard-delete-boundary-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-hard-delete-boundary-guard=\"P6-06\")(?=[\\s\\S]*P6-06 hard-delete and cascade review)(?=[\\s\\S]*PASS_LOCAL)(?=[\\s\\S]*Production remains NO-GO until non-TTGDTX\\/base cascade paths are\\s+converted or waived with written approval)(?=[\\s\\S]*No hard-delete for\\s+finance, evidence, approval, payment, lead or audit rows)(?=[\\s\\S]*Do not use hard-delete, truncate, drop table or on delete cascade\\s+as rollback proof)(?=[\\s\\S]*Current scan count:\\s*44)(?=[\\s\\S]*REQUIRES_CONVERSION_OR_WAIVER)(?=[\\s\\S]*audit:hard-delete)(?=[\\s\\S]*audit:ttgdtx-cascade)(?=[\\s\\S]*audit:heu-non-ttgdtx-cascade-review)", "i"),
  "P6-06 hard-delete boundary guard",
);

requireText(
  "app/audit/page.tsx",
  literalPattern("<HardDeleteBoundaryGuard\\s*\\/>[\\s\\S]*<HardDeleteConversionDecisionQueue\\s*\\/>[\\s\\S]*<HardDeleteWaiverEvidenceChecklist\\s*\\/>[\\s\\S]*AuditLogTable", "i"),
  "audit page mounts hard-delete boundary guard, decision queue and evidence checklist",
);

requireText(
  "components/audit/hard-delete-conversion-decision-queue.tsx",
  literalPattern("(?=[\\s\\S]*data-hard-delete-conversion-decision-queue=\"P6-06\")(?=[\\s\\S]*P6-06 hard-delete conversion decision queue)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*44 non-TTGDTX\\/base cascade findings)(?=[\\s\\S]*data-hard-delete-conversion-immediate-stop=\"P6-06\")(?=[\\s\\S]*P6-06 immediate conversion stop conditions)(?=[\\s\\S]*P6_06_STOP_CHECK \\/ CONVERT_OR_WAIVE \\/ BLOCKED)(?=[\\s\\S]*Protected row can still cascade-delete)(?=[\\s\\S]*Waiver is broad, oral or ownerless)(?=[\\s\\S]*Rollback relies on deletion)(?=[\\s\\S]*data-hard-delete-conversion-owner-triage=\"P6-06\")(?=[\\s\\S]*P6-06 owner triage batch plan)(?=[\\s\\S]*first closure batch)(?=[\\s\\S]*P6_06_TRIAGE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P6-06-TRIAGE-01)(?=[\\s\\S]*P6-06-TRIAGE-05)(?=[\\s\\S]*P0-17 access closure compatibility)(?=[\\s\\S]*expiry\\/review date)(?=[\\s\\S]*HDQ-01)(?=[\\s\\S]*HDQ-05)(?=[\\s\\S]*Base identity and CRM lead children)(?=[\\s\\S]*HOU finance and evidence)(?=[\\s\\S]*Workspace and scope helpers)(?=[\\s\\S]*Master, control and dynamic configuration)(?=[\\s\\S]*Legal, tuition and short-course operations)(?=[\\s\\S]*RESTRICT_OR_ARCHIVE)(?=[\\s\\S]*SOFT_REVOKE_OR_WAIVER)(?=[\\s\\S]*does not\\s+approve production deletion, cascade execution, waiver, conversion\\s+migration, cleanup, rollback success or production GO)", "i"),
  "P6-06 hard-delete conversion decision queue",
);

requireText(
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-hard-delete-waiver-evidence-checklist=\"P6-06\")(?=[\\s\\S]*P6-06 hard-delete\\/cascade evidence checklist)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*Conversion or written waiver evidence is still required before\\s+P6-06 can move from IN_PROGRESS)(?=[\\s\\S]*HEU_NON_TTGDTX_CASCADE_REVIEW_20260627\\.md)(?=[\\s\\S]*HD-01)(?=[\\s\\S]*HD-06)(?=[\\s\\S]*raw student PII, CCCD, bank data, payment data,\\s+passwords, temporary passwords, OTPs, password reset links,\\s+account activation\\/invite links, service-role keys and production\\s+credentials)(?=[\\s\\S]*BGH, IT_DATA, Audit and affected business owners must sign the\\s+evidence outside Codex\\/chat)", "i"),
  "P6-06 hard-delete waiver evidence checklist",
);

requireText(
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-hard-delete-finance-legal-evidence-batch=\"P6-06-TRIAGE-01\")(?=[\\s\\S]*P6-06 batch 1 finance\\/legal\\/evidence closure checklist)(?=[\\s\\S]*P6_06_BATCH1_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P6-06-B1-01)(?=[\\s\\S]*P6-06-B1-05)(?=[\\s\\S]*P6-06-FIND-010 through P6-06-FIND-017)(?=[\\s\\S]*P6-06-FIND-040)(?=[\\s\\S]*P6-06-FIND-042 through P6-06-FIND-044)(?=[\\s\\S]*P6-06-FIND-006)(?=[\\s\\S]*P6-06-FIND-029 and P6-06-FIND-030)(?=[\\s\\S]*must clear before any broad waiver or owner GO\\/NO-GO discussion)", "i"),
  "P6-06 batch 1 finance/legal/evidence checklist UI",
);

requireText(
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-hard-delete-crm-lead-handover-batch=\"P6-06-TRIAGE-02\")(?=[\\s\\S]*P6-06 batch 2 CRM lead\\/handover closure checklist)(?=[\\s\\S]*P6_06_BATCH2_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P6-06-B2-01)(?=[\\s\\S]*P6-06-B2-05)(?=[\\s\\S]*P6-06-FIND-002)(?=[\\s\\S]*P6-06-FIND-003 through P6-06-FIND-005 and P6-06-FIND-038)(?=[\\s\\S]*P6-06-FIND-006 and P6-06-FIND-029)(?=[\\s\\S]*P6-06-FIND-018 and P6-06-FIND-023)(?=[\\s\\S]*P3-01\\/P3-02 handover compatibility note)", "i"),
  "P6-06 batch 2 CRM lead/handover checklist UI",
);

requireText(
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-hard-delete-access-scope-batch=\"P6-06-TRIAGE-03\")(?=[\\s\\S]*P6-06 batch 3 workspace\\/access-scope closure checklist)(?=[\\s\\S]*P6_06_BATCH3_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P6-06-B3-01)(?=[\\s\\S]*P6-06-B3-05)(?=[\\s\\S]*P6-06-FIND-019 and P6-06-FIND-020)(?=[\\s\\S]*P6-06-FIND-021 and P6-06-FIND-022)(?=[\\s\\S]*P6-06-FIND-024 and P6-06-FIND-032)(?=[\\s\\S]*P0-17 access closure compatibility)", "i"),
  "P6-06 batch 3 workspace/access-scope checklist UI",
);

requireText(
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-hard-delete-master-governance-batch=\"P6-06-TRIAGE-04\")(?=[\\s\\S]*P6-06 batch 4 master\\/governance\\/config closure checklist)(?=[\\s\\S]*P6_06_BATCH4_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P6-06-B4-01)(?=[\\s\\S]*P6-06-B4-05)(?=[\\s\\S]*P6-06-FIND-001 and P6-06-FIND-025)(?=[\\s\\S]*P6-06-FIND-026 through P6-06-FIND-028)(?=[\\s\\S]*P6-06-FIND-030 and P6-06-FIND-031)(?=[\\s\\S]*P6-06-FIND-033 through P6-06-FIND-037 and P6-06-FIND-039)(?=[\\s\\S]*P6-06-FIND-041)", "i"),
  "P6-06 batch 4 master/governance/config checklist UI",
);

requireText(
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-hard-delete-derived-helper-waiver-batch=\"P6-06-TRIAGE-05\")(?=[\\s\\S]*P6-06 batch 5 derived-helper waiver checklist)(?=[\\s\\S]*P6_06_BATCH5_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P6-06-B5-01)(?=[\\s\\S]*P6-06-B5-05)(?=[\\s\\S]*P6-06-FIND-007 through P6-06-FIND-009)(?=[\\s\\S]*P6-06-FIND-016 and P6-06-FIND-032)(?=[\\s\\S]*P6-06-FIND-001 and P6-06-FIND-025)(?=[\\s\\S]*Written waiver quality gate)(?=[\\s\\S]*expiry\\/review date)", "i"),
  "P6-06 batch 5 derived-helper waiver checklist UI",
);

requireText(
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-hard-delete-cascade-acceptance-matrix=\"P6-06\")(?=[\\s\\S]*P6-06 hard-delete\\/cascade acceptance matrix)(?=[\\s\\S]*P6_06_ACCEPT \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*P6-06-ACCEPT-01)(?=[\\s\\S]*P6-06-ACCEPT-06)(?=[\\s\\S]*Protected records converted before production)(?=[\\s\\S]*Derived-helper waiver is narrow and written)(?=[\\s\\S]*Production boundary)", "i"),
  "P6-06 hard-delete/cascade acceptance matrix UI",
);

requireText(
  "components/audit/hard-delete-waiver-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-hard-delete-cascade-closure-decision-manifest=\"P6-06\")(?=[\\s\\S]*P6-06 hard-delete\\/cascade closure decision manifest)(?=[\\s\\S]*P6_06_CLOSURE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P6-06-DEC-01)(?=[\\s\\S]*P6-06-DEC-06)(?=[\\s\\S]*Current scan and owner lanes locked)(?=[\\s\\S]*Protected rows converted)(?=[\\s\\S]*Derived-helper waiver controlled)(?=[\\s\\S]*Rollback and cleanup proof independent of deletion)(?=[\\s\\S]*Production boundary acknowledged)", "i"),
  "P6-06 hard-delete/cascade closure decision manifest UI",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("(?=[\\s\\S]*Hard delete review)(?=[\\s\\S]*IN_PROGRESS)(?=[\\s\\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\\.md)(?=[\\s\\S]*hard-delete\\/cascade finding register, owner triage batch plan, batch 1 finance\\/legal\\/evidence closure checklist, batch 2 CRM lead\\/handover closure checklist, batch 3 workspace\\/access-scope closure checklist, batch 4 master\\/governance\\/config closure checklist, batch 5 derived-helper waiver checklist, acceptance matrix and closure decision manifest)(?=[\\s\\S]*audit:hard-delete-boundary-guard)(?=[\\s\\S]*audit:hard-delete-conversion-decision-queue)(?=[\\s\\S]*non-TTGDTX conversion or written waiver still required)", "i"),
  "P6-06 production checklist acceptance matrix row",
);

requireText(
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*P6-04 is PASS_LOCAL)(?=[\\s\\S]*role-scope evidence checklist)(?=[\\s\\S]*Post-UAT Access Closure Handoff)(?=[\\s\\S]*P0-17 access closure review)(?=[\\s\\S]*Signed role-scope UAT evidence is still required)(?=[\\s\\S]*NO-GO until signed UAT evidence exists)(?=[\\s\\S]*temporary passwords)(?=[\\s\\S]*password reset links)(?=[\\s\\S]*account activation\\/invite links)", "i"),
  "P6-04 role-scope UAT pack stays local-only",
);

requireText(
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*Role-Scope Acceptance Matrix)(?=[\\s\\S]*data-heu-role-scope-acceptance-matrix=\"P6-04\")(?=[\\s\\S]*P6-04-ACCEPT-01)(?=[\\s\\S]*P6-04-ACCEPT-06)(?=[\\s\\S]*P0-17 access closure handoff)(?=[\\s\\S]*P6_04_ACCEPT \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*signed owner approval)", "i"),
  "P6-04 role-scope acceptance matrix doc",
);

requireText(
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*Role-Scope Access Decision Manifest)(?=[\\s\\S]*data-heu-role-scope-access-decision-manifest=\"P6-04\")(?=[\\s\\S]*P6-04-DEC-01)(?=[\\s\\S]*P6-04-DEC-06)(?=[\\s\\S]*P0-17 access closure decision)(?=[\\s\\S]*P6_04_ACCESS_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*missing P0-17 closure handoff)(?=[\\s\\S]*raw sensitive role-scope\\s+evidence keeps P6-04 NO-GO)", "i"),
  "P6-04 role-scope access decision manifest doc",
);

requireText(
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*Real Accounting User UAT Queue)(?=[\\s\\S]*data-heu-real-accounting-user-uat-queue=\"P6-04-P2-18-P5-03\")(?=[\\s\\S]*REAL-ACC-01)(?=[\\s\\S]*REAL-ACC-06)(?=[\\s\\S]*REAL_USER_SCOPE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*KHTC accounting operator)(?=[\\s\\S]*BGH read-only reviewer)(?=[\\s\\S]*Audit read-only reviewer)(?=[\\s\\S]*Phap Che legal reviewer)(?=[\\s\\S]*Out-of-scope negative account)(?=[\\s\\S]*P6-04, P2-18 and P5-03 evidence exists)", "i"),
  "P6-04 real accounting user UAT queue doc",
);

requireText(
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*data-heu-real-accounting-user-result-template=\"P6-04-P2-18-P5-03\")(?=[\\s\\S]*Evidence ID)(?=[\\s\\S]*Redacted account label)(?=[\\s\\S]*Profile and scope)(?=[\\s\\S]*Route and expected result)(?=[\\s\\S]*Actual result)(?=[\\s\\S]*Human sign-off)(?=[\\s\\S]*BLOCKED_PENDING_OWNER_SIGNOFF)", "i"),
  "P6-04 real accounting user result template doc",
);

requireText(
  "docs/HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*Post-UAT Access Closure Handoff)(?=[\\s\\S]*data-heu-real-user-access-closure=\"P0-17-P6-04\")(?=[\\s\\S]*ACCESS_RETAIN \\/ REVOKE_OR_REDUCE \\/ BLOCKED)(?=[\\s\\S]*P6-04-CLOSE-01)(?=[\\s\\S]*P6-04-CLOSE-04)(?=[\\s\\S]*Soft-revoke)(?=[\\s\\S]*INACTIVE)(?=[\\s\\S]*Real passwords, temporary passwords, OTPs, password reset links, account activation\\/invite links)", "i"),
  "P6-04 post-UAT access closure handoff doc",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-role-scope-ui-guard=\"P6-04\")(?=[\\s\\S]*P6-04 role-scope UAT)(?=[\\s\\S]*PASS_LOCAL)(?=[\\s\\S]*Signed role-scope UAT evidence is still required)(?=[\\s\\S]*NO-GO until\\s+signed UAT evidence exists)(?=[\\s\\S]*UAT_ADMIN)(?=[\\s\\S]*UAT_BGH)(?=[\\s\\S]*UAT_KHTC)(?=[\\s\\S]*UAT_TUYEN_SINH)(?=[\\s\\S]*UAT_PHAP_CHE)(?=[\\s\\S]*UAT_AUDIT)(?=[\\s\\S]*UAT_OUT_OF_SCOPE_STAFF)(?=[\\s\\S]*passwords)(?=[\\s\\S]*temporary passwords)(?=[\\s\\S]*password\\s+reset\\s+links)(?=[\\s\\S]*activation\\/invite links)(?=[\\s\\S]*OTPs)(?=[\\s\\S]*service-role keys)(?=[\\s\\S]*CCCD)(?=[\\s\\S]*bank\\s+accounts)(?=[\\s\\S]*raw student identity data)", "i"),
  "P6-04 role-scope UI guard stays local-only and no-secret",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-role-scope-evidence-checklist=\"P6-04\")(?=[\\s\\S]*P6-04 role\\/workspace evidence checklist)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*Signed role-scope UAT is still required before P6-04 can move\\s+from IN_PROGRESS)(?=[\\s\\S]*HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627\\.md)(?=[\\s\\S]*P6-04-SCOPE-001)(?=[\\s\\S]*P6-04-SCOPE-006)(?=[\\s\\S]*ALLOWED, BLOCKED or EMPTY_SCOPED_STATE)(?=[\\s\\S]*passwords, temporary passwords, password\\s+reset\\s+links,\\s+account activation\\/invite links, OTPs, API keys)(?=[\\s\\S]*service-role keys, CCCD, bank accounts, bank statements,\\s+vouchers and raw student identity data)(?=[\\s\\S]*PASS_LOCAL does not approve production access, broad permissions,\\s+real-data UAT, finance action, hard-delete, AI approval or\\s+production GO)", "i"),
  "P6-04 role/workspace evidence checklist",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-role-scope-route-matrix=\"P6-04\")(?=[\\s\\S]*P6-04 role-scope route matrix)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P6-04-ROUTE-01)(?=[\\s\\S]*P6-04-ROUTE-07)(?=[\\s\\S]*Login and unauthenticated routes)(?=[\\s\\S]*Lead list\\/detail)(?=[\\s\\S]*TTGDTX contract\\/source pages)(?=[\\s\\S]*TTGDTX receivable, collection, reconciliation and payment)(?=[\\s\\S]*TTGDTX accounting dashboard)(?=[\\s\\S]*Master\\/settings pages)(?=[\\s\\S]*Audit log pages)(?=[\\s\\S]*UI-only hide is not enough if a server\\s+action can still write)(?=[\\s\\S]*Do not paste passwords, temporary passwords, password\\s+reset\\s+links,\\s+account activation\\/invite links, OTPs, API)(?=[\\s\\S]*service-role keys, CCCD, bank accounts, bank statements,\\s+vouchers\\s+or raw student identity data)", "i"),
  "P6-04 role-scope route matrix",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-real-accounting-user-uat-queue=\"P6-04-P2-18-P5-03\")(?=[\\s\\S]*Real accounting user UAT queue:\\s*PASS_LOCAL only)(?=[\\s\\S]*REAL-ACC-01)(?=[\\s\\S]*REAL-ACC-06)(?=[\\s\\S]*REAL_USER_SCOPE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*KHTC accounting operator)(?=[\\s\\S]*BGH read-only reviewer)(?=[\\s\\S]*Audit read-only reviewer)(?=[\\s\\S]*Phap Che legal reviewer)(?=[\\s\\S]*Out-of-scope negative account)(?=[\\s\\S]*P6-04, P2-18 and P5-03 evidence exists)(?=[\\s\\S]*No real passwords, reset links, invite links, OTPs, service-role\\s+keys, raw PII, CCCD, bank data, vouchers or screenshots with\\s+secrets may enter Git\\/Codex\\/chat)", "i"),
  "P6-04 real accounting user UAT queue UI",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-real-accounting-user-result-template=\"P6-04-P2-18-P5-03\")(?=[\\s\\S]*Real accounting user result template:\\s*controlled evidence only)(?=[\\s\\S]*Evidence ID)(?=[\\s\\S]*Redacted account label)(?=[\\s\\S]*Profile and scope)(?=[\\s\\S]*Route and expected result)(?=[\\s\\S]*Actual result)(?=[\\s\\S]*Human sign-off)(?=[\\s\\S]*ALLOWED \\/ BLOCKED \\/ EMPTY_SCOPED_STATE \\/ NO_GO)(?=[\\s\\S]*Store the filled evidence outside Git\\/Codex\\/chat)", "i"),
  "P6-04 real accounting user result template UI",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-role-scope-acceptance-matrix=\"P6-04\")(?=[\\s\\S]*P6-04 role-scope acceptance matrix)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P6_04_ACCEPT \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*P6-04-ACCEPT-01)(?=[\\s\\S]*P6-04-ACCEPT-06)(?=[\\s\\S]*Static preflight and synthetic-account boundary)(?=[\\s\\S]*Negative and out-of-scope denial)(?=[\\s\\S]*Server-side enforcement)(?=[\\s\\S]*Signed evidence and production boundary)", "i"),
  "P6-04 role-scope acceptance matrix UI",
);

requireText(
  "components/settings/user-scope-enforcement-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-role-scope-access-decision-manifest=\"P6-04\")(?=[\\s\\S]*P6-04 role-scope access decision manifest)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P6_04_ACCESS_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P6-04-DEC-01)(?=[\\s\\S]*P6-04-DEC-06)(?=[\\s\\S]*Static preflight complete)(?=[\\s\\S]*Positive role access decision)(?=[\\s\\S]*Negative denial decision)(?=[\\s\\S]*Server-side enforcement decision)(?=[\\s\\S]*Broad access and delegation decision)(?=[\\s\\S]*Human access decision)(?=[\\s\\S]*production GO)", "i"),
  "P6-04 role-scope access decision manifest UI",
);

requireAllText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  [
    "Permission by role and workspace",
    "IN_PROGRESS",
    "HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md",
    "TTGDTX_UAT_EXECUTION_LOG_20260625.md",
    "TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
    "real accounting user UAT queue and result template",
    "finance Day-1 P6-04 pre-login matrix",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "post-UAT access closure handoff",
    "role-scope evidence checklist, route matrix, acceptance matrix, access decision manifest, UAT execution closure template and UAT operator handoff",
    "signed UAT still required",
  ],
  "P6-04 production checklist acceptance matrix row",
);

requireText(
  "docs/HEU_SQL_OBJECT_MASTER_MAP_20260627.md",
  literalPattern("(?=[\\s\\S]*P1-04 is PASS_LOCAL)(?=[\\s\\S]*Do not rename, drop, alter or merge production SQL objects)(?=[\\s\\S]*compatibility\\s+views, not destructive renames)", "i"),
  "P1-04 SQL object map is local-only and non-destructive",
);

requireText(
  "docs/HEU_DATA_MODEL_V1.md",
  literalPattern("P1-01 is PASS_LOCAL[\\s\\S]*does not approve schema\\s+changes, production migration, real-data import, production dashboard use or\\s+automated finance posting", "i"),
  "P1-01 data model local-only boundary",
);

requireText(
  "docs/HEU_DATA_DICTIONARY_V1.md",
  literalPattern("P1-02 is PASS_LOCAL[\\s\\S]*does not approve\\s+schema changes, production migration, real-data import or production data\\s+exposure", "i"),
  "P1-02 data dictionary local-only boundary",
);

requireText(
  "docs/HEU_ROLE_PERMISSION_MATRIX_V1.md",
  literalPattern("P1-03 is PASS_LOCAL[\\s\\S]*does\\s+not approve production access, broad permissions, real-data UAT or autonomous\\s+AI approval", "i"),
  "P1-03 role permission matrix local-only boundary",
);

requireText(
  "docs/TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP.md",
  literalPattern("Do not send real passwords, temporary passwords, password reset links or\\s+account\\s+activation\\/invite links into Codex\\/chat", "i"),
  "synthetic account password boundary",
);

requireText(
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  literalPattern("Do not send real passwords, temporary passwords, password reset links or\\s+account\\s+activation\\/invite links into Codex\\/chat", "i"),
  "browser UAT matrix account-secret boundary",
);

requireText(
  "docs/TTGDTX_BROWSER_UAT_MATRIX_20260625.md",
  literalPattern("UAT_OUT_OF_SCOPE[\\s\\S]*BLOCK", "i"),
  "browser UAT out-of-scope block expectation",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("\\|\\s*Rollback plan\\s*\\|\\s*IT_DATA\\s*\\|\\s*IN_PROGRESS\\s*\\|", "i"),
  "rollback plan IN_PROGRESS status",
);

requireText(
  "components/ttgdtx/ttgdtx-production-readiness-guard.tsx",
  literalPattern("data-ttgdtx-production-readiness-guard=\"TTGDTX_9PLUS\"[\\s\\S]*Production remains NO-GO[\\s\\S]*PASS_LOCAL[\\s\\S]*signed UAT", "i"),
  "TTGDTX production readiness guard display",
);

requireText(
  "components/ttgdtx/ttgdtx-production-readiness-guard.tsx",
  literalPattern("PASS_LOCAL chỉ có nghĩa[\\s\\S]*render từ cùng nguồn production\\s+blocker[\\s\\S]*PASS_LOCAL không\\s+phê duyệt production migration[\\s\\S]*Không chạy migration production từ Codex\\/chat[\\s\\S]*Không dùng dữ liệu\\s+thật[\\s\\S]*Cách đi tiếp an toàn[\\s\\S]*NO-GO và sửa từng lỗi nhỏ", "i"),
  "TTGDTX production readiness guard accented Vietnamese guidance",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-production-execution-queue=\"TTGDTX_9PLUS\")(?=[\\s\\S]*TTGDTX production execution queue)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*PRODUCTION_EXECUTION_STEPS)(?=[\\s\\S]*redaction, backup\\/restore, migration order,\\s+role UAT, P0-19, P2-17, P2-18, audit-log traceability,\\s+hard-delete conversion\\/waiver, P0-14 intake-ledger evidence\\s+binder, P0-15 final handoff summary, then final owner Go\\/No-Go)(?=[\\s\\S]*Final result stays NO-GO until signed owner GO exists)(?=[\\s\\S]*Decision:[\\s\\S]*step\\.decisionValue)(?=[\\s\\S]*Stop:[\\s\\S]*step\\.stopCondition)", "i"),
  "TTGDTX production execution queue UI shell",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*SAFE_ITERATION_STEPS)(?=[\\s\\S]*data-ttgdtx-safe-iteration-loop=\"TTGDTX_9PLUS\")(?=[\\s\\S]*Safe iteration loop: one small slice at a time)(?=[\\s\\S]*Build rhythm: select one blocker, run the local audit, attach\\s+controlled proof, then advance only when the guard is green)(?=[\\s\\S]*fail keeps NO-GO)", "i"),
  "TTGDTX safe iteration loop",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_INFRA_READINESS_STEPS)(?=[\\s\\S]*data-ttgdtx-infra-readiness-plan=\"P0-03_STEP90_STEP110\")(?=[\\s\\S]*Infra readiness plan: P0-03 \\+ Step90-Step110)(?=[\\s\\S]*backup\\/restore dry-run first)(?=[\\s\\S]*sign the migration order)(?=[\\s\\S]*No production migration runs from Codex\\/chat)(?=[\\s\\S]*keeps production NO-GO)(?=[\\s\\S]*backup proof first)(?=[\\s\\S]*Open infra route)", "i"),
  "TTGDTX P0-03/Step90-Step110 infra readiness plan",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_GATE_HANDOVER_STEPS)(?=[\\s\\S]*data-ttgdtx-gate-handover-plan=\"P0-19_P3-01_P3-02\")(?=[\\s\\S]*Gate and handover readiness: P0-19 \\+ P3-01\\/P3-02)(?=[\\s\\S]*legal\\/finance basis)(?=[\\s\\S]*lead handover UAT)(?=[\\s\\S]*Handover cannot bypass P0-19\\/P2-05\\/P2-03)(?=[\\s\\S]*keeps production NO-GO)(?=[\\s\\S]*finance gate first)(?=[\\s\\S]*Open gate route)", "i"),
  "TTGDTX P0-19/P3 gate-handover readiness plan",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS)(?=[\\s\\S]*data-ttgdtx-governance-assurance-plan=\"P6-04_P6-03\")(?=[\\s\\S]*Governance assurance plan: P6-04 \\+ P6-03)(?=[\\s\\S]*role\\/workspace scope)(?=[\\s\\S]*audit-log traceability)(?=[\\s\\S]*role leak)(?=[\\s\\S]*missing trace row)(?=[\\s\\S]*keeps production NO-GO)(?=[\\s\\S]*scope and trace required)(?=[\\s\\S]*Open governance route)", "i"),
  "TTGDTX P6-04/P6-03 governance assurance plan",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_UAT_LAUNCH_STEPS)(?=[\\s\\S]*data-ttgdtx-uat-launch-plan=\"P2-18_P5-03\")(?=[\\s\\S]*First UAT launch plan: P2-18 \\+ P5-03)(?=[\\s\\S]*signed browser UAT)(?=[\\s\\S]*Use synthetic accounts plus P6-04 real-accounting\\s+queue\\/result proof)(?=[\\s\\S]*store proof outside Git\\/Codex\\/chat)(?=[\\s\\S]*signed evidence required)(?=[\\s\\S]*Open UAT route)", "i"),
  "TTGDTX P2-18/P5-03 UAT launch plan",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_UAT_FIRST_PASS_STEPS)(?=[\\s\\S]*data-ttgdtx-finance-first-uat-checklist=\"P2-18_P5-03\")(?=[\\s\\S]*First signed finance UAT checklist: P2-18 \\+ P5-03)(?=[\\s\\S]*P2_18_P5_03_FIRST_UAT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*FIN-UAT-01)(?=[\\s\\S]*FIN-UAT-05)(?=[\\s\\S]*P0-10\\s+evidence redaction)(?=[\\s\\S]*P6-04 real users)(?=[\\s\\S]*dashboard reconciliation)(?=[\\s\\S]*Finance Desk\\s+read-only behavior)(?=[\\s\\S]*P0-14\\/P0-17 handoff)(?=[\\s\\S]*not UAT acceptance)", "i"),
  "TTGDTX P2-18/P5-03 first finance UAT checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATES)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST)(?=[\\s\\S]*data-ttgdtx-finance-day-one-start-gates=\"P0-03_P0-10_P6-04_P0-14_P0-17\")(?=[\\s\\S]*Finance Day-1 start gates before account activation)(?=[\\s\\S]*backup\\/restore\\s+evidence)(?=[\\s\\S]*signed finance UAT route readiness)(?=[\\s\\S]*controlled\\s+redaction storage)(?=[\\s\\S]*result-ledger path)(?=[\\s\\S]*P0-17 access-closure\\s+path)(?=[\\s\\S]*FIN_START_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Checklist:[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST)(?=[\\s\\S]*gate\\.requiredProof)(?=[\\s\\S]*gate\\.stopCondition)", "i"),
  "TTGDTX finance Day-1 start gates before account activation UI",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE)(?=[\\s\\S]*data-ttgdtx-finance-day-one-account-activation=\"P0-17_P6-04\")(?=[\\s\\S]*Finance Day-1 account activation handoff)(?=[\\s\\S]*approved account\\s+label)(?=[\\s\\S]*secure invite\\/create status)(?=[\\s\\S]*HEU profile link)(?=[\\s\\S]*narrow\\s+business scope)(?=[\\s\\S]*P6-04 pre-login result)(?=[\\s\\S]*Template:[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE)(?=[\\s\\S]*FIN_ACTIVATION_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Credential material\\s+stays outside Git\\/Codex\\/chat)(?=[\\s\\S]*item\\.code)(?=[\\s\\S]*item\\.requiredProof)(?=[\\s\\S]*item\\.stopCondition)", "i"),
  "TTGDTX finance Day-1 account activation handoff UI",
);

requireAllText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  [
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS",
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX",
    "data-ttgdtx-finance-day-one-p6-04-prelogin-matrix=\"P6-04_P0-17\"",
    "Finance Day-1 P6-04 pre-login route matrix",
    "allowed route family",
    "blocked route family",
    "required result",
    "negative-control result",
    "outside Git/Codex/chat",
    "Matrix:",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "item.rolloutOrder",
    "item.entryGate",
    "item.advanceGate",
    "item.accountLabel",
    "item.allowedBeforeFinanceLogin",
    "item.blockedBeforeFinanceLogin",
    "item.requiredResult",
    "item.stopCondition",
  ],
  "TTGDTX finance Day-1 P6-04 pre-login matrix UI",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RUNBOOK)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS)(?=[\\s\\S]*data-ttgdtx-finance-day-one-run-rehearsal=\"P0-17_P6-04_P2-18_P5-03_P2-17\")(?=[\\s\\S]*data-ttgdtx-finance-day-one-run-range=\"FIN-DAY1-01_FIN-DAY1-05\")(?=[\\s\\S]*Finance Day-1 real-run rehearsal: PASS_LOCAL only)(?=[\\s\\S]*approved account labels only)(?=[\\s\\S]*outside Git\\/Codex\\/chat)(?=[\\s\\S]*do not initiate a bank instruction)(?=[\\s\\S]*Runbook:[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RUNBOOK)(?=[\\s\\S]*FIN_DAY1_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*FIN-DAY1-01)(?=[\\s\\S]*FIN-DAY1-05)(?=[\\s\\S]*Decision:[\\s\\S]*step\\.decisionValue)(?=[\\s\\S]*Stop:[\\s\\S]*step\\.stopCondition)", "i"),
  "TTGDTX finance Day-1 real-run rehearsal UI",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE)(?=[\\s\\S]*data-ttgdtx-finance-day-one-result-ledger=\"P0-17_P6-04_P2-18_P5-03_P2-17\")(?=[\\s\\S]*Finance Day-1 result ledger: real-user proof rows)(?=[\\s\\S]*Each real-accounting Day-1 lane needs a controlled evidence row)(?=[\\s\\S]*Template:[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE)(?=[\\s\\S]*FIN_DAY1_RESULT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*lane\\.rolloutOrder)(?=[\\s\\S]*lane\\.entryGate)(?=[\\s\\S]*lane\\.advanceGate)(?=[\\s\\S]*lane\\.accountLabel)(?=[\\s\\S]*lane\\.requiredResult)(?=[\\s\\S]*lane\\.stopCondition)(?=[\\s\\S]*item\\.forbiddenContent)(?=[\\s\\S]*Missing, ownerless or raw evidence keeps production\\s+NO-GO)", "i"),
  "TTGDTX finance Day-1 result ledger UI",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES)(?=[\\s\\S]*data-ttgdtx-finance-day-one-access-closure-lanes=\"P0-17_FIN_USER\")(?=[\\s\\S]*Finance Day-1 access closure: one lane before the next)(?=[\\s\\S]*Each `FIN-USER` lane needs a controlled P0-17 decision before the\\s+next lane opens)(?=[\\s\\S]*ACCESS_RETAIN \\/ REVOKE_OR_REDUCE \\/ BLOCKED)(?=[\\s\\S]*lane\\.rolloutOrder)(?=[\\s\\S]*lane\\.accountLabel)(?=[\\s\\S]*lane\\.requiredProof)(?=[\\s\\S]*lane\\.retainCondition)(?=[\\s\\S]*lane\\.reduceOrRevokeCondition)(?=[\\s\\S]*lane\\.blockCondition)(?=[\\s\\S]*lane\\.nextLaneGate)(?=[\\s\\S]*lane\\.stopCondition)", "i"),
  "TTGDTX finance Day-1 sequential access closure lanes UI",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*export const SAFE_ITERATION_STEPS)(?=[\\s\\S]*ITER-01)(?=[\\s\\S]*Pick one blocker)(?=[\\s\\S]*ITER-02)(?=[\\s\\S]*Run local guard)(?=[\\s\\S]*ITER-03)(?=[\\s\\S]*Attach controlled proof)(?=[\\s\\S]*ITER-04)(?=[\\s\\S]*Advance only if green)(?=[\\s\\S]*commit that small scope)(?=[\\s\\S]*keep NO-GO)", "i"),
  "TTGDTX safe iteration shared source",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*export const PRODUCTION_INFRA_READINESS_STEPS)(?=[\\s\\S]*P0-03)(?=[\\s\\S]*Backup and restore dry-run evidence)(?=[\\s\\S]*Target identity lock)(?=[\\s\\S]*STEP90_STEP110_BACKUP_RESTORE_OPERATOR_RUN_SHEET_20260627\\.md)(?=[\\s\\S]*audit:ttgdtx-backup-restore-dry-run-pack)(?=[\\s\\S]*Step90-Step110)(?=[\\s\\S]*Signed production migration order)(?=[\\s\\S]*MIGRATION_EVIDENCE_ACCEPTED)(?=[\\s\\S]*STEP90_STEP110_MIGRATION_ORDER_SIGNOFF_GUARD_20260627\\.md)(?=[\\s\\S]*audit:ttgdtx-migration-order-guard)", "i"),
  "TTGDTX P0-03/Step90-Step110 infra readiness shared source",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*export const PRODUCTION_GATE_HANDOVER_STEPS)(?=[\\s\\S]*P0-19)(?=[\\s\\S]*Legal and finance gate UAT)(?=[\\s\\S]*P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK\\.md)(?=[\\s\\S]*audit:ttgdtx-p019-gate-guard)(?=[\\s\\S]*P3-01\\/P3-02)(?=[\\s\\S]*Lead lifecycle and handover UAT)(?=[\\s\\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\\.md)(?=[\\s\\S]*audit:heu-lead-lifecycle-handover-uat-pack)(?=[\\s\\S]*bypass P0-19\\/P2-05\\/P2-03 finance gates)", "i"),
  "TTGDTX P0-19/P3 gate-handover shared source",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*export const PRODUCTION_GOVERNANCE_ASSURANCE_STEPS)(?=[\\s\\S]*P6-04)(?=[\\s\\S]*Role and workspace scope UAT)(?=[\\s\\S]*HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627\\.md)(?=[\\s\\S]*audit:heu-role-scope-uat-pack)(?=[\\s\\S]*P6-03)(?=[\\s\\S]*Audit-log traceability UAT)(?=[\\s\\S]*TTGDTX_AUDIT_LOG_UAT_RUNBOOK\\.md)(?=[\\s\\S]*audit:ttgdtx-audit-trail-guard)", "i"),
  "TTGDTX P6-04/P6-03 governance assurance shared source",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*export const PRODUCTION_UAT_LAUNCH_STEPS)(?=[\\s\\S]*P2-18)(?=[\\s\\S]*Accounting dashboard browser UAT)(?=[\\s\\S]*docs\\/P2_18_ACCOUNTING_DASHBOARD_UAT_RUNBOOK\\.md)(?=[\\s\\S]*P6-04 real accounting user queue\\/result proof)(?=[\\s\\S]*P6-04 real-accounting proof is missing)(?=[\\s\\S]*audit:ttgdtx-accounting-dashboard-uat-plan)(?=[\\s\\S]*P5-03)(?=[\\s\\S]*Finance Desk browser UAT)(?=[\\s\\S]*docs\\/HEU_FINANCE_DESK_UAT_RUNBOOK_20260627\\.md)(?=[\\s\\S]*lacks P6-04 real-accounting proof)(?=[\\s\\S]*audit:heu-finance-desk)", "i"),
  "TTGDTX P2-18/P5-03 UAT launch shared source",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*export const PRODUCTION_FINANCE_UAT_FIRST_PASS_STEPS)(?=[\\s\\S]*FIN-UAT-01)(?=[\\s\\S]*P0-10 evidence redaction is ready)(?=[\\s\\S]*FIN-UAT-02)(?=[\\s\\S]*P6-04 real-accounting accounts are ready)(?=[\\s\\S]*FIN-UAT-03)(?=[\\s\\S]*P2-18 dashboard route is ready)(?=[\\s\\S]*FIN-UAT-04)(?=[\\s\\S]*P5-03 Finance Desk route is ready)(?=[\\s\\S]*FIN-UAT-05)(?=[\\s\\S]*P0-14\\/P0-17 handoff is ready)(?=[\\s\\S]*Evidence ID, redaction reviewer, owner signature state or access closure decision is missing)", "i"),
  "TTGDTX P2-18/P5-03 first finance UAT shared source",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md)(?=[\\s\\S]*export type ProductionFinanceDayOneStartGate)(?=[\\s\\S]*export const PRODUCTION_FINANCE_DAY_ONE_START_GATES)(?=[\\s\\S]*FIN-START-01)(?=[\\s\\S]*FIN-START-05)", "i"),
  "TTGDTX finance Day-1 start-gate checklist shared source",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*export type ProductionFinanceDayOneStartGate)(?=[\\s\\S]*export const PRODUCTION_FINANCE_DAY_ONE_START_GATES)(?=[\\s\\S]*FIN-START-01)(?=[\\s\\S]*P0-03 backup\\/restore evidence is accepted before real accounts)(?=[\\s\\S]*FIN-START-02)(?=[\\s\\S]*Signed finance UAT route package is ready)(?=[\\s\\S]*FIN-START-03)(?=[\\s\\S]*P0-10 controlled evidence redaction location is ready)(?=[\\s\\S]*FIN-START-04)(?=[\\s\\S]*P0-14\\/P0-17 evidence and access-closure path is prepared)(?=[\\s\\S]*FIN-START-05)(?=[\\s\\S]*Human owner boundary is acknowledged)(?=[\\s\\S]*FIN_START_READY)(?=[\\s\\S]*create accounts, grant access, accept UAT, move money or mark production GO)", "i"),
  "TTGDTX finance Day-1 start gates shared source",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE[\\s\\S]*HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630\\.md)(?=[\\s\\S]*export type ProductionFinanceDayOneAccountActivationCheck)(?=[\\s\\S]*export const PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS)(?=[\\s\\S]*FIN-ACT-01)(?=[\\s\\S]*Account label and owner are approved)(?=[\\s\\S]*FIN-ACT-02)(?=[\\s\\S]*Supabase Auth invite stays outside Codex)(?=[\\s\\S]*FIN-ACT-03)(?=[\\s\\S]*HEU profile link is completed)(?=[\\s\\S]*FIN-ACT-04)(?=[\\s\\S]*Business scope is assigned before login)(?=[\\s\\S]*FIN-ACT-05)(?=[\\s\\S]*P6-04 pre-login route check is recorded)(?=[\\s\\S]*Password, temporary password, OTP, reset link, account invite\\/activation link)", "i"),
  "TTGDTX finance Day-1 account activation handoff shared source",
);

requireAllText(
  "lib/production-readiness.ts",
  [
    "PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_MATRIX",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "export type ProductionFinanceDayOnePreloginRouteCheck",
    "export const PRODUCTION_FINANCE_DAY_ONE_P6_04_PRELOGIN_CHECKS",
    "rolloutOrder",
    "entryGate",
    "advanceGate",
    "FIN-USER-01",
    "FIN-USER-05",
    "P6-04-PRELOGIN-01",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "P6-04-PRELOGIN-05",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "allowedBeforeFinanceLogin",
    "blockedBeforeFinanceLogin",
    "requiredResult",
    "BLOCKED or EMPTY_SCOPED_STATE",
    "negative-control account sees any protected route",
  ],
  "TTGDTX finance Day-1 P6-04 pre-login matrix shared source",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*export type ProductionFinanceDayOneRunStep)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RUNBOOK[\\s\\S]*HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630\\.md)(?=[\\s\\S]*export const PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS)(?=[\\s\\S]*FIN-DAY1-01)(?=[\\s\\S]*Secure account activation outside Codex)(?=[\\s\\S]*FIN-DAY1-02)(?=[\\s\\S]*Scope proof before first finance login)(?=[\\s\\S]*FIN-DAY1-03)(?=[\\s\\S]*Read-only dashboard confidence check)(?=[\\s\\S]*FIN-DAY1-04)(?=[\\s\\S]*Payout rehearsal with no bank action)(?=[\\s\\S]*FIN-DAY1-05)(?=[\\s\\S]*Access closure before expansion)(?=[\\s\\S]*FIN_DAY1_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Passwords, temporary passwords, OTPs, reset links)(?=[\\s\\S]*A bank instruction is initiated)(?=[\\s\\S]*blocked users keep active finance access)", "i"),
  "TTGDTX finance Day-1 real-run rehearsal shared source",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md)(?=[\\s\\S]*export type ProductionFinanceDayOneAccountLane)(?=[\\s\\S]*rolloutOrder)(?=[\\s\\S]*entryGate)(?=[\\s\\S]*advanceGate)(?=[\\s\\S]*export type ProductionFinanceDayOneResultField)(?=[\\s\\S]*export const PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES)(?=[\\s\\S]*FIN-USER-01)(?=[\\s\\S]*FIN-USER-05)(?=[\\s\\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\\s\\S]*REAL_BGH_READONLY_01)(?=[\\s\\S]*REAL_AUDIT_READONLY_01)(?=[\\s\\S]*REAL_PHAP_CHE_REVIEW_01)(?=[\\s\\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\\s\\S]*export const PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS)(?=[\\s\\S]*Rollout order)(?=[\\s\\S]*Entry gate)(?=[\\s\\S]*Advance gate)(?=[\\s\\S]*No skipped lane)(?=[\\s\\S]*No next-lane access)(?=[\\s\\S]*Evidence ID)(?=[\\s\\S]*Owner decision)(?=[\\s\\S]*FIN_DAY1_RESULT_READY)(?=[\\s\\S]*Access closure)(?=[\\s\\S]*No raw PII, CCCD, bank data, voucher body)(?=[\\s\\S]*No password, OTP, invite\\/reset link)", "i"),
  "TTGDTX finance Day-1 result ledger shared source",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*export type ProductionFinanceDayOneAccessClosureLane)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES)(?=[\\s\\S]*closureDecisionValue)(?=[\\s\\S]*retainCondition)(?=[\\s\\S]*reduceOrRevokeCondition)(?=[\\s\\S]*blockCondition)(?=[\\s\\S]*nextLaneGate)(?=[\\s\\S]*requiredProof)(?=[\\s\\S]*FIN-USER-01)(?=[\\s\\S]*FIN-DAY1-EVID-001)(?=[\\s\\S]*FIN-USER-05)(?=[\\s\\S]*FIN-DAY1-EVID-005)(?=[\\s\\S]*Do not expand beyond Finance Day-1)(?=[\\s\\S]*Any department\\/user expansion starts before the negative-control closure decision is signed)", "i"),
  "TTGDTX finance Day-1 sequential access closure shared source",
);

requireText(
  "docs/HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
  literalPattern("(?=[\\s\\S]*HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630\\.md)(?=[\\s\\S]*before[\\s\\S]*first real-accounting login)(?=[\\s\\S]*secure invite\\/create state)(?=[\\s\\S]*HEU profile link)(?=[\\s\\S]*narrow business scope)(?=[\\s\\S]*P6-04 pre-login result)(?=[\\s\\S]*outside Git\\/Codex\\/chat)", "i"),
  "finance Day-1 account activation link in real-run runbook",
);

requireAllText(
  "docs/HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
  [
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "P6-04 Pre-Login Route Matrix",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "ALLOWED",
    "BLOCKED",
    "EMPTY_SCOPED_STATE",
    "do not open P2-18, P5-03 or P2-17",
  ],
  "finance Day-1 P6-04 pre-login matrix in real-run runbook",
);

requireAllText(
  "docs/HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
  [
    "Status: PASS_LOCAL_TEMPLATE",
    "Production status: NO-GO",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "Run one pre-login row at a time",
    "Rollout order",
    "Entry gate",
    "Advance gate",
    "FIN-USER-01",
    "FIN-USER-05",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_BGH_READONLY_01",
    "REAL_AUDIT_READONLY_01",
    "REAL_PHAP_CHE_REVIEW_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "P6-04-PRELOGIN-EVID-001",
    "P6-04-PRELOGIN-EVID-005",
    "does not create accounts",
    "store passwords",
    "move money",
    "mark production GO",
    "Do not open the next `FIN-USER` lane",
  ],
  "finance Day-1 P6-04 pre-login matrix template",
);

requireText(
  "docs/HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_TEMPLATE)(?=[\\s\\S]*Production status:\\s*NO-GO)(?=[\\s\\S]*Run one activation row at a time)(?=[\\s\\S]*Rollout order)(?=[\\s\\S]*Entry gate)(?=[\\s\\S]*Advance gate)(?=[\\s\\S]*FIN-USER-01)(?=[\\s\\S]*FIN-USER-05)(?=[\\s\\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\\s\\S]*REAL_BGH_READONLY_01)(?=[\\s\\S]*REAL_AUDIT_READONLY_01)(?=[\\s\\S]*REAL_PHAP_CHE_REVIEW_01)(?=[\\s\\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\\s\\S]*FIN_ACTIVATION_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*FIN-ACT-01)(?=[\\s\\S]*FIN-ACT-05)(?=[\\s\\S]*does not create accounts)(?=[\\s\\S]*store passwords)(?=[\\s\\S]*mark production GO)(?=[\\s\\S]*Never paste or attach)(?=[\\s\\S]*Do not open P2-18, P5-03 or P2-17)(?=[\\s\\S]*Do not open the next `FIN-USER` lane)", "i"),
  "finance Day-1 account activation handoff template",
);

requireText(
  "docs/HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_CHECKLIST)(?=[\\s\\S]*FIN_START_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*FIN-START-EVID-001)(?=[\\s\\S]*FIN-START-EVID-005)(?=[\\s\\S]*FIN-START-01)(?=[\\s\\S]*FIN-START-05)(?=[\\s\\S]*Do not paste or attach passwords)(?=[\\s\\S]*does not create accounts)(?=[\\s\\S]*send invites)(?=[\\s\\S]*store passwords)(?=[\\s\\S]*grant\\s+access)(?=[\\s\\S]*execute UAT)(?=[\\s\\S]*accept evidence)(?=[\\s\\S]*approve finance reliance)(?=[\\s\\S]*approve access closure)(?=[\\s\\S]*move money)(?=[\\s\\S]*issue bank instructions)(?=[\\s\\S]*mark production GO)(?=[\\s\\S]*Do not start `FIN-ACT-EVID-001`)", "i"),
  "finance Day-1 start-gate checklist template",
);

requireText(
  "docs/HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
  literalPattern("(?=[\\s\\S]*Start Gates Before Any Invite\\/Create)(?=[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md)(?=[\\s\\S]*FIN-START-EVID-001)(?=[\\s\\S]*FIN-START-EVID-005)(?=[\\s\\S]*FIN_START_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*FIN-START-01 P0-03 backup\\/restore evidence accepted)(?=[\\s\\S]*FIN-START-05 Human owner boundary acknowledged)(?=[\\s\\S]*No invite, create or activation row may start)(?=[\\s\\S]*Start first after `FIN_START_READY`)(?=[\\s\\S]*PASS_LOCAL does not approve access, UAT, finance reliance, migration, owner GO or production GO)", "i"),
  "finance Day-1 account activation start-gate template",
);

requireAllText(
  "docs/HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
  [
    "P6-04 Pre-Login Matrix Handoff",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "allowed route family",
    "blocked route family",
    "negative-control account",
    "Do not open P2-18, P5-03 or P2-17",
  ],
  "finance Day-1 account activation template P6-04 pre-login handoff",
);

requireText(
  "docs/HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_RUNBOOK)(?=[\\s\\S]*Production status:\\s*NO-GO)(?=[\\s\\S]*Required Day-1 Accounts)(?=[\\s\\S]*Rollout order)(?=[\\s\\S]*Entry gate)(?=[\\s\\S]*Advance gate)(?=[\\s\\S]*Run one account lane at a time)(?=[\\s\\S]*FIN-USER-01)(?=[\\s\\S]*FIN-USER-05)(?=[\\s\\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\\s\\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\\s\\S]*FIN-DAY1-01)(?=[\\s\\S]*FIN-DAY1-05)(?=[\\s\\S]*FIN_DAY1_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Do not paste or store)(?=[\\s\\S]*Passwords, temporary passwords, OTPs, reset links or account invite links)(?=[\\s\\S]*P2-17 payout rehearsal with no bank action)(?=[\\s\\S]*Do not expand from finance to the next department)(?=[\\s\\S]*Production remains\\s+NO-GO)", "i"),
  "finance Day-1 real-run rehearsal runbook",
);

requireText(
  "docs/HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
  literalPattern("(?=[\\s\\S]*Day-1 Result Ledger)(?=[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md)(?=[\\s\\S]*Rollout order)(?=[\\s\\S]*Advance gate)(?=[\\s\\S]*FIN-USER-01)(?=[\\s\\S]*FIN-USER-05)(?=[\\s\\S]*REAL_KHTC_TTGDTX_OPERATOR_01)(?=[\\s\\S]*REAL_OUT_OF_SCOPE_NEGATIVE_01)(?=[\\s\\S]*FIN-DAY1-EVID-001)(?=[\\s\\S]*FIN_DAY1_RESULT_READY)(?=[\\s\\S]*ACCESS_RETAIN)(?=[\\s\\S]*REVOKE_OR_REDUCE)(?=[\\s\\S]*Raw PII, CCCD, bank data, voucher body)(?=[\\s\\S]*does not approve access, accept UAT, approve finance reliance, move money or\\s+mark production GO)", "i"),
  "finance Day-1 result ledger runbook",
);

requireAllText(
  "docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
  [
    "Status: PASS_LOCAL_TEMPLATE",
    "Production status: NO-GO",
    "Rollout order",
    "Entry gate",
    "Advance gate",
    "FIN-USER-01",
    "FIN-USER-05",
    "Run one rollout lane at a time",
    "Do not expand beyond Finance Day-1",
    "REAL_KHTC_TTGDTX_OPERATOR_01",
    "REAL_BGH_READONLY_01",
    "REAL_AUDIT_READONLY_01",
    "REAL_PHAP_CHE_REVIEW_01",
    "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    "FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    "ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED",
    "does not create accounts",
    "issue bank instructions",
    "mark production GO",
    "No raw screenshots",
    "Stop and Escalate",
  ],
  "finance Day-1 result ledger template",
);

requireAllText(
  "docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
  [
    "Sequential Access Closure Decision Queue",
    "Each row must close before the next lane opens",
    "FIN-DAY1-EVID-001",
    "FIN-DAY1-EVID-005",
    "Do not open `FIN-USER-02` until signed",
    "Do not expand beyond Finance Day-1 until signed",
    "ACCESS_RETAIN",
    "REVOKE_OR_REDUCE",
    "BLOCKED",
  ],
  "finance Day-1 sequential access closure decision queue template",
);

requireAllText(
  "docs/HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
  [
    "Sequential Access Closure Decision Queue",
    "Close each lane in order",
    "exact signed scope",
    "FIN-DAY1-EVID-001",
    "FIN-DAY1-EVID-005",
    "Do not open `FIN-USER-02` until signed",
    "Do not expand beyond Finance Day-1 until signed",
    "REVOKE_OR_REDUCE",
    "BLOCKED",
  ],
  "finance Day-1 sequential access closure decision queue runbook",
);

requireText(
  "components/ttgdtx/ttgdtx-production-execution-queue.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_RISK_CLOSURE_STEPS)(?=[\\s\\S]*data-ttgdtx-risk-closure-plan=\"P6-06_P2-17\")(?=[\\s\\S]*Next risk closure plan: P6-06 \\+ P2-17)(?=[\\s\\S]*hard-delete\\/cascade conversion-or-waiver)(?=[\\s\\S]*payout\\s+duplicate\\/dossier evidence)(?=[\\s\\S]*Missing proof\\s+keeps production NO-GO)(?=[\\s\\S]*closure proof required)(?=[\\s\\S]*Open closure route)", "i"),
  "TTGDTX P6-06/P2-17 risk closure plan",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*export const PRODUCTION_RISK_CLOSURE_STEPS)(?=[\\s\\S]*P6-06)(?=[\\s\\S]*Hard-delete and cascade conversion or waiver)(?=[\\s\\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\\.md)(?=[\\s\\S]*audit:hard-delete-conversion-decision-queue)(?=[\\s\\S]*P2-17)(?=[\\s\\S]*Payout duplicate-click and dossier UAT)(?=[\\s\\S]*P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK\\.md)(?=[\\s\\S]*audit:ttgdtx-payout-execution-readiness)", "i"),
  "TTGDTX P6-06/P2-17 risk closure shared source",
);

requireText(
  "components/ttgdtx/ttgdtx-production-evidence-binder.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-production-evidence-binder=\"P0-14\")(?=[\\s\\S]*P0-14 production evidence binder)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*PRODUCTION_EVIDENCE_REQUIREMENTS)(?=[\\s\\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS)(?=[\\s\\S]*PRODUCTION_UAT_LAUNCH_STEPS)(?=[\\s\\S]*NO-GO until signed)(?=[\\s\\S]*Forbidden:[\\s\\S]*item\\.forbiddenContent)(?=[\\s\\S]*data-p014-controlled-evidence-intake-ledger=\"P0-14\")(?=[\\s\\S]*P0-14 controlled evidence intake ledger)(?=[\\s\\S]*P0_14_INTAKE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*evidence ID, controlled folder reference,\\s+evidence class, redaction reviewer, owner signature state and\\s+blocker decision)(?=[\\s\\S]*data-p014-governance-evidence-checkpoint=\"P6-04_P6-03\")(?=[\\s\\S]*P0-14 governance evidence checkpoint: P6-04 \\+ P6-03)(?=[\\s\\S]*role leak, missing trace row, broad\\s+access path or unsigned evidence keeps P0-14 NO-GO)(?=[\\s\\S]*data-p014-finance-reliance-evidence-checkpoint=\"P2-18_P5-03_P6-04\")(?=[\\s\\S]*P0-14 finance reliance evidence checkpoint: P2-18 \\+ P5-03 \\+ P6-04)(?=[\\s\\S]*P6-04 real\\s+accounting user queue\\/result proof)(?=[\\s\\S]*P0-17 real-user access\\s+closure decision)(?=[\\s\\S]*data-p014-real-user-access-closure-proof=\"P0-17-P6-04\")(?=[\\s\\S]*ACCESS_RETAIN \\/ REVOKE_OR_REDUCE \\/ BLOCKED)(?=[\\s\\S]*P2_18_P5_03_FINANCE_PROOF \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*data-heu-real-accounting-user-uat-queue)(?=[\\s\\S]*data-heu-real-accounting-user-result-template)(?=[\\s\\S]*data-p014-production-evidence-closure-tracker=\"P0-14\")(?=[\\s\\S]*P0-14 production evidence closure tracker)(?=[\\s\\S]*P0_14_CLOSE \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Missing proof keeps production NO-GO)(?=[\\s\\S]*Forbidden content stays out of Git\\/Codex\\/chat)(?=[\\s\\S]*temporary passwords)(?=[\\s\\S]*password reset links)(?=[\\s\\S]*account\\s+activation\\/invite links)", "i"),
  "P0-14 production evidence binder UI",
);

requireText(
  "components/ttgdtx/ttgdtx-production-evidence-binder.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST)(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATES)(?=[\\s\\S]*data-p014-finance-day-one-start-gate-evidence=\"FIN-START-EVID\")(?=[\\s\\S]*Finance Day-1 start-gate evidence checklist)(?=[\\s\\S]*P0-14 must cite the start-gate checklist before any\\s+real-accounting invite\\/create, activation row, Finance Desk\\s+reliance review or owner GO\\/NO-GO review)(?=[\\s\\S]*Checklist:[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_START_GATE_CHECKLIST)(?=[\\s\\S]*FIN_START_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*FIN-START-EVID-001)(?=[\\s\\S]*FIN-START-EVID-005)(?=[\\s\\S]*gate\\.requiredProof)(?=[\\s\\S]*gate\\.stopCondition)", "i"),
  "P0-14 Finance Day-1 start-gate evidence checkpoint",
);

requireText(
  "components/ttgdtx/ttgdtx-production-evidence-binder.tsx",
  literalPattern("(?=[\\s\\S]*data-p014-finance-day-one-result-ledger=\"FIN-DAY1-EVID\")(?=[\\s\\S]*Finance Day-1 ledger)(?=[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md)(?=[\\s\\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005)(?=[\\s\\S]*FIN_DAY1_RESULT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*ACCESS_RETAIN \\/[\\s\\S]*REVOKE_OR_REDUCE \\/ BLOCKED)(?=[\\s\\S]*before Finance Desk reliance or[\\s\\S]*owner GO\\/NO-GO review)", "i"),
  "P0-14 Finance Day-1 result ledger evidence checkpoint",
);

requireText(
  "components/ttgdtx/ttgdtx-production-evidence-binder.tsx",
  literalPattern("(?=[\\s\\S]*PRODUCTION_FINANCE_DAY_ONE_ACCESS_CLOSURE_LANES)(?=[\\s\\S]*data-p014-finance-day-one-access-closure-lanes=\"P0-17-FIN-USER\")(?=[\\s\\S]*Finance Day-1 access closure evidence lanes)(?=[\\s\\S]*P0-14 reliance evidence must cite each Day-1 lane closure)(?=[\\s\\S]*Missing lane\\s+closure keeps P0-14 NO-GO)(?=[\\s\\S]*lane\\.rolloutOrder)(?=[\\s\\S]*lane\\.accountLabel)(?=[\\s\\S]*lane\\.closureDecisionValue)(?=[\\s\\S]*lane\\.requiredProof)(?=[\\s\\S]*lane\\.nextLaneGate)(?=[\\s\\S]*lane\\.stopCondition)", "i"),
  "P0-14 Finance Day-1 sequential access closure evidence lanes",
);

requireText(
  "app/ttgdtx/page.tsx",
  literalPattern("<TtgdtxProductionExecutionQueue\\s*\\/>[\\s\\S]*<TtgdtxProductionEvidenceBinder\\s*\\/>[\\s\\S]*<TtgdtxOwnerGoNoGoEvidenceChecklist\\s*\\/>", ""),
  "TTGDTX landing page mounts evidence binder before owner signoff",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("P0-10[\\s\\S]*P0-03[\\s\\S]*Step90-Step110[\\s\\S]*P6-04[\\s\\S]*P0-19[\\s\\S]*P2-17[\\s\\S]*P2-18[\\s\\S]*P6-03[\\s\\S]*P6-06[\\s\\S]*P0-14[\\s\\S]*P0-15[\\s\\S]*Owner GO\\/NO-GO", "i"),
  "TTGDTX production execution shared source order",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("P0-15[\\s\\S]*Prepare final handoff summary[\\s\\S]*Record live git state, local checks, Stage D\\/NO-GO and P0-03\\/P0-09\\/P0-13\\/P0-14 evidence paths[\\s\\S]*P0-03 restore smoke-check proof for P0-19\\/P3 gate preservation and the P0-09 final owner decision manifest[\\s\\S]*P0-14 controlled evidence intake ledger[\\s\\S]*redaction reviewer[\\s\\S]*owner signature state[\\s\\S]*P2-18\\/P5-03 real-accounting finance reliance proof[\\s\\S]*Finance Day-1 start-gate checklist[\\s\\S]*Finance Day-1 result ledger[\\s\\S]*P0-17 access closure decision[\\s\\S]*P6-04\\/P6-03\\/P6-06 proof paths and the P6-06 finding register[\\s\\S]*before owner decision", "i"),
  "P0-15 final handoff split evidence shared source",
);

requireText(
  "lib/production-readiness.ts",
  literalPattern("(?=[\\s\\S]*PRODUCTION_EVIDENCE_REQUIREMENTS)(?=[\\s\\S]*P0-14-01)(?=[\\s\\S]*Target identity lock, operator run sheet, backup ID, restore target, preflight\\/postflight result, restore smoke-check result proving P0-19 and P3-01\\/P3-02 gate preservation, and operator\\/checker names)(?=[\\s\\S]*P0-19\\/P3 gate preservation)(?=[\\s\\S]*P0-14-02)(?=[\\s\\S]*MIGRATION_EVIDENCE_ACCEPTED decision)(?=[\\s\\S]*P0-14-06)(?=[\\s\\S]*Role and workspace UAT evidence)(?=[\\s\\S]*P0-14-07)(?=[\\s\\S]*Audit-log traceability evidence)(?=[\\s\\S]*P0-14-08)(?=[\\s\\S]*Hard-delete and cascade conversion evidence)(?=[\\s\\S]*P0-14-09)(?=[\\s\\S]*signed decision referencing the owner sign-off pack, final owner decision manifest and UAT operator handoff)(?=[\\s\\S]*CONTROLLED_SENSITIVE)(?=[\\s\\S]*CONTROLLED_REDACTED)(?=[\\s\\S]*temporary password)(?=[\\s\\S]*password reset link)(?=[\\s\\S]*account activation\\/invite link)(?=[\\s\\S]*raw student PII)(?=[\\s\\S]*bank statements?)(?=[\\s\\S]*AI(?:-produced)? approvals?)", "i"),
  "P0-14 production evidence shared source",
);

requireText(
  "components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-owner-go-no-go-evidence-checklist=\"P0-09\")(?=[\\s\\S]*P0-09 owner GO\\/NO-GO evidence checklist)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P0-09-01)(?=[\\s\\S]*P0-09-06)(?=[\\s\\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\\.md)(?=[\\s\\S]*P3-01\\/P3-02 lead lifecycle and handover UAT)(?=[\\s\\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\\.md)(?=[\\s\\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\\.md)(?=[\\s\\S]*Signed final GO\\/NO-GO is still required)(?=[\\s\\S]*BGH, IT_DATA, KHTC, PHAP_CHE, AUDIT and\\s+TRUONG_PHONG\\/process owner must sign the decision outside\\s+Codex\\/chat)(?=[\\s\\S]*PASS_LOCAL does not approve backup, restore, migration, legal waiver,\\s+finance action, UAT acceptance, payout, dashboard reliance or\\s+production GO)(?=[\\s\\S]*secrets, passwords, temporary passwords,\\s+OTPs, password reset links, account activation\\/invite links,\\s+service-role keys, bank credentials, raw student PII, raw CCCD, raw\\s+phone numbers, raw bank account numbers, bank statements, vouchers or\\s+raw payment data)", "i"),
  "P0-09 owner GO/NO-GO evidence checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md)(?=[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md)(?=[\\s\\S]*FIN-START-EVID-001 through FIN-START-EVID-005)(?=[\\s\\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005)(?=[\\s\\S]*FIN_START_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*FIN_DAY1_RESULT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*ACCESS_RETAIN \\/ REVOKE_OR_REDUCE \\/ BLOCKED)(?=[\\s\\S]*Finance Day-1 start-gate checklist lacks)(?=[\\s\\S]*Finance Day-1 result ledger lacks)(?=[\\s\\S]*missing Finance Day-1 start-gate checklist)(?=[\\s\\S]*missing Finance Day-1 result ledger)(?=[\\s\\S]*missing access-retain\\/revoke\\/block decision)", "i"),
  "P0-09 Finance Day-1 result ledger owner checklist",
);

requireText(
  "docs/TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627.md",
  literalPattern("(?=[\\s\\S]*P5-03 Finance Desk controlled trial and UAT)(?=[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md)(?=[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md)(?=[\\s\\S]*FIN-START-EVID-001 through FIN-START-EVID-005)(?=[\\s\\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005)(?=[\\s\\S]*FIN_START_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*FIN_DAY1_RESULT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*ACCESS_RETAIN \\/ REVOKE_OR_REDUCE \\/ BLOCKED)(?=[\\s\\S]*Finance Day-1 start-gate checklist is missing)(?=[\\s\\S]*Finance Day-1 result ledger is missing)(?=[\\s\\S]*access-retain\\/revoke\\/block decision is missing)", "i"),
  "P0-09 Finance Day-1 result ledger owner signoff pack",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("Final owner Go\\/No-Go sign-off[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md[\\s\\S]*FIN-START-EVID-001 through FIN-START-EVID-005[\\s\\S]*FIN_START_READY \\/ NO_GO \\/ BLOCKED[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md[\\s\\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005[\\s\\S]*FIN_DAY1_RESULT_READY \\/ NO_GO \\/ BLOCKED[\\s\\S]*ACCESS_RETAIN \\/ REVOKE_OR_REDUCE \\/ BLOCKED", "i"),
  "production checklist P0-09 Finance Day-1 result ledger owner evidence",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  literalPattern("P0-09[\\s\\S]*Owner Go\\/No-Go sign-off pack[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md[\\s\\S]*FIN-START-EVID-001 through FIN-START-EVID-005[\\s\\S]*FIN_START_READY \\/ NO_GO \\/ BLOCKED[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md[\\s\\S]*FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005[\\s\\S]*FIN_DAY1_RESULT_READY \\/ NO_GO \\/ BLOCKED[\\s\\S]*ACCESS_RETAIN \\/ REVOKE_OR_REDUCE \\/ BLOCKED", "i"),
  "backlog P0-09 Finance Day-1 result ledger owner evidence",
);

requireText(
  "docs/HEU_CURRENT_STATE_INVENTORY.md",
  literalPattern("Controlled evidence[\\s\\S]*Finance Day-1 start-gate checklist[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md[\\s\\S]*FIN-START-EVID-001[\\s\\S]*FIN-START-EVID-005[\\s\\S]*P2-18\\/P5-03 real-accounting reliance proof with P0-17 access closure decision[\\s\\S]*Finance Day-1 result ledger and access retain\\/revoke\\/block decision[\\s\\S]*P0-09 owner sign-off\\/UAT handoff\\/final owner decision manifest proof", "i"),
  "current-state P0-14 Finance Day-1 result ledger evidence path",
);

requireText(
  "docs/TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628.md",
  literalPattern("(?=[\\s\\S]*UAT-ROUTE-08[\\s\\S]*P2-18\\/P5-03)(?=[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md)(?=[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md)(?=[\\s\\S]*Finance Day-1 start-gate checklist)(?=[\\s\\S]*Finance Day-1 start-gate checklist is missing)(?=[\\s\\S]*UAT-ROUTE-11[\\s\\S]*P0-09)(?=[\\s\\S]*Finance Day-1 start-gate checklist[\\s\\S]*Finance Day-1 result ledger[\\s\\S]*P0-17 access closure decision)", "i"),
  "signed UAT route table Finance Day-1 start-gate checklist handoff",
);

requireText(
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  literalPattern("(?=[\\s\\S]*UAT-HANDOFF-03A)(?=[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md)(?=[\\s\\S]*FIN-START-EVID-001)(?=[\\s\\S]*FIN-START-EVID-005)(?=[\\s\\S]*FIN_START_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*UAT-ROUTE-08 P2-18\\/P5-03 dashboard and Finance Desk browser UAT)(?=[\\s\\S]*Finance Day-1 start-gate checklist and result ledger are recorded)(?=[\\s\\S]*UAT-ROUTE-11 P0-09 final owner GO\\/NO-GO decision)(?=[\\s\\S]*Finance Day-1 start-gate checklist, Finance Day-1 result ledger, P0-17 access closure decision)", "i"),
  "operator handoff Finance Day-1 start-gate checklist route handoff",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  literalPattern("(?=[\\s\\S]*UAT-ROUTE-08 P2-18\\/P5-03 dashboard and Finance Desk browser UAT \\| PENDING \\| SIGNED_UAT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md)(?=[\\s\\S]*Finance Day-1 start-gate checklist, Finance Day-1 result ledger and reliance decision)(?=[\\s\\S]*UAT-ROUTE-11 P0-09 final owner GO\\/NO-GO decision \\| PENDING \\| SIGNED_UAT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Finance Day-1 start-gate checklist, Finance Day-1 result ledger, P0-17 access closure decision)", "i"),
  "execution log Finance Day-1 start-gate checklist route tracker",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-14 Finance Day-1 Start Gate Evidence Binder Link[\\s\\S]*data-p014-finance-day-one-start-gate-evidence=\"FIN-START-EVID\"[\\s\\S]*FIN-START-EVID-001[\\s\\S]*FIN-START-EVID-005[\\s\\S]*TTGDTX_UAT_OPERATOR_HANDOFF_20260627\\.md[\\s\\S]*TTGDTX_SIGNED_UAT_EXECUTION_ROUTING_HUB_20260628\\.md[\\s\\S]*HEU_CURRENT_STATE_INVENTORY\\.md[\\s\\S]*does not create accounts[\\s\\S]*mark production GO", "i"),
  "implementation log P0-14 Finance Day-1 start-gate binder link",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-09 Finance Day-1 Result Ledger Owner Signoff Link[\\s\\S]*HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630\\.md[\\s\\S]*FIN-DAY1-EVID-001[\\s\\S]*FIN-DAY1-EVID-005[\\s\\S]*FIN_DAY1_RESULT_READY \\/ NO_GO \\/ BLOCKED[\\s\\S]*ACCESS_RETAIN \\/ REVOKE_OR_REDUCE \\/ BLOCKED[\\s\\S]*data-p014-finance-day-one-result-ledger=\"FIN-DAY1-EVID\"[\\s\\S]*owner-signoff and evidence-binder packaging[\\s\\S]*does not create accounts[\\s\\S]*mark production GO", "i"),
  "implementation log P0-09 Finance Day-1 owner signoff link",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-09 Owner Signoff Finance Day-1 Start Gate Alignment[\\s\\S]*TTGDTX_PRODUCTION_OWNER_SIGNOFF_PACK_20260627\\.md[\\s\\S]*HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630\\.md[\\s\\S]*FIN-START-EVID-001[\\s\\S]*FIN-START-EVID-005[\\s\\S]*FIN_START_READY \\/ NO_GO \\/ BLOCKED[\\s\\S]*Finance Day-1 result ledger[\\s\\S]*ttgdtx-owner-go-no-go-evidence-checklist\\.tsx[\\s\\S]*audit-ttgdtx-production-owner-signoff-pack\\.mjs[\\s\\S]*audit-ttgdtx-release-gates\\.mjs[\\s\\S]*does not create accounts[\\s\\S]*approve owner GO\\/NO-GO[\\s\\S]*mark production GO", "i"),
  "implementation log P0-09 Finance Day-1 start-gate owner signoff link",
);

requireText(
  "components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-owner-go-no-go-acceptance-matrix=\"P0-09\")(?=[\\s\\S]*P0-09 owner GO\\/NO-GO acceptance matrix)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P0_09_ACCEPT \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P0-09-ACCEPT-01)(?=[\\s\\S]*P0-09-ACCEPT-06)(?=[\\s\\S]*Evidence pack completeness and redaction)(?=[\\s\\S]*Backup\\/restore and migration readiness)(?=[\\s\\S]*Finance, legal and UAT blockers closed)(?=[\\s\\S]*P3-01\\/P3-02 lifecycle and handover UAT)(?=[\\s\\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\\.md)(?=[\\s\\S]*P0-19\\/P2-05\\/P2-03 finance gates)(?=[\\s\\S]*P0-17 access closure decision)(?=[\\s\\S]*P0-17 access closure is missing)(?=[\\s\\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\\.md)(?=[\\s\\S]*Owner decision quorum and accountability)(?=[\\s\\S]*Production boundary and AI\\/Codex limitation)(?=[\\s\\S]*Final outcome stays NO-GO until every stop condition is closed)", "i"),
  "P0-09 owner GO/NO-GO acceptance matrix",
);

requireText(
  "components/ttgdtx/ttgdtx-owner-go-no-go-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-owner-go-no-go-decision-manifest=\"P0-09\")(?=[\\s\\S]*P0-09 final owner GO\\/NO-GO decision manifest)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P0_09_FINAL_GO \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P0-09-DEC-01)(?=[\\s\\S]*P0-09-DEC-06)(?=[\\s\\S]*Evidence pack and redaction decision)(?=[\\s\\S]*Backup\\/restore and migration authority decision)(?=[\\s\\S]*Legal, tuition and finance gate decision)(?=[\\s\\S]*UAT and operating proof decision)(?=[\\s\\S]*signed P3-01\\/P3-02 lifecycle and handover UAT)(?=[\\s\\S]*P3 handover bypass of P0-19\\/P2-05\\/P2-03)(?=[\\s\\S]*Role, audit and hard-delete proof decision)(?=[\\s\\S]*P0-17 access closure decision)(?=[\\s\\S]*missing P0-17 access closure decision)(?=[\\s\\S]*HEU_NON_TTGDTX_CASCADE_FINDING_REGISTER_20260628\\.md)(?=[\\s\\S]*Final multi-owner accountability decision)(?=[\\s\\S]*does not approve production, backup, restore, migration,\\s+legal waiver, finance action, UAT acceptance, payout,\\s+dashboard reliance or production GO)(?=[\\s\\S]*AI\\/Codex is named as approver, or PASS_LOCAL is treated\\s+as production GO)", "i"),
  "P0-09 final owner GO/NO-GO decision manifest",
);

requireText(
  "app/ttgdtx/page.tsx",
  literalPattern("TtgdtxProductionReadinessGuard[\\s\\S]*<TtgdtxProductionReadinessGuard \\/>", ""),
  "TTGDTX landing page mounts production readiness guard",
);

requireText(
  "app/ttgdtx/page.tsx",
  literalPattern("<TtgdtxProductionReadinessGuard\\s*\\/>[\\s\\S]*<TtgdtxUatSignoffGuard\\s*\\/>[\\s\\S]*<TtgdtxProductionExecutionQueue\\s*\\/>[\\s\\S]*<TtgdtxOwnerGoNoGoEvidenceChecklist\\s*\\/>[\\s\\S]*<TtgdtxOperatingControlStrip\\b", ""),
  "TTGDTX landing page mounts production execution queue",
);

requireText(
  "components/ttgdtx/ttgdtx-uat-signoff-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-uat-signoff-guard=\"INTERNAL_UAT\")(?=[\\s\\S]*Internal UAT sign-off)(?=[\\s\\S]*PASS_LOCAL)(?=[\\s\\S]*Production remains NO-GO until signed multi-account UAT evidence\\s+exists)(?=[\\s\\S]*PASS_LOCAL does not approve real pilot start, production\\s+migration, revenue recognition, payout, dashboard reliance or\\s+Go\\/No-Go)(?=[\\s\\S]*Do not paste real passwords, temporary passwords, password reset\\s+links, account activation\\/invite links, OTPs, service-role keys,\\s+student PII, CCCD, phone numbers, bank accounts or raw payment\\s+evidence)(?=[\\s\\S]*UAT_ADMIN)(?=[\\s\\S]*UAT_BGH)(?=[\\s\\S]*UAT_KHTC)(?=[\\s\\S]*UAT_TUYEN_SINH)(?=[\\s\\S]*UAT_PHAP_CHE)(?=[\\s\\S]*UAT_OUT_OF_SCOPE)(?=[\\s\\S]*TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP\\.md)(?=[\\s\\S]*TTGDTX_BROWSER_UAT_MATRIX_20260625\\.md)(?=[\\s\\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\\.md)(?=[\\s\\S]*signed multi-account UAT still required)(?=[\\s\\S]*PRODUCTION_GOVERNANCE_ASSURANCE_STEPS)(?=[\\s\\S]*data-ttgdtx-governance-uat-execution-readiness=\"P6-04_P6-03\")(?=[\\s\\S]*Governance UAT execution readiness: P6-04 \\+ P6-03)(?=[\\s\\S]*Run P6-04 role\\/workspace UAT first, then P6-03 audit-log\\s+traceability sampling)(?=[\\s\\S]*P6_04_SCOPE_UAT \\/ P6_03_TRACE_UAT)(?=[\\s\\S]*Runbook:[\\s\\S]*step\\.runbook)(?=[\\s\\S]*Guard:[\\s\\S]*step\\.auditCommand)(?=[\\s\\S]*Stop if evidence is unsigned, role scope leaks, audit trace is\\s+missing, redaction fails or the result is stored in\\s+Git\\/Codex\\/chat)(?=[\\s\\S]*data-ttgdtx-uat-run-closure-tracker=\"INTERNAL_UAT\")(?=[\\s\\S]*Internal UAT run closure tracker)(?=[\\s\\S]*UAT_PASS \\/ UAT_FAIL \\/ BLOCKED)(?=[\\s\\S]*UAT-CLOSE-01)(?=[\\s\\S]*UAT-CLOSE-06)(?=[\\s\\S]*Finance and dashboard negative tests pass)(?=[\\s\\S]*Owners sign UAT result)(?=[\\s\\S]*keeps production NO-GO)", "i"),
  "TTGDTX internal UAT sign-off guard",
);

requireText(
  "app/ttgdtx/page.tsx",
  literalPattern("<TtgdtxProductionReadinessGuard\\s*\\/>[\\s\\S]*<TtgdtxUatSignoffGuard\\s*\\/>[\\s\\S]*<TtgdtxOperatingControlStrip\\b", ""),
  "TTGDTX landing page mounts internal UAT sign-off guard",
);

requireAllText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  [
    "Internal UAT sign-off",
    "IN_PROGRESS",
    "TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
    "TTGDTX_UAT_EXECUTION_LOG_20260625.md",
    "governance UAT execution readiness for P6-04/P6-03",
    "internal UAT run closure tracker",
    "ttgdtx-uat-signoff-guard.tsx",
    "main execution queue with decision values and stop conditions",
    "P0-03/Step90-Step110 infra readiness plan",
    "P0-19/P3-01/P3-02 gate-handover readiness plan",
    "P6-04/P6-03 governance assurance plan",
    "P2-18/P5-03 UAT launch plan with P6-04 real-accounting queue/result proof, first signed finance UAT checklist",
    "finance Day-1 start-gate checklist",
    "FIN_START_READY / NO_GO / BLOCKED",
    "HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md",
    "finance Day-1 account activation handoff",
    "FIN_ACTIVATION_READY / NO_GO / BLOCKED",
    "HEU_FINANCE_DAY1_ACCOUNT_ACTIVATION_TEMPLATE_20260630.md",
    "finance Day-1 P6-04 pre-login matrix",
    "P6_04_PRELOGIN_READY / NO_GO / BLOCKED",
    "HEU_FINANCE_DAY1_P6_04_PRELOGIN_MATRIX_20260630.md",
    "finance Day-1 real-run rehearsal",
    "FIN_DAY1_READY / NO_GO / BLOCKED",
    "HEU_FINANCE_DAY1_REAL_RUN_REHEARSAL_20260630.md",
    "HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md",
    "P6-06/P2-17 risk closure plan",
    "audit:ttgdtx-production-readiness-guard",
    "signed multi-account UAT still required",
  ],
  "internal UAT readiness guard checklist row",
);

requireText(
  "docs/TTGDTX_UAT_OPERATOR_HANDOFF_20260627.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_HANDOFF)(?=[\\s\\S]*UAT-HANDOFF-01)(?=[\\s\\S]*UAT-HANDOFF-06)(?=[\\s\\S]*TTGDTX_SYNTHETIC_UAT_ACCOUNT_SETUP\\.md)(?=[\\s\\S]*TTGDTX_BROWSER_UAT_MATRIX_20260625\\.md)(?=[\\s\\S]*TTGDTX_UAT_EXECUTION_LOG_20260625\\.md)(?=[\\s\\S]*Any missing account, route result, negative-test result, redaction proof,\\s+reviewer or owner signature keeps production NO-GO)(?=[\\s\\S]*Even after UAT_PASS, production remains NO-GO)", "i"),
  "TTGDTX UAT operator handoff local-only boundary",
);

requireText(
  "docs/TTGDTX_UAT_EXECUTION_LOG_20260625.md",
  literalPattern("(?=[\\s\\S]*Internal UAT Run Closure Tracker)(?=[\\s\\S]*BLOCKED_PENDING_MULTI_ACCOUNT_UAT)(?=[\\s\\S]*UAT_PASS)(?=[\\s\\S]*UAT-CLOSE-01 Synthetic accounts prepared)(?=[\\s\\S]*UAT-CLOSE-06 Owners sign UAT result)(?=[\\s\\S]*Any missing account, route result, negative-test result, redaction proof or\\s+owner signature keeps production NO-GO)(?=[\\s\\S]*Governance UAT Execution Readiness)(?=[\\s\\S]*BLOCKED_PENDING_SIGNED_GOVERNANCE_UAT)(?=[\\s\\S]*P6-04 role\\/workspace UAT[\\s\\S]*PENDING[\\s\\S]*\\/settings\\/scopes)(?=[\\s\\S]*P6-03 audit-log traceability UAT[\\s\\S]*PENDING[\\s\\S]*\\/audit)(?=[\\s\\S]*PASS_LOCAL does not execute these UAT runs, accept evidence, grant access,\\s+approve finance action, waive audit traceability or mark production GO)", "i"),
  "internal UAT execution-log closure tracker",
);

requireText(
  "docs/TTGDTX_LINKED_OPERATING_REVIEW_20260625.md",
  literalPattern("Production\\s+remains\\s+NO-GO", "i"),
  "linked operating NO-GO boundary",
);

requireText(
  "docs/TTGDTX_GENERIC_SOURCE_EVIDENCE_AUDIT_20260626.md",
  literalPattern("P1-06 is PASS_LOCAL[\\s\\S]*app`, `components` and `lib` do not hard-code a reference center\\/source[\\s\\S]*does not approve production migration, real-data import, source-code\\s+renaming, production source metadata changes or production use", "i"),
  "P1-06 generic source evidence local-only boundary",
);

requireText(
  "docs/TTGDTX_OPERATING_CONTROL_MATRIX_20260625.md",
  literalPattern("Do not let AI approve", "i"),
  "operating matrix AI approval boundary",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("TTGDTX operating control matrix[\\s\\S]*PASS_LOCAL[\\s\\S]*audit:ttgdtx-operating-control-ui[\\s\\S]*signed UAT still required", "i"),
  "operating-control UI PASS_LOCAL checklist row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("Align TTGDTX linked operating spine[\\s\\S]*PASS_LOCAL[\\s\\S]*P2-01\\/P2-02\\/P2-05\\/P2-03\\/P2-10\\/P2-13\\/P2-14\\/P2-15\\/P2-16\\/P2-17\\/P2-18[\\s\\S]*signed UAT still required", "i"),
  "linked operating spine PASS_LOCAL checklist row",
);

requireText(
  "docs/TTGDTX_CONTRACT_TUITION_MASTER_GUARD_20260627.md",
  literalPattern("(?=[\\s\\S]*P2-01 and P2-02 are PASS_LOCAL)(?=[\\s\\S]*P2-01 contract is ACTIVE)(?=[\\s\\S]*P2-02 tuition policy is READY)(?=[\\s\\S]*P0-19 legal\\/tuition finance gate)(?=[\\s\\S]*P2-05 receivable gate passes)(?=[\\s\\S]*production approval)", "i"),
  "P2-01/P2-02 master guard local-only boundary",
);

requireText(
  "components/ttgdtx/ttgdtx-contract-tuition-master-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-contract-tuition-master-guard=\"P2-01-P2-02\")(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P2-01 contract must be ACTIVE)(?=[\\s\\S]*P2-02 tuition policy must be READY)(?=[\\s\\S]*P2-03 creates receivable only after)", "i"),
  "P2-01/P2-02 master guard display",
);

requireText(
  "app/ttgdtx/page.tsx",
  literalPattern("<TtgdtxOperatingControlStrip currentCode=\"P2-01\" \\/>[\\s\\S]*<TtgdtxContractTuitionMasterGuard \\/>", ""),
  "P2-01 page master guard mount",
);

requireText(
  "app/ttgdtx/tuition/page.tsx",
  literalPattern("<TtgdtxOperatingControlStrip currentCode=\"P2-02\" \\/>[\\s\\S]*<TtgdtxContractTuitionMasterGuard \\/>", ""),
  "P2-02 page master guard mount",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("P2-01 TTGDTX contract active[\\s\\S]*PASS_LOCAL[\\s\\S]*ttgdtx-contract-tuition-master-guard\\.tsx[\\s\\S]*audit:ttgdtx-contract-tuition-master-guard[\\s\\S]*signed legal\\/finance UAT still required", "i"),
  "P2-01 contract PASS_LOCAL checklist row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("P2-02 tuition policy ready[\\s\\S]*PASS_LOCAL[\\s\\S]*ttgdtx-contract-tuition-master-guard\\.tsx[\\s\\S]*audit:ttgdtx-contract-tuition-master-guard[\\s\\S]*signed KHTC\\/Phap Che UAT still required", "i"),
  "P2-02 tuition PASS_LOCAL checklist row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("P2-10\\)[\\s\\S]*PASS_LOCAL[\\s\\S]*invoice\\/chung-tu UAT evidence checklist[\\s\\S]*P2-10 invoice\\/chung-tu decision manifest[\\s\\S]*TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627\\.md[\\s\\S]*audit:ttgdtx-invoice-policy[\\s\\S]*signed KHTC\\/Phap Che|P2-10\\)[\\s\\S]*PASS_LOCAL[\\s\\S]*invoice\\/chung-tu UAT evidence checklist[\\s\\S]*P2-10 invoice\\/chung-tu decision manifest[\\s\\S]*TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627\\.md[\\s\\S]*audit:ttgdtx-invoice-policy[\\s\\S]*signed KHTC\\/Pháp chế", "i"),
  "P2-10 invoice policy PASS_LOCAL checklist row",
);

requireText(
  "components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx",
  literalPattern("data-ttgdtx-invoice-policy-matrix=\"P2-10\"[\\s\\S]*yes\\/no[\\s\\S]*PASS_LOCAL[\\s\\S]*PENDING_POLICY", "i"),
  "P2-10 invoice policy matrix local-only display",
);

requireText(
  "components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-invoice-evidence-checklist=\"P2-10\")(?=[\\s\\S]*P2-10 invoice\\/chung-tu UAT evidence checklist)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P2_10_INVOICE_ACCEPT \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*P2-10-INV-01)(?=[\\s\\S]*P2-10-INV-06)(?=[\\s\\S]*PENDING_POLICY chan doi soat va chi tiep)(?=[\\s\\S]*KHTC\\/Phap Che ky UAT truoc production)(?=[\\s\\S]*temporary password)(?=[\\s\\S]*password reset link)(?=[\\s\\S]*account activation\\/invite link)(?=[\\s\\S]*PASS_LOCAL is treated as invoice approval, legal\\/tax advice, UAT acceptance or production GO)", "i"),
  "P2-10 invoice/chung-tu UAT evidence checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-invoice-policy-matrix.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-invoice-decision-manifest=\"P2-10\")(?=[\\s\\S]*P2-10 invoice\\/chung-tu decision manifest)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P2_10_INVOICE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P2-10-DEC-01)(?=[\\s\\S]*P2-10-DEC-06)(?=[\\s\\S]*Collection model and payer decision)(?=[\\s\\S]*Required invoice\\/chung-tu issuance decision)(?=[\\s\\S]*Not-required or waiver basis decision)(?=[\\s\\S]*Pending policy downstream blocker decision)(?=[\\s\\S]*Evidence redaction and storage decision)(?=[\\s\\S]*Final KHTC\\/PHAP_CHE sign-off decision)(?=[\\s\\S]*PASS_LOCAL is treated as invoice approval)", "i"),
  "P2-10 invoice/chung-tu decision manifest",
);

requireText(
  "docs/TTGDTX_P2_10_INVOICE_POLICY_UAT_RUNBOOK_20260627.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_TEMPLATE)(?=[\\s\\S]*does not approve invoice issuance, tax\\/legal interpretation,\\s+finance posting, UAT acceptance or production GO)(?=[\\s\\S]*P2-10-INV-01)(?=[\\s\\S]*P2-10-INV-06)(?=[\\s\\S]*Downstream blocking check)(?=[\\s\\S]*Final KHTC\\/PHAP_CHE UAT sign-off)(?=[\\s\\S]*passwords, temporary passwords, OTPs, password reset links,\\s+account activation\\/invite links, service-role keys)(?=[\\s\\S]*P2-10 Invoice\\/Chung-Tu Decision Manifest)(?=[\\s\\S]*P2_10_INVOICE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P2-10-DEC-01)(?=[\\s\\S]*P2-10-DEC-06)(?=[\\s\\S]*P2-10 invoice\\/chung-tu policy remains production NO-GO)", "i"),
  "P2-10 invoice/chung-tu UAT runbook",
);

requireText(
  "lib/ttgdtx-invoice-policy.ts",
  literalPattern("HEU_COLLECTS_STUDENT[\\s\\S]*CENTER_COLLECTS_STUDENT[\\s\\S]*SPLIT_COLLECTION[\\s\\S]*OFFSET_OR_ADJUSTMENT[\\s\\S]*OTHER_COLLECTION_MODEL", "i"),
  "P2-10 invoice policy case coverage",
);

requireText(
  "components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx",
  literalPattern("data-ttgdtx-payment-dossier-checklist=\\{currentStep\\}[\\s\\S]*Checklist hồ sơ thanh toán|data-ttgdtx-payment-dossier-checklist=\\{currentStep\\}[\\s\\S]*Checklist ho so thanh toan", "i"),
  "P2-15/P2-17 payment dossier checklist display",
);

requireText(
  "components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-payment-dossier-acceptance-matrix=\\{currentStep\\})(?=[\\s\\S]*payment dossier acceptance matrix)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*PAYMENT_DOSSIER_ACCEPT \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*P2-DOSSIER-ACCEPT-01)(?=[\\s\\S]*P2-DOSSIER-ACCEPT-06)(?=[\\s\\S]*Locked reconciliation period accepted)(?=[\\s\\S]*BBNT accepted-period proof complete)(?=[\\s\\S]*Partner invoice or waiver controlled)(?=[\\s\\S]*Payment amount basis reconciles)(?=[\\s\\S]*P2-19 source-control checks pass)(?=[\\s\\S]*Signed UAT and production boundary)", "i"),
  "P2-15/P2-17 payment dossier acceptance matrix",
);

requireText(
  "components/ttgdtx/ttgdtx-payment-dossier-checklist.tsx",
  literalPattern("BBNT[\\s\\S]*Partner invoice evidence[\\s\\S]*duplicate payout", "i"),
  "P2-15/P2-17 payment dossier gate metadata",
);

requireText(
  "components/ttgdtx/ttgdtx-payment-approval-separation-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-payment-approval-separation-guard=\"P2-16\")(?=[\\s\\S]*Guard tách kiểm tra\\/duyệt P2-16)(?=[\\s\\S]*P2-16-SEP-01)(?=[\\s\\S]*P2-16-SEP-06)(?=[\\s\\S]*Maker không tự duyệt)(?=[\\s\\S]*CHECK tr(?:uoc|ước) APPROVE)(?=[\\s\\S]*Hồ sơ trước lệnh chi)(?=[\\s\\S]*Duyệt không phải chi tiền)(?=[\\s\\S]*Return\\/reject bắt buộc lý do)(?=[\\s\\S]*Bằng chứng đã redact)(?=[\\s\\S]*data-ttgdtx-payment-approval-decision-boundary=\"P2-16\")(?=[\\s\\S]*P2_16_APPROVAL_SEPARATED \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*does not initiate payout or approve production use)", "i"),
  "P2-16 payment approval separation guard",
);

requireText(
  "app/ttgdtx/payment-requests/page.tsx",
  literalPattern("TtgdtxPaymentDossierChecklist[\\s\\S]*currentStep=\"P2-15\"", ""),
  "P2-15 payment dossier checklist mount",
);

requireText(
  "app/ttgdtx/payment-requests/review/page.tsx",
  literalPattern("(?=[\\s\\S]*TtgdtxPaymentApprovalSeparationGuard)(?=[\\s\\S]*currentCode=\"P2-16\")", "i"),
  "P2-16 approval separation guard mount",
);

requireText(
  "app/ttgdtx/payment-requests/pay/page.tsx",
  literalPattern("TtgdtxPaymentDossierChecklist[\\s\\S]*currentStep=\"P2-17\"", ""),
  "P2-17 payment dossier checklist mount",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("BBNT evidence gate before partner payment[\\s\\S]*PASS_LOCAL[\\s\\S]*payment dossier acceptance matrix[\\s\\S]*audit:ttgdtx-payment-dossier-checklist[\\s\\S]*signed UAT", "i"),
  "payment dossier checklist PASS_LOCAL checklist row",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("P2-16 check\\/approve payment request[\\s\\S]*PASS_LOCAL[\\s\\S]*ttgdtx-payment-approval-separation-guard\\.tsx[\\s\\S]*P2-16-SEP-01[\\s\\S]*P2-16-SEP-06[\\s\\S]*P2_16_APPROVAL_SEPARATED \\/ NO_GO \\/ BLOCKED[\\s\\S]*signed payout UAT[\\s\\S]*one person creating, checking and approving without written owner exception", "i"),
  "P2-16 approval separation checklist row",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P2-16 Payment Approval Separation Guard[\\s\\S]*ttgdtx-payment-approval-separation-guard\\.tsx[\\s\\S]*P2-16-SEP-01[\\s\\S]*P2-16-SEP-06[\\s\\S]*audit-ttgdtx-payment-dossier-checklist\\.mjs[\\s\\S]*does not self-approve payment requests[\\s\\S]*initiate bank transfer[\\s\\S]*mark production GO", "i"),
  "P2-16 approval separation implementation log",
);

requireText(
  "components/ttgdtx/ttgdtx-payout-duplicate-guard.tsx",
  literalPattern("data-ttgdtx-payout-duplicate-guard=\"P2-17\"[\\s\\S]*nút pending[\\s\\S]*RPC[\\s\\S]*khóa dòng[\\s\\S]*voucher guard[\\s\\S]*P2-19", "i"),
  "P2-17 payout duplicate guard display",
);

requireText(
  "components/ttgdtx/ttgdtx-payout-execution-readiness-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-payout-execution-readiness-checklist=\"P2-17\")(?=[\\s\\S]*P2-17 payout execution readiness checklist)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*data-ttgdtx-payout-immediate-stop=\"P2-17\")(?=[\\s\\S]*P2-17 immediate payout stop conditions)(?=[\\s\\S]*P2_17_STOP_CHECK \\/ RECORD_READY \\/ BLOCKED)(?=[\\s\\S]*Request not approved or cannot pay)(?=[\\s\\S]*Amount, voucher, evidence or dossier fails)(?=[\\s\\S]*Bank-transfer boundary is unclear)(?=[\\s\\S]*P2-17-EXEC-01)(?=[\\s\\S]*P2-17-EXEC-08)(?=[\\s\\S]*Approved request identity)(?=[\\s\\S]*Remaining amount control)(?=[\\s\\S]*Voucher uniqueness)(?=[\\s\\S]*Evidence URL required)(?=[\\s\\S]*temporary passwords)(?=[\\s\\S]*password reset links)(?=[\\s\\S]*account activation\\/invite links)(?=[\\s\\S]*P2-19 dossier blockers)(?=[\\s\\S]*RPC-only write path)(?=[\\s\\S]*Double-submit guard)(?=[\\s\\S]*Audit trace and status)(?=[\\s\\S]*does not initiate a\\s+bank transfer)", "i"),
  "P2-17 payout execution readiness checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-payout-execution-readiness-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-payout-release-decision-manifest=\"P2-17\")(?=[\\s\\S]*P2-17 payout release decision manifest)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P2-17-REL-01)(?=[\\s\\S]*P2-17-REL-06)(?=[\\s\\S]*P2_17_RELEASE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*does not\\s+initiate a bank transfer, approve finance action, accept UAT or\\s+mark production GO)", "i"),
  "P2-17 payout release decision manifest",
);

requireText(
  "components/ttgdtx/ttgdtx-payout-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-payout-uat-evidence-checklist=\"P2-17\")(?=[\\s\\S]*P2-17 payout UAT evidence checklist)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*Signed payout UAT is still required before P2-17 can move from\\s+IN_PROGRESS)(?=[\\s\\S]*temporary passwords)(?=[\\s\\S]*password reset links)(?=[\\s\\S]*account activation\\/invite links)(?=[\\s\\S]*service-role keys)(?=[\\s\\S]*P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK\\.md)(?=[\\s\\S]*P2-17-01\\/P2-17-02)(?=[\\s\\S]*P2-17-09\\/P2-17-10\\/P2-17-11)(?=[\\s\\S]*KHTC, PHAP_CHE, BGH and Audit must sign the evidence outside\\s+Codex\\/chat)", "i"),
  "P2-17 payout UAT evidence checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-payout-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-payout-acceptance-matrix=\"P2-17\")(?=[\\s\\S]*P2-17 payout acceptance matrix)(?=[\\s\\S]*P2_17_ACCEPT \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*P2-17-ACCEPT-01)(?=[\\s\\S]*P2-17-ACCEPT-06)(?=[\\s\\S]*Single write path and double-submit control)(?=[\\s\\S]*P2-19 dossier blockers)(?=[\\s\\S]*Owner sign-off and production boundary)", "i"),
  "P2-17 payout acceptance matrix",
);

requireText(
  "app/ttgdtx/payment-requests/pay/page.tsx",
  literalPattern("TtgdtxPayoutDuplicateGuard[\\s\\S]*<TtgdtxPayoutDuplicateGuard \\/>", ""),
  "P2-17 payout duplicate guard mount",
);

requireText(
  "app/ttgdtx/payment-requests/pay/page.tsx",
  literalPattern("<TtgdtxPayoutDuplicateGuard\\s*\\/>[\\s\\S]*<TtgdtxPayoutExecutionReadinessChecklist\\s*\\/>[\\s\\S]*<TtgdtxPayoutUatEvidenceChecklist\\s*\\/>", ""),
  "P2-17 payout execution readiness and UAT evidence checklist mount",
);

requireText(
  "app/ttgdtx/payment-requests/pay/page.tsx",
  literalPattern("name=\"payout_boundary_ack\"[\\s\\S]*required[\\s\\S]*type=\"checkbox\"[\\s\\S]*value=\"on\"[\\s\\S]*P2-17 chi ghi nhan chung tu da chi[\\s\\S]*khong tao lenh chuyen khoan", "i"),
  "P2-17 payout boundary acknowledgment checkbox",
);

requireText(
  "app/ttgdtx/payment-requests/pay/actions.ts",
  literalPattern("const payoutBoundaryAck = textValue\\(formData, \"payout_boundary_ack\"\\)[\\s\\S]*payoutBoundaryAck !== \"on\"[\\s\\S]*record_ttgdtx_partner_payment_disbursement", "i"),
  "P2-17 server action boundary acknowledgment before RPC",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("(?=[\\s\\S]*P2-17 execute payout once)(?=[\\s\\S]*IN_PROGRESS)(?=[\\s\\S]*ttgdtx-payout-duplicate-guard\\.tsx)(?=[\\s\\S]*ttgdtx-payout-execution-readiness-checklist\\.tsx)(?=[\\s\\S]*ttgdtx-payout-uat-evidence-checklist\\.tsx)(?=[\\s\\S]*payout acceptance matrix)(?=[\\s\\S]*payout release decision manifest)(?=[\\s\\S]*mandatory payout boundary acknowledgment)(?=[\\s\\S]*audit:ttgdtx-payout-duplicate-guard)(?=[\\s\\S]*audit:ttgdtx-payout-execution-readiness)(?=[\\s\\S]*signed UAT)", "i"),
  "P2-17 duplicate guard checklist row",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P2-17 Payout Boundary Acknowledgment[\\s\\S]*payout_boundary_ack[\\s\\S]*record_ttgdtx_partner_payment_disbursement[\\s\\S]*audit-ttgdtx-payout-execution-readiness\\.mjs[\\s\\S]*does not execute payout UAT[\\s\\S]*initiate bank transfer[\\s\\S]*mark production GO", "i"),
  "P2-17 payout boundary acknowledgment implementation log",
);

requireText(
  "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
  literalPattern("(?=[\\s\\S]*Payout Acceptance Matrix)(?=[\\s\\S]*P2-17-ACCEPT-01)(?=[\\s\\S]*P2-17-ACCEPT-06)(?=[\\s\\S]*P2_17_ACCEPT \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*P2-17-ACCEPT-01 through P2-17-ACCEPT-06 all pass with redacted evidence)", "i"),
  "P2-17 runbook payout acceptance matrix",
);

requireText(
  "docs/P2_17_DUPLICATE_PAYOUT_UAT_RUNBOOK.md",
  literalPattern("(?=[\\s\\S]*Payout Release Decision Manifest)(?=[\\s\\S]*data-ttgdtx-payout-release-decision-manifest=\"P2-17\")(?=[\\s\\S]*P2-17-REL-01)(?=[\\s\\S]*P2-17-REL-06)(?=[\\s\\S]*P2_17_RELEASE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*unclear bank-transfer boundary keeps\\s+P2-17 NO-GO)", "i"),
  "P2-17 runbook payout release decision manifest",
);

requireText(
  "components/ttgdtx/ttgdtx-p019-gate-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-p019-gate-guard=\"P0-19\")(?=[\\s\\S]*(Legal basis|Căn cứ pháp lý))(?=[\\s\\S]*(Tuition policy|Chính sách học phí))(?=[\\s\\S]*(Finance gate|Cửa kiểm soát tài chính))(?=[\\s\\S]*ALLOW_FINANCE)(?=[\\s\\S]*công nợ phải thu)", "i"),
  "P0-19 legal tuition finance guard display",
);

requireText(
  "app/ttgdtx/gate/page.tsx",
  literalPattern("<TtgdtxP019GateGuard\\s*\\/>[\\s\\S]*<TtgdtxP019UatEvidenceChecklist\\s*\\/>", ""),
  "P2-05 gate page mounts P0-19 guard and UAT evidence checklist",
);

requireText(
  "app/ttgdtx/receivables/page.tsx",
  literalPattern("<TtgdtxP019GateGuard\\s*\\/>[\\s\\S]*<TtgdtxP019UatEvidenceChecklist\\s*\\/>", ""),
  "P2-03 receivables page mounts P0-19 guard and UAT evidence checklist",
);

requireText(
  "components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-p019-uat-evidence-checklist=\"P0-19\")(?=[\\s\\S]*P0-19 legal\\/finance UAT evidence checklist)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*Signed legal\\/finance UAT is still required before P0-19 can move\\s+from IN_PROGRESS)(?=[\\s\\S]*P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK\\.md)(?=[\\s\\S]*P0-19-01)(?=[\\s\\S]*P0-19-07)(?=[\\s\\S]*private contract bodies, raw student PII, CCCD, bank data,\\s+passwords, temporary passwords, OTPs, password reset links,\\s+account activation\\/invite links, service-role keys and production\\s+credentials)(?=[\\s\\S]*PHAP_CHE, KHTC, BGH and\\s+Audit must sign the evidence outside Codex\\/chat)", "i"),
  "P0-19 legal/finance UAT evidence checklist",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P0-19 Legal Finance Immediate Stop Guard[\\s\\S]*data-ttgdtx-p019-immediate-stop=\"P0-19\"[\\s\\S]*ttgdtx-p019-uat-evidence-checklist\\.tsx[\\s\\S]*legal scope[\\s\\S]*program\\/major[\\s\\S]*tuition amount[\\s\\S]*invoice\\/chung-tu[\\s\\S]*P2-05\\/P2-03 can create a[\\s\\S]*sandbox data[\\s\\S]*Step100[\\s\\S]*oral, ownerless[\\s\\S]*signed legal\\/finance UAT[\\s\\S]*controlled redacted evidence[\\s\\S]*audit:ttgdtx-p019-gate-guard[\\s\\S]*audit:heu-current-state-inventory[\\s\\S]*audit:ttgdtx-release-gates[\\s\\S]*does not execute UAT[\\s\\S]*mark production GO", "i"),
  "P0-19 immediate stop guard log entry",
);

requireText(
  "components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-p019-immediate-stop=\"P0-19\")(?=[\\s\\S]*P0-19 legal\\/finance immediate stop guard: PASS_LOCAL only)(?=[\\s\\S]*P0-19-STOP-01)(?=[\\s\\S]*P0-19-STOP-05)(?=[\\s\\S]*P0_19_STOP_CHECK \\/ GO_NEXT \\/ BLOCKED)(?=[\\s\\S]*Legal scope, center, program\\/major, effective period or approving owner is unclear)(?=[\\s\\S]*Tuition amount, term, due rule, payer model, invoice\\/chung-tu responsibility or waiver basis is unresolved)(?=[\\s\\S]*P2-05 or P2-03 can create receivable while P0-19 is missing)(?=[\\s\\S]*Step100 or any legal\\/tuition\\/finance exception is oral, ownerless, expired, broad or treated as production authority)(?=[\\s\\S]*Signed legal\\/finance UAT or owner sign-off is missing)(?=[\\s\\S]*private contracts, raw PII, CCCD, bank data, credentials, passwords, temporary passwords, OTPs, password reset links, account activation\\/invite links, vouchers or payment data)", "i"),
  "P0-19 immediate stop guard",
);

requireText(
  "components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-p019-waiver-exception-register=\"P0-19\")(?=[\\s\\S]*P0-19 waiver\\/exception register)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P0-19-WAIVE-01)(?=[\\s\\S]*P0-19-WAIVE-04)(?=[\\s\\S]*Step100 sandbox pilot open)(?=[\\s\\S]*Legal basis exception)(?=[\\s\\S]*Tuition\\/invoice policy exception)(?=[\\s\\S]*Finance gate override request)(?=[\\s\\S]*P0_19_WAIVER_ACCEPT \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*PASS_LOCAL does not approve a legal waiver, tuition exception, finance\\s+override, Step100 production use, receivable creation, revenue\\s+recognition or production GO)", "i"),
  "P0-19 waiver/exception register",
);

requireText(
  "components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-p019-acceptance-matrix=\"P0-19\")(?=[\\s\\S]*P0-19 legal\\/finance acceptance matrix)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*legal\\s+authority)(?=[\\s\\S]*tuition policy)(?=[\\s\\S]*finance gate status)(?=[\\s\\S]*Step100 sandbox\\s+boundary)(?=[\\s\\S]*blocked\\/allowed receivable path)(?=[\\s\\S]*owner sign-off)(?=[\\s\\S]*P0-19-ACCEPT-01)(?=[\\s\\S]*P0-19-ACCEPT-06)(?=[\\s\\S]*P0_19_ACCEPT \\/ FAIL \\/ BLOCKED)(?=[\\s\\S]*Missing owner signature keeps production NO-GO)", "i"),
  "P0-19 legal/finance acceptance matrix",
);

requireText(
  "components/ttgdtx/ttgdtx-p019-uat-evidence-checklist.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-p019-gate-decision-manifest=\"P0-19\")(?=[\\s\\S]*P0-19 legal\\/finance gate decision manifest)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*P0-19-DEC-01)(?=[\\s\\S]*P0-19-DEC-06)(?=[\\s\\S]*Legal authority accepted)(?=[\\s\\S]*Tuition and invoice policy aligned)(?=[\\s\\S]*Finance gate blocks then allows)(?=[\\s\\S]*Step100 and exceptions controlled)(?=[\\s\\S]*Redacted evidence and owner signatures complete)(?=[\\s\\S]*Human gate decision recorded)(?=[\\s\\S]*P0_19_GATE_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*Missing gate decision ID, unsigned owner evidence, unresolved\\s+invoice\\/chung-tu basis, uncontrolled exception or raw sensitive\\s+evidence keeps P0-19 NO-GO)", "i"),
  "P0-19 legal/finance gate decision manifest",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("(?=[\\s\\S]*P0-19 legal\\/finance gate ready)(?=[\\s\\S]*IN_PROGRESS)(?=[\\s\\S]*ttgdtx-p019-gate-guard\\.tsx)(?=[\\s\\S]*ttgdtx-p019-uat-evidence-checklist\\.tsx)(?=[\\s\\S]*P0-19 immediate stop guard)(?=[\\s\\S]*P0-19 waiver\\/exception register)(?=[\\s\\S]*P0-19 acceptance matrix)(?=[\\s\\S]*P0-19 gate decision manifest)(?=[\\s\\S]*audit:ttgdtx-p019-gate-guard)(?=[\\s\\S]*signed legal\\/finance UAT still required)", "i"),
  "P0-19 guard checklist row",
);

requireText(
  "components/ttgdtx/ttgdtx-operating-control-strip.tsx",
  literalPattern("data-ttgdtx-operating-control=\\{current\\.code\\}[\\s\\S]*Owner:[\\s\\S]*Điều kiện trước khi đi tiếp[\\s\\S]*Nếu thiếu điều kiện, bước này phải chặn", "i"),
  "operating-control strip owner and blocker display",
);

requireText(
  "lib/ttgdtx-operating-controls.ts",
  literalPattern("code: \"P2-01\"[\\s\\S]*code: \"P2-02\"[\\s\\S]*code: \"P2-05\"[\\s\\S]*code: \"P2-03\"[\\s\\S]*code: \"P2-10\"[\\s\\S]*code: \"P2-13\"[\\s\\S]*code: \"P2-14\"[\\s\\S]*code: \"P2-15\"[\\s\\S]*code: \"P2-16\"[\\s\\S]*code: \"P2-17\"[\\s\\S]*code: \"P2-18\"", ""),
  "core TTGDTX operating spine order",
);

requireText(
  "docs/TTGDTX_PROCESS_CODE_MAP_20260625.md",
  literalPattern("(?=[\\s\\S]*business name first)(?=[\\s\\S]*Thu tien co xuat hoa don khong)(?=[\\s\\S]*\\/search)(?=[\\s\\S]*local TTGDTX process-label map)(?=[\\s\\S]*HEU Finance Desk)(?=[\\s\\S]*P5-03)(?=[\\s\\S]*TTGDTX\\s+quick\\s+finder)", "i"),
  "business-name-first process label rule",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("User-friendly TTGDTX process labels[\\s\\S]*PASS_LOCAL[\\s\\S]*audit:ttgdtx-process-labels", "i"),
  "TTGDTX process labels PASS_LOCAL checklist row",
);

requireText(
  "lib/ttgdtx-process-labels.ts",
  literalPattern("code: \"P2-10\"[\\s\\S]*label: \"Thu học phí \\(P2-10\\)\"[\\s\\S]*thu tien co hoa don khong[\\s\\S]*thu tien co xuat hoa don khong[\\s\\S]*xuat hoa don[\\s\\S]*co can hoa don", "i"),
  "P2-10 business-first process label",
);

requireText(
  "lib/ttgdtx-process-labels.ts",
  literalPattern("(?=[\\s\\S]*normalizeTtgdtxProcessSearchText)(?=[\\s\\S]*matchesTtgdtxProcessQuery)(?=[\\s\\S]*normalize\\(\"NFD\"\\))(?=[\\s\\S]*\\\\u0111)(?=[\\s\\S]*normalizedQuery\\.includes\\(normalizedValue\\))", "i"),
  "P2-10 accent-insensitive process query matcher",
);

requireText(
  "app/search/page.tsx",
  literalPattern("matchesTtgdtxProcessQuery[\\s\\S]*buildTtgdtxProcessResults[\\s\\S]*mergeSearchResults[\\s\\S]*processResults[\\s\\S]*loadError = null", "i"),
  "local TTGDTX process search fallback",
);

requireText(
  "lib/ttgdtx-process-labels.ts",
  literalPattern("code: \"P5-03\"[\\s\\S]*businessName: \"HEU Finance Desk\"[\\s\\S]*label: \"HEU Finance Desk \\(P5-03\\)\"[\\s\\S]*href: \"\\/finance-desk\"[\\s\\S]*dashboard tai chinh", "i"),
  "P5-03 Finance Desk process label",
);

requireText(
  "components/ttgdtx/ttgdtx-process-quick-finder.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-process-quick-finder=\"TTGDTX_9PLUS\")(?=[\\s\\S]*TTGDTX_PROCESS_LABELS)(?=[\\s\\S]*featuredProcessCodes)(?=[\\s\\S]*\"P2-10\")(?=[\\s\\S]*\"P5-03\")(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*production GO)", "i"),
  "TTGDTX process quick finder local-only display",
);

requireText(
  "components/ttgdtx/ttgdtx-process-quick-finder.tsx",
  literalPattern("action=\"\\/search\"[\\s\\S]*name=\"q\"[\\s\\S]*placeholder=\"Finance Desk, xuat hoa don, P2-10\"", "i"),
  "TTGDTX quick finder invoice-search placeholder",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("Finance Desk Process Finder Link[\\s\\S]*HEU Finance Desk \\(P5-03\\)[\\s\\S]*TTGDTX process-label map[\\s\\S]*\\/finance-desk[\\s\\S]*This is navigation\\/discovery packaging only[\\s\\S]*does not grant production\\s+access, execute UAT, approve finance action, run production migration, accept\\s+evidence or mark production GO", "i"),
  "Finance Desk process finder log entry",
);

requireText(
  "app/ttgdtx/page.tsx",
  literalPattern("TtgdtxProcessQuickFinder[\\s\\S]*<TtgdtxProcessQuickFinder \\/>[\\s\\S]*<TtgdtxOperatingControlStrip currentCode=\"P2-01\" \\/>", ""),
  "TTGDTX landing page mounts process quick finder",
);

requireText(
  "docs/HEU_CODEX_OPERATING_PLAYBOOK.md",
  literalPattern("Khong gui mat khau, OTP, API key", "i"),
  "Codex no-secret operating rule",
);

requireText(
  "docs/P0_19_P2_01_P2_02_PILOT_OPEN_UAT_RUNBOOK.md",
  literalPattern("Step100 is sandbox\\/UAT only", "i"),
  "Step100 sandbox-only boundary",
);

requireText(
  "docs/P2_13_RECONCILIATION_REPAIR_SAFETY_UAT_RUNBOOK.md",
  literalPattern("Step102 and Step103 are retired", "i"),
  "Step102/Step103 retired boundary",
);

requireText(
  "docs/TTGDTX_LEAD_QUICK_FIX_UAT_RUNBOOK.md",
  literalPattern("quick-fix cannot self-promote", "i"),
  "TTGDTX lead quick-fix self-promotion boundary",
);

requireText(
  "docs/TTGDTX_RECEIVABLE_PAYMENT_STATUS_LIFECYCLE_POLICY_20260627.md",
  literalPattern("P4-01 is PASS_LOCAL[\\s\\S]*does not approve\\s+production migration, production finance operation, real-data import, revenue\\s+recognition or payout execution[\\s\\S]*Signed finance UAT must still prove", "i"),
  "P4-01 receivable/payment lifecycle local-only boundary",
);

requireText(
  "components/ttgdtx/ttgdtx-reconciliation-exception-gate.tsx",
  literalPattern("(?=[\\s\\S]*data-ttgdtx-reconciliation-exception-gate=\"P2-13_P2-14\")(?=[\\s\\S]*Gate ngoại lệ đối soát P2-13\\/P2-14)(?=[\\s\\S]*REC-GATE-01)(?=[\\s\\S]*REC-GATE-02)(?=[\\s\\S]*REC-GATE-03)(?=[\\s\\S]*REC-GATE-04)(?=[\\s\\S]*POSTED)(?=[\\s\\S]*invoice_control_status)(?=[\\s\\S]*LOCKED)(?=[\\s\\S]*P0-14\\/P6-03)(?=[\\s\\S]*PASS_LOCAL only)(?=[\\s\\S]*Signed finance UAT)(?=[\\s\\S]*payout reliance)", "i"),
  "P2-13/P2-14 reconciliation exception gate",
);

requireText(
  "app/ttgdtx/reconciliation/page.tsx",
  literalPattern("(?=[\\s\\S]*TtgdtxReconciliationExceptionGate)(?=[\\s\\S]*currentCode=\"P2-13\")", "i"),
  "P2-13 reconciliation exception gate mount",
);

requireText(
  "app/ttgdtx/reconciliation/review/page.tsx",
  literalPattern("(?=[\\s\\S]*TtgdtxReconciliationExceptionGate)(?=[\\s\\S]*currentCode=\"P2-14\")", "i"),
  "P2-14 reconciliation exception gate mount",
);

requireText(
  "docs/HEU_IMPLEMENTATION_LOG.md",
  literalPattern("P2-13 P2-14 Reconciliation Exception Gate[\\s\\S]*ttgdtx-reconciliation-exception-gate\\.tsx[\\s\\S]*REC-GATE-01[\\s\\S]*REC-GATE-04[\\s\\S]*audit-ttgdtx-receivable-payment-lifecycle\\.mjs[\\s\\S]*does not create receivables[\\s\\S]*execute payout[\\s\\S]*mark production GO", "i"),
  "P2-13/P2-14 reconciliation exception gate implementation log",
);

requireText(
  "docs/HEU_LEAD_LIFECYCLE_STANDARD_20260627.md",
  literalPattern("(?=[\\s\\S]*P3-01 is PASS_LOCAL)(?=[\\s\\S]*No raw form dump into AI)(?=[\\s\\S]*P3-02 prepares lead-to-student handover)(?=[\\s\\S]*P2-05 remains the receivable gate)(?=[\\s\\S]*P2-03 remains the final student receivable creation control)", "i"),
  "P3-01 lead lifecycle PASS_LOCAL and finance-gate boundary",
);

requireText(
  "components/leads/lead-lifecycle-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-lead-lifecycle-acceptance-matrix=\"P3-01\")(?=[\\s\\S]*P3-01 lead lifecycle acceptance matrix)(?=[\\s\\S]*P3-01-ACCEPT-01)(?=[\\s\\S]*P3-01-ACCEPT-06)(?=[\\s\\S]*P3_01_ACCEPT \\/ FAIL \\/ BLOCKED)", "i"),
  "P3-01 lead lifecycle acceptance matrix",
);

requireText(
  "docs/HEU_LEAD_LIFECYCLE_STANDARD_20260627.md",
  literalPattern("(?=[\\s\\S]*P3-01 Acceptance Matrix)(?=[\\s\\S]*data-heu-lead-lifecycle-acceptance-matrix=\"P3-01\")(?=[\\s\\S]*P3-01-ACCEPT-01)(?=[\\s\\S]*P3-01-ACCEPT-06)(?=[\\s\\S]*P3_01_ACCEPT \\/ FAIL \\/ BLOCKED)", "i"),
  "P3-01 lifecycle acceptance matrix doc",
);

requireText(
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  literalPattern("(?=[\\s\\S]*P3-02 is PASS_LOCAL)(?=[\\s\\S]*P2-05 remains the receivable gate)(?=[\\s\\S]*P2-03 remains the final\\s+student receivable creation control)", "i"),
  "P3-02 handover PASS_LOCAL and finance-gate boundary",
);

requireText(
  "components/leads/lead-handover-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-lead-handover-acceptance-matrix=\"P3-02\")(?=[\\s\\S]*P3-02 lead-to-student handover acceptance matrix)(?=[\\s\\S]*P3-02-ACCEPT-01)(?=[\\s\\S]*P3-02-ACCEPT-06)(?=[\\s\\S]*P3_02_ACCEPT \\/ FAIL \\/ BLOCKED)", "i"),
  "P3-02 handover acceptance matrix",
);

requireText(
  "components/leads/lead-handover-panel.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-lead-handover-decision-manifest=\"P3-02\")(?=[\\s\\S]*P3-02 handover decision manifest)(?=[\\s\\S]*P3-02-DEC-01)(?=[\\s\\S]*P3-02-DEC-06)(?=[\\s\\S]*P3_02_HANDOVER_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*does not approve enrollment,\\s+receivable creation, tuition collection, invoice issuance,\\s+revenue recognition, finance posting, UAT acceptance, owner\\s+waiver or production GO)", "i"),
  "P3-02 handover decision manifest",
);

requireText(
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  literalPattern("(?=[\\s\\S]*P3-02 Acceptance Matrix)(?=[\\s\\S]*data-heu-lead-handover-acceptance-matrix=\"P3-02\")(?=[\\s\\S]*P3-02-ACCEPT-01)(?=[\\s\\S]*P3-02-ACCEPT-06)(?=[\\s\\S]*P3_02_ACCEPT \\/ FAIL \\/ BLOCKED)", "i"),
  "P3-02 handover acceptance matrix doc",
);

requireText(
  "docs/HEU_LEAD_TO_STUDENT_HANDOVER_POLICY_20260627.md",
  literalPattern("(?=[\\s\\S]*P3-02 Handover Decision Manifest)(?=[\\s\\S]*data-heu-lead-handover-decision-manifest=\"P3-02\")(?=[\\s\\S]*P3-02-DEC-01)(?=[\\s\\S]*P3-02-DEC-06)(?=[\\s\\S]*P3_02_HANDOVER_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*P3-02-ACCEPT-01 through P3-02-ACCEPT-06 and P3-02-DEC-01 through\\s+P3-02-DEC-06)", "i"),
  "P3-02 handover decision manifest doc",
);

requireText(
  "components/leads/lead-lifecycle-guard.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-lead-lifecycle-handover-uat-pack=\"P3-01-P3-02\")(?=[\\s\\S]*P3-01\\/P3-02 UAT execution pack:\\s*PASS_LOCAL only)(?=[\\s\\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\\.md)(?=[\\s\\S]*P3-UAT-01)(?=[\\s\\S]*P3-UAT-08)(?=[\\s\\S]*Tuyen Sinh, CTHSSV, Dao Tao, KHTC, IT_DATA and Audit)(?=[\\s\\S]*PASS_LOCAL does not accept UAT, approve handover reliance, create\\s+finance facts, waive evidence, approve owner sign-off or mark\\s+production GO)", "i"),
  "P3-01/P3-02 visible UAT execution pack",
);

requireText(
  "docs/HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*PASS_LOCAL_TEMPLATE)(?=[\\s\\S]*P3-01 lead lifecycle and P3-02 lead-to-student handover)(?=[\\s\\S]*Production status:\\s*NO-GO)(?=[\\s\\S]*P3-UAT-01)(?=[\\s\\S]*P3-UAT-08)(?=[\\s\\S]*P3-UAT-DEC-01)(?=[\\s\\S]*P3-UAT-DEC-06)(?=[\\s\\S]*No raw PII, CCCD, phone, bank data, vouchers, passwords, temporary passwords, OTPs, password reset links, account activation\\/invite links, service-role keys or API keys)(?=[\\s\\S]*P3-01\\/P3-02 remain pending until every P3-UAT case is executed with redacted\\s+evidence)", "i"),
  "P3-01/P3-02 UAT runbook and closure rule",
);

requireText(
  "docs/HEU_HOU_LEDGER_HANDOVER_GAP_PACK_20260628_V01_DRAFT.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*DRAFT_CONTROL)(?=[\\s\\S]*Production status:\\s*NO-GO)(?=[\\s\\S]*separate from TTGDTX and Short Course)(?=[\\s\\S]*HOU-LH-01)(?=[\\s\\S]*HOU-LH-08)(?=[\\s\\S]*HOU_LEDGER_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*RV_HOU_LEDGER_SUMMARY)(?=[\\s\\S]*HOU-UAT-01)(?=[\\s\\S]*HOU-UAT-06)(?=[\\s\\S]*does not approve production HOU\\s+handover, tuition ledger posting, invoice issuance, COM payout, finance action,\\s+evidence acceptance, UAT acceptance, owner GO or production GO)", "i"),
  "HOU ledger/handover gap pack boundary",
);

requireText(
  "components/hou/hou-ledger-handover-gap-pack.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-hou-ledger-handover-gap-pack=\"P8-01\")(?=[\\s\\S]*HOU Ledger\\/Handover Gap Pack:\\s*PASS_LOCAL only)(?=[\\s\\S]*HOU-LH-01)(?=[\\s\\S]*HOU-LH-08)(?=[\\s\\S]*RV_HOU_LEDGER_SUMMARY)(?=[\\s\\S]*PASS_LOCAL does not approve HOU handover, tuition ledger posting,\\s+invoice issuance, COM payout, finance action, UAT acceptance,\\s+evidence acceptance, owner GO or production GO)", "i"),
  "visible HOU ledger/handover gap pack",
);

requireText(
  "docs/HEU_SHORT_COURSE_ATTENDANCE_PAYMENT_GAP_PACK_20260628_V01_DRAFT.md",
  literalPattern("(?=[\\s\\S]*Status:\\s*DRAFT_CONTROL)(?=[\\s\\S]*Production status:\\s*NO-GO)(?=[\\s\\S]*SC-AP-01)(?=[\\s\\S]*SC-AP-08)(?=[\\s\\S]*SC_ATTENDANCE_PAYMENT_READY \\/ NO_GO \\/ BLOCKED)(?=[\\s\\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\\s\\S]*SC-UAT-01)(?=[\\s\\S]*SC-UAT-08)(?=[\\s\\S]*does not approve attendance lock, BHXH decision,\\s+meal\\/allowance payment, HR payment, invoice\\/payment verification, statutory\\s+accounting, period close, UAT acceptance, evidence acceptance, owner GO or\\s+production GO)", "i"),
  "Short Course attendance/payment gap pack boundary",
);

requireText(
  "components/short-course/short-course-attendance-payment-gap-pack.tsx",
  literalPattern("(?=[\\s\\S]*data-heu-short-course-attendance-payment-gap-pack=\"P9-01\")(?=[\\s\\S]*Short Course Attendance\\/Payment Gap Pack:\\s*PASS_LOCAL only)(?=[\\s\\S]*SC-AP-01)(?=[\\s\\S]*SC-AP-08)(?=[\\s\\S]*RV_SHORT_COURSE_ATTENDANCE_PAYMENT)(?=[\\s\\S]*PASS_LOCAL does not approve attendance lock, BHXH decision,\\s+meal\\/allowance payment, HR payment, invoice\\/payment verification,\\s+period close, statutory accounting, UAT acceptance, evidence\\s+acceptance, owner GO or production GO)", "i"),
  "visible Short Course attendance/payment gap pack",
);

requireText(
  "docs/HEU_SYSTEM_BUILD_BACKLOG.md",
  literalPattern("(?=[\\s\\S]*P3-01[\\s\\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\\.md[\\s\\S]*P3-01\\/P3-02 UAT execution pack[\\s\\S]*audit:heu-lead-lifecycle-handover-uat-pack)(?=[\\s\\S]*P3-02[\\s\\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\\.md[\\s\\S]*P3-01\\/P3-02 UAT execution pack[\\s\\S]*signed role-scope UAT and handover decision still required)", "i"),
  "P3 backlog UAT execution pack reference",
);

requireText(
  "docs/TTGDTX_9PLUS_PILOT_PRODUCTION_CHECKLIST.md",
  literalPattern("(?=[\\s\\S]*Lead lifecycle standard[\\s\\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\\.md[\\s\\S]*P3-01\\/P3-02 UAT execution pack[\\s\\S]*signed UAT still required)(?=[\\s\\S]*Lead-to-student handover guard[\\s\\S]*HEU_LEAD_LIFECYCLE_HANDOVER_UAT_RUNBOOK_20260628\\.md[\\s\\S]*P3-01\\/P3-02 UAT execution pack[\\s\\S]*signed UAT and handover decision still required)", "i"),
  "production checklist P3 UAT execution pack reference",
);

if (failures.length > 0) {
  console.error("TTGDTX release-gate audit failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `TTGDTX release-gate audit passed. Checked ${requiredFiles.length} files and ${requiredScripts.length} npm scripts.`,
);
