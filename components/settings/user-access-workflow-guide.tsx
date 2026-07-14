import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Link2,
  LockKeyhole,
  MousePointerClick,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

const workflowSteps = [
  {
    code: "01",
    title: "Kiểm tra vị trí",
    body: "Mở Ma trận vị trí và user, chọn đúng vị trí trong định biên. Ưu tiên gán cấp quản lý trước để hệ thống có đủ tuyến báo cáo.",
    icon: ShieldCheck,
  },
  {
    code: "02",
    title: "Tạo hoặc liên kết Auth user",
    body: "Nếu user chưa có tài khoản đăng nhập thì dùng Tạo tài khoản user. Nếu Auth đã được tạo thủ công thì dùng Liên kết Auth user.",
    icon: UserPlus,
  },
  {
    code: "03",
    title: "Gán email vào vị trí",
    body: "Nhập email vào cột Gán nhanh trong ma trận. Hệ thống tự động đồng bộ role, phòng ban và người quản lý theo vị trí chuẩn.",
    icon: Link2,
  },
  {
    code: "04",
    title: "Gửi email đặt lại mật khẩu",
    body: "Dùng Email đặt lại mật khẩu để user tự đặt mật khẩu riêng. Mật khẩu tạm chỉ dùng khi cần xử lý trực tiếp có kiểm soát.",
    icon: KeyRound,
  },
  {
    code: "05",
    title: "Kiểm tra sau đăng nhập",
    body: "Cho user đăng nhập thử và kiểm tra menu, dữ liệu, scope. Nếu sai quyền, sửa lại vị trí/role/scope thay vì mở rộng quyền thủ công.",
    icon: CheckCircle2,
  },
];

const quickRules = [
  "Mỗi người một tài khoản riêng, không dùng chung tài khoản.",
  "Không gửi mật khẩu qua Codex/chat/email thường hoặc file đính kèm.",
  "Không gán ADMIN nếu user không làm nhiệm vụ quản trị hệ thống.",
  "Không bỏ qua ma trận vị trí, vì đây là điểm đồng bộ role/phòng ban/người quản lý.",
];

export function UserAccessWorkflowGuide() {
  return (
    <section
      className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
      data-heu-user-access-workflow-guide="P0-17_USER_ACCESS_WORKFLOW_GUIDE"
      data-heu-user-access-workflow-overflow-guard="P0-17_USER_ACCESS_WORKFLOW_NO_OVERFLOW"
      data-heu-user-access-steps="AUTH_LINK POSITION_ASSIGN PASSWORD_RESET LOGIN_CHECK"
    >
      <div className="min-w-0 border-b border-zinc-100 p-6">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="inline-flex max-w-full min-w-0 items-center gap-2 overflow-hidden rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <MousePointerClick
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span className="truncate">Hướng dẫn thao tác nhanh</span>
            </div>
            <h2 className="break-words text-xl font-semibold text-zinc-950">
              Tạo/liên kết user, gán quyền và bàn giao mật khẩu
            </h2>
            <p className="max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Thứ tự chuẩn: Tạo hoặc liên kết Auth user - Gán vào Ma trận vị trí -
              Hệ thống đồng bộ role/phòng ban/người quản lý - Gửi email đặt lại
              mật khẩu để user tự đặt mật khẩu.
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 lg:max-w-sm">
            <div className="flex items-start gap-2">
              <LockKeyhole
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span className="break-words">
                Đây là luồng quản trị tài khoản. Chỉ ADMIN hoặc người được ủy
                quyền mới được thực hiện.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 p-6 xl:grid-cols-5">
        {workflowSteps.map((step) => {
          const Icon = step.icon;
          return (
            <article
              key={step.code}
              className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="shrink-0 rounded-md bg-zinc-900 px-2 py-1 text-xs font-semibold text-white">
                  {step.code}
                </span>
                <Icon
                  className="h-5 w-5 shrink-0 text-zinc-500"
                  aria-hidden="true"
                />
              </div>
              <h3 className="truncate text-sm font-semibold text-zinc-950">
                {step.title}
              </h3>
              <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
                {step.body}
              </p>
            </article>
          );
        })}
      </div>

      <div className="grid min-w-0 gap-4 border-t border-zinc-100 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-emerald-900">
            <CheckCircle2
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">Dùng form nào?</span>
          </h3>
          <div className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
            <p className="break-words">
              <strong>Tạo tài khoản user:</strong> dùng khi nhân sự chưa có Auth
              user trong Supabase.
            </p>
            <p className="break-words">
              <strong>Liên kết Auth user đã tạo thủ công:</strong> dùng khi Auth
              đã có sẵn và chỉ cần tạo/cập nhật profile trong CRM.
            </p>
            <p className="break-words">
              <strong>Ma trận vị trí và user:</strong> dùng để gán chính thức
              email vào vị trí, role, phòng ban và tuyến quản lý.
            </p>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-red-900">
            <AlertTriangle
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">Điểm cần chặn</span>
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-red-900">
            {quickRules.map((rule) => (
              <li key={rule} className="flex min-w-0 gap-2">
                <span className="shrink-0" aria-hidden="true">
                  -
                </span>
                <span className="break-words">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
