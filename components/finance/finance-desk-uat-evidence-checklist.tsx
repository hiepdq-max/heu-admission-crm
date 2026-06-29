import { ClipboardCheck, FileCheck2, ShieldAlert } from "lucide-react";

type FinanceDeskUatItem = {
  caseId: string;
  user: string;
  expectedEvidence: string;
};

type FinanceDeskAcceptanceItem = {
  caseId: string;
  requirement: string;
  passCondition: string;
  stopCondition: string;
};

type FinanceDeskImmediateStopItem = {
  stopId: string;
  condition: string;
  operatorAction: string;
};

type FinanceDeskRealUserBridgeItem = {
  caseId: string;
  accountClass: string;
  requiredEvidence: string;
  stopCondition: string;
};

const realAccountingQueueMarker =
  'data-heu-real-accounting-user-uat-queue="P6-04-P2-18-P5-03"';
const realAccountingResultMarker =
  'data-heu-real-accounting-user-result-template="P6-04-P2-18-P5-03"';

const uatItems: FinanceDeskUatItem[] = [
  {
    caseId: "P5-03-UAT-01",
    user: "UAT_KHTC_TTGDTX_OPERATOR",
    expectedEvidence:
      "Open /finance-desk and capture loaded KPIs for receivable, collection, remaining-to-pay and issue totals.",
  },
  {
    caseId: "P5-03-UAT-02",
    user: "UAT_BGH",
    expectedEvidence:
      "Confirm the cockpit is read-only and has no approve, pay, import-write or source-edit form.",
  },
  {
    caseId: "P5-03-UAT-03",
    user: "UAT_CONTRACT_ONLY",
    expectedEvidence:
      "Confirm contract read permission alone cannot expose Finance Desk totals.",
  },
  {
    caseId: "P5-03-UAT-04",
    user: "UAT_OUT_OF_SCOPE_STAFF",
    expectedEvidence:
      "Confirm the no-access state or scoped denial appears when TTGDTX scope is missing.",
  },
  {
    caseId: "P5-03-UAT-05",
    user: "UAT_KHTC_TTGDTX_OPERATOR",
    expectedEvidence:
      "Compare summary totals with /ttgdtx/accounting-dashboard and record variance notes.",
  },
  {
    caseId: "P5-03-UAT-06",
    user: "UAT_KHTC_TTGDTX_OPERATOR",
    expectedEvidence:
      "Compare import section with /ttgdtx/import batch status, issue counts and source names.",
  },
  {
    caseId: "P5-03-UAT-07",
    user: "UAT_AUDIT",
    expectedEvidence:
      "Compare source section with /ttgdtx/source-control source counts and warning/fail counts.",
  },
  {
    caseId: "P5-03-UAT-08",
    user: "UAT_KHTC_TTGDTX_OPERATOR",
    expectedEvidence:
      "Confirm every VND value renders through the shared formatter, for example 1.000.000 đ.",
  },
  {
    caseId: "P5-03-UAT-09",
    user: "UAT_ADMIN",
    expectedEvidence:
      "Inspect action links and confirm they route back to source P2 screens without mutating facts.",
  },
];

const realUserBridgeItems: FinanceDeskRealUserBridgeItem[] = [
  {
    caseId: "P5-03-REAL-01",
    accountClass: "P6-04 real-accounting preflight",
    requiredEvidence:
      "REAL-ACC-01 through REAL-ACC-06 are recorded with controlled evidence IDs before Finance Desk reliance.",
    stopCondition:
      "Stop if the P6-04 real accounting user UAT queue or result template is missing, unsigned or stored in Git/Codex/chat.",
  },
  {
    caseId: "P5-03-REAL-02",
    accountClass: "KHTC accounting operator",
    requiredEvidence:
      "KHTC can open Finance Desk only inside assigned TTGDTX scope and compare dashboard/import/source-control totals.",
    stopCondition:
      "Stop if KHTC sees unrestricted totals, source evidence outside assigned scope, payment execution or edit actions.",
  },
  {
    caseId: "P5-03-REAL-03",
    accountClass: "BGH read-only reviewer",
    requiredEvidence:
      "BGH can review Finance Desk indicators and reliance blockers without write, approval, pay or production GO controls.",
    stopCondition:
      "Stop if BGH can mutate finance facts, approve payment, see hidden raw evidence or trigger production GO.",
  },
  {
    caseId: "P5-03-REAL-04",
    accountClass: "Audit and Phap Che reviewers",
    requiredEvidence:
      "Audit can inspect traceability and Phap Che can review approved legal/source context without unrestricted finance totals.",
    stopCondition:
      "Stop if audit/legal review exposes raw secrets, private contracts beyond scope, unrestricted totals or money movement.",
  },
  {
    caseId: "P5-03-REAL-05",
    accountClass: "Out-of-scope negative account",
    requiredEvidence:
      "Out-of-scope account returns BLOCKED or EMPTY_SCOPED_STATE for Finance Desk totals and action links.",
    stopCondition:
      "Stop if any unrestricted TTGDTX finance, lead, source, dashboard, audit or settings data is visible.",
  },
];

const immediateStopItems: FinanceDeskImmediateStopItem[] = [
  {
    stopId: "P5-03-STOP-01",
    condition:
      "Any Finance Desk total is used for statutory accounting, voucher posting, finance approval or a bank-transfer instruction.",
    operatorAction:
      "Stop owner reliance and route the decision back to the source P2 workflow.",
  },
  {
    stopId: "P5-03-STOP-02",
    condition:
      "Signed browser UAT, source reconciliation, workspace-scope denial or the owner reliance decision is missing.",
    operatorAction:
      "Keep P5-03 BLOCKED until controlled evidence and owner signatures exist outside Codex/chat.",
  },
  {
    stopId: "P5-03-STOP-03",
    condition:
      "Contract-only or out-of-scope users can see unrestricted Finance Desk totals.",
    operatorAction:
      "Stop the run and fix role/workspace scope before continuing UAT.",
  },
  {
    stopId: "P5-03-STOP-04",
    condition:
      "Dashboard/import/source-control totals differ without an owner note and source P2 correction route.",
    operatorAction:
      "Record NO_GO or BLOCKED; do not adjust Finance Desk output directly.",
  },
  {
    stopId: "P5-03-STOP-05",
    condition:
      "Raw PII, CCCD, bank data, vouchers, payment evidence, passwords, temporary passwords, OTPs, password reset links, account activation/invite links or service-role keys appear in evidence.",
    operatorAction:
      "Reject the evidence and move it to controlled redaction handling outside Git/Codex/chat.",
  },
];

const acceptanceItems: FinanceDeskAcceptanceItem[] = [
  {
    caseId: "P5-03-ACCEPT-01",
    requirement: "Access control",
    passCondition:
      "Authorized scoped roles can open; contract-only and out-of-scope users cannot see totals.",
    stopCondition: "Any out-of-scope user sees unrestricted finance totals.",
  },
  {
    caseId: "P5-03-ACCEPT-02",
    requirement: "Read-only behavior",
    passCondition:
      "No direct create, update, approve, pay, import-write or source-edit form exists inside /finance-desk.",
    stopCondition:
      "The route can approve, pay, unlock, import-write or edit source data.",
  },
  {
    caseId: "P5-03-ACCEPT-03",
    requirement: "Source consistency",
    passCondition:
      "KPIs reconcile to P2-18 dashboard, import readiness and source-control views.",
    stopCondition: "Any material mismatch lacks an owner note.",
  },
  {
    caseId: "P5-03-ACCEPT-04",
    requirement: "Money format",
    passCondition: "VND values use the shared lib/vnd-money.ts display.",
    stopCondition: "Money appears as raw number, wrong separator or ASCII d suffix.",
  },
  {
    caseId: "P5-03-ACCEPT-05",
    requirement: "Evidence hygiene",
    passCondition:
      "Evidence is masked, controlled and references approved storage only.",
    stopCondition:
      "Raw PII, bank data, passwords, temporary passwords, OTPs, password reset links, account activation/invite links, service-role keys, vouchers or payment evidence appears in Git/Codex/chat.",
  },
  {
    caseId: "P5-03-ACCEPT-06",
    requirement: "Production boundary",
    passCondition:
      "Owners record signed PASS, FAIL or BLOCKED outside Codex/chat.",
    stopCondition: "Anyone treats PASS_LOCAL as production approval.",
  },
];

export function FinanceDeskUatEvidenceChecklist() {
  return (
    <section
      className="rounded-lg border border-violet-200 bg-violet-50 p-5 text-sm shadow-sm"
      data-finance-desk-uat-evidence-checklist="P5-03"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-violet-700" />
          <div>
            <h2 className="font-semibold text-violet-950">
              P5-03 Finance Desk UAT evidence checklist: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-violet-900">
              Signed browser UAT is still required before Finance Desk can be
              relied on. Collect only redacted screenshots or non-secret
              evidence references; raw source files, student PII, CCCD, bank
              accounts, vouchers, passwords, temporary passwords, OTPs,
              password reset links, account activation/invite links and
              service-role keys stay outside Git/Codex/chat.
            </p>
          </div>
        </div>
        <div className="min-w-72 rounded-md border border-violet-200 bg-white px-3 py-2 text-violet-950">
          Required runbook:
          <span className="mt-1 block font-mono text-xs">
            HEU_FINANCE_DESK_UAT_RUNBOOK_20260627.md
          </span>
        </div>
      </div>

      <div
        className="mt-5 rounded-md border border-emerald-200 bg-white p-4"
        data-finance-desk-real-user-evidence-bridge="P5-03-P6-04"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-emerald-950">
              P5-03 real accounting user evidence bridge: PASS_LOCAL only
            </h3>
            <p className="mt-2 leading-6 text-emerald-900">
              Before Finance Desk reliance, cite the P6-04 real accounting user
              queue and result template:
              <span className="ml-1 font-mono text-xs">
                {realAccountingQueueMarker}
              </span>{" "}
              and
              <span className="ml-1 font-mono text-xs">
                {realAccountingResultMarker}
              </span>
              .
            </p>
          </div>
          <div className="min-w-72 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-950">
            Decision:
            <span className="mt-1 block font-mono text-xs">
              P5_03_REAL_USER_READY / NO_GO / BLOCKED
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {realUserBridgeItems.map((item) => (
            <article
              className="border-l-2 border-emerald-300 bg-emerald-50 px-3 py-3"
              key={item.caseId}
            >
              <p className="text-xs font-semibold uppercase text-emerald-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">
                {item.accountClass}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                {item.requiredEvidence}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          Do not paste real passwords, temporary passwords, OTPs, password
          reset links, account activation/invite links, service-role keys, raw
          PII, CCCD, bank data, vouchers or screenshots with secrets into
          Finance Desk evidence.
        </p>
      </div>

      <div
        className="mt-5 rounded-md border border-rose-200 bg-white p-4"
        data-finance-desk-immediate-stop="P5-03"
      >
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-rose-700" />
          <div>
            <h3 className="font-semibold text-rose-950">
              P5-03 Finance Desk immediate stop guard: PASS_LOCAL only
            </h3>
            <p className="mt-1 leading-6 text-rose-900">
              Decision value:{" "}
              <span className="font-mono text-xs">
                P5_03_STOP_CHECK / GO_NEXT / BLOCKED
              </span>
              . Stop before owner reliance if any condition below is open.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {immediateStopItems.map((item) => (
            <article
              className="border-l-2 border-rose-300 bg-rose-50 px-3 py-3"
              key={item.stopId}
            >
              <p className="text-xs font-semibold uppercase text-rose-700">
                {item.stopId}
              </p>
              <p className="mt-2 leading-5 text-rose-950">
                Stop: {item.condition}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Action: {item.operatorAction}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-3">
        {uatItems.map((item) => (
          <article
            className="border-l-2 border-violet-300 bg-white px-3 py-3"
            key={item.caseId}
          >
            <div className="flex items-start gap-2">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-violet-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-violet-700">
                  {item.caseId}
                </p>
                <p className="mt-1 text-xs font-medium text-zinc-500">
                  User: {item.user}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {item.expectedEvidence}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div
        className="mt-5 border-t border-violet-200 pt-5"
        data-finance-desk-acceptance-matrix="P5-03"
      >
        <h3 className="font-semibold text-violet-950">
          P5-03 Finance Desk acceptance matrix: PASS_LOCAL only
        </h3>
        <p className="mt-1 leading-6 text-violet-900">
          Decision value:{" "}
          <span className="font-mono text-xs">
            P5_03_ACCEPT / FAIL / BLOCKED
          </span>
          . This prepares owner review; it does not approve production.
        </p>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {acceptanceItems.map((item) => (
            <article
              className="border-l-2 border-violet-300 bg-white px-3 py-3"
              key={item.caseId}
            >
              <p className="text-xs font-semibold uppercase text-violet-700">
                {item.caseId}
              </p>
              <p className="mt-1 font-medium text-zinc-950">
                {item.requirement}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                {item.passCondition}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          PASS_LOCAL does not mean Finance Desk UAT passed, dashboard totals
          were accepted, a finance action is approved, or production GO is
          approved. KHTC, BGH, IT_DATA and Audit must sign evidence outside
          Codex/chat.
        </p>
      </div>
    </section>
  );
}
