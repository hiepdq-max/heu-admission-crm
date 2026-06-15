export type AdmissionSegmentCatalogRow = {
  id: string;
  segment_code: string;
  segment_name: string;
  program_group: string;
  admission_object: string;
  delivery_context: string;
  partner_model: string;
  commission_model: string;
  contract_model: string;
  finance_risk: string;
  owner_department: string;
  sort_order: number;
  status: string;
};

export type AdmissionSegmentLeadStatRow = {
  admission_segment_id: string | null;
  status: string | null;
};

export type AdmissionSegmentScopeRow = {
  segment_id: string;
};

export type AdmissionSegmentOverviewRow = AdmissionSegmentCatalogRow & {
  leadCount: number;
  activeCount: number;
  enrolledCount: number;
};

const closedStatuses = new Set(["ENROLLED", "LOST", "DUPLICATE"]);

export function filterAdmissionSegmentsByScope(
  segments: AdmissionSegmentCatalogRow[],
  scopes: AdmissionSegmentScopeRow[],
  canSeeAllSegments: boolean,
) {
  if (canSeeAllSegments || scopes.length === 0) {
    return segments;
  }

  const allowedIds = new Set(scopes.map((scope) => scope.segment_id));
  return segments.filter((segment) => allowedIds.has(segment.id));
}

export function buildAdmissionSegmentOverview(
  segments: AdmissionSegmentCatalogRow[],
  leads: AdmissionSegmentLeadStatRow[],
) {
  const stats = new Map<
    string,
    { leadCount: number; activeCount: number; enrolledCount: number }
  >();
  let uncategorizedCount = 0;

  for (const lead of leads) {
    const segmentId = lead.admission_segment_id;

    if (!segmentId) {
      uncategorizedCount += 1;
      continue;
    }

    const current = stats.get(segmentId) ?? {
      leadCount: 0,
      activeCount: 0,
      enrolledCount: 0,
    };
    current.leadCount += 1;

    if (lead.status === "ENROLLED") {
      current.enrolledCount += 1;
    }

    if (!closedStatuses.has(lead.status ?? "")) {
      current.activeCount += 1;
    }

    stats.set(segmentId, current);
  }

  return {
    segments: segments.map((segment) => ({
      ...segment,
      ...(stats.get(segment.id) ?? {
        leadCount: 0,
        activeCount: 0,
        enrolledCount: 0,
      }),
    })),
    uncategorizedCount,
  };
}
