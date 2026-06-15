import Link from "next/link";
import {
  Bot,
  CalendarClock,
  ClipboardCheck,
  Database,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Settings,
  ShieldCheck,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";

import { logoutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type AppShellProps = {
  active: string;
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, key: "dashboard" },
  { label: "Lead tuyển sinh", href: "/leads", icon: Users, key: "leads" },
  { label: "Kiểm soát HOU", href: "/hou", icon: GraduationCap, key: "hou" },
  { label: "Pipeline", href: "/pipeline", icon: ListChecks, key: "pipeline" },
  {
    label: "Hồ sơ nhập học",
    href: "/documents",
    icon: ClipboardCheck,
    key: "documents",
  },
  {
    label: "Lịch tư vấn",
    href: "/followups",
    icon: CalendarClock,
    key: "followups",
  },
  { label: "Đối tác / CTV", href: "/partners", icon: Database, key: "partners" },
  { label: "Chiến dịch", href: "/campaigns", icon: Megaphone, key: "campaigns" },
  { label: "Báo cáo", href: "/reports", icon: BarChart3, key: "reports" },
  {
    label: "Import dữ liệu",
    href: "/import",
    icon: FileSpreadsheet,
    key: "import",
  },
  { label: "Audit log", href: "/audit", icon: ShieldCheck, key: "audit" },
  { label: "AI Assistant", href: "/ai-assistant", icon: Bot, key: "ai-assistant" },
  {
    label: "Phạm vi user",
    href: "/settings/scopes",
    icon: ShieldCheck,
    key: "scopes",
    permission: "scope.manage_department",
  },
  {
    label: "Cấu hình",
    href: "/settings",
    icon: Settings,
    key: "settings",
    adminOnly: true,
  },
];

export async function AppShell({
  active,
  title,
  description,
  actions,
  children,
}: AppShellProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userEmail = user?.email ?? null;
  const { data: currentRoleCode } = user
    ? await supabase.rpc("current_user_role_code")
    : { data: null };
  const { data: canManageScopes } = user
    ? await supabase.rpc("has_permission", {
        permission_name: "scope.manage_department",
      })
    : { data: false };
  const visibleNavigation = navigation.filter(
    (item) =>
      (!item.adminOnly || currentRoleCode === "ADMIN") &&
      (!item.permission || currentRoleCode === "ADMIN" || canManageScopes),
  );

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

          <nav className="space-y-1 px-3 py-4">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;

              return (
                <Button
                  key={item.key}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive ? "" : "text-zinc-600"
                  }`}
                >
                  <Link href={item.href}>
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="flex min-h-16 flex-col gap-3 border-b border-zinc-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <h1 className="text-xl font-semibold tracking-normal">{title}</h1>
              <p className="mt-1 text-sm text-zinc-500">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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

          <div className="space-y-6 p-4 lg:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
