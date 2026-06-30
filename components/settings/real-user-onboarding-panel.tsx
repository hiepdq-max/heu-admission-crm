import {
  CheckCircle2,
  ClipboardCheck,
  KeyRound,
  LockKeyhole,
  ShieldAlert,
  UserMinus,
  UserCheck,
} from "lucide-react";

import {
  PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS,
  PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE,
  PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES,
  PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE,
  PRODUCTION_FINANCE_DAY_ONE_RUNBOOK,
  PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS,
  PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS,
} from "@/lib/production-readiness";

const onboardingSteps = [
  {
    code: "USER-REAL-01",
    title: "Create Auth outside Codex",
    detail:
      "Create or invite the real user in Supabase Auth using an approved secure channel. Do not send passwords, temporary passwords, password reset links or account activation/invite links into Codex/chat.",
  },
  {
    code: "USER-REAL-02",
    title: "Link profile into HEU",
    detail:
      "Use the Auth profile link form to create or update users_profile with email, display name, department, manager and role.",
  },
  {
    code: "USER-REAL-03",
    title: "Assign business scope",
    detail:
      "Assign only the approved admission segment, TTGDTX partner/workspace and lead visibility needed for the user's job.",
  },
  {
    code: "USER-REAL-04",
    title: "Run access checks",
    detail:
      "Check User Scope Enforcement and P6-04 route results before the account is used for real accounting work.",
  },
  {
    code: "USER-REAL-05",
    title: "Finance first, then expand",
    detail:
      "Start with KHTC/BGH/Audit/Phap Che accounting users for P2-18 and P5-03. Expand to other departments only after signed scope evidence is accepted.",
  },
];

const financeUserLanes = [
  {
    label: "KHTC accounting operator",
    route: "P2-10, P2-13, P2-17, P2-18, P5-03",
    stop: "No unrestricted dashboard, payout or source evidence outside assigned TTGDTX scope.",
  },
  {
    label: "BGH read-only reviewer",
    route: "P2-18, P5-03, Master Control",
    stop: "No daily entry, payment execution, hidden raw evidence or production GO action.",
  },
  {
    label: "Audit read-only reviewer",
    route: "Audit log, evidence checks, P2-18/P5-03 review",
    stop: "No money movement, role grant, data ownership change or raw secret exposure.",
  },
  {
    label: "Phap Che contract/legal reviewer",
    route: "P0-19, source/legal evidence, contract checks",
    stop: "No unrestricted finance totals unless separately approved and signed.",
  },
  {
    label: "Out-of-scope negative account",
    route: "Login and blocked/empty scoped state",
    stop: "Any unrestricted TTGDTX finance, lead, source, dashboard or audit data.",
  },
];

const realUserAccessClosureItems = [
  {
    code: "USER-CLOSE-01",
    title: "Review UAT result",
    detail:
      "Compare the signed P6-04, P2-18 and P5-03 route results before deciding whether the real user keeps access, has access reduced or is revoked.",
  },
  {
    code: "USER-CLOSE-02",
    title: "Reduce broad scope",
    detail:
      "Remove temporary pilot scope and broad finance visibility unless the owner signs ACCESS_RETAIN for the exact role, workspace and partner scope.",
  },
  {
    code: "USER-CLOSE-03",
    title: "Soft-revoke blocked access",
    detail:
      "Use the approved admin channel and HEU soft-revoke/INACTIVE state for users that failed UAT, changed job role or no longer need pilot access.",
  },
  {
    code: "USER-CLOSE-04",
    title: "Store safe closure proof",
    detail:
      "Record only controlled evidence IDs, redacted account labels, owner decision and checker names outside Codex/chat; never paste passwords or invite links.",
  },
];

export function RealUserOnboardingPanel() {
  return (
    <section
      className="rounded-lg border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-sky-950 shadow-sm"
      data-heu-real-user-onboarding-panel="P0-17"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2">
            <UserCheck className="size-5 text-sky-700" />
            <h2 className="text-base font-semibold">
              Real user onboarding for accounting: PASS_LOCAL only
            </h2>
          </div>
          <p className="mt-2">
            Use this sequence before giving real users access to accounting
            workflows. The system supports the handoff, but it does not approve
            production access by itself.
          </p>
          <p className="mt-2">
            No real passwords, temporary passwords, OTPs, password reset links,
            account activation/invite links, service-role keys, bank data, raw
            student PII or vouchers may be pasted into Git, Codex/chat,
            screenshots or uncontrolled notes.
          </p>
        </div>
        <div className="rounded-md border border-sky-200 bg-white px-3 py-2 text-xs font-medium text-sky-900">
          Decision: USER_READY / NO_GO / BLOCKED
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-5">
        {onboardingSteps.map((step) => (
          <article
            key={step.code}
            className="border-l-2 border-sky-300 bg-white px-3 py-3"
          >
            <p className="text-xs font-semibold uppercase text-sky-700">
              {step.code}
            </p>
            <div className="mt-1 flex items-center gap-2 font-medium text-zinc-950">
              {step.code === "USER-REAL-01" ? (
                <KeyRound className="size-4 text-sky-700" />
              ) : step.code === "USER-REAL-04" ? (
                <LockKeyhole className="size-4 text-sky-700" />
              ) : (
                <CheckCircle2 className="size-4 text-sky-700" />
              )}
              {step.title}
            </div>
            <p className="mt-2 text-zinc-700">{step.detail}</p>
          </article>
        ))}
      </div>

      <div
        className="mt-4 rounded-lg border border-indigo-200 bg-white p-4"
        data-heu-real-user-finance-lanes="P0-17-P5-03"
      >
        <div className="flex items-center gap-2 font-semibold text-indigo-950">
          <ClipboardCheck className="size-4 text-indigo-700" />
          Finance-accounting user lanes before real use
        </div>
        <div className="mt-3 grid gap-3 xl:grid-cols-5">
          {financeUserLanes.map((lane) => (
            <article key={lane.label} className="border-l-2 border-indigo-300 px-3">
              <p className="font-medium text-zinc-950">{lane.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{lane.route}</p>
              <p className="mt-2 text-rose-700">Stop: {lane.stop}</p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-4 rounded-lg border border-blue-200 bg-white p-4"
        data-heu-finance-day-one-account-activation="P0-17-P6-04"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-2 font-semibold text-blue-950">
            <KeyRound className="size-4 text-blue-700" />
            Finance Day-1 account activation handoff
          </div>
          <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-900">
            Decision: FIN_ACTIVATION_READY / NO_GO / BLOCKED
          </div>
        </div>
        <p className="mt-2 text-blue-900">
          Use this handoff before any real-accounting account opens finance
          routes. It records invite status, profile link, narrow scope and P6-04
          pre-login checks without storing credentials or invite links.
        </p>
        <p className="mt-1 text-xs font-medium text-blue-800">
          Template: {PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_TEMPLATE}
        </p>
        <div className="mt-3 grid gap-3 xl:grid-cols-5">
          {PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_ACTIVATION_CHECKS.map((item) => (
            <article key={item.code} className="border-l-2 border-blue-300 px-3">
              <p className="text-xs font-semibold uppercase text-blue-700">
                {item.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
              <p className="mt-2 text-xs text-zinc-500">Owner: {item.owner}</p>
              <p className="mt-2 text-zinc-700">{item.requiredProof}</p>
              <p className="mt-2 text-rose-700">Stop: {item.stopCondition}</p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-4 rounded-lg border border-cyan-200 bg-white p-4"
        data-heu-finance-day-one-run-rehearsal="P0-17-P6-04-P2-18-P5-03-P2-17"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-2 font-semibold text-cyan-950">
            <ClipboardCheck className="size-4 text-cyan-700" />
            Finance Day-1 real-run rehearsal before expansion
          </div>
          <div className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-900">
            Decision: FIN_DAY1_READY / NO_GO / BLOCKED
          </div>
        </div>
        <p className="mt-2 text-cyan-900">
          Use approved real-accounting account labels only after signed UAT is
          ready. This checklist does not create accounts, approve access, accept
          UAT, move money or mark production GO.
        </p>
        <p className="mt-1 text-xs font-medium text-cyan-800">
          Runbook: {PRODUCTION_FINANCE_DAY_ONE_RUNBOOK}
        </p>
        <div className="mt-3 grid gap-3 xl:grid-cols-5">
          {PRODUCTION_FINANCE_DAY_ONE_RUN_STEPS.map((step) => (
            <article key={step.code} className="border-l-2 border-cyan-300 px-3">
              <p className="text-xs font-semibold uppercase text-cyan-700">
                {step.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
              <p className="mt-2 text-xs text-zinc-500">Owner: {step.owner}</p>
              <p className="mt-2 text-zinc-700">{step.requiredAction}</p>
              <p className="mt-2 text-rose-700">Stop: {step.stopCondition}</p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-4 rounded-lg border border-teal-200 bg-white p-4"
        data-heu-finance-day-one-result-ledger="P0-17-P6-04-P2-18-P5-03-P2-17"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-2 font-semibold text-teal-950">
            <ClipboardCheck className="size-4 text-teal-700" />
            Finance Day-1 result ledger for real users
          </div>
          <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-900">
            Decision: FIN_DAY1_RESULT_READY / NO_GO / BLOCKED
          </div>
        </div>
        <p className="mt-2 text-teal-900">
          Record one controlled result row per approved account label and route.
          This ledger captures readiness evidence only; it does not approve
          access, accept UAT, approve finance reliance, move money or mark
          production GO.
        </p>
        <p className="mt-1 text-xs font-medium text-teal-800">
          Template: {PRODUCTION_FINANCE_DAY_ONE_RESULT_LEDGER_TEMPLATE}
        </p>
        <div className="mt-3 grid gap-3 xl:grid-cols-5">
          {PRODUCTION_FINANCE_DAY_ONE_ACCOUNT_LANES.map((lane) => (
            <article
              key={lane.accountLabel}
              className="border-l-2 border-teal-300 px-3"
            >
              <p className="text-xs font-semibold uppercase text-teal-700">
                {lane.accountLabel}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Owner: {lane.owner}</p>
              <p className="mt-2 text-zinc-700">{lane.allowedRoutes}</p>
              <p className="mt-2 text-xs font-medium text-zinc-600">
                Result: {lane.requiredResult}
              </p>
              <p className="mt-2 text-rose-700">Stop: {lane.stopCondition}</p>
            </article>
          ))}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {PRODUCTION_FINANCE_DAY_ONE_RESULT_FIELDS.map((item) => (
            <article
              key={item.field}
              className="border-l-2 border-teal-300 bg-teal-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-teal-700">
                {item.field}
              </p>
              <p className="mt-2 text-zinc-700">{item.requiredValue}</p>
              <p className="mt-2 text-xs text-rose-800">
                Forbidden: {item.forbiddenContent}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-4 rounded-lg border border-rose-200 bg-white p-4"
        data-heu-real-user-access-closure="P0-17-P6-04"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-2 font-semibold text-rose-950">
            <UserMinus className="size-4 text-rose-700" />
            Real-user access closure after pilot/UAT
          </div>
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-900">
            Decision: ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED
          </div>
        </div>
        <div className="mt-3 grid gap-3 xl:grid-cols-4">
          {realUserAccessClosureItems.map((item) => (
            <article key={item.code} className="border-l-2 border-rose-300 px-3">
              <p className="text-xs font-semibold uppercase text-rose-700">
                {item.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{item.title}</p>
              <p className="mt-2 text-zinc-700">{item.detail}</p>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs text-rose-800">
          Stop if the closure decision is unsigned, broad access remains after
          NO_GO/BLOCKED, the user is not reviewed against P6-04 route results,
          or passwords, temporary passwords, OTPs, password reset links,
          account activation/invite links, service-role keys or raw identity
          data appear in evidence.
        </p>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          Real accounting use stays NO-GO until P6-04 role-scope UAT, P2-18
          dashboard UAT, P5-03 Finance Desk UAT, audit-log traceability and
          owner sign-off are completed with controlled evidence outside
          Codex/chat.
        </p>
      </div>
    </section>
  );
}
