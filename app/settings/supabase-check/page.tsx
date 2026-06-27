import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { SupabaseBackupRestoreGuard } from "@/components/settings/supabase-backup-restore-guard";
import { SupabaseCheck } from "@/components/settings/supabase-check";
import { createClient } from "@/lib/supabase/server";

export default async function SupabaseCheckPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentRoleCode } = await supabase.rpc(
    "current_user_role_code",
  );

  if (currentRoleCode !== "ADMIN") {
    redirect("/");
  }

  return (
    <AppShell
      active="settings"
      title="Kiểm tra Supabase"
      description="Xác nhận app đã đọc được biến môi trường và gọi được database."
    >
      <div className="space-y-6">
        <SupabaseBackupRestoreGuard />
        <SupabaseCheck />
      </div>
    </AppShell>
  );
}
