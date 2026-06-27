import { Ban, FileLock2, ShieldAlert } from "lucide-react";

const accountControlRules = [
  {
    caseId: "ACCT-CTRL-01",
    title: "Tuition-account freeze notice",
    scope:
      "Track only metadata/evidence link, owner, affected scope and communication reference.",
    boundary: "No bank action, no raw recipient list and no account freeze approval.",
  },
  {
    caseId: "ACCT-CTRL-02",
    title: "Tuition-account release request",
    scope:
      "Track only metadata/evidence link, bank-confirmation reference and human finance approval reference.",
    boundary:
      "No account release action, no bank instruction and no production operation.",
  },
  {
    caseId: "ACCT-CTRL-03",
    title: "Communication evidence",
    scope:
      "Track channel, owner, acknowledgement state and controlled evidence reference.",
    boundary:
      "No raw phone list, bank-recipient list, CCCD or private message body in Git/Codex/chat.",
  },
  {
    caseId: "ACCT-CTRL-04",
    title: "Collateral giai-chap separation",
    scope:
      "Keep collateral release in a separate restricted legal-finance register outside the TTGDTX payment flow.",
    boundary:
      "Never mix collateral release with tuition-account release or partner payment approval.",
  },
];

export function TtgdtxAccountControlScopeGuard() {
  return (
    <section
      data-ttgdtx-account-control-scope-guard="P2-19"
      className="rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <FileLock2 className="mt-0.5 size-5 shrink-0 text-slate-700" />
          <div>
            <h2 className="font-semibold text-slate-950">
              Account-control scope guard: metadata-only
            </h2>
            <p className="mt-2 leading-6 text-slate-700">
              Phong toa/giai toa tai khoan trong TTGDTX 9+ chi duoc theo doi
              nhu metadata/evidence reference. Ung dung khong gui lenh ngan
              hang, khong danh dau tai khoan da phong toa/giai toa, khong phe
              duyet giai chap va khong thay the chu ky KHTC/CTHSSV/Phap Che.
            </p>
          </div>
        </div>
        <div className="flex min-w-64 items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
          <Ban className="mt-0.5 size-4 shrink-0" />
          <p>
            PASS_LOCAL scope decision only. No bank operation, collateral
            release, payout, UAT acceptance, data import, production migration
            or production GO.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {accountControlRules.map((item) => (
          <article
            key={item.caseId}
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-slate-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-600">
                  {item.caseId}
                </p>
                <p className="mt-1 font-medium text-slate-950">{item.title}</p>
                <p className="mt-2 leading-5 text-slate-700">
                  Scope: {item.scope}
                </p>
                <p className="mt-2 leading-5 text-rose-800">
                  Boundary: {item.boundary}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
