import { CheckCircle2, ClipboardCheck, Database, ShieldAlert } from "lucide-react";

const evidenceItems = [
  "Backup ID / snapshot ID",
  "Restore target project/ref",
  "App connection checked against restore target",
  "Preflight and postflight results",
  "Human sign-off",
];

const executionChecklist = [
  {
    caseId: "P0-03-01",
    title: "Backup evidence captured",
    owner: "IT_DATA + Audit",
    evidence:
      "Backup ID, snapshot ID, start/completion timestamp, operator, checker and controlled evidence link.",
  },
  {
    caseId: "P0-03-02",
    title: "Restore target isolated",
    owner: "IT_DATA + Audit",
    evidence:
      "Restore target project/ref is proven to be isolated from production before any test migration.",
  },
  {
    caseId: "P0-03-03",
    title: "App connected to restore target",
    owner: "IT_DATA",
    evidence:
      "Supabase/app connection evidence proves checks are running against the restore target, not production.",
  },
  {
    caseId: "P0-03-04",
    title: "Preflight and postflight commands pass",
    owner: "IT_DATA + Audit",
    evidence:
      "Preflight and postflight results for release gates, backup/restore pack audit, lint and build.",
  },
  {
    caseId: "P0-03-05",
    title: "Data smoke-check and UAT index attached",
    owner: "KHTC + PHAP_CHE + Audit",
    evidence:
      "Smoke-check evidence for receivable, collection, reconciliation, payout, dashboard, role scope and audit-log UAT.",
  },
  {
    caseId: "P0-03-06",
    title: "Human sign-off keeps production NO-GO unless complete",
    owner: "BGH + IT_DATA + KHTC + PHAP_CHE + Audit",
    evidence:
      "Signed GO/NO-GO decision after exception review; any missing backup, restore, UAT or owner decision keeps NO-GO.",
  },
];

const restoreSmokeCheckItems = [
  {
    caseId: "P0-03-SMOKE-01",
    title: "Restore target identity",
    owner: "IT_DATA + Audit",
    evidence:
      "Project/ref, URL and connection banner prove the app and SQL checks point to the isolated restore target.",
    stopCondition: "Stop if any screenshot or query could be production.",
  },
  {
    caseId: "P0-03-SMOKE-02",
    title: "Core master records readable",
    owner: "PHAP_CHE + KHTC",
    evidence:
      "Contract, tuition policy, source-control and TTGDTX master/dropdown records are readable after restore.",
    stopCondition: "Stop if legal or tuition master evidence is missing after restore.",
  },
  {
    caseId: "P0-03-SMOKE-03",
    title: "Finance guard behavior preserved",
    owner: "KHTC + Audit",
    evidence:
      "Duplicate receivable, over-collection, unresolved reconciliation line and duplicate payout voucher guards still block.",
    stopCondition: "Stop if restored database allows a duplicate or overpayment case.",
  },
  {
    caseId: "P0-03-SMOKE-04",
    title: "Role and workspace scope preserved",
    owner: "IT_DATA + TRUONG_PHONG",
    evidence:
      "Authorized, out-of-scope and inactive/revoked test users return the expected read/write boundaries.",
    stopCondition: "Stop if an out-of-scope user can see restricted TTGDTX finance or evidence data.",
  },
  {
    caseId: "P0-03-SMOKE-05",
    title: "Audit trace preserved",
    owner: "Audit + IT_DATA",
    evidence:
      "audit_logs show create, update, check, approve, pay and source-control traceability after restore checks.",
    stopCondition: "Stop if key restored actions cannot be traced to actor, time, entity and action.",
  },
  {
    caseId: "P0-03-SMOKE-06",
    title: "Dashboard source reconciliation preserved",
    owner: "BGH + KHTC",
    evidence:
      "P2-18 dashboard totals match restored source tables and remain read-only for the tested roles.",
    stopCondition: "Stop if dashboard values drift from restored source records.",
  },
];

const localChecks = [
  "audit:ttgdtx-backup-restore-dry-run-pack",
  "audit:ttgdtx-release-gates",
  "npm.cmd run build",
];

export function SupabaseBackupRestoreGuard() {
  return (
    <section
      className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm shadow-sm"
      data-supabase-backup-restore-guard="P0-03"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-4xl items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="font-semibold text-amber-950">
              P0-03 Supabase backup/restore dry-run: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-amber-900">
              Production remains NO-GO until real backup evidence, restore
              evidence, migration preflight/postflight results and owner
              sign-off exist. PASS_LOCAL does not mean backup was executed,
              restore was executed, UAT passed, production migration is
              approved, or production GO is approved.
            </p>
            <p className="mt-2 leading-6 text-amber-900">
              Do not run production migration from Codex/chat. Do not paste
              secrets, passwords, OTPs, service-role keys, bank credentials,
              raw student PII, raw CCCD, raw phone numbers or raw payment data.
            </p>
          </div>
        </div>

        <div className="min-w-72 rounded-md border border-amber-200 bg-white px-3 py-2 text-amber-950">
          Evidence pack:
          <span className="mt-1 block font-mono text-xs">
            STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-amber-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <Database className="size-4 text-amber-700" />
            <p className="text-xs font-semibold uppercase text-amber-700">
              Required evidence
            </p>
          </div>
          <div className="mt-3 space-y-2">
            {evidenceItems.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-amber-700" />
                <span className="text-amber-950">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-amber-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-amber-700">
            Local checks before handoff
          </p>
          <div className="mt-3 space-y-2">
            {localChecks.map((check) => (
              <div key={check} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-amber-700" />
                <span className="font-mono text-xs text-amber-950">
                  {check}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-orange-200 bg-orange-50 p-4 text-orange-950"
        data-p003-backup-restore-evidence-checklist="P0-03"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 font-semibold">
              <ClipboardCheck className="size-4 shrink-0" />
              <span>
                P0-03 backup/restore execution evidence checklist: PASS_LOCAL
                only
              </span>
            </div>
            <p className="mt-2 leading-6">
              Actual backup, restore dry-run, migration preflight/postflight,
              data smoke-check, signed UAT and owner GO/NO-GO evidence are still
              required before production migration can be considered.
            </p>
          </div>
          <div className="min-w-72 rounded-md border border-orange-200 bg-white px-3 py-2">
            Required pack:
            <span className="mt-1 block font-mono text-xs">
              STEP90_STEP110_BACKUP_RESTORE_DRY_RUN_EVIDENCE_PACK_20260627.md
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {executionChecklist.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-orange-300 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-orange-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {item.owner}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">{item.evidence}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          PASS_LOCAL does not prove backup was executed, restore was executed,
          migration is safe, UAT passed, rollback is proven or production GO is
          approved. Do not paste secrets, passwords, OTPs, service-role keys,
          bank credentials, raw student PII, raw CCCD, raw phone numbers or raw
          payment data.
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-950"
        data-p003-restore-smoke-check-acceptance-matrix="P0-03"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 font-semibold">
              <ClipboardCheck className="size-4 shrink-0" />
              <span>
                P0-03 restore smoke-check acceptance matrix: PASS_LOCAL only
              </span>
            </div>
            <p className="mt-2 leading-6">
              A restore dry-run is not acceptable until the restored target
              proves target isolation, core master readability, finance guard
              behavior, role/workspace scope, audit trace and dashboard source
              reconciliation. Any failed stop condition keeps production NO-GO.
            </p>
          </div>
          <div className="min-w-72 rounded-md border border-sky-200 bg-white px-3 py-2">
            Decision:
            <span className="mt-1 block font-mono text-xs">
              RESTORE_SMOKE_CHECK_PASS / FAIL / BLOCKED
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {restoreSmokeCheckItems.map((item) => (
            <article
              key={item.caseId}
              className="border-l-2 border-sky-300 bg-white px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-sky-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {item.owner}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">{item.evidence}</p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop condition: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-sky-200 bg-white px-3 py-2 text-sky-900">
          PASS_LOCAL does not prove an actual restore, smoke-check, UAT pass,
          rollback proof, migration approval or production GO. Attach only
          redacted evidence references; keep raw exports, credentials, bank data,
          vouchers and personal data outside Git/Codex/chat.
        </div>
      </div>
    </section>
  );
}
