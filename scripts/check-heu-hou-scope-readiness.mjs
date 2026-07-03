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
    .map((row) => hashLabel(row[key] ?? row.lead_id ?? row.claim_id ?? JSON.stringify(row)));

  return hashes.length > 0
    ? ` Sample hashed row labels: ${hashes.join(", ")}.`
    : "";
}

function readyFromCount(count) {
  return count === 0 ? "READY" : "NO_GO";
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isHouLead(lead) {
  const searchText = normalizeText(
    [lead.interested_program, lead.interested_major].filter(Boolean).join(" "),
  );

  return Boolean(
    lead.hou_program_id ||
      lead.hou_major_id ||
      lead.hou_location_id ||
      lead.hou_stage_id ||
      searchText.includes("hou") ||
      searchText.includes("lien thong") ||
      searchText.includes("dai hoc tu xa"),
  );
}

function checkAppScopeGuards() {
  const page = read("app/hou/page.tsx");
  const actions = read("app/hou/actions.ts");
  const packageJson = JSON.parse(read("package.json"));

  const pageReady =
    page.includes("getAdmissionWorkspaceContext") &&
    page.includes("admissionWorkspaceSegmentIds") &&
    page.includes("applyAdmissionSegmentIds") &&
    page.includes("admission_segment_id") &&
    page.includes('withAdmissionSegmentParam("/hou", workspace.activeSegmentId)') &&
    page.includes("workspaceSegmentId={workspace.activeSegmentId}") &&
    page.includes("workspaceReturnTo={refreshHref}") &&
    page.includes('.in("claim_line_id", scopedClaimLineIds)') &&
    page.includes('.in("id", scopedPaymentBatchIds)');
  const actionReady =
    actions.includes("getHouClaimsWorkspaceScopeError") &&
    actions.includes("getHouClaimLinesWorkspaceScopeError") &&
    actions.includes("can_use_admission_workspace") &&
    actions.includes("can_access_business_scope") &&
    actions.includes("await getHouClaimsWorkspaceScopeError(supabase, [claim.id])") &&
    actions.includes("claimLines.map((line) => line.claim_id)") &&
    actions.includes("await getHouClaimLinesWorkspaceScopeError(");
  const packageReady =
    packageJson.scripts?.["check:heu-hou-scope-readiness"] ===
    "node scripts/check-heu-hou-scope-readiness.mjs";

  addStatus(
    "HOU-SCOPE-APP-GUARD",
    pageReady && actionReady && packageReady ? "READY" : "NO_GO",
    pageReady && actionReady && packageReady
      ? "HOU page, COM actions and package script include admission workspace scope guards."
      : "HOU page, COM actions or package script are missing one or more scope guards.",
  );
}

const localEnv = parseEnvFile(envPath);
const missingKeys = requiredEnvKeys.filter((key) => !isMeaningfulSecret(localEnv[key]));

addStatus(
  "HOU-SCOPE-ENV",
  missingKeys.length === 0 ? "READY" : "NO_GO",
  missingKeys.length === 0
    ? ".env.local has required Supabase env keys. Values are intentionally hidden."
    : `.env.local missing or placeholder keys: ${missingKeys.join(", ")}.`,
);

checkAppScopeGuards();

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
      .eq("segment_code", "UNIVERSITY_TRANSFER_HOU")
      .eq("status", "ACTIVE")
      .maybeSingle();

    addStatus(
      "HOU-SCOPE-SEGMENT",
      !segmentError && segment?.id ? "READY" : "NO_GO",
      !segmentError && segment?.id
        ? "UNIVERSITY_TRANSFER_HOU active segment is available for HOU scope checks."
        : "Could not find active UNIVERSITY_TRANSFER_HOU segment. Raw errors are not printed.",
    );

    if (segment?.id) {
      const [
        { data: leads, error: leadsError },
        { data: evidenceFiles, error: evidenceError },
        { data: claims, error: claimsError },
        { data: claimLines, error: claimLinesError },
        { data: paymentLines, error: paymentLinesError },
        { data: paymentBatches, error: paymentBatchesError },
        { data: profiles, error: profilesError },
      ] = await Promise.all([
        adminClient
          .from("leads")
          .select(
            "id,is_deleted,admission_segment_id,partner_id,interested_program,interested_major,hou_program_id,hou_major_id,hou_location_id,hou_stage_id",
          ),
        adminClient
          .from("hou_evidence_files")
          .select("id,lead_id,claim_id,evidence_scope,status")
          .eq("status", "ACTIVE"),
        adminClient
          .from("hou_commission_claims")
          .select("id,lead_id,claim_status,approved_by")
          .neq("claim_status", "CANCELLED"),
        adminClient
          .from("hou_commission_claim_lines")
          .select("id,claim_id,line_status")
          .neq("line_status", "CANCELLED"),
        adminClient
          .from("hou_commission_payment_lines")
          .select("id,payment_batch_id,claim_line_id,status")
          .neq("status", "CANCELLED"),
        adminClient
          .from("hou_commission_payment_batches")
          .select("id,requested_by,approved_by,paid_by,status")
          .neq("status", "CANCELLED"),
        adminClient.from("users_profile").select("id,status"),
      ]);

      if (
        leadsError ||
        evidenceError ||
        claimsError ||
        claimLinesError ||
        paymentLinesError ||
        paymentBatchesError ||
        profilesError
      ) {
        addStatus(
          "HOU-SCOPE-TABLE-READ",
          "NO_GO",
          "Could not read one or more HOU scope tables. Raw errors are not printed.",
        );
      } else {
        const activeLeads = (leads ?? []).filter((lead) => lead.is_deleted === false);
        const houLeads = activeLeads.filter(isHouLead);
        const scopedHouLeadIds = new Set(
          houLeads
            .filter((lead) => lead.admission_segment_id === segment.id)
            .map((lead) => lead.id),
        );
        const wrongSegmentLeads = houLeads.filter(
          (lead) => lead.admission_segment_id !== segment.id,
        );

        addStatus(
          "HOU-SCOPE-LEAD-TAG",
          readyFromCount(wrongSegmentLeads.length),
          wrongSegmentLeads.length === 0
            ? `HOU-marked active leads are tagged to UNIVERSITY_TRANSFER_HOU. Rows checked: ${houLeads.length}.`
            : `HOU-marked active leads outside UNIVERSITY_TRANSFER_HOU: ${wrongSegmentLeads.length}.` +
                sampleHashes(wrongSegmentLeads),
        );

        const scopedClaimIds = new Set(
          (claims ?? [])
            .filter((claim) => claim.lead_id && scopedHouLeadIds.has(claim.lead_id))
            .map((claim) => claim.id),
        );
        const unscopedClaims = (claims ?? []).filter(
          (claim) => !claim.lead_id || !scopedHouLeadIds.has(claim.lead_id),
        );

        addStatus(
          "HOU-SCOPE-CLAIMS",
          readyFromCount(unscopedClaims.length),
          unscopedClaims.length === 0
            ? `Active HOU commission claims point to scoped HOU leads. Rows checked: ${(claims ?? []).length}.`
            : `Active HOU commission claims missing a scoped HOU lead: ${unscopedClaims.length}.` +
                sampleHashes(unscopedClaims),
        );

        const scopedClaimLineIds = new Set(
          (claimLines ?? [])
            .filter((line) => scopedClaimIds.has(line.claim_id))
            .map((line) => line.id),
        );
        const unscopedClaimLines = (claimLines ?? []).filter(
          (line) => !scopedClaimIds.has(line.claim_id),
        );

        addStatus(
          "HOU-SCOPE-CLAIM-LINES",
          readyFromCount(unscopedClaimLines.length),
          unscopedClaimLines.length === 0
            ? `Active HOU commission claim lines point to scoped claims. Rows checked: ${(claimLines ?? []).length}.`
            : `Active HOU claim lines missing a scoped claim: ${unscopedClaimLines.length}.` +
                sampleHashes(unscopedClaimLines),
        );

        const unscopedPaymentLines = (paymentLines ?? []).filter(
          (line) => !scopedClaimLineIds.has(line.claim_line_id),
        );
        const scopedPaymentBatchIds = new Set(
          (paymentLines ?? [])
            .filter((line) => scopedClaimLineIds.has(line.claim_line_id))
            .map((line) => line.payment_batch_id),
        );
        const unscopedPaymentBatches = (paymentBatches ?? []).filter(
          (batch) => !scopedPaymentBatchIds.has(batch.id),
        );

        addStatus(
          "HOU-SCOPE-PAYMENT-LINES",
          readyFromCount(unscopedPaymentLines.length),
          unscopedPaymentLines.length === 0
            ? `Active HOU payment lines point to scoped claim lines. Rows checked: ${(paymentLines ?? []).length}.`
            : `Active HOU payment lines missing a scoped claim line: ${unscopedPaymentLines.length}.` +
                sampleHashes(unscopedPaymentLines),
        );

        addStatus(
          "HOU-SCOPE-PAYMENT-BATCHES",
          readyFromCount(unscopedPaymentBatches.length),
          unscopedPaymentBatches.length === 0
            ? `Active HOU payment batches have scoped active payment lines. Rows checked: ${(paymentBatches ?? []).length}.`
            : `Active HOU payment batches without scoped active payment lines: ${unscopedPaymentBatches.length}.` +
                sampleHashes(unscopedPaymentBatches),
        );

        const evidenceWithScopeTarget = (evidenceFiles ?? []).filter(
          (evidence) => evidence.lead_id || evidence.claim_id,
        );
        const unscopedEvidence = evidenceWithScopeTarget.filter(
          (evidence) =>
            (evidence.lead_id && !scopedHouLeadIds.has(evidence.lead_id)) ||
            (evidence.claim_id && !scopedClaimIds.has(evidence.claim_id)),
        );

        addStatus(
          "HOU-SCOPE-EVIDENCE",
          readyFromCount(unscopedEvidence.length),
          unscopedEvidence.length === 0
            ? `Active lead/claim HOU evidence points to scoped leads or claims. Rows checked: ${evidenceWithScopeTarget.length}.`
            : `Active HOU evidence rows missing a scoped lead/claim: ${unscopedEvidence.length}.` +
                sampleHashes(unscopedEvidence),
        );

        const activeProfileIds = new Set(
          (profiles ?? [])
            .filter((profile) => profile.status === "ACTIVE")
            .map((profile) => profile.id),
        );
        const claimActorFindings = (claims ?? []).filter(
          (claim) => claim.approved_by && !activeProfileIds.has(claim.approved_by),
        );
        const batchActorFindings = (paymentBatches ?? []).filter(
          (batch) =>
            (batch.requested_by && !activeProfileIds.has(batch.requested_by)) ||
            (batch.approved_by && !activeProfileIds.has(batch.approved_by)) ||
            (batch.paid_by && !activeProfileIds.has(batch.paid_by)),
        );

        addStatus(
          "HOU-SCOPE-ACTOR-LINK",
          claimActorFindings.length === 0 && batchActorFindings.length === 0
            ? "READY"
            : "NO_GO",
          claimActorFindings.length === 0 && batchActorFindings.length === 0
            ? "HOU claim and payment batch actor references are either empty or active CRM profiles."
            : `HOU claim actor findings: ${claimActorFindings.length}; HOU payment batch actor findings: ${batchActorFindings.length}.`,
        );

        addStatus(
          "HOU-SCOPE-SUMMARY",
          "READY",
          [
            `hou_leads=${houLeads.length}`,
            `claims=${(claims ?? []).length}`,
            `claim_lines=${(claimLines ?? []).length}`,
            `payment_lines=${(paymentLines ?? []).length}`,
            `payment_batches=${(paymentBatches ?? []).length}`,
          ].join("; "),
        );
      }
    }
  } catch {
    addStatus(
      "HOU-SCOPE-CHECK",
      "NO_GO",
      "HOU scope readiness check could not complete. Check server env/project and database schema. Raw errors are not printed.",
    );
  }
} else {
  addStatus(
    "HOU-SCOPE-CHECK",
    "NO_GO",
    "HOU scope checks were skipped because required env keys are missing.",
  );
}

console.log("HEU HOU scope readiness check");
console.log(
  "Secrets, emails, names, phone numbers, bank accounts, vouchers and raw IDs are never printed by this script.",
);

for (const item of statuses) {
  console.log(`${item.status} ${item.code}: ${item.detail}`);
}

if (statuses.some((item) => item.status !== "READY")) {
  process.exitCode = 1;
}
