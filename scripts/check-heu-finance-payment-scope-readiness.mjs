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
    .map((row) => hashLabel(row[key] ?? row.request_id ?? row.batch_id ?? JSON.stringify(row)));

  return hashes.length > 0
    ? ` Sample hashed row labels: ${hashes.join(", ")}.`
    : "";
}

function readyFromCount(count) {
  return count === 0 ? "READY" : "NO_GO";
}

function hasAllText(text, patterns) {
  return patterns.every((pattern) =>
    typeof pattern === "string" ? text.includes(pattern) : pattern.test(text),
  );
}

function checkFinanceRelianceSourceContract() {
  const executiveDashboard = read("components/dashboard/executive-dashboard-overview.tsx");
  const blueprint = read("docs/HEU_STANDARD_SYSTEM_BLUEPRINT_20260703.md");
  const implementationLog = read("docs/HEU_IMPLEMENTATION_LOG.md");

  const fastIndexDashboardReady = hasAllText(executiveDashboard, [
    /data-heu-executive-finance-reliance-fast-index="STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX"[\s\S]*data-heu-executive-finance-reliance-fast-index-boundary="PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX READ_ONLY FINANCE_RELIANCE_INDEX P2-18 P5-03 FIN_DAY1 ACCT_LOCAL P6-04 SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SIGNED_UAT_PENDING NO_DASHBOARD_RELIANCE NO_VOUCHER_POSTING NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-finance-reliance-fast-index-overflow-guard="STD-35_NO_OVERFLOW"/,
    "FIN-IDX-01",
    "FIN-IDX-02",
    "FIN-IDX-03",
    "FIN-IDX-04",
    "FIN-IDX-05",
    "FIN-IDX-06",
    "P2-18 accounting dashboard",
    "P5-03 Finance Desk",
    "Finance Day-1",
    "ACCT local readiness",
    "Payment request / payout",
    "Role/scope negative proof",
  ]);
  const fastIndexBlueprintReady = hasAllText(blueprint, [
    "STD-35",
    "STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX",
    "PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX",
    "FINANCE_RELIANCE_INDEX",
    "NO_PAYMENT_EXECUTION",
    "NO_STATUTORY_ACCOUNTING",
  ]);
  const fastIndexLogReady = hasAllText(implementationLog, [
    "STD-35 Executive Finance Reliance Fast Index",
    'data-heu-executive-finance-reliance-fast-index="STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX"',
    "FIN-IDX-01",
    "FIN-IDX-06",
    "PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX",
    "check:heu-executive-finance-reliance-fast-index-readiness",
    /does not[\s\S]*approve finance reliance/i,
    "mark production GO",
  ]);

  addStatus(
    "FINANCE-RELIANCE-FAST-INDEX",
    fastIndexDashboardReady && fastIndexBlueprintReady && fastIndexLogReady
      ? "READY"
      : "NO_GO",
    fastIndexDashboardReady && fastIndexBlueprintReady && fastIndexLogReady
      ? "STD-35 Finance reliance fast index is wired to dashboard, blueprint and implementation log."
      : "STD-35 Finance reliance fast index is missing dashboard, blueprint or implementation-log coverage.",
  );

  const dashboardReady = hasAllText(executiveDashboard, [
    /data-heu-executive-finance-source-contract="STD-15_FINANCE_RELIANCE_SOURCE_CONTRACT"[\s\S]*data-heu-executive-finance-source-boundary="READ_ONLY SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_VOUCHER_POSTING NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_PRODUCTION_GO"[\s\S]*data-heu-executive-finance-source-overflow-guard="STD-15_NO_OVERFLOW"/,
    "FIN-SRC-01",
    "FIN-SRC-02",
    "FIN-SRC-03",
    "FIN-SRC-04",
    "FIN-SRC-05",
    "P2-03 + P2-05 gate",
    "P2-10 payments",
    "P2-13 + P2-14 lock",
    "P2-15 + P2-16",
    "P2-17 record only",
    "No bank instruction, money movement or statutory voucher from dashboard/PASS_LOCAL.",
  ]);
  const blueprintReady = hasAllText(blueprint, [
    "STD-15",
    "STD-15_FINANCE_RELIANCE_SOURCE_CONTRACT",
    "PASS_LOCAL_FINANCE_RELIANCE_GUARD",
    "SOURCE_MAP_REQUIRED",
    "NO_PAYMENT_EXECUTION",
    "NO_STATUTORY_ACCOUNTING",
  ]);
  const logReady = hasAllText(implementationLog, [
    "STD-15 Finance Reliance Source Contract",
    'data-heu-executive-finance-source-contract="STD-15_FINANCE_RELIANCE_SOURCE_CONTRACT"',
    "FIN-SRC-01",
    "FIN-SRC-05",
    "PASS_LOCAL_FINANCE_RELIANCE_GUARD",
    "does not post vouchers",
    "mark production GO",
  ]);

  addStatus(
    "FINANCE-RELIANCE-SOURCE-CONTRACT",
    dashboardReady && blueprintReady && logReady ? "READY" : "NO_GO",
    dashboardReady && blueprintReady && logReady
      ? "STD-15 Finance reliance source contract is wired to dashboard, blueprint and implementation log."
      : "STD-15 Finance reliance source contract is missing dashboard, blueprint or implementation-log coverage.",
  );

  const triageDashboardReady = hasAllText(executiveDashboard, [
    /data-heu-executive-finance-reliance-triage="STD-26_EXECUTIVE_FINANCE_RELIANCE_TRIAGE"[\s\S]*data-heu-executive-finance-reliance-triage-boundary="PASS_LOCAL_FINANCE_RELIANCE_TRIAGE READ_ONLY P2-18 P5-03 FIN_DAY1 P6-04 SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SIGNED_UAT_PENDING NO_DASHBOARD_RELIANCE NO_VOUCHER_POSTING NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"[\s\S]*data-heu-executive-finance-reliance-triage-overflow-guard="STD-26_NO_OVERFLOW"/,
    "FIN-REL-01",
    "FIN-REL-02",
    "FIN-REL-03",
    "FIN-REL-04",
    "FIN-REL-05",
    "Signed P2-18/P5-03 route",
    "Finance Day-1 ledger route",
    "Role/scope negative proof",
    "Owner reliance decision",
    "Forbidden actions lock",
  ]);
  const triageBlueprintReady = hasAllText(blueprint, [
    "STD-26",
    "STD-26_EXECUTIVE_FINANCE_RELIANCE_TRIAGE",
    "PASS_LOCAL_FINANCE_RELIANCE_TRIAGE",
    "SIGNED_UAT_PENDING",
    "NO_FINANCE_RELIANCE",
  ]);
  const triageLogReady = hasAllText(implementationLog, [
    "STD-26 Executive Finance Reliance Triage",
    'data-heu-executive-finance-reliance-triage="STD-26_EXECUTIVE_FINANCE_RELIANCE_TRIAGE"',
    "FIN-REL-01",
    "FIN-REL-05",
    "PASS_LOCAL_FINANCE_RELIANCE_TRIAGE",
    "check:heu-executive-finance-reliance-triage-readiness",
    /does not[\s\S]*approve finance reliance/i,
    "mark production GO",
  ]);

  addStatus(
    "FINANCE-RELIANCE-DECISION-TRIAGE",
    triageDashboardReady && triageBlueprintReady && triageLogReady
      ? "READY"
      : "NO_GO",
    triageDashboardReady && triageBlueprintReady && triageLogReady
      ? "STD-26 Finance reliance decision triage is wired to dashboard, blueprint and implementation log."
      : "STD-26 Finance reliance decision triage is missing dashboard, blueprint or implementation-log coverage.",
  );
}

async function readScopedView(adminClient, viewName, keyColumn, targetSegmentId) {
  const { data, error } = await adminClient
    .from(viewName)
    .select(`${keyColumn},admission_segment_id`)
    .limit(1000);

  if (error) {
    addStatus(
      `FINANCE-PAYMENT-${viewName.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
      "NO_GO",
      `${viewName} could not be read with admission_segment_id. Raw errors are not printed.`,
    );
    return [];
  }

  const rows = data ?? [];
  const wrongScopeRows = rows.filter(
    (row) => row.admission_segment_id !== targetSegmentId,
  );
  const codeByView = {
    ttgdtx_partner_payment_request_candidates: "FINANCE-PAYMENT-CANDIDATE-SCOPE",
    ttgdtx_partner_payment_request_board: "FINANCE-PAYMENT-REQUEST-SCOPE",
    ttgdtx_partner_payment_approval_board: "FINANCE-PAYMENT-APPROVAL-SCOPE",
    ttgdtx_partner_payment_execution_board: "FINANCE-PAYMENT-EXECUTION-SCOPE",
  };

  addStatus(
    codeByView[viewName] ?? "FINANCE-PAYMENT-VIEW-SCOPE",
    readyFromCount(wrongScopeRows.length),
    wrongScopeRows.length === 0
      ? `${viewName} rows are scoped to TC9_TTGDTX_LINKED. Rows checked: ${rows.length}.`
      : `${viewName} has rows outside TC9_TTGDTX_LINKED: ${wrongScopeRows.length}.` +
          sampleHashes(wrongScopeRows, keyColumn),
  );

  return rows;
}

function checkSqlScopeGuards() {
  const step105 = read("database/step105_ttgdtx_partner_payment_request_p2_15.sql");
  const step106 = read("database/step106_ttgdtx_payment_request_approval_p2_16.sql");
  const step107 = read("database/step107_ttgdtx_payment_execution_p2_17.sql");
  const sqlReady =
    step105.includes("can_read_ttgdtx_partner_payment_scope") &&
    step105.includes(
      "public.can_read_ttgdtx_partner_payment_scope(admission_segment_id, partner_id)",
    ) &&
    step105.includes(
      "public.can_read_ttgdtx_partner_payment_scope(b.admission_segment_id, b.partner_id)",
    ) &&
    step105.includes(
      "public.can_read_ttgdtx_partner_payment_scope(request.admission_segment_id, request.partner_id)",
    ) &&
    step106.includes(
      "public.can_read_ttgdtx_partner_payment_scope(v_request.admission_segment_id, v_request.partner_id)",
    ) &&
    step107.includes(
      "public.can_read_ttgdtx_partner_payment_scope(admission_segment_id, partner_id)",
    ) &&
    step107.includes("d.admission_segment_id") &&
    step107.includes("join public.admission_segments s on s.id = d.admission_segment_id");

  addStatus(
    "FINANCE-PAYMENT-SQL-SCOPE-GUARD",
    sqlReady ? "READY" : "NO_GO",
    sqlReady
      ? "SQL source has scope-aware payment read guard, scoped policies/views and recent-disbursement segment columns."
      : "SQL source is missing one or more scope-aware payment guards.",
  );
}

const localEnv = parseEnvFile(envPath);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "FINANCE-PAYMENT-ENV",
  missingKeys.length === 0 ? "READY" : "NO_GO",
  missingKeys.length === 0
    ? ".env.local has required Supabase env keys. Values are intentionally hidden."
    : `.env.local missing or placeholder keys: ${missingKeys.join(", ")}.`,
);

checkSqlScopeGuards();
checkFinanceRelianceSourceContract();

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

    const { data: segment, error: segmentError } = await adminClient
      .from("admission_segments")
      .select("id,segment_code,status")
      .eq("segment_code", "TC9_TTGDTX_LINKED")
      .eq("status", "ACTIVE")
      .maybeSingle();

    addStatus(
      "FINANCE-PAYMENT-TC9-SEGMENT",
      !segmentError && segment?.id ? "READY" : "NO_GO",
      !segmentError && segment?.id
        ? "TC9_TTGDTX_LINKED active segment is available for finance/payment scope checks."
        : "Could not find active TC9_TTGDTX_LINKED segment. Raw errors are not printed.",
    );

    if (segment?.id) {
      const [candidateRows, requestRows] = await Promise.all([
        readScopedView(
          adminClient,
          "ttgdtx_partner_payment_request_candidates",
          "batch_id",
          segment.id,
        ),
        readScopedView(
          adminClient,
          "ttgdtx_partner_payment_request_board",
          "request_id",
          segment.id,
        ),
      ]);
      const [approvalRows, executionRows] = await Promise.all([
        readScopedView(
          adminClient,
          "ttgdtx_partner_payment_approval_board",
          "request_id",
          segment.id,
        ),
        readScopedView(
          adminClient,
          "ttgdtx_partner_payment_execution_board",
          "request_id",
          segment.id,
        ),
      ]);

      const scopedRequestIds = new Set(
        requestRows
          .filter((row) => row.admission_segment_id === segment.id)
          .map((row) => row.request_id),
      );
      const recentWithSegment = await adminClient
        .from("ttgdtx_partner_payment_disbursement_recent")
        .select("disbursement_id,request_id,admission_segment_id")
        .limit(1000);
      let recentRows = recentWithSegment.data ?? [];

      if (recentWithSegment.error) {
        const recentFallback = await adminClient
          .from("ttgdtx_partner_payment_disbursement_recent")
          .select("disbursement_id,request_id")
          .limit(1000);

        if (recentFallback.error) {
          addStatus(
            "FINANCE-PAYMENT-RECENT-UI-SCOPE",
            "NO_GO",
            "Could not read recent payment disbursement view. Raw errors are not printed.",
          );
        } else {
          recentRows = recentFallback.data ?? [];
          const visibleRows = recentRows.filter((row) =>
            scopedRequestIds.has(row.request_id),
          );
          addStatus(
            "FINANCE-PAYMENT-RECENT-UI-SCOPE",
            "READY",
            `Current DB recent-disbursement view has no admission_segment_id, so UI must filter by scoped request_id. Recent rows checked: ${recentRows.length}; visible after UI scope filter: ${visibleRows.length}; hidden by UI scope filter: ${recentRows.length - visibleRows.length}.`,
          );
        }
      } else {
        const wrongRecentRows = recentRows.filter(
          (row) => row.admission_segment_id !== segment.id,
        );
        addStatus(
          "FINANCE-PAYMENT-RECENT-UI-SCOPE",
          readyFromCount(wrongRecentRows.length),
          wrongRecentRows.length === 0
            ? `Recent disbursement view rows expose and match TC9_TTGDTX_LINKED segment. Rows checked: ${recentRows.length}.`
            : `Recent disbursement view has rows outside TC9_TTGDTX_LINKED: ${wrongRecentRows.length}.` +
                sampleHashes(wrongRecentRows, "disbursement_id"),
        );
      }

      const [
        { data: paymentRequests, error: requestTableError },
        { data: disbursements, error: disbursementTableError },
        { data: profiles, error: profileError },
      ] = await Promise.all([
        adminClient
          .from("ttgdtx_partner_payment_requests")
          .select("id,created_by,updated_by,admission_segment_id,record_status")
          .eq("record_status", "ACTIVE"),
        adminClient
          .from("ttgdtx_partner_payment_disbursements")
          .select("id,created_by,admission_segment_id,record_status")
          .eq("record_status", "ACTIVE"),
        adminClient.from("users_profile").select("id,status"),
      ]);

      if (requestTableError || disbursementTableError || profileError) {
        addStatus(
          "FINANCE-PAYMENT-ACTOR-LINK",
          "NO_GO",
          "Could not read payment actor/source tables. Raw errors are not printed.",
        );
      } else {
        const activeProfileIds = new Set(
          (profiles ?? [])
            .filter((profile) => profile.status === "ACTIVE")
            .map((profile) => profile.id),
        );
        const requestActorFindings = (paymentRequests ?? []).filter(
          (row) =>
            (row.created_by && !activeProfileIds.has(row.created_by)) ||
            (row.updated_by && !activeProfileIds.has(row.updated_by)),
        );
        const disbursementActorFindings = (disbursements ?? []).filter(
          (row) => row.created_by && !activeProfileIds.has(row.created_by),
        );

        addStatus(
          "FINANCE-PAYMENT-ACTOR-LINK",
          requestActorFindings.length === 0 &&
            disbursementActorFindings.length === 0
            ? "READY"
            : "NO_GO",
          requestActorFindings.length === 0 &&
            disbursementActorFindings.length === 0
            ? "Payment request and disbursement actor references are either empty or active CRM profiles."
            : `Payment request actor findings: ${requestActorFindings.length}; disbursement actor findings: ${disbursementActorFindings.length}.`,
        );
      }

      addStatus(
        "FINANCE-PAYMENT-SUMMARY",
        "READY",
        [
          `candidate_rows=${candidateRows.length}`,
          `request_rows=${requestRows.length}`,
          `approval_rows=${approvalRows.length}`,
          `execution_rows=${executionRows.length}`,
          `recent_rows=${recentRows.length}`,
        ].join("; "),
      );
    }
  } catch {
    addStatus(
      "FINANCE-PAYMENT-CHECK",
      "NO_GO",
      "Finance/payment readiness check could not complete. Check server env/project and database schema. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "FINANCE-PAYMENT-CHECK",
    "NO_GO",
    "Finance/payment checks were skipped because required env keys are missing.",
  );
}

console.log("HEU finance/payment scope readiness check");
console.log("Secrets, emails, names, phone numbers, bank accounts, vouchers and raw IDs are never printed by this script.");

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
