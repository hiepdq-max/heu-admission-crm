import { AppShell } from "@/components/layout/app-shell";
import { SupabaseCheck } from "@/components/settings/supabase-check";

export default function SupabaseCheckPage() {
  return (
    <AppShell
      active="settings"
      title="Kiểm tra Supabase"
      description="Xác nhận app đã đọc được biến môi trường và gọi được database."
    >
      <SupabaseCheck />
    </AppShell>
  );
}
