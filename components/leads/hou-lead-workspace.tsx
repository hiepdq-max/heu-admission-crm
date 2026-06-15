import {
  AlertCircle,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  MapPin,
  ReceiptText,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type HouLeadWorkspaceProps = {
  leadCode: string;
  studentName: string;
  houProgramName: string | null;
  houMajorName: string | null;
  houLocationName: string | null;
  houStageName: string | null;
  houAdmissionSystemStatus: string | null;
  houAdmissionSystemSyncedAt: string | null;
  houFirstTermTuitionConfirmed: boolean;
  houEnrollmentRecordedAt: string | null;
  evidenceCount: number;
  conditionRequiredCount: number;
  conditionReadyRequiredCount: number;
  missingRequiredConditionNames: string[];
  requiredDocumentCount: number;
  readyRequiredDocumentCount: number;
  missingRequiredDocumentNames: string[];
  claimCount: number;
  latestClaimStatus: string | null;
  latestClaimRiskLevel: string | null;
  claimNetTotalVnd: number | null;
  canSeeFinancial: boolean;
};

type StepRow = {
  label: string;
  value: string;
  done: boolean;
  target: string;
  note: string;
};

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ done }: { done: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
        done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {done ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <AlertCircle className="size-3.5" />
      )}
      {done ? "Đã đủ" : "Cần bổ sung"}
    </span>
  );
}

function StepTile({ step }: { step: StepRow }) {
  return (
    <a
      href={step.target}
      className="group rounded-md border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-950">{step.label}</p>
          <p className="mt-1 text-sm text-zinc-600">{step.value}</p>
        </div>
        <StatusBadge done={step.done} />
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">{step.note}</p>
    </a>
  );
}

export function HouLeadWorkspace({
  leadCode,
  studentName,
  houProgramName,
  houMajorName,
  houLocationName,
  houStageName,
  houAdmissionSystemStatus,
  houAdmissionSystemSyncedAt,
  houFirstTermTuitionConfirmed,
  houEnrollmentRecordedAt,
  evidenceCount,
  conditionRequiredCount,
  conditionReadyRequiredCount,
  missingRequiredConditionNames,
  requiredDocumentCount,
  readyRequiredDocumentCount,
  missingRequiredDocumentNames,
  claimCount,
  latestClaimStatus,
  latestClaimRiskLevel,
  claimNetTotalVnd,
  canSeeFinancial,
}: HouLeadWorkspaceProps) {
  const coreDone = Boolean(
    houProgramName && houMajorName && houLocationName && houStageName,
  );
  const houSystemDone = Boolean(
    houAdmissionSystemStatus || houAdmissionSystemSyncedAt,
  );
  const documentDone =
    requiredDocumentCount === 0 || readyRequiredDocumentCount >= requiredDocumentCount;
  const claimDone = claimCount > 0;
  const hasRisk =
    latestClaimRiskLevel === "HIGH" ||
    latestClaimRiskLevel === "LEFT" ||
    latestClaimStatus === "RISK_HOLD";
  const steps: StepRow[] = [
    {
      label: "Thông tin HOU",
      value: coreDone ? "Đã gắn đủ chương trình, ngành, địa điểm, bước" : "Thiếu dữ liệu HOU lõi",
      done: coreDone,
      target: "#hou-info",
      note: `${houProgramName ?? "Chưa chọn chương trình"} · ${
        houMajorName ?? "Chưa chọn ngành"
      } · ${houLocationName ?? "Chưa chọn địa điểm"}`,
    },
    {
      label: "Hệ thống HOU",
      value: houSystemDone ? houAdmissionSystemStatus ?? "Đã cập nhật" : "Chưa ghi nhận",
      done: houSystemDone,
      target: "#hou-info",
      note: `Lần cập nhật: ${formatDateTime(houAdmissionSystemSyncedAt)}`,
    },
    {
      label: "Học phí kỳ đầu",
      value: houFirstTermTuitionConfirmed ? "Đã xác nhận" : "Chưa xác nhận",
      done: houFirstTermTuitionConfirmed,
      target: "#hou-info",
      note: "Điều kiện quan trọng trước khi tạo đề nghị COM HOU.",
    },
    {
      label: "Điều kiện bắt buộc",
      value:
        conditionRequiredCount > 0
          ? `${conditionReadyRequiredCount}/${conditionRequiredCount} điều kiện`
          : "Chưa có checklist điều kiện",
      done:
        conditionRequiredCount === 0 ||
        conditionReadyRequiredCount >= conditionRequiredCount,
      target: "#conditions",
      note:
        missingRequiredConditionNames.length > 0
          ? `Còn thiếu: ${missingRequiredConditionNames.slice(0, 3).join(", ")}`
          : "Điều kiện nhập học/COM bắt buộc đã được tick đạt.",
    },
    {
      label: "Hồ sơ nhập học",
      value:
        requiredDocumentCount > 0
          ? `${readyRequiredDocumentCount}/${requiredDocumentCount} giấy tờ bắt buộc`
          : "Chưa có checklist bắt buộc",
      done: documentDone,
      target: "#documents",
      note:
        missingRequiredDocumentNames.length > 0
          ? `Còn thiếu: ${missingRequiredDocumentNames.slice(0, 3).join(", ")}`
          : "Các giấy tờ bắt buộc đã được nhận hoặc kiểm tra.",
    },
    {
      label: "Minh chứng HOU",
      value: evidenceCount > 0 ? `${evidenceCount} file/link` : "Chưa có minh chứng",
      done: evidenceCount > 0,
      target: "#hou-evidence",
      note: "Lưu link Drive, ảnh, quyết định, học phí hoặc minh chứng COM.",
    },
    {
      label: "COM HOU",
      value: canSeeFinancial
        ? claimDone
          ? `${claimCount} claim · ${latestClaimStatus ?? "chưa rõ trạng thái"}`
          : "Chưa có claim COM"
        : "Ẩn theo quyền",
      done: canSeeFinancial ? claimDone : true,
      target: "#hou-com",
      note:
        canSeeFinancial && claimNetTotalVnd !== null
          ? `Tổng net hiện có: ${formatCurrency(claimNetTotalVnd)}`
          : "Dữ liệu COM là thông tin tài chính nhạy cảm.",
    },
  ];
  const openIssues = steps.filter((step) => !step.done).length + (hasRisk ? 1 : 0);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">HOU workspace</h2>
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                  {leadCode}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                {studentName} · nhập nhanh dữ liệu HOU, hồ sơ, minh chứng và COM.
              </p>
            </div>
          </div>

          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              openIssues === 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {openIssues === 0
              ? "Không còn cảnh báo HOU chính."
              : `${openIssues} việc cần kiểm tra trước khi chốt HOU/COM.`}
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 xl:grid-cols-[1fr_260px]">
        <div className="grid gap-3 md:grid-cols-2">
          {steps.map((step) => (
            <StepTile key={step.label} step={step} />
          ))}
        </div>

        <aside className="space-y-3">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-semibold text-zinc-950">Thao tác nhanh</p>
            <div className="mt-3 grid gap-2">
              <Button asChild variant="outline" className="justify-start">
                <a href="#hou-info">
                  <GraduationCap className="size-4" />
                  Cập nhật HOU
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <a href="#documents">
                  <FileCheck2 className="size-4" />
                  Hồ sơ bắt buộc
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <a href="#conditions">
                  <CheckCircle2 className="size-4" />
                  Điều kiện bắt buộc
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <a href="#hou-evidence">
                  <ReceiptText className="size-4" />
                  Minh chứng HOU
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <a href="#hou-com">
                  <CircleDollarSign className="size-4" />
                  COM HOU
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <a href="#lead-status">
                  <AlertCircle className="size-4" />
                  Cập nhật trạng thái
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <a href="/hou">
                  <ExternalLink className="size-4" />
                  Kiểm soát HOU
                </a>
              </Button>
            </div>
          </div>

          <div
            className={`rounded-md border p-4 ${
              hasRisk
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-zinc-200 bg-zinc-50 text-zinc-600"
            }`}
          >
            <div className="flex items-start gap-2">
              {hasRisk ? (
                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              ) : (
                <MapPin className="mt-0.5 size-4 shrink-0" />
              )}
              <p className="text-sm leading-6">
                {hasRisk
                  ? "Claim COM đang có cảnh báo rủi ro. Cần rà soát trước khi duyệt hoặc chi."
                  : `Điểm học: ${houLocationName ?? "chưa chọn"}. Nhập học HOU: ${formatDateTime(
                      houEnrollmentRecordedAt,
                    )}.`}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
