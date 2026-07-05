import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Gavel,
  LayoutDashboard,
  LockKeyhole,
  Route,
  ShieldCheck,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getHeuRoleLane,
  HEU_DEPARTMENT_ROLE_LANE_MAP,
  HEU_ROLE_LANE_MATRIX,
} from "@/lib/heu-role-lanes";
import { PRODUCTION_BLOCKERS } from "@/lib/production-readiness";
import { withAdmissionSegmentParam } from "@/lib/workspace";

type ExecutiveKpi = {
  label: string;
  value: string;
  trend: string;
  tone: string;
};

type ExecutivePipelineItem = {
  status: string;
  label: string;
  count: number;
  color: string;
};

export type ExecutiveDashboardPermissions = {
  canOpenMasterControl: boolean;
  canOpenFinanceDesk: boolean;
  canOpenScopeControl: boolean;
};

type ExecutiveDashboardOverviewProps = {
  roleCode: string;
  activeSegmentId: string | null;
  activeSegmentLabel: string | null;
  focusMode?: string | null;
  kpis: ExecutiveKpi[];
  pipeline: ExecutivePipelineItem[];
  activities: string[];
  permissions: ExecutiveDashboardPermissions;
  segmentOverview?: ReactNode;
};

type ExecutiveQuickLink = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone?: "primary" | "default";
};

type ExecutiveReportReliance = {
  reportView: string;
  label: string;
  owner: string;
  decisionState: string;
  dqGate: string;
  blocker: string;
  href: string;
};

type ExecutiveReportSourceMapTriage = {
  code: string;
  label: string;
  ownerLane: string;
  requiredProof: string;
  stopRule: string;
  href: string;
};

type ExecutiveReportSourceFastIndex = {
  code: string;
  reportView: string;
  ownerLane: string;
  sourceRoute: string;
  dqGate: string;
  evidenceRoute: string;
  stopRule: string;
  href: string;
};

type ExecutiveReportDashboardScopeContract = {
  code: string;
  reportView: string;
  dashboardConsumer: string;
  scopeGate: string;
  sourceContract: string;
  relianceBlocker: string;
  href: string;
};

type ExecutiveLegalSopTriage = {
  code: string;
  label: string;
  ownerLane: string;
  requiredProof: string;
  stopRule: string;
  href: string;
};

type ExecutiveLegalSopAction = {
  code: string;
  module: string;
  owner: string;
  state: string;
  action: string;
  blocker: string;
  href: string;
};

type ExecutiveLegalSopAuthorityCheck = {
  code: string;
  question: string;
  ownerLane: string;
  requiredProof: string;
  stopRule: string;
};

type ExecutiveLegalSopRequiredAnswerIndex = {
  code: string;
  workflow: string;
  legalBasis: string;
  sopRoute: string;
  makerCheckerApprover: string;
  evidenceSigner: string;
  stopRule: string;
  href: string;
};

type ExecutiveLegalSopEvidenceAuthorityQueue = {
  code: string;
  queue: string;
  ownerLane: string;
  missingAnswer: string;
  evidenceAuthority: string;
  nextControl: string;
  stopRule: string;
  href: string;
};

type ExecutiveModuleMaturity = {
  code: string;
  label: string;
  status: string;
  ownerAction: string;
  href: string;
};

type ExecutiveSectionNavItem = {
  code: string;
  label: string;
  href: string;
};

type ExecutiveOperatingBrainCompletion = {
  code: string;
  pillar: string;
  evidenceChain: string;
  authorityRule: string;
  dashboardScope: string;
  stopRule: string;
  href: string;
};

type ExecutiveEffectiveAccessReadOnlyGate = {
  code: string;
  roleLane: string;
  liveSurface: string;
  readonlyRule: string;
  currentBlocker: string;
  requiredOwnerAction: string;
  stopRule: string;
  href: string;
};

type ExecutiveFocusMode =
  | "all"
  | "reports"
  | "finance"
  | "evidence"
  | "roles"
  | "legal"
  | "modules"
  | "blockers";

type ExecutiveFocusModeItem = {
  mode: ExecutiveFocusMode;
  code: string;
  label: string;
  description: string;
};

type ExecutiveFocusNextAction = {
  mode: ExecutiveFocusMode;
  code: string;
  label: string;
  ownerLane: string;
  nextAction: string;
  stopRule: string;
  href: string;
  icon: LucideIcon;
};

type ExecutivePriorityFocusItem = {
  code: string;
  label: string;
  ownerLane: string;
  state: string;
  focusMode: ExecutiveFocusMode;
  icon: LucideIcon;
};

type ExecutiveFinanceProof = {
  code: string;
  label: string;
  surface: string;
  requiredProof: string;
  state: string;
  stopRule: string;
  href: string;
};

type ExecutiveFinanceRelianceFastIndex = {
  code: string;
  surface: string;
  sourceContract: string;
  requiredProof: string;
  decisionGate: string;
  forbiddenAction: string;
  nextRoute: string;
  href: string;
};

type ExecutiveFinanceReadonlyRelianceLock = {
  code: string;
  surface: string;
  visibleUse: string;
  requiredBeforeReliance: string;
  forbiddenUntilSigned: string;
  ownerLane: string;
  href: string;
};

type ExecutiveFinanceSourceContract = {
  code: string;
  metric: string;
  sourceRoute: string;
  ownerLane: string;
  requiredEvidence: string;
  stopRule: string;
};

type ExecutiveFinanceRelianceDecision = {
  code: string;
  label: string;
  ownerLane: string;
  requiredProof: string;
  stopRule: string;
  href: string;
};

type ExecutiveUatEvidenceRoute = {
  code: string;
  route: string;
  ownerLane: string;
  requiredEvidence: string;
  state: string;
  stopRule: string;
  href: string;
};

type ExecutiveUatEvidenceClosure = {
  code: string;
  label: string;
  ownerLane: string;
  requiredProof: string;
  stopRule: string;
  href: string;
};

type ExecutiveUatEvidenceFastAction = {
  code: string;
  blocker: string;
  ownerLane: string;
  firstAction: string;
  evidenceKey: string;
  stopRule: string;
  href: string;
};

type ExecutiveUatEvidenceAcceptanceLock = {
  code: string;
  evidenceLane: string;
  visibleUse: string;
  requiredBeforeAcceptance: string;
  forbiddenUntilSigned: string;
  ownerLane: string;
  href: string;
};

type ExecutiveProductionBlockerTriage = {
  code: string;
  label: string;
  ownerLane: string;
  requiredProof: string;
  stopRule: string;
  href: string;
};

type ExecutiveRoleScopeDecision = {
  code: string;
  label: string;
  ownerLane: string;
  requiredProof: string;
  stopRule: string;
  href: string;
};

type ExecutiveDashboardScopeVisibility = {
  code: string;
  actorLane: string;
  dashboardScope: string;
  enforcedBy: string;
  blockedRule: string;
  href: string;
};

type ExecutiveDashboardPermissionMatrix = {
  code: string;
  roleLane: string;
  routeSurface: string;
  requiredPermission: string;
  runtimeSignal: keyof ExecutiveDashboardPermissions | "readOnlyDashboard";
  stopRule: string;
  href: string;
};

const moduleHealth = [
  {
    code: "M05",
    title: "Tuyển sinh CRM",
    status: "Strong internal",
    next: "Giữ handover ở trạng thái UAT/finance/legal gated.",
  },
  {
    code: "M09",
    title: "Tài chính/Công nợ",
    status: "Read-only",
    next: "Chỉ xem cockpit, chưa dùng làm chứng từ/kế toán.",
  },
  {
    code: "M01",
    title: "Pháp chế/SOP",
    status: "CAN_SUA",
    next: "Cần PHAP_CHE/KHTC xác nhận căn cứ và chứng từ.",
  },
  {
    code: "M02",
    title: "User/Role/Scope",
    status: "CAN_SUA",
    next: "Cần P6-04 role/workspace UAT và negative account.",
  },
  {
    code: "M10",
    title: "Dashboard/Reports",
    status: "CAN_SUA",
    next: "Cần report-view signoff trước khi reliance.",
  },
  {
    code: "M12",
    title: "Audit/Risk",
    status: "Strong internal",
    next: "Cần signed audit-log UAT và cascade closure.",
  },
];

const executiveOperatingBrainCompletionRows: ExecutiveOperatingBrainCompletion[] =
  [
    {
      code: "BRAIN-GATE-01",
      pillar: "Executive read-only landing",
      evidenceChain:
        "STD-01 dashboard route, executive role gate, quick access and no-create boundary.",
      authorityRule:
        "HIEU_TRUONG, PHO_HIEU_TRUONG, BGH and ADMIN inspect the cockpit only.",
      dashboardScope:
        "Whole-system executive view is read-only and still carries NO-GO blockers.",
      stopRule:
        "NO_STATE_MUTATION, NO_APPROVAL_ACTION, NO_UAT_ACCEPTANCE, NO_OWNER_GO.",
      href: "#executive-overview",
    },
    {
      code: "BRAIN-GATE-02",
      pillar: "Role/scope dashboard visibility",
      evidenceChain:
        "STD-23, STD-32, STD-37, STD-38 and STD-44 bind role lane, department lane, scope visibility, runtime permission and live effective-access gates.",
      authorityRule:
        "Quyen o dau thi chi duoc xem dashboard o day; permission view is not permission grant.",
      dashboardScope:
        "Executive all-segment read-only; non-executive only active segment or visible segment dashboards.",
      stopRule:
        "NO_ACCESS_GRANT, NO_PERMISSION_EXPANSION, NO_ACCOUNT_CREATE, NO_ROLE_ASSIGNMENT, NO_APPROVAL_PERMISSION.",
      href: "#executive-role-scope",
    },
    {
      code: "BRAIN-GATE-03",
      pillar: "Report/source reliance map",
      evidenceChain:
        "STD-24, STD-33 and STD-39 map report view, source route, DQ gate, scope gate and dashboard consumer.",
      authorityRule:
        "Report owner, IT_DATA and Audit must keep source map and DQ-DM-05 visible before reliance.",
      dashboardScope:
        "Report widgets stay advisory until owner signoff and controlled evidence refs exist.",
      stopRule:
        "NO_DASHBOARD_RELIANCE, NO_REPORT_VIEW_RELIANCE, NO_RAW_SOURCE_OPEN.",
      href: "#executive-report-reliance",
    },
    {
      code: "BRAIN-GATE-04",
      pillar: "Legal/SOP authority backbone",
      evidenceChain:
        "STD-14, STD-25, STD-34 and STD-40 expose legal basis, SOP, maker, checker, approver, evidence location and signer.",
      authorityRule:
        "PHAP_CHE and SOP owner signoff are required before a workflow becomes official.",
      dashboardScope:
        "Dashboard can route missing authority only; it cannot issue legal advice or official SOP.",
      stopRule:
        "NO_LEGAL_CONCLUSION, NO_OFFICIAL_SOP, NO_RAW_EVIDENCE_MOVEMENT.",
      href: "#executive-legal-sop",
    },
    {
      code: "BRAIN-GATE-05",
      pillar: "Finance read-only reliance lock",
      evidenceChain:
        "STD-15, STD-26, STD-35 and STD-41 lock finance source contract, fast index, triage and read-only reliance.",
      authorityRule:
        "KHTC, BGH and Audit need signed P2-18/P5-03, Finance Day-1 and owner reliance decision.",
      dashboardScope:
        "Finance dashboard numbers are blockers and trends, not accounting records.",
      stopRule:
        "NO_FINANCE_RELIANCE, NO_DEBT_CLEARING, NO_VOUCHER_POSTING, NO_PAYMENT_EXECUTION, NO_MONEY_MOVEMENT.",
      href: "#executive-finance-readonly",
    },
    {
      code: "BRAIN-GATE-06",
      pillar: "UAT/evidence acceptance lock",
      evidenceChain:
        "STD-16, STD-27, STD-28, STD-36 and STD-42 route evidence, closure triage, production blockers and acceptance lock.",
      authorityRule:
        "Signed UAT, controlled evidence, owner signoff and final GO/NO-GO must stay outside Git/Codex/chat.",
      dashboardScope:
        "BGH can see missing proof and route owners, but cannot accept UAT/evidence locally.",
      stopRule:
        "NO_UAT_EXECUTION, NO_UAT_ACCEPTANCE, NO_EVIDENCE_ACCEPTANCE, NO_OWNER_GO, NO_PRODUCTION_GO.",
      href: "#executive-uat-evidence",
    },
    {
      code: "BRAIN-GATE-07",
      pillar: "Executive effective-access read-only live gate",
      evidenceChain:
        "STD-44 scans active role_permissions for BGH, HIEU_TRUONG and PHO_HIEU_TRUONG before relying on the cockpit.",
      authorityRule:
        "Executive roles may inspect status; approve, pay, create, update, manage or sensitive-read permissions stay NO_GO until owner reduce/revoke evidence exists.",
      dashboardScope:
        "Dashboard visibility is not workflow authority, finance authority, legal authority or UAT authority.",
      stopRule:
        "LIVE_EXECUTIVE_PERMISSION_NO_GO, NO_APPROVAL_PERMISSION, NO_PAYMENT_PERMISSION, NO_PERMISSION_EXPANSION.",
      href: "#executive-role-scope",
    },
  ];

const executiveEffectiveAccessReadOnlyGateRows: ExecutiveEffectiveAccessReadOnlyGate[] =
  [
    {
      code: "EXEC-ACCESS-01",
      roleLane: "HIEU_TRUONG",
      liveSurface: "active role_permissions + user_scope_effective_access",
      readonlyRule:
        "Allowed executive cockpit posture is read-only advisory visibility only.",
      currentBlocker:
        "LIVE_EXECUTIVE_PERMISSION_NO_GO if master_control.approve, workflow_request.approve or any write/action permission is active.",
      requiredOwnerAction:
        "Record owner-approved reduce/revoke packet, controlled evidence id and rerun STD-44.",
      stopRule:
        "NO_APPROVAL_PERMISSION, NO_ACCESS_GRANT, NO_ROLE_ASSIGNMENT, NO_OWNER_GO.",
      href: "/settings/scopes",
    },
    {
      code: "EXEC-ACCESS-02",
      roleLane: "PHO_HIEU_TRUONG",
      liveSurface: "active role_permissions + delegated executive lane",
      readonlyRule:
        "Delegated executive view can inspect blockers and route owners, not approve workflow state.",
      currentBlocker:
        "LIVE_EXECUTIVE_PERMISSION_NO_GO if workflow_request.approve, master_control.check or any write/action permission is active.",
      requiredOwnerAction:
        "Reduce to read permissions or document a signed temporary delegation outside Git/Codex/chat.",
      stopRule:
        "NO_DELEGATED_APPROVAL_FROM_DASHBOARD, NO_PERMISSION_EXPANSION, NO_UAT_ACCEPTANCE.",
      href: "/settings/scopes",
    },
    {
      code: "EXEC-ACCESS-03",
      roleLane: "BGH",
      liveSurface:
        "active role_permissions across finance, short-course, HOU, TTGDTX and master-control modules",
      readonlyRule:
        "BGH dashboard can see all segments read-only; it must not pay, approve, manage, create, update, lock, submit, reject or read sensitive raw evidence by default.",
      currentBlocker:
        "LIVE_EXECUTIVE_PERMISSION_NO_GO when any active permission ends with approve/manage/create/update/delete/pay/lock/submit/reject/reverse/issue/cancel/assign/open/convert/verify or read_sensitive.",
      requiredOwnerAction:
        "Run a controlled reduce/revoke lane before Finance, Legal/SOP, UAT or production reliance.",
      stopRule:
        "NO_PAYMENT_PERMISSION, NO_FINANCE_ACTION, NO_RAW_SOURCE_OPEN, NO_PRODUCTION_GO.",
      href: "/settings/scopes",
    },
    {
      code: "EXEC-ACCESS-04",
      roleLane: "Effective access views",
      liveSurface: "user_scope_effective_access + user_scope_enforcement_summary",
      readonlyRule:
        "Dashboard permission matrix must be backed by the effective-access truth surface, not only UI route hints.",
      currentBlocker:
        "BLOCKED if the views cannot be read or enforcement_status/risk_flags cannot be inspected.",
      requiredOwnerAction:
        "IT_DATA/Audit must preserve readable effective-access views and rerun permission-scope checks.",
      stopRule:
        "NO_HIDDEN_SCOPE_STATE, NO_SCOPE_BYPASS, NO_DASHBOARD_RELIANCE.",
      href: "/settings/scopes",
    },
    {
      code: "EXEC-ACCESS-05",
      roleLane: "Revoke/reduce evidence",
      liveSurface: "role_permissions.status soft-revoke path",
      readonlyRule:
        "Reducing risky executive permissions must use the soft-revoke/audit path, not hard delete or silent DB edits.",
      currentBlocker:
        "NO_GO until controlled_evidence_id, owner reviewer and post-repair snapshot are recorded outside Git/Codex/chat.",
      requiredOwnerAction:
        "Use INACTIVE soft revoke or approved matrix update, then rerun STD-44 and P6-04 role/workspace UAT.",
      stopRule:
        "NO_HARD_DELETE, NO_HIDDEN_PERMISSION_CHANGE, NO_EVIDENCE_ACCEPTANCE.",
      href: "/settings/scopes",
    },
    {
      code: "EXEC-ACCESS-06",
      roleLane: "Completion dependency",
      liveSurface: "STD-43 operating brain completion gate",
      readonlyRule:
        "STD-43 is not operationally complete while STD-44 reports active executive write/approval/payment permissions.",
      currentBlocker:
        "BRAIN-GATE remains advisory if live permission-scope, negative-control, signed UAT or owner evidence is missing.",
      requiredOwnerAction:
        "Close live blockers before any dashboard reliance, finance reliance, official SOP or owner GO.",
      stopRule:
        "NO_DASHBOARD_RELIANCE, NO_FINANCE_RELIANCE, NO_OFFICIAL_SOP, NO_OWNER_GO.",
      href: "#executive-overview",
    },
  ];

const executiveSectionNavItems: ExecutiveSectionNavItem[] = [
  {
    code: "OVR",
    label: "Overview",
    href: "#executive-overview",
  },
  {
    code: "PRI",
    label: "Priority",
    href: "#executive-priority-focus",
  },
  {
    code: "NXT",
    label: "Next action",
    href: "#executive-focus-next-action",
  },
  {
    code: "QCK",
    label: "Quick access",
    href: "#executive-quick-access",
  },
  {
    code: "RPT",
    label: "Reports",
    href: "#executive-report-reliance",
  },
  {
    code: "FIN",
    label: "Finance",
    href: "#executive-finance-readonly",
  },
  {
    code: "EVD",
    label: "UAT/evidence",
    href: "#executive-uat-evidence",
  },
  {
    code: "ROL",
    label: "Role/scope",
    href: "#executive-role-scope",
  },
  {
    code: "LAW",
    label: "Legal/SOP",
    href: "#executive-legal-sop",
  },
  {
    code: "M12",
    label: "M01-M12",
    href: "#executive-module-maturity",
  },
  {
    code: "BLK",
    label: "Blockers",
    href: "#executive-blockers",
  },
  {
    code: "ADM",
    label: "Admissions",
    href: "#executive-admissions-signal",
  },
];

const executiveFocusModeItems: ExecutiveFocusModeItem[] = [
  {
    mode: "all",
    code: "ALL",
    label: "Toan canh",
    description: "Mo tat ca section dieu hanh",
  },
  {
    mode: "reports",
    code: "RPT",
    label: "Reports",
    description: "Report-view va source map",
  },
  {
    mode: "finance",
    code: "FIN",
    label: "Finance",
    description: "Read-only reliance va nguon so lieu",
  },
  {
    mode: "evidence",
    code: "EVD",
    label: "UAT/evidence",
    description: "Duong bang chung can ky",
  },
  {
    mode: "roles",
    code: "ROL",
    label: "Role/scope",
    description: "Dung nguoi dung viec",
  },
  {
    mode: "legal",
    code: "LAW",
    label: "Legal/SOP",
    description: "Can cu, SOP va authority",
  },
  {
    mode: "modules",
    code: "M12",
    label: "M01-M12",
    description: "Module maturity va KPI",
  },
  {
    mode: "blockers",
    code: "BLK",
    label: "Blockers",
    description: "NO-GO va production blockers",
  },
];

const executiveFocusNextActionRows: ExecutiveFocusNextAction[] = [
  {
    mode: "all",
    code: "NEXT-ALL",
    label: "Start with priority focus",
    ownerLane: "BGH + accountable owners",
    nextAction:
      "Review Finance, Evidence, Legal/SOP, Reports, Role/scope and Blockers before drilling into a lane.",
    stopRule:
      "Read-only route hint only; no workflow mutation, UAT acceptance or owner GO.",
    href: "#executive-priority-focus",
    icon: AlertTriangle,
  },
  {
    mode: "reports",
    code: "NEXT-RPT",
    label: "Open report source map",
    ownerLane: "Report owner + IT_DATA + Audit",
    nextAction:
      "Check report-view owner, DQ gate, source map and blocker before any reliance discussion.",
    stopRule:
      "No dashboard reliance, no finance action and no production conclusion.",
    href: "#executive-report-reliance",
    icon: BarChart3,
  },
  {
    mode: "finance",
    code: "NEXT-FIN",
    label: "Check finance source contract",
    ownerLane: "KHTC + BGH + Audit",
    nextAction:
      "Confirm receivable, collection, reconciliation, payment request and payout evidence sources.",
    stopRule:
      "No statutory accounting, voucher posting, bank instruction or payment execution.",
    href: "#executive-finance-readonly",
    icon: WalletCards,
  },
  {
    mode: "evidence",
    code: "NEXT-EVD",
    label: "Route signed evidence",
    ownerLane: "IT_DATA + Audit + BGH",
    nextAction:
      "Open the UAT/evidence lane and identify which signed package is still pending.",
    stopRule:
      "No evidence upload, evidence acceptance, UAT acceptance or access closure.",
    href: "#executive-uat-evidence",
    icon: ClipboardCheck,
  },
  {
    mode: "roles",
    code: "NEXT-ROL",
    label: "Check executive role/scope",
    ownerLane: "IT_DATA + Audit + BGH",
    nextAction:
      "Confirm the current role lane, allowed read scope, forbidden actions and P6-04 negative proof.",
    stopRule:
      "No access grant, permission expansion, UAT acceptance or owner GO.",
    href: "#executive-role-scope",
    icon: LockKeyhole,
  },
  {
    mode: "legal",
    code: "NEXT-LAW",
    label: "Check Legal/SOP authority",
    ownerLane: "PHAP_CHE + KHTC + process owner",
    nextAction:
      "Confirm legal basis, SOP version, maker, checker, approver, evidence and signer route.",
    stopRule:
      "No legal advice, official SOP, finance approval or owner GO.",
    href: "#executive-legal-sop",
    icon: Gavel,
  },
  {
    mode: "modules",
    code: "NEXT-M12",
    label: "Scan module maturity",
    ownerLane: "BGH + module owners",
    nextAction:
      "Review module status, owner action and KPI signal before assigning closure work.",
    stopRule:
      "No hidden blocker, no UAT acceptance and no production GO.",
    href: "#executive-module-maturity",
    icon: LayoutDashboard,
  },
  {
    mode: "blockers",
    code: "NEXT-BLK",
    label: "Close NO-GO blockers",
    ownerLane: "BGH + accountable owners",
    nextAction:
      "Open the blocker list and route each missing proof to the accountable owner lane.",
    stopRule:
      "No waiver, owner GO/NO-GO or production GO from the dashboard.",
    href: "#executive-blockers",
    icon: ShieldCheck,
  },
];

const executivePriorityFocusItems: ExecutivePriorityFocusItem[] = [
  {
    code: "FIN",
    label: "Finance reliance",
    ownerLane: "KHTC + BGH + Audit",
    state: "P2-18/P5-03 signed proof pending",
    focusMode: "finance",
    icon: WalletCards,
  },
  {
    code: "EVD",
    label: "UAT/evidence route",
    ownerLane: "IT_DATA + Audit + BGH",
    state: "P0-14/P6-04/P2-18/P5-03 signed evidence pending",
    focusMode: "evidence",
    icon: ClipboardCheck,
  },
  {
    code: "LAW",
    label: "Legal/SOP",
    ownerLane: "PHAP_CHE + process owner",
    state: "Legal basis and SOP authority pending",
    focusMode: "legal",
    icon: Gavel,
  },
  {
    code: "RPT",
    label: "Report reliance",
    ownerLane: "Report owner + IT_DATA",
    state: "Report-view signoff and DQ-DM-05 pending",
    focusMode: "reports",
    icon: BarChart3,
  },
  {
    code: "ROL",
    label: "Role/scope",
    ownerLane: "IT_DATA + Audit",
    state: "P6-04 role/workspace UAT pending",
    focusMode: "roles",
    icon: LockKeyhole,
  },
  {
    code: "BLK",
    label: "Production blockers",
    ownerLane: "BGH + accountable owners",
    state: "Final owner GO/NO-GO unsigned",
    focusMode: "blockers",
    icon: AlertTriangle,
  },
];

const financeReadOnlyProofRows: ExecutiveFinanceProof[] = [
  {
    code: "P2-18",
    label: "Accounting dashboard source reconciliation",
    surface: "/ttgdtx/accounting-dashboard",
    requiredProof:
      "Signed browser UAT, source-total reconciliation, redacted evidence and owner reliance decision.",
    state: "P2_18_RELIANCE_PENDING / NO_GO / BLOCKED",
    stopRule:
      "No dashboard reliance, statutory accounting, voucher posting or finance conclusion.",
    href: "/ttgdtx/accounting-dashboard",
  },
  {
    code: "P5-03",
    label: "Finance Desk controlled trial",
    surface: "/finance-desk",
    requiredProof:
      "P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005, scoped user proof and no-write result.",
    state: "P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED",
    stopRule:
      "No create, update, approve, pay, import-write, source-edit or bank instruction.",
    href: "/finance-desk",
  },
  {
    code: "FIN-DAY1",
    label: "Finance Day-1 start/result ledger",
    surface: "Finance Day-1 controlled evidence refs",
    requiredProof:
      "FIN-START-EVID-001 through FIN-START-EVID-005 and FIN-DAY1-EVID-001 through FIN-DAY1-EVID-005.",
    state: "FIN_START_READY / FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    stopRule:
      "No access closure, expansion or reliance decision without signed owner result.",
    href: "/finance-desk",
  },
  {
    code: "ACCT-LOCAL",
    label: "Accounting local readiness gate",
    surface: "ACCT_LOCAL_READY guard chain",
    requiredProof:
      "ACCT-00 negative-control proof, owner closure ledger, risk closure and access closure decision.",
    state: "ACCT_LOCAL_READY / NO_GO / BLOCKED",
    stopRule:
      "No finance reliance while negative proof, owner evidence or access closure is pending.",
    href: "/ttgdtx/accounting-dashboard",
  },
];

const financeRelianceFastIndexRows: ExecutiveFinanceRelianceFastIndex[] = [
  {
    code: "FIN-IDX-01",
    surface: "P2-18 accounting dashboard",
    sourceContract: "RV_TTGDTX_FINANCE_SUMMARY + source reconciliation",
    requiredProof:
      "Signed browser UAT, source-total reconciliation, DQ-DM-05 and owner reliance decision.",
    decisionGate: "P2_18_RELIANCE_PENDING / NO_GO / BLOCKED",
    forbiddenAction:
      "NO_DASHBOARD_RELIANCE, NO_STATUTORY_ACCOUNTING, NO_VOUCHER_POSTING",
    nextRoute: "Open P2-18 dashboard source reconciliation.",
    href: "/ttgdtx/accounting-dashboard",
  },
  {
    code: "FIN-IDX-02",
    surface: "P5-03 Finance Desk",
    sourceContract: "Finance Desk no-write controlled trial",
    requiredProof:
      "P5-03-TRIAL-EVID-001 through P5-03-TRIAL-EVID-005 and scoped user proof.",
    decisionGate: "P5_03_CONTROLLED_TRIAL_READY / NO_GO / BLOCKED",
    forbiddenAction:
      "NO_CREATE_UPDATE_APPROVE_PAY, NO_SOURCE_EDIT, NO_BANK_INSTRUCTION",
    nextRoute: "Open Finance Desk as read-only cockpit.",
    href: "/finance-desk",
  },
  {
    code: "FIN-IDX-03",
    surface: "Finance Day-1",
    sourceContract: "FIN-START + FIN-DAY1 start/result ledger",
    requiredProof:
      "FIN-START-EVID-001..005, FIN-DAY1-EVID-001..005 and owner result.",
    decisionGate: "FIN_START_READY / FIN_DAY1_RESULT_READY / NO_GO / BLOCKED",
    forbiddenAction:
      "NO_FINANCE_RELIANCE, NO_ACCESS_CLOSURE, NO_OWNER_GO",
    nextRoute: "Open Finance Desk / Day-1 evidence lane.",
    href: "/finance-desk",
  },
  {
    code: "FIN-IDX-04",
    surface: "ACCT local readiness",
    sourceContract: "ACCT-00 + ACCT-11 + ACCT-12 closure chain",
    requiredProof:
      "Scope baseline, negative-control proof, risk closure and owner/UAT closure ledger.",
    decisionGate: "ACCT_LOCAL_READY / NO_GO / BLOCKED",
    forbiddenAction:
      "NO_FINANCE_RELIANCE, NO_UAT_ACCEPTANCE, NO_PRODUCTION_GO",
    nextRoute: "Run accounting local readiness guard before reliance talk.",
    href: "/ttgdtx/accounting-dashboard",
  },
  {
    code: "FIN-IDX-05",
    surface: "Payment request / payout",
    sourceContract: "P2-15 + P2-16 + P2-17 record-only path",
    requiredProof:
      "Approved request id, maker/checker/approver path, duplicate guard and payout evidence ref.",
    decisionGate: "PAYMENT_REQUEST_GATE / PAYOUT_RECORD_ONLY / NO_GO",
    forbiddenAction:
      "NO_PAYMENT_EXECUTION, NO_BANK_INSTRUCTION, NO_MONEY_MOVEMENT",
    nextRoute: "Open Finance Desk and payment dossier guard.",
    href: "/finance-desk",
  },
  {
    code: "FIN-IDX-06",
    surface: "Role/scope negative proof",
    sourceContract: "P6-04 real-accounting role proof + P0-17 closure",
    requiredProof:
      "Real-accounting scoped access proof, out-of-scope denial and controlled evidence id.",
    decisionGate: "P6_04_ROLE_SCOPE_UAT_PENDING / NO_GO / BLOCKED",
    forbiddenAction:
      "NO_ACCESS_GRANT, NO_PERMISSION_EXPANSION, NO_ACCESS_CLOSURE",
    nextRoute: "Open Settings scopes before finance reliance.",
    href: "/settings/scopes",
  },
];

const financeReadonlyRelianceLockRows: ExecutiveFinanceReadonlyRelianceLock[] =
  [
    {
      code: "FIN-LOCK-01",
      surface: "P2-18 accounting dashboard",
      visibleUse:
        "BGH/KHTC xem blocker, trend, source-map state va DQ-DM-05 status.",
      requiredBeforeReliance:
        "Signed P2-18 browser UAT, source reconciliation, DQ-DM-05, report-view owner signoff and controlled evidence id.",
      forbiddenUntilSigned:
        "NO_DASHBOARD_RELIANCE, NO_DEBT_CLEARING, NO_VOUCHER_POSTING and NO_STATUTORY_ACCOUNTING.",
      ownerLane: "KHTC + BGH + IT_DATA + Audit",
      href: "/ttgdtx/accounting-dashboard",
    },
    {
      code: "FIN-LOCK-02",
      surface: "P5-03 Finance Desk",
      visibleUse:
        "Read-only cockpit de xem queue, dossier gap va no-write controlled trial state.",
      requiredBeforeReliance:
        "P5-03-TRIAL-EVID-001..005, scoped user proof, no-write browser UAT and owner reliance decision.",
      forbiddenUntilSigned:
        "NO_CREATE_UPDATE_APPROVE_PAY, NO_SOURCE_EDIT, NO_PAYMENT_EXECUTION and NO_BANK_INSTRUCTION.",
      ownerLane: "KHTC + BGH + IT_DATA + Audit",
      href: "/finance-desk",
    },
    {
      code: "FIN-LOCK-03",
      surface: "Collection / reconciliation",
      visibleUse:
        "Read-only mismatch, invoice-policy and locked-batch blocker state.",
      requiredBeforeReliance:
        "P2-10 invoice/chung-tu decision, P2-13/P2-14 locked batch, source-control proof and controlled voucher ref.",
      forbiddenUntilSigned:
        "NO_COLLECTION_RELIANCE, NO_RAW_BANK_FILE, NO_INVOICE_ISSUANCE and NO_DEBT_CLEARING.",
      ownerLane: "KHTC + PHAP_CHE + Audit",
      href: "/ttgdtx/reconciliation",
    },
    {
      code: "FIN-LOCK-04",
      surface: "Payment request / payout",
      visibleUse:
        "Read-only dossier readiness, maker/checker/approver route and duplicate-guard state.",
      requiredBeforeReliance:
        "Approved request id, BBNT/partner invoice dossier, P2-17 duplicate guard and controlled payout evidence ref.",
      forbiddenUntilSigned:
        "NO_PAYMENT_EXECUTION, NO_BANK_INSTRUCTION, NO_MONEY_MOVEMENT and NO_STATUTORY_ACCOUNTING.",
      ownerLane: "KHTC + BGH + Audit",
      href: "/finance-desk",
    },
    {
      code: "FIN-LOCK-05",
      surface: "ACCT local + Finance Day-1",
      visibleUse:
        "Read-only NO_GO/BLOCKED state for ACCT-00, ACCT-11, ACCT-12, FIN-START and FIN-DAY1.",
      requiredBeforeReliance:
        "Scope baseline closure, negative-control proof, risk closure, Finance Day-1 result ledger and owner/UAT closure ledger.",
      forbiddenUntilSigned:
        "NO_FINANCE_RELIANCE, NO_ACCESS_CLOSURE, NO_UAT_ACCEPTANCE and NO_OWNER_GO.",
      ownerLane: "KHTC + Audit + IT_DATA + BGH",
      href: "/ttgdtx/accounting-dashboard",
    },
    {
      code: "FIN-LOCK-06",
      surface: "Role/scope-bound finance visibility",
      visibleUse:
        "Only users with the right role, permission and segment/workspace scope may see finance dashboard slices.",
      requiredBeforeReliance:
        "P6-04 role/scope UAT, out-of-scope denial, P0-17 access closure decision and controlled evidence id.",
      forbiddenUntilSigned:
        "NO_CROSS_SCOPE_DASHBOARD, NO_ACCESS_GRANT, NO_PERMISSION_EXPANSION and NO_FINANCE_RELIANCE.",
      ownerLane: "IT_DATA + Audit + KHTC + BGH",
      href: "/settings/scopes",
    },
  ];

const financeRelianceDecisionRows: ExecutiveFinanceRelianceDecision[] = [
  {
    code: "FIN-REL-01",
    label: "Signed P2-18/P5-03 route",
    ownerLane: "KHTC + BGH + IT_DATA + Audit",
    requiredProof:
      "P2-18 dashboard source reconciliation, P5-03 Finance Desk no-write proof and signed browser UAT route.",
    stopRule:
      "SIGNED_UAT_PENDING, NO_DASHBOARD_RELIANCE and NO_FINANCE_RELIANCE until external evidence is signed.",
    href: "/ttgdtx/accounting-dashboard",
  },
  {
    code: "FIN-REL-02",
    label: "Finance Day-1 ledger route",
    ownerLane: "KHTC + Audit + accountable finance owner",
    requiredProof:
      "Finance Day-1 start-gate checklist, result ledger, controlled evidence ids and blocker state.",
    stopRule:
      "NO_FINANCE_RELIANCE and NO_OWNER_GO when FIN-START or FIN-DAY1 evidence is missing.",
    href: "/finance-desk",
  },
  {
    code: "FIN-REL-03",
    label: "Role/scope negative proof",
    ownerLane: "IT_DATA + Audit + KHTC",
    requiredProof:
      "P6-04 real-accounting role proof, out-of-scope denial, workspace scope and controlled evidence id.",
    stopRule:
      "NO_ACCESS_CLOSURE, NO_PERMISSION_EXPANSION and NO_UAT_ACCEPTANCE from dashboard status.",
    href: "/settings/scopes",
  },
  {
    code: "FIN-REL-04",
    label: "Owner reliance decision",
    ownerLane: "BGH + KHTC + Audit",
    requiredProof:
      "External signer, reliance decision id, date, affected report/dashboard scope and unresolved blocker list.",
    stopRule:
      "OWNER_SIGNOFF_PENDING, NO_OWNER_GO and NO_PRODUCTION_GO from PASS_LOCAL or dashboard state.",
    href: "/master-control",
  },
  {
    code: "FIN-REL-05",
    label: "Forbidden actions lock",
    ownerLane: "KHTC + Audit + IT_DATA",
    requiredProof:
      "No-write route proof for voucher posting, payment execution, bank instruction and statutory accounting.",
    stopRule:
      "NO_VOUCHER_POSTING, NO_PAYMENT_EXECUTION, NO_BANK_INSTRUCTION and NO_STATUTORY_ACCOUNTING.",
    href: "/finance-desk",
  },
];

const financeSourceContractRows: ExecutiveFinanceSourceContract[] = [
  {
    code: "FIN-SRC-01",
    metric: "Receivable / cong no",
    sourceRoute: "P2-03 + P2-05 gate",
    ownerLane: "KHTC + PHAP_CHE",
    requiredEvidence:
      "Legal/tuition gate, active contract scope, source receivable id and owner evidence ref.",
    stopRule:
      "No debt reliance if legal/tuition gate, source id or owner evidence is missing.",
  },
  {
    code: "FIN-SRC-02",
    metric: "Collection / thu hoc phi",
    sourceRoute: "P2-10 payments",
    ownerLane: "KHTC + Audit",
    requiredEvidence:
      "Posted payment status, invoice/chung-tu decision and controlled voucher reference.",
    stopRule:
      "No collection reliance from raw bank files, screenshots or unresolved invoice policy.",
  },
  {
    code: "FIN-SRC-03",
    metric: "Reconciliation / doi soat",
    sourceRoute: "P2-13 + P2-14 lock",
    ownerLane: "KHTC + IT_DATA",
    requiredEvidence:
      "Locked batch id, source-control check result, DQ state and reconciliation owner note.",
    stopRule:
      "No dashboard reliance from unlocked batch, failed source check or unresolved mismatch.",
  },
  {
    code: "FIN-SRC-04",
    metric: "Payment request / de nghi chi",
    sourceRoute: "P2-15 + P2-16",
    ownerLane: "KHTC + BGH",
    requiredEvidence:
      "Approved request id, maker/checker/approver path, BBNT and partner-invoice dossier refs.",
    stopRule:
      "No payment-request reliance if approval separation or dossier proof is incomplete.",
  },
  {
    code: "FIN-SRC-05",
    metric: "Payout evidence / chi tien",
    sourceRoute: "P2-17 record only",
    ownerLane: "KHTC + BGH + Audit",
    requiredEvidence:
      "RPC-only result, normalized voucher guard, overpay block and controlled evidence URL.",
    stopRule:
      "No bank instruction, money movement or statutory voucher from dashboard/PASS_LOCAL.",
  },
];

const uatEvidenceFastActionRows: ExecutiveUatEvidenceFastAction[] = [
  {
    code: "UAT-FAST-01",
    blocker: "P0-14 controlled evidence intake",
    ownerLane: "IT_DATA + Audit",
    firstAction:
      "Create the external evidence id, storage class and redaction reviewer record.",
    evidenceKey:
      "P0-14 evidence ref + controlled folder + redaction class.",
    stopRule:
      "NO_EVIDENCE_UPLOAD and NO_EVIDENCE_ACCEPTANCE inside dashboard, Git, Codex or chat.",
    href: "/audit",
  },
  {
    code: "UAT-FAST-02",
    blocker: "P6-04 role/workspace proof",
    ownerLane: "IT_DATA + Audit + BGH",
    firstAction:
      "Open scope controls and record in-scope plus out-of-scope negative proof.",
    evidenceKey:
      "Role matrix, workspace scope, negative-account denial and owner note.",
    stopRule:
      "NO_ACCESS_GRANT, NO_ACCESS_CLOSURE and NO_PERMISSION_EXPANSION.",
    href: "/settings/scopes",
  },
  {
    code: "UAT-FAST-03",
    blocker: "P2-18/P5-03 finance signed proof",
    ownerLane: "KHTC + BGH + Audit",
    firstAction:
      "Open Finance Desk/P2-18 route and collect signed no-write/source reconciliation refs.",
    evidenceKey:
      "P2-18 signed browser UAT, P5-03 no-write proof and Finance Day-1 result.",
    stopRule:
      "NO_FINANCE_RELIANCE, NO_PAYMENT_EXECUTION and NO_BANK_INSTRUCTION.",
    href: "/finance-desk",
  },
  {
    code: "UAT-FAST-04",
    blocker: "P0-19 legal/SOP confirmation",
    ownerLane: "PHAP_CHE + KHTC + process owner",
    firstAction:
      "Open legal gates and map legal basis, SOP, maker/checker/approver and signer.",
    evidenceKey:
      "Legal basis ref, SOP version, signer lane and controlled evidence id.",
    stopRule:
      "NO_LEGAL_CONCLUSION, NO_OFFICIAL_SOP and NO_FINANCE_RELIANCE.",
    href: "/tchc/legal-gates",
  },
  {
    code: "UAT-FAST-05",
    blocker: "P6-03/P6-06 audit and cascade closure",
    ownerLane: "Audit + IT_DATA + affected owners",
    firstAction:
      "Open audit lane and route audit-log proof plus hard-delete/cascade waiver evidence.",
    evidenceKey:
      "P6-03 audit trace proof, P6-06 conversion/waiver ref and rollback note.",
    stopRule:
      "NO_WAIVER, NO_DELETE_EXECUTION and NO_EVIDENCE_ACCEPTANCE.",
    href: "/audit",
  },
  {
    code: "UAT-FAST-06",
    blocker: "P0-09/P0-15 final owner packet",
    ownerLane: "BGH + IT_DATA + KHTC + PHAP_CHE + Audit",
    firstAction:
      "Open Master Control and assemble signed UAT closure, evidence binder and NO-GO list.",
    evidenceKey:
      "Owner decision manifest, final handoff record, signer/date and unresolved blockers.",
    stopRule:
      "NO_OWNER_GO, NO_UAT_ACCEPTANCE and NO_PRODUCTION_GO from PASS_LOCAL.",
    href: "/master-control",
  },
];

const uatEvidenceAcceptanceLockRows: ExecutiveUatEvidenceAcceptanceLock[] = [
  {
    code: "UAT-LOCK-01",
    evidenceLane: "P0-14 controlled evidence intake",
    visibleUse: "Show route state, owner lane and missing evidence class only.",
    requiredBeforeAcceptance:
      "External evidence id, controlled folder, storage class, redaction reviewer and evidence owner note.",
    forbiddenUntilSigned:
      "NO_EVIDENCE_UPLOAD, NO_RAW_EVIDENCE_MOVEMENT and NO_EVIDENCE_ACCEPTANCE.",
    ownerLane: "IT_DATA + Audit",
    href: "/audit",
  },
  {
    code: "UAT-LOCK-02",
    evidenceLane: "P6-04 role/scope UAT proof",
    visibleUse: "Show in-scope/out-of-scope proof route and negative access blocker.",
    requiredBeforeAcceptance:
      "Signed role/scope UAT, negative-account denial proof, P0-17 retain/revoke/block decision and controlled evidence id.",
    forbiddenUntilSigned:
      "NO_ACCESS_CLOSURE, NO_ACCESS_GRANT and NO_PERMISSION_EXPANSION.",
    ownerLane: "IT_DATA + Audit + BGH",
    href: "/settings/scopes",
  },
  {
    code: "UAT-LOCK-03",
    evidenceLane: "P2-18/P5-03 finance UAT",
    visibleUse:
      "Show finance UAT route, source-map dependency and reliance blocker only.",
    requiredBeforeAcceptance:
      "Signed browser UAT, P5-03 no-write proof, DQ/source reconciliation, Finance Day-1 result and owner reliance decision.",
    forbiddenUntilSigned:
      "NO_FINANCE_RELIANCE, NO_DASHBOARD_RELIANCE and NO_PAYMENT_EXECUTION.",
    ownerLane: "KHTC + BGH + Audit",
    href: "/finance-desk",
  },
  {
    code: "UAT-LOCK-04",
    evidenceLane: "P0-19 legal/SOP confirmation",
    visibleUse:
      "Show legal basis/SOP queue and required signer lane before workflow reliance.",
    requiredBeforeAcceptance:
      "PHAP_CHE legal-basis review, SOP owner signoff, maker/checker/approver map, signer and controlled evidence ref.",
    forbiddenUntilSigned:
      "NO_LEGAL_CONCLUSION, NO_OFFICIAL_SOP and NO_WORKFLOW_RELIANCE.",
    ownerLane: "PHAP_CHE + process owner + Audit",
    href: "/tchc/legal-gates",
  },
  {
    code: "UAT-LOCK-05",
    evidenceLane: "P6-03/P6-06 audit and cascade closure",
    visibleUse: "Show audit trace, hard-delete/cascade blocker and waiver route.",
    requiredBeforeAcceptance:
      "Audit-log proof, hard-delete/cascade conversion decision or waiver, redaction proof and rollback note.",
    forbiddenUntilSigned:
      "NO_AUDIT_CLOSURE, NO_WAIVER_RELIANCE and NO_HIDDEN_EVIDENCE_MOVEMENT.",
    ownerLane: "Audit + IT_DATA + affected owners",
    href: "/audit",
  },
  {
    code: "UAT-LOCK-06",
    evidenceLane: "P0-09/P0-15 final owner packet",
    visibleUse: "Show final packet checklist and unresolved NO-GO blockers.",
    requiredBeforeAcceptance:
      "Signed UAT closure, evidence binder, owner GO/NO-GO decision, signer/date and unresolved blocker list outside Git/Codex/chat.",
    forbiddenUntilSigned:
      "NO_OWNER_GO, NO_UAT_ACCEPTANCE and NO_PRODUCTION_GO.",
    ownerLane: "BGH + IT_DATA + KHTC + PHAP_CHE + Audit",
    href: "/master-control",
  },
];

const uatEvidenceClosureRows: ExecutiveUatEvidenceClosure[] = [
  {
    code: "UAT-CLOSE-01",
    label: "Controlled evidence location",
    ownerLane: "IT_DATA + Audit",
    requiredProof:
      "P0-14 evidence id, controlled external folder, redaction class and reviewer.",
    stopRule:
      "CONTROLLED_EVIDENCE_REQUIRED; no raw PII, bank, voucher, password or signed evidence in Git/Codex/chat.",
    href: "/audit",
  },
  {
    code: "UAT-CLOSE-02",
    label: "Signed UAT route state",
    ownerLane: "BGH + route owner + Audit",
    requiredProof:
      "UAT route id, PASS/FAIL/BLOCKED result, signer, date and blocker reason.",
    stopRule:
      "SIGNED_UAT_PENDING; no UAT acceptance or route closure from PASS_LOCAL.",
    href: "/master-control",
  },
  {
    code: "UAT-CLOSE-03",
    label: "Role/access closure dependency",
    ownerLane: "IT_DATA + Audit + BGH",
    requiredProof:
      "P6-04 negative proof, P0-17 access retain/revoke/block decision and scope evidence id.",
    stopRule:
      "NO_ACCESS_CLOSURE, NO_ACCESS_GRANT and NO_PERMISSION_EXPANSION from dashboard state.",
    href: "/settings/scopes",
  },
  {
    code: "UAT-CLOSE-04",
    label: "Finance/legal reliance dependency",
    ownerLane: "KHTC + PHAP_CHE + BGH + Audit",
    requiredProof:
      "P2-18/P5-03, Finance Day-1, P0-19 legal/finance gate and reliance decision refs.",
    stopRule:
      "NO_FINANCE_RELIANCE, NO_LEGAL_CONCLUSION and NO_OWNER_GO until external signoff.",
    href: "/finance-desk",
  },
  {
    code: "UAT-CLOSE-05",
    label: "Final owner decision pack",
    ownerLane: "BGH + IT_DATA + KHTC + PHAP_CHE + Audit",
    requiredProof:
      "P0-09/P0-15 owner decision pack with signed UAT closure, evidence binder and unresolved NO-GO list.",
    stopRule:
      "NO_OWNER_GO and NO_PRODUCTION_GO while any route evidence, owner or blocker remains pending.",
    href: "/master-control",
  },
];

const productionBlockerTriageRows: ExecutiveProductionBlockerTriage[] = [
  {
    code: "BLK-CLOSE-01",
    label: "Backup/restore proof",
    ownerLane: "IT_DATA + Audit",
    requiredProof:
      "Real backup id, isolated restore target, smoke-check result and controlled evidence ref.",
    stopRule:
      "NO_PRODUCTION_GO while restore proof is missing or unsigned.",
    href: "/settings/supabase-check",
  },
  {
    code: "BLK-CLOSE-02",
    label: "Migration order signoff",
    ownerLane: "IT_DATA + BGH + KHTC + PHAP_CHE",
    requiredProof:
      "Signed Step90-Step110 migration order, rollback point and blocker state.",
    stopRule:
      "NO_MIGRATION_APPROVAL and NO_OWNER_GO from dashboard or PASS_LOCAL.",
    href: "/settings/supabase-check",
  },
  {
    code: "BLK-CLOSE-03",
    label: "Signed UAT route closure",
    ownerLane: "BGH + process owners + Audit",
    requiredProof:
      "P0-14/P6-04/P2-18/P5-03 route evidence, signer, date and unresolved blocker list.",
    stopRule:
      "SIGNED_UAT_PENDING and NO_UAT_ACCEPTANCE until external evidence is signed.",
    href: "/master-control",
  },
  {
    code: "BLK-CLOSE-04",
    label: "Finance/legal reliance closure",
    ownerLane: "KHTC + PHAP_CHE + BGH + Audit",
    requiredProof:
      "P0-19 legal/finance gate, P2-18/P5-03 reliance, Finance Day-1 and controlled evidence refs.",
    stopRule:
      "NO_FINANCE_RELIANCE, NO_LEGAL_CONCLUSION and NO_PAYMENT_EXECUTION.",
    href: "/finance-desk",
  },
  {
    code: "BLK-CLOSE-05",
    label: "Final owner GO/NO-GO packet",
    ownerLane: "BGH + IT_DATA + KHTC + PHAP_CHE + Audit + process owners",
    requiredProof:
      "P0-09/P0-15 owner decision, quorum, signer, date and controlled evidence binder.",
    stopRule:
      "NO_OWNER_GO and NO_PRODUCTION_GO while any owner, evidence or blocker remains pending.",
    href: "/master-control",
  },
];

const uatEvidenceRouteRows: ExecutiveUatEvidenceRoute[] = [
  {
    code: "UAT-EVID-01",
    route: "P0-14 controlled evidence intake",
    ownerLane: "IT_DATA + Audit",
    requiredEvidence:
      "Controlled folder, evidence id convention, redaction class and reviewer.",
    state: "P0_14_EVIDENCE_INTAKE_PENDING / NO_GO / BLOCKED",
    stopRule:
      "No raw screenshots, bank data, vouchers, passwords or evidence acceptance in Git/Codex/chat.",
    href: "/audit",
  },
  {
    code: "UAT-EVID-02",
    route: "P6-04 role/workspace UAT",
    ownerLane: "IT_DATA + Audit + BGH",
    requiredEvidence:
      "Route matrix, out-of-scope negative proof, workspace scope result and signed owner note.",
    state: "P6_04_ROLE_SCOPE_UAT_PENDING / NO_GO / BLOCKED",
    stopRule:
      "No access closure, role expansion or real-user reliance from PASS_LOCAL.",
    href: "/settings/scopes",
  },
  {
    code: "UAT-EVID-03",
    route: "P2-18 accounting dashboard UAT",
    ownerLane: "KHTC + BGH + Audit",
    requiredEvidence:
      "Signed browser UAT, source-total reconciliation, redacted screenshot ref and owner decision.",
    state: "P2_18_SIGNED_UAT_PENDING / NO_GO / BLOCKED",
    stopRule:
      "No dashboard reliance, statutory accounting or finance conclusion before signed evidence.",
    href: "/ttgdtx/accounting-dashboard",
  },
  {
    code: "UAT-EVID-04",
    route: "P5-03 Finance Desk UAT",
    ownerLane: "KHTC + IT_DATA + Audit",
    requiredEvidence:
      "No-write proof, scoped access proof, source trace and controlled trial evidence ids.",
    state: "P5_03_SIGNED_UAT_PENDING / NO_GO / BLOCKED",
    stopRule:
      "No finance reliance, voucher posting, payment execution or bank instruction.",
    href: "/finance-desk",
  },
  {
    code: "UAT-EVID-05",
    route: "P0-09/P0-15 owner decision pack",
    ownerLane: "BGH + accountable owners + Audit",
    requiredEvidence:
      "Final owner decision manifest, access closure ref, evidence binder and external signatures.",
    state: "OWNER_DECISION_PENDING / NO_GO / BLOCKED",
    stopRule:
      "No owner GO/NO-GO, migration approval or production GO from dashboard/PASS_LOCAL.",
    href: "/master-control",
  },
];

const executiveRoleScopeDecisionRows: ExecutiveRoleScopeDecision[] = [
  {
    code: "EXEC-ROLE-01",
    label: "Current role lane normalized",
    ownerLane: "IT_DATA + Audit",
    requiredProof:
      "Auth profile role code maps to HEU_ROLE_LANE_MATRIX and current_user_role_code.",
    stopRule:
      "NO_ACCESS_GRANT and NO_PERMISSION_EXPANSION until signed role/scope UAT.",
    href: "/settings/scopes",
  },
  {
    code: "EXEC-ROLE-02",
    label: "Executive read-only dashboard scope",
    ownerLane: "BGH + IT_DATA",
    requiredProof:
      "HIEU_TRUONG, PHO_HIEU_TRUONG and BGH may inspect executive dashboard, reports and blockers only.",
    stopRule:
      "NO_DAILY_DATA_ENTRY, NO_FINANCE_EXECUTION and NO_HIDDEN_SOURCE_EDIT.",
    href: "/",
  },
  {
    code: "EXEC-ROLE-03",
    label: "Professional lane separation",
    ownerLane: "KHTC + PHAP_CHE + Audit",
    requiredProof:
      "Finance, legal/SOP and audit lanes remain separate before any reliance discussion.",
    stopRule:
      "NO_LEGAL_CONCLUSION, NO_FINANCE_APPROVAL and NO_UAT_ACCEPTANCE_ALONE.",
    href: "/master-control",
  },
  {
    code: "EXEC-ROLE-04",
    label: "Negative access proof pending",
    ownerLane: "IT_DATA + Audit + BGH",
    requiredProof:
      "P6-04 signed role/workspace UAT with out-of-scope denial and controlled evidence id.",
    stopRule:
      "NO_PRODUCTION_ACCESS, NO_OWNER_GO and NO_PRODUCTION_GO from PASS_LOCAL.",
    href: "/settings/scopes",
  },
];

const dashboardScopeVisibilityRows: ExecutiveDashboardScopeVisibility[] = [
  {
    code: "SCOPE-VIS-01",
    actorLane: "HIEU_TRUONG / BGH / PHO_HIEU_TRUONG",
    dashboardScope:
      "Toan canh dieu hanh read-only khi isExecutiveRole cho phep canSeeAllSegments.",
    enforcedBy:
      "getAdmissionWorkspaceContext -> canSeeAllSegments -> admissionWorkspaceSegmentIds returns all only for executive role.",
    blockedRule:
      "NO_STATE_MUTATION, NO_FINANCE_ACTION, NO_LEGAL_CONCLUSION, NO_UAT_ACCEPTANCE.",
    href: "/",
  },
  {
    code: "SCOPE-VIS-02",
    actorLane: "Phong ban / user thuong",
    dashboardScope:
      "Chi xem dashboard theo visibleSegmentIds hoac activeSegmentId trong workspace duoc gan.",
    enforcedBy:
      "admissionWorkspaceSegmentIds returns visibleSegmentIds, or NO_MATCH_SEGMENT_ID when no scope exists.",
    blockedRule:
      "NO_CROSS_SCOPE_DASHBOARD, NO_ACCESS_GRANT and NO_PERMISSION_EXPANSION.",
    href: "/settings/scopes",
  },
  {
    code: "SCOPE-VIS-03",
    actorLane: "KHTC / finance lane",
    dashboardScope:
      "Chi xem finance/advisory views trong scope duoc phe duyet; khong bien dashboard thanh so lieu that.",
    enforcedBy:
      "Finance focus stays read-only and requires signed P2-18/P5-03 plus source map before reliance.",
    blockedRule:
      "NO_PAYMENT_EXECUTION, NO_BANK_INSTRUCTION, NO_STATUTORY_ACCOUNTING.",
    href: "/finance-desk",
  },
  {
    code: "SCOPE-VIS-04",
    actorLane: "PHAP_CHE / SOP lane",
    dashboardScope:
      "Chi xem legal/SOP queue va required-answer index; khong ket luan phap ly tu dashboard.",
    enforcedBy:
      "Legal focus requires legal basis, SOP version, maker/checker/approver, evidence and signer.",
    blockedRule:
      "NO_LEGAL_CONCLUSION, NO_OFFICIAL_SOP and NO_APPROVAL_ACTION.",
    href: "/tchc/legal-gates",
  },
  {
    code: "SCOPE-VIS-05",
    actorLane: "IT_DATA / Audit",
    dashboardScope:
      "Chi xem scope, evidence, audit, backup/restore va negative-proof lanes theo trach nhiem.",
    enforcedBy:
      "P6-04, P6-03, P0-14 and audit/cascade queues stay controlled-evidence only.",
    blockedRule:
      "NO_EVIDENCE_ACCEPTANCE, NO_HIDDEN_EVIDENCE_MOVEMENT, NO_OWNER_GO.",
    href: "/audit",
  },
];

const executiveDashboardPermissionMatrixRows: ExecutiveDashboardPermissionMatrix[] =
  [
    {
      code: "EXEC-PERM-01",
      roleLane: "HIEU_TRUONG / BGH / PHO_HIEU_TRUONG",
      routeSurface: "Executive dashboard overview",
      requiredPermission: "isExecutiveRole + canSeeAllSegments",
      runtimeSignal: "readOnlyDashboard",
      stopRule:
        "READ_ONLY_ADVISORY; no daily data entry, finance action, legal conclusion, UAT acceptance or owner GO.",
      href: "/",
    },
    {
      code: "EXEC-PERM-02",
      roleLane: "BGH / IT_DATA",
      routeSurface: "Master Control",
      requiredPermission: "master_control.read",
      runtimeSignal: "canOpenMasterControl",
      stopRule:
        "Route visibility only; no workflow approval, migration approval, UAT acceptance or production GO.",
      href: "/master-control",
    },
    {
      code: "EXEC-PERM-03",
      roleLane: "KHTC / BGH",
      routeSurface: "Finance Desk",
      requiredPermission: "finance_desk.read",
      runtimeSignal: "canOpenFinanceDesk",
      stopRule:
        "Read-only reliance preparation; no voucher posting, payment execution, bank instruction or statutory accounting.",
      href: "/finance-desk",
    },
    {
      code: "EXEC-PERM-04",
      roleLane: "IT_DATA / Audit / BGH",
      routeSurface: "Scope and permission control",
      requiredPermission:
        "scope.manage_department OR users.create OR permission_matrix.read/manage",
      runtimeSignal: "canOpenScopeControl",
      stopRule:
        "Inspect role/scope controls only; no access grant, account create, role assignment or permission expansion from dashboard.",
      href: "/settings/scopes",
    },
    {
      code: "EXEC-PERM-05",
      roleLane: "Report owner / IT_DATA / Audit",
      routeSurface: "Report source map",
      requiredPermission: "registered report view + scoped route",
      runtimeSignal: "readOnlyDashboard",
      stopRule:
        "Open source map only; no raw source open, dashboard reliance, evidence acceptance or owner signoff inference.",
      href: "/reports",
    },
    {
      code: "EXEC-PERM-06",
      roleLane: "PHAP_CHE / process owner",
      routeSurface: "Legal/SOP queue",
      requiredPermission: "legal/SOP route ownership + evidence class",
      runtimeSignal: "readOnlyDashboard",
      stopRule:
        "Advisory queue only; no legal conclusion, official SOP issuance, finance approval or UAT acceptance.",
      href: "/tchc/legal-gates",
    },
    {
      code: "EXEC-PERM-07",
      roleLane: "Audit / IT_DATA",
      routeSurface: "Audit and evidence route",
      requiredPermission: "audit/evidence lane responsibility",
      runtimeSignal: "readOnlyDashboard",
      stopRule:
        "Trace and redaction route only; no evidence acceptance, hidden evidence movement, access closure or owner GO.",
      href: "/audit",
    },
  ];

const moduleMaturityRows: ExecutiveModuleMaturity[] = [
  {
    code: "M01",
    label: "Legal / Phap che",
    status: "CAN_SUA",
    ownerAction: "PHAP_CHE legal basis, SOP authority and evidence-class signoff.",
    href: "/tchc/legal-gates",
  },
  {
    code: "M02",
    label: "HR / User / Scope",
    status: "CAN_SUA",
    ownerAction: "Signed P6-04 role/workspace UAT and negative-account proof.",
    href: "/settings/scopes",
  },
  {
    code: "M03",
    label: "Data Master",
    status: "CAN_SUA",
    ownerAction: "Owner-approved master definitions and source registry before reliance.",
    href: "/reports",
  },
  {
    code: "M04",
    label: "SOP / Workflow",
    status: "CAN_SUA",
    ownerAction: "Maker/checker/approver gate and official SOP owner signoff.",
    href: "/master-control",
  },
  {
    code: "M05",
    label: "Tuyen sinh CRM",
    status: "STRONG_INTERNAL",
    ownerAction: "Keep P3 handover UAT, finance/legal gate and evidence closure visible.",
    href: "/leads",
  },
  {
    code: "M06",
    label: "CTHSSV",
    status: "CAN_SUA",
    ownerAction: "Signed CTHSSV owner UAT, evidence trace and handover reliance decision.",
    href: "/cthssv",
  },
  {
    code: "M07",
    label: "Dao tao / Short Course",
    status: "CAN_SUA",
    ownerAction: "Attendance/payment UAT, BHXH policy and source reconciliation signoff.",
    href: "/short-course",
  },
  {
    code: "M08",
    label: "Khoa / Giang vien",
    status: "PASS_LOCAL_PACKAGED",
    ownerAction: "Privacy, negative access, source reconciliation and owner signoff.",
    href: "/khoa",
  },
  {
    code: "M09",
    label: "Tai chinh / Cong no",
    status: "READ_ONLY_UAT_GATED",
    ownerAction: "Close ACCT negative proof, finance/legal UAT and reliance decision.",
    href: "/finance-desk",
  },
  {
    code: "M10",
    label: "Dashboard / Reports",
    status: "CAN_SUA",
    ownerAction: "Report-view owner signoff, DQ-DM-05 and controlled evidence refs.",
    href: "/reports",
  },
  {
    code: "M11",
    label: "AI Advisory",
    status: "ADVISORY_ONLY",
    ownerAction: "Signed AI scope registry and prompt/output audit plan before activation.",
    href: "/ai-assistant",
  },
  {
    code: "M12",
    label: "Audit / Risk",
    status: "STRONG_INTERNAL",
    ownerAction: "Signed audit UAT, cascade conversion/waiver and owner closure.",
    href: "/audit",
  },
];

const legalSopActionRows: ExecutiveLegalSopAction[] = [
  {
    code: "LEGAL-STD-01",
    module: "M01 Legal / M07-M09 finance chain",
    owner: "PHAP_CHE + process owner",
    state: "PHAP_CHE_REVIEW_PENDING / NO_GO / BLOCKED",
    action:
      "Confirm legal article, contract clause or approved rule for each program, partner and payment case.",
    blocker: "Draft source is not final legal approval or binding advice.",
    href: "/tchc/legal-gates",
  },
  {
    code: "LEGAL-STD-02",
    module: "M04 SOP / M05-M08 workflows",
    owner: "PHAP_CHE + process owner + IT_DATA",
    state: "SOP_OWNER_SIGNOFF_PENDING / NO_GO / BLOCKED",
    action:
      "Confirm SOP title, version, owner department, effective scope and dependency.",
    blocker: "Dashboard cannot issue official SOP or replace version log.",
    href: "/master-control",
  },
  {
    code: "LEGAL-STD-03",
    module: "M09 invoice / chung-tu",
    owner: "KHTC + PHAP_CHE + Audit",
    state: "INVOICE_POLICY_DECISION_PENDING / NO_GO / BLOCKED",
    action:
      "Confirm invoice/chung-tu rule by collection model, payer type and payment scenario.",
    blocker: "No invoice issuance, finance posting or statutory conclusion.",
    href: "/finance-desk",
  },
  {
    code: "LEGAL-STD-04",
    module: "M12 evidence class",
    owner: "Audit + IT_DATA + process owner",
    state: "EVIDENCE_CLASS_REVIEW_PENDING / NO_GO / BLOCKED",
    action:
      "Classify evidence as public control, controlled redacted, controlled sensitive or forbidden.",
    blocker: "No raw PII, bank, voucher, password or reset-link data in Git/Codex/chat.",
    href: "/audit",
  },
  {
    code: "LEGAL-STD-05",
    module: "M02 role / sensitive metadata",
    owner: "IT_DATA + PHAP_CHE + Audit",
    state: "ROLE_SCOPE_UAT_PENDING / NO_GO / BLOCKED",
    action:
      "Confirm who may see legal, finance, student, teacher and evidence metadata.",
    blocker: "No access grant, account creation or role expansion from this dashboard.",
    href: "/settings/scopes",
  },
  {
    code: "LEGAL-STD-06",
    module: "M00 owner authority",
    owner: "BGH + accountable owners + Audit",
    state: "OWNER_DECISION_EXTERNAL_PENDING / NO_GO / BLOCKED",
    action:
      "Confirm who may sign waiver, exception and final owner GO/NO-GO outside Codex/chat.",
    blocker: "PASS_LOCAL cannot infer owner approval, waiver or production GO.",
    href: "/master-control",
  },
];

const legalSopAuthorityChecks: ExecutiveLegalSopAuthorityCheck[] = [
  {
    code: "AUTH-LEGAL-BASIS",
    question: "Can cu phap ly nao?",
    ownerLane: "PHAP_CHE + process owner",
    requiredProof: "Legal article, contract clause, policy or approved rule.",
    stopRule: "No legal conclusion or legal-basis approval from dashboard.",
  },
  {
    code: "AUTH-SOP-VERSION",
    question: "SOP nao dang ap dung?",
    ownerLane: "PHAP_CHE + owner department + IT_DATA",
    requiredProof: "SOP title, version, owner, effective scope and dependency.",
    stopRule: "No official SOP issuance or version-log replacement.",
  },
  {
    code: "AUTH-MAKER",
    question: "Ai nhap / tao du lieu?",
    ownerLane: "Process owner + IT_DATA",
    requiredProof: "Maker role, route, input source and scope boundary.",
    stopRule: "No account creation, data entry approval or scope expansion.",
  },
  {
    code: "AUTH-CHECKER",
    question: "Ai kiem tra?",
    ownerLane: "Checker lane + Audit",
    requiredProof: "Checker role, checklist, negative-control and audit trace.",
    stopRule: "No PASS_LOCAL result may replace signed checker evidence.",
  },
  {
    code: "AUTH-APPROVER",
    question: "Ai duyet?",
    ownerLane: "Approver lane + BGH when required",
    requiredProof: "Approver role, threshold, exception path and signoff route.",
    stopRule: "No approval action, owner GO or waiver inside dashboard.",
  },
  {
    code: "AUTH-EVIDENCE",
    question: "Chung tu nam o dau?",
    ownerLane: "Audit + IT_DATA + process owner",
    requiredProof: "Controlled evidence ref, redaction class and retention route.",
    stopRule: "No raw PII, bank, voucher, password or reset-link in Git/Codex/chat.",
  },
  {
    code: "AUTH-SIGNER",
    question: "Ai ky / chot ben ngoai he thong?",
    ownerLane: "BGH + accountable owner + Audit",
    requiredProof: "External signer, date, evidence ref and owner decision path.",
    stopRule: "No inferred approval from PASS_LOCAL, AI output or dashboard status.",
  },
];

const executiveLegalSopRequiredAnswerIndexRows: ExecutiveLegalSopRequiredAnswerIndex[] =
  [
    {
      code: "LAW-IDX-01",
      workflow: "F01 Lead to student",
      legalBasis: "P0-19 legal/tuition gate and program/partner basis.",
      sopRoute: "Admissions handover SOP, document intake and CTHSSV route.",
      makerCheckerApprover:
        "Maker: Tuyen sinh. Checker: CTHSSV/Dao tao. Approver: BGH or owner lane when threshold applies.",
      evidenceSigner:
        "P3 signed UAT, P0-19 evidence ref and external owner signer.",
      stopRule:
        "NO_HANDOVER_RELIANCE if legal gate, SOP version, evidence or signer is missing.",
      href: "/leads",
    },
    {
      code: "LAW-IDX-02",
      workflow: "F02 TTGDTX tuition",
      legalBasis: "Contract, tuition policy and collection/invoice legal basis.",
      sopRoute: "Receivable, collection, invoice/chung-tu and reconciliation SOP.",
      makerCheckerApprover:
        "Maker: source owner/KHTC. Checker: KHTC + PHAP_CHE + Audit. Approver: BGH when reliance is requested.",
      evidenceSigner:
        "P2-10, P2-13/P2-14, DQ-DM-05 and signed finance/legal UAT ref.",
      stopRule:
        "NO_FINANCE_RELIANCE if policy, source id, DQ or external signoff is missing.",
      href: "/ttgdtx/accounting-dashboard",
    },
    {
      code: "LAW-IDX-03",
      workflow: "F03 Payment and payout",
      legalBasis: "Contract clause, BBNT, payment term and approved request basis.",
      sopRoute: "Payment request, approval separation and payout evidence SOP.",
      makerCheckerApprover:
        "Maker: KHTC. Checker: PHAP_CHE/Audit. Approver: BGH or delegated threshold owner.",
      evidenceSigner:
        "Payment dossier, duplicate guard, voucher metadata and external signer.",
      stopRule:
        "NO_PAYMENT_EXECUTION, NO_BANK_INSTRUCTION and NO_STATUTORY_ACCOUNTING from dashboard.",
      href: "/finance-desk",
    },
    {
      code: "LAW-IDX-04",
      workflow: "F06 Short Course",
      legalBasis: "Course policy, attendance rule, BHXH/support policy and fee basis.",
      sopRoute: "Class enrollment, attendance lock, policy review and payment route SOP.",
      makerCheckerApprover:
        "Maker: Dao tao/Short course owner. Checker: KHTC + Audit. Approver: accountable owner.",
      evidenceSigner:
        "Attendance/payment UAT, policy decision and controlled evidence id.",
      stopRule:
        "NO_ATTENDANCE_PAYMENT_RELIANCE until policy, UAT and owner signoff exist.",
      href: "/short-course",
    },
    {
      code: "LAW-IDX-05",
      workflow: "M02 Role and sensitive access",
      legalBasis: "Data-sharing basis, privacy class and role/scope authority.",
      sopRoute: "User activation, role/workspace scope and negative-access SOP.",
      makerCheckerApprover:
        "Maker: IT_DATA. Checker: Audit + PHAP_CHE when sensitive data applies. Approver: BGH/owner lane.",
      evidenceSigner:
        "P6-04 negative proof, P0-17 closure decision and controlled evidence ref.",
      stopRule:
        "NO_ACCESS_GRANT, NO_PERMISSION_EXPANSION and NO_OWNER_GO from dashboard state.",
      href: "/settings/scopes",
    },
    {
      code: "LAW-IDX-06",
      workflow: "M10 Dashboard/report reliance",
      legalBasis: "Report-view reliance decision and allowed dashboard use case.",
      sopRoute: "Report source-map, DQ check, evidence route and owner signoff SOP.",
      makerCheckerApprover:
        "Maker: report owner/IT_DATA. Checker: Audit + data owner. Approver: BGH only after external signoff.",
      evidenceSigner:
        "DQ-DM-05, report-view owner signoff, P2-18/P5-03 where finance data is involved.",
      stopRule:
        "NO_DASHBOARD_RELIANCE, NO_RAW_SOURCE_OPEN and NO_LEGAL_CONCLUSION.",
      href: "/reports",
    },
  ];

const executiveLegalSopEvidenceAuthorityQueueRows: ExecutiveLegalSopEvidenceAuthorityQueue[] =
  [
    {
      code: "LAW-QUEUE-01",
      queue: "Legal basis hold",
      ownerLane: "PHAP_CHE + process owner",
      missingAnswer:
        "Legal article, contract clause, tuition/policy rule or approved waiver basis.",
      evidenceAuthority:
        "Legal Article Master ref, P0-19/contract/policy proof and external PHAP_CHE signer.",
      nextControl:
        "Route to legal gates and keep the workflow BLOCKED until a controlled ref exists.",
      stopRule:
        "NO_LEGAL_ADVICE, NO_LEGAL_CONCLUSION and PHAP_CHE_REVIEW_REQUIRED.",
      href: "/tchc/legal-gates",
    },
    {
      code: "LAW-QUEUE-02",
      queue: "SOP version hold",
      ownerLane: "PHAP_CHE + owner department + IT_DATA",
      missingAnswer:
        "SOP title, version, owner department, effective scope and dependency.",
      evidenceAuthority:
        "SOP Register row, Version Log entry and signed SOP owner route.",
      nextControl:
        "Route to Master Control and keep the item CAN_SUA until owner signoff is recorded outside dashboard.",
      stopRule:
        "NO_OFFICIAL_SOP, SOP_OWNER_SIGNOFF_REQUIRED and NO_APPROVAL_ACTION.",
      href: "/master-control",
    },
    {
      code: "LAW-QUEUE-03",
      queue: "Maker/checker/approver hold",
      ownerLane: "Process owner + Audit + BGH when threshold applies",
      missingAnswer:
        "Maker, checker, approver, threshold, exception path and delegated authority.",
      evidenceAuthority:
        "Role-lane matrix, approval threshold note, audit trace and owner decision route.",
      nextControl:
        "Route to role/scope and owner queue; keep every downstream action read-only.",
      stopRule:
        "MAKER_CHECKER_APPROVER_REQUIRED, NO_APPROVAL_ACTION and NO_FINANCE_ACTION.",
      href: "/settings/scopes",
    },
    {
      code: "LAW-QUEUE-04",
      queue: "Controlled evidence hold",
      ownerLane: "Audit + IT_DATA + process owner",
      missingAnswer:
        "Evidence location, redaction class, retention route and reviewer lane.",
      evidenceAuthority:
        "Controlled evidence id, redaction reviewer, file registry route and audit-log reference.",
      nextControl:
        "Route to Audit and evidence intake; do not move raw files into Git/Codex/chat.",
      stopRule:
        "CONTROLLED_EVIDENCE_REQUIRED, NO_RAW_EVIDENCE_MOVEMENT and NO_EVIDENCE_ACCEPTANCE.",
      href: "/audit",
    },
    {
      code: "LAW-QUEUE-05",
      queue: "External signer hold",
      ownerLane: "BGH + accountable owner + Audit",
      missingAnswer:
        "External signer, decision id, date, evidence ref and unresolved blocker state.",
      evidenceAuthority:
        "Signoff Register row, owner decision packet and controlled evidence reference.",
      nextControl:
        "Route to final owner packet; keep PASS_LOCAL separate from owner GO/NO-GO.",
      stopRule:
        "EXTERNAL_SIGNOFF_REQUIRED, OWNER_SIGNOFF_PENDING and NO_OWNER_GO.",
      href: "/master-control",
    },
    {
      code: "LAW-QUEUE-06",
      queue: "Dashboard/report reliance legal hold",
      ownerLane: "BGH + IT_DATA + PHAP_CHE + Audit",
      missingAnswer:
        "Allowed dashboard use case, report-view source contract, DQ-DM-05 and owner reliance path.",
      evidenceAuthority:
        "Report View Register, source map, DQ result, signer lane and legal/SOP dependency.",
      nextControl:
        "Route to Reports before trusting dashboard numbers; keep raw sources closed.",
      stopRule:
        "NO_DASHBOARD_RELIANCE, NO_REPORT_VIEW_RELIANCE and NO_LEGAL_CONCLUSION.",
      href: "/reports",
    },
  ];

const executiveLegalSopTriageRows: ExecutiveLegalSopTriage[] = [
  {
    code: "LEGAL-TRIAGE-01",
    label: "Legal basis route",
    ownerLane: "PHAP_CHE + process owner",
    requiredProof:
      "Legal article, contract clause, policy or approved rule mapped to the workflow.",
    stopRule:
      "NO_LEGAL_ADVICE and PHAP_CHE_REVIEW_REQUIRED before any legal-basis reliance.",
    href: "/tchc/legal-gates",
  },
  {
    code: "LEGAL-TRIAGE-02",
    label: "SOP version route",
    ownerLane: "PHAP_CHE + owner department + IT_DATA",
    requiredProof:
      "SOP title, version, owner department, effective scope and dependency.",
    stopRule:
      "NO_OFFICIAL_SOP and SOP_OWNER_SIGNOFF_REQUIRED before operational reliance.",
    href: "/master-control",
  },
  {
    code: "LEGAL-TRIAGE-03",
    label: "Maker/checker/approver route",
    ownerLane: "Process owner + Audit + BGH when required",
    requiredProof:
      "Maker, checker, approver, threshold, exception path and signed decision route.",
    stopRule:
      "NO_APPROVAL_ACTION, NO_FINANCE_ACTION and MAKER_CHECKER_APPROVER_REQUIRED.",
    href: "/master-control",
  },
  {
    code: "LEGAL-TRIAGE-04",
    label: "Controlled evidence route",
    ownerLane: "Audit + IT_DATA",
    requiredProof:
      "Controlled evidence id, redaction class, retention route and reviewer lane.",
    stopRule:
      "CONTROLLED_EVIDENCE_REQUIRED; no raw PII, bank, voucher or password data in Git/Codex/chat.",
    href: "/audit",
  },
  {
    code: "LEGAL-TRIAGE-05",
    label: "External signer route",
    ownerLane: "BGH + accountable owner + Audit",
    requiredProof:
      "Signer, date, evidence ref, owner decision path and unresolved blocker state.",
    stopRule:
      "EXTERNAL_SIGNOFF_REQUIRED, NO_OWNER_GO and NO_PRODUCTION_GO from dashboard state.",
    href: "/master-control",
  },
];

const reportRelianceRows: ExecutiveReportReliance[] = [
  {
    reportView: "RV_TTGDTX_FINANCE_SUMMARY",
    label: "Tai chinh TTGDTX",
    owner: "KHTC + BGH + IT_DATA + Audit",
    decisionState: "OWNER_SIGNOFF_PENDING / NO_GO / BLOCKED",
    dqGate: "DQ-RV-01, DQ-RV-02, DQ-DM-05",
    blocker: "Can P2-18, P5-03, Finance Day-1 evidence va owner signoff.",
    href: "/reports",
  },
  {
    reportView: "RV_HOU_LEDGER_SUMMARY",
    label: "HOU ledger",
    owner: "HOU owner + KHTC + IT_DATA + Audit",
    decisionState: "HOU_LEDGER_READY / NO_GO / BLOCKED",
    dqGate: "DQ-RV-05, DQ-DM-05",
    blocker: "Chua du HOU handover, tuition ledger va commission signoff.",
    href: "/hou",
  },
  {
    reportView: "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    label: "Khoa ngan han",
    owner: "DAO_TAO + KHTC + IT_DATA + Audit",
    decisionState:
      "SC_REPORT_VIEW_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED",
    dqGate: "DQ-RV-06, DQ-DM-05",
    blocker: "Chua ky attendance lock, payment UAT va report-view signoff.",
    href: "/short-course",
  },
  {
    reportView: "RV_AUDIT_RISK_CONTROL",
    label: "Audit / risk",
    owner: "Audit + IT_DATA + affected owners",
    decisionState: "AUDIT_AI_SCOPE_READY / NO_GO / BLOCKED",
    dqGate: "DQ-RV-07, DQ-DM-05",
    blocker: "Chua co owner decision cho waiver, closure hoac audit trace.",
    href: "/audit",
  },
];

const executiveReportSourceMapTriageRows: ExecutiveReportSourceMapTriage[] = [
  {
    code: "RPT-SRC-01",
    label: "Report-view contract",
    ownerLane: "Report owner + IT_DATA",
    requiredProof:
      "REPORT_VIEW_MASTER_CONTRACT, named report-view row, source map and refresh rule.",
    stopRule:
      "NO_DASHBOARD_RELIANCE until contract, DQ state and owner route are recorded.",
    href: "/reports",
  },
  {
    code: "RPT-SRC-02",
    label: "DQ-DM-05 dashboard lock",
    ownerLane: "IT_DATA + Audit",
    requiredProof:
      "DQ-DM-05 result, source reconciliation state and no raw workbook/table bypass.",
    stopRule:
      "NO_RAW_WORKBOOK, NO_RAW_BANK_FILE, NO_VOUCHER and NO_UNRESTRICTED_TABLE.",
    href: "/reports",
  },
  {
    code: "RPT-SRC-03",
    label: "Owner signoff route",
    ownerLane: "BGH + process owner + Audit",
    requiredProof:
      "Owner signoff lane, signer, date, blocker state and controlled decision reference.",
    stopRule:
      "NO_OWNER_GO and NO_PRODUCTION_GO from dashboard status or PASS_LOCAL checks.",
    href: "/master-control",
  },
  {
    code: "RPT-SRC-04",
    label: "Controlled evidence ref",
    ownerLane: "Audit + IT_DATA",
    requiredProof:
      "Controlled evidence id, redaction class, reviewer and external storage route.",
    stopRule:
      "NO raw PII, bank data, vouchers, passwords or signed evidence in Git/Codex/chat.",
    href: "/audit",
  },
  {
    code: "RPT-SRC-05",
    label: "Reliance decision",
    ownerLane: "BGH + KHTC + PHAP_CHE + Audit",
    requiredProof:
      "Signed dashboard/report-view reliance decision and affected finance/legal boundary.",
    stopRule:
      "NO_FINANCE_ACTION, NO_STATUTORY_ACCOUNTING, NO_UAT_ACCEPTANCE and NO_OWNER_GO.",
    href: "/reports",
  },
];

const executiveReportSourceFastIndexRows: ExecutiveReportSourceFastIndex[] = [
  {
    code: "RPT-IDX-01",
    reportView: "RV_TTGDTX_FINANCE_SUMMARY",
    ownerLane: "KHTC + BGH + IT_DATA + Audit",
    sourceRoute: "P2-18 + P5-03 + FIN-DAY1",
    dqGate: "DQ-RV-01 / DQ-RV-02 / DQ-DM-05",
    evidenceRoute: "P2-18 UAT, P5-03 no-write proof, Finance Day-1 ledger",
    stopRule:
      "NO_DASHBOARD_RELIANCE until source reconciliation and owner signoff are signed.",
    href: "/reports",
  },
  {
    code: "RPT-IDX-02",
    reportView: "RV_TTGDTX_CONG_NO_THUC_THU",
    ownerLane: "KHTC + Audit",
    sourceRoute: "P2-10 + P2-13/P2-14",
    dqGate: "DQ-RV-03 / DQ-DM-05",
    evidenceRoute: "HEU receipt, reconciliation batch and controlled voucher ref",
    stopRule:
      "NO_STATUTORY_ACCOUNTING and NO_COLLECTION_RELIANCE from dashboard state.",
    href: "/reports",
  },
  {
    code: "RPT-IDX-03",
    reportView: "RV_HOU_LEDGER_SUMMARY",
    ownerLane: "HOU owner + KHTC + IT_DATA + Audit",
    sourceRoute: "HOU handover + tuition ledger + COM policy",
    dqGate: "DQ-RV-05 / DQ-DM-05",
    evidenceRoute: "HOU handover UAT, tuition ledger proof and COM signoff",
    stopRule:
      "NO_HOU_LEDGER_RELIANCE until handover, ledger and commission evidence are signed.",
    href: "/hou",
  },
  {
    code: "RPT-IDX-04",
    reportView: "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
    ownerLane: "DAO_TAO + KHTC + IT_DATA + Audit",
    sourceRoute: "Short Course attendance + invoice/payment",
    dqGate: "DQ-RV-06 / DQ-DM-05",
    evidenceRoute: "Attendance lock, payment UAT and source reconciliation",
    stopRule:
      "NO_PAYMENT_PERIOD_CLOSURE until attendance/payment and report-view signoff are signed.",
    href: "/short-course",
  },
  {
    code: "RPT-IDX-05",
    reportView: "RV_AUDIT_RISK_CONTROL",
    ownerLane: "Audit + IT_DATA + affected owners",
    sourceRoute: "Audit log + risk register + controlled evidence binder",
    dqGate: "DQ-RV-07 / DQ-DM-05",
    evidenceRoute: "Audit trace, waiver/conversion decision and owner closure ref",
    stopRule:
      "NO_WAIVER_RELIANCE and NO_OWNER_GO until owner decision evidence is signed.",
    href: "/audit",
  },
  {
    code: "RPT-IDX-06",
    reportView: "RV_AI_ALLOWED_CONTEXT",
    ownerLane: "BGH + IT_DATA + Audit",
    sourceRoute: "AI policy + approved report views + prompt audit",
    dqGate: "DQ-RV-08 / DQ-DM-05",
    evidenceRoute: "AI scope signoff, allowed-context register and prompt audit route",
    stopRule:
      "NO_AI_PRODUCTION_ACTION, NO_RAW_RESTRICTED_DATA and NO_WORKFLOW_WRITE.",
    href: "/ai-assistant",
  },
];

const executiveReportDashboardScopeContractRows: ExecutiveReportDashboardScopeContract[] =
  [
    {
      code: "RPT-SCOPE-01",
      reportView: "RV_TTGDTX_FINANCE_SUMMARY",
      dashboardConsumer: "Executive finance focus / Finance Desk",
      scopeGate:
        "BGH/KHTC read-only, P2-18 + P5-03 signed browser UAT pending, no cross-scope raw table.",
      sourceContract:
        "Report View Register + P5-03 Finance Desk + FIN-DAY1 result ledger.",
      relianceBlocker:
        "NO_DASHBOARD_RELIANCE, NO_FINANCE_RELIANCE and NO_STATUTORY_ACCOUNTING until owner signoff.",
      href: "/reports",
    },
    {
      code: "RPT-SCOPE-02",
      reportView: "RV_TTGDTX_CONG_NO_THUC_THU",
      dashboardConsumer: "Executive reports focus / KHTC finance review",
      scopeGate:
        "KHTC/Audit scope only; receipt, reconciliation and invoice/chung-tu gates stay external evidence.",
      sourceContract:
        "P2-10 invoice policy + P2-13/P2-14 reconciliation + controlled evidence ref.",
      relianceBlocker:
        "NO_COLLECTION_RELIANCE, NO_VOUCHER_POSTING and NO_BANK_INSTRUCTION.",
      href: "/reports",
    },
    {
      code: "RPT-SCOPE-03",
      reportView: "RV_HOU_LEDGER_SUMMARY",
      dashboardConsumer: "Executive reports focus / HOU owner route",
      scopeGate:
        "HOU owner + KHTC + CTHSSV scope; HOU ledger must stay separate from TTGDTX and Short Course.",
      sourceContract:
        "HOU handover UAT, HOU tuition ledger proof and COM policy/signoff.",
      relianceBlocker:
        "NO_HOU_LEDGER_RELIANCE, NO_COM_PAYOUT and NO_OWNER_GO until signed HOU evidence.",
      href: "/hou",
    },
    {
      code: "RPT-SCOPE-04",
      reportView: "RV_SHORT_COURSE_ATTENDANCE_PAYMENT",
      dashboardConsumer: "Executive reports focus / Dao tao-KHTC review",
      scopeGate:
        "DAO_TAO/KHTC/Audit scope; attendance, BHXH policy and invoice/payment proof remain signed-UAT gated.",
      sourceContract:
        "Short Course source reconciliation + attendance lock + signed UAT evidence intake.",
      relianceBlocker:
        "NO_PAYMENT_PERIOD_CLOSURE, NO_ATTENDANCE_PAYMENT_RELIANCE and NO_PAYROLL_RELIANCE.",
      href: "/short-course",
    },
    {
      code: "RPT-SCOPE-05",
      reportView: "RV_AUDIT_RISK_CONTROL",
      dashboardConsumer: "Executive blockers focus / Audit risk queue",
      scopeGate:
        "Audit/IT_DATA/BGH scope; evidence ids are controlled refs only, not raw evidence.",
      sourceContract:
        "Audit log, risk register, controlled evidence binder and waiver/conversion route.",
      relianceBlocker:
        "NO_EVIDENCE_ACCEPTANCE, NO_WAIVER_RELIANCE and NO_HIDDEN_EVIDENCE_MOVEMENT.",
      href: "/audit",
    },
    {
      code: "RPT-SCOPE-06",
      reportView: "RV_AI_ALLOWED_CONTEXT",
      dashboardConsumer: "Executive AI advisory / allowed-context view",
      scopeGate:
        "BGH/IT_DATA/Audit advisory scope only; AI cannot open restricted raw data or write workflow state.",
      sourceContract:
        "AI policy, allowed-context register, prompt/output audit logging design and approved report views.",
      relianceBlocker:
        "NO_AI_PRODUCTION_ACTION, NO_RAW_RESTRICTED_DATA and NO_WORKFLOW_WRITE.",
      href: "/ai-assistant",
    },
  ];

function buildQuickLinks(
  activeSegmentId: string | null,
  permissions: ExecutiveDashboardPermissions,
) {
  const links: ExecutiveQuickLink[] = [
    {
      label: "Báo cáo",
      description: "Nguồn số liệu và report-view",
      href: withAdmissionSegmentParam("/reports", activeSegmentId),
      icon: BarChart3,
      tone: "primary",
    },
    {
      label: "Lead",
      description: "Xem tuyển sinh theo workspace",
      href: withAdmissionSegmentParam("/leads", activeSegmentId),
      icon: Users,
    },
    {
      label: "Audit",
      description: "Dấu vết, rủi ro, bằng chứng",
      href: "/audit",
      icon: ShieldCheck,
    },
  ];

  if (permissions.canOpenMasterControl) {
    links.splice(1, 0, {
      label: "Master Control",
      description: "Blocker, UAT, owner queue",
      href: "/master-control",
      icon: FileCheck2,
      tone: "primary",
    });
    links.push({
      label: "Pháp chế/SOP",
      description: "Legal gates và căn cứ",
      href: "/tchc/legal-gates",
      icon: Gavel,
    });
  }

  if (permissions.canOpenFinanceDesk) {
    links.push({
      label: "Finance Desk",
      description: "Tài chính read-only",
      href: withAdmissionSegmentParam("/finance-desk", activeSegmentId),
      icon: WalletCards,
    });
  }

  if (permissions.canOpenScopeControl) {
    links.push({
      label: "Phân quyền",
      description: "User, role, workspace scope",
      href: "/settings/scopes",
      icon: LockKeyhole,
    });
  }

  return links;
}

function getDashboardPermissionSignal(
  permissions: ExecutiveDashboardPermissions,
  signal: ExecutiveDashboardPermissionMatrix["runtimeSignal"],
) {
  if (signal === "readOnlyDashboard") {
    return "READ_ONLY_DASHBOARD_VISIBLE";
  }

  return permissions[signal]
    ? "ROUTE_VISIBLE_BY_PERMISSION"
    : "ROUTE_LINK_BLOCKED_PENDING_PERMISSION";
}

function getDashboardPermissionHref(
  row: ExecutiveDashboardPermissionMatrix,
  permissions: ExecutiveDashboardPermissions,
) {
  if (row.runtimeSignal === "readOnlyDashboard") {
    return row.href;
  }

  return permissions[row.runtimeSignal] ? row.href : "/settings/scopes";
}

function normalizeExecutiveFocusMode(
  value: string | null | undefined,
): ExecutiveFocusMode {
  return executiveFocusModeItems.some((item) => item.mode === value)
    ? (value as ExecutiveFocusMode)
    : "all";
}

function getExecutiveFocusNextAction(
  mode: ExecutiveFocusMode,
): ExecutiveFocusNextAction {
  return (
    executiveFocusNextActionRows.find((item) => item.mode === mode) ??
    executiveFocusNextActionRows[0]
  );
}

const persistentExecutiveSectionCodes = ["OVR", "PRI", "NXT", "QCK"];

const executiveFocusSectionCodes: Record<ExecutiveFocusMode, string[]> = {
  all: [],
  reports: ["RPT"],
  finance: ["FIN"],
  evidence: ["EVD"],
  roles: ["ROL"],
  legal: ["LAW"],
  modules: ["M12", "ADM"],
  blockers: ["BLK"],
};

const executiveDecisionRoleCodes = new Set([
  "ADMIN",
  "BGH",
  "HIEU_TRUONG",
  "PHO_HIEU_TRUONG",
]);

function getExecutiveSectionNavItemsForFocus(
  mode: ExecutiveFocusMode,
): ExecutiveSectionNavItem[] {
  if (mode === "all") {
    return executiveSectionNavItems;
  }

  const visibleCodes = new Set([
    ...persistentExecutiveSectionCodes,
    ...executiveFocusSectionCodes[mode],
  ]);

  return executiveSectionNavItems.filter((item) => visibleCodes.has(item.code));
}

export function ExecutiveDashboardOverview({
  roleCode,
  activeSegmentId,
  activeSegmentLabel,
  focusMode,
  kpis,
  pipeline,
  activities,
  permissions,
  segmentOverview,
}: ExecutiveDashboardOverviewProps) {
  const quickLinks = buildQuickLinks(activeSegmentId, permissions);
  const pipelineTotal = pipeline.reduce((sum, item) => sum + item.count, 0);
  const openBlockers = PRODUCTION_BLOCKERS.slice(0, 6);
  const currentFocusMode = normalizeExecutiveFocusMode(focusMode);
  const isAllFocus = currentFocusMode === "all";
  const currentFocusModeItem =
    executiveFocusModeItems.find((item) => item.mode === currentFocusMode) ??
    executiveFocusModeItems[0];
  const showFocusedSection = (mode: ExecutiveFocusMode) =>
    isAllFocus || currentFocusMode === mode;
  const currentFocusNextAction =
    getExecutiveFocusNextAction(currentFocusMode);
  const CurrentFocusNextActionIcon = currentFocusNextAction.icon;
  const visibleSectionNavItems =
    getExecutiveSectionNavItemsForFocus(currentFocusMode);
  const currentRoleLane = getHeuRoleLane(roleCode);
  const executiveRoleLanes = HEU_ROLE_LANE_MATRIX.filter((lane) =>
    executiveDecisionRoleCodes.has(lane.code),
  );
  const focusHref = (mode: ExecutiveFocusMode) =>
    withAdmissionSegmentParam(
      mode === "all" ? "/" : `/?focus=${mode}`,
      activeSegmentId,
    );

  return (
    <div
      className="min-w-0 space-y-3 sm:space-y-4"
      data-heu-executive-focus-mode="STD-17_EXECUTIVE_FOCUS_MODE"
      data-heu-executive-focus-boundary="READ_ONLY FOCUS_QUERY_PARAM NO_STATE_MUTATION NO_HIDDEN_NO_GO NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"
      data-heu-executive-focus-overflow-guard="STD-17_NO_OVERFLOW"
      data-heu-executive-responsive-density="STD-08_RESPONSIVE_DENSITY_SECTION_ORDER"
      data-heu-executive-responsive-density-boundary="NO_HIDDEN_BLOCKERS NO_OVERLAP NO_PRODUCTION_GO NO_APPROVAL_ACTION"
      data-heu-executive-visual-qa="STD-09_EXECUTIVE_VISUAL_QA_SOURCE_GUARD"
      data-heu-executive-visual-qa-boundary="PASS_LOCAL_VISUAL_QA AUTH_REQUIRED NO_SCREENSHOT_CLAIM NO_UAT_ACCEPTANCE NO_APPROVAL_ACTION NO_PRODUCTION_GO"
      data-heu-executive-visual-qa-viewports="desktop_1440 mobile_390"
      data-heu-executive-section-order="overview section_navigator focus_next_action priority_focus quick_access report_reliance finance uat_evidence role_scope legal_sop module_maturity kpis blockers admissions segment_overview"
    >
      <section
        id="executive-overview"
        className="scroll-mt-24 min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-3 shadow-sm sm:p-4"
        data-heu-executive-dashboard="STD-01_EXECUTIVE_DASHBOARD"
        data-heu-executive-dashboard-readonly="STD-01_READ_ONLY"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600">
              <LayoutDashboard className="size-3.5" />
              STD-01 · Read-only cockpit
            </div>
            <h2 className="mt-3 break-words text-2xl font-semibold tracking-normal text-zinc-950">
              Dashboard Hiệu trưởng/BGH
            </h2>
            <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-zinc-600">
              Màn này gom truy cập nhanh, tình trạng module, blocker sản xuất,
              phân quyền, pháp chế và bằng chứng. Không có nút GO, không duyệt
              UAT, không ghi tài chính và không thay thế chữ ký owner.
            </p>
            <div
              className="mt-3 flex min-w-0 flex-col gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              data-heu-executive-active-focus-header="STD-30_EXECUTIVE_ACTIVE_FOCUS_HEADER"
              data-heu-executive-active-focus-boundary="PASS_LOCAL_ACTIVE_FOCUS_HEADER READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM ACTIVE_FOCUS_VISIBLE RETURN_TO_ALL NO_STATE_MUTATION NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"
              data-heu-executive-active-focus-overflow-guard="STD-30_NO_OVERFLOW"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold uppercase text-zinc-500">
                  STD-30 Active focus header / focus={currentFocusMode}
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-zinc-950">
                  Đang xem: {currentFocusModeItem.label}
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-zinc-500">
                  {currentFocusModeItem.description}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link
                  href={focusHref("all")}
                  aria-label="Xem toàn cảnh điều hành"
                  title="Xem toàn cảnh điều hành"
                >
                  <LayoutDashboard className="size-4" />
                  Toàn cảnh
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:w-[420px]">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-medium uppercase text-amber-700">
                Production
              </p>
              <p className="mt-1 text-lg font-semibold text-amber-900">NO-GO</p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs font-medium uppercase text-zinc-500">
                Vai trò
              </p>
              <p className="mt-1 truncate text-lg font-semibold text-zinc-950">
                {roleCode}
              </p>
            </div>
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-sky-200 bg-sky-50/70 p-3"
          data-heu-executive-operating-brain-completion="STD-43_EXECUTIVE_OPERATING_BRAIN_COMPLETION_GATE"
          data-heu-executive-operating-brain-completion-boundary="PASS_LOCAL_EXECUTIVE_OPERATING_BRAIN_COMPLETION READ_ONLY COMPLETION_GATE STD-01 STD-37 STD-38 STD-39 STD-40 STD-41 STD-42 STD-44 SCOPE_BOUND_DASHBOARD ROUTE_VISIBILITY_MATRIX REPORT_VIEW_TO_DASHBOARD_SCOPE EVIDENCE_AUTHORITY_QUEUE RELIANCE_LOCK ACCEPTANCE_LOCK EXECUTIVE_EFFECTIVE_ACCESS_READONLY LIVE_EXECUTIVE_PERMISSION_NO_GO SIGNED_UAT_PENDING OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_STATE_MUTATION NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_APPROVAL_PERMISSION NO_PAYMENT_PERMISSION NO_DASHBOARD_RELIANCE NO_REPORT_VIEW_RELIANCE NO_FINANCE_RELIANCE NO_FINANCE_ACTION NO_LEGAL_CONCLUSION NO_OFFICIAL_SOP NO_UAT_EXECUTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-operating-brain-completion-overflow-guard="STD-43_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-sky-700">
                STD-43 Executive operating brain completion gate
              </p>
              <h3 className="mt-1 break-words text-sm font-semibold text-sky-950">
                Mot man hinh dieu hanh, sau lop khoa quyen, phap che, tai
                chinh va UAT/evidence
              </h3>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-sky-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-sky-800">
              COMPLETION_GATE
            </span>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
            {executiveOperatingBrainCompletionRows.map((row) => (
              <article
                key={row.code}
                className="flex min-h-64 min-w-0 flex-col rounded-md border border-sky-100 bg-white p-3"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-sky-700">
                      {row.code}
                    </p>
                    <h4 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                      {row.pillar}
                    </h4>
                  </div>
                  <Link
                    href={row.href}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="shrink-0 rounded-md border border-sky-100 bg-sky-50 p-2 text-sky-700 transition hover:border-sky-300 hover:bg-white hover:text-sky-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="mt-3 grid gap-2 text-xs leading-5 sm:grid-cols-2">
                  <div className="min-w-0 rounded-md bg-sky-50 p-2 ring-1 ring-sky-100">
                    <p className="font-medium text-sky-700">Evidence chain</p>
                    <p className="mt-1 break-words text-sky-950">
                      {row.evidenceChain}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-md bg-zinc-50 p-2 ring-1 ring-zinc-200">
                    <p className="font-medium text-zinc-500">
                      Dashboard scope
                    </p>
                    <p className="mt-1 break-words text-zinc-800">
                      {row.dashboardScope}
                    </p>
                  </div>
                </div>
                <p className="mt-3 break-words text-xs leading-5 text-zinc-600">
                  {row.authorityRule}
                </p>
                <p className="mt-auto pt-3 break-words font-mono text-xs leading-5 text-amber-800">
                  {row.stopRule}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-rose-200 bg-rose-50/70 p-3"
          data-heu-executive-effective-access-readonly="STD-44_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GATE"
          data-heu-executive-effective-access-readonly-boundary="PASS_LOCAL_EXECUTIVE_EFFECTIVE_ACCESS_READONLY_GUARD READ_ONLY LIVE_EFFECTIVE_ACCESS_CHECK role_permissions user_scope_effective_access user_scope_enforcement_summary BGH HIEU_TRUONG PHO_HIEU_TRUONG EXECUTIVE_READONLY_ALLOWED_PERMISSIONS LIVE_EXECUTIVE_PERMISSION_NO_GO NO_APPROVAL_PERMISSION NO_PAYMENT_PERMISSION NO_MANAGE_PERMISSION NO_CREATE_PERMISSION NO_UPDATE_PERMISSION NO_DELETE_PERMISSION NO_SENSITIVE_READ NO_HARD_DELETE NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_STATE_MUTATION NO_DASHBOARD_RELIANCE NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-effective-access-readonly-overflow-guard="STD-44_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-rose-700">
                STD-44 Executive effective-access read-only gate
              </p>
              <h3 className="mt-1 break-words text-sm font-semibold text-rose-950">
                Khoa quyen HT/BGH ve dung cockpit read-only truoc khi tin dashboard
              </h3>
              <p className="mt-1 max-w-5xl break-words text-xs leading-5 text-rose-900">
                Guard nay doi chieu role_permissions va effective-access live.
                Neu BGH, HIEU_TRUONG hoac PHO_HIEU_TRUONG con approve, pay,
                manage, create, update, delete, sensitive-read hoac workflow
                action thi dashboard van la advisory NO_GO.
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-rose-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-rose-800">
              LIVE_NO_GO_GATE
            </span>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
            {executiveEffectiveAccessReadOnlyGateRows.map((row) => (
              <article
                key={row.code}
                className="flex min-h-64 min-w-0 flex-col rounded-md border border-rose-100 bg-white p-3"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-rose-700">
                      {row.code}
                    </p>
                    <h4 className="mt-1 break-words text-sm font-semibold text-rose-950">
                      {row.roleLane}
                    </h4>
                  </div>
                  <Link
                    href={row.href}
                    className="shrink-0 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-100"
                  >
                    Open
                  </Link>
                </div>
                <dl className="mt-3 grid flex-1 gap-2 text-xs leading-5 text-rose-950">
                  <div className="min-w-0 rounded-md bg-rose-50 p-2">
                    <dt className="font-semibold">Live surface</dt>
                    <dd className="mt-1 break-words text-rose-900">
                      {row.liveSurface}
                    </dd>
                  </div>
                  <div className="min-w-0 rounded-md bg-rose-50 p-2">
                    <dt className="font-semibold">Read-only rule</dt>
                    <dd className="mt-1 break-words text-rose-900">
                      {row.readonlyRule}
                    </dd>
                  </div>
                  <div className="min-w-0 rounded-md bg-amber-50 p-2 text-amber-950">
                    <dt className="font-semibold">Current blocker</dt>
                    <dd className="mt-1 break-words">{row.currentBlocker}</dd>
                  </div>
                  <div className="min-w-0 rounded-md bg-zinc-50 p-2 text-zinc-800">
                    <dt className="font-semibold">Owner action</dt>
                    <dd className="mt-1 break-words">
                      {row.requiredOwnerAction}
                    </dd>
                  </div>
                  <div className="min-w-0 rounded-md bg-white p-2 font-mono text-[11px] text-rose-800 ring-1 ring-rose-100">
                    {row.stopRule}
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <nav
        id="executive-section-navigator"
        aria-label="Executive dashboard sections"
        className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
        data-heu-executive-section-navigator="STD-07_EXECUTIVE_SECTION_NAVIGATOR"
        data-heu-executive-section-navigator-boundary="NO_HIDDEN_NO_GO NO_APPROVAL_ACTION NO_STATE_MUTATION NO_PRODUCTION_GO"
        data-heu-executive-section-navigator-overflow-guard="STD-07_NO_OVERFLOW"
        data-heu-executive-focus-scoped-navigator="STD-22_EXECUTIVE_FOCUS_SCOPED_NAVIGATOR"
        data-heu-executive-focus-scoped-navigator-boundary="VISIBLE_SECTION_LINKS_ONLY PERSISTENT_OVERVIEW_PRIORITY_NEXT_QUICK NO_HIDDEN_TARGET_LINK NO_STATE_MUTATION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"
        data-heu-executive-focus-scoped-navigator-overflow-guard="STD-22_NO_OVERFLOW"
      >
        <div className="flex min-w-0 items-center gap-2 px-1">
          <Route className="size-4 shrink-0 text-zinc-500" />
          <p className="truncate text-sm font-semibold text-zinc-950">
            Executive focus
          </p>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {visibleSectionNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={`Jump to ${item.label}`}
              title={`Jump to ${item.label}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 transition hover:border-zinc-400 hover:bg-white hover:text-zinc-950"
            >
              <span className="font-mono text-xs font-semibold text-zinc-500">
                {item.code}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 p-2">
          <div className="flex min-w-0 items-center justify-between gap-3 px-1">
            <p className="truncate text-xs font-semibold uppercase text-zinc-500">
              Focus mode
            </p>
            <span className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800">
              NO-GO visible
            </span>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {executiveFocusModeItems.map((item) => {
              const active = item.mode === currentFocusMode;

              return (
                <Link
                  key={item.mode}
                  href={focusHref(item.mode)}
                  aria-label={`Focus ${item.label}`}
                  title={`Focus ${item.label}: ${item.description}`}
                  className={`inline-flex min-h-14 w-40 shrink-0 flex-col justify-center rounded-md border px-3 py-2 transition ${
                    active
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-950"
                  }`}
                >
                  <span
                    className={`font-mono text-xs font-semibold ${
                      active ? "text-white/70" : "text-zinc-500"
                    }`}
                  >
                    {item.code}
                  </span>
                  <span className="mt-1 truncate text-sm font-semibold">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <section
        id="executive-focus-next-action"
        className="scroll-mt-24 min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
        data-heu-executive-focus-next-action="STD-18_EXECUTIVE_FOCUS_NEXT_ACTION"
        data-heu-executive-focus-next-action-boundary="READ_ONLY_ROUTE_HINT NO_STATE_MUTATION NO_HIDDEN_NO_GO NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_APPROVAL_ACTION NO_OWNER_GO NO_PRODUCTION_GO"
        data-heu-executive-focus-next-action-overflow-guard="STD-18_NO_OVERFLOW"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <CurrentFocusNextActionIcon className="size-4 shrink-0 text-zinc-600" />
              <p className="truncate text-sm font-semibold text-zinc-950">
                Next action for active focus
              </p>
            </div>
            <p className="mt-2 break-words font-mono text-xs text-zinc-500">
              {currentFocusNextAction.code} / {currentFocusMode}
            </p>
            <h3 className="mt-1 break-words text-base font-semibold text-zinc-950">
              {currentFocusNextAction.label}
            </h3>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link
              href={currentFocusNextAction.href}
              aria-label={`Open next action ${currentFocusNextAction.label}`}
              title={`Open next action ${currentFocusNextAction.label}`}
            >
              <CurrentFocusNextActionIcon className="size-4" />
              Open target
            </Link>
          </Button>
        </div>
        <div className="mt-3 grid min-w-0 gap-2 lg:grid-cols-3">
          <div className="min-w-0 rounded-md bg-zinc-50 p-3 ring-1 ring-zinc-200">
            <p className="text-xs font-medium text-zinc-500">Owner lane</p>
            <p className="mt-1 break-words text-sm text-zinc-800">
              {currentFocusNextAction.ownerLane}
            </p>
          </div>
          <div className="min-w-0 rounded-md bg-zinc-50 p-3 ring-1 ring-zinc-200">
            <p className="text-xs font-medium text-zinc-500">Next action</p>
            <p className="mt-1 break-words text-sm text-zinc-800">
              {currentFocusNextAction.nextAction}
            </p>
          </div>
          <div className="min-w-0 rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-700">Stop rule</p>
            <p className="mt-1 break-words text-sm text-amber-900">
              {currentFocusNextAction.stopRule}
            </p>
          </div>
        </div>
      </section>

      <section
        id="executive-priority-focus"
        className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
        data-heu-executive-priority-focus="STD-11_EXECUTIVE_PRIORITY_FOCUS_RAIL"
        data-heu-executive-priority-focus-boundary="READ_ONLY NO_HIDDEN_NO_GO NO_STATE_MUTATION NO_APPROVAL_ACTION NO_PRODUCTION_GO"
        data-heu-executive-priority-focus-overflow-guard="STD-11_NO_OVERFLOW"
        data-heu-executive-priority-command-strip="STD-29_EXECUTIVE_PRIORITY_COMMAND_STRIP"
        data-heu-executive-priority-command-boundary="PASS_LOCAL_PRIORITY_COMMAND_STRIP READ_ONLY_ROUTE_HINT FOCUS_QUERY_PARAM VISIBLE_FOCUS_ONLY NO_STATE_MUTATION NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_APPROVAL_ACTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"
        data-heu-executive-priority-command-overflow-guard="STD-29_NO_OVERFLOW"
      >
        <div className="flex min-w-0 items-center justify-between gap-3 px-1">
          <div className="flex min-w-0 items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-zinc-500" />
            <h3 className="truncate text-sm font-semibold text-zinc-950">
              Priority focus
            </h3>
          </div>
          <span className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
            NO-GO visible
          </span>
        </div>
        <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-6">
          {executivePriorityFocusItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.code}
                href={focusHref(item.focusMode)}
                aria-label={`Open priority command ${item.label}`}
                title={`Open priority command ${item.label}`}
                className="group flex min-h-24 min-w-0 flex-col justify-between rounded-md border border-zinc-200 bg-zinc-50 p-3 text-zinc-800 transition hover:border-zinc-400 hover:bg-white"
              >
                <span className="flex min-w-0 items-start justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-zinc-700 ring-1 ring-zinc-200">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-xs font-semibold text-zinc-500">
                        {item.code}
                      </span>
                      <span className="mt-1 block truncate text-sm font-semibold text-zinc-950">
                        {item.label}
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-zinc-300 transition group-hover:text-zinc-900" />
                </span>
                <span className="mt-3 block min-w-0">
                  <span className="block truncate text-xs font-medium text-zinc-500">
                    {item.ownerLane}
                  </span>
                  <span className="mt-1 block line-clamp-2 break-words text-xs leading-5 text-amber-800">
                    {item.state}
                  </span>
                  <span className="mt-2 block w-fit rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold uppercase text-zinc-600">
                    focus={item.focusMode}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section
        id="executive-quick-access"
        className="scroll-mt-24 min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
        data-heu-executive-quick-access="STD-01_EXECUTIVE_QUICK_ACCESS"
        data-heu-executive-quick-access-overflow-guard="STD-01_NO_OVERFLOW"
      >
        <div className="flex min-w-0 items-center justify-between gap-3 px-1">
          <div className="flex min-w-0 items-center gap-2">
            <Route className="size-4 shrink-0 text-zinc-500" />
            <h3 className="truncate text-sm font-semibold text-zinc-950">
              Truy cập nhanh điều hành
            </h3>
          </div>
          <span className="shrink-0 text-xs text-zinc-500">
            {activeSegmentLabel ?? "Tất cả workspace"}
          </span>
        </div>
        <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            const isPrimary = link.tone === "primary";

            return (
              <Link
                key={link.label}
                href={link.href}
                aria-label={`Mở nhanh ${link.label}`}
                title={`Mở nhanh ${link.label}`}
                className={`group flex min-h-20 min-w-0 items-center justify-between gap-3 overflow-hidden rounded-md border px-3 py-3 transition ${
                  isPrimary
                    ? "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800"
                    : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-400 hover:bg-white"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3 overflow-hidden">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-md ring-1 ${
                      isPrimary
                        ? "bg-white/10 text-white ring-white/20"
                        : "bg-white text-zinc-700 ring-zinc-200"
                    }`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {link.label}
                    </span>
                    <span
                      className={`mt-1 block line-clamp-2 break-words text-xs leading-5 ${
                        isPrimary ? "text-white/70" : "text-zinc-500"
                      }`}
                    >
                      {link.description}
                    </span>
                  </span>
                </span>
                <ArrowRight
                  className={`size-4 shrink-0 transition ${
                    isPrimary
                      ? "text-white/60 group-hover:text-white"
                      : "text-zinc-300 group-hover:text-zinc-900"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </section>

      {showFocusedSection("reports") ? (
      <section
        id="executive-report-reliance"
        className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm sm:p-4"
        data-heu-executive-report-reliance="STD-03_REPORT_RELIANCE_QUICK_STATUS"
        data-heu-executive-report-reliance-boundary="OWNER_SIGNOFF_PENDING DQ-DM-05 NO_PRODUCTION_RELIANCE NO_DASHBOARD_RELIANCE NO_FINANCE_ACTION NO_OWNER_GO"
      >
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 shrink-0 text-zinc-600" />
              <h3 className="break-words text-base font-semibold text-zinc-950">
                Do tin cay report-view
              </h3>
            </div>
            <p className="mt-1 max-w-3xl break-words text-sm leading-6 text-zinc-500">
              Chi xem nhanh muc do tin cay cua bao cao. Khi con
              OWNER_SIGNOFF_PENDING, DQ-DM-05 hoac NO_GO thi dashboard khong
              duoc dung de reliance, finance action, UAT acceptance, owner
              GO/NO-GO hoac production GO.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={withAdmissionSegmentParam("/reports", activeSegmentId)}>
              <BarChart3 className="size-4" />
              Mo source map
            </Link>
          </Button>
        </div>
        <div
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50/60 p-3"
          data-heu-executive-report-source-fast-index="STD-33_EXECUTIVE_REPORT_SOURCE_FAST_INDEX"
          data-heu-executive-report-source-fast-index-boundary="PASS_LOCAL_REPORT_SOURCE_FAST_INDEX READ_ONLY REPORT_VIEW_SOURCE_INDEX DQ_DM05_VISIBLE OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_DASHBOARD_RELIANCE NO_RAW_SOURCE_OPEN NO_FINANCE_ACTION NO_STATUTORY_ACCOUNTING NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-report-source-fast-index-overflow-guard="STD-33_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-emerald-700">
                STD-33 Report source fast index
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-emerald-950">
                Report-view nao, nguon nao, ai ky, evidence nao con thieu
              </h4>
              <p className="mt-1 max-w-3xl break-words text-xs leading-5 text-emerald-900">
                Chi muc nay chi mo duong xem nhanh toi report/source map; khong
                mo raw source, khong chap nhan DQ/evidence va khong cho phep
                reliance tu dashboard.
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-emerald-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-emerald-800">
              OWNER_SIGNOFF_PENDING
            </span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <div className="grid min-w-[1120px] gap-2 text-xs leading-5 text-emerald-950">
              {executiveReportSourceFastIndexRows.map((row) => (
                <article
                  key={row.code}
                  className="grid gap-2 rounded-md border border-emerald-100 bg-white p-3 md:grid-cols-[0.8fr_1.1fr_1.1fr_0.9fr_1.2fr_1.2fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-emerald-700">
                      {row.code}
                    </p>
                    <p className="mt-1 break-words font-mono font-semibold">
                      {row.reportView}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-emerald-600">Owner</p>
                    <p className="mt-1 break-words">{row.ownerLane}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-emerald-600">Source route</p>
                    <p className="mt-1 break-words">{row.sourceRoute}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-emerald-600">DQ</p>
                    <p className="mt-1 break-words font-mono">{row.dqGate}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-emerald-600">Evidence</p>
                    <p className="mt-1 break-words">{row.evidenceRoute}</p>
                  </div>
                  <div className="min-w-0 rounded-md bg-amber-50 p-2 ring-1 ring-amber-100">
                    <p className="font-medium text-amber-700">Stop</p>
                    <p className="mt-1 break-words font-mono text-amber-800">
                      {row.stopRule}
                    </p>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.reportView}`}
                    title={`Mo ${row.reportView}`}
                    className="flex size-9 shrink-0 items-center justify-center self-start rounded-md border border-emerald-100 bg-emerald-50 text-emerald-700 transition hover:border-emerald-300 hover:bg-white hover:text-emerald-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-cyan-200 bg-cyan-50/60 p-3"
          data-heu-executive-report-dashboard-scope-contract="STD-39_EXECUTIVE_REPORT_DASHBOARD_SCOPE_CONTRACT"
          data-heu-executive-report-dashboard-scope-contract-boundary="PASS_LOCAL_REPORT_DASHBOARD_SCOPE_CONTRACT READ_ONLY REPORT_VIEW_TO_DASHBOARD_SCOPE REPORT_VIEW_REGISTER SOURCE_MAP_REQUIRED DQ_DM05_VISIBLE OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SCOPE_BOUND_DASHBOARD NO_RAW_SOURCE_OPEN NO_CROSS_SCOPE_DASHBOARD NO_DASHBOARD_RELIANCE NO_REPORT_VIEW_RELIANCE NO_FINANCE_ACTION NO_STATUTORY_ACCOUNTING NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_LEGAL_CONCLUSION NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-report-dashboard-scope-contract-overflow-guard="STD-39_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-cyan-700">
                STD-39 Report-dashboard scope contract
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-cyan-950">
                Report view nao cap so cho dashboard nao, theo scope nao
              </h4>
              <p className="mt-1 max-w-4xl break-words text-xs leading-5 text-cyan-900">
                Contract nay noi report view voi dashboard consumer, scope
                gate, source contract va blocker reliance. Khi con
                OWNER_SIGNOFF_PENDING hoac CONTROLLED_EVIDENCE_REQUIRED thi
                dashboard chi duoc xem advisory, khong tin so de duyet hay ghi
                nhan nghiep vu.
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-cyan-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-cyan-800">
              REPORT_VIEW_TO_DASHBOARD_SCOPE
            </span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <div className="grid min-w-[1120px] gap-2 text-xs leading-5 text-cyan-950">
              {executiveReportDashboardScopeContractRows.map((row) => (
                <article
                  key={row.code}
                  className="grid gap-2 rounded-md border border-cyan-100 bg-white p-3 md:grid-cols-[0.75fr_1fr_1fr_1.35fr_1.35fr_1.3fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-cyan-700">
                      {row.code}
                    </p>
                    <p className="mt-1 break-words font-semibold">
                      {row.reportView}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-cyan-700">Consumer</p>
                    <p className="mt-1 break-words">{row.dashboardConsumer}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-cyan-700">Scope gate</p>
                    <p className="mt-1 break-words">{row.scopeGate}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-cyan-700">Source contract</p>
                    <p className="mt-1 break-words">{row.sourceContract}</p>
                  </div>
                  <div className="min-w-0 rounded-md bg-amber-50 p-2 ring-1 ring-amber-100">
                    <p className="font-medium text-amber-700">
                      Reliance blocker
                    </p>
                    <p className="mt-1 break-words font-mono text-amber-800">
                      {row.relianceBlocker}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-md bg-cyan-50 p-2 ring-1 ring-cyan-100">
                    <p className="font-medium text-cyan-700">Dashboard rule</p>
                    <p className="mt-1 break-words font-mono">
                      READ_ONLY_ADVISORY / NO_DASHBOARD_RELIANCE
                    </p>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="flex size-9 shrink-0 items-center justify-center self-start rounded-md border border-cyan-100 bg-cyan-50 text-cyan-700 transition hover:border-cyan-300 hover:bg-white hover:text-cyan-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-3"
          data-heu-executive-report-source-map-triage="STD-24_EXECUTIVE_REPORT_SOURCE_MAP_TRIAGE"
          data-heu-executive-report-source-map-triage-boundary="PASS_LOCAL_REPORT_SOURCE_TRIAGE READ_ONLY REPORT_VIEW_MASTER_CONTRACT DQ-DM-05 OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_RAW_WORKBOOK NO_RAW_BANK_FILE NO_VOUCHER NO_DASHBOARD_RELIANCE NO_FINANCE_ACTION NO_STATUTORY_ACCOUNTING NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-report-source-map-triage-overflow-guard="STD-24_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-sky-700">
                STD-24 Report source map triage
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-sky-950">
                BGH kiểm nguồn số liệu trước khi tin dashboard
              </h4>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-sky-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-sky-800">
              NO_DASHBOARD_RELIANCE
            </span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            {executiveReportSourceMapTriageRows.map((row) => (
              <article
                key={row.code}
                className="flex min-h-48 min-w-0 flex-col rounded-md border border-sky-100 bg-white p-3"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-sky-700">
                      {row.code}
                    </p>
                    <h5 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                      {row.label}
                    </h5>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="shrink-0 rounded-md border border-sky-100 bg-sky-50 p-2 text-sky-700 transition hover:border-sky-300 hover:bg-white hover:text-sky-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
                <p className="mt-3 break-words text-xs font-medium leading-5 text-sky-700">
                  {row.ownerLane}
                </p>
                <p className="mt-2 break-words text-xs leading-5 text-zinc-600">
                  {row.requiredProof}
                </p>
                <p className="mt-auto pt-3 break-words font-mono text-xs leading-5 text-amber-700">
                  {row.stopRule}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {reportRelianceRows.map((row) => (
            <article
              key={row.reportView}
              className="min-w-0 rounded-md border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-mono text-xs text-zinc-500">
                    {row.reportView}
                  </p>
                  <h4 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                    {row.label}
                  </h4>
                </div>
                <Link
                  href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                  aria-label={`Mo ${row.label}`}
                  title={`Mo ${row.label}`}
                  className="shrink-0 rounded-md border border-zinc-200 bg-white p-2 text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-950"
                >
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-600 sm:grid-cols-2">
                <div className="min-w-0 rounded-md bg-white p-2 ring-1 ring-zinc-200">
                  <p className="font-medium text-zinc-500">Owner</p>
                  <p className="mt-1 break-words text-zinc-800">
                    {row.owner}
                  </p>
                </div>
                <div className="min-w-0 rounded-md bg-white p-2 ring-1 ring-zinc-200">
                  <p className="font-medium text-zinc-500">DQ / lock</p>
                  <p className="mt-1 break-words font-mono text-zinc-800">
                    {row.dqGate}
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="break-words font-mono text-xs font-semibold text-amber-900">
                  {row.decisionState}
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-amber-800">
                  {row.blocker}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {showFocusedSection("finance") ? (
      <section
        id="executive-finance-readonly"
        className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm sm:p-4"
        data-heu-executive-finance-readonly="STD-06_FINANCE_READONLY_RELIANCE_PROOF"
        data-heu-executive-finance-boundary="READ_ONLY P2-18 P5-03 FIN-DAY1 ACCT-LOCAL NO_VOUCHER NO_PAYMENT NO_BANK_INSTRUCTION NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_PRODUCTION_GO"
        data-heu-executive-finance-overflow-guard="STD-06_NO_OVERFLOW"
        data-heu-executive-finance-source-contract="STD-15_FINANCE_RELIANCE_SOURCE_CONTRACT"
        data-heu-executive-finance-source-boundary="READ_ONLY SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_VOUCHER_POSTING NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_PRODUCTION_GO"
        data-heu-executive-finance-source-overflow-guard="STD-15_NO_OVERFLOW"
      >
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <WalletCards className="size-4 shrink-0 text-zinc-600" />
              <h3 className="break-words text-base font-semibold text-zinc-950">
                Finance read-only reliance proof
              </h3>
            </div>
            <p className="mt-1 max-w-3xl break-words text-sm leading-6 text-zinc-500">
              Finance Desk va accounting dashboard chi la read-only cockpit cho
              BGH/KHTC xem blocker. Con thieu signed P5-03/P2-18 reliance
              proof thi khong voucher, khong payment, khong bank instruction,
              khong statutory accounting, khong finance reliance va khong
              production GO.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={withAdmissionSegmentParam("/finance-desk", activeSegmentId)}>
                <WalletCards className="size-4" />
                Finance Desk
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                href={withAdmissionSegmentParam(
                  "/ttgdtx/accounting-dashboard",
                  activeSegmentId,
                )}
              >
                <BarChart3 className="size-4" />
                P2-18
              </Link>
            </Button>
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-teal-200 bg-teal-50/60 p-3"
          data-heu-executive-finance-reliance-fast-index="STD-35_EXECUTIVE_FINANCE_RELIANCE_FAST_INDEX"
          data-heu-executive-finance-reliance-fast-index-boundary="PASS_LOCAL_FINANCE_RELIANCE_FAST_INDEX READ_ONLY FINANCE_RELIANCE_INDEX P2-18 P5-03 FIN_DAY1 ACCT_LOCAL P6-04 SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SIGNED_UAT_PENDING NO_DASHBOARD_RELIANCE NO_VOUCHER_POSTING NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-finance-reliance-fast-index-overflow-guard="STD-35_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-teal-700">
                STD-35 Finance reliance fast index
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-teal-950">
                Tuyen tai chinh nao, can bang chung nao, bi cam lam gi
              </h4>
              <p className="mt-1 max-w-4xl break-words text-xs leading-5 text-teal-900">
                Bang nay chi la muc luc read-only cho BGH/KHTC: moi dong noi
                ro source contract, proof, gate va forbidden action. Khi con
                NO_GO/BLOCKED thi khong reliance, khong voucher, khong payment,
                khong bank instruction va khong statutory accounting.
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-teal-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-teal-800">
              NO_FINANCE_RELIANCE
            </span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <div className="grid min-w-[1180px] gap-2 text-xs leading-5 text-teal-950">
              {financeRelianceFastIndexRows.map((row) => (
                <article
                  key={row.code}
                  className="grid gap-2 rounded-md border border-teal-100 bg-white p-3 md:grid-cols-[0.75fr_1.05fr_1.15fr_1.1fr_1.2fr_1fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-teal-700">
                      {row.code}
                    </p>
                    <p className="mt-1 break-words font-semibold text-zinc-950">
                      {row.surface}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-teal-700">
                      Source contract
                    </p>
                    <p className="mt-1 break-words">{row.sourceContract}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-teal-700">Proof</p>
                    <p className="mt-1 break-words">{row.requiredProof}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-teal-700">Gate</p>
                    <p className="mt-1 break-words font-mono">
                      {row.decisionGate}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-md bg-amber-50 p-2 ring-1 ring-amber-100">
                    <p className="font-medium text-amber-700">Forbidden</p>
                    <p className="mt-1 break-words font-mono text-amber-800">
                      {row.forbiddenAction}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-teal-700">Next</p>
                    <p className="mt-1 break-words">{row.nextRoute}</p>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="flex size-9 shrink-0 items-center justify-center self-start rounded-md border border-teal-100 bg-teal-50 text-teal-700 transition hover:border-teal-300 hover:bg-white hover:text-teal-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-cyan-200 bg-white p-3"
          data-heu-executive-finance-readonly-reliance-lock="STD-41_EXECUTIVE_FINANCE_READONLY_RELIANCE_LOCK"
          data-heu-executive-finance-readonly-reliance-lock-boundary="PASS_LOCAL_FINANCE_READONLY_RELIANCE_LOCK READ_ONLY RELIANCE_LOCK SCOPE_BOUND_DASHBOARD P2-18 P5-03 FIN_DAY1 ACCT_LOCAL P6-04 SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SIGNED_UAT_PENDING NO_DASHBOARD_RELIANCE NO_REPORT_VIEW_RELIANCE NO_COLLECTION_RELIANCE NO_DEBT_CLEARING NO_VOUCHER_POSTING NO_INVOICE_ISSUANCE NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_MONEY_MOVEMENT NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-finance-readonly-reliance-lock-overflow-guard="STD-41_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-cyan-700">
                STD-41 Finance read-only reliance lock
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-cyan-950">
                Duoc xem de biet blocker, khong duoc tin de hach toan hoac chi tien
              </h4>
              <p className="mt-1 max-w-4xl break-words text-xs leading-5 text-cyan-900">
                Lock nay tach ro visible use va forbidden action. Khi chua co
                signed UAT, owner signoff va controlled evidence, dashboard chi
                la advisory/read-only: khong clear cong no, khong voucher,
                khong invoice, khong payment, khong bank instruction va khong
                statutory accounting.
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 font-mono text-[11px] font-semibold text-cyan-800">
              RELIANCE_LOCK
            </span>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
            {financeReadonlyRelianceLockRows.map((row) => (
              <article
                key={row.code}
                className="flex min-h-64 min-w-0 flex-col rounded-md border border-cyan-100 bg-cyan-50/40 p-3"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-cyan-700">
                      {row.code}
                    </p>
                    <h5 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                      {row.surface}
                    </h5>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="shrink-0 rounded-md border border-cyan-100 bg-white p-2 text-cyan-700 transition hover:border-cyan-300 hover:text-cyan-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="mt-3 rounded-md bg-white p-2 text-xs leading-5 ring-1 ring-cyan-100">
                  <p className="font-medium text-cyan-700">Visible use</p>
                  <p className="mt-1 break-words text-zinc-800">
                    {row.visibleUse}
                  </p>
                </div>
                <div className="mt-2 rounded-md bg-white p-2 text-xs leading-5 ring-1 ring-cyan-100">
                  <p className="font-medium text-cyan-700">
                    Required before reliance
                  </p>
                  <p className="mt-1 break-words text-zinc-700">
                    {row.requiredBeforeReliance}
                  </p>
                </div>
                <p className="mt-2 break-words text-xs font-medium leading-5 text-cyan-800">
                  {row.ownerLane}
                </p>
                <p className="mt-auto pt-3 break-words font-mono text-xs leading-5 text-amber-900">
                  {row.forbiddenUntilSigned}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50/60 p-3"
          data-heu-executive-finance-reliance-triage="STD-26_EXECUTIVE_FINANCE_RELIANCE_TRIAGE"
          data-heu-executive-finance-reliance-triage-boundary="PASS_LOCAL_FINANCE_RELIANCE_TRIAGE READ_ONLY P2-18 P5-03 FIN_DAY1 P6-04 SOURCE_MAP_REQUIRED OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED SIGNED_UAT_PENDING NO_DASHBOARD_RELIANCE NO_VOUCHER_POSTING NO_PAYMENT_EXECUTION NO_BANK_INSTRUCTION NO_STATUTORY_ACCOUNTING NO_FINANCE_RELIANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-finance-reliance-triage-overflow-guard="STD-26_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-emerald-700">
                STD-26 Finance reliance decision triage
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-emerald-950">
                BGH/KHTC kiểm điều kiện tin số trước khi mở chi tiết
              </h4>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-emerald-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-emerald-800">
              NO_FINANCE_RELIANCE
            </span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            {financeRelianceDecisionRows.map((row) => (
              <article
                key={row.code}
                className="flex min-h-44 min-w-0 flex-col rounded-md border border-emerald-100 bg-white p-3"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-emerald-700">
                      {row.code}
                    </p>
                    <h5 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                      {row.label}
                    </h5>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="shrink-0 rounded-md border border-emerald-100 bg-emerald-50 p-2 text-emerald-700 transition hover:border-emerald-300 hover:bg-white hover:text-emerald-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
                <p className="mt-3 break-words text-xs font-medium leading-5 text-emerald-800">
                  {row.ownerLane}
                </p>
                <p className="mt-2 break-words text-xs leading-5 text-zinc-600">
                  {row.requiredProof}
                </p>
                <p className="mt-auto pt-3 break-words font-mono text-xs leading-5 text-amber-800">
                  {row.stopRule}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-sky-700">
                STD-15 Finance reliance source contract
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-sky-950">
                Nguon nao duoc doc, bang chung nao con thieu, ai ky truoc khi tin cay
              </h4>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-sky-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-sky-800">
              SOURCE_MAP_REQUIRED / NO_GO / BLOCKED
            </span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <div className="grid min-w-[880px] gap-2 text-xs leading-5 text-sky-950">
              {financeSourceContractRows.map((row) => (
                <article
                  key={row.code}
                  className="grid gap-2 rounded-md border border-sky-100 bg-white p-3 md:grid-cols-[0.7fr_1fr_1fr_1.2fr_1.3fr]"
                >
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-sky-700">
                      {row.code}
                    </p>
                    <p className="mt-1 break-words font-semibold">{row.metric}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sky-600">Source</p>
                    <p className="mt-1 break-words font-mono">{row.sourceRoute}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sky-600">Owner</p>
                    <p className="mt-1 break-words">{row.ownerLane}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sky-600">Evidence</p>
                    <p className="mt-1 break-words">{row.requiredEvidence}</p>
                  </div>
                  <div className="min-w-0 rounded-md bg-sky-50 p-2 ring-1 ring-sky-100">
                    <p className="font-medium text-sky-700">Stop</p>
                    <p className="mt-1 break-words">{row.stopRule}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {financeReadOnlyProofRows.map((row) => (
            <article
              key={row.code}
              className="min-w-0 rounded-md border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-zinc-500">
                    {row.code}
                  </p>
                  <h4 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                    {row.label}
                  </h4>
                </div>
                <Link
                  href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                  aria-label={`Mo ${row.code}`}
                  title={`Mo ${row.code}`}
                  className="shrink-0 rounded-md border border-zinc-200 bg-white p-2 text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-950"
                >
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-600 sm:grid-cols-2">
                <div className="min-w-0 rounded-md bg-white p-2 ring-1 ring-zinc-200">
                  <p className="font-medium text-zinc-500">Surface</p>
                  <p className="mt-1 break-words font-mono text-zinc-800">
                    {row.surface}
                  </p>
                </div>
                <div className="min-w-0 rounded-md bg-white p-2 ring-1 ring-zinc-200">
                  <p className="font-medium text-zinc-500">Proof</p>
                  <p className="mt-1 break-words text-zinc-800">
                    {row.requiredProof}
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="break-words font-mono text-xs font-semibold text-amber-900">
                  {row.state}
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-amber-800">
                  {row.stopRule}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {showFocusedSection("evidence") ? (
      <section
        id="executive-uat-evidence"
        className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm sm:p-4"
        data-heu-executive-uat-evidence-route="STD-16_UAT_EVIDENCE_ROUTE_CHECKLIST"
        data-heu-executive-uat-evidence-boundary="PASS_LOCAL_EVIDENCE_ROUTE SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_RELIANCE NO_ACCESS_CLOSURE NO_OWNER_GO NO_PRODUCTION_GO"
        data-heu-executive-uat-evidence-overflow-guard="STD-16_NO_OVERFLOW"
      >
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-4 shrink-0 text-zinc-600" />
              <h3 className="break-words text-base font-semibold text-zinc-950">
                UAT/evidence signed route
              </h3>
            </div>
            <p className="mt-1 max-w-3xl break-words text-sm leading-6 text-zinc-500">
              Checklist nay gom duong bang chung P0-14, P6-04, P2-18 va P5-03
              de BGH thay can ky gi tiep theo. Day la PASS_LOCAL_EVIDENCE_ROUTE:
              khong execute UAT, khong accept evidence, khong finance reliance,
              khong access closure, khong owner GO va khong production GO.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/audit">
                <ClipboardCheck className="size-4" />
                P0-14
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/settings/scopes">
                <LockKeyhole className="size-4" />
                P6-04
              </Link>
            </Button>
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50/60 p-3"
          data-heu-executive-uat-evidence-fast-action="STD-36_EXECUTIVE_UAT_EVIDENCE_FAST_ACTION_QUEUE"
          data-heu-executive-uat-evidence-fast-action-boundary="PASS_LOCAL_UAT_EVIDENCE_FAST_ACTION_QUEUE READ_ONLY FAST_ACTION_QUEUE P0-14 P6-04 P2-18 P5-03 P6-03 P6-06 P0-09 P0-15 SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING NO_EVIDENCE_UPLOAD NO_UAT_EXECUTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_ACCESS_GRANT NO_ACCESS_CLOSURE NO_PERMISSION_EXPANSION NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-uat-evidence-fast-action-overflow-guard="STD-36_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-emerald-700">
                STD-36 UAT/evidence fast action queue
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-emerald-950">
                Mo dung noi truoc: evidence id, role proof, finance signed proof,
                legal/SOP, audit/cascade va owner packet
              </h4>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-emerald-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-emerald-800">
              FAST_ACTION_QUEUE
            </span>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
            {uatEvidenceFastActionRows.map((row) => (
              <article
                key={row.code}
                className="flex min-h-56 min-w-0 flex-col rounded-md border border-emerald-100 bg-white p-3"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-emerald-700">
                      {row.code}
                    </p>
                    <h5 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                      {row.blocker}
                    </h5>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="shrink-0 rounded-md border border-emerald-100 bg-emerald-50 p-2 text-emerald-700 transition hover:border-emerald-300 hover:bg-white hover:text-emerald-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="mt-3 grid gap-2 text-xs leading-5 sm:grid-cols-2">
                  <div className="min-w-0 rounded-md bg-emerald-50 p-2 ring-1 ring-emerald-100">
                    <p className="font-medium text-emerald-700">Owner</p>
                    <p className="mt-1 break-words text-emerald-950">
                      {row.ownerLane}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-md bg-zinc-50 p-2 ring-1 ring-zinc-200">
                    <p className="font-medium text-zinc-500">Evidence key</p>
                    <p className="mt-1 break-words text-zinc-800">
                      {row.evidenceKey}
                    </p>
                  </div>
                </div>
                <p className="mt-3 break-words text-xs leading-5 text-zinc-600">
                  {row.firstAction}
                </p>
                <p className="mt-auto pt-3 break-words font-mono text-xs leading-5 text-amber-800">
                  {row.stopRule}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-amber-200 bg-amber-50/60 p-3"
          data-heu-executive-uat-evidence-acceptance-lock="STD-42_EXECUTIVE_UAT_EVIDENCE_ACCEPTANCE_LOCK"
          data-heu-executive-uat-evidence-acceptance-lock-boundary="PASS_LOCAL_UAT_EVIDENCE_ACCEPTANCE_LOCK READ_ONLY ACCEPTANCE_LOCK SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING REDACTION_REVIEW_REQUIRED NO_EVIDENCE_UPLOAD NO_RAW_EVIDENCE_MOVEMENT NO_UAT_EXECUTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_ACCESS_CLOSURE NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_FINANCE_RELIANCE NO_DASHBOARD_RELIANCE NO_PAYMENT_EXECUTION NO_LEGAL_CONCLUSION NO_OFFICIAL_SOP NO_WORKFLOW_RELIANCE NO_AUDIT_CLOSURE NO_WAIVER_RELIANCE NO_HIDDEN_EVIDENCE_MOVEMENT NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-uat-evidence-acceptance-lock-overflow-guard="STD-42_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-amber-700">
                STD-42 UAT/evidence acceptance lock
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-amber-950">
                Tach ro trang thai duoc xem voi trang thai da duoc nghiem thu
              </h4>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-amber-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-amber-800">
              ACCEPTANCE_LOCK
            </span>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
            {uatEvidenceAcceptanceLockRows.map((row) => (
              <article
                key={row.code}
                className="flex min-h-64 min-w-0 flex-col rounded-md border border-amber-100 bg-white p-3"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-amber-700">
                      {row.code}
                    </p>
                    <h5 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                      {row.evidenceLane}
                    </h5>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="shrink-0 rounded-md border border-amber-100 bg-amber-50 p-2 text-amber-700 transition hover:border-amber-300 hover:bg-white hover:text-amber-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="mt-3 grid gap-2 text-xs leading-5 sm:grid-cols-2">
                  <div className="min-w-0 rounded-md bg-amber-50 p-2 ring-1 ring-amber-100">
                    <p className="font-medium text-amber-700">Owner</p>
                    <p className="mt-1 break-words text-amber-950">
                      {row.ownerLane}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-md bg-zinc-50 p-2 ring-1 ring-zinc-200">
                    <p className="font-medium text-zinc-500">Visible use</p>
                    <p className="mt-1 break-words text-zinc-800">
                      {row.visibleUse}
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-md bg-zinc-50 p-2 text-xs leading-5 ring-1 ring-zinc-200">
                  <p className="font-medium text-zinc-500">
                    Required before acceptance
                  </p>
                  <p className="mt-1 break-words text-zinc-800">
                    {row.requiredBeforeAcceptance}
                  </p>
                </div>
                <p className="mt-auto pt-3 break-words font-mono text-xs leading-5 text-amber-800">
                  {row.forbiddenUntilSigned}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-violet-200 bg-violet-50/60 p-3"
          data-heu-executive-uat-evidence-closure-triage="STD-27_EXECUTIVE_UAT_EVIDENCE_CLOSURE_TRIAGE"
          data-heu-executive-uat-evidence-closure-boundary="PASS_LOCAL_UAT_EVIDENCE_TRIAGE READ_ONLY P0-14 P6-04 P2-18 P5-03 P0-09 P0-15 P0-17 SIGNED_UAT_PENDING CONTROLLED_EVIDENCE_REQUIRED OWNER_SIGNOFF_PENDING NO_UAT_EXECUTION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_ACCESS_CLOSURE NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-uat-evidence-closure-overflow-guard="STD-27_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-violet-700">
                STD-27 UAT/evidence closure triage
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-violet-950">
                BGH kiểm bằng chứng, chữ ký và khóa NO-GO trước khi đóng UAT
              </h4>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-violet-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-violet-800">
              SIGNED_UAT_PENDING
            </span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            {uatEvidenceClosureRows.map((row) => (
              <article
                key={row.code}
                className="flex min-h-44 min-w-0 flex-col rounded-md border border-violet-100 bg-white p-3"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-violet-700">
                      {row.code}
                    </p>
                    <h5 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                      {row.label}
                    </h5>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="shrink-0 rounded-md border border-violet-100 bg-violet-50 p-2 text-violet-700 transition hover:border-violet-300 hover:bg-white hover:text-violet-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
                <p className="mt-3 break-words text-xs font-medium leading-5 text-violet-800">
                  {row.ownerLane}
                </p>
                <p className="mt-2 break-words text-xs leading-5 text-zinc-600">
                  {row.requiredProof}
                </p>
                <p className="mt-auto pt-3 break-words font-mono text-xs leading-5 text-amber-800">
                  {row.stopRule}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
          {uatEvidenceRouteRows.map((row) => (
            <article
              key={row.code}
              className="flex min-h-56 min-w-0 flex-col rounded-md border border-zinc-200 bg-zinc-50 p-3"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-zinc-500">
                    {row.code}
                  </p>
                  <h4 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                    {row.route}
                  </h4>
                </div>
                <Link
                  href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                  aria-label={`Mo ${row.code}`}
                  title={`Mo ${row.code}`}
                  className="shrink-0 rounded-md border border-zinc-200 bg-white p-2 text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-950"
                >
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="mt-3 rounded-md bg-white p-2 text-xs leading-5 ring-1 ring-zinc-200">
                <p className="font-medium text-zinc-500">Owner</p>
                <p className="mt-1 break-words text-zinc-800">{row.ownerLane}</p>
              </div>
              <p className="mt-3 break-words text-xs leading-5 text-zinc-600">
                {row.requiredEvidence}
              </p>
              <div className="mt-auto pt-3">
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="break-words font-mono text-xs font-semibold text-amber-900">
                    {row.state}
                  </p>
                  <p className="mt-1 break-words text-xs leading-5 text-amber-800">
                    {row.stopRule}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {showFocusedSection("roles") ? (
      <section
        id="executive-role-scope"
        className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm sm:p-4"
        data-heu-executive-role-scope-decision="STD-23_EXECUTIVE_ROLE_SCOPE_DECISION_STRIP"
        data-heu-executive-role-scope-boundary="PASS_LOCAL_EXECUTIVE_ROLE_SCOPE READ_ONLY P6-04_ROLE_SCOPE_UAT_PENDING NEGATIVE_ACCESS_PROOF_PENDING NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_DAILY_DATA_ENTRY NO_FINANCE_EXECUTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
        data-heu-executive-role-scope-overflow-guard="STD-23_NO_OVERFLOW"
      >
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <LockKeyhole className="size-4 shrink-0 text-zinc-600" />
              <h3 className="break-words text-base font-semibold text-zinc-950">
                Executive role/scope decision strip
              </h3>
            </div>
            <p className="mt-1 max-w-3xl break-words text-sm leading-6 text-zinc-500">
              Phan nay giup BGH kiem tra nhanh dung nguoi dung viec: role hien
              tai duoc xem gi, bi cam lam gi, va P6-04 negative access proof
              con thieu gi. Day la PASS_LOCAL_EXECUTIVE_ROLE_SCOPE: khong cap
              quyen, khong mo rong permission, khong duyet UAT, khong owner GO
              va khong production GO.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/settings/scopes">
              <LockKeyhole className="size-4" />
              Mo role/scope
            </Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.4fr]">
          <article className="min-w-0 rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="font-mono text-xs font-semibold uppercase text-amber-700">
              Current role lane
            </p>
            <h4 className="mt-2 break-words text-lg font-semibold text-amber-950">
              {currentRoleLane?.code ?? "UNKNOWN_ROLE_LANE"}
            </h4>
            <p className="mt-1 break-words text-sm text-amber-900">
              {currentRoleLane?.label ??
                "Role chua map vao HEU_ROLE_LANE_MATRIX / NO_GO / BLOCKED"}
            </p>
            <div className="mt-3 grid gap-2 text-xs leading-5 text-amber-950">
              <div className="rounded-md bg-white/80 p-2 ring-1 ring-amber-200">
                <p className="font-medium text-amber-700">Owner lane</p>
                <p className="mt-1 break-words">
                  {currentRoleLane?.ownerLane ?? "IT_DATA + Audit review required"}
                </p>
              </div>
              <div className="rounded-md bg-white/80 p-2 ring-1 ring-amber-200">
                <p className="font-medium text-amber-700">Allowed read scope</p>
                <p className="mt-1 break-words">
                  {currentRoleLane?.allowedScope ??
                    "No executive reliance until role lane is normalized."}
                </p>
              </div>
              <div className="rounded-md bg-white/80 p-2 ring-1 ring-amber-200">
                <p className="font-medium text-amber-700">Forbidden actions</p>
                <p className="mt-1 break-words font-mono">
                  {currentRoleLane?.forbiddenScope ??
                    "NO_ACCESS_GRANT, NO_PERMISSION_EXPANSION, NO_OWNER_GO"}
                </p>
              </div>
            </div>
          </article>
          <div className="grid gap-2 sm:grid-cols-2">
            {executiveRoleLanes.map((lane) => (
              <article
                key={lane.code}
                className="min-w-0 rounded-md border border-zinc-200 bg-zinc-50 p-3"
              >
                <p className="font-mono text-xs font-semibold text-zinc-500">
                  {lane.code}
                </p>
                <h4 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                  {lane.label}
                </h4>
                <p className="mt-2 break-words text-xs leading-5 text-zinc-600">
                  {lane.allowedScope}
                </p>
                <p className="mt-2 break-words font-mono text-xs leading-5 text-amber-700">
                  {lane.forbiddenScope}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-sky-200 bg-sky-50/60 p-3"
          data-heu-executive-dashboard-scope-visibility="STD-37_EXECUTIVE_DASHBOARD_SCOPE_VISIBILITY_INVARIANT"
          data-heu-executive-dashboard-scope-visibility-boundary="PASS_LOCAL_DASHBOARD_SCOPE_VISIBILITY READ_ONLY SCOPE_BOUND_DASHBOARD canSeeAllSegments visibleSegmentIds admissionWorkspaceSegmentIds applyAdmissionSegmentIds ACTIVE_SEGMENT_LIMIT EXECUTIVE_ALL_SEGMENTS NON_EXECUTIVE_VISIBLE_SEGMENTS NO_CROSS_SCOPE_DASHBOARD NO_RAW_SOURCE_OPEN NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_STATE_MUTATION NO_FINANCE_ACTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-dashboard-scope-visibility-overflow-guard="STD-37_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-sky-700">
                STD-37 Dashboard scope visibility invariant
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-sky-950">
                Quyen o dau, dashboard o day
              </h4>
              <p className="mt-1 max-w-4xl break-words text-xs leading-5 text-sky-900">
                Invariant nay khoa nguyen tac: executive duoc xem toan canh
                read-only; user/phong ban chi xem dashboard theo active segment
                hoac visible segment scope. Dashboard khong cap quyen, khong mo
                scope va khong bien thanh nguon so lieu that khi chua signed UAT.
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-sky-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-sky-800">
              SCOPE_BOUND_DASHBOARD
            </span>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2 2xl:grid-cols-5">
            {dashboardScopeVisibilityRows.map((row) => (
              <article
                key={row.code}
                className="flex min-h-52 min-w-0 flex-col rounded-md border border-sky-100 bg-white p-3"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-sky-700">
                      {row.code}
                    </p>
                    <h5 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                      {row.actorLane}
                    </h5>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="shrink-0 rounded-md border border-sky-100 bg-sky-50 p-2 text-sky-700 transition hover:border-sky-300 hover:bg-white hover:text-sky-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
                <p className="mt-3 break-words text-xs leading-5 text-zinc-600">
                  {row.dashboardScope}
                </p>
                <div className="mt-3 rounded-md bg-sky-50 p-2 text-xs leading-5 ring-1 ring-sky-100">
                  <p className="font-medium text-sky-700">Enforced by</p>
                  <p className="mt-1 break-words text-sky-950">
                    {row.enforcedBy}
                  </p>
                </div>
                <p className="mt-auto pt-3 break-words font-mono text-xs leading-5 text-amber-800">
                  {row.blockedRule}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-teal-200 bg-teal-50/60 p-3"
          data-heu-executive-dashboard-permission-matrix="STD-38_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX"
          data-heu-executive-dashboard-permission-matrix-boundary="PASS_LOCAL_EXECUTIVE_DASHBOARD_PERMISSION_MATRIX READ_ONLY ROUTE_VISIBILITY_MATRIX runtimePermissionGate canOpenMasterControl canOpenFinanceDesk canOpenScopeControl master_control.read finance_desk.read scope.manage_department users.create permission_matrix.read permission_matrix.manage NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_STATE_MUTATION NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-dashboard-permission-matrix-overflow-guard="STD-38_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-teal-700">
                STD-38 Executive dashboard permission matrix
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-teal-950">
                Role nao duoc mo route nao, bi chan tai dau
              </h4>
              <p className="mt-1 max-w-4xl break-words text-xs leading-5 text-teal-900">
                Matrix nay doc truc tiep tu runtime permissions cua dashboard:
                neu thieu quyen thi route hien trang thai blocked va dua ve
                scope control. Khong co dong nao cap quyen, tao account, gan
                role, duyet UAT, duyet tai chinh hay ket luan phap ly.
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-teal-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-teal-800">
              ROUTE_VISIBILITY_MATRIX
            </span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <div className="grid min-w-[1120px] gap-2 text-xs leading-5 text-teal-950">
              {executiveDashboardPermissionMatrixRows.map((row) => {
                const permissionSignal = getDashboardPermissionSignal(
                  permissions,
                  row.runtimeSignal,
                );

                return (
                  <article
                    key={row.code}
                    className="grid gap-2 rounded-md border border-teal-100 bg-white p-3 md:grid-cols-[0.75fr_1fr_1fr_1.15fr_1.1fr_1.3fr_auto]"
                  >
                    <div className="min-w-0">
                      <p className="font-mono font-semibold text-teal-700">
                        {row.code}
                      </p>
                      <p className="mt-1 break-words font-semibold">
                        {row.roleLane}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-teal-700">Surface</p>
                      <p className="mt-1 break-words">{row.routeSurface}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-teal-700">Permission</p>
                      <p className="mt-1 break-words font-mono">
                        {row.requiredPermission}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-teal-700">
                        Runtime signal
                      </p>
                      <p className="mt-1 break-words font-mono">
                        {row.runtimeSignal}
                      </p>
                    </div>
                    <div className="min-w-0 rounded-md bg-teal-50 p-2 ring-1 ring-teal-100">
                      <p className="font-medium text-teal-700">Current</p>
                      <p className="mt-1 break-words font-mono">
                        {permissionSignal}
                      </p>
                    </div>
                    <div className="min-w-0 rounded-md bg-amber-50 p-2 ring-1 ring-amber-100">
                      <p className="font-medium text-amber-700">Stop</p>
                      <p className="mt-1 break-words font-mono text-amber-800">
                        {row.stopRule}
                      </p>
                    </div>
                    <Link
                      href={withAdmissionSegmentParam(
                        getDashboardPermissionHref(row, permissions),
                        activeSegmentId,
                      )}
                      aria-label={`Mo ${row.code}`}
                      title={`Mo ${row.code}`}
                      className="flex size-9 shrink-0 items-center justify-center self-start rounded-md border border-teal-100 bg-teal-50 text-teal-700 transition hover:border-teal-300 hover:bg-white hover:text-teal-950"
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-indigo-200 bg-indigo-50/60 p-3"
          data-heu-executive-department-role-lane-map="STD-32_EXECUTIVE_DEPARTMENT_ROLE_LANE_MAP"
          data-heu-executive-department-role-lane-boundary="PASS_LOCAL_DEPARTMENT_ROLE_LANE_MAP READ_ONLY EXECUTIVE_OVERSIGHT NO_ACCESS_GRANT NO_PERMISSION_EXPANSION NO_ACCOUNT_CREATE NO_ROLE_ASSIGNMENT NO_FINANCE_EXECUTION NO_LEGAL_CONCLUSION NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-department-role-lane-overflow-guard="STD-32_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-indigo-700">
                STD-32 Department role lane map
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-indigo-950">
                BGH xem dung nguoi dung viec theo tung phong ban
              </h4>
              <p className="mt-1 max-w-3xl break-words text-xs leading-5 text-indigo-900">
                Map nay chi la executive oversight read-only: khong tao tai
                khoan, khong gan role, khong mo scope va khong thay the P6-04
                signed role/scope UAT.
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-indigo-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-indigo-800">
              P6-04_PENDING
            </span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <div className="grid min-w-[1040px] gap-2 text-xs leading-5 text-indigo-950">
              {HEU_DEPARTMENT_ROLE_LANE_MAP.map((lane) => (
                <article
                  key={lane.code}
                  className="grid gap-2 rounded-md border border-indigo-100 bg-white p-3 md:grid-cols-[0.8fr_1fr_1.2fr_1.3fr_1.2fr]"
                >
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-indigo-700">
                      {lane.code}
                    </p>
                    <p className="mt-1 break-words font-semibold">
                      {lane.label}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-indigo-600">Owner lane</p>
                    <p className="mt-1 break-words">{lane.accountableLane}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-indigo-600">Operating scope</p>
                    <p className="mt-1 break-words">{lane.operatingScope}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-indigo-600">Evidence</p>
                    <p className="mt-1 break-words">{lane.requiredEvidence}</p>
                  </div>
                  <div className="min-w-0 rounded-md bg-indigo-50 p-2 ring-1 ring-indigo-100">
                    <p className="font-medium text-indigo-700">Stop</p>
                    <p className="mt-1 break-words font-mono">
                      {lane.forbiddenScope}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {executiveRoleScopeDecisionRows.map((row) => (
            <article
              key={row.code}
              className="flex min-h-52 min-w-0 flex-col rounded-md border border-zinc-200 bg-zinc-50 p-3"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-zinc-500">
                    {row.code}
                  </p>
                  <h4 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                    {row.label}
                  </h4>
                </div>
                <Link
                  href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                  aria-label={`Mo ${row.code}`}
                  title={`Mo ${row.code}`}
                  className="shrink-0 rounded-md border border-zinc-200 bg-white p-2 text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-950"
                >
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="mt-3 rounded-md bg-white p-2 text-xs leading-5 ring-1 ring-zinc-200">
                <p className="font-medium text-zinc-500">Owner</p>
                <p className="mt-1 break-words text-zinc-800">{row.ownerLane}</p>
              </div>
              <p className="mt-3 break-words text-xs leading-5 text-zinc-600">
                {row.requiredProof}
              </p>
              <p className="mt-auto pt-3 break-words font-mono text-xs leading-5 text-amber-700">
                {row.stopRule}
              </p>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {showFocusedSection("legal") ? (
      <section
        id="executive-legal-sop"
        className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm sm:p-4"
        data-heu-executive-legal-sop-queue="STD-04_LEGAL_SOP_OWNER_ACTION_QUEUE"
        data-heu-executive-legal-sop-boundary="DRAFT_CONTROL NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_OWNER_APPROVAL NO_ACCESS_GRANT NO_FINANCE_ACTION NO_PRODUCTION_GO"
        data-heu-executive-legal-sop-overflow-guard="STD-04_NO_OVERFLOW"
      >
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Gavel className="size-4 shrink-0 text-zinc-600" />
              <h3 className="break-words text-base font-semibold text-zinc-950">
                Legal/SOP owner action
              </h3>
            </div>
            <p className="mt-1 max-w-3xl break-words text-sm leading-6 text-zinc-500">
              Hang cho nay chi gom viec can PHAP_CHE, KHTC, Audit, IT_DATA
              hoac owner xac nhan ben ngoai Codex/chat. Day la DRAFT_CONTROL:
              khong phat hanh SOP, khong ket luan phap ly, khong mo quyen,
              khong duyet tai chinh va khong mark production GO.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/tchc/legal-gates">
              <Gavel className="size-4" />
              Mo legal gates
            </Link>
          </Button>
        </div>
        <div
          className="mt-4 rounded-md border border-orange-200 bg-orange-50/40 p-3"
          data-heu-executive-legal-sop-required-answer-index="STD-34_EXECUTIVE_LEGAL_SOP_REQUIRED_ANSWER_INDEX"
          data-heu-executive-legal-sop-required-answer-boundary="DRAFT_CONTROL PASS_LOCAL_LEGAL_SOP_REQUIRED_ANSWER_INDEX REQUIRED_ANSWER_INDEX PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-legal-sop-required-answer-overflow-guard="STD-34_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-orange-700">
                STD-34 Required-answer index
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-orange-950">
                Moi nghiep vu phai tra loi du 7 cau hoi truoc khi reliance
              </h4>
              <p className="mt-1 max-w-4xl break-words text-xs leading-5 text-orange-900">
                Bang nay la muc luc nhanh cho BGH: can cu phap ly, SOP, maker,
                checker, approver, chung tu va signer. Neu thieu mot cot thi
                giu NO_GO/BLOCKED, khong ket luan phap ly va khong ra lenh tai
                chinh.
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-orange-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-orange-800">
              REQUIRED_ANSWER_INDEX
            </span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <div className="grid min-w-[1180px] gap-2 text-xs leading-5 text-orange-950">
              {executiveLegalSopRequiredAnswerIndexRows.map((row) => (
                <article
                  key={row.code}
                  className="grid gap-2 rounded-md border border-orange-100 bg-white p-3 md:grid-cols-[0.7fr_1fr_1fr_1.1fr_1.2fr_1.2fr_1.1fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-orange-700">
                      {row.code}
                    </p>
                    <p className="mt-1 break-words font-semibold text-zinc-950">
                      {row.workflow}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-orange-700">Can cu</p>
                    <p className="mt-1 break-words">{row.legalBasis}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-orange-700">SOP</p>
                    <p className="mt-1 break-words">{row.sopRoute}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-orange-700">
                      Maker/checker/approver
                    </p>
                    <p className="mt-1 break-words">
                      {row.makerCheckerApprover}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-orange-700">
                      Chung tu / signer
                    </p>
                    <p className="mt-1 break-words">{row.evidenceSigner}</p>
                  </div>
                  <div className="min-w-0 rounded-md bg-orange-50 p-2 ring-1 ring-orange-100">
                    <p className="font-medium text-orange-700">Stop</p>
                    <p className="mt-1 break-words font-mono">
                      {row.stopRule}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-md bg-zinc-50 p-2 ring-1 ring-zinc-100">
                    <p className="font-medium text-zinc-500">Boundary</p>
                    <p className="mt-1 break-words font-mono text-zinc-700">
                      PHAP_CHE_REVIEW_REQUIRED / NO_OFFICIAL_SOP
                    </p>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="h-fit shrink-0 rounded-md border border-orange-100 bg-white p-2 text-orange-700 transition hover:border-orange-300 hover:text-orange-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-orange-200 bg-white p-3"
          data-heu-executive-legal-sop-evidence-authority-queue="STD-40_EXECUTIVE_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE"
          data-heu-executive-legal-sop-evidence-authority-boundary="DRAFT_CONTROL PASS_LOCAL_LEGAL_SOP_EVIDENCE_AUTHORITY_QUEUE EVIDENCE_AUTHORITY_QUEUE PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED OWNER_SIGNOFF_PENDING NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_DASHBOARD_RELIANCE NO_REPORT_VIEW_RELIANCE NO_RAW_EVIDENCE_MOVEMENT NO_EVIDENCE_ACCEPTANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-legal-sop-evidence-authority-overflow-guard="STD-40_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-orange-700">
                STD-40 Evidence-authority queue
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-orange-950">
                Hang cho thieu bang chung va tham quyen truoc khi nghiep vu duoc tin cay
              </h4>
              <p className="mt-1 max-w-4xl break-words text-xs leading-5 text-orange-900">
                BGH chi xem queue nay de dieu phoi nguoi phu trach: PHAP_CHE,
                SOP owner, maker/checker/approver, Audit, IT_DATA va signer ben
                ngoai he thong. Khong phat hanh SOP, khong ket luan phap ly,
                khong duyet tai chinh, khong chap nhan evidence/UAT va khong
                owner GO.
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 font-mono text-[11px] font-semibold text-orange-800">
              EVIDENCE_AUTHORITY_QUEUE
            </span>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
            {executiveLegalSopEvidenceAuthorityQueueRows.map((row) => (
              <article
                key={row.code}
                className="flex min-h-64 min-w-0 flex-col rounded-md border border-orange-100 bg-orange-50/40 p-3"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-orange-700">
                      {row.code}
                    </p>
                    <h5 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                      {row.queue}
                    </h5>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="shrink-0 rounded-md border border-orange-100 bg-white p-2 text-orange-700 transition hover:border-orange-300 hover:text-orange-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="mt-3 rounded-md bg-white p-2 text-xs leading-5 ring-1 ring-orange-100">
                  <p className="font-medium text-orange-700">Owner lane</p>
                  <p className="mt-1 break-words text-zinc-800">
                    {row.ownerLane}
                  </p>
                </div>
                <div className="mt-2 grid gap-2 text-xs leading-5 text-zinc-700">
                  <div className="min-w-0 rounded-md bg-white p-2 ring-1 ring-orange-100">
                    <p className="font-medium text-orange-700">
                      Cau tra loi con thieu
                    </p>
                    <p className="mt-1 break-words">{row.missingAnswer}</p>
                  </div>
                  <div className="min-w-0 rounded-md bg-white p-2 ring-1 ring-orange-100">
                    <p className="font-medium text-orange-700">
                      Bang chung / tham quyen
                    </p>
                    <p className="mt-1 break-words">{row.evidenceAuthority}</p>
                  </div>
                  <div className="min-w-0 rounded-md bg-white p-2 ring-1 ring-orange-100">
                    <p className="font-medium text-orange-700">Control tiep</p>
                    <p className="mt-1 break-words">{row.nextControl}</p>
                  </div>
                </div>
                <p className="mt-auto pt-3 break-words font-mono text-xs leading-5 text-amber-900">
                  {row.stopRule}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div
          className="mt-4 rounded-md border border-amber-200 bg-white p-3"
          data-heu-executive-legal-sop-triage="STD-25_EXECUTIVE_LEGAL_SOP_TRIAGE"
          data-heu-executive-legal-sop-triage-boundary="DRAFT_CONTROL PASS_LOCAL_LEGAL_SOP_TRIAGE PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_APPROVAL_ACTION NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-legal-sop-triage-overflow-guard="STD-25_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-amber-700">
                STD-25 Legal/SOP triage
              </p>
              <h4 className="mt-1 break-words text-sm font-semibold text-amber-950">
                BGH kiểm xương sống pháp chế/SOP trước khi dựa vào nghiệp vụ
              </h4>
            </div>
            <span className="w-fit shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-[11px] font-semibold text-amber-800">
              NO_LEGAL_ADVICE
            </span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            {executiveLegalSopTriageRows.map((row) => (
              <article
                key={row.code}
                className="flex min-h-44 min-w-0 flex-col rounded-md border border-amber-100 bg-amber-50/50 p-3"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-amber-700">
                      {row.code}
                    </p>
                    <h5 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                      {row.label}
                    </h5>
                  </div>
                  <Link
                    href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                    aria-label={`Mo ${row.code}`}
                    title={`Mo ${row.code}`}
                    className="shrink-0 rounded-md border border-amber-100 bg-white p-2 text-amber-700 transition hover:border-amber-300 hover:text-amber-950"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
                <p className="mt-3 break-words text-xs font-medium leading-5 text-amber-800">
                  {row.ownerLane}
                </p>
                <p className="mt-2 break-words text-xs leading-5 text-zinc-600">
                  {row.requiredProof}
                </p>
                <p className="mt-auto pt-3 break-words font-mono text-xs leading-5 text-amber-900">
                  {row.stopRule}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 p-3"
          data-heu-executive-legal-sop-authority-checklist="STD-14_LEGAL_SOP_AUTHORITY_CHECKLIST"
          data-heu-executive-legal-sop-authority-boundary="DRAFT_CONTROL PHAP_CHE_REVIEW_REQUIRED SOP_OWNER_SIGNOFF_REQUIRED MAKER_CHECKER_APPROVER_REQUIRED CONTROLLED_EVIDENCE_REQUIRED EXTERNAL_SIGNOFF_REQUIRED NO_LEGAL_ADVICE NO_OFFICIAL_SOP NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"
          data-heu-executive-legal-sop-authority-overflow-guard="STD-14_NO_OVERFLOW"
        >
          <div className="flex min-w-0 items-center gap-2">
            <ClipboardCheck className="size-4 shrink-0 text-amber-700" />
            <h4 className="truncate text-sm font-semibold text-amber-950">
              Authority checklist
            </h4>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {legalSopAuthorityChecks.map((item) => (
              <article
                key={item.code}
                className="min-w-0 rounded-md border border-amber-200 bg-white p-3"
              >
                <p className="font-mono text-xs font-semibold text-amber-700">
                  {item.code}
                </p>
                <h5 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                  {item.question}
                </h5>
                <p className="mt-2 break-words text-xs leading-5 text-zinc-600">
                  {item.ownerLane}
                </p>
                <p className="mt-2 break-words text-xs leading-5 text-zinc-700">
                  {item.requiredProof}
                </p>
                <p className="mt-2 break-words text-xs leading-5 text-amber-800">
                  {item.stopRule}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {legalSopActionRows.map((row) => (
            <article
              key={row.code}
              className="flex min-h-48 min-w-0 flex-col rounded-md border border-zinc-200 bg-zinc-50 p-3 sm:p-4"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-zinc-500">
                    {row.code}
                  </p>
                  <h4 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                    {row.module}
                  </h4>
                </div>
                <Link
                  href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                  aria-label={`Mo ${row.code}`}
                  title={`Mo ${row.code}`}
                  className="shrink-0 rounded-md border border-zinc-200 bg-white p-2 text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-950"
                >
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="mt-3 rounded-md bg-white p-2 text-xs leading-5 ring-1 ring-zinc-200">
                <p className="font-medium text-zinc-500">Owner</p>
                <p className="mt-1 break-words text-zinc-800">{row.owner}</p>
              </div>
              <p className="mt-3 break-words text-xs leading-5 text-zinc-600">
                {row.action}
              </p>
              <div className="mt-auto pt-3">
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="break-words font-mono text-xs font-semibold text-amber-900">
                    {row.state}
                  </p>
                  <p className="mt-1 break-words text-xs leading-5 text-amber-800">
                    {row.blocker}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      {showFocusedSection("modules") ? (
      <section
        id="executive-module-maturity"
        className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm sm:p-4"
        data-heu-executive-module-maturity="STD-05_MODULE_MATURITY_ACTION_ROW"
        data-heu-executive-module-maturity-boundary="PASS_LOCAL_UI NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_REPORT_VIEW_RELIANCE NO_FINANCE_ACTION NO_OWNER_GO NO_PRODUCTION_GO"
        data-heu-executive-module-maturity-overflow-guard="STD-05_NO_OVERFLOW"
      >
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FileCheck2 className="size-4 shrink-0 text-zinc-600" />
              <h3 className="break-words text-base font-semibold text-zinc-950">
                M01-M12 maturity action row
              </h3>
            </div>
            <p className="mt-1 max-w-3xl break-words text-sm leading-6 text-zinc-500">
              Moi module co mot trang thai ngan va mot viec owner can lam tiep.
              Hang nay chi de dieu huong PASS_LOCAL, khong chap nhan UAT,
              khong nhan evidence, khong reliance report-view, khong duyet tai
              chinh, khong owner GO va khong production GO.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/master-control">
              <FileCheck2 className="size-4" />
              Mo module control
            </Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {moduleMaturityRows.map((row) => (
            <Link
              key={row.code}
              href={withAdmissionSegmentParam(row.href, activeSegmentId)}
              aria-label={`Mo module ${row.code}`}
              title={`Mo module ${row.code}`}
              className="group flex min-h-36 min-w-0 flex-col rounded-md border border-zinc-200 bg-zinc-50 p-3 transition hover:border-zinc-400 hover:bg-white"
            >
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-zinc-500">
                    {row.code}
                  </p>
                  <h4 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                    {row.label}
                  </h4>
                </div>
                <ArrowRight className="size-4 shrink-0 text-zinc-300 transition group-hover:text-zinc-900" />
              </div>
              <span className="mt-3 inline-flex max-w-full self-start rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-xs font-medium text-zinc-700">
                {row.status}
              </span>
              <p className="mt-3 break-words text-xs leading-5 text-zinc-600">
                {row.ownerAction}
              </p>
            </Link>
          ))}
        </div>
      </section>
      ) : null}

      {showFocusedSection("modules") ? (
      <section
        id="executive-kpis"
        className="scroll-mt-24 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
      >
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div
              className={`mb-4 inline-flex rounded-md border px-2 py-1 text-xs font-medium ${kpi.tone}`}
            >
              {kpi.label}
            </div>
            <p className="text-3xl font-semibold tracking-normal">{kpi.value}</p>
            <p className="mt-2 text-sm text-zinc-500">{kpi.trend}</p>
          </article>
        ))}
      </section>
      ) : null}

      {showFocusedSection("blockers") ? (
      <section
        id="executive-blockers"
        className="scroll-mt-24 grid gap-4 xl:grid-cols-[1fr_380px]"
      >
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="break-words text-base font-semibold">
                Sức khỏe module M01-M12
              </h3>
              <p className="mt-1 break-words text-sm text-zinc-500">
                Tách rõ module mạnh nội bộ, module đang sửa và module còn khóa.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link
                href={
                  permissions.canOpenMasterControl ? "/master-control" : "/reports"
                }
              >
                {permissions.canOpenMasterControl ? (
                  <FileCheck2 className="size-4" />
                ) : (
                  <BarChart3 className="size-4" />
                )}
                {permissions.canOpenMasterControl ? "Master Control" : "Báo cáo"}
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {moduleHealth.map((module) => (
              <article
                key={module.code}
                className="min-w-0 rounded-md border border-zinc-200 bg-zinc-50 p-4"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase text-zinc-500">
                      {module.code}
                    </p>
                    <h4 className="mt-1 truncate text-sm font-semibold text-zinc-950">
                      {module.title}
                    </h4>
                  </div>
                  <span className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
                    {module.status}
                  </span>
                </div>
                <p className="mt-3 break-words text-xs leading-5 text-zinc-600">
                  {module.next}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-4">
            <h3 className="text-base font-semibold">Blocker trọng yếu</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Chưa có chữ ký/evidence thì vẫn NO-GO.
            </p>
          </div>
          <div className="space-y-3 p-4">
            <div
              className="rounded-md border border-rose-200 bg-rose-50/60 p-3"
              data-heu-executive-production-blocker-triage="STD-28_EXECUTIVE_PRODUCTION_BLOCKER_TRIAGE"
              data-heu-executive-production-blocker-boundary="PASS_LOCAL_PRODUCTION_BLOCKER_TRIAGE READ_ONLY BACKUP_RESTORE_PROOF_REQUIRED MIGRATION_ORDER_SIGNOFF_REQUIRED SIGNED_UAT_PENDING OWNER_SIGNOFF_PENDING CONTROLLED_EVIDENCE_REQUIRED NO_UAT_ACCEPTANCE NO_EVIDENCE_ACCEPTANCE NO_FINANCE_RELIANCE NO_LEGAL_CONCLUSION NO_MIGRATION_APPROVAL NO_OWNER_GO NO_PRODUCTION_GO"
              data-heu-executive-production-blocker-overflow-guard="STD-28_NO_OVERFLOW"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between xl:flex-col">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold uppercase text-rose-700">
                    STD-28 Production blocker owner triage
                  </p>
                  <h4 className="mt-1 break-words text-sm font-semibold text-rose-950">
                    BGH kiểm blocker, owner lane và bằng chứng còn thiếu trước
                    khi bàn GO/NO-GO
                  </h4>
                </div>
                <span className="w-fit shrink-0 rounded-md border border-rose-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-rose-800">
                  OWNER_SIGNOFF_PENDING
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                {productionBlockerTriageRows.map((row) => (
                  <article
                    key={row.code}
                    className="flex min-h-44 min-w-0 flex-col rounded-md border border-rose-100 bg-white p-3"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-rose-700">
                          {row.code}
                        </p>
                        <h5 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                          {row.label}
                        </h5>
                      </div>
                      <Link
                        href={withAdmissionSegmentParam(row.href, activeSegmentId)}
                        aria-label={`Mo ${row.code}`}
                        title={`Mo ${row.code}`}
                        className="shrink-0 rounded-md border border-rose-100 bg-rose-50 p-2 text-rose-700 transition hover:border-rose-300 hover:bg-white hover:text-rose-950"
                      >
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                    <p className="mt-3 break-words text-xs font-semibold uppercase leading-5 text-rose-900">
                      {row.ownerLane}
                    </p>
                    <p className="mt-2 break-words text-xs leading-5 text-zinc-600">
                      {row.requiredProof}
                    </p>
                    <p className="mt-auto pt-3 break-words font-mono text-[11px] leading-5 text-rose-800">
                      {row.stopRule}
                    </p>
                  </article>
                ))}
              </div>
            </div>
            {openBlockers.map((blocker) => (
              <div
                key={blocker.code}
                className="rounded-md border border-amber-200 bg-amber-50 p-3"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-amber-950">
                      {blocker.code} · {blocker.title}
                    </p>
                    <p className="mt-1 break-words text-xs leading-5 text-amber-800">
                      {blocker.owner}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
      ) : null}

      {showFocusedSection("modules") ? (
      <section
        id="executive-admissions-signal"
        className="scroll-mt-24 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-4">
            <h3 className="text-base font-semibold">Tín hiệu tuyển sinh</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Tổng lead trong phạm vi hiện tại: {pipelineTotal}.
            </p>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {pipeline.slice(0, 8).map((item) => (
              <div
                key={item.status}
                className="rounded-md border border-zinc-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`size-2.5 rounded-full ${item.color}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.label}
                      </p>
                      <p className="text-xs text-zinc-500">{item.status}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold">{item.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-4">
            <h3 className="text-base font-semibold">Điểm cần xem trong ngày</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Chỉ là tín hiệu điều hành, không thay thế UAT/evidence.
            </p>
          </div>
          <div className="space-y-3 p-4">
            {activities.map((activity) => (
              <div
                key={activity}
                className="flex items-start gap-3 rounded-md bg-zinc-50 p-3"
              >
                <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
                <p className="break-words text-sm text-zinc-700">{activity}</p>
              </div>
            ))}
            <div className="rounded-md border border-zinc-200 bg-white p-3">
              <div className="flex items-start gap-3">
                <ClipboardCheck className="mt-0.5 size-4 text-zinc-600" />
                <p className="break-words text-sm text-zinc-700">
                  Dashboard này không tạo lead, không duyệt chi, không ký UAT
                  và không đánh dấu production GO.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {showFocusedSection("modules") ? segmentOverview : null}
    </div>
  );
}
