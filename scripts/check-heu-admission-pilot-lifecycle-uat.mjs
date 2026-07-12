import { readFileSync } from "node:fs";
import path from "node:path";

const packPath = path.join(
  process.cwd(),
  "fixtures/admission/pilot_lead_lifecycle_uat.json",
);
const pack = JSON.parse(readFileSync(packPath, "utf8"));

const allowedNext = {
  NEW: new Set(["ASSIGNED", "LOST", "DUPLICATE"]),
  ASSIGNED: new Set(["CONTACTED", "LOST", "DUPLICATE"]),
  CONTACTED: new Set([
    "INTERESTED",
    "FOLLOW_UP",
    "VISITED",
    "DOCUMENT_PENDING",
    "LOST",
  ]),
  INTERESTED: new Set(["FOLLOW_UP", "VISITED", "DOCUMENT_PENDING", "LOST"]),
  FOLLOW_UP: new Set(["CONTACTED", "INTERESTED", "VISITED", "DOCUMENT_PENDING", "LOST"]),
  VISITED: new Set(["DOCUMENT_PENDING", "DOCUMENT_SUBMITTED", "LOST"]),
  DOCUMENT_PENDING: new Set(["DOCUMENT_SUBMITTED", "LOST"]),
  DOCUMENT_SUBMITTED: new Set(["ELIGIBLE", "LOST"]),
  ELIGIBLE: new Set(["ENROLLED", "LOST"]),
  ENROLLED: new Set([]),
  LOST: new Set([]),
  DUPLICATE: new Set([]),
};

const forbiddenSideEffects = new Set([
  "CREATE_RECEIVABLE",
  "COLLECT_TUITION",
  "ISSUE_INVOICE",
  "MARK_REVENUE",
  "EXECUTE_PAYOUT",
]);

function evaluate(testCase) {
  const transitions = testCase.transitions ?? [];
  for (let index = 1; index < transitions.length; index += 1) {
    if (!allowedNext[transitions[index - 1]]?.has(transitions[index])) {
      return "INVALID_TRANSITION";
    }
  }

  if (transitions.includes("FOLLOW_UP") && !testCase.next_followup_at) {
    return "FOLLOW_UP_DATE_REQUIRED";
  }
  if (transitions.includes("LOST") && !testCase.lost_reason) {
    return "LOST_REASON_REQUIRED";
  }
  if (
    transitions.includes("DUPLICATE") &&
    (!testCase.duplicate_of_ref || testCase.archive_only !== true)
  ) {
    return "DUPLICATE_REFERENCE_REQUIRED";
  }

  const handover = testCase.handover;
  if (handover) {
    if (!transitions.includes("DOCUMENT_SUBMITTED")) {
      return "DOCUMENT_SUBMITTED_REQUIRED";
    }
    if (handover.receiver_scope !== pack.workspace_code) {
      return "HANDOVER_SCOPE_MISMATCH";
    }
    if (!handover.controlled_evidence_ref) {
      return "CONTROLLED_EVIDENCE_REQUIRED";
    }
  }

  if (
    (testCase.forbidden_side_effects ?? []).some((effect) =>
      forbiddenSideEffects.has(effect),
    )
  ) {
    return "FINANCE_MUTATION_FORBIDDEN";
  }
  return "ALLOW";
}

const failures = [];
if (
  pack.classification !== "SYNTHETIC_NO_PII" ||
  pack.mode !== "LOCAL_ONLY_NO_DATABASE" ||
  pack.production_use !== "NO_GO"
) {
  failures.push("Pack boundary must remain synthetic, local-only and production NO_GO.");
}

for (const testCase of pack.cases ?? []) {
  const actual = evaluate(testCase);
  const expected =
    testCase.expected === "ALLOW" ? "ALLOW" : testCase.expected_reason;
  if (actual !== expected) {
    failures.push(`${testCase.case_id}: expected ${expected}, received ${actual}.`);
  }
}

const requiredCases = new Set(
  Array.from({ length: 8 }, (_, index) =>
    `ADM-UAT-${String(index + 1).padStart(2, "0")}`,
  ),
);
for (const testCase of pack.cases ?? []) {
  requiredCases.delete(testCase.case_id);
}
if (requiredCases.size > 0) {
  failures.push(`Missing cases: ${[...requiredCases].join(", ")}.`);
}

if (failures.length > 0) {
  console.error("HEU admission pilot lifecycle UAT failed.");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `HEU admission pilot lifecycle UAT passed: ${pack.cases.length} synthetic cases; no database/network/finance mutation executed.`,
);
