import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

type WorkflowStage = {
  code: string;
  title: string;
  owner: string;
  status: "PASS_LOCAL" | "BLOCKED" | "DESIGN_ONLY";
  gate: string;
  stop: string;
};

type DataObject = {
  code: string;
  purpose: string;
  gate: string;
  evidence: string;
};

const workflowStages: WorkflowStage[] = [
  {
    code: "ADV-01",
    title: "De nghi tam ung",
    owner: "Nguoi de nghi + Truong bo phan",
    status: "DESIGN_ONLY",
    gate: "ADVANCE_READY / NO_GO / BLOCKED",
    stop: "Con tam ung qua han, thieu nhiem vu hoac thieu ngan sach.",
  },
  {
    code: "ADV-02",
    title: "KHTC kiem ngan sach va chung tu du kien",
    owner: "KHTC",
    status: "DESIGN_ONLY",
    gate: "ADVANCE_READY / NO_GO / BLOCKED",
    stop: "Muc dich chi khong ro hoac vuot nguong chua duyet.",
  },
  {
    code: "ADV-03",
    title: "Hoan ung / thanh toan tam ung",
    owner: "Nguoi nhan tam ung + KHTC + Audit",
    status: "DESIGN_ONLY",
    gate: "ADVANCE_RECON_READY / NO_GO / BLOCKED",
    stop: "Thieu chung tu, sai muc dich, chua nop lai tien thua.",
  },
  {
    code: "PAY-01",
    title: "De nghi thanh toan",
    owner: "Nguoi de nghi + Truong bo phan",
    status: "DESIGN_ONLY",
    gate: "PAYMENT_REQUEST_READY / NO_GO / BLOCKED",
    stop: "Chua nghiem thu, thieu hop dong/phu luc hoac thieu nguon tien.",
  },
  {
    code: "PAY-02",
    title: "Phap che/Audit/KHTC kiem tra",
    owner: "PHAP_CHE + AUDIT + KHTC",
    status: "DESIGN_ONLY",
    gate: "PAYMENT_REQUEST_READY / NO_GO / BLOCKED",
    stop: "Audit/legal hold dang mo hoac payment duplicate risk.",
  },
  {
    code: "PAY-03",
    title: "Ghi nhan metadata thanh toan",
    owner: "KHTC",
    status: "BLOCKED",
    gate: "PAYMENT_READY / NO_GO / BLOCKED",
    stop: "Chua co signed SOP, UAT, owner signoff; app khong chuyen tien.",
  },
];

const dataObjects: DataObject[] = [
  {
    code: "ADVANCE_MASTER",
    purpose: "Ho so tam ung va trang thai vong doi.",
    gate: "ADVANCE_GATE",
    evidence: "advance_id, requester, budget_code, amount, due date, status.",
  },
  {
    code: "ADVANCE_RECON_LOG",
    purpose: "Bang ke hoan ung, tien thua, bo sung va dong ho so.",
    gate: "ADVANCE_RECON_GATE",
    evidence: "recon_id, valid/invalid amount, reviewer, decision value.",
  },
  {
    code: "PAYMENT_REQUEST",
    purpose: "De nghi thanh toan truoc khi phe duyet.",
    gate: "PAYMENT_REQUEST_GATE",
    evidence: "request_id, payment_group, amount, payee_ref, evidence_ref.",
  },
  {
    code: "PAYMENT_MASTER",
    purpose: "Metadata thanh toan sau khi duyet.",
    gate: "PAYMENT_GATE",
    evidence: "payment_id, paid_at, paid_amount, voucher_ref, executor.",
  },
  {
    code: "FINANCE_APPROVAL_LOG",
    purpose: "Dau vet nguoi kiem, nguoi duyet va quyet dinh.",
    gate: "HUMAN_APPROVAL_GATE",
    evidence: "checker, approver, decision, note, evidence_ref.",
  },
  {
    code: "EVIDENCE_REFERENCE",
    purpose: "Tham chieu chung tu an toan.",
    gate: "P0_10_EVIDENCE_GATE",
    evidence: "evidence class, controlled folder ref, reviewer, review date.",
  },
];

const stopRules = [
  "Khong tao tam ung that, khong tao thanh toan that trong mock shell.",
  "Khong tu dong gan no, khong tinh COM production, khong thuc hien chuyen khoan.",
  "Khong dua voucher, sao ke, payroll, bank account, CCCD, PII vao Git/Codex/chat.",
  "Khong coi PASS_LOCAL la SOP da ban hanh, UAT pass, finance approval hoac production GO.",
];

function statusClass(status: WorkflowStage["status"]) {
  if (status === "BLOCKED") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "PASS_LOCAL") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function AdvancePaymentWorkflowShell() {
  return (
    <div
      className="space-y-6"
      data-heu-advance-payment-workflow-shell="P5-04"
      data-heu-advance-payment-boundary="PASS_LOCAL DESIGN_ONLY NO_PRODUCTION_PAYMENT NO_BANK_TRANSFER NO_AUTO_COM NO_UAT_ACCEPTANCE NO_OWNER_GO"
    >
      <section className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              P5-04 / Finance SOP mock workflow
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Tam ung va thanh toan: read-only control shell
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Shell nay bien SOP tam ung/thanh toan thanh workflow, data
              dictionary, gate va audit surface. Day la mock/read-only; moi
              nghiep vu tien that van bi chan den khi co SOP ky, UAT, evidence
              va owner signoff.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <div className="flex items-center gap-2 font-semibold text-slate-950">
              <ShieldCheck className="h-4 w-4" />
              PASS_LOCAL only
            </div>
            <p className="mt-1 max-w-xs">
              Production NO-GO. Khong co nut tao, duyet, chi tien, reverse hay
              GO.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["ADVANCE_GATE", "Chan tam ung neu con qua han/thieu ngan sach"],
          ["PAYMENT_REQUEST_GATE", "Chan de nghi neu thieu nghiem thu/chung tu"],
          ["PAYMENT_GATE", "Chan chi tien neu thieu phe duyet/voucher"],
          ["P0_10_EVIDENCE_GATE", "Chan raw evidence vao Git/Codex/chat"],
        ].map(([label, detail]) => (
          <div key={label} className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <LockKeyhole className="h-4 w-4" />
              {label}
            </div>
            <p className="mt-2 text-sm leading-5 text-slate-600">{detail}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-950">Workflow mock</h3>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {workflowStages.map((stage) => (
            <div key={stage.code} className="rounded-md border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-500">
                    {stage.code}
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-950">
                    {stage.title}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{stage.owner}</div>
                </div>
                <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClass(stage.status)}`}>
                  {stage.status}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <div className="font-semibold text-slate-800">Gate</div>
                  <p className="mt-1 text-slate-600">{stage.gate}</p>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Stop</div>
                  <p className="mt-1 text-slate-600">{stage.stop}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <ReceiptText className="h-5 w-5 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-950">Data dictionary surface</h3>
        </div>
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Object</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Gate</th>
                <th className="px-4 py-3">Evidence fields</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataObjects.map((item) => (
                <tr key={item.code}>
                  <td className="px-4 py-3 font-semibold text-slate-950">{item.code}</td>
                  <td className="px-4 py-3 text-slate-600">{item.purpose}</td>
                  <td className="px-4 py-3 text-slate-600">{item.gate}</td>
                  <td className="px-4 py-3 text-slate-600">{item.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-base font-semibold text-amber-900">
            <AlertTriangle className="h-5 w-5" />
            Immediate stop rules
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
            {stopRules.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-700" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <FileText className="h-5 w-5" />
            Control references
          </div>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <Link className="flex items-center gap-2 text-slate-900 underline-offset-4 hover:underline" href="/finance-desk">
              HEU Finance Desk <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className="flex items-center gap-2 text-slate-900 underline-offset-4 hover:underline" href="/reports">
              Report View / Data Quality <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className="flex items-center gap-2 text-slate-900 underline-offset-4 hover:underline" href="/audit">
              Audit evidence controls <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            Safe next step: signed SOP/UAT planning, not payment execution.
          </div>
        </div>
      </section>
    </div>
  );
}
