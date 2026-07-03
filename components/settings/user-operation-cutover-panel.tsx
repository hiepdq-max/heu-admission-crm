import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  LockKeyhole,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

const cutoverStatusItems = [
  {
    code: "USER-CUTOVER-REQUIRED-POSITIONS",
    label: "Required owner seats",
    value: "required_positions=15; unassigned_required_positions=15",
    state: "NO_GO",
  },
  {
    code: "USER-CUTOVER-TTGDTX-NEGATIVE-CONTROL",
    label: "TTGDTX negative control",
    value: "ttgdtx_negative_candidates=0",
    state: "NO_GO",
  },
  {
    code: "USER-CUTOVER-EXTERNAL-EVIDENCE",
    label: "External proof",
    value: "pending_lanes=4; ready_lanes=0",
    state: "NO_GO",
  },
  {
    code: "USER-CUTOVER-SCOPE-BASELINE",
    label: "Lead scope baseline",
    value: "active_profiles=4; missing_visibility=1; missing_business_scope=1",
    state: "NO_GO",
  },
  {
    code: "USER-SCOPE-REPAIR-QUEUE",
    label: "Scope repair queue",
    value: "HEU_USER_SCOPE_BASELINE_REPAIR_QUEUE_20260703.md",
    state: "NO_GO",
  },
  {
    code: "USER-CUTOVER-AUTH-LINK",
    label: "Auth/profile link",
    value: "active_profiles=4; every active profile has Auth link",
    state: "READY",
  },
];

const cutoverOrder = [
  {
    code: "CUTOVER-OWNER-SEATS-01",
    owner: "BGH + IT_DATA",
    proof: "Approve, create/link and assign every required HEU position.",
  },
  {
    code: "CUTOVER-AUTH-LINK-02",
    owner: "IT_DATA",
    proof: "Every active CRM profile maps to Supabase Auth before widening.",
  },
  {
    code: "CUTOVER-SCOPE-BASELINE-03",
    owner: "IT_DATA + process owner",
    proof: "Lead visibility, business scope and workspace baseline stay narrow.",
  },
  {
    code: "CUTOVER-NEGATIVE-04",
    owner: "Audit + IT_DATA",
    proof: "REAL_OUT_OF_SCOPE_NEGATIVE_01 has blocked/empty scoped proof.",
  },
  {
    code: "CUTOVER-P6-UAT-05",
    owner: "Audit + process owner",
    proof: "P6-04 signed UAT and access closure are stored externally.",
  },
  {
    code: "CUTOVER-OWNER-GO-06",
    owner: "BGH + owner lane",
    proof: "Final owner cutover decision is signed outside Git/Codex/chat.",
  },
];

const externalReferences = [
  "P6_04_SIGNED_UAT_REFERENCE: PENDING_OWNER_UPLOAD",
  "ACCESS_CLOSURE_REFERENCE: PENDING_OWNER_UPLOAD",
  "NEGATIVE_CONTROL_BROWSER_PROOF_REFERENCE: PENDING_OWNER_UPLOAD",
  "OWNER_CUTOVER_DECISION_REFERENCE: PENDING_OWNER_SIGNOFF",
];

export function UserOperationCutoverPanel() {
  return (
    <section
      className="min-w-0 overflow-hidden rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 shadow-sm"
      data-heu-user-operation-cutover-panel="P0-17_USER_OPERATION_CUTOVER_GATE"
      data-heu-user-operation-cutover-status="USER_PERMISSION_OPERATION_CUTOVER_READY_NO_GO_BLOCKED"
      data-heu-user-operation-cutover-no-overflow="P0-17_USER_CUTOVER_NO_OVERFLOW"
    >
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700" />
            <h2 className="break-words text-base font-semibold text-amber-950">
              User permission operation cutover gate
            </h2>
          </div>
          <p className="mt-2 max-w-4xl break-words">
            Current cutover decision: NO_GO. Local user-account audits are
            guarded, but the admission user/role/scope setup is not operational
            until owner seats, negative proof, signed P6-04 UAT and owner
            cutover decision are complete.
          </p>
        </div>
        <div className="min-w-0 overflow-hidden rounded-md border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900">
          <span className="truncate">
            USER_PERMISSION_OPERATION_CUTOVER_READY / NO_GO / BLOCKED
          </span>
        </div>
      </div>

      <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-6">
        {cutoverStatusItems.map((item) => (
          <article
            key={item.code}
            className="min-w-0 border-l-2 border-amber-300 bg-white px-3 py-3"
          >
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="truncate text-xs font-semibold uppercase text-amber-700">
                {item.code}
              </p>
              {item.state === "READY" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
              )}
            </div>
            <p className="mt-2 font-medium text-zinc-950">{item.label}</p>
            <p className="mt-2 break-words text-zinc-700">{item.value}</p>
            <p className="mt-2 text-xs font-semibold text-amber-800">
              State: {item.state}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="min-w-0 border border-amber-200 bg-white p-4">
          <div className="flex min-w-0 items-center gap-2 font-semibold text-amber-950">
            <UsersRound className="h-4 w-4 shrink-0 text-amber-700" />
            <span className="truncate">Cutover order</span>
          </div>
          <div className="mt-3 grid min-w-0 gap-3 lg:grid-cols-2">
            {cutoverOrder.map((item) => (
              <article
                key={item.code}
                className="min-w-0 border-l-2 border-amber-300 px-3"
              >
                <p className="break-words text-xs font-semibold uppercase text-amber-700">
                  {item.code}
                </p>
                <p className="mt-1 break-words text-xs text-zinc-500">
                  Owner: {item.owner}
                </p>
                <p className="mt-2 break-words text-zinc-700">{item.proof}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="min-w-0 border border-rose-200 bg-white p-4">
          <div className="flex min-w-0 items-center gap-2 font-semibold text-rose-950">
            <LockKeyhole className="h-4 w-4 shrink-0 text-rose-700" />
            <span className="truncate">External references</span>
          </div>
          <ul className="mt-3 space-y-2">
            {externalReferences.map((reference) => (
              <li key={reference} className="flex min-w-0 gap-2 text-rose-900">
                <ClipboardCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-700"
                  aria-hidden="true"
                />
                <span className="break-words">{reference}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 break-words text-xs text-rose-800">
            This panel does not create accounts, assign real users, set passwords,
            send reset/invite links, execute UAT, accept evidence,
            approve owner GO/NO-GO or mark production GO.
          </p>
        </div>
      </div>
    </section>
  );
}
