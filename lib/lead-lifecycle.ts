export type LeadLifecycleStatus =
  | "NEW"
  | "ASSIGNED"
  | "CONTACTED"
  | "INTERESTED"
  | "FOLLOW_UP"
  | "VISITED"
  | "DOCUMENT_PENDING"
  | "DOCUMENT_SUBMITTED"
  | "ELIGIBLE"
  | "ENROLLED"
  | "LOST"
  | "DUPLICATE";

export type LeadLifecyclePhase = {
  code: string;
  title: string;
  statuses: LeadLifecycleStatus[];
  owner: string;
  requiredControl: string;
  nextGate: string;
  stopCondition: string;
};

export const leadLifecycleStatusLabels: Record<LeadLifecycleStatus, string> = {
  NEW: "Lead mới",
  ASSIGNED: "Đã phân tư vấn",
  CONTACTED: "Đã liên hệ",
  INTERESTED: "Có quan tâm",
  FOLLOW_UP: "Cần chăm sóc",
  VISITED: "Đã đến trường",
  DOCUMENT_PENDING: "Chờ hồ sơ",
  DOCUMENT_SUBMITTED: "Đã nộp hồ sơ",
  ELIGIBLE: "Đủ điều kiện",
  ENROLLED: "Đã nhập học",
  LOST: "Không đăng ký",
  DUPLICATE: "Trùng lead",
};

export const leadLifecyclePhases: LeadLifecyclePhase[] = [
  {
    code: "P3-01-L01",
    title: "Tiếp nhận và phân tư vấn",
    statuses: ["NEW", "ASSIGNED"],
    owner: "Tuyen Sinh",
    requiredControl: "Lead có nguồn, đối tượng tuyển sinh và người phụ trách.",
    nextGate: "Không import dump thô hoặc dữ liệu không rõ nguồn.",
    stopCondition: "No raw form dump into AI or uncontrolled files.",
  },
  {
    code: "P3-01-L02",
    title: "Liên hệ và chăm sóc",
    statuses: ["CONTACTED", "INTERESTED", "FOLLOW_UP", "VISITED"],
    owner: "Tuyen Sinh",
    requiredControl: "Hoạt động tư vấn, kết quả và lịch follow-up được ghi lại.",
    nextGate: "FOLLOW_UP requires next_followup_at.",
    stopCondition: "Không để lead cần chăm sóc mà không có lịch hẹn tiếp theo.",
  },
  {
    code: "P3-01-L03",
    title: "Hồ sơ và bằng chứng",
    statuses: ["DOCUMENT_PENDING", "DOCUMENT_SUBMITTED"],
    owner: "Tuyen Sinh + CTHSSV",
    requiredControl: "Checklist hồ sơ và source/evidence link được kiểm soát.",
    nextGate: "P3-02 handover chỉ dùng bằng chứng đã phân quyền hoặc đã redacted.",
    stopCondition: "Không đưa raw student PII, CCCD, phone, bank data vào Git/Codex/chat.",
  },
  {
    code: "P3-01-L04",
    title: "Đủ điều kiện",
    statuses: ["ELIGIBLE"],
    owner: "Tuyen Sinh + Dao Tao + Phap Che",
    requiredControl: "P0-19 legal/tuition gate phải cho phép trước khi chốt.",
    nextGate: "P3-02 prepares handover; P2-05 remains the receivable gate.",
    stopCondition: "ELIGIBLE/ENROLLED require legal/tuition gate before finance use.",
  },
  {
    code: "P3-01-L05",
    title: "Nhập học và bàn giao",
    statuses: ["ENROLLED"],
    owner: "CTHSSV + Dao Tao + KHTC",
    requiredControl: "P3-02 handover được chấp nhận theo quyền và phạm vi.",
    nextGate: "P2-05/P2-03 remain final finance controls.",
    stopCondition: "Không tự tạo công nợ, thu tiền, xuất hóa đơn hoặc ghi doanh thu.",
  },
  {
    code: "P3-01-L06",
    title: "Đóng hoặc ngoại lệ",
    statuses: ["LOST", "DUPLICATE"],
    owner: "Tuyen Sinh + Audit",
    requiredControl: "LOST requires lost_reason; DUPLICATE keeps audit history.",
    nextGate: "Archive/status transition only; no hard delete.",
    stopCondition: "Không xóa lead, hồ sơ, bằng chứng hoặc audit rows.",
  },
];

export const leadLifecycleFinanceBoundaries = [
  "Create receivables",
  "Collect tuition",
  "Issue invoice or receipt",
  "Reconcile money",
  "Approve partner payment",
  "Execute payout",
  "Mark revenue",
  "Mark production GO",
];

export function leadLifecyclePhaseForStatus(status: string) {
  return leadLifecyclePhases.find((phase) =>
    phase.statuses.includes(status as LeadLifecycleStatus),
  );
}
