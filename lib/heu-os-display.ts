const moduleNames: Record<string, string> = {
  M00_MASTER_CONTROL: "Master Control",
  M01_IDENTITY_SCOPE: "Người dùng, vai trò và phạm vi",
  M05_ADMISSION_CRM: "CRM tuyển sinh",
  M06_HSSV_HANDOVER: "CTHSSV và hồ sơ nhập học",
  M07_TRAINING: "Đào tạo và lớp học",
  M08_FINANCE_ACCOUNTING: "Kế toán, học phí, công nợ và COM",
  M09_PARTNER_CONTRACT: "Đối tác, CTV và hợp đồng",
  M10_HOU_LINKAGE: "Liên thông đại học HOU",
  M20_AI_ASSISTANT: "AI Assistant và automation",
};

const moduleObjectives: Record<string, string> = {
  M00_MASTER_CONTROL:
    "Quản trị căn cứ pháp lý, SOP, data dictionary, approval gate và bản đồ HEU OS.",
  M01_IDENTITY_SCOPE:
    "Quản lý user, phòng ban, vai trò, người quản lý trực tiếp và phạm vi đối tượng/đối tác được làm việc.",
  M05_ADMISSION_CRM:
    "Quản lý lead theo đối tượng tuyển sinh, nguồn, đối tác, tư vấn, pipeline và follow-up.",
  M06_HSSV_HANDOVER:
    "Nhận bàn giao hồ sơ đủ điều kiện, kiểm tra giấy tờ và theo dõi trạng thái học sinh.",
  M07_TRAINING:
    "Quản lý chương trình, ngành, lớp, lịch học, mở lớp và thay đổi học tập.",
  M08_FINANCE_ACCOUNTING:
    "Theo dõi học phí, công nợ, thu chi, đối soát COM và chứng từ kế toán.",
  M09_PARTNER_CONTRACT:
    "Quản lý TTGDTX, CTV, doanh nghiệp, đại học liên kết, hợp đồng và chính sách hiệu lực.",
  M10_HOU_LINKAGE:
    "Quản lý chương trình HOU, hồ sơ, học phí kỳ đầu, COM HOU, tỷ lệ hợp tác và rủi ro bỏ học.",
  M20_AI_ASSISTANT:
    "Hỗ trợ nhập liệu, kiểm tra, soạn thảo, cảnh báo và gợi ý quy trình theo quyền user.",
};

const moduleCorePolicies: Record<string, string> = {
  M00_MASTER_CONTROL:
    "Mọi module production phải có owner, căn cứ pháp lý/SOP/dữ liệu/kiểm soát và gate nếu có phê duyệt.",
  M01_IDENTITY_SCOPE:
    "User chỉ nhìn và thao tác trong phòng ban, đối tượng tuyển sinh và đối tác được phân.",
  M05_ADMISSION_CRM:
    "Lead phải gắn đúng đối tượng tuyển sinh; mọi chuyển trạng thái quan trọng phải qua rule.",
  M06_HSSV_HANDOVER:
    "Chỉ tiếp nhận khi hồ sơ bắt buộc đạt điều kiện và có log bàn giao từ tuyển sinh.",
  M07_TRAINING:
    "Mở lớp, chuyển lớp, chuyển ngành phải có điều kiện, hồ sơ và người duyệt rõ ràng.",
  M08_FINANCE_ACCOUNTING:
    "Không chi COM hai lần; mọi chi trả phải có đủ điều kiện, kỳ, người duyệt và chứng từ.",
  M09_PARTNER_CONTRACT:
    "Nguồn, đối tác và COM phải gắn hợp đồng hoặc chính sách hiệu lực theo thời điểm.",
  M10_HOU_LINKAGE:
    "Tỷ lệ/chính sách COM/HOU có hiệu lực theo mốc thời gian; thông tin nhạy cảm chỉ role được phép xem.",
  M20_AI_ASSISTANT:
    "AI agent chỉ được bật sau khi có legal, SOP, data scope, prompt log và approval gate.",
};

const moduleAiPolicies: Record<string, string> = {
  M00_MASTER_CONTROL:
    "AI chỉ được đọc phần được phép, gợi ý/kiểm tra/cảnh báo; không tự thay đổi master data.",
  M01_IDENTITY_SCOPE:
    "AI không được tiết lộ dữ liệu ngoài phạm vi user.",
  M05_ADMISSION_CRM:
    "AI được gợi ý nội dung tư vấn và cảnh báo thiếu thông tin, không tự chuyển trạng thái.",
  M06_HSSV_HANDOVER:
    "AI được kiểm tra checklist, phát hiện thiếu/không khớp; không tự xác nhận đủ điều kiện.",
  M07_TRAINING:
    "AI được gợi ý xếp lớp/lịch, không tự ra quyết định đào tạo.",
  M08_FINANCE_ACCOUNTING:
    "AI chỉ cảnh báo rủi ro, tính nháp/dự kiến; không tự tạo lệnh chi tiền.",
  M09_PARTNER_CONTRACT:
    "AI được soát điều khoản và cảnh báo thiếu hợp đồng, không tự kết luận pháp lý.",
  M10_HOU_LINKAGE:
    "AI chỉ được đọc phần không bị hạn chế; không hiện tỷ lệ hợp tác cho user không có quyền.",
  M20_AI_ASSISTANT:
    "AI không thay người duyệt; mọi output quan trọng phải có human review.",
};

const workflowNames: Record<string, string> = {
  WF_LEAD_TO_ENROLLMENT: "Lead tuyển sinh đến nhập học",
  WF_CTHSSV_HANDOVER: "Bàn giao hồ sơ sang CTHSSV",
  WF_FINANCE_COLLECTION: "Thu học phí và theo dõi công nợ",
  WF_COM_APPROVAL: "Đề nghị và duyệt COM",
  WF_HOU_OPERATION: "Vận hành liên thông HOU",
  WF_AI_AGENT_ENABLE: "Bật AI agent production",
};

const workflowTriggers: Record<string, string> = {
  WF_LEAD_TO_ENROLLMENT:
    "Có lead mới hoặc import danh sách từ đối tượng tuyển sinh.",
  WF_CTHSSV_HANDOVER: "Lead đã đủ điều kiện hồ sơ nhập học.",
  WF_FINANCE_COLLECTION: "Học sinh có nghĩa vụ học phí hoặc kỳ thanh toán.",
  WF_COM_APPROVAL: "Lead/người học đạt điều kiện COM theo chính sách hiệu lực.",
  WF_HOU_OPERATION: "Lead thuộc đối tượng liên thông đại học HOU.",
  WF_AI_AGENT_ENABLE: "Cần bật AI cho một module/quy trình.",
};

const workflowOutputs: Record<string, string> = {
  WF_LEAD_TO_ENROLLMENT:
    "Lead đủ điều kiện bàn giao CTHSSV hoặc mất lead có lý do.",
  WF_CTHSSV_HANDOVER: "Hồ sơ được tiếp nhận hoặc trả về bổ sung.",
  WF_FINANCE_COLLECTION:
    "Ghi nhận thu, công nợ, chứng từ và trạng thái thanh toán.",
  WF_COM_APPROVAL: "COM được phê duyệt, tạm treo hoặc từ chối.",
  WF_HOU_OPERATION:
    "Ghi nhận hệ HOU, ngành, địa điểm, học phí kỳ đầu, hồ sơ và COM.",
  WF_AI_AGENT_ENABLE: "AI agent được phép chạy hoặc bị chặn.",
};

const workflowHandoverRules: Record<string, string> = {
  WF_LEAD_TO_ENROLLMENT:
    "Bàn giao sang CTHSSV khi hồ sơ bắt buộc và trạng thái đạt điều kiện.",
  WF_CTHSSV_HANDOVER: "CTHSSV chấp nhận/từ chối phải ghi lý do.",
  WF_FINANCE_COLLECTION:
    "Thông tin tài chính chỉ hiện cho người được phân quyền.",
  WF_COM_APPROVAL:
    "Không chi COM nếu thiếu điều kiện, trùng nguồn, trùng kỳ hoặc thiếu chứng từ.",
  WF_HOU_OPERATION: "Chỉ tạo COM HOU khi đủ điều kiện HOU và tài chính.",
  WF_AI_AGENT_ENABLE:
    "Chỉ bật khi có data scope, prompt log, legal/SOP và human approval.",
};

const workflowAuditRules: Record<string, string> = {
  WF_LEAD_TO_ENROLLMENT:
    "Log tạo lead, sửa lead, tư vấn, cập nhật trạng thái và bàn giao.",
  WF_CTHSSV_HANDOVER:
    "Log người bàn giao, người tiếp nhận, thời điểm và ghi chú.",
  WF_FINANCE_COLLECTION:
    "Log mọi giao dịch, thay đổi công nợ, chứng từ và người duyệt.",
  WF_COM_APPROVAL:
    "Log claim, phê duyệt, kỳ thanh toán, số chứng từ và trạng thái chi.",
  WF_HOU_OPERATION:
    "Log mọi thay đổi HOU stage, học phí, hồ sơ, minh chứng và COM.",
  WF_AI_AGENT_ENABLE:
    "Log prompt, input/output, người phê duyệt và phạm vi được đọc.",
};

const approvalNames: Record<string, string> = {
  APPROVE_LEAD_ELIGIBLE: "Xác nhận lead đủ điều kiện",
  APPROVE_HSSV_ACCEPT: "CTHSSV tiếp nhận hồ sơ",
  APPROVE_COM_PAYMENT: "Duyệt chi COM",
  APPROVE_HOU_SENSITIVE_FINANCE: "Xem/chỉnh tỷ lệ hợp tác HEU-HOU",
  APPROVE_AI_AGENT_PRODUCTION: "Bật AI agent production",
};

const approvalEvidence: Record<string, string> = {
  APPROVE_LEAD_ELIGIBLE:
    "Log tư vấn, hồ sơ bắt buộc, nguồn lead, đối tượng tuyển sinh, trạng thái tài chính nếu có.",
  APPROVE_HSSV_ACCEPT: "Checklist hồ sơ, log bàn giao, ghi chú bổ sung nếu có.",
  APPROVE_COM_PAYMENT:
    "Chính sách COM hiệu lực, claim, đối soát, chứng từ, công nợ, cảnh báo bỏ học.",
  APPROVE_HOU_SENSITIVE_FINANCE:
    "Hợp đồng, phụ lục hoặc chính sách hiệu lực theo mốc thời gian.",
  APPROVE_AI_AGENT_PRODUCTION:
    "Legal, SOP, data scope, prompt policy, test log và rollback plan.",
};

const approvalBlockingRules: Record<string, string> = {
  APPROVE_LEAD_ELIGIBLE:
    "Chặn nếu thiếu hồ sơ, sai đối tượng, thiếu lý do hoặc không đúng phạm vi user.",
  APPROVE_HSSV_ACCEPT:
    "Chặn nếu hồ sơ bắt buộc chưa đạt hoặc không có log bàn giao.",
  APPROVE_COM_PAYMENT:
    "Chặn nếu trùng COM, thiếu điều kiện, sai kỳ, sai người nhận hoặc thiếu chứng từ.",
  APPROVE_HOU_SENSITIVE_FINANCE:
    "Chặn với user không có quyền chiến lược tài chính HOU.",
  APPROVE_AI_AGENT_PRODUCTION:
    "Chặn nếu AI đọc dữ liệu nhạy cảm ngoài phạm vi hoặc có quyền tự duyệt.",
};

const dataNames: Record<string, string> = {
  ADMISSION_SEGMENTS: "Đối tượng tuyển sinh",
  USER_SCOPE: "Phạm vi user",
  LEADS: "Lead tuyển sinh",
  HOU_COM_POLICY: "Chính sách COM HOU",
  AUDIT_LOGS: "Audit log",
};

const dataChangeRules: Record<string, string> = {
  ADMISSION_SEGMENTS:
    "Chỉ admin/Master Control được thêm/sửa; mỗi đối tượng phải có owner, COM/hợp đồng/rủi ro.",
  USER_SCOPE:
    "Trưởng phòng chỉ phân user trong phòng hoặc phạm vi mình được quản lý.",
  LEADS:
    "Lead phải theo RLS và phạm vi user; không export/AI đọc ngoài quyền.",
  HOU_COM_POLICY:
    "Chính sách có ngày hiệu lực; tỷ lệ hợp tác chỉ role được phép xem/sửa.",
  AUDIT_LOGS:
    "Không cho sửa/xóa bằng UI; chỉ audit/admin được đọc theo phạm vi.",
};

const riskNames: Record<string, string> = {
  RISK_SCOPE_LEAK: "User thấy dữ liệu ngoài phạm vi",
  RISK_DUPLICATE_COM: "Chi COM hai lần hoặc sai đối tượng",
  RISK_HOU_CONFIDENTIAL_RATE: "Lộ tỷ lệ hợp tác HEU-HOU",
  RISK_LEGAL_MODEL_TTGDTX: "Sai mô hình liên kết TTGDTX",
  RISK_AI_OVERREACH: "AI vượt quyền hoặc tự quyết định",
};

const riskDescriptions: Record<string, string> = {
  RISK_SCOPE_LEAK:
    "User được phân một đối tượng/đối tác nhưng thấy lead của đối tượng khác.",
  RISK_DUPLICATE_COM:
    "Một lead/học viên có thể bị claim COM trùng nguồn, trùng kỳ hoặc sai chính sách hiệu lực.",
  RISK_HOU_CONFIDENTIAL_RATE:
    "Tỷ lệ HEU nhận lại và chính sách hợp tác HOU là thông tin hạn chế.",
  RISK_LEGAL_MODEL_TTGDTX:
    "Tuyển sinh 9+ liên kết TTGDTX có thể sai mô hình, thiếu hợp đồng/thẩm quyền/hồ sơ.",
  RISK_AI_OVERREACH:
    "AI có thể đọc dữ liệu nhạy cảm, gợi ý sai quy chế hoặc tự thao tác không có người duyệt.",
};

const riskControlRules: Record<string, string> = {
  RISK_SCOPE_LEAK:
    "Bắt buộc RLS + filter UI + test bằng user mẫu sau mỗi thay đổi phạm vi.",
  RISK_DUPLICATE_COM:
    "Unique rule theo lead, policy, kỳ, người nhận; cảnh báo công nợ/bỏ học trước khi chi.",
  RISK_HOU_CONFIDENTIAL_RATE:
    "Chỉ role được cấp quyền chiến lược tài chính HOU mới xem/sửa.",
  RISK_LEGAL_MODEL_TTGDTX:
    "Mỗi đối tác TTGDTX phải gắn hợp đồng, phạm vi, người duyệt và checklist riêng.",
  RISK_AI_OVERREACH:
    "AI chỉ chạy trong data scope, prompt log, approval gate và human review.",
};

const riskEscalationRules: Record<string, string> = {
  RISK_SCOPE_LEAK: "Báo ADMIN/BGH nếu phát hiện lộ dữ liệu.",
  RISK_DUPLICATE_COM: "Kế toán trưởng/BGH duyệt ngoại lệ.",
  RISK_HOU_CONFIDENTIAL_RATE: "Báo BGH nếu user không có quyền truy cập được.",
  RISK_LEGAL_MODEL_TTGDTX: "Pháp chế/BGH duyệt trước khi mở khóa/lớp mới.",
  RISK_AI_OVERREACH: "Dừng AI agent nếu có output sai hoặc rủi ro dữ liệu.",
};

const tokenLabels: Record<string, string> = {
  ACCOUNTING_LEAD: "Trưởng nhóm kế toán",
  ACCOUNTING_STAFF: "Nhân viên kế toán",
  ADMIN: "Quản trị hệ thống",
  AUDIT: "Kiểm soát nội bộ",
  AUDIT_PHAP_CHE: "Audit/Pháp chế",
  BGH: "Ban giám hiệu",
  BOARD: "Cấp lãnh đạo",
  CTHSSV: "Công tác HSSV",
  CTHSSV_LEAD: "Trưởng bộ phận CTHSSV",
  CTHSSV_STAFF: "Nhân viên CTHSSV",
  COUNSELOR: "Tư vấn viên",
  COUNSELOR_OR_PARTNER_OWNER: "Tư vấn viên hoặc phụ trách đối tác",
  DAO_TAO: "Đào tạo",
  DEPARTMENT: "Cấp phòng",
  FINANCE: "Tài chính",
  HIEU_TRUONG_OR_BGH: "Hiệu trưởng hoặc Ban giám hiệu",
  HOU_OPERATOR: "Người phụ trách HOU",
  IT_DATA: "IT/Data",
  KE_TOAN_TRUONG: "Kế toán trưởng",
  KE_TOAN_TRUONG_OR_BGH: "Kế toán trưởng hoặc Ban giám hiệu",
  KHTC: "Kế hoạch - Tài chính",
  LEGAL: "Pháp chế",
  PHAP_CHE: "Pháp chế",
  PHAP_CHE_AUDIT: "Pháp chế/Audit",
  TEAM_LEAD: "Trưởng nhóm",
  TRUONG_PHONG: "Trưởng phòng",
  TRUONG_PHONG_TUYEN_SINH: "Trưởng phòng tuyển sinh",
  TRUONG_PHONG_TUYEN_SINH_OR_BGH: "Trưởng phòng tuyển sinh hoặc BGH",
  TUYEN_SINH: "Tuyển sinh",
};

const groupLabels: Record<string, string> = {
  AI_CONTROL: "Kiểm soát AI",
  CONFIDENTIAL_FINANCE: "Tài chính bảo mật",
  CONTROL: "Kiểm soát nền",
  CORE_OPERATION: "Vận hành chính",
  FINANCE: "Tài chính",
  LEGAL: "Pháp chế",
  SECURITY: "Bảo mật",
  SPECIAL_PROGRAM: "Chương trình đặc thù",
};

const typeLabels: Record<string, string> = {
  BOARD: "Cấp lãnh đạo",
  CONFIG: "Cấu hình",
  CONTROL: "Kiểm soát",
  CRITICAL: "Rất nghiêm trọng",
  HIGH: "Cao",
  INTERNAL: "Nội bộ",
  LOW: "Thấp",
  MASTER: "Dữ liệu gốc",
  MEDIUM: "Trung bình",
  PUBLIC: "Công khai",
  REPORT_VIEW: "Báo cáo",
  RESTRICTED: "Hạn chế",
  SECRET: "Tối mật",
  TRANSACTION: "Dữ liệu giao dịch",
};

export function labelToken(value: string | null | undefined) {
  if (!value) return "Chưa rõ";

  return value
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => tokenLabels[part] ?? groupLabels[part] ?? typeLabels[part] ?? part)
    .join(" + ");
}

export function moduleDisplay(
  moduleCode: string,
  fallback: {
    name?: string | null;
    objective?: string | null;
    corePolicy?: string | null;
    aiPolicy?: string | null;
    group?: string | null;
    owner?: string | null;
  } = {},
) {
  return {
    name: moduleNames[moduleCode] ?? fallback.name ?? moduleCode,
    objective: moduleObjectives[moduleCode] ?? fallback.objective ?? "",
    corePolicy: moduleCorePolicies[moduleCode] ?? fallback.corePolicy ?? "",
    aiPolicy: moduleAiPolicies[moduleCode] ?? fallback.aiPolicy ?? "",
    group: labelToken(fallback.group),
    owner: labelToken(fallback.owner),
  };
}

export function workflowDisplay(
  workflowCode: string,
  fallback: {
    name?: string | null;
    trigger?: string | null;
    output?: string | null;
    handover?: string | null;
    audit?: string | null;
  } = {},
) {
  return {
    name: workflowNames[workflowCode] ?? fallback.name ?? workflowCode,
    trigger: workflowTriggers[workflowCode] ?? fallback.trigger ?? "",
    output: workflowOutputs[workflowCode] ?? fallback.output ?? "",
    handover: workflowHandoverRules[workflowCode] ?? fallback.handover ?? "",
    audit: workflowAuditRules[workflowCode] ?? fallback.audit ?? "",
  };
}

export function approvalDisplay(
  approvalCode: string,
  fallback: {
    name?: string | null;
    evidence?: string | null;
    blocking?: string | null;
  } = {},
) {
  return {
    name: approvalNames[approvalCode] ?? fallback.name ?? approvalCode,
    evidence: approvalEvidence[approvalCode] ?? fallback.evidence ?? "",
    blocking: approvalBlockingRules[approvalCode] ?? fallback.blocking ?? "",
  };
}

export function masterDataDisplay(
  dataCode: string,
  fallback: {
    name?: string | null;
    changeRule?: string | null;
  } = {},
) {
  return {
    name: dataNames[dataCode] ?? fallback.name ?? dataCode,
    changeRule: dataChangeRules[dataCode] ?? fallback.changeRule ?? "",
  };
}

export function riskDisplay(
  riskCode: string,
  fallback: {
    name?: string | null;
    description?: string | null;
    control?: string | null;
    escalation?: string | null;
  } = {},
) {
  return {
    name: riskNames[riskCode] ?? fallback.name ?? riskCode,
    description: riskDescriptions[riskCode] ?? fallback.description ?? "",
    control: riskControlRules[riskCode] ?? fallback.control ?? "",
    escalation: riskEscalationRules[riskCode] ?? fallback.escalation ?? "",
  };
}

export function statusLabel(value: string) {
  const labels: Record<string, string> = {
    DAT: "Đạt chính thức",
    DAT_TAM_THOI: "Đạt tạm thời",
    CAN_SUA: "Cần sửa",
    CHUA_DU_DIEU_KIEN: "Chưa đủ điều kiện",
  };

  return labels[value] ?? value;
}

export function statusTone(value: string) {
  if (value === "DAT") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "CHUA_DU_DIEU_KIEN") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (value === "CAN_SUA") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-sky-200 bg-sky-50 text-sky-700";
}

export function severityLabel(value: string) {
  const labels: Record<string, string> = {
    LOW: "Thấp",
    MEDIUM: "Trung bình",
    HIGH: "Cao",
    CRITICAL: "Rất nghiêm trọng",
  };

  return labels[value] ?? value;
}

export function typeLabel(value: string) {
  return typeLabels[value] ?? labelToken(value);
}

export function aiAllowedLabel(value: boolean) {
  return value ? "AI được đọc" : "AI không được đọc";
}
