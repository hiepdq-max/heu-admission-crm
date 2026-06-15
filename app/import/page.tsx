import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { LeadImportForm } from "@/components/import/lead-import-form";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type Option = {
  id: string;
  label: string;
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

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: sourceRows },
    { data: flowRows },
    { data: campaignRows },
    { data: partnerRows },
  ] = await Promise.all([
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
    ]);

  return (
    <AppShell
      active="import"
      title="Import dữ liệu"
      description="Nhập lead từ CSV, kiểm tra thiếu dữ liệu và bỏ qua số điện thoại trùng."
      actions={
        <Button asChild variant="outline">
          <Link href="/leads">
            <Users className="size-4" />
            Xem lead
          </Link>
        </Button>
      }
    >
      <LeadImportForm
        sources={toOptions(sourceRows, "source_name")}
        flows={toOptions(flowRows, "flow_name")}
        campaigns={toOptions(campaignRows, "campaign_name")}
        partners={toOptions(partnerRows, "partner_name")}
      />
    </AppShell>
  );
}
