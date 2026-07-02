import Link from "next/link";
import {
  ArrowRightLeft,
  ClipboardCheck,
  FileWarning,
  GraduationCap,
  Landmark,
  ListChecks,
  ReceiptText,
  ShieldCheck,
  ShieldAlert,
  WalletCards,
} from "lucide-react";

const controlRows = [
  {
    code: "HOU-LH-01",
    label: "Identity and route",
    owner: "Tuyen sinh + HOU owner",
    gate: "Student, program, major, location and stage are complete.",
  },
  {
    code: "HOU-LH-02",
    label: "Handover packet",
    owner: "CTHSSV + Dao tao",
    gate: "Scoped receiver accepts or rejects the HOU packet with evidence.",
  },
  {
    code: "HOU-LH-03",
    label: "Tuition ledger basis",
    owner: "KHTC + HOU owner",
    gate: "Tuition source, term, credit count and collection owner are known.",
  },
  {
    code: "HOU-LH-04",
    label: "Invoice or receipt decision",
    owner: "KHTC + Phap Che",
    gate: "Issuer, required voucher and waiver basis are captured before reliance.",
  },
  {
    code: "HOU-LH-05",
    label: "COM policy version",
    owner: "HOU owner + KHTC",
    gate: "Commission policy, tax, offset and breakeven check are signed.",
  },
  {
    code: "HOU-LH-06",
    label: "Payment batch release",
    owner: "KHTC + BGH",
    gate: "Batch approval, voucher evidence and duplicate guard are proven.",
  },
  {
    code: "HOU-LH-07",
    label: "Report view signoff",
    owner: "BGH + Audit",
    gate: "RV_HOU_LEDGER_SUMMARY has owner signoff and UAT evidence.",
  },
  {
    code: "HOU-LH-08",
    label: "Production stop rule",
    owner: "IT_DATA + Audit",
    gate: "No HOU posting, payout or dashboard reliance before signed UAT.",
  },
];

const gapRows = [
  {
    area: "Handover",
    current: "Lead and evidence primitives exist.",
    gap: "Accepted HOU handover decision is not yet signed.",
  },
  {
    area: "Tuition ledger",
    current: "HOU tuition and revenue-share objects exist.",
    gap: "Ledger source, invoice or receipt basis and owner signoff are pending.",
  },
  {
    area: "COM",
    current: "Claim, claim-line and payment-batch screens exist.",
    gap: "Policy version, breakeven and payout UAT are still blockers.",
  },
  {
    area: "Report view",
    current: "RV_HOU_LEDGER_SUMMARY is registered in report governance.",
    gap: "Owner signoff and source reconciliation evidence are pending.",
  },
];

const uatResultLedgerRows = [
  {
    code: "HOU-UAT-LEDGER-01",
    uat: "HOU-UAT-01",
    control: "HOU-LH-01",
    evidence: "Route/user screenshot ref plus HOU program, major and stage label.",
    stop: "Screen implies HOU is production ready or COM can be paid.",
  },
  {
    code: "HOU-UAT-LEDGER-02",
    uat: "HOU-UAT-02",
    control: "HOU-LH-02",
    evidence: "Receiver accept/reject decision ref plus handover packet evidence class.",
    stop: "Receiver can create ledger or approve COM from the handover surface.",
  },
  {
    code: "HOU-UAT-LEDGER-03",
    uat: "HOU-UAT-03",
    control: "HOU-LH-03 / HOU-LH-04",
    evidence: "Tuition basis, invoice/chung-tu decision and voucher or waiver route ref.",
    stop: "Ledger can post or collection is relied on before signed proof.",
  },
  {
    code: "HOU-UAT-LEDGER-04",
    uat: "HOU-UAT-04",
    control: "HOU-LH-07",
    evidence: "RV_HOU_LEDGER_SUMMARY DQ/source/signoff blocker ref.",
    stop: "Dashboard is relied on before report-view owner signoff.",
  },
  {
    code: "HOU-UAT-LEDGER-05",
    uat: "HOU-UAT-05",
    control: "HOU-LH-05 / HOU-LH-06",
    evidence: "Negative route/user evidence ref for restricted rate, COM or payout data.",
    stop: "Out-of-scope staff see restricted finance, COM policy or payout detail.",
  },
  {
    code: "HOU-UAT-LEDGER-06",
    uat: "HOU-UAT-06",
    control: "HOU-LH-08",
    evidence: "Actor, owner, evidence ref, reviewer and decision trace row.",
    stop: "PASS_LOCAL, Codex or AI output is treated as UAT or owner approval.",
  },
];

function StatusBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex max-w-full rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-left text-xs font-medium leading-5 text-amber-700">
      {children}
    </span>
  );
}

export function HouLedgerHandoverGapPack() {
  return (
    <section
      data-heu-hou-ledger-handover-gap-pack="P8-01"
      className="rounded-lg border border-zinc-200 bg-white shadow-sm"
    >
      <div className="border-b border-zinc-200 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
              <GraduationCap className="size-5 text-zinc-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">
                  HOU Ledger/Handover Gap Pack: PASS_LOCAL only
                </h2>
                <StatusBadge>HOU_LEDGER_READY / NO_GO / BLOCKED</StatusBadge>
              </div>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
                Gói này giữ HOU ledger, handover, học phí và COM tách riêng
                khỏi TTGDTX và Short Course. Nó chỉ hiển thị checklist kiểm soát
                để chuẩn bị UAT, không phê duyệt bàn giao, ghi sổ học phí, xuất
                hóa đơn, chi COM hay dùng dashboard làm căn cứ production.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-700">
              DRAFT_CONTROL
            </span>
            <span className="rounded-md bg-rose-50 px-2 py-1 text-rose-700">
              Production NO-GO
            </span>
          </div>
        </div>
      </div>

      <div
        className="border-b border-zinc-200 p-5"
        data-heu-hou-short-course-scope-switch="REAL-OPS-07_QUICK_SCOPE_SWITCH"
        data-heu-hou-short-course-quick-link="HOU_TO_SHORT_COURSE"
      >
        <div className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ArrowRightLeft className="size-4 shrink-0 text-zinc-600" />
              <span className="truncate">HOU / Short Course scope switch</span>
            </div>
            <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
              Quick access keeps HOU ledger and Short Course attendance/payment
              in separate PASS_LOCAL surfaces for REAL-OPS-07 review.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 text-sm font-medium">
            <Link
              href="/short-course"
              aria-label="Open Short Course control surface from HOU scope switch"
              title="Open Short Course control surface"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-700 hover:bg-zinc-100"
            >
              Open Short Course
            </Link>
            <Link
              href="/master-control"
              aria-label="Open Master Control from HOU scope switch"
              title="Open Master Control"
              className="rounded-md bg-zinc-950 px-3 py-2 text-white hover:bg-zinc-800"
            >
              Master Control
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-4">
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <ClipboardCheck className="size-4" />
            Handover
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            CTHSSV, Đào tạo và HOU owner phải có quyết định nhận hoặc trả lại
            gói bàn giao trước khi finance dựa vào dữ liệu.
          </p>
        </div>
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <Landmark className="size-4" />
            Tuition ledger
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            Ledger cần nguồn học phí, kỳ, tín chỉ, đơn giá, chủ thể thu và bằng
            chứng hóa đơn hoặc chứng từ riêng.
          </p>
        </div>
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <WalletCards className="size-4" />
            COM policy
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            COM chỉ là preview cho tới khi phiên bản chính sách, thuế, bù trừ
            công nợ, hòa vốn và batch chi được ký.
          </p>
        </div>
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <ReceiptText className="size-4" />
            Report view
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            RV_HOU_LEDGER_SUMMARY chỉ được tin cậy khi có source reconciliation,
            owner signoff và UAT evidence.
          </p>
        </div>
      </div>

      <div className="grid gap-5 border-t border-zinc-200 p-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Gate</th>
                <th className="px-4 py-3">Control</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Required proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {controlRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {row.label}
                  </td>
                  <td className="px-4 py-4 text-zinc-700">{row.owner}</td>
                  <td className="px-4 py-4 text-zinc-600">{row.gate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          {gapRows.map((row) => (
            <div key={row.area} className="rounded-md border border-zinc-200 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-950">
                  {row.area}
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {row.current}
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-amber-700">
                <FileWarning className="mt-0.5 size-4 shrink-0" />
                {row.gap}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="border-t border-zinc-200 p-5"
        data-heu-hou-uat-result-ledger="P8-01_UAT_RESULT_LEDGER"
        data-heu-hou-uat-result-decision="HOU_UAT_RESULT_READY_NO_GO_BLOCKED"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ListChecks className="size-4 text-zinc-600" />
              <span>HOU UAT result ledger</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Record HOU-UAT-01 through HOU-UAT-06 in
              docs/HEU_HOU_UAT_RESULT_LEDGER_TEMPLATE_20260703.md before
              relying on HOU handover, tuition ledger, invoice/chung-tu, COM or
              report-view outputs. Each row needs a controlled evidence ref,
              reviewer and linked HOU-LH decision outside Codex/chat.
            </p>
          </div>
          <StatusBadge>HOU_UAT_RESULT_READY / NO_GO / BLOCKED</StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[18%] px-4 py-3">Ledger</th>
                <th className="w-[13%] px-4 py-3">UAT</th>
                <th className="w-[17%] px-4 py-3">Control</th>
                <th className="w-[26%] px-4 py-3">Evidence ref</th>
                <th className="w-[26%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {uatResultLedgerRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.uat}
                  </td>
                  <td className="break-words px-4 py-4 text-zinc-700">
                    {row.control}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.evidence}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start gap-2 text-sm leading-6 text-amber-800">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            PASS_LOCAL does not approve HOU handover, tuition ledger posting,
            invoice issuance, COM payout, finance action, UAT acceptance,
            evidence acceptance, owner GO or production GO.
          </p>
        </div>
      </div>
    </section>
  );
}
