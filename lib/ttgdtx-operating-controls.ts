export type TtgdtxOperatingControl = {
  code: string;
  label: string;
  href: string;
  owner: string;
  mustHave: string[];
  blocks: string;
};

export const TTGDTX_OPERATING_CONTROLS: TtgdtxOperatingControl[] = [
  {
    code: "P2-01",
    label: "Hồ sơ liên kết TTGDTX",
    href: "/ttgdtx",
    owner: "Pháp chế + BGH",
    mustHave: ["HDLK active", "phạm vi", "hiệu lực", "điều kiện thanh toán"],
    blocks: "Chính sách học phí, công nợ, đề nghị thanh toán",
  },
  {
    code: "P2-02",
    label: "Chính sách học phí",
    href: "/ttgdtx/tuition",
    owner: "KHTC",
    mustHave: ["mức thu", "kỳ/term", "collection model", "quy tắc hóa đơn"],
    blocks: "Tạo công nợ",
  },
  {
    code: "P2-03",
    label: "Công nợ học sinh",
    href: "/ttgdtx/receivables",
    owner: "KHTC",
    mustHave: ["student-period receivable", "amount", "due date", "audit"],
    blocks: "Thu học phí và đối soát",
  },
  {
    code: "P2-10",
    label: "Thu học phí",
    href: "/ttgdtx/payments",
    owner: "KHTC",
    mustHave: [
      "số tiền",
      "ngày thu",
      "số chứng từ",
      "evidence link",
      "invoice/chứng từ status",
    ],
    blocks: "Đối soát",
  },
  {
    code: "P2-13",
    label: "Đối soát",
    href: "/ttgdtx/reconciliation",
    owner: "KHTC",
    mustHave: ["collection lines đủ điều kiện", "kỳ đối soát", "no duplicate use"],
    blocks: "Đề nghị thanh toán",
  },
  {
    code: "P2-14",
    label: "Duyệt/khoá kỳ đối soát",
    href: "/ttgdtx/reconciliation/review",
    owner: "KHTC + BGH",
    mustHave: ["checker decision", "approver decision", "locked period"],
    blocks: "Đề nghị thanh toán",
  },
  {
    code: "P2-15",
    label: "Đề nghị thanh toán",
    href: "/ttgdtx/payment-requests",
    owner: "KHTC",
    mustHave: ["P2-14 locked", "BBNT", "partner invoice", "formula amount"],
    blocks: "Duyệt thanh toán và chi tiền",
  },
  {
    code: "P2-16",
    label: "Duyệt thanh toán",
    href: "/ttgdtx/payment-requests/review",
    owner: "KHTC + BGH",
    mustHave: ["checked amount", "approved amount", "approval note", "audit"],
    blocks: "Chi tiền",
  },
  {
    code: "P2-17",
    label: "Chi tiền",
    href: "/ttgdtx/payment-requests/pay",
    owner: "KHTC",
    mustHave: ["approved request", "voucher guard", "one-time payout path"],
    blocks: "Dashboard facts and final finance reporting",
  },
  {
    code: "P2-18",
    label: "Dashboard kế toán",
    href: "/ttgdtx/accounting-dashboard",
    owner: "BGH + KHTC",
    mustHave: ["read-only totals", "locked source facts", "approved source facts"],
    blocks: "Go-live sign-off",
  },
];

export function getTtgdtxOperatingControl(code: string) {
  return TTGDTX_OPERATING_CONTROLS.find((item) => item.code === code);
}

export function getTtgdtxOperatingNeighbors(code: string) {
  const index = TTGDTX_OPERATING_CONTROLS.findIndex((item) => item.code === code);

  if (index === -1) {
    return { previous: null, current: null, next: null };
  }

  return {
    previous: TTGDTX_OPERATING_CONTROLS[index - 1] ?? null,
    current: TTGDTX_OPERATING_CONTROLS[index],
    next: TTGDTX_OPERATING_CONTROLS[index + 1] ?? null,
  };
}
