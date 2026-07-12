import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ClipboardCheck,
  LockKeyhole,
  Route,
  ShieldCheck,
} from "lucide-react";

import { DepartmentTaskInbox } from "@/components/data-confirmation/department-task-inbox";
import { AdmissionPilotTaskLiveSummaryPanel } from "@/components/data-confirmation/admission-pilot-task-live-summary";
import { TaskCenterLiveReadonlyList } from "@/components/data-confirmation/task-center-live-readonly-list";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { getHEUWorkspaceContext } from "@/lib/heu-workspace-context";
import { readAdmissionPilotTaskLiveSummary } from "@/lib/admission-pilot-task-read-model";
import { createClient } from "@/lib/supabase/server";
import { getVisibleTaskCenterLanes } from "@/lib/task-center-contract";
import { readTaskCenterLiveReadonly } from "@/lib/task-center-live-readonly-adapter";
import { firstParam, withAdmissionSegmentParam } from "@/lib/workspace";

type DataConfirmationPageProps = {
  searchParams?: Promise<{
    segment?: string | string[];
  }>;
};

const confirmationStatuses = [
  {
    code: "CHO_XAC_NHAN",
    label: "Cho xac nhan",
    note: "Du lieu da co ref, dang cho phong ban phu trach xac nhan.",
  },
  {
    code: "DUNG",
    label: "Dung",
    note: "Phong ban xac nhan metadata/ref khop voi nghiep vu minh quan ly.",
  },
  {
    code: "CAN_SUA",
    label: "Can sua",
    note: "Phong ban tra ve kem ly do, chua sua du lieu that tai route nay.",
  },
  {
    code: "KHONG_THUOC_TOI",
    label: "Khong thuoc toi",
    note: "Task bi tra ve IT_DATA/Audit de gan lai owner hoac scope.",
  },
  {
    code: "DA_KHOA",
    label: "Da khoa",
    note: "Task da co owner/evidence signoff, chi doc theo quyen.",
  },
] as const;

const sourceLanes = [
  {
    lane: "Tuyen sinh",
    ref: "lead_id, ho_so_ref, handover_ref",
    owner: "Tuyen sinh + IT_DATA",
  },
  {
    lane: "CTHSSV",
    ref: "student_ref, handover_ref",
    owner: "CTHSSV + Audit",
  },
  {
    lane: "Dao tao / Khoa",
    ref: "class_ref, program_ref, teacher_ref",
    owner: "Dao tao + Khoa owner",
  },
  {
    lane: "Finance read-only",
    ref: "receivable_ref, recon_ref, evidence_ref",
    owner: "KHTC + Audit",
  },
] as const;

function passFail(value: boolean) {
  return value ? "PASS" : "NO_GO";
}

function badgeClass(value: boolean) {
  return value
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

export default async function DataConfirmationPage({
  searchParams,
}: DataConfirmationPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedSegmentId = firstParam(resolvedSearchParams.segment);
  const heuWorkspace = await getHEUWorkspaceContext(supabase, user.id, {
    requestedSegmentId,
    includeActionPermissions: true,
  });
  const workspace = heuWorkspace.admissionWorkspace;
  const workspaceReturnTo = withAdmissionSegmentParam(
    "/data-confirmation",
    workspace.activeSegmentId,
  );
  const visibleTaskCenterLanes = getVisibleTaskCenterLanes(
    heuWorkspace.roleCode,
    heuWorkspace.actionGate,
  );
  const canOpenTaskCenter =
    heuWorkspace.actionGate.canReadScopedData ||
    visibleTaskCenterLanes.length > 0;
  const usesReadonlyFallback =
    !heuWorkspace.actionGate.canReadScopedData &&
    visibleTaskCenterLanes.length > 0;
  const canReviewScopedDraft = heuWorkspace.actionGate.canReviewScopedDraft;
  const liveTaskCenter = await readTaskCenterLiveReadonly(supabase, {
    enabled:
      process.env.HEU_ENABLE_TASK_CENTER_LIVE_READONLY === "true" &&
      heuWorkspace.actionGate.canReadScopedData,
    departmentCodes: visibleTaskCenterLanes.map(
      (lane) => lane.departmentCode,
    ),
    admissionSegmentId: workspace.activeSegmentId,
  });
  const admissionLaneVisible = visibleTaskCenterLanes.some(
    (lane) => lane.id === "admission",
  );
  const admissionPilotTaskSummary = await readAdmissionPilotTaskLiveSummary(
    supabase,
    {
      enabled:
        admissionLaneVisible &&
        heuWorkspace.scopeDecision !== "NO_MATCHING_SCOPE",
      admissionSegmentId: workspace.activeSegmentId,
    },
  );

  return (
    <AppShell
      active="data-confirmation"
      title="Viec cua toi / Data Confirmation"
      description="Task Center doc theo HEUWorkspaceContext: scope-first, ref-only, khong ghi du lieu that."
      workspaceSegmentId={workspace.activeSegmentId}
      workspaceReturnTo={workspaceReturnTo}
      actions={
        <Button asChild variant="outline">
          <Link href={withAdmissionSegmentParam("/reports", workspace.activeSegmentId)}>
            <ArrowRight className="size-4" />
            Xem bao cao
          </Link>
        </Button>
      }
    >
      <section
        className="space-y-6"
        data-heu-data-confirmation-route="HEU_DATA_CONFIRMATION_TASK_CENTER"
        data-heu-data-confirmation-scope="HEU_WORKSPACE_CONTEXT_SCOPE_FIRST"
        data-heu-data-confirmation-statuses="CHO_XAC_NHAN_DUNG_CAN_SUA_KHONG_THUOC_TOI_DA_KHOA"
        data-heu-data-confirmation-boundary="READ_ONLY_NO_REAL_DATA_MUTATION"
        data-heu-task-center-role-fallback={
          usesReadonlyFallback ? "ROLE_MAPPED_REF_ONLY" : "WORKSPACE_SCOPED"
        }
      >
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-zinc-700" />
              <div>
                <h2 className="text-base font-semibold text-zinc-950">
                  Trung tam viec can xac nhan
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Route nay hien lane cong viec dung theo role/phong ban.
                  Khi chua co bang Task Center live, he thong chi hien task
                  mau ref-only de UAT giao dien va pham vi; khong doc du lieu
                  nghiep vu, khong ghi va khong tu dong hoa.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium uppercase text-zinc-500">
              Workspace decision
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">Role</dt>
                <dd className="font-medium text-zinc-900">
                  {heuWorkspace.roleCode ?? "NO_ROLE"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">Scope</dt>
                <dd className="text-right font-medium text-zinc-900">
                  {heuWorkspace.scopeDecision}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">Visible segments</dt>
                <dd className="font-medium text-zinc-900">
                  {heuWorkspace.visibleSegmentIds.length}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {!canOpenTaskCenter ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-0.5 size-5 shrink-0" />
              <div>
                <h2 className="font-semibold">
                  Tai khoan chua co workspace scope hop le
                </h2>
                <p className="mt-1">
                  HEUWorkspaceContext tra ve <strong>NO_MATCHING_SCOPE</strong>.
                  IT_DATA can gan role, phong ban va business scope truoc khi
                  hien task that cho user nay.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <DepartmentTaskInbox
              roleCode={heuWorkspace.roleCode}
              scopeDecision={heuWorkspace.scopeDecision}
              activeSegmentId={workspace.activeSegmentId}
              visibleSegmentCount={heuWorkspace.visibleSegmentIds.length}
              actionGate={heuWorkspace.actionGate}
            />

            <AdmissionPilotTaskLiveSummaryPanel
              result={admissionPilotTaskSummary}
              activeSegmentId={workspace.activeSegmentId}
            />

            <TaskCenterLiveReadonlyList result={liveTaskCenter} />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {confirmationStatuses.map((status) => (
                <article
                  key={status.code}
                  className="rounded-lg border border-zinc-200 bg-white p-4"
                >
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    {status.code}
                  </p>
                  <h3 className="mt-2 font-semibold text-zinc-950">
                    {status.label}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-zinc-600">
                    {status.note}
                  </p>
                </article>
              ))}
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 p-5">
                <h2 className="text-base font-semibold text-zinc-950">
                  Ref-only source lanes
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Task Center chi luu ref va metadata. Khong copy raw PII,
                  sao ke ngan hang, password, token hoac evidence goc vao task.
                </p>
              </div>
              <div className="divide-y divide-zinc-100">
                {sourceLanes.map((lane) => (
                  <div
                    key={lane.lane}
                    className="grid gap-2 p-4 text-sm md:grid-cols-[0.8fr_1.2fr_1fr]"
                  >
                    <div className="font-medium text-zinc-900">{lane.lane}</div>
                    <div className="text-zinc-600">{lane.ref}</div>
                    <div className="text-zinc-500">{lane.owner}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Route className="size-4 text-zinc-500" />
                  <p className="font-medium text-zinc-950">Scope-first</p>
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  Business rows must be queried only after role/scope has been
                  resolved by HEUWorkspaceContext.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-zinc-500" />
                  <p className="font-medium text-zinc-950">Action boundary</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                  <span
                    className={`rounded-full border px-2 py-1 ${badgeClass(
                      canReviewScopedDraft,
                    )}`}
                  >
                    Review: {passFail(canReviewScopedDraft)}
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-600">
                    Write: BLOCKED
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <p className="font-medium text-zinc-950">Next gate</p>
                <p className="mt-2 text-sm text-zinc-600">
                  Chi them task data thuc sau khi IT_DATA + Audit dong y data
                  contract, audit log va rollback.
                </p>
              </div>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}
