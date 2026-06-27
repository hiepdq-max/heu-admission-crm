import Link from "next/link";
import { redirect } from "next/navigation";
import { RefreshCcw } from "lucide-react";

import {
  AuditLogTable,
  type AuditLogRow,
} from "@/components/audit/audit-log-table";
import { HardDeleteBoundaryGuard } from "@/components/audit/hard-delete-boundary-guard";
import { TtgdtxAuditTrailGuard } from "@/components/audit/ttgdtx-audit-trail-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type JsonRecord = Record<string, unknown>;

type AuditData = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: JsonRecord | null;
  new_value: JsonRecord | null;
  note: string | null;
  created_at: string;
};

export default async function AuditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: logs, error }, { data: users }] = await Promise.all([
    supabase
      .from("audit_logs")
      .select(
        "id,user_id,action,entity_type,entity_id,old_value,new_value,note,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<AuditData[]>(),
    supabase.from("users_profile").select("id,full_name,email"),
  ]);

  const userMap = new Map(
    (users ?? []).map((row) => [
      String(row.id),
      {
        name: String(row.full_name ?? "Không rõ"),
        email: row.email ? String(row.email) : null,
      },
    ]),
  );

  const auditRows: AuditLogRow[] = (logs ?? []).map((log) => {
    const actor = log.user_id ? userMap.get(log.user_id) : null;

    return {
      ...log,
      user_name: actor?.name ?? "Hệ thống / chưa xác định",
      user_email: actor?.email ?? null,
    };
  });

  const entityTypes = new Set(auditRows.map((row) => row.entity_type));

  return (
    <AppShell
      active="audit"
      title="Audit log"
      description="Theo dõi các thao tác tạo mới, cập nhật và xóa dữ liệu quan trọng."
      actions={
        <Button asChild variant="outline">
          <Link href="/audit">
            <RefreshCcw className="size-4" />
            Tải lại
          </Link>
        </Button>
      }
    >
      {error ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Không đọc được audit log: {error.message}
        </section>
      ) : (
        <div className="space-y-6">
          <TtgdtxAuditTrailGuard />
          <HardDeleteBoundaryGuard />
          <AuditLogTable
            logs={auditRows}
            summary={{
              total: auditRows.length,
              inserts: auditRows.filter((row) => row.action === "INSERT").length,
              updates: auditRows.filter((row) => row.action === "UPDATE").length,
              deletes: auditRows.filter((row) => row.action === "DELETE").length,
              entityTypes: entityTypes.size,
            }}
          />
        </div>
      )}
    </AppShell>
  );
}
