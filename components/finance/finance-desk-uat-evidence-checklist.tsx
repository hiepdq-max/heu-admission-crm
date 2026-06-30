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

type FinanceDeskStartGateEvidenceItem = {
  evidenceId: string;
  gate: string;
  requiredEvidence: string;
  stopCondition: string;
};

type FinanceDeskControlledTrialItem = {
  trialId: string;
  accountLabel: string;
  routeCheck: string;
  requiredResult: string;
  stopCondition: string;
};

type FinanceDeskControlledTrialEvidenceItem = {
  evidenceId: string;
  capture: string;
  requiredContent: string;
  forbiddenContent: string;
};

type FinanceDeskDayOneResultLedgerItem = {
  evidenceId: string;
  accountLabel: string;
  route: string;
  requiredResult: string;
  stopCondition: string;
};

const realAccountingQueueMarker =
  'data-heu-real-accounting-user-uat-queue="P6-04-P2-18-P5-03"';
const realAccountingResultMarker =
  'data-heu-real-accounting-user-result-template="P6-04-P2-18-P5-03"';

const controlledTrialPlanPath =
  "docs/HEU_FINANCE_DESK_CONTROLLED_TRIAL_PLAN_20260630.md";
const financeDayOneStartGateChecklistPath =
  "docs/HEU_FINANCE_DAY1_START_GATE_CHECKLIST_20260630.md";
const financeDayOneResultLedgerTemplatePath =
  "docs/HEU_FINANCE_DAY1_RESULT_LEDGER_TEMPLATE_20260630.md";

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

const startGateEvidenceItems: FinanceDeskStartGateEvidenceItem[] = [
  {
    evidenceId: "FIN-START-EVID-001",
    gate: "FIN-START-01 P0-03 backup and restore evidence accepted",
    requiredEvidence:
      "Backup ID, restore target, operator run sheet, preflight/postflight and restore smoke-check evidence are recorded outside Git/Codex/chat.",
    stopCondition:
      "Stop if backup/restore proof is missing, unsigned, untested, raw or stored in Git/Codex/chat.",
  },
  {
    evidenceId: "FIN-START-EVID-002",
    gate: "FIN-START-02 signed finance UAT route readiness",
    requiredEvidence:
      "Signed route readiness cites UAT-ROUTE-08 for P2-18/P5-03 and the owner required to accept or block the route.",
    stopCondition:
      "Stop if dashboard/Finance Desk signed UAT route is missing, ownerless, NO_GO or BLOCKED.",
  },
  {
    evidenceId: "FIN-START-EVID-003",
    gate: "FIN-START-03 P0-10 controlled evidence redaction storage ready",
    requiredEvidence:
      "Controlled evidence folder, redaction class, reviewer and forbidden-content rule are recorded before any screenshot or result row.",
    stopCondition:
      "Stop if raw PII, CCCD, bank data, vouchers, passwords, OTPs, invite/reset links or service-role keys can enter Git/Codex/chat.",
  },
  {
    evidenceId: "FIN-START-EVID-004",
    gate: "FIN-START-04 P0-14/P0-17 result and access-closure paths ready",
    requiredEvidence:
      "Evidence binder path, Day-1 result ledger path and ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED path are cited before reliance review.",
    stopCondition:
      "Stop if P0-14 evidence binder, Day-1 result ledger or P0-17 access closure decision path is missing.",
  },
  {
    evidenceId: "FIN-START-EVID-005",
    gate: "FIN-START-05 human owner boundary accepted",
    requiredEvidence:
      "KHTC, BGH, IT_DATA, Audit and Phap Che understand this is PASS_LOCAL packaging and not finance reliance or production GO.",
    stopCondition:
      "Stop if anyone treats local checks as access approval, UAT acceptance, finance reliance, money movement or production GO.",
  },
];

const controlledTrialItems: FinanceDeskControlledTrialItem[] = [
  {
    trialId: "P5-03-TRIAL-01",
    accountLabel: "REAL_KHTC_TTGDTX_OPERATOR_01",
    routeCheck:
      "/finance-desk opens only inside assigned TTGDTX finance scope.",
    requiredResult: "Scoped KPIs load with no create/update/pay/import-write controls.",
    stopCondition:
      "Stop if unrestricted totals, write controls or payment execution are visible.",
  },
  {
    trialId: "P5-03-TRIAL-02",
    accountLabel: "REAL_BGH_READONLY_01",
    routeCheck: "/finance-desk and /ttgdtx/accounting-dashboard are read-only.",
    requiredResult: "Read-only review with no approve, evidence edit or GO controls.",
    stopCondition:
      "Stop if BGH can mutate finance facts, approve access or mark production GO.",
  },
  {
    trialId: "P5-03-TRIAL-03",
    accountLabel: "REAL_AUDIT_READONLY_01",
    routeCheck: "Trace and redacted-evidence checks remain read-only.",
    requiredResult: "Audit sees redacted evidence IDs only.",
    stopCondition:
      "Stop if Audit can bypass redaction, grant access, move money or see secrets.",
  },
  {
    trialId: "P5-03-TRIAL-04",
    accountLabel: "REAL_PHAP_CHE_REVIEW_01",
    routeCheck: "Legal/source review is limited to approved legal scope.",
    requiredResult: "Legal review only; unrestricted finance totals stay blocked.",
    stopCondition:
      "Stop if private contract bodies, payout action or unrestricted totals are visible.",
  },
  {
    trialId: "P5-03-TRIAL-05",
    accountLabel: "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    routeCheck: "/finance-desk and protected TTGDTX routes return denial.",
    requiredResult: "BLOCKED or EMPTY_SCOPED_STATE.",
    stopCondition:
      "Stop if any TTGDTX finance, source, dashboard, audit, settings or evidence data is visible.",
  },
  {
    trialId: "P5-03-TRIAL-06",
    accountLabel: "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    routeCheck: "Run the protected-route negative-control denial check.",
    requiredResult: "Protected routes return BLOCKED or EMPTY_SCOPED_STATE only.",
    stopCondition:
      "Stop if any protected TTGDTX finance, lead, payout, audit or settings row is visible.",
  },
  {
    trialId: "P5-03-TRIAL-07",
    accountLabel: "ALL_REAL_ACCOUNTING_LABELS",
    routeCheck: "Check finance-action locks during the trial.",
    requiredResult:
      "No auto gach no, COM production calculation, payment execution, bank instruction or bulk real-data import is attempted.",
    stopCondition:
      "Stop if any money movement, COM finalization, auto debt clearing or bulk real import is attempted.",
  },
  {
    trialId: "P5-03-TRIAL-08",
    accountLabel: "KHTC_BGH_IT_DATA_AUDIT_OWNER_REVIEW",
    routeCheck: "Record controlled result and access closure outside Git/Codex/chat.",
    requiredResult:
      "Evidence IDs, variance notes, owner decision and ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED are recorded.",
    stopCondition:
      "Stop if raw PII, bank data, voucher body, payment evidence, password material or ownerless result enters the record.",
  },
];

const controlledTrialEvidenceItems: FinanceDeskControlledTrialEvidenceItem[] = [
  {
    evidenceId: "P5-03-TRIAL-EVID-001",
    capture: "Account label and scope proof",
    requiredContent:
      "Redacted account label, role, department, TTGDTX scope and P6-04 pre-login decision.",
    forbiddenContent:
      "Passwords, OTPs, invite links, reset links, real email screenshots or service-role keys.",
  },
  {
    evidenceId: "P5-03-TRIAL-EVID-002",
    capture: "/finance-desk scoped load",
    requiredContent: "Route, role label, scoped KPIs and no-write result.",
    forbiddenContent:
      "Raw student PII, bank accounts, vouchers, payment data or unrestricted totals.",
  },
  {
    evidenceId: "P5-03-TRIAL-EVID-003",
    capture: "Source reconciliation",
    requiredContent:
      "P2-18, import readiness and source-control comparison with variance owner note.",
    forbiddenContent: "Manual adjustment to Finance Desk output.",
  },
  {
    evidenceId: "P5-03-TRIAL-EVID-004",
    capture: "Negative-control denial",
    requiredContent:
      "BLOCKED or EMPTY_SCOPED_STATE result for protected routes.",
    forbiddenContent:
      "Any visible protected TTGDTX route, row, total, evidence link or audit row.",
  },
  {
    evidenceId: "P5-03-TRIAL-EVID-005",
    capture: "Result and access closure",
    requiredContent:
      "P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED plus ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED.",
    forbiddenContent:
      "Access approval, UAT acceptance, finance reliance or production GO without owner signatures.",
  },
];

const dayOneResultLedgerItems: FinanceDeskDayOneResultLedgerItem[] = [
  {
    evidenceId: "FIN-DAY1-EVID-001",
    accountLabel: "REAL_KHTC_TTGDTX_OPERATOR_01",
    route: "P6-04 / P2-18 / P5-03 / P2-17 / P0-17",
    requiredResult:
      "ALLOWED only inside assigned finance scope, with Finance Desk read-only.",
    stopCondition:
      "Stop if unrestricted totals, write actions, payment execution or missing P0-17 access closure appears.",
  },
  {
    evidenceId: "FIN-DAY1-EVID-002",
    accountLabel: "REAL_BGH_READONLY_01",
    route: "P6-04 / P2-18 / P5-03 / P0-17",
    requiredResult:
      "READ_ONLY review of Finance Desk and dashboard reliance blockers.",
    stopCondition:
      "Stop if BGH can mutate finance facts, approve evidence, approve access or mark production GO.",
  },
  {
    evidenceId: "FIN-DAY1-EVID-003",
    accountLabel: "REAL_AUDIT_READONLY_01",
    route: "P6-04 / audit/evidence review / P0-17",
    requiredResult:
      "READ_ONLY audit review with redacted evidence references only.",
    stopCondition:
      "Stop if Audit sees secrets, raw PII, bank data, vouchers or unrestricted payment evidence.",
  },
  {
    evidenceId: "FIN-DAY1-EVID-004",
    accountLabel: "REAL_PHAP_CHE_REVIEW_01",
    route: "P6-04 / legal-source review / P0-17",
    requiredResult:
      "LEGAL_REVIEW_ONLY, with private contract bodies and finance totals scoped.",
    stopCondition:
      "Stop if legal review exposes unrestricted finance totals, private bodies beyond scope or payout action.",
  },
  {
    evidenceId: "FIN-DAY1-EVID-005",
    accountLabel: "REAL_OUT_OF_SCOPE_NEGATIVE_01",
    route: "P6-04 / blocked route checks / P0-17",
    requiredResult: "BLOCKED or EMPTY_SCOPED_STATE only.",
    stopCondition:
      "Stop if any TTGDTX finance, source, dashboard, audit, settings or evidence data is visible.",
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
        className="mt-5 rounded-md border border-amber-200 bg-white p-4"
        data-finance-desk-day-one-start-gate-evidence="P5-03-FIN-START"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-amber-950">
              Finance Day-1 start-gate evidence before Finance Desk trial
            </h3>
            <p className="mt-2 leading-6 text-amber-900">
              P5-03 cannot start controlled trial, reliance review or Finance
              Desk owner decision until the start-gate checklist is recorded
              outside Git/Codex/chat. Checklist:{" "}
              <span className="font-mono text-xs">
                {financeDayOneStartGateChecklistPath}
              </span>
              .
            </p>
          </div>
          <div className="min-w-72 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
            Decision:
            <span className="mt-1 block font-mono text-xs">
              FIN_START_READY / NO_GO / BLOCKED
            </span>
            <span className="mt-2 block font-mono text-xs">
              FIN-START-EVID-001 through FIN-START-EVID-005
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {startGateEvidenceItems.map((item) => (
            <article
              className="border-l-2 border-amber-300 bg-amber-50 px-3 py-3"
              key={item.evidenceId}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white px-2 py-1 font-mono text-xs font-semibold text-amber-800">
                  {item.evidenceId}
                </span>
                <span className="text-sm font-semibold text-amber-950">
                  {item.gate}
                </span>
              </div>
              <p className="mt-2 leading-5 text-zinc-700">
                Required: {item.requiredEvidence}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
          This checkpoint does not create accounts, send invites, store
          passwords, grant access, execute UAT, accept evidence, approve
          finance reliance, approve access closure, move money, issue bank
          instructions or mark production GO.
        </p>
      </div>

      <div
        className="mt-5 rounded-md border border-cyan-200 bg-white p-4"
        data-finance-desk-controlled-trial-plan="P5-03"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-cyan-950">
              P5-03 Finance Desk controlled trial plan: PASS_LOCAL only
            </h3>
            <p className="mt-2 leading-6 text-cyan-900">
              Use {controlledTrialPlanPath} before opening Finance Desk with
              real-accounting labels. Required decision:{" "}
              <span className="font-mono text-xs">
                P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED
              </span>
              . Filled evidence stays outside Git/Codex/chat.
            </p>
          </div>
          <div className="min-w-72 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-cyan-950">
            Required preconditions:
            <span className="mt-1 block font-mono text-xs">
              FIN_START_READY + FIN_ACTIVATION_READY + P6_04_PRELOGIN_READY
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {controlledTrialItems.map((item) => (
            <article
              className="border-l-2 border-cyan-300 bg-cyan-50 px-3 py-3"
              key={item.trialId}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white px-2 py-1 font-mono text-xs font-semibold text-cyan-800">
                  {item.trialId}
                </span>
                <span className="font-mono text-xs text-cyan-900">
                  {item.accountLabel}
                </span>
              </div>
              <p className="mt-2 leading-5 text-zinc-700">
                Route: {item.routeCheck}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Result: {item.requiredResult}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-cyan-200 bg-cyan-50 p-3">
          <h4 className="font-semibold text-cyan-950">
            Controlled evidence IDs
          </h4>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {controlledTrialEvidenceItems.map((item) => (
              <article className="bg-white px-3 py-3" key={item.evidenceId}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-cyan-50 px-2 py-1 font-mono text-xs font-semibold text-cyan-800">
                    {item.evidenceId}
                  </span>
                  <span className="text-sm font-semibold text-cyan-950">
                    {item.capture}
                  </span>
                </div>
                <p className="mt-2 leading-5 text-cyan-900">
                  Required: {item.requiredContent}
                </p>
                <p className="mt-1 leading-5 text-rose-800">
                  Forbidden: {item.forbiddenContent}
                </p>
              </article>
            ))}
          </div>
        </div>

        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          No bulk real-data import, no auto gach no, no COM production
          calculation, no payment execution and no production GO are allowed in
          this controlled trial.
        </p>
      </div>

      <div
        className="mt-5 rounded-md border border-sky-200 bg-white p-4"
        data-finance-desk-day-one-result-ledger="P5-03-FIN-DAY1"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-semibold text-sky-950">
              Finance Day-1 result ledger: PASS_LOCAL only
            </h3>
            <p className="mt-2 leading-6 text-sky-900">
              Before anyone relies on the Finance Desk cockpit, record Day-1
              result rows in {financeDayOneResultLedgerTemplatePath}. Required
              decision:{" "}
              <span className="font-mono text-xs">
                FIN_DAY1_RESULT_READY / NO_GO / BLOCKED
              </span>
              . Filled evidence and signatures stay outside Git/Codex/chat.
            </p>
          </div>
          <div className="min-w-72 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sky-950">
            Access closure:
            <span className="mt-1 block font-mono text-xs">
              ACCESS_RETAIN / REVOKE_OR_REDUCE / BLOCKED
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {dayOneResultLedgerItems.map((item) => (
            <article
              className="border-l-2 border-sky-300 bg-sky-50 px-3 py-3"
              key={item.evidenceId}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white px-2 py-1 font-mono text-xs font-semibold text-sky-800">
                  {item.evidenceId}
                </span>
                <span className="font-mono text-xs text-sky-900">
                  {item.accountLabel}
                </span>
              </div>
              <p className="mt-2 leading-5 text-zinc-700">
                Route: {item.route}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">
                Required: {item.requiredResult}
              </p>
              <p className="mt-2 leading-5 text-rose-800">
                Stop: {item.stopCondition}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          This panel does not create accounts, store credentials, accept UAT,
          approve finance reliance, approve access closure, move money, issue
          bank instructions or mark production GO.
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
