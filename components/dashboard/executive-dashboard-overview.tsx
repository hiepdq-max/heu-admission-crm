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

type ExecutiveLegalSopAction = {
  code: string;
  module: string;
  owner: string;
  state: string;
  action: string;
  blocker: string;
  href: string;
};

type ExecutiveModuleMaturity = {
  code: string;
  label: string;
  status: string;
  ownerAction: string;
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

export function ExecutiveDashboardOverview({
  roleCode,
  activeSegmentId,
  activeSegmentLabel,
  kpis,
  pipeline,
  activities,
  permissions,
  segmentOverview,
}: ExecutiveDashboardOverviewProps) {
  const quickLinks = buildQuickLinks(activeSegmentId, permissions);
  const pipelineTotal = pipeline.reduce((sum, item) => sum + item.count, 0);
  const openBlockers = PRODUCTION_BLOCKERS.slice(0, 6);

  return (
    <>
      <section
        className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
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
      </section>

      <section
        className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
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

      <section
        className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
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

      <section
        className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
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
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {legalSopActionRows.map((row) => (
            <article
              key={row.code}
              className="flex min-h-56 min-w-0 flex-col rounded-md border border-zinc-200 bg-zinc-50 p-4"
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

      <section
        className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
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

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="grid gap-3 p-5 md:grid-cols-2">
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
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">Blocker trọng yếu</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Chưa có chữ ký/evidence thì vẫn NO-GO.
            </p>
          </div>
          <div className="space-y-3 p-5">
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

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">Tín hiệu tuyển sinh</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Tổng lead trong phạm vi hiện tại: {pipelineTotal}.
            </p>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-2">
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
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">Điểm cần xem trong ngày</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Chỉ là tín hiệu điều hành, không thay thế UAT/evidence.
            </p>
          </div>
          <div className="space-y-3 p-5">
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

      {segmentOverview}
    </>
  );
}
