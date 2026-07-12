import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const envPath = path.resolve(
  process.cwd(),
  process.env.HEU_ENV_FILE || ".env.local",
);

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [
          line.slice(0, separator).trim(),
          line.slice(separator + 1).trim().replace(/^["']|["']$/g, ""),
        ];
      }),
  );
}

function fail(code) {
  console.error(`NO_GO ADMISSION-LIFECYCLE-LIVE-${code}`);
  process.exitCode = 1;
}

async function scopedRows(client, table, select, leadIds) {
  if (leadIds.length === 0) return { rows: [], error: false };
  const { data, error } = await client
    .from(table)
    .select(select)
    .in("lead_id", leadIds);
  return { rows: data ?? [], error: Boolean(error) };
}

const env = parseEnv(envPath);
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  fail("ENV");
} else {
  const client = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const [segmentResult, departmentResult] = await Promise.all([
    client
      .from("admission_segments")
      .select("id")
      .eq("segment_code", "TC9_TTGDTX_LINKED")
      .eq("status", "ACTIVE")
      .maybeSingle(),
    client
      .from("admission_departments")
      .select("id")
      .eq("code", "ADMISSION")
      .maybeSingle(),
  ]);
  if (
    segmentResult.error ||
    departmentResult.error ||
    !segmentResult.data ||
    !departmentResult.data
  ) {
    fail("SEGMENT-OR-DEPARTMENT");
  } else {
    const { data: leads, error: leadsError } = await client
      .from("leads")
      .select("id,status,assigned_to")
      .eq("admission_segment_id", segmentResult.data.id)
      .eq("is_deleted", false);
    if (leadsError) {
      fail("LEADS");
    } else {
      const leadRows = leads ?? [];
      const leadIds = leadRows.map((row) => row.id);
      const assigneeIds = [
        ...new Set(leadRows.map((row) => row.assigned_to).filter(Boolean)),
      ];
      const profilesResult = assigneeIds.length
        ? await client
            .from("users_profile")
            .select("id,status,department_id")
            .in("id", assigneeIds)
        : { data: [], error: null };
      const [activities, followups, documents, handovers] = await Promise.all([
        scopedRows(client, "lead_activities", "id,lead_id", leadIds),
        scopedRows(client, "lead_followups", "id,lead_id", leadIds),
        scopedRows(client, "lead_documents", "id,lead_id", leadIds),
        scopedRows(
          client,
          "lead_handovers",
          "id,lead_id,handover_status,handover_type",
          leadIds,
        ),
      ]);
      if (
        profilesResult.error ||
        activities.error ||
        followups.error ||
        documents.error ||
        handovers.error
      ) {
        fail("RELATED-METADATA");
      } else {
        const profilesById = new Map(
          (profilesResult.data ?? []).map((row) => [row.id, row]),
        );
        const actorReadyLeadIds = new Set(
          leadRows
            .filter((lead) => {
              const profile = profilesById.get(lead.assigned_to);
              return (
                profile?.status === "ACTIVE" &&
                profile.department_id === departmentResult.data.id
              );
            })
            .map((lead) => lead.id),
        );
        const consultationLeadIds = new Set([
          ...activities.rows.map((row) => row.lead_id),
          ...followups.rows.map((row) => row.lead_id),
        ]);
        const documentLeadIds = new Set(documents.rows.map((row) => row.lead_id));
        const handoverLeadIds = new Set(handovers.rows.map((row) => row.lead_id));
        const submittedOrLater = new Set([
          "DOCUMENT_SUBMITTED",
          "ELIGIBLE",
          "ENROLLED",
        ]);
        const submittedLeadCount = leadRows.filter((lead) =>
          submittedOrLater.has(lead.status),
        ).length;

        console.log("HEU admission pilot lifecycle live readiness (METADATA_ONLY)");
        console.log(
          `segment=TC9_TTGDTX_LINKED; leads=${leadRows.length}; actor_ready_leads=${actorReadyLeadIds.size}; consultation_leads=${consultationLeadIds.size}; document_rows=${documents.rows.length}; document_leads=${documentLeadIds.size}; submitted_or_later=${submittedLeadCount}; handover_rows=${handovers.rows.length}; handover_leads=${handoverLeadIds.size}`,
        );
        console.log(
          "pii_columns_read=0; row_payload_output=0; mutation=0; finance_mutation=0; ai_runtime=0",
        );

        const blockers = [];
        if (leadRows.length === 0) blockers.push("NO_SCOPED_LEAD");
        if (actorReadyLeadIds.size === 0) blockers.push("NO_ACTIVE_ADMISSION_ACTOR");
        if (consultationLeadIds.size === 0) blockers.push("NO_CONSULTATION_TRACE");
        if (documents.rows.length === 0) blockers.push("NO_DOCUMENT_TRACE");
        if (submittedLeadCount === 0) blockers.push("NO_SUBMITTED_STATUS");
        if (handovers.rows.length === 0) blockers.push("NO_HANDOVER_TRACE");

        if (blockers.length > 0) {
          console.error(
            `NO_GO ADMISSION-LIFECYCLE-LIVE: blockers=${blockers.join(",")}`,
          );
          process.exitCode = 1;
        } else {
          console.log(
            "READY ADMISSION-LIFECYCLE-LIVE: controlled multi-role UAT may continue; acceptance and production remain NO_GO.",
          );
        }
      }
    }
  }
}
