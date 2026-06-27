export type TtgdtxInvoiceRequirement =
  | "REQUIRED"
  | "NOT_REQUIRED"
  | "PENDING_POLICY"
  | "WAIVED_BY_AUTHORITY";

export type TtgdtxInvoiceStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "ISSUED"
  | "WAIVED"
  | "NOT_REQUIRED";

export type TtgdtxInvoicePolicyCase = {
  code: string;
  collectionModel: string;
  payerType: string;
  invoiceRequired: TtgdtxInvoiceRequirement;
  defaultIssuer: string;
  targetStatus: TtgdtxInvoiceStatus;
  requiredEvidence: string[];
  nextAction: string;
  blocks: string;
};

export const invoiceRequirementLabels: Record<TtgdtxInvoiceRequirement, string> = {
  REQUIRED: "Bắt buộc hóa đơn/chứng từ",
  NOT_REQUIRED: "Không bắt buộc",
  PENDING_POLICY: "Chờ KHTC/Pháp chế chốt chính sách",
  WAIVED_BY_AUTHORITY: "Miễn theo thẩm quyền",
};

export const invoiceStatusTargets: Record<TtgdtxInvoiceStatus, string> = {
  NOT_STARTED: "Chưa bắt đầu",
  PENDING: "Đang chờ",
  ISSUED: "Đã phát hành",
  WAIVED: "Đã miễn",
  NOT_REQUIRED: "Không cần",
};

export const ttgdtxInvoicePolicyPrinciples = [
  "Không trả lời yes/no toàn cục cho mọi khoản thu.",
  "Quyết định theo mô hình thu, người nộp tiền, đơn vị phát hành và căn cứ pháp lý/thuế.",
  "Nếu REQUIRED thì phải có số, ngày và link hóa đơn/chứng từ trước khi coi là hoàn tất.",
  "Nếu WAIVED_BY_AUTHORITY thì phải có người/phòng phê duyệt và lý do miễn.",
  "Nếu còn PENDING_POLICY thì P2-13/P2-14/P2-15 phải giữ trạng thái chặn hoặc cần xử lý.",
];

export const ttgdtxInvoicePolicyCases: TtgdtxInvoicePolicyCase[] = [
  {
    code: "HEU_COLLECTS_STUDENT",
    collectionModel: "HEU thu trực tiếp",
    payerType: "Học viên hoặc người bảo lãnh nộp cho HEU",
    invoiceRequired: "REQUIRED",
    defaultIssuer: "HEU hoặc đơn vị được HEU phân quyền hợp lệ",
    targetStatus: "ISSUED",
    requiredEvidence: [
      "Số chứng từ thu P2-10",
      "Số/ngày hóa đơn hoặc chứng từ thay thế hợp lệ",
      "Link minh chứng hóa đơn/chứng từ",
    ],
    nextAction: "Chọn REQUIRED, nhập issuer, số/ngày và link bằng chứng.",
    blocks: "Không chuyển sang đối soát nếu thiếu quyết định hoặc thiếu bằng chứng bắt buộc.",
  },
  {
    code: "CENTER_COLLECTS_STUDENT",
    collectionModel: "TTGDTX/trung tâm thu trước",
    payerType: "Học viên nộp cho TTGDTX/trung tâm",
    invoiceRequired: "PENDING_POLICY",
    defaultIssuer: "TTGDTX/trung tâm hoặc đơn vị được phê duyệt",
    targetStatus: "PENDING",
    requiredEvidence: [
      "Chính sách thu hộ/thu thay trong hợp đồng",
      "Bằng chứng trung tâm đã thu",
      "Kết luận KHTC + Pháp chế về bên phát hành",
    ],
    nextAction: "Giữ PENDING_POLICY cho đến khi KHTC/Pháp chế xác nhận bên phát hành.",
    blocks: "Không dùng làm căn cứ chi đối tác nếu chưa rõ trách nhiệm hóa đơn/chứng từ.",
  },
  {
    code: "SPLIT_COLLECTION",
    collectionModel: "Chia phần thu giữa HEU và TTGDTX",
    payerType: "Một khoản thu có nhiều phần nghĩa vụ",
    invoiceRequired: "REQUIRED",
    defaultIssuer: "Bên thực nhận hoặc bên được phê duyệt cho từng phần",
    targetStatus: "ISSUED",
    requiredEvidence: [
      "Bảng tách phần thu HEU/TTGDTX",
      "Chứng từ cho phần HEU thực nhận",
      "Bằng chứng phần trung tâm thực nhận hoặc miễn hợp lệ",
    ],
    nextAction: "Tách rõ phần tiền, issuer và chứng từ theo từng phần trước khi đối soát.",
    blocks: "Không khóa kỳ nếu tổng thu đúng nhưng phần chứng từ chưa tách rõ.",
  },
  {
    code: "OFFSET_OR_ADJUSTMENT",
    collectionModel: "Bù trừ, giảm trừ hoặc điều chỉnh",
    payerType: "Không phát sinh dòng tiền thu mới hoặc đã có quyết định điều chỉnh",
    invoiceRequired: "WAIVED_BY_AUTHORITY",
    defaultIssuer: "KHTC/Pháp chế xác nhận miễn hoặc không phát sinh",
    targetStatus: "WAIVED",
    requiredEvidence: [
      "Quyết định/biên bản điều chỉnh",
      "Người/phòng phê duyệt miễn",
      "Lý do miễn hoặc căn cứ không phát sinh hóa đơn",
    ],
    nextAction: "Chọn WAIVED_BY_AUTHORITY và ghi rõ căn cứ miễn trước khi chuyển bước.",
    blocks: "Không cho tự chọn không cần hóa đơn nếu không có căn cứ phê duyệt.",
  },
  {
    code: "OTHER_COLLECTION_MODEL",
    collectionModel: "Cách thu khác hoặc chưa có tiền lệ",
    payerType: "Trường hợp mới, không khớp các mẫu trên",
    invoiceRequired: "PENDING_POLICY",
    defaultIssuer: "Chưa xác định",
    targetStatus: "PENDING",
    requiredEvidence: [
      "Mô tả tình huống thu",
      "Ý kiến KHTC",
      "Ý kiến Pháp chế hoặc người được ủy quyền",
    ],
    nextAction: "Giữ PENDING_POLICY, không tự suy luận; yêu cầu owner chốt chính sách.",
    blocks: "Không tự động coi khoản thu là hoàn tất hoặc đủ điều kiện chi tiếp.",
  },
];
