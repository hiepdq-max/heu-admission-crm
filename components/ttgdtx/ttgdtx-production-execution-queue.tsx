import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";

type ExecutionStep = {
  code: string;
  title: string;
  owner: string;
  proof: string;
  href?: string;
};

const executionSteps: ExecutionStep[] = [
  {
    code: "P0-10",
    title: "Apply controlled evidence redaction",
    owner: "IT_DATA + Audit",
    proof:
      "Use the redaction pack before any UAT screenshot, backup proof, voucher or signed evidence is referenced.",
    href: "/audit",
  },
  {
    code: "P0-03",
    title: "Execute backup and restore dry-run",
    owner: "IT_DATA + Audit",
    proof:
      "Attach backup ID, restore target, preflight/postflight output and smoke-check evidence outside Git.",
    href: "/settings/supabase-check",
  },
  {
    code: "Step90-Step110",
    title: "Sign migration order",
    owner: "IT_DATA + KHTC + PHAP_CHE",
    proof:
      "Approve migration order and Step97, Step100, Step109, Step110 decisions after backup/restore evidence.",
  },
  {
    code: "P6-04",
    title: "Run role and workspace UAT",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    proof:
      "Test ADMIN, BGH, KHTC, TUYEN_SINH, PHAP_CHE, AUDIT and out-of-scope accounts with synthetic users.",
    href: "/settings/scopes",
  },
  {
    code: "P0-19",
    title: "Sign legal and finance gate UAT",
    owner: "PHAP_CHE + KHTC + BGH",
    proof:
      "Prove legal basis, tuition policy and ALLOW_FINANCE gate before any receivable or payment trust.",
    href: "/ttgdtx/gate",
  },
  {
    code: "P2-17",
    title: "Prove payout cannot run twice",
    owner: "KHTC + BGH + Audit",
    proof:
      "Run duplicate-click, overpay, voucher normalization, RPC-only and required dossier UAT.",
    href: "/ttgdtx/payment-requests/pay",
  },
  {
    code: "P2-18",
    title: "Prove dashboard is read-only and reconciled",
    owner: "KHTC + BGH + IT_DATA",
    proof:
      "Compare dashboard totals to source workflows and prove role-scoped, read-only behavior.",
    href: "/ttgdtx/accounting-dashboard",
  },
  {
    code: "P6-03/P6-06",
    title: "Close audit-log and hard-delete risks",
    owner: "IT_DATA + Audit",
    proof:
      "Attach traceability rows for finance actions and conversion or written waiver for remaining cascade risks.",
    href: "/audit",
  },
  {
    code: "Owner GO/NO-GO",
    title: "Record final owner decision",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT",
    proof:
      "Use the owner sign-off pack. Production remains NO-GO until every required owner signs GO.",
  },
];

export function TtgdtxProductionExecutionQueue() {
  return (
    <section
      className="rounded-lg border border-indigo-200 bg-indigo-50 p-5 text-sm shadow-sm"
      data-ttgdtx-production-execution-queue="TTGDTX_9PLUS"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-4xl items-start gap-3">
          <ClipboardList className="mt-0.5 size-5 shrink-0 text-indigo-700" />
          <div>
            <h2 className="font-semibold text-indigo-950">
              TTGDTX production execution queue: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-indigo-900">
              Execute in this order: redaction, backup/restore, migration order,
              role UAT, P0-19, P2-17, P2-18, audit/hard-delete, then final
              owner Go/No-Go. Do not skip ahead; every item needs controlled
              evidence and human owner sign-off.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-indigo-200 bg-white px-3 py-2 text-indigo-950">
          Final result stays NO-GO until signed owner GO exists.
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-3">
        {executionSteps.map((step, index) => (
          <article
            key={step.code}
            className="border-l-2 border-indigo-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-indigo-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-indigo-700">
                  {String(index + 1).padStart(2, "0")} - {step.code}
                </p>
                <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Owner: {step.owner}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">{step.proof}</p>
                {step.href ? (
                  <Link
                    href={step.href}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase text-indigo-700 hover:text-indigo-950"
                  >
                    Open workflow
                    <ArrowRight className="size-3" />
                  </Link>
                ) : (
                  <p className="mt-3 text-xs font-medium uppercase text-indigo-700">
                    Evidence pack required
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
