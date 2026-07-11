import Link from "next/link";
import {
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileClock,
  LayoutDashboard,
  Menu,
  ShieldCheck,
} from "lucide-react";

import { mockHomeProfiles, type MockHomeProfile } from "@/lib/role-based-home-mock";

type RoleBasedHomeProps = { profile: MockHomeProfile };

const laneIcons = [ClipboardCheck, FileClock, BarChart3];
const laneStyles = [
  "border-blue-200 bg-blue-50 text-blue-700",
  "border-cyan-200 bg-cyan-50 text-cyan-700",
  "border-indigo-200 bg-indigo-50 text-indigo-700",
];
const laneAnchors = ["my-tasks", "confirmations", "reports"];

export function RoleBasedHome({ profile }: RoleBasedHomeProps) {
  return (
    <main
      className="min-h-screen bg-slate-100 text-slate-950"
      data-heu-role-home="HEU-UX-001-V3"
      data-heu-data-source="MOCK_METADATA_ONLY"
      data-heu-control-mode={profile.isControlRole ? "READ_ONLY" : "DEPARTMENT_SCOPED"}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-blue-100 bg-white p-5 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-blue-100 pb-5">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-700 text-sm font-bold text-white shadow-sm shadow-blue-200">HEU</span>
            <div>
              <p className="font-semibold">HEU Workspace</p>
              <p className="text-xs text-slate-500">Vận hành theo phòng ban</p>
            </div>
          </div>
          <nav className="mt-6 space-y-1" aria-label="Điều hướng trang chủ">
            <Link href="#top" className="flex items-center gap-3 rounded-xl bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200">
              <LayoutDashboard className="size-4" /> Trang chủ
            </Link>
            {profile.lanes.map((lane, index) => {
              const Icon = laneIcons[index];
              return (
                <Link key={lane.title} href={`#${laneAnchors[index]}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-800">
                  <Icon className="size-4" /> {lane.title}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-slate-600">
            <p className="flex items-center gap-2 font-semibold text-blue-900"><ShieldCheck className="size-4 text-blue-700" /> Phạm vi an toàn</p>
            <p className="mt-2">Chỉ dùng metadata mô phỏng. Chưa kết nối dữ liệu thật.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1" id="top">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-blue-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button className="grid size-9 place-items-center rounded-lg border border-blue-200 text-blue-800 lg:hidden" aria-label="Mở điều hướng"><Menu className="size-4" /></button>
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{profile.workspaceLabel}</p><p className="truncate text-xs text-slate-500">{profile.roleLabel}</p></div>
            </div>
            <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-lg border border-blue-200 text-blue-800"><Bell className="size-4" /></span><span className="grid size-8 place-items-center rounded-full bg-blue-700 text-xs font-semibold text-white">{profile.isControlRole ? "QT" : "NV"}</span></div>
          </header>

          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100 sm:p-7">
              <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">● MOCK METADATA</span>
                    {profile.isControlRole ? <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">{profile.roleCode} · {profile.workspaceCode}</span> : null}
                  </div>
                  <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Xin chào, {profile.roleLabel}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Màn hình chỉ hiển thị công việc và báo cáo đúng không gian của bạn.</p>
                </div>
                <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-blue-950 p-4 text-white shadow-lg shadow-blue-200 xl:min-w-72"><Building2 className="size-8 shrink-0 text-blue-300" /><div className="min-w-0"><p className="text-xs text-blue-300">WORKSPACE ACTIVE</p><p className="mt-1 truncate text-sm font-semibold">{profile.workspaceLabel}</p></div></div>
              </div>
            </section>

            <section aria-labelledby="mock-role-switcher">
              <h2 id="mock-role-switcher" className="text-sm font-semibold">Chế độ xem thử theo vai trò</h2>
              <p className="mt-1 text-xs text-slate-500">Chỉ dùng cho kiểm tra UX local.</p>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {mockHomeProfiles.map((item) => <Link key={item.key} href={`/?role=${item.key}`} className={`h-10 shrink-0 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${item.key === profile.key ? "border-blue-700 bg-blue-700 text-white shadow-sm shadow-blue-200" : "border-blue-200 bg-white text-blue-800 hover:bg-blue-50"}`}>{item.workspaceLabel}</Link>)}
              </div>
            </section>

            {profile.isControlRole ? (
              <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6" data-heu-master-control="READ_ONLY">
                <div className="flex items-start gap-3"><span className="rounded-xl bg-white p-2.5 text-blue-700 shadow-sm"><ShieldCheck className="size-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-blue-950">Master Control</h2><span className="rounded-full bg-blue-700 px-2 py-0.5 text-xs font-semibold text-white">READ ONLY</span></div><p className="mt-1 text-sm leading-6 text-blue-900/75">Admin/BGH theo dõi trạng thái và cảnh báo; không duyệt, ghi dữ liệu hoặc mở production tại đây.</p></div></div>
              </section>
            ) : null}

            <section className="grid gap-4 xl:grid-cols-3" aria-label="Các vùng làm việc theo vai trò">
              {profile.lanes.map((lane, index) => {
                const Icon = laneIcons[index];
                return (
                  <article key={lane.title} id={laneAnchors[index]} className="flex min-h-80 flex-col rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100">
                    <div className="flex items-start justify-between"><span className={`rounded-xl border p-2.5 ${laneStyles[index]}`}><Icon className="size-5" /></span><span className="rounded-full bg-blue-950 px-2.5 py-1 text-xs font-semibold text-white">{lane.items.length}</span></div>
                    <h2 className="mt-5 text-lg font-semibold">{lane.title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{lane.description}</p>
                    <div className="mt-5 flex-1 space-y-2.5">{lane.items.map((item) => <div key={item} className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-600" /><span className="text-sm leading-5 text-slate-700">{item}</span></div>)}</div>
                    <Link href={`?role=${profile.key}#${laneAnchors[index]}`} className="mt-5 flex h-10 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-800">MỞ DANH SÁCH</Link>
                  </article>
                );
              })}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
