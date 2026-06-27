import Link from "next/link";
import {
  AlertTriangle,
  ClipboardCheck,
  FileWarning,
  ShieldAlert,
} from "lucide-react";

type ProductionBlocker = {
  code: string;
  title: string;
  owner: string;
  requiredEvidence: string;
  href?: string;
};

const productionBlockers: ProductionBlocker[] = [
  {
    code: "P0-03",
    title: "Backup and restore dry-run",
    owner: "IT_DATA + Audit",
    requiredEvidence:
      "Backup ID, restore target, preflight/postflight result and smoke-check evidence.",
    href: "/settings/supabase-check",
  },
  {
    code: "Step90-Step110",
    title: "Migration order approval",
    owner: "IT_DATA + KHTC + PHAP_CHE",
    requiredEvidence:
      "Signed migration order after P0-03 evidence is accepted by the required owners.",
  },
  {
    code: "P0-19",
    title: "Legal and finance gate UAT",
    owner: "PHAP_CHE + KHTC + BGH",
    requiredEvidence:
      "Legal basis, tuition policy, finance gate and signed legal/finance UAT.",
    href: "/ttgdtx/gate",
  },
  {
    code: "P2-17",
    title: "Partner payout cannot run twice",
    owner: "KHTC + BGH + Audit",
    requiredEvidence:
      "Duplicate-click, overpay, voucher, RPC-only and dossier evidence signed by owners.",
    href: "/ttgdtx/payment-requests/pay",
  },
  {
    code: "P2-18",
    title: "Accounting dashboard is read-only and reconciled",
    owner: "KHTC + BGH + IT_DATA",
    requiredEvidence:
      "Source comparison, role-scope denial and no-write evidence for dashboard UAT.",
    href: "/ttgdtx/accounting-dashboard",
  },
  {
    code: "P6-04",
    title: "Role and workspace scope UAT",
    owner: "IT_DATA + TRUONG_PHONG + Audit",
    requiredEvidence:
      "ADMIN, BGH, KHTC, PHAP_CHE, AUDIT and out-of-scope browser UAT evidence.",
    href: "/settings/scopes",
  },
  {
    code: "P6-03",
    title: "Audit log traceability",
    owner: "Audit + IT_DATA + KHTC",
    requiredEvidence:
      "Trace rows for create, update, check, approve, pay and source-control events.",
    href: "/audit",
  },
  {
    code: "P6-06",
    title: "Hard-delete and cascade risk",
    owner: "IT_DATA + Audit + business owners",
    requiredEvidence:
      "Conversion evidence or written waiver for unresolved non-TTGDTX/base cascade paths.",
    href: "/audit",
  },
  {
    code: "P0-10",
    title: "Controlled evidence redaction",
    owner: "IT_DATA + Audit",
    requiredEvidence:
      "Controlled evidence location and redacted references; raw evidence stays outside Git/Codex/chat.",
    href: "/audit",
  },
  {
    code: "P0-09",
    title: "Final owner GO/NO-GO decision",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + AUDIT + TRUONG_PHONG",
    requiredEvidence:
      "Final signed multi-owner GO/NO-GO note with every stop condition closed.",
    href: "/ttgdtx",
  },
];

export function ProductionReadinessBlockerSummary() {
  return (
    <section
      data-heu-production-blocker-summary="P5-02"
      className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex max-w-5xl items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-rose-700" />
          <div>
            <h2 className="font-semibold text-rose-950">
              P5-02 production blocker summary: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-rose-900">
              Read-only BGH/owner view for the TTGDTX production blockers.
              Production remains NO-GO until backup/restore, migration order,
              legal/finance UAT, payout UAT, dashboard UAT, role-scope UAT,
              audit-log UAT, cascade waiver, redaction and final owner
              sign-off are completed outside Codex/chat.
            </p>
          </div>
        </div>
        <div className="grid min-w-72 gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-md border border-rose-200 bg-white px-3 py-2 text-rose-950">
            Current recommendation:
            <span className="mt-1 block font-semibold">NO-GO</span>
          </div>
          <div className="rounded-md border border-rose-200 bg-white px-3 py-2 text-rose-950">
            Tracked blockers:
            <span className="mt-1 block font-semibold">
              {productionBlockers.length}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {productionBlockers.map((blocker) => (
          <article
            key={blocker.code}
            className="border-l-2 border-rose-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <FileWarning className="mt-0.5 size-4 shrink-0 text-rose-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-rose-700">
                  {blocker.code}
                </p>
                <p className="mt-1 font-medium text-zinc-950">
                  {blocker.title}
                </p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Owner: {blocker.owner}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {blocker.requiredEvidence}
                </p>
                {blocker.href ? (
                  <Link
                    href={blocker.href}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase text-rose-700 hover:text-rose-950"
                  >
                    Open source view
                    <ClipboardCheck className="size-3" />
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          No GO button is provided here. PASS_LOCAL does not approve production
          dashboard use, finance actions, production migration, UAT acceptance,
          owner waiver or production GO. Do not paste secrets, passwords, OTPs,
          service-role keys, bank credentials, raw student PII, raw CCCD, raw
          phone numbers, raw bank account numbers, bank statements, vouchers or
          raw payment data into Git/Codex/chat.
        </p>
      </div>
    </section>
  );
}
