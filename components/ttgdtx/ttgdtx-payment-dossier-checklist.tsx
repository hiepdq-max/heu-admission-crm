import {
  AlertTriangle,
  FileCheck2,
  ListChecks,
  ShieldCheck,
} from "lucide-react";

type PaymentDossierStep = "P2-15" | "P2-17";

type DossierItem = {
  title: string;
  owner: string;
  evidence: string;
  blocks: string;
};

type DossierAcceptanceItem = {
  caseId: string;
  title: string;
  minimum: string;
  stopCondition: string;
};

const sharedDossierItems: DossierItem[] = [
  {
    title: "Kỳ P2-14 đã khóa",
    owner: "KHTC + BGH",
    evidence: "Locked reconciliation period, accepted amount and source line count",
    blocks: "Không lập đề nghị thanh toán từ kỳ chưa khóa hoặc còn lệch đối soát.",
  },
  {
    title: "BBNT nghiệm thu đúng kỳ",
    owner: "KHTC + Pháp chế + BGH",
    evidence: "Signed/sealed BBNT, accepted-period summary and student/list basis",
    blocks: "Không lập đề nghị hoặc chi tiền nếu thiếu nghiệm thu đúng trung tâm/kỳ.",
  },
  {
    title: "Hóa đơn/chứng từ đối tác",
    owner: "KHTC + Pháp chế",
    evidence: "Partner invoice evidence or approved waiver linked through P2-19",
    blocks: "Không chuyển duyệt hoặc chi nếu hóa đơn đối tác chưa đạt hoặc chưa được miễn.",
  },
  {
    title: "Căn cứ tính số tiền",
    owner: "KHTC + Audit",
    evidence: "Formula basis, accepted count, reconciled amount and requested amount",
    blocks: "Không trả vượt công thức, vượt kỳ hoặc vượt số đã duyệt.",
  },
  {
    title: "P2-19 source-control checks",
    owner: "IT_DATA + Audit",
    evidence: "P2_19_ACCEPTANCE_BEFORE_PAYOUT and P2_19_PARTNER_INVOICE_BEFORE_PAYOUT pass",
    blocks: "Không bypass source-control; chỉ dùng metadata/evidence đã được kiểm.",
  },
];

const stepSpecificItems: Record<PaymentDossierStep, DossierItem[]> = {
  "P2-15": [
    {
      title: "Link bộ hồ sơ P2-15",
      owner: "KHTC",
      evidence: "One dossier link containing BBNT, partner invoice/waiver and calculation note",
      blocks: "Server action rejects P2-15 when evidence_url is missing.",
    },
  ],
  "P2-17": [
    {
      title: "P2-16 đã duyệt và chứng từ chi",
      owner: "KHTC + BGH",
      evidence: "Approved request, payout voucher number, payout evidence link and one-time guard",
      blocks: "Server action rejects payout without voucher/evidence; RPC blocks overpay or duplicate payout.",
    },
  ],
};

const stepLabels: Record<PaymentDossierStep, string> = {
  "P2-15": "Lập đề nghị thanh toán",
  "P2-17": "Chi tiền",
};

const dossierAcceptanceItems: DossierAcceptanceItem[] = [
  {
    caseId: "P2-DOSSIER-ACCEPT-01",
    title: "Locked reconciliation period accepted",
    minimum:
      "P2-14 period is locked, accepted amount and source line count are recorded, and no unresolved reconciliation variance remains.",
    stopCondition:
      "Period is unlocked, accepted amount is unclear, source line count is missing or variance remains unresolved.",
  },
  {
    caseId: "P2-DOSSIER-ACCEPT-02",
    title: "BBNT accepted-period proof complete",
    minimum:
      "Signed/sealed BBNT matches center, period, accepted learners/service basis and controlled evidence reference.",
    stopCondition:
      "BBNT is missing, mismatched to center/period, unsigned, unsealed where required or stored in an uncontrolled location.",
  },
  {
    caseId: "P2-DOSSIER-ACCEPT-03",
    title: "Partner invoice or waiver controlled",
    minimum:
      "Partner invoice evidence passes P2-19, or a written PHAP_CHE/KHTC waiver has owner, reason, expiry/review date and controlled reference.",
    stopCondition:
      "Partner invoice is missing, failed, unchecked or waived orally without written owner authority.",
  },
  {
    caseId: "P2-DOSSIER-ACCEPT-04",
    title: "Payment amount basis reconciles",
    minimum:
      "Formula basis, accepted count, rate, requested amount and remaining payable are reconciled before request approval or payout evidence.",
    stopCondition:
      "Requested or payout amount exceeds formula, accepted period, approved request or remaining payable.",
  },
  {
    caseId: "P2-DOSSIER-ACCEPT-05",
    title: "P2-19 source-control checks pass",
    minimum:
      "P2_19_ACCEPTANCE_BEFORE_PAYOUT and P2_19_PARTNER_INVOICE_BEFORE_PAYOUT are PASS or formally BLOCKED with owner note.",
    stopCondition:
      "Any P2-19 check is FAIL, NOT_CHECKED, missing or manually bypassed.",
  },
  {
    caseId: "P2-DOSSIER-ACCEPT-06",
    title: "Signed UAT and production boundary",
    minimum:
      "KHTC, PHAP_CHE, BGH and Audit sign the dossier UAT evidence before production reliance.",
    stopCondition:
      "PASS_LOCAL is treated as payment approval, payout approval, UAT acceptance, bank transfer instruction or production GO.",
  },
];

export function TtgdtxPaymentDossierChecklist({
  currentStep,
}: {
  currentStep: PaymentDossierStep;
}) {
  const items = [...sharedDossierItems, ...stepSpecificItems[currentStep]];

  return (
    <section
      data-ttgdtx-payment-dossier-checklist={currentStep}
      className="rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <FileCheck2 className="mt-0.5 size-5 shrink-0 text-blue-700" />
          <div>
            <h2 className="font-semibold text-zinc-950">
              Checklist hồ sơ thanh toán TTGDTX ({currentStep})
            </h2>
            <p className="mt-1 leading-6 text-zinc-600">
              Áp dụng trước khi {stepLabels[currentStep].toLowerCase()}. BBNT,
              hóa đơn/chứng từ đối tác, căn cứ tính tiền và P2-19 source-control
              phải cùng đạt; thiếu một điểm thì dừng ở bước hiện tại.
            </p>
          </div>
        </div>
        <div className="flex min-w-64 items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            PASS_LOCAL cho phần mềm; cần signed UAT với KHTC/Pháp chế/BGH trước
            khi dùng production.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {items.map((item) => (
          <div
            key={`${currentStep}-${item.title}`}
            className="border-l-2 border-blue-200 bg-blue-50/60 px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-700" />
              <div>
                <p className="font-medium text-zinc-950">{item.title}</p>
                <p className="mt-1 text-xs text-zinc-500">Owner: {item.owner}</p>
                <p className="mt-2 leading-5 text-zinc-700">
                  Evidence: {item.evidence}
                </p>
                <p className="mt-1 leading-5 text-blue-950">
                  Chặn nếu thiếu: {item.blocks}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        data-ttgdtx-payment-dossier-acceptance-matrix={currentStep}
        className="mt-5 rounded-md border border-blue-200 bg-blue-50 p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-2">
            <ListChecks className="mt-0.5 size-4 shrink-0 text-blue-700" />
            <div>
              <h3 className="font-semibold text-blue-950">
                {currentStep} payment dossier acceptance matrix: PASS_LOCAL only
              </h3>
              <p className="mt-2 leading-6 text-blue-900">
                Matrix nay tach viec du ho so BBNT/hoa don doi tac/can cu tinh
                tien khoi viec phe duyet thanh toan. No chi xac dinh ho so co
                du dieu kien dua cho nguoi co tham quyen xem xet hay phai
                BLOCKED.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-blue-200 bg-white px-3 py-2 font-mono text-xs text-blue-950">
            PAYMENT_DOSSIER_ACCEPT / FAIL / BLOCKED
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {dossierAcceptanceItems.map((item) => (
            <article
              key={`${currentStep}-${item.caseId}`}
              className="rounded-md border border-blue-200 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-blue-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
              <p className="mt-2 leading-5 text-zinc-700">
                Minimum: {item.minimum}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
