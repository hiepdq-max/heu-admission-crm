import Link from "next/link";
import { redirect } from "next/navigation";
import { FileSearch, RefreshCcw } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import {
  ShortCourseDashboard,
  type ShortCourseExceptionRow,
  type ShortCourseExceptionSummaryRow,
  type ShortCourseKpiRow,
  type ShortCourseSummaryRow,
} from "@/components/short-course/short-course-dashboard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  firstParam,
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type ShortCoursePageProps = {
  searchParams?: Promise<{
    segment?: string | string[];
  }>;
};

const severityOrder: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function pickLoadError(errors: Array<{ message: string } | null | undefined>) {
  return errors.find(Boolean)?.message ?? null;
}

export default async function ShortCoursePage({
  searchParams,
}: ShortCoursePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedSegmentId = firstParam(resolvedSearchParams.segment);
  const workspace = await getAdmissionWorkspaceContext(
    supabase,
    user.id,
    requestedSegmentId,
  );
  const refreshHref = withAdmissionSegmentParam(
    "/short-course",
    workspace.activeSegmentId,
  );

  const [
    kpiResult,
    summaryResult,
    exceptionSummaryResult,
    exceptionResult,
  ] = await Promise.all([
    supabase
      .from("short_course_dashboard_kpis")
      .select(
        "metric_code,metric_label,metric_group,metric_value,severity,owner_department,metric_note",
      )
      .order("metric_group", { ascending: true })
      .returns<ShortCourseKpiRow[]>(),
    supabase
      .from("short_course_data_foundation_summary")
      .select("*")
      .maybeSingle<ShortCourseSummaryRow>(),
    supabase
      .from("short_course_exception_summary")
      .select(
        "exception_group,module_step,owner_department,severity,exception_count,oldest_updated_at,newest_updated_at",
      )
      .returns<ShortCourseExceptionSummaryRow[]>(),
    supabase
      .from("short_course_exception_register")
      .select(
        "exception_code,module_step,exception_group,severity,exception_title,entity_type,entity_id,entity_code,entity_name,admission_segment_id,segment_code,segment_name,readiness_status,control_flags,owner_department,action_hint,source_view,updated_at",
      )
      .limit(12)
      .returns<ShortCourseExceptionRow[]>(),
  ]);

  const kpis = (kpiResult.data ?? []).sort((a, b) => {
    const severityCompare =
      (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);

    if (severityCompare !== 0) {
      return severityCompare;
    }

    return a.metric_code.localeCompare(b.metric_code);
  });
  const exceptionSummary = (exceptionSummaryResult.data ?? []).sort((a, b) => {
    const severityCompare =
      (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);

    if (severityCompare !== 0) {
      return severityCompare;
    }

    return b.exception_count - a.exception_count;
  });
  const exceptions = (exceptionResult.data ?? []).sort((a, b) => {
    const severityCompare =
      (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);

    if (severityCompare !== 0) {
      return severityCompare;
    }

    return (
      new Date(b.updated_at ?? 0).getTime() -
      new Date(a.updated_at ?? 0).getTime()
    );
  });
  const loadError = pickLoadError([
    kpiResult.error,
    summaryResult.error,
    exceptionSummaryResult.error,
    exceptionResult.error,
  ]);

  return (
    <AppShell
      active="short-course"
      title="ERP ngắn hạn"
      description={
        workspace.activeSegment
          ? `Dashboard vận hành ngắn hạn trong phạm vi: ${workspace.activeSegment.label}.`
          : "Dashboard vận hành ngắn hạn: học viên, lớp, điểm danh, chính sách, tài chính và exception."
      }
      workspaceSegmentId={workspace.activeSegmentId}
      workspaceReturnTo={refreshHref}
      actions={
        <>
          <Button asChild variant="outline">
            <Link href={refreshHref}>
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P1-12">
              <FileSearch className="size-4" />
              Tìm P1-12
            </Link>
          </Button>
        </>
      }
    >
      <ShortCourseDashboard
        kpis={kpis}
        summary={summaryResult.data ?? null}
        exceptionSummary={exceptionSummary}
        exceptions={exceptions}
        loadError={loadError}
      />
    </AppShell>
  );
}
