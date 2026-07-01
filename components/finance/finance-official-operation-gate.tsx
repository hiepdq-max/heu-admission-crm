import { LockKeyhole, ShieldCheck } from "lucide-react";

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
    </section>
  );
}
