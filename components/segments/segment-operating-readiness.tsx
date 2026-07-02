import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  Lock,
  Plus,
  Route,
  Settings2,
  ShieldAlert,
  Upload,
  Users,
} from "lucide-react";

import type {
  AdmissionSegmentFieldRuleRow,
  AdmissionSegmentOperationStepRow,
  AdmissionSegmentReadinessRow,
  AdmissionSegmentWorkspaceRow,
} from "@/lib/admission-segments";
import {
  SegmentOperatingFocusLayout,
  type SegmentOperatingFocusSection,
} from "@/components/segments/segment-operating-focus-layout";
import {
  operatingModelLabel,
  segmentAiGateLabel,
  segmentAiGateTone,
  segmentMissingItemLabel,
  segmentReadinessStatusLabel,
  segmentReadinessTone,
} from "@/lib/admission-segments";

type SegmentReadinessOverviewProps = {
  rows: AdmissionSegmentReadinessRow[];
  loadError?: string;
};

type SegmentReadinessCardProps = {
  row: AdmissionSegmentReadinessRow;
  compact?: boolean;
};

type SegmentOperatingProfileProps = {
  readiness?: AdmissionSegmentReadinessRow | null;
  workspace?: AdmissionSegmentWorkspaceRow | null;
  steps: AdmissionSegmentOperationStepRow[];
  fieldRules: AdmissionSegmentFieldRuleRow[];
  loadError?: string;
};

const segmentOperatingSections: SegmentOperatingFocusSection[] = [
  {
    id: "profile",
    label: "Hồ sơ",
    title: "Hồ sơ vận hành",
    description: "Mô hình, luật lead, đối tác/hợp đồng và chính sách AI.",
    icon: "profile",
  },
  {
    id: "workflow",
    label: "Quy trình",
    title: "Quy trình còn lại",
    description: "Các phần ít dùng hơn nhưng vẫn cần kiểm soát theo đối tượng.",
    icon: "workflow",
  },
  {
    id: "fields",
    label: "Dữ liệu",
    title: "Trường thông tin trên lead",
    description: "Field hiển thị, field bắt buộc và ghi chú nhập liệu.",
    icon: "fields",
  },
];

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Route;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-zinc-100">
          <Icon className="size-5 text-zinc-600" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm text-zinc-500">{label}</p>
        </div>
      </div>
    </article>
  );
}

function ScoreBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2 rounded-full bg-zinc-100">
      <div
        className="h-2 rounded-full bg-zinc-900"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function stepIcon(stepCode: string) {
  if (stepCode === "LEAD_CREATE") return Plus;
  if (stepCode === "LEAD_IMPORT") return Upload;
  if (stepCode === "DOCUMENT_CHECKLIST") return ClipboardCheck;
  if (stepCode === "FINANCE_COM") return FileSpreadsheet;
  if (stepCode === "PARTNER_CONTRACT") return Users;
  return Route;
}

export function SegmentReadinessCard({
  row,
  compact = false,
}: SegmentReadinessCardProps) {
  const missingItems = row.missing_items ?? [];

  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs text-zinc-500">
            {row.segment_code}
          </p>
          <h3 className="mt-1 break-words font-semibold text-zinc-950">
            {row.segment_name}
          </h3>
          <p className="mt-1 break-words text-xs uppercase text-zinc-500">
            {row.program_group} · {operatingModelLabel(row.operating_model)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-md border px-2 py-1 text-xs font-medium ${segmentReadinessTone(
              row.readiness_status,
            )}`}
          >
            {segmentReadinessStatusLabel(row.readiness_status)}
          </span>
          <span
            className={`rounded-md border px-2 py-1 text-xs font-medium ${segmentAiGateTone(
              row.ai_gate_status,
            )}`}
          >
            {segmentAiGateLabel(row.ai_gate_status)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Điểm vận hành</span>
          <span className="font-medium text-zinc-900">
            {row.readiness_score}%
          </span>
        </div>
        <ScoreBar value={row.readiness_score} />
      </div>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-4">
        <span className="rounded-md bg-zinc-50 px-2 py-2 text-zinc-600">
          Lead: {row.lead_count}
        </span>
        <span className="rounded-md bg-zinc-50 px-2 py-2 text-zinc-600">
          User: {row.scoped_user_count}
        </span>
        <span className="rounded-md bg-zinc-50 px-2 py-2 text-zinc-600">
          Bước: {row.required_step_count}
        </span>
        <span className="rounded-md bg-zinc-50 px-2 py-2 text-zinc-600">
          Field: {row.required_field_count}
        </span>
      </div>

      {missingItems.length > 0 ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
            <div>
              <p className="text-xs font-medium text-amber-900">
                Còn thiếu trước khi mở rộng vận hành
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {missingItems.map((item) => (
                  <li
                    key={item}
                    className="rounded-md bg-white px-2 py-1 text-xs text-amber-800"
                  >
                    {segmentMissingItemLabel(item)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          Đối tượng đã có đủ khung vận hành nền. Vẫn cần người phụ trách duyệt
          trước khi mở automation/AI.
        </div>
      )}

      {!compact ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/segments/${row.segment_id}`}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
          >
            Vào workspace
          </Link>
          <Link
            href={`/leads?segment=${row.segment_id}`}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
          >
            Xem lead riêng
          </Link>
          <Link
            href={`/leads/new?segment=${row.segment_id}`}
            className="rounded-md bg-zinc-950 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800"
          >
            Tạo lead
          </Link>
        </div>
      ) : null}
    </article>
  );
}

export function SegmentReadinessOverview({
  rows,
  loadError,
}: SegmentReadinessOverviewProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">
              Chưa có Admission Segment Operating OS P0-05
            </h2>
            <p className="mt-1">
              Hãy chạy file{" "}
              <span className="font-mono">
                database/step44_admission_segment_operating_os.sql
              </span>{" "}
              trong Supabase SQL Editor rồi tải lại trang. Chi tiết:{" "}
              {loadError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const readyCount = rows.filter(
    (row) => row.readiness_status === "READY",
  ).length;
  const temporaryCount = rows.filter(
    (row) => row.readiness_status === "READY_TEMP",
  ).length;
  const needsScopeCount = rows.filter(
    (row) => row.readiness_status === "NEEDS_SCOPE",
  ).length;
  const aiLockedCount = rows.filter(
    (row) => row.ai_gate_status === "AI_LOCKED",
  ).length;

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Route className="size-5 text-zinc-600" />
              <h2 className="text-lg font-semibold">
                Admission Segment Operating OS P0-05
              </h2>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Mỗi đối tượng tuyển sinh là một workspace riêng: lead riêng,
              import riêng, field bắt buộc riêng, quyền user riêng, COM/hợp
              đồng/tài chính và AI đều theo đúng phạm vi.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
            Chọn đối tượng nào · Làm đúng phần đó · Không lẫn dữ liệu
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Sẵn sàng" value={readyCount} icon={CheckCircle2} />
        <Metric label="Chờ duyệt" value={temporaryCount} icon={ClipboardCheck} />
        <Metric label="Cần phân user" value={needsScopeCount} icon={Users} />
        <Metric label="AI đang khóa" value={aiLockedCount} icon={Lock} />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h3 className="text-base font-semibold">
            Tình trạng vận hành từng đối tượng
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Đối tượng nào chưa phân user hoặc chưa có rule bắt buộc sẽ hiện
            đúng điểm cần bổ sung.
          </p>
        </div>
        <div className="grid gap-4 p-5 xl:grid-cols-2">
          {rows.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Chưa có đối tượng tuyển sinh để kiểm tra.
            </p>
          ) : (
            rows.map((row) => (
              <SegmentReadinessCard key={row.segment_id} row={row} />
            ))
          )}
        </div>
      </section>
    </section>
  );
}

export function SegmentOperatingProfile({
  readiness,
  workspace,
  steps,
  fieldRules,
  loadError,
}: SegmentOperatingProfileProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        Hãy chạy{" "}
        <span className="font-mono">
          database/step44_admission_segment_operating_os.sql
        </span>{" "}
        để bật hồ sơ vận hành riêng cho đối tượng này. Chi tiết: {loadError}
      </section>
    );
  }

  const visibleRules = fieldRules.filter((rule) => rule.is_visible);
  const requiredRules = fieldRules.filter((rule) => rule.is_required);
  const requiredSteps = steps.filter((step) => step.required_for_operation);
  const primaryStepCodes = new Set(["LEAD_LIST", "LEAD_CREATE", "LEAD_IMPORT"]);
  const primarySteps = steps
    .filter((step) => primaryStepCodes.has(step.step_code))
    .slice(0, 3);
  const quickSteps = primarySteps.length > 0 ? primarySteps : steps.slice(0, 3);
  const remainingSteps = steps.filter(
    (step) => !quickSteps.some((quickStep) => quickStep.id === step.id),
  );

  return (
    <section className="space-y-5">
      {readiness ? <SegmentReadinessCard row={readiness} compact /> : null}

      {quickSteps.length > 0 ? (
        <section
          className="overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          data-heu-segment-quick-access="P0-05_WORKSPACE_QUICK_ACCESS"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-zinc-500">
                Truy cập nhanh
              </p>
              <h2 className="mt-1 text-base font-semibold text-zinc-950">
                Việc dùng nhiều nhất trong workspace
              </h2>
              <p className="mt-1 break-words text-sm leading-6 text-zinc-500">
                Lead, tạo mới và import giữ đúng phạm vi đối tượng đang chọn.
              </p>
            </div>
            <div className="grid min-w-0 gap-2 sm:grid-cols-3 xl:min-w-[620px]">
              {quickSteps.map((step) => {
                const Icon = stepIcon(step.step_code);

                return (
                  <Link
                    key={step.id}
                    href={step.action_href}
                    className="group flex min-h-20 min-w-0 items-center justify-between gap-3 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3 text-left transition hover:border-zinc-400 hover:bg-white"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white text-zinc-700 ring-1 ring-zinc-200">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-zinc-950">
                          {step.step_name}
                        </span>
                        <span className="mt-1 block truncate text-xs text-zinc-500">
                          {step.owner_department}
                        </span>
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-zinc-400 transition group-hover:text-zinc-900" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <SegmentOperatingFocusLayout sections={segmentOperatingSections}>
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Settings2 className="size-4 text-zinc-600" />
            <h2 className="text-base font-semibold">Hồ sơ vận hành</h2>
          </div>
          {workspace ? (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-md bg-zinc-50 p-3">
                <dt className="font-medium text-zinc-950">Mô hình</dt>
                <dd className="mt-1 text-zinc-600">
                  {operatingModelLabel(workspace.operating_model)}
                </dd>
              </div>
              <div className="rounded-md bg-zinc-50 p-3">
                <dt className="font-medium text-zinc-950">Luật lead</dt>
                <dd className="mt-1 text-zinc-600">
                  {workspace.lead_scope_rule}
                </dd>
              </div>
              <div className="rounded-md bg-zinc-50 p-3">
                <dt className="font-medium text-zinc-950">Đối tác/hợp đồng</dt>
                <dd className="mt-1 text-zinc-600">
                  {workspace.required_partner ? "Cần đối tác" : "Không bắt buộc"}{" "}
                  · {workspace.required_contract ? "Cần hợp đồng" : "Theo phát sinh"}
                </dd>
              </div>
              <div className="rounded-md bg-zinc-50 p-3">
                <dt className="font-medium text-zinc-950">AI</dt>
                <dd className="mt-1 text-zinc-600">
                  {workspace.ai_allowed ? "Có thể bật sau duyệt" : "Đang khóa"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Chưa có hồ sơ vận hành cho đối tượng này.
            </p>
          )}
        </article>

        <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-zinc-600" />
            <h2 className="text-base font-semibold">Chính sách AI</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            {workspace?.ai_policy ??
              "AI chưa được cấu hình cho đối tượng này."}
          </p>
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            AI không được tự duyệt, không tự chi COM, không xem dữ liệu ngoài
            phạm vi user và đối tượng tuyển sinh.
          </p>
        </article>
      </div>

      <section
        id="operation-steps"
        className="rounded-lg border border-zinc-200 bg-white shadow-sm"
        data-heu-segment-operation-steps="P0-05_SCOPE_STEPS"
      >
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-base font-semibold">Quy trình còn lại</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Những phần ít dùng hơn vẫn giữ đúng đối tượng tuyển sinh đang chọn.
          </p>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          {remainingSteps.length > 0 ? (
            remainingSteps.map((step) => (
              <article
                key={step.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-zinc-950">{step.step_name}</p>
                    <p className="mt-1 text-xs uppercase text-zinc-500">
                      {step.step_group} · {step.owner_department}
                    </p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      step.required_for_operation
                        ? "bg-rose-50 text-rose-700"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {step.required_for_operation ? "Bắt buộc" : "Tùy chọn"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {step.control_note}
                </p>
                <Link
                  href={step.action_href}
                  className="mt-4 inline-flex rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
                >
                  Mở phần này
                </Link>
              </article>
            ))
          ) : (
            <p className="text-sm text-zinc-500">
              Các thao tác chính đã nằm ở khu Truy cập nhanh.
            </p>
          )}
        </div>
        {requiredSteps.length === 0 ? (
          <div className="border-t border-zinc-200 p-5 text-sm text-amber-700">
            Chưa có bước bắt buộc nào cho đối tượng này.
          </div>
        ) : null}
      </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-4 text-zinc-600" />
            <h2 className="text-base font-semibold">
              Trường thông tin trên lead
            </h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Đây là lớp cấu hình hiển thị/required theo đối tượng. Phần form sẽ
            tiếp tục được ràng buộc sâu hơn ở bước sau.
          </p>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleRules.map((rule) => (
            <article
              key={rule.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-950">{rule.field_label}</p>
                  <p className="mt-1 font-mono text-xs text-zinc-500">
                    {rule.field_code}
                  </p>
                </div>
                <span
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    rule.is_required
                      ? "bg-rose-50 text-rose-700"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {rule.is_required ? "Bắt buộc" : "Tùy chọn"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {rule.help_text}
              </p>
            </article>
          ))}
        </div>
        {requiredRules.length === 0 ? (
          <div className="border-t border-zinc-200 p-5 text-sm text-amber-700">
            Chưa có field bắt buộc nào cho đối tượng này.
          </div>
        ) : null}
        </section>
      </SegmentOperatingFocusLayout>
    </section>
  );
}
