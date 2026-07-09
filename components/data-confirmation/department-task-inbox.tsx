import Link from "next/link";
import {
  AlertTriangle,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Handshake,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  HEUWorkspaceActionGate,
  HEUWorkspaceScopeDecision,
} from "@/lib/heu-workspace-context";
import { withAdmissionSegmentParam } from "@/lib/workspace";

type DepartmentTaskInboxProps = {
  roleCode: string | null;
  scopeDecision: HEUWorkspaceScopeDecision;
  activeSegmentId: string | null;
  visibleSegmentCount: number;
  actionGate: HEUWorkspaceActionGate;
};

type DepartmentLane = {
  id: string;
  title: string;
  owner: string;
  href: string;
  icon: typeof ClipboardCheck;
  roleCodes: string[];
  requiredGate: keyof Pick<
    HEUWorkspaceActionGate,
    | "canWriteScopedDraft"
    | "canImportLeadDraft"
    | "canAcceptCthssvHandover"
    | "canReviewScopedDraft"
    | "canManageSystemScope"
  >;
  refs: string;
  nextAction: string;
  blockedAction: string;
};

const admissionRoles = ["TUYEN_SINH", "ADMISSION_HEAD", "TEAM_LEAD", "COUNSELOR"];
const cthssvRoles = ["CTHSSV", "CTHSSV_LEAD"];
const trainingRoles = ["DAO_TAO", "KHOA", "KHOA_BO_MON", "NGAN_HAN", "HR"];
const financeRoles = ["KHTC", "ACCOUNTING", "ACCOUNTING_LEAD"];
const controlRoles = ["BGH", "IT_DATA", "AUDIT", "PHAP_CHE", "ADMIN"];

const departmentLanes: DepartmentLane[] = [
  {
    id: "admission",
    title: "Tuyen sinh",
    owner: "Tuyen sinh + IT_DATA",
    href: "/leads",
    icon: Users,
    roleCodes: admissionRoles,
    requiredGate: "canWriteScopedDraft",
    refs: "lead_id, followup_ref, ho_so_ref",
    nextAction: "Xu ly lead, lich tu van va ho so dang cho xac nhan.",
    blockedAction: "Chi doc hoac chua co quyen thao tac lead trong workspace.",
  },
  {
    id: "cthssv",
    title: "CTHSSV",
    owner: "CTHSSV + Audit",
    href: "/cthssv",
    icon: ClipboardCheck,
    roleCodes: cthssvRoles,
    requiredGate: "canAcceptCthssvHandover",
    refs: "student_ref, handover_ref, status_ref",
    nextAction: "Xac nhan ho so hoc sinh va tinh trang tiep nhan.",
    blockedAction: "Chua co quyen nhan ban giao CTHSSV trong workspace.",
  },
  {
    id: "training",
    title: "Dao tao / Khoa",
    owner: "Dao tao + Khoa owner",
    href: "/khoa",
    icon: GraduationCap,
    roleCodes: trainingRoles,
    requiredGate: "canReviewScopedDraft",
    refs: "class_ref, program_ref, teacher_ref",
    nextAction: "Rao soat lop, nganh, lich va danh sach can xac nhan.",
    blockedAction: "Chi hien ref; chua mo workflow ghi cho Dao tao/Khoa.",
  },
  {
    id: "finance",
    title: "Ke toan read-only",
    owner: "KHTC + Audit",
    href: "/finance-desk",
    icon: WalletCards,
    roleCodes: financeRoles,
    requiredGate: "canReviewScopedDraft",
    refs: "receivable_ref, recon_ref, evidence_ref",
    nextAction: "Doi soat nhap cong no/hoc phi o che do doc va ref-only.",
    blockedAction: "Khong mo mutation tai chinh neu chua co module gate.",
  },
  {
    id: "hou",
    title: "HOU separated",
    owner: "HOU owner + KHTC + Audit",
    href: "/hou",
    icon: Handshake,
    roleCodes: [...controlRoles, ...financeRoles],
    requiredGate: "canReviewScopedDraft",
    refs: "hou_student_ref, hou_contract_ref, com_ref",
    nextAction: "Chi doi soat ref HOU; khong gop voi trung cap HEU.",
    blockedAction: "Chua tinh COM/HOU neu thieu hop dong va doi soat.",
  },
  {
    id: "control",
    title: "IT_DATA / Audit",
    owner: "IT_DATA + Audit",
    href: "/settings/scopes",
    icon: ShieldCheck,
    roleCodes: controlRoles,
    requiredGate: "canManageSystemScope",
    refs: "user_ref, role_ref, workspace_ref, audit_ref",
    nextAction: "Kiem scope, user pilot, negative access va audit evidence.",
    blockedAction: "Chua co quyen quan tri scope trong workspace.",
  },
];

function hasRole(roleCode: string | null, roleCodes: string[]) {
  return Boolean(roleCode && roleCodes.includes(roleCode));
}

function laneIsVisible(
  lane: DepartmentLane,
  roleCode: string | null,
  actionGate: HEUWorkspaceActionGate,
) {
  if (hasRole(roleCode, controlRoles)) {
    return lane.id === "control" || lane.id === "hou" || lane.id === "finance";
  }

  if (hasRole(roleCode, lane.roleCodes)) {
    return true;
  }

  if (lane.id === "control" && actionGate.canManageSystemScope) {
    return true;
  }

  return false;
}

function resolveStatus(
  lane: DepartmentLane,
  scopeDecision: HEUWorkspaceScopeDecision,
  actionGate: HEUWorkspaceActionGate,
) {
  if (scopeDecision === "NO_MATCHING_SCOPE" || !actionGate.canReadScopedData) {
    return {
      label: "NO_GO_SCOPE",
      className: "border-amber-200 bg-amber-50 text-amber-800",
      detail: "Can IT_DATA gan role/workspace/scope truoc khi hien viec that.",
    };
  }

  if (actionGate[lane.requiredGate]) {
    return {
      label: "DRAFT_READY",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      detail: lane.nextAction,
    };
  }

  return {
    label: "READ_ONLY",
    className: "border-zinc-200 bg-zinc-50 text-zinc-700",
    detail: lane.blockedAction,
  };
}

function fallbackLane(roleCode: string | null): DepartmentLane {
  return {
    id: "general",
    title: roleCode ? `Role ${roleCode}` : "Chua co role",
    owner: "IT_DATA",
    href: "/data-confirmation",
    icon: FileCheck2,
    roleCodes: [],
    requiredGate: "canReviewScopedDraft",
    refs: "workspace_ref, role_ref, task_ref",
    nextAction: "Cho IT_DATA gan lane nghiep vu va scope dung phong ban.",
    blockedAction: "Chua map role vao lane cong viec HEU.",
  };
}

export function DepartmentTaskInbox({
  roleCode,
  scopeDecision,
  activeSegmentId,
  visibleSegmentCount,
  actionGate,
}: DepartmentTaskInboxProps) {
  const visibleLanes = departmentLanes.filter((lane) =>
    laneIsVisible(lane, roleCode, actionGate),
  );
  const inboxLanes = visibleLanes.length > 0 ? visibleLanes : [fallbackLane(roleCode)];

  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white"
      data-heu-department-task-inbox="HEU_DEPARTMENT_TASK_INBOX_MVP"
      data-heu-department-task-inbox-scope="ROLE_WORKSPACE_SCOPE_FILTERED"
      data-heu-department-task-inbox-boundary="REF_ONLY_NO_RAW_PII_NO_MUTATION"
      data-heu-department-task-inbox-cost-guard="NO_AI_CALL_NO_AUTOMATION_STEP"
    >
      <div className="border-b border-zinc-200 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-zinc-500">
              HEU-Data-003 · Department Task Inbox MVP
            </p>
            <h2 className="mt-1 text-base font-semibold text-zinc-950">
              Viec cua toi theo phong ban
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
              Inbox nay chi hien lane cong viec dua tren role, workspace va
              action gate. No khong query bang task that, khong luu raw PII,
              khong goi AI va khong tao automation step.
            </p>
          </div>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
            <div>Role: {roleCode ?? "NO_ROLE"}</div>
            <div>Scope: {scopeDecision}</div>
            <div>Visible segments: {visibleSegmentCount}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-2">
        {inboxLanes.map((lane) => {
          const Icon = lane.icon;
          const status = resolveStatus(lane, scopeDecision, actionGate);
          const href = withAdmissionSegmentParam(lane.href, activeSegmentId);

          return (
            <article
              key={lane.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              data-heu-task-inbox-lane={lane.id}
              data-heu-task-inbox-status={status.label}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="rounded-md border border-zinc-200 bg-white p-2">
                    <Icon className="size-4 text-zinc-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-950">{lane.title}</h3>
                    <p className="mt-1 text-xs text-zinc-500">{lane.owner}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-1 text-xs font-medium ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase text-zinc-500">
                    Ref metadata
                  </dt>
                  <dd className="mt-1 text-zinc-700">{lane.refs}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-zinc-500">
                    Next safe action
                  </dt>
                  <dd className="mt-1 text-zinc-700">{status.detail}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={href}>Mo module</Link>
                </Button>
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                  <ClipboardCheck className="size-3.5" />
                  Ref-only
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="border-t border-zinc-200 bg-zinc-50 p-5">
        <div className="flex items-start gap-3 text-sm text-zinc-600">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p>
            Khong dung inbox nay de phe duyet, sua du lieu that, tinh cong no,
            tinh COM, chap nhan evidence hoac mo production. Day chi la MVP de
            user nhin thay cong viec dung lane truoc khi noi bang Task Center
            that.
          </p>
        </div>
      </div>
    </section>
  );
}
