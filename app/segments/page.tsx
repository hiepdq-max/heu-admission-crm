import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, RefreshCcw, Settings } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { AdmissionSegmentOverview } from "@/components/segments/admission-segment-overview";
import { Button } from "@/components/ui/button";
import {
  buildAdmissionSegmentOverview,
  filterAdmissionSegmentsByScope,
  type AdmissionSegmentCatalogRow,
  type AdmissionSegmentLeadStatRow,
  type AdmissionSegmentScopeRow,
} from "@/lib/admission-segments";
import { createClient } from "@/lib/supabase/server";

export default async function SegmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    currentRoleResult,
    segmentRowsResult,
    segmentScopeRowsResult,
    segmentLeadRowsResult,
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
  ]);

  const visibleSegmentRows = filterAdmissionSegmentsByScope(
    segmentRowsResult.data ?? [],
    segmentScopeRowsResult.data ?? [],
    currentRoleResult.data === "ADMIN",
  );
  const overview = buildAdmissionSegmentOverview(
    visibleSegmentRows,
    segmentLeadRowsResult.data ?? [],
  );

  return (
    <AppShell
      active="segments"
      title="Đối tượng tuyển sinh"
      description="Tách riêng từng nhóm tuyển sinh để phân quyền, hồ sơ, COM, hợp đồng và báo cáo không bị lẫn."
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
            <Link href="/leads/new">
              <Plus className="size-4" />
              Tạo lead
            </Link>
          </Button>
        </>
      }
    >
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
