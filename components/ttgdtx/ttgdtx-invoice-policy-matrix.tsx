import {
  AlertTriangle,
  BadgeCheck,
  FileCheck2,
  ReceiptText,
  Scale,
} from "lucide-react";

import {
  invoiceRequirementLabels,
  invoiceStatusTargets,
  ttgdtxInvoicePolicyCases,
  ttgdtxInvoicePolicyPrinciples,
  type TtgdtxInvoiceRequirement,
} from "@/lib/ttgdtx-invoice-policy";

const requirementTone: Record<TtgdtxInvoiceRequirement, string> = {
  REQUIRED: "border-rose-200 bg-rose-50 text-rose-800",
  NOT_REQUIRED: "border-zinc-200 bg-zinc-50 text-zinc-700",
  PENDING_POLICY: "border-amber-200 bg-amber-50 text-amber-800",
  WAIVED_BY_AUTHORITY: "border-blue-200 bg-blue-50 text-blue-800",
};

const invoiceEvidenceChecklist = [
  {
    caseId: "P2-10-INV-01",
    title: "Chon dung mo hinh thu va nguoi nop",
    evidence:
      "P2-10 payment has collection model, payer type and source receivable/payment reference before invoice decision.",
    stopCondition:
      "Stop if the user answers only yes/no without collection model, payer type or source reference.",
  },
  {
    caseId: "P2-10-INV-02",
    title: "Hoa don/chung-tu bat buoc co du so, ngay va link",
    evidence:
      "When invoice_required is REQUIRED, invoice issuer, invoice number/date and controlled evidence link are present.",
    stopCondition:
      "Stop if REQUIRED is selected but invoice number/date/evidence is blank or not controlled.",
  },
  {
    caseId: "P2-10-INV-03",
    title: "Mien/khong can hoa don phai co can cu",
    evidence:
      "WAIVED_BY_AUTHORITY or NOT_REQUIRED has owner, reason, policy/legal basis and controlled approval evidence.",
    stopCondition:
      "Stop if a user self-selects not required without KHTC/Phap Che authority or written basis.",
  },
  {
    caseId: "P2-10-INV-04",
    title: "PENDING_POLICY chan doi soat va chi tiep",
    evidence:
      "Any PENDING_POLICY payment remains blocked from P2-13/P2-14/P2-15 until KHTC/Phap Che decision exists.",
    stopCondition:
      "Stop if unresolved invoice policy can enter reconciliation, lock period or partner payment request.",
  },
  {
    caseId: "P2-10-INV-05",
    title: "Bang chung duoc redact va luu dung noi",
    evidence:
      "Evidence reference uses a controlled storage location and does not expose raw bank data, CCCD, phone, password, key or voucher body in Git/Codex/chat.",
    stopCondition:
      "Stop if raw sensitive evidence is pasted into the app note, Git, Codex/chat or UAT screenshot.",
  },
  {
    caseId: "P2-10-INV-06",
    title: "KHTC/Phap Che ky UAT truoc production",
    evidence:
      "Signed UAT covers at least REQUIRED, PENDING_POLICY, WAIVED_BY_AUTHORITY and OTHER_COLLECTION_MODEL cases.",
    stopCondition:
      "Stop if PASS_LOCAL is treated as invoice approval, legal/tax advice, UAT acceptance or production GO.",
  },
];

const invoiceDecisionManifest = [
  {
    caseId: "P2-10-DEC-01",
    title: "Collection model and payer decision",
    requiredDecision:
      "KHTC identifies collection model, payer type, source receivable/payment reference and whether HEU or the center is the issuing party.",
    stopCondition:
      "Missing collection model, payer type, source reference or issuing-party decision keeps P2-10 BLOCKED.",
  },
  {
    caseId: "P2-10-DEC-02",
    title: "Required invoice/chung-tu issuance decision",
    requiredDecision:
      "For REQUIRED cases, invoice issuer, invoice number, invoice date and controlled evidence reference are present before downstream reconciliation.",
    stopCondition:
      "A REQUIRED case without number/date/evidence, or with uncontrolled evidence, keeps P2-10 NO_GO.",
  },
  {
    caseId: "P2-10-DEC-03",
    title: "Not-required or waiver basis decision",
    requiredDecision:
      "NOT_REQUIRED or WAIVED_BY_AUTHORITY cases cite owner, reason, legal/policy basis, expiry/review date and controlled approval evidence.",
    stopCondition:
      "User self-selects not required, waiver lacks authority, or legal/policy basis is unclear.",
  },
  {
    caseId: "P2-10-DEC-04",
    title: "Pending policy downstream blocker decision",
    requiredDecision:
      "Every PENDING_POLICY case blocks P2-13 reconciliation, P2-14 lock and P2-15 payment request until KHTC/PHAP_CHE decide.",
    stopCondition:
      "Unresolved invoice/chung-tu policy can continue to reconciliation, period lock or partner payment request.",
  },
  {
    caseId: "P2-10-DEC-05",
    title: "Evidence redaction and storage decision",
    requiredDecision:
      "Evidence is stored in a controlled location and tracked by safe reference only, with raw bank data, CCCD, phones, voucher bodies and credentials excluded.",
    stopCondition:
      "Raw sensitive evidence appears in Git/Codex/chat, app notes, screenshots or uncontrolled links.",
  },
  {
    caseId: "P2-10-DEC-06",
    title: "Final KHTC/PHAP_CHE sign-off decision",
    requiredDecision:
      "KHTC and PHAP_CHE sign the final P2-10 invoice/chung-tu result with decision ID, signer, date and controlled evidence references.",
    stopCondition:
      "Missing decision ID, unsigned owner, unresolved policy case, raw sensitive evidence, legal/tax ambiguity or PASS_LOCAL treated as approval keeps P2-10 BLOCKED or NO_GO.",
  },
];

export function TtgdtxInvoicePolicyMatrix() {
  return (
    <section
      data-ttgdtx-invoice-policy-matrix="P2-10"
      className="rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-start gap-3">
            <ReceiptText className="mt-0.5 size-5 shrink-0 text-emerald-700" />
            <div>
              <h2 className="font-semibold text-zinc-950">
                Ma trận hóa đơn/chứng từ khi Thu học phí (P2-10)
              </h2>
              <p className="mt-1 leading-6 text-zinc-600">
                Không trả lời yes/no toàn cục. Mỗi khoản thu phải được phân loại
                theo mô hình thu, người nộp tiền, bên phát hành và căn cứ
                KHTC/Pháp chế trước khi coi là đủ điều kiện đi tiếp.
              </p>
            </div>
          </div>
        </div>
        <div className="flex min-w-60 items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            PASS_LOCAL trong phần mềm; vẫn cần ký xác nhận KHTC/Pháp chế trước
            khi dùng production.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        {ttgdtxInvoicePolicyPrinciples.map((principle, index) => (
          <div
            key={principle}
            className="border-l-2 border-emerald-200 bg-emerald-50/60 px-3 py-2 text-emerald-950"
          >
            <span className="text-xs font-semibold uppercase text-emerald-700">
              Rule {index + 1}
            </span>
            <p className="mt-1 leading-5">{principle}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[980px] table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
              <th className="w-40 py-2 pr-3 font-semibold">Mô hình thu</th>
              <th className="w-52 py-2 pr-3 font-semibold">Người nộp</th>
              <th className="w-48 py-2 pr-3 font-semibold">Quyết định</th>
              <th className="w-52 py-2 pr-3 font-semibold">Bên phát hành</th>
              <th className="w-64 py-2 pr-3 font-semibold">Bằng chứng tối thiểu</th>
              <th className="w-64 py-2 pr-3 font-semibold">Chặn nếu thiếu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {ttgdtxInvoicePolicyCases.map((policyCase) => (
              <tr key={policyCase.code} className="align-top">
                <td className="py-3 pr-3 font-medium text-zinc-950">
                  <span className="block">{policyCase.collectionModel}</span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    {policyCase.code}
                  </span>
                </td>
                <td className="py-3 pr-3 text-zinc-700">{policyCase.payerType}</td>
                <td className="py-3 pr-3">
                  <span
                    className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${requirementTone[policyCase.invoiceRequired]}`}
                  >
                    {invoiceRequirementLabels[policyCase.invoiceRequired]}
                  </span>
                  <span className="mt-2 block text-xs text-zinc-500">
                    Mục tiêu: {invoiceStatusTargets[policyCase.targetStatus]}
                  </span>
                </td>
                <td className="py-3 pr-3 text-zinc-700">
                  {policyCase.defaultIssuer}
                </td>
                <td className="py-3 pr-3 text-zinc-700">
                  <ul className="space-y-1">
                    {policyCase.requiredEvidence.map((item) => (
                      <li key={item} className="leading-5">
                        {item}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-3 pr-3 text-zinc-700">
                  <p className="leading-5">{policyCase.blocks}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Tiếp theo: {policyCase.nextAction}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-start gap-2 border-l-2 border-blue-300 bg-blue-50 px-3 py-2 text-blue-950">
        <Scale className="mt-0.5 size-4 shrink-0" />
        <p>
          Đây là ma trận vận hành để chọn đúng trường trong P2-10, không phải tư
          vấn thuế/pháp lý cuối cùng. Trường hợp khác mẫu phải để PENDING_POLICY
          và xin xác nhận owner.
        </p>
      </div>

      <div
        data-ttgdtx-invoice-evidence-checklist="P2-10"
        className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-2">
            <FileCheck2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
            <div>
              <h3 className="font-semibold text-emerald-950">
                P2-10 invoice/chung-tu UAT evidence checklist: PASS_LOCAL only
              </h3>
              <p className="mt-2 leading-6 text-emerald-900">
                Checklist này dùng để gom bằng chứng cho KHTC/Pháp chế ký UAT
                ngoài Codex/chat. Nó không tự phê duyệt hóa đơn, miễn chứng từ,
                tư vấn thuế/pháp lý hoặc production GO.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-emerald-200 bg-white px-3 py-2 font-mono text-xs text-emerald-950">
            P2_10_INVOICE_ACCEPT / FAIL / BLOCKED
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {invoiceEvidenceChecklist.map((item) => (
            <article
              key={item.caseId}
              className="rounded-md border border-emerald-200 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-emerald-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
              <p className="mt-2 leading-5 text-zinc-700">
                Evidence: {item.evidence}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div
        data-ttgdtx-invoice-decision-manifest="P2-10"
        className="mt-5 rounded-md border border-blue-200 bg-blue-50 p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-blue-700" />
            <div>
              <h3 className="font-semibold text-blue-950">
                P2-10 invoice/chung-tu decision manifest: PASS_LOCAL only
              </h3>
              <p className="mt-2 leading-6 text-blue-900">
                Manifest này tách riêng câu hỏi thu tiền có cần hóa đơn/chứng
                từ không, ai phát hành, bằng chứng nào được chấp nhận và bước
                nào phải bị chặn nếu chưa rõ. Nó không phê duyệt xuất hóa đơn,
                tư vấn thuế/pháp lý, hạch toán tài chính, nghiệm thu UAT, ghi
                nhận doanh thu hoặc production GO.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-blue-200 bg-white px-3 py-2 font-mono text-xs text-blue-950">
            P2_10_INVOICE_READY / NO_GO / BLOCKED
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {invoiceDecisionManifest.map((item) => (
            <article
              key={item.caseId}
              className="rounded-md border border-blue-200 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-blue-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
              <p className="mt-2 leading-5 text-zinc-700">
                Decision evidence: {item.requiredDecision}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-4 rounded-md border border-rose-200 bg-white px-3 py-2 leading-6 text-rose-900">
          Stop immediately if any decision ID is missing, KHTC/PHAP_CHE
          signature is absent, invoice/chung-tu basis is unresolved,
          PENDING_POLICY is allowed downstream, raw sensitive evidence is
          referenced or PASS_LOCAL is treated as invoice approval.
        </p>
      </div>
    </section>
  );
}
