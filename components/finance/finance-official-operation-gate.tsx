import { ListChecks, LockKeyhole, ShieldCheck } from "lucide-react";

const officialOperationGates = [
  {
    code: "FIN-OFFICIAL-01",
    title: "P6-04 signed role/workspace UAT",
    proof:
      "Signed role-scope evidence proves the accounting user can access only the approved TTGDTX scope and the negative account is BLOCKED or EMPTY_SCOPED_STATE.",
    stop:
      "Any missing P6-04 signature, broad scope, route leak, raw evidence or unsigned negative test keeps official operation NO-GO.",
  },
  {
    code: "FIN-OFFICIAL-02",
    title: "P2-18 signed accounting-dashboard UAT",
    proof:
      "KHTC/BGH/IT_DATA sign dashboard read-only behavior, source reconciliation, evidence hygiene and reliance boundary outside Codex/chat.",
    stop:
      "Dashboard can write, source totals drift, evidence is uncontrolled or owner reliance is unsigned.",
  },
  {
    code: "FIN-OFFICIAL-03",
    title: "P5-03 signed Finance Desk UAT",
    proof:
      "Finance Desk browser UAT proves read-only cockpit behavior, scoped action links, access denial, source trace and reliance decision.",
    stop:
      "Finance Desk exposes edit, approval, pay, unrestricted scope, raw database error or unsigned reliance decision.",
  },
  {
    code: "FIN-OFFICIAL-04",
    title: "P0-03 backup/restore proof accepted",
    proof:
      "Real backup ID, restore target, smoke-check result, operator run sheet and closure decision are recorded in controlled evidence storage.",
    stop:
      "Backup/restore proof is missing, untested, unsigned, raw, stored in Git/Codex/chat or cannot preserve P2-18/P5-03/P6-04 evidence.",
  },
  {
    code: "FIN-OFFICIAL-05",
    title: "P0-09 owner GO/NO-GO signed",
    proof:
      "BGH, IT_DATA, KHTC, PHAP_CHE, Audit and process owner sign the final GO/NO-GO pack with controlled evidence references.",
    stop:
      "Any owner is missing, marks NO_GO/BLOCKED, asks for more evidence, or treats PASS_LOCAL as production approval.",
  },
];

const safePilotOrder = [
  {
    code: "FIN-PILOT-01",
    title: "Secure account creation outside Codex/chat",
    action:
      "Account owner creates or invites the real accounting account only through the approved secure channel.",
    stop:
      "Any password, OTP, reset link, activation link, service-role key, raw PII, bank data or voucher appears in Codex/chat.",
  },
  {
    code: "FIN-PILOT-02",
    title: "Narrow TTGDTX profile and workspace scope",
    action:
      "IT links the auth user to the HEU profile and grants only the approved role, workspace and TTGDTX partner scope.",
    stop:
      "Role is broad, workspace scope is unclear, partner scope is missing or the negative account is not prepared.",
  },
  {
    code: "FIN-PILOT-03",
    title: "P6-04 pre-login and negative-account matrix",
    action:
      "Run the P6-04 route matrix before Finance Desk use, including BLOCKED or EMPTY_SCOPED_STATE proof for out-of-scope users.",
    stop:
      "Any route leaks data, shows raw evidence, or lacks redacted controlled evidence and owner sign-off.",
  },
  {
    code: "FIN-PILOT-04",
    title: "P2-18 and P5-03 read-only trial only",
    action:
      "Open accounting dashboard and Finance Desk as read-only rehearsal surfaces; all corrections stay in source P2 workflows.",
    stop:
      "The pilot can edit, approve, pay, post vouchers, issue bank instructions or treat dashboard totals as production reliance.",
  },
  {
    code: "FIN-PILOT-05",
    title: "Result ledger and access closure before expansion",
    action:
      "Record controlled evidence IDs, owner decision and ACCESS_RETAIN or REVOKE_OR_REDUCE before adding any more users.",
    stop:
      "Day-1 result ledger, P0-17 access closure, backup/restore proof or owner GO/NO-GO is missing.",
  },
];

export function FinanceOfficialOperationGate() {
  return (
    <section
      className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-950 shadow-sm"
      data-finance-official-operation-gate="P6-04_P2-18_P5-03_P0-03_P0-09"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2">
            <LockKeyhole className="size-5 text-rose-700" />
            <h2 className="text-base font-semibold">
              Finance official operation gate: NO-GO until signed
            </h2>
          </div>
          <p className="mt-2">
            This page can support controlled read-only rehearsal, but official
            operation remains locked until P6-04, P2-18, P5-03, backup/restore
            proof and owner GO/NO-GO are all signed outside Codex/chat.
          </p>
          <p className="mt-2">
            No statutory accounting, voucher posting, finance approval, bank
            transfer instruction, production dashboard reliance, UAT acceptance
            or production GO is approved here. No GO button is provided.
          </p>
        </div>
        <div className="rounded-md border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-800">
          Decision: OFFICIAL_OPERATION_READY / NO_GO / BLOCKED
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-5">
        {officialOperationGates.map((gate) => (
          <article
            className="border-l-2 border-rose-300 bg-white px-3 py-3"
            key={gate.code}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-rose-700" />
              <p className="font-mono text-xs font-semibold text-rose-800">
                {gate.code}
              </p>
            </div>
            <h3 className="mt-2 font-semibold text-zinc-950">{gate.title}</h3>
            <p className="mt-2 text-zinc-700">Proof: {gate.proof}</p>
            <p className="mt-2 text-rose-800">Stop: {gate.stop}</p>
          </article>
        ))}
      </div>

      <div
        className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-950"
        data-finance-safe-pilot-order="P6-04_P2-18_P5-03"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2">
              <ListChecks className="size-5 text-amber-700" />
              <h3 className="text-sm font-semibold">
                Finance safe pilot order: read-only before any expansion
              </h3>
            </div>
            <p className="mt-2">
              This order allows one controlled accounting pilot path without
              turning the system into official operation. It must finish with a
              result ledger and access closure decision before any more users,
              wider scope or production reliance is discussed.
            </p>
            <p className="mt-2">
              This panel does not create accounts, send invites, store
              passwords, grant access, execute UAT, accept evidence, approve
              finance reliance, approve access closure, move money, issue bank
              instructions or mark production GO.
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-800">
            Decision: FIN_PILOT_READY / NO_GO / BLOCKED
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-5">
          {safePilotOrder.map((step) => (
            <article
              className="border-l-2 border-amber-300 bg-white px-3 py-3"
              key={step.code}
            >
              <p className="font-mono text-xs font-semibold text-amber-800">
                {step.code}
              </p>
              <h4 className="mt-2 font-semibold text-zinc-950">
                {step.title}
              </h4>
              <p className="mt-2 text-zinc-700">Action: {step.action}</p>
              <p className="mt-2 text-amber-800">Stop: {step.stop}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
