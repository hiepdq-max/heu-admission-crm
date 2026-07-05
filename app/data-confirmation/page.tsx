import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileSearch,
  ListChecks,
  LockKeyhole,
  RefreshCcw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { firstParam } from "@/lib/workspace";

import {
  confirmDataConfirmationTaskAction,
  routeDataConfirmationTaskAction,
} from "./actions";

export const dynamic = "force-dynamic";

type DataConfirmationPageProps = {
  searchParams?: Promise<{
    department?: string | string[];
    error?: string | string[];
    routed?: string | string[];
    scope?: string | string[];
    status?: string | string[];
    updated?: string | string[];
  }>;
};

type TaskCenterStatus =
  | "CHO_XAC_NHAN"
  | "DUNG"
  | "CAN_SUA"
  | "KHONG_THUOC_TOI"
  | "DA_KHOA";

type DataConfirmationTaskRow = {
  id: string;
  task_code: string;
  department_code: string;
  owner_user_id: string | null;
  owner_user_name: string | null;
  assigned_user_id: string | null;
  assigned_user_name: string | null;
  segment_code: string | null;
  segment_name: string | null;
  source_record_label: string;
  source_route: string;
  data_domain: string;
  dq_check_ref: string | null;
  controlled_evidence_ref: string | null;
  due_date_or_batch: string | null;
  owner_decision_ref: string | null;
  scope_gate_ref: string | null;
  task_center_status: TaskCenterStatus;
  blocker_state: string;
  status_note: string | null;
  repair_note: string | null;
  confirmed_by_name: string | null;
  confirmed_at: string | null;
  locked_by_name: string | null;
  locked_at: string | null;
  audit_trace_ref: string;
  can_current_user_confirm: boolean;
  updated_at: string;
};

type DataConfirmationHistoryRow = {
  history_id: string;
  task_id: string;
  task_code: string;
  department_code: string;
  owner_user_id: string | null;
  assigned_user_id: string | null;
  source_record_label: string;
  due_date_or_batch: string | null;
  owner_decision_ref: string | null;
  scope_gate_ref: string | null;
  previous_status: TaskCenterStatus | null;
  next_status: TaskCenterStatus;
  actor_user_name: string | null;
  action_note: string | null;
  controlled_evidence_ref: string | null;
  audit_trace_ref: string;
  created_at: string;
};

type UserOptionRow = {
  id: string;
  full_name: string | null;
};

type SegmentOptionRow = {
  id: string;
  segment_code: string;
  segment_name: string;
};

type StatusFilter = TaskCenterStatus | "ALL";
type QueueScope = "VISIBLE" | "ASSIGNED_TO_ME" | "OWNED_BY_ME";

const statuses: {
  code: TaskCenterStatus;
  label: string;
  tone: string;
  icon: typeof Clock3;
}[] = [
  {
    code: "CHO_XAC_NHAN",
    label: "Cho xac nhan",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock3,
  },
  {
    code: "DUNG",
    label: "Dung",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  {
    code: "CAN_SUA",
    label: "Can sua",
    tone: "border-orange-200 bg-orange-50 text-orange-800",
    icon: AlertTriangle,
  },
  {
    code: "KHONG_THUOC_TOI",
    label: "Khong thuoc toi",
    tone: "border-sky-200 bg-sky-50 text-sky-800",
    icon: UserCheck,
  },
  {
    code: "DA_KHOA",
    label: "Da khoa",
    tone: "border-zinc-300 bg-zinc-100 text-zinc-700",
    icon: LockKeyhole,
  },
];

const allowedDepartments = [
  "KHTC",
  "TUYEN_SINH",
  "CTHSSV",
  "DAO_TAO",
  "KHOA",
  "SHORT_COURSE",
];

const DCTC_VIEW_UNAVAILABLE = "DCTC_VIEW_UNAVAILABLE";
const DCTC_TIMELINE_UNAVAILABLE = "DCTC_TIMELINE_UNAVAILABLE";
const DCTC_READ_PERMISSION_REQUIRED = "DCTC_READ_PERMISSION_REQUIRED";

const controlledPilotDepartments = [
  {
    code: "KHTC",
    label: "Ke toan / KHTC",
    taskCode: "DCTC-KHTC-001",
    domain: "Finance receivable and collection source",
    route: "/reports?department=KHTC",
    evidence: "Finance owner source ref, DQ check, controlled evidence ref",
  },
  {
    code: "TUYEN_SINH",
    label: "Tuyen sinh",
    taskCode: "DCTC-TUYEN-SINH-001",
    domain: "Lead, document, source and handover rows",
    route: "/reports?department=TUYEN_SINH",
    evidence: "Admissions source ref, document DQ result, blocker state",
  },
  {
    code: "CTHSSV",
    label: "CTHSSV",
    taskCode: "DCTC-CTHSSV-001",
    domain: "Student handover/readiness metadata",
    route: "/reports?department=CTHSSV",
    evidence: "CTHSSV evidence ref and handover reliance decision",
  },
  {
    code: "DAO_TAO",
    label: "Dao tao",
    taskCode: "DCTC-DAO-TAO-001",
    domain: "Class, cohort, program and timetable master",
    route: "/reports?department=DAO_TAO",
    evidence: "Dao Tao source reconciliation and signed confirmation",
  },
  {
    code: "KHOA",
    label: "Khoa / Giang vien",
    taskCode: "DCTC-KHOA-001",
    domain: "Teaching delivery, teacher assignment and evidence status",
    route: "/reports?department=KHOA",
    evidence: "Khoa source reconciliation and report-view signoff",
  },
  {
    code: "SHORT_COURSE",
    label: "Short Course",
    taskCode: "DCTC-SHORT-COURSE-001",
    domain: "Attendance, payment, allowance and source reconciliation rows",
    route: "/reports?department=SHORT_COURSE",
    evidence: "Short Course attendance/payment UAT evidence ref",
  },
];

const fieldClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500";
const textAreaClass =
  "min-h-20 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500";

function statusLabel(status: string) {
  return statuses.find((item) => item.code === status)?.label ?? status;
}

function statusTone(status: string) {
  return (
    statuses.find((item) => item.code === status)?.tone ??
    "border-zinc-200 bg-zinc-50 text-zinc-700"
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Chua co";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));
}

function filterHref(params: {
  department?: string;
  scope?: QueueScope;
  status?: StatusFilter;
}) {
  const url = new URL("/data-confirmation", "http://heu.local");

  if (params.scope && params.scope !== "VISIBLE") {
    url.searchParams.set("scope", params.scope.toLowerCase());
  }

  if (params.department) {
    url.searchParams.set("department", params.department);
  }

  if (params.status && params.status !== "ALL") {
    url.searchParams.set("status", params.status);
  }

  return `${url.pathname}${url.search}`;
}

function summarizeRows(rows: DataConfirmationTaskRow[]) {
  return statuses.map((status) => ({
    ...status,
    count: rows.filter((row) => row.task_center_status === status.code).length,
  }));
}

function countDepartmentRows(rows: DataConfirmationTaskRow[], department: string) {
  return rows.filter((row) => row.department_code === department).length;
}

function canSubmitStatus(row: DataConfirmationTaskRow) {
  return (
    row.task_center_status === "CHO_XAC_NHAN" &&
    Boolean(row.can_current_user_confirm)
  );
}

function ControlledPilotLanes({
  activeStatus,
  taskRows,
}: {
  activeStatus: StatusFilter;
  taskRows: DataConfirmationTaskRow[];
}) {
  return (
    <section
      className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
      data-heu-dctc-controlled-pilot-lanes="CONTROLLED_PILOT_LANE_READY"
      data-heu-dctc-controlled-pilot-department-lock="CONTROLLED_PILOT_DEPARTMENT_ONLY"
      data-heu-dctc-controlled-pilot-departments="KHTC TUYEN_SINH CTHSSV DAO_TAO KHOA SHORT_COURSE"
      data-heu-dctc-controlled-pilot-boundary="METADATA_ONLY NO_AUTO_SEED NO_RAW_DATA_IMPORT NO_REAL_TASK_CREATION NO_EMAIL_SEND NO_EVIDENCE_ACCEPTANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-zinc-500">
            CONTROLLED_PILOT_LANE_READY
          </p>
          <h2 className="mt-1 break-words text-base font-semibold text-zinc-950">
            Controlled department pilot lanes
          </h2>
          <p className="mt-1 break-words text-xs text-zinc-500">
            CONTROLLED_PILOT_DEPARTMENT_ONLY: route task chi cho 6 phong dung
            thu; IT/Data, Audit va BGH la lane kiem soat/GO ben ngoai.
          </p>
        </div>
        <span className="w-fit rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
          metadata only
        </span>
      </div>
      <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {controlledPilotDepartments.map((department) => (
          <Link
            className="min-w-0 rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-white"
            href={filterHref({
              department: department.code,
              status: activeStatus,
            })}
            key={department.code}
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-zinc-950">
                  {department.label}
                </p>
                <p className="mt-1 break-all text-xs font-semibold text-zinc-500">
                  {department.taskCode}
                </p>
              </div>
              <span className="shrink-0 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700">
                {countDepartmentRows(taskRows, department.code)}
              </span>
            </div>
            <p className="mt-3 break-words text-xs leading-5 text-zinc-600">
              {department.domain}
            </p>
            <p className="mt-2 break-all text-xs text-zinc-500">
              {department.route}
            </p>
            <p className="mt-2 break-words text-xs text-zinc-500">
              {department.evidence}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function StatusTimeline({
  activeScope,
  rows,
  timelineReady,
}: {
  activeScope: QueueScope;
  rows: DataConfirmationHistoryRow[];
  timelineReady: boolean;
}) {
  return (
    <section
      className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
      data-heu-dctc-status-history-timeline="STATUS_HISTORY_TIMELINE_READY"
      data-heu-dctc-status-history-scope="STATUS_HISTORY_SCOPE_PARITY"
      data-heu-dctc-audit-trace="DCTC_AUDIT_TRACE_READY"
      data-heu-dctc-status-history-boundary="RLS_TIMELINE_VIEW_ONLY NO_DIRECT_HISTORY_TABLE_UPDATE NO_RAW_ERROR_DISCLOSURE NO_EVIDENCE_ACCEPTANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-zinc-500">
            STATUS_HISTORY_TIMELINE_READY
          </p>
          <h2 className="mt-1 break-words text-base font-semibold text-zinc-950">
            Status history timeline
          </h2>
          <p className="mt-1 break-words text-sm text-zinc-600">
            Read-only RLS timeline from
            heu_data_confirmation_task_status_timeline.
            Scope={activeScope}.
          </p>
        </div>
        <span className="w-fit rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
          DCTC_AUDIT_TRACE_READY
        </span>
      </div>

      {!timelineReady ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Timeline view is pending. Control code: {DCTC_TIMELINE_UNAVAILABLE}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
          No visible status-history rows for this filter.
        </div>
      ) : (
        <div className="mt-4 grid min-w-0 gap-3">
          {rows.map((row) => (
            <article
              className="min-w-0 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              data-heu-dctc-history-row={row.history_id}
              key={row.history_id}
            >
              <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="break-all text-sm font-semibold text-zinc-950">
                      {row.task_code}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusTone(
                        row.next_status,
                      )}`}
                    >
                      {statusLabel(row.previous_status ?? "NEW")} {"->"}{" "}
                      {statusLabel(row.next_status)}
                    </span>
                  </div>
                  <p className="mt-2 break-words text-sm text-zinc-600">
                    {row.department_code} / {row.source_record_label}
                  </p>
                  <p className="mt-1 break-words text-xs text-zinc-500">
                    Actor: {row.actor_user_name ?? "system or pending user"} at{" "}
                    {formatDate(row.created_at)}
                  </p>
                  <p className="mt-1 break-all text-xs text-zinc-500">
                    Audit trace: {row.audit_trace_ref}
                  </p>
                </div>
                <div className="min-w-0 text-xs text-zinc-600 lg:max-w-md">
                  <p className="break-words">
                    Due/batch: {row.due_date_or_batch ?? "pending"}
                  </p>
                  <p className="mt-1 break-words">
                    Owner decision: {row.owner_decision_ref ?? "pending"}
                  </p>
                  <p className="mt-1 break-words">
                    Scope gate: {row.scope_gate_ref ?? "pending"}
                  </p>
                  <p className="mt-1 break-words">
                    Evidence ref: {row.controlled_evidence_ref ?? "pending"}
                  </p>
                </div>
              </div>
              {row.action_note ? (
                <p className="mt-3 break-words rounded-md bg-white p-2 text-xs text-zinc-700">
                  {row.action_note}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ReadPermissionGate() {
  return (
    <section
      className="min-w-0 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900"
      data-heu-dctc-read-permission-gate="DCTC_READ_PERMISSION_REQUIRED"
      data-heu-dctc-read-permission-boundary="NO_QUEUE_QUERY_WITHOUT_DATA_CONFIRMATION_READ NO_TIMELINE_QUERY_WITHOUT_DATA_CONFIRMATION_READ NO_RAW_ERROR_DISCLOSURE NO_EVIDENCE_ACCEPTANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
    >
      <div className="flex min-w-0 items-start gap-3">
        <LockKeyhole className="mt-0.5 size-5 shrink-0" />
        <div className="min-w-0">
          <h2 className="break-words text-base font-semibold">
            Data confirmation read access required
          </h2>
          <p className="mt-2 break-words text-sm leading-6">
            User must have `data_confirmation.read` before this route queries
            the confirmation queue or status timeline. Keep the task center
            locked until owner-approved role/scope setup is complete.
          </p>
          <p className="mt-2 break-words text-xs text-amber-800">
            Control code: {DCTC_READ_PERMISSION_REQUIRED}
          </p>
        </div>
      </div>
    </section>
  );
}

function RoutingForm({
  canRoute,
  segmentOptions,
  userOptions,
}: {
  canRoute: boolean;
  segmentOptions: SegmentOptionRow[];
  userOptions: UserOptionRow[];
}) {
  if (!canRoute) {
    return (
      <section
        className="min-w-0 rounded-lg border border-zinc-200 bg-zinc-50 p-5"
        data-heu-dctc-route-form="RPC_ROUTE_LOCKED"
      >
        <div className="flex min-w-0 items-start gap-3">
          <LockKeyhole className="mt-0.5 size-5 shrink-0 text-zinc-500" />
          <div className="min-w-0">
            <h2 className="break-words text-base font-semibold text-zinc-950">
              Route task is locked
            </h2>
            <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
              User hien tai chi co the xem hoac xac nhan task duoc RLS cho phep.
              Viec dua source data vao `CHO_XAC_NHAN` can quyen
              data_confirmation.route hoac control lane tuong duong.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="min-w-0 overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-sm"
      data-heu-dctc-route-form="RPC_ROUTE_TO_CHO_XAC_NHAN"
      data-heu-dctc-route-assignee-lock="OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN"
      data-heu-dctc-owner-assignee-pair-lock="DCTC_OWNER_ASSIGNEE_PAIR_LOCK_READY OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN"
      data-heu-dctc-scope-gate-lock="DCTC_SCOPE_GATE_REQUIRED_BEFORE_CHO_XAC_NHAN SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN NO_ACCESS_GRANT_FROM_SCOPE_GATE_REF"
      data-heu-dctc-source-provenance-lock="DCTC_SOURCE_PROVENANCE_LOCK_READY SOURCE_METADATA_REQUIRED_BEFORE_CHO_XAC_NHAN NO_RAW_SOURCE_PAYLOAD"
    >
      <div className="border-b border-emerald-100 bg-emerald-50 p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
            <UserCheck className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-emerald-700">
              RPC_ROUTE_TO_CHO_XAC_NHAN
            </p>
            <h2 className="mt-1 break-words text-base font-semibold text-zinc-950">
              Route source data into waiting confirmation
            </h2>
            <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-zinc-600">
              Tao task `CHO_XAC_NHAN` tu metadata da duoc phe duyet. Form nay
              khong import raw data, khong upload evidence va khong chap nhan
              UAT hay owner GO. Owner user va Assigned user la bat buoc truoc
              khi route; scope gate ref la bat buoc nhung khong cap quyen.
            </p>
          </div>
        </div>
      </div>

      <form
        action={routeDataConfirmationTaskAction}
        className="grid min-w-0 gap-4 p-5 lg:grid-cols-2 xl:grid-cols-3"
      >
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Task code
          </span>
          <input
            className={fieldClass}
            maxLength={80}
            name="task_code"
            placeholder="VD: DCTC-KHTC-20260705-001"
            required
            type="text"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Department
          </span>
          <select className={fieldClass} name="department_code" required>
            <option value="" disabled>
              Chon phong
            </option>
            {allowedDepartments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Data domain
          </span>
          <input
            className={fieldClass}
            maxLength={120}
            name="data_domain"
            placeholder="VD: RV_ADMISSIONS_DOCUMENT_REVIEW_QUEUE"
            required
            type="text"
          />
        </label>
        <label className="min-w-0 xl:col-span-2">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Source record label
          </span>
          <input
            className={fieldClass}
            maxLength={180}
            name="source_record_label"
            placeholder="Mo ta dong/nguon can xac nhan"
            required
            type="text"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Source route
          </span>
          <input
            className={fieldClass}
            maxLength={160}
            name="source_route"
            placeholder="/reports#..."
            required
            type="text"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            DQ check ref
          </span>
          <input
            className={fieldClass}
            maxLength={120}
            name="dq_check_ref"
            placeholder="VD: DQ-RV-05A"
            required
            type="text"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Controlled evidence ref
          </span>
          <input
            className={fieldClass}
            maxLength={160}
            name="controlled_evidence_ref"
            placeholder="VD: RV-EVID-05A"
            required
            type="text"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Due date / batch
          </span>
          <input
            className={fieldClass}
            maxLength={120}
            name="due_date_or_batch"
            placeholder="VD: 2026-07 batch 01"
            required
            type="text"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Owner decision ref
          </span>
          <input
            className={fieldClass}
            maxLength={160}
            name="owner_decision_ref"
            placeholder="VD: OWNER-DECISION-PENDING"
            required
            type="text"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Scope gate ref
          </span>
          <input
            className={fieldClass}
            maxLength={160}
            name="scope_gate_ref"
            placeholder="VD: SCOPE-GATE-P6-04-PENDING"
            required
            type="text"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Segment
          </span>
          <select className={fieldClass} name="admission_segment_id">
            <option value="">Khong gan segment</option>
            {segmentOptions.map((segment) => (
              <option key={segment.id} value={segment.id}>
                {segment.segment_code} - {segment.segment_name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Owner user
          </span>
          <select className={fieldClass} name="owner_user_id">
            <option value="">Owner lane pending</option>
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name ?? user.id}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Assigned user
          </span>
          <select className={fieldClass} name="assigned_user_id">
            <option value="">User pending</option>
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name ?? user.id}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0 lg:col-span-2 xl:col-span-3">
          <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
            Route note
          </span>
          <textarea
            className={textAreaClass}
            maxLength={800}
            name="status_note"
            placeholder="Ly do route task vao trang thai cho xac nhan"
          />
        </label>
        <div className="flex min-w-0 flex-col gap-2 lg:col-span-2 xl:col-span-3">
          <Button className="w-full sm:w-fit" type="submit">
            <UserCheck className="size-4" />
            Route to Cho xac nhan
          </Button>
          <p className="break-words text-xs text-zinc-500">
            Boundary: `route_data_confirmation_task` chi tao task
            `CHO_XAC_NHAN` tu metadata da duoc phe duyet; khong tao raw data,
            khong gui email va khong chap nhan evidence/UAT/production.
            `OWNER_AND_ASSIGNEE_REQUIRED_BEFORE_CHO_XAC_NHAN` yeu cau ca
            owner lane va assigned user truoc khi route.
            `SCOPE_GATE_REF_REQUIRED_BEFORE_CHO_XAC_NHAN` chi ghi ref scope
            gate, khong cap quyen.
          </p>
        </div>
      </form>
    </section>
  );
}

function ConfirmationForm({ task }: { task: DataConfirmationTaskRow }) {
  const disabled = !canSubmitStatus(task);

  return (
    <form
      action={confirmDataConfirmationTaskAction}
      className="grid min-w-0 gap-3 border-t border-zinc-200 bg-zinc-50 p-4 lg:grid-cols-[180px_minmax(220px,1fr)_minmax(220px,1fr)_auto]"
      data-heu-dctc-confirm-form="RPC_CONFIRM_ONLY REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED DA_KHOA_LOCK_REQUIRES_NOTE_AND_EVIDENCE_REF"
      data-heu-dctc-confirm-submitter-scope="CONFIRM_SUBMITTER_SCOPE_LOCK"
      data-heu-dctc-confirm-scope-bound="DCTC_SCOPE_BOUND_CONFIRMER_LOCK_READY NO_GLOBAL_CONFIRM_PERMISSION_BYPASS"
      data-heu-dctc-confirm-transition="CONFIRM_FROM_CHO_XAC_NHAN_ONLY"
    >
      <input name="task_id" type="hidden" value={task.id} />
      <label className="min-w-0">
        <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
          Ket qua
        </span>
        <select
          className={fieldClass}
          defaultValue=""
          disabled={disabled}
          name="next_status"
          required
        >
          <option value="" disabled>
            Chon trang thai
          </option>
          <option value="DUNG">Dung</option>
          <option value="CAN_SUA">Can sua</option>
          <option value="KHONG_THUOC_TOI">Khong thuoc toi</option>
          <option value="DA_KHOA">Da khoa</option>
        </select>
      </label>
      <label className="min-w-0">
        <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
          Ghi chu xac nhan
        </span>
        <textarea
          className={textAreaClass}
          disabled={disabled}
          maxLength={800}
          name="note"
          placeholder="Required for Can sua, Khong thuoc toi or Da khoa"
        />
      </label>
      <label className="min-w-0">
        <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">
          Controlled evidence ref
        </span>
        <input
          className={fieldClass}
          disabled={disabled}
          maxLength={160}
          name="controlled_evidence_ref"
          placeholder="Required when locking to DA_KHOA"
          type="text"
        />
      </label>
      <div className="flex items-end">
        <Button className="w-full lg:w-auto" disabled={disabled} type="submit">
          <ShieldCheck className="size-4" />
          Xac nhan
        </Button>
      </div>
      {disabled ? (
        <p className="break-words text-xs text-zinc-500 lg:col-span-4">
          CONFIRM_SUBMITTER_SCOPE_LOCK: chi assigned user, owner user, phong
          phu trach/workspace co quyen data_confirmation.confirm moi submit
          duoc task `CHO_XAC_NHAN`; route/manage hoac global confirm khong
          bypass task lane. REPAIR_OR_OUT_OF_SCOPE_NOTE_REQUIRED:
          Can sua/Khong thuoc toi phai co ghi chu. CONFIRM_FROM_CHO_XAC_NHAN_ONLY:
          task da co ket qua thi khong submit lai trong DCTC.
        </p>
      ) : null}
    </form>
  );
}

function TaskRow({ task }: { task: DataConfirmationTaskRow }) {
  return (
    <article
      className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
      data-heu-dctc-task-row={task.task_code}
    >
      <div className="grid min-w-0 gap-4 p-4 xl:grid-cols-[minmax(220px,1.1fr)_minmax(280px,1.7fr)_minmax(220px,1fr)]">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="break-all text-sm font-semibold text-zinc-950">
              {task.task_code}
            </span>
            <span
              className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusTone(
                task.task_center_status,
              )}`}
            >
              {statusLabel(task.task_center_status)}
            </span>
          </div>
          <p className="mt-2 break-words text-sm text-zinc-600">
            {task.department_code}
            {task.segment_code ? ` / ${task.segment_code}` : ""}
          </p>
          <p className="mt-1 break-words text-xs text-zinc-500">
            Updated {formatDate(task.updated_at)}
          </p>
        </div>

        <div className="min-w-0">
          <h2 className="break-words text-base font-semibold text-zinc-950">
            {task.source_record_label}
          </h2>
          <p className="mt-1 break-words text-sm text-zinc-600">
            Domain: {task.data_domain}
          </p>
          <p className="mt-1 break-words text-xs text-zinc-500">
            Source route: {task.source_route}
          </p>
          <div className="mt-3 flex min-w-0 flex-wrap gap-2 text-xs">
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-700">
              DQ: {task.dq_check_ref ?? "pending"}
            </span>
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-700">
              Evidence: {task.controlled_evidence_ref ?? "pending"}
            </span>
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-700">
              Due/batch: {task.due_date_or_batch ?? "pending"}
            </span>
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-700">
              Owner decision: {task.owner_decision_ref ?? "pending"}
            </span>
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-700">
              Scope gate: {task.scope_gate_ref ?? "pending"}
            </span>
            <span className="break-all rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-700">
              Audit trace: {task.audit_trace_ref}
            </span>
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-700">
              Blocker: {task.blocker_state}
            </span>
          </div>
        </div>

        <div className="min-w-0 text-sm text-zinc-600">
          <p className="break-words">
            Owner: {task.owner_user_name ?? "owner lane pending"}
          </p>
          <p className="mt-1 break-words">
            Assigned: {task.assigned_user_name ?? "user pending"}
          </p>
          <p className="mt-1 break-words">
            Confirmed: {task.confirmed_by_name ?? "not yet"}{" "}
            {task.confirmed_at ? `at ${formatDate(task.confirmed_at)}` : ""}
          </p>
          {task.status_note ? (
            <p className="mt-3 break-words rounded-md bg-zinc-50 p-2 text-xs text-zinc-700">
              {task.status_note}
            </p>
          ) : null}
        </div>
      </div>
      <ConfirmationForm task={task} />
    </article>
  );
}

export default async function DataConfirmationPage({
  searchParams,
}: DataConfirmationPageProps) {
  const params = await searchParams;
  const statusParam = firstParam(params?.status)?.toUpperCase() ?? "ALL";
  const departmentParam = firstParam(params?.department)?.toUpperCase();
  const scopeParam = firstParam(params?.scope)?.toUpperCase() ?? "VISIBLE";
  const errorMessage = firstParam(params?.error);
  const routedMessage = firstParam(params?.routed);
  const updatedMessage = firstParam(params?.updated);
  const activeStatus: StatusFilter = statuses.some(
    (status) => status.code === statusParam,
  )
    ? (statusParam as TaskCenterStatus)
    : "ALL";
  const activeDepartment = allowedDepartments.includes(departmentParam ?? "")
    ? departmentParam
    : undefined;
  const activeScope: QueueScope =
    scopeParam === "ASSIGNED_TO_ME" || scopeParam === "OWNED_BY_ME"
      ? scopeParam
      : "VISIBLE";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [roleResult, readPermissionResult, routePermissionResult] =
    await Promise.all([
      supabase.rpc("current_user_role_code"),
      supabase.rpc("has_permission", { permission_name: "data_confirmation.read" }),
      supabase.rpc("can_route_data_confirmation_task"),
    ]);
  const canReadTasks = Boolean(readPermissionResult.data);
  const canRouteTasks = canReadTasks && Boolean(routePermissionResult.data);
  let userOptions: UserOptionRow[] = [];
  let segmentOptions: SegmentOptionRow[] = [];

  if (canRouteTasks) {
    const [userOptionsResult, segmentOptionsResult] = await Promise.all([
      supabase
        .from("users_profile")
        .select("id,full_name")
        .eq("status", "ACTIVE")
        .order("full_name", { ascending: true })
        .limit(200)
        .returns<UserOptionRow[]>(),
      supabase
        .from("admission_segments")
        .select("id,segment_code,segment_name")
        .eq("status", "ACTIVE")
        .order("segment_code", { ascending: true })
        .returns<SegmentOptionRow[]>(),
    ]);
    userOptions = userOptionsResult.data ?? [];
    segmentOptions = segmentOptionsResult.data ?? [];
  }

  let taskRows: DataConfirmationTaskRow[] = [];
  let historyRows: DataConfirmationHistoryRow[] = [];
  let schemaReady = canReadTasks;
  let timelineReady = canReadTasks;

  if (canReadTasks) {
    let query = supabase
      .from("heu_data_confirmation_task_center")
      .select(
        [
          "id",
          "task_code",
          "department_code",
          "owner_user_id",
          "owner_user_name",
          "assigned_user_id",
          "assigned_user_name",
          "segment_code",
          "segment_name",
          "source_record_label",
          "source_route",
          "data_domain",
          "dq_check_ref",
          "controlled_evidence_ref",
          "due_date_or_batch",
          "owner_decision_ref",
          "scope_gate_ref",
          "task_center_status",
          "blocker_state",
          "status_note",
          "repair_note",
          "confirmed_by_name",
          "confirmed_at",
          "locked_by_name",
          "locked_at",
          "audit_trace_ref",
          "can_current_user_confirm",
          "updated_at",
        ].join(","),
      );

    if (activeStatus !== "ALL") {
      query = query.eq("task_center_status", activeStatus);
    }

    if (activeDepartment) {
      query = query.eq("department_code", activeDepartment);
    }

    if (activeScope === "ASSIGNED_TO_ME") {
      query = query.eq("assigned_user_id", user.id);
    }

    if (activeScope === "OWNED_BY_ME") {
      query = query.eq("owner_user_id", user.id);
    }

    const { data: rows, error } = await query
      .order("updated_at", { ascending: false })
      .limit(80)
      .returns<DataConfirmationTaskRow[]>();
    let timelineQuery = supabase
      .from("heu_data_confirmation_task_status_timeline")
      .select(
        [
          "history_id",
          "task_id",
          "task_code",
          "department_code",
          "owner_user_id",
          "assigned_user_id",
          "source_record_label",
          "due_date_or_batch",
          "owner_decision_ref",
          "scope_gate_ref",
          "previous_status",
          "next_status",
          "actor_user_name",
          "action_note",
          "controlled_evidence_ref",
          "audit_trace_ref",
          "created_at",
        ].join(","),
      );

    if (activeStatus !== "ALL") {
      timelineQuery = timelineQuery.eq("next_status", activeStatus);
    }

    if (activeDepartment) {
      timelineQuery = timelineQuery.eq("department_code", activeDepartment);
    }

    if (activeScope === "ASSIGNED_TO_ME") {
      timelineQuery = timelineQuery.eq("assigned_user_id", user.id);
    }

    if (activeScope === "OWNED_BY_ME") {
      timelineQuery = timelineQuery.eq("owner_user_id", user.id);
    }

    const { data: timelineRows, error: timelineError } = await timelineQuery
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<DataConfirmationHistoryRow[]>();
    taskRows = rows ?? [];
    historyRows = timelineRows ?? [];
    schemaReady = !error;
    timelineReady = !timelineError;
  }

  const summary = summarizeRows(taskRows);

  return (
    <AppShell
      active="data-confirmation"
      title="Data Confirmation Task Center"
      description="PASS_LOCAL route for department data confirmation tasks; production remains NO-GO."
    >
      <div
        className="space-y-6"
        data-heu-data-confirmation-task-center-route="DCTC_RUNTIME_ROUTE"
        data-heu-data-confirmation-task-center-boundary="PASS_LOCAL_RUNTIME_ROUTE RLS_VIEW_ONLY RPC_ROUTE_TO_CHO_XAC_NHAN RPC_CONFIRM_ONLY DCTC_SOURCE_PROVENANCE_LOCK_READY DCTC_DEPARTMENT_QUEUE_SCOPE_READY DCTC_AUDIT_TRACE_READY DCTC_SCOPE_BOUND_CONFIRMER_LOCK_READY NO_GLOBAL_CONFIRM_PERMISSION_BYPASS NO_AUTO_SEED NO_RAW_DATA_IMPORT NO_DIRECT_TABLE_UPDATE NO_EMAIL_SEND NO_ACCOUNT_CREATE NO_TICKET_CREATE NO_AUDIT_LOG_MUTATION NO_EVIDENCE_ACCEPTANCE NO_UAT_ACCEPTANCE NO_OWNER_GO NO_PRODUCTION_GO"
      >
        <section className="min-w-0 border-b border-zinc-200 pb-5">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-zinc-500">
                DCTC_RUNTIME_ROUTE
              </p>
              <h1 className="mt-1 break-words text-2xl font-semibold tracking-normal text-zinc-950">
                Data Confirmation Task Center
              </h1>
              <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
                User phong ban chi thay task qua RLS view
                heu_data_confirmation_task_center. IT/Data route metadata vao
                `CHO_XAC_NHAN` qua RPC route_data_confirmation_task; user xac
                nhan qua RPC confirm_data_confirmation_task. Khong import raw
                data, email, account, ticket, UAT/evidence acceptance, owner GO
                hay production GO.
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/reports">
                  <FileSearch className="size-4" />
                  Reports map
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/data-confirmation">
                  <RefreshCcw className="size-4" />
                  Refresh
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {updatedMessage ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            DCTC task status updated through controlled RPC.
          </div>
        ) : null}

        {routedMessage ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            DCTC task routed to CHO_XAC_NHAN through controlled RPC.
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {errorMessage}
          </div>
        ) : null}

        {!canReadTasks ? (
          <ReadPermissionGate />
        ) : (
          <>
            <RoutingForm
              canRoute={canRouteTasks}
              segmentOptions={segmentOptions}
              userOptions={userOptions}
            />

            <ControlledPilotLanes
              activeStatus={activeStatus}
              taskRows={taskRows}
            />

            <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {summary.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    className={`min-w-0 rounded-lg border p-4 transition hover:shadow-sm ${item.tone}`}
                    href={filterHref({
                      department: activeDepartment,
                      scope: activeScope,
                      status: item.code,
                    })}
                    key={item.code}
                  >
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <span className="break-words text-sm font-semibold">
                        {item.label}
                      </span>
                      <Icon className="size-4 shrink-0" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-normal">
                      {item.count}
                    </p>
                  </Link>
                );
              })}
            </section>

            <section
              className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
              data-heu-dctc-department-queue-boundary="DEPARTMENT_QUERY_PARAM_FILTERS_QUEUE_AND_TIMELINE NO_ACCESS_GRANT_FROM_FILTER"
              data-heu-dctc-department-queue-scope="DCTC_DEPARTMENT_QUEUE_SCOPE_READY"
            >
              <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
                    <ListChecks className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-semibold text-zinc-950">
                      Controlled confirmation queue
                    </h2>
                    <p className="mt-1 break-words text-sm text-zinc-600">
                      role={String(roleResult.data ?? "UNKNOWN")}; queue_scope=
                      {activeScope}; department_scope={activeDepartment ?? "ALL"};
                      read_permission={String(canReadTasks)};
                      route_permission={String(canRouteTasks)}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 flex-wrap gap-2">
                  <Button
                    asChild
                    variant={activeScope === "VISIBLE" ? "default" : "outline"}
                    size="sm"
                  >
                    <Link
                      href={filterHref({
                        department: activeDepartment,
                        scope: "VISIBLE",
                        status: activeStatus,
                      })}
                    >
                      Visible
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={
                      activeScope === "ASSIGNED_TO_ME" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    <Link
                      href={filterHref({
                        department: activeDepartment,
                        scope: "ASSIGNED_TO_ME",
                        status: activeStatus,
                      })}
                    >
                      Assigned to me
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={activeScope === "OWNED_BY_ME" ? "default" : "outline"}
                    size="sm"
                  >
                    <Link
                      href={filterHref({
                        department: activeDepartment,
                        scope: "OWNED_BY_ME",
                        status: activeStatus,
                      })}
                    >
                      Owner lane
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={activeStatus === "ALL" ? "default" : "outline"}
                    size="sm"
                  >
                    <Link
                      href={filterHref({
                        department: activeDepartment,
                        scope: activeScope,
                        status: "ALL",
                      })}
                    >
                      All
                    </Link>
                  </Button>
                  {allowedDepartments.map((department) => (
                    <Button
                      asChild
                      key={department}
                      size="sm"
                      variant={activeDepartment === department ? "default" : "outline"}
                    >
                      <Link
                        href={filterHref({
                          department,
                          scope: activeScope,
                          status: activeStatus,
                        })}
                      >
                        {department}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </section>

            <StatusTimeline
              activeScope={activeScope}
              rows={historyRows}
              timelineReady={timelineReady}
            />

            {!schemaReady ? (
              <section className="min-w-0 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
                <div className="flex min-w-0 items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-semibold">
                      Schema or access gate is not ready
                    </h2>
                    <p className="mt-2 break-words text-sm leading-6">
                      The route is wired, but the live database did not return
                      heu_data_confirmation_task_center. Keep production NO-GO until
                      backup/restore proof, signed migration order, signed UAT,
                      controlled evidence refs and owner GO/NO-GO are completed
                      outside Git/Codex/chat.
                    </p>
                    <p className="mt-2 break-words text-xs text-amber-800">
                      Control code: {DCTC_VIEW_UNAVAILABLE}
                    </p>
                  </div>
                </div>
              </section>
            ) : taskRows.length === 0 ? (
              <section className="min-w-0 rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
                <ShieldCheck className="mx-auto size-8 text-zinc-500" />
                <h2 className="mt-3 break-words text-base font-semibold text-zinc-950">
                  No visible confirmation tasks
                </h2>
                <p className="mx-auto mt-2 max-w-2xl break-words text-sm leading-6 text-zinc-600">
                  RLS returned an empty queue for this user/filter. The app does not
                  seed real tasks from the route; IT/Data must route approved task
                  rows only after the signed migration and controlled evidence gates.
                </p>
              </section>
            ) : (
              <section className="grid min-w-0 gap-4">
                {taskRows.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
