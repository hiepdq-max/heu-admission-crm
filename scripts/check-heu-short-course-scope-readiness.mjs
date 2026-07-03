import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env.local");
const requiredEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const shortSegmentCodes = [
  "SHORT_UNEMPLOYMENT_SUPPORT",
  "SHORT_ONSITE_HEU",
];
const statuses = [];

function addStatus(code, status, detail) {
  statuses.push({ code, status, detail });
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const env = {};
  const contents = readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }

  return env;
}

function isMeaningfulSecret(value) {
  return (
    typeof value === "string" &&
    value.length > 20 &&
    !/your|todo|changeme|placeholder/i.test(value)
  );
}

function hashLabel(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 10);
}

function sampleHashes(rows, key = "id") {
  const hashes = rows
    .slice(0, 5)
    .map((row) => hashLabel(row[key] ?? row.entity_id ?? JSON.stringify(row)));

  return hashes.length > 0
    ? ` Sample hashed row labels: ${hashes.join(", ")}.`
    : "";
}

function readyFromCount(count) {
  return count === 0 ? "READY" : "NO_GO";
}

function mapById(rows) {
  return new Map((rows ?? []).map((row) => [row.id, row]));
}

function checkAppScopeGuards() {
  const page = read("app/short-course/page.tsx");
  const drilldownPage = read("app/short-course/drilldown/page.tsx");
  const intakePage = read("app/short-course/intake/page.tsx");
  const intakeActions = read("app/short-course/intake/actions.ts");
  const workflowsPage = read("app/short-course/workflows/page.tsx");
  const workflowsActions = read("app/short-course/workflows/actions.ts");
  const packageJson = JSON.parse(read("package.json"));

  const pageReady =
    page.includes("getAdmissionWorkspaceContext") &&
    page.includes("withAdmissionSegmentParam") &&
    page.includes("workspaceSegmentId={activeSegmentId}") &&
    page.includes("workspaceReturnTo={refreshHref}") &&
    page.includes('.eq("admission_segment_id", activeSegmentId)') &&
    page.includes('.in("class_id", classIds)') &&
    page.includes('.in("enrollment_id", enrollmentIds)') &&
    page.includes("scopedRiskEntityIds") &&
    page.includes("open_risk_count: riskRows.length") &&
    page.includes("dashboard_exception_count: riskRows.length");
  const drilldownPageReady =
    drilldownPage.includes("loadScopedRiskEntityIds") &&
    drilldownPage.includes("loadRisks(supabase, segmentIds, entityId)") &&
    drilldownPage.includes('.in("entity_id", scopedEntityIds)') &&
    drilldownPage.includes("loadScopedAttendanceSessionIds") &&
    drilldownPage.includes("loadScopedPaymentIds");
  const intakePageReady =
    intakePage.includes("getAdmissionWorkspaceContext") &&
    intakePage.includes("activeSegmentId") &&
    intakePage.includes("workspaceSegmentId={activeSegmentId}") &&
    intakePage.includes('name="admission_segment_id"') &&
    intakePage.includes('.eq("admission_segment_id", activeSegmentId)');
  const intakeActionReady =
    intakeActions.includes("createAuthedClient") &&
    intakeActions.includes("can_use_admission_workspace") &&
    intakeActions.includes("create_short_class") &&
    intakeActions.includes("convert_short_course_lead_to_student") &&
    intakeActions.includes("assign_short_enrollment_to_class");
  const workflowPageReady =
    workflowsPage.includes("getAdmissionWorkspaceContext") &&
    workflowsPage.includes("workspaceSegmentId={activeSegmentId}") &&
    workflowsPage.includes("short_course_workflow_request_status") &&
    workflowsPage.includes(
      "admission_segment_id.eq.${activeSegmentId},admission_segment_id.is.null",
    );
  const workflowActionReady =
    workflowsActions.includes("can_use_admission_workspace") &&
    workflowsActions.includes('select("segment_code")') &&
    workflowsActions.includes('startsWith("SHORT_")') &&
    workflowsActions.includes("not_short_course_workspace") &&
    workflowsActions.includes(
      'select("request_status,requested_by,admission_segment_id")',
    ) &&
    workflowsActions.includes("currentRequest.admission_segment_id") &&
    workflowsActions.includes("await assertWorkspaceAllowed(");
  const packageReady =
    packageJson.scripts?.["check:heu-short-course-scope-readiness"] ===
    "node scripts/check-heu-short-course-scope-readiness.mjs";

  addStatus(
    "SHORT-SCOPE-APP-GUARD",
    pageReady &&
      intakePageReady &&
      intakeActionReady &&
      drilldownPageReady &&
      workflowPageReady &&
      workflowActionReady &&
      packageReady
      ? "READY"
      : "NO_GO",
    pageReady &&
      intakePageReady &&
      intakeActionReady &&
      drilldownPageReady &&
      workflowPageReady &&
      workflowActionReady &&
      packageReady
      ? "Short Course page, drilldown, intake, workflow actions and package script include admission workspace scope guards."
      : "Short Course page, drilldown, intake, workflow actions or package script are missing one or more scope guards.",
  );
}

function checkSensitiveDisplayGuards() {
  const helper = read("lib/sensitive-display.ts");
  const drilldownPage = read("app/short-course/drilldown/page.tsx");
  const intakePage = read("app/short-course/intake/page.tsx");
  const actionsPage = read("app/short-course/actions/page.tsx");

  const helperReady =
    helper.includes("export function maskPhone") &&
    helper.includes("export function maskIdentityNo") &&
    helper.includes("export function maskVoucherOrRawId") &&
    helper.includes("return `***${visibleTail(normalized, visible)}`");
  const drilldownReady =
    drilldownPage.includes("maskPhone(row.student_phone)") &&
    drilldownPage.includes("maskIdentityNo(row.identity_no)") &&
    drilldownPage.includes("maskVoucherOrRawId(row.voucher_no)") &&
    drilldownPage.includes("maskVoucherOrRawId(row.invoice_id)") &&
    !drilldownPage.includes("`SĐT: ${row.student_phone}`") &&
    !drilldownPage.includes("`CCCD: ${row.identity_no}`") &&
    !drilldownPage.includes("`Chứng từ: ${row.voucher_no}`") &&
    !drilldownPage.includes("`Invoice: ${row.invoice_id}`");
  const intakeReady =
    intakePage.includes('import { maskPhone } from "@/lib/sensitive-display"') &&
    intakePage.includes("maskPhone(lead.student_phone)") &&
    intakePage.includes("maskPhone(enrollment.student_phone)") &&
    !intakePage.includes('{lead.student_phone ?? "Chưa có SĐT"}') &&
    !intakePage.includes('{enrollment.student_phone ?? "Chưa có SĐT"}');
  const actionsReady =
    actionsPage.includes(
      'import { maskVoucherOrRawId } from "@/lib/sensitive-display"',
    ) &&
    actionsPage.includes("maskVoucherOrRawId(row.voucher_no)") &&
    !actionsPage.includes("`chứng từ ${row.voucher_no}`");

  addStatus(
    "SHORT-SCOPE-PRIVACY-DISPLAY",
    helperReady && drilldownReady && intakeReady && actionsReady
      ? "READY"
      : "NO_GO",
    helperReady && drilldownReady && intakeReady && actionsReady
      ? "Short Course UI masks phone, identity, voucher and raw invoice identifiers before display."
      : "Short Course UI is missing one or more sensitive-display masks for phone, identity, voucher or raw invoice identifiers.",
  );
}

function addActorFindings(rows, fields, activeProfileIds, findings) {
  for (const row of rows ?? []) {
    for (const field of fields) {
      if (row[field] && !activeProfileIds.has(row[field])) {
        findings.push({ id: row.id, field });
      }
    }
  }
}

function validateEnrollment(row, studentsById, classesById, shortSegmentIds) {
  const student = studentsById.get(row.student_id);
  const classRow = row.class_id ? classesById.get(row.class_id) : null;

  return (
    shortSegmentIds.has(row.admission_segment_id) &&
    Boolean(student) &&
    student.admission_segment_id === row.admission_segment_id &&
    (!row.class_id ||
      (Boolean(classRow) &&
        classRow.admission_segment_id === row.admission_segment_id))
  );
}

function validateEntityChain(
  row,
  enrollmentsById,
  studentsById,
  classesById,
  shortSegmentIds,
) {
  const enrollment = enrollmentsById.get(row.enrollment_id);
  const student = studentsById.get(row.student_id);
  const classRow = row.class_id ? classesById.get(row.class_id) : null;

  return (
    Boolean(enrollment) &&
    Boolean(student) &&
    enrollment.student_id === row.student_id &&
    shortSegmentIds.has(enrollment.admission_segment_id) &&
    student.admission_segment_id === enrollment.admission_segment_id &&
    (!row.class_id ||
      (Boolean(classRow) &&
        classRow.admission_segment_id === enrollment.admission_segment_id)) &&
    (!enrollment.class_id || !row.class_id || enrollment.class_id === row.class_id)
  );
}

function validatePaymentChain(
  payment,
  invoicesById,
  enrollmentsById,
  studentsById,
  classesById,
  shortSegmentIds,
) {
  const invoice = invoicesById.get(payment.invoice_id);

  return (
    Boolean(invoice) &&
    invoice.enrollment_id === payment.enrollment_id &&
    invoice.student_id === payment.student_id &&
    validateEntityChain(
      payment,
      enrollmentsById,
      studentsById,
      classesById,
      shortSegmentIds,
    )
  );
}

const localEnv = parseEnvFile(envPath);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "SHORT-SCOPE-ENV",
  missingKeys.length === 0 ? "READY" : "NO_GO",
  missingKeys.length === 0
    ? ".env.local has required Supabase env keys. Values are intentionally hidden."
    : `.env.local missing or placeholder keys: ${missingKeys.join(", ")}.`,
);

checkAppScopeGuards();
checkSensitiveDisplayGuards();

if (missingKeys.length === 0) {
  try {
    const adminClient = createClient(
      localEnv.NEXT_PUBLIC_SUPABASE_URL,
      localEnv.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data: segments, error: segmentsError } = await adminClient
      .from("admission_segments")
      .select("id,segment_code,status")
      .in("segment_code", shortSegmentCodes)
      .eq("status", "ACTIVE");

    const foundSegmentCodes = new Set((segments ?? []).map((row) => row.segment_code));
    const missingSegmentCodes = shortSegmentCodes.filter(
      (code) => !foundSegmentCodes.has(code),
    );

    addStatus(
      "SHORT-SCOPE-SEGMENTS",
      !segmentsError && missingSegmentCodes.length === 0 ? "READY" : "NO_GO",
      !segmentsError && missingSegmentCodes.length === 0
        ? "Short Course active segments are available for scope checks."
        : `Could not find active Short Course segments: ${missingSegmentCodes.join(", ")}. Raw errors are not printed.`,
    );

    if (!segmentsError && missingSegmentCodes.length === 0) {
      const shortSegmentIds = new Set((segments ?? []).map((segment) => segment.id));
      const [
        { data: students, error: studentsError },
        { data: classes, error: classesError },
        { data: enrollments, error: enrollmentsError },
        { data: sessions, error: sessionsError },
        { data: records, error: recordsError },
        { data: bhxhCases, error: bhxhError },
        { data: invoices, error: invoicesError },
        { data: payments, error: paymentsError },
        { data: riskAlerts, error: riskError },
        { data: workflowRequests, error: workflowError },
        { data: profiles, error: profilesError },
      ] = await Promise.all([
        adminClient
          .from("short_student_master")
          .select(
            "id,admission_segment_id,lead_id,locked_by,created_by,updated_by,status",
          )
          .eq("status", "ACTIVE")
          .limit(5000),
        adminClient
          .from("short_class_master")
          .select(
            "id,admission_segment_id,offering_id,instructor_user_id,locked_by,created_by,updated_by,status",
          )
          .eq("status", "ACTIVE")
          .limit(5000),
        adminClient
          .from("short_enrollments")
          .select(
            "id,student_id,class_id,admission_segment_id,lead_id,created_by,updated_by,record_status",
          )
          .eq("record_status", "ACTIVE")
          .limit(5000),
        adminClient
          .from("short_attendance_sessions")
          .select(
            "id,class_id,instructor_user_id,locked_by,created_by,updated_by,record_status",
          )
          .eq("record_status", "ACTIVE")
          .limit(5000),
        adminClient
          .from("short_attendance_records")
          .select(
            "id,session_id,enrollment_id,student_id,checked_by,created_by,updated_by,record_status",
          )
          .eq("record_status", "ACTIVE")
          .limit(5000),
        adminClient
          .from("short_bhxh_policy_cases")
          .select(
            "id,enrollment_id,student_id,class_id,checked_by,created_by,updated_by,record_status",
          )
          .eq("record_status", "ACTIVE")
          .limit(5000),
        adminClient
          .from("short_finance_invoices")
          .select(
            "id,enrollment_id,student_id,class_id,locked_by,created_by,updated_by,record_status",
          )
          .eq("record_status", "ACTIVE")
          .limit(5000),
        adminClient
          .from("short_payments")
          .select(
            "id,invoice_id,enrollment_id,student_id,verified_by,created_by,updated_by,record_status",
          )
          .eq("record_status", "ACTIVE")
          .limit(5000),
        adminClient
          .from("short_risk_alerts")
          .select(
            "id,entity_type,entity_id,assigned_to,resolved_by,created_by,updated_by,record_status",
          )
          .eq("record_status", "ACTIVE")
          .limit(5000),
        adminClient
          .from("approval_requests")
          .select(
            "id,approval_code,entity_type,entity_id,entity_code,admission_segment_id,requested_by,checked_by,approved_by,rejected_by,created_by,updated_by,record_status",
          )
          .eq("record_status", "ACTIVE")
          .eq("approval_code", "APPROVE_P1_15_SHORT_WORK_REQUEST")
          .limit(5000),
        adminClient.from("users_profile").select("id,status").limit(5000),
      ]);

      if (
        studentsError ||
        classesError ||
        enrollmentsError ||
        sessionsError ||
        recordsError ||
        bhxhError ||
        invoicesError ||
        paymentsError ||
        riskError ||
        workflowError ||
        profilesError
      ) {
        addStatus(
          "SHORT-SCOPE-TABLE-READ",
          "NO_GO",
          "Could not read one or more Short Course scope tables. Raw errors are not printed.",
        );
      } else {
        const studentsById = mapById(students);
        const classesById = mapById(classes);
        const enrollmentsById = mapById(enrollments);
        const sessionsById = mapById(sessions);
        const invoicesById = mapById(invoices);
        const wrongStudents = (students ?? []).filter(
          (row) => !shortSegmentIds.has(row.admission_segment_id),
        );
        const wrongClasses = (classes ?? []).filter(
          (row) => !shortSegmentIds.has(row.admission_segment_id),
        );
        const wrongEnrollments = (enrollments ?? []).filter(
          (row) =>
            !validateEnrollment(row, studentsById, classesById, shortSegmentIds),
        );

        addStatus(
          "SHORT-SCOPE-STUDENTS",
          readyFromCount(wrongStudents.length),
          wrongStudents.length === 0
            ? `Active Short Course students are tagged to Short Course segments. Rows checked: ${(students ?? []).length}.`
            : `Active Short Course students outside Short Course segments: ${wrongStudents.length}.` +
                sampleHashes(wrongStudents),
        );

        addStatus(
          "SHORT-SCOPE-CLASSES",
          readyFromCount(wrongClasses.length),
          wrongClasses.length === 0
            ? `Active Short Course classes are tagged to Short Course segments. Rows checked: ${(classes ?? []).length}.`
            : `Active Short Course classes outside Short Course segments: ${wrongClasses.length}.` +
                sampleHashes(wrongClasses),
        );

        addStatus(
          "SHORT-SCOPE-ENROLLMENTS",
          readyFromCount(wrongEnrollments.length),
          wrongEnrollments.length === 0
            ? `Active Short Course enrollments match student/class scope. Rows checked: ${(enrollments ?? []).length}.`
            : `Active Short Course enrollments missing a valid student/class scope chain: ${wrongEnrollments.length}.` +
                sampleHashes(wrongEnrollments),
        );

        const wrongSessions = (sessions ?? []).filter((row) => {
          const classRow = classesById.get(row.class_id);
          return !classRow || !shortSegmentIds.has(classRow.admission_segment_id);
        });
        const wrongRecords = (records ?? []).filter((row) => {
          const session = sessionsById.get(row.session_id);
          const enrollment = enrollmentsById.get(row.enrollment_id);
          const student = studentsById.get(row.student_id);
          const classRow = session ? classesById.get(session.class_id) : null;

          return !(
            session &&
            enrollment &&
            student &&
            classRow &&
            enrollment.student_id === row.student_id &&
            enrollment.class_id === session.class_id &&
            classRow.admission_segment_id === enrollment.admission_segment_id &&
            student.admission_segment_id === enrollment.admission_segment_id &&
            shortSegmentIds.has(enrollment.admission_segment_id)
          );
        });

        addStatus(
          "SHORT-SCOPE-ATTENDANCE",
          wrongSessions.length === 0 && wrongRecords.length === 0
            ? "READY"
            : "NO_GO",
          wrongSessions.length === 0 && wrongRecords.length === 0
            ? `Attendance sessions/records point to scoped Short Course class and enrollment chains. Sessions checked: ${(sessions ?? []).length}; records checked: ${(records ?? []).length}.`
            : `Attendance scope findings: sessions=${wrongSessions.length}; records=${wrongRecords.length}.` +
                sampleHashes([...wrongSessions, ...wrongRecords]),
        );

        const wrongBhxhCases = (bhxhCases ?? []).filter(
          (row) =>
            !validateEntityChain(
              row,
              enrollmentsById,
              studentsById,
              classesById,
              shortSegmentIds,
            ),
        );
        const wrongInvoices = (invoices ?? []).filter(
          (row) =>
            !validateEntityChain(
              row,
              enrollmentsById,
              studentsById,
              classesById,
              shortSegmentIds,
            ),
        );
        const wrongPayments = (payments ?? []).filter(
          (row) =>
            !validatePaymentChain(
              row,
              invoicesById,
              enrollmentsById,
              studentsById,
              classesById,
              shortSegmentIds,
            ),
        );

        addStatus(
          "SHORT-SCOPE-BHXH-FINANCE",
          wrongBhxhCases.length === 0 &&
            wrongInvoices.length === 0 &&
            wrongPayments.length === 0
            ? "READY"
            : "NO_GO",
          wrongBhxhCases.length === 0 &&
            wrongInvoices.length === 0 &&
            wrongPayments.length === 0
            ? `BHXH, invoice and payment rows trace to scoped Short Course enrollment chains. BHXH=${(bhxhCases ?? []).length}; invoices=${(invoices ?? []).length}; payments=${(payments ?? []).length}.`
            : `BHXH/finance scope findings: bhxh=${wrongBhxhCases.length}; invoices=${wrongInvoices.length}; payments=${wrongPayments.length}.` +
                sampleHashes([...wrongBhxhCases, ...wrongInvoices, ...wrongPayments]),
        );

        const wrongWorkflowRequests = (workflowRequests ?? []).filter((row) => {
          if (
            row.admission_segment_id &&
            !shortSegmentIds.has(row.admission_segment_id)
          ) {
            return true;
          }

          return row.entity_id && !row.admission_segment_id;
        });

        addStatus(
          "SHORT-SCOPE-WORKFLOWS",
          readyFromCount(wrongWorkflowRequests.length),
          wrongWorkflowRequests.length === 0
            ? `Short Course workflow requests are segment-scoped when they target concrete entities. Rows checked: ${(workflowRequests ?? []).length}.`
            : `Short Course workflow requests missing or mismatching segment scope: ${wrongWorkflowRequests.length}.` +
                sampleHashes(wrongWorkflowRequests),
        );

        const activeProfileIds = new Set(
          (profiles ?? [])
            .filter((profile) => profile.status === "ACTIVE")
            .map((profile) => profile.id),
        );
        const actorFindings = [];
        addActorFindings(
          students,
          ["locked_by", "created_by", "updated_by"],
          activeProfileIds,
          actorFindings,
        );
        addActorFindings(
          classes,
          ["instructor_user_id", "locked_by", "created_by", "updated_by"],
          activeProfileIds,
          actorFindings,
        );
        addActorFindings(
          enrollments,
          ["created_by", "updated_by"],
          activeProfileIds,
          actorFindings,
        );
        addActorFindings(
          sessions,
          ["instructor_user_id", "locked_by", "created_by", "updated_by"],
          activeProfileIds,
          actorFindings,
        );
        addActorFindings(
          records,
          ["checked_by", "created_by", "updated_by"],
          activeProfileIds,
          actorFindings,
        );
        addActorFindings(
          bhxhCases,
          ["checked_by", "created_by", "updated_by"],
          activeProfileIds,
          actorFindings,
        );
        addActorFindings(
          invoices,
          ["locked_by", "created_by", "updated_by"],
          activeProfileIds,
          actorFindings,
        );
        addActorFindings(
          payments,
          ["verified_by", "created_by", "updated_by"],
          activeProfileIds,
          actorFindings,
        );
        addActorFindings(
          riskAlerts,
          ["assigned_to", "resolved_by", "created_by", "updated_by"],
          activeProfileIds,
          actorFindings,
        );
        addActorFindings(
          workflowRequests,
          [
            "requested_by",
            "checked_by",
            "approved_by",
            "rejected_by",
            "created_by",
            "updated_by",
          ],
          activeProfileIds,
          actorFindings,
        );

        addStatus(
          "SHORT-SCOPE-ACTOR-LINK",
          readyFromCount(actorFindings.length),
          actorFindings.length === 0
            ? "Short Course actor references are either empty or active CRM profiles."
            : `Short Course actor references missing active CRM profile links: ${actorFindings.length}.` +
                sampleHashes(actorFindings),
        );

        addStatus(
          "SHORT-SCOPE-SUMMARY",
          "READY",
          [
            `segments=${(segments ?? []).length}`,
            `students=${(students ?? []).length}`,
            `classes=${(classes ?? []).length}`,
            `enrollments=${(enrollments ?? []).length}`,
            `attendance_sessions=${(sessions ?? []).length}`,
            `attendance_records=${(records ?? []).length}`,
            `bhxh_cases=${(bhxhCases ?? []).length}`,
            `invoices=${(invoices ?? []).length}`,
            `payments=${(payments ?? []).length}`,
            `workflow_requests=${(workflowRequests ?? []).length}`,
          ].join("; "),
        );
      }
    }
  } catch {
    addStatus(
      "SHORT-SCOPE-CHECK",
      "NO_GO",
      "Short Course scope readiness check could not complete. Check server env/project and database schema. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "SHORT-SCOPE-CHECK",
    "NO_GO",
    "Short Course scope checks were skipped because required env keys are missing.",
  );
}

console.log("HEU Short Course scope readiness check");
console.log(
  "Secrets, emails, names, phone numbers, bank accounts, vouchers and raw IDs are never printed by this script.",
);

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
