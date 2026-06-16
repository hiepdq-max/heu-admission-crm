import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, RefreshCcw, Settings } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { AdmissionSegmentOverview } from "@/components/segments/admission-segment-overview";
import { SegmentReadinessOverview } from "@/components/segments/segment-operating-readiness";
import { Button } from "@/components/ui/button";
import {
  buildAdmissionSegmentOverview,
  filterAdmissionSegmentsByScope,
  type AdmissionSegmentCatalogRow,
  type AdmissionSegmentLeadStatRow,
  type AdmissionSegmentReadinessRow,
  type AdmissionSegmentScopeRow,
} from "@/lib/admission-segments";
import { createClient } from "@/lib/supabase/server";
import {
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

export default async function SegmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspace = await getAdmissionWorkspaceContext(supabase, user.id);

  const [
    currentRoleResult,
    segmentRowsResult,
    segmentScopeRowsResult,
    segmentLeadRowsResult,
    segmentReadinessResult,
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase
      .from("admission_segments")
      .select(
        "id,segment_code,segment_name,program_group,admission_object,delivery_context,partner_model,commission_model,contract_model,finance_risk,owner_department,sort_order,status",
      )
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .returns<AdmissionSegmentCatalogRow[]>(),
    supabase
      .from("user_admission_segment_scopes")
      .select("segment_id")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .returns<AdmissionSegmentScopeRow[]>(),
    supabase
      .from("leads")
      .select("admission_segment_id,status")
      .eq("is_deleted", false)
      .limit(5000)
      .returns<AdmissionSegmentLeadStatRow[]>(),
    supabase
      .from("admission_segment_operating_readiness")
      .select(
        "segment_id,segment_code,segment_name,program_group,owner_department,workspace_id,workspace_code,operating_model,required_partner,required_contract,required_commission_policy,required_finance_tracking,required_document_checklist,required_handover_cthssv,hou_controls_enabled,ai_allowed,control_status,lead_count,enrolled_count,scoped_user_count,operation_step_count,required_step_count,visible_field_count,required_field_count,has_workspace_profile,has_required_steps,has_required_fields,has_user_scope,readiness_score,readiness_status,missing_items,ai_gate_status",
      )
      .order("readiness_score", { ascending: false })
      .returns<AdmissionSegmentReadinessRow[]>(),
  ]);

  const visibleSegmentRows = filterAdmissionSegmentsByScope(
    segmentRowsResult.data ?? [],
    segmentScopeRowsResult.data ?? [],
    currentRoleResult.data === "ADMIN" || currentRoleResult.data === "BGH",
  );
  const overview = buildAdmissionSegmentOverview(
    visibleSegmentRows,
    segmentLeadRowsResult.data ?? [],
  );
  const visibleSegmentIds = new Set(visibleSegmentRows.map((segment) => segment.id));
  const visibleReadinessRows = (segmentReadinessResult.data ?? []).filter((row) =>
    visibleSegmentIds.has(row.segment_id),
  );

  return (
    <AppShell
      active="segments"
      title="Đối tượng tuyển sinh"
      description="Tách riêng từng nhóm tuyển sinh để phân quyền, hồ sơ, COM, hợp đồng và báo cáo không bị lẫn."
      workspaceSegmentId={workspace.activeSegmentId}
      workspaceReturnTo="/segments"
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/segments">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/settings#segments">
              <Settings className="size-4" />
              Cấu hình
            </Link>
          </Button>
          <Button asChild>
            <Link
              href={withAdmissionSegmentParam(
                "/leads/new",
                workspace.activeSegmentId,
              )}
            >
              <Plus className="size-4" />
              Tạo lead
            </Link>
          </Button>
        </>
      }
    >
      <SegmentReadinessOverview
        rows={visibleReadinessRows}
        loadError={segmentReadinessResult.error?.message}
      />

      {segmentRowsResult.error ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Không đọc được bảng đối tượng tuyển sinh:{" "}
          {segmentRowsResult.error.message}
        </section>
      ) : (
        <AdmissionSegmentOverview
          segments={overview.segments}
          uncategorizedCount={overview.uncategorizedCount}
        />
      )}
    </AppShell>
  );
}
