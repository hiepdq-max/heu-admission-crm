import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileClock,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  mockHomeProfiles,
  type HomeLane,
  type MockHomeProfile,
} from "@/lib/role-based-home-mock";

type RoleBasedHomeProps = {
  profile: MockHomeProfile;
};

const laneIcons = [ClipboardCheck, FileClock, BarChart3];
const laneTones = [
  "border-sky-200 bg-sky-50 text-sky-700",
  "border-amber-200 bg-amber-50 text-amber-700",
  "border-emerald-200 bg-emerald-50 text-emerald-700",
];

function LaneCard({
  lane,
  index,
  profileKey,
}: {
  lane: HomeLane;
  index: number;
  profileKey: MockHomeProfile["key"];
}) {
  const Icon = laneIcons[index];

  return (
    <article
      id={["my-tasks", "confirmations", "reports"][index]}
      className="flex min-h-80 flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`rounded-xl border p-2.5 ${laneTones[index]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-white">
          {lane.count}
        </span>
      </div>
      <h2 className="mt-5 text-lg font-semibold text-zinc-950">{lane.title}</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-500">{lane.description}</p>
      <div className="mt-5 flex-1 space-y-2.5">
        {lane.items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-2.5 rounded-xl bg-zinc-50 px-3 py-2.5"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-zinc-400" />
            <span className="text-sm leading-5 text-zinc-700">{item}</span>
          </div>
        ))}
      </div>
      <Button asChild variant="outline" className="mt-5 h-10 w-full justify-between">
        <Link href={`?role=${profileKey}#${["my-tasks", "confirmations", "reports"][index]}`}>
          Xem danh sách mô phỏng
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </article>
  );
}

export function RoleBasedHome({ profile }: RoleBasedHomeProps) {
  const lanes = [profile.lanes.myTasks, profile.lanes.confirmations, profile.lanes.reports];

  return (
    <main
      className="min-h-screen bg-zinc-100 text-zinc-950"
      data-heu-role-home="HEU-UX-001"
      data-heu-data-source="MOCK_METADATA_ONLY"
      data-heu-control-mode={profile.isControlRole ? "READ_ONLY" : "DEPARTMENT_SCOPED"}
    >
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white p-5 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-zinc-200 pb-5">
            <div className="grid size-10 place-items-center rounded-xl bg-zinc-950 text-sm font-bold text-white">
              HEU
            </div>
            <div>
              <p className="font-semibold">HEU Workspace</p>
              <p className="text-xs text-zinc-500">Vận hành theo phòng ban</p>
            </div>
          </div>
          <nav className="mt-6 space-y-1" aria-label="Điều hướng trang chủ">
            {[
              { label: "Trang chủ", href: "#top", icon: LayoutDashboard },
              { label: profile.lanes.myTasks.title, href: "#my-tasks", icon: ClipboardCheck },
              { label: profile.lanes.confirmations.title, href: "#confirmations", icon: FileClock },
              { label: profile.lanes.reports.title, href: "#reports", icon: BarChart3 },
            ].map(({ label, href, icon: Icon }, index) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  index === 0 ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-emerald-600" />
              Phạm vi an toàn
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Dữ liệu trên màn hình là metadata mô phỏng. Chưa kết nối dữ liệu thật.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1" id="top">
          <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Mở điều hướng">
                  <Menu className="size-4" />
                </Button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{profile.workspaceLabel}</p>
                  <p className="truncate text-xs text-zinc-500">{profile.roleLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" aria-label="Thông báo mô phỏng">
                  <Bell className="size-4" />
                </Button>
                <div className="grid size-8 place-items-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
                  {profile.isControlRole ? "QT" : "NV"}
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="grid gap-6 p-5 sm:p-7 xl:grid-cols-[1fr_auto] xl:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Metadata mô phỏng
                    </span>
                    {profile.isControlRole ? (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-xs text-zinc-600">
                        {profile.roleCode} · {profile.workspaceCode}
                      </span>
                    ) : null}
                  </div>
                  <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Xin chào, {profile.roleLabel}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
                    {profile.greeting}. Màn hình chỉ hiển thị công việc và báo cáo đúng không gian của bạn.
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-zinc-950 p-4 text-white xl:min-w-72">
                  <Building2 className="size-8 shrink-0 text-zinc-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-400">Không gian đang xem</p>
                    <p className="mt-1 truncate text-sm font-semibold">{profile.workspaceLabel}</p>
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="demo-role-heading">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 id="demo-role-heading" className="text-sm font-semibold">Chế độ xem thử theo vai trò</h2>
                  <p className="mt-1 text-xs text-zinc-500">Chỉ dùng cho kiểm tra UX local.</p>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {mockHomeProfiles.map((item) => (
                  <Button
                    key={item.key}
                    asChild
                    variant={item.key === profile.key ? "default" : "outline"}
                    className="h-9 shrink-0"
                  >
                    <Link href={`/?role=${item.key}`}>{item.workspaceLabel}</Link>
                  </Button>
                ))}
              </div>
            </section>

            {profile.isControlRole ? (
              <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 sm:p-6" data-heu-master-control="READ_ONLY">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-white p-2.5 text-indigo-700 shadow-sm">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-indigo-950">Master Control</h2>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-indigo-700">Chỉ xem</span>
                      </div>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-indigo-800/75">
                        Admin/BGH theo dõi trạng thái module, quyền và cảnh báo. Không có thao tác duyệt, ghi dữ liệu hoặc mở production trên trang chủ này.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="h-10 border-indigo-200 bg-white text-indigo-800" disabled>
                    Mở sau khi kết nối quyền thật
                  </Button>
                </div>
              </section>
            ) : null}

            <section className="grid gap-4 xl:grid-cols-3" aria-label="Các vùng làm việc theo vai trò">
              {lanes.map((lane, index) => (
                <LaneCard
                  key={lane.title}
                  lane={lane}
                  index={index}
                  profileKey={profile.key}
                />
              ))}
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-zinc-100 p-2.5">
                    <UserRound className="size-5 text-zinc-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Bạn chỉ thấy dữ liệu thuộc phòng của mình</h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                      Prototype này không đọc database, không thay đổi phân quyền và không hiển thị mã kỹ thuật cho user phòng ban.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                  Kiểm soát theo role/workspace
                  <ChevronRight className="size-4" />
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
