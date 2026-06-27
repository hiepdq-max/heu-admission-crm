import { AlertTriangle, ReceiptText, Scale } from "lucide-react";

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
    </section>
  );
}
