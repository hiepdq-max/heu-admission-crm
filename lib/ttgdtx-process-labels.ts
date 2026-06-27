export type TtgdtxProcessLabel = {
  code: string;
  businessName: string;
  label: string;
  href: string;
  plainMeaning: string;
  searchTerms: string[];
};

export const TTGDTX_PROCESS_LABELS: TtgdtxProcessLabel[] = [
  {
    code: "P2-01",
    businessName: "Hồ sơ liên kết TTGDTX",
    label: "Hồ sơ liên kết TTGDTX (P2-01)",
    href: "/ttgdtx",
    plainMeaning: "Hợp đồng, trung tâm, phạm vi, điều kiện thu/chi",
    searchTerms: ["hop dong", "ho so lien ket", "ttgdtx"],
  },
  {
    code: "P2-02",
    businessName: "Chính sách học phí",
    label: "Chính sách học phí (P2-02)",
    href: "/ttgdtx/tuition",
    plainMeaning: "Khai báo mức thu, kỳ, tháng, đối tượng thu",
    searchTerms: ["hoc phi", "chinh sach hoc phi", "tuition"],
  },
  {
    code: "P2-03",
    businessName: "Công nợ học sinh",
    label: "Công nợ học sinh (P2-03)",
    href: "/ttgdtx/receivables",
    plainMeaning: "Số tiền phải thu theo học sinh, lớp và kỳ",
    searchTerms: ["cong no", "phai thu", "receivable"],
  },
  {
    code: "P2-04",
    businessName: "Mô phỏng",
    label: "Mô phỏng (P2-04)",
    href: "/ttgdtx/simulation",
    plainMeaning: "Thử nghiệm logic trước khi ghi thật",
    searchTerms: ["mo phong", "simulation", "test logic"],
  },
  {
    code: "P2-05",
    businessName: "Gate điều kiện",
    label: "Gate điều kiện (P2-05)",
    href: "/ttgdtx/gate",
    plainMeaning: "Chặn hồ sơ chưa đủ điều kiện tạo công nợ",
    searchTerms: ["gate", "dieu kien", "chan ho so"],
  },
  {
    code: "P2-06",
    businessName: "Import dữ liệu",
    label: "Import dữ liệu (P2-06)",
    href: "/ttgdtx/import",
    plainMeaning: "Nạp file nguồn vào staging, chưa ghi sổ thật",
    searchTerms: ["import", "file nguon", "staging"],
  },
  {
    code: "P2-07/P2-08/P2-09",
    businessName: "Việc lỗi import",
    label: "Việc lỗi import (P2-07/P2-08/P2-09)",
    href: "/ttgdtx/import/issues",
    plainMeaning: "Phân công và xử lý lỗi dữ liệu",
    searchTerms: ["loi import", "phan cong loi", "workload"],
  },
  {
    code: "P2-10",
    businessName: "Thu học phí",
    label: "Thu học phí (P2-10)",
    href: "/ttgdtx/payments",
    plainMeaning: "Ghi nhận tiền đã thu, chứng từ thu, hóa đơn/chứng từ nếu cần",
    searchTerms: ["thu hoc phi", "chung tu thu", "voucher thu", "hoa don thu tien"],
  },
  {
    code: "P2-11",
    businessName: "Kiểm soát nguồn",
    label: "Kiểm soát nguồn (P2-11)",
    href: "/ttgdtx/source-control",
    plainMeaning: "Quản lý file nguồn, hợp đồng, BBNT, chứng từ và metadata",
    searchTerms: ["kiem soat nguon", "file nguon", "bbnt", "metadata"],
  },
  {
    code: "P2-12",
    businessName: "Danh mục TTGDTX",
    label: "Danh mục TTGDTX (P2-12)",
    href: "/ttgdtx/master",
    plainMeaning: "Danh mục trung tâm, lớp, khóa, kỳ và đối tác",
    searchTerms: ["danh muc", "dropdown", "trung tam"],
  },
  {
    code: "P2-13",
    businessName: "Đối soát",
    label: "Đối soát (P2-13)",
    href: "/ttgdtx/reconciliation",
    plainMeaning: "Gom chứng từ thu thành kỳ đối soát",
    searchTerms: ["doi soat", "reconciliation", "ky doi soat"],
  },
  {
    code: "P2-14",
    businessName: "Duyệt/khoá kỳ đối soát",
    label: "Duyệt/khoá kỳ đối soát (P2-14)",
    href: "/ttgdtx/reconciliation/review",
    plainMeaning: "Kiểm tra và khoá kỳ trước khi đề nghị chi",
    searchTerms: ["duyet ky", "khoa ky", "approve batch"],
  },
  {
    code: "P2-15",
    businessName: "Đề nghị thanh toán",
    label: "Đề nghị thanh toán (P2-15)",
    href: "/ttgdtx/payment-requests",
    plainMeaning: "Lập đề nghị thanh toán cho trung tâm/đối tác",
    searchTerms: ["de nghi thanh toan", "bbnt", "partner invoice"],
  },
  {
    code: "P2-16",
    businessName: "Duyệt thanh toán",
    label: "Duyệt thanh toán (P2-16)",
    href: "/ttgdtx/payment-requests/review",
    plainMeaning: "Kiểm/duyệt đề nghị thanh toán",
    searchTerms: ["duyet thanh toan", "kiem thanh toan", "approval"],
  },
  {
    code: "P2-17",
    businessName: "Chi tiền",
    label: "Chi tiền (P2-17)",
    href: "/ttgdtx/payment-requests/pay",
    plainMeaning: "Thực hiện chi trả một lần, có chứng từ",
    searchTerms: ["chi tien", "payout", "uy nhiem chi"],
  },
  {
    code: "P2-18",
    businessName: "Dashboard kế toán",
    label: "Dashboard kế toán (P2-18)",
    href: "/ttgdtx/accounting-dashboard",
    plainMeaning: "Tổng hợp tiền, công nợ, đối soát và chi trả",
    searchTerms: ["dashboard ke toan", "bao cao cong no", "accounting"],
  },
  {
    code: "P2-19",
    businessName: "Bằng chứng dữ liệu thật",
    label: "Bằng chứng dữ liệu thật (P2-19)",
    href: "/ttgdtx/source-control",
    plainMeaning: "Metadata cho BBNT, phong toả/giải toả, hoá đơn và giải chấp",
    searchTerms: ["du lieu that", "bbnt", "phong toa", "giai chap"],
  },
];

export const TTGDTX_PROCESS_SEARCH_SUGGESTIONS = TTGDTX_PROCESS_LABELS.map(
  (item) => item.label,
);

export function getTtgdtxProcessLabel(code: string) {
  return (
    TTGDTX_PROCESS_LABELS.find((item) => item.code === code)?.label ?? code
  );
}
