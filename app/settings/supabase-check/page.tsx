import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { SupabaseBackupRestoreGuard } from "@/components/settings/supabase-backup-restore-guard";
import { SupabaseCheck } from "@/components/settings/supabase-check";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type UserCreationPreflightStatus = "READY" | "NO_GO";

type UserCreationPreflightItem = {
  code: string;
  label: string;
  status: UserCreationPreflightStatus;
  detail: string;
};

async function checkServiceRoleAdminApi(hasServiceRoleKey: boolean) {
  if (!hasServiceRoleKey) {
    return {
      status: "NO_GO" as const,
      detail:
        "Chưa có SUPABASE_SERVICE_ROLE_KEY nên chưa thể kiểm Supabase Auth Admin API.",
    };
  }

  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (error) {
      return {
        status: "NO_GO" as const,
        detail:
          "USER_CREATE_AUTH_ADMIN_NO_GO: Auth Admin API chưa sẵn sàng. Kiểm tra service role key/project trong Supabase; không đưa chi tiết lỗi ra UI/log/chat.",
      };
    }

    return {
      status: "READY" as const,
      detail:
        "Service role key gọi được Supabase Auth Admin API. Không hiển thị hoặc ghi log key.",
    };
  } catch {
    return {
      status: "NO_GO" as const,
      detail:
        "USER_CREATE_ADMIN_CLIENT_NO_GO: Không khởi tạo được admin client. Kiểm tra server env/project; không đưa chi tiết lỗi ra UI/log/chat.",
    };
  }
}

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

  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const [
    { data: canCurrentUserCreate },
    { data: adminRole },
    serviceRoleAdminApi,
  ] = await Promise.all([
    supabase.rpc("has_permission", { permission_name: "users.create" }),
    supabase
      .from("roles")
      .select("id,code")
      .eq("code", "ADMIN")
      .maybeSingle(),
    checkServiceRoleAdminApi(hasServiceRoleKey),
  ]);
  const { data: adminCreatePermission } = adminRole?.id
    ? await supabase
        .from("role_permissions")
        .select("permission")
        .eq("role_id", adminRole.id)
        .eq("permission", "users.create")
        .maybeSingle()
    : { data: null };
  const userCreationPreflightItems: UserCreationPreflightItem[] = [
    {
      code: "USER-CREATE-ENV",
      label: "Service role key server-only",
      status: hasServiceRoleKey ? "READY" : "NO_GO",
      detail: hasServiceRoleKey
        ? "SUPABASE_SERVICE_ROLE_KEY đã có trong server env."
        : "Thiếu SUPABASE_SERVICE_ROLE_KEY trong .env.local nên nút tạo user tự động vẫn khóa.",
    },
    {
      code: "USER-CREATE-AUTH-ADMIN",
      label: "Supabase Auth Admin API",
      status: serviceRoleAdminApi.status,
      detail: serviceRoleAdminApi.detail,
    },
    {
      code: "USER-CREATE-ADMIN-SEED",
      label: "ADMIN có users.create trong database",
      status: adminCreatePermission ? "READY" : "NO_GO",
      detail: adminCreatePermission
        ? "Role ADMIN có permission users.create để giữ ma trận quyền nhất quán."
        : "ADMIN vẫn có fallback tạo user, nhưng DB hiện hữu cần chạy database/step112_admin_user_create_permission.sql để ghi users.create vào role_permissions.",
    },
    {
      code: "USER-CREATE-OPERATOR",
      label: "Tài khoản hiện tại được phép tạo user",
      status:
        currentRoleCode === "ADMIN" || canCurrentUserCreate ? "READY" : "NO_GO",
      detail:
        currentRoleCode === "ADMIN" || canCurrentUserCreate
          ? "Tài khoản hiện tại có quyền mở luồng tạo user."
          : "Tài khoản hiện tại chưa có users.create.",
    },
    {
      code: "USER-CREATE-ROUTE",
      label: "Đường vào màn hình tạo user",
      status: "READY",
      detail:
        "Vào Phạm vi user để tạo user; ADMIN có thêm trang Cấu hình đầy đủ.",
    },
  ];

  return (
    <AppShell
      active="settings"
      title="Kiểm tra Supabase"
      description="Xác nhận app đã đọc được biến môi trường và gọi được database."
    >
      <div className="space-y-6">
        <SupabaseBackupRestoreGuard />
        <SupabaseCheck
          serviceRoleKeyConfigured={hasServiceRoleKey}
          userCreationPreflightItems={userCreationPreflightItems}
        />
      </div>
    </AppShell>
  );
}
