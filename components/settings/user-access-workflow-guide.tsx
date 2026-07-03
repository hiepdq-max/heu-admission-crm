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
    title: "Kiem tra vi tri",
    body: "Mo Ma tran vi tri va user, chon dung vi tri trong dinh bien. Uu tien gan cap quan ly truoc de he thong co du tuyen bao cao.",
    icon: ShieldCheck,
  },
  {
    code: "02",
    title: "Tao hoac link Auth user",
    body: "Neu user chua co tai khoan dang nhap thi dung Tao tai khoan user. Neu Auth da duoc tao thu cong thi dung Lien ket Auth user.",
    icon: UserPlus,
  },
  {
    code: "03",
    title: "Gan email vao vi tri",
    body: "Nhap email vao cot Gan nhanh trong ma tran. He thong tu dong dong bo role, phong ban va nguoi quan ly theo vi tri chuan.",
    icon: Link2,
  },
  {
    code: "04",
    title: "Gui email reset mat khau",
    body: "Dung Email dat lai mat khau de user tu dat mat khau rieng. Mat khau tam chi dung khi can xu ly truc tiep co kiem soat.",
    icon: KeyRound,
  },
  {
    code: "05",
    title: "Kiem tra sau dang nhap",
    body: "Cho user dang nhap thu va kiem tra menu, du lieu, scope. Neu sai quyen, sua lai vi tri/role/scope thay vi mo rong quyen thu cong.",
    icon: CheckCircle2,
  },
];

const quickRules = [
  "Mot nguoi mot tai khoan rieng, khong dung chung tai khoan.",
  "Khong gui mat khau qua Codex/chat/email thuong hoac file dinh kem.",
  "Khong gan ADMIN neu user khong lam nhiem vu quan tri he thong.",
  "Khong bo qua ma tran vi tri, vi day la diem dong bo role/phong ban/quan ly.",
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
              <span className="truncate">Huong dan thao tac nhanh</span>
            </div>
            <h2 className="break-words text-xl font-semibold text-zinc-950">
              Tao/link user, gan quyen va ban giao mat khau
            </h2>
            <p className="max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Thu tu chuan: Tao hoac link Auth user - Gan vao Ma tran vi tri -
              He thong dong bo role/phong ban/quan ly - Gui email reset de user
              tu dat mat khau.
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 lg:max-w-sm">
            <div className="flex items-start gap-2">
              <LockKeyhole
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span className="break-words">
                Day la luong quan tri tai khoan. Chi ADMIN hoac nguoi duoc uy
                quyen moi thuc hien.
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
            <span className="truncate">Dung form nao?</span>
          </h3>
          <div className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
            <p className="break-words">
              <strong>Tao tai khoan user:</strong> dung khi nhan su chua co Auth
              user trong Supabase.
            </p>
            <p className="break-words">
              <strong>Lien ket Auth user da tao thu cong:</strong> dung khi Auth
              da co san va chi can tao/cap nhat profile trong CRM.
            </p>
            <p className="break-words">
              <strong>Ma tran vi tri va user:</strong> dung de gan chinh thuc
              email vao vi tri, role, phong ban va tuyen quan ly.
            </p>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-red-900">
            <AlertTriangle
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">Diem can chan</span>
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
