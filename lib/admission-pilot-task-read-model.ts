import type { SupabaseClient } from "@supabase/supabase-js";

export const ADMISSION_PILOT_TASK_LIVE_SUMMARY =
  "ADMISSION_PILOT_TASK_LIVE_SUMMARY";
export const ADMISSION_PILOT_TASK_LEAD_LIMIT = 100;

type LeadRow = {
  id: string;
  status: string;
  assigned_to: string | null;
  interested_program: string | null;
};

type ChecklistRow = {
  id: string;
  applies_to_program: string | null;
};

type DocumentRow = {
  lead_id: string;
  checklist_id: string | null;
  status: string;
  checked_by: string | null;
  checked_at: string | null;
};

export type AdmissionPilotTaskLiveSummary = {
  mode: typeof ADMISSION_PILOT_TASK_LIVE_SUMMARY;
  status: "DISABLED" | "NO_SCOPE" | "UNAVAILABLE" | "READY";
  databaseReadExecuted: boolean;
  reason: string;
  totalLeadCount: number;
  missingActorCount: number;
  documentCandidateCount: number;
  documentBlockedCount: number;
  handoverReadyCount: number;
};

type ReadOptions = {
  enabled: boolean;
  admissionSegmentId: string | null;
};

const handoverStatuses = new Set([
  "DOCUMENT_SUBMITTED",
  "ELIGIBLE",
  "ENROLLED",
]);

function emptyResult(
  status: AdmissionPilotTaskLiveSummary["status"],
  reason: string,
  databaseReadExecuted = false,
): AdmissionPilotTaskLiveSummary {
  return {
    mode: ADMISSION_PILOT_TASK_LIVE_SUMMARY,
    status,
    databaseReadExecuted,
    reason,
    totalLeadCount: 0,
    missingActorCount: 0,
    documentCandidateCount: 0,
    documentBlockedCount: 0,
    handoverReadyCount: 0,
  };
}

export async function readAdmissionPilotTaskLiveSummary(
  client: SupabaseClient,
  options: ReadOptions,
): Promise<AdmissionPilotTaskLiveSummary> {
  if (!options.enabled) {
    return emptyResult("DISABLED", "Admission lane is not visible for this user.");
  }
  if (!options.admissionSegmentId) {
    return emptyResult(
      "NO_SCOPE",
      "No active admission segment; broad fallback is forbidden.",
    );
  }

  const [leadsResult, checklistsResult] = await Promise.all([
    client
      .from("leads")
      .select("id,status,assigned_to,interested_program")
      .eq("admission_segment_id", options.admissionSegmentId)
      .eq("is_deleted", false)
      .limit(ADMISSION_PILOT_TASK_LEAD_LIMIT),
    client
      .from("enrollment_checklists")
      .select("id,applies_to_program")
      .eq("is_required", true)
      .eq("status", "ACTIVE"),
  ]);

  if (leadsResult.error || checklistsResult.error) {
    return emptyResult(
      "UNAVAILABLE",
      "Scoped admission metadata could not be read; no broad fallback.",
      true,
    );
  }

  const leads = (leadsResult.data ?? []) as LeadRow[];
  const checklists = (checklistsResult.data ?? []) as ChecklistRow[];
  const leadIds = leads.map((lead) => lead.id);
  let documents: DocumentRow[] = [];

  if (leadIds.length > 0) {
    const documentsResult = await client
      .from("lead_documents")
      .select("lead_id,checklist_id,status,checked_by,checked_at")
      .in("lead_id", leadIds);
    if (documentsResult.error) {
      return emptyResult(
        "UNAVAILABLE",
        "Scoped document metadata could not be read; no broad fallback.",
        true,
      );
    }
    documents = (documentsResult.data ?? []) as DocumentRow[];
  }

  const checkedByLead = new Map<string, Set<string>>();
  for (const document of documents) {
    if (
      document.checklist_id &&
      document.status === "CHECKED" &&
      document.checked_by &&
      document.checked_at
    ) {
      const checkedIds = checkedByLead.get(document.lead_id) ?? new Set<string>();
      checkedIds.add(document.checklist_id);
      checkedByLead.set(document.lead_id, checkedIds);
    }
  }

  const documentCandidates = leads.filter((lead) =>
    handoverStatuses.has(lead.status),
  );
  const handoverReadyCount = documentCandidates.filter((lead) => {
    const normalizedProgram = lead.interested_program?.trim().toUpperCase();
    if (!normalizedProgram) return false;
    const requiredIds = checklists
      .filter((checklist) => {
        const appliesToProgram = checklist.applies_to_program
          ?.trim()
          .toUpperCase();
        return !appliesToProgram || appliesToProgram === normalizedProgram;
      })
      .map((checklist) => checklist.id);
    if (requiredIds.length === 0) return false;
    const checkedIds = checkedByLead.get(lead.id) ?? new Set<string>();
    return requiredIds.every((id) => checkedIds.has(id));
  }).length;

  return {
    mode: ADMISSION_PILOT_TASK_LIVE_SUMMARY,
    status: "READY",
    databaseReadExecuted: true,
    reason: "Scoped admission task metadata loaded.",
    totalLeadCount: leads.length,
    missingActorCount: leads.filter((lead) => !lead.assigned_to).length,
    documentCandidateCount: documentCandidates.length,
    documentBlockedCount: documentCandidates.length - handoverReadyCount,
    handoverReadyCount,
  };
}
