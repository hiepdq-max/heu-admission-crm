import { redirect } from "next/navigation";
import { FilePlus2, RefreshCcw } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import {
  TchcRecordsArchiveReadonly,
  type TchcRecordsArchiveDashboardRow,
} from "@/components/tchc/tchc-records-archive-readonly";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function TchcRecordsArchivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("heu_tchc_records_archive_dashboard")
    .select(
      "dashboard_code,dashboard_name,item_count,open_count,blocked_count,overdue_count,archive_ready_count,last_activity_at,readiness_state",
    )
    .order("dashboard_code", { ascending: true })
    .returns<TchcRecordsArchiveDashboardRow[]>();

  return (
    <AppShell
      active="tchc-records-archive"
      title="TCHC van thu luu tru"
      description="Read-only cockpit cho so van ban den/di, ho so luu tru va hang doi ban giao. Production remains NO-GO."
      actions={
        <>
          <Button asChild variant="outline" size="sm">
            <a href="/tchc/records-archive/intake" aria-label="Mo mau nhap metadata van thu luu tru">
              <FilePlus2 className="h-4 w-4" aria-hidden="true" />
              Mau nhap
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/tchc/records-archive" aria-label="Refresh TCHC records archive">
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </a>
          </Button>
        </>
      }
    >
      <TchcRecordsArchiveReadonly rows={data ?? []} loadError={error?.message} />
    </AppShell>
  );
}
