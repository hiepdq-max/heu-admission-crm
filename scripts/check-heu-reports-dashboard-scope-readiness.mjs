import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, ".env.local");
const reportViewPanelPath = path.join(
  repoRoot,
  "components/reports/report-view-source-map-panel.tsx",
);
const dataMasterBridgePath = path.join(
  repoRoot,
  "components/reports/data-master-report-view-bridge-panel.tsx",
);
const executiveDashboardPath = path.join(
  repoRoot,
  "components/dashboard/executive-dashboard-overview.tsx",
);
const reportViewSourceMapDocPath = path.join(
  repoRoot,
  "docs/HEU_REPORT_VIEW_SOURCE_MAP_20260628_V01_DRAFT.md",
);
const dataMasterReportViewDocPath = path.join(
  repoRoot,
  "docs/HEU_DATA_MASTER_REPORT_VIEW_COMPATIBILITY_20260628_V01_DRAFT.md",
);
const blueprintPath = path.join(
  repoRoot,
  "docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md",
);
const implementationLogPath = path.join(repoRoot, "docs/HEU_IMPLEMENTATION_LOG.md");
const reportsPagePath = path.join(repoRoot, "app/reports/page.tsx");
const reportsOverviewPath = path.join(
  repoRoot,
  "components/reports/reports-overview.tsx",
);
const requiredEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const statuses = [];

function addStatus(code, status, detail) {
  statuses.push({ code, status, detail });
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

function readyFromCount(count) {
  return count === 0 ? "READY" : "NO_GO";
}

function countDetail(okMessage, count, problemMessage) {
  return count === 0 ? okMessage : `${problemMessage}: ${count}.`;
}

function sampleHashes(rows) {
  const hashes = rows.slice(0, 5).map((row) => hashLabel(row.id));
  return hashes.length > 0
    ? ` Sample hashed row labels: ${hashes.join(", ")}.`
    : "";
}

function addStaticTextStatus(code, filePath, patterns, detail) {
  if (!existsSync(filePath)) {
    addStatus(code, "NO_GO", `${path.relative(repoRoot, filePath)} is missing.`);
    return;
  }

  const contents = readFileSync(filePath, "utf8");
  const missingPatterns = patterns.filter((pattern) =>
    typeof pattern === "string" ? !contents.includes(pattern) : !pattern.test(contents),
  );

  addStatus(
    code,
    missingPatterns.length === 0 ? "READY" : "NO_GO",
    missingPatterns.length === 0
      ? detail
      : `${path.relative(repoRoot, filePath)} missing ${missingPatterns
          .map((pattern) => pattern.toString())
          .join(", ")}.`,
  );
}

addStaticTextStatus(
  "REPORT-SOURCE-MAP-CONTRACT",
  reportViewPanelPath,
  [
    'data-heu-report-view-reliance-contract="STD-13_REPORT_VIEW_SOURCE_MAP_RELIANCE_CONTRACT"',
    "DRAFT_CONTROL",
    "DQ-DM-05",
    "OWNER_SIGNOFF_PENDING",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "NO_DASHBOARD_RELIANCE",
    "NO_FINANCE_ACTION",
    "NO_STATUTORY_ACCOUNTING",
    "NO_UAT_ACCEPTANCE",
    "NO_OWNER_GO",
    "NO_PRODUCTION_GO",
    "RV_TTGDTX_FINANCE_SUMMARY",
    "RV_HOU_LEDGER_SUMMARY",
    "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    "RV_AUDIT_RISK_CONTROL",
    "RV_AI_ALLOWED_CONTEXT",
  ],
  "Report View Source Map panel keeps STD-13 reliance contract and no-reliance boundaries.",
);

addStaticTextStatus(
  "REPORT-DQ-DM05-BRIDGE-CONTRACT",
  dataMasterBridgePath,
  [
    'data-heu-report-view-dq-dm05-contract="STD-13_DQ_DM05_DASHBOARD_RELIANCE_LOCK"',
    "DESIGN_ONLY",
    "DRAFT_CONTROL",
    "DQ-DM-05",
    "NO_RAW_WORKBOOK",
    "NO_RAW_BANK_FILE",
    "NO_VOUCHER",
    "NO_UNRESTRICTED_TABLE",
    "NO_DASHBOARD_RELIANCE",
    "NO_PRODUCTION_RELIANCE",
    "REPORT_VIEW_MASTER_CONTRACT",
  ],
  "Data Master / Report View bridge keeps DQ-DM-05 dashboard reliance lock.",
);

addStaticTextStatus(
  "EXECUTIVE-DASHBOARD-REPORT-RELIANCE-CONTRACT",
  executiveDashboardPath,
  [
    'data-heu-executive-report-reliance="STD-03_REPORT_RELIANCE_QUICK_STATUS"',
    "OWNER_SIGNOFF_PENDING",
    "DQ-DM-05",
    "NO_DASHBOARD_RELIANCE",
    "NO_FINANCE_ACTION",
    "NO_OWNER_GO",
  ],
  "Executive dashboard report strip remains read-only and blocked from reliance.",
);

addStaticTextStatus(
  "EXECUTIVE-DASHBOARD-STD33-REPORT-SOURCE-FAST-INDEX",
  executiveDashboardPath,
  [
    'data-heu-executive-report-source-fast-index="STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX"',
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "REPORT_VIEW_SOURCE_INDEX",
    "DQ_DM05_VISIBLE",
    "OWNER_SIGNOFF_PENDING",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "NO_RAW_SOURCE_OPEN",
    "NO_DASHBOARD_RELIANCE",
    "RPT-IDX-01",
    "RPT-IDX-06",
  ],
  "Executive dashboard report source fast index keeps report/source route visible and reliance blocked.",
);

addStaticTextStatus(
  "EXECUTIVE-DASHBOARD-STD39-REPORT-DASHBOARD-SCOPE-CONTRACT",
  executiveDashboardPath,
  [
    'data-heu-executive-report-dashboard-scope-contract="STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT"',
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
    "REPORT_VIEW_REGISTER",
    "SOURCE_MAP_REQUIRED",
    "DQ_DM05_VISIBLE",
    "SCOPE_BOUND_DASHBOARD",
    "OWNER_SIGNOFF_PENDING",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "NO_RAW_SOURCE_OPEN",
    "NO_CROSS_SCOPE_DASHBOARD",
    "NO_DASHBOARD_RELIANCE",
    "NO_REPORT_VIEW_RELIANCE",
    "RPT-SCOPE-01",
    "RPT-SCOPE-06",
  ],
  "Executive dashboard report-dashboard scope contract keeps report-view to dashboard reliance blocked.",
);

addStaticTextStatus(
  "EXECUTIVE-DASHBOARD-STD24-REPORT-SOURCE-MAP-TRIAGE",
  executiveDashboardPath,
  [
    'data-heu-executive-report-source-map-triage="STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE"',
    "PASS_LOCAL_REPORT_SOURCE_TRIAGE",
    "REPORT_VIEW_MASTER_CONTRACT",
    "DQ-DM-05",
    "OWNER_SIGNOFF_PENDING",
    "CONTROLLED_EVIDENCE_REQUIRED",
    "NO_RAW_WORKBOOK",
    "NO_RAW_BANK_FILE",
    "NO_VOUCHER",
    "NO_DASHBOARD_RELIANCE",
    "NO_FINANCE_ACTION",
    "NO_STATUTORY_ACCOUNTING",
    "RPT-SRC-01",
    "RPT-SRC-05",
  ],
  "Executive dashboard report source-map triage keeps report/source reliance blocked.",
);

addStaticTextStatus(
  "REPORT-SOURCE-MAP-DOC-CONTRACT",
  reportViewSourceMapDocPath,
  [
    "Status: DRAFT_CONTROL",
    "Production status: NO-GO",
    "Dashboard -> Report View -> Physical Source -> Data Quality Check -> Owner",
    "SOURCE_MAP_DRAFT",
    "DQ-RV-01",
    "DQ-RV-08",
    "RV-EVID-01",
    "RV-EVID-06",
    "does not approve dashboard production reliance",
  ],
  "Report View Source Map doc keeps draft source-map and evidence queue boundaries.",
);

addStaticTextStatus(
  "DATA-MASTER-REPORT-VIEW-DOC-CONTRACT",
  dataMasterReportViewDocPath,
  [
    "Status: DRAFT_CONTROL",
    "REPORT_VIEW_MASTER_CONTRACT",
    "DQ-DM-05",
    "Dashboard reliance lock",
    "dashboard remains read-only/UAT-only",
    "does not approve production SQL",
  ],
  "Data Master / Report View compatibility doc keeps DQ-DM-05 reliance lock.",
);

addStaticTextStatus(
  "BLUEPRINT-STD13-REPORT-SOURCE-MAP",
  blueprintPath,
  [
    "STD-13",
    "STD-13_REPORT_VIEW_SOURCE_MAP_RELIANCE_CONTRACT",
    "STD-13_DQ_DM05_DASHBOARD_RELIANCE_LOCK",
    "PASS_LOCAL_REPORT_SOURCE_GUARD",
    "NO_DASHBOARD_RELIANCE",
    "NO_RAW_WORKBOOK",
    "NO_STATUTORY_ACCOUNTING",
    "STD-24",
    "STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE",
    "PASS_LOCAL_REPORT_SOURCE_TRIAGE",
    "STD-33",
    "STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX",
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "STD-39",
    "STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "REPORT_VIEW_TO_DASHBOARD_SCOPE",
  ],
  "Standard blueprint records STD-13/STD-24/STD-33/STD-39 report/source-map guard boundaries.",
);

addStaticTextStatus(
  "IMPLEMENTATION-LOG-STD13-STD24",
  implementationLogPath,
  [
    "STD-13 Report Source Map Reliance Guard",
    "check-heu-reports-dashboard-scope-readiness.mjs",
    'data-heu-report-view-reliance-contract="STD-13_REPORT_VIEW_SOURCE_MAP_RELIANCE_CONTRACT"',
    "PASS_LOCAL_REPORT_SOURCE_GUARD",
    "NO_DASHBOARD_RELIANCE",
    "NO_STATUTORY_ACCOUNTING",
    /does not approve\s+report-view reliance/i,
    "STD-24 Executive Report Source Map Triage",
    'data-heu-executive-report-source-map-triage="STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE"',
    "PASS_LOCAL_REPORT_SOURCE_TRIAGE",
    "STD-33 Executive Report Source Fast Index",
    'data-heu-executive-report-source-fast-index="STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX"',
    "PASS_LOCAL_REPORT_SOURCE_FAST_INDEX",
    "STD-39 Executive Report Dashboard Scope Contract",
    'data-heu-executive-report-dashboard-scope-contract="STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT"',
    "PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT",
    "mark production GO",
  ],
  "Implementation log records STD-13/STD-24/STD-33/STD-39 report/source-map reliance guards.",
);

addStaticTextStatus(
  "REPORT-DASHBOARD-ADMISSIONS-DOCUMENT-QUEUE-PANEL",
  reportsOverviewPath,
  [
    'data-heu-admissions-document-review-report-panel="M05_ADMISSIONS_DOCUMENT_REVIEW_REPORT_PANEL"',
    'data-heu-admissions-document-review-report-panel-overflow-guard="M05_ADMISSIONS_DOCUMENT_REVIEW_REPORT_PANEL_NO_OVERFLOW"',
    'data-heu-admissions-document-review-report-view="RV_ADMISSIONS_DOCUMENT_REVIEW_QUEUE"',
    "M05_DOCUMENT_REVIEW_REPORT_VIEW",
    "ADMISSIONS_DOCUMENT_REVIEW_QUEUE_READY",
    "documentReviewRequiredCount",
    "review_required_count={formatCount(documentReviewRequiredCount)}",
    "Can owner xu ly",
    "So lead document-ready chua co document row trong scope bao cao.",
    "RV_ADMISSIONS_DOCUMENT_REVIEW_QUEUE",
    "DQ-RV-05A / ADM-DOC-EVID-01",
    "NO_RAW_EVIDENCE",
    "NO_DASHBOARD_RELIANCE",
    "NO_OWNER_GO",
    'withAdmissionSegmentParam("/documents", activeSegmentId)',
  ],
  "Reports overview exposes the admissions document review queue as read-only report-view routing.",
);

addStaticTextStatus(
  "REPORT-DASHBOARD-ADMISSIONS-OWNER-CLOSURE-PANEL",
  reportsOverviewPath,
  [
    'data-heu-admissions-owner-closure-report-panel="M05_ADMISSIONS_OWNER_CLOSURE_REPORT_PANEL"',
    'data-heu-admissions-owner-closure-report-panel-overflow-guard="M05_ADMISSIONS_OWNER_CLOSURE_REPORT_PANEL_NO_OVERFLOW"',
    'data-heu-admissions-owner-closure-report-view="RV_ADMISSIONS_OWNER_CLOSURE"',
    'data-heu-admissions-final-closure-gate="M05_ADMISSIONS_FINAL_MODULE_CLOSURE_GATE"',
    'data-heu-admissions-final-closure-overflow-guard="M05_ADMISSIONS_FINAL_CLOSURE_NO_OVERFLOW"',
    "M05_OWNER_CLOSURE_REPORT_VIEW",
    "ADMISSIONS_OWNER_CLOSURE_READY",
    "ADM-CLOSURE-01..08",
    "ADMISSIONS_SIGNED_UAT_EVIDENCE_READY",
    "ADM-UAT-EVID-01..08",
    "ADMISSIONS_FINAL_CLOSURE_READY",
    "ADMISSIONS_EXTERNAL_OWNER_ACTION_READY",
    "ADM-CLOSE-01..08",
    "ADM-OWNER-ACTION-01..08",
    "PENDING_EXTERNAL_FINAL_OWNER_QUORUM",
    "P3_01_P3_02_SIGNED_UAT_REQUIRED",
    "P0_19_PROOF_REQUIRED",
    "NO_OWNER_GO",
  ],
  "Reports overview exposes the admissions owner closure ledger as read-only blocker routing.",
);

addStaticTextStatus(
  "REPORT-DASHBOARD-CTHSSV-HANDOVER-STATUS-PANEL",
  reportsOverviewPath,
  [
    'data-heu-cthssv-report-status-panel="M06_CTHSSV_REPORT_STATUS_PANEL"',
    'data-heu-cthssv-report-status-panel-overflow-guard="M06_CTHSSV_REPORT_STATUS_PANEL_NO_OVERFLOW"',
    'data-heu-cthssv-report-status-report-view="RV_CTHSSV_HANDOVER_STATUS"',
    "M06_CTHSSV_REPORT_STATUS_VIEW",
    "CTHSSV_REPORTING_HANDOFF_READY",
    "RV_CTHSSV_HANDOVER_STATUS",
    "DQ-RV-10 / RV-EVID-08",
    "NO_REPORT_VIEW_RELIANCE",
    "NO_DASHBOARD_RELIANCE",
    "NO_OWNER_GO",
    "NO_GO_EXTERNAL",
    'withAdmissionSegmentParam("/cthssv", activeSegmentId)',
  ],
  "Reports overview exposes the CTHSSV handover status as read-only report-view routing.",
);

addStaticTextStatus(
  "REPORT-DASHBOARD-KHOA-GIANG-VIEN-STATUS-PANEL",
  reportsOverviewPath,
  [
    'data-heu-khoa-report-status-panel="P10-12_KHOA_REPORT_STATUS_PANEL"',
    'data-heu-khoa-report-status-panel-overflow-guard="P10-12_KHOA_REPORT_STATUS_PANEL_NO_OVERFLOW"',
    'data-heu-khoa-report-status-report-view="RV_KHOA_GIANG_VIEN_DELIVERY"',
    "P10-12_KHOA_REPORT_STATUS_VIEW",
    "KHOA_REPORT_STATUS_PANEL_READY",
    "KHOA_REPORTING_HANDOFF_READY",
    "RV_KHOA_GIANG_VIEN_DELIVERY",
    "DQ-RV-09 / RV-EVID-07",
    "NO_REPORT_VIEW_RELIANCE",
    "NO_DASHBOARD_RELIANCE",
    "NO_OWNER_GO",
    'withAdmissionSegmentParam("/khoa", activeSegmentId)',
  ],
  "Reports overview exposes the Khoa/Giang vien delivery status as read-only report-view routing.",
);

addStaticTextStatus(
  "REPORT-DASHBOARD-ADMISSIONS-DOCUMENT-QUEUE-COUNT",
  reportsPagePath,
  [
    "type LeadDocumentReportRow",
    "const documentReadyStatuses = new Set",
    ".from(\"lead_documents\")",
    ".select(\"lead_id,leads!inner(admission_segment_id)\")",
    "\"leads.admission_segment_id\"",
    "documentReviewRequiredCount",
    "documentReadyStatuses.has(lead.status)",
    "documentReviewRequiredCount={documentReviewRequiredCount}",
  ],
  "Reports page computes the admissions document review queue count from scoped leads and scoped document rows without rendering raw lead IDs.",
);

const localEnv = parseEnvFile(envPath);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "REPORT-DASHBOARD-ENV",
  missingKeys.length === 0 ? "READY" : "NO_GO",
  missingKeys.length === 0
    ? ".env.local has required Supabase env keys. Values are intentionally hidden."
    : `.env.local missing or placeholder keys: ${missingKeys.join(", ")}.`,
);

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

    const [
      { data: leads, error: leadsError },
      { data: activities, error: activitiesError },
      { data: documents, error: documentsError },
      { data: profiles, error: profilesError },
    ] = await Promise.all([
      adminClient
        .from("leads")
        .select("id,is_deleted,admission_segment_id,status"),
      adminClient
        .from("lead_activities")
        .select("id,lead_id,created_by,created_at"),
      adminClient
        .from("lead_documents")
        .select("id,lead_id,status,checked_at,checked_by"),
      adminClient.from("users_profile").select("id,status"),
    ]);

    if (leadsError) {
      addStatus(
        "REPORT-DASHBOARD-LEADS",
        "NO_GO",
        "Could not read leads. Raw errors are not printed.",
      );
    }

    if (activitiesError) {
      addStatus(
        "REPORT-DASHBOARD-ACTIVITY-ROWS",
        "NO_GO",
        "Could not read lead_activities. Raw errors are not printed.",
      );
    }

    if (documentsError) {
      addStatus(
        "REPORT-DASHBOARD-DOCUMENT-ROWS",
        "NO_GO",
        "Could not read lead_documents. Raw errors are not printed.",
      );
    }

    if (profilesError) {
      addStatus(
        "REPORT-DASHBOARD-PROFILES",
        "NO_GO",
        "Could not read users_profile. Raw errors are not printed.",
      );
    }

    if (leads && activities && documents && profiles) {
      const leadById = new Map(leads.map((lead) => [lead.id, lead]));
      const activeProfileIds = new Set(
        profiles.filter((profile) => profile.status === "ACTIVE").map((profile) => profile.id),
      );
      const activeLeads = leads.filter((lead) => lead.is_deleted === false);

      const orphanActivities = activities.filter(
        (activity) => !leadById.has(activity.lead_id),
      );
      const deletedLeadActivities = activities.filter(
        (activity) => leadById.get(activity.lead_id)?.is_deleted === true,
      );
      const missingSegmentActivities = activities.filter(
        (activity) => !leadById.get(activity.lead_id)?.admission_segment_id,
      );
      const missingActivityCreatedProfiles = activities.filter(
        (activity) =>
          activity.created_by && !activeProfileIds.has(activity.created_by),
      );
      const activityScopeFindings = [
        ...orphanActivities,
        ...deletedLeadActivities,
        ...missingSegmentActivities,
      ];

      const orphanDocuments = documents.filter(
        (document) => !leadById.has(document.lead_id),
      );
      const deletedLeadDocuments = documents.filter(
        (document) => leadById.get(document.lead_id)?.is_deleted === true,
      );
      const missingSegmentDocuments = documents.filter(
        (document) => !leadById.get(document.lead_id)?.admission_segment_id,
      );
      const missingDocumentCheckedProfiles = documents.filter(
        (document) =>
          document.checked_by && !activeProfileIds.has(document.checked_by),
      );
      const documentScopeFindings = [
        ...orphanDocuments,
        ...deletedLeadDocuments,
        ...missingSegmentDocuments,
      ];
      const checkedDocuments = documents.filter(
        (document) => document.status === "CHECKED",
      );

      addStatus(
        "REPORT-DASHBOARD-ACTIVE-LEADS",
        "READY",
        `Active non-deleted leads checked: ${activeLeads.length}.`,
      );

      addStatus(
        "REPORT-DASHBOARD-ACTIVITY-SCOPE",
        readyFromCount(activityScopeFindings.length),
        countDetail(
          "Dashboard activity rows point to active lead records with admission segment.",
          activityScopeFindings.length,
          "Activity rows orphaned, deleted-lead linked or missing lead segment",
        ) + sampleHashes(activityScopeFindings),
      );

      addStatus(
        "REPORT-DASHBOARD-DOCUMENT-SCOPE",
        readyFromCount(documentScopeFindings.length),
        countDetail(
          "Dashboard document rows point to active lead records with admission segment.",
          documentScopeFindings.length,
          "Document rows orphaned, deleted-lead linked or missing lead segment",
        ) + sampleHashes(documentScopeFindings),
      );

      addStatus(
        "REPORT-DASHBOARD-ACTOR-LINK",
        missingActivityCreatedProfiles.length === 0 &&
          missingDocumentCheckedProfiles.length === 0
          ? "READY"
          : "NO_GO",
        missingActivityCreatedProfiles.length === 0 &&
          missingDocumentCheckedProfiles.length === 0
          ? "Activity created_by and document checked_by references are either empty or active CRM profiles."
          : `Activity rows with missing created_by profile: ${missingActivityCreatedProfiles.length}; document rows with missing checked_by profile: ${missingDocumentCheckedProfiles.length}.`,
      );

      addStatus(
        "REPORT-DASHBOARD-SUMMARY",
        "READY",
        [
          `active_leads=${activeLeads.length}`,
          `lead_activities=${activities.length}`,
          `lead_documents=${documents.length}`,
          `checked_documents=${checkedDocuments.length}`,
        ].join("; "),
      );
    }
  } catch {
    addStatus(
      "REPORT-DASHBOARD-CHECK",
      "NO_GO",
      "Reports/dashboard readiness check could not complete. Check server env/project and database schema. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "REPORT-DASHBOARD-CHECK",
    "NO_GO",
    "Reports/dashboard checks were skipped because required env keys are missing.",
  );
}

console.log("HEU reports/dashboard scope readiness check");
console.log("Secrets, emails, names, phone numbers and raw lead IDs are never printed by this script.");

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
