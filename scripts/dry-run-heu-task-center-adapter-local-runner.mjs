const boundary = {
  mode: "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY",
  readonly: "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READONLY",
  draftOnly: "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_DRAFT_ONLY",
  noApproval: "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_APPROVAL",
  noDatabaseRead:
    "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_READ",
  noDatabaseClient:
    "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_DATABASE_CLIENT",
  noEnvEnablement:
    "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_ENV_ENABLEMENT",
  noTaskMutation:
    "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_TASK_MUTATION",
  noRealData:
    "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_REAL_DATA",
  noAiOrAutomation:
    "TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_NO_AI_OR_AUTOMATION",
};

const syntheticCases = [
  {
    code: "LOCAL_RUNNER_SCRIPT_SCOPE_MATCH_REPORT",
    assertion: "ASSERT_SYN_SCOPE_MATCH_VISIBLE",
    actor: {
      code: "SYN_ACTOR_IT_DATA_SCOPED_READER",
      department: "ADMISSION",
      scopes: ["SEGMENT_TTGDTX_9PLUS"],
      readonly: true,
    },
    task: {
      code: "SYN_TASK_DEPT_MATCHED_METADATA_ONLY",
      department: "ADMISSION",
      segment: "SEGMENT_TTGDTX_9PLUS",
      restrictedFieldsPresent: false,
    },
    expectedReport: "LOCAL_RUNNER_CASE_PASS_SCOPE_MATCH",
  },
  {
    code: "LOCAL_RUNNER_SCRIPT_NO_SCOPE_BLOCK",
    assertion: "ASSERT_SYN_NO_SCOPE_BLOCKED",
    actor: {
      code: "SYN_ACTOR_AUDIT_NO_SCOPE",
      department: "AUDIT",
      scopes: [],
      readonly: true,
    },
    task: {
      code: "SYN_TASK_ANY_DEPARTMENT_METADATA_ONLY",
      department: "ADMISSION",
      segment: "SEGMENT_TTGDTX_9PLUS",
      restrictedFieldsPresent: false,
    },
    expectedReport: "LOCAL_RUNNER_CASE_PASS_NO_SCOPE_BLOCKED",
  },
  {
    code: "LOCAL_RUNNER_SCRIPT_RESTRICTED_FIELDS_ABSENT",
    assertion: "ASSERT_SYN_RESTRICTED_FIELDS_ABSENT",
    actor: {
      code: "SYN_ACTOR_LEGAL_REVIEWER_METADATA_ONLY",
      department: "PHAP_CHE",
      scopes: ["SEGMENT_TTGDTX_9PLUS"],
      readonly: true,
    },
    task: {
      code: "SYN_TASK_RESTRICTED_FIELDS_MASKED",
      department: "ADMISSION",
      segment: "SEGMENT_TTGDTX_9PLUS",
      restrictedFieldsPresent: false,
    },
    expectedReport: "LOCAL_RUNNER_CASE_PASS_RESTRICTED_FIELDS_ABSENT",
  },
  {
    code: "LOCAL_RUNNER_SCRIPT_DEPARTMENT_MISMATCH_BLOCK",
    assertion: "ASSERT_SYN_DEPARTMENT_MISMATCH_BLOCKED",
    actor: {
      code: "SYN_ACTOR_DEPARTMENT_A",
      department: "CTHSSV",
      scopes: ["SEGMENT_TTGDTX_9PLUS"],
      readonly: true,
    },
    task: {
      code: "SYN_TASK_DEPARTMENT_B_METADATA_ONLY",
      department: "FINANCE",
      segment: "SEGMENT_TTGDTX_9PLUS",
      restrictedFieldsPresent: false,
    },
    expectedReport: "LOCAL_RUNNER_CASE_PASS_DEPARTMENT_MISMATCH_BLOCKED",
  },
  {
    code: "LOCAL_RUNNER_SCRIPT_PRODUCTION_NO_GO_REPORT",
    assertion: "ASSERT_SYN_REPORT_ONLY_NO_APPROVAL",
    actor: {
      code: "SYN_ACTOR_BGH_READONLY",
      department: "BGH",
      scopes: ["SEGMENT_TTGDTX_9PLUS"],
      readonly: true,
    },
    task: {
      code: "SYN_TASK_AGGREGATE_STATUS_METADATA_ONLY",
      department: "BGH",
      segment: "SEGMENT_TTGDTX_9PLUS",
      restrictedFieldsPresent: false,
    },
    expectedReport: "LOCAL_RUNNER_CASE_PASS_PRODUCTION_NO_GO",
  },
];

function evaluateCase(testCase) {
  const scopeMatches = testCase.actor.scopes.includes(testCase.task.segment);
  const departmentMatches =
    testCase.actor.department === testCase.task.department ||
    testCase.actor.department === "IT_DATA" ||
    testCase.actor.department === "PHAP_CHE";
  const restrictedDataAbsent = testCase.task.restrictedFieldsPresent === false;
  const readonlyOnly = testCase.actor.readonly === true;

  if (testCase.assertion === "ASSERT_SYN_SCOPE_MATCH_VISIBLE") {
    return scopeMatches && departmentMatches && restrictedDataAbsent;
  }

  if (testCase.assertion === "ASSERT_SYN_NO_SCOPE_BLOCKED") {
    return !scopeMatches && restrictedDataAbsent;
  }

  if (testCase.assertion === "ASSERT_SYN_RESTRICTED_FIELDS_ABSENT") {
    return restrictedDataAbsent;
  }

  if (testCase.assertion === "ASSERT_SYN_DEPARTMENT_MISMATCH_BLOCKED") {
    return scopeMatches && !departmentMatches && restrictedDataAbsent;
  }

  if (testCase.assertion === "ASSERT_SYN_REPORT_ONLY_NO_APPROVAL") {
    return readonlyOnly && restrictedDataAbsent;
  }

  return false;
}

const results = syntheticCases.map((testCase) => {
  const passed = evaluateCase(testCase);
  return {
    code: testCase.code,
    assertion: testCase.assertion,
    report: passed ? testCase.expectedReport : "LOCAL_RUNNER_CASE_NO_GO",
    status: passed ? "PASS" : "NO_GO",
  };
});

const failures = results.filter((result) => result.status !== "PASS");

console.log("HEU Task Center adapter dry-run local runner script draft");
console.log(JSON.stringify({ boundary, results }, null, 2));

if (failures.length > 0) {
  console.error("HEU_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READY: NO_GO");
  for (const failure of failures) {
    console.error(`${failure.code}: ${failure.report}`);
  }
  process.exit(1);
}

console.log(
  "HEU_TASK_CENTER_ADAPTER_DRY_RUN_LOCAL_RUNNER_SCRIPT_DRAFT_READY: PASS_LOCAL",
);
console.log("TASK_CENTER_DATABASE_READY: NO_GO_LOCAL_RUNNER_SCRIPT_DRAFT_ONLY");
console.log("LOCAL_RUNNER_REPORT_ONLY: PASS_LOCAL_SYNTHETIC_IN_MEMORY");
console.log(
  "NO_RUNTIME_MUTATION: task center adapter dry-run local runner script draft only; no owner approval, database client, database read, env enablement, runtime fixture file, table creation, SQL migration, task write, file upload, storage write, real-data fixture, AI call, paid automation, deploy, finance action or production GO",
);
