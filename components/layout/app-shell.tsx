import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BookOpenCheck,
  CalendarClock,
  ChevronDown,
  ClipboardCheck,
  Database,
  Archive,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Gavel,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Plus,
  Route,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  BarChart3,
  Handshake,
  LogOut,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { logoutAction } from "@/app/login/actions";
import { AdmissionWorkspaceSwitcher } from "@/components/layout/admission-workspace-switcher";
import { Button } from "@/components/ui/button";
import { isExecutiveRole } from "@/lib/executive-roles";
import { createClient } from "@/lib/supabase/server";
import {
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type AppShellProps = {
  active: string;
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  workspaceSegmentId?: string | null;
  workspaceReturnTo?: string;
};

type WorkspaceQuickLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  navKey?: string;
  tone?: "primary" | "default";
};

type NavigationGroupKey = "quick" | "admission" | "finance" | "control";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  key: string;
  group: NavigationGroupKey;
  permission?: string;
  permissions?: string[];
  allowedRoleCodes?: string[];
  adminOnly?: boolean;
};

const navigationGroups: Array<{ key: NavigationGroupKey; label: string }> = [
  { key: "quick", label: "Lối vào nhanh" },
  { key: "admission", label: "Nghiệp vụ tuyển sinh" },
  { key: "finance", label: "Tài chính và báo cáo" },
  { key: "control", label: "Kiểm soát hệ thống" },
];

const HEU_APP_SHELL_ADMISSION_ROLE_CODES = [
  "TUYEN_SINH",
  "ADMISSION_HEAD",
  "TEAM_LEAD",
  "COUNSELOR",
];
const HEU_APP_SHELL_CTHSSV_ROLE_CODES = ["CTHSSV", "CTHSSV_LEAD"];
const HEU_APP_SHELL_TRAINING_ROLE_CODES = [
  "DAO_TAO",
  "KHOA",
  "KHOA_BO_MON",
  "NGAN_HAN",
  "HR",
];
const HEU_APP_SHELL_FINANCE_ROLE_CODES = [
  "KHTC",
  "ACCOUNTING",
  "ACCOUNTING_LEAD",
];
const HEU_APP_SHELL_CONTROL_ROLE_CODES = [
  "BGH",
  "IT_DATA",
  "AUDIT",
  "PHAP_CHE",
];
const HEU_APP_SHELL_LEAD_READ_PERMISSIONS = [
  "leads.read_all",
  "leads.read_team",
  "leads.read_assigned",
];
const HEU_APP_SHELL_LEAD_WRITE_PERMISSIONS = [
  "leads.write_all",
  "leads.write_team",
  "leads.write_assigned",
];
const HEU_APP_SHELL_DOCUMENT_PERMISSIONS = [
  "documents.manage",
  "documents.manage_team",
  "documents.read_assigned",
];
const HEU_APP_SHELL_REPORT_PERMISSIONS = [
  "reports.read_all",
  "reports.read_team",
  "reports.read_scope",
  "ttgdtx.report.read",
  "finance_desk.read",
];
const HEU_APP_SHELL_TASK_CENTER_PERMISSIONS = [
  ...HEU_APP_SHELL_LEAD_READ_PERMISSIONS,
  ...HEU_APP_SHELL_LEAD_WRITE_PERMISSIONS,
  ...HEU_APP_SHELL_DOCUMENT_PERMISSIONS,
  ...HEU_APP_SHELL_REPORT_PERMISSIONS,
  "activities.create",
  "handover.create",
  "handover.accept_cthssv",
  "handover.accept_accounting",
  "audit.read",
  "master_control.check",
];
const HEU_APP_SHELL_ADMISSION_NAV_PERMISSIONS = [
  ...HEU_APP_SHELL_LEAD_READ_PERMISSIONS,
  ...HEU_APP_SHELL_LEAD_WRITE_PERMISSIONS,
  "leads.import",
  "activities.create",
  "pipeline.manage",
  "pipeline.manage_team",
];
const HEU_APP_SHELL_CONTROL_REVIEW_PERMISSIONS = [
  "audit.read",
  "master_control.read",
  "master_control.check",
];
const HEU_APP_SHELL_ALL_WORK_ROLE_CODES = [
  ...HEU_APP_SHELL_ADMISSION_ROLE_CODES,
  ...HEU_APP_SHELL_CTHSSV_ROLE_CODES,
  ...HEU_APP_SHELL_TRAINING_ROLE_CODES,
  ...HEU_APP_SHELL_FINANCE_ROLE_CODES,
  ...HEU_APP_SHELL_CONTROL_ROLE_CODES,
];

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    key: "dashboard",
    group: "quick",
  },
  {
    label: "Tìm kiếm",
    href: "/search",
    icon: Search,
    key: "search",
    group: "quick",
  },
  {
    label: "Đối tượng TS",
    href: "/segments",
    icon: Route,
    key: "segments",
    group: "quick",
  },
  {
    label: "Lead tuyển sinh",
    href: "/leads",
    icon: Users,
    key: "leads",
    group: "quick",
    permissions: HEU_APP_SHELL_ADMISSION_NAV_PERMISSIONS,
    allowedRoleCodes: HEU_APP_SHELL_ADMISSION_ROLE_CODES,
  },
  {
    label: "Viec cua toi",
    href: "/data-confirmation",
    icon: ClipboardCheck,
    key: "data-confirmation",
    group: "quick",
    permissions: HEU_APP_SHELL_TASK_CENTER_PERMISSIONS,
    allowedRoleCodes: HEU_APP_SHELL_ALL_WORK_ROLE_CODES,
  },
  {
    label: "Ngắn hạn ERP",
    href: "/short-course",
    icon: BookOpenCheck,
    key: "short-course",
    group: "admission",
    permission: "short_course.dashboard.read",
  },
  {
    label: "TTGDTX",
    href: "/ttgdtx",
    icon: Handshake,
    key: "ttgdtx",
    group: "admission",
    permission: "ttgdtx.contract.read",
  },
  {
    label: "Kiểm soát HOU",
    href: "/hou",
    icon: GraduationCap,
    key: "hou",
    group: "admission",
    permissions: ["hou.com.read_sensitive", "hou.com.manage"],
    allowedRoleCodes: [...HEU_APP_SHELL_CONTROL_ROLE_CODES, "KHTC"],
  },
  {
    label: "Khoa/GV",
    href: "/khoa",
    icon: Users,
    key: "khoa",
    group: "admission",
    permissions: HEU_APP_SHELL_CONTROL_REVIEW_PERMISSIONS,
    allowedRoleCodes: [
      ...HEU_APP_SHELL_TRAINING_ROLE_CODES,
      ...HEU_APP_SHELL_CONTROL_ROLE_CODES,
    ],
  },
  {
    label: "CTHSSV",
    href: "/cthssv",
    icon: ClipboardCheck,
    key: "cthssv",
    group: "admission",
    permission: "handover.accept_cthssv",
    allowedRoleCodes: [
      ...HEU_APP_SHELL_CTHSSV_ROLE_CODES,
      ...HEU_APP_SHELL_CONTROL_ROLE_CODES,
    ],
  },
  {
    label: "Pipeline",
    href: "/pipeline",
    icon: ListChecks,
    key: "pipeline",
    group: "admission",
    permissions: [
      ...HEU_APP_SHELL_ADMISSION_NAV_PERMISSIONS,
      "pipeline.manage",
      "pipeline.manage_team",
    ],
    allowedRoleCodes: HEU_APP_SHELL_ADMISSION_ROLE_CODES,
  },
  {
    label: "Hồ sơ nhập học",
    href: "/documents",
    icon: ClipboardCheck,
    key: "documents",
    group: "admission",
    permissions: [
      ...HEU_APP_SHELL_DOCUMENT_PERMISSIONS,
      ...HEU_APP_SHELL_ADMISSION_NAV_PERMISSIONS,
    ],
    allowedRoleCodes: HEU_APP_SHELL_ADMISSION_ROLE_CODES,
  },
  {
    label: "Lịch tư vấn",
    href: "/followups",
    icon: CalendarClock,
    key: "followups",
    group: "admission",
    permissions: [
      "activities.create",
      ...HEU_APP_SHELL_LEAD_READ_PERMISSIONS,
      ...HEU_APP_SHELL_LEAD_WRITE_PERMISSIONS,
    ],
    allowedRoleCodes: HEU_APP_SHELL_ADMISSION_ROLE_CODES,
  },
  {
    label: "Đối tác / CTV",
    href: "/partners",
    icon: Database,
    key: "partners",
    group: "admission",
    permission: "partners.manage",
    allowedRoleCodes: ["ADMISSION_HEAD", "TEAM_LEAD", "IT_DATA"],
  },
  {
    label: "Chiến dịch",
    href: "/campaigns",
    icon: Megaphone,
    key: "campaigns",
    group: "admission",
    permission: "campaigns.manage",
    allowedRoleCodes: ["ADMISSION_HEAD", "TEAM_LEAD", "IT_DATA"],
  },
  {
    label: "Import dữ liệu",
    href: "/import",
    icon: FileSpreadsheet,
    key: "import",
    group: "admission",
    permission: "leads.import",
    allowedRoleCodes: ["ADMISSION_HEAD", "TEAM_LEAD", "IT_DATA"],
  },
  {
    label: "Finance Desk",
    href: "/finance-desk",
    icon: WalletCards,
    key: "finance-desk",
    group: "finance",
    permission: "finance_desk.read",
  },
  {
    label: "Tam ung/TT",
    href: "/finance/advance-payment",
    icon: WalletCards,
    key: "finance-advance-payment",
    group: "finance",
    permission: "finance_desk.read",
  },
  {
    label: "Báo cáo",
    href: "/reports",
    icon: BarChart3,
    key: "reports",
    group: "finance",
    permissions: HEU_APP_SHELL_REPORT_PERMISSIONS,
    allowedRoleCodes: [
      ...HEU_APP_SHELL_FINANCE_ROLE_CODES,
      ...HEU_APP_SHELL_CONTROL_ROLE_CODES,
      ...HEU_APP_SHELL_ADMISSION_ROLE_CODES,
    ],
  },
  {
    label: "Master Control",
    href: "/master-control",
    icon: FileCheck2,
    key: "master-control",
    group: "control",
    permission: "master_control.read",
  },
  {
    label: "TCHC Van thu luu tru",
    href: "/tchc/records-archive",
    icon: Archive,
    key: "tchc-records-archive",
    group: "control",
    permission: "master_control.read",
  },
  {
    label: "TCHC Legal Gates",
    href: "/tchc/legal-gates",
    icon: Gavel,
    key: "tchc-legal-gates",
    group: "control",
    permission: "master_control.read",
  },
  {
    label: "Audit log",
    href: "/audit",
    icon: ShieldCheck,
    key: "audit",
    group: "control",
    permission: "audit.read",
    allowedRoleCodes: ["BGH", "IT_DATA", "AUDIT", "PHAP_CHE"],
  },
  {
    label: "AI Assistant",
    href: "/ai-assistant",
    icon: Bot,
    key: "ai-assistant",
    group: "control",
    permissions: ["audit.read", "master_control.check"],
    allowedRoleCodes: ["BGH", "IT_DATA", "AUDIT"],
  },
  {
    label: "Phạm vi user",
    href: "/settings/scopes",
    icon: ShieldCheck,
    key: "scopes",
    group: "control",
    permissions: [
      "scope.manage_department",
      "users.create",
      "permission_matrix.read",
      "permission_matrix.manage",
    ],
  },
  {
    label: "Cấu hình",
    href: "/settings",
    icon: Settings,
    key: "settings",
    group: "control",
    adminOnly: true,
  },
];

const segmentAwareNavigationKeys = new Set([
  "dashboard",
  "search",
  "short-course",
  "finance-desk",
  "finance-advance-payment",
  "leads",
  "data-confirmation",
  "pipeline",
  "documents",
  "followups",
  "hou",
  "cthssv",
  "reports",
  "import",
]);

function workspaceHref(key: string, href: string, activeSegmentId: string | null) {
  if (!activeSegmentId) {
    return href;
  }

  if (key === "segments") {
    return `/segments/${activeSegmentId}`;
  }

  if (segmentAwareNavigationKeys.has(key)) {
    return withAdmissionSegmentParam(href, activeSegmentId);
  }

  return href;
}

function workspaceHubLink(
  segmentCode: string,
  segmentId: string,
): WorkspaceQuickLink {
  if (segmentCode === "UNIVERSITY_TRANSFER_HOU") {
    return {
      label: "Hub HOU",
      href: withAdmissionSegmentParam("/hou", segmentId),
      icon: GraduationCap,
      navKey: "hou",
    };
  }

  if (segmentCode === "TC9_TTGDTX_LINKED") {
    return {
      label: "Hub TTGDTX",
      href: withAdmissionSegmentParam("/ttgdtx", segmentId),
      icon: Handshake,
      navKey: "ttgdtx",
    };
  }

  if (segmentCode.startsWith("SHORT_")) {
    return {
      label: "ERP ngắn hạn",
      href: withAdmissionSegmentParam("/short-course", segmentId),
      icon: BookOpenCheck,
      navKey: "short-course",
    };
  }

  return {
    label: "Báo cáo",
    href: withAdmissionSegmentParam("/reports", segmentId),
    icon: BarChart3,
    navKey: "reports",
  };
}

function buildWorkspaceQuickLinks(
  segmentId: string | null,
  segmentCode: string | null | undefined,
  visibleNavigationKeys: Set<string>,
  canCreateLead: boolean,
) {
  if (!segmentId) {
    return [];
  }

  const links: WorkspaceQuickLink[] = [
    {
      label: "Workspace",
      href: `/segments/${segmentId}`,
      icon: Route,
      navKey: "segments",
    },
    {
      label: "Lead",
      href: withAdmissionSegmentParam("/leads", segmentId),
      icon: Users,
      navKey: "leads",
      tone: "primary",
    },
    {
      label: "Viec cua toi",
      href: withAdmissionSegmentParam("/data-confirmation", segmentId),
      icon: ClipboardCheck,
      navKey: "data-confirmation",
    },
    {
      label: "Follow-up",
      href: withAdmissionSegmentParam("/followups", segmentId),
      icon: CalendarClock,
      navKey: "followups",
    },
    {
      label: "Hồ sơ",
      href: withAdmissionSegmentParam("/documents", segmentId),
      icon: FileText,
      navKey: "documents",
    },
    {
      label: "Pipeline",
      href: withAdmissionSegmentParam("/pipeline", segmentId),
      icon: ListChecks,
      navKey: "pipeline",
    },
    {
      label: "Import",
      href: withAdmissionSegmentParam("/import", segmentId),
      icon: Upload,
      navKey: "import",
    },
  ];

  if (canCreateLead) {
    links.splice(2, 0, {
      label: "Tạo lead",
      href: withAdmissionSegmentParam("/leads/new", segmentId),
      icon: Plus,
      navKey: "leads",
      tone: "primary",
    });
  }

  if (segmentCode) {
    links.push(workspaceHubLink(segmentCode, segmentId));
  }

  links.push({
    label: "Báo cáo",
    href: withAdmissionSegmentParam("/reports", segmentId),
    icon: BarChart3,
    navKey: "reports",
  });

  return links.filter(
    (link) => !link.navKey || visibleNavigationKeys.has(link.navKey),
  );
}

export async function AppShell({
  active,
  title,
  description,
  actions,
  children,
  workspaceSegmentId,
  workspaceReturnTo = "/segments",
}: AppShellProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userEmail = user?.email ?? null;
  const workspace = user
    ? await getAdmissionWorkspaceContext(supabase, user.id, workspaceSegmentId)
    : null;
  const { data: currentRoleCode } = user
    ? await supabase.rpc("current_user_role_code")
    : { data: null };
  const isExecutive = isExecutiveRole(currentRoleCode);
  const permissionNames = [
    ...new Set(
      navigation
        .flatMap((item) => [
          ...(item.permission ? [item.permission] : []),
          ...(item.permissions ?? []),
        ])
        .filter((permission): permission is string => Boolean(permission)),
    ),
  ];
  const permissionResults = user
    ? await Promise.all(
        permissionNames.map((permission) =>
          supabase.rpc("has_permission", {
            permission_name: permission,
          }),
        ),
      )
    : [];
  const permissionMap = new Map(
    permissionNames.map((permission, index) => [
      permission,
      Boolean(permissionResults[index]?.data),
    ]),
  );
  const visibleNavigation = navigation.filter(
    (item) => {
      if (currentRoleCode === "ADMIN") {
        return true;
      }

      if (item.adminOnly) {
        return false;
      }

      const itemPermissions = [
        ...(item.permission ? [item.permission] : []),
        ...(item.permissions ?? []),
      ];
      const itemRoleCodes = item.allowedRoleCodes ?? [];
      const hasAccessRule = itemPermissions.length > 0 || itemRoleCodes.length > 0;
      const isRoleAllowed = currentRoleCode
        ? itemRoleCodes.includes(currentRoleCode)
        : false;
      const isPermissionAllowed = itemPermissions.some((permission) =>
        permissionMap.get(permission),
      );

      return !hasAccessRule || isRoleAllowed || isPermissionAllowed;
    },
  );
  const visibleNavigationKeys = new Set(
    visibleNavigation.map((item) => item.key),
  );
  const workspaceQuickLinks = buildWorkspaceQuickLinks(
    workspace?.activeSegmentId ?? null,
    workspace?.activeSegment?.segmentCode,
    visibleNavigationKeys,
    !isExecutive &&
      HEU_APP_SHELL_LEAD_WRITE_PERMISSIONS.some((permission) =>
        permissionMap.get(permission),
      ),
  );
  const groupedNavigation = navigationGroups
    .map((group) => ({
      ...group,
      items: visibleNavigation.filter((item) => item.group === group.key),
    }))
    .filter((group) => group.items.length > 0);
  const activeNavigationGroupKey =
    visibleNavigation.find((item) => item.key === active)?.group ?? "quick";

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-zinc-200 bg-white">
          <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white">
              HEU
            </div>
            <div>
              <p className="text-sm font-semibold">Admission CRM</p>
              <p className="text-xs text-zinc-500">Tuyển sinh V01</p>
            </div>
          </div>

          <nav
            className="space-y-5 px-3 py-4"
            data-heu-sidebar-navigation-groups="P0-13_SIDEBAR_NAV_GROUPS"
            data-heu-sidebar-collapsible-groups="P0-13_COLLAPSIBLE_NAV_GROUPS"
            data-heu-app-shell-role-scope-menu="HEU_APP_SHELL_ROLE_SCOPE_MENU"
          >
            {groupedNavigation.map((group) => {
              const isOpenByDefault =
                group.key === "quick" || group.key === activeNavigationGroupKey;

              return (
                <details
                  key={group.key}
                  open={isOpenByDefault}
                  className="group/nav rounded-md"
                >
                  <summary className="flex h-8 cursor-pointer list-none items-center justify-between rounded-md px-2 text-xs font-semibold uppercase tracking-normal text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 [&::-webkit-details-marker]:hidden">
                    <span className="truncate">{group.label}</span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      {group.items.length}
                      <ChevronDown className="size-3.5 transition group-open/nav:rotate-180" />
                    </span>
                  </summary>
                  <div className="mt-1 space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = active === item.key;

                      return (
                        <Button
                          key={item.key}
                          asChild
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full min-w-0 justify-start gap-3 overflow-hidden ${
                            isActive ? "" : "text-zinc-600"
                          }`}
                        >
                          <Link
                            href={workspaceHref(
                              item.key,
                              item.href,
                              workspace?.activeSegmentId ?? null,
                            )}
                          >
                            <Icon className="size-4" />
                            <span className="min-w-0 truncate">{item.label}</span>
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="flex min-h-16 flex-col gap-3 border-b border-zinc-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-semibold tracking-normal">
                {title}
              </h1>
              <p className="mt-1 break-words text-sm text-zinc-500">
                {description}
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {userEmail ? (
                <form
                  action="/search"
                  method="get"
                  className="flex h-8 w-full min-w-0 max-w-full items-center gap-1 overflow-hidden rounded-lg border border-zinc-200 bg-white px-2 sm:w-auto"
                  data-heu-global-quick-access="P1-11_SEARCH"
                  data-heu-global-quick-access-overflow-guard="P1-11_GLOBAL_SEARCH_NO_OVERFLOW"
                >
                  {workspace?.activeSegmentId ? (
                    <input
                      type="hidden"
                      name="segment"
                      value={workspace.activeSegmentId}
                    />
                  ) : null}
                  <Search className="size-4 shrink-0 text-zinc-500" />
                  <input
                    name="q"
                    type="search"
                    placeholder="Tìm HEU OS"
                    className="h-7 w-28 min-w-0 bg-transparent text-sm outline-none placeholder:text-zinc-400 sm:w-40"
                  />
                  <button
                    type="submit"
                    aria-label="Tim kiem HEU OS"
                    title="Tim kiem HEU OS"
                    className="shrink-0 rounded-md px-1.5 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    Tìm
                  </button>
                </form>
              ) : null}
              {actions}
              {userEmail ? (
                <form action={logoutAction} className="flex items-center gap-2">
                  <span className="hidden max-w-48 truncate text-sm text-zinc-500 sm:inline">
                    {userEmail}
                  </span>
                  <Button type="submit" variant="outline">
                    <LogOut className="size-4" />
                    Đăng xuất
                  </Button>
                </form>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
              )}
            </div>
          </header>

          {workspace ? (
            <div className="border-b border-zinc-200 bg-white px-4 py-3 lg:px-8">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase text-zinc-500">
                      P0-13 · Workspace đang làm việc
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-zinc-900">
                      {workspace.activeSegment
                        ? workspace.activeSegment.label
                        : workspace.canSeeAllSegments
                          ? "Tất cả đối tượng tuyển sinh"
                          : "Chưa chọn đối tượng tuyển sinh"}
                    </p>
                    <p className="mt-1 break-words text-xs text-zinc-500">
                      Lead, Pipeline, Lịch tư vấn và Báo cáo sẽ đi theo lựa chọn
                      này.
                    </p>
                  </div>
                  <AdmissionWorkspaceSwitcher
                    options={workspace.segmentOptions}
                    activeSegmentId={workspace.activeSegmentId}
                    canSeeAllSegments={workspace.canSeeAllSegments}
                    returnTo={workspaceReturnTo}
                  />
                </div>
                {workspaceQuickLinks.length > 0 ? (
                  <div
                    className="mt-3 min-w-0 overflow-x-auto pb-1"
                    data-heu-workspace-quick-links="P0-13_WORKSPACE_QUICK_LINKS"
                    data-heu-workspace-quick-open="P0-13_WORKSPACE_QUICK_OPEN_DAILY"
                    data-heu-workspace-quick-links-overflow-guard="P0-13_WORKSPACE_QUICK_LINKS_NO_OVERFLOW"
                    data-heu-workspace-anchor-nav="workspace leads create followups documents pipeline import hub reports"
                  >
                    <div className="flex min-w-max gap-2 pr-1">
                      {workspaceQuickLinks.map((link) => {
                        const Icon = link.icon;
                        const isPrimary = link.tone === "primary";

                        return (
                          <Link
                            key={`${link.label}-${link.href}`}
                            href={link.href}
                            aria-label={`Mở nhanh workspace: ${link.label}`}
                            title={`Mở nhanh workspace: ${link.label}`}
                            className={`group flex h-10 min-w-36 max-w-44 items-center justify-between gap-2 overflow-hidden rounded-md border px-3 text-sm font-medium transition ${
                              isPrimary
                                ? "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800"
                                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-950"
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-2 overflow-hidden">
                              <Icon
                                className={`size-4 shrink-0 ${
                                  isPrimary ? "text-white" : "text-zinc-500"
                                }`}
                              />
                              <span className="min-w-0 truncate">
                                {link.label}
                              </span>
                            </span>
                            <ArrowRight
                              className={`size-4 shrink-0 transition ${
                                isPrimary
                                  ? "text-white/70 group-hover:text-white"
                                  : "text-zinc-400 group-hover:text-zinc-900"
                              }`}
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="space-y-6 p-4 lg:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
