import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileCheck2,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";

export type UserScopeEffectiveAccessRow = {
  user_id: string;
  email: string;
  full_name: string;
  user_status: string;
  role_code: string | null;
  role_name: string | null;
  department_id: string | null;
  department_code: string | null;
  department_name: string | null;
  manager_id: string | null;
  manager_name: string | null;
  lead_visibility: string;
  segment_scope_count: number;
  partner_scope_count: number;
  direct_report_count: number;
  assigned_lead_count: number;
  created_lead_count: number;
  permission_count: number;
  has_leads_read_all: boolean;
  has_leads_write_all: boolean;
  has_settings_manage: boolean;
  has_scope_manage_department: boolean;
  broad_lead_access: boolean;
  has_business_scope: boolean;
  risk_flags: string[] | null;
  enforcement_status: string;
  access_model: string;
};

export type UserScopeEnforcementSummaryRow = {
  user_count: number;
  ok_count: number;
  check_count: number;
  needs_fix_count: number;
  high_risk_count: number;
  broad_access_count: number;
  strict_access_count: number;
  missing_scope_count: number;
};

type UserScopeEnforcementPanelProps = {
  rows: UserScopeEffectiveAccessRow[];
  summary?: UserScopeEnforcementSummaryRow | null;
  loadError?: string;
};

const statusLabels: Record<string, string> = {
  OK: "OK",
  CHECK: "Cần kiểm tra",
  NEEDS_FIX: "Cần sửa",
  HIGH_RISK: "Rủi ro cao",
};

const statusTones: Record<string, string> = {
  OK: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CHECK: "border-amber-200 bg-amber-50 text-amber-700",
  NEEDS_FIX: "border-orange-200 bg-orange-50 text-orange-700",
  HIGH_RISK: "border-rose-200 bg-rose-50 text-rose-700",
};

const accessModelLabels: Record<string, string> = {
  STRICT: "Chặt theo phạm vi",
  ROLE_ONLY: "Theo role, chưa có scope",
  FULL_CONTROL: "Toàn hệ thống",
  BROAD: "Mở rộng",
};

const leadVisibilityLabels: Record<string, string> = {
  OWN: "Lead của mình",
  TEAM: "Cấp dưới trực tiếp",
  DEPARTMENT: "Cùng phòng ban",
  ALL: "Toàn hệ thống",
};

const riskFlagLabels: Record<string, string> = {
  MISSING_DEPARTMENT: "Chưa gắn phòng ban",
  MISSING_MANAGER: "Chưa gắn quản lý trực tiếp",
  MISSING_BUSINESS_SCOPE: "Chưa phân đối tượng/đối tác",
  OVER_BROAD_NON_ADMIN: "User không phải ADMIN nhưng quyền quá rộng",
  TEAM_SCOPE_WITHOUT_SUBORDINATE: "Chọn xem cấp dưới nhưng chưa có cấp dưới",
};

const roleScopeEvidenceItems = [
  {
    caseId: "P6-04-SCOPE-001",
    title: "Admin and BGH boundaries",
    owner: "IT_DATA + BGH + Audit",
    evidence:
      "UAT_ADMIN and UAT_BGH screenshots proving approved admin/executive access without production GO or daily finance execution.",
  },
  {
    caseId: "P6-04-SCOPE-002",
    title: "KHTC TTGDTX operator scope",
    owner: "KHTC + IT_DATA",
    evidence:
      "Evidence that UAT_KHTC_TTGDTX_OPERATOR sees only assigned TTGDTX finance scope and cannot hard-delete rows.",
  },
  {
    caseId: "P6-04-SCOPE-003",
    title: "Admission and student-service denial",
    owner: "TUYEN_SINH + CTHSSV + DAO_TAO",
    evidence:
      "Evidence that admission/student roles see assigned lead/handover context but cannot approve, pay or view unrestricted finance totals.",
  },
  {
    caseId: "P6-04-SCOPE-004",
    title: "Legal and audit read-only scope",
    owner: "PHAP_CHE + Audit",
    evidence:
      "Evidence that legal/audit roles can review source, evidence and logs in scope without money movement or ownership writes.",
  },
  {
    caseId: "P6-04-SCOPE-005",
    title: "Out-of-scope denial",
    owner: "IT_DATA + Audit",
    evidence:
      "UAT_OUT_OF_SCOPE_STAFF evidence showing blocked or empty scoped state for TTGDTX finance, lead, source and dashboard data.",
  },
  {
    caseId: "P6-04-SCOPE-006",
    title: "No-secret signed evidence",
    owner: "IT_DATA + process owners",
    evidence:
      "Signed evidence references use synthetic labels only; passwords, temporary passwords, password reset links, account activation/invite links, OTPs, keys, CCCD, bank accounts and raw identity data stay outside Git/Codex/chat.",
  },
];

const roleScopeRouteMatrixItems = [
  {
    caseId: "P6-04-ROUTE-01",
    routeFamily: "Login and unauthenticated routes",
    accounts: "All UAT accounts",
    expected:
      "Unauthenticated access is redirected or blocked; authenticated access uses only synthetic UAT labels.",
    stopCondition:
      "A protected route renders sensitive data before auth, permission and scope checks.",
  },
  {
    caseId: "P6-04-ROUTE-02",
    routeFamily: "Lead list/detail",
    accounts: "UAT_TUYEN_SINH_TTGDTX, UAT_CTHSSV, UAT_OUT_OF_SCOPE_STAFF",
    expected:
      "Assigned, team and out-of-scope lead visibility produce ALLOWED, BLOCKED or EMPTY_SCOPED_STATE results.",
    stopCondition:
      "A user sees unrestricted lead data outside assigned segment, team or role.",
  },
  {
    caseId: "P6-04-ROUTE-03",
    routeFamily: "TTGDTX contract/source pages",
    accounts: "UAT_PHAP_CHE, UAT_KHTC_TTGDTX_OPERATOR, UAT_OUT_OF_SCOPE_STAFF",
    expected:
      "Legal/source roles can review scoped source evidence; out-of-scope users are blocked or empty.",
    stopCondition:
      "Contract-only or source-only access exposes unrestricted finance totals or hidden evidence.",
  },
  {
    caseId: "P6-04-ROUTE-04",
    routeFamily: "TTGDTX receivable, collection, reconciliation and payment",
    accounts: "UAT_KHTC_TTGDTX_OPERATOR, UAT_BGH, UAT_TUYEN_SINH_TTGDTX",
    expected:
      "KHTC can operate only inside assigned finance scope; BGH stays read-focused; admission roles cannot approve/pay.",
    stopCondition:
      "A non-finance user can create receivable, collect, approve or pay through a server action.",
  },
  {
    caseId: "P6-04-ROUTE-05",
    routeFamily: "TTGDTX accounting dashboard",
    accounts: "UAT_BGH, UAT_AUDIT, UAT_PHAP_CHE, UAT_OUT_OF_SCOPE_STAFF",
    expected:
      "Dashboard data is read-only, scoped and denied to contract-only or out-of-scope users unless approved.",
    stopCondition:
      "Dashboard shows unrestricted finance totals or exposes raw sensitive evidence.",
  },
  {
    caseId: "P6-04-ROUTE-06",
    routeFamily: "Master/settings pages",
    accounts: "UAT_ADMIN, delegated scope manager, non-admin staff",
    expected:
      "Only approved admin/delegated users manage scopes; broad lead visibility ALL remains admin-only.",
    stopCondition:
      "A non-admin grants broad access, changes protected roles or bypasses soft-revoke controls.",
  },
  {
    caseId: "P6-04-ROUTE-07",
    routeFamily: "Audit log pages",
    accounts: "UAT_AUDIT, UAT_BGH, UAT_OUT_OF_SCOPE_STAFF",
    expected:
      "Audit users can review traceability read-only; no account can mutate money, evidence or role scope from audit pages.",
    stopCondition:
      "Audit views expose raw secrets/PII or provide write actions.",
  },
];

const realAccountingUserUatQueueItems = [
  {
    caseId: "REAL-ACC-01",
    accountClass: "Auth/profile link preflight",
    owner: "IT_DATA + ADMIN",
    expected:
      "Create/invite the real user in Supabase Auth outside Codex/chat, then link the HEU profile with role, department, manager and approved scope.",
    stopCondition:
      "Stop if passwords, temporary passwords, OTPs, password reset links, account activation/invite links, service-role keys or raw identity data enter Git/Codex/chat.",
  },
  {
    caseId: "REAL-ACC-02",
    accountClass: "KHTC accounting operator",
    owner: "KHTC + IT_DATA",
    expected:
      "Open P2-10, P2-13, P2-17, P2-18 and P5-03 only inside assigned TTGDTX finance scope.",
    stopCondition:
      "Stop if the user sees unrestricted dashboard totals, payout actions, source evidence or non-assigned partner/student finance data.",
  },
  {
    caseId: "REAL-ACC-03",
    accountClass: "BGH read-only reviewer",
    owner: "BGH + IT_DATA",
    expected:
      "Open P2-18, P5-03 and Master Control in read-only/review posture for approved summary and blocker review.",
    stopCondition:
      "Stop if the user can execute daily entry, approve/pay, edit source evidence, see hidden raw evidence or trigger production GO.",
  },
  {
    caseId: "REAL-ACC-04",
    accountClass: "Audit read-only reviewer",
    owner: "Audit + IT_DATA",
    expected:
      "Review audit logs, redacted evidence checks, P2-18 and P5-03 traceability without changing ownership or finance facts.",
    stopCondition:
      "Stop if the user can move money, grant roles, mutate source data, bypass redaction or view raw secret/PII evidence.",
  },
  {
    caseId: "REAL-ACC-05",
    accountClass: "Phap Che legal reviewer",
    owner: "PHAP_CHE + IT_DATA",
    expected:
      "Review P0-19 legal/source/contract evidence and approved legal gate status without unrestricted finance totals.",
    stopCondition:
      "Stop if legal-only access exposes unrestricted finance totals, payment execution, dashboard reliance or private contract bodies beyond approved scope.",
  },
  {
    caseId: "REAL-ACC-06",
    accountClass: "Out-of-scope negative account",
    owner: "IT_DATA + Audit",
    expected:
      "Login succeeds but TTGDTX finance, lead, source, dashboard and audit routes return BLOCKED or EMPTY_SCOPED_STATE.",
    stopCondition:
      "Stop if any unrestricted TTGDTX finance, lead, source, dashboard, audit or settings data is visible.",
  },
];

const realAccountingUserResultTemplateItems = [
  {
    field: "Evidence ID",
    required:
      "Stable controlled-evidence ID, for example REAL-ACC-EVID-001.",
  },
  {
    field: "Redacted account label",
    required:
      "Use role/persona labels only; do not record real passwords, reset links, invite links, OTPs or raw email screenshots.",
  },
  {
    field: "Profile and scope",
    required:
      "Record redacted Auth/profile reference, role code, department, segment scope and partner scope.",
  },
  {
    field: "Route and expected result",
    required:
      "Map each test to P6-04 route family plus P2-18/P5-03/P2-10/P2-17 where relevant.",
  },
  {
    field: "Actual result",
    required:
      "Use ALLOWED, BLOCKED, EMPTY_SCOPED_STATE, NO_GO or BLOCKED_PENDING_OWNER_SIGNOFF.",
  },
  {
    field: "Human sign-off",
    required:
      "Record operator, checker, process owner and redaction reviewer outside Codex/chat.",
  },
];

const roleScopeAcceptanceItems = [
  {
    caseId: "P6-04-ACCEPT-01",
    requirement: "Static preflight and synthetic-account boundary",
    minimumEvidence:
      "Required role-scope, data-fetch, dashboard-access and release-gate audits pass; UAT evidence uses synthetic account labels only.",
    stopCondition:
      "Stop if real passwords, temporary passwords, password reset links, account activation/invite links, OTPs, service-role keys, raw PII, CCCD, bank data or voucher data enter evidence.",
  },
  {
    caseId: "P6-04-ACCEPT-02",
    requirement: "Positive role access is scoped",
    minimumEvidence:
      "Approved ADMIN, BGH, KHTC, PHAP_CHE, Audit and process roles can open only the routes and records owned by their role/scope.",
    stopCondition:
      "Stop if an approved user cannot perform required scoped work or sees production GO/daily finance actions outside scope.",
  },
  {
    caseId: "P6-04-ACCEPT-03",
    requirement: "Negative and out-of-scope denial",
    minimumEvidence:
      "UAT_OUT_OF_SCOPE_STAFF, contract-only, admission-only and non-finance accounts receive BLOCKED or EMPTY_SCOPED_STATE where required.",
    stopCondition:
      "Stop if any out-of-scope account sees unrestricted TTGDTX finance, lead, source, dashboard or audit data.",
  },
  {
    caseId: "P6-04-ACCEPT-04",
    requirement: "Server-side enforcement",
    minimumEvidence:
      "Protected pages and server actions check auth, permission and scope before query or write; UI-only hide is not the control.",
    stopCondition:
      "Stop if a route queries sensitive data before canOpen/scope checks or a server action writes despite blocked UI.",
  },
  {
    caseId: "P6-04-ACCEPT-05",
    requirement: "Admin delegation and broad access control",
    minimumEvidence:
      "Broad lead visibility ALL, scope grants and protected role changes remain admin/delegated-only and respect soft-revoke state.",
    stopCondition:
      "Stop if a non-admin grants broad access, changes protected roles, bypasses soft revoke or hard-deletes evidence rows.",
  },
  {
    caseId: "P6-04-ACCEPT-06",
    requirement: "Signed evidence and production boundary",
    minimumEvidence:
      "IT/Data, Audit and process owners sign redacted role-scope results outside Codex/chat before P6-04 supports production review.",
    stopCondition:
      "Stop if PASS_LOCAL is treated as production access approval, broad-permission approval, real-data UAT pass, finance approval or production GO.",
  },
];

const roleScopeAccessDecisionItems = [
  {
    caseId: "P6-04-DEC-01",
    decisionGate: "Static preflight complete",
    requiredDecision:
      "Permission soft-revoke, role-scope access, data-fetch, dashboard-access, UAT-plan, role-scope pack and release-gate audits pass before browser UAT evidence is trusted.",
    owner: "IT_DATA + Audit",
    stopCondition:
      "Stop if any preflight audit fails or real passwords, temporary passwords, password reset links, account activation/invite links, OTPs, service-role keys, raw PII, CCCD, bank data or voucher data enter evidence.",
  },
  {
    caseId: "P6-04-DEC-02",
    decisionGate: "Positive role access decision",
    requiredDecision:
      "ADMIN, BGH, KHTC, PHAP_CHE, Audit and process roles are marked ALLOWED only for approved route families and scoped records.",
    owner: "IT_DATA + process owners",
    stopCondition:
      "Stop if a positive account sees daily finance actions, hidden evidence, production GO controls or records outside approved scope.",
  },
  {
    caseId: "P6-04-DEC-03",
    decisionGate: "Negative denial decision",
    requiredDecision:
      "Out-of-scope, contract-only, admission-only and non-finance accounts are marked BLOCKED or EMPTY_SCOPED_STATE where required.",
    owner: "IT_DATA + Audit",
    stopCondition:
      "Stop if any negative account sees unrestricted TTGDTX finance, lead, source, dashboard, audit or settings data.",
  },
  {
    caseId: "P6-04-DEC-04",
    decisionGate: "Server-side enforcement decision",
    requiredDecision:
      "Protected pages and server actions prove auth, permission and scope checks happen before sensitive query or write behavior.",
    owner: "IT_DATA + Audit",
    stopCondition:
      "Stop if UI hiding is the only control, a query runs before canOpen/scope checks, or a blocked user can still write through a server action.",
  },
  {
    caseId: "P6-04-DEC-05",
    decisionGate: "Broad access and delegation decision",
    requiredDecision:
      "Broad lead visibility, scope grants, protected role changes and delegation remain admin/delegated-only and respect soft-revoke state.",
    owner: "IT_DATA + BGH",
    stopCondition:
      "Stop if a non-admin grants broad access, changes protected roles, bypasses soft revoke, hard-deletes evidence or receives unexpired unsafe delegation.",
  },
  {
    caseId: "P6-04-DEC-06",
    decisionGate: "Human access decision",
    requiredDecision:
      "Operator, checker, process owner, evidence IDs, route results and final decision are recorded as P6_04_ACCESS_READY, NO_GO or BLOCKED.",
    owner: "IT_DATA + Audit + process owners",
    stopCondition:
      "Stop if PASS_LOCAL is treated as production access approval, broad-permission approval, real-data UAT pass, finance approval, owner GO or production GO.",
  },
];

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ShieldCheck;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-zinc-100">
          <Icon className="size-5 text-zinc-600" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{formatNumber(value)}</p>
          <p className="text-sm text-zinc-500">{label}</p>
        </div>
      </div>
    </article>
  );
}

function RiskFlags({ flags }: { flags: string[] | null }) {
  if (!flags || flags.length === 0) {
    return (
      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        Không có cảnh báo
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <span
          key={flag}
          className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800"
        >
          {riskFlagLabels[flag] ?? flag}
        </span>
      ))}
    </div>
  );
}

export function UserScopeEnforcementPanel({
  rows,
  summary,
  loadError,
}: UserScopeEnforcementPanelProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">
              Chưa có User Scope Enforcement P0-06
            </h2>
            <p className="mt-1">
              Hãy chạy file{" "}
              <span className="font-mono">
                database/step45_user_scope_enforcement.sql
              </span>{" "}
              trong Supabase SQL Editor rồi tải lại trang. Chi tiết:{" "}
              {loadError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const effectiveSummary = summary ?? {
    user_count: rows.length,
    ok_count: rows.filter((row) => row.enforcement_status === "OK").length,
    check_count: rows.filter((row) => row.enforcement_status === "CHECK").length,
    needs_fix_count: rows.filter((row) => row.enforcement_status === "NEEDS_FIX")
      .length,
    high_risk_count: rows.filter((row) => row.enforcement_status === "HIGH_RISK")
      .length,
    broad_access_count: rows.filter((row) =>
      ["BROAD", "FULL_CONTROL"].includes(row.access_model),
    ).length,
    strict_access_count: rows.filter((row) => row.access_model === "STRICT")
      .length,
    missing_scope_count: rows.filter(
      (row) =>
        row.segment_scope_count === 0 &&
        row.partner_scope_count === 0 &&
        !["ADMIN", "BGH"].includes(row.role_code ?? ""),
    ).length,
  };

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <LockKeyhole className="size-5 text-zinc-600" />
              <h2 className="text-lg font-semibold">
                User Scope Enforcement P0-06
              </h2>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Kiểm tra quyền đang có hiệu lực: user thuộc phòng nào, quản lý
              trực tiếp là ai, thấy lead theo mức nào, đã được phân đối tượng
              tuyển sinh/đối tác chưa, và có rủi ro mở quá rộng hay không.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
            Đúng người · Đúng phòng · Đúng đối tượng · Đúng dữ liệu
          </span>
        </div>

        <div
          className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
          data-heu-role-scope-ui-guard="P6-04"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="size-4 shrink-0" />
                <span>P6-04 role-scope UAT: PASS_LOCAL only</span>
              </div>
              <p className="mt-2">
                Signed role-scope UAT evidence is still required. NO-GO until
                signed UAT evidence exists for workspace, role and
                out-of-scope denial checks.
              </p>
              <p className="mt-2">
                Do not paste passwords, temporary passwords, password reset
                links, account activation/invite links, OTPs,
                service-role keys, CCCD, bank accounts or raw student identity
                data into Codex, browser UAT notes or screenshots.
              </p>
            </div>
            <div className="grid gap-2 text-xs font-medium text-amber-950 sm:grid-cols-2 lg:min-w-[360px]">
              {[
                "UAT_ADMIN",
                "UAT_BGH",
                "UAT_KHTC",
                "UAT_KHTC_TTGDTX_OPERATOR",
                "UAT_TUYEN_SINH",
                "UAT_TUYEN_SINH_TTGDTX",
                "UAT_CTHSSV",
                "UAT_DAO_TAO",
                "UAT_PHAP_CHE",
                "UAT_AUDIT",
                "UAT_OUT_OF_SCOPE_STAFF",
              ].map((role) => (
                <span
                  key={role}
                  className="rounded-md border border-amber-200 bg-white px-2 py-1"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950"
          data-heu-real-accounting-user-uat-queue="P6-04-P2-18-P5-03"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 font-semibold">
                <ClipboardCheck className="size-4 shrink-0" />
                <span>
                  Real accounting user UAT queue: PASS_LOCAL only
                </span>
              </div>
              <p className="mt-2">
                Run this queue only after real accounts are created or invited
                through an approved secure channel outside Codex/chat and then
                linked into HEU. Record only redacted user labels, route
                results and evidence IDs.
              </p>
              <p className="mt-2">
                Decision value:{" "}
                <span className="font-mono text-xs">
                  REAL_USER_SCOPE_READY / NO_GO / BLOCKED
                </span>
                . Start with accounting users, then expand department by
                department after signed P6-04, P2-18 and P5-03 evidence exists.
              </p>
            </div>
            <div className="min-w-64 rounded-md border border-emerald-200 bg-white px-3 py-2">
              No real passwords, reset links, invite links, OTPs, service-role
              keys, raw PII, CCCD, bank data, vouchers or screenshots with
              secrets may enter Git/Codex/chat.
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {realAccountingUserUatQueueItems.map((item) => (
              <article
                key={item.caseId}
                className="border-l-2 border-emerald-300 bg-white px-3 py-3"
              >
                <p className="text-xs font-semibold uppercase text-emerald-700">
                  {item.caseId}
                </p>
                <p className="mt-1 font-medium text-zinc-950">
                  {item.accountClass}
                </p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Owner: {item.owner}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {item.expected}
                </p>
                <p className="mt-2 leading-5 text-rose-800">
                  Stop: {item.stopCondition}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div
          className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950"
          data-heu-real-accounting-user-result-template="P6-04-P2-18-P5-03"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 font-semibold">
                <FileCheck2 className="size-4 shrink-0" />
                <span>
                  Real accounting user result template: controlled evidence only
                </span>
              </div>
              <p className="mt-2">
                Use this template after running REAL-ACC-01 through
                REAL-ACC-06. Store the filled evidence outside Git/Codex/chat in
                the controlled evidence location, then reference only the
                evidence ID here.
              </p>
            </div>
            <div className="min-w-64 rounded-md border border-teal-200 bg-white px-3 py-2">
              Result decision:
              <span className="mt-1 block font-mono text-xs">
                ALLOWED / BLOCKED / EMPTY_SCOPED_STATE / NO_GO
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            {realAccountingUserResultTemplateItems.map((item) => (
              <article
                key={item.field}
                className="border-l-2 border-teal-300 bg-white px-3 py-3"
              >
                <p className="font-medium text-zinc-950">{item.field}</p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {item.required}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div
          className="mt-5 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm leading-6 text-indigo-950"
          data-heu-role-scope-evidence-checklist="P6-04"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 font-semibold">
                <ClipboardCheck className="size-4 shrink-0" />
                <span>
                  P6-04 role/workspace evidence checklist: PASS_LOCAL only
                </span>
              </div>
              <p className="mt-2">
                Signed role-scope UAT is still required before P6-04 can move
                from IN_PROGRESS. Use only synthetic account labels and redacted
                evidence references; passwords, temporary passwords, password
                reset links, account activation/invite links, OTPs, API keys,
                service-role keys, CCCD, bank accounts, bank statements,
                vouchers and raw student identity data stay outside
                Git/Codex/chat.
              </p>
              <p className="mt-2 font-mono text-xs">
                HEU_ROLE_SCOPE_UAT_EXECUTION_PACK_20260627.md
              </p>
            </div>
            <div className="min-w-64 rounded-md border border-indigo-200 bg-white px-3 py-2">
              Expected results must be ALLOWED, BLOCKED or EMPTY_SCOPED_STATE
              and signed by IT/Data plus the process owner.
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {roleScopeEvidenceItems.map((item) => (
              <article
                key={item.caseId}
                className="border-l-2 border-indigo-300 bg-white px-3 py-3"
              >
                <div className="flex items-start gap-2">
                  <FileCheck2 className="mt-0.5 size-4 shrink-0 text-indigo-700" />
                  <div>
                    <p className="text-xs font-semibold uppercase text-indigo-700">
                      {item.caseId}
                    </p>
                    <p className="mt-1 font-medium text-zinc-950">
                      {item.title}
                    </p>
                    <p className="mt-2 text-xs font-medium text-zinc-500">
                      Owner: {item.owner}
                    </p>
                    <p className="mt-2 leading-5 text-zinc-700">
                      {item.evidence}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              PASS_LOCAL does not approve production access, broad permissions,
              real-data UAT, finance action, hard-delete, AI approval or
              production GO.
            </p>
          </div>
        </div>

        <div
          className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-950"
          data-heu-role-scope-route-matrix="P6-04"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 font-semibold">
                <ClipboardCheck className="size-4 shrink-0" />
                <span>P6-04 role-scope route matrix: PASS_LOCAL only</span>
              </div>
              <p className="mt-2">
                Browser UAT must prove each route family with positive and
                negative synthetic accounts. Results must be ALLOWED, BLOCKED
                or EMPTY_SCOPED_STATE; a UI-only hide is not enough if a server
                action can still write.
              </p>
              <p className="mt-2 font-mono text-xs">
                TTGDTX_ROLE_SCOPE_UAT_RUNBOOK.md
              </p>
            </div>
            <div className="min-w-64 rounded-md border border-slate-200 bg-white px-3 py-2">
              Signed evidence is still required outside Codex/chat before
              P6-04 can support production readiness.
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {roleScopeRouteMatrixItems.map((item) => (
              <article
                key={item.caseId}
                className="border-l-2 border-slate-300 bg-white px-3 py-3"
              >
                <p className="text-xs font-semibold uppercase text-slate-600">
                  {item.caseId}
                </p>
                <p className="mt-1 font-medium text-zinc-950">
                  {item.routeFamily}
                </p>
                <p className="mt-2 font-mono text-xs text-slate-700">
                  {item.accounts}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {item.expected}
                </p>
                <p className="mt-2 leading-5 text-rose-700">
                  Stop: {item.stopCondition}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              Do not paste passwords, temporary passwords, password reset
              links, account activation/invite links, OTPs, API
              keys, service-role keys, CCCD, bank accounts, bank statements,
              vouchers or raw student identity data into route UAT evidence.
            </p>
          </div>
        </div>

        <div
          className="mt-5 rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-950"
          data-heu-role-scope-acceptance-matrix="P6-04"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 font-semibold">
                <ClipboardCheck className="size-4 shrink-0" />
                <span>
                  P6-04 role-scope acceptance matrix: PASS_LOCAL only
                </span>
              </div>
              <p className="mt-2">
                Decision value:{" "}
                <span className="font-mono text-xs">
                  P6_04_ACCEPT / FAIL / BLOCKED
                </span>
                . Use this matrix to decide whether signed role-scope evidence
                can support owner review, not to approve production access.
              </p>
            </div>
            <div className="min-w-64 rounded-md border border-cyan-200 bg-white px-3 py-2">
              PASS_LOCAL does not approve production access, broad permissions,
              real-data UAT, finance action or production GO.
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {roleScopeAcceptanceItems.map((item) => (
              <article
                key={item.caseId}
                className="border-l-2 border-cyan-300 bg-white px-3 py-3"
              >
                <p className="text-xs font-semibold uppercase text-cyan-700">
                  {item.caseId}
                </p>
                <p className="mt-1 font-medium text-zinc-950">
                  {item.requirement}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {item.minimumEvidence}
                </p>
                <p className="mt-2 leading-5 text-rose-800">
                  {item.stopCondition}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div
          className="mt-5 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950"
          data-heu-role-scope-access-decision-manifest="P6-04"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 font-semibold">
                <ClipboardCheck className="size-4 shrink-0" />
                <span>
                  P6-04 role-scope access decision manifest: PASS_LOCAL only
                </span>
              </div>
              <p className="mt-2">
                Use this manifest after route UAT and before owner review. It
                records who is allowed, blocked or empty-scoped, but it does
                not approve production access, broad permissions, real-data
                UAT, finance action or production GO.
              </p>
            </div>
            <div className="min-w-64 rounded-md border border-sky-200 bg-white px-3 py-2">
              Access decision:
              <span className="mt-1 block font-mono text-xs">
                P6_04_ACCESS_READY / NO_GO / BLOCKED
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {roleScopeAccessDecisionItems.map((item) => (
              <article
                key={item.caseId}
                className="border-l-2 border-sky-300 bg-white px-3 py-3"
              >
                <p className="text-xs font-semibold uppercase text-sky-700">
                  {item.caseId}
                </p>
                <p className="mt-1 font-medium text-zinc-950">
                  {item.decisionGate}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {item.requiredDecision}
                </p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Owner: {item.owner}
                </p>
                <p className="mt-2 leading-5 text-rose-800">
                  Stop: {item.stopCondition}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-md border border-sky-200 bg-white px-3 py-2 text-sky-900">
            Missing access decision ID, unsigned owner decision, unresolved
            route result, server-side bypass or raw sensitive role-scope
            evidence keeps P6-04 NO-GO.
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="User OK" value={effectiveSummary.ok_count} icon={CheckCircle2} />
        <Metric label="Cần sửa" value={effectiveSummary.needs_fix_count} icon={AlertTriangle} />
        <Metric label="Rủi ro cao" value={effectiveSummary.high_risk_count} icon={ShieldAlert} />
        <Metric label="Chặt theo scope" value={effectiveSummary.strict_access_count} icon={LockKeyhole} />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-zinc-600" />
            <h3 className="text-base font-semibold">
              Bảng kiểm tra phạm vi hiệu lực
            </h3>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Nếu một dòng có cảnh báo, hãy chọn user đó ở phần bên dưới và sửa
            phòng ban, quản lý trực tiếp, mức hiển thị lead hoặc phạm vi đối
            tượng/đối tác.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Phòng / quản lý</th>
                <th className="px-5 py-3">Mức lead</th>
                <th className="px-5 py-3">Phạm vi</th>
                <th className="px-5 py-3">Lead liên quan</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Cảnh báo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {rows.map((row) => (
                <tr key={row.user_id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-950">{row.full_name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{row.email}</p>
                    <p className="mt-2 rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                      {row.role_name ?? row.role_code ?? "Chưa gắn role"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-700">
                      {row.department_name ?? "Chưa gắn phòng"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Quản lý: {row.manager_name ?? "Chưa gắn"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Cấp dưới: {formatNumber(row.direct_report_count)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-700">
                      {leadVisibilityLabels[row.lead_visibility] ??
                        row.lead_visibility}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {accessModelLabels[row.access_model] ?? row.access_model}
                    </p>
                    {row.broad_lead_access ? (
                      <p className="mt-2 inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                        Quyền rộng
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-zinc-700">
                      <Users className="size-4 text-zinc-400" />
                      {formatNumber(row.segment_scope_count)} đối tượng ·{" "}
                      {formatNumber(row.partner_scope_count)} đối tác
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {row.has_business_scope
                        ? "Đã có scope nghiệp vụ"
                        : "Chưa phân scope nghiệp vụ"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-zinc-700">
                      Đang phụ trách: {formatNumber(row.assigned_lead_count)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Đã tạo: {formatNumber(row.created_lead_count)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                        statusTones[row.enforcement_status] ??
                        "border-zinc-200 bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {statusLabels[row.enforcement_status] ??
                        row.enforcement_status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <RiskFlags flags={row.risk_flags} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 ? (
          <div className="border-t border-zinc-200 p-5 text-sm text-zinc-500">
            Chưa có user nào trong phạm vi bạn được xem.
          </div>
        ) : null}
      </section>
    </section>
  );
}
