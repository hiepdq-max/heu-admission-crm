import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FileCheck2,
  FolderKanban,
  ListChecks,
  Settings2,
  ShieldCheck,
  Upload,
  type LucideIcon,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { firstParam, withAdmissionSegmentParam } from "@/lib/workspace";

type DocumentsPageProps = {
  searchParams?: Promise<{
    segment?: string | string[];
  }>;
};

type DocumentsQuickLink = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const documentStages = [
  {
    code: "01",
    title: "Lead dang cho ho so",
    description: "Mo danh sach lead, loc nhom dang bo sung giay to va xu ly tung lead.",
  },
  {
    code: "02",
    title: "Checklist tren lead",
    description: "Vao chi tiet lead de cap nhat tung giay to bat buoc, thieu, da nhan hoac da kiem.",
  },
  {
    code: "03",
    title: "Chan dieu kien",
    description: "Khong day sang du dieu kien neu checklist bat buoc chua dat va chua co minh chung hop le.",
  },
];

const controlNotes = [
  "Chi luu tham chieu ho so da kiem; khong dua file nhay cam vao Git, Codex hoac chat.",
  "Evidence chinh thuc nam o Master Control/report-view va phai co nguoi phu trach kiem.",
  "PASS_LOCAL chi xac nhan dieu huong va guard hien thi, khong chap nhan UAT hay owner GO.",
];

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedSegmentId = firstParam(resolvedSearchParams.segment);
  const scopedHref = (href: string) =>
    withAdmissionSegmentParam(href, requestedSegmentId);
  const documentQuickLinks: DocumentsQuickLink[] = [
    {
      label: "Danh sach lead",
      description: "Mo lead de vao dung checklist ho so cua tung nguoi hoc.",
      href: scopedHref("/leads?quick=documents"),
      icon: ListChecks,
    },
    {
      label: "Import dau vao",
      description: "Nap danh sach truoc khi doi chieu giay to va trung lead.",
      href: scopedHref("/import"),
      icon: Upload,
    },
    {
      label: "Pipeline ho so",
      description: "Xem nhom cho ho so, da nop ho so va buoc chuyen trang thai.",
      href: scopedHref("/pipeline#pipeline-document-pending"),
      icon: FolderKanban,
    },
    {
      label: "Bao cao/evidence",
      description: "Doi chieu report-view, nguon du lieu va bang chung da kiem.",
      href: scopedHref("/reports"),
      icon: FileCheck2,
    },
    {
      label: "Control ho so",
      description: "Mo Master Control de kiem evidence, SOP va quyet dinh can chan.",
      href: "/master-control",
      icon: ShieldCheck,
    },
    {
      label: "Checklist master",
      description: "Mo cau hinh master cho giay to, nguon lead va luong tuyen sinh.",
      href: scopedHref("/settings#settings-operating-masters"),
      icon: Settings2,
    },
  ];

  return (
    <AppShell
      active="documents"
      title="Ho so nhap hoc"
      description="Mo nhanh lead, checklist, evidence va control truoc khi chot dieu kien."
      workspaceSegmentId={requestedSegmentId}
      workspaceReturnTo={scopedHref("/documents")}
    >
      <div className="min-w-0 space-y-4">
        <section
          className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          data-heu-documents-quick-access="P0-14_DOCUMENTS_QUICK_ACCESS"
          data-heu-documents-quick-open="P0-14_DOCUMENTS_QUICK_OPEN_TOP6"
          data-heu-documents-quick-access-overflow-guard="P0-14_DOCUMENTS_QUICK_ACCESS_NO_OVERFLOW"
          data-heu-documents-anchor-nav="leads import pipeline reports control settings"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
                <ClipboardCheck className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  P0-14 Ho so
                </p>
                <h2 className="mt-1 break-words text-lg font-semibold tracking-normal text-zinc-950">
                  Mo dung viec, kiem dung nguon
                </h2>
                <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-zinc-600">
                  Chon lead, import, pipeline, report hoac control de di thang
                  vao khu can xu ly ma khong trai qua nhieu lop man hinh.
                </p>
              </div>
            </div>
            <span className="inline-flex max-w-full shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600">
              READ_ONLY_NAVIGATION
            </span>
          </div>

          <div className="mt-4 grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {documentQuickLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-label={`Mo nhanh ho so: ${link.label}`}
                  title={`Mo nhanh ho so: ${link.label}`}
                  className="group flex min-h-24 min-w-0 items-center justify-between gap-3 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3 transition hover:border-zinc-400 hover:bg-white"
                >
                  <span className="flex min-w-0 items-center gap-3 overflow-hidden">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white text-zinc-700 ring-1 ring-zinc-200">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-zinc-950">
                        {link.label}
                      </span>
                      <span className="mt-1 block line-clamp-2 break-words text-xs leading-5 text-zinc-500">
                        {link.description}
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-zinc-300 opacity-0 transition group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </section>

        <section
          id="documents-intake-flow"
          className="grid min-w-0 gap-4 xl:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex min-w-0 items-center gap-2">
              <ListChecks className="size-4 shrink-0 text-zinc-500" />
              <h2 className="truncate text-sm font-semibold text-zinc-950">
                Luong kiem ho so
              </h2>
            </div>
            <div className="mt-3 grid min-w-0 gap-2 md:grid-cols-3">
              {documentStages.map((stage) => (
                <article
                  key={stage.code}
                  className="min-w-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 p-3"
                >
                  <span className="inline-flex rounded-md bg-white px-2 py-1 text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200">
                    {stage.code}
                  </span>
                  <h3 className="mt-3 break-words text-sm font-semibold text-zinc-950">
                    {stage.title}
                  </h3>
                  <p className="mt-2 break-words text-xs leading-5 text-zinc-500">
                    {stage.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="min-w-0 overflow-hidden rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex min-w-0 items-center gap-2 text-amber-800">
              <ShieldCheck className="size-4 shrink-0" />
              <h2 className="truncate text-sm font-semibold">Ranh gioi an toan</h2>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-amber-900">
              {controlNotes.map((note) => (
                <li key={note} className="break-words">
                  {note}
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
