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

export type AdmissionSegmentReadinessRow = {
  segment_id: string;
  segment_code: string;
  segment_name: string;
  program_group: string;
  owner_department: string;
  workspace_id: string | null;
  workspace_code: string | null;
  operating_model: string | null;
  required_partner: boolean | null;
  required_contract: boolean | null;
  required_commission_policy: boolean | null;
  required_finance_tracking: boolean | null;
  required_document_checklist: boolean | null;
  required_handover_cthssv: boolean | null;
  hou_controls_enabled: boolean | null;
  ai_allowed: boolean | null;
  control_status: string | null;
  lead_count: number;
  enrolled_count: number;
  scoped_user_count: number;
  operation_step_count: number;
  required_step_count: number;
  visible_field_count: number;
  required_field_count: number;
  has_workspace_profile: boolean;
  has_required_steps: boolean;
  has_required_fields: boolean;
  has_user_scope: boolean;
  readiness_score: number;
  readiness_status: string;
  missing_items: string[] | null;
  ai_gate_status: string;
};

export type AdmissionSegmentWorkspaceRow = {
  id: string;
  segment_id: string;
  workspace_code: string;
  operating_model: string;
  lead_scope_rule: string;
  required_partner: boolean;
  required_contract: boolean;
  required_commission_policy: boolean;
  required_finance_tracking: boolean;
  required_document_checklist: boolean;
  required_handover_cthssv: boolean;
  hou_controls_enabled: boolean;
  ai_allowed: boolean;
  ai_policy: string;
  control_note: string | null;
  control_status: string;
};

export type AdmissionSegmentOperationStepRow = {
  id: string;
  segment_id: string;
  step_code: string;
  step_name: string;
  step_group: string;
  owner_department: string;
  action_href: string;
  required_for_operation: boolean;
  control_note: string | null;
  sort_order: number;
  control_status: string;
};

export type AdmissionSegmentFieldRuleRow = {
  id: string;
  segment_id: string;
  field_code: string;
  field_label: string;
  field_group: string;
  is_visible: boolean;
  is_required: boolean;
  help_text: string | null;
  sort_order: number;
  control_status: string;
};

const closedStatuses = new Set(["ENROLLED", "LOST", "DUPLICATE"]);

const readinessStatusLabels: Record<string, string> = {
  READY: "Sẵn sàng vận hành",
  READY_TEMP: "Đủ khung, chờ duyệt chính thức",
  NEEDS_SCOPE: "Cần phân user",
  IN_PROGRESS: "Đang hoàn thiện",
  BLOCKED: "Chưa đủ điều kiện",
};

const segmentMissingItemLabels: Record<string, string> = {
  WORKSPACE_PROFILE: "Chưa có hồ sơ vận hành",
  OPERATION_STEPS: "Chưa có bước thao tác",
  FIELD_RULES: "Chưa có quy định trường thông tin",
  USER_SCOPE: "Chưa phân user phụ trách",
  FINAL_CONTROL_STATUS: "Chưa duyệt trạng thái Đạt chính thức",
};

const aiGateLabels: Record<string, string> = {
  AI_LOCKED: "AI bị khóa",
  AI_REVIEW_ONLY: "AI chỉ được hỗ trợ kiểm tra",
  AI_ALLOWED_WITH_HUMAN_REVIEW: "AI được chạy có người duyệt",
};

const operatingModelLabels: Record<string, string> = {
  HOU_LINKAGE: "Liên thông đại học HOU",
  TTGDTX_LINKAGE: "Trung cấp 9+ liên kết TTGDTX",
  SHORT_COURSE: "Khóa ngắn hạn",
  UNIVERSITY_LINKAGE: "Liên thông đại học khác",
  ONSITE_ADMISSION: "Tuyển sinh tại HEU",
  STANDARD: "Vận hành tiêu chuẩn",
};

export function filterAdmissionSegmentsByScope(
  segments: AdmissionSegmentCatalogRow[],
  scopes: AdmissionSegmentScopeRow[],
  canSeeAllSegments: boolean,
) {
  if (canSeeAllSegments) {
    return segments;
  }

  if (scopes.length === 0) {
    return [];
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

export function segmentReadinessStatusLabel(value: string) {
  return readinessStatusLabels[value] ?? value;
}

export function segmentReadinessTone(value: string) {
  if (value === "READY") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "READY_TEMP") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (value === "NEEDS_SCOPE") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
}

export function segmentMissingItemLabel(value: string) {
  return segmentMissingItemLabels[value] ?? value;
}

export function segmentAiGateLabel(value: string) {
  return aiGateLabels[value] ?? value;
}

export function segmentAiGateTone(value: string) {
  if (value === "AI_ALLOWED_WITH_HUMAN_REVIEW") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "AI_REVIEW_ONLY") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
}

export function operatingModelLabel(value: string | null | undefined) {
  if (!value) return "Chưa cấu hình";
  return operatingModelLabels[value] ?? value;
}
