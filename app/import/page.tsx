import Link from "next/link";
import { redirect } from "next/navigation";
import { Route, Users } from "lucide-react";

import { LeadImportForm } from "@/components/import/lead-import-form";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type Option = {
  id: string;
  label: string;
};

type PartnerScopeRow = {
  partner_id: string;
};

type ImportPageProps = {
  searchParams?: Promise<{
    segment?: string | string[];
  }>;
};

function toOptions<T extends Record<string, unknown>>(
  rows: T[] | null,
  labelKey: keyof T,
): Option[] {
  return (rows ?? []).map((row) => ({
    id: String(row.id),
    label: String(row[labelKey] ?? ""),
  }));
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function filterRowsByScope<T extends { id: unknown }>(
  rows: T[] | null,
  allowedIds: Set<string>,
  showAllWhenUnscoped: boolean,
) {
  if (allowedIds.size === 0) {
    return showAllWhenUnscoped ? (rows ?? []) : [];
  }

  return (rows ?? []).filter((row) => allowedIds.has(String(row.id)));
}

export default async function ImportPage({ searchParams }: ImportPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedSegmentParam = firstParam(resolvedSearchParams.segment);
  const workspace = await getAdmissionWorkspaceContext(
    supabase,
    user.id,
    requestedSegmentParam,
  );
  const workspaceReturnTo = withAdmissionSegmentParam(
    "/import",
    workspace.activeSegmentId,
  );

  if (!workspace.activeSegmentId) {
    return (
      <AppShell
        active="import"
        title="Import dữ liệu"
        description="P0-14 yêu cầu chọn đúng đối tượng tuyển sinh trước khi import lead."
        workspaceSegmentId={workspace.activeSegmentId}
        workspaceReturnTo={workspaceReturnTo}
        actions={
          <Button asChild variant="outline">
            <Link href="/leads">
              <Users className="size-4" />
              Xem lead
            </Link>
          </Button>
        }
      >
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-3">
            <Route className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-semibold">
                Chưa chọn workspace để import
              </h2>
              <p className="mt-1">
                Hãy chọn một đối tượng tuyển sinh ở thanh{" "}
                <strong>P0-13 · Workspace đang làm việc</strong> rồi bấm{" "}
                <strong>Áp dụng</strong>. P0-14 không cho import khi chưa biết
                danh sách này thuộc HOU, TTGDTX, ngắn hạn hay đối tượng khác.
              </p>
              {workspace.segmentOptions.length === 0 ? (
                <p className="mt-2">
                  Tài khoản này hiện chưa được phân đối tượng tuyển sinh. ADMIN
                  hoặc trưởng phòng cần phân phạm vi user trước.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  const [
    { data: currentRoleCode },
    { data: sourceRows },
    { data: flowRows },
    { data: campaignRows },
    { data: partnerRows },
    { data: partnerScopeRows },
  ] = await Promise.all([
      supabase.rpc("current_user_role_code"),
      supabase
        .from("lead_sources")
        .select("id,source_name")
        .eq("status", "ACTIVE")
        .order("source_name", { ascending: true }),
      supabase
        .from("admission_flows")
        .select("id,flow_name")
        .eq("status", "ACTIVE")
        .order("sort_order", { ascending: true }),
      supabase
        .from("campaigns")
        .select("id,campaign_name")
        .eq("is_deleted", false)
        .order("campaign_name", { ascending: true }),
      supabase
        .from("partners")
        .select("id,partner_name")
        .eq("is_deleted", false)
        .order("partner_name", { ascending: true }),
      supabase
        .from("user_partner_scopes")
        .select("partner_id")
        .eq("user_id", user.id)
        .eq("status", "ACTIVE")
        .returns<PartnerScopeRow[]>(),
    ]);
  const allowedPartnerIds = new Set(
    (partnerScopeRows ?? []).map((scope) => scope.partner_id),
  );
  const canUseGlobalScope =
    currentRoleCode === "ADMIN" || currentRoleCode === "BGH";
  const segmentOptions = workspace.activeSegment
    ? [
        {
          id: workspace.activeSegment.id,
          label: workspace.activeSegment.label,
        },
      ]
    : [];
  const partnerOptions = filterRowsByScope(
    partnerRows,
    allowedPartnerIds,
    canUseGlobalScope,
  );
  const defaultSegmentId = workspace.activeSegmentId;

  return (
    <AppShell
      active="import"
      title="Import dữ liệu"
      description="Nhập lead từ CSV, kiểm tra thiếu dữ liệu và bỏ qua số điện thoại trùng."
      workspaceSegmentId={workspace.activeSegmentId}
      workspaceReturnTo={workspaceReturnTo}
      actions={
        <Button asChild variant="outline">
          <Link
            href={withAdmissionSegmentParam(
              "/leads",
              workspace.activeSegmentId,
            )}
          >
            <Users className="size-4" />
            Xem lead
          </Link>
        </Button>
      }
    >
      <LeadImportForm
        sources={toOptions(sourceRows, "source_name")}
        flows={toOptions(flowRows, "flow_name")}
        segments={segmentOptions}
        campaigns={toOptions(campaignRows, "campaign_name")}
        partners={toOptions(partnerOptions, "partner_name")}
        defaultSegmentId={defaultSegmentId}
        hasSegmentScope
        lockSegmentSelection
      />
    </AppShell>
  );
}
