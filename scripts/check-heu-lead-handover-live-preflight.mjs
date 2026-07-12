import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const envPath = path.resolve(
  process.cwd(),
  process.env.HEU_ENV_FILE || ".env.local",
);
const readyStatuses = new Set([
  "DOCUMENT_SUBMITTED",
  "ELIGIBLE",
  "ENROLLED",
]);

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

function normalize(value) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function gateMatches(gate, leadMajor) {
  const expected = normalize(leadMajor);
  return [
    gate.nganh_id,
    gate.major_code,
    gate.ten_nganh_tu_van,
    gate.ten_nganh_phap_ly,
  ].some((value) => normalize(value) === expected);
}

function fail(code) {
  console.error(`NO_GO LEAD-HANDOVER-LIVE-PREFLIGHT-${code}`);
  process.exitCode = 1;
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
  const { data: segment, error: segmentError } = await client
    .from("admission_segments")
    .select("id")
    .eq("segment_code", "TC9_TTGDTX_LINKED")
    .eq("status", "ACTIVE")
    .maybeSingle();
  if (segmentError || !segment) {
    fail("SEGMENT");
  } else {
    const [leadsResult, checklistsResult, gatesResult] = await Promise.all([
      client
        .from("leads")
        .select("id,status,interested_program,interested_major")
        .eq("admission_segment_id", segment.id)
        .eq("is_deleted", false),
      client
        .from("enrollment_checklists")
        .select("id,applies_to_program")
        .eq("is_required", true)
        .eq("status", "ACTIVE"),
      client
        .from("major_legal_tuition_gate_readable")
        .select(
          "nganh_id,major_code,ten_nganh_tu_van,ten_nganh_phap_ly,legal_status,tuition_status,handover_gate,control_status",
        )
        .eq("status", "ACTIVE"),
    ]);
    if (leadsResult.error || checklistsResult.error || gatesResult.error) {
      fail("BASE-METADATA");
    } else {
      const leads = leadsResult.data ?? [];
      const leadIds = leads.map((lead) => lead.id);
      const [documentsResult, handoversResult] = leadIds.length
        ? await Promise.all([
            client
              .from("lead_documents")
              .select("lead_id,checklist_id,status,checked_by,checked_at")
              .in("lead_id", leadIds),
            client
              .from("lead_handovers")
              .select("lead_id,handover_type,handover_status,status")
              .in("lead_id", leadIds)
              .eq("status", "ACTIVE"),
          ])
        : [
            { data: [], error: null },
            { data: [], error: null },
          ];
      if (documentsResult.error || handoversResult.error) {
        fail("PACKET-METADATA");
      } else {
        const documentsByLead = new Map();
        for (const document of documentsResult.data ?? []) {
          const rows = documentsByLead.get(document.lead_id) ?? [];
          rows.push(document);
          documentsByLead.set(document.lead_id, rows);
        }
        const activeHandoverLeadIds = new Set(
          (handoversResult.data ?? [])
            .filter((row) =>
              ["REQUESTED", "ACCEPTED"].includes(row.handover_status),
            )
            .map((row) => row.lead_id),
        );

        let statusReady = 0;
        let programReady = 0;
        let checklistReady = 0;
        let documentsReady = 0;
        let gateReady = 0;
        let duplicateFree = 0;
        let handoverReady = 0;

        for (const lead of leads) {
          const hasReadyStatus = readyStatuses.has(lead.status);
          if (hasReadyStatus) statusReady += 1;
          const hasProgram = Boolean(lead.interested_program);
          if (hasReadyStatus && hasProgram) programReady += 1;
          const normalizedProgram = normalize(lead.interested_program);
          const requiredChecklistIds = new Set(
            (checklistsResult.data ?? [])
              .filter((row) => {
                const appliesToProgram = normalize(row.applies_to_program);
                return !appliesToProgram || appliesToProgram === normalizedProgram;
              })
              .map((row) => row.id),
          );
          const hasChecklist = requiredChecklistIds.size > 0;
          if (hasReadyStatus && hasProgram && hasChecklist) checklistReady += 1;
          const checkedChecklistIds = new Set(
            (documentsByLead.get(lead.id) ?? [])
              .filter(
                (row) =>
                  row.checklist_id &&
                  row.status === "CHECKED" &&
                  row.checked_by &&
                  row.checked_at,
              )
              .map((row) => row.checklist_id),
          );
          const hasDocuments =
            hasChecklist &&
            [...requiredChecklistIds].every((id) => checkedChecklistIds.has(id));
          if (hasReadyStatus && hasProgram && hasDocuments) documentsReady += 1;
          const gate = (gatesResult.data ?? []).find((row) =>
            gateMatches(row, lead.interested_major),
          );
          const hasGate = Boolean(
            gate &&
              gate.control_status !== "CHUA_DU_DIEU_KIEN" &&
              gate.legal_status === "VERIFIED" &&
              gate.tuition_status === "CONFIGURED" &&
              gate.handover_gate === "ALLOW_HANDOVER",
          );
          if (hasReadyStatus && hasProgram && hasDocuments && hasGate) {
            gateReady += 1;
          }
          const noActiveHandover = !activeHandoverLeadIds.has(lead.id);
          if (noActiveHandover) duplicateFree += 1;
          if (
            hasReadyStatus &&
            hasProgram &&
            hasDocuments &&
            hasGate &&
            noActiveHandover
          ) {
            handoverReady += 1;
          }
        }

        console.log("HEU lead handover live preflight (METADATA_ONLY)");
        console.log(
          `segment=TC9_TTGDTX_LINKED; leads=${leads.length}; status_ready=${statusReady}; program_ready=${programReady}; checklist_ready=${checklistReady}; documents_ready=${documentsReady}; legal_handover_gate_ready=${gateReady}; duplicate_free=${duplicateFree}; handover_ready=${handoverReady}`,
        );
        console.log(
          "pii_columns_read=0; row_payload_output=0; mutation=0; finance_mutation=0; ai_runtime=0",
        );
        if (handoverReady === 0) {
          fail("NO-ELIGIBLE-PACKET");
        } else {
          console.log(
            "READY LEAD-HANDOVER-LIVE-PREFLIGHT: owner may select a controlled packet for multi-role UAT; no handover was created.",
          );
        }
      }
    }
  }
}
