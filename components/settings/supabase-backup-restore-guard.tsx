import { CheckCircle2, Database, ShieldAlert } from "lucide-react";

const evidenceItems = [
  "Backup ID / snapshot ID",
  "Restore target project/ref",
  "App connection checked against restore target",
  "Preflight and postflight results",
  "Human sign-off",
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
    </section>
  );
}
